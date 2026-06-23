<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class MidtransPaymentService
{
    public function createSnapTransaction(Order $order): Order
    {
        $order->loadMissing(['items', 'user']);

        $midtransOrderId = $order->midtrans_order_id ?: $this->makeMidtransOrderId($order);

        if ($this->isMockEnabled()) {
            return $this->createMockTransaction($order, $midtransOrderId);
        }

        $serverKey = $this->serverKey();
        $this->guardEnvironmentKeyMatch($serverKey);

        $payload = [
            'transaction_details' => [
                'order_id' => $midtransOrderId,
                'gross_amount' => (int) $order->total,
            ],
            'customer_details' => [
                'first_name' => $order->first_name,
                'last_name' => $order->last_name,
                'email' => $order->user?->email,
                'shipping_address' => [
                    'first_name' => $order->first_name,
                    'last_name' => $order->last_name,
                    'address' => $order->address,
                    'city' => $order->city,
                    'postal_code' => $order->postal_code,
                    'country_code' => 'IDN',
                ],
            ],
            'item_details' => $this->itemDetails($order),
        ];

        if (filled(config('services.midtrans.finish_url'))) {
            $payload['callbacks'] = [
                'finish' => config('services.midtrans.finish_url'),
            ];
        }

        $response = Http::withBasicAuth($serverKey, '')
            ->withOptions($this->httpOptions())
            ->acceptJson()
            ->post($this->snapEndpoint(), $payload);

        if ($response->failed()) {
            $message = collect($response->json('error_messages') ?? [])
                ->filter()
                ->first();

            throw ValidationException::withMessages([
                'payment_method' => [
                    $message
                        ? "Gagal membuat transaksi Midtrans: {$message}"
                        : 'Gagal membuat transaksi Midtrans. Cek konfigurasi server key.',
                ],
            ]);
        }

        $payload = $response->json();

        if (blank($payload['token'] ?? null) || blank($payload['redirect_url'] ?? null)) {
            throw ValidationException::withMessages([
                'payment_method' => ['Transaksi Midtrans dibuat tanpa URL pembayaran. Cek konfigurasi Snap Midtrans.'],
            ]);
        }

        $order->forceFill([
            'midtrans_order_id' => $midtransOrderId,
            'midtrans_snap_token' => $payload['token'],
            'midtrans_redirect_url' => $payload['redirect_url'],
        ])->save();

        return $order->fresh()->load('items');
    }

    public function handleNotification(array $payload): ?Order
    {
        if (!$this->isValidSignature($payload)) {
            Log::warning('Midtrans notification rejected: invalid signature.', [
                'order_id' => $payload['order_id'] ?? null,
                'transaction_status' => $payload['transaction_status'] ?? null,
                'status_code' => $payload['status_code'] ?? null,
            ]);

            throw ValidationException::withMessages([
                'signature_key' => ['Signature Midtrans tidak valid.'],
            ]);
        }

        $order = Order::where('midtrans_order_id', $payload['order_id'] ?? null)
            ->with('items')
            ->first();

        if (!$order) {
            Log::warning('Midtrans notification ignored: order not found.', [
                'order_id' => $payload['order_id'] ?? null,
                'transaction_status' => $payload['transaction_status'] ?? null,
            ]);

            return null;
        }

        return $this->applyStatusPayload($order, $payload);
    }

    public function syncTransactionStatus(Order $order): Order
    {
        if (blank($order->midtrans_order_id)) {
            throw ValidationException::withMessages([
                'order' => ['Order belum memiliki transaksi Midtrans.'],
            ]);
        }

        try {
            $response = Http::withBasicAuth($this->serverKey(), '')
                ->withOptions($this->httpOptions())
                ->acceptJson()
                ->get($this->transactionStatusEndpoint($order->midtrans_order_id));
        } catch (ConnectionException) {
            throw ValidationException::withMessages([
                'midtrans' => ['Tidak bisa terhubung ke Midtrans untuk sinkron status.'],
            ]);
        }

        if ($response->failed()) {
            $message = collect($response->json('error_messages') ?? [])
                ->filter()
                ->first();

            throw ValidationException::withMessages([
                'midtrans' => [
                    $message
                        ? "Gagal sinkron status Midtrans: {$message}"
                        : 'Gagal sinkron status Midtrans.',
                ],
            ]);
        }

        $payload = $response->json();

        if (($payload['order_id'] ?? null) !== $order->midtrans_order_id) {
            throw ValidationException::withMessages([
                'midtrans' => ['Respons Midtrans tidak cocok dengan order ini.'],
            ]);
        }

        return $this->applyStatusPayload($order, $payload);
    }

    protected function applyStatusPayload(Order $order, array $payload): Order
    {
        return DB::transaction(function () use ($order, $payload): Order {
            /** @var Order $order */
            $order = Order::query()
                ->whereKey($order->id)
                ->with('items')
                ->lockForUpdate()
                ->firstOrFail();

            $transactionStatus = $payload['transaction_status'] ?? null;
            $fraudStatus = $payload['fraud_status'] ?? null;

            $updates = [
                'midtrans_transaction_status' => $transactionStatus,
                'midtrans_payment_type' => $payload['payment_type'] ?? $order->midtrans_payment_type,
            ];

            if ($order->status !== Order::STATUS_WAITING_PAYMENT) {
                $order->forceFill($updates)->save();

                Log::info('Midtrans notification stored without changing final order status.', [
                    'order_id' => $order->id,
                    'midtrans_order_id' => $order->midtrans_order_id,
                    'order_status' => $order->status,
                    'transaction_status' => $transactionStatus,
                ]);

                return $order->fresh()->load('items');
            }

            if ($transactionStatus === 'pending') {
                $updates['payment_status'] = Order::PAYMENT_STATUS_WAITING_PAYMENT;
                $updates['status'] = Order::STATUS_WAITING_PAYMENT;
            }

            if ($transactionStatus === 'settlement' || $transactionStatus === 'capture') {
                $updates['payment_status'] = Order::PAYMENT_STATUS_PROCESSING;
                $updates['status'] = Order::STATUS_PROCESSING;
                $updates['payment_verified_at'] = now();
                $updates['cancellation_reason'] = null;
                $updates['decline_reason'] = null;
            }

            if (in_array($transactionStatus, ['expire', 'cancel', 'deny', 'failure'], true)) {
                $this->releaseStockForFailedPayment($order);
                $updates['payment_status'] = Order::PAYMENT_STATUS_CANCELLED;
                $updates['status'] = Order::STATUS_CANCELLED;
                $updates['cancelled_at'] = now();
                $updates['cancellation_reason'] = 'Pembayaran Midtrans tidak selesai.';
                $updates['decline_reason'] = 'Pembayaran Midtrans tidak selesai.';
            }

            $order->forceFill($updates)->save();

            Log::info('Midtrans notification processed.', [
                'order_id' => $order->id,
                'midtrans_order_id' => $order->midtrans_order_id,
                'transaction_status' => $transactionStatus,
                'payment_status' => $updates['payment_status'] ?? $order->payment_status,
                'status' => $updates['status'] ?? $order->status,
            ]);

            return $order->fresh()->load('items');
        });
    }

    public function cancelTransaction(Order $order): void
    {
        if (
            $this->isMockEnabled()
            || blank($order->midtrans_order_id)
            || blank(config('services.midtrans.server_key'))
        ) {
            return;
        }

        try {
            Http::withBasicAuth($this->serverKey(), '')
                ->withOptions($this->httpOptions())
                ->acceptJson()
                ->post($this->transactionCancelEndpoint($order->midtrans_order_id));
        } catch (Throwable) {
            // Local order cancellation remains the source of truth for the checkout UI.
        }
    }

    public function isConfigured(): bool
    {
        return $this->isMockEnabled() || filled(config('services.midtrans.server_key'));
    }

    protected function createMockTransaction(Order $order, string $midtransOrderId): Order
    {
        $updates = [
            'midtrans_order_id' => $midtransOrderId,
            'midtrans_snap_token' => 'mock-'.$midtransOrderId,
            'midtrans_redirect_url' => $this->mockRedirectUrl($midtransOrderId),
            'midtrans_transaction_status' => 'mock',
            'midtrans_payment_type' => 'mock',
        ];

        if ((bool) config('services.midtrans.mock_auto_settle')) {
            $updates['payment_status'] = Order::PAYMENT_STATUS_PROCESSING;
            $updates['status'] = Order::STATUS_PROCESSING;
            $updates['payment_verified_at'] = now();
            $updates['midtrans_transaction_status'] = 'settlement';
        }

        $order->forceFill($updates)->save();

        return $order->fresh()->load('items');
    }

    protected function mockRedirectUrl(string $midtransOrderId): string
    {
        $finishUrl = config('services.midtrans.finish_url') ?: 'http://localhost:3000/profile?tab=orders';
        $separator = Str::contains($finishUrl, '?') ? '&' : '?';

        return $finishUrl.$separator.http_build_query([
            'midtrans_mock' => '1',
            'order_id' => $midtransOrderId,
        ]);
    }

    protected function itemDetails(Order $order): array
    {
        return $order->items
            ->map(fn ($item) => [
                'id' => (string) ($item->product_id ?? $item->id),
                'price' => (int) $item->unit_price,
                'quantity' => (int) $item->quantity,
                'name' => Str::limit($item->product_name, 50, ''),
            ])
            ->values()
            ->all();
    }

    protected function makeMidtransOrderId(Order $order): string
    {
        return 'NEXA-'.$order->id.'-'.now()->format('YmdHis');
    }

    protected function snapEndpoint(): string
    {
        return $this->isProduction()
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    protected function transactionCancelEndpoint(string $midtransOrderId): string
    {
        $encodedOrderId = rawurlencode($midtransOrderId);

        return $this->isProduction()
            ? "https://api.midtrans.com/v2/{$encodedOrderId}/cancel"
            : "https://api.sandbox.midtrans.com/v2/{$encodedOrderId}/cancel";
    }

    protected function transactionStatusEndpoint(string $midtransOrderId): string
    {
        $encodedOrderId = rawurlencode($midtransOrderId);

        return $this->isProduction()
            ? "https://api.midtrans.com/v2/{$encodedOrderId}/status"
            : "https://api.sandbox.midtrans.com/v2/{$encodedOrderId}/status";
    }

    protected function serverKey(): string
    {
        $serverKey = config('services.midtrans.server_key');

        if (!filled($serverKey)) {
            throw ValidationException::withMessages([
                'payment_method' => ['MIDTRANS_SERVER_KEY belum diisi.'],
            ]);
        }

        return $serverKey;
    }

    protected function guardEnvironmentKeyMatch(string $serverKey): void
    {
        if ($this->isProduction() && Str::startsWith($serverKey, 'SB-Mid-server-')) {
            throw ValidationException::withMessages([
                'payment_method' => ['Mode Midtrans production aktif, tetapi Server Key yang dipakai masih sandbox. Gunakan production key atau ubah MIDTRANS_IS_PRODUCTION=false.'],
            ]);
        }
    }

    protected function isProduction(): bool
    {
        return (bool) config('services.midtrans.is_production');
    }

    protected function isMockEnabled(): bool
    {
        return (bool) config('services.midtrans.mock_enabled');
    }

    protected function httpOptions(): array
    {
        $caBundle = config('services.midtrans.ca_bundle');

        if (blank($caBundle)) {
            return [];
        }

        return [
            'verify' => $caBundle,
        ];
    }

    protected function isValidSignature(array $payload): bool
    {
        $signature = $payload['signature_key'] ?? null;
        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;

        if (!$signature || !$orderId || !$statusCode || !$grossAmount) {
            return false;
        }

        $expected = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey());

        return hash_equals($expected, $signature);
    }

    protected function releaseStockForFailedPayment(Order $order): void
    {
        if (!$order->hasReservedStock()) {
            return;
        }

        /** @var \Illuminate\Support\Collection<int, int> $productIds */
        $productIds = $order->items
            ->pluck('product_id')
            ->filter()
            ->unique()
            ->values();

        $lockedProducts = Product::query()
            ->whereIn('id', $productIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        $order->releaseReservedStock($lockedProducts);
    }
}

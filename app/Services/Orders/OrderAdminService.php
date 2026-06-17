<?php

namespace App\Services\Orders;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderAdminService
{
    public function update(Order $order, array $payload): Order
    {
        if ($order->status === Order::STATUS_DELIVERED || $order->payment_status === Order::PAYMENT_STATUS_EXPIRED) {
            throw ValidationException::withMessages([
                'status' => ['Order ini sudah tidak bisa diubah lagi.'],
            ]);
        }

        if (($payload['status'] ?? null) === null && ($payload['payment_status'] ?? null) === null) {
            throw ValidationException::withMessages([
                'status' => ['Tidak ada perubahan status yang dikirim.'],
            ]);
        }

        return match (true) {
            ($payload['payment_status'] ?? null) === Order::PAYMENT_STATUS_PAID
                => $this->approvePayment($order),
            ($payload['payment_status'] ?? null) === Order::PAYMENT_STATUS_REJECTED
                => $this->rejectPayment($order, $payload['payment_rejection_reason'] ?? null),
            ($payload['status'] ?? null) === Order::STATUS_DELIVERED
                => $this->markDelivered($order),
            ($payload['status'] ?? null) === Order::STATUS_CANCELLED
                => $this->cancelOrder($order, $payload['cancellation_reason'] ?? null),
            default => $order->fresh()->load('items'),
        };
    }

    protected function approvePayment(Order $order): Order
    {
        if (
            $order->payment_method !== Order::PAYMENT_METHOD_BANK_TRANSFER
            || $order->payment_status !== Order::PAYMENT_STATUS_WAITING_VERIFICATION
        ) {
            throw ValidationException::withMessages([
                'payment_status' => ['Order ini belum siap disetujui pembayarannya.'],
            ]);
        }

        $order->forceFill([
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'status' => Order::STATUS_PROCESSING,
            'payment_verified_at' => now(),
            'payment_rejection_reason' => null,
            'decline_reason' => null,
        ])->save();

        return $order->fresh()->load('items');
    }

    protected function rejectPayment(Order $order, ?string $reason): Order
    {
        if (
            $order->payment_method !== Order::PAYMENT_METHOD_BANK_TRANSFER
            || $order->payment_status !== Order::PAYMENT_STATUS_WAITING_VERIFICATION
        ) {
            throw ValidationException::withMessages([
                'payment_status' => ['Order ini belum bisa ditolak pembayarannya.'],
            ]);
        }

        if (!$reason || trim($reason) === '') {
            throw ValidationException::withMessages([
                'payment_rejection_reason' => ['Alasan penolakan wajib diisi.'],
            ]);
        }

        $order->forceFill([
            'payment_status' => Order::PAYMENT_STATUS_REJECTED,
            'status' => Order::STATUS_PENDING,
            'payment_rejection_reason' => trim($reason),
            'decline_reason' => trim($reason),
            'payment_verified_at' => null,
            'declined_at' => now(),
        ])->save();

        return $order->fresh()->load('items');
    }

    protected function markDelivered(Order $order): Order
    {
        if ($order->payment_method !== Order::PAYMENT_METHOD_COD && $order->payment_status !== Order::PAYMENT_STATUS_PAID) {
            throw ValidationException::withMessages([
                'status' => ['Order hanya bisa dikirim setelah pembayaran lunas.'],
            ]);
        }

        if ($order->status !== Order::STATUS_PROCESSING) {
            throw ValidationException::withMessages([
                'status' => ['Order ini belum masuk tahap processing.'],
            ]);
        }

        $payload = [
            'status' => Order::STATUS_DELIVERED,
            'delivered_at' => now(),
        ];

        if ($order->payment_method === Order::PAYMENT_METHOD_COD) {
            $payload['payment_status'] = Order::PAYMENT_STATUS_PAID;
            $payload['payment_verified_at'] = now();
        }

        $order->forceFill($payload)->save();

        return $order->fresh()->load('items');
    }

    protected function cancelOrder(Order $order, ?string $reason): Order
    {
        DB::transaction(function () use ($order, $reason): void {
            $order->refresh()->loadMissing('items');

            $productIds = $order->items
                ->pluck('product_id')
                ->filter()
                ->unique()
                ->values();

            /** @var Collection<int, Product> $lockedProducts */
            $lockedProducts = Product::query()
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $order->releaseReservedStock($lockedProducts);
            $cleanReason = $reason !== null && trim($reason) !== '' ? trim($reason) : $order->cancellation_reason;

            $order->forceFill([
                'status' => Order::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'cancellation_reason' => $cleanReason,
                'decline_reason' => $cleanReason ?? $order->decline_reason,
            ])->save();
        });

        return $order->fresh()->load('items');
    }
}

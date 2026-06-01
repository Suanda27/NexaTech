<?php

namespace App\Services\Orders;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderCheckoutService
{
    public function createFromCart(User $user, array $payload): Order
    {
        $cartItems = CartItem::query()
            ->with('product')
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Cart masih kosong.'],
            ]);
        }

        return DB::transaction(function () use ($cartItems, $user, $payload): Order {
            $lockedProducts = $this->lockProductsForCart($cartItems);
            $totals = $this->calculateTotals($cartItems, $lockedProducts, $payload['payment_method']);

            $order = Order::query()->create([
                'user_id' => $user->id,
                'order_number' => '#ORD-'.Str::upper(Str::random(10)),
                'first_name' => $payload['first_name'],
                'last_name' => $payload['last_name'],
                'address' => $payload['address'],
                'city' => $payload['city'],
                'postal_code' => $payload['postal_code'],
                'payment_method' => $payload['payment_method'],
                'payment_status' => $payload['payment_method'] === Order::PAYMENT_METHOD_BANK_TRANSFER
                    ? Order::PAYMENT_STATUS_WAITING_PAYMENT
                    : Order::PAYMENT_STATUS_UNPAID,
                'status' => $payload['payment_method'] === Order::PAYMENT_METHOD_BANK_TRANSFER
                    ? Order::STATUS_PENDING
                    : Order::STATUS_PROCESSING,
                'payment_proof' => null,
                'subtotal' => $totals['subtotal'],
                'shipping_fee' => $totals['shipping_fee'],
                'tax_amount' => $totals['tax_amount'],
                'total' => $totals['total'],
                'expires_at' => $payload['payment_method'] === Order::PAYMENT_METHOD_BANK_TRANSFER
                    ? now()->addHours(Order::TRANSFER_PAYMENT_WINDOW_HOURS)
                    : null,
                'ordered_at' => now(),
                'stock_reserved_at' => now(),
            ]);

            $order->forceFill([
                'order_number' => '#ORD-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT),
            ])->save();

            foreach ($cartItems as $item) {
                $product = $lockedProducts->get($item->product_id);

                if (!$product) {
                    continue;
                }

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image_url' => $product->image_url,
                    'unit_price' => $product->price,
                    'quantity' => $item->quantity,
                    'total_price' => $product->price * $item->quantity,
                ]);

                $this->reserveProductStock($product, $item->quantity);
            }

            CartItem::query()
                ->where('user_id', $user->id)
                ->delete();

            return $order->load('items');
        });
    }

    public function submitPaymentProof(Order $order, UploadedFile $paymentProof): Order
    {
        $this->guardPaymentProofSubmission($order);

        $paymentProofPath = $order->storePaymentProof($paymentProof);

        $order->forceFill([
            'payment_proof' => $paymentProofPath,
            'payment_status' => Order::PAYMENT_STATUS_WAITING_VERIFICATION,
            'payment_submitted_at' => now(),
            'payment_rejection_reason' => null,
            'cancellation_reason' => null,
            'decline_reason' => null,
        ])->save();

        return $order->fresh()->load('items');
    }

    /**
     * @param \Illuminate\Support\Collection<int, CartItem> $cartItems
     * @return \Illuminate\Support\Collection<int, Product>
     */
    protected function lockProductsForCart(Collection $cartItems): Collection
    {
        $productIds = $cartItems
            ->pluck('product_id')
            ->filter()
            ->unique()
            ->values();

        return Product::query()
            ->whereIn('id', $productIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');
    }

    /**
     * @param \Illuminate\Support\Collection<int, CartItem> $cartItems
     * @param \Illuminate\Support\Collection<int, Product> $lockedProducts
     * @return array{subtotal:int, shipping_fee:int, tax_amount:int, total:int}
     */
    protected function calculateTotals(
        Collection $cartItems,
        Collection $lockedProducts,
        string $paymentMethod,
    ): array {
        $subtotal = 0;
        $shippingFee = 0;
        $taxAmount = 0;

        foreach ($cartItems as $item) {
            $product = $lockedProducts->get($item->product_id);

            if (!$product || $product->status !== Product::STATUS_ACTIVE || $product->stock <= 0) {
                $productName = $item->product?->name ?: 'produk yang dipilih';

                throw ValidationException::withMessages([
                    'cart' => ["Produk {$productName} sudah tidak tersedia."],
                ]);
            }

            if ($item->quantity > $product->stock) {
                throw ValidationException::withMessages([
                    'cart' => ["Stok {$product->name} tidak cukup. Tersisa {$product->stock} unit."],
                ]);
            }

            $subtotal += (int) $product->price * $item->quantity;
        }

        $total = $subtotal + $shippingFee + $taxAmount;

        if (
            $paymentMethod === Order::PAYMENT_METHOD_COD
            && $total > Order::COD_MAX_TOTAL
        ) {
            throw ValidationException::withMessages([
                'payment_method' => ['COD hanya tersedia untuk total belanja maksimal Rp 300.000.'],
            ]);
        }

        return [
            'subtotal' => $subtotal,
            'shipping_fee' => $shippingFee,
            'tax_amount' => $taxAmount,
            'total' => $total,
        ];
    }

    protected function reserveProductStock(Product $product, int $quantity): void
    {
        $product->stock -= $quantity;

        if ($product->stock <= 0) {
            $product->stock = 0;
            $product->status = Product::STATUS_OUT_OF_STOCK;
        }

        $product->save();
    }

    protected function guardPaymentProofSubmission(Order $order): void
    {
        if ($order->payment_method !== Order::PAYMENT_METHOD_BANK_TRANSFER) {
            throw ValidationException::withMessages([
                'payment_proof' => ['Order COD tidak memerlukan bukti pembayaran.'],
            ]);
        }

        if ($order->payment_status === Order::PAYMENT_STATUS_PAID) {
            throw ValidationException::withMessages([
                'payment_proof' => ['Pembayaran order ini sudah terverifikasi.'],
            ]);
        }

        if ($order->payment_status === Order::PAYMENT_STATUS_EXPIRED) {
            throw ValidationException::withMessages([
                'payment_proof' => ['Batas waktu pembayaran order ini sudah habis.'],
            ]);
        }

        if ($order->status === Order::STATUS_CANCELLED || $order->status === Order::STATUS_DELIVERED) {
            throw ValidationException::withMessages([
                'payment_proof' => ['Order ini sudah tidak bisa menerima bukti pembayaran baru.'],
            ]);
        }
    }
}

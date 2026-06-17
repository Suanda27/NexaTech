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
    public function createFromCart(User $user, array $payload, ?callable $afterOrderCreated = null): Order
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

        return DB::transaction(function () use ($cartItems, $user, $payload, $afterOrderCreated): Order {
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
                'payment_status' => in_array($payload['payment_method'], [
                    Order::PAYMENT_METHOD_BANK_TRANSFER,
                    Order::PAYMENT_METHOD_MIDTRANS,
                ], true)
                    ? Order::PAYMENT_STATUS_WAITING_PAYMENT
                    : Order::PAYMENT_STATUS_UNPAID,
                'status' => in_array($payload['payment_method'], [
                    Order::PAYMENT_METHOD_BANK_TRANSFER,
                    Order::PAYMENT_METHOD_MIDTRANS,
                ], true)
                    ? Order::STATUS_PENDING
                    : Order::STATUS_PROCESSING,
                'payment_proof' => null,
                'subtotal' => $totals['subtotal'],
                'shipping_fee' => $totals['shipping_fee'],
                'tax_amount' => $totals['tax_amount'],
                'total' => $totals['total'],
                'expires_at' => in_array($payload['payment_method'], [
                    Order::PAYMENT_METHOD_BANK_TRANSFER,
                    Order::PAYMENT_METHOD_MIDTRANS,
                ], true)
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

            if ($afterOrderCreated !== null) {
                $order = $afterOrderCreated($order) ?? $order;
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

    public function cancelPendingMidtransOrder(Order $order, User $user): Order
    {
        return DB::transaction(function () use ($order, $user): Order {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->with('items')
                ->whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedOrder->user_id !== $user->id) {
                abort(404);
            }

            if (
                $lockedOrder->payment_method !== Order::PAYMENT_METHOD_MIDTRANS
                || $lockedOrder->payment_status !== Order::PAYMENT_STATUS_WAITING_PAYMENT
                || $lockedOrder->status !== Order::STATUS_PENDING
            ) {
                throw ValidationException::withMessages([
                    'order' => ['Order ini sudah tidak bisa dibatalkan dari popup pembayaran.'],
                ]);
            }

            $productIds = $lockedOrder->items
                ->pluck('product_id')
                ->filter()
                ->unique()
                ->values();

            $lockedProducts = Product::query()
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $lockedOrder->releaseReservedStock($lockedProducts);
            $this->restoreOrderItemsToCart($lockedOrder, $user->id);

            $lockedOrder->forceFill([
                'payment_status' => Order::PAYMENT_STATUS_EXPIRED,
                'status' => Order::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'cancellation_reason' => 'Popup pembayaran Midtrans ditutup oleh customer.',
                'decline_reason' => 'Popup pembayaran Midtrans ditutup oleh customer.',
            ])->save();

            return $lockedOrder->fresh()->load('items');
        });
    }

    /**
     * @param Collection<int, CartItem> $cartItems
     * @return Collection<int, Product>
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
     * @param Collection<int, CartItem> $cartItems
     * @param Collection<int, Product> $lockedProducts
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

    protected function restoreOrderItemsToCart(Order $order, int $userId): void
    {
        foreach ($order->items as $item) {
            if (!$item->product_id) {
                continue;
            }

            $cartItem = CartItem::query()->firstOrNew([
                'user_id' => $userId,
                'product_id' => $item->product_id,
            ]);

            $cartItem->quantity = ($cartItem->exists ? $cartItem->quantity : 0) + (int) $item->quantity;
            $cartItem->save();
        }
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

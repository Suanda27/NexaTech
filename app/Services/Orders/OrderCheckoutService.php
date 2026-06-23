<?php

namespace App\Services\Orders;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderCheckoutService
{
    public function createFromCart(User $user, array $payload, ?callable $afterOrderCreated = null): Order
    {
        $cartItems = CartItem::where('user_id', $user->id)
            ->with('product')
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
                'payment_status' => Order::PAYMENT_STATUS_WAITING_PAYMENT,
                'status' => Order::STATUS_WAITING_PAYMENT,
                'subtotal' => $totals['subtotal'],
                'shipping_fee' => $totals['shipping_fee'],
                'tax_amount' => $totals['tax_amount'],
                'total' => $totals['total'],
                'expires_at' => now()->addHours(Order::TRANSFER_PAYMENT_WINDOW_HOURS),
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

    public function completeShippedOrder(Order $order, User $user): Order
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

            if ($lockedOrder->status !== Order::STATUS_SHIPPED) {
                throw ValidationException::withMessages([
                    'status' => ['Order hanya bisa diselesaikan setelah dikirim.'],
                ]);
            }

            $lockedOrder->forceFill([
                'status' => Order::STATUS_COMPLETED,
                'payment_status' => Order::PAYMENT_STATUS_COMPLETED,
                'delivered_at' => $lockedOrder->delivered_at ?? now(),
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
        /** @var \Illuminate\Support\Collection<int, int> $productIds */
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

        if ($paymentMethod !== Order::PAYMENT_METHOD_MIDTRANS) {
            throw ValidationException::withMessages([
                'payment_method' => ['Metode pembayaran tidak valid. Hanya Midtrans yang didukung.'],
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

}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use SerializesStoreData;

    public function index(Request $request)
    {
        $orders = Order::query()
            ->with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders
                ->map(fn (Order $order) => $this->serializeOrder($order))
                ->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:20'],
            'payment_method' => ['required', 'in:bank_transfer,cod'],
            'payment_proof' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $cartItems = CartItem::query()
            ->with('product')
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Cart masih kosong.',
            ], 422);
        }

        if (
            $validated['payment_method'] === Order::PAYMENT_METHOD_BANK_TRANSFER
            && empty($validated['payment_proof'])
        ) {
            return response()->json([
                'message' => 'Bukti pembayaran wajib diisi untuk transfer bank.',
            ], 422);
        }

        $subtotal = $cartItems->sum(
            fn (CartItem $item) => ((int) $item->product?->price) * $item->quantity,
        );
        $shippingFee = 0;
        $taxAmount = 0;
        $total = $subtotal + $shippingFee + $taxAmount;

        $order = DB::transaction(function () use (
            $cartItems,
            $shippingFee,
            $subtotal,
            $taxAmount,
            $total,
            $user,
            $validated
        ) {
            $nextNumber = (Order::max('id') ?? 0) + 1;

            $order = Order::query()->create([
                'user_id' => $user->id,
                'order_number' => '#ORD-'.str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT),
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'address' => $validated['address'],
                'city' => $validated['city'],
                'postal_code' => $validated['postal_code'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === Order::PAYMENT_METHOD_BANK_TRANSFER
                    ? Order::PAYMENT_STATUS_PAID
                    : Order::PAYMENT_STATUS_UNPAID,
                'status' => Order::STATUS_PROGRESSING,
                'payment_proof' => $validated['payment_proof'] ?? null,
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'ordered_at' => now(),
            ]);

            foreach ($cartItems as $item) {
                if (!$item->product) {
                    continue;
                }

                $order->items()->create([
                    'product_id' => $item->product->id,
                    'product_name' => $item->product->name,
                    'product_image_url' => $item->product->image_url,
                    'unit_price' => $item->product->price,
                    'quantity' => $item->quantity,
                    'total_price' => $item->product->price * $item->quantity,
                ]);
            }

            CartItem::query()
                ->where('user_id', $user->id)
                ->delete();

            return $order->load('items');
        });

        return response()->json([
            'message' => 'Order berhasil dibuat.',
            'data' => $this->serializeOrder($order),
        ], 201);
    }
}

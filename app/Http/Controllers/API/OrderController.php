<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    use SerializesStoreData;

    public function index(Request $request)
    {
        Order::expirePendingTransferPayments();

        $orders = Order::query()
            ->select([
                'id',
                'user_id',
                'order_number',
                'first_name',
                'last_name',
                'address',
                'city',
                'postal_code',
                'payment_method',
                'payment_status',
                'status',
                'payment_rejection_reason',
                'cancellation_reason',
                'decline_reason',
                'subtotal',
                'shipping_fee',
                'tax_amount',
                'total',
                'expires_at',
                'payment_submitted_at',
                'payment_verified_at',
                'ordered_at',
                'created_at',
                'updated_at',
                'delivered_at',
                'cancelled_at',
                'declined_at',
            ])
            ->with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders
                ->map(fn (Order $order) => $this->serializeOrder($order, false))
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
        ]);

        Order::expirePendingTransferPayments();

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

        $order = DB::transaction(function () use (
            $cartItems,
            $user,
            $validated
        ) {
            $productIds = $cartItems
                ->pluck('product_id')
                ->filter()
                ->unique()
                ->values();

            $lockedProducts = Product::query()
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

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
                $validated['payment_method'] === Order::PAYMENT_METHOD_COD
                && $total > Order::COD_MAX_TOTAL
            ) {
                throw ValidationException::withMessages([
                    'payment_method' => ['COD hanya tersedia untuk total belanja maksimal Rp 300.000.'],
                ]);
            }

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
                    ? Order::PAYMENT_STATUS_WAITING_PAYMENT
                    : Order::PAYMENT_STATUS_UNPAID,
                'status' => $validated['payment_method'] === Order::PAYMENT_METHOD_BANK_TRANSFER
                    ? Order::STATUS_PENDING
                    : Order::STATUS_PROCESSING,
                'payment_proof' => null,
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'expires_at' => $validated['payment_method'] === Order::PAYMENT_METHOD_BANK_TRANSFER
                    ? now()->addHours(Order::TRANSFER_PAYMENT_WINDOW_HOURS)
                    : null,
                'ordered_at' => now(),
                'stock_reserved_at' => now(),
            ]);

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

                $product->stock -= $item->quantity;

                if ($product->stock <= 0) {
                    $product->stock = 0;
                    $product->status = Product::STATUS_OUT_OF_STOCK;
                }

                $product->save();
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

    public function submitPaymentProof(Request $request, Order $order)
    {
        Order::expirePendingTransferPayments();

        if ($order->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validate([
            'payment_proof' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($order->payment_method !== Order::PAYMENT_METHOD_BANK_TRANSFER) {
            return response()->json([
                'message' => 'Order COD tidak memerlukan bukti pembayaran.',
            ], 422);
        }

        if ($order->payment_status === Order::PAYMENT_STATUS_PAID) {
            return response()->json([
                'message' => 'Pembayaran order ini sudah terverifikasi.',
            ], 422);
        }

        if ($order->payment_status === Order::PAYMENT_STATUS_EXPIRED) {
            return response()->json([
                'message' => 'Batas waktu pembayaran order ini sudah habis.',
            ], 422);
        }

        if ($order->status === Order::STATUS_CANCELLED || $order->status === Order::STATUS_DELIVERED) {
            return response()->json([
                'message' => 'Order ini sudah tidak bisa menerima bukti pembayaran baru.',
            ], 422);
        }

        $paymentProofPath = $order->storePaymentProof($validated['payment_proof']);

        $order->forceFill([
            'payment_proof' => $paymentProofPath,
            'payment_status' => Order::PAYMENT_STATUS_WAITING_VERIFICATION,
            'payment_submitted_at' => now(),
            'payment_rejection_reason' => null,
            'cancellation_reason' => null,
            'decline_reason' => null,
        ])->save();

        return response()->json([
            'message' => 'Bukti pembayaran berhasil dikirim untuk diverifikasi admin.',
            'data' => $this->serializeOrder($order->fresh()->load('items'), false),
        ]);
    }
}

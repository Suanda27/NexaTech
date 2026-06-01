<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Orders\OrderCheckoutService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    use SerializesStoreData;

    public function __construct(
        protected OrderCheckoutService $orderCheckoutService,
    ) {
    }

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

        try {
            $order = $this->orderCheckoutService->createFromCart(
                $request->user(),
                $validated,
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => collect($exception->errors())->flatten()->first() ?? 'Order gagal dibuat.',
                'errors' => $exception->errors(),
            ], 422);
        }

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

        try {
            $updatedOrder = $this->orderCheckoutService->submitPaymentProof(
                $order,
                $validated['payment_proof'],
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => collect($exception->errors())->flatten()->first() ?? 'Gagal mengirim bukti pembayaran.',
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Bukti pembayaran berhasil dikirim untuk diverifikasi admin.',
            'data' => $this->serializeOrder($updatedOrder, false),
        ]);
    }
}

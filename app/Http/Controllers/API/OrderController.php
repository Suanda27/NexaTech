<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Orders\OrderCheckoutService;
use App\Services\Payments\MidtransPaymentService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    use SerializesStoreData;

    public function __construct(
        protected OrderCheckoutService $orderCheckoutService,
        protected MidtransPaymentService $midtransPaymentService,
    ) {
    }

    public function index(Request $request)
    {
        Order::expirePendingMidtransPayments();

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
                'midtrans_order_id',
                'midtrans_snap_token',
                'midtrans_redirect_url',
                'midtrans_transaction_status',
                'midtrans_payment_type',
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
                ->map(fn (Order $order) => $this->serializeOrder($order))
                ->values(),
        ]);
    }

    public function midtransConfig()
    {
        return response()->json([
            'data' => [
                'clientKey' => config('services.midtrans.client_key'),
                'isProduction' => (bool) config('services.midtrans.is_production'),
                'snapUrl' => (bool) config('services.midtrans.is_production')
                    ? 'https://app.midtrans.com/snap/snap.js'
                    : 'https://app.sandbox.midtrans.com/snap/snap.js',
            ],
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
            'payment_method' => ['required', 'in:midtrans'],
            'selected_product_ids' => ['sometimes', 'array', 'min:1'],
            'selected_product_ids.*' => ['integer'],
        ]);

        Order::expirePendingMidtransPayments();

        try {
            if (!$this->midtransPaymentService->isConfigured()) {
                throw ValidationException::withMessages([
                    'payment_method' => ['MIDTRANS_SERVER_KEY belum diisi.'],
                ]);
            }

            $order = $this->orderCheckoutService->createFromCart(
                $request->user(),
                $validated,
                fn (Order $order) => $this->midtransPaymentService->createSnapTransaction($order),
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

    public function complete(Request $request, Order $order)
    {
        try {
            $updatedOrder = $this->orderCheckoutService->completeShippedOrder(
                $order,
                $request->user(),
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => collect($exception->errors())->flatten()->first() ?? 'Order tidak bisa diselesaikan.',
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Order berhasil diselesaikan.',
            'data' => $this->serializeOrder($updatedOrder),
        ]);
    }

    public function syncMidtrans(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(404);
        }

        try {
            $updatedOrder = $this->midtransPaymentService->syncTransactionStatus($order);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => collect($exception->errors())->flatten()->first() ?? 'Status Midtrans gagal disinkronkan.',
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Status Midtrans berhasil disinkronkan.',
            'data' => $this->serializeOrder($updatedOrder),
        ]);
    }

    public function midtransNotification(Request $request)
    {
        try {
            $order = $this->midtransPaymentService->handleNotification($request->all());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => collect($exception->errors())->flatten()->first() ?? 'Notification Midtrans ditolak.',
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => $order ? 'Notification Midtrans berhasil diproses.' : 'Order Midtrans tidak ditemukan.',
        ]);
    }
}

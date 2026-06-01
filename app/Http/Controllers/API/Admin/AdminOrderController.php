<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Orders\OrderAdminService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminOrderController extends Controller
{
    use SerializesStoreData;

    public function __construct(
        protected OrderAdminService $orderAdminService,
    ) {
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:pending,processing,delivered,cancelled'],
            'payment_status' => ['nullable', 'in:waiting_payment,waiting_verification,paid,rejected,expired,unpaid'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        Order::expirePendingTransferPayments();

        $summaryQuery = Order::query();
        $ordersQuery = Order::query()
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
            ->latest();

        if (!empty($validated['q'])) {
            $keyword = trim($validated['q']);

            $ordersQuery->where(function ($query) use ($keyword) {
                $query
                    ->where('order_number', 'like', "%{$keyword}%")
                    ->orWhere('first_name', 'like', "%{$keyword}%")
                    ->orWhere('last_name', 'like', "%{$keyword}%");
            });
        }

        if (!empty($validated['status'])) {
            $ordersQuery->where('status', $validated['status']);
        }

        if (!empty($validated['payment_status'])) {
            $ordersQuery->where('payment_status', $validated['payment_status']);
        }

        $orders = $ordersQuery->paginate($validated['per_page'] ?? 10);
        $summary = $summaryQuery
            ->selectRaw('COUNT(*) as total_orders')
            ->selectRaw(
                "SUM(CASE WHEN payment_status = '".Order::PAYMENT_STATUS_PAID."' THEN 1 ELSE 0 END) as paid_orders"
            )
            ->selectRaw(
                "SUM(CASE WHEN status = '".Order::STATUS_DELIVERED."' THEN 1 ELSE 0 END) as delivered_orders"
            )
            ->selectRaw(
                "SUM(CASE WHEN status IN ('".Order::STATUS_PENDING."', '".Order::STATUS_PROCESSING."') THEN 1 ELSE 0 END) as progressing_orders"
            )
            ->selectRaw('COALESCE(SUM(total), 0) as order_value')
            ->first();

        return response()->json([
            'data' => $orders->getCollection()
                ->map(fn (Order $order) => $this->serializeOrder($order, false))
                ->values(),
            'summary' => [
                'paidOrders' => (int) ($summary->paid_orders ?? 0),
                'totalOrders' => (int) ($summary->total_orders ?? 0),
                'deliveredOrders' => (int) ($summary->delivered_orders ?? 0),
                'progressingOrders' => (int) ($summary->progressing_orders ?? 0),
                'orderValue' => (int) ($summary->order_value ?? 0),
            ],
            'meta' => [
                'currentPage' => $orders->currentPage(),
                'lastPage' => $orders->lastPage(),
                'perPage' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Order $order)
    {
        Order::expirePendingTransferPayments();

        return response()->json([
            'data' => $this->serializeOrder($order->fresh()->load('items')),
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'in:pending,processing,delivered,cancelled'],
            'payment_status' => ['nullable', 'in:paid,rejected'],
            'payment_rejection_reason' => ['nullable', 'string'],
            'cancellation_reason' => ['nullable', 'string'],
        ]);

        Order::expirePendingTransferPayments();
        $order->refresh();

        try {
            $updatedOrder = $this->orderAdminService->update($order, $validated);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => collect($exception->errors())->flatten()->first() ?? 'Status order gagal diperbarui.',
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Status order berhasil diperbarui.',
            'data' => $this->serializeOrder($updatedOrder),
        ]);
    }
}

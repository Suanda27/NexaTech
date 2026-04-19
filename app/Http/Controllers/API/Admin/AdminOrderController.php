<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    use SerializesStoreData;

    public function index()
    {
        $orders = Order::query()
            ->with('items')
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders
                ->map(fn (Order $order) => $this->serializeOrder($order))
                ->values(),
            'summary' => [
                'paidOrders' => $orders->where('payment_status', Order::PAYMENT_STATUS_PAID)->count(),
                'totalOrders' => $orders->count(),
                'deliveredOrders' => $orders->where('status', Order::STATUS_DELIVERED)->count(),
                'progressingOrders' => $orders->where('status', Order::STATUS_PROGRESSING)->count(),
                'orderValue' => $orders->sum('total'),
            ],
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:progressing,delivered,declined,cancelled'],
            'decline_reason' => ['nullable', 'string'],
        ]);

        if (
            $order->status !== Order::STATUS_PROGRESSING
            && $validated['status'] !== $order->status
        ) {
            return response()->json([
                'message' => 'Order ini sudah tidak bisa diubah lagi.',
            ], 422);
        }

        if (
            $validated['status'] === Order::STATUS_DECLINED
            && empty($validated['decline_reason'])
        ) {
            return response()->json([
                'message' => 'Alasan penolakan wajib diisi.',
            ], 422);
        }

        $order->status = $validated['status'];
        $order->decline_reason = $validated['status'] === Order::STATUS_DECLINED
            ? ($validated['decline_reason'] ?? null)
            : null;

        if ($validated['status'] === Order::STATUS_DELIVERED) {
            $order->delivered_at = now();

            if ($order->payment_method === Order::PAYMENT_METHOD_BANK_TRANSFER) {
                $order->payment_status = Order::PAYMENT_STATUS_PAID;
            }
        }

        if ($validated['status'] === Order::STATUS_CANCELLED) {
            $order->cancelled_at = now();
        }

        if ($validated['status'] === Order::STATUS_DECLINED) {
            $order->declined_at = now();
        }

        $order->save();

        return response()->json([
            'message' => 'Status order berhasil diperbarui.',
            'data' => $this->serializeOrder($order->fresh()->load('items')),
        ]);
    }
}

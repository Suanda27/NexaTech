<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    use SerializesStoreData;

    public function index()
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
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders
                ->map(fn (Order $order) => $this->serializeOrder($order, false))
                ->values(),
            'summary' => [
                'paidOrders' => $orders->where('payment_status', Order::PAYMENT_STATUS_PAID)->count(),
                'totalOrders' => $orders->count(),
                'deliveredOrders' => $orders->where('status', Order::STATUS_DELIVERED)->count(),
                'progressingOrders' => $orders->whereIn('status', [
                    Order::STATUS_PENDING,
                    Order::STATUS_PROCESSING,
                ])->count(),
                'orderValue' => $orders->sum('total'),
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

        if ($order->status === Order::STATUS_DELIVERED || $order->payment_status === Order::PAYMENT_STATUS_EXPIRED) {
            return response()->json([
                'message' => 'Order ini sudah tidak bisa diubah lagi.',
            ], 422);
        }

        if (($validated['status'] ?? null) === null && ($validated['payment_status'] ?? null) === null) {
            return response()->json([
                'message' => 'Tidak ada perubahan status yang dikirim.',
            ], 422);
        }

        if (($validated['payment_status'] ?? null) === Order::PAYMENT_STATUS_PAID) {
            if (
                $order->payment_method !== Order::PAYMENT_METHOD_BANK_TRANSFER
                || $order->payment_status !== Order::PAYMENT_STATUS_WAITING_VERIFICATION
            ) {
                return response()->json([
                    'message' => 'Order ini belum siap disetujui pembayarannya.',
                ], 422);
            }

            $order->payment_status = Order::PAYMENT_STATUS_PAID;
            $order->status = Order::STATUS_PROCESSING;
            $order->payment_verified_at = now();
            $order->payment_rejection_reason = null;
            $order->decline_reason = null;
        } elseif (($validated['payment_status'] ?? null) === Order::PAYMENT_STATUS_REJECTED) {
            if (
                $order->payment_method !== Order::PAYMENT_METHOD_BANK_TRANSFER
                || $order->payment_status !== Order::PAYMENT_STATUS_WAITING_VERIFICATION
            ) {
                return response()->json([
                    'message' => 'Order ini belum bisa ditolak pembayarannya.',
                ], 422);
            }

            if (empty($validated['payment_rejection_reason'])) {
                return response()->json([
                    'message' => 'Alasan penolakan wajib diisi.',
                ], 422);
            }

            $order->payment_status = Order::PAYMENT_STATUS_REJECTED;
            $order->status = Order::STATUS_PENDING;
            $order->payment_rejection_reason = $validated['payment_rejection_reason'];
            $order->decline_reason = $validated['payment_rejection_reason'];
            $order->payment_verified_at = null;
            $order->declined_at = now();
        } elseif (($validated['status'] ?? null) === Order::STATUS_DELIVERED) {
            if (
                $order->payment_method === Order::PAYMENT_METHOD_BANK_TRANSFER
                && $order->payment_status !== Order::PAYMENT_STATUS_PAID
            ) {
                return response()->json([
                    'message' => 'Order transfer hanya bisa dikirim setelah pembayaran disetujui.',
                ], 422);
            }

            if ($order->status !== Order::STATUS_PROCESSING) {
                return response()->json([
                    'message' => 'Order ini belum masuk tahap processing.',
                ], 422);
            }

            $order->status = Order::STATUS_DELIVERED;
            $order->delivered_at = now();

            if ($order->payment_method === Order::PAYMENT_METHOD_COD) {
                $order->payment_status = Order::PAYMENT_STATUS_PAID;
                $order->payment_verified_at = now();
            }
        } elseif (($validated['status'] ?? null) === Order::STATUS_CANCELLED) {
            DB::transaction(function () use ($order, $validated): void {
                $order->refresh()->loadMissing('items');

                $productIds = $order->items
                    ->pluck('product_id')
                    ->filter()
                    ->unique()
                    ->values();

                $lockedProducts = Product::query()
                    ->whereIn('id', $productIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $order->releaseReservedStock($lockedProducts);
                $order->status = Order::STATUS_CANCELLED;
                $order->cancelled_at = now();
                $order->cancellation_reason = $validated['cancellation_reason'] ?? $order->cancellation_reason;
                $order->decline_reason = $validated['cancellation_reason'] ?? $order->decline_reason;
                $order->save();
            });

            $order->refresh();
        }

        if (($validated['status'] ?? null) !== Order::STATUS_CANCELLED) {
            $order->save();
        }

        return response()->json([
            'message' => 'Status order berhasil diperbarui.',
            'data' => $this->serializeOrder($order->fresh()->load('items')),
        ]);
    }
}

<?php

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('total');
            }

            if (!Schema::hasColumn('orders', 'payment_submitted_at')) {
                $table->timestamp('payment_submitted_at')->nullable()->after('expires_at');
            }

            if (!Schema::hasColumn('orders', 'payment_verified_at')) {
                $table->timestamp('payment_verified_at')->nullable()->after('payment_submitted_at');
            }
        });

        /** @var \Illuminate\Database\Query\Builder $ordersTable */
        $ordersTable = DB::table('orders');

        $transferOrders = $ordersTable
            ->where('payment_method', 'bank_transfer')
            ->where('payment_status', 'unpaid')
            ->select('id', 'ordered_at', 'created_at', 'expires_at')
            ->get();

        foreach ($transferOrders as $order) {
            $baseTime = $order->ordered_at ?? $order->created_at ?? now();

            DB::table('orders')
                ->where('id', $order->id)
                ->update([
                    'payment_status' => Order::PAYMENT_STATUS_WAITING_PAYMENT,
                    'status' => Order::STATUS_WAITING_PAYMENT,
                    'expires_at' => $order->expires_at
                        ? Carbon::parse($order->expires_at)
                        : Carbon::parse($baseTime)->addHours(Order::TRANSFER_PAYMENT_WINDOW_HOURS),
                ]);
        }

        /** @var \Illuminate\Database\Query\Builder $ordersTable */
        $ordersTable = DB::table('orders');
        $ordersTable
            ->where('payment_method', 'cod')
            ->where('status', 'progressing')
            ->update([
                'status' => Order::STATUS_PROCESSING,
            ]);

        /** @var \Illuminate\Database\Query\Builder $ordersTable */
        $ordersTable = DB::table('orders');
        $declinedOrders = $ordersTable
            ->where('status', 'declined')
            ->select('id', 'ordered_at', 'created_at', 'payment_submitted_at')
            ->get();

        foreach ($declinedOrders as $order) {
            DB::table('orders')
                ->where('id', $order->id)
                ->update([
                    'status' => Order::STATUS_CANCELLED,
                    'payment_status' => Order::PAYMENT_STATUS_CANCELLED,
                    'cancelled_at' => Carbon::parse($order->ordered_at ?? $order->created_at ?? now()),
                    'payment_submitted_at' => $order->payment_submitted_at
                        ? Carbon::parse($order->payment_submitted_at)
                        : Carbon::parse($order->ordered_at ?? $order->created_at ?? now()),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'payment_verified_at')) {
                $table->dropColumn('payment_verified_at');
            }

            if (Schema::hasColumn('orders', 'payment_submitted_at')) {
                $table->dropColumn('payment_submitted_at');
            }

            if (Schema::hasColumn('orders', 'expires_at')) {
                $table->dropColumn('expires_at');
            }
        });
    }
};

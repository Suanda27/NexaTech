<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('orders')
            ->where('payment_method', '<>', 'midtrans')
            ->update(['payment_method' => 'midtrans']);

        DB::table('orders')
            ->whereIn('status', ['pending', 'progressing'])
            ->update([
                'status' => DB::raw("CASE status WHEN 'pending' THEN 'waiting_payment' ELSE 'processing' END"),
            ]);

        DB::table('orders')
            ->whereIn('status', ['declined', 'expired', 'failed'])
            ->update([
                'status' => 'cancelled',
                'payment_status' => 'cancelled',
                'cancelled_at' => DB::raw('COALESCE(cancelled_at, updated_at, created_at)'),
            ]);

        DB::table('orders')
            ->whereIn('payment_status', ['unpaid', 'pending'])
            ->update(['payment_status' => 'waiting_payment']);

        DB::table('orders')
            ->whereIn('payment_status', ['expired', 'declined', 'failed'])
            ->update(['payment_status' => 'cancelled']);

        DB::table('orders')
            ->where('status', 'cancelled')
            ->where('payment_status', '<>', 'cancelled')
            ->update(['payment_status' => 'cancelled']);
    }

    public function down(): void
    {
        //
    }
};

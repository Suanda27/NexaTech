<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('orders')
            ->where('status', 'pending')
            ->update(['status' => 'waiting_payment']);

        DB::table('orders')
            ->where('status', 'progressing')
            ->update(['status' => 'processing']);

        DB::table('orders')
            ->where('payment_status', 'expired')
            ->update(['payment_status' => 'cancelled']);
    }

    public function down(): void
    {
        DB::table('orders')
            ->where('status', 'waiting_payment')
            ->update(['status' => 'pending']);
    }
};

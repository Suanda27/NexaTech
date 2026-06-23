<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('midtrans_order_id')->nullable()->after('decline_reason');
            $table->string('midtrans_snap_token')->nullable()->after('midtrans_order_id');
            $table->text('midtrans_redirect_url')->nullable()->after('midtrans_snap_token');
            $table->string('midtrans_transaction_status')->nullable()->after('midtrans_redirect_url');
            $table->string('midtrans_payment_type')->nullable()->after('midtrans_transaction_status');
            $table->index('midtrans_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['midtrans_order_id']);
            $table->dropColumn([
                'midtrans_order_id',
                'midtrans_snap_token',
                'midtrans_redirect_url',
                'midtrans_transaction_status',
                'midtrans_payment_type',
            ]);
        });
    }
};

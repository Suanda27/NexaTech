<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('stock_reserved_at')->nullable()->after('ordered_at');
            $table->timestamp('stock_released_at')->nullable()->after('stock_reserved_at');
            $table->index(
                ['payment_method', 'payment_status', 'expires_at', 'stock_released_at'],
                'orders_payment_expiry_release_index',
            );
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_payment_expiry_release_index');
            $table->dropColumn(['stock_reserved_at', 'stock_released_at']);
        });
    }
};

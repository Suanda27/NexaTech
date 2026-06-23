<?php

use App\Models\Order;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'cancellation_reason')) {
                $table->text('cancellation_reason')->nullable()->after('decline_reason');
            }
        });

        DB::table('orders')
            ->where('status', Order::STATUS_CANCELLED)
            ->whereNull('cancellation_reason')
            ->whereNotNull('decline_reason')
            ->update([
                'cancellation_reason' => DB::raw('decline_reason'),
            ]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'cancellation_reason')) {
                $table->dropColumn('cancellation_reason');
            }

        });
    }
};

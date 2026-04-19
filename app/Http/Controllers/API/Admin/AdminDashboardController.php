<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $totalRevenue = Order::query()
            ->where('status', Order::STATUS_DELIVERED)
            ->sum('total');

        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $deliveredOrders = Order::query()
            ->where('status', Order::STATUS_DELIVERED)
            ->count();

        $months = collect(range(5, 0))->map(function (int $offset) {
            $date = Carbon::now()->startOfMonth()->subMonths($offset);

            return [
                'key' => $date->format('Y-m'),
                'label' => $date->format('M'),
            ];
        });

        $orderGroups = Order::query()
            ->selectRaw("DATE_FORMAT(COALESCE(ordered_at, created_at), '%Y-%m') as month_key")
            ->selectRaw('SUM(total) as revenue')
            ->selectRaw('COUNT(*) as orders')
            ->groupBy('month_key')
            ->get()
            ->keyBy('month_key');

        $chart = $months->map(function (array $month) use ($orderGroups) {
            $group = $orderGroups->get($month['key']);

            return [
                'label' => $month['label'],
                'revenue' => (int) ($group->revenue ?? 0),
                'orders' => (int) ($group->orders ?? 0),
            ];
        })->values();

        $topProducts = OrderItem::query()
            ->selectRaw('product_name, product_image_url')
            ->selectRaw('SUM(quantity) as sold_units')
            ->selectRaw('SUM(total_price) as revenue')
            ->groupBy('product_name', 'product_image_url')
            ->orderByDesc('sold_units')
            ->take(5)
            ->get()
            ->map(function (OrderItem $item, int $index) {
                return [
                    'rank' => $index + 1,
                    'name' => $item->product_name,
                    'imageUrl' => $item->product_image_url,
                    'soldUnits' => (int) $item->sold_units,
                    'revenue' => (int) $item->revenue,
                ];
            })
            ->values();

        return response()->json([
            'data' => [
                'stats' => [
                    'totalRevenue' => (int) $totalRevenue,
                    'totalOrders' => (int) $totalOrders,
                    'totalProducts' => (int) $totalProducts,
                    'fulfillmentRate' => $totalOrders > 0
                        ? round(($deliveredOrders / $totalOrders) * 100, 1)
                        : 0,
                ],
                'chart' => $chart,
                'topProducts' => $topProducts,
            ],
        ]);
    }
}

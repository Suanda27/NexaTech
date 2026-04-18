"use client";

import StatsCard from "./components/StatsCard";
import SalesChart from "./components/SalesChart";
import ProductTable from "./components/ProductTable";

export default function DashboardPage() {
    return (
        <>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
                    <StatsCard title="Total Penjualan" value="Rp 245M" growth="+12.4%" />
                    <StatsCard title="Total Order" value="1,284" growth="+8.1%" />
                    <StatsCard title="Total Produk" value="356" growth="24 new items" />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <div className="rounded-3xl bg-white p-6 shadow-sm border border-blue-100">
                            <h2 className="text-xl font-semibold text-blue-900 mb-5">Sales Overview</h2>
                            <SalesChart />
                        </div>
                    </div>

                    <div className="xl:col-span-1">
                        <div className="rounded-3xl bg-white p-6 shadow-sm border border-blue-100">
                            <h2 className="text-xl font-semibold text-blue-900 mb-5">Top Products</h2>
                            <ProductTable />
                        </div>
                    </div>
                </div>
            </div>

            <footer className="border-t border-blue-100 bg-white py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-blue-600 text-sm">© 2026 NexaTech Admin Dashboard</p>
                </div>
            </footer>
        </>
    );
}

"use client";

import Header from "./components/Header";
import StatsCard from "./components/StatsCard";
import SalesChart from "./components/SalesChart";
import ProductTable from "./components/ProductTable";

export default function DashboardPage() {
    return (
        <>
            <Header />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
                    <StatsCard
                        title="Total Penjualan"
                        value="Rp 245M"
                        growth="+12.4%"
                    />
                    <StatsCard
                        title="Total Order"
                        value="1,284"
                        growth="+8.1%"
                    />
                    <StatsCard
                        title="Total Produk"
                        value="356"
                        growth="24 new items"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <SalesChart />
                    </div>
                    <ProductTable />
                </div>
            </div>

            <footer className="border-t bg-white py-6 text-center text-gray-500 text-sm">
                © 2026 Admin Dashboard
            </footer>
        </>
    );
}

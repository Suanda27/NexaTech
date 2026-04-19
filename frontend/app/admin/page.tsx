"use client";

import { useMemo } from "react";
import {
    ArrowUpRight,
    Boxes,
    ChartNoAxesCombined,
    ClipboardList,
    PackageCheck,
    Sparkles,
} from "lucide-react";
import StatsCard from "./components/StatsCard";
import SalesChart from "./components/SalesChart";
import ProductTable from "./components/ProductTable";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();

    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(new Date()),
        [],
    );

    return (
        <>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <section className="overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_56%,#dbeafe_100%)]">
                    <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.25fr)_320px] lg:px-8 lg:py-8">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                Live admin overview
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {todayLabel}
                                    </p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                        Welcome back, {user?.name ?? "Admin"}.
                                    </h1>
                                </div>
                                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                    Monitor store performance, track growth,
                                    and keep your best-selling products in
                                    focus from one calm dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 self-start">
                            <div className="rounded-lg border border-white/70 bg-white/85 p-4 shadow-[0_20px_44px_-34px_rgba(37,99,235,0.7)] backdrop-blur">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                            Conversion
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold text-slate-950">
                                            6.84%
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                        <ChartNoAxesCombined className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                    +1.12% from last month
                                </p>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-slate-950 p-4 text-white shadow-[0_24px_50px_-34px_rgba(15,23,42,0.9)]">
                                <p className="text-xs font-medium uppercase tracking-[0.08em] text-blue-200">
                                    Fulfillment
                                </p>
                                <div className="mt-3 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-2xl font-semibold">
                                            94.2%
                                        </p>
                                        <p className="mt-1 text-xs text-slate-300">
                                            Orders processed on time
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                                        <PackageCheck className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <StatsCard
                        title="Total Penjualan"
                        value="Rp 245M"
                        change="+12.4%"
                        note="vs last month"
                        icon={ChartNoAxesCombined}
                    />
                    <StatsCard
                        title="Total Order"
                        value="1,284"
                        change="+8.1%"
                        note="healthy order volume"
                        icon={ClipboardList}
                    />
                    <StatsCard
                        title="Total Produk"
                        value="356"
                        change="+24"
                        note="new active items"
                        icon={Boxes}
                    />
                </section>

                <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
                    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-[0_20px_50px_-36px_rgba(37,99,235,0.65)] sm:p-6">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">
                                    Store Performance
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                                    Sales Overview
                                </h2>
                            </div>
                            <p className="max-w-sm text-sm leading-6 text-slate-500">
                                Revenue and order movement across the last six
                                months.
                            </p>
                        </div>
                        <SalesChart />
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_20px_50px_-38px_rgba(37,99,235,0.65)] sm:p-6">
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-blue-700">
                                    Best Sellers
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                                    Top Products
                                </h2>
                            </div>
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                Updated today
                            </span>
                        </div>
                        <ProductTable />
                    </div>
                </section>
            </div>

            <footer className="border-t border-blue-100 bg-white py-5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-slate-500">
                        Copyright 2026 NexaTech Admin Dashboard
                    </p>
                </div>
            </footer>
        </>
    );
}

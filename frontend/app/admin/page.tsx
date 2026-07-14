"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useLanguage } from "@/context/LanguageContext";
import { fetchAdminDashboard, type AdminDashboardResponse } from "@/lib/store";

export default function DashboardPage() {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const [dashboard, setDashboard] =
        useState<AdminDashboardResponse["data"] | null>(null);
    const [dashboardLoadError, setDashboardLoadError] = useState(false);

    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(new Date()),
        [language],
    );

    const [isMounted, setIsMounted] = useState(false);

    const loadDashboard = async () => {
        let mounted = true;
        try {
            const response = await fetchAdminDashboard();
            if (mounted) {
                setDashboard(response.data);
                setDashboardLoadError(false);
            }
        } catch {
            if (mounted) {
                setDashboard(null);
                setDashboardLoadError(true);
            }
        }
    };

    useEffect(() => {
        setIsMounted(true);
        void loadDashboard();
    }, []);

    const stats = dashboard?.stats;
    const chart = dashboard?.chart ?? [];
    const topProducts = dashboard?.topProducts ?? [];

    const totalRevenueRaw = stats ? stats.totalRevenue : undefined;
    const totalOrdersRaw = stats ? stats.totalOrders : undefined;
    const totalProductsRaw = stats ? stats.totalProducts : undefined;
    const fulfillmentRateRaw = stats ? stats.fulfillmentRate : undefined;

    const totalRevenueStr = totalRevenueRaw !== undefined ? `Rp ${totalRevenueRaw.toLocaleString("id-ID")}` : "-";
    const totalOrdersStr = totalOrdersRaw !== undefined ? totalOrdersRaw.toLocaleString("id-ID") : "-";
    const totalProductsStr = totalProductsRaw !== undefined ? totalProductsRaw.toLocaleString("id-ID") : "-";
    const fulfillmentRateStr = fulfillmentRateRaw !== undefined ? `${Math.min(fulfillmentRateRaw, 100).toFixed(1)}%` : "-";

    const salesChartRevenue = totalRevenueRaw !== undefined ? totalRevenueRaw : 0;
    const salesChartOrders = totalOrdersRaw !== undefined ? totalOrdersRaw : 0;

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <section className="overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_56%,#dbeafe_100%)]">
                    <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.25fr)_320px] lg:px-8 lg:py-8">
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {t("Live admin overview")}
                                </div>
                                <button 
                                    onClick={() => loadDashboard()}
                                    className="rounded-full bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all"
                                >
                                    Force Refresh Data
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {todayLabel}
                                    </p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                        {t("Welcome back,")} {user?.name ?? "Admin"}.
                                    </h1>
                                </div>
                                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                    {t("Monitor store performance, track growth, and keep your best-selling products in focus from one calm dashboard.")}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 self-start">
                            <div className="rounded-lg border border-white/70 bg-white/85 p-4 shadow-[0_20px_44px_-34px_rgba(37,99,235,0.7)] backdrop-blur">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                        {t("Conversion")}
                                    </p>
                                        <p key={fulfillmentRateStr} className="mt-1 text-2xl font-semibold text-slate-950">
                                            {fulfillmentRateStr}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                        <ChartNoAxesCombined className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                    {t("Live sync from orders")}
                                </p>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-slate-950 p-4 text-white shadow-[0_24px_50px_-34px_rgba(15,23,42,0.9)]">
                                <p className="text-xs font-medium uppercase tracking-[0.08em] text-blue-200">
                                    {t("Fulfillment")}
                                </p>
                                <div className="mt-3 flex items-end justify-between gap-4">
                                    <div>
                                        <p key={fulfillmentRateStr} className="text-2xl font-semibold">
                                            {fulfillmentRateStr}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-300">
                                            {t("Orders processed on time")}
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
                    <div className="group rounded-lg border border-blue-100 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(37,99,235,0.45)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_44px_-26px_rgba(37,99,235,0.55)] sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500">{t("Total Sales")}</p>
                                    <h3 key={totalRevenueStr} className="text-3xl font-semibold tracking-tight text-slate-950">{totalRevenueStr}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-slate-500">{t("from completed orders")}</span>
                                </div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200 transition duration-300 group-hover:scale-105">
                                <ChartNoAxesCombined className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group rounded-lg border border-blue-100 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(37,99,235,0.45)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_44px_-26px_rgba(37,99,235,0.55)] sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500">{t("Total Orders")}</p>
                                    <h3 key={totalOrdersStr} className="text-3xl font-semibold tracking-tight text-slate-950">{totalOrdersStr}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-slate-500">{t("current backend total")}</span>
                                </div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200 transition duration-300 group-hover:scale-105">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group rounded-lg border border-blue-100 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(37,99,235,0.45)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_44px_-26px_rgba(37,99,235,0.55)] sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500">{t("Total Products")}</p>
                                    <h3 key={totalProductsStr} className="text-3xl font-semibold tracking-tight text-slate-950">{totalProductsStr}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-slate-500">{t("active catalog source")}</span>
                                </div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200 transition duration-300 group-hover:scale-105">
                                <Boxes className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </section>

                {dashboardLoadError && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Data dashboard belum dapat dimuat. Pastikan server Laravel
                        aktif, lalu muat ulang halaman.
                    </div>
                )}

                <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
                    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-[0_20px_50px_-36px_rgba(37,99,235,0.65)] sm:p-6">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">
                                    {t("Store Performance")}
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                                    {t("Sales Overview")}
                                </h2>
                            </div>
                            <p className="max-w-sm text-sm leading-6 text-slate-500">
                                {t("Revenue and order movement across the last six months.")}
                            </p>
                        </div>
                        <SalesChart
                            key={`chart-${salesChartRevenue}`}
                            data={chart}
                            totalRevenue={salesChartRevenue}
                            totalOrders={salesChartOrders}
                        />
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_20px_50px_-38px_rgba(37,99,235,0.65)] sm:p-6">
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-blue-700">
                                    {t("Best Sellers")}
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                                    {t("Top Products")}
                                </h2>
                            </div>
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                {t("Updated today")}
                            </span>
                        </div>
                        <ProductTable products={topProducts} />
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

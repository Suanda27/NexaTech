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

    useEffect(() => {
        let mounted = true;

        const loadDashboard = async () => {
            try {
                const response = await fetchAdminDashboard();

                if (mounted) {
                    setDashboard(response.data);
                }
            } catch {
                if (mounted) {
                    setDashboard({
                        stats: {
                            totalRevenue: 0,
                            totalOrders: 0,
                            totalProducts: 0,
                            fulfillmentRate: 0,
                        },
                        chart: [],
                        topProducts: [],
                    });
                }
            }
        };

        void loadDashboard();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <section className="overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_56%,#dbeafe_100%)]">
                    <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.25fr)_320px] lg:px-8 lg:py-8">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                {t("Live admin overview")}
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
                                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                                            {dashboard?.stats.totalOrders
                                                ? `${Math.min(
                                                      dashboard.stats.fulfillmentRate,
                                                      100,
                                                  ).toFixed(1)}%`
                                                : "0%"}
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
                                        <p className="text-2xl font-semibold">
                                            {(dashboard?.stats.fulfillmentRate ?? 0).toFixed(1)}%
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
                    <StatsCard
                        title={t("Total Sales")}
                        value={`Rp ${(dashboard?.stats.totalRevenue ?? 0).toLocaleString("id-ID")}`}
                        note={t("from completed orders")}
                        icon={ChartNoAxesCombined}
                    />
                    <StatsCard
                        title={t("Total Orders")}
                        value={(dashboard?.stats.totalOrders ?? 0).toLocaleString("id-ID")}
                        note={t("current backend total")}
                        icon={ClipboardList}
                    />
                    <StatsCard
                        title={t("Total Products")}
                        value={(dashboard?.stats.totalProducts ?? 0).toLocaleString("id-ID")}
                        note={t("active catalog source")}
                        icon={Boxes}
                    />
                </section>

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
                            data={dashboard?.chart ?? []}
                            totalRevenue={dashboard?.stats.totalRevenue ?? 0}
                            totalOrders={dashboard?.stats.totalOrders ?? 0}
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
                        <ProductTable products={dashboard?.topProducts ?? []} />
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

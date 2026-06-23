"use client";

import { useEffect, useState } from "react";
import {
    BadgeCheck,
    CreditCard,
    PackageSearch,
    Search,
    Sparkles,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import OrderTable from "./OrderTable";
import type { OrderItemData, OrderStatus } from "./types";
import {
    fetchAdminOrders,
    updateAdminOrder,
    type OrderData,
    type PaginationMeta,
} from "@/lib/store";
import { syncAdminOrderNotifications } from "@/lib/order-notification";

function normalizeOrder(item: OrderData): OrderItemData {
    return {
        id: item.id,
        orderNumber: item.orderNumber,
        customerName: item.customerName,
        orderDate: item.orderDate ?? "-",
        paymentDeadline: item.paymentDeadline,
        paymentMethodKey: item.paymentMethodKey,
        paymentMethod: item.paymentMethod as OrderItemData["paymentMethod"],
        paymentStatusKey: item.paymentStatusKey as OrderItemData["paymentStatusKey"],
        paymentStatus: item.paymentStatus as OrderItemData["paymentStatus"],
        statusKey: item.statusKey as OrderItemData["statusKey"],
        status: item.status as OrderItemData["status"],
        declineReason: item.declineReason,
        cancellationReason: item.cancellationReason,
        customer: item.customer,
        items: item.items.map((orderItem) => ({
            id: orderItem.id,
            productName: orderItem.productName,
            productImage: orderItem.productImage,
            quantity: orderItem.quantity,
            unitPrice: orderItem.unitPrice,
        })),
    };
}

const adminStatusMap: Record<
    OrderStatus,
    "waiting_payment" | "processing" | "shipped" | "completed" | "cancelled"
> = {
    "Waiting Payment": "waiting_payment",
    Processing: "processing",
    Shipped: "shipped",
    Completed: "completed",
    Cancelled: "cancelled",
};

export default function OrderPage() {
    const { notify } = useToast();
    const { t } = useLanguage();
    const [orders, setOrders] = useState<OrderItemData[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });
    const [summary, setSummary] = useState({
        activeOrders: 0,
        totalOrders: 0,
        completedOrders: 0,
        progressingOrders: 0,
        orderValue: 0,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Semua Status");
    const [currentPage, setCurrentPage] = useState(1);

    const loadOrders = async (page = currentPage) => {
        try {
            const response = await fetchAdminOrders({
                q: searchQuery || null,
                status: selectedStatus === "Semua Status"
                    ? null
                    : selectedStatus,
                page,
                perPage: meta.perPage,
            });
            setOrders(response.data.map(normalizeOrder));
            setSummary(response.summary);
            setMeta(response.meta);
            setCurrentPage(response.meta.currentPage);
            if (
                page === 1 &&
                !searchQuery &&
                selectedStatus === "Semua Status"
            ) {
                const orderToast = syncAdminOrderNotifications();

                if (orderToast) {
                    notify(orderToast);
                }
            }
        } catch {
            setOrders([]);
            setSummary({
                activeOrders: 0,
                totalOrders: 0,
                completedOrders: 0,
                progressingOrders: 0,
                orderValue: 0,
            });
            setMeta({
                currentPage: 1,
                lastPage: 1,
                perPage: 10,
                total: 0,
            });
        }
    };

    useEffect(() => {
        let mounted = true;

        const bootstrapOrders = async () => {
            try {
                const response = await fetchAdminOrders({
                    q: searchQuery || null,
                    status: selectedStatus === "Semua Status"
                        ? null
                        : selectedStatus,
                    page: currentPage,
                    perPage: meta.perPage,
                });

                if (!mounted) {
                    return;
                }

                setOrders(response.data.map(normalizeOrder));
                setSummary(response.summary);
                setMeta(response.meta);
                if (
                    currentPage === 1 &&
                    !searchQuery &&
                    selectedStatus === "Semua Status"
                ) {
                    const orderToast = syncAdminOrderNotifications();

                    if (orderToast) {
                        notify(orderToast);
                    }
                }
            } catch {
                if (!mounted) {
                    return;
                }

                setOrders([]);
                setSummary({
                    activeOrders: 0,
                    totalOrders: 0,
                    completedOrders: 0,
                    progressingOrders: 0,
                    orderValue: 0,
                });
                setMeta({
                    currentPage: 1,
                    lastPage: 1,
                    perPage: 10,
                    total: 0,
                });
            }
        };

        void bootstrapOrders();

        return () => {
            mounted = false;
        };
    }, [currentPage, meta.perPage, notify, searchQuery, selectedStatus]);

    const handleUpdateOrder = async (
        orderId: string,
        updates: Partial<
            Pick<
                OrderItemData,
                | "status"
                | "paymentStatus"
                | "declineReason"
                | "cancellationReason"
            >
        >,
    ): Promise<void> => {
        if (!updates.status && !updates.paymentStatus) {
            return;
        }

        const statusKey = updates.status
            ? adminStatusMap[updates.status]
            : undefined;

        try {
            const response = await updateAdminOrder(orderId, {
                status: statusKey === "shipped" ? statusKey : undefined,
            });
            await loadOrders(currentPage);
            notify({
                tone: "success",
                title: t("Order updated successfully"),
                message: t(response.message),
            });
        } catch (error) {
            notify({
                tone: "error",
                title: t("Failed to update order"),
                message:
                    error instanceof Error
                        ? t(error.message)
                        : t("Failed to update order."),
            });
        }
    };

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_58%,#dbeafe_100%)]">
                <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:px-8">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            {t("Refined order management")}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {t("Sales operation")}
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    {t("Order Management")}
                                </h1>
                            </div>
                            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                                {t("Orders now follow a single status flow from waiting payment to processing, shipped, completed, or cancelled.")}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 self-start">
                        <div className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-[0_20px_40px_-34px_rgba(37,99,235,0.7)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                        {t("Active Orders")}
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                                        {summary.activeOrders}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-slate-950 p-4 text-white shadow-[0_24px_50px_-34px_rgba(15,23,42,0.9)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-blue-200">
                                        {t("Order Summary")}
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {summary.totalOrders} {t("orders")}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                                    <BadgeCheck className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-slate-300">
                                {summary.progressingOrders} {t("waiting payment/processing/shipped")},{" "}
                                {summary.completedOrders} {t("completed")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-lg border border-blue-100 bg-white p-5 shadow-[0_20px_50px_-38px_rgba(37,99,235,0.55)] sm:p-6">
                <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                                    <PackageSearch className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                        {t("Total Value")}
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-slate-950">
                                        Rp {summary.orderValue.toLocaleString("id-ID")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                {t("Completed")}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">
                                {summary.completedOrders}
                            </p>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                {t("Waiting / Processing / Shipped")}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">
                                {summary.progressingOrders}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="flex h-12 min-w-0 items-center rounded-lg border border-blue-100 bg-slate-50 px-4 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                            <Search className="h-4 w-4 shrink-0 text-blue-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder={t("Search order ID or customer name...")}
                                className="h-full w-full bg-transparent pl-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                            />
                        </div>

                        <select
                            value={selectedStatus}
                            onChange={(event) => {
                                setSelectedStatus(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-12 rounded-lg border border-blue-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="Semua Status">{t("All Statuses")}</option>
                            <option value="waiting_payment">{t("Waiting Payment")}</option>
                            <option value="processing">{t("Processing")}</option>
                            <option value="shipped">{t("Shipped")}</option>
                            <option value="completed">{t("Completed")}</option>
                            <option value="cancelled">{t("Cancelled")}</option>
                        </select>
                    </div>
                </div>

                <OrderTable
                    orders={orders}
                    onUpdateOrder={handleUpdateOrder}
                />

                <div className="mt-4 flex flex-col gap-3 border-t border-blue-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {t("Showing")} {orders.length} {t("orders")} {t("from total")} {meta.total} {t("data entries")}.
                    </p>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                            disabled={meta.currentPage <= 1}
                            className="rounded-lg border border-blue-100 bg-white px-3 py-2 font-medium text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t("Previous")}
                        </button>
                        <span className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-700">
                            {t("Page")} {meta.currentPage} / {meta.lastPage}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.min(page + 1, meta.lastPage),
                                )
                            }
                            disabled={meta.currentPage >= meta.lastPage}
                            className="rounded-lg border border-blue-100 bg-white px-3 py-2 font-medium text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t("Next")}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

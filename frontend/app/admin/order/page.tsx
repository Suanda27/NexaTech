"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BadgeCheck,
    CreditCard,
    PackageSearch,
    Search,
    Sparkles,
} from "lucide-react";
import OrderTable from "./OrderTable";
import type { OrderItemData } from "./types";
import { fetchAdminOrders, updateAdminOrder, type OrderData } from "@/lib/store";

function normalizeOrder(item: OrderData): OrderItemData {
    return {
        id: item.id,
        orderNumber: item.orderNumber,
        customerName: item.customerName,
        orderDate: item.orderDate ?? "-",
        paymentMethod: item.paymentMethod as OrderItemData["paymentMethod"],
        paymentStatus: item.paymentStatus as OrderItemData["paymentStatus"],
        status: item.status as OrderItemData["status"],
        declineReason: item.declineReason,
        paymentProofImage: item.paymentProofImage,
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

export default function OrderPage() {
    const [orders, setOrders] = useState<OrderItemData[]>([]);
    const [summary, setSummary] = useState({
        paidOrders: 0,
        totalOrders: 0,
        deliveredOrders: 0,
        progressingOrders: 0,
        orderValue: 0,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Semua Status");

    const loadOrders = async () => {
        try {
            const response = await fetchAdminOrders();
            setOrders(response.data.map(normalizeOrder));
            setSummary(response.summary);
        } catch {
            setOrders([]);
            setSummary({
                paidOrders: 0,
                totalOrders: 0,
                deliveredOrders: 0,
                progressingOrders: 0,
                orderValue: 0,
            });
        }
    };

    useEffect(() => {
        void loadOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                order.orderNumber
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                order.customerName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesStatus =
                selectedStatus === "Semua Status" || order.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, selectedStatus]);

    const handleUpdateOrder = async (
        orderId: string,
        updates: Partial<
            Pick<OrderItemData, "status" | "paymentStatus" | "declineReason">
        >,
    ) => {
        if (!updates.status) {
            return;
        }

        const statusKey = {
            Progressing: "progressing",
            Delivered: "delivered",
            Declined: "declined",
            Cancelled: "cancelled",
        }[updates.status] as "progressing" | "delivered" | "declined" | "cancelled";

        try {
            await updateAdminOrder(orderId, {
                status: statusKey,
                decline_reason: updates.declineReason ?? null,
            });
            await loadOrders();
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui order.",
            );
        }
    };

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_58%,#dbeafe_100%)]">
                <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:px-8">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            Refined order management
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Sales operation
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    Manajemen Order
                                </h1>
                            </div>
                            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                                Semua order sekarang dibaca langsung dari database,
                                termasuk payment proof, status pembayaran, dan
                                produk yang dipesan.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 self-start">
                        <div className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-[0_20px_40px_-34px_rgba(37,99,235,0.7)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                        Paid Orders
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                                        {summary.paidOrders}
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
                                        Order Summary
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {summary.totalOrders} orders
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                                    <BadgeCheck className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-slate-300">
                                {summary.progressingOrders} progressing,{" "}
                                {summary.deliveredOrders} delivered
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
                                        Total Value
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-slate-950">
                                        Rp {summary.orderValue.toLocaleString("id-ID")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                Delivered
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">
                                {summary.deliveredOrders}
                            </p>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                Progressing
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
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Cari ID order atau nama customer..."
                                className="h-full w-full bg-transparent pl-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                            />
                        </div>

                        <select
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                            className="h-12 rounded-lg border border-blue-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="Semua Status">Semua Status</option>
                            <option value="Progressing">Progressing</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Declined">Declined</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <OrderTable
                    orders={filteredOrders}
                    onUpdateOrder={handleUpdateOrder}
                />
            </section>
        </div>
    );
}

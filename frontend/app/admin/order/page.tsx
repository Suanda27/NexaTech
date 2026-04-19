"use client";

import { useMemo, useState } from "react";
import {
    BadgeCheck,
    CreditCard,
    PackageSearch,
    Search,
    Sparkles,
} from "lucide-react";
import OrderTable from "./OrderTable";
import type { OrderItemData } from "./types";
import { getOrderTotal } from "./utils";

const initialOrders: OrderItemData[] = [
    {
        id: "1",
        orderNumber: "#ORD-3021",
        customerName: "Nadia Putri",
        orderDate: "19 Apr 2026",
        paymentMethod: "Bank Transfer",
        paymentStatus: "Paid",
        status: "Delivered",
        declineReason: null,
        paymentProofImage:
            "https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1080",
        customer: {
            firstName: "Nadia",
            lastName: "Putri",
            address: "Jl. Melati Indah No. 24",
            city: "Bandung",
            postalCode: "40123",
        },
        items: [
            {
                id: "i1",
                productName: "NexaBook Pro 16",
                productImage:
                    "https://images.unsplash.com/photo-1658262530868-f7460e2f071f?q=80&w=1080",
                quantity: 1,
                unitPrice: 14999000,
            },
        ],
    },
    {
        id: "2",
        orderNumber: "#ORD-3020",
        customerName: "Bagas Mahendra",
        orderDate: "18 Apr 2026",
        paymentMethod: "Bank Transfer",
        paymentStatus: "Unpaid",
        status: "Progressing",
        declineReason: null,
        paymentProofImage: null,
        customer: {
            firstName: "Bagas",
            lastName: "Mahendra",
            address: "Perumahan Harmoni Blok C7",
            city: "Yogyakarta",
            postalCode: "55281",
        },
        items: [
            {
                id: "i2",
                productName: "Orbit Dock Prime",
                productImage:
                    "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1080",
                quantity: 1,
                unitPrice: 1899000,
            },
            {
                id: "i3",
                productName: "Auralux Studio Max",
                productImage:
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1080",
                quantity: 1,
                unitPrice: 3299000,
            },
        ],
    },
    {
        id: "3",
        orderNumber: "#ORD-3019",
        customerName: "Salsa Amalia",
        orderDate: "17 Apr 2026",
        paymentMethod: "COD",
        paymentStatus: "Unpaid",
        status: "Progressing",
        declineReason: null,
        paymentProofImage: null,
        customer: {
            firstName: "Salsa",
            lastName: "Amalia",
            address: "Jl. Kenanga Permai No. 8",
            city: "Surabaya",
            postalCode: "60231",
        },
        items: [
            {
                id: "i4",
                productName: "VisionPad Ultra",
                productImage:
                    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1080",
                quantity: 1,
                unitPrice: 8799000,
            },
        ],
    },
    {
        id: "4",
        orderNumber: "#ORD-3018",
        customerName: "Rizky Ananda",
        orderDate: "16 Apr 2026",
        paymentMethod: "COD",
        paymentStatus: "Unpaid",
        status: "Declined",
        declineReason:
            "Alamat pengiriman tidak lengkap dan customer belum memberikan konfirmasi tambahan.",
        paymentProofImage: null,
        customer: {
            firstName: "Rizky",
            lastName: "Ananda",
            address: "Jl. Cemara Hijau No. 12",
            city: "Semarang",
            postalCode: "50141",
        },
        items: [
            {
                id: "i5",
                productName: "Auralux Studio Max",
                productImage:
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1080",
                quantity: 2,
                unitPrice: 3299000,
            },
        ],
    },
    {
        id: "5",
        orderNumber: "#ORD-3017",
        customerName: "Dinda Safira",
        orderDate: "15 Apr 2026",
        paymentMethod: "Bank Transfer",
        paymentStatus: "Unpaid",
        status: "Cancelled",
        declineReason: null,
        paymentProofImage: null,
        customer: {
            firstName: "Dinda",
            lastName: "Safira",
            address: "Cluster Anggrek Residence A2",
            city: "Jakarta",
            postalCode: "11730",
        },
        items: [
            {
                id: "i6",
                productName: "NexaBook Pro 16",
                productImage:
                    "https://images.unsplash.com/photo-1658262530868-f7460e2f071f?q=80&w=1080",
                quantity: 1,
                unitPrice: 14999000,
            },
        ],
    },
];

export default function OrderPage() {
    const [orders, setOrders] = useState<OrderItemData[]>(initialOrders);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Semua Status");

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

    const deliveredOrders = useMemo(
        () => orders.filter((order) => order.status === "Delivered").length,
        [orders],
    );

    const progressingOrders = useMemo(
        () => orders.filter((order) => order.status === "Progressing").length,
        [orders],
    );

    const paidOrders = useMemo(
        () => orders.filter((order) => order.paymentStatus === "Paid").length,
        [orders],
    );

    const orderValue = useMemo(
        () =>
            orders.reduce((sum, order) => sum + getOrderTotal(order.items), 0),
        [orders],
    );

    const handleUpdateOrder = (
        orderId: string,
        updates: Partial<
            Pick<OrderItemData, "status" | "paymentStatus" | "declineReason">
        >,
    ) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, ...updates } : order,
            ),
        );
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
                                Pantau pesanan customer, verifikasi pembayaran,
                                dan kelola status order dengan tampilan yang lebih
                                lega, rapi, dan nyaman dilihat.
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
                                        {paidOrders}
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
                                        {orders.length} orders
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                                    <BadgeCheck className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-slate-300">
                                {progressingOrders} progressing, {deliveredOrders} delivered
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
                                        Rp {orderValue.toLocaleString("id-ID")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                Delivered
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">
                                {deliveredOrders}
                            </p>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                Progressing
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">
                                {progressingOrders}
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

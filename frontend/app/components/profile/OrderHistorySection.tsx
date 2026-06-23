"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { fetchOrders, type OrderData } from "@/lib/store";

export default function OrderHistorySection() {
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadOrders = async () => {
            try {
                const response = await fetchOrders();

                if (mounted) {
                    setOrders(response.data);
                }
            } catch {
                if (mounted) {
                    setOrders([]);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadOrders();

        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => orders.filter((order) => order.paymentMethodKey === "midtrans"), [orders]);

    return (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
                Order History
            </h2>

            {/* Showing Midtrans orders only */}

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-lg border border-blue-100 bg-blue-50"
                        />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 px-6 py-12 text-center">
                    <p className="font-semibold text-slate-950">
                        Belum ada order untuk metode ini
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Pesanan yang dibuat customer akan muncul dari backend.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((order) => (
                        <div
                            key={order.id}
                            className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-slate-950">
                                        {order.orderNumber}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {order.orderDate} - {order.status}
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-blue-700">
                                    Rp {order.summary.total.toLocaleString("id-ID")}
                                </p>
                            </div>

                            <div className="mt-4 grid gap-3">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                                    >
                                        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                            {item.productImage ? (
                                                <Image
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    fill
                                                    sizes="48px"
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Package className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-slate-950">
                                                {item.productName}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Qty {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

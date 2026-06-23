"use client";

import { useState } from "react";
import { Calendar, ChevronDown, CreditCard, Package } from "lucide-react";
import { OrderStatus, OrderType } from "@/app/types/order";

export default function OrderCard({ order }: { order: OrderType }) {
    const [open, setOpen] = useState(false);

    const badge: Record<OrderStatus, string> = {
        Processing: "bg-blue-50 text-blue-700 ring-blue-200",
        "Waiting Payment": "bg-amber-50 text-amber-700 ring-amber-200",
        Shipped: "bg-sky-50 text-sky-700 ring-sky-200",
        Completed: "bg-green-50 text-green-700 ring-green-200",
        Cancelled: "bg-red-50 text-red-700 ring-red-200",
    };

    return (
        <div className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/50 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70">
            <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:justify-between">
                <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />

                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                            <Package size={20} />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-950">
                                Order #{order.id}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Order ID: MIDTRANS-2026-{order.id}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-700">
                        <span className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
                            <Calendar size={14} />
                            {order.date}
                        </span>
                        <span className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-blue-700 ring-1 ring-blue-100">
                            <CreditCard size={14} />
                            Midtrans
                        </span>
                    </div>

                    <div className="mt-5 flex gap-2">
                        {order.items.slice(0, 2).map((item, index) => (
                            <img
                                key={`${item.name}-${index}`}
                                src={item.image}
                                alt={item.name}
                                className="h-14 w-14 rounded-lg border border-white object-cover shadow-md ring-1 ring-blue-100"
                            />
                        ))}
                    </div>
                </div>

                <div className="sm:text-right">
                    <span
                        className={`inline-flex rounded-lg px-3 py-1 text-sm font-semibold ring-1 ${badge[order.status]}`}
                    >
                        {order.status}
                    </span>

                    <p className="mt-5 text-sm text-gray-600">Total Price</p>
                    <p className="text-2xl font-bold tracking-tight text-blue-700">
                        ${order.total}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex w-full items-center justify-center gap-2 border-t border-blue-50 bg-gray-50/70 py-3 text-sm font-semibold text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
                <ChevronDown
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                    size={16}
                />
                {open ? "Hide Details" : "Show Details"}
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ${
                    open ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="space-y-6 px-6 pb-6">
                    <section>
                        <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <CreditCard size={17} />
                            </span>
                            Payment Details
                        </h4>

                        <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-5 shadow-inner">
                            <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between">
                                <span className="text-sm text-gray-600">
                                    Payment Method:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    Midtrans
                                </span>
                            </div>
                            <div className="mt-2 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-gray-600">
                                    Payment Status:
                                </span>
                                <span className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Package size={17} />
                            </span>
                            Order Items
                        </h4>

                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div
                                    key={`${item.name}-${index}`}
                                    className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-16 w-16 rounded-lg border border-white object-cover shadow-sm ring-1 ring-gray-200"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {item.name}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            Quantity: {item.qty}
                                        </p>
                                        <p className="font-semibold text-blue-600">
                                            ${item.price}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

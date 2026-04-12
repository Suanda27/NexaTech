"use client";

import { useState } from "react";
import {
    Calendar,
    CreditCard,
    AlertCircle,
    Package,
    ChevronDown,
} from "lucide-react";
import { OrderType, OrderStatus } from "@/app/types/order";
import { CancelConfirmModal } from "./CancelConfirmModal";

export default function OrderCard({ order }: { order: OrderType }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [submittedReason, setSubmittedReason] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState<OrderStatus>(order.status);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const badge: Record<OrderStatus, string> = {
        Processing: "bg-blue-100 text-blue-600",
        Delivered: "bg-green-100 text-green-600",
        Declined: "bg-red-100 text-red-600",
        Cancelled: "bg-red-100 text-red-600",
    };

    return (
        <>
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-300">
                {/* HEADER */}
                <div className="p-6 flex justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">
                            Order #{order.id}
                        </h3>

                        <p className="text-sm text-gray-600 mt-1">
                            Order ID: {order.method.toUpperCase()}-2026-
                            {order.id}
                        </p>

                        <div className="flex gap-4 mt-3 text-sm text-gray-700">
                            <span className="flex gap-1 items-center">
                                <Calendar size={14} />
                                {order.date}
                            </span>

                            <span className="flex gap-1 items-center">
                                <CreditCard size={14} />
                                {order.method === "bank"
                                    ? "Bank Transfer"
                                    : "Cash on Delivery"}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-4">
                            {order.items.slice(0, 2).map((item, i) => (
                                <img
                                    key={i}
                                    src={item.image}
                                    className="w-14 h-14 rounded-lg border object-cover"
                                />
                            ))}
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                Payment Status
                            </p>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    order.isPaid
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                            >
                                {order.isPaid ? "Paid" : "Unpaid"}
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${badge[status]}`}
                        >
                            {status}
                        </span>

                        <p className="text-gray-600 text-sm mt-5">
                            Total Price
                        </p>
                        <p className="text-blue-600 font-bold text-lg">
                            ${order.total}
                        </p>
                    </div>
                </div>

                {/* TOGGLE */}
                <div
                    onClick={() => setOpen(!open)}
                    className="flex justify-center items-center gap-2 py-3 text-sm text-gray-700 cursor-pointer hover:text-black transition"
                >
                    <ChevronDown
                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                        size={16}
                    />
                    {open ? "Hide Details" : "Show Details"}
                </div>

                {/* DETAILS */}
                <div
                    className={`transition-all duration-300 overflow-hidden ${
                        open
                            ? "max-h-[1500px] opacity-100"
                            : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="px-6 pb-6 space-y-6">
                        {/* PAYMENT DETAILS */}
                        <div>
                            <h4 className="flex items-center gap-2 font-semibold text-gray-900 text-base mb-3">
                                <CreditCard size={18} />
                                Payment Details
                            </h4>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600 text-sm">
                                        Payment Method:
                                    </span>
                                    <span className="font-semibold text-gray-900 text-sm">
                                        {order.method === "bank"
                                            ? "Bank Transfer"
                                            : "Cash on Delivery"}
                                    </span>
                                </div>

                                {order.method === "bank" && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600 text-sm">
                                            Bank Account:
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm">
                                            BCA: 1234567890
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between py-2 border-t mt-2 pt-3">
                                    <span className="text-gray-600 text-sm">
                                        Payment Status:
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            order.isPaid
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                                        {order.isPaid ? "Paid" : "Unpaid"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ORDER ITEMS */}
                        <div>
                            <h4 className="flex items-center gap-2 font-semibold text-gray-900 text-base mb-3">
                                <Package size={18} />
                                Order Items
                            </h4>

                            <div className="space-y-3">
                                {order.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4"
                                    >
                                        <img
                                            src={item.image}
                                            className="w-16 h-16 rounded-lg object-cover border"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {item.name}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                Quantity: {item.qty}
                                            </p>
                                            <p className="text-blue-600 font-semibold">
                                                ${item.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CANCEL */}
                        {status === "Processing" &&
                            (order.method === "bank" ||
                                order.method === "cod") &&
                            !submittedReason && (
                                <>
                                    {!showCancelForm ? (
                                        <button
                                            onClick={() =>
                                                setShowCancelForm(true)
                                            }
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
                                        >
                                            Cancel Order
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <textarea
                                                placeholder="Enter your reason for cancellation..."
                                                value={reason}
                                                onChange={(e) =>
                                                    setReason(e.target.value)
                                                }
                                                className="w-full border border-gray-300 rounded-xl p-4 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            />

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() =>
                                                        setShowConfirm(true)
                                                    }
                                                    className="flex-1 bg-red-600 text-white py-3 rounded-xl"
                                                >
                                                    Submit Cancel
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setShowCancelForm(false)
                                                    }
                                                    className="flex-1 border rounded-xl"
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                        {/* RESULT */}
                        {submittedReason && (
                            <div className="bg-red-50 border border-red-300 p-4 rounded-xl flex gap-3">
                                <AlertCircle
                                    className="text-red-600"
                                    size={18}
                                />
                                <div>
                                    <p className="text-red-700 font-semibold">
                                        Cancellation Reason:
                                    </p>
                                    <p className="text-red-600 text-sm">
                                        {submittedReason}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <CancelConfirmModal
                open={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={() => {
                    setSubmittedReason(reason);
                    setStatus("Cancelled");
                    setShowConfirm(false);

                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                }}
            />

            {/* TOAST */}
            {showToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white shadow-md px-6 py-3 rounded-xl">
                    ✔ Your order has been cancelled successfully
                </div>
            )}
        </>
    );
}

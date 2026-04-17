"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
    Calendar,
    CreditCard,
    AlertCircle,
    Package,
    ChevronDown,
    Upload,
    X,
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
    const [showUploadToast, setShowUploadToast] = useState(false);
    const [paymentProof, setPaymentProof] = useState<{
        name: string;
        previewUrl: string;
    } | null>(null);
    const paymentProofInputRef = useRef<HTMLInputElement>(null);

    const badge: Record<OrderStatus, string> = {
        Processing: "bg-blue-50 text-blue-700 ring-blue-200",
        Delivered: "bg-green-50 text-green-700 ring-green-200",
        Declined: "bg-red-50 text-red-700 ring-red-200",
        Cancelled: "bg-red-50 text-red-700 ring-red-200",
    };

    const paymentMethodLabel =
        order.method === "bank" ? "Bank Transfer" : "Cash on Delivery";

    useEffect(() => {
        return () => {
            if (paymentProof?.previewUrl) {
                URL.revokeObjectURL(paymentProof.previewUrl);
            }
        };
    }, [paymentProof?.previewUrl]);

    const handlePaymentProofChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setPaymentProof((previousProof) => {
            if (previousProof?.previewUrl) {
                URL.revokeObjectURL(previousProof.previewUrl);
            }

            return {
                name: file.name,
                previewUrl: URL.createObjectURL(file),
            };
        });

        setShowUploadToast(true);
        setTimeout(() => setShowUploadToast(false), 3000);
    };

    const handleCancelPaymentProof = () => {
        if (paymentProof?.previewUrl) {
            URL.revokeObjectURL(paymentProof.previewUrl);
        }

        setPaymentProof(null);
        setShowUploadToast(false);

        if (paymentProofInputRef.current) {
            paymentProofInputRef.current.value = "";
        }
    };

    return (
        <>
            <div className="group overflow-hidden border border-blue-100 rounded-lg bg-white shadow-sm shadow-blue-100/50 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70">
                {/* HEADER */}
                <div className="relative p-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                <Package size={20} />
                            </div>

                            <div>
                                <h3 className="font-bold text-lg text-gray-950">
                                    Order #{order.id}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Order ID: {order.method.toUpperCase()}-
                                    2026-{order.id}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4 text-sm text-gray-700">
                            <span className="flex gap-2 items-center rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
                                <Calendar size={14} />
                                {order.date}
                            </span>

                            <span className="flex gap-2 items-center rounded-lg bg-blue-50 px-3 py-2 text-blue-700 ring-1 ring-blue-100">
                                <CreditCard size={14} />
                                {paymentMethodLabel}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-5">
                            {order.items.slice(0, 2).map((item, i) => (
                                <img
                                    key={i}
                                    src={item.image}
                                    alt={item.name}
                                    className="w-14 h-14 rounded-lg border border-white object-cover shadow-md ring-1 ring-blue-100"
                                />
                            ))}
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                Payment Status
                            </p>
                            <span
                                className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ring-1 ${
                                    order.isPaid
                                        ? "bg-green-50 text-green-700 ring-green-200"
                                        : "bg-gray-50 text-gray-700 ring-gray-200"
                                }`}
                            >
                                {order.isPaid ? "Paid" : "Unpaid"}
                            </span>
                        </div>
                    </div>

                    <div className="sm:text-right">
                        <span
                            className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold ring-1 ${badge[status]}`}
                        >
                            {status}
                        </span>

                        <p className="text-gray-600 text-sm mt-5">
                            Total Price
                        </p>
                        <p className="text-blue-700 font-bold text-2xl tracking-tight">
                            ${order.total}
                        </p>
                    </div>
                </div>

                {/* TOGGLE */}
                <div
                    onClick={() => setOpen(!open)}
                    className="flex justify-center items-center gap-2 border-t border-blue-50 bg-gray-50/70 py-3 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
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
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <CreditCard size={17} />
                                </span>
                                Payment Details
                            </h4>

                            <div className="bg-gray-50/80 border border-gray-200 rounded-lg p-5 shadow-inner">
                                <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between">
                                    <span className="text-gray-600 text-sm">
                                        Payment Method:
                                    </span>
                                    <span className="font-semibold text-gray-900 text-sm">
                                        {paymentMethodLabel}
                                    </span>
                                </div>

                                {order.method === "bank" && (
                                    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between">
                                        <span className="text-gray-600 text-sm">
                                            Bank Account:
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm">
                                            BCA: 1234567890
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 py-2 border-t mt-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-gray-600 text-sm">
                                        Payment Status:
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold ring-1 ${
                                            order.isPaid
                                                ? "bg-green-50 text-green-700 ring-green-200"
                                                : "bg-white text-gray-700 ring-gray-200"
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
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Package size={17} />
                                </span>
                                Order Items
                            </h4>

                            <div className="space-y-3">
                                {order.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover border border-white shadow-sm ring-1 ring-gray-200"
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
                                        <div className="space-y-3">
                                            <button
                                                onClick={() =>
                                                    setShowCancelForm(true)
                                                }
                                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold shadow-sm shadow-red-100 transition hover:-translate-y-0.5 hover:shadow-md"
                                            >
                                                Cancel Order
                                            </button>

                                            {order.method === "bank" && (
                                                <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-4 shadow-sm">
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                Upload Payment
                                                                Proof
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Add your
                                                                transfer
                                                                receipt so we
                                                                can verify the
                                                                payment.
                                                            </p>
                                                        </div>

                                                        <div className="bg-white text-blue-600 border border-blue-100 rounded-lg p-2 shadow-sm">
                                                            <Upload size={18} />
                                                        </div>
                                                    </div>

                                                    <label className="group/upload flex flex-col items-center justify-center gap-2 border border-dashed border-blue-300 bg-white rounded-lg px-4 py-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                                                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover/upload:bg-blue-600 group-hover/upload:text-white transition">
                                                            <Upload
                                                                size={20}
                                                            />
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            Choose payment
                                                            photo
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            JPG, PNG, or WEBP
                                                            image
                                                        </span>
                                                        <input
                                                            ref={
                                                                paymentProofInputRef
                                                            }
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={
                                                                handlePaymentProofChange
                                                            }
                                                            className="hidden"
                                                        />
                                                    </label>

                                                    {paymentProof && (
                                                        <div className="mt-3 overflow-hidden bg-white border border-green-200 rounded-lg shadow-sm">
                                                            <div className="flex items-center gap-3 p-3">
                                                                <img
                                                                    src={
                                                                        paymentProof.previewUrl
                                                                    }
                                                                    alt="Payment proof preview"
                                                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                                                />
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                                        {
                                                                            paymentProof.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-green-600 font-medium mt-1">
                                                                        Payment
                                                                        proof
                                                                        selected
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        handleCancelPaymentProof
                                                                    }
                                                                    className="ml-auto flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                                                                >
                                                                    <X
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    Cancel
                                                                </button>
                                                            </div>

                                                            <div className="bg-green-50 border-t border-green-100 px-3 py-2">
                                                                <p className="text-xs text-green-700">
                                                                    Your photo
                                                                    is ready to
                                                                    be submitted
                                                                    for review.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <textarea
                                                placeholder="Enter your reason for cancellation..."
                                                value={reason}
                                                onChange={(e) =>
                                                    setReason(e.target.value)
                                                }
                                                className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                            />

                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <button
                                                    onClick={() =>
                                                        setShowConfirm(true)
                                                    }
                                                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold shadow-sm transition hover:bg-red-700"
                                                >
                                                    Submit Cancel
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setShowCancelForm(false)
                                                    }
                                                    className="flex-1 border border-gray-200 rounded-lg font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex gap-3 shadow-sm">
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
                <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg border border-green-200 bg-white px-6 py-3 text-sm font-semibold text-green-700 shadow-lg shadow-green-100">
                    ✔ Your order has been cancelled successfully
                </div>
            )}
            {showUploadToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-100">
                    Payment proof is ready to upload
                </div>
            )}
        </>
    );
}

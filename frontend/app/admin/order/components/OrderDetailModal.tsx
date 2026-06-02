"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BadgeCheck,
    Ban,
    CreditCard,
    Eye,
    MapPin,
    ReceiptText,
    ShieldAlert,
    Truck,
    UserRound,
    X,
} from "lucide-react";
import { fetchAdminOrderDetail, type OrderData } from "@/lib/store";
import type { OrderItemData, OrderPaymentStatus, OrderStatus } from "../types";
import {
    formatPrice,
    getOrderTotal,
    getPaymentMethodClasses,
    getPaymentStatusClasses,
    getStatusClasses,
} from "../utils";
import {
    getOrderStatusLabel,
    getPaymentStatusLabel,
} from "@/lib/order-status";

function mapOrderDetail(item: OrderData): OrderItemData {
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
        paymentRejectionReason: item.paymentRejectionReason,
        cancellationReason: item.cancellationReason,
        paymentProofImage: item.paymentProofImage ?? null,
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

type OrderDetailModalProps = {
    isOpen: boolean;
    order: OrderItemData | null;
    onClose: () => void;
    onUpdateOrder: (
        orderId: string,
        updates: Partial<
            Pick<
                OrderItemData,
                | "status"
                | "paymentStatus"
                | "declineReason"
                | "paymentRejectionReason"
                | "cancellationReason"
            >
        >,
    ) => Promise<void>;
};

export default function OrderDetailModal({
    isOpen,
    order,
    onClose,
    onUpdateOrder,
}: OrderDetailModalProps) {
    const [detailOrder, setDetailOrder] = useState<OrderItemData | null>(order);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [paymentRejectionReason, setPaymentRejectionReason] = useState(
        order?.paymentRejectionReason ?? "",
    );
    const [cancellationReason, setCancellationReason] = useState(
        order?.cancellationReason ?? "",
    );
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        setDetailOrder(order);
        setPaymentRejectionReason(order?.paymentRejectionReason ?? "");
        setCancellationReason(order?.cancellationReason ?? "");
    }, [
        order,
        order?.id,
        order?.paymentDeadline,
        order?.paymentMethod,
        order?.paymentStatus,
        order?.status,
        order?.paymentRejectionReason,
        order?.cancellationReason,
    ]);

    useEffect(() => {
        if (!isOpen || !order) {
            return;
        }

        let active = true;

        const loadOrderDetail = async () => {
            setIsDetailLoading(true);

            try {
                const response = await fetchAdminOrderDetail(order.id);

                if (!active) {
                    return;
                }

                const mappedOrder = mapOrderDetail(response.data);
                setDetailOrder(mappedOrder);
                setPaymentRejectionReason(
                    mappedOrder.paymentRejectionReason ?? "",
                );
                setCancellationReason(mappedOrder.cancellationReason ?? "");
            } catch {
                if (!active) {
                    return;
                }

                setDetailOrder(order);
            } finally {
                if (active) {
                    setIsDetailLoading(false);
                }
            }
        };

        void loadOrderDetail();

        return () => {
            active = false;
        };
    }, [
        isOpen,
        order,
        order?.id,
        order?.paymentStatus,
        order?.status,
        order?.paymentRejectionReason,
        order?.cancellationReason,
    ]);

    const currentOrder = detailOrder ?? order;

    const total = useMemo(
        () => (currentOrder ? getOrderTotal(currentOrder.items) : 0),
        [currentOrder],
    );

    if (!isOpen || !currentOrder) {
        return null;
    }

    const canApprovePayment =
        currentOrder.paymentMethodKey === "bank_transfer" &&
        currentOrder.paymentStatusKey === "waiting_verification";
    const canRejectPayment =
        currentOrder.paymentMethodKey === "bank_transfer" &&
        currentOrder.paymentStatusKey === "waiting_verification";
    const canCancel =
        currentOrder.statusKey !== "delivered" &&
        currentOrder.statusKey !== "cancelled" &&
        currentOrder.paymentStatusKey !== "expired";
    const canDeliver =
        currentOrder.statusKey === "processing" &&
        (currentOrder.paymentMethodKey === "cod" ||
            currentOrder.paymentStatusKey === "paid");

    const handleStatusUpdate = async (
        status?: OrderStatus,
        paymentStatus?: OrderPaymentStatus,
    ) => {
        setIsActionLoading(true);

        try {
            if (paymentStatus === "Rejected") {
                const reason =
                    paymentRejectionReason.trim() ||
                    "Payment could not be verified.";

                await onUpdateOrder(currentOrder.id, {
                    paymentStatus,
                    paymentRejectionReason: reason,
                });
                return;
            }

            if (paymentStatus === "Paid") {
                await onUpdateOrder(currentOrder.id, {
                    paymentStatus,
                });
                return;
            }

            if (status === "Cancelled") {
                await onUpdateOrder(currentOrder.id, {
                    status,
                    cancellationReason: cancellationReason.trim() || null,
                });
                return;
            }

            if (status === "Delivered") {
                await onUpdateOrder(currentOrder.id, {
                    status,
                });
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-6xl rounded-lg border border-blue-100 bg-white p-6 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.55)] sm:max-h-[calc(100dvh-4rem)] sm:overflow-y-auto sm:p-7"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-blue-100 pb-5">
                    <div>
                        <p className="text-sm font-semibold text-blue-700">
                            Order Detail
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                            {currentOrder.orderNumber}
                        </h2>
                            <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                {currentOrder.customerName}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getPaymentMethodClasses(
                                    currentOrder.paymentMethod,
                                )}`}
                            >
                                {currentOrder.paymentMethod}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getPaymentStatusClasses(
                                    currentOrder.paymentStatus,
                                )}`}
                            >
                                {getPaymentStatusLabel(currentOrder.paymentStatusKey)}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getStatusClasses(
                                    currentOrder.status,
                                )}`}
                            >
                                {getOrderStatusLabel(currentOrder.statusKey)}
                            </span>
                            </div>
                            {currentOrder.paymentMethodKey === "bank_transfer" &&
                                currentOrder.paymentDeadline && (
                                    <p className="mt-3 text-sm font-medium text-amber-700">
                                        Deadline pembayaran: {currentOrder.paymentDeadline}
                                    </p>
                                )}
                        </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
                    <div className="space-y-6">
                        <section className="grid gap-4 rounded-lg border border-blue-100 bg-white p-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <p className="text-sm font-semibold text-blue-700">
                                    Customer Details
                                </p>
                                <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                                    Informasi Pelanggan
                                </h3>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <UserRound className="h-4 w-4 text-blue-600" />
                                    Customer Name
                                </div>
                                <p className="mt-3 text-sm text-slate-600">
                                    {currentOrder.customer.firstName}{" "}
                                    {currentOrder.customer.lastName}
                                </p>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                    Payment Method
                                </div>
                                <p className="mt-3 text-sm text-slate-600">
                                    {currentOrder.paymentMethod}
                                </p>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 md:col-span-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    Shipping Address
                                </div>
                                <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                    <p>{currentOrder.customer.address}</p>
                                    <div className="space-y-1">
                                        <p>City: {currentOrder.customer.city}</p>
                                        <p>Postal Code: {currentOrder.customer.postalCode}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-blue-100 bg-white p-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-blue-700">
                                        Order Summary
                                    </p>
                                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                                        Detail Pesanan
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Ordered on {currentOrder.orderDate}
                                </p>
                            </div>

                            <div className="mt-5 space-y-3">
                                {currentOrder.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid gap-4 rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 md:grid-cols-[88px_minmax(0,1fr)_150px]"
                                    >
                                        <div className="h-20 w-20 overflow-hidden rounded-lg ring-1 ring-blue-100">
                                            {item.productImage ? (
                                                <img
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-700">
                                                    <Eye className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-950">
                                                {item.productName}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Qty {item.quantity} x{" "}
                                                {formatPrice(item.unitPrice)}
                                            </p>
                                        </div>

                                        <div className="self-center text-left md:text-right">
                                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                Total Product
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-slate-950">
                                                {formatPrice(
                                                    item.quantity * item.unitPrice,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 grid gap-4 rounded-lg border border-blue-100 bg-slate-950 p-4 text-white sm:grid-cols-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-200">
                                        Payment Detail
                                    </p>
                                    <p className="mt-2 text-sm text-slate-200">
                                        {currentOrder.paymentMethod}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-200">
                                        Payment Status
                                    </p>
                                    <p className="mt-2 text-sm text-slate-200">
                                        {getPaymentStatusLabel(currentOrder.paymentStatusKey)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-200">
                                        Order Total
                                    </p>
                                    <p className="mt-2 text-lg font-semibold">
                                        {formatPrice(total)}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {currentOrder.paymentStatusKey === "rejected" &&
                            !currentOrder.cancellationReason && (
                            <section className="rounded-lg border border-red-100 bg-red-50/70 p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                                    <ShieldAlert className="h-4 w-4" />
                                    Payment Rejected
                                </div>
                                <p className="mt-3 text-sm leading-7 text-red-700">
                                    {currentOrder.paymentRejectionReason}
                                </p>
                            </section>
                        )}
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-lg border border-blue-100 bg-white p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <ReceiptText className="h-4 w-4 text-blue-600" />
                                Bukti Pembayaran
                            </div>

                            {currentOrder.paymentMethodKey === "bank_transfer" ? (
                                currentOrder.paymentProofImage ? (
                                    <div className="mt-4 overflow-hidden rounded-lg border border-blue-100 bg-blue-50">
                                        <img
                                            src={currentOrder.paymentProofImage}
                                            alt={`Payment proof ${currentOrder.orderNumber}`}
                                            className="aspect-[4/3] w-full object-cover"
                                        />
                                    </div>
                                ) : isDetailLoading ? (
                                    <div className="mt-4 rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-10 text-center text-sm text-slate-500">
                                        Memuat bukti pembayaran...
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-10 text-center text-sm text-slate-500">
                                        Customer belum mengupload bukti pembayaran.
                                    </div>
                                )
                            ) : (
                                <div className="mt-4 rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-10 text-center text-sm text-slate-500">
                                    COD tidak memerlukan upload bukti pembayaran.
                                </div>
                            )}
                        </section>

                        <section className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <Truck className="h-4 w-4 text-blue-600" />
                                Order Action
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {currentOrder.statusKey === "delivered" ||
                                currentOrder.statusKey === "cancelled" ||
                                currentOrder.paymentStatusKey === "expired"
                                    ? "Order ini sudah final dan tidak dapat diproses lebih lanjut dari panel admin."
                                    : "Gunakan blok konfirmasi pembayaran untuk approve atau reject transfer, lalu blok cancel jika order memang harus dibatalkan dari sisi admin."}
                            </p>

                            <div className="mt-5 space-y-4">
                                <div className="rounded-lg border border-blue-100 bg-white p-4">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Konfirmasi Pembayaran
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Approve pembayaran yang valid atau kirim komentar reject ke customer jika bukti transfer tidak sesuai.
                                    </p>

                                    <label className="mt-4 block text-sm font-medium text-slate-700">
                                        Komentar Reject Pembayaran
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={paymentRejectionReason}
                                        onChange={(event) =>
                                            setPaymentRejectionReason(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Tulis alasan kenapa bukti pembayaran ditolak oleh admin."
                                        className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                    <div className="mt-4 grid gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleStatusUpdate(undefined, "Paid")
                                            }
                                            disabled={!canApprovePayment || isActionLoading}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <BadgeCheck className="h-4 w-4" />
                                            {isActionLoading ? "Memproses..." : "Approve Payment"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleStatusUpdate(undefined, "Rejected")
                                            }
                                            disabled={!canRejectPayment || isActionLoading}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ShieldAlert className="h-4 w-4" />
                                            Reject Payment
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-blue-100 bg-white p-4">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Cancel Order
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Gunakan cancel order hanya jika pesanan memang harus dibatalkan dari sisi admin. Alasan ini akan dikirim ke customer.
                                    </p>

                                    <label className="mt-4 block text-sm font-medium text-slate-700">
                                        Alasan Cancel Order
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={cancellationReason}
                                        onChange={(event) =>
                                            setCancellationReason(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Tulis alasan kenapa order dibatalkan oleh admin."
                                        className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                    <div className="mt-4 grid gap-3">
                                        <button
                                            type="button"
                                            onClick={() => void handleStatusUpdate("Cancelled")}
                                            disabled={!canCancel || isActionLoading}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Ban className="h-4 w-4" />
                                            Cancel Order
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => void handleStatusUpdate("Delivered")}
                                            disabled={!canDeliver || isActionLoading}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <BadgeCheck className="h-4 w-4" />
                                            Mark as Delivered
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

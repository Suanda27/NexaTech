"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BadgeCheck,
    CreditCard,
    Eye,
    MapPin,
    Truck,
    UserRound,
    X,
} from "lucide-react";
import { fetchAdminOrderDetail, type OrderData } from "@/lib/store";
import { useLanguage } from "@/context/LanguageContext";
import type { OrderItemData, OrderStatus } from "../types";
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
    const { t } = useLanguage();
    const [detailOrder, setDetailOrder] = useState<OrderItemData | null>(order);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        setDetailOrder(order);
    }, [
        order,
        order?.id,
        order?.paymentDeadline,
        order?.paymentMethod,
        order?.paymentStatus,
        order?.status,
    ]);

    useEffect(() => {
        if (!isOpen || !order) {
            return;
        }

        let active = true;

        const loadOrderDetail = async () => {
            try {
                const response = await fetchAdminOrderDetail(order.id);

                if (!active) {
                    return;
                }

                const mappedOrder = mapOrderDetail(response.data);
                setDetailOrder(mappedOrder);
            } catch {
                if (!active) {
                    return;
                }

                setDetailOrder(order);
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
    ]);

    const currentOrder = detailOrder ?? order;

    const total = useMemo(
        () => (currentOrder ? getOrderTotal(currentOrder.items) : 0),
        [currentOrder],
    );

    if (!isOpen || !currentOrder) {
        return null;
    }

    const canDeliver =
        currentOrder.statusKey === "processing";

    const handleStatusUpdate = async (
        status?: OrderStatus,
    ) => {
        setIsActionLoading(true);

        try {
            if (status === "Shipped") {
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
                            {t("Order Detail")}
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
                                {t(currentOrder.paymentMethod)}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getPaymentStatusClasses(
                                    currentOrder.paymentStatus,
                                )}`}
                            >
                                {t(getPaymentStatusLabel(currentOrder.paymentStatusKey))}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getStatusClasses(
                                    currentOrder.status,
                                )}`}
                            >
                                {t(getOrderStatusLabel(currentOrder.statusKey))}
                            </span>
                            </div>
                            {currentOrder.paymentMethodKey === "midtrans" &&
                                currentOrder.paymentDeadline && (
                                    <p className="mt-3 text-sm font-medium text-amber-700">
                                        {t("Payment deadline")}: {currentOrder.paymentDeadline}
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
                                    {t("Customer Details")}
                                </p>
                                <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                                    {t("Customer Information")}
                                </h3>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <UserRound className="h-4 w-4 text-blue-600" />
                                    {t("Customer Name")}
                                </div>
                                <p className="mt-3 text-sm text-slate-600">
                                    {currentOrder.customer.firstName}{" "}
                                    {currentOrder.customer.lastName}
                                </p>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                    {t("Payment Method")}
                                </div>
                                <p className="mt-3 text-sm text-slate-600">
                                    {t(currentOrder.paymentMethod)}
                                </p>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 md:col-span-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    {t("Shipping Address")}
                                </div>
                                <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                    <p>{currentOrder.customer.address}</p>
                                    <div className="space-y-1">
                                        <p>{t("City")}: {currentOrder.customer.city}</p>
                                        <p>{t("Postal Code")}: {currentOrder.customer.postalCode}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-blue-100 bg-white p-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-blue-700">
                                        {t("Order Summary")}
                                    </p>
                                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                                        {t("Order Details")}
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {t("Ordered on")} {currentOrder.orderDate}
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
                                                {t("Qty")} {item.quantity} x{" "}
                                                {formatPrice(item.unitPrice)}
                                            </p>
                                        </div>

                                        <div className="self-center text-left md:text-right">
                                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                {t("Total Product")}
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
                                        {t("Payment Detail")}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-200">
                                        {t(currentOrder.paymentMethod)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-200">
                                        {t("Payment Status")}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-200">
                                        {t(getPaymentStatusLabel(currentOrder.paymentStatusKey))}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-200">
                                        {t("Order Total")}
                                    </p>
                                    <p className="mt-2 text-lg font-semibold">
                                        {formatPrice(total)}
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>

                    <div className="space-y-6">
                        <section className="rounded-lg border border-blue-100 bg-white p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <CreditCard className="h-4 w-4 text-blue-600" />
                                {t("Payment Status")}
                            </div>

                            <div className="mt-4 rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-10 text-center text-sm text-slate-500">
                                {t("Midtrans payments are verified automatically through webhook notifications.")}
                            </div>
                        </section>

                        <section className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <Truck className="h-4 w-4 text-blue-600" />
                                {t("Order Action")}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {currentOrder.statusKey === "completed" ||
                                currentOrder.statusKey === "cancelled"
                                    ? t("This order is final and cannot be processed further from the admin panel.")
                                    : t("Admin can ship orders only after payment moves to processing.")}
                            </p>

                            <div className="mt-5 space-y-4">
                                <div className="rounded-lg border border-blue-100 bg-white p-4">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {t("Shipping Action")}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {t("Move a processing order to shipped after it has been handed to delivery.")}
                                    </p>

                                    <div className="mt-4 grid gap-3">
                                        <button
                                            type="button"
                                            onClick={() => void handleStatusUpdate("Shipped")}
                                            disabled={!canDeliver || isActionLoading}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <BadgeCheck className="h-4 w-4" />
                                            {isActionLoading ? t("Processing...") : t("Mark as Shipped")}
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

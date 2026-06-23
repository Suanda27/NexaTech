"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import OrderDetailModal from "./components/OrderDetailModal";
import type { OrderItemData } from "./types";
import { useLanguage } from "@/context/LanguageContext";
import {
    formatPrice,
    getPaymentMethodClasses,
    getPaymentStatusClasses,
    getStatusClasses,
} from "./utils";
import {
    getOrderStatusLabel,
    getPaymentStatusLabel,
} from "@/lib/order-status";

type OrderTableProps = {
    orders: OrderItemData[];
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

export default function OrderTable({
    orders,
    onUpdateOrder,
}: OrderTableProps) {
    const { t } = useLanguage();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const selectedOrder = useMemo(
        () =>
            selectedOrderId
                ? orders.find((order) => order.id === selectedOrderId) ?? null
                : null,
        [orders, selectedOrderId],
    );

    if (orders.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-16 text-center">
                <h3 className="text-xl font-semibold text-slate-950">
                    {t("No orders yet")}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {t("Customer orders will appear here after transactions start entering the system.")}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-lg border border-blue-100">
                <div className="overflow-x-auto">
                    <table className="min-w-[980px] w-full text-sm">
                        <thead className="bg-blue-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                <th className="px-6 py-4">{t("Order ID")}</th>
                                <th className="px-6 py-4">{t("Customer Name")}</th>
                                <th className="px-6 py-4">{t("Order Date")}</th>
                                <th className="px-6 py-4">{t("Payment Method")}</th>
                                <th className="px-6 py-4">{t("Payment Status")}</th>
                                <th className="px-6 py-4">{t("Status")}</th>
                                <th className="px-6 py-4">{t("Total")}</th>
                                <th className="px-6 py-4">{t("Actions")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-t border-blue-100 bg-white transition hover:bg-blue-50/30"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-950">
                                            {order.orderNumber}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">
                                            {order.customerName}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {order.orderDate}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getPaymentMethodClasses(
                                                order.paymentMethod,
                                            )}`}
                                        >
                                            {t(order.paymentMethod)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getPaymentStatusClasses(
                                                order.paymentStatus,
                                            )}`}
                                        >
                                            {t(getPaymentStatusLabel(order.paymentStatusKey))}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getStatusClasses(
                                                order.status,
                                            )}`}
                                        >
                                            <span className="h-2 w-2 rounded-full bg-current" />
                                            {t(getOrderStatusLabel(order.statusKey))}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-slate-950">
                                        {formatPrice(
                                            order.items.reduce(
                                                (sum, item) =>
                                                    sum +
                                                    item.unitPrice * item.quantity,
                                                0,
                                            ),
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedOrderId(order.id)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            {t("Details")}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailModal
                key={`${selectedOrder?.id ?? "empty"}-${selectedOrder?.paymentStatus ?? ""}-${selectedOrder?.status ?? ""}-${selectedOrder?.cancellationReason ?? ""}`}
                isOpen={Boolean(selectedOrder)}
                order={selectedOrder}
                onClose={() => setSelectedOrderId(null)}
                onUpdateOrder={onUpdateOrder}
            />
        </>
    );
}

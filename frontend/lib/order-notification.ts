"use client";

import type { OrderData } from "@/lib/store";
import type { AppToastInput } from "@/lib/toast";

const CUSTOMER_ORDER_STATE_KEY = "nexatech.customer-order-state.v1";
const ADMIN_WAITING_VERIFICATION_KEY = "nexatech.admin-waiting-verification.v1";

function readMap(key: string): Record<string, string> {
    if (typeof window === "undefined") {
        return {};
    }

    try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
        return {};
    }
}

function writeMap(key: string, value: Record<string, string>) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
}

function buildCustomerOrderSnapshot(order: OrderData) {
    return [
        order.paymentStatusKey,
        order.statusKey,
        order.paymentRejectionReason ?? "",
        order.cancellationReason ?? "",
    ].join("|");
}

function buildCustomerOrderToast(order: OrderData): AppToastInput | null {
    if (order.statusKey === "cancelled") {
        return {
            tone: "warning",
            title: "Order dibatalkan admin",
            message: order.cancellationReason
                ? `Alasan: ${order.cancellationReason}`
                : "Pesanan Anda dibatalkan oleh admin. Silakan hubungi admin untuk detail lebih lanjut.",
        };
    }

    switch (order.paymentStatusKey) {
        case "waiting_verification":
            return {
                tone: "info",
                title: "Bukti pembayaran terkirim",
                message:
                    "Bukti transfer sudah masuk dan sedang menunggu verifikasi admin.",
            };
        case "paid":
            return {
                tone: "success",
                title: "Pembayaran diterima",
                message:
                    "Pembayaran Anda berhasil dikonfirmasi dan pesanan sedang diproses.",
            };
        case "rejected":
            return {
                tone: "error",
                title: "Pembayaran ditolak",
                message: order.paymentRejectionReason
                    ? `Silakan upload ulang bukti transfer. Alasan admin: ${order.paymentRejectionReason}`
                    : "Silakan upload ulang bukti transfer sebelum batas waktu berakhir.",
            };
        case "expired":
            return {
                tone: "warning",
                title: "Pembayaran kedaluwarsa",
                message:
                    "Batas waktu pembayaran habis dan pesanan dibatalkan otomatis.",
            };
        default:
            return null;
    }
}

export function rememberCustomerOrderSnapshot(order: OrderData) {
    const snapshots = readMap(CUSTOMER_ORDER_STATE_KEY);
    snapshots[order.id] = buildCustomerOrderSnapshot(order);
    writeMap(CUSTOMER_ORDER_STATE_KEY, snapshots);
}

export function syncCustomerOrderNotifications(
    orders: OrderData[],
): AppToastInput[] {
    const previousSnapshots = readMap(CUSTOMER_ORDER_STATE_KEY);
    const nextSnapshots: Record<string, string> = {};
    const notifications: AppToastInput[] = [];

    orders.forEach((order) => {
        const nextSnapshot = buildCustomerOrderSnapshot(order);
        const previousSnapshot = previousSnapshots[order.id];

        if (previousSnapshot && previousSnapshot !== nextSnapshot) {
            const nextToast = buildCustomerOrderToast(order);

            if (nextToast) {
                notifications.push(nextToast);
            }
        }

        nextSnapshots[order.id] = nextSnapshot;
    });

    writeMap(CUSTOMER_ORDER_STATE_KEY, nextSnapshots);

    return notifications;
}

export function syncAdminVerificationNotifications(
    orders: OrderData[],
): AppToastInput | null {
    const previous = readMap(ADMIN_WAITING_VERIFICATION_KEY);
    const next: Record<string, string> = {};

    const waitingVerificationOrders = orders.filter(
        (order) =>
            order.paymentMethodKey === "bank_transfer" &&
            order.paymentStatusKey === "waiting_verification",
    );

    waitingVerificationOrders.forEach((order) => {
        next[order.id] = order.orderNumber;
    });

    writeMap(ADMIN_WAITING_VERIFICATION_KEY, next);

    const unseenOrders = waitingVerificationOrders.filter(
        (order) => !previous[order.id],
    );

    if (unseenOrders.length === 0) {
        return null;
    }

    return {
        tone: "info",
        title: "Pembayaran baru perlu verifikasi",
        message:
            unseenOrders.length === 1
                ? `${unseenOrders[0]?.orderNumber} baru saja mengirim bukti transfer dan menunggu dicek admin.`
                : `${unseenOrders.length} order baru mengirim bukti transfer dan menunggu verifikasi admin.`,
    };
}

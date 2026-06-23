"use client";

import type { OrderData } from "@/lib/store";
import type { AppToastInput } from "@/lib/toast";

const CUSTOMER_ORDER_STATE_KEY = "nexatech.customer-order-state.v1";
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
        order.cancellationReason ?? "",
    ].join("|");
}

function buildCustomerOrderToast(order: OrderData): AppToastInput | null {
    if (order.statusKey === "cancelled") {
        return {
            tone: "warning",
            title: "Order dibatalkan",
            message: order.cancellationReason
                ? `Alasan: ${order.cancellationReason}`
                : "Pesanan dibatalkan karena pembayaran Midtrans tidak selesai.",
        };
    }

    switch (order.paymentStatusKey) {
        case "processing":
            return {
                tone: "success",
                title: "Order diproses",
                message: "Pembayaran diterima dan pesanan sedang diproses.",
            };
        case "cancelled":
            return {
                tone: "warning",
                title: "Order dibatalkan",
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

export function syncAdminOrderNotifications(): AppToastInput | null {
    return null;
}

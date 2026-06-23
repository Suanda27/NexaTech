"use client";

import type {
    OrderItem,
    OrderPaymentMethod,
    OrderPaymentStatus,
    OrderStatus,
} from "./types";
import {
    getOrderStatusClasses as sharedOrderStatusClasses,
    getPaymentStatusClasses as sharedPaymentStatusClasses,
    type OrderStatusKey,
    type PaymentStatusKey,
} from "@/lib/order-status";

export function formatPrice(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

export function getOrderTotal(items: OrderItem[]): number {
    return items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
    );
}

export function getStatusClasses(status: OrderStatus): string {
    const normalizedStatus = status
        .toLowerCase()
        .replace(/\s+/g, "_") as OrderStatusKey;
    return sharedOrderStatusClasses(normalizedStatus);
}

export function getPaymentStatusClasses(
    status: OrderPaymentStatus,
): string {
    const normalizedStatus = status
        .toLowerCase()
        .replace(/\s+/g, "_") as PaymentStatusKey;

    return sharedPaymentStatusClasses(normalizedStatus);
}

export function getPaymentMethodClasses(
    method: OrderPaymentMethod,
): string {
    // Only Midtrans supported
    return "bg-white text-slate-700 ring-slate-200";
}

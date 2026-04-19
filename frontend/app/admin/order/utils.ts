"use client";

import type {
    OrderItem,
    OrderPaymentMethod,
    OrderPaymentStatus,
    OrderStatus,
} from "./types";

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
    switch (status) {
        case "Delivered":
            return "bg-blue-50 text-blue-700 ring-blue-100";
        case "Progressing":
            return "bg-amber-50 text-amber-700 ring-amber-100";
        case "Declined":
            return "bg-red-50 text-red-600 ring-red-100";
        case "Cancelled":
            return "bg-slate-100 text-slate-600 ring-slate-200";
        default:
            return "bg-slate-100 text-slate-600 ring-slate-200";
    }
}

export function getPaymentStatusClasses(
    status: OrderPaymentStatus,
): string {
    return status === "Paid"
        ? "bg-blue-50 text-blue-700 ring-blue-100"
        : "bg-slate-100 text-slate-600 ring-slate-200";
}

export function getPaymentMethodClasses(
    method: OrderPaymentMethod,
): string {
    return method === "Bank Transfer"
        ? "bg-white text-blue-700 ring-blue-100"
        : "bg-white text-slate-700 ring-slate-200";
}

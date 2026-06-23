"use client";

export type PaymentStatusKey =
    | "waiting_payment"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled";

export type OrderStatusKey =
    | "waiting_payment"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled";

export function getPaymentStatusLabel(status: PaymentStatusKey): string {
    switch (status) {
        case "waiting_payment":
            return "Waiting Payment";
        case "processing":
            return "Processing";
        case "shipped":
            return "Shipped";
        case "completed":
            return "Completed";
        case "cancelled":
            return "Cancelled";
        default:
            return "Waiting Payment";
    }
}

export function getOrderStatusLabel(status: OrderStatusKey): string {
    switch (status) {
        case "waiting_payment":
            return "Waiting Payment";
        case "processing":
            return "Processing";
        case "shipped":
            return "Shipped";
        case "completed":
            return "Completed";
        case "cancelled":
            return "Cancelled";
        default:
            return "Waiting Payment";
    }
}

export function getPaymentStatusClasses(status: PaymentStatusKey): string {
    switch (status) {
        case "completed":
            return "bg-blue-50 text-blue-700 ring-blue-100";
        case "shipped":
            return "bg-sky-50 text-sky-700 ring-sky-100";
        case "processing":
            return "bg-emerald-50 text-emerald-700 ring-emerald-100";
        case "waiting_payment":
            return "bg-amber-50 text-amber-700 ring-amber-100";
        case "cancelled":
            return "bg-red-50 text-red-600 ring-red-100";
        default:
            return "bg-slate-100 text-slate-600 ring-slate-200";
    }
}

export function getOrderStatusClasses(status: OrderStatusKey): string {
    switch (status) {
        case "completed":
            return "bg-blue-50 text-blue-700 ring-blue-100";
        case "shipped":
            return "bg-sky-50 text-sky-700 ring-sky-100";
        case "processing":
            return "bg-emerald-50 text-emerald-700 ring-emerald-100";
        case "waiting_payment":
            return "bg-amber-50 text-amber-700 ring-amber-100";
        case "cancelled":
        default:
            return "bg-slate-100 text-slate-600 ring-slate-200";
    }
}

export function getOrderNotice(order: {
    paymentMethodKey: string;
    paymentStatusKey: PaymentStatusKey;
    statusKey: OrderStatusKey;
    cancellationReason?: string | null;
}) {
    const isMidtransOrder = order.paymentMethodKey === "midtrans";
    const isCancelledByAdmin = order.statusKey === "cancelled";

    if (isCancelledByAdmin) {
        return {
            variant: "muted" as const,
            message: order.cancellationReason
                ? `Pesanan dibatalkan. Alasan: ${order.cancellationReason}`
                : "Pesanan dibatalkan karena pembayaran Midtrans tidak selesai.",
        };
    }

    if (order.statusKey === "processing") {
        return {
            variant: "success" as const,
            message:
                "Pembayaran berhasil diterima. Pesanan Anda sedang diproses admin.",
        };
    }

    if (isMidtransOrder && order.paymentStatusKey === "waiting_payment") {
        return {
            variant: "warning" as const,
            message:
                "Pesanan menunggu pembayaran Midtrans. Selesaikan pembayaran dari halaman Midtrans agar status diperbarui otomatis.",
        };
    }

    return null;
}

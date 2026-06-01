"use client";

export type PaymentStatusKey =
    | "waiting_payment"
    | "waiting_verification"
    | "paid"
    | "rejected"
    | "expired"
    | "unpaid";

export type OrderStatusKey =
    | "pending"
    | "processing"
    | "delivered"
    | "cancelled";

export function getPaymentStatusLabel(status: PaymentStatusKey): string {
    switch (status) {
        case "waiting_payment":
            return "Waiting Payment";
        case "waiting_verification":
            return "Waiting Verification";
        case "paid":
            return "Paid";
        case "rejected":
            return "Rejected";
        case "expired":
            return "Expired";
        default:
            return "Unpaid";
    }
}

export function getOrderStatusLabel(status: OrderStatusKey): string {
    switch (status) {
        case "processing":
            return "Processing";
        case "delivered":
            return "Delivered";
        case "cancelled":
            return "Cancelled";
        default:
            return "Pending";
    }
}

export function getPaymentStatusClasses(status: PaymentStatusKey): string {
    switch (status) {
        case "paid":
            return "bg-blue-50 text-blue-700 ring-blue-100";
        case "waiting_verification":
            return "bg-emerald-50 text-emerald-700 ring-emerald-100";
        case "waiting_payment":
            return "bg-amber-50 text-amber-700 ring-amber-100";
        case "rejected":
        case "expired":
            return "bg-red-50 text-red-600 ring-red-100";
        default:
            return "bg-slate-100 text-slate-600 ring-slate-200";
    }
}

export function getOrderStatusClasses(status: OrderStatusKey): string {
    switch (status) {
        case "delivered":
            return "bg-blue-50 text-blue-700 ring-blue-100";
        case "processing":
            return "bg-emerald-50 text-emerald-700 ring-emerald-100";
        case "pending":
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
    paymentRejectionReason?: string | null;
    cancellationReason?: string | null;
}) {
    const isTransferOrder = order.paymentMethodKey === "bank_transfer";
    const isCancelledByAdmin =
        order.statusKey === "cancelled" && order.paymentStatusKey !== "expired";

    if (isCancelledByAdmin) {
        return {
            variant: "muted" as const,
            message: order.cancellationReason
                ? `Pesanan dibatalkan admin. Alasan: ${order.cancellationReason}`
                : "Pesanan dibatalkan admin. Silakan hubungi admin untuk informasi lebih lanjut.",
        };
    }

    if (order.paymentStatusKey === "expired") {
        return {
            variant: "danger" as const,
            message:
                "Batas waktu pembayaran sudah habis. Pesanan otomatis dibatalkan.",
        };
    }

    if (order.paymentStatusKey === "paid") {
        return {
            variant: "success" as const,
            message:
                "Pembayaran berhasil dikonfirmasi. Pesanan Anda sedang diproses admin.",
        };
    }

    if (order.paymentStatusKey === "waiting_verification") {
        return {
            variant: "success" as const,
            message:
                "Bukti pembayaran sudah dikirim. Admin sedang memverifikasi pembayaran Anda.",
        };
    }

    if (isTransferOrder && order.paymentStatusKey === "rejected") {
        return {
            variant: "danger" as const,
            message: order.paymentRejectionReason
                ? `Pembayaran ditolak admin. Upload ulang bukti transfer sebelum waktu habis. Alasan: ${order.paymentRejectionReason}`
                : "Pembayaran ditolak admin. Upload ulang bukti transfer sebelum waktu habis.",
        };
    }

    if (isTransferOrder && order.paymentStatusKey === "waiting_payment") {
        return {
            variant: "warning" as const,
            message:
                "Pesanan menunggu pembayaran. Upload bukti transfer sebelum deadline agar admin bisa memverifikasinya.",
        };
    }

    return null;
}

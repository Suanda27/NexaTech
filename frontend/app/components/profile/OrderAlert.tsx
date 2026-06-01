import type { ReactNode } from "react";

export default function OrderAlert({
    children,
    variant = "warning",
}: {
    children?: ReactNode;
    variant?: "warning" | "success" | "danger" | "muted";
}) {
    const styles = {
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        danger: "border-red-200 bg-red-50 text-red-700",
        muted: "border-slate-200 bg-slate-100 text-slate-600",
    }[variant];

    return (
        <div className={`rounded-lg border p-4 text-sm leading-6 ${styles}`}>
            {children}
        </div>
    );
}

export function OrderPaymentGuide() {
    return (
        <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-slate-600">
            Setelah checkout, order akan masuk ke status <strong>Waiting Payment</strong>.
            Upload bukti transfer dari halaman order Anda sebelum deadline berakhir,
            lalu admin akan memeriksa dan mengubahnya ke <strong>Paid</strong> bila valid.
        </div>
    );
}

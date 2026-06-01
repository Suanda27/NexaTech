"use client";

import { type ChangeEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    CreditCard,
    ImagePlus,
    Mail,
    MapPin,
    Package,
    Save,
    ShieldCheck,
    Truck,
    User,
} from "lucide-react";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";
import AuthGuard from "@/app/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import {
    fetchOrders,
    fetchProfile,
    uploadOrderPaymentProof,
    updateProfile,
    type OrderData,
    type ProfileResponse,
} from "@/lib/store";
import OrderAlert from "@/app/components/profile/OrderAlert";

export default function Page() {
    const { setUser } = useAuth();
    const searchParams = useSearchParams();
    const tab = searchParams?.get("tab");
    const [active, setActive] = useState(
        tab === "personal" ? "personal" : "orders",
    );
    const [profile, setProfile] = useState<ProfileResponse["data"] | null>(null);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        setActive(tab === "personal" ? "personal" : "orders");
    }, [tab]);

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            const [profileResult, ordersResult] = await Promise.allSettled([
                fetchProfile(),
                fetchOrders(),
            ]);

            if (!mounted) {
                return;
            }

            if (profileResult.status === "fulfilled") {
                setProfile(profileResult.value.data);
                setForm({
                    name: profileResult.value.data.user.name,
                    email: profileResult.value.data.user.email,
                    phone: profileResult.value.data.user.phone ?? "",
                    address: profileResult.value.data.user.address ?? "",
                    password: "",
                    confirmPassword: "",
                });
            } else {
                setProfile(null);
            }

            if (ordersResult.status === "fulfilled") {
                setOrders(ordersResult.value.data);
            } else {
                setOrders([]);
            }
        };

        void loadProfile();

        return () => {
            mounted = false;
        };
    }, []);

    const bankOrders = useMemo(
        () => orders.filter((order) => order.paymentMethodKey === "bank_transfer"),
        [orders],
    );

    const codOrders = useMemo(
        () => orders.filter((order) => order.paymentMethodKey === "cod"),
        [orders],
    );

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            const response = await updateProfile({
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                password: form.password || undefined,
                password_confirmation: form.confirmPassword || undefined,
            });

            setUser(response.data);
            setProfile((current) =>
                current
                    ? {
                          ...current,
                          user: response.data,
                      }
                    : current,
            );
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
            setForm((prev) => ({
                ...prev,
                password: "",
                confirmPassword: "",
            }));
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui profil.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleOrderUpdated = (updatedOrder: OrderData) => {
        setOrders((current) =>
            current.map((order) =>
                order.id === updatedOrder.id ? updatedOrder : order,
            ),
        );
    };

    return (
        <AuthGuard loginPath="/customer/login">
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <HeaderUser />

                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
                    <aside className="w-full rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50 lg:w-72 lg:self-start">
                        <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                            <p className="text-sm font-semibold text-blue-700">
                                Customer Profile
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-slate-950">
                                {profile?.user.name ?? "Account"}
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                {profile?.user.email ?? "No email"}
                            </p>
                        </div>

                        <div className="mt-5 space-y-2">
                            <button
                                type="button"
                                onClick={() => setActive("orders")}
                                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition ${
                                    active === "orders"
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                        : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                            >
                                Order History
                            </button>
                            <button
                                type="button"
                                onClick={() => setActive("personal")}
                                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition ${
                                    active === "personal"
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                        : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                            >
                                Personal Info
                            </button>
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1 space-y-6">
                        {active === "orders" && (
                            <>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <SummaryCard
                                        title="Total Orders"
                                        value={profile?.summary.totalOrders ?? 0}
                                    />
                                    <SummaryCard
                                        title="Progressing"
                                        value={profile?.summary.progressingOrders ?? 0}
                                    />
                                    <SummaryCard
                                        title="Delivered"
                                        value={profile?.summary.deliveredOrders ?? 0}
                                    />
                                    <SummaryCard
                                        title="Declined / Cancelled"
                                        value={
                                            (profile?.summary.declinedOrders ?? 0) +
                                            (profile?.summary.cancelledOrders ?? 0)
                                        }
                                    />
                                </div>

                                <OrderSection
                                    title="Bank Transfer"
                                    orders={bankOrders}
                                    onOrderUpdated={handleOrderUpdated}
                                />
                                <OrderSection
                                    title="Cash on Delivery"
                                    orders={codOrders}
                                    onOrderUpdated={handleOrderUpdated}
                                />
                            </>
                        )}

                        {active === "personal" && (
                            <div className="mx-auto max-w-3xl">
                                <div className="relative overflow-hidden rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50 transition duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70 sm:p-8">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />

                                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-blue-50 p-3 ring-1 ring-blue-100 shadow-sm">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                                    Account Details
                                                </p>
                                                <h2 className="text-xl font-bold text-gray-950">
                                                    Personal Information
                                                </h2>
                                            </div>
                                        </div>

                                        <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                            Synced with backend
                                        </span>
                                    </div>

                                    <form onSubmit={handleSave} className="space-y-5">
                                        <FieldCard label="Full Name" icon={<User className="h-5 w-5 text-blue-500" />}>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </FieldCard>

                                        <FieldCard label="Email Address" icon={<Mail className="h-5 w-5 text-blue-500" />}>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </FieldCard>

                                        <FieldCard label="Phone Number" icon={<CreditCard className="h-5 w-5 text-blue-500" />}>
                                            <input
                                                type="text"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        phone: e.target.value,
                                                    }))
                                                }
                                                placeholder="Optional"
                                                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </FieldCard>

                                        <FieldCard label="Address" icon={<MapPin className="h-5 w-5 text-blue-500" />}>
                                            <textarea
                                                value={form.address}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        address: e.target.value,
                                                    }))
                                                }
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </FieldCard>

                                        <FieldCard label="New Password" icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}>
                                            <input
                                                type="password"
                                                value={form.password}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        password: e.target.value,
                                                    }))
                                                }
                                                placeholder="Optional"
                                                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </FieldCard>

                                        <FieldCard label="Confirm Password" icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}>
                                            <input
                                                type="password"
                                                value={form.confirmPassword}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        confirmPassword: e.target.value,
                                                    }))
                                                }
                                                placeholder="Optional"
                                                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </FieldCard>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200 disabled:opacity-60"
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {showToast && (
                    <div className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-100">
                        <CheckCircle2 className="h-5 w-5" />
                        Personal information updated successfully
                    </div>
                )}

                <Footer />
            </div>
        </AuthGuard>
    );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function OrderSection({
    title,
    orders,
    onOrderUpdated,
}: {
    title: string;
    orders: OrderData[];
    onOrderUpdated: (order: OrderData) => void;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-bold text-gray-900">{title}</h2>

            {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 px-6 py-12 text-center">
                    <p className="font-semibold text-slate-950">
                        Belum ada order {title.toLowerCase()}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Histori pesanan customer akan langsung tampil dari backend.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderHistoryCard
                            key={order.id}
                            order={order}
                            onOrderUpdated={onOrderUpdated}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function OrderHistoryCard({
    order,
    onOrderUpdated,
}: {
    order: OrderData;
    onOrderUpdated: (order: OrderData) => void;
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedPaymentProof, setSelectedPaymentProof] = useState<{
        name: string;
        file: File;
        previewUrl: string;
    } | null>(null);

    useEffect(() => {
        return () => {
            if (selectedPaymentProof?.previewUrl) {
                URL.revokeObjectURL(selectedPaymentProof.previewUrl);
            }
        };
    }, [selectedPaymentProof?.previewUrl]);

    const isTransferOrder = order.paymentMethodKey === "bank_transfer";
    const isWaitingPayment = order.paymentStatusKey === "waiting_payment";
    const isWaitingVerification =
        order.paymentStatusKey === "waiting_verification";
    const isPaid = order.paymentStatusKey === "paid";
    const isRejected = order.paymentStatusKey === "rejected";
    const isExpired = order.paymentStatusKey === "expired";
    const isCancelledByAdmin = order.statusKey === "cancelled" && !isExpired;
    const showRejectedPaymentAlert = isRejected && !isCancelledByAdmin;

    const canUploadPaymentProof =
        isTransferOrder &&
        !isCancelledByAdmin &&
        !isExpired &&
        (isWaitingPayment || showRejectedPaymentAlert);

    const handlePaymentProofChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            if (!file.type.startsWith("image/")) {
                throw new Error("File bukti pembayaran harus berupa gambar.");
            }

            if (file.size > 2 * 1024 * 1024) {
                throw new Error("Ukuran bukti pembayaran maksimal 2 MB.");
            }

            setSelectedPaymentProof((current) => {
                if (current?.previewUrl) {
                    URL.revokeObjectURL(current.previewUrl);
                }

                return {
                    name: file.name,
                    file,
                    previewUrl: URL.createObjectURL(file),
                };
            });
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal membaca file bukti pembayaran.",
            );
        } finally {
            event.target.value = "";
        }
    };

    const handleSubmitPaymentProof = async () => {
        if (!selectedPaymentProof) {
            return;
        }

        setIsUploading(true);

        try {
            const response = await uploadOrderPaymentProof(order.id, {
                payment_proof: selectedPaymentProof.file,
            });

            if (selectedPaymentProof.previewUrl) {
                URL.revokeObjectURL(selectedPaymentProof.previewUrl);
            }

            setSelectedPaymentProof(null);
            onOrderUpdated(response.data);
            alert(response.message);
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal mengupload bukti pembayaran.",
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-slate-950">
                            {order.orderNumber}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                            {order.paymentStatus}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                            {order.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">
                        {order.orderDate} - {order.paymentMethod}
                    </p>
                    {canUploadPaymentProof && (
                        <PaymentCountdown
                            key={`${order.id}-${order.paymentExpiresAt ?? "expired"}`}
                            expiresAt={order.paymentExpiresAt}
                            label={
                                showRejectedPaymentAlert
                                    ? "Sisa waktu upload ulang"
                                    : "Sisa pembayaran"
                            }
                            tone={showRejectedPaymentAlert ? "danger" : "warning"}
                        />
                    )}
                </div>

                <p className="text-lg font-bold text-blue-700">
                    Rp {order.summary.total.toLocaleString("id-ID")}
                </p>
            </div>

            <div className="mt-4 grid gap-3">
                {order.items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3"
                    >
                        <div className="h-14 w-14 overflow-hidden rounded-lg bg-blue-50 ring-1 ring-blue-100">
                            {item.productImage ? (
                                <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-blue-600">
                                    <Package className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-950">
                                {item.productName}
                            </p>
                            <p className="text-sm text-slate-500">
                                Qty {item.quantity}
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                            Rp {item.totalPrice.toLocaleString("id-ID")}
                        </p>
                    </div>
                ))}
            </div>

            {isWaitingPayment && !isCancelledByAdmin && (
                <div className="mt-4">
                    <OrderAlert variant="warning">
                        Order ini menunggu pembayaran. Upload bukti transfer sebelum
                        deadline agar admin bisa memverifikasi pembayaran Anda.
                    </OrderAlert>
                </div>
            )}

            {isWaitingVerification && (
                <div className="mt-4">
                    <OrderAlert variant="success">
                        Bukti pembayaran berhasil dikirim. Admin sedang memverifikasi
                        pembayaran Anda.
                    </OrderAlert>
                </div>
            )}

            {isPaid && (
                <div className="mt-4">
                    <OrderAlert variant="success">
                        Pembayaran berhasil dikonfirmasi. Order Anda sedang diproses
                        oleh admin.
                    </OrderAlert>
                </div>
            )}

            {showRejectedPaymentAlert && (
                <div className="mt-4">
                    <OrderAlert variant="danger">
                        Pembayaran Anda gagal diverifikasi. Silakan upload ulang
                        bukti transfer sebelum waktu habis.
                        {order.paymentRejectionReason
                            ? ` Alasan admin: ${order.paymentRejectionReason}`
                            : ""}
                    </OrderAlert>
                </div>
            )}

            {isCancelledByAdmin && (
                <div className="mt-4">
                    <OrderAlert variant="muted">
                        Order ditolak oleh admin.
                        {order.cancellationReason
                            ? ` Alasan: ${order.cancellationReason}`
                            : " Silakan hubungi admin untuk informasi lebih lanjut."}
                    </OrderAlert>
                </div>
            )}

            {isExpired && (
                <div className="mt-4">
                    <OrderAlert variant="danger">
                        Waktu pembayaran habis. Order otomatis dibatalkan karena
                        pembayaran tidak diterima sebelum deadline berakhir.
                    </OrderAlert>
                </div>
            )}

            {canUploadPaymentProof && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                        Upload Bukti Pembayaran
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Kirim screenshot atau foto bukti transfer agar admin dapat
                        mengecek pembayaran Anda.
                    </p>

                    {selectedPaymentProof && (
                        <div className="mt-4 flex items-center gap-4 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                            <div className="h-16 w-16 overflow-hidden rounded-lg bg-white ring-1 ring-blue-100">
                                <img
                                    src={selectedPaymentProof.previewUrl}
                                    alt={selectedPaymentProof.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                    {selectedPaymentProof.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                    Gambar siap dikirim ke admin.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                        <label
                            htmlFor={`payment-proof-${order.id}`}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                            <ImagePlus className="h-4 w-4" />
                            Pilih Gambar
                        </label>
                        <button
                            type="button"
                            onClick={handleSubmitPaymentProof}
                            disabled={!selectedPaymentProof || isUploading}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {isUploading ? "Mengirim..." : "Kirim Bukti"}
                        </button>
                    </div>

                    <input
                        id={`payment-proof-${order.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePaymentProofChange}
                        disabled={isUploading}
                    />
                </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                        <p className="text-sm font-bold text-gray-900">
                            Shipping
                        </p>
                        <p className="text-xs text-gray-600">
                            {order.customer.address}, {order.customer.city}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                        <p className="text-sm font-bold text-gray-900">
                            Payment
                        </p>
                        <p className="text-xs text-gray-600">
                            {order.paymentMethod} - {order.paymentStatus}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentCountdown({
    expiresAt,
    label,
    tone,
}: {
    expiresAt: string | null;
    label: string;
    tone: "warning" | "danger";
}) {
    const [remainingMs, setRemainingMs] = useState(() =>
        getRemainingMs(expiresAt),
    );

    useEffect(() => {
        if (!expiresAt) {
            return;
        }

        const timer = window.setInterval(() => {
            setRemainingMs(getRemainingMs(expiresAt));
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [expiresAt]);

    const toneClass =
        tone === "danger" ? "text-red-600" : "text-amber-700";

    return (
        <p className={`text-sm font-semibold ${toneClass}`}>
            {label}: {formatCountdown(remainingMs)}
        </p>
    );
}

function getRemainingMs(expiresAt: string | null): number {
    if (!expiresAt) {
        return 0;
    }

    return Math.max(new Date(expiresAt).getTime() - Date.now(), 0);
}

function formatCountdown(remainingMs: number): string {
    const totalSeconds = Math.max(Math.floor(remainingMs / 1000), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((value) => String(value).padStart(2, "0"))
        .join(":");
}

function FieldCard({
    label,
    icon,
    children,
}: {
    label: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 transition focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {icon}
                </div>
                {children}
            </div>
        </div>
    );
}

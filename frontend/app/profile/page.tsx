"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    CreditCard,
    ExternalLink,
    LoaderCircle,
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
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import {
    completeOrder,
    fetchOrders,
    fetchProfile,
    updateProfile,
    type OrderData,
    type ProfileResponse,
} from "@/lib/store";
import { loadMidtransSnap } from "@/lib/midtrans";
import OrderAlert from "@/app/components/profile/OrderAlert";
import {
    getOrderNotice,
    getOrderStatusLabel,
    getPaymentStatusLabel,
} from "@/lib/order-status";
import {
    rememberCustomerOrderSnapshot,
    syncCustomerOrderNotifications,
} from "@/lib/order-notification";

export default function Page() {
    const { setUser } = useAuth();
    const { notify } = useToast();
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const tab = searchParams?.get("tab");
    const [active, setActive] = useState(
        tab === "personal" ? "personal" : "orders",
    );
    const [profile, setProfile] = useState<ProfileResponse["data"] | null>(null);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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

            setHasLoadedOrders(true);
        };

        void loadProfile();

        return () => {
            mounted = false;
        };
    }, []);

    const orderSummary = useMemo(
        () => ({
            totalOrders: orders.length,
            progressingOrders: orders.filter((order) =>
                ["waiting_payment", "processing", "shipped"].includes(order.statusKey),
            ).length,
            completedOrders: orders.filter(
                (order) => order.statusKey === "completed",
            ).length,
            declinedOrders: orders.filter(
                (order) => order.statusKey === "cancelled",
            ).length,
            cancelledOrders: orders.filter(
                (order) => order.statusKey === "cancelled",
            ).length,
        }),
        [orders],
    );

    const summary = hasLoadedOrders ? orderSummary : profile?.summary;

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
            setForm((prev) => ({
                ...prev,
                password: "",
                confirmPassword: "",
            }));
            notify({
                tone: "success",
                title: t("Profile updated successfully"),
                message: t("Your account information has been saved securely."),
            });
        } catch (error) {
            notify({
                tone: "error",
                title: t("Failed to update profile"),
                message:
                    error instanceof Error
                        ? t(error.message)
                        : t("Failed to update profile."),
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleOrderUpdated = (updatedOrder: OrderData) => {
        rememberCustomerOrderSnapshot(updatedOrder);
        setOrders((current) =>
            current.map((order) =>
                order.id === updatedOrder.id ? updatedOrder : order,
            ),
        );
    };

    useEffect(() => {
        if (orders.length === 0) {
            return;
        }

        const notifications = syncCustomerOrderNotifications(orders);

        notifications.forEach((toast, index) => {
            window.setTimeout(() => notify(toast), index * 220);
        });
    }, [notify, orders]);

    return (
        <AuthGuard loginPath="/customer/login">
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <HeaderUser />

                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
                    <aside className="w-full rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50 lg:w-72 lg:self-start">
                        <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                            <p className="text-sm font-semibold text-blue-700">
                                {t("Customer Profile")}
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-slate-950">
                                {profile?.user.name ?? t("Account")}
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                {profile?.user.email ?? t("No email")}
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
                                {t("Order History")}
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
                                {t("Personal Info")}
                            </button>
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1 space-y-6">
                        {active === "orders" && (
                            <>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <SummaryCard
                                        title="Total Orders"
                                        value={summary?.totalOrders ?? 0}
                                    />
                                    <SummaryCard
                                        title="Progressing"
                                        value={summary?.progressingOrders ?? 0}
                                    />
                                    <SummaryCard
                                        title="Completed"
                                        value={summary?.completedOrders ?? 0}
                                    />
                                    <SummaryCard
                                        title="Cancelled Orders"
                                        value={
                                            (summary?.declinedOrders ?? 0) +
                                            (summary?.cancelledOrders ?? 0)
                                        }
                                    />
                                </div>

                                <OrderSection
                                    title="All Orders"
                                    orders={orders}
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
                                                    {t("Account Details")}
                                                </p>
                                                <h2 className="text-xl font-bold text-gray-950">
                                                    {t("Personal Information")}
                                                </h2>
                                            </div>
                                        </div>

                                        <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                            {t("Synced with backend")}
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
                                                placeholder={t("Optional")}
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
                                                placeholder={t("Optional")}
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
                                                placeholder={t("Optional")}
                                                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </FieldCard>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200 disabled:opacity-60"
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSaving ? t("Saving...") : t("Save Changes")}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Footer />
            </div>
        </AuthGuard>
    );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
    const { t } = useLanguage();

    return (
        <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50">
            <p className="text-sm font-medium text-slate-500">{t(title)}</p>
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
    const { t } = useLanguage();

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-bold text-gray-900">{t(title)}</h2>

            {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 px-6 py-12 text-center">
                    <p className="font-semibold text-slate-950">
                        {t("No orders yet")}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("All checkout history from the signed-in account will appear here.")}
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
    const { notify } = useToast();
    const { t } = useLanguage();
    const [isCompleting, setIsCompleting] = useState(false);
    const [isOpeningMidtrans, setIsOpeningMidtrans] = useState(false);

    const isMidtransOrder = order.paymentMethodKey === "midtrans";
    const isWaitingPayment = order.paymentStatusKey === "waiting_payment";
    const isCancelledByAdmin = order.statusKey === "cancelled";
    const orderNotice = getOrderNotice(order);
    const canPayMidtrans =
        isMidtransOrder &&
        isWaitingPayment &&
        !isCancelledByAdmin &&
        Boolean(order.midtransSnapToken);
    const canCompleteOrder = order.statusKey === "shipped";

    const handleCompleteOrder = async () => {
        setIsCompleting(true);

        try {
            const response = await completeOrder(order.id);
            onOrderUpdated(response.data);
            notify({
                tone: "success",
                title: t("Order completed"),
                message: t(response.message),
            });
        } catch (error) {
            notify({
                tone: "error",
                title: t("Failed to complete order"),
                message:
                    error instanceof Error
                        ? t(error.message)
                        : t("Failed to complete order."),
            });
        } finally {
            setIsCompleting(false);
        }
    };

    const refreshCurrentOrder = async () => {
        const response = await fetchOrders();
        const updatedOrder = response.data.find((item) => item.id === order.id);

        if (updatedOrder) {
            onOrderUpdated(updatedOrder);
        }
    };

    const handlePayMidtrans = async () => {
        if (!order.midtransSnapToken) {
            return;
        }

        setIsOpeningMidtrans(true);

        try {
            await loadMidtransSnap();

            if (!window.snap) {
                throw new Error("Popup pembayaran Midtrans belum siap.");
            }

            await new Promise<void>((resolve) => {
                let isHandled = false;
                const finish = async (
                    tone: "success" | "warning" | "error",
                    title: string,
                    message: string,
                    shouldRefresh = true,
                ) => {
                    if (isHandled) {
                        return;
                    }

                    isHandled = true;

                    if (shouldRefresh) {
                        try {
                            await refreshCurrentOrder();
                        } catch {
                            // Snap callbacks must never leave the payment button stuck.
                        }
                    }

                    notify({
                        tone,
                        title: t(title),
                        message: t(message),
                    });
                    resolve();
                };

                window.snap?.pay(order.midtransSnapToken ?? "", {
                    onSuccess: () => {
                        void finish(
                            "success",
                            "Payment successful",
                            "Midtrans payment is complete. Order status will be updated automatically.",
                        );
                    },
                    onPending: () => {
                        void finish(
                            "warning",
                            "Payment is not complete",
                            "Order is waiting for Midtrans payment. Complete payment on the Midtrans page so the status updates automatically.",
                        );
                    },
                    onError: () => {
                        void finish(
                            "error",
                            "Payment cancelled",
                            "Midtrans payment failed to process. You can try again before the payment deadline.",
                        );
                    },
                    onClose: () => {
                        void finish(
                            "warning",
                            "Payment is not complete",
                            "Midtrans popup was closed. The order is still waiting for payment.",
                            false,
                        );
                    },
                });
            });
        } catch (error) {
            notify({
                tone: "error",
                title: t("Checkout failed"),
                message:
                    error instanceof Error
                        ? t(error.message)
                        : t("Failed to open Midtrans payment."),
            });
        } finally {
            setIsOpeningMidtrans(false);
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
                            {t(getPaymentStatusLabel(order.paymentStatusKey))}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                            {t(getOrderStatusLabel(order.statusKey))}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">
                        {order.orderDate} - {order.paymentMethod}
                    </p>
                    {canPayMidtrans && (
                        <PaymentCountdown
                            key={`${order.id}-${order.paymentExpiresAt ?? "expired"}`}
                            expiresAt={order.paymentExpiresAt}
                            label={
                                canPayMidtrans
                                    ? t("Remaining payment time")
                                    : t("Remaining payment time")
                            }
                            tone="warning"
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
                                {t("Qty")} {item.quantity}
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                            Rp {item.totalPrice.toLocaleString("id-ID")}
                        </p>
                    </div>
                ))}
            </div>

            {orderNotice && (
                <div className="mt-4">
                    <OrderAlert variant={orderNotice.variant}>
                        {t(orderNotice.message)}
                    </OrderAlert>
                </div>
            )}

            {canPayMidtrans && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                        {t("Midtrans Payment")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {t("Continue payment through the secure Midtrans popup before the payment deadline.")}
                    </p>
                    <button
                        type="button"
                        onClick={() => void handlePayMidtrans()}
                        disabled={isOpeningMidtrans}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isOpeningMidtrans ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <ExternalLink className="h-4 w-4" />
                        )}
                        {isOpeningMidtrans ? t("Opening...") : t("Pay with Midtrans")}
                    </button>
                </div>
            )}

            {canCompleteOrder && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                        {t("Complete Order")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {t("Confirm that your order has arrived and mark it as completed.")}
                    </p>
                    <button
                        type="button"
                        onClick={() => void handleCompleteOrder()}
                        disabled={isCompleting}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isCompleting ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        {isCompleting ? t("Processing...") : t("Mark as Completed")}
                    </button>
                </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                        <p className="text-sm font-bold text-gray-900">
                            {t("Shipping")}
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
                            {t("Payment")}
                        </p>
                        <p className="text-xs text-gray-600">
                            {t(order.paymentMethod)} - {t(getPaymentStatusLabel(order.paymentStatusKey))}
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
    const { t } = useLanguage();

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 transition focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">
                {t(label)}
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

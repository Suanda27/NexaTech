"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Home,
    LoaderCircle,
    Mail,
    MapPin,
    PackageCheck,
    ShieldCheck,
    Truck,
    User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/context/LanguageContext";
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";
import AuthGuard from "@/app/components/auth/AuthGuard";
import {
    createOrder,
    fetchCart,
    fetchProfile,
    syncMidtransOrder,
    type CartResponse,
} from "@/lib/store";
import { queueFlashToast } from "@/lib/toast";
import { loadMidtransSnap } from "@/lib/midtrans";

const CHECKOUT_SELECTION_KEY = "nexatech.checkout.selectedProductIds";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { refreshCartCount } = useShop();
    const { notify } = useToast();
    const { t } = useLanguage();
    const payment = "midtrans" as const;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaymentPopupOpening, setIsPaymentPopupOpening] = useState(false);
    const [cart, setCart] = useState<CartResponse>({
        items: [],
        summary: {
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            itemCount: 0,
        },
    });
    const [selectedProductIds, setSelectedProductIds] = useState<number[] | null>(
        null,
    );
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postalCode: "",
    });

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            const [cartResult, profileResult] = await Promise.allSettled([
                fetchCart(),
                fetchProfile(),
            ]);

            if (!mounted) {
                return;
            }

            if (cartResult.status === "fulfilled") {
                setCart(cartResult.value);

                const storedSelection = sessionStorage.getItem(
                    CHECKOUT_SELECTION_KEY,
                );

                if (storedSelection) {
                    try {
                        const parsedSelection = JSON.parse(storedSelection);

                        setSelectedProductIds(
                            Array.isArray(parsedSelection)
                                ? parsedSelection
                                      .map((productId) => Number(productId))
                                      .filter(Number.isFinite)
                                : null,
                        );
                    } catch {
                        setSelectedProductIds(null);
                    }
                } else {
                    setSelectedProductIds(null);
                }
            } else {
                notify({
                    tone: "error",
                    title: "Cart gagal dimuat",
                    message:
                        cartResult.reason instanceof Error
                            ? cartResult.reason.message
                            : "Tidak bisa memuat item cart.",
                });
            }

            if (profileResult.status === "fulfilled") {
                const fullName = profileResult.value.data.user.name?.trim() ?? "";
                const parts = fullName.split(/\s+/).filter(Boolean);

                setForm({
                    firstName: parts[0] ?? "",
                    lastName: parts.slice(1).join(" "),
                    address: profileResult.value.data.user.address ?? "",
                    city: "",
                    postalCode: "",
                });
            } else {
                notify({
                    tone: "error",
                    title: "Profil gagal dimuat",
                    message:
                        profileResult.reason instanceof Error
                            ? profileResult.reason.message
                            : "Silakan isi data pengiriman secara manual.",
                });
            }
        };

        void loadData();

        return () => {
            mounted = false;
        };
    }, [notify]);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await createOrder({
                first_name: form.firstName,
                last_name: form.lastName,
                address: form.address,
                city: form.city,
                postal_code: form.postalCode,
                payment_method: payment,
                ...(selectedProductIds
                    ? { selected_product_ids: selectedProductIds }
                    : {}),
            });

            if (
                response.data.paymentMethodKey === "midtrans" &&
                response.data.midtransSnapToken
            ) {
                if (response.data.midtransSnapToken.startsWith("mock-")) {
                    await refreshCartCount();
                    sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
                    queueFlashToast({
                        tone: "success",
                        title: "Checkout berhasil",
                        message:
                            "Mode mock Midtrans aktif. Order sudah dibuat tanpa membuka halaman baru.",
                        durationMs: 5200,
                    });
                    router.push("/profile?tab=orders");
                    return;
                }

                setIsPaymentPopupOpening(true);
                await loadMidtransSnap();

                if (!window.snap) {
                    throw new Error("Popup pembayaran Midtrans belum siap.");
                }

                await refreshCartCount();
                sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);

                await new Promise<void>((resolve) => {
                    let isOrderFinalized = false;
                    const finishCheckout = (
                        title: string,
                        message: string,
                    ) => {
                        if (isOrderFinalized) {
                            return;
                        }

                        isOrderFinalized = true;
                        queueFlashToast({
                            tone: "success",
                            title,
                            message,
                            durationMs: 5200,
                        });
                        router.push("/profile?tab=orders");
                        resolve();
                    };
                    const keepOrderWaitingPayment = (
                        title: string,
                        message: string,
                    ) => {
                        if (isOrderFinalized) {
                            return;
                        }

                        isOrderFinalized = true;
                        queueFlashToast({
                            tone: "warning",
                            title,
                            message,
                            durationMs: 5200,
                        });
                        router.push("/profile?tab=orders");
                        resolve();
                    };

                    window.snap?.pay(response.data.midtransSnapToken ?? "", {
                        onSuccess: () => {
                            void (async () => {
                                try {
                                    await syncMidtransOrder(response.data.id);
                                    finishCheckout(
                                        "Pembayaran berhasil",
                                        "Pembayaran Midtrans selesai dan status order sudah disinkronkan.",
                                    );
                                } catch {
                                    finishCheckout(
                                        "Pembayaran berhasil",
                                        "Pembayaran Midtrans selesai. Status order akan diperbarui otomatis.",
                                    );
                                }
                            })();
                        },
                        onPending: () => {
                            keepOrderWaitingPayment(
                                "Pembayaran belum selesai",
                                "Order tetap menunggu pembayaran Midtrans. Selesaikan pembayaran agar status diperbarui otomatis.",
                            );
                        },
                        onError: () => {
                            keepOrderWaitingPayment(
                                "Pembayaran belum selesai",
                                "Pembayaran Midtrans gagal diproses. Order tetap menunggu pembayaran dan bisa dicoba lagi sebelum deadline.",
                            );
                        },
                        onClose: () => {
                            keepOrderWaitingPayment(
                                "Pembayaran belum selesai",
                                "Popup Midtrans ditutup. Order tetap menunggu pembayaran dan VA/QRIS yang sudah dibuat masih bisa dibayar.",
                            );
                        },
                    });
                });
                return;
            }

            await refreshCartCount();
            sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
            queueFlashToast({
                tone: "success",
                title: "Checkout berhasil",
                message:
                    "Pesanan berhasil dibuat. Silakan cek status pembayaran di halaman profile.",
                durationMs: 5200,
            });
            router.push("/profile?tab=orders");
        } catch (error) {
            notify({
                tone: "error",
                title: "Checkout gagal",
                message:
                    error instanceof Error
                        ? error.message
                        : "Gagal membuat order.",
            });
        } finally {
            setIsSubmitting(false);
            setIsPaymentPopupOpening(false);
        }
    };

    const selectedProductIdSet = useMemo(
        () => (selectedProductIds ? new Set(selectedProductIds) : null),
        [selectedProductIds],
    );

    const checkoutItems = useMemo(
        () =>
            selectedProductIdSet
                ? cart.items.filter((item) =>
                      selectedProductIdSet.has(item.productId),
                  )
                : cart.items,
        [cart.items, selectedProductIdSet],
    );

    const checkoutSummary = useMemo(() => {
        const subtotal = checkoutItems.reduce(
            (sum, item) => sum + item.price * item.qty,
            0,
        );
        const itemCount = checkoutItems.reduce((sum, item) => sum + item.qty, 0);
        const shipping = subtotal > 0 ? cart.summary.shipping : 0;
        const tax = subtotal > 0 ? cart.summary.tax : 0;

        return {
            subtotal,
            shipping,
            tax,
            total: subtotal + shipping + tax,
            itemCount,
        };
    }, [cart.summary.shipping, cart.summary.tax, checkoutItems]);

    const isCartEmpty = checkoutItems.length === 0;

    const inputClass =
        "w-full rounded-lg border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

    return (
        <AuthGuard loginPath="/customer/login">
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
                {user ? <HeaderUser /> : <HeaderGuest />}

                <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:space-y-8 sm:py-8">
                    <div className="flex flex-col gap-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                        <div>
                            <p className="text-sm font-semibold text-blue-600">
                                Secure Checkout
                            </p>
                            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                                Complete Your Order
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Pembayaran akan diproses langsung melalui Midtrans.
                                Setelah checkout, popup pembayaran akan tampil di
                                halaman ini tanpa membuka link baru.
                            </p>
                        </div>

                        <div className="flex w-fit items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                            <ShieldCheck className="h-4 w-4" />
                            Protected checkout
                        </div>
                    </div>

                    <form
                        onSubmit={handlePlaceOrder}
                        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
                    >
                        <div className="space-y-6 lg:col-span-2">
                            <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/50">
                                <div className="border-b border-blue-100 bg-blue-50/70 p-5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                                            <Truck className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                                Delivery
                                            </p>
                                            <h2 className="font-bold text-gray-950">
                                                Shipping Information
                                            </h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                        <input
                                            required
                                            value={form.firstName}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    firstName: event.target.value,
                                                }))
                                            }
                                            placeholder="First Name"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                        <input
                                            required
                                            value={form.lastName}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    lastName: event.target.value,
                                                }))
                                            }
                                            placeholder="Last Name"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="relative sm:col-span-2">
                                        <Home className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                        <input
                                            required
                                            value={form.address}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    address: event.target.value,
                                                }))
                                            }
                                            placeholder="Address"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                        <input
                                            required
                                            value={form.city}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    city: event.target.value,
                                                }))
                                            }
                                            placeholder="City"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                        <input
                                            required
                                            value={form.postalCode}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    postalCode: event.target.value,
                                                }))
                                            }
                                            placeholder="Postal Code"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-5 shadow-sm shadow-blue-100/40">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                                        <ShieldCheck className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="font-bold text-gray-950">
                                            Review your details before payment
                                        </p>
                                        <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                            Pastikan alamat pengiriman sudah benar.
                                            Setelah menekan Place Order, pembayaran
                                            aman akan terbuka melalui popup Midtrans
                                            di halaman ini.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                            <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/50">
                                <div className="border-b border-blue-100 bg-gray-950 p-5 text-white">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-300 ring-1 ring-white/10">
                                            <PackageCheck className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                                                Summary
                                            </p>
                                            <h3 className="font-bold">
                                                Order Summary
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5 p-5 sm:p-6">
                                    {checkoutItems.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 p-5 text-center text-sm text-slate-500">
                                            Belum ada item checkout. Summary akan
                                            terisi setelah Anda memilih produk di
                                            cart.
                                        </div>
                                    ) : (
                                        <>
                                            {checkoutItems.map((item) => (
                                                <div
                                                    key={item.productId}
                                                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                                >
                                                    <div className="flex justify-between gap-4">
                                                        <div>
                                                            <p className="font-bold text-gray-950">
                                                                {item.name}
                                                            </p>
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                Quantity: {item.qty}
                                                            </p>
                                                        </div>
                                                        <span className="font-bold text-gray-950">
                                                            Rp{" "}
                                                            {(item.price * item.qty).toLocaleString(
                                                                "id-ID",
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        {t("Subtotal")}
                                                    </span>
                                                    <span className="font-semibold text-gray-950">
                                                        Rp{" "}
                                                        {checkoutSummary.subtotal.toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        {t("Shipping")}
                                                    </span>
                                                    <span className="rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-green-100">
                                                        {t("FREE")}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-gray-950">
                                                        {t("Total")}
                                                    </span>
                                                    <span className="text-2xl font-extrabold text-blue-700">
                                                        Rp{" "}
                                                        {checkoutSummary.total.toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || isCartEmpty}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting
                                            ? isPaymentPopupOpening
                                                ? t("Opening Popup...")
                                                : t("Processing...")
                                            : t("Continue Checkout")}
                                        {isSubmitting ? (
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <ArrowRight className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                                    <ShieldCheck className="h-5 w-5 text-green-700" />
                                    <p className="text-sm font-semibold text-green-900">
                                        {t("Your purchase is protected")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                    <p className="text-sm font-semibold text-blue-900">
                                        {t("Fast processing after payment confirmation")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <Footer />
            </div>
        </AuthGuard>
    );
}

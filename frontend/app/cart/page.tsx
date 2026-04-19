"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    CreditCard,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Tag,
    Trash2,
    Truck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";
import AuthGuard from "@/app/components/auth/AuthGuard";
import {
    fetchCart,
    removeCartItem,
    type CartItem,
    type CartResponse,
    updateCartItem,
} from "@/lib/store";

export default function CartPage() {
    const { user } = useAuth();
    const { refreshCartCount } = useShop();
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadCart = async () => {
            try {
                const response = await fetchCart();

                if (mounted) {
                    setCart(response);
                }
            } catch {
                if (mounted) {
                    setCart({
                        items: [],
                        summary: {
                            subtotal: 0,
                            shipping: 0,
                            tax: 0,
                            total: 0,
                            itemCount: 0,
                        },
                    });
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadCart();

        return () => {
            mounted = false;
        };
    }, []);

    const syncCart = async (updater: Promise<CartResponse>) => {
        try {
            const response = await updater;
            setCart(response);
            await refreshCartCount();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Gagal update cart.");
        }
    };

    const increaseQty = (item: CartItem) => {
        void syncCart(updateCartItem(item.productId, item.qty + 1));
    };

    const decreaseQty = (item: CartItem) => {
        void syncCart(updateCartItem(item.productId, Math.max(item.qty - 1, 0)));
    };

    const removeItem = (item: CartItem) => {
        void syncCart(removeCartItem(item.productId));
    };

    return (
        <AuthGuard loginPath="/customer/login">
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
                {user ? <HeaderUser /> : <HeaderGuest />}

                <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:space-y-8 sm:py-8">
                    <div className="flex flex-col gap-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                        <div>
                            <p className="text-sm font-semibold text-blue-600">
                                Your Cart
                            </p>
                            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                                Shopping Cart
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Semua isi cart sekarang mengikuti data database
                                per customer.
                            </p>
                        </div>

                        <div className="w-fit rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                            {cart.summary.itemCount}{" "}
                            {cart.summary.itemCount === 1 ? "item" : "items"} in
                            cart
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="space-y-4 lg:col-span-2">
                            {isLoading ? (
                                Array.from({ length: 2 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-40 animate-pulse rounded-lg border border-blue-100 bg-blue-50"
                                    />
                                ))
                            ) : cart.items.length === 0 ? (
                                <div className="rounded-lg border border-blue-100 bg-white px-6 py-20 text-center shadow-sm shadow-blue-100/50">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                        <ShoppingBag className="h-8 w-8" />
                                    </div>
                                    <p className="font-bold text-gray-950">
                                        Your cart is empty
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Data cart masih kosong. Saat customer
                                        menambahkan produk, semuanya akan tersimpan
                                        di backend.
                                    </p>

                                    <Link
                                        href="/product"
                                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700"
                                    >
                                        Start Shopping
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ) : (
                                cart.items.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/50 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
                                    >
                                        <div className="flex flex-col gap-4 p-4 sm:flex-row">
                                            <div className="h-44 w-full shrink-0 overflow-hidden rounded-lg bg-blue-50 p-2 ring-1 ring-blue-100 sm:h-28 sm:w-28">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full rounded-md object-cover transition duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center rounded-md bg-white text-sm font-semibold text-blue-600">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-gray-950 transition group-hover:text-blue-700">
                                                            {item.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {item.category ?? "Catalog item"}
                                                        </p>
                                                    </div>
                                                    <div className="sm:text-right">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                            Unit Price
                                                        </p>
                                                        <p className="font-bold text-gray-950">
                                                            Rp {item.price.toLocaleString("id-ID")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1.5 shadow-inner">
                                                        <button
                                                            type="button"
                                                            onClick={() => decreaseQty(item)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm ring-1 ring-gray-100 transition hover:bg-blue-50 hover:text-blue-700"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>

                                                        <span className="min-w-8 text-center font-bold text-gray-950">
                                                            {item.qty}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => increaseQty(item)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                                                            Rp{" "}
                                                            {(item.price * item.qty).toLocaleString(
                                                                "id-ID",
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item)}
                                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:-translate-y-0.5 hover:bg-red-600 hover:text-white"
                                                            aria-label={`Remove ${item.name}`}
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                            <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/50">
                                <div className="border-b border-blue-100 bg-blue-50/70 p-5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                                            <CreditCard className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                                Checkout
                                            </p>
                                            <h3 className="font-bold text-gray-950">
                                                Order Summary
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5 p-5 sm:p-6">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">
                                                Subtotal
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                Rp {cart.summary.subtotal.toLocaleString("id-ID")}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-700">
                                                Shipping
                                            </span>
                                            <span className="rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-green-100">
                                                FREE
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-700">
                                                Estimated Tax
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                Rp {cart.summary.tax.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-950">
                                                Total
                                            </span>
                                            <span className="text-2xl font-extrabold text-blue-700">
                                                Rp {cart.summary.total.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href="/checkout"
                                        className={`flex w-full items-center justify-center gap-2 rounded-lg py-4 font-bold text-white shadow-lg transition ${
                                            cart.items.length === 0
                                                ? "pointer-events-none bg-gray-300 shadow-none"
                                                : "bg-blue-600 shadow-blue-100 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200"
                                        }`}
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 gap-3 border-t border-gray-100 p-5 text-sm">
                                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                                        <span className="font-semibold text-gray-700">
                                            Secure encrypted checkout
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                        <span className="font-semibold text-gray-700">
                                            Free shipping available
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <Tag className="mt-0.5 h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-bold text-blue-900">
                                            Member Perk
                                        </p>
                                        <p className="mt-1 text-sm text-blue-800">
                                            Isi cart tetap tersimpan di database,
                                            jadi customer bisa login lagi dan item
                                            sebelumnya masih ada.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </AuthGuard>
    );
}

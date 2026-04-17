"use client";

import { useState } from "react";
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
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";

export default function CartPage() {
    const { user } = useAuth();

    const [items, setItems] = useState([
        {
            id: 1,
            name: "NexaBook Pro 16",
            price: 1499,
            qty: 1,
            image: "https://images.unsplash.com/photo-1658262530868-f7460e2f071f?q=80&w=1080",
        },
        {
            id: 3,
            name: "MechStrike X9",
            price: 129,
            qty: 2,
            image: "https://images.unsplash.com/photo-1702879430712-b318895c88ee?q=80&w=1080",
        },
    ]);

    const increaseQty = (id: number) => {
        setItems(
            items.map((item) =>
                item.id === id ? { ...item, qty: item.qty + 1 } : item,
            ),
        );
    };

    const decreaseQty = (id: number) => {
        setItems(
            items.map((item) =>
                item.id === id && item.qty > 1
                    ? { ...item, qty: item.qty - 1 }
                    : item,
            ),
        );
    };

    const removeItem = (id: number) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const subtotal = items.reduce(
        (acc, item) => acc + item.price * item.qty,
        0,
    );
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const itemCount = items.reduce((acc, item) => acc + item.qty, 0);

    const formatPrice = (num: number) => num.toLocaleString("en-US");

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
            {user ? <HeaderUser /> : <HeaderGuest />}

            <div className="w-full flex-1 max-w-6xl mx-auto px-4 py-6 space-y-6 sm:py-8 sm:space-y-8">
                <div className="flex flex-col gap-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                    <div>
                        <p className="text-sm font-semibold text-blue-600">
                            Your Cart
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                            Shopping Cart
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Review your selected items before checkout.
                        </p>
                    </div>

                    <div className="w-fit rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                        {itemCount} {itemCount === 1 ? "item" : "items"} in
                        cart
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/50 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
                            >
                                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                                    <div className="h-44 w-full shrink-0 overflow-hidden rounded-lg bg-blue-50 p-2 ring-1 ring-blue-100 sm:h-28 sm:w-28">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full rounded-md object-cover transition duration-500 group-hover:scale-110"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1 flex flex-col justify-between gap-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-950 transition group-hover:text-blue-700">
                                                    {item.name}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Premium tech selection
                                                </p>
                                            </div>
                                            <div className="sm:text-right">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Unit Price
                                                </p>
                                                <p className="font-bold text-gray-950">
                                                    ${formatPrice(item.price)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1.5 shadow-inner">
                                                <button
                                                    onClick={() =>
                                                        decreaseQty(item.id)
                                                    }
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm ring-1 ring-gray-100 transition hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>

                                                <span className="min-w-8 text-center font-bold text-gray-950">
                                                    {item.qty}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        increaseQty(item.id)
                                                    }
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                                                    $
                                                    {formatPrice(
                                                        item.price * item.qty,
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
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
                        ))}

                        {items.length === 0 && (
                            <div className="rounded-lg border border-blue-100 bg-white px-6 py-20 text-center shadow-sm shadow-blue-100/50">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                    <ShoppingBag className="h-8 w-8" />
                                </div>
                                <p className="font-bold text-gray-950">
                                    Your cart is empty
                                </p>
                                <p className="mt-2 text-sm text-gray-500">
                                    Add a product to start building your order.
                                </p>

                                <Link
                                    href="/product"
                                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700"
                                >
                                    Start Shopping
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
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
                                            ${formatPrice(subtotal)}
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
                                            ${tax.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-950">
                                            Total
                                        </span>
                                        <span className="text-2xl font-extrabold text-blue-700">
                                            ${formatPrice(total)}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className={`flex w-full items-center justify-center gap-2 rounded-lg py-4 font-bold text-white shadow-lg transition ${
                                        items.length === 0
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
                                        Complete checkout today and keep your
                                        order ready for fast processing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

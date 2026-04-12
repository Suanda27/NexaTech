"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";

export default function CartPage() {
    const { user } = useAuth();

    // ✅ STATE (BIAR BUTTON HIDUP)
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

    // ✅ FUNCTION TAMBAH / KURANG
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

    const formatPrice = (num: number) => num.toLocaleString("en-US");

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {user ? <HeaderUser /> : <HeaderGuest />}

            <div className="flex-1 max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* 🔥 PERTEGAS TEXT */}
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Shopping Cart
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-md"
                            >
                                <div className="h-24 w-24 bg-gray-100 rounded-xl overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between">
                                        {/* 🔥 TEXT LEBIH JELAS */}
                                        <h3 className="font-semibold text-gray-900">
                                            {item.name}
                                        </h3>
                                        <p className="font-bold text-gray-900">
                                            ${formatPrice(item.price)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        {/* 🔥 BUTTON FIX */}
                                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
                                            <button
                                                onClick={() =>
                                                    decreaseQty(item.id)
                                                }
                                                className="p-2 bg-white rounded shadow hover:bg-gray-200"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>

                                            <span className="font-bold text-gray-900">
                                                {item.qty}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    increaseQty(item.id)
                                                }
                                                className="p-2 bg-white rounded shadow hover:bg-gray-200"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {items.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">
                                    Your cart is empty
                                </p>

                                <Link
                                    href="/product"
                                    className="mt-4 inline-block text-blue-600 font-bold"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-2 text-sm">
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
                                    <span className="text-green-600 font-bold text-xs">
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

                            <div className="flex justify-between border-t pt-4">
                                <span className="font-bold text-gray-900">
                                    Total
                                </span>
                                <span className="text-xl font-extrabold text-blue-600">
                                    ${formatPrice(total)}
                                </span>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full bg-blue-600 text-white text-center py-4 rounded-xl font-bold hover:bg-blue-700"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>

                        <div className="bg-blue-100 p-4 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <strong>Secure Checkout:</strong> All
                                transactions are protected.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

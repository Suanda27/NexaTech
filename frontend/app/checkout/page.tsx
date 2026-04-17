"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    CreditCard,
    Home,
    Mail,
    MapPin,
    PackageCheck,
    ShieldCheck,
    Truck,
    User,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [payment, setPayment] = useState("transfer");

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Order placed with ${payment}`);
        router.push("/profile");
    };

    const paymentMethods = [
        {
            id: "transfer",
            title: "Bank Transfer",
            description: "Upload payment proof after placing your order.",
            icon: CreditCard,
        },
        {
            id: "cod",
            title: "Cash on Delivery",
            description: "Pay directly when the courier arrives.",
            icon: Banknote,
        },
    ];

    const inputClass =
        "w-full rounded-lg border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
            {user ? <HeaderUser /> : <HeaderGuest />}

            <div className="w-full flex-1 max-w-6xl mx-auto px-4 py-6 space-y-6 sm:py-8 sm:space-y-8">
                <div className="flex flex-col gap-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                    <div>
                        <p className="text-sm font-semibold text-blue-600">
                            Secure Checkout
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                            Complete Your Order
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Confirm shipping details and choose your payment
                            method.
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
                                        placeholder="First Name"
                                        className={inputClass}
                                    />
                                </div>

                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                    <input
                                        required
                                        placeholder="Last Name"
                                        className={inputClass}
                                    />
                                </div>

                                <div className="relative sm:col-span-2">
                                    <Home className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                    <input
                                        required
                                        placeholder="Address"
                                        className={inputClass}
                                    />
                                </div>

                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                    <input
                                        required
                                        placeholder="City"
                                        className={inputClass}
                                    />
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                    <input
                                        required
                                        placeholder="Postal Code"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/50">
                            <div className="border-b border-blue-100 bg-blue-50/70 p-5">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                                        <CreditCard className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                            Payment
                                        </p>
                                        <h2 className="font-bold text-gray-950">
                                            Payment Method
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    const isActive = payment === method.id;

                                    return (
                                        <label
                                            key={method.id}
                                            className={`group relative cursor-pointer rounded-lg border p-4 transition duration-300 hover:-translate-y-0.5 ${
                                                isActive
                                                    ? "border-blue-300 bg-blue-50 shadow-lg shadow-blue-100"
                                                    : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/60"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                checked={isActive}
                                                onChange={() =>
                                                    setPayment(method.id)
                                                }
                                                className="sr-only"
                                            />

                                            <div className="flex items-start gap-3">
                                                <span
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 transition ${
                                                        isActive
                                                            ? "bg-blue-600 text-white ring-blue-600"
                                                            : "bg-gray-50 text-blue-600 ring-gray-200 group-hover:ring-blue-200"
                                                    }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </span>

                                                <div>
                                                    <p className="font-bold text-gray-950">
                                                        {method.title}
                                                    </p>
                                                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                                                        {method.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {isActive && (
                                                <BadgeCheck className="absolute right-4 top-4 h-5 w-5 text-blue-600" />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </section>
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
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex justify-between gap-4">
                                        <div>
                                            <p className="font-bold text-gray-950">
                                                NexaBook Pro 16
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Quantity: 1
                                            </p>
                                        </div>
                                        <span className="font-bold text-gray-950">
                                            $1,499
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Subtotal
                                        </span>
                                        <span className="font-semibold text-gray-950">
                                            $1,499.00
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Shipping
                                        </span>
                                        <span className="rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-green-100">
                                            FREE
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-950">
                                            Total
                                        </span>
                                        <span className="text-2xl font-extrabold text-blue-700">
                                            $1,499.00
                                        </span>
                                    </div>
                                </div>

                                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200">
                                    Place Order
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                                <ShieldCheck className="h-5 w-5 text-green-700" />
                                <p className="text-sm font-semibold text-green-900">
                                    Your purchase is protected
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <p className="text-sm font-semibold text-blue-900">
                                    Fast processing after payment confirmation
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}

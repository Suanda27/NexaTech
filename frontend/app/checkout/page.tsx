"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Truck, ShieldCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();

    // 🔥 STATE PAYMENT
    const [payment, setPayment] = useState("transfer");

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Order placed with ${payment}`);
        router.push("/profile");
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {user ? <HeaderUser /> : <HeaderGuest />}

            <div className="flex-1 max-w-5xl mx-auto px-4 py-10 space-y-10">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Checkout
                </h1>

                <form
                    onSubmit={handlePlaceOrder}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                >
                    {/* LEFT */}
                    <div className="space-y-8">
                        {/* SHIPPING */}
                        <section className="space-y-6">
                            <h2 className="flex items-center gap-2 font-bold text-xl text-gray-900">
                                <Truck className="h-5 w-5 text-blue-600" />
                                Shipping Information
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    required
                                    placeholder="First Name"
                                    className="p-3 rounded-lg border border-gray-400 bg-white text-gray-900"
                                />
                                <input
                                    required
                                    placeholder="Last Name"
                                    className="p-3 rounded-lg border border-gray-400 bg-white text-gray-900"
                                />
                                <input
                                    required
                                    placeholder="Address"
                                    className="col-span-2 p-3 rounded-lg border border-gray-400 bg-white text-gray-900"
                                />
                                <input
                                    required
                                    placeholder="City"
                                    className="p-3 rounded-lg border border-gray-400 bg-white text-gray-900"
                                />
                                <input
                                    required
                                    placeholder="Postal Code"
                                    className="p-3 rounded-lg border border-gray-400 bg-white text-gray-900"
                                />
                            </div>
                        </section>

                        {/* PAYMENT */}
                        <section className="space-y-6 border-t border-gray-300 pt-8">
                            <h2 className="flex items-center gap-2 font-bold text-xl text-gray-900">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                Payment Method
                            </h2>

                            <div className="space-y-4">
                                {/* TRANSFER */}
                                <label
                                    onClick={() => setPayment("transfer")}
                                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition
                                    ${
                                        payment === "transfer"
                                            ? "border-2 border-blue-500 bg-blue-100"
                                            : "border border-gray-400 bg-white hover:bg-gray-100"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        checked={payment === "transfer"}
                                        readOnly
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">
                                            Bank Transfer
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            Transfer via bank
                                        </p>
                                    </div>
                                </label>

                                {/* COD */}
                                <label
                                    onClick={() => setPayment("cod")}
                                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition
                                    ${
                                        payment === "cod"
                                            ? "border-2 border-blue-500 bg-blue-100"
                                            : "border border-gray-400 bg-white hover:bg-gray-100"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        checked={payment === "cod"}
                                        readOnly
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">
                                            Cash on Delivery (COD)
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            Pay when item arrives
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 text-white p-8 rounded-3xl space-y-6 shadow-xl">
                            <h3 className="font-bold text-xl border-b border-white/30 pb-4">
                                Order Summary
                            </h3>

                            <div className="flex justify-between">
                                <span>NexaBook Pro 16</span>
                                <span>$1,499</span>
                            </div>

                            <div className="border-t border-white/30 pt-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>$1,499.00</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-green-400">FREE</span>
                                </div>

                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-blue-400">
                                        $1,499.00
                                    </span>
                                </div>
                            </div>

                            <button className="w-full bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-700">
                                Place Order
                            </button>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-green-200 rounded-xl border border-green-300">
                            <ShieldCheck className="h-5 w-5 text-green-700" />
                            <p className="text-sm font-semibold text-green-900">
                                Your purchase is protected
                            </p>
                        </div>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}

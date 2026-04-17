"use client";

import { useState } from "react";
import OrderCard from "./OrderCard";
import { OrderType } from "@/app/types/order";

export default function OrderHistorySection() {
    const [active, setActive] = useState<"bank" | "cod">("bank");

    const orders: OrderType[] = [
        {
            id: "001",
            status: "Processing",
            method: "bank",
            date: "April 5, 2026",
            total: 1389.97,
            isPaid: true,
            items: [
                {
                    name: "Premium Laptop Pro",
                    image: "/images/laptop.jpg",
                    qty: 1,
                    price: 1299.99,
                },
                {
                    name: "Wireless Mouse",
                    image: "/images/mouse.jpg",
                    qty: 2,
                    price: 89.98,
                },
            ],
        },
        {
            id: "002",
            status: "Delivered",
            method: "bank",
            date: "April 6, 2026",
            total: 599.99,
            isPaid: true,
            items: [
                {
                    name: "Smart Tablet",
                    image: "/images/tablet.jpg",
                    qty: 1,
                    price: 599.99,
                },
            ],
        },
        {
            id: "003",
            status: "Declined",
            method: "bank",
            date: "April 7, 2026",
            total: 499.99,
            isPaid: false,
            declineReason: "Payment verification failed.",
            items: [
                {
                    name: "Keyboard",
                    image: "/images/keyboard.jpg",
                    qty: 1,
                    price: 499.99,
                },
            ],
        },

        // COD
        {
            id: "004",
            status: "Processing",
            method: "cod",
            date: "April 8, 2026",
            total: 800,
            isPaid: false,
            items: [
                {
                    name: "Monitor",
                    image: "/images/monitor.jpg",
                    qty: 1,
                    price: 800,
                },
            ],
        },
        {
            id: "005",
            status: "Delivered",
            method: "cod",
            date: "April 9, 2026",
            total: 299.99,
            isPaid: false,
            items: [
                {
                    name: "Headphones",
                    image: "/images/headphone.jpg",
                    qty: 1,
                    price: 299.99,
                },
            ],
        },
        {
            id: "006",
            status: "Declined",
            method: "cod",
            date: "April 10, 2026",
            total: 199.99,
            isPaid: false,
            declineReason: "Address not reachable.",
            items: [
                {
                    name: "Webcam",
                    image: "/images/webcam.jpg",
                    qty: 1,
                    price: 199.99,
                },
            ],
        },
    ];

    const filtered = orders.filter((o) => o.method === active);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6 shadow-sm sm:p-6">
            {/* TITLE */}
            <h2 className="text-xl font-bold text-gray-900 mb-5">
                Order History
            </h2>

            {/* TOGGLE */}
            <div className="flex w-full gap-2 overflow-x-auto rounded-lg bg-gray-100 p-1 mb-6 sm:w-fit">
                <button
                    onClick={() => setActive("bank")}
                    className={`min-w-max px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 sm:px-6 ${
                        active === "bank"
                            ? "bg-white text-black shadow-md"
                            : "text-gray-500 hover:text-black"
                    }`}
                >
                    Bank Transfer
                </button>

                <button
                    onClick={() => setActive("cod")}
                    className={`min-w-max px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 sm:px-6 ${
                        active === "cod"
                            ? "bg-white text-black shadow-md"
                            : "text-gray-500 hover:text-black"
                    }`}
                >
                    Cash on Delivery
                </button>
            </div>

            {/* LIST */}
            <div className="space-y-6">
                {filtered.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
}

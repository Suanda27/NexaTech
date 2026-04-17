"use client";

import { Package, User } from "lucide-react";

interface SidebarProps {
    active: string;
    setActive: (value: string) => void;
}

export default function Sidebar({ active, setActive }: SidebarProps) {
    const menu = [
        {
            id: "orders",
            label: "Order History",
            description: "Track your purchases",
            icon: Package,
        },
        {
            id: "personal",
            label: "Personal Info",
            description: "Manage your account",
            icon: User,
        },
    ];

    return (
        <aside className="w-full shrink-0 border-b border-blue-100 bg-white p-4 shadow-sm lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:p-5">
            <div className="hidden lg:block">
                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Profile Menu
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        Manage your orders and account information from one
                        place.
                    </p>
                </div>
            </div>

            {/* MENU */}
            <div className="flex gap-2 overflow-x-auto pb-1 lg:mt-5 lg:block lg:space-y-2 lg:overflow-visible lg:rounded-lg lg:border lg:border-gray-200 lg:bg-gray-50 lg:p-2 lg:pb-2">
                {menu.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={`group relative flex min-w-max items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-all duration-300 lg:w-full ${
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                    : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-100 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-100"
                            }`}
                        >
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 transition ${
                                    isActive
                                        ? "bg-white/15 text-white ring-white/20"
                                        : "bg-white text-gray-500 ring-gray-200 group-hover:text-blue-600 group-hover:ring-blue-200"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                            </span>

                            <span>
                                <span className="block">{item.label}</span>
                                <span
                                    className={`hidden text-xs font-medium lg:block ${
                                        isActive
                                            ? "text-blue-100"
                                            : "text-gray-400 group-hover:text-blue-500"
                                    }`}
                                >
                                    {item.description}
                                </span>
                            </span>

                            {isActive && (
                                <span className="absolute bottom-2 left-4 right-4 h-px bg-white/30 lg:bottom-auto lg:left-auto lg:right-2 lg:top-1/2 lg:h-8 lg:w-1 lg:-translate-y-1/2 lg:rounded-full lg:bg-white" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-5 hidden rounded-lg border border-gray-200 bg-white p-4 text-xs text-gray-500 shadow-sm lg:block">
                Tip: Check your order status regularly after payment or
                cancellation.
            </div>
        </aside>
    );
}

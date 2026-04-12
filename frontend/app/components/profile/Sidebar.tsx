"use client";

import { Package, User } from "lucide-react";

interface SidebarProps {
    active: string;
    setActive: (value: string) => void;
}

export default function Sidebar({ active, setActive }: SidebarProps) {
    return (
        <div className="w-64 min-h-screen bg-white border-r border-gray-200 p-5">
            {/* MENU */}
            <div className="space-y-2">
                {/* ORDER HISTORY */}
                <button
                    onClick={() => setActive("orders")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
          ${
              active === "orders"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
                >
                    <Package
                        className={`w-5 h-5 ${
                            active === "orders" ? "text-white" : "text-gray-500"
                        }`}
                    />
                    Order History
                </button>

                {/* PERSONAL INFO */}
                <button
                    onClick={() => setActive("personal")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
          ${
              active === "personal"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
                >
                    <User
                        className={`w-5 h-5 ${
                            active === "personal"
                                ? "text-white"
                                : "text-gray-500"
                        }`}
                    />
                    Personal Info
                </button>
            </div>

            {/* OPTIONAL: FOOT NOTE */}
            <div className="mt-10 text-xs text-gray-400 px-2">
                Account Settings
            </div>
        </div>
    );
}

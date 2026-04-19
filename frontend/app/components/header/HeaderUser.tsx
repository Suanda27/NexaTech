"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    LogOut,
    Search,
    ShoppingCart,
    User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";

export default function HeaderUser() {
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const { user, logout } = useAuth();
    const { cartCount, setCartCount } = useShop();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                event.target instanceof Node &&
                !dropdownRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setCartCount(0);
        setMenuOpen(false);
        router.replace("/customer/login");
    };

    return (
        <header className="w-full border-b bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logoNexaTech.png"
                        alt="NexaTech Logo"
                        width={120}
                        height={48}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Search */}
                <div className="hidden flex-1 px-6 md:block">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />

                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Right Menu */}
                <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                    {/* Products */}
                    <Link
                        href="/product"
                        className="hidden text-gray-700 font-medium hover:text-black md:block"
                    >
                        Products
                    </Link>

                    {/* Cart */}
                    <Link href="/cart" className="relative">
                        <ShoppingCart className="text-gray-700" size={22} />

                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                            {cartCount}
                        </span>
                    </Link>

                    {/* Profile */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                <User size={18} />
                            </div>
                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-semibold text-gray-900">
                                    {user?.name ?? "Account"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.email ?? "Signed in"}
                                </p>
                            </div>
                            <ChevronDown size={16} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-blue-100/70 transition duration-150 ease-out">
                                <Link
                                    href="/profile?tab=orders"
                                    className="block rounded-xl px-4 py-3 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Order History
                                </Link>
                                <Link
                                    href="/profile?tab=personal"
                                    className="block rounded-xl px-4 py-3 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Personal Info
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="border-t px-4 py-3 md:hidden">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </header>
    );
}

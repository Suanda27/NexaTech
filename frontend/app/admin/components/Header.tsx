"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    LogOut,
    Menu,
    Search,
    Shield,
    User,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
    mobileOpen: boolean;
    onToggle: () => void;
}

export default function Header({ mobileOpen, onToggle }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const { user, logout } = useAuth();

    const adminInfo = useMemo(
        () => ({
            name: user?.name ?? "Administrator",
            role: user?.role === "admin" ? "Administrator" : "Staff",
        }),
        [user],
    );

    const handleLogout = async () => {
        await logout();
        setMenuOpen(false);
        router.replace("/admin/login");
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                event.target instanceof Node &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/92 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:gap-4 lg:px-8">
                <div className="flex min-w-0 items-center gap-3 lg:flex-1">
                    <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100 lg:hidden"
                        onClick={onToggle}
                        aria-label="Toggle sidebar"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <div className="hidden min-w-0 flex-1 lg:block">
                    <div className="relative w-full max-w-2xl">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search admin panel..."
                            className="w-full rounded-lg border border-blue-100 bg-slate-50 py-2.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div
                    className="relative ml-auto flex shrink-0 items-center gap-2 sm:gap-3"
                    ref={menuRef}
                >
                    <div className="hidden min-w-0 sm:flex flex-col text-right">
                        <span className="text-sm font-semibold text-slate-900">
                            {adminInfo.name}
                        </span>
                        <span className="inline-flex items-center justify-end gap-1 text-xs text-blue-600">
                            <Shield size={12} />
                            {adminInfo.role}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 text-blue-700 shadow-sm transition hover:bg-blue-50"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <User size={16} />
                        </div>
                        <ChevronDown size={16} />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-12 z-20 w-56 rounded-lg border border-blue-100 bg-white p-2 shadow-xl shadow-blue-100/70">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="border-t border-blue-50 px-4 py-3 lg:hidden">
                <div className="relative">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search admin panel..."
                        className="w-full rounded-lg border border-blue-100 bg-slate-50 py-2.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                </div>
            </div>
        </header>
    );
}

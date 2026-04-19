"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    ChevronRight,
    FolderTree,
    LayoutDashboard,
    LogOut,
    Package,
    Shield,
    ShoppingCart,
    Sparkles,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menu = [
    {
        id: "dashboard",
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        id: "kategori",
        label: "Manajemen Kategori",
        href: "/admin/category",
        icon: FolderTree,
    },
    {
        id: "produk",
        label: "Manajemen Produk",
        href: "/admin/product",
        icon: Package,
    },
    {
        id: "order",
        label: "Manajemen Order",
        href: "/admin/order",
        icon: ShoppingCart,
    },
];

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const getActiveMenu = () => {
        if (pathname === "/admin/category") return "kategori";
        if (pathname === "/admin/product") return "produk";
        if (pathname === "/admin/order") return "order";
        if (pathname === "/admin") return "dashboard";
        return "dashboard";
    };

    const [active, setActive] = useState(getActiveMenu());

    useEffect(() => {
        setActive(getActiveMenu());
    }, [pathname]);

    const handleMenuClick = (itemId: string, href: string) => {
        setActive(itemId);
        router.push(href);
        if (window.innerWidth < 1024) {
            onToggle();
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/admin/login");
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
                    onClick={onToggle}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[280px] transform flex-col border-r border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_28px_60px_-34px_rgba(15,23,42,0.45)] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div className="flex items-center justify-between border-b border-blue-100 px-5 py-4 lg:hidden">
                    <div>
                        <p className="text-lg font-semibold text-slate-950">
                            NexaTech
                        </p>
                        <p className="text-sm text-blue-600">Admin Menu</p>
                    </div>
                    <button
                        onClick={onToggle}
                        className="rounded-lg p-2 text-blue-700 transition hover:bg-blue-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="border-b border-blue-100 px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-950">
                                NexaTech Admin
                            </p>
                            <p className="text-sm text-slate-500">
                                Commerce control center
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-5">
                    <div className="rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4 shadow-[0_18px_38px_-32px_rgba(37,99,235,0.75)]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-blue-100">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-slate-500">
                                    Hello,
                                </p>
                                <p className="truncate text-base font-semibold text-slate-950">
                                    {user?.name ?? "Administrator"}
                                </p>
                                <p className="mt-1 text-xs font-medium text-blue-700">
                                    {user?.role === "admin"
                                        ? "Administrator"
                                        : "Team Member"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-5">
                    <nav className="space-y-1.5">
                        {menu.map((item) => {
                            const Icon = item.icon;
                            const isActive = active === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() =>
                                        handleMenuClick(item.id, item.href)
                                    }
                                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                            : "text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                                    }`}
                                >
                                    <Icon
                                        size={18}
                                        className={
                                            isActive
                                                ? "text-white"
                                                : "text-blue-600"
                                        }
                                    />
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <ChevronRight
                                            className="ml-auto text-white/80"
                                            size={16}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-blue-100 px-5 py-5">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}

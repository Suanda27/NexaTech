"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FolderTree,
    Package,
    ShoppingCart,
    LogOut,
    ChevronRight,
    X,
} from "lucide-react";

const menu = [
    { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { id: "kategori", label: "Manajemen Kategori", href: "/admin/category", icon: FolderTree },
    { id: "produk", label: "Manajemen Produk", href: "/admin/product", icon: Package },
    { id: "order", label: "Manajemen Order", href: "/admin/order", icon: ShoppingCart },
];

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

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

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                    onClick={onToggle}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex items-center justify-between border-b border-blue-100 px-4 py-4 lg:hidden">
                    <div>
                        <p className="text-lg font-semibold text-slate-900">NexaTech</p>
                        <p className="text-sm text-blue-600">Admin Menu</p>
                    </div>
                    <button
                        onClick={onToggle}
                        className="rounded-2xl p-2 text-blue-600 hover:bg-blue-50 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="border-b border-blue-100 px-6 py-6 lg:px-6 lg:py-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 shadow-sm">
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">NexaTech Admin</p>
                            <p className="text-sm text-blue-600">Control panel</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-6 lg:px-6 lg:py-8">
                    <div className="mb-6 rounded-3xl bg-blue-50 p-4 text-blue-700 shadow-sm">
                        <p className="text-sm font-semibold">Hello, Raka</p>
                        <p className="mt-1 text-xs text-slate-600">Administrator</p>
                    </div>

                    <nav className="space-y-2">
                        {menu.map((item) => {
                            const Icon = item.icon;
                            const isActive = active === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleMenuClick(item.id, item.href)}
                                    className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-900'}`}
                                >
                                    <Icon size={18} className={isActive ? 'text-white' : 'text-blue-600'} />
                                    <span>{item.label}</span>
                                    {isActive && <ChevronRight className="ml-auto text-white/80" size={16} />}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto border-t border-blue-100 px-6 py-6 lg:px-6">
                    <button className="flex w-full items-center justify-center gap-2 rounded-3xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}

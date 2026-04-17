"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FolderTree,
    Package,
    ShoppingCart,
    LogOut,
} from "lucide-react";

const menu = [
    { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { id: "kategori", label: "Manajemen Kategori", href: "/admin/category", icon: FolderTree },
    { id: "produk", label: "Manajemen Produk", href: "/admin/product", icon: Package },
    { id: "order", label: "Manajemen Order", href: "/admin/order", icon: ShoppingCart },
];

export default function Sidebar() {
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

    return (
        <aside className="w-full shrink-0 bg-white border-b flex flex-col lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
            <div className="p-4 font-bold text-lg lg:p-6">NexaTech Admin</div>

            <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-1 lg:flex-col lg:space-y-2 lg:overflow-visible lg:py-4">
                {menu.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActive(item.id);
                                router.push(item.href);
                            }}
                            className={`flex min-w-max items-center gap-3 px-4 py-3 rounded-lg transition lg:w-full ${
                                isActive
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                        >
                            <Icon size={20} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="hidden p-4 lg:block">
                <button className="flex gap-3 text-red-600 hover:bg-red-50 w-full px-4 py-3 rounded-lg">
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

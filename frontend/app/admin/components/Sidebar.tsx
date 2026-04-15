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
        <aside className="w-64 bg-white fixed h-full border-r flex flex-col">
            <div className="p-6 font-bold text-lg">NexaTech Admin</div>

            <nav className="flex-1 p-4 space-y-2">
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
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
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

            <div className="p-4">
                <button className="flex gap-3 text-red-600 hover:bg-red-50 w-full px-4 py-3 rounded-xl">
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
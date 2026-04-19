"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "@/app/components/auth/AuthGuard";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <AuthGuard requiredRole="admin" loginPath="/admin/login">
            <div className="min-h-screen bg-blue-50 lg:flex lg:overflow-hidden">
                <Sidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen((prev) => !prev)}
                />

                <div className="flex-1 min-h-screen lg:pl-0 min-w-0">
                    <Header
                        mobileOpen={sidebarOpen}
                        onToggle={() => setSidebarOpen((prev) => !prev)}
                    />
                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </AuthGuard>
    );
}

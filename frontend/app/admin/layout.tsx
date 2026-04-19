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
            <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] lg:h-screen lg:overflow-hidden lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
                <Sidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen((prev) => !prev)}
                />

                <div className="min-h-screen min-w-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
                    <Header
                        mobileOpen={sidebarOpen}
                        onToggle={() => setSidebarOpen((prev) => !prev)}
                    />
                    <main className="flex-1 lg:overflow-y-auto">{children}</main>
                </div>
            </div>
        </AuthGuard>
    );
}

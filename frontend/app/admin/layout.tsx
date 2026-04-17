"use client";

import Sidebar from "./components/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
            <Sidebar />
            <main className="min-w-0 flex-1">{children}</main>
        </div>
    );
}

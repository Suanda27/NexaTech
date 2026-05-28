"use client";

import { useAuth } from "@/context/AuthContext";

export default function ProfileHeader() {
    const { logout, user } = useAuth();

    return (
        <div className="flex items-center justify-between border-b bg-white p-6">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                    {(user?.name ?? "U").slice(0, 1).toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold">{user?.name ?? "Customer"}</p>
                    <p className="text-sm text-gray-500">
                        {user?.role === "admin" ? "Admin" : "Customer"}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={() => void logout()}
                className="rounded border px-4 py-2 text-red-500 transition hover:bg-red-50"
            >
                Sign Out
            </button>
        </div>
    );
}

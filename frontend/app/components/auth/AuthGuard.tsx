"use client";

import { useEffect, type ReactNode } from "react";
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { buildRedirectPath } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

type AuthGuardProps = {
    children: ReactNode;
    requiredRole?: "admin";
    loginPath?: string;
    fallbackPath?: string;
};

export default function AuthGuard({
    children,
    requiredRole,
    loginPath,
    fallbackPath = "/",
}: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, isLoading } = useAuth();

    const redirectTarget = buildRedirectPath(
        pathname ?? "/",
        searchParams?.toString() ? `?${searchParams.toString()}` : "",
    );

    const targetLoginPath =
        loginPath ?? (requiredRole === "admin" ? "/admin/login" : "/customer/login");

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (pathname === targetLoginPath) {
            return;
        }

        if (!user) {
            router.replace(
                `${targetLoginPath}?redirect=${encodeURIComponent(redirectTarget)}`,
            );
            return;
        }

        if (requiredRole === "admin" && user.role !== "admin") {
            router.replace(fallbackPath);
        }
    }, [
        fallbackPath,
        isLoading,
        redirectTarget,
        requiredRole,
        router,
        targetLoginPath,
        user,
        pathname,
    ]);

    if (pathname === targetLoginPath) {
        return <>{children}</>;
    }

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <LoaderCircle className="h-6 w-6 animate-spin" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-gray-900">
                            Memeriksa sesi login...
                        </p>
                        <p className="text-sm text-gray-500">
                            Sebentar ya, halaman aman sedang disiapkan.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (requiredRole === "admin" && user.role !== "admin") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-4">
                <div className="max-w-md rounded-lg border border-red-100 bg-red-50 px-6 py-7 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-red-900">
                        Akun ini tidak punya akses admin.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

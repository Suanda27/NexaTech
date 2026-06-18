"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiUrl, resolveAdminRedirect } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/app/components/language/LanguageToggle";

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading, login } = useAuth();
    const { t } = useLanguage();

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        if (isLoading || !user) {
            return;
        }

        if (user.role === "admin") {
            router.replace(resolveAdminRedirect(searchParams.get("redirect")));
            return;
        }

        router.replace("/");
    }, [isLoading, router, searchParams, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(apiUrl("/api/auth/admin/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(
                    data.message ||
                        data.errors?.email?.[0] ||
                        t("Admin login failed"),
                );
                return;
            }

            await login(data.token, data.user);
            router.replace(resolveAdminRedirect(searchParams.get("redirect")));
        } catch (error) {
            console.error(error);
            alert(t("Connection error occurred"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_36%,#f8fafc_100%)] px-4 py-10">
            <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                <LanguageToggle />
            </div>
            <div className="w-full max-w-md rounded-[28px] border border-blue-100 bg-white p-7 shadow-2xl shadow-blue-100/80 sm:p-9">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                        <Shield className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-950">
                        {t("Admin Sign In")}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("Sign in to the NexaTech management dashboard.")}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {t("Email")}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@nexatech.com"
                                required
                                className="w-full rounded-2xl border border-blue-100 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {t("Password")}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t("Enter your password")}
                                required
                                className="w-full rounded-2xl border border-blue-100 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-2xl bg-blue-600 py-4 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? t("Signing in...") : t("Login Admin")}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    {t("Back to")}{" "}
                    <Link
                        href="/"
                        className="font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                        {t("main page")}
                    </Link>
                </div>
            </div>
        </main>
    );
}

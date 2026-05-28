"use client";

import { useEffect, useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiUrl, resolveCustomerRedirect } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const { user, isLoading, login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");
    const loginHref = redirect
        ? `/customer/login?redirect=${encodeURIComponent(redirect)}`
        : "/customer/login";

    useEffect(() => {
        if (isLoading || !user) {
            return;
        }

        router.replace(
            resolveCustomerRedirect(redirect, user.role),
        );
    }, [isLoading, redirect, router, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const registerRes = await fetch(
                apiUrl("/api/auth/register"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.fullName,
                        email: formData.email,
                        password: formData.password,
                        password_confirmation: formData.confirmPassword,
                    }),
                },
            );

            const registerData = await registerRes.json();

            if (!registerRes.ok) {
                alert(
                    registerData.message ||
                        registerData.errors?.email?.[0] ||
                        "Register gagal",
                );
                return;
            }

            const loginRes = await fetch(
                apiUrl("/api/auth/login"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                },
            );

            const loginData = await loginRes.json();

            if (!loginRes.ok) {
                alert(
                    loginData.message ||
                        loginData.errors?.email?.[0] ||
                        "Register berhasil, tapi login gagal",
                );
                return;
            }

            const loggedInUser = await login(loginData.token, loginData.user);
            const role = loggedInUser?.role ?? loginData.user?.role ?? "user";
            router.replace(resolveCustomerRedirect(redirect, role));
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0E1A] via-[#0B1F3A] to-[#050812] px-4 py-8">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
                <div className="absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0F2A44]/20 blur-3xl"></div>
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-[#0B1F3A] to-[#0F2A44] shadow-lg shadow-blue-500/20">
                            <div className="h-8 w-8 animate-spin rounded-lg border-4 border-blue-400/40 border-t-blue-400"></div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                            Create Your Account
                        </h1>
                        <p className="mt-2 text-sm text-blue-200/60">
                            Sign up to get started
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-100/80">
                                Full Name
                            </label>

                            <div className="relative">
                                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-300/50" />

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nama lengkap"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-blue-200/30 outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-100/80">
                                Email Address
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-300/50" />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-blue-200/30 outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-100/80">
                                Password
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-300/50" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-12 text-white placeholder-blue-200/30 outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-100/80">
                                Confirm Password
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-300/50" />

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-12 text-white placeholder-blue-200/30 outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-300"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#0B1F3A] to-[#0F2A44] py-4 font-medium text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-blue-500/50"
                        >
                            {isSubmitting ? "Creating account..." : "Register"}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-sm text-blue-200/60">
                        Already have an account?{" "}
                        <Link
                            href={loginHref}
                            className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

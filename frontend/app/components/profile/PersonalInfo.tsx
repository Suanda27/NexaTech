"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Lock, Mail, Save, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchProfile, updateProfile } from "@/lib/store";

export default function PersonalInfo() {
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            try {
                const response = await fetchProfile();

                if (mounted) {
                    setFormData({
                        name: response.data.user.name,
                        email: response.data.user.email,
                        password: "",
                    });
                }
            } catch {
                if (mounted) {
                    setFormData({
                        name: "",
                        email: "",
                        password: "",
                    });
                }
            }
        };

        void loadProfile();

        return () => {
            mounted = false;
        };
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            const response = await updateProfile({
                name: formData.name,
                email: formData.email,
                password: formData.password || undefined,
                password_confirmation: formData.password || undefined,
            });

            setUser(response.data);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setFormData((current) => ({ ...current, password: "" }));
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui profil.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="mx-auto max-w-3xl">
                <div className="group relative overflow-hidden rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50 transition duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70 sm:p-8">
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />

                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-3 shadow-sm ring-1 ring-blue-100">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                    Account Details
                                </p>
                                <h2 className="text-xl font-bold text-gray-950">
                                    Personal Information
                                </h2>
                            </div>
                        </div>

                        <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                            Synced with backend
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 transition focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-sm">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 transition focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-sm">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 transition focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-sm">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200 disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>

            {showToast && (
                <div className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-100">
                    <CheckCircle2 className="h-5 w-5" />
                    Personal information updated successfully
                </div>
            )}
        </>
    );
}

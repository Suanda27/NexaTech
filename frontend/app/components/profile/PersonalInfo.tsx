"use client";

import { useState } from "react";
import { User, Mail, Lock, Save, CheckCircle2 } from "lucide-react";

export default function PersonalInfo() {
    const [formData, setFormData] = useState({
        name: "John Doe",
        email: "john@email.com",
        password: "",
    });
    const [showToast, setShowToast] = useState(false);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <>
            <div className="max-w-3xl mx-auto">
                {/* CARD */}
                <div className="group relative overflow-hidden bg-white border border-blue-100 rounded-lg p-5 shadow-sm shadow-blue-100/50 transition duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70 sm:p-8">
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />

                    {/* TITLE */}
                    <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-3 rounded-lg ring-1 ring-blue-100 shadow-sm">
                                <User className="text-blue-600 w-5 h-5" />
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
                            Editable Profile
                        </span>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* NAME */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 transition focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-sm">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-200 rounded-lg bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 transition focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-sm">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-200 rounded-lg bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 transition focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-sm">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
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
                                    className="w-full border border-gray-200 rounded-lg bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:-translate-y-0.5 hover:shadow-blue-200"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>

            {showToast && (
                <div className="fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-100">
                    <CheckCircle2 className="h-5 w-5" />
                    Personal information updated successfully
                </div>
            )}
        </>
    );
}

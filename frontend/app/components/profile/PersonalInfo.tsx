"use client";

import { useState } from "react";
import { User, Mail, Lock, Save } from "lucide-react";

export default function PersonalInfo() {
    const [formData, setFormData] = useState({
        name: "John Doe",
        email: "john@email.com",
        password: "",
    });

    return (
        <div className="max-w-2xl mx-auto">
            {/* CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                {/* TITLE */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <User className="text-blue-600 w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Personal Information
                    </h2>
                </div>

                {/* FORM */}
                <form className="space-y-6">
                    {/* NAME */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                                className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}

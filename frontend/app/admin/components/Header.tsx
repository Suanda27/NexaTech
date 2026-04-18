"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Menu, Search, Shield, User, X } from "lucide-react";

interface HeaderProps {
    mobileOpen: boolean;
    onToggle: () => void;
}

export default function Header({ mobileOpen, onToggle }: HeaderProps) {
    const adminInfo = useMemo(
        () => ({ name: "Raka Pranata", role: "Administrator" }),
        [],
    );

    return (
        <header className="bg-white border-b border-blue-100 shadow-sm">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        onClick={onToggle}
                        aria-label="Toggle sidebar"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-100 shadow-sm">
                            <Image
                                src="/logoNexaTech.png"
                                alt="NexaTech Logo"
                                width={36}
                                height={36}
                                className="h-8 w-8 object-contain"
                                priority
                            />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-900">
                                NexaTech Admin
                            </p>
                            <p className="text-sm text-blue-600">
                                Control panel management
                            </p>
                        </div>
                    </div>
                </div>

                <div className="order-last w-full md:order-none md:max-w-xl lg:flex-1">
                    <div className="relative mx-auto w-full max-w-xl">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search admin panel..."
                            className="w-full rounded-full border border-blue-200 bg-blue-50 py-3 pl-12 pr-4 text-sm text-blue-900 placeholder-blue-500 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-sm font-semibold text-slate-900">
                            {adminInfo.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                            <Shield size={12} />
                            {adminInfo.role}
                        </span>
                    </div>
                    <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm transition hover:bg-blue-200">
                        <User size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}

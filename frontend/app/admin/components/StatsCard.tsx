"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type StatsCardProps = {
    title: string;
    value: string;
    change?: string;
    note?: string;
    icon: LucideIcon;
};

export default function StatsCard({
    title,
    value,
    change,
    note,
    icon: Icon,
}: StatsCardProps) {
    return (
        <div className="group rounded-lg border border-blue-100 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(37,99,235,0.45)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_44px_-26px_rgba(37,99,235,0.55)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500">
                            {title}
                        </p>
                        <h3 className="text-3xl font-semibold tracking-tight text-slate-950">
                            {value} <span className="text-xs text-red-500">({typeof value}, len {value?.toString().length})</span>
                        </h3>
                    </div>

                    {(change || note) && (
                        <div className="flex flex-wrap items-center gap-2">
                            {change && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                    {change}
                                </span>
                            )}
                            {note && (
                                <span className="text-xs text-slate-500">
                                    {note}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200 transition duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

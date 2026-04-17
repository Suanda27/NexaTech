"use client";

import { Package, Clock, CheckCircle } from "lucide-react";

export default function OrderSummaryCards() {
    const summaries = [
        {
            label: "Total Orders",
            value: "6",
            icon: Package,
            accent: "blue",
            helper: "All purchase activity",
        },
        {
            label: "Processing",
            value: "2",
            icon: Clock,
            accent: "blue",
            helper: "Waiting for completion",
        },
        {
            label: "Delivered",
            value: "2",
            icon: CheckCircle,
            accent: "green",
            helper: "Successfully received",
        },
    ];

    const styles = {
        blue: {
            line: "bg-blue-600",
            iconWrap: "bg-blue-50 text-blue-600 ring-blue-100",
            value: "text-blue-700",
            glow: "shadow-blue-100/70 hover:border-blue-200 hover:shadow-blue-100",
        },
        green: {
            line: "bg-green-600",
            iconWrap: "bg-green-50 text-green-600 ring-green-100",
            value: "text-green-700",
            glow: "shadow-green-100/70 hover:border-green-200 hover:shadow-green-100",
        },
    };

    return (
        <div className="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 xl:grid-cols-3">
            {summaries.map((summary) => {
                const Icon = summary.icon;
                const style = styles[summary.accent as keyof typeof styles];

                return (
                    <div
                        key={summary.label}
                        className={`group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${style.glow}`}
                    >
                        <div
                            className={`absolute inset-x-0 top-0 h-1 ${style.line}`}
                        />

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-500">
                                    {summary.label}
                                </p>
                                <h2
                                    className={`mt-2 text-3xl font-bold tracking-tight ${style.value}`}
                                >
                                    {summary.value}
                                </h2>
                                <p className="mt-1 text-xs font-medium text-gray-500">
                                    {summary.helper}
                                </p>
                            </div>

                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-lg ring-1 shadow-sm transition duration-300 group-hover:scale-105 ${style.iconWrap}`}
                            >
                                <Icon className="w-7 h-7" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

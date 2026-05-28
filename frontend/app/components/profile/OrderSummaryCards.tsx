"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, Package } from "lucide-react";
import { fetchProfile, type ProfileResponse } from "@/lib/store";

export default function OrderSummaryCards() {
    const [summary, setSummary] =
        useState<ProfileResponse["data"]["summary"] | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadSummary = async () => {
            try {
                const response = await fetchProfile();

                if (mounted) {
                    setSummary(response.data.summary);
                }
            } catch {
                if (mounted) {
                    setSummary(null);
                }
            }
        };

        void loadSummary();

        return () => {
            mounted = false;
        };
    }, []);

    const summaries = [
        {
            label: "Total Orders",
            value: summary?.totalOrders ?? 0,
            icon: Package,
            accent: "blue",
            helper: "All purchase activity",
        },
        {
            label: "Processing",
            value: summary?.progressingOrders ?? 0,
            icon: Clock,
            accent: "blue",
            helper: "Waiting for completion",
        },
        {
            label: "Delivered",
            value: summary?.deliveredOrders ?? 0,
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
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {summaries.map((item) => {
                const Icon = item.icon;
                const style = styles[item.accent as keyof typeof styles];

                return (
                    <div
                        key={item.label}
                        className={`group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${style.glow}`}
                    >
                        <div className={`absolute inset-x-0 top-0 h-1 ${style.line}`} />

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-500">
                                    {item.label}
                                </p>
                                <h2 className={`mt-2 text-3xl font-bold ${style.value}`}>
                                    {item.value}
                                </h2>
                                <p className="mt-1 text-xs font-medium text-gray-500">
                                    {item.helper}
                                </p>
                            </div>

                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-lg shadow-sm ring-1 transition duration-300 group-hover:scale-105 ${style.iconWrap}`}
                            >
                                <Icon className="h-7 w-7" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

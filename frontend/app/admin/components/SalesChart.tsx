"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type SalesChartProps = {
    data: Array<{
        label: string;
        revenue: number;
        orders: number;
    }>;
    totalRevenue: number;
    totalOrders: number;
};

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; color: string; name: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-lg border border-blue-100 bg-white px-4 py-3 shadow-xl shadow-blue-100/60">
            <p className="text-sm font-semibold text-slate-950">{label}</p>
            <div className="mt-2 space-y-1.5">
                {payload.map((entry) => (
                    <div
                        key={entry.name}
                        className="flex items-center justify-between gap-5 text-xs"
                    >
                        <span
                            className="flex items-center gap-2 text-slate-500"
                            style={{ color: entry.color }}
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}
                        </span>
                        <span className="font-semibold text-slate-900">
                            {entry.name === "Revenue"
                                ? `Rp ${entry.value.toLocaleString("id-ID")}`
                                : `${entry.value} orders`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function SalesChart({
    data,
    totalRevenue,
    totalOrders,
}: SalesChartProps) {
    return (
        <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-blue-700">
                        Revenue
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                        Rp {totalRevenue.toLocaleString("id-ID")}
                    </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                        Orders
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                        {totalOrders.toLocaleString("id-ID")}
                    </p>
                </div>
            </div>

            <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                        <defs>
                            <linearGradient
                                id="revenueFill"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.03} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            stroke="#dbeafe"
                            strokeDasharray="4 4"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            tickFormatter={(value) => `${Number(value) / 1000000}M`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#2563eb"
                            fill="url(#revenueFill)"
                            strokeWidth={3}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="orders"
                            name="Orders"
                            stroke="#0f172a"
                            strokeWidth={2}
                            dot={{ fill: "#0f172a", r: 3 }}
                            activeDot={{ r: 5, fill: "#0f172a" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

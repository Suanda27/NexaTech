"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { month: "Jan", value: 180 },
    { month: "Feb", value: 195 },
    { month: "Mar", value: 210 },
    { month: "Apr", value: 225 },
    { month: "May", value: 235 },
    { month: "Jun", value: 245 },
];

export default function SalesChart() {
    return (
        <div className="rounded-3xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#475569", fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#475569", fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #DBEAFE",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2563EB"
                            strokeWidth={3}
                            dot={{ fill: "#2563EB", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: "#1D4ED8" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

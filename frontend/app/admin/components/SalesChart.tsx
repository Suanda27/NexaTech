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
        <div className="bg-white p-4 rounded-lg border shadow-sm sm:p-6">
            <h3 className="font-bold mb-4">Grafik Penjualan</h3>

            <div className="h-64 min-w-0">
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line dataKey="value" stroke="#3B82F6" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

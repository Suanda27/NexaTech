"use client";

import { ArrowUpRight, Package2, Star } from "lucide-react";

type ProductTableProps = {
    products: Array<{
        rank: number;
        name: string;
        imageUrl: string | null;
        soldUnits: number;
        revenue: number;
    }>;
};

export default function ProductTable({ products }: ProductTableProps) {
    return (
        <div className="space-y-4">
            {products.length === 0 && (
                <div className="rounded-lg border border-dashed border-blue-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
                    Belum ada produk terjual. Data best seller akan muncul dari
                    order yang sudah masuk.
                </div>
            )}
            {products.map((product, index) => (
                <div
                    key={`${product.name}-${index}`}
                    className="rounded-lg border border-blue-100 bg-white p-4 shadow-[0_14px_30px_-28px_rgba(37,99,235,0.7)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-full w-full rounded-lg object-cover"
                                    />
                                ) : (
                                    <Package2 className="h-5 w-5" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-950">
                                        {product.name}
                                    </p>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                        #{product.rank}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">Top seller</p>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            Best
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-50 px-3 py-3">
                            <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
                                Units Sold
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">
                                {product.soldUnits}
                            </p>
                        </div>
                        <div className="rounded-lg bg-blue-50 px-3 py-3">
                            <p className="text-[11px] uppercase tracking-[0.08em] text-blue-600">
                                Revenue
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">
                                Rp {product.revenue.toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Strongest this week</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                            Details
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

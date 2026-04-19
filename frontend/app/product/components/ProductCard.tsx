"use client";

import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import type { ApiProduct } from "@/lib/store";

interface ProductCardProps {
    product: ApiProduct;
    onAddToCart: (productId: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    return (
        <div className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70">
            <Link href={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden bg-blue-50 p-3">
                    <div className="relative h-52 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-blue-100 md:h-64">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-blue-600">
                                No Image
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    </div>

                    <span className="absolute left-5 top-5 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                        {product.category}
                    </span>
                </div>
            </Link>

            <div className="p-4 md:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link href={`/product/${product.id}`}>
                            <h3 className="line-clamp-2 text-sm font-bold text-gray-950 transition group-hover:text-blue-700 md:text-base">
                                {product.name}
                            </h3>
                        </Link>

                        <div className="mt-2 flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                        i < product.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => onAddToCart(product.id)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200"
                    >
                        <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                </div>

                <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                    {product.description || "Deskripsi produk akan tampil dari database."}
                </p>

                <p className="mt-4 text-lg font-bold text-blue-700 md:text-xl">
                    Rp {product.price.toLocaleString("id-ID")}
                </p>
            </div>
        </div>
    );
}

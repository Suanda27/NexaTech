"use client";

import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import type { ApiProduct, PaginatedProductsResponse } from "@/lib/store";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
    products: ApiProduct[];
    meta?: PaginatedProductsResponse["meta"] | null;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    onAddToCart: (productId: number) => void;
};

export function ProductGrid({
    products,
    meta,
    isLoading,
    onPageChange,
    onAddToCart,
}: ProductGridProps) {
    const currentPage = meta?.currentPage ?? 1;
    const totalPages = meta?.lastPage ?? 1;

    return (
        <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-blue-600">
                        Product Collection
                    </p>
                    <h1 className="text-2xl font-bold text-gray-950">
                        Explore Products
                    </h1>
                </div>
                <p className="text-sm text-gray-500">
                    {isLoading
                        ? "Loading catalog..."
                        : `${meta?.total ?? 0} products found`}
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 mb-10">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-[360px] animate-pulse rounded-lg border border-blue-100 bg-blue-50"
                        />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-950">
                        Belum ada produk yang cocok
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Coba ganti kategori, price, atau sorting. Kalau database
                        masih kosong, produk akan muncul setelah ditambahkan dari
                        admin.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 mb-10">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={onAddToCart}
                            />
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {Array.from({ length: totalPages }).map((_, index) => {
                            const page = index + 1;
                            const isActive = currentPage === page;

                            return (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => onPageChange(page)}
                                    className={`h-10 w-10 rounded-lg text-sm font-bold transition ${
                                        isActive
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                            : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

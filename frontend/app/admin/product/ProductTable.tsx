"use client";

import { useState } from "react";
import {
    Box,
    Eye,
    FolderPlus,
    PencilLine,
    Star,
    Trash2,
} from "lucide-react";
import type { ProductItem } from "./types";
import { formatPrice } from "./utils";
import ProductSpecsModal from "./components/ProductSpecsModal";

type ProductTableProps = {
    products: ProductItem[];
    onAdd: () => void;
    onEdit: (product: ProductItem) => void;
    onDelete: (product: ProductItem) => void;
};

export default function ProductTable({
    products,
    onAdd,
    onEdit,
    onDelete,
}: ProductTableProps) {
    const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);

    if (products.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <FolderPlus className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">
                    Belum ada produk
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Silahkan tambahkan produk baru agar katalog admin mulai terisi
                    dan lebih lengkap.
                </p>
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                    <FolderPlus className="h-4 w-4" />
                    Tambahkan Produk
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-lg border border-blue-100">
                <div className="overflow-x-auto">
                    <table className="min-w-[1180px] w-full text-sm">
                        <thead className="bg-blue-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                <th className="px-6 py-4">Gambar Produk</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Harga</th>
                                <th className="px-6 py-4">Deskripsi</th>
                                <th className="px-6 py-4">Spesifikasi</th>
                                <th className="px-6 py-4">Stok</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-t border-blue-100 bg-white align-top transition hover:bg-blue-50/30"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex min-w-[250px] items-start gap-4">
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-blue-100">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-700">
                                                        <Box className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-950">
                                                    {product.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    SKU: {product.sku}
                                                </p>
                                                <div className="mt-2 flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map(
                                                        (_, index) => (
                                                            <Star
                                                                key={index}
                                                                className={`h-3.5 w-3.5 ${
                                                                    index < product.rating
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "text-slate-300"
                                                                }`}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                            {product.category}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-slate-950">
                                        {formatPrice(product.price)}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="max-w-[260px]">
                                            <p className="text-sm leading-6 text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] overflow-hidden">
                                                {product.description}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => setDetailProduct(product)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Detail Specs
                                        </button>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div
                                            className={`inline-flex min-w-[88px] flex-col rounded-lg px-3 py-2 text-center text-xs font-semibold ring-1 ${
                                                product.stock > 10
                                                    ? "bg-blue-50 text-blue-700 ring-blue-100"
                                                    : product.stock > 0
                                                      ? "bg-amber-50 text-amber-700 ring-amber-100"
                                                      : "bg-red-50 text-red-600 ring-red-100"
                                            }`}
                                        >
                                            <span className="text-sm font-semibold">
                                                {product.stock}
                                            </span>
                                            <span className="mt-0.5">unit</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
                                                product.status === "Active"
                                                    ? "bg-blue-50 text-blue-700 ring-blue-100"
                                                    : product.status === "Inactive"
                                                      ? "bg-slate-100 text-slate-600 ring-slate-200"
                                                      : "bg-red-50 text-red-600 ring-red-100"
                                            }`}
                                        >
                                            <span className="h-2 w-2 rounded-full bg-current" />
                                            {product.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(product)}
                                                className="inline-flex min-w-[76px] items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                                            >
                                                <PencilLine className="h-3.5 w-3.5" />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete(product)}
                                                className="inline-flex min-w-[82px] items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductSpecsModal
                isOpen={Boolean(detailProduct)}
                product={detailProduct}
                onClose={() => setDetailProduct(null)}
            />
        </>
    );
}

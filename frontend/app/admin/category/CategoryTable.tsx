"use client";

import {
    FolderPlus,
    PencilLine,
    Trash2,
} from "lucide-react";
import type { CategoryItem } from "./types";

type CategoryTableProps = {
    categories: CategoryItem[];
    onAdd: () => void;
    onEdit: (category: CategoryItem) => void;
    onDelete: (category: CategoryItem) => void;
};

export default function CategoryTable({
    categories,
    onAdd,
    onEdit,
    onDelete,
}: CategoryTableProps) {
    if (categories.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <FolderPlus className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">
                    Silahkan tambahkan kategori
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Belum ada kategori yang tersimpan. Tambahkan kategori baru
                    untuk mulai mengelompokkan produk dengan lebih rapi.
                </p>
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                    <FolderPlus className="h-4 w-4" />
                    Tambahkan Kategori
                </button>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-blue-100">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-blue-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                            <th className="px-6 py-4">Nama Kategori</th>
                            <th className="px-6 py-4">Jumlah Produk</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories.map((category) => (
                            <tr
                                key={category.id}
                                className="border-t border-blue-100 bg-white transition hover:bg-blue-50/40"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {category.imageUrl ? (
                                            <div className="h-11 w-11 overflow-hidden rounded-lg ring-1 ring-blue-100">
                                                <img
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                                                <FolderPlus className="h-4 w-4" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-slate-950">
                                                {category.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Catalog grouping
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                                        {category.totalProducts} produk
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                            category.status === "Active"
                                                ? "bg-blue-50 text-blue-700 ring-blue-100"
                                                : "bg-slate-100 text-slate-600 ring-slate-200"
                                        }`}
                                    >
                                        {category.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(category)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                                        >
                                            <PencilLine className="h-3.5 w-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(category)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
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
    );
}

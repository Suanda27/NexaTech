"use client";

import { useMemo, useState } from "react";
import {
    FolderPlus,
    Layers3,
    Package2,
    Sparkles,
} from "lucide-react";
import CategoryTable from "./CategoryTable";
import AddCategoryModal from "./components/AddCategoryModal";
import EditCategoryModal from "./components/EditCategoryModal";
import DeleteCategoryModal from "./components/DeleteCategoryModal";
import type { CategoryItem, CategoryStatus } from "./types";

const initialCategories: CategoryItem[] = [
    {
        id: 1,
        name: "Elektronik",
        totalProducts: 128,
        status: "Active",
        imageUrl:
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600",
    },
    {
        id: 2,
        name: "Fashion",
        totalProducts: 86,
        status: "Active",
        imageUrl:
            "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600",
    },
    {
        id: 3,
        name: "Home Office",
        totalProducts: 42,
        status: "Active",
        imageUrl:
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=600",
    },
    {
        id: 4,
        name: "Audio Premium",
        totalProducts: 18,
        status: "Inactive",
        imageUrl:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
    },
];

export default function CategoryPage() {
    const [categories, setCategories] =
        useState<CategoryItem[]>(initialCategories);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
        null,
    );
    const [deletingCategory, setDeletingCategory] =
        useState<CategoryItem | null>(null);

    const totalProducts = useMemo(
        () =>
            categories.reduce(
                (sum, category) => sum + category.totalProducts,
                0,
            ),
        [categories],
    );

    const activeCategories = useMemo(
        () => categories.filter((category) => category.status === "Active").length,
        [categories],
    );

    const inactiveCategories = categories.length - activeCategories;

    const handleAddCategory = ({
        name,
        status,
        imageUrl,
    }: {
        name: string;
        status: CategoryStatus;
        imageUrl: string | null;
    }) => {
        setCategories((prev) => [
            {
                id:
                    prev.length > 0
                        ? Math.max(...prev.map((category) => category.id)) + 1
                        : 1,
                name,
                status,
                totalProducts: 0,
                imageUrl,
            },
            ...prev,
        ]);
        setIsAddOpen(false);
    };

    const handleUpdateCategory = ({
        id,
        name,
        status,
        imageUrl,
    }: {
        id: number;
        name: string;
        status: CategoryStatus;
        imageUrl: string | null;
    }) => {
        setCategories((prev) =>
            prev.map((category) =>
                category.id === id
                    ? { ...category, name, status, imageUrl }
                    : category,
            ),
        );
        setEditingCategory(null);
    };

    const handleDeleteCategory = () => {
        if (!deletingCategory) {
            return;
        }

        setCategories((prev) =>
            prev.filter((category) => category.id !== deletingCategory.id),
        );
        setDeletingCategory(null);
    };

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_58%,#dbeafe_100%)]">
                <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:px-8">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            Refined category management
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Catalog structure
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    Manajemen Kategori
                                </h1>
                            </div>
                            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                Susun kategori utama, kelola status aktifnya,
                                dan jaga pengalaman browsing produk tetap
                                terarah.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsAddOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                        >
                            <FolderPlus className="h-4 w-4" />
                            Tambah Kategori
                        </button>
                    </div>

                    <div className="grid gap-3 self-start">
                        <div className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-[0_20px_40px_-34px_rgba(37,99,235,0.7)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                        Total Categories
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                                        {categories.length}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <Layers3 className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-slate-950 p-4 text-white shadow-[0_24px_50px_-34px_rgba(15,23,42,0.9)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-blue-200">
                                        Total Products
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {totalProducts}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                                    <Package2 className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-slate-300">
                                {activeCategories} active, {inactiveCategories} inactive
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-lg border border-blue-100 bg-white p-5 shadow-[0_20px_50px_-38px_rgba(37,99,235,0.55)] sm:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-700">
                            Category Directory
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                            Daftar Kategori
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 ring-1 ring-blue-100">
                            {activeCategories} Active
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600 ring-1 ring-slate-200">
                            {inactiveCategories} Inactive
                        </span>
                    </div>
                </div>

                <CategoryTable
                    categories={categories}
                    onAdd={() => setIsAddOpen(true)}
                    onEdit={setEditingCategory}
                    onDelete={setDeletingCategory}
                />
            </section>

            <AddCategoryModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSubmit={handleAddCategory}
            />

            <EditCategoryModal
                isOpen={Boolean(editingCategory)}
                onClose={() => setEditingCategory(null)}
                onSubmit={handleUpdateCategory}
                category={editingCategory}
            />

            <DeleteCategoryModal
                isOpen={Boolean(deletingCategory)}
                onClose={() => setDeletingCategory(null)}
                onConfirm={handleDeleteCategory}
                category={deletingCategory}
            />
        </div>
    );
}

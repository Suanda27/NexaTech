"use client";

import {
    ArrowUpDown,
    DollarSign,
    RotateCcw,
    SlidersHorizontal,
    Tags,
} from "lucide-react";
import type { ApiCategory } from "@/lib/store";

type FilterPanelProps = {
    categories: ApiCategory[];
    selectedCategory: string;
    price: string;
    sort: string;
    onCategoryChange: (value: string) => void;
    onPriceChange: (value: string) => void;
    onSortChange: (value: string) => void;
    onReset: () => void;
};

export function FilterPanel({
    categories,
    selectedCategory,
    price,
    sort,
    onCategoryChange,
    onPriceChange,
    onSortChange,
    onReset,
}: FilterPanelProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/50 transition duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70 lg:sticky lg:top-6">
            <div className="border-b border-blue-100 bg-blue-50/70 p-5">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                        <SlidersHorizontal className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Product Filter
                        </p>
                        <h2 className="font-bold text-gray-950">
                            Refine Results
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onReset}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-100"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset Filters
                </button>
            </div>

            <div className="space-y-5 p-5">
                <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                            <Tags className="h-4 w-4" />
                        </span>
                        Category
                    </h3>

                    <div className="space-y-2">
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700">
                            <span>All Categories</span>
                            <input
                                type="radio"
                                name="category"
                                checked={selectedCategory === ""}
                                onChange={() => onCategoryChange("")}
                                className="h-4 w-4 accent-blue-600"
                            />
                        </label>

                        {categories.map((category) => (
                            <label
                                key={category.id}
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                                    selectedCategory === (category.slug ?? category.name)
                                        ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
                                }`}
                            >
                                <span>{category.name}</span>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={selectedCategory === (category.slug ?? category.name)}
                                    onChange={() =>
                                        onCategoryChange(category.slug ?? category.name)
                                    }
                                    className="h-4 w-4 accent-blue-600"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                            <DollarSign className="h-4 w-4" />
                        </span>
                        Price
                    </h3>

                    <div className="space-y-2">
                        {[
                            { value: "lowest", label: "Lowest Price" },
                            { value: "highest", label: "Highest Price" },
                        ].map((option) => (
                            <label
                                key={option.value}
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                                    price === option.value
                                        ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
                                }`}
                            >
                                <span>{option.label}</span>
                                <input
                                    type="radio"
                                    name="price"
                                    checked={price === option.value}
                                    onChange={() => onPriceChange(option.value)}
                                    className="h-4 w-4 accent-blue-600"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                            <ArrowUpDown className="h-4 w-4" />
                        </span>
                        Sorting
                    </h3>

                    <div className="space-y-2">
                        {[
                            { value: "newest", label: "Newest Products" },
                            { value: "best_selling", label: "Best Selling" },
                            { value: "a_z", label: "A-Z" },
                        ].map((option) => (
                            <label
                                key={option.value}
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                                    sort === option.value
                                        ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
                                }`}
                            >
                                <span>{option.label}</span>
                                <input
                                    type="radio"
                                    name="sort"
                                    checked={sort === option.value}
                                    onChange={() => onSortChange(option.value)}
                                    className="h-4 w-4 accent-blue-600"
                                />
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

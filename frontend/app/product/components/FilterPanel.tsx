"use client";

import { useState } from "react";
import {
    ArrowUpDown,
    DollarSign,
    RotateCcw,
    SlidersHorizontal,
    Tags,
    type LucideIcon,
} from "lucide-react";

type FilterSection = {
    title: string;
    icon: LucideIcon;
    type: "checkbox" | "radio";
    name?: string;
    items: string[];
};

export function FilterPanel() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [price, setPrice] = useState("");
    const [sort, setSort] = useState("");

    const toggleCategory = (category: string) => {
        setSelectedCategories((current) =>
            current.includes(category)
                ? current.filter((item) => item !== category)
                : [...current, category],
        );
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setPrice("");
        setSort("");
    };

    const filterSections: FilterSection[] = [
        {
            title: "Category",
            icon: Tags,
            type: "checkbox",
            items: ["Laptop", "PC Components", "Gaming Gear", "Accessories"],
        },
        {
            title: "Price",
            icon: DollarSign,
            type: "radio",
            name: "price",
            items: ["Lowest Price", "Highest Price"],
        },
        {
            title: "Sorting",
            icon: ArrowUpDown,
            type: "radio",
            name: "sort",
            items: ["Newest Products", "Best Selling", "A-Z"],
        },
    ];

    return (
        <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/50 transition duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70 lg:sticky lg:top-6">
            <div className="border-b border-blue-100 bg-blue-50/70 p-5">
                <div className="flex items-center justify-between gap-3">
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
                </div>

                <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-100"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset Filters
                </button>
            </div>

            <div className="space-y-5 p-5">
                {filterSections.map((section) => {
                    const Icon = section.icon;

                    return (
                        <div
                            key={section.title}
                            className="rounded-lg border border-gray-200 bg-gray-50/70 p-4"
                        >
                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                                    <Icon className="h-4 w-4" />
                                </span>
                                {section.title}
                            </h3>

                            <div className="space-y-2">
                                {section.items.map((item) => {
                                    const isChecked =
                                        section.type === "checkbox"
                                            ? selectedCategories.includes(item)
                                            : section.name === "price"
                                              ? price === item
                                              : sort === item;

                                    return (
                                        <label
                                            key={item}
                                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                                                isChecked
                                                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                                                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
                                            }`}
                                        >
                                            <span>{item}</span>
                                            <input
                                                type={section.type}
                                                name={section.name}
                                                checked={isChecked}
                                                onChange={() => {
                                                    if (
                                                        section.type ===
                                                        "checkbox"
                                                    ) {
                                                        toggleCategory(item);
                                                        return;
                                                    }

                                                    if (
                                                        section.name === "price"
                                                    ) {
                                                        setPrice(item);
                                                        return;
                                                    }

                                                    setSort(item);
                                                }}
                                                className="h-4 w-4 accent-blue-600"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

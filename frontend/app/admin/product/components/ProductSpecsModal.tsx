"use client";

import { Box, Star, X } from "lucide-react";
import type { ProductItem } from "../types";
import { getSpecIcon } from "../utils";

type ProductSpecsModalProps = {
    isOpen: boolean;
    product: ProductItem | null;
    onClose: () => void;
};

export default function ProductSpecsModal({
    isOpen,
    product,
    onClose,
}: ProductSpecsModalProps) {
    if (!isOpen || !product) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-5xl rounded-lg border border-blue-100 bg-white p-6 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.55)] sm:max-h-[calc(100dvh-4rem)] sm:overflow-y-auto sm:p-7"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-blue-100 pb-5">
                    <div>
                        <p className="text-sm font-semibold text-blue-700">
                            Product Specification
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                            {product.name}
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                {product.category}
                            </span>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                        key={index}
                                        className={`h-4 w-4 ${
                                            index < product.rating
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-slate-300"
                                        }`}
                                    />
                                ))}
                                <span className="ml-1 text-xs font-medium text-slate-500">
                                    {product.rating}/5
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-lg border border-blue-100 bg-blue-50">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="aspect-square w-full object-cover"
                                />
                            ) : (
                                <div className="flex aspect-square items-center justify-center text-blue-700">
                                    <Box className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <p className="text-sm font-semibold text-slate-900">
                                Deskripsi
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-blue-700">
                                Performance Details
                            </p>
                            <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                                Key Specifications
                            </h3>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            {product.specs.map((spec) => {
                                const Icon = getSpecIcon(spec.icon);

                                return (
                                    <div
                                        key={spec.id}
                                        className="rounded-lg border border-gray-200 bg-gray-50/80 p-5"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    {spec.label}
                                                </p>
                                                <p className="mt-1 break-words text-lg font-bold leading-8 text-gray-950">
                                                    {spec.value}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-4 break-words text-sm leading-7 text-slate-500">
                                            {spec.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

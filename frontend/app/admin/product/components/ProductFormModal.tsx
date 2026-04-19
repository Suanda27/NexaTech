"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Box,
    ImagePlus,
    Plus,
    Sparkles,
    Star,
    Tag,
    Trash2,
    X,
} from "lucide-react";
import type { ProductFormValues, ProductItem } from "../types";
import {
    createDefaultSpecs,
    createSpec,
    fileToDataUrl,
    formatPrice,
    getSpecIcon,
    productStatusOptions,
    specIconOptions,
} from "../utils";

type ProductFormModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    categories: string[];
    initialProduct?: ProductItem | null;
    onClose: () => void;
    onSubmit: (payload: ProductFormValues) => void;
};

function buildEmptyForm(categories: string[]): ProductFormValues {
    return {
        name: "",
        sku: "",
        category: categories[0] ?? "",
        price: 0,
        rating: 5,
        description: "",
        stock: 0,
        status: "Active",
        imageUrl: null,
        specs: createDefaultSpecs(),
    };
}

function ensureMinimumSpecs(values: ProductFormValues): ProductFormValues {
    const nextSpecs = [...values.specs];

    while (nextSpecs.length < 4) {
        nextSpecs.push(createDefaultSpecs()[nextSpecs.length]);
    }

    return {
        ...values,
        specs: nextSpecs,
    };
}

export default function ProductFormModal({
    isOpen,
    mode,
    categories,
    initialProduct,
    onClose,
    onSubmit,
}: ProductFormModalProps) {
    const [form, setForm] = useState<ProductFormValues>(buildEmptyForm(categories));
    const [isUploading, setIsUploading] = useState(false);

    const suggestedCategories = useMemo(
        () => [
            "Elektronik",
            "Gaming Setup",
            "Home Office",
            "Audio Premium",
            "Smart Devices",
        ],
        [],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (initialProduct) {
            setForm(
                ensureMinimumSpecs({
                    name: initialProduct.name,
                    sku: initialProduct.sku,
                    category: initialProduct.category,
                    price: initialProduct.price,
                    rating: initialProduct.rating,
                    description: initialProduct.description,
                    stock: initialProduct.stock,
                    status: initialProduct.status,
                    imageUrl: initialProduct.imageUrl,
                    specs: initialProduct.specs,
                }),
            );
            return;
        }

        setForm(buildEmptyForm(categories));
    }, [categories, initialProduct, isOpen]);

    if (!isOpen) {
        return null;
    }

    const previewSpecs = form.specs.filter(
        (spec) => spec.label.trim() || spec.value.trim() || spec.description.trim(),
    );

    const completedSpecs = form.specs.filter(
        (spec) => spec.label.trim() && spec.value.trim(),
    );

    const isValid =
        form.name.trim() &&
        form.sku.trim() &&
        form.category.trim() &&
        form.price > 0 &&
        form.stock >= 0 &&
        completedSpecs.length >= 1;

    const handleClose = () => {
        setForm(buildEmptyForm(categories));
        setIsUploading(false);
        onClose();
    };

    const handleImageChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setIsUploading(true);

        try {
            const nextImageUrl = await fileToDataUrl(file);
            setForm((prev) => ({
                ...prev,
                imageUrl: nextImageUrl,
            }));
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    };

    const handleSpecChange = (
        specId: string,
        field: "label" | "value" | "description" | "icon",
        value: string,
    ) => {
        setForm((prev) => ({
            ...prev,
            specs: prev.specs.map((spec) =>
                spec.id === specId
                    ? field === "icon"
                        ? { ...spec, icon: value as typeof spec.icon }
                        : { ...spec, [field]: value }
                    : spec,
            ),
        }));
    };

    const handleRemoveSpec = (specId: string) => {
        setForm((prev) => {
            if (prev.specs.length <= 4) {
                return {
                    ...prev,
                    specs: prev.specs.map((spec) =>
                        spec.id === specId
                            ? {
                                  ...spec,
                                  label: "",
                                  value: "",
                                  description: "",
                              }
                            : spec,
                    ),
                };
            }

            return {
                ...prev,
                specs: prev.specs.filter((spec) => spec.id !== specId),
            };
        });
    };

    const handleSubmit = () => {
        if (!isValid) {
            return;
        }

        onSubmit({
            ...form,
            name: form.name.trim(),
            sku: form.sku.trim(),
            category: form.category.trim(),
            description: form.description.trim(),
            specs: form.specs.filter(
                (spec) => spec.label.trim() && spec.value.trim(),
            ),
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-8"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-6xl rounded-lg border border-blue-100 bg-white p-6 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.55)] sm:max-h-[calc(100dvh-4rem)] sm:overflow-y-auto sm:p-7"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-blue-100 pb-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                            <Box className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">
                                {mode === "add" ? "Tambah Produk" : "Edit Produk"}
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                {mode === "add"
                                    ? "Tambahkan produk baru dengan tampilan detail yang rapi dan informatif."
                                    : "Perbarui detail produk, gambar, dan key specification agar tetap konsisten."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="space-y-5">
                        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <p className="text-sm font-semibold text-slate-900">
                                Gambar Produk
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Upload cover produk agar tampilan tabel dan detail
                                produk lebih kuat.
                            </p>

                            <div className="mt-4 overflow-hidden rounded-lg border border-dashed border-blue-200 bg-blue-50/70">
                                {form.imageUrl ? (
                                    <img
                                        src={form.imageUrl}
                                        alt="Preview produk"
                                        className="aspect-square w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex aspect-square items-center justify-center">
                                        <div className="space-y-2 text-center text-blue-700">
                                            <ImagePlus className="mx-auto h-6 w-6" />
                                            <p className="text-sm font-medium">
                                                Belum ada gambar
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                                    <ImagePlus className="h-4 w-4" />
                                    {isUploading
                                        ? "Uploading..."
                                        : mode === "add"
                                          ? "Upload Gambar"
                                          : "Ganti Gambar"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            imageUrl: null,
                                        }))
                                    }
                                    disabled={!form.imageUrl}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus Gambar
                                </button>
                            </div>

                            <div className="mt-5 rounded-lg border border-blue-100 bg-slate-950 p-4 text-white shadow-[0_24px_50px_-34px_rgba(15,23,42,0.9)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-200">
                                    Preview Price
                                </p>
                                <p className="mt-2 break-words text-3xl font-semibold">
                                    {form.price > 0 ? formatPrice(form.price) : "Rp 0"}
                                </p>
                                <p className="mt-3 text-sm text-slate-300">
                                    {form.stock > 0
                                        ? `${form.stock} unit siap dijual`
                                        : "Stok masih kosong"}
                                </p>
                                <div className="mt-4 flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Star
                                            key={index}
                                            className={`h-4 w-4 ${
                                                index < form.rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-slate-500"
                                            }`}
                                        />
                                    ))}
                                    <span className="ml-2 text-xs font-medium text-slate-300">
                                        {form.rating}/5 rating
                                    </span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="space-y-6">
                        <section className="grid gap-4 rounded-lg border border-blue-100 bg-white p-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <p className="text-sm font-semibold text-blue-700">
                                    Product Identity
                                </p>
                                <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                                    Detail Produk
                                </h3>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Nama Produk
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            name: event.target.value,
                                        }))
                                    }
                                    placeholder="Contoh: NexaBook Pro 16"
                                    className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    value={form.sku}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            sku: event.target.value,
                                        }))
                                    }
                                    placeholder="PRD-2401"
                                    className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Kategori
                                </label>
                                <select
                                    value={form.category}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            category: event.target.value,
                                        }))
                                    }
                                    className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                >
                                    {Array.from(
                                        new Set([
                                            ...suggestedCategories,
                                            ...categories,
                                            form.category,
                                        ]),
                                    )
                                        .filter(Boolean)
                                        .map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Harga
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.price || ""}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            price: Number(event.target.value) || 0,
                                        }))
                                    }
                                    placeholder="14990000"
                                    className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Stok
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.stock || ""}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            stock: Number(event.target.value) || 0,
                                        }))
                                    }
                                    placeholder="24"
                                    className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Rating
                                </label>
                                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-slate-50 px-4 py-3">
                                    {Array.from({ length: 5 }).map((_, index) => {
                                        const value = index + 1;

                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        rating: value,
                                                    }))
                                                }
                                                className="transition hover:scale-105"
                                            >
                                                <Star
                                                    className={`h-5 w-5 ${
                                                        value <= form.rating
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "text-slate-300"
                                                    }`}
                                                />
                                            </button>
                                        );
                                    })}
                                    <span className="ml-1 text-sm font-medium text-slate-600">
                                        {form.rating}/5
                                    </span>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Status
                                </label>
                                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                    {productStatusOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    status: option,
                                                }))
                                            }
                                            className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                                                form.status === option
                                                    ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                    : "border-blue-100 bg-white text-slate-600 hover:bg-blue-50"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            description: event.target.value,
                                        }))
                                    }
                                    rows={4}
                                    placeholder="Tulis deskripsi produk yang akan tampil di halaman detail."
                                    className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </section>

                        <section className="rounded-lg border border-blue-100 bg-white p-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-blue-700">
                                        Performance Details
                                    </p>
                                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                                        Key Specifications
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            specs: [
                                                ...prev.specs,
                                                createSpec("", "", "security"),
                                            ],
                                        }))
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Spesifikasi
                                </button>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Editor ini dibuat lebih rapi agar isi, icon, dan
                                preview spesifikasi tetap presisi di dalam setiap
                                container.
                            </p>

                            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                {form.specs.map((spec) => {
                                    const Icon = getSpecIcon(spec.icon);

                                    return (
                                        <div
                                            key={spec.id}
                                            className="rounded-lg border border-gray-200 bg-gray-50/80 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                                                    <Icon className="h-5 w-5" />
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveSpec(spec.id)
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                        Label
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={spec.label}
                                                        onChange={(event) =>
                                                            handleSpecChange(
                                                                spec.id,
                                                                "label",
                                                                event.target.value,
                                                            )
                                                        }
                                                        placeholder="Display"
                                                        className="mt-1 w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                        Value
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={spec.value}
                                                        onChange={(event) =>
                                                            handleSpecChange(
                                                                spec.id,
                                                                "value",
                                                                event.target.value,
                                                            )
                                                        }
                                                        placeholder="16-inch Retina 120Hz"
                                                        className="mt-1 w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                        Icon
                                                    </label>
                                                    <select
                                                        value={spec.icon}
                                                        onChange={(event) =>
                                                            handleSpecChange(
                                                                spec.id,
                                                                "icon",
                                                                event.target.value,
                                                            )
                                                        }
                                                        className="mt-1 w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                                    >
                                                        {specIconOptions.map((option) => (
                                                            <option
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                        Deskripsi
                                                    </label>
                                                    <textarea
                                                        rows={4}
                                                        value={spec.description}
                                                        onChange={(event) =>
                                                            handleSpecChange(
                                                                spec.id,
                                                                "description",
                                                                event.target.value,
                                                            )
                                                        }
                                                        placeholder="Tambahkan detail singkat untuk spesifikasi ini."
                                                        className="mt-1 w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-5 rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Sparkles className="h-4 w-4 text-blue-600" />
                                    Preview key specification
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                    Preview ini mengikuti nuansa tampilan detail
                                    produk agar hasil akhirnya lebih konsisten.
                                </p>

                                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                    {(previewSpecs.length > 0
                                        ? previewSpecs
                                        : form.specs.slice(0, 4)
                                    ).map((spec) => {
                                        const Icon = getSpecIcon(spec.icon);

                                        return (
                                            <div
                                                key={`preview-${spec.id}`}
                                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                                        <Icon className="h-5 w-5" />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            {spec.label || "Label"}
                                                        </p>
                                                        <p className="mt-1 break-words text-base font-bold leading-7 text-gray-950">
                                                            {spec.value ||
                                                                "Isi spesifikasi"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="mt-3 break-words text-sm leading-7 text-slate-500">
                                                    {spec.description ||
                                                        "Tambahkan deskripsi singkat untuk menjelaskan keunggulan spesifikasi ini."}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <Tag className="h-4 w-4 text-blue-600" />
                                Pilihan kategori cepat
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {suggestedCategories.map((category) => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() =>
                                            setForm((prev) => ({
                                                ...prev,
                                                category,
                                            }))
                                        }
                                        className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-blue-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isValid || isUploading}
                        className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {mode === "add" ? "Simpan Produk" : "Update Produk"}
                    </button>
                </div>
            </div>
        </div>
    );
}

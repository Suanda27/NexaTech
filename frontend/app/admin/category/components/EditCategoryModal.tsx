"use client";

import { useEffect, useState } from "react";
import {
    ImagePlus,
    PencilLine,
    Trash2,
    ShieldCheck,
    X,
} from "lucide-react";
import type { CategoryItem, CategoryStatus } from "../types";
import { fileToDataUrl } from "../utils";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        id: number;
        name: string;
        status: CategoryStatus;
        imageUrl: string | null;
    }) => void;
    category: CategoryItem | null;
}

export default function EditCategoryModal({
    isOpen,
    onClose,
    onSubmit,
    category,
}: Props) {
    const [name, setName] = useState("");
    const [status, setStatus] = useState<CategoryStatus>("Active");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!category) {
            return;
        }

        setName(category.name);
        setStatus(category.status);
        setImageUrl(category.imageUrl);
    }, [category]);

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
            setImageUrl(nextImageUrl);
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    };

    if (!isOpen || !category) return null;

    const handleSubmit = () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        onSubmit({
            id: category.id,
            name: trimmedName,
            status,
            imageUrl,
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm sm:items-center sm:py-8"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-lg border border-blue-100 bg-white p-6 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.5)] sm:max-h-[calc(100dvh-4rem)] sm:overflow-y-auto sm:p-7"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                            <PencilLine className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">
                                Edit Kategori
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Perbarui nama kategori dan status tampilnya di
                                katalog.
                            </p>
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

                <div className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Nama Kategori
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Gambar Kategori
                        </label>

                        <div className="mt-2 grid gap-4 sm:grid-cols-[132px_minmax(0,1fr)]">
                            <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-dashed border-blue-200 bg-blue-50/60">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="Preview kategori"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="space-y-2 text-center text-blue-700">
                                        <ImagePlus className="mx-auto h-5 w-5" />
                                        <p className="text-xs font-medium">
                                            Belum ada gambar
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                                        <ImagePlus className="h-4 w-4" />
                                        {isUploading ? "Uploading..." : "Ganti Gambar"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setImageUrl(null)}
                                        disabled={!imageUrl}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Hapus Gambar
                                    </button>
                                </div>

                                <p className="text-sm leading-6 text-slate-500">
                                    Kamu bisa mengganti gambar kategori kapan
                                    saja atau menghapusnya jika ingin kembali ke
                                    tampilan default.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Status
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            {(["Active", "Inactive"] as CategoryStatus[]).map(
                                (option) => {
                                    const isActive = status === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setStatus(option)}
                                            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                                                isActive
                                                    ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                    : "border-blue-100 bg-white text-slate-600 hover:bg-blue-50"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                            Kategori ini memiliki {category.totalProducts} produk
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Perubahan nama akan membantu admin menjaga struktur
                            katalog tetap konsisten.
                        </p>
                    </div>
                </div>

                <div className="mt-7 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!name.trim() || isUploading}
                        className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Update Kategori
                    </button>
                </div>
            </div>
        </div>
    );
}

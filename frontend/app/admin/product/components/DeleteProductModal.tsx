"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import type { ProductItem } from "../types";

type DeleteProductModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    product: ProductItem | null;
};

export default function DeleteProductModal({
    isOpen,
    onClose,
    onConfirm,
    product,
}: DeleteProductModalProps) {
    if (!isOpen || !product) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-lg border border-red-100 bg-white p-6 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.5)] sm:p-7"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">
                                Hapus Produk
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Produk akan dihapus dari daftar manajemen produk.
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

                <div className="rounded-lg border border-red-100 bg-red-50/60 p-4">
                    <p className="text-sm text-slate-600">
                        Kamu akan menghapus produk
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-950">
                        {product.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Tindakan ini tidak bisa dibatalkan dari tampilan admin.
                    </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                        Hapus Produk
                    </button>
                </div>
            </div>
        </div>
    );
}

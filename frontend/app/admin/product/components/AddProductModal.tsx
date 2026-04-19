"use client";

import ProductFormModal from "./ProductFormModal";
import type { ProductFormValues } from "../types";

type AddProductModalProps = {
    isOpen: boolean;
    categories: string[];
    onClose: () => void;
    onSubmit: (payload: ProductFormValues) => void;
};

export default function AddProductModal({
    isOpen,
    categories,
    onClose,
    onSubmit,
}: AddProductModalProps) {
    return (
        <ProductFormModal
            isOpen={isOpen}
            mode="add"
            categories={categories}
            onClose={onClose}
            onSubmit={onSubmit}
        />
    );
}

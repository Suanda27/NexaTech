"use client";

import ProductFormModal from "./ProductFormModal";
import type { ProductFormValues, ProductItem } from "../types";

type EditProductModalProps = {
    isOpen: boolean;
    categories: string[];
    product: ProductItem | null;
    onClose: () => void;
    onSubmit: (payload: ProductFormValues) => void;
};

export default function EditProductModal({
    isOpen,
    categories,
    product,
    onClose,
    onSubmit,
}: EditProductModalProps) {
    return (
        <ProductFormModal
            isOpen={isOpen}
            mode="edit"
            categories={categories}
            initialProduct={product}
            onClose={onClose}
            onSubmit={onSubmit}
        />
    );
}

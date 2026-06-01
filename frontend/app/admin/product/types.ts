"use client";

export type ProductStatus = "Active" | "Inactive" | "Out of Stock";

export type SpecIconKey =
    | "display"
    | "processor"
    | "storage"
    | "performance"
    | "security"
    | "battery"
    | "audio"
    | "camera";

export type ProductSpec = {
    id: string;
    label: string;
    value: string;
    description: string;
    icon: SpecIconKey;
};

export type ProductItem = {
    id: number;
    categoryId?: number | null;
    name: string;
    sku: string;
    category: string;
    price: number;
    rating: number;
    description: string;
    stock: number;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    status: ProductStatus;
    imageUrl: string | null;
    specs: ProductSpec[];
};

export type ProductFormValues = Omit<ProductItem, "id">;

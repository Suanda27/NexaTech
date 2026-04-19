"use client";

export type CategoryStatus = "Active" | "Inactive";

export type CategoryItem = {
    id: number;
    name: string;
    totalProducts: number;
    status: CategoryStatus;
    imageUrl: string | null;
};

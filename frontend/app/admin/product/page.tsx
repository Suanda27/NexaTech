"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Boxes,
    CircleDollarSign,
    PackagePlus,
    Siren,
    Search,
    Sparkles,
} from "lucide-react";
import ProductTable from "./ProductTable";
import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import DeleteProductModal from "./components/DeleteProductModal";
import { useLanguage } from "@/context/LanguageContext";
import type {
    ProductFormValues,
    ProductItem,
    SpecIconKey,
} from "./types";
import { formatPrice } from "./utils";
import {
    createAdminProduct,
    deleteAdminProduct,
    fetchAdminCategories,
    fetchAdminProducts,
    type PaginationMeta,
    updateAdminProduct,
} from "@/lib/store";

type CategoryLookup = {
    id: number;
    name: string;
};

function normalizeProduct(item: {
    id: number;
    categoryId: number | null;
    category: string;
    sku: string;
    name: string;
    price: number;
    rating: number;
    description: string;
    stock: number;
    status: string;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    imageUrl: string | null;
    specs?: Array<{
        id: string;
        label: string;
        value: string;
        description: string;
        icon: string;
    }>;
}): ProductItem {
    return {
        id: item.id,
        categoryId: item.categoryId,
        category: item.category,
        sku: item.sku,
        name: item.name,
        price: item.price,
        rating: item.rating,
        description: item.description,
        stock: item.stock,
        isLowStock: item.isLowStock ?? false,
        isOutOfStock: item.isOutOfStock ?? false,
        status: item.status as ProductItem["status"],
        imageUrl: item.imageUrl,
        specs:
            item.specs?.map((spec) => ({
                id: spec.id,
                label: spec.label,
                value: spec.value,
                description: spec.description,
                icon: spec.icon as SpecIconKey,
            })) ?? [],
    };
}

function mapUiStatusToApi(status: ProductItem["status"]) {
    switch (status) {
        case "Inactive":
            return "inactive";
        case "Out of Stock":
            return "out_of_stock";
        default:
            return "active";
    }
}

export default function ProductPage() {
    const { t } = useLanguage();
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });
    const [categoryLookup, setCategoryLookup] = useState<CategoryLookup[]>([]);
    const [summary, setSummary] = useState({
        totalProducts: 0,
        totalInventoryValue: 0,
        totalStock: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
    const [selectedStatus, setSelectedStatus] = useState("Semua Status");
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
    const [deletingProduct, setDeletingProduct] =
        useState<ProductItem | null>(null);

    const loadData = async (page = currentPage) => {
        try {
            const [productsResponse, categoriesResponse] = await Promise.all([
                fetchAdminProducts({
                    q: searchQuery || null,
                    category:
                        selectedCategory === "Semua Kategori"
                            ? null
                            : selectedCategory,
                    status:
                        selectedStatus === "Semua Status"
                            ? null
                            : mapUiStatusToApi(selectedStatus as ProductItem["status"]),
                    page,
                    perPage: meta.perPage,
                }),
                fetchAdminCategories(),
            ]);

            setProducts(productsResponse.data.map(normalizeProduct));
            setSummary(productsResponse.summary);
            setMeta(productsResponse.meta);
            setCurrentPage(productsResponse.meta.currentPage);
            setCategoryLookup(
                categoriesResponse.data.map((category) => ({
                    id: category.id,
                    name: category.name,
                })),
            );
        } catch {
            setProducts([]);
            setCategoryLookup([]);
            setSummary({
                totalProducts: 0,
                totalInventoryValue: 0,
                totalStock: 0,
                activeProducts: 0,
                lowStockProducts: 0,
                outOfStockProducts: 0,
            });
            setMeta({
                currentPage: 1,
                lastPage: 1,
                perPage: 10,
                total: 0,
            });
        }
    };

    useEffect(() => {
        let mounted = true;

        const bootstrapData = async () => {
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    fetchAdminProducts({
                        q: searchQuery || null,
                        category:
                            selectedCategory === "Semua Kategori"
                                ? null
                                : selectedCategory,
                        status:
                            selectedStatus === "Semua Status"
                                ? null
                                : mapUiStatusToApi(selectedStatus as ProductItem["status"]),
                        page: currentPage,
                        perPage: meta.perPage,
                    }),
                    fetchAdminCategories(),
                ]);

                if (!mounted) {
                    return;
                }

                setProducts(productsResponse.data.map(normalizeProduct));
                setSummary(productsResponse.summary);
                setMeta(productsResponse.meta);
                setCategoryLookup(
                    categoriesResponse.data.map((category) => ({
                        id: category.id,
                        name: category.name,
                    })),
                );
            } catch {
                if (!mounted) {
                    return;
                }

                setProducts([]);
                setCategoryLookup([]);
                setSummary({
                    totalProducts: 0,
                    totalInventoryValue: 0,
                    totalStock: 0,
                    activeProducts: 0,
                    lowStockProducts: 0,
                    outOfStockProducts: 0,
                });
                setMeta({
                    currentPage: 1,
                    lastPage: 1,
                    perPage: 10,
                    total: 0,
                });
            }
        };

        void bootstrapData();

        return () => {
            mounted = false;
        };
    }, [currentPage, meta.perPage, searchQuery, selectedCategory, selectedStatus]);

    const categories = useMemo(
        () => categoryLookup.map((category) => category.name),
        [categoryLookup],
    );

    const totalInventoryValue = useMemo(
        () => summary.totalInventoryValue,
        [summary],
    );
    const totalStock = useMemo(() => summary.totalStock, [summary]);
    const activeProducts = useMemo(() => summary.activeProducts, [summary]);
    const lowStockProducts = useMemo(() => summary.lowStockProducts, [summary]);
    const outOfStockProducts = useMemo(
        () => summary.outOfStockProducts,
        [summary],
    );

    const resolveCategoryId = (categoryName: string) =>
        categoryLookup.find((category) => category.name === categoryName)?.id ?? null;

    const mapStatusToApi = (status: ProductFormValues["status"]) => {
        switch (status) {
            case "Inactive":
                return "inactive" as const;
            case "Out of Stock":
                return "out_of_stock" as const;
            default:
                return "active" as const;
        }
    };

    const handleAddProduct = async (payload: ProductFormValues) => {
        try {
            await createAdminProduct({
                category_id: resolveCategoryId(payload.category),
                sku: payload.sku,
                name: payload.name,
                description: payload.description,
                price: payload.price,
                stock: payload.stock,
                status: mapStatusToApi(payload.status),
                rating: payload.rating,
                image_url: payload.imageUrl,
                specs: payload.specs.map((spec) => ({
                    label: spec.label,
                    value: spec.value,
                    description: spec.description,
                    icon: spec.icon,
                })),
            });
            setIsAddOpen(false);
            await loadData(currentPage);
        } catch (error) {
            alert(
                error instanceof Error ? t(error.message) : t("Failed to add product."),
            );
        }
    };

    const handleUpdateProduct = async (payload: ProductFormValues) => {
        if (!editingProduct) {
            return;
        }

        try {
            await updateAdminProduct(editingProduct.id, {
                category_id: resolveCategoryId(payload.category),
                sku: payload.sku,
                name: payload.name,
                description: payload.description,
                price: payload.price,
                stock: payload.stock,
                status: mapStatusToApi(payload.status),
                rating: payload.rating,
                image_url: payload.imageUrl,
                specs: payload.specs.map((spec) => ({
                    label: spec.label,
                    value: spec.value,
                    description: spec.description,
                    icon: spec.icon,
                })),
            });
            setEditingProduct(null);
            await loadData(currentPage);
        } catch (error) {
            alert(
                error instanceof Error ? t(error.message) : t("Failed to update product."),
            );
        }
    };

    const handleDeleteProduct = async () => {
        if (!deletingProduct) {
            return;
        }

        try {
            await deleteAdminProduct(deletingProduct.id);
            setDeletingProduct(null);
            await loadData(currentPage);
        } catch (error) {
            alert(
                error instanceof Error ? t(error.message) : t("Failed to delete product."),
            );
        }
    };

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_58%,#dbeafe_100%)]">
                <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:px-8">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            {t("Refined product management")}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {t("Catalog operations")}
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    {t("Product Management")}
                                </h1>
                            </div>
                            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                                {t("All products, images, stock, and key specifications are now stored through the backend, so admin and customer read from the same data source.")}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsAddOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                        >
                            <PackagePlus className="h-4 w-4" />
                            {t("Add Product")}
                        </button>
                    </div>

                    <div className="grid gap-3 self-start">
                        <div className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-[0_20px_40px_-34px_rgba(37,99,235,0.7)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                        {t("Total Products")}
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                                        {summary.totalProducts}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <Boxes className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-slate-500">
                                {activeProducts} {t("active products in catalog")}
                            </p>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-slate-950 p-4 text-white shadow-[0_24px_50px_-34px_rgba(15,23,42,0.9)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-blue-200">
                                        {t("Inventory Value")}
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {formatPrice(totalInventoryValue)}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                                    <CircleDollarSign className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-slate-300">
                                {totalStock} {t("total stock units available")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-lg border border-blue-100 bg-white p-5 shadow-[0_20px_50px_-38px_rgba(37,99,235,0.55)] sm:p-6">
                {(outOfStockProducts > 0 || lowStockProducts > 0) && (
                    <div className="mb-6 grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border border-red-200 bg-red-50/80 p-4">
                            <div className="flex items-start gap-3">
                                <Siren className="mt-0.5 h-5 w-5 text-red-600" />
                                <div>
                                    <p className="text-sm font-semibold text-red-700">
                                        {t("Out of stock products")}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-red-700">
                                        {outOfStockProducts} {t("products are out of stock and customers cannot checkout until stock is updated.")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-700">
                                        {t("Low stock products")}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-amber-700">
                                        {lowStockProducts} {t("products are running low. Restock soon before new orders arrive.")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-700">
                            {t("Product Directory")}
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                            {t("Product List")}
                        </h2>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,280px)_220px_220px]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder={t("Search product name, SKU, or description...")}
                                className="w-full rounded-lg border border-blue-100 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(event) => {
                                setSelectedCategory(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="Semua Kategori">{t("All Categories")}</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(event) => {
                                setSelectedStatus(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="Semua Status">{t("All Statuses")}</option>
                            <option value="Active">{t("Active")}</option>
                            <option value="Inactive">{t("Inactive")}</option>
                            <option value="Out of Stock">{t("Out of Stock")}</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <ProductTable
                        products={products}
                        onAdd={() => setIsAddOpen(true)}
                        onEdit={setEditingProduct}
                        onDelete={setDeletingProduct}
                    />
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-blue-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {t("Showing")} {products.length} {t("products")} {t("from total")} {meta.total} {t("data entries")}.
                    </p>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                            disabled={meta.currentPage <= 1}
                            className="rounded-lg border border-blue-100 bg-white px-3 py-2 font-medium text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t("Previous")}
                        </button>
                        <span className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-700">
                            {t("Page")} {meta.currentPage} / {meta.lastPage}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.min(page + 1, meta.lastPage),
                                )
                            }
                            disabled={meta.currentPage >= meta.lastPage}
                            className="rounded-lg border border-blue-100 bg-white px-3 py-2 font-medium text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t("Next")}
                        </button>
                    </div>
                </div>
            </section>

            <AddProductModal
                isOpen={isAddOpen}
                categories={categories}
                onClose={() => setIsAddOpen(false)}
                onSubmit={handleAddProduct}
            />

            <EditProductModal
                isOpen={Boolean(editingProduct)}
                categories={categories}
                product={editingProduct}
                onClose={() => setEditingProduct(null)}
                onSubmit={handleUpdateProduct}
            />

            <DeleteProductModal
                isOpen={Boolean(deletingProduct)}
                product={deletingProduct}
                onClose={() => setDeletingProduct(null)}
                onConfirm={handleDeleteProduct}
            />
        </div>
    );
}

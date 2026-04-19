"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Boxes,
    CircleDollarSign,
    PackagePlus,
    Search,
    Sparkles,
} from "lucide-react";
import ProductTable from "./ProductTable";
import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import DeleteProductModal from "./components/DeleteProductModal";
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

export default function ProductPage() {
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [categoryLookup, setCategoryLookup] = useState<CategoryLookup[]>([]);
    const [summary, setSummary] = useState({
        totalProducts: 0,
        totalInventoryValue: 0,
        totalStock: 0,
        activeProducts: 0,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
    const [deletingProduct, setDeletingProduct] =
        useState<ProductItem | null>(null);

    const loadData = async () => {
        try {
            const [productsResponse, categoriesResponse] = await Promise.all([
                fetchAdminProducts(),
                fetchAdminCategories(),
            ]);

            setProducts(productsResponse.data.map(normalizeProduct));
            setSummary(productsResponse.summary);
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
            });
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const categories = useMemo(
        () => categoryLookup.map((category) => category.name),
        [categoryLookup],
    );

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesCategory =
                selectedCategory === "Semua Kategori" ||
                product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    const totalInventoryValue = useMemo(
        () => summary.totalInventoryValue,
        [summary],
    );
    const totalStock = useMemo(() => summary.totalStock, [summary]);
    const activeProducts = useMemo(() => summary.activeProducts, [summary]);

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
            await loadData();
        } catch (error) {
            alert(
                error instanceof Error ? error.message : "Gagal menambahkan produk.",
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
            await loadData();
        } catch (error) {
            alert(
                error instanceof Error ? error.message : "Gagal memperbarui produk.",
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
            await loadData();
        } catch (error) {
            alert(
                error instanceof Error ? error.message : "Gagal menghapus produk.",
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
                            Refined product management
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Catalog operations
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    Manajemen Produk
                                </h1>
                            </div>
                            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                                Semua produk, gambar, stok, dan key specification
                                sekarang disimpan lewat backend, jadi admin dan
                                customer membaca sumber data yang sama.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsAddOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                        >
                            <PackagePlus className="h-4 w-4" />
                            Tambah Produk
                        </button>
                    </div>

                    <div className="grid gap-3 self-start">
                        <div className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-[0_20px_40px_-34px_rgba(37,99,235,0.7)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                                        Total Products
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
                                {activeProducts} active products in catalog
                            </p>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-slate-950 p-4 text-white shadow-[0_24px_50px_-34px_rgba(15,23,42,0.9)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-blue-200">
                                        Inventory Value
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
                                {totalStock} total stock units available
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-lg border border-blue-100 bg-white p-5 shadow-[0_20px_50px_-38px_rgba(37,99,235,0.55)] sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-700">
                            Product Directory
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                            Daftar Produk
                        </h2>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,280px)_220px]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Cari nama produk, SKU, atau deskripsi..."
                                className="w-full rounded-lg border border-blue-100 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(event) =>
                                setSelectedCategory(event.target.value)
                            }
                            className="rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="Semua Kategori">Semua Kategori</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <ProductTable
                        products={filteredProducts}
                        onAdd={() => setIsAddOpen(true)}
                        onEdit={setEditingProduct}
                        onDelete={setDeletingProduct}
                    />
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

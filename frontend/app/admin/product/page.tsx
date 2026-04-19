"use client";

import { useMemo, useState } from "react";
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
import type { ProductFormValues, ProductItem } from "./types";
import { createSpec, formatPrice } from "./utils";

const initialProducts: ProductItem[] = [
    {
        id: 1,
        name: "NexaBook Pro 16",
        sku: "PRD-2401",
        category: "Elektronik",
        price: 14999000,
        rating: 5,
        description:
            "Laptop premium untuk creator dan power user dengan layar 16 inci, performa tinggi, dan desain minimal modern.",
        stock: 24,
        status: "Active",
        imageUrl:
            "https://images.unsplash.com/photo-1658262530868-f7460e2f071f?q=80&w=1080",
        specs: [
            createSpec(
                "Display",
                "16-inch Retina 120Hz",
                "display",
                "Panel tajam dengan warna kaya untuk editing, desain, dan entertainment.",
            ),
            createSpec(
                "Memory",
                "32GB Unified Memory",
                "performance",
                "Multitasking lebih stabil untuk project berat sepanjang hari.",
            ),
            createSpec(
                "Storage",
                "1TB SSD Storage",
                "storage",
                "Akses file super cepat dan ruang kerja lega untuk asset besar.",
            ),
            createSpec(
                "Processor",
                "12-Core CPU",
                "processor",
                "Performa kencang untuk render, coding, dan workflow produktif.",
            ),
        ],
    },
    {
        id: 2,
        name: "Auralux Studio Max",
        sku: "PRD-2402",
        category: "Audio Premium",
        price: 3299000,
        rating: 4,
        description:
            "Headphone wireless dengan tuning detail, noise cancellation adaptif, dan finishing premium untuk kerja fokus.",
        stock: 14,
        status: "Active",
        imageUrl:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1080",
        specs: [
            createSpec(
                "Audio Driver",
                "40mm Dynamic Driver",
                "audio",
                "Karakter suara kaya detail dengan bass tetap terkontrol.",
            ),
            createSpec(
                "Battery",
                "42 Hours Playback",
                "battery",
                "Dipakai seharian tanpa khawatir cepat habis.",
            ),
            createSpec(
                "Noise Control",
                "Adaptive ANC",
                "security",
                "Menyaring gangguan sekitar untuk ruang dengar yang lebih tenang.",
            ),
            createSpec(
                "Connectivity",
                "Bluetooth 5.3",
                "performance",
                "Koneksi stabil dengan latensi rendah saat kerja maupun hiburan.",
            ),
        ],
    },
    {
        id: 3,
        name: "VisionPad Ultra",
        sku: "PRD-2403",
        category: "Smart Devices",
        price: 8799000,
        rating: 4,
        description:
            "Tablet tipis dengan layar tajam dan stylus support, cocok untuk presentasi, desain, dan catatan digital.",
        stock: 9,
        status: "Active",
        imageUrl:
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1080",
        specs: [
            createSpec(
                "Display",
                "12.9-inch Liquid Screen",
                "display",
                "Visual lebar dengan warna akurat untuk membaca dan membuat.",
            ),
            createSpec(
                "Camera",
                "12MP Ultra Wide",
                "camera",
                "Video call dan scanning dokumen lebih jelas.",
            ),
            createSpec(
                "Battery",
                "All-day Battery",
                "battery",
                "Didesain untuk mobilitas tanpa sering isi ulang.",
            ),
            createSpec(
                "Performance",
                "AI Productivity Chip",
                "performance",
                "Respons cepat untuk multitasking ringan hingga menengah.",
            ),
        ],
    },
    {
        id: 4,
        name: "Orbit Dock Prime",
        sku: "PRD-2404",
        category: "Home Office",
        price: 1899000,
        rating: 4,
        description:
            "Docking station ringkas untuk setup meja kerja yang lebih bersih dengan port lengkap dan charging cepat.",
        stock: 0,
        status: "Out of Stock",
        imageUrl:
            "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1080",
        specs: [
            createSpec(
                "Ports",
                "8-in-1 Expansion",
                "storage",
                "Lengkap untuk monitor, data transfer, ethernet, dan charging.",
            ),
            createSpec(
                "Output",
                "Dual 4K Display",
                "display",
                "Mendukung workflow multi-screen yang lebih rapi.",
            ),
            createSpec(
                "Charging",
                "100W Power Delivery",
                "battery",
                "Menyalurkan daya tinggi untuk laptop kerja modern.",
            ),
            createSpec(
                "Build",
                "Aluminum Finish",
                "security",
                "Tampil premium dan membantu pelepasan panas lebih stabil.",
            ),
        ],
    },
];

export default function ProductPage() {
    const [products, setProducts] = useState<ProductItem[]>(initialProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
    const [deletingProduct, setDeletingProduct] =
        useState<ProductItem | null>(null);

    const categories = useMemo(
        () => Array.from(new Set(products.map((product) => product.category))).sort(),
        [products],
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
        () =>
            products.reduce(
                (sum, product) => sum + product.price * product.stock,
                0,
            ),
        [products],
    );

    const totalStock = useMemo(
        () => products.reduce((sum, product) => sum + product.stock, 0),
        [products],
    );

    const activeProducts = useMemo(
        () => products.filter((product) => product.status === "Active").length,
        [products],
    );

    const normalizeStatus = (
        status: ProductFormValues["status"],
        stock: number,
    ): ProductFormValues["status"] => {
        if (stock === 0) {
            return "Out of Stock";
        }

        if (status === "Out of Stock") {
            return "Inactive";
        }

        return status;
    };

    const handleAddProduct = (payload: ProductFormValues) => {
        setProducts((prev) => [
            {
                id:
                    prev.length > 0
                        ? Math.max(...prev.map((product) => product.id)) + 1
                        : 1,
                ...payload,
                status: normalizeStatus(payload.status, payload.stock),
            },
            ...prev,
        ]);
        setIsAddOpen(false);
    };

    const handleUpdateProduct = (payload: ProductFormValues) => {
        if (!editingProduct) {
            return;
        }

        setProducts((prev) =>
            prev.map((product) =>
                product.id === editingProduct.id
                    ? {
                          ...product,
                          ...payload,
                          status: normalizeStatus(payload.status, payload.stock),
                      }
                    : product,
            ),
        );
        setEditingProduct(null);
    };

    const handleDeleteProduct = () => {
        if (!deletingProduct) {
            return;
        }

        setProducts((prev) =>
            prev.filter((product) => product.id !== deletingProduct.id),
        );
        setDeletingProduct(null);
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
                                Kelola produk, harga, stok, dan key specification
                                dengan tampilan yang lebih rapi untuk admin dan
                                pengalaman detail produk yang tetap konsisten.
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
                                        {products.length}
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

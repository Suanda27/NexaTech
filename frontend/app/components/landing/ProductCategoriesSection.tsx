"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fetchCatalogCategories, type ApiCategory } from "@/lib/store";
import { useLanguage } from "@/context/LanguageContext";

const categoryImageFallbacks: Record<string, string> = {
    laptop: "/images/categories/laptops.jpg",
    laptops: "/images/categories/laptops.jpg",
    "pc-component": "/images/categories/pc-components.jpg",
    "pc-components": "/images/categories/pc-components.jpg",
    component: "/images/categories/pc-components.jpg",
    components: "/images/categories/pc-components.jpg",
    accessories: "/images/categories/accessories.jpg",
    accessory: "/images/categories/accessories.jpg",
    monitor: "/images/categories/monitor.jpg",
    monitors: "/images/categories/monitor.jpg",
    storage: "/images/categories/storage.jpg",
    "printer-office": "/images/categories/printer-office.jpg",
    "printer-and-office": "/images/categories/printer-office.jpg",
    printer: "/images/categories/printer-office.jpg",
    office: "/images/categories/printer-office.jpg",
};

function normalizeKey(value: string | null | undefined): string {
    return (value ?? "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function resolveCategoryImage(category: ApiCategory): string | null {
    if (category.imageUrl) {
        return category.imageUrl;
    }

    const slugKey = normalizeKey(category.slug);
    const nameKey = normalizeKey(category.name);

    return (
        categoryImageFallbacks[slugKey] ??
        categoryImageFallbacks[nameKey] ??
        null
    );
}

function resolveCategoryHref(category: ApiCategory): string {
    const categoryKey = category.slug ?? String(category.id);
    return `/product?category=${encodeURIComponent(categoryKey)}`;
}

export default function ProductCategoriesSection() {
    const { t } = useLanguage();
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadCategories = async () => {
            try {
                const response = await fetchCatalogCategories();

                if (mounted) {
                    setCategories(response.data);
                }
            } catch {
                if (mounted) {
                    setCategories([]);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadCategories();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <section className="bg-gradient-to-b from-white to-gray-50 py-14 sm:py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-14 max-w-2xl text-center lg:mb-20">
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        {t("Browse Categories")}
                    </h2>

                    <p className="mt-4 text-lg text-gray-600">
                        Temukan perangkat dan aksesori pilihan untuk melengkapi
                        kebutuhan teknologi Anda.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-64 animate-pulse rounded-lg border border-blue-100 bg-blue-50 sm:h-72 md:h-80"
                            />
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-16 text-center">
                        <p className="text-lg font-semibold text-slate-950">
                            Koleksi kategori segera hadir
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Nantikan pilihan produk terbaik dari NexaTech.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category, index) => {
                            const imageSrc = resolveCategoryImage(category);

                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 34, scale: 0.98 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, amount: 0.18 }}
                                    transition={{
                                        duration: 0.65,
                                        delay: index * 0.08,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                >
                                    <Link
                                        href={resolveCategoryHref(category)}
                                        className="group relative block h-64 overflow-hidden rounded-lg border border-blue-100 bg-slate-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60 sm:h-72 md:h-80"
                                    >
                                        {imageSrc ? (
                                            <Image
                                                src={imageSrc}
                                                alt={category.name}
                                                fill
                                                unoptimized
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-blue-50 text-center text-sm font-semibold text-blue-700">
                                                Gambar kategori belum tersedia
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(59,130,246,0)_0%,rgba(59,130,246,0.18)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
                                            <div className="flex justify-end">
                                                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm">
                                                    {category.totalProducts} produk
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-blue-300 md:text-3xl">
                                                    {category.name}
                                                </h3>

                                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/90">
                                                    {t("View Products")}
                                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fetchFeaturedProducts, type ApiProduct } from "@/lib/store";
import { useLanguage } from "@/context/LanguageContext";

export default function FeaturedProductsSection() {
    const { t } = useLanguage();
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadProducts = async () => {
            try {
                const response = await fetchFeaturedProducts();

                if (mounted) {
                    setProducts(response.data);
                }
            } catch {
                if (mounted) {
                    setProducts([]);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadProducts();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <section className="bg-white py-14 sm:py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col gap-4 rounded-lg border border-blue-100 bg-blue-50/60 p-5 shadow-sm shadow-blue-100/50 sm:p-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-blue-600">
                            {t("Featured Products")}
                        </p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            {t("Fresh product visuals from the live catalog.")}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
                            Section ini sekarang mengikuti data produk dari
                            backend, jadi isi landing akan ikut berubah saat
                            produk di admin diperbarui.
                        </p>
                    </div>

                    <Link
                        href="/product"
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200"
                    >
                        {t("View All Products")}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="aspect-[4/5] animate-pulse rounded-lg border border-blue-100 bg-blue-50"
                            />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-16 text-center">
                        <p className="text-lg font-semibold text-slate-950">
                            Belum ada produk unggulan
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Produk yang punya gambar dan status aktif akan
                            otomatis muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, amount: 0.22 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.08,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                <Link
                                    href={`/product/${product.id}`}
                                    className="group block overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-blue-50">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-blue-600">
                                                {t("No Image")}
                                            </div>
                                        )}
                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(59,130,246,0)_0%,rgba(59,130,246,0.14)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

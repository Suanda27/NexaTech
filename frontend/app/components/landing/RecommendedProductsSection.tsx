"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
    fetchPersonalRecommendations,
    fetchPublicRecommendations,
    type ApiProduct,
} from "@/lib/store";
import { useLanguage } from "@/context/LanguageContext";

export default function RecommendedProductsSection() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);

        const loadRecommendations = async () => {
            try {
                const response = user
                    ? await fetchPersonalRecommendations()
                    : await fetchPublicRecommendations();

                if (mounted) {
                    setProducts(response.data);
                }
            } catch {
                try {
                    const response = await fetchPublicRecommendations();

                    if (mounted) {
                        setProducts(response.data);
                    }
                } catch {
                    if (mounted) {
                        setProducts([]);
                    }
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadRecommendations();

        return () => {
            mounted = false;
        };
    }, [user]);

    return (
        <section className="bg-gradient-to-b from-gray-50 to-white py-14 sm:py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 grid gap-5 lg:mb-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                            <Sparkles className="h-4 w-4" />
                            {t("Recommended For You")}
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            Rekomendasi yang mengikuti cara belanjamu.
                        </h2>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
                            Produk di bagian ini ditampilkan acak untuk guest,
                            lalu menyesuaikan histori pembelian dan kategori
                            pelengkap setelah kamu login.
                        </p>
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-100">
                                <BadgeCheck className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="font-bold text-gray-950">
                                    {user
                                        ? t("Personalized picks")
                                        : t("Random picks")}
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                    {user
                                        ? "Jika kamu membeli laptop, aksesoris seperti mouse, keyboard, headset, monitor, dan storage akan diprioritaskan."
                                        : "Login untuk melihat rekomendasi yang menyesuaikan riwayat pembelianmu."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[380px] animate-pulse rounded-lg border border-blue-100 bg-blue-50"
                            />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-blue-200 bg-white px-6 py-16 text-center">
                        <p className="text-lg font-semibold text-slate-950">
                            Rekomendasi belum tersedia
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Tambahkan produk aktif dari admin agar section ini
                            bisa menampilkan rekomendasi.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function ProductCard({
    product,
    index,
}: {
    product: ApiProduct;
    index: number;
}) {
    const { t } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{
                duration: 0.62,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
        >
            <Link href={`/product/${product.id}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-blue-50 p-2">
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                            unoptimized
                            className="rounded-lg object-cover transition duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-blue-600">
                            {t("No Image")}
                        </div>
                    )}
                    <span className="absolute left-5 top-5 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                        {product.recommendationReason ?? product.category}
                    </span>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(59,130,246,0)_0%,rgba(59,130,246,0.14)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
            </Link>

            <div className="space-y-4 p-5">
                <div>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="line-clamp-2 font-bold text-gray-950 transition group-hover:text-blue-700">
                            {product.name}
                        </h3>
                    </Link>

                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {product.description || "Produk rekomendasi dari katalog NexaTech."}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <p className="text-lg font-bold text-gray-950">
                        Rp {product.price.toLocaleString("id-ID")}
                    </p>

                    <Link
                        href={`/product/${product.id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"
                        aria-label={`Lihat ${product.name}`}
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import AuthGuard from "@/app/components/auth/AuthGuard";
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";
import {
    ArrowLeft,
    ArrowRight,
    Heart,
    ShieldCheck,
    ShoppingCart,
    Star,
    Truck,
} from "lucide-react";
import {
    addCartItem,
    fetchProductDetail,
    type ApiProduct,
} from "@/lib/store";
import { getSpecIcon } from "@/app/admin/product/utils";

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { refreshCartCount } = useShop();
    const [product, setProduct] = useState<ApiProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadProduct = async () => {
            try {
                const response = await fetchProductDetail(id);

                if (mounted) {
                    setProduct(response.data);
                }
            } catch {
                if (mounted) {
                    setProduct(null);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadProduct();

        return () => {
            mounted = false;
        };
    }, [id]);

    const handleAddToCart = async () => {
        if (!product || product.stock <= 0) {
            return;
        }

        try {
            await addCartItem(product.id, 1);
            await refreshCartCount();
            alert("Produk berhasil ditambahkan ke cart.");
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal menambahkan produk ke cart.",
            );
        }
    };

    return (
        <AuthGuard loginPath="/customer/login">
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
                {user ? <HeaderUser /> : <HeaderGuest />}

                <div className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-6 md:px-6 md:py-8 md:space-y-12">
                    <Link
                        href="/product"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Products
                    </Link>

                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                            <div className="aspect-square animate-pulse rounded-lg border border-blue-100 bg-blue-50" />
                            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-14 animate-pulse rounded-lg bg-blue-50"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : !product ? (
                        <div className="rounded-lg border border-dashed border-blue-200 bg-white px-6 py-20 text-center">
                            <p className="text-xl font-semibold text-slate-950">
                                Produk tidak ditemukan
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Data detail produk akan muncul di sini kalau item
                                tersedia di database.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                                <div className="space-y-4">
                                    <div className="group relative aspect-square overflow-hidden rounded-lg border border-blue-100 bg-blue-50 p-3 shadow-sm shadow-blue-100/60 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100">
                                        <div className="absolute left-6 top-6 z-10 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                                            {product.category}
                                        </div>
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-full w-full rounded-lg object-cover ring-1 ring-blue-100 transition duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-blue-600 ring-1 ring-blue-100">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 sm:gap-4">
                                        {(product.gallery?.length
                                            ? product.gallery
                                            : [product.imageUrl]
                                        )
                                            .filter(Boolean)
                                            .map((image, index) => (
                                                <div
                                                    key={`${image}-${index}`}
                                                    className="group aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                                >
                                                    <img
                                                        src={image ?? ""}
                                                        alt={`${product.name} preview ${index + 1}`}
                                                        className="h-full w-full rounded-md object-cover transition duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                <div className="space-y-7 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                                    <div>
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <div className="flex text-yellow-500">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-4 w-4 ${
                                                            star <= product.rating
                                                                ? "fill-current"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                                {product.stock > 0
                                                    ? "In Stock"
                                                    : "Out of Stock"}
                                            </span>
                                            {product.stock > 0 && product.stock <= 10 && (
                                                <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                                                    Tersisa {product.stock} unit
                                                </span>
                                            )}
                                        </div>

                                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                                            {product.name}
                                        </h1>

                                        <p className="mt-4 text-3xl font-bold text-blue-700 sm:text-4xl">
                                            Rp {product.price.toLocaleString("id-ID")}
                                        </p>
                                    </div>

                                    <p className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 leading-relaxed text-gray-700">
                                        {product.description ||
                                            "Deskripsi produk akan mengikuti isi dari database."}
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-600">
                                                Performance Details
                                            </p>
                                            <h3 className="text-lg font-bold text-gray-950">
                                                Key Specifications
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {(product.specs ?? []).map((spec) => {
                                                const Icon = getSpecIcon(spec.icon);

                                                return (
                                                    <div
                                                        key={spec.id}
                                                        className="group rounded-lg border border-gray-200 bg-gray-50/80 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-100"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100 transition group-hover:bg-blue-600 group-hover:text-white">
                                                                <Icon className="h-5 w-5" />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                    {spec.label}
                                                                </p>
                                                                <p className="mt-1 break-words text-sm font-bold text-gray-950">
                                                                    {spec.value}
                                                                </p>
                                                                <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                                                                    {spec.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            disabled={product.stock <= 0}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                            {product.stock > 0
                                                ? "Add to Cart"
                                                : "Stok Habis"}
                                        </button>

                                        <button
                                            type="button"
                                            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                                        >
                                            <Heart className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-7 sm:grid-cols-2">
                                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <Truck className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    Free Shipping
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Delivery follows order confirmation
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    Protected Checkout
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Data payment is synced from backend
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section className="border-t border-gray-200 pt-10">
                                <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-600">
                                            Related Recommendations
                                        </p>
                                        <h2 className="text-2xl font-bold text-gray-950">
                                            You May Also Like
                                        </h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                                    {(product.relatedProducts ?? []).map((item) => (
                                        <div
                                            key={item.id}
                                            className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/40 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
                                        >
                                            <Link href={`/product/${item.id}`}>
                                                <div className="relative aspect-[4/3] overflow-hidden bg-blue-50 p-2">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="h-full w-full rounded-lg object-cover transition duration-500 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-blue-600">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="space-y-3 p-4">
                                                <Link href={`/product/${item.id}`}>
                                                    <h3 className="font-bold text-gray-950 transition group-hover:text-blue-700">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                                                    {item.description}
                                                </p>
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-lg font-bold text-blue-700">
                                                        Rp {item.price.toLocaleString("id-ID")}
                                                    </p>
                                                    <Link
                                                        href={`/product/${item.id}`}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                                                    >
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </div>

                <Footer />
            </div>
        </AuthGuard>
    );
}

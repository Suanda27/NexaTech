"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";

import {
    ArrowLeft,
    ArrowRight,
    Cpu,
    HardDrive,
    Heart,
    Monitor,
    ShieldCheck,
    ShoppingCart,
    Star,
    Truck,
    Zap,
} from "lucide-react";

export default function ProductDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();

    const product = {
        id,
        name: "NexaBook Pro 16",
        price: 1499,
        description:
            "The ultimate laptop for creators and gamers. Featuring a powerful processor, 32GB memory, fast SSD storage, and a stunning 120Hz display for smooth work, gaming, and creative production.",
        specs: [
            {
                label: "Display",
                value: "16-inch Retina 120Hz",
                icon: Monitor,
            },
            {
                label: "Memory",
                value: "32GB Unified Memory",
                icon: Zap,
            },
            {
                label: "Storage",
                value: "1TB SSD Storage",
                icon: HardDrive,
            },
            {
                label: "Processor",
                value: "12-Core CPU",
                icon: Cpu,
            },
        ],
        image: "https://images.unsplash.com/photo-1658262530868-f7460e2f071f?q=80&w=1080",
    };

    const gallery = [
        product.image,
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1080",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1080",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1080",
    ];

    const relatedProducts = [
        {
            id: 2,
            name: "NexaBook Air 14",
            description: "Lightweight laptop for daily work, study, and travel.",
            price: 999,
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1080",
        },
        {
            id: 3,
            name: "Creator Dock Pro",
            description: "USB-C dock with HDMI, ethernet, and fast charging.",
            price: 149,
            image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1080",
        },
        {
            id: 4,
            name: "Wireless Mouse X",
            description: "Precision mouse with silent clicks and long battery life.",
            price: 79,
            image: "https://images.unsplash.com/photo-1586349906319-48d20e9d17e5?q=80&w=1080",
        },
        {
            id: 5,
            name: "Laptop Sleeve Premium",
            description: "Soft protective sleeve with a clean professional finish.",
            price: 49,
            image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1080",
        },
    ];

    const formatPrice = (num: number) => num.toLocaleString("en-US");

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
            {user ? <HeaderUser /> : <HeaderGuest />}

            <div className="w-full flex-1 mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-10 md:py-8 md:space-y-12">
                <Link
                    href="/product"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Products
                </Link>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    <div className="space-y-4">
                        <div className="group relative aspect-square overflow-hidden rounded-lg border border-blue-100 bg-blue-50 p-3 shadow-sm shadow-blue-100/60 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100">
                            <div className="absolute left-6 top-6 z-10 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                                Featured Laptop
                            </div>
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full rounded-lg object-cover ring-1 ring-blue-100 transition duration-700 group-hover:scale-105"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-2 sm:gap-4">
                            {gallery.map((image, index) => (
                                <div
                                    key={image}
                                    className="group aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} preview ${index + 1}`}
                                        className="h-full w-full rounded-md object-cover transition duration-500 group-hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-7 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <div className="flex text-yellow-500">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className="h-4 w-4 fill-current"
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    (128 reviews)
                                </span>
                                <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                    In Stock
                                </span>
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                                {product.name}
                            </h1>

                            <p className="mt-4 text-3xl font-bold text-blue-700 sm:text-4xl">
                                ${formatPrice(product.price)}
                            </p>
                        </div>

                        <p className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 text-gray-700 leading-relaxed">
                            {product.description}
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
                                {product.specs.map((spec) => {
                                    const Icon = spec.icon;

                                    return (
                                        <div
                                            key={spec.label}
                                            className="group rounded-lg border border-gray-200 bg-gray-50/80 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-100"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100 transition group-hover:bg-blue-600 group-hover:text-white">
                                                    <Icon className="h-5 w-5" />
                                                </span>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        {spec.label}
                                                    </p>
                                                    <p className="mt-1 text-sm font-bold text-gray-950">
                                                        {spec.value}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
                            <Link
                                href="/cart"
                                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Add to Cart
                            </Link>

                            <button className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50">
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
                                        Delivery in 2-4 days
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        2-Year Warranty
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Full protection plan
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="pt-10 border-t border-gray-200">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-blue-600">
                                Related Recommendations
                            </p>
                            <h2 className="text-2xl font-bold text-gray-950">
                                You May Also Like
                            </h2>
                        </div>
                        <p className="max-w-md text-sm text-gray-500">
                            Products that pair well with your laptop setup.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                        {relatedProducts.map((item) => (
                            <div
                                key={item.id}
                                className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/40 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
                            >
                                <Link href={`/product/${item.id}`}>
                                    <div className="relative aspect-[4/3] overflow-hidden bg-blue-50 p-2">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full rounded-lg object-cover transition duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                </Link>

                                <div className="space-y-3 p-4">
                                    <Link href={`/product/${item.id}`}>
                                        <h3 className="font-bold text-gray-950 transition group-hover:text-blue-700">
                                            {item.name}
                                        </h3>
                                    </Link>
                                    <p className="text-sm leading-relaxed text-gray-600">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-lg font-bold text-blue-700">
                                            ${formatPrice(item.price)}
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
            </div>

            <Footer />
        </div>
    );
}

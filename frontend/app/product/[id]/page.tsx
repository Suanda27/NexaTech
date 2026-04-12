"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";

import {
    Star,
    Truck,
    ShieldCheck,
    ArrowLeft,
    ShoppingCart,
    Heart,
} from "lucide-react";

export default function ProductDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();

    const product = {
        id: id,
        name: "NexaBook Pro 16",
        price: 1499,
        description:
            "The ultimate laptop for creators and gamers. Featuring the latest M3-equivalent processor, 32GB RAM, and a stunning 120Hz display.",
        specs: [
            "16-inch Retina Display",
            "32GB Unified Memory",
            "1TB SSD Storage",
            "12-Core CPU",
        ],
        image: "https://images.unsplash.com/photo-1658262530868-f7460e2f071f?q=80&w=1080",
    };

    const formatPrice = (num: number) => num.toLocaleString("en-US");

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {user ? <HeaderUser /> : <HeaderGuest />}

            <div className="flex-1 mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-12">
                {/* 🔥 FIX TEXT */}
                <Link
                    href="/product"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Products
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* IMAGE */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="aspect-square bg-gray-100 rounded-xl border border-gray-200"
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* INFO */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-500">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            className="h-4 w-4 fill-current"
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    (128 reviews)
                                </span>
                            </div>

                            {/* 🔥 TITLE CLEAR */}
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                {product.name}
                            </h1>

                            {/* 🔥 PRICE CLEAR */}
                            <p className="mt-4 text-3xl font-bold text-blue-600">
                                ${formatPrice(product.price)}
                            </p>
                        </div>

                        {/* 🔥 DESCRIPTION CLEAR */}
                        <p className="text-gray-700 leading-relaxed">
                            {product.description}
                        </p>

                        {/* SPECS */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900">
                                Key Specifications:
                            </h3>

                            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                {product.specs.map((spec) => (
                                    <li
                                        key={spec}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                        {spec}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* BUTTON */}
                        <div className="flex gap-4 pt-4">
                            <Link
                                href="/cart"
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 transition"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Add to Cart
                            </Link>

                            <button className="flex items-center justify-center rounded-xl border border-gray-300 px-6 py-4 hover:bg-gray-100">
                                <Heart className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* INFO */}
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-8">
                            <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        Free Shipping
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Delivery in 2-4 days
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-gray-500" />
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

                {/* RELATED */}
                <section className="pt-12 border-t border-gray-200">
                    <h2 className="text-2xl font-bold mb-8 text-gray-900">
                        You May Also Like
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-square bg-gray-100 rounded-xl border border-gray-200"></div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                    Product Accessory {i}
                                </h3>
                                <p className="text-sm text-blue-600 font-bold">
                                    $49
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
}

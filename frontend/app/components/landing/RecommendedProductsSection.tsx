import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
};

const recommendedProducts: Product[] = [
    {
        id: 1,
        name: "Gaming Laptop Pro",
        description:
            "High-performance laptop with RTX graphics and 144Hz display",
        price: 1499.99,
        image: "https://images.unsplash.com/photo-1606625000171-fa7d471da28c",
    },
    {
        id: 2,
        name: "PC Components Bundle",
        description: "Complete motherboard and GPU combo for your next build",
        price: 899.99,
        image: "https://images.unsplash.com/photo-1610642436394-81749134ffe8",
    },
    {
        id: 3,
        name: "Gaming Headset Pro",
        description: "7.1 surround sound with noise cancellation technology",
        price: 249.99,
        image: "https://images.unsplash.com/photo-1661613950846-ebb7a41685fc",
    },
    {
        id: 4,
        name: "Wireless Gaming Mouse",
        description: "Ultra-precise sensor with customizable RGB lighting",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1563549054059-bf4ebe2f49d5",
    },
];

export default function RecommendedProductsSection() {
    return (
        <section className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <div className="mx-auto max-w-2xl text-center mb-14 lg:mb-20">
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        Recommended For You
                    </h2>

                    <p className="mt-4 text-lg text-gray-600">
                        Curated selections based on trending technology and
                        customer favorites
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {recommendedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
                        >
                            {/* Product Image */}
                            <Link href={`/products/${product.id}`}>
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width:768px) 100vw,
                           (max-width:1200px) 50vw,
                           25vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </Link>

                            {/* Product Info */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <Link href={`/products/${product.id}`}>
                                        <h3 className="text-lg font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                        {product.description}
                                    </p>

                                    <p className="mt-3 text-xl font-semibold text-gray-900">
                                        ${product.price}
                                    </p>
                                </div>

                                {/* View Product Button */}
                                <Link
                                    href={`/products/${product.id}`}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-600 px-4 py-3 text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white"
                                >
                                    View Product
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

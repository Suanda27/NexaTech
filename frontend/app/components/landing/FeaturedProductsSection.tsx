import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    rating: number;
    image: string;
    tag: string;
};

const products: Product[] = [
    {
        id: 1,
        name: "RGB Mechanical Keyboard",
        description: "Tactile switches, bright RGB lighting, and a solid aluminum frame.",
        price: 149.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1649899913123-90bb33c8a66a",
        tag: "Creator Pick",
    },
    {
        id: 2,
        name: "Premium Wireless Earbuds",
        description: "Clear audio, deep bass, and compact charging for everyday listening.",
        price: 199.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1695634463848-4db4e47703a4",
        tag: "Best Audio",
    },
    {
        id: 3,
        name: "4K Gaming Monitor",
        description: "Sharp UHD visuals with fast refresh performance for immersive play.",
        price: 599.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1761954090578-f440c37ac4eb",
        tag: "Pro Display",
    },
    {
        id: 4,
        name: "Portable SSD 1TB",
        description: "Pocket-sized storage with fast transfers for work files and games.",
        price: 129.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1721333084639-0f64b0583875",
        tag: "Fast Storage",
    },
    {
        id: 5,
        name: "Gaming Mouse RGB",
        description: "Accurate sensor, ergonomic grip, and customizable lighting profiles.",
        price: 89.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7",
        tag: "Precision Gear",
    },
    {
        id: 6,
        name: "UltraWide Monitor",
        description: "Wide workspace for editing, multitasking, and cinematic entertainment.",
        price: 499.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
        tag: "Workspace",
    },
    {
        id: 7,
        name: "Gaming Chair Pro",
        description: "Supportive seating with adjustable comfort for long desk sessions.",
        price: 299.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6",
        tag: "Comfort",
    },
    {
        id: 8,
        name: "External Hard Drive 2TB",
        description: "Reliable backup storage for photos, media, documents, and projects.",
        price: 179.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a",
        tag: "Backup Ready",
    },
];

export default function FeaturedProductsSection() {
    return (
        <section className="bg-white py-14 sm:py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col gap-4 rounded-lg border border-blue-100 bg-blue-50/60 p-5 shadow-sm shadow-blue-100/50 sm:p-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-blue-600">
                            Featured Products
                        </p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            Built for work, play, and everything between.
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
                            Explore premium picks selected for performance,
                            design, and long-term everyday value.
                        </p>
                    </div>

                    <Link
                        href="/product"
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200"
                    >
                        View All Products
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ product }: { product: Product }) {
    return (
        <div className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70">
            <Link href={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden bg-blue-50 p-3">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 ring-1 ring-blue-100">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width:768px) 100vw,
                                   (max-width:1200px) 50vw,
                                   25vw"
                            className="object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    </div>

                    <span className="absolute left-5 top-5 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                        {product.tag}
                    </span>
                </div>
            </Link>

            <div className="space-y-4 p-5">
                <div>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="font-bold text-gray-950 transition group-hover:text-blue-700">
                            {product.name}
                        </h3>
                    </Link>

                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {product.description}
                    </p>

                    <div className="mt-3 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                                key={index}
                                className={`h-4 w-4 ${
                                    index < product.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <p className="text-xl font-bold text-blue-700">
                        ${product.price}
                    </p>

                    <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200">
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

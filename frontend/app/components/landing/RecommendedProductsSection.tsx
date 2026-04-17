import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    reason: string;
};

const recommendedProducts: Product[] = [
    {
        id: 1,
        name: "Gaming Laptop Pro",
        description: "RTX-class graphics, fast cooling, and a bright high-refresh display.",
        price: 1499.99,
        image: "https://images.unsplash.com/photo-1606625000171-fa7d471da28c",
        reason: "Best for performance",
    },
    {
        id: 2,
        name: "PC Components Bundle",
        description: "Balanced motherboard and GPU combo for a smooth custom build.",
        price: 899.99,
        image: "https://images.unsplash.com/photo-1610642436394-81749134ffe8",
        reason: "Build-ready set",
    },
    {
        id: 3,
        name: "Gaming Headset Pro",
        description: "Detailed surround sound and noise control for focused sessions.",
        price: 249.99,
        image: "https://images.unsplash.com/photo-1661613950846-ebb7a41685fc",
        reason: "Immersive audio",
    },
    {
        id: 4,
        name: "Wireless Gaming Mouse",
        description: "Ultra-precise tracking with a lightweight wireless feel.",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1563549054059-bf4ebe2f49d5",
        reason: "Popular accessory",
    },
    {
        id: 5,
        name: "Mechanical Keyboard RGB",
        description: "Hot-swappable switches and a premium board feel for daily typing.",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7",
        reason: "Desk upgrade",
    },
    {
        id: 6,
        name: "4K Gaming Monitor",
        description: "Ultra HD clarity with fast refresh for gaming and creative work.",
        price: 599.99,
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
        reason: "Sharper visuals",
    },
    {
        id: 7,
        name: "Gaming Chair Pro",
        description: "Ergonomic comfort with adjustable support for long sessions.",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6",
        reason: "Comfort pick",
    },
    {
        id: 8,
        name: "External SSD 1TB",
        description: "Fast portable storage for files, games, photos, and backups.",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a",
        reason: "Storage essential",
    },
];

export default function RecommendedProductsSection() {
    return (
        <section className="bg-gradient-to-b from-gray-50 to-white py-14 sm:py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 grid gap-5 lg:mb-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                            <Sparkles className="h-4 w-4" />
                            Recommended For You
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            Smart pairings for your next setup.
                        </h2>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
                            These selections are arranged around useful product
                            combinations, customer favorites, and everyday tech
                            upgrades.
                        </p>
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-100">
                                <BadgeCheck className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="font-bold text-gray-950">
                                    Curated by category
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                    Each recommendation is chosen to work well
                                    with laptops, gaming gear, storage, or desk
                                    accessories.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {recommendedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ product }: { product: Product }) {
    return (
        <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70">
            <Link href={`/product/${product.id}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-blue-50 p-2">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width:768px) 100vw,
                               (max-width:1200px) 50vw,
                               25vw"
                        className="rounded-lg object-cover p-2 transition duration-700 group-hover:scale-110"
                    />
                    <span className="absolute left-5 top-5 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                        {product.reason}
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
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <p className="text-xl font-bold text-gray-950">
                        ${product.price}
                    </p>

                    <Link
                        href={`/product/${product.id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

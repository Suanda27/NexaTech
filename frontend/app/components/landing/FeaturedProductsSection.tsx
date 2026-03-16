import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";

type Product = {
    id: number;
    name: string;
    price: number;
    rating: number;
    image: string;
};

const products: Product[] = [
    {
        id: 1,
        name: "RGB Mechanical Keyboard",
        price: 149.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1649899913123-90bb33c8a66a",
    },
    {
        id: 2,
        name: "Premium Wireless Earbuds",
        price: 199.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1695634463848-4db4e47703a4",
    },
    {
        id: 3,
        name: "4K Gaming Monitor",
        price: 599.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1761954090578-f440c37ac4eb",
    },
    {
        id: 4,
        name: "Portable SSD 1TB",
        price: 129.99,
        rating: 5,
        image: "https://images.unsplash.com/photo-1721333084639-0f64b0583875",
    },
];

export default function FeaturedProductsSection() {
    return (
        <section className="bg-white py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <div className="mx-auto max-w-2xl text-center mb-14 lg:mb-20">
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        Featured Products
                    </h2>

                    <p className="mt-4 text-lg text-gray-600">
                        Hand-picked premium products that deliver exceptional
                        performance
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
                        >
                            {/* Product Image */}
                            <Link href={`/products/${product.id}`}>
                                <div className="relative aspect-square bg-gray-50 overflow-hidden">
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

                                    {/* Rating */}
                                    <div className="mt-2 flex items-center gap-1">
                                        {Array.from({
                                            length: product.rating,
                                        }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-4 w-4 fill-blue-600 text-blue-600"
                                            />
                                        ))}
                                    </div>

                                    {/* Price */}
                                    <p className="mt-3 text-xl font-semibold text-gray-900">
                                        ${product.price}
                                    </p>
                                </div>

                                {/* Add to Cart */}
                                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white transition-colors duration-300 hover:bg-blue-700">
                                    <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

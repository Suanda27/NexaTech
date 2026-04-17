import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";

interface ProductCardProps {
    id: number;
    name: string;
    price: number;
    image: string;
    rating: number;
}

export function ProductCard({
    id,
    name,
    price,
    image,
    rating,
}: ProductCardProps) {
    return (
        <div className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-100/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70">
            {/* Image */}
            <Link href={`/product/${id}`} className="block">
                <div className="relative overflow-hidden bg-blue-50 p-3">
                    <div className="relative h-52 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-blue-100 md:h-64">
                        <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    </div>

                    <span className="absolute left-5 top-5 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                        New Arrival
                    </span>
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 md:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link href={`/product/${id}`}>
                            <h3 className="line-clamp-2 text-sm font-bold text-gray-950 transition group-hover:text-blue-700 md:text-base">
                                {name}
                            </h3>
                        </Link>

                        {/* Rating */}
                        <div className="mt-2 flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                        i < rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200">
                        <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>

                {/* Price */}
                <p className="text-lg font-bold text-blue-700 md:text-xl">
                    ${price.toFixed(2)}
                </p>
            </div>
        </div>
    );
}

import { Star, ShoppingCart } from "lucide-react";

interface ProductCardProps {
    name: string;
    price: number;
    image: string;
    rating: number;
}

export function ProductCard({ name, price, image, rating }: ProductCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            {/* Image */}
            <div className="relative overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-52 md:h-64 object-cover group-hover:scale-105 transition"
                />

                {/* Button */}
                <button className="absolute top-3 right-3 md:top-4 md:right-4 w-9 h-9 md:w-10 md:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition">
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-5">
                <h3 className="text-gray-900 text-sm md:text-base font-medium mb-2">
                    {name}
                </h3>

                {/* Rating */}
                <div className="flex gap-1 mb-2">
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

                {/* Price */}
                <p className="font-semibold text-gray-900 text-base md:text-lg">
                    ${price.toFixed(2)}
                </p>
            </div>
        </div>
    );
}

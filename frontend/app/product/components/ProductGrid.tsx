import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

const products = [
    {
        id: 1,
        name: "MacBook Pro 16-inch",
        price: 2399.99,
        image: "https://images.unsplash.com/photo-1759668358660-0d06064f0f84",
        rating: 5,
    },
    {
        id: 2,
        name: "RGB Gaming Keyboard",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb",
        rating: 4,
    },
    {
        id: 3,
        name: "Wireless Mouse",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1586349906319-48d20e9d17e5",
        rating: 5,
    },
    {
        id: 4,
        name: "Gaming Headset",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1629429407756-4a7703614972",
        rating: 4,
    },
    {
        id: 5,
        name: "RTX 4090",
        price: 1599.99,
        image: "https://images.unsplash.com/photo-1658673847785-08f1738116f8",
        rating: 5,
    },
    {
        id: 6,
        name: "Mechanical Keyboard",
        price: 179.99,
        image: "https://images.unsplash.com/photo-1626958390898-162d3577f293",
        rating: 5,
    },
];

export function ProductGrid() {
    return (
        <div>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10">
                {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 flex-wrap">
                <button className="w-9 h-9 md:w-10 md:h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100">
                    <ChevronLeft size={18} />
                </button>

                <button className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 text-white rounded-lg">
                    1
                </button>
                <button className="w-9 h-9 md:w-10 md:h-10 border rounded-lg">
                    2
                </button>
                <button className="w-9 h-9 md:w-10 md:h-10 border rounded-lg">
                    3
                </button>

                <button className="w-9 h-9 md:w-10 md:h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

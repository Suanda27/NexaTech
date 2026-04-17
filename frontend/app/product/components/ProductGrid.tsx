"use client";

import { useMemo, useState } from "react";
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
    {
        id: 7,
        name: "UltraWide Monitor",
        price: 499.99,
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
        rating: 4,
    },
    {
        id: 8,
        name: "Gaming Chair Pro",
        price: 299.99,
        image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6",
        rating: 5,
    },
    {
        id: 9,
        name: "External SSD 1TB",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a",
        rating: 4,
    },
    {
        id: 10,
        name: "Wireless Earbuds Pro",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1695634463848-4db4e47703a4",
        rating: 5,
    },
    {
        id: 11,
        name: "Portable Docking Station",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1721333084639-0f64b0583875",
        rating: 4,
    },
    {
        id: 12,
        name: "Premium Webcam",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3",
        rating: 4,
    },
];

export function ProductGrid() {
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 4;
    const totalPages = Math.ceil(products.length / productsPerPage);

    const visibleProducts = useMemo(() => {
        const start = (currentPage - 1) * productsPerPage;
        return products.slice(start, start + productsPerPage);
    }, [currentPage]);

    const goToPage = (page: number) => {
        setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    };

    return (
        <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-blue-600">
                        Product Collection
                    </p>
                    <h1 className="text-2xl font-bold text-gray-950">
                        Explore Products
                    </h1>
                </div>
                <p className="text-sm text-gray-500">
                    Showing page {currentPage} of {totalPages}
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10">
                {visibleProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 md:w-10 md:h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-white text-gray-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600"
                >
                    <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    const isActive = currentPage === page;

                    return (
                        <button
                            key={page}
                            type="button"
                            onClick={() => goToPage(page)}
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm font-bold transition ${
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                    : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 md:w-10 md:h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-white text-gray-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

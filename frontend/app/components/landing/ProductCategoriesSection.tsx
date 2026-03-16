import Image from "next/image";
import Link from "next/link";

type Category = {
    name: string;
    image: string;
    slug: string;
};

const categories: Category[] = [
    {
        name: "Laptops",
        slug: "laptops",
        image: "https://images.unsplash.com/photo-1606625000171-fa7d471da28c",
    },
    {
        name: "PC Components",
        slug: "pc-components",
        image: "https://images.unsplash.com/photo-1610642436394-81749134ffe8",
    },
    {
        name: "Gaming Gear",
        slug: "gaming-gear",
        image: "https://images.unsplash.com/photo-1661613950846-ebb7a41685fc",
    },
    {
        name: "Accessories",
        slug: "accessories",
        image: "https://images.unsplash.com/photo-1563549054059-bf4ebe2f49d5",
    },
];

export default function ProductCategoriesSection() {
    return (
        <section className="bg-gradient-to-b from-white to-gray-50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <div className="mx-auto max-w-2xl text-center mb-14 lg:mb-20">
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        Browse Categories
                    </h2>

                    <p className="mt-4 text-lg text-gray-600">
                        Find exactly what you need across our comprehensive
                        product range
                    </p>
                </div>

                {/* Category Grid */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={`/categories/${category.slug}`}
                            className="group relative h-72 md:h-80 overflow-hidden rounded-2xl"
                        >
                            {/* Image */}
                            <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                sizes="(max-width:768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                            {/* Title */}
                            <div className="absolute inset-0 flex items-end p-6 md:p-8">
                                <h3 className="text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-blue-400 md:text-3xl">
                                    {category.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

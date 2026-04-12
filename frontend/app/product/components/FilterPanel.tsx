"use client";

export function FilterPanel() {
    return (
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 lg:sticky lg:top-6">
            <h2 className="font-semibold text-lg mb-6 text-gray-900">
                Filters
            </h2>

            {/* Category */}
            <div className="mb-8">
                <h3 className="font-medium text-sm mb-4 text-gray-700">
                    Category
                </h3>

                <div className="space-y-3">
                    {[
                        "Laptop",
                        "PC Components",
                        "Gaming Gear",
                        "Accessories",
                    ].map((item) => (
                        <label
                            key={item}
                            className="flex items-center gap-2 text-sm text-gray-600"
                        >
                            <input
                                type="checkbox"
                                className="accent-blue-600"
                            />
                            {item}
                        </label>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="mb-8">
                <h3 className="font-medium text-sm mb-4 text-gray-700">
                    Price
                </h3>

                <div className="space-y-3">
                    {["Lowest Price", "Highest Price"].map((item) => (
                        <label
                            key={item}
                            className="flex items-center gap-2 text-sm text-gray-600"
                        >
                            <input
                                type="radio"
                                name="price"
                                className="accent-blue-600"
                            />
                            {item}
                        </label>
                    ))}
                </div>
            </div>

            {/* Sorting */}
            <div>
                <h3 className="font-medium text-sm mb-4 text-gray-700">
                    Sorting
                </h3>

                <div className="space-y-3">
                    {["Newest Products", "Best Selling", "A-Z"].map((item) => (
                        <label
                            key={item}
                            className="flex items-center gap-2 text-sm text-gray-600"
                        >
                            <input
                                type="radio"
                                name="sort"
                                className="accent-blue-600"
                            />
                            {item}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";
import {
    addCartItem,
    fetchCatalogCategories,
    fetchProducts,
    type ApiCategory,
    type ApiProduct,
    type PaginatedProductsResponse,
} from "@/lib/store";
import { FilterPanel } from "./components/FilterPanel";
import { ProductGrid } from "./components/ProductGrid";

export default function ProductPage() {
    const { user } = useAuth();
    const { refreshCartCount } = useShop();
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [meta, setMeta] = useState<PaginatedProductsResponse["meta"] | null>(
        null,
    );
    const [selectedCategory, setSelectedCategory] = useState("");
    const [price, setPrice] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadCategories = async () => {
            try {
                const response = await fetchCatalogCategories();

                if (mounted) {
                    setCategories(response.data);
                }
            } catch {
                if (mounted) {
                    setCategories([]);
                }
            }
        };

        void loadCategories();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);

        const loadProducts = async () => {
            try {
                const response = await fetchProducts({
                    category: selectedCategory || null,
                    price: price || null,
                    sort: sort || null,
                    page,
                    perPage: 8,
                });

                if (mounted) {
                    setProducts(response.data);
                    setMeta(response.meta);
                }
            } catch {
                if (mounted) {
                    setProducts([]);
                    setMeta(null);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadProducts();

        return () => {
            mounted = false;
        };
    }, [page, price, selectedCategory, sort]);

    const handleResetFilters = () => {
        setSelectedCategory("");
        setPrice("");
        setSort("newest");
        setPage(1);
    };

    const handleAddToCart = async (productId: number) => {
        if (!user) {
            alert("Silahkan login terlebih dahulu untuk menambahkan produk ke cart.");
            return;
        }

        try {
            await addCartItem(productId, 1);
            await refreshCartCount();
            alert("Produk berhasil ditambahkan ke cart.");
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal menambahkan produk ke cart.",
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {user ? <HeaderUser /> : <HeaderGuest />}

            <div className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                        <div className="w-full lg:w-[250px]">
                            <FilterPanel
                                categories={categories}
                                selectedCategory={selectedCategory}
                                price={price}
                                sort={sort}
                                onCategoryChange={(value) => {
                                    setSelectedCategory(value);
                                    setPage(1);
                                }}
                                onPriceChange={(value) => {
                                    setPrice(value);
                                    setPage(1);
                                }}
                                onSortChange={(value) => {
                                    setSort(value);
                                    setPage(1);
                                }}
                                onReset={handleResetFilters}
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <ProductGrid
                                products={products}
                                meta={meta}
                                isLoading={isLoading}
                                onPageChange={setPage}
                                onAddToCart={handleAddToCart}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

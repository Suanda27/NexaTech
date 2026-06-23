"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { Search } from "lucide-react";
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";
import {
    addCartItem,
    fetchCatalogCategories,
    fetchProducts,
    trackProductSearch,
    type ApiCategory,
    type ApiProduct,
    type PaginatedProductsResponse,
} from "@/lib/store";
import { FilterPanel } from "./components/FilterPanel";
import { ProductGrid } from "./components/ProductGrid";

export default function ProductPage() {
    const { user } = useAuth();
    const { refreshCartCount } = useShop();
    const { notify } = useToast();
    const { t } = useLanguage();
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [meta, setMeta] = useState<PaginatedProductsResponse["meta"] | null>(
        null,
    );
    const [selectedCategory, setSelectedCategory] = useState("");
    const [price, setPrice] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
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
                    q: searchQuery || null,
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
    }, [page, price, searchQuery, selectedCategory, sort]);

    useEffect(() => {
        if (!user || searchQuery.trim().length < 2) {
            return;
        }

        const timeout = window.setTimeout(() => {
            void trackProductSearch(searchQuery.trim()).catch(() => {
                // Search history is a recommendation signal; catalog browsing stays unaffected.
            });
        }, 700);

        return () => window.clearTimeout(timeout);
    }, [searchQuery, user]);

    const handleResetFilters = () => {
        setSelectedCategory("");
        setPrice("");
        setSearchQuery("");
        setSort("newest");
        setPage(1);
    };

    const handleAddToCart = async (productId: number) => {
        if (!user) {
            notify({
                tone: "warning",
                title: t("Login required"),
                message:
                    t("Please log in first to add products to your cart."),
            });
            return;
        }

        try {
            await addCartItem(productId, 1);
            await refreshCartCount();
            const product = products.find((item) => item.id === productId);
            notify({
                tone: "cart",
                title: t("Product added to cart"),
                message: product
                    ? `${product.name} ${t("was successfully added to your cart.")}`
                    : t("Product was successfully added to your cart."),
                durationMs: 3200,
            });
        } catch (error) {
            notify({
                tone: "error",
                title: t("Failed to add product"),
                message:
                    error instanceof Error
                        ? t(error.message)
                        : t("Failed to add product to cart."),
            });
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
                            <div className="mb-6 rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40">
                                <label
                                    htmlFor="product-search"
                                    className="mb-2 block text-sm font-bold text-gray-950"
                                >
                                    {t("Search Products")}
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                                    <input
                                        id="product-search"
                                        value={searchQuery}
                                        onChange={(event) => {
                                            setSearchQuery(event.target.value);
                                            setPage(1);
                                        }}
                                        placeholder={t("Search laptop, mouse, keyboard, SSD...")}
                                        className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

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

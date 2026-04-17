"use client";

import { useAuth } from "@/context/AuthContext";
import HeaderGuest from "@/app/components/header/HeaderGuest";
import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";

import { FilterPanel } from "./components/FilterPanel";
import { ProductGrid } from "./components/ProductGrid";

export default function ProductPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 🔥 HEADER DINAMIS */}
            {user ? <HeaderUser /> : <HeaderGuest />}

            {/* 🔥 CONTENT */}
            <div className="flex-1">
                <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Sidebar */}
                        <div className="lg:w-[250px] w-full">
                            <FilterPanel />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                            <ProductGrid />
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 FOOTER */}
            <Footer />
        </div>
    );
}

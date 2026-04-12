"use client";

import HeroSection from "./components/landing/HeroSection";
import WhyChooseUsSection from "./components/landing/WhyChooseUsSection";
import ProductCategoriesSection from "./components/landing/ProductCategoriesSection";
import FeaturedProductsSection from "./components/landing/FeaturedProductsSection";
import RecommendedProductsSection from "./components/landing/RecommendedProductsSection";
import HeaderGuest from "./components/header/HeaderGuest";
import Footer from "./components/footer/Footer";
import { useAuth } from "../context/AuthContext";
import HeaderUser from "./components/header/HeaderUser";

export default function Page() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            {user ? <HeaderUser /> : <HeaderGuest />}

            <HeroSection />
            <WhyChooseUsSection />
            <ProductCategoriesSection />
            <FeaturedProductsSection />
            <RecommendedProductsSection />
            <Footer />
        </div>
    );
}

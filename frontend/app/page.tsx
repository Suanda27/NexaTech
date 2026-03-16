import HeroSection from "./components/landing/HeroSection";
import WhyChooseUsSection from "./components/landing/WhyChooseUsSection";
import ProductCategoriesSection from "./components/landing/ProductCategoriesSection";
import FeaturedProductsSection from "./components/landing/FeaturedProductsSection";
import RecommendedProductsSection from "./components/landing/RecommendedProductsSection";
import HeaderGuest from "./components/header/HeaderGuest";

export default function Page() {
    return (
        <div className="min-h-screen bg-white">
            <HeaderGuest />

            <HeroSection />

            <WhyChooseUsSection />

            <ProductCategoriesSection />

            <FeaturedProductsSection />

            <RecommendedProductsSection />
        </div>
    );
}

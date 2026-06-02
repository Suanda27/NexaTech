"use client";

import { motion } from "framer-motion";
import HeroSection from "./components/landing/HeroSection";
import WhyChooseUsSection from "./components/landing/WhyChooseUsSection";
import ProductCategoriesSection from "./components/landing/ProductCategoriesSection";
import FeaturedProductsSection from "./components/landing/FeaturedProductsSection";
import RecommendedProductsSection from "./components/landing/RecommendedProductsSection";
import HeaderGuest from "./components/header/HeaderGuest";
import Footer from "./components/footer/Footer";
import { useAuth } from "../context/AuthContext";
import HeaderUser from "./components/header/HeaderUser";
import SectionReveal from "./components/landing/SectionReveal";

export default function Page() {
    const { user } = useAuth();

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.55),_rgba(255,255,255,1)_30%,_rgba(248,250,252,1)_100%)]"
        >
            <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute right-[-10rem] top-40 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(219,234,254,0.12)_30%,rgba(255,255,255,0)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
            </div>

            {user ? <HeaderUser /> : <HeaderGuest />}

            <div className="relative z-10">
                <HeroSection />
                <SectionReveal delay={0.05}>
                    <WhyChooseUsSection />
                </SectionReveal>
                <SectionReveal delay={0.08}>
                    <ProductCategoriesSection />
                </SectionReveal>
                <SectionReveal delay={0.1}>
                    <FeaturedProductsSection />
                </SectionReveal>
                <SectionReveal delay={0.12}>
                    <RecommendedProductsSection />
                </SectionReveal>
            </div>

            <Footer />
        </motion.div>
    );
}

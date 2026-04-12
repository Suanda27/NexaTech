"use client";

import Sidebar from "@/app/components/profile/Sidebar";
import OrderSummaryCards from "@/app/components/profile/OrderSummaryCards";
import OrderHistorySection from "@/app/components/profile/OrderHistorySection";
import PersonalInfo from "@/app/components/profile/PersonalInfo";

import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";

import { useState } from "react";

export default function Page() {
    const [active, setActive] = useState("orders");

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 🔥 HEADER PUNYA KAMU */}
            <HeaderUser />

            {/* CONTENT */}
            <div className="flex flex-1">
                <Sidebar active={active} setActive={setActive} />

                <div className="flex-1 p-6">
                    {active === "orders" && (
                        <>
                            <OrderSummaryCards />
                            <OrderHistorySection />
                        </>
                    )}

                    {active === "personal" && <PersonalInfo />}
                </div>
            </div>

            {/* 🔥 FOOTER PUNYA KAMU */}
            <Footer />
        </div>
    );
}

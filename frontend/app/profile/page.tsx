"use client";

import Sidebar from "@/app/components/profile/Sidebar";
import OrderSummaryCards from "@/app/components/profile/OrderSummaryCards";
import OrderHistorySection from "@/app/components/profile/OrderHistorySection";
import PersonalInfo from "@/app/components/profile/PersonalInfo";

import HeaderUser from "@/app/components/header/HeaderUser";
import Footer from "@/app/components/footer/Footer";
import AuthGuard from "@/app/components/auth/AuthGuard";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
    const searchParams = useSearchParams();
    const tab = searchParams?.get("tab");
    const [active, setActive] = useState(
        tab === "personal" ? "personal" : "orders",
    );

    useEffect(() => {
        setActive(tab === "personal" ? "personal" : "orders");
    }, [tab]);

    return (
        <AuthGuard loginPath="/customer/login">
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <HeaderUser />

                <div className="flex flex-1 flex-col lg:flex-row">
                    <Sidebar active={active} setActive={setActive} />

                    <div className="min-w-0 flex-1 p-4 sm:p-6">
                        {active === "orders" && (
                            <>
                                <OrderSummaryCards />
                                <OrderHistorySection />
                            </>
                        )}

                        {active === "personal" && <PersonalInfo />}
                    </div>
                </div>

                <Footer />
            </div>
        </AuthGuard>
    );
}

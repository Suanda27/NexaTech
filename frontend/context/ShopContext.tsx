"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchCartCount } from "@/lib/store";

type ShopContextType = {
    cartCount: number;
    refreshCartCount: () => Promise<number>;
    setCartCount: (count: number) => void;
};

const ShopContext = createContext<ShopContextType | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    const refreshCartCount = useCallback(async () => {
        if (!user || user.role !== "user") {
            setCartCount(0);
            return 0;
        }

        try {
            const response = await fetchCartCount();
            const nextCount = response.count ?? 0;
            setCartCount(nextCount);
            return nextCount;
        } catch {
            setCartCount(0);
            return 0;
        }
    }, [user]);

    useEffect(() => {
        void refreshCartCount();
    }, [refreshCartCount]);

    const value = useMemo(
        () => ({
            cartCount,
            refreshCartCount,
            setCartCount,
        }),
        [cartCount, refreshCartCount],
    );

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
    const context = useContext(ShopContext);

    if (!context) {
        throw new Error("ShopContext belum dipasang");
    }

    return context;
}

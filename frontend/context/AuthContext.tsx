"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    authFetch,
    clearStoredToken,
    getStoredToken,
    setStoredToken,
    type AuthUser,
} from "@/lib/auth";

type AuthContextType = {
    user: AuthUser | null;
    isLoading: boolean;
    setUser: (user: AuthUser | null) => void;
    refreshUser: (options?: { adminOnly?: boolean }) => Promise<AuthUser | null>;
    login: (token: string, nextUser?: AuthUser | null) => Promise<AuthUser | null>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(
        async ({
            adminOnly = false,
        }: {
            adminOnly?: boolean;
        } = {}): Promise<AuthUser | null> => {
            const token = getStoredToken();

            if (!token) {
                setUser(null);
                return null;
            }

            const endpoint = adminOnly ? "/api/admin/me" : "/api/auth/me";

            try {
                const res = await authFetch(endpoint, {}, token);

                if (!res.ok) {
                    throw new Error("Unauthenticated");
                }

                const data = (await res.json()) as AuthUser;
                setUser(data);
                return data;
            } catch {
                clearStoredToken();
                setUser(null);
                return null;
            }
        },
        [],
    );

    const login = useCallback(
        async (token: string, nextUser?: AuthUser | null) => {
            setStoredToken(token);

            if (nextUser) {
                setUser(nextUser);
                return nextUser;
            }

            return refreshUser();
        },
        [refreshUser],
    );

    const logout = useCallback(async () => {
        const token = getStoredToken();

        try {
            if (token) {
                await authFetch(
                    "/api/auth/logout",
                    {
                        method: "POST",
                    },
                    token,
                );
            }
        } catch {
            // Keep local logout deterministic even if API is unavailable.
        } finally {
            clearStoredToken();
            setUser(null);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const hydrateAuth = async () => {
            const token = getStoredToken();

            if (!token) {
                if (mounted) {
                    setUser(null);
                    setIsLoading(false);
                }
                return;
            }

            await refreshUser();

            if (mounted) {
                setIsLoading(false);
            }
        };

        void hydrateAuth();

        return () => {
            mounted = false;
        };
    }, [refreshUser]);

    const value = useMemo(
        () => ({
            user,
            isLoading,
            setUser,
            refreshUser,
            login,
            logout,
        }),
        [isLoading, login, logout, refreshUser, user],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("AuthContext belum dipasang");
    return context;
}

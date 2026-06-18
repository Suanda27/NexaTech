"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    startTransition,
    type ReactNode,
} from "react";
import {
    defaultLanguage,
    translateText,
    type Language,
} from "@/lib/translations";

type LanguageContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (value: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
    undefined,
);

function isLanguage(value: string | null): value is Language {
    return value === "id" || value === "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(defaultLanguage);

    useEffect(() => {
        const savedLanguage = window.localStorage.getItem("nexatech-language");

        if (isLanguage(savedLanguage) && savedLanguage !== defaultLanguage) {
            startTransition(() => {
                setLanguageState(savedLanguage);
            });
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
        window.localStorage.setItem("nexatech-language", language);
    }, [language]);

    const setLanguage = useCallback((nextLanguage: Language) => {
        setLanguageState(nextLanguage);
    }, []);

    const t = useCallback(
        (value: string) => translateText(value, language),
        [language],
    );

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t,
        }),
        [language, setLanguage, t],
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }

    return context;
}

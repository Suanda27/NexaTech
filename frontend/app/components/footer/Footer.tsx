"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="w-full border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                <div className="flex h-auto flex-col items-center justify-between gap-3 py-4 md:h-[70px] md:flex-row md:py-0 md:gap-0">
                    <div className="hidden md:block" />

                    <p className="text-center text-sm font-medium tracking-wide text-gray-800">
                        © {new Date().getFullYear()} {t("All rights reserved.")}
                    </p>

                    <div className="hidden items-center gap-6 text-sm text-gray-500 md:flex">
                        <a
                            href="#"
                            className="transition-colors hover:text-blue-600"
                        >
                            {t("Privacy")}
                        </a>
                        <a
                            href="#"
                            className="transition-colors hover:text-blue-600"
                        >
                            {t("Terms")}
                        </a>
                        <a
                            href="#"
                            className="transition-colors hover:text-blue-600"
                        >
                            {t("Contact")}
                        </a>
                    </div>
                </div>

                <div className="flex justify-center gap-6 pb-4 text-xs text-gray-500 md:hidden">
                    <a href="#" className="transition-colors hover:text-blue-600">
                        {t("Privacy")}
                    </a>
                    <a href="#" className="transition-colors hover:text-blue-600">
                        {t("Terms")}
                    </a>
                    <a href="#" className="transition-colors hover:text-blue-600">
                        {t("Contact")}
                    </a>
                </div>
            </div>
        </footer>
    );
}

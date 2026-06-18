"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { type Language } from "@/lib/translations";

const languageOptions: Array<{
    label: string;
    shortLabel: string;
    value: Language;
}> = [
    {
        label: "Indonesia",
        shortLabel: "ID",
        value: "id",
    },
    {
        label: "English",
        shortLabel: "ENG",
        value: "en",
    },
];

export default function LanguageToggle() {
    const { language, setLanguage, t } = useLanguage();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const activeLanguage =
        languageOptions.find((option) => option.value === language) ??
        languageOptions[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                event.target instanceof Node &&
                !containerRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-flex" ref={containerRef}>
            <button
                type="button"
                aria-label={`${t("Language")}: ${activeLanguage.label}`}
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((current) => !current)}
                title={activeLanguage.label}
                className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:h-10 sm:w-10"
            >
                <ChevronDown
                    className={`absolute bottom-1 right-1 h-3 w-3 rounded-full bg-white text-slate-500 transition-transform group-hover:text-blue-700 ${
                        open ? "rotate-180" : ""
                    }`}
                />
                <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-xl border border-blue-100 bg-white p-1.5 shadow-xl shadow-blue-100/70"
                >
                    {languageOptions.map((option) => {
                        const active = option.value === language;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setLanguage(option.value);
                                    setOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition ${
                                    active
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                            >
                                <span>{option.shortLabel}</span>
                                <span className="text-xs font-medium">
                                    {option.label}
                                </span>
                                {active && <Check className="h-4 w-4" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

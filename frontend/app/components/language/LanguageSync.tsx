"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translateText, type Language } from "@/lib/translations";

const translatedAttributes = ["aria-label", "placeholder", "title"];

function shouldSkipTextNode(node: Node) {
    const parent = node.parentElement;

    if (!parent) {
        return true;
    }

    return Boolean(
        parent.closest(
            "script, style, textarea, input, [data-skip-language-sync]",
        ),
    );
}

function translateTextContent(
    root: HTMLElement,
    language: Language,
    textSources: WeakMap<Text, string>,
) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach((node) => {
        if (shouldSkipTextNode(node)) {
            return;
        }

        const source = textSources.get(node) ?? node.data;
        textSources.set(node, source);

        const nextValue = translateText(source, language);

        if (node.data !== nextValue) {
            node.data = nextValue;
        }
    });
}

function translateAttributes(
    root: HTMLElement,
    language: Language,
    attributeSources: WeakMap<Element, Map<string, string>>,
) {
    const elements = root.querySelectorAll<HTMLElement>(
        translatedAttributes.map((attribute) => `[${attribute}]`).join(","),
    );

    elements.forEach((element) => {
        let sourceMap = attributeSources.get(element);

        if (!sourceMap) {
            sourceMap = new Map();
            attributeSources.set(element, sourceMap);
        }

        translatedAttributes.forEach((attribute) => {
            const currentValue = element.getAttribute(attribute);

            if (!currentValue) {
                return;
            }

            const source = sourceMap.get(attribute) ?? currentValue;
            sourceMap.set(attribute, source);

            const nextValue = translateText(source, language);

            if (currentValue !== nextValue) {
                element.setAttribute(attribute, nextValue);
            }
        });
    });
}

type LanguageSyncProps = {
    children: ReactNode;
};

export default function LanguageSync({ children }: LanguageSyncProps) {
    const { language } = useLanguage();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const textSources = useRef(new WeakMap<Text, string>());
    const attributeSources = useRef(new WeakMap<Element, Map<string, string>>());

    useEffect(() => {
        const root = containerRef.current;

        if (!root) {
            return;
        }

        const sync = () => {
            translateTextContent(root, language, textSources.current);
            translateAttributes(root, language, attributeSources.current);
        };

        sync();

        const observer = new MutationObserver(sync);

        observer.observe(root, {
            attributes: true,
            attributeFilter: translatedAttributes,
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, [language]);

    return <div ref={containerRef}>{children}</div>;
}

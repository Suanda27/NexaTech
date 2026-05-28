"use client";

import {
    BatteryCharging,
    Camera,
    Cpu,
    HardDrive,
    Headphones,
    Monitor,
    ShieldCheck,
    Zap,
    type LucideIcon,
} from "lucide-react";
import type {
    ProductSpec,
    ProductStatus,
    SpecIconKey,
} from "./types";

const SPEC_ICONS: Record<SpecIconKey, LucideIcon> = {
    display: Monitor,
    processor: Cpu,
    storage: HardDrive,
    performance: Zap,
    security: ShieldCheck,
    battery: BatteryCharging,
    audio: Headphones,
    camera: Camera,
};

const API_SPEC_ICON_ALIASES: Record<string, LucideIcon> = {
    connectivity: Zap,
    cpu: Cpu,
    keyboard: Monitor,
    memory: HardDrive,
    mouse: Monitor,
    power: Zap,
    refresh: Monitor,
    ruler: ShieldCheck,
    settings: ShieldCheck,
};

export const productStatusOptions: ProductStatus[] = [
    "Active",
    "Inactive",
    "Out of Stock",
];

export const specIconOptions: {
    value: SpecIconKey;
    label: string;
}[] = [
    { value: "display", label: "Display" },
    { value: "processor", label: "Processor" },
    { value: "storage", label: "Storage" },
    { value: "performance", label: "Performance" },
    { value: "security", label: "Security" },
    { value: "battery", label: "Battery" },
    { value: "audio", label: "Audio" },
    { value: "camera", label: "Camera" },
];

export function getSpecIcon(icon: string): LucideIcon {
    return (
        SPEC_ICONS[icon as SpecIconKey] ??
        API_SPEC_ICON_ALIASES[icon] ??
        Monitor
    );
}

export function formatPrice(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

function createId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `spec-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createSpec(
    label = "",
    value = "",
    icon: SpecIconKey = "display",
    description = "",
): ProductSpec {
    return {
        id: createId(),
        label,
        value,
        description,
        icon,
    };
}

export function createDefaultSpecs(): ProductSpec[] {
    return [
        createSpec("", "", "display"),
        createSpec("", "", "performance"),
        createSpec("", "", "storage"),
        createSpec("", "", "processor"),
    ];
}

export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }

            reject(new Error("Invalid file result"));
        };

        reader.onerror = () =>
            reject(reader.error ?? new Error("File read failed"));

        reader.readAsDataURL(file);
    });
}

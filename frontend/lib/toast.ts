"use client";

export type AppToastTone =
    | "success"
    | "error"
    | "info"
    | "warning"
    | "cart";

export type AppToastInput = {
    title: string;
    message?: string;
    tone?: AppToastTone;
    durationMs?: number;
};

const FLASH_TOAST_KEY = "nexatech.flash-toast";

function canUseStorage() {
    return typeof window !== "undefined";
}

export function queueFlashToast(toast: AppToastInput) {
    if (!canUseStorage()) {
        return;
    }

    window.sessionStorage.setItem(FLASH_TOAST_KEY, JSON.stringify(toast));
}

export function consumeFlashToast(): AppToastInput | null {
    if (!canUseStorage()) {
        return null;
    }

    const serialized = window.sessionStorage.getItem(FLASH_TOAST_KEY);

    if (!serialized) {
        return null;
    }

    window.sessionStorage.removeItem(FLASH_TOAST_KEY);

    try {
        return JSON.parse(serialized) as AppToastInput;
    } catch {
        return null;
    }
}

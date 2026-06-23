"use client";

import { fetchMidtransConfig } from "@/lib/store";

export type MidtransSnapResult = {
    order_id?: string;
    payment_type?: string;
    transaction_status?: string;
    status_code?: string;
};

type MidtransSnapCallbacks = {
    onSuccess?: (result: MidtransSnapResult) => void;
    onPending?: (result: MidtransSnapResult) => void;
    onError?: (result: MidtransSnapResult) => void;
    onClose?: () => void;
};

export type MidtransSnap = {
    pay: (token: string, callbacks: MidtransSnapCallbacks) => void;
};

declare global {
    interface Window {
        snap?: MidtransSnap;
        midtransSnapScriptPromise?: Promise<void>;
    }
}

export async function loadMidtransSnap() {
    if (typeof window === "undefined") {
        throw new Error("Popup pembayaran hanya bisa dibuka di browser.");
    }

    if (window.snap) {
        return;
    }

    if (window.midtransSnapScriptPromise) {
        return window.midtransSnapScriptPromise;
    }

    window.midtransSnapScriptPromise = fetchMidtransConfig().then(({ data }) => {
        if (!data.clientKey) {
            throw new Error("MIDTRANS_CLIENT_KEY belum dikonfigurasi.");
        }

        return new Promise<void>((resolve, reject) => {
            const existingScript = document.getElementById("midtrans-snap-script");

            if (existingScript) {
                existingScript.addEventListener("load", () => resolve(), {
                    once: true,
                });
                existingScript.addEventListener(
                    "error",
                    () => reject(new Error("Gagal memuat popup pembayaran Midtrans.")),
                    { once: true },
                );
                return;
            }

            const script = document.createElement("script");
            script.id = "midtrans-snap-script";
            script.src = data.snapUrl;
            script.async = true;
            script.dataset.clientKey = data.clientKey ?? undefined;
            script.onload = () => resolve();
            script.onerror = () =>
                reject(new Error("Gagal memuat popup pembayaran Midtrans."));
            document.body.appendChild(script);
        });
    });

    return window.midtransSnapScriptPromise;
}

"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
    AlertCircle,
    BellRing,
    CheckCircle2,
    ShoppingCart,
    TriangleAlert,
    X,
} from "lucide-react";
import { consumeFlashToast, type AppToastInput, type AppToastTone } from "@/lib/toast";

type ToastRecord = AppToastInput & {
    id: string;
    tone: AppToastTone;
    durationMs: number;
};

type ToastContextType = {
    notify: (toast: AppToastInput) => void;
    dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

function getToastId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getToastStyles(tone: AppToastTone) {
    switch (tone) {
        case "success":
            return {
                icon: CheckCircle2,
                shell: "border-emerald-200 bg-[linear-gradient(135deg,#ffffff_0%,#ecfdf5_55%,#d1fae5_100%)] shadow-emerald-200/60",
                badge: "bg-emerald-600 text-white",
                title: "text-emerald-950",
                body: "text-emerald-900/75",
                progress: "bg-emerald-500",
            };
        case "error":
            return {
                icon: AlertCircle,
                shell: "border-red-200 bg-[linear-gradient(135deg,#ffffff_0%,#fef2f2_55%,#fee2e2_100%)] shadow-red-200/60",
                badge: "bg-red-600 text-white",
                title: "text-red-950",
                body: "text-red-900/75",
                progress: "bg-red-500",
            };
        case "warning":
            return {
                icon: TriangleAlert,
                shell: "border-amber-200 bg-[linear-gradient(135deg,#ffffff_0%,#fffbeb_55%,#fde68a_100%)] shadow-amber-200/60",
                badge: "bg-amber-500 text-white",
                title: "text-amber-950",
                body: "text-amber-900/75",
                progress: "bg-amber-500",
            };
        case "cart":
            return {
                icon: CheckCircle2,
                shell: "border-blue-200 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_45%,#dbeafe_72%,#bfdbfe_100%)] shadow-blue-200/70",
                badge: "bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] text-white",
                title: "text-blue-950",
                body: "text-blue-900/80",
                progress: "bg-[linear-gradient(90deg,#60a5fa_0%,#2563eb_100%)]",
            };
        default:
            return {
                icon: BellRing,
                shell: "border-blue-200 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_55%,#dbeafe_100%)] shadow-blue-200/60",
                badge: "bg-blue-600 text-white",
                title: "text-blue-950",
                body: "text-blue-900/75",
                progress: "bg-blue-500",
            };
    }
}

function ToastCard({
    toast,
    onDismiss,
}: {
    toast: ToastRecord;
    onDismiss: (id: string) => void;
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);
    const styles = getToastStyles(toast.tone);
    const Icon = styles.icon;

    const handleDismiss = useCallback(() => {
        setIsVisible(false);
        window.setTimeout(() => onDismiss(toast.id), 180);
    }, [onDismiss, toast.id]);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setIsVisible(true);
            setProgress(0);
        });

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(handleDismiss, toast.durationMs);

        return () => {
            window.clearTimeout(timer);
        };
    }, [handleDismiss, toast.durationMs]);

    return (
        <div
            className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border p-4 shadow-[0_30px_60px_-36px_rgba(15,23,42,0.45)] backdrop-blur transition duration-200 ${
                styles.shell
            } ${
                isVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="relative">
                    {toast.tone === "cart" && (
                        <>
                            <div className="absolute inset-0 rounded-2xl bg-blue-400/35 blur-md" />
                            <div className="absolute inset-[-5px] rounded-[1.15rem] border border-blue-200/80" />
                        </>
                    )}
                    <div
                        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg ${styles.badge}`}
                    >
                        <Icon className="h-5 w-5" />
                        {toast.tone === "cart" && (
                            <ShoppingCart className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-white p-[2px] text-blue-600 shadow-sm" />
                        )}
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold ${styles.title}`}>
                        {toast.title}
                    </p>
                    {toast.message && (
                        <p className={`mt-1 text-sm leading-6 ${styles.body}`}>
                            {toast.message}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white/70 hover:text-slate-600"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/70">
                <div
                    className={`h-full rounded-full transition-[width] ease-linear ${styles.progress}`}
                    style={{
                        width: `${progress}%`,
                        transitionDuration: `${toast.durationMs}ms`,
                    }}
                />
            </div>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [toasts, setToasts] = useState<ToastRecord[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const notify = useCallback((toast: AppToastInput) => {
        setToasts((current) => [
            ...current,
            {
                id: getToastId(),
                tone: toast.tone ?? "info",
                durationMs: toast.durationMs ?? 4200,
                ...toast,
            },
        ]);
    }, []);

    useEffect(() => {
        const flashToast = consumeFlashToast();

        if (flashToast) {
            notify(flashToast);
        }
    }, [pathname, notify]);

    const value = useMemo(
        () => ({
            notify,
            dismiss,
        }),
        [dismiss, notify],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,24rem)] flex-col gap-3">
                {toasts.map((toast) => (
                    <ToastCard
                        key={toast.id}
                        toast={toast}
                        onDismiss={dismiss}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("ToastContext belum dipasang");
    }

    return context;
}

export type UserRole = "admin" | "user";

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    phone?: string | null;
    address?: string | null;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://localhost:8000";

const TOKEN_KEY = "nexatech_token";
let memoryToken: string | null = null;

function getAuthStorage(): Storage | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

export function apiUrl(path: string): string {
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getStoredToken(): string | null {
    const storage = getAuthStorage();

    if (!storage) {
        return memoryToken;
    }

    return storage.getItem(TOKEN_KEY) ?? memoryToken;
}

export function setStoredToken(token: string): void {
    memoryToken = token;
    getAuthStorage()?.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
    memoryToken = null;
    getAuthStorage()?.removeItem(TOKEN_KEY);
}

export async function authFetch(
    path: string,
    init: RequestInit = {},
    token?: string | null,
): Promise<Response> {
    const authToken = token ?? getStoredToken();
    const headers = new Headers(init.headers);

    if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
    }

    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    return fetch(apiUrl(path), {
        ...init,
        headers,
    });
}

export async function fetchJson<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const response = await authFetch(path, init);
    const data = (await response.json()) as T & {
        message?: string;
        errors?: Record<string, string[]>;
    };

    if (!response.ok) {
        throw new Error(
            data.message ??
                Object.values(data.errors ?? {})[0]?.[0] ??
                "Request gagal",
        );
    }

    return data;
}

export function buildRedirectPath(pathname: string, search?: string): string {
    return `${pathname}${search && search !== "?" ? search : ""}`;
}

export function resolveCustomerRedirect(
    redirect: string | null,
    role: UserRole,
): string {
    if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
        return role === "admin" ? "/admin" : "/";
    }

    if (redirect.startsWith("/admin") && role !== "admin") {
        return "/";
    }

    return redirect;
}

export function resolveAdminRedirect(redirect: string | null): string {
    if (!redirect || !redirect.startsWith("/admin") || redirect.startsWith("//")) {
        return "/admin";
    }

    return redirect;
}

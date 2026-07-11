"use client";

import { authFetch, fetchJson } from "@/lib/auth";
import type { OrderStatusKey, PaymentStatusKey } from "@/lib/order-status";

export type ApiCategory = {
    id: number;
    name: string;
    slug: string | null;
    description: string | null;
    imageUrl: string | null;
    status: "Active" | "Inactive";
    statusKey: "active" | "inactive";
    totalProducts: number;
};

export type ApiProductSpec = {
    id: string;
    label: string;
    value: string;
    description: string;
    icon: string;
};

export type ApiProduct = {
    id: number;
    sku: string;
    name: string;
    slug: string;
    categoryId: number | null;
    category: string;
    price: number;
    rating: number;
    description: string;
    stock: number;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    status: string;
    statusKey: string;
    imageUrl: string | null;
    specs?: ApiProductSpec[];
    gallery?: string[];
    relatedProducts?: ApiProduct[];
    recommendationReason?: string;
};

export type PaginatedProductsResponse = {
    data: ApiProduct[];
    meta: PaginationMeta;
};

export type PaginationMeta = {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
};

export type CartItem = {
    id: number;
    productId: number;
    name: string;
    price: number;
    qty: number;
    image: string | null;
    category?: string | null;
    stock: number;
};

export type CartResponse = {
    items: CartItem[];
    summary: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        itemCount: number;
    };
};

export type OrderData = {
    id: string;
    orderNumber: string;
    customerName: string;
    orderDate: string | null;
    paymentDeadline: string | null;
    paymentExpiresAt: string | null;
    paymentMethod: string;
    paymentMethodKey: "midtrans";
    paymentStatus: string;
    paymentStatusKey: PaymentStatusKey;
    midtransSnapToken: string | null;
    midtransRedirectUrl: string | null;
    midtransTransactionStatus: string | null;
    midtransPaymentType: string | null;
    status: string;
    statusKey: OrderStatusKey;
    declineReason: string | null;
    cancellationReason: string | null;
    customer: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        postalCode: string;
    };
    paymentDetail: {
        method: string;
        status: string;
    };
    summary: {
        subtotal: number;
        shippingFee: number;
        taxAmount: number;
        total: number;
    };
    items: Array<{
        id: string;
        productId: number | null;
        productName: string;
        productImage: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
};

export type MidtransConfigResponse = {
    data: {
        clientKey: string | null;
        isProduction: boolean;
        snapUrl: string;
    };
};

export type ProfileResponse = {
    data: {
        user: {
            id: number;
            name: string;
            email: string;
            phone?: string | null;
            address?: string | null;
            role: "admin" | "user";
        };
        summary: {
            totalOrders: number;
            progressingOrders: number;
            completedOrders: number;
            declinedOrders: number;
            cancelledOrders: number;
        };
    };
};

export type AdminDashboardResponse = {
    data: {
        stats: {
            totalRevenue: number;
            totalOrders: number;
            totalProducts: number;
            fulfillmentRate: number;
        };
        chart: Array<{
            label: string;
            revenue: number;
            orders: number;
        }>;
        topProducts: Array<{
            rank: number;
            name: string;
            imageUrl: string | null;
            soldUnits: number;
            revenue: number;
        }>;
    };
};

function queryString(params: Record<string, string | number | null | undefined>) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.set(key, String(value));
        }
    });

    const serialized = query.toString();
    return serialized ? `?${serialized}` : "";
}

async function sendJson<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    return fetchJson<T>(path, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
        },
    });
}

export function fetchCatalogCategories() {
    return fetchJson<{ data: ApiCategory[] }>("/api/categories");
}

export function fetchFeaturedProducts() {
    return fetchJson<{ data: ApiProduct[] }>("/api/products/featured");
}

export function fetchPublicRecommendations() {
    return fetchJson<{ data: ApiProduct[] }>("/api/products/recommendations");
}

export function fetchPersonalRecommendations() {
    return fetchJson<{ data: ApiProduct[] }>("/api/recommendations");
}

export function fetchProducts(params: {
    category?: string | null;
    price?: string | null;
    q?: string | null;
    sort?: string | null;
    page?: number;
    perPage?: number;
}) {
    return fetchJson<PaginatedProductsResponse>(
        `/api/products${queryString({
            category: params.category,
            price: params.price,
            q: params.q,
            sort: params.sort,
            page: params.page,
            per_page: params.perPage,
        })}`,
    );
}

export function trackProductSearch(keyword: string) {
    return sendJson<{ message: string }>("/api/product-searches", {
        method: "POST",
        body: JSON.stringify({ keyword }),
    });
}

export function fetchProductDetail(productId: string | number) {
    return fetchJson<{ data: ApiProduct }>(`/api/products/${productId}`);
}

export function fetchCart() {
    return fetchJson<CartResponse>("/api/cart");
}

export function fetchCartCount() {
    return fetchJson<{ count: number }>("/api/cart/count");
}

export function addCartItem(productId: number, quantity = 1) {
    return sendJson<CartResponse>("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({
            product_id: productId,
            quantity,
        }),
    });
}

export function updateCartItem(productId: number, quantity: number) {
    return sendJson<CartResponse>(`/api/cart/items/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
    });
}

export function removeCartItem(productId: number) {
    return sendJson<CartResponse>(`/api/cart/items/${productId}`, {
        method: "DELETE",
    });
}

export function clearCartItems() {
    return sendJson<CartResponse>("/api/cart/clear", {
        method: "DELETE",
    });
}

export function fetchProfile() {
    return fetchJson<ProfileResponse>("/api/profile");
}

export function fetchMidtransConfig() {
    return fetchJson<MidtransConfigResponse>("/api/payments/midtrans/config");
}

export function updateProfile(payload: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    password?: string;
    password_confirmation?: string;
}) {
    return sendJson<{
        message: string;
        data: {
            id: number;
            name: string;
            email: string;
            phone?: string | null;
            address?: string | null;
            role: "admin" | "user";
        };
    }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function fetchOrders() {
    return fetchJson<{ data: OrderData[] }>("/api/orders");
}

export function createOrder(payload: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    postal_code: string;
    payment_method: "midtrans";
    selected_product_ids?: number[];
}) {
    return sendJson<{ message: string; data: OrderData }>("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function completeOrder(orderId: string) {
    return sendJson<{ message: string; data: OrderData }>(
        `/api/orders/${orderId}/complete`,
        {
            method: "POST",
        },
    );
}

export function syncMidtransOrder(orderId: string) {
    return sendJson<{ message: string; data: OrderData }>(
        `/api/orders/${orderId}/sync-midtrans`,
        {
            method: "POST",
        },
    );
}

export function fetchAdminDashboard() {
    return fetchJson<AdminDashboardResponse>("/api/admin/dashboard", {
        cache: "no-store",
    });
}

export function fetchAdminCategories() {
    return fetchJson<{
        data: ApiCategory[];
        summary: {
            totalCategories: number;
            totalProducts: number;
            activeCategories: number;
            inactiveCategories: number;
        };
    }>("/api/admin/categories");
}

export function createAdminCategory(payload: {
    name: string;
    description?: string | null;
    image_url?: string | null;
    status: "active" | "inactive";
}) {
    return sendJson<{ message: string; data: ApiCategory }>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function updateAdminCategory(
    categoryId: number,
    payload: {
        name: string;
        description?: string | null;
        image_url?: string | null;
        status: "active" | "inactive";
    },
) {
    return sendJson<{ message: string; data: ApiCategory }>(
        `/api/admin/categories/${categoryId}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        },
    );
}

export async function deleteAdminCategory(categoryId: number) {
    const response = await authFetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
    });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
        throw new Error(data.message ?? "Gagal menghapus kategori");
    }

    return data;
}

export function createAdminProduct(payload: {
    category_id?: number | null;
    sku: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    status: "active" | "inactive" | "out_of_stock";
    rating: number;
    image_url?: string | null;
    specs: Array<{
        label: string;
        value: string;
        description?: string;
        icon: string;
    }>;
}) {
    return sendJson<{ message: string; data: ApiProduct }>("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function updateAdminProduct(
    productId: number,
    payload: {
        category_id?: number | null;
        sku: string;
        name: string;
        description: string;
        price: number;
        stock: number;
        status: "active" | "inactive" | "out_of_stock";
        rating: number;
        image_url?: string | null;
        specs: Array<{
            label: string;
            value: string;
            description?: string;
            icon: string;
        }>;
    },
) {
    return sendJson<{ message: string; data: ApiProduct }>(
        `/api/admin/products/${productId}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        },
    );
}

export async function deleteAdminProduct(productId: number) {
    const response = await authFetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
    });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
        throw new Error(data.message ?? "Gagal menghapus produk");
    }

    return data;
}

export function fetchAdminProducts(params?: {
    q?: string | null;
    category?: string | null;
    status?: string | null;
    page?: number;
    perPage?: number;
}) {
    return fetchJson<{
        data: ApiProduct[];
        summary: {
            totalProducts: number;
            totalInventoryValue: number;
            totalStock: number;
            activeProducts: number;
            lowStockProducts: number;
            outOfStockProducts: number;
        };
        meta: PaginationMeta;
    }>(
        `/api/admin/products${queryString({
            q: params?.q,
            category: params?.category,
            status: params?.status,
            page: params?.page,
            per_page: params?.perPage,
        })}`,
    );
}

export function fetchAdminOrders(params?: {
    q?: string | null;
    status?: string | null;
    paymentStatus?: string | null;
    page?: number;
    perPage?: number;
}) {
    return fetchJson<{
        data: OrderData[];
        summary: {
            activeOrders: number;
            totalOrders: number;
            completedOrders: number;
            progressingOrders: number;
            orderValue: number;
        };
        meta: PaginationMeta;
    }>(
        `/api/admin/orders${queryString({
            q: params?.q,
            status: params?.status,
            payment_status: params?.paymentStatus,
            page: params?.page,
            per_page: params?.perPage,
        })}`,
    );
}

export function fetchAdminOrderDetail(orderId: string) {
    return fetchJson<{ data: OrderData }>(`/api/admin/orders/${orderId}`);
}

export function updateAdminOrder(
    orderId: string,
    payload: {
        status?: "shipped";
    },
) {
    return sendJson<{ message: string; data: OrderData }>(
        `/api/admin/orders/${orderId}`,
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        },
    );
}

"use client";

import { authFetch, fetchJson } from "@/lib/auth";

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
    status: string;
    statusKey: string;
    imageUrl: string | null;
    specs?: ApiProductSpec[];
    gallery?: string[];
    relatedProducts?: ApiProduct[];
};

export type PaginatedProductsResponse = {
    data: ApiProduct[];
    meta: {
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
    };
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
    paymentMethod: string;
    paymentMethodKey: string;
    paymentStatus: string;
    paymentStatusKey: string;
    status: string;
    statusKey: string;
    declineReason: string | null;
    paymentProofImage: string | null;
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
            deliveredOrders: number;
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

export function fetchProducts(params: {
    category?: string | null;
    price?: string | null;
    sort?: string | null;
    page?: number;
    perPage?: number;
}) {
    return fetchJson<PaginatedProductsResponse>(
        `/api/products${queryString({
            category: params.category,
            price: params.price,
            sort: params.sort,
            page: params.page,
            per_page: params.perPage,
        })}`,
    );
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
    payment_method: "bank_transfer" | "cod";
    payment_proof?: string | null;
}) {
    return sendJson<{ message: string; data: OrderData }>("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function fetchAdminDashboard() {
    return fetchJson<AdminDashboardResponse>("/api/admin/dashboard");
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

export function fetchAdminProducts() {
    return fetchJson<{
        data: ApiProduct[];
        summary: {
            totalProducts: number;
            totalInventoryValue: number;
            totalStock: number;
            activeProducts: number;
        };
    }>("/api/admin/products");
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

export function fetchAdminOrders() {
    return fetchJson<{
        data: OrderData[];
        summary: {
            paidOrders: number;
            totalOrders: number;
            deliveredOrders: number;
            progressingOrders: number;
            orderValue: number;
        };
    }>("/api/admin/orders");
}

export function updateAdminOrder(
    orderId: string,
    payload: {
        status: "progressing" | "delivered" | "declined" | "cancelled";
        decline_reason?: string | null;
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

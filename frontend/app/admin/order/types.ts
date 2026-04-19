"use client";

export type OrderPaymentMethod = "Bank Transfer" | "COD";
export type OrderPaymentStatus = "Paid" | "Unpaid";
export type OrderStatus =
    | "Progressing"
    | "Delivered"
    | "Declined"
    | "Cancelled";

export type OrderItem = {
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
};

export type CustomerAddress = {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
};

export type OrderItemData = {
    id: string;
    orderNumber: string;
    customerName: string;
    orderDate: string;
    paymentMethod: OrderPaymentMethod;
    paymentStatus: OrderPaymentStatus;
    status: OrderStatus;
    declineReason: string | null;
    paymentProofImage: string | null;
    customer: CustomerAddress;
    items: OrderItem[];
};

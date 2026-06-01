"use client";

import type { OrderStatusKey, PaymentStatusKey } from "@/lib/order-status";

export type OrderPaymentMethod = "Bank Transfer" | "COD";
export type OrderPaymentStatus =
    | "Waiting Payment"
    | "Waiting Verification"
    | "Paid"
    | "Rejected"
    | "Expired"
    | "Unpaid";
export type OrderStatus =
    | "Pending"
    | "Processing"
    | "Delivered"
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
    paymentDeadline: string | null;
    paymentMethodKey: string;
    paymentMethod: OrderPaymentMethod;
    paymentStatusKey: PaymentStatusKey;
    paymentStatus: OrderPaymentStatus;
    statusKey: OrderStatusKey;
    status: OrderStatus;
    declineReason: string | null;
    paymentRejectionReason: string | null;
    cancellationReason: string | null;
    paymentProofImage: string | null;
    customer: CustomerAddress;
    items: OrderItem[];
};

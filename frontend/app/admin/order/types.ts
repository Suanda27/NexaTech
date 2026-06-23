"use client";

import type { OrderStatusKey, PaymentStatusKey } from "@/lib/order-status";

export type OrderPaymentMethod = "Midtrans";
export type OrderPaymentStatus =
    | "Waiting Payment"
    | "Processing"
    | "Shipped"
    | "Completed"
    | "Cancelled";
export type OrderStatus =
    | "Waiting Payment"
    | "Processing"
    | "Shipped"
    | "Completed"
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
    cancellationReason: string | null;
    customer: CustomerAddress;
    items: OrderItem[];
};

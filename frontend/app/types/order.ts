export type OrderStatus = "Waiting Payment" | "Processing" | "Shipped" | "Completed" | "Cancelled";

export interface OrderItem {
    name: string;
    image: string;
    qty: number;
    price: number;
}

export interface OrderType {
    id: string;
    status: OrderStatus;
    method: "midtrans";
    date: string;
    total: number;
    isProcessing: boolean;
    declineReason?: string;
    items: OrderItem[];
}

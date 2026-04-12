export type OrderStatus = "Processing" | "Delivered" | "Declined" | "Cancelled";

export interface OrderItem {
    name: string;
    image: string;
    qty: number;
    price: number;
}

export interface OrderType {
    id: string;
    status: OrderStatus;
    method: "bank" | "cod";
    date: string;
    total: number;
    isPaid: boolean;
    declineReason?: string;
    items: OrderItem[];
}

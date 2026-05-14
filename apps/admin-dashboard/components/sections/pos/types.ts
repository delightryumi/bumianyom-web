import { ReactNode } from "react";

export type POSCategory = "All" | "Food" | "Beverage" | "Meeting Room" | "Other";

export interface POSProduct {
    id: string;
    name: string;
    price: number;
    category: POSCategory;
    image: string;
    description?: string;
    stock?: number;
}

export interface CartItem extends POSProduct {
    quantity: number;
    cartItemId: string;
}

export interface POSOrder {
    id: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: "Cash" | "Card" | "Transfer";
    customerName?: string;
    timestamp: any;
    staffId: string;
    staffName: string;
}

export interface POSState {
    products: POSProduct[];
    cart: CartItem[];
    activeCategory: POSCategory;
    searchQuery: string;
    loading: boolean;
    isPaymentModalOpen: boolean;
}

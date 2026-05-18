"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductGrid } from "@/components/sections/pos/components/ProductGrid";
import { CartSidebar } from "@/components/sections/pos/components/CartSidebar";
import { POSProduct, POSCategory, CartItem } from "@/components/sections/pos/types";

const DUMMY_PRODUCTS: POSProduct[] = [
    { id: "p1", name: "Nasi Goreng Anyom", category: "Food", price: 125000, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=500&auto=format&fit=crop" },
    { id: "p2", name: "Wagyu Ribeye Sate", category: "Food", price: 285000, image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500&auto=format&fit=crop" },
    { id: "p3", name: "Nexura Golden Sunset Mocktail", category: "Beverage", price: 85000, image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=500&auto=format&fit=crop" },
    { id: "p4", name: "Premium Royal Black Tea", category: "Beverage", price: 65000, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=500&auto=format&fit=crop" },
    { id: "p5", name: "Executive Meeting Room A (4h)", category: "Meeting Room", price: 1500000, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=500&auto=format&fit=crop" },
    { id: "p6", name: "Grand Ballroom B (Half Day)", category: "Meeting Room", price: 5000000, image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=500&auto=format&fit=crop" },
    { id: "p7", name: "Truffle Mushroom Soup", category: "Food", price: 95000, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500&auto=format&fit=crop" },
    { id: "p8", name: "Artisan Matcha Latte", category: "Beverage", price: 75000, image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=500&auto=format&fit=crop" }
];

export default function POSPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<POSCategory>("All");
    const [customerName, setCustomerName] = useState("");
    const [tableName, setTableName] = useState("");
    const [notes, setNotes] = useState("");
    const [ticketNumber, setTicketNumber] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const activeTicket = localStorage.getItem("pos_active_ticket");
        if (activeTicket) {
            try {
                const parsed = JSON.parse(activeTicket);
                if (parsed.cart && parsed.cart.length > 0) {
                    setCart(parsed.cart);
                    if (parsed.customerName) setCustomerName(parsed.customerName);
                    if (parsed.tableName) setTableName(parsed.tableName);
                    if (parsed.notes) setNotes(parsed.notes);
                    if (parsed.ticketNumber) setTicketNumber(parsed.ticketNumber);
                } else {
                    setTicketNumber(`BUMI-${Date.now().toString().slice(-4)}`);
                }
            } catch (err) {
                console.error("Failed to parse active ticket:", err);
                setTicketNumber(`BUMI-${Date.now().toString().slice(-4)}`);
            }
        } else {
            setTicketNumber(`BUMI-${Date.now().toString().slice(-4)}`);
        }

        const handleSearch = (e: CustomEvent) => {
            setSearchQuery(e.detail);
        };
        window.addEventListener('pos-search', handleSearch as EventListener);
        return () => window.removeEventListener('pos-search', handleSearch as EventListener);
    }, []);

    const filteredProducts = DUMMY_PRODUCTS.filter(p => {
        const matchesCat = activeCategory === "All" || p.category === activeCategory;
        const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const addToCart = (product: POSProduct) => {
        setCart(prev => {
            const existing = prev.find(item => item.cartItemId === product.id);
            if (existing) {
                return prev.map(item => 
                    item.cartItemId === product.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }
            return [...prev, {
                id: product.id,
                cartItemId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image || "",
                category: product.category
            }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.cartItemId === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const clearCart = () => {
        setCart([]);
        setCustomerName("");
        setTableName("");
        setNotes("");
        setTicketNumber(`BUMI-${Date.now().toString().slice(-4)}`);
        localStorage.removeItem("pos_active_ticket");
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    const handleCheckoutNavigation = () => {
        if (cart.length === 0) return;
        const ticketData = {
            cart,
            customerName,
            tableName,
            notes,
            ticketNumber: ticketNumber || `BUMI-${Date.now().toString().slice(-4)}`,
            subtotal,
            tax,
            total
        };
        localStorage.setItem("pos_active_ticket", JSON.stringify(ticketData));
        router.push("/pos/checkout");
    };

    return (
        <div key="pos-page-wrapper-v8" className="flex-1 flex flex-col lg:flex-row w-full h-full overflow-y-auto lg:overflow-hidden min-w-0 min-h-0 gap-6 pb-20 lg:pb-0">
            {/* Section 2: Product Grid (Menu Catalog Island) */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-[500px] lg:min-h-0 bg-white rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border-none flex-shrink-0 lg:flex-shrink">
                <ProductGrid 
                    products={filteredProducts}
                    loading={false}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    addToCart={addToCart}
                />
            </div>

            {/* Section 3: Cashier Review / Active Ticket Island (Spacious & Luxurious) */}
            <div className="w-full flex flex-col overflow-hidden flex-shrink-0 z-[110] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-[#e0e0e0]/60 min-h-[500px] lg:min-h-0 my-2 lg:my-0 mr-2 lg:mr-4" style={{ maxWidth: '460px' }}>
                <CartSidebar 
                    cart={cart}
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    tableName={tableName}
                    setTableName={setTableName}
                    notes={notes}
                    setNotes={setNotes}
                    ticketNumber={ticketNumber || "BUMI-2026"}
                    clearCart={clearCart}
                    updateQuantity={updateQuantity}
                    subtotal={subtotal}
                    tax={tax}
                    total={total}
                    onCheckout={handleCheckoutNavigation}
                />
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    ShoppingCart, Trash2, CreditCard, 
    ArrowRight, Minus, Plus, Clock, User 
} from "lucide-react";
import { formatIDR } from "@/lib/pnl-utils";
import { CartItem } from "../types";

interface CartSidebarProps {
    cart: CartItem[];
    customerName: string;
    setCustomerName: (name: string) => void;
    clearCart: () => void;
    updateQuantity: (id: string, delta: number) => void;
    subtotal: number;
    tax: number;
    total: number;
    onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
    cart, customerName, setCustomerName,
    clearCart, updateQuantity, subtotal,
    tax, total, onCheckout
}) => (
    <aside className="w-full lg:w-[450px] flex flex-col bg-white border-l border-stone-100 shadow-[0_0_60px_rgba(0,0,0,0.02)] z-[110]">
        <div className="p-6 lg:p-10 border-b border-stone-100 bg-[#FBFBFA]/50">
            <div className="flex items-center justify-between mb-6 lg:mb-10">
                <div className="flex flex-col">
                    <h3 className="text-xl lg:text-2xl font-medium text-stone-900 tracking-tighter flex items-center gap-2 uppercase leading-none">
                        Current <span className="text-sage" style={{ color: "#788069" }}>Cart</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <Clock size={10} className="text-stone-300" />
                        <span className="text-[9px] font-medium text-stone-400 uppercase tracking-[0.2em] leading-none">Order #BUMI-{(Date.now()).toString().slice(-4)}</span>
                    </div>
                </div>
                <button 
                    onClick={clearCart}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                    title="Clear Cart"
                >
                    <Trash2 size={18} />
                </button>
            </div>
            
            <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-sage transition-colors" size={16} />
                <input 
                    type="text"
                    placeholder="Assign Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-14 lg:h-16 pl-14 pr-6 bg-white border border-stone-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sage/5 focus:border-sage transition-all placeholder:text-stone-300 shadow-sm"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-4 lg:space-y-6 custom-scrollbar bg-white min-h-[300px]">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 lg:space-y-8 py-10">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-200 border border-stone-100/50 shadow-inner">
                        <ShoppingCart size={32} strokeWidth={1} />
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-stone-900 uppercase tracking-[0.3em]">Cart is empty</p>
                        <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest max-w-[200px] leading-relaxed">Select products from the grid to begin a new transaction</p>
                    </div>
                </div>
            ) : (
                <AnimatePresence initial={false}>
                    {cart.map((item) => (
                        <motion.div 
                            key={item.cartItemId}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            className="flex items-center gap-4 lg:gap-5 group p-4 lg:p-5 rounded-xl border border-stone-50 hover:border-stone-100 hover:bg-stone-50/50 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-white border border-stone-100 overflow-hidden flex-shrink-0 shadow-sm">
                                <img src={item.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className="text-[12px] lg:text-[13px] font-medium text-stone-900 truncate uppercase tracking-tight">{item.name}</h5>
                                <p className="text-[10px] lg:text-[11px] font-medium text-sage mt-1" style={{ color: "#788069" }}>{formatIDR(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2 lg:gap-4 bg-white rounded-xl p-1 lg:p-1.5 border border-stone-100 shadow-sm">
                                <button 
                                    onClick={() => updateQuantity(item.cartItemId, -1)}
                                    className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center hover:bg-stone-50 text-stone-400 hover:text-red-500 transition-all"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="text-[12px] lg:text-[13px] font-medium text-stone-900 w-5 lg:w-6 text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.cartItemId, 1)}
                                    className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center hover:bg-stone-50 text-stone-400 hover:text-sage transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>

        <div className="p-6 lg:p-10 bg-[#FBFBFA] border-t border-stone-100 space-y-6 lg:space-y-8 pb-10 lg:pb-10">
            <div className="space-y-3 lg:space-y-4">
                <div className="flex justify-between text-[9px] lg:text-[10px] font-medium text-stone-400 uppercase tracking-[0.25em]">
                    <span>Gross Amount</span>
                    <span>{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[9px] lg:text-[10px] font-medium text-stone-400 uppercase tracking-[0.25em]">
                    <span>Service Tax (10%)</span>
                    <span>{formatIDR(tax)}</span>
                </div>
                <div className="h-px bg-stone-200/50 w-full" />
                <div className="flex justify-between items-end">
                    <span className="text-[10px] lg:text-xs font-medium text-stone-900 uppercase tracking-[0.3em]">Total Payable</span>
                    <span className="text-2xl lg:text-4xl font-medium text-sage tracking-tighter leading-none" style={{ color: "#788069" }}>{formatIDR(total)}</span>
                </div>
            </div>

            <button 
                disabled={cart.length === 0}
                onClick={onCheckout}
                className="w-full h-16 lg:h-20 rounded-xl bg-stone-900 text-white text-[10px] lg:text-[11px] font-medium uppercase tracking-[0.25em] shadow-2xl shadow-stone-900/30 flex items-center justify-center gap-3 lg:gap-5 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none"
            >
                <CreditCard size={18} />
                Process Checkout
                <ArrowRight size={18} />
            </button>
        </div>
    </aside>
);

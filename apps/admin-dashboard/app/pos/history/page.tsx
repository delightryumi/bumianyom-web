"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    Search, Filter, Download, 
    ChevronRight, Eye, Printer,
    Calendar, Clock, CreditCard, Banknote, Send
} from "lucide-react";
import { 
    collection, query, orderBy, 
    onSnapshot, limit 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { POSOrder } from "../types";
import { formatIDR } from "@/lib/pnl-utils";

export default function SaleHistoryPage() {
    const [orders, setOrders] = useState<POSOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"History" | "Today">("History");

    useEffect(() => {
        const q = query(collection(db, "pos_orders"), orderBy("timestamp", "desc"), limit(50));
        const unsub = onSnapshot(q, (snap) => {
            const list: POSOrder[] = [];
            snap.forEach(d => list.push({ id: d.id, ...d.data() } as POSOrder));
            setOrders(list);
            setLoading(false);
        });
        return unsub;
    }, []);

    const filteredOrders = orders.filter(o => 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getMethodIcon = (method: string) => {
        switch(method) {
            case 'Cash': return <Banknote size={14} />;
            case 'Card': return <CreditCard size={14} />;
            default: return <Send size={14} />;
        }
    };

    return (
        <div className="h-full flex flex-col p-8 gap-8 overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase mb-2">
                        Sale <span className="text-sage" style={{ color: "#788069" }}>History</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-sage" style={{ backgroundColor: "#788069" }} />
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Archive Management</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-sage transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="Search Order ID or Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-6 bg-white border border-stone-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-sage shadow-sm transition-all min-w-[320px]"
                        />
                    </div>
                    <button className="h-12 w-12 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 shadow-sm transition-all">
                        <Filter size={18} />
                    </button>
                    <button className="h-12 px-6 rounded-2xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </header>

            <div className="flex-1 bg-white border border-stone-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
                <nav className="flex items-center border-b border-stone-100 px-8">
                    {["History", "Today"].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`h-16 px-8 text-[10px] font-black uppercase tracking-widest relative transition-all ${
                                activeTab === tab ? "text-sage" : "text-stone-300 hover:text-stone-500"
                            }`}
                            style={activeTab === tab ? { color: "#788069" } : {}}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="history-tab"
                                    className="absolute bottom-0 left-8 right-8 h-1 bg-sage rounded-t-full"
                                    style={{ backgroundColor: "#788069" }}
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white z-10">
                            <tr className="border-b border-stone-50">
                                <th className="py-6 px-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Order ID</th>
                                <th className="py-6 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Date / Time</th>
                                <th className="py-6 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Customer</th>
                                <th className="py-6 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Method</th>
                                <th className="py-6 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="py-6 px-8 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="py-8 px-8"><div className="h-4 bg-stone-50 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="group hover:bg-stone-50/50 transition-all">
                                    <td className="py-5 px-8">
                                        <span className="text-[11px] font-black text-stone-900 uppercase tracking-tighter">#{order.id.slice(-8)}</span>
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-bold text-stone-700">{new Date(order.timestamp?.seconds * 1000).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-medium text-stone-400">{new Date(order.timestamp?.seconds * 1000).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <span className="text-[12px] font-bold text-stone-600">{order.customerName || 'Walk-in Guest'}</span>
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 w-fit">
                                            {getMethodIcon(order.paymentMethod)}
                                            <span className="text-[9px] font-black uppercase tracking-widest">{order.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 text-right">
                                        <span className="text-[13px] font-black text-sage" style={{ color: "#788069" }}>{formatIDR(order.total)}</span>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="w-8 h-8 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-sage hover:border-sage/20 transition-all">
                                                <Eye size={14} />
                                            </button>
                                            <button className="w-8 h-8 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-200 transition-all">
                                                <Printer size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

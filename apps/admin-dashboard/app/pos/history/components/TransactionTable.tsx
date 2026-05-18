"use client";

import React from "react";
import { Search, Eye, Printer, Banknote, CreditCard, Send } from "lucide-react";
import { POSOrder } from "../../types";
import { formatIDR } from "@/lib/pnl-utils";

interface TransactionTableProps {
    orders: POSOrder[];
    loading: boolean;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    activeTab: "Semua" | "Cash" | "Card" | "Transfer";
    setActiveTab: (tab: "Semua" | "Cash" | "Card" | "Transfer") => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
    orders, loading, searchQuery, setSearchQuery, activeTab, setActiveTab
}) => {
    // Filter logic
    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              o.tableName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "Semua" || o.paymentMethod === activeTab;
        return matchesSearch && matchesTab;
    });

    const getMethodIcon = (method: string) => {
        switch(method) {
            case 'Cash': return <Banknote size={16} className="text-emerald-600" />;
            case 'Card': return <CreditCard size={16} className="text-blue-600" />;
            default: return <Send size={16} className="text-purple-600" />;
        }
    };

    return (
        <div className="flex-1 bg-white rounded-[8px] shadow-sm border border-[#e0e0e0] flex flex-col overflow-hidden min-h-0">
            {/* Filter & Tab Bar */}
            <div className="p-4 md:p-6 border-b border-[#e0e0e0] flex flex-wrap items-center justify-between gap-4 bg-white flex-shrink-0">
                <div className="flex items-center gap-2 overflow-x-auto pos-no-scrollbar py-1 w-full md:w-auto">
                    {(["Semua", "Cash", "Card", "Transfer"] as const).map((tab) => {
                        const isSelected = activeTab === tab;
                        return (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`min-w-[80px] h-9 rounded-[6px] font-semibold text-xs transition-all flex items-center justify-center px-4 cursor-pointer flex-shrink-0 ${isSelected
                                    ? "bg-white text-[#1d1d1f] shadow-sm border border-[#d1d5db]"
                                    : "text-[#4b5563] hover:text-[#1d1d1f] border border-transparent bg-[#f4f5f8]"
                                    }`}
                            >
                                {tab === "Semua" ? "All" : tab}
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full md:w-80 group bg-white border border-[#e0e0e0] shadow-sm flex items-center h-10 rounded-[6px] focus-within:border-[#0066cc] focus-within:ring-1 focus-within:ring-[#0066cc] transition-all overflow-hidden">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#7a7a7a] z-10">
                        <Search size={16} strokeWidth={2.5} />
                    </div>
                    <input 
                        type="text"
                        placeholder="Search Folio, Guest, Table..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-full bg-transparent pl-11 pr-4 text-sm text-[#1d1d1f] focus:outline-none placeholder:text-[#a0a0b0]"
                    />
                </div>
            </div>

            {/* Tabel Transaksi Kasir */}
            <div className="flex-1 overflow-auto bg-white checkout-scrollbar">
                <div className="min-w-[800px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#fafafc] z-10 border-b border-[#e0e0e0]">
                            <tr>
                                <th className="py-3 px-6 text-[10px] text-[#7a7a7a] font-bold uppercase tracking-wider">Folio No.</th>
                                <th className="py-3 px-4 text-[10px] text-[#7a7a7a] font-bold uppercase tracking-wider">Date / Time</th>
                                <th className="py-3 px-4 text-[10px] text-[#7a7a7a] font-bold uppercase tracking-wider">Guest / Detail</th>
                                <th className="py-3 px-4 text-[10px] text-[#7a7a7a] font-bold uppercase tracking-wider">Payment</th>
                                <th className="py-3 px-4 text-[10px] text-[#7a7a7a] font-bold uppercase tracking-wider text-right">Total</th>
                                <th className="py-3 px-6 text-[10px] text-[#7a7a7a] font-bold uppercase tracking-wider text-center">Action</th>
                            </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f4]">
                        {loading ? (
                            [1,2,3,4,5].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="py-6 px-6"><div className="h-4 bg-[#f0f0f4] rounded w-full"></div></td>
                                </tr>
                            ))
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-[#7a7a7a] text-sm">
                                    No active sessions or transactions found.
                                </td>
                            </tr>
                        ) : filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-[#f4f5f8] transition-colors text-sm">
                                <td className="py-3 px-6 font-semibold text-[#1d1d1f]">
                                    #{order.id.slice(-8).toUpperCase()}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[#121214]">
                                            {order.timestamp?.seconds ? new Date(order.timestamp.seconds * 1000).toLocaleDateString() : 'Hari ini'}
                                        </span>
                                        <span className="apple-fine-print text-[#7a7a7a]">
                                            {order.timestamp?.seconds ? new Date(order.timestamp.seconds * 1000).toLocaleTimeString() : ''}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[#121214]">{order.customerName || 'Tamu Umum (Walk-in)'}</span>
                                        {order.tableName && (
                                        <span className="text-xs text-[#7a7a7a]">Table / Room: {order.tableName}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#f4f5f8] border border-[#e0e0e0] text-[#1d1d1f] w-fit font-semibold text-xs">
                                        {getMethodIcon(order.paymentMethod)}
                                        <span>{order.paymentMethod}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-[#1d1d1f]">
                                    {formatIDR(order.total)}
                                </td>
                                <td className="py-3 px-6">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => alert(`Menampilkan detail transaksi #${order.id}`)}
                                            className="apple-button-pearl w-9 h-9 flex items-center justify-center p-0 text-[#7a7a7a] hover:text-[#0F0F12] hover:border-[#D4AF37]"
                                            title="Lihat Detail"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => alert(`Mencetak ulang nota pesanan #${order.id}`)}
                                            className="apple-button-pearl w-9 h-9 flex items-center justify-center p-0 text-[#7a7a7a] hover:text-[#0F0F12] hover:border-[#D4AF37]"
                                            title="Cetak Nota"
                                        >
                                            <Printer size={16} />
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
};

"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Lock, Coins, Banknote, CreditCard, Wallet } from "lucide-react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { POSOrder } from "../types";
import { formatIDR } from "@/lib/pnl-utils";

// Modular Components
import { StatCard } from "./components/StatCard";
import { CashActionModal } from "./components/CashActionModal";
import { CloseRegisterModal } from "./components/CloseRegisterModal";
import { TransactionTable } from "./components/TransactionTable";

export default function CashierRegisterPage() {
    const [orders, setOrders] = useState<POSOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"Semua" | "Cash" | "Card" | "Transfer">("Semua");
    
    // Cash Management Modal States
    const [isCashModalOpen, setIsCashModalOpen] = useState(false);
    const [cashActionType, setCashActionType] = useState<"setor" | "ambil">("setor");
    const [cashAmount, setCashAmount] = useState("");
    const [cashNote, setCashNote] = useState("");
    
    // Close Session Modal State
    const [isCloseSessionOpen, setIsCloseSessionOpen] = useState(false);
    const [actualCashFloat, setActualCashFloat] = useState("");

    // Simulated Cash Float & Management State
    const [initialFloat] = useState(500000);
    const [cashIn, setCashIn] = useState(150000);
    const [cashOut, setCashOut] = useState(5000);

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

    // Calculate Statistics
    const cashOrders = orders.filter(o => o.paymentMethod === "Cash");
    const nonCashOrders = orders.filter(o => o.paymentMethod !== "Cash");
    
    const cashSales = cashOrders.reduce((sum, o) => sum + o.total, 0);
    const nonCashSales = nonCashOrders.reduce((sum, o) => sum + o.total, 0);
    const expectedCashDrawer = initialFloat + cashSales + cashIn - cashOut;

    const handleCashActionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(cashAmount);
        if (isNaN(amt) || amt <= 0) return;

        if (cashActionType === "setor") {
            setCashIn(prev => prev + amt);
        } else {
            setCashOut(prev => prev + amt);
        }

        setCashAmount("");
        setCashNote("");
        setIsCashModalOpen(false);
    };

    const handleCloseSessionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Sesi Kasir Berhasil Ditutup!\nTotal Kas Fisik Dihitung: ${formatIDR(parseFloat(actualCashFloat) || 0)}\nSelisih: ${formatIDR((parseFloat(actualCashFloat) || 0) - expectedCashDrawer)}`);
        setIsCloseSessionOpen(false);
    };

    return (
        <div className="flex-1 w-full h-full overflow-y-auto checkout-scrollbar">
            <div className="flex flex-col w-full min-w-0 min-h-0 max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-8 gap-8 md:gap-12 font-sans text-[#1d1d1f]">
                {/* 1. Action Buttons (Presisi Ukuran Sama & Geser Kiri Bawah) */}
                <div className="flex items-center justify-end gap-4 flex-shrink-0 w-full pt-10 pr-10 lg:pr-20">
                    <button 
                        onClick={() => setIsCashModalOpen(true)}
                        className="w-44 h-11 rounded-[6px] bg-white hover:bg-[#fafafc] text-[#1d1d1f] border border-[#e0e0e0] shadow-sm text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer flex-shrink-0"
                    >
                        <PlusCircle size={16} />
                        <span>Cash In / Out</span>
                    </button>
                    <button 
                        onClick={() => setIsCloseSessionOpen(true)}
                        className="w-44 h-11 rounded-[6px] bg-[#0066cc] hover:bg-[#0071e3] text-white border border-transparent text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer flex-shrink-0"
                    >
                        <Lock size={16} />
                        <span>Close Register</span>
                    </button>
                </div>

                {/* 2. Grid Statistik Sesi Kasir (Cashier Session Float & Sales Stats) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-shrink-0">
                    <StatCard 
                        title="Opening Float" 
                        value={formatIDR(initialFloat)} 
                        icon={<Coins size={20} />} 
                        desc="Initial cash drawer balance" 
                        accent="#6366f1"
                    />
                    <StatCard 
                        title="Cash Sales" 
                        value={formatIDR(cashSales)} 
                        icon={<Banknote size={20} />} 
                        desc={`${cashOrders.length} cash transactions`} 
                        accent="#10b981"
                    />
                    <StatCard 
                        title="Card & Transfer" 
                        value={formatIDR(nonCashSales)} 
                        icon={<CreditCard size={20} />} 
                        desc={`${nonCashOrders.length} non-cash transactions`} 
                        accent="#3b82f6"
                    />
                    <StatCard 
                        title="Expected Drawer" 
                        value={formatIDR(expectedCashDrawer)} 
                        icon={<Wallet size={20} />} 
                        desc="Current physical balance" 
                        highlight 
                    />
                </div>

                {/* 3. Island Tabel Riwayat Transaksi Sesi Aktif */}
                <TransactionTable 
                    orders={orders}
                    loading={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* 4. Modal Setor / Ambil Kas (Cash In / Out) */}
                <CashActionModal 
                    isOpen={isCashModalOpen}
                    onClose={() => setIsCashModalOpen(false)}
                    onSubmit={handleCashActionSubmit}
                    cashActionType={cashActionType}
                    setCashActionType={setCashActionType}
                    cashAmount={cashAmount}
                    setCashAmount={setCashAmount}
                    cashNote={cashNote}
                    setCashNote={setCashNote}
                />

                {/* 5. Modal Tutup Sesi Kasir (Close Register) */}
                <CloseRegisterModal 
                    isOpen={isCloseSessionOpen}
                    onClose={() => setIsCloseSessionOpen(false)}
                    onSubmit={handleCloseSessionSubmit}
                    initialFloat={initialFloat}
                    cashSales={cashSales}
                    cashIn={cashIn}
                    cashOut={cashOut}
                    expectedCashDrawer={expectedCashDrawer}
                    actualCashFloat={actualCashFloat}
                    setActualCashFloat={setActualCashFloat}
                />
            </div>
        </div>
    );
}

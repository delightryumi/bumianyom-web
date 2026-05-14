"use client";

import React, { Suspense } from "react";
import {
    Home,
    Coffee,
    ArrowLeft,
    Sparkles,
    Receipt,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Modular Imports
import "./TransactionFormStyles.css";
import { useTransactionForm } from "./useTransactionForm";
import { 
    SectionTitle, 
    ChannelSelect, 
    NexuraInput, 
    TypeCard 
} from "./TransactionComponents";

function AddTransactionContent() {
    const {
        form,
        roomTypes,
        saving,
        step,
        revenueType,
        balance,
        setStep,
        setRevenueType,
        updateForm,
        handleSubmit
    } = useTransactionForm();

    const formatCurrency = (val: string | number) => {
        const num = Number(val) || 0;
        return new Intl.NumberFormat('id-ID').format(Math.floor(num));
    };

    return (
        <div className="bg-transparent pb-32 font-sans selection:bg-sage/20">
            <main className="max-w-[1400px] mx-auto pt-16 px-10">
                <AnimatePresence mode="wait">
                    {step === "type" ? (
                        <motion.div 
                            key="selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh]"
                        >
                            <header className="mb-20 text-center">
                                <div className="flex items-center justify-center gap-3 text-sage mb-6">
                                    <div className="w-8 h-[1px] bg-sage/30" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Initialization</span>
                                    <div className="w-8 h-[1px] bg-sage/30" />
                                </div>
                                <h1 className="text-5xl font-light text-stone-900 tracking-tight font-outfit uppercase">
                                    Select <span className="font-semibold text-sage">Category</span>
                                </h1>
                                <p className="text-[11px] text-stone-400 font-normal uppercase tracking-[0.3em] mt-6 max-w-md mx-auto">Identify the revenue stream to begin synchronization</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                                <TypeCard 
                                    label="Room Revenue"
                                    description="Standard stay, extensions, and daily residency."
                                    icon={<Home size={28} />}
                                    onClick={() => { setRevenueType("room"); setStep("form"); }}
                                />
                                <TypeCard 
                                    label="Other Income"
                                    description="F&B, laundry, spa, and outlet sales."
                                    icon={<Coffee size={28} />}
                                    onClick={() => { setRevenueType("other"); setStep("form"); }}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="flex flex-col xl:flex-row gap-16"
                        >
                            {/* Review Summary Column */}
                            <div className="w-full xl:w-[480px] order-2">
                                <div className="sticky top-12 space-y-8">
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-light text-stone-900 tracking-tight font-outfit uppercase">
                                            Review <span className="font-semibold text-sage">{revenueType === 'room' ? 'Transaksi' : 'Income'}</span>
                                        </h2>
                                        <div className="bg-white border border-stone-200 rounded-none shadow-sm overflow-hidden paper-texture">
                                            <div className="p-12 border-b border-stone-100 bg-stone-50/30">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1.5">
                                                        <h3 className="text-2xl font-bold text-stone-900 font-outfit uppercase tracking-wider">Bumi Anyom</h3>
                                                        <p className="text-[12px] font-bold text-stone-400 uppercase tracking-widest">Resort & Sanctuary</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[11px] font-bold text-stone-300 uppercase tracking-widest">Issued Date</p>
                                                        <p className="text-[13px] font-bold text-stone-900 uppercase font-mono-jb">{form.checkIn}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-12 space-y-16">
                                                {revenueType === 'room' ? (
                                                    <div className="space-y-10">
                                                        <div className="grid grid-cols-2 gap-10">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Guest Name</p>
                                                                <p className="text-[14px] font-bold text-stone-800 uppercase font-outfit truncate">{form.guestName || "---"}</p>
                                                            </div>
                                                            <div className="space-y-2 text-right">
                                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Booking Channel</p>
                                                                <p className="text-[14px] font-bold text-stone-800 uppercase font-outfit">{form.channel}</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-10 pt-8 border-t border-stone-50">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Stay Period</p>
                                                                <p className="text-[13px] font-bold text-stone-600 uppercase font-mono-jb whitespace-nowrap">
                                                                    {form.checkIn || "---"} <span className="text-stone-300 mx-1">/</span> {form.checkOut || "---"}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-2 text-right">
                                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Room Info</p>
                                                                <p className="text-[13px] font-bold text-stone-600 uppercase font-outfit">
                                                                    {roomTypes.find(r => r.id === form.roomTypeId)?.name || "---"} {form.roomNumber ? `(RM ${form.roomNumber})` : ""}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="pt-8 border-t border-stone-50">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Internal Note</p>
                                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">By: {form.staffName || "---"}</p>
                                                            </div>
                                                            <p className="text-[13px] text-stone-500 leading-relaxed italic font-outfit">
                                                                {form.note || "No additional notes provided."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-10">
                                                        <div className="grid grid-cols-2 gap-10">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Category</p>
                                                                <p className="text-[14px] font-bold text-stone-800 uppercase font-outfit truncate">{form.incomeType || "---"}</p>
                                                            </div>
                                                            <div className="space-y-2 text-right">
                                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Inputted By</p>
                                                                <p className="text-[14px] font-bold text-stone-800 uppercase font-outfit">{form.staffName || "---"}</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-10 pt-8 border-t border-stone-50">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Transaction Date</p>
                                                                <p className="text-[13px] font-bold text-stone-600 uppercase font-mono-jb">{form.checkIn}</p>
                                                            </div>
                                                            <div className="space-y-2 text-right">
                                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Inputted By</p>
                                                                <p className="text-[14px] font-bold text-stone-800 uppercase font-outfit">{form.staffName || "---"}</p>
                                                            </div>
                                                        </div>

                                                        <div className="pt-8 border-t border-stone-50">
                                                            <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-3">Internal Note</p>
                                                            <p className="text-[13px] text-stone-500 leading-relaxed italic font-outfit">
                                                                {form.note || "No additional notes provided."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[13px] text-stone-500 uppercase tracking-wider">{revenueType === 'room' ? 'Guest Identity' : 'Input Staff'}</p>
                                                        <p className="text-[13px] font-bold text-stone-900 uppercase tracking-widest truncate max-w-[200px]">{form.guestName || form.staffName || "..."}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[13px] text-stone-500 uppercase tracking-wider">Channel / Type</p>
                                                        <p className="text-[13px] font-bold text-stone-900 uppercase tracking-widest">{revenueType === 'room' ? form.channel : form.incomeType}</p>
                                                    </div>
                                                    <div className="pt-6 border-t border-stone-50 flex justify-between items-center">
                                                        <p className="text-[13px] font-bold text-stone-400 uppercase tracking-wider">Gross Total</p>
                                                        <p className="text-[14px] font-bold text-stone-900 font-mono-jb">{formatCurrency(form.totalAmount)}</p>
                                                    </div>
                                                    
                                                    <div className="space-y-6 pt-10 border-t border-stone-50">
                                                        <p className="text-[11px] font-bold text-stone-300 uppercase tracking-[0.2em] mb-6">Payment Status</p>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-[13px] text-stone-500 uppercase tracking-wider">
                                                                {revenueType === 'room' && form.isSplitBill ? "Payment A" : "Amount Paid"}
                                                            </p>
                                                            <p className="text-[13px] text-stone-500 font-mono-jb">{formatCurrency(form.paidAmount1)}</p>
                                                        </div>
                                                        {revenueType === 'room' && form.isSplitBill && (
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-[11px] text-stone-500 uppercase tracking-wider">Payment B</p>
                                                                <p className="text-[11px] text-stone-500 font-mono-jb">{formatCurrency(form.paidAmount2)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-12">
                                                <div className="py-10 border-y border-dashed border-stone-200">
                                                    <div className="flex justify-between items-center mb-8">
                                                        <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Balance Due</p>
                                                        <p className="text-[12px] font-bold text-sage uppercase tracking-widest">{form.paymentMethod}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className={`text-4xl font-bold font-mono-jb ${balance === 0 ? 'text-stone-900' : 'text-amber-600'}`}>
                                                            {balance < 0 ? '-' : ''}{formatCurrency(Math.abs(balance))}
                                                        </p>
                                                        <div className={`px-4 py-2 rounded-sm ${balance === 0 ? 'bg-sage text-white' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                            <p className="text-[11px] font-black uppercase tracking-[0.2em]">
                                                                {balance === 0 ? "Settled" : "Outstanding"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <button 
                                            disabled={saving || (form.isSplitBill && balance !== 0) || !form.totalAmount || (revenueType === 'room' && (!form.guestName || !form.roomTypeId))}
                                            onClick={handleSubmit}
                                            className="w-full h-16 bg-stone-900 text-white flex items-center justify-center gap-4 text-[13px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-stone-800 active:scale-[0.98] disabled:bg-stone-100 disabled:text-stone-300 group relative overflow-hidden rounded-lg shadow-xl shadow-stone-200/50"
                                        >
                                            <div className="absolute inset-0 bg-sage transition-transform duration-500 translate-x-[-101%] group-hover:translate-x-0 -z-0 opacity-10" />
                                            {saving ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin" />
                                            ) : (
                                                <div className="relative z-10 flex items-center gap-3">
                                                    <CheckCircle2 size={18} />
                                                    <span>Commit Transaction</span>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Data Entry Form Column */}
                            <div className="flex-1 order-1">
                                <header className="mb-24">
                                    <div className="flex items-center gap-3 text-sage mb-4">
                                        <button onClick={() => setStep("type")} className="hover:text-stone-900 transition-colors flex items-center gap-2">
                                            <ArrowLeft size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Back to Selection</span>
                                        </button>
                                    </div>
                                    <h1 className="text-5xl font-light text-stone-900 tracking-tight font-outfit uppercase">
                                        New <span className="font-semibold text-sage">{revenueType === 'room' ? 'Entry' : 'Income'}</span>
                                    </h1>
                                </header>

                                <div className="space-y-24">
                                    {revenueType === 'room' ? (
                                        <>
                                            <section>
                                                <SectionTitle number="01" label="Guest Information" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                                    <div className="md:col-span-2">
                                                        <NexuraInput label="Full Name" value={form.guestName} onChange={(v: string) => updateForm("guestName", v)} />
                                                    </div>
                                                    <NexuraInput label="Check-in" type="date" value={form.checkIn} onChange={(v: string) => updateForm("checkIn", v)} />
                                                    <NexuraInput label="Check-out" type="date" value={form.checkOut} onChange={(v: string) => updateForm("checkOut", v)} />
                                                </div>
                                            </section>

                                            <section>
                                                <SectionTitle number="02" label="Stay Details" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Room Category</label>
                                                        <div className="relative group luxury-input bg-white transition-all rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100/50 focus-within:border-sage focus-within:shadow-md">
                                                            <select
                                                                value={form.roomTypeId}
                                                                onChange={e => updateForm("roomTypeId", e.target.value)}
                                                                className="w-full h-12 px-6 bg-transparent outline-none text-[12px] font-bold uppercase tracking-widest custom-select cursor-pointer text-stone-800"
                                                            >
                                                                <option value=""></option>
                                                                {roomTypes.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <NexuraInput label="Room Number" value={form.roomNumber} onChange={(v: string) => updateForm("roomNumber", v)} />
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Booking Channel</label>
                                                        <ChannelSelect value={form.channel} onChange={(v: string) => updateForm("channel", v)} />
                                                    </div>
                                                    <NexuraInput label="Voucher Code" value={form.voucherCode} onChange={(v: string) => updateForm("voucherCode", v)} />
                                                </div>
                                            </section>

                                            <section>
                                                <SectionTitle number="03" label="Additional Info" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                                    <div className="md:col-span-2">
                                                        <NexuraInput label="Staff In-Charge" value={form.staffName} onChange={(v: string) => updateForm("staffName", v)} />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-3">
                                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Internal Notes</label>
                                                        <div className="relative group luxury-input bg-white transition-all rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100/50 focus-within:border-sage focus-within:shadow-md p-4">
                                                            <textarea
                                                                value={form.note}
                                                                onChange={e => updateForm("note", e.target.value)}
                                                                rows={3}
                                                                placeholder="Enter transaction details or guest remarks..."
                                                                className="w-full bg-transparent outline-none text-[12px] font-medium text-stone-800 resize-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </>
                                    ) : (
                                        <section>
                                            <SectionTitle number="01" label="Income Source" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Income Category</label>
                                                    <div className="relative group luxury-input bg-white transition-all rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100/50 focus-within:border-sage focus-within:shadow-md">
                                                        <select
                                                            value={form.incomeType}
                                                            onChange={e => updateForm("incomeType", e.target.value)}
                                                            className="w-full h-12 px-6 bg-transparent outline-none text-[12px] font-bold uppercase tracking-widest custom-select cursor-pointer text-stone-800"
                                                        >
                                                            <option value="Breakfast">BREAKFAST</option>
                                                            <option value="Dinner">DINNER</option>
                                                            <option value="Snack">SNACK</option>
                                                            <option value="F&B">F&B OUTLET</option>
                                                            <option value="Laundry">LAUNDRY</option>
                                                            <option value="Spa">SPA & WELLNESS</option>
                                                            <option value="Outlet">GENERAL OUTLET</option>
                                                            <option value="Other">OTHER</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <NexuraInput label="Staff Input" value={form.staffName} onChange={(v: string) => updateForm("staffName", v)} />
                                                <div className="md:col-span-2">
                                                    <NexuraInput label="Transaction Date" type="date" value={form.checkIn} onChange={(v: string) => updateForm("checkIn", v)} />
                                                </div>
                                                <div className="md:col-span-2 space-y-3">
                                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Internal Notes</label>
                                                    <div className="relative group luxury-input bg-white transition-all rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100/50 focus-within:border-sage focus-within:shadow-md p-4">
                                                        <textarea
                                                            value={form.note}
                                                            onChange={e => updateForm("note", e.target.value)}
                                                            rows={3}
                                                            placeholder="Enter transaction details or guest remarks..."
                                                            className="w-full bg-transparent outline-none text-[12px] font-medium text-stone-800 resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    <section>
                                        <SectionTitle number={revenueType === 'room' ? "04" : "02"} label="Financials" />
                                        <div className="space-y-12">
                                            <NexuraInput label="Total Amount (IDR)" type="number" value={form.totalAmount} onChange={(v: string) => updateForm("totalAmount", v)} isAmount />

                                             {/* Split Payment - Only for local sales */}
                                             {(revenueType !== 'room' || (form.channel === "Walk-in" || form.channel === "Nexura Sales")) && (

                                            <div className="flex items-center justify-between p-6 bg-stone-50/50 rounded-xl shadow-sm border border-stone-50">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 bg-white border border-stone-200 flex items-center justify-center text-stone-400">
                                                        <Receipt size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase text-stone-900 tracking-wider">Split Payment</p>
                                                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">Divide across multiple methods</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => updateForm("isSplitBill", !form.isSplitBill)} className={`w-12 h-6 transition-all duration-300 relative rounded-full ${form.isSplitBill ? 'bg-sage' : 'bg-stone-200'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white transition-all duration-300 rounded-full ${form.isSplitBill ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                             )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                                <NexuraInput label={form.isSplitBill ? "Payment A" : "Amount Paid"} type="number" value={form.paidAmount1} onChange={(v: string) => updateForm("paidAmount1", v)} isAmount />
                                                {form.isSplitBill && (
                                                    <NexuraInput label="Payment B" type="number" value={form.paidAmount2} onChange={(v: string) => updateForm("paidAmount2", v)} isAmount />
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                 <div className="flex items-center justify-between">
                                                     <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Payment Method</label>
                                                     {revenueType === "room" && !(form.channel === "Walk-in" || form.channel === "Nexura Sales") && (
                                                         <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest bg-stone-50 px-2 py-0.5 rounded border border-stone-100">Locked for OTA/Engine</span>
                                                     )}
                                                 </div>
                                                 <div className="flex gap-1 p-1 bg-stone-100/50 border border-stone-50 rounded-xl">
                                                     <button 
                                                         onClick={() => updateForm("paymentMethod", "Pay at Hotel")} 
                                                         disabled={revenueType === "room" && !(form.channel === "Walk-in" || form.channel === "Nexura Sales")}
                                                         className={`flex-1 h-12 text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 rounded-lg ${form.paymentMethod === "Pay at Hotel" ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'} ${revenueType === "room" && !(form.channel === "Walk-in" || form.channel === "Nexura Sales") ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                                                     >
                                                         <Home size={14} /> Pay at Hotel
                                                     </button>
                                                     <button onClick={() => updateForm("paymentMethod", "Pay at Nexura")} className={`flex-1 h-12 text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 rounded-lg ${form.paymentMethod === "Pay at Nexura" ? 'bg-sage text-white shadow-lg shadow-sage/20' : 'text-stone-400 hover:text-stone-600'}`}>
                                                         <Sparkles size={14} /> Pay at Nexura
                                                     </button>
                                                 </div>
                                             </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default function AddTransactionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border-2 border-stone-100 border-t-sage animate-spin" /></div>}>
            <AddTransactionContent />
        </Suspense>
    );
}

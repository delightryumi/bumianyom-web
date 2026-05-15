"use client";

import React, { Suspense } from "react";
import {
    Home,
    Coffee,
    ArrowLeft,
    Sparkles,
    Receipt,
    CheckCircle2,
    Plus,
    Trash2
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
        grandTotal,
        nights,
        setStep,
        setRevenueType,
        updateForm,
        addRoom,
        removeRoom,
        updateRoom,
        handleSubmit,
        isAvailable
    } = useTransactionForm();

    const formatCurrency = (val: string | number) => {
        const num = Number(val) || 0;
        return new Intl.NumberFormat('id-ID').format(Math.floor(num));
    };

    const available = isAvailable();

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
                                    <div className="space-y-12">
                                        {/* Minimalist Header */}
                                        <div className="flex flex-col gap-6 px-2">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-sage uppercase tracking-[0.4em]">Nexura / Transaction</p>
                                                    <h2 className="text-4xl font-bold text-stone-900 tracking-tighter font-outfit uppercase">
                                                        Nota <span className="text-sage">Review</span>
                                                    </h2>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-1">Entry Status</p>
                                                    <p className={`text-[12px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${available ? 'text-amber-500 bg-amber-50 border-amber-100' : 'text-rose-500 bg-rose-50 border-rose-100'}`}>
                                                        {available ? 'Draft Basis' : 'Sold Out'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-[2px] w-full bg-stone-900" />
                                        </div>

                                        <div className="px-4 space-y-16">
                                            {/* Top Metadata Row */}
                                            <div className="flex justify-between items-start text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                                                <div className="space-y-1">
                                                    <p>Issuer: <span className="text-stone-900">Bumi Anyom Resort</span></p>
                                                    <p>Ref: <span className="text-stone-900">#DRAFT-{new Date().getTime().toString().slice(-6)}</span></p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p>Date: <span className="text-stone-900">{form.checkIn || new Date().toISOString().split('T')[0]}</span></p>
                                                    <p>Type: <span className="text-stone-900">{revenueType === 'room' ? 'Accommodation' : 'Operational'}</span></p>
                                                </div>
                                            </div>

                                            {/* Core Data Sections */}
                                            <div className="space-y-12">
                                                <div className="grid grid-cols-1 gap-12">
                                                    {/* Section A: Subject */}
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.4em] border-b border-stone-100 pb-2">Subject Details</p>
                                                        <div className="flex justify-between items-baseline">
                                                            <p className="text-[14px] font-medium text-stone-500 uppercase tracking-wider">Guest / Source</p>
                                                            <p className="text-xl font-bold text-stone-900 uppercase font-outfit">
                                                                {revenueType === 'room' ? (form.guestName || "---") : (form.incomeType || "---")}
                                                            </p>
                                                        </div>
                                                        <div className="flex justify-between items-baseline">
                                                            <p className="text-[14px] font-medium text-stone-500 uppercase tracking-wider">Classification</p>
                                                            <p className="text-[16px] font-bold text-stone-800 uppercase font-outfit">
                                                                {revenueType === 'room' ? (form.channel || "Walk-in") : "Outlet Income"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Section B: Stay/Period */}
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.4em] border-b border-stone-100 pb-2">Period & Scope</p>
                                                        {revenueType === 'room' ? (
                                                            <>
                                                                <div className="flex justify-between items-baseline">
                                                                    <p className="text-[14px] font-medium text-stone-500 uppercase tracking-wider">Check-in / Out</p>
                                                                    <p className="text-[15px] font-bold text-stone-800 font-mono-jb">
                                                                        {form.checkIn || "---"} <span className="text-stone-300 mx-2">/</span> {form.checkOut || "---"}
                                                                    </p>
                                                                </div>
                                                                <div className="flex justify-between items-baseline">
                                                                    <p className="text-[14px] font-medium text-stone-500 uppercase tracking-wider">Unit Allocation</p>
                                                                    <p className="text-[15px] font-bold text-stone-800 uppercase font-outfit">
                                                                        {roomTypes.find(r => r.id === form.roomTypeId)?.name || "---"} {form.roomNumber ? `(RM ${form.roomNumber})` : ""}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex justify-between items-baseline">
                                                                <p className="text-[14px] font-medium text-stone-500 uppercase tracking-wider">Recorded At</p>
                                                                <p className="text-[15px] font-bold text-stone-800 font-mono-jb">
                                                                    {new Date().toLocaleTimeString('id-ID')} WIB
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Section C: Financial Ledger */}
                                                    <div className="space-y-4 pt-4">
                                                        <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.4em] border-b border-stone-100 pb-2">Revenue Ledger</p>
                                                        <div className="space-y-3">
                                                            {revenueType === 'room' && (
                                                                <div className="space-y-4">
                                                                    {form.rooms.map((room, idx) => {
                                                                        const rt = roomTypes.find(t => t.id === room.roomTypeId);
                                                                        return (
                                                                            <div key={idx} className="flex justify-between items-baseline text-sage border-b border-stone-50 pb-2">
                                                                                <div className="space-y-1">
                                                                                    <p className="text-[12px] font-bold uppercase tracking-wider">{rt?.name || "Unit "+(idx+1)}</p>
                                                                                    <p className="text-[10px] opacity-60">RM {room.roomNumber || "---"}</p>
                                                                                </div>
                                                                                <p className="text-[12px] font-bold font-mono-jb">
                                                                                    {formatCurrency(room.price)} x 1 x {nights} NT
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-baseline pt-2">
                                                                <p className="text-[14px] font-bold text-stone-700 uppercase tracking-wider">Grand Total</p>
                                                                <p className="text-[18px] font-black text-stone-900 font-mono-jb">Rp {formatCurrency(grandTotal)}</p>
                                                            </div>
                                                            <div className="flex justify-between items-baseline">
                                                                <p className="text-[14px] font-medium text-stone-500 uppercase tracking-wider">Amount Received</p>
                                                                <p className="text-[16px] font-bold text-stone-900 font-mono-jb">
                                                                    Rp {formatCurrency(Number(form.paidAmount1) + (form.isSplitBill ? Number(form.paidAmount2) : 0))}
                                                                </p>
                                                            </div>
                                                            {form.isSplitBill && (
                                                                <div className="bg-stone-50/50 p-4 rounded-xl border border-dashed border-stone-200 mt-2 space-y-2">
                                                                    <div className="flex justify-between items-center text-[12px]">
                                                                        <span className="text-stone-400 uppercase font-bold tracking-widest">Allocation A</span>
                                                                        <span className="font-bold text-stone-600 font-mono-jb">Rp {formatCurrency(form.paidAmount1)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[12px]">
                                                                        <span className="text-stone-400 uppercase font-bold tracking-widest">Allocation B</span>
                                                                        <span className="font-bold text-stone-600 font-mono-jb">Rp {formatCurrency(form.paidAmount2)}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Summary Total */}
                                                <div className="pt-12 border-t-2 border-stone-900">
                                                    <div className="flex justify-between items-end">
                                                        <div className="space-y-2">
                                                            <p className="text-[12px] font-bold text-stone-400 uppercase tracking-[0.4em]">Final Balance Due</p>
                                                            <p className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 inline-block rounded-sm ${balance === 0 ? 'bg-sage text-white' : 'bg-amber-500 text-white'}`}>
                                                                {balance === 0 ? "Settled" : "Outstanding"}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-3xl font-bold font-mono-jb tracking-tighter ${balance === 0 ? 'text-stone-900' : 'text-amber-600'}`}>
                                                                Rp {formatCurrency(Math.abs(balance))}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Remarks */}
                                                <div className="pt-8 space-y-4">
                                                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.4em]">Internal Remarks</p>
                                                    <p className="text-[14px] text-stone-500 leading-relaxed italic font-outfit bg-stone-50/30 p-6 border-l-2 border-stone-200">
                                                        {form.note || "No specific instructions or remarks provided for this transaction basis."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-12">
                                        {!available && revenueType === 'room' && (
                                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest text-center mb-4 bg-rose-50 p-3 rounded-lg border border-rose-100">
                                                Cannot commit: Room type is sold out for selected dates
                                            </p>
                                        )}
                                        <button 
                                            disabled={saving || !available}
                                            onClick={handleSubmit}
                                            className="w-full h-20 bg-stone-900 text-white flex items-center justify-center gap-5 text-[14px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-stone-800 active:scale-[0.98] disabled:bg-stone-100 disabled:text-stone-300 group relative overflow-hidden rounded-xl shadow-2xl shadow-stone-200/50"
                                        >
                                            <div className="absolute inset-0 bg-sage transition-transform duration-500 translate-x-[-101%] group-hover:translate-x-0 -z-0 opacity-10" />
                                            {saving ? (
                                                <div className="w-6 h-6 border-2 border-white/20 border-t-white animate-spin" />
                                            ) : (
                                                <div className="relative z-10 flex items-center gap-4">
                                                    <CheckCircle2 size={20} />
                                                    <span>Commit & Publish</span>
                                                </div>
                                            )}
                                        </button>
                                        <p className="text-center text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em] mt-6">Secure Transaction Managed by Nexura</p>
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
                                                <SectionTitle number="02" label="Stay Details & Allocation" />
                                                <div className="space-y-12">
                                                    {form.rooms.map((room, index) => (
                                                        <div key={index} className="p-8 bg-stone-50/30 rounded-[32px] border border-stone-100/50 space-y-8 relative group/room">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Room Unit {index + 1}</span>
                                                                {form.rooms.length > 1 && (
                                                                    <button 
                                                                        onClick={() => removeRoom(index)}
                                                                        className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Room Category</label>
                                                                    <div className="relative group luxury-input bg-white transition-all rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100/50 focus-within:border-sage focus-within:shadow-md">
                                                                        <select
                                                                            value={room.roomTypeId}
                                                                            onChange={e => updateRoom(index, "roomTypeId", e.target.value)}
                                                                            className="w-full h-12 px-6 bg-transparent outline-none text-[12px] font-bold uppercase tracking-widest custom-select cursor-pointer text-stone-800"
                                                                        >
                                                                            <option value=""></option>
                                                                            {roomTypes.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <NexuraInput 
                                                                    label="Room Number" 
                                                                    value={room.roomNumber} 
                                                                    onChange={(v: string) => updateRoom(index, "roomNumber", v)} 
                                                                />
                                                                <div className="md:col-span-2">
                                                                    <NexuraInput 
                                                                        label="Price / Night (IDR)" 
                                                                        type="number" 
                                                                        value={room.price} 
                                                                        onChange={(v: string) => updateRoom(index, "price", v)} 
                                                                        isAmount 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button 
                                                        onClick={addRoom}
                                                        className="w-full h-16 border-2 border-dashed border-stone-100 rounded-2xl flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-stone-400 hover:border-sage hover:text-sage transition-all group"
                                                    >
                                                        <div className="w-8 h-8 bg-stone-50 rounded-full flex items-center justify-center group-hover:bg-sage group-hover:text-white transition-all">
                                                            <Plus size={16} />
                                                        </div>
                                                        Add Another Room
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 pt-8">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Booking Channel</label>
                                                            <ChannelSelect value={form.channel} onChange={(v: string) => updateForm("channel", v)} />
                                                        </div>
                                                        <NexuraInput label="Voucher Code" value={form.voucherCode} onChange={(v: string) => updateForm("voucherCode", v)} />
                                                    </div>
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
                                            {revenueType === 'other' && (
                                                <NexuraInput 
                                                    label="Total Amount (IDR)" 
                                                    type="number" 
                                                    value={form.totalAmount} 
                                                    onChange={(v: string) => updateForm("totalAmount", v)} 
                                                    isAmount 
                                                />
                                            )}

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

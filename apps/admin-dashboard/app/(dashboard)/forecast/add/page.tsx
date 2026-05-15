"use client";

import React, { Suspense } from "react";
import {
    Home,
    Coffee,
    ArrowLeft,
    Plus,
    Trash2,
    Calendar,
    User,
    Package,
    ShieldCheck,
    Upload,
    AlertCircle,
    Receipt,
    UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Modular Imports
import "./TransactionFormStyles.css";
import { useTransactionForm, CHANNELS, OTHER_INCOME_TYPES } from "./useTransactionForm";
import {
    SectionTitle,
    ChannelSelect,
    RoomTypeSelect,
    OtherIncomeTypeSelect,
    NexuraInput,
    TypeCard,
    DateCard
} from "./TransactionComponents";

const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID").format(val);

function AddTransactionContent() {
    const {
        form,
        roomTypes,
        saving,
        step,
        setStep,
        revenueType,
        setRevenueType,
        updateForm,
        updateRoom,
        updateNightRate,
        isAvailable,
        nights,
        totalGross,
        balance,
        queue,
        addToQueue,
        removeFromQueue,
        commitTransactions
    } = useTransactionForm();

    const currentChannel = CHANNELS.find(c => c.name === form.channel);

    return (
        <div className="nexura-terminal-container">
            <main className={`max-w-[1700px] mx-auto px-10 ${step === 'type' ? 'min-h-[90vh] flex items-center justify-center' : 'pt-12 pb-20'}`}>
                <AnimatePresence mode="wait">
                    {step === "type" ? (
                        <motion.div key="step-type" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-4xl py-20">
                            <div className="flex flex-col items-center text-center mb-12 space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-sage rounded-full animate-pulse" />
                                    <h1 className="text-[12px] font-bold uppercase tracking-[0.4em] text-stone-900">POS Terminal</h1>
                                </div>
                                <h2 className="text-5xl font-light text-stone-900 tracking-tighter uppercase">
                                    Pilih <span className="font-semibold text-sage">Kategori</span>
                                </h2>
                                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-[0.3em]">Bumi Anyom Resort • Administrative</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                                <TypeCard label="Room Revenue" description="Accommodation & Packages" icon={Home} onClick={() => { setRevenueType('room'); setStep('form'); }} />
                                <TypeCard label="Other Income" description="F&B, Laundry, Spa, etc" icon={Coffee} onClick={() => { setRevenueType('other'); setStep('form'); }} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="step-form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-10">
                            {/* Header Section */}
                            <div className="flex justify-between items-end mb-4 px-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="w-2 h-2 bg-sage rounded-full animate-pulse" />
                                        <h1 className="text-[20px] font-bold uppercase tracking-[0.2em] text-stone-900">{revenueType?.toUpperCase()} ENTRY</h1>
                                    </div>
                                    <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">Bumi Anyom Resort • Administrative Terminal</p>
                                </div>
                                <div className="hidden md:flex items-center gap-4">
                                    <div className="px-5 py-2.5 bg-white rounded-lg flex items-center gap-3 shadow-sm border border-stone-50">
                                        <ShieldCheck size={16} className="text-sage" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Secured Session</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col xl:flex-row gap-8 items-start">
                                {/* Left Side: Bento 1-3 */}
                                <div className="flex-1 space-y-8">

                                    {/* BENTO SECTION 01: DATA TAMU (including calendar) */}
                                    <div className="nexura-terminal-card">
                                        <SectionTitle number="01" label={revenueType === 'room' ? "Data Tamu" : "Data Transaksi"} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Date Selection */}
                                            {revenueType === 'room' ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <DateCard label="IN" date={form.checkIn} value={form.checkIn} onChange={(v) => updateForm("checkIn", v)} type="check-in" />
                                                    <DateCard label="OUT" date={form.checkOut} value={form.checkOut} onChange={(v) => updateForm("checkOut", v)} type="check-out" />
                                                </div>
                                            ) : (
                                                <div className="md:col-span-1">
                                                    <DateCard label="TANGGAL INPUT" date={form.checkIn} value={form.checkIn} onChange={(v) => updateForm("checkIn", v)} type="check-in" />
                                                </div>
                                            )}
                                            <div className="hidden md:block" />

                                            {/* Transaction Context */}
                                            <div className="md:col-span-2">
                                                <NexuraInput 
                                                    label={revenueType === 'room' ? "Nama Lengkap *" : "Keterangan / Nama Tamu *"} 
                                                    placeholder={revenueType === 'room' ? "Input nama tamu..." : "Cth: Breakfast Tamu Room 101..."} 
                                                    value={form.guestName} 
                                                    onChange={(v: string) => updateForm("guestName", v)} 
                                                    icon={revenueType === 'room' ? User : Package} 
                                                />
                                            </div>

                                            {/* Specific Details */}
                                            {revenueType === 'room' ? (
                                                <>
                                                    <div className="space-y-1">
                                                        <label className="text-label">Tipe Kamar</label>
                                                        <RoomTypeSelect value={form.rooms[0].roomTypeId} options={roomTypes} onChange={(v: string) => updateRoom(0, "roomTypeId", v)} />
                                                    </div>
                                                    <NexuraInput label="No. Kamar" placeholder="Cth: 101" value={form.rooms[0].roomNumber} onChange={(v: string) => updateRoom(0, "roomNumber", v)} />
                                                </>
                                            ) : (
                                                <div className="space-y-1">
                                                    <label className="text-label">Tipe Transaksi</label>
                                                    <OtherIncomeTypeSelect 
                                                        value={form.incomeType} 
                                                        options={OTHER_INCOME_TYPES} 
                                                        onChange={(v: string) => updateForm("incomeType", v)} 
                                                    />
                                                </div>
                                            )}

                                            {/* Staff & Channel */}
                                            {revenueType === 'room' && (
                                                <div className="space-y-1">
                                                    <label className="text-label">Channel Source</label>
                                                    <ChannelSelect value={form.channel} onChange={(v: string) => updateForm("channel", v)} />
                                                </div>
                                            )}
                                            <NexuraInput label="Staff Input *" placeholder="Nama petugas..." value={form.staffName} onChange={(v: string) => updateForm("staffName", v)} icon={UserCheck} />

                                            {revenueType === 'room' && (
                                                <NexuraInput label="Voucher" placeholder="Opsional..." value={form.voucherCode} onChange={(v: string) => updateForm("voucherCode", v)} />
                                            )}
                                            
                                            {revenueType === 'other' && (
                                                <NexuraInput label="Total Amount (Rp) *" type="number" value={form.totalAmount} onChange={(v: string) => updateForm("totalAmount", v)} isAmount />
                                            )}
                                        </div>
                                    </div>

                                    {/* BENTO SECTION 02: BILLING (Conditional) */}
                                    {revenueType === 'room' && (
                                        <div className="nexura-terminal-card">
                                            <SectionTitle number="02" label="Rincian Billing" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {(form.nightRates || []).map((rate, idx) => (
                                                    <NexuraInput
                                                        key={idx}
                                                        label={`NIGHT ${idx + 1}`}
                                                        type="number"
                                                        value={rate}
                                                        onChange={(v: string) => updateNightRate(idx, v)}
                                                        isAmount
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* BENTO SECTION 03: SETTLEMENT */}
                                    <div className="nexura-terminal-card">
                                        <SectionTitle number={revenueType === 'room' ? "03" : "02"} label="Payment & Settlement" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <NexuraInput 
                                                label="Pay at Hotel" 
                                                type="number" 
                                                value={form.payHotel} 
                                                onChange={(v: string) => updateForm("payHotel", v)} 
                                                isAmount 
                                                disabled={revenueType === 'room' && !(form.channel === "Walk-in" || form.channel === "Nexura Sales")}
                                            />
                                            <NexuraInput label="Pay at Nexura" type="number" value={form.payNexura} onChange={(v: string) => updateForm("payNexura", v)} isAmount />

                                            <div className="md:col-span-2">
                                                <label className="text-label">Catatan Tambahan</label>
                                                <textarea value={form.note} onChange={e => updateForm("note", e.target.value)} className="w-full bg-stone-100/30 border border-stone-200 rounded-lg p-4 text-[12px] font-medium uppercase tracking-widest outline-none focus:border-sage transition-all" rows={2} placeholder="Keterangan transaksi..." />
                                            </div>
                                            <div className="md:col-span-2 flex flex-col pt-4 -mx-8 overflow-hidden">
                                                <button
                                                    onClick={addToQueue}
                                                    disabled={!form.guestName || !form.staffName || (revenueType === 'room' && !form.checkOut)}
                                                    className="w-full bg-sage h-10 flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-30 shadow-lg relative z-10"
                                                >
                                                    Add to Queue List
                                                </button>
                                                <div className="relative h-[2px] w-full bg-stone-100/10 overflow-hidden mt-4">
                                                    <motion.div
                                                        initial={{ x: "-100%" }}
                                                        animate={{ x: "250%" }}
                                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-sage/40 to-transparent w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Review Side - Narrow Portrait */}
                                <aside className="w-full xl:w-[420px] sticky top-[20px] h-[calc(100vh-80px)]">
                                    <div className="nexura-terminal-card shadow-2xl h-full flex flex-col bg-white">
                                        <div className="space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                                            <div className="flex flex-col gap-1">
                                                <h2 className="text-[20px] font-bold uppercase tracking-tight text-stone-900">Review Transaksi</h2>
                                                <p className="text-[12px] text-stone-400 uppercase tracking-widest">Audit validasi internal ({queue.length + 1} items)</p>
                                            </div>

                                            {/* CURRENT DRAFT ENTRY */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Draft Sekarang</span>
                                                </div>
                                                <div className="p-6 bg-amber-50/30 rounded-xl border border-amber-100/50 space-y-4">
                                                    <div className="flex justify-between items-center border-b border-amber-100/30 pb-3">
                                                        <span className="text-[12px] font-bold uppercase text-amber-400/60 tracking-widest">Guest Name</span>
                                                        <span className="text-[12px] font-bold text-stone-800 uppercase truncate max-w-[140px]">{form.guestName || 'Pending...'}</span>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[11px] font-medium text-stone-400 uppercase">{revenueType === 'room' ? "Periode" : "Tanggal"}</span>
                                                            <span className="text-[11px] font-bold text-stone-800 uppercase">
                                                                {form.checkIn} {revenueType === 'room' && `— ${form.checkOut || '...'}`}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[11px] font-medium text-stone-400 uppercase">{revenueType === 'room' ? "Room" : "Kategori"}</span>
                                                            <span className="text-[11px] font-bold text-stone-800 uppercase">
                                                                {revenueType === 'room' ? (
                                                                    `${roomTypes.find(r => r.id === form.rooms[0].roomTypeId)?.name || 'N/A'} - ${form.rooms[0].roomNumber || 'No Room'}`
                                                                ) : (
                                                                    form.incomeType || 'Belum Dipilih'
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[11px] font-medium text-stone-400 uppercase">Staff</span>
                                                            <span className="text-[11px] font-bold text-sage uppercase">{form.staffName || 'NOT SET'}</span>
                                                        </div>
                                                        {revenueType === 'room' && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[11px] font-medium text-stone-400 uppercase">Channel</span>
                                                                <div className="flex items-center gap-2">
                                                                    {currentChannel?.logo && <img src={currentChannel.logo} className="w-4 h-4 object-contain opacity-60" alt="" />}
                                                                    <span className="text-[11px] font-bold text-stone-800 uppercase">{form.channel}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {form.note && (
                                                        <div className="mt-2 p-3 bg-white/50 rounded-lg border border-amber-100/20">
                                                            <p className="text-[11px] text-stone-500 italic">"{form.note}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* QUEUED ITEMS LIST (DETAILED CARDS) */}
                                            {queue.length > 0 && (
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-sage rounded-full" />
                                                        <span className="text-[11px] font-bold text-sage uppercase tracking-widest">Daftar Antrean ({queue.length})</span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {queue.map((item, i) => (
                                                            <div key={i} className="p-6 bg-stone-50 rounded-xl border border-stone-100 space-y-4 relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-2">
                                                                    <span className="text-[8px] font-bold text-stone-300 uppercase">Item #{i + 1}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center border-b border-stone-200/50 pb-3">
                                                                    <span className="text-[12px] font-bold uppercase text-stone-400 tracking-widest">Guest Name</span>
                                                                    <span className="text-[12px] font-bold text-stone-800 uppercase truncate max-w-[140px]">{item.guestName}</span>
                                                                </div>
                                                                
                                                                <div className="space-y-3">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[11px] font-medium text-stone-400 uppercase">Periode</span>
                                                                        <span className="text-[11px] font-bold text-stone-800 uppercase">{item.checkInDate} — {item.checkOutDate}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[11px] font-medium text-stone-400 uppercase">Room</span>
                                                                        <span className="text-[11px] font-bold text-stone-800 uppercase">{item.roomType} - {item.roomNumber}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[11px] font-medium text-stone-400 uppercase">Staff</span>
                                                                        <span className="text-[11px] font-bold text-sage uppercase">{item.staffName}</span>
                                                                    </div>
                                                                    {item.type !== 'other_income' && (
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[11px] font-medium text-stone-400 uppercase">Channel</span>
                                                                            <div className="flex items-center gap-2">
                                                                                {CHANNELS.find(c => c.name === item.channel)?.logo && (
                                                                                    <img src={CHANNELS.find(c => c.name === item.channel)?.logo} className="w-4 h-4 object-contain opacity-40" alt="" />
                                                                                )}
                                                                                <span className="text-[11px] font-bold text-stone-800 uppercase">{item.channel}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {item.note && (
                                                                    <div className="mt-2 p-3 bg-white/50 rounded-lg border border-stone-200/20">
                                                                        <p className="text-[11px] text-stone-500 italic">"{item.note}"</p>
                                                                    </div>
                                                                )}

                                                                <button 
                                                                    onClick={() => removeFromQueue(i)}
                                                                    className="w-full mt-2 py-2 text-[10px] font-bold text-rose-400 uppercase tracking-widest hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                                                >
                                                                    Hapus dari Antrean
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* CUMULATIVE SUMMARY */}
                                            <div className="mt-auto space-y-3 pt-6 border-t border-stone-100">
                                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[12px] font-bold text-stone-400 uppercase tracking-widest">Total</span>
                                                        <span className="text-[24px] text-currency text-sage">Rp {formatCurrency(queue.reduce((acc, item) => acc + item.amount, 0) + totalGross)}</span>
                                                    </div>
                                                    
                                                    <div className="pt-3 border-t border-stone-200/50 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[12px] font-medium text-stone-500 uppercase tracking-tight">Total Pay at Hotel</span>
                                                            <span className="text-[12px] font-bold text-stone-800">Rp {formatCurrency(queue.reduce((acc, item) => acc + item.payHotel, 0) + (Number(form.payHotel) || 0))}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[12px] font-medium text-stone-500 uppercase tracking-tight">Total Pay at Nexura</span>
                                                            <span className="text-[12px] font-bold text-stone-800">Rp {formatCurrency(queue.reduce((acc, item) => acc + item.payNexura, 0) + (Number(form.payNexura) || 0))}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-stone-200/30">
                                                            <span className="text-[12px] font-bold text-amber-600 uppercase tracking-tight">Balance</span>
                                                            <span className="text-[12px] font-bold text-amber-600">Rp {formatCurrency((queue.reduce((acc, item) => acc + item.amount, 0) + totalGross) - (queue.reduce((acc, item) => acc + item.payHotel, 0) + (Number(form.payHotel) || 0)) - (queue.reduce((acc, item) => acc + item.payNexura, 0) + (Number(form.payNexura) || 0)))}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col mt-auto pt-16 -mx-8 overflow-hidden">
                                                <button 
                                                    onClick={commitTransactions} 
                                                    disabled={saving || queue.length === 0} 
                                                    className="w-full bg-sage h-12 flex flex-col items-center justify-center gap-0.5 text-white hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-30 shadow-lg relative z-10"
                                                >
                                                    {saving ? (
                                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                                                    ) : (
                                                        <>
                                                            <span className="text-[12px] font-bold uppercase tracking-[0.4em]">SYNC {queue.length} ITEMS TO SERVER</span>
                                                            <span className="text-[9px] font-medium uppercase tracking-[0.2em] opacity-60">{queue.length} Items Pending</span>
                                                        </>
                                                    )}
                                                </button>
                                                <div className="relative h-[2px] w-full bg-stone-100/10 overflow-hidden mt-4">
                                                    <motion.div 
                                                        initial={{ x: "-100%" }}
                                                        animate={{ x: "250%" }}
                                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-sage/40 to-transparent w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </div>

                            {/* Queue Table Section */}
                            <div className="nexura-table-container mt-24">
                                <div className="px-8 py-6 bg-stone-50/50 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-stone-100 flex items-center justify-center text-sage shadow-sm">
                                            <Receipt size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-bold text-stone-900 uppercase tracking-[0.2em]">Queue List ({queue.length})</h3>
                                            <p className="text-[9px] text-stone-400 font-medium uppercase tracking-widest">Final audit before submission</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="nexura-table-head">
                                            <tr>
                                                <th className="px-8 py-6">Date</th>
                                                <th className="px-8 py-6">Guest Detail</th>
                                                <th className="px-8 py-6 text-right">Amount</th>
                                                <th className="px-8 py-6 text-center w-32">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {queue.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-16 text-center">
                                                        <div className="flex flex-col items-center gap-4 text-stone-300 opacity-60">
                                                            <AlertCircle size={40} strokeWidth={1.5} />
                                                            <p className="text-[10px] font-medium uppercase tracking-[0.3em]">No items in queue</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                queue.map((item, idx) => {
                                                    const channelLogo = CHANNELS.find(c => c.name === item.channel)?.logo;
                                                    return (
                                                        <tr key={idx} className="nexura-table-row">
                                                            <td className="px-8 py-6 text-[10px] font-bold text-stone-500 font-mono-jb">{item.checkInDate}</td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="flex items-center gap-2">
                                                                        {channelLogo && <img src={channelLogo} className="w-4 h-4 object-contain opacity-60" alt="" />}
                                                                        <span className="text-[12px] font-bold text-stone-900 uppercase">{item.guestName || "-"}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[9px] text-stone-400 font-medium uppercase tracking-widest pl-6">
                                                                        <span>{item.type === 'other_income' ? (item.incomeCategory || 'Other') : (item.roomType || 'Room')} {item.roomNumber || ''}</span>
                                                                        <span className="w-1 h-1 bg-stone-200 rounded-full" />
                                                                        <span>Staff: {item.staffName || 'System'}</span>
                                                                        {item.type !== 'other_income' && (
                                                                            <>
                                                                                <span className="w-1 h-1 bg-stone-200 rounded-full" />
                                                                                <span className="text-stone-500 font-bold">{item.channel}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-right font-mono-jb font-bold text-stone-900">Rp {formatCurrency(item.amount)}</td>
                                                            <td className="px-8 py-6 text-center">
                                                                <button onClick={() => removeFromQueue(idx)} className="p-3 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                        {queue.length > 0 && (
                                            <tfoot className="bg-stone-50/50">
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-6 text-[9px] font-medium text-stone-300 uppercase tracking-widest text-right">
                                                        Total Items: {queue.length}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>

                                {/* Footer Branding */}
                                <div className="mt-20 flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity pb-10">
                                    <div className="h-px w-12 bg-stone-200" />
                                    <a 
                                        href="https://nexuragroups.com" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center group"
                                    >
                                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-1">Institutional Terminal</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-medium text-stone-400 uppercase tracking-widest">Powered by</span>
                                            <span className="text-[10px] font-bold text-stone-900 uppercase tracking-[0.2em] group-hover:text-sage transition-colors">Nexura Global Hospitality</span>
                                        </div>
                                    </a>
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
        <Suspense fallback={<div className="min-h-screen nexura-terminal-container flex items-center justify-center"><div className="w-12 h-12 border-2 border-stone-100 border-t-sage animate-spin rounded-full" /></div>}>
            <AddTransactionContent />
        </Suspense>
    );
}

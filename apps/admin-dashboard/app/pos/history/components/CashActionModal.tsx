"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from "lucide-react";

interface CashActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    cashActionType: "setor" | "ambil";
    setCashActionType: (type: "setor" | "ambil") => void;
    cashAmount: string;
    setCashAmount: (val: string) => void;
    cashNote: string;
    setCashNote: (val: string) => void;
}

export const CashActionModal: React.FC<CashActionModalProps> = ({
    isOpen, onClose, onSubmit, cashActionType, setCashActionType,
    cashAmount, setCashAmount, cashNote, setCashNote
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                        className="relative w-full max-w-md bg-white rounded-[8px] shadow-2xl border border-[#e0e0e0] overflow-hidden"
                    >
                        <header className="p-6 border-b border-[#e0e0e0] flex items-center justify-between bg-white">
                            <div>
                                <span className="text-[10px] text-[#0066cc] uppercase tracking-wider block mb-1 font-bold">Drawer Management</span>
                                <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Cash In / Out</h3>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-[6px] bg-[#f4f5f8] flex items-center justify-center text-[#7a7a7a] hover:text-[#1d1d1f]">
                                <X size={18} />
                            </button>
                        </header>

                        <form onSubmit={onSubmit} className="p-6 space-y-6 bg-white">
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setCashActionType("setor")}
                                    className={`flex flex-col items-center justify-center p-4 rounded-[6px] border transition-all gap-2 cursor-pointer ${
                                        cashActionType === "setor" 
                                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm font-bold" 
                                            : "bg-[#f4f5f8] border-[#e0e0e0] text-[#7a7a7a] hover:bg-[#ebebec]"
                                    }`}
                                >
                                    <ArrowUpRight size={24} className={cashActionType === "setor" ? "text-emerald-600" : ""} />
                                    <span className="text-[10px] uppercase tracking-wider font-semibold">Cash In</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setCashActionType("ambil")}
                                    className={`flex flex-col items-center justify-center p-4 rounded-[6px] border transition-all gap-2 cursor-pointer ${
                                        cashActionType === "ambil" 
                                            ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm font-bold" 
                                            : "bg-[#f4f5f8] border-[#e0e0e0] text-[#7a7a7a] hover:bg-[#ebebec]"
                                    }`}
                                >
                                    <ArrowDownLeft size={24} className={cashActionType === "ambil" ? "text-rose-600" : ""} />
                                    <span className="text-[10px] uppercase tracking-wider font-semibold">Cash Out</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-[#7a7a7a] font-semibold">Amount (IDR)</label>
                                <input 
                                    type="number"
                                    required
                                    placeholder="Example: 150000"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                    className="w-full h-10 px-4 bg-white border border-[#e0e0e0] rounded-[6px] text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-all shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-[#7a7a7a] font-semibold">Note / Remarks</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Example: Morning change float..."
                                    value={cashNote}
                                    onChange={(e) => setCashNote(e.target.value)}
                                    className="w-full h-10 px-4 bg-white border border-[#e0e0e0] rounded-[6px] text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-all shadow-sm"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full h-12 bg-[#0066cc] hover:bg-[#0071e3] text-white rounded-[6px] flex items-center justify-center gap-2 font-semibold text-sm shadow-sm transition-all cursor-pointer"
                            >
                                <CheckCircle2 size={18} />
                                <span>Confirm {cashActionType === "setor" ? "Cash In" : "Cash Out"}</span>
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

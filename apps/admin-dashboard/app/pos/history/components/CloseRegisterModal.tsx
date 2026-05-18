"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { formatIDR } from "@/lib/pnl-utils";

interface CloseRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    initialFloat: number;
    cashSales: number;
    cashIn: number;
    cashOut: number;
    expectedCashDrawer: number;
    actualCashFloat: string;
    setActualCashFloat: (val: string) => void;
}

export const CloseRegisterModal: React.FC<CloseRegisterModalProps> = ({
    isOpen, onClose, onSubmit, initialFloat, cashSales, cashIn, cashOut,
    expectedCashDrawer, actualCashFloat, setActualCashFloat
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
                                <span className="text-[10px] text-rose-500 uppercase tracking-wider block mb-1 font-bold">End Shift</span>
                                <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Close Register</h3>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-[6px] bg-[#f4f5f8] flex items-center justify-center text-[#7a7a7a] hover:text-[#1d1d1f]">
                                <X size={18} />
                            </button>
                        </header>

                        <form onSubmit={onSubmit} className="p-6 space-y-6 bg-white">
                            <div className="bg-[#f4f5f8] rounded-[6px] p-4 border border-[#e0e0e0] space-y-3 text-sm">
                                <div className="flex justify-between font-medium text-[#7a7a7a]">
                                    <span>Opening Float:</span>
                                    <span className="text-[#1d1d1f] font-bold">{formatIDR(initialFloat)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-[#7a7a7a]">
                                    <span>Cash Sales:</span>
                                    <span className="text-emerald-600 font-bold">+{formatIDR(cashSales)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-[#7a7a7a]">
                                    <span>Cash In:</span>
                                    <span className="text-blue-600 font-bold">+{formatIDR(cashIn)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-[#7a7a7a]">
                                    <span>Cash Out:</span>
                                    <span className="text-rose-600 font-bold">-{formatIDR(cashOut)}</span>
                                </div>
                                <div className="pt-2 border-t border-[#cccccc] flex justify-between font-bold text-[#1d1d1f]">
                                    <span>Expected Drawer (System):</span>
                                    <span className="text-[#0066cc]">{formatIDR(expectedCashDrawer)}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-[#7a7a7a] font-semibold">Physical Cash Count (IDR)</label>
                                <input 
                                    type="number"
                                    required
                                    placeholder="Enter the actual cash amount in the drawer..."
                                    value={actualCashFloat}
                                    onChange={(e) => setActualCashFloat(e.target.value)}
                                    className="w-full h-10 px-4 bg-white border border-[#e0e0e0] rounded-[6px] text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-all shadow-sm"
                                />
                                <p className="text-[10px] text-[#7a7a7a] leading-tight mt-1">Cashiers must count all physical cash in the drawer before closing the session.</p>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full h-12 rounded-[6px] bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <AlertCircle size={18} />
                                <span>Close Session & Print Report</span>
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

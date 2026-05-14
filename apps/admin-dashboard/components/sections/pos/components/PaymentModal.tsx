"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Banknote, CreditCard, Send, CheckCircle2, Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/pnl-utils";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onConfirm: (method: "Cash" | "Card" | "Transfer", customerName: string) => Promise<any>;
    customerName: string;
    setCustomerName: (name: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen, onClose, total, onConfirm, customerName, setCustomerName
}) => {
    const [method, setMethod] = useState<"Cash" | "Card" | "Transfer">("Cash");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await onConfirm(method, customerName);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const SAGE = "#788069";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
                    >
                        {isSuccess ? (
                            <div className="p-12 text-center space-y-6">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto"
                                >
                                    <CheckCircle2 size={48} />
                                </motion.div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight">Payment Successful</h3>
                                    <p className="text-stone-400 text-sm">Order has been processed and synced with Ledger.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <header className="p-8 border-b border-stone-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Final Settlement</span>
                                        <h3 className="text-2xl font-black text-stone-900 tracking-tight">Select <span className="text-sage" style={{ color: SAGE }}>Payment Method</span></h3>
                                    </div>
                                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
                                        <X size={20} />
                                    </button>
                                </header>

                                <div className="p-8 space-y-8">
                                    <div className="bg-stone-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-stone-100">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Total Amount Due</span>
                                        <h4 className="text-4xl font-black text-stone-900 tracking-tighter">{formatIDR(total)}</h4>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'Cash', icon: <Banknote size={24} />, label: 'Cash' },
                                            { id: 'Card', icon: <CreditCard size={24} />, label: 'Card' },
                                            { id: 'Transfer', icon: <Send size={24} />, label: 'Transfer' }
                                        ].map((m) => (
                                            <button 
                                                key={m.id}
                                                onClick={() => setMethod(m.id as any)}
                                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${
                                                    method === m.id 
                                                        ? "bg-sage text-white border-sage shadow-xl shadow-sage/20 scale-[1.05]" 
                                                        : "bg-white border-stone-100 text-stone-400 hover:border-stone-200"
                                                }`}
                                                style={method === m.id ? { backgroundColor: SAGE, borderColor: SAGE } : {}}
                                            >
                                                {m.icon}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Confirm Customer Name</label>
                                        <input 
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Guest"
                                            className="w-full h-14 px-6 bg-stone-50 border border-stone-100 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-sage transition-all"
                                        />
                                    </div>
                                </div>

                                <footer className="p-8 bg-stone-50/50 border-t border-stone-100">
                                    <button 
                                        onClick={handleConfirm}
                                        disabled={isProcessing}
                                        className="w-full h-16 rounded-2xl bg-sage text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-sage/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                                        style={{ backgroundColor: SAGE }}
                                    >
                                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                        Complete Settlement
                                    </button>
                                </footer>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

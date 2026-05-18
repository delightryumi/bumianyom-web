"use client";

import React from "react";
import { Banknote, CreditCard, Send } from "lucide-react";

interface PaymentMethodsProps {
    method: "Cash" | "Card" | "Transfer";
    setMethod: (m: "Cash" | "Card" | "Transfer") => void;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
    method,
    setMethod
}) => {
    const methodsList = [
        { id: 'Cash', icon: <Banknote size={26} />, label: 'Tunai (Cash)', desc: 'Bayar di kasir' },
        { id: 'Card', icon: <CreditCard size={26} />, label: 'Kartu (Card)', desc: 'Debit / Kredit' },
        { id: 'Transfer', icon: <Send size={26} />, label: 'QRIS / Transfer', desc: 'E-Wallet / Bank' }
    ];

    return (
        <div className="space-y-4">
            <span className="apple-caption text-[#7a7a7a] uppercase tracking-wider font-bold block">1. Pilih Metode Pembayaran</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {methodsList.map((m) => (
                    <button 
                        key={m.id}
                        onClick={() => setMethod(m.id as any)}
                        className={`flex flex-col items-center justify-center gap-2 p-5 rounded-[18px] border transition-all text-center cursor-pointer ${
                            method === m.id 
                                ? "bg-[#1d1d1f] text-white border-[#D4AF37] shadow-[0_8px_25px_rgba(212,175,55,0.25)] scale-[1.03]" 
                                : "bg-white border-[#e0e0e0] text-[#7a7a7a] hover:border-[#cccccc] hover:text-[#1d1d1f] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                        }`}
                    >
                        <div className={method === m.id ? "text-[#D4AF37]" : "text-[#7a7a7a]"}>
                            {m.icon}
                        </div>
                        <span className="apple-caption font-bold uppercase tracking-wider block">{m.label}</span>
                        <span className={`apple-fine-print ${method === m.id ? 'text-stone-300' : 'text-[#7a7a7a]'}`}>{m.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

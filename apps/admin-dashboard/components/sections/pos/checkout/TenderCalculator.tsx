"use client";

import React from "react";
import { Calculator, Delete } from "lucide-react";
import { formatIDR } from "@/lib/pnl-utils";

interface TenderCalculatorProps {
    cashReceived: string;
    setCashReceived: (val: string) => void;
    total: number;
    changeDue: number;
}

export const TenderCalculator: React.FC<TenderCalculatorProps> = ({
    cashReceived,
    setCashReceived,
    total,
    changeDue
}) => {
    const handleQuickCash = (amount: number) => {
        setCashReceived(amount.toString());
    };

    const handleKeypad = (digit: string) => {
        if (digit === "C") {
            setCashReceived("");
        } else if (digit === "BACK") {
            setCashReceived(cashReceived.slice(0, -1));
        } else {
            setCashReceived(cashReceived + digit);
        }
    };

    const quickButtons = [
        { label: "Uang Pas", val: total },
        { label: "Rp 50.000", val: 50000 },
        { label: "Rp 100.000", val: 100000 },
        { label: "Rp 150.000", val: 150000 },
        { label: "Rp 200.000", val: 200000 },
        { label: "Rp 500.000", val: 500000 },
        { label: "Rp 1.000k", val: 1000000 }
    ];

    const keypadButtons = [
        "7", "8", "9",
        "4", "5", "6",
        "1", "2", "3",
        "C", "0", "000"
    ];

    return (
        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#e0e0e0] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6 overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4">
                <div className="flex items-center gap-2 text-[#1d1d1f]">
                    <Calculator size={20} className="text-[#0066cc]" />
                    <span className="apple-body-strong uppercase tracking-wider font-bold text-sm">2. Kalkulasi Uang Tunai (Tender)</span>
                </div>
                <span className="apple-fine-print bg-[#fafafc] px-3.5 py-1.5 rounded-full border border-[#e0e0e0] font-bold text-[#7a7a7a] shadow-sm">IDR Currency</span>
            </div>

            {/* Tendered Amount Input Box */}
            <div className="space-y-2">
                <label className="apple-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold block">Jumlah Uang Diterima (Rp)</label>
                <div className="relative w-full group bg-white border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.04),_inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center h-16 rounded-[20px] focus-within:border-[#0066cc] focus-within:shadow-[0_0_20px_rgba(0,102,204,0.15)] transition-all overflow-hidden">
                    <input 
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder="0"
                        className="w-full h-full bg-transparent px-5 apple-display-md text-2xl font-bold text-[#1d1d1f] focus:outline-none"
                    />
                    <button 
                        type="button"
                        onClick={() => handleKeypad("BACK")}
                        className="h-full px-5 flex items-center justify-center text-[#7a7a7a] hover:text-[#ff3b30] bg-[#fafafc] border-l border-[#e0e0e0] transition-colors cursor-pointer"
                        title="Hapus Digit Terakhir"
                    >
                        <Delete size={20} />
                    </button>
                </div>
            </div>

            {/* Tablet-Friendly Calculator Keypad & Quick Cash (Grid 2 Kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-1">
                {/* Numeric Keypad (7 Kolom) */}
                <div className="md:col-span-7 space-y-3">
                    <span className="apple-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold block">Input Angka Kalkulator (Tablet Touch):</span>
                    <div className="grid grid-cols-3 gap-3">
                        {keypadButtons.map((btn, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleKeypad(btn)}
                                className={`h-14 rounded-[16px] font-bold text-lg flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-95 ${
                                    btn === "C" 
                                        ? "bg-[#ff3b30]/10 text-[#ff3b30] hover:bg-[#ff3b30]/20 border border-[#ff3b30]/30" 
                                        : "bg-[#fafafc] text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white border border-[#e0e0e0]"
                                }`}
                            >
                                {btn}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Cash Denominations (5 Kolom) */}
                <div className="md:col-span-5 space-y-3">
                    <span className="apple-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold block">Pecahan Cepat:</span>
                    <div className="flex flex-col gap-2.5">
                        {quickButtons.map((btn, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleQuickCash(btn.val)}
                                className="h-11 rounded-[14px] bg-[#fafafc] border border-[#e0e0e0] flex items-center justify-between px-4 font-medium text-xs text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white hover:border-[#1d1d1f] transition-all shadow-sm cursor-pointer"
                            >
                                <span className="font-semibold">{btn.label}</span>
                                <span className="apple-fine-print opacity-60">⚡</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Real-time Change Due Display */}
            <div className="pt-4 border-t border-[#f0f0f0] flex items-center justify-between bg-[#fafafc] p-5 rounded-[20px] border border-[#e0e0e0] shadow-sm">
                <span className="apple-body-strong text-[#7a7a7a] text-sm font-semibold">Uang Kembalian (Change Due):</span>
                <span className={`apple-display-md text-2xl font-bold ${changeDue > 0 ? 'text-[#0066cc]' : 'text-[#1d1d1f]'}`}>
                    {formatIDR(changeDue)}
                </span>
            </div>
        </div>
    );
};

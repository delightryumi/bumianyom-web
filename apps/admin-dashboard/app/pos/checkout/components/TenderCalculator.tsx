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
    const handleKeypad = (digit: string) => {
        if (digit === "CANCEL") {
            setCashReceived("");
        } else if (digit === "BACK") {
            setCashReceived(cashReceived.slice(0, -1));
        } else {
            setCashReceived(cashReceived + digit);
        }
    };

    const keypadRows = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        ["00", "0", "BACK"],
        [".", "CANCEL"]
    ];

    return (
        <div className="checkout-store-card space-y-4 overflow-hidden animate-in fade-in duration-300">
            {/* Tendered Amount Input Box (Clean Apple/Bagisto Reference Style - No Text Labels) */}
            <div className="relative w-full bg-white border border-[#94a3b8] shadow-sm flex items-center h-14 rounded-[8px] focus-within:border-[#10b981] focus-within:ring-1 focus-within:ring-[#10b981] transition-all overflow-hidden">
                <input 
                    type="text"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="0"
                    className="w-full h-full bg-transparent px-4 text-right text-2xl font-semibold text-[#1d1d1f] focus:outline-none tracking-tight"
                />
            </div>

            {/* Tablet-Friendly Calculator Keypad (Reference Image Grid Layout - No Text Labels) */}
            <div className="w-full pt-2">
                <div className="grid grid-cols-3 gap-2">
                    {keypadRows.flat().map((btn, idx) => {
                        if (btn === "BACK") {
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleKeypad(btn)}
                                    className="h-12 sm:h-14 rounded-[4px] bg-[#f4f5f8] hover:bg-[#e2e8f0] active:bg-[#cbd5e1] text-[#1d1d1f] flex items-center justify-center transition-all cursor-pointer"
                                    title="Hapus Digit Terakhir"
                                >
                                    <Delete size={20} className="text-[#1d1d1f]" />
                                </button>
                            );
                        }
                        if (btn === "CANCEL") {
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleKeypad(btn)}
                                    className="col-span-2 h-12 sm:h-14 rounded-[4px] bg-[#f4f5f8] hover:bg-[#e2e8f0] active:bg-[#cbd5e1] text-[#1d1d1f] font-bold text-lg flex items-center justify-center transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                            );
                        }
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleKeypad(btn)}
                                className="h-12 sm:h-14 rounded-[4px] bg-[#f4f5f8] hover:bg-[#e2e8f0] active:bg-[#cbd5e1] text-[#1d1d1f] font-bold text-lg flex items-center justify-center transition-all cursor-pointer"
                            >
                                {btn}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

"use client";

import React from "react";

interface CashierStatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    desc: string;
    highlight?: boolean;
    accent?: string;
}

export const StatCard: React.FC<CashierStatCardProps> = ({ 
    title, value, icon, desc, highlight, accent = "#0066cc" 
}) => {
    const activeAccent = highlight ? "#D4AF37" : accent; // Use gold if highlighted
    // Extract numerical value and format it without Rp inside the value prop for cleaner styling
    const cleanValue = typeof value === 'string' ? value.replace(/Rp\.?\s?/g, '').trim() : value;
    
    return (
        <div className="group relative flex flex-col gap-4 md:gap-6 p-5 md:p-6 rounded-xl bg-white border border-[#e0e0e0] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden cursor-default hover:border-[#cccccc]">
            {/* Background Blur */}
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-[0.06] blur-2xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none" style={{ backgroundColor: activeAccent }}></div>
            
            {/* Header (Icon & Title) */}
            <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-all group-hover:rotate-6 duration-500 flex-shrink-0"
                    style={{ backgroundColor: `${activeAccent}0D`, color: activeAccent, borderColor: `${activeAccent}1A` }}>
                    {icon}
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#7a7a7a] leading-tight block">
                    {title}
                </span>
            </div>
            
            {/* Body (Value & Desc) */}
            <div className="relative z-10 flex flex-col items-center justify-center py-2 text-center">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-[#7a7a7a]">Rp</span>
                    <p className="text-3xl font-medium tracking-tighter text-[#1d1d1f] transition-all duration-500">
                        {cleanValue}
                    </p>
                </div>
                <span className="mt-2 text-[9px] font-medium uppercase tracking-[0.1em] text-[#7a7a7a] opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                    {desc}
                </span>
                <div className="mt-4 w-12 h-0.5 rounded-full bg-stone-100 group-hover:w-20 transition-all duration-700" style={{ backgroundColor: `${activeAccent}30` }} />
            </div>
        </div>
    );
};

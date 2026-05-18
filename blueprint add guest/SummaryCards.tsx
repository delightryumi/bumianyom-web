"use client";

import React from "react";
import { 
  DollarSign, CreditCard, TrendingDown, Wallet, ArrowRightLeft, 
  Users, Globe, Building2, Sparkles, Activity
} from "lucide-react";
import { formatCurrency, SummaryResult } from "@/lib/finance-utils";

export default function SummaryCards({ data }: { data: SummaryResult }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      
      {/* 1. TOTAL OMZET */}
      <AestheticCard 
        label="Total Gross Revenue" 
        amount={data.gross} 
        icon={<DollarSign size={20} className="text-white" />} 
        theme="royal"
        subLabel="Revenue Murni Non-Cancel"
      />

      {/* 2. SALES HOTEL */}
      <AestheticCard 
        label="Sales (Pay at Hotel)" 
        amount={data.nexuraSalesCash} 
        icon={<Building2 size={20} className="text-white" />} 
        theme="emerald"
        subLabel="Cash In Hand"
      />

      {/* 3. SALES NEXURA */}
      <AestheticCard 
        label="Sales (Pay at Nexura)" 
        amount={data.nexuraSalesTransfer} 
        icon={<CreditCard size={20} className="text-white" />} 
        theme="violet"
        subLabel="Transfer In"
      />

      {/* 4. WALK-IN */}
      <AestheticCard 
        label="Walk-in Revenue" 
        amount={data.walkInTotal} 
        icon={<Users size={20} className="text-white" />} 
        theme="fuchsia"
        subLabel="Direct Guest"
      />

      {/* 5. OTA */}
      <AestheticCard 
        label="OTA Revenue (Net)" 
        amount={data.otaTotal} 
        icon={<Globe size={20} className="text-white" />} 
        theme="cyan"
        subLabel="Traveloka, Agoda, etc"
      />

      {/* 6. FEE */}
      <AestheticCard 
        label="Fee Management" 
        amount={data.fee} 
        icon={<Wallet size={20} className="text-white" />} 
        theme="gold"
        subLabel="Income Nexura"
      />

      {/* 7. GAP/LOSS */}
      <AestheticCard 
        label="Total Gap & Loss" 
        amount={Math.abs(data.totalGap)} 
        prefix={data.totalGap < 0 ? "-" : ""}
        icon={<TrendingDown size={20} className="text-white" />} 
        theme="rose"
        subLabel="Potongan / Selisih"
        isNegative={data.totalGap < 0}
      />

      {/* 8. RECONCILE - Tetap Spesial (Gelap/Solid) */}
      <AestheticCard 
        label="Final Reconcile" 
        amount={Math.abs(data.finalReconcile)} 
        prefix={data.finalReconcile < 0 ? "-" : ""}
        icon={<ArrowRightLeft size={20} className="text-white" />} 
        theme={data.finalReconcile >= 0 ? "tealDark" : "roseDark"}
        subLabel={data.finalReconcile >= 0 ? "Nexura Bayar ke Owner" : "Owner Setor ke Nexura"}
        highlight={true}
      />

    </div>
  );
}

// --- INTERNAL COMPONENT: AESTHETIC LUXURY CARD ---

interface AestheticCardProps {
  label: string;
  amount: number;
  icon: React.ReactNode;
  theme: 'royal' | 'emerald' | 'violet' | 'fuchsia' | 'cyan' | 'gold' | 'rose' | 'tealDark' | 'roseDark';
  subLabel?: string;
  prefix?: string;
  isNegative?: boolean;
  highlight?: boolean;
}

function AestheticCard({ label, amount, icon, theme, subLabel, prefix = "", isNegative, highlight }: AestheticCardProps) {
  
  // Font Sizing Logic
  const amountString = Math.abs(amount).toString();
  const digitCount = amountString.length;
  let fontSizeClass = "text-2xl"; 
  if (digitCount > 9) fontSizeClass = "text-xl"; 
  else if (digitCount > 12) fontSizeClass = "text-lg";

  // Theme Configurations
  // PERUBAHAN: textGradient untuk kartu biasa diganti menjadi warna solid (text-slate-800)
  const themes = {
    royal: {
      bg: "bg-white",
      border: "border-indigo-50",
      shadow: "shadow-indigo-100/50",
      iconGradient: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-300/50",
      textClass: "text-slate-800", // Hitam
      glow: "bg-indigo-500/5",
    },
    emerald: {
      bg: "bg-white",
      border: "border-emerald-50",
      shadow: "shadow-emerald-100/50",
      iconGradient: "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-300/50",
      textClass: "text-slate-800", // Hitam
      glow: "bg-emerald-500/5",
    },
    violet: {
      bg: "bg-white",
      border: "border-violet-50",
      shadow: "shadow-violet-100/50",
      iconGradient: "bg-gradient-to-br from-violet-400 to-purple-600 shadow-violet-300/50",
      textClass: "text-slate-800", // Hitam
      glow: "bg-violet-500/5",
    },
    fuchsia: {
      bg: "bg-white",
      border: "border-fuchsia-50",
      shadow: "shadow-fuchsia-100/50",
      iconGradient: "bg-gradient-to-br from-fuchsia-400 to-pink-600 shadow-fuchsia-300/50",
      textClass: "text-slate-800", // Hitam
      glow: "bg-fuchsia-500/5",
    },
    cyan: {
      bg: "bg-white",
      border: "border-cyan-50",
      shadow: "shadow-cyan-100/50",
      iconGradient: "bg-gradient-to-br from-cyan-400 to-sky-600 shadow-cyan-300/50",
      textClass: "text-slate-800", // Hitam
      glow: "bg-cyan-500/5",
    },
    gold: {
      bg: "bg-white",
      border: "border-amber-50",
      shadow: "shadow-amber-100/50",
      iconGradient: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-300/50",
      textClass: "text-slate-800", // Hitam
      glow: "bg-amber-500/5",
    },
    rose: {
      bg: "bg-white",
      border: "border-rose-50",
      shadow: "shadow-rose-100/50",
      iconGradient: "bg-gradient-to-br from-rose-400 to-red-600 shadow-rose-300/50",
      textClass: "text-slate-800", // Hitam
      glow: "bg-rose-500/5",
    },
    // Dark/Solid Themes for Highlight (Tetap Putih)
    tealDark: {
      bg: "bg-gradient-to-br from-teal-600 to-emerald-700",
      border: "border-teal-500",
      shadow: "shadow-teal-200/50",
      iconGradient: "bg-white/20 backdrop-blur-md text-white shadow-none",
      textClass: "text-white", // Tetap Putih
      glow: "bg-white/10",
    },
    roseDark: {
      bg: "bg-gradient-to-br from-rose-600 to-red-700",
      border: "border-rose-500",
      shadow: "shadow-rose-200/50",
      iconGradient: "bg-white/20 backdrop-blur-md text-white shadow-none",
      textClass: "text-white", // Tetap Putih
      glow: "bg-white/10",
    }
  };

  const currentTheme = themes[theme];
  const isDark = theme === 'tealDark' || theme === 'roseDark';

  return (
    <div className={`
      relative p-6 rounded-[1.75rem] transition-all duration-500 group
      border ${currentTheme.border} ${currentTheme.bg}
      shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]
      hover:-translate-y-1.5 overflow-hidden
    `}>
      
      {/* 1. Ambient Background Glow */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-50 ${currentTheme.glow} transition-transform duration-700 group-hover:scale-150`}></div>
      <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-30 ${currentTheme.glow}`}></div>

      <div className="relative z-10 flex flex-col h-full justify-between gap-5">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                {!isDark && <div className={`w-1 h-3 rounded-full ${currentTheme.iconGradient.split(' ')[1].replace('from-', 'bg-')}`}></div>}
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/80' : 'text-slate-400'}`}>
                  {label}
                </p>
             </div>
             {subLabel && (
                <p className={`text-[10px] font-medium ml-3 ${isDark ? 'text-white/60' : 'text-slate-400/80'}`}>
                  {subLabel}
                </p>
             )}
          </div>
          
          <div className={`
            w-10 h-10 rounded-2xl flex items-center justify-center
            ${currentTheme.iconGradient} shadow-lg
            transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110
          `}>
            {icon}
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-1">
          <div className="flex items-baseline gap-1">
            <span className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-slate-400'} mb-1`}>Rp</span>
            {/* Menggunakan textClass (Warna Solid) */}
            <span className={`font-black tracking-tight leading-none ${currentTheme.textClass} ${fontSizeClass}`}>
              {prefix}{new Intl.NumberFormat("id-ID").format(Math.abs(amount))}
            </span>
          </div>
          
          {/* Decorative Indicator Line */}
          {!isDark && (
             <div className="w-12 h-1 rounded-full bg-slate-100 mt-3 overflow-hidden">
                <div className={`h-full rounded-full w-2/3 ${currentTheme.iconGradient.split(' ')[1].replace('from-', 'bg-')} opacity-80 group-hover:w-full transition-all duration-700 ease-out`}></div>
             </div>
          )}
          {isDark && (
             <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-white/90 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                <Sparkles size={10} className="text-yellow-200" />
                <span>Verified Reconcile</span>
             </div>
          )}
        </div>

      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
    </div>
  );
}
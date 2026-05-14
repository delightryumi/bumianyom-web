import React from "react";
import { formatIDR } from "@/lib/pnl-utils";
import { LucideIcon } from "lucide-react";

interface LuxuryCardProps {
  label: string;
  value?: number;
  displayValue?: string;
  icon: React.ElementType; 
  color?: "blue" | "emerald" | "rose" | "amber" | "violet" | "cyan" | "slate" | "orange" | "indigo" | "teal";
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void; 
  info?: string;
}

export function LuxuryCard({ 
  label, 
  value, 
  displayValue,
  icon: Icon, 
  color = "slate",
  children,
  className,
  onClick,
  info
}: LuxuryCardProps) {
  
  // --- COLOR THEMES ---
  const themes = {
    blue:    "bg-white border-zinc-100 text-slate-900",
    emerald: "bg-white border-zinc-100 text-slate-900",
    rose:    "bg-white border-zinc-100 text-slate-900",
    amber:   "bg-white border-zinc-100 text-slate-900",
    violet:  "bg-white border-zinc-100 text-slate-900",
    cyan:    "bg-white border-zinc-100 text-slate-900",
    orange:  "bg-white border-zinc-100 text-slate-900",
    indigo:  "bg-white border-zinc-100 text-slate-900",
    teal:    "bg-white border-zinc-100 text-slate-900",
    slate:   "bg-white border-zinc-100 text-slate-900",
  };

  const iconColors = {
    blue:    "text-blue-500",
    emerald: "text-emerald-500",
    rose:    "text-rose-500",
    amber:   "text-amber-500",
    violet:  "text-violet-500",
    cyan:    "text-cyan-500",
    orange:  "text-orange-500",
    indigo:  "text-indigo-500",
    teal:    "text-teal-500",
    slate:   "text-slate-400",
  };

  const themeClass = themes[color];
  const iconClass = iconColors[color];

  const formattedValue = displayValue 
    ? displayValue 
    : (value !== undefined ? formatIDR(value).replace("Rp ", "") : "0");

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-[2rem] p-6 
        border transition-all duration-300 ease-out 
        hover:border-slate-300 pnl-card-hover
        group min-h-[140px] flex flex-col justify-between
        ${themeClass} 
        ${onClick ? "cursor-pointer active:scale-95" : ""} 
        ${className}
      `}
    >
      <div className={`absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 ${iconClass}`}>
        <Icon strokeWidth={0.5} size={160} />
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                {label}
              </span>
              {info && (
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-semibold bg-slate-50 border border-slate-100 uppercase tracking-widest ${iconClass}`}>
                  {info}
                </span>
              )}
            </div>
        </div>
        <div className={`p-2 rounded-xl bg-slate-50 border border-slate-100 ${iconClass} group-hover:bg-slate-900 group-hover:text-white transition-all duration-300`}>
           <Icon size={16} strokeWidth={2} />
        </div>
      </div>

      <div className="relative z-10 mt-4">
        {children ? children : (
          <div className="flex items-baseline gap-1">
             {value !== undefined && !displayValue && <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-tighter">Rp</span>}
             <h3 className="text-2xl lg:text-3xl font-semibold tracking-tighter font-outfit truncate leading-none text-slate-900" title={formattedValue}>
               {formattedValue}
             </h3>
          </div>
        )}
      </div>
      
      <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-slate-900 group-hover:w-full transition-all duration-500`}></div>
    </div>
  );
}
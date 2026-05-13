"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Wifi, ArrowLeft, Sparkles, PlusCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/* ── Brand Colors ── */
const SAGE = "#788069";

export const StatusWidget = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getGreeting = () => {
        const hour = time.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    // Special Header for Add Transaction Page (Navigation only, Publish moved to sidebar)
    if (pathname === "/forecast/add") {
        return (
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => router.push("/forecast")}
                        className="flex items-center gap-2.5 text-stone-400 hover:text-stone-900 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-stone-100 group-hover:bg-stone-50 transition-all">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Forecast</span>
                    </button>
                    <div className="h-6 w-px bg-stone-200" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Sparkles size={8} style={{ color: SAGE }} />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: SAGE }}>Nexura Hub</span>
                        </div>
                        <h1 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.15em]">Publish New Entry</h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end border-stone-100 pr-0 mr-0">
                         <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-1">System Status</span>
                         <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Live Synchronization</span>
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="status-widget-container">
            <div className="status-info">
                <div className="greeting-pill">
                    <span className="greeting-text">{getGreeting()}</span>
                </div>

                <div className="date-time-cluster">
                    <div className="time-display">
                        <Clock size={14} className="text-sage/60" />
                        <span>{formatTime(time)}</span>
                    </div>
                    <div className="divider-dot" />
                    <div className="date-display">
                        <Calendar size={14} className="text-sage/60" />
                        <span>{formatDate(time)}</span>
                    </div>
                </div>
            </div>

            <div className="system-status">
                <div className="status-indicator">
                    <div className="pulse-dot" />
                    <span className="status-text">System Live</span>
                </div>
                <Wifi size={14} className="text-sage/40" />
            </div>
        </div>
    );
};

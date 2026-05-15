"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, Calendar, Wifi, ArrowLeft, Sparkles, PlusCircle, Menu, User as UserIcon, Maximize2, Minimize2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/* ── Brand Colors ── */
const SAGE = "#788069";

interface StatusWidgetProps {
    onMenuClick?: () => void;
    isCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export const StatusWidget = ({ onMenuClick, isCollapsed, onToggleSidebar }: StatusWidgetProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [time, setTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const userName = user?.displayName || user?.email?.split('@')[0] || "Administrator";

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener('fullscreenchange', handleFsChange);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

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
                        onClick={() => router.push("/overview")}
                        className="flex items-center gap-2.5 text-stone-400 hover:text-stone-900 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-stone-100 group-hover:bg-stone-50 transition-all">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Dashboard</span>
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
        <div className="status-widget-container relative flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0">
                <button 
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-stone-300 hover:text-white transition-colors flex-shrink-0"
                >
                    <Menu size={22} />
                </button>
                
                {/* Left Side: Greeting on Top, Time/Date Stacked Below */}
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="mb-0.5">
                        <span className="greeting-text text-[9px] sm:text-[11px] whitespace-nowrap text-white">{getGreeting()}</span>
                    </div>

                    <div className="date-time-stack flex flex-col gap-0.5">
                        <div className="time-display flex items-center gap-1.5 text-[10px] sm:text-[13px] font-bold text-white leading-none">
                            <Clock size={12} className="text-peach/60" />
                            <span className="tabular-nums">{formatTime(time)}</span>
                        </div>
                        <div className="date-display flex items-center gap-1.5 text-[8px] sm:text-[11px] font-medium text-white/50 whitespace-nowrap leading-none">
                            <Calendar size={11} className="text-peach/50" />
                            <span>{formatDate(time)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center: Nexura Branding Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
                <img 
                    src="/channels/nexura-logo.png" 
                    alt="Nexura Logo" 
                    className="h-18 w-auto object-contain opacity-100 transition-opacity cursor-default"
                />
            </div>

            {/* Right Side: Identity & Status Stack */}
            <div className="flex items-center gap-6 flex-shrink-0">
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 px-1 py-1">
                        <UserIcon size={10} className="text-peach" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-white whitespace-nowrap">{userName}</span>
                    </div>
                    
                    <div className="system-status flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="pulse-dot w-1.5 h-1.5 sm:w-2 sm:h-2" />
                            <span className="status-text text-[8px] sm:text-[10px] text-white font-bold uppercase tracking-widest">System Live</span>
                        </div>
                        <Wifi size={14} className="text-white/20 hidden xs:block" />
                    </div>
                </div>

                {/* Far Right: Full View Toggle (Center Piece) */}
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={toggleFullscreen}
                    className="hidden lg:flex items-center justify-center w-11 h-11 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-emerald-400 hover:bg-emerald-400/20 transition-all shadow-md relative overflow-hidden group"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    <div className="absolute inset-0 bg-emerald-400/20 animate-ping opacity-40 pointer-events-none" />
                    {isFullscreen ? <Minimize2 size={18} className="relative z-10" /> : <Maximize2 size={18} className="relative z-10" />}
                </motion.button>
            </div>
        </div>
    );
};

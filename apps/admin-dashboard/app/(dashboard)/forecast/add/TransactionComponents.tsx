"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, BedDouble, Home, Calendar as CalendarIcon, User, Package } from "lucide-react";
import { CHANNELS } from "./useTransactionForm";

export const SectionTitle = ({ number, label }: { number: string; label: string }) => (
    <div className="flex flex-col mb-20 -mx-8 overflow-hidden">
        <div className="flex items-center gap-0 bg-sage h-7 shadow-md relative z-10 w-full">
            <div className="w-10 h-full bg-black/10 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                {number}
            </div>
            <div className="px-8 flex-1">
                <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white leading-none">{label}</h2>
            </div>
        </div>
        <div className="relative h-[3px] w-full bg-stone-100/10 overflow-hidden mt-6">
            <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "250%" }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-sage/30 to-transparent w-full"
            />
        </div>
    </div>
);

// --- Custom Calendar Component ---
const CustomCalendar = ({ value, onChange, colorClass, onClose, accentColor }: any) => {
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    const days = [];
    // Pad for first day of week
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const changeMonth = (offset: number) => {
        setViewDate(new Date(year, month + offset, 1));
    };

    const isToday = (d: number) => {
        const today = new Date();
        return today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
    };

    const isSelected = (d: number) => {
        if (!value) return false;
        const sel = new Date(value);
        return sel.getDate() === d && sel.getMonth() === month && sel.getFullYear() === year;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-0 right-0 bg-white border border-stone-100 shadow-2xl rounded-2xl p-5 z-[100] min-w-[300px]"
        >
            <div className="flex items-center justify-between mb-6">
                <button type="button" onClick={() => changeMonth(-1)} className="p-2 hover:bg-stone-50 rounded-lg text-stone-400"><ChevronLeft size={16} /></button>
                <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-900">{monthNames[month]}</span>
                    <span className="text-[9px] font-medium text-stone-300 uppercase tracking-widest">{year}</span>
                </div>
                <button type="button" onClick={() => changeMonth(1)} className="p-2 hover:bg-stone-50 rounded-lg text-stone-400"><ChevronRight size={16} /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(d => (
                    <div key={d} className="text-[8px] font-bold text-stone-300 uppercase text-center py-2">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} />;
                    const selected = isSelected(day);
                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => {
                                const newDate = new Date(year, month, day);
                                newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
                                onChange(newDate.toISOString().split('T')[0]);
                                onClose();
                            }}
                            className={`h-9 w-full rounded-lg text-[10px] font-bold transition-all flex items-center justify-center
                                ${selected ? `${accentColor} text-white shadow-lg` : 'hover:bg-stone-50 text-stone-600'}
                                ${isToday(day) && !selected ? 'border border-stone-200' : ''}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export function ChannelSelect({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedChannel = CHANNELS.find(c => c.name === value) || CHANNELS[CHANNELS.length - 1];

    return (
        <div className="relative">
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 bg-stone-100/80 transition-all rounded-lg border border-stone-200 flex items-center justify-between hover:border-stone-400 group px-6 text-left"
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-6 h-6 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100">
                        <img src={selectedChannel.logo} alt="" className="max-w-[16px] max-h-[16px] object-contain" />
                    </div>
                    <span className="text-[12px] font-medium uppercase tracking-widest text-stone-800">{selectedChannel.name}</span>
                </div>
                <ChevronRight size={14} className={`text-stone-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full mt-2 left-0 right-0 bg-white border border-stone-100 shadow-2xl rounded-xl p-2 z-50 flex flex-col gap-1 max-h-96 overflow-y-auto custom-scrollbar"
                        >
                            {CHANNELS.map((channel) => (
                                <button
                                    key={channel.name}
                                    type="button"
                                    onClick={() => {
                                        onChange(channel.name);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-lg transition-all text-left group ${value === channel.name ? 'bg-sage text-white' : 'hover:bg-sage hover:text-white text-stone-600'}`}
                                >
                                    <div className={`w-6 h-6 flex items-center justify-center transition-all ${value === channel.name ? 'grayscale-0' : 'grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100 group-hover:brightness-[10]'}`}>
                                        <img src={channel.logo} alt="" className="max-w-[16px] max-h-[16px] object-contain" />
                                    </div>
                                    <span className="text-[12px] font-medium uppercase tracking-widest">{channel.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export function RoomTypeSelect({ value, options, onChange }: { value: string, options: any[], onChange: (v: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(o => o.id === value);

    return (
        <div className="relative">
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 bg-stone-100/80 transition-all rounded-lg border border-stone-200 flex items-center justify-between hover:border-stone-400 group px-6 text-left"
            >
                <div className="flex items-center gap-4 flex-1">
                    <BedDouble size={18} className="text-stone-300 group-hover:text-sage transition-colors" />
                    <span className="text-[12px] font-medium uppercase tracking-widest text-stone-800 truncate">
                        {selected?.name || 'Pilih Tipe Kamar'}
                    </span>
                </div>
                <ChevronRight size={14} className={`text-stone-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full mt-2 left-0 right-0 bg-white border border-stone-100 shadow-2xl rounded-xl p-2 z-50 flex flex-col gap-1 max-h-96 overflow-y-auto custom-scrollbar"
                        >
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-lg transition-all text-left group ${value === option.id ? 'bg-sage text-white' : 'hover:bg-sage hover:text-white text-stone-600'}`}
                                >
                                    <BedDouble size={16} className={value === option.id ? 'text-white' : 'text-stone-300 group-hover:text-white'} />
                                    <span className="text-[12px] font-medium uppercase tracking-widest">{option.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export function OtherIncomeTypeSelect({ value, options, onChange }: { value: string, options: string[], onChange: (v: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 bg-stone-100/80 transition-all rounded-lg border border-stone-200 flex items-center justify-between hover:border-stone-400 group px-6 text-left"
            >
                <div className="flex items-center gap-4 flex-1">
                    <Package size={18} className="text-stone-300 group-hover:text-sage transition-colors" />
                    <span className="text-[12px] font-medium uppercase tracking-widest text-stone-800 truncate">
                        {value || 'Pilih Tipe Transaksi'}
                    </span>
                </div>
                <ChevronRight size={14} className={`text-stone-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full mt-2 left-0 right-0 bg-white border border-stone-100 shadow-2xl rounded-xl p-2 z-50 flex flex-col gap-1 max-h-96 overflow-y-auto custom-scrollbar"
                        >
                            {options.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-lg transition-all text-left group ${value === option ? 'bg-sage text-white' : 'hover:bg-sage hover:text-white text-stone-600'}`}
                                >
                                    <Package size={16} className={value === option ? 'text-white' : 'text-stone-300 group-hover:text-white'} />
                                    <span className="text-[12px] font-medium uppercase tracking-widest">{option}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export const NexuraInput = ({ label, value, onChange, placeholder, type = "text", isAmount = false, icon: Icon, disabled = false }: any) => {
    return (
        <div className={`space-y-1 ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            {label && <label className="text-label">{label}</label>}
            <div className="nexura-input-wrapper group">
                <div className="flex items-center px-6 h-12 gap-4">
                    {Icon && <Icon size={18} className="text-stone-300 group-focus-within:text-sage transition-colors" />}
                    <div className="flex-1 flex items-center">
                        {isAmount && <span className="text-[12px] font-bold text-stone-300 mr-2">RP</span>}
                        <input
                            type={type}
                            value={value ?? ""}
                            onChange={e => onChange(e.target.value)}
                            onWheel={(e) => (e.target as HTMLElement).blur()}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="nexura-input-field !h-12"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TypeCard = ({ label, description, icon: Icon, onClick }: any) => (
    <button 
        onClick={onClick} 
        className="group relative bg-white px-10 py-12 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-xl hover:border-sage/40 transition-all duration-300 text-center flex flex-col items-center justify-between h-[360px] w-full overflow-hidden"
    >
        {/* Icon Container - Perfectly Centered */}
        <div className="flex flex-col items-center gap-6 mt-4">
            <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:bg-sage group-hover:text-white transition-all duration-300 shadow-sm">
                <Icon size={32} strokeWidth={1.5} />
            </div>
            
            <div className="space-y-1.5">
                <h3 className="text-[20px] font-bold text-stone-900 uppercase tracking-[0.1em] leading-none">{label}</h3>
                <p className="text-stone-400 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-60">
                    {description}
                </p>
            </div>
        </div>

        {/* Footer Action - Tighter and More Precise */}
        <div className="w-full pt-8 border-t border-stone-50/50">
            <div className="flex items-center justify-center gap-3 text-stone-300 group-hover:text-sage transition-all duration-300">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Open Terminal</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
        
        {/* Subtle hover accent line at the bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-sage group-hover:w-full transition-all duration-500" />
    </button>
);

export const DateCard = ({ label, value, onChange, type }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const isCheckIn = type === "check-in";
    const colorClass = isCheckIn ? "text-sage" : "text-orange-600";
    const bgClass = isCheckIn ? "bg-[#788069]/5" : "bg-[#FFF7ED]";
    const borderClass = isCheckIn ? "border-sage/10" : "border-orange-100";
    const accentClass = isCheckIn ? "bg-sage" : "bg-orange-300";

    const formattedDate = value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Set Date';

    return (
        <div className="space-y-1 flex-1 relative">
            <label className="text-label">{label}</label>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full relative transition-all rounded-xl border ${borderClass} h-12 overflow-hidden flex items-center shadow-sm hover:shadow-md ${bgClass} group`}
            >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentClass}`} />
                <div className="flex items-center h-full px-5 pl-6 gap-3 flex-1 relative">
                    <CalendarIcon size={16} className={`${colorClass} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    <div className={`text-[12px] font-bold ${colorClass} uppercase tracking-widest`}>
                        {formattedDate}
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
                        <CustomCalendar 
                            value={value} 
                            onChange={onChange} 
                            colorClass={colorClass} 
                            onClose={() => setIsOpen(false)}
                            accentColor={accentClass}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

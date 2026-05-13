"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import { CHANNELS, SAGE } from "./useTransactionForm";

export function SectionTitle({ number, label }: { number: string, label: string }) {
    return (
        <div className="flex items-center gap-6 mb-10">
            <span className="text-[10px] font-bold text-sage bg-sage/5 px-2 py-1">{number}</span>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.3em] text-stone-900 font-outfit">{label}</h2>
            <div className="h-[1px] bg-stone-100 flex-1" />
        </div>
    );
}

export function ChannelSelect({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedChannel = CHANNELS.find(c => c.name === value) || CHANNELS[CHANNELS.length - 1];

    return (
        <div className="relative">
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 px-8 bg-white transition-all rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100/50 flex items-center justify-between hover:border-sage group"
            >
                <div className="flex items-center gap-5">
                    <div className="w-8 h-8 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100">
                        <img src={selectedChannel.logo} alt="" className="max-w-[20px] max-h-[20px] object-contain" />
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-widest text-stone-800">{selectedChannel.name}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronRight size={14} className="rotate-90 text-stone-300" />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-14 left-0 right-0 bg-white border border-stone-100 shadow-2xl rounded-2xl p-2 z-50 flex flex-col gap-1 max-h-72 overflow-y-auto custom-scrollbar"
                        >
                            {CHANNELS.map((channel) => (
                                <button
                                    key={channel.name}
                                    type="button"
                                    onClick={() => {
                                        onChange(channel.name);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center gap-5 px-6 py-3 rounded-xl transition-all text-left group ${value === channel.name ? 'bg-sage/5 text-sage' : 'hover:bg-stone-50 text-stone-600'}`}
                                >
                                    <div className={`w-8 h-8 flex items-center justify-center transition-all ${value === channel.name ? 'grayscale-0' : 'grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100'}`}>
                                        <img src={channel.logo} alt="" className="max-w-[20px] max-h-[20px] object-contain" />
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-widest">{channel.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export function NexuraInput({ label, type = "text", value, onChange, isAmount = false }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">{label}</label>
            <div className="relative group luxury-input bg-white transition-all overflow-hidden rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100/50 focus-within:border-sage focus-within:shadow-md">
                <input
                    type={type} 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    className={`w-full h-12 px-6 bg-transparent outline-none text-[12px] ${isAmount ? 'font-mono-jb font-bold transaction-input' : 'font-medium'} tracking-widest text-stone-800`}
                />
            </div>
        </div>
    );
}

export function TypeCard({ label, description, icon, onClick, comingSoon = false }: any) {
    return (
        <button 
            onClick={onClick}
            disabled={comingSoon}
            className={`group p-10 aspect-square text-center flex flex-col items-center justify-center transition-all relative overflow-hidden rounded-[40px] ${comingSoon ? 'bg-stone-50/50 cursor-not-allowed opacity-50' : 'bg-white hover:bg-stone-50/30 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-2'}`}
        >
            <div className={`mb-8 w-20 h-20 flex items-center justify-center transition-all rounded-full ${comingSoon ? 'text-stone-200 bg-stone-50' : 'text-sage bg-sage/5 group-hover:bg-sage group-hover:text-white'}`}>
                {React.cloneElement(icon as React.ReactElement, { size: 32 })}
            </div>
            <div className="space-y-4 px-6">
                <div className="flex flex-col items-center gap-2">
                    <h3 className={`text-[18px] font-bold uppercase tracking-[0.2em] ${comingSoon ? 'text-stone-300' : 'text-stone-900'}`}>{label}</h3>
                    {comingSoon && <span className="px-3 py-1 bg-stone-100 text-[9px] font-bold uppercase text-stone-400 tracking-[0.2em] rounded-full">Coming Soon</span>}
                </div>
                <p className={`text-[10px] font-normal uppercase tracking-[0.3em] leading-loose max-w-[240px] mx-auto ${comingSoon ? 'text-stone-200' : 'text-stone-400 opacity-80'}`}>
                    {description}
                </p>
            </div>
            {!comingSoon && (
                <div className="mt-8 text-sage opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                    <ArrowRight size={24} />
                </div>
            )}
        </button>
    );
}

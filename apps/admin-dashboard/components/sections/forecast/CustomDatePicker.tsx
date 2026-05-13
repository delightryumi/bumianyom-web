"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const MONTHS_ID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/* ── Daily Calendar ── */
function DailyCalendar({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(value ? parseInt(value.split("-")[0]) : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(value ? parseInt(value.split("-")[1]) - 1 : today.getMonth());

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);

    const selectedStr = value;

    const handleDay = (day: number) => {
        const m = String(viewMonth + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        onChange(`${viewYear}-${m}-${d}`);
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const isSel = (day: number) => {
        const m = String(viewMonth + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return selectedStr === `${viewYear}-${m}-${d}`;
    };
    const isToday = (day: number) => {
        return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
    };

    return (
        <div className="w-[300px] p-4">
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-800">
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-stone-800">
                    {MONTHS_ID[viewMonth]} {viewYear}
                </span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-800">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS_SHORT.map(d => (
                    <div key={d} className="text-center text-[10px] font-medium text-stone-400 py-1">{d}</div>
                ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, i) => (
                    <div key={i} className="flex items-center justify-center">
                        {day ? (
                            <button
                                onClick={() => handleDay(day)}
                                className={`w-9 h-9 rounded-lg text-xs font-medium transition-all duration-150 ${
                                    isSel(day)
                                        ? "bg-stone-900 text-white shadow-sm"
                                        : isToday(day)
                                            ? "border border-stone-300 text-stone-800 hover:bg-stone-100"
                                            : "text-stone-700 hover:bg-stone-100"
                                }`}
                            >
                                {day}
                            </button>
                        ) : <div className="w-9 h-9" />}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Monthly Calendar ── */
function MonthlyCalendar({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(value ? parseInt(value.split("-")[0]) : today.getFullYear());
    const selectedStr = value;

    const handleMonth = (monthIndex: number) => {
        const m = String(monthIndex + 1).padStart(2, "0");
        onChange(`${viewYear}-${m}`);
    };

    const isSel = (monthIndex: number) => {
        const m = String(monthIndex + 1).padStart(2, "0");
        return selectedStr === `${viewYear}-${m}`;
    };
    const isCurrentMonth = (monthIndex: number) => {
        return today.getFullYear() === viewYear && today.getMonth() === monthIndex;
    };

    return (
        <div className="w-[280px] p-4">
            {/* Year Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setViewYear(y => y - 1)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-800">
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-stone-800">{viewYear}</span>
                <button onClick={() => setViewYear(y => y + 1)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-800">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-2">
                {MONTHS_ID.map((name, i) => (
                    <button
                        key={name}
                        onClick={() => handleMonth(i)}
                        className={`py-2.5 px-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                            isSel(i)
                                ? "bg-stone-900 text-white shadow-sm"
                                : isCurrentMonth(i)
                                    ? "border border-stone-300 text-stone-800 hover:bg-stone-100"
                                    : "text-stone-600 hover:bg-stone-100"
                        }`}
                    >
                        {name.slice(0, 3)}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ── Main Custom Date Picker ── */
interface CustomDatePickerProps {
    mode: "daily" | "monthly";
    value: string;
    onChange: (v: string) => void;
    formatDisplay: (v: string) => string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ mode, value, onChange, formatDisplay }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleChange = (v: string) => {
        onChange(v);
        if (mode === "daily") setOpen(false);
    };

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center justify-center gap-3 h-10 px-4 rounded-lg border bg-white cursor-pointer transition-all duration-300 min-w-[180px] text-left ${
                    open
                        ? "border-stone-400 ring-2 ring-stone-200/70"
                        : "border-stone-200 hover:border-stone-300"
                }`}
            >
                <Calendar size={14} className="text-stone-400 flex-shrink-0" />
                <span className="text-[13px] font-medium text-stone-700 whitespace-nowrap">
                    {formatDisplay(value)}
                </span>
            </button>

            {/* Dropdown Calendar */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-0 top-[calc(100%+8px)] z-50 bg-white rounded-2xl border border-stone-100 shadow-2xl shadow-stone-300/30 overflow-hidden"
                    >
                        {mode === "daily" ? (
                            <DailyCalendar value={value} onChange={handleChange} />
                        ) : (
                            <MonthlyCalendar value={value} onChange={handleChange} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

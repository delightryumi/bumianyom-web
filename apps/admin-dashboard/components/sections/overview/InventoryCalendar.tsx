"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon, 
    Users 
} from "lucide-react";
import { 
    format, 
    addDays, 
    subMonths, 
    addMonths, 
    isSameDay,
    startOfDay 
} from "date-fns";

export function InventoryCalendar({ 
    data, 
    roomTypes = [], 
    totalRooms, 
    onDateSelect,
    onCellClick
}: { 
    data: any[], 
    roomTypes?: any[], 
    totalRooms: number, 
    onDateSelect?: (date: string) => void,
    onCellClick?: (bookings: any[], date: string, typeName: string) => void
}) {
    const [viewDate, setViewDate] = React.useState(new Date());

    const days = React.useMemo(() => {
        return Array.from({ length: 14 }, (_, i) => addDays(startOfDay(viewDate), i));
    }, [viewDate]);

    const handlePrevMonth = () => setViewDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setViewDate(prev => addMonths(prev, 1));
    const handleToday = () => setViewDate(new Date());

    return (
        <div className="bg-white rounded-[24px] border border-stone-100 shadow-xl overflow-hidden mb-12">
            {/* Header - Sage Aesthetic */}
            <div className="p-6 md:p-8 border-b border-stone-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-stone-50/20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#788069] text-white flex items-center justify-center rounded-xl shadow-lg shadow-[#788069]/20">
                        <CalendarIcon size={18} />
                    </div>
                    <div>
                        <h2 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.2em] mb-0.5">Inventory Control</h2>
                        <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Real-time Allotment Sync</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-stone-100 shadow-sm">
                    <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-all">
                        <ChevronLeft size={16} />
                    </button>
                    <div className="px-4 text-center min-w-[140px]">
                        <p className="text-[10px] font-bold text-stone-900 uppercase tracking-widest font-outfit">
                            {format(viewDate, 'MMMM yyyy')}
                        </p>
                    </div>
                    <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-all">
                        <ChevronRight size={18} />
                    </button>
                    <div className="w-[1px] h-4 bg-stone-100 mx-1" />
                    <button onClick={handleToday} className="px-4 py-1.5 text-[9px] font-bold text-[#788069] uppercase tracking-widest hover:bg-[#788069]/5 rounded-lg transition-all">
                        Today
                    </button>
                </div>
            </div>

            {/* Professional Inventory Grid */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 bg-stone-50 p-6 border-b border-r border-stone-100 min-w-[200px] text-left">
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Room Type</p>
                            </th>
                            {days.map((day, idx) => (
                                <th key={idx} className={`p-4 border-b border-stone-100 min-w-[100px] text-center ${isSameDay(day, new Date()) ? 'bg-[#788069]/5' : 'bg-white'}`}>
                                    <p className="text-[8px] font-black text-stone-300 uppercase tracking-tighter mb-0.5">{format(day, 'EEE')}</p>
                                    <p className="text-[14px] font-bold text-stone-900 font-outfit">{format(day, 'dd')}</p>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {roomTypes.map((type: any, tIdx: number) => (
                            <tr key={tIdx} className="group hover:bg-stone-50/50 transition-all">
                                <td className="sticky left-0 z-10 bg-white group-hover:bg-stone-50 p-6 border-b border-r border-stone-100 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[11px] font-bold text-stone-900 uppercase tracking-tight">{type.name}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            <p className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">{type.allotment} Total</p>
                                        </div>
                                    </div>
                                </td>
                                {days.map((day, dIdx) => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    
                                    const allEntries = data.flatMap(d => (d.entries || []).map((e: any) => ({ ...e, _docId: d.id })));
                                    
                                    const bookingsInCell = allEntries.filter((e: any, idx: number, self: any[]) => {
                                        const isSameBooking = self.findIndex(t => t.timestamp === e.timestamp) === idx;
                                        if (!isSameBooking) return false;

                                        const isAcc = (e.type === 'accommodation' || (!e.type && e.guestName)) && 
                                                      e.status?.toUpperCase() !== 'CANCELLED' && 
                                                      e.status?.toUpperCase() !== 'CANCEL';
                                        if (!isAcc) return false;

                                        const typeMatch = e.roomType?.trim().toLowerCase() === type.name?.trim().toLowerCase();
                                        if (!typeMatch) return false;

                                        return dateStr >= e.checkInDate && dateStr < e.checkOutDate;
                                    });

                                    const occupied = bookingsInCell.reduce((acc, curr) => acc + (Number(curr.roomCount) || 1), 0);
                                    const available = Math.max(0, type.allotment - occupied);
                                    const isToday = isSameDay(day, new Date());
                                    const isSoldOut = available === 0;

                                    const handleCellClick = () => {
                                        onCellClick?.(bookingsInCell, dateStr, type.name);
                                    };

                                    return (
                                        <td 
                                            key={dIdx} 
                                            onClick={handleCellClick}
                                            className={`p-4 border-b border-stone-100 text-center cursor-pointer transition-all ${isToday ? 'bg-[#788069]/5' : ''} ${isSoldOut ? 'bg-rose-50/20' : 'hover:bg-stone-100/50'}`}
                                        >
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p className={`text-[12px] font-black ${isSoldOut ? 'text-rose-500' : 'text-[#788069]'}`}>
                                                        {available}
                                                    </p>
                                                    {occupied > 0 && <Users size={8} className="text-stone-300" />}
                                                </div>
                                                <div className="w-8 h-[2px] bg-stone-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-700 ${isSoldOut ? 'bg-rose-400' : 'bg-emerald-400'}`} 
                                                        style={{ width: `${(available / type.allotment) * 100}%` }} 
                                                    />
                                                </div>
                                                <p className="text-[7px] font-bold text-stone-300 uppercase tracking-tighter">
                                                    {occupied > 0 ? `${occupied} Busy` : 'Left'}
                                                </p>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

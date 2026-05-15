"use client";

import React from "react";
import { Activity, Download, FileText, Eye, Pencil, Trash2 } from "lucide-react";
import { getChannelLogo } from "./StatCard";
import { RoomStatusPicker, GuestStatusPicker } from "./StatusPickers";

interface AuditLedgerProps {
    bookings: any[];
    onView: (booking: any) => void;
    onEdit: (booking: any) => void;
    onDelete: (booking: any) => void;
    onStatusUpdate: (item: any, field: string, value: string) => void;
    onExportPDF: () => void;
    onExportExcel: () => void;
}

export function AuditLedger({ 
    bookings, 
    onView, 
    onEdit, 
    onDelete, 
    onStatusUpdate,
    onExportPDF,
    onExportExcel
}: AuditLedgerProps) {
    return (
        <section 
            className="bg-white p-6 md:p-8 lg:p-12 rounded-[24px] border border-stone-100 shadow-xl overflow-hidden"
        >
            <div className="p-4 md:p-8 border-b border-stone-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#788069] text-white flex items-center justify-center rounded-xl">
                        <Activity size={18} />
                    </div>
                    <div>
                        <h2 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.2em] mb-0.5">Detail Transaksi Hari Ini</h2>
                        <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Laporan Aktivitas Harian Operasional</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mr-4">{bookings.length} Entries</p>
                    <button onClick={onExportExcel} className="h-9 w-9 flex items-center justify-center rounded-lg bg-stone-50 text-stone-400 hover:text-emerald-600 transition-all border border-stone-100"><Download size={14} /></button>
                    <button onClick={onExportPDF} className="h-9 w-9 flex items-center justify-center rounded-lg bg-stone-50 text-stone-400 hover:text-rose-600 transition-all border border-stone-100"><FileText size={14} /></button>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-stone-50">
                            <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Guest Name</th>
                            <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Stay Period</th>
                            <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Room & Remarks</th>
                            <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Channel</th>
                            <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Financials</th>
                            <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest text-center">Status</th>
                            <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="">
                        {bookings.map((booking, idx) => (
                            <tr 
                                key={idx} 
                                className={`group transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fff9f5]'}`}
                            >
                                <td className="py-16 px-8">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[12px] font-bold text-stone-900 uppercase font-outfit truncate max-w-[150px]">
                                            {booking.guestName || "General Sale"}
                                        </p>
                                        <p className="text-[9px] text-stone-400 font-mono-jb uppercase">{booking.bookingId || "Walk-In"}</p>
                                    </div>
                                </td>
                                <td className="py-16 px-8">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-stone-700 uppercase tracking-tighter">
                                            {booking.checkInDate || "---"}
                                        </p>
                                        <p className="text-[8px] font-medium text-stone-300 uppercase tracking-widest">Until {booking.checkOutDate || "---"}</p>
                                    </div>
                                </td>
                                <td className="py-16 px-8">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex">
                                            <span className="text-[9px] font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                {booking.roomType || "Service"}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-medium text-sage uppercase tracking-tighter">
                                            {booking.roomNumber ? `Room ${booking.roomNumber}` : ""}
                                        </span>
                                        {booking.type === 'accommodation' && (
                                            <RoomStatusPicker 
                                                current={booking.roomStatus || 'dirty'} 
                                                onChange={(val) => onStatusUpdate(booking, 'roomStatus', val)} 
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="py-16 px-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-stone-100 p-1 flex items-center justify-center">
                                            <img src={getChannelLogo(booking.channel)} alt="" className="w-5 h-5 object-contain grayscale opacity-50" />
                                        </div>
                                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{booking.channel}</p>
                                    </div>
                                </td>
                                <td className="py-16 px-8">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[12px] font-bold text-stone-900 font-mono-jb">Rp {Number(booking.amount).toLocaleString('id-ID')}</p>
                                        <p className={`text-[8px] font-black uppercase tracking-tight ${booking.paymentStatus?.includes('Lunas') ? 'text-sage' : 'text-amber-500'}`}>
                                            {booking.paymentStatus || 'Pending'}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-16 px-8 text-center">
                                    <div className="flex justify-center">
                                        {booking.type === 'accommodation' ? (
                                            <GuestStatusPicker 
                                                current={booking.guestStatus || 'arriving'} 
                                                onChange={(val) => onStatusUpdate(booking, 'guestStatus', val)}
                                            />
                                        ) : (
                                            <span className="text-[8px] font-bold text-stone-300 uppercase tracking-[0.2em]">Service</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-16 px-8">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => onView(booking)} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-900 hover:bg-white hover:shadow-sm transition-all"><Eye size={14} /></button>
                                        <button onClick={() => onEdit(booking)} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-300 hover:text-[#788069] hover:bg-white hover:shadow-sm transition-all"><Pencil size={14} /></button>
                                        <button onClick={() => onDelete(booking)} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

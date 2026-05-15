"use client";

import React from "react";
import { PlusCircle, LogIn, Calendar, XCircle, Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useOverview } from "./useOverview";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

// Modular Imports
import "./OverviewStyles.css";
import { StatCard } from "./StatCard";
import { InventoryCalendar } from "./InventoryCalendar";
import { AuditLedger } from "./AuditLedger";
import { GuestDetailModal } from "./GuestDetailModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { GuestListDrawer } from "./GuestListDrawer";

const SAGE = "#788069";
const PEACH = "#ffd8a6";

export function OverviewSection() {
    const router = useRouter();
    const { 
        loading, 
        checkInCount, checkOutCount, cancelCount,
        todayCheckIns, todayCheckOuts, todayCanceled,
        latestBookings, roomStatus, dailyData, roomTypesData
    } = useOverview();
    
    const [selectedGuest, setSelectedGuest] = React.useState<any>(null);
    const [isEditing, setIsEditing] = React.useState(false);
    const [bookingToDelete, setBookingToDelete] = React.useState<any>(null);
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(true);
    const [calendarContext, setCalendarContext] = React.useState<{ bookings: any[], date: string, type: string } | null>(null);

    const dash = loading ? "—" : null;

    const handleStatusUpdate = async (item: any, field: string, value: string) => {
        try {
            const docRef = doc(db, "daily_revenue", item._docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const entries = docSnap.data().entries || [];
                const updatedEntries = entries.map((e: any) => 
                    e.timestamp === item.timestamp ? { ...e, [field]: value } : e
                );
                await updateDoc(docRef, { entries: updatedEntries });
            }
        } catch (error) {
            console.error("Status Update Failed", error);
        }
    };

    const executeDelete = async () => {
        if (!bookingToDelete) return;
        try {
            const docRef = doc(db, "daily_revenue", bookingToDelete._docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const entries = docSnap.data().entries || [];
                const filtered = entries.filter((e: any) => e.timestamp !== bookingToDelete.timestamp);
                await updateDoc(docRef, { entries: filtered });
                setBookingToDelete(null);
            }
        } catch (error) {
            console.error("Delete Failed", error);
        }
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(latestBookings);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Audit");
        XLSX.writeFile(workbook, `Daily_Audit_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Daily Audit Ledger - Bumi Anyom Resort", 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [['Guest', 'Room', 'Channel', 'Amount', 'Status']],
            body: latestBookings.map(b => [
                b.guestName || "General Sale",
                b.roomNumber || "NA",
                b.channel,
                `Rp ${Number(b.amount).toLocaleString('id-ID')}`,
                b.paymentStatus || 'Pending'
            ]),
        });
        doc.save(`Detailed_Audit_Ledger_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-8 font-sans">
            {/* Header - Unified with Forecast */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3.5 mb-1">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#ffd8a6] text-[#788069]">
                            <PlusCircle size={13} />
                        </div>
                        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">Nexura Operational</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                        Command <span style={{ color: SAGE }}>Center</span>
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => router.push(`/forecast/add?date=${new Date().toISOString().split('T')[0]}`)}
                        className="h-11 w-11 flex items-center justify-center rounded-xl text-white transition-all hover:brightness-110 hover:shadow-lg active:scale-95 shadow-sm bg-[#788069]"
                        title="Add Transaction"
                    >
                        <PlusCircle size={18} />
                    </button>

                    <div className="flex items-center gap-2 border-l border-stone-100 pl-4 ml-1">
                        <button 
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={`h-11 w-11 flex items-center justify-center rounded-xl border border-stone-100 transition-all shadow-sm ${isCalendarOpen ? 'bg-[#788069] text-white' : 'bg-white text-stone-400 hover:text-[#788069] hover:bg-stone-50'}`}
                            title={isCalendarOpen ? "Close Calendar" : "Open Calendar"}
                        >
                            <Calendar size={18} />
                        </button>
                        <button 
                            onClick={handleExportExcel}
                            className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-stone-100 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                            title="Export to Excel"
                        >
                            <Download size={16} />
                        </button>
                        <button 
                            onClick={handleExportPDF}
                            className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-stone-100 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                            title="Export to PDF"
                        >
                            <FileText size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* SECTION 1: MOVEMENT GRID */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    accent={SAGE} icon={<LogIn size={18} />} label="Check In Today" 
                    count={dash || checkInCount} items={todayCheckIns}
                    onItemClick={(b: any) => { setSelectedGuest(b); setIsEditing(false); }}
                    onStatusUpdate={handleStatusUpdate}
                />
                <StatCard 
                    accent={PEACH} icon={<Calendar size={18} />} label="Check Out Today" 
                    count={dash || checkOutCount} items={todayCheckOuts}
                    onItemClick={(b: any) => { setSelectedGuest(b); setIsEditing(false); }}
                    onStatusUpdate={handleStatusUpdate}
                />
                <StatCard 
                    accent="#ef4444" icon={<XCircle size={18} />} label="Cancellations" 
                    count={dash || cancelCount} items={todayCanceled}
                    onItemClick={(b: any) => { setSelectedGuest(b); setIsEditing(false); }}
                    onStatusUpdate={handleStatusUpdate}
                />
            </section>

            {/* SECTION 2: AUDIT LEDGER */}
            <AuditLedger 
                bookings={latestBookings}
                onView={(b) => { setSelectedGuest(b); setIsEditing(false); }}
                onEdit={(b) => { setSelectedGuest(b); setIsEditing(true); }}
                onDelete={(b) => setBookingToDelete(b)}
                onStatusUpdate={handleStatusUpdate}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
            />

            {/* SECTION 3: INVENTORY CALENDAR */}
            {isCalendarOpen && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <InventoryCalendar 
                        data={dailyData} 
                        roomTypes={roomTypesData}
                        totalRooms={roomStatus.total} 
                        onDateSelect={(date) => router.push(`/forecast/add?date=${date}`)}
                        onCellClick={(bookings, date, type) => setCalendarContext({ bookings, date, type })}
                    />
                </section>
            )}

            <GuestListDrawer 
                isOpen={!!calendarContext}
                onClose={() => setCalendarContext(null)}
                date={calendarContext?.date || ""}
                roomType={calendarContext?.type || ""}
                bookings={calendarContext?.bookings || []}
                onAdd={(date) => router.push(`/forecast/add?date=${date}`)}
            />

            {/* Modals */}
            {selectedGuest && (
                <GuestDetailModal 
                    guest={selectedGuest} 
                    isEditing={isEditing} 
                    onClose={() => setSelectedGuest(null)} 
                />
            )}

            <DeleteConfirmModal 
                isOpen={!!bookingToDelete}
                itemName={bookingToDelete?.guestName || "General Sale"}
                onConfirm={executeDelete}
                onCancel={() => setBookingToDelete(null)}
            />
        </div>
    );
}
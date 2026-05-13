"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Eye, 
    Pencil, 
    Trash2,
    Activity,
    Plus,
    Calendar,
    ArrowRight,
    LogIn,
    XCircle,
    LayoutDashboard,
    Download,
    FileText
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useOverview } from "./useOverview";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import Image from "next/image";

// Modular Imports
import "./OverviewStyles.css";
import { 
    StatCard, 
    GuestDetailModal, 
    getChannelLogo 
} from "./OverviewComponents";

interface OverviewSectionProps {
    onNavigate?: (section: any) => void;
}

const SAGE = "#788069";
const PEACH = "#ffd8a6";

export const OverviewSection: React.FC<OverviewSectionProps> = ({ onNavigate }) => {
    const router = useRouter();
    const { 
        loading, 
        checkInCount, checkOutCount, cancelCount,
        todayCheckIns, todayCheckOuts, todayCanceled,
        latestBookings, roomStatus
    } = useOverview();
    
    const [selectedGuest, setSelectedGuest] = React.useState<any>(null);
    const [isEditing, setIsEditing] = React.useState(false);

    const dash = loading ? "—" : null;

    const handleDelete = async (booking: any) => {
        if (!window.confirm(`Delete entry for "${booking.guestName}"?`)) return;
        
        try {
            const dateStr = new Date(booking.timestamp).toISOString().split('T')[0];
            const hotelId = "bumi-anyom-resort";
            const docId = `${hotelId}_${dateStr}`;
            const docRef = doc(db, "daily_revenue", docId);
            
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const entries = docSnap.data().entries || [];
                const updatedEntries = entries.filter((e: any) => e.timestamp !== booking.timestamp);
                await updateDoc(docRef, { entries: updatedEntries });
                alert("Deleted.");
            }
        } catch (error) {
            console.error(error);
            alert("Failed.");
        }
    };

    const handleEdit = (booking: any) => {
        setSelectedGuest(booking);
        setIsEditing(true);
    };

    // ── Export Logic ──
    const handleExportExcel = () => {
        const data = latestBookings.map(e => ({
            "Waktu Input": new Date(e.timestamp).toLocaleString('id-ID'),
            "Nama Tamu / Kategori": e.guestName || e.incomeCategory,
            "Tipe": e.type === 'accommodation' ? 'Kamar' : 'Pendapatan Lain',
            "Check-In": e.checkInDate || '-',
            "Check-Out": e.checkOutDate || '-',
            "Room Type": e.roomType || '-',
            "Room No": e.roomNumber || '-',
            "Channel": e.channel || 'Internal',
            "Voucher": e.voucherCode || '-',
            "Total Tagihan": Number(e.amount),
            "Dibayar 1": Number(e.paidAmount1 || 0),
            "Dibayar 2": Number(e.paidAmount2 || 0),
            "Metode Bayar": e.paymentStatus,
            "Split Bill": e.isSplitBill ? 'Ya' : 'Tidak',
            "Sumber": e.source || '-',
            "Status Transaksi": e.status,
            "Input Oleh": e.staffName || '-',
            "Status Kamar": e.roomStatus || '-',
            "Status Tamu": e.guestStatus || '-',
            "Catatan": e.note || ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Activity Ledger");
        XLSX.writeFile(wb, `Detailed_Audit_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        
        doc.setFontSize(16);
        doc.text(`Nexura Analytics - Detailed Audit Activity Ledger`, 14, 15);
        doc.setFontSize(9);
        doc.text(`Exported: ${new Date().toLocaleString('id-ID')} | Hotel: Bumi Anyom Resort`, 14, 22);
        
        const tableData = latestBookings.map(e => [
            e.checkInDate || '-',
            e.guestName || e.incomeCategory || 'Sale',
            e.roomNumber || '-',
            e.channel || 'Internal',
            `Rp ${Number(e.amount).toLocaleString('id-ID')}`,
            e.paymentStatus || 'Settled',
            e.status,
            e.staffName || '-'
        ]);

        autoTable(doc, {
            startY: 28,
            head: [['Date', 'Guest / Category', 'Room', 'Channel', 'Amount', 'Payment', 'Status', 'Staff']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [120, 128, 105], fontSize: 8 },
            styles: { fontSize: 7, cellPadding: 2 }
        });

        doc.save(`Detailed_Audit_Ledger_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-40">
            {/* Simple Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-sage uppercase tracking-[0.4em]">Operational Dashboard</p>
                    <h1 className="text-4xl font-semibold text-stone-900 uppercase font-outfit tracking-tight">Command Center</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleExportExcel}
                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-stone-50 border border-stone-100 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                        title="Export to Excel"
                    >
                        <Download size={16} />
                    </button>
                    <button 
                        onClick={handleExportPDF}
                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-stone-50 border border-stone-100 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                        title="Export to PDF"
                    >
                        <FileText size={16} />
                    </button>
                </div>
            </div>

            {/* Section 1: Movement Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard 
                    accent={SAGE}
                    icon={<LogIn size={18} />}
                    label="Arrival Today" 
                    count={dash || checkInCount}
                    items={todayCheckIns}
                    onItemClick={(b: any) => setSelectedGuest(b)}
                />
                <StatCard 
                    accent={PEACH}
                    icon={<Calendar size={18} />}
                    label="Departure Today" 
                    count={dash || checkOutCount}
                    items={todayCheckOuts}
                    onItemClick={(b: any) => setSelectedGuest(b)}
                />
                <StatCard 
                    accent="#ef4444"
                    icon={<XCircle size={18} />}
                    label="Cancellations" 
                    count={dash || cancelCount}
                    items={todayCanceled}
                    onItemClick={(b: any) => setSelectedGuest(b)}
                />
            </section>

            {/* Bold Accent Divider */}
            <div className="flex items-center justify-center gap-8 py-8">
                <div className="h-[1px] bg-stone-100 flex-1" />
                <div className="w-3 h-3 rounded-full border-4 border-stone-50 bg-sage/40" />
                <div className="h-[1px] bg-stone-100 flex-1" />
            </div>

            {/* Section 2: Audit Ledger */}
            <section className="mt-20">
                <div className="grid grid-cols-1 gap-12 items-start">
                    {/* Audit Ledger Card */}
                    <section className="bento-glass rounded-none overflow-hidden">
                        <div className="p-8 border-b border-stone-50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-sage text-white flex items-center justify-center rounded-xl">
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.2em] mb-0.5">Activity Register</h2>
                                    <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Transaction stream v2.1</p>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{latestBookings.length} Entries</p>
                        </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-stone-50/50">
                                    <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Guest Name</th>
                                    <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Stay Period</th>
                                    <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Room & Remarks</th>
                                    <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Channel</th>
                                    <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Financials</th>
                                    <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="py-4 px-8 text-[9px] font-bold text-stone-400 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestBookings.map((b, i) => (
                                    <tr key={i} className="group hover:bg-stone-50/50 transition-all border-b border-stone-50 last:border-0">
                                        <td className="py-6 px-8">
                                            <p className="text-[12px] font-medium text-stone-800 uppercase font-outfit mb-1">{b.guestName || 'Sale'}</p>
                                            <p className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">{b.type === 'accommodation' ? 'Accommodation' : 'Service'}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="text-[11px] font-medium text-stone-600 font-mono-jb mb-1">{b.checkInDate || '---'}</p>
                                            <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{b.checkOutDate || '---'}</p>
                                        </td>
                                        <td className="py-6 px-8 max-w-[200px]">
                                            <p className="text-[11px] font-medium text-stone-800 uppercase font-outfit truncate">{b.roomType ? `${b.roomType} ${b.roomNumber ? `(${b.roomNumber})` : ''}` : '---'}</p>
                                            <p className="text-[9px] font-bold text-stone-400 italic truncate mt-1">{b.note || 'No internal remarks'}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex justify-center items-center opacity-80 group-hover:opacity-100 transition-opacity">
                                                <Image src={getChannelLogo(b.channel)} alt="" width={24} height={24} className="object-contain" />
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="text-[13px] font-medium text-stone-900 font-mono-jb mb-1">Rp {Number(b.amount).toLocaleString('id-ID')}</p>
                                            <p className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">{b.paymentStatus || 'Settled'}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex justify-center">
                                                {(() => {
                                                    const statusText = (b.paymentStatus || "").toUpperCase();
                                                    const mainStatus = (b.status || "").toUpperCase();
                                                    let color = "text-sage";
                                                    let label = "Lunas";

                                                    if (mainStatus === 'CANCELLED') { color = "text-red-400"; label = "Cancelled"; }
                                                    else if (statusText.includes('DP')) { color = "text-blue-400"; label = "Deposit"; }
                                                    else if (statusText.includes('KURANG')) { color = "text-amber-500"; label = "Balance"; }

                                                    return (
                                                        <span className={`text-[8px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-white border border-stone-100 ${color}`}>
                                                            {label}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedGuest(b); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-stone-900 hover:bg-white transition-all"><Eye size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(b); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-blue-500 hover:bg-white transition-all"><Pencil size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(b); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-white transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </section>
                </div>
            </section>

            {/* Detail Folio */}
            <AnimatePresence>
                {selectedGuest && (
                    <GuestDetailModal 
                        guest={selectedGuest} 
                        isEditing={isEditing}
                        onClose={() => { setSelectedGuest(null); setIsEditing(false); }} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
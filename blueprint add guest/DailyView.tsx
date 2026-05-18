"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Calendar, Trash2, Edit, FileText, Loader2, Image as ImageIcon, 
  Ban, ShieldCheck, Building2, Info, Ticket, Search, CheckCircle2,
  DollarSign, ArrowRightLeft, Banknote, CreditCard, Wallet, TrendingDown,
  X, User, Calculator
} from "lucide-react";
import { 
  doc, onSnapshot, updateDoc, getDoc, addDoc, collection 
} from "firebase/firestore";
import { db } from "@/lib/firebase"; 

// IMPORT UTILS & COMPONENT
import { 
  calculateTransaction, 
  calculateSummary, 
  formatCurrency, 
  formatRupiahShort 
} from "@/lib/finance-utils";
import SummaryCards from "./SummaryCards";

// USER SESSION
const CURRENT_USER_EMAIL = "nexura.management@gmail.com"; 

const CHANNEL_MAP: Record<string, string> = {
  "Walk-in": "/channels/walk_in.png",
  "Traveloka": "/channels/traveloka.png",
  "Booking.com": "/channels/booking_com.png",
  "Tiket.com": "/channels/tiket_com.png",
  "Agoda": "/channels/agoda.png",
  "Nexura Sales": "/channels/nexura.png",
  "Trip.com": "/channels/trip.png",
  "Expedia": "/channels/expedia.png",
  "MG Bedbank": "/channels/mg.png",
  "Booking Engine": "/channels/nexura.png",
  "Airbnb": "/channels/airbnb.png",
  "default": "/channels/nexura.png" 
};

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DailyView({ hotelId = "", onEdit }: { hotelId?: string, onEdit: (guest: any, index: number) => void }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCancelIndex, setSelectedCancelIndex] = useState<number | null>(null);
  
  // State Form Utama
  const [cancelForm, setCancelForm] = useState({
    reason: "",
    penaltyType: "NONE",
    amount: 0, // Ini adalah HASIL Akhir (Total Penalty)
    paymentMethod: "TRANSFER"
  });

  // State Kalkulator Khusus
  const [calcRefund, setCalcRefund] = useState<number>(0); // Nominal Refund ke Tamu
  const [calcFeePct, setCalcFeePct] = useState<number>(15); // Default 15%

  // --- FETCH DATA ---
  useEffect(() => {
    if (!hotelId) { setTransactions([]); return; }
    setLoading(true);
    const dateStr = getLocalDateString(currentDate); 
    const docId = `${hotelId}_${dateStr}`;
    const docRef = doc(db, "daily_revenue", docId); 

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const entries = docSnap.data().entries || [];
        const mappedData = entries.map((entry: any, index: number) => ({
          ...entry, 
          originalIndex: index,
          guestName: entry.guestName || "No Name",
          bookingId: entry.bookingId || `TRX-${index + 1}`,
          roomType: entry.roomType || "-",
          channel: entry.channel || "Walk-in",
          voucherCode: entry.voucherCode || "-",
          notes: entry.notes || "-",
          amount: Number(entry.amount) || 0,
          paidCash: Number(entry.paidCash) || 0,
          paidTransfer: Number(entry.paidTransfer) || 0,
          feePercentage: Number(entry.feePercentage) || 0,
          status: entry.status || "LUNAS",
          proofUrl: entry.proofUrl || "",
          timestamp: entry.timestamp || new Date().toISOString(),
          penaltyType: entry.penaltyType || "NONE",
          penaltyAmount: Number(entry.penaltyAmount) || 0,
          cancelReason: entry.cancelReason || "",
          cancelledBy: entry.cancelledBy || "-"
        }));
        setTransactions(mappedData.reverse());
      } else { setTransactions([]); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentDate, hotelId]);

// --- LOGIKA KALKULATOR OTOMATIS (DI DALAM DailyView.tsx) ---
useEffect(() => {
  if (selectedCancelIndex === null) return;
  
  // Cari transaksi asli
  const targetTx = transactions.find(t => t.originalIndex === selectedCancelIndex);
  if (!targetTx) return;

  const totalTagihan = targetTx.amount; // Total Input Harga Awal
  
  // Perhitungan Nett Extranet sesuai permintaan: (Total Input Harga Awal - GAP)
  // Kita hitung GAP transaksi tersebut: Total Bayar - Total Tagihan
  const totalPaid = (Number(targetTx.paidCash) || 0) + (Number(targetTx.paidTransfer) || 0);
  const gap = totalPaid - totalTagihan;
  const nettExtranet = totalTagihan - Math.abs(gap); 

  let calculatedPenalty = 0;

  // 1. CANCEL BY OWNER (LOGIKA DIPERBARUI)
  if (cancelForm.penaltyType === "OWNER") {
      // Fee Management: % dari Total Tagihan Awal
      const feeManagement = totalTagihan * (calcFeePct / 100);
      
      // RUMUS: nominal full refund - net extranet + fee management
      calculatedPenalty = calcRefund - nettExtranet + feeManagement;
  } 
  // 2. CANCEL BY NEXURA
  else if (cancelForm.penaltyType === "NEXURA") {
      calculatedPenalty = calcRefund - nettExtranet;
  } 
  // 3. CANCEL BY TAMU
  else if (cancelForm.penaltyType === "GUEST") {
      calculatedPenalty = nettExtranet * 0.15;
  }
  else {
      calculatedPenalty = 0;
  }

  // Update Hasil ke Form
  setCancelForm(prev => ({ ...prev, amount: Math.round(calculatedPenalty) }));

}, [cancelForm.penaltyType, calcRefund, calcFeePct, selectedCancelIndex, transactions]);

  // --- ACTIONS ---
  const openCancelModal = (originalIndex: number) => {
    const targetTx = transactions.find(t => t.originalIndex === originalIndex);
    setSelectedCancelIndex(originalIndex);
    
    // Reset Form & Calculator
    setCancelForm({ reason: "", penaltyType: "NONE", amount: 0, paymentMethod: "TRANSFER" });
    setCalcRefund(0);
    setCalcFeePct(targetTx?.feePercentage || 15); // Ambil fee asli jika ada
    setIsCancelModalOpen(true);
  };

  const handleSubmitCancel = async () => {
    if (selectedCancelIndex === null) return;
    if (!cancelForm.reason) { alert("Alasan wajib diisi!"); return; }

    try {
      const dateStr = getLocalDateString(currentDate);
      const docRef = doc(db, "daily_revenue", `${hotelId}_${dateStr}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentEntries = docSnap.data().entries || [];
        const updatedEntries = [...currentEntries];
        const target = updatedEntries[selectedCancelIndex];
        
        if (!target) { alert("Data tidak ditemukan! Refresh."); return; }

        updatedEntries[selectedCancelIndex] = {
            ...target,
            status: "CANCELLED",
            cancelReason: cancelForm.reason,
            penaltyType: cancelForm.penaltyType, 
            penaltyAmount: Number(cancelForm.amount), 
            penaltyMethod: cancelForm.paymentMethod,
            cancelledBy: CURRENT_USER_EMAIL 
        };

        await updateDoc(docRef, { entries: updatedEntries });

        await addDoc(collection(db, "activityLog"), {
            action: "CANCEL_TRANSACTION",
            description: `Cancel Guest: ${target.guestName}. Type: ${cancelForm.penaltyType}`,
            module: "FINANCE_POS",
            timestamp: new Date().toISOString(),
            user: CURRENT_USER_EMAIL,
            hotelId: hotelId
        });

        setIsCancelModalOpen(false);
      }
    } catch (e) { alert("Gagal proses cancel."); }
  };

  const handleDelete = async (originalIndex: number) => {
    if (!confirm("Hapus Permanen?")) return;
    try {
      const dateStr = getLocalDateString(currentDate);
      const docRef = doc(db, "daily_revenue", `${hotelId}_${dateStr}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentEntries = docSnap.data().entries || [];
        const updatedEntries = currentEntries.filter((_: any, idx: number) => idx !== originalIndex);
        await updateDoc(docRef, { entries: updatedEntries });
      }
    } catch (e) { alert("Gagal hapus."); }
  };

  const summary = calculateSummary(transactions);
  const filteredTransactions = transactions.filter(t => 
    t.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper untuk mengambil data transaksi yang sedang dipilih di modal
  const activeTx = transactions.find(t => t.originalIndex === selectedCancelIndex);

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-500">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
         <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Calendar size={20} className="text-gray-500" />
            <input type="date" value={getLocalDateString(currentDate)} onChange={(e) => setCurrentDate(new Date(e.target.value))} className="bg-transparent font-medium text-gray-700 focus:outline-none cursor-pointer" />
         </div>
         {!hotelId && <span className="text-red-500 text-sm font-bold animate-pulse">Pilih Hotel Terlebih Dahulu!</span>}
      </div>

      <SummaryCards data={summary} />

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-[1.5rem] shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600"/> Transaksi Harian</h3>
            <div className="relative w-full sm:w-auto">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="text" placeholder="Cari nama tamu / ID..." className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-100 w-full sm:w-[240px] shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-5 px-6">Detail Tamu</th>
                <th className="py-5 px-4">Channel</th>
                <th className="py-5 px-4">Room & Notes</th>
                <th className="py-5 px-4 text-right">Tagihan / Info</th>
                <th className="py-5 px-4 text-center">Status Pembayaran</th>
                <th className="py-5 px-4 text-right">Fee Management</th>
                <th className="py-5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
               {loading ? (
                 <tr><td colSpan={7} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500"/></td></tr>
               ) : filteredTransactions.length === 0 ? (
                 <tr><td colSpan={7} className="p-10 text-center text-gray-400 italic">Belum ada data.</td></tr>
               ) : (
                 filteredTransactions.map((row) => {
                    const isCancelled = row.status === "CANCELLED";
                    const logoSrc = CHANNEL_MAP[row.channel] || CHANNEL_MAP["default"];
                    const financials = calculateTransaction(row);

                    return (
                       <tr key={row.originalIndex} className={`transition-colors group ${isCancelled ? 'bg-red-50/20' : 'hover:bg-slate-50/50'}`}>
                          <td className="py-5 px-6 align-top">
                             <div className={`font-bold text-slate-800 ${isCancelled ? 'line-through opacity-40' : ''}`}>{row.guestName}</div>
                             <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.bookingId}</div>
                             {row.voucherCode !== "-" && <div className="text-[9px] text-indigo-500 font-bold flex items-center gap-1 mt-1"><Ticket size={10}/> {row.voucherCode}</div>}
                             {!isCancelled && row.proofUrl && <a href={row.proofUrl} target="_blank" className="inline-flex items-center gap-1 text-[9px] text-blue-600 font-bold mt-1 hover:underline"><ImageIcon size={9}/> Bukti Bayar</a>}
                             {isCancelled && <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100"><div className="text-[9px] text-red-600 font-black uppercase tracking-tighter flex items-center gap-1"><Ban size={8}/> {row.penaltyType} Cancelled</div><div className="text-[10px] text-red-500 italic mt-0.5 leading-tight">"{row.cancelReason}"</div><div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-red-100"><User size={8} className="text-red-400"/><span className="text-[9px] text-red-400 font-medium">By: {row.cancelledBy}</span></div></div>}
                          </td>
                          <td className="py-5 px-4 align-top">
                            <div className="flex items-center gap-2"><div className="relative w-6 h-6 rounded-md overflow-hidden border border-slate-100 bg-white p-0.5"><Image src={logoSrc} alt={row.channel} fill className="object-contain" /></div><span className="text-[11px] font-bold text-slate-600">{row.channel}</span></div>
                          </td>
                          <td className="py-5 px-4 align-top">
                             <div className="text-xs font-medium text-slate-700">{row.roomType}</div>
                             {row.notes !== "-" && <div className="text-[10px] text-slate-400 italic mt-1 line-clamp-2 max-w-[150px]"><FileText size={10} className="inline mr-1"/>{row.notes}</div>}
                          </td>
                          <td className="py-5 px-4 text-right align-top font-mono">
                             {isCancelled ? (
                                 <div className="flex flex-col items-end gap-1"><span className="text-slate-300 line-through text-[10px]">Rp {row.amount.toLocaleString()}</span>{row.penaltyType !== "NONE" && <span className="text-red-500 font-black text-xs">Ref: -{formatCurrency(row.penaltyAmount)}</span>}</div>
                             ) : <div className="font-bold text-slate-700 font-mono">Rp {row.amount.toLocaleString()}</div>}
                          </td>
                          <td className="py-5 px-4 align-top">
                             {isCancelled ? (
                                <div className="bg-slate-100 text-slate-400 text-[9px] font-black p-2 rounded-lg border border-slate-200 border-dashed text-center uppercase tracking-tighter">Selesai / Refund</div>
                             ) : (
                                <div className="space-y-1">
                                    {row.paidCash > 0 && <div className="flex justify-between text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100"><span>HOTEL</span><span>{formatRupiahShort(row.paidCash)}</span></div>}
                                    {row.paidTransfer > 0 && <div className="flex justify-between text-[9px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"><span>NEXURA</span><span>{formatRupiahShort(row.paidTransfer)}</span></div>}
                                    <div className={`text-center text-[9px] font-black py-0.5 rounded ${financials.gap === 0 ? 'bg-slate-50 text-slate-400' : 'bg-red-50 text-red-600 border border-red-100'}`}>{financials.gap === 0 ? "MATCHED" : `GAP ${financials.gap.toLocaleString()}`}</div>
                                </div>
                             )}
                          </td>
                          <td className="py-5 px-4 text-right align-top font-mono">
                             <div className={`font-bold ${financials.isLoss ? 'text-red-500' : 'text-slate-500'}`}>{formatCurrency(financials.displayFee)}</div>
                             <div className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">{isCancelled ? `${row.penaltyType} ${row.penaltyType === 'OWNER' ? 'CHARGE' : row.penaltyType === 'NEXURA' ? 'LOSS' : 'PENALTY'}` : `${row.feePercentage}% FEE`}</div>
                          </td>
                          <td className="py-5 px-6 text-center align-top">
                             <div className="flex justify-center gap-2">
                                {/* UPDATE DI SINI: Menyisipkan transactionDate: currentDate ke onEdit */}
                                {!isCancelled && (
                                    <>
                                        <button 
                                            onClick={() => onEdit({ ...row, transactionDate: currentDate }, row.originalIndex)} 
                                            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all shadow-sm border border-transparent hover:border-blue-100"
                                        >
                                            <Edit size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => openCancelModal(row.originalIndex)} 
                                            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-orange-500 hover:bg-orange-50 transition-all shadow-sm border border-transparent hover:border-orange-100"
                                        >
                                            <Ban size={16}/>
                                        </button>
                                    </>
                                )}
                                <button onClick={() => handleDelete(row.originalIndex)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"><Trash2 size={16}/></button>
                             </div>
                          </td>
                       </tr>
                    )
                 })
               )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- NEW CANCEL MODAL WITH CALCULATOR --- */}
      {isCancelModalOpen && activeTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm"><Ban size={20} /></div>
                        <div><h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Protokol Pembatalan</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Keamanan Transaksi Internal</p></div>
                    </div>
                    <button onClick={() => setIsCancelModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-all"><X size={18}/></button>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan Pembatalan</label>
                        <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-orange-100 focus:border-orange-200 outline-none transition-all resize-none min-h-[80px]" placeholder="Jelaskan alasan..." value={cancelForm.reason} onChange={e => setCancelForm({...cancelForm, reason: e.target.value})}/>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block text-left">Penyelesaian Keuangan</label>
                        <div className="grid grid-cols-1 gap-2">
                            <PenaltyOption active={cancelForm.penaltyType === "NONE"} onClick={() => setCancelForm({...cancelForm, penaltyType: "NONE", amount: 0})} title="Void / Gratis" desc="Reset transaksi. Tidak ada biaya." icon={<ShieldCheck size={18}/>} color="bg-slate-600" />
                            <PenaltyOption active={cancelForm.penaltyType === "OWNER"} onClick={() => setCancelForm({...cancelForm, penaltyType: "OWNER", amount: 0})} title="Cancel by Owner" desc="Rumus: Refund - Tagihan + Fee." icon={<Building2 size={18}/>} color="bg-orange-600" />
                            <PenaltyOption active={cancelForm.penaltyType === "GUEST"} onClick={() => setCancelForm({...cancelForm, penaltyType: "GUEST", amount: 0})} title="Cancel by Tamu" desc="Denda 15% dari Nett Extranet." icon={<DollarSign size={18}/>} color="bg-emerald-600" />
                            <PenaltyOption active={cancelForm.penaltyType === "NEXURA"} onClick={() => setCancelForm({...cancelForm, penaltyType: "NEXURA", amount: 0})} title="Cancel by Nexura" desc="Rumus: Refund - Nett Extranet." icon={<Info size={18}/>} color="bg-red-600" />
                        </div>
                    </div>
                    
                    {/* --- CALCULATOR SECTION --- */}
                    {cancelForm.penaltyType !== "NONE" && (
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 animate-in zoom-in-95 duration-200 shadow-sm space-y-4">
                             <div className="flex items-center gap-2 mb-2"><Calculator size={14} className="text-slate-400"/><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kalkulator Fee & Penalty</span></div>
                             
                             {/* INPUTS FOR OWNER & NEXURA */}
                             {(cancelForm.penaltyType === "OWNER" || cancelForm.penaltyType === "NEXURA") && (
                                 <div className="space-y-3">
                                     <div>
                                         <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nominal Full Refund</label>
                                         <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-orange-400" placeholder="0" value={calcRefund || ""} onChange={e => setCalcRefund(Number(e.target.value))}/>
                                     </div>
                                     {cancelForm.penaltyType === "OWNER" && (
                                         <div>
                                             <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Fee Management (%)</label>
                                             <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-orange-400" value={calcFeePct} onChange={e => setCalcFeePct(Number(e.target.value))}/>
                                         </div>
                                     )}
                                 </div>
                             )}

                             {/* AUTO FILLED INFO */}
                             <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100 rounded-xl">
                                 <div><span className="block text-[8px] font-bold text-slate-400 uppercase">Total Tagihan</span><span className="text-xs font-mono font-bold text-slate-600">{formatCurrency(activeTx.amount)}</span></div>
                                 <div><span className="block text-[8px] font-bold text-slate-400 uppercase">Nett Extranet</span><span className="text-xs font-mono font-bold text-slate-600">{formatCurrency(activeTx.paidCash + activeTx.paidTransfer)}</span></div>
                             </div>

                             {/* FINAL RESULT */}
                             <div className="pt-2 border-t border-slate-200">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 justify-between">
                                    <span>Total Fee / Penalty Result</span>
                                    <span className="text-[8px] bg-slate-200 px-2 py-0.5 rounded text-slate-500">Auto Calculated</span>
                                </label>
                                <div className="relative mt-2">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">Rp</span>
                                    {/* READ ONLY RESULT */}
                                    <input type="text" disabled className="w-full pl-12 bg-transparent border-b-2 border-slate-300 text-3xl font-black text-slate-800 outline-none py-2" value={cancelForm.amount.toLocaleString('id-ID')} />
                                </div>
                             </div>

                             {cancelForm.penaltyType === "GUEST" && (
                                <div className="mt-2"><select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none text-slate-600" value={cancelForm.paymentMethod} onChange={e => setCancelForm({...cancelForm, paymentMethod: e.target.value})}><option value="TRANSFER">Diterima via Transfer (Nexura)</option><option value="CASH">Diterima via Cash (Owner)</option></select></div>
                             )}
                        </div>
                    )}
                </div>
                <div className="px-8 py-6 bg-white border-t border-slate-50 flex gap-4 shrink-0">
                    <button onClick={() => setIsCancelModalOpen(false)} className="flex-1 py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Batalkan</button>
                    <button onClick={handleSubmitCancel} className="flex-[1.5] py-4 px-6 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-xl transition-all">Eksekusi Protokol</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function PenaltyOption({ active, onClick, title, desc, icon, color }: any) {
    return (
        <button onClick={onClick} className={`flex items-start gap-4 p-4 rounded-3xl border-2 transition-all duration-300 text-left ${active ? 'bg-slate-50 border-slate-900 shadow-sm' : 'bg-white border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'}`}>
            <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-all ${active ? color + ' text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{icon}</div>
            <div><h4 className={`text-xs font-black uppercase tracking-tight mb-0.5 ${active ? 'text-slate-900' : 'text-slate-600'}`}>{title}</h4><p className="text-[10px] font-medium text-slate-400 leading-normal">{desc}</p></div>
        </button>
    )
}
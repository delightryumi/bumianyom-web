"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  ChevronLeft, ChevronRight, Download, Loader2, 
  PieChart, Ban, Calendar, Search, CheckCircle2, Ticket, 
  User, CreditCard, Wallet, ArrowUpRight, X, Users
} from "lucide-react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import * as XLSX from "xlsx"; 

// IMPORT RUMUS & KOMPONEN SENTRAL
import { 
  calculateTransaction, 
  calculateSummary,
  formatCurrency, 
  TransactionInput 
} from "@/lib/finance-utils";
import SummaryCards from "./SummaryCards";

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

type TransactionExtended = TransactionInput & {
  guestName: string;
  channel: string;
  roomType: string;
  notes: string;
  bookingId: string;
  proofUrl: string;
  date: string;
  cancelReason: string;
  voucherCode?: string;
  displayFee: number;
  calculatedPenalty?: number; 
};

type ChannelStat = {
  name: string;
  total: number;
  count: number;
  percentage: number;
};

export default function MonthlyView({ hotelId }: { hotelId: string }) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [hotelName, setHotelName] = useState("Hotel");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannelDetail, setSelectedChannelDetail] = useState<string | null>(null);
  
  const [allTransactions, setAllTransactions] = useState<TransactionExtended[]>([]);
  const [channelStats, setChannelStats] = useState<ChannelStat[]>([]);
  const [cancelledList, setCancelledList] = useState<TransactionExtended[]>([]);
  const [confirmedList, setConfirmedList] = useState<TransactionExtended[]>([]);
  
  const [summary, setSummary] = useState<any>({
    gross: 0, fee: 0, totalGap: 0, ownerPenalty: 0, ownerNetRight: 0,
    nexuraSalesCash: 0, nexuraSalesTransfer: 0, walkInTotal: 0, otaTotal: 0,
    finalReconcile: 0
  });

  // --- FETCH HOTEL NAME ---
  useEffect(() => {
    const fetchHotelName = async () => {
        if (!hotelId) return;
        try {
            const docRef = doc(db, "properties", hotelId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setHotelName(docSnap.data().Nama || docSnap.data().name || "Unknown Hotel");
            }
        } catch (e) { console.error(e); }
    };
    fetchHotelName();
  }, [hotelId]);

  // --- FETCH DATA TRANSAKSI ---
  useEffect(() => {
    if (!hotelId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate(); 
        const endStr = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        const q = query(
          collection(db, "daily_revenue"),
          where("hotelId", "==", hotelId),
          where("date", ">=", startStr),
          where("date", "<=", endStr)
        );

        const querySnapshot = await getDocs(q);
        
        const txList: TransactionExtended[] = [];
        const inputForSummary: TransactionInput[] = []; 
        
        // 1. INISIALISASI SEMUA CHANNEL DENGAN 0 (Supaya yg 0 tetap muncul)
        const chMap: Record<string, number> = {};
        const chCount: Record<string, number> = {};
        
        Object.keys(CHANNEL_MAP).forEach(chKey => {
            if (chKey !== "default") {
                chMap[chKey] = 0;
                chCount[chKey] = 0;
            }
        });

        const cancelledBuffer: TransactionExtended[] = [];
        const confirmedBuffer: TransactionExtended[] = [];
        let grossTotalForPct = 0;

        // 2. PROSES TRANSAKSI
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const entries = data.entries || [];
          entries.forEach((t: any) => {
             const rawData: TransactionInput = {
                 amount: Number(t.amount) || 0,
                 paidCash: Number(t.paidCash) || 0,
                 paidTransfer: Number(t.paidTransfer) || 0,
                 feePercentage: Number(t.feePercentage) || 0,
                 status: t.status || "LUNAS",
                 channel: t.channel || "Walk-in",
                 penaltyType: t.penaltyType || "NONE",
                 penaltyAmount: Number(t.penaltyAmount) || 0,
                 penaltyMethod: t.penaltyMethod
             };
             inputForSummary.push(rawData);
             const res = calculateTransaction(rawData);
             
             if (t.status !== "CANCELLED") grossTotalForPct += res.gross;

             const txObj: TransactionExtended = {
                 ...rawData,
                 guestName: t.guestName || "No Name",
                 bookingId: t.bookingId || "-",
                 roomType: t.roomType || "-",
                 notes: t.notes || "-",
                 proofUrl: t.proofUrl || "",
                 date: data.date,
                 cancelReason: t.cancelReason || "",
                 voucherCode: t.voucherCode || "-",
                 displayFee: res.displayFee,
                 calculatedPenalty: res.isLoss ? Math.abs(res.fee) : (t.penaltyType === 'OWNER' ? res.ownerPenalty : res.fee)
             };
             txList.push(txObj);

             if (t.status !== "CANCELLED") {
                 // Pastikan channel ada di map, jika tidak ada (custom channel), tambahkan
                 const chName = txObj.channel;
                 if (chMap[chName] === undefined) {
                     chMap[chName] = 0;
                     chCount[chName] = 0;
                 }
                 
                 chMap[chName] += res.gross;
                 chCount[chName] += 1;
                 confirmedBuffer.push(txObj);
             } else {
                 cancelledBuffer.push(txObj);
             }
          });
        });

        const computedSummary = calculateSummary(inputForSummary);
        setSummary(computedSummary);

        // 3. KONVERSI KE ARRAY STATS
        const stats: ChannelStat[] = Object.keys(chMap).map(key => ({
            name: key,
            total: chMap[key],
            count: chCount[key],
            percentage: grossTotalForPct > 0 ? (chMap[key] / grossTotalForPct) * 100 : 0
        }));
        
        // Sort: Gross tertinggi di atas, yang 0 di bawah
        stats.sort((a, b) => b.total - a.total);

        setAllTransactions(txList.sort((a, b) => b.date.localeCompare(a.date)));
        setChannelStats(stats);
        setCancelledList(cancelledBuffer.sort((a, b) => b.date.localeCompare(a.date)));
        setConfirmedList(confirmedBuffer.sort((a, b) => b.date.localeCompare(a.date)));
        setLoading(false);
      } catch (error) { console.error("Error:", error); setLoading(false); }
    };
    fetchData();
  }, [currentMonth, hotelId]);

  // --- FILTER ---
  const filteredConfirmed = confirmedList
    .filter(t => t.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || t.date.includes(searchTerm))
    .slice(0, 10); 

  const filteredCancelled = cancelledList
    .filter(t => t.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || t.date.includes(searchTerm));

  // --- EXPORT EXCEL ---
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const confirmedRows = confirmedList.map(t => ({
        "Tanggal": t.date, "ID Booking": t.bookingId, "Nama Tamu": t.guestName, "Channel": t.channel,
        "Total Tagihan": t.amount, "Fee Nexura": t.displayFee, "Bayar Cash": t.paidCash, "Bayar Transfer": t.paidTransfer,
        "Gap": (t.paidCash + t.paidTransfer) - t.amount
    }));
    
    const totalConfirmed = confirmedList.reduce((acc, curr) => ({
        amount: acc.amount + curr.amount, fee: acc.fee + curr.displayFee,
        cash: acc.cash + curr.paidCash, trf: acc.trf + curr.paidTransfer,
        gap: acc.gap + ((curr.paidCash + curr.paidTransfer) - curr.amount)
    }), { amount: 0, fee: 0, cash: 0, trf: 0, gap: 0 });
    confirmedRows.push({ "Tanggal": "TOTAL", "ID Booking": "", "Nama Tamu": "", "Channel": "", "Total Tagihan": totalConfirmed.amount, "Fee Nexura": totalConfirmed.fee, "Bayar Cash": totalConfirmed.cash, "Bayar Transfer": totalConfirmed.trf, "Gap": totalConfirmed.gap });
    
    const wsConfirmed = XLSX.utils.json_to_sheet(confirmedRows);
    XLSX.utils.book_append_sheet(wb, wsConfirmed, "Transaksi Sukses");

    const cancelledRows = cancelledList.map(t => ({
        "Tanggal": t.date, "Nama Tamu": t.guestName, "Tipe": t.penaltyType, "Alasan": t.cancelReason, "Nominal": t.calculatedPenalty || 0
    }));
    const wsCancelled = XLSX.utils.json_to_sheet(cancelledRows);
    XLSX.utils.book_append_sheet(wb, wsCancelled, "Transaksi Batal");

    const summaryRows = [
        { "ITEM": "Total Omzet", "NILAI": summary.gross }, { "ITEM": "Nexura Sales (Cash)", "NILAI": summary.nexuraSalesCash },
        { "ITEM": "Nexura Sales (Trf)", "NILAI": summary.nexuraSalesTransfer }, { "ITEM": "Walk-in", "NILAI": summary.walkInTotal },
        { "ITEM": "OTA (Net)", "NILAI": summary.otaTotal }, { "ITEM": "Total Fee", "NILAI": summary.fee },
        { "ITEM": "RECONCILE OWNER", "NILAI": summary.finalReconcile }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    XLSX.writeFile(wb, `Laporan_${hotelName}_${currentMonth.toISOString().slice(0,7)}.xlsx`);
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-500">
      
      {/* 1. LUXURY HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white shadow-xl shadow-slate-200/40 sticky top-4 z-30">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-500 hover:text-blue-600 hover:scale-105 transition-all"><ChevronLeft size={16}/></button>
                <div className="px-6 font-black text-slate-700 min-w-[140px] text-center text-sm tracking-tight">
                    {currentMonth.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-500 hover:text-blue-600 hover:scale-105 transition-all"><ChevronRight size={16}/></button>
            </div>
            {!hotelId && <span className="text-rose-500 text-xs font-bold animate-pulse bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">Pilih Hotel Dahulu!</span>}
        </div>
        <button onClick={exportToExcel} className="group flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-slate-300 active:scale-95">
            <Download size={14} className="group-hover:animate-bounce"/> Export Excel Report
        </button>
      </div>

      {/* 2. SUMMARY CARDS */}
      <SummaryCards data={summary} />

      {/* 3. CHANNEL PERFORMANCE (ALL CHANNELS SHOWN) */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
         <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><PieChart size={16} className="text-blue-600"/> Channel Performance</h3>
         </div>
         <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading ? <div className="col-span-3 p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500"/></div> : channelStats.map((ch, idx) => (
                <div 
                    key={idx} 
                    onClick={() => ch.count > 0 && setSelectedChannelDetail(ch.name)}
                    className={`p-4 rounded-2xl bg-white border border-slate-50 transition-all group relative overflow-hidden ${ch.count > 0 ? 'cursor-pointer hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/30 active:scale-[0.98]' : 'opacity-80'}`}
                >
                    <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -z-0 group-hover:from-blue-50 transition-colors"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 relative bg-white rounded-xl shadow-sm p-1.5 shrink-0 border border-slate-100">
                            <Image src={CHANNEL_MAP[ch.name] || CHANNEL_MAP["default"]} alt={ch.name} fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-end mb-1">
                                <span className={`text-xs font-bold truncate ${ch.total > 0 ? 'text-slate-700' : 'text-slate-400'}`}>{ch.name}</span>
                                <span className={`text-xs font-black ${ch.total > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{formatCurrency(ch.total)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${ch.percentage}%` }}></div>
                            </div>
                            <div className="flex justify-between mt-1.5">
                                <div className="flex items-center gap-1">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${ch.count > 0 ? 'text-slate-500 bg-slate-50' : 'text-slate-300 bg-slate-50/50'}`}>{ch.count} TRX</span>
                                    {ch.count > 0 && <ArrowUpRight size={10} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"/>}
                                </div>
                                <span className={`text-[9px] font-bold ${ch.percentage > 0 ? 'text-blue-600' : 'text-slate-300'}`}>{ch.percentage.toFixed(1)}% Share</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* 4. DETAIL TABLES GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* A. CONFIRMED GUESTS */}
          <div className="xl:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full overflow-hidden">
             <div className="p-6 border-b border-slate-50 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><CheckCircle2 size={16}/></div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Confirmed Guests</h3>
                        <p className="text-[10px] text-slate-400 font-medium">10 Transaksi Terakhir</p>
                    </div>
                </div>
                <div className="relative w-full sm:w-auto group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
                    <input type="text" placeholder="Cari nama tamu..." className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 w-full sm:w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-slate-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
             </div>
             
             <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50 border-b border-slate-100">
                       <tr>
                           <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tamu</th>
                           <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tagihan</th>
                           <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredConfirmed.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-slate-400 text-xs italic">Belum ada data transaksi.</td></tr> : filteredConfirmed.map((t, i) => {
                          const gap = (t.paidCash + t.paidTransfer) - t.amount;
                          const initial = t.guestName.charAt(0).toUpperCase();
                          const colors = ["bg-blue-100 text-blue-600", "bg-purple-100 text-purple-600", "bg-emerald-100 text-emerald-600", "bg-orange-100 text-orange-600"];
                          const colorClass = colors[t.guestName.length % colors.length];

                          return (
                            <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="py-4 px-6 align-middle">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-xs font-black shrink-0 border border-white shadow-sm`}>{initial}</div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-xs">{t.guestName}</div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{t.date.split('-')[2]}</span>
                                                <span className="text-[9px] font-medium text-slate-400">{t.channel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right align-middle">
                                    <div className="font-mono font-bold text-slate-700 text-xs">{formatCurrency(t.amount)}</div>
                                    {t.displayFee > 0 && <div className="text-[9px] text-slate-400 font-medium mt-0.5">Fee: {formatCurrency(t.displayFee)}</div>}
                                </td>
                                <td className="py-4 px-6 align-middle">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="flex gap-1">
                                            {t.paidCash > 0 && <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">CASH</span>}
                                            {t.paidTransfer > 0 && <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">TRF</span>}
                                        </div>
                                        {gap !== 0 ? (
                                            <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1"><ArrowUpRight size={8}/> GAP {formatCurrency(gap)}</span>
                                        ) : (
                                            <span className="text-[8px] font-black text-slate-300 tracking-wide">MATCHED</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                          );
                      })}
                   </tbody>
                </table>
             </div>
          </div>

          {/* B. CANCELLED GUESTS */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full overflow-hidden">
             <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100"><Ban size={16}/></div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Cancellations</h3>
                        <p className="text-[10px] text-slate-400 font-medium">Log Pembatalan</p>
                    </div>
                </div>
             </div>
             <div className="overflow-x-auto flex-1 bg-slate-50/30">
                <table className="w-full text-left">
                   <tbody className="divide-y divide-slate-100">
                      {filteredCancelled.length === 0 ? <tr><td className="p-8 text-center text-slate-400 text-xs italic">Tidak ada pembatalan bulan ini.</td></tr> : filteredCancelled.map((t, i) => (
                        <tr key={i} className="hover:bg-white transition-colors group">
                            <td className="p-4 align-top">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-slate-400 font-mono">{t.date}</span>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                        t.penaltyType === 'GUEST' ? 'bg-emerald-100 text-emerald-700' :
                                        t.penaltyType === 'OWNER' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                    }`}>{t.penaltyType}</span>
                                </div>
                                <div className="font-bold text-slate-800 text-xs mb-1">{t.guestName}</div>
                                <div className="p-2 rounded-lg bg-white border border-slate-100 text-[10px] text-slate-500 italic mb-2 leading-relaxed">
                                    "{t.cancelReason}"
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100 border-dashed">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Adjustment</span>
                                    <span className={`font-mono font-bold text-xs ${t.penaltyType === 'GUEST' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.penaltyType === 'GUEST' ? '+' : '-'}{formatCurrency(t.calculatedPenalty || 0)}
                                    </span>
                                </div>
                            </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

      </div>

      {/* 5. CHANNEL DETAIL MODAL */}
      {selectedChannelDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
                  
                  {/* MODAL HEADER */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 relative bg-white rounded-2xl shadow-sm p-2 border border-slate-100">
                              <Image src={CHANNEL_MAP[selectedChannelDetail] || CHANNEL_MAP["default"]} alt={selectedChannelDetail} fill className="object-contain" />
                          </div>
                          <div>
                              <h3 className="text-lg font-black text-slate-800 tracking-tight">{selectedChannelDetail}</h3>
                              <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                                  <Users size={12}/> Detail Tamu Bulan {currentMonth.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}
                              </p>
                          </div>
                      </div>
                      <button 
                        onClick={() => setSelectedChannelDetail(null)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-400 hover:text-rose-500 hover:scale-110 transition-all border border-slate-100"
                      >
                          <X size={20}/>
                      </button>
                  </div>

                  {/* MODAL CONTENT */}
                  <div className="flex-1 overflow-y-auto">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-100">
                              <tr>
                                  <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tamu & Tanggal</th>
                                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Booking</th>
                                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe Kamar</th>
                                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Nominal</th>
                                  <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {confirmedList.filter(t => t.channel === selectedChannelDetail).map((t, i) => {
                                  const gap = (t.paidCash + t.paidTransfer) - t.amount;
                                  return (
                                      <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                          <td className="py-4 px-8">
                                              <div className="font-bold text-slate-800 text-xs">{t.guestName}</div>
                                              <div className="text-[10px] text-slate-400 font-medium mt-0.5">{t.date}</div>
                                          </td>
                                          <td className="py-4 px-4 text-xs font-mono text-slate-500">{t.bookingId}</td>
                                          <td className="py-4 px-4 text-xs font-medium text-slate-600">{t.roomType}</td>
                                          <td className="py-4 px-4 text-right">
                                              <div className="font-mono font-bold text-slate-800 text-xs">{formatCurrency(t.amount)}</div>
                                              {t.displayFee > 0 && <div className="text-[9px] text-slate-400 font-bold">Fee: {formatCurrency(t.displayFee)}</div>}
                                          </td>
                                          <td className="py-4 px-8">
                                              <div className="flex flex-col items-center gap-1">
                                                  <div className="flex gap-1">
                                                      {t.paidCash > 0 && <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">CASH</span>}
                                                      {t.paidTransfer > 0 && <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">TRF</span>}
                                                  </div>
                                                  {gap !== 0 ? (
                                                      <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">GAP {formatCurrency(gap)}</span>
                                                  ) : (
                                                      <span className="text-[8px] font-black text-slate-300">MATCHED</span>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>

                  {/* MODAL FOOTER */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex gap-8">
                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Transaksi</p>
                              <p className="text-sm font-black text-slate-800">{confirmedList.filter(t => t.channel === selectedChannelDetail).length} TRX</p>
                          </div>
                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Omzet</p>
                              <p className="text-sm font-black text-blue-600">{formatCurrency(confirmedList.filter(t => t.channel === selectedChannelDetail).reduce((acc, curr) => acc + curr.amount, 0))}</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => setSelectedChannelDetail(null)}
                        className="px-8 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200 transition-all active:scale-95"
                      >
                          Tutup Detail
                      </button>
                  </div>

              </div>
          </div>
      )}
    </div>
  );
}
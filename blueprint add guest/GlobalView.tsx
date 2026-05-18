"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import * as XLSX from "xlsx";
import { 
  ChevronLeft, ChevronRight, Download, Loader2, 
  PieChart, Ban, Building2, Calendar, ArrowRightLeft
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; 

// IMPORT RUMUS & KOMPONEN SENTRAL
import { 
  calculateTransaction, 
  calculateSummary,
  formatCurrency, 
  TransactionInput 
} from "@/lib/finance-utils";
import SummaryCards from "./SummaryCards";

// --- TYPE DEFINITIONS ---
type Hotel = {
  id: string;
  name: string;
};

type ChannelPerformanceDetail = {
  name: string;
  gross: number;
  nett: number;
  gap: number;
  count: number;
  percentage: number;
};

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

export default function GlobalView() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  
  const [hotelPerformance, setHotelPerformance] = useState<any[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformanceDetail[]>([]);
  const [cancellationList, setCancellationList] = useState<any[]>([]);
  
  const [summary, setSummary] = useState<any>({
    gross: 0, fee: 0, totalGap: 0, ownerPenalty: 0, ownerNetRight: 0,
    nexuraSalesCash: 0, nexuraSalesTransfer: 0, walkInTotal: 0, otaTotal: 0,
    finalReconcile: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Semua Hotel untuk inisialisasi (agar yg 0 tetap muncul)
        const hotelsSnap = await getDocs(collection(db, "properties"));
        const hotelList: Hotel[] = [];
        const hotelMap: Record<string, string> = {};
        
        hotelsSnap.forEach(doc => {
            const d = doc.data();
            const name = d.Nama || d.name || "Unnamed Hotel";
            hotelList.push({ id: doc.id, name });
            hotelMap[doc.id] = name;
        });

        // 2. Define Range Tanggal
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate(); 
        const endStr = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        const q = query(
          collection(db, "daily_revenue"),
          where("date", ">=", startStr),
          where("date", "<=", endStr)
        );
        const querySnapshot = await getDocs(q);

        // 3. Inisialisasi Accumulator
        const hotelStatsMap: Record<string, { inputs: TransactionInput[], gross: number }> = {};
        hotelList.forEach(h => {
            hotelStatsMap[h.id] = { inputs: [], gross: 0 };
        });

        const channelStatsMap: Record<string, ChannelPerformanceDetail> = {};
        Object.keys(CHANNEL_MAP).forEach(chKey => {
            if(chKey !== "default") {
                channelStatsMap[chKey] = { name: chKey, gross: 0, nett: 0, gap: 0, count: 0, percentage: 0 };
            }
        });

        const globalInputs: TransactionInput[] = [];
        const cancels: any[] = [];

        // 4. Proses Transaksi
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const hId = data.hotelId;
            const entries = data.entries || [];
            
            if (!hotelStatsMap[hId]) hotelStatsMap[hId] = { inputs: [], gross: 0 };

            entries.forEach((t: any) => {
                const input: TransactionInput = {
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

                const res = calculateTransaction(input);
                globalInputs.push(input);
                hotelStatsMap[hId].inputs.push(input);

                if (input.status !== "CANCELLED") {
                    hotelStatsMap[hId].gross += res.gross;
                    if (channelStatsMap[input.channel]) {
                        channelStatsMap[input.channel].gross += res.gross;
                        channelStatsMap[input.channel].nett += (res.ownerCash + res.nexuraCash);
                        channelStatsMap[input.channel].gap += res.gap;
                        channelStatsMap[input.channel].count += 1;
                    }
                } else {
                    cancels.push({ ...t, hotelName: hotelMap[hId], date: data.date });
                }
            });
        });

        // 5. Finalize Global Summary
        const computedGlobal = calculateSummary(globalInputs);
        setSummary(computedGlobal);

        // 6. Finalize Hotel Performance
        const hotelStatsArray = hotelList.map(h => {
            const stats = calculateSummary(hotelStatsMap[h.id].inputs);
            return {
                id: h.id,
                name: h.name,
                gross: stats.gross,
                reconcile: stats.finalReconcile,
                percentage: computedGlobal.gross > 0 ? (stats.gross / computedGlobal.gross) * 100 : 0
            };
        }).sort((a, b) => b.gross - a.gross);

        // 7. Finalize Channel Performance
        const channelStatsArray = Object.values(channelStatsMap).map(c => ({
            ...c,
            percentage: computedGlobal.gross > 0 ? (c.gross / computedGlobal.gross) * 100 : 0
        })).sort((a, b) => b.gross - a.gross);

        setHotelPerformance(hotelStatsArray);
        setChannelPerformance(channelStatsArray);
        setCancellationList(cancels.sort((a, b) => b.date.localeCompare(a.date)));

      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, [currentMonth]);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-2">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-500"><ChevronLeft size={18}/></button>
            <div className="px-4 font-bold text-slate-700 min-w-[140px] text-center">
                {currentMonth.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-500"><ChevronRight size={18}/></button>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black uppercase text-slate-500 tracking-tighter">Enterprise Global Overview</span>
        </div>
      </div>

      {/* SUMMARY CARDS (KOMPONEN SENTRAL) */}
      <SummaryCards data={summary} />

      {/* GRID PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHANNEL PERFORMANCE */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-blue-600"/> Channel Performance
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 text-xs">
            {channelPerformance.map((c) => (
                <div key={c.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 relative bg-white rounded-lg shadow-sm p-1 shrink-0 border border-slate-100">
                            <Image src={CHANNEL_MAP[c.name] || CHANNEL_MAP["default"]} alt={c.name} fill className="object-contain" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">{c.name}</span>
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{(c.percentage || 0).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${c.percentage || 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] pt-2 border-t border-slate-100 font-mono">
                        <div><span className="block text-slate-400 uppercase text-[8px]">Gross</span>{formatCurrency(c.gross)}</div>
                        <div><span className="block text-slate-400 uppercase text-[8px]">Nett</span>{formatCurrency(c.nett)}</div>
                        <div><span className="block text-slate-400 uppercase text-[8px]">Gap</span>{formatCurrency(c.gap)}</div>
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* HOTEL PERFORMANCE */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full max-h-[600px]">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Building2 size={20} className="text-emerald-600"/> Top Hotels Revenue
          </h3>
          <div className="space-y-4 overflow-y-auto pr-2">
            {hotelPerformance.map((h, idx) => (
                <div key={h.id} className="group p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${idx < 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>#{idx + 1}</span>
                      <span className="font-bold text-slate-700">{h.name}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">{formatCurrency(h.gross)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] bg-white p-2 rounded-lg border border-slate-50 justify-between font-mono">
                    <div><span className="text-slate-400 uppercase mr-2">Market Share</span>{h.percentage.toFixed(1)}%</div>
                    <div><span className="text-slate-400 uppercase mr-2">Reconcile</span><span className={h.reconcile >= 0 ? "text-teal-600" : "text-rose-600"}>{formatCurrency(h.reconcile)}</span></div>
                  </div>
                </div>
            ))}
          </div>
        </div>

      </div>

      {/* CANCELLATIONS */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
         <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-red-600"><Ban size={20}/> Global Cancellations</h3>
         <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 sticky top-0 font-bold uppercase tracking-tighter">
                    <tr><th className="p-3">Tanggal</th><th className="p-3">Hotel</th><th className="p-3">Tamu</th><th className="p-3">Status</th><th className="p-3 text-right">Nominal</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                    {cancellationList.map((c, idx) => (
                        <tr key={idx} className="hover:bg-red-50/20">
                            <td className="p-3 font-mono text-slate-400">{c.date}</td>
                            <td className="p-3 font-bold text-slate-700">{c.hotelName}</td>
                            <td className="p-3"><div>{c.guestName}</div><div className="text-[10px] text-slate-400">{c.channel}</div></td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold uppercase text-[9px]">{c.penaltyType}</span></td>
                            <td className="p-3 text-right font-mono font-bold text-red-600">-{formatCurrency(c.penaltyAmount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
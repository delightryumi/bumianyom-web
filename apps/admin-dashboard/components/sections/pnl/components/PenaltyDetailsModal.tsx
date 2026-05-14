import React from "react";
import { X, Calendar, Building2, AlertCircle, User } from "lucide-react";
import { formatIDR } from "@/lib/pnl-utils";

interface PenaltyDetailsModalProps {
  show: boolean;
  onClose: () => void;
  transactions: any[]; 
  hotels: { id: string; name: string }[];
}

export default function PenaltyDetailsModal({ show, onClose, transactions, hotels }: PenaltyDetailsModalProps) {
  if (!show) return null;

  const totalPenalty = transactions.reduce((acc, t) => acc + (t.penaltyAmount || 0), 0);
  const getHotelName = (id: string) => hotels.find(h => h.id === id)?.name || "Unknown Property";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-outfit">
        
        {/* HEADER */}
        <div className="p-6 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                <AlertCircle size={20}/>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-rose-900 uppercase tracking-tight">Penalty Fee Details</h3>
                <p className="text-xs text-rose-500 font-medium">{transactions.length} Transactions Found</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-rose-400 hover:text-rose-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto flex-1 p-0 pnl-scrollbar">
            {transactions.length === 0 ? (
                <div className="p-10 text-center text-slate-400 italic">No penalty transactions found in this period.</div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase sticky top-0 z-10 border-b border-slate-100">
                        <tr>
                            <th className="py-3 px-6">Date</th>
                            <th className="py-3 px-6">Guest Detail</th>
                            <th className="py-3 px-6">Property</th>
                            <th className="py-3 px-6">Type</th>
                            <th className="py-3 px-6 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {transactions.map((t, idx) => (
                            <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                                <td className="py-3 px-6 text-slate-600 font-mono-jb text-xs">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-slate-300"/>
                                        {t.date || "-"}
                                    </div>
                                </td>
                                <td className="py-3 px-6">
                                    <div className="font-semibold text-slate-800 text-xs flex items-center gap-2">
                                        <User size={12} className="text-slate-400"/>
                                        {t.guestName || "Guest Unknown"}
                                    </div>
                                </td>
                                <td className="py-3 px-6">
                                    <div className="font-medium text-slate-600 text-xs flex items-center gap-2">
                                        <Building2 size={12} className="text-slate-300"/>
                                        {getHotelName(t.propertyId)}
                                    </div>
                                </td>
                                <td className="py-3 px-6">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold border uppercase tracking-wider ${t.penaltyType === 'GUEST' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                        {t.penaltyType}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-right font-mono-jb font-semibold text-rose-600">
                                    +{formatIDR(t.penaltyAmount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {/* FOOTER TOTAL */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Penalty</span>
            <span className="text-xl font-semibold text-rose-600 font-mono-jb">{formatIDR(totalPenalty)}</span>
        </div>

      </div>
    </div>
  );
}
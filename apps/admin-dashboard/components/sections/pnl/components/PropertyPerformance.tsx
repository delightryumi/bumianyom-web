import React from "react";
import { Home, AlertCircle } from "lucide-react";
import { formatIDR } from "@/lib/pnl-utils";

type PropertyStat = {
  id: string; 
  name: string; 
  gross: number;
  payAtHotel: number; 
  payAtNexura: number;
  nett: number; 
  gap: number; 
  count: number;
  penalty: number;
  fee: number;
  ownerNet: number;
};

export default function PropertyPerformance({ propertyStats, totalHotels }: { propertyStats: PropertyStat[], totalHotels: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xl mb-12 font-outfit overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl"><Home size={22} /></div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Property Performance</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Audit Data • {totalHotels} Managed Units
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Global Status:</span>
            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">Active Settlement</span>
        </div>
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="grid grid-cols-1 md:hidden gap-6">
        {propertyStats.map((prop, i) => (
          <div key={prop.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold">
                      {String(i + 1).padStart(2, '0')}
                   </div>
                   <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-tight">{prop.name}</h4>
                </div>
                <div className="text-right">
                   <p className="text-[9px] text-slate-400 font-semibold uppercase">Gross</p>
                   <p className="text-sm font-semibold font-mono-jb">{formatIDR(prop.gross)}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-100">
                    <p className="text-[8px] text-slate-400 font-semibold uppercase mb-1">Cash @Hotel</p>
                    <p className="text-xs font-semibold font-mono-jb text-rose-500">-{formatIDR(prop.payAtHotel).replace("Rp ", "")}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-100">
                    <p className="text-[8px] text-slate-400 font-semibold uppercase mb-1">Mgmt Fee</p>
                    <p className="text-xs font-semibold font-mono-jb text-amber-500">-{formatIDR(prop.fee).replace("Rp ", "")}</p>
                </div>
             </div>

             <div className="p-5 bg-slate-900 rounded-xl text-white flex justify-between items-center">
                <div>
                   <p className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest">Net Settlement</p>
                   <p className="text-lg font-semibold font-mono-jb text-emerald-400">{formatIDR(prop.nett)}</p>
                </div>
                {prop.gap !== 0 ? (
                    <AlertCircle size={20} className="text-rose-500"/>
                ) : (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
             </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto pnl-scrollbar pb-4">
        <table className="w-full text-sm text-left min-w-[1100px] border-separate border-spacing-y-4">
          <thead className="bg-[#111310] text-zinc-500 font-semibold text-[9px] uppercase tracking-[0.2em]">
            <tr>
              <th className="py-5 px-8 rounded-l-xl w-[300px]">Property Identity</th>
              <th className="py-5 px-6 text-right">Gross (Sales)</th>
              <th className="py-5 px-6 text-right">Cash @Hotel</th>
              <th className="py-5 px-6 text-right">Mgmt Fee</th>
              <th className="py-5 px-6 text-right">Penalty</th>
              <th className="py-5 px-6 text-right bg-slate-800 text-emerald-400 border-x border-white/5">Net Settlement</th>
              <th className="py-5 px-8 text-right rounded-r-xl">Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {propertyStats.map((prop, i) => (
              <tr key={prop.id} className="group transition-all">
                <td className="bg-slate-50/80 rounded-l-2xl py-6 px-8 group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-white border border-slate-200 text-slate-400 rounded-lg flex items-center justify-center text-[10px] font-bold group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">{String(i + 1).padStart(2, '0')}</div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider truncate max-w-[180px]">{prop.name}</div>
                      <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-1">{prop.count} Bookings</div>
                    </div>
                  </div>
                </td>
                <td className="bg-slate-50/80 py-6 px-6 text-right group-hover:bg-slate-100 transition-colors">
                  <span className="font-mono-jb font-semibold text-slate-900 text-sm tracking-tighter">{formatIDR(prop.gross)}</span>
                  <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Total Sales</div>
                </td>
                <td className="bg-slate-50/80 py-6 px-6 text-right group-hover:bg-slate-100 transition-colors">
                   <div className="flex items-center justify-end gap-1.5 text-rose-500 font-mono-jb font-semibold text-xs">
                      -{formatIDR(prop.payAtHotel).replace("Rp ", "")}
                   </div>
                   <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Deduction</div>
                </td>
                <td className="bg-slate-50/80 py-6 px-6 text-right group-hover:bg-slate-100 transition-colors">
                   <div className="flex items-center justify-end gap-1.5 text-amber-500 font-mono-jb font-semibold text-xs">
                      -{formatIDR(prop.fee).replace("Rp ", "")}
                   </div>
                   <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Management</div>
                </td>
                <td className="bg-slate-50/80 py-6 px-6 text-right group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-end gap-1.5 text-rose-500 font-mono-jb font-semibold text-xs">
                    {prop.penalty > 0 ? `-${formatIDR(prop.penalty).replace("Rp ", "")}` : <span className="text-slate-200">—</span>}
                  </div>
                </td>
                <td className="bg-slate-900 py-6 px-6 text-right border-x border-white/5 group-hover:bg-black transition-colors">
                   <div className="flex items-center justify-end gap-2 text-emerald-400">
                      <span className="font-mono-jb font-semibold text-base tracking-tighter">{formatIDR(prop.nett)}</span>
                   </div>
                   <div className="text-[8px] text-white/40 font-semibold uppercase tracking-[0.2em] mt-1">Payout Balance</div>
                </td>
                <td className="bg-slate-50/80 rounded-r-2xl py-6 px-8 text-right group-hover:bg-slate-100 transition-colors">
                  <div className="flex justify-end">
                    {prop.gap !== 0 ? (
                      <span className="flex items-center gap-2 text-[9px] font-semibold text-rose-600 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 uppercase tracking-widest shadow-sm">
                        <AlertCircle size={12} /> Discrepancy
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Confirmed
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
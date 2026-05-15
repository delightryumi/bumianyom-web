"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    Plus, Trash2, Receipt, Search, 
    Edit2, Check, X, Tag, Calendar as CalendarIcon,
    AlertCircle, Save, Layers, Minus, Zap, Monitor, Users, MoreHorizontal, ChevronDown
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PnlExpenseItem, formatIDR } from "@/lib/pnl-utils";

const SAGE = "#788069";
const PEACH = "#ffd8a6";
const RICH_BLACK = "#1A1C14";

const CATEGORIES = [
    { label: "Electricity", icon: Zap, color: "text-amber-500" },
    { label: "System", icon: Monitor, color: "text-blue-500" },
    { label: "Payroll", icon: Users, color: "text-purple-500" },
    { label: "Other", icon: Tag, color: "text-stone-400" },
];

const getCategoryIcon = (category: string) => {
    const found = CATEGORIES.find(c => c.label.toLowerCase() === category.toLowerCase());
    return found ? found.icon : Tag;
};

const rise = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface ExpenseSectionProps {
    month: string;
    expenses: PnlExpenseItem[];
    onRefresh: () => void;
}

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({ month, expenses, onRefresh }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<PnlExpenseItem | null>(null);
    const [activeRowIdx, setActiveRowIdx] = useState<number | null>(null);
    
    // Support multiple rows in "Add" mode
    const [newRows, setNewRows] = useState<Partial<PnlExpenseItem>[]>([
        { category: "", description: "", amount: 0, date: new Date().toISOString().split('T')[0] }
    ]);
    
    const [loading, setLoading] = useState(false);

    const addRow = () => {
        setNewRows([...newRows, { category: "", description: "", amount: 0, date: new Date().toISOString().split('T')[0] }]);
    };

    const removeRow = (index: number) => {
        if (newRows.length <= 1) return;
        const updated = [...newRows];
        updated.splice(index, 1);
        setNewRows(updated);
    };

    const handleSaveAll = async () => {
        const validRows = newRows.filter(r => r.category && r.amount);
        if (validRows.length === 0) {
            alert("Please fill in at least one valid expense (Category & Amount)");
            return;
        }

        setLoading(true);
        try {
            const newEntries = validRows.map(r => ({
                ...r,
                id: Math.random().toString(36).substr(2, 9) + Date.now().toString(),
            } as PnlExpenseItem));

            const updatedExpenses = [...expenses, ...newEntries];
            const docRef = doc(db, "global_pnl_reports", month);
            await setDoc(docRef, { expenses: updatedExpenses }, { merge: true });
            
            setNewRows([{ category: "", description: "", amount: 0, date: new Date().toISOString().split('T')[0] }]);
            setIsAdding(false);
            onRefresh();
        } catch (error) {
            console.error("Failed to add expenses:", error);
            alert("Failed to save expenses.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (item: PnlExpenseItem) => {
        setEditingId(item.id || null);
        setEditData({ ...item });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData(null);
    };

    const handleSaveEdit = async () => {
        if (!editData || !editingId) return;

        setLoading(true);
        try {
            const updatedExpenses = expenses.map(e => e.id === editingId ? editData : e);
            const docRef = doc(db, "global_pnl_reports", month);
            await setDoc(docRef, { expenses: updatedExpenses }, { merge: true });
            
            setEditingId(null);
            setEditData(null);
            onRefresh();
        } catch (error) {
            console.error("Failed to update expense:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;

        setLoading(true);
        try {
            const updatedExpenses = expenses.filter(e => e.id !== id);
            const docRef = doc(db, "global_pnl_reports", month);
            await setDoc(docRef, { expenses: updatedExpenses }, { merge: true });
            onRefresh();
        } catch (error) {
            console.error("Failed to delete expense:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.section 
            variants={rise} 
            initial="hidden"
            animate="show"
            className="flex flex-col gap-14 w-full mt-24 mb-32"
        >
            {/* Header - Reverted to Standard Layout */}
            <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                        Operational <span style={{ color: SAGE }}>Expenses</span>
                    </h2>
                    <p className="text-[10px] font-medium text-stone-400 uppercase tracking-[0.3em]">Bulk Entry & Audit Ledger</p>
                </div>

                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-3 h-11 px-8 rounded-xl text-[11px] font-bold tracking-widest transition-all shadow-sm border border-stone-200/40 hover:bg-white active:scale-95 uppercase"
                    style={{ backgroundColor: PEACH, color: RICH_BLACK }}
                >
                    {isAdding ? <X size={14} /> : <Plus size={14} />}
                    {isAdding ? "Cancel Entry" : "Add Expense"}
                </button>
            </div>

            {/* Bulk Input Form - Explicit 50px Padding */}
            <AnimatePresence mode="popLayout">
                {isAdding && (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        className="bg-white p-6 md:p-8 lg:p-12 rounded-[24px] border border-stone-100 shadow-2xl flex flex-col gap-10 md:gap-14 mb-4 w-full"
                    >
                        <div className="flex items-center justify-between border-b border-stone-50 pb-10">
                            <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">Bulk Recording • {newRows.length} item(s)</span>
                        </div>

                        <div className="flex flex-col gap-10">
                            {newRows.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-8 items-end pb-10 border-b border-stone-50/50 last:border-0 group">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-medium text-stone-400 uppercase tracking-widest">Date</label>
                                        <input 
                                            type="date" 
                                            className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-100 focus:bg-white focus:border-sage outline-none text-sm transition-all font-medium"
                                            value={row.date}
                                            onChange={e => {
                                                const updated = [...newRows];
                                                updated[idx].date = e.target.value;
                                                setNewRows(updated);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-3 relative">
                                        <label className="text-[9px] font-medium text-stone-400 uppercase tracking-widest">Category</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                placeholder="Type or select..." 
                                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-100 focus:bg-white focus:border-sage outline-none text-sm transition-all font-medium pr-10 text-stone-800"
                                                value={row.category}
                                                onFocus={() => setActiveRowIdx(idx)}
                                                onBlur={() => setTimeout(() => setActiveRowIdx(null), 200)}
                                                onChange={e => {
                                                    const updated = [...newRows];
                                                    updated[idx].category = e.target.value;
                                                    setNewRows(updated);
                                                }}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none">
                                                <ChevronDown size={14} />
                                            </div>
                                            
                                            {activeRowIdx === idx && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    className="absolute top-full left-0 w-full mt-3 bg-white border border-stone-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] p-2 overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-1 gap-1">
                                                        {CATEGORIES.map((cat) => (
                                                            <button 
                                                                key={cat.label}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    const updated = [...newRows];
                                                                    updated[idx].category = cat.label;
                                                                    setNewRows(updated);
                                                                    setActiveRowIdx(null);
                                                                }}
                                                                className={`w-full px-4 py-3.5 flex items-center gap-4 rounded-xl transition-all group/item ${row.category === cat.label ? 'bg-sage/10' : 'hover:bg-stone-50'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${row.category === cat.label ? 'bg-white shadow-sm' : 'bg-stone-50 group-hover/item:bg-white'}`}>
                                                                    <cat.icon size={18} className={row.category === cat.label ? 'text-sage' : 'text-stone-400 group-hover/item:text-sage'} />
                                                                </div>
                                                                <div className="flex flex-col items-start">
                                                                    <span className={`text-[13px] font-medium tracking-tight ${row.category === cat.label ? 'text-stone-900' : 'text-stone-600'}`}>{cat.label}</span>
                                                                    <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">Preset Option</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-medium text-stone-400 uppercase tracking-widest">Amount (IDR)</label>
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-100 focus:bg-white focus:border-sage outline-none text-sm font-medium transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={row.amount || ""}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            onChange={e => {
                                                const updated = [...newRows];
                                                updated[idx].amount = Number(e.target.value);
                                                setNewRows(updated);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[9px] font-medium text-stone-400 uppercase tracking-widest">Description</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="text" 
                                                placeholder="Notes..." 
                                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-100 focus:bg-white focus:border-sage outline-none text-sm transition-all font-medium"
                                                value={row.description}
                                                onChange={e => {
                                                    const updated = [...newRows];
                                                    updated[idx].description = e.target.value;
                                                    setNewRows(updated);
                                                }}
                                            />
                                            {newRows.length > 1 && (
                                                <button onClick={() => removeRow(idx)} className="p-3 rounded-xl bg-red-50 text-red-300 hover:text-red-500 transition-colors">
                                                    <Minus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-10 border-t border-stone-50">
                            <button 
                                onClick={addRow}
                                className="flex items-center gap-3 h-12 px-8 rounded-xl text-[11px] font-bold text-stone-900 uppercase tracking-widest transition-all hover:bg-stone-50 active:scale-95 border border-stone-100 shadow-sm"
                            >
                                <Plus size={16} className="text-sage" /> Add Another Row
                            </button>

                            <button 
                                onClick={handleSaveAll}
                                disabled={loading}
                                className="h-12 px-12 rounded-xl flex items-center justify-center gap-4 text-white font-medium text-[11px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95"
                                style={{ backgroundColor: SAGE }}
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save All Entries</>}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Audit Ledger - Explicit 50px Padding */}
            <div 
                className="bg-white p-6 md:p-8 lg:p-12 rounded-[24px] border border-stone-100 shadow-xl overflow-hidden w-full"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-stone-50 text-[10px] uppercase font-medium text-stone-300 tracking-[0.15em]">
                                <th className="pb-10 px-6">Date</th>
                                <th className="pb-10 px-6">Category</th>
                                <th className="pb-10 px-6">Description</th>
                                <th className="pb-10 px-6 text-right">Amount</th>
                                <th className="pb-10 px-6 text-center w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-200">
                                                <AlertCircle size={24} />
                                            </div>
                                            <span className="text-[10px] font-medium text-stone-300 uppercase tracking-widest">
                                                No manual expenses recorded for this period
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                [...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, i) => {
                                    const Icon = getCategoryIcon(item.category);
                                    return (
                                        <tr key={item.id || i} className={`group border-b border-stone-50 last:border-0 transition-colors duration-150 ${editingId === item.id ? 'bg-sage/5' : 'hover:bg-stone-50/40'}`}>
                                            <td className="py-8 px-6">
                                                {editingId === item.id ? (
                                                    <input 
                                                        type="date"
                                                        className="w-full h-10 px-3 rounded-lg border border-sage/30 bg-white text-sm outline-none focus:border-sage font-medium"
                                                        value={editData?.date || ""}
                                                        onChange={e => setEditData(d => d ? {...d, date: e.target.value} : null)}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-stone-400">
                                                        <CalendarIcon size={12} />
                                                        <span className="text-xs font-medium uppercase tracking-tight">{item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—'}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-8 px-6">
                                                {editingId === item.id ? (
                                                    <div className="relative">
                                                        <input 
                                                            className="w-full h-10 px-3 rounded-lg border border-sage/30 bg-white text-sm outline-none focus:border-sage font-medium"
                                                            value={editData?.category || ""}
                                                            onFocus={() => setActiveRowIdx(-1)}
                                                            onBlur={() => setTimeout(() => setActiveRowIdx(null), 200)}
                                                            onChange={e => setEditData(d => d ? {...d, category: e.target.value} : null)}
                                                        />
                                                        {activeRowIdx === -1 && (
                                                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-stone-100 rounded-xl shadow-2xl z-[100] py-1 overflow-hidden ring-4 ring-black/5">
                                                                {CATEGORIES.map((cat) => (
                                                                    <button 
                                                                        key={cat.label}
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();
                                                                            setEditData(d => d ? {...d, category: cat.label} : null);
                                                                            setActiveRowIdx(null);
                                                                        }}
                                                                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-stone-50 text-[11px] font-medium text-stone-600 transition-colors text-left"
                                                                    >
                                                                        <cat.icon size={12} className={cat.color} />
                                                                        {cat.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 group-hover:text-sage transition-colors">
                                                            <Icon size={12} />
                                                        </div>
                                                        <span className="text-sm font-medium text-stone-800 uppercase tracking-tight">{item.category}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-8 px-6">
                                                {editingId === item.id ? (
                                                    <input 
                                                        className="w-full h-10 px-3 rounded-lg border border-sage/30 bg-white text-sm outline-none focus:border-sage font-medium"
                                                        value={editData?.description || ""}
                                                        onChange={e => setEditData(d => d ? {...d, description: e.target.value} : null)}
                                                    />
                                                ) : (
                                                    <span className="text-[11px] text-stone-500 font-medium italic">{item.description || "—"}</span>
                                                )}
                                            </td>
                                            <td className="py-8 px-6 text-right">
                                                {editingId === item.id ? (
                                                    <input 
                                                        type="number"
                                                        className="w-full h-10 px-3 rounded-lg border border-sage/30 bg-white text-sm outline-none focus:border-sage text-right font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        value={editData?.amount || ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        onChange={e => setEditData(d => d ? {...d, amount: Number(e.target.value)} : null)}
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium text-stone-900">Rp {item.amount.toLocaleString('id-ID')}</span>
                                                )}
                                            </td>
                                            <td className="py-8 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {editingId === item.id ? (
                                                        <>
                                                            <button onClick={handleSaveEdit} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                                                                <Check size={14} />
                                                            </button>
                                                            <button onClick={handleCancelEdit} className="p-1.5 rounded-lg bg-stone-100 text-stone-400 hover:bg-stone-200 transition-colors">
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleStartEdit(item)}
                                                                className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-100 text-stone-300 hover:text-sage transition-colors"
                                                            >
                                                                <Edit2 size={13} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteExpense(item.id || "")}
                                                                className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-100 text-stone-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.section>
    );
};

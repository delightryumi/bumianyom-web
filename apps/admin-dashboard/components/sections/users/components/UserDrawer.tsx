import React from "react";
import { motion } from "framer-motion";
import { X, Plus, User, Mail, RefreshCw, Check, Lock, Key } from "lucide-react";
import { UserProfile } from "../types";

interface UserDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser: UserProfile | null;
    formData: any;
    setFormData: (data: any) => void;
    roles: string[];
    onSave: () => void;
    isSaving?: boolean;
}

const SAGE = "#788069";

export const UserDrawer: React.FC<UserDrawerProps> = ({ 
    isOpen, onClose, editingUser, formData, setFormData, roles, onSave, isSaving 
}) => {
    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className={`fixed inset-0 z-[500] bg-stone-900/40 backdrop-blur-[2px] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            />
            <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: isOpen ? 0 : "100%" }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-[501] flex flex-col font-sans"
            >
                <header className="p-8 border-b border-stone-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-6 h-6 rounded bg-sage/10 flex items-center justify-center text-sage" style={{ backgroundColor: `${SAGE}1A`, color: SAGE }}>
                                <Plus size={12} />
                            </div>
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Administrative Action</span>
                        </div>
                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                            {editingUser ? 'Update' : 'New'} <span style={{ color: SAGE }}>Personnel</span>
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors shadow-sm"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-12 py-10 space-y-8 custom-scrollbar">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 flex items-center pointer-events-none text-stone-300 group-focus-within:text-sage transition-colors" style={{ left: '1.5rem' }}>
                                <User size={16} />
                            </div>
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Enter full name"
                                className="w-full h-14 pr-4 bg-stone-50 border border-stone-100 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-sage transition-all shadow-sm focus:shadow-md"
                                style={{ paddingLeft: '4.5rem' }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 flex items-center pointer-events-none text-stone-300 group-focus-within:text-sage transition-colors" style={{ left: '1.5rem' }}>
                                <Mail size={16} />
                            </div>
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="user@example.com"
                                disabled={!!editingUser}
                                className="w-full h-14 pr-4 bg-stone-50 border border-stone-100 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-sage transition-all disabled:opacity-50 shadow-sm focus:shadow-md"
                                style={{ paddingLeft: '4.5rem' }}
                            />
                        </div>
                    </div>

                    {!editingUser && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Initial Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 flex items-center pointer-events-none text-stone-300 group-focus-within:text-sage transition-colors" style={{ left: '1.5rem' }}>
                                    <Lock size={16} />
                                </div>
                                <input 
                                    type="password"
                                    value={formData.password || ""}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="••••••••"
                                    className="w-full h-14 pr-4 bg-stone-50 border border-stone-100 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-sage transition-all shadow-sm focus:shadow-md"
                                    style={{ paddingLeft: '4.5rem' }}
                                />
                            </div>
                        </div>
                    )}

                    {editingUser && (
                        <div className="pt-2">
                            <button 
                                onClick={() => alert("Password reset link sent to user email.")}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sage hover:text-stone-900 transition-colors group/reset"
                                style={{ color: SAGE }}
                            >
                                <div className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center group-hover/reset:scale-110 transition-transform">
                                    <Key size={14} />
                                </div>
                                <span>Reset User Password</span>
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Organizational Role</label>
                            <span className="text-[9px] font-bold text-sage bg-sage/5 px-2 py-0.5 rounded-full uppercase tracking-tighter" style={{ color: SAGE, backgroundColor: `${SAGE}0D` }}>Level {formData.role === "superadmin" ? '5' : '3'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map((role) => (
                                <button 
                                    key={role}
                                    onClick={() => setFormData({...formData, role})}
                                    className={`h-12 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === role ? 'bg-sage border-sage text-white shadow-lg shadow-sage/20 scale-[1.02]' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-300'}`}
                                    style={{ 
                                        backgroundColor: formData.role === role ? SAGE : undefined,
                                        borderColor: formData.role === role ? SAGE : undefined
                                    }}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="px-12 py-8 bg-stone-50/50 border-t border-stone-100 flex flex-col gap-4">
                    <button 
                        onClick={onSave}
                        disabled={isSaving}
                        className="w-full h-14 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-sage/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: SAGE }}
                    >
                        {isSaving ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            editingUser ? <RefreshCw size={16} /> : <Check size={16} />
                        )}
                        {isSaving 
                            ? 'Processing...' 
                            : (editingUser ? 'Update Personnel Profile' : 'Confirm & Create Personnel')
                        }
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full h-12 rounded-xl border border-stone-200 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:bg-white hover:text-stone-600 transition-all"
                    >
                        Cancel
                    </button>
                </footer>
            </motion.div>
        </>
    );
};

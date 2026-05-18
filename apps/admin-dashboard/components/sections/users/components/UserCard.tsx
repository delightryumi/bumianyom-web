import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Edit3, Trash2, Lock } from "lucide-react";
import { UserProfile } from "../types";

interface UserCardProps {
    user: UserProfile;
    onEdit: (user: UserProfile) => void;
    onDelete: (id: string, name: string) => void;
    variants: any;
}

const SAGE = "#788069";

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, variants }) => {
    return (
        <motion.div 
            variants={variants}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative flex flex-col gap-8 p-7 rounded-xl bg-white border border-stone-100 shadow-xl shadow-stone-200/20 hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
            {/* Decorative Circle */}
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-[0.04] blur-2xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none bg-sage" style={{ backgroundColor: SAGE }}></div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-sage/20 bg-stone-100 flex-shrink-0 shadow-sm transition-all group-hover:scale-105 duration-500">
                        <img 
                            src={`/avatar/memo_${((((user.name || "U").charCodeAt(0) || 0) + (user.email || "E").charCodeAt(0)) % 35) + 1}.png`} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 leading-tight block">
                            Account Profile
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 relative z-20">
                    {user.email === "nexura.management@gmail.com" ? (
                        <div className="px-2 py-1 rounded bg-stone-50 border border-stone-100 flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-stone-400">
                            <Lock size={10} />
                            <span>System Lock</span>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={() => onEdit(user)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-sage hover:bg-sage/10 transition-all border border-transparent hover:border-sage/20"
                            >
                                <Edit3 size={14} />
                            </button>
                            <button 
                                onClick={() => onDelete(user.id, user.name)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center py-2 text-center">
                <h3 className="text-2xl font-medium tracking-tighter text-stone-900 group-hover:text-sage transition-colors duration-500 mb-1" style={{ '--hover-color': SAGE } as any}>{user.name}</h3>
                <p className="text-xs font-medium text-stone-400 flex items-center gap-2">
                    <Mail size={12} className="opacity-30" />
                    {user.email}
                </p>
                
                <div className="mt-4 w-12 h-0.5 rounded-full group-hover:w-20 transition-all duration-700 bg-sage/20" style={{ backgroundColor: `${SAGE}33` }} />
            </div>

            <div className="mt-auto pt-4 border-t border-stone-50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SAGE }}></div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{user.role}</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-medium" style={{ color: SAGE }}>
                    <Lock size={10} />
                    <span>Secure Access</span>
                </div>
            </div>
        </motion.div>
    );
};

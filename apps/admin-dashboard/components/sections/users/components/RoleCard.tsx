import React from "react";
import { motion } from "motion/react";
import { Lock, Check, X } from "lucide-react";
import { RolePermission, MenuItem } from "../types";

interface RoleCardProps {
    role: RolePermission;
    menuItems: MenuItem[];
    onToggle: (roleId: string, menuId: string, current: boolean) => void;
}

const SAGE = "#788069";

export const RoleCard: React.FC<RoleCardProps> = ({ role, menuItems, onToggle }) => {
    return (
        <div className="bg-white rounded-xl border border-stone-100 shadow-xl shadow-stone-200/20 overflow-hidden flex flex-col h-full group hover:shadow-2xl transition-all duration-500">
            <header className="p-8 border-b border-stone-100 bg-stone-50/20 relative">
                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-sage/5 blur-xl group-hover:scale-150 transition-transform duration-1000" style={{ backgroundColor: `${SAGE}0D` }}></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-sage shadow-sm group-hover:rotate-3 transition-transform duration-500" style={{ color: SAGE }}>
                        <Lock size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-stone-900 tracking-tight uppercase">{role.label}</h3>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-1">Permission Profile</p>
                    </div>
                </div>
            </header>
            
            <div className="flex-1 p-6 space-y-2 overflow-y-auto max-h-[500px] custom-scrollbar bg-white">
                {menuItems.map((menu) => (
                    <div 
                        key={menu.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-transparent hover:border-stone-50 hover:bg-stone-50/40 transition-all group/item"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-300 group-hover/item:text-sage group-hover/item:bg-white transition-all shadow-sm">
                                {menu.icon}
                            </div>
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{menu.label}</span>
                        </div>
                        
                        <button 
                            onClick={() => onToggle(role.id, menu.id, role.permissions[menu.id] || false)}
                            className={`w-10 h-5 rounded-full transition-all relative ${role.permissions[menu.id] ? 'bg-sage shadow-inner shadow-black/5' : 'bg-stone-100'}`}
                            style={{ backgroundColor: role.permissions[menu.id] ? SAGE : undefined }}
                        >
                            <motion.div 
                                animate={{ x: role.permissions[menu.id] ? 22 : 2 }}
                                className="absolute top-1 left-0 w-3 h-3 rounded-full bg-white shadow-sm flex items-center justify-center"
                            >
                                {role.permissions[menu.id] ? <Check size={6} style={{ color: SAGE }} className="font-black" /> : <X size={6} className="text-stone-300" />}
                            </motion.div>
                        </button>
                    </div>
                ))}
            </div>
            
            <footer className="p-6 bg-stone-50/10 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                    {Object.values(role.permissions).filter(Boolean).length} Active Features
                </span>
                <div className="w-10 h-0.5 rounded-full bg-stone-100 group-hover:bg-sage/20 transition-colors" style={{ backgroundColor: `${SAGE}33` }} />
            </footer>
        </div>
    );
};

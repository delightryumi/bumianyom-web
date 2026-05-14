"use client";

import React from "react";
import { motion } from "motion/react";
import { 
    Home, Users, Landmark, ShoppingBag, 
    Package, BarChart3, Settings, LogOut
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const NavItem = ({ 
    icon, label, active, onClick
}: { 
    icon: React.ReactNode, label: string, active: boolean, onClick: () => void
}) => (
    <button 
        onClick={onClick}
        className={`group relative flex flex-col items-center justify-center gap-2 w-full aspect-square transition-all border-b border-stone-50 ${
            active 
                ? "bg-[#788069] text-white" 
                : "bg-white text-stone-400 hover:text-stone-900 hover:bg-stone-50"
        }`}
    >
        {active && (
            <motion.div 
                layoutId="pos-nav-active-bar"
                className="absolute right-0 w-1.5 h-full bg-[#ffd8a6]"
            />
        )}
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        <span className={`text-[10px] font-medium uppercase tracking-widest text-center leading-none ${active ? 'text-white' : 'text-stone-400'}`}>
            {label}
        </span>
    </button>
);

export const POSSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { id: "home", path: "/pos", label: "Home", icon: <Home size={32} /> },
        { id: "customers", path: "/pos/customers", label: "Cust", icon: <Users size={32} /> },
        { id: "cashier", path: "/pos/history", label: "Cashier", icon: <Landmark size={32} /> },
        { id: "orders", path: "/pos/orders", label: "Orders", icon: <ShoppingBag size={32} /> },
        { id: "product", path: "/pos/inventory", label: "Product", icon: <Package size={32} /> },
        { id: "report", path: "/pos/reports", label: "Report", icon: <BarChart3 size={32} /> },
    ];

    return (
        <aside className="w-[100px] bg-white border-r border-stone-100 flex flex-col relative z-[150] shadow-[10px_0_30px_rgba(0,0,0,0.02)] overflow-hidden h-full">
            <nav className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                    <NavItem 
                        key={item.id}
                        {...item}
                        active={pathname === item.path}
                        onClick={() => router.push(item.path)}
                    />
                ))}
            </nav>

            <div className="flex flex-col border-t border-stone-100">
                <NavItem 
                    icon={<Settings size={32} />} 
                    label="Set" 
                    active={pathname === "/pos/settings"} 
                    onClick={() => router.push('/pos/settings')} 
                />
                <NavItem 
                    icon={<LogOut size={32} />} 
                    label="Exit" 
                    active={false} 
                    onClick={() => router.push('/overview')} 
                />
            </div>
        </aside>
    );
};

"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
    Home, Users, Landmark, ShoppingBag, 
    Package, BarChart3, Settings, LogOut
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

const NavItem = ({ 
    icon, label, active, onClick, elRef
}: { 
    icon: (active: boolean) => React.ReactNode, label: string, active: boolean, onClick: () => void, elRef: (el: HTMLButtonElement | null) => void
}) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const handleMouseEnter = () => {
        if (!buttonRef.current || active) return;
        gsap.to(buttonRef.current, { 
            scale: 1.08, 
            y: -3, 
            boxShadow: "0 10px 20px rgba(212,175,55,0.2)", 
            borderColor: "rgba(212,175,55,0.4)",
            duration: 0.3, 
            ease: "power2.out" 
        });
    };

    const handleMouseLeave = () => {
        if (!buttonRef.current || active) return;
        gsap.to(buttonRef.current, { 
            scale: 1, 
            y: 0, 
            boxShadow: "0 4px 12px rgba(15,15,18,0.04)", 
            borderColor: "rgba(212,175,55,0.2)",
            duration: 0.3, 
            ease: "power2.inOut" 
        });
    };

    return (
        <button 
            ref={(node) => {
                buttonRef.current = node;
                elRef(node);
            }}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`group relative flex flex-col items-center justify-center gap-2 w-[calc(100%-16px)] aspect-square pos-3d-nav-item ${
                active ? "active text-[#0F0F12] font-bold" : "text-[#737380]"
            }`}
        >
            {active && (
                <motion.div 
                    layoutId="pos-nav-active-bar"
                    className="absolute left-0 w-1.5 h-8 bg-gradient-to-b from-[#D4AF37] to-[#0F0F12] rounded-r-full shadow-[0_0_8px_#D4AF37]"
                />
            )}
            <div className={`transition-transform duration-300 ${active ? 'scale-110 text-[#0F0F12]' : 'group-hover:text-[#0F0F12]'}`}>
                {icon(active)}
            </div>
            <span className={`text-[9px] font-semibold uppercase tracking-wider text-center leading-none overflow-hidden text-ellipsis w-full px-0.5 ${active ? 'text-[#0F0F12]' : 'text-[#737380]'}`}>
                {label}
            </span>
        </button>
    );
};

export const POSSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const navRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const navItems = [
        { id: "home", path: "/pos", label: "Home", icon: (active: boolean) => <Home size={24} strokeWidth={active ? 2.2 : 1.5} /> },
        { id: "customers", path: "/pos/customers", label: "Customer", icon: (active: boolean) => <Users size={24} strokeWidth={active ? 2.2 : 1.5} /> },
        { id: "cashier", path: "/pos/history", label: "Cashier", icon: (active: boolean) => <Landmark size={24} strokeWidth={active ? 2.2 : 1.5} /> },
        { id: "orders", path: "/pos/orders", label: "Orders", icon: (active: boolean) => <ShoppingBag size={24} strokeWidth={active ? 2.2 : 1.5} /> },
        { id: "product", path: "/pos/inventory", label: "Products", icon: (active: boolean) => <Package size={24} strokeWidth={active ? 2.2 : 1.5} /> },
        { id: "report", path: "/pos/reports", label: "Reports", icon: (active: boolean) => <BarChart3 size={24} strokeWidth={active ? 2.2 : 1.5} /> },
    ];

    useEffect(() => {
        if (!sidebarRef.current) return;

        // Animate Sidebar Container
        gsap.fromTo(sidebarRef.current, 
            { x: -150, rotateY: 25, opacity: 0, transformPerspective: 1000 }, 
            { x: 0, rotateY: 0, opacity: 1, duration: 1.2, ease: "power4.out", clearProps: "transform" }
        );

        // Animate Nav Items Staggering
        const validRefs = navRefs.current.filter(Boolean);
        if (validRefs.length > 0) {
            gsap.fromTo(validRefs,
                { opacity: 0, x: -30, scale: 0.8 },
                { opacity: 1, x: 0, scale: 1, duration: 0.8, stagger: 0.08, delay: 0.3, ease: "back.out(1.7)", clearProps: "all" }
            );
        }
    }, []);

    return (
        <>
            {/* Desktop / Tablet Vertical Island */}
            <aside ref={sidebarRef} className="hidden md:flex w-[110px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex-col relative z-[150] overflow-hidden h-full rounded-[16px] flex-shrink-0 border-none min-h-0">
                <nav className="flex-1 flex flex-col overflow-y-auto pos-no-scrollbar py-2">
                    {navItems.map((item, index) => (
                        <NavItem 
                            key={item.id}
                            {...item}
                            active={pathname === item.path}
                            onClick={() => router.push(item.path)}
                            elRef={(el) => { navRefs.current[index] = el; }}
                        />
                    ))}

                    <div className="my-3 border-t border-[#D4AF37]/30 w-[calc(100%-16px)] mx-auto flex-shrink-0" />

                    <div className="flex flex-col py-1 flex-shrink-0">
                        <NavItem 
                            icon={(active: boolean) => <Settings size={24} strokeWidth={active ? 2.2 : 1.5} />} 
                            label="Settings" 
                            active={pathname === "/pos/settings"} 
                            onClick={() => router.push('/pos/settings')} 
                            elRef={(el) => { navRefs.current[navItems.length] = el; }}
                        />
                        <NavItem 
                            icon={() => <LogOut size={24} strokeWidth={1.5} />} 
                            label="Exit" 
                            active={false} 
                            onClick={() => router.push('/overview')} 
                            elRef={(el) => { navRefs.current[navItems.length + 1] = el; }}
                        />
                    </div>
                </nav>
            </aside>

            {/* Mobile Bottom Tab Bar (iOS Style) */}
            <div className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#e0e0e0] z-[300] flex-row items-center justify-start overflow-x-auto pos-no-scrollbar px-2 gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                {[
                    ...navItems,
                    { id: "settings", path: "/pos/settings", label: "Settings", icon: (active: boolean) => <Settings size={24} strokeWidth={active ? 2.2 : 1.5} /> },
                    { id: "exit", path: "/overview", label: "Exit", icon: () => <LogOut size={24} strokeWidth={1.5} /> }
                ].map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className={`flex flex-col items-center justify-center flex-shrink-0 w-14 h-full gap-1 ${isActive ? 'text-[#0F0F12]' : 'text-[#737380]'}`}
                        >
                            <div className={`transition-transform ${isActive ? 'scale-110 text-[#0F0F12]' : ''}`}>
                                {item.icon(isActive)}
                            </div>
                            <span className="text-[9px] font-medium leading-none uppercase tracking-wider">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
};

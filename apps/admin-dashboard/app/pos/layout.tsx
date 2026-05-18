"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
    Search, Plus, RefreshCw, Maximize, 
    Minimize, User, Bell, ChevronDown, 
    LayoutDashboard
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { POSSidebar } from "@/components/sections/pos/components/POSSidebar";
import gsap from "gsap";
import "@/components/sections/pos/POSStyles.css";
import "@/components/sections/pos/POSGridStyles.css";

export default function POSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const isCheckoutPage = pathname?.includes("/pos/checkout");
    const { user } = useAuth();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userPermissions, setUserPermissions] = useState<Record<string, boolean> | null>(null);
    const [isSuperadmin, setIsSuperadmin] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        window.dispatchEvent(new CustomEvent('pos-search', { detail: val }));
    };

    const headerRef = useRef<HTMLElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const actionButtonsRef = useRef<HTMLDivElement>(null);

    // Fetch User Role & Permissions for Permission Checks
    useEffect(() => {
        if (!user?.email) return;
        
        const fetchPermissions = async () => {
            setIsLoadingPermissions(true);
            try {
                const userDocId = user.email!.replace(/[@.]/g, '_');
                const userDocRef = doc(db, "users_master", userDocId);
                const userSnap = await getDoc(userDocRef);
                
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const role = userData.role;
                    setUserRole(role);
                    
                    if (role === "superadmin") {
                        setIsSuperadmin(true);
                        setIsLoadingPermissions(false);
                        return;
                    }

                    // Get Role Permissions
                    const roleId = role.toLowerCase().replace(/\s+/g, '_');
                    const roleSnap = await getDoc(doc(db, "roles_master", roleId));
                    if (roleSnap.exists()) {
                        const perms = roleSnap.data().permissions || {};
                        setUserPermissions(perms);
                        
                        // Check if POS is disabled
                        if (perms.pos === false) {
                            router.push('/overview');
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching permissions:", err);
            } finally {
                setIsLoadingPermissions(false);
            }
        };

        fetchPermissions();
    }, [user, router]);

    // GSAP 3D Entrance Animations
    useEffect(() => {
        if (isLoadingPermissions) return;

        if (headerRef.current) {
            gsap.fromTo(headerRef.current,
                { y: -100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
            );
        }

        if (searchRef.current) {
            gsap.fromTo(searchRef.current,
                { opacity: 0, y: -20, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.4, ease: "power3.out", clearProps: "all" }
            );
        }

        if (actionButtonsRef.current) {
            gsap.fromTo(actionButtonsRef.current.children,
                { opacity: 0, scale: 0.5, rotateZ: -15 },
                { opacity: 1, scale: 1, rotateZ: 0, duration: 0.6, stagger: 0.1, delay: 0.5, ease: "back.out(2)", clearProps: "all" }
            );
        }

        if (mainRef.current) {
            gsap.fromTo(mainRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power4.out" }
            );
        }
    }, [isLoadingPermissions]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
    };

    const canAccessDashboard = isSuperadmin || userRole === "General Manager" || userPermissions?.overview !== false;

    if (isLoadingPermissions) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--abnb-canvas)]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-[#0F0F12]" size={32} />
                    <span className="abnb-caption text-[#737380] uppercase tracking-widest">Verifying Terminal Access...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="pos-3d-canvas h-screen w-full flex flex-col overflow-hidden selection:bg-[#D4AF37]/30">
            {/* ── 3D Header (Pure White & Persegi Siku / Sharp Square Corners 0px) ── */}
            <header ref={headerRef} className="w-full h-20 bg-white border-b border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(15,15,18,0.06)] rounded-none flex items-center justify-between px-3 md:px-8 relative z-[200] flex-shrink-0">
                {/* Logo Section */}
                <div className="h-full flex items-center justify-start cursor-pointer py-1 hover:scale-105 transition-transform duration-300 flex-shrink-0 ml-2 md:ml-0" onClick={() => router.push('/pos')}>
                    <img
                        src="/channels/nexura.png"
                        alt="Nexura Logo"
                        className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-[0_4px_8px_rgba(15,15,18,0.15)]"
                    />
                </div>

                {/* ── Spacer to shift search bar right ── */}
                <div className="w-4 md:w-28 flex-shrink-0" />

                {/* Main Header Content */}
                <div className="flex-1 h-full hidden md:flex items-center justify-center px-4 md:px-8 max-w-2xl">
                    {/* Center: Search Utility (Standalone Card Kecil Round 14px dengan Presisi Ikon Ekstra) */}
                    <div ref={searchRef} className="flex items-center w-full py-4 max-w-md">
                        <div className="relative w-full group bg-[#f6f6f8] border border-[#D4AF37]/40 shadow-[0_4px_12px_rgba(15,15,18,0.04),_inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center h-12 rounded-[14px] transition-all duration-300 hover:shadow-[0_6px_16px_rgba(212,175,55,0.15)] focus-within:border-[#D4AF37] focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[#737380] group-focus-within:text-[#0F0F12] transition-colors z-10">
                                <Search size={18} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search products, orders..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full h-full bg-transparent pr-4 abnb-body-md text-[#121214] focus:outline-none transition-all placeholder:text-[#a0a0b0] rounded-[14px]"
                                style={{ paddingLeft: '3.5rem' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Utilities (Card Kecil Round 14px) */}
                <div ref={actionButtonsRef} className="flex items-center gap-3.5 h-full pl-4 flex-shrink-0">
                    {canAccessDashboard && (
                        <button 
                            onClick={() => router.push('/overview')}
                            className="pos-3d-button w-11 h-11 flex items-center justify-center rounded-[14px]"
                            title="Back to Dashboard"
                        >
                            <LayoutDashboard size={18} strokeWidth={2} />
                        </button>
                    )}

                    <button 
                        onClick={handleSync}
                        className={`pos-3d-button w-11 h-11 flex items-center justify-center rounded-[14px] ${isSyncing ? 'text-[#D4AF37]' : ''}`}
                        title="Sync Menu Data"
                    >
                        <RefreshCw size={18} strokeWidth={2} className={isSyncing ? "animate-spin" : ""} />
                    </button>

                    <button 
                        onClick={toggleFullscreen}
                        className="pos-3d-button w-11 h-11 flex items-center justify-center rounded-[14px]"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize size={18} strokeWidth={2} /> : <Maximize size={18} strokeWidth={2} />}
                    </button>

                    {/* Add New Product CTA (Matched size & design with utility buttons) */}
                    <button 
                        className="pos-3d-button w-11 h-11 flex items-center justify-center rounded-[14px]"
                        title="Add New Product"
                    >
                        <Plus size={18} strokeWidth={2} />
                    </button>

                    {/* Profile Shortcut (Clean, no side lines/borders, Jet Black & Gold theme) */}
                    <button className="flex items-center gap-3 p-1.5 pr-2 bg-transparent border-none shadow-none rounded-[14px] transition-all duration-300 group">
                        <div className="w-9 h-9 rounded-[10px] bg-[#f6f6f8] border border-[#D4AF37]/40 flex items-center justify-center text-[#0F0F12] font-bold text-xs tracking-wider shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] group-hover:bg-[#0F0F12] group-hover:text-[#D4AF37] transition-colors duration-300">
                            {user?.email?.slice(0, 2).toUpperCase() || 'NA'}
                        </div>
                        <div className="hidden xl:flex flex-col items-start text-left">
                            <span className="text-[13px] font-semibold text-[#121214] tracking-tight leading-none group-hover:text-[#0F0F12] transition-colors">
                                {user?.email?.split('@')[0] || 'Nexura Admin'}
                            </span>
                            <span className="text-[10px] font-medium text-[#737380] uppercase tracking-widest leading-none mt-1">
                                {userRole || 'Loading...'}
                            </span>
                        </div>
                        <ChevronDown size={14} className="text-[#a0a0b0] group-hover:text-[#0F0F12] transition-colors ml-0.5" />
                    </button>
                </div>
            </header>

            {/* ── Mobile Dedicated Full-Width Search Bar (md:hidden) ── */}
            <div className="flex md:hidden w-full bg-white px-4 py-3 border-b border-[#e0e0e0] shadow-sm relative z-[190] flex-shrink-0">
                <div className="relative w-full group bg-[#f6f6f8] border border-[#D4AF37]/40 shadow-[0_4px_12px_rgba(15,15,18,0.04),_inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center h-12 rounded-[14px] focus-within:border-[#D4AF37] focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#737380] z-10">
                        <Search size={18} strokeWidth={2.5} />
                    </div>
                    <input 
                        type="text"
                        placeholder="Search menu products..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full h-full bg-transparent pr-4 abnb-body-md text-[#121214] focus:outline-none transition-all placeholder:text-[#a0a0b0] rounded-[14px] text-sm font-medium"
                        style={{ paddingLeft: '2.8rem' }}
                    />
                </div>
            </div>

            {/* ── Main Terminal Body (Sidebar + Content) ── */}
            <div className="flex-1 flex overflow-hidden w-full bg-[#f4f5f8] h-[calc(100vh-80px)] pl-3 md:pl-6 py-3 md:py-6 pr-3 md:pr-6 gap-3 md:gap-6 max-w-[1600px] mx-auto min-w-0 min-h-0">
                <POSSidebar />
                <main key={isCheckoutPage ? "pos-checkout-canvas" : "pos-main-canvas-v6"} ref={mainRef} className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

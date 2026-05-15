"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
    Search, Plus, RefreshCw, Maximize, 
    Minimize, User, Bell, ChevronDown, 
    LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { POSSidebar } from "@/components/sections/pos/components/POSSidebar";

export default function POSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user } = useAuth();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userPermissions, setUserPermissions] = useState<Record<string, boolean> | null>(null);
    const [isSuperadmin, setIsSuperadmin] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

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
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-sage" size={32} />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Verifying Terminal Access...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-white flex flex-col font-sans selection:bg-sage/20 overflow-hidden">
            {/* ── Global POS Header (Spans Full Width) ── */}
            <header className="h-20 bg-white flex items-center justify-between border-b border-stone-100 relative z-[200]">
                {/* Logo Section (Aligned with Sidebar width) */}
                <div className="w-[100px] h-full flex items-center justify-center bg-white group cursor-pointer" onClick={() => router.push('/pos')}>
                    <img 
                        src="/channels/nexura.png" 
                        alt="Nexura" 
                        className="h-10 w-auto object-contain group-hover:scale-110 transition-transform"
                    />
                </div>

                {/* ── Spacer to shift search bar right ── */}
                <div className="w-28 flex-shrink-0" />

                {/* Main Header Content */}
                <div className="flex-1 h-full flex items-center justify-between px-8">
                    {/* Left: Search Utility (REPLICATED FROM USERS SECTION) */}
                    <div className="flex items-center h-full flex-1 max-w-md py-4">
                        <div className="relative w-full group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-sage transition-colors">
                                <Search size={16} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search products, orders..."
                                className="w-full h-12 pr-4 bg-white border border-stone-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sage/5 focus:border-sage transition-all placeholder:text-stone-300 shadow-sm"
                                style={{ paddingLeft: '3.5rem' }}
                            />
                        </div>
                    </div>

                    {/* Right: Actions & Utilities */}
                    <div className="flex items-center gap-3 h-full">
                        {/* Conditional Dashboard Link */}
                        {canAccessDashboard && (
                            <button 
                                onClick={() => router.push('/overview')}
                                className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-stone-100 text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all shadow-sm"
                                title="Back to Dashboard"
                            >
                                <LayoutDashboard size={18} />
                            </button>
                        )}

                        <button 
                            onClick={handleSync}
                            className={`flex items-center justify-center w-11 h-11 rounded-xl border border-stone-100 transition-all ${isSyncing ? 'bg-sage/10 text-sage' : 'bg-white text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`}
                            title="Sync Menu Data"
                        >
                            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                        </button>

                        <button 
                            onClick={toggleFullscreen}
                            className="w-11 h-11 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all shadow-sm"
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>

                        <div className="h-6 w-px bg-stone-100 mx-1" />

                        <button 
                            className="flex items-center justify-center w-11 h-11 rounded-xl bg-sage text-white shadow-lg shadow-sage/20 hover:scale-[1.05] active:scale-95 transition-all"
                            style={{ backgroundColor: "#788069" }}
                            title="Add New Product"
                        >
                            <Plus size={18} />
                        </button>

                        <div className="h-6 w-px bg-stone-100 mx-1" />

                        {/* Profile Shortcut */}
                        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-stone-50 transition-all group border border-transparent hover:border-stone-100">
                            <div className="w-8 h-8 rounded-lg bg-[#ffd8a6] flex items-center justify-center text-[#1A1C14] font-medium text-xs">
                                {user?.email?.slice(0, 2).toUpperCase() || 'NA'}
                            </div>
                            <div className="hidden xl:flex flex-col items-start text-left">
                                <span className="text-[11px] font-medium text-stone-900 uppercase tracking-tight truncate max-w-[100px]">
                                    {user?.email?.split('@')[0] || 'Nexura Admin'}
                                </span>
                                <span className="text-[9px] font-medium text-stone-400 uppercase tracking-widest">{userRole || 'Loading...'}</span>
                            </div>
                            <ChevronDown size={14} className="text-stone-300 group-hover:text-stone-600 transition-colors" />
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main Terminal Body (Sidebar + Content) ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* ── Vertical Navigation ── */}
                <POSSidebar />

                {/* ── Main Content Space ── */}
                <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-[#F8F9FA]">
                    {children}
                </main>
            </div>

            {/* ── Visual Backdrop Decor ── */}
            <div className="fixed bottom-[-10%] right-[-5%] w-[40%] aspect-square bg-[#788069]/[0.02] blur-[120px] rounded-full pointer-events-none" />
        </div>
    );
}

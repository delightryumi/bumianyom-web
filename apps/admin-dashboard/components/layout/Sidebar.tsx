"use client";

import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence,
    type MotionValue,
    type SpringOptions,
} from "motion/react";
import {
    BarChart2, FileImage, Home, Layout, Coffee,
    Info, Grid, Settings, LogOut,
    MapPin, Gift, Package, Search, ChevronLeft, Menu
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

/* ── Types ── */
export type SectionType =
    | "overview" | "logo" | "hero" | "room-type"
    | "about" | "gallery" | "footer"
    | "attractions" | "promo" | "packages" | "seo";

interface SidebarProps {
    activeSection: SectionType;
    setActiveSection: (section: SectionType) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

/* ── Dock item with magnification ── */
const DOCK_SPRING: SpringOptions = { mass: 0.1, stiffness: 150, damping: 12 };
const BASE_SIZE = 50;
const MAGNIFIED_SIZE = 80;
const DISTANCE = 200;

function DockNavItem({
    icon,
    label,
    isActive,
    mouseY,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    mouseY: MotionValue<number>;
    onClick: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

    const distanceFromMouse = useTransform(mouseY, (val) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return DISTANCE;
        return val - r.y - r.height / 2;
    });

    const sizeRaw = useTransform(
        distanceFromMouse,
        [-DISTANCE, 0, DISTANCE],
        [BASE_SIZE, MAGNIFIED_SIZE, BASE_SIZE]
    );
    const size = useSpring(sizeRaw, DOCK_SPRING);

    const handleHoverStart = () => {
        if (ref.current) {
            const r = ref.current.getBoundingClientRect();
            setTooltipPos({ top: r.top + r.height / 2, left: r.right + 12 });
        }
        setHovered(true);
    };

    return (
        <motion.div
            ref={ref}
            style={{ width: size, height: size }}
            onHoverStart={handleHoverStart}
            onHoverEnd={() => setHovered(false)}
            onClick={onClick}
            tabIndex={0}
            role="button"
            className="relative inline-flex items-center justify-center cursor-pointer outline-none"
        >
            {/* The square item box */}
            <div
                className={`
                    w-full h-full rounded-[10px] flex items-center justify-center
                    border transition-colors duration-200
                    ${isActive
                        ? "bg-[var(--peach)] border-[var(--peach)] text-[var(--rich-black)] shadow-[0_4px_16px_rgba(255,216,166,0.5)]"
                        : "text-white/70 hover:text-white hover:border-white/25"
                    }
                `}
                style={isActive ? undefined : {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.1)",
                }}
            >
                {icon}
            </div>

            {/* Floating label — fixed position to escape scroll clipping */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.15 }}
                        className="px-2.5 py-1 rounded-md border text-white text-xs font-semibold whitespace-nowrap pointer-events-none"
                        style={{
                            position: "fixed",
                            top: tooltipPos.top,
                            left: tooltipPos.left,
                            transform: "translateY(-50%)",
                            zIndex: 9999,
                            backgroundColor: "var(--sage, #788069)",
                            borderColor: "rgba(255,255,255,0.15)",
                        }}
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ── Main Sidebar ── */
export const Sidebar: React.FC<SidebarProps> = ({
    activeSection,
    setActiveSection,
    isCollapsed,
    setIsCollapsed,
}) => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const mouseY = useMotionValue(Infinity);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const docRef = doc(db, "settings", "landingPage");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setLogoUrl(docSnap.data().lightLogo || null);
                }
            } catch (err) {
                console.error("Error fetching sidebar logo:", err);
            }
        };
        fetchLogo();
    }, []);

    const navItems: { id: SectionType; label: string; icon: React.ReactNode }[] = [
        { id: "overview", label: "Overview", icon: <BarChart2 size={18} /> },
        { id: "logo", label: "Logo (Light/Dark)", icon: <FileImage size={18} /> },
        { id: "hero", label: "Hero Management", icon: <Home size={18} /> },
        { id: "room-type", label: "Room Categories", icon: <Layout size={18} /> },
        { id: "about", label: "About Us", icon: <Info size={18} /> },
        { id: "gallery", label: "Gallery", icon: <Grid size={18} /> },
        { id: "footer", label: "Footer Info", icon: <Settings size={18} /> },
        { id: "attractions", label: "Nearby Attractions", icon: <MapPin size={18} /> },
        { id: "promo", label: "Promo Management", icon: <Gift size={18} /> },
        { id: "packages", label: "Custom Packages", icon: <Package size={18} /> },
        { id: "seo", label: "SEO & Metadata", icon: <Search size={18} /> },
    ];

    const handleLogout = () => signOut(auth);

    /* ── Expanded sidebar variants ── */
    const sidebarVariants = {
        expanded: {
            width: "var(--sidebar-width)",
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        },
        collapsed: {
            width: "100px",
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        },
    };

    return (
        <motion.aside
            className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
            initial="expanded"
            animate={isCollapsed ? "collapsed" : "expanded"}
            variants={sidebarVariants}
        >
            {/* Header */}
            <div className="sidebar-header">
                <motion.div
                    animate={{
                        opacity: isCollapsed ? 0 : 1,
                        display: isCollapsed ? "none" : "block",
                    }}
                    transition={{ duration: 0.3 }}
                    className="sidebar-logo"
                >
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-14 w-auto object-contain brightness-0 invert drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                        />
                    )}
                </motion.div>
                <motion.button
                    whileHover={{ scale: 1.1, rotate: isCollapsed ? 180 : 0 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="sidebar-toggle"
                >
                    {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
                </motion.button>
            </div>

            {/* Navigation */}
            {isCollapsed ? (
                /* ── DOCK MODE (collapsed) — seamless, no inner panel ── */
                <div
                    className="flex-1 flex flex-col overflow-y-auto overflow-x-visible"
                    style={{ scrollbarWidth: "none" }}
                >
                    <motion.nav
                        onMouseMove={(e) => mouseY.set(e.clientY)}
                        onMouseLeave={() => mouseY.set(Infinity)}
                        className="
                            flex flex-col items-center gap-2 w-full
                            py-2 px-1.5 mx-auto overflow-visible flex-1
                        "
                        role="toolbar"
                        aria-label="Navigation dock"
                    >
                        {navItems.map((item) => (
                            <DockNavItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={activeSection === item.id}
                                mouseY={mouseY}
                                onClick={() => setActiveSection(item.id)}
                            />
                        ))}

                        {/* ── Divider ── */}
                        <div className="w-8 h-px my-1" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />

                        {/* ── Sign Out inside the dock ── */}
                        <DockNavItem
                            icon={<LogOut size={18} />}
                            label="Sign Out"
                            isActive={false}
                            mouseY={mouseY}
                            onClick={handleLogout}
                        />
                    </motion.nav>
                </div>
            ) : (
                /* ── EXPANDED MODE ── */
                <nav className="nav-group">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                backgroundColor:
                                    activeSection === item.id
                                        ? "var(--peach)"
                                        : "rgba(255, 255, 255, 0.04)",
                                color:
                                    activeSection === item.id
                                        ? "var(--rich-black)"
                                        : "rgba(255, 255, 255, 0.6)",
                                boxShadow:
                                    activeSection === item.id
                                        ? "0 12px 30px rgba(255, 216, 166, 0.5)"
                                        : "none",
                            }}
                            whileHover={{
                                scale: 1.03,
                                backgroundColor:
                                    activeSection === item.id
                                        ? "var(--peach)"
                                        : "rgba(255, 255, 255, 0.12)",
                                color:
                                    activeSection === item.id
                                        ? "var(--rich-black)"
                                        : "#ffffff",
                            }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 300, damping: 24 }}
                            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            {item.icon}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="nav-label truncate"
                            >
                                {item.label}
                            </motion.span>
                        </motion.button>
                    ))}
                </nav>
            )}

            {/* Footer / Logout — only shown in expanded mode */}
            {!isCollapsed && (
                <div className="sidebar-footer">
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 216, 166, 0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </motion.button>
                </div>
            )}
        </motion.aside>
    );
};
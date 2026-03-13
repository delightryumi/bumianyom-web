"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    BedDouble,
    FileImage,
    Globe,
    Zap,
    Shield,
    Layers,
    Waves,
    ArrowUpRight,
    Server,
    Navigation,
    Info,
    Package,
    MessageSquare,
} from "lucide-react";
import { useOverview } from "./useOverview";
import { SectionType } from "../../layout/Sidebar";

/* ── Brand Colors ── */
const PEACH = "#ffd8a6";
const SAGE = "#788069";

/* ── Animations ── */
const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/* ═══════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════ */
interface OverviewSectionProps {
    onNavigate: (section: SectionType) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ onNavigate }) => {
    const { roomsCount, galleryCount, attractionsCount, seoConfigured, loading } = useOverview();

    const dash = loading ? "—" : null;

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex flex-col gap-10 font-sans"
        >
            {/* ─── Header ─── */}
            <motion.header variants={rise} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200/60">
                <div>
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${PEACH}30`, color: SAGE }}>
                            <Waves size={13} />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Nexura Ecosystem</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
                        Command <span style={{ color: SAGE }}>Center</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-stone-200/80 bg-white shadow-sm">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${loading ? "bg-amber-400" : "bg-emerald-500"}`} />
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{loading ? "Syncing…" : "System Live"}</span>
                </div>
            </motion.header>

            {/* ─── Bento Grid: Stats + Channel Manager ─── */}
            <motion.section variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">

                {/* Card 1 — Room Suites (Sage) */}
                <motion.button
                    variants={rise}
                    onClick={() => onNavigate("room-type")}
                    className="group flex flex-col justify-between gap-5 p-5 md:p-6 rounded-2xl bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SAGE}14`, color: SAGE }}>
                            <BedDouble size={17} />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 leading-tight">Room Suites</span>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-stone-900 leading-none mb-1">{dash ?? String(roomsCount)}</p>
                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">Active Categories</span>
                    </div>
                </motion.button>

                {/* Card 2 — Media Assets (Terracotta) */}
                <motion.button
                    variants={rise}
                    onClick={() => onNavigate("gallery")}
                    className="group flex flex-col justify-between gap-5 p-5 md:p-6 rounded-2xl bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PEACH}30`, color: SAGE }}>
                            <FileImage size={17} />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 leading-tight">Media Assets</span>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-stone-900 leading-none mb-1">{dash ?? String(galleryCount)}</p>
                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">High-Res Images</span>
                    </div>
                </motion.button>

                {/* Card 3 — SEO Health */}
                <motion.button
                    variants={rise}
                    onClick={() => onNavigate("seo")}
                    className="group flex flex-col justify-between gap-5 p-5 md:p-6 rounded-2xl bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-stone-100 text-stone-500">
                            <Globe size={17} />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 leading-tight">SEO Health</span>
                        {!seoConfigured && !loading && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        )}
                    </div>
                    <div>
                        <p className={`text-3xl font-extrabold leading-none mb-1 ${!seoConfigured && !loading ? "text-red-500" : "text-stone-900"}`}>
                            {dash ?? (seoConfigured ? "100%" : "Check")}
                        </p>
                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">Search Indexing</span>
                    </div>
                </motion.button>

                {/* Card 4 — Channel Manager (Sage themed bento) */}
                <motion.a
                    variants={rise}
                    href="https://live.ipms247.com/login/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between gap-5 p-5 md:p-6 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${SAGE}0A, ${SAGE}18)` }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SAGE}22`, color: SAGE }}>
                                <ArrowUpRight size={17} />
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500 leading-tight">Channel Manager</span>
                        </div>
                        <span
                            className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: `${SAGE}22`, color: SAGE }}
                        >
                            Live
                        </span>
                    </div>
                    <div>
                        <p className="text-lg font-extrabold leading-tight mb-1" style={{ color: SAGE }}>
                            iPMS247
                        </p>
                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">Global Real-time Sync</span>
                    </div>
                </motion.a>
            </motion.section>

            {/* ─── Management Modules (bento row) ─── */}
            <motion.section variants={stagger} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-1">
                    <h2 className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em] whitespace-nowrap">Management Module</h2>
                    <div className="h-px flex-1 bg- stone-200/60" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <BentoTile icon={<Layers size={16} />} label="Hero Section" sub="Visual Interface" accent={SAGE} onClick={() => onNavigate("hero")} />
                    <BentoTile icon={<Navigation size={16} />} label="Local Guide" sub={`${attractionsCount} Attractions`} accent={PEACH} onClick={() => onNavigate("attractions")} />
                    <BentoTile icon={<Shield size={16} />} label="Site Identity" sub="Brand Assets" accent="#78716c" onClick={() => onNavigate("logo")} />
                    <BentoTile icon={<Zap size={16} />} label="Active Promos" sub="Campaigns" accent={SAGE} onClick={() => onNavigate("promo")} />
                    <BentoTile icon={<Info size={16} />} label="About Us" sub="Story & Details" accent={PEACH} onClick={() => onNavigate("about")} />
                    <BentoTile icon={<Package size={16} />} label="Packages" sub="Special Offers" accent={SAGE} onClick={() => onNavigate("packages")} />
                    <BentoTile icon={<MessageSquare size={16} />} label="Footer" sub="Contact & Links" accent="#78716c" onClick={() => onNavigate("footer")} />
                </div>
            </motion.section>

            {/* ─── Footer ─── */}
            <motion.footer variants={rise} className="mt-auto pt-6 border-t border-stone-200/60 flex items-center justify-between opacity-40 hover:opacity-70 transition-opacity">
                <div className="flex items-center gap-2">
                    <Server size={12} className="text-stone-400" />
                    <span className="text-[9px] font-medium text-stone-400 tracking-widest uppercase">Nexura Cloud · Next.js</span>
                </div>
                <span className="text-[9px] font-semibold text-stone-300 tracking-[0.25em] uppercase">Bumi Anyom v2.5</span>
            </motion.footer>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════
   Bento Tile — small action card
   ═══════════════════════════════════════════════ */
function BentoTile({ icon, label, sub, accent, onClick }: {
    icon: React.ReactNode;
    label: string;
    sub: string;
    accent: string;
    onClick: () => void;
}) {
    return (
        <motion.button
            variants={rise}
            onClick={onClick}
            className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left w-full"
        >
            <div
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover:text-white"
                style={{
                    backgroundColor: `${accent}0D`,
                    borderColor: `${accent}1A`,
                    color: accent,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accent; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${accent}0D`; e.currentTarget.style.color = accent; }}
            >
                {icon}
            </div>
            <div className="flex flex-col min-w-0 gap-0.5">
                <span className="text-xs font-bold text-stone-800 leading-tight">{label}</span>
                <span className="text-[10px] text-stone-400 leading-tight">{sub}</span>
            </div>
        </motion.button>
    );
}
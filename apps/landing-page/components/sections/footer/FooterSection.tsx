"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { 
    ArrowUpRight,
    ArrowRight,
    Globe,
    MapPin
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFooter } from "@/services/useFooter";
import { useLandingSettings } from "@/services/useLandingSettings";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Precise Brand SVGs
const SocialIcons = {
    WhatsApp: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.54 4.197 1.57 6.05L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.634 0 12.043-5.41 12.048-12.047a11.851 11.851 0 00-3.659-8.403z"/>
        </svg>
    ),
    Instagram: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.31.975.975 1.247 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.31 3.608-.975.975-2.242 1.247-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.31-.975-.975-1.247-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.334-2.633 1.31-3.608.975-.975 2.242-1.247 3.608-1.31 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
    ),
    TikTok: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.31-.75.42-1.24 1.25-1.31 2.1-.05.56.06 1.15.34 1.61.43.7 1.24 1.16 2.1 1.17.9 0 1.71-.53 2.15-1.31.28-.48.33-1.05.33-1.6v-14.71z"/>
        </svg>
    ),
    Facebook: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    )
};

const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
        case "whatsapp": return <SocialIcons.WhatsApp />;
        case "instagram": return <SocialIcons.Instagram />;
        case "tiktok": return <SocialIcons.TikTok />;
        case "facebook": return <SocialIcons.Facebook />;
        default: return <ArrowUpRight strokeWidth={1.2} size={14} />;
    }
};

export const FooterSection = () => {
    const { data: footerData, loading: footerLoading } = useFooter();
    const { bookingEngineUrl } = useLandingSettings();
    const data = footerData;
    const loading = footerLoading;
    const footerRef = useRef<HTMLElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (loading || !data || !footerRef.current) return;

        const ctx = gsap.context(() => {
            // Horizontal Reveal for items
            gsap.fromTo(".cinematic-item",
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.05,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: "top 92%", // Trigger later for footer
                        toggleActions: "play none none reverse", // Don't reverse on scroll down, only on scroll up
                    }
                }
            );

            // Subtle Parallax on Map
            if (mapRef.current) {
                gsap.to(mapRef.current, {
                    y: -30,
                    ease: "none",
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            }
        }, footerRef);

        return () => ctx.revert();
    }, [loading, data]);

    if (loading || !data) return null;

    return (
        <footer 
            ref={footerRef}
            className="w-full bg-[#fdfbf7] text-[#111310] pt-24 pb-12 overflow-hidden selection:bg-[#788069] selection:text-white"
        >
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
                
                {/* ── Brand Section: Compact & Powerful ── */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20 pb-12 border-b border-[#111310]/10">
                    <div className="cinematic-item">
                        <Link href="/" className="inline-block mb-8">
                            <h2 className="text-6xl md:text-8xl font-extralight tracking-[-0.05em] uppercase leading-[0.85]">
                                Bumi <span className="font-extralight italic text-[#788069]">Anyom</span>
                            </h2>
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                            <span className="text-[11px] font-bold tracking-[0.5em] uppercase text-[#788069] whitespace-nowrap">#KembaliMembumi</span>
                            <div className="h-[1px] w-24 bg-[#111310]/10 hidden md:block" />
                            <p className="text-base font-light text-[#111310]/50 max-w-lg leading-relaxed italic">
                                Merajut keselarasan raga dengan alam. Tempat di mana waktu tak lagi dikejar, namun dirasakan dalam setiap hembusan di tanah leluhur.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-6 cinematic-item">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#111310]/30 hidden lg:block">Hubungkan Jiwa</p>
                        <div className="flex gap-4">
                            {data.socialLinks.map((social, i) => (
                                <a 
                                    key={i}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-full border border-[#111310]/5 flex items-center justify-center hover:bg-[#111310] hover:text-[#fdfbf7] transition-all duration-500 hover:scale-110"
                                    aria-label={social.platform}
                                >
                                    {getSocialIcon(social.platform)}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Content Grid: Tight Spacing ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-start">
                    
                    {/* Map Container - Square/Rectangular Style */}
                    <div className="lg:col-span-8 group relative rounded-xl overflow-hidden bg-gray-100 cinematic-item h-[250px] md:h-[400px]">
                        <div ref={mapRef} className="absolute inset-0 w-full h-[120%] -top-[10%] grayscale contrast-125 opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000">
                             <iframe 
                                src={data.mapsEmbed?.includes('src="') ? data.mapsEmbed.split('src="')[1].split('"')[0] : data.mapsEmbed}
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                        
                        {/* Overlay: Koordinat Alam (Centered, Rectangular) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="px-6 py-3 bg-[#fdfbf7] border border-[#111310]/5 shadow-xl flex items-center gap-4 transition-all duration-700 group-hover:scale-110">
                                <div className="w-2 h-2 bg-[#788069] animate-pulse" />
                                <span className="text-[9px] font-black tracking-[0.6em] uppercase text-[#111310]">Koordinat Alam</span>
                            </div>
                        </div>

                        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2 text-white mix-blend-difference opacity-40 select-none">
                            <h4 className="text-[8px] font-medium tracking-[0.8em] uppercase text-right leading-none">#kembalimembumi</h4>
                            <Globe size={60} strokeWidth={0.2} className="animate-[spin_25s_linear_infinite]" />
                        </div>
                    </div>

                    {/* Integrated Info: Tight Grid */}
                    <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-12 pt-2">
                        <div className="cinematic-item">
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#788069] mb-6 block border-l-2 border-[#788069] pl-4">Kontak</span>
                            <div className="flex flex-col gap-4">
                                {data.phones.map((phone, i) => (
                                    <a key={i} href={`tel:${phone}`} className="text-2xl font-extralight hover:text-[#788069] transition-colors">{phone}</a>
                                ))}
                                <a href={`mailto:${data.email}`} className="text-sm font-medium underline underline-offset-4 decoration-black/10 hover:decoration-[#788069] transition-all">{data.email}</a>
                            </div>
                        </div>

                        <div className="cinematic-item">
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#788069] mb-6 block border-l-2 border-[#788069] pl-4">Kediaman</span>
                            <p className="text-base font-light text-[#111310]/60 leading-relaxed italic">
                                {data.address}
                            </p>
                        </div>
                        
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-8 cinematic-item border-t border-[#111310]/10 pt-8 mt-2">
                            <a href={bookingEngineUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-xs font-bold tracking-widest uppercase hover:text-[#788069] transition-all">
                                <span>Pesan Kamar</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                            <Link href="/gallery" className="group flex items-center gap-3 text-xs font-bold tracking-widest uppercase hover:text-[#788069] transition-all">
                                <span>Jelajahi Sudut</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Meta: Minimalist Architecture ── */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-10 border-t border-[#111310]/10 cinematic-item text-[10px] uppercase font-bold tracking-[0.3em]">
                    <div className="flex gap-10 text-[#111310]/40">
                        <Link href="/privacy" className="hover:text-black">Privasi</Link>
                        <Link href="/terms" className="hover:text-black">Kebijakan</Link>
                    </div>

                    <div className="text-[#111310]/10">
                        &copy; {new Date().getFullYear()} Bumi Anyom &mdash; Kembali Membumi
                    </div>

                    <div className="text-[#788069] flex items-center gap-2">
                        <span className="opacity-40 font-normal lowercase">Powered by</span>
                        {data.poweredByLink ? (
                            <a 
                                href={data.poweredByLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-black hover:underline underline-offset-4 transition-all"
                            >
                                {data.poweredByText}
                            </a>
                        ) : (
                            <span>{data.poweredByText}</span>
                        )}
                    </div>
                </div>

            </div>

            {/* Scroll: Simple Refined Pillar */}
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-20 mx-auto group flex flex-col items-center gap-3 opacity-30 hover:opacity-100 transition-opacity duration-1000 cinematic-item"
            >
                <div className="w-[1px] h-10 bg-black/10 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#788069] -translate-y-full group-hover:translate-y-full transition-transform duration-700 ease-in-out" />
                </div>
                <span className="text-[8px] font-bold tracking-[0.8em] uppercase text-[#111310]/60">Beranda</span>
            </button>
        </footer>
    );
};

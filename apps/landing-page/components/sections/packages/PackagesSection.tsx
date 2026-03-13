"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Users, Star, MapPin, Coffee, Utensils, Wifi, Camera, Info, Car, Anchor } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useServices, PackageItem } from "@/services/useServices";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const AUTO_PLAY_DURATION = 6;

// Fallback dummy data in case Firebase has no published packages
const DUMMY_PACKAGES: PackageItem[] = [
    {
        id: "dummy-1",
        name: "Romantic Sunset Cruise",
        category: "Trip",
        description: "Experience the magic of a golden hour sunset aboard our luxury catamaran.",
        duration: "-",
        maxPax: 2,
        price: 2500000,
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80",
        vendorName: "Bumi Anyom",
        features: ["Private Catamaran", "Champagne Included", "Sunset View", "Canapés"]
    },
    {
        id: "dummy-2",
        name: "Intimate Garden Wedding",
        category: "Wedding",
        description: "A beautifully curated wedding package for your most special day, set in our lush tropical gardens.",
        duration: "-",
        maxPax: 50,
        price: 35000000,
        imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80",
        vendorName: "Bumi Anyom",
        features: ["Premium Decoration", "Catering for 50 Pax", "Master of Ceremony", "Live Acoustic Band"]
    },
    {
        id: "dummy-3",
        name: "Executive MICE Package",
        category: "MICE",
        description: "Comprehensive meeting and incentive package tailored for corporate excellence and team bonding.",
        duration: "-",
        maxPax: 20,
        price: 15000000,
        imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80",
        vendorName: "Bumi Anyom",
        features: ["Meeting Room Full Day", "2x Coffee Break", "Buffet Lunch", "Projector & Audio System"]
    }
];

export const PackagesSection = () => {
    const { packages, loading } = useServices();

    const [items, setItems] = useState<PackageItem[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const sectionRef = useRef<HTMLElement>(null);
    const bgImageRef = useRef<HTMLDivElement>(null);
    const textGroupRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const progressRef = useRef<HTMLDivElement>(null);
    const progressTween = useRef<gsap.core.Tween | null>(null);

    // Initial load
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        if (!loading) {
            setItems(packages && packages.length > 0 ? packages : DUMMY_PACKAGES);
        }
    }, [packages, loading]);

    // Entrance Animation (ScrollTrigger)
    useEffect(() => {
        if (loading || items.length === 0 || !sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Hide elements initially
            gsap.set(textGroupRef.current?.children || [], { y: 40, opacity: 0 });
            gsap.set(carouselRef.current, { x: 100, opacity: 0 });

            // Entrance scroll timeline
            gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "top 20%",
                    scrub: 1.5, // Smooth scrub for the transition
                }
            })
            // Parallax effect on the background image during entrance
            .fromTo(bgImageRef.current, 
                { yPercent: 20, scale: 1.1 }, 
                { yPercent: 0, scale: 1, ease: "none" },
                0
            )
            // Reveal text elements
            .to(textGroupRef.current?.children || [], {
                y: 0,
                opacity: 1,
                stagger: 0.05,
                ease: "power2.out"
            }, 0)
            // Slide in carousel
            .to(carouselRef.current, {
                x: 0,
                opacity: 1,
                ease: "power2.out"
            }, 0);

        }, sectionRef);

        return () => ctx.revert();
    }, [loading, items.length]);

    // Handle Active Package Change
    useEffect(() => {
        if (items.length === 0 || isAnimating) return;

        const ctx = gsap.context(() => {
            // Background Image Crossfade (Zoom in slightly)
            gsap.fromTo(bgImageRef.current,
                { scale: 1.05, filter: "blur(8px)", opacity: 0.5 },
                { scale: 1, filter: "blur(0px)", opacity: 1, duration: 1.5, ease: "power2.out" }
            );

            // Re-reveal texts
            gsap.fromTo(textGroupRef.current?.children || [],
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
            );

            // Stagger Cards
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                gsap.to(card, {
                    xPercent: i * (isMobile ? 105 : 115),
                    scale: 1 - i * 0.12,
                    opacity: i === 0 ? 1 : Math.max(0, 1 - i * 0.35),
                    zIndex: 10 - i,
                    filter: i === 0 ? "blur(0px)" : `blur(${i * 1.5}px)`,
                    duration: 0.9,
                    ease: "expo.out",
                });
            });

            // Start Progress Bar
            if (progressTween.current) progressTween.current.kill();
            gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left" });
            progressTween.current = gsap.to(progressRef.current, {
                scaleX: 1,
                duration: AUTO_PLAY_DURATION,
                ease: "none",
                onComplete: () => handleNext()
            });

        }, sectionRef);

        return () => ctx.revert();
    }, [items, isMobile]);

    const handleNext = useCallback(() => {
        if (isAnimating || items.length < 2) return;
        setIsAnimating(true);

        // Hide text before swap
        gsap.to(textGroupRef.current?.children || [], {
            y: -20, opacity: 0, duration: 0.3, stagger: 0.05, ease: "power2.in"
        });

        setTimeout(() => {
            setItems(prev => {
                const p = [...prev];
                const first = p.shift();
                if (first) p.push(first);
                return p;
            });
            setIsAnimating(false);
        }, 350);
    }, [items, isAnimating]);

    const handlePrev = useCallback(() => {
        if (isAnimating || items.length < 2) return;
        setIsAnimating(true);

        gsap.to(textGroupRef.current?.children || [], {
            y: -20, opacity: 0, duration: 0.3, stagger: 0.05, ease: "power2.in"
        });

        setTimeout(() => {
            setItems(prev => {
                const p = [...prev];
                const last = p.pop();
                if (last) p.unshift(last);
                return p;
            });
            setIsAnimating(false);
        }, 350);
    }, [items, isAnimating]);

    const renderTwoToneTitle = (text: string) => {
        const words = text.split(" ");
        if (words.length < 2) return <span>{text}</span>;
        const first = words[0];
        const rest = words.slice(1).join(" ");
        return (
            <>
                <span className="font-medium text-[#1a1a1a]">{first}</span>{" "}
                <span className="font-light italic text-[#788069]">{rest}</span>
            </>
        );
    };

    const formatIDR = (p: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(p);

    // Helper to pick a contextual icon based on the feature string
    const getFeatureIcon = (featureText: string) => {
        const text = featureText.toLowerCase();
        if (text.includes("coffee") || text.includes("tea") || text.includes("break")) return <Coffee size={14} className="text-[#788069]" />;
        if (text.includes("lunch") || text.includes("dinner") || text.includes("meal") || text.includes("catering") || text.includes("breakfast") || text.includes("canapé") || text.includes("buffet")) return <Utensils size={14} className="text-[#788069]" />;
        if (text.includes("wifi") || text.includes("internet")) return <Wifi size={14} className="text-[#788069]" />;
        if (text.includes("photo") || text.includes("camera") || text.includes("documentation")) return <Camera size={14} className="text-[#788069]" />;
        if (text.includes("car") || text.includes("transport") || text.includes("transfer") || text.includes("pick up")) return <Car size={14} className="text-[#788069]" />;
        if (text.includes("boat") || text.includes("cruise") || text.includes("catamaran")) return <Anchor size={14} className="text-[#788069]" />;
        return <Info size={14} className="text-[#788069]" />; // Default icon
    };

    if (loading) return null; // Wait for Firebase to finish checking first
    if (items.length === 0) return null; // Should not happen due to dummy data fallback

    const active = items[0];

    return (
        <section
            ref={sectionRef}
            // Use h-screen to force exactly 1 viewport height. Added pt-16 to account for potential fixed headers.
            className="relative w-full h-screen flex flex-col justify-center bg-[#fdfbf7] overflow-hidden"
            id="packages"
        >
            {/* ── Background Layer ── */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Image is fully visible (removed opacity and grayscale filters) */}
                <div ref={bgImageRef} className="absolute inset-0 w-full h-[120%] origin-top will-change-transform">
                    <Image
                        src={active.imageUrl}
                        alt={active.name}
                        fill
                        priority
                        unoptimized={active.imageUrl.includes("firebasestorage.googleapis.com")}
                        className="object-cover"
                    />
                </div>
                {/* Horizontal gradient to ensure text readability on the left side, while keeping the right side fully visible */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf7] via-[#fdfbf7]/80 to-transparent z-10 w-full md:w-2/3" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7]/40 via-transparent to-transparent z-10" />
                
                {/* Subtle Text readability blur behind the text group ONLY */}
                <div className="absolute top-0 left-0 bottom-0 w-1/2 bg-[#fdfbf7]/40 backdrop-blur-[2px] z-[5] mask-image-linear-gradient" style={{ maskImage: "linear-gradient(to right, black 50%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 50%, transparent 100%)"}} />
            </div>

            {/* ── Content Container (Ultra Wide) ── */}
            {/* max-w-[1800px] makes it ultra wide on large screens. Reduced gap and py to ensure everything fits inside h-screen */}
            <div className="relative z-20 w-full max-w-[1800px] mx-auto px-6 md:px-12 xl:px-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center flex-1">
                
                {/* Left: Text Info */}
                <div ref={textGroupRef} className="lg:col-span-7 flex flex-col space-y-5 lg:space-y-6 pt-10 lg:pt-0">
                    
                    {/* Header Label */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-[1px] bg-[#788069]" />
                        <span className="text-[#788069] text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">
                            Curated Experiences
                        </span>
                    </div>

                    {/* Meta Tags */}
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] bg-[#1a1a1a]/5 backdrop-blur-md border border-[#1a1a1a]/10 text-[#1a1a1a] rounded-md">
                            {active.category}
                        </span>
                        <div className="flex gap-1 text-[#788069]">
                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                        </div>
                    </div>

                    {/* Title */}
                    <h2
                        className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-[#1a1a1a] leading-[0.95] tracking-tight uppercase"
                        style={{ fontFamily: 'var(--font-display), serif' }}
                    >
                        {renderTwoToneTitle(active.name)}
                    </h2>

                    {/* Highlights / Features */}
                    <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-[#1a1a1a]/80 text-[10px] md:text-xs lg:text-sm font-medium border-l border-[#788069]/30 pl-4 py-1">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-[#788069]" />
                            <span>{active.vendorName || "Premium Partner"}</span>
                        </div>
                        {active.features && active.features.length > 0 && active.features.slice(0, 3).map((feature, idx) => (
                            <React.Fragment key={idx}>
                                <div className="w-1 h-1 rounded-full bg-[#1a1a1a]/20" />
                                <div className="flex items-center gap-2 text-[#1a1a1a]/90">
                                    {getFeatureIcon(feature)}
                                    <span>{feature}</span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Price & Description */}
                    <div className="flex flex-col gap-3 lg:gap-4 w-full max-w-2xl mt-2">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/50 mb-1 lg:mb-2 font-bold">Start From</p>
                            <p className="text-2xl md:text-3xl lg:text-4xl text-[#788069] font-medium tracking-wide">
                                {formatIDR(active.price)}
                            </p>
                        </div>
                        <p className="text-[#1a1a1a]/70 text-xs md:text-sm lg:text-base leading-relaxed font-light line-clamp-2 md:line-clamp-3">
                            {active.description}
                        </p>
                    </div>

                    {/* Controls & CTA */}
                    <div className="flex items-center gap-4 lg:gap-6 pt-2 lg:pt-4">
                        <Link
                            href={`/packages/${active.id}`}
                            className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-[#111310] text-[#fdfbf7] rounded-full overflow-hidden transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(17,19,16,0.2)]"
                        >
                            <span className="relative z-10 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Explore Package</span>
                            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            {/* Hover accent */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#111310] to-[#252822] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </Link>

                        <div className="flex items-center gap-3 border border-[#1a1a1a]/10 p-1.5 rounded-full bg-white/50 backdrop-blur-sm shadow-sm">
                            <button onClick={handlePrev} className="w-10 h-10 flex items-center justify-center rounded-full text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/5 hover:text-[#1a1a1a] transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={handleNext} className="w-10 h-10 flex items-center justify-center rounded-full text-[#788069] hover:bg-[#788069]/10 transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right: Carousel Stack */}
                <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end perspective-[1200px] mt-6 lg:mt-0 pb-10 lg:pb-0 h-[300px] lg:h-auto">
                    {/* Adjusted dimensions to fit securely inside an h-screen container */}
                    <div ref={carouselRef} className="relative w-[220px] md:w-[260px] lg:w-[280px] xl:w-[320px] h-[300px] md:h-[360px] lg:h-[400px] xl:h-[460px]">
                        {items.slice(1, 5).map((pkg, i) => (
                            <div
                                key={pkg.id + i}
                                ref={(el) => { if (el) cardsRef.current[i] = el; }}
                                className="absolute top-0 right-0 w-full h-full origin-bottom-right cursor-pointer"
                                onClick={handleNext}
                            >
                                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#1a1a1a]/5 shadow-2xl group bg-white">
                                    <Image
                                        src={pkg.imageUrl}
                                        alt={pkg.name}
                                        fill
                                        loading="lazy"
                                        unoptimized={pkg.imageUrl.includes("firebasestorage.googleapis.com")}
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    {/* Glassmorphism info box - Light version */}
                                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 bg-gradient-to-t from-white/95 via-white/80 to-transparent backdrop-blur-[2px]">
                                        <p className="text-[9px] uppercase tracking-widest text-[#788069] mb-1 font-bold">Upcoming</p>
                                        <h3 className="text-sm md:text-base font-bold text-[#1a1a1a] uppercase leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-display), serif' }}>
                                            {pkg.name}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar (Attached to bottom of carousel area) */}
                    <div className="absolute bottom-0 right-0 w-[240px] md:w-[280px] lg:w-[300px] xl:w-[320px] h-[3px] bg-[#1a1a1a]/10 rounded-full overflow-hidden">
                        <div ref={progressRef} className="h-full bg-[#788069] w-full" />
                    </div>
                </div>

            </div>
        </section>
    );
};

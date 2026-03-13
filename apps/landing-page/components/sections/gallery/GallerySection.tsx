"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGallery, GalleryItem } from "@/services/useGallery";

// Ultra-premium curated fallback images
const DUMMY_GALLERY: GalleryItem[] = [
    { id: "d1", url: "https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?auto=format&fit=crop&q=80", order: 0, storagePath: "" }, // Hotel facade
    { id: "d2", url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80", order: 1, storagePath: "" }, // Luxury room
    { id: "d3", url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80", order: 2, storagePath: "" }, // Dining / Restaurant
    { id: "d4", url: "https://images.unsplash.com/photo-1533646549887-17559ebc3411?auto=format&fit=crop&q=80", order: 3, storagePath: "" }, // Sunset / Lifestyle
    { id: "d5", url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80", order: 4, storagePath: "" }, // Gathering / Meeting
    { id: "d6", url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80", order: 5, storagePath: "" }, // Outdoor / Catamaran
    { id: "d7", url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80", order: 6, storagePath: "" }, // Culinary Details
];

export const GallerySection = () => {
    const { items: dbItems, loading } = useGallery();
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
    
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!loading) {
            setItems(dbItems && dbItems.length > 0 ? dbItems : DUMMY_GALLERY);
        }
    }, [dbItems, loading]);

    useEffect(() => {
        if (loading || items.length === 0 || !sectionRef.current) return;

        const ctx = gsap.context(() => {
            // 1. Entrance Animation for Header
            gsap.fromTo(headerRef.current?.children || [],
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: "top 85%",
                        toggleActions: "play reverse play reverse"
                    }
                }
            );

            // 2. Parallax and Staggered Entrance for Masonry Images
            imageRefs.current.forEach((imgContainer, i) => {
                if (!imgContainer) return;
                
                // Subtle random vertical offset based on index creates a natural masonry feel during scroll
                const offset = (i % 3) * 30 + 50; 
                
                gsap.fromTo(imgContainer,
                    { y: offset, opacity: 0, scale: 0.95 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 1.5,
                        ease: "expo.out",
                        scrollTrigger: {
                            trigger: imgContainer,
                            start: "top 90%",
                            end: "top 30%",
                            scrub: 1, // Smooth scrub for parallax texturing
                        }
                    }
                );

                // Subtle inner image parallax (image moves slightly slower than container)
                const innerImg = imgContainer.querySelector('img');
                if (innerImg) {
                    gsap.fromTo(innerImg,
                        { scale: 1.15, yPercent: 10 },
                        {
                            scale: 1,
                            yPercent: -5,
                            ease: "none",
                            scrollTrigger: {
                                trigger: imgContainer,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: true,
                            }
                        }
                    );
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, [items, loading]);

    if (loading) return null;

    return (
        <section
            ref={sectionRef}
            className="relative w-full py-24 md:py-32 lg:py-40 bg-[#fdfbf7] overflow-hidden"
            id="gallery"
        >
            <div className="relative z-20 w-full max-w-[1800px] mx-auto px-6 md:px-12 xl:px-24 flex flex-col items-center">
                
                {/* ── Header ── */}
                <div ref={headerRef} className="flex flex-col items-center text-center max-w-3xl mb-16 md:mb-24">
                    <div className="flex items-center gap-4 justify-center mb-6">
                        <div className="w-12 h-[1px] bg-[#788069]" />
                        <span className="text-[#788069] text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">
                            Visual Journey
                        </span>
                        <div className="w-12 h-[1px] bg-[#788069]" />
                    </div>
                    
                    <h2 
                        className="text-5xl md:text-6xl lg:text-7xl text-[#1a1a1a] leading-[1.1] tracking-tight uppercase"
                        style={{ fontFamily: 'var(--font-display), serif' }}
                    >
                        <span className="font-medium">Discover</span>{" "}
                        <span className="font-light italic text-[#788069]">Bumi Anyom</span>
                    </h2>
                    
                    <p className="mt-6 text-[#1a1a1a]/60 text-sm md:text-base leading-relaxed font-light max-w-xl mx-auto">
                        Explore our curated collection of moments, capturing the essence of luxury, tranquility, and unforgettable experiences.
                    </p>
                </div>

                {/* ── Masonry/Staggered Grid ── */}
                {/* Using CSS columns for a true masonry effect that automatically balances heights */}
                <div 
                    ref={gridRef}
                    className="w-full columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 md:gap-6 space-y-4 md:space-y-6"
                >
                    {/* Show up to 11 items for a fuller grid */}
                    {items.slice(0, 11).map((item, index) => {
                        // Varying aspect ratios to create an aesthetic, imperfect masonry grid
                        const isPortrait = index % 3 === 0;
                        const isSquare = index % 4 === 0;
                        const ratioClass = isPortrait ? "aspect-[3/4]" : isSquare ? "aspect-[1/1]" : "aspect-[4/3]";
                        
                        return (
                            <div 
                                key={item.id || index}
                                ref={(el) => { if (el) imageRefs.current[index] = el; }}
                                className={`relative w-full ${ratioClass} overflow-hidden rounded-xl bg-[#1a1a1a]/5 break-inside-avoid group cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-500`}
                            >
                                <Image
                                    src={item.url}
                                    alt={`Gallery image ${index + 1}`}
                                    fill
                                    className="object-cover will-change-transform group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                />
                                {/* Hidden overlay that appears on hover for depth */}
                                <div 
                                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center cursor-zoom-in"
                                    onClick={() => setSelectedImage(item)}
                                >
                                    <span className="text-white text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                        View
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── View All Feature ── */}
                <div className="mt-20 md:mt-24 z-20 flex justify-center w-full">
                    <Link
                        href="/gallery"
                        className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-[#111310] text-[#fdfbf7] rounded-full overflow-hidden transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(17,19,16,0.2)]"
                    >
                        <span className="relative z-10 text-xs font-bold uppercase tracking-[0.2em]">Discover Full Gallery</span>
                        <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        {/* Hover effect background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#111310] to-[#252822] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </Link>
                </div>

            </div>

            {/* ── Animated Lightbox ── */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z[100] z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-12 cursor-zoom-out"
                        onClick={() => setSelectedImage(null)}
                    >
                        {/* Close Button */}
                        <motion.button
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm z-50 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                        >
                            <X size={24} />
                        </motion.button>

                        {/* Image Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full h-full max-w-7xl max-h-[90vh] rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-default"
                            onClick={(e) => e.stopPropagation()} // Prevent clicks on image from closing lightbox
                        >
                            <Image
                                src={selectedImage.url}
                                alt="Gallery Preview"
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

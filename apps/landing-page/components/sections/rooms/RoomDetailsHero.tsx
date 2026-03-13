"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";

interface RoomImage {
    url: string;
    isProfile: boolean;
}

interface RoomDetailsHeroProps {
    images: RoomImage[];
    name: string;
}

export const RoomDetailsHero = ({ images, name }: RoomDetailsHeroProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".hero-content", 
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.5, ease: "power2.out", delay: 0.5 }
            );
        }, heroRef);
        return () => ctx.revert();
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    return (
        <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-black">
            {/* Background Images Slider */}
            {images.map((img, idx) => (
                <div
                    key={idx}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{
                        opacity: idx === currentIndex ? 1 : 0,
                        zIndex: idx === currentIndex ? 10 : 0
                    }}
                >
                    <img
                        src={img.url}
                        alt={`${name} - ${idx}`}
                        className="w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            ))}

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                <div className="hero-content space-y-6">
                    <h1 
                        className="text-6xl md:text-8xl lg:text-9xl text-white font-extralight leading-none uppercase tracking-tighter"
                        style={{ fontFamily: 'var(--font-display), serif' }}
                    >
                        {name}
                    </h1>
                </div>
            </div>

            {/* Slider Controls */}
            {images.length > 1 && (
                <div className="absolute bottom-12 right-12 z-30 flex gap-4">
                    <button
                        onClick={prevSlide}
                        className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-500"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-500"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 text-white/50 animate-bounce">
                <ArrowDown size={20} />
            </div>

            {/* Counter */}
            <div className="absolute bottom-12 left-12 z-30 text-white">
                <span className="text-4xl font-light">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="text-white/30 mx-2">/</span>
                <span className="text-lg text-white/50">{String(images.length).padStart(2, '0')}</span>
            </div>
        </section>
    );
};

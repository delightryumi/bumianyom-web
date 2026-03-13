"use client";

import React, { useState, useLayoutEffect, useRef } from "react";
import { Sidebar, SectionType } from "./Sidebar";
import { LogoSection } from "../sections/logo/LogoSection";
import { HeroSection } from "../sections/hero/HeroSection";
import { RoomTypeSection } from "../sections/rooms/RoomTypeSection";
import { AboutUsSection } from "../sections/about/AboutUsSection";
import { GallerySection } from "../sections/gallery/GallerySection";
import { AttractionsSection } from "../sections/attractions/AttractionsSection";
import { FooterSection } from "../sections/footer/FooterSection";
import { useFooter } from "../sections/footer/useFooter";
import { SEOSection } from "../sections/seo/SEOSection";
import { OverviewSection } from "../sections/overview/OverviewSection";
import { PromoSection } from "../sections/promo/PromoSection";
import { PackagesSection } from "../sections/packages/PackagesSection";
import { StatusWidget } from "./StatusWidget";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import gsap from "gsap";
import "./layout.css";

// We will import sections here as we build them
// For now, we'll use placeholders

export const DashboardLayout = () => {
    const [activeSection, setActiveSection] = useState<SectionType>("overview");
    const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed for aesthetics and mobile
    const { poweredByText, poweredByLink } = useFooter();
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        // Reset and animate
        gsap.fromTo(
            containerRef.current.querySelectorAll(".card, .glass-card, .section-container > header, .form-group"),
            {
                opacity: 0,
                y: 30,
                scale: 0.98
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                clearProps: "all"
            }
        );
    }, [activeSection]);

    const renderSection = () => {
        switch (activeSection) {
            case "overview":
                return <OverviewSection onNavigate={setActiveSection} />;
            case "logo":
                return <LogoSection />;
            case "hero":
                return <HeroSection />;
            case "room-type":
                return <RoomTypeSection />;
            case "about":
                return <AboutUsSection />;
            case "gallery":
                return <GallerySection />;
            case "attractions":
                return <AttractionsSection />;
            case "promo":
                return <PromoSection />;
            case "packages":
                return <PackagesSection />;
            case "footer":
                return <FooterSection />;
            case "seo":
                return <SEOSection />;
            default:
                return (
                    <div className="fade-in text-center py-20">
                        <h2 className="text-xl font-semibold text-gray-400">Section "{activeSection}" is coming soon.</h2>
                        <p className="text-gray-400 mt-2">I am building this modularly as requested.</p>
                    </div>
                );
        }
    };

    return (
        <div className={`dashboard-wrapper ${isCollapsed ? "collapsed" : ""} ${!isCollapsed ? "mobile-open" : ""}`}>
            <Sidebar
                activeSection={activeSection}
                setActiveSection={(s: SectionType) => {
                    setActiveSection(s);
                    // Close on mobile when navigation happens
                    if (window.innerWidth <= 1024) setIsCollapsed(true);
                }}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            {/* Mobile Overlay */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
            <main className="main-content">
                <div className="dashboard-top-bar">
                    <StatusWidget />
                </div>

                <div className="main-scroll-container">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            ref={containerRef}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="section-wrapper"
                        >
                            {renderSection()}
                        </motion.div>
                    </AnimatePresence>

                    <footer className="dashboard-footer-clean">
                        <a
                            href={poweredByLink || "https://nexuragroups.com"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="powered-by-link"
                        >
                            <span className="text-light">Powered by</span>
                            <span className="text-brand">{poweredByText || "Nexura Global Hospitality"}</span>
                            <ExternalLink size={12} className="link-icon" />
                        </a>
                    </footer>
                </div>
            </main>
        </div>
    );
};

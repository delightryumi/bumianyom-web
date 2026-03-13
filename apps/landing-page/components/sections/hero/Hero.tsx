'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { HeroSlide } from '../../../../../types/hero';
import { WidgetSection } from '../widget/WidgetSection';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const Hero = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxWrapperRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const docRef = doc(db, "sections", "hero");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.slides && Array.isArray(data.slides)) {
            setSlides(data.slides);
          }
        }
      } catch (err) {
        console.error("Error fetching hero section data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  useGSAP(() => {
    if (!containerRef.current || slides.length === 0) return;

    // Apply parallax to the entire Swiper wrapper. 
    // This allows Swiper to slide elements left/right, while GSAP handles the depth scaling on scroll.
    const parallaxTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=200%",
        scrub: 1,
        pin: true,
      }
    });

    // We target classes so it applies to ALL slides currently inside the Swiper
    parallaxTl.to(".bg-parallax", { scale: 1.15, y: "5vh", ease: "none" }, 0)
      .to(".mg-parallax", { scale: 1.05, y: "-10vh", ease: "none" }, 0)
      .to(".fg-parallax", { scale: 1.25, ease: "none" }, 0)

      // Intro animations: make title and pill appear out of nowhere
      .fromTo(".hero-text-content",
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        0.1
      )

      // Subtitle/Widgets appear after
      .fromTo(".hero-widget-content",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        0.25
      )

      // Outro animations: Fade everything away on deep scroll
      .to(".text-parallax", {
        opacity: 0,
        y: -150,
        filter: "blur(8px)",
        ease: "power2.inOut",
        duration: 0.4
      }, 0.6);

  }, { scope: containerRef, dependencies: [slides] }); // Re-run GSAP when slides load

  if (loading) {
    return <div className="h-screen w-full bg-[#1a1a1a]" />;
  }

  // Fallback if no slides exist
  if (slides.length === 0) {
    return (
      <div className="h-screen w-full bg-[#1a1a1a] flex items-center justify-center">
        <h1 className="text-white/50 font-light tracking-widest uppercase">No Slides Configured</h1>
      </div>
    );
  }

  return (
    <div id="hero-section" ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#1a1a1a]">
      <Swiper
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        effect="fade"
        speed={1500}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation
        pagination={{
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} custom-bullet"></span>`;
          }
        }}
        loop={slides.length > 1}
        className="w-full h-full hero-swiper"
      >
        {slides.map((heroData, index) => (
          <SwiperSlide key={heroData.id || index}>
            <div className="w-full h-full relative" ref={parallaxWrapperRef}>
              {/* Background Layer (Slowest Parallax) */}
              <div
                className="bg-parallax absolute inset-x-0 -top-[20vh] w-full h-[140vh] pointer-events-none will-change-transform"
              >
                {heroData.backgroundImage && (
                  <img
                    src={heroData.backgroundImage}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Deep atmospheric gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent" />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Midground Layer (Medium Parallax) */}
              {heroData.midgroundImage && (
                <div
                  className="mg-parallax absolute inset-x-0 -top-[10vh] w-full h-[130vh] pointer-events-none will-change-transform origin-center"
                >
                  <img
                    src={heroData.midgroundImage}
                    alt="Midground"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Foreground Layer (Static / Fastest Parallax if image provided) */}
              {heroData.foregroundImage && (
                <div
                  className="fg-parallax absolute inset-x-0 bottom-0 w-full h-full pointer-events-none z-30 origin-bottom will-change-transform"
                >
                  <img
                    src={heroData.foregroundImage}
                    alt="Foreground"
                    className="w-full h-full object-cover object-bottom"
                  />
                </div>
              )}

              {/* Hero Typography Container (z-40: In front of everything including Foreground(30)) */}
              <motion.div
                style={{ opacity }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center px-6 mt-16 pointer-events-none"
              >
                <div className="text-parallax max-w-5xl mx-auto flex flex-col items-center relative pointer-events-auto">

                  <div className="hero-text-content opacity-0">
                    {heroData.title && (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="mb-4 px-4 py-1.5 border border-white/30 rounded-md bg-white/5 backdrop-blur-md cursor-pointer inline-block"
                        >
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                            Discover Sanctity
                          </span>
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-normal text-white leading-[1.0] tracking-normal mb-6 drop-shadow-2xl whitespace-pre-line relative" style={{ fontFamily: 'var(--font-great-vibes), cursive' }}>
                          {heroData.title}
                        </h1>
                      </>
                    )}
                  </div>

                  <div className="hero-widget-content opacity-0 mt-8 w-full">
                    {heroData.subtitle && (
                      <p className="text-lg md:text-xl text-white/80 font-light max-w-2xl leading-relaxed mb-6 drop-shadow-lg relative mx-auto">
                        {heroData.subtitle}
                      </p>
                    )}
                    {/* Incorporating WidgetSection directly sequentially after subtitle */}
                    <div className="w-full flex justify-center pointer-events-auto mt-4 px-4 translate-y-8">
                      <WidgetSection insideHero={true} />
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Mouse Scroll Indicator (Pulled out of Swiper so it persists across slides) */}
      {slides.length > 0 && (
        <motion.div
          animate={{ opacity: [0, 1] }}
          transition={{ delay: 1, duration: 1 }}
          style={{ opacity }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-none"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            Scroll to Explore
          </span>
          <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
            <motion.div
              className="w-full h-1/2 bg-white"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}

    </div>
  );
};

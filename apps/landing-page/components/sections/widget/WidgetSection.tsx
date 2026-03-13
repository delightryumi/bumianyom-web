"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun, Wind } from "lucide-react";

// Coordinates for Temanggung, Central Java
const LAT = -7.3167;
const LON = 110.1667;

export const WidgetSection = ({ insideHero = false }: { insideHero?: boolean }) => {
  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<{ temp: number; code: number; isDay: boolean } | null>(null);

  useEffect(() => {
    // Clock Tick
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);

    // Weather Fetch (Open-Meteo is free and requires no API key)
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,is_day&timezone=Asia%2FJakarta`);
        const data = await res.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          isDay: data.current.is_day === 1,
        });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };
    fetchWeather();

    return () => clearInterval(interval);
  }, []);

  // WMO Weather interpretation codes
  const getWeatherIcon = (code: number, isDay: boolean) => {
    // 0: Clear sky
    if (code === 0) return isDay ? <Sun size={24} className="text-[#eab308]" /> : <Moon size={24} className="text-slate-200" />;
    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    if (code <= 3) return isDay ? <CloudSun size={24} className="text-slate-400" /> : <CloudMoon size={24} className="text-slate-400" />;
    // 45, 48: Fog and depositing rime fog
    if (code === 45 || code === 48) return <CloudFog size={24} className="text-slate-400" />;
    // 51-55: Drizzle
    if (code >= 51 && code <= 55) return <CloudDrizzle size={24} className="text-blue-300" />;
    // 61-65: Rain
    if (code >= 61 && code <= 65) return <CloudRain size={24} className="text-blue-400" />;
    // 71-77: Snow
    if (code >= 71 && code <= 77) return <CloudSnow size={24} className="text-sky-200" />;
    // 95-99: Thunderstorm
    if (code >= 95) return <CloudLightning size={24} className="text-purple-400" />;

    return <Cloud size={24} className="text-slate-400" />;
  };

  const getWeatherText = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Drizzling";
    if (code >= 61 && code <= 65) return "Raining";
    if (code >= 71 && code <= 77) return "Snowing";
    if (code >= 95) return "Thunderstorm";
    return "Cloudy";
  };

  if (!time) return null; // Prevent hydration mismatch before mount

  const formattedTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':');
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' });

  const InnerContent = (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 pr-10 md:p-8 md:pr-12 flex flex-col md:flex-row items-center gap-8 md:gap-16">

      {/* Location & Time Block */}
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-md bg-[#fef7e5] flex items-center justify-center">
          <div className="w-2 h-2 rounded-sm bg-[#788069] animate-pulse" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#788069] mb-1">
            Local Time
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-light text-[#1a1a1a] tracking-tight">{formattedTime}</span>
            <span className="text-sm font-medium text-[#1a1a1a]/40 uppercase tracking-widest">WIB</span>
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px h-12 bg-[#1a1a1a]/10" />

      {/* Date Block */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#788069] mb-1">
          Temanggung, ID
        </p>
        <p className="text-lg font-medium text-[#1a1a1a] tracking-tight">
          {formattedDate}
        </p>
      </div>

      <div className="hidden md:block w-px h-12 bg-[#1a1a1a]/10" />

      {/* Weather Block */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#788069] mb-1 flex items-center gap-2">
          <Wind size={12} />
          Conditions
        </p>
        <div className="flex items-center gap-3">
          {weather ? (
            <>
              {getWeatherIcon(weather.code, weather.isDay)}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-light text-[#1a1a1a] tracking-tight">{weather.temp}°</span>
                <span className="text-xs font-medium text-[#1a1a1a]/40 tracking-widest uppercase">C</span>
              </div>
              <span className="text-sm font-medium text-[#1a1a1a]/60 ml-2 hidden lg:inline-block">
                {getWeatherText(weather.code)}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2 h-8">
              <div className="w-4 h-4 border-2 border-[#1a1a1a]/20 border-t-[#788069] rounded-full animate-spin" />
              <span className="text-xs text-[#1a1a1a]/40 tracking-widest uppercase">Reading</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );

  if (insideHero) {
    return (
      <div className="w-full flex justify-center pointer-events-auto">
        {InnerContent}
      </div>
    );
  }

  return (
    <section className="relative w-full -mt-20 z-30 pointer-events-none px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto flex justify-center pointer-events-auto"
      >
        {InnerContent}
      </motion.div>
    </section>
  );
};

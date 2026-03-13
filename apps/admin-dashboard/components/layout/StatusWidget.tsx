"use client";

"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Wifi } from "lucide-react";

export const StatusWidget = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getGreeting = () => {
        const hour = time.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="status-widget-container">
            <div className="status-info">
                <div className="greeting-pill">
                    <span className="greeting-text">{getGreeting()}</span>
                </div>

                <div className="date-time-cluster">
                    <div className="time-display">
                        <Clock size={14} className="text-sage/60" />
                        <span>{formatTime(time)}</span>
                    </div>
                    <div className="divider-dot" />
                    <div className="date-display">
                        <Calendar size={14} className="text-sage/60" />
                        <span>{formatDate(time)}</span>
                    </div>
                </div>
            </div>

            <div className="system-status">
                <div className="status-indicator">
                    <div className="pulse-dot" />
                    <span className="status-text">System Live</span>
                </div>
                <Wifi size={14} className="text-sage/40" />
            </div>
        </div>
    );
};

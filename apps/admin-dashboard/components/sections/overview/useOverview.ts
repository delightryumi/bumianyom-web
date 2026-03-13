"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // Adjust path if needed
import { collection, onSnapshot, doc } from "firebase/firestore";

export interface OverviewStats {
    roomsCount: number;
    galleryCount: number;
    attractionsCount: number;
    seoConfigured: boolean;
    loading: boolean;
}

export const useOverview = () => {
    const [stats, setStats] = useState<OverviewStats>({
        roomsCount: 0,
        galleryCount: 0,
        attractionsCount: 0,
        seoConfigured: false,
        loading: true,
    });

    useEffect(() => {
        const unsubRooms = onSnapshot(collection(db, "roomTypes"), (snapshot) => {
            setStats(prev => ({ ...prev, roomsCount: snapshot.size }));
        });

        const unsubGallery = onSnapshot(collection(db, "gallery"), (snapshot) => {
            setStats(prev => ({ ...prev, galleryCount: snapshot.size }));
        });

        const unsubAttractions = onSnapshot(collection(db, "attractions"), (snapshot) => {
            setStats(prev => ({ ...prev, attractionsCount: snapshot.size }));
        });

        const unsubSEO = onSnapshot(doc(db, "settings", "seo"), (snapshot) => {
            setStats(prev => ({
                ...prev,
                seoConfigured: snapshot.exists(),
                loading: false
            }));
        });

        return () => {
            unsubRooms();
            unsubGallery();
            unsubAttractions();
            unsubSEO();
        };
    }, []);

    return stats;
};

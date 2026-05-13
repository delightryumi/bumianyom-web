"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, onSnapshot, doc } from "firebase/firestore";

export interface BookingEntry {
    guestName: string;
    bookingId?: string;
    roomType: string;
    channel: string;
    amount: number;
    status: string;
    timestamp: string;
    checkInDate?: string;
    checkOutDate?: string;
}

export interface OverviewStats {
    roomsCount: number;
    galleryCount: number;
    attractionsCount: number;
    seoConfigured: boolean;
    loading: boolean;
    
    checkInCount: number;
    checkOutCount: number;
    cancelCount: number;
    todayCheckIns: BookingEntry[];
    todayCheckOuts: BookingEntry[];
    todayCanceled: BookingEntry[];
    roomStatus: { occupied: number; available: number; total: number };
    latestBookings: BookingEntry[];
}

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useOverview = () => {
    const [stats, setStats] = useState<OverviewStats>({
        roomsCount: 0,
        galleryCount: 0,
        attractionsCount: 0,
        seoConfigured: false,
        loading: true,
        
        checkInCount: 0,
        checkOutCount: 0,
        cancelCount: 0,
        todayCheckIns: [],
        todayCheckOuts: [],
        todayCanceled: [],
        roomStatus: { occupied: 0, available: 0, total: 0 },
        latestBookings: [],
    });

    useEffect(() => {
        let unsubDaily: any = null;

        const initBookings = async () => {
            try {
                // Hardcoded: Single Hotel — Bumi Anyom Resort
                const hotelId = "bumi-anyom-resort";

                const dateStr = getLocalDateString(new Date());
                const docId = `${hotelId}_${dateStr}`;
                
                unsubDaily = onSnapshot(doc(db, "daily_revenue", docId), (docSnap) => {
                    let checkIn: BookingEntry[] = [];
                    let checkOut: BookingEntry[] = [];
                    let cancels: BookingEntry[] = [];
                    let entries: any[] = [];
                    
                    if (docSnap.exists()) {
                        entries = docSnap.data().entries || [];
                        
                        entries.forEach((e: any) => {
                            if (e.status === "CANCELLED") {
                                cancels.push(e);
                            } else if (e.type === "accommodation" || (!e.type && e.guestName)) {
                                if (e.checkInDate === dateStr) checkIn.push(e);
                                if (e.checkOutDate === dateStr) checkOut.push(e);
                            }
                        });
                    }
                    
                    const accommodationOnly = entries.filter((e: any) => e.type === "accommodation" || (!e.type && e.guestName));
                    const sorted = [...accommodationOnly].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    const latest = sorted.slice(0, 10);
                    
                    setStats(prev => {
                        const newTotal = prev.roomStatus.total;
                        const occupied = checkIn.length;
                        return {
                            ...prev,
                            checkInCount: occupied,
                            checkOutCount: checkOut.length,
                            cancelCount: cancels.length,
                            todayCheckIns: checkIn,
                            todayCheckOuts: checkOut,
                            todayCanceled: cancels,
                            latestBookings: latest,
                            roomStatus: {
                                ...prev.roomStatus,
                                occupied: occupied,
                                available: Math.max(0, newTotal - occupied)
                            }
                        };
                    });
                });
            } catch (err) {
                console.error("Error fetching bookings for overview", err);
            }
        };

        initBookings();

        const unsubRooms = onSnapshot(collection(db, "roomTypes"), (snapshot) => {
            let totalRooms = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                const count = parseInt(data.totalRooms) || parseInt(data.quantity) || parseInt(data.stok) || 5;
                totalRooms += count;
            });
            
            setStats(prev => {
                const occupied = prev.checkInCount;
                return { 
                    ...prev, 
                    roomsCount: snapshot.size,
                    roomStatus: { 
                        total: totalRooms,
                        occupied: occupied,
                        available: Math.max(0, totalRooms - occupied)
                    }
                };
            });
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
            if (unsubDaily) unsubDaily();
        };
    }, []);

    return stats;
};

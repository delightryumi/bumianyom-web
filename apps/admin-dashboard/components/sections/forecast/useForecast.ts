import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, getDocs, query, where } from "firebase/firestore";

export interface ForecastStats {
    totalGrossRevenue: number;
    salesPayAtNexura: number;
    salesPayAtHotel: number;
    walkInRevenue: number;
    otaRevenue: number;
    otherRevenue: number;
    
    occ: number;
    arr: number;
    revPar: number;
    
    entries: any[];
    loading: boolean;
}

export const useForecast = (viewMode: "daily" | "monthly", selectedDate: string) => {
    const [stats, setStats] = useState<ForecastStats>({
        totalGrossRevenue: 0,
        salesPayAtNexura: 0,
        salesPayAtHotel: 0,
        walkInRevenue: 0,
        otaRevenue: 0,
        otherRevenue: 0,
        occ: 0,
        arr: 0,
        revPar: 0,
        entries: [],
        loading: true,
    });

    useEffect(() => {
        setStats(prev => ({ ...prev, loading: true }));
        
        // 1. Get Total Physical Rooms
        const fetchRooms = async () => {
            const roomSnap = await getDocs(collection(db, "roomTypes"));
            let count = 0;
            roomSnap.forEach(d => {
                const data = d.data();
                count += (data.roomCount || data.totalRooms || 1);
            });
            return count;
        };

        const hotelId = "bumi-anyom-resort";
        
        let unsub: any = null;

        if (viewMode === "daily") {
            const docId = `${hotelId}_${selectedDate}`;
            unsub = onSnapshot(doc(db, "daily_revenue", docId), async (docSnap) => {
                const totalPhysicalRooms = await fetchRooms();
                
                let gross = 0;
                let walkin = 0;
                let ota = 0;
                let other = 0;
                let nexura = 0;
                let hotel = 0;
                let roomsSold = 0;
                let roomRevenue = 0;

                const entries = docSnap.exists() ? docSnap.data().entries || [] : [];

                entries.forEach((e: any) => {
                    if (e.status !== "CANCELLED") {
                        const amount = Number(e.amount) || 0;
                        gross += amount;
                        
                        // ── Category Revenue by Type & Source ──
                        if (e.type === "other_income") {
                            other += amount;
                        } else {
                            // Accommodation categorization
                            if (e.source === "Walk-in") walkin += amount;
                            else if (e.source === "OTA") ota += amount;
                            else other += amount;
                        }

                        if (e.paymentStatus === "Pay at Nexura") nexura += amount;
                        if (e.paymentStatus === "Pay at Hotel") hotel += amount;
                        
                        // Financial Metrics - Only for Accommodation
                        if (e.type === "accommodation" || (!e.type && e.guestName)) {
                            roomsSold += 1;
                            roomRevenue += amount; 
                        }
                    }
                });

                const occ = totalPhysicalRooms > 0 ? (roomsSold / totalPhysicalRooms) * 100 : 0;
                const arr = roomsSold > 0 ? roomRevenue / roomsSold : 0;
                const revPar = totalPhysicalRooms > 0 ? roomRevenue / totalPhysicalRooms : 0;

                setStats({
                    totalGrossRevenue: gross,
                    salesPayAtNexura: nexura,
                    salesPayAtHotel: hotel,
                    walkInRevenue: walkin,
                    otaRevenue: ota,
                    otherRevenue: other,
                    occ,
                    arr,
                    revPar,
                    entries,
                    loading: false,
                });
            });
        } else {
            // Monthly view: Aggregate multiple days
            const [year, month] = selectedDate.split("-");
            const startPrefix = `${hotelId}_${year}-${month}`;
            
            const fetchMonthly = async () => {
                const totalPhysicalRooms = await fetchRooms();
                const q = collection(db, "daily_revenue");
                const snap = await getDocs(q);
                
                let gross = 0;
                let walkin = 0;
                let ota = 0;
                let other = 0;
                let nexura = 0;
                let hotel = 0;
                let roomsSold = 0;
                let roomRevenue = 0;
                let monthlyEntries: any[] = [];
                
                const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

                snap.forEach(d => {
                    if (d.id.startsWith(startPrefix)) {
                        const data = d.data();
                        const entries = data.entries || [];
                        entries.forEach((e: any) => {
                            if (e.status !== "CANCELLED") {
                                const amount = Number(e.amount) || 0;
                                gross += amount;
                                if (e.type === "other_income") {
                                    other += amount;
                                } else {
                                    if (e.source === "Walk-in") walkin += amount;
                                    else if (e.source === "OTA") ota += amount;
                                    else other += amount;
                                }

                                if (e.paymentStatus === "Pay at Nexura") nexura += amount;
                                if (e.paymentStatus === "Pay at Hotel") hotel += amount;
                                
                                roomsSold += 1;
                                roomRevenue += amount;
                                monthlyEntries.push(e);
                            }
                        });
                    }
                });

                const totalPossibleRoomNights = totalPhysicalRooms * daysInMonth;
                const occ = totalPossibleRoomNights > 0 ? (roomsSold / totalPossibleRoomNights) * 100 : 0;
                const arr = roomsSold > 0 ? roomRevenue / roomsSold : 0;
                const revPar = totalPossibleRoomNights > 0 ? roomRevenue / totalPossibleRoomNights : 0;

                setStats({
                    totalGrossRevenue: gross,
                    salesPayAtNexura: nexura,
                    salesPayAtHotel: hotel,
                    walkInRevenue: walkin,
                    otaRevenue: ota,
                    otherRevenue: other,
                    occ,
                    arr,
                    revPar,
                    entries: monthlyEntries,
                    loading: false,
                });
            };
            
            fetchMonthly();
            unsub = () => {};
        }

        return () => unsub && unsub();
    }, [viewMode, selectedDate]);

    return stats;
};

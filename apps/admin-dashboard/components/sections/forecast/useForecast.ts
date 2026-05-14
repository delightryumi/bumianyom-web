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
    trendData: any[];
    loading: boolean;
}

export const useForecast = (viewMode: "daily" | "monthly" | "yearly", selectedDate: string) => {
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
        trendData: [],
        loading: true,
    });

    useEffect(() => {
        setStats(prev => ({ ...prev, loading: true }));
        
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
        
        const fetchData = async () => {
            const totalPhysicalRooms = await fetchRooms();
            const [year, month, day] = selectedDate.split("-");
            
            let startStr, endStr, totalDaysForOcc;
            let trendLabels: string[] = [];
            let trendMode: 'days' | 'months' | 'years' = 'days';

            if (viewMode === "daily") {
                // For Daily view, we want a trend of the current month
                startStr = `${year}-${month}-01`;
                const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
                endStr = `${year}-${month}-${String(daysInMonth).padStart(2, '0')}`;
                totalDaysForOcc = 1; // We'll handle individual days in trend
                trendMode = 'days';
                for(let i=1; i<=daysInMonth; i++) trendLabels.push(String(i));
            } else if (viewMode === "monthly") {
                // For Monthly view, we want trend of the current year
                startStr = `${year}-01-01`;
                endStr = `${year}-12-31`;
                totalDaysForOcc = new Date(Number(year), Number(month), 0).getDate();
                trendMode = 'months';
                trendLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            } else {
                // For Yearly view, we want trend of available years
                startStr = `2024-01-01`;
                endStr = `2030-12-31`;
                totalDaysForOcc = (Number(year) % 4 === 0 && (Number(year) % 100 !== 0 || Number(year) % 400 === 0)) ? 366 : 365;
                trendMode = 'years';
                trendLabels = ['2024','2025','2026','2027','2028','2029','2030'];
            }

            const q = query(collection(db, "daily_revenue"), where("date", ">=", startStr), where("date", "<=", endStr));
            const snap = await getDocs(q);
            
            let gross = 0, walkin = 0, ota = 0, other = 0, nexura = 0, hotel = 0, roomsSold = 0, roomRevenue = 0;
            let currentEntries: any[] = [];
            
            // Trend Buckets
            const buckets: Record<string, any> = {};
            trendLabels.forEach(l => buckets[l] = { gross: 0, roomRev: 0, sold: 0 });

            snap.forEach(d => {
                const data = d.data();
                const date = data.date || ""; // YYYY-MM-DD
                const [dY, dM, dD] = date.split('-');
                
                let label = "";
                if (trendMode === 'days') label = String(parseInt(dD));
                else if (trendMode === 'months') label = trendLabels[parseInt(dM)-1];
                else label = dY;

                const isCurrent = (viewMode === "daily" && date === selectedDate) ||
                                  (viewMode === "monthly" && dY === year && dM === month) ||
                                  (viewMode === "yearly" && dY === year);

                (data.entries || []).forEach((e: any) => {
                    if (e.status !== "CANCELLED") {
                        const amount = Number(e.amount) || 0;
                        const isAcc = e.type === "accommodation" || (!e.type && e.guestName);

                        // Update Trend
                        if (buckets[label]) {
                            buckets[label].gross += amount;
                            if (isAcc) {
                                buckets[label].roomRev += amount;
                                buckets[label].sold += 1;
                            }
                        }

                        // Update Current Totals
                        if (isCurrent) {
                            gross += amount;
                            if (e.type === "other_income") other += amount;
                            else {
                                if (e.source === "Walk-in") walkin += amount;
                                else if (e.source === "OTA") ota += amount;
                                else other += amount;
                            }
                            if (e.paymentStatus === "Pay at Nexura") nexura += amount;
                            if (e.paymentStatus === "Pay at Hotel") hotel += amount;
                            if (isAcc) {
                                roomsSold += 1;
                                roomRevenue += amount;
                            }
                            currentEntries.push({ ...e, _docId: d.id });
                        }
                    }
                });
            });

            // Calculate Trend Data
            const trendData = trendLabels.map(label => {
                const b = buckets[label];
                const daysInBucket = trendMode === 'days' ? 1 : 
                                     trendMode === 'months' ? new Date(Number(year), trendLabels.indexOf(label)+1, 0).getDate() :
                                     365; // approximation for years
                
                const occ = (totalPhysicalRooms * daysInBucket) > 0 ? (b.sold / (totalPhysicalRooms * daysInBucket)) * 100 : 0;
                const arr = b.sold > 0 ? b.roomRev / b.sold : 0;
                const revPar = (totalPhysicalRooms * daysInBucket) > 0 ? b.roomRev / (totalPhysicalRooms * daysInBucket) : 0;

                return {
                    label,
                    gross: b.gross,
                    occ,
                    arr,
                    revPar
                };
            });

            const totalPossibleRoomNights = totalPhysicalRooms * totalDaysForOcc;
            
            setStats({
                totalGrossRevenue: gross,
                salesPayAtNexura: nexura,
                salesPayAtHotel: hotel,
                walkInRevenue: walkin,
                otaRevenue: ota,
                otherRevenue: other,
                occ: totalPossibleRoomNights > 0 ? (roomsSold / totalPossibleRoomNights) * 100 : 0,
                arr: roomsSold > 0 ? roomRevenue / roomsSold : 0,
                revPar: totalPossibleRoomNights > 0 ? roomRevenue / totalPossibleRoomNights : 0,
                entries: currentEntries.sort((a, b) => (b.checkInDate || "").localeCompare(a.checkInDate || "")),
                trendData,
                loading: false,
            });
        };

        fetchData();
    }, [viewMode, selectedDate]);

    return stats;
};

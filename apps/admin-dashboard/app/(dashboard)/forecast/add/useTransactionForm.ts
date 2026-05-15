"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs, doc, updateDoc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export interface RoomType {
    id: string;
    name: string;
}

export const SAGE = "#788069";

export const CHANNELS = [
    { name: "Traveloka", color: "#00aaf2", logo: "/channels/traveloka.png" },
    { name: "Booking.com", color: "#003580", logo: "/channels/booking_com.png" },
    { name: "Tiket.com", color: "#ff5e1a", logo: "/channels/tiket_com.png" },
    { name: "Agoda", color: "#e8173e", logo: "/channels/agoda.png" },
    { name: "Airbnb", color: "#ff5a5f", logo: "/channels/airbnb.png" },
    { name: "Trip.com", color: "#1890ff", logo: "/channels/trip.png" },
    { name: "Expedia", color: "#fbc02d", logo: "/channels/expedia.png" },
    { name: "MG Bedbank", color: "#6c3483", logo: "/channels/mg.png" },
    { name: "Nexura Sales", color: SAGE, logo: "/channels/nexura.png" },
    { name: "Walk-in", color: "#2e7d32", logo: "/channels/walk_in.png" },
    { name: "Booking Engine", color: SAGE, logo: "/channels/nexura.png" },
];

export const useTransactionForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [occupancy, setOccupancy] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState<"type" | "form">("type");
    const [revenueType, setRevenueType] = useState<"room" | "other">("room");
    
    const [form, setForm] = useState({
        guestName: "",
        checkIn: selectedDate,
        checkOut: "",
        rooms: [{ roomTypeId: "", roomNumber: "", price: "" }], // Array for multiple rooms
        channel: "Walk-in",
        voucherCode: "",
        paidAmount1: "",
        paidAmount2: "",
        paymentMethod: "Pay at Hotel" as "Pay at Hotel" | "Pay at Nexura",
        isSplitBill: false,
        incomeType: "Breakfast",
        totalAmount: "", // Used for other revenue
        note: "",
        staffName: ""
    });

    useEffect(() => {
        if (revenueType === "room" && !(form.channel === "Walk-in" || form.channel === "Nexura Sales")) {
            setForm(prev => ({ ...prev, paymentMethod: "Pay at Nexura", isSplitBill: false }));
        }
    }, [form.channel, revenueType]);

    // Fetch Allotment & Current Bookings
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Room Types (Total Allotment)
                const rSnap = await getDocs(collection(db, "roomTypes"));
                const types = rSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setRoomTypes(types);

                // 2. Get Existing Bookings for availability check
                const bSnap = await getDocs(collection(db, "daily_revenue"));
                const bookings = bSnap.docs.flatMap(d => d.data().entries || []);
                setOccupancy(bookings);
            } catch (err) {
                console.error("Error fetching inventory data:", err);
            }
        };
        fetchData();
    }, []);

    const start = form.checkIn ? new Date(form.checkIn) : null;
    const end = form.checkOut ? new Date(form.checkOut) : null;
    const nights = (start && end && end > start) ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 1;

    const grandTotal = revenueType === "room" 
        ? form.rooms.reduce((acc, r) => acc + (Number(r.price) || 0), 0) * nights
        : (Number(form.totalAmount) || 0);
        
    const balance = grandTotal - (Number(form.paidAmount1) || 0) - (form.isSplitBill ? (Number(form.paidAmount2) || 0) : 0);

    const isAvailable = useCallback(() => {
        if (revenueType !== "room" || !form.checkIn || !form.checkOut) return true;

        const startD = new Date(form.checkIn);
        const endD = new Date(form.checkOut);
        
        // Group requested rooms by type to check aggregate allotment
        const requestedByType: Record<string, number> = {};
        form.rooms.forEach(r => {
            if (r.roomTypeId) {
                requestedByType[r.roomTypeId] = (requestedByType[r.roomTypeId] || 0) + 1;
            }
        });

        // Loop through each night of the stay
        for (let d = new Date(startD); d < endD; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            for (const [typeId, count] of Object.entries(requestedByType)) {
                const type = roomTypes.find(rt => rt.id === typeId);
                if (!type) continue;

                // Count existing bookings for this room type on this date
                const occupied = occupancy.filter(e => 
                    e.type === 'accommodation' && 
                    e.status?.toUpperCase() !== 'CANCELLED' && 
                    e.status?.toUpperCase() !== 'CANCEL' &&
                    e.roomType?.toLowerCase() === type.name?.toLowerCase() &&
                    dateStr >= e.checkInDate && dateStr < e.checkOutDate
                ).reduce((acc, curr) => acc + (Number(curr.roomCount) || 1), 0);

                const totalAllotment = parseInt(type.roomCount) || parseInt(type.totalRooms) || 0;
                if (occupied + count > totalAllotment) return false;
            }
        }
        return true;
    }, [form.checkIn, form.checkOut, form.rooms, occupancy, roomTypes, revenueType]);

    const addRoom = () => {
        setForm(prev => ({
            ...prev,
            rooms: [...prev.rooms, { roomTypeId: "", roomNumber: "", price: "" }]
        }));
    };

    const removeRoom = (index: number) => {
        if (form.rooms.length <= 1) return;
        setForm(prev => ({
            ...prev,
            rooms: prev.rooms.filter((_, i) => i !== index)
        }));
    };

    const updateRoom = (index: number, field: string, value: any) => {
        setForm(prev => {
            const newRooms = [...prev.rooms];
            newRooms[index] = { ...newRooms[index], [field]: value };
            return { ...prev, rooms: newRooms };
        });
    };

    const handleSubmit = useCallback(async () => {
        const isRoom = revenueType === "room";
        
        // 1. Core Validation
        if (isRoom) {
            if (!form.guestName) { toast.error("Guest Name is required"); return; }
            if (!form.checkOut) { toast.error("Check-out Date is required"); return; }
            if (form.rooms.some(r => !r.roomTypeId)) { toast.error("Please select a category for all rooms"); return; }
            if (form.rooms.some(r => !r.price || Number(r.price) <= 0)) { toast.error("Please enter a valid price for all rooms"); return; }
        } else {
            if (!form.totalAmount || Number(form.totalAmount) <= 0) { toast.error("Total Amount is required"); return; }
        }

        if (form.isSplitBill && balance !== 0) {
            toast.error(`Payment balance mismatch: Rp ${new Intl.NumberFormat('id-ID').format(balance)} remaining`);
            return;
        }

        if (isRoom && !isAvailable()) {
            toast.error("Requested room types are sold out for these dates");
            return;
        }

        setSaving(true);
        try {
            const hotelId = "bumi-anyom-resort";
            const dateStr = form.checkIn;
            const docId = `${hotelId}_${dateStr}`;
            
            let transactionEntries: any[] = [];

            if (revenueType === "room") {
                transactionEntries = form.rooms.map(room => ({
                    type: "accommodation",
                    guestName: form.guestName,
                    checkInDate: form.checkIn,
                    checkOutDate: form.checkOut,
                    roomType: roomTypes.find(rt => rt.id === room.roomTypeId)?.name || "",
                    roomNumber: room.roomNumber,
                    roomCount: 1, // Default 1 per entry
                    nights: nights,
                    channel: form.channel,
                    voucherCode: form.voucherCode,
                    amount: Number(room.price) * nights,
                    paidAmount1: (Number(form.paidAmount1) + (form.isSplitBill ? Number(form.paidAmount2) : 0)) / form.rooms.length, // Pro-rated payment
                    paymentStatus: form.paymentMethod,
                    isSplitBill: form.isSplitBill,
                    source: (form.channel === "Walk-in" || form.channel === "Nexura Sales" || form.channel === "Booking Engine") ? "Walk-in" : "OTA",
                    status: "CONFIRMED",
                    staffName: form.staffName,
                    note: form.note,
                    timestamp: new Date().toISOString()
                }));
            } else {
                transactionEntries = [{
                    type: "other_income",
                    incomeCategory: form.incomeType,
                    note: form.note,
                    staffName: form.staffName || "System",
                    checkInDate: form.checkIn,
                    checkOutDate: form.checkIn,
                    amount: Number(form.totalAmount),
                    paidAmount1: Number(form.paidAmount1),
                    paymentStatus: form.paymentMethod,
                    status: "CONFIRMED",
                    timestamp: new Date().toISOString()
                }];
            }

            const docRef = doc(db, "daily_revenue", docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(docRef, { 
                    entries: arrayUnion(...transactionEntries),
                    date: dateStr
                });
            } else {
                await setDoc(docRef, { 
                    entries: transactionEntries,
                    date: dateStr
                });
            }

            toast.success("Transaction synchronized successfully");
            router.push("/forecast");
        } catch (err) {
            console.error(err);
            toast.error("Synchronization failed.");
        } finally {
            setSaving(false);
        }
    }, [form, roomTypes, balance, router, revenueType]);

    const updateForm = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return {
        form,
        roomTypes,
        saving,
        step,
        revenueType,
        balance,
        grandTotal,
        nights,
        setStep,
        setRevenueType,
        updateForm,
        addRoom,
        removeRoom,
        updateRoom,
        handleSubmit,
        isAvailable,
        router
    };
};

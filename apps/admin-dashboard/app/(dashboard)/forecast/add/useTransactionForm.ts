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

    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState<"type" | "form">("type");
    const [revenueType, setRevenueType] = useState<"room" | "other">("room");
    
    const [form, setForm] = useState({
        guestName: "",
        checkIn: selectedDate,
        checkOut: "",
        roomTypeId: "",
        roomNumber: "",
        channel: "Walk-in",
        voucherCode: "",
        totalAmount: "",
        paidAmount1: "",
        paidAmount2: "",
        paymentMethod: "Pay at Hotel" as "Pay at Hotel" | "Pay at Nexura",
        isSplitBill: false,
        incomeType: "Breakfast",
        note: "",
        staffName: ""
    });

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const snap = await getDocs(collection(db, "roomTypes"));
                setRoomTypes(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
            } catch (err) {
                console.error("Error fetching room types:", err);
            }
        };
        fetchRoomTypes();
    }, []);

    const balance = (Number(form.totalAmount) || 0) - (Number(form.paidAmount1) || 0) - (form.isSplitBill ? (Number(form.paidAmount2) || 0) : 0);

    const handleSubmit = useCallback(async () => {
        const isRoom = revenueType === "room";
        const isValid = isRoom 
            ? (form.guestName && form.roomTypeId && form.totalAmount)
            : (form.incomeType && form.staffName && form.totalAmount);

        if (!isValid) {
            toast.error("Required fields are missing");
            return;
        }

        if (form.isSplitBill && balance !== 0) {
            toast.error("Please balance the split payment before saving");
            return;
        }

        setSaving(true);
        try {
            const hotelId = "bumi-anyom-resort";
            const dateStr = form.checkIn;
            const docId = `${hotelId}_${dateStr}`;
            const selectedRoomType = revenueType === "room" ? (roomTypes.find(r => r.id === form.roomTypeId)?.name || "") : "";

            const transactionData = revenueType === "room" ? {
                type: "accommodation",
                guestName: form.guestName,
                checkInDate: form.checkIn,
                checkOutDate: form.checkOut,
                roomType: selectedRoomType,
                roomNumber: form.roomNumber,
                channel: form.channel,
                voucherCode: form.voucherCode,
                amount: Number(form.totalAmount),
                paidAmount1: Number(form.paidAmount1),
                paidAmount2: form.isSplitBill ? Number(form.paidAmount2) : 0,
                paymentStatus: form.paymentMethod,
                isSplitBill: form.isSplitBill,
                source: (form.channel === "Walk-in" || form.channel === "Nexura Sales" || form.channel === "Booking Engine") ? "Walk-in" : "OTA",
                status: "CONFIRMED",
                staffName: form.staffName,
                note: form.note,
                timestamp: new Date().toISOString()
            } : {
                type: "other_income",
                incomeCategory: form.incomeType,
                note: form.note,
                staffName: form.staffName,
                amount: Number(form.totalAmount),
                paidAmount1: Number(form.paidAmount1),
                paymentStatus: form.paymentMethod,
                status: "CONFIRMED",
                timestamp: new Date().toISOString()
            };

            const docRef = doc(db, "daily_revenue", docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(docRef, { entries: arrayUnion(transactionData) });
            } else {
                await setDoc(docRef, { entries: [transactionData] });
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
        setStep,
        setRevenueType,
        updateForm,
        handleSubmit,
        router
    };
};

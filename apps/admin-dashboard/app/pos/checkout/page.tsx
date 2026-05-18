"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Wallet, QrCode, Building2, UserCheck, ShieldCheck, ShoppingBag } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";
import { formatIDR } from "@/lib/pnl-utils";
import { TenderCalculator } from "./components/TenderCalculator";
import { SuccessReceipt } from "./components/SuccessReceipt";
import "./styles/checkout.css";

export default function POSCheckoutPage() {
    const router = useRouter();
    const [ticketData, setTicketData] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [cashReceived, setCashReceived] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem("pos_active_ticket");
        if (data) {
            setTicketData(JSON.parse(data));
        } else {
            // Fallback mock data if directly visited
            setTicketData({
                cart: [
                    { cartItemId: "1", name: "Wagyu Ribeye Sate", price: 285000, quantity: 1, category: "Food", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60" },
                    { cartItemId: "2", name: "Premium Royal Black Tea", price: 65000, quantity: 2, category: "Beverage", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60" }
                ],
                customerName: "John Doe",
                tableName: "Table 12",
                notes: "Extra spicy and less salt",
                ticketNumber: "BUMI-7555",
                subtotal: 415000,
                tax: 41500,
                total: 456500
            });
        }
    }, []);

    if (!ticketData) {
        return (
            <div className="flex-1 w-full h-full bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0066cc] border-t-transparent"></div>
            </div>
        );
    }

    const cashAmount = parseFloat(cashReceived) || 0;
    const changeDue = Math.max(0, cashAmount - ticketData.total);

    const handleConfirmPayment = async () => {
        if (paymentMethod === "Cash" && cashAmount < ticketData.total) {
            toast.error(`Uang tunai belum cukup! Total tagihan: ${formatIDR(ticketData.total)}`);
            return;
        }

        setIsProcessing(true);
        const loadingToast = toast.loading("Memproses pembayaran & menyimpan ke sistem...");

        try {
            const orderData = {
                items: ticketData.cart || [],
                subtotal: ticketData.subtotal || 0,
                tax: ticketData.tax || 0,
                total: ticketData.total || 0,
                paymentMethod,
                customerName: ticketData.customerName || "Guest",
                tableName: ticketData.tableName || "",
                notes: ticketData.notes || "",
                ticketNumber: ticketData.ticketNumber || `BUMI-${Date.now().toString().slice(-4)}`,
                cashReceived: paymentMethod === "Cash" ? cashAmount : ticketData.total,
                changeDue: paymentMethod === "Cash" ? changeDue : 0,
                timestamp: serverTimestamp(),
                staffId: auth.currentUser?.uid || "system",
                staffName: auth.currentUser?.displayName || "Staff"
            };

            // Save to POS Orders
            const orderRef = await addDoc(collection(db, "pos_orders"), orderData);

            // Sync to Revenue Transactions for PNL
            await addDoc(collection(db, "revenue_transactions"), {
                date: new Date().toISOString().split('T')[0],
                category: "Other Revenue", // E.g. POS Revenue
                description: `POS Order #${ticketData.ticketNumber || orderRef.id.slice(-6)} - ${ticketData.customerName || 'Guest'}`,
                amount: ticketData.total || 0,
                type: "Nexura Collect",
                timestamp: serverTimestamp()
            });

            toast.dismiss(loadingToast);
            toast.success("Transaksi berhasil! Struk digital telah dicatat.");
            setIsSuccess(true);
        } catch (err) {
            console.error("Payment confirmation failed:", err);
            toast.dismiss(loadingToast);
            toast.error("Gagal menyimpan transaksi ke sistem. Silakan coba lagi.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNewTransaction = () => {
        localStorage.removeItem("pos_active_ticket");
        router.push("/pos");
    };

    const paymentMethodsList = [
        { id: "Cash", label: "Tunai", icon: Wallet },
        { id: "QRIS", label: "QRIS", icon: QrCode },
        { id: "Transfer", label: "Transfer", icon: Building2 },
        { id: "Card", label: "Kartu EDC", icon: CreditCard },
        { id: "Room", label: "Room Charge", icon: UserCheck }
    ];

    if (isSuccess) {
        return (
            <div className="flex-1 w-full h-full overflow-y-auto p-6 md:py-12 animate-in fade-in duration-500 bg-[#f4f5f8] flex items-start justify-center checkout-scrollbar">
                <SuccessReceipt
                    customerName={ticketData.customerName}
                    ticketNumber={ticketData.ticketNumber}
                    method={paymentMethod}
                    cart={ticketData.cart || []}
                    subtotal={ticketData.subtotal}
                    tax={ticketData.tax}
                    total={ticketData.total}
                    cashReceived={cashAmount}
                    changeDue={changeDue}
                    onNewTransaction={handleNewTransaction}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 w-full h-full overflow-y-auto checkout-scrollbar">
            <div className="flex flex-col w-full min-w-0 min-h-0 max-w-[1300px] mx-auto px-6 md:px-12 lg:px-16 py-6 gap-6 font-sans text-[#1d1d1f]">
            {/* Top Navigation Bar (Plain & Minimalist without background container) */}
            <header className="w-full h-20 flex items-center justify-start flex-shrink-0 z-10">
                <button
                    onClick={() => router.push("/pos")}
                    className="flex items-center gap-2 text-[#7a7a7a] hover:text-[#1d1d1f] transition-all font-semibold checkout-body py-2.5 px-5 rounded-full hover:bg-white/80 border border-transparent hover:border-[#e0e0e0] shadow-none hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    <span>Kembali ke Kasir</span>
                </button>
            </header>

            {/* Main Checkout Workspace Islands (Dibagi 2 Sisi Simetris 50% / 50%) */}
            <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-12">

                {/* Sisi Kiri: Summary Angka, Tabs Metode Bayar & Kalkulator Tender (6 Kolom / 50%) */}
                <section className="lg:col-span-6 flex flex-col space-y-8 min-h-0 overflow-y-auto pr-1 checkout-scrollbar">

                    {/* Card 1: Three Summary Figures Bento Box (Payable Amount, Received, Remaining/Change) */}
                    <div className="checkout-store-card p-5 lg:p-6 flex-shrink-0 border border-[#e0e0e0] bg-white rounded-[8px] shadow-sm">
                        <div className="w-full grid grid-cols-3 gap-2 md:gap-4 text-left">
                            <div className="min-w-0 pr-1">
                                <span className="text-base sm:text-lg lg:text-xl font-extrabold text-emerald-600 block tracking-tight truncate">
                                    {formatIDR(ticketData.total)}
                                </span>
                                <span className="checkout-body text-xs lg:text-sm text-[#7a7a7a] font-medium block mt-1 truncate">
                                    Payable Amount
                                </span>
                            </div>
                            <div className="min-w-0 pr-1 border-l border-[#cccccc] pl-3 sm:pl-4">
                                <span className="text-base sm:text-lg lg:text-xl font-extrabold text-emerald-600 block tracking-tight truncate">
                                    {formatIDR(paymentMethod === "Cash" ? cashAmount : ticketData.total)}
                                </span>
                                <span className="checkout-body text-xs lg:text-sm text-[#7a7a7a] font-medium block mt-1 truncate">
                                    Received
                                </span>
                            </div>
                            <div className="min-w-0 pr-1 border-l border-[#cccccc] pl-3 sm:pl-4">
                                {paymentMethod === "Cash" && cashAmount < ticketData.total ? (
                                    <>
                                        <span className="text-base sm:text-lg lg:text-xl font-extrabold text-rose-600 block tracking-tight truncate">
                                            {formatIDR(ticketData.total - cashAmount)}
                                        </span>
                                        <span className="checkout-body text-xs lg:text-sm text-[#7a7a7a] font-medium block mt-1 truncate">
                                            Remaining
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-base sm:text-lg lg:text-xl font-extrabold text-emerald-600 block tracking-tight truncate">
                                            {formatIDR(paymentMethod === "Cash" ? changeDue : 0)}
                                        </span>
                                        <span className="checkout-body text-xs lg:text-sm text-[#7a7a7a] font-medium block mt-1 truncate">
                                            Change Due
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Payment Method Tabs Bento Box (Clean Minimalist Horizontal Tabs) */}
                    <div className="flex-shrink-0">
                        <div className="w-full flex flex-row items-center gap-2 overflow-x-auto checkout-no-scrollbar">
                            {paymentMethodsList.map((method) => {
                                const isSelected = paymentMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`min-w-[80px] h-10 rounded-[6px] font-semibold text-sm transition-all flex items-center justify-center px-4 cursor-pointer ${isSelected
                                            ? "bg-white text-[#1d1d1f] shadow-sm border border-[#d1d5db]"
                                            : "text-[#4b5563] hover:text-[#1d1d1f] border border-transparent"
                                            }`}
                                    >
                                        <span>{method.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Tender Calculator atau Instruksi Pembayaran Khusus */}
                    {paymentMethod === "Cash" ? (
                        <div className="flex-shrink-0">
                            <TenderCalculator
                                cashReceived={cashReceived}
                                setCashReceived={setCashReceived}
                                total={ticketData.total}
                                changeDue={changeDue}
                            />
                        </div>
                    ) : (
                        <div className="checkout-store-card text-center space-y-6 animate-in fade-in duration-300 flex-shrink-0 p-8 border border-[#e0e0e0] bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <div className="w-16 h-16 rounded-full bg-[#fafafc] border border-[#e0e0e0] flex items-center justify-center mx-auto text-[#0066cc]">
                                {paymentMethod === "QRIS" && <QrCode size={32} />}
                                {paymentMethod === "Transfer" && <Building2 size={32} />}
                                {paymentMethod === "Card" && <CreditCard size={32} />}
                                {paymentMethod === "Room" && <UserCheck size={32} />}
                            </div>
                            <div className="space-y-2">
                                <h3 className="checkout-display-md text-xl font-bold text-[#1d1d1f]">Instruksi Pembayaran {paymentMethod}</h3>
                                <p className="checkout-body text-[#7a7a7a] max-w-md mx-auto text-sm">
                                    {paymentMethod === "QRIS" && "Silakan minta tamu untuk melakukan scan QRIS pada layar customer display atau tentukan mesin EDC QRIS."}
                                    {paymentMethod === "Transfer" && "Pastikan dana telah masuk ke rekening operasional Bumi Anyom sebelum menyelesaikan transaksi."}
                                    {paymentMethod === "Card" && "Gesek atau masukkan kartu debit/kredit tamu ke mesin EDC BCA/Mandiri dan pastikan struk EDC keluar."}
                                    {paymentMethod === "Room" && "Masukkan nomor kamar dan pastikan nama tamu terdaftar dalam FO Hotel."}
                                </p>
                            </div>
                            <div className="p-4 bg-[#fafafc] rounded-[16px] border border-[#e0e0e0] max-w-sm mx-auto inline-block">
                                <span className="checkout-caption font-bold text-[#7a7a7a] block mb-1">Status Verifikasi</span>
                                <span className="checkout-body-strong text-emerald-600 flex items-center justify-center gap-1 font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-50 animate-pulse"></span>
                                    Menunggu Konfirmasi Kasir
                                </span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Sisi Kanan: Order Details Bento Box (6 Kolom / 50%) */}
                <section className="lg:col-span-6 flex flex-col min-h-0">
                    <div className="checkout-store-card p-5 lg:p-6 flex flex-col flex-1 overflow-hidden space-y-6 border border-[#e0e0e0] bg-white rounded-[8px] shadow-sm w-full">

                        {/* Header Order Details */}
                        <div className="border-b border-[#f0f0f0] pb-6 space-y-3 flex-shrink-0">
                            <h3 className="checkout-display-md text-2xl font-bold tracking-tight text-[#1d1d1f]">Order Details</h3>
                            <div className="flex justify-between items-center pt-1">
                                <span className="checkout-body-strong text-sm font-semibold text-[#1d1d1f]">
                                    {ticketData.customerName || "John Doe"}
                                </span>
                                <span className="checkout-body text-sm text-[#7a7a7a] font-medium">
                                    {ticketData.tableName ? `Table: ${ticketData.tableName}` : "john.doe@example.com"}
                                </span>
                            </div>
                        </div>

                        {/* Daftar Item Pesanan (Scrollable, Clean Bagisto/Apple rows) */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 checkout-scrollbar min-h-0 py-2">
                            {ticketData.cart.map((item: any, idx: number) => (
                                <div
                                    key={item.cartItemId}
                                    className="flex items-start justify-between border-b border-[#f0f0f0] pb-4 last:border-0 gap-4"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <span className="font-bold text-sm text-[#1d1d1f] mt-0.5 flex-shrink-0">
                                            {idx + 1}
                                        </span>
                                        <div className="space-y-1 min-w-0">
                                            <h5 className="font-semibold text-sm text-[#1d1d1f] leading-snug truncate">
                                                {item.name}
                                            </h5>
                                            <p className="text-xs text-[#a0a0b0]">
                                                SKU- BUMI-{item.cartItemId.padStart(3, '0')}
                                            </p>
                                            <p className="text-xs text-[#a0a0b0]">
                                                Qty- {item.quantity}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <span className="font-bold text-sm text-[#1d1d1f]">
                                            {formatIDR(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Rincian Harga / Footer (Clean Minimalist Bagisto/Apple totals) */}
                        <div className="pt-6 border-t border-[#f0f0f0] space-y-3 flex-shrink-0">
                            <div className="flex justify-between items-center checkout-caption text-[#7a7a7a]">
                                <span>Subtotal</span>
                                <span className="checkout-body-strong text-[#1d1d1f] font-semibold">{formatIDR(ticketData.subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center checkout-caption text-[#7a7a7a]">
                                <span>Tax (10%)</span>
                                <span className="checkout-body-strong text-[#1d1d1f] font-semibold">{formatIDR(ticketData.tax)}</span>
                            </div>
                            <div className="flex justify-between items-center checkout-caption text-[#7a7a7a]">
                                <span>Discount</span>
                                <span className="checkout-body-strong text-[#1d1d1f] font-semibold">Rp 0</span>
                            </div>
                            <div className="pt-4 border-t border-[#f0f0f0] flex justify-between items-center my-4">
                                <span className="checkout-display-md text-lg font-bold text-[#1d1d1f]">Grand Total</span>
                                <span className="checkout-display-md text-xl lg:text-2xl font-bold text-[#1d1d1f]">
                                    {formatIDR(ticketData.total)}
                                </span>
                            </div>

                            {/* Tombol Konfirmasi Pembayaran (di bagian bawah Order Details seperti di gambar) */}
                            <div className="pt-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={handleConfirmPayment}
                                    disabled={isProcessing || (paymentMethod === "Cash" && cashAmount < ticketData.total)}
                                    className={`w-full h-14 rounded-[14px] font-semibold checkout-body text-base transition-all flex items-center justify-center gap-3 ${isProcessing || (paymentMethod === "Cash" && cashAmount < ticketData.total)
                                        ? "bg-[#e0e0e0] text-[#a0a0b0] cursor-not-allowed shadow-none"
                                        : "bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)] transform active:scale-98 cursor-pointer"
                                        }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            <span>Memproses Transaksi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            <span>Confirm Payment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </section>

            </main>
        </div>
        </div>
    );
}

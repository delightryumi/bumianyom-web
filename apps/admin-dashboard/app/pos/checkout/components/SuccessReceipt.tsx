"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Printer, RefreshCw, ArrowRight } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { formatIDR } from "@/lib/pnl-utils";

interface SuccessReceiptProps {
    customerName: string;
    ticketNumber?: string;
    method: string;
    cart?: any[];
    subtotal?: number;
    tax?: number;
    total: number;
    cashReceived?: number;
    changeDue?: number;
    onNewTransaction: () => void;
}

export const SuccessReceipt: React.FC<SuccessReceiptProps> = ({
    customerName,
    ticketNumber,
    method,
    cart = [],
    subtotal = 0,
    tax = 0,
    total,
    cashReceived = 0,
    changeDue = 0,
    onNewTransaction
}) => {
    const [branding, setBranding] = useState({ logo: "", address: "", phone: "" });
    const [cashier, setCashier] = useState("Kasir");

    useEffect(() => {
        // Get Cashier Info
        if (auth.currentUser) {
            setCashier(auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "Kasir Utama");
        }

        // Fetch Hotel Branding Data
        const fetchBranding = async () => {
            try {
                const logoDoc = await getDoc(doc(db, "settings", "landingPage"));
                const footerDoc = await getDoc(doc(db, "settings", "footer"));
                
                let logoUrl = "";
                if (logoDoc.exists()) {
                    logoUrl = logoDoc.data().darkLogo || "";
                }
                
                let address = "Jl. Bumi Anyom No. 1, Temanggung";
                let phone = "";
                if (footerDoc.exists()) {
                    const fd = footerDoc.data();
                    if (fd.address) address = fd.address;
                    if (fd.phones && fd.phones.length > 0) phone = fd.phones[0];
                }
                
                setBranding({ logo: logoUrl, address, phone });
            } catch (error) {
                console.error("Error fetching branding:", error);
            }
        };
        fetchBranding();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="checkout-store-card p-6 lg:p-8 max-w-md w-full mx-auto text-center space-y-6 overflow-hidden animate-in zoom-in-95 duration-400 thermal-receipt-container">
            {/* Header Sukses (Tidak di-print) */}
            <div className="space-y-3 pt-4 thermal-no-print">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border-8 border-emerald-500/10 shadow-sm animate-bounce">
                    <CheckCircle2 size={40} strokeWidth={2.5} />
                </div>
                <h2 className="checkout-display-md text-2xl font-bold tracking-tight text-[#1d1d1f]">Transaction Successful!</h2>
                <p className="checkout-caption text-[#7a7a7a]">Digital folio has been recorded in the system.</p>
            </div>

            {/* Kotak Rincian Struk (Bagian yang di-print) */}
            <div className="bg-[#fafafc] rounded-[6px] p-4 border border-[#e0e0e0] text-left space-y-4 shadow-sm thermal-print-section">
                {/* Header Struk (Hotel Info) */}
                <div className="flex flex-col items-center justify-center text-center border-b border-[#f0f0f0] pb-4 mb-2 space-y-1.5">
                    {branding.logo ? (
                        <img src={branding.logo} alt="Hotel Logo" className="h-12 object-contain grayscale mb-1" />
                    ) : (
                        <h3 className="font-bold text-xl tracking-wider text-[#1d1d1f] mb-1">BUMI ANYOM</h3>
                    )}
                    <p className="text-xs text-[#7a7a7a] font-medium leading-relaxed text-center w-full max-w-[250px]">
                        {branding.address}
                    </p>
                    {branding.phone && (
                        <p className="text-xs text-[#7a7a7a] font-medium text-center">Telp: {branding.phone}</p>
                    )}
                    <div className="w-full text-[10px] text-[#7a7a7a] mt-3 border-t border-dashed border-[#cccccc] pt-2 flex flex-col items-center justify-center">
                        <p className="text-center">Cashier: <span className="font-semibold text-[#1d1d1f]">{cashier}</span></p>
                        <p className="text-center">Date/Time: {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                </div>

                {/* Detail Pelanggan & No Order */}
                <div className="flex justify-between items-center pb-2">
                    <span className="checkout-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold">Guest Name</span>
                    <span className="checkout-body-strong text-[#1d1d1f] font-bold text-sm">{customerName || "Walk-in Guest"}</span>
                </div>
                {ticketNumber && (
                    <div className="flex justify-between items-center border-b border-[#f0f0f0] pb-3">
                        <span className="checkout-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold">Folio / Receipt No.</span>
                        <span className="checkout-body-strong text-[#1d1d1f] font-bold text-sm">{ticketNumber}</span>
                    </div>
                )}

                {/* Rincian Pesanan (Item Breakdown) */}
                {cart && cart.length > 0 && (
                    <div className="border-b border-[#f0f0f0] pb-3 space-y-2">
                        <span className="checkout-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold block mb-2">Itemized Charges</span>
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between items-start text-sm">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-[#1d1d1f]">{item.name}</span>
                                    <span className="text-xs text-[#7a7a7a]">{item.quantity}x @ {formatIDR(item.price)}</span>
                                </div>
                                <span className="font-semibold text-[#1d1d1f]">{formatIDR(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Ringkasan Biaya (Financial Summary) */}
                <div className="space-y-2 border-b border-[#f0f0f0] pb-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#7a7a7a] font-medium">Subtotal</span>
                        <span className="font-semibold text-[#1d1d1f]">{formatIDR(subtotal)}</span>
                    </div>
                    {tax > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[#7a7a7a] font-medium">Tax & Service (PB1)</span>
                            <span className="font-semibold text-[#1d1d1f]">{formatIDR(tax)}</span>
                        </div>
                    )}
                </div>

                {/* Grand Total & Pembayaran */}
                <div className="flex justify-between items-center pb-2 pt-1">
                    <span className="checkout-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold">Grand Total</span>
                    <span className="checkout-body-strong text-[#1d1d1f] font-bold text-lg">{formatIDR(total)}</span>
                </div>

                <div className="flex justify-between items-center border-b border-[#f0f0f0] pb-3">
                    <span className="checkout-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold">Payment Method</span>
                    <span className="checkout-body-strong text-[#0066cc] font-bold text-sm uppercase">{method}</span>
                </div>

                {method === "Cash" && (
                    <>
                        <div className="flex justify-between items-center border-b border-[#f0f0f0] pb-3">
                            <span className="checkout-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold">Cash Tendered</span>
                            <span className="checkout-body text-[#1d1d1f]">{formatIDR(cashReceived)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-b border-[#f0f0f0] pb-3">
                            <span className="checkout-fine-print text-[#7a7a7a] uppercase tracking-wider font-bold">Change Due</span>
                            <span className="checkout-body-strong text-emerald-600 font-bold">{formatIDR(changeDue)}</span>
                        </div>
                    </>
                )}

                {/* Footer Struk */}
                <div className="pt-4 text-center space-y-1">
                    <p className="text-xs text-[#1d1d1f] font-semibold">Thank you for visiting!</p>
                    <p className="text-[10px] text-[#7a7a7a]">We look forward to welcoming you back.</p>
                    <p className="text-[10px] text-[#7a7a7a] mt-2 pt-2 border-t border-dashed border-[#cccccc]">www.bumianyom.com</p>
                </div>
            </div>

            {/* Aksi Struk */}
            <div className="space-y-3 pt-2 pb-2 thermal-no-print">
                <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full h-14 rounded-[8px] bg-[#fafafc] hover:bg-white text-[#1d1d1f] font-semibold checkout-body text-base border border-[#e0e0e0] shadow-sm transition-all hover:border-[#cccccc] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                    <Printer size={18} />
                    <span>Print Receipt</span>
                </button>

                <button
                    type="button"
                    onClick={onNewTransaction}
                    className="w-full h-14 rounded-[8px] bg-[#0066cc] hover:bg-[#0071e3] text-white font-semibold checkout-body text-base shadow-[0_4px_16px_rgba(0,102,204,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                    <RefreshCw size={18} />
                    <span>New Transaction</span>
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

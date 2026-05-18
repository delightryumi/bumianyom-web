import React from "react";
import "./styles/checkout.css";

export const metadata = {
    title: "Penyelesaian Pembayaran | Nexura POS",
    description: "Halaman penyelesaian pembayaran POS dengan desain Apple Clean Mode yang modular dan elegan."
};

export default function POSCheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 flex flex-col w-full h-full min-w-0 min-h-0 bg-[#f4f5f8] selection:bg-[#0066cc]/20">
            {children}
        </div>
    );
}

import { PNLSection } from "@/components/sections/pnl/PNLSection";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "PNL Statement | Bumi Anyom Admin",
    description: "Financial profit and loss analysis for Bumi Anyom Resort",
};

export default function PNLPage() {
    return <PNLSection />;
}

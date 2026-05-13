"use client";

import { OverviewSection } from "@/components/sections/overview/OverviewSection";
import { useRouter } from "next/navigation";
import { SectionType } from "@/components/layout/Sidebar";

export default function OverviewPage() {
    const router = useRouter();
    return <OverviewSection onNavigate={(s: string) => router.push(`/${s}`)} />;
}

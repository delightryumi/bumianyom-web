"use client";

"use client";

import { useAuth } from "@/context/AuthContext";
import { LoginSection } from "@/components/sections/login/LoginSection";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-broken-white">
        <div className="text-sage font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginSection />;
  }

  return <DashboardLayout />;
}

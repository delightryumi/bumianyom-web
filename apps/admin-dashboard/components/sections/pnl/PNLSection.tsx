import React from "react";
import { PieChart } from "lucide-react";

export const PNLSection = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8 bg-[#fafafa]">
            <div className="w-24 h-24 bg-sage/10 rounded-full flex items-center justify-center text-sage mb-6 animate-pulse">
                <PieChart size={48} />
            </div>
            <h1 className="text-4xl font-black text-black tracking-tighter mb-4">PNL Statement</h1>
            <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
                We are building a comprehensive Profit and Loss analysis system for Bumi Anyom Resort.
                Stay tuned for automated financial reporting and real-time performance insights.
            </p>
            <div className="mt-8 px-6 py-2 bg-sage text-white text-xs font-bold uppercase tracking-widest rounded-full">
                Coming Soon
            </div>
        </div>
    );
};

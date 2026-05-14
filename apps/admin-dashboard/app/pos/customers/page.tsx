import { LayoutGrid } from "lucide-react";

export default function POSPlaceholderPage() {
    return (
        <div className="h-full flex items-center justify-center p-8 bg-[#F8F9FA]">
            <div className="max-w-md w-full bg-white rounded-[32px] p-12 border border-stone-100 shadow-sm text-center space-y-6">
                <div className="w-20 h-20 rounded-[32px] bg-stone-50 flex items-center justify-center text-stone-200 mx-auto border border-stone-100/50">
                    <LayoutGrid size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Module Initialization</h2>
                    <p className="text-stone-400 text-sm">This administrative module is currently being optimized for the Nexura Terminal ecosystem.</p>
                </div>
                <div className="pt-4">
                    <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                        <div className="h-full bg-sage w-1/3 rounded-full" style={{ backgroundColor: "#788069" }}></div>
                    </div>
                    <p className="text-[9px] font-bold text-stone-300 uppercase tracking-[0.2em] mt-3">Advanced Development in Progress</p>
                </div>
            </div>
        </div>
    );
}

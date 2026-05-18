"use client";

// Format Uang Kecil, Rapi & Anti-Potong
export const MoneyDisplay = ({ amount, className = "", large = false }: { amount: number, className?: string, large?: boolean }) => (
    <div className={`font-mono font-bold tracking-tighter flex items-baseline gap-0.5 whitespace-nowrap ${className}`}>
        <span className={`${large ? 'text-[10px] lg:text-xs opacity-60' : 'text-[8px] opacity-50'} font-sans font-medium`}>Rp</span>
        <span>{amount.toLocaleString('id-ID')}</span>
    </div>
);
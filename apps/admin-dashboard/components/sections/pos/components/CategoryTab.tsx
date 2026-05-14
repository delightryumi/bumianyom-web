"use client";

import React from "react";
import { motion } from "motion/react";
import { POSCategory } from "../types";

interface CategoryTabProps {
    category: POSCategory;
    active: boolean;
    onClick: () => void;
}

export const CategoryTab: React.FC<CategoryTabProps> = ({ 
    category, active, onClick 
}) => (
    <button 
        onClick={onClick}
        className={`relative flex items-center justify-center h-10 px-8 transition-all min-w-[130px] group z-10`}
    >
        <span className={`text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-400 ${
            active ? 'text-[#788069]' : 'text-stone-400 group-hover:text-stone-600'
        }`}>
            {category}
        </span>
        
        {active && (
            <motion.div 
                layoutId="active-pill"
                className="absolute inset-0 bg-[#788069]/10 rounded-lg -z-10 border border-[#788069]/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
    </button>
);

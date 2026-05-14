"use client";

import React from "react";
import { motion } from "motion/react";
import { Plus, Package, ShoppingBag } from "lucide-react";
import { POSProduct } from "../types";
import { formatIDR } from "@/lib/pnl-utils";

interface ProductCardProps {
    product: POSProduct;
    onAdd: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => (
    <motion.div 
        whileHover={{ y: -12 }}
        whileTap={{ scale: 0.96 }}
        onClick={onAdd}
        className="group bg-white border border-stone-100 rounded-xl p-5 flex flex-col items-center transition-all cursor-pointer overflow-hidden relative h-full powerful-card shadow-sm hover:shadow-2xl"
    >
        {/* Product Image - Square & Premium Depth */}
        <div className="w-full aspect-square rounded-lg bg-[#F8F9FA] flex items-center justify-center overflow-hidden mb-6 border border-stone-50 group-hover:bg-white transition-colors duration-500 relative">
            {product.image ? (
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-200">
                    <Package size={40} strokeWidth={1} />
                </div>
            )}
            
            {/* Hover Badge */}
            <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-500 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-stone-900 scale-0 group-hover:scale-100 transition-transform duration-500">
                    <ShoppingBag size={18} />
                </div>
            </div>
        </div>

        {/* Content Section - High-Density Spacing */}
        <div className="flex flex-col items-center text-center px-2 flex-1 w-full space-y-2">
            <span className="text-[9px] font-medium text-stone-400 uppercase tracking-[0.2em]">{product.category}</span>
            <h4 className="text-[14px] font-medium text-stone-900 leading-snug line-clamp-2 min-h-[2.5rem] uppercase tracking-tight group-hover:text-sage-primary transition-colors">
                {product.name}
            </h4>
            <div className="pt-2">
                <p className="text-[15px] font-medium text-sage-primary">
                    {formatIDR(product.price)}
                </p>
            </div>
        </div>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-stone-50 to-transparent -z-10 group-hover:from-sage/10 transition-colors" />
    </motion.div>
);

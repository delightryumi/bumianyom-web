"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Package } from "lucide-react";
import { POSProduct } from "../types";
import { formatIDR } from "@/lib/pnl-utils";

interface ProductCardProps {
    product: POSProduct;
    onAdd: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => (
    <motion.div 
        whileTap={{ scale: 0.98 }}
        className="apple-store-card group cursor-pointer"
        onClick={onAdd}
    >
        {/* Apple Product Render (1:1 crop with 8px inner radius & whisper-soft product shadow) */}
        <div className="w-full aspect-square bg-[#fafafc] rounded-[8px] mb-4 relative overflow-hidden flex items-center justify-center p-3 apple-product-shadow transition-transform duration-500 group-hover:scale-[1.03]">
            {product.image ? (
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-[8px]" 
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-[#cccccc]">
                    <Package size={32} strokeWidth={1} />
                </div>
            )}
            
            {/* Subtle category chip floating over photography */}
            <div className="absolute top-2.5 left-2.5 bg-white/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-black/5 text-[10px] font-medium text-[#1d1d1f]">
                {product.category}
            </div>
        </div>

        {/* Apple Confident but Quiet Typography */}
        <div className="flex flex-col flex-1 justify-between">
            <div className="mb-4 space-y-0.5">
                <h4 className="text-[15px] font-semibold text-[#1d1d1f] line-clamp-2 leading-snug tracking-tight">
                    {product.name}
                </h4>
                <p className="text-sm text-[#7a7a7a]">
                    {formatIDR(product.price)}
                </p>
            </div>

            {/* Tiny Blue Pill CTA ({rounded.pill}) */}
            <div className="pt-2 mt-auto flex items-center justify-between gap-2">
                <span className="text-xs text-[#0066cc] font-medium group-hover:underline">Learn more</span>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd();
                    }}
                    className="apple-button-primary px-4 py-1.5 text-xs"
                >
                    <Plus size={14} strokeWidth={2} />
                    <span>Add</span>
                </button>
            </div>
        </div>
    </motion.div>
);

"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "./ProductCard";
import { CategoryTab } from "./CategoryTab";
import { POSProduct, POSCategory } from "../types";

interface ProductGridProps {
    products: POSProduct[];
    loading: boolean;
    activeCategory: POSCategory;
    setActiveCategory: (category: POSCategory) => void;
    addToCart: (product: POSProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
    products, loading, activeCategory,
    setActiveCategory, addToCart
}) => (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FBFBFA] px-4 lg:px-32">
        {/* Compact & Refined Category Navigation Bar - Absolute Spatial Offset */}
        <div className="mt-8 lg:mt-16 mb-6 lg:mb-10 flex justify-center w-full">
            <header className="inline-flex items-center bg-white border border-stone-100 rounded-xl p-1 shadow-sm h-12 overflow-hidden max-w-full">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-1">
                    <CategoryTab category="All" active={activeCategory === "All"} onClick={() => setActiveCategory("All")} />
                    <CategoryTab category="Food" active={activeCategory === "Food"} onClick={() => setActiveCategory("Food")} />
                    <CategoryTab category="Beverage" active={activeCategory === "Beverage"} onClick={() => setActiveCategory("Beverage")} />
                    <CategoryTab category="Meeting Room" active={activeCategory === "Meeting Room"} onClick={() => setActiveCategory("Meeting Room")} />
                </div>
                
                <div className="hidden sm:flex items-center gap-4 text-stone-200 text-[10px] font-medium uppercase tracking-[0.2em] px-8 border-l border-stone-50 h-6">
                    <span>{products.length} Items</span>
                </div>
            </header>
        </div>

        {/* Product Grid with High-Fidelity Spacing */}
        <div className="flex-1 overflow-y-auto pt-4 lg:pt-6 pb-20 custom-scrollbar pos-scrollbar">
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="aspect-[3/4] bg-white border border-stone-100 rounded-xl shimmer-pos" />
                    ))}
                </div>
            ) : (
                <motion.div 
                    layout
                    className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {products.map(p => (
                            <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    </div>
);

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
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
}) => {
    const categories: POSCategory[] = ["All", "Food", "Beverage", "Meeting Room"];

    return (
        <div className="flex-1 bg-transparent min-w-0 min-h-0 flex flex-col overflow-hidden">
            {/* Apple Frosted Sub-Nav Strip */}
            <div className="apple-sub-nav gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pos-no-scrollbar py-1 w-full md:w-auto flex-shrink-0 md:flex-shrink">
                    <span className="apple-tagline mr-6 hidden sm:inline">Store</span>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`apple-category-chip flex-shrink-0 ${activeCategory === cat ? "active" : ""}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-[#7a7a7a] apple-caption font-medium flex-shrink-0">
                    <span>{products?.length || 0} active models</span>
                </div>
            </div>

            {/* Museum Gallery Low-Density Grid Space */}
            <div className="py-6 px-4 md:px-12 lg:px-16 xl:px-24 flex-1 overflow-y-auto pos-no-scrollbar min-w-0">
                <div className="mb-8 space-y-2 max-w-2xl">
                    <h2 className="apple-display-lg"></h2>
                    <p className="apple-lead text-[#7a7a7a]">    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-square rounded-[18px] animate-pulse bg-[#f5f5f7] border border-[#e0e0e0]" />
                        ))}
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {(products || []).map((p) => (
                                <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

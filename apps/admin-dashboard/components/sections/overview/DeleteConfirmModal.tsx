"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    itemName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({ isOpen, itemName, onConfirm, onCancel }: DeleteConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[500] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl border border-stone-100"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
                            <Trash2 size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 font-outfit uppercase tracking-tight mb-2">Archive Entry</h3>
                        <p className="text-[11px] text-stone-500 uppercase tracking-widest leading-relaxed mb-8">
                            Are you sure you want to delete the transaction for <span className="font-bold text-stone-900">{itemName}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={onCancel}
                                className="flex-1 h-12 rounded-xl border border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-widest hover:bg-stone-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={onConfirm}
                                className="flex-1 h-12 rounded-xl bg-red-500 text-[11px] font-bold text-white uppercase tracking-widest hover:bg-red-600 transition-colors"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

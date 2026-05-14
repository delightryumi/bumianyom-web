"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Receipt } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatIDR } from "@/lib/pnl-utils";
import { ExpenseSection } from "./components/ExpenseSection";

// Modular Imports
import { usePnL } from "./usePnL";
import { PNLHeader } from "./components/PNLHeader";
import { PNLSummaryCards } from "./components/PNLSummaryCards";
import { PNLCharts } from "./components/PNLCharts";
import { PNLFooter } from "./components/PNLFooter";
import "./PNLStyles.css";

/* ── Brand Colors ── */
const SAGE = "#788069";

/* ── Animations ── */
const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const rise = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function PNLSection() {
    const {
        viewMode, setViewMode,
        displayMode, setDisplayMode,
        month, setMonth,
        loading, pnlResult,
        expenses, vatPercentage, mgmtFeePercentage,
        yearTrendData, multiYearTrendData,
        showDatePicker, setShowDatePicker,
        fetchData, updateVat, updateMgmtFee
    } = usePnL();

    const [y, mStr] = month.split('-');

    /* ── Export Handlers ── */
    const handleExportExcel = () => {
        if (!pnlResult) return;
        const summaryData = [
            { Category: "Total Gross Revenue", Amount: pnlResult.card1_TotalRevenue },
            { Category: "Revenue Hotel Collect", Amount: pnlResult.card3_RevHotelCollect },
            { Category: "Revenue Nexura Collect", Amount: pnlResult.card3_RevNexuraCollect },
            { Category: "Other Income Total", Amount: pnlResult.card5_OtherRevenue },
            { Category: "VAT Input", Amount: pnlResult.card11_VAT },
            { Category: "Management Fee", Amount: pnlResult.card9_FeeGross },
            { Category: "Total Operational Expenses", Amount: pnlResult.card8_TotalExpenses },
            { Category: "TOTAL GOP", Amount: pnlResult.card7_TotalGOP },
        ];
        const expensesData = expenses.map(e => ({
            Name: e.name,
            Amount: e.amount,
            Allocation: e.allocation || "SHARED"
        }));
        const investorData = pnlResult.investorDistributions.map(i => ({
            Investor: i.name,
            Share: `${i.share}%`,
            Payout: i.amount
        }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Financial Summary");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expensesData), "Detailed Expenses");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(investorData), "Investor Shares");
        XLSX.writeFile(wb, `Nexura_PnL_Audit_${viewMode}_${month}.xlsx`);
    };

    const handleExportPDF = () => {
        if (!pnlResult) return;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Nexura Financial Report - Global PnL", 14, 20);
        doc.setFontSize(10);
        doc.text(`Periode: ${viewMode === 'monthly' ? month : y} | Exported: ${new Date().toLocaleString()}`, 14, 28);

        autoTable(doc, {
            startY: 35,
            head: [['Financial Metric', 'Value']],
            body: [
                ['Total Gross Revenue', formatIDR(pnlResult.card1_TotalRevenue)],
                ['Other Revenue (Merged)', formatIDR(pnlResult.card5_OtherRevenue)],
                ['Total Expenses', formatIDR(pnlResult.card8_TotalExpenses)],
                ['VAT Input', formatIDR(pnlResult.card11_VAT)],
                ['Management Fee', formatIDR(pnlResult.card9_FeeGross)],
                ['NET GOP / PROFIT', formatIDR(pnlResult.card7_TotalGOP)],
            ],
            theme: 'striped',
            headStyles: { fillColor: [120, 128, 105] }
        });

        doc.text("Detailed Operational Expenses", 14, (doc as any).lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Expense Name', 'Allocation', 'Amount']],
            body: expenses.map(e => [e.name, e.allocation || "SHARED", formatIDR(e.amount)]),
            theme: 'grid',
            headStyles: { fillColor: [60, 60, 60] }
        });
        doc.save(`Nexura_PnL_Report_${month}.pdf`);
    };

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-8 flex flex-col gap-12 font-instrument"
        >
            <PNLHeader 
                viewMode={viewMode} setViewMode={setViewMode}
                displayMode={displayMode} setDisplayMode={setDisplayMode}
                month={month} setMonth={setMonth}
                showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                rise={rise}
            />

            <AnimatePresence mode="wait">
                {displayMode === "cards" ? (
                    <PNLSummaryCards 
                        pnlResult={pnlResult}
                        loading={loading}
                        vatPercentage={vatPercentage}
                        mgmtFeePercentage={mgmtFeePercentage}
                        onVatChange={updateVat}
                        onFeeChange={updateMgmtFee}
                        rise={rise}
                        formatIDR={formatIDR}
                    />
                ) : (
                    <PNLCharts 
                        viewMode={viewMode}
                        pnlResult={pnlResult}
                        yearTrendData={yearTrendData}
                        multiYearTrendData={multiYearTrendData}
                        monthStr={mStr}
                        yearStr={y}
                        formatIDR={formatIDR}
                    />
                )}
            </AnimatePresence>

            {/* ─── SECTION 2: MODULAR EXPENSE INPUT (Monthly Only) ─── */}
            {viewMode === "monthly" ? (
                <ExpenseSection 
                    month={month} 
                    expenses={expenses} 
                    onRefresh={fetchData} 
                />
            ) : (
                <div className="bg-white border border-stone-100 rounded-2xl p-10 text-center shadow-xl shadow-stone-200/20">
                    <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-stone-300">
                        <Receipt size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-2 uppercase tracking-tight">Annual Expense Audit</h3>
                    <p className="text-stone-400 text-[13px] max-w-md mx-auto leading-relaxed">
                        The yearly PnL view provides a consolidated report of all operational costs. To edit or add specific expenses, please switch back to 
                        <button onClick={() => setViewMode("monthly")} className="mx-1 text-sage font-bold hover:underline">Monthly View</button>.
                    </p>
                </div>
            )}

            <PNLFooter rise={rise} />
        </motion.div>
    );
}

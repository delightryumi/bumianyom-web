import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { processPnLData, ExtendedTransaction, HotelMaster } from "@/lib/pnl-logic";
import { GlobalPnLResult, PnlIncomeItem, PnlExpenseItem, InvestorItem } from "@/lib/pnl-utils";
import { TrendDataItem, MultiYearTrendDataItem } from "./types";

export const YEARS = [2024, 2025, 2026];
export const MONTHS = [
    { n: "Januari", v: "01" }, { n: "Februari", v: "02" }, { n: "Maret", v: "03" },
    { n: "April", v: "04" }, { n: "Mei", v: "05" }, { n: "Juni", v: "06" },
    { n: "Juli", v: "07" }, { n: "Agustus", v: "08" }, { n: "September", v: "09" },
    { n: "Oktober", v: "10" }, { n: "November", v: "11" }, { n: "Desember", v: "12" }
];

export const usePnL = () => {
    const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
    const [displayMode, setDisplayMode] = useState<"cards" | "charts">("cards");
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(false);
    const [pnlResult, setPnlResult] = useState<GlobalPnLResult | null>(null);
    const [rawTransactions, setRawTransactions] = useState<ExtendedTransaction[]>([]);
    const [allHotels, setAllHotels] = useState<HotelMaster[]>([]);
    const [customIncomes, setCustomIncomes] = useState<PnlIncomeItem[]>([]);
    const [nonCommissionRevenue, setNonCommissionRevenue] = useState<PnlIncomeItem[]>([]);
    const [expenses, setExpenses] = useState<PnlExpenseItem[]>([]);
    const [investors, setInvestors] = useState<InvestorItem[]>([]);
    const [vatPercentage, setVatPercentage] = useState(11);
    const [mgmtFeePercentage, setMgmtFeePercentage] = useState(10);
    const [hotelGopPercentages, setHotelGopPercentages] = useState<Record<string, number>>({});
    const [yearTrendData, setYearTrendData] = useState<TrendDataItem[]>([]);
    const [multiYearTrendData, setMultiYearTrendData] = useState<MultiYearTrendDataItem[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const propertiesSnap = await getDocs(collection(db, "properties"));
            const hotelList: HotelMaster[] = [];
            propertiesSnap.forEach((doc) => {
                const d = doc.data();
                hotelList.push({ id: doc.id, name: d.Nama || d.name || `Property ${doc.id}` });
            });
            setAllHotels(hotelList);

            const [y, m] = month.split('-');
            let startStr, endStr;
            
            if (viewMode === "monthly") {
                startStr = `${y}-${m}-01`;
                const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
                endStr = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
            } else {
                startStr = `${y}-01-01`;
                endStr = `${y}-12-31`;
            }

            const q = query(collection(db, "daily_revenue"), where("date", ">=", startStr), where("date", "<=", endStr));
            const querySnapshot = await getDocs(q);
            const transactions: ExtendedTransaction[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const hotelId = data.hotelId || "bumi-anyom-resort";
                (data.entries || []).forEach((t: any) => {
                    transactions.push({ 
                        ...t, 
                        propertyId: hotelId, 
                        amount: Number(t.amount) || 0, 
                        paidCash: Number(t.paidCash || t.paidAmount1) || 0, 
                        paidTransfer: Number(t.paidTransfer || t.paidAmount2) || 0 
                    });
                });
            });
            setRawTransactions(transactions);

            if (viewMode === "monthly") {
                const docRef = doc(db, "global_pnl_reports", month);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCustomIncomes(data.customIncomes || []);
                    setNonCommissionRevenue(data.nonCommissionRevenue || []);
                    setExpenses(data.expenses || []);
                    setInvestors(data.investors || []);
                    setVatPercentage(data.vatPercentage ?? 11);
                    setMgmtFeePercentage(data.mgmtFeePercentage ?? 10);
                    setHotelGopPercentages(data.hotelGopPercentages || {});
                } else {
                    setCustomIncomes([]); setNonCommissionRevenue([]); setExpenses([]); setInvestors([]); setVatPercentage(11); setMgmtFeePercentage(10); setHotelGopPercentages({});
                }
            } else {
                const yearlyCustomIncomes: PnlIncomeItem[] = [];
                const yearlyNonComm: PnlIncomeItem[] = [];
                const yearlyExpenses: PnlExpenseItem[] = [];
                const yearlyInvestors: InvestorItem[] = [];
                let latestVat = 11;
                let latestMgmt = 10;

                const pnlQ = query(collection(db, "global_pnl_reports"), 
                            where("__name__", ">=", `${y}-01`), 
                            where("__name__", "<=", `${y}-12`));
                const pnlSnap = await getDocs(pnlQ);
                
                pnlSnap.forEach(d => {
                    const data = d.data();
                    yearlyCustomIncomes.push(...(data.customIncomes || []));
                    yearlyNonComm.push(...(data.nonCommissionRevenue || []));
                    yearlyExpenses.push(...(data.expenses || []));
                    if (yearlyInvestors.length === 0) yearlyInvestors.push(...(data.investors || []));
                    if (d.id === month) {
                        latestVat = data.vatPercentage ?? 11;
                        latestMgmt = data.mgmtFeePercentage ?? 10;
                    }
                });

                setCustomIncomes(yearlyCustomIncomes);
                setNonCommissionRevenue(yearlyNonComm);
                setExpenses(yearlyExpenses);
                setInvestors(yearlyInvestors);
                setVatPercentage(latestVat);
                setMgmtFeePercentage(latestMgmt);
            }

            const currentYear = month.split('-')[0];
            const monthlyBuckets = Array(12).fill(0);
            const yearlyBuckets: Record<number, number> = {};
            YEARS.forEach(yr => yearlyBuckets[yr] = 0);

            const allRevenueQ = query(collection(db, "daily_revenue"));
            const allRevenueSnap = await getDocs(allRevenueQ);
            
            allRevenueSnap.forEach(doc => {
                const data = doc.data();
                const d = data.date || "";
                const [yrStr, moStr] = d.split('-');
                const yr = parseInt(yrStr);
                const moIdx = parseInt(moStr) - 1;

                if (yearlyBuckets[yr] !== undefined) {
                    (data.entries || []).forEach((t: any) => {
                        const amt = (Number(t.amount) || 0);
                        yearlyBuckets[yr] += amt;
                        if (yrStr === currentYear && moIdx >= 0 && moIdx < 12) {
                            monthlyBuckets[moIdx] += amt;
                        }
                    });
                }
            });
            
            setYearTrendData(monthlyBuckets.map((rev, i) => ({
                month: MONTHS[i].n.slice(0, 3),
                revenue: rev,
                fullMonth: MONTHS[i].v
            })));
            setMultiYearTrendData(YEARS.map(yr => ({
                year: yr.toString(),
                revenue: yearlyBuckets[yr]
            })));

        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, [month, viewMode]);

    useEffect(() => {
        const result = processPnLData(rawTransactions, customIncomes, nonCommissionRevenue, expenses, investors, vatPercentage, hotelGopPercentages, allHotels, mgmtFeePercentage);
        setPnlResult(result.pnlResult);
    }, [rawTransactions, customIncomes, nonCommissionRevenue, expenses, investors, vatPercentage, hotelGopPercentages, allHotels, mgmtFeePercentage]);

    const updateVat = async (val: number) => {
        setVatPercentage(val);
        try {
            const docRef = doc(db, "global_pnl_reports", month);
            await updateDoc(docRef, { vatPercentage: val });
        } catch (error) { console.error("Failed to save VAT:", error); }
    };

    const updateMgmtFee = async (val: number) => {
        setMgmtFeePercentage(val);
        try {
            const docRef = doc(db, "global_pnl_reports", month);
            await updateDoc(docRef, { mgmtFeePercentage: val });
        } catch (error) { console.error("Failed to save Fee:", error); }
    };

    return {
        viewMode, setViewMode,
        displayMode, setDisplayMode,
        month, setMonth,
        loading, pnlResult,
        expenses, vatPercentage, mgmtFeePercentage,
        yearTrendData, multiYearTrendData,
        showDatePicker, setShowDatePicker,
        fetchData, updateVat, updateMgmtFee
    };
};

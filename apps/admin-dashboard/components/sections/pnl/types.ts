import { GlobalPnLResult, PnlIncomeItem, PnlExpenseItem, InvestorItem } from "@/lib/pnl-utils";
import { ExtendedTransaction, HotelMaster } from "@/lib/pnl-logic";

export interface PnLState {
    viewMode: "monthly" | "yearly";
    displayMode: "cards" | "charts";
    month: string;
    loading: boolean;
    pnlResult: GlobalPnLResult | null;
    rawTransactions: ExtendedTransaction[];
    allHotels: HotelMaster[];
    customIncomes: PnlIncomeItem[];
    nonCommissionRevenue: PnlIncomeItem[];
    expenses: PnlExpenseItem[];
    investors: InvestorItem[];
    vatPercentage: number;
    mgmtFeePercentage: number;
    hotelGopPercentages: Record<string, number>;
    yearTrendData: TrendDataItem[];
    multiYearTrendData: MultiYearTrendDataItem[];
    showDatePicker: boolean;
}

export interface TrendDataItem {
    month: string;
    revenue: number;
    fullMonth: string;
}

export interface MultiYearTrendDataItem {
    year: string;
    revenue: number;
}

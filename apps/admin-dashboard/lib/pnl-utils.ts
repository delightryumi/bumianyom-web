"use client";

export interface PnlIncomeItem {
  id?: string;
  name: string;
  amount: number;
  category?: string;
  paymentStatus?: string;
}

export interface PnlExpenseItem {
  id?: string;
  name: string;
  amount: number;
  allocation?: "SHARED" | "MANAGEMENT";
}

export interface InvestorItem {
  id?: string;
  name: string;
  share: number;
  amount?: number;
  isFixed?: boolean;
  percentage?: number; // Some parts use percentage instead of share
}

export interface GlobalPnLResult {
  card1_TotalRevenue: number;
  card2_NonCommRevenue: number;
  card3_RevHotelCollect: number;
  card3_RevNexuraCollect: number;
  card4_PenaltyFee: number;
  card5_OtherRevenue: number;
  card6_GOP: number;
  card7_TotalGOP: number;
  card8_TotalExpenses: number;
  card9_FeeGross: number;
  card10_GAP: number;
  card11_VAT: number;
  card12_ReconOwner: number;
  
  netProfit: number;
  gopBasis: number;
  gopFee: number;
  totalGap: number;
  investorDistributions: {
    name: string;
    amount: number;
    share: number;
  }[];
}

export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

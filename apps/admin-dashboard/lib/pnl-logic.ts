"use client";

import { 
  GlobalPnLResult, 
  PnlIncomeItem, 
  PnlExpenseItem, 
  InvestorItem 
} from "./pnl-utils";

export interface ExtendedTransaction {
  amount: number;
  paidCash: number;
  paidTransfer: number;
  feePercentage: number;
  status: string;
  channel: string;
  penaltyType: string;
  penaltyAmount: number;
  penaltyMethod?: string;
  propertyId: string;
  date: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  bookingId: string;
  paymentStatus?: string;
  type?: string;
}

export interface HotelMaster {
  id: string;
  name: string;
}

export interface PropertyStat {
  id: string;
  name: string;
  gross: number;
  payAtHotel: number;
  fee: number;
  penalty: number;
  nett: number;
  gap: number;
}

export interface PnLCalculationResult {
  pnlResult: GlobalPnLResult;
  propertyStats: PropertyStat[];
  sharedExpensesTotal: number;
  mgmtExpensesTotal: number;
  totalNonComm: number;
  totalGOP: number;
  totalRevenueHotelCollect: number;
  finalMgmtNet: number;
  feeForGOP: number;
}

export function processPnLData(
  transactions: ExtendedTransaction[],
  customIncomes: PnlIncomeItem[],
  nonCommissionRevenue: PnlIncomeItem[],
  expenses: PnlExpenseItem[],
  investors: InvestorItem[],
  vatPercentage: number = 11,
  hotelGopPercentages: Record<string, any> = {},
  allHotels: HotelMaster[] = [],
  mgmtFeePercentage: number = 10
): PnLCalculationResult {
  // Placeholder implementation to allow build to pass
  // Real logic would be more complex
  
  const ledgerRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExtraIncome = customIncomes.reduce((sum, t) => sum + t.amount, 0);
  const totalRevenue = ledgerRevenue + totalExtraIncome;
  const totalExtraExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate Revenue Hotel Collect (Pay at Hotel)
  const revenueHotelCollect = transactions
    .filter(t => t.type !== "other_income")
    .reduce((sum, t) => sum + (Number(t.paidCash) || 0), 0);

  // Calculate Revenue Nexura Collect (Pay at Nexura)
  const revenueNexuraCollect = transactions
    .filter(t => t.type !== "other_income")
    .reduce((sum, t) => sum + (Number(t.paidTransfer) || 0), 0);

  // Other Income from daily_revenue (Ledger)
  const ledgerOtherIncome = transactions
    .filter(t => t.type === "other_income")
    .reduce((sum, t) => sum + t.amount, 0);

  // Card 5: Other Revenue (Manual + Ledger)
  const otherRevenueTotal = totalExtraIncome + ledgerOtherIncome;
  
  const pnlResult: GlobalPnLResult = {
    card1_TotalRevenue: totalRevenue,
    card2_NonCommRevenue: 0,
    card3_RevHotelCollect: revenueHotelCollect,
    card3_RevNexuraCollect: revenueNexuraCollect,
    card4_PenaltyFee: 0,
    card5_OtherRevenue: otherRevenueTotal,
    card6_GOP: totalRevenue - totalExtraExpenses, // Basic GOP (Rev - Exp)
    card7_TotalGOP: 0, // Calculated below
    card8_TotalExpenses: totalExtraExpenses,
    card9_FeeGross: totalRevenue * (mgmtFeePercentage / 100), 
    card10_GAP: 0,
    card11_VAT: totalRevenue * (vatPercentage / 100),
    card12_ReconOwner: 0, 
    netProfit: 0,
    gopBasis: totalRevenue,
    gopFee: totalRevenue * (mgmtFeePercentage / 100),
    totalGap: 0,
    investorDistributions: investors.map(inv => ({
      name: inv.name,
      share: inv.percentage || inv.share || 0,
      amount: 0 // Calculated below
    }))
  };

  // Standard GOP Formula: GOP = Total Revenue - Total Operating Expenses
  pnlResult.card7_TotalGOP = pnlResult.card1_TotalRevenue - pnlResult.card8_TotalExpenses;
  
  // Final Reconciliation (Net Profit): GOP - VAT - Management Fees
  pnlResult.card12_ReconOwner = pnlResult.card7_TotalGOP - pnlResult.card11_VAT - pnlResult.card9_FeeGross;
  pnlResult.netProfit = pnlResult.card12_ReconOwner;

  // Update investor amounts based on the final net profit
  pnlResult.investorDistributions = pnlResult.investorDistributions.map(dist => ({
    ...dist,
    amount: pnlResult.netProfit * (dist.share / 100)
  }));

  return {
    pnlResult,
    propertyStats: [],
    sharedExpensesTotal: totalExtraExpenses,
    mgmtExpensesTotal: 0,
    totalNonComm: 0,
    totalGOP: pnlResult.card7_TotalGOP,
    totalRevenueHotelCollect: revenueHotelCollect,
    finalMgmtNet: pnlResult.netProfit,
    feeForGOP: 0
  };
}

export function getDrillDownData(
  cardId: string,
  pnlResult: GlobalPnLResult,
  propertyStats: PropertyStat[],
  rawTransactions: ExtendedTransaction[],
  customIncomes: PnlIncomeItem[],
  nonCommissionRevenue: PnlIncomeItem[],
  expenses: PnlExpenseItem[],
  allHotels: HotelMaster[],
  sharedExpensesTotal: number,
  totalNonComm: number,
  feeForGOP: number,
  hotelGopPercentages: Record<string, any>
) {
  return {
    title: cardId.replace(/_/g, ' '),
    items: []
  };
}

export function calculateInvestorShares(netProfit: number, investors: InvestorItem[]) {
  return investors.map(inv => ({
    ...inv,
    amount: netProfit * ((inv.percentage || inv.share || 0) / 100)
  }));
}

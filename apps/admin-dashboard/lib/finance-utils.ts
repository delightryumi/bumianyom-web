export interface TransactionInput {
  amount: number;
  paidCash: number;
  paidTransfer: number;
  feePercentage: number;
  status: string;
  channel: string;
  penaltyType?: string;
  penaltyAmount?: number;
  penaltyMethod?: string;
}

export interface SummaryResult {
  gross: number;
  nexuraSalesCash: number;
  nexuraSalesTransfer: number;
  walkInTotal: number;
  otaTotal: number;
  fee: number;
  totalGap: number;
  finalReconcile: number;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    minimumFractionDigits: 0 
  }).format(amount);
};

export const formatRupiahShort = (amount: number): string => {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}K`;
  }
  return `Rp ${amount}`;
};

export const calculateTransaction = (row: any) => {
  const gross = Number(row.amount) || 0;
  const realTransfer = Number(row.paidTransfer) || 0;
  const cash = Number(row.paidCash) || 0;
  const feePct = Number(row.feePercentage) || 0;
  
  const otaChannels = [
    "Traveloka", "Booking.com", "Tiket.com", "Agoda", "Trip.com", 
    "Expedia", "Airbnb", "Booking Engine", "Nexura Sales", "MG Bedbank"
  ];
  const isOta = otaChannels.includes(row.channel);

  const displayFee = (gross * feePct) / 100;
  const fee = displayFee;

  let gap = 0;
  if (isOta) {
      gap = (realTransfer + cash) - gross;
  } else {
      gap = 0;
  }

  const isLoss = gap < 0;

  // Owner penalty for cancelled transactions
  let ownerPenalty = 0;
  if (row.status === "CANCELLED" && row.penaltyType === "OWNER") {
      ownerPenalty = Number(row.penaltyAmount) || 0;
  }

  // Cash/transfer breakdown
  const ownerCash = cash;
  const nexuraCash = realTransfer;

  return { gross, gap, displayFee, fee, isLoss, isOta, ownerPenalty, ownerCash, nexuraCash };
};

export const calculateSummary = (transactions: any[]): SummaryResult => {
  let gross = 0;
  let nexuraSalesCash = 0;
  let nexuraSalesTransfer = 0;
  let walkInTotal = 0;
  let otaTotal = 0;
  let fee = 0;
  let totalGap = 0;

  transactions.forEach((tx) => {
    if (tx.status === "CANCELLED") return;

    const amount = Number(tx.amount) || 0;
    gross += amount;

    const cash = Number(tx.paidCash) || 0;
    const transfer = Number(tx.paidTransfer) || 0;

    nexuraSalesCash += cash;
    nexuraSalesTransfer += transfer;

    const otaChannels = [
      "Traveloka", "Booking.com", "Tiket.com", "Agoda", "Trip.com", 
      "Expedia", "Airbnb", "Booking Engine", "Nexura Sales", "MG Bedbank"
    ];
    if (otaChannels.includes(tx.channel)) {
        otaTotal += amount;
    } else {
        walkInTotal += amount;
    }

    const { displayFee, gap } = calculateTransaction(tx);
    fee += displayFee;
    totalGap += gap;
  });

  const finalReconcile = nexuraSalesTransfer - fee; 

  return {
    gross,
    nexuraSalesCash,
    nexuraSalesTransfer,
    walkInTotal,
    otaTotal,
    fee,
    totalGap,
    finalReconcile
  };
};

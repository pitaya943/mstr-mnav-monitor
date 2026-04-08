import { getMstrBtcOnDate } from "./btc-holdings";
import { getMstrSharesOnDate } from "./shares-outstanding";
import { getMstrDebtOnDate } from "./debt";
import { fetchBtcHistory, fetchStockHistory } from "./yahoo";

export interface MNavDataPoint {
  date: string; // YYYY-MM-DD
  // Corrected mNAV = Enterprise Value / BTC NAV
  mNAV: number;
  // NAV Premium = Market Cap / BTC NAV (equity-only ratio)
  navPremium: number;
  btcPrice: number; // BTC price in USD
  mstrPrice: number; // MSTR stock price in USD
  btcHoldings: number; // BTC held by MSTR on this date
  sharesOutstanding: number; // split-adjusted shares outstanding
  marketCap: number; // MSTR market cap in billions USD
  enterpriseValue: number; // Market Cap + Total Debt + Preferred Stock (billions USD)
  totalDebt: number; // Total debt in billions USD
  preferredStock: number; // Preferred stock in billions USD
  btcNAV: number; // BTC Holdings × BTC Price in billions USD
  premium: number; // NAV Premium percentage ((navPremium - 1) × 100)
}

export async function computeMNavSeries(
  fromDate: string,
  toDate: string
): Promise<MNavDataPoint[]> {
  const [btcHistory, mstrHistory] = await Promise.all([
    fetchBtcHistory(fromDate, toDate),
    fetchStockHistory("MSTR", fromDate, toDate),
  ]);

  const btcByDate = new Map<string, number>(btcHistory.map((p) => [p.date, p.close]));
  const mstrByDate = new Map<string, number>(mstrHistory.map((r) => [r.date, r.close]));

  const sharedDates = [...mstrByDate.keys()]
    .filter((d) => btcByDate.has(d))
    .sort();

  const result: MNavDataPoint[] = [];

  for (const date of sharedDates) {
    const btcPrice = btcByDate.get(date)!;
    const mstrPrice = mstrByDate.get(date)!;

    const btcHoldings = getMstrBtcOnDate(date);
    if (btcHoldings === 0) continue;

    const sharesOutstanding = getMstrSharesOnDate(date);
    const { totalDebt, preferredStock } = getMstrDebtOnDate(date);

    const marketCap = mstrPrice * sharesOutstanding;
    const enterpriseValue = marketCap + totalDebt + preferredStock;
    const btcNAV = btcHoldings * btcPrice;

    const mNAV = btcNAV > 0 ? enterpriseValue / btcNAV : 0;
    const navPremium = btcNAV > 0 ? marketCap / btcNAV : 0;
    const premium = (navPremium - 1) * 100;

    result.push({
      date,
      mNAV:            Math.round(mNAV * 1000) / 1000,
      navPremium:      Math.round(navPremium * 1000) / 1000,
      btcPrice:        Math.round(btcPrice),
      mstrPrice:       Math.round(mstrPrice * 100) / 100,
      btcHoldings,
      sharesOutstanding,
      marketCap:       Math.round((marketCap       / 1e9) * 100) / 100,
      enterpriseValue: Math.round((enterpriseValue / 1e9) * 100) / 100,
      totalDebt:       Math.round((totalDebt       / 1e9) * 100) / 100,
      preferredStock:  Math.round((preferredStock  / 1e9) * 100) / 100,
      btcNAV:          Math.round((btcNAV          / 1e9) * 100) / 100,
      premium:         Math.round(premium * 10) / 10,
    });
  }

  return result;
}

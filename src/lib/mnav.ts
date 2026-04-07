import { getMstrBtcOnDate } from "./btc-holdings";
import { getMstrSharesOnDate } from "./shares-outstanding";
import { fetchBtcHistory, fetchStockHistory } from "./yahoo";

export interface MNavDataPoint {
  date: string; // YYYY-MM-DD
  mNAV: number; // mNAV ratio (market cap / BTC NAV)
  btcPrice: number; // BTC price in USD
  mstrPrice: number; // MSTR stock price in USD
  btcHoldings: number; // BTC held by MSTR on this date
  sharesOutstanding: number; // split-adjusted shares outstanding
  marketCap: number; // MSTR market cap in USD (billions)
  btcNAV: number; // BTC NAV in USD (billions)
  premium: number; // premium over NAV as percentage ((mNAV - 1) * 100)
}

export async function computeMNavSeries(
  fromDate: string,
  toDate: string
): Promise<MNavDataPoint[]> {
  const [btcHistory, mstrHistory] = await Promise.all([
    fetchBtcHistory(fromDate, toDate),
    fetchStockHistory("MSTR", fromDate, toDate),
  ]);

  // Build lookup maps keyed by YYYY-MM-DD
  const btcByDate = new Map<string, number>(btcHistory.map((p) => [p.date, p.close]));
  const mstrByDate = new Map<string, number>(mstrHistory.map((r) => [r.date, r.close]));

  // Use only dates where both data sets have entries
  const sharedDates = [...mstrByDate.keys()]
    .filter((d) => btcByDate.has(d))
    .sort();

  const result: MNavDataPoint[] = [];

  for (const date of sharedDates) {
    const btcPrice = btcByDate.get(date)!;
    const mstrPrice = mstrByDate.get(date)!;

    const btcHoldings = getMstrBtcOnDate(date);
    if (btcHoldings === 0) continue; // before MSTR started buying BTC

    const sharesOutstanding = getMstrSharesOnDate(date);
    const marketCap = mstrPrice * sharesOutstanding;
    const btcNAV = btcHoldings * btcPrice;
    const mNAV = marketCap / btcNAV;
    const premium = (mNAV - 1) * 100;

    result.push({
      date,
      mNAV: Math.round(mNAV * 1000) / 1000,
      btcPrice: Math.round(btcPrice),
      mstrPrice: Math.round(mstrPrice * 100) / 100,
      btcHoldings,
      sharesOutstanding,
      marketCap: Math.round((marketCap / 1e9) * 100) / 100,
      btcNAV: Math.round((btcNAV / 1e9) * 100) / 100,
      premium: Math.round(premium * 10) / 10,
    });
  }

  return result;
}

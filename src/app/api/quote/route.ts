import { getMstrBtcOnDate } from "@/lib/btc-holdings";
import { getMstrSharesOnDate, CLASS_B_SHARES } from "@/lib/shares-outstanding";
import { getMstrDebtOnDate } from "@/lib/debt";
import { fetchLivePrices } from "@/lib/yahoo";

export const revalidate = 300;

export interface LiveQuote {
  btcPrice: number;
  mstrPrice: number;
  // Corrected: Enterprise Value / BTC NAV
  mNAV: number;
  // New: Market Cap / BTC NAV (equity-only)
  navPremium: number;
  marketCap: number;       // billions USD
  enterpriseValue: number; // billions USD (marketCap + totalDebt + preferredStock)
  totalDebt: number;       // billions USD
  preferredStock: number;  // billions USD
  btcNAV: number;          // billions USD
  premium: number;         // (navPremium - 1) × 100 %
  btcHoldings: number;
  sharesOutstanding: number;
  fetchedAt: string;
  isMarketOpen: boolean;
}

function isNYSEOpen(now: Date): boolean {
  const year = now.getUTCFullYear();
  const dstStart = getNthSundayOfMonth(year, 2, 2);
  const dstEnd   = getNthSundayOfMonth(year, 10, 1);
  const isDST = now >= dstStart && now < dstEnd;
  const etMs = now.getTime() + (isDST ? -4 : -5) * 3_600_000;
  const et = new Date(etMs);
  const day = et.getUTCDay();
  const min = et.getUTCHours() * 60 + et.getUTCMinutes();
  return day >= 1 && day <= 5 && min >= 570 && min < 960;
}

function getNthSundayOfMonth(year: number, month: number, nth: number): Date {
  const d = new Date(Date.UTC(year, month, 1));
  const firstSunday = (7 - d.getUTCDay()) % 7;
  return new Date(Date.UTC(year, month, 1 + firstSunday + (nth - 1) * 7));
}

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const prices = await fetchLivePrices();

    const btcHoldings = getMstrBtcOnDate(today);
    const sharesOutstanding = prices.mstrSharesOutstanding + CLASS_B_SHARES;

    // Use live totalDebt from Yahoo Finance; preferred stock from hardcoded timeline
    const { preferredStock } = getMstrDebtOnDate(today);
    const totalDebt = prices.totalDebt;

    const marketCap      = prices.mstrPrice * sharesOutstanding;
    const enterpriseValue = marketCap + totalDebt + preferredStock;
    const btcNAV         = btcHoldings * prices.btcPrice;

    const mNAV      = btcNAV > 0 ? enterpriseValue / btcNAV : 0;
    const navPremium = btcNAV > 0 ? marketCap / btcNAV : 0;
    const premium   = (navPremium - 1) * 100;

    const quote: LiveQuote = {
      btcPrice:        Math.round(prices.btcPrice),
      mstrPrice:       Math.round(prices.mstrPrice * 100) / 100,
      mNAV:            Math.round(mNAV * 1000) / 1000,
      navPremium:      Math.round(navPremium * 1000) / 1000,
      marketCap:       Math.round((marketCap       / 1e9) * 100) / 100,
      enterpriseValue: Math.round((enterpriseValue / 1e9) * 100) / 100,
      totalDebt:       Math.round((totalDebt       / 1e9) * 100) / 100,
      preferredStock:  Math.round((preferredStock  / 1e9) * 100) / 100,
      btcNAV:          Math.round((btcNAV          / 1e9) * 100) / 100,
      premium:         Math.round(premium * 10) / 10,
      btcHoldings,
      sharesOutstanding,
      fetchedAt:    new Date().toISOString(),
      isMarketOpen: isNYSEOpen(new Date()),
    };

    return Response.json(quote);
  } catch (err) {
    console.error("Quote API error:", err);
    return Response.json({ error: "Failed to fetch live quote." }, { status: 500 });
  }
}

import { getMstrBtcOnDate } from "@/lib/btc-holdings";
import { getMstrSharesOnDate, CLASS_B_SHARES } from "@/lib/shares-outstanding";
import { fetchLivePrices } from "@/lib/yahoo";

// Cache server-side for 5 minutes — all concurrent users share one upstream call
export const revalidate = 300;

export interface LiveQuote {
  btcPrice: number;
  mstrPrice: number;
  mNAV: number;
  marketCap: number;      // billions USD
  btcNAV: number;         // billions USD
  premium: number;        // percentage
  btcHoldings: number;
  sharesOutstanding: number;
  fetchedAt: string;      // ISO timestamp
  isMarketOpen: boolean;
}

/** Returns true if NYSE is currently open (Mon–Fri 9:30–16:00 ET, DST-aware). */
function isNYSEOpen(now: Date): boolean {
  // US DST: starts 2nd Sunday in March, ends 1st Sunday in November
  const year = now.getUTCFullYear();
  const dstStart = getNthSundayOfMonth(year, 2, 2); // March = month 2 (0-indexed)
  const dstEnd = getNthSundayOfMonth(year, 10, 1);  // November = month 10
  const isDST = now >= dstStart && now < dstEnd;
  const etOffsetHours = isDST ? -4 : -5;

  const etMs = now.getTime() + etOffsetHours * 3600_000;
  const etDate = new Date(etMs);
  const day = etDate.getUTCDay(); // 0=Sun, 6=Sat
  const minuteOfDay = etDate.getUTCHours() * 60 + etDate.getUTCMinutes();

  return day >= 1 && day <= 5 && minuteOfDay >= 570 && minuteOfDay < 960; // 9:30–16:00
}

function getNthSundayOfMonth(year: number, month: number, nth: number): Date {
  // Find the nth Sunday of the given month (0-indexed month)
  const d = new Date(Date.UTC(year, month, 1));
  const firstSunday = (7 - d.getUTCDay()) % 7;
  return new Date(Date.UTC(year, month, 1 + firstSunday + (nth - 1) * 7));
}

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const prices = await fetchLivePrices();

    const btcHoldings = getMstrBtcOnDate(today);
    // Use total shares (Class A from Yahoo + Class B fixed) for consistency with market cap
    const classAShares = prices.mstrSharesOutstanding;
    const sharesOutstanding = classAShares + CLASS_B_SHARES;

    const marketCap = prices.mstrPrice * sharesOutstanding;
    const btcNAV = btcHoldings * prices.btcPrice;
    const mNAV = btcNAV > 0 ? marketCap / btcNAV : 0;
    const premium = (mNAV - 1) * 100;

    const quote: LiveQuote = {
      btcPrice: Math.round(prices.btcPrice),
      mstrPrice: Math.round(prices.mstrPrice * 100) / 100,
      mNAV: Math.round(mNAV * 1000) / 1000,
      marketCap: Math.round((marketCap / 1e9) * 100) / 100,
      btcNAV: Math.round((btcNAV / 1e9) * 100) / 100,
      premium: Math.round(premium * 10) / 10,
      btcHoldings,
      sharesOutstanding,
      fetchedAt: new Date().toISOString(),
      isMarketOpen: isNYSEOpen(new Date()),
    };

    return Response.json(quote);
  } catch (err) {
    console.error("Quote API error:", err);
    return Response.json(
      { error: "Failed to fetch live quote. Please try again." },
      { status: 500 }
    );
  }
}

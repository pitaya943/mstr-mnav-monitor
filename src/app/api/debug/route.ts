import YahooFinance from "yahoo-finance2";
import { computeMNavSeries } from "@/lib/mnav";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
    const btc = await yf.quote("BTC-USD");
    results.btcQuote = { ok: true, price: btc.regularMarketPrice };
  } catch (e) {
    results.btcQuote = { ok: false, error: String(e) };
  }

  try {
    const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
    const hist = await yf.historical("MSTR", {
      period1: "2026-03-01",
      period2: "2026-04-08",
      interval: "1d",
    });
    results.mstrHistory = { ok: true, rows: hist.length, sample: hist[0] };
  } catch (e) {
    results.mstrHistory = { ok: false, error: String(e) };
  }

  try {
    const data = await computeMNavSeries("2026-03-01", "2026-04-07");
    results.mnavCompute = { ok: true, rows: data.length, last: data[data.length - 1] };
  } catch (e) {
    results.mnavCompute = { ok: false, error: String(e), stack: (e as Error)?.stack };
  }

  return Response.json(results);
}

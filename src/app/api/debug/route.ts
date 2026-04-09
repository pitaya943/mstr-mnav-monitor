import YahooFinance from "yahoo-finance2";

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
    const mstr = await yf.quote("MSTR");
    results.mstrQuote = { ok: true, price: mstr.regularMarketPrice };
  } catch (e) {
    results.mstrQuote = { ok: false, error: String(e) };
  }

  try {
    const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const hist = await yf.historical("BTC-USD", { period1: start, period2: end, interval: "1d" });
    results.btcHistory = { ok: true, rows: hist.length };
  } catch (e) {
    results.btcHistory = { ok: false, error: String(e) };
  }

  return Response.json(results);
}

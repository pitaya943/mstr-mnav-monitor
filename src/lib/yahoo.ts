import YahooFinance from "yahoo-finance2";

export interface StockDayData {
  date: string; // YYYY-MM-DD
  close: number; // USD close price
}

export interface StockInfo {
  sharesOutstanding: number;
  longName: string;
  marketCap: number;
}

let _yf: InstanceType<typeof YahooFinance> | null = null;

function getYf() {
  if (!_yf) {
    _yf = new YahooFinance({
      suppressNotices: ["yahooSurvey", "ripHistorical"],
    });
  }
  return _yf;
}

export async function fetchStockHistory(
  symbol: string,
  fromDate: string,
  toDate: string
): Promise<StockDayData[]> {
  const yf = getYf();

  // Yahoo Finance returns SOME null values on long date ranges, causing
  // yahoo-finance2 to throw. Split into 6-month chunks to avoid this.
  const CHUNK_MONTHS = 6;
  const dateMap = new Map<string, number>();

  let current = new Date(fromDate);
  const end = new Date(toDate);

  while (current <= end) {
    const chunkEnd = new Date(current);
    chunkEnd.setMonth(chunkEnd.getMonth() + CHUNK_MONTHS);
    if (chunkEnd > end) chunkEnd.setTime(end.getTime());

    const rows = await yf.historical(symbol, {
      period1: current.toISOString().slice(0, 10),
      period2: chunkEnd.toISOString().slice(0, 10),
      interval: "1d",
    });

    for (const r of rows) {
      if (r.close != null && r.date != null) {
        dateMap.set(new Date(r.date).toISOString().slice(0, 10), r.close);
      }
    }

    current = new Date(chunkEnd);
    current.setDate(current.getDate() + 1);
  }

  return Array.from(dateMap.entries())
    .map(([date, close]) => ({ date, close }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Convenience wrapper for BTC-USD daily close prices via Yahoo Finance. */
export async function fetchBtcHistory(
  fromDate: string,
  toDate: string
): Promise<StockDayData[]> {
  return fetchStockHistory("BTC-USD", fromDate, toDate);
}

export async function fetchStockInfo(symbol: string): Promise<StockInfo> {
  const yf = getYf();
  const q = await yf.quote(symbol);
  return {
    sharesOutstanding: q.sharesOutstanding ?? 0,
    longName: q.longName ?? symbol,
    marketCap: q.marketCap ?? 0,
  };
}

export interface LivePrices {
  btcPrice: number;
  mstrPrice: number;
  mstrSharesOutstanding: number;
  totalDebt: number; // latest total debt from Yahoo Finance financialData (USD)
}

/** Fetch current BTC-USD and MSTR prices + debt in parallel. */
export async function fetchLivePrices(): Promise<LivePrices> {
  const yf = getYf();
  const [btcQuote, mstrQuote, financials] = await Promise.all([
    yf.quote("BTC-USD"),
    yf.quote("MSTR"),
    yf.quoteSummary("MSTR", { modules: ["financialData"] }),
  ]);
  return {
    btcPrice: btcQuote.regularMarketPrice ?? 0,
    mstrPrice: mstrQuote.regularMarketPrice ?? 0,
    mstrSharesOutstanding: mstrQuote.sharesOutstanding ?? 0,
    totalDebt: (financials.financialData?.totalDebt as number) ?? 8_236_290_000,
  };
}

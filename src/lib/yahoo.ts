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
  const rows = await yf.historical(symbol, {
    period1: fromDate,
    period2: toDate,
    interval: "1d",
  });

  return rows.map((r) => ({
    date: new Date(r.date).toISOString().slice(0, 10),
    close: r.close,
  }));
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

// NOTE: CoinGecko free tier is limited to the past 365 days.
// For older BTC price history, we fall back to Yahoo Finance (BTC-USD).
// This module is kept for optional direct use but is no longer the primary source.

export interface DailyPrice {
  date: string; // YYYY-MM-DD
  price: number; // USD
}

/**
 * Fetch daily BTC prices from CoinGecko (free tier).
 * Only works for dates within the past 365 days.
 */
export async function fetchBtcDailyPricesFromCoinGecko(
  fromDate: string,
  toDate: string
): Promise<DailyPrice[]> {
  const fromTs = Math.floor(new Date(fromDate).getTime() / 1000);
  const toTs = Math.floor(new Date(toDate).getTime() / 1000) + 86400;

  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTs}&to=${toTs}&precision=2`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { prices: [number, number][] };

  if (!data.prices || data.prices.length === 0) {
    return [];
  }

  const dayMap = new Map<string, number>();
  for (const [ts, price] of data.prices) {
    const dateStr = new Date(ts).toISOString().slice(0, 10);
    dayMap.set(dateStr, price);
  }

  return Array.from(dayMap.entries())
    .map(([date, price]) => ({ date, price }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

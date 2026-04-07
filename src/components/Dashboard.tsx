"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MNavChart } from "./MNavChart";
import { StatCard } from "./StatCard";
import { DateRangePicker } from "./DateRangePicker";
import { InsightPanel } from "./InsightPanel";
import type { MNavDataPoint } from "@/lib/mnav";
import type { LiveQuote } from "@/app/api/quote/route";

function defaultRange() {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

function formatSecondsAgo(s: number): string {
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function mNavColour(v: number): "green" | "yellow" | "red" | "blue" | "none" {
  if (v < 1) return "green";
  if (v < 2) return "yellow";
  return "red";
}

export function Dashboard() {
  const [range, setRange] = useState(defaultRange);

  // Historical chart data (up to yesterday)
  const [data, setData] = useState<MNavDataPoint[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [histError, setHistError] = useState("");

  // Live quote for stat cards
  const [quote, setQuote] = useState<LiveQuote | null>(null);
  const [quoteError, setQuoteError] = useState("");

  // Last-updated ticker
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchHistorical = useCallback(async (from: string, to: string) => {
    setHistLoading(true);
    setHistError("");
    try {
      const res = await fetch(`/api/mnav?from=${from}&to=${to}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unknown error");
      setData(json.data ?? []);
    } catch (e) {
      setHistError(e instanceof Error ? e.message : "Failed to load historical data.");
    } finally {
      setHistLoading(false);
    }
  }, []);

  const fetchQuote = useCallback(async () => {
    setQuoteError("");
    try {
      const res = await fetch("/api/quote");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unknown error");
      setQuote(json);
      setLastFetchedAt(Date.now());
      setSecondsAgo(0);
    } catch (e) {
      setQuoteError(e instanceof Error ? e.message : "Failed to refresh quote.");
    }
  }, []);

  // Mount: fetch both, start 5-min quote poll
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    fetchHistorical(range.from, range.to);
    fetchQuote();
    pollingRef.current = setInterval(fetchQuote, 5 * 60 * 1000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Date range change: re-fetch historical only
  useEffect(() => {
    fetchHistorical(range.from, range.to);
  }, [range, fetchHistorical]);

  // Tick seconds-ago counter every second
  useEffect(() => {
    if (lastFetchedAt === null) return;
    const id = setInterval(
      () => setSecondsAgo(Math.floor((Date.now() - lastFetchedAt) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [lastFetchedAt]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-amber-400">MSTR</span> mNAV Monitor
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Strategy Inc · Bitcoin Treasury · DAT.co Indicator
            </p>
          </div>
          <a
            href="https://www.strategy.com/bitcoin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            strategy.com ↗
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Live stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard
            label="mNAV"
            value={quote ? `${quote.mNAV.toFixed(3)}×` : "—"}
            sub="Market Cap / BTC NAV"
            highlight={quote ? mNavColour(quote.mNAV) : "none"}
          />
          <StatCard
            label="Premium"
            value={quote ? `${quote.premium > 0 ? "+" : ""}${quote.premium.toFixed(1)}%` : "—"}
            sub="Over BTC NAV"
            highlight={quote ? (quote.premium > 0 ? "yellow" : "green") : "none"}
          />
          <StatCard
            label="BTC Price"
            value={quote ? `$${quote.btcPrice.toLocaleString()}` : "—"}
            sub="USD"
            highlight="blue"
          />
          <StatCard
            label="MSTR Price"
            value={quote ? `$${quote.mstrPrice.toLocaleString()}` : "—"}
            sub="USD"
          />
          <StatCard
            label="BTC Holdings"
            value={quote ? quote.btcHoldings.toLocaleString() : "—"}
            sub="Bitcoin"
            highlight="blue"
          />
          <StatCard
            label="MSTR NAV"
            value={quote ? `$${quote.marketCap.toFixed(1)}B` : "—"}
            sub="Market Cap (USD)"
          />
          <StatCard
            label="BTC NAV"
            value={quote ? `$${quote.btcNAV.toFixed(1)}B` : "—"}
            sub="BTC Holdings Value"
          />
        </div>

        {/* Quote error */}
        {quoteError && (
          <p className="text-xs text-rose-400 bg-rose-400/10 rounded-lg px-4 py-2">
            {quoteError}
          </p>
        )}

        {/* Date range picker */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-4">
          <DateRangePicker
            from={range.from}
            to={range.to}
            onChange={(from, to) => setRange({ from, to })}
            loading={histLoading}
          />
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">mNAV vs BTC Price</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                mNAV = MSTR Market Cap ÷ (BTC Holdings × BTC Price) · Reference line at 1.0 = fair value
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastFetchedAt && (
                <span className="text-xs text-zinc-500">
                  {quote?.isMarketOpen ? (
                    <span className="text-emerald-500">● Live</span>
                  ) : (
                    <span className="text-zinc-600">● Market closed</span>
                  )}
                  {" · "}Updated {formatSecondsAgo(secondsAgo)}
                </span>
              )}
              <button
                onClick={fetchQuote}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10 transition"
              >
                Refresh
              </button>
            </div>
          </div>

          {histError ? (
            <div className="flex items-center justify-center h-80 text-rose-400 text-sm">
              {histError}
            </div>
          ) : histLoading ? (
            <div className="flex items-center justify-center h-80 text-zinc-500 text-sm">
              <span className="animate-pulse">Fetching historical data…</span>
            </div>
          ) : (
            <MNavChart data={data} />
          )}
        </div>

        {/* mNAV explanation */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-6 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-base font-semibold text-white mb-2">What is mNAV?</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              <strong className="text-zinc-200">mNAV (Modified Net Asset Value)</strong> measures how much
              premium the equity market assigns to a Bitcoin treasury company&apos;s holdings. It is calculated as:
            </p>
            <div className="mt-3 rounded-lg bg-black/40 border border-white/10 px-4 py-3 font-mono text-sm text-amber-300">
              mNAV = Market Cap / (BTC Holdings × BTC Price)
            </div>
            <ul className="mt-3 text-sm text-zinc-400 space-y-1">
              <li><span className="text-white font-medium">mNAV = 1.0</span> — trades exactly at BTC value</li>
              <li><span className="text-amber-400 font-medium">mNAV &gt; 1.0</span> — market premium (leveraged BTC exposure, brand, access)</li>
              <li><span className="text-emerald-400 font-medium">mNAV &lt; 1.0</span> — rare discount to BTC NAV</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white mb-2">Relationship with Bitcoin</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              mNAV and BTC price exhibit an interesting inverse dynamic during rapid price moves:
            </p>
            <ul className="mt-3 text-sm text-zinc-400 space-y-2">
              <li>
                <span className="text-zinc-200 font-medium">BTC rallies fast</span> — the NAV denominator rises
                quicker than the stock re-rates, compressing mNAV.
              </li>
              <li>
                <span className="text-zinc-200 font-medium">BTC drawdowns</span> — stock sentiment lags the
                NAV decline, temporarily spiking mNAV.
              </li>
              <li>
                <span className="text-zinc-200 font-medium">High mNAV (&gt;2×)</span> — historically signals
                elevated risk and potential mean-reversion when BTC cools.
              </li>
            </ul>
          </div>
        </div>

        {/* AI Insight */}
        <InsightPanel data={data} quote={quote} />

        {/* Footer */}
        <footer className="text-center text-xs text-zinc-600 pb-4">
          Data: Yahoo Finance (BTC-USD, MSTR) · SEC EDGAR 8-K filings (BTC holdings) ·
          Auto-refreshes every 5 min · Not financial advice.
        </footer>
      </main>
    </div>
  );
}

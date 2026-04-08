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
            href="https://www.strategy.com"
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
            sub="Enterprise Value / BTC NAV"
            highlight={quote ? mNavColour(quote.mNAV) : "none"}
          />
          <StatCard
            label="NAV Premium"
            value={quote ? `${quote.navPremium.toFixed(3)}×` : "—"}
            sub="Market Cap / BTC NAV"
            highlight={quote ? (quote.navPremium > 1 ? "yellow" : "green") : "none"}
          />
          <StatCard
            label="BTC Price"
            value={quote ? `$${quote.btcPrice.toLocaleString()}` : "—"}
            sub="USD"
            highlight="orange"
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
            highlight="orange"
            icon={
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-400 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.974.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
              </svg>
            }
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
              <h2 className="text-base font-semibold text-white">mNAV · NAV Premium · BTC Price</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                mNAV = Enterprise Value ÷ BTC NAV · NAV Premium = Market Cap ÷ BTC NAV · Reference line at 1.0 = fair value
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
              <strong className="text-zinc-200">mNAV (Modified Net Asset Value)</strong> measures the total enterprise claim relative to Bitcoin holdings. <strong className="text-zinc-200">NAV Premium</strong> measures the equity-only ratio.
            </p>
            <div className="mt-3 rounded-lg bg-black/40 border border-white/10 px-4 py-3 font-mono text-sm space-y-1">
              <div className="text-amber-300">mNAV = Enterprise Value / BTC NAV</div>
              <div className="text-violet-400">NAV Premium = Market Cap / BTC NAV</div>
              <div className="text-zinc-500 text-xs mt-1">Enterprise Value = Market Cap + Total Debt + Preferred Stock</div>
            </div>
            <ul className="mt-3 text-sm text-zinc-400 space-y-1">
              <li><span className="text-white font-medium">= 1.0</span> — fair value (equity trades at BTC NAV)</li>
              <li><span className="text-amber-400 font-medium">&gt; 1.0</span> — premium (leveraged BTC exposure, brand, capital access)</li>
              <li><span className="text-emerald-400 font-medium">&lt; 1.0</span> — discount to BTC NAV</li>
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

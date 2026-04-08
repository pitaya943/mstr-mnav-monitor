"use client";

import { useState } from "react";
import type { MNavDataPoint } from "@/lib/mnav";
import type { BilingualInsight } from "@/lib/anthropic";
import type { LiveQuote } from "@/app/api/quote/route";

interface InsightPanelProps {
  data: MNavDataPoint[];
  quote: LiveQuote | null;
}

function InsightText({ text }: { text: string }) {
  return (
    <div>
      {text.split("\n\n").map((para, i) => (
        <p key={i} className="text-sm text-zinc-300 leading-relaxed mb-3 last:mb-0">
          {para}
        </p>
      ))}
    </div>
  );
}

export function InsightPanel({ data, quote }: InsightPanelProps) {
  const [insight, setInsight] = useState<BilingualInsight | null>(null);
  const [tab, setTab] = useState<"en" | "zh">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function generateInsight() {
    setLoading(true);
    setError("");
    setInsight(null);
    try {
      // Append live quote as today's data point so the AI sees current prices
      const today = new Date().toISOString().slice(0, 10);
      const livePoint: MNavDataPoint | null = quote
        ? {
            date: today,
            mNAV: quote.mNAV,
            navPremium: quote.navPremium,
            btcPrice: quote.btcPrice,
            mstrPrice: quote.mstrPrice,
            btcHoldings: quote.btcHoldings,
            sharesOutstanding: quote.sharesOutstanding,
            marketCap: quote.marketCap,
            enterpriseValue: quote.enterpriseValue,
            totalDebt: quote.totalDebt,
            preferredStock: quote.preferredStock,
            btcNAV: quote.btcNAV,
            premium: quote.premium,
          }
        : null;

      const payload = livePoint ? [...data, livePoint] : data;

      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unknown error");
      setInsight(json.insight);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate insight.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">AI-Generated Insight</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Powered by Claude (Anthropic)</p>
        </div>
        <button
          onClick={generateInsight}
          disabled={loading || data.length === 0}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              Analyzing…
            </>
          ) : (
            "Generate Insight"
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {insight && (
        <>
          {/* Language tabs */}
          <div className="flex gap-1 mb-4 border-b border-white/10 pb-0">
            <button
              onClick={() => setTab("en")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                tab === "en"
                  ? "bg-amber-500/15 text-amber-400 border border-white/10 border-b-transparent -mb-px"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setTab("zh")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                tab === "zh"
                  ? "bg-amber-500/15 text-amber-400 border border-white/10 border-b-transparent -mb-px"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              繁體中文
            </button>
          </div>

          <div className="mt-2">
            {tab === "en" && <InsightText text={insight.en} />}
            {tab === "zh" && (
              insight.zh
                ? <InsightText text={insight.zh} />
                : <p className="text-sm text-zinc-500">中文版本無法產生，請重試。</p>
            )}
          </div>
        </>
      )}

      {!insight && !error && !loading && (
        <p className="text-sm text-zinc-600">
          Click &ldquo;Generate Insight&rdquo; to get an AI-powered analysis in both English and Traditional Chinese.
        </p>
      )}
    </div>
  );
}

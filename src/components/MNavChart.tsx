"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { MNavDataPoint } from "@/lib/mnav";

interface MNavChartProps {
  data: MNavDataPoint[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatK(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/95 p-3 text-xs shadow-xl backdrop-blur">
      <p className="font-semibold text-zinc-300 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="tabular-nums text-white font-medium">
            {p.name === "mNAV" || p.name === "NAV Premium"
              ? p.value.toFixed(3) + "×"
              : p.name === "BTC Price"
              ? formatK(p.value)
              : p.name === "MSTR Price"
              ? `$${p.value.toFixed(2)}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MNavChart({ data }: MNavChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-zinc-500 text-sm">
        No data for the selected range.
      </div>
    );
  }

  const maxPoints = 500;
  const step = Math.max(1, Math.floor(data.length / maxPoints));
  const chartData = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d) => ({
      date: formatDate(d.date),
      rawDate: d.date,
      mNAV: d.mNAV,
      "NAV Premium": d.navPremium,
      "BTC Price": d.btcPrice,
    }));

  return (
    <ResponsiveContainer width="100%" height={420}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          interval="preserveStartEnd"
        />
        {/* Left axis: mNAV & NAV Premium */}
        <YAxis
          yAxisId="mnav"
          orientation="left"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v.toFixed(1)}×`}
          domain={["auto", "auto"]}
          width={48}
        />
        {/* Right axis: BTC price */}
        <YAxis
          yAxisId="btc"
          orientation="right"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatK}
          domain={["auto", "auto"]}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12, paddingTop: 12 }} />
        {/* Fair value reference line */}
        <ReferenceLine
          yAxisId="mnav"
          y={1}
          stroke="rgba(255,255,255,0.2)"
          strokeDasharray="6 3"
          label={{ value: "Fair Value", fill: "#52525b", fontSize: 10, position: "insideTopLeft" }}
        />
        {/* mNAV = Enterprise Value / BTC NAV */}
        <Line
          yAxisId="mnav"
          type="monotone"
          dataKey="mNAV"
          name="mNAV"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#f59e0b" }}
        />
        {/* NAV Premium = Market Cap / BTC NAV */}
        <Line
          yAxisId="mnav"
          type="monotone"
          dataKey="NAV Premium"
          name="NAV Premium"
          stroke="#a78bfa"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: "#a78bfa" }}
          strokeDasharray="5 3"
        />
        {/* BTC Price */}
        <Line
          yAxisId="btc"
          type="monotone"
          dataKey="BTC Price"
          name="BTC Price"
          stroke="#fb923c"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: "#fb923c" }}
          strokeDasharray="4 2"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

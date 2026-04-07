"use client";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  loading?: boolean;
}

const PRESETS = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
  { label: "2Y", months: 24 },
  { label: "All", months: 56 }, // since Aug 2020
];

export function DateRangePicker({ from, to, onChange, loading }: DateRangePickerProps) {
  function applyPreset(months: number) {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    // Clamp to earliest possible date
    const earliest = new Date("2020-08-11");
    if (start < earliest) start.setTime(earliest.getTime());
    onChange(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => applyPreset(p.months)}
          disabled={loading}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-40"
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-2 ml-2">
        <input
          type="date"
          value={from}
          min="2020-08-11"
          max={to}
          onChange={(e) => onChange(e.target.value, to)}
          disabled={loading}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40 [color-scheme:dark]"
        />
        <span className="text-zinc-500 text-sm">to</span>
        <input
          type="date"
          value={to}
          min={from}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => onChange(from, e.target.value)}
          disabled={loading}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40 [color-scheme:dark]"
        />
      </div>
      {loading && (
        <span className="text-xs text-zinc-500 animate-pulse">Loading…</span>
      )}
    </div>
  );
}

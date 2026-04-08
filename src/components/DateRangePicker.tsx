"use client";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  loading?: boolean;
}

const PRESETS = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
  { label: "2Y", days: 730 },
  { label: "All", days: 365 * 6 }, // since Aug 2020
];

export function DateRangePicker({ from, to, onChange, loading }: DateRangePickerProps) {
  function applyPreset(days: number) {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const earliest = new Date("2020-08-11");
    if (start < earliest) start.setTime(earliest.getTime());
    onChange(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => applyPreset(p.days)}
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

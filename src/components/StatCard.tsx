interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: "green" | "yellow" | "red" | "blue" | "none";
}

export function StatCard({ label, value, sub, highlight = "none" }: StatCardProps) {
  const colours: Record<string, string> = {
    green: "text-emerald-400",
    yellow: "text-amber-400",
    red: "text-rose-400",
    blue: "text-sky-400",
    none: "text-white",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-4 flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      <span className={`text-2xl font-bold tabular-nums ${colours[highlight]}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  );
}

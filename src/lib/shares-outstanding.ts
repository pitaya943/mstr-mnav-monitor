/**
 * MSTR (Strategy Inc) split-adjusted shares outstanding by quarter-end.
 *
 * Strategy has two common share classes:
 *  - Class A: the main publicly traded shares (Yahoo Finance sharesOutstanding)
 *  - Class B: ~19,640,250 shares held by Michael Saylor (super-voting, same economic value)
 *
 * Yahoo Finance's `marketCap` includes BOTH classes, but `sharesOutstanding` only
 * counts Class A. To match the official mNAV figure we must add CLASS_B_SHARES.
 *
 * Class B is Saylor's founder stake: ~1,964,025 pre-split × 10 (2024-08-07 split) = 19,640,250.
 * It has remained essentially constant since the company's founding.
 *
 * All Class A values are post-split-equivalent (consistent with Yahoo Finance
 * split-adjusted historical close prices).
 *
 * Sources:
 *  - 2024-12-31, 2025-03-31 Class A: Yahoo Finance fundamentalsTimeSeries (confirmed)
 *  - 2026-04-07 Class A: Yahoo Finance quote.sharesOutstanding (confirmed)
 *  - Class B: SEC 10-K cover page (confirmed 19,640,250 post-split)
 *  - Pre-2024 Q3 Class A: SEC 10-Q/10-K filings × 10 split factor + estimates
 */

/** Saylor's Class B shares — constant, post-split. Confirmed from SEC 10-K cover. */
export const CLASS_B_SHARES = 19_640_250;

interface SharesEntry {
  date: string; // YYYY-MM-DD (quarter-end or known date)
  classA: number; // Class A split-adjusted shares outstanding
}

// Class A only — CLASS_B_SHARES is added automatically in getMstrSharesOnDate
const MSTR_SHARES_TIMELINE: SharesEntry[] = [
  { date: "2020-06-30", classA:  90_000_000 }, // ~9.0M pre-split × 10
  { date: "2020-09-30", classA:  95_000_000 }, // ~9.5M × 10
  { date: "2020-12-31", classA:  98_000_000 }, // ~9.8M × 10
  { date: "2021-03-31", classA: 104_000_000 }, // ~10.4M × 10 (Feb $1B BTC purchase)
  { date: "2021-06-30", classA: 108_000_000 },
  { date: "2021-09-30", classA: 109_000_000 },
  { date: "2021-12-31", classA: 110_000_000 },
  { date: "2022-03-31", classA: 111_000_000 },
  { date: "2022-06-30", classA: 111_000_000 }, // bear market – minimal issuances
  { date: "2022-09-30", classA: 111_000_000 },
  { date: "2022-12-31", classA: 111_000_000 },
  { date: "2023-03-31", classA: 112_000_000 },
  { date: "2023-06-30", classA: 124_000_000 }, // resumed ATM
  { date: "2023-09-30", classA: 130_000_000 },
  { date: "2023-12-31", classA: 145_000_000 },
  { date: "2024-03-31", classA: 171_000_000 }, // aggressive ATM
  { date: "2024-06-30", classA: 176_762_250 }, // 19,640,250 pre-split × 10 − CLASS_B = 176.8M Class A
  { date: "2024-09-30", classA: 194_000_000 }, // post-split + ATM (estimate)
  { date: "2024-12-31", classA: 245_778_498 }, // confirmed – Yahoo Finance fundamentals
  { date: "2025-03-31", classA: 266_177_509 }, // confirmed – Yahoo Finance fundamentals
  { date: "2025-06-30", classA: 290_000_000 }, // estimate
  { date: "2025-09-30", classA: 310_000_000 }, // estimate
  { date: "2025-12-31", classA: 320_000_000 }, // estimate
  { date: "2026-04-07", classA: 325_954_147 }, // confirmed – Yahoo Finance quote
];

/**
 * Returns total split-adjusted shares (Class A + Class B) for a given date,
 * using linear interpolation between quarterly Class A entries.
 * Before the first entry → uses first entry value.
 * After the last entry → uses last entry value.
 */
export function getMstrSharesOnDate(dateStr: string): number {
  const n = MSTR_SHARES_TIMELINE.length;

  let classA: number;
  if (dateStr <= MSTR_SHARES_TIMELINE[0].date) {
    classA = MSTR_SHARES_TIMELINE[0].classA;
  } else if (dateStr >= MSTR_SHARES_TIMELINE[n - 1].date) {
    classA = MSTR_SHARES_TIMELINE[n - 1].classA;
  } else {
    classA = MSTR_SHARES_TIMELINE[n - 1].classA; // fallback
    for (let i = 1; i < n; i++) {
      const prev = MSTR_SHARES_TIMELINE[i - 1];
      const next = MSTR_SHARES_TIMELINE[i];
      if (dateStr >= prev.date && dateStr <= next.date) {
        const t0 = new Date(prev.date).getTime();
        const t1 = new Date(next.date).getTime();
        const t = new Date(dateStr).getTime();
        const ratio = (t - t0) / (t1 - t0);
        classA = Math.round(prev.classA + ratio * (next.classA - prev.classA));
        break;
      }
    }
  }

  return classA + CLASS_B_SHARES;
}

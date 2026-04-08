/**
 * MSTR (Strategy Inc) quarterly total debt and preferred stock.
 *
 * mNAV = Enterprise Value / BTC NAV
 * Enterprise Value = Market Cap + Total Debt + Preferred Stock
 *
 * Sources (all confirmed from SEC filings):
 *  - LongTermDebt (2021-2025): SEC EDGAR XBRL companyfacts API
 *  - totalDebt / preferredStockEquity (2024-12-31 onward): Yahoo Finance fundamentalsTimeSeries
 *  - 2020-12-31 estimate: $650M from first convertible note issuance (Dec 2020, public record)
 *  - Current totalDebt: Yahoo Finance financialData (refreshed quarterly)
 */

interface DebtEntry {
  date: string;          // YYYY-MM-DD (quarter-end)
  totalDebt: number;     // Long-term debt + current debt (USD)
  preferredStock: number; // Preferred stock equity/liquidation value (USD)
}

// prettier-ignore
const MSTR_DEBT_TIMELINE: DebtEntry[] = [
  { date: "2020-08-11", totalDebt:              0, preferredStock:            0 }, // first BTC purchase, no debt
  { date: "2020-12-31", totalDebt:    650_000_000, preferredStock:            0 }, // $650M 0.75% convertible notes (est.)
  { date: "2021-03-31", totalDebt:  1_724_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2021-06-30", totalDebt:  2_151_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2021-09-30", totalDebt:  2_153_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2021-12-31", totalDebt:  2_155_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2022-03-31", totalDebt:  2_362_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2022-06-30", totalDebt:  2_375_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2022-09-30", totalDebt:  2_377_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2022-12-31", totalDebt:  2_379_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2023-03-31", totalDebt:  2_176_000_000, preferredStock:            0 }, // SEC EDGAR confirmed (partial repurchase)
  { date: "2023-06-30", totalDebt:  2_178_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2023-09-30", totalDebt:  2_180_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2023-12-31", totalDebt:  2_183_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2024-03-31", totalDebt:  3_559_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2024-06-30", totalDebt:  3_849_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2024-09-30", totalDebt:  4_212_000_000, preferredStock:            0 }, // SEC EDGAR confirmed
  { date: "2024-12-31", totalDebt:  7_248_078_000, preferredStock:            0 }, // Yahoo Finance confirmed
  { date: "2025-03-31", totalDebt:  8_194_372_000, preferredStock:  1_304_497_000 }, // Yahoo Finance confirmed
  { date: "2025-06-30", totalDebt:  8_213_848_000, preferredStock:  2_893_921_000 }, // Yahoo Finance confirmed
  { date: "2025-09-30", totalDebt:  8_222_065_000, preferredStock:  5_786_330_000 }, // Yahoo Finance confirmed
  { date: "2025-12-31", totalDebt:  8_236_290_000, preferredStock:  6_919_514_000 }, // Yahoo Finance confirmed
];

interface DebtSnapshot {
  totalDebt: number;
  preferredStock: number;
}

/**
 * Returns linearly-interpolated total debt and preferred stock for any date.
 * Before the first entry → returns the first entry values.
 * After the last entry → returns the last entry values.
 */
export function getMstrDebtOnDate(dateStr: string): DebtSnapshot {
  const n = MSTR_DEBT_TIMELINE.length;

  if (dateStr <= MSTR_DEBT_TIMELINE[0].date) {
    return { totalDebt: MSTR_DEBT_TIMELINE[0].totalDebt, preferredStock: MSTR_DEBT_TIMELINE[0].preferredStock };
  }
  if (dateStr >= MSTR_DEBT_TIMELINE[n - 1].date) {
    return { totalDebt: MSTR_DEBT_TIMELINE[n - 1].totalDebt, preferredStock: MSTR_DEBT_TIMELINE[n - 1].preferredStock };
  }

  for (let i = 1; i < n; i++) {
    const prev = MSTR_DEBT_TIMELINE[i - 1];
    const next = MSTR_DEBT_TIMELINE[i];
    if (dateStr >= prev.date && dateStr <= next.date) {
      const t0 = new Date(prev.date).getTime();
      const t1 = new Date(next.date).getTime();
      const t  = new Date(dateStr).getTime();
      const r  = (t - t0) / (t1 - t0);
      return {
        totalDebt:      Math.round(prev.totalDebt      + r * (next.totalDebt      - prev.totalDebt)),
        preferredStock: Math.round(prev.preferredStock + r * (next.preferredStock - prev.preferredStock)),
      };
    }
  }

  return { totalDebt: MSTR_DEBT_TIMELINE[n - 1].totalDebt, preferredStock: MSTR_DEBT_TIMELINE[n - 1].preferredStock };
}

// MSTR (Strategy Inc) BTC holdings timeline — all figures from public disclosures / SEC filings
export interface HoldingEntry {
  date: string; // YYYY-MM-DD — the date the purchase was announced/confirmed
  totalBtc: number;
}

// Sorted ascending by date
export const MSTR_HOLDINGS_TIMELINE: HoldingEntry[] = [
  { date: "2020-08-11", totalBtc: 21_454 },
  { date: "2020-09-14", totalBtc: 38_250 },
  { date: "2020-12-04", totalBtc: 40_824 },
  { date: "2020-12-21", totalBtc: 70_470 },
  { date: "2021-01-22", totalBtc: 71_079 },
  { date: "2021-02-24", totalBtc: 90_531 },
  { date: "2021-03-01", totalBtc: 91_064 },
  { date: "2021-03-12", totalBtc: 91_326 },
  { date: "2021-04-05", totalBtc: 91_579 },
  { date: "2021-05-13", totalBtc: 92_079 },
  { date: "2021-08-23", totalBtc: 108_992 },
  { date: "2021-09-13", totalBtc: 114_042 },
  { date: "2021-11-01", totalBtc: 121_044 },
  { date: "2021-12-09", totalBtc: 122_478 },
  { date: "2021-12-30", totalBtc: 124_391 },
  { date: "2022-01-31", totalBtc: 125_051 },
  { date: "2022-04-05", totalBtc: 129_218 },
  { date: "2022-06-15", totalBtc: 129_699 },
  { date: "2022-12-28", totalBtc: 132_500 },
  { date: "2023-03-23", totalBtc: 138_955 },
  { date: "2023-06-28", totalBtc: 152_333 },
  { date: "2023-07-25", totalBtc: 152_800 },
  { date: "2023-09-24", totalBtc: 158_400 },
  { date: "2023-11-29", totalBtc: 174_530 },
  { date: "2023-12-27", totalBtc: 189_150 },
  { date: "2024-02-06", totalBtc: 190_000 },
  { date: "2024-02-26", totalBtc: 193_000 },
  { date: "2024-03-11", totalBtc: 205_000 },
  { date: "2024-03-19", totalBtc: 214_246 },
  { date: "2024-06-20", totalBtc: 226_331 },
  { date: "2024-09-13", totalBtc: 244_800 },
  { date: "2024-09-20", totalBtc: 252_220 },
  { date: "2024-11-11", totalBtc: 279_420 },
  { date: "2024-11-18", totalBtc: 331_200 },
  { date: "2024-11-25", totalBtc: 386_700 },
  { date: "2024-12-02", totalBtc: 402_100 },
  { date: "2024-12-09", totalBtc: 423_650 },
  { date: "2024-12-16", totalBtc: 439_000 },
  { date: "2024-12-23", totalBtc: 444_262 },
  { date: "2024-12-30", totalBtc: 447_470 },
  { date: "2025-01-13", totalBtc: 461_000 },
  { date: "2025-01-27", totalBtc: 471_107 },
  { date: "2025-02-10", totalBtc: 478_740 },
  { date: "2025-02-24", totalBtc: 499_226 },
  { date: "2025-03-10", totalBtc: 506_137 },
  { date: "2025-03-24", totalBtc: 528_185 },
  // 2025 Q2–Q4 and 2026 — sourced from SEC EDGAR 8-K filings
  { date: "2025-04-14", totalBtc: 531_644 },
  { date: "2025-04-21", totalBtc: 538_200 },
  { date: "2025-04-28", totalBtc: 553_555 },
  { date: "2025-05-05", totalBtc: 555_450 },
  { date: "2025-05-12", totalBtc: 568_840 },
  { date: "2025-05-19", totalBtc: 576_230 },
  { date: "2025-06-02", totalBtc: 580_955 },
  { date: "2025-06-09", totalBtc: 582_000 },
  { date: "2025-06-16", totalBtc: 592_100 },
  { date: "2025-06-23", totalBtc: 592_345 },
  { date: "2025-06-30", totalBtc: 597_325 },
  { date: "2025-07-14", totalBtc: 601_550 },
  { date: "2025-07-21", totalBtc: 607_770 },
  { date: "2025-08-04", totalBtc: 628_791 },
  { date: "2025-08-11", totalBtc: 628_946 },
  { date: "2025-08-18", totalBtc: 629_376 },
  { date: "2025-08-25", totalBtc: 632_457 },
  { date: "2025-09-02", totalBtc: 636_505 },
  { date: "2025-09-08", totalBtc: 638_460 },
  { date: "2025-09-15", totalBtc: 638_985 },
  { date: "2025-09-22", totalBtc: 639_835 },
  { date: "2025-09-29", totalBtc: 640_031 },
  { date: "2025-10-20", totalBtc: 640_418 },
  { date: "2025-10-27", totalBtc: 640_808 },
  { date: "2025-11-03", totalBtc: 641_205 },
  { date: "2025-11-10", totalBtc: 641_692 },
  { date: "2025-11-17", totalBtc: 649_870 },
  { date: "2025-12-01", totalBtc: 650_000 },
  { date: "2025-12-08", totalBtc: 660_624 },
  { date: "2025-12-15", totalBtc: 671_268 },
  { date: "2025-12-29", totalBtc: 672_497 },
  { date: "2026-01-05", totalBtc: 673_783 },
  { date: "2026-01-12", totalBtc: 687_410 },
  { date: "2026-01-20", totalBtc: 709_715 },
  { date: "2026-01-26", totalBtc: 712_647 },
  { date: "2026-02-02", totalBtc: 713_502 },
  { date: "2026-02-09", totalBtc: 714_644 },
  { date: "2026-02-17", totalBtc: 717_131 },
  { date: "2026-02-23", totalBtc: 717_722 },
  { date: "2026-03-02", totalBtc: 720_737 },
  { date: "2026-03-09", totalBtc: 738_731 },
  { date: "2026-03-16", totalBtc: 761_068 },
  { date: "2026-03-23", totalBtc: 762_099 },
  { date: "2026-04-06", totalBtc: 766_970 },
];

/** Returns the total BTC held by MSTR on or before a given date string (YYYY-MM-DD).
 *  Returns 0 if the date is before the first purchase. */
export function getMstrBtcOnDate(dateStr: string): number {
  const target = dateStr;
  let result = 0;
  for (const entry of MSTR_HOLDINGS_TIMELINE) {
    if (entry.date <= target) {
      result = entry.totalBtc;
    } else {
      break;
    }
  }
  return result;
}

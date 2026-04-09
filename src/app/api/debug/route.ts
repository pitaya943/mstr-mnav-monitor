import { computeMNavSeries } from "@/lib/mnav";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Test 1: short range (same as before — known working)
  try {
    const data = await computeMNavSeries("2026-03-01", "2026-04-07");
    results.shortRange = { ok: true, rows: data.length };
  } catch (e) {
    results.shortRange = { ok: false, error: String(e) };
  }

  // Test 2: yesterday's date (same clamp the mnav route applies)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  results.yesterday = yesterday;

  // Test 3: 1-year range (default dashboard range)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const from1Y = oneYearAgo.toISOString().slice(0, 10);
  try {
    const data = await computeMNavSeries(from1Y, yesterday);
    results.oneYearRange = { ok: true, rows: data.length, from: from1Y, to: yesterday };
  } catch (e) {
    results.oneYearRange = { ok: false, error: String(e), from: from1Y, to: yesterday };
  }

  // Test 4: full range (All — since Aug 2020)
  try {
    const data = await computeMNavSeries("2020-08-11", yesterday);
    results.fullRange = { ok: true, rows: data.length };
  } catch (e) {
    results.fullRange = { ok: false, error: String(e) };
  }

  return Response.json(results);
}

import { NextRequest } from "next/server";
import { computeMNavSeries } from "@/lib/mnav";

// Cache historical data for 24 hours — past closing prices never change.
// The `to` date is always clamped to yesterday so the cache key is stable.
export const revalidate = 86400;

function defaultFrom() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from") ?? defaultFrom();
  const rawTo = searchParams.get("to") ?? new Date().toISOString().slice(0, 10);

  // Basic validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(rawTo)) {
    return Response.json(
      { error: "Invalid date format. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  // Clamp to to yesterday — today's data is served by /api/quote (live)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const to = rawTo > yesterday ? yesterday : rawTo;

  if (from > to) {
    return Response.json(
      { error: "from must be before to." },
      { status: 400 }
    );
  }

  try {
    const data = await computeMNavSeries(from, to);
    return Response.json({ data, from, to });
  } catch (err) {
    console.error("mNAV API error:", err);
    return Response.json(
      { error: "Failed to fetch data. Please try again." },
      { status: 500 }
    );
  }
}

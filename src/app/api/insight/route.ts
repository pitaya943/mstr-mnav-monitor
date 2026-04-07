import { NextRequest } from "next/server";
import { generateMNavInsight } from "@/lib/anthropic";
import type { MNavDataPoint } from "@/lib/mnav";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 503 }
    );
  }

  let data: MNavDataPoint[];
  try {
    const body = await request.json();
    data = body.data ?? [];
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (data.length === 0) {
    return Response.json({ error: "No data provided." }, { status: 400 });
  }

  // Only send last 90 days max to keep token usage reasonable
  const slice = data.slice(-90);

  try {
    const insight = await generateMNavInsight(slice);
    return Response.json({ insight });
  } catch (err) {
    console.error("Insight API error:", err);
    return Response.json(
      { error: "Failed to generate insight. Please try again." },
      { status: 500 }
    );
  }
}

import Anthropic from "@anthropic-ai/sdk";
import type { MNavDataPoint } from "./mnav";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface BilingualInsight {
  en: string;
  zh: string;
}

export async function generateMNavInsight(
  data: MNavDataPoint[]
): Promise<BilingualInsight> {
  if (data.length === 0) {
    return {
      en: "No data available for analysis.",
      zh: "目前沒有可供分析的資料。",
    };
  }

  const latest = data[data.length - 1];
  const oldest = data[0];
  const maxMNav = Math.max(...data.map((d) => d.mNAV));
  const minMNav = Math.min(...data.map((d) => d.mNAV));
  const avgMNav =
    Math.round((data.reduce((s, d) => s + d.mNAV, 0) / data.length) * 1000) /
    1000;

  const summary = {
    period: `${oldest.date} to ${latest.date}`,
    currentMNav: latest.mNAV,
    currentNavPremium: latest.navPremium,
    currentPremiumPct: latest.premium,
    currentBtcPrice: latest.btcPrice,
    currentMstrPrice: latest.mstrPrice,
    btcHoldings: latest.btcHoldings,
    marketCapBillions: latest.marketCap,
    enterpriseValueBillions: latest.enterpriseValue,
    totalDebtBillions: latest.totalDebt,
    preferredStockBillions: latest.preferredStock,
    btcNAVBillions: latest.btcNAV,
    maxMNav,
    minMNav,
    avgMNav,
    dataPoints: data.length,
  };

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `You are a financial analyst specializing in Bitcoin treasury companies (DAT.co — Digital Asset Treasury companies). Analyze the following mNAV (Modified Net Asset Value) data for MicroStrategy (MSTR, now Strategy Inc).

Two key indicators:
- mNAV = Enterprise Value / BTC NAV, where Enterprise Value = Market Cap + Total Debt + Preferred Stock. Measures the total claim on the firm relative to its BTC treasury.
- NAV Premium = Market Cap / BTC NAV. Equity-only ratio. Both > 1 mean premium; < 1 means discount.

Data summary:
${JSON.stringify(summary, null, 2)}

Provide your analysis in BOTH languages, using EXACTLY this format (do not deviate):

[EN]
(3-4 paragraphs in English covering: current valuation premium/discount, notable trends, BTC price vs mNAV relationship, key risks or opportunities)

[ZH]
（3-4段繁體中文，涵蓋：當前溢價或折價狀況、趨勢變化、BTC價格與mNAV的關係、主要風險或機會）`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock?.text ?? "";

  // Parse [EN] and [ZH] sections
  const enMatch = raw.match(/\[EN\]\s*([\s\S]*?)(?=\[ZH\]|$)/);
  const zhMatch = raw.match(/\[ZH\]\s*([\s\S]*?)$/);

  return {
    en: enMatch?.[1]?.trim() ?? raw,
    zh: zhMatch?.[1]?.trim() ?? "",
  };
}

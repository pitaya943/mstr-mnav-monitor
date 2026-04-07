# MSTR mNAV Monitor

A web-based financial dashboard that tracks **mNAV (Modified Net Asset Value)** for MicroStrategy (MSTR / Strategy Inc) — a key DAT.co (Digital Asset Treasury company) indicator.

**Live Demo:** [mstr-mnav-monitor-production.up.railway.app](https://mstr-mnav-monitor-production.up.railway.app)

---

## What is mNAV?

**mNAV = Market Cap / (BTC Holdings × BTC Price)**

| mNAV | Interpretation |
|------|---------------|
| = 1.0 | Stock trades exactly at its Bitcoin NAV (fair value) |
| > 1.0 | Market pays a premium — leveraged BTC exposure, brand, capital-raising ability |
| < 1.0 | Stock trades at a discount to BTC holdings (rare, historically signals distress) |

Historically MSTR has traded at mNAV of **1.3×–3.5×** during bull markets and dipped below 1.0× in the 2022 bear market.

### Relationship with Bitcoin

mNAV and BTC price exhibit an inverse dynamic during rapid moves:

- **BTC rallies fast** → NAV denominator rises faster than the stock re-rates → mNAV **compresses**
- **BTC drawdowns** → stock sentiment lags the NAV decline → mNAV **spikes**
- **High mNAV (>2×)** → historically signals elevated risk and potential mean-reversion

---

## Features

- **Real-time stat cards** — BTC price, MSTR price, mNAV, market cap auto-refresh every 5 minutes
- **Historical chart** — mNAV vs BTC price overlay from August 2020 (first BTC purchase) to present
- **Date range selector** — 3M / 6M / 1Y / 2Y / All presets + custom date picker
- **Live/Market-closed indicator** — NYSE hours aware (Mon–Fri 9:30–16:00 ET)
- **Seconds-ago ticker** — shows how recently the live data was fetched
- **AI-generated insight** — bilingual analysis (English + Traditional Chinese) powered by Claude
- **Accurate share count** — Class A (Yahoo Finance) + Class B (Saylor's founder shares, ~19.64M) correction
- **SEC EDGAR sourced BTC holdings** — parsed directly from 8-K filings, updated through April 2026

---

## Data Sources

| Data | Source |
|------|--------|
| BTC price history | Yahoo Finance (`BTC-USD`) |
| MSTR stock history | Yahoo Finance (`MSTR`) |
| MSTR BTC holdings | SEC EDGAR 8-K filings (hardcoded timeline) |
| MSTR shares outstanding | Yahoo Finance quote + SEC 10-K (Class A + Class B) |
| AI insight | Anthropic Claude API |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts v3
- **Data:** yahoo-finance2 v3
- **AI:** @anthropic-ai/sdk
- **Deployment:** Railway

---

## Local Development

```bash
# Clone
git clone https://github.com/pitaya943/mstr-mnav-monitor.git
cd mstr-mnav-monitor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Optional | Enables AI insight feature. Get one at [console.anthropic.com](https://console.anthropic.com) |

> Without `ANTHROPIC_API_KEY`, the dashboard works fully except the "Generate Insight" button is disabled.

---

## API Endpoints

### `GET /api/quote`
Returns real-time mNAV and prices. Cached 5 minutes server-side.

```json
{
  "btcPrice": 68491,
  "mstrPrice": 127.69,
  "mNAV": 0.840,
  "marketCap": 44.13,
  "btcNAV": 52.53,
  "premium": -16.0,
  "btcHoldings": 766970,
  "sharesOutstanding": 345594397,
  "fetchedAt": "2026-04-07T10:00:00.000Z",
  "isMarketOpen": false
}
```

### `GET /api/mnav?from=YYYY-MM-DD&to=YYYY-MM-DD`
Returns historical daily mNAV series. Cached 24 hours server-side. `to` is automatically clamped to yesterday (today's data served by `/api/quote`).

### `POST /api/insight`
Body: `{ "data": MNavDataPoint[] }` — Returns bilingual AI analysis `{ "insight": { "en": "...", "zh": "..." } }`.

---

## Deployment (Railway)

1. Fork this repo
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select this repo
4. Add environment variable:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
5. Railway auto-detects Next.js and deploys. Your app will be live at `*.up.railway.app`.

---

## Assignment Context

This project was built for **NTU Big Data Analytics HW02**.

**Selected Indicator:** mNAV (Modified Net Asset Value)

**Why mNAV?** It directly quantifies the premium investors pay for Bitcoin exposure through a regulated equity vehicle. Unlike simply tracking BTC price, mNAV captures market sentiment, capital structure decisions, and the "leveraged BTC" narrative unique to DAT.co companies.

**BTC Relationship:** mNAV compresses when BTC rallies (denominator grows faster) and expands during BTC drawdowns (sentiment lag). This makes it a useful contrarian signal — extremely high mNAV suggests the equity premium is unsustainable, while mNAV approaching 1.0 historically presented asymmetric upside.

---

## License

MIT

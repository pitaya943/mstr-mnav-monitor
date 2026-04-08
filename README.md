# MSTR mNAV Monitor

A web-based financial dashboard that tracks **mNAV** and **NAV Premium** for MicroStrategy (MSTR / Strategy Inc) — key DAT.co (Digital Asset Treasury company) indicators.

**Live Demo:** [mstr-mnav-monitor-production.up.railway.app](https://mstr-mnav-monitor-production.up.railway.app)

---

## Indicators

### mNAV (Modified Net Asset Value)

```
mNAV = Enterprise Value / BTC NAV

Enterprise Value = Market Cap + Total Debt + Preferred Stock
BTC NAV          = BTC Holdings × BTC Price
```

mNAV measures the **total claim on the firm** (equity + all creditors) relative to its Bitcoin treasury. It reflects both equity sentiment and the company's leveraged capital structure.

### NAV Premium

```
NAV Premium = Market Cap / BTC NAV
```

NAV Premium is the **equity-only** ratio — how much the stock market values the equity versus the underlying BTC.

| Value | Interpretation |
|-------|---------------|
| = 1.0 | Fair value — stock trades at BTC NAV |
| > 1.0 | Premium — market pays extra for leveraged BTC exposure, brand, capital access |
| < 1.0 | Discount — stock trades below BTC holdings value (rare, historically a buy signal) |

### Relationship with Bitcoin

mNAV and BTC price exhibit an inverse dynamic during rapid moves:

- **BTC rallies fast** — NAV denominator rises quicker than the stock re-rates → mNAV **compresses**
- **BTC drawdowns** — stock sentiment lags the NAV decline → mNAV **spikes temporarily**
- **High mNAV (>2×)** — historically signals elevated risk and potential mean-reversion
- **mNAV approaching 1.0** — historically presented asymmetric upside (discount to BTC NAV)

NAV Premium often diverges from mNAV when Strategy issues new convertible notes or preferred stock — the additional liabilities inflate Enterprise Value without changing Market Cap.

---

## Features

- **7 real-time stat cards** — mNAV, NAV Premium, BTC Price, MSTR Price, BTC Holdings, MSTR Market Cap, BTC NAV; auto-refresh every 5 minutes
- **Historical chart** — daily mNAV, NAV Premium, and BTC Price overlay from August 2020 to present
- **Date range presets** — 1M / 3M / 6M / 1Y / 2Y / All + custom date picker
- **Daily hover tooltip** — exact date + all three metrics on every data point
- **Live / Market-closed indicator** — NYSE hours aware (Mon–Fri 9:30–16:00 ET, DST-corrected)
- **Seconds-ago ticker** — shows how recently the live data was fetched
- **AI-generated insight** — bilingual analysis (English + Traditional Chinese) powered by Claude claude-opus-4-6
- **Accurate share count** — Class A (Yahoo Finance) + Class B (Saylor's 19,640,250 founder shares)
- **Full capital structure** — historical debt and preferred stock from SEC EDGAR, linearly interpolated between quarters

---

## Data Sources

| Data | Source | Update Frequency |
|------|--------|-----------------|
| BTC price (live) | Yahoo Finance `quote("BTC-USD")` | Every 5 min |
| MSTR price (live) | Yahoo Finance `quote("MSTR")` | Every 5 min |
| Total debt (live) | Yahoo Finance `financialData.totalDebt` | Every 5 min |
| Class A shares outstanding | Yahoo Finance `quote.sharesOutstanding` | Every 5 min |
| BTC price history | Yahoo Finance `historical("BTC-USD")` | Daily (24h cache) |
| MSTR stock history | Yahoo Finance `historical("MSTR")` | Daily (24h cache) |
| BTC holdings timeline | SEC EDGAR 8-K filings (hardcoded) | Manual (per purchase) |
| Historical total debt | SEC EDGAR XBRL + Yahoo Finance fundamentalsTimeSeries (hardcoded quarterly) | Manual (per quarter) |
| Historical preferred stock | SEC EDGAR XBRL + Yahoo Finance fundamentalsTimeSeries (hardcoded quarterly) | Manual (per quarter) |
| Class A shares history | Yahoo Finance fundamentalsTimeSeries (hardcoded quarterly) | Manual (per quarter) |
| Class B shares | SEC 10-K cover page (constant: 19,640,250) | Fixed |
| AI insight text | Anthropic Claude API (`claude-opus-4-6`) | On demand |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts v3
- **Data:** yahoo-finance2 v3 (server-side only)
- **AI:** @anthropic-ai/sdk
- **Deployment:** Railway (Node.js 20)

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

Without `ANTHROPIC_API_KEY` the dashboard works fully except the "Generate Insight" button is disabled.

---

## API Endpoints

### `GET /api/quote`
Returns real-time mNAV, NAV Premium, and prices. Cached 5 minutes server-side.

```json
{
  "btcPrice": 75100,
  "mstrPrice": 321.50,
  "mNAV": 1.050,
  "navPremium": 0.775,
  "marketCap": 111.10,
  "enterpriseValue": 126.32,
  "totalDebt": 8.24,
  "preferredStock": 6.92,
  "btcNAV": 57.60,
  "premium": -22.5,
  "btcHoldings": 766970,
  "sharesOutstanding": 345594397,
  "fetchedAt": "2026-04-08T10:00:00.000Z",
  "isMarketOpen": true
}
```

All monetary values in billions USD except `btcPrice` (USD) and `mstrPrice` (USD).

### `GET /api/mnav?from=YYYY-MM-DD&to=YYYY-MM-DD`
Returns historical daily mNAV series. Cached 24 hours server-side. `to` is automatically clamped to yesterday — today's live data is served by `/api/quote`.

```json
{
  "data": [
    {
      "date": "2026-04-06",
      "mNAV": 1.043,
      "navPremium": 0.769,
      "btcPrice": 75250,
      "mstrPrice": 318.20,
      "btcHoldings": 766970,
      "sharesOutstanding": 345594397,
      "marketCap": 110.0,
      "enterpriseValue": 125.2,
      "totalDebt": 8.24,
      "preferredStock": 6.92,
      "btcNAV": 57.71,
      "premium": -23.1
    }
  ],
  "from": "2025-04-08",
  "to": "2026-04-07"
}
```

### `POST /api/insight`
Body: `{ "data": MNavDataPoint[] }` — Returns bilingual AI analysis.

```json
{
  "insight": {
    "en": "As of April 8, 2026...",
    "zh": "截至2026年4月8日..."
  }
}
```

---

## Deployment (Railway)

1. Fork this repo
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select this repo
4. Add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`
5. Railway auto-detects Next.js via `nixpacks.toml` (Node.js 20) and deploys

---

## License

MIT

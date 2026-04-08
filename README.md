# MSTR mNAV Monitor

A web-based financial dashboard tracking **mNAV** and **NAV Premium** for MicroStrategy (MSTR / Strategy Inc) — key DAT.co (Digital Asset Treasury company) indicators.

追蹤 MicroStrategy（MSTR / Strategy Inc）**mNAV** 與 **NAV Premium** 的金融儀表板——DAT.co（數位資產儲備公司）核心指標。

**Live Demo / 線上展示:** [mstr-mnav-monitor-production.up.railway.app](https://mstr-mnav-monitor-production.up.railway.app)

---

## Indicators / 指標說明

### mNAV (Modified Net Asset Value / 修正後淨資產價值)

```
mNAV = Enterprise Value / BTC NAV
     = (Market Cap + Total Debt + Preferred Stock) / (BTC Holdings × BTC Price)

mNAV = 企業價值 / BTC NAV
     = (股票市值 + 總負債 + 優先股) / (BTC 持倉量 × BTC 價格)
```

mNAV measures the total premium ALL claimants (equity + debt + preferred) pay relative to the company's Bitcoin treasury.

mNAV 衡量所有請求方（股東 + 債主 + 優先股持有人）相對於比特幣持倉所支付的總溢價。

### NAV Premium (equity-only ratio / 股權溢價比)

```
NAV Premium = Market Cap / BTC NAV
NAV Premium = 股票市值 / BTC NAV
```

| Value / 數值 | English | 中文 |
|------|---------|------|
| = 1.0 | Fair value — stock trades at BTC NAV | 公平價值 — 股票等值於 BTC NAV |
| > 1.0 | Premium — market pays extra for leveraged BTC exposure | 溢價 — 市場為槓桿 BTC 曝險多付錢 |
| < 1.0 | Discount — stock is cheaper than BTC holdings value | 折價 — 股票比持有等值 BTC 更便宜 |

---

## Features / 功能

| Feature | 功能 |
|---------|------|
| 7 real-time stat cards, auto-refresh every 5 min | 7 張即時 stat card，每 5 分鐘自動更新 |
| Historical daily chart — mNAV, NAV Premium, BTC Price overlay | 日線歷史圖表 — mNAV、NAV Premium、BTC 價格疊加 |
| Date range presets: 1M / 3M / 6M / 1Y / 2Y / All + custom picker | 快速切換區間：1M / 3M / 6M / 1Y / 2Y / All + 自訂日期 |
| Daily hover tooltip with exact date and all three metrics | 每日精確 hover tooltip，顯示當日 mNAV、NAV Premium、BTC 價格 |
| NYSE market hours indicator (DST-aware) | NYSE 交易時間指示燈（DST 夏令時修正） |
| Seconds-ago ticker | 顯示上次更新距今秒數 |
| AI bilingual analysis (EN + ZH) powered by Claude | Claude 驅動的雙語 AI 分析（英文 + 繁體中文） |
| Class A + Class B share count correction | Class A + Class B 股數修正（含 Saylor 創辦人股份） |
| Full capital structure: debt + preferred stock from SEC EDGAR | 完整資本結構：SEC EDGAR 負債與優先股資料 |

---

## Data Sources / 資料來源

| Data / 資料 | Source / 來源 | Update / 更新頻率 |
|-------------|--------------|-----------------|
| BTC price (live) / BTC 即時價格 | Yahoo Finance `quote("BTC-USD")` | Every 5 min / 每 5 分鐘 |
| MSTR price (live) / MSTR 即時股價 | Yahoo Finance `quote("MSTR")` | Every 5 min / 每 5 分鐘 |
| Total debt (live) / 即時總負債 | Yahoo Finance `financialData.totalDebt` | Every 5 min / 每 5 分鐘 |
| Class A shares / A 類股數 | Yahoo Finance `quote.sharesOutstanding` | Every 5 min / 每 5 分鐘 |
| BTC price history / BTC 歷史價格 | Yahoo Finance `historical("BTC-USD")` | Daily / 每日（24h cache）|
| MSTR stock history / MSTR 歷史股價 | Yahoo Finance `historical("MSTR")` | Daily / 每日（24h cache）|
| BTC holdings timeline / BTC 持倉歷史 | SEC EDGAR 8-K filings (hardcoded) | Manual / 手動（每次購入）|
| Historical debt / 歷史負債 | SEC EDGAR XBRL + Yahoo Finance fundamentalsTimeSeries | Manual / 手動（每季）|
| Historical preferred stock / 歷史優先股 | SEC EDGAR XBRL + Yahoo Finance fundamentalsTimeSeries | Manual / 手動（每季）|
| Class A shares history / A 類歷史股數 | Yahoo Finance fundamentalsTimeSeries | Manual / 手動（每季）|
| Class B shares / B 類股數 | SEC 10-K (constant 19,640,250) | Fixed / 固定常數 |
| AI insight text / AI 分析文字 | Anthropic Claude API (`claude-opus-4-6`) | On demand / 手動觸發 |

---

## Tech Stack / 技術架構

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts v3 |
| Data | yahoo-finance2 v3 (server-side only) |
| AI | @anthropic-ai/sdk |
| Deployment | Railway (Node.js 20) |

---

## Local Development / 本地開發

```bash
# Clone / 克隆
git clone https://github.com/pitaya943/mstr-mnav-monitor.git
cd mstr-mnav-monitor

# Install / 安裝依賴
npm install

# Environment variables / 環境變數
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key
# 編輯 .env.local 並填入 Anthropic API key

# Run / 啟動
npm run dev
```

Open / 開啟 [http://localhost:3000](http://localhost:3000)

### Environment Variables / 環境變數

| Variable | Required | Description / 說明 |
|----------|----------|--------------------|
| `ANTHROPIC_API_KEY` | Optional / 選填 | Enables AI insight. Get one at [console.anthropic.com](https://console.anthropic.com) / 啟用 AI 分析功能 |

Without `ANTHROPIC_API_KEY`, the dashboard works fully except the "Generate Insight" button is disabled.

未設定 `ANTHROPIC_API_KEY` 時，儀表板所有功能正常，僅「Generate Insight」按鈕停用。

---

## API Endpoints / API 端點

### `GET /api/quote`
Real-time mNAV, NAV Premium, and prices. Cached 5 min server-side.
即時 mNAV、NAV Premium 與價格。伺服器端快取 5 分鐘。

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

All monetary values in billions USD except `btcPrice` and `mstrPrice` (USD).
除 `btcPrice` 與 `mstrPrice`（美元）外，所有金額單位為十億美元。

### `GET /api/mnav?from=YYYY-MM-DD&to=YYYY-MM-DD`
Historical daily mNAV series. Cached 24h. `to` clamped to yesterday.
歷史日線 mNAV 序列。快取 24 小時。`to` 自動限制為昨日。

### `POST /api/insight`
Body: `{ "data": MNavDataPoint[] }` → Returns `{ "insight": { "en": "...", "zh": "..." } }`
AI bilingual analysis / AI 雙語分析。

---

## Deployment / 部署（Railway）

1. Fork this repo / Fork 本專案
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select this repo / 選擇本專案
4. Add environment variable / 新增環境變數: `ANTHROPIC_API_KEY=sk-ant-...`
5. Railway auto-detects Next.js via `nixpacks.toml` (Node.js 20) and deploys
   Railway 透過 `nixpacks.toml` 自動偵測 Next.js（Node.js 20）並完成部署

---

## License

MIT

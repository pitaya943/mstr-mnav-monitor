# MSTR mNAV Monitor

A web-based financial dashboard tracking **mNAV** and **NAV Premium** for MicroStrategy (MSTR / Strategy Inc) — key DAT.co (Digital Asset Treasury company) indicators.

**Live Demo:** [mstr-mnav-monitor-production.up.railway.app](https://mstr-mnav-monitor-production.up.railway.app)

---

## Indicators

### mNAV (Modified Net Asset Value)

```
mNAV = Enterprise Value / BTC NAV

Enterprise Value = Market Cap + Total Debt + Preferred Stock
BTC NAV          = BTC Holdings × BTC Price
```

mNAV measures the total premium ALL claimants (equity + debt + preferred) pay relative to the company's Bitcoin treasury.

### NAV Premium (equity-only ratio)

```
NAV Premium = Market Cap / BTC NAV
```

| Value | Interpretation |
|-------|---------------|
| = 1.0 | Fair value — stock trades at BTC NAV |
| > 1.0 | Premium — market pays extra for leveraged BTC exposure |
| < 1.0 | Discount — stock is cheaper than the BTC holdings value |

### Relationship with Bitcoin

mNAV and BTC price exhibit an inverse dynamic during rapid moves:

- **BTC rallies fast** — NAV denominator rises quicker than the stock re-rates → mNAV **compresses**
- **BTC drawdowns** — stock sentiment lags the NAV decline → mNAV **spikes temporarily**
- **High mNAV (>2×)** — historically signals elevated risk and potential mean-reversion
- **mNAV approaching 1.0** — historically presented asymmetric upside

NAV Premium often diverges from mNAV when Strategy issues new convertible notes or preferred stock — the additional liabilities inflate Enterprise Value without changing Market Cap.

---

## Features

- **7 real-time stat cards** — mNAV, NAV Premium, BTC Price, MSTR Price, BTC Holdings, MSTR Market Cap, BTC NAV; auto-refresh every 5 minutes
- **Historical daily chart** — mNAV, NAV Premium, and BTC Price overlay from August 2020 to present
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
| Historical total debt | SEC EDGAR XBRL + Yahoo Finance fundamentalsTimeSeries | Manual (per quarter) |
| Historical preferred stock | SEC EDGAR XBRL + Yahoo Finance fundamentalsTimeSeries | Manual (per quarter) |
| Class A shares history | Yahoo Finance fundamentalsTimeSeries | Manual (per quarter) |
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

Without `ANTHROPIC_API_KEY`, the dashboard works fully except the "Generate Insight" button is disabled.

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

All monetary values in billions USD except `btcPrice` and `mstrPrice` (USD).

### `GET /api/mnav?from=YYYY-MM-DD&to=YYYY-MM-DD`
Returns historical daily mNAV series. Cached 24 hours server-side. `to` is automatically clamped to yesterday.

### `POST /api/insight`
Body: `{ "data": MNavDataPoint[] }` — Returns `{ "insight": { "en": "...", "zh": "..." } }`.

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

---
---

# MSTR mNAV 監控儀表板

追蹤 MicroStrategy（MSTR / Strategy Inc）**mNAV** 與 **NAV Premium** 的金融儀表板——DAT.co（數位資產儲備公司）核心指標。

**線上展示:** [mstr-mnav-monitor-production.up.railway.app](https://mstr-mnav-monitor-production.up.railway.app)

---

## 指標說明

### mNAV（修正後淨資產價值）

```
mNAV = 企業價值 / BTC NAV

企業價值 = 股票市值 + 總負債 + 優先股
BTC NAV  = BTC 持倉量 × BTC 價格
```

mNAV 衡量所有請求方（股東 + 債主 + 優先股持有人）相對於公司比特幣持倉所支付的總溢價。

### NAV Premium（股權溢價比）

```
NAV Premium = 股票市值 / BTC NAV
```

| 數值 | 意義 |
|------|------|
| = 1.0 | 公平價值 — 股票等值於 BTC NAV |
| > 1.0 | 溢價 — 市場為槓桿 BTC 曝險多付錢 |
| < 1.0 | 折價 — 股票比持有等值 BTC 更便宜 |

### 與比特幣的關係

mNAV 與 BTC 價格在急速波動時呈現反向動態：

- **BTC 快速上漲** — BTC NAV 分母成長速度快於股票重新定價 → mNAV **壓縮**
- **BTC 下跌** — 股票情緒滯後於 NAV 下降 → mNAV **暫時跳升**
- **mNAV 高於 2×** — 歷史上代表風險升高、潛在均值回歸
- **mNAV 接近 1.0** — 歷史上代表不對稱的上行機會

當 Strategy 發行新可轉債或優先股時，NAV Premium 與 mNAV 經常背離——新增負債使企業價值上升，但市值未必同步調整。

---

## 功能

- **7 張即時 stat card** — mNAV、NAV Premium、BTC 價格、MSTR 股價、BTC 持倉、MSTR 市值、BTC NAV；每 5 分鐘自動更新
- **日線歷史圖表** — mNAV、NAV Premium、BTC 價格疊加，從 2020 年 8 月至今
- **日期範圍快速切換** — 1M / 3M / 6M / 1Y / 2Y / All + 自訂日期選擇器
- **每日精確 hover tooltip** — 顯示確切日期與三項指標數值
- **NYSE 交易時間指示燈** — 週一至週五 9:30–16:00 ET（夏令時修正）
- **更新距今秒數** — 顯示上次即時資料取得距今秒數
- **AI 雙語分析** — Claude claude-opus-4-6 驅動的英文 + 繁體中文分析
- **精確股數計算** — Class A（Yahoo Finance）+ Class B（Saylor 創辦人股份 19,640,250 股）
- **完整資本結構** — 來自 SEC EDGAR 的歷史負債與優先股資料（季度線性內插）

---

## 資料來源

| 資料 | 來源 | 更新頻率 |
|------|------|---------|
| BTC 即時價格 | Yahoo Finance `quote("BTC-USD")` | 每 5 分鐘 |
| MSTR 即時股價 | Yahoo Finance `quote("MSTR")` | 每 5 分鐘 |
| 即時總負債 | Yahoo Finance `financialData.totalDebt` | 每 5 分鐘 |
| A 類流通股數 | Yahoo Finance `quote.sharesOutstanding` | 每 5 分鐘 |
| BTC 歷史價格 | Yahoo Finance `historical("BTC-USD")` | 每日（24h 快取）|
| MSTR 歷史股價 | Yahoo Finance `historical("MSTR")` | 每日（24h 快取）|
| BTC 持倉歷史 | SEC EDGAR 8-K 公告（硬編碼）| 手動（每次購入）|
| 歷史總負債 | SEC EDGAR XBRL + Yahoo Finance fundamentalsTimeSeries | 手動（每季）|
| 歷史優先股 | SEC EDGAR XBRL + Yahoo Finance fundamentalsTimeSeries | 手動（每季）|
| A 類歷史股數 | Yahoo Finance fundamentalsTimeSeries | 手動（每季）|
| B 類股數 | SEC 10-K（固定常數：19,640,250）| 固定 |
| AI 分析文字 | Anthropic Claude API（`claude-opus-4-6`）| 手動觸發 |

---

## 技術架構

- **框架：** Next.js 16（App Router, Turbopack）
- **語言：** TypeScript
- **樣式：** Tailwind CSS v4
- **圖表：** Recharts v3
- **資料：** yahoo-finance2 v3（僅伺服器端）
- **AI：** @anthropic-ai/sdk
- **部署：** Railway（Node.js 20）

---

## 本地開發

```bash
# 克隆專案
git clone https://github.com/pitaya943/mstr-mnav-monitor.git
cd mstr-mnav-monitor

# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env.local
# 編輯 .env.local 並填入 Anthropic API key

# 啟動開發伺服器
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

### 環境變數

| 變數 | 必填 | 說明 |
|------|------|------|
| `ANTHROPIC_API_KEY` | 選填 | 啟用 AI 分析功能。申請：[console.anthropic.com](https://console.anthropic.com) |

未設定 `ANTHROPIC_API_KEY` 時，儀表板所有功能正常，僅「Generate Insight」按鈕停用。

---

## API 端點

### `GET /api/quote`
返回即時 mNAV、NAV Premium 與價格。伺服器端快取 5 分鐘。

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

除 `btcPrice` 與 `mstrPrice`（美元）外，所有金額單位為十億美元。

### `GET /api/mnav?from=YYYY-MM-DD&to=YYYY-MM-DD`
返回歷史日線 mNAV 序列。快取 24 小時。`to` 自動限制為昨日。

### `POST /api/insight`
Body：`{ "data": MNavDataPoint[] }` — 返回 `{ "insight": { "en": "...", "zh": "..." } }`。

---

## 部署（Railway）

1. Fork 本專案
2. 前往 [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. 選擇本專案
4. 新增環境變數：`ANTHROPIC_API_KEY=sk-ant-...`
5. Railway 透過 `nixpacks.toml` 自動偵測 Next.js（Node.js 20）並完成部署

---

## 授權

MIT

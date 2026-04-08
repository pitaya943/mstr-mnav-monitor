# BDA HW02 Report — MSTR mNAV Monitor
# BDA HW02 報告 — MSTR mNAV 監控儀表板

---

## 1. Selected Indicator / 選擇的指標

### English

This project tracks two closely related indicators for MicroStrategy (MSTR / Strategy Inc), the world's largest publicly traded Bitcoin treasury company:

**mNAV (Modified Net Asset Value)**

```
mNAV = Enterprise Value / BTC NAV

Enterprise Value = Market Cap + Total Debt + Preferred Stock
BTC NAV          = BTC Holdings × BTC Price
```

**NAV Premium (equity-only ratio)**

```
NAV Premium = Market Cap / BTC NAV
```

mNAV measures the total premium the market pays for the company's entire capital structure (equity plus all debt and preferred obligations) relative to its Bitcoin holdings. NAV Premium isolates the equity layer only. Both indicators are central to the DAT.co (Digital Asset Treasury company) analytical framework.

**Why did we choose these indicators?**

1. **Direct Bitcoin linkage.** MSTR's sole business purpose since 2020 is to accumulate Bitcoin. Its enterprise value is almost entirely a function of BTC price and market sentiment around leveraged BTC exposure — making mNAV a uniquely clean indicator to study.

2. **Captures capital structure dynamics.** Unlike a simple price ratio, mNAV incorporates convertible notes, senior secured notes, and preferred stock — all of which Strategy has aggressively issued to fund BTC purchases. This makes mNAV sensitive to both BTC price movements *and* corporate financing decisions, providing richer signal than NAV Premium alone.

3. **Historical extremes provide testable signals.** mNAV has ranged from below 1.0× (2022 bear market) to above 3.5× (2021 bull peak). These extremes have historically preceded mean-reversion, making mNAV a potential contrarian signal for both MSTR equity and BTC sentiment.

4. **Institutional relevance.** mNAV is the primary valuation metric used by institutional Bitcoin treasury analysts when covering Strategy, making it a practically significant indicator rather than an academic construct.

---

### 繁體中文

本專案追蹤全球最大上市比特幣儲備公司 MicroStrategy（MSTR / Strategy Inc）的兩個核心指標：

**mNAV（修正後淨資產價值）**

```
mNAV = 企業價值 / BTC NAV

企業價值 = 股票市值 + 總負債 + 優先股
BTC NAV = BTC 持倉量 × BTC 價格
```

**NAV Premium（股權溢價比）**

```
NAV Premium = 股票市值 / BTC NAV
```

mNAV 衡量市場為公司**完整資本結構**（股權 + 所有債務與優先股義務）相對於其比特幣持倉所支付的總溢價。NAV Premium 則只單獨衡量股權層面的比率。兩者都是 DAT.co（數位資產儲備公司）分析框架的核心指標。

**為何選擇這些指標？**

1. **與 BTC 直接掛鉤。** MSTR 自 2020 年起唯一的商業目的就是持續累積比特幣，其企業價值幾乎完全是 BTC 價格與市場情緒的函數，使 mNAV 成為研究比特幣曝險最乾淨的工具之一。

2. **捕捉資本結構動態。** 不同於簡單的價格比率，mNAV 納入了可轉債、優先擔保債券和優先股——這些都是 Strategy 大量發行以融資購買 BTC 的工具。這使 mNAV 同時對 BTC 價格變動**和**公司融資決策敏感，訊號比單純的 NAV Premium 更豐富。

3. **歷史極值提供可驗證的信號。** mNAV 歷史範圍從低於 1.0×（2022 年熊市）到超過 3.5×（2021 年牛市高峰）。這些極端值歷史上都先於均值回歸，使 mNAV 成為潛在的反向操作信號。

4. **機構層面的實務意義。** mNAV 是機構級比特幣儲備分析師（如 Benchmark、Berenberg）在研究 Strategy 時採用的主要估值指標，具備實務重要性，而非純學術概念。

---

## 2. Relationship with Bitcoin (BTC) / 與比特幣的關係

### English

#### Why is Debt Added, Not Subtracted?

A natural question is: why does mNAV *add* debt to Market Cap instead of subtracting it?

The answer lies in the definition of **Enterprise Value (EV)** — the theoretical total cost to acquire the entire company and take ownership of all its assets (including BTC).

To acquire MSTR and claim its BTC, a buyer must:
1. **Buy all the equity** → pay Market Cap (to shareholders)
2. **Repay all debt** → pay Total Debt + Preferred Stock (to creditors)

Creditors hold a **senior claim** on the company's BTC assets — in liquidation, they are repaid before equity holders. Debt is therefore *added* because it represents additional claimants on the BTC, not a cost already deducted.

```
Total cost to own the BTC = Market Cap + Debt + Preferred
                           = Enterprise Value
```

This is why mNAV and NAV Premium tell different stories:

| Metric | Formula | Measures |
|--------|---------|---------|
| **mNAV** | EV / BTC NAV | What ALL claimants (equity + debt) pay per unit of BTC NAV |
| **NAV Premium** | Market Cap / BTC NAV | What EQUITY HOLDERS alone pay per unit of BTC NAV |

#### Concrete Example (as of April 2026)

```
BTC NAV          = $57.6B
Market Cap       = $44.6B  →  NAV Premium = 0.77×  (equity at a discount)
Total Debt       = $8.2B
Preferred Stock  = $6.9B
Enterprise Value = $59.7B  →  mNAV = 1.04×  (total claims at a premium)
```

NAV Premium below 1 means equity investors buy BTC exposure at a discount. Yet mNAV above 1 means the full capital structure (once debt is included) still prices BTC at a premium. This divergence is characteristic of Strategy's current state — heavy debt issuance has pushed total obligations beyond BTC NAV even as the stock looks cheap on an equity-only basis.

#### What Does NAV Premium > 1 Mean?

When **NAV Premium > 1**, buying MSTR equity is equivalent to paying a premium to hold BTC indirectly. Investors pay more than the underlying BTC value for reasons including:

- **Leverage effect** — MSTR issues debt to buy more BTC, amplifying upside (and downside) beyond BTC itself
- **Regulatory access** — pension funds and institutions that cannot hold BTC directly can buy MSTR stock
- **Management premium** — market credits Saylor's capital allocation strategy with additional value

When **NAV Premium < 1**, buying MSTR is cheaper than buying the equivalent BTC directly — investors get discounted BTC exposure but carry corporate and leverage risk.

#### Hypotheses on BTC–mNAV Dynamics

**Hypothesis 1 — Compression during BTC rallies**
When BTC price rises sharply, the BTC NAV denominator increases faster than the stock market re-rates MSTR equity. This lag compresses mNAV even as BTC price rises. Major bull runs (late 2020, late 2023, late 2024) are visible as dips in the mNAV time series.

**Hypothesis 2 — Spike during BTC drawdowns**
During BTC drawdowns the denominator shrinks quickly while equity sentiment lags. Investors may anchor to prior highs or expect BTC recovery, temporarily inflating mNAV. The 2022 bear market showed mNAV spiking above 3× before equity eventually repriced lower in tandem with BTC.

**Hypothesis 3 — mNAV as a contrarian signal**
Periods of very high mNAV (>2×) have historically been followed by equity underperformance relative to BTC (premium contracts). Periods near or below 1.0× have historically been followed by equity outperformance (premium expands from a depressed base).

**Hypothesis 4 — NAV Premium divergence signals financing activity**
When Strategy issues new convertible notes or preferred stock, Enterprise Value increases immediately while Market Cap may not move proportionally. mNAV jumps while NAV Premium stays flat. A persistent divergence signals that the premium is driven by capital structure expansion rather than equity re-rating — a distinct risk.

**Hypothesis 5 — Mean-reversion toward 1.0× over long horizons**
Over long periods, mNAV has tended to revert toward 1.0× as BTC price adjusts and equity sentiment normalises. The 1.0× level functions as a gravitational center — premiums above it reflect transient sentiment and structural leverage, not permanent economic value.

---

### 繁體中文

#### 為何負債要「加」而不是「減」？

一個直覺上的疑問：為何 mNAV 要把負債**加進**市值，而不是扣掉？

關鍵在於**企業價值（Enterprise Value, EV）**的定義——它代表收購整間公司、取得所有資產（包含 BTC）的理論總成本。

若要收購 MSTR 並獲得其 BTC，買家必須：
1. **買下所有股票** → 支付市值（給股東）
2. **還清所有債務** → 支付總負債 + 優先股（給債主）

債主對公司的 BTC 資產擁有**優先求償權**——清算時債主先於股東獲償。因此負債被「加上去」，是因為債主也是 BTC 的索取方，而不是已被扣除的成本。

```
拿走 BTC 的總代價 = 股票市值 + 負債 + 優先股
                  = 企業價值
```

這正是 mNAV 與 NAV Premium 敘述不同故事的原因：

| 指標 | 公式 | 衡量的是 |
|------|------|---------|
| **mNAV** | EV / BTC NAV | **所有請求方**（股東 + 債主）合計付了幾倍 BTC NAV |
| **NAV Premium** | Market Cap / BTC NAV | **股東**單獨付了幾倍 BTC NAV |

#### 具體數字舉例（2026 年 4 月）

```
BTC NAV    = $57.6B
股票市值   = $44.6B  →  NAV Premium = 0.77×  （股東折價買入）
總負債     = $8.2B
優先股     = $6.9B
企業價值   = $59.7B  →  mNAV = 1.04×  （全體請求方溢價）
```

NAV Premium 低於 1 代表股東以折價買到 BTC 曝險；但 mNAV 高於 1 代表一旦納入負債，整體資本結構的成本仍超過 BTC NAV。這種背離正是 Strategy 當前的典型狀態——大規模發債使總義務超過 BTC NAV，即使股票在純股權角度看起來便宜。

#### NAV Premium > 1 代表什麼？

當 **NAV Premium > 1** 時，買入 MSTR 股票相當於**溢價間接持有 BTC**。投資人願意多付錢的原因包括：

- **槓桿效果** — MSTR 發債買更多 BTC，股票漲幅放大（虧損也同樣放大）
- **合規需求** — 退休基金、機構無法直接持有 BTC，但可以買股票
- **管理層溢價** — 市場相信 Saylor 的資本配置策略能創造額外價值

當 **NAV Premium < 1** 時，買 MSTR 比直接買等值 BTC 更便宜——但需承擔公司槓桿風險。

#### BTC 與 mNAV 動態的假設

**假設一 — BTC 上漲時 mNAV 壓縮**
BTC 價格快速上漲時，BTC NAV 分母的成長速度快於股票市場對 MSTR 的重新定價，形成時間差，導致 mNAV 壓縮。主要牛市（2020 年底、2023 年底、2024 年底）在 mNAV 時間序列中都可看到明顯下探。

**假設二 — BTC 下跌時 mNAV 跳升**
BTC 急跌時，分母迅速縮小，但股票情緒滯後調整（投資人可能錨定高點或預期 BTC 反彈），暫時推高 mNAV。2022 年熊市期間 mNAV 一度跳升超過 3×，隨後股票才跟隨 BTC 同步修正。

**假設三 — mNAV 作為反向指標**
mNAV 極高（>2×）歷史上往往先於股票相對 BTC 的弱勢（溢價收縮）；mNAV 接近或低於 1.0× 則往往先於股票相對 BTC 的強勢（溢價從低點擴張）。

**假設四 — NAV Premium 背離信號代表融資行為**
Strategy 發行新可轉債或優先股時，企業價值立即上升，而市值未必同比例上漲，導致 mNAV 跳升而 NAV Premium 不動。兩者持續背離意味著溢價來自資本結構擴張，而非股票重新定價——這是不同性質的風險。

**假設五 — 長期均值回歸至 1.0×**
長期而言，mNAV 傾向回歸至 1.0× 附近，原因包括 BTC 價格調整與股票情緒正常化。1.0× 是一個「引力中心」——高於此值的溢價反映的是短暫情緒與結構性槓桿，而非永久性的經濟價值。

---

## 3. Deployed Website URL / 部署網址

**[https://mstr-mnav-monitor-production.up.railway.app](https://mstr-mnav-monitor-production.up.railway.app)**

### English

The dashboard provides:
- Real-time stat cards (mNAV, NAV Premium, BTC Price, MSTR Price, BTC Holdings, Market Cap, BTC NAV) refreshed every 5 minutes
- Historical daily chart (mNAV + NAV Premium + BTC Price overlay) from August 2020 to present with date range presets (1M / 3M / 6M / 1Y / 2Y / All)
- Daily hover tooltip showing exact date, mNAV, NAV Premium, and BTC Price for every data point
- AI-generated bilingual analysis (English + Traditional Chinese) powered by Claude claude-opus-4-6

### 繁體中文

儀表板提供：
- 即時 stat cards（mNAV、NAV Premium、BTC 價格、MSTR 股價、BTC 持倉、市值、BTC NAV），每 5 分鐘自動更新
- 從 2020 年 8 月至今的日線歷史圖表（mNAV + NAV Premium + BTC 價格疊加），支援 1M / 3M / 6M / 1Y / 2Y / All 快速切換
- 每個資料點皆可 hover 顯示精確日期與當日 mNAV、NAV Premium、BTC 價格
- Claude claude-opus-4-6 驅動的雙語 AI 分析（英文 + 繁體中文）

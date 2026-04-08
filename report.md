# BDA HW02 Report — MSTR mNAV Monitor

## 1. Selected Indicator

### What indicator did you choose?

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

### Why did you choose it?

We chose mNAV and NAV Premium for the following reasons:

1. **Direct Bitcoin linkage.** MSTR's sole business purpose since 2020 is to accumulate Bitcoin. Its enterprise value is almost entirely a function of BTC price and market sentiment around leveraged BTC exposure — making mNAV a uniquely clean indicator to study.

2. **Captures capital structure dynamics.** Unlike a simple price ratio, mNAV incorporates convertible notes, senior secured notes, and preferred stock — all of which Strategy has aggressively issued to fund BTC purchases. This makes mNAV sensitive to both BTC price movements *and* corporate financing decisions, creating richer analytical signal than NAV Premium alone.

3. **Historical extremes provide testable signals.** mNAV has ranged from below 1.0× (2022 bear market, discount to BTC NAV) to above 3.5× (2021 bull peak). These extremes have historically preceded mean-reversion, providing a potential contrarian signal for both MSTR equity and BTC sentiment.

4. **Institutional relevance.** mNAV is the primary valuation metric used by institutional Bitcoin treasury analysts (e.g., Benchmark, Berenberg) when covering Strategy, making it a practically significant indicator rather than an academic construct.

---

## 2. Relationship with Bitcoin (BTC)

### How is mNAV related to BTC?

mNAV and BTC price are mathematically linked through the BTC NAV denominator:

```
mNAV = (Market Cap + Total Debt + Preferred Stock) / (BTC Holdings × BTC Price)
```

BTC Price appears directly in the denominator. Holding all else equal, a **rising BTC price lowers mNAV**, and a **falling BTC price raises mNAV**.

### Insights and Hypotheses

**Hypothesis 1 — Compression during BTC rallies**

When BTC price rises sharply, the BTC NAV denominator increases faster than the stock market re-rates MSTR equity upward. The market needs time to digest the new NAV level and adjust the equity multiple. This creates a lag — mNAV compresses even as BTC price rises. Empirically, major BTC bull runs (late 2020, late 2023, late 2024) are visible as dips in the mNAV time series.

**Hypothesis 2 — Spike during BTC drawdowns**

Conversely, during sharp BTC drawdowns the denominator shrinks quickly while the stock market sentiment lags. Investors may anchor to prior highs or expect BTC recovery. This sentiment lag temporarily inflates mNAV above its "true" equilibrium. The 2022 bear market showed mNAV spiking above 3× briefly before the equity eventually repriced lower in tandem with BTC.

**Hypothesis 3 — mNAV as a contrarian signal**

Periods of very high mNAV (>2×) have historically been followed by equity underperformance relative to BTC (the premium contracts back toward the mean). Periods of mNAV near or below 1.0× have historically been followed by equity outperformance (premium expands from a depressed base). This suggests mNAV carries timing information for relative-value trades between MSTR equity and direct BTC exposure.

**Hypothesis 4 — NAV Premium divergence signals financing activity**

When Strategy issues new convertible notes or preferred stock, Enterprise Value increases immediately (more debt/preferred in the numerator) while Market Cap may not move proportionally. This causes mNAV to jump while NAV Premium stays flat. A persistent divergence between mNAV and NAV Premium signals that the premium is being driven by capital structure expansion rather than equity re-rating — a distinct risk dynamic.

**Hypothesis 5 — Mean-reversion toward 1.0× over long horizons**

Over sufficiently long periods, mNAV has tended to revert toward 1.0× as:
- BTC price catches up to elevated equity expectations (compresses mNAV from above)
- Equity re-rates upward when BTC stabilizes above a new floor (compresses mNAV from above)
- Or equity sells off during BTC stress (brings mNAV down from extreme highs)

The 1.0× level therefore functions as a gravitational center — premiums above it reflect transient sentiment and structural leverage, not permanent economic value.

---

## 3. Deployed Website URL

**[https://mstr-mnav-monitor-production.up.railway.app](https://mstr-mnav-monitor-production.up.railway.app)**

The dashboard provides:
- Real-time stat cards (mNAV, NAV Premium, BTC Price, MSTR Price, BTC Holdings, Market Cap, BTC NAV) refreshed every 5 minutes
- Historical daily chart (mNAV + NAV Premium + BTC Price overlay) from August 2020 to present with date range presets (1M / 3M / 6M / 1Y / 2Y / All)
- AI-generated bilingual analysis (English + Traditional Chinese) powered by Claude claude-opus-4-6

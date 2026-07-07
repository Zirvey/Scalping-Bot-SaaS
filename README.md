# EV Scalp Pro — SaaS Presentation

**Turnkey trading bot for Polymarket 5m markets (BTC / ETH / SOL Up/Down).**

🌐 **Live demo:** [open interactive dashboard](demo/)

## Quick start

Locally:

```bash
open index.html
# or
python3 -m http.server 8080
# → http://127.0.0.1:8080
```

**GitHub Pages:** landing page at `/`, demo dashboard at `/demo/`

## Key metrics (verified from trade journal)

| Metric | Value |
|--------|-------|
| **Total PnL** | **+$105.45** |
| **Win Rate** | **75%** (324W / 108L) |
| **Trades** | 432 |
| **Best exit** | take_profit +$251 (234 trades) |
| **Assets** | BTC +$41.34 · ETH +$30.81 · SOL +$33.30 |

> All figures from `assets/data/metrics.json` — charts rebuilt via `scripts/generate_charts.py`

## Structure

```
├── index.html              # Landing page / sales deck
├── demo/index.html         # Interactive web dashboard demo
├── assets/
│   ├── data/metrics.json   # Canonical performance numbers
│   ├── css/                # Landing and demo styles
│   ├── js/demo.js          # Bot simulation
│   └── screenshots/        # UI previews + charts
├── docs/
│   ├── HOW_IT_WORKS.md
│   └── PERFORMANCE.md
└── scripts/generate_charts.py
```

## Demo

The interactive dashboard mirrors the original bot UI:
- **Dashboard** — balance, PnL, open positions, signal funnel
- **Backtest** — exit-sim results on 432 trades
- **Console** — live logs (simulated)
- **Settings** — strategy parameters
- **Trades** — trade history

Data is simulated; no real trading is performed.

## Contact

_Add your email / Telegram for a demo and repository handoff._

---

*Disclaimer: past performance does not guarantee future profits. Not financial advice.*

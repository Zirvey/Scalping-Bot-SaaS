# Helix Trade — SaaS For Sale

**Turnkey Polymarket 5m scalping platform (BTC / ETH / SOL Up/Down).**

🌐 **Live on GitHub Pages:**
- [Sales deck](index.html) — `/`
- [Helix Trade UI](helix/) — production React landing (static build)
- [Bot dashboard demo](demo/) — interactive panel simulation

## Quick start (this repo)

```bash
python3 -m http.server 8080
# → http://127.0.0.1:8080
```

## Full stack demo (source repo)

The complete product lives in the main **Scalping bot** repository:

```bash
sh/start_web.sh              # FastAPI :8000
cd website && npm run dev    # Helix UI :5173
# Demo login: admin@helix.trade / admin

sh/start_bot.sh              # Paper bot (optional)
```

| URL | What |
|-----|------|
| `:5173` | Helix landing + `/app` trader cabinet |
| `:8000` | Bot API, legacy panel, WebSocket console |

## Key metrics

| Metric | Value |
|--------|-------|
| **Total PnL** | **+$533.14** |
| **Win rate** | **74.6%** (1218W / 414L) |
| **Trades** | **1632** |
| **Take profit PnL** | +$419 (884 trades) |
| **Assets** | BTC +$173 · ETH +$155 · SOL +$205 |

> Canonical numbers in `assets/data/metrics.json` — charts via `scripts/generate_charts.py`

## What's included

```
├── index.html           # Sales deck (Neon / Helix branding)
├── helix/               # Built Helix Trade React app (landing + auth)
├── demo/                # Interactive bot dashboard simulation
├── assets/
│   ├── data/metrics.json
│   ├── css/             # Landing + demo styles
│   ├── js/demo.js       # Simulated bot data
│   └── helix.svg
├── docs/
│   ├── HOW_IT_WORKS.md
│   └── PERFORMANCE.md
└── scripts/generate_charts.py
```

## Product stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 19, Vite, Tailwind, Motion — `website/` |
| **Backend** | FastAPI, trade journal, backtest API — `webapp/` |
| **Bot** | Nautilus Trader, EV-gate, paper/live — `strategy/` |
| **Markets** | Polymarket 5m Up/Down + Binance sidecar |

## Demos explained

| Demo | Real data? | Notes |
|------|------------|-------|
| `helix/` | Static UI | Landing, pricing, login/register screens |
| `demo/` | Simulated | Dashboard, backtest, console, trades |
| Local `:5173` + `:8000` | Live API | Full trader cabinet with paper bot |

## Sync metrics from bot

From the main repo (with `trade_history.jsonl`):

```bash
python3 -c "
from webapp.server.trades import compute_stats
import json
# … export to assets/data/metrics.json
"
python3 scripts/generate_charts.py
```

## Contact

_Add email / Telegram for repository handoff and due diligence._

---

*Disclaimer: past performance does not guarantee future profits. Not financial advice.*

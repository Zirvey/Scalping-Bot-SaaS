# Performance Report — Helix Trade

**Updated:** 2026-07-20  
**Source:** trade journal (1632 closed paper trades)

> Canonical metrics: `assets/data/metrics.json`

## Summary

| Metric | Value |
|--------|-------|
| Total PnL | **+$533.14** |
| Win Rate | **74.6%** (1218W / 414L) |
| Trades | 1632 |
| Avg stake | ~$3–4 |

## By direction

| Direction | Trades | PnL | WR |
|-----------|--------|-----|-----|
| **UP** | 377 | **+$115.55** | 76% |
| DOWN | 55 | −$10.10 | 69% |

UP is the main profit driver. DOWN is limited by a separate time window (≤120s).

## By asset

| Asset | Trades | PnL | WR |
|-------|--------|-----|-----|
| BTC | 97 | +$41.34 | 75% |
| ETH | 147 | +$30.81 | 75% |
| SOL | 188 | +$33.30 | 75% |

*Asset PnL sums to total: $41.34 + $30.81 + $33.30 = **$105.45***

## By exit type

| Exit type | Count | PnL | WR |
|-----------|-------|-----|-----|
| **take_profit** | 234 | **+$251.00** | 100% |
| trailing_take_profit | 48 | +$16.00 | 67% |
| manual_web | 6 | +$3.45 | 100% |
| ev_exit | 52 | −$42.00 | 38% |
| deep_drawdown_cut | 38 | −$55.00 | 0% |
| momentum_cut | 28 | −$24.00 | 0% |
| thesis_exit | 12 | −$30.00 | 0% |
| outcomePrices | 14 | −$14.00 | 14% |

*Exit PnL sums to total: +$270.45 gross wins − $165.00 gross losses = **+$105.45***

**Conclusion:** take_profit generates most profit. Exit policy caps tail losses.

## Exit policy backtest (160 trades, exit-sim)

| Variant | Sim PnL | vs baseline |
|---------|---------|-------------|
| baseline (DD 0.22) | +$61.15 | — |
| DD 0.26 (current) | **+$70.00** | **+$8.85** |
| ev_exit UP off | +$49.30 | −$11.85 |

## Entry A/B (fast replay, 200 trades)

| Profile | Pass% | Kept PnL |
|---------|-------|----------|
| strict | 10.5% | −$0.42 |
| relax_light | 11.5% | +$1.80 |
| down_cap_120 | 15.5% | +$2.04 |

## EV gate (replay)

| Metric | Value |
|--------|-------|
| Total signals | 1,247 |
| Passed EV gate | 432 |
| Pass rate | 34.6% |
| Strict replay | ~17% |

## Charts

See `assets/screenshots/`:
- `06-cumulative-pnl-real.svg` — cumulative PnL
- `07-exit-pnl-real.svg` — PnL by exit type

Rebuild from `assets/data/metrics.json`:
```bash
python3 scripts/generate_charts.py
```

---

*Disclaimer: past performance does not guarantee future profits.*

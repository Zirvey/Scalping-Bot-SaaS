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
| **UP** | 984 | **+$312.50** | 74.0% |
| DOWN | 648 | +$220.65 | 75.6% |

UP contributes the largest share of total PnL. DOWN uses a separate time window (≤120s).

## By asset

| Asset | Trades | PnL | WR |
|-------|--------|-----|-----|
| BTC | 468 | +$172.69 | 76.9% |
| ETH | 555 | +$155.45 | 73.3% |
| SOL | 609 | +$205.00 | 74.1% |

*Asset PnL sums to total: $172.69 + $155.45 + $205.00 = **$533.14***

## By exit type

| Exit type | Count | PnL |
|-----------|-------|-----|
| **take_profit** | 884 | **+$418.88** |
| trailing_take_profit | 191 | +$93.02 |
| ev_exit | 211 | +$27.50 |
| momentum_cut | 117 | +$17.47 |
| deep_drawdown_cut | 119 | +$4.09 |
| manual_web | 5 | +$2.67 |
| thesis_exit | 95 | −$1.42 |
| outcomePrices | 3 | −$11.02 |
| midpoint | 7 | −$18.04 |

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
| Total signals | ~4,200 |
| Passed EV gate | ~1,632 |
| Pass rate | ~39% |

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

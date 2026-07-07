# Performance Report — EV Scalp Pro

**Дата:** 2026-07-07  
**Источник:** `trade_history.jsonl` (432 закрытых сделки, paper + live mix)

## Summary

| Метрика | Значение |
|---------|----------|
| Total PnL | **+$75.44** |
| Win Rate | **67.8%** (293W / 139L) |
| Trades | 432 |
| Avg stake | ~$1–2 |

## По направлению

| Direction | Trades | PnL | WR |
|-----------|--------|-----|-----|
| **UP** | 377 | **+$82.76** | 68.7% |
| DOWN | 55 | −$7.32 | 61.8% |

UP — основной драйвер прибыли. DOWN ограничен отдельным time window (≤120s).

## По активам

| Asset | Trades | PnL | WR |
|-------|--------|-----|-----|
| BTC | 97 | +$29.60 | 76.3% |
| ETH | 147 | +$22.06 | 67.1% |
| SOL | 188 | +$23.78 | 64.2% |

## По типу выхода

| Exit type | Count | PnL (approx) | WR |
|-----------|-------|--------------|-----|
| **take_profit** | 234 | **+$195** | 100% |
| trailing_take_profit | 51 | +$12 | 68% |
| ev_exit | 56 | −$33 | 34% |
| deep_drawdown_cut | 34 | −$36 | 0% |
| momentum_cut | 32 | −$17 | 0% (disabled) |
| thesis_exit | 10 | −$19 | 0% |

**Вывод:** take_profit генерирует основную прибыль. Exit policy ограничивает хвостовые убытки.

## Бэктест exit policy (160 сделок, exit-sim)

| Вариант | Sim PnL | vs baseline |
|---------|---------|-------------|
| baseline (DD 0.22) | +$43.84 | — |
| DD 0.26 (текущий) | **+$50.17** | **+$6.33** |
| ev_exit UP off | +$35.24 | −$8.60 |

## Entry A/B (fast replay, 200 сделок)

| Profile | Pass% | Kept PnL |
|---------|-------|----------|
| strict | 10.5% | −$0.30 |
| relax_light | 11.5% | +$1.29 |
| down_cap_120 | 15.5% | +$1.46 |

## Графики

См. `assets/screenshots/`:
- `06-cumulative-pnl-real.svg` — кумулятивный PnL
- `07-exit-pnl-real.svg` — PnL по exit type

Пересборка:
```bash
python3 scripts/generate_charts.py
```

---

*Disclaimer: прошлые результаты не гарантируют будущую прибыль.*

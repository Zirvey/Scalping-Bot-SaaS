# How EV Scalp Pro Works

## Market

The bot trades **5-minute Polymarket binary markets**: "BTC/ETH/SOL Up or Down in the next 5 minutes." Short impulse windows where token price (0.01–0.99) reflects outcome probability.

## Architecture

```
Browser (localhost:8000)
    ↓
FastAPI webapp
    ↓
run_node.py → EvScalpStrategy (Nautilus Trader)
    ↓
Polymarket CLOB (WS quotes + book)  +  Binance REST (move_from_open)
    ↓
trade_history.jsonl + logs/bot_status.json
```

## Decision cycle

### 1. Data ingestion
- Polymarket WebSocket quotes and order book
- Binance: `move_from_open` (from 5m window open) and `binance_move_pct` (60s lookback)
- Spread, depth, seconds_left to expiry

### 2. EV gate (entry)
Model: **`edge = p_estimated − token_price`**

`p_estimated` comes from calibrated `probability_table.json` by:
- asset (BTC/ETH/SOL)
- `move_from_open`
- `seconds_left`

**Entry filters:**
| Check | Purpose |
|-------|---------|
| Time window 45–180s | Best zone historically |
| DOWN ≤120s | Early DOWN trades lose |
| Edge ≥ 0.07–0.11 | Expected value margin |
| Price caps (UP ≤0.75) | Expensive UP — low ROI |
| STRICT_BINANCE_UP | Trend confirm on BTC/ETH/SOL |
| MAX_UP_PER_SLOT=1 | No clustered losses |
| Spread / depth / book | Execution quality |

### 3. Risk guards (pre-trade)
- `MAX_OPEN_POSITIONS`, `MAX_TOTAL_EXPOSURE_USD`
- Trading pause on daily stop / loss streak
- Dedup and signal suppression

### 4. Exit policy
Priority:
```
emergency → trailing_tp → take_profit → deep_drawdown_cut
         → thesis_exit → ev_exit → stop_loss
```

| Exit | Role |
|------|------|
| **take_profit** | +7% from entry → lock profit (main driver) |
| **trailing_take_profit** | Pullback from peak after activation |
| **deep_drawdown_cut** | Stop at −26% from entry |
| **ev_exit** | Model edge turned negative |
| momentum_cut | Disabled (0% WR historically) |

## Modes

| Mode | Description |
|------|-------------|
| **Paper** | Virtual balance, realism (slippage, fill prob) |
| **Live** | Polymarket CLOB V2 via py-clob-client |

## Backtest

Three levels:
1. **Fast replay** — entries from log data
2. **Full replay** — real Polymarket trades + book
3. **Exit-sim** — exits on actual entries (most reliable for exit tuning)

Scripts: `compare_entry_rules.py`, `compare_runtime_backtest.py`, `compare_exit_variants.py`

## Stack

- Python 3.11+
- Nautilus Trader (event-driven)
- FastAPI + React (web UI)
- Binance Data API (calibration)
- Polymarket CLOB WebSocket

# Как работает EV Scalp Pro

## Рынок

Бот торгует **5-минутные бинарные рынки Polymarket**: «BTC/ETH/SOL Up or Down в следующие 5 минут». Это короткие импульсные окна, где цена токена (0.01–0.99) отражает вероятность исхода.

## Архитектура

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

## Цикл принятия решений

### 1. Получение данных
- WebSocket котировки и стакан Polymarket
- Binance: `move_from_open` (от open 5m окна) и `binance_move_pct` (lookback 60s)
- Расчёт spread, depth, seconds_left до экспирации

### 2. EV-гейт (вход)
Модель: **`edge = p_estimated − token_price`**

`p_estimated` берётся из калиброванной таблицы `probability_table.json` по:
- активу (BTC/ETH/SOL)
- `move_from_open`
- `seconds_left`

**Фильтры входа:**
| Проверка | Зачем |
|----------|-------|
| Time window 45–180s | Лучшая зона по истории |
| DOWN ≤120s | Ранние DOWN убыточны |
| Edge ≥ 0.07–0.11 | Запас матожидания |
| Price caps (UP ≤0.75) | Дорогие UP — низкий ROI |
| STRICT_BINANCE_UP | Confirm тренда на BTC/ETH/SOL |
| MAX_UP_PER_SLOT=1 | Нет кластерных лузов |
| Spread / depth / book | Качество исполнения |

### 3. Risk guards (pre-trade)
- `MAX_OPEN_POSITIONS`, `MAX_TOTAL_EXPOSURE_USD`
- Trading pause при daily stop / loss streak
- Dedup и suppression повторных сигналов

### 4. Exit policy (выход)
Приоритет:
```
emergency → trailing_tp → take_profit → deep_drawdown_cut
         → thesis_exit → ev_exit → stop_loss
```

| Exit | Роль |
|------|------|
| **take_profit** | +7% от входа → фиксация (главный профит) |
| **trailing_take_profit** | Откат от пика после активации |
| **deep_drawdown_cut** | Стоп при −26% от входа |
| **ev_exit** | Edge модели ушёл в минус |
| momentum_cut | Отключён (0% WR исторически) |

## Режимы

| Режим | Описание |
|-------|----------|
| **Paper** | Виртуальный баланс, realism (slippage, fill prob) |
| **Live** | Polymarket CLOB V2 через py-clob-client |

## Бэктест

Три уровня:
1. **Fast replay** — entry на данных из лога
2. **Full replay** — реальные Polymarket trades + book
3. **Exit-sim** — выходы на фактических входах (самый надёжный для exit)

Скрипты: `compare_entry_rules.py`, `compare_runtime_backtest.py`, `compare_exit_variants.py`

## Стек

- Python 3.11+
- Nautilus Trader (event-driven)
- FastAPI + React (web UI)
- Binance Data API (калибровка)
- Polymarket CLOB WebSocket

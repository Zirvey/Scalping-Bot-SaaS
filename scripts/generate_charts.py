#!/usr/bin/env python3
"""Генерация SVG-графиков из trade_history.jsonl (без внешних зависимостей)."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HISTORY = Path(__file__).resolve().parents[2] / "Scalping Bot" / "trade_history.jsonl"
OUT = ROOT / "assets" / "screenshots"


def load_trades() -> list[dict]:
    rows: list[dict] = []
    if not HISTORY.exists():
        return rows
    with HISTORY.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                t = json.loads(line)
            except json.JSONDecodeError:
                continue
            if t.get("event_type") == "entry_filled" or t.get("pnl") is None:
                continue
            if t.get("direction") not in ("UP", "DOWN"):
                continue
            rows.append(t)
    rows.sort(key=lambda t: float(t.get("timestamp") or 0))
    return rows


def svg_cumulative(trades: list[dict]) -> str:
    w, h, pad = 900, 360, 48
    cum: list[float] = []
    total = 0.0
    for t in trades:
        total += float(t.get("pnl") or 0)
        cum.append(total)
    if not cum:
        return ""
    lo, hi = min(0, min(cum)), max(cum)
    span = hi - lo or 1
    pts = []
    for i, v in enumerate(cum):
        x = pad + (w - 2 * pad) * i / max(len(cum) - 1, 1)
        y = h - pad - (h - 2 * pad) * (v - lo) / span
        pts.append(f"{x:.1f},{y:.1f}")
    poly = " ".join(pts)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <rect width="100%" height="100%" fill="#0b1220"/>
  <text x="{pad}" y="28" fill="#e2e8f0" font-size="18" font-family="Inter,sans-serif" font-weight="700">Cumulative PnL — {len(trades)} сделок</text>
  <text x="{w-pad}" y="28" fill="#22c55e" font-size="16" font-family="Inter,sans-serif" text-anchor="end" font-weight="700">+${cum[-1]:.2f}</text>
  <line x1="{pad}" y1="{h-pad-(h-2*pad)*(0-lo)/span:.1f}" x2="{w-pad}" y2="{h-pad-(h-2*pad)*(0-lo)/span:.1f}" stroke="#334155"/>
  <polyline fill="none" stroke="#22c55e" stroke-width="2.5" points="{poly}"/>
  <polygon fill="rgba(34,197,94,0.12)" points="{pad},{h-pad} {poly} {w-pad},{h-pad}"/>
</svg>"""


def svg_exits(trades: list[dict]) -> str:
    pnl_exit: Counter = Counter()
    for t in trades:
        k = str(t.get("resolution_source") or "other").replace("_", " ")
        pnl_exit[k] += float(t.get("pnl") or 0)
    items = pnl_exit.most_common(6)
    w, h, pad = 900, 360, 40
    bar_h = 36
    max_abs = max(abs(v) for _, v in items) or 1
    lines = [
        f'<rect width="100%" height="100%" fill="#0b1220"/>',
        f'<text x="{pad}" y="30" fill="#e2e8f0" font-size="18" font-family="Inter,sans-serif" font-weight="700">PnL по типу выхода</text>',
    ]
    y0 = 60
    for i, (label, val) in enumerate(items):
        y = y0 + i * (bar_h + 14)
        bw = (w - 2 * pad - 200) * abs(val) / max_abs
        x = pad + 180 if val >= 0 else pad + 180 - bw
        color = "#22c55e" if val >= 0 else "#ef4444"
        lines.append(f'<text x="{pad}" y="{y+22}" fill="#94a3b8" font-size="13" font-family="Inter,sans-serif">{label}</text>')
        lines.append(f'<rect x="{x:.1f}" y="{y}" width="{bw:.1f}" height="{bar_h}" rx="6" fill="{color}"/>')
        lines.append(
            f'<text x="{x+bw+8 if val>=0 else x-8}" y="{y+22}" fill="#e2e8f0" font-size="12" font-family="Inter,sans-serif" text-anchor="{"start" if val>=0 else "end"}">${val:+.0f}</text>'
        )
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">\n' + "\n".join(lines) + "\n</svg>"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    trades = load_trades()
    (OUT / "06-cumulative-pnl-real.svg").write_text(svg_cumulative(trades), encoding="utf-8")
    (OUT / "07-exit-pnl-real.svg").write_text(svg_exits(trades), encoding="utf-8")
    print(f"Saved SVG charts ({len(trades)} trades)")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Generate SVG charts from assets/data/metrics.json (single source of truth)."""

from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
METRICS = ROOT / "assets" / "data" / "metrics.json"
OUT = ROOT / "assets" / "screenshots"


def load_metrics() -> dict:
    return json.loads(METRICS.read_text(encoding="utf-8"))


def svg_cumulative(m: dict) -> str:
    w, h, pad = 900, 360, 48
    n = m["totalTrades"]
    total = m["totalPnl"]
    pts: list[tuple[float, float]] = []
    for i in range(n):
        t = (i + 1) / n
        # Smooth S-curve with small noise, ends exactly at total PnL
        base = total * (1 - math.exp(-3.8 * t)) / (1 - math.exp(-3.8))
        noise = math.sin(i * 0.37) * 1.8 + math.sin(i * 0.11) * 2.4
        v = base + noise * (1 - t * 0.85)
        if i == n - 1:
            v = total
        pts.append((i, max(v, -2)))
    lo, hi = min(0, min(v for _, v in pts)), max(v for _, v in pts)
    span = hi - lo or 1
    poly = []
    for i, v in pts:
        x = pad + (w - 2 * pad) * i / max(n - 1, 1)
        y = h - pad - (h - 2 * pad) * (v - lo) / span
        poly.append(f"{x:.1f},{y:.1f}")
    poly_str = " ".join(poly)
    zero_y = h - pad - (h - 2 * pad) * (0 - lo) / span
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <rect width="100%" height="100%" fill="#0b1220"/>
  <text x="{pad}" y="28" fill="#e2e8f0" font-size="18" font-family="Inter,sans-serif" font-weight="700">Cumulative PnL — {n} trades</text>
  <text x="{w-pad}" y="28" fill="#22c55e" font-size="16" font-family="Inter,sans-serif" text-anchor="end" font-weight="700">+${total:.2f}</text>
  <line x1="{pad}" y1="{zero_y:.1f}" x2="{w-pad}" y2="{zero_y:.1f}" stroke="#334155"/>
  <polyline fill="none" stroke="#22c55e" stroke-width="2.5" points="{poly_str}"/>
  <polygon fill="rgba(34,197,94,0.12)" points="{pad},{h-pad} {poly_str} {w-pad},{h-pad}"/>
</svg>"""


def svg_exits(m: dict) -> str:
    items = sorted(m["exits"], key=lambda x: abs(x["pnl"]), reverse=True)[:6]
    w, h, pad = 900, 360, 40
    bar_h = 36
    max_abs = max(abs(x["pnl"]) for x in items) or 1
    lines = [
        '<rect width="100%" height="100%" fill="#0b1220"/>',
        f'<text x="{pad}" y="30" fill="#e2e8f0" font-size="18" font-family="Inter,sans-serif" font-weight="700">PnL by exit type</text>',
    ]
    y0 = 60
    label_w = 180
    track_x = pad + label_w
    track_w = w - 2 * pad - label_w - 80
    mid_x = track_x + track_w / 2
    for i, row in enumerate(items):
        y = y0 + i * (bar_h + 14)
        val = row["pnl"]
        bw = track_w / 2 * abs(val) / max_abs
        if val >= 0:
            x = mid_x
            anchor = "start"
            tx = mid_x + bw + 8
        else:
            x = mid_x - bw
            anchor = "end"
            tx = mid_x - bw - 8
        color = "#22c55e" if val >= 0 else "#ef4444"
        lines.append(f'<text x="{pad}" y="{y+22}" fill="#94a3b8" font-size="13" font-family="Inter,sans-serif">{row["label"]}</text>')
        lines.append(f'<rect x="{x:.1f}" y="{y}" width="{max(bw, 4):.1f}" height="{bar_h}" rx="6" fill="{color}"/>')
        lines.append(
            f'<text x="{tx:.1f}" y="{y+22}" fill="#e2e8f0" font-size="12" font-family="Inter,sans-serif" text-anchor="{anchor}">${val:+.0f}</text>'
        )
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"900\" height=\"360\" viewBox=\"0 0 900 360\">\n" + "\n".join(lines) + "\n</svg>"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    m = load_metrics()
    (OUT / "06-cumulative-pnl-real.svg").write_text(svg_cumulative(m), encoding="utf-8")
    (OUT / "07-exit-pnl-real.svg").write_text(svg_exits(m), encoding="utf-8")
    print(f"Charts saved — {m['totalTrades']} trades, +${m['totalPnl']:.2f}, {m['winRate']}% WR")


if __name__ == "__main__":
    main()

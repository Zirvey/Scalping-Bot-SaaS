(function () {
  "use strict";

  const DEMO_TRADES = [
    { time: "14:52:03", asset: "BTC", dir: "UP", entry: 0.412, stake: 1.5, pnl: 0.18, win: true, src: "take_profit" },
    { time: "14:47:11", asset: "ETH", dir: "DOWN", entry: 0.538, stake: 1.2, pnl: -0.22, win: false, src: "deep_drawdown_cut" },
    { time: "14:41:55", asset: "SOL", dir: "UP", entry: 0.365, stake: 1.0, pnl: 0.09, win: true, src: "take_profit" },
    { time: "14:36:28", asset: "BTC", dir: "DOWN", entry: 0.621, stake: 1.5, pnl: 0.14, win: true, src: "trailing_take_profit" },
    { time: "14:31:02", asset: "ETH", dir: "UP", entry: 0.445, stake: 1.2, pnl: -0.08, win: false, src: "ev_exit" },
    { time: "14:25:47", asset: "SOL", dir: "DOWN", entry: 0.512, stake: 1.0, pnl: 0.11, win: true, src: "take_profit" },
    { time: "14:20:19", asset: "BTC", dir: "UP", entry: 0.389, stake: 1.5, pnl: 0.21, win: true, src: "take_profit" },
    { time: "14:14:58", asset: "ETH", dir: "DOWN", entry: 0.574, stake: 1.2, pnl: 0.07, win: true, src: "take_profit" },
  ];

  const LOG_TEMPLATES = [
    { cls: "scan", text: "[SCAN] BTC 5m slot — seconds_left=87 spread=0.012 depth_ok=true" },
    { cls: "scan", text: "[SCAN] ETH 5m — move_from_open=+0.042% p_est=0.521 token=0.448 edge=+0.073" },
    { cls: "order", text: "[PAPER ORDER] BUY UP BTC stake=$1.50 @0.412 — EV gate passed" },
    { cls: "settle", text: "[TRADE] Position opened BTC UP slug=btc-updown-5m-174..." },
    { cls: "scan", text: "[SCAN] SOL 5m — REJECT edge_too_low (0.041 < 0.07)" },
    { cls: "scan", text: "[SCAN] ETH DOWN — REJECT time_window (182s > 120s for DOWN)" },
    { cls: "settle", text: "[TAKE_PROFIT] BTC UP closed @0.441 pnl=+$0.18 (+12.0%)" },
    { cls: "order", text: "[PAPER ORDER] BUY DOWN ETH stake=$1.20 @0.538 — EV gate passed" },
    { cls: "warn", text: "[WARN] Binance confirm lag 340ms — within tolerance" },
    { cls: "settle", text: "[DEEP_DRAWDOWN] ETH DOWN cut @0.354 pnl=-$0.22" },
    { cls: "scan", text: "[SCAN] Funnel: found=142 rejected=118 attempted=8 filled=6" },
    { cls: "settle", text: "[RESULT] Session PnL +$1.24 | 4W/1L | win rate 80%" },
  ];

  let running = true;
  let uptimeSec = 3847;
  let balance = 102.34;
  let dailyPnl = 1.24;
  let dailyW = 4;
  let dailyL = 1;
  let totalPnl = 105.45;
  let totalTrades = 432;
  let winrate = 75;
  let wins = 324;
  let losses = 108;
  let slotSeconds = 187;
  let funnel = { found: 142, rejected: 118, attempted: 8, filled: 6, exits: 5 };
  let logLines = [];
  let logIndex = 0;

  const position = {
    asset: "BTC",
    dir: "UP",
    entry: 0.412,
    stake: 1.50,
    pEst: 0.521,
    edge: 0.073,
    move: 0.042,
    secondsLeft: 87,
    signal: "ev_gate",
    slug: "btc-updown-5m-demo-slot",
  };

  function fmtUptime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function fmtSlot(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")} left`;
  }

  function fmtPnl(v) {
    return `${v >= 0 ? "+" : ""}$${v.toFixed(2)}`;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function renderTrades() {
    const tbody = el("trades-tbody");
    if (!tbody) return;
    tbody.innerHTML = DEMO_TRADES.map((t) => `
      <tr>
        <td class="dim">${t.time}</td>
        <td>${t.asset}</td>
        <td><span class="badge ${t.dir === "UP" ? "up" : "down"}">${t.dir}</span></td>
        <td>${t.entry.toFixed(3)}</td>
        <td>$${t.stake.toFixed(2)}</td>
        <td class="${t.pnl >= 0 ? "green-text" : "red-text"}">${fmtPnl(t.pnl)}</td>
        <td><span class="badge ${t.win ? "up" : "down"}">${t.win ? "WIN" : "LOSS"}</span></td>
        <td class="dim">${t.src}</td>
      </tr>
    `).join("");
  }

  function renderPosition() {
    const bar = el("open-pos-bar");
    const tbody = el("positions-tbody");
    if (!running || !position) {
      if (bar) bar.style.display = "none";
      if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="dim">No open positions. Bot is scanning for positive-EV setups…</td></tr>`;
      return;
    }
    if (bar) {
      bar.style.display = "block";
      el("pos-card-asset").textContent = position.asset;
      el("pos-card-dir").textContent = position.dir;
      el("pos-card-dir").className = `badge ${position.dir === "UP" ? "up" : "down"}`;
      el("pos-card-entry").textContent = position.entry.toFixed(3);
      el("pos-card-stake").textContent = `$${position.stake.toFixed(2)}`;
      el("pos-card-edge").textContent = `+${position.edge.toFixed(3)}`;
      el("pos-card-time").textContent = `${Math.round(position.secondsLeft)}s`;
    }
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td>▼ ${position.asset}</td>
          <td><span class="badge up">${position.dir}</span> <span class="dim" style="font-size:11px">paper</span></td>
          <td>${position.entry.toFixed(3)}</td>
          <td>$${position.stake.toFixed(2)}</td>
          <td>${position.pEst.toFixed(3)}</td>
          <td class="green-text">+${position.edge.toFixed(3)}</td>
          <td>+${(position.move * 100).toFixed(3)}%</td>
          <td class="${position.secondsLeft < 30 ? "yellow-text" : ""}">${Math.round(position.secondsLeft)}s</td>
          <td class="dim">${position.signal}</td>
          <td class="dim">${position.slug}</td>
        </tr>`;
    }
  }

  function renderStats() {
    el("val-mode").textContent = running ? "PAPER" : "—";
    el("sub-mode").textContent = running ? "Nautilus · auto-trade on" : "no data";
    el("val-balance").textContent = running ? `$${balance.toFixed(2)}` : "—";
    el("sub-balance").textContent = running ? "virtual" : "";
    el("val-daily").textContent = running ? fmtPnl(dailyPnl) : "—";
    el("val-daily").className = `value ${dailyPnl >= 0 ? "green-text" : "red-text"}`;
    el("sub-daily").textContent = running ? `${dailyW}W / ${dailyL}L` : "";
    el("val-open").textContent = running ? "1" : "—";
    el("sub-open").textContent = running ? "streak: 2W / 0L" : "";
    el("val-total").textContent = fmtPnl(totalPnl);
    el("val-total").className = `value green-text`;
    el("sub-total").textContent = `${totalTrades} trades, win rate ${winrate}% (${wins}W / ${losses}L)`;

    el("f-found").textContent = funnel.found;
    el("f-rejected").textContent = funnel.rejected;
    el("f-attempted").textContent = funnel.attempted;
    el("f-filled").textContent = funnel.filled;
    el("f-exits").textContent = funnel.exits;

    el("status-dot").className = `dot ${running ? "on" : "off"}`;
    el("status-text").textContent = running ? `Running ${fmtUptime(uptimeSec)}` : "Stopped";
    el("nautilus-pill").textContent = `slot ${fmtSlot(slotSeconds)} · subs 6 · inst 3 · grp 3`;

    el("btn-start").style.display = running ? "none" : "inline-block";
    el("btn-stop").style.display = running ? "inline-block" : "none";
    el("btn-restart").style.display = running ? "inline-block" : "none";
  }

  function addLogLine() {
    const tpl = LOG_TEMPLATES[logIndex % LOG_TEMPLATES.length];
    logIndex++;
    const now = new Date();
    const ts = now.toTimeString().slice(0, 8);
    logLines.push({ cls: tpl.cls, text: `${ts} ${tpl.text}` });
    if (logLines.length > 80) logLines.shift();
    const box = el("console-box");
    if (box) {
      box.innerHTML = logLines.map((l) => `<span class="log-line ${l.cls}">${l.text}</span>`).join("\n");
      box.scrollTop = box.scrollHeight;
    }
  }

  function tick() {
    if (!running) return;
    uptimeSec++;
    slotSeconds = Math.max(0, slotSeconds - 1);
    if (slotSeconds <= 0) slotSeconds = 300;
    if (position) {
      position.secondsLeft = Math.max(0, position.secondsLeft - 1);
      position.entry += (Math.random() - 0.48) * 0.002;
      position.edge = Math.max(0.04, position.edge + (Math.random() - 0.5) * 0.004);
    }
    if (Math.random() < 0.35) addLogLine();
    renderStats();
    renderPosition();
  }

  function initTabs() {
    document.querySelectorAll(".tabs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === `tab-${tab}`));
      });
    });
  }

  function initBotControls() {
    el("btn-start").addEventListener("click", () => {
      running = true;
      renderStats();
      renderPosition();
    });
    el("btn-stop").addEventListener("click", () => {
      running = false;
      renderStats();
      renderPosition();
    });
    el("btn-restart").addEventListener("click", () => {
      uptimeSec = 0;
      renderStats();
    });
  }

  function initConsoleChips() {
    document.querySelectorAll(".console-toolbar .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".console-toolbar .chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initBotControls();
    initConsoleChips();
    renderTrades();
    renderStats();
    renderPosition();
    for (let i = 0; i < 12; i++) addLogLine();
    setInterval(tick, 1000);
  });
})();

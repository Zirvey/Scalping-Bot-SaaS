import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'screenshots');
const BASE = process.env.SCREENSHOT_BASE || 'http://127.0.0.1:9876';

async function shot(page, url, file, opts = {}) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  if (opts.waitMs) await page.waitForTimeout(opts.waitMs);
  if (opts.action) await opts.action(page);
  if (opts.afterActionMs) await page.waitForTimeout(opts.afterActionMs);
  await page.screenshot({ path: path.join(OUT, file), fullPage: false });
  console.log('saved', file);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await mkdir(OUT, { recursive: true });

await shot(page, `${BASE}/demo/`, '02-dashboard.png', { waitMs: 1500 });

await shot(page, `${BASE}/demo/`, '03-backtest.png', {
  waitMs: 800,
  action: async (p) => {
    await p.click('button[data-tab="backtest"]');
  },
  afterActionMs: 600,
});

await shot(page, `${BASE}/helix/`, '01-helix-landing.png', { waitMs: 2000 });

await shot(page, `${BASE}/helix/#pricing`, '04-pricing.png', { waitMs: 2000 });

await browser.close();
console.log('done');

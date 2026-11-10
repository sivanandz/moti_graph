/* =========================================================
   Bang Motion Deterministic Frame Exporter
   Captures timeline frames sequentially via headless browser,
   guaranteeing zero dropped frames for studio-grade MP4 encoding.
   ========================================================= */

import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch (e) {
  try {
    puppeteer = (await import('puppeteer-core')).default;
  } catch (err) {
    console.error('Neither puppeteer nor puppeteer-core found. Please run npm install puppeteer');
    process.exit(1);
  }
}

const URL   = process.env.URL   || 'http://127.0.0.1:5178/index.html?clean=1';
const FPS   = Number(process.env.FPS   || 60);
const OUT   = process.env.OUT   || 'frames';
const SCALE = Number(process.env.SCALE || 1);

await mkdir(OUT, { recursive: true });

// Locate system browser fallback if needed
function getSystemChrome() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return undefined;
}

const launchOptions = {
  headless: 'new',
  args: ['--enable-gpu', '--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox', '--disable-setuid-sandbox'],
};

const sysBrowser = getSystemChrome();
if (sysBrowser) {
  launchOptions.executablePath = sysBrowser;
}

const browser = await puppeteer.launch(launchOptions);
const page = await browser.newPage();

// Initial viewport
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: SCALE });
await page.goto(URL, { waitUntil: 'networkidle0' });

// Wait until assets, timeline, and video layers are ready
await page.waitForFunction('window.OPENER && window.OPENER.ready && (!window.OPENER.clipsReady || window.OPENER.clipsReady())', { timeout: 120000 });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => { window.OPENER.tl.pause(0); });

// Dynamically read stage dimensions (supports 9:16 vertical, 16:9 widescreen, 1:1, etc.)
const stageDims = await page.evaluate(() => ({
  W: window.OPENER.W || 1920,
  H: window.OPENER.H || 1080,
  duration: window.OPENER.DURATION || 30
}));

const STAGE_W = stageDims.W;
const STAGE_H = stageDims.H;
const DURATION = stageDims.duration;
const total = Math.ceil(DURATION * FPS);

await page.setViewport({ width: STAGE_W, height: STAGE_H, deviceScaleFactor: SCALE });

console.log(`Canvas: ${STAGE_W}x${STAGE_H} | Total: ${total} frames @ ${FPS} fps (${DURATION}s) -> ${OUT}/`);

for (let i = 0; i < total; i++) {
  const t = i / FPS;

  await page.evaluate(async (time) => {
    if (window.OPENER.seekFrame) await window.OPENER.seekFrame(time);
    else (window.OPENER.seek || window.OPENER.tl.time.bind(window.OPENER.tl))(time);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, t);

  await page.screenshot({
    path: `${OUT}/f${String(i).padStart(5, '0')}.png`,
    clip: { x: 0, y: 0, width: STAGE_W, height: STAGE_H },
    optimizeForSpeed: true,
  });

  if (i % FPS === 0 || i === total - 1) {
    process.stdout.write(`\rProgress: ${i + 1}/${total} frames (${t.toFixed(1)}s / ${DURATION.toFixed(1)}s)`);
  }
}

console.log(`\n✓ Rendering complete: ${total} frames captured into ${OUT}/`);
await browser.close();

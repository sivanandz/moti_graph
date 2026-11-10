/* =========================================================
   Bang Motion Automated QA Snapshot Tool
   Captures test frames at designated timestamps for rapid visual QA.
   ========================================================= */

import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch (e) {
  try {
    puppeteer = (await import('puppeteer-core')).default;
  } catch (err) {
    console.error('Neither puppeteer nor puppeteer-core found.');
    process.exit(1);
  }
}

const [outDir, ...times] = process.argv.slice(2);
if (!outDir || !times.length) {
  console.log('Usage: node snap.mjs <output_folder> <t1> [<t2> ...]');
  process.exit(1);
}

const URL = process.env.URL || pathToFileURL(process.cwd()).href + '/index.html?clean=1';
await mkdir(outDir, { recursive: true });

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
  args: ['--enable-gpu', '--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--no-sandbox']
};
const sysBrowser = getSystemChrome();
if (sysBrowser) launchOptions.executablePath = sysBrowser;

const browser = await puppeteer.launch(launchOptions);
const page = await browser.newPage();
page.on('pageerror', e => console.error('[Browser Error]', e.message));

await page.goto(URL, { waitUntil: 'networkidle0' });
await page.waitForFunction('window.OPENER && window.OPENER.ready && (!window.OPENER.clipsReady || window.OPENER.clipsReady())', { timeout: 60000 });

const { W, H } = await page.evaluate(() => ({ W: window.OPENER.W || 1920, H: window.OPENER.H || 1080 }));
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

console.log(`Capturing QA snapshots for ${W}x${H} canvas into ${outDir}/:`);

for (const ts of times) {
  const t = Number(ts);
  await page.evaluate(async (time) => {
    if (window.OPENER.seekFrame) {
      await window.OPENER.seekFrame(time);
      window.OPENER.seek(time);
    } else {
      window.OPENER.seek(time);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      window.OPENER.seek(time);
    }
  }, t);

  const shotPath = `${outDir}/t${t.toFixed(2).replace('.', '_')}.png`;
  await page.screenshot({ path: shotPath, clip: { x: 0, y: 0, width: W, height: H } });
  process.stdout.write(` [t=${t}s -> ${shotPath}]`);
}

await browser.close();
console.log('\n✓ Snapshots captured successfully.');

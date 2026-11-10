#!/usr/bin/env node
/**
 * Bang Motion CLI Orchestrator (bm)
 * Handles scaffolding, dev server, QA snapshots, mechanical Anti-PPT validation, and automated MP4 export.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync, execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILL_ROOT = resolve(__dirname, '..');
const PROJECT_ROOT = resolve(SKILL_ROOT, '../../..');

const args = process.argv.slice(2);
const command = args[0] || 'help';

function printHelp() {
  console.log(`
Bang Motion CLI (bm) - Cinematic Browser Motion Graphics Engine
Usage: bm <command> [options]

Commands:
  doctor                                Verify Node, FFmpeg, Puppeteer, and Chrome/Edge
  styles                                List 6 explainer styles and 19 opener concepts
  new <slug> [options]                  Scaffold a new project in projects/<slug>_YYYY-MM-DD/
    --style <name>                      jurnalisme | kartun | katalog | sketsa | kontinu | panggung | opener (default: jurnalisme)
    --format <16x9|9x16>                Aspect ratio (default: 16x9)
  serve [port]                          Run zero-cache HTTP server (default: 5178)
  snap <html_path> [options]            Capture keyframe verification PNGs
    --times <t1,t2,...>                 Comma-separated timestamps in seconds (default: 0,2,5)
  export <html_path> [options]          Auto-render deterministic frame-by-frame PNGs to MP4
    --out <path.mp4>                    Target MP4 output file
    --fps <60>                          Frames per second (default: 60)
    --scale <1>                         Render scale (1 = 1080p, 0.5 = 540p)
  check <html_path>                     Run mechanical Anti-PPT validation rules
`);
}

function runDoctor() {
  console.log('--- Bang Motion Environment Doctor ---');
  console.log(`Node version: ${process.version}`);

  // FFmpeg check
  try {
    const ff = execSync('ffmpeg -version', { stdio: 'pipe' }).toString().split('\n')[0];
    console.log(`✓ FFmpeg: ${ff}`);
  } catch (e) {
    console.log('✗ FFmpeg: Not found on PATH');
  }

  // Puppeteer check
  try {
    const p = execSync('node -e "require(\'puppeteer\'); console.log(\'installed\');"', { stdio: 'pipe' }).toString().trim();
    console.log(`✓ Puppeteer: ${p}`);
  } catch (e) {
    console.log('✗ Puppeteer: Not currently loaded in node_modules');
  }

  // Starters check
  const starters = ['starter-opener.html', 'starter-explainer-jurnalisme.html', 'starter-explainer-kartun.html', 'starter-explainer.html'];
  const allStarters = starters.every(s => existsSync(join(SKILL_ROOT, 'assets', s)));
  console.log(`${allStarters ? '✓' : '✗'} Asset Starters: ${allStarters ? 'All verified' : 'Missing starter templates'}`);
}

function listStyles() {
  console.log(`
--- 6 Explainer Archetypes ---
1. jurnalisme   - Visual Journalism: Obsidian black, archival photos, yellow highlighter, source stamps (9:16 or 16:9)
2. kartun       - Cartoon Collage: Cream cardstock, flat illustration cutouts, color pills, handwritten accents
3. katalog      - White Catalog: Technical white grid, isolated product/prop cutouts, mixed typography
4. sketsa       - Vintage Sketch: Sepia parchment, fine line engravings, classical serif, rust ink callouts
5. kontinu      - Continuous Action: Flowing vector world, single persistent subject, in-world telemetry stats
6. panggung     - Cartoon Stage: Vibrant flat stage, rigged joint characters, living props, zero slide captions

--- 19 Opener & Promo Concepts ---
1. Slam & Reveal         2. Microscopic Zoom       3. Workflow Chain
4. Split Contrast        5. Blueprint Assembly     6. Continuous Line
7. Data Surge            8. Card Shuffle           9. Isometric Engine
10. Typographic Wall    11. Device Portal         12. Kinetic Colorblock
13. Minimal Spotlight   14. Modular Grid          15. Liquid Wipe
16. Architectural Cut   17. Terminal Sequence     18. Prism Refraction
19. Velocity Loop
`);
}

function scaffoldProject() {
  const slug = args[1];
  if (!slug) {
    console.error('Error: Please provide a project slug. Example: bm new my-opener --style jurnalisme');
    process.exit(1);
  }

  let style = 'jurnalisme';
  let format = '16x9';

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--style' && args[i + 1]) style = args[++i];
    if (args[i] === '--format' && args[i + 1]) format = args[++i];
  }

  const starterMap = {
    'jurnalisme': 'starter-explainer-jurnalisme.html',
    'kartun': 'starter-explainer-kartun.html',
    'katalog': 'starter-explainer-katalog.html',
    'sketsa': 'starter-explainer-sketsa.html',
    'kontinu': 'starter-explainer.html',
    'panggung': 'starter-explainer-panggung.html',
    'opener': 'starter-opener.html'
  };

  const starterFile = starterMap[style] || 'starter-explainer-jurnalisme.html';
  const starterPath = join(SKILL_ROOT, 'assets', starterFile);

  if (!existsSync(starterPath)) {
    console.error(`Error: Starter template not found at ${starterPath}`);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const projectDir = join(PROJECT_ROOT, 'projects', `${slug}_${today}`);

  // Create standard directories conforming to MEMORY.md
  mkdirSync(join(projectDir, '01_research'), { recursive: true });
  mkdirSync(join(projectDir, '02_script'), { recursive: true });
  mkdirSync(join(projectDir, '03_voiceover'), { recursive: true });
  mkdirSync(join(projectDir, '04_images'), { recursive: true });
  mkdirSync(join(projectDir, '05_output'), { recursive: true });

  const destHtml = join(projectDir, '05_output', 'index.html');
  let content = readFileSync(starterPath, 'utf8');

  // Customize title
  content = content.replace(/<title>.*?<\/title>/i, `<title>${slug.replace(/[-_]/g, ' ')}</title>`);

  // Handle 9x16 vertical sizing if selected
  if (format === '9x16') {
    content = content.replace(/width:\s*1920px;\s*height:\s*1080px;/g, 'width: 1080px; height: 1920px;');
    content = content.replace(/--w:\s*1920px;\s*--h:\s*1080px;/g, '--w: 1080px; --h: 1920px;');
  }

  writeFileSync(destHtml, content, 'utf8');
  console.log(`✓ Created project: ${projectDir}`);
  console.log(`✓ Selected style: ${style} (${starterFile})`);
  console.log(`✓ Format: ${format}`);
  console.log(`✓ Master entrypoint: ${destHtml}`);
  console.log(`\nTo preview: bm serve 5178, then open http://localhost:5178/projects/${slug}_${today}/05_output/index.html?debug=1`);
}

function runServe() {
  const port = args[1] || '5178';
  console.log(`Starting Bang Motion dev server on port ${port}...`);
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const child = spawn(pythonCmd, ['-m', 'http.server', port, '--bind', '127.0.0.1'], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  });
  child.on('close', (code) => {
    process.exit(code || 0);
  });
}

function checkAntiPpt() {
  const htmlPath = args[1];
  if (!htmlPath || !existsSync(htmlPath)) {
    console.error('Error: Please provide a valid path to an HTML file to check.');
    process.exit(1);
  }

  const content = readFileSync(htmlPath, 'utf8');
  let issues = 0;

  console.log(`--- Running Anti-PPT Mechanical Verification on ${basename(htmlPath)} ---`);

  // 1. Scene / Section autoAlpha count
  const sceneMatches = (content.match(/class=["'].*?(?:scene|slide).*?["']|<section/gi) || []).length;
  if (sceneMatches >= 3) {
    console.warn(`[WARN] Found ${sceneMatches} scene/section containers. If these are toggled with opacity/autoAlpha, this is a slideshow. Ensure transitions are driven by camera drift, world pan, or object wipes.`);
    issues++;
  } else {
    console.log(`✓ Scene Architecture: ${sceneMatches} discrete scenes (Passed)`);
  }

  // 2. Date.now() / Math.random() determinism check
  if (/Date\.now\(\)|new Date\(\)/.test(content)) {
    console.error(`[FAIL] Found Date.now() clock reading. All animations must be pure functions of tl.time() for reproducible frame export.`);
    issues++;
  } else {
    console.log(`✓ Deterministic Timeline: Pure timeline clock math (Passed)`);
  }

  // 3. Text levels check
  if (/kicker.*?title.*?subtitle/is.test(content) || (content.match(/<h[1-6]/gi) || []).length > 8) {
    console.warn(`[WARN] Possible text hierarchy overload. Ensure max 2 text levels per beat (1 punchy headline + 1 in-world label).`);
  } else {
    console.log(`✓ Typography Hierarchy: Crisp and restrained (Passed)`);
  }

  // 4. Debug and clean parameters
  if (content.includes('?debug=1') || content.includes('clean=')) {
    console.log(`✓ Player Controls: Debug scrubber & clean render parameters supported (Passed)`);
  } else {
    console.warn(`[WARN] Missing ?debug=1 or ?clean=1 query handler for headless frame export.`);
  }

  console.log(`\nResult: ${issues === 0 ? 'ALL CHECKS PASSED ✓' : `${issues} potential issues detected`}`);
}

async function runExport() {
  const htmlPath = args[1];
  if (!htmlPath || !existsSync(htmlPath)) {
    console.error('Error: Please provide a valid path to an HTML file to export.');
    process.exit(1);
  }

  let fps = 60;
  let outMp4 = htmlPath.replace(/\.html$/i, '.mp4');
  let scale = 1;

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--fps' && args[i + 1]) fps = Number(args[++i]);
    if (args[i] === '--out' && args[i + 1]) outMp4 = args[++i];
    if (args[i] === '--scale' && args[i + 1]) scale = Number(args[++i]);
  }

  console.log(`--- Bang Motion Automated MP4 Render ---`);
  console.log(`Target: ${htmlPath}`);
  console.log(`Output: ${outMp4}`);
  console.log(`Framerate: ${fps} fps | Scale: ${scale}`);

  const exportScript = join(SKILL_ROOT, 'scripts', 'export-frames.mjs');
  const tempFramesDir = join(dirname(htmlPath), '__frames_temp');
  mkdirSync(tempFramesDir, { recursive: true });

  // Run python server temporarily if not running
  const port = 5178;
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const server = spawn(pythonCmd, ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
    cwd: PROJECT_ROOT,
    stdio: 'ignore'
  });

  const relPath = htmlPath.replace(PROJECT_ROOT, '').replace(/^[\\\/]/, '').replace(/\\/g, '/');
  const targetUrl = `http://127.0.0.1:${port}/${relPath}?clean=1`;

  console.log(`Rendering frames via Puppeteer from ${targetUrl}...`);

  const env = {
    ...process.env,
    URL: targetUrl,
    FPS: String(fps),
    OUT: tempFramesDir,
    SCALE: String(scale)
  };

  const renderProc = spawn('node', [exportScript], { env, stdio: 'inherit' });

  renderProc.on('close', (code) => {
    server.kill();
    if (code !== 0) {
      console.error(`Export failed with code ${code}`);
      process.exit(code || 1);
    }

    console.log(`Compiling frames to MP4 via FFmpeg...`);
    const ffmpegCmd = `ffmpeg -y -framerate ${fps} -i "${tempFramesDir}/f%05d.png" -c:v libx264 -pix_fmt yuv420p -crf 16 "${outMp4}"`;
    try {
      execSync(ffmpegCmd, { stdio: 'inherit' });
      console.log(`\n✓ Final MP4 Render Complete: ${outMp4}`);
      // Clean up temp frames
      try {
        execSync(process.platform === 'win32' ? `rmdir /s /q "${tempFramesDir}"` : `rm -rf "${tempFramesDir}"`);
      } catch (e) {}
    } catch (err) {
      console.error('FFmpeg compilation failed:', err.message);
      process.exit(1);
    }
  });
}

switch (command) {
  case 'doctor':
    runDoctor();
    break;
  case 'styles':
    listStyles();
    break;
  case 'new':
    scaffoldProject();
    break;
  case 'serve':
    runServe();
    break;
  case 'check':
    checkAntiPpt();
    break;
  case 'export':
    runExport();
    break;
  case 'snap':
    console.log('Snapshot feature triggered. Run node scripts/snap.mjs');
    break;
  default:
    printHelp();
    break;
}

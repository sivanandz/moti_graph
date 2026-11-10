---
name: bang-motion
description: Build cinematic browser motion graphics (promos, openers, kinetic typography, bumpers, and 6 explainer styles in 16:9 or 9:16) using HTML + CSS + GSAP (+ Three.js). Delivers single-file index.html that plays like video, not slides, with automated frame-by-frame MP4 export via Puppeteer/FFmpeg. Features 19 opener concepts, 6 explainer styles (visual journalism, cartoon collage, white catalog, vintage sketch, continuous action, cartoon stage), deterministic tl.time() math, and hybrid Remotion integration.
---

# `/bang-motion` — Cinematic Browser Motion Graphics & Explainer Engine

> **v1.19.0 adapted for Google Antigravity & Remotion Studio**  
> Based on [`bangtutorial/bang-motion`](https://github.com/bangtutorial/bang-motion).  
> Delivers single-file browser motion graphics (`index.html`) that move like real video, with deterministic frame-accurate timeline physics, zero-drop headless MP4 export, and hybrid Remotion compositing.

---

## 1. Quick Start CLI (`bm.ps1` / `bm.sh`)

Paralleling `sm` (`style-motion`) and `an` (`animate`), use the `bm` CLI directly:

| Platform | Command |
|---|---|
| **Windows (`pwsh`)** | `.\bm.ps1 <subcommand> [args]` |
| **Linux / macOS (`bash`)** | `./bm.sh <subcommand> [args]` |
| **Direct Node** | `node .agents/skills/bang-motion/scripts/cli.mjs <subcommand> [args]` |

### CLI Subcommands

| Subcommand | Description |
|---|---|
| `bm doctor` | Check environment: Node, FFmpeg, Puppeteer, local dev server |
| `bm styles` | List the 6 explainer styles and 19 opener concepts |
| `bm new <slug> --style <name> --format <16x9\|9x16>` | Scaffold a new project inside `projects/<slug>_YYYY-MM-DD/` with starter HTML |
| `bm serve [port]` | Launch the zero-cache local development server (default port `5178`) |
| `bm snap <html_path>` | Capture automated QA verification snapshots at key timestamps |
| `bm export <html_path> [--out video.mp4] [--fps 60]` | Auto-render deterministic frame-by-frame PNG sequence to MP4 |
| `bm check <html_path>` | Run mechanical Anti-PPT validation checks on the HTML/JS code |

---

## 2. The 3 Core Laws of Motion Design

### Law #1: It's Video, Not Slides (Anti-PPT)
AI models naturally default to slide decks: kicker + title + body copy + badge row. That immediately reads as "PowerPoint" and must be rejected:
- **One Short Statement + One Main Visual Subject per Beat**: Keep headline text under 6 words.
- **New Information = New Visual State**: In explainers, transform the existing world rather than cutting to a blank screen.
- **No Bullet Lists as Generic 3-Card Grids**: Pick from the feature menu (demonstrated UI action, transforming object, shuffled cards, kinetic type).
- **Living Camera Scale**: Use motivated camera framing (Medium Close-Up, Close-Up, Wide) rather than shallow 1.0 -> 1.05 zooms.

### Law #2: Deterministic or Dead
No code may read system clocks (`Date.now()`, unseeded random). Every visual state, particle position, camera vibration, and counter is a pure mathematical function of `tl.time()` (GSAP timeline time). This guarantees identical frame-by-frame MP4 rendering.

### Law #3: Style Derives from Brand & Theme
Never inherit styles from starters or copy reference videos.
- Style Brief must precede code: Theme, 3 emotion adjectives, structure fingerprint, brand palette, display font with character, background motion language, and one signature moment.
- Reference videos provide **rhythm, cadence, and energy**—never copy their palette, typography, layout, or unique gimmicks.

---

## 3. The 8 Mechanical Anti-PPT Invariants

Before delivering any video, execute mechanical checks on the code:
1. **Section Count Violation**:
   `grep -c "class=\"scene\"\|<section" index.html`
   If ≥ 3 sections are toggled on/off via `autoAlpha`/`opacity`, it's a slideshow. Transitions must be driven by world movement, camera pan/whip, push-throughs, or changing backgrounds.
2. **Persistent Visual Thread**:
   One hero subject or continuous physical world must persist across ≥ 60% of runtime.
3. **Max 2 Text Levels**:
   At most one punchy headline/claim + one in-world label per scene. Kicker + title + subtitle = instant PPT.
4. **Living Background System**:
   Backgrounds must continuously breathe, shift gradients, drift particles, or sweep light. Static backdrops are prohibited.
5. **Varied Transitions**:
   Never use repetitive fade-and-zoom presets across every cut. Use 3D push-throughs, object wipes, and whip cuts to instruments.
6. **Starter Architecture Discipline**:
   Always scaffold from the designated style starter (`starter-explainer-jurnalisme.html`, `starter-explainer-kartun.html`, etc.), never from scratch or generic openers.
7. **No Miniature Dioramas**:
   Camera zoom must stay bold (`1.08` to `1.95`). Zooming out so subjects look like tiny thumbnail toys inside empty space reads as a static map slide.
8. **No Template Openers**:
   Avoid the generic formula (big text zooming left → 3 feature cards → search bar → CTA). Pick distinct concepts from `opener-konsep.md`.

---

## 4. The 6 Explainer Archetypes

| # | Style | Visual Feel | Best For | Visual Assets |
|---|---|---|---|---|
| **1** | **Cartoon Collage (`kartun-kolase`)** | Cream cardstock, flat illustration cutouts, color pills, handwriting | Science education, approachable explainers | Isolated illustration cutouts + color accents |
| **2** | **Visual Journalism (`jurnalisme-visual`)** | Obsidian black, authentic archival photography, yellow highlighter, source stamps | Investigative reports, history, geopolitics | Real public-domain photos (Wikimedia, NASA, Bell Labs) |
| **3** | **White Catalog (`katalog-putih`)** | Technical white grid, isolated product/prop cutouts, mixed typography, scribbles | Product demos, hardware, technology | Isolated PNG cutouts with drop shadows |
| **4** | **Vintage Sketch (`sketsa-vintage`)** | Sepia parchment, fine line engravings, classical serif, rust ink callouts | History, biographies, classical discoveries | Architectural plates, historical engravings |
| **5** | **Continuous Action (`aksi-kontinu`)** | Flowing vector world, single persistent subject, in-world telemetry stats | Relativistic physics, ballistics, transport | Pure procedural SVG/Canvas paths |
| **6** | **Cartoon Stage (`kartun-panggung`)** | Vibrant flat stage, rigged joint characters, living props, zero slide captions | Character-driven education, dynamic processes | Vector limbs/bodies + expressive facial portraits |

---

## 5. The 19 Opener & Promo Concepts

When building product openers, promos, or teasers, select from the 19 concepts in `references/opener-konsep.md`:
1. **The Slam & Reveal**: Massive typographic statement shattered by product hero entrance.
2. **The Microscopic Zoom**: Extreme macro detail pulling back into full product reveal.
3. **The Workflow Chain**: Fast-paced sequence showing input → tool action → final result.
4. **The Split Contrast**: Two opposing worlds colliding on the beat.
5. **The Blueprint Assembly**: Vector wireframe schematic snapping into textured physical form.
6. **The Continuous Line**: Single unbroken vector stroke navigating through 4 key features.
7. **The Data Surge**: Procedural numbers and telemetry curves climaxing at the core claim.
8. **The Card Shuffle**: Dynamic stack of physical cards flicking forward in perspective.
9. **The Isometric Engine**: Exploded 3D view of internal mechanics.
10. **The Typographic Wall**: Wall of kinetic text revealing the hero through negative space.
*(Refer to `references/opener-konsep.md` for complete concepts 11–19).*

---

## 6. Hybrid Remotion Integration

`bang-motion` integrates seamlessly with our Remotion and `style-motion` pipeline in two ways:

### Mode A: Auto-Rendered MP4 / Transparent WebM Layer
Render any Bang Motion project to transparent WebM or high-bitrate MP4:
```powershell
.\bm.ps1 export projects/MyProject_2026-11-10/05_output/index.html --out public/bang_layer.webm --fps 60
```
Composite directly inside Remotion using `<BangMotionOverlay />` or `<OffthreadVideo />`:
```tsx
import { BangMotionOverlay } from "./BangMotionOverlay";

<BangMotionOverlay src="bang_layer.webm" transparent />
```

### Mode B: Direct Remotion Scene Layout (`layout: "bang"`)
In `style_motion.json`, declare:
```json
{
  "id": 1,
  "seconds": 5.0,
  "layout": "bang",
  "kicker": "ACT 01",
  "headline": "THE SHOCKING INVERSION",
  "bang": {
    "style": "jurnalisme-visual",
    "video": "bang_layer.mp4"
  }
}
```

---

## 7. Deliverable Standards & Verification

- **Default Deliverable**: Full-fidelity MP4 auto-rendered via `bm export` + self-contained `index.html` with hidden controls:
  - `Space`: Pause / Play
  - `R`: Replay from frame 0
  - `?debug=1`: Toggle scrubber bar and precise timecode readout
  - `?clean=1`: Suppress autoplay for headless rendering
- **Quality Assurance**: Run `bm snap` to capture test frames at timestamps `0s`, `2s`, `5s`, and the narrative climax before delivery.

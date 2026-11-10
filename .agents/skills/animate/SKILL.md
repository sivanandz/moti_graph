---
name: animate
description: >-
  Universal procedural single-file HTML5 <canvas> animation and hybrid Remotion layer skill
  (adapted from cth9191/animate for Google Antigravity, OpenCode, ZCode, DeepSeek Harness, Hermes Agent,
  and Claude Code). Features 7 tactile procedural drawing kits (cut-paper, crosshatch, riso, sketchbook,
  manim-math, pixel-art, isometric), 3 mandatory checkpoints (Story, Look Still, Contact-Sheet Storyboard),
  BPM beat-grid synthesis, reference style comparison, and seamless Remotion (<ProceduralCanvas />) integration.
---

# `/animate` — Universal Procedural `<canvas>` & Hybrid Motion Engine

> **Multi-Agent Portable:** Works identically across **Google Antigravity**, **OpenCode**, **ZCode**, **DeepSeek Harness**, **Hermes Agent**, and **Claude Code** via a zero-dependency CLI (`an.ps1` / `an.sh` / `animate.mjs`) and native Remotion bridge (`<ProceduralCanvas />`).

---

## 1. Universal CLI Quick Start

| Platform / Agent Harness | Command |
|---|---|
| **Windows / Antigravity (`pwsh`)** | `.\an.ps1 <subcommand> [args]` |
| **Linux / macOS / OpenCode / ZCode (`bash`)** | `./an.sh <subcommand> [args]` |
| **Any Agent (Direct Node)** | `node .agents/skills/animate/tools/animate.mjs <subcommand> [args]` |

| Subcommand | Purpose |
|---|---|
| `an doctor` | Verify Node, Headless Browser, FFmpeg, and all 7 procedural kits |
| `an styles` | List the 7 built-in procedural drawing kits |
| `an new <slug> --style <kit> --format <9x16\|16x9\|4x5\|1x1> [--bpm 120]` | Scaffold `piece.json`, single-file `index.html`, and BPM audio score |
| `an build <slug>` | Recompile `piece.json` + kit into self-contained `05_output/index.html` |
| `an still <slug> [--frame F] [--beat B]` | **Checkpoint 2 (Look Check)**: Render a full-resolution test frame PNG |
| `an storyboard <slug>` | **Checkpoint 3 (Storyboard Check)**: Render `TIMELINE.board` contact sheet grid |
| `an compare <ref.png> <cand.png>` | Compute MSE, edge density, and contrast similarity + visual diff sheet |
| `an beats <slug> [--bpm 120]` | Synthesize beat-mapped procedural WAV score (`score.wav`) + `beats.json` |
| `an render <slug> [--transparent] [--webm]` | Render deterministic MP4 or alpha-transparent VP9 `.webm` for Remotion |
| `an harnesses` | Generate adapter specs for OpenCode, ZCode, DeepSeek, and Hermes Agent |

---

## 2. The 3 Mandatory Checkpoints (Never Code Blindly)

Before rendering a full video, walk through three structured checkpoints:

1. **Checkpoint 1 — Story & Beat Table Check**:
   - Present format (`9x16` / `16x9`), BPM, visual kit, and numbered `TIMELINE.board` beat table (start/end seconds, headline, spoken caption, visual action).
   - Enforce the **15-Second Inversion Hook** in Beat 1.
2. **Checkpoint 2 — Look Check (`an still <slug>`)**:
   - Render 1–2 representative frames with `.\an.ps1 still <slug> --beat 1` and verify palette, contrast, and safe-area margins (`x: 60–940, y: 250–1570` on `9x16`).
   - When matching a reference image, run `.\an.ps1 compare <ref.png> <look_check.png>` to verify visual similarity score.
3. **Checkpoint 3 — Contact-Sheet Storyboard Check (`an storyboard <slug>`)**:
   - Run `.\an.ps1 storyboard <slug>` to generate `05_output/storyboard_contact_sheet.png` showing every beat panel side-by-side before committing to full video rendering.

---

## 3. The 7 Procedural Drawing Kits

Each kit in `kit/styles.js` is a plug-in procedural renderer driven deterministically by `window.renderFrame(frame)`:

1. **`cut-paper`**: Self-healing cutting mat (`#123544`), polygonal scissor-cut white paper borders (`8px–14px`), Ben-Day halftone dot matrices, constructivist Cadmium Yellow slices (`zIndex <= 0`), and stepped 15fps stop-motion physics.
2. **`crosshatch`**: Frame-by-frame "boiling" ink outlines (`Math.floor(frame / 3)`), directional nib-pen cross-hatching, and warm archival parchment (`#F3EDE0`).
3. **`riso`**: Multi-ink Risograph print plates (Sunflower Yellow, Risograph Blue, Fluorescent Pink) using `multiply` blending, halftone dot screens, and intentional `2px–5px` plate misregistration jitter.
4. **`sketchbook`**: Multi-pass graphite pencil strokes on lined cream paper (`#FAF6EE`), animated felt highlighter sweeps (`#F2B705`), and red grease-pencil focal circles.
5. **`manim-math`**: Deep obsidian space (`#0D1117`), glowing parametric function curves, shaded integrals, and moving `ValueTracker` dots.
6. **`pixel-art`**: Integer-snapped low-res pixel grid (`imageSmoothingEnabled = false`), ordered dithering, and retro 16-bit palette.
7. **`isometric`**: True `30°` axonometric CAD projection (`isoProject(x, y, z)`), staggered 3D architectural blocks, and animated telemetry conduits.

---

## 4. Hybrid Bridge with `style-motion` & `vox-motion-graphics`

`animate` connects directly with your existing Remotion skills in two ways:

### Mode A: Live `<ProceduralCanvas />` Component Inside Remotion
Import `ProceduralCanvas` into any Remotion scene or declare `"canvas"` inside `style_motion.json`:
```json
{
  "id": 2,
  "seconds": 4.0,
  "layout": "canvas",
  "kicker": "BEAT 02",
  "headline": "RISOGRAPH TELEMETRY",
  "accent": ["TELEMETRY"],
  "caption": "Multi-ink halftone plates vibrate at 15 frames per second.",
  "canvas": { "kit": "riso", "bpm": 128, "transparent": true }
}
```

### Mode B: Pre-Rendered Alpha-Transparent `.webm` Overlay
Render any complex single-file `<canvas>` animation as a transparent VP9 WebM layer:
```powershell
.\an.ps1 render <slug> --transparent --webm --out "production_hub/<slug>/02_assets/style_motion/s02_plot.webm"
```
Remotion's `<OffthreadVideo transparent />` composites the procedural canvas layer directly behind or beside NanoBanana cutouts and archival photos.

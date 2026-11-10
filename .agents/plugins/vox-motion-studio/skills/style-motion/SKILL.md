---
name: style-motion
description: Make motion graphics in any visual style. Learn a style from reference images or a video, generate each scene as separate transparent layers via Google Antigravity NanoBanana 2+ (plate, hero, props, backdrop) or animated plots/graphs with Manim Community (line, bar, function, scatter, area, network), and animate the layers in code with Remotion. Formats 9x16, 4x5, 1x1, 16x9; layouts orbit, fullbleed, stack, split, plot. Antigravity adaptation with Windows PowerShell support.
---

# /style-motion — Any Reference Style, Animated in Code (Antigravity Edition)

AI draws the parts; Manim plots the data; code moves them. Google Antigravity NanoBanana 2+ generates every scene as separate transparent layers in a saved style (with local PIL/scipy border keying), **Manim Community** (`https://docs.manim.community/en/stable/`) renders style-locked animated charts/graphs/functions as alpha-transparent WebM layers, and a Remotion composition stacks and animates those layers with frame math. Nothing is image-to-video, so the art stays consistent and every motion choice is editable and repeatable.

## Antigravity Quick Start (Windows & Cross-Platform)

Run directly using the included project shims:

```powershell
# Windows PowerShell (Antigravity default):
.\sm.ps1 doctor          # Checks Antigravity CLI (agy), npx, ffmpeg, Manim, Remotion, templates, styles
.\sm.ps1 styles          # List saved styles and default layouts
```

Or on Linux / macOS / Bash:
```bash
python .agents/skills/style-motion/scripts/style_motion.py doctor
```

| Command | Does |
|---|---|
| `sm styles` | list saved styles and their default layout |
| `sm learn <name> <refs...>` | new style folder from images or a video (6 frames sampled, palette measured) |
| `sm new <slug> --style S --format F --scenes N [--plot]` | scaffold `<projects>/<slug>/04_data/style_motion.json` (`--plot` seeds Manim plot presets) |
| `sm plot <slug> [--scene N] [--force]` | Manim Community: render animated plots/graphs (`sNN_plot.webm` + `.png` preview), cached |
| `sm assets <slug> [--scene N]` | Antigravity NanoBanana + Manim: plate + cut-outs + animated plots per scene, cached |
| `sm render <slug> [--still] [--layout L] [--format F] [--out name]` | QA stills or the MP4 |
| `sm summary <slug>` | asset inventory and generation manifest for the campaign ($0.00 external spend) |
| `sm install` / `sm pack` | copy Remotion templates into Remotion project `src/` / zip skill package |
| `sm doctor` | verify system prerequisites (Antigravity CLI, Manim, LaTeX, Remotion), PATH tools, and style schemas |

### Antigravity Path Auto-Detection
- **Image Generation**: Local Google Antigravity CLI (`agy.exe`) powering NanoBanana 2+ image generation; cutouts keyed locally with PIL + scipy flood fill.
- **Remotion Project**: Auto-detects root `package.json` with Remotion, or subfolder `remotion_studio/`. Overridable via `STYLE_MOTION_REMOTION`.
- **Manim Engine**: Auto-detects `manim` on `PATH` or `~/.local/bin/manim.exe` (`uv tool install --python 3.12 manim`). Overridable via `STYLE_MOTION_MANIM`.
- **Command Runner**: Automatically uses `npx.cmd` on Windows / `npx` on Unix.

---

## 1. Pick or Learn a Style

Run `.\sm.ps1 styles` first. Reuse a style when the look fits; a new look becomes a new style file, never a
one-off prompt in a plan.

New style: `.\sm.ps1 learn <name> <ref.jpg|ref.mp4 ...>`, then **look at every ref image** and rewrite the
draft `style.json` field by field with `references/style-authoring.md`: palette roles, background,
layout, ornaments, motion preset, type, `imagePrompt`, `elementPrompt` (keeps `{subject}` and "plain
pure white background"), `negative`. Delete refs that contain UI, captions or watermarks; keep 3–4
clean frames.

Test before trusting it: a 1-scene plan, `.\sm.ps1 assets <slug> --scene 1`, `.\sm.ps1 render <slug> --still`.

---

## 2. Choose Format and Layout

Format follows the channel: `9x16` reels/shorts, `4x5` feed, `1x1` square, `16x9` YouTube/web.
Layout follows the content; set it per style and override per scene with `"layout"` in the plan:

| Layout | Use for | Shows |
|---|---|---|
| `orbit` | object-led stories, one metaphor per beat | circles + backdrop + hero/plot centre + props around + ring |
| `fullbleed` | painterly or photographic styles where the composed plate is the shot | plate full frame, slow push-in, type over a paper fade |
| `stack` | lists, "3 things", tool explainers | hero/plot on top, props in a row below |
| `split` | 16x9 explainers, talking points | text left, art/plot right (portrait: art/plot top, text below) |
| `plot` | data visualization, telemetry, math functions, network diagrams | framed Manim animated plot inside safe box + headline above + caption below |

### 2.1 Safe Area (mandatory for social formats)

All content-bearing layers — kicker, headline, accent words, hero, plots, props, captions — must stay inside the
platform safe frame. Platform UI (status bar, caption/CTA buttons, action rail) covers the rest of a
9x16/4x5 viewport; decorative backdrop and fullbleed plates may bleed to the edges, content may not.

| Format | Canvas | Safe insets (top / bottom / left / right) | Reserved zones |
|---|---|---|---|
| `9x16` | 1080×1920 | 250px / 350px / 60px / 140px | status bar + camera notch; caption & CTA UI; thumb rail; right-edge like/comment/share action rail |
| `4x5` | 1080×1350 | 120px / 220px / 60px / 60px | feed header and bottom UI |
| `1x1` | 1080×1080 | 60px / 60px / 60px / 60px | feed UI margins |
| `16x9` | 1920×1080 | 60px / 60px / 60px / 60px | minimal UI overlap |

```ts
// 9x16 content box for custom Remotion layouts: x 60–940, y 250–1570
export const SAFE_9X16 = { top: 250, bottom: 350, left: 60, right: 140 };
```

- `9x16`: headlines sit in the upper-middle band (y ≈ 300–900) — lower thirds are the first zone
  platforms cover; nothing content-bearing goes in the right 140px action rail or below y=1570.
- In portrait `split` and `plot`, the art/plot block shrinks to the safe box; never push the hero or chart behind the caption zone.
- Custom Remotion layouts must wrap content in a safe-frame container using these constants; only bleed
  layers may render outside it.

---

## 3. Plan the Scenes (& Manim Plots)

One voice-over beat per scene, 3–5 s. `.\sm.ps1 new <slug> --style S --format F --scenes N [--plot]`, then fill each
entry: `kicker` (optional label), `headline` (2–4 words), `accent` (words in the accent colour),
`caption` (spoken line), `scene` (the whole composition, used for the plate), `hero` (specific and
drawable), `props` (1–4 supporting objects), `backdrop`, `circles`, `layout`, and `seconds`.

### 3.1 Adding Animated Plots & Graphs (`plot` block)

Any scene can include a `"plot"` specification rendered by **Manim Community** (`scripts/manim_plots.py`). Full schema and examples in [`references/manim-plots.md`](references/manim-plots.md):

- **Declarative Presets (`plot.type`)**:
  - `"line"`: Single or multi-series time-series chart with animated trace, dot pop-ins, end-value badge, and optional threshold line.
  - `"bar"`: Vertical bar chart with staggered bar growth and value headers.
  - `"function"`: Continuous math curve `fn` (e.g. `"math.sin(2*x) * math.exp(-0.2*x)"`), optional shaded integral area (`fill_area`), and animated `ValueTracker` dot (`tracker`).
  - `"scatter"`: 2D scatter/bubble chart with optional linear regression `trendline`.
  - `"area"`: Shaded area chart under data curve.
  - `"network"` / `"graph"`: Directed or undirected node-link graph with animated node & edge creation.
- **Custom Manim Escape Hatch**:
  - `"type": "custom", "code": "..."` (inline Python `construct` body) or `"script": "path/to/scene.py", "scene_class": "MyScene"` with `STYLE_PALETTE` automatically injected.
- **Compositing**:
  - `"transparent": true` (default) renders a VP9+Alpha `.webm` (`sNN_plot.webm`) composited via `<OffthreadVideo transparent muted />` in either the dedicated `"plot"` layout or overlaid inside `orbit` / `split` / `stack`.
  - `"transparent": false` renders an opaque `.mp4` with `palette.paper` background.
  - Set `"skip_image": true` (or leave `"hero": ""`) on pure data-viz scenes to skip image generation completely.
- **Typography**:
  - Uses Pango `Text` with `style.json` fonts by default (zero LaTeX dependency). Set `"use_latex": true` when MiKTeX/TeXLive + `dvisvgm` are installed to render `MathTex` equations.

---

## 4. Generate the Layers & Plots

- **Plots only**: `.\sm.ps1 plot <slug> [--scene 1]` renders `02_assets/style_motion/s01_plot.webm` (plus `s01_plot.png` preview).
- **All assets (NanoBanana + Manim)**: `.\sm.ps1 assets <slug> --scene 1`, inspect `02_assets/style_motion/s01_*.png` and `s01_plot.webm`, then `.\sm.ps1 assets <slug>`.
- Requests are cached by content hash in `production_hub/assets/gen_cache/`.

---

## 5. Render and QA

`.\sm.ps1 render <slug> --still` writes entry and exit frames per scene to `04_video/qa/`.
Check that hero and plot labels read clearly at mobile size, headline clears the art, and style fonts are used.
Safe-area gate: check entry/exit stills against the format's safe insets (§2.1) — any content-bearing
layer clipped by platform UI zones is a fail; re-layout and re-render before the full MP4.
Then render full video: `.\sm.ps1 render <slug>`.

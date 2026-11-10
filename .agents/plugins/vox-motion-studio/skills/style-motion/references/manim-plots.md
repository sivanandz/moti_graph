# Manim Plots & Graphs Reference (`style-motion`)

`style-motion` integrates **Manim Community** (https://docs.manim.community/en/stable/) to render style-locked animated charts, mathematical functions, and network graphs.

Every plot automatically inherits the active `style.json` palette (`paper`, `paperShade`, `ink`, `accent`, `accent2`, `muted`, `rule`, `pill`) and font hierarchy (`type.headline.font`, `type.caption.font`).

---

## 1. CLI Commands

```powershell
# Scaffold a plot-enabled campaign plan
.\sm.ps1 new <slug> --style vox-halftone-cutout --format 9x16 --scenes 4 --plot

# Render Manim plots for all scenes (or a specific scene)
.\sm.ps1 plot <slug>
.\sm.ps1 plot <slug> --scene 1 --force

# Render QA stills or full MP4 via Remotion
.\sm.ps1 render <slug> --still
.\sm.ps1 render <slug>
```

> **Note:** `.\sm.ps1 assets <slug>` also automatically renders Manim plots for any scene containing a `"plot"` object. If a scene sets `"skip_image": true` (or has `"plot"` and an empty `"hero": ""`), `sm assets` skips image generation for that scene ($0.00 API cost).

---

## 2. Compositing & Layout Modes

### Mode A: Dedicated `"plot"` Layout (`"layout": "plot"`)
Places the Manim animation inside the platform safe-area box (`SAFE_9X16`, `SAFE_16X9`, etc.) with an optional style-matched card backing (`"card": true` by default), headline/kicker above, caption pill below, and optional supporting props below.

### Mode B: Alpha-Transparent Overlay in Existing Layouts (`orbit`, `split`, `stack`, `fullbleed`)
By default (`"transparent": true`), Manim renders a VP9+Alpha `.webm` (`s01_plot.webm`) composited via Remotion's `<OffthreadVideo transparent muted />`:
- If the scene has no separate `hero`, the transparent plot animates in the `hero` slot.
- If the scene also has a `hero` cutout, the transparent plot layers cleanly below/beside the hero with staggered spring physics.
- Set `"transparent": false` inside `"plot"` to render an opaque `.mp4` using `palette.paper` as `config.background_color`.

---

## 3. Declarative Plot Presets (`scene.plot`)

### 3.1 `"line"` — Single or Multi-Series Line Chart
```json
"plot": {
  "type": "line",
  "title": "RADAR ANOMALY SURGE",
  "subtitle": "False warhead count (NORAD 1979)",
  "x_label": "Minutes",
  "y_label": "Objects",
  "data": [[0, 2], [1, 14], [2, 48], [3, 180], [4, 640], [5, 2200]],
  "color": "accent",
  "dots": true,
  "show_end_value": true,
  "threshold": 500,
  "threshold_label": "DEFCON TRIGGER"
}
```
Multi-series variant:
```json
"plot": {
  "type": "line",
  "title": "SIGNAL COMPARISON",
  "series": [
    {"name": "Primary", "points": [[0, 10], [1, 35], [2, 80]], "color": "accent"},
    {"name": "Backup",  "points": [[0, 12], [1, 20], [2, 24]], "color": "accent2"}
  ]
}
```

### 3.2 `"bar"` — Animated Vertical Bar Chart
```json
"plot": {
  "type": "bar",
  "title": "SOLAR FLUX BY BAND",
  "subtitle": "Peak megawatts",
  "labels": ["250MHz", "425MHz", "800MHz", "1.2GHz"],
  "data": [18, 94, 42, 27],
  "colors": ["muted", "accent2", "accent", "muted"],
  "y_suffix": " MW"
}
```

### 3.3 `"function"` — Mathematical Function Curve $f(x)$
```json
"plot": {
  "type": "function",
  "title": "DAMPED HARMONIC WAVE",
  "fn": "math.sin(2.5 * x) * math.exp(-0.22 * x)",
  "formula": "f(x) = e^{-0.22x} \\sin(2.5x)",
  "use_latex": false,
  "x_range": [0, 8, 2],
  "y_range": [-1, 1, 0.5],
  "fill_area": true,
  "tracker": true,
  "tracker_target": 6.2
}
```

### 3.4 `"scatter"` — Scatter / Bubble Plot with Trendline
```json
"plot": {
  "type": "scatter",
  "title": "CORRELATION MATRIX",
  "data": [[1, 14, 0.09], [2, 28, 0.12], [3, 31, 0.10], [4, 52, 0.14], [5, 69, 0.16]],
  "trendline": true
}
```

### 3.5 `"area"` — Shaded Area Under Curve
```json
"plot": {
  "type": "area",
  "title": "CUMULATIVE EXPOSURE",
  "data": [8, 19, 34, 58, 91, 140],
  "y_suffix": "x"
}
```

### 3.6 `"network"` / `"graph"` — Node-Edge Directed/Undirected Graph
```json
"plot": {
  "type": "network",
  "title": "COMMAND TOPOLOGY",
  "directed": true,
  "nodes": [
    {"id": "P", "label": "PAVE PAWS", "pos": [-3.0, 1.0], "color": "accent"},
    {"id": "N", "label": "NORAD HQ",  "pos": [0.0, 1.4],  "color": "paperShade"},
    {"id": "S", "label": "SAC BUNKER","pos": [0.0, -1.2], "color": "paperShade"},
    {"id": "C", "label": "CONFIRM",   "pos": [3.0, 0.1],  "color": "accent2"}
  ],
  "edges": [["P", "N"], ["P", "S"], ["N", "C"], ["S", "C"]]
}
```

---

## 4. Custom Manim Scene Escape Hatch (`script` or `code`)

### Inline `code` inside `style_motion.json`
```json
"plot": {
  "type": "custom",
  "code": "circle = Circle(radius=2.2, color=PALETTE['accent'], stroke_width=8)\nlbl = make_label('CUSTOM MANIM', font_size=36, color=PALETTE['ink'], weight='BOLD')\nself.play(Create(circle, run_time=1.2), FadeIn(lbl, run_time=0.8))\nself.wait(1.5)"
}
```

### External Python Script (`script`)
```json
"plot": {
  "script": "02_script/custom_manim_scene.py",
  "scene_class": "MyCustomPlot"
}
```
When `script` is executed, `STYLE_SPEC` and `STYLE_PALETTE` are automatically injected at the top of the module so your `Scene` class can reference `STYLE_PALETTE["accent"]`, `STYLE_PALETTE["ink"]`, etc.

---

## 5. Typography: Pango `Text` Default + Optional `MathTex`

- **Default (`use_latex: false`)**: Uses Manim's Pango/Cairo `Text` renderer with the active `style.json` fonts. Requires **zero LaTeX installation** and runs out-of-the-box on Windows, macOS, and Linux.
- **Optional LaTeX (`use_latex: true`)**: When `latex`/`pdflatex` and `dvisvgm` are on `PATH` (checked by `.\sm.ps1 doctor`), setting `"use_latex": true` renders `"formula"` and `"is_math"` labels via Manim's `MathTex`.

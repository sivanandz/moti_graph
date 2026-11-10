# Vox Newspaper Halftone & Cutout Collage Style Guide (v3.0)

Reference Frames stored in: `.agents/plugins/vox-motion-studio/skills/vox-motion-graphics/references/frames/`
- `ref1_mayakovsky_constructivist_collage.jpg` — Slate board, torn vintage book page, B&W halftone portrait with horizontal eye-band slice, cadmium yellow geometric strips, ransom-note typewriter squares, dashed hand-drawn arrows.
- `ref2_halftone_hand_clipboard_cutout.jpg` — Sage-grey board, B&W halftone graph paper stack with metal binder clip, thick hand-scissored white paper outline (`#FFFFFF`), expressive charcoal scribble overlay.
- `ref3_vox_cutting_mat_white_outline.jpg` — Dark teal self-healing cutting mat (`#123544`) with protractor arcs & grid, B&W halftone historical cutouts with thick angular white paper borders, real wire paperclip slipped onto cutout, overhead scissors & pen framing corners.

---

## 1. Color Palette Tokens

```yaml
surfaces:
  cutting_mat_teal_deep: "#123544"
  cutting_mat_teal_mid: "#1B4353"
  cutting_mat_grid_line: "rgba(125, 211, 232, 0.24)"
  slate_cardstock: "#3B4652"
  sage_cardstock: "#C8CCC1"
  torn_book_parchment: "#EAE0C8"
  halftone_graph_paper: "#F4F2EA"

cutout_and_ink:
  scissor_outline_white: "#FFFFFF"
  halftone_ink_black: "#141414"
  newsprint_mid_grey: "#7A7A76"
  newsprint_highlight: "#F2EFE9"
  charcoal_scribble: "#222222"

constructivist_accents:
  cadmium_yellow: "#F2B705"
  stamp_red: "#D62828"
  dashed_arrow_olive: "#8C9A43"
  tape_translucent: "rgba(242, 232, 196, 0.72)"
```

---

## 2. Canonical AI Image Generation Prompt Formula (Hybrid Pipeline Step 1)

Every image generated for a scene or layer MUST follow this exact template so all visuals remain 100% consistent:

> **Prompt Template:**
> `"Cutout archival newspaper photograph of [HERO SUBJECT & MAXIMUM 2 SUPPORTING OBJECTS], strictly black and white greyscale coarse newspaper halftone dot print (Ben-Day screen dots, high contrast newsprint ink), surrounded by a thick irregular angular hand-scissored solid white paper border outline (#FFFFFF), layered over a torn vintage book page with deckle fibrous edges and a bold cadmium yellow (#F2B705) geometric constructivist paper strip accent, resting on a [dark teal architectural self-healing cutting mat grid (#123544) OR matte slate-grey cardstock (#3B4652)], deep realistic drop shadows between paper layers, generous negative space, tactile stop-motion cut-paper documentary collage aesthetic, 8K, no digital gloss, no 3D render, no watermark."`

---

## 3. Remotion Visual Components (Hybrid Pipeline Step 2)

### A. `CuttingMatBackground.tsx` (Dynamic Dual-Surface)
- **`mode="cutting-mat"`**: Renders the `#123544` dark teal self-healing cutting mat with SVG grid lines, concentric protractor angle rings, degree ticks, radial lines, vignette, and corner overhead desk props (metal tailor's shears top-left, black marker pen top-right, silver wire paperclip bottom-right).
- **`mode="slate-collage"` / `"sage-clipboard"`**: Renders matte `#3B4652` slate or `#C8CCC1` sage cardstock with a torn yellowed book page (`#EAE0C8` with printed archival text columns & page numbers) and/or a halftone graph-grid pad clamped at the top center by a metallic binder clip.

### B. `HalftoneCutout.tsx` (B&W Halftone + White Scissor Border + Mayakovsky Slice)
- Wraps any image or procedural graphic in:
  1. `filter: grayscale(100%) contrast(1.28) brightness(1.03)` + SVG coarse halftone dot screen overlay (`mix-blend-mode: multiply` / `overlay`).
  2. **Thick Hand-Scissored White Paper Outline (`10px–14px` `#FFFFFF`)** with polygonal scissor-cut corners and multi-stage elevation drop-shadow (`drop-shadow(0 14px 24px rgba(0,0,0,0.45))`).
  3. **Constructivist Horizontal Slicing (`sliceBand`)**: Duplicates a horizontal slice (`top: 28%`, `height: 22%`) of the cutout, offsets it horizontally (`translateX(12px)`), places a bold **Cadmium Yellow (`#F2B705`)** strip + triangle wedge behind it, and casts an internal shadow.
  4. **Attached Physical Fastener**: Optional silver wire paperclip slipped over the cutout edge or metal binder clip at top center.

### C. `RansomLabel.tsx` (Cutout Typewriter Letters & Hand-Drawn Accents)
- Renders individual letters inside tiny white cut-paper squares (`#FAF8F2`) with slight per-letter rotation (`-3.5°` to `+3.5°`) mounted on a black (`#141414`) or cadmium yellow (`#F2B705`) paper strip.
- Includes reusable SVG overlays for **hand-drawn dashed arrows (`- - - ->`)** and **expressive charcoal marker scribbles**.

---

## 4. Easing & Stop-Motion Timing Specifications
- **12fps Stepped Stop-Motion Cadence**: Quantize secondary jitter/ambient motion using `Math.floor(frame / 2) * 2` to emulate authentic 12fps physical animation inside a 30fps timeline.
- **Snappy Cutout Entrance**: `spring({ frame, fps, config: { damping: 12, mass: 0.45, stiffness: 185 } })`
- **Constructivist Slice Snap**: Delayed by `6` frames after hero cutout settles (`spring({ frame: frame - 6, fps, config: { damping: 11, stiffness: 210 } })`).
- **Continuous Camera Drift**: `interpolate(frame, [0, durationInFrames], [1.0, 1.045], { extrapolateRight: "clamp" })`.

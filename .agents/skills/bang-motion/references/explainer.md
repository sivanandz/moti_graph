# Explainer Video Guide — Visual Storytelling, Not Slides

> For character-driven flat educational animation (Style 6: **Stage Cartoon** with rigged joints and zero slide captions), see [`kartun-panggung.md`](kartun-panggung.md).

---

## 1. The Core Philosophy
A promotional video sells an emotion; an **explainer delivers an argument**.
The Anti-PPT laws apply fully, with two balanced considerations:
- An explainer scene may pair a punchy statement with a single data point, schematic, or physical document.
- Complex infographics (interactive maps, telemetry plots, architectural blueprints) are permissible because they are read as **visual evidence**, not raw blocks of text.

---

## 2. The 6 Explainer Archetypes

| # | Style | Canvas & Atmosphere | Ideal Subject Matter | Primary Visual Assets |
|---|---|---|---|---|
| **1** | **Cartoon Collage (`kartun-kolase`)** | Textured cream paper (`#F4EFE6`), flat illustration cutouts, color pills, handwritten markers | Science concepts, educational explainers, friendly tutorials | Flat illustrated cutouts with clean alpha borders |
| **2** | **Visual Journalism (`jurnalisme-visual`)** | Obsidian black (`#0D1117`), authentic archival photos, animated yellow highlighter, red warning stamps | Investigative documentaries, historical mysteries, geopolitics | Verified public-domain archival photos (Wikimedia, NASA, Bell Labs) |
| **3** | **White Catalog (`katalog-putih`)** | Technical graph cardstock (`#FFFFFF` to `#F7F7F7`), isolated photo cutouts, mixed typography, scribbled arrows | Hardware launches, physical tools, company profiles | Clean isolated PNG cutouts with contact drop shadows |
| **4** | **Vintage Sketch (`sketsa-vintage`)** | Aged sepia deckle paper (`#EAE0C8`), classical copperplate etchings, serif type, rust callouts | History, biographies, classical scientific discoveries | High-resolution period engravings and patent schematics |
| **5** | **Continuous Action (`aksi-kontinu`)** | Deep cosmos or flowing vector plane, single persistent subject, in-world telemetry stats | Relativistic physics, ballistics, transport routes, energy grids | Pure procedural SVG & Canvas paths, animated conduits |
| **6** | **Cartoon Stage (`kartun-panggung`)** | Vibrant flat multi-layer stage, rigged joint characters (neck, shoulder, elbow), living props | Dynamic social/scientific processes, cause-and-effect narratives | Vector limb rigs + high-res facial portraits |

---

## 3. Pre-Production Gate: Style, Aspect Ratio, Duration & Voiceover

Before writing code or scaffolding scenes, finalize the **4 Production Pillars**:

1. **Style**: Recommended based on subject:
   - History / Investigation → Style 2 (Visual Journalism) or Style 4 (Vintage Sketch)
   - News / Geopolitics → Style 2 (Visual Journalism)
   - Science Education / Casual → Style 1 (Cartoon Collage) or Style 6 (Cartoon Stage)
   - Physics / Trajectory / Vehicles → Style 5 (Continuous Action)
   - Hardware / Tools → Style 3 (White Catalog)
2. **Aspect Ratio**:
   - `16:9` (1920×1080) for YouTube long-form / widescreen web
   - `9:16` (1080×1920) for Instagram Reels, YouTube Shorts, TikTok
   - `1:1` (1080×1080) for square social feeds
3. **Pacing & Duration**:
   - 30s (rapid punchy hook + 3 fast evidence beats + CTA)
   - 60s (standard social vertical explainer: 15s paradox hook + 4 investigative beats + resolution)
   - 90s–120s (comprehensive breakdown with deep telemetry/patent inspection)
4. **Voiceover Integration**:
   - Neural TTS (e.g. Edge-TTS `en-US-AvaNeural` at +5% to +8% speed) or user-supplied audio.
   - Synchronize visual cues to voiceover pauses using `scripts/vo-pauses.html` or ffmpeg `silencedetect`.

---

## 4. Scene Composition Rules: 3 to 5 Elements per Beat

Never drop an entire scene into the frame simultaneously at time `t=0`.
Each beat must assemble in progressive staggered order matching the spoken narration:
1. **Foundation (`t = 0.0s`)**: Background canvas settles; ambient texture or grid breathes.
2. **Headline / Claim (`t = 0.2s–0.4s`)**: Spoken sentence punches in with spring bounce (`power4.out`).
3. **Hero Evidence (`t = 0.5s–0.8s`)**: Archival photo cutout, technical blueprint, or rigged character enters.
4. **Fasteners & Stamps (`t = 0.9s–1.2s`)**: Paperclips, binder clips, or classification stamps lock into position.
5. **Forensic Callout (`t = 1.3s–1.8s`)**: Grease-pencil circle, felt highlighter sweep, or arrow guides viewer attention to the key anomaly.

---

## 5. Camera Choreography Recipes

Avoid static cameras and generic drifting pans. Use motivated framing:
- **The Macro Evidence Dive**: Camera moves from Wide (`scale: 1.0`) into a forensic detail on the archival document (`scale: 1.8`, `x: -300px, y: 150px`) precisely as the voiceover mentions the anomaly.
- **The Whip-Pan Transition**: Fast horizontal or diagonal whip to an adjacent quadrant of the physical desktop (`0.4s`, `power3.inOut`), masking the content swap at the peak velocity frame.
- **The Instrument Cut**: Instant hard cut to an oscilloscope, radar display, or Manim telemetry curve, accompanied by high-contrast mechanical audio.
- **Continuous Breathing**: At rest, the camera maintains gentle mathematical micro-drift:
  `scale = 1.0 + 0.03 * Math.sin(t * 0.8)`

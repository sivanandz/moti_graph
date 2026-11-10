---
type: project
created: 2026-11-09
updated: 2026-11-09
---

# Video: "The Sun Fooled NORAD" (sun_fooled_norad) — DELIVERED 2026-11-09

- **Delivered**: 3-min 9:16 reel, Tactile Retro-Digital Ephemera. `projects/sun_fooled_norad_2026-11-09/05_output/` — `the_sun_fooled_norad_master.mp4` (180.0s, 1080×1920, h264+AAC, 254 MB) + `the_sun_fooled_norad_upload.mp4` (183 MB CRF23).
- Structure: 7 beats × 27/28/27/28/25/27/18s; VO = edge-tts `en-US-AvaNeural`, expressive per-sentence prosody (`scripts/generate_norad_audio.py`, word timings in `03_voiceover/vo_manifest.json`).
- Assets: 26 archival (manifest.json; 4 CC credited ON the s07 end plate) + 19 PIL-drawn vector pieces + composited plates (`04_data/compose_plates.py`). Nanobanana used only for the original s01 plate (kept as `s01_plate_nanobanana.png`) — quota (~1 image/window) made it last-resort, per user priority: real → SVG/vector → nanobanana last.
- **Tooling learnings (durable)**:
  - style-motion `fullbleed` DOES draw the hero layer (template line ~246 not layout-gated) → always ship transparent hero stubs when plates carry the art.
  - `fade: 0` + `transition: cut` crashes Remotion `interpolate` — guarded in skill template `templates/remotion/StyleMotion.tsx` (2026-11-09).
  - Renderer hard-requires a `hero` layer per scene (sys.exit otherwise).
  - `sm render` QA stills land in `04_video/qa/s{nn}_{in,out}.png`.
- Backups not used: Marie Tharp, Y2K, Operation Mincemeat, John Snow. Already-covered topics: UPI finance reel, Pigeon/Big Bang long-form.

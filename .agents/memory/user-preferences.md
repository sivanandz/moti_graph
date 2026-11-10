---
type: user
created: 2026-07-18
updated: 2026-11-09
---

# User Preferences

## Self-Contained Project Directory Architecture (MANDATORY)
- **Dedicated Project Directory per Video**: Every new topic video MUST live in its own dedicated directory named by video title and creation date: `projects/<Video_Title>_<YYYY-MM-DD>/`
- **Standard Subdirectories**:
  - `01_research/`: Research dossier, citations, sources.
  - `02_script/`: Full script, chapter breakdown, `beat-sheet.json`.
  - `03_voiceover/`: Synthesized TTS audio files, timestamps, word alignment.
  - `04_images/`: Real archival images, cutouts, graphic plates.
  - `05_output/`: Final rendered MP4, QA stills, thumbnails.
- **Never Fill C: Drive**: Whenever tools output to `C:\Users\...\antigravity\brain\`, immediately `Move-Item -Force` them into the video's `04_images/` folder on the workspace drive and delete leftover files on `C:`.

## Asset Sourcing Discipline (Real Archival First, AI Last)
- **Priority order for ANY visual asset (confirmed 2026-11-09)**: 1️⃣ real archival/open-source assets → 2️⃣ SVG / code-drawn vector assets (PIL, Remotion, hand-authored SVG) → 3️⃣ nanobanana AI generation, strictly last because Antigravity image quota is rate-limited (~1 image per multi-hour window).
- **Voiceover: female narrator, expressive — never monotone** (2026-11-09). Pattern that worked: edge-tts `en-US-AvaNeural` with per-sentence rate/pitch direction + sentence gaps, beat-synced master via ffmpeg; word timings saved for caption sync (`scripts/generate_norad_audio.py` is the reference).
- **Prioritize Real Archival & CC Assets**: Always source real photographs, historical diagrams, patent blueprints, and archival media from open-source repositories first:
  - Wikimedia Commons (`commons.wikimedia.org`)
  - Openverse (`openverse.org`)
  - Unsplash (`unsplash.com`)
  - All The Free Stock (`allthefreestock.com`)
  - British Museum Collection (`britishmuseum.org/collection`)
  - NASA / ESA / Bell Labs public domain archives
- **AI Generation as Fallback Only**: Only resort to AI image generation (Google Antigravity NanoBanana 2+ / subagent) if the exact historical image or object cutout cannot be obtained from open-source archival databases.

## Image Generation Backend (2026-11-09)
- **Native Google Antigravity Generation**: Generate via local Antigravity CLI: `agy.exe --dangerously-skip-permissions --print-timeout 180s --print "<prompt; save PNG to exact workspace path>"`. Routes to its `image-generator` subagent -> `generate_image` (NanoBanana 2+ image model); writes directly into workspace paths when given absolute paths.
- Only chat models appear in `agy models`; NanoBanana 2+ is an in-agent tool, not a selectable chat model.
- Cutout transparency: local PIL + scipy white-border flood-fill keying (min-channel >= 235, interior fills preserved) — zero external API dependency. `agy` flags: `--print` is greedy — put it last or use `--print="..."`; `--print-timeout` needs a unit (`180s`).
- **NanoBanana quota is small**: `gemini-3.1-flash-image` hits `429 RESOURCE_EXHAUSTED` after a handful of images; reset takes ~hours. Batch generators must detect the 429, stop early, and resume later (resume-safe skip-if-exists).

## Visual Style Standard & Socratic Style Gate
- **Zero Content Blocking (MANDATORY)**: Images, historical photographs, blueprints, faces, instruments, and evidence MUST NEVER be blocked, obscured, or cut through by random opaque color strips, bars, or geometric wedges across any frame. All decorative accents (cadmium yellow wedges, red strips, backing paper) must strictly sit BEHIND the cutout subject (`zIndex <= 0`) or outside on paper margins. 100% of photographic subjects and archival details must remain completely visible, unobstructed, and legible.
- **Pre-Production Socratic Gate (Mandatory)**: When asked to create a video on any topic, never assume a default style blindly. Run the Socratic Style Gate to finalize:
  1. **Aesthetic Profile**:
     - *Vox v3.0 Halftone & Cutout Collage (`vox-halftone-cutout`)*: Dark teal cutting mat (`#123544`), B&W newspaper halftone cutouts with `8px–14px` white scissor borders, cadmium yellow slices, desk tools, ransom-note labels.
     - *Tactile Retro-Digital Ephemera (`retro-digital-ephemera`)*: Cream deckle cardstock (`#F4EFE6`), 1-bit coarse dithered serif typography with active typewriter cursor (`_`), retro hardware storytelling portals (Nokia 3310, Olivetti CRT, Garakei flip phones, vintage iPhone), dual-ribbon red/black ink.
     - *Swiss Technical / Modern Vector*: Clean high-contrast typography, precision data charts, dynamic camera pans, fluid motion blur.
     - *Custom / Learned Reference*: Learned from user-supplied image or video URL (`sm learn`).
  2. **Device / Metaphor Portals**: Retro hardware shells (CRT, Nokia, Garakei, iPhone) vs. tabletop paper stack.
  3. **Motion Cadence**: Stepped stop-motion on 2s/3s (10–15fps, mechanical spring `stiffness: 220, damping: 14`) vs fluid 30/60fps.
   4. **Aspect Ratio**: 9:16 Vertical Short vs 16:9 Long-Form Explainer.

## Safe-Area Discipline (Social Verticals)
- **All content inside the platform safe frame** — mandatory rule codified in the `style-motion` skill (§2.1 Safe Area, added 2026-11-09). On the 9x16 canvas (1080×1920): content box x 60–940, y 250–1570; the right 140px (action rail) and bottom 350px (caption/CTA UI) are off-limits for content-bearing layers. Decorative backdrops may bleed full-frame. QA stills must pass the safe-frame check before full render.

## Manim Procedural Visualizations & Mathematical Plots
- **Manim Community v0.22.1 (`C:\Users\sivan\.local\bin\manim.exe`)**: Use for mathematical graphs, animated data charts (line/bar/scatter/area), RF waveforms, network topographies, and physics/astronomy functions ($f(x)$).
- **Compositing**: Rendered as style-locked alpha-transparent WebM (or opaque MP4) and composited into Remotion scenes via `<OffthreadVideo transparent />` with Pango `Text` typography matching the active palette.

## Video Engagement, Pacing & Anti-Monotony Invariants (2026-11-09)
- **Zero Premature Narrative Spoilers**: Mystery culprits or comedic punchlines (e.g., pigeons, bugs, leaks, suspects) must NEVER appear visually in earlier beats before the voiceover explicitly introduces them. Visuals must strictly track the viewer's current state of investigative knowledge.
- **Dynamic 5-Layout Matrix (Anti-Template Trap)**: Never allow consecutive scenes to use the same layout. Actively rotate across 5 distinct layout archetypes: (1) Kinetic Type Slam, (2) Macro Document Inspection with optional forensic callout, (3) Suspect / Multi-Option Elimination Grid with red ink stamps, (4) Dedicated Hardware Portal (Oscilloscope, Strip-Chart, CRT TV), and (5) Split Archival Memo with speech-synced word stamping. Max 2 consecutive beats in any single layout.
- **Aggressive Paradox Hook**: Always open the first 5–15 seconds with the central absurdity, conflict, or high-stakes paradox instead of textbook chronological background.
- **Conversational Audio Cadence**: Synthesize neural TTS with punchy, energetic delivery (+5% to +8% speed rate, pitch variation) at 140–160 WPM to eliminate drone and viewer disengagement.
- **Alternating Layout Choreography (Anti-PowerPoint Rule)**: Never keep media on the left and text on the right across consecutive scenes. Dynamically alternate spatial flow (Left-Media vs Right-Media vs Centered vs Grids) to prevent slide fatigue.
- **Subject-Conforming Paper Cutouts**: Cutouts must hug the subject silhouette or exact aspect ratio (`width: fit-content`). Never place photos in oversized generic boxes that leave blank white letterboxing flanks.
- **Authenticity-First & Anti-Gimmick Invariant**: Real archival photos/blueprints take precedence. Never superimpose crude synthetic 3D or fake procedural graphics over authentic real-world media.
- **Asset Variety Ceiling (Max 2 Reuses)**: Strict maximum of 2 appearances for any single asset across an entire video project.
- **Forensic Callout Discipline**: Annotations (grease-pencil circles, arrows) must only target verified forensic evidence; never blindly circle portraits, faces, or arbitrary coordinates.
- **Animated Paper-Cut Speech Bubbles**: When characters appear with spoken dialogue or quotes, use spring-animated paper-cut speech bubbles with directional scissored pointers aimed at their mouth.
- **Comprehensive Mention Imagery**: Proactively source authentic archival portraits for every person named in the script (unless legally/privacy restricted).

## Bang Motion & Anti-PPT Mechanical Invariants (2026-11-10)
- **Adopted `bang-motion` Skill**: Delivers cinematic browser motion graphics and explainer animations via `bm.ps1` / `bm.sh` (`bm new`, `bm serve`, `bm snap`, `bm export`, `bm check`).
- **6 Explainer Archetypes Added to Socratic Style Gate**:
  1. *Visual Journalism (`jurnalisme-visual`)*: Obsidian black, archival photography, yellow felt highlighter, source stamps.
  2. *Cartoon Collage (`kartun-kolase`)*: Cream cardstock, flat illustration cutouts, color pills, handwritten accents.
  3. *White Catalog (`katalog-putih`)*: Technical white grid, isolated product/prop cutouts, mixed typography.
  4. *Vintage Sketch (`sketsa-vintage`)*: Sepia deckle paper, fine line engravings, classical serif, rust callouts.
  5. *Continuous Action (`aksi-kontinu`)*: Flowing vector world, single persistent subject, in-world telemetry stats.
  6. *Cartoon Stage (`kartun-panggung`)*: Vibrant flat multi-layer stage, rigged joint characters, living props, zero slide captions.
- **Automated Anti-PPT Checks (`bm check`)**:
  1. *Section Count*: No fading scenes/sections toggled via `autoAlpha`/opacity. Transitions must be driven by world movement, camera pan/whip, or object wipes.
  2. *Two Text Levels Max*: At most 1 bold headline statement (≤ 6 words) + 1 in-world label per scene.
  3. *Living Background*: Background canvas must continuously breathe, shift gradients, drift particles, or sweep light.
  4. *Motivated Camera Scale*: Camera pushes actively into Medium Close-Up or Close-Up (`scale: 1.4–2.0`) to inspect evidence.
  5. *Persistent Visual Thread*: Hero subject or primary document persists across ≥ 60% of runtime.
- **Hybrid Remotion Bridge**: Composited via `<BangMotionOverlay />` or `layout: "bang"` inside `style-motion`.




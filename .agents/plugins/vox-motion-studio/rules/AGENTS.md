# Motion Graphics Studio Production Rules & Socratic Gate Protocol

## 0. MANDATORY PRE-PRODUCTION GATE: Socratic Style Gate
Before generating scripts, assets, or Remotion code for **ANY** topic requested by the user, the agent MUST NEVER assume a single default style blindly. You MUST initiate the **Socratic Style Gate** to finalize:
1. **Style Archetype**:
   - **Archetype A — Vox Halftone & Cutout Collage (`vox-halftone-cutout`)**: Dark teal cutting mat (`#123544`), B&W newspaper halftone cutouts with `8px–14px` white scissor borders, cadmium yellow slices, desk tools, ransom-note labels.
   - **Archetype B — Tactile Retro-Digital Ephemera (`retro-digital-ephemera`)**: Cream deckle cardstock (`#F4EFE6`), 1-bit coarse dithered serif typography with active typewriter cursor (`_`), retro hardware storytelling portals (Nokia 3310, Olivetti CRT, Garakei flip phones, vintage iPhone), dual-ribbon red/black ink.
   - **Archetype C — Swiss Technical / Modern Vector**: Clean high-contrast typography, precision data charts, dynamic camera pans, fluid motion blur.
   - **Archetype D — Custom / Reference-Driven**: Learned from user-supplied image or video URL (`sm learn`).
   - **Archetype E — Bang Motion Archetypes (`bang-motion`)**:
     - *Visual Journalism* (Obsidian black, archival photography, yellow highlighter, source tags).
     - *Cartoon Collage* (Cream cardstock, flat illustration cutouts, color pills, handwritten markers).
     - *White Catalog* (Technical white grid, isolated product/prop cutouts, mixed typography).
     - *Vintage Sketch* (Sepia parchment, classical copperplate etchings, serif type, rust notes).
     - *Continuous Action* (Flowing vector world, single persistent subject, in-world telemetry stats).
     - *Cartoon Stage* (Vibrant flat multi-layer stage, rigged joint characters, living props).
     - *19 Structural Openers* (Slam & Reveal, Microscopic Zoom, Blueprint Assembly, Card Shuffle, etc.).
2. **Hardware & Visual Metaphors**: Use physical device frames (CRT, Nokia, Garakei, iPhone) as interactive storytelling portals vs tabletop paper collage.
3. **Pacing & Cadence**: Stepped stop-motion on 2s/3s (10–15fps, mechanical spring `stiffness: 220, damping: 14`) vs fluid keyframing (30/60fps).
4. **Format & Duration**: 9:16 Vertical Short/Reel (30–60s) vs 16:9 Long-Form Explainer (2–5 min).

---

## 1. Subject Treatment: Strictly B&W Newspaper Halftone + Thick White Scissor Outline (When Archetype A is Active)
- **100% Monochrome Greyscale Halftone Subjects**: Every photographic or illustrated subject (people, hands, machines, architecture, props) MUST be rendered as a **black-and-white / greyscale archival newspaper print** with visible **coarse halftone dot screens (Ben-Day / newsprint dots)** and high-contrast ink shadows. Never use full-color 3D or glossy digital subjects.
- **Thick Hand-Scissored White Paper Outline (`8px–14px`)**: Every cutout subject and paper prop MUST be framed by a **solid, bright white (`#FFFFFF`) hand-cut paper border** with slightly irregular, angular polygonal scissor turns and a crisp elevation drop-shadow (`0 14px 28px rgba(0,0,0,0.45)`) separating it from the background surface.
- **Hybrid Enforcement Pipeline**:
  1. **AI Prompt Level**: Always prompt for *"black and white coarse newspaper halftone print cutout, thick irregular hand-scissored white paper border outline, torn vintage paper collage aesthetic, high contrast monochrome ink dots"*.
  2. **Remotion SVG/CSS Level (`HalftoneCutout.tsx`)**: Programmatically enforce `grayscale(100%) contrast(125%)`, an SVG halftone dot screen overlay, a polygonal thick white cutout border (`#FFFFFF`), and layered contact drop-shadows so 100% of assets stay visually uniform.

## 2. Dynamic Dual-Surface Canvas System (`CuttingMatBackground.tsx`)
Alternate purposefully between two tactile physical work surfaces based on narrative context:
- **Surface A — Dark Teal Self-Healing Cutting Mat (`#123544` to `#1B4353`)** *(Macro, History, State & Sovereign Beats)*:
  - Features fine technical cyan/white grid lines (`1px`), concentric protractor angle arcs, radial degree markings, and subtle surface wear/vignette.
  - Framed at the outer corners by **overhead physical desk tools** casting contact shadows: metal tailor's shears/scissors (top-left), black technical marker pen (top-right), and silver wire paperclips (bottom-right).
- **Surface B — Muted Slate (`#3B4652`) or Sage-Grey (`#C8CCC1`) Matte Cardstock** *(Street, Human, Document & Data Beats)*:
  - Layered with **torn yellowed vintage book/poetry pages (`#EAE0C8`)** featuring exposed fibrous deckle edges and page numbers, plus **graph-grid paper sheets (`#F4F2EA`)** held at the top by a halftone metal binder clip.

## 3. Constructivist Slicing, Color Discipline & Fasteners
- **STRICT NON-OCCLUSION RULE (ZERO CONTENT BLOCKING - MANDATORY)**:
  - Hero archival photographs, diagrammatic evidence, and subjects MUST NEVER be blocked, obscured, or cut through by random opaque color strips, bars, or geometric wedges across any frame.
  - All decorative constructivist accents (cadmium yellow wedges, red strips, backing paper) MUST strictly reside **BEHIND** the cutout subject (`zIndex <= 0` or in the background stack) or framed along outer paper margins. 100% of photographic subjects, archival blueprints, faces, and technical machinery must remain completely visible, unobstructed, and legible.
- **Strict Color Discipline (Monochrome + Single Constructivist Accent)**:
  - Subjects remain strictly B&W halftone. Color is reserved exclusively for **1–2 flat constructivist paper accents per scene**: **Cadmium Yellow (`#F2B705`)** or **Vox Stamp Red (`#D62828`)**, paired with black construction paper (`#141414`) and aged parchment (`#EAE0C8`).
- **Physical Fasteners**:
  - **Silver Wire Paperclips**: Slipped directly over the white cutout border of subjects or cards.
  - **Metal Binder Clips**: Clamping stacks of halftone graph paper at the top center.
  - **Thumbtacks / Brass Push-Pins & Yellowed Scotch Tape**: Grounding secondary evidence slips and corner mounts.
- **Hand-Drawn Ink Overlays**:
  - Expressive charcoal marker scribbles (`#222222`) over graph paper and **dashed hand-drawn directional arrows (`- - - ->`)** in olive/cadmium yellow guiding the viewer's eye across layers.

## 4. Typography & Ransom-Note / Archival Hierarchy
- **Ransom-Note / Cutout Typewriter Strips (`RansomLabel.tsx`)**: Individual typewriter characters on tiny white paper squares glued with slight angular jitter (`-3°` to `+3°`) onto black (`#141414`) or cadmium yellow (`#F2B705`) paper strips.
- **Editorial Slab & Condensed Headlines**: Bold condensed sans-serifs (Impact, Oswald, Franklin Gothic) or crisp white editorial serif quotes floating over the cutting-mat grid, paired with Courier Prime monospace captions.
- **Rule of Brevity**: Keep headline text under 6–8 words per keyframe.

## 5. Motion, Camera & Audio-First Cadence
- **Layer-by-Layer Stop-Motion Assembly (12fps stepped feel)**: Background sheet/mat settles first, torn book/graph paper slides in, B&W halftone hero cutout with white border drops into place with spring bounce (`damping: 12, stiffness: 180`), constructivist yellow slice snaps horizontally, and wire paperclip/stamps lock on top.
- **Slow Continuous Camera Drift**: Subtle `1.0 -> 1.05` scale push-in across scenes.
- **Audio-First Synchronization**: Audio drives video length (`frame_number = round(timestamp_seconds * fps)`).

## 6. Self-Contained Project Directory Architecture (MANDATORY)
Every new topic video MUST be created within its own dedicated, self-contained project directory named strictly according to the video title and creation date:
`projects/<Video_Title>_<YYYY-MM-DD>/`

Each video project directory MUST contain all required production stages:
- **`01_research/`**: Research dossiers (`dossier.json`, `dossier.md`), archival citations, and source links.
- **`02_script/`**: Full narrative script, chapter breakdowns, and `beat-sheet.json`.
- **`03_voiceover/`**: Synthesized neural TTS voiceover files (`.mp3`/`.wav`), timestamp manifests, and durations.
- **`04_images/`**: Real open-source archival photos, isolated cutout PNGs, plates, and vector graphics.
- **`05_output/`**: Final production MP4 video renders, QA stills, and thumbnail frames.

### Zero C-Drive Bloat Enforcement
- Because image subagents or CLI tools may default to the `C:` artifact directory (`C:\Users\...\antigravity\brain\`), you MUST ALWAYS `Move-Item -Force` all generated assets immediately into the video's `04_images/` folder within the workspace and immediately delete any `.jpg`/`.png` copies from `C:` so the boot drive is never filled.

---

## 7. Narrative Synchronization & Anti-Spoiler Invariant (MANDATORY)
- **Zero Premature Visual Reveals**: Visual elements, cutouts, diagrams, or evidence representing narrative twists, mystery culprits, or comedic punchlines (e.g., pigeons, suspects, bugs, leaks) MUST NEVER appear in earlier scenes before the voiceover explicitly introduces them.
- Visuals must strictly track the viewer's current state of investigative knowledge. Early beats must depict only the unexplained phenomena (e.g., pure raw RF telemetry or mystery static), keeping suspects hidden until discovered.

## 8. Dynamic 5-Layout Matrix & Anti-Monotony Guardrail
Never allow consecutive scenes to fall into an identical template. The composition MUST actively rotate across at least 4 of these 5 layout archetypes, with no single layout persisting for more than 2 consecutive beats:
1. **Kinetic Type Slam**: Bold full-bleed typography on constructivist cardstock (Cadmium Yellow, Vox Red, or Matte Black) with paper shake for chapter hooks, unspoken rules, and major punchlines.
2. **Macro Document Inspection**: Fullscreen archival document, patent blueprint, or forensic photo with smooth camera push-in (`1.0 -> 1.25`) and optional hand-drawn red grease-pencil circle strictly targeting verified focal evidence (compliant with §15).
3. **Suspect / Multi-Option Elimination Grid**: Multi-card polaroid montage (e.g., 3 suspects) stamped sequentially with physical red ink "RULED OUT" stamps as the narrator eliminates them.
4. **Hardware Portal Spotlight**: Dedicated fullscreen retro hardware vessel (Oscilloscope, Strip-Chart Recorder, or CRT TV) with active procedural waveforms and tactile interaction.
5. **Split Archival Memo**: Balanced desk layout pairing a B&W Ben-Day halftone cutout with speech-synced thermal receipt word stamping.

## 9. Audio Engagement & Conversational Cadence
- **Expressive Conversational Delivery**: Voiceover must never sound like an uninflected textbook reading. Use energetic, curious female narrator models (e.g., `en-US-AvaNeural`) tuned to +5% to +8% speed with dynamic pitch modulation.
- **Audio-First Pacing**: Maintain narrative momentum between 140–160 WPM. Avoid dragging beats past 12 seconds unless demonstrating active hardware telemetry.

---

## 10. The 15-Second Inversion Hook (Cognitive Dissonance Invariant)
- **Universal Opening Formula**: Never open with chronological history, background definitions, or passive exposition. The first 5 to 15 seconds must state a jarring paradox: `[Familiar Modern Norm / Accepted Reality]` -> **AUDIO DROP** -> `[Shocking Opposing Origin / Uncomfortable Mechanism]`.
- The video exists solely to resolve how state A inverted into state B.

## 11. Macro-to-Micro 8-Second Camera Cadence
- Prevent visual fatigue by cycling between high-altitude macro context (system architecture, territorial distribution, aggregate trends) and micro forensic evidence (tangible memo snippet, isolated subject cutout, animated felt highlighter line) every **6 to 10 seconds**. Never hold the same framing scale for more than 2 consecutive scenes.

## 12. Forensic Data Climax Principle
- Data visualizations (charts, function plots, network graphs) must never be presented as dry educational slides.
- A plot must enter as the **forensic smoking gun** that directly proves the core thesis.
- The curve's sharpest inflection point or highlight surge must time precisely to the narrator's vocal turning-point sentence.

---

## 13. Visual Realism & Next-Gen 3D Production Gate (Anti-Primitive Geometry Invariant)
- **Zero Toy Primitive Geometries for Real-World Phenomena**: Never attempt to represent real-world macro subjects (e.g., everyday objects, tools, food, biological bodies, buildings, cities) or violent physical phenomena (explosions, blast shockwaves, crater excavations, atmospheric ionization) using raw, untextured Three.js geometric primitives (`CylinderGeometry`, `SphereGeometry`, flat planes, or basic wireframe rings). Primitive shapes produce sterile, unconvincing CAD diagrams that destroy audience engagement.
- **The Tripartite Production Gate for 3D & Physical Realism**:
  Whenever a video beat involves physical destruction, recognized real-world objects, or cinematic scale, the agent MUST employ one of three professional paths:
  1. **Headless Blender Pipeline (`blender-production`)**: Automated Python scripting (`blender -b -P script.py`) leveraging Cycles/Eevee, Mantaflow volumetric smoke/fire, rigid-body fracture, PolyHaven PBR materials, and realistic camera optics (focal length, depth-of-field, motion blur).
  2. **Cinematic AI Video Generation (`ai-video-pipeline`)**: Photorealistic 3–6 second generative video clips for hyper-realistic macro shots, city-scale destruction, and atmospheric re-entry, stitched and color-graded cleanly.
  3. **Production-Grade glTF/PBR Assets**: High-poly textured models with HDR environment maps and realistic PBR materials if rendered within `@remotion/three`.
- **Remotion as the Master Compositor**: Remotion's primary role is orchestration, neural audio synchronization, kinetic editorial typography, camera tracking, and scientific HUD telemetry overlays—NOT raw real-time fluid simulation or volumetric ray-tracing.

---

## 14. Authenticity-First & Anti-Gimmick Invariant (Real Media & Benchmark Fidelity)
- **Archival & Physical Primacy**: Whenever authentic archival photographs, historical documents, patent schematics, or equipment photos exist, they MUST take visual center stage.
- **Cinematic Benchmark Fidelity**: When benchmarking against viral science explainer references (e.g., *Whatfinity*, *xkcd* relativistic simulations, AI-generated shorts), visual fidelity must match or exceed the reference's level of realism. If the benchmark features photorealistic urban destruction or macro photography, the output MUST use Blender or AI video—never fall back to crude geometric sketches.

## 15. Zero Gratuitous Overlays & Forensic Annotation Discipline
- **Compositional Breathing Room**: Hero archival photographs and technical blueprints must never be obstructed, covered, or cut through by arbitrary badges, widgets, or synthetic meter boxes. Keep secondary annotations in margins or negative space.
- **Strict Forensic Relevance for Callout Annotations**:
  - Hand-drawn grease-pencil circles, highlighter strokes, and arrows must NEVER be hardcoded at static coordinates across generic scene templates.
  - A focal circle is ONLY permitted when targeting a specific, verifiable forensic detail (e.g., a stamped clearance seal, an anomaly inflection point on a chart, a specific signature or patent line).
  - Placing blind callout circles over human faces, portraits, or general landscape photographs is STRICTLY FORBIDDEN.

## 16. Asset Variety & Anti-Fatigue Invariant (Max 2 Reuses Ceiling)
- **Strict Reuse Ceiling**: No individual image, photograph, portrait, or cutout may appear more than **twice** in an entire video project.
- **Curated Archival Diversity**: Every narrative beat must present fresh visual evidence—varying between distinct camera angles, companion archival documents, satellite imagery, architectural plates, and authentic portraits—to sustain viewer curiosity and eliminate visual monotony.
- **Niche Scarcity Fallback**: If an obscure historical topic has fewer than 5 authentic photographs across all archives, never pad with irrelevant stock imagery. Instead, employ:
  1. High-resolution forensic macro crops/details of the hero archival photograph (max 2 distinct detail crops).
  2. Authentic period documents, blueprints, patents, newspaper clippings, or maps.
  3. Standalone procedural Manim waveforms, telemetry charts, or physical system plots.
  4. Bold constructivist kinetic typography slams.

## 17. Speech-Synchronized Staggered Entry & Tactile Micro-Motion
- **Zero Monolithic Frame-0 Drops**: Visual elements must NEVER slam into a scene all at once at frame 0. Every visual layer must have an independent, staggered mechanical entrance timestamp tied directly to the narration audio (`entryFrame = spokenWordFrame`):
  - Narrative desk card settles at frame 0 so typography flows synchronously.
  - Hero archival document enters precisely as the narrator introduces the subject (`stiffness: 180, damping: 12`).
  - Fasteners (Scotch tape, push pins, paperclips) snap into place 6–10 frames AFTER the document lands (`stiffness: 220, damping: 14`).
  - Historical labels and stamps punch down 12–16 frames after the document settles (`stiffness: 220, damping: 14`).
- **Continuous Tactile Micro-Motion (Hover / Float Breathing)**:
  - Visual layers must never remain frozen dead while voiceover plays.
  - All paper slips, cutouts, and floating artifacts must feature subtle mathematical micro-motion:
    `translateY = sin((frame + seed) * 0.08) * 4px`
    `rotation = cos((frame + seed) * 0.05) * 0.8deg`
  - This preserves the tactile, living desktop stop-motion illusion throughout extended narration beats.

## 18. Asymmetric & Alternating Layout Choreography (Anti-PowerPoint Invariant)
- **Strict Prohibition of Static Left/Right Template Uniformity**: Never trap an entire explainer video into an invariant `[Media on Left | Text on Right]` formula. Consecutive split scenes MUST actively alternate and vary their compositional axes:
  - **Pattern A**: Media Left, Thermal Receipt Right (e.g. Beats 2, 7, 12, 17)
  - **Pattern B**: Thermal Receipt Left, Media Right (e.g. Beats 3, 8, 14, 18, 20)
  - **Pattern C**: Centered Full-Bleed Hero with floating offset receipt (e.g. Beats 10, 15, 21)
  - **Pattern D**: Kinetic Type Slam with marginalia (Beats 1, 6, 16, 19, 24)
  - **Pattern E**: Horizontal Multi-Card Elimination Grid
- Two consecutive scenes MUST NEVER share the same media/text alignment direction.

## 19. Subject-Conforming Paper Cutouts (Zero Generic Box Letterboxing)
- **Silhouette & Contour Hugging**: For human subjects, animals, and machinery, cutouts must follow the silhouette of the subject with an 8px–14px solid white hand-scissored border (`#FFFFFF`) and drop-shadow, isolating the subject from distracting background rectangles.
- **Snug Document Framing**: For full archival documents, blueprints, or patent plates, the paper backing MUST conform to the exact aspect ratio of the image (`width: fit-content` with uniform 10–14px borders). Never place an arbitrary photo into a stretched rectangular box with empty white flanks or letterboxing margins.

## 20. Animated Paper-Cut Speech Bubbles for Dialogue & Quotes (Anti-Monotony)
- **Unmistakable Speech Balloon Anatomy**: Whenever a character, scientist, or historic figure is shown and has spoken dialogue, a famous quote, or a critical reaction in the voiceover (e.g. *"Boys, we have been scooped"*), do NOT leave the scene as dry body text or a generic rectangular card. Render an authentic, unmistakable speech bubble (`PaperSpeechBubble.tsx`):
  - **Organic Balloon Geometry**: Soft rounded contours (`borderRadius: 18px–24px` or smooth SVG arc) with a crisp dark outline (`3px–4px solid #141414`), white paper fill, and physical elevation drop-shadow (`0 14px 24px rgba(0,0,0,0.38)`).
  - **Prominent Scissored Tail**: An unmistakable integrated triangular or curved pointer tail extending directly from the bubble outline and aimed squarely at the speaker's mouth.
  - **Zero Card-Like Confusion**: Do NOT place colored header banners, tape badges, or filing metadata inside the bubble that disguise it as an index card. It must strictly contain the quoted dialogue in high-contrast editorial serif/slab italic with quotation marks.
  - **Mechanical Spring Entry**: Spring into frame (`damping: 14, stiffness: 220`) timed exactly to the spoken start frame of the quote (`entryFrame = quoteWordFrame`).

## 21. Institutional & University-First Archival Sourcing (Exhaustive Mention Coverage)
- **Institutional Repository Priority**: When historical researchers, scientists, or subjects are mentioned in the voiceover script, sourcing MUST proactively query their home institution's official digital archives first:
  - Query pattern: `site:<university.edu> "<Researcher Name>" (portrait OR photo OR faculty OR memorial)`
  - Query pattern: `site:<institution-domain> "<Researcher Name>" (archives OR "special collections")`
  - Examples: Princeton University Physics (`phy.princeton.edu`), Bell Labs historical collections, MIT, NASA, Caltech, or National Academy of Sciences Biographical Memoirs.
- **Verification Against Paper Scans**: Never accept title pages, journal tables of contents, or publication header scans as a portrait. Always inspect image content to verify an actual facial likeness.
- **Multi-Person Crowded Beat Priority**: When a single beat mentions multiple colleagues/researchers (e.g. 3–4 names), do NOT clutter the frame with 4 floating cutouts. Use:
  1. An authentic group archival photograph if one exists.
  2. The primary focal speaker/lead as hero cutout, with the secondary collaborator as an offset companion card/polaroid (maximum 2 portraits per frame to preserve breathing room and non-occlusion).
- **Provenance & Rights Verification**: Always log image source URLs, repository names, and copyright/public domain status into `01_research/sources.json`. Prefer Public Domain (US Gov / NASA / pre-1929), CC-BY, or verified institutional educational fair use.
- **Legal & Privacy Boundaries**: Omit portraits only if restricted by privacy laws, copyright restrictions, defamation risks, or when minors/unconsenting private individuals are involved. For all public historical figures, public domain (Wikimedia, NASA, Library of Congress, Bell Labs, universities) imagery must be exhaustively curated and integrated.

## 22. Anti-PPT Mechanical Invariants (Bang Motion Integration)
To eliminate slide-like presentation artifacts across all video scripts and code:
- **Zero Fading Section Stacking**: Never toggle full-frame sections or scenes using simple opacity / `autoAlpha`. Transitions must be driven by world movement, camera pan/whip, push-throughs, or physical object wipes.
- **Two Text Levels Ceiling**: At most one bold headline statement (≤ 6 words) + one physical in-world label/stamp per beat. Kicker + title + subtitle paragraph is strictly forbidden.
- **Continuous Living Background**: The background canvas must never remain static. It must feature continuous mathematical movement: breathing grid, drifting duotone gradient, living film grain, or rotating blueprint geometry.
- **Motivated Camera Framing Scale**: Avoid shallow 1.0 -> 1.05 zooms across the whole video. The camera must actively push into Medium Close-Up or Close-Up (`scale: 1.4–2.0`) to inspect key evidence, then pull back to Wide for narrative shifts.
- **Persistent Visual Thread**: A hero subject, device, or primary physical document must persist across ≥ 60% of runtime to maintain unbroken audience immersion.






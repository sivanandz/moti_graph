# Anti-PPT — Motion Scene Design Laws

This document is the core justification for `bang-motion`: technically functional code is still a complete failure if it feels like a PowerPoint presentation.

---

## 1. Why AI Models Default to Slide Decks
AI models are trained to structure information hierarchically: Headline → Subtitle → Explanatory Body Copy → Supporting Evidence Badges.
While effective for technical whitepapers, this formula is fatal for cinematic motion graphics.
Promotional videos and cinematic explainers do not lecture—they **make bold statements**, delivering one visceral punch per shot, and allowing movement, pacing, and music to carry emotion.
If a scene feels like it has "too little text", that is usually proof that the motion design is correct.

---

## 2. Table of Violations vs. Motion Design Corrections

| Violation | Why It's PPT | Cinematic Correction |
|---|---|---|
| Kicker badge ("02 — FEATURES") + 2-line title + 2-line body paragraph + 4 pill badges in a 2-column layout | Generic slide deck layout | Single punchy headline (≤ 5 words) top-center + one hero product object emerging dynamically in 3D/space |
| Three large text lines stating "NO X", "NO Y", "NO Z" | Text bullet list disguised as kinetic type | 2-word hook headline + 1 action chosen from the Feature Menu: interactive UI demo, mutating object, shuffled card stack, or kinetic type surge |
| Product B inherits Product A's skin (identical dark palette, glow, blue nebula, Inter font) | Copying starter/previous project placeholder | Style is derived directly from Brand B via Style Brief: brand hex codes, distinct font with personality, unique background language |
| ALL HEADLINES IN UPPERCASE BOLD 800, centered, identical letter stagger | Stiff, repetitive, corporate template | Sentence case (weight 500–700), emphasis placed on key nouns, punctuation only when adding meaning, varied sizes and asymmetric alignments |
| Every headline ends in a period ("Real-Time Sync.") | Punctuation clutter | Default to zero periods; question marks only for genuine questions; periods reserved for intentional short staccato dual statements |
| 96 glowing bloom bars behind text | Background clutter fighting headline readability | Dark pocket beneath text, dimmed background particles matching theme palette, bloom reserved strictly for focal objects |
| Every video defaults to dark space with floating nebula | Lazy visual default | Background matches subject: bright paper, sage/slate matte cardstock, duotone gradient, technical blueprint, or dark obsidian |
| Every sentence has an underlined or yellow pill highlight | Gimmick saturation | Word highlights are optional and strategic (max 1 per beat); shaped exclusively by brand visual language |
| SaaS demo shows a flat screenshot being zoomed or panned | Lazy static presentation | UI is reconstructed from real components, actively operated (clicking cursor, responsive menus, streaming data), driving the transition |
| Fullscreen video placed with `autoplay loop` while other elements freeze | Sticking raw MP4 onto a slide | Clip is treated as an integrated footage layer: masked, color-graded, and choreographed to GSAP timeline time |
| Two consecutive videos use light streaks shooting horizontally | Reusing the same motion gimmick | Background motion chosen from menu: drifting gradient, alive grain, light sweeps, slow rotating geometry, or breathing grid |
| Transition is always a giant colored rectangle wiping diagonally | Video editor preset transition | Varied transitions: 3D push-through, rotating card depth, object wipe, lens flare, or instrument cut |
| Flat, single-color backdrop with zero motion | Dead canvas | Multi-layered surface (≥ 2 layers): horizon glow, diagonal duotone, mesh blobs, alive grain, or paper fibers |
| Camera static with text fading in/out | Autoplay PowerPoint | Distinct shot framing: camera pushes to Medium Close-Up on the speaking object, then pulls back to Wide; breathing drift on idle |
| "Zoom in/out" implemented as a tiny 2% scale breath | Unnoticeable, video stays static | Motivated camera framing changes: camera dives into the focal element (scale 1.4–2.2), holds for clarity, then pulls back |
| Zoom push-through used on EVERY single transition | Repetitive transition fatigue | Repertoire of movement: camera whip, instrument cut, object pass, and motivated push-through (max 1–2 per piece) |
| Translation whip reveals canvas edges (black bars) | Exposes stage boundary like page turning | Camera travels strictly within infinite backdrop bounds or covers transition with an object wipe |

---

## 3. Explainer-Specific Failure Patterns

An investigative explainer with 6 scenes can easily collapse into a slide deck if these anti-patterns occur:

| What Was Built | Why It's PPT | What It Should Be |
|---|---|---|
| 6 × `<section class="scene">` with fullbleed photos toggled via `autoAlpha` | Swapping sections = swapping slides | One continuous physical or paper world; transitions driven by camera travel or whip-pans to new zones |
| Each scene has: Eyebrow + 2-line title + caption citation | 3 text levels = slide layout | Max 2 levels: 1 bold claim + 1 physical in-world artifact label |
| Motion is only Ken Burns photo zoom (1.08 → 1.01) + scale bump on `#world` | Identical preset movement | Multi-layer parallax, moving archival props, grease-pencil annotations, forensic data plots |
| Light leak flash at every cut | Video editor transition preset | Save dramatic lighting changes for the narrative turning point / forensic climax |
| No recurring visual subject between scenes | Audience has nothing to follow | Hero protagonist, device, or central document persists across ≥ 60% of video runtime |

---

## 4. Golden Rules for Any Project

1. **One Shot = One Bold Statement**: A punchy 5-word headline beats a complex paragraph every time.
2. **Attention Hierarchy**: Headline enters first, main object follows, supporting forensic details enter last.
3. **Long Text is a Bug**: If an argument exceeds 6–8 words, break it into two sequential beats or convert it into an infographic, chart, or prop.
4. **Motion is Meaning**: Zoom-in = emphasis; Pan = discovery; Pull-back = macro perspective; Bounce = playful kinetic energy.
5. **Asymmetric Rhythm**: Enter decisively (`0.7s–1.2s`, `power4.out`), exit swiftly (`0.35s–0.5s`, `power2.in`). Symmetrical timing feels mechanical.
6. **Save the "Expensive" Moment**: Reserve your most elaborate effect (3D camera rotation, exploded schematic, forensic data surge) for the climax.

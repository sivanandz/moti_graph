# Stage Cartoon Guide — Flat Educational Explainer with Character Rigging

> Style 6 of Bang Motion: vibrant flat character-driven educational explainers with rigged joints, living dynamic props, and zero slide captions.

---

## 1. The Stage Concept
A stage cartoon is structured around **individual living stages** rather than an infinite open map:
- Each scene represents a self-contained, beautifully framed theatrical or cinematic stage.
- Transitions between stages occur via hard cuts, swift 96px lateral shoves on the beat, or camera pushes.
- **Rule of Scale**: Subject zoom must remain bold (`1.08` to `1.95`). Never zoom out so far that characters or machinery shrink to tiny unreadable thumbnails.

---

## 2. Character Rigging in HTML & GSAP
Characters are constructed with lightweight hierarchical limb nodes in SVG or HTML DOM:
- **Root**: Hip / Torso anchor (`#character`).
- **Chest & Head**: Linked with subtle breathing counter-rotation (`rotate: sin(t * 2) * 2deg`).
- **Limbs**: Upper arm → Forearm → Hand; Thigh → Calf → Foot.
- **Pivot Points**: Transform origins pinned precisely to anatomical joint coordinates (`transform-origin: 50% 10%` for arms).
- **Expressive Faces**: High-contrast vector eyes, blinking cycles (`scaleY: 0.1` every 3–4 seconds), and interchangeable mouth phonetic visemes tied to narration audio.

---

## 3. Living Props & Environmental Feedback
The stage is never a passive background. Every object reacts to character actions:
- Machines emit pulsing gears, flowing liquid conduits, and steam puffs.
- Gauges and dials flicker in response to system states.
- Foliage or wires vibrate when characters walk past.

---

## 4. Zero Slide Captions
Stage cartoons do not display explanatory body text or bullet points. The voiceover and character performance convey the entire narrative. The only permissible text elements are in-world signage (street signs, warning labels, shop awnings, monitor readings).

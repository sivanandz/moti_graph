# Bang Motion Techniques — Professional Motion Graphics Recipes

This manual details the technical animation recipes that distinguish professional motion graphics from amateur slideshows.

---

## 1. Living Typography
Typography in motion graphics is not static text on a slide; it is a primary kinetic actor.

1. **Sentence Case Hierarchy**: Use sentence case with medium to heavy weights (500–700). Reserve all-caps exclusively for 1-to-2 word kickers or archival rubber stamps.
2. **Selective Word Emphasis**: Emphasize key nouns and verbs using order, size scale, or color highlighting—never emphasize every word.
3. **Punctuation Discipline**: Omit trailing periods on headlines. Trailing periods make text feel like formal documentation rather than spoken motion design.
4. **Directional Motion Blur & Stagger**: Split words or character clusters with slight angular jitter (`-2°` to `+2°`) or directional entry blurs:
   ```css
   filter: blur(calc((1 - var(--progress)) * 12px));
   transform: translateY(calc((1 - var(--progress)) * 24px));
   ```

---

## 2. Background Motion Systems (Never Static)

The background must never remain a dead flat color. Choose one of the verified background languages:
1. **The Breathing Grid**: Fine 1px cyan/white grid subtly drifting (`x: sin(t * 0.5) * 8px`).
2. **The Living Film Grain**: Procedural SVG noise texture refreshing with frame modulo math (`seed = Math.floor(frame / 2)`).
3. **The Shifting Horizon**: Deep vertical gradient oscillating between obsidian black and rich Prussian blue.
4. **Floating Ambient Blobs**: Multi-stop radial gradients drifting in opposing directions with `mix-blend-mode: screen`.
5. **Slow Rotating Blueprint Geometry**: Concentric protractor arcs or technical CAD circles rotating at `0.2 deg/sec`.

---

## 3. Motivated Camera Systems

1. **Camera Scale Changes (MCU, CU, Wide)**:
   - When introducing a scene: Wide establishing shot (`scale: 1.0`).
   - When inspecting evidence: Push in to Medium Close-Up or Close-Up (`scale: 1.4` to `2.0`).
   - When drawing a conclusion: Pull back smoothly to Wide.
2. **Mathematical Micro-Drift (Floating Desk Physics)**:
   To avoid the static digital freeze, elements resting on the desk maintain gentle harmonic micro-motion:
   ```js
   const yOffset = Math.sin((time + seed) * 1.2) * 3; // 3px subtle float
   const rotOffset = Math.cos((time + seed) * 0.9) * 0.6; // 0.6deg subtle drift
   ```

---

## 4. Transition Vocabulary

Never rely on generic cross-dissolve fades. Use physical and dimensional transitions:
1. **The 3D Push-Through**: Camera accelerates straight into the center of a photographic portal or device screen, bursting through to the next environment.
2. **The Object Wipe**: A hero document, scissor-cut photograph, or yellow constructivist wedge sweeps across the camera lens, transitioning the background behind it.
3. **The Whip Cut**: Swift horizontal camera pan (`0.3s`, `power4.inOut`) with directional motion blur, settling onto an adjacent workspace quadrant.
4. **The Physical Fastener Snap**: A thumbtack, binder clip, or piece of tape snaps down with instant mechanical force, locking the new scene into place.

---

## 5. UI & Software Animation

When animating software, applications, or dashboards:
1. **Reconstruct from Real Components**: Never animate a flat screenshot image. Rebuild UI with clean CSS/HTML cards, buttons, badges, and typography.
2. **Motivated Cursor & Touch Interaction**: An animated cursor moves with natural spring curves (`power2.inOut`), clicks the target button, and triggers the UI state change.
3. **Contextual Zoom**: When a user clicks a button or inputs data, the camera pushes directly into that specific widget (`scale: 1.8`), making the action unmistakable on mobile screens.

---

## 6. Footage & Video Clip Layers

When incorporating external live-action footage or generative AI video clips:
1. **Tied to Timeline Time**: Never use uncontrollable `<video autoplay loop>`. Bind video playback strictly to GSAP timeline time:
   ```js
   videoElement.currentTime = tl.time();
   ```
2. **Framed Inside Physical Containers**: Place video clips inside tactile CRT monitors, retro iPhone viewports, photographic slide mounts, or archival newspaper cutouts.

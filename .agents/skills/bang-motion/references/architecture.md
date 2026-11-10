# Bang Motion Architecture — Determinism, Stage Sizing, & Headless Export

This manual details the underlying runtime architecture that guarantees pixel-perfect, zero-drop frame rendering in headless browsers.

---

## 1. Stage Geometry & Responsive Viewport Scaling

Bang Motion targets fixed logical stages that scale cleanly to any device or display resolution:
- **16:9 Stage**: `1920 × 1080` (Widescreen master)
- **9:16 Stage**: `1080 × 1920` (Vertical reel/short master)
- **4:5 Stage**: `1080 × 1350` (Feed portrait master)
- **1:1 Stage**: `1080 × 1080` (Square master)

The `#stage` container is centered and scaled via CSS transforms:
```css
#viewport {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}
#stage {
  position: relative;
  width: var(--stage-w);
  height: var(--stage-h);
  transform-origin: center center;
  transform: scale(var(--scale));
  overflow: hidden;
}
```

---

## 2. Deterministic Timeline Execution (`tl.time()`)

To ensure frame-by-frame headless export matches interactive browser playback down to the exact subpixel:
1. **Zero System Clock Dependency**: Never invoke `performance.now()`, `Date.now()`, or uncontrolled `requestAnimationFrame()` loops that accumulate time differences.
2. **GSAP Timeline Master Clock**: All animations, particle drifts, continuous rotations, and audio playback hooks are registered to a single GSAP master timeline (`window.OPENER.tl` or `window.EXPLAINER.tl`).
3. **Seek Method**: The master object exposes a deterministic seek interface:
   ```js
   window.OPENER.seekFrame = async function(timeSeconds) {
     window.OPENER.tl.time(timeSeconds);
     // Wait for footage layers to settle
     if (window.OPENER.videoLayers) {
       await Promise.all(window.OPENER.videoLayers.map(v => v.seek(timeSeconds)));
     }
   };
   ```

---

## 3. Headless Export Pipeline (`export-frames.mjs`)

Headless frame-by-frame rendering operates as follows:
1. Puppeteer launches headless Chromium with WebGL and hardware acceleration flags:
   `--enable-gpu`, `--use-gl=angle`, `--enable-webgl`, `--ignore-gpu-blocklist`
2. Navigates to `http://127.0.0.1:5178/path/index.html?clean=1`.
3. Waits for `window.OPENER.ready === true` and `document.fonts.ready`.
4. Loops from frame `0` to `totalFrames`:
   - Sets timeline to `time = frame / fps`.
   - Waits for two animation frames (`rAF`) to flush CSS styles and canvas repaints.
   - Captures PNG screenshot to disk (`frames/f00000.png`).
5. FFmpeg stitches the exact PNG sequence into an H.264 MP4:
   ```bash
   ffmpeg -framerate 60 -i frames/f%05d.png -c:v libx264 -pix_fmt yuv420p -crf 16 output.mp4
   ```
   Zero dropped frames, perfectly synchronized audio, and studio-grade rendering quality.

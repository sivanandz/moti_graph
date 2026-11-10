/**
 * Universal Animate — 7 Built-in Procedural Drawing Kits
 * Styles:
 *   1. cut-paper   : Handmade construction paper, scissor-cut borders, drop shadows, stop-motion cadence
 *   2. crosshatch  : Frame-by-frame "boiling" ink outlines, directional hatching, warm parchment
 *   3. riso        : Multi-ink Risograph halftone dot screens, multiply overprint, plate misregistration
 *   4. sketchbook  : Graphite multi-pass pencil strokes, smudge shading, single marker highlight
 *   5. manim-math  : Obsidian canvas, glowing parametric curves, LaTeX-style coordinate proofs
 *   6. pixel-art   : Low-res integer grid, Bayer 4x4 ordered dithering, scanlines & sprite blocks
 *   7. isometric   : True 30-deg axonometric CAD projection, animated data packets, exploded layers
 */
(function (globalScope) {
  const Core = globalScope.AnimateCore || (typeof require !== "undefined" ? require("./core.js") : {});

  // Shared Safe-Area Helper
  function getSafeBox(W, H) {
    if (H > W * 1.3) return { top: 250, bottom: 350, left: 60, right: 140 }; // 9:16
    if (H > W * 1.05) return { top: 120, bottom: 220, left: 60, right: 60 }; // 4:5
    return { top: 60, bottom: 60, left: 60, right: 60 }; // 16:9 or 1:1
  }

  // 1. CUT-PAPER KIT (Vox / Stop-Motion Collage)
  const cutPaperKit = {
    name: "cut-paper",
    label: "Tactile Cut Paper & Halftone Collage",
    palette: {
      mat: "#123544",
      paper: "#EAE0C8",
      ink: "#141414",
      accent: "#F2B705",
      stamp: "#D62828",
      white: "#FFFFFF",
    },
    drawBackground(ctx, W, H, frame, transparent = false) {
      if (transparent) return;
      ctx.fillStyle = this.palette.mat;
      ctx.fillRect(0, 0, W, H);
      // Self-healing cutting mat grid
      ctx.strokeStyle = "rgba(180, 230, 245, 0.11)";
      ctx.lineWidth = 1;
      const step = 48;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // Protractor arc
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.5, Math.min(W, H) * 0.36, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(180, 230, 245, 0.16)";
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    drawBeat(ctx, W, H, state, opts = {}) {
      const f = Core.steppedFrame(state.localFrame, 2);
      const enter = Core.spring(f, 30, 190, 13);
      const safe = getSafeBox(W, H);
      const cx = safe.left + (W - safe.left - safe.right) * 0.5;
      const cy = safe.top + (H - safe.top - safe.bottom) * 0.52;
      const u = Math.min(W, H) / 1080;

      // Constructivist backing slice (strictly BEHIND hero)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.04 + Math.cos(f * 0.05) * 0.01);
      const sliceW = 620 * u * enter;
      const sliceH = 380 * u;
      Core.scissoredPolygon(
        ctx,
        [[-sliceW / 2, -sliceH / 2], [sliceW / 2, -sliceH / 2 - 14 * u], [sliceW / 2 - 10 * u, sliceH / 2], [-sliceW / 2 + 12 * u, sliceH / 2 + 8 * u]],
        { fill: this.palette.accent, border: 8 * u, seed: state.beat.id * 17 }
      );
      ctx.restore();

      // Torn parchment evidence card with Ben-Day halftone dots
      ctx.save();
      const floatY = Math.sin((f + state.beat.id * 9) * 0.08) * 5 * u;
      ctx.translate(cx, cy + floatY);
      const cardW = 540 * u * Math.min(1, enter * 1.05);
      const cardH = 340 * u;
      Core.scissoredPolygon(
        ctx,
        [[-cardW / 2, -cardH / 2], [cardW / 2, -cardH / 2], [cardW / 2, cardH / 2], [-cardW / 2, cardH / 2]],
        { fill: this.palette.paper, border: 12 * u, seed: state.beat.id * 31 }
      );
      // Halftone dot matrix inside card
      ctx.fillStyle = "rgba(20,20,20,0.12)";
      for (let gx = -cardW / 2 + 24 * u; gx < cardW / 2 - 20 * u; gx += 16 * u) {
        for (let gy = -cardH / 2 + 24 * u; gy < cardH / 2 - 20 * u; gy += 16 * u) {
          const r = (2.2 + Math.sin(gx * 0.03 + gy * 0.03 + f * 0.1) * 1.1) * u;
          ctx.beginPath(); ctx.arc(gx, gy, Math.max(0.5, r), 0, Math.PI * 2); ctx.fill();
        }
      }
      // Hero diagram inside card
      this.drawHeroGlyph(ctx, 0, 0, Math.min(cardW, cardH) * 0.34, f, state);

      // Scotch tape strips (staggered +8 frames)
      const tapeEnter = Core.spring(Math.max(0, f - 8), 30, 220, 14);
      if (tapeEnter > 0.05) {
        ctx.save();
        ctx.translate(-cardW * 0.38, -cardH * 0.48);
        ctx.rotate(-0.45);
        ctx.fillStyle = `rgba(242, 225, 155, ${0.72 * tapeEnter})`;
        ctx.fillRect(-45 * u, -14 * u, 90 * u, 28 * u);
        ctx.restore();
      }
      ctx.restore();
    },
    drawHeroGlyph(ctx, x, y, r, f, state) {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = 4;
      const nodes = 5;
      const pts = [];
      for (let i = 0; i < nodes; i++) {
        const a = (i / nodes) * Math.PI * 2 + f * 0.02;
        pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.78]);
      }
      pts.forEach((p, i) => {
        const next = pts[(i + 1) % pts.length];
        Core.wobblyLine(ctx, p[0], p[1], next[0], next[1], { amp: 2, seed: i + f });
      });
      pts.forEach(([px, py], i) => {
        ctx.fillStyle = i === 0 ? "#D62828" : "#141414";
        ctx.beginPath(); ctx.arc(px, py, i === 0 ? 14 : 9, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    },
  };

  // 2. CROSSHATCH KIT (Boiling Ink & Hand-Hatching)
  const crosshatchKit = {
    name: "crosshatch",
    label: "Boiling Crosshatch Ink & Archival Etching",
    palette: {
      paper: "#F3EDE0",
      ink: "#1A1817",
      sepia: "#5C4033",
      accent: "#C83E2B",
      wash: "rgba(92, 64, 51, 0.12)",
    },
    drawBackground(ctx, W, H, frame, transparent = false) {
      if (transparent) return;
      ctx.fillStyle = this.palette.paper;
      ctx.fillRect(0, 0, W, H);
      const boil = Math.floor(frame / 3);
      ctx.strokeStyle = "rgba(26, 24, 23, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 45; i++) {
        const y = (i / 45) * H;
        Core.wobblyLine(ctx, 0, y, W, y, { amp: 2.5, seed: i * 13 + boil });
      }
    },
    drawCrosshatchZone(ctx, x, y, w, h, density = 14, angle = 0.65, boilSeed = 1) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(angle);
      const diag = Math.hypot(w, h);
      for (let pos = -diag / 2; pos <= diag / 2; pos += density) {
        Core.wobblyLine(ctx, -diag / 2, pos, diag / 2, pos, { amp: 1.6, seed: (pos | 0) + boilSeed * 19 });
      }
      ctx.rotate(-angle * 1.8);
      for (let pos = -diag / 2; pos <= diag / 2; pos += density * 1.4) {
        Core.wobblyLine(ctx, -diag / 2, pos, diag / 2, pos, { amp: 1.4, seed: (pos | 0) + boilSeed * 37 });
      }
      ctx.restore();
    },
    drawBeat(ctx, W, H, state) {
      const boil = Math.floor(state.localFrame / 3) + state.beat.id * 100;
      const enter = Core.spring(state.localFrame, 30, 170, 14);
      const safe = getSafeBox(W, H);
      const cx = safe.left + (W - safe.left - safe.right) * 0.5;
      const cy = safe.top + (H - safe.top - safe.bottom) * 0.52;
      const u = Math.min(W, H) / 1080;
      const boxW = 560 * u * enter;
      const boxH = 380 * u * enter;

      ctx.save();
      ctx.strokeStyle = this.palette.ink;
      ctx.lineWidth = 2.6 * u;
      this.drawCrosshatchZone(ctx, cx - boxW * 0.48 + 18 * u, cy - boxH * 0.48 + 18 * u, boxW, boxH, 14 * u, 0.6, boil);
      ctx.fillStyle = this.palette.paper;
      ctx.fillRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH);
      Core.roughRect(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, { amp: 3.2 * u, passes: 2, seed: boil });

      // Etched concentric wave rings
      for (let r = 40 * u; r <= 140 * u; r += 28 * u) {
        ctx.strokeStyle = r > 100 * u ? this.palette.accent : this.palette.ink;
        ctx.lineWidth = (r > 100 * u ? 3.2 : 2.0) * u;
        Core.roughCircle(ctx, cx, cy, r * (0.85 + state.beatPulse * 0.12), {
          amp: 2.8 * u,
          seed: boil + (r | 0),
          progress: Core.clamp(state.progress * 1.5, 0.2, 1),
        });
      }
      ctx.restore();
    },
  };

  // 3. RISO KIT (Multi-Ink Risograph Print & Misregistration)
  const risoKit = {
    name: "riso",
    label: "Multi-Ink Risograph Halftone Overprint",
    palette: {
      paper: "#F7F4EB",
      ink: "#1E2022",
      pink: "#FF48B0",
      blue: "#0078BF",
      yellow: "#FFE800",
      green: "#00A95C",
    },
    drawBackground(ctx, W, H, frame, transparent = false) {
      if (transparent) return;
      ctx.fillStyle = this.palette.paper;
      ctx.fillRect(0, 0, W, H);
    },
    drawRisoPlate(ctx, fn, color, offsetX, offsetY, alpha = 0.85) {
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      fn(ctx);
      ctx.restore();
    },
    drawBeat(ctx, W, H, state) {
      const f = Core.steppedFrame(state.localFrame, 2);
      const enter = Core.spring(f, 30, 180, 13);
      const safe = getSafeBox(W, H);
      const cx = safe.left + (W - safe.left - safe.right) * 0.5;
      const cy = safe.top + (H - safe.top - safe.bottom) * 0.52;
      const u = Math.min(W, H) / 1080;

      // Intentional Riso plate misregistration jitter
      const jx = (Core.noise2D(f * 0.2, 1, state.beat.id) - 0.5) * 6 * u;
      const jy = (Core.noise2D(1, f * 0.2, state.beat.id) - 0.5) * 6 * u;
      const R = 190 * u * enter;

      // Plate 1: Sunflower Yellow Base
      this.drawRisoPlate(ctx, (c) => {
        c.beginPath();
        c.arc(cx - 25 * u, cy + 15 * u, R * 1.05, 0, Math.PI * 2);
        c.fill();
      }, this.palette.yellow, -4 * u, 3 * u, 0.82);

      // Plate 2: Risograph Blue Geometric Grid
      this.drawRisoPlate(ctx, (c) => {
        c.lineWidth = 4 * u;
        c.strokeRect(cx - R * 1.2, cy - R * 0.85, R * 2.4, R * 1.7);
        for (let dx = -R; dx <= R; dx += 22 * u) {
          for (let dy = -R * 0.7; dy <= R * 0.7; dy += 22 * u) {
            if (Math.hypot(dx, dy) < R * 0.95) {
              c.beginPath(); c.arc(cx + dx, cy + dy, 4.2 * u, 0, Math.PI * 2); c.fill();
            }
          }
        }
      }, this.palette.blue, jx, jy, 0.85);

      // Plate 3: Fluorescent Pink Overprint Accent
      this.drawRisoPlate(ctx, (c) => {
        c.beginPath();
        c.arc(cx + 35 * u, cy - 20 * u, R * (0.72 + state.beatPulse * 0.1), 0, Math.PI * 2);
        c.fill();
      }, this.palette.pink, -jx * 1.2, -jy * 1.2, 0.82);
    },
  };

  // 4. SKETCHBOOK KIT (Graphite Pencil + Marker Accent)
  const sketchbookKit = {
    name: "sketchbook",
    label: "Graphite Sketchbook & Felt Highlighter",
    palette: {
      paper: "#FAF6EE",
      graphite: "#2B2B2A",
      lightGraphite: "rgba(43, 43, 42, 0.25)",
      accent: "#E63946",
      highlight: "#F2B705",
    },
    drawBackground(ctx, W, H, frame, transparent = false) {
      if (transparent) return;
      ctx.fillStyle = this.palette.paper;
      ctx.fillRect(0, 0, W, H);
      // Faint notebook rule lines
      ctx.strokeStyle = "rgba(100, 140, 190, 0.14)";
      ctx.lineWidth = 1;
      for (let y = 120; y < H; y += 44) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    },
    drawBeat(ctx, W, H, state) {
      const f = Core.steppedFrame(state.localFrame, 2);
      const enter = Core.spring(f, 30, 175, 14);
      const safe = getSafeBox(W, H);
      const cx = safe.left + (W - safe.left - safe.right) * 0.5;
      const cy = safe.top + (H - safe.top - safe.bottom) * 0.52;
      const u = Math.min(W, H) / 1080;

      // Construction guidelines (light pencil)
      ctx.save();
      ctx.strokeStyle = this.palette.lightGraphite;
      ctx.lineWidth = 1.5 * u;
      Core.wobblyLine(ctx, cx - 320 * u, cy, cx + 320 * u, cy, { amp: 1.5, seed: 10 });
      Core.wobblyLine(ctx, cx, cy - 240 * u, cx, cy + 240 * u, { amp: 1.5, seed: 20 });

      // Felt marker highlight sweep
      const sweep = Core.clamp(state.progress * 1.6, 0, 1);
      ctx.fillStyle = "rgba(242, 183, 5, 0.45)";
      ctx.fillRect(cx - 220 * u, cy - 36 * u, 440 * u * sweep, 72 * u);

      // Multi-pass graphite sketch frame
      ctx.strokeStyle = this.palette.graphite;
      ctx.lineWidth = 2.8 * u;
      Core.roughRect(ctx, cx - 260 * u * enter, cy - 180 * u * enter, 520 * u * enter, 360 * u * enter, {
        amp: 3.5 * u,
        passes: 3,
        seed: f + state.beat.id * 11,
      });

      // Red grease-pencil focal circle
      ctx.strokeStyle = this.palette.accent;
      ctx.lineWidth = 4.2 * u;
      Core.roughCircle(ctx, cx, cy, 115 * u * enter, {
        amp: 4 * u,
        seed: f + 77,
        progress: Core.clamp(state.progress * 1.8, 0, 1),
      });
      ctx.restore();
    },
  };

  // 5. MANIM-MATH KIT (Vector Proof & Parametric Curves)
  const manimMathKit = {
    name: "manim-math",
    label: "Manim-Style Mathematical Vector Canvas",
    palette: {
      paper: "#0D1117",
      ink: "#F0F6FC",
      cyan: "#58A6FF",
      gold: "#F2B705",
      coral: "#FF7B72",
      grid: "rgba(88, 166, 255, 0.14)",
    },
    drawBackground(ctx, W, H, frame, transparent = false) {
      if (transparent) return;
      ctx.fillStyle = this.palette.paper;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = this.palette.grid;
      ctx.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    },
    drawBeat(ctx, W, H, state) {
      const safe = getSafeBox(W, H);
      const cx = safe.left + (W - safe.left - safe.right) * 0.5;
      const cy = safe.top + (H - safe.top - safe.bottom) * 0.52;
      const u = Math.min(W, H) / 1080;
      const plotW = 640 * u;
      const plotH = 360 * u;
      const x0 = cx - plotW / 2;
      const y0 = cy;

      ctx.save();
      // Axes
      ctx.strokeStyle = "rgba(240, 246, 252, 0.55)";
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x0 + plotW, y0);
      ctx.moveTo(x0, cy - plotH / 2); ctx.lineTo(x0, cy + plotH / 2);
      ctx.stroke();

      // Animated parametric / damped harmonic wave + shaded integral
      const drawProg = Core.Easing.easeOutCubic(Core.clamp(state.progress * 1.35, 0.05, 1));
      const steps = 120;
      const maxIdx = Math.max(2, Math.floor(steps * drawProg));
      const freq = 1.8 + (state.beat.id % 3) * 0.6;

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let i = 0; i <= maxIdx; i++) {
        const t = i / steps;
        const x = x0 + t * plotW;
        const val = Math.sin(t * Math.PI * 2 * freq + state.localFrame * 0.04) * Math.exp(-t * 0.8);
        const y = y0 - val * (plotH * 0.44);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(x0 + (maxIdx / steps) * plotW, y0);
      ctx.closePath();
      ctx.fillStyle = "rgba(88, 166, 255, 0.18)";
      ctx.fill();

      // Glowing curve stroke
      ctx.beginPath();
      let tipX = x0, tipY = y0;
      for (let i = 0; i <= maxIdx; i++) {
        const t = i / steps;
        const x = x0 + t * plotW;
        const val = Math.sin(t * Math.PI * 2 * freq + state.localFrame * 0.04) * Math.exp(-t * 0.8);
        const y = y0 - val * (plotH * 0.44);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        tipX = x; tipY = y;
      }
      ctx.strokeStyle = this.palette.cyan;
      ctx.lineWidth = 4.5 * u;
      ctx.shadowColor = this.palette.cyan;
      ctx.shadowBlur = 14 * u;
      ctx.stroke();

      // ValueTracker dot at leading tip
      ctx.fillStyle = this.palette.gold;
      ctx.beginPath();
      ctx.arc(tipX, tipY, (8 + state.beatPulse * 4) * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
  };

  // 6. PIXEL-ART KIT (Integer Grid & Ordered Dithering)
  const pixelArtKit = {
    name: "pixel-art",
    label: "16-Bit Pixel Grid & CRT Scanlines",
    palette: {
      paper: "#1A1C2C",
      ink: "#F4F4F4",
      accent: "#FFCD75",
      cyan: "#38B764",
      magenta: "#B13E53",
      slate: "#333C57",
    },
    drawBackground(ctx, W, H, frame, transparent = false) {
      if (transparent) return;
      ctx.fillStyle = this.palette.paper;
      ctx.fillRect(0, 0, W, H);
    },
    drawBeat(ctx, W, H, state) {
      const safe = getSafeBox(W, H);
      const cx = safe.left + (W - safe.left - safe.right) * 0.5;
      const cy = safe.top + (H - safe.top - safe.bottom) * 0.52;
      const pxSize = Math.max(6, Math.round(Math.min(W, H) / 135));
      const snap = (v) => Math.round(v / pxSize) * pxSize;

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      const cols = 36, rows = 24;
      const startX = snap(cx - (cols * pxSize) / 2);
      const startY = snap(cy - (rows * pxSize) / 2);

      // Pixel frame border & dithered interior
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
          const dist = Math.hypot(c - cols / 2, r - rows / 2);
          const wave = Math.sin(dist * 0.6 - state.localFrame * 0.18);
          if (isBorder) {
            ctx.fillStyle = this.palette.accent;
            ctx.fillRect(startX + c * pxSize, startY + r * pxSize, pxSize, pxSize);
          } else if (wave > 0.35) {
            ctx.fillStyle = dist < 6 ? this.palette.magenta : this.palette.cyan;
            ctx.fillRect(startX + c * pxSize, startY + r * pxSize, pxSize - 1, pxSize - 1);
          } else if ((r + c) % 2 === 0) {
            ctx.fillStyle = this.palette.slate;
            ctx.fillRect(startX + c * pxSize, startY + r * pxSize, pxSize - 1, pxSize - 1);
          }
        }
      }
      ctx.restore();
    },
  };

  // 7. ISOMETRIC KIT (30-Deg Axonometric CAD & System Architecture)
  const isometricKit = {
    name: "isometric",
    label: "Isometric Technical Line Art & Architecture",
    palette: {
      paper: "#F4F5F7",
      ink: "#11161D",
      accent: "#FF4400",
      blue: "#0055FF",
      topFace: "#FFFFFF",
      leftFace: "#E2E6EE",
      rightFace: "#C8D0DF",
    },
    isoProject(x, y, z, originX, originY, scale = 1) {
      const cos30 = 0.8660254;
      const sin30 = 0.5;
      return [
        originX + (x - y) * cos30 * scale,
        originY + ((x + y) * sin30 - z) * scale,
      ];
    },
    drawIsoCube(ctx, x, y, z, wx, wy, wz, ox, oy, scale) {
      const p = (dx, dy, dz) => this.isoProject(x + dx, y + dy, z + dz, ox, oy, scale);
      const top = [p(0, 0, wz), p(wx, 0, wz), p(wx, wy, wz), p(0, wy, wz)];
      const left = [p(0, wy, wz), p(wx, wy, wz), p(wx, wy, 0), p(0, wy, 0)];
      const right = [p(wx, 0, wz), p(wx, wy, wz), p(wx, wy, 0), p(wx, 0, 0)];

      const poly = (pts, fill) => {
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = this.palette.ink;
        ctx.lineWidth = 2.2 * scale;
        ctx.stroke();
      };
      poly(left, this.palette.leftFace);
      poly(right, this.palette.rightFace);
      poly(top, this.palette.topFace);
    },
    drawBackground(ctx, W, H, frame, transparent = false) {
      if (transparent) return;
      ctx.fillStyle = this.palette.paper;
      ctx.fillRect(0, 0, W, H);
    },
    drawBeat(ctx, W, H, state) {
      const enter = Core.spring(state.localFrame, 30, 170, 14);
      const safe = getSafeBox(W, H);
      const cx = safe.left + (W - safe.left - safe.right) * 0.5;
      const cy = safe.top + (H - safe.top - safe.bottom) * 0.55;
      const u = Math.min(W, H) / 1080;

      ctx.save();
      const blocks = [
        [-110, -110, 0, 75, 75, 55],
        [35, -110, 0, 75, 75, 85],
        [-110, 35, 0, 75, 75, 85],
        [-25, -25, 25 + Math.sin(state.localFrame * 0.08) * 14, 90, 90, 95],
      ];
      blocks.forEach(([bx, by, bz, wx, wy, wz], idx) => {
        const s = Core.spring(Math.max(0, state.localFrame - idx * 4), 30, 180, 13);
        if (s > 0.02) {
          this.drawIsoCube(ctx, bx, by, bz * s, wx * s, wy * s, wz * s, cx, cy, u);
        }
      });

      // Animated telemetry conduit & packet
      const [p1x, p1y] = this.isoProject(-72, -72, 55, cx, cy, u);
      const [p2x, p2y] = this.isoProject(20, 20, 120, cx, cy, u);
      ctx.strokeStyle = this.palette.accent;
      ctx.lineWidth = 3.5 * u;
      ctx.setLineDash([8 * u, 6 * u]);
      ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.stroke();
      ctx.setLineDash([]);

      const pktT = (state.localFrame * 0.035) % 1;
      ctx.fillStyle = this.palette.accent;
      ctx.beginPath();
      ctx.arc(Core.lerp(p1x, p2x, pktT), Core.lerp(p1y, p2y, pktT), 7 * u * enter, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
  };

  // Shared Safe-Area Typography Renderer (Kicker + Headline + Accent Highlighter + Caption)
  function drawTypography(ctx, W, H, state, kit) {
    const safe = getSafeBox(W, H);
    const safeW = W - safe.left - safe.right;
    const cx = safe.left + safeW * 0.5;
    const u = Math.min(W, H) / 1080;
    const P = kit.palette;
    const isDark = kit.name === "manim-math" || kit.name === "pixel-art" || kit.name === "cut-paper";
    const textInk = isDark ? "#FFFFFF" : P.ink || "#141414";
    const accentColor = P.accent || P.pink || P.gold || "#F2B705";
    const enter = Core.spring(state.localFrame, 30, 190, 14);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Kicker
    if (state.beat.kicker) {
      ctx.font = `700 ${Math.round(24 * u)}px "Courier New", monospace`;
      ctx.fillStyle = accentColor;
      ctx.fillText(String(state.beat.kicker).toUpperCase(), cx, safe.top + 10 * u);
    }

    // Headline with animated accent box
    const headline = String(state.beat.headline || "");
    if (headline) {
      const fontSize = Math.round(54 * u);
      ctx.font = `800 ${fontSize}px Impact, "Arial Black", sans-serif`;
      const yHead = safe.top + 52 * u + (1 - enter) * 20 * u;
      const metrics = ctx.measureText(headline);
      const hw = Math.min(metrics.width + 36 * u, safeW);

      // Constructivist backing strip behind headline
      ctx.fillStyle = isDark ? "rgba(20,20,20,0.82)" : "rgba(255,255,255,0.88)";
      ctx.fillRect(cx - hw / 2, yHead - 8 * u, hw * enter, fontSize + 18 * u);
      ctx.fillStyle = accentColor;
      ctx.fillRect(cx - hw / 2, yHead + fontSize + 4 * u, hw * Core.clamp(state.progress * 1.8, 0, 1), 6 * u);

      ctx.fillStyle = textInk;
      ctx.fillText(headline, cx, yHead, safeW - 24 * u);
    }

    // Caption pill in bottom safe zone
    const caption = String(state.beat.caption || "");
    if (caption) {
      const capFont = Math.round(30 * u);
      ctx.font = `600 ${capFont}px "Georgia", serif`;
      const yCap = H - safe.bottom - 78 * u;
      const cw = Math.min(ctx.measureText(caption).width + 44 * u, safeW);
      ctx.fillStyle = "rgba(20, 20, 20, 0.84)";
      ctx.beginPath();
      ctx.roundRect(cx - cw / 2, yCap - 12 * u, cw, capFont + 26 * u, 12 * u);
      ctx.fill();
      ctx.fillStyle = "#F8F9FA";
      ctx.fillText(caption, cx, yCap, safeW - 36 * u);
    }
    ctx.restore();
  }

  const AnimateStyles = {
    "cut-paper": cutPaperKit,
    crosshatch: crosshatchKit,
    riso: risoKit,
    sketchbook: sketchbookKit,
    "manim-math": manimMathKit,
    "pixel-art": pixelArtKit,
    isometric: isometricKit,
    getSafeBox,
    drawTypography,
    getKit(name) {
      return this[name] || this["cut-paper"];
    },
  };

  globalScope.AnimateStyles = AnimateStyles;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = AnimateStyles;
  }
})(typeof window !== "undefined" ? window : globalThis);

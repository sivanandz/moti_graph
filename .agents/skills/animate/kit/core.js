/**
 * Universal Animate Kit — Core Deterministic Math, Noise, Easing, Geometry & Timeline Primitives
 * Runs identically in browser <canvas>, headless CDP/Playwright, and Remotion <ProceduralCanvas />.
 */
(function (globalScope) {
  // 1. Seeded PRNG (Mulberry32) & Deterministic Value/FBM Noise
  function mulberry32(seed) {
    let a = (seed >>> 0) + 0x6d2b79f5;
    return function () {
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash2D(x, y, seed = 42) {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041);
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function noise2D(x, y, seed = 42) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash2D(xi, yi, seed);
    const b = hash2D(xi + 1, yi, seed);
    const c = hash2D(xi, yi + 1, seed);
    const d = hash2D(xi + 1, yi + 1, seed);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }

  function fbm(x, y, octaves = 3, seed = 42) {
    let val = 0, amp = 0.5, freq = 1, max = 0;
    for (let i = 0; i < octaves; i++) {
      val += noise2D(x * freq, y * freq, seed + i * 101) * amp;
      max += amp;
      amp *= 0.5;
      freq *= 2.02;
    }
    return val / max;
  }

  // 2. Closed-Form Springs, Stepped Time & Easing
  function clamp(v, min = 0, max = 1) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
  }

  function remap(v, inMin, inMax, outMin = 0, outMax = 1) {
    if (Math.abs(inMax - inMin) < 1e-9) return outMin;
    return lerp(outMin, outMax, (v - inMin) / (inMax - inMin));
  }

  function steppedFrame(frame, step = 2) {
    return Math.floor(frame / step) * step;
  }

  function spring(frame, fps = 30, stiffness = 180, damping = 14, mass = 1) {
    if (frame <= 0) return 0;
    const t = frame / fps;
    const w0 = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      const env = Math.exp(-zeta * w0 * t);
      return 1 - env * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
    }
    const env = Math.exp(-w0 * t);
    return 1 - env * (1 + w0 * t);
  }

  const Easing = {
    linear: (t) => clamp(t),
    easeOutCubic: (t) => 1 - Math.pow(1 - clamp(t), 3),
    easeInOutCubic: (t) => {
      const x = clamp(t);
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    },
    easeOutQuint: (t) => 1 - Math.pow(1 - clamp(t), 5),
    easeOutBack: (t) => {
      const x = clamp(t);
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
  };

  // 3. Hand-Drawn / Tactile Geometry Helpers
  function wobblyLine(ctx, x1, y1, x2, y2, opts = {}) {
    const segments = opts.segments || Math.max(6, Math.hypot(x2 - x1, y2 - y1) / 18) | 0;
    const amp = opts.amp ?? 1.8;
    const seed = opts.seed ?? 11;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const bx = lerp(x1, x2, t);
      const by = lerp(y1, y2, t);
      const env = Math.sin(t * Math.PI);
      const jx = (noise2D(t * 6, seed, seed) - 0.5) * 2 * amp * env;
      const jy = (noise2D(seed, t * 6, seed + 7) - 0.5) * 2 * amp * env;
      if (i === 0) ctx.moveTo(bx + jx, by + jy);
      else ctx.lineTo(bx + jx, by + jy);
    }
    ctx.stroke();
  }

  function roughRect(ctx, x, y, w, h, opts = {}) {
    const amp = opts.amp ?? 2.2;
    const seed = opts.seed ?? 23;
    const passes = opts.passes ?? 1;
    for (let p = 0; p < passes; p++) {
      const s = seed + p * 37;
      wobblyLine(ctx, x, y, x + w, y, { amp, seed: s });
      wobblyLine(ctx, x + w, y, x + w, y + h, { amp, seed: s + 1 });
      wobblyLine(ctx, x + w, y + h, x, y + h, { amp, seed: s + 2 });
      wobblyLine(ctx, x, y + h, x, y, { amp, seed: s + 3 });
    }
  }

  function roughCircle(ctx, cx, cy, r, opts = {}) {
    const steps = opts.steps || 36;
    const amp = opts.amp ?? 2.0;
    const seed = opts.seed ?? 51;
    const progress = clamp(opts.progress ?? 1, 0, 1);
    const maxStep = Math.ceil(steps * progress);
    ctx.beginPath();
    for (let i = 0; i <= maxStep; i++) {
      const a = (i / steps) * Math.PI * 2;
      const dr = (noise2D(Math.cos(a) * 2, Math.sin(a) * 2, seed) - 0.5) * 2 * amp;
      const px = cx + Math.cos(a) * (r + dr);
      const py = cy + Math.sin(a) * (r + dr);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    if (opts.fill) {
      ctx.fillStyle = opts.fill;
      ctx.fill();
    }
    if (opts.stroke !== false) ctx.stroke();
  }

  function scissoredPolygon(ctx, points, opts = {}) {
    const border = opts.border ?? 10;
    const seed = opts.seed ?? 99;
    const jitter = opts.jitter ?? 3.5;
    const rng = mulberry32(seed);
    ctx.save();
    if (opts.shadow !== false) {
      ctx.shadowColor = "rgba(0,0,0,0.42)";
      ctx.shadowBlur = 22;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 12;
    }
    ctx.beginPath();
    points.forEach(([px, py], i) => {
      const jx = (rng() - 0.5) * jitter;
      const jy = (rng() - 0.5) * jitter;
      if (i === 0) ctx.moveTo(px + jx, py + jy);
      else ctx.lineTo(px + jx, py + jy);
    });
    ctx.closePath();
    if (border > 0) {
      ctx.lineJoin = "miter";
      ctx.miterLimit = 3;
      ctx.strokeStyle = opts.borderColor || "#FFFFFF";
      ctx.lineWidth = border * 2;
      ctx.stroke();
    }
    ctx.shadowColor = "transparent";
    if (opts.fill) {
      ctx.fillStyle = opts.fill;
      ctx.fill();
    }
    ctx.restore();
  }

  function morphPoints(ptsA, ptsB, t) {
    const n = Math.max(ptsA.length, ptsB.length);
    const k = Easing.easeInOutCubic(t);
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = ptsA[i % ptsA.length];
      const b = ptsB[i % ptsB.length];
      out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]);
    }
    return out;
  }

  // 4. Timeline & Beat Synchronization Helper
  function resolveBeat(timeline, frame, fps = 30) {
    const sec = frame / fps;
    const board = (timeline && timeline.board) || [];
    let current = board[0] || { id: 1, start: 0, end: 5, headline: "", caption: "" };
    for (const b of board) {
      const s = b.start ?? 0;
      const e = b.end ?? (s + (b.seconds || 4));
      if (sec >= s && sec < e) {
        current = { ...b, start: s, end: e };
        break;
      }
    }
    const startFrame = Math.round((current.start || 0) * fps);
    const endFrame = Math.round((current.end || 4) * fps);
    const localFrame = Math.max(0, frame - startFrame);
    const totalFrames = Math.max(1, endFrame - startFrame);
    const bpm = (timeline && timeline.bpm) || 120;
    const framesPerBeat = (60 / bpm) * fps;
    const beatPhase = (frame % framesPerBeat) / framesPerBeat;
    const beatPulse = Math.exp(-beatPhase * 4.5);
    return {
      beat: current,
      localFrame,
      totalFrames,
      progress: clamp(localFrame / totalFrames, 0, 1),
      beatPhase,
      beatPulse,
    };
  }

  const AnimateCore = {
    mulberry32,
    hash2D,
    noise2D,
    fbm,
    clamp,
    lerp,
    remap,
    steppedFrame,
    spring,
    Easing,
    wobblyLine,
    roughRect,
    roughCircle,
    scissoredPolygon,
    morphPoints,
    resolveBeat,
  };

  globalScope.AnimateCore = AnimateCore;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = AnimateCore;
  }
})(typeof window !== "undefined" ? window : globalThis);

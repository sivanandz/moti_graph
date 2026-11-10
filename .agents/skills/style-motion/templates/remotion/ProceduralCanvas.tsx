import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export type AnimateKitName =
  | "cut-paper"
  | "crosshatch"
  | "riso"
  | "sketchbook"
  | "manim-math"
  | "pixel-art"
  | "isometric";

export interface ProceduralCanvasProps {
  kit: AnimateKitName;
  id?: number;
  kicker?: string;
  headline?: string;
  caption?: string;
  bpm?: number;
  transparent?: boolean;
  hideTypography?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

// DeterministicMulberry32 & Noise helpers for inline Remotion <canvas>
function hash2D(x: number, y: number, seed = 42): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041);
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noise2D(x: number, y: number, seed = 42): number {
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

function springVal(frame: number, fps = 30, stiffness = 180, damping = 14): number {
  if (frame <= 0) return 0;
  const t = frame / fps;
  const w0 = Math.sqrt(stiffness);
  const zeta = damping / (2 * Math.sqrt(stiffness));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

function wobblyLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, amp = 2.0, seed = 11) {
  const segs = Math.max(6, Math.floor(Math.hypot(x2 - x1, y2 - y1) / 18));
  ctx.beginPath();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const bx = x1 + (x2 - x1) * t;
    const by = y1 + (y2 - y1) * t;
    const env = Math.sin(t * Math.PI);
    const jx = (noise2D(t * 6, seed, seed) - 0.5) * 2 * amp * env;
    const jy = (noise2D(seed, t * 6, seed + 7) - 0.5) * 2 * amp * env;
    if (i === 0) ctx.moveTo(bx + jx, by + jy);
    else ctx.lineTo(bx + jx, by + jy);
  }
  ctx.stroke();
}

export const ProceduralCanvas: React.FC<ProceduralCanvasProps> = ({
  kit,
  id = 1,
  bpm = 120,
  transparent = true,
  width,
  height,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: compW, height: compH, durationInFrames } = useVideoConfig();
  const W = width || compW;
  const H = height || compH;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const u = Math.min(W, H) / 1080;
    const cx = W * 0.5;
    const cy = H * 0.5;
    const enter = springVal(frame, fps, 180, 13);
    const progress = Math.min(1, frame / Math.max(1, durationInFrames));
    const framesPerBeat = (60 / bpm) * fps;
    const beatPulse = Math.exp(-((frame % framesPerBeat) / framesPerBeat) * 4.5);

    ctx.clearRect(0, 0, W, H);

    if (kit === "riso") {
      const f = Math.floor(frame / 2) * 2;
      const jx = (noise2D(f * 0.2, 1, id) - 0.5) * 6 * u;
      const jy = (noise2D(1, f * 0.2, id) - 0.5) * 6 * u;
      const R = 210 * u * enter;
      if (!transparent) {
        ctx.fillStyle = "#F7F4EB";
        ctx.fillRect(0, 0, W, H);
      }
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "rgba(255, 232, 0, 0.82)";
      ctx.beginPath(); ctx.arc(cx - 24 * u, cy + 14 * u, R, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = "rgba(0, 120, 191, 0.85)";
      ctx.fillStyle = "rgba(0, 120, 191, 0.85)";
      ctx.lineWidth = 4 * u;
      ctx.strokeRect(cx - R * 1.15 + jx, cy - R * 0.85 + jy, R * 2.3, R * 1.7);
      for (let dx = -R; dx <= R; dx += 22 * u) {
        for (let dy = -R * 0.7; dy <= R * 0.7; dy += 22 * u) {
          if (Math.hypot(dx, dy) < R * 0.92) {
            ctx.beginPath(); ctx.arc(cx + dx + jx, cy + dy + jy, 4 * u, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      ctx.fillStyle = "rgba(255, 72, 176, 0.82)";
      ctx.beginPath(); ctx.arc(cx + 30 * u - jx, cy - 18 * u - jy, R * (0.7 + beatPulse * 0.1), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (kit === "crosshatch") {
      const boil = Math.floor(frame / 3) + id * 71;
      if (!transparent) {
        ctx.fillStyle = "#F3EDE0";
        ctx.fillRect(0, 0, W, H);
      }
      const bw = 540 * u * enter;
      const bh = 360 * u * enter;
      ctx.save();
      ctx.strokeStyle = "#1A1817";
      ctx.lineWidth = 2.4 * u;
      for (let pos = -bw / 2; pos <= bw / 2; pos += 16 * u) {
        wobblyLine(ctx, cx + pos, cy - bh / 2, cx + pos - 40 * u, cy + bh / 2, 2.2 * u, boil + (pos | 0));
      }
      wobblyLine(ctx, cx - bw / 2, cy - bh / 2, cx + bw / 2, cy - bh / 2, 3 * u, boil + 1);
      wobblyLine(ctx, cx + bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2, 3 * u, boil + 2);
      wobblyLine(ctx, cx + bw / 2, cy + bh / 2, cx - bw / 2, cy + bh / 2, 3 * u, boil + 3);
      wobblyLine(ctx, cx - bw / 2, cy + bh / 2, cx - bw / 2, cy - bh / 2, 3 * u, boil + 4);
      ctx.restore();
    } else if (kit === "isometric") {
      if (!transparent) {
        ctx.fillStyle = "#F4F5F7";
        ctx.fillRect(0, 0, W, H);
      }
      const iso = (x: number, y: number, z: number) => [
        cx + (x - y) * 0.866 * u,
        cy + ((x + y) * 0.5 - z) * u,
      ];
      const drawCube = (x: number, y: number, z: number, s: number) => {
        const p = (dx: number, dy: number, dz: number) => iso(x + dx, y + dy, z + dz);
        const faces = [
          { pts: [p(0, s, s), p(s, s, s), p(s, s, 0), p(0, s, 0)], fill: "#E2E6EE" },
          { pts: [p(s, 0, s), p(s, s, s), p(s, s, 0), p(s, 0, 0)], fill: "#C8D0DF" },
          { pts: [p(0, 0, s), p(s, 0, s), p(s, s, s), p(0, s, s)], fill: "#FFFFFF" },
        ];
        faces.forEach(({ pts, fill }) => {
          ctx.beginPath();
          pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
          ctx.closePath();
          ctx.fillStyle = fill; ctx.fill();
          ctx.strokeStyle = "#11161D"; ctx.lineWidth = 2.2 * u; ctx.stroke();
        });
      };
      drawCube(-90, -90, 0, 75 * enter);
      drawCube(20, -90, 0, 75 * enter);
      drawCube(-30, -30, 35 + Math.sin(frame * 0.08) * 14, 85 * enter);
    } else {
      // cut-paper / sketchbook / manim-math / pixel-art fallback procedural accent
      const R = 190 * u * enter;
      ctx.save();
      ctx.strokeStyle = kit === "manim-math" ? "#58A6FF" : "#F2B705";
      ctx.lineWidth = 5 * u;
      wobblyLine(ctx, cx - R, cy, cx + R * progress, cy, 2.5 * u, frame);
      ctx.restore();
    }
  }, [frame, fps, W, H, kit, id, bpm, transparent, durationInFrames]);

  return <canvas ref={canvasRef} width={W} height={H} style={{ width: W, height: H, ...style }} />;
};

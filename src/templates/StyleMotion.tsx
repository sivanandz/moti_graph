import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type Layout = "orbit" | "fullbleed" | "stack" | "split";

export type Scene = {
  id: number;
  from: number;
  frames: number;
  layout?: Layout;
  kicker?: string;
  headline: string;
  accent?: string[];
  caption: string;
  circles?: string[];
  layers: Record<string, string>;
  audio_file?: string;
};

export type TypeSpec = Record<string, any>;

export type Style = {
  canvas: { width: number; height: number; fps: number };
  palette: Record<string, string>;
  background?: { type: "radial" | "solid" | "plate"; from?: string; to?: string };
  layout?: Layout;
  ornaments?: { circles?: boolean; ring?: boolean; sparkles?: boolean; color?: string };
  motion?: {
    enter?: "rise" | "pop" | "fade" | "slide";
    stagger?: number;
    damping?: number;
    drift?: number;
    transition?: "drift" | "fade" | "cut" | "wipe";
    headline?: "word" | "line";
    fade?: number;
  };
  type: { headline: TypeSpec; caption: TypeSpec; kicker?: TypeSpec; fonts?: string[] };
};

export type StyleMotionProps = {
  style: Style;
  scenes: Scene[];
  audio?: string | null;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const col = (P: Record<string, string>, k?: string, fb = "#000") => (k ? P[k] ?? k : fb);

const Sparkle: React.FC<{ x: number; y: number; s: number; phase: number; color: string }> = ({
  x,
  y,
  s,
  phase,
  color,
}) => {
  const f = useCurrentFrame();
  const k = 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(f / 9 + phase));
  return (
    <svg
      style={{ position: "absolute", left: x - s, top: y - s, opacity: k, zIndex: 12 }}
      width={s * 2}
      height={s * 2}
      viewBox="-10 -10 20 20"
    >
      <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill={color} transform={`scale(${k})`} />
    </svg>
  );
};

type Spot = { x: number; y: number; w: number; drift: number; grow?: number };

const spots = (layout: Layout, portrait: boolean, nProps: number) => {
  if (layout === "stack") {
    const row = Array.from({ length: nProps }, (_, i): Spot => ({
      x: (i - (nProps - 1) / 2) * 320,
      y: 360,
      w: 280,
      drift: i % 2 ? 1 : -1,
    }));
    return {
      hero: { x: 0, y: -40, w: 520, drift: 0.2, grow: 0.03 } as Spot,
      backdrop: { x: 0, y: -30, w: 700, drift: -0.4 } as Spot,
      props: row,
    };
  }
  if (layout === "split") {
    const hx = portrait ? 0 : 260,
      hy = portrait ? -200 : 0;
    return {
      hero: { x: hx, y: hy, w: 780, drift: 0.3, grow: 0.04 } as Spot,
      backdrop: { x: hx + 40, y: hy + 40, w: 920, drift: -0.5 } as Spot,
      props: [
        { x: hx - 280, y: hy + 260, w: 340, drift: -1 },
        { x: hx + 300, y: hy - 260, w: 340, drift: 1 },
      ] as Spot[],
    };
  }
  // orbit (default) centered collage geometry
  return {
    hero: { x: 0, y: 0, w: 750, drift: 0.3, grow: 0.04 } as Spot,
    backdrop: { x: 40, y: 60, w: 950, drift: -0.5 } as Spot,
    props: [
      { x: -320, y: -280, w: 380, drift: -1 },
      { x: 340, y: 280, w: 380, drift: 1 },
      { x: -340, y: 260, w: 340, drift: 1 },
      { x: 320, y: -260, w: 340, drift: -1 },
    ] as Spot[],
  };
};

const SceneView: React.FC<{ sc: Scene; style: Style; fade: number }> = ({ sc, style, fade }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const P = style.palette;
  const M = {
    enter: "rise",
    stagger: 5,
    damping: 18,
    drift: 1,
    transition: "drift",
    headline: "word",
    ...style.motion,
  };
  const O = { circles: true, ring: true, sparkles: true, color: "gold", ...style.ornaments };
  const layout: Layout = sc.layout ?? style.layout ?? "orbit";
  const u = Math.min(W, H) / 1080;
  const portrait = H >= W;
  const textLeft = layout === "split" && !portrait;
  const cx = W / 2,
    cy = layout === "split" && portrait ? H * 0.52 : H * 0.5;
  const life = f / sc.frames;
  const enter = (i: number) =>
    spring({ frame: f - i * M.stagger, fps, config: { damping: M.damping, mass: 0.8 } });
  const out = fade > 0 ? interpolate(f, [sc.frames - fade, sc.frames], [0, 1], clamp) : 0;
  const inn = M.transition === "cut" ? 1 : fade > 0 ? interpolate(f, [0, fade], [0, 1], clamp) : 1;
  const orn = col(P, O.color, "#C9A043");

  const enterXf = (e: number) =>
    M.enter === "pop"
      ? `scale(${0.6 + 0.4 * e})`
      : M.enter === "slide"
      ? `translateX(${(1 - e) * -120 * u}px)`
      : M.enter === "fade"
      ? ""
      : `translateY(${(1 - e) * 40 * u}px) scale(${0.94 + 0.06 * e})`;

  const layer = (src: string | undefined, i: number, s: Spot) => {
    if (!src) return null;
    const e = enter(i),
      w = s.w * u,
      d = s.drift * M.drift;
    return (
      <Img
        key={src}
        src={staticFile(src)}
        style={{
          position: "absolute",
          width: w,
          left: cx + s.x * u - w / 2,
          top: cy + s.y * u - w / 2,
          opacity: e,
          transform: `translate(${d * life * 14 * u}px, ${-d * life * 8 * u}px) ${enterXf(e)} scale(${
            1 + (s.grow ?? 0) * life
          })`,
          zIndex: 10 + i,
        }}
      />
    );
  };

  const props = Object.keys(sc.layers)
    .filter((k) => k.startsWith("prop"))
    .sort();
  const g = spots(layout, portrait, props.length);
  const R = 380 * u * (g.hero.w / 750);

  // Scene transition wrapper
  const wrap: React.CSSProperties =
    M.transition === "wipe"
      ? { clipPath: `inset(0 ${out * 100}% 0 0)` }
      : {
          opacity: M.transition === "cut" ? 1 : inn * (1 - out),
          transform: M.transition === "drift" ? `translateY(${-30 * out * u}px)` : undefined,
        };

  // Typography layout
  const T = style.type,
    Hd = T.headline,
    C = T.caption,
    K = T.kicker;
  const sz = (v: number) => v * u;
  const ty = (v: number) => (v <= 1 ? v * H : v * (H / 1080));
  const words = sc.headline.split(" ");
  const accent = new Set((sc.accent ?? []).map((w) => w.toUpperCase().replace(/[^A-Z0-9]/g, "")));
  const textBox: React.CSSProperties = textLeft
    ? { position: "absolute", left: 110 * u, width: W * 0.42, textAlign: "left", zIndex: 25 }
    : {
        position: "absolute",
        left: 0,
        width: "100%",
        textAlign: "center",
        padding: `0 ${80 * u}px`,
        boxSizing: "border-box",
        zIndex: 25,
      };
  const headTop = textLeft ? H * 0.34 : ty(Hd.y ?? 100);
  const capTop = textLeft ? H * 0.34 + sz(Hd.size ?? 64) * 2.6 : ty(C.y ?? 960);
  const kTop = textLeft ? H * 0.34 - sz(K?.size ?? 26) * 2.2 : ty(K?.y ?? 60);

  return (
    <AbsoluteFill style={wrap}>
      {/* Code-drawn circles behind the collage */}
      {O.circles &&
        (sc.circles ?? ["green", "gold"]).map((c, i) => {
          const k = g.hero.w / 750;
          const e = enter(i),
            r = (i === 0 ? 300 : 130) * u * k;
          const [ox, oy] = (i === 0 ? [-50, 20] : [260, -220]).map((v) => v * u * k);
          const ax = cx + g.hero.x * u,
            ay = cy + g.hero.y * u;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: ax + ox - r,
                top: ay + oy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                background: col(P, c),
                transform: `scale(${e}) rotate(${4 * life}deg)`,
                opacity: 0.95,
                zIndex: 4 + i,
              }}
            />
          );
        })}

      {/* Backdrop plate cut-out */}
      {layer(sc.layers.backdrop, 1, g.backdrop)}

      {/* Orbit ring with revolving planets */}
      {O.ring && (
        <svg style={{ position: "absolute", inset: 0, zIndex: 8 }} width={W} height={H}>
          <circle
            cx={cx + g.hero.x * u}
            cy={cy + g.hero.y * u}
            r={R}
            fill="none"
            stroke={orn}
            strokeWidth={2}
            strokeDasharray={2 * Math.PI * R}
            strokeDashoffset={2 * Math.PI * R * (1 - interpolate(f, [6, 28], [0, 1], clamp))}
          />
          {[0, 1].map((i) => {
            const a = f / 35 + i * Math.PI;
            return (
              <circle
                key={i}
                cx={cx + g.hero.x * u + R * Math.cos(a)}
                cy={cy + g.hero.y * u + R * Math.sin(a)}
                r={(i ? 8 : 12) * u}
                fill={orn}
                opacity={enter(3)}
              />
            );
          })}
        </svg>
      )}

      {/* Hero Cutout */}
      {layer(sc.layers.hero, 2, g.hero)}

      {/* Supporting Props Cutouts */}
      {props.map((k, i) => layer(sc.layers[k], 3 + i, g.props[i % g.props.length]))}

      {/* Orbit Sparkles */}
      {O.sparkles &&
        [
          [0.15, 0.28, 16],
          [0.85, 0.32, 14],
          [0.22, 0.72, 12],
          [0.78, 0.70, 18],
          [0.50, 0.20, 10],
        ].map(([x, y, s], i) => (
          <Sparkle key={i} x={x * W} y={y * H} s={s * u} phase={i * 1.7} color={orn} />
        ))}

      {/* Kicker Editorial Label */}
      {sc.kicker && K && (
        <div style={{ ...textBox, top: kTop }}>
          <span
            style={{
              fontFamily: K.font ?? "'Courier New', monospace",
              fontSize: sz(K.size ?? 24),
              letterSpacing: `${K.tracking ?? 4}px`,
              color: col(P, K.color, "#8A857B"),
              textTransform: "uppercase",
            }}
          >
            {sc.kicker}
          </span>
        </div>
      )}

      {/* Main Headline (Word-by-word reveal) */}
      <div style={{ ...textBox, top: headTop }}>
        <h2
          style={{
            fontFamily: Hd.font ?? "Impact, sans-serif",
            fontSize: sz(Hd.size ?? 68),
            lineHeight: 1.15,
            margin: 0,
            textTransform: Hd.case === "title" ? "none" : "uppercase",
            letterSpacing: "-0.5px",
          }}
        >
          {words.map((w, idx) => {
            const isAcc = accent.has(w.toUpperCase().replace(/[^A-Z0-9]/g, ""));
            const wordDelay = Math.floor((idx / words.length) * Math.min(24, sc.frames * 0.3));
            const wordEnter = spring({
              frame: f - wordDelay,
              fps,
              config: { damping: 14, stiffness: 180 },
            });
            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  margin: `0 ${6 * u}px`,
                  opacity: wordEnter,
                  transform: `translateY(${(1 - wordEnter) * 12 * u}px)`,
                  color: isAcc ? col(P, Hd.accentColor, "#C9A043") : col(P, Hd.restColor, "#2B2A26"),
                  fontStyle: isAcc && Hd.accentStyle ? Hd.accentStyle : "normal",
                }}
              >
                {w}
              </span>
            );
          })}
        </h2>
      </div>

      {/* Narration Caption Subtitle Pill */}
      {sc.caption && C && (
        <div style={{ ...textBox, top: capTop }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: col(P, "pill", "#F4F1EA"),
              padding: `${8 * u}px ${24 * u}px`,
              borderRadius: "4px",
              fontFamily: C.font ?? "'Courier New', monospace",
              fontStyle: C.style ?? "italic",
              fontSize: sz(C.size ?? 32),
              color: col(P, C.color, "#2B2A26"),
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: `1px solid ${col(P, "rule", "#C4BEB1")}`,
            }}
          >
            "{sc.caption}"
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const StyleMotion: React.FC<StyleMotionProps> = ({ style, scenes, audio }) => {
  const P = style.palette;
  const fade = style.motion?.fade ?? 8;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: col(P, "paper", "#E9E4DA"),
        backgroundImage:
          style.background?.type === "radial"
            ? `radial-gradient(circle at 50% 50%, ${col(P, style.background.from ?? "paper")}, ${col(
                P,
                style.background.to ?? "paperShade"
              )})`
            : undefined,
      }}
    >
      {/* Background audio track if specified */}
      {audio && <Audio src={staticFile(audio)} />}

      {scenes.map((sc) => (
        <Sequence key={sc.id} from={sc.from} durationInFrames={sc.frames} name={`Scene_${sc.id}`}>
          {sc.audio_file && <Audio src={staticFile(sc.audio_file)} />}
          <SceneView sc={sc} style={style} fade={fade} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

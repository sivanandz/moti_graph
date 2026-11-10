import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ScotchTape } from "../components/ScotchTape";
import { PushPin } from "../components/PushPin";
import { CuttingMatBackground, SurfaceMode } from "../components/CuttingMatBackground";
import { HalftoneCutout } from "../components/HalftoneCutout";
import { RansomLabel, DashedHandArrow, CharcoalScribble } from "../components/RansomLabel";

export type ReelScene = {
  id: number;
  from: number;
  frames: number;
  hookKicker: string;
  hookHeadline: string;
  accent: string[];
  caption: string;
  audio_file?: string;
  heroMetric: string;
  heroLabel: string;
  stampText?: string;
  takeawayBullet: string;
  image?: string;
  surfaceMode?: SurfaceMode;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ReelVoxVerticalScene: React.FC<{
  scene: ReelScene;
  fade?: number;
}> = ({ scene, fade = 6 }) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Authentic 12fps stop-motion frame quantization for tactile paper feel
  const f = Math.floor(rawFrame / 2) * 2;

  // Layer-by-layer stop-motion assembly springs
  const enterHeader = spring({ frame: f, fps, config: { damping: 12, mass: 0.45, stiffness: 185 } });
  const enterCutout = spring({ frame: Math.max(0, f - 4), fps, config: { damping: 12, mass: 0.5, stiffness: 175 } });
  const enterStamp = spring({ frame: Math.max(0, f - 14), fps, config: { damping: 10, mass: 0.38, stiffness: 220 } });

  const driftZoom = interpolate(rawFrame, [0, scene.frames], [1.0, 1.045], clamp);
  const out = interpolate(rawFrame, [scene.frames - fade, scene.frames], [0, 1], clamp);
  const inn = interpolate(rawFrame, [0, fade], [0, 1], clamp);

  // Dynamic Dual-Surface selection (Ref 3 Cutting Mat / Ref 1 Slate Collage / Ref 2 Sage Clipboard)
  const surfaceMode: SurfaceMode =
    scene.surfaceMode ??
    (scene.id % 3 === 1
      ? "cutting-mat"
      : scene.id % 3 === 2
      ? "slate-collage"
      : "sage-clipboard");

  const isDarkSurface = surfaceMode === "cutting-mat" || surfaceMode === "slate-collage";
  const words = scene.hookHeadline.split(" ");
  const accentSet = new Set(
    (scene.accent ?? []).map((w) => w.toUpperCase().replace(/[^A-Z0-9]/g, ""))
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#123544",
        opacity: inn * (1 - out),
        transform: `scale(${driftZoom})`,
        overflow: "hidden",
      }}
    >
      {/* 1. Dynamic Dual-Surface Background (Cutting Mat / Slate Book Collage / Sage Clipboard) */}
      <CuttingMatBackground mode={surfaceMode} sceneSeed={scene.id} />

      {/* Hand-Drawn Dashed Arrow Overlay (Ref 1) */}
      <DashedHandArrow
        color={surfaceMode === "sage-clipboard" ? "#2B2B2B" : "#C5B938"}
        flip={scene.id % 2 === 0}
        style={{
          position: "absolute",
          top: "44%",
          right: scene.id % 2 === 0 ? undefined : "18px",
          left: scene.id % 2 === 0 ? "18px" : undefined,
          zIndex: 15,
        }}
      />

      {/* 2. 9:16 Vertical Stop-Motion Paper Stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          padding: "88px 56px 96px 56px",
          boxSizing: "border-box",
          zIndex: 10,
        }}
      >
        {/* TOP SECTION: Ransom-Note Cutout Kicker + Constructivist Headline */}
        <div
          style={{
            transform: `translateY(${(1 - enterHeader) * -60}px) rotate(${scene.id % 2 === 0 ? -1.2 : 1.1}deg)`,
            opacity: enterHeader,
            position: "relative",
          }}
        >
          {/* Ransom-Note Cutout Typewriter Strip (Ref 1) */}
          <div style={{ marginBottom: "18px" }}>
            <RansomLabel
              text={scene.hookKicker.replace("//", "·")}
              stripColor="black"
              size={19}
              rotation={-1.5}
            />
          </div>

          {/* Torn Paper / Cutting-Mat Headline Plate */}
          <div
            style={{
              backgroundColor: surfaceMode === "cutting-mat" ? "rgba(18, 53, 68, 0.88)" : "#F4F1EA",
              padding: "28px 34px",
              border: surfaceMode === "cutting-mat" ? "2px solid rgba(255,255,255,0.85)" : "none",
              clipPath:
                surfaceMode === "cutting-mat"
                  ? undefined
                  : "polygon(0% 2%, 98% 0%, 100% 96%, 94% 100%, 2% 98%, 0% 85%)",
              boxShadow: "0 18px 38px rgba(0,0,0,0.42)",
              position: "relative",
            }}
          >
            <PushPin top="-14px" left="50%" color="brass" />
            <ScotchTape top="-14px" right="22px" rotation={6} width={85} />

            <h1
              style={{
                fontFamily: "Impact, Franklin Gothic Bold, sans-serif",
                fontSize: "66px",
                lineHeight: 1.04,
                color: surfaceMode === "cutting-mat" ? "#FFFFFF" : "#141414",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {words.map((w, idx) => {
                const cleanWord = w.toUpperCase().replace(/[^A-Z0-9]/g, "");
                const isAcc =
                  accentSet.has(cleanWord) ||
                  (scene.accent ?? []).some((a) => a.toUpperCase().includes(cleanWord) && cleanWord.length > 2);
                return (
                  <span
                    key={idx}
                    style={{
                      display: "inline-block",
                      marginRight: "0.22em",
                      padding: isAcc ? "0 10px" : undefined,
                      backgroundColor: isAcc ? "#F2B705" : undefined,
                      color: isAcc ? "#141414" : undefined,
                      transform: isAcc ? "rotate(-1.2deg)" : undefined,
                      boxShadow: isAcc ? "2px 4px 10px rgba(0,0,0,0.3)" : undefined,
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </h1>
          </div>
        </div>

        {/* MIDDLE SECTION: B&W Newspaper Halftone Cutout with Thick White Scissor Outline & Mayakovsky Slice */}
        <div
          style={{
            position: "relative",
            transform: `translateY(${(1 - enterCutout) * 80}px)`,
            opacity: enterCutout,
            margin: "12px 0",
          }}
        >
          <HalftoneCutout
            src={scene.image}
            height={scene.image ? 440 : 340}
            rotation={scene.id % 2 === 0 ? 1.4 : -1.6}
            sliceBand={true}
            paperclipPosition={scene.id % 2 === 0 ? "top-right" : "left"}
            accentColor="#F2B705"
          >
            {/* Fallback B&W Coarse Halftone Newspaper Specimen Plate when no photo is supplied */}
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#E5E2D9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "28px",
                boxSizing: "border-box",
                position: "relative",
                border: "2px solid #222",
              }}
            >
              <CharcoalScribble
                size={155}
                style={{ position: "absolute", top: "14px", right: "18px", opacity: 0.35 }}
              />
              <div
                style={{
                  fontFamily: "Georgia, Times New Roman, serif",
                  fontSize: "15px",
                  letterSpacing: "3px",
                  color: "#333",
                  borderBottom: "2px solid #141414",
                  paddingBottom: "6px",
                  marginBottom: "14px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                THE INDIAN FINANCIAL GAZETTE · ARCHIVE PLATE #{scene.id}
              </div>
              <div
                style={{
                  fontFamily: "Impact, sans-serif",
                  fontSize: "104px",
                  color: "#141414",
                  lineHeight: 0.95,
                  letterSpacing: "-1px",
                }}
              >
                {scene.heroMetric}
              </div>
              <div
                style={{
                  fontFamily: "Courier New, monospace",
                  fontSize: "23px",
                  fontWeight: 900,
                  color: "#141414",
                  marginTop: "12px",
                  textTransform: "uppercase",
                  backgroundColor: "#FFFFFF",
                  padding: "4px 14px",
                  border: "1.5px solid #141414",
                }}
              >
                {scene.heroLabel}
              </div>
            </div>
          </HalftoneCutout>

          {/* Hero Metric & Takeaway Strip Pinned Over Lower Edge of Cutout */}
          <div
            style={{
              marginTop: "-22px",
              marginLeft: "18px",
              marginRight: "18px",
              backgroundColor: "#EAE0C8",
              padding: "20px 26px",
              clipPath: "polygon(1% 0%, 99% 3%, 100% 97%, 95% 100%, 0% 96%)",
              boxShadow: "0 14px 28px rgba(0,0,0,0.48)",
              position: "relative",
              zIndex: 12,
              borderLeft: "8px solid #F2B705",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span
                style={{
                  fontFamily: "Impact, sans-serif",
                  fontSize: "52px",
                  color: "#141414",
                  lineHeight: 1,
                }}
              >
                {scene.heroMetric}
              </span>
              <span
                style={{
                  fontFamily: "Courier New, monospace",
                  fontSize: "18px",
                  fontWeight: 900,
                  color: "#141414",
                  textTransform: "uppercase",
                  backgroundColor: "#F2B705",
                  padding: "3px 10px",
                }}
              >
                {scene.heroLabel}
              </span>
            </div>

            <div
              style={{
                marginTop: "10px",
                fontFamily: "Courier New, monospace",
                fontSize: "17px",
                fontWeight: 700,
                color: "#222222",
                lineHeight: 1.35,
              }}
            >
              ■ {scene.takeawayBullet}
            </div>
          </div>

          {/* Ransom-Note / Stamp Cutout Tag on Bottom-Right (Ref 1) */}
          {scene.stampText && rawFrame >= 12 && (
            <div
              style={{
                position: "absolute",
                top: "-18px",
                right: "8px",
                transform: `scale(${interpolate(enterStamp, [0, 1], [2.4, 1])}) rotate(6deg)`,
                opacity: interpolate(enterStamp, [0, 0.4], [0, 1]),
                zIndex: 20,
              }}
            >
              <RansomLabel text={scene.stampText} stripColor="yellow" size={18} rotation={2} />
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: Torn Vintage Newspaper / Book Page Subtitle Strip */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              backgroundColor: "#F4F1EA",
              padding: "20px 28px",
              border: "3px solid #FFFFFF",
              clipPath:
                "polygon(0% 4%, 14% 0%, 48% 3%, 84% 0%, 100% 5%, 99% 95%, 76% 100%, 28% 97%, 1% 100%)",
              boxShadow: "0 14px 28px rgba(0,0,0,0.48)",
              fontFamily: "Courier New, monospace",
              fontWeight: 700,
              fontSize: "21px",
              color: "#141414",
              lineHeight: 1.42,
              textAlign: "center",
            }}
          >
            <ScotchTape top="-12px" left="44%" rotation={-3} width={76} />
            "{scene.caption}"
          </div>
          {isDarkSurface && (
            <div
              style={{
                marginTop: "8px",
                textAlign: "right",
                fontFamily: "Courier New, monospace",
                fontSize: "13px",
                color: "rgba(255,255,255,0.62)",
                letterSpacing: "2px",
              }}
            >
              TC: 00:00:{String(scene.id * 5).padStart(2, "0")}:12 // 12FPS STOP-MOTION HALFTONE
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelVoxVerticalVideo: React.FC<{ scenes: ReelScene[] }> = ({ scenes }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#123544" }}>
      {scenes.map((sc) => (
        <Sequence key={sc.id} from={sc.from} durationInFrames={sc.frames} name={`ReelScene_${sc.id}`}>
          {sc.audio_file && <Audio src={staticFile(sc.audio_file)} />}
          <ReelVoxVerticalScene scene={sc} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

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

export type Scene = {
  id: number;
  from: number;
  frames: number;
  kicker: string;
  headline: string;
  accent: string[];
  caption: string;
  audio_file?: string;
  image?: string;
  surfaceMode?: SurfaceMode;
  visualMetaphor: {
    heroTitle: string;
    heroSubtitle: string;
    badgeText: string;
    stampText?: string;
    details: string[];
  };
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const CleanVoxLandscapeScene: React.FC<{
  scene: Scene;
  fade?: number;
}> = ({ scene, fade = 8 }) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 12fps stop-motion frame quantization
  const f = Math.floor(rawFrame / 2) * 2;

  const enterText = spring({ frame: f, fps, config: { damping: 13, mass: 0.48, stiffness: 165 } });
  const enterCard = spring({ frame: Math.max(0, f - 4), fps, config: { damping: 12, mass: 0.52, stiffness: 160 } });
  const enterBadge = spring({ frame: Math.max(0, f - 14), fps, config: { damping: 10, mass: 0.4, stiffness: 210 } });

  const driftScale = interpolate(rawFrame, [0, scene.frames], [1.0, 1.045], clamp);
  const out = interpolate(rawFrame, [scene.frames - fade, scene.frames], [0, 1], clamp);
  const inn = interpolate(rawFrame, [0, fade], [0, 1], clamp);

  const surfaceMode: SurfaceMode =
    scene.surfaceMode ??
    (scene.id % 3 === 1
      ? "cutting-mat"
      : scene.id % 3 === 2
      ? "slate-collage"
      : "sage-clipboard");

  const words = scene.headline.split(" ");
  const accentSet = new Set(
    (scene.accent ?? []).map((w) => w.toUpperCase().replace(/[^A-Z0-9]/g, ""))
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#123544",
        opacity: inn * (1 - out),
        transform: `scale(${driftScale})`,
        overflow: "hidden",
      }}
    >
      {/* 1. Dynamic Dual-Surface Canvas (Cutting Mat / Slate Book Collage / Sage Clipboard) */}
      <CuttingMatBackground mode={surfaceMode} sceneSeed={scene.id} />

      <DashedHandArrow
        color={surfaceMode === "sage-clipboard" ? "#222222" : "#C5B938"}
        flip={scene.id % 2 === 0}
        style={{
          position: "absolute",
          top: "14%",
          left: "48%",
          zIndex: 15,
        }}
      />

      {/* 2. Structured 16:9 Landscape Split Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.12fr 0.88fr",
          width: "100%",
          height: "100%",
          padding: "70px 88px 92px 88px",
          boxSizing: "border-box",
          zIndex: 10,
          alignItems: "center",
          gap: "56px",
        }}
      >
        {/* LEFT COLUMN: Ransom-Note Kicker + Torn Newspaper/Book Headline + Caption */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            transform: `translateY(${(1 - enterText) * 44}px)`,
            opacity: enterText,
          }}
        >
          <div style={{ marginBottom: "18px" }}>
            <RansomLabel text={scene.kicker.replace("·", " ")} stripColor="black" size={20} rotation={-1.2} />
          </div>

          <div
            style={{
              backgroundColor: "#F4F1EA",
              padding: "38px 44px",
              border: "4px solid #FFFFFF",
              clipPath:
                "polygon(0% 2%, 22% 0%, 68% 1.5%, 99% 0%, 100% 96%, 84% 100%, 18% 98%, 0% 95%)",
              boxShadow: "0 22px 44px rgba(0, 0, 0, 0.48)",
              position: "relative",
              transform: "rotate(-0.8deg)",
            }}
          >
            <PushPin top="-12px" left="40px" color="brass" />
            <ScotchTape top="-14px" right="30px" rotation={6} width={80} />

            <h1
              style={{
                fontFamily: "Impact, Franklin Gothic Bold, sans-serif",
                fontSize: "62px",
                lineHeight: 1.08,
                color: "#141414",
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
                      marginRight: "0.24em",
                      marginBottom: "0.06em",
                      padding: isAcc ? "0 10px" : undefined,
                      backgroundColor: isAcc ? "#F2B705" : undefined,
                      color: "#141414",
                      transform: isAcc ? "rotate(-1deg)" : undefined,
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </h1>

            <div style={{ marginTop: "24px", borderTop: "2px dashed #9A958A", paddingTop: "18px" }}>
              <div
                style={{
                  fontFamily: "Courier New, monospace",
                  fontWeight: 700,
                  fontSize: "20px",
                  color: "#1C1C1C",
                  lineHeight: 1.48,
                }}
              >
                "{scene.caption}"
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: B&W Newspaper Halftone Cutout with Thick White Scissor Outline & Mayakovsky Slice */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            transform: `translateY(${(1 - enterCard) * 60}px)`,
            opacity: enterCard,
          }}
        >
          <HalftoneCutout
            src={scene.image}
            height={320}
            rotation={1.5}
            sliceBand={true}
            paperclipPosition="left"
            accentColor="#F2B705"
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#E5E2D9",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "32px",
                boxSizing: "border-box",
                position: "relative",
                border: "2px solid #141414",
              }}
            >
              <CharcoalScribble
                size={140}
                style={{ position: "absolute", top: "10px", right: "14px", opacity: 0.35 }}
              />
              <div
                style={{
                  fontFamily: "Courier New, monospace",
                  fontSize: "14px",
                  fontWeight: 900,
                  letterSpacing: "3px",
                  color: "#141414",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                {scene.visualMetaphor.badgeText}
              </div>
              <div
                style={{
                  fontFamily: "Impact, sans-serif",
                  fontSize: "72px",
                  color: "#141414",
                  lineHeight: 0.98,
                }}
              >
                {scene.visualMetaphor.heroTitle}
              </div>
              <div
                style={{
                  fontFamily: "Courier New, monospace",
                  fontSize: "18px",
                  fontWeight: 900,
                  color: "#141414",
                  marginTop: "10px",
                  borderBottom: "2px solid #141414",
                  paddingBottom: "8px",
                }}
              >
                {scene.visualMetaphor.heroSubtitle}
              </div>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {scene.visualMetaphor.details.map((detail, i) => (
                  <div
                    key={i}
                    style={{
                      fontFamily: "Courier New, monospace",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#1C1C1C",
                    }}
                  >
                    ■ {detail}
                  </div>
                ))}
              </div>
            </div>
          </HalftoneCutout>

          {scene.visualMetaphor.stampText && rawFrame >= 16 && (
            <div
              style={{
                position: "absolute",
                bottom: "-16px",
                right: "10px",
                transform: `scale(${interpolate(enterBadge, [0, 1], [2.4, 1])}) rotate(-6deg)`,
                opacity: interpolate(enterBadge, [0, 0.4], [0, 1]),
                zIndex: 20,
              }}
            >
              <RansomLabel text={scene.visualMetaphor.stampText} stripColor="yellow" size={18} rotation={-2} />
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom 35mm Archival Filmstrip Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#141414",
          color: "#FFFFFF",
          padding: "8px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Courier New, monospace",
          fontSize: "13px",
          letterSpacing: "2px",
          borderTop: "3px solid #F2B705",
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", gap: "24px" }}>
          <span style={{ color: "#F2B705" }}>● REC [12FPS HALFTONE CUTOUT]</span>
          <span style={{ opacity: 0.7 }}>SCENE 0{scene.id}</span>
          <span style={{ opacity: 0.85 }}>SURFACE: {surfaceMode.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ opacity: 0.7 }}>FRM: {String(f).padStart(4, "0")}</span>
          <span style={{ color: "#F2B705" }}>▲ VOX ARCHIVAL PRESS</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CleanVoxVideo: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#123544" }}>
      {scenes.map((sc) => (
        <Sequence key={sc.id} from={sc.from} durationInFrames={sc.frames} name={`Scene_${sc.id}`}>
          {sc.audio_file && <Audio src={staticFile(sc.audio_file)} />}
          <CleanVoxLandscapeScene scene={sc} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

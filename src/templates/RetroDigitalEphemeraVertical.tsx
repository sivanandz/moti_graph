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
import { OscilloscopePortal } from "../components/OscilloscopePortal";
import { StripChartRecorder } from "../components/StripChartRecorder";
import { CRTTelevisionPortal } from "../components/CRTTelevisionPortal";
import { HalftoneCutout } from "../components/HalftoneCutout";
import { PaperSpeechBubble } from "../components/PaperSpeechBubble";
import { ScotchTape } from "../components/ScotchTape";
import { DymoLabel } from "../components/DymoLabel";
import { ThreeCanvasWrapper } from "../components/ThreeCanvasWrapper";
import { CosmicExpansion3D } from "../components/three/CosmicExpansion3D";
import { EchoSatellite3D } from "../components/three/EchoSatellite3D";

export type WordTiming = {
  word: string;
  startFrame: number;
  endFrame: number;
  isKeyWord: boolean;
};

export type RetroScene = {
  id: number;
  from: number;
  frames: number;
  kicker: string;
  headline: string;
  caption: string;
  audio_file?: string;
  image?: string;
  portalType: "kinetic_type_slam" | "macro_document" | "suspect_grid" | "hardware_portal" | "split_memo";
  words?: WordTiming[];
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// In 9:16 Vertical, alternate whether the Media card is on the TOP or BOTTOM of the stack
const MEDIA_BOTTOM_BEATS = new Set([10, 15, 20]);

export const RetroDigitalVerticalScene: React.FC<{
  scene: RetroScene;
  fade?: number;
}> = ({ scene, fade = 5 }) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 12fps stepped stop-motion quantization for tactile archival feel
  const f = Math.floor(rawFrame / 2.5) * 2.5;

  const enterPaper = spring({ frame: f, fps, config: { damping: 13, mass: 0.5, stiffness: 240 } });
  const enterText = spring({ frame: Math.max(0, f - 2), fps, config: { damping: 14, mass: 0.5, stiffness: 230 } });

  const isMacro = scene.portalType === "macro_document";
  const driftScale = interpolate(
    rawFrame,
    [0, scene.frames],
    isMacro ? [1.0, 1.10] : [1.0, 1.02],
    clamp
  );

  const out = interpolate(rawFrame, [scene.frames - fade, scene.frames], [0, 1], clamp);
  const inn = interpolate(rawFrame, [0, fade], [0, 1], clamp);

  const cursorBlink = Math.floor(rawFrame / 8) % 2 === 0;
  const isDark = scene.id === 21 || scene.id === 23;
  const bgBase = isDark ? "#0D1318" : "#F4EFE6";

  const getStagger = (startFrame: number, damping = 12, stiffness = 230) => {
    if (rawFrame < startFrame) return 0;
    return spring({
      frame: Math.max(0, rawFrame - startFrame),
      fps,
      config: { damping, mass: 0.45, stiffness },
    });
  };

  const getHover = (seed: number, yAmp = 3.5, rotAmp = 0.7) => {
    const y = Math.sin((rawFrame + seed) * 0.08) * yAmp;
    const r = Math.cos((rawFrame + seed) * 0.05) * rotAmp;
    return { y, r };
  };

  // Render Speech-Synced Words on Thermal Receipt for 9:16 Vertical Screen
  const renderWordFlow = (textSize = 24, minH = 120, isDarkBox = false) => {
    if (!scene.words || scene.words.length === 0) {
      return (
        <p
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: textSize,
            lineHeight: 1.45,
            margin: 0,
            color: isDarkBox ? "#F4EFE6" : "#141414",
          }}
        >
          "{scene.caption}"
        </p>
      );
    }

    const latestSpokenIdx = scene.words.reduce(
      (acc, w, i) => (rawFrame >= w.startFrame ? i : acc),
      -1
    );

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          alignContent: "flex-start",
          gap: "8px 10px",
          minHeight: minH,
          position: "relative",
        }}
      >
        {latestSpokenIdx === -1 && (
          <span
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: textSize + 4,
              fontWeight: 700,
              color: isDarkBox ? "#FFD166" : "#DE3831",
              opacity: cursorBlink ? 1 : 0,
            }}
          >
            _
          </span>
        )}

        {scene.words.map((w, idx) => {
          const isSpoken = rawFrame >= w.startFrame;
          const isCurrent = rawFrame >= w.startFrame && rawFrame <= w.endFrame + 1;
          const isLatest = idx === latestSpokenIdx;

          if (!isSpoken) {
            return (
              <span
                key={`word-${idx}`}
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: textSize,
                  lineHeight: 1.4,
                  opacity: 0,
                  visibility: "hidden",
                  pointerEvents: "none",
                  display: "inline-block",
                }}
              >
                {w.word}
              </span>
            );
          }

          const popSpring = spring({
            frame: Math.max(0, rawFrame - w.startFrame),
            fps,
            config: { damping: 11, mass: 0.35, stiffness: 280 },
          });

          const jitterRot = ((idx * 7) % 5 - 2) * 0.5;

          return (
            <span
              key={`word-${idx}`}
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                transform: `scale(${popSpring}) rotate(${jitterRot}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: textSize,
                  fontWeight: w.isKeyWord || isCurrent ? 700 : 500,
                  lineHeight: 1.4,
                  color: isCurrent
                    ? "#FFFFFF"
                    : w.isKeyWord
                    ? isDarkBox
                      ? "#FFD166"
                      : "#A61C1C"
                    : isDarkBox
                    ? "#F4EFE6"
                    : "#141414",
                  backgroundColor: isCurrent
                    ? "#DE3831"
                    : w.isKeyWord && !isDarkBox
                    ? "rgba(222, 56, 49, 0.12)"
                    : w.isKeyWord && isDarkBox
                    ? "rgba(255, 209, 102, 0.18)"
                    : "transparent",
                  padding: isCurrent ? "2px 8px" : w.isKeyWord ? "0 4px" : "0px",
                  borderRadius: isCurrent ? 4 : 0,
                  boxShadow: isCurrent ? "0 2px 8px rgba(222, 56, 49, 0.35)" : "none",
                }}
              >
                {w.word}
              </span>

              {isLatest && (
                <span
                  style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: textSize + 4,
                    fontWeight: 700,
                    color: isDarkBox ? "#FFD166" : "#DE3831",
                    opacity: cursorBlink ? 1 : 0,
                    marginLeft: 4,
                    display: "inline-block",
                    transform: "translateY(2px)",
                  }}
                >
                  _
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgBase,
        opacity: inn * (1 - out),
        transform: `scale(${driftScale})`,
        overflow: "hidden",
      }}
    >
      {/* 9:16 DESK SURFACE GRID */}
      {!isDark ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(0, 136, 170, 0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 136, 170, 0.12) 1px, transparent 1px),
              radial-gradient(rgba(180, 168, 150, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px, 48px 48px, 12px 12px",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 40%, #183C4C 0%, #112B37 70%, #0A1C24 100%)",
            backgroundImage: `
              linear-gradient(to right, rgba(135, 218, 238, 0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(135, 218, 238, 0.18) 1px, transparent 1px)
            `,
            backgroundSize: "52px 52px, 52px 52px",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top Header Archival Ribbon - Adapted for 1080 Mobile Width */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 48,
          right: 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: isDark ? "2px solid #284452" : "2px solid #D6CCBD",
          paddingBottom: 8,
          fontFamily: "'Courier Prime', monospace",
          fontSize: 15,
          letterSpacing: 2,
          color: isDark ? "#72D0A4" : "#8A3B2C",
          zIndex: 20,
        }}
      >
        <span style={{ fontWeight: 700 }}>
          BELL LABS ARCHIVE // {scene.kicker}
        </span>
        <span style={{ color: isDark ? "#889CA8" : "#6E685C" }}>
          CRAWFORD HILL 1964
        </span>
      </div>

      {/* ──────────────────────────────────────────────────────────
          LAYOUT 1: KINETIC TYPE SLAM (Beats 1, 6, 16, 19, 24)
          ────────────────────────────────────────────────────────── */}
      {scene.portalType === "kinetic_type_slam" && (() => {
        const hover = getHover(10, 3, 0.5);
        const stampFrame =
          scene.id === 1 ? 125 : scene.id === 6 ? 75 : scene.id === 16 ? 185 : scene.id === 19 ? 55 : 85;
        const stampSpring = getStagger(stampFrame, 10, 260);

        return (
          <div
            style={{
              position: "absolute",
              inset: "100px 48px 80px 48px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              transform: `scale(${enterPaper}) translateY(${hover.y}px)`,
            }}
          >
            {/* Cadmium Yellow / Charcoal Card Container */}
            <div
              style={{
                backgroundColor: scene.id === 1 || scene.id === 24 ? "#F2B705" : "#141414",
                color: scene.id === 1 || scene.id === 24 ? "#141414" : "#FFFFFF",
                padding: "48px 38px",
                boxShadow: "0 28px 60px rgba(0,0,0,0.38)",
                border: "3px solid rgba(0,0,0,0.2)",
                transform: `rotate(${-0.8 + hover.r}deg)`,
                width: "100%",
                maxWidth: 960,
                boxSizing: "border-box",
                position: "relative",
              }}
            >
              <ScotchTape top={-18} left="25%" rotation={-4} />
              <ScotchTape top={-18} right="25%" rotation={5} />

              {/* Bold Headline */}
              <div
                style={{
                  fontFamily: '"Caslon Antique", "Playfair Display", serif',
                  fontSize: 54,
                  fontWeight: 900,
                  lineHeight: 1.12,
                  letterSpacing: "-0.01em",
                  marginBottom: 32,
                  textTransform: "uppercase",
                  filter: "contrast(260%) grayscale(100%)",
                }}
              >
                {scene.headline}
              </div>

              {/* Thermal Word Stamping Below */}
              <div
                style={{
                  backgroundColor: "#FAF7EE",
                  color: "#141414",
                  padding: "26px 30px",
                  borderLeft: "8px solid #DE3831",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.32)",
                  textAlign: "left",
                  position: "relative",
                }}
              >
                <ScotchTape top={-14} right={26} rotation={-4} />
                {renderWordFlow(25, 120, false)}
              </div>

              {/* Staggered Red Historical Stamp */}
              {rawFrame >= stampFrame && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -22,
                    right: 32,
                    transform: `scale(${stampSpring}) rotate(${scene.id === 16 ? -8 : 3}deg)`,
                    transformOrigin: "center center",
                    border: "5px solid #DE3831",
                    borderRadius: 4,
                    padding: "8px 24px",
                    backgroundColor: "rgba(255, 255, 255, 0.96)",
                    color: "#DE3831",
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: scene.id === 16 ? 36 : 20,
                    fontWeight: 900,
                    letterSpacing: 3,
                    boxShadow: "0 10px 24px rgba(222, 56, 49, 0.45)",
                    zIndex: 25,
                  }}
                >
                  {scene.id === 16
                    ? "SCOOPED!"
                    : scene.id === 1
                    ? "HYPOTHESIS: PIGEON DROPPINGS"
                    : scene.id === 19
                    ? "STEADY STATE: REFUTED"
                    : scene.id === 24
                    ? "DISCOVERY OF THE CENTURY"
                    : "HISTORICAL REGISTER"}
                </div>
              )}
            </div>

            {/* Beat 16 Special: Robert Dicke Portrait Cutout + Speech Bubble Placed Below */}
            {scene.id === 16 && (
              <div
                style={{
                  marginTop: 36,
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  zIndex: 35,
                  transform: `scale(${enterPaper})`,
                }}
              >
                <div style={{ position: "relative" }}>
                  <HalftoneCutout
                    src="images/big_bang_pigeons/robert_dicke_portrait.jpg"
                    height={380}
                    rotation={-2}
                    sliceBand={false}
                    paperclipPosition="left"
                  />
                  <div style={{ position: "absolute", bottom: -12, left: 16 }}>
                    <DymoLabel text="ROBERT DICKE // PRINCETON" size="sm" bgColor="#141414" />
                  </div>

                  {/* Speech Bubble with Tail Pointing Directly to Dicke's Mouth */}
                  <PaperSpeechBubble
                    text="“Boys, we have been scooped.”"
                    speaker="Robert Dicke · Princeton"
                    startFrame={170}
                    pointerDirection="bottom-left"
                    x={40}
                    y={-140}
                    width={380}
                    fontSize={24}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────────
          LAYOUT 2: MACRO DOCUMENT INSPECTION (Beats 2, 9, 13, 14, 17, 22)
          ────────────────────────────────────────────────────────── */}
      {scene.portalType === "macro_document" && (() => {
        const heroEntry =
          scene.id === 2 ? 45 : scene.id === 9 ? 75 : scene.id === 13 ? 40 : scene.id === 14 ? 15 : scene.id === 17 ? 65 : 15;
        const enterHero = getStagger(heroEntry, 13, 220);
        const dioramaEntry = scene.id === 2 ? 165 : scene.id === 22 ? 70 : 0;
        const enterDiorama = getStagger(dioramaEntry, 12, 240);
        const hoverDoc = getHover(20, 3.5, 0.6);

        return (
          <div
            style={{
              position: "absolute",
              inset: "90px 48px 70px 48px",
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {/* Top 58%: Large Archival Blueprint / Document Plate */}
            <div
              style={{
                flex: "1 1 58%",
                backgroundColor: "#FDFCFA",
                padding: "16px",
                border: "2px solid #E2DCD0",
                boxShadow: "0 22px 48px rgba(0,0,0,0.32)",
                transform: `scale(${enterHero}) translateY(${hoverDoc.y}px) rotate(${hoverDoc.r}deg)`,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <ScotchTape top={-14} left={36} rotation={-6} width={110} />
              <ScotchTape top={-14} right={36} rotation={5} width={110} />

              {/* Archival Plate Image */}
              <div
                style={{
                  width: "100%",
                  flex: 1,
                  backgroundColor: "#0F1318",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Img
                  src={staticFile(scene.image || "images/big_bang_pigeons/bell_labs_horn_historic.jpg")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: "contrast(1.22) grayscale(100%)",
                  }}
                />

                {/* Staggered Companion Photo (e.g. Holmdel photo on Beat 2) */}
                {scene.id === 2 && rawFrame >= dioramaEntry && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                      width: 320,
                      backgroundColor: "#FFF",
                      padding: 10,
                      boxShadow: "0 18px 36px rgba(0,0,0,0.5)",
                      transform: `scale(${enterDiorama}) rotate(-3deg)`,
                      border: "2px solid #141414",
                    }}
                  >
                    <Img
                      src={staticFile("images/big_bang_pigeons/penzias_wilson_horn_antenna.jpg")}
                      style={{ width: "100%", height: 180, objectFit: "cover", filter: "contrast(1.2) grayscale(100%)" }}
                    />
                    <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                      FIG 1.2 // HOLMDEL HORN ANTENNA
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Plate Caption */}
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 13,
                  color: "#685E50",
                  letterSpacing: 1.5,
                }}
              >
                <span>BELL LABS ARCHIVE // EXHIBIT {String(scene.id).padStart(2, "0")}</span>
                <span>AUTHENTIC EVIDENCE</span>
              </div>
            </div>

            {/* Bottom 42%: Narration Filing Memo Card */}
            <div
              style={{
                flex: "1 1 42%",
                backgroundColor: "#FAF7EE",
                padding: "24px 28px",
                borderTop: "8px solid #DE3831",
                boxShadow: "0 16px 36px rgba(0,0,0,0.22)",
                transform: `scale(${enterText})`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <ScotchTape top={-14} right={40} rotation={2} />
              <div>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 15, color: "#DE3831", fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
                  CHAPTER EVIDENCE // BEAT {String(scene.id).padStart(2, "0")}
                </div>
                <div style={{ fontFamily: '"Caslon Antique", serif', fontSize: 38, fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
                  {scene.headline}
                </div>
              </div>
              <div style={{ backgroundColor: "#EFECE3", padding: "18px 22px", borderLeft: "5px solid #DE3831" }}>
                {renderWordFlow(23, 110)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────────
          LAYOUT 3: SUSPECT ELIMINATION GRID (Beat 7: Vertical Polaroid Stack)
          ────────────────────────────────────────────────────────── */}
      {scene.portalType === "suspect_grid" && (() => {
        const suspects = [
          {
            title: "SUSPECT 1: NYC SKYLINE",
            img: "images/big_bang_pigeons/nyc_skyline_1960s.jpg",
            rot: -2,
            entryFrame: 15,
            stampFrame: 55,
            seed: 10,
          },
          {
            title: "SUSPECT 2: MILITARY RADAR",
            img: "images/big_bang_pigeons/cold_war_radar_dish.jpg",
            rot: 1.5,
            entryFrame: 75,
            stampFrame: 115,
            seed: 35,
          },
          {
            title: "SUSPECT 3: STARFISH PRIME NUCLEAR TEST",
            img: "images/big_bang_pigeons/starfish_prime_aurora_honolulu.jpg",
            rot: -1.5,
            entryFrame: 120,
            stampFrame: 175,
            seed: 60,
          },
        ];

        return (
          <div
            style={{
              position: "absolute",
              inset: "90px 48px 70px 48px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 16, color: "#DE3831", fontWeight: 700, letterSpacing: 3 }}>
                CHAPTER II // SYSTEMATIC SUSPECT ELIMINATION
              </div>
              <div style={{ fontFamily: '"Caslon Antique", serif', fontSize: 40, fontWeight: 900, lineHeight: 1.15 }}>
                {scene.headline}
              </div>
            </div>

            {/* 3 Polaroids Stacked Vertically in 9:16 Format */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                gap: 16,
                margin: "12px 0",
              }}
            >
              {suspects.map((suspect, sIdx) => {
                const isEntered = rawFrame >= suspect.entryFrame;
                const enterS = getStagger(suspect.entryFrame, 12, 230);
                const hasStamp = rawFrame >= suspect.stampFrame;
                const stampS = getStagger(suspect.stampFrame, 10, 270);
                const h = getHover(suspect.seed, 3, 0.5);

                return (
                  <div
                    key={sIdx}
                    style={{
                      display: "flex",
                      backgroundColor: "#FFFFFF",
                      padding: "12px 16px",
                      boxShadow: "0 16px 32px rgba(0,0,0,0.28)",
                      transform: `scale(${enterS}) translateY(${h.y}px) rotate(${suspect.rot + h.r}deg)`,
                      transformOrigin: "center center",
                      position: "relative",
                      opacity: isEntered ? 1 : 0,
                      alignItems: "center",
                      gap: 20,
                    }}
                  >
                    <Img
                      src={staticFile(suspect.img)}
                      style={{
                        width: 240,
                        height: 140,
                        objectFit: "cover",
                        filter: "grayscale(100%) contrast(1.3)",
                      }}
                    />

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Courier Prime', monospace",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#141414",
                          marginBottom: 6,
                        }}
                      >
                        {suspect.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Courier Prime', monospace",
                          fontSize: 13,
                          color: "#7E7569",
                        }}
                      >
                        RF TEST: 4,080 MHz · ISOTROPIC
                      </div>
                    </div>

                    {/* RED "RULED OUT" INK STAMP */}
                    {hasStamp && (
                      <div
                        style={{
                          position: "absolute",
                          right: 32,
                          top: "50%",
                          transform: `translateY(-50%) scale(${stampS}) rotate(-14deg)`,
                          border: "4px solid #DE3831",
                          borderRadius: 4,
                          padding: "6px 18px",
                          backgroundColor: "rgba(255, 255, 255, 0.94)",
                          color: "#DE3831",
                          fontFamily: "'Courier Prime', monospace",
                          fontSize: 22,
                          fontWeight: 900,
                          letterSpacing: 2,
                          boxShadow: "0 6px 18px rgba(222, 56, 49, 0.4)",
                          zIndex: 10,
                        }}
                      >
                        RULED OUT
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Narration Word Flow */}
            <div
              style={{
                backgroundColor: "#FAF7EE",
                padding: "20px 24px",
                borderLeft: "6px solid #DE3831",
                boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
              }}
            >
              {renderWordFlow(22, 90)}
            </div>
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────────
          LAYOUT 4: HARDWARE PORTAL SPOTLIGHT (Beats 4, 5, 8, 12, 21, 23)
          ────────────────────────────────────────────────────────── */}
      {scene.portalType === "hardware_portal" && (() => {
        return (
          <div
            style={{
              position: "absolute",
              inset: "90px 48px 70px 48px",
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {/* Top 58%: Hardware Telemetry Vessel (Oscilloscope, CRT, Strip Chart, or 3D Cosmic) */}
            <div
              style={{
                flex: "1 1 58%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {scene.id === 4 ? (
                <div style={{ position: "relative" }}>
                  <StripChartRecorder width={880} height={560} />
                  <div style={{ position: "absolute", bottom: 20, right: 30 }}>
                    <DymoLabel text="ESTERLINE-ANGUS // 3.5K PEN SIGNAL" size="sm" bgColor="#141414" />
                  </div>
                </div>
              ) : scene.id === 5 || scene.id === 8 ? (
                <div style={{ position: "relative" }}>
                  <OscilloscopePortal
                    width={880}
                    height={560}
                    frequency={scene.id === 8 ? 0.08 : 0.04}
                    noiseLevel={scene.id === 8 ? 32 : 18}
                    label="4,080 MHz // NOISE TEMPERATURE"
                  />
                  <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)" }}>
                    <DymoLabel text="TEKTRONIX 545 // CONTINUOUS RESIDUAL" size="sm" bgColor="#141414" />
                  </div>
                </div>
              ) : scene.id === 12 ? (
                <div style={{ width: 880, height: 560, backgroundColor: "#0A0D12", position: "relative", borderRadius: 8, overflow: "hidden", border: "4px solid #1E2B37" }}>
                  <ThreeCanvasWrapper width={880} height={560}>
                    <EchoSatellite3D />
                  </ThreeCanvasWrapper>
                  <div style={{ position: "absolute", bottom: 20, left: 30 }}>
                    <DymoLabel text="PROJECT ECHO // 100-FT MYLAR BALLOON" size="sm" bgColor="#191919" />
                  </div>
                </div>
              ) : scene.id === 21 ? (
                <div style={{ position: "relative" }}>
                  <CRTTelevisionPortal width={880} height={560} />
                  <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)" }}>
                    <DymoLabel text="1% COSMIC MICROWAVE BACKGROUND" size="sm" bgColor="#191919" />
                  </div>
                </div>
              ) : (
                <div style={{ position: "relative", width: 880, backgroundColor: "#0A0D12", padding: 14, boxShadow: "0 24px 50px rgba(0,0,0,0.6)" }}>
                  <Img src={staticFile(scene.image || "images/big_bang_pigeons/planck_cmb_allsky_map.jpg")} style={{ width: "100%", maxHeight: 520, objectFit: "contain", display: "block" }} />
                  <ScotchTape top={-12} left={-14} rotation={-12} />
                  <div style={{ position: "absolute", bottom: -14, right: 30 }}>
                    <DymoLabel text="RELIC RADIATION // 380,000 YRS" size="sm" bgColor="#DE3831" />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom 42%: Technical Telemetry Receipt */}
            <div
              style={{
                flex: "1 1 42%",
                backgroundColor: isDark ? "#16202A" : "#FAF7EE",
                padding: "26px 30px",
                boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
                borderTop: "8px solid #DE3831",
                transform: `scale(${enterText})`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <ScotchTape top={-16} left="40%" rotation={2} />
              <div>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 16, color: "#DE3831", fontWeight: 700, marginBottom: 8 }}>
                  BEAT {String(scene.id).padStart(2, "0")} · INSTRUMENT SIGNAL
                </div>
                <div style={{ fontFamily: '"Caslon Antique", serif', fontSize: 40, fontWeight: 700, lineHeight: 1.15, color: isDark ? "#FFF" : "#141414", marginBottom: 16 }}>
                  {scene.headline}
                </div>
              </div>
              <div style={{ backgroundColor: isDark ? "#0D141C" : "#EFECE3", padding: "18px 22px", borderLeft: "5px solid #DE3831" }}>
                {renderWordFlow(23, 110, isDark)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────────
          LAYOUT 5: SPLIT MEMO (Beats 3, 10, 11, 15, 18, 20)
          ────────────────────────────────────────────────────────── */}
      {scene.portalType === "split_memo" && (() => {
        const heroEntry =
          scene.id === 3 ? 25 : scene.id === 10 ? 68 : scene.id === 11 ? 20 : scene.id === 15 ? 15 : scene.id === 18 ? 20 : 25;
        const enterHero = getStagger(heroEntry, 12, 230);
        const hCutout = getHover(30, 3.5, 0.7);

        // Alternating Top vs Bottom layout for anti-PowerPoint motion in vertical
        const isMediaTop = !MEDIA_BOTTOM_BEATS.has(scene.id);

        return (
          <div
            style={{
              position: "absolute",
              inset: "90px 48px 70px 48px",
              display: "flex",
              flexDirection: isMediaTop ? "column" : "column-reverse",
              gap: 28,
            }}
          >
            {/* Media Cutout / Evidence Card */}
            <div
              style={{
                flex: "1 1 54%",
                backgroundColor: "#EBE6DA",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "0 18px 36px rgba(0,0,0,0.22)",
                padding: "20px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            >
              <div style={{ position: "absolute", top: 12, left: 16, fontFamily: "'Courier Prime', monospace", fontSize: 13, letterSpacing: 2, color: "#8E8474" }}>
                MEMORANDUM FOR FILE · BELL TELEPHONE LABORATORIES
              </div>

              {/* Halftone Cutout with Spring Entrance */}
              <div
                style={{
                  position: "relative",
                  transform: `scale(${enterHero}) translateY(${hCutout.y}px) rotate(${hCutout.r}deg)`,
                  marginTop: 20,
                }}
              >
                <HalftoneCutout
                  src={scene.image || "images/big_bang_pigeons/penzias_wilson_horn_antenna.jpg"}
                  height={scene.id === 10 ? 380 : scene.id === 15 ? 360 : 420}
                  rotation={-1}
                  sliceBand={false}
                  paperclipPosition="top-right"
                />

                {/* Beat 10: Pigeon Speech Bubble */}
                {scene.id === 10 && (
                  <PaperSpeechBubble
                    text="“A white dielectric material...”"
                    speaker="Bell Labs Field Log // Penzias & Wilson"
                    startFrame={68}
                    pointerDirection="bottom-left"
                    x={20}
                    y={-140}
                    width={380}
                    fontSize={22}
                  />
                )}

                {/* Beat 15: David Todd Wilkinson portrait companion */}
                {scene.id === 15 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -20,
                      right: -30,
                      zIndex: 15,
                      transform: `scale(${getStagger(heroEntry + 10, 12, 220)}) rotate(4deg)`,
                      opacity: rawFrame >= heroEntry + 10 ? 1 : 0,
                    }}
                  >
                    <HalftoneCutout
                      src="images/big_bang_pigeons/david_todd_wilkinson.jpg"
                      height={260}
                      rotation={0}
                      sliceBand={false}
                      paperclipPosition="top-right"
                    />
                    <div style={{ position: "absolute", bottom: -12, right: 14 }}>
                      <DymoLabel text="DAVID WILKINSON // RADIOMETER" size="sm" bgColor="#141414" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Narration Thermal Receipt Card */}
            <div
              style={{
                flex: "1 1 46%",
                backgroundColor: "#FAF7EE",
                padding: "26px 30px",
                borderTop: "8px solid #DE3831",
                boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
                transform: `scale(${enterText})`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <ScotchTape top={-16} left="38%" rotation={2} />
              <div>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 16, color: "#DE3831", fontWeight: 700, marginBottom: 8 }}>
                  BEAT {String(scene.id).padStart(2, "0")} · ARCHIVAL REPORT
                </div>
                <div style={{ fontFamily: '"Caslon Antique", serif', fontSize: 40, fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
                  {scene.headline}
                </div>
              </div>
              <div style={{ backgroundColor: "#EFECE3", padding: "18px 22px", borderLeft: "5px solid #DE3831" }}>
                {renderWordFlow(23, 110)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────────
          BOTTOM STATUS REGISTER BAR - 9:16 Mobile Safe Area
          ────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 48,
          right: 48,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Courier Prime', monospace",
          fontSize: 13,
          letterSpacing: 1.5,
          color: isDark ? "#6C808E" : "#80786C",
          borderTop: isDark ? "1px solid #1C2B35" : "1px solid #DFD8CB",
          paddingTop: 8,
          zIndex: 20,
        }}
      >
        <span>LAT: 40°23'30" N · LON: 74°11'10" W</span>
        <span>EXCESS: 3.5K ± 1.0K</span>
        <span>FRAME: {rawFrame} / {scene.frames}</span>
      </div>
    </AbsoluteFill>
  );
};

export const RetroDigitalEphemeraVerticalVideo: React.FC<{
  scenes: RetroScene[];
}> = ({ scenes }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F4EFE6" }}>
      {scenes.map((scene) => (
        <Sequence
          key={`scene-${scene.id}`}
          from={scene.from}
          durationInFrames={scene.frames}
        >
          <RetroDigitalVerticalScene scene={scene} />
          {scene.audio_file && (
            <Audio src={staticFile(scene.audio_file)} />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const RetroDigitalEphemeraVertical = RetroDigitalEphemeraVerticalVideo;

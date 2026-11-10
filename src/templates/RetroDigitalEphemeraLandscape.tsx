import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
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

// Curated alternating layout flow: beats where Media is placed on the Right and Text on the Left
const MEDIA_RIGHT_BEATS = new Set([3, 8, 11, 13, 14, 17, 20, 22]);

export const RetroDigitalScene: React.FC<{
  scene: RetroScene;
  fade?: number;
}> = ({ scene, fade = 5 }) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 12fps stepped stop-motion quantization for authentic tactile archival feel
  const f = Math.floor(rawFrame / 2.5) * 2.5;

  // Snappy paper card background spring
  const enterPaper = spring({ frame: f, fps, config: { damping: 13, mass: 0.5, stiffness: 240 } });
  const enterText = spring({ frame: Math.max(0, f - 2), fps, config: { damping: 14, mass: 0.5, stiffness: 230 } });

  // Camera dynamics per layout
  const isMacro = scene.portalType === "macro_document";
  const driftScale = interpolate(
    rawFrame,
    [0, scene.frames],
    isMacro ? [1.0, 1.12] : [1.0, 1.025],
    clamp
  );

  const out = interpolate(rawFrame, [scene.frames - fade, scene.frames], [0, 1], clamp);
  const inn = interpolate(rawFrame, [0, fade], [0, 1], clamp);

  // Active blinking typewriter cursor
  const cursorBlink = Math.floor(rawFrame / 8) % 2 === 0;

  // Dark background for deep space / cosmic CMB beats
  const isDark = scene.id === 21 || scene.id === 23;
  const bgBase = isDark ? "#0D1318" : "#F4EFE6";

  // Staggered Entrance Spring Helper
  const getStagger = (startFrame: number, damping = 12, stiffness = 230) => {
    if (rawFrame < startFrame) return 0;
    return spring({
      frame: Math.max(0, rawFrame - startFrame),
      fps,
      config: { damping, mass: 0.45, stiffness },
    });
  };

  // Organic Continuous Hover / Floating Motion Helper
  const getHover = (seed: number, yAmp = 4, rotAmp = 0.8) => {
    const y = Math.sin((rawFrame + seed) * 0.08) * yAmp;
    const r = Math.cos((rawFrame + seed) * 0.05) * rotAmp;
    return { y, r };
  };

  // Render Speech-Synced Words on Thermal Receipt
  const renderWordFlow = (textSize = 21, minH = 110, isDarkBox = false) => {
    if (!scene.words || scene.words.length === 0) {
      return (
        <p
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: textSize,
            lineHeight: 1.4,
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
          gap: "6px 8px",
          minHeight: minH,
          position: "relative",
        }}
      >
        {latestSpokenIdx === -1 && (
          <span
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: textSize + 2,
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
                  lineHeight: 1.45,
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

          const jitterRot = ((idx * 7) % 5 - 2) * 0.6;

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
                  lineHeight: 1.45,
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
                    ? "rgba(222, 56, 49, 0.09)"
                    : w.isKeyWord && isDarkBox
                    ? "rgba(255, 209, 102, 0.15)"
                    : "transparent",
                  padding: isCurrent ? "2px 6px" : w.isKeyWord ? "0 4px" : "0px",
                  borderRadius: isCurrent ? 3 : 0,
                  boxShadow: isCurrent ? "0 2px 8px rgba(222, 56, 49, 0.35)" : "none",
                }}
              >
                {w.word}
              </span>

              {isLatest && (
                <span
                  style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: textSize + 2,
                    fontWeight: 700,
                    color: isDarkBox ? "#FFD166" : "#DE3831",
                    opacity: cursorBlink ? 1 : 0,
                    marginLeft: 3,
                    display: "inline-block",
                    transform: "translateY(1px)",
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
      {/* ──────────────────────────────────────────────────────────
          DESK BACKGROUND SURFACE + DRAFTING TOOLS
          ────────────────────────────────────────────────────────── */}
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
            backgroundSize: "60px 60px, 60px 60px, 12px 12px",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 45%, #183C4C 0%, #112B37 70%, #0A1C24 100%)",
            backgroundImage: `
              linear-gradient(to right, rgba(135, 218, 238, 0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(135, 218, 238, 0.18) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px, 64px 64px",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Overhead Metal Tailor's Shears (Top-Left) with subtle float */}
      <svg
        width="220"
        height="180"
        viewBox="0 0 220 180"
        style={{
          position: "absolute",
          top: -12,
          left: -16,
          filter: "drop-shadow(6px 12px 14px rgba(0,0,0,0.55))",
          opacity: 0.9,
          pointerEvents: "none",
          transform: `translateY(${Math.sin(rawFrame * 0.04) * 2}px)`,
        }}
      >
        <g transform="rotate(-15 90 80)">
          <polygon points="85,75 210,20 200,38 80,88" fill="#8C969E" />
          <polygon points="85,82 205,128 192,142 78,92" fill="#68727A" />
          <circle cx="92" cy="85" r="6" fill="#1C1C1C" />
          <ellipse cx="42" cy="54" rx="30" ry="18" transform="rotate(-18 42 54)" fill="none" stroke="#1C2126" strokeWidth="12" />
          <ellipse cx="40" cy="112" rx="30" ry="18" transform="rotate(20 40 112)" fill="none" stroke="#1C2126" strokeWidth="12" />
        </g>
      </svg>

      {/* Top Header Archival Ribbon */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: isDark ? "2px solid #284452" : "2px solid #D6CCBD",
          paddingBottom: 10,
          fontFamily: "'Courier Prime', monospace",
          fontSize: 14,
          letterSpacing: 3,
          color: isDark ? "#72D0A4" : "#8A3B2C",
          zIndex: 15,
        }}
      >
        <span style={{ fontWeight: 700 }}>
          ● BELL LABS HISTORICAL ARCHIVE // {scene.kicker}
        </span>
        <span style={{ color: isDark ? "#889CA8" : "#6E685C" }}>
          ACTUAL HISTORICAL EVIDENCE // CRAWFORD HILL 1964
        </span>
      </div>

      {/* ──────────────────────────────────────────────────────────
          LAYOUT MATRIX DISPATCHER (5 DISTINCT LAYOUTS)
          ────────────────────────────────────────────────────────── */}

      {/* LAYOUT 1: KINETIC TYPE SLAM (Beats 1, 6, 16, 19, 24) */}
      {scene.portalType === "kinetic_type_slam" && (() => {
        const hover = getHover(10, 3, 0.5);

        // Beat-specific stamp timings
        const stampFrame =
          scene.id === 1 ? 125 : scene.id === 6 ? 75 : scene.id === 16 ? 185 : scene.id === 19 ? 55 : 85;
        const stampSpring = getStagger(stampFrame, 10, 260);

        return (
          <div
            style={{
              position: "absolute",
              inset: "80px 64px 60px 64px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              transform: `scale(${enterPaper}) translateY(${hover.y}px)`,
            }}
          >
            {/* Cadmium Yellow / Charcoal Backing Card */}
            <div
              style={{
                backgroundColor: scene.id === 1 || scene.id === 24 ? "#F2B705" : "#141414",
                color: scene.id === 1 || scene.id === 24 ? "#141414" : "#FFFFFF",
                padding: "44px 54px",
                boxShadow: "0 28px 60px rgba(0,0,0,0.38)",
                border: "2px solid rgba(0,0,0,0.15)",
                transform: `rotate(${-1 + hover.r}deg)`,
                maxWidth: 1400,
                width: "92%",
                position: "relative",
              }}
            >
              <ScotchTape top={-18} left="20%" rotation={-4} />
              <ScotchTape top={-18} right="20%" rotation={6} />

              {/* Giant 1-Bit Dithered Serif Headline */}
              <div
                style={{
                  fontFamily: '"Caslon Antique", "Playfair Display", "Century Schoolbook", serif',
                  fontSize: 66,
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  marginBottom: 24,
                  textTransform: "uppercase",
                  filter: "contrast(260%) grayscale(100%)",
                  paddingLeft: scene.id === 16 ? 340 : 0,
                }}
              >
                {scene.headline}
              </div>

              {/* Thermal Word Stamping Below - Tactile Cream Paper Receipt */}
              <div
                style={{
                  backgroundColor: "#FAF7EE",
                  color: "#141414",
                  padding: "22px 30px",
                  borderLeft: "6px solid #DE3831",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  textAlign: "left",
                  position: "relative",
                  marginLeft: scene.id === 16 ? 220 : 0,
                }}
              >
                <ScotchTape top={-12} right={26} rotation={-4} />
                {renderWordFlow(24, 80, false)}
              </div>

              {/* Staggered Red Historical Stamp */}
              {rawFrame >= stampFrame && (
                <div
                  style={{
                    position: "absolute",
                    bottom: scene.id === 16 ? "15%" : -18,
                    right: scene.id === 16 ? "5%" : 40,
                    transform: `scale(${stampSpring}) rotate(${scene.id === 16 ? -12 : 3}deg)`,
                    transformOrigin: "center center",
                    border: "4px solid #DE3831",
                    borderRadius: 4,
                    padding: "6px 18px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    color: "#DE3831",
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: scene.id === 16 ? 42 : 16,
                    fontWeight: 900,
                    letterSpacing: 3,
                    boxShadow: "0 8px 20px rgba(222, 56, 49, 0.45)",
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
                    : "THE 1964 HISTORICAL REGISTER"}
                </div>
              )}

              {/* Beat 16: Robert Dicke Portrait Cutout + Animated Paper Speech Bubble */}
              {scene.id === 16 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -30,
                    left: -20,
                    zIndex: 35,
                    transform: `scale(${enterPaper}) rotate(-3deg)`,
                  }}
                >
                  <HalftoneCutout
                    src="images/big_bang_pigeons/robert_dicke_portrait.jpg"
                    height={300}
                    rotation={0}
                    sliceBand={false}
                    paperclipPosition="left"
                  />
                  <div style={{ position: "absolute", bottom: -10, left: 16 }}>
                    <DymoLabel text="ROBERT DICKE // PRINCETON" size="sm" bgColor="#141414" />
                  </div>

                  {/* Tactile Spring-Animated Speech Bubble floating above Dicke's head */}
                  <PaperSpeechBubble
                    text="“Boys, we have been scooped.”"
                    speaker="Robert Dicke · Princeton"
                    startFrame={170}
                    pointerDirection="bottom-left"
                    x={60}
                    y={-120}
                    width={380}
                    fontSize={24}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* LAYOUT 2: MACRO DOCUMENT INSPECTION (Beats 2, 9, 13, 14, 17, 22) */}
      {scene.portalType === "macro_document" && (() => {
        // Individual Staggered Audio-Synchronized Entry Timings
        const heroEntry =
          scene.id === 2 ? 45 : scene.id === 9 ? 75 : scene.id === 13 ? 40 : scene.id === 14 ? 15 : scene.id === 17 ? 65 : 15;
        const enterHero = getStagger(heroEntry, 13, 220);

        const dioramaEntry = scene.id === 2 ? 165 : scene.id === 22 ? 70 : 0;
        const enterDiorama = getStagger(dioramaEntry, 12, 240);

        const hoverDoc = getHover(20, 4, 0.6);
        const hoverDiorama = getHover(70, 5, 1.2);

        // Alternating directional flow to prevent PowerPoint monotony
        const isMediaLeft = !MEDIA_RIGHT_BEATS.has(scene.id);

        return (
          <div
            style={{
              position: "absolute",
              inset: "80px 64px 50px 64px",
              display: "flex",
              flexDirection: isMediaLeft ? "row" : "row-reverse",
              alignItems: "center",
              gap: 48,
            }}
          >
            {/* Media Column: Snug Subject-Conforming Scissored Border with Zero Blank Margins */}
            <div
              style={{
                flex: "1 1 65%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transform: `scale(${enterHero}) translateY(${hoverDoc.y}px) rotate(${(isMediaLeft ? -1.5 : 1.5) + hoverDoc.r}deg)`,
                opacity: rawFrame >= heroEntry ? 1 : 0,
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-flex",
                  width: "fit-content",
                  maxWidth: "96%",
                  backgroundColor: "#FFFFFF",
                  padding: 13,
                  boxShadow: "0 24px 50px rgba(0,0,0,0.35)",
                  clipPath:
                    "polygon(1% 0.5%, 28% 0%, 65% 1%, 99% 0%, 100% 25%, 99.2% 70%, 100% 99%, 75% 100%, 30% 99%, 0% 99.5%, 0.8% 60%, 0% 20%)",
                }}
              >
                {scene.image && (
                  <Img
                    src={staticFile(scene.image)}
                    style={{
                      maxHeight: 510,
                      maxWidth: 720,
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                      filter: scene.id === 22 ? "contrast(1.15)" : "grayscale(100%) contrast(1.3)",
                    }}
                  />
                )}
                {/* Ben-Day Halftone Dot Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 13,
                    backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.25) 1.2px, transparent 1.3px)",
                    backgroundSize: "4px 4px",
                    pointerEvents: "none",
                  }}
                />

                {/* Scotch Tape Snapping Down After Document Lands */}
                {rawFrame >= heroEntry + 8 && <ScotchTape top={-14} right={20} rotation={6} />}
                {rawFrame >= heroEntry + 12 && (
                  <div style={{ position: "absolute", bottom: -14, left: 30 }}>
                    <DymoLabel
                      text={
                        scene.id === 2
                          ? "18-TON HOLMDEL HORN ANTENNA"
                          : scene.id === 9
                          ? "ANTENNA WAVEGUIDE THROAT"
                          : scene.id === 14
                          ? "PRINCETON THEORETICAL PREDICTION"
                          : scene.id === 17
                          ? "HISTORIC LANDMARK RESTORATION"
                          : scene.id === 22
                          ? "COBE DMR PRIMORDIAL SEEDS"
                          : "PRIMARY ARCHIVAL EVIDENCE"
                      }
                      size="sm"
                      bgColor="#DE3831"
                    />
                  </div>
                )}

                {/* Beat 2: 3D NASA Echo Satellite Mylar Balloon Pop-up (Enters at frame 165 when 'NASA balloons' spoken) */}
                {scene.id === 2 && rawFrame >= 165 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -45,
                      right: -45,
                      width: 300,
                      height: 300,
                      zIndex: 35,
                      transform: `scale(${enterDiorama}) translateY(${hoverDiorama.y}px)`,
                    }}
                  >
                    <ThreeCanvasWrapper width={300} height={300} cameraPosition={[0, 0, 4.4]} fov={34}>
                      <EchoSatellite3D scale={0.88} />
                    </ThreeCanvasWrapper>
                    <ScotchTape top={-8} right={20} rotation={-6} />
                    <div style={{ position: "absolute", bottom: -6, left: 20 }}>
                      <DymoLabel text="3D NASA MYLAR BALLOON" size="sm" bgColor="#191919" />
                    </div>
                  </div>
                )}

                {/* Beat 22: 3D Cosmic Expansion Relic Sphere Pop-up (Enters at frame 70 when 'primordial seeds' spoken) */}
                {scene.id === 22 && rawFrame >= 70 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -45,
                      right: -45,
                      width: 320,
                      height: 320,
                      zIndex: 35,
                      transform: `scale(${enterDiorama}) translateY(${hoverDiorama.y}px)`,
                    }}
                  >
                    <ThreeCanvasWrapper width={320} height={320} cameraPosition={[0, 0, 4.5]} fov={35}>
                      <CosmicExpansion3D scale={0.9} />
                    </ThreeCanvasWrapper>
                    <ScotchTape top={-8} right={20} rotation={-6} />
                    <div style={{ position: "absolute", bottom: -6, left: 20 }}>
                      <DymoLabel text="3D COSMIC RECOMBINATION" size="sm" bgColor="#DE3831" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Focused Memo Note */}
            <div
              style={{
                flex: "1 1 35%",
                backgroundColor: "#FAF7EE",
                padding: "26px",
                borderTop: "8px solid #DE3831",
                boxShadow: "0 16px 36px rgba(0,0,0,0.2)",
                transform: `scale(${enterText})`,
              }}
            >
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: "#DE3831", fontWeight: 700, marginBottom: 12 }}>
                BEAT {String(scene.id).padStart(2, "0")} · DOCUMENT RECORD
              </div>
              <div style={{ fontFamily: '"Caslon Antique", serif', fontSize: 36, fontWeight: 700, lineHeight: 1.15, marginBottom: 18 }}>
                {scene.headline}
              </div>
              <div style={{ backgroundColor: "#EFECE3", padding: "16px", borderLeft: "4px solid #DE3831" }}>
                {renderWordFlow(20, 110)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* LAYOUT 3: SUSPECT ELIMINATION GRID (Beat 7: NYC vs Radar vs Starfish Prime) */}
      {scene.portalType === "suspect_grid" && (() => {
        // Individual Audio-Synchronized Staggered Entrances & Ruled Out Stamps
        const suspects = [
          {
            title: "SUSPECT 1: NYC SKYLINE",
            img: "images/big_bang_pigeons/nyc_skyline_1960s.jpg",
            rot: -3,
            entryFrame: 15,   // narrator says 'New York City' at frame 25
            stampFrame: 55,
            seed: 10,
          },
          {
            title: "SUSPECT 2: MILITARY RADAR",
            img: "images/big_bang_pigeons/cold_war_radar_dish.jpg",
            rot: 1.5,
            entryFrame: 75,   // narrator says 'military coastal radars' at frame 91
            stampFrame: 115,
            seed: 35,
          },
          {
            title: "SUSPECT 3: STARFISH PRIME",
            img: "images/big_bang_pigeons/starfish_prime_aurora_honolulu.jpg",
            rot: -2,
            entryFrame: 120,  // narrator says 'Starfish Prime' at frame 121
            stampFrame: 175,
            seed: 60,
          },
        ];

        return (
          <div
            style={{
              position: "absolute",
              inset: "80px 64px 50px 64px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transform: `scale(${enterPaper})`,
            }}
          >
            {/* Header Tag */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 16, color: "#DE3831", fontWeight: 700, letterSpacing: 3 }}>
                CHAPTER II // SYSTEMATIC SUSPECT ELIMINATION
              </div>
              <div style={{ fontFamily: '"Caslon Antique", serif', fontSize: 44, fontWeight: 900 }}>
                {scene.headline}
              </div>
            </div>

            {/* 3 Polaroids in a Row with Independent Animated Staggered Entries & Hover */}
            <div style={{ display: "flex", justifyContent: "center", gap: 36, marginBottom: 24 }}>
              {suspects.map((suspect, sIdx) => {
                const isEntered = rawFrame >= suspect.entryFrame;
                const enterS = getStagger(suspect.entryFrame, 12, 230);
                const hasStamp = rawFrame >= suspect.stampFrame;
                const stampS = getStagger(suspect.stampFrame, 10, 270);
                const h = getHover(suspect.seed, 4, 0.7);

                return (
                  <div
                    key={sIdx}
                    style={{
                      width: 380,
                      backgroundColor: "#FFFFFF",
                      padding: "14px 14px 28px 14px",
                      boxShadow: "0 18px 36px rgba(0,0,0,0.32)",
                      transform: `scale(${enterS}) translateY(${h.y}px) rotate(${suspect.rot + h.r}deg)`,
                      transformOrigin: "center center",
                      position: "relative",
                      opacity: isEntered ? 1 : 0,
                    }}
                  >
                    <Img
                      src={staticFile(suspect.img)}
                      style={{
                        width: "100%",
                        height: 210,
                        objectFit: "cover",
                        filter: "grayscale(100%) contrast(1.3)",
                      }}
                    />
                    <div
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 13,
                        fontWeight: 700,
                        marginTop: 12,
                        textAlign: "center",
                        letterSpacing: 1.5,
                      }}
                    >
                      {suspect.title}
                    </div>

                    {/* Red Elimination 'RULED OUT' Rubber Stamp */}
                    {hasStamp && (
                      <div
                        style={{
                          position: "absolute",
                          top: "38%",
                          left: "50%",
                          transform: `translate(-50%, -50%) scale(${stampS}) rotate(-12deg)`,
                          border: "5px solid #DE3831",
                          borderRadius: 4,
                          padding: "6px 18px",
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          color: "#DE3831",
                          fontFamily: "'Courier Prime', monospace",
                          fontSize: 34,
                          fontWeight: 900,
                          letterSpacing: 4,
                          boxShadow: "0 6px 16px rgba(222, 56, 49, 0.45)",
                          pointerEvents: "none",
                          whiteSpace: "nowrap",
                          zIndex: 20,
                        }}
                      >
                        RULED OUT
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Thermal Receipt Narration at Bottom */}
            <div style={{ backgroundColor: "#FAF7EE", padding: "16px 24px", borderLeft: "6px solid #DE3831", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
              {renderWordFlow(21, 60)}
            </div>
          </div>
        );
      })()}

      {/* LAYOUT 4: HARDWARE PORTAL SPOTLIGHT (Beats 4, 5, 8, 12, 21, 23) */}
      {scene.portalType === "hardware_portal" && (() => {
        const portalEntry = 10;
        const enterPortal = getStagger(portalEntry, 13, 220);
        const hPortal = getHover(40, 3, 0.5);
        const isMediaLeft = !MEDIA_RIGHT_BEATS.has(scene.id);

        return (
          <div
            style={{
              position: "absolute",
              inset: "80px 64px 50px 64px",
              display: "flex",
              flexDirection: isMediaLeft ? "row" : "row-reverse",
              alignItems: "center",
              gap: 52,
            }}
          >
            {/* Left: Fullscreen Hardware Portal with Animated Micro-Motion & Hover */}
            <div
              style={{
                flex: "1 1 58%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transform: `scale(${enterPortal}) translateY(${hPortal.y}px)`,
              }}
            >
              {scene.id === 4 ? (
                /* Beat 4: Dedicated Oscilloscope Portal */
                <div style={{ position: "relative" }}>
                  <OscilloscopePortal width={820} height={500} />
                  <ScotchTape top={-12} left={40} rotation={-5} />
                  <div style={{ position: "absolute", bottom: 20, right: 30 }}>
                    <DymoLabel text="4,080 MHz // RF TELEMETRY" size="sm" bgColor="#191919" />
                  </div>
                </div>
              ) : scene.id === 8 ? (
                /* Beat 8: Dedicated Oscilloscope Portal */
                <div style={{ position: "relative" }}>
                  <OscilloscopePortal width={820} height={500} />
                  <ScotchTape top={-12} left={40} rotation={-5} />
                  <div style={{ position: "absolute", bottom: 20, right: 30 }}>
                    <DymoLabel text="360° AZIMUTH SCAN // ISOTROPIC" size="sm" bgColor="#191919" />
                  </div>
                </div>
              ) : scene.id === 5 ? (
                <div style={{ position: "relative" }}>
                  <OffthreadVideo
                    src={staticFile("videos/manim_antenna_telemetry.mp4")}
                    style={{
                      width: 820,
                      height: 500,
                      objectFit: "contain",
                      borderRadius: 8,
                      boxShadow: "0 20px 45px rgba(0,0,0,0.5)",
                      border: "3px solid #1C2B35",
                    }}
                  />
                  <ScotchTape top={-12} left={30} rotation={-6} />
                  <ScotchTape top={-12} right={30} rotation={4} />
                  <div style={{ position: "absolute", bottom: 20, left: 30 }}>
                    <DymoLabel text="MANIM TELEMETRY // ΔT = +3.5K ANOMALY" size="sm" bgColor="#8A1818" />
                  </div>
                </div>
              ) : scene.id === 12 ? (
                <div style={{ position: "relative" }}>
                  <StripChartRecorder width={820} height={500} />
                  {/* Pigeon cutout appears ONLY on Beat 12 AFTER eviction at frame 35 */}
                  {rawFrame >= 35 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -60,
                        right: 40,
                        width: 230,
                        zIndex: 25,
                        transform: `scale(${getStagger(35, 11, 250)}) translateY(${getHover(50, 4, 1.0).y}px)`,
                      }}
                    >
                      <HalftoneCutout src="images/big_bang_pigeons/pigeon_cutout.jpg" height={165} sliceBand={false} />
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%) rotate(-10deg)",
                          border: "3px solid #DE3831",
                          padding: "2px 8px",
                          backgroundColor: "#FFFFFF",
                          color: "#DE3831",
                          fontFamily: "'Courier Prime', monospace",
                          fontSize: 14,
                          fontWeight: 900,
                        }}
                      >
                        EVICTED
                      </div>
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 20, left: 30 }}>
                    <DymoLabel text="3.5K RESIDUAL TEMPERATURE" size="sm" bgColor="#8A1818" />
                  </div>
                </div>
              ) : scene.id === 21 ? (
                /* Beat 21: COBE Spacecraft + WMAP Satellite */
                <div style={{ position: "relative", width: 820, height: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    style={{
                      width: "88%",
                      backgroundColor: "#0A0D12",
                      padding: 14,
                      boxShadow: "0 24px 50px rgba(0,0,0,0.6)",
                      transform: `scale(${getStagger(25, 12, 230)}) translateY(${getHover(15, 3, 0.4).y}px)`,
                    }}
                  >
                    <Img
                      src={staticFile("images/big_bang_pigeons/cobe_spacecraft_mission.jpg")}
                      style={{ width: "100%", maxHeight: 440, objectFit: "contain", display: "block" }}
                    />
                    <ScotchTape top={-12} left={-14} rotation={-12} />
                    <div style={{ position: "absolute", bottom: -14, left: 30 }}>
                      <DymoLabel text="NASA COBE SATELLITE (1989)" size="sm" bgColor="#191919" />
                    </div>
                  </div>

                  {/* WMAP Spacecraft Model Cutout drops in at frame 45 */}
                  {rawFrame >= 45 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -25,
                        right: -15,
                        width: 250,
                        zIndex: 35,
                        transform: `scale(${getStagger(45, 11, 250)}) translateY(${getHover(65, 4, 1.0).y}px)`,
                      }}
                    >
                      <Img
                        src={staticFile("images/big_bang_pigeons/wmap_spacecraft_model.png")}
                        style={{ width: "100%", objectFit: "contain", filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.6))" }}
                      />
                      <ScotchTape top={-8} right={20} rotation={-6} />
                      <div style={{ position: "absolute", bottom: -6, left: 20 }}>
                        <DymoLabel text="WMAP SPACECRAFT" size="sm" bgColor="#DE3831" />
                      </div>
                    </div>
                  )}
                </div>
              ) : scene.id === 23 ? (
                <div style={{ position: "relative" }}>
                  <CRTTelevisionPortal width={800} height={510} />
                  <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
                    <DymoLabel text="1% COSMIC MICROWAVE BACKGROUND" size="sm" bgColor="#191919" />
                  </div>
                </div>
              ) : (
                <div style={{ position: "relative", width: 800, backgroundColor: "#0A0D12", padding: 14, boxShadow: "0 24px 50px rgba(0,0,0,0.6)" }}>
                  <Img src={staticFile(scene.image || "images/big_bang_pigeons/planck_cmb_allsky_map.jpg")} style={{ width: "100%", maxHeight: 460, objectFit: "contain", display: "block" }} />
                  <ScotchTape top={-12} left={-14} rotation={-12} />
                  <div style={{ position: "absolute", bottom: -14, right: 30 }}>
                    <DymoLabel text="RELIC RADIATION // 380,000 YRS" size="sm" bgColor="#DE3831" />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Technical Telemetry Receipt */}
            <div
              style={{
                flex: "1 1 42%",
                backgroundColor: isDark ? "#16202A" : "#FAF7EE",
                padding: "26px 30px",
                boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
                borderTop: "8px solid #DE3831",
                transform: `scale(${enterText})`,
              }}
            >
              <ScotchTape top={-16} left="40%" rotation={2} />
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 15, color: "#DE3831", fontWeight: 700, marginBottom: 12 }}>
                BEAT {String(scene.id).padStart(2, "0")} · INSTRUMENT SIGNAL
              </div>
              <div style={{ fontFamily: '"Caslon Antique", serif', fontSize: 40, fontWeight: 700, lineHeight: 1.15, color: isDark ? "#FFF" : "#141414", marginBottom: 20 }}>
                {scene.headline}
              </div>
              <div style={{ backgroundColor: isDark ? "#0D141C" : "#EFECE3", padding: "18px", borderLeft: "5px solid #DE3831" }}>
                {renderWordFlow(21, 110, isDark)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* LAYOUT 5: SPLIT MEMO (Beats 3, 10, 11, 15, 18, 20) */}
      {scene.portalType === "split_memo" && (() => {
        // Individual Audio-Synchronized Staggered Entrances
        const heroEntry =
          scene.id === 3 ? 25 : scene.id === 10 ? 68 : scene.id === 11 ? 20 : scene.id === 15 ? 15 : scene.id === 18 ? 20 : 25;
        const enterHero = getStagger(heroEntry, 12, 230);
        const hCutout = getHover(30, 4, 0.7);
        const isMediaLeft = !MEDIA_RIGHT_BEATS.has(scene.id);

        return (
          <div
            style={{
              position: "absolute",
              inset: "80px 64px 50px 64px",
              display: "flex",
              flexDirection: isMediaLeft ? "row" : "row-reverse",
              alignItems: "center",
              gap: 52,
            }}
          >
            {/* Left: Scissored B&W Halftone Cutout on Graph Paper with Dynamic Stagger & Hover */}
            <div
              style={{
                flex: "1 1 54%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Base Graph Paper */}
              <div
                style={{
                  position: "absolute",
                  width: "90%",
                  height: "86%",
                  backgroundColor: "#EBE6DA",
                  border: "1px solid rgba(0,0,0,0.12)",
                  boxShadow: "0 18px 36px rgba(0,0,0,0.24)",
                  transform: `scale(${enterPaper}) rotate(-2deg)`,
                  padding: "20px",
                  backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
                  `,
                  backgroundSize: "24px 24px",
                }}
              >
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, color: "#8E8474" }}>
                  MEMORANDUM FOR FILE · BELL TELEPHONE LABORATORIES
                </div>
              </div>

              {/* Halftone Cutout Entering at Audio-Synchronized Frame */}
              <div
                style={{
                  position: "relative",
                  width: 720,
                  zIndex: 10,
                  transform: `scale(${enterHero}) translateY(${hCutout.y}px) rotate(${(scene.id % 2 === 0 ? 1.5 : -1.5) + hCutout.r}deg)`,
                  opacity: rawFrame >= heroEntry ? 1 : 0,
                }}
              >
                <HalftoneCutout
                  src={scene.image || "images/big_bang_pigeons/penzias_wilson_horn_antenna.jpg"}
                  height={430}
                  rotation={0}
                  sliceBand={false}
                  paperclipPosition="left"
                />

                {rawFrame >= heroEntry + 8 && <ScotchTape top={-14} right={30} rotation={6} />}
                {rawFrame >= heroEntry + 14 && (
                  <div style={{ position: "absolute", bottom: -14, right: 30 }}>
                    <DymoLabel
                      text={
                        scene.id === 3
                          ? "PENZIAS & WILSON // 1964"
                          : scene.id === 10
                          ? "HORN THROAT PIGEON INVASION"
                          : scene.id === 11
                          ? "HOMING PIGEON EXPERIMENT"
                          : scene.id === 15
                          ? "ROBERT DICKE // PRINCETON"
                          : scene.id === 18
                          ? "BELL LABS CRAWFORD HILL"
                          : scene.id === 20
                          ? "1978 NOBEL CEREMONY"
                          : "HISTORICAL EVIDENCE // 1964"
                      }
                      size="sm"
                      bgColor="#DE3831"
                    />
                  </div>
                )}

                {/* Beat 10: Speech Bubble on Pigeon Cutout for Dielectric Material Quote */}
                {scene.id === 10 && (
                  <PaperSpeechBubble
                    text="“A white dielectric material...”"
                    speaker="Penzias & Wilson · 1965"
                    startFrame={170}
                    pointerDirection="bottom-left"
                    x={210}
                    y={-60}
                    width={380}
                    fontSize={22}
                  />
                )}

                {/* Beat 15: David Todd Wilkinson (Dicke's Princeton Radiometer Team) */}
                {scene.id === 15 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -30,
                      right: -60,
                      zIndex: 15,
                      transform: `scale(${getStagger(heroEntry + 10, 12, 220)}) rotate(4deg)`,
                      opacity: rawFrame >= heroEntry + 10 ? 1 : 0,
                    }}
                  >
                    <HalftoneCutout
                      src="images/big_bang_pigeons/david_todd_wilkinson.jpg"
                      height={320}
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

            {/* Right: Thermal Receipt */}
            <div
              style={{
                flex: "1 1 46%",
                backgroundColor: "#FAF7EE",
                padding: "26px 30px",
                borderTop: "8px solid #DE3831",
                boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
                transform: `scale(${enterText})`,
              }}
            >
              <ScotchTape top={-16} left="38%" rotation={2} />
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 15, color: "#DE3831", fontWeight: 700, marginBottom: 12 }}>
                BEAT {String(scene.id).padStart(2, "0")} · ARCHIVAL REPORT
              </div>
              <div style={{ fontFamily: '"Caslon Antique", serif', fontSize: 44, fontWeight: 700, lineHeight: 1.12, marginBottom: 20 }}>
                {scene.headline}
              </div>
              <div style={{ backgroundColor: "#EFECE3", padding: "18px 22px", borderLeft: "5px solid #DE3831" }}>
                {renderWordFlow(21, 120)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────────
          BOTTOM STATUS REGISTER BAR
          ────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Courier Prime', monospace",
          fontSize: 13,
          letterSpacing: 2,
          color: isDark ? "#6C808E" : "#80786C",
          borderTop: isDark ? "1px solid #1C2B35" : "1px solid #DFD8CB",
          paddingTop: 6,
          zIndex: 15,
        }}
      >
        <span>LAT: 40°23′30″ N · LON: 74°11′10″ W (CRAWFORD HILL, NJ)</span>
        <span>EXCESS NOISE: 3.5K ± 1.0K // UNEXPLAINED RESIDUAL</span>
        <span>FRAME: {rawFrame} / {scene.frames}</span>
      </div>
    </AbsoluteFill>
  );
};

export const RetroDigitalEphemeraLandscapeVideo: React.FC<{
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
          <RetroDigitalScene scene={scene} />
          {scene.audio_file && (
            <Audio src={staticFile(scene.audio_file)} />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const RetroDigitalEphemeraLandscape = RetroDigitalEphemeraLandscapeVideo;

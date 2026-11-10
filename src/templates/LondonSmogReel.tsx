import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const LondonSmogReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const time = frame / fps;

  // -------------------------------------------------------------------------
  // BEAT TIMINGS (Synchronized to Edge-TTS Manifest)
  // -------------------------------------------------------------------------
  // Beat 1: frame 0 to 284 (0.0s - 9.46s)
  // Beat 2: frame 284 to 555 (9.46s - 18.48s)
  // Beat 3: frame 555 to 884 (18.48s - 29.45s)
  // Beat 4: frame 884 to 1225 (29.45s - 40.83s)
  // Beat 5: frame 1225 to 1514 (40.83s - 50.48s)
  // Beat 6: frame 1514 to 1744 (50.48s - 58.15s)
  const currentBeat = useMemo(() => {
    if (frame < 284) return 1;
    if (frame < 555) return 2;
    if (frame < 884) return 3;
    if (frame < 1225) return 4;
    if (frame < 1514) return 5;
    return 6;
  }, [frame]);

  // Subtle floating micro-motion
  const floatY = Math.sin(frame * 0.07) * 4;
  const floatRot = Math.cos(frame * 0.05) * 0.7;

  // Background pea-soup atmospheric oscillation
  const fogDriftX = Math.sin(frame * 0.03) * 35;
  const fogOpacity = 0.35 + 0.15 * Math.sin(frame * 0.04);

  // Asset paths
  const imgDir = "projects/The_Deadly_London_Acid_Fog_1952_2026-11-10/images";
  const audioMaster = "projects/The_Deadly_London_Acid_Fog_1952_2026-11-10/audio/vo_master.mp3";

  return (
    <AbsoluteFill style={{ backgroundColor: "#141414", overflow: "hidden", fontFamily: "sans-serif" }}>
      {/* 1. MASTER AUDIO TRACK */}
      <Audio src={staticFile(audioMaster)} />

      {/* 2. BASE SURFACE: Vintage Soot Deckle Cardstock & Atmospheric Haze */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 40%, #EAE0C8 0%, #BAAE96 55%, #2B251E 100%)",
        }}
      />

      {/* Atmospheric Fog Particles & Living Soot Grain */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${540 + fogDriftX}px 800px, rgba(242, 183, 5, 0.28) 0%, rgba(30, 26, 20, 0.72) 75%)`,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Heavy 1952 Pea-Soup Fog Shroud */}
      <div
        style={{
          position: "absolute",
          inset: -100,
          background: "radial-gradient(ellipse at 50% 30%, rgba(212, 180, 110, 0.45) 0%, rgba(18, 16, 12, 0.85) 85%)",
          opacity: currentBeat === 6 ? interpolate(frame - 1514, [0, 45], [0.85, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : fogOpacity,
          pointerEvents: "none",
          transform: `translateX(${fogDriftX}px)`,
        }}
      />

      {/* Technical Grid Overlay (1px Fine Coordinates) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* =====================================================================
          SCENE 1: THE INVISIBLE CINEMA (Frames 0 - 284 | 9.46s)
          ===================================================================== */}
      {currentBeat === 1 && (
        <AbsoluteFill style={{ transform: `translateY(${floatY}px) rotate(${floatRot}deg)` }}>
          {/* Headline Block (Safe Zone y: 280–480) */}
          <div style={{ position: "absolute", top: 290, left: 70, right: 150, zIndex: 10 }}>
            <div
              style={{
                fontFamily: "Courier, monospace",
                fontSize: 24,
                letterSpacing: 4,
                color: "#141414",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              LONDON · DECEMBER 1952
            </div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 66,
                lineHeight: 1.05,
                color: "#141414",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              THE <span style={{ backgroundColor: "#F2B705", padding: "0 8px", borderRadius: 4 }}>INVISIBLE</span> CINEMA
            </h1>
          </div>

          {/* Hero Archival Photograph: Nelson's Column Shrouded in Fog */}
          <div
            style={{
              position: "absolute",
              top: 550,
              left: 90,
              width: 900,
              height: 940,
              border: "12px solid #FFFFFF",
              borderRadius: 6,
              boxShadow: "0 22px 48px rgba(0,0,0,0.65)",
              overflow: "hidden",
              backgroundColor: "#222",
              transform: `scale(${interpolate(frame, [0, 284], [1.0, 1.08], { extrapolateRight: "clamp" })})`,
            }}
          >
            <Img
              src={staticFile(`${imgDir}/nelson_smog_1952.jpg`)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(100%) contrast(120%)",
              }}
            />
            {/* Glowing gas lantern halo overlay */}
            <div
              style={{
                position: "absolute",
                top: "40%",
                left: "48%",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(242,183,5,0.75) 0%, transparent 70%)",
                filter: "blur(20px)",
                mixBlendMode: "screen",
              }}
            />
          </div>

          {/* In-World Paper Tag */}
          <div
            style={{
              position: "absolute",
              bottom: 370,
              left: 110,
              padding: "10px 18px",
              backgroundColor: "#141414",
              color: "#FFFFFF",
              fontFamily: "Courier, monospace",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
              transform: "rotate(-2deg)",
              zIndex: 15,
            }}
          >
            VISIBILITY: &lt; 12 INCHES
          </div>
        </AbsoluteFill>
      )}

      {/* =====================================================================
          SCENE 2: 4,000 CITIZENS DEAD (Frames 284 - 555 | 9.02s)
          ===================================================================== */}
      {currentBeat === 2 && (
        <AbsoluteFill style={{ transform: `translateY(${floatY}px) rotate(${-floatRot}deg)` }}>
          {/* Headline Block */}
          <div style={{ position: "absolute", top: 290, left: 70, right: 150, zIndex: 10 }}>
            <div
              style={{
                fontFamily: "Courier, monospace",
                fontSize: 24,
                letterSpacing: 4,
                color: "#141414",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              FATALITY SURGE · 120 HOURS
            </div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 66,
                lineHeight: 1.05,
                color: "#141414",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              4,000 CITIZENS <span style={{ backgroundColor: "#D62828", color: "#FFF", padding: "0 8px", borderRadius: 4 }}>DEAD</span>
            </h1>
          </div>

          {/* Archival Photo: Policeman Guiding People Near Big Ben */}
          <div
            style={{
              position: "absolute",
              top: 550,
              left: 90,
              width: 900,
              height: 940,
              border: "12px solid #FFFFFF",
              borderRadius: 6,
              boxShadow: "0 22px 48px rgba(0,0,0,0.65)",
              overflow: "hidden",
              transform: `scale(${interpolate(frame, [284, 555], [1.02, 1.1], { extrapolateRight: "clamp" })})`,
            }}
          >
            <Img
              src={staticFile(`${imgDir}/big_ben_smog_1952.jpg`)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(100%) contrast(125%)",
              }}
            />
          </div>

          {/* Red Ink Stamp: CAUSE: DOMESTIC FIREPLACES */}
          <div
            style={{
              position: "absolute",
              bottom: 370,
              right: 120,
              border: "4px solid #D62828",
              color: "#D62828",
              backgroundColor: "rgba(255,255,255,0.92)",
              padding: "12px 24px",
              fontFamily: "Impact, sans-serif",
              fontSize: 32,
              letterSpacing: 3,
              textTransform: "uppercase",
              transform: "rotate(3deg)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
              zIndex: 20,
            }}
          >
            SOURCE: HOME FIREPLACES
          </div>
        </AbsoluteFill>
      )}

      {/* =====================================================================
          SCENE 3: THE THERMAL CEILING (Frames 555 - 884 | 10.97s)
          ===================================================================== */}
      {currentBeat === 3 && (
        <AbsoluteFill style={{ transform: `translateY(${floatY}px) rotate(${floatRot}deg)` }}>
          {/* Headline Block */}
          <div style={{ position: "absolute", top: 290, left: 70, right: 150, zIndex: 10 }}>
            <div
              style={{
                fontFamily: "Courier, monospace",
                fontSize: 24,
                letterSpacing: 4,
                color: "#141414",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              METEOROLOGICAL INVERSION
            </div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 66,
                lineHeight: 1.05,
                color: "#141414",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              THE <span style={{ backgroundColor: "#F2B705", padding: "0 8px", borderRadius: 4 }}>THERMAL CEILING</span>
            </h1>
          </div>

          {/* Archival Photo: Battersea Power Station Chimneys */}
          <div
            style={{
              position: "absolute",
              top: 550,
              left: 90,
              width: 900,
              height: 940,
              border: "12px solid #FFFFFF",
              borderRadius: 6,
              boxShadow: "0 22px 48px rgba(0,0,0,0.65)",
              overflow: "hidden",
            }}
          >
            <Img
              src={staticFile(`${imgDir}/battersea_power_1950.jpg`)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(100%) contrast(125%)",
              }}
            />

            {/* Inversion Lid Visualization */}
            <div
              style={{
                position: "absolute",
                top: "32%",
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: "#D62828",
                boxShadow: "0 0 16px #D62828",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "24%",
                right: 20,
                backgroundColor: "rgba(214, 40, 40, 0.9)",
                color: "#FFFFFF",
                padding: "6px 14px",
                fontFamily: "Courier, monospace",
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 4,
              }}
            >
              INVERSION LID: 150m ALTITUDE
            </div>
          </div>

          {/* Technical Data Badge */}
          <div
            style={{
              position: "absolute",
              bottom: 370,
              left: 110,
              backgroundColor: "#141414",
              color: "#FFFFFF",
              padding: "10px 18px",
              fontFamily: "Courier, monospace",
              fontSize: 22,
              fontWeight: 700,
              transform: "rotate(-1.5deg)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
            }}
          >
            SMOKE TRAPPED: 1,000 TONS/DAY
          </div>
        </AbsoluteFill>
      )}

      {/* =====================================================================
          SCENE 4: DROPLETS OF ACID (Frames 884 - 1225 | 11.38s)
          ===================================================================== */}
      {currentBeat === 4 && (
        <AbsoluteFill style={{ transform: `translateY(${floatY}px) rotate(${-floatRot}deg)` }}>
          {/* Headline Block */}
          <div style={{ position: "absolute", top: 290, left: 70, right: 150, zIndex: 10 }}>
            <div
              style={{
                fontFamily: "Courier, monospace",
                fontSize: 24,
                letterSpacing: 4,
                color: "#141414",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              CHEMICAL CATALYSIS
            </div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 66,
                lineHeight: 1.05,
                color: "#141414",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              DROPLETS TURNED TO <span style={{ backgroundColor: "#D62828", color: "#FFF", padding: "0 8px", borderRadius: 4 }}>ACID</span>
            </h1>
          </div>

          {/* Archival Photo: 1950 London RT Double Decker Bus */}
          <div
            style={{
              position: "absolute",
              top: 550,
              left: 90,
              width: 900,
              height: 940,
              border: "12px solid #FFFFFF",
              borderRadius: 6,
              boxShadow: "0 22px 48px rgba(0,0,0,0.65)",
              overflow: "hidden",
            }}
          >
            <Img
              src={staticFile(`${imgDir}/london_bus_1950.jpg`)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(100%) contrast(120%)",
              }}
            />

            {/* Microscopic Chemical Formula Badge */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: 30,
                right: 30,
                backgroundColor: "rgba(20, 20, 20, 0.94)",
                border: "2px solid #F2B705",
                borderRadius: 6,
                padding: "16px 20px",
                color: "#FFFFFF",
                fontFamily: "Courier, monospace",
                fontSize: 24,
                textAlign: "center",
                boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ color: "#F2B705", fontWeight: 700, marginBottom: 4 }}>FOG DROPLET REACTION:</div>
              <div>SO₂ + H₂O + NO₂ → <span style={{ color: "#FF4D4D", fontWeight: 700 }}>H₂SO₄ (SULFURIC ACID)</span></div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =====================================================================
          SCENE 5: FORENSIC CLIMAX - WILKINS MORTALITY (Frames 1225 - 1514 | 9.65s)
          ===================================================================== */}
      {currentBeat === 5 && (
        <AbsoluteFill
          style={{
            transform: `translateY(${floatY}px) scale(${interpolate(frame, [1225, 1514], [1.0, 1.15], { extrapolateRight: "clamp" })})`,
          }}
        >
          {/* Headline Block */}
          <div style={{ position: "absolute", top: 290, left: 70, right: 150, zIndex: 10 }}>
            <div
              style={{
                fontFamily: "Courier, monospace",
                fontSize: 24,
                letterSpacing: 4,
                color: "#141414",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              FORENSIC SMOKING GUN · 1953
            </div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 66,
                lineHeight: 1.05,
                color: "#141414",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              MORTALITY <span style={{ backgroundColor: "#D62828", color: "#FFF", padding: "0 8px", borderRadius: 4 }}>QUADRUPLED</span>
            </h1>
          </div>

          {/* Hero Forensic Evidence: Wilkins Mortality & SO2 Graph */}
          <div
            style={{
              position: "absolute",
              top: 540,
              left: 70,
              width: 940,
              height: 960,
              border: "12px solid #FFFFFF",
              borderRadius: 6,
              boxShadow: "0 24px 54px rgba(0,0,0,0.7)",
              backgroundColor: "#FFF",
              overflow: "hidden",
            }}
          >
            <Img
              src={staticFile(`${imgDir}/wilkins_mortality_chart_1952.png`)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />

            {/* Hand-Drawn Forensic Grease-Pencil Circle Targeting Week 49 Spike */}
            <svg
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
              }}
              viewBox="0 0 940 960"
            >
              <ellipse
                cx="510"
                cy="440"
                rx="180"
                ry="120"
                fill="none"
                stroke="#D62828"
                strokeWidth="6"
                strokeDasharray="16 10"
                transform="rotate(-8 510 440)"
                opacity={interpolate(frame - 1225, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              />
            </svg>

            {/* Official Report Callout Slip */}
            <div
              style={{
                position: "absolute",
                top: 30,
                right: 30,
                backgroundColor: "#F2B705",
                color: "#141414",
                padding: "8px 18px",
                fontFamily: "Courier, monospace",
                fontSize: 20,
                fontWeight: 700,
                transform: "rotate(2deg)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
              }}
            >
              UK GOV REPORT (1953)
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =====================================================================
          SCENE 6: RESOLUTION - CLEAN AIR ACT 1956 (Frames 1514 - 1744 | 7.68s)
          ===================================================================== */}
      {currentBeat === 6 && (
        <AbsoluteFill style={{ transform: `translateY(${floatY}px) rotate(${floatRot}deg)` }}>
          {/* Headline Block */}
          <div style={{ position: "absolute", top: 290, left: 70, right: 150, zIndex: 10 }}>
            <div
              style={{
                fontFamily: "Courier, monospace",
                fontSize: 24,
                letterSpacing: 4,
                color: "#141414",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              PARLIAMENTARY RESOLUTION
            </div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 66,
                lineHeight: 1.05,
                color: "#141414",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              THE <span style={{ backgroundColor: "#2A9D8F", color: "#FFF", padding: "0 8px", borderRadius: 4 }}>CLEAN AIR ACT</span>
            </h1>
          </div>

          {/* Legislative Card: Clean Air Act 1956 */}
          <div
            style={{
              position: "absolute",
              top: 550,
              left: 90,
              width: 900,
              height: 880,
              backgroundColor: "#FCFBF7",
              border: "12px solid #FFFFFF",
              borderRadius: 6,
              boxShadow: "0 22px 48px rgba(0,0,0,0.55)",
              padding: 40,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: 44,
                  fontWeight: 700,
                  textAlign: "center",
                  letterSpacing: 2,
                  color: "#141414",
                  borderBottom: "2px solid #141414",
                  paddingBottom: 20,
                  marginBottom: 30,
                }}
              >
                ELIZABETH II · 1956
              </div>

              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 32,
                  lineHeight: 1.45,
                  color: "#2B251E",
                  textAlign: "center",
                  padding: "0 30px",
                }}
              >
                “An Act to make provision for abating the pollution of the air, creating smoke control areas, and prohibiting the emission of dark smoke from chimneys.”
              </div>
            </div>

            {/* Official Wax Seal */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  backgroundColor: "#D62828",
                  boxShadow: "0 8px 20px rgba(214,40,40,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFF",
                  fontFamily: "Times New Roman, serif",
                  fontWeight: 700,
                  fontSize: 20,
                  textAlign: "center",
                  border: "3px solid #941B1B",
                }}
              >
                ROYAL<br />ASSENT
              </div>
            </div>
          </div>

          {/* Final Callout Banner */}
          <div
            style={{
              position: "absolute",
              bottom: 370,
              left: 110,
              right: 170,
              backgroundColor: "#141414",
              color: "#FFFFFF",
              padding: "14px 20px",
              fontFamily: "Courier, monospace",
              fontSize: 22,
              fontWeight: 700,
              textAlign: "center",
              transform: "rotate(-1deg)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
            }}
          >
            BIRTH OF MODERN ENVIRONMENTAL LAW
          </div>
        </AbsoluteFill>
      )}

      {/* Persistent Channel Branding Badge (Top Right Safe Area) */}
      <div
        style={{
          position: "absolute",
          top: 260,
          right: 160,
          padding: "6px 14px",
          backgroundColor: "#141414",
          color: "#F2B705",
          fontFamily: "Courier, monospace",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 2,
          borderRadius: 4,
          zIndex: 100,
        }}
      >
        BANG MOTION
      </div>
    </AbsoluteFill>
  );
};

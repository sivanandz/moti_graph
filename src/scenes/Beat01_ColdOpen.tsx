import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
} from "remotion";
import { MarkerHighlight } from "../components/MarkerHighlight";
import { ThreeCanvasWrapper } from "../components/ThreeCanvasWrapper";
import { PushPin } from "../components/PushPin";
import { ScotchTape } from "../components/ScotchTape";
import { RedString } from "../components/RedString";
import { FilmStripOverlay } from "../components/FilmStripOverlay";

export const Beat01_ColdOpen: React.FC<{
  title: string;
  highlight: string;
  tag: string;
}> = ({ title, highlight, tag }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Snappy spring entrance
  const entrance = spring({
    frame,
    fps,
    config: { damping: 13, mass: 0.5, stiffness: 150 },
  });

  const cardY = interpolate(entrance, [0, 1], [140, 0]);
  const cardScale = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });

  // Black censorship bar sliding off to reveal truth
  const redactionWipe = interpolate(
    frame,
    [15, 30],
    [100, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#DBCBB7", overflow: "hidden" }}>
      {/* Real Kraft / Parchment Paper Background */}
      <Img
        src={staticFile("images/vintage_paper_texture.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.9,
          mixBlendMode: "multiply",
        }}
      />

      {/* Detective Board Red Yarn Connecting Elements */}
      <RedString x1={450} y1={280} x2={780} y2={420} startFrame={8} durationFrames={14} />
      <RedString x1={1480} y1={320} x2={1140} y2={430} startFrame={14} durationFrames={14} />

      {/* Pinned Evidence Card Left (Date / Dispatch) */}
      <div
        style={{
          position: "absolute",
          top: "160px",
          left: "220px",
          backgroundColor: "#F7F5EE",
          padding: "24px 30px",
          border: "1px solid #D5CEBE",
          boxShadow: "0 15px 30px rgba(0,0,0,0.18)",
          transform: "rotate(-5deg)",
          zIndex: 10,
        }}
      >
        <PushPin top="-10px" left="42%" color="brass" />
        <div style={{ fontFamily: "Impact, sans-serif", fontSize: "38px", color: "#111", lineHeight: 1 }}>
          DAILY
        </div>
        <div style={{ fontFamily: "Courier New, monospace", fontSize: "28px", fontWeight: "bold", color: "#D62828" }}>
          500M
        </div>
        <div style={{ fontFamily: "Courier New, monospace", fontSize: "12px", color: "#666" }}>
          TRANSFERS
        </div>
      </div>

      {/* Pinned Evidence Card Right (QR / Code) */}
      <div
        style={{
          position: "absolute",
          top: "180px",
          right: "220px",
          backgroundColor: "#FAF9F5",
          padding: "20px 24px",
          border: "1px solid #D5CEBE",
          boxShadow: "0 15px 30px rgba(0,0,0,0.18)",
          transform: "rotate(6deg)",
          zIndex: 10,
        }}
      >
        <PushPin top="-10px" left="42%" color="brass" />
        <ScotchTape top="-14px" right="-20px" rotation={25} width={80} />
        <div style={{ width: "90px", height: "90px", border: "3px solid #111", padding: "6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
          <div style={{ backgroundColor: "#111" }} />
          <div style={{ border: "2px solid #111" }} />
          <div style={{ border: "2px solid #111" }} />
          <div style={{ backgroundColor: "#111" }} />
        </div>
        <div style={{ fontFamily: "Courier New, monospace", fontSize: "11px", color: "#666", marginTop: "6px", textAlign: "center" }}>
          SCAN TO PAY
        </div>
      </div>

      {/* 3D Isometric Card in background */}
      <ThreeCanvasWrapper cameraPosition={[0, 0, 4.2]}>
        <mesh
          position={[2.8, -0.2, 0]}
          rotation={[
            0.35,
            interpolate(frame, [0, durationInFrames], [-0.4, -0.05]),
            0,
          ]}
        >
          <boxGeometry args={[1.8, 2.4, 0.05]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
      </ThreeCanvasWrapper>

      {/* Main Center Cutout Card */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(${cardY}px) scale(${cardScale})`,
          zIndex: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "54px 72px",
            border: "1px solid #D5D0C5",
            borderRadius: "3px",
            boxShadow:
              "0 32px 64px -16px rgba(40, 30, 20, 0.35), 0 4px 16px rgba(0,0,0,0.08)",
            maxWidth: "1150px",
            transform: "rotate(-1deg)",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Scotch Tape at corners */}
          <ScotchTape top="-16px" left="30px" rotation={-6} />
          <ScotchTape top="-16px" right="30px" rotation={8} />

          {/* Top Archival Tag */}
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#D62828",
              color: "#FFFFFF",
              fontFamily: "Arial Black, Impact, sans-serif",
              fontSize: "16px",
              letterSpacing: "4px",
              padding: "5px 16px",
              textTransform: "uppercase",
              marginBottom: "22px",
            }}
          >
            VOX EXPLAINER // DECLASSIFIED
          </div>

          {/* Headline with Black Censorship Bar & Yellow Highlight */}
          <h1
            style={{
              fontFamily: "Impact, Franklin Gothic Bold, sans-serif",
              fontSize: "66px",
              lineHeight: 1.12,
              color: "#111111",
              margin: 0,
              textTransform: "uppercase",
              position: "relative",
            }}
          >
            {title}{" "}
            <MarkerHighlight startFrame={18} durationFrames={14} color="#FFEA00">
              {highlight}
            </MarkerHighlight>
          </h1>

          <p
            style={{
              fontFamily: "Courier New, monospace",
              fontSize: "20px",
              color: "#5A5D64",
              marginTop: "26px",
              letterSpacing: "1px",
            }}
          >
            {tag}
          </p>
        </div>
      </AbsoluteFill>

      {/* 35mm Film Strip Footer */}
      <FilmStripOverlay timecode="00:00:08:15" label="STAGE 01 // COLD OPEN HOOK" />
    </AbsoluteFill>
  );
};

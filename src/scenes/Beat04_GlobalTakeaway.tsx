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
import { PushPin } from "../components/PushPin";
import { ScotchTape } from "../components/ScotchTape";
import { DymoLabel } from "../components/DymoLabel";
import { FilmStripOverlay } from "../components/FilmStripOverlay";

export const Beat04_GlobalTakeaway: React.FC<{
  title: string;
  highlight: string;
  tag: string;
}> = ({ title, highlight, tag }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 160 },
  });

  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.06]);

  // Verified Badge Stamp (Spring slam at frame 20)
  const badgeSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, mass: 0.4, stiffness: 200 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#2E3840", overflow: "hidden" }}>
      {/* Archival Antique World Map Background */}
      <Img
        src={staticFile("images/antique_map.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.45,
          mixBlendMode: "luminosity",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${zoom})`,
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "54px 76px",
            border: "1px solid #D5D2C8",
            boxShadow:
              "0 32px 64px -12px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.15)",
            maxWidth: "1150px",
            textAlign: "center",
            transform: `translateY(${interpolate(entrance, [0, 1], [110, 0])}px) rotate(0.8deg)`,
            position: "relative",
          }}
        >
          {/* Push pins & tape at corners */}
          <PushPin top="-12px" left="50px" color="brass" />
          <PushPin top="-12px" right="50px" color="brass" />
          <ScotchTape bottom="-14px" left="60px" rotation={-6} />
          <ScotchTape bottom="-14px" right="60px" rotation={5} />

          {/* Dymo Header */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "20px" }}>
            <DymoLabel text="GLOBAL IMPACT REPORT" size="sm" bgColor="#111111" />
            <span style={{ fontFamily: "Courier New, monospace", fontSize: "16px", color: "#666", alignSelf: "center" }}>
              {tag}
            </span>
          </div>

          <h2
            style={{
              fontFamily: "Impact, Franklin Gothic Bold, sans-serif",
              fontSize: "64px",
              lineHeight: 1.12,
              color: "#111111",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {title}{" "}
            <MarkerHighlight startFrame={14} durationFrames={14} color="#FFEA00">
              {highlight}
            </MarkerHighlight>
          </h2>

          {/* Green Stamp Seal */}
          {frame >= 20 && (
            <div
              style={{
                display: "inline-block",
                marginTop: "36px",
                border: "6px solid #2B9348",
                color: "#2B9348",
                padding: "10px 32px",
                fontFamily: "Impact, Arial Black, sans-serif",
                fontSize: "40px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                borderRadius: "8px",
                transform: `scale(${interpolate(badgeSpring, [0, 1], [2.8, 1])}) rotate(-3deg)`,
                opacity: interpolate(badgeSpring, [0, 0.4], [0, 1]),
                boxShadow: "0 8px 24px rgba(43, 147, 72, 0.3)",
              }}
            >
              ✓ OPEN PROTOCOL ARCHITECTURE
            </div>
          )}
        </div>
      </AbsoluteFill>

      {/* 35mm Film Strip Footer */}
      <FilmStripOverlay timecode="00:00:30:10" label="STAGE 04 // GLOBAL EXPANSION" />
    </AbsoluteFill>
  );
};

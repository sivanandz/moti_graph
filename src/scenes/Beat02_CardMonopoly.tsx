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
import { ScotchTape } from "../components/ScotchTape";
import { DymoLabel } from "../components/DymoLabel";
import { FilmStripOverlay } from "../components/FilmStripOverlay";

export const Beat02_CardMonopoly: React.FC<{
  title: string;
  highlight: string;
  tag: string;
}> = ({ title, highlight, tag }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 13, mass: 0.6, stiffness: 150 },
  });

  const cardRotate = interpolate(frame, [0, durationInFrames], [-2, 0.5]);
  const driftScale = interpolate(frame, [0, durationInFrames], [1.0, 1.05]);

  // Mayakovsky Horizontal Slice Offset (from Image 2)
  const sliceOffset = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 12, stiffness: 180 } }),
    [0, 1],
    [0, 45]
  );

  // Red stamp slam at frame 22
  const stampSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 9, mass: 0.4, stiffness: 220 },
  });
  const stampScale = interpolate(stampSpring, [0, 1], [3.2, 1.0]);
  const stampOpacity = interpolate(stampSpring, [0, 0.3], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#3F4E5A", overflow: "hidden" }}>
      {/* Background Archival Paper Texture with Slate Blue Tint (Image 2 style) */}
      <Img
        src={staticFile("images/vintage_paper_texture.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.65,
          mixBlendMode: "multiply",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${driftScale})`,
        }}
      >
        {/* Archival Torn Paper Layer (Image 2 style torn edge) */}
        <div
          style={{
            position: "relative",
            backgroundColor: "#FAF8F0",
            width: "1080px",
            padding: "50px 65px",
            border: "1px solid #D5CEBC",
            boxShadow:
              "0 28px 56px -12px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.15)",
            transform: `translateY(${interpolate(enter, [0, 1], [160, 0])}px) rotate(${cardRotate}deg)`,
          }}
        >
          <ScotchTape top="-15px" left="60px" rotation={-5} />
          <ScotchTape top="-15px" right="60px" rotation={6} />

          {/* Dymo Label Header (Image 2 style) */}
          <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
            <DymoLabel text="ARCHIVAL EVIDENCE" size="sm" rotation={-1} bgColor="#181818" />
            <span style={{ fontFamily: "Courier New, monospace", fontSize: "14px", color: "#666" }}>
              {tag}
            </span>
          </div>

          <h2
            style={{
              fontFamily: "Impact, Franklin Gothic Bold, sans-serif",
              fontSize: "58px",
              lineHeight: 1.1,
              color: "#18191B",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {title}{" "}
            <MarkerHighlight startFrame={18} durationFrames={14} color="#FFEA00">
              {highlight}
            </MarkerHighlight>
          </h2>

          {/* Mayakovsky Sliced Image & Toll Gate Montage */}
          <div style={{ display: "flex", gap: "30px", marginTop: "32px", alignItems: "center" }}>
            
            {/* Real Credit Card Archival Photo with Sliced Band */}
            <div style={{ position: "relative", width: "360px", height: "180px", overflow: "hidden", borderRadius: "4px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
              <Img
                src={staticFile("images/credit_card_monopoly.jpg")}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.2) grayscale(0.5)" }}
              />
              {/* Horizontal Mayakovsky Cutout Slice */}
              <div
                style={{
                  position: "absolute",
                  top: "35%",
                  left: 0,
                  width: "100%",
                  height: "35%",
                  backgroundColor: "#FFEA00",
                  mixBlendMode: "multiply",
                  transform: `translateX(${sliceOffset}px)`,
                }}
              />
            </div>

            {/* Toll Rate Callout */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  backgroundColor: "#EFECE4",
                  padding: "20px 24px",
                  borderRadius: "4px",
                  fontFamily: "Courier New, monospace",
                  fontSize: "18px",
                  borderLeft: "5px solid #D62828",
                }}
              >
                <div style={{ color: "#666", marginBottom: "4px" }}>INTERCHANGE TOLL:</div>
                <div style={{ fontSize: "36px", fontFamily: "Impact, sans-serif", color: "#D62828" }}>
                  2.50% PER SWIPE
                </div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                  POCKETED BY PRIVATE OVERSEAS NETWORKS
                </div>
              </div>
            </div>

          </div>

          {/* Red Stamped BYPASSED Badge (spring impact) */}
          {frame >= 22 && (
            <div
              style={{
                position: "absolute",
                top: "40%",
                right: "6%",
                border: "7px solid #D62828",
                color: "#D62828",
                padding: "10px 28px",
                fontFamily: "Impact, Arial Black, sans-serif",
                fontSize: "48px",
                transform: `scale(${stampScale}) rotate(-14deg)`,
                opacity: stampOpacity,
                letterSpacing: "4px",
                textTransform: "uppercase",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(214, 40, 40, 0.35)",
              }}
            >
              BYPASSED
            </div>
          )}
        </div>
      </AbsoluteFill>

      {/* 35mm Film Strip Footer */}
      <FilmStripOverlay timecode="00:00:15:20" label="STAGE 02 // PRIVATE TOLL MONOPOLY" />
    </AbsoluteFill>
  );
};

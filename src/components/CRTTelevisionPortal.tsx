import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const CRTTelevisionPortal: React.FC<{
  width?: number;
  height?: number;
}> = ({ width = 720, height = 480 }) => {
  const frame = useCurrentFrame();

  // 60Hz television cathode flicker
  const flicker = interpolate(Math.sin(frame * 2.0), [-1, 1], [0.92, 1.0]);

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#42281D", // Vintage wood-grain casing
        border: "14px solid #2B1810",
        borderRadius: 28,
        boxShadow: "0 25px 50px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.8)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        opacity: flicker,
      }}
    >
      {/* Inner Screen Bezel */}
      <div
        style={{
          width: "82%",
          height: "92%",
          backgroundColor: "#111111",
          borderRadius: 36,
          border: "10px solid #1C1917",
          position: "relative",
          overflow: "hidden",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.9)",
        }}
      >
        {/* Procedural Canvas / SVG Static Snow Layer */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="3"
              stitchTiles="stitch"
              seed={frame % 100}
            />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity={0.88} />
        </svg>

        {/* 60Hz Horizontal Scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 4px)",
            pointerEvents: "none",
          }}
        />

        {/* Screen Glass Reflection Highlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* On-Screen Callout */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 20,
            backgroundColor: "rgba(0,0,0,0.75)",
            padding: "4px 8px",
            borderRadius: 4,
            fontFamily: "'Courier Prime', monospace",
            fontSize: 13,
            color: "#FFFFFF",
            letterSpacing: 1,
          }}
        >
          ~1% OF STATIC = BIG BANG (13.8 BYA)
        </div>
      </div>

      {/* Right Control Dial Panel */}
      <div
        style={{
          width: "18%",
          height: "92%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          paddingLeft: 12,
        }}
      >
        {/* Channel Selector Dial */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "#211A16",
            border: "4px solid #735341",
            boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#D4B895",
            fontFamily: "'Courier Prime', monospace",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          VHF 3
        </div>

        {/* UHF Dial */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: "#211A16",
            border: "4px solid #735341",
            boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#D4B895",
            fontFamily: "'Courier Prime', monospace",
            fontSize: 10,
          }}
        >
          UHF
        </div>

        {/* Speaker Slits */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "70%" }}>
          {[...Array(6)].map((_, i) => (
            <div key={`slit-${i}`} style={{ height: 3, backgroundColor: "#1F140D", borderRadius: 2 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

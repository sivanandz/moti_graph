import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const OscilloscopePortal: React.FC<{
  frequency?: number;
  noiseLevel?: number;
  width?: number;
  height?: number;
  label?: string;
}> = ({ frequency = 0.05, noiseLevel = 25, width = 720, height = 480, label = "4,080 MHz // RF INPUT" }) => {
  const frame = useCurrentFrame();

  // Generate dynamic oscilloscope points
  const points: string[] = [];
  const segments = 120;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * (width - 40) + 20;
    // Harmonic wave + procedural noise jitter
    const noise = Math.sin(frame * 0.8 + i * 1.5) * noiseLevel;
    const wave = Math.sin(i * frequency + frame * 0.15) * 45;
    const y = height / 2 + wave + noise;
    points.push(`${x},${y}`);
  }
  const pathD = `M ${points.join(" L ")}`;

  // CRT scanline flicker
  const flicker = interpolate(Math.sin(frame * 1.2), [-1, 1], [0.88, 1.0]);

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#081014",
        borderRadius: 24,
        border: "8px solid #2B3338",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset 0 0 50px rgba(0,0,0,0.9)",
        position: "relative",
        overflow: "hidden",
        opacity: flicker,
      }}
    >
      {/* CRT Curvature Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(30, 80, 70, 0.4) 0%, rgba(5, 12, 16, 0.95) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Oscilloscope Graticule Grid */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {/* Horizontal grid lines */}
        {[...Array(9)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1={20}
            y1={((i + 1) * height) / 10}
            x2={width - 20}
            y2={((i + 1) * height) / 10}
            stroke="#4EF2BB"
            strokeWidth={i === 4 ? 2 : 1}
            strokeDasharray={i === 4 ? "none" : "2,4"}
          />
        ))}
        {/* Vertical grid lines */}
        {[...Array(11)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={((i + 1) * width) / 12}
            y1={20}
            x2={((i + 1) * width) / 12}
            y2={height - 20}
            stroke="#4EF2BB"
            strokeWidth={i === 5 ? 2 : 1}
            strokeDasharray={i === 5 ? "none" : "2,4"}
          />
        ))}
      </svg>

      {/* Phosphor Signal Trace */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {/* Glow halo layer */}
        <path d={pathD} fill="none" stroke="#25E39F" strokeWidth={6} strokeOpacity={0.4} />
        {/* Sharp core electron beam */}
        <path d={pathD} fill="none" stroke="#E6FFF6" strokeWidth={2} />
      </svg>

      {/* CRT Horizontal Scanlines Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Screen HUD Label */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 24,
          fontFamily: "'Courier Prime', monospace",
          fontSize: 14,
          letterSpacing: 2,
          color: "#4EF2BB",
          textShadow: "0 0 8px rgba(78, 242, 187, 0.8)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 24,
          fontFamily: "'Courier Prime', monospace",
          fontSize: 13,
          letterSpacing: 1,
          color: "#4EF2BB",
        }}
      >
        CH1: 3.5K EXCESS [L-BAND]
      </div>
    </div>
  );
};

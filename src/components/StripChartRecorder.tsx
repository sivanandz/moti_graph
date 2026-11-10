import React from "react";
import { useCurrentFrame } from "remotion";

export const StripChartRecorder: React.FC<{
  width?: number;
  height?: number;
  excessKelvin?: number;
}> = ({ width = 740, height = 480, excessKelvin = 3.5 }) => {
  const frame = useCurrentFrame();

  // Scroll offset for continuous paper movement
  const scrollOffset = (frame * 3) % 40;

  // Pen needle vertical position:
  // Baseline is at ~y=300 (3.3K), excess jumps to ~y=160 (6.7K)
  const isAfterJump = frame > 45;
  const needleY = isAfterJump ? 160 + Math.sin(frame * 0.4) * 4 : 300 + Math.sin(frame * 0.4) * 3;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#F7F3E9",
        border: "10px solid #332F2C",
        borderRadius: 12,
        boxShadow: "0 20px 45px rgba(0,0,0,0.45)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Paper Grid Lines */}
      <svg width={width + 80} height={height} style={{ position: "absolute", left: -scrollOffset, top: 0 }}>
        {/* Horizontal temperature calibrations */}
        {[80, 160, 240, 300, 380].map((y, idx) => (
          <line
            key={`cal-${idx}`}
            x1={0}
            y1={y}
            x2={width + 80}
            y2={y}
            stroke={y === 160 ? "#D93829" : y === 300 ? "#2B6B4F" : "#A6C2B5"}
            strokeWidth={y === 160 || y === 300 ? 2 : 1}
            strokeDasharray={y === 160 || y === 300 ? "none" : "3,3"}
          />
        ))}

        {/* Vertical time grid lines */}
        {[...Array(25)].map((_, i) => (
          <line
            key={`vt-${i}`}
            x1={i * 40}
            y1={0}
            x2={i * 40}
            y2={height}
            stroke="#C1D9CE"
            strokeWidth={1}
          />
        ))}

        {/* Historical red ink trace */}
        <path
          d={`M 0,300 L ${Math.min(width * 0.7, 45 * 3)},300 L ${Math.min(width * 0.7 + 20, 50 * 3)},160 L ${width},160`}
          fill="none"
          stroke="#D93829"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>

      {/* Red Stylus Needle Arm */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 90,
          width: 8,
          height: needleY,
          backgroundColor: "#1F2326",
          borderRadius: "0 0 4px 4px",
          boxShadow: "2px 0 6px rgba(0,0,0,0.3)",
          transition: "height 0.1s ease-out",
        }}
      >
        {/* Stylus Tip */}
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: -4,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "#D93829",
            border: "2px solid #FFFFFF",
          }}
        />
      </div>

      {/* Calibrated Temperature Scale Labels (Left Edge) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 110,
          backgroundColor: "rgba(247, 243, 233, 0.92)",
          borderRight: "2px solid #829E93",
          padding: "16px 10px",
          fontFamily: "'Courier Prime', monospace",
          fontSize: 13,
          fontWeight: 700,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#2C3531",
          pointerEvents: "none",
        }}
      >
        <span style={{ color: "#D93829" }}>10.0 K [MAX]</span>
        <span style={{ color: "#D93829", backgroundColor: "#FFE5E2", padding: "2px 4px", borderRadius: 4 }}>
          6.7 K [MEASURED]
        </span>
        <span style={{ color: "#2B6B4F" }}>3.3 K [EXPECTED]</span>
        <span>0.0 K [ABSOLUTE]</span>
      </div>

      {/* Bottom Status Banner */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 16,
          backgroundColor: "#1C2421",
          color: "#E2F0D9",
          fontFamily: "'Courier Prime', monospace",
          fontSize: 12,
          letterSpacing: 1,
          padding: "4px 10px",
          borderRadius: 4,
        }}
      >
        BELL LABS // LEEDS & NORTHRUP RECORDER #4080
      </div>
    </div>
  );
};

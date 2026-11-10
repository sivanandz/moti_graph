import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const AnimatedWaveguideGaugeSVG: React.FC<{
  width?: number;
  height?: number;
  entryFrame?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width = 280, height = 210, entryFrame = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy paper drop entry physics
  const isEntered = frame >= entryFrame;
  const relFrame = Math.max(0, frame - entryFrame);
  const entrySpring = spring({
    frame: relFrame,
    fps,
    config: { damping: 12, mass: 0.45, stiffness: 220 },
  });

  if (!isEntered) return null;

  // Gentle organic hover/float motion
  const hoverY = Math.sin(frame * 0.08) * 5;
  const hoverRot = Math.cos(frame * 0.05) * 1.2;

  // Dial needle jitter around 4,080 MHz
  const needleAngle = -22 + Math.sin(frame * 0.18) * 4.5 + Math.cos(frame * 0.35) * 2;

  // Oscillating traveling RF microwave wave
  const wavePhase = (frame * 2.8) % 60;

  // LED jewel lamp pulsation
  const ledGlow = 0.5 + Math.sin(frame * 0.22) * 0.5;

  return (
    <div
      style={{
        width,
        height,
        transform: `scale(${entrySpring}) translateY(${hoverY}px) rotate(${hoverRot}deg)`,
        transformOrigin: "center center",
        position: "relative",
        filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.35))",
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 280 210"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="metalPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF7EE" />
            <stop offset="100%" stopColor="#E6DFCE" />
          </linearGradient>
          <linearGradient id="gaugeBezel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A353D" />
            <stop offset="100%" stopColor="#141C22" />
          </linearGradient>
          <pattern id="dotGrid" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.75" fill="rgba(0,0,0,0.12)" />
          </pattern>
        </defs>

        {/* Vintage Cream Enclosure Backing */}
        <rect
          x="4"
          y="4"
          width="272"
          height="202"
          rx="6"
          fill="url(#metalPlate)"
          stroke="#191919"
          strokeWidth="2.5"
        />
        <rect x="4" y="4" width="272" height="202" rx="6" fill="url(#dotGrid)" />

        {/* Corner Mounting Screws */}
        <circle cx="14" cy="14" r="3" fill="#6A6255" />
        <circle cx="266" cy="14" r="3" fill="#6A6255" />
        <circle cx="14" cy="196" r="3" fill="#6A6255" />
        <circle cx="266" cy="196" r="3" fill="#6A6255" />

        {/* Top Tag Header */}
        <rect x="18" y="14" width="244" height="22" fill="#DE3831" rx="2" />
        <text
          x="140"
          y="29"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Courier Prime', monospace"
          fontSize="11"
          fontWeight="bold"
          letterSpacing="1.5"
        >
          BELL LABS // WAVEGUIDE MASER
        </text>

        {/* Analog Galvanometer Gauge */}
        <g transform="translate(20, 44)">
          {/* Gauge Frame */}
          <rect
            x="0"
            y="0"
            width="240"
            height="90"
            rx="4"
            fill="url(#gaugeBezel)"
            stroke="#0D1216"
            strokeWidth="2"
          />

          {/* Scale Arc Background */}
          <path
            d="M 25 72 A 90 90 0 0 1 215 72"
            fill="none"
            stroke="#4A5862"
            strokeWidth="12"
          />
          {/* Target Anomaly Zone in Vermilion */}
          <path
            d="M 140 24 A 90 90 0 0 1 195 46"
            fill="none"
            stroke="#DE3831"
            strokeWidth="12"
          />

          {/* Tick Marks */}
          {[0, 20, 40, 60, 80, 100].map((t, idx) => {
            const ang = -50 + idx * 20;
            const rad = (ang * Math.PI) / 180;
            const x1 = 120 + Math.sin(rad) * 68;
            const y1 = 78 - Math.cos(rad) * 68;
            const x2 = 120 + Math.sin(rad) * 78;
            const y2 = 78 - Math.cos(rad) * 78;
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={idx >= 4 ? "#DE3831" : "#A6B8C7"}
                strokeWidth="2"
              />
            );
          })}

          {/* Oscillating Needle with Pivot */}
          <g transform={`translate(120, 80) rotate(${needleAngle})`}>
            <line x1="0" y1="0" x2="0" y2="-68" stroke="#FFFFFF" strokeWidth="2" />
            <polygon points="-3,-55 3,-55 0,-68" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="7" fill="#DE3831" />
            <circle cx="0" cy="0" r="3" fill="#141414" />
          </g>

          <text
            x="120"
            y="65"
            textAnchor="middle"
            fill="#899BAA"
            fontFamily="'Courier Prime', monospace"
            fontSize="9"
            letterSpacing="1"
          >
            4,080 MHz CARRIER
          </text>
        </g>

        {/* Bottom RF Waveguide Chamber with Flowing Waves */}
        <g transform="translate(20, 142)">
          <rect
            x="0"
            y="0"
            width="170"
            height="54"
            rx="3"
            fill="#1E2830"
            stroke="#11181D"
            strokeWidth="1.5"
          />
          <text
            x="8"
            y="14"
            fill="#7ED4B8"
            fontFamily="'Courier Prime', monospace"
            fontSize="9"
            fontWeight="bold"
          >
            RF CHURN: 7.35 cm
          </text>

          {/* Sine Wave Flowing Through Waveguide */}
          <path
            d={`M 10 34 Q 25 ${34 + Math.sin((10 + wavePhase) * 0.1) * 12} 40 34 T 70 34 T 100 34 T 130 34 T 160 34`}
            fill="none"
            stroke="#00E5FF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={`M 10 34 Q 25 ${34 - Math.sin((10 + wavePhase) * 0.1) * 12} 40 34 T 70 34 T 100 34 T 130 34 T 160 34`}
            fill="none"
            stroke="rgba(0, 229, 255, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </g>

        {/* Active Cryogenic Status Indicator Lamp (Right Box) */}
        <g transform="translate(198, 142)">
          <rect
            x="0"
            y="0"
            width="62"
            height="54"
            rx="3"
            fill="#141C22"
            stroke="#0D1216"
            strokeWidth="1.5"
          />
          {/* Jewel Lamp */}
          <circle
            cx="31"
            cy="20"
            r="9"
            fill="#00E5A3"
            opacity={ledGlow}
            filter="drop-shadow(0 0 6px #00E5A3)"
          />
          <circle cx="31" cy="20" r="4" fill="#FFFFFF" opacity="0.9" />
          <text
            x="31"
            y="42"
            textAnchor="middle"
            fill="#E0DCD3"
            fontFamily="'Courier Prime', monospace"
            fontSize="8"
            fontWeight="bold"
          >
            4.2K HELIUM
          </text>
        </g>
      </svg>
    </div>
  );
};

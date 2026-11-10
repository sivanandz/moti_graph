import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const AnimatedCryogenicGaugeSVG: React.FC<{
  width?: number;
  height?: number;
  entryFrame?: number;
  style?: React.CSSProperties;
}> = ({ width = 270, height = 210, entryFrame = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isEntered = frame >= entryFrame;
  const relFrame = Math.max(0, frame - entryFrame);
  const entrySpring = spring({
    frame: relFrame,
    fps,
    config: { damping: 12, mass: 0.45, stiffness: 220 },
  });

  if (!isEntered) return null;

  // Gentle organic hover/float
  const hoverY = Math.sin((frame + 30) * 0.08) * 5;
  const hoverRot = Math.cos((frame + 30) * 0.05) * 1.1;

  // Liquid meniscus bubbling
  const bubbleY1 = (frame * 1.8) % 65;
  const bubbleY2 = ((frame + 20) * 1.4) % 65;

  // Temperature thermometer mercury column animation down to 4.2K
  const mercuryProgress = Math.min(1, relFrame / 25);
  const mercuryH = 20 + mercuryProgress * 65;

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
        viewBox="0 0 270 210"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="cryoPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF7EE" />
            <stop offset="100%" stopColor="#E4DDCB" />
          </linearGradient>
          <linearGradient id="liquidHelium" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4DEEEA" />
            <stop offset="100%" stopColor="#0B8E96" />
          </linearGradient>
        </defs>

        {/* Vintage Instrument Card */}
        <rect
          x="4"
          y="4"
          width="262"
          height="202"
          rx="6"
          fill="url(#cryoPlate)"
          stroke="#141414"
          strokeWidth="2.5"
        />

        {/* Corner Rivets */}
        <circle cx="14" cy="14" r="3" fill="#6A6255" />
        <circle cx="256" cy="14" r="3" fill="#6A6255" />
        <circle cx="14" cy="196" r="3" fill="#6A6255" />
        <circle cx="256" cy="196" r="3" fill="#6A6255" />

        {/* Header Ribbon */}
        <rect x="16" y="14" width="238" height="22" fill="#141E26" rx="2" />
        <text
          x="135"
          y="29"
          textAnchor="middle"
          fill="#4DEEEA"
          fontFamily="'Courier Prime', monospace"
          fontSize="10"
          fontWeight="bold"
          letterSpacing="1.5"
        >
          CRYOGENIC LIQUID HELIUM
        </text>

        {/* Dewar Flask (Left) */}
        <g transform="translate(24, 46)">
          <rect
            x="0"
            y="0"
            width="80"
            height="110"
            rx="8"
            fill="#121820"
            stroke="#263542"
            strokeWidth="2"
          />
          {/* Liquid Pool */}
          <rect
            x="6"
            y="35"
            width="68"
            height="69"
            rx="4"
            fill="url(#liquidHelium)"
            opacity="0.85"
          />
          {/* Bubbles rising */}
          <circle cx="24" cy={100 - bubbleY1} r="3" fill="#FFFFFF" opacity="0.7" />
          <circle cx="56" cy={100 - bubbleY2} r="2.5" fill="#FFFFFF" opacity="0.6" />
          <circle cx="40" cy={90 - bubbleY1 * 0.7} r="2" fill="#FFFFFF" opacity="0.5" />

          {/* Meniscus Line */}
          <path
            d="M 6 35 Q 24 37 40 35 T 74 35"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
          />

          <text
            x="40"
            y="130"
            textAnchor="middle"
            fill="#141414"
            fontFamily="'Courier Prime', monospace"
            fontSize="10"
            fontWeight="bold"
          >
            4.2 KELVIN
          </text>
        </g>

        {/* Thermometer Scale (Center) */}
        <g transform="translate(122, 46)">
          <rect
            x="14"
            y="0"
            width="12"
            height="110"
            rx="6"
            fill="#EFECE3"
            stroke="#141414"
            strokeWidth="1.5"
          />
          {/* Rising/Falling Mercury Column */}
          <rect
            x="16"
            y={110 - mercuryH}
            width="8"
            height={mercuryH}
            rx="4"
            fill="#DE3831"
          />
          <circle cx="20" cy="106" r="8" fill="#DE3831" />

          {/* Degree Ticks */}
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <g key={k} transform={`translate(0, ${100 - k * 14})`}>
              <line x1="28" y1="0" x2="36" y2="0" stroke="#141414" strokeWidth="1.5" />
              <text
                x="40"
                y="3"
                fill="#141414"
                fontFamily="'Courier Prime', monospace"
                fontSize="8"
                fontWeight={k === 4 ? "bold" : "normal"}
              >
                {k}K
              </text>
            </g>
          ))}
        </g>

        {/* Anomaly Badge (Bottom/Right) */}
        <g transform="translate(142, 146)">
          <rect
            x="0"
            y="0"
            width="112"
            height="46"
            rx="3"
            fill="#DE3831"
            stroke="#A61C1C"
            strokeWidth="1.5"
          />
          <text
            x="56"
            y="18"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="'Courier Prime', monospace"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="1"
          >
            NOISE FLOOR
          </text>
          <text
            x="56"
            y="35"
            textAnchor="middle"
            fill="#FFD166"
            fontFamily="'Courier Prime', monospace"
            fontSize="14"
            fontWeight="900"
          >
            +3.5K SURPLUS
          </text>
        </g>
      </svg>
    </div>
  );
};

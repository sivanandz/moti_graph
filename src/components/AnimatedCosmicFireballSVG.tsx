import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const AnimatedCosmicFireballSVG: React.FC<{
  width?: number;
  height?: number;
  entryFrame?: number;
  style?: React.CSSProperties;
}> = ({ width = 290, height = 220, entryFrame = 0, style }) => {
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
  const hoverY = Math.sin((frame + 90) * 0.08) * 5;
  const hoverRot = Math.cos((frame + 90) * 0.05) * 1.1;

  // Fireball breathing pulse
  const fireRadius = 24 + Math.sin(frame * 0.15) * 4;

  // Expanding redshifting photon waves
  const wave1 = ((frame * 1.2) % 55) + 26;
  const wave2 = (((frame + 20) * 1.2) % 55) + 26;
  const wave3 = (((frame + 40) * 1.2) % 55) + 26;

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
        viewBox="0 0 290 220"
        style={{ display: "block" }}
      >
        <defs>
          <radialGradient id="plasmaGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FFDE59" />
            <stop offset="70%" stopColor="#FF5722" />
            <stop offset="100%" stopColor="#8A1818" />
          </radialGradient>
          <linearGradient id="fireballCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B242D" />
            <stop offset="100%" stopColor="#0F151C" />
          </linearGradient>
        </defs>

        {/* Vintage Dark Instrument Card */}
        <rect
          x="4"
          y="4"
          width="282"
          height="212"
          rx="6"
          fill="url(#fireballCard)"
          stroke="#2A3844"
          strokeWidth="2.5"
        />

        {/* Header Tag */}
        <rect x="18" y="14" width="254" height="22" fill="#DE3831" rx="2" />
        <text
          x="145"
          y="29"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Courier Prime', monospace"
          fontSize="10"
          fontWeight="bold"
          letterSpacing="1.5"
        >
          COSMIC FIREBALL // 380,000 YR EPOCH
        </text>

        {/* Expanding Universe Wavefronts */}
        <g transform="translate(145, 115)">
          {/* Outer Stretched Microwave Ripples (Redshift) */}
          <circle
            cx="0"
            cy="0"
            r={wave1}
            fill="none"
            stroke="#DE3831"
            strokeWidth="2"
            opacity={Math.max(0, 1 - wave1 / 82)}
            strokeDasharray="4 3"
          />
          <circle
            cx="0"
            cy="0"
            r={wave2}
            fill="none"
            stroke="#FF9800"
            strokeWidth="2"
            opacity={Math.max(0, 1 - wave2 / 82)}
          />
          <circle
            cx="0"
            cy="0"
            r={wave3}
            fill="none"
            stroke="#FFD166"
            strokeWidth="1.5"
            opacity={Math.max(0, 1 - wave3 / 82)}
          />

          {/* Central Plasma Core */}
          <circle
            cx="0"
            cy="0"
            r={fireRadius}
            fill="url(#plasmaGrad)"
            filter="drop-shadow(0 0 10px #FF5722)"
          />
          <circle cx="0" cy="0" r={fireRadius * 0.4} fill="#FFFFFF" opacity="0.9" />

          {/* Radiating Ray Flares */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
            <line
              key={i}
              x1={0}
              y1={0}
              x2={Math.cos((ang * Math.PI) / 180) * (fireRadius + 14)}
              y2={Math.sin((ang * Math.PI) / 180) * (fireRadius + 14)}
              stroke="#FFD166"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Bottom Readout Banner */}
        <g transform="translate(18, 180)">
          <rect x="0" y="0" width="254" height="26" rx="2" fill="#141C22" stroke="#253540" strokeWidth="1" />
          <text
            x="127"
            y="17"
            textAnchor="middle"
            fill="#FFD166"
            fontFamily="'Courier Prime', monospace"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="1"
          >
            3,000 K → COOLED TO 2.725 K CMB
          </text>
        </g>
      </svg>
    </div>
  );
};

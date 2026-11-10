import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const AnimatedAzimuthCompassSVG: React.FC<{
  width?: number;
  height?: number;
  entryFrame?: number;
  style?: React.CSSProperties;
}> = ({ width = 280, height = 230, entryFrame = 0, style }) => {
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
  const hoverY = Math.sin((frame + 60) * 0.08) * 5;
  const hoverRot = Math.cos((frame + 60) * 0.05) * 1.0;

  // 360 Degree Azimuth Rotation
  const rotDeg = (frame * 1.6) % 360;

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
        viewBox="0 0 280 230"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="compassPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A242C" />
            <stop offset="100%" stopColor="#0E151A" />
          </linearGradient>
        </defs>

        {/* Vintage Dark Bakelite Plate */}
        <rect
          x="4"
          y="4"
          width="272"
          height="222"
          rx="6"
          fill="url(#compassPlate)"
          stroke="#324552"
          strokeWidth="2.5"
        />

        {/* Top Header Tag */}
        <rect x="18" y="14" width="244" height="22" fill="#DE3831" rx="2" />
        <text
          x="140"
          y="29"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Courier Prime', monospace"
          fontSize="10"
          fontWeight="bold"
          letterSpacing="1.5"
        >
          AZIMUTH ROTATION // 360° SWEEP
        </text>

        {/* Circular Compass Dial */}
        <g transform="translate(140, 118)">
          {/* Outer Ring */}
          <circle cx="0" cy="0" r="64" fill="#141B20" stroke="#486070" strokeWidth="2" />
          <circle cx="0" cy="0" r="54" fill="none" stroke="#253540" strokeWidth="1" strokeDasharray="3 3" />

          {/* Rotating Compass Needle & Compass Rose */}
          <g transform={`rotate(${rotDeg})`}>
            {/* 8-point Rose */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
              <g key={i} transform={`rotate(${ang})`}>
                <line x1="0" y1="-50" x2="0" y2="-58" stroke="#89A5B8" strokeWidth="1.5" />
                {i % 2 === 0 && (
                  <polygon
                    points="0,-52 -5,-35 0,-10 5,-35"
                    fill={i === 0 ? "#DE3831" : "#546E7E"}
                  />
                )}
              </g>
            ))}

            {/* Pointer Needle */}
            <polygon points="0,-56 -4,0 0,6 4,0" fill="#DE3831" />
            <polygon points="0,56 -4,0 0,-6 4,0" fill="#89A5B8" />
          </g>

          {/* Fixed Center Hub with Crosshair */}
          <circle cx="0" cy="0" r="10" fill="#0E151A" stroke="#DE3831" strokeWidth="2" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
          <line x1="-62" y1="0" x2="-54" y2="0" stroke="#FFD166" strokeWidth="2" />
          <line x1="54" y1="0" x2="62" y2="0" stroke="#FFD166" strokeWidth="2" />
          <line x1="0" y1="-62" x2="0" y2="-54" stroke="#FFD166" strokeWidth="2" />
          <line x1="0" y1="54" x2="0" y2="62" stroke="#FFD166" strokeWidth="2" />

          {/* Cardinal Labels */}
          <text x="0" y="-40" textAnchor="middle" fill="#FFFFFF" fontFamily="'Courier Prime', monospace" fontSize="10" fontWeight="bold">N</text>
          <text x="0" y="48" textAnchor="middle" fill="#89A5B8" fontFamily="'Courier Prime', monospace" fontSize="10" fontWeight="bold">S</text>
          <text x="44" y="4" textAnchor="middle" fill="#89A5B8" fontFamily="'Courier Prime', monospace" fontSize="10" fontWeight="bold">E</text>
          <text x="-44" y="4" textAnchor="middle" fill="#89A5B8" fontFamily="'Courier Prime', monospace" fontSize="10" fontWeight="bold">W</text>
        </g>

        {/* Bottom Readout Banner */}
        <g transform="translate(18, 188)">
          <rect x="0" y="0" width="244" height="28" rx="2" fill="#18232B" stroke="#253540" strokeWidth="1" />
          <text
            x="122"
            y="18"
            textAnchor="middle"
            fill="#7ED4B8"
            fontFamily="'Courier Prime', monospace"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="1"
          >
            ISOTROPIC // NO ANGLE FLINCH
          </text>
        </g>
      </svg>
    </div>
  );
};

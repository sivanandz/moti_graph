import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface PaperSpeechBubbleProps {
  text: string;
  speaker?: string;
  startFrame?: number;
  pointerDirection?: "bottom-left" | "bottom-right" | "top-left" | "top-right" | "left" | "right";
  x?: number;
  y?: number;
  width?: number;
  fontSize?: number;
  style?: React.CSSProperties;
}

/**
 * Authentic Tactile Paper-Cut Speech Bubble
 * Renders an unmistakable comic/editorial speech balloon with an integrated
 * pointer tail pointing directly at the speaker's mouth.
 */
export const PaperSpeechBubble: React.FC<PaperSpeechBubbleProps> = ({
  text,
  speaker,
  startFrame = 0,
  pointerDirection = "bottom-left",
  x = 0,
  y = 0,
  width = 380,
  fontSize = 24,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame) {
    return null;
  }

  // Snappy mechanical spring entrance
  const elapsed = Math.max(0, frame - startFrame);
  const popSpring = spring({
    frame: elapsed,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.8 },
  });

  // Tactile living desktop micro-motion
  const floatY = Math.sin((frame + 42) * 0.08) * 3;
  const floatRot = Math.cos((frame + 18) * 0.05) * 0.8;

  // Tail dimensions & SVG path definition
  // Balloon body: (0, 0) to (width, height)
  // Height estimated or dynamic based on text length
  const height = text.length > 30 ? 110 : 85;
  const r = 18; // corner radius
  const tailWidth = 24;
  const tailHeight = 32;

  // Build SVG path with integrated tail
  let pathD = "";
  if (pointerDirection === "bottom-left") {
    // Tail at bottom left pointing down-left toward mouth
    const tailStartX = 70;
    const tailTipX = 35;
    const tailTipY = height + tailHeight;
    const tailEndX = tailStartX + tailWidth;

    pathD = `
      M ${r} 0
      H ${width - r}
      A ${r} ${r} 0 0 1 ${width} ${r}
      V ${height - r}
      A ${r} ${r} 0 0 1 ${width - r} ${height}
      H ${tailEndX}
      L ${tailTipX} ${tailTipY}
      L ${tailStartX} ${height}
      H ${r}
      A ${r} ${r} 0 0 1 0 ${height - r}
      V ${r}
      A ${r} ${r} 0 0 1 ${r} 0
      Z
    `;
  } else if (pointerDirection === "bottom-right") {
    const tailStartX = width - 40 - tailWidth;
    const tailTipX = width - 14;
    const tailTipY = height + tailHeight;
    const tailEndX = tailStartX + tailWidth;

    pathD = `
      M ${r} 0
      H ${width - r}
      A ${r} ${r} 0 0 1 ${width} ${r}
      V ${height - r}
      A ${r} ${r} 0 0 1 ${width - r} ${height}
      H ${tailEndX}
      L ${tailTipX} ${tailTipY}
      L ${tailStartX} ${height}
      H ${r}
      A ${r} ${r} 0 0 1 0 ${height - r}
      V ${r}
      A ${r} ${r} 0 0 1 ${r} 0
      Z
    `;
  } else if (pointerDirection === "top-left") {
    const tailStartX = 40;
    const tailTipX = 14;
    const tailTipY = -tailHeight;
    const tailEndX = tailStartX + tailWidth;

    pathD = `
      M ${r} 0
      H ${tailStartX}
      L ${tailTipX} ${tailTipY}
      L ${tailEndX} 0
      H ${width - r}
      A ${r} ${r} 0 0 1 ${width} ${r}
      V ${height - r}
      A ${r} ${r} 0 0 1 ${width - r} ${height}
      H ${r}
      A ${r} ${r} 0 0 1 0 ${height - r}
      V ${r}
      A ${r} ${r} 0 0 1 ${r} 0
      Z
    `;
  } else {
    // Default bottom-left
    pathD = `
      M ${r} 0
      H ${width - r}
      A ${r} ${r} 0 0 1 ${width} ${r}
      V ${height - r}
      A ${r} ${r} 0 0 1 ${width - r} ${height}
      H 64
      L 24 ${height + 28}
      L 40 ${height}
      H ${r}
      A ${r} ${r} 0 0 1 0 ${height - r}
      V ${r}
      A ${r} ${r} 0 0 1 ${r} 0
      Z
    `;
  }

  const svgHeight = height + tailHeight + 10;
  const svgWidth = width + 10;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + floatY,
        width: svgWidth,
        height: svgHeight,
        transform: `scale(${popSpring}) rotate(${floatRot}deg)`,
        transformOrigin: "bottom left",
        zIndex: 60,
        pointerEvents: "none",
        filter: "drop-shadow(0 14px 24px rgba(0, 0, 0, 0.38))",
        ...style,
      }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
      >
        {/* Paper Cutout Balloon Body */}
        <path
          d={pathD}
          fill="#FFFFFF"
          stroke="#141414"
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* Spoken Quote Typography */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "12px 24px",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {speaker && (
          <div
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#DE3831",
              marginBottom: 4,
            }}
          >
            {speaker}
          </div>
        )}
        <div
          style={{
            fontFamily: '"Newsreader", "Georgia", serif',
            fontStyle: "italic",
            fontSize,
            lineHeight: 1.2,
            color: "#111111",
            fontWeight: 800,
            letterSpacing: "-0.01em",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

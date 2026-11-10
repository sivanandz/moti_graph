import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const MarkerHighlight: React.FC<{
  startFrame: number;
  durationFrames?: number;
  color?: string;
  height?: number;
  children: React.ReactNode;
}> = ({
  startFrame,
  durationFrames = 12,
  color = "#FFEA00",
  height = 36,
  children,
}) => {
  const frame = useCurrentFrame();

  const widthPercent = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: -4,
          bottom: 2,
          height: `${height}px`,
          width: `${widthPercent}%`,
          backgroundColor: color,
          mixBlendMode: "multiply",
          zIndex: 1,
          borderRadius: 2,
          transform: "rotate(-0.5deg)",
        }}
      />
      <span style={{ position: "relative", zIndex: 2 }}>{children}</span>
    </span>
  );
};

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const RedString: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  startFrame?: number;
  durationFrames?: number;
}> = ({ x1, y1, x2, y2, startFrame = 0, durationFrames = 15 }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const currentX2 = interpolate(progress, [0, 1], [x1, x2]);
  const currentY2 = interpolate(progress, [0, 1], [y1, y2]);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 15,
      }}
    >
      <defs>
        <filter id="stringShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={currentX2}
        y2={currentY2}
        stroke="#D62828"
        strokeWidth="3.5"
        strokeLinecap="round"
        filter="url(#stringShadow)"
      />
    </svg>
  );
};

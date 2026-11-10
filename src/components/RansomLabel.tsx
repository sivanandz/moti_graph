import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const RansomLabel: React.FC<{
  text: string;
  stripColor?: "black" | "yellow" | "none";
  size?: number;
  rotation?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  stripColor = "black",
  size = 20,
  rotation = -1,
  style = {},
}) => {
  const chars = text.split("");
  const bg =
    stripColor === "black"
      ? "#141414"
      : stripColor === "yellow"
      ? "#F2B705"
      : "transparent";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: bg,
        padding: stripColor === "none" ? "0px" : "8px 18px",
        transform: `rotate(${rotation}deg)`,
        boxShadow:
          stripColor === "none" ? "none" : "0 8px 18px rgba(0,0,0,0.42)",
        clipPath:
          stripColor === "none"
            ? undefined
            : "polygon(0% 4%, 99% 0%, 100% 94%, 1% 100%)",
        gap: "4px",
        ...style,
      }}
    >
      {chars.map((ch, idx) => {
        if (ch === " ") {
          return <span key={idx} style={{ width: `${size * 0.55}px` }} />;
        }
        // Deterministic per-character paper-cutout jitter (Ref 1)
        const rot = ((idx * 7) % 7) - 3;
        const dy = ((idx * 5) % 5) - 2;
        return (
          <span
            key={idx}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F6F3EA",
              color: "#141414",
              fontFamily: "Courier New, Courier, monospace",
              fontWeight: 900,
              fontSize: `${size}px`,
              lineHeight: 1,
              padding: "4px 5px",
              border: "1px solid rgba(0,0,0,0.22)",
              boxShadow: "1px 2px 4px rgba(0,0,0,0.35)",
              transform: `rotate(${rot}deg) translateY(${dy}px)`,
              textTransform: "lowercase",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const DashedHandArrow: React.FC<{
  color?: string;
  flip?: boolean;
  style?: React.CSSProperties;
}> = ({ color = "#A8A638", flip = false, style = {} }) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [4, 24], [220, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      width="130"
      height="180"
      viewBox="0 0 130 180"
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
        filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
        ...style,
      }}
    >
      <path
        d="M95,12 C110,58 88,118 32,158"
        fill="none"
        stroke={color}
        strokeWidth="5.5"
        strokeDasharray="14 12"
        strokeDashoffset={draw}
        strokeLinecap="round"
      />
      <path
        d="M48,162 L26,162 L34,140"
        fill="none"
        stroke={color}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={f > 18 ? 1 : 0}
      />
    </svg>
  );
};

export const CharcoalScribble: React.FC<{
  size?: number;
  style?: React.CSSProperties;
}> = ({ size = 130, style = {} }) => {
  const f = useCurrentFrame();
  const dash = interpolate(f, [6, 28], [900, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{
        opacity: 0.88,
        ...style,
      }}
    >
      <path
        d="M95,38 C148,28 176,82 142,128 C108,174 36,158 42,102 C48,46 124,22 156,74 C188,126 118,184 66,152 C14,120 44,44 106,52 C168,60 152,144 92,146 C32,148 56,68 112,76"
        fill="none"
        stroke="#232323"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeDasharray="900"
        strokeDashoffset={dash}
      />
    </svg>
  );
};

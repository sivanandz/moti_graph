import React from "react";
import { AbsoluteFill } from "remotion";

export const PaperBackground: React.FC<{
  type?: "kraft" | "grid" | "newsprint";
}> = ({ type = "kraft" }) => {
  const bgColors = {
    kraft: "#EFE6D8",
    grid: "#F8F6F0",
    newsprint: "#E5E3DD",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColors[type],
        backgroundImage:
          type === "grid"
            ? "radial-gradient(#C4BEB1 1px, transparent 1px)"
            : "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
        backgroundSize: type === "grid" ? "32px 32px" : "48px 48px",
        overflow: "hidden",
      }}
    >
      {/* Subtle vignette / paper age overlay */}
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 120px rgba(70, 50, 20, 0.12)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

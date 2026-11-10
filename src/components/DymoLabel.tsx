import React from "react";

export const DymoLabel: React.FC<{
  text: string;
  size?: "sm" | "md" | "lg";
  rotation?: number;
  color?: string;
  bgColor?: string;
}> = ({
  text,
  size = "md",
  rotation = 0,
  color = "#FFFFFF",
  bgColor = "#141414",
}) => {
  const fontSizes = { sm: 14, md: 20, lg: 32 };
  const paddings = { sm: "2px 8px", md: "4px 12px", lg: "8px 18px" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: bgColor,
        color,
        fontFamily: "'Courier New', Courier, monospace",
        fontWeight: "bold",
        fontSize: `${fontSizes[size]}px`,
        letterSpacing: "4px",
        padding: paddings[size],
        transform: `rotate(${rotation}deg)`,
        boxShadow: "0 2px 5px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "2px",
        textTransform: "uppercase",
        userSelect: "none",
      }}
    >
      {text}
    </span>
  );
};

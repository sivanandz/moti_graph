import React from "react";

export const DecklePaper: React.FC<{
  children: React.ReactNode;
  bgColor?: string;
  width?: number | string;
  padding?: string;
  rotation?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  bgColor = "#FAF8F2",
  width = "auto",
  padding = "32px",
  rotation = 0,
  style = {},
}) => {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        width,
        padding,
        transform: `rotate(${rotation}deg)`,
        position: "relative",
        boxShadow:
          "0 20px 40px -10px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)",
        border: "1px solid #D5D0C5",
        ...style,
      }}
    >
      {/* Torn fibrous top edge accent */}
      <div
        style={{
          position: "absolute",
          top: -3,
          left: 0,
          right: 0,
          height: 4,
          background:
            "radial-gradient(circle, transparent 2px, #FAF8F2 2px)",
          backgroundSize: "6px 6px",
        }}
      />
      {children}
    </div>
  );
};

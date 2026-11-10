import React from "react";

export const ScotchTape: React.FC<{
  width?: number;
  height?: number;
  rotation?: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
}> = ({
  width = 90,
  height = 28,
  rotation = -4,
  top,
  left,
  right,
  bottom,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "rgba(245, 238, 205, 0.65)",
        backdropFilter: "blur(1px)",
        transform: `rotate(${rotation}deg)`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        zIndex: 20,
        pointerEvents: "none",
        borderLeft: "2px dashed rgba(190, 180, 150, 0.4)",
        borderRight: "2px dashed rgba(190, 180, 150, 0.4)",
      }}
    >
      {/* Specular tape bubble highlight */}
      <div
        style={{
          width: "100%",
          height: "30%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.4), transparent)",
        }}
      />
    </div>
  );
};

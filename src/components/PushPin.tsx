import React from "react";

export const PushPin: React.FC<{
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  color?: "brass" | "red" | "silver";
}> = ({ top, left, right, bottom, color = "brass" }) => {
  const gradients = {
    brass: "radial-gradient(circle at 35% 35%, #F4D06F, #AA7C11 70%, #5E4102)",
    red: "radial-gradient(circle at 35% 35%, #FF6B6B, #D62828 70%, #660708)",
    silver: "radial-gradient(circle at 35% 35%, #FFFFFF, #A8B2C1 70%, #4B5563)",
  };

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      {/* Pin Head */}
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: gradients[color],
          boxShadow:
            "3px 6px 8px rgba(0, 0, 0, 0.45), inset 1px 1px 2px rgba(255, 255, 255, 0.8)",
          border: "1px solid rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
};

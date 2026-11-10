import React from "react";
import { Img, staticFile } from "remotion";

export const HalftoneCutout: React.FC<{
  src?: string;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  rotation?: number;
  sliceBand?: boolean; // Deprecated: preserved for API compatibility, never blocks image
  paperclipPosition?: "left" | "top-right" | "none";
  accentColor?: string;
}> = ({
  src,
  children,
  width = "100%",
  height = 380,
  rotation = -1.2,
  sliceBand = false,
  paperclipPosition = "left",
  accentColor = "#F2B705",
}) => {

  return (
    <div
      style={{
        position: "relative",
        width,
        transform: `rotate(${rotation}deg)`,
        filter: "drop-shadow(0 18px 28px rgba(0, 0, 0, 0.52))",
      }}
    >
      {/* Thick Hand-Scissored White Paper Outline (#FFFFFF, 12px polygonal contour — Refs 2 & 3) */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "13px",
          clipPath:
            "polygon(1.5% 0.5%, 28% 0%, 64% 1.2%, 98.5% 0%, 100% 24%, 99.2% 68%, 100% 98.5%, 74% 100%, 32% 99%, 0% 99.5%, 0.8% 58%, 0% 19%)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Inner B&W Coarse Newspaper Halftone Container */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height,
            backgroundColor: "#DCD9D0",
            overflow: "hidden",
            filter: "grayscale(100%) contrast(1.34) brightness(1.03)",
          }}
        >
          {src ? (
            <Img
              src={staticFile(src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            children
          )}

          {/* Coarse Newspaper Ben-Day Halftone Dot Screen Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(16, 16, 16, 0.36) 1.25px, transparent 1.45px)",
              backgroundSize: "4px 4px",
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />

          {/* Subtle Newsprint Paper Fibrous Grain & Fold Crease */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(112deg, transparent 48%, rgba(255,255,255,0.22) 49.5%, rgba(0,0,0,0.18) 50.5%, transparent 52%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Physical Silver Wire Paperclip Slipped Onto the Cutout Edge (Ref 3 Teddy Roosevelt Cutout) */}
      {paperclipPosition !== "none" && (
        <svg
          width="110"
          height="54"
          viewBox="0 0 110 54"
          style={{
            position: "absolute",
            top: paperclipPosition === "left" ? "44%" : "-18px",
            left: paperclipPosition === "left" ? "-26px" : undefined,
            right: paperclipPosition === "top-right" ? "28px" : undefined,
            transform:
              paperclipPosition === "left" ? "rotate(-12deg)" : "rotate(78deg)",
            filter: "drop-shadow(2px 5px 6px rgba(0,0,0,0.5))",
            zIndex: 8,
          }}
        >
          <path
            d="M16,18 L86,18 C98,18 98,38 86,38 L26,38 C14,38 14,24 26,24 L76,24"
            fill="none"
            stroke="#E2E7EC"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M16,18 L86,18 C98,18 98,38 86,38"
            fill="none"
            stroke="#9BA4AE"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
};

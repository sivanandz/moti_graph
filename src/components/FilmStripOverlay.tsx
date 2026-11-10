import React from "react";
import { useCurrentFrame } from "remotion";

export const FilmStripOverlay: React.FC<{
  timecode?: string;
  label?: string;
}> = ({ timecode = "00:00:32:13", label = "ARCHIVAL EVIDENCE DISPATCH" }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#111111",
        color: "#FFFFFF",
        padding: "10px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "14px",
        letterSpacing: "2px",
        borderTop: "3px solid #D62828",
        zIndex: 40,
        boxShadow: "0 -8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span style={{ color: "#FFEA00", fontWeight: "bold" }}>● REC [35MM]</span>
        <span style={{ opacity: 0.7 }}>FRM: {String(frame).padStart(4, "0")}</span>
        <span style={{ opacity: 0.9 }}>{label}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <span style={{ opacity: 0.6 }}>TC: {timecode}</span>
        <span style={{ color: "#D62828" }}>▲ VOX ARCHIVE</span>
      </div>
    </div>
  );
};

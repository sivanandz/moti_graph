import React from "react";
import { AbsoluteFill } from "remotion";

export type SurfaceMode = "cutting-mat" | "slate-collage" | "sage-clipboard";

export const CuttingMatBackground: React.FC<{
  mode?: SurfaceMode;
  sceneSeed?: number;
}> = ({ mode = "cutting-mat", sceneSeed = 1 }) => {
  if (mode === "slate-collage") {
    return (
      <AbsoluteFill style={{ backgroundColor: "#3B4652", overflow: "hidden" }}>
        {/* Fine matte cardstock fiber grain */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0), radial-gradient(rgba(0,0,0,0.12) 1px, transparent 0)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 8px 8px",
          }}
        />
        {/* Torn Vintage Book / Poetry Page Backing (Ref 1 style) */}
        <div
          style={{
            position: "absolute",
            top: "11%",
            left: "7%",
            width: "76%",
            height: "62%",
            backgroundColor: "#EAE0C8",
            transform: `rotate(${sceneSeed % 2 === 0 ? -6.5 : -8.5}deg)`,
            boxShadow: "0 18px 36px rgba(0,0,0,0.45)",
            clipPath:
              "polygon(2% 4%, 18% 1%, 39% 3%, 66% 0%, 89% 4%, 98% 12%, 96% 38%, 99% 68%, 94% 95%, 71% 98%, 42% 96%, 12% 99%, 3% 88%, 0% 52%, 4% 24%)",
            padding: "48px 44px",
            boxSizing: "border-box",
            opacity: 0.94,
          }}
        >
          {/* Faint archival printed poetry/index lines & page numbers like Ref 1 */}
          <div
            style={{
              fontFamily: "Georgia, Times New Roman, serif",
              fontSize: "15px",
              color: "rgba(35, 30, 24, 0.55)",
              lineHeight: 1.9,
              letterSpacing: "0.5px",
              userSelect: "none",
            }}
          >
            <div style={{ fontWeight: "bold", letterSpacing: "2px", marginBottom: "8px" }}>
              ARCHIVAL REGISTER · DOSSIER {1900 + sceneSeed * 7}
            </div>
            {[55, 81, 96, 114, 142, 161, 163, 164, 166, 190].map((pg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px dotted rgba(40,35,28,0.22)",
                }}
              >
                <span>§ {idx + 1}. FOLIO RECORD &amp; LEDGER ENTRY . . . . . . . . .</span>
                <span>{pg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cadmium Yellow Constructivist Torn Strip at Top-Left (Ref 1) */}
        <div
          style={{
            position: "absolute",
            top: "3%",
            left: "16%",
            width: "110px",
            height: "240px",
            backgroundColor: "#F2B705",
            transform: "rotate(4deg)",
            clipPath: "polygon(12% 0%, 92% 4%, 100% 96%, 4% 100%, 0% 35%)",
            boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
          }}
        />

        {/* Black Crumpled Tissue / Construction Paper Mass at Bottom-Right (Ref 1) */}
        <div
          style={{
            position: "absolute",
            bottom: "4%",
            right: "3%",
            width: "260px",
            height: "320px",
            backgroundColor: "#141414",
            clipPath:
              "polygon(18% 6%, 64% 0%, 96% 18%, 100% 62%, 86% 98%, 24% 100%, 0% 76%, 8% 34%)",
            boxShadow: "-10px 14px 28px rgba(0,0,0,0.55)",
            opacity: 0.9,
          }}
        />
      </AbsoluteFill>
    );
  }

  if (mode === "sage-clipboard") {
    return (
      <AbsoluteFill style={{ backgroundColor: "#C8CCC1", overflow: "hidden" }}>
        {/* Stacked Halftone Graph-Grid Sheet with Thick White Cutout Outline (Ref 2) */}
        <div
          style={{
            position: "absolute",
            top: "7%",
            left: "6%",
            width: "84%",
            height: "74%",
            backgroundColor: "#FFFFFF",
            padding: "14px",
            transform: "rotate(-1.5deg)",
            boxShadow: "0 18px 38px rgba(0,0,0,0.22)",
            clipPath:
              "polygon(0% 2%, 98% 0%, 100% 97%, 88% 100%, 3% 99%, 0% 84%)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#EAE8E1",
              backgroundImage: `
                linear-gradient(to right, rgba(40,40,38,0.18) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(40,40,38,0.18) 1px, transparent 1px),
                radial-gradient(rgba(20,20,20,0.22) 1px, transparent 1.2px)
              `,
              backgroundSize: "28px 28px, 28px 28px, 5px 5px",
              position: "relative",
            }}
          >
            {/* Halftone Metal Binder Clip at Top Center (Ref 2) */}
            <svg
              width="140"
              height="90"
              viewBox="0 0 140 90"
              style={{
                position: "absolute",
                top: "-26px",
                left: "50%",
                transform: "translateX(-50%)",
                filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
              }}
            >
              <path
                d="M55,48 C42,8 98,8 85,48"
                fill="none"
                stroke="#222222"
                strokeWidth="4.5"
              />
              <rect x="18" y="44" width="104" height="32" rx="3" fill="#1E1E1E" stroke="#FFFFFF" strokeWidth="3" />
              <rect x="26" y="52" width="88" height="6" fill="#7A7A76" />
              <circle cx="24" cy="110" r="8" fill="#2A2A2A" />
            </svg>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // Default Mode: "cutting-mat" — Dark Teal Self-Healing Cutting Mat (Ref 3)
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 45%, #1B4657 0%, #11313F 68%, #0B222C 100%)",
        overflow: "hidden",
      }}
    >
      {/* Fine Architectural & Cutting Mat Grid Lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(135, 218, 238, 0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(135, 218, 238, 0.22) 1px, transparent 1px),
            linear-gradient(to right, rgba(135, 218, 238, 0.09) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(135, 218, 238, 0.09) 1px, transparent 1px)
          `,
          backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
        }}
      />

      {/* Protractor Angle Arcs, Radial Degree Lines & Crosshairs (Ref 3) */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1080 1920"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, opacity: 0.34 }}
      >
        {/* Concentric cutting-mat protractor circles */}
        <circle cx="540" cy="960" r="460" fill="none" stroke="#87DAEE" strokeWidth="1.5" strokeDasharray="8 6" />
        <circle cx="540" cy="960" r="320" fill="none" stroke="#87DAEE" strokeWidth="1" />
        <circle cx="120" cy="1680" r="380" fill="none" stroke="#87DAEE" strokeWidth="1.5" />
        <circle cx="120" cy="1680" r="260" fill="none" stroke="#87DAEE" strokeWidth="1" strokeDasharray="4 4" />
        {/* Diagonal 30/45/60 degree radial measurement lines */}
        <line x1="0" y1="1420" x2="1080" y2="500" stroke="#87DAEE" strokeWidth="1" strokeDasharray="10 8" />
        <line x1="0" y1="500" x2="1080" y2="1420" stroke="#87DAEE" strokeWidth="1" strokeDasharray="10 8" />
      </svg>

      {/* Overhead Desk Tool Props Framing the Corners (Ref 3: Tailor's Shears Top-Left, Pen Top-Right, Paperclip Bottom-Right) */}
      {/* Top-Left Metal Tailor's Shears / Scissors */}
      <svg
        width="230"
        height="210"
        viewBox="0 0 230 210"
        style={{
          position: "absolute",
          top: "-18px",
          left: "-22px",
          filter: "drop-shadow(8px 14px 16px rgba(0,0,0,0.65))",
          opacity: 0.92,
        }}
      >
        <g transform="rotate(-18 100 100)">
          <polygon points="95,88 225,25 215,44 90,102" fill="#8C969E" />
          <polygon points="95,96 220,145 206,160 88,106" fill="#68727A" />
          <circle cx="102" cy="98" r="7" fill="#222" />
          <ellipse cx="48" cy="64" rx="34" ry="22" transform="rotate(-20 48 64)" fill="none" stroke="#181C20" strokeWidth="14" />
          <ellipse cx="46" cy="128" rx="34" ry="22" transform="rotate(22 46 128)" fill="none" stroke="#181C20" strokeWidth="14" />
        </g>
      </svg>

      {/* Top-Right Overhead Black Technical Marker Pen (Ref 3) */}
      <svg
        width="160"
        height="240"
        viewBox="0 0 160 240"
        style={{
          position: "absolute",
          top: "-20px",
          right: "-15px",
          filter: "drop-shadow(-6px 12px 14px rgba(0,0,0,0.6))",
          opacity: 0.9,
        }}
      >
        <g transform="rotate(32 80 120)">
          <rect x="68" y="10" width="22" height="190" rx="4" fill="#16181A" />
          <rect x="66" y="140" width="26" height="48" rx="2" fill="#282C30" />
          <line x1="62" y1="145" x2="62" y2="185" stroke="#8C969E" strokeWidth="3.5" />
          <polygon points="69,200 89,200 79,224" fill="#8C969E" />
        </g>
      </svg>

      {/* Bottom-Right Loose Silver Wire Paperclip on Mat (Ref 3) */}
      <svg
        width="90"
        height="110"
        viewBox="0 0 90 110"
        style={{
          position: "absolute",
          bottom: "24px",
          right: "28px",
          filter: "drop-shadow(3px 6px 8px rgba(0,0,0,0.55))",
          opacity: 0.85,
        }}
      >
        <path
          d="M35,85 L22,30 C18,14 44,10 48,26 L60,82 C63,94 44,98 41,84 L32,42 C30,32 44,30 46,40 L53,72"
          fill="none"
          stroke="#D0D7DC"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Subtle Radial Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 140px rgba(0, 0, 0, 0.55)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

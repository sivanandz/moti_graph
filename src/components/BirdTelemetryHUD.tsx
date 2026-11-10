import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

interface BirdTelemetryHUDProps {
  frame: number;
  time: number;
  velocity: number; // m/s
  gamma: number;
  currentBeatText: string;
}

const SPEED_OF_LIGHT = 299_792_458;

export const BirdTelemetryHUD: React.FC<BirdTelemetryHUDProps> = ({
  frame,
  time,
  velocity,
  gamma,
  currentBeatText,
}) => {
  const { fps } = useVideoConfig();

  // Speed formatting logic
  let speedValueText = "";
  let speedUnitText = "";
  let speedSubtitle = "";

  if (frame < 270) {
    const mph = (velocity * 2.23694).toFixed(1);
    speedValueText = `${mph}`;
    speedUnitText = "MPH";
    speedSubtitle = `${velocity.toFixed(1)} m/s`;
  } else if (frame < 529) {
    const mach = (velocity / 343).toFixed(2);
    speedValueText = `MACH ${mach}`;
    speedUnitText = "SUPERSONIC";
    speedSubtitle = `${(velocity * 3.6).toFixed(0)} km/h`;
  } else if (frame < 864) {
    const mach = (velocity / 343).toFixed(1);
    speedValueText = `MACH ${mach}`;
    speedUnitText = "HYPERSONIC";
    speedSubtitle = `${(velocity / 1000).toFixed(1)} km/s`;
  } else if (frame < 1293) {
    const pctC = ((velocity / SPEED_OF_LIGHT) * 100).toFixed(3);
    speedValueText = `${pctC}%`;
    speedUnitText = "SPEED OF LIGHT (c)";
    speedSubtitle = `${(velocity / 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })} km/s`;
  } else {
    const pctC = ((velocity / SPEED_OF_LIGHT) * 100).toFixed(5);
    speedValueText = `${pctC}%`;
    speedUnitText = "SPEED OF LIGHT (c)";
    speedSubtitle = `γ = ${gamma.toFixed(3)}`;
  }

  // Stagnation temperature calculation
  let tempDisplay = "22 °C";
  if (frame >= 270 && frame < 529) {
    tempDisplay = "180 °C";
  } else if (frame >= 529 && frame < 864) {
    tempDisplay = "4,200 K";
  } else if (frame >= 864 && frame < 1293) {
    tempDisplay = "15,000,000 K (FUSION)";
  } else if (frame >= 1293) {
    tempDisplay = "BLUESHIFT GAMMA";
  }

  // Time dilation factor display
  let timeDilationDisplay = "1.00s : 1.00s";
  if (gamma > 1.05 && gamma < 2) {
    timeDilationDisplay = `1s : ${gamma.toFixed(2)}s`;
  } else if (gamma >= 2 && gamma < 10) {
    timeDilationDisplay = `1s : ${(gamma * 60).toFixed(0)}s (Earth)`;
  } else if (gamma >= 10) {
    timeDilationDisplay = `1s : ${(gamma * 3.2).toFixed(1)} days (Earth)`;
  }

  // Flap count
  const flapCount = Math.floor(
    frame < 270
      ? time * 4
      : frame < 864
      ? 36 + (frame - 270) * 0.4
      : 270 + (frame - 864) * 0.8
  );

  // Active milestone alerts
  let activeAlert: { title: string; subtitle: string; color: string } | null = null;
  if (frame >= 270 && frame < 360) {
    activeAlert = {
      title: "⚠️ TRANSONIC BARRIER BREACHED",
      subtitle: "PRANDTL-GLAUERT VAPOR CONE DETECTED • MACH 1.0",
      color: "#F59E0B",
    };
  } else if (frame >= 529 && frame < 630) {
    activeAlert = {
      title: "🔥 HYPERSONIC PLASMA ENVELOPE",
      subtitle: "ATMOSPHERIC IONIZATION • STAGNATION TEMP 4,200K",
      color: "#EF4444",
    };
  } else if (frame >= 864 && frame < 980) {
    activeAlert = {
      title: "☢️ THERMONUCLEAR FUSION RAMJET",
      subtitle: "ATMOSPHERIC NITROGEN COLLISION FUSION • 0.01c",
      color: "#10B981",
    };
  } else if (frame >= 1293 && frame < 1400) {
    activeAlert = {
      title: "🌌 ESCAPE VELOCITY ACHIEVED",
      subtitle: "LEAVING EARTH ATMOSPHERE • VACUUM FLIGHT",
      color: "#3B82F6",
    };
  } else if (frame >= 1610 && frame < 1740) {
    activeAlert = {
      title: "⚡ RELATIVISTIC OPTICAL HORIZON",
      subtitle: "LORENTZ CONTRACTION & TERRELL-PENROSE ABERRATION",
      color: "#00F0FF",
    };
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        padding: "80px 50px 70px 50px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        pointerEvents: "none",
        fontFamily: "'Courier New', Courier, monospace, sans-serif",
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & METADATA BAR                                   */}
      {/* ------------------------------------------------------------- */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            background: "rgba(10, 18, 30, 0.78)",
            border: "1px solid rgba(0, 240, 255, 0.35)",
            borderRadius: 8,
            backdropFilter: "blur(8px)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#00F0FF",
                letterSpacing: 2,
              }}
            >
              [ THOUGHT EXPERIMENT: AVIAN ACCELERATION ]
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#94A3B8",
                marginTop: 4,
                letterSpacing: 1,
              }}
            >
              SUBJECT: INDESTRUCTIBLE PIGEON (COLUMBA LIVIA)
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, color: "#F8FAFC", fontWeight: "bold" }}>
              T+{time.toFixed(2)}s
            </div>
            <div style={{ fontSize: 13, color: "#38BDF8", marginTop: 4 }}>
              FRAME: {frame.toString().padStart(4, "0")}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. PRIMARY SPEEDOMETER & TELEMETRY GAUGES                    */}
        {/* ------------------------------------------------------------- */}
        <div
          style={{
            marginTop: 24,
            padding: "24px 30px",
            background: "rgba(8, 14, 26, 0.82)",
            border: "1px solid rgba(0, 240, 255, 0.4)",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0, 240, 255, 0.15)",
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "#38BDF8",
              letterSpacing: 3,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            CURRENT RUNNER VELOCITY
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginTop: 8,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: frame >= 1293 ? "#00F0FF" : frame >= 529 ? "#FBBF24" : "#FFFFFF",
                textShadow: "0 0 20px rgba(0, 240, 255, 0.5)",
                lineHeight: 1,
                letterSpacing: -1,
              }}
            >
              {speedValueText}
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#00F0FF",
                letterSpacing: 2,
              }}
            >
              {speedUnitText}
            </div>
          </div>

          <div
            style={{
              fontSize: 18,
              color: "#94A3B8",
              marginTop: 6,
              letterSpacing: 1,
            }}
          >
            {speedSubtitle}
          </div>

          {/* Speed Progress Bar */}
          <div
            style={{
              marginTop: 18,
              width: "100%",
              height: 10,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(2, (velocity / SPEED_OF_LIGHT) * 100))}%`,
                height: "100%",
                background:
                  frame >= 1293
                    ? "linear-gradient(90deg, #3B82F6, #00F0FF)"
                    : frame >= 529
                    ? "linear-gradient(90deg, #F59E0B, #EF4444)"
                    : "linear-gradient(90deg, #10B981, #38BDF8)",
                boxShadow: "0 0 10px #00F0FF",
              }}
            />
          </div>

          {/* Sub-Metrics 3-Column Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#64748B", letterSpacing: 1 }}>
                LORENTZ FACTOR (γ)
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: gamma > 2 ? "#00F0FF" : "#F8FAFC",
                  marginTop: 4,
                }}
              >
                {gamma.toFixed(4)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#64748B", letterSpacing: 1 }}>
                STAGNATION TEMP
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: frame >= 864 ? "#10B981" : frame >= 529 ? "#EF4444" : "#F8FAFC",
                  marginTop: 4,
                }}
              >
                {tempDisplay}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#64748B", letterSpacing: 1 }}>
                TOTAL WING FLAPS
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#38BDF8",
                  marginTop: 4,
                }}
              >
                {flapCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CENTER MILESTONE WARNING BANNER (When Active)             */}
      {/* ------------------------------------------------------------- */}
      {activeAlert && (
        <div
          style={{
            alignSelf: "center",
            width: "90%",
            padding: "20px 24px",
            background: "rgba(15, 23, 42, 0.92)",
            border: `2px solid ${activeAlert.color}`,
            borderRadius: 12,
            boxShadow: `0 0 35px ${activeAlert.color}55`,
            textAlign: "center",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: activeAlert.color,
              letterSpacing: 2,
            }}
          >
            {activeAlert.title}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#E2E8F0",
              marginTop: 6,
              letterSpacing: 1,
            }}
          >
            {activeAlert.subtitle}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. LOWER CAPTION & NARRATIVE SUBTITLE BAR                     */}
      {/* ------------------------------------------------------------- */}
      <div>
        <div
          style={{
            padding: "20px 28px",
            background: "rgba(10, 15, 26, 0.88)",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            borderRadius: 12,
            backdropFilter: "blur(10px)",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#38BDF8",
                letterSpacing: 2,
                fontWeight: "bold",
              }}
            >
              [ SCIENTIFIC NARRATIVE LOG ]
            </span>
            <span style={{ fontSize: 12, color: "#64748B" }}>
              TIME DILATION: {timeDilationDisplay}
            </span>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              lineHeight: 1.4,
              color: "#F8FAFC",
              letterSpacing: 0.5,
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            "{currentBeatText}"
            <span
              style={{
                color: "#00F0FF",
                fontWeight: "bold",
                opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
              }}
            >
              _
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

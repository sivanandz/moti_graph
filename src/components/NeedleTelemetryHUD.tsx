import React from "react";
import { NeedlePhysicsState } from "./physics/NeedlePhysics";

interface NeedleTelemetryHUDProps {
  physics: NeedlePhysicsState;
  frame: number;
  time: number;
  currentBeatText: string;
}

export const NeedleTelemetryHUD: React.FC<NeedleTelemetryHUDProps> = ({
  physics,
  frame,
  time,
  currentBeatText,
}) => {
  const {
    beta,
    gamma,
    contractedLengthMicrons,
    kineticEnergyJoules,
    energyKilotonTNT,
    transitTimeMicroseconds,
    beatIndex,
    perspective,
  } = physics;

  // Formatting helpers
  const betaPercent = (beta * 100).toFixed(4);
  const gammaStr = gamma > 100 ? gamma.toFixed(1) : gamma.toFixed(2);
  const lengthStr =
    beatIndex === 1 && frame < 200
      ? "50.0 mm"
      : `${contractedLengthMicrons.toFixed(1)} μm`;
  const energyStr =
    beatIndex === 1 && frame < 200
      ? "0.01 J"
      : `${(kineticEnergyJoules / 1e12).toFixed(1)} TJ`;
  const tntStr =
    beatIndex === 1 && frame < 200
      ? "0.00 kt"
      : `${energyKilotonTNT.toFixed(2)} kt`;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 36px",
        boxSizing: "border-box",
        fontFamily: "'Courier New', Courier, monospace",
        zIndex: 50,
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP SCIENTIFIC HUD BAR (Minimalist Whatfinity Benchmark)   */}
      {/* ------------------------------------------------------------- */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
            paddingBottom: "12px",
            marginBottom: "14px",
          }}
        >
          {/* Mission / Topic Identifier */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  perspective === "GROUND"
                    ? "#22C55E"
                    : perspective === "SIMULATOR"
                    ? "#38BDF8"
                    : "#EF4444",
                boxShadow: "0 0 10px currentColor",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                letterSpacing: "0.14em",
                color: "#F8FAFC",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              PHYSICS SIMULATOR // {perspective}
            </span>
          </div>

          {/* Time & FPS indicator */}
          <div
            style={{
              fontSize: "13px",
              color: "#94A3B8",
              letterSpacing: "0.08em",
            }}
          >
            T+{(time).toFixed(2)}s | 30 FPS
          </div>
        </div>

        {/* Telemetry Metric Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            fontSize: "12px",
          }}
        >
          {/* Metric 1: Velocity */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "4px",
              padding: "8px 10px",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ color: "#64748B", fontSize: "10px", marginBottom: "3px" }}>
              VELOCITY (v)
            </div>
            <div style={{ color: "#38BDF8", fontWeight: 700, fontSize: "14px" }}>
              {betaPercent}% c
            </div>
          </div>

          {/* Metric 2: Lorentz Factor γ */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "4px",
              padding: "8px 10px",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ color: "#64748B", fontSize: "10px", marginBottom: "3px" }}>
              LORENTZ (γ)
            </div>
            <div style={{ color: "#F8FAFC", fontWeight: 700, fontSize: "14px" }}>
              {gammaStr}
            </div>
          </div>

          {/* Metric 3: Contracted Length */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "4px",
              padding: "8px 10px",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ color: "#64748B", fontSize: "10px", marginBottom: "3px" }}>
              LENGTH (L)
            </div>
            <div style={{ color: "#FCD34D", fontWeight: 700, fontSize: "14px" }}>
              {lengthStr}
            </div>
          </div>

          {/* Metric 4: Yield */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "4px",
              padding: "8px 10px",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ color: "#64748B", fontSize: "10px", marginBottom: "3px" }}>
              YIELD (TNT)
            </div>
            <div
              style={{
                color: energyKilotonTNT > 5 ? "#EF4444" : "#A7F3D0",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {tntStr}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CENTER CANVAS: OPEN & UNCLUTTERED (70% breathing room)    */}
      {/* ------------------------------------------------------------- */}
      <div style={{ flex: 1 }} />

      {/* ------------------------------------------------------------- */}
      {/* 3. BOTTOM NARRATION CAPTION (Floating Glass Pill)             */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: "92%",
            background: "rgba(15, 23, 42, 0.82)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "12px",
            padding: "16px 22px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              lineHeight: "1.45",
              color: "#F8FAFC",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            {currentBeatText}
          </div>
        </div>

        {/* Minimalist Audio progress timeline */}
        <div
          style={{
            width: "60%",
            height: "2px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            marginTop: "16px",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min(100, (frame / 2522) * 100)}%`,
              height: "100%",
              backgroundColor: "#38BDF8",
              transition: "width 0.1s linear",
            }}
          />
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { getPhysicsState, SPEED_OF_LIGHT } from "./physics/RelativisticPhysics";

interface CleanHUDProps {
  frame: number;
  time: number;
  currentBeatText: string;
}

export const CleanScientificHUD: React.FC<CleanHUDProps> = ({
  frame,
  time,
  currentBeatText,
}) => {
  const physics = getPhysicsState(frame);
  const { velocity, beta, gamma, mach, machAngleDeg, stagnationTempK } = physics;

  // Primary Speed Value & Unit formatting
  let speedValue = "";
  let speedUnit = "";
  let physicsDetail = "";

  if (frame < 270) {
    const mph = (velocity * 2.23694).toFixed(1);
    speedValue = `${mph}`;
    speedUnit = "MPH";
    physicsDetail = `${(velocity * 3.6).toFixed(0)} km/h • Standard Aerodynamic Lift`;
  } else if (frame < 529) {
    speedValue = `MACH ${mach.toFixed(2)}`;
    speedUnit = "SUPERSONIC";
    physicsDetail = `Shock Angle μ: ${machAngleDeg.toFixed(1)}° • Prandtl-Glauert Cone`;
  } else if (frame < 864) {
    speedValue = `MACH ${mach.toFixed(1)}`;
    speedUnit = "HYPERSONIC";
    physicsDetail = `Stagnation Temp: ${stagnationTempK.toLocaleString("en-US", { maximumFractionDigits: 0 })} K • Plasma Sheath`;
  } else if (frame < 1293) {
    const pctC = ((velocity / SPEED_OF_LIGHT) * 100).toFixed(3);
    speedValue = `${pctC}% c`;
    speedUnit = "SUB-RELATIVISTIC";
    physicsDetail = `E_k: 47 keV/nucleon • Ram-Compression Fusion`;
  } else if (frame < 1610) {
    const pctC = ((velocity / SPEED_OF_LIGHT) * 100).toFixed(2);
    speedValue = `${pctC}% c`;
    speedUnit = "VACUUM FLIGHT";
    physicsDetail = `Earth Escape • Time Dilation: 1s = ${gamma.toFixed(2)}s`;
  } else {
    const pctC = ((velocity / SPEED_OF_LIGHT) * 100).toFixed(5);
    speedValue = `${pctC}% c`;
    speedUnit = "ULTRA-RELATIVISTIC";
    physicsDetail = `Lorentz γ: ${gamma.toFixed(3)} • Einstein Aberration Active`;
  }

  // Active subtle status badge in top-right
  let activeBadge = "NORMAL FLIGHT";
  let badgeColor = "#10B981";

  if (frame >= 270 && frame < 529) {
    activeBadge = "MACH 1.0 CONE";
    badgeColor = "#38BDF8";
  } else if (frame >= 529 && frame < 864) {
    activeBadge = "PLASMA SHEATH";
    badgeColor = "#F59E0B";
  } else if (frame >= 864 && frame < 1293) {
    activeBadge = "NUCLEAR FUSION";
    badgeColor = "#10B981";
  } else if (frame >= 1293 && frame < 1610) {
    activeBadge = "ORBITAL ESCAPE";
    badgeColor = "#818CF8";
  } else if (frame >= 1610) {
    activeBadge = "LORENTZ HORIZON";
    badgeColor = "#00F0FF";
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        padding: "80px 60px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        pointerEvents: "none",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP SCIENTIFIC TELEMETRY BAR (Clean, non-intrusive)            */}
      {/* ------------------------------------------------------------- */}
      <div>
        {/* Minimal header line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 16,
            borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: badgeColor,
                boxShadow: `0 0 10px ${badgeColor}`,
              }}
            />
            <span
              style={{
                fontSize: 13,
                letterSpacing: 2,
                color: "#94A3B8",
                fontWeight: 600,
              }}
            >
              PHYSICS SIMULATION // RELATIVISTIC FLIGHT
            </span>
          </div>

          <div
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${badgeColor}66`,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: badgeColor,
            }}
          >
            {activeBadge}
          </div>
        </div>

        {/* Primary Speed Display */}
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 76,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: -1,
                lineHeight: 1,
                textShadow: "0 2px 20px rgba(0,0,0,0.6)",
              }}
            >
              {speedValue}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: badgeColor,
                letterSpacing: 2,
              }}
            >
              {speedUnit}
            </div>
          </div>

          {/* Sub-telemetry physics readout */}
          <div
            style={{
              marginTop: 10,
              fontSize: 15,
              color: "#94A3B8",
              letterSpacing: 0.8,
            }}
          >
            {physicsDetail}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM FLOATING CAPTION PILL (Clean, legible, zero clutter)   */}
      {/* ------------------------------------------------------------- */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            padding: "24px 32px",
            background: "rgba(10, 15, 28, 0.75)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 16,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              lineHeight: 1.45,
              color: "#F8FAFC",
              letterSpacing: 0.3,
            }}
          >
            "{currentBeatText}"
            <span
              style={{
                color: badgeColor,
                fontWeight: "bold",
                opacity: Math.sin(frame * 0.35) > 0 ? 1 : 0,
              }}
            >
              _
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: 12,
              color: "#64748B",
              letterSpacing: 1,
            }}
          >
            <span>T+{time.toFixed(1)}s // FRAME {frame}</span>
            <span>c = 299,792,458 m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

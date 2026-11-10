import React, { useMemo } from "react";
import * as THREE from "three";
import { NeedlePhysicsState } from "../physics/NeedlePhysics";
import { RealisticNeedle3D } from "./RealisticNeedle3D";
import { PhotorealisticGroundReality3D } from "./PhotorealisticGroundReality3D";
import { AtmosphericBoreholeSimulator3D } from "./AtmosphericBoreholeSimulator3D";
import { PhysicalCrustDetonation3D } from "./PhysicalCrustDetonation3D";
import { ForensicImpactCrater3D } from "./ForensicImpactCrater3D";

interface DualPerspectiveWorld3DProps {
  physics: NeedlePhysicsState;
  frame: number;
  time: number;
}

export const DualPerspectiveWorld3D: React.FC<DualPerspectiveWorld3DProps> = ({
  physics,
  frame,
  time,
}) => {
  const { beatIndex, flashIntensity } = physics;

  // -----------------------------------------------------------------
  // 1. BEAT 1: Resting Needle Drop on Sleek Laboratory Obsidian Surface
  // -----------------------------------------------------------------
  const dropHeight = useMemo(() => {
    if (beatIndex !== 1) return 0;
    if (frame < 180) {
      const t = frame / 180;
      // Freefall under gravity: y = y0 - 0.5 * g * t^2
      return Math.max(0.08, 4.2 * (1 - t * t));
    }
    return 0.08;
  }, [beatIndex, frame]);

  // Dark obsidian laboratory bench
  const labFloorGeom = useMemo(() => {
    const geom = new THREE.PlaneGeometry(30, 30);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  return (
    <group>
      {/* ============================================================== */}
      {/* SCENE 1: BEAT 1 — Rest Needle Macro & Laboratory Surface       */}
      {/* ============================================================== */}
      {beatIndex === 1 && (
        <group>
          {/* Obsidian Reflective Lab Surface */}
          <mesh geometry={labFloorGeom} position={[0, -0.01, 0]}>
            <meshStandardMaterial
              color="#0B0F17"
              roughness={0.15}
              metalness={0.9}
            />
          </mesh>

          {/* Precision Laser Holographic Metric Grid */}
          <gridHelper
            args={[24, 48, "#38BDF8", "#1E293B"]}
            position={[0, 0.005, 0]}
          />

          {/* Dropping High-Poly Realistic Needle */}
          <group position={[0, dropHeight, 0]}>
            <RealisticNeedle3D physics={physics} frame={frame} />
          </group>

          {/* Soft Ground Contact Shadow */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[Math.max(0.15, 1.2 - dropHeight * 0.22), 32]} />
            <meshBasicMaterial
              color="#020617"
              transparent
              opacity={Math.max(0.12, 0.85 - dropHeight * 0.18)}
            />
          </mesh>
        </group>
      )}

      {/* ============================================================== */}
      {/* SCENE 2: BEAT 2 — Ground Reality: Photorealistic Sky & Meadow  */}
      {/* ============================================================== */}
      {beatIndex === 2 && (
        <PhotorealisticGroundReality3D
          frame={frame}
          time={time}
          flashIntensity={flashIntensity}
        />
      )}

      {/* ============================================================== */}
      {/* SCENE 3: BEAT 3 — Relativistic Simulator: 100km Fusion Borehole */}
      {/* ============================================================== */}
      {beatIndex === 3 && (
        <AtmosphericBoreholeSimulator3D
          physics={physics}
          frame={frame}
          time={time}
        />
      )}

      {/* ============================================================== */}
      {/* SCENE 4: BEAT 4 — Crust Detonation & 15.2 kt Kinetic Blast     */}
      {/* ============================================================== */}
      {beatIndex === 4 && (
        <PhysicalCrustDetonation3D
          physics={physics}
          frame={frame}
          time={time}
        />
      )}

      {/* ============================================================== */}
      {/* SCENE 5: BEAT 5 — 300m Forensic Impact Crater Basin Survey     */}
      {/* ============================================================== */}
      {beatIndex === 5 && (
        <ForensicImpactCrater3D frame={frame} time={time} />
      )}
    </group>
  );
};

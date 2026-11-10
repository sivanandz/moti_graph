import React, { useMemo } from "react";
import * as THREE from "three";
import { NeedlePhysicsState } from "../physics/NeedlePhysics";
import { createBrushedMetalTexture } from "./ProceduralTextures";

interface RealisticNeedle3DProps {
  physics: NeedlePhysicsState;
  frame: number;
}

export const RealisticNeedle3D: React.FC<RealisticNeedle3DProps> = ({
  physics,
  frame,
}) => {
  const { gamma, beta, beatIndex } = physics;

  // Real relativistic Lorentz contraction
  const lengthScale = useMemo(() => {
    if (beatIndex === 1) {
      if (frame < 200) return 1.0;
      return THREE.MathUtils.lerp(1.0, 1.0 / Math.min(gamma, 70), (frame - 200) / 188);
    }
    return 1.0 / Math.min(gamma, 75);
  }, [beatIndex, frame, gamma]);

  // Brushed metal normal texture
  const normalMap = useMemo(() => createBrushedMetalTexture(), []);

  // Needle dimensions: Length = 4.5 units (~5 cm), Radius = 0.08 units (~1 mm)
  const needleGeom = useMemo(() => {
    // Generate precision lathe curve for needle profile
    const points: THREE.Vector2[] = [];
    const segments = 48;

    // 1. Sharp surgical tip (Y = 2.25 down to 1.6)
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const y = 2.25 - t * 0.7; // From tip 2.25 down to 1.55
      const r = Math.pow(t, 0.75) * 0.075; // Sharp parabolic taper
      points.push(new THREE.Vector2(r, y));
    }

    // 2. Main cylindrical shank with thread groove (Y = 1.55 down to -1.5)
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = 1.55 - t * 3.05; // 1.55 down to -1.5
      // Subtle micro-variation in barrel
      const r = 0.075 + Math.sin(t * Math.PI) * 0.003;
      points.push(new THREE.Vector2(r, y));
    }

    // 3. Eyelet transition & flat head taper (Y = -1.5 down to -2.25)
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const y = -1.5 - t * 0.75;
      // Head flattens and tapers at the rear
      const r = Math.max(0.001, (1 - t * t) * 0.078);
      points.push(new THREE.Vector2(r, y));
    }

    const lathe = new THREE.LatheGeometry(points, 48);
    lathe.computeVertexNormals();
    return lathe;
  }, []);

  // Needle Eye Hole Rim Geometry (Elliptical beveled slot through head)
  const eyeletGeom = useMemo(() => {
    const shape = new THREE.Shape();
    // Elliptical outer slot
    const w = 0.038;
    const h = 0.28;
    shape.moveTo(-w, -h);
    shape.lineTo(w, -h);
    shape.bezierCurveTo(w + 0.015, -h * 0.5, w + 0.015, h * 0.5, w, h);
    shape.lineTo(-w, h);
    shape.bezierCurveTo(-w - 0.015, h * 0.5, -w - 0.015, -h * 0.5, -w, -h);

    // Inner hole
    const hole = new THREE.Path();
    const hw = 0.018;
    const hh = 0.22;
    hole.moveTo(-hw, -hh);
    hole.lineTo(hw, -hh);
    hole.bezierCurveTo(hw + 0.008, -hh * 0.5, hw + 0.008, hh * 0.5, hw, hh);
    hole.lineTo(-hw, hh);
    hole.bezierCurveTo(-hw - 0.008, hh * 0.5, -hw - 0.008, -hh * 0.5, -hw, -hh);
    shape.holes.push(hole);

    const extrudeSettings = {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  const isRelativistic = beta > 0.5;

  return (
    <group
      scale={[1, lengthScale, 1]}
      rotation={[0, 0, beatIndex === 1 ? Math.sin(frame * 0.02) * 0.12 : 0]}
    >
      {/* 1. Main High-Precision Lathe Needle Body */}
      <mesh geometry={needleGeom}>
        <meshStandardMaterial
          color={isRelativistic ? "#E0F2FE" : "#F1F5F9"}
          metalness={isRelativistic ? 0.3 : 0.98}
          roughness={isRelativistic ? 0.08 : 0.16}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.35, 0.35)}
          emissive={isRelativistic ? "#67E8F9" : "#000000"}
          emissiveIntensity={isRelativistic ? 2.5 : 0.0}
        />
      </mesh>

      {/* 2. Beveled Eyelet Opening at the rear (Y = -1.8) */}
      <mesh geometry={eyeletGeom} position={[0, -1.8, 0]}>
        <meshStandardMaterial
          color={isRelativistic ? "#BAE6FD" : "#CBD5E1"}
          metalness={0.95}
          roughness={0.2}
          emissive={isRelativistic ? "#38BDF8" : "#000000"}
          emissiveIntensity={isRelativistic ? 2.0 : 0.0}
        />
      </mesh>

      {/* 3. Relativistic Cerenkov Plasma Bow Shock (Beats 3 & 4) */}
      {isRelativistic && (
        <group scale={[1, 1 / lengthScale, 1]}>
          {/* Compressed ultra-relativistic plasma disc */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.32, 0.42, 0.035, 48]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.82}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Incandescent Diamond-White Core */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.15, 0.22, 0.038, 32]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={0.95}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Cerenkov Forward Radiation Light Source */}
          <pointLight
            color="#38BDF8"
            intensity={22}
            distance={16}
            decay={2}
            position={[0, 0.4, 0]}
          />
        </group>
      )}
    </group>
  );
};

import React, { useMemo } from "react";
import * as THREE from "three";
import { NeedlePhysicsState } from "../physics/NeedlePhysics";
import { RealisticNeedle3D } from "./RealisticNeedle3D";

interface AtmosphericBoreholeSimulator3DProps {
  physics: NeedlePhysicsState;
  frame: number;
  time: number;
}

export const AtmosphericBoreholeSimulator3D: React.FC<
  AtmosphericBoreholeSimulator3DProps
> = ({ physics, frame, time }) => {
  const { beta } = physics;

  // Borehole progression through atmosphere (frame 904 - 1602)
  const progress = useMemo(() => {
    return Math.min(1.0, (frame - 904) / 450);
  }, [frame]);

  // Atmospheric altitude levels: Karman line (100 km) down to surface (0 km)
  const atmosphericLevels = useMemo(() => {
    return [
      { name: "EXOSPHERE (100km)", y: 7.0, color: "#38BDF8", opacity: 0.15 },
      { name: "MESOSPHERE (50km)", y: 4.2, color: "#818CF8", opacity: 0.18 },
      { name: "STRATOSPHERE (20km)", y: 1.8, color: "#A855F7", opacity: 0.22 },
      { name: "TROPOSPHERE (10km)", y: -0.6, color: "#F59E0B", opacity: 0.28 },
    ];
  }, []);

  // Relativistic Doppler-blueshifted stars with Terrell-Penrose optical contraction
  const starsData = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Uncontracted spherical distribution
      const u = Math.random();
      const v = Math.random();
      const theta0 = Math.acos(2 * v - 1);
      const phi = 2 * Math.PI * u;

      // Einstein Aberration: cos(theta') = (cos(theta) - beta) / (1 - beta * cos(theta))
      const cosTheta0 = Math.cos(theta0);
      const cosThetaRel = (cosTheta0 - beta) / (1 - beta * cosTheta0);
      const thetaRel = Math.acos(Math.max(-1, Math.min(1, cosThetaRel)));

      const r = 45 + Math.random() * 25;
      positions[i * 3] = r * Math.sin(thetaRel) * Math.cos(phi);
      positions[i * 3 + 1] = r * Math.cos(thetaRel);
      positions[i * 3 + 2] = r * Math.sin(thetaRel) * Math.sin(phi);

      // Doppler shift: ahead (theta < pi/2) shifts to brilliant cyan/UV white
      if (thetaRel < Math.PI / 2) {
        colors[i * 3] = 0.6; // R
        colors[i * 3 + 1] = 0.9; // G
        colors[i * 3 + 2] = 1.0; // B
      } else {
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.45;
        colors[i * 3 + 2] = 0.25;
      }
    }
    return { positions, colors };
  }, [beta]);

  // Plasma ion sparks along borehole
  const ionSparks = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * progress;
      const y = 7.0 - t * 8.5;
      const rad = 0.05 + Math.random() * 0.45;
      const ang = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(ang) * rad;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(ang) * rad;
    }
    return positions;
  }, [progress]);

  const boreholeLength = Math.max(0.1, progress * 8.5);
  const boreholeCenterY = 7.0 - boreholeLength * 0.5;

  return (
    <group>
      {/* Relativistic Aberration Starfield */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starsData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[starsData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Atmospheric Stratification Boundary Rings */}
      {atmosphericLevels.map((lvl, idx) => (
        <group key={idx} position={[0, lvl.y, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.0, 9.5, 64]} />
            <meshBasicMaterial
              color={lvl.color}
              transparent
              opacity={lvl.opacity}
              side={THREE.DoubleSide}
              wireframe
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[9.4, 9.5, 64]} />
            <meshBasicMaterial
              color={lvl.color}
              transparent
              opacity={lvl.opacity * 2.5}
            />
          </mesh>
        </group>
      ))}

      {/* Hero Relativistic Needle Disc Tracking down the tube */}
      <group position={[0, 7.0 - progress * 8.5, 0]}>
        <RealisticNeedle3D physics={physics} frame={frame} />
      </group>

      {/* Hyper-Thermal Fusion Plasma Borehole Tube */}
      {progress > 0.02 && (
        <group>
          {/* Inner Incandescent Fusion Beam */}
          <mesh position={[0, boreholeCenterY, 0]}>
            <cylinderGeometry args={[0.035, 0.035, boreholeLength, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Outer Ionized Nitrogen Shock Sheath */}
          <mesh position={[0, boreholeCenterY, 0]}>
            <cylinderGeometry
              args={[0.18, 0.18, boreholeLength, 24, 1, true]}
            />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.75}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Expanding Plasma Filament Waves */}
          <mesh position={[0, boreholeCenterY, 0]}>
            <cylinderGeometry
              args={[0.42, 0.42, boreholeLength, 24, 1, true]}
            />
            <meshBasicMaterial
              color="#67E8F9"
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Volumetric Ionization Sparks */}
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[ionSparks, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.08}
              color="#E0F2FE"
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
            />
          </points>

          {/* Illuminating Point Light moving with needle head */}
          <pointLight
            color="#67E8F9"
            intensity={30}
            distance={20}
            decay={2}
            position={[0, 7.0 - progress * 8.5, 0]}
          />
        </group>
      )}
    </group>
  );
};

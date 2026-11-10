import React, { useMemo } from "react";
import * as THREE from "three";
import { NeedlePhysicsState } from "../physics/NeedlePhysics";

interface RelativisticNeedle3DProps {
  physics: NeedlePhysicsState;
  frame: number;
}

export const RelativisticNeedle3D: React.FC<RelativisticNeedle3DProps> = ({
  physics,
  frame,
}) => {
  const { gamma, beta, beatIndex, contractedLengthMicrons } = physics;

  // Lorentz contraction factor (clamped visually between 1.0 down to 0.015 so it remains visible as a disc)
  const lengthScale = useMemo(() => {
    if (beatIndex === 1) {
      if (frame < 200) return 1.0;
      // Morphing contraction
      return THREE.MathUtils.lerp(1.0, 1.0 / Math.min(gamma, 60), (frame - 200) / 188);
    }
    // High relativistic flight
    return 1.0 / Math.min(gamma, 65);
  }, [beatIndex, frame, gamma]);

  // Rest needle dimensions in 3D units:
  // Length: 4.0 units (representing 5 cm)
  // Radius: 0.12 units (representing 1 mm diameter)
  const needleRadius = 0.12;
  const needleLength = 4.0;

  // Color & emission: Steel pin -> ultra-hot white-blue relativistic plasma
  const isRelativistic = beta > 0.5;
  const plasmaColor = useMemo(() => {
    if (!isRelativistic) return new THREE.Color("#CBD5E1"); // Chrome steel
    // Extreme blueshifted Planck radiator (15 million Kelvin) -> cerenkov cyan & diamond white
    return new THREE.Color("#67E8F9").lerp(new THREE.Color("#FFFFFF"), 0.7);
  }, [isRelativistic]);

  // Subtle slow tumbling rotation during rest drop
  const rotationZ = useMemo(() => {
    if (beatIndex === 1) {
      return Math.sin(frame * 0.03) * 0.15;
    }
    return 0; // Aligned perfectly with flight vector in relativistic regime
  }, [beatIndex, frame]);

  return (
    <group
      position={[0, 0, 0]}
      rotation={[0, 0, rotationZ]}
      scale={[1, 1, lengthScale]}
    >
      {/* 1. Needle Cylindrical Shaft */}
      <mesh position={[0, 0, -0.4]}>
        <cylinderGeometry
          args={[needleRadius, needleRadius, needleLength * 0.75, 32, 1, true]}
        />
        <meshStandardMaterial
          color={isRelativistic ? "#E0F2FE" : "#E2E8F0"}
          metalness={isRelativistic ? 0.2 : 0.95}
          roughness={isRelativistic ? 0.1 : 0.18}
          emissive={isRelativistic ? plasmaColor : "#000000"}
          emissiveIntensity={isRelativistic ? 1.8 : 0.0}
        />
      </mesh>

      {/* 2. Needle Tapered Sharp Tip (Leading edge) */}
      <mesh position={[0, 0, needleLength * 0.375 - 0.4]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[needleRadius, needleLength * 0.25, 32]} />
        <meshStandardMaterial
          color={isRelativistic ? "#FFFFFF" : "#F8FAFC"}
          metalness={isRelativistic ? 0.1 : 0.98}
          roughness={0.12}
          emissive={isRelativistic ? "#FFFFFF" : "#000000"}
          emissiveIntensity={isRelativistic ? 3.0 : 0.0}
        />
      </mesh>

      {/* 3. Needle Eyelet (Rear terminal) */}
      <mesh position={[0, 0, -needleLength * 0.42]}>
        <torusGeometry args={[needleRadius * 0.85, needleRadius * 0.22, 16, 32]} />
        <meshStandardMaterial
          color="#94A3B8"
          metalness={0.9}
          roughness={0.25}
          emissive={isRelativistic ? plasmaColor : "#000000"}
          emissiveIntensity={isRelativistic ? 1.0 : 0.0}
        />
      </mesh>

      {/* 4. Relativistic Ionization Shockwave Sheath (Beat 3 & 4) */}
      {isRelativistic && (
        <group scale={[1, 1, 1 / lengthScale]}>
          {/* Compressed ultra-thin pancake plasma disc */}
          <mesh position={[0, 0, 0.05]}>
            <cylinderGeometry args={[needleRadius * 2.8, needleRadius * 3.4, 0.04, 32]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.75}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Forward Cerenkov Radiation Glow */}
          <pointLight
            color="#38BDF8"
            intensity={25.0}
            distance={15}
            decay={2}
            position={[0, 0, 0.5]}
          />
        </group>
      )}
    </group>
  );
};

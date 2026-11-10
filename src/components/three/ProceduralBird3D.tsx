import React, { useRef } from "react";
import * as THREE from "three";

interface ProceduralBirdProps {
  frame: number;
  time: number;
  velocity: number; // m/s
  gamma: number;    // Lorentz factor
}

export const ProceduralBird3D: React.FC<ProceduralBirdProps> = ({
  frame,
  time,
  velocity,
  gamma,
}) => {
  const birdGroupRef = useRef<THREE.Group>(null);
  const leftWingInnerRef = useRef<THREE.Group>(null);
  const leftWingOuterRef = useRef<THREE.Group>(null);
  const rightWingInnerRef = useRef<THREE.Group>(null);
  const rightWingOuterRef = useRef<THREE.Group>(null);

  // Calculate flap frequency based on frame / velocity
  // Flap accelerates from 4Hz up to 30Hz, then stroboscopically blends at relativistic speeds
  const flapFreq = Math.min(30, 4 + Math.pow(Math.min(velocity, 10000) / 1000, 0.8) * 8);
  const flapAngle = Math.sin(time * flapFreq * Math.PI * 2);
  const outerFlapAngle = Math.sin(time * flapFreq * Math.PI * 2 - 0.5);

  // Lorentz contraction factor along Z-axis (capped to avoid mesh vanishing)
  const zScale = Math.max(0.18, 1 / Math.min(gamma, 8));

  // Visual heating / plasma stage based on frame
  const isTransonic = frame >= 260 && frame < 529;
  const isHypersonic = frame >= 529 && frame < 864;
  const isFusion = frame >= 864 && frame < 1293;
  const isRelativistic = frame >= 1293;

  // Dynamic colors
  let bodyColor = "#3D4852"; // Natural slate
  let emissiveColor = "#000000";
  let emissiveIntensity = 0.0;

  if (isTransonic) {
    bodyColor = "#4A5568";
    emissiveColor = "#DD6B20";
    emissiveIntensity = 0.3;
  } else if (isHypersonic) {
    bodyColor = "#F6AD55";
    emissiveColor = "#ED8936";
    emissiveIntensity = 1.4;
  } else if (isFusion) {
    bodyColor = "#FAF089";
    emissiveColor = "#4FD1C5";
    emissiveIntensity = 2.0;
  } else if (isRelativistic) {
    bodyColor = "#EBF8FF";
    emissiveColor = "#00F0FF";
    emissiveIntensity = 2.8;
  }

  // Wing flapping rotations
  const wingInnerRot = flapAngle * 0.55;
  const wingOuterRot = outerFlapAngle * 0.45;

  // Slight flight bobbing synchronized with wings
  const bobY = Math.sin(time * flapFreq * Math.PI * 2) * (isRelativistic ? 0.005 : 0.035);
  const pitchRot = (flapAngle * 0.08) - (velocity > 1000 ? 0.05 : 0);

  return (
    <group
      ref={birdGroupRef}
      position={[0, bobY, 0]}
      rotation={[pitchRot, 0, 0]}
      scale={[1, 1, zScale]}
    >
      {/* 1. TORSO / BODY */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.12, 0.9, 16]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={isRelativistic ? 0.8 : 0.1}
        />
      </mesh>

      {/* 2. STREAMLINED HEAD */}
      <mesh position={[0, 0.14, 0.48]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
        />
      </mesh>

      {/* 3. SHARP BEAK */}
      <mesh position={[0, 0.12, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.28, 12]} />
        <meshStandardMaterial
          color={isHypersonic || isFusion ? "#FFF566" : "#E2E8F0"}
          emissive={isFusion || isRelativistic ? "#00FFFF" : "#DD6B20"}
          emissiveIntensity={emissiveIntensity * 1.2}
          roughness={0.2}
        />
      </mesh>

      {/* 4. AERODYNAMIC TAIL FEATHERS */}
      <mesh position={[0, 0.05, -0.65]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.32, 0.04, 0.45]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.7}
        />
      </mesh>

      {/* 5. LEFT WING ASSEMBLY */}
      <group position={[0.18, 0.08, 0.05]} ref={leftWingInnerRef} rotation={[0, 0, wingInnerRot]}>
        {/* Inner Wing Pane */}
        <mesh position={[0.42, 0, -0.05]}>
          <boxGeometry args={[0.84, 0.035, 0.38]} />
          <meshStandardMaterial
            color={bodyColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.4}
          />
        </mesh>

        {/* Outer Wing Group & Primary Feathers */}
        <group position={[0.84, 0, 0]} ref={leftWingOuterRef} rotation={[0, 0, wingOuterRot]}>
          <mesh position={[0.45, 0, -0.08]}>
            <boxGeometry args={[0.9, 0.025, 0.3]} />
            <meshStandardMaterial
              color={bodyColor}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity * 1.1}
              roughness={0.3}
            />
          </mesh>
          {/* Wingtip vortex/plasma trail node */}
          {(isHypersonic || isFusion) && (
            <mesh position={[0.9, 0, -0.1]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#FFDD55" />
            </mesh>
          )}
        </group>
      </group>

      {/* 6. RIGHT WING ASSEMBLY */}
      <group position={[-0.18, 0.08, 0.05]} ref={rightWingInnerRef} rotation={[0, 0, -wingInnerRot]}>
        {/* Inner Wing Pane */}
        <mesh position={[-0.42, 0, -0.05]}>
          <boxGeometry args={[0.84, 0.035, 0.38]} />
          <meshStandardMaterial
            color={bodyColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.4}
          />
        </mesh>

        {/* Outer Wing Group */}
        <group position={[-0.84, 0, 0]} ref={rightWingOuterRef} rotation={[0, 0, -wingOuterRot]}>
          <mesh position={[-0.45, 0, -0.08]}>
            <boxGeometry args={[0.9, 0.025, 0.3]} />
            <meshStandardMaterial
              color={bodyColor}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity * 1.1}
              roughness={0.3}
            />
          </mesh>
          {(isHypersonic || isFusion) && (
            <mesh position={[-0.9, 0, -0.1]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#FFDD55" />
            </mesh>
          )}
        </group>
      </group>

      {/* 7. TRANSONIC PRANDTL-GLAUERT CONDENSATION CONE (Mach 1 shock cone) */}
      {frame >= 270 && frame < 430 && (
        <mesh position={[0, 0.05, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.6, 1.2, 24, 1, true]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={Math.sin(((frame - 270) / 160) * Math.PI) * 0.75}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 8. HYPERSONIC PLASMA ENVELOPE (Mach 20 glowing plasma bubble) */}
      {isHypersonic && (
        <mesh position={[0, 0.08, 0.1]} scale={[1.8, 1.2, 2.2]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial
            color="#FF5500"
            transparent
            opacity={0.35 + Math.sin(frame * 0.4) * 0.15}
            wireframe={false}
          />
        </mesh>
      )}

      {/* 9. THERMONUCLEAR FUSION SHOCKWAVE PULSES (0.01c shock discs) */}
      {isFusion && (
        <group position={[0, 0, -0.3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[2.8 + (frame % 8) * 0.4, 2.8 + (frame % 8) * 0.4, 1]}>
            <ringGeometry args={[0.6, 1.2, 32]} />
            <meshBasicMaterial
              color="#00FFAA"
              transparent
              opacity={Math.max(0, 1 - (frame % 8) / 8)}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* 10. RELATIVISTIC CHERENKOV / BLUE ABERRATION SHROUD */}
      {isRelativistic && (
        <mesh position={[0, 0, 0.2]} scale={[1.4, 1.4, 3.5]}>
          <coneGeometry args={[1.2, 3.0, 32, 1, true]} />
          <meshBasicMaterial
            color="#00F0FF"
            transparent
            opacity={0.45 + Math.sin(frame * 0.8) * 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

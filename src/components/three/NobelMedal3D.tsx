import React from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { PaperDioramaPopUp } from "./PaperDioramaPopUp";

export const NobelMedal3D: React.FC<{
  scale?: number;
}> = ({ scale = 1.0 }) => {
  const frame = useCurrentFrame();

  // Slow 3D coin spin with subtle tilt
  const rotY = frame * 0.025;
  const rotX = Math.sin(frame * 0.015) * 0.15 + 0.15;

  return (
    <group scale={[scale, scale, scale]}>
      <PaperDioramaPopUp delay={3} shadowRadius={1.1} shadowOpacity={0.25}>
        <group rotation={[rotX, rotY, 0]}>
          {/* Main Gold Medal Disc - High Warm Specular, Balanced Metalness */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.12, 48]} />
            <meshStandardMaterial
              color="#F2B705"
              emissive="#382902"
              roughness={0.35}
              metalness={0.3}
              flatShading={false}
            />
          </mesh>

          {/* Raised Embossed Outer Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.07]}>
            <ringGeometry args={[1.05, 1.18, 48]} />
            <meshStandardMaterial
              color="#FFD166"
              emissive="#4A3805"
              roughness={0.25}
              metalness={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.07]}>
            <ringGeometry args={[1.05, 1.18, 48]} />
            <meshStandardMaterial
              color="#FFD166"
              emissive="#4A3805"
              roughness={0.25}
              metalness={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Inner Relief Profile Geometry */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}>
            <circleGeometry args={[0.9, 32]} />
            <meshStandardMaterial
              color="#DE9F03"
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.08]}>
            <circleGeometry args={[0.9, 32]} />
            <meshStandardMaterial
              color="#DE9F03"
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>

          {/* Subtle Specular Gleam Edge */}
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.22, 1.22, 1.22]}>
            <ringGeometry args={[0.98, 1.0, 48]} />
            <meshBasicMaterial
              color="#FFF2B2"
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </PaperDioramaPopUp>
    </group>
  );
};

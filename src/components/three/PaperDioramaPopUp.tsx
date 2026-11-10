import React, { useRef } from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import * as THREE from "three";

export const PaperDioramaPopUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  unfoldAxis?: "x" | "y";
  maxAngle?: number;
  shadowRadius?: number;
  shadowOpacity?: number;
}> = ({
  children,
  delay = 0,
  unfoldAxis = "x",
  maxAngle = Math.PI / 2,
  shadowRadius = 1.2,
  shadowOpacity = 0.25,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const groupRef = useRef<THREE.Group>(null);

  // Snappy stepped mechanical spring for pop-up fold (tactile pop-up book feel)
  const foldSpring = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 220 },
  });

  const foldAngle = interpolate(foldSpring, [0, 1], [-maxAngle, 0]);
  const elevation = interpolate(foldSpring, [0, 1], [0, 0.15]);

  return (
    <group ref={groupRef}>
      {/* Soft Compact Circular Drop-Shadow (stays well within canvas bounds) */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[shadowRadius, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={shadowOpacity * foldSpring}
        />
      </mesh>

      {/* Creased Paper Pop-up Hinge */}
      <group
        position={[0, elevation, 0]}
        rotation={
          unfoldAxis === "x"
            ? [foldAngle, 0, 0]
            : [0, foldAngle, 0]
        }
      >
        {children}
      </group>
    </group>
  );
};

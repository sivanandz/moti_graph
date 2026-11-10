import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import * as THREE from "three";
import { PaperDioramaPopUp } from "./PaperDioramaPopUp";

export const HornAntenna3D: React.FC<{
  scale?: number;
  showRFRays?: boolean;
  azimuthRotationSpeed?: number;
}> = ({ scale = 1.0, showRFRays = true, azimuthRotationSpeed = 0.005 }) => {
  const frame = useCurrentFrame();

  // Slow mechanical turntable rotation across azimuth
  const azimuthAngle = frame * azimuthRotationSpeed + 0.35;
  // Subtle elevation breathing
  const elevationAngle = Math.sin(frame * 0.02) * 0.06 - 0.22;

  // Wireframe Blueprint Line Geometry for the Horn Flare
  const hornWireframe = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Mouth rectangle (wide front)
      -1.4, -0.9, 1.8,   1.4, -0.9, 1.8,
       1.4, -0.9, 1.8,   1.4,  0.9, 1.8,
       1.4,  0.9, 1.8,  -1.4,  0.9, 1.8,
      -1.4,  0.9, 1.8,  -1.4, -0.9, 1.8,

      // Throat rectangle (narrow rear)
      -0.25, -0.2, -1.6,   0.25, -0.2, -1.6,
       0.25, -0.2, -1.6,   0.25,  0.2, -1.6,
       0.25,  0.2, -1.6,  -0.25,  0.2, -1.6,
      -0.25,  0.2, -1.6,  -0.25, -0.2, -1.6,

      // Connecting ribs (mouth to throat)
      -1.4, -0.9,  1.8,  -0.25, -0.2, -1.6,
       1.4, -0.9,  1.8,   0.25, -0.2, -1.6,
       1.4,  0.9,  1.8,   0.25,  0.2, -1.6,
      -1.4,  0.9,  1.8,  -0.25,  0.2, -1.6,

      // Diagonal internal bracing
      -1.4, -0.9, 1.8,   1.4,  0.9, 1.8,
       1.4, -0.9, 1.8,  -1.4,  0.9, 1.8,
    ]);
    geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    return geom;
  }, []);

  // RF ray pulse offset
  const rayProgress = (frame * 0.05) % 1.0;

  return (
    <group scale={[scale, scale, scale]}>
      <PaperDioramaPopUp delay={4}>
        {/* Turntable Base (Circular Ground Ring) */}
        <group rotation={[0, azimuthAngle, 0]}>
          {/* Circular Ground Track */}
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.75, 32]} />
            <meshStandardMaterial color="#405060" roughness={0.6} metalness={0.6} />
          </mesh>

          {/* Turntable Rotating Platform */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[1.6, 1.7, 0.16, 24]} />
            <meshStandardMaterial color="#E8E1D3" roughness={0.85} metalness={0.05} flatShading />
          </mesh>

          {/* Support A-Frame Trestles */}
          <mesh position={[-0.85, 0.85, 0]}>
            <boxGeometry args={[0.16, 1.3, 0.16]} />
            <meshStandardMaterial color="#7E8C99" roughness={0.35} metalness={0.75} flatShading />
          </mesh>
          <mesh position={[0.85, 0.85, 0]}>
            <boxGeometry args={[0.16, 1.3, 0.16]} />
            <meshStandardMaterial color="#7E8C99" roughness={0.35} metalness={0.75} flatShading />
          </mesh>
          <mesh position={[0, 0.85, -0.85]}>
            <boxGeometry args={[0.16, 1.3, 0.16]} />
            <meshStandardMaterial color="#7E8C99" roughness={0.35} metalness={0.75} flatShading />
          </mesh>

          {/* Elevation Wheel & Horn Assembly */}
          <group position={[0, 1.35, 0]} rotation={[elevationAngle, 0, 0]}>
            {/* Giant Circular Elevation Wheel */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[1.15, 0.08, 16, 32]} />
              <meshStandardMaterial color="#7E8C99" roughness={0.35} metalness={0.75} flatShading />
            </mesh>

            {/* Wheel Spokes */}
            {[-0.6, 0, 0.6].map((offset, i) => (
              <mesh key={`spoke-${i}`} position={[0, offset, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, 2.2, 12]} />
                <meshStandardMaterial color="#7E8C99" roughness={0.35} metalness={0.75} flatShading />
              </mesh>
            ))}

            {/* 3D Flared Horn Body (Low-poly paper facet) */}
            <mesh position={[0, 0, 0.1]}>
              <cylinderGeometry args={[1.3, 0.35, 3.4, 4, 1, false, Math.PI / 4]} />
              <meshStandardMaterial color="#E8E1D3" roughness={0.85} metalness={0.05} flatShading />
            </mesh>

            {/* Cyan Blueprint Wireframe Overlay on Horn */}
            <lineSegments geometry={hornWireframe}>
              <lineBasicMaterial color="#87DAEE" linewidth={2} />
            </lineSegments>

            {/* Rear Receiver Cabin & Liquid Helium Dewar */}
            <mesh position={[0, 0, -1.9]}>
              <boxGeometry args={[0.85, 0.85, 0.9]} />
              <meshStandardMaterial color="#2C3946" roughness={0.7} metalness={0.2} />
            </mesh>

            {/* Liquid Helium Cryogenic Tank */}
            <mesh position={[0, 0.55, -1.9]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.18, 0.55, 8, 16]} />
              <meshStandardMaterial color="#DE3831" roughness={0.4} metalness={0.8} />
            </mesh>

            {/* Animated 4080 MHz RF Inbound Ray Beams */}
            {showRFRays && (
              <group position={[0, 0, 2.2]}>
                {[
                  [-0.6, -0.4],
                  [0.6, -0.4],
                  [0.0, 0.5],
                  [-0.3, 0.2],
                  [0.3, 0.2],
                ].map(([rx, ry], rIdx) => {
                  const rayZ = interpolate(
                    (rayProgress + rIdx * 0.2) % 1.0,
                    [0, 1],
                    [2.5, -3.5]
                  );
                  return (
                    <mesh key={`ray-${rIdx}`} position={[rx * 0.6, ry * 0.6, rayZ]}>
                      <cylinderGeometry args={[0.025, 0.025, 0.6, 6]} />
                      <meshBasicMaterial color="#FFD166" />
                    </mesh>
                  );
                })}
              </group>
            )}
          </group>
        </group>
      </PaperDioramaPopUp>
    </group>
  );
};

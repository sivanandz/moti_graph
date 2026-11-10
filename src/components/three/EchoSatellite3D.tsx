import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { PaperDioramaPopUp } from "./PaperDioramaPopUp";

export const EchoSatellite3D: React.FC<{
  scale?: number;
}> = ({ scale = 1.0 }) => {
  const frame = useCurrentFrame();

  // Orbital rotation
  const spinY = frame * 0.018;
  const spinX = Math.sin(frame * 0.012) * 0.15;

  const wireframeGeom = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.95, 2);
    return new THREE.WireframeGeometry(geo);
  }, []);

  return (
    <group scale={[scale, scale, scale]}>
      <PaperDioramaPopUp delay={3} shadowRadius={1.1} shadowOpacity={0.25}>
        <group rotation={[spinX, spinY, 0]}>
          {/* 100-foot Faceted Mylar Sphere */}
          <mesh>
            <icosahedronGeometry args={[0.95, 2]} />
            <meshStandardMaterial
              color="#D8E2EC"
              roughness={0.18}
              metalness={0.88}
              flatShading
            />
          </mesh>

          {/* Blueprint Equatorial Seams */}
          <lineSegments geometry={wireframeGeom}>
            <lineBasicMaterial color="#87DAEE" transparent opacity={0.65} />
          </lineSegments>

          {/* Polar Transmit Beacon */}
          <mesh position={[0, 1.0, 0]}>
            <coneGeometry args={[0.06, 0.18, 8]} />
            <meshBasicMaterial color="#DE3831" />
          </mesh>
          <mesh position={[0, -1.0, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.06, 0.18, 8]} />
            <meshBasicMaterial color="#DE3831" />
          </mesh>

          {/* Radio Signal Reflection Pulse Rings */}
          {[0, 1].map((ringIdx) => {
            const rProgress = ((frame * 0.035 + ringIdx * 0.5) % 1.0);
            const rScale = 1.05 + rProgress * 0.35;
            const rOpacity = (1.0 - rProgress) * 0.6;
            return (
              <mesh key={`ring-${ringIdx}`} scale={[rScale, rScale, rScale]}>
                <ringGeometry args={[0.96, 1.0, 32]} />
                <meshBasicMaterial
                  color="#FFD166"
                  transparent
                  opacity={rOpacity}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      </PaperDioramaPopUp>
    </group>
  );
};

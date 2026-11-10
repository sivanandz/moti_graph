import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import * as THREE from "three";
import { PaperDioramaPopUp } from "./PaperDioramaPopUp";

export const CosmicExpansion3D: React.FC<{
  scale?: number;
}> = ({ scale = 1.0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Expansion cycle (from primordial dense fireball to transparent relic sphere)
  const expandProgress = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 15, mass: 0.8, stiffness: 120 },
  });

  // Keep radius compact so it never clips canvas boundaries
  const sphereRadius = interpolate(expandProgress, [0, 1], [0.35, 1.15]);
  const coreOpacity = interpolate(expandProgress, [0, 0.4, 1], [1.0, 0.7, 0.1]);
  const wireframeOpacity = interpolate(expandProgress, [0, 0.5, 1], [0.3, 0.65, 0.85]);
  const rotAngle = frame * 0.01;

  // Icosahedron Geodesic Wireframe
  const wireframeGeom = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 2);
    return new THREE.WireframeGeometry(geo);
  }, []);

  // Relic Microwave Photons radiating outward
  const photonCount = 36;
  const photonPoints = useMemo(() => {
    const pts: { pos: THREE.Vector3; speed: number }[] = [];
    for (let i = 0; i < photonCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const sinPhi = Math.sin(phi);
      pts.push({
        pos: new THREE.Vector3(
          sinPhi * Math.cos(theta),
          sinPhi * Math.sin(theta),
          Math.cos(phi)
        ).normalize(),
        speed: 0.8 + Math.random() * 0.5,
      });
    }
    return pts;
  }, []);

  return (
    <group scale={[scale, scale, scale]}>
      <PaperDioramaPopUp delay={5} shadowRadius={1.2} shadowOpacity={0.25}>
        <group rotation={[0.2, rotAngle, 0.1]}>
          {/* Dense Primordial Fireball Core */}
          <mesh>
            <sphereGeometry args={[sphereRadius * 0.35, 24, 24]} />
            <meshBasicMaterial
              color="#DE3831"
              transparent
              opacity={coreOpacity}
            />
          </mesh>

          {/* 3D Geodesic Recombination Shell */}
          <group scale={[sphereRadius, sphereRadius, sphereRadius]}>
            <lineSegments geometry={wireframeGeom}>
              <lineBasicMaterial
                color="#87DAEE"
                transparent
                opacity={wireframeOpacity}
                linewidth={1.5}
              />
            </lineSegments>

            {/* Faceted Translucent Paper Octahedral Shell */}
            <mesh>
              <icosahedronGeometry args={[0.99, 1]} />
              <meshStandardMaterial
                color="#F4EFE6"
                roughness={0.9}
                transparent
                opacity={0.12}
                flatShading
              />
            </mesh>
          </group>

          {/* Escaping Relic Microwave Photons */}
          {photonPoints.map((pt, idx) => {
            const pDist = ((frame * 0.03 * pt.speed + idx * 0.1) % 1.0) * (sphereRadius * 1.15);
            const x = pt.pos.x * pDist;
            const y = pt.pos.y * pDist;
            const z = pt.pos.z * pDist;
            return (
              <mesh key={`photon-${idx}`} position={[x, y, z]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color="#FFD166" />
              </mesh>
            );
          })}

          {/* Celestial Coordinate Rings (Tactile Blueprint Circles) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[sphereRadius * 1.05, sphereRadius * 1.05, 1]}>
            <ringGeometry args={[0.98, 1.0, 48]} />
            <meshBasicMaterial color="#DE3831" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </PaperDioramaPopUp>
    </group>
  );
};

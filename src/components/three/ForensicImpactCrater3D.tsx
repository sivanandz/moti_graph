import React, { useMemo } from "react";
import * as THREE from "three";
import { createCrackedLavaTexture } from "./ProceduralTextures";

interface ForensicImpactCrater3DProps {
  frame: number;
  time: number;
}

export const ForensicImpactCrater3D: React.FC<ForensicImpactCrater3DProps> = ({
  frame,
  time,
}) => {
  // Procedural lava textures for molten melt pool
  const { diffuse, emissive } = useMemo(() => createCrackedLavaTexture(), []);

  // 1. Terraced Parabolic 300m Crater Basin with Raised Rim & Radial Fractures
  const { craterGeom, meltGeom, asphaltRemnants } = useMemo(() => {
    const size = 110;
    const segments = 128;
    const geom = new THREE.PlaneGeometry(size, size, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    // Crater physical dimensions:
    // Rim radius: R = 15.0 units (~150m radius / 300m diameter)
    // Cavity depth: D = 4.8 units (~48m depth)
    // Rim uplift height: H = 1.4 units (~14m above surrounding plain)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.sqrt(x * x + z * z);
      const theta = Math.atan2(z, x);

      if (r < 15.0) {
        // Inside excavation cavity
        const normR = r / 15.0; // 0 to 1
        const bowl = -4.8 * (1 - Math.pow(normR, 1.7)) + Math.pow(normR, 3.5) * 1.4;
        // Radial fault steps & chaotic rock fracturing
        const fractures =
          Math.sin(r * 3.5) * 0.22 +
          Math.cos(theta * 14) * 0.16 +
          Math.sin(x * 0.8 + z * 0.8) * 0.12;
        pos.setY(i, bowl + fractures);
      } else if (r < 26.0) {
        // Overturned rim and ejecta blanket
        const normR = (r - 15.0) / 11.0;
        const ejecta = 1.4 * Math.exp(-normR * 2.8);
        const rimNoise = Math.sin(theta * 16) * 0.18 + Math.cos(r * 2.0) * 0.1;
        pos.setY(i, ejecta + rimNoise);
      } else {
        // Outer undisturbed ground
        pos.setY(i, 0);
      }
    }
    geom.computeVertexNormals();

    // Central circular molten lava lake (Radius = 4.8 units)
    const melt = new THREE.CircleGeometry(4.8, 64);
    melt.rotateX(-Math.PI / 2);

    // Broken asphalt street remnants around outer perimeter
    const asphaltSlabs: { pos: [number, number, number]; size: [number, number, number] }[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const rad = 17.5 + (i % 3) * 3.0;
      asphaltSlabs.push({
        pos: [Math.cos(angle) * rad, 0.4, Math.sin(angle) * rad],
        size: [3.5, 0.25, 3.5],
      });
    }

    return { craterGeom: geom, meltGeom: melt, asphaltRemnants: asphaltSlabs };
  }, []);

  // 2. Rising Volumetric Smoke Particles
  const smokeParticles = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = Math.random() * 4.2;
      positions[i * 3] = Math.cos(angle) * rad;
      positions[i * 3 + 1] = -4.5 + Math.random() * 6.5;
      positions[i * 3 + 2] = Math.sin(angle) * rad;
    }
    return positions;
  }, []);

  // Pulsing molten glow animation
  const pulseIntensity = 1.8 + Math.sin(time * 3.5) * 0.45;

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. Terraced Excavation Crater Basin */}
      <mesh geometry={craterGeom} receiveShadow castShadow>
        <meshStandardMaterial
          color="#0B0F19"
          roughness={0.94}
          metalness={0.15}
          flatShading={false}
        />
      </mesh>

      {/* 2. Central Molten Magma Melt Pool */}
      <mesh geometry={meltGeom} position={[0, -4.6, 0]}>
        <meshStandardMaterial
          map={diffuse}
          emissiveMap={emissive}
          emissive="#EA580C"
          emissiveIntensity={pulseIntensity}
          roughness={0.6}
          metalness={0.5}
        />
      </mesh>

      {/* Internal Magma Radiant Core Light */}
      <pointLight
        color="#F97316"
        intensity={22}
        distance={35}
        decay={2}
        position={[0, -2.8, 0]}
      />

      {/* 3. Broken Asphalt Slabs at Rim Perimeter */}
      {asphaltRemnants.map((slab, idx) => (
        <mesh key={idx} position={slab.pos}>
          <boxGeometry args={slab.size} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
      ))}

      {/* 4. Rising Thermal Smoke & Ash Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[smokeParticles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.32}
          color="#64748B"
          transparent
          opacity={0.4}
          blending={THREE.NormalBlending}
        />
      </points>

      {/* 5. 3D Holographic Forensic Laser Telemetry Rings */}
      {/* Outer 300m Rim Contour (Radius = 15.0) */}
      <mesh position={[0, 1.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[14.88, 15.12, 96]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mid 200m Basin Contour (Radius = 10.0) */}
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.9, 10.1, 80]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Melt Pool Perimeter (Radius = 5.0) */}
      <mesh position={[0, -4.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.9, 5.08, 64]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Forensic Diameter Axis Calipers */}
      <mesh position={[0, 1.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30.0, 0.08]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 1.46, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[30.0, 0.08]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.6} />
      </mesh>

      {/* Ambient Overhead Fill Light */}
      <ambientLight intensity={0.45} color="#94A3B8" />
      <directionalLight
        position={[25, 45, 20]}
        intensity={1.2}
        color="#E2E8F0"
      />
    </group>
  );
};

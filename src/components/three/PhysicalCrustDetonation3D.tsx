import React, { useMemo } from "react";
import * as THREE from "three";
import { NeedlePhysicsState } from "../physics/NeedlePhysics";

interface PhysicalCrustDetonation3DProps {
  physics: NeedlePhysicsState;
  frame: number;
  time: number;
}

export const PhysicalCrustDetonation3D: React.FC<
  PhysicalCrustDetonation3DProps
> = ({ physics, frame, time }) => {
  const { flashIntensity } = physics;

  // Taylor-Sedov blast progression (frame 1602 to 2074)
  const blastT = useMemo(() => {
    return Math.min(1.0, Math.max(0, (frame - 1602) / 260));
  }, [frame]);

  // Sedov-von Neumann blast wave radius: R(t) ~ t^(2/5)
  const fireballRadius = Math.pow(blastT, 0.42) * 14.0;
  const shockwaveRadius = Math.pow(blastT, 0.65) * 32.0;

  // 1. Turbulent Boiling Fireball Dome (Vertex Noise Displacement)
  const fireballGeom = useMemo(() => {
    const geom = new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // Multi-frequency turbulent noise
      const n1 = Math.sin(x * 5 + y * 7) * 0.12;
      const n2 = Math.cos(z * 6 - y * 6) * 0.09;
      const n3 = Math.sin((x + z) * 8 + y * 4) * 0.05;
      const totalNoise = 1.0 + (n1 + n2 + n3);
      pos.setXYZ(i, x * totalNoise, y * totalNoise * 1.15, z * totalNoise);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // 2. Ballistic Rock & Molten Ejecta Particles (260 physics-driven particles)
  const ejectaData = useMemo(() => {
    const count = 260;
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const speed = 18 + Math.random() * 26; // Outward velocity
      const vY = 12 + Math.random() * 24; // Vertical launch velocity
      const size = 0.12 + Math.random() * 0.35;
      const isMolten = Math.random() > 0.4;
      items.push({ angle, speed, vY, size, isMolten });
    }
    return items;
  }, []);

  // 3. Scorched City Ground & Shattered Peripheral Skyscrapers
  const cityPerimeter = useMemo(() => {
    const towers = [];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const dist = 28 + (i % 3) * 6;
      towers.push({
        pos: [Math.cos(angle) * dist, 12 + (i % 4) * 5, Math.sin(angle) * dist] as [
          number,
          number,
          number
        ],
        size: [6, 24 + (i % 4) * 10, 6] as [number, number, number],
      });
    }
    return towers;
  }, []);

  const fireballOpacity = Math.max(0.15, 0.98 - blastT * 0.72);
  const shockwaveOpacity = Math.max(0, 0.95 - blastT * 0.92);
  const dustWallOpacity = Math.max(0, 0.7 - blastT * 0.65);

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. Scorched Ground Plane */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#090D16" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* 2. Incandescent Multilayer Nuclear Fireball Dome */}
      {fireballRadius > 0.15 && (
        <group>
          {/* Core White Plasma (15 Million Kelvin) */}
          <mesh
            scale={[
              fireballRadius * 0.45,
              fireballRadius * 0.55,
              fireballRadius * 0.45,
            ]}
          >
            <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={Math.max(0.15, 1.0 - blastT * 0.85)}
            />
          </mesh>

          {/* Mid High-Temperature Cadmium Yellow Plasma Mantle */}
          <mesh
            geometry={fireballGeom}
            scale={[
              fireballRadius * 0.78,
              fireballRadius * 0.92,
              fireballRadius * 0.78,
            ]}
          >
            <meshStandardMaterial
              color="#FEF08A"
              emissive="#FBBF24"
              emissiveIntensity={Math.max(1.0, 5.0 - blastT * 4.0)}
              roughness={0.4}
              transparent
              opacity={Math.max(0.25, 0.95 - blastT * 0.65)}
            />
          </mesh>

          {/* Outer Turbulent Boiling Fiery Orange & Soot Shell */}
          <mesh
            geometry={fireballGeom}
            scale={[fireballRadius, fireballRadius * 1.18, fireballRadius]}
          >
            <meshStandardMaterial
              color="#DC2626"
              emissive="#EA580C"
              emissiveIntensity={Math.max(0.8, 3.8 - blastT * 2.8)}
              roughness={0.75}
              transparent
              opacity={fireballOpacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* 3. Supersonic Mach-20 Atmospheric Shockwave Ring */}
      {shockwaveRadius > 0.8 && (
        <group position={[0, 0.08, 0]}>
          {/* Luminous High-Pressure Plasma Rim */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[
                Math.max(0.1, shockwaveRadius - 1.2),
                shockwaveRadius,
                96,
              ]}
            />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={shockwaveOpacity}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Ground Dust Wall sweeping outward */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[
                Math.max(0.1, shockwaveRadius - 4.5),
                Math.max(0.2, shockwaveRadius - 0.8),
                64,
              ]}
            />
            <meshBasicMaterial
              color="#78716C"
              transparent
              opacity={dustWallOpacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* 4. Pulverized Ballistic Rock & Molten Ejecta Debris */}
      {blastT > 0.02 &&
        ejectaData.map((e, idx) => {
          // Physics: r(t) = v * t, y(t) = vY * t - 0.5 * g * t^2
          const t = blastT * 2.8;
          const r = e.speed * t;
          const g = 9.8;
          const y = Math.max(0.1, e.vY * t - 0.5 * g * t * t);
          const x = Math.cos(e.angle) * r;
          const z = Math.sin(e.angle) * r;

          return (
            <mesh
              key={idx}
              position={[x, y, z]}
              scale={[e.size, e.size, e.size]}
            >
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color={e.isMolten ? "#FB923C" : "#334155"}
                emissive={e.isMolten ? "#F97316" : "#000000"}
                emissiveIntensity={e.isMolten ? 2.5 : 0}
                roughness={0.9}
              />
            </mesh>
          );
        })}

      {/* 5. Shattered Peripheral Skyscraper Silhouettes */}
      {cityPerimeter.map((tower, idx) => (
        <mesh key={idx} position={tower.pos}>
          <boxGeometry args={tower.size} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* 6. Dynamic Detonation Core Omni-Light */}
      <pointLight
        position={[0, Math.max(1, fireballRadius * 0.6), 0]}
        color="#FFAA33"
        intensity={Math.max(15, 120 * (1 - blastT * 0.7))}
        distance={90}
        decay={1.8}
      />
    </group>
  );
};

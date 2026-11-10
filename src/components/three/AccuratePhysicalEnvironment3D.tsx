import React, { useMemo } from "react";
import * as THREE from "three";
import {
  getPhysicsState,
  applyRelativisticAberration,
  getRelativisticStarColor,
} from "../physics/RelativisticPhysics";

interface PhysicalEnvProps {
  frame: number;
  time: number;
}

export const AccuratePhysicalEnvironment3D: React.FC<PhysicalEnvProps> = ({
  frame,
  time,
}) => {
  const physics = useMemo(() => getPhysicsState(frame), [frame]);
  const { velocity, beta, gamma } = physics;

  // Base resting star catalog (1,200 stars distributed uniformly on a celestial sphere)
  const starCatalog = useMemo(() => {
    const stars = [];
    const count = 1200;
    for (let i = 0; i < count; i++) {
      // Uniform spherical distribution
      const u = Math.random();
      const v = Math.random();
      const theta = Math.acos(2 * u - 1); // 0 to PI
      const phi = 2 * Math.PI * v;       // 0 to 2PI
      const dist = 60 + Math.random() * 140;

      const x = dist * Math.sin(theta) * Math.cos(phi);
      const y = dist * Math.sin(theta) * Math.sin(phi);
      const z = dist * Math.cos(theta); // along Z axis

      stars.push({ origX: x, origY: y, origZ: z, dist });
    }
    return stars;
  }, []);

  // Compute aberrated star positions dynamically using Einstein's formula
  const { aberratedPositions, starColors } = useMemo(() => {
    const pos = new Float32Array(starCatalog.length * 3);
    const colors = new Float32Array(starCatalog.length * 3);

    const tempColor = new THREE.Color();

    for (let i = 0; i < starCatalog.length; i++) {
      const s = starCatalog[i];
      // Apply relativistic aberration transformation
      const [ax, ay, az] = applyRelativisticAberration(
        s.origX,
        s.origY,
        s.origZ,
        beta
      );

      pos[i * 3] = ax;
      pos[i * 3 + 1] = ay;
      pos[i * 3 + 2] = az;

      // Doppler color based on angle to forward vector (-Z)
      const cosAngle = -az / s.dist;
      const hex = getRelativisticStarColor(cosAngle, beta);
      tempColor.set(hex);

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    return { aberratedPositions: pos, starColors: colors };
  }, [starCatalog, beta]);

  // Clean scrolling ground offset
  const scrollOffset = (frame * Math.min(velocity, 25000) * 0.006) % 150;

  return (
    <group>
      {/* ------------------------------------------------------------- */}
      {/* 1. CLEAN MINIMALIST RUNWAY & LOW-ALTITUDE TERRAIN (0 - 320)   */}
      {/* ------------------------------------------------------------- */}
      {frame < 360 && (
        <group position={[0, -2.4, -25]}>
          {/* Elegant infinite grid ground */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, (scrollOffset % 50) - 25]}
          >
            <planeGeometry args={[70, 160, 20, 24]} />
            <meshStandardMaterial
              color="#1E3A2F"
              roughness={0.9}
              transparent
              opacity={frame > 270 ? Math.max(0, (360 - frame) / 90) : 1}
            />
          </mesh>

          {/* Minimalist guide runway lines */}
          {[-8, 0, 8].map((x, idx) => (
            <mesh
              key={idx}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[x, 0.02, (scrollOffset % 50) - 25]}
            >
              <planeGeometry args={[0.3, 160]} />
              <meshBasicMaterial
                color="#10B981"
                transparent
                opacity={frame > 270 ? Math.max(0, (360 - frame) / 90) * 0.5 : 0.6}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. TRANSONIC / SUPERSONIC CLOUD DECK (220 - 700)              */}
      {/* ------------------------------------------------------------- */}
      {frame >= 220 && frame < 720 && (
        <group position={[0, -2.0, -20]}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, (scrollOffset % 60) - 30]}
          >
            <planeGeometry args={[80, 160, 16, 16]} />
            <meshStandardMaterial
              color="#E2E8F0"
              transparent
              opacity={0.65}
              roughness={0.95}
            />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. STRATOSPHERIC LIMB & CURVED EARTH (500 - 1450)             */}
      {/* ------------------------------------------------------------- */}
      {frame >= 500 && frame < 1450 && (
        <group position={[0, -32, -60]}>
          <mesh>
            <sphereGeometry args={[32, 48, 48]} />
            <meshStandardMaterial
              color="#0284C7"
              emissive="#0369A1"
              emissiveIntensity={0.2}
              roughness={0.65}
            />
          </mesh>
          {/* Atmospheric blue rim halo */}
          <mesh scale={[1.025, 1.025, 1.025]}>
            <sphereGeometry args={[32, 32, 32]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.3}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. DEEP VACUUM, RECEDING EARTH & MOON (1150 - 1700)           */}
      {/* ------------------------------------------------------------- */}
      {frame >= 1150 && (
        <group>
          {/* Receding blue Earth sphere */}
          {frame < 1720 && (
            <group position={[12, -6, -120 - (frame - 1150) * 0.45]}>
              <mesh>
                <sphereGeometry args={[14, 36, 36]} />
                <meshStandardMaterial
                  color="#1D4ED8"
                  emissive="#0A1128"
                  roughness={0.5}
                />
              </mesh>
              <mesh scale={[1.025, 1.025, 1.025]}>
                <sphereGeometry args={[14, 24, 24]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.4}
                  roughness={0.8}
                />
              </mesh>
            </group>
          )}

          {/* Minimalist realistic Moon flyby */}
          {frame >= 1293 && frame < 1580 && (
            <mesh
              position={[
                -16 + (frame - 1293) * 0.14,
                6,
                -65 - (frame - 1293) * 0.25,
              ]}
            >
              <sphereGeometry args={[6.0, 32, 32]} />
              <meshStandardMaterial
                color="#CBD5E1"
                roughness={0.95}
                metalness={0.05}
              />
            </mesh>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. RELATIVISTIC ABERRATION STARFIELD (Simulates Einstein's eq) */}
      {/* ------------------------------------------------------------- */}
      {frame >= 500 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[aberratedPositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[starColors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={beta > 0.8 ? 2.4 : 1.2}
            vertexColors
            transparent
            opacity={Math.min(1.0, (frame - 500) / 150)}
          />
        </points>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. RELATIVISTIC BEAMING SINGULARITY CORE (Beat 6: 0.999c)     */}
      {/* ------------------------------------------------------------- */}
      {beta > 0.85 && (
        <mesh position={[0, 0, -140]}>
          <sphereGeometry args={[16 + (beta - 0.85) * 40, 32, 32]} />
          <meshBasicMaterial
            color="#E0F7FA"
            transparent
            opacity={Math.min(0.95, (beta - 0.85) * 6.5)}
          />
        </mesh>
      )}
    </group>
  );
};

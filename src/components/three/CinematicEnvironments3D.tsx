import React, { useMemo } from "react";
import * as THREE from "three";

interface CinematicEnvironmentsProps {
  frame: number;
  time: number;
  velocity: number;
  gamma: number;
}

export const CinematicEnvironments3D: React.FC<CinematicEnvironmentsProps> = ({
  frame,
  time,
  velocity,
  gamma,
}) => {
  // Speed-based deterministic scroll
  const scrollOffset = (frame * Math.min(velocity, 40000) * 0.008) % 200;

  // Starfield particles (1,500 stars)
  const starCount = 1500;
  const starPositions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 220;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 160;
      pos[i * 3 + 2] = -Math.random() * 350;
    }
    return pos;
  }, []);

  // Dense relativistic warp speed streaks (600 lines)
  const streakCount = 600;
  const streakPositions = useMemo(() => {
    const pos = new Float32Array(streakCount * 6);
    for (let i = 0; i < streakCount; i++) {
      const radius = 2 + Math.random() * 28;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -Math.random() * 200;
      const len = 12 + Math.random() * 45;

      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;

      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z + len;
    }
    return pos;
  }, []);

  // Cloud puff billboard positions
  const cloudCount = 40;
  const clouds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < cloudCount; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 60,
        y: -1.8 - Math.random() * 2.5,
        z: -Math.random() * 120,
        scale: 6 + Math.random() * 8,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* ------------------------------------------------------------- */}
      {/* 1. BEAT 1: LUSH COUNTRYSIDE & LAYERED HILLS (Frames 0 - 320)  */}
      {/* ------------------------------------------------------------- */}
      {frame < 360 && (
        <group position={[0, -2.2, -30]}>
          {/* Main rolling terrain plane */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, (scrollOffset % 60) - 30]}
          >
            <planeGeometry args={[80, 180, 24, 32]} />
            <meshStandardMaterial
              color="#2E7D32"
              roughness={0.85}
              metalness={0.05}
              transparent
              opacity={frame > 270 ? Math.max(0, (360 - frame) / 90) : 1}
            />
          </mesh>

          {/* Secondary rolling ridge */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[15, -0.4, ((scrollOffset * 0.7) % 60) - 30]}
          >
            <planeGeometry args={[50, 140, 16, 16]} />
            <meshStandardMaterial
              color="#1B5E20"
              roughness={0.9}
              transparent
              opacity={frame > 270 ? Math.max(0, (360 - frame) / 90) : 1}
            />
          </mesh>

          {/* Distant mountain backdrop */}
          <mesh position={[0, 5, -90]}>
            <cylinderGeometry args={[55, 75, 24, 20]} />
            <meshStandardMaterial
              color="#143D1A"
              roughness={0.95}
              transparent
              opacity={frame > 270 ? Math.max(0, (360 - frame) / 90) : 1}
            />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. BEAT 2: TRANSONIC BILLOWING CLOUD DECK (Frames 220 - 650)  */}
      {/* ------------------------------------------------------------- */}
      {frame >= 220 && frame < 700 && (
        <group position={[0, 0, 0]}>
          {/* High-speed passing cloud puffs */}
          {clouds.map((c, i) => {
            const zPos = ((c.z + (frame - 220) * 1.8) % 120) - 90;
            return (
              <mesh
                key={i}
                position={[c.x, c.y, zPos]}
                scale={[c.scale, c.scale * 0.35, c.scale * 0.7]}
              >
                <sphereGeometry args={[1, 12, 12]} />
                <meshStandardMaterial
                  color="#F1F5F9"
                  transparent
                  opacity={0.65}
                  roughness={0.9}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. BEAT 3 & 4: STRATOSPHERE & CURVED EARTH LIMB (Frames 529 - 1400) */}
      {/* ------------------------------------------------------------- */}
      {frame >= 500 && frame < 1450 && (
        <group position={[0, -32, -65]}>
          {/* Curved Earth surface */}
          <mesh>
            <sphereGeometry args={[34, 48, 48]} />
            <meshStandardMaterial
              color="#0284C7"
              emissive="#0369A1"
              emissiveIntensity={0.25}
              roughness={0.7}
            />
          </mesh>
          {/* Atmospheric blue limb glow */}
          <mesh scale={[1.035, 1.035, 1.035]}>
            <sphereGeometry args={[34, 32, 32]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. BEAT 5: ORBITAL ESCAPE & LUNAR ENCOUNTER (Frames 1150 - 1700) */}
      {/* ------------------------------------------------------------- */}
      {frame >= 1150 && (
        <group>
          {/* Receding blue marble Earth */}
          {frame < 1720 && (
            <group position={[14, -8, -130 - (frame - 1150) * 0.45]}>
              <mesh>
                <sphereGeometry args={[15, 36, 36]} />
                <meshStandardMaterial
                  color="#1D4ED8"
                  emissive="#0B132B"
                  roughness={0.5}
                />
              </mesh>
              {/* Atmospheric swirl */}
              <mesh scale={[1.025, 1.025, 1.025]}>
                <sphereGeometry args={[15, 24, 24]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.45}
                  roughness={0.8}
                />
              </mesh>
            </group>
          )}

          {/* Photorealistic Moon flyby */}
          {frame >= 1293 && frame < 1590 && (
            <mesh
              position={[
                -18 + (frame - 1293) * 0.14,
                7,
                -70 - (frame - 1293) * 0.25,
              ]}
            >
              <sphereGeometry args={[6.5, 32, 32]} />
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
      {/* 5. MULTI-LAYER STARFIELD (Frames 600+)                        */}
      {/* ------------------------------------------------------------- */}
      {frame >= 600 && (
        <points position={[0, 0, (frame * 1.2) % 80]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[starPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={frame > 1400 ? 1.8 : 0.9}
            color={frame > 1600 ? "#7DD3FC" : "#FFFFFF"}
            transparent
            opacity={Math.min(1, (frame - 600) / 180)}
          />
        </points>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. HYPERSPEED WARP STREAKS (Frames 864+)                      */}
      {/* ------------------------------------------------------------- */}
      {frame >= 864 && (
        <lineSegments position={[0, 0, (frame * 4.0) % 100]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[streakPositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={frame >= 1610 ? "#00F0FF" : "#F59E0B"}
            transparent
            opacity={frame >= 1610 ? 0.85 : 0.45}
          />
        </lineSegments>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. BEAT 6: TERRELL-PENROSE RELATIVISTIC TUNNEL (Frames 1580+)  */}
      {/* ------------------------------------------------------------- */}
      {frame >= 1580 && (
        <group position={[0, 0, -75]}>
          {/* Concentric Aberration Ring Grids */}
          {[10, 22, 36, 52, 70, 92].map((radius, idx) => (
            <mesh
              key={idx}
              rotation={[0, 0, (time * 0.4 + idx * 0.5) % Math.PI]}
              position={[0, 0, -idx * 16]}
            >
              <ringGeometry args={[radius - 0.35, radius, 64]} />
              <meshBasicMaterial
                color={
                  idx < 2
                    ? "#00F0FF"
                    : idx < 4
                    ? "#38BDF8"
                    : idx < 5
                    ? "#6366F1"
                    : "#EF4444"
                }
                transparent
                opacity={0.75}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}

          {/* Central Blinding Doppler Blue Singularity ahead */}
          <mesh position={[0, 0, -110]}>
            <sphereGeometry args={[20, 36, 36]} />
            <meshBasicMaterial
              color="#E0F2FE"
              transparent
              opacity={0.92 + Math.sin(frame * 0.6) * 0.08}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

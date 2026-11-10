import React, { useMemo, useRef } from "react";
import * as THREE from "three";

interface FlightEnvironmentsProps {
  frame: number;
  time: number;
  velocity: number;
  gamma: number;
}

export const FlightEnvironments3D: React.FC<FlightEnvironmentsProps> = ({
  frame,
  time,
  velocity,
  gamma,
}) => {
  // Deterministic speeds for scrolling textures/meshes
  const scrollOffset = (frame * Math.min(velocity, 20000) * 0.005) % 100;

  // Starfield particles
  const starCount = 1200;
  const starPositions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 160;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 2] = -Math.random() * 300;
    }
    return pos;
  }, []);

  // Hyperspeed warp streak lines for high speeds (Frames 864+)
  const streakCount = 400;
  const streakPositions = useMemo(() => {
    const pos = new Float32Array(streakCount * 6);
    for (let i = 0; i < streakCount; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 40;
      const z = -Math.random() * 180;
      const len = 4 + Math.random() * 16;
      // Start point
      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;
      // End point (stretched backward along Z)
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z + len;
    }
    return pos;
  }, []);

  return (
    <group>
      {/* ------------------------------------------------------------- */}
      {/* BIOME 1: COUNTRYSIDE HILLS & GROUND (Frames 0 - 320)         */}
      {/* ------------------------------------------------------------- */}
      {frame < 360 && (
        <group position={[0, -2.4, -40]}>
          {/* Rolling terrain plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (scrollOffset % 40) - 20]}>
            <planeGeometry args={[60, 140, 20, 30]} />
            <meshStandardMaterial
              color="#2E7D32"
              roughness={0.9}
              transparent
              opacity={frame > 270 ? Math.max(0, (360 - frame) / 90) : 1}
            />
          </mesh>

          {/* Distant hills */}
          <mesh position={[0, 6, -80]}>
            <cylinderGeometry args={[45, 55, 18, 16]} />
            <meshStandardMaterial
              color="#1B5E20"
              roughness={0.9}
              transparent
              opacity={frame > 270 ? Math.max(0, (360 - frame) / 90) : 1}
            />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BIOME 2: TRANSONIC CLOUD DECK (Frames 200 - 650)              */}
      {/* ------------------------------------------------------------- */}
      {frame >= 200 && frame < 700 && (
        <group position={[0, -1.8, -30]}>
          {/* Cloud plane moving backwards */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (scrollOffset % 50) - 25]}>
            <planeGeometry args={[70, 150, 16, 16]} />
            <meshStandardMaterial
              color="#ECEFF1"
              transparent
              opacity={0.8}
              roughness={0.9}
            />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BIOME 3 & 4: STRATOSPHERE & PLASMA HORIZON (Frames 529 - 1350) */}
      {/* ------------------------------------------------------------- */}
      {frame >= 500 && frame < 1400 && (
        <group position={[0, -28, -60]}>
          {/* Curvature of Earth */}
          <mesh>
            <sphereGeometry args={[30, 32, 32]} />
            <meshStandardMaterial
              color="#0284C7"
              emissive="#0369A1"
              emissiveIntensity={0.3}
              roughness={0.7}
            />
          </mesh>
          {/* Atmospheric blue rim halo */}
          <mesh scale={[1.04, 1.04, 1.04]}>
            <sphereGeometry args={[30, 32, 32]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.25}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BIOME 5: DEEP SPACE / ORBITAL ESCAPE (Frames 1100 - 1700)     */}
      {/* ------------------------------------------------------------- */}
      {frame >= 1100 && (
        <group>
          {/* Distant receding Earth */}
          {frame < 1700 && (
            <group position={[12, -8, -120 - (frame - 1100) * 0.4]}>
              <mesh>
                <sphereGeometry args={[14, 32, 32]} />
                <meshStandardMaterial
                  color="#1D4ED8"
                  emissive="#0F172A"
                  roughness={0.6}
                />
              </mesh>
              {/* Cloud swirls on Earth */}
              <mesh scale={[1.02, 1.02, 1.02]}>
                <sphereGeometry args={[14, 24, 24]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.4}
                  roughness={0.9}
                />
              </mesh>
            </group>
          )}

          {/* Passing Moon in Beat 5 (Frames 1293 - 1550) */}
          {frame >= 1293 && frame < 1580 && (
            <mesh position={[-16 + (frame - 1293) * 0.12, 6, -60 - (frame - 1293) * 0.2]}>
              <sphereGeometry args={[5, 24, 24]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.95} />
            </mesh>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STARS & HYPERSPEED STREAKS (Frames 600+)                      */}
      {/* ------------------------------------------------------------- */}
      {frame >= 600 && (
        <points position={[0, 0, (frame * 0.8) % 60]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[starPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={frame > 1400 ? 1.6 : 0.8}
            color={frame > 1600 ? "#67E8F9" : "#FFFFFF"}
            transparent
            opacity={Math.min(1, (frame - 600) / 200)}
          />
        </points>
      )}

      {/* Relativistic Warp Lines (Beat 4, 5, 6) */}
      {frame >= 900 && (
        <lineSegments position={[0, 0, (frame * 2.5) % 80]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[streakPositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={frame >= 1600 ? "#00F0FF" : "#F59E0B"}
            transparent
            opacity={frame >= 1600 ? 0.75 : 0.4}
          />
        </lineSegments>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BIOME 6: RELATIVISTIC ABERRATION TUNNEL (Frames 1550 - 1963)  */}
      {/* ------------------------------------------------------------- */}
      {frame >= 1550 && (
        <group position={[0, 0, -80]}>
          {/* Concentric Lorentz Aberration Circles */}
          {[12, 24, 38, 54, 72].map((radius, idx) => (
            <mesh
              key={idx}
              rotation={[0, 0, (time * 0.2 + idx) % Math.PI]}
              position={[0, 0, -idx * 15]}
            >
              <ringGeometry args={[radius - 0.2, radius, 48]} />
              <meshBasicMaterial
                color={idx < 2 ? "#00F0FF" : idx < 4 ? "#3B82F6" : "#EF4444"}
                transparent
                opacity={0.65}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}

          {/* Central Blinding Doppler Blue Singularity ahead */}
          <mesh position={[0, 0, -120]}>
            <sphereGeometry args={[18, 32, 32]} />
            <meshBasicMaterial
              color="#A5F3FC"
              transparent
              opacity={0.85 + Math.sin(frame * 0.5) * 0.15}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

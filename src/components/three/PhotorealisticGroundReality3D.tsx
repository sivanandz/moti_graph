import React, { useMemo } from "react";
import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";

interface PhotorealisticGroundReality3DProps {
  frame: number;
  time: number;
  flashIntensity: number;
}

export const PhotorealisticGroundReality3D: React.FC<
  PhotorealisticGroundReality3DProps
> = ({ frame, time, flashIntensity }) => {
  // 1. Rayleigh & Mie Physical Atmospheric Skybox
  const skyObject = useMemo(() => {
    const sky = new Sky();
    sky.scale.setScalar(450000);

    const uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = 4.5;
    uniforms["rayleigh"].value = 1.8;
    uniforms["mieCoefficient"].value = 0.003;
    uniforms["mieDirectionalG"].value = 0.88;

    // Crisp midday sun directly overhead
    const sun = new THREE.Vector3(20, 100, 30).normalize();
    uniforms["sunPosition"].value.copy(sun);

    return sky;
  }, []);

  // 2. Procedural Manhattan-Scale Skyscraper City Block
  const buildings = useMemo(() => {
    const list: {
      pos: [number, number, number];
      size: [number, number, number];
      color: string;
      windowColor: string;
      roofType: "tower" | "spire" | "chiller";
    }[] = [];

    // Left and right avenue canyon rows (X from -45 to -6, and +6 to +45; Z from -60 to 40)
    const buildingColors = ["#1E293B", "#334155", "#0F172A", "#1E293B", "#262626", "#18181B"];
    const windowColors = ["#BAE6FD", "#E0F2FE", "#F8FAFC", "#94A3B8"];

    // Left canyon flank
    for (let row = 0; row < 6; row++) {
      const z = -50 + row * 16;
      // Front tower (close to street)
      list.push({
        pos: [-10.5 - (row % 2) * 2, 16 + (row % 4) * 6, z],
        size: [8, 32 + (row % 4) * 12, 11],
        color: buildingColors[row % buildingColors.length],
        windowColor: windowColors[row % windowColors.length],
        roofType: row % 2 === 0 ? "spire" : "chiller",
      });
      // Back high-rise tower (further from street)
      list.push({
        pos: [-24 - (row % 3) * 3, 24 + ((row * 3) % 5) * 6, z + 2],
        size: [12, 48 + ((row * 3) % 5) * 12, 13],
        color: buildingColors[(row + 2) % buildingColors.length],
        windowColor: windowColors[(row + 1) % windowColors.length],
        roofType: "tower",
      });
    }

    // Right canyon flank
    for (let row = 0; row < 6; row++) {
      const z = -50 + row * 16;
      // Front tower
      list.push({
        pos: [10.5 + (row % 2) * 2, 18 + ((row + 1) % 4) * 6, z],
        size: [8, 36 + ((row + 1) % 4) * 12, 11],
        color: buildingColors[(row + 1) % buildingColors.length],
        windowColor: windowColors[(row + 2) % windowColors.length],
        roofType: row % 3 === 0 ? "spire" : "chiller",
      });
      // Back high-rise tower
      list.push({
        pos: [24 + (row % 3) * 3, 26 + ((row * 2) % 5) * 6, z - 2],
        size: [12, 52 + ((row * 2) % 5) * 12, 13],
        color: buildingColors[(row + 3) % buildingColors.length],
        windowColor: windowColors[row % windowColors.length],
        roofType: "tower",
      });
    }

    // Distant background skyline block (Z = -65)
    for (let col = -3; col <= 3; col++) {
      list.push({
        pos: [col * 14, 30 + Math.abs(col) * 5, -75],
        size: [11, 60 + Math.abs(col) * 10, 11],
        color: "#0F172A",
        windowColor: "#E0F2FE",
        roofType: "tower",
      });
    }

    return list;
  }, []);

  // 3. Street Furniture (Lamp posts, traffic signals, parked vehicles)
  const streetProps = useMemo(() => {
    const lamps: [number, number, number][] = [];
    const cars: { pos: [number, number, number]; color: string }[] = [];
    const carColors = ["#E11D48", "#2563EB", "#F8FAFC", "#0F172A", "#D97706"];

    for (let i = -4; i <= 3; i++) {
      const z = i * 14;
      // Lamp posts on sidewalk edge (X = -5.8 and +5.8)
      lamps.push([-5.8, 0, z]);
      lamps.push([5.8, 0, z + 7]);

      // Parked cars on roadside
      cars.push({ pos: [-4.6, 0.45, z + 3], color: carColors[(i + 4) % carColors.length] });
      cars.push({ pos: [4.6, 0.45, z - 3], color: carColors[(i + 2) % carColors.length] });
    }
    return { lamps, cars };
  }, []);

  // Flash flare multiplier
  const flashColorIntensity = Math.min(1.0, flashIntensity * 2.0);

  return (
    <group>
      {/* 1. Rayleigh Physical Skybox */}
      <primitive object={skyObject} />

      {/* 2. Direct Sunlight & Sky Ambient Lighting */}
      <directionalLight
        position={[25, 60, 35]}
        intensity={flashIntensity > 0.05 ? 16.0 : 2.8}
        color={flashIntensity > 0.05 ? "#FFFBEB" : "#FFF7ED"}
        castShadow
      />
      <ambientLight
        intensity={flashIntensity > 0.05 ? 4.5 : 0.85}
        color="#BAE6FD"
      />

      {/* 3. Central Asphalt Avenue (Z-axis corridor) */}
      {/* Roadway (Width = 10 units) */}
      <mesh position={[0, -0.02, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 140]} />
        <meshStandardMaterial color="#18181B" roughness={0.88} metalness={0.15} />
      </mesh>

      {/* White Road Center Dashed Line */}
      {Array.from({ length: 18 }).map((_, idx) => (
        <mesh
          key={idx}
          position={[0, 0.005, -70 + idx * 7.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.22, 3.8]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>
      ))}

      {/* Pedestrian Crosswalk (Z = 5 and Z = -25) */}
      {[-25, 5].map((zCross, cIdx) => (
        <group key={cIdx} position={[0, 0.006, zCross]}>
          {Array.from({ length: 8 }).map((_, sIdx) => (
            <mesh
              key={sIdx}
              position={[-4.2 + sIdx * 1.2, 0, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.65, 3.5]} />
              <meshBasicMaterial color="#F8FAFC" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Sidewalks (Concrete Curbs on left and right) */}
      {/* Left Sidewalk */}
      <mesh position={[-7.5, 0.1, -10]}>
        <boxGeometry args={[4, 0.22, 140]} />
        <meshStandardMaterial color="#475569" roughness={0.82} />
      </mesh>
      {/* Right Sidewalk */}
      <mesh position={[7.5, 0.1, -10]}>
        <boxGeometry args={[4, 0.22, 140]} />
        <meshStandardMaterial color="#475569" roughness={0.82} />
      </mesh>

      {/* 4. Skyscraper Architecture Flanks */}
      {buildings.map((b, idx) => (
        <group key={idx} position={b.pos}>
          {/* Main Tower Massing */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>

          {/* Glazed Glass Window Facade Overlay */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[b.size[0] + 0.08, b.size[1] * 0.95, b.size[2] + 0.08]} />
            <meshStandardMaterial
              color={b.windowColor}
              roughness={0.12}
              metalness={0.92}
              transparent
              opacity={0.35}
            />
          </mesh>

          {/* Rooftop Details (Water tower or broadcast antenna) */}
          {b.roofType === "spire" && (
            <mesh position={[0, b.size[1] * 0.5 + 4, 0]}>
              <cylinderGeometry args={[0.08, 0.35, 8, 12]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.95} />
            </mesh>
          )}
          {b.roofType === "chiller" && (
            <mesh position={[0, b.size[1] * 0.5 + 1.2, 0]}>
              <boxGeometry args={[b.size[0] * 0.5, 2.4, b.size[2] * 0.5]} />
              <meshStandardMaterial color="#334155" roughness={0.7} />
            </mesh>
          )}
        </group>
      ))}

      {/* 5. Street Props: Lamps & Parked Cars */}
      {/* Lamp Posts */}
      {streetProps.lamps.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Vertical Pole */}
          <mesh position={[0, 2.4, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 4.8, 12]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} />
          </mesh>
          {/* Horizontal Arm */}
          <mesh position={[pos[0] < 0 ? 0.6 : -0.6, 4.7, 0]} rotation={[0, 0, pos[0] < 0 ? -0.4 : 0.4]}>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} />
          </mesh>
          {/* Lantern Head */}
          <mesh position={[pos[0] < 0 ? 1.1 : -1.1, 4.4, 0]}>
            <boxGeometry args={[0.3, 0.15, 0.25]} />
            <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Parked Cars */}
      {streetProps.cars.map((car, idx) => (
        <group key={idx} position={car.pos}>
          {/* Car Body Chassis */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.7, 0.55, 3.8]} />
            <meshStandardMaterial color={car.color} roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Car Cabin Roof */}
          <mesh position={[0, 0.65, -0.2]}>
            <boxGeometry args={[1.4, 0.48, 2.0]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Wheels */}
          {[-0.85, 0.85].map((wx, wIdx) => (
            <React.Fragment key={wIdx}>
              <mesh position={[wx, 0.05, 1.1]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
                <meshStandardMaterial color="#18181B" roughness={0.9} />
              </mesh>
              <mesh position={[wx, 0.05, -1.1]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
                <meshStandardMaterial color="#18181B" roughness={0.9} />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      ))}

      {/* 6. Prompt Nuclear Exposure Whiteout Flare (frame 860-904) */}
      {flashColorIntensity > 0.01 && (
        <mesh position={[0, 15, 10]}>
          <planeGeometry args={[120, 120]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={flashColorIntensity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

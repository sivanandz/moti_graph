import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { delayRender, continueRender, staticFile } from "remotion";
import { getPhysicsState } from "../physics/RelativisticPhysics";

interface PhysicalBirdProps {
  frame: number;
  time: number;
}

export const AccuratePhysicalBird3D: React.FC<PhysicalBirdProps> = ({
  frame,
  time,
}) => {
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [handle] = useState(() => delayRender("Loading Accurate Physical Stork"));
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Compute exact physical state from physics engine
  const physics = useMemo(() => getPhysicsState(frame), [frame]);
  const { velocity, beta, gamma, mach, machAngleRad, stagnationTempK, lengthContraction } = physics;

  // Load GLTF model
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      staticFile("Stork.glb"),
      (loaded) => {
        setGltf(loaded);
        continueRender(handle);
      },
      undefined,
      (err) => {
        console.error("Failed to load Stork.glb:", err);
        continueRender(handle);
      }
    );
  }, [handle]);

  // Clone scene & initialize mixer
  const { clonedScene, mixer } = useMemo(() => {
    if (!gltf) return { clonedScene: null, mixer: null };
    const scene = gltf.scene.clone(true);
    const newMixer = new THREE.AnimationMixer(scene);

    if (gltf.animations.length > 0) {
      const clip = gltf.animations[0];
      const action = newMixer.clipAction(clip);
      action.play();
    }
    return { clonedScene: scene, mixer: newMixer };
  }, [gltf]);

  mixerRef.current = mixer;

  // Flap rate: natural 2.2 flaps/s at 30 mph, increases with flight speed,
  // then time-dilates into aerodynamic glide lock at relativistic speeds
  const flapCycleSpeed = useMemo(() => {
    if (frame < 270) {
      return 1.0 + (frame / 270) * 0.8;
    } else if (frame < 529) {
      return 1.8 + ((frame - 270) / 259) * 2.5;
    } else if (frame < 864) {
      return 4.3 + ((frame - 529) / 335) * 3.5;
    } else if (frame < 1293) {
      return 7.8;
    } else {
      // Relativistic time dilation: wing flaps freeze as gamma increases
      return Math.max(0.04, 7.8 / Math.pow(Math.min(gamma, 20), 1.3));
    }
  }, [frame, gamma]);

  // Update morph target animation deterministically
  useEffect(() => {
    if (mixerRef.current && gltf && gltf.animations.length > 0) {
      const clipDuration = gltf.animations[0].duration;
      const cycleTime = (time * flapCycleSpeed * 1.1) % clipDuration;
      mixerRef.current.setTime(cycleTime);
    }
  }, [time, flapCycleSpeed, gltf]);

  // Material thermal Planck radiation simulation
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.material) return;

        if (!Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;

          if (frame >= 1293) {
            // Relativistic Cherenkov blueshift radiation
            mat.color.set("#F0FDF4");
            mat.emissive.set("#00F0FF");
            mat.emissiveIntensity = Math.min(4.0, 1.5 + beta * 3.0);
            mat.roughness = 0.15;
            mat.metalness = 0.85;
          } else if (stagnationTempK > 5000) {
            // Incandescent nitrogen/oxygen ionization plasma
            mat.color.set("#FEF08A");
            mat.emissive.set("#00FFAA");
            mat.emissiveIntensity = 2.2;
            mat.roughness = 0.2;
          } else if (stagnationTempK > 1500) {
            // Thermal stagnation friction (orange/red blackbody radiation)
            const tRatio = Math.min(1.0, (stagnationTempK - 1500) / 3500);
            mat.color.set("#FED7AA");
            mat.emissive.set(tRatio > 0.6 ? "#FF5500" : "#EA580C");
            mat.emissiveIntensity = 0.6 + tRatio * 1.2;
            mat.roughness = 0.35;
          } else if (mach >= 1.0) {
            // Supersonic leading edge heating
            mat.color.set("#E2E8F0");
            mat.emissive.set("#F59E0B");
            mat.emissiveIntensity = 0.35;
            mat.roughness = 0.45;
          } else {
            // Organic biological plumage
            mat.color.set("#94A3B8");
            mat.emissive.set("#000000");
            mat.emissiveIntensity = 0.0;
            mat.roughness = 0.65;
          }
        }
      }
    });
  }, [clonedScene, frame, stagnationTempK, mach, beta]);

  // Exact Mach shock cone geometry calculation:
  // Half-angle mu = arcsin(1 / M)
  // Cone radius at distance L: R = L * tan(mu)
  const coneLength = 3.2; // length along Z
  const coneRadius = Math.max(0.12, coneLength * Math.tan(machAngleRad));

  // Flight attitude: smooth aerodynamic roll, pitch and heave
  const rollAngle = Math.sin(time * 0.75) * 0.18;
  const pitchAngle = -0.04 - (mach > 1.0 ? 0.08 : 0);
  const yawAngle = Math.cos(time * 0.5) * 0.08;
  const bobY = Math.sin(time * flapCycleSpeed * Math.PI * 2) * (frame >= 1293 ? 0.006 : 0.045);

  // Stork native scale ~300 units -> 0.009 = ~2.7m wingspan
  const baseScale = 0.009;

  return (
    <group
      position={[0, bobY, 0]}
      rotation={[pitchAngle, Math.PI + yawAngle, rollAngle]}
      scale={[baseScale, baseScale, baseScale * lengthContraction]}
    >
      {/* 1. ANATOMICAL 3D BIRD MESH */}
      {clonedScene && <primitive object={clonedScene} />}

      {/* 2. REAL PHYSICAL MACH SHOCK CONE (Mach >= 1.0) */}
      {/* Formed strictly according to mu = arcsin(1/M) */}
      {mach >= 1.0 && frame < 1293 && (
        <group position={[0, 10, 20]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Outer Schlieren shock wave boundary */}
          <mesh scale={[coneRadius * 55, coneRadius * 55, coneLength * 70]}>
            <coneGeometry args={[1.0, 1.0, 48, 1, true]} />
            <meshBasicMaterial
              color={mach > 5.0 ? "#FF6B00" : "#E0F2FE"}
              transparent
              opacity={
                mach < 2.0
                  ? Math.sin(((frame - 270) / 259) * Math.PI) * 0.75
                  : 0.35
              }
              side={THREE.DoubleSide}
              wireframe={false}
            />
          </mesh>

          {/* Thin sharp condensation ring at the shock apex */}
          <mesh position={[0, -coneLength * 15, 0]} scale={[coneRadius * 40, coneRadius * 40, 1]}>
            <ringGeometry args={[0.9, 1.0, 48]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* 3. THERMONUCLEAR SHOCK EXPANSIONS (Beat 4: Atmospheric Fusion) */}
      {frame >= 864 && frame < 1293 && (
        <group position={[0, 10, -20]}>
          {[0, 1].map((idx) => {
            const phase = ((frame + idx * 12) % 24) / 24;
            const r = 40 + phase * 160;
            return (
              <mesh key={idx} scale={[r, r, 1]} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.92, 1.0, 36]} />
                <meshBasicMaterial
                  color="#10B981"
                  transparent
                  opacity={(1 - phase) * 0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 4. POINT LIGHT FROM BLACKBODY HEATING / RELATIVISTIC EMISSION */}
      {stagnationTempK > 1500 && (
        <pointLight
          position={[0, 12, 0]}
          color={frame >= 1293 ? "#00F0FF" : stagnationTempK > 5000 ? "#00FFAA" : "#FF6600"}
          intensity={frame >= 1293 ? 6.0 : stagnationTempK > 5000 ? 4.5 : 2.5}
          distance={45}
        />
      )}
    </group>
  );
};

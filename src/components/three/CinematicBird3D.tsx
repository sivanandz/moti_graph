import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { delayRender, continueRender, staticFile } from "remotion";

interface CinematicBird3DProps {
  frame: number;
  time: number;
  velocity: number; // m/s
  gamma: number;    // Lorentz factor
}

export const CinematicBird3D: React.FC<CinematicBird3DProps> = ({
  frame,
  time,
  velocity,
  gamma,
}) => {
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [handle] = useState(() => delayRender("Loading Cinematic Stork Model"));
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Load GLTF with Remotion delayRender
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

  // Clone scene & set up mixer
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

  // Calculate cumulative flap phase deterministically
  // Starts at natural ~2.5 flaps/sec, accelerates up to 15 flaps/sec at hypersonic,
  // then time-dilates (freezes) near lightspeed as gamma explodes
  const flapSpeed = useMemo(() => {
    if (frame < 270) {
      // Natural flight (1.0x to 1.8x)
      return 1.0 + (frame / 270) * 0.8;
    } else if (frame < 529) {
      // Supersonic rush (1.8x to 4.5x)
      return 1.8 + ((frame - 270) / 259) * 2.7;
    } else if (frame < 864) {
      // Hypersonic buzz (4.5x to 9.0x)
      return 4.5 + ((frame - 529) / 335) * 4.5;
    } else if (frame < 1293) {
      // Fusion ramjet (9.0x)
      return 9.0;
    } else {
      // Relativistic time dilation: flap rate appears frozen from observer frame
      return Math.max(0.08, 9.0 / Math.pow(Math.min(gamma, 15), 1.2));
    }
  }, [frame, gamma]);

  // Update mixer time deterministically
  useEffect(() => {
    if (mixerRef.current && gltf && gltf.animations.length > 0) {
      const clipDuration = gltf.animations[0].duration; // ~1.3s
      // Integrate flap phase
      const cycleTime = (time * flapSpeed * 1.2) % clipDuration;
      mixerRef.current.setTime(cycleTime);
    }
  }, [time, flapSpeed, gltf]);

  // Visual states
  const isTransonic = frame >= 270 && frame < 529;
  const isHypersonic = frame >= 529 && frame < 864;
  const isFusion = frame >= 864 && frame < 1293;
  const isRelativistic = frame >= 1293;

  // Dynamic bird material mutation
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.material) return;

        // Ensure we operate on a unique material instance
        if (!Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;

          if (isRelativistic) {
            mat.color.set("#E0F7FA");
            mat.emissive.set("#00E5FF");
            mat.emissiveIntensity = 3.5;
            mat.roughness = 0.1;
            mat.metalness = 0.9;
          } else if (isFusion) {
            mat.color.set("#FFF9C4");
            mat.emissive.set("#00FFAA");
            mat.emissiveIntensity = 2.4;
            mat.roughness = 0.2;
          } else if (isHypersonic) {
            mat.color.set("#FFB74D");
            mat.emissive.set("#FF3D00");
            mat.emissiveIntensity = 1.8;
            mat.roughness = 0.3;
          } else if (isTransonic) {
            mat.color.set("#ECEFF1");
            mat.emissive.set("#FF9800");
            mat.emissiveIntensity = 0.5 + Math.sin(frame * 0.5) * 0.3;
            mat.roughness = 0.4;
          } else {
            // Natural plumage
            mat.color.set("#CFD8DC");
            mat.emissive.set("#000000");
            mat.emissiveIntensity = 0.0;
            mat.roughness = 0.6;
          }
        }
      }
    });
  }, [clonedScene, isTransonic, isHypersonic, isFusion, isRelativistic, frame]);

  // Flight dynamics: natural banking, pitch and heave
  const rollAngle = Math.sin(time * 0.9) * 0.22;
  const pitchAngle =
    Math.sin(time * 2.2) * 0.06 -
    (isHypersonic ? 0.12 : isTransonic ? 0.08 : 0.02);
  const yawAngle = Math.cos(time * 0.7) * 0.1;
  const bobY = Math.sin(time * flapSpeed * Math.PI * 2) * (isRelativistic ? 0.01 : 0.06);

  // Lorentz contraction factor along flight vector (Z-axis)
  const lorentzScaleZ = Math.max(0.12, 1 / Math.min(gamma, 8));

  // Scale: Stork is ~300 units wide, scale to ~0.009 for a realistic 2.8m wingspan
  const baseScale = 0.009;

  return (
    <group
      ref={groupRef}
      position={[0, bobY, 0]}
      rotation={[pitchAngle, Math.PI + yawAngle, rollAngle]}
      scale={[baseScale, baseScale, baseScale * lorentzScaleZ]}
    >
      {/* 1. CLONED HIGH-FIDELITY ANIMATED MESH */}
      {clonedScene && <primitive object={clonedScene} />}

      {/* 2. DYNAMIC POINT LIGHT ON THE BIRD ITSELF */}
      {(isHypersonic || isFusion || isRelativistic) && (
        <pointLight
          position={[0, 10, 0]}
          intensity={isRelativistic ? 8.0 : isFusion ? 6.0 : 4.0}
          distance={40}
          color={isRelativistic ? "#00F0FF" : isFusion ? "#00FFAA" : "#FF5500"}
        />
      )}

      {/* 3. TRANSONIC PRANDTL-GLAUERT VAPOR SHOCK CONE (Mach 1.0) */}
      {isTransonic && (
        <group position={[0, 10, 10]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Outer vapor cone */}
          <mesh scale={[110, 110, 90]}>
            <coneGeometry args={[1.4, 2.2, 32, 1, true]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={
                Math.sin(((frame - 270) / 259) * Math.PI) * 0.85
              }
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Inner condensation shock disc */}
          <mesh position={[0, -0.6, 0]} scale={[120, 120, 1]}>
            <ringGeometry args={[0.4, 1.6, 32]} />
            <meshBasicMaterial
              color="#E0F7FA"
              transparent
              opacity={
                Math.sin(((frame - 270) / 259) * Math.PI) * 0.7
              }
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* 4. HYPERSONIC INCANDESCENT PLASMA SHEATH (Mach 20) */}
      {isHypersonic && (
        <group position={[0, 8, 0]}>
          {/* Plasma teardrop envelope */}
          <mesh scale={[140, 110, 190]}>
            <sphereGeometry args={[1.0, 24, 24]} />
            <meshBasicMaterial
              color="#FF4500"
              transparent
              opacity={0.42 + Math.sin(frame * 0.6) * 0.18}
            />
          </mesh>
          {/* Trailing plasma streak ribbons */}
          {[-80, 80].map((xOffset, i) => (
            <mesh
              key={i}
              position={[xOffset, 0, -60]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[18, 180, 1]}
            >
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                color="#FFAA00"
                transparent
                opacity={0.65}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* 5. THERMONUCLEAR FUSION RAMJET PULSE WAKE (0.01c) */}
      {isFusion && (
        <group position={[0, 10, -40]}>
          {[0, 1, 2].map((ringIdx) => {
            const phase = ((frame + ringIdx * 8) % 24) / 24;
            return (
              <mesh
                key={ringIdx}
                position={[0, 0, -phase * 160]}
                scale={[80 + phase * 140, 80 + phase * 140, 1]}
              >
                <ringGeometry args={[0.8, 1.4, 32]} />
                <meshBasicMaterial
                  color="#00FFAA"
                  transparent
                  opacity={(1 - phase) * 0.9}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 6. RELATIVISTIC CHERENKOV OPTICAL SHROUD (0.999c) */}
      {isRelativistic && (
        <group position={[0, 8, 20]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh scale={[130, 130, 220]}>
            <coneGeometry args={[1.2, 2.6, 32, 1, true]} />
            <meshBasicMaterial
              color="#00F0FF"
              transparent
              opacity={0.65 + Math.sin(frame * 0.9) * 0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

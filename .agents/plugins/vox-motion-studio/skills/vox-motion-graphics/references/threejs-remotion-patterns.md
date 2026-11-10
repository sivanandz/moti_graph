# Three.js & React-Three-Fiber Patterns for Remotion

This guide provides tested boilerplate patterns combining `@remotion/three`, `@react-three/fiber`, and `@react-three/drei` for documentary-style 3D motion graphics.

## 1. Scene Canvas Wrapper Setup

```tsx
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig, useCurrentFrame, interpolate, spring } from "remotion";
import { Canvas } from "@react-three/fiber";

export const ThreeDScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, 1.5, 5], fov: 45 }}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <IsometricDocumentCard durationInFrames={durationInFrames} />
    </ThreeCanvas>
  );
};
```

## 2. Floating Isometric Document / Newspaper Card

Creates an archival document floating in 3D space with subtle camera push and rotation:

```tsx
import React, { useRef } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import * as THREE from "three";

export const IsometricDocumentCard: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meshRef = useRef<THREE.Mesh>(null);

  // Snappy entrance spring
  const enterProgress = spring({ frame, fps, config: { damping: 14, mass: 0.6, stiffness: 120 } });
  const yPos = interpolate(enterProgress, [0, 1], [-3, 0]);

  // Slow documentary camera drift
  const rotY = interpolate(frame, [0, durationInFrames], [-0.25, -0.05]);
  const rotX = interpolate(frame, [0, durationInFrames], [0.35, 0.25]);

  return (
    <mesh ref={meshRef} position={[0, yPos, 0]} rotation={[rotX, rotY, 0]}>
      {/* 16:9 document card plane */}
      <boxGeometry args={[3.2, 2.0, 0.04]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.4} metalness={0.1} />
    </mesh>
  );
};
```

## 3. 3D Globe / Geospatial Node Pointing

For geopolitical explainer segments:

```tsx
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const RotatingGlobe: React.FC<{ durationInFrames: number; targetRotation?: number }> = ({
  durationInFrames,
  targetRotation = Math.PI * 0.5,
}) => {
  const frame = useCurrentFrame();
  const rotationY = interpolate(frame, [0, durationInFrames], [0, targetRotation]);

  return (
    <group rotation={[0.2, rotationY, 0]}>
      <mesh>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial color="#E5E3DD" roughness={0.8} wireframe={false} />
      </mesh>
      {/* Pin beacon at target coordinates */}
      <mesh position={[0.9, 1.2, 0.8]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#E63946" />
      </mesh>
    </group>
  );
};
```

## 4. Layered Paper Parallax (Multi-plane 3D Depth)
Place background textures at `z = -2`, midground charts at `z = 0`, and foreground callout badges at `z = 1`. Modulate camera `x` and `y` by `sin(frame / 60) * 0.05` to create natural documentary physical parallax.

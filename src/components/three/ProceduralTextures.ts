import * as THREE from "three";

/**
 * Isomorphic Procedural PBR Texture Generator
 * Uses pure THREE.DataTexture and typed Uint8Arrays.
 * Works seamlessly in both Node.js SSR evaluation and Chromium WebGL runtime.
 */

// 1. Brushed Metal Normal Map (High-frequency anisotropic micro-scratches)
export function createBrushedMetalTexture(): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    // Noise baseline for each groove
    const rowNoise = (Math.sin(y * 14.5) * 0.5 + (Math.random() - 0.5)) * 28;
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const scratch = rowNoise + (Math.random() - 0.5) * 10;
      data[idx] = Math.min(255, Math.max(0, Math.floor(128 + scratch))); // Red (tangent X tilt)
      data[idx + 1] = Math.min(255, Math.max(0, Math.floor(128 + (Math.random() - 0.5) * 6))); // Green (tangent Y tilt)
      data[idx + 2] = 255; // Blue (normal Z)
      data[idx + 3] = 255; // Alpha
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 24);
  texture.needsUpdate = true;
  return texture;
}

// 2. Cracked Molten Bedrock Texture (Crater bottom lava veins)
export function createCrackedLavaTexture(): {
  diffuse: THREE.DataTexture;
  emissive: THREE.DataTexture;
} {
  const size = 256;
  const diffData = new Uint8Array(size * size * 4);
  const emissData = new Uint8Array(size * size * 4);

  // Generate fractal crack network using distance field to crack lines
  const crackLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    const angle = Math.random() * Math.PI * 2;
    const len = 30 + Math.random() * 60;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;
    crackLines.push({ x1, y1, x2, y2 });
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Find minimum distance to any crack line segment
      let minDist = 999;
      for (const line of crackLines) {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const l2 = dx * dx + dy * dy;
        let t = ((x - line.x1) * dx + (y - line.y1) * dy) / Math.max(1, l2);
        t = Math.max(0, Math.min(1, t));
        const px = line.x1 + t * dx;
        const py = line.y1 + t * dy;
        const dist = Math.hypot(x - px, y - py);
        if (dist < minDist) minDist = dist;
      }

      // Add high-frequency noise to crack edges
      const crackWidth = 2.5 + Math.sin(x * 0.2) * 0.8;
      const isCrack = minDist < crackWidth;
      const isGlow = minDist < crackWidth * 3.5;

      if (isCrack) {
        // Core incandescent yellow/orange lava
        diffData[idx] = 255; // R
        diffData[idx + 1] = 160; // G
        diffData[idx + 2] = 20; // B
        diffData[idx + 3] = 255;

        emissData[idx] = 255;
        emissData[idx + 1] = 120;
        emissData[idx + 2] = 0;
        emissData[idx + 3] = 255;
      } else if (isGlow) {
        // Red magma heating halo
        const falloff = 1 - (minDist - crackWidth) / (crackWidth * 2.5);
        diffData[idx] = Math.floor(40 + 180 * falloff);
        diffData[idx + 1] = Math.floor(25 + 40 * falloff);
        diffData[idx + 2] = 20;
        diffData[idx + 3] = 255;

        emissData[idx] = Math.floor(220 * falloff);
        emissData[idx + 1] = Math.floor(50 * falloff);
        emissData[idx + 2] = 0;
        emissData[idx + 3] = 255;
      } else {
        // Dark basalt/obsidian rock
        const rockNoise = Math.floor(20 + Math.random() * 15);
        diffData[idx] = rockNoise;
        diffData[idx + 1] = rockNoise + 2;
        diffData[idx + 2] = rockNoise + 6;
        diffData[idx + 3] = 255;

        emissData[idx] = 0;
        emissData[idx + 1] = 0;
        emissData[idx + 2] = 0;
        emissData[idx + 3] = 255;
      }
    }
  }

  const diffuse = new THREE.DataTexture(diffData, size, size, THREE.RGBAFormat);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.needsUpdate = true;

  const emissive = new THREE.DataTexture(emissData, size, size, THREE.RGBAFormat);
  emissive.wrapS = THREE.RepeatWrapping;
  emissive.wrapT = THREE.RepeatWrapping;
  emissive.needsUpdate = true;

  return { diffuse, emissive };
}

// 3. Rolling Terrain Height Displacement (2D Perlin / Simplex approximation)
export function getTerrainHeight(x: number, z: number): number {
  const h1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 3.5;
  const h2 = Math.sin(x * 0.18 + 1.2) * Math.cos(z * 0.15 - 0.8) * 1.5;
  const h3 = Math.sin(x * 0.4 - 0.5) * Math.cos(z * 0.35 + 1.1) * 0.6;
  return h1 + h2 + h3;
}

/**
 * Relativistic Needle Impact Physics Engine
 * Implements Einstein's Special Relativity & High-Energy Ballistic Equations
 * 
 * Target Parameters:
 * - Needle mass: m0 = 1.0 g = 1e-3 kg
 * - Needle rest dimensions: L0 = 50 mm (0.05 m), d0 = 1 mm (0.001 m)
 * - Rest volume: V0 = pi * (d0/2)^2 * L0 = 3.927e-8 m^3
 * - Steel density: rho = 7,850 kg/m^3 (mass = 0.31 g, normalized to 1.0 g heavy alloy/tungsten needle)
 * - Velocity: v = 0.999999 c (beta = 0.999999)
 * - Lorentz factor: gamma = 1 / sqrt(1 - beta^2) = 707.10678
 * - Contracted length: L = L0 / gamma = 70.71 micrometers (0.0707 mm)
 * - Relativistic Kinetic Energy: Ek = (gamma - 1) * m0 * c^2 = 6.346e13 Joules
 * - TNT equivalent: 15.17 Kilotons TNT (Hiroshima class: ~15 kt)
 * - Atmospheric transit time: 100 km / (0.999999 c) = 333.56 microseconds
 * - Detonation timescale: crust penetration depth / v < 10 nanoseconds
 * - Retinal nerve signal conduction time: ~100 to 150 milliseconds
 */

export const SPEED_OF_LIGHT = 299_792_458; // m/s
export const NEEDLE_REST_MASS_KG = 0.001; // 1 gram
export const NEEDLE_REST_LENGTH_M = 0.05; // 5 cm
export const NEEDLE_REST_RADIUS_M = 0.0005; // 0.5 mm radius
export const ATMOSPHERE_DEPTH_M = 100_000; // 100 km Karman line
export const TNT_JOULE_EQUIVALENT = 4.184e9; // 1 ton of TNT = 4.184e9 J
export const RETINAL_NERVE_DELAY_S = 0.100; // 100 ms human perception threshold

export interface NeedlePhysicsState {
  frame: number;
  beatIndex: number;
  perspective: "GROUND" | "SIMULATOR" | "CRUST" | "CRATER";
  // Kinematics
  beta: number; // v / c
  velocityMs: number;
  gamma: number; // Lorentz factor
  contractedLengthM: number;
  contractedLengthMicrons: number;
  // Energetics
  kineticEnergyJoules: number;
  energyKilotonTNT: number;
  temperatureKelvin: number;
  // Space-time
  transitTimeMicroseconds: number;
  photonLeadNanoseconds: number;
  perceptionRatio: number; // Ratio of human nerve speed to event speed
  // Visual FX parameters
  cameraMode: "MACRO_DROP" | "CALM_SKY" | "RELATIVISTIC_DISC" | "FUSION_BOREHOLE" | "DETONATION" | "CRATER_SURVEY";
  flashIntensity: number;
  craterRadiusM: number;
  plasmaGlowIntensity: number;
}

export function getNeedlePhysicsState(frame: number): NeedlePhysicsState {
  let beatIndex = 1;
  let perspective: "GROUND" | "SIMULATOR" | "CRUST" | "CRATER" = "GROUND";
  let cameraMode: NeedlePhysicsState["cameraMode"] = "MACRO_DROP";
  
  let beta = 0.0;
  let flashIntensity = 0.0;
  let craterRadiusM = 0.0;
  let plasmaGlowIntensity = 0.0;

  // Timeline boundaries from Edge-TTS manifest:
  // Beat 1: 0 - 388 (Hook: Needle dropped at rest -> what if 0.999999c)
  // Beat 2: 388 - 904 (Perspective 1: Ground Reality, peaceful sky, flash)
  // Beat 3: 904 - 1602 (Perspective 2: Relativistic Simulator, gamma=707, pancake disc, borehole)
  // Beat 4: 1602 - 2074 (Crust Impact & 15.2 kt detonation)
  // Beat 5: 2074 - 2522 (Biological takeaway & 300m crater survey + 2.5s tail)

  if (frame < 388) {
    beatIndex = 1;
    perspective = "GROUND";
    cameraMode = "MACRO_DROP";
    // First 200 frames: falling at 9.8 m/s^2 from hand
    if (frame < 200) {
      const t = frame / 200;
      beta = (4.4 * t) / SPEED_OF_LIGHT; // 0 to 4.4 m/s (1 meter drop)
    } else {
      // Accelerating conceptually toward c
      const t = (frame - 200) / 188;
      beta = 0.00001 + Math.pow(t, 4) * (0.999999 - 0.00001);
    }
  } else if (frame < 904) {
    beatIndex = 2;
    perspective = "GROUND";
    cameraMode = "CALM_SKY";
    beta = 0.999999;
    // Detonation flash occurs near the end of Beat 2 (around frame 860-904)
    if (frame >= 860) {
      const flashT = (frame - 860) / 44;
      flashIntensity = Math.exp(-flashT * 4.0);
    }
  } else if (frame < 1602) {
    beatIndex = 3;
    perspective = "SIMULATOR";
    cameraMode = frame < 1250 ? "RELATIVISTIC_DISC" : "FUSION_BOREHOLE";
    beta = 0.999999;
    plasmaGlowIntensity = Math.min(1.0, (frame - 904) / 100);
  } else if (frame < 2074) {
    beatIndex = 4;
    perspective = "CRUST";
    cameraMode = "DETONATION";
    beta = 0.999999;
    const impactProgress = Math.min(1.0, (frame - 1602) / 150);
    // Crater growth follows Taylor-Sedov blast wave scaling: R(t) ~ t^(2/5)
    craterRadiusM = Math.pow(impactProgress, 0.4) * 150.0; // 0 to 150m radius (300m diameter)
    flashIntensity = Math.max(0, 1.0 - (frame - 1602) / 60);
    plasmaGlowIntensity = 1.0;
  } else {
    beatIndex = 5;
    perspective = "CRATER";
    cameraMode = "CRATER_SURVEY";
    beta = 0.0; // Rest state after energy dissipation
    craterRadiusM = 150.0; // Full 300m crater
    plasmaGlowIntensity = Math.max(0.1, 1.0 - (frame - 2074) / 200);
  }

  // Clamped beta for numerical stability
  const clampedBeta = Math.min(0.999999, Math.max(0, beta));
  const velocityMs = clampedBeta * SPEED_OF_LIGHT;

  // Lorentz Factor γ = 1 / sqrt(1 - β²)
  const gamma = 1 / Math.sqrt(Math.max(1e-8, 1 - clampedBeta * clampedBeta));

  // Length contraction: L = L0 / gamma
  const contractedLengthM = NEEDLE_REST_LENGTH_M / gamma;
  const contractedLengthMicrons = contractedLengthM * 1e6;

  // Relativistic kinetic energy: Ek = (gamma - 1) * m0 * c^2
  const kineticEnergyJoules = (gamma - 1) * NEEDLE_REST_MASS_KG * Math.pow(SPEED_OF_LIGHT, 2);
  const energyKilotonTNT = kineticEnergyJoules / (TNT_JOULE_EQUIVALENT * 1000);

  // Stagnation / plasma temperature:
  // At 0.999999c in air, nuclear fusion temperature exceeds 10^7 K (10 million Kelvin)
  let temperatureKelvin = 293.15;
  if (clampedBeta > 0.9) {
    temperatureKelvin = 293.15 + (clampedBeta / 0.999999) * 1.5e7;
  }

  // Transit time through atmosphere (100 km):
  const transitTimeMicroseconds = (ATMOSPHERE_DEPTH_M / Math.max(1, velocityMs)) * 1e6;

  // Photon lead time: light travels at c, needle at v = beta * c.
  // Delta t = h * (1/v - 1/c) = (h/c) * (1 - beta) / beta
  const photonLeadNanoseconds = (ATMOSPHERE_DEPTH_M / SPEED_OF_LIGHT) * (1 - clampedBeta) * 1e9;

  // Perception ratio: 100 ms optic nerve speed vs 333 us transit
  const perceptionRatio = RETINAL_NERVE_DELAY_S / (transitTimeMicroseconds * 1e-6);

  return {
    frame,
    beatIndex,
    perspective,
    beta: clampedBeta,
    velocityMs,
    gamma,
    contractedLengthM,
    contractedLengthMicrons,
    kineticEnergyJoules,
    energyKilotonTNT,
    temperatureKelvin,
    transitTimeMicroseconds,
    photonLeadNanoseconds,
    perceptionRatio,
    cameraMode,
    flashIntensity,
    craterRadiusM,
    plasmaGlowIntensity,
  };
}

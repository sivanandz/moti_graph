/**
 * Relativistic and Aerodynamic Physics Engine
 * Implements exact physical equations for supersonic, hypersonic, and relativistic flight.
 */

export const SPEED_OF_LIGHT = 299_792_458; // m/s (c)
export const SPEED_OF_SOUND = 343; // m/s (Mach 1 at sea level, 20°C)
export const T_AMBIENT = 288.15; // Kelvin (15°C sea level)
export const GAMMA_AIR = 1.4; // Ratio of specific heats for diatomic gas

/**
 * Computes velocity across narrative beats:
 * Beat 1 (0-270): 13.4 m/s (30 mph) -> 320 m/s (subsonic)
 * Beat 2 (270-529): 343 m/s (Mach 1.0) -> 2,000 m/s (Mach 5.8)
 * Beat 3 (529-864): 2,000 m/s -> 25,000 m/s (Mach 73, hypersonic escape)
 * Beat 4 (864-1293): 25,000 m/s -> 0.01c (3,000,000 m/s, atmospheric fusion)
 * Beat 5 (1293-1610): 0.01c -> 0.65c (deep space vacuum)
 * Beat 6 (1610-2040): 0.65c -> 0.99995c (ultra-relativistic)
 */
export function getPhysicsState(frame: number) {
  let v = 13.4;

  if (frame < 270) {
    const t = frame / 270;
    v = 13.4 + Math.pow(t, 2) * (320 - 13.4);
  } else if (frame < 529) {
    const t = (frame - 270) / 259;
    v = 343 + t * (2000 - 343);
  } else if (frame < 864) {
    const t = (frame - 529) / 335;
    v = 2000 + Math.pow(t, 1.8) * (25000 - 2000);
  } else if (frame < 1293) {
    const t = (frame - 864) / 429;
    v = 25000 + Math.pow(t, 2.2) * (SPEED_OF_LIGHT * 0.01 - 25000);
  } else if (frame < 1610) {
    const t = (frame - 1293) / 317;
    v = SPEED_OF_LIGHT * (0.01 + Math.pow(t, 1.5) * (0.65 - 0.01));
  } else {
    const t = Math.min(1.0, (frame - 1610) / 380);
    // Smooth asymptotic approach to c
    v = SPEED_OF_LIGHT * (0.65 + (1 - Math.exp(-t * 3.5)) * (0.99995 - 0.65));
  }

  const beta = Math.min(0.99999, Math.max(0, v / SPEED_OF_LIGHT));
  // Lorentz Factor γ = 1 / sqrt(1 - β²)
  const gamma = 1 / Math.sqrt(Math.max(1e-7, 1 - beta * beta));
  // Mach Number M = v / a
  const mach = v / SPEED_OF_SOUND;

  // Exact Mach cone half-angle: μ = arcsin(1 / M) in radians
  let machAngleRad = Math.PI / 2;
  if (mach >= 1.0) {
    machAngleRad = Math.asin(1 / Math.max(1.001, mach));
  }
  const machAngleDeg = (machAngleRad * 180) / Math.PI;

  // Stagnation Temperature: T0 = T_inf * (1 + ((gamma_air - 1) / 2) * M^2)
  let stagnationTempK = T_AMBIENT;
  if (mach >= 1.0 && frame < 1293) {
    stagnationTempK = T_AMBIENT * (1 + ((GAMMA_AIR - 1) / 2) * Math.pow(Math.min(mach, 25), 2));
  } else if (frame >= 1293) {
    // In vacuum, blackbody radiation dominated by Doppler-blueshifted CMB
    stagnationTempK = 2.73 * Math.sqrt((1 + beta) / (1 - beta));
  }

  // Lorentz length contraction factor L = L0 / gamma
  const lengthContraction = 1 / Math.min(gamma, 12);

  // Time dilation ratio: 1s runner = gamma seconds observer
  const timeDilationSeconds = gamma;

  return {
    velocity: v,
    beta,
    gamma,
    mach,
    machAngleRad,
    machAngleDeg,
    stagnationTempK,
    lengthContraction,
    timeDilationSeconds,
  };
}

/**
 * Computes Einstein's relativistic aberration of light:
 * cos(θ') = (cos(θ) - β) / (1 - β * cos(θ))
 * Transforms a resting star unit vector to the observer's frame.
 */
export function applyRelativisticAberration(
  x: number,
  y: number,
  z: number,
  beta: number
): [number, number, number] {
  if (beta < 0.05) return [x, y, z];

  // Convert to spherical coordinates relative to forward vector (-Z)
  // Distance
  const r = Math.sqrt(x * x + y * y + z * z);
  if (r < 1e-4) return [x, y, z];

  const nx = x / r;
  const ny = y / r;
  const nz = z / r;

  // Angle theta relative to motion direction (-Z is forward, so cosTheta = -nz)
  const cosTheta = -nz;
  const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));

  // Einstein's aberration formula:
  const cosThetaPrime = (cosTheta - beta) / (1 - beta * cosTheta);
  const sinThetaPrime = Math.sqrt(Math.max(0, 1 - cosThetaPrime * cosThetaPrime));

  // Maintain azimuth phi
  const phi = Math.atan2(ny, nx);

  // New aberrated direction
  const newNx = sinThetaPrime * Math.cos(phi);
  const newNy = sinThetaPrime * Math.sin(phi);
  const newNz = -cosThetaPrime; // back to world coordinate

  return [newNx * r, newNy * r, newNz * r];
}

/**
 * Computes relativistic Doppler blueshift/redshift color:
 * λ' = λ * sqrt((1 - β) / (1 + β))  ahead
 * λ' = λ * sqrt((1 + β) / (1 - β))  behind
 */
export function getRelativisticStarColor(
  cosAngleToVelocity: number,
  beta: number
): string {
  if (beta < 0.1) return "#FFFFFF";

  // Doppler factor D = 1 / (gamma * (1 - beta * cosAngle))
  const gamma = 1 / Math.sqrt(Math.max(1e-7, 1 - beta * beta));
  const dopplerFactor = 1 / (gamma * (1 - beta * cosAngleToVelocity));

  if (dopplerFactor > 2.5) {
    // Extreme blueshift: Visible -> UV / X-ray -> Blinding Cyan-White
    return "#E0F7FA";
  } else if (dopplerFactor > 1.4) {
    // Blueshift: Blue/Violet
    return "#38BDF8";
  } else if (dopplerFactor > 0.8) {
    // Neutral
    return "#FFFFFF";
  } else if (dopplerFactor > 0.4) {
    // Redshift: Amber/Red
    return "#F59E0B";
  } else {
    // Extreme redshift: Deep Infrared Red
    return "#EF4444";
  }
}

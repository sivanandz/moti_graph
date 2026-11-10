import React, { useMemo } from "react";
import {
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { AccuratePhysicalBird3D } from "../components/three/AccuratePhysicalBird3D";
import { AccuratePhysicalEnvironment3D } from "../components/three/AccuratePhysicalEnvironment3D";
import { CleanScientificHUD } from "../components/CleanScientificHUD";
import { getPhysicsState } from "../components/physics/RelativisticPhysics";

export const BirdLightspeedReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const time = frame / fps;

  // Real relativistic physics state
  const physics = useMemo(() => getPhysicsState(frame), [frame]);
  const { beta, gamma, mach } = physics;

  // -----------------------------------------------------------------
  // 1. NARRATION SUBTITLES (Matched to exact audio timestamps)
  // -----------------------------------------------------------------
  let currentBeatText =
    "A pigeon flaps its wings at a peaceful thirty miles per hour. But what if with every single flap, its speed multiplied exponentially without drag?";
  if (frame >= 270 && frame < 529) {
    currentBeatText =
      "By flap ten, it shatters the sound barrier at Mach one. A violent vapor cone wraps around its feathers as a sonic boom rocks the landscape below.";
  } else if (frame >= 529 && frame < 864) {
    currentBeatText =
      "At Mach twenty, aerodynamic friction rips air molecules apart. The bird is now enveloped in a blinding four-thousand-degree plasma sheath, glowing like a re-entering meteor.";
  } else if (frame >= 864 && frame < 1293) {
    currentBeatText =
      "Passing one percent the speed of light, oncoming air atoms can't get out of the way. Nitrogen nuclei collide against its leading wing edge so hard they trigger runaway nuclear fusion, detonating thermonuclear shockwaves across the stratosphere.";
  } else if (frame >= 1293 && frame < 1610) {
    currentBeatText =
      "It punches through Earth's atmosphere and escapes into deep space. In the vacuum, aerodynamic lift ceases to exist, yet each wingstroke hurls it past the Moon.";
  } else if (frame >= 1610) {
    currentBeatText =
      "Approaching ninety-nine percent the speed of light, Einstein takes over. The entire universe collapses forward into a blinding ultraviolet pinprick, while on Earth, centuries tick away in a single blink.";
  }

  // -----------------------------------------------------------------
  // 2. SMOOTH CINEMATIC CAMERA SYSTEM (Whatfinity benchmark)
  // -----------------------------------------------------------------
  const { camPos, camFov } = useMemo(() => {
    if (frame < 270) {
      // BEAT 1: Low-angle lateral tracking shot, clean gentle push-in
      const p = frame / 270;
      return {
        camPos: [
          interpolate(p, [0, 1], [-0.9, -0.4]),
          interpolate(p, [0, 1], [0.25, 0.2]),
          interpolate(p, [0, 1], [2.2, 1.85]),
        ] as [number, number, number],
        camFov: 65,
      };
    } else if (frame < 529) {
      // BEAT 2: Tight 3/4 supersonic chase framing the Mach cone
      const p = (frame - 270) / 259;
      return {
        camPos: [
          interpolate(p, [0, 1], [0.35, 0.1]),
          interpolate(p, [0, 1], [0.18, 0.22]),
          interpolate(p, [0, 1], [2.0, 1.7]),
        ] as [number, number, number],
        camFov: interpolate(p, [0, 1], [70, 85]),
      };
    } else if (frame < 864) {
      // BEAT 3: Hypersonic plasma drift
      const p = (frame - 529) / 335;
      return {
        camPos: [
          interpolate(p, [0, 1], [0.65, -0.3]),
          interpolate(p, [0, 1], [0.28, 0.22]),
          interpolate(p, [0, 1], [1.7, 1.55]),
        ] as [number, number, number],
        camFov: interpolate(p, [0, 1], [85, 96]),
      };
    } else if (frame < 1293) {
      // BEAT 4: Orbital view looking over the bird down at Earth
      const p = (frame - 864) / 429;
      return {
        camPos: [
          interpolate(p, [0, 1], [0.0, 0.15]),
          interpolate(p, [0, 1], [0.95, 0.7]),
          interpolate(p, [0, 1], [2.3, 2.0]),
        ] as [number, number, number],
        camFov: interpolate(p, [0, 1], [96, 105]),
      };
    } else if (frame < 1610) {
      // BEAT 5: Celestial wide angle for Moon flyby
      const p = (frame - 1293) / 317;
      return {
        camPos: [
          interpolate(p, [0, 1], [-0.8, -0.2]),
          interpolate(p, [0, 1], [0.2, 0.15]),
          interpolate(p, [0, 1], [2.1, 1.75]),
        ] as [number, number, number],
        camFov: interpolate(p, [0, 1], [105, 115]),
      };
    } else {
      // BEAT 6: Center relativistic warp perspective
      const p = Math.min(1.0, (frame - 1610) / 430);
      return {
        camPos: [0, 0.1, interpolate(p, [0, 1], [1.65, 1.4])] as [
          number,
          number,
          number
        ],
        camFov: interpolate(p, [0, 1], [115, 126]),
      };
    }
  }, [frame]);

  // Subtle natural camera breathing (no erratic shaking)
  const subtleDriftX = Math.sin(frame * 0.05) * 0.008;
  const subtleDriftY = Math.cos(frame * 0.04) * 0.006;

  // Background atmosphere color
  let bgColor = "#0F172A"; // Cinematic dark navy
  if (frame < 270) {
    bgColor = "#1E293B";
  } else if (frame >= 864) {
    bgColor = "#020617"; // Void black
  }

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        backgroundColor: bgColor,
        overflow: "hidden",
      }}
    >
      {/* Padded Audio Voiceover Track (with 2.5s tail) */}
      <Audio src={staticFile("audio/bird_lightspeed/full_narration.mp3")} />

      {/* 3D WebGL World */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          position: [
            camPos[0] + subtleDriftX,
            camPos[1] + subtleDriftY,
            camPos[2],
          ],
          fov: camFov,
        }}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* Cinematic three-point studio lighting */}
        <ambientLight intensity={frame >= 864 ? 0.35 : 0.85} />
        <directionalLight
          position={[6, 12, 8]}
          intensity={frame >= 1293 ? 0.8 : 1.5}
          color="#FFF8E7"
        />
        <directionalLight
          position={[-8, -4, -6]}
          intensity={0.6}
          color="#38BDF8"
        />

        {/* Anatomically accurate 3D Bird with Mach cone & thermal radiation */}
        <AccuratePhysicalBird3D frame={frame} time={time} />

        {/* Real Relativistic Aberration & Doppler Starfield Environment */}
        <AccuratePhysicalEnvironment3D frame={frame} time={time} />
      </ThreeCanvas>

      {/* Minimalist, Clean Scientific HUD (Whatfinity benchmark) */}
      <CleanScientificHUD
        frame={frame}
        time={time}
        currentBeatText={currentBeatText}
      />
    </div>
  );
};

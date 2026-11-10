import React, { useMemo } from "react";
import {
  Audio,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getNeedlePhysicsState } from "../components/physics/NeedlePhysics";
import { NeedleTelemetryHUD } from "../components/NeedleTelemetryHUD";

export const RelativisticNeedleReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const time = frame / fps;

  // Special Relativity physics state
  const physics = useMemo(() => getNeedlePhysicsState(frame), [frame]);

  // -----------------------------------------------------------------
  // 1. NARRATION SUBTITLES (Synchronized to Edge-TTS Manifest)
  // -----------------------------------------------------------------
  let currentBeatText =
    "Drop a standard sewing needle from your hand, and it hits the floor with barely enough energy to bend a blade of grass. But what if that same one-gram needle struck Earth at ninety-nine point nine-nine-nine-nine percent the speed of light?";
  if (frame >= 388 && frame < 904) {
    currentBeatText =
      "If you were standing on the ground looking up, the sky would look completely peaceful. You wouldn't see a flaming meteor streak, and you wouldn't hear a screaming whistle. Because the needle travels at lightspeed, light only beats the projectile by a fraction of a nanosecond. You see nothing—until reality explodes.";
  } else if (frame >= 904 && frame < 1602) {
    currentBeatText =
      "In the physics simulator, Einstein's equations take over. With a Lorentz factor of seven hundred, length contraction crushes the five-centimeter steel pin into a microscopic disc just seventy microns thick. Crossing the entire atmosphere in three hundred microseconds, it punches head-on through air molecules, boring a laser-thin fusion plasma tube straight to the ground.";
  } else if (frame >= 1602 && frame < 2074) {
    currentBeatText =
      "The moment it touches solid rock, sixty-three trillion Joules of kinetic energy dump into the crust in nanoseconds. That is fifteen kilotons of TNT—the exact explosive yield of the Hiroshima atomic bomb—unleashed from a single gram of steel.";
  } else if (frame >= 2074) {
    currentBeatText =
      "A three-hundred-meter crater vaporizes in an instant, flattening the landscape for miles. And you would never even know it happened—because you would be gone faster than your optic nerve could send a single signal to your brain.";
  }

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        backgroundColor: "#060913",
        overflow: "hidden",
      }}
    >
      {/* 1. Synchronized Neural Voiceover Track (with 2.5s tail buffer) */}
      <Audio src={staticFile("audio/needle_impact/full_narration.mp3")} />

      {/* 2. Photorealistic Blender 3D Master Plate */}
      <OffthreadVideo
        src={staticFile("videos/blender_master_cinematic.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* 3. Subtle Vignette & Contrast Grading */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 60%, rgba(2,6,23,0.45) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 4. Minimalist Scientific Telemetry HUD & Subtitles */}
      <NeedleTelemetryHUD
        physics={physics}
        frame={frame}
        time={time}
        currentBeatText={currentBeatText}
      />
    </div>
  );
};

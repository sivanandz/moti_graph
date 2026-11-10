import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { Beat01_ColdOpen } from "./scenes/Beat01_ColdOpen";
import { Beat02_CardMonopoly } from "./scenes/Beat02_CardMonopoly";
import { Beat03_NpciSwitch } from "./scenes/Beat03_NpciSwitch";
import { Beat04_GlobalTakeaway } from "./scenes/Beat04_GlobalTakeaway";
import manifest from "../public/audio/manifest.json";

export interface ExplainerProps {
  locale: "en" | "ta" | "hi";
}

export const MainExplainer: React.FC<ExplainerProps> = ({ locale = "en" }) => {
  const beats = manifest[locale] || manifest.en;

  const beat1 = beats[0];
  const beat2 = beats[1];
  const beat3 = beats[2];
  const beat4 = beats[3];

  const start1 = 0;
  const start2 = beat1.duration_frames;
  const start3 = start2 + beat2.duration_frames;
  const start4 = start3 + beat3.duration_frames;

  return (
    <AbsoluteFill style={{ backgroundColor: "#111111" }}>
      {/* Beat 1: Cold Open Hook */}
      <Sequence from={start1} durationInFrames={beat1.duration_frames} name="Beat01_Hook">
        <Audio src={staticFile(beat1.audio_file)} />
        <Beat01_ColdOpen
          title={beat1.title}
          highlight={beat1.highlight}
          tag={beat1.tag}
        />
      </Sequence>

      {/* Beat 2: Card Monopoly Context */}
      <Sequence from={start2} durationInFrames={beat2.duration_frames} name="Beat02_CardMonopoly">
        <Audio src={staticFile(beat2.audio_file)} />
        <Beat02_CardMonopoly
          title={beat2.title}
          highlight={beat2.highlight}
          tag={beat2.tag}
        />
      </Sequence>

      {/* Beat 3: NPCI Realtime Switch Architecture */}
      <Sequence from={start3} durationInFrames={beat3.duration_frames} name="Beat03_NpciSwitch">
        <Audio src={staticFile(beat3.audio_file)} />
        <Beat03_NpciSwitch
          title={beat3.title}
          highlight={beat3.highlight}
          tag={beat3.tag}
        />
      </Sequence>

      {/* Beat 4: Global Takeaway & Open Protocol */}
      <Sequence from={start4} durationInFrames={beat4.duration_frames} name="Beat04_GlobalTakeaway">
        <Audio src={staticFile(beat4.audio_file)} />
        <Beat04_GlobalTakeaway
          title={beat4.title}
          highlight={beat4.highlight}
          tag={beat4.tag}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

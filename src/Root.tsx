import React from "react";
import { Composition } from "remotion";
import { MainExplainer } from "./MainExplainer";
import { CleanVoxVideo } from "./templates/CleanVoxLandscape";
import { ReelVoxVerticalVideo } from "./templates/ReelVoxVertical";
import cleanScenes from "./data/clean_vox_scenes.json";
import reelScenes from "./data/reel_vox_scenes.json";
import apolloScenes from "./data/apollo_scenes.json";
import apolloReelScenes from "./data/apollo_reel_scenes.json";
import indianFinanceReelScenes from "./data/indian_finance_reel_scenes.json";
import manifest from "../public/audio/manifest.json";
import apolloManifest from "../public/audio/apollo/manifest.json";
import apolloReelManifest from "../public/audio/apollo_reel/manifest.json";
import indianFinanceManifest from "../public/audio/indian_finance_reel/manifest.json";
import { RetroDigitalEphemeraLandscapeVideo } from "./templates/RetroDigitalEphemeraLandscape";
import { RetroDigitalEphemeraVerticalVideo } from "./templates/RetroDigitalEphemeraVertical";
import { BirdLightspeedReel } from "./templates/BirdLightspeedReel";
import { RelativisticNeedleReel } from "./templates/RelativisticNeedleReel";
import { LondonSmogReel } from "./templates/LondonSmogReel";
import bigBangPigeonsData from "./data/big_bang_pigeons_scenes.json";

const getDuration = (lang: "en" | "ta" | "hi") => {
  return manifest[lang].reduce((acc, curr) => acc + curr.duration_frames, 0);
};

const getApolloDuration = (lang: "en" | "ta" | "hi") => {
  return (apolloManifest as any)[lang].reduce((acc: number, curr: any) => acc + curr.duration_frames, 0);
};

const getApolloReelDuration = (lang: "en" | "ta" | "hi") => {
  return (apolloReelManifest as any)[lang].reduce((acc: number, curr: any) => acc + curr.duration_frames, 0);
};

const getIndianFinanceReelDuration = (lang: "en") => {
  return (indianFinanceManifest as any)[lang].reduce((acc: number, curr: any) => acc + curr.duration_frames, 0);
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 Landscape Video Essay Compositions (Full-size Editorial Grid) */}
      <Composition
        id="CleanVox-EN"
        component={CleanVoxVideo}
        durationInFrames={getDuration("en")}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: cleanScenes.en as any,
        }}
      />

      <Composition
        id="CleanVox-TA"
        component={CleanVoxVideo}
        durationInFrames={getDuration("ta")}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: cleanScenes.ta as any,
        }}
      />

      <Composition
        id="CleanVox-HI"
        component={CleanVoxVideo}
        durationInFrames={getDuration("hi")}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: cleanScenes.hi as any,
        }}
      />

      {/* 9:16 Vertical Short/Reel Compositions (Mobile Thirds Stack with Aggressive Hook) */}
      <Composition
        id="ReelVox-EN"
        component={ReelVoxVerticalVideo}
        durationInFrames={getDuration("en")}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: reelScenes.en as any,
        }}
      />

      <Composition
        id="ReelVox-TA"
        component={ReelVoxVerticalVideo}
        durationInFrames={getDuration("ta")}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: reelScenes.ta as any,
        }}
      />

      <Composition
        id="ReelVox-HI"
        component={ReelVoxVerticalVideo}
        durationInFrames={getDuration("hi")}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: reelScenes.hi as any,
        }}
      />

      {/* Experimental Scene Pipeline */}
      <Composition
        id="VoxExplainer-EN"
        component={MainExplainer as any}
        durationInFrames={getDuration("en")}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          locale: "en" as const,
        }}
      />

      <Composition
        id="VoxExplainer-TA"
        component={MainExplainer as any}
        durationInFrames={getDuration("ta")}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          locale: "ta" as const,
        }}
      />

      <Composition
        id="VoxExplainer-HI"
        component={MainExplainer as any}
        durationInFrames={getDuration("hi")}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          locale: "hi" as const,
        }}
      />
      {/* Apollo 11 Copper Wire Memory (16:9 Landscape Video Essay) */}
      <Composition
        id="ApolloVox-EN"
        component={CleanVoxVideo}
        durationInFrames={getApolloDuration("en")}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: apolloScenes.en as any,
        }}
      />

      <Composition
        id="ApolloVox-TA"
        component={CleanVoxVideo}
        durationInFrames={getApolloDuration("ta")}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: apolloScenes.ta as any,
        }}
      />

      <Composition
        id="ApolloVox-HI"
        component={CleanVoxVideo}
        durationInFrames={getApolloDuration("hi")}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: apolloScenes.hi as any,
        }}
      />

      {/* Apollo 11 Copper Wire Memory (9:16 Vertical Short/Reel) */}
      <Composition
        id="ApolloReel-EN"
        component={ReelVoxVerticalVideo}
        durationInFrames={getApolloReelDuration("en")}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: apolloReelScenes.en as any,
        }}
      />

      <Composition
        id="ApolloReel-TA"
        component={ReelVoxVerticalVideo}
        durationInFrames={getApolloReelDuration("ta")}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: apolloReelScenes.ta as any,
        }}
      />

      <Composition
        id="ApolloReel-HI"
        component={ReelVoxVerticalVideo}
        durationInFrames={getApolloReelDuration("hi")}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: apolloReelScenes.hi as any,
        }}
      />

      {/* Indian Finance (9:16 Vertical Short/Reel) */}
      <Composition
        id="IndianFinanceReel-EN"
        component={ReelVoxVerticalVideo}
        durationInFrames={getIndianFinanceReelDuration("en")}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: indianFinanceReelScenes.en as any,
        }}
      />

      {/* The Pigeon Poop That Heard the Big Bang (16:9 Long-Form Documentary Essay) */}
      <Composition
        id="BigBangPigeons-EN"
        component={RetroDigitalEphemeraLandscapeVideo as any}
        durationInFrames={bigBangPigeonsData.total_duration_frames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: bigBangPigeonsData.scenes as any,
        }}
      />

      {/* The Pigeon Poop That Heard the Big Bang (9:16 Vertical Mobile Documentary) */}
      <Composition
        id="BigBangPigeons-Vertical-EN"
        component={RetroDigitalEphemeraVerticalVideo as any}
        durationInFrames={bigBangPigeonsData.total_duration_frames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: bigBangPigeonsData.scenes as any,
        }}
      />

      {/* What If a Bird Flapped to Lightspeed? (9:16 Procedural 3D Simulation Reel) */}
      <Composition
        id="BirdLightspeedReel-EN"
        component={BirdLightspeedReel}
        durationInFrames={2040}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* What If a 1-Gram Needle Hit Earth at 99.9999% Lightspeed? (9:16 Relativistic Reel) */}
      <Composition
        id="NeedleImpactReel-EN"
        component={RelativisticNeedleReel}
        durationInFrames={2522}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* The Deadly London Acid Fog of 1952 (9:16 Bang Motion Explainer Reel) */}
      <Composition
        id="LondonSmog1952-Reel"
        component={LondonSmogReel}
        durationInFrames={1744}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

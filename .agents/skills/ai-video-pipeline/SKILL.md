---
name: ai-video-pipeline
description: Generative AI video pipeline for cinematic photorealism, macro physical anchors, and city-scale destruction shots.
when_to_use: "Use when a video beat requires visceral Hollywood-grade cinematic realism (e.g., real everyday objects in human hands, iconic city skylines, complex nuclear/plasma shockwaves) matching viral AI video benchmarks."
allowed-tools: Read, Write, Edit, run_command
version: 1.0.0
priority: HIGH
---

# Cinematic AI Video Generation Pipeline

> Integrates state-of-the-art generative AI video workflows for hyper-realistic macro subjects and complex physical destruction shots, benchmarked against viral short-form science documentaries.

---

## 1. When to Deploy AI Video vs. Blender vs. Remotion

| Visual Beat | Recommended Engine | Rationale |
| :--- | :--- | :--- |
| **Everyday Macro Anchors** (Egg in hand, sewing needle on fabric, human eye) | **AI Video** / Photorealism | Flawless organic skin textures, natural subsurface scattering, authentic macro bokeh. |
| **Iconic Landmark Destruction** (Skyline blast, skyscrapers vaporizing) | **AI Video** or **Blender Fracture** | Millions of interacting particles and volumetric smoke that cannot be rendered in WebGL. |
| **Exact Relativistic Telemetry & Charts** | **Remotion + Three.js** | Deterministic mathematical plots, exact $\gamma$, Mach cones, and kinetic typography. |
| **Audio-Visual Master Assembly** | **Remotion** | Microsecond-accurate speech sync, caption pills, sound effects, and color grading. |

---

## 2. Prompt Engineering for Scientific Realism

### A. Everyday Macro Subject Anchor (Beat 1 Hook)
```
"Extreme macro close-up of a human hand gently holding a single fragile brown chicken egg over a dark wooden table, cinematic soft morning window lighting, shallow depth of field, 85mm portrait lens, f/1.8, photorealistic skin pores and eggshell texture, 4k ultra-detailed, slow camera push-in."
```

### B. High-Speed Atmospheric Entry / Plasma Sheath
```
"Cinematic aerial tracking shot of an object hurtling downwards through high-altitude cumulus clouds over a photorealistic New York City skyline, wrapped in an intense blinding cyan and orange plasma ionization sheath, supersonic aerodynamic wake, lens flare, camera trembling with speed."
```

### C. City-Scale Nuclear / Kinetic Destruction (Beat 4 Climax)
```
"Massive catastrophic ground-level kinetic explosion engulfing Manhattan skyscrapers, blinding white-hot nuclear fireball expanding outwards, violent supersonic pressure wave shattering glass and pulverizing concrete into a towering rolling dust cloud, cinematic camera lens shake, debris flying towards lens, blockbuster disaster movie VFX."
```

---

## 3. Post-Processing & Remotion Compositing

1. **Storage Discipline**: Always download/move generated video clips directly into:
   `projects/<Topic>/04_images/shot_01_macro.mp4`
   `projects/<Topic>/04_images/shot_02_skyline.mp4`
   `projects/<Topic>/04_images/shot_03_detonation.mp4`
   Delete any temp files from `C:` immediately.
2. **Speed Ramping & Looping**:
   Use FFmpeg to adjust tempo to match spoken audio timestamps:
   ```bash
   ffmpeg -i input.mp4 -filter:v "setpts=0.85*PTS" -an output_timed.mp4
   ```
3. **Remotion Master Integration**:
   ```tsx
   <Sequence from={spokenStartFrame} durationInFrames={spokenDurationFrames}>
     <OffthreadVideo
       src={staticFile("images/shot_03_detonation.mp4")}
       style={{
         width: "100%",
         height: "100%",
         objectFit: "cover",
         filter: "contrast(1.1) saturate(1.15)",
       }}
     />
     {/* Overlay Minimalist Scientific HUD & Narration */}
     <NeedleTelemetryHUD ... />
   </Sequence>
   ```

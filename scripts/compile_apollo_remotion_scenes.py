import json
import os

# 1. 16:9 Long-Form Scenes
with open(os.path.join("public", "audio", "apollo", "manifest.json"), "r", encoding="utf-8") as f:
    long_manifest = json.load(f)

apollo_scenes = {}
for lang, beats in long_manifest.items():
    apollo_scenes[lang] = []
    current_frame = 0
    for beat in beats:
        scene = {
            "id": beat["id"],
            "from": current_frame,
            "frames": beat["duration_frames"],
            "kicker": beat["kicker"],
            "headline": beat["headline"],
            "accent": beat["accent"],
            "caption": beat["narration"],
            "audio_file": beat["audio_file"],
            "visualMetaphor": {
                "badgeText": beat["visual_metaphor"]["badge"],
                "heroTitle": beat["visual_metaphor"]["metric"],
                "heroSubtitle": beat["visual_metaphor"]["label"],
                "stampText": beat["visual_metaphor"]["stamp"],
                "details": beat["visual_metaphor"]["details"]
            }
        }
        apollo_scenes[lang].append(scene)
        current_frame += beat["duration_frames"]

with open(os.path.join("src", "data", "apollo_scenes.json"), "w", encoding="utf-8") as f:
    json.dump(apollo_scenes, f, ensure_ascii=False, indent=2)

print("[SUCCESS] Compiled src/data/apollo_scenes.json")

# 2. 9:16 Shorts/Reels Scenes
reels_manifest_path = os.path.join("public", "audio", "apollo_reel", "manifest.json")
if os.path.exists(reels_manifest_path):
    with open(reels_manifest_path, "r", encoding="utf-8") as f:
        reels_manifest = json.load(f)

    apollo_reels = {}
    for lang, beats in reels_manifest.items():
        apollo_reels[lang] = []
        current_frame = 0
        for beat in beats:
            scene = {
                "id": beat["id"],
                "from": current_frame,
                "frames": beat["duration_frames"],
                "hookKicker": beat["hookKicker"],
                "hookHeadline": beat["hookHeadline"],
                "accent": beat["accent"],
                "caption": beat["caption"],
                "audio_file": beat["audio_file"],
                "heroMetric": beat["heroMetric"],
                "heroLabel": beat["heroLabel"],
                "stampText": beat["stampText"],
                "takeawayBullet": beat["takeawayBullet"]
            }
            apollo_reels[lang].append(scene)
            current_frame += beat["duration_frames"]

    with open(os.path.join("src", "data", "apollo_reel_scenes.json"), "w", encoding="utf-8") as f:
        json.dump(apollo_reels, f, ensure_ascii=False, indent=2)

    print("[SUCCESS] Compiled src/data/apollo_reel_scenes.json")

import json
import os
import re

SCRIPT_PATH = os.path.join("02_script", "indian_finance_reel.json")
MANIFEST_PATH = os.path.join("public", "audio", "indian_finance_reel", "manifest.json")
OUT_SCENES_PATH = os.path.join("src", "data", "indian_finance_reel_scenes.json")

with open(SCRIPT_PATH, "r", encoding="utf-8") as sf:
    script_meta = json.load(sf)

video_title_folder = re.sub(r"[^A-Za-z0-9_]+", "_", script_meta["title"].replace("'", "")).strip("_")

with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
    manifest = json.load(f)

scenes_data = {"en": []}

for lang in ["en"]:
    beats = manifest.get(lang, [])
    curr_frame = 0
    for b in beats:
        scene_id = b["id"]
        img_rel = None
        for ext in [".jpg", ".png", ".jpeg"]:
            candidate = f"public/images/{video_title_folder}/scene_{scene_id:02d}{ext}"
            if os.path.exists(candidate):
                img_rel = f"images/{video_title_folder}/scene_{scene_id:02d}{ext}"
                break

        scene = {
            "id": scene_id,
            "from": curr_frame,
            "frames": b["duration_frames"],
            "hookKicker": b["hookKicker"],
            "hookHeadline": b["hookHeadline"],
            "accent": b["accent"],
            "caption": b["caption"],
            "audio_file": b["audio_file"],
            "heroMetric": b["heroMetric"],
            "heroLabel": b["heroLabel"],
            "stampText": b["stampText"],
            "takeawayBullet": b["takeawayBullet"]
        }
        if img_rel:
            scene["image"] = img_rel

        scenes_data[lang].append(scene)
        curr_frame += b["duration_frames"]

with open(OUT_SCENES_PATH, "w", encoding="utf-8") as f:
    json.dump(scenes_data, f, indent=2, ensure_ascii=False)

print(f"[SUCCESS] Compiled {len(scenes_data['en'])} scenes from public/images/{video_title_folder} into {OUT_SCENES_PATH}.")

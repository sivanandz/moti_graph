import asyncio
import os
import json
import edge_tts
import mutagen.mp3

SCRIPT_PATH = os.path.join("02_script", "script_package.json")
with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
    SCRIPT_DATA = json.load(f)

VOICES = {
    "en": "en-US-ChristopherNeural",
    "ta": "ta-IN-ValluvarNeural",
    "hi": "hi-IN-MadhurNeural"
}

async def generate_apollo_reels_audio():
    manifest = {}
    for lang, voice in VOICES.items():
        manifest[lang] = []
        out_dir = os.path.join("public", "audio", "apollo_reel", lang)
        os.makedirs(out_dir, exist_ok=True)
        
        reels = SCRIPT_DATA["shorts_reels_9x16"][lang]
        for beat in reels:
            beat_id = f"reel_{beat['id']:02d}"
            audio_path = os.path.join(out_dir, f"{beat_id}.mp3")
            
            print(f"[Generating Reel Audio] {lang.upper()} - {beat_id}...")
            comm = edge_tts.Communicate(beat["caption"], voice)
            await comm.save(audio_path)
            
            audio = mutagen.mp3.MP3(audio_path)
            duration_sec = round(audio.info.length, 3)
            duration_frames = int(round(duration_sec * 30))
            
            entry = {
                "id": beat["id"],
                "hookKicker": beat["hookKicker"],
                "hookHeadline": beat["hookHeadline"],
                "accent": beat["accent"],
                "caption": beat["caption"],
                "heroMetric": beat["heroMetric"],
                "heroLabel": beat["heroLabel"],
                "stampText": beat["stampText"],
                "takeawayBullet": beat["takeawayBullet"],
                "audio_file": f"audio/apollo_reel/{lang}/{beat_id}.mp3",
                "duration_seconds": duration_sec,
                "duration_frames": duration_frames
            }
            manifest[lang].append(entry)
            print(f" -> {audio_path}: {duration_sec}s ({duration_frames} frames)")
            
    manifest_path = os.path.join("public", "audio", "apollo_reel", "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, ensure_ascii=False, indent=2)
    print("\n[SUCCESS] Apollo Reels Audio Generated!")

if __name__ == "__main__":
    asyncio.run(generate_apollo_reels_audio())

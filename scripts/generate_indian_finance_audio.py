import asyncio
import os
import json
import edge_tts
import mutagen.mp3

SCRIPT_PATH = os.path.join("02_script", "indian_finance_reel.json")
with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
    SCRIPT_DATA = json.load(f)

VOICE = "en-US-ChristopherNeural"

async def generate_audio():
    manifest = {"en": []}
    out_dir = os.path.join("public", "audio", "indian_finance_reel", "en")
    os.makedirs(out_dir, exist_ok=True)
    
    reels = SCRIPT_DATA["reels_9x16"]["en"]
    for beat in reels:
        beat_id = f"reel_{beat['id']:02d}"
        audio_path = os.path.join(out_dir, f"{beat_id}.mp3")
        
        print(f"[Generating Reel Audio] EN - {beat_id}...")
        comm = edge_tts.Communicate(beat["caption"], VOICE)
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
            "audio_file": f"audio/indian_finance_reel/en/{beat_id}.mp3",
            "duration_seconds": duration_sec,
            "duration_frames": duration_frames
        }
        manifest["en"].append(entry)
        print(f" -> {audio_path}: {duration_sec}s ({duration_frames} frames)")
        
    manifest_path = os.path.join("public", "audio", "indian_finance_reel", "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, ensure_ascii=False, indent=2)
    print("\n[SUCCESS] Indian Finance Reel Audio Generated!")

if __name__ == "__main__":
    asyncio.run(generate_audio())

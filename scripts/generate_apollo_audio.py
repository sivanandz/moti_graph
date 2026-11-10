import asyncio
import os
import json
import edge_tts
import mutagen.mp3

# Load script package
SCRIPT_PATH = os.path.join("02_script", "script_package.json")
with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
    SCRIPT_DATA = json.load(f)

VOICES = {
    "en": "en-US-ChristopherNeural",
    "ta": "ta-IN-ValluvarNeural",
    "hi": "hi-IN-MadhurNeural"
}

async def generate_apollo_audio():
    manifest = {}
    
    for lang, voice in VOICES.items():
        manifest[lang] = []
        out_dir = os.path.join("public", "audio", "apollo", lang)
        os.makedirs(out_dir, exist_ok=True)
        
        beats = SCRIPT_DATA["long_form_16x9"][lang]
        for beat in beats:
            beat_id = f"beat_{beat['id']:02d}"
            audio_path = os.path.join(out_dir, f"{beat_id}.mp3")
            json_path = os.path.join(out_dir, f"{beat_id}.json")
            
            print(f"[Generating] Apollo {lang.upper()} - {beat_id} ({voice})...")
            comm = edge_tts.Communicate(beat["narration"], voice)
            await comm.save(audio_path)
            
            audio = mutagen.mp3.MP3(audio_path)
            duration_sec = round(audio.info.length, 3)
            duration_frames = int(round(duration_sec * 30))
            
            entry = {
                "lang": lang,
                "beat_id": beat_id,
                "id": beat["id"],
                "act": beat["act"],
                "kicker": beat["kicker"],
                "headline": beat["headline"],
                "accent": beat["accent"],
                "narration": beat["narration"],
                "visual_metaphor": beat["visual_metaphor"],
                "audio_file": f"audio/apollo/{lang}/{beat_id}.mp3",
                "duration_seconds": duration_sec,
                "duration_frames": duration_frames
            }
            
            with open(json_path, "w", encoding="utf-8") as jf:
                json.dump(entry, jf, ensure_ascii=False, indent=2)
                
            manifest[lang].append(entry)
            print(f" -> {audio_path}: {duration_sec}s ({duration_frames} frames)")

    manifest_path = os.path.join("public", "audio", "apollo", "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, ensure_ascii=False, indent=2)
        
    print(f"\n[SUCCESS] Apollo Audio Manifest created at {manifest_path}!")

if __name__ == "__main__":
    asyncio.run(generate_apollo_audio())

import asyncio
import os
import json
import edge_tts
import subprocess

VOICE = "en-US-AvaNeural"
RATE = "+6%"
PITCH = "+0Hz"

BEATS = [
    {
        "id": 1,
        "text": "In December 1952, Londoners walked into movie theaters only to find the screen completely invisible—because the smog had seeped inside the building."
    },
    {
        "id": 2,
        "text": "Within five days, four thousand citizens were dead. But this wasn't an enemy wartime chemical attack. It was ordinary living room fireplace smoke."
    },
    {
        "id": 3,
        "text": "A freak atmospheric inversion trapped a layer of freezing air over the Thames valley. A warm ceiling sat at two hundred meters, locking all smoke beneath it like a glass lid."
    },
    {
        "id": 4,
        "text": "Every day, London burned thousands of tons of high-sulfur coal. Inside the dense fog droplets, sulfur dioxide reacted with nitrogen, catalyzing into airborne sulfuric acid."
    },
    {
        "id": 5,
        "text": "When the government plotted air samples against morgue intake, the curves matched in absolute lockstep. As sulfur levels peaked, daily deaths quadrupled."
    },
    {
        "id": 6,
        "text": "The deadly yellow fog forced Parliament to ban smoky fuels in cities forever, giving birth to the modern environmental movement."
    }
]

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

async def synthesize_all():
    manifest = []
    print(f"Synthesizing voiceover with {VOICE} (rate: {RATE})...")
    
    for beat in BEATS:
        bid = beat["id"]
        out_mp3 = os.path.join(OUT_DIR, f"beat_{bid:02d}.mp3")
        comm = edge_tts.Communicate(beat["text"], VOICE, rate=RATE, pitch=PITCH)
        await comm.save(out_mp3)
        
        # Measure duration with ffprobe
        cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{out_mp3}"'
        dur_str = subprocess.check_output(cmd, shell=True).decode('utf-8').strip()
        dur = float(dur_str)
        
        print(f"Beat {bid}: {dur:.2f}s -> {out_mp3}")
        manifest.append({
            "id": bid,
            "text": beat["text"],
            "file": f"beat_{bid:02d}.mp3",
            "duration": dur
        })
        
    manifest_path = os.path.join(OUT_DIR, "audio_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Saved manifest: {manifest_path}")

if __name__ == "__main__":
    asyncio.run(synthesize_all())

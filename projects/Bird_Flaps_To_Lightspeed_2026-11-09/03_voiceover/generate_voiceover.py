import asyncio
import edge_tts
import json
import subprocess
import os

beats = [
    {
        "id": "beat_01",
        "text": "A pigeon flaps its wings at a peaceful thirty miles per hour. But what if with every single flap, its speed multiplied exponentially without drag?"
    },
    {
        "id": "beat_02",
        "text": "By flap ten, it shatters the sound barrier at Mach one. A violent vapor cone wraps around its feathers as a sonic boom rocks the landscape below."
    },
    {
        "id": "beat_03",
        "text": "At Mach twenty, aerodynamic friction rips air molecules apart. The bird is now enveloped in a blinding four-thousand-degree plasma sheath, glowing like a re-entering meteor."
    },
    {
        "id": "beat_04",
        "text": "Passing one percent the speed of light, oncoming air atoms can't get out of the way. Nitrogen nuclei collide against its leading wing edge so hard they trigger runaway nuclear fusion, detonating thermonuclear shockwaves across the stratosphere."
    },
    {
        "id": "beat_05",
        "text": "It punches through Earth's atmosphere and escapes into deep space. In the vacuum, aerodynamic lift ceases to exist, yet each wingstroke hurls it past the Moon."
    },
    {
        "id": "beat_06",
        "text": "Approaching ninety-nine percent the speed of light, Einstein takes over. The entire universe collapses forward into a blinding ultraviolet pinprick, while on Earth, centuries tick away in a single blink."
    }
]

VOICE = "en-US-AvaNeural"
RATE = "+6%"
OUT_DIR = "projects/Bird_Flaps_To_Lightspeed_2026-11-09/03_voiceover"

def get_duration(file_path):
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", file_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return float(res.stdout.strip())

async def main():
    manifest = []
    file_list = []
    
    for i, b in enumerate(beats):
        out_file = os.path.join(OUT_DIR, f"{b['id']}.mp3")
        comm = edge_tts.Communicate(b['text'], VOICE, rate=RATE)
        await comm.save(out_file)
        
        dur = get_duration(out_file)
        manifest.append({
            "id": b["id"],
            "text": b["text"],
            "file": out_file,
            "durationSec": dur,
            "framesAt30Fps": round(dur * 30)
        })
        file_list.append(out_file)
        print(f"Generated {b['id']}: {dur:.2f}s ({round(dur * 30)} frames)")

    # Concatenate all into one full_narration.mp3
    concat_txt = os.path.join(OUT_DIR, "concat.txt")
    with open(concat_txt, "w") as f:
        for fpath in file_list:
            abs_path = os.path.abspath(fpath).replace("\\", "/")
            f.write(f"file '{abs_path}'\n")

    full_audio = os.path.join(OUT_DIR, "full_narration.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_txt,
        "-c", "copy", full_audio
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    total_dur = get_duration(full_audio)
    print(f"Total Combined Duration: {total_dur:.2f}s ({round(total_dur * 30)} frames)")
    
    with open(os.path.join(OUT_DIR, "manifest.json"), "w") as f:
        json.dump({
            "voice": VOICE,
            "rate": RATE,
            "totalDuration": total_dur,
            "totalFrames": round(total_dur * 30),
            "beats": manifest
        }, f, indent=2)

if __name__ == "__main__":
    asyncio.run(main())

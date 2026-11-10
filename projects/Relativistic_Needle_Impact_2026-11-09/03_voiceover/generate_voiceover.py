import asyncio
import edge_tts
import json
import subprocess
import os
import shutil

beats = [
    {
        "id": "beat_01",
        "name": "Exponential Inversion Hook",
        "text": "Drop a standard sewing needle from your hand, and it hits the floor with barely enough energy to bend a blade of grass. But what if that same one-gram needle struck Earth at ninety-nine point nine-nine-nine-nine percent the speed of light?"
    },
    {
        "id": "beat_02",
        "name": "Perspective 1: Ground Reality",
        "text": "If you were standing on the ground looking up, the sky would look completely peaceful. You wouldn't see a flaming meteor streak, and you wouldn't hear a screaming whistle. Because the needle travels at lightspeed, light only beats the projectile by a fraction of a nanosecond. You see nothing—until reality explodes."
    },
    {
        "id": "beat_03",
        "name": "Perspective 2: Relativistic Simulator",
        "text": "In the physics simulator, Einstein's equations take over. With a Lorentz factor of seven hundred, length contraction crushes the five-centimeter steel pin into a microscopic disc just seventy microns thick. Crossing the entire atmosphere in three hundred microseconds, it punches head-on through air molecules, boring a laser-thin fusion plasma tube straight to the ground."
    },
    {
        "id": "beat_04",
        "name": "Crust Impact & Kinetic Dump",
        "text": "The moment it touches solid rock, sixty-three trillion Joules of kinetic energy dump into the crust in nanoseconds. That is fifteen kilotons of TNT—the exact explosive yield of the Hiroshima atomic bomb—unleashed from a single gram of steel."
    },
    {
        "id": "beat_05",
        "name": "Biological Takeaway",
        "text": "A three-hundred-meter crater vaporizes in an instant, flattening the landscape for miles. And you would never even know it happened—because you would be gone faster than your optic nerve could send a single signal to your brain."
    }
]

VOICE = "en-US-AvaNeural"
RATE = "+6%"
OUT_DIR = "projects/Relativistic_Needle_Impact_2026-11-09/03_voiceover"
PUBLIC_DIR = "public/audio/needle_impact"

def get_duration(file_path):
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", file_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return float(res.stdout.strip())

async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    manifest = []
    file_list = []
    
    current_frame = 0
    fps = 30

    for i, b in enumerate(beats):
        out_file = os.path.join(OUT_DIR, f"{b['id']}.mp3")
        comm = edge_tts.Communicate(b['text'], VOICE, rate=RATE)
        await comm.save(out_file)
        
        dur = get_duration(out_file)
        frame_len = round(dur * fps)
        start_frame = current_frame
        end_frame = current_frame + frame_len
        
        manifest.append({
            "id": b["id"],
            "name": b["name"],
            "text": b["text"],
            "file": out_file,
            "durationSec": dur,
            "startFrame": start_frame,
            "endFrame": end_frame,
            "frames": frame_len
        })
        current_frame = end_frame
        file_list.append(out_file)
        print(f"Generated {b['id']}: {dur:.2f}s ({frame_len} frames, range: {start_frame}-{end_frame})")

    # Concatenate beats into unpadded raw audio
    concat_txt = os.path.join(OUT_DIR, "concat.txt")
    with open(concat_txt, "w") as f:
        for fpath in file_list:
            abs_path = os.path.abspath(fpath).replace("\\", "/")
            f.write(f"file '{abs_path}'\n")

    raw_audio = os.path.join(OUT_DIR, "raw_narration.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_txt,
        "-c", "copy", raw_audio
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Pad audio with exactly 2.5 seconds of clean silence at the end
    padded_audio = os.path.join(OUT_DIR, "full_narration.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-i", raw_audio, "-af", "apad=pad_dur=2.5",
        "-c:a", "libmp3lame", "-b:a", "192k", padded_audio
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    raw_dur = get_duration(raw_audio)
    total_dur = get_duration(padded_audio)
    total_frames = round(total_dur * fps)
    
    print(f"Raw Speech Duration: {raw_dur:.2f}s ({round(raw_dur * fps)} frames)")
    print(f"Total Padded Duration (+2.5s tail): {total_dur:.2f}s ({total_frames} frames)")
    
    output_manifest = {
        "voice": VOICE,
        "rate": RATE,
        "rawDuration": raw_dur,
        "totalDuration": total_dur,
        "fps": fps,
        "totalFrames": total_frames,
        "paddingSec": 2.5,
        "paddingFrames": round(2.5 * fps),
        "beats": manifest
    }

    manifest_path = os.path.join(OUT_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(output_manifest, f, indent=2)

    # Also save beat-sheet.json in 02_script
    beat_sheet_path = "projects/Relativistic_Needle_Impact_2026-11-09/02_script/beat-sheet.json"
    with open(beat_sheet_path, "w") as f:
        json.dump(output_manifest, f, indent=2)

    # Copy files to public/audio/needle_impact
    shutil.copy(padded_audio, os.path.join(PUBLIC_DIR, "full_narration.mp3"))
    shutil.copy(manifest_path, os.path.join(PUBLIC_DIR, "manifest.json"))
    for fpath in file_list:
        shutil.copy(fpath, os.path.join(PUBLIC_DIR, os.path.basename(fpath)))
    
    print("Successfully copied audio assets to public/audio/needle_impact/")

if __name__ == "__main__":
    asyncio.run(main())

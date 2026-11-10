import json
import os
import subprocess

vo_dir = r"projects/The_Deadly_London_Acid_Fog_1952_2026-11-10/03_voiceover"
manifest_path = os.path.join(vo_dir, "audio_manifest.json")
with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

# Create ffmpeg concat file
concat_txt = os.path.join(vo_dir, "concat.txt")
with open(concat_txt, "w", encoding="utf-8") as f:
    for m in manifest:
        f.write(f"file '{m['file']}'\n")

master_mp3 = os.path.join(vo_dir, "vo_master.mp3")
cmd = f'ffmpeg -y -f concat -safe 0 -i "{concat_txt}" -c copy "{master_mp3}"'
subprocess.check_call(cmd, shell=True)

# Measure master duration
cmd_dur = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{master_mp3}"'
master_dur = float(subprocess.check_output(cmd_dur, shell=True).decode("utf-8").strip())

fps = 30
curr_sec = 0.0
curr_frame = 0

for m in manifest:
    m["start_sec"] = round(curr_sec, 2)
    m["start_frame"] = curr_frame
    m["frames"] = int(round(m["duration"] * fps))
    curr_sec += m["duration"]
    curr_frame += m["frames"]

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print(f"Master audio: {master_dur:.2f}s ({curr_frame} frames @ {fps}fps) -> {master_mp3}")
for m in manifest:
    print(f"Beat {m['id']}: frame {m['start_frame']} to {m['start_frame'] + m['frames']} ({m['duration']:.2f}s)")

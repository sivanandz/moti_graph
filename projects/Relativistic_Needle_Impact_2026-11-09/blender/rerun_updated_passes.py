import os
import sys
import subprocess
import shutil

BASE_DIR = "E:/Local_GIT_2/motion_graphics_videos/projects/Relativistic_Needle_Impact_2026-11-09"
BLENDER_PATH = "E:/Local_GIT_2/motion_graphics_videos/tools/blender_app/Blender Foundation/Blender 5.2/blender.exe"
TEMP_DIR = os.path.join(BASE_DIR, "blender/temp_frames").replace("\\", "/")
IMAGES_DIR = os.path.join(BASE_DIR, "04_images").replace("\\", "/")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

# Only re-render pass3 (length contraction) and pass5 (urban crater scale)
updated_scenes = [
    {
        "name": "pass3",
        "script": os.path.join(BASE_DIR, "blender/scene3_borehole.py").replace("\\", "/"),
        "start": 1,
        "end": 698,
        "output_mp4": os.path.join(IMAGES_DIR, "blender_pass3.mp4").replace("\\", "/")
    },
    {
        "name": "pass5",
        "script": os.path.join(BASE_DIR, "blender/scene5_crater.py").replace("\\", "/"),
        "start": 1,
        "end": 448,
        "output_mp4": os.path.join(IMAGES_DIR, "blender_pass5.mp4").replace("\\", "/")
    }
]

for sc in updated_scenes:
    print(f"=== Re-rendering {sc['name']} ({sc['start']} to {sc['end']}) ===")
    frame_pattern = f"{TEMP_DIR}/{sc['name']}_"
    
    py_expr = f"""
import bpy
s = bpy.context.scene
s.render.image_settings.file_format = 'JPEG'
s.render.image_settings.quality = 95
s.frame_start = {sc['start']}
s.frame_end = {sc['end']}
s.render.filepath = '{frame_pattern}'
bpy.ops.render.render(animation=True)
"""
    cmd = [
        BLENDER_PATH,
        "-b",
        "-P", sc["script"],
        "--python-expr", py_expr
    ]
    subprocess.run(cmd, check=True)

    input_pattern = f"{TEMP_DIR}/{sc['name']}_%04d.jpg"
    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-framerate", "30",
        "-i", input_pattern,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        sc["output_mp4"]
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"Updated and stitched: {sc['output_mp4']}")

    for f in os.listdir(TEMP_DIR):
        if f.startswith(sc["name"]):
            try:
                os.remove(os.path.join(TEMP_DIR, f))
            except:
                pass

print("=== Re-concatenating all 5 Blender passes into master plate ===")
concat_list_file = os.path.join(BASE_DIR, "blender/concat_list.txt").replace("\\", "/")
scenes_all = ["pass1", "pass2", "pass3", "pass4", "pass5"]
with open(concat_list_file, "w") as f:
    for name in scenes_all:
        f.write(f"file '{IMAGES_DIR}/blender_{name}.mp4'\n")

master_mp4 = os.path.join(IMAGES_DIR, "blender_master_cinematic.mp4").replace("\\", "/")
concat_cmd = [
    "ffmpeg",
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_list_file,
    "-c", "copy",
    master_mp4
]
subprocess.run(concat_cmd, check=True)
print(f"Master plate re-stitched: {master_mp4}")

public_dest = "E:/Local_GIT_2/motion_graphics_videos/public/videos/blender_master_cinematic.mp4"
shutil.copyfile(master_mp4, public_dest)
print(f"Copied to public folder: {public_dest}")

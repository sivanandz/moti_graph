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

scenes = [
    {
        "name": "pass1",
        "script": os.path.join(BASE_DIR, "blender/scene1_needle.py").replace("\\", "/"),
        "start": 1,
        "end": 388,
        "output_mp4": os.path.join(IMAGES_DIR, "blender_pass1.mp4").replace("\\", "/")
    },
    {
        "name": "pass2",
        "script": os.path.join(BASE_DIR, "blender/scene2_city.py").replace("\\", "/"),
        "start": 1,
        "end": 516,
        "output_mp4": os.path.join(IMAGES_DIR, "blender_pass2.mp4").replace("\\", "/")
    },
    {
        "name": "pass3",
        "script": os.path.join(BASE_DIR, "blender/scene3_borehole.py").replace("\\", "/"),
        "start": 1,
        "end": 698,
        "output_mp4": os.path.join(IMAGES_DIR, "blender_pass3.mp4").replace("\\", "/")
    },
    {
        "name": "pass4",
        "script": os.path.join(BASE_DIR, "blender/scene4_detonation.py").replace("\\", "/"),
        "start": 1,
        "end": 472,
        "output_mp4": os.path.join(IMAGES_DIR, "blender_pass4.mp4").replace("\\", "/")
    },
    {
        "name": "pass5",
        "script": os.path.join(BASE_DIR, "blender/scene5_crater.py").replace("\\", "/"),
        "start": 1,
        "end": 448,
        "output_mp4": os.path.join(IMAGES_DIR, "blender_pass5.mp4").replace("\\", "/")
    }
]

for sc in scenes:
    print(f"=== Rendering {sc['name']} ({sc['start']} to {sc['end']}) ===")
    frame_pattern = f"{TEMP_DIR}/{sc['name']}_"
    
    # Run Blender headless render
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

    # Stitch with ffmpeg to high-quality MP4
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
    print(f"Rendered and stitched: {sc['output_mp4']}")

    # Clean up temp frames for this pass to save disk
    for f in os.listdir(TEMP_DIR):
        if f.startswith(sc["name"]):
            try:
                os.remove(os.path.join(TEMP_DIR, f))
            except:
                pass

print("=== Concatenating all 5 Blender passes into master plate ===")
concat_list_file = os.path.join(BASE_DIR, "blender/concat_list.txt").replace("\\", "/")
with open(concat_list_file, "w") as f:
    for sc in scenes:
        f.write(f"file '{sc['output_mp4']}'\n")

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
print(f"Master plate ready: {master_mp4}")

public_dest = "E:/Local_GIT_2/motion_graphics_videos/public/videos/blender_master_cinematic.mp4"
shutil.copyfile(master_mp4, public_dest)
print(f"Copied to public folder: {public_dest}")

---
name: blender-production
description: Headless automated Blender 3D production pipeline for cinematic assets, physics simulations, PBR materials, and video pass rendering.
when_to_use: "Use when 3D scenes require realistic macro objects, complex physical destruction, fluid/smoke explosions, or cinematic camera rendering beyond raw WebGL primitives."
allowed-tools: Read, Write, Edit, run_command
version: 1.0.0
priority: HIGH
---

# Blender Production Pipeline (Headless 3D Studio)

> Automated 3D modeling, physics simulation, PBR material creation, and cinematic rendering via headless Python scripts (`bpy`). Inspired by `kevinbadi/blender-skills` and `arjun988/blender-skills`.

---

## 1. Execution Workflow

All Blender rendering is executed completely headlessly from the workspace without GUI dependency:

```powershell
blender -b -P script.py -- --resolution 1080 1920 --frames 1 120 --out "projects/<Topic>/04_images/pass_"
```

### Core Execution Template (`render_scene.py`)
```python
import bpy
import sys
import math

# 1. Clean Default Scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# 2. Configure Engine (Eevee Next for fast high-fps, Cycles for photoreal raytracing)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' # or 'CYCLES'
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.fps = 30

# 3. Setup Cinematic Camera
cam_data = bpy.data.cameras.new("MainCamera")
cam_data.lens = 50 # 50mm natural focal length
cam_data.dof.use_dof = True
cam_data.dof.aperture_fstop = 2.8 # Cinematic shallow depth of field
cam_obj = bpy.data.objects.new("MainCamera", cam_data)
bpy.context.collection.objects.link(cam_obj)
scene.camera = cam_obj
cam_obj.location = (0, -4.5, 1.8)
cam_obj.rotation_euler = (math.radians(72), 0, 0)

# 4. Cinematic Three-Point Lighting + HDRI
world = bpy.data.worlds.new("StudioWorld")
scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes["Background"]
bg_node.inputs["Color"].default_value = (0.02, 0.03, 0.05, 1.0) # Deep cinematic ambient

# Key Light
key_light_data = bpy.data.lights.new(name="KeyLight", type='AREA')
key_light_data.energy = 800
key_light_data.size = 2.0
key_light_obj = bpy.data.objects.new(name="KeyLight", object_data=key_light_data)
bpy.context.collection.objects.link(key_light_obj)
key_light_obj.location = (3, -3, 4)

# 5. PBR Principled BSDF Material Generator
def create_pbr_material(name, base_color, metallic=0.0, roughness=0.2, emission=(0,0,0,1), emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission_strength > 0:
        bsdf.inputs["Emission Color"].default_value = emission
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat
```

---

## 2. High-Impact Visual Disciplines

### A. Mantaflow Volumetric Explosions & Fireballs
- Create flow smoke/fire domain and flow emitter objects.
- Drive temperature, vorticity, and density for turbulent high-energy blasts.
- Use a blackbody radiation shader node to convert flame temperature ($1,500\,\text{K}$ to $10,000\,\text{K}$) into blinding physical illumination.

### B. Rigid Body Cell Fracture Destruction
- Fracture targets (buildings, bedrock, craters) using Blender's built-in `cell_fracture` addon.
- Apply `Rigid Body (Active)` with mass and friction.
- Trigger activation on impact frame via animated `kinematic` toggle or radial impulse fields.

### C. PolyHaven & glTF Asset Injection
- Never hand-model generic trees, cars, buildings, or rocks.
- Fetch CC0 photorealistic assets from PolyHaven / Sketchfab API / NASA 3D archives.
- Append directly via `bpy.ops.import_scene.gltf()` or `bpy.ops.wm.append()`.

---

## 3. Compositing in Remotion
- Export Blender passes as transparent PNG sequences (for isolated subjects) or high-bitrate ProRes/H.264 MP4 plates.
- Drop the rendered passes into `04_images/` or `projects/<Topic>/04_images/`.
- Import the MP4 in Remotion as a background `<Video>` or `<OffthreadVideo>` layer.
- Render dynamic real-time typography, kinetic ransomware titles, audio waveforms, and scientific HUD telemetry strictly on top.

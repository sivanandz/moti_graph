import bpy
import math
import random

def build_scene4():
    bpy.ops.wm.read_factory_settings(use_empty=True)

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = 472

    # 1. Dark Scorched Sky World
    world = bpy.data.worlds.new("DetonationWorld")
    scene.world = world
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.01, 0.008, 0.012, 1.0) # Ash/thermal haze
    bg.inputs["Strength"].default_value = 0.6

    # 2. Scorched Ground Plane (Pulverized Asphalt & Bedrock)
    bpy.ops.mesh.primitive_plane_add(size=140, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "ScorchedGround"
    g_mat = bpy.data.materials.new("ScorchedMat")
    g_nodes = g_mat.node_tree.nodes
    g_bsdf = g_nodes.get("Principled BSDF")
    g_bsdf.inputs["Base Color"].default_value = (0.04, 0.04, 0.05, 1.0)
    g_bsdf.inputs["Roughness"].default_value = 0.95
    ground.data.materials.append(g_mat)

    # 3. Peripheral Skyscraper Silhouettes (Urban Context Being Shattered)
    b_mat = bpy.data.materials.new("CityShatterMat")
    b_nodes = b_mat.node_tree.nodes
    b_bsdf = b_nodes.get("Principled BSDF")
    b_bsdf.inputs["Base Color"].default_value = (0.06, 0.07, 0.09, 1.0)
    b_bsdf.inputs["Roughness"].default_value = 0.85

    for i in range(16):
        angle = (i / 16) * math.pi * 2
        dist = 28 + (i % 3) * 6
        x = math.cos(angle) * dist
        y = math.sin(angle) * dist
        h = 25 + (i % 4) * 10
        w = 7 + (i % 2) * 2

        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, h * 0.5))
        tower = bpy.context.active_object
        tower.scale = (w, w, h)
        tower.data.materials.append(b_mat)

    # 4. Boiling Turbulent Fireball Mushroom Dome (Subdivided IcoSphere with Procedural Displacement)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=1.0, location=(0, 0, 0.2))
    fireball = bpy.context.active_object
    fireball.name = "BoilingFireball"
    bpy.ops.object.shade_smooth()

    # Displace modifier with procedural noise for boiling turbulent surface
    displace = fireball.modifiers.new(name="TurbulentBoil", type='DISPLACE')
    tex_noise = bpy.data.textures.new("BoilNoise", type='CLOUDS')
    tex_noise.noise_scale = 0.35
    tex_noise.noise_depth = 4
    displace.texture = tex_noise
    displace.strength = 0.25

    # Fireball Blackbody Plasma Material
    f_mat = bpy.data.materials.new("PlasmaFireballMat")
    f_nodes = f_mat.node_tree.nodes
    f_links = f_mat.node_tree.links
    f_bsdf = f_nodes.get("Principled BSDF")
    f_bsdf.inputs["Base Color"].default_value = (0.9, 0.3, 0.05, 1.0)
    f_bsdf.inputs["Emission Color"].default_value = (1.0, 0.45, 0.05, 1.0)
    f_bsdf.inputs["Emission Strength"].default_value = 8.0
    f_bsdf.inputs["Roughness"].default_value = 0.65
    fireball.data.materials.append(f_mat)

    # Core Blinding White Plasma Sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.6, segments=48, ring_count=24, location=(0, 0, 0.5))
    core = bpy.context.active_object
    core.name = "WhiteCore"
    c_mat = bpy.data.materials.new("CorePlasmaMat")
    c_bsdf = c_mat.node_tree.nodes.get("Principled BSDF")
    c_bsdf.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    c_bsdf.inputs["Emission Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    c_bsdf.inputs["Emission Strength"].default_value = 35.0 # 15 Million Kelvin
    core.data.materials.append(c_mat)
    bpy.ops.object.shade_smooth()

    # Animate Fireball Expansion following Taylor-Sedov R(t) ~ t^(2/5)
    fireball.scale = (0.01, 0.01, 0.01)
    fireball.keyframe_insert(data_path="scale", frame=1)
    core.scale = (0.01, 0.01, 0.01)
    core.keyframe_insert(data_path="scale", frame=1)

    # Fast expansion at early blast
    fireball.scale = (12.0, 12.0, 14.5)
    fireball.location = (0, 0, 7.0)
    fireball.keyframe_insert(data_path="scale", frame=160)
    fireball.keyframe_insert(data_path="location", frame=160)

    core.scale = (6.5, 6.5, 8.0)
    core.location = (0, 0, 5.0)
    core.keyframe_insert(data_path="scale", frame=160)
    core.keyframe_insert(data_path="location", frame=160)

    # Full mushroom billow at end of beat
    fireball.scale = (18.0, 18.0, 24.0)
    fireball.location = (0, 0, 14.0)
    fireball.keyframe_insert(data_path="scale", frame=472)
    fireball.keyframe_insert(data_path="location", frame=472)

    core.scale = (8.0, 8.0, 12.0)
    core.location = (0, 0, 10.0)
    core.keyframe_insert(data_path="scale", frame=472)
    core.keyframe_insert(data_path="location", frame=472)

    # 5. Supersonic Mach-20 Ground Shockwave Ring
    bpy.ops.mesh.primitive_cylinder_add(radius=1.0, depth=0.1, vertices=64, location=(0, 0, 0.15))
    shock = bpy.context.active_object
    shock.name = "ShockwaveRing"
    s_mat = bpy.data.materials.new("ShockMat")
    s_bsdf = s_mat.node_tree.nodes.get("Principled BSDF")
    s_bsdf.inputs["Base Color"].default_value = (0.3, 0.8, 1.0, 1.0)
    s_bsdf.inputs["Emission Color"].default_value = (0.3, 0.8, 1.0, 1.0)
    s_bsdf.inputs["Emission Strength"].default_value = 12.0
    s_bsdf.inputs["Transmission Weight"].default_value = 0.85
    shock.data.materials.append(s_mat)

    shock.scale = (0.1, 0.1, 1)
    shock.keyframe_insert(data_path="scale", frame=1)
    shock.scale = (48.0, 48.0, 1) # Sweeping radially past city towers
    shock.keyframe_insert(data_path="scale", frame=280)
    shock.scale = (85.0, 85.0, 1)
    shock.keyframe_insert(data_path="scale", frame=472)

    # 6. Ballistic Molten Debris Shards (Physics Launch Trajectories)
    debris_mat = bpy.data.materials.new("MoltenDebrisMat")
    d_bsdf = debris_mat.node_tree.nodes.get("Principled BSDF")
    d_bsdf.inputs["Base Color"].default_value = (1.0, 0.4, 0.05, 1.0)
    d_bsdf.inputs["Emission Color"].default_value = (1.0, 0.35, 0.05, 1.0)
    d_bsdf.inputs["Emission Strength"].default_value = 4.5

    random.seed(42)
    for i in range(80):
        angle = random.random() * math.pi * 2
        speed = 18 + random.random() * 25
        v_z = 15 + random.random() * 22
        size = 0.15 + random.random() * 0.4

        bpy.ops.mesh.primitive_cube_add(size=size, location=(0, 0, 0.5))
        deb = bpy.context.active_object
        deb.data.materials.append(debris_mat)

        deb.location = (0, 0, 0.5)
        deb.keyframe_insert(data_path="location", frame=1)

        # Parabolic apex at frame 180
        t1 = 180 / 30.0
        x1 = math.cos(angle) * (speed * 0.4)
        y1 = math.sin(angle) * (speed * 0.4)
        z1 = max(0.2, v_z * 0.8)
        deb.location = (x1, y1, z1)
        deb.keyframe_insert(data_path="location", frame=180)

        # Impact back onto ground at frame 400
        t2 = 400 / 30.0
        x2 = math.cos(angle) * (speed * 1.1)
        y2 = math.sin(angle) * (speed * 1.1)
        deb.location = (x2, y2, 0.2)
        deb.keyframe_insert(data_path="location", frame=400)

    # 7. Dynamic Detonation Core Light & Prompt Nuclear Flash
    blast_light = bpy.data.lights.new(name="BlastLight", type='POINT')
    blast_light.color = (1.0, 0.75, 0.4)
    blast_light.energy = 50000 # Giant fireball illumination
    blast_obj = bpy.data.objects.new("BlastLight", blast_light)
    bpy.context.collection.objects.link(blast_obj)
    blast_obj.location = (0, 0, 8)

    # 8. Cinematic Blast Camera with Visceral Camera Shake
    cam_data = bpy.data.cameras.new("BlastCamera")
    cam_data.lens = 28 # Wide 28mm action lens

    cam_obj = bpy.data.objects.new("BlastCamera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Camera location with exponential camera shake decay
    base_x, base_y, base_z = 24.0, -32.0, 14.0
    for f in range(1, 473, 5):
        t = (f - 1) / 472.0
        shake = math.exp(-t * 4.5) * 1.8 # Intense shake early, decaying
        sx = (math.sin(f * 1.7) + math.cos(f * 2.3)) * shake
        sy = (math.cos(f * 1.5) + math.sin(f * 2.8)) * shake
        sz = math.sin(f * 3.1) * shake * 0.6

        cam_obj.location = (base_x + sx + t * 4.0, base_y + sy - t * 4.0, base_z + sz + t * 2.0)
        cam_obj.keyframe_insert(data_path="location", frame=f)

    # Camera tracks center of blast
    track = cam_obj.constraints.new(type='TRACK_TO')
    track.target = fireball
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'

    print("Scene 4 built successfully.")

if __name__ == "__main__":
    build_scene4()

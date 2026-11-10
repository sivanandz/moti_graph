import bpy
import math
import os

def build_scene1():
    # 1. Reset factory settings
    bpy.ops.wm.read_factory_settings(use_empty=True)

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = 388

    # 2. World / Environment Lighting
    world = bpy.data.worlds.new("LabWorld")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.015, 0.02, 0.035, 1.0) # Deep studio navy
    bg.inputs["Strength"].default_value = 0.8

    # 3. Obsidian Laboratory Surface
    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "ObsidianBench"
    
    floor_mat = bpy.data.materials.new("ObsidianMat")
    floor_mat.use_nodes = True
    f_nodes = floor_mat.node_tree.nodes
    f_links = floor_mat.node_tree.links
    f_bsdf = f_nodes.get("Principled BSDF")
    f_bsdf.inputs["Base Color"].default_value = (0.02, 0.025, 0.035, 1.0)
    f_bsdf.inputs["Metallic"].default_value = 0.85
    f_bsdf.inputs["Roughness"].default_value = 0.12
    floor.data.materials.append(floor_mat)

    # 4. Laser Metric Grid on Bench
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=40, y_subdivisions=40, size=10, location=(0, 0, 0.002))
    grid_obj = bpy.context.active_object
    grid_obj.name = "LaserGrid"
    grid_mat = bpy.data.materials.new("LaserGridMat")
    grid_mat.use_nodes = True
    g_bsdf = grid_mat.node_tree.nodes.get("Principled BSDF")
    g_bsdf.inputs["Base Color"].default_value = (0.2, 0.7, 1.0, 1.0)
    g_bsdf.inputs["Emission Color"].default_value = (0.2, 0.7, 1.0, 1.0)
    g_bsdf.inputs["Emission Strength"].default_value = 2.5
    grid_obj.data.materials.append(grid_mat)

    # 5. Photorealistic Surgical Needle
    # Create needle cylinder shank
    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=3.2, vertices=48, location=(0, 0, 1.6))
    shank = bpy.context.active_object
    shank.name = "NeedleShank"

    # Tip cone
    bpy.ops.mesh.primitive_cone_add(radius1=0.04, radius2=0.002, depth=1.0, vertices=48, location=(0, 0, 3.7))
    tip = bpy.context.active_object
    tip.name = "NeedleTip"

    # Eyelet head
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -0.2))
    eyelet = bpy.context.active_object
    eyelet.name = "NeedleEyelet"
    eyelet.scale = (0.045, 0.075, 0.5)

    # Join needle parts
    for ob in [shank, tip, eyelet]:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = shank
    bpy.ops.object.join()
    needle = bpy.context.active_object
    needle.name = "SurgicalNeedle"
    bpy.ops.object.shade_smooth()

    # Needle PBR Material (Brushed Chrome Steel)
    needle_mat = bpy.data.materials.new("ChromeNeedleMat")
    needle_mat.use_nodes = True
    n_nodes = needle_mat.node_tree.nodes
    n_links = needle_mat.node_tree.links
    n_bsdf = n_nodes.get("Principled BSDF")
    n_bsdf.inputs["Base Color"].default_value = (0.95, 0.96, 0.98, 1.0)
    n_bsdf.inputs["Metallic"].default_value = 1.0
    n_bsdf.inputs["Roughness"].default_value = 0.09

    # Add procedural anisotropic noise bump for brushed look
    tex_noise = n_nodes.new("ShaderNodeTexNoise")
    tex_noise.inputs["Scale"].default_value = 180.0
    bump = n_nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.04
    n_links.new(tex_noise.outputs["Fac"], bump.inputs["Height"])
    n_links.new(bump.outputs["Normal"], n_bsdf.inputs["Normal"])
    needle.data.materials.append(needle_mat)

    # Needle Animation: Freefall from Y=6 down to table Y=0.04 at frame 140, resting through frame 388
    needle.location = (0, 0, 5.0)
    needle.rotation_euler = (math.radians(15), math.radians(20), math.radians(45))
    needle.keyframe_insert(data_path="location", frame=1)
    needle.keyframe_insert(data_path="rotation_euler", frame=1)

    needle.location = (0, 0, 0.05)
    needle.rotation_euler = (math.radians(88), math.radians(2), math.radians(35))
    needle.keyframe_insert(data_path="location", frame=140)
    needle.keyframe_insert(data_path="rotation_euler", frame=140)

    # Subtle settle bounce
    needle.location = (0, 0, 0.08)
    needle.keyframe_insert(data_path="location", frame=155)
    needle.location = (0, 0, 0.045)
    needle.keyframe_insert(data_path="location", frame=175)

    # Keep resting through frame 388
    needle.location = (0, 0, 0.045)
    needle.keyframe_insert(data_path="location", frame=388)

    # 6. Studio Lighting
    # Overhead Key Light
    key_light_data = bpy.data.lights.new(name="KeyLight", type='AREA')
    key_light_data.energy = 600
    key_light_data.size = 3.0
    key_light_data.color = (1.0, 0.98, 0.95)
    key_light = bpy.data.objects.new("KeyLight", key_light_data)
    bpy.context.collection.objects.link(key_light)
    key_light.location = (2.5, -2.5, 4.5)
    key_light.rotation_euler = (math.radians(45), 0, math.radians(45))

    # Rim Light (Cool Cyan edge specular)
    rim_light_data = bpy.data.lights.new(name="RimLight", type='AREA')
    rim_light_data.energy = 450
    rim_light_data.size = 2.0
    rim_light_data.color = (0.4, 0.8, 1.0)
    rim_light = bpy.data.objects.new("RimLight", rim_light_data)
    bpy.context.collection.objects.link(rim_light)
    rim_light.location = (-3.5, 3.0, 2.5)
    rim_light.rotation_euler = (math.radians(-40), math.radians(20), math.radians(-120))

    # 7. Camera (Macro 85mm Lens with Depth of Field)
    cam_data = bpy.data.cameras.new("MacroCamera")
    cam_data.lens = 85
    cam_data.dof.use_dof = True
    cam_data.dof.focus_object = needle
    cam_data.dof.aperture_fstop = 2.2

    cam_obj = bpy.data.objects.new("MacroCamera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Camera motion: Tracking drop and pushing in macro
    cam_obj.location = (1.8, -2.8, 2.2)
    cam_obj.rotation_euler = (math.radians(65), 0, math.radians(35))
    cam_obj.keyframe_insert(data_path="location", frame=1)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=1)

    cam_obj.location = (1.1, -1.8, 1.1)
    cam_obj.rotation_euler = (math.radians(62), 0, math.radians(32))
    cam_obj.keyframe_insert(data_path="location", frame=388)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=388)

    print("Scene 1 built successfully.")

if __name__ == "__main__":
    build_scene1()

import bpy
import math

def build_scene3():
    bpy.ops.wm.read_factory_settings(use_empty=True)

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = 698

    # 1. Cosmic Deep Space Environment & Aberration Starfield
    world = bpy.data.worlds.new("CosmicWorld")
    scene.world = world
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.002, 0.005, 0.015, 1.0) # Deep black-navy space
    bg.inputs["Strength"].default_value = 0.6

    # 2. Earth Curvature Horizon Mesh (Radius = 120, centered at Z = -118)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=120, segments=96, ring_count=48, location=(0, 0, -118))
    earth = bpy.context.active_object
    earth.name = "EarthHorizon"
    earth_mat = bpy.data.materials.new("EarthMat")
    e_nodes = earth_mat.node_tree.nodes
    e_bsdf = e_nodes.get("Principled BSDF")
    e_bsdf.inputs["Base Color"].default_value = (0.01, 0.04, 0.09, 1.0)
    e_bsdf.inputs["Roughness"].default_value = 0.85
    earth.data.materials.append(earth_mat)
    bpy.ops.object.shade_smooth()

    # 3. 100km Atmospheric Stratification Shells
    strata_colors = [
        ("Exosphere", 121.5, (0.2, 0.6, 1.0, 1.0), 1.2),
        ("Mesosphere", 121.0, (0.5, 0.3, 0.9, 1.0), 1.8),
        ("Stratosphere", 120.5, (0.8, 0.4, 0.1, 1.0), 2.2),
    ]
    for name, r, col, emiss in strata_colors:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=80, ring_count=40, location=(0, 0, -118))
        shell = bpy.context.active_object
        shell.name = name
        s_mat = bpy.data.materials.new(f"{name}Mat")
        s_bsdf = s_mat.node_tree.nodes.get("Principled BSDF")
        s_bsdf.inputs["Base Color"].default_value = col
        s_bsdf.inputs["Transmission Weight"].default_value = 0.92
        s_bsdf.inputs["Emission Color"].default_value = col
        s_bsdf.inputs["Emission Strength"].default_value = emiss
        shell.data.materials.append(s_mat)
        bpy.ops.object.shade_smooth()

    # 4. Hero Relativistic Needle: Active Geometric Length Contraction (5.0 cm -> 70 microns)
    # Model the 5cm steel needle
    bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=4.2, vertices=48, location=(0, 0, 12))
    needle = bpy.context.active_object
    needle.name = "ContractingNeedle"

    # Tip cone
    bpy.ops.mesh.primitive_cone_add(radius1=0.12, radius2=0.005, depth=1.2, vertices=48, location=(0, 0, 14.7))
    tip = bpy.context.active_object

    # Join into single needle mesh
    for ob in [needle, tip]:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = needle
    bpy.ops.object.join()
    bpy.ops.object.shade_smooth()

    # Needle Relativistic Plasma Material
    needle_mat = bpy.data.materials.new("RelativisticNeedleMat")
    n_nodes = needle_mat.node_tree.nodes
    n_bsdf = n_nodes.get("Principled BSDF")
    n_bsdf.inputs["Base Color"].default_value = (0.85, 0.95, 1.0, 1.0)
    n_bsdf.inputs["Metallic"].default_value = 1.0
    n_bsdf.inputs["Roughness"].default_value = 0.1
    needle.data.materials.append(needle_mat)

    # ACTIVE LENGTH CONTRACTION KEYFRAMES:
    # Frame 1 to 60: Normal 5cm needle moving into frame (Scale Z = 1.0, 50mm)
    needle.scale = (1.0, 1.0, 1.0)
    needle.location = (0, 0, 16.0)
    needle.keyframe_insert(data_path="scale", frame=1)
    needle.keyframe_insert(data_path="location", frame=1)

    needle.scale = (1.0, 1.0, 1.0)
    needle.location = (0, 0, 14.5)
    needle.keyframe_insert(data_path="scale", frame=60)
    needle.keyframe_insert(data_path="location", frame=60)

    # Frame 60 to 220: As Lorentz factor surges to 707, Z-scale collapses from 1.0 down to 0.015 (70 microns disc!)
    # While expanding slightly in radial X/Y due to relativistic plasma bow shock
    needle.scale = (1.8, 1.8, 0.015)
    needle.location = (0, 0, 11.5)
    needle.keyframe_insert(data_path="scale", frame=220)
    needle.keyframe_insert(data_path="location", frame=220)

    # Keyframe emission surge during compression (Cherenkov blue radiation)
    n_bsdf.inputs["Emission Color"].default_value = (0.2, 0.7, 1.0, 1.0)
    n_bsdf.inputs["Emission Strength"].default_value = 0.0
    n_bsdf.inputs["Emission Strength"].keyframe_insert(data_path="default_value", frame=60)

    n_bsdf.inputs["Emission Strength"].default_value = 25.0 # Blinding plasma luminescence
    n_bsdf.inputs["Emission Strength"].keyframe_insert(data_path="default_value", frame=220)
    n_bsdf.inputs["Emission Strength"].keyframe_insert(data_path="default_value", frame=698)

    # Frame 220 to 698: Contracted disc plunges down through the 100km atmosphere to ground
    needle.scale = (1.8, 1.8, 0.015)
    needle.location = (0, 0, 2.0) # Striking Earth surface
    needle.keyframe_insert(data_path="scale", frame=698)
    needle.keyframe_insert(data_path="location", frame=698)

    # 5. Laser-Thin Fusion Plasma Borehole Tube
    bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=14, vertices=48, location=(0, 0, 8))
    tube = bpy.context.active_object
    tube.name = "PlasmaBorehole"
    tube_mat = bpy.data.materials.new("TubeMat")
    t_nodes = tube_mat.node_tree.nodes
    t_bsdf = t_nodes.get("Principled BSDF")
    t_bsdf.inputs["Base Color"].default_value = (0.3, 0.85, 1.0, 1.0)
    t_bsdf.inputs["Emission Color"].default_value = (0.2, 0.75, 1.0, 1.0)
    t_bsdf.inputs["Emission Strength"].default_value = 28.0 # Searing fusion channel
    tube.data.materials.append(tube_mat)

    # Outer Ionization Sheath (Violet/Magenta air molecule ionization)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.65, depth=14, vertices=32, location=(0, 0, 8))
    sheath = bpy.context.active_object
    sheath_mat = bpy.data.materials.new("SheathMat")
    s_nodes = sheath_mat.node_tree.nodes
    s_bsdf = s_nodes.get("Principled BSDF")
    s_bsdf.inputs["Base Color"].default_value = (0.7, 0.2, 0.95, 1.0)
    s_bsdf.inputs["Emission Color"].default_value = (0.7, 0.2, 0.95, 1.0)
    s_bsdf.inputs["Emission Strength"].default_value = 10.0
    s_bsdf.inputs["Transmission Weight"].default_value = 0.85
    sheath.data.materials.append(sheath_mat)

    # Borehole light source tracking needle
    spark_light = bpy.data.lights.new(name="BoreholeLight", type='POINT')
    spark_light.color = (0.3, 0.85, 1.0)
    spark_light.energy = 4000
    spark_obj = bpy.data.objects.new("BoreholeLight", spark_light)
    bpy.context.collection.objects.link(spark_obj)

    spark_obj.location = (0, 0, 16.0)
    spark_obj.keyframe_insert(data_path="location", frame=1)
    spark_obj.location = (0, 0, 11.5)
    spark_obj.keyframe_insert(data_path="location", frame=220)
    spark_obj.location = (0, 0, 2.0)
    spark_obj.keyframe_insert(data_path="location", frame=698)

    # 6. Orbiting Cinematic Camera Tracking the Compression & Plunge
    cam_data = bpy.data.cameras.new("BoreholeCam")
    cam_data.lens = 50

    cam_obj = bpy.data.objects.new("BoreholeCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Camera moves in close during compression (frame 1-220), then pulls back to show the full atmospheric tube
    cam_obj.location = (3.5, -4.5, 15.0)
    cam_obj.keyframe_insert(data_path="location", frame=1)

    cam_obj.location = (2.2, -3.2, 12.0) # Macro close-up on the contracting disc!
    cam_obj.keyframe_insert(data_path="location", frame=220)

    cam_obj.location = (8.5, -9.0, 5.0) # Wide tracking shot down to Earth
    cam_obj.keyframe_insert(data_path="location", frame=698)

    track = cam_obj.constraints.new(type='TRACK_TO')
    track.target = needle
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'

    print("Scene 3 with Active Length Contraction built successfully.")

if __name__ == "__main__":
    build_scene3()

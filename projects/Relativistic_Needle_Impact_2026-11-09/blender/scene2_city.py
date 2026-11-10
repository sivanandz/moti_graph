import bpy
import math
import os

def build_scene2():
    bpy.ops.wm.read_factory_settings(use_empty=True)

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = 516

    # 1. Physical Atmosphere & Sun Sky
    world = bpy.data.worlds.new("SkyWorld")
    scene.world = world
    w_nodes = world.node_tree.nodes
    w_links = world.node_tree.links
    bg = w_nodes["Background"]

    # Physical Sky Texture
    tex_sky = w_nodes.new("ShaderNodeTexSky")
    tex_sky.sky_type = 'HOSEK_WILKIE'
    tex_sky.sun_direction = (0.5, 0.3, 0.8)
    tex_sky.turbidity = 2.5
    w_links.new(tex_sky.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.2

    # Direct Sunlight
    sun_data = bpy.data.lights.new(name="SunLight", type='SUN')
    sun_data.energy = 4.5
    sun_data.color = (1.0, 0.96, 0.90)
    sun = bpy.data.objects.new("SunLight", sun_data)
    bpy.context.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(35), math.radians(15), math.radians(40))

    # 2. Roadway Asphalt & Sidewalks
    # Road (Z from -100 to 50, Width 14)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -25, 0))
    road = bpy.context.active_object
    road.name = "AvenueRoad"
    road.scale = (14, 150, 1)

    road_mat = bpy.data.materials.new("AsphaltMat")
    r_nodes = road_mat.node_tree.nodes
    r_bsdf = r_nodes.get("Principled BSDF")
    r_bsdf.inputs["Base Color"].default_value = (0.08, 0.08, 0.09, 1.0)
    r_bsdf.inputs["Roughness"].default_value = 0.82
    road.data.materials.append(road_mat)

    # Sidewalks (Concrete)
    for x_side in [-9.5, 9.5]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x_side, -25, 0.1))
        sw = bpy.context.active_object
        sw.name = f"Sidewalk_{x_side}"
        sw.scale = (5, 150, 0.2)
        sw_mat = bpy.data.materials.new("SidewalkMat")
        s_bsdf = sw_mat.node_tree.nodes.get("Principled BSDF")
        s_bsdf.inputs["Base Color"].default_value = (0.28, 0.30, 0.33, 1.0)
        s_bsdf.inputs["Roughness"].default_value = 0.75
        sw.data.materials.append(sw_mat)

    # Road center yellow stripes
    stripe_mat = bpy.data.materials.new("RoadStripeMat")
    st_bsdf = stripe_mat.node_tree.nodes.get("Principled BSDF")
    st_bsdf.inputs["Base Color"].default_value = (0.95, 0.8, 0.1, 1.0)
    st_bsdf.inputs["Roughness"].default_value = 0.5

    for i in range(20):
        z_pos = -90 + i * 8
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, z_pos, 0.005))
        st = bpy.context.active_object
        st.scale = (0.25, 4.0, 1)
        st.data.materials.append(stripe_mat)

    # 3. Manhattan-Scale Skyscraper Architecture
    b_colors = [
        (0.12, 0.15, 0.20, 1.0),
        (0.18, 0.22, 0.28, 1.0),
        (0.08, 0.10, 0.14, 1.0),
        (0.15, 0.18, 0.22, 1.0)
    ]
    glass_color = (0.7, 0.85, 0.98, 1.0)

    # Left and Right canyon towers
    for col, x_base in enumerate([-18, 18]):
        sign = -1 if col == 0 else 1
        for row in range(7):
            y_pos = -85 + row * 22
            height = 45 + ((row * 7 + col * 3) % 5) * 12
            width = 11 + (row % 3) * 2
            depth = 16

            # Main tower massing
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x_base + sign * (width * 0.5 - 5), y_pos, height * 0.5))
            tower = bpy.context.active_object
            tower.scale = (width, depth, height)

            # High-rise facade material with glass windows
            t_mat = bpy.data.materials.new(f"TowerMat_{col}_{row}")
            t_bsdf = t_mat.node_tree.nodes.get("Principled BSDF")
            t_bsdf.inputs["Base Color"].default_value = b_colors[(row + col) % len(b_colors)]
            t_bsdf.inputs["Metallic"].default_value = 0.85
            t_bsdf.inputs["Roughness"].default_value = 0.18
            tower.data.materials.append(t_mat)

            # Rooftop broadcast spire or chiller
            if row % 2 == 0:
                bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=10, location=(x_base, y_pos, height + 5))
                spire = bpy.context.active_object
                spire.data.materials.append(t_mat)
            else:
                bpy.ops.mesh.primitive_cube_add(size=1, location=(x_base, y_pos, height + 1.5))
                chiller = bpy.context.active_object
                chiller.scale = (width * 0.4, depth * 0.4, 3)
                chiller.data.materials.append(t_mat)

    # 4. Street-Level Human Scale Props (Lamps & Cars)
    car_mat = bpy.data.materials.new("CarPaint")
    car_mat.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value = (0.8, 0.1, 0.15, 1.0)
    car_mat.node_tree.nodes.get("Principled BSDF").inputs["Metallic"].default_value = 0.9
    car_mat.node_tree.nodes.get("Principled BSDF").inputs["Roughness"].default_value = 0.15

    for i in range(-3, 4):
        y_car = i * 18
        # Left parked car
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-6.2, y_car, 0.7))
        car = bpy.context.active_object
        car.scale = (1.9, 4.2, 1.2)
        car.data.materials.append(car_mat)

        # Right parked car
        bpy.ops.mesh.primitive_cube_add(size=1, location=(6.2, y_car + 6, 0.7))
        car_r = bpy.context.active_object
        car_r.scale = (1.9, 4.2, 1.2)
        car_r.data.materials.append(car_mat)

    # 5. Cinematic Human Perspective Camera (Looking up along avenue)
    cam_data = bpy.data.cameras.new("CityCamera")
    cam_data.lens = 32 # Wide 32mm architectural lens
    cam_data.dof.use_dof = False

    cam_obj = bpy.data.objects.new("CityCamera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Camera moves smoothly down the avenue (Y: 10 down to -30), tilting up at the sky (Pitch: 65° to 78°)
    cam_obj.location = (0, 15, 1.75) # 1.75m human eye level
    cam_obj.rotation_euler = (math.radians(65), 0, math.radians(180))
    cam_obj.keyframe_insert(data_path="location", frame=1)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=1)

    cam_obj.location = (0, -25, 1.75)
    cam_obj.rotation_euler = (math.radians(78), 0, math.radians(180)) # Tilting up to the peaceful sky
    cam_obj.keyframe_insert(data_path="location", frame=516)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=516)

    # 6. Prompt Nuclear Exposure Whiteout (Frames 470 to 516)
    # Area light directly in the sky facing down
    flash_data = bpy.data.lights.new(name="NuclearFlash", type='POINT')
    flash_data.color = (1.0, 1.0, 1.0)
    flash_data.energy = 0
    flash_obj = bpy.data.objects.new("NuclearFlash", flash_data)
    bpy.context.collection.objects.link(flash_obj)
    flash_obj.location = (0, -15, 80)

    # Keyframe the blinding prompt flash at the climax
    flash_data.energy = 0
    flash_data.keyframe_insert(data_path="energy", frame=465)

    flash_data.energy = 500000 # Blinding over-exposure whiteout
    flash_data.keyframe_insert(data_path="energy", frame=485)
    flash_data.keyframe_insert(data_path="energy", frame=516)

    print("Scene 2 built successfully.")

if __name__ == "__main__":
    build_scene2()

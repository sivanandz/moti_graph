import bpy
import math

def build_scene5():
    bpy.ops.wm.read_factory_settings(use_empty=True)

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = 448

    # 1. Ash Twilight Sky World
    world = bpy.data.worlds.new("CraterWorld")
    scene.world = world
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.015, 0.02, 0.03, 1.0)
    bg.inputs["Strength"].default_value = 0.55

    # 2. Main Excavation Crater Mesh with Terraced Walls
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=140, y_subdivisions=140, size=110, location=(0, 0, 0))
    crater = bpy.context.active_object
    crater.name = "CraterBasin"

    mesh = crater.data
    for v in mesh.vertices:
        x, y = v.co.x, v.co.y
        r = math.sqrt(x * x + y * y)
        theta = math.atan2(y, x)

        if r < 16.0:
            norm_r = r / 16.0
            bowl = -5.5 * (1.0 - math.pow(norm_r, 1.7)) + math.pow(norm_r, 3.2) * 1.6
            fault_lines = math.sin(r * 2.8) * 0.25 + math.cos(theta * 14) * 0.18
            v.co.z = bowl + fault_lines
        elif r < 28.0:
            norm_r = (r - 16.0) / 12.0
            ejecta = 1.6 * math.exp(-norm_r * 2.5)
            v.co.z = ejecta + math.sin(theta * 16) * 0.15
        else:
            v.co.z = 0.0

    mesh.update()
    bpy.ops.object.shade_smooth()

    # Crater Basalt Material
    c_mat = bpy.data.materials.new("BasaltMat")
    c_nodes = c_mat.node_tree.nodes
    c_bsdf = c_nodes.get("Principled BSDF")
    c_bsdf.inputs["Base Color"].default_value = (0.03, 0.035, 0.045, 1.0)
    c_bsdf.inputs["Roughness"].default_value = 0.94
    c_bsdf.inputs["Metallic"].default_value = 0.1
    crater.data.materials.append(c_mat)

    # 3. Central Molten Magma Lake (Superheated bedrock melt)
    bpy.ops.mesh.primitive_circle_add(radius=5.2, fill_type='NGON', location=(0, 0, -5.2))
    lava = bpy.context.active_object
    lava.name = "MoltenLavaLake"

    lava_mat = bpy.data.materials.new("LavaMat")
    l_nodes = lava_mat.node_tree.nodes
    l_links = lava_mat.node_tree.links
    l_bsdf = l_nodes.get("Principled BSDF")
    l_bsdf.inputs["Base Color"].default_value = (0.95, 0.25, 0.02, 1.0)
    l_bsdf.inputs["Emission Color"].default_value = (1.0, 0.40, 0.03, 1.0)
    l_bsdf.inputs["Emission Strength"].default_value = 9.5
    l_bsdf.inputs["Roughness"].default_value = 0.4

    tex_noise = l_nodes.new("ShaderNodeTexNoise")
    tex_noise.inputs["Scale"].default_value = 16.0
    tex_noise.inputs["Detail"].default_value = 4.0
    l_links.new(tex_noise.outputs["Fac"], l_bsdf.inputs["Roughness"])
    lava.data.materials.append(lava_mat)

    # Magma Point Light
    magma_light = bpy.data.lights.new(name="MagmaLight", type='POINT')
    magma_light.color = (1.0, 0.45, 0.08)
    magma_light.energy = 9000
    magma_obj = bpy.data.objects.new("MagmaLight", magma_light)
    bpy.context.collection.objects.link(magma_obj)
    magma_obj.location = (0, 0, -3.8)

    # 4. Human Scale Anchors: Pulverized Manhattan City Blocks & Foundations
    # We place remnants of city streets and shattered skyscraper foundations directly around the 300m rim!
    b_mat = bpy.data.materials.new("RuinedFoundationMat")
    b_bsdf = b_mat.node_tree.nodes.get("Principled BSDF")
    b_bsdf.inputs["Base Color"].default_value = (0.08, 0.09, 0.11, 1.0)
    b_bsdf.inputs["Roughness"].default_value = 0.88

    asphalt_mat = bpy.data.materials.new("CrackedStreetMat")
    asphalt_bsdf = asphalt_mat.node_tree.nodes.get("Principled BSDF")
    asphalt_bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.06, 1.0)
    asphalt_bsdf.inputs["Roughness"].default_value = 0.92

    for col in range(8):
        ang = (col / 8.0) * math.pi * 2 + 0.2
        dist = 22.0 + (col % 2) * 5.0
        x = math.cos(ang) * dist
        y = math.sin(ang) * dist
        
        # Ruined building foundation stumps
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, 1.5))
        stump = bpy.context.active_object
        stump.scale = (5.5, 5.5, 3.0 + (col % 3) * 2.0)
        stump.data.materials.append(b_mat)

        # Truncated street asphalt slab leading right to the crater edge
        bpy.ops.mesh.primitive_plane_add(size=1, location=(x * 0.85, y * 0.85, 0.8))
        slab = bpy.context.active_object
        slab.scale = (6.0, 4.0, 1)
        slab.data.materials.append(asphalt_mat)

    # 5. Holographic Metric Telemetry Ring at the 300m Rim
    bpy.ops.mesh.primitive_torus_add(major_radius=16.0, minor_radius=0.08, major_segments=96, minor_segments=16, location=(0, 0, 1.6))
    holo_ring = bpy.context.active_object
    holo_ring.name = "HologramRimRing"
    h_mat = bpy.data.materials.new("HoloRingMat")
    h_bsdf = h_mat.node_tree.nodes.get("Principled BSDF")
    h_bsdf.inputs["Base Color"].default_value = (0.2, 0.75, 1.0, 1.0)
    h_bsdf.inputs["Emission Color"].default_value = (0.2, 0.75, 1.0, 1.0)
    h_bsdf.inputs["Emission Strength"].default_value = 4.0
    holo_ring.data.materials.append(h_mat)

    # 6. Aerial Forensic Drone Camera (Orbiting & Surveying)
    cam_data = bpy.data.cameras.new("DroneCamera")
    cam_data.lens = 38 # Wide 38mm survey lens

    cam_obj = bpy.data.objects.new("DroneCamera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Drone camera orbits smoothly overhead
    for f in range(1, 449, 10):
        t = (f - 1) / 448.0
        ang = 0.4 + t * 0.95
        rad = 30.0 - t * 5.0 # Pushing in to inspect
        z_h = 24.0 - t * 6.0 # Descending from 24m down to 18m

        cam_obj.location = (math.cos(ang) * rad, math.sin(ang) * rad, z_h)
        cam_obj.keyframe_insert(data_path="location", frame=f)

    track = cam_obj.constraints.new(type='TRACK_TO')
    track.target = lava
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'

    print("Scene 5 with Urban Scale Anchors built successfully.")

if __name__ == "__main__":
    build_scene5()

"""Run through Blender MCP. Fictional rotary module; metres, game Y up.
Geometry reference: research/19-oem-visual-pass.md. No copied OEM marks.
Creates a separate scene and never removes objects from the user's scene.
"""
import bpy, math, json
from mathutils import Vector
from pathlib import Path

ROOT = Path(r'C:/Users/feot1/Documents/Codex/2026-09-04/kan-2/work/drillity-the-game')
OUT = Path(r'C:/Users/feot1/Documents/Codex/2026-09-04/kan-2/outputs')
(ROOT/'src/rig/models').mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
scene = bpy.data.scenes.new('Drillity — compact rotary development')
bpy.context.window.scene = scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

def xyz(p): return (p[0], -p[2], p[1])
def mat(name, colour, metallic, rough):
    m=bpy.data.materials.new(name); m.diffuse_color=(*colour,1)
    m.use_nodes=True
    s=m.node_tree.nodes.get('Principled BSDF')
    s.inputs['Base Color'].default_value=(*colour,1)
    s.inputs['Metallic'].default_value=metallic
    s.inputs['Roughness'].default_value=rough
    return m
paint=mat('Plant ochre enamel',(.52,.29,.048),.32,.34)
dark=mat('Graphite casting',(.035,.046,.058),.48,.45)
steel=mat('Machined steel',(.40,.45,.49),.88,.27)
rubber=mat('Hydraulic hose',(.013,.018,.021),.0,.67)

def empty(name, parent=None, p=(0,0,0)):
    o=bpy.data.objects.new(name,None); scene.collection.objects.link(o)
    o.parent=parent; o.location=xyz(p); return o
root=empty('compact-rotary-head')
root['reference']='Comacchio GEO family / Klemm KH class, fictional geometry, not an OEM replica'
root['units']='metres'
root['revision']='01'
def finish(o,name,m,parent,p,bevel=0):
    o.name=name; o.parent=parent; o.location=xyz(p)
    o.data.materials.append(m)
    if bevel:
        mod=o.modifiers.new('Manufactured edge radii','BEVEL'); mod.width=bevel; mod.segments=2
        bpy.context.view_layer.objects.active=o
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o
def box(name,dims,p,m,parent=root,bevel=.008):
    bpy.ops.mesh.primitive_cube_add()
    o=bpy.context.object; o.dimensions=(dims[0],dims[2],dims[1])
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,m,parent,p,bevel)
def cyl(name,r,h,p,m,parent=root,axis='y',n=16,bevel=.003):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n,radius=r,depth=h)
    o=finish(bpy.context.object,name,m,parent,p,bevel)
    direction=Vector(xyz({'x':(1,0,0),'y':(0,1,0),'z':(0,0,1)}[axis]))
    o.rotation_quaternion=Vector((0,0,1)).rotation_difference(direction); o.rotation_mode='QUATERNION'
    return o
def tube(name,points,r,m,parent=root):
    curve=bpy.data.curves.new(name,'CURVE'); curve.dimensions='3D'
    curve.resolution_u=8; curve.bevel_depth=r; curve.bevel_resolution=2
    spl=curve.splines.new('BEZIER'); spl.bezier_points.add(len(points)-1)
    for v,p in zip(spl.bezier_points,points):
        v.co=xyz(p); v.handle_left_type='AUTO'; v.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,curve); scene.collection.objects.link(o); o.parent=parent
    curve.materials.append(m)
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH'); return bpy.context.object
def ring(name,ro,ri,h,p,m,parent=root,n=24):
    verts=[]; faces=[]
    for yy,rr in [(-h/2,ro),(h/2,ro),(-h/2,ri),(h/2,ri)]:
        verts += [xyz((rr*math.cos(i*math.tau/n),yy,rr*math.sin(i*math.tau/n))) for i in range(n)]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,n+j,n+i),(2*n+j,2*n+i,3*n+i,3*n+j),
                      (j,i,2*n+i,2*n+j),(n+i,n+j,3*n+j,3*n+i)])
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); scene.collection.objects.link(o)
    return finish(o,name,m,parent,p)

# Main casting with separate parting flange, motor mounts and inspection cover.
box('Gearcase',(.62,.38,.46),(0,-.22,0),paint,bevel=.035)
box('Lower flange',(.57,.075,.42),(0,-.447,0),dark,bevel=.012)
box('Carriage mounting plate',(.59,.46,.055),(0,-.19,-.258),dark)
box('Front inspection cover',(.37,.23,.028),(0,-.21,.244),paint,bevel=.013)
for x in [-.245,.245]:
    for z in [-.16,.16]:
        cyl('Case flange bolt',.018,.025,(x,-.49,z),steel,n=6,bevel=.001)
for x in [-.153,.153]:
    for y in [-.13,-.29]:
        cyl('Cover fastener',.012,.018,(x,y,.265),steel,axis='z',n=6,bevel=.001)

# Twin hydraulic motors. Connections point rearward, away from rotating tooling.
for x in [-.19,.19]:
    cyl('Motor mounting flange',.118,.042,(x,.009,-.06),steel)
    cyl('Hydraulic motor',.092,.205,(x,.132,-.06),dark,n=20,bevel=.007)
    cyl('Motor end cap',.096,.038,(x,.251,-.06),steel)
    box('Valve block',(.10,.075,.08),(x,.17,-.16),dark)
    for side in [-1,1]:
        z=-.208; xx=x+side*.026
        cyl('Pressure port',.016,.045,(xx,.17,z),steel,axis='z',n=6)
        tube('Motor supply hose',[(xx,.17,-.23),(xx,.28,-.30),(xx*.7,.18,-.39),(xx*.6,-.08,-.34)],.013,rubber)
    for a in range(4):
        th=(a+.5)*math.tau/4
        cyl('Motor mounting bolt',.012,.024,(x+.10*math.cos(th),.043,-.06+.10*math.sin(th)),steel,n=6,bevel=.001)

# Stationary flushing swivel and hose: it does not rotate with the shaft.
ring('Flush swivel',.086,.031,.14,(0,.056,.095),dark)
cyl('Flush fitting',.025,.072,(.098,.078,.095),steel,axis='x',n=6)
tube('Flush gooseneck',[(.13,.078,.095),(.29,.14,.095),(.355,.07,.06),(.345,-.11,-.09)],.018,rubber)

# Separate output spindle with a real open bore, designed for runtime animation.
spindle=empty('spindle',root,(0,-.525,0))
ring('Shaft shoulder',.108,.032,.055,(0,-.018,0),steel,spindle)
ring('Hollow drive shaft',.074,.032,.19,(0,-.13,0),steel,spindle)
ring('Chuck collar',.105,.032,.055,(0,-.223,0),dark,spindle,n=12)
for i in range(6):
    a=i*math.tau/6
    box('Drive flat',(.032,.067,.021),(.082*math.cos(a),-.182,.082*math.sin(a)),steel,spindle,bevel=.001)
out=empty('tool-out',spindle,(0,-.25,0))

# Batch by material separately on stationary and spinning assemblies.
# Preserve editability in the .blend source; export a joined copy below.
scene.world=bpy.data.worlds.new('Rotary studio world'); scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.16,.19,.24,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45
def aim(o,target): o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for name,loc,power,size in [('Key',(1.5,-2.0,2.7),420,2),('Fill',(-1.8,-.5,1),220,2),('Rim',(0,1.6,1.7),500,1.4)]:
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.shape='DISK'; data.size=size
    o=bpy.data.objects.new(name,data); scene.collection.objects.link(o); o.location=loc; aim(o,(0,0,-.2))
camdata=bpy.data.cameras.new('Review camera'); cam=bpy.data.objects.new('Review camera',camdata)
scene.collection.objects.link(cam); cam.location=(1.25,-1.8,.85); aim(cam,(0,0,-.23))
camdata.type='ORTHO'; camdata.ortho_scale=1.48; scene.camera=cam
scene.render.engine='CYCLES'; scene.cycles.samples=24
scene.render.resolution_x=1100; scene.render.resolution_y=1100; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.film_transparent=False
scene.render.filepath=str(OUT/'compact-rotary-head.png')
bpy.data.libraries.write(str(OUT/'compact-rotary-head.blend'),{scene})

# Export only the rig module; neither studio nor the user's pre-existing scene.
for parent in [root,spindle]:
    for m in [paint,dark,steel,rubber]:
        items=[o for o in list(parent.children) if o.type=='MESH' and o.data.materials[0]==m]
        if len(items)>1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in items: o.select_set(True)
            bpy.context.view_layer.objects.active=items[0]
            bpy.ops.object.join(); bpy.context.object.name=parent.name+'-'+m.name
bpy.ops.object.select_all(action='DESELECT')
root.select_set(True)
for o in root.children_recursive: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'src/rig/models/compact-rotary-head.glb'),export_format='GLB',use_selection=True,export_yup=True,export_extras=True)
triangles=0
for o in root.children_recursive:
    if o.type=='MESH': o.data.calc_loop_triangles(); triangles+=len(o.data.loop_triangles)
print(json.dumps({'scene':scene.name,'triangles':triangles,'mesh_count':sum(o.type=='MESH' for o in root.children_recursive),'glb':str(ROOT/'src/rig/models/compact-rotary-head.glb')}))

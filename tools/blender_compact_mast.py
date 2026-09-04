"""Execute through Blender MCP; photo references: research/20-mast-photo-reference.md."""
from pathlib import Path
ROOT = Path(r'C:/Users/feot1/Documents/Codex/2026-09-04/kan-2/work/drillity-the-game')
# Reuse authoring primitives only, before any rotary geometry is constructed.
source=(ROOT/'tools/blender_compact_head.py').read_text(encoding='utf-8').split('# Main casting')[0]
source=source.replace('compact rotary development','compact mast development').replace("root=empty('compact-rotary-head')","root=empty('compact-feed-mast')")
exec(compile(source,'mast-primitives','exec'))
lower=empty('mast-lower',root)
upper=empty('mast-upper',root,(0,2.1,0))
for parent in [lower,upper]:
    box('Fabricated spine',(.26,2.1,.19),(0,1.05,-.42),paint,parent,.006)
    for side in [-1,1]:
        box('Rail backing',(.052,2.1,.06),(side*.152,1.05,-.34),dark,parent,.002)
        box('Machined slide rail',(.035,2.1,.035),(side*.152,1.05,-.3068),steel,parent,.001)
        for y in [.23,.76,1.29,1.82]:
            cyl('Rail bolt',.009,.014,(side*.152,y,-.283),steel,parent,axis='z',n=6,bevel=0)
    # Two chain runs behind the carriage. Low-cost links, no animated drive claim.
    for y in range(30):
        for x in [-.036,.036]:
            box('Feed chain link',(.026,.045,.019),(x,.035+y*.07,-.31),dark,parent,0)
    for y in [.18,.88,1.58]:
        box('Rear reinforcement',(.31,.045,.04),(0,y,-.53),paint,parent,.003)
for parent,y in [(lower,.11),(upper,2.03)]:
    cyl('Chain return wheel',.082,.095,(0,y,-.31),dark,parent,axis='x',n=20)
    cyl('Wheel axle',.022,.36,(0,y,-.31),steel,parent,axis='x',n=12)
for side in [-1,1]:
    box('Crown cheek',(.035,.16,.39),(side*.15,2.06,-.25),paint,upper,.006)
    # Open guide: two jaws leave a 150mm free bore at the drill axis.
    box('Guide support',(.055,.10,.40),(side*.17,.25,-.20),paint,lower,.005)
    box('Guide jaw',(.075,.12,.15),(side*.115,.25,0),dark,lower,.004)
    cyl('Guide actuator',.045,.16,(side*.26,.25,0),paint,lower,axis='x')
    cyl('Guide piston',.019,.065,(side*.17,.25,0),steel,lower,axis='x')
    tube('Guide hydraulic line',[(side*.31,.25,-.015),(side*.33,.32,-.18),(side*.23,.43,-.43)],.009,rubber,lower)
root['reference']='Real GEO 305 photographs; fictional proportions, not an OEM replica'
bpy.data.libraries.write(str(OUT/'compact-feed-mast.blend'),{scene})
for parent in [lower,upper]:
    for m in [paint,dark,steel,rubber]:
        items=[o for o in parent.children if o.type=='MESH' and o.data.materials[0]==m]
        if len(items)>1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in items:o.select_set(True)
            bpy.context.view_layer.objects.active=items[0]
            bpy.ops.object.join()
bpy.ops.object.select_all(action='DESELECT')
root.select_set(True)
for o in root.children_recursive:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'src/rig/models/compact-feed-mast.glb'),export_format='GLB',use_selection=True,export_yup=True,export_extras=True)
triangles=0
for o in root.children_recursive:
    if o.type=='MESH':o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
print(json.dumps({'scene':scene.name,'triangles':triangles}))

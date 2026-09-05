"""
Shared helpers for building game SITES in Blender.

A SITE is the PLACE a machine stands in — a hoarded city plot, a quarry bench,
a tunnel portal, a platform deck. `blender/sites/<archetype>.py` is one module
per site the same way `blender/<machine>.py` is one module per machine, and this
file is to those what `blender/lib/rig.py` is to the machines.

WHY THIS FILE EXISTS AND IS NOT JUST `rig.py`
---------------------------------------------
It reuses `rig.py` outright for every primitive — `box()`, `tube()`, `hose()`,
`empty()`, `worklight()` — because a second copy of `box()` is the exact shape
of the bug that built every machine at half scale for a week (rig.py's own
docstring). What it adds is the four things a SITE has that a MACHINE does not:

1. A DIFFERENT BUDGET, AND IT IS COUNTED IN MATERIALS.
   A machine gets <= 70 draw calls because a rig is one object among many.
   A site is the other side of that trade and its ceiling is much lower — see
   THE BUDGET below, which is a measured number, not a guess. `finish()` here
   REFUSES to leave an over-budget file on disk.

2. THE ORIGIN CONTRACT IS THE COLLAR, NOT THE SLEW CENTRE.
   See AXES below. A machine's origin is its own slew centre; a site's origin
   is the hole, because that is the one point the surface band and the section
   band share (GAMEDESIGN.md §1: "the borehole in the section lines up
   horizontally with the mast above it").

3. THE MATERIAL NAMES ARE CHECKED AGAINST `assets.js` AT BUILD TIME.
   `kinds()` below PARSES `src/core/assets.js` rather than carrying a list.
   ASTRA.md §5: "two tables describing one thing will drift, and the one that
   is wrong will be believed." `assets.js` is the one table. A misspelled kind
   does not warn at runtime and vanish into `rawSteel` — it fails the build.

4. GROUND IS NOT MACHINERY. `rubble()` and `traces()` exist because the two
   things that make a rock site read as rock are a silhouette that is broken at
   every scale and the evidence of the tool that cut it, and neither can be got
   from an axis-aligned box. This was learned in `src/world/terrain.js`, whose
   rock features were one box per tier until a diagnostic frame showed them
   rendering as "a wall of smooth pale cardboard cartons with ruled edges".

THE BUDGET — MEASURED, NOT ASSUMED
-----------------------------------
glTF emits ONE DRAW CALL PER MATERIAL PER MESH and `finish()` joins statics by
material, so **a site .glb costs exactly one draw call per distinct material it
uses**. That is the whole budget and it is why this file counts materials.

It is worth being precise about why a site's number is not a machine's. The
site kit `terrain.js` builds procedurally is FREE in draw calls: every prop goes
into a merged, vertex-coloured pool of 6-7 meshes however much is in it. A .glb
is not free — it cannot join into that pool, because the pool's whole trick is
baking colour into vertices and a .glb carries authored materials the wear
system needs by name. So every material a site module adds is a draw call that
did not exist before, and it comes out of the surface band's ceiling of 80.

Measured on this machine, 2026-09-05, headed Chrome on the discrete GPU,
`quality=high`, by rendering the surface scene with `ctx.terrain.root` visible
and again with it hidden (the same per-band attribution `tools/shoot.mjs`
uses — draw calls are a function of the frustum, not of the target size):

    archetype                site   surface total   rig
    urban-plot                 15              48    27
    infrastructure-corridor    16              49    27
    quarry-bench               17              50    27
    open-pit-bench             17              50    27
    tunnel-portal              21              54    27
    exploration-pad            20              53    27
    well-pad                   18              51    27
    platform-deck              10              43    27
    marine-spread              11              44    27

and against the live method states, `node tools/shoot.mjs --headed --only
methods` on the same tree and the same afternoon (shots/s0-report.txt), whose
surface totals are what the 80 ceiling actually grades:

    m16-tunnel-jumbo 89   m06-overburden 86   m08-rc  85   m11-rockbolt 84
    m05-dth          83   m18-longhole   83   m19-sonic 83  m07-core     81
    ... and the other thirteen between 51 and 79.

**EIGHT OF TWENTY-ONE STATES ARE ALREADY OVER THE CEILING WITH NO .GLB ON THE
SITE AT ALL.** That single fact decides this budget, so it is worth stating what
it rules out: there is no headroom to spend. A site .glb cannot be additive.

The allowance, solved on the archetype this pipeline was proved on:

    surface ceiling                                              80
    worst rig that stands on a quarry bench (m08-rc, measured)  -57
    everything in the surface scene that is neither the site
      nor the rig — sky, cloud, vfx (measured)                   -6
    ------------------------------------------------------------------
    the WHOLE site's allowance                                   17
    what `quarry-bench` costs today (measured)                   17

The site is already spending every call it has. So:

    THE NUMBER: **6 materials per site .glb**, and `finish()` enforces it —
    AND the archetype's terrain.js branch must give back at least as many
    calls as the .glb takes, by dropping the procedural geometry the .glb
    now carries.

Why 6 and not 3 or 12:
  - It is what can be paid for. On `quarry-bench` the authored rock in the .glb
    replaces three instanced scatter meshes outright (`outcrops`, `scree`,
    `stones` — 3 calls), and the archetype has no engineered platform
    (`pad: 0`) so its pad decal is a call drawn for nothing. That is the change
    purse, and it is small.
  - It is enough to say something true. Six materials buys a quarry bench its
    blasted highwall with drill traces, its bench floor and stemming, the
    plant frames, the crusher steelwork, the danger-zone marking and the
    handrails — every object `research/16` §A.4 lists as identifying. The
    limit bites on VARIETY OF SURFACE, not on amount of geometry: detail
    sharing a material is free in draw calls and costs only triangles, and
    that is the lane to spend in (ASTRA.md §3.4).
  - A seventh material is not worth 1/80th of the surface band. Merge two
    near-identical surfaces instead — `rawSteel` and `wornSteel` on the same
    gantry are one material, not two.

If the number is genuinely wrong, MEASURE IT AGAIN and change it here with the
measurement written down, the way this one is. Do not raise it because a module
would like a seventh.

A NOTE ON WHAT THE .GLB IS ACTUALLY BUYING, SINCE IT IS NOT DRAW CALLS
----------------------------------------------------------------------
The procedural site kit is FREE in draw calls — that is the point of the merged
pool — so on pure cost a .glb is strictly worse. What it buys is authored form:
a highwall with half-barrel drill traces down it, a shot pattern on a real
burden and spacing, plant that reads as plant. Six cones and a berm cost
nothing and say nothing. That trade is the reason for this pipeline and it
should be made deliberately, per archetype, not by default.


NEVER SET `transmission` ABOVE 0
--------------------------------
Not on any material, not on a cabin window, not on a car windscreen, not on the
30 mm quad you think is too small to matter. Measured at **+65 to +81 draw
calls**, independent of object size, because three.js re-renders the WHOLE
opaque list into a transmission target. One cab window doubled the entire rig
fleet's cost. Site glazing is exactly where somebody reaches for it. There is
no `transmission` anywhere in this pipeline: a Blender material here is a NAME
ONLY (rig.py contract 2) and `src/core/gltfRig.js` re-asks `assets.js` for the
material with `transmission: 0` pinned. Do not add a route around that.

AXES, ORIGIN AND WHERE THE CAMERA IS
-------------------------------------
Metres. Blender is Z-up; `export_yup=True` maps Blender (x, y, z) to glTF
(x, z, -y). So:

    Blender +Z  ->  three.js +Y   (up)
    Blender +X  ->  three.js +X
    Blender +Y  ->  three.js -Z

**Origin is the hole collar at ground level.** `terrain.js` puts the collar at
its own (0, 0, 0) and flattens the ground to y = 0 out to `CFG.padRadius`, so a
site .glb built about the collar drops in with no offset.

**The machine stands BEHIND the collar** at three.js z = +2.4 (`CFG.pad`), and
**the hero camera is further out on +z again**, at three.js [7.60, 2.60, 9.90]
looking at about y 3.40 with a 34-degree vertical field. Converting:

    toward the camera  =  three.js +Z  =  Blender -Y
    away from the camera, behind the machine  =  Blender +Y

So a highwall, a hoarding line, a portal headwall — anything meant to stand
BEHIND the work and close the sky — goes at **Blender +Y**. Anything meant to
be in the foreground goes at **Blender -Y**. Getting this backwards puts the
site's whole subject off-camera, and it will not be obvious in the Blender
viewport.

WHAT DOES *NOT* BELONG IN A SITE .GLB
--------------------------------------
The ground mesh, `heightAt()`, the far-field horizon and the region's scatter
stay in `terrain.js`. `heightAt(x, z)` is a shared contract — the rig agent and
the terrain must never disagree about where the ground is — and it is a
function, not a mesh. A site .glb carries FURNITURE AND EVIDENCE OF WORK: the
built structures, the plant, the markings, the spoil, the things a crew left
behind. If you find yourself modelling terrain here, it belongs in the height
function instead.

NO GUESSING
-----------
ASTRA.md §3.1, and it applies to a place exactly as it applies to a machine:
every dimension traces to a source cited in a comment beside the constant, and
anything that cannot be sourced is marked `NOT SOURCED` at the point of use.
An invented detail on a site is the same offence as an invented dimension on a
machine. `research/16-site-archetypes.md` is the archetype pack and it marks
its own claims [F] fact / [I] inference / NOT SOURCED — carry that marker
through into the module.
"""

import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import bpy                                                        # noqa: E402
import rig as R                                                   # noqa: E402

# Re-exported so a site module imports ONE library. These are rig.py's, not
# copies of rig.py's — see the note at the top about `box()`.
tube = R.tube
hose = R.hose
part = R.part
empty = R.empty
worklight = R.worklight


def bake(o):
    """Apply an object's modifiers NOW.

    `finish()`'s join keeps only the ACTIVE object's modifier stack, so a bevel
    on any of the other three hundred boxes in a material group is silently
    thrown away — the geometry exports unbevelled and nothing says so. Every
    machine module discovered this independently; it belongs in the library.
    """
    if not o.modifiers:
        return o
    prev = bpy.context.view_layer.objects.active
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            o.modifiers.remove(m)
    bpy.context.view_layer.objects.active = prev
    return o


def box(name, size, mat=R.MAT_PAINT, parent=None,
        loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.0):
    """`rig.box()` with its modifiers baked — see `bake()`. Same signature, same
    primitive, no local compensation of any kind: `rig.box()` was measured on
    2026-09-05 and builds at true scale, and `rig.reset()` re-measures it on
    every build. Do not add one here."""
    return bake(R.box(name, size, mat, parent, loc, rot, bevel))

NODE_MOUNT = R.NODE_MOUNT
NODE_AIM = R.NODE_AIM
NODE_PIVOT = R.NODE_PIVOT
NODE_SLIDE = R.NODE_SLIDE

TAU = math.pi * 2.0
D2R = math.pi / 180.0

# ── materials a SITE is built from ───────────────────────────────────────────
# Every one of these is a real kind in src/core/assets.js and is asserted
# against it by `kinds()` before export. The names, not the values, are the
# contract: assets.js generates the texture procedurally at runtime with wear
# and dirt driven by gameplay state.
MAT_PAINT = R.MAT_PAINT             # 'paintedSteel'  — plant bodywork
MAT_DARK = R.MAT_DARK               # 'paintedDark'   — frames, guarding, chutes
MAT_STEEL = R.MAT_STEEL             # 'rawSteel'      — bright working steel
MAT_WORN = R.MAT_WORN               # 'wornSteel'     — oxidised, weathered
MAT_RUBBER = R.MAT_RUBBER           # 'rubber'        — belts, tyres, seals
MAT_GLASS = R.MAT_GLASS             # 'glass'         — cab glazing. transmission 0.
MAT_HAZARD = R.MAT_HAZARD           # 'safetyStripe'  — hazard marking, notices

MAT_ROCK = 'blastedRock'            # a blasted face, muckpile, shot rock
MAT_FACE = 'rockFace'               # undisturbed / sawn rock
MAT_GRAVEL = 'gravel'               # graded fill, haul road, stemming, fines
MAT_DIRT = 'dirt'                   # made ground, spoil
MAT_CONCRETE = 'concrete'           # poured in situ: plinths, hardstanding
MAT_PRECAST = 'precastConcrete'     # barriers, kerbs, blocks
MAT_SHOTCRETE = 'shotcrete'         # sprayed lining and overspray
MAT_GALV = 'galvanised'             # handrail, walkway, ducting, signposts
MAT_MESH = 'mesh'                   # weldmesh, fencing, grating
MAT_TIMBER = 'timber'               # sleepers, bearers, pegs, hoarding ply
MAT_PLASTIC = 'plastic'             # cones, barriers, tanks, drums
MAT_SAND = 'sand'
MAT_SNOW = 'snow'
MAT_GRASS = 'grass'

# ── THE BUDGET ───────────────────────────────────────────────────────────────
# See THE BUDGET in the module docstring. This is a measured number and the
# measurement is written down there. Change it only with a new measurement.
MAX_MATERIALS = 6


def reset():
    """Empty scene, metric units, primitives measured. Delegates to rig.reset()
    so the `box()`/`tube()` self-check runs for a site exactly as it does for a
    machine — a site is dimensioned against sources in the same way."""
    return R.reset()


# ═════════════════════════════════════════════════════════════════════════════
# THE MATERIAL ALLOW-LIST — DERIVED FROM assets.js, NEVER COPIED
# ═════════════════════════════════════════════════════════════════════════════

_KINDS_CACHE = None


def kinds(root=None):
    """Every material kind `src/core/assets.js` can actually make.

    PARSED, not copied. `assets.js` is the only thing in the tree that can make
    a material and it is the only list of what it can make; a second list here
    would drift, and per ASTRA.md §5 the one that is wrong is the one that gets
    believed. It has already happened once in this pipeline: `rig.py` named a
    material `paintedDark` from the day it was written, `assets.js` had no such
    kind, `resolveKind()` fell through to `rawSteel`, and every chassis, track
    guard and walkway on all seventeen machines rendered as bright bare metal
    for the life of the pipeline. The only symptom was one console line.

    This is deliberately STRICTER than `tools/checkmodels.mjs`, which harvests
    kinds with an unscoped six-space-indent regex and so also swallows the
    `PATTERNS`, `PATTERN_FEAT` and `noise` objects — 41 names where only ~34 are
    real kinds. A .glb whose material is called `clay` or `void` passes that
    gate and is then silently substituted at runtime. Here the scan is bounded
    to the `const KINDS = {` literal plus the `KINDS.<name> =` assignments that
    follow it, so a site cannot ship a name assets.js cannot serve.
    """
    global _KINDS_CACHE
    if _KINDS_CACHE is not None:
        return _KINDS_CACHE
    root = root or os.path.abspath(os.path.join(HERE, '..', '..'))
    path = os.path.join(root, 'src', 'core', 'assets.js')
    with open(path, 'r', encoding='utf-8') as fh:
        src = fh.read()

    start = src.find('const KINDS = {')
    if start < 0:
        raise AssertionError(
            'site.kinds(): could not find `const KINDS = {` in %s. assets.js is '
            'another agent\'s file and may have been restructured — fix this '
            'parser, do NOT fall back to a hardcoded list.' % path)
    # Walk to the matching close brace so nothing outside the literal is read.
    i = src.index('{', start)
    depth, end = 0, -1
    while i < len(src):
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                end = i
                break
        i += 1
    if end < 0:
        raise AssertionError('site.kinds(): unbalanced braces in the KINDS literal')

    body = src[start:end]
    found = set(re.findall(r'^\s{6}([A-Za-z][A-Za-z0-9_]*)\s*:\s*\{', body, re.M))
    # kinds patched on after the literal, e.g. `KINDS.paintedDark = {...}`
    found |= set(re.findall(r'^\s*KINDS\.([A-Za-z0-9_]+)\s*=', src[end:], re.M))
    if len(found) < 20:
        raise AssertionError(
            'site.kinds(): parsed only %d kinds out of assets.js, which cannot '
            'be right. A gate that measures nothing must fail, not pass '
            '(ASTRA.md §8).' % len(found))
    _KINDS_CACHE = found
    return found


# ═════════════════════════════════════════════════════════════════════════════
# DETERMINISM
# ═════════════════════════════════════════════════════════════════════════════

def rnd(*seed):
    """A reproducible 0..1 from any tuple of numbers.

    A site is mostly scatter — rubble, collars, spoil, flags — and scatter must
    be REPRODUCIBLE: a rebuild that shuffles the rock is a diff nobody can read
    and a screenshot nobody can compare. `random` is not used anywhere in this
    pipeline for that reason.
    """
    h = 0.0
    for i, s in enumerate(seed):
        h += (s + 1.0) * (127.1 + i * 74.7) + (s * s) * 311.7
    v = math.sin(h) * 43758.5453123
    return v - math.floor(v)


def jitter(amount, *seed):
    """Symmetric -amount..+amount from `rnd`."""
    return (rnd(*seed) - 0.5) * 2.0 * amount


# ═════════════════════════════════════════════════════════════════════════════
# GROUND FORMS — the shapes a box cannot make
# ═════════════════════════════════════════════════════════════════════════════

def rubble(name, centre, size, mat=MAT_ROCK, block=None, n=None, seed=0.0,
           parent=None, yaw=0.0, bevel=0.0):
    """A MASS OF BROKEN ROCK, not a box.

    Overlapping blocks of a real physical size filling the envelope `size`, each
    yawed, tilted and scaled off `rnd`. The overlap is deliberate and generous:
    this has to read as ONE mass with a ragged edge, not as a pile of separate
    stones.

    WHY. Every rock feature in `src/world/terrain.js` was one axis-aligned box
    per tier, and the round-4 diagnostic frame of the tunnel portal showed what
    that renders as: a wall of smooth pale cardboard cartons with ruled edges,
    stacked. No texture rescues it, because the failure is the SILHOUETTE — a
    blasted face's outline is broken at every scale and a box's is straight at
    every scale.

    `block` IS THE CHARACTERISTIC EDGE OF ONE BLOCK, IN METRES, AND IT IS THE
    WHOLE POINT OF THIS FUNCTION.

    The first version of this took `n` and sized every block as a FRACTION OF
    THE ENVELOPE, which is fine for a roughly cubic pile and catastrophic for
    anything long: asked for a 47 m highwall it produced blocks 24 to 45 metres
    across, and the first render (shots/site-quarry-lower.png) came back as
    smooth stacked slabs — the exact cardboard-carton failure this function was
    written to prevent, reproduced by the prevention. A mass of broken rock has
    a block size that is a property of the ROCK and the SHOT, not of how big an
    area you happen to be covering. So the caller states it, and `n` is derived
    from the volume ratio unless it is given.

    Cost is `n` boxes in ONE material, so after `finish()`'s join the whole mass
    is part of a single draw call and costs only triangles. That is the lane to
    spend in.

    `seed` MUST differ per call site or two masses come out identical.
    """
    made = []
    cx, cy, cz = centre
    w, d, h = size
    if block is None:
        block = min(w, d, h) * 0.85
    block = max(1e-3, min(block, max(w, d, h)))
    if n is None:
        # ~2.2 blocks' worth of volume per block, so they interlock rather than
        # tile. Bounded: below 4 it is a box again, above 64 it is only tris.
        n = int(max(4, min(64, round(2.2 * (w * d * h) / (block ** 3)))))
    for i in range(n):
        r1 = rnd(i * 1.7 + seed, seed * 0.37)
        r2 = rnd(i * 2.9 + seed, seed * 0.71)
        r3 = rnd(i * 4.1 + seed, seed * 1.13)
        r4 = rnd(i * 5.3 + seed, seed * 1.79)
        bw = min(w, block * (0.55 + r1 * 0.80))
        bd = min(d, block * (0.60 + r3 * 0.85))
        bh = min(h, block * (0.55 + r2 * 0.80))
        ox = (r2 - 0.5) * max(0.0, w - bw) * 0.98
        oy = (r4 - 0.5) * max(0.0, d - bd) * 0.90
        oz = (r3 - 0.5) * max(0.0, h - bh) * 0.94
        px = cx + math.cos(yaw) * ox - math.sin(yaw) * oy
        py = cy + math.sin(yaw) * ox + math.cos(yaw) * oy
        made.append(box(
            '%s-%d' % (name, i), (bw, bd, bh), mat, parent,
            loc=(px, py, cz + oz),
            rot=((r1 - 0.5) * 0.22, (r3 - 0.5) * 0.20, yaw + (r4 - 0.5) * 0.55),
            bevel=bevel))
    return made


def traces(name, origin, along, count, height, radius, mat=MAT_ROCK,
           parent=None, lean=0.0, seed=0.0, sides=7, embed=0.55):
    """HALF-BARREL DRILL TRACES down a blasted face.

    The scalloped vertical grooves left when a row of holes is drilled along a
    line and blasted so that the face splits between them — the signature of
    presplitting, smooth blasting, line drilling and cushion blasting, which is
    the sourced list of the four ways a highwall is protected
    (research/16 §A.4, [OSMRE-BLAST]).

    They are the single clearest evidence that a rock face was DRILLED rather
    than eroded, and they are what stops a quarry or a portal reading as a
    cliff. Modelled as part-embedded cylinders standing on the face: `embed` is
    the fraction of the cylinder buried in the rock, so only the barrel shows.

    `origin` is the foot of the first trace, `along` the vector from one trace
    to the next, `lean` the batter of the face in radians (rotation about the
    `along` axis, so the traces lie back with the wall).
    """
    made = []
    ax, ay, az = along
    for i in range(count):
        j = jitter(radius * 0.22, i * 3.1 + seed, seed)
        made.append(tube(
            '%s-%d' % (name, i), radius, height, mat, parent,
            loc=(origin[0] + ax * i + j,
                 origin[1] + ay * i + radius * (1.0 - embed) * 2.0,
                 origin[2] + az * i),
            rot=(lean, 0.0, 0.0), sides=sides))
    return made


def pattern(name, cols, rows, burden, spacing, mat=MAT_GRAVEL, parent=None,
            origin=(0.0, 0.0, 0.0), yaw=0.0, collar_r=0.30, seed=0.0,
            drilled=None):
    """A BLAST PATTERN, PEGGED OUT — the geometry that IS a quarry bench.

    `spacing` runs ALONG the face (the +X direction before `yaw`), `burden` runs
    back from it. Both are the caller's, and both must trace to a source: the
    burden/spacing relationship is sourced (research/16 §A.4, [OSMRE-BLAST]) but
    the numbers depend on the charge diameter, so this helper takes them and
    never invents them.

    Emits, per hole, the ring of pale drill dust and cuttings a collar sits in.
    `drilled(i, j)` may return False to skip a collar, so a module can show a
    pattern being drilled rather than a finished one — which is the state the
    player is actually in.

    Returns the list of (x, y) collar centres in the site's own frame so the
    module can put flags, stemming or a hole in each one.
    """
    made, at = [], []
    for j in range(rows):
        for i in range(cols):
            if drilled is not None and not drilled(i, j):
                continue
            lx = (i - (cols - 1) * 0.5) * spacing
            ly = j * burden
            px = origin[0] + math.cos(yaw) * lx - math.sin(yaw) * ly
            py = origin[1] + math.sin(yaw) * lx + math.cos(yaw) * ly
            at.append((px, py))
            r = collar_r * (0.86 + 0.28 * rnd(i * 7.3 + seed, j * 3.9 + seed))
            made.append(tube('%s-collar-%d-%d' % (name, i, j), r, 0.06, mat,
                             parent, loc=(px, py, origin[2] + 0.005), sides=9))
    return at, made


def anchor(name, loc, parent=None, **extras):
    """A named node the GAME reads off this site.

    `mount:` is reused deliberately rather than inventing a `site:` prefix:
    `src/core/gltfRig.js` already indexes `mount:` and `aim:` and already
    survives `finish()`'s join by snapshot-and-restore, and a new prefix would
    be a fifth thing to get wrong for no gain. Extras land in glTF `extras` and
    reach the loader as `userData`.
    """
    o = empty(NODE_MOUNT, name, parent, loc)
    for k, v in extras.items():
        o[k] = v
    return o


# ═════════════════════════════════════════════════════════════════════════════
# EXPORT
# ═════════════════════════════════════════════════════════════════════════════

def _scene_materials():
    """Distinct material names on real geometry in the scene."""
    used = set()
    for o in bpy.context.scene.objects:
        if o.type not in {'MESH', 'CURVE', 'SURFACE', 'FONT'}:
            continue
        for m in (o.data.materials if o.data else []):
            if m is not None:
                used.add(m.name)
    return used


def finish(out_path, budget=MAX_MATERIALS):
    """Validate, join by material, export — and REFUSE to leave a bad file.

    Three things happen here that `rig.finish()` does not do, in this order:

    1. BEFORE EXPORT, every material name in the scene is checked against the
       kinds `src/core/assets.js` can actually make (`kinds()`, which parses
       assets.js). A name it cannot make does not warn at runtime — it silently
       becomes `rawSteel`, which is how an entire fleet ended up wearing bare
       metal. Here it raises.

    2. BEFORE EXPORT, the material count is checked against the budget, because
       the site's draw-call cost IS its material count once statics are joined.
       See THE BUDGET in the module docstring for where 12 comes from.

    3. AFTER EXPORT the draw count is re-derived from the joined scene and, if
       it exceeds the budget, THE FILE IS DELETED and the build raises.
       "Verify by measurement, not by the absence of an error" (ASTRA.md §8):
       a check that runs before the join is a check on an assumption, and an
       over-budget .glb left on disk is one somebody will ship. There must be no
       state in which an over-budget site sits in `public/models/sites/` looking
       like a finished asset.

    The join itself, the world-transform snapshot that keeps `mount:` nodes
    where they were put, and the export flags are all `rig.finish()`'s — one
    implementation, not two.
    """
    used = _scene_materials()
    known = kinds()
    bad = sorted(n for n in used if n not in known)
    if bad:
        raise AssertionError(
            'site.finish(): %s uses material name(s) src/core/assets.js cannot '
            'make: %s.\nAn unknown kind does NOT throw at runtime — '
            'resolveKind() substitutes rawSteel and logs one line nobody reads '
            '(ASTRA.md §4 contract 2). Valid kinds include: %s'
            % (os.path.basename(out_path), ', '.join(bad),
               ', '.join(sorted(known)[:12])))

    if len(used) > budget:
        raise AssertionError(
            'site.finish(): %s uses %d materials against a budget of %d.\n'
            'A site .glb costs ONE DRAW CALL PER MATERIAL once finish() joins '
            'the statics, and it is spending the surface band\'s ceiling of 80. '
            'Merge two near-identical surfaces; do not raise the number without '
            'a new measurement (see THE BUDGET in blender/lib/site.py).\n'
            'used: %s' % (os.path.basename(out_path), len(used), budget,
                          ', '.join(sorted(used))))

    R.finish(out_path)

    # Re-derive the draw count off the JOINED scene — the number the game will
    # actually pay, not the number we predicted before joining.
    draws = 0
    for o in bpy.context.scene.objects:
        if o.type not in {'MESH', 'CURVE', 'SURFACE', 'FONT'}:
            continue
        draws += max(1, len(o.data.materials) if o.data else 1)
    if draws > budget:
        try:
            os.remove(out_path)
        except OSError:
            pass
        raise AssertionError(
            'site.finish(): %s joined to %d draw calls against a budget of %d '
            '— THE FILE HAS BEEN DELETED so it cannot be shipped.\n'
            'A draw call that survives the join is geometry the join could not '
            'reach: anything parented under a pivot: or slide: node is excluded '
            'by design. A site that needs moving parts must pay for them out of '
            'the same budget.' % (os.path.basename(out_path), draws, budget))

    print('SITE_OK path=%s materials=%d draws=%d budget=%d'
          % (out_path, len(used), draws, budget))
    return out_path

"""
SITE — `underground-drive`.  Exports `public/models/sites/underground-drive.glb`.

READ THIS BEFORE ANYTHING ELSE IN THE FILE
==========================================
This module does **not** model the drive. It models what the crew left standing
in it, and it does that because the drive is already built — better than a
static `.glb` could build it — and because measuring what is already there is
the first thing this project's rules ask for (ASTRA.md §1.1, §10).

`src/world/terrain.js` `buildDrive()` (from line 5614) already sweeps a
horseshoe shell down `driveGroup`, per method, from `src/core/env.js`
`UNDERGROUND`: raw blasted rock with shader half-barrels on the sourced contour
spacing, a shotcrete lining whose boundary is the player's own progress, the
face and its drill pattern, a black rock mass round the outside, the lay-flat
ventilation duct with a fan pressure wave running down it, its hangers, the
services pipes and power cable on the opposite rib, the festoon string, the
bolt-plate pattern, welded mesh on the arch for `rockbolt`, muck on the invert,
standing water in the ditch and drips off the crown. `research/16` §A.6's own
verdict on that work: *"This archetype is the best thing in the game and should
be the model for the rest."*

So the honest question for a `.glb` here is not "what does a drive look like",
which is answered, but **"what is in a working drive that a swept shell and a
shader cannot be?"** — and the answer is the crew's material: the ground-support
consumables staged along the rib, the power they run off, and the markers that
stop a 20 t machine reversing into them. `blender/lib/site.py` says the same
thing in its own words: a site `.glb` carries *"FURNITURE AND EVIDENCE OF WORK:
the built structures, the plant, the markings, the spoil, the things a crew left
behind"*, and *"if you find yourself modelling terrain here, it belongs in the
height function instead"*. The drive shell is this archetype's terrain.

FOUR DRIVES, ONE ARCHETYPE ID — THE CONSTRAINT THAT SHAPED EVERYTHING
=====================================================================
`underground-drive` is the ONLY archetype the four underground methods declare
(`src/game/data.js` `UNDERGROUND_METHODS`), and `env.js` `UNDERGROUND` gives
each of them a different room:

    method          width x height   wallH   faceZ   backZ
    tunnel-jumbo     12.6 x 8.4       4.0     -7.0     62
    raise-boring     12.0 x 6.8       3.4     -9.0     34
    rockbolt          5.6 x 5.4       2.8    -13.0     50
    longhole          5.0 x 5.0       2.6    -30.0     48

**2.5x on a side.** A rib at x = -2.5 in a production drive is at x = -6.3 in a
jumbo heading, so nothing in this file may hang on, lean against, or be
dimensioned from a rib: it would be buried in rock in two of the four drives or
floating in mid-air in the other two. Everything here therefore **stands free on
the invert, inside the smallest of the four profiles**, and `gates()` refuses the
build if any vertex leaves that envelope. In a 5 m drive it reads as material
stacked along the rib; in a 12.6 m heading it reads as material stacked clear of
the traffic lane, which is where it goes in a heading that size anyway. It is
never wrong, and it is composed for the small drive. That is stated, not hidden.

AND THE MACHINES ARE IN THE ROOM ALREADY — MEASURED
====================================================
`rigFactory.js` only TRANSLATES the rig to `terrain.collarPosition`; `terrain.js`
yaws the tube (`DRIVE_YAW`) and not the machine, so every machine stands
diagonally across its own drive. Measured by transforming EVERY vertex of the
shipped exports and rotating into drive-local — the method `env.js` used for the
raise-bore chamber, and this file's measurement reproduces the figures that file
publishes exactly (see MACHINE_MAX_Z below):

    machine        drive-local x        drive-local z      drive half-width
    tunnel-jumbo   -5.875 .. +5.360   -5.789 .. +6.316          6.30   fits
    raise-boring   -5.554 .. +5.524   -5.681 .. +5.691          6.00   fits
    bolter         -3.186 .. +5.852   -5.136 .. +3.143          2.80   DOES NOT
    longhole-rig   -2.981 .. +3.385   -3.345 .. +3.661          2.50   DOES NOT

The bolter overhangs its own rib by 3.05 m and the longhole rig by 0.89 m. That
is not this file's to fix — `env.js`'s own NEEDS note anticipates it ("comes
back the day a rig is yawed with its drive") — but it is why the keep-clear
below is measured per metre of chainage rather than assumed.

WHERE THAT LEAVES ROOM, AND WHY THE MODEL IS WHERE IT IS
=========================================================
Within the strip this model can occupy (|x| <= 2.4), the four machines reach to
z = +4.0, +4.0, +4.0 and +6.0 respectively. **z >= +6.60 is clear of all four**,
and it stays clear all the way back to the player, who stands at drive-local
z = +13.75. So the model lives in the ~7 m of drive between the machine's tail
and the eye: the near field, on the player's side of the work.

That is also where a crew really does stage material. You do not leave a pack of
mesh at the face — it gets blasted, or the loader runs over it.

THE ENCLOSURE PROBLEM: HOW THIS MODEL AVOIDS MAKING A DARK PLACE DARKER
=======================================================================
The brief for this site is that the player must still see the machine and the
collar inside a sealed space. The drive's light rig is `env.js`'s, solved per
variant against `work` and `ROCK_ALBEDO = 0.095` through `cd()`, and its value
ladder is explicit: the work at linear 0.62, near walls at 0.11, the drive beyond
30 m below 0.006. Two failures are already recorded against that ladder — a
shotcrete lining that rendered at sRGB ~150 while the work sat at 56, and a vent
bag whose top edge clipped white — and both were the same fault: **a surface
between the eye and the subject that was brighter than the subject.**

Two facts about underground light are worth having straight, because both point
the same way.

**There is no numeric illuminance requirement for an underground metal-mine
face, and that is a positive finding rather than a gap.** US 30 CFR Part 57
Subpart P has exactly two sections: §57.17001 requires "Illumination sufficient
to provide safe working conditions… in and on all SURFACE structures", i.e.
surface only and with no number, and §57.17010 says "**Individual electric lamps
shall be carried for illumination by all persons underground**"
(https://www.ecfr.gov/current/title-30/part-57). The only numeric US figure is
coal-only — 30 CFR §75.1719-1 brackets legibility at not less than 0.06
footlamberts and states the lighting "shall be IN ADDITION TO that provided by
personal cap lamps", with the lit zones named as "The face" and "The ribs, roof,
floor, and exposed surface of mining equipment"
(https://www.ecfr.gov/current/title-30/part-75). So the sourced light model
underground is: **a lamp on every head, and work lights on the machine** —
exactly the rig `env.js` already builds, and nothing that a static site model
should be adding to.

**And the practical ladder is far flatter than instinct suggests**: haulage roads
and drives ~20 lux, loading and tipping points ~50 lux, work areas with a visual
task ~100 lux — about **2.3 stops** end to end
(https://www.nordland-lighting.com/html.lighting-technical/lux-levels-mining-applications.html,
attributed there to the ILO and the South African DMR; a secondary compilation,
not a standard, and cited as such). A pitch-black tube with one blazing object in
it is not what underground looks like; separation comes from haze and from edge
light, not from raw brightness ratio.

So this model's answer is not more light. It is four rules, each enforced by a
gate at the bottom of this file:

  1. **NOTHING IS EMISSIVE AND NOTHING IS PALE.** Four materials, all mid or
     dark: `rawSteel`, `paintedDark`, `rubber`, `safetyStripe`. No `concrete`,
     no `galvanised`, no white. A bright near object is the one thing that has
     measurably broken this scene before.
  2. **NOTHING STANDS IN FRONT OF THE WORK.** `gates()` projects every vertex
     through the hero frame and refuses any that lands inside the NDC column the
     machine and the collar occupy. The model is confined to the left of it.
  3. **IT IS A SILHOUETTE LAYER, NOT A LIT ONE.** Every light in the drive is
     ahead of this geometry, on the machine, so these objects are BACK-lit: dark
     shapes with a rim, read against the lit work beyond. Robert Yang's GDC 2018
     "How to Light a Level" states the principle for exactly this case — where a
     key would be lost, use rim and background light so the SILHOUETTE carries
     the read (https://www.blog.radiator.debacle.us/2018/03/gdc-2018-how-to-light-level-slides-and.html).
     It costs no light, no material and no draw call.
  4. **IT USES A LIGHT THAT IS ALREADY THERE.** `env.js` hangs a festoon bulb
     over this stretch of every drive (`ugFest*`, on the opposite rib at
     `u.festoon.x/y`, 4-5 m away across the drive), so the laydown gets a genuine
     warm top-side key from a practical that is in shot. Nothing new is asked of
     the light rig, and `dust.base` 0.048-0.052 already puts scattering medium
     between these objects and the work, which is what "lifts the shadows by
     scattering light into them" without an unmotivated fill
     (https://neiloseman.com/the-science-of-smoke/).

And one more reason this model earns its place in a dark room, which is the
strongest single argument for it: **an enclosed rock space has no readable scale
without a known-size object in it.** Cave-photography practice puts it plainly —
*"a photo of some rocks at your feet can look similar to a room"*, so a person or
an object of known size is included deliberately
(https://startcaving.com/caving-guides/cave-photography). This game has no people
underground. A pack of 2.4 x 1.2 m mesh sheets, a basket of 2.4 m bolts and a
1.05 m delineator are objects a driller knows the size of by heart, and putting
them in the near field is what tells the eye how big the drive is.

WHY THIS IS UNDERGROUND AND NOT A PORTAL
=========================================
Another agent is building `tunnel-portal` — outside, daylight, looking in. The
two must not be confusable, and the separation here is by CONTENT, not by
lighting, because a `.glb` carries no light:

  · **Nothing in this file has ever seen weather.** No sun-facing surface, no
    drainage to daylight, no vegetation, no netting, no cut slope, no wing wall,
    no headwall, no stockpile, no conveyor, no road furniture, no horizon.
  · **Everything is at drive scale, not portal scale.** A portal stages material
    outside on a laydown the size of a car park; a drive stages it IN the drive,
    in single stillages a machine can lift, because there is nowhere else.
  · **Retroreflective delineation.** Underground signage is supplied on
    retroreflective sheeting on a steel or PVC substrate
    (https://hivis.com/products/underground-general-signage), and drives are
    delineated with colour-coded reflective markers
    (https://www.fspglobalproducts.com/mining/deliniation-signage/); NIOSH
    documents coloured retroreflective markers used to tell a primary escapeway
    from a secondary one (https://stacks.cdc.gov/view/cdc/215359/cdc_215359_DS1.pdf).
    A retroreflector only earns its place where the only light is on a machine or
    a helmet. On a portal apron in daylight it would be pointless.
  · **The consumables are ground support** — mesh, friction bolts, dished plates.
    That is the work that exists because rock is over your head.
  · **It is dirty and it is being worked out of.** A scrap bin with cropped bolt
    ends in it, not a tidy stack. The production note from a slasher shot in a
    working colliery is the cleanest statement of why: the town cleaned the mine
    up for the crew, the director said it then looked like Disneyland, and they
    had to spend money re-dirtying it
    (https://cinemascholars.com/my-bloody-valentine-1981-the-making-of-a-slasher-classic/).
  · **Nothing is taller than the smallest back.** Every object clears 2.7 m,
    because in a 5.0 m drive with a 2.6 m springing line that is what fits.

MATERIALS — FOUR, AND THE BUDGET IS NOT SIX HERE
=================================================
`blender/lib/site.py` allows six. This file takes four and passes `budget=4` to
`finish()` so it cannot quietly grow, because the surface band's ceiling of 80 is
measured TIGHTER underground than on any surface archetype. `env.js`'s own
transmission measurement records the underground surface totals after the fix:

    rockbolt 86 · tunnel-jumbo 89 · longhole 74      (ceiling 80)

Two of the three are already over with no `.glb` on the site at all, and unlike
`quarry-bench` there is no procedural scatter for this model to replace — it adds
objects the drive does not have rather than re-authoring objects it does, so
**every material here is a net addition** and the change purse is empty. Four is
what can be argued for:

    rawSteel      stillage and rack frames, skids, bolts, plates, the scaling bar
    paintedDark   the distribution board, bins, pallets, drums, posts, strapping
    rubber        the trailing cables and the coiled spare duct
    safetyStripe  retroreflective banding and the marker panel

Detail sharing one of those four is free in draw calls and costs only triangles,
which is the lane to spend in (ASTRA §1.6).

THE FRAME THIS IS EXPORTED IN — DRIVE-LOCAL, AND THE STORY IS WORTH KEEPING
===========================================================================
**The export is in DRIVE-LOCAL metres and carries no rotation of its own.**
`src/world/terrain.js` `siteParent()` returns `driveGroup` for an archetype whose
`plane` is `underground`, and `driveGroup` already carries
`rotation.y = DRIVE_YAW`, so a drive-local model dropped in at
`position.set(0, 0, 0)` lands correctly and a PRE-YAWED one would be rotated
twice — 42.28 degrees across its own drive, silently, and buried in the rib.

This file was originally written the other way round, and the reason is worth
recording because it is the ASTRA §10 lesson happening live. When it was
authored, `rebuild()`'s underground branch RETURNED BEFORE `attachSiteModel()`
and `siteModelReady()` began with `!ugSpec`, so no site model could reach an
underground plane at all; the honest reading at that moment was that the loader
would attach this to `terrain.root` in world space, so the module baked the yaw
in. While this module was being built, the integration agent rewrote that path:
`attachSiteModel()` now runs after `buildDrive()`, `siteModelReady()` is a PLANE
test rather than a method test, and the new comment states the contract
explicitly — *"underground it is the drive-local origin, which `driveGroup` then
yaws onto the camera's bearing"*.

Re-reading the file rather than trusting the earlier note is what caught it.
ASTRA §10: *"Do not take a sub-agent's report at face value… Check the file
yourself before acting on a claim about it."* The claim in question was this
module's own.

`DRIVE_YAW` is still parsed out of `src/core/env.js` — the same discipline
`site.kinds()` uses on `assets.js`, and for the same reason (ASTRA §5) — because
the composition is solved against the hero camera and the camera's bearing IS
that yaw. It is used to convert the eye into drive-local and never to move
geometry.

**THE REMAINING INTEGRATION GAP, AND IT IS ONE LINE.** `terrain.js`'s
`ARCHETYPES` table still reads `'underground-drive': { plane: 'underground' }`
with **no `model:` key**, so `attachSiteModel()` returns at `if (!id) return;`
and this file is never fetched. `terrain.js` is not this agent's file; the
request is in `research/sites/underground-drive.md` and in the hand-over.

NO GUESSING
===========
Every dimension below is either cited beside its constant or marked
`NOT SOURCED`. Source keys of the form `[NAME]` are `research/16-site-
archetypes.md` §G, which carries the full citation and URL; anything found
outside the repo carries its URL inline. `research/16` §A.6 is the archetype pack
for this site and marks its own claims [F] fact / [I] inference; those markers are
carried through.

Build — and this is the reproducible command:

    "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
      --python blender/sites/underground_drive.py

    ... append `-- --preview` to also render `shots/underground-drive-export*.png`
    from the REAL exported .glb (Cycles CPU). Those are OFFLINE BLENDER RENDERS
    with inspection lighting, never gameplay captures, and they say so.
"""

import importlib.util
import math
import os
import re
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


def _load_site_lib():
    """Load `blender/lib/site.py` BY PATH.

    `site` is a CPython standard-library module — it runs during interpreter
    start-up — so `sys.modules['site']` is already taken and a plain
    `import site` returns the stdlib one however `sys.path` is ordered. The
    failure is silent: the import succeeds and the first call dies with
    `AttributeError: module 'site' has no attribute 'reset'`. Same fix as
    `quarry_bench.py`, under a name nothing can collide with.
    """
    path = os.path.normpath(os.path.join(HERE, '..', 'lib', 'site.py'))
    spec = importlib.util.spec_from_file_location('drillity_site_ug', path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)
    return mod


S = _load_site_lib()

D2R = math.pi / 180.0


# ═════════════════════════════════════════════════════════════════════════════
# NUMBERS PARSED OUT OF THE GAME, NEVER COPIED INTO THIS FILE
#
# ASTRA.md §5: "two tables describing one thing will drift, and the one that is
# wrong will be believed." Every figure in this block belongs to a file this
# agent does not own, so it is read at build time and the build FAILS if it
# cannot be read. A hardcoded fallback would be the drift.
# ═════════════════════════════════════════════════════════════════════════════

def _read(rel):
    with open(os.path.join(ROOT, rel), 'r', encoding='utf-8') as fh:
        return fh.read()


def parse_drive_yaw():
    """`DRIVE_YAW` from `src/core/env.js`.

    The single rotation `terrain.js` puts on `driveGroup` to lay the tube on the
    hero camera's bearing, and the rotation this file bakes into the export so
    the model lands in the world frame `attachSiteModel()` attaches in. If env.js
    retunes it, a rebuild fixes this model; a copy here would not.
    """
    src = _read('src/core/env.js')
    m = re.search(r'export\s+const\s+DRIVE_YAW\s*=\s*([0-9.]+)\s*;', src)
    if not m:
        raise AssertionError(
            'underground_drive: could not find `export const DRIVE_YAW` in '
            'src/core/env.js. That file is another agent\'s — FIX THIS PARSER, '
            'do not hardcode the angle: a stale yaw puts this whole model 42 '
            'degrees across the drive and nothing would say so.')
    return float(m.group(1))


def parse_underground():
    """Every `UNDERGROUND` room, from `src/core/env.js`.

    Returns {id: {width, height, wallH, ...}}. The smallest of them is the
    envelope this model must fit inside, and it must not be a number typed here:
    `env.js` has already grown an entry once (the raise-bore chamber was added
    after the machine had shipped).
    """
    src = _read('src/core/env.js')
    start = src.find('export const UNDERGROUND = {')
    if start < 0:
        raise AssertionError(
            'underground_drive: `export const UNDERGROUND = {` is not in '
            'src/core/env.js. Fix this parser rather than typing the drive '
            'dimensions in here.')
    body = src[start:]
    out = {}
    ids = [(m.start(), m.group(1)) for m in re.finditer(r"id:\s*'([a-z-]+)'", body)]
    for k, (pos, mid) in enumerate(ids):
        end = ids[k + 1][0] if k + 1 < len(ids) else pos + 4000
        chunk = body[pos:end]
        fields = {}
        for key in ('width', 'height', 'wallH', 'faceZ', 'backZ'):
            m = re.search(key + r':\s*(-?[0-9.]+)', chunk)
            if m:
                fields[key] = float(m.group(1))
        if {'width', 'height', 'wallH'} <= set(fields):
            out[mid] = fields
    if len(out) < 4:
        raise AssertionError(
            'underground_drive: parsed only %d UNDERGROUND entries out of '
            'env.js. A gate that measures nothing must fail, not pass '
            '(ASTRA §10).' % len(out))
    return out


def parse_hero_eye():
    """`CAMERA_MODES.hero` from `src/core/renderer.js`, converted to drive-local.

    `renderer.js` owns the camera. `env.js` states the consequence — "the player
    then stands INSIDE the tube at drive-local (-1.15, 2.25, 13.75)" — and this
    reproduces that arithmetic from the live numbers instead of trusting the
    comment, so if the shot moves, this model's composition gate moves with it.
    """
    src = _read('src/core/renderer.js')
    m = re.search(r'hero:\s*\{\s*pos:\s*\[([^\]]+)\]\s*,\s*look:\s*\[([^\]]+)\]', src)
    if not m:
        raise AssertionError(
            'underground_drive: could not read CAMERA_MODES.hero out of '
            'src/core/renderer.js. Fix this parser; do not hardcode the eye.')
    pos = [float(v) for v in m.group(1).split(',')]
    look = [float(v) for v in m.group(2).split(',')]
    c, s = math.cos(DRIVE_YAW), math.sin(DRIVE_YAW)
    # world -> drive-local is a rotation about three.js +Y by -DRIVE_YAW
    return ((pos[0] * c - pos[2] * s, pos[1], pos[0] * s + pos[2] * c),
            (look[0] * c - look[2] * s, look[1], look[0] * s + look[2] * c))


def parse_item_mm(item_id, pattern, n=1):
    """A dimension out of a `src/game/data.js` item's own NAME.

    THE CONSUMABLES IN THIS DRIVE ARE THE ITEMS THE PLAYER BUYS, and that is a
    contract worth keeping honest rather than a coincidence. `data.js` is THE
    CONTENT AUTHORITY (ASTRA §11); a mesh sheet modelled at 3.0 x 2.4 m beside a
    shop card selling a 2.4 x 1.2 m sheet is exactly the drift ASTRA §5 is about,
    and it is the kind a driller notices instantly.

    So the sizes are read out of the item names. If somebody renames an item this
    build FAILS rather than shipping a stale figure, which is the behaviour that
    is wanted.
    """
    src = _read('src/game/data.js')
    m = re.search(r"id:\s*'%s'\s*,\s*name:\s*'([^']+)'" % re.escape(item_id), src)
    if not m:
        raise AssertionError(
            'underground_drive: item "%s" is not in src/game/data.js. This '
            'model stages the consumables the player buys; if the item is gone '
            'the geometry that depicts it is wrong. Fix the reference, do not '
            'hardcode a size.' % item_id)
    name = m.group(1)
    got = re.search(pattern, name)
    if not got or len(got.groups()) < n:
        raise AssertionError(
            'underground_drive: could not read the dimension out of "%s" '
            '(item %s) with %r. Fix this parser.' % (name, item_id, pattern))
    return [float(g) for g in got.groups()]


DRIVE_YAW = parse_drive_yaw()
UNDER = parse_underground()
EYE, LOOK = parse_hero_eye()

# The smallest room of the four. Everything this file builds fits inside it, so
# nothing is ever buried in rock in the other three.
SMALL_ID = min(UNDER, key=lambda k: UNDER[k]['width'] * UNDER[k]['height'])
SMALL = UNDER[SMALL_ID]


# ═════════════════════════════════════════════════════════════════════════════
# THE HERO FRAME
#
# MEASURED — BUT NOT BY ME, AND THAT IS DECLARED.
#
# These three coefficients were measured by `blender/sites/quarry_bench.py` on
# 2026-09-05, on the live hero camera, by projecting probe points through
# `ctx.camera` and bisecting for the NDC edges, with the probe held until the
# ground mesh and the archetype both agreed the site was really up. That file
# records why it had to be measured twice: `renderer.js` DECLARES `fov: 34` and
# the live hero camera is fov 20.97 / aspect 1.724, and an earlier probe read the
# BOOT camera (fov 34.04 / aspect 1.042) because the boot screen is a ~28 s
# shader compile rather than a splash.
#
#     half_width(d) = 0.4023 * d
#     top(d)        = 2.25 + 0.2065 * d
#     bottom(d)     = 2.25 - 0.1638 * d
#
# **I HAVE NOT RE-MEASURED THEM UNDERGROUND.** The shared headed-Chrome/GPU lease
# is held by another agent, so this model is composed against the surface band's
# measurement of the same camera in the same band. The vertical pair is
# independently reproducible from the stated fov and eye height to within 1 %
# (2.25 + 0.2088 d / 2.25 - 0.1613 d), which is a cross-check, not a measurement;
# the horizontal 0.4023 is NOT reproducible from fov and aspect (they give
# 0.3190) and rests on quarry_bench's authority alone. If the underground frame
# differs, this model is mis-composed and the gate below is grading against the
# wrong numbers — that is the first thing to re-measure with a GPU lease.
# ═════════════════════════════════════════════════════════════════════════════
HALF_W_K = 0.4023        # metres of half-frame-width per metre out
TOP_K = 0.2065           # metres of frame above eye level, per metre out
BOT_K = 0.1638           # metres below

EYE_X, EYE_Y, EYE_Z = EYE          # drive-local; ~(-1.142, 2.250, 13.748)

# The NDC column the work occupies and this model may not enter. DERIVED: the
# collar sits at drive-local (0, 0, 0), and projecting a 1.2 m half-width column
# around it puts its left edge at NDC x ~ -0.012. -0.16 leaves about a tenth of
# the frame's half-width of clear air beside the work before this model starts.
KEEP_NDC_X = -0.16


def dist_at(z):
    """Metres ahead of the eye. The drive axis IS the view axis — that is the
    whole reason `DRIVE_YAW` exists — so plan distance is just the z offset."""
    return EYE_Z - z


def half_width(z):
    return HALF_W_K * dist_at(z)


def ndc_x(x, z):
    d = dist_at(z)
    if d <= 0.05:
        return -9.9                       # behind the eye: never in frame
    return (x - EYE_X) / (HALF_W_K * d)


def ndc_y(y, z):
    d = dist_at(z)
    if d <= 0.05:
        return -9.9
    top = EYE_Y + TOP_K * d
    bot = EYE_Y - BOT_K * d
    return 2.0 * (y - bot) / (top - bot) - 1.0


def x_limit(z):
    """The inboard (screen-right) limit of the laydown at chainage `z`.

    Everything this model builds stays LEFT of the NDC column the machine and the
    collar occupy — see THE ENCLOSURE PROBLEM, rule 2. Converting `KEEP_NDC_X`
    back to a drive-local x at this chainage is what gives the laydown its wedge
    shape, and the wedge is simply perspective: the strip is 0.55 m of world at
    the far end and 0.99 m at the near one, and it is the same strip.
    """
    # Clamped at the eye: past it nothing is in frame at all, so the column
    # this model must stay out of simply stops existing.
    return EYE_X + KEEP_NDC_X * HALF_W_K * max(0.0, dist_at(z))


# ═════════════════════════════════════════════════════════════════════════════
# THE MACHINE KEEP-CLEAR — MEASURED, AND THE MEASUREMENT IS REPRODUCIBLE
#
# Every vertex of the four shipped underground machines, transformed by its
# node's world matrix and rotated into drive-local by -DRIVE_YAW, binned by whole
# metres of z. The parser and the every-vertex walk are `tools/glbinfo.mjs`'s own
# (ASTRA §5: ONE ruler) — the only thing added is the rotation, and the unrotated
# case reproduces `glbinfo`'s printed DIMENSIONS for all four files to the
# millimetre, while the rotated raise-bore case reproduces the figures
# `src/core/env.js` publishes for it (lx -5.554..5.524, lz -5.681..5.691)
# exactly. Two independent agreements before any number here was used.
#
# What matters for this file is the LAST COLUMN: the greatest z any of the four
# machines reaches while inside the |x| <= 2.4 strip this model occupies.
#
#     machine        overall drive-local z    max z within |x| <= 2.4
#     tunnel-jumbo     -5.789 .. +6.316               +4.0
#     bolter           -5.136 .. +3.143               +4.0
#     longhole-rig     -3.345 .. +3.661               +4.0
#     raisebore        -5.681 .. +5.691               +6.0
#
# (The jumbo's +6.316 is trailing structure out at x -5.87..-3.98, outside this
# strip; the raise borer's +5.691 IS inside it, which is why the limit is +6.0
# and not +4.0.)
#
# These are REST-POSE exports. The game articulates booms, so a working machine
# reaches further UP and further FORWARD — toward the face, away from this model.
# It does not grow backwards past its own rear frame, which is the direction that
# matters here.
# ═════════════════════════════════════════════════════════════════════════════
MACHINE_MAX_Z = 6.0        # measured, above
Z_NEAR = 6.60              # this model starts here: 0.60 m of clearance
# ... and runs BACK PAST the eye at z = 13.748. Deliberate: the hero camera
# cannot see z > 13.75 at all, but renderer.js's orbit and menu modes leave the
# tube at radius 13-16.6 m and do see it (terrain.js's `rock-mass` box exists
# for exactly that reason), and a trailing cable that stops dead a metre short
# of the player is a cable going nowhere. `gates()` does not count vertices
# behind the eye as in-frame, so this cannot be used to satisfy that gate.
Z_FAR = 14.85

# The collar keep-clear. `terrain.js` puts the collar at (0, 0, 0) and the
# section band's seam is solved on it. `urban_plot.py` uses the same device with
# a 7.0 m radius; underground the machine itself already stands closer than that,
# so the test that carries the weight here is the chainage one above and this is
# belt and braces.
COLLAR_R = 6.0             # NOT SOURCED — a keep-clear, not a site dimension


# ═════════════════════════════════════════════════════════════════════════════
# THE DRIVE ENVELOPE — the profile every vertex must stay inside
#
# `terrain.js` `drivePerimeter()` builds a horseshoe: vertical ribs to the
# springing line at `wallH`, a half-ellipse of semi-axes (width/2, height-wallH)
# over them, and an invert dished by 0.10 m. This reproduces that shape for the
# SMALLEST of the four rooms and shrinks it by PROFILE_CLEARANCE.
#
# Why 0.35 m of clearance and not 0.05: the excavated surface is not the nominal
# profile. `overbreak()` in terrain.js displaces the shell along its own normal
# by two fbm terms of +-0.23 and +-0.07 m, which can come INWARD as easily as
# outward; the shotcrete lining then sits a further 0.075 m inside the excavated
# line with its own +-0.045 m. Worst case the rock is 0.30 m inboard of nominal
# and the lining 0.42 m. 0.35 m keeps this model clear of the ROCK everywhere and
# accepts that a lining lobe can occasionally close on it — which is what a
# lining does to a stillage stood against a rib.
#
# The physical cause is sourced even though the amplitude is terrain.js's:
# look-out makes the excavation bigger than the design profile every round, and
# [NFF26] measures it on a real project — theoretical section 63.12 m2, 68.43 m2
# at collaring, 85.03 m2 at hole bottoms.
# ═════════════════════════════════════════════════════════════════════════════
PROFILE_CLEARANCE = 0.35


def profile_slack(x, y, u=None, clearance=PROFILE_CLEARANCE):
    """Signed metres of clearance from (x, y) to the drive's rock. Negative means
    outside, so the gate can report HOW FAR out an offending vertex is rather
    than only that it is."""
    u = u or SMALL
    w = u['width'] * 0.5 - clearance
    wall = u['wallH']
    rise = (u['height'] - u['wallH']) - clearance
    if y < -1e-6:
        return y                          # nothing here goes below the invert
    if y <= wall:
        return w - abs(x)
    if rise <= 0 or w <= 0:
        return -1.0
    r = math.hypot(x / w, (y - wall) / rise)
    return (1.0 - r) * min(w, rise)


# ═════════════════════════════════════════════════════════════════════════════
# MATERIALS — FOUR. See MATERIALS in the docstring for why not six.
# ═════════════════════════════════════════════════════════════════════════════
STEEL = S.MAT_STEEL         # 'rawSteel'     — frames, skids, bolts, plates, bar
DARK = S.MAT_DARK           # 'paintedDark'  — boards, bins, pallets, posts
RUBBER = S.MAT_RUBBER       # 'rubber'       — trailing cables, coiled duct
HAZARD = S.MAT_HAZARD       # 'safetyStripe' — retroreflective banding, panel


# ═════════════════════════════════════════════════════════════════════════════
# THE CONSUMABLES — the sourced part of this site, and it is sourced twice
#
# Once against `src/game/data.js`, which is what the player buys, and once
# against the ground-support literature, which is where data.js got it.
#
#   [HOEK-SUEHR]    Hoek, Kaiser & Bawden, *Support of Underground Excavations
#       in Hard Rock*, full text —
#       https://mirarco.org/wp-content/uploads/Books/Support_of_Underground_Excavations_in_Hard_Rock.pdf
#       Table 12.1, after the Split Set Division of Ingersoll-Rand, is the
#       friction-bolt table and it is the one that matters here:
#         tube 33 mm -> recommended nominal bit 31-33 mm, tube lengths 0.9-2.4 m
#         tube 39 mm -> bit 35-38 mm, lengths 0.9-3.0 m, plate 150x150 / 125x125
#         tube 46 mm -> bit 41-45 mm, lengths 0.9-3.6 m, plate 150x150
#       with the mechanism stated: "It is installed by PUSHING IT INTO A SLIGHTLY
#       UNDERSIZED HOLE and the radial spring force generated, by the compression
#       of the C shaped tube, provides the frictional anchorage along the entire
#       length of the hole."  THE HOLE IS ALWAYS SMALLER THAN THE TUBE.
#       Also Lang's rule for a bolt pattern (L >= 2S, S <= 4B) and Barton's
#       L = 2 + 0.15 B / ESR, neither of which this file needs but both of which
#       are why terrain.js's 1.5 m plate pattern is in the right country.
#   [HOEK-SUPPORT]  Hoek, *Support in Underground Hard Rock Mines* —
#       https://www.rocscience.com/assets/resources/learning/hoek/1987-Support-in-Underground-Hard-Rock-Mines.pdf
#       Via research/16 §A.6. Same bolt/hole rule, plus the practice note that
#       split sets are chosen in rockburst ground "because they will slip under
#       shock loading but will retain some load and KEEP MESH IN PLACE" — which
#       is why the two objects are staged together in this drive.
#   [VILLAESCUSA13] Villaescusa, Thompson & Player, "Removing rockbolting as a
#       cause of fatalities in Australian mining", Ground Support 2013, ACG —
#       https://papers.acg.uwa.edu.au/p/1304_11_Villaescusa/
#       THE MESH SPECIFICATION: "The most common configuration consists of
#       5.6 mm diameter wires spaced at 100 mm centres." and "Sheets are
#       generally 2.4 m wide, the maximum that may be specified, with variable
#       lengths, commonly 3.6 m and up to 6 m. Larger sheets generally cause
#       handling and placement problems."
#   [ARANZAZU]      Aura Minerals / SLR, *NI 43-101 Technical Report, Aranzazu
#       Mine*, 28 Mar 2025 — https://minedocs.com/28/Aranzazu-TR-03282025.pdf
#       §16.5: "Haulage galleries are designed at 4.5 m high by 4.5 m wide TO
#       ACCOMMODATE THE INSTALLATION OF MINE SERVICES and to provide effective
#       clearance for mobile equipment." Table 16-4, ground support by class:
#       bolt length CONSTANT at 2.4 m across every class, pattern tightening
#       1.8 x 1.8 -> 1.5 x 1.5 -> 1.2 x 1.2 -> 1.0 x 1.0 m, with electro-welded
#       mesh from class 5 down and 50 -> 75-100 mm fibre shotcrete from class 4.
#       This is the sourced tie between the size of the room and the stuff that
#       has to fit in it, and it is why a 4.5-5.5 m drive is the right room for
#       this laydown.
#   [ISLANDGOLD]    Alamos Gold, *Island Gold Mine NI 43-101 Technical Report*,
#       31 Aug 2020 —
#       https://s24.q4cdn.com/779615370/files/doc_downloads/island_reports/08/IG-Phase-III-Technical-Report-Final.pdf
#       Table 16-1 "Standard Excavation Dimensions": jumbo sill 4.0 x 4.0 m,
#       jumbo ramp 4.75 x 4.75 m (arched), level entrance 5.5 x 5.5 m, muck and
#       remuck bays 5.0 W x 4.5-6.5 H x 13.5 m L. Also the services: one 8 in
#       air line down the ramp "stepping down to 6 in lines" on the levels, and
#       a 16-channel leaky feeder for communications.
#   [NFF26]         Norwegian Tunnelling Society Publication 26 —
#       https://tunnel.no/wp-content/uploads/sites/3/2020/04/Publication-26.pdf
#       Support quantities a heading is contracted on: shotcrete 80 mm in good
#       ground to 150 mm plus reinforced arches in very poor; bolts c/c 2.5 x
#       2.5 m in good ground tightening to 1.3 x 1.3 m; MANUAL SCALING 1 h/h;
#       bolts to 5 m at 12/hr; look-out taking a 63.12 m2 theoretical section to
#       85.03 m2 at hole bottoms. (Via research/16 §A.6.)
#   [VERTEX]        A real small gold mine's development, via research/16 §A.6:
#       the services a drive carries are "11 kV power cable, water line, air
#       line".
#   [HURTADO17]     San Martin / Hurtado et al., "Rapid selection strategies for
#       tunnel development auxiliary ventilation systems", Underground Mining
#       Technology 2017, ACG — https://papers.acg.uwa.edu.au/p/1710_14_Hurtado/
#       Duct diameter in a development heading, from the figure captions:
#       "Duo duct with 1 m diameter and drift cross-section of 4.5 x 4.5 m" and
#       "Simple duct with 1 m diameter and drift cross-section of 5.5 x 5.5 m".
#       And the clearance rule this laydown is laid out against: "the MINIMUM
#       SAFETY DISTANCE OF 0.5 m BETWEEN EQUIPMENT AND PIPELINE is respected,
#       and is required to avoid equipment movement damaging the duct."
#   [WP-VENT] [MINETEK] [PMC-DUCT]  research/16 §A.6: auxiliary ventilation uses
#       "temporarily mounted ventilation fans, Venturi tubes and disposable
#       fabric or steel ducting", serving "dead-end headings and active work
#       areas the primary circuit doesn't reach"; duct hung "on phi 8 mm steel
#       wire ropes, hooks welded to M12 expansion bolts at 5 m intervals".
# ═════════════════════════════════════════════════════════════════════════════

# Friction bolt. `data.js` `friction-bolt-39` is named "Split-Tube Friction Bolt,
# 39 mm x 2.4 m" and carries `bitTrialRangeMm: [35, 38.1]`. Both are read from
# that item, and BOTH ARE EXACTLY [HOEK-SUEHR] TABLE 12.1's 39 mm row: a 39 mm
# tube into a 35-38 mm hole. The game already had this right; this model matches
# the game rather than re-deriving it, so the pack in the drive and the shop card
# cannot drift apart.
BOLT_D_MM, BOLT_L_M = parse_item_mm(
    'friction-bolt-39', r'([0-9.]+)\s*mm\s*x\s*([0-9.]+)\s*m', 2)
BOLT_D = BOLT_D_MM / 1000.0
BOLT_L = BOLT_L_M

# Welded mesh sheet. `data.js` `mesh-2400`, "Weldmesh Sheet, 2.4 x 1.2 m" — read
# from that name because data.js is THE CONTENT AUTHORITY (ASTRA §11) and a sheet
# in the drive that is not the sheet on the shop card is the drift this pipeline
# exists to stop.
#
# **AND THERE IS A DISCREPANCY WORTH RECORDING RATHER THAN QUIETLY FIXING.**
# [VILLAESCUSA13] measures the population: "Sheets are generally 2.4 m WIDE, the
# maximum that may be specified, with variable LENGTHS, commonly 3.6 m and up to
# 6 m." So the published common sheet is 2.4 x 3.6 m and the game's is
# 2.4 x 1.2 m. Both are real objects — a 2.4 x 1.2 m sheet is the hand-portable
# size and the jumbo-handled 3.6 m one is not — so this is a content question for
# whoever owns `data.js`, not something a Blender module may decide. It is
# reported in `research/sites/underground-drive.md` and the geometry here follows
# data.js.
#
# The WIRE is not in dispute: [VILLAESCUSA13] gives 5.6 mm wire at 100 mm
# centres and `terrain.js` `texWeldMesh()` already draws "100 x 100 mm aperture
# on 5.5 mm wire".
MESH_L, MESH_W = parse_item_mm('mesh-2400', r'([0-9.]+)\s*x\s*([0-9.]+)\s*m', 2)
MESH_WIRE_D = 0.0056       # [VILLAESCUSA13]
MESH_APERTURE = 0.100      # [VILLAESCUSA13]

# Dished bolt plate. `data.js` `bolt-plate-150`, "Dished Bolt Plate, 150 mm", and
# [HOEK-SUEHR] Table 12.1 lists "150 x 150 / 125 x 125 mm" plates against the
# 39 mm tube — so the game's 150 mm is the sourced size for this bolt. The item's
# own copy is worth having in the model: "The dish flattens as the plate takes
# load, so a driller walking past can see which bolts are working." So the plates
# in the basket are DISHED, not flat washers.
PLATE_MM = parse_item_mm('bolt-plate-150', r'([0-9.]+)\s*mm', 1)[0]
PLATE = PLATE_MM / 1000.0

# THE MESH IS NOT DRAWN AS MESH, AND THAT IS A MEASUREMENT, NOT LAZINESS.
# A 5.6 mm wire at the 5-7 m this pack stands from the eye is sub-pixel: the
# frame is ~4.6 m wide across a ~744 px band at that range, i.e. 6.2 mm per
# pixel, so one wire is under a pixel. quarry_bench.py recorded the same finding
# twice (a 90 mm belt skirting at 56 m, a 90 mm walkway plate at 62 m): detail
# below the resolution of the shot does not read as detail, it reads as noise,
# and it costs triangles to produce the noise. A strapped pack of sheets is a
# solid slab anyway — that is what a pack looks like — so it is drawn as one,
# with the top few sheet edges separated where they genuinely are a centimetre
# apart and genuinely visible. `assets.js` owns the surface: the pack carries the
# `rawSteel` NAME and the wear system decides what it looks like.
# NOT SOURCED — the thickness of a delivered, strapped pack. At the ~11 mm a
# 5.6 mm-wire sheet nests to, 0.40 m is on the order of forty sheets, which is a
# pallet-load rather than an armful. The first build set this at 0.30 and put a
# top rail across the stillage, and THE RENDER SAID NO: the pack disappeared
# behind its own frame and the whole laydown came back reading as a picket
# fence, which is a surface object and the single worst thing this model could
# look like (see WHY THIS IS UNDERGROUND). The frame lost the rail and the pack
# got the width.
MESH_PACK_T = 0.40


# ═════════════════════════════════════════════════════════════════════════════
# PLACEMENT
# ═════════════════════════════════════════════════════════════════════════════

RIB_X = -(SMALL['width'] * 0.5 - PROFILE_CLEARANCE)     # -2.15 at width 5.0

# A hair of daylight between the kit and the profile-clearance line, so a skid
# runner that lands exactly ON the boundary is not decided by float error.
RIB_INSET = 0.02

# THE DELINEATORS GO IN THE GAPS BETWEEN THE KIT, NOT INBOARD OF IT, and that is
# forced by arithmetic rather than chosen. The strip is 0.55 m wide at its far
# end; a marker line inboard of the kit would take a third of that and leave
# nothing to stack on. Along the drive there is room for free, so the markers sit
# in the gaps between stillages — which is also where a crew puts them, because a
# marker is there to say WHERE THE STACK ENDS.
#
# The only published clearance figure this research reached for a drive is
# [HURTADO17]'s "minimum safety distance of 0.5 m between equipment and
# pipeline… required to avoid equipment movement damaging the duct". That is
# about a hung vent duct rather than stacked material and IS NOT QUOTED HERE AS A
# RULE FOR A LAYDOWN; it is recorded because it is the nearest sourced number and
# because this strip could not honour it anyway. NOT SOURCED: any clearance a
# laydown is actually required to keep from a traffic lane.


def fit(z0, want_w, overhang=0.0):
    """Centre-x and width for an object standing at the outboard edge of the
    laydown at chainage `z0`.

    `z0` is the FAR (face-side) end of the object, because that is where the
    strip is narrowest — the wedge closes toward the face, and an object solved
    at its near end pokes out of the frame at its far one.

    `overhang` is how far the object's WIDEST part reaches beyond `w` on each
    side: the skid runners under a distribution board, the feet under a bin, the
    door furniture on the outboard face. Declaring it here rather than fudging
    `want_w` at the call site is what stops the profile and NDC gates from having
    to be relaxed later.
    """
    xo = RIB_X + RIB_INSET
    xi = x_limit(z0)
    w = min(want_w, (xi - xo) - 2.0 * overhang)
    if w <= 0.05:
        raise AssertionError(
            'underground_drive: no laydown strip left at z=%.2f (outboard %.3f, '
            'NDC limit %.3f, overhang %.3f). The composition does not fit; '
            're-solve it rather than shrinking the keep-clear.'
            % (z0, xo, xi, overhang))
    return xo + overhang + w * 0.5, w


# ── THE ONE COORDINATE CONVERSION, IN ONE PLACE ──────────────────────────────
# This module reasons in DRIVE-LOCAL metres the way `env.js` and `terrain.js`
# write them — (x across, y up, z back down the drive toward the player) — because
# every number it has to agree with (the room, the machine envelopes, the camera)
# is written that way. Blender is Z-up and exports `export_yup=True`, mapping
# Blender (bx, by, bz) -> glTF (bx, bz, -by). So:
#
#     drive-local (x, y, z)  ==  Blender (x, -z, y)
#
# THE SIGN IS THE WHOLE POINT AND IT IS EASY TO LOSE. Blender +Y is INTO THE
# FACE; this model lives BEHIND the machine, on the player's side, at drive-local
# z = +6.6 .. +13.55, which is Blender y = -6.6 .. -13.55. The first build of
# this file placed everything at +Y — the far side of the face — and the profile
# gate caught it as a 9.1 m excursion, which is what the gate is for. There is
# exactly ONE conversion, here, and no builder below writes a Blender coordinate.
def B(p):
    """drive-local (x across, z chainage, y height) -> Blender (x, y, z).

    Note the ARGUMENT order: this module writes a position as
    (across, chainage, height) because that is how a laydown is described — how
    far off the rib, how far down the drive, how tall.
    """
    return (p[0], -p[1], p[2])


def slab(name, size, centre, mat, rot=(0, 0, 0), bevel=0.0):
    """A box. `size` is (across, along the drive, up) — which is Blender's own
    (x, y, z) for an unrotated box, so it needs no conversion; only the position
    does."""
    return S.box(name, size, mat, loc=B(centre), rot=rot, bevel=bevel)


def rod(name, radius, length, centre, mat, rot=(0, 0, 0), sides=8):
    """A cylinder standing on its base at `centre`, in drive-local metres."""
    return S.tube(name, radius, length, mat, loc=B(centre), rot=rot, sides=sides)


def cable(name, pts, radius, mat, sides=6):
    """A draped hose or cable through drive-local points."""
    return S.hose(name, [B(p) for p in pts], radius=radius, mat=mat, sides=sides)


# ═════════════════════════════════════════════════════════════════════════════
# 1. THE MESH STILLAGES — the biggest silhouette in the model
# ═════════════════════════════════════════════════════════════════════════════

def build_mesh_stillage(tag, z0, z1):
    """A pack of weldmesh sheets stood on edge in a steel stillage.

    `research/03` §A.4-7, quoted in terrain.js's own comment: *"Bolts hold the
    big blocks; mesh and shotcrete hold the small ones between the bolts"*, and
    the bolter operator's job list ends *"...plate it, tension it, SHEET THE
    MESH, repeat on the pattern"*. `data.js`'s own item copy says it harder: *"The
    second job is the one that hits people, so the mesh goes up with the round,
    not after it."*

    STOOD ON THE SHORT EDGE, which is a composition decision as much as a
    handling one and is marked as such. A 2.4 x 1.2 m sheet stacked flat is a
    0.5 m heap, and the hero frame does not reach below 1.10 m at this chainage —
    a flat stack would be a pack of mesh nobody ever sees. Stood on its 1.2 m
    edge it is a 2.4 m plane presented edge-on to the camera: the strongest
    vertical in the model, the object that makes the near field read as a laydown
    rather than as clutter, and — per the cave-photography note in the header —
    the known-size object that tells the eye how big the drive is.
    NOT SOURCED: that mesh is stored on edge. It is how it is racked and carried,
    and it is marked.
    """
    # No overhang: the skids are the width of the frame, so the whole strip goes
    # into the pack rather than into the thing holding it.
    cx, w = fit(z0, MESH_PACK_T + 0.10)
    cz = (z0 + z1) * 0.5
    dz = z1 - z0
    pack_t = max(0.10, w - 0.10)
    top = 0.14 + MESH_L

    # the stillage: two skids under it, four uprights, a rail across the top
    for z in (z0 + 0.16, z1 - 0.16):
        slab('%s-skid-%.2f' % (tag, z), (w, 0.14, 0.14), (cx, z, 0.07),
             STEEL, bevel=0.012)
        for sx in (-1, 1):
            rod('%s-post-%d-%.2f' % (tag, sx, z), 0.028, MESH_L + 0.10,
                (cx + sx * (w * 0.5 - 0.028), z, 0.14), STEEL, sides=6)
        # Retroreflective banding at eye height on the corner posts. This is the
        # ONE piece of hazard marking that lands inside the hero frame — the
        # delineators on the floor are below its bottom edge everywhere in this
        # window — and a wrap of reflective tape on the corner of a stillage is
        # where it goes in a drive, because that corner is what a machine hits.
        for sx in (-1, 1):
            rod('%s-band-%d-%.2f' % (tag, sx, z), 0.042, 0.11,
                (cx + sx * (w * 0.5 - 0.028), z, 1.72), HAZARD, sides=8)

    # the pack: a solid core with the outer sheets separated. One material, so
    # the whole thing is part of one draw call however many layers it gets.
    layers = 5
    core_t = max(0.04, pack_t - layers * 0.024)
    void_ = None; del void_
    slab('%s-core' % tag, (core_t, dz - 0.06, MESH_L),
         (cx + (pack_t - core_t) * 0.5, cz, 0.14 + MESH_L * 0.5), STEEL, bevel=0.004)
    for i in range(layers):
        slab('%s-sheet-%d' % (tag, i),
             (0.016, dz - 0.06 - i * 0.010, MESH_L - i * 0.012),
             (cx - pack_t * 0.5 + 0.008 + i * 0.024, cz,
              0.14 + (MESH_L - i * 0.012) * 0.5),
             STEEL)
    # steel banding round the pack — what stops it fanning out on a forklift
    for z in (cz - dz * 0.28, cz + dz * 0.28):
        slab('%s-strap-%.2f' % (tag, z), (pack_t + 0.03, 0.024, MESH_L + 0.03),
             (cx, z, 0.14 + MESH_L * 0.5), DARK)


# ═════════════════════════════════════════════════════════════════════════════
# 2. THE SCRAP BIN — the object that says this laydown is worked out of
# ═════════════════════════════════════════════════════════════════════════════

def build_scrap_bin(z0, z1):
    """An open steel bin of offcuts: cropped bolt ends, bent plates, the banding
    cut off the mesh packs.

    It is here for one reason and it is worth stating: a clean site reads as a
    set. The production note from a slasher shot in a working colliery is the
    cleanest statement of it — the town cleaned the mine up for the crew, the
    director said it then looked like Disneyland, and they had to spend money
    re-dirtying it. All dimensions NOT SOURCED.
    """
    cx, w = fit(z0, 0.62, overhang=0.05)     # the feet run 0.09 m wider
    cz = (z0 + z1) * 0.5
    dz = z1 - z0
    h = 0.72                                    # NOT SOURCED

    slab('bin-floor', (w, dz, 0.06), (cx, cz, 0.14), DARK, bevel=0.008)
    for sx in (-1, 1):
        slab('bin-side-%d' % sx, (0.045, dz, h),
             (cx + sx * (w * 0.5 - 0.022), cz, 0.14 + h * 0.5), DARK, bevel=0.008)
    for sz in (z0 + 0.022, z1 - 0.022):
        slab('bin-end-%.2f' % sz, (w, 0.045, h), (cx, sz, 0.14 + h * 0.5),
             DARK, bevel=0.008)
    for sz in (z0 + 0.12, z1 - 0.12):
        slab('bin-foot-%.2f' % sz, (w + 0.09, 0.11, 0.14), (cx, sz, 0.07),
             STEEL, bevel=0.012)
    # Cropped ends, and they STAY IN THE BIN. The first render had 0.54 m
    # offcuts laid flat in a 0.62 x 0.65 m bin and several of them came through
    # its side walls — the sort of thing that reads instantly as a model rather
    # than as a thing. Length and spread are both bounded by the bin now.
    for i in range(8):
        r1, r2 = S.rnd(i * 4.3, 41.0), S.rnd(i * 6.1, 47.0)
        ln = 0.14 + r1 * 0.16
        rod('bin-scrap-%d' % i, BOLT_D * 0.5, ln,
            (cx + (r1 - 0.5) * max(0.02, w - 0.20 - ln),
             cz + (r2 - 0.5) * max(0.02, dz - 0.20 - ln), 0.20 + r2 * 0.14),
            STEEL, rot=(math.pi * 0.42 + (r1 - 0.5) * 0.7, 0.0, r2 * 3.0), sides=6)


# ═════════════════════════════════════════════════════════════════════════════
# 3. THE BOLT BASKET — friction bolts, dished plates, the scaling bar
# ═════════════════════════════════════════════════════════════════════════════

def build_bolt_basket(z0, z1):
    """Split sets stood on end in a basket, with the plates beside them.

    The bolt and its hole are the one place `DOMAIN.md` §4 says a driller will
    check: *"a split-tube friction bolt has NO thread (the hole is drilled
    smaller than the bolt and the interference IS the anchorage)"*, and
    [HOEK-SUPPORT] gives the numbers — 33/39/46 mm tube into a 32/35/41 mm hole.
    So the bolts here are SLOTTED TUBES at the sourced 39 mm with the slot
    visible, and NOTHING ON THEM IS THREADED. Printing a rod thread on a friction
    bolt is the specific error `DOMAIN.md` §4 names.

    The basket, the lean of the bolts and how many are left in it are NOT SOURCED.
    """
    cx, w = fit(z0, 0.62, overhang=0.02)
    cz = (z0 + z1) * 0.5
    dz = z1 - z0

    slab('basket-floor', (w, dz, 0.09), (cx, cz, 0.045), STEEL, bevel=0.01)
    for sx in (-1, 1):
        slab('basket-side-%d' % sx, (0.045, dz, 0.50),
             (cx + sx * (w * 0.5 - 0.022), cz, 0.34), STEEL, bevel=0.008)
    for sz in (z0 + 0.022, z1 - 0.022):
        slab('basket-end-%.2f' % sz, (w, 0.045, 0.50), (cx, sz, 0.34),
             STEEL, bevel=0.008)

    # the bolts. A split set is a rolled tube with a longitudinal slot; at 39 mm
    # the slot reads at this range as a dark line down the tube, so it is drawn
    # as a strip rather than modelled through the wall.
    n = 11                                      # NOT SOURCED
    for i in range(n):
        r1, r2 = S.rnd(i * 3.1, 17.0), S.rnd(i * 5.7, 23.0)
        px = cx + (r1 - 0.5) * max(0.02, w - 0.30)
        pz = z0 + 0.14 + (i / max(1, n - 1)) * (dz - 0.28) + (r2 - 0.5) * 0.04
        # The lean is bounded, not free: a 2.4 m bolt leaning 0.075 rad walks
        # 0.18 m across the drive and the profile gate caught exactly that (a
        # 2 mm excursion past the rib clearance). 0.03 rad is 0.07 m over the
        # bolt and still reads as a basket somebody has been pulling out of.
        lx, lz = (r1 - 0.5) * 0.06, (r2 - 0.5) * 0.05
        rod('friction-bolt-%d' % i, BOLT_D * 0.5, BOLT_L, (px, pz, 0.09), STEEL,
            rot=(lz, lx, 0.0), sides=8)
        slab('bolt-slot-%d' % i, (BOLT_D * 0.32, 0.009, BOLT_L * 0.94),
             (px - BOLT_D * 0.40, pz, 0.09 + BOLT_L * 0.5), DARK, rot=(lz, lx, 0.0))

    # the dished plates, stacked in the end of the basket. The dish is the point:
    # data.js — "The dish flattens as the plate takes load, so a driller walking
    # past can see which bolts are working."
    for i in range(7):
        r = S.rnd(i * 2.3, 31.0)
        z = 0.09 + 0.012 + i * 0.026
        slab('bolt-plate-%d' % i, (PLATE, PLATE, 0.009),
             (cx + (S.rnd(i, 5.0) - 0.5) * 0.10, z1 - 0.20 + (r - 0.5) * 0.08, z),
             STEEL, rot=(0.0, 0.0, r * 1.4), bevel=0.010)
        rod('bolt-plate-dish-%d' % i, PLATE * 0.30, 0.016,
            (cx + (S.rnd(i, 5.0) - 0.5) * 0.10,
             z1 - 0.20 + (r - 0.5) * 0.08, z + 0.004), STEEL, sides=10)

    # the scaling bar, leaning on the basket. [NFF26] contracts "manual scaling
    # 1 h/h" as a real work item, so the tool that does it belongs in the drive.
    # Its length is NOT SOURCED.
    rod('scaling-bar', 0.016, 2.10, (cx + w * 0.5 - 0.03, z0 + 0.18, 0.02),
        STEEL, rot=(0.12, -0.26, 0.0), sides=6)


# ═════════════════════════════════════════════════════════════════════════════
# 4. THE POWER THE HEADING RUNS OFF
# ═════════════════════════════════════════════════════════════════════════════

def build_power(z0, z1):
    """A portable distribution board on a skid, and the trailing cable off it.

    [VERTEX] names the three services a drive carries: *"11 kV power cable, water
    line, air line"*. `terrain.js` already hangs the water and air lines and a
    cable on the OPPOSITE rib; what nothing in the drive has is the thing the
    machine actually plugs into, and a jumbo, a bolter and a longhole rig are all
    electro-hydraulic — they tram on diesel and they drill on a cable.

    Every dimension of the board and its skid is NOT SOURCED. [VERTEX] gives the
    11 kV cable and no hardware, and this file will not invent a switchgear
    rating or letter one onto anything.
    """
    # overhang 0.11: the skid runners run 0.20 m wider, and the door furniture
    # stands 0.062 m off the outboard face.
    cx, w = fit(z0, 0.72, overhang=0.11)
    cz = (z0 + z1) * 0.5
    dz = z1 - z0
    h = 1.34                                    # NOT SOURCED

    slab('dcb-skid', (w + 0.16, dz + 0.16, 0.14), (cx, cz, 0.07), STEEL, bevel=0.02)
    for sz in (z0 + 0.06, z1 - 0.06):
        slab('dcb-runner-%.2f' % sz, (w + 0.20, 0.10, 0.09), (cx, sz, 0.045),
             STEEL, bevel=0.012)
    slab('dcb-body', (w, dz - 0.08, h), (cx, cz, 0.14 + h * 0.5), DARK, bevel=0.016)
    slab('dcb-door', (0.028, dz - 0.26, h - 0.20),
         (cx - w * 0.5 - 0.010, cz, 0.14 + h * 0.5), DARK, bevel=0.008)
    rod('dcb-handle', 0.016, 0.22, (cx - w * 0.5 - 0.046, cz + 0.16, 0.14 + h * 0.42),
        STEEL, rot=(math.pi * 0.5, 0.0, 0.0), sides=6)
    # a retroreflective band across the front — see WHY THIS IS UNDERGROUND.
    slab('dcb-band', (0.011, dz - 0.16, 0.10),
         (cx - w * 0.5 - 0.022, cz, 0.14 + h - 0.22), HAZARD)
    slab('dcb-glands', (w * 0.66, 0.16, 0.11), (cx, z1 - 0.02, 0.22), STEEL, bevel=0.01)

    # THE TRAILING CABLE. It leaves the board and runs BACK down the drive toward
    # the substation and past the player — not forward to the machine. Forward is
    # where the muck and the round are; a cable is kept out of it, and a cable
    # drawn running under a machine that is standing on it is a mistake a driller
    # sees immediately.
    cable('trailing-cable',
          [(cx, z1 + 0.06, 0.24),
           (cx - 0.09, z1 + 0.45, 0.07),
           (cx + 0.05, z1 + 0.95, 0.05),
           (cx - 0.04, Z_FAR - 0.05, 0.05)], 0.026, RUBBER)
    cable('trailing-cable-2',
          [(cx + 0.14, z1 + 0.04, 0.21),
           (cx + 0.19, z1 + 0.60, 0.06),
           (cx + 0.24, Z_FAR - 0.25, 0.04)], 0.017, RUBBER)


# ═════════════════════════════════════════════════════════════════════════════
# 5. VENTILATION — the spare, not the duct
# ═════════════════════════════════════════════════════════════════════════════

def build_vent_spare(z0):
    """A roll of spare lay-flat ducting on a pallet, and its hanging rope.

    [WP-VENT]: auxiliary ventilation branches off the primary circuit using
    *"temporarily mounted ventilation fans, Venturi tubes and disposable fabric
    or steel ducting"*, and exists specifically to serve *"dead-end headings and
    active work areas the primary circuit doesn't reach"* [MINETEK]. The duct
    outlet has to be kept close behind the face, so the duct is EXTENDED every
    few rounds and the spare travels with the heading — which is why a roll of it
    is standing in the drive rather than in a store.

    The duct itself is `terrain.js`'s and it is per-method (`u.vent.r`, `.x`, `.y`
    all differ), so this model must not draw one: it would be at the wrong
    diameter and the wrong height in three drives out of four. It draws the
    SPARE, which is section-independent because it is on the floor, and the coil
    of phi 8 mm hanging rope that goes up with it — the rope size is [PMC-DUCT]'s
    ("duct run along the vault centreline on phi 8 mm steel wire ropes, hooks
    welded to M12 expansion bolts at 5 m intervals").

    A note for whoever reads this next, because it is a nice confirmation rather
    than a defect: [HURTADO17] gives "Duo duct with 1 m diameter and drift
    cross-section of 4.5 x 4.5 m" and "Simple duct with 1 m diameter and drift
    cross-section of 5.5 x 5.5 m", and `env.js` already hangs `vent.r = 0.50` —
    a 1.0 m duct — in its 5.0 m longhole drive. The procedural duct is the
    published size. This roll is drawn at a smaller diameter than the hung duct
    on purpose: a roll of lay-flat is the FLATTENED bag wound on a core, not the
    inflated tube.

    NOT SOURCED: the roll's diameter, the pallet, how much duct is on it. Also
    NOT SOURCED and deliberately not asserted: the duct's COLOUR. Lay-flat duct
    is really made in orange, yellow, white, black, blue and silver, and at least
    one manufacturer codes the colour to DIAMETER rather than duty
    (https://www.ducting.com/mine-ventilation/,
    https://www.plascorp.com.au/products/underground-mine-ventilation/), so
    "vent duct is yellow" is not a fact. The roll here carries a material NAME
    only, as every material in this pipeline does, and assets.js decides what it
    looks like.
    """
    cx, w = fit(z0 - 0.45, 0.86, overhang=0.02)
    coil_r = 0.36                               # NOT SOURCED
    coil_t = min(0.42, w - 0.10)                # NOT SOURCED

    slab('vent-pallet', (w, 0.90, 0.12), (cx, z0, 0.06), DARK, bevel=0.014)
    # a roll stood on its side: axis across the drive, so it reads as a roll of
    # flat material rather than as a drum.
    rod('vent-roll', coil_r, coil_t, (cx - coil_t * 0.5, z0, 0.12 + coil_r),
        RUBBER, rot=(0.0, math.pi * 0.5, 0.0), sides=16)
    rod('vent-roll-eye', coil_r * 0.26, coil_t + 0.02,
        (cx - coil_t * 0.5 - 0.01, z0, 0.12 + coil_r), DARK,
        rot=(0.0, math.pi * 0.5, 0.0), sides=12)
    # the phi 8 mm hanging rope [PMC-DUCT], coiled on the pallet beside it
    for i in range(4):
        rod('duct-rope-%d' % i, 0.14 + i * 0.022, 0.008,
            (cx + w * 0.5 - 0.22, z0 - 0.30, 0.12 + 0.008 + i * 0.009),
            STEEL, sides=16)


# ═════════════════════════════════════════════════════════════════════════════
# 6. THE MARKERS — what stops a machine reversing into all of the above
# ═════════════════════════════════════════════════════════════════════════════

def build_markers(zs, panel_z):
    """Retroreflective delineators along the inboard edge of the laydown, and a
    blank marker panel.

    Underground signs are supplied on retroreflective sheeting on a steel or PVC
    substrate (https://hivis.com/products/underground-general-signage), drives
    are delineated with colour-coded reflective markers
    (https://www.fspglobalproducts.com/mining/deliniation-signage/), and NIOSH
    documents coloured retroreflective markers distinguishing a primary escapeway
    from a secondary one (https://stacks.cdc.gov/view/cdc/215359/cdc_215359_DS1.pdf).
    So the banding is sourced. **The colour KEY is not** — the delineation vendor
    confirms the colours are coded and does not publish what they mean — so
    nothing here asserts a meaning by colour, and there is one banding material.

    THE PANEL CARRIES NO LETTERING, AND THAT IS A RULE RATHER THAN AN OMISSION.
    `DOMAIN.md` §10 records four separate places where invented text reached the
    player, and the fix applied to terrain.js's own site board is the precedent:
    it *"now draws NOTHING. A blank sign is honest; a fabricated one is not."* A
    heading identifier, a chainage or a level name would be a fact this file
    cannot source, and a player could not read it at 4 m anyway.

    Delineator height, spacing and panel size are NOT SOURCED.
    """
    for i, z in enumerate(zs):
        px = x_limit(z) - 0.17
        rod('delineator-%d' % i, 0.038, 1.05, (px, z, 0.0), DARK, sides=8)
        rod('delineator-foot-%d' % i, 0.12, 0.06, (px, z, 0.0), DARK, sides=10)
        for b in (0.60, 0.84):
            rod('delineator-band-%d-%.2f' % (i, b), 0.045, 0.10, (px, z, b),
                HAZARD, sides=8)

    px = x_limit(panel_z) - 0.17
    for sz in (-0.14, 0.14):
        rod('panel-leg-%.2f' % sz, 0.024, 1.24, (px, panel_z + sz, 0.0), DARK, sides=6)
    slab('panel-face', (0.026, 0.52, 0.38), (px, panel_z, 1.16), HAZARD,
         rot=(0.0, -0.09, 0.0))
    slab('panel-frame', (0.014, 0.57, 0.43), (px + 0.015, panel_z, 1.16), DARK,
         rot=(0.0, -0.09, 0.0))


# ═════════════════════════════════════════════════════════════════════════════
# ANCHORS
# ═════════════════════════════════════════════════════════════════════════════

def build_anchors():
    """The nodes the game can read off this site.

    `mount:` is reused rather than a new prefix — `gltfRig.js` already indexes
    it, `terrain.js` `restoreSiteNames()` already un-sanitises it, and
    `rig.finish()` already restores its world transform through the join, which
    is the contract that took longest to get right (ASTRA §4).

    ONLY THE COLLAR IS SHIPPED. `quarry-bench` ships four anchors and none of
    them has a consumer; a fifth, sixth and seventh here would be the ninth
    declared-contract-with-no-consumer this project has paid for (ASTRA §10). The
    collar earns its place because it is the one node a loader can use to assert
    the model arrived in the frame it was authored for.
    """
    S.anchor('site-collar', (0.0, 0.0, 0.0))


# ═════════════════════════════════════════════════════════════════════════════
# THE GATES — and every one of them COUNTS WHAT IT CHECKED
#
# "A gate over an empty set passes forever" (ASTRA §10) — `check:reach` reported
# zero targets and called it a PASS. So each gate below asserts that it actually
# measured something before it is allowed to pass, and prints its counts.
# ═════════════════════════════════════════════════════════════════════════════

def _vertices():
    """Every authored vertex, as DRIVE-LOCAL (x across, y up, z chainage).

    REAL vertices, transformed by the object's world matrix — not the eight
    corners of a local AABB, which ASTRA §5 records as a strict over-estimate
    that produced four false findings in this repo. Curves are evaluated through
    the depsgraph so a hose is measured as the tube it exports as rather than as
    its control points.

    The Blender -> drive-local conversion is the inverse of `B()` and it is the
    only other place in this file that touches the frame: Blender (bx, by, bz)
    reads back as drive-local (bx, bz, -by).
    """
    deps = bpy.context.evaluated_depsgraph_get()
    for o in bpy.context.scene.objects:
        if o.type not in {'MESH', 'CURVE', 'SURFACE', 'FONT'}:
            continue
        ev = o.evaluated_get(deps)
        try:
            mesh = ev.to_mesh()
        except RuntimeError:
            continue
        if mesh is None:
            continue
        m = o.matrix_world
        for v in mesh.vertices:
            p = m @ v.co
            yield o.name, (p.x, p.z, -p.y)
        ev.to_mesh_clear()


def gates():
    n = 0
    worst_profile = (9e9, None)
    worst_z = (9e9, None)
    worst_ndc = (-9e9, None)
    worst_collar = (9e9, None)
    tallest = (0.0, None)
    n_in_frame = 0

    for name, p in _vertices():
        n += 1
        x, y, z = p                       # drive-local: across, up, chainage

        slack = profile_slack(x, y)
        if slack < worst_profile[0]:
            worst_profile = (slack, name)
        if z - Z_NEAR < worst_z[0]:
            worst_z = (z - Z_NEAR, name)
        if y > tallest[0]:
            tallest = (y, name)
        r = math.hypot(x, z)
        if r < worst_collar[0]:
            worst_collar = (r, name)

        nx, ny = ndc_x(x, z), ndc_y(y, z)
        if -1.02 <= nx <= 1.02 and -1.02 <= ny <= 1.02:
            n_in_frame += 1
            if nx > worst_ndc[0]:
                worst_ndc = (nx, name)

    if n < 500:
        raise AssertionError(
            'underground_drive: the gates measured only %d vertices, which '
            'cannot be right for this model. A gate over an empty set passes '
            'forever (ASTRA §10).' % n)

    if worst_profile[0] < 0:
        raise AssertionError(
            'underground_drive: "%s" is %.3f m OUTSIDE the smallest drive '
            'profile (%s, %.1f x %.1f m, springing %.1f m) with %.2f m of '
            'clearance allowed. Everything here has to fit the SMALLEST of the '
            'four rooms this archetype covers, or it is buried in rock in that '
            'one. See FOUR DRIVES, ONE ARCHETYPE ID.'
            % (worst_profile[1], -worst_profile[0], SMALL_ID, SMALL['width'],
               SMALL['height'], SMALL['wallH'], PROFILE_CLEARANCE))

    if worst_z[0] < 0:
        raise AssertionError(
            'underground_drive: "%s" reaches %.3f m nearer the face than '
            'z = %.2f, where the measured machine envelopes end (max %.1f '
            'inside this strip). It would be inside a machine.'
            % (worst_z[1], -worst_z[0], Z_NEAR, MACHINE_MAX_Z))

    if worst_collar[0] < COLLAR_R:
        raise AssertionError(
            'underground_drive: "%s" has a vertex %.3f m from the collar, '
            'inside the %.1f m keep-clear. terrain.js solves the section seam '
            'on the collar and the machine stands on it.'
            % (worst_collar[1], worst_collar[0], COLLAR_R))

    if n_in_frame < 100:
        raise AssertionError(
            'underground_drive: only %d vertices land inside the hero frame. A '
            'site model nobody sees is a gallery piece; if this is genuinely '
            'right the composition needs re-solving, not the gate relaxing.'
            % n_in_frame)

    if worst_ndc[0] > KEEP_NDC_X:
        raise AssertionError(
            'underground_drive: "%s" projects to NDC x %+.3f, inside the column '
            'at %+.3f where the machine and the collar are. This model is a '
            'SILHOUETTE LAYER at the edge of an already-dark frame; putting it '
            'in front of the work is the one failure the underground look '
            'cannot absorb (see THE ENCLOSURE PROBLEM).'
            % (worst_ndc[1], worst_ndc[0], KEEP_NDC_X))

    print('UG_GATES vertices=%d in_frame=%d profile_slack=%.3f z_clearance=%.3f '
          'collar_min=%.3f max_ndc_x=%+.3f tallest=%.3f(%s)'
          % (n, n_in_frame, worst_profile[0], worst_z[0], worst_collar[0],
             worst_ndc[0], tallest[0], tallest[1]))
    return n, n_in_frame


# ═════════════════════════════════════════════════════════════════════════════
# EXPORT
# ═════════════════════════════════════════════════════════════════════════════

# THERE IS NO ROTATION AT EXPORT, AND THAT IS THE DECISION, NOT AN OMISSION.
#
# The export goes out in DRIVE-LOCAL metres because `terrain.js` `siteParent()`
# hangs an underground site model on `driveGroup`, which already carries
# `rotation.y = DRIVE_YAW`. Worked through so the next reader does not have to:
# Blender exports `export_yup=True`, mapping Blender (bx, by, bz) -> glTF
# (bx, bz, -by), and a rotation of +theta about Blender +Z is exactly a three.js
# `rotation.y = +theta` —
#
#     b = (bx, by, bz)             ->  p = (bx, bz, -by)
#     Ry(t) p = (bx cos t - by sin t, bz, -bx sin t - by cos t)
#             =  the glTF image of (bx cos t - by sin t, bx sin t + by cos t, bz)
#
# which is Rz(t) in Blender. So applying DRIVE_YAW here and then letting
# `driveGroup` apply it again would put this model 42.28 degrees across its own
# drive — inside the rib on one side and in mid-air on the other — with nothing
# in any log to say so. See THE FRAME THIS IS EXPORTED IN.


# The laydown, laid out along the strip. Every z here is bounded by Z_NEAR and
# Z_FAR and the gates re-check it against the MEASURED machine envelopes, so
# these are a composition, not a clearance claim.
# THE LAYOUT, AND WHY IT IS IN THIS ORDER — solved against the frame, not by eye.
#
# `bottom(d) = 2.25 - 0.1638 d` puts the hero frame's lower edge 1.10 m above the
# invert at the far end of this strip and 2.09 m above it one metre in front of
# the eye. The frame CLOSES DOWNWARD as objects come nearer, so anything under
# about 1.5 m tall is below the bottom edge everywhere in this window. That is
# not a defect to design around — it is what a near foreground does, it bleeds
# off the bottom of the frame — but it decides the order:
#
#   · the TALL kit takes the WHOLE hero window and is spread through its depth,
#     not clustered at one end. Working out from the machine: a mesh stillage at
#     6.72 m (frame bottom 1.10 m, so the pack shows from a third of its height
#     up), the basket of 2.4 m bolts at 8.42 m (bottom 1.38 m), and the second
#     stillage at 10.12 m (bottom 1.66 m, and at that range a 0.5 m slab is a
#     third of the frame's half-width). Three verticals at three depths give the
#     corridor its convergence; the first arrangement put both stillages at the
#     far end and the render came back with one small cluster and then nothing.
#     They are also the known-size objects that give the drive its scale — see
#     the cave-photography note in the header.
#   · the LOW kit goes NEAR, where the frame has already closed above it. The
#     bin, the distribution board, the duct roll and the floor delineators read
#     in `renderer.js`'s orbit and menu modes, which leave the tube, and they are
#     why the laydown looks like a laydown from any other angle. Nothing under
#     about 2.2 m tall reaches the hero frame anywhere in this window, and that
#     is arithmetic, not a preference: `bottom(d) = 2.25 - 0.1638 d`.
#
# Every z here is re-checked by `gates()` against the MEASURED machine envelopes,
# so this is a composition and not a clearance claim.
LAYOUT = dict(
    mesh_a=(6.72, 7.97),
    basket=(8.42, 9.62),
    mesh_b=(10.12, 11.37),
    bin=(11.85, 12.50),
    power=(12.72, 13.57),
    vent=14.30,
    delineators=(8.14, 9.86, 13.80),
    panel=11.62,
)


def build(out_path):
    S.reset()
    build_mesh_stillage('mesh-a', *LAYOUT['mesh_a'])
    build_bolt_basket(*LAYOUT['basket'])
    build_mesh_stillage('mesh-b', *LAYOUT['mesh_b'])
    build_scrap_bin(*LAYOUT['bin'])
    build_power(*LAYOUT['power'])
    build_vent_spare(LAYOUT['vent'])
    build_markers(LAYOUT['delineators'], LAYOUT['panel'])

    n, seen = gates()                 # drive-local metres, which is also the
    build_anchors()                   # frame this exports in — see above

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    print('UG_FRAME drive_yaw=%.5f rad (%.2f deg, parsed from src/core/env.js, '
          'used ONLY to place the camera) · eye_drive_local=(%.3f, %.3f, %.3f) · '
          'smallest_room=%s %.1fx%.1f · mesh_sheet=%.1fx%.1f m · '
          'bolt=%.0f mm x %.1f m · plate=%.0f mm · vertices=%d seen=%d'
          % (DRIVE_YAW, DRIVE_YAW / D2R, EYE[0], EYE[1], EYE[2], SMALL_ID,
             SMALL['width'], SMALL['height'], MESH_L, MESH_W, BOLT_D_MM, BOLT_L,
             PLATE_MM, n, seen))
    print('UG_FRAME this export is in DRIVE-LOCAL metres and carries no '
          'rotation. terrain.js siteParent() hangs it on driveGroup, which '
          'already yaws it. Do NOT add a yaw at either end.')
    return S.finish(out_path, budget=4)


# ═════════════════════════════════════════════════════════════════════════════
# INSPECTION RENDER — an OFFLINE BLENDER RENDER of the REAL EXPORT
#
# It re-imports the exported .glb rather than photographing the scene that made
# it, which is the discipline `urban_plot.py` adopted: a render of the authoring
# scene proves nothing about the file.
#
# The lighting, the ground plane, the drive stand-in and the camera are
# INSPECTION FIXTURES. They are not in the .glb, they are not the game's light
# rig, and this render makes no claim about how the model looks in game — the
# game's materials are generated procedurally by assets.js from names and none of
# that runs here. It exists so somebody can LOOK at the geometry.
# ═════════════════════════════════════════════════════════════════════════════
# ── inspection-only surfaces ─────────────────────────────────────────────────
# These are NOT the game's materials. `assets.js` generates every one of the four
# names in this .glb procedurally at runtime, with wear and dirt driven by
# gameplay state, and none of that runs in Blender (rig.py contract 2: a material
# here is a NAME and nothing else). What follows is a set of plausible greys so a
# human can tell one object from another in a still. Do not read colour off these
# renders and do not quote them as how the site looks in game.
INSPECT = {
    'rawSteel':     (0.150, 0.152, 0.156, 0.42, 0.85),   # r, g, b, rough, metal
    'paintedDark':  (0.052, 0.055, 0.060, 0.62, 0.05),
    'rubber':       (0.022, 0.022, 0.024, 0.80, 0.00),
    'safetyStripe': (0.360, 0.180, 0.020, 0.45, 0.00),
}


def _pbr(name, rgb, rough, metal):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    return m


def preview(path, tag, eye, look, res, fov_h_deg, proxy=True, fill=None,
            shell=True):
    """Render the REAL export offline, in Blender, with inspection fixtures.

    It re-imports the exported `.glb` rather than photographing the scene that
    made it — the discipline `urban_plot.py` adopted, because a render of the
    authoring scene proves nothing about the file.

    EVERYTHING EXCEPT THE IMPORTED GEOMETRY IS A FIXTURE: the drive shell, the
    two lamps, the machine proxy, the materials and the camera. None of it is in
    the `.glb`, none of it is the game's light rig or the game's materials, and
    this render makes no claim about how the site looks in game. It exists so
    somebody can LOOK at the geometry and at where it sits in the frame.
    """
    import mathutils
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)

    # NOTHING IS UN-ROTATED HERE. The export is already drive-local, which is
    # the frame the fixtures below are written in, so the imported geometry has
    # to land in the authored strip with no help. If it does not, the export
    # frame is wrong and this render will show it immediately — the laydown will
    # be somewhere other than against the left rib.
    bpy.context.view_layer.update()

    made = {}
    for o in bpy.context.scene.objects:
        if o.type != 'MESH' or not o.data.materials:
            continue
        for i, src in enumerate(o.data.materials):
            key = (src.name or '').split('.')[0]
            spec = INSPECT.get(key)
            if not spec:
                continue
            if key not in made:
                made[key] = _pbr('inspect:' + key, spec[:3], spec[3], spec[4])
            o.data.materials[i] = made[key]
    if len(made) != len(INSPECT):
        raise AssertionError(
            'underground_drive.preview: matched %d of %d material names in the '
            'export (%s). A preview that silently draws the wrong surfaces is '
            'worse than none.' % (len(made), len(INSPECT), sorted(made)))

    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 64
    sc.render.threads_mode = 'FIXED'
    sc.render.threads = 4            # seven other builds share this machine
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.world = bpy.data.worlds.new('inspection-world')
    sc.world.use_nodes = True
    bg = sc.world.node_tree.nodes['Background']
    bg.inputs[0].default_value = (0.055, 0.058, 0.070, 1.0)
    bg.inputs[1].default_value = 1.0
    # A STANDARD view transform, deliberately. Blender 5's default AgX rolls the
    # shadows a long way down, which on a scene that is almost entirely shadow
    # produces a black rectangle: the first render of this preview came back with
    # the whole laydown below the point where a reader could see it. This is an
    # inspection image and its job is to be READABLE, not to be graded. The
    # game's own grade is renderer.js's and nothing here speaks to it.
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'

    # ── the drive shell: a stand-in for the SMALLEST of the four rooms ───────
    # The real shell is terrain.js's, swept per method from env.js with a rock
    # shader on it. This is a bare tube at the profile this model has to fit
    # inside, so the geometry can be seen in the space it was solved for.
    w, h, wall = SMALL['width'] * 0.5, SMALL['height'], SMALL['wallH']
    ring = []
    for i in range(41):
        t = i / 40.0
        if t < 0.62:
            a = math.pi * (1.0 - t / 0.62)
            ring.append((-w * math.cos(a), wall + (h - wall) * math.sin(a)))
        else:
            u = (t - 0.62) / 0.38
            rx = w - 2 * w * u
            ring.append((rx, 0.10 * ((rx / w) ** 2 - 1)))
    ring = [(-w, 0.0)] + ring + [(-w, 0.0)]
    verts, faces = [], []
    for zc in (Z_NEAR - 26.0, Z_FAR + 8.0):
        for (rx, ry) in ring:
            verts.append(B((rx, zc, ry)))
    nr = len(ring)
    for i in range(nr - 1):
        # wound so the visible side faces INWARD — the camera is inside the tube
        faces.append((i + 1, i, nr + i, nr + i + 1))
    if shell:
        me = bpy.data.meshes.new('inspection-drive')
        me.from_pydata(verts, [], faces)
        me.update()
        tube = bpy.data.objects.new('inspection-drive', me)
        bpy.context.collection.objects.link(tube)
        me.materials.append(_pbr('inspect:rock', (0.062, 0.058, 0.052), 0.95, 0.0))

    # ── the machine proxy — the whole point of the near-field composition ────
    # A blank block at the MEASURED drive-local envelope of the longhole rig
    # (glbinfo.mjs's own vertex walk, rotated by -DRIVE_YAW: x -2.981..+3.385,
    # y 0..3.940, z -3.345..+3.661). It is a FIXTURE and deliberately featureless
    # — this file must not draw a machine — and it is here to make one claim
    # checkable by eye: THE LAYDOWN DOES NOT STAND IN FRONT OF THE WORK. If the
    # block is clipped by this model in the hero frame, the NDC gate is wrong.
    if proxy:
        bpy.ops.mesh.primitive_cube_add(size=1)
        pr = bpy.context.object
        pr.name = 'inspection-machine-proxy'
        pr.scale = (3.385 + 2.981, 3.661 + 3.345, 3.940)
        bpy.ops.object.transform_apply(scale=True)
        pr.location = B(((3.385 - 2.981) * 0.5, (3.661 - 3.345) * 0.5, 3.940 * 0.5))
        pr.data.materials.append(_pbr('inspect:proxy', (0.30, 0.27, 0.10), 0.70, 0.0))

    def lamp(loc, energy, colour, size):
        bpy.ops.object.light_add(type='POINT', location=B(loc))
        L = bpy.context.object
        L.data.energy = energy
        L.data.color = colour
        L.data.shadow_soft_size = size
        return L

    # Two practicals standing in for lights that really are in the drive: a warm
    # festoon bulb on the opposite rib over the laydown (env.js `ugFest*` hangs
    # one in this stretch of every one of the four drives), and a cold key
    # forward on the work. The energies are picked to EXPOSE THIS RENDER; they
    # are not solved the way env.js solves the game's rig through cd() and
    # ROCK_ALBEDO, and no brightness in this image means anything about the game.
    if shell:
        lamp((w - 0.30, 10.6, wall + 0.55), 260, (1.00, 0.62, 0.24), 0.16)
        lamp((0.8, 0.6, 2.4), 5200, (1.00, 0.94, 0.84), 0.40)
    # An extra inspection fill for the close look, so the objects can be READ.
    # It is an inspection fixture and there is nothing like it in a drive.
    if fill:
        for where, energy in fill:
            lamp(where, energy, (0.94, 0.95, 1.00), 1.2)

    bpy.ops.object.camera_add(location=B(eye))
    cam = bpy.context.object
    cam.rotation_euler = (mathutils.Vector(B(look)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.data.sensor_fit = 'HORIZONTAL'
    cam.data.lens_unit = 'FOV'
    cam.data.angle = fov_h_deg * D2R
    sc.camera = cam

    out = os.path.join(ROOT, 'shots', 'underground-drive-export%s.png' % tag)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('UG_PREVIEW_REAL_GLB (OFFLINE BLENDER RENDER of the exported .glb, '
          'inspection fixtures and inspection materials, NOT a gameplay '
          'capture) ' + out)


# The hero frame, reproduced from the MEASURED coefficients rather than from
# `renderer.js`'s declared `fov: 34`, which is not what the live camera runs at
# (see THE HERO FRAME). half_width/d = 0.4023 gives a horizontal field of
# 2*atan(0.4023) = 43.9 deg; half_height/d = (0.2065 + 0.1638)/2 = 0.18515 gives
# an aspect of 2.173. The look point sits on the frame's own centre line, which
# rises at (TOP_K - BOT_K)/2 = 0.0214 m per metre out.
HERO_FOV_H = 2.0 * math.atan(HALF_W_K) / D2R
HERO_ASPECT = HALF_W_K / ((TOP_K + BOT_K) * 0.5)


if __name__ == '__main__':
    result = build(os.path.join(ROOT, 'public', 'models', 'sites',
                                'underground-drive.glb'))
    if '--preview' in sys.argv:
        # 1: the player's own eye, in the player's own frame — the shot this
        #    model is composed for, with the machine proxy standing in the work.
        preview(result, '', (EYE_X, EYE_Z, EYE_Y),
                (EYE_X, 0.0, EYE_Y + (TOP_K - BOT_K) * 0.5 * dist_at(0.0)),
                (1160, int(round(1160 / HERO_ASPECT))), HERO_FOV_H)
        # 2: a three-quarter look at the laydown itself, so the geometry can be
        #    inspected rather than only its silhouette. No machine proxy: this
        #    one is about the objects, not about the composition.
        # 2 is deliberately taken with the shell OFF and from outside where the
        # rib would be. Two attempts to shoot it from inside the tube failed for
        # reasons worth recording: the first put the eye at x = +2.6 in a 5.0 m
        # room whose rib is at +2.5 — inside the rock, and it rendered black —
        # and the second stood a fill lamp between the eye and the subject and
        # blew out the rib. A 5 m drive has nowhere to stand far enough back to
        # photograph a 6 m laydown; that is a true fact about the room and the
        # right answer is to take the wall away for the inspection shot rather
        # than to pretend there is room.
        preview(result, '-detail', (6.4, 18.2, 3.9), (-1.85, 10.4, 1.05),
                (1160, 780), 40.0, proxy=False, shell=False,
                fill=(((5.0, 17.0, 5.5), 3000), ((-4.0, 6.0, 3.4), 1400)))

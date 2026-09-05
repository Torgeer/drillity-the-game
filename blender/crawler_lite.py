"""
`crawler_lite` — the light tracked utility drill.  In-game marque: the
**Nordvik NV-90 Scout**.  Real class: a 4–6 t hydraulic tracked geotechnical /
anchor rig — a mast that dwarfs its carrier, standing on a short wide
variable-gauge undercarriage, with **no cab**, **no counterweight**, **no rod
carousel** and **no rope drum**.  The driller stands beside it at a bank of
manual levers and lifts every rod by hand.

WHY THIS MACHINE IS NOT `crawler_th` SCALED DOWN
------------------------------------------------
They are different architectures, not different sizes of one drawing:

  crawler_th   15.6 t · articulated BOOM off a turnable superstructure, feed
               beam carried on a cradle at the boom nose, ROPS/FOPS cab,
               carousel rod handler, on-board screw compressor, 2.45 m wide,
               3.75 m of track.  Silhouette: a T — a feed standing a full
               track-length AHEAD of a big machine.
  crawler_lite  4.5 t · mast carried on a SLIDE FRAME at the very front of the
               carrier, its foot and clamp block ON THE GROUND ahead of the
               front idler.  No cab, no carousel, no compressor on board — the
               air comes off a towed screw compressor.  1.70 m wide, 1.98 m of
               track.  Silhouette: an L, and it is TALLER THAN IT IS LONG.

The two share a parts vocabulary and nothing else.  If they ever read as one
model at two scales, this file is wrong.

WHAT THIS IS MODELLED FROM
--------------------------
  [G1] Comacchio "GEO 305" presentation, `C:\\Users\\henri\\Downloads\\
       Comacchio-GEO-305Pres_2023_FULL_WEB.pdf`, **p. 16** — a dimensioned
       two-view general arrangement (side + front elevation), and the only
       fully dimensioned drawing of this class in the owner's library.
       PRINTED CALLOUTS, used verbatim below:
         overall length 3840 · overall height, mast vertical 6200 ·
         FEED STROKE 3600 · track wheelbase idler-ctr to sprocket-ctr 1500 ·
         track shoe width 300 · overall width across tracks 1400-1700
         (variable-gauge undercarriage) · height over the carrier body 1700.
       Page bullets: "Variety of mast options with up to 5 tonnes feed and
       retract force" · "Mast extension to handle 6m above the clamps
       available" · "Variable width undercarriage available with steel tracks
       and rubber shoes".
  [G2] The same drawing, MEASURED.  The GA is an embedded raster; extracted at
       its native 768 x 616 and scaled from two printed callouts.  It is placed
       on the page anisotropically, so the two axes have genuinely different
       scales and every derived figure states which it used:
         horizontal  3840 mm / 367 px = 10.463 mm/px
                     cross-checked 1500 mm / 144 px = 10.417  (0.4 % apart)
         vertical    6200 mm / 495 px = 12.525 mm/px
       Repeatable: the datum is the ground line at py 532.5 and the drill axis
       at px 118 (the front extension line of the 3840 dimension).  Good to
       about +/- 2 px, i.e. +/- 25 mm.  Anything from [G2] is a MEASUREMENT off
       a manufacturer's own drawing, not an invention — but it is not a printed
       number either, and it is labelled so.
  [G3] Same PDF, **p. 4** — full side elevation photograph, mast lowered to
       transport.  The best component photograph of the class: a row of oval
       lightening slots down the mast's outer face; a plastic drag chain along
       the mast; the forward-hooking crown with a service winch and its rope
       running back at a slant; a red perforated cylindrical guard over the rod;
       a mesh-sided cage round the head; bright blue thermoplastic water hose;
       black hydraulic bundles in spiral wrap; red track frames under a sand
       body; orange tie-down loops; four jacks with round pads.
  [G4] Same PDF, **p. 2** — three-quarter rear.  The console is the thing this
       class has INSTEAD of a cab: a sand sheet-steel box, a raised strip with
       four chrome-bezel pressure gauges, two rows of black lever handles, a
       tubular guard rail bent over the levers to stop them being knocked,
       knurled chrome relief adjusters, and a big shaped splash shield hanging
       below it.  Also: welded wire mesh guard panels in a bolted tube frame,
       body louvres, a gauge on a manifold stand on the roof, orange tie-down
       hooks and yellow hazard decals on the track frame.
  [K1] `C:\\Users\\henri\\Downloads\\KLEMM_Lieferprogramm_Product_Range.pdf`
       p. 8, the "Confined Conditions" table — the weight/power band for this
       class: 4.9 t at 45-55 kW (min width 780 mm), 5.1 t electric at 45 kW,
       5.6 t, 6.2 t with a 55 kW diesel ON BOARD (min width 950 mm).  p. 13,
       the small rotary heads: 3.2 kNm / 312 rpm / 20 mm hollow shaft;
       5.0 kNm / 360 rpm / 65 mm; 6.5 kNm / 193 rpm / 89 mm.  p. 5: the same
       maker sells hydraulic DRIFTERS for this class as interchangeable
       modules, 6.8-28 kg piston weight.
  [K2] `C:\\Users\\henri\\Downloads\\Einsteckende Klemm.pdf` — a dimensioned
       shank-adapter production drawing for a hydraulic drifter of this class:
       12-tooth spline drive, 107.5 mm over the teeth, 746 mm long, 23 kg,
       BW64 rope thread 2 tpi left-hand, internal flush through a 16 mm bore.
       Hard evidence that this weight class runs a top-hammer drifter on an
       internally-flushed rope-thread string, which is what makes `top-hammer`
       legitimate on this rig.
  [R1] `research/rigs/crawler-lite.md` — the local reference pack for this
       machine, with the component inventory (§4), the thumbnail silhouette
       (§5), the material and wear map (§6) and the honest gaps (§8).
  [D1] `src/game/data.js`, `RIGS['crawler-lite']` — the CONTENT authority, and
       a hard constraint on this model, not a suggestion: 4.5 t · 55 kW ·
       4.2 kNm · 26 kN feed · price 95 000 · unlock level 1 · methods auger,
       top-hammer, overburden, anchor, site-investigation.  Its description
       fixes three shapes: "Hand-fed rods, an open canopy and a heater that
       works when it feels like it".  Its comment fixes a fourth by exclusion:
       "a hydraulic tracked drill has no rope drum and no walking beam" — so
       there is NO winch drum on this machine anywhere except the little rod
       hoist at the mast crown, which lifts a rod, not a string.
  [D2] `src/core/renderer.js`, the hero-camera solve — "the machine is
       crawler-lite, a 4.2 m mast on a 0.14 m pivot, ~4.6 m overall".  The
       camera was solved against those numbers and the crown is projected
       127 px below the status card.  Build taller and the hero shot crops the
       machine.  This is why the mast here is the SHORT option and not the
       5.5 m mast of [G1].

THE ONE PLACE THIS MODEL DEPARTS FROM [G1], AND WHY
---------------------------------------------------
[G1]'s machine stands **6200 mm** on a **3600 mm** feed stroke.  This one
stands **4600 mm** on a **2200 mm** stroke.  Everything from the deck down is
[G1] as dimensioned; the mast is the short option.

That is not a fudge, it is how the class is sold — [G1]'s own headline bullet
is "Variety of mast options", and [R1] §4.1 records 1200 / 1700 / 2200 mm
strokes on a competitor's machine of this size.  One carrier, several masts.
And the mast is where the mass is: dropping ~1.3 m of welded box beam, its
feed chain, its carriage rails and 1.4 m of stroke is what takes a 5-6 t
machine ([K1] p. 8) down to the **4.5 t** of [D1].  A 2200 mm stroke is also
the shortest that will swallow a **1.5 m rod** plus the head — which is the
whole point of a machine whose rods are lifted by hand.

NAMING — `DOMAIN.md` §10.  Every real designation lives in this comment block
and nowhere else.  No object name, no material name and no exported string
carries a manufacturer or a model number.  Shape is not branding.

AXES AND ORIGIN.  Blender is Z-up and the exporter flips to three.js Y-up.
Machine FORWARD is Blender **-Y** (which lands on three.js +Z), matching
`crawler_th.py` and the procedural `buildCrawlerLite()`.  The origin is **the
drill axis at ground level** — not the undercarriage centre.  That is
deliberate and it is what the procedural builder does too (its carrier sits at
z = -2.0 with the mast at z ~ 0): on this machine the hole is ahead of the
tracks, so putting the origin on the hole is what lets the game drop the rig on
a collar without a per-rig fudge offset.  So +Y is REARWARD through the machine
and every `Y_` constant below is "millimetres behind the hole".
"""

import os
import sys
import math

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import bpy                                                    # noqa: E402
import rig as R                                               # noqa: E402

D2R = math.pi / 180.0
C = bpy.context

# ══════════════════════════════════════════════════════════════════════════════
# CONSTANTS.  Every one carries the source it came from.  `[G2]` means measured
# off the manufacturer's own dimensioned drawing; `DERIVED` means computed from
# other sourced numbers and says how; `NOT SOURCED` means exactly that and is
# never dressed up as anything else.
# ══════════════════════════════════════════════════════════════════════════════

# ── overall envelope ──────────────────────────────────────────────────────────
OAL          = 3.840   # [G1] overall length, drill axis to the rear of the machine
W_RETRACT    = 1.400   # [G1] overall width across the tracks, gauge retracted
W_WORK       = 1.700   # [G1] ...and extended.  The machine is POSED EXTENDED:
                       # it is set up over a hole with its jacks down, and [R1]
                       # §4.8 calls the retract/extend the class's defining
                       # animation, so the model must show the working end of it.
SHOE_W       = 0.300   # [G1] track shoe width
GAUGE        = W_WORK - SHOE_W          # DERIVED: 1.400 m centre to centre
GAUGE_RETRACT = W_RETRACT - SHOE_W      # DERIVED: 1.100 m, for the ram stroke

# ── undercarriage ─────────────────────────────────────────────────────────────
WHEELBASE    = 1.500   # [G1] idler centre to sprocket centre
IDLER_Y      = 1.015   # [G2] idler centre, behind the drill axis
SPROCKET_Y   = IDLER_Y + WHEELBASE      # 2.515 — [G2] measured 2.522, 7 mm apart
ROLLER_R     = 0.235   # [G2] from the track loop's ends: 1015-785 = 230 at the
                       # idler and 2760-2522 = 238 at the sprocket
TRACK_Y0     = IDLER_Y - ROLLER_R       # 0.780 — [G2] measured 0.785
TRACK_Y1     = SPROCKET_Y + ROLLER_R    # 2.750 — [G2] measured 2.760
TRACK_LEN    = TRACK_Y1 - TRACK_Y0      # 1.970 — [G2].  Note against crawler_th's
                                        # 3.75 m: this is the single clearest
                                        # size tell between the two machines.
SHOE_T       = 0.030   # DERIVED: shoe plate thickness, from the track band's
                       # measured 0.480 total against a 0.235 roller radius
GROUSER_H    = 0.022   # NOT SOURCED.  [G1] offers "steel tracks and rubber
                       # shoes" and [G3] shows the rubber-padded version, which
                       # has a low pad and not a grouser bar.
TRACK_TOP    = 2 * ROLLER_R + SHOE_T    # 0.500 — top of the track loop
FRAME_TOP    = 0.695   # [G2] top of the dark main frame — the deck
FRAME_W      = 0.165   # [G2] track frame thickness, front elevation
ROLLERS      = 3       # NOT SOURCED as a count.  [R1] §4.8 reads two roller
                       # positions off the GA; [G2] resolves three shapes on a
                       # 1.5 m wheelbase.  No top carrier roller — the frame is
                       # far too short for one ([R1] §4.8).

# ── main frame and body ───────────────────────────────────────────────────────
FRAME_Y0     = 0.600   # [G2] frame nose, ahead of the front idler
FRAME_Y1     = 3.450   # [G2] frame tail
FRAME_INNER_W = 0.840  # [G2] front elevation, the frame between the track slides
BODY_TOP     = 1.700   # [G1] "height over the carrier body"
BODY_Y0      = 1.130   # [G2] front face of the low front section
BODY_STEP_Y  = 1.900   # [G2] where the low front section becomes full height
BODY_Y1      = 3.360   # [G2] rear face of the enclosure
BODY_LOW_TOP = 1.545   # [G2] roof of the low front section (the tank box)
BODY_W       = 1.100   # [G2] front elevation, inboard of the track slides
TAIL_Y       = 3.700   # [G2] the round-faced unit hung off the tail.  [R1] §8
                       # lists it as NOT IDENTIFIED — winch, hose reel, water
                       # pump or remote receiver.  Built as a hose reel here
                       # because this machine's air line has to live somewhere,
                       # and labelled as the guess it is.
JACK_F_Y     = 0.690   # [G2] front stabiliser jack
JACK_R_Y     = 3.160   # [G2] rear stabiliser jack
JACK_PAD_R   = 0.105   # [G2] round foot pad
JACK_X       = 0.560   # [G2] front elevation, jack spread each side of centre

# ── mast ──────────────────────────────────────────────────────────────────────
MAST_PIVOT_Z = 0.140   # [D2] "a 4.2 m mast on a 0.14 m pivot"
MAST_LEN     = 4.200   # [D2] "a 4.2 m mast".  The short option of [G1]'s
                       # "variety of mast options" — see the header.
CROWN_H      = 0.260   # DERIVED so that 0.14 + 4.20 + 0.26 = 4.60 m, which is
                       # the "~4.6 m overall" the hero camera in [D2] is solved
                       # against.  On [G1] the crown is 6200 - 5940 = 260 mm of
                       # structure above the beam, which is the same number.
FEED_STROKE  = 2.200   # [R1] §4.1: 1200 / 1700 / 2200 mm are the real stroke
                       # options on a machine of this size.  2200 is taken
                       # because it is the shortest that clears a 1.5 m rod
                       # [D1] plus the double head, and because 2200/4600 keeps
                       # [G1]'s stroke-to-height ratio (3600/6200 = 0.58)
                       # within the range the short-mast machines actually ship.
MAST_FACE_Y  = 0.345   # [G2] the mast's FRONT face stands this far behind the
                       # drill axis.  The head reaches forward off it to the
                       # hole; the crown hooks forward over the hole.  This one
                       # number is most of why the silhouette is an L.
MAST_D       = 0.295   # [G2] mast section, fore and aft
MAST_W       = 0.345   # [G2] mast section, across — front elevation
MAST_MID_Y   = MAST_FACE_Y + MAST_D / 2
PLATE_T      = 0.016   # DERIVED plate thickness for a welded box beam this size
SLOTS        = 9       # [G3] a row of oval lightening slots down the mast's
                       # outer face; nine resolve on the p. 4 photograph
CROWN_REACH  = 0.440   # [G2] the crown arm hooks forward past the mast's front
                       # face to get over the hole: measured -100 mm at the tip
                       # against a 345 mm face

# ── clamp / breakout at the mast foot ─────────────────────────────────────────
# [R1] §4.3 calls this "the single biggest missing component" in the game's
# procedural machine.  It is the business end: the lower jaw grips the rod in
# the hole, the upper one turns to break the joint, and it is where all the mud
# is.  [G1]'s own mast bullet measures from it — "6m above the clamps".
CLAMP_Y0     = -0.105  # [G2] the block hangs FORWARD past the drill axis
CLAMP_Y1     = 0.335   # [G2]
CLAMP_Z0     = 0.095   # [G2]
CLAMP_Z1     = 0.660   # [G2]

# ── head, string and tooling ──────────────────────────────────────────────────
# [K1] p. 5 and p. 13: this class takes rotary heads AND hydraulic drifters as
# interchangeable modules, and [R1] §4.2 records that the DOUBLE head — drifter
# above, rotary below, on one carriage — is the visual tell of anchor and
# overburden work.  That is exactly the method list [D1] gives this rig
# (auger, top-hammer, overburden, anchor, site-investigation), so the double
# head is what is built: one fit that explains every method the machine sells.
HEAD_W       = 0.500   # [G2] front elevation, red head across
HEAD_D       = 0.440   # [G2] side elevation, red head fore and aft
HEAD_H       = 0.420   # [G2]
DRIFTER_L    = 0.746   # [K2] the shank adapter alone is 746 mm long, so the
                       # drifter body it enters cannot be shorter than that.
                       # Used as the drifter's body length: a lower bound read
                       # off a real drawing beats a guess.
DRIFTER_W    = 0.230   # NOT SOURCED.  No drifter body drawing was found; only
DRIFTER_H    = 0.215   # NOT SOURCED.  the shank.  Proportioned to [K2]'s 23 kg
                       # shank and the 6.8-28 kg piston band of [K1] p. 5.
SHANK_SPLINE_D = 0.1075  # [K2] 107.5 mm over the 12 spline teeth
ROD_LEN      = 1.500   # [D1] `rodLenM`; [R1] §4.4 gives 1.5-2 m for the class.
                       # A rod a person can pick up is the whole design.
ROD_DIA      = 0.045   # The game's own figure; [K1] p. 13 hollow shafts of
                       # 20 / 65 / 89 mm bracket it.  NOT independently sourced.
ROD_RACK_N   = 6       # NOT SOURCED as a count.  [G3] shows a mesh-guarded RACK
                       # of loose rods at the rear — NOT a carousel.  [R1] §4.9:
                       # rotating magazines start at 20 t machines.  Six 1.5 m
                       # rods is 9 m of hole, which is a morning's work.

# ── operator station ──────────────────────────────────────────────────────────
CONSOLE_Y    = 2.180   # [G4] the console sits on the machine's side, roughly
CONSOLE_Z    = 0.980   # over the middle of the track, at working-hand height
CONSOLE_W    = 0.280   # [G4] proportions read off the p. 2 photograph against
CONSOLE_L    = 0.860   # the 300 mm track shoe in the same frame
CONSOLE_TILT = 22.0 * D2R
LEVERS       = 12      # [G4] "a bank of 8-12 black lever handles in a row" —
                       # the photograph resolves two rows of six
GAUGES       = 4       # [G4] "3-4 round chrome-bezel pressure gauges"
CANOPY_Z     = 2.240   # NOT SOURCED for this class — [G1] and [K1] machines
                       # have neither cab nor canopy.  It is here because [D1]
                       # says "an open canopy and a heater that works when it
                       # feels like it", which is content authority.  Height set
                       # so a person standing ON THE GROUND beside the machine
                       # ([R1] §4.6 — the driller does not stand on the deck)
                       # clears it: 2.24 m of headroom over grade.
                       # It is a ROOF ON POSTS.  No walls, no doors, NO GLASS —
                       # [R1] §9.3 records that the procedural machine's glazed
                       # pane is invisible from every angle and paid a full
                       # render pass for nothing, and the domain answer agrees
                       # with the performance one.

# ── lamps ─────────────────────────────────────────────────────────────────────
# NOT SOURCED as a count: neither [G1] nor [K1] itemises work lights for this
# class, unlike the big surface crawlers.  Two are fitted, at the only two
# places a driller needs light after dark — the collar, and his own levers.
LAMP_CONE    = 54.0
LAMP_RANGE   = 22.0


# ══════════════════════════════════════════════════════════════════════════════
# helpers layered on lib/rig.py
# ══════════════════════════════════════════════════════════════════════════════

def _apply_mods(o, seg=None):
    """Bake an object's modifiers into its mesh NOW.

    `R.finish()` joins meshes by material and Blender's join keeps only the
    ACTIVE object's modifier stack, so a bevel left unapplied on any object
    that is not the join target is silently thrown away.  Applying at creation
    makes every join safe and lets `clone()` share one baked mesh.
    """
    if not o.modifiers:
        return o
    if seg is not None:
        for m in o.modifiers:
            if m.type == 'BEVEL':
                m.segments = seg
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    C.view_layer.objects.active = o
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    return o


def bx(name, size, mat=R.MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
       bevel=0.010, seg=None):
    """A bevelled box in TRUE METRES, with the bevel baked.

    NO SIZE COMPENSATION HAPPENS HERE, DELIBERATELY.
    `lib/rig.py` `box()` was, at the time this file was written, returning boxes
    at HALF the size asked for — `primitive_cube_add(size=1)` already makes a
    unit cube and the next line sets `scale = size/2`.  Measured in Blender
    5.2.1 immediately before starting this model: `box((4, 2, 10))` exported at
    (2.000, 1.000, 5.000), while `tube()` was correct.

    `crawler_th.py` and `foundation_bg.py` compensate by doubling every size on
    the way in.  This file does NOT, because the compensation is the more
    dangerous of the two bugs: the moment `rig.py` is fixed, every machine that
    doubles becomes twice the size it should be, and that has already happened
    twice in this tree.  A machine built against the CORRECT contract is right
    the instant the library is right and obviously, visibly wrong until then —
    which is the failure mode you want.

    So: this file is authored against `box(size) -> a box of that size`.  If it
    exports at half scale, the library is still broken; fix `rig.py`, do not
    touch this file.
    """
    return _apply_mods(R.box(name, size, mat, parent, loc, rot, bevel), seg)


def tb(name, radius, length, mat=R.MAT_STEEL, parent=None, loc=(0, 0, 0),
       rot=(0, 0, 0), sides=12):
    return R.tube(name, radius, length, mat, parent, loc, rot, sides)


def clone(src, loc, rot=(0, 0, 0), parent=None, name=None):
    """A linked duplicate — shares the source mesh, so 60 track shoes cost one
    mesh and are still one draw call once joined."""
    o = src.copy()
    o.name = name or (src.name + '_c')
    o.location = loc
    o.rotation_euler = rot
    o.parent = parent if parent is not None else src.parent
    C.collection.objects.link(o)
    return o


def curve_to_mesh(o):
    """Hoses are Bezier curves.  A curve exports as its own primitive, so ten
    hoses are ten draw calls; converted to mesh they fall into the rubber
    bucket and cost one."""
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    C.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    return C.active_object


def weld(objs, label, parent):
    """Join one moving subassembly's meshes by material.

    `R.finish()` deliberately leaves anything under a `pivot:` / `slide:` node
    alone because it has to move independently — but everything inside ONE
    moving node moves together, so it can be joined exactly the way the statics
    are.  This is what keeps the mast and the carriage from costing sixty draw
    calls between them.
    """
    groups = {}
    for o in objs:
        if o is None or o.type != 'MESH':
            continue
        key = o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault(key, []).append(o)
    out = []
    for key, grp in groups.items():
        if len(grp) > 1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in grp:
                o.select_set(True)
            C.view_layer.objects.active = grp[0]
            bpy.ops.object.join()
        a = grp[0]
        a.name = label + ':' + key
        a.parent = parent
        out.append(a)
    return out


def hz(name, size, parent, loc, rot=(0, 0, 0)):
    """A hazard-striped plate.  [G4] shows yellow/black decals along the track
    frame and on every edge a rod can hit; they read at distance and cost
    nothing but triangles."""
    return bx(name, size, R.MAT_HAZARD, parent, loc, rot, bevel=0.003)


def ram(name, parent, base, tip, barrel_r=0.045, rod_r=0.026, mat_b=R.MAT_DARK,
        mat_eye=R.MAT_CAST):
    """A hydraulic cylinder drawn between two points: barrel off the base, bare
    chrome rod out of the gland, a gland nut and two cast eye-ends.  Without
    those three it is two cylinders.  [R1] §6: cylinder rods are "the one
    genuinely shiny thing on the machine", so they get their own material.
    """
    bxx, byy, bzz = base
    dx, dy, dz = tip[0] - bxx, tip[1] - byy, tip[2] - bzz
    L = math.sqrt(dx * dx + dy * dy + dz * dz)
    ry = math.atan2(math.sqrt(dx * dx + dy * dy), dz)
    rz = math.atan2(dy, dx) - math.pi / 2
    rot = (0.0, ry, rz)
    bl = L * 0.58
    f = bl / L
    return [
        tb(name + '_barrel', barrel_r, bl, mat_b, parent, base, rot, 12),
        tb(name + '_rod', rod_r, L, R.MAT_CHROME, parent, base, rot, 10),
        tb(name + '_gland', barrel_r * 1.18, 0.045, R.MAT_WORN, parent,
           (bxx + dx * f, byy + dy * f, bzz + dz * f), rot, 12),
        tb(name + '_eyeA', barrel_r * 1.05, 0.062, mat_eye, parent, base,
           (rot[0], rot[1] + math.pi / 2, rot[2]), 10),
        tb(name + '_eyeB', rod_r * 1.8, 0.052, mat_eye, parent, tip,
           (rot[0], rot[1] + math.pi / 2, rot[2]), 10),
    ]


def slotted_plate(name, size, slots, parent, loc, mat=R.MAT_PAINT,
                  border=0.045, rib=0.030, rot=(0, 0, 0)):
    """A plate pierced by a row of lightening slots, built as REAL HOLES.

    [G3] p. 4 shows a row of oval slots down the mast's outer face — the single
    cheapest detail on this machine and one of the loudest: it says "fabricated
    plate beam" at a distance where nothing else on the mast reads at all.

    The holes are made by construction, not by a boolean: an outer border plus
    ribs between the slots.  A boolean on nine stadium cutters is a coin toss
    that either produces n-gons the exporter has to triangulate badly or fails
    silently and leaves a solid plate — and a silently solid plate is exactly
    the class of failure this tree keeps being bitten by.  `size` is
    (across, thickness, along).
    """
    w, t, l = size
    out = []
    open_l = l - 2 * border
    pitch = open_l / slots
    out.append(bx(name + '_a', (w, t, border), mat, parent,
                  (loc[0], loc[1], loc[2] - l / 2 + border / 2), rot, 0.006))
    out.append(bx(name + '_b', (w, t, border), mat, parent,
                  (loc[0], loc[1], loc[2] + l / 2 - border / 2), rot, 0.006))
    for s in (-1, 1):
        out.append(bx(name + '_s%d' % s, (border, t, l), mat, parent,
                      (loc[0] + s * (w / 2 - border / 2), loc[1], loc[2]), rot,
                      0.006))
    for i in range(1, slots):
        z = loc[2] - l / 2 + border + i * pitch
        out.append(bx(name + '_r%d' % i, (w - 2 * border, t, rib), mat, parent,
                      (loc[0], loc[1], z), rot, 0.004))
    return out


def lamp(name, parent, loc, aim, cone=LAMP_CONE, rng=LAMP_RANGE, watt=70):
    """A work light: a housing, the stone guard a lamp needs when it lives a
    metre off a hole being drilled, and the two named nodes `src/core/env.js`
    reads EVERY FRAME to re-aim its spotlight.

    The housing is `paintedDark` / `wornSteel`, both of which every host node
    already owns, so a lamp adds triangles and no draw call.
    """
    mount, aimnode = R.worklight(name, parent, loc, aim, cone, rng)
    mount['watt_w'] = watt
    mount['colour_hex'] = 0xFFE9C0
    m = [
        bx(name + '_stalk', (0.028, 0.028, 0.13), R.MAT_DARK, mount, (0, 0, -0.085)),
        bx(name + '_shell', (0.20, 0.11, 0.15), R.MAT_DARK, mount, (0, 0.02, 0)),
        bx(name + '_lens', (0.16, 0.010, 0.11), R.MAT_GLASS, mount, (0, -0.048, 0)),
        bx(name + '_barH', (0.21, 0.011, 0.011), R.MAT_WORN, mount,
           (0, -0.062, 0.070), bevel=0.0),
    ]
    for i in range(3):
        m.append(bx(name + '_bar%d' % i, (0.011, 0.011, 0.16), R.MAT_WORN, mount,
                    (-0.062 + i * 0.062, -0.062, 0), bevel=0.0))
    return mount, aimnode, m

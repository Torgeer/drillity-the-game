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
  [M1] Montabert (Komatsu) "HC 25 Hydraulic Drifter" specification sheet,
       komatsu.com .../spec-sheet/drifter-retrofits/hc25-hydraulic-drifter.pdf,
       cross-read against the range table "Montabert Hydraulic Drifters HC
       Series", 86715521-EN (09-10).  The 6-8 kW class, which is the right one
       for a 4-5 t rig: 72 kg, body 694-702 mm long WITHOUT the shank and
       779-839 WITH it, 200 mm wide, 191.5 mm high, 83.5 mm of that above the
       shank axis; 3 900 bpm; 117 J; percussion 150 bar at 65 l/min; rotation
       300 rpm at 251-401 Nm; shanks female R32, male R32, male R38; water
       flushing 20-50 l/min; front-end lubricating air 300 l/min at 3 bar.
       Sanity check on the class: the 14-16 kW drifters go on 10 t machines, so
       fitting one here would have been a scale error of a whole weight class.
  [E1] Epiroc "Tophammer drilling tools" product catalogue (epiroc.com
       .../rock-drilling-tools/documents/Tophammer catalog.pdf).  R32 extension
       rods, round body: section 32 mm, flushing hole 11.7 mm, catalogue lengths
       915 / 1000 / 1220 / 1525 / 1830 / 2200 / 2400 / 3050 / 3660 / 4000 /
       4310 mm.  Hex 25 body: 28.4 mm across corners, 8.6 mm flush.  R32 = 1
       1/4 in.  And the distinction this model turns on: an EXTENSION rod is
       male/male and needs a separate COUPLING SLEEVE at every joint, while a
       SPEED rod is male/female and does not.
  [C1] Doosan Portable Power, "Portable Air Compressors" range specification,
       P 4443392-EN (01-12), and the matching O&M manual 46671281-A-02/15.  The
       2.5 m3/min (90 cfm) 7 bar towable: 2923 x 1390 x 1235 mm on a fixed
       drawbar, body on its subframe 1764 x 940 x 1145 mm, ground clearance
       220 mm, 575 kg net / 615 kg working, 2 x 3/4 in BSPT outlets, tyre
       155 R13 on a 4.5J x 13 wheel at 2.4 bar, jockey wheel standard.
  [C2] Atlas Copco XAS 37/47 Kd operator manual 2954 2520 40 (12/2005) — read
       for LAYOUT and for the safety rules, not for dimensions.  Its general
       arrangement puts the outlet valves and the control panel low on ONE side
       at the DRAWBAR end with the air receiver immediately behind them, the
       engine mid to rear and the cooler and radiator at the far end.  Its
       safety section states that the hose end at an outlet valve must be
       secured with a safety cable fixed next to the valve, and that no load
       may be hung on the outlet valves.  Both are modelled.
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
ROLLER_R     = 0.240   # [G2] the OUTER radius of the track band at the idler
                       # and the sprocket.  Three measurements, reconciled: the
                       # loop's front is 1015-785 = 230 ahead of the idler, its
                       # rear 2760-2522 = 238 behind the sprocket, and the band
                       # itself measures about 500 tall, i.e. a radius of 250.
                       # They disagree by 20 mm, which is inside the +/- 25 mm
                       # this drawing can resolve; 240 is the mean and it makes
                       # the loop close on itself.
SHOE_T       = 0.030   # DERIVED: link plate thickness, from the band height
GROUSER_H    = 0.022   # NOT SOURCED.  [G1] offers "steel tracks and rubber
                       # shoes" and [G3] shows the rubber-padded version, which
                       # has a low flat pad and not a grouser bar.
TRACK_TOP    = 2 * ROLLER_R             # 0.480 - the top of the track loop
TRACK_Y0     = IDLER_Y - ROLLER_R       # 0.775 - [G2] measured 0.785
TRACK_Y1     = SPROCKET_Y + ROLLER_R    # 2.755 - [G2] measured 2.760
TRACK_LEN    = TRACK_Y1 - TRACK_Y0      # 1.980 - [G2].  Note against crawler_th's
                                        # 3.75 m: this is the single clearest
                                        # size tell between the two machines.
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
DRIFTER_L    = 0.702   # [M1] body length without the shank (694-702 mm)
DRIFTER_W    = 0.200   # [M1] width
DRIFTER_H    = 0.1915  # [M1] height.  [M1] also publishes 83.5 mm of body ABOVE
                       # the shank axis, so a drifter is NOT symmetric about its
                       # own bore: it hangs mostly below the drilling line, which
                       # is the thing that is always modelled wrong.
DRIFTER_SHANK = 0.107  # DERIVED from [M1]: 809 mm overall with the shank fitted,
                       # less the 702 mm body.
SHANK_SPLINE_D = 0.1075  # [K2] 107.5 mm over the 12 spline teeth
ROD_LEN      = 1.525   # [E1] R32 extension rod, a CATALOGUE length -- the series
                       # is 915 / 1000 / 1220 / 1525 / 1830 / 2200 / 2400 / 3050.
                       # [D1]'s `rodLenM: 1.5` is this rod rounded; 1525 is the
                       # real one, and it is about the longest a person wants to
                       # lift repeatedly, which is what "hand-fed" costs.
ROD_DIA      = 0.032   # [E1] Rnd 32 body: section 32 mm, flushing hole 11.7 mm,
                       # carrying an R32 (1 1/4 in) thread.  NOT the 45 mm the
                       # procedural machine uses, which matches no R32 rod in the
                       # catalogue and was never sourced.
ROD_COUPLING_L = 0.115  # DERIVED.  [E1]: an EXTENSION rod is male/male and needs a
                       # separate COUPLING SLEEVE at every joint; a speed rod is
                       # male/female and does not.  The rack holds extension rods,
                       # so the couplings have to be in it or the string cannot be
                       # made up -- and a modeller who leaves them out has drawn a
                       # string that cannot exist.
ROD_RACK_N   = 6       # NOT SOURCED as a count.  [G3] shows a mesh-guarded RACK
                       # of loose rods at the rear -- NOT a carousel.  [R1] 4.9:
                       # rotating magazines start at 20 t machines, so a rotating
                       # carousel on a 4.5 t rig is undocumented for the class.
                       # Six 1.525 m rods is 9 m of hole, which is a morning.

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


def kill(o):
    """Delete a clone SOURCE once its copies are placed.

    `clone()` shares the source's mesh, so the source itself is just an extra
    object sitting wherever it was built — and on this machine the origin is the
    DRILL AXIS AT GROUND LEVEL, i.e. the most visible point in the whole scene.
    A forgotten source here is a track shoe lying in the collar.  The mesh data
    survives while the copies reference it, so removing the object is free.
    """
    bpy.data.objects.remove(o, do_unlink=True)


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


def lamp(name, parent, loc, aim, cone=LAMP_CONE, rng=LAMP_RANGE, watt=70,
         mesh_parent=None):
    """A work light: a housing, the stone guard a lamp needs when it lives a
    metre off a hole being drilled, and the two named nodes `src/core/env.js`
    reads EVERY FRAME to re-aim its spotlight.

    `mesh_parent` is why this takes an argument `R.worklight()` does not.  The
    housing does NOT have to be a child of the `mount:` node — a mount is a node
    the runtime reads a world position from, not a bracket.  Hanging the housing
    off it costs draw calls: `finish()` skips everything under a `pivot:` or
    `slide:`, and `weld()` cannot safely absorb a mesh whose parent is an offset
    empty, so a lamp on a moving mast would export as six separate primitives.
    Parenting the housing to the same node the mount hangs from lets it join the
    group and costs nothing.  The mount and aim nodes are untouched, so env.js
    sees exactly what it saw before.
    """
    mount, aimnode = R.worklight(name, parent, loc, aim, cone, rng)
    mount['watt_w'] = watt
    mount['colour_hex'] = 0xFFE9C0
    mp = mesh_parent if mesh_parent is not None else mount
    o = loc if mesh_parent is not None else (0.0, 0.0, 0.0)
    m = [
        bx(name + '_stalk', (0.028, 0.028, 0.13), R.MAT_DARK, mp,
           (o[0], o[1], o[2] - 0.085)),
        bx(name + '_shell', (0.20, 0.11, 0.15), R.MAT_DARK, mp,
           (o[0], o[1] + 0.02, o[2])),
        bx(name + '_lens', (0.16, 0.010, 0.11), R.MAT_GLASS, mp,
           (o[0], o[1] - 0.048, o[2])),
        bx(name + '_barH', (0.21, 0.011, 0.011), R.MAT_WORN, mp,
           (o[0], o[1] - 0.062, o[2] + 0.070), bevel=0.0),
    ]
    for i in range(3):
        m.append(bx(name + '_bar%d' % i, (0.011, 0.011, 0.16), R.MAT_WORN, mp,
                    (o[0] - 0.062 + i * 0.062, o[1] - 0.062, o[2]), bevel=0.0))
    return mount, aimnode, m


# derived once, used by the whole undercarriage: the roller axle height that
# puts the shoe's outer face on the ground and the loop's top at [G2]'s 500 mm.
# The track loop's OUTER surface has to land exactly on z = 0 and z = 0.500
# ([G2]), and the outer surface is the RUBBER PAD, not the link plate.  The
# first export got this wrong by 22 mm -- one pad thickness below grade --
# because the link centreline had been solved against the plate alone.  Caught
# by reading the exported bounding box back, not by looking at it.
AXLE_Z = TRACK_TOP / 2.0                       # 0.240, the roller axle height
SHOE_RC = AXLE_Z - GROUSER_H - SHOE_T / 2.0    # 0.213, the LINK centreline
WHEEL_R = SHOE_RC - SHOE_T / 2.0 - 0.006       # 0.192, clear inside the links
ROLLER_Z = AXLE_Z - SHOE_RC + SHOE_T / 2.0     # 0.052, the link's inner face on
                                               # the bottom run: where a bottom
                                               # roller actually rides
SHOE_N = 34                              # DERIVED: perimeter / a ~130 mm pitch,
                                         # rounded so the loop closes on whole
                                         # shoes


def _loop(t):
    """Position and roll angle at arc-length `t` around the track loop.

    The loop is a stadium: a straight bottom run from the idler to the sprocket,
    a half wrap round the sprocket, a straight top run back, a half wrap round
    the idler.  Returns (y, z, theta) where theta is the rotation about X that
    puts a shoe's outer face (its local -Z) along the outward normal.
    """
    wrap = math.pi * SHOE_RC
    if t < WHEELBASE:                                   # bottom run, front->rear
        return IDLER_Y + t, AXLE_Z - SHOE_RC, 0.0
    t -= WHEELBASE
    if t < wrap:                                        # round the sprocket
        a = t / SHOE_RC
        return (SPROCKET_Y + SHOE_RC * math.sin(a),
                AXLE_Z - SHOE_RC * math.cos(a), a)
    t -= wrap
    if t < WHEELBASE:                                   # top run, rear->front
        return SPROCKET_Y - t, AXLE_Z + SHOE_RC, math.pi
    t -= WHEELBASE
    a = t / SHOE_RC + math.pi                           # round the idler
    return (IDLER_Y + SHOE_RC * math.sin(a),
            AXLE_Z - SHOE_RC * math.cos(a), a)


# ══════════════════════════════════════════════════════════════════════════════
# 1 — UNDERCARRIAGE
#
# [R1] section 5.3 is the shape to hit: "wide, short, thin tracks under a narrow
# body -- 1400-1700 mm across on a 2000 mm track, nearly square in plan, and only
# about 390-500 mm tall.  A splayed, low, spidery stance, not an excavator
# stance."  The ratio that carries it is width : track length = 1.70 : 1.97 =
# 0.86.  crawler_th's is 2.45 : 3.75 = 0.65.  Get this wrong and the machine
# reads as a long thin sled, which is exactly the defect [R1] section 9.1
# records in the procedural build (0.39).
# ══════════════════════════════════════════════════════════════════════════════

def build_undercarriage():
    root = bpy.data.objects.new('undercarriage', None)
    C.collection.objects.link(root)
    perim = 2 * WHEELBASE + 2 * math.pi * SHOE_RC
    pitch = perim / SHOE_N

    for s in (-1, 1):
        x = s * GAUGE / 2.0
        tag = 'L' if s < 0 else 'R'

        # -- the track frame.  [G3]: a flat-sided painted box, a CONTRAST colour
        # to the body (signal red on the photographed machine against a sand
        # body), with cast tie-down loops and hazard decals along the side.
        bx('trackframe_' + tag, (FRAME_W, WHEELBASE + 0.36, 0.30), R.MAT_DARK,
           root, (x, (IDLER_Y + SPROCKET_Y) / 2, AXLE_Z + 0.045), bevel=0.014)
        # the frame's nose and tail taper down over the wheels
        for yy, sg in ((IDLER_Y, -1), (SPROCKET_Y, 1)):
            bx('trackend_%s%d' % (tag, sg), (FRAME_W, 0.24, 0.20), R.MAT_DARK,
               root, (x, yy + sg * 0.10, AXLE_Z + 0.015), bevel=0.012)

        # -- sprocket, idler, bottom rollers.  No top carrier roller: [R1]
        # section 4.8 -- a 1.5 m wheelbase is far too short to need one.
        for nm, yy in (('sprocket', SPROCKET_Y), ('idler', IDLER_Y)):
            tb('%s_%s' % (nm, tag), WHEEL_R, 0.16, R.MAT_CAST, root,
               (x - 0.08, yy, AXLE_Z), (0, math.pi / 2, 0), 14)
            tb('%s_hub_%s' % (nm, tag), 0.086, 0.19, R.MAT_WORN, root,
               (x - 0.095, yy, AXLE_Z), (0, math.pi / 2, 0), 10)
        for i in range(ROLLERS):
            yy = IDLER_Y + WHEELBASE * (i + 0.5) / ROLLERS
            tb('roller_%s%d' % (tag, i), 0.062, 0.14, R.MAT_CAST, root,
               (x - 0.07, yy, ROLLER_Z + 0.062), (0, math.pi / 2, 0), 10)

        # -- the shoes.  [G1] offers "steel tracks and rubber shoes"; [G3] shows
        # the rubber-padded steel-link version, so the pad is rubber on a steel
        # link plate.  One source mesh, 34 linked copies, one draw call.
        src_link = bx('shoe_link_' + tag, (SHOE_W, pitch * 0.94, SHOE_T),
                      R.MAT_WORN, root, (0, 0, 0), bevel=0.005, seg=1)
        src_pad = bx('shoe_pad_' + tag, (SHOE_W * 0.92, pitch * 0.80, GROUSER_H),
                     R.MAT_RUBBER, root, (0, 0, 0), bevel=0.004, seg=1)
        for i in range(SHOE_N):
            y, z, th = _loop((i + 0.5) * pitch)
            n = (math.sin(th), -math.cos(th))       # outward normal in (y, z)
            clone(src_link, (x, y, z), (th, 0, 0), root, 'shoe_%s%d' % (tag, i))
            clone(src_pad,
                  (x, y + n[0] * (SHOE_T / 2 + GROUSER_H / 2),
                   z + n[1] * (SHOE_T / 2 + GROUSER_H / 2)),
                  (th, 0, 0), root, 'pad_%s%d' % (tag, i))
        kill(src_link)
        kill(src_pad)

        # -- tie-down loops and hazard decals.  [G4] shows both on the frame
        # side; they are the difference between a painted box and a track frame.
        for i, yy in enumerate((IDLER_Y + 0.34, SPROCKET_Y - 0.34)):
            curve_to_mesh(R.hose(
                'tiedown_%s%d' % (tag, i),
                [(x + s * 0.02, yy - 0.075, AXLE_Z + 0.155),
                 (x + s * 0.075, yy, AXLE_Z + 0.215),
                 (x + s * 0.02, yy + 0.075, AXLE_Z + 0.155)],
                0.017, R.MAT_CAST, root, 6))
            hz('tiedecal_%s%d' % (tag, i), (0.006, 0.17, 0.055), root,
               (x + s * (FRAME_W / 2 + 0.004), yy + 0.16, AXLE_Z + 0.10))

    # -- the transverse gauge slide.  [G1] dimensions the undercarriage
    # 1400-1700; [R1] section 4.4 calls the retract/extend "the class's defining
    # animation" and records the transverse cylinder with its exposed chrome rod
    # visible under the belly between the two frames.  The machine is posed
    # EXTENDED, so the ram is drawn at the end of its 300 mm stroke.
    for i, yy in enumerate((IDLER_Y + 0.24, SPROCKET_Y - 0.24)):
        bx('gaugebeam%d' % i, (GAUGE + 0.10, 0.130, 0.115), R.MAT_DARK, root,
           (0, yy, TRACK_TOP - 0.045), bevel=0.010)
        # the slide tubes the frames run out on, one telescoping inside the other
        for s in (-1, 1):
            bx('gaugeslide%d%d' % (i, s), (GAUGE_RETRACT * 0.5, 0.098, 0.086),
               R.MAT_WORN, root,
               (s * (GAUGE_RETRACT * 0.25 + 0.06), yy, TRACK_TOP - 0.045),
               bevel=0.006)
    ram('gauge_ram', root, (-GAUGE / 2 + 0.09, (IDLER_Y + SPROCKET_Y) / 2, 0.335),
        (GAUGE / 2 - 0.09, (IDLER_Y + SPROCKET_Y) / 2, 0.335),
        barrel_r=0.042, rod_r=0.024)
    return root


# ══════════════════════════════════════════════════════════════════════════════
# 2 - MAIN FRAME AND BODY
#
# [G2]: a dark main frame from z 0.50 to 0.695 carrying a sand-painted
# enclosure that steps up from 1.545 at the front (the tank box) to [G1]'s
# printed 1700 over the engine.  [D1] puts a 55 kW diesel ON BOARD, which is
# the 6.2 t on-board-diesel pattern of [K1] p. 8 rather than the umbilical
# power-pack pattern of the 4.9 t and 5.6 t machines on the same page -- so this
# rig has an engine bay, a radiator and an exhaust, and no umbilical.
# ══════════════════════════════════════════════════════════════════════════════

def build_frame_and_body():
    root = bpy.data.objects.new('carrier', None)
    C.collection.objects.link(root)
    g = []
    fh = FRAME_TOP - TRACK_TOP
    fy = (FRAME_Y0 + FRAME_Y1) / 2

    # -- main frame: a welded box beam spanning the whole machine, with the
    # gauge slides passing through it.  It overhangs the track at BOTH ends
    # ([G2]: frame 0.60-3.45 against a track of 0.78-2.75), which is what puts
    # the mast carrier ahead of the front idler and the tail unit behind the
    # sprocket.
    g.append(bx('mainframe', (FRAME_INNER_W, FRAME_Y1 - FRAME_Y0, fh),
                R.MAT_DARK, root, (0, fy, TRACK_TOP + fh / 2), bevel=0.014))
    for s in (-1, 1):
        g.append(bx('framerail%d' % s, (0.115, FRAME_Y1 - FRAME_Y0 - 0.20, fh * 0.86),
                    R.MAT_DARK, root,
                    (s * (GAUGE / 2 - 0.02), fy, TRACK_TOP + fh / 2), bevel=0.010))
        # the belly plate between frame and track slide
        g.append(bx('bellyplate%d' % s, (0.30, WHEELBASE * 0.80, 0.022),
                    R.MAT_WORN, root,
                    (s * 0.42, (IDLER_Y + SPROCKET_Y) / 2, TRACK_TOP - 0.010),
                    bevel=0.004))

    # -- the frame nose.  The mast carrier bolts to this, and it is why the
    # mast's foot ends up AHEAD of the front idler and ON THE GROUND -- [R1]
    # section 5.2, the feature that makes this machine's outline an L and
    # nothing else in the fleet's a T.
    g.append(bx('framenose', (FRAME_INNER_W + 0.10, 0.30, fh + 0.10), R.MAT_DARK,
                root, (0, FRAME_Y0 + 0.11, TRACK_TOP + fh / 2 + 0.02), bevel=0.014))

    # -- low front section: fuel and hydraulic tank box, [G2] 1.130-1.900 at
    # 1.545 high.  Flat-topped, and the flat top is where the driller puts
    # things down, so it gets a punched anti-slip plate ([R1] section 4.6).
    lh = BODY_LOW_TOP - FRAME_TOP
    g.append(bx('tankbox', (BODY_W, BODY_STEP_Y - BODY_Y0, lh), R.MAT_PAINT, root,
                (0, (BODY_Y0 + BODY_STEP_Y) / 2, FRAME_TOP + lh / 2), bevel=0.014))
    g.append(bx('tankdeck', (BODY_W - 0.04, BODY_STEP_Y - BODY_Y0 - 0.04, 0.014),
                R.MAT_WORN, root,
                (0, (BODY_Y0 + BODY_STEP_Y) / 2, BODY_LOW_TOP + 0.008), bevel=0.003))
    for i, s in enumerate((-1, 1)):
        g.append(tb('filler%d' % i, 0.052, 0.045, R.MAT_CAST, root,
                    (s * 0.30, BODY_Y0 + 0.30, BODY_LOW_TOP + 0.015), (0, 0, 0), 10))

    # -- engine enclosure, [G2] 1.900-3.360 up to [G1]'s printed 1700.
    eh = BODY_TOP - FRAME_TOP
    ey = (BODY_STEP_Y + BODY_Y1) / 2
    g.append(bx('enclosure', (BODY_W, BODY_Y1 - BODY_STEP_Y, eh), R.MAT_PAINT,
                root, (0, ey, FRAME_TOP + eh / 2), bevel=0.016))
    # hinged side doors, recessed a few millimetres so the panel line reads
    for s in (-1, 1):
        for i in range(2):
            g.append(bx('door%d_%d' % (s, i), (0.012, 0.56, eh - 0.20), R.MAT_PAINT,
                        root, (s * (BODY_W / 2 + 0.004), BODY_STEP_Y + 0.36 + i * 0.62,
                               FRAME_TOP + eh / 2), bevel=0.008))
            g.append(bx('latch%d_%d' % (s, i), (0.022, 0.042, 0.062), R.MAT_DARK,
                        root, (s * (BODY_W / 2 + 0.016),
                               BODY_STEP_Y + 0.36 + i * 0.62 + 0.24,
                               FRAME_TOP + eh / 2), bevel=0.004))
        # -- louvres.  [G4] shows horizontal fins on the enclosure; they are the
        # cheapest thing on the machine that says "there is an engine in here".
        for i in range(7):
            g.append(bx('louvre%d_%d' % (s, i), (0.010, 0.30, 0.020), R.MAT_DARK,
                        root, (s * (BODY_W / 2 + 0.007), BODY_STEP_Y + 0.20,
                               FRAME_TOP + 0.22 + i * 0.075),
                        (14 * D2R, 0, 0), bevel=0.002))

    # -- radiator grille and exhaust at the rear
    for i in range(9):
        g.append(bx('grille%d' % i, (BODY_W - 0.14, 0.012, 0.026), R.MAT_DARK,
                    root, (0, BODY_Y1 + 0.008, FRAME_TOP + 0.20 + i * 0.10),
                    (16 * D2R, 0, 0), bevel=0.002))
    g.append(tb('exhaust', 0.038, 0.30, R.MAT_WORN, root,
                (-0.36, BODY_STEP_Y + 0.16, BODY_TOP - 0.02), (0, 0, 0), 10))
    g.append(tb('exhaust_cap', 0.048, 0.055, R.MAT_WORN, root,
                (-0.36, BODY_STEP_Y + 0.16, BODY_TOP + 0.27), (0, 0, 0), 10))

    # -- roof furniture.  [G4] p. 2 puts a chrome-bezel pressure gauge on a
    # manifold stand on the enclosure roof, next to a stack of valve handles.
    g.append(bx('manifold', (0.13, 0.20, 0.10), R.MAT_CAST, root,
                (0.24, ey - 0.30, BODY_TOP + 0.05), bevel=0.008))
    g.append(tb('gauge_stem', 0.016, 0.14, R.MAT_CHROME, root,
                (0.24, ey - 0.30, BODY_TOP + 0.10), (0, 0, 0), 8))
    g.append(tb('gauge_can', 0.052, 0.038, R.MAT_CHROME, root,
                (0.24, ey - 0.30, BODY_TOP + 0.24), (0, 0, 0), 14))
    g.append(tb('gauge_face', 0.044, 0.008, R.MAT_GLASS, root,
                (0.24, ey - 0.30, BODY_TOP + 0.278), (0, 0, 0), 14))
    for i in range(3):
        g.append(tb('valvehandle%d' % i, 0.020, 0.085, R.MAT_CAST, root,
                    (0.10 - i * 0.075, ey - 0.30, BODY_TOP + 0.06), (0, 0, 0), 8))

    # -- the tail unit.  [R1] section 8 lists this as NOT IDENTIFIED on the
    # drawing -- winch, hose reel, water pump or remote receiver.  It is built
    # as a HOSE REEL because this machine runs top hammer off a TOWED screw
    # compressor ([D1]) and the air line has to be stowed somewhere, but the
    # honest label is: shape sourced, function guessed.
    g.append(bx('tailbracket', (0.26, 0.22, 0.30), R.MAT_DARK, root,
                (0, TAIL_Y - 0.20, 0.980), bevel=0.010))
    g.append(tb('reel_drum', 0.130, 0.21, R.MAT_DARK, root,
                (-0.105, TAIL_Y - 0.055, 1.030), (0, math.pi / 2, 0), 14))
    for s in (-1, 1):
        g.append(tb('reel_flange%d' % s, 0.178, 0.016, R.MAT_WORN, root,
                    (s * 0.105, TAIL_Y - 0.055, 1.030), (0, math.pi / 2, 0), 16))
    # the coiled air line on the drum
    g.append(tb('reel_coil', 0.166, 0.175, R.MAT_RUBBER, root,
                (-0.088, TAIL_Y - 0.055, 1.030), (0, math.pi / 2, 0), 14))

    # -- the towing eye.  [D1]: the compressor is TOWED, so there is a hitch.
    g.append(bx('towplate', (0.24, 0.06, 0.16), R.MAT_CAST, root,
                (0, FRAME_Y1 + 0.03, 0.600), bevel=0.008))
    g.append(tb('towpin', 0.026, 0.13, R.MAT_STEEL, root,
                (0, FRAME_Y1 + 0.03, 0.530), (0, 0, 0), 10))

    # -- stabiliser jacks.  [G2] puts one at 0.690 and one at 3.160; [R1]
    # section 4.4 records FOUR with bright round pads on the photographed
    # machines, so the two drawing positions are mirrored across the machine.
    # All four are drawn DOWN and taking load: the rig is set up over a hole.
    for yy, nm in ((JACK_F_Y, 'f'), (JACK_R_Y, 'r')):
        for s in (-1, 1):
            x = s * JACK_X
            g.append(bx('jackarm_%s%d' % (nm, s), (0.30, 0.115, 0.100), R.MAT_DARK,
                        root, (s * 0.34, yy, 0.545), bevel=0.008))
            g.append(tb('jackbarrel_%s%d' % (nm, s), 0.052, 0.30, R.MAT_DARK, root,
                        (x, yy, 0.300), (0, 0, 0), 12))
            g.append(tb('jackrod_%s%d' % (nm, s), 0.030, 0.29, R.MAT_CHROME, root,
                        (x, yy, 0.020), (0, 0, 0), 10))
            g.append(tb('jackpad_%s%d' % (nm, s), JACK_PAD_R, 0.030, R.MAT_WORN,
                        root, (x, yy, 0.0), (0, 0, 0), 14))
    return root, g


# ══════════════════════════════════════════════════════════════════════════════
# 3 - THE MAST CARRIER
#
# [R1] section 4.0 records that this class splits into two mast architectures
# and that they LOOK different: a Comacchio-pattern SLIDE FRAME at the very
# front of the carrier, or a KLEMM-pattern articulated boom stack.  This model
# builds the slide frame, for three reasons: it is the architecture of the only
# dimensioned drawing in the library ([G1]); it is the cheaper machine, which is
# what a level-1 rig at 95 000 ([D1]) should be; and it is the one that puts the
# mast foot ON THE GROUND ahead of the front idler, which is the L silhouette
# that separates this machine from everything else in the fleet.
#
# It is also the opposite of crawler_th, which is a boom machine.  That is the
# point: same trade, different machine.
# ══════════════════════════════════════════════════════════════════════════════

MAST_MID = MAST_MID_Y                          # mast section centre, behind the hole
CARR_Z0 = 1.530                                # DERIVED: the carriage node sits at the
                                               # BOTTOM of its stroke, which puts the
                                               # chuck at 1.19 m over ground -- the
                                               # collaring position, one rod-stub clear
                                               # of the clamp top at [G2]'s 0.660 and
                                               # threaded through the rod guard.  At
                                               # the TOP of the 2.2 m stroke the head
                                               # tops out at 4.21 m against a mast top
                                               # of 4.34: it stays inside the mast at
                                               # both ends, which is the whole reason
                                               # the node is authored low.
CHUCK_DZ = -0.480                              # chuck below the carriage node


def build_mast_carrier():
    """The fixed slide frame on the frame nose, and the tilt ram."""
    root = bpy.data.objects.new('mast-carrier', None)
    C.collection.objects.link(root)
    g = []
    # the post: a dark fabricated column off the frame nose.  [G2] resolves it
    # between y 0.55 and 0.95 and z 0.18 to 1.52.
    g.append(bx('carrierpost', (0.46, 0.34, 1.34), R.MAT_DARK, root,
                (0, 0.760, 0.850), bevel=0.014))
    g.append(bx('carrierfoot', (0.52, 0.42, 0.22), R.MAT_DARK, root,
                (0, 0.740, 0.290), bevel=0.012))
    # the pivot ears the mast hangs on, down at [D2]'s 0.14 m
    for s in (-1, 1):
        g.append(bx('pivotear%d' % s, (0.040, 0.30, 0.30), R.MAT_CAST, root,
                    (s * 0.215, MAST_MID + 0.03, MAST_PIVOT_Z + 0.02), bevel=0.010))
    g.append(tb('pivotpin', 0.048, 0.50, R.MAT_STEEL, root,
                (-0.25, MAST_MID, MAST_PIVOT_Z), (0, math.pi / 2, 0), 12))
    # the slide guides: the mast can traverse fore and aft on these, which is
    # what "slide frame" means and how the machine spots the hole without
    # moving the tracks.  [G2] reads them as a pair of parallel beams either
    # side of the post.
    for s in (-1, 1):
        g.append(bx('slideguide%d' % s, (0.075, 0.62, 0.090), R.MAT_WORN, root,
                    (s * 0.245, 0.700, 1.230), bevel=0.006))
    # ── the mast dump ram.  [G2] draws it as one big diagonal cylinder from a
    # bracket low on the mast back down to the carrier: barrel and exposed
    # chrome rod, and it is the single most obvious hydraulic on the machine.
    g += ram('mast_dump', root, (0.0, 0.960, 1.180), (0.0, 0.700, 2.180),
             barrel_r=0.058, rod_r=0.034)
    return root, g


# ══════════════════════════════════════════════════════════════════════════════
# 4 - THE MAST
#
# Everything under `pivot:mast`.  The game ROTATES this node to rake the mast,
# so it is excluded from the static join and welded by material on its own.
#
# Local axes: +Z runs up the mast, +Y is rearward, and the DRILL AXIS is at
# local y = -MAST_MID (0.4925 m forward of the mast's centreline).  That
# offset is [G2] measured -- the mast's front face stands 345 mm behind the
# hole and the head reaches forward to it -- and it is why the crown has to
# hook forward to get a sheave over the hole at all.
# ══════════════════════════════════════════════════════════════════════════════

AX_Y = -MAST_MID                               # the drill axis, in mast-local Y


def build_mast():
    piv = R.empty(R.NODE_PIVOT, 'mast', None, (0, MAST_MID, MAST_PIVOT_Z))
    g = []
    fw = -MAST_D / 2 + PLATE_T / 2              # front plate centre
    bwp = MAST_D / 2 - PLATE_T / 2              # back plate centre
    L = MAST_LEN

    # ── the box beam: four welded plates, not a solid block.  [R1] section 4.1:
    # box section, never lattice -- lattice belongs to the big vertical rigs.
    g.append(bx('mast_front', (MAST_W, PLATE_T, L), R.MAT_PAINT, piv,
                (0, fw, L / 2), bevel=0.006))
    for s in (-1, 1):
        g.append(bx('mast_web%d' % s, (PLATE_T, MAST_D, L), R.MAT_PAINT, piv,
                    (s * (MAST_W / 2 - PLATE_T / 2), 0, L / 2), bevel=0.006))
    # ── the back plate carries the row of oval lightening slots [G3].  Solid
    # ends, slotted middle: the beam's ends are where the loads go in.
    g.append(bx('mast_back_lo', (MAST_W, PLATE_T, 0.34), R.MAT_PAINT, piv,
                (0, bwp, 0.17), bevel=0.006))
    g.append(bx('mast_back_hi', (MAST_W, PLATE_T, 0.30), R.MAT_PAINT, piv,
                (0, bwp, L - 0.15), bevel=0.006))
    g += slotted_plate('mast_slots', (MAST_W, PLATE_T, L - 0.64), SLOTS, piv,
                       (0, bwp, (L - 0.64) / 2 + 0.34), R.MAT_PAINT)

    # ── carriage rails on the FRONT face [R1] section 4.1: the carriage runs on
    # rails ON the face, not inside the section.  These are the bright wear
    # stripe of [R1] section 6 -- paint is gone here, so `rawSteel`, not paint.
    for s in (-1, 1):
        g.append(bx('mast_rail%d' % s, (0.052, 0.058, L - 0.12), R.MAT_STEEL, piv,
                    (s * 0.115, fw - 0.037, L / 2), bevel=0.005))

    # ── the foot: a fabricated shoe that puts the mast ON THE GROUND [G2], and
    # the bracket the clamp stack hangs off.
    # The pad's underside sits EXACTLY on z = 0.  Measured back out of the .glb
    # rather than assumed: the first export had it at -0.030, i.e. the mast foot
    # buried 30 mm in the ground, which on a machine whose whole silhouette is
    # "the mast reaches the ground" is the one place it must be right.
    g.append(bx('mast_foot', (MAST_W + 0.09, MAST_D + 0.10, 0.11), R.MAT_DARK, piv,
                (0, 0, -0.055), bevel=0.010))
    g.append(bx('mast_footpad', (MAST_W + 0.14, MAST_D + 0.16, 0.030), R.MAT_WORN,
                piv, (0, 0, -0.125), bevel=0.006))

    # ── feed drive.  [R1] section 4.1: feed is a hydraulic-motor-driven CHAIN,
    # not a long cylinder -- a cylinder feed would be visible on the GA and is
    # not.  So: a motor and sprocket boss at the top, an idler boss at the foot,
    # and a chain run between them on the face.
    g.append(tb('feed_motor', 0.088, 0.20, R.MAT_CAST, piv,
                (0.16, fw - 0.02, L - 0.42), (0, math.pi / 2, 0), 12))
    g.append(bx('feed_gearbox', (0.24, 0.20, 0.26), R.MAT_CAST, piv,
                (0, fw - 0.07, L - 0.42), bevel=0.010))
    g.append(tb('feed_sprocket_lo', 0.072, 0.070, R.MAT_WORN, piv,
                (-0.035, fw - 0.075, 0.18), (0, math.pi / 2, 0), 12))
    for s in (-1, 1):
        g.append(bx('feed_chain%d' % s, (0.014, 0.020, L - 0.70), R.MAT_STEEL, piv,
                    (s * 0.052, fw - 0.085, L / 2 - 0.10), bevel=0.0))

    # ── the drag chain.  [G3] shows a light plastic energy chain lying along the
    # mast carrying the head's hoses, and [R1] section 9.2 ranks it fourth by
    # visual payoff among the things the procedural machine is missing.  Built
    # as linked copies of ONE link: 30 links, one mesh, one draw call.
    link = bx('dragchain_link', (0.062, 0.075, 0.052), R.MAT_RUBBER, piv,
              (0, 0, 0), bevel=0.006, seg=1)
    dc_x = -(MAST_W / 2 + 0.045)
    for i in range(30):
        z = 0.30 + i * 0.072
        g.append(clone(link, (dc_x, 0.0, z), (0, 0, 0), piv, 'dragchain%d' % i))
    # the loop at the top where it doubles back to the carriage
    for i in range(7):
        a = math.pi * i / 6.0
        g.append(clone(link,
                       (dc_x, -0.11 * math.sin(a),
                        2.46 + 0.11 * (1 - math.cos(a))),
                       (a, 0, 0), piv, 'dragchainbend%d' % i))
    kill(link)

    # ── the crown.  [G2]: the beam stops at 4.34 m over ground and 260 mm of
    # fabricated arm hooks FORWARD over the hole above it, with a big stadium
    # slot through its web, a sheave for the feed chain, and a lifting eye.
    # [R1] section 5: "the mast overhangs the front of the tracks" and the crown
    # is a silhouette feature the procedural machine does not have at all.
    cy = fw - CROWN_REACH / 2
    g.append(bx('crown_riser', (MAST_W, MAST_D * 0.80, CROWN_H), R.MAT_PAINT, piv,
                (0, 0.02, L + CROWN_H / 2), bevel=0.008))
    # the forward arm, built as a ring so the slot is a real hole
    arm_len = CROWN_REACH + MAST_D / 2
    ay = fw - CROWN_REACH / 2 + 0.02
    for s in (-1, 1):                                   # the two web plates
        g.append(bx('crown_web%d' % s, (0.014, arm_len, 0.075), R.MAT_PAINT, piv,
                    (s * (MAST_W / 2 - 0.015), ay, L + CROWN_H - 0.045), bevel=0.005))
        g.append(bx('crown_web%d_b' % s, (0.014, arm_len, 0.070), R.MAT_PAINT, piv,
                    (s * (MAST_W / 2 - 0.015), ay, L + 0.055), bevel=0.005))
        g.append(bx('crown_webend%d' % s, (0.014, 0.060, CROWN_H), R.MAT_PAINT, piv,
                    (s * (MAST_W / 2 - 0.015), ay - arm_len / 2 + 0.030,
                     L + CROWN_H / 2), bevel=0.005))
    g.append(bx('crown_top', (MAST_W, arm_len, 0.016), R.MAT_PAINT, piv,
                (0, ay, L + CROWN_H - 0.008), bevel=0.005))
    # the feed sheave over the hole, and the lifting eye above it
    g.append(tb('crown_sheave', 0.086, 0.052, R.MAT_WORN, piv,
                (-0.026, AX_Y + 0.06, L + 0.10), (0, math.pi / 2, 0), 14))
    g.append(bx('crown_sheaveblock', (0.13, 0.15, 0.15), R.MAT_CAST, piv,
                (0, AX_Y + 0.06, L + 0.09), bevel=0.010))
    g.append(curve_to_mesh(R.hose(
        'crown_eye', [(0, ay + 0.06, L + CROWN_H),
                      (0, ay, L + CROWN_H + 0.085),
                      (0, ay - 0.06, L + CROWN_H)], 0.014, R.MAT_STEEL, piv, 6)))

    # ── the rod hoist.  [G3] shows a small winch at the crown with its rope
    # running back down the mast at a slant.  It lifts a ROD into the mast; it
    # is emphatically not a drilling winch -- [D1] is explicit that a hydraulic
    # tracked drill "has no rope drum and no walking beam", and this drum could
    # not hoist a string if it wanted to.  Every rod on this machine is still
    # lifted by hand, which is the whole character of the rig.
    g.append(bx('hoist_bracket', (0.14, 0.16, 0.16), R.MAT_DARK, piv,
                (0.20, 0.02, L - 0.78), bevel=0.008))
    g.append(tb('hoist_drum', 0.062, 0.13, R.MAT_DARK, piv,
                (0.16, 0.02, L - 0.78), (0, math.pi / 2, 0), 12))
    for s in (-1, 1):
        g.append(tb('hoist_flange%d' % s, 0.082, 0.012, R.MAT_WORN, piv,
                    (0.16 + (0 if s < 0 else 0.118), 0.02, L - 0.78),
                    (0, math.pi / 2, 0), 12))
    g.append(curve_to_mesh(R.hose(
        'hoist_rope', [(0.20, 0.02, L - 0.78),
                       (0.10, AX_Y * 0.45, L + 0.02),
                       (-0.02, AX_Y + 0.06, L + 0.06)], 0.008, R.MAT_STEEL, piv, 4)))

    # ── the rod guard.  [G3] shows a red perforated cylindrical guard over the
    # rotating rod above the clamp.  Built as a cage of bars rather than a
    # perforated shell: the same read, a tenth of the triangles, and no boolean.
    # It lives BELOW the carriage's lowest chuck position, which is what fixes
    # its length at 320 mm on this short mast.
    gz0, gz1 = 0.72 - MAST_PIVOT_Z, 1.04 - MAST_PIVOT_Z
    for i in range(8):
        a = 2 * math.pi * i / 8
        g.append(tb('rodguard_bar%d' % i, 0.008, gz1 - gz0, R.MAT_HAZARD, piv,
                    (0.115 * math.sin(a), AX_Y + 0.115 * math.cos(a), gz0),
                    (0, 0, 0), 5))
    for i, z in enumerate((gz0 + 0.02, (gz0 + gz1) / 2, gz1 - 0.02)):
        g.append(tb('rodguard_ring%d' % i, 0.125, 0.014, R.MAT_HAZARD, piv,
                    (0, AX_Y, z), (0, 0, 0), 16))
        g.append(tb('rodguard_ring%d_i' % i, 0.107, 0.016, R.MAT_HAZARD, piv,
                    (0, AX_Y, z - 0.001), (0, 0, 0), 16))
    # ...and the arm that holds it on.  A guard cage hanging in mid-air beside
    # the mast is worse than no guard: it reads as a modelling accident.
    for i, z in enumerate((gz0 + 0.05, gz1 - 0.05)):
        g.append(bx('rodguard_arm%d' % i, (0.045, MAST_D / 2 + 0.24, 0.038),
                    R.MAT_DARK, piv, (0, (AX_Y + fw) / 2 - 0.02, z), bevel=0.005))

    # ── hazard striping where a rod hits paint [R1] section 6
    g.append(hz('mast_mouth_hz', (MAST_W + 0.02, 0.010, 0.070), piv,
                (0, fw - 0.045, 0.30)))
    return piv, g


# ══════════════════════════════════════════════════════════════════════════════
# 5 - THE CARRIAGE AND THE ROTARY HEAD
#
# WHICH HEAD, AND WHY IT IS ONE AND NOT TWO.
# [K1] p. 5 and p. 13 show that this class takes rotary heads AND hydraulic
# drifters as INTERCHANGEABLE MODULES, and [R1] section 4.2 records the double
# head -- drifter above, rotary below on one carriage -- as the visual tell of
# anchor and overburden work.  A double head was tried here and does not fit:
# the stack is about 1.4 m, and on a 4.2 m mast with a 2.2 m stroke the top of
# the stroke would put it 300 mm through the crown.  That is a real constraint,
# not a modelling preference, and it is the honest answer for a machine this
# small.
#
# So the carriage carries the ROTARY head -- which is what [G1]'s own GA draws,
# and what [D1]'s 4.2 kNm torque describes (between [K1] p. 13's 3.2 and
# 5.0 kNm heads) -- and the DRIFTER is modelled where an interchangeable module
# lives when it is not fitted: stowed on a cradle on the tank deck.  That is
# also the whole story of this machine in one shape: a 4.5 t utility drill that
# can be turned into a top-hammer rig with a swap and a towed compressor.
# ══════════════════════════════════════════════════════════════════════════════

def build_carriage(piv):
    fw = -MAST_D / 2
    car = R.empty(R.NODE_SLIDE, 'carriage', piv, (0, 0, CARR_Z0))
    # THE CARRIAGE INVARIANT (gltfRig.js): `travel_m` and the node's own y are
    # read together, and a carriage missing either writes NaN into a world
    # matrix and the machine silently disappears.  Both are set, and the node is
    # authored at the BOTTOM of the stroke so that the published interval
    # [y, y + travel] keeps the head inside the mast at BOTH ends.
    car['travel_m'] = FEED_STROKE
    g = []
    # carriage plate and its slippers on the mast rails
    g.append(bx('carr_plate', (MAST_W + 0.12, 0.075, 0.52), R.MAT_DARK, car,
                (0, fw - 0.075, 0), bevel=0.010))
    for s in (-1, 1):
        g.append(bx('carr_slipper%d' % s, (0.070, 0.085, 0.56), R.MAT_CAST, car,
                    (s * 0.115, fw - 0.038, 0), bevel=0.008))
    # ── the forward bracket.  [G2] measures the head's body between -241 and
    # +157 mm of the hole while the mast face is at +345, so roughly 190 mm of
    # fabricated bracket stands between the two.  On a real machine this is also
    # the swing bracket that shifts the head aside for rod handling.
    g.append(bx('carr_bracket', (0.30, 0.30, 0.34), R.MAT_DARK, car,
                (0, fw - 0.24, 0.02), bevel=0.012))
    g.append(bx('carr_gusset', (0.26, 0.20, 0.13), R.MAT_DARK, car,
                (0, fw - 0.20, -0.20), bevel=0.008))

    # ── the rotary head.  [G2] side and front: a squat rectangular gearbox
    # 500 wide x 440 deep x 420 tall with a cylindrical motor block on top, a
    # smaller one on the side, and a tapered chuck below on the hole axis.
    # Cast, not painted: [R1] section 6 makes the head the colour accent that
    # keeps the feed stroke readable in motion, and `castIron` is a different
    # kind from the mast's `paintedSteel` without inventing a colour.
    g.append(bx('head_body', (HEAD_W, HEAD_D, HEAD_H), R.MAT_CAST, car,
                (-0.055, AX_Y, -0.09), bevel=0.014))
    g.append(tb('head_motor_a', 0.098, 0.22, R.MAT_CAST, car,
                (-0.135, AX_Y - 0.02, HEAD_H / 2 - 0.10), (0, 0, 0), 12))
    g.append(tb('head_motor_b', 0.072, 0.19, R.MAT_CAST, car,
                (-0.235, AX_Y + 0.03, -0.05), (0, math.pi / 2, 0), 12))
    # the water / flush swivel above the spindle -- this is the top of an
    # INTERNALLY FLUSHED string, which [K2] proves is what this class runs
    g.append(tb('head_swivel', 0.062, 0.19, R.MAT_WORN, car,
                (0, AX_Y, HEAD_H / 2 - 0.09), (0, 0, 0), 12))
    g.append(tb('head_swivel_gland', 0.078, 0.045, R.MAT_CHROME, car,
                (0, AX_Y, HEAD_H / 2 + 0.06), (0, 0, 0), 12))
    # the chuck and the hollow spindle.  [K1] p. 13 gives 20 / 65 / 89 mm hollow
    # shafts for the small heads in this class.
    g.append(tb('head_chuck', 0.088, 0.17, R.MAT_WORN, car,
                (0, AX_Y, CHUCK_DZ + 0.10), (0, 0, 0), 14))
    g.append(tb('head_chucknut', 0.104, 0.048, R.MAT_STEEL, car,
                (0, AX_Y, CHUCK_DZ + 0.10), (0, 0, 0), 6))
    # ── the rod in the chuck.  It has to REACH THE CLAMP.  The first render
    # stopped it 290 mm short and the machine read as parked over a hole rather
    # than collared in one — the single most expensive 290 mm on the model,
    # because the clamp, the rod guard and the mud tray all only make sense
    # with a rod actually running through them.  From the chuck at z 1.19 down
    # into the upper clamp jaw at 0.50: [E1] Rnd 32, 32 mm section.
    g.append(tb('rod_stub', ROD_DIA / 2, 0.79, R.MAT_STEEL, car,
                (0, AX_Y, CHUCK_DZ - 0.70), (0, 0, 0), 10))
    # the coupling sleeve at the joint just below the chuck: [E1] again — an
    # extension-rod string HAS a sleeve at every joint, and this is the one the
    # camera sees during a rod change.
    g.append(tb('rod_coupling', ROD_DIA * 0.80, ROD_COUPLING_L, R.MAT_WORN, car,
                (0, AX_Y, CHUCK_DZ - 0.14), (0, 0, 0), 10))
    # a bolt flange round the gearbox split line, and the two hose stubs on its
    # back face: without them the head is a box with a cylinder on it
    g.append(tb('head_flange', 0.145, 0.020, R.MAT_WORN, car,
                (-0.055, AX_Y, CHUCK_DZ + 0.19), (0, 0, 0), 14))
    for i in range(2):
        g.append(tb('head_stub%d' % i, 0.026, 0.075, R.MAT_CAST, car,
                    (-0.055 + i * 0.09, AX_Y + HEAD_D / 2, -0.06),
                    (-math.pi / 2, 0, 0), 8))

    # where the game hangs the live bit and the rest of the string
    R.empty(R.NODE_MOUNT, 'tool', car, (0, AX_Y, CHUCK_DZ))

    # ── the head's own hoses, which MUST move with it.  [G3]: black hydraulic
    # bundles with silver ferrules, plus one bright thermoplastic water hose to
    # the swivel.  They leave the head rearward into the drag chain.
    for i, xo in enumerate((-0.075, -0.025, 0.025, 0.075)):
        g.append(curve_to_mesh(R.hose(
            'head_hose%d' % i,
            [(xo - 0.10, AX_Y + 0.10, 0.02),
             (xo - 0.16, AX_Y + 0.30, -0.10),
             (-(MAST_W / 2 + 0.045), 0.0, 0.04)],
            0.017, R.MAT_RUBBER, car, 5)))
    g.append(curve_to_mesh(R.hose(
        'head_waterhose',
        [(0.02, AX_Y - 0.02, HEAD_H / 2 + 0.06),
         (0.14, AX_Y + 0.24, HEAD_H / 2 - 0.10),
         (-(MAST_W / 2 + 0.045), 0.0, 0.10)],
        0.021, R.MAT_RUBBER, car, 5)))
    return car, g


# ══════════════════════════════════════════════════════════════════════════════
# 6 - THE CLAMP AND BREAKOUT BLOCK
#
# [R1] section 9.2 ranks this FIRST by visual payoff among the things missing
# from the procedural machine: "Absent entirely.  It is the machine's business
# end."  [G2] measures it at the very bottom of the mast, at ground level and
# ahead of the track front: y -105 to +335, z 95 to 660, with horizontal
# cylinders projecting sideways out of two stacked blocks.  The lower jaw grips
# the rod in the hole; the upper one turns to break the joint.  [G1]'s own mast
# bullet measures from it -- "6m above the clamps".
#
# It is a child of `pivot:mast` because it is bolted to the mast foot and rakes
# with it, and it is where every millimetre of the wear map in [R1] section 6
# lands: "the bottom metre of the mast and the clamp block ... the dirtiest
# place on the machine by a wide margin".
# ══════════════════════════════════════════════════════════════════════════════

def build_clamp(piv):
    g = []
    cy = (CLAMP_Y0 + CLAMP_Y1) / 2 - MAST_MID          # mast-local
    depth = CLAMP_Y1 - CLAMP_Y0
    g.append(bx('clamp_arm', (0.24, 0.30, 0.20), R.MAT_DARK, piv,
                (0, -0.16, 0.30 - MAST_PIVOT_Z), bevel=0.010))
    for i, (z0, z1, nm) in enumerate(((CLAMP_Z0, 0.360, 'lower'),
                                      (0.390, CLAMP_Z1, 'upper'))):
        zc = (z0 + z1) / 2 - MAST_PIVOT_Z
        h = z1 - z0
        g.append(bx('clamp_%s' % nm, (0.42, depth, h), R.MAT_WORN, piv,
                    (0, cy, zc), bevel=0.012))
        # the two jaw cylinders, projecting sideways: the tell that this is a
        # clamp and not a box
        for s in (-1, 1):
            g.append(tb('clamp_%s_cyl%d' % (nm, s), 0.055, 0.17, R.MAT_DARK, piv,
                        (s * 0.21, cy, zc), (0, s * math.pi / 2, 0), 12))
            g.append(tb('clamp_%s_rod%d' % (nm, s), 0.028, 0.055, R.MAT_CHROME,
                        piv, (s * 0.375, cy, zc), (0, s * math.pi / 2, 0), 10))
        # the jaw insert around the hole
        g.append(tb('clamp_%s_jaw' % nm, 0.082, h * 0.66, R.MAT_STEEL, piv,
                    (0, AX_Y, zc - h * 0.33), (0, 0, 0), 12))
    # the breakout ram between the two blocks -- the upper block turns on this
    g += ram('breakout_ram', piv, (0.20, cy + 0.12, 0.210 - MAST_PIVOT_Z),
             (0.20, cy - 0.10, 0.520 - MAST_PIVOT_Z),
             barrel_r=0.036, rod_r=0.020)
    # the mud tray under it all: this is where the flush comes back out
    g.append(bx('clamp_tray', (0.60, depth + 0.18, 0.045), R.MAT_WORN, piv,
                (0, cy, CLAMP_Z0 - MAST_PIVOT_Z - 0.030), bevel=0.006))
    g.append(hz('clamp_hz', (0.44, 0.010, 0.055), piv,
                (0, cy - depth / 2 - 0.006, CLAMP_Z1 - MAST_PIVOT_Z - 0.045)))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 7 - THE OPERATOR STATION
#
# There is no cab, and that absence is the machine's identity.  [R1] section
# 4.7: below roughly 6 t this class has no cab at all; [K1]'s photo plate shows
# machines with no cab and no canopy, just a low box.  A small crawler with a
# nice cab is a different and much more expensive machine, and giving this one a
# cab would make the game's whole progression meaningless.
#
# What it has instead is the CONSOLE, and [G4] p. 2 and p. 10 show exactly what
# that is: a sand sheet-steel box on the machine's side at working-hand height,
# a raised strip carrying four chrome-bezel pressure gauges, two rows of black
# lever handles, knurled chrome relief-valve adjusters on the top deck, a
# tubular guard rail bent over the levers so they cannot be knocked, and a big
# shaped splash shield hanging below to keep the flush off the driller's legs.
#
# Over it goes the CANOPY.  [D1] says "an open canopy and a heater that works
# when it feels like it", and content is authority.  It is a roof on posts:
# no walls, no doors, NO GLASS.  [R1] section 9.3 records that the procedural
# machine's glazed pane is invisible from every angle and paid a full render
# pass for nothing, and here the domain answer and the performance answer agree.
#
# It is on the machine's +X side because that is the side the hero camera in
# `renderer.js` looks at, and because a driller has to see the collar while his
# hands are on the levers.  Its exact position is DERIVED from that; only its
# shape is sourced.
# ══════════════════════════════════════════════════════════════════════════════

def build_operator_station(root):
    g = []
    cx = 0.720                                  # DERIVED: outboard of the track
    cy = CONSOLE_Y
    # -- support bracket off the frame rail
    g.append(bx('console_arm', (0.34, 0.14, 0.085), R.MAT_DARK, root,
                (0.52, cy, 0.760), bevel=0.008))
    g.append(bx('console_post', (0.075, 0.13, 0.36), R.MAT_DARK, root,
                (cx, cy, 0.780), bevel=0.008))
    # -- the console body and its canted control panel
    g.append(bx('console_body', (0.34, CONSOLE_L, 0.30), R.MAT_PAINT, root,
                (cx, cy, CONSOLE_Z + 0.02), bevel=0.012))
    g.append(bx('console_panel', (0.32, CONSOLE_L - 0.03, 0.045), R.MAT_PAINT,
                root, (cx, cy, CONSOLE_Z + 0.185), (0, CONSOLE_TILT, 0),
                bevel=0.008))
    ptop = CONSOLE_Z + 0.205
    # -- the lever bank: [G4] resolves two rows of six black handles
    for r in range(2):
        for i in range(LEVERS // 2):
            ly = cy - CONSOLE_L / 2 + 0.20 + i * 0.105
            lx = cx - 0.055 + r * 0.105
            dz = (lx - cx) * math.tan(CONSOLE_TILT)
            g.append(tb('lever%d_%d' % (r, i), 0.010, 0.135, R.MAT_STEEL, root,
                        (lx, ly, ptop + dz), (0, 0.16 - r * 0.10, 0), 6))
            g.append(tb('leverknob%d_%d' % (r, i), 0.019, 0.052, R.MAT_RUBBER,
                        root, (lx + 0.022, ly, ptop + dz + 0.130),
                        (0, 0.16 - r * 0.10, 0), 8))
    # -- the gauge strip: four chrome-bezel gauges on a raised plinth [G4]
    g.append(bx('gauge_plinth', (0.30, 0.22, 0.085), R.MAT_PAINT, root,
                (cx, cy - CONSOLE_L / 2 + 0.11, ptop + 0.020), bevel=0.008))
    for i in range(GAUGES):
        gx = cx - 0.105 + (i % 2) * 0.145
        gy = cy - CONSOLE_L / 2 + 0.06 + (i // 2) * 0.105
        g.append(tb('cgauge%d' % i, 0.040, 0.030, R.MAT_CHROME, root,
                    (gx, gy, ptop + 0.060), (0, 0, 0), 12))
        g.append(tb('cgaugeface%d' % i, 0.033, 0.007, R.MAT_GLASS, root,
                    (gx, gy, ptop + 0.088), (0, 0, 0), 12))
    # -- knurled chrome relief-valve adjusters on the top deck [G4]
    for i in range(3):
        g.append(tb('relief%d' % i, 0.017, 0.055, R.MAT_CHROME, root,
                    (cx + 0.115, cy + 0.10 + i * 0.085, ptop + 0.030), (0, 0, 0), 10))
    # -- the guard rail bent over the levers.  [G4]: it exists so a passing hip
    # cannot start the rotation.
    for s in (-1, 1):
        g.append(tb('railpost%d' % s, 0.013, 0.20, R.MAT_WORN, root,
                    (cx + 0.145, cy + s * (CONSOLE_L / 2 - 0.10), ptop),
                    (0, 0, 0), 6))
    curve_to_mesh(R.hose('console_rail',
                         [(cx + 0.145, cy - CONSOLE_L / 2 + 0.10, ptop + 0.19),
                          (cx + 0.165, cy, ptop + 0.215),
                          (cx + 0.145, cy + CONSOLE_L / 2 - 0.10, ptop + 0.19)],
                         0.013, R.MAT_WORN, root, 6))
    # -- the splash shield [G4]: a big shaped plate hanging below the console
    g.append(bx('splash_shield', (0.016, CONSOLE_L + 0.06, 0.42), R.MAT_PAINT,
                root, (cx + 0.155, cy, 0.760), bevel=0.008))
    g.append(bx('splash_lip', (0.075, CONSOLE_L + 0.06, 0.016), R.MAT_PAINT, root,
                (cx + 0.120, cy, 0.552), bevel=0.006))

    # -- the canopy.  NOT SOURCED for this class; required by [D1].  Two posts
    # off the frame rail and a flat roof with a turned-down lip, 2.24 m over
    # grade so a standing driller clears it.  A brace back to the enclosure
    # stops it flapping, which is the detail that makes a canopy read as bolted
    # on rather than floated in.
    for i, py in enumerate((cy - 0.60, cy + 0.62)):
        g.append(tb('canopy_post%d' % i, 0.030, CANOPY_Z - 0.72, R.MAT_PAINT,
                    root, (cx + 0.030, py, 0.720), (0, 0, 0), 8))
        g.append(bx('canopy_shoe%d' % i, (0.10, 0.10, 0.045), R.MAT_DARK, root,
                    (cx + 0.030, py, 0.720), bevel=0.006))
    g.append(bx('canopy_roof', (0.88, 1.44, 0.030), R.MAT_PAINT, root,
                (cx - 0.140, cy + 0.01, CANOPY_Z + 0.015), bevel=0.008))
    for s in (-1, 1):
        g.append(bx('canopy_lip%d' % s, (0.88, 0.026, 0.055), R.MAT_PAINT, root,
                    (cx - 0.140, cy + 0.01 + s * 0.707, CANOPY_Z - 0.012),
                    bevel=0.005))
    g.append(bx('canopy_lipo', (0.026, 1.44, 0.055), R.MAT_PAINT, root,
                (cx + 0.287, cy + 0.01, CANOPY_Z - 0.012), bevel=0.005))
    curve_to_mesh(R.hose('canopy_brace',
                         [(cx + 0.030, cy + 0.62, CANOPY_Z - 0.06),
                          (cx - 0.180, cy + 0.80, CANOPY_Z - 0.22),
                          (BODY_W / 2 - 0.02, cy + 0.92, BODY_TOP - 0.02)],
                         0.017, R.MAT_PAINT, root, 6))
    # -- the heater.  [D1] names it, so it is on the machine: a small box under
    # the canopy on the body side with a duct pointed at where the driller's
    # hands are.  It is the cheapest possible piece of characterisation and it
    # is the one line of the rig's description a player will remember.
    g.append(bx('heater', (0.22, 0.26, 0.24), R.MAT_PAINT, root,
                (BODY_W / 2 + 0.11, cy + 0.44, 1.860), bevel=0.010))
    g.append(tb('heater_duct', 0.052, 0.24, R.MAT_RUBBER, root,
                (BODY_W / 2 + 0.11, cy + 0.36, 1.780), (0.9, 0, 0), 8))
    for i in range(4):
        g.append(bx('heater_grille%d' % i, (0.016, 0.20, 0.020), R.MAT_DARK, root,
                    (BODY_W / 2 + 0.222, cy + 0.44, 1.790 + i * 0.045),
                    (12 * D2R, 0, 0), bevel=0.002))
    # -- a step, because the deck is 695 mm up and [R1] section 4.6 is explicit
    # that at this height you STEP UP, you do not climb: the procedural
    # machine's 0.52 m ladder is scale-confusion, so there is no ladder here.
    g.append(bx('step', (0.30, 0.22, 0.022), R.MAT_WORN, root,
                (0.68, cy + 0.86, 0.400), bevel=0.004))
    g.append(bx('step_arm', (0.26, 0.055, 0.055), R.MAT_DARK, root,
                (0.58, cy + 0.86, 0.420), bevel=0.006))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 8 - HAND-FED RODS: A RACK, NOT A CAROUSEL
#
# [D1] says "hand-fed rods".  [R1] section 4.9 and section 9.3 say the same
# thing from the other end: [G3] shows a mesh-guarded RACK of loose rods, and
# rotating magazines are quoted by [K1]'s maker only for 20 t machines.  The
# procedural build gives this rig a four-rod rotating carousel with a transfer
# arm, which [R1] calls "generous for 5 t" and which is not documented anywhere
# for this class.  So: a rack, six 1.5 m rods, and a pair of hands.
#
# The rack is on the -X side, opposite the console, because a driller who works
# from +X does not want a rod rack between him and his levers.  That placement
# is DERIVED; the rack-instead-of-carousel is sourced.
# ══════════════════════════════════════════════════════════════════════════════

def build_rod_rack(root):
    g = []
    rx = -(BODY_W / 2 + 0.20)
    y0, y1 = 1.180, 1.180 + ROD_LEN
    for i, ry in enumerate((y0 + 0.16, y1 - 0.16)):
        g.append(bx('rack_arm%d' % i, (0.34, 0.075, 0.060), R.MAT_DARK, root,
                    (rx + 0.10, ry, 1.020), bevel=0.006))
        g.append(bx('rack_upright%d' % i, (0.055, 0.075, 0.42), R.MAT_DARK, root,
                    (rx - 0.075, ry, 1.230), bevel=0.006))
        g.append(bx('rack_lip%d' % i, (0.030, 0.075, 0.10), R.MAT_DARK, root,
                    (rx + 0.245, ry, 1.095), bevel=0.005))
    # the mesh back, welded wire in a bolted frame -- the guarding idiom of this
    # class ([R1] section 4.6): mesh, not plate and not perforated sheet
    for i in range(7):
        g.append(bx('rackmesh_v%d' % i, (0.008, 0.008, 0.36), R.MAT_WORN, root,
                    (rx - 0.075, y0 + 0.16 + i * (ROD_LEN - 0.32) / 6, 1.235),
                    bevel=0.0))
    for i in range(4):
        g.append(bx('rackmesh_h%d' % i, (0.008, ROD_LEN - 0.30, 0.008), R.MAT_WORN,
                    root, (rx - 0.075, (y0 + y1) / 2, 1.075 + i * 0.107), bevel=0.0))
    # ── the rods themselves, two rows of three.  [E1] Rnd 32 body, 32 mm
    # section, R32 male thread at BOTH ends -- these are extension rods, so the
    # ends are the wear and the middle is bare bright steel ([R1] section 6 puts
    # the wear on the ends, not the middle).
    rod = tb('rod_src', ROD_DIA / 2, ROD_LEN, R.MAT_STEEL, root,
             (0, 0, 0), (math.pi / 2, 0, 0), 10)
    thr = tb('rodthread_src', ROD_DIA * 0.80, 0.070, R.MAT_WORN, root,
             (0, 0, 0), (math.pi / 2, 0, 0), 8)
    for r in range(2):
        for i in range(ROD_RACK_N // 2):
            x = rx + 0.03 + i * (ROD_DIA + 0.018)
            z = 1.075 + r * (ROD_DIA + 0.014)
            clone(rod, (x, y1, z), (math.pi / 2, 0, 0), root, 'rod%d_%d' % (r, i))
            clone(thr, (x, y1, z), (math.pi / 2, 0, 0), root, 'rodthr%d_%d' % (r, i))
            clone(thr, (x, y0 + 0.070, z), (math.pi / 2, 0, 0), root,
                  'rodthrb%d_%d' % (r, i))
    kill(rod)
    kill(thr)
    # ── and the coupling sleeves, in a tray at the rack's near end.  [E1]: an
    # extension rod is male/male, so a string of them does not exist without a
    # sleeve at every joint.  A rack of rods and no couplings is a rack that
    # cannot make a hole, and it is the kind of thing this file exists to catch.
    g.append(bx('coupling_tray', (0.24, 0.20, 0.055), R.MAT_DARK, root,
                (rx + 0.09, y0 - 0.20, 1.030), bevel=0.006))
    for i in range(4):
        g.append(tb('coupling%d' % i, ROD_DIA * 0.80, ROD_COUPLING_L, R.MAT_WORN,
                    root, (rx + 0.02 + (i % 2) * 0.06, y0 - 0.26 + (i // 2) * 0.07,
                           1.062 + (i // 2) * 0.001), (math.pi / 2, 0, 0), 8))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 9 - THE STOWED DRIFTER, AND WHY IT IS ON THE DECK AND NOT ON THE MAST
#
# [K1] p. 5 sells rotary heads and hydraulic drifters for this class as
# INTERCHANGEABLE MODULES.  Section 5 above explains why only one of them can be
# on the carriage of a 4.2 m mast.  So the other one is where a spare module
# actually lives: strapped to a cradle on the tank deck, next to the rods.
#
# This is the shape that makes `top-hammer` believable on a 4.5 t machine and it
# is the second half of the sentence the towing hitch, the air reel and the
# towed compressor start.
#
# Dimensions are [M1], a published spec sheet for a 6-8 kW drifter -- which is
# the right power class for a 4-5 t rig, and worth stating because it is
# routinely got wrong: the 14-16 kW drifters go on 10 t machines.  702 x 200 x
# 191.5 mm, 72 kg, R32 or R38 shank, 3 900 bpm, rotation 300 rpm at 251-401 Nm.
#
# SHAPE, from [M1]'s drawings and the drifter photography behind them: a long,
# low, flat body, roughly 3.5 : 1 in plan and 3.7 : 1 in elevation, built from
# BOLTED MODULES along its length, not one casting.  Front to back: a protruding
# splined shank, the front head, a flushing head that is a separate block on the
# SIDE, the rotation housing with a big round motor boss standing proud of one
# flank about two thirds back, the long percussion cylinder, and a back head
# carrying two cylindrical accumulator caps and a cluster of port stubs.  The
# hoses all leave the BACK in a bundle -- nothing significant enters at the
# front, which is shank and flushing only.  And [M1]'s "83.5 mm above the shank
# axis" says the body hangs mostly BELOW the drilling line.
# ══════════════════════════════════════════════════════════════════════════════

def build_stowed_drifter(root):
    g = []
    dx = -0.235
    dy = (BODY_Y0 + BODY_STEP_Y) / 2
    dz = BODY_LOW_TOP + 0.135
    fr = dy - DRIFTER_L / 2                     # the drifter's nose end
    bk = dy + DRIFTER_L / 2                     # its back head
    # percussion cylinder: the long middle module
    g.append(bx('drifter_cyl', (DRIFTER_W, DRIFTER_L * 0.54, DRIFTER_H),
                R.MAT_CAST, root, (dx, dy - 0.02, dz), bevel=0.016))
    # front head (shank bearing and chuck), stepped down from the cylinder
    g.append(bx('drifter_fronthead', (DRIFTER_W * 0.92, DRIFTER_L * 0.24,
                                      DRIFTER_H * 0.86), R.MAT_CAST, root,
                (dx, fr + DRIFTER_L * 0.12, dz - 0.010), bevel=0.014))
    # the flushing head: a separate block on the SIDE, not on top
    g.append(bx('drifter_flushhead', (0.075, 0.115, 0.105), R.MAT_CAST, root,
                (dx + DRIFTER_W / 2 + 0.030, fr + DRIFTER_L * 0.26, dz - 0.012),
                bevel=0.008))
    # the splined shank: [K2], 107.5 mm over 12 teeth, projecting [M1]'s 107 mm
    g.append(tb('drifter_shank', SHANK_SPLINE_D / 2, DRIFTER_SHANK, R.MAT_STEEL,
                root, (dx, fr, dz - 0.012), (-math.pi / 2, 0, 0), 12))
    # rotation housing and its side motor boss, two thirds back
    g.append(bx('drifter_rothousing', (DRIFTER_W * 0.98, 0.135, DRIFTER_H * 0.96),
                R.MAT_CAST, root, (dx, fr + DRIFTER_L * 0.40, dz), bevel=0.012))
    g.append(tb('drifter_rotmotor', 0.072, 0.135, R.MAT_CAST, root,
                (dx - DRIFTER_W / 2, fr + DRIFTER_L * 0.40, dz),
                (0, -math.pi / 2, 0), 12))
    g.append(tb('drifter_rotmotor_end', 0.048, 0.032, R.MAT_DARK, root,
                (dx - DRIFTER_W / 2 - 0.135, fr + DRIFTER_L * 0.40, dz),
                (0, -math.pi / 2, 0), 10))
    # back head: two accumulator caps and the port cluster the hoses leave from
    g.append(bx('drifter_backhead', (DRIFTER_W * 0.94, 0.105, DRIFTER_H * 0.92),
                R.MAT_CAST, root, (dx, bk - 0.045, dz), bevel=0.012))
    for i, off in enumerate((-0.048, 0.048)):
        g.append(tb('drifter_accum%d' % i, 0.038, 0.090, R.MAT_DARK, root,
                    (dx + off, bk + 0.005, dz - 0.020), (-math.pi / 2, 0, 0), 10))
    for i in range(6):
        g.append(tb('drifter_port%d' % i, 0.014, 0.045, R.MAT_WORN, root,
                    (dx - 0.062 + (i % 3) * 0.062, bk - 0.010,
                     dz - 0.055 + (i // 3) * 0.048), (-math.pi / 2, 0, 0), 6))
    # the cradle and its strap
    for i, off in enumerate((-0.21, 0.21)):
        g.append(bx('drifter_cradle%d' % i, (DRIFTER_W + 0.10, 0.055, 0.105),
                    R.MAT_DARK, root, (dx, dy + off, dz - DRIFTER_H / 2 - 0.030),
                    bevel=0.006))
        g.append(bx('drifter_strap%d' % i, (DRIFTER_W + 0.03, 0.030, 0.010),
                    R.MAT_RUBBER, root, (dx, dy + off, dz + DRIFTER_H / 2 + 0.008),
                    bevel=0.0))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 10 - GUARDING
#
# [R1] section 4.6: welded wire-mesh panels in a bolted tube frame are the
# dominant guarding idiom on this class -- mesh, NOT plate and NOT perforated
# sheet -- and [G4] shows a full mesh cage on the drill side.  Built on -X so it
# silhouettes behind the mast instead of standing between the hero camera and
# the clamp, and kept low: at 1700 mm of body there is no walkway to guard, and
# a full catwalk would be wrong for 4.5 t ([R1] section 4.6).
# ══════════════════════════════════════════════════════════════════════════════

def build_guards(root):
    g = []
    gx = -0.615
    z0, z1 = 0.640, 1.780
    y0, y1 = -0.060, 0.880
    for py in (y0, y1):
        g.append(tb('cage_post%.0f' % (py * 100), 0.020, z1 - z0, R.MAT_PAINT,
                    root, (gx, py, z0), (0, 0, 0), 8))
    for pz in (z0 + 0.02, z1 - 0.02):
        g.append(bx('cage_rail%.0f' % (pz * 100), (0.040, y1 - y0, 0.040),
                    R.MAT_PAINT, root, (gx, (y0 + y1) / 2, pz), bevel=0.006))
    # the feet that bolt it to the frame nose.  [G4]'s cage is a BOLTED tube
    # frame, and a mesh panel floating at chest height reads as a signboard.
    for py in (y0, y1):
        g.append(bx('cage_foot%.0f' % (py * 100), (0.085, 0.085, 0.022),
                    R.MAT_DARK, root, (gx, py, z0 - 0.010), bevel=0.004))
        g.append(bx('cage_leg%.0f' % (py * 100), (0.045, 0.045, z0 - 0.60),
                    R.MAT_PAINT, root, (gx, py, z0 - (z0 - 0.60) / 2), bevel=0.005))
        g.append(bx('cage_tie%.0f' % (py * 100), (0.34, 0.045, 0.045), R.MAT_DARK,
                    root, (gx + 0.17, py, 0.640), bevel=0.005))
    for i in range(8):
        g.append(bx('cagemesh_v%d' % i, (0.007, 0.007, z1 - z0 - 0.06),
                    R.MAT_WORN, root,
                    (gx, y0 + 0.06 + i * (y1 - y0 - 0.12) / 7, (z0 + z1) / 2),
                    bevel=0.0))
    for i in range(9):
        g.append(bx('cagemesh_h%d' % i, (0.007, y1 - y0 - 0.05, 0.007),
                    R.MAT_WORN, root,
                    (gx, (y0 + y1) / 2, z0 + 0.07 + i * (z1 - z0 - 0.14) / 8),
                    bevel=0.0))
    g.append(hz('cage_hz', (0.042, 0.22, 0.050), root, (gx, y1 - 0.13, z1 + 0.03)))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 11 - THE TOWED SCREW COMPRESSOR
#
# [D1]: "With a drifter on the mast and a towed screw compressor this little
# machine will drill rock -- which is exactly how small contractors get into top
# hammer without buying a surface crawler."  That sentence is the machine's
# whole economic argument, and it is a SHAPE: a 4.5 t hydraulic drill has no
# compressor on board (crawler_th does, and that is one of the things that makes
# crawler_th a 15.6 t machine), so the flushing air arrives on a trailer.
#
# Sized to the drifter, not to taste.  [M1]'s 6-8 kW class wants a couple of
# m3/min of flushing air, which lands squarely on the smallest towable rotary
# screw class -- so the dimensions here are [C1]'s published 2.5 m3/min machine,
# every one of them a printed figure:
#     towed, fixed drawbar   2923 x 1390 x 1235 mm
#     body on its subframe   1764 x  940 x 1145 mm
#     ground clearance       220 mm
#     tyre                   155 R13   (OD 584 mm by the tyre designation:
#                                       330.2 mm rim + 2 x 82 % of 155)
#     weight                 575 kg net, 615 kg working
#     outlets                2 x 3/4 in BSPT
#     jockey wheel           standard
# and the LAYOUT is [C2]: outlet valves and the control panel grouped low on one
# side AT THE DRAWBAR END, air receiver immediately behind them, engine mid to
# rear, oil cooler and radiator at the far end, exhaust out the rear underside.
# The canopy is a one-piece bonnet hinged at the drawbar end.
#
# The whipcheck is not decoration: [C2] states as a safety rule that the hose end
# at an outlet valve MUST be secured by a safety cable anchored next to the
# valve, and that no load may be hung on the valves.  It is two seconds of
# geometry and it is the difference between a machine drawn by someone who has
# read the manual and one that has not.
# ══════════════════════════════════════════════════════════════════════════════

COMP_L, COMP_W, COMP_H = 2.923, 1.390, 1.235   # [C1] towed, fixed drawbar
CB_L, CB_W, CB_H = 1.764, 0.940, 1.145         # [C1] body on its subframe
COMP_CLEAR = 0.220                             # [C1] ground clearance
TYRE_OD, TYRE_W = 0.584, 0.155                 # [C1] 155 R13, OD by designation
COMP_EYE_Y = FRAME_Y1 + 0.03                   # the rig's tow pin


def build_compressor(root):
    g = []
    # the drawbar eye sits on the rig's hitch, and the unit runs back from it.
    # [C1]'s 2923 towed against a 1764 body leaves 1159 mm of drawbar and
    # overhang, so the body's nose lands here:
    by0 = COMP_EYE_Y + (COMP_L - CB_L)
    byc = by0 + CB_L / 2
    bz0 = COMP_CLEAR
    bzc = bz0 + CB_H / 2

    # ── chassis and drawbar
    g.append(bx('comp_chassis', (0.62, CB_L + 0.16, 0.105), R.MAT_DARK, root,
                (0, byc, bz0 - 0.020), bevel=0.010))
    for s in (-1, 1):
        g.append(bx('comp_rail%d' % s, (0.075, CB_L + 0.10, 0.090), R.MAT_DARK,
                    root, (s * 0.38, byc, bz0 - 0.015), bevel=0.008))
    g.append(bx('comp_drawbar', (0.115, COMP_L - CB_L - 0.10, 0.100), R.MAT_DARK,
                root, (0, COMP_EYE_Y + (COMP_L - CB_L) / 2 - 0.02, 0.530),
                bevel=0.010))
    curve_to_mesh(R.hose('comp_eye',
                         [(0, COMP_EYE_Y + 0.075, 0.530),
                          (0, COMP_EYE_Y - 0.010, 0.565),
                          (0, COMP_EYE_Y + 0.075, 0.600)],
                         0.020, R.MAT_CAST, root, 6))
    # the jockey wheel, [C1] standard on this size
    g.append(tb('comp_jockey_leg', 0.028, 0.34, R.MAT_CHROME, root,
                (0.10, COMP_EYE_Y + 0.42, 0.190), (0, 0, 0), 8))
    g.append(bx('comp_jockey_clamp', (0.10, 0.10, 0.13), R.MAT_DARK, root,
                (0.10, COMP_EYE_Y + 0.42, 0.520), bevel=0.008))
    g.append(tb('comp_jockey_wheel', 0.095, 0.055, R.MAT_RUBBER, root,
                (0.072, COMP_EYE_Y + 0.42, 0.095), (0, math.pi / 2, 0), 12))

    # ── running gear: single axle, one 155 R13 each side
    g.append(tb('comp_axle', 0.032, 0.86, R.MAT_DARK, root,
                (-0.43, byc + 0.10, TYRE_OD / 2), (0, math.pi / 2, 0), 8))
    for s in (-1, 1):
        g.append(tb('comp_tyre%d' % s, TYRE_OD / 2, TYRE_W, R.MAT_RUBBER, root,
                    (s * (0.43 - (TYRE_W if s > 0 else 0)), byc + 0.10, TYRE_OD / 2),
                    (0, math.pi / 2, 0), 18))
        g.append(tb('comp_rim%d' % s, 0.168, TYRE_W * 0.55, R.MAT_WORN, root,
                    (s * (0.45 - (TYRE_W * 0.55 if s > 0 else 0)), byc + 0.10,
                     TYRE_OD / 2), (0, math.pi / 2, 0), 14))
        g.append(bx('comp_mudguard%d' % s, (0.030, 0.78, 0.42), R.MAT_PAINT, root,
                    (s * 0.475, byc + 0.10, TYRE_OD / 2 + 0.08), bevel=0.008))

    # ── the canopy: a one-piece bonnet, [C1]'s 1764 x 940 x 1145 body
    g.append(bx('comp_canopy', (CB_W, CB_L, CB_H), R.MAT_PAINT, root,
                (0, byc, bzc), bevel=0.030))
    # the shut line of the bonnet, which is what makes it read as a lid
    g.append(bx('comp_shutline', (CB_W + 0.006, CB_L + 0.006, 0.012), R.MAT_DARK,
                root, (0, byc, bz0 + CB_H * 0.58), bevel=0.003))
    for s in (-1, 1):                                   # lifting/latch handles
        g.append(bx('comp_latch%d' % s, (0.020, 0.13, 0.055), R.MAT_DARK, root,
                    (s * (CB_W / 2 + 0.010), byc - CB_L / 2 + 0.20,
                     bz0 + CB_H * 0.50), bevel=0.005))
    # the single-point lifting eye through the roof
    curve_to_mesh(R.hose('comp_lifteye',
                         [(0, byc - 0.06, bz0 + CB_H),
                          (0, byc, bz0 + CB_H + 0.075),
                          (0, byc + 0.06, bz0 + CB_H)], 0.014, R.MAT_STEEL, root, 6))
    # cooling louvres at the FAR end -- [C2] puts the cooler and radiator there
    for i in range(7):
        g.append(bx('comp_louvre%d' % i, (CB_W - 0.16, 0.010, 0.022), R.MAT_DARK,
                    root, (0, byc + CB_L / 2 + 0.006,
                           bz0 + 0.24 + i * 0.105), (16 * D2R, 0, 0), bevel=0.002))
    g.append(tb('comp_exhaust', 0.030, 0.16, R.MAT_WORN, root,
                (0.24, byc + CB_L / 2 - 0.10, bz0 - 0.14), (0, 0, 0), 8))

    # ── the service side: [C2] groups outlets, gauges and the starter low on one
    # side at the DRAWBAR end.  Two 3/4 in ball valves [C1].
    px = -(CB_W / 2 + 0.012)
    py = byc - CB_L / 2 + 0.30
    g.append(bx('comp_panel', (0.024, 0.34, 0.26), R.MAT_DARK, root,
                (px, py, bz0 + 0.78), bevel=0.006))
    for i in range(2):
        g.append(tb('comp_pgauge%d' % i, 0.036, 0.026, R.MAT_CHROME, root,
                    (px - 0.014, py - 0.09 + i * 0.17, bz0 + 0.86), (0, 0, 0), 12))
        g.append(tb('comp_pgaugeface%d' % i, 0.029, 0.007, R.MAT_GLASS, root,
                    (px - 0.038, py - 0.09 + i * 0.17, bz0 + 0.86), (0, 0, 0), 12))
    for i in range(2):
        vy = py - 0.07 + i * 0.15
        g.append(tb('comp_outlet%d' % i, 0.030, 0.11, R.MAT_CAST, root,
                    (px, vy, bz0 + 0.42), (0, -math.pi / 2, 0), 10))
        g.append(tb('comp_valvehandle%d' % i, 0.012, 0.11, R.MAT_STEEL, root,
                    (px - 0.075, vy, bz0 + 0.42), (0.9, 0, 0), 6))

    # ── the air line to the rig, off the LOWER outlet, and the whipcheck [C2]
    g.append(curve_to_mesh(R.hose(
        'comp_airhose',
        [(px - 0.10, py - 0.07, bz0 + 0.42),
         (px - 0.26, by0 - 0.35, 0.135),
         (-0.30, TAIL_Y + 0.30, 0.190),
         (0.235, TAIL_Y + 0.12, 0.860)], 0.030, R.MAT_RUBBER, root, 6)))
    curve_to_mesh(R.hose('comp_whipcheck',
                         [(px - 0.030, py - 0.07, bz0 + 0.36),
                          (px - 0.115, py - 0.11, bz0 + 0.30),
                          (px - 0.150, py - 0.07, bz0 + 0.40)],
                         0.006, R.MAT_STEEL, root, 4))
    hz('comp_hz', (0.024, 0.30, 0.055), root,
       (CB_W / 2 + 0.012, byc - CB_L / 2 + 0.18, bz0 + 0.94))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 12 - SERVICES: HOSE, AIR AND LIGHT
#
# [R1] section 4.5: "This class is covered in hose and that is a large part of
# how it reads."  Three routes, all from [G3]:
#   - the TIDY route, the drag chain up the mast, already built in section 4;
#   - the UNTIDY route, a loose bight of hose hanging in a catenary between the
#     deck and the mast foot, which is the truth and which swings when the mast
#     tilts;
#   - one large-bore bright thermoplastic WATER hose from the body forward and
#     up to the swivel.
# Plus the AIR line, which is this machine's own story: [D1] runs top hammer off
# a TOWED screw compressor, so a big air hose leaves the reel on the tail,
# runs the length of the machine and goes up the mast.  A hydraulic rig with an
# air hose down its side and no compressor on board is a rig that arrives with
# something behind it.
# ══════════════════════════════════════════════════════════════════════════════

def build_services(carrier, piv):
    """Returns (static_objs, mast_objs).  The split matters: anything parented
    to `pivot:mast` is invisible to `finish()`'s static join and has to be
    handed back so `build()` can weld it into the mast group instead."""
    g = []
    mg = []
    # the untidy bight: deck to mast foot, in catenary
    for i, (x, r) in enumerate(((0.16, 0.026), (0.06, 0.024), (-0.05, 0.026),
                                (-0.15, 0.022))):
        g.append(curve_to_mesh(R.hose(
            'bight%d' % i,
            [(x, BODY_Y0 - 0.02, 1.230 - i * 0.02),
             (x * 1.5, 0.760, 0.560 - i * 0.03),
             (x * 0.7, 0.560, 0.950 + i * 0.02)],
            r, R.MAT_RUBBER, carrier, 5)))
    # the water hose: [G3]'s bright large-bore thermoplastic run
    g.append(curve_to_mesh(R.hose(
        'waterhose',
        [(0.24, BODY_Y0 + 0.10, BODY_LOW_TOP + 0.02),
         (0.30, 0.680, 1.020),
         (0.18, 0.540, 1.640)], 0.032, R.MAT_RUBBER, carrier, 6)))
    # the air line off the tail reel, down the machine's side to the mast foot
    g.append(curve_to_mesh(R.hose(
        'airline',
        [(0.235, TAIL_Y - 0.06, 0.930),
         (0.520, 2.400, 0.700),
         (0.480, 1.300, 0.640),
         (0.180, 0.620, 0.700)], 0.030, R.MAT_RUBBER, carrier, 6)))
    # ...and up the mast to the swivel, on the mast so it rakes with it
    mg.append(curve_to_mesh(R.hose(
        'airline_mast',
        [(0.180, 0.620 - MAST_MID, 0.700 - MAST_PIVOT_Z),
         (MAST_W / 2 + 0.07, 0.10, 0.900),
         (MAST_W / 2 + 0.05, 0.02, 1.900)], 0.030, R.MAT_RUBBER, piv, 6)))
    # a bundle in black spiral wrap where the run crosses the tilt joint [G3]
    for i in range(5):
        g.append(tb('spiralwrap%d' % i, 0.046, 0.032, R.MAT_RUBBER, carrier,
                    (0.19, 0.600 + i * 0.045, 0.690), (1.2, 0, 0), 8))

    # ── work lights.  NOT SOURCED as a count -- neither [G1] nor [K1] itemises
    # them for this class.  Two, at the only two places a driller needs light
    # after dark: down the hole, and on his own hands.  The crown lamp is a
    # child of `pivot:mast`, so it SWEEPS as the mast rakes, which is the whole
    # reason `env.js` re-reads these nodes every frame.
    mg += lamp('collar', piv, (0.235, -0.10, MAST_LEN - 0.60),
               (-0.10, -0.55, -1.10), cone=48, rng=20, mesh_parent=piv)[2]
    g += lamp('console', carrier, (0.560, CONSOLE_Y - 0.62, CANOPY_Z - 0.12),
              (-0.35, -0.95, -0.95), cone=62, rng=16, mesh_parent=carrier)[2]
    return g, mg


# ══════════════════════════════════════════════════════════════════════════════
# BUILD
# ══════════════════════════════════════════════════════════════════════════════

def build(out_path):
    R.reset()
    build_undercarriage()
    carrier, _ = build_frame_and_body()
    build_operator_station(carrier)
    build_rod_rack(carrier)
    build_stowed_drifter(carrier)
    build_guards(carrier)
    build_compressor(carrier)
    build_mast_carrier()
    piv, mast_g = build_mast()
    car, car_g = build_carriage(piv)
    mast_g += build_clamp(piv)
    mast_g += build_services(carrier, piv)[1]

    # Everything under a `pivot:` or `slide:` is excluded from `finish()`'s
    # static join because it has to move independently -- but everything inside
    # ONE moving node moves TOGETHER, so it is joined by material here.  Without
    # this the mast alone is about 90 primitives.
    #
    # The carriage is welded FIRST: it is a child of the mast pivot, and welding
    # the mast afterwards must not sweep the carriage's meshes up with it.
    weld(car_g, 'carriage', car)
    weld([o for o in mast_g if o is not None and o.parent is piv], 'mast', piv)
    return R.finish(out_path)


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public',
                                       'models', 'crawler-lite.glb')))

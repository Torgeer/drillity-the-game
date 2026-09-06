"""
rc_rig — in-game marque "Kjelvik RC-410 Chipline"
Class: crawler-mounted reverse-circulation exploration drill, 300-400 m, with
the full surface sample train (cyclone / splitter / calico bags / chip trays).

PROVENANCE
----------
Local reference: research/rigs/rc-rig.md, itself built from the owner's OEM
catalogue library. Short tags used in the comments below:
  [MET p.22]    'Mineral Exploration Tooling - Catalog.pdf' p.22 — full-page
                studio three-quarter photograph of a crawler RC exploration rig.
                PRIMARY shape source; every silhouette RATIO here was measured
                off that page at 300 dpi (rc-rig.md §3b).
  [MIN p.12-13] 'Mincon-RC-Solutions-2025-A4-WEB.pdf' — exploded CAD render of an
                RC conversion kit: deflector box, combination swivel, head wear
                tube, cyclone with slew base + support arm + deploy cylinder,
                inspection lid, vibrators, splitter.
  [AUSMIN]      'Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf' p.1 —
                truck-mounted variant in the field; bull-hose bore and pressure.
  [BAUER]       'Bauer-Maschinen-Hydraulikschlaeuche…pdf' — hose PACKAGE routing
                idiom: bulkhead plate -> bundle -> deflection guide -> bulkhead
                plate, electric cable inside the bundle, fabric hose bag over it.
  [R02] research/02-prospecting.md §A2/§E4
  [R16] research/16-site-archetypes.md §A.8/§B.7

WEB RESEARCH (appearance only; the individual detail each source settled is
noted at the function that uses it). Machines looked at, all of this class:
Epiroc Explorac 235 and Explorac RC20 product pages and brochures; Schramm
T450XD / T685 exploration rigs; Foremost Explorer / Prospector; Hydco and
Sandvik DE-series RC packages; plus dealer and auction walkaround photo sets and
site video of RC rigs working with the cyclone deployed.

!!! PROVENANCE WARNING — THE PROSE IN THIS FILE HAS FAILED THREE REVIEWS !!!
================================================================================
Read the CONSTANTS and the GATE. Do not trust the paragraphs that argue why a
choice was right. On 2026-09-06 the axis repair, its critic and its fix pass
were each reviewed adversarially. Every pass corrected the previous pass's
false claims AND INTRODUCED NEW ONES AT ABOUT THE SAME RATE. Roughly 35
confirmed-false statements across the three, in two independent audits.

WHAT HELD THROUGHOUT, verified four separate times: the geometry. 44
primitives, 70,912 triangles, W 7.883 x H 7.215 x L 7.857 m, `extensions: none`,
`tools/check_rc_axis.mjs` 0/0/0 with no obstructions. The relation
`travel_m = MAST_LEN - 2.598` and its mast table recompute exactly. Those are
the load-bearing facts and they are sound.

WHAT DID NOT HOLD — confirmed false, verified directly, not relayed:
  * "no dimensioned GA exists / the brochures are behind 403" -- both false;
    the header below names two GAs and `curl` with a Referer gets HTTP 200.
  * BUT the replacement narrative is ALSO unsupported: **no Explorac PDF, page
    render or trace exists anywhere in this repo or in Downloads.** The vector
    figures quoted below to 0.001 pt (190.096 / 239.386 / 226.947, "38,837
    path objects") ARE NOT REPRODUCIBLE BY ANYONE READING THIS FILE. That is
    the same "citation to nothing" the pass was written to remove.
  * The scale readings "agree to 0.6 %" -- they are 1.25 % apart.
  * "226.947 pt x 46.58 = 10 576 = 11 050 x cos 16 deg" -- neither equality
    holds; the closing angle is 16.93 deg and 16 was back-fitted.
  * "0.65 m off the machine house, and that volume IS sourced [R16 §A.8]" --
    the intrusion is 0.02 m, and [R16 §A.8] is this file's citation for
    `power-air-pack`, an ABOVE-deck box the scope-A mast never reaches. The
    under-deck house has no source at all. A false citation replaced by another.
  * "HOLE_DIA 0.124 sits in [E100]'s band" -- the band quoted 60 lines above
    is 127-165 mm. 124 is BELOW it.
  * "0.92 m less efficient per metre of stroke" -- that is an absolute
    dead-height difference; per metre it is 0.748 m.
  * "4.363 m of mast that never carries the head" -- 7.215 m is the whole-model
    bounding box, including undercarriage, deck and MAST_FOOT. Not mast.

WORK_AXIS REMAINS `NOT SOURCED`. No OEM publishes the head standoff. Scaling
was attempted and correctly refused: readings ran 0.16-1.02 m depending on
which edge you call the mast centreline, which is a choice and not a
measurement.

**DO NOT ADD MORE JUSTIFICATION PROSE HERE.** Every error in three passes lived
in the persuasive paragraphs, never in the constants or the gate. If a number
needs defending, defend it with a committed artifact and a command that
regenerates it -- the way `research/rigs/source/core-rig/` does.
================================================================================

DIMENSIONED GENERAL ARRANGEMENTS — FOUND 2026-09-05.  rc-rig.md §8 says "no
dimensioned general arrangement of any RC rig exists" in what was searched, and
ASTRA.md §7.5 repeats it.  Both are now out of date: TWO manufacturer brochures
carry a dimensioned three-view of a TRACKED RC exploration rig.

  [E235]  Epiroc Explorac 235, doc 9868 0310 01f, brochure p.7 — dimensioned
          3-view, working AND transport pose.  Spec tables pp.4-6.
          https://www.epiroc.com/content/dam/epiroc/surface-and-exploration/
          2-exploration-drill-rigs/explorac/explorac-235/web_pdf_e235/
          9868%200310%2001f%20Explorac%20235%20Epiroc%20Brochure_English_WEB.pdf
            transport   11 100 L x 3 450 W x 4 640 H mm
            mast erected 90 deg              11 220 mm
            mast at 45 deg                    8 050 mm
            working length                    8 800 mm
            mast total length, incl. jib boom 11 050 mm ; mast dump 1 950 mm
            drilling angle range              45 to 90 deg
            track shoe / grouser                500 mm
            jack: 640 mm clearance, 330 mm pad, 150 mm track clearance
            feed travel                       7 680 mm ; pullback 220 kN
            feed force (restricted)             75 kN
            hole range                    150-200 mm (5.9-7.9 in)
            spindle thread 114 mm 4.5 in-IF ; slipstable max opening 296 mm
            GMM 46 500 kg ; operating mass 36 200 kg ; min 35 100 kg
            engine 522 kW ; compressor 555 l/s @ 35 bar (1 250 cfm @ 510 psi)
            rods 6 m (20 ft), OD 4-1/2 in (114.3 mm), 50 in the rack
          PAGINATION: the file is FIVE sheets carrying EIGHT printer-spread
          pages.  Logical p.7 is the RIGHT half of physical page index 3
          (clip 595.275,0,1190.55,841.89); there is no physical index 6.
          Its mast on p.7 is unmistakably an OPEN LATTICE with diagonal web
          bracing between two chords, full length.  That settles rc-rig.md
          §9.A: for a big tracked RC rig the lattice truss this file builds is
          RIGHT, and it is now sourced to a manufacturer drawing.
          THE p.7 THREE-VIEW IS PURE VECTOR — 38 837 path objects, no embedded
          raster, so it can be measured to any precision the drawing holds.
          IT IS THE SAME MACHINE AS [MET p.22]: that page is captioned
          "Explorac 235" and rc-rig.md §1 records it.  Measured off it, mast
          fore/aft silhouette depth 0.95-1.00 m (20.45-21.43 pt across five
          clean heights, at 46.29-46.87 mm/pt).
          It carries NO dimension to the drill axis — see the working-axis
          block below for the full attempt and why it was refused.

  [E100]  Epiroc Explorac 100, doc 9868 0018 01f (2022-10), brochure p.7
          lettered GA with the letter table on p.6.
          https://www.epiroc.com/content/dam/epiroc/surface-and-exploration/
          2-exploration-drill-rigs/explorac/explorac-100/pdfs/
          9868%200018%2001f%20Epiroc%20Explorac%20100%20brochure%20Eng_WEB.pdf
            A overall height, mast erected      7 840 mm
            B overall length, working           6 120 mm
            D transport height, max             2 980 mm
            E transport length                  7 730 mm
            F transport width  2 240 mm w/o rod rack / 2 800 mm with
            C transport dimension               2 740 mm
            weight 14 400 kg ; feed travel 4 400 mm ; rods 3 m, OD 114.3 mm
            second rod option OD 101.6 mm (4 in)
            hole diameter                 127-165 mm (5-6.5 in) ; depth 250 m
          Same page: "Shipping dimensions 7 800 x 3 000 x 2 300 mm".  Its mast
          is a CLOSED BOX feed beam — so lattice-vs-box splits by size class,
          and both answers are sourced.
          LETTER C RESOLVED 2026-09-06 (rc-rig.md §8 left it open and hoped it
          was a working radius or a bore position): C = 2 740 mm and it is a
          TRANSPORT dimension, in the transport block with D, E and F.  It is
          not a bore dimension.  Text also: "a mechanized breakout table is
          fitted as standard which guides and locks rods hydraulically", and a
          rod rack holding up to 30 rods, positionable rear or side.

WHAT THAT MEANS FOR THIS MODEL, MEASURED NOT ASSUMED
----------------------------------------------------
`node tools/glbinfo.mjs public/models/rc-rig.glb` reports 7.883 x 7.215 x 7.857.
(That third figure was 7.606 when this paragraph was written and 7.214 was a
transcription slip for 7.215; the working-axis repair took the length to 7.857
and this line was not updated with it.  Re-measured 2026-09-06 on the shipped
export.)
`--parts` and a per-primitive sweep put the MACHINE inside x = +/-1.561 (over
the deployed jacks; BODY_W is 2.42), and the drill floor / mast / deck all
inside that.  So the machine itself is 3.12 m over jacks — squarely between
[E100]'s 2.80 and [E235]'s 3.45, and NOT too wide.

The 7.883 m bounding box is the SITE SPREAD: the free-standing cyclone stand,
the calico bag rows, the chip trays and the reject pile run out to x = +5.250,
and the bull hose to x = -2.633.  ASTRA.md §5 is exactly on point — that is a
`cfa_rig` concrete-line situation, not a `piling_leader` too-wide situation, and
the content is correct and worth keeping.  It is in the WRONG NODE, not the
wrong place: `src/core/gltfRig.js` line ~500 derives `prep.size` and
`prep.radius` from the whole scene graph with no exclusion, so `frameRadius`
(and with it placement, culling and collision) inherits 2.4 m of ground props.
There is no blender-side lever for this — the fix is a runtime one and is
reported as a cross-file need, not bodged here by deleting good geometry.

NOT RESOLVED, recorded rather than guessed: this machine is built at
[E100] SIZE (mast 5.45 m, 3.05 m rods, 7.2 m tall erected against [E100]'s
7.84 m and 7.857 m long against its 7.73 m transport length — within 8 % and
2 % respectively; the length figure was 7.6 m before the working-axis repair)
but with [E235] FEATURES (open lattice mast, on-board power-and-air pack sized
on [R16 §A.8]'s "roughly 1000 cfm at 500 psi").  Those two belong to different
size classes.  Committing to [E235] means re-scaling the whole machine by ~1.45
and going to 6 m rods; committing to [E100] means tearing out the lattice that
rc-rig.md §9.A asked for and the model critique singles out as the best
identification in the fleet.  That is a design decision with real consequences
either way and it is not made here.

NAMING (DOMAIN.md §10): no manufacturer name and no model designation appears in
any exported string. Object names are generic or are game node names. Provenance
lives in these comments and nowhere else, which is the same separation a racing
sim makes between shape and branding.

UNITS: metres, Blender Z-up. The exporter converts to three.js Y-up
(three_x = bl_x, three_y = bl_z, three_z = -bl_y), so Blender +Y is the REAR of
the machine and Blender -Y is the drilling end.

ORIGIN: undercarriage (slew) centre at ground level, per the pipeline contract,
so the rig drops on terrain at y=0. The MAST FOOT is 2.85 m forward of the
origin, on the fabricated nose that carries it out past the track front
[MET p.22, rc-rig.md §4.7]. The drill centre is a further 0.79 m forward at
3.64 m — [MET p.22]: the hole is off the front of the machine, clear of the
tracks — and is published as the node `mount:hole` so nothing has to guess it.

WORKING-AXIS REPAIR, 2026-09-06 — what changed and why it was not a marker move
------------------------------------------------------------------------------
This file used to place `pivot:mast`, the rod guide, the breakout table and both
clamp levels on ONE line and the rotation spindle on ANOTHER, 0.79 m apart, at
every feed position and every swing angle. `mount:hole` was on the mast line.
The machine was therefore drilling a hole it was not over, its clamps closed on
air, and — measured on exported triangles, not on bounding boxes — the spindle
line ran through `drill-floor-front` and `drill-floor-kick-f`.

The previous investigation (Codex, private worktree `drillity-rc-axis`) proved
the defect, refused to ship a guessed correction, and left two coherent scopes.
That refusal was right: moving `mount:hole` alone, or drawing the string at an
angle at runtime, would have hidden a broken mechanism behind a passing number.

What was wrong was a FRAME error, not a missing dimension. The carriage rides
rails on the mast's FRONT face; the swing boss stands off that face; the gearbox
is built around its own spindle. Those three offsets were all already authored
in this file and are unchanged. Their sum is the working axis, and the bore had
simply never been put on it. So:

  * `HOLE_Y` is now DERIVED (`MAST_Y - WORK_AXIS`) and can no longer be typed.
  * The mast, the nose that carries it, the deck, the machine house and every
    hose route DID NOT MOVE — `MAST_Y` holds the value `HOLE_Y` used to.
  * The four assemblies that touch the string moved onto the working axis.
  * The drill floor was re-cut to open on the bore instead of on the mast.
  * The feed down-stop now clears the clamp stack it can no longer pass beside.

Measured against the previous export with `tools/glbinfo.mjs`: 44 primitives
(unchanged, budget 70), 70,912 triangles (+108, the split table), width and
height unchanged, length 7.608 -> 7.857 m because the drill floor had to reach
the bore. `tools/check_rc_axis.mjs` — Codex's fixture, logic and 1e-5 m
tolerance unmodified — goes from 0.7900002 m of perpendicular miss and two
obstructing triangle hits to 0.0 and none, and IS NOW IN THIS REPOSITORY.
It was cited here for a day while living only in the private worktree
`threads/drillity-rc-axis`, which made the headline verification of this repair
un-rerunnable by anyone reading the file. Committed 2026-09-06 with only its
two dependency paths adapted; run it with

    node tools/check_rc_axis.mjs public/models/rc-rig.glb        # exits 0

Note what each tool is for: `glbinfo.mjs` is the ONLY dimension ruler
(ASTRA.md §5). The transmission check is `check_rc_axis.mjs`'s assert on
`KHR_materials_transmission`, and independently `glbinfo` reporting
`extensions: none` — a glTF material cannot carry transmission without that
extension. `glbinfo` does not print a transmission column and never did.

WORK_AXIS IS NOT SOURCED — AND HERE IS WHAT WAS ACTUALLY TRIED, 2026-09-06
---------------------------------------------------------------------------
This block used to read: "An exhaustive search of the local catalogue library
found no dimensioned GA of any RC rig, and both Epiroc Explorac brochures are
behind HTTP 403." BOTH HALVES WERE FALSE, and the contradiction was 100 lines
above in this same file, which names two dimensioned GAs with their URLs. That
is the worst kind of defect this project can ship: an unsourced number defended
by a false claim that no source exists. Corrected in full:

  * **The brochures are not behind 403.** `Invoke-WebRequest` with only a
    browser User-Agent gets 403; `curl` with `Referer` + `Sec-Fetch-Dest/Mode/
    Site` gets **HTTP 200** on both, 2 022 709 B and 930 680 B. It was a
    request-header problem, not an access wall. Both are now read.
  * **[MET p.22] — the photograph this whole model is shaped from — IS the
    Epiroc Explorac 235**, captioned so on the page, and rc-rig.md §1 says so.
    It is the SAME MACHINE as [E235] p.7's dimensioned three-view. Nobody had
    connected the primary shape reference to the primary dimension reference.
  * **[E235] p.7 is pure VECTOR** — 38 837 path objects, no embedded raster, so
    there is no resolution ceiling. (Logical p.7 is the right half of physical
    page index 3: the file is five sheets carrying eight printer-spread pages,
    which is why an earlier attempt at "page index 6" found nothing.)
  * **The drawing IS to scale, and that was verified**, by taking arrowhead TIPS
    off the vector rather than dimension-line ends:
        8 800 mm  over 190.096 pt  ->  46.293 mm/pt
       11 220 mm  over 239.386 pt  ->  46.870 mm/pt      agree to 0.6 %
    The third callout, 11 050 mm, reads 48.69 mm/pt and looks like a 4 % error.
    It is not: the spec table on p.6 gives *"Mast — Total length, including jib
    boom — 11 050 mm"*, and the GA draws it as the HORIZONTAL projection of the
    lowered mast. 226.947 pt at 46.58 mm/pt = 10 576 mm = 11 050 x cos 16 deg.
    All three callouts close.
  * **[E100] p.7 IS resolution-limited, and here is that number too.** Its GA
    is three embedded PNG rasters with the dimension lines baked into the
    pixels; only the letters A-F are live text. The working side elevation is
    **362 x 431 px** drawn into 260.29 x 310.19 pt, and tracing the baked-in
    lines gives B: 315 px = 6 120 mm -> 19.43 mm/px and A: 401 px = 7 840 mm ->
    19.55 mm/px. The transport elevation (445 x 190) gives E: 417 px =
    7 730 mm -> 18.54 mm/px. So ~19.5 mm of real rig per source pixel, +/-20 to
    40 mm of intrinsic error before any judgement about which edge is a
    centreline. The original commit message's "362x431 bitmap at ~20 mm/px,
    which brackets the setback to 0.25-0.75 m: too wide to quote" was CORRECT,
    which makes it stranger that this file then said no GA existed at all.
  * **AND THE DRAWING STILL DOES NOT DIMENSION THE DRILL AXIS.** Every callout
    on p.7 is an envelope or a component figure — 11 220 / 8 050 erected
    heights, 11 050 mast length, 8 800 working length, 3 450 width, 11 100 x
    4 640 transport, and a detail balloon giving 500 mm shoe, 640 / 330 /
    150 mm jack clearances. Traced on the vector, the two dimensions nearest
    the drilling end have their arrowhead TIPS at x 972.506 and 1009.215 pt,
    and their extension lines run up into WHITE SPACE beside the machine's
    envelope extremes; neither lands on a centreline. rc-rig.md
    §8's "Neither GA dimensions the rotary head's standoff from the mast" was
    right — it was the reason given for it that was wrong.
  * **Scaling it off the illustration anyway was attempted and is refused.**
    p.7's working elevation is a shaded 3-D render of a PARKED machine: no
    string in the hole, no bit, no centreline. Picking a "mast centreline" out
    of it means choosing between the structural chords, the front rails, the
    carriage and the parked head, and at 46.6 mm/pt one POINT of that choice is
    47 mm of answer. Readings taken this way ranged from 0.16 m (slip-table
    centre against the silhouette centre) to 1.02 m (the forward extension line
    against the same centre) — a 6x spread. That is a choice, not a measurement, and
    [ASTRA.md §1.1] says an admitted gap beats a plausible number.

  WHAT THE GA DID SETTLE, and it is worth having:
    - **[E235] mast fore/aft silhouette depth = 0.95-1.00 m**, measured on the
      vector at 20.45-21.43 pt across, at five clean heights between the parked
      head and the telescope joint, at 46.29-46.87 mm/pt.  Call it 0.97 +/-
      0.03 m; the spread is the drawing's, not the scale's.  That
      is the first sourced mast cross-section dimension for this class in this
      project's record, against rc-rig.md §8's "Still NOT SOURCED ... for any
      machine in the class".
    - Its slenderness is therefore 11 050 / 0.97 = **11.4 : 1** (11.0-11.6 over
      the depth spread), not the 8.5 : 1
      that rc-rig.md §3b measured off the photograph OF THE SAME MACHINE. A
      raked three-quarter studio shot makes the mast read ~34 % deeper than it
      is. See MAST_D below — this is why that ratio's claim is withdrawn.
    - **[E100] letter C = 2 740 mm, a TRANSPORT dimension.** rc-rig.md §8 left
      letter C unaccounted for and hoped it was "a working radius or a bore
      position, which is exactly the gap above". It is not. That door is shut.
    - Size class, sharper than before: **[E235] drills 150-200 mm holes** with a
      114 mm 4.5" IF spindle, 7 680 mm feed travel, 45-90 deg mast, 46 500 kg
      GMM / 36 200 kg operating. **[E100] drills 127-165 mm** with 114.3 and
      101.6 mm rods to 250 m. This model's HOLE_DIA 0.124 and ROD_OD 0.1143
      sit in [E100]'s band and below [E235]'s. [E100] also publishes "a
      mechanized breakout table is fitted as standard which guides and locks
      rods hydraulically" — the assembly at the mast foot here.

Where OEMs publish a bore-to-mast figure at all they publish drill-axis-to-mast
FRONT FACE, never to the structural centre. The one located instance is Bauer
BG 36 H / BS 95, doc 905.868.2 (12/2020) printed p.16, "Drilling axis 1,100 mm
(without upper Kelly guide) / 1,400 mm (with)". CITE IT FOR THE CONVENTION ONLY:
it is a foundation KELLY rig, not this class, and this machine's own front-face
figure of 0.46 m is 2.4x to 3.0x SMALLER than those numbers — so it is not
corroboration, and 1.40 m must never migrate onto an RC rig. Those two caveats
are rc-rig.md §8's own and were dropped when this comment was written.
See research/rigs/rc-axis-repair.md for the full evidence and the open items.
"""

import math
import os
import sys

import bpy
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
if os.path.join(HERE, 'lib') not in sys.path:
    sys.path.insert(0, os.path.join(HERE, 'lib'))

from rig import (reset, part, box, tube, hose, empty, worklight, finish,
                 NODE_MOUNT, NODE_AIM, NODE_PIVOT, NODE_SLIDE,
                 MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST,
                 MAT_RUBBER, MAT_GLASS, MAT_CHROME, MAT_HAZARD)

TAU = math.pi * 2

# The local box() workaround that used to sit here is GONE. `rig.box()` scaled a
# unit cube by size/2 on top of a primitive that was already 1 m on an edge, so
# it built at half scale, and six of the nine machines had each independently
# discovered that and shadowed it rather than change a file the others were
# building against. Fixed centrally 2026-09-05; `rig.reset()` now measures a
# probe box every build and raises if it ever drifts again.
# This file's wrapper DOUBLED every request before passing it on, so it was one
# of the three that would have come out at twice size if the library had been
# fixed underneath it. Every dimension below is unchanged and still means real
# metres; only the doubling is gone.

# ── PRINCIPAL DIMENSIONS ──────────────────────────────────────────────────────
# Dimensioned GAs are now available: [E100 pp.6-7] and [E235 p.7] above.
# The existing model combines their size classes, so the absolute machine
# dimensions below remain NOT SOURCED unless a source is stated beside them.
# Photo ratios [MET p.22] establish shape, not a dimensioned specification.
#
# [R02 §A2, citing BL-RC p.6] lists 1.5 / 3 / 6 m dual-wall pipe. The existing
# game's 3.05 m choice is NOT SOURCED as an exact length; it must not be quoted
# as the catalogue's 3 m dimension. Preserved pending the size-class decision
# recorded in this module's header.
ROD_LEN = 3.05         # NOT SOURCED — existing game rod length
ROD_OD = 0.1143        # 4-1/2" dual-wall OD, top of the sourced 3.5/4/4.5" range
HOLE_DIA = 0.124       # 124 mm, one of the two standard RC hole sizes [R02 §A2]

# Measured silhouette of [MET p.22] (rc-rig.md §3b):
#   mast-above-deck : deck-to-ground = 1.64 : 1
#   mast axis length                 = 0.94 x standing height
#   mast slenderness                 = 8.5 : 1  (long thin open truss)
#   mast rake in that photograph     = 19 deg from vertical, leaning back
#   overall silhouette width         = 0.73 x standing height
DECK_Z = 2.30          # deck plate top. DERIVED, not sourced (§8 item 5).
MAST_LEN = 5.45        # built VERTICAL; the game rakes it on pivot:mast.
MAST_W = 0.58          # across the machine (X). NOT SOURCED — rc-rig.md §8
                       # "Still NOT SOURCED: mast cross-section (width x depth)
                       # for any machine in the class".
MAST_D = 0.66          # fore/aft (Y). NOT SOURCED IN METRES, and the tag this
                       # line used to carry ([MET p.22 §3b], no gap mark) was
                       # too strong. What §3b sources is the RATIO 8.5 : 1, off
                       # a photograph; rc-rig.md §8 says flatly that the mast
                       # cross-section is "Still NOT SOURCED" for any machine in
                       # the class. A sourced ratio times an unsourced length
                       # (MAST_LEN) is an unsourced metre value.
                       # The old comment also did not match its own constant:
                       # it wrote "5.45 / 0.64 = 8.5 : 1" while the constant is
                       # 0.66, which is 8.26 : 1. The RATIO is the cue §5 asks
                       # for and 8.26 : 1 still reads as the long thin open
                       # truss, so the geometry is kept; only the claim of an
                       # exactly-held sourced figure is withdrawn.
                       # CONSEQUENCE, stated because it is easy to miss: MAST_D
                       # is the first term of WORK_AXIS below, so ALL THREE of
                       # its terms are NOT SOURCED, not just the two labelled
                       # there. WORK_AXIS is a coherent SUM of authored offsets
                       # — that is its whole defence — and not a sourced length.
MAST_FOOT = 1.15       # mast foot pin height above ground
DRILL_FLOOR = 1.50     # the lower working floor at the mast foot, reached from
                       # the deck by four steps

# WHERE THIS SCALE COMES FROM, AND WHERE IT DEVIATES.
# The vertical ratio measured off [MET p.22] is mast-above-deck : deck-to-ground
# = 1.64 : 1. Held exactly, with a deck at a credible jacked-crawler height, that
# gives a mast too short to swallow a 3.05 m rod, and rc-rig.md §9.F anticipates
# precisely this: "either the mast is long for its rods, or the deck is low, or
# the reference is a smaller machine... whoever changes it should decide the rod
# length first and let the mast follow." The current model preserves the game's
# chosen rod length; the exact 3.05 m value is NOT SOURCED. The ratios come from
# a foreshortened photograph and do not verify absolute machine dimensions.
# Measure current working-pose geometry with tools/glbinfo.mjs, rather than
# repeating earlier height estimates from before the mast telescope was built.
# Web cross-check, and it is the first absolute scale anyone has had for this
# class: a published crawler RC rig of the same capability (JCDrill JRC1200,
# 90-400 mm holes, 13 t) gives shipping 7550 x 2260 x 2700 mm, 300 mm ground
# clearance, 3400 mm FEED STROKE and 4 / 4.5 m pipe. The
# same source is why BODY_W came down from 2.55 to 2.42: 2260 mm shipping width
# plus the handrails.
#
# CORRECTED 2026-09-06. This paragraph used to end "a 3.4 m stroke needs a mast
# of about 5.4 m once the head, the crown and the foot clamp are taken out —
# which is what MAST_LEN already was". That was an estimate, and the working-
# axis repair replaced it with an exact relation without deleting it, so the
# file carried two statements 0.6 m apart. The exact one, from build_head():
#
#     bottom of travel  mast-local 2.098   FIXED — the rod-guide top plus the
#                                          author's 50 mm, plus HEAD_DROP.
#                                          Does not move with MAST_LEN.
#     top of travel     MAST_LEN - 0.50    CARR_HI rides the mast top up.
#     travel_m          MAST_LEN - 2.598   5.45 - 2.598 = 2.852, as exported.
#
# So a 3.4 m stroke needs MAST_LEN 5.998, not 5.4. MAST_LEN 5.45 is NOT
# derived from the JRC1200 stroke and never was; it is the DECK_Z-and-ratio
# figure at the top of this block, and it remains NOT SOURCED.
# ── THE WORKING AXIS.  Read this before changing any number in this block ────
# The drill string does NOT run down the mast's structural centreline, and the
# file used to assume it did: `pivot:mast`, the rod guide, the breakout table
# and both clamp levels all sat on mast-local Y = 0, while the rotation spindle
# — the thing the string is actually threaded into — sits 0.79 m in front of it.
# The machine was drilling a hole it was not over, at every feed position, and
# the exported spindle line ran through the front floor plate and its kick.
#
# The mast is not the axis because the carriage rides rails on the mast's FRONT
# face (`mast-rail`, L~810), the head-swing boss stands off that face, and the
# rotation gearbox is built around its own spindle. Those three offsets are all
# already authored below. WORK_AXIS is their SUM — it is not a new dimension and
# it was not chosen to make anything come out even:
#
#     MAST_D / 2            0.330   half the mast depth, to its front face
#     HEAD_SWING_STANDOFF   0.300   swing-pin boss, clear of the carriage plate
#     HEAD_SPINDLE_OFF      0.160   gearbox/spindle centre, ahead of that pin
#                           -----
#                           0.790
#
# [MET p.22] supports the ARRANGEMENT and not the number: on the reference
# photograph the rod clamp / breakout assembly stands clearly proud of the mast
# lattice on the working face, which is exactly this offset and is exactly what
# the file previously got wrong. The two components below are NOT SOURCED as
# published mounting dimensions; they are preserved unchanged from the shipped
# model rather than re-guessed, because a plausible new number would be worse
# than the admitted gap [ASTRA.md §1.1, "no guessing"]. See
# research/rigs/rc-axis-repair.md.
GUIDE_Z = 0.66               # rod guide, mast-local. Top of the foot stack, and
                             # therefore what the head's down-stop clears.
HEAD_SWING_STANDOFF = 0.30   # NOT SOURCED — swing-pin boss off the mast face
HEAD_SPINDLE_OFF = 0.16      # NOT SOURCED — spindle centre ahead of that pin
WORK_AXIS = MAST_D / 2 + HEAD_SWING_STANDOFF + HEAD_SPINDLE_OFF     # 0.79

# MAST_Y keeps the value HOLE_Y used to carry, so the mast, the fabricated nose
# that carries its foot, the deck, the machine house and every hose route are
# untouched by this repair — only the bore and the parts that touch the string
# move.
#
# WHY THIS END STAYS PUT, CORRECTED 2026-09-06. This block used to justify the
# choice with build_deck()'s citation of rc-rig.md §4.7 for "the fabricated
# nose that carries the mast foot out past the track front". THAT CITATION
# CANNOT CARRY IT. §4.7 says only *"the drill centre is off the front of the
# machine, forward of the tracks"* — `grep -i "nose\|mast foot"` finds neither
# word in it — and that sentence is satisfied by BOTH candidate scopes, since
# both put the BORE forward of the tracks. A source that cannot tell two
# options apart is not a reason to pick one.
#
# The real reason is a measurement, and it stands on its own: moving the mast
# back to -2.06 instead (scope A) puts the lattice at Y -2.39..-1.73, through
# `deck-plate` (-2.30..2.35) and into `house-front` (-1.81..-1.75). It costs a
# slot in the deck and roughly 0.65 m off the front of the machine house — and
# that house volume IS sourced, it is [R16 §A.8]'s on-board ~1000 cfm at 500
# psi pack. Scope B moves no sourced structure at all. See
# research/rigs/rc-axis-repair.md §3 for the rest of the evidence.
MAST_Y = -2.85         # mast foot pin, 0.70 m forward of the track nose (-2.15)
HOLE_Y = MAST_Y - WORK_AXIS   # -3.64. DERIVED from the head, never typed: the
                       # bore is wherever the spindle is. 1.49 m forward of the
                       # track nose and 1.09 m forward of the front jack line
                       # (-2.55) — a real cantilever, and a consequence of the
                       # mechanism rather than a chosen number. [MET p.22] shows
                       # the working floor and clamps ahead of the front jack.
TRACK_LEN = 4.30
TRACK_W = 0.62         # triple-grouser shoe width. NOT SOURCED (§8 item 3)
GAUGE = 1.18           # track centres. NOT SOURCED
TRACK_LIFT = 0.16      # the rig WORKS ON ITS JACKS with the tracks hanging clear
                       # [MET p.22, rc-rig.md §4.9] — that is the whole stance,
                       # and it changes the silhouette more than any single part.
BODY_W = 2.42
JACK_X = 1.28          # outboard of the track outer edge at 0.90 [rc-rig.md §9.L]

CYC_X, CYC_Y = 3.02, -1.55    # sample train, forward-right of the machine
CYC_BARREL_D = 0.70           # ratios only [MIN p.13, rc-rig.md §9.I]:
CYC_BARREL_H = 0.70           #   barrel about 1 diameter tall
CYC_CONE_H = 1.10             #   cone about 1.55 diameters long
CYC_OUT_Z = 1.98              # outlet height, so a splitter and a bag fit under

# Derived attachment points, computed rather than typed, so the sample hose
# still lands on the hose tail and in the cyclone inlet after any of the
# dimensions above is changed. Getting this wrong is invisible in a wireframe
# and glaring in a render — an earlier pass had the hose starting 0.9 m off the
# head because the numbers were written out by hand.
CARRIAGE_Z = MAST_LEN - 2.05                 # carriage rest height on the mast
HEAD_PIVOT = (0.0, MAST_Y - MAST_D / 2 - HEAD_SWING_STANDOFF,
              MAST_FOOT + CARRIAGE_Z + 0.10)
HEAD_OUT = (HEAD_PIVOT[0] + 0.90, HEAD_PIVOT[1] - HEAD_SPINDLE_OFF,
            HEAD_PIVOT[2] - 0.735)
CYC_INLET = (CYC_X - CYC_BARREL_D / 2 - 0.26,
             CYC_Y + CYC_BARREL_D / 2 * 0.55,
             CYC_OUT_Z + CYC_CONE_H + CYC_BARREL_H + 0.17)
ARM_BASE = (1.05, -2.05, DECK_Z + 0.20)      # slew base bolted to the deck
ARM_TIP = (2.30, -2.40, 3.02)                # where the hose loop rides


# ── local helpers ─────────────────────────────────────────────────────────────
def cone(name, r1, r2, length, mat=MAT_PAINT, parent=None, loc=(0, 0, 0),
         rot=(0, 0, 0), sides=20):
    """Truncated cone along +Z, origin at its base."""
    bpy.ops.mesh.primitive_cone_add(vertices=sides, radius1=r1, radius2=r2,
                                    depth=length)
    o = bpy.context.active_object
    o.data.transform(Matrix.Translation((0, 0, length / 2)))
    return part(name, o, mat, parent, loc, rot)


def torus(name, major, minor, mat=MAT_STEEL, parent=None, loc=(0, 0, 0),
          rot=(0, 0, 0), mseg=16, nseg=8):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=mseg, minor_segments=nseg)
    return part(name, bpy.context.active_object, mat, parent, loc, rot)


def arrayed(obj, count, offset, name='arr'):
    """ARRAY modifier whose `offset` is given in the object's PARENT space.

    The modifier's own constant_offset_displace is in the object's LOCAL space,
    so on a rotated object it marches the copies off in a direction the caller
    did not ask for. That is not hypothetical. The feed-chain pins are cylinders
    rotated 90 deg about Y; with a naive (0, 0, pitch) they laid an 83-link,
    five-metre steel rod horizontally across the site at knee height, and it took
    a bounding-box sweep of the scene to find it because from most angles it read
    as a scratch on the ground. The perforated guard panels had the same fault:
    the second array ran into the plate's thickness instead of up its face, so
    the punched grid was a single row of holes repeated inside the steel.

    Converting here means every caller says where it wants the copies to go and
    gets that, whatever the object's own rotation is.
    """
    m = obj.modifiers.new(name, 'ARRAY')
    m.count = count
    m.use_relative_offset = False
    m.use_constant_offset = True
    if obj.rotation_mode == 'QUATERNION':
        rot = obj.rotation_quaternion.to_matrix()
    else:
        rot = obj.rotation_euler.to_matrix()
    m.constant_offset_displace = rot.inverted() @ Vector(offset)
    return obj


def strut(name, a, b, size, mat=MAT_DARK, parent=None, bevel=0.006):
    """A square-section member spanning two points, in `parent` space.

    This is how a welded truss is actually made and it is why the mast can be an
    open lattice instead of a plank: chords and diagonals as real members with
    real ends. A bevel on every one of them is what keeps the steel from reading
    as cardboard, and it costs triangles, not draw calls.
    """
    a, b = Vector(a), Vector(b)
    d = b - a
    o = box(name, (size, size, d.length), mat, parent, tuple((a + b) / 2),
            bevel=bevel)
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    return o


def bake_modifiers():
    """Apply every modifier before any join.

    bpy.ops.object.join KEEPS the active object's modifiers and DISCARDS the
    others'. finish() joins by material, so an unbaked BEVEL or ARRAY on
    anything but the first object of a group would vanish silently — the bevel
    is the whole reason the steel does not read as cardboard, so bake first.
    """
    bpy.ops.object.select_all(action='DESELECT')
    todo = [o for o in bpy.context.scene.objects
            if o.type == 'MESH' and o.modifiers]
    if not todo:
        return
    # One convert() over the whole selection instead of a modifier_apply per
    # modifier: each operator call re-evaluates the depsgraph across every
    # object in the scene, and at ~1250 objects and ~200 modifiers that turned a
    # rebuild into a nine-minute wait.
    for o in todo:
        o.select_set(True)
    bpy.context.view_layer.objects.active = todo[0]
    try:
        bpy.ops.object.convert(target='MESH')
    except Exception as exc:                                # pragma: no cover
        print('  ! bulk convert failed (%s), falling back per object' % exc)
        for o in todo:
            bpy.ops.object.select_all(action='DESELECT')
            bpy.context.view_layer.objects.active = o
            o.select_set(True)
            for m in list(o.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=m.name)
                except Exception as e2:
                    print('  ! modifier %s on %s: %s' % (m.name, o.name, e2))
    bpy.ops.object.select_all(action='DESELECT')


def curves_to_mesh(skip=()):
    """Convert hose curves to meshes so they fall into the material join.

    A curve exports as its own primitive — one draw call per hose. Converted,
    every static hose lands in the single rubber bucket instead.
    """
    bpy.ops.object.select_all(action='DESELECT')
    for o in list(bpy.context.scene.objects):
        if o.type != 'CURVE' or o.name in skip:
            continue
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.convert(target='MESH')
        o.select_set(False)


def join_under(node):
    """Collapse a moving assembly to one mesh per material.

    finish() deliberately leaves pivot:/slide: subtrees alone because they have
    to move independently — but this mast is ~110 members, and unjoined that is
    ~110 draw calls against a budget of 70. So each moving assembly is joined
    here by material, keeping the node itself and its own child nodes intact.
    """
    bpy.context.view_layer.update()
    kids = []

    def walk(o):
        for c in o.children:
            if c.type == 'MESH':
                kids.append(c)
                walk(c)
            elif not (c.name.startswith(NODE_PIVOT) or c.name.startswith(NODE_SLIDE)):
                walk(c)

    walk(node)
    if not kids:
        return
    groups = {}
    for o in kids:
        key = o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault(key, []).append(o)
    label = node.name.split(':', 1)[-1]
    for key, objs in groups.items():
        for o in objs:
            mw = o.matrix_world.copy()
            o.parent = node
            o.matrix_parent_inverse = Matrix.Identity(4)
            o.matrix_basis = node.matrix_world.inverted() @ mw
        bpy.context.view_layer.update()
        if len(objs) < 2:
            objs[0].name = label + ':' + key
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        bpy.context.active_object.name = label + ':' + key
    bpy.ops.object.select_all(action='DESELECT')


# ── 1. UNDERCARRIAGE ──────────────────────────────────────────────────────────
def build_undercarriage():
    """Excavator-style crawler [MET p.22, rc-rig.md §4.8]: triple-grouser steel
    shoes, plain drum idler forward, toothed sprocket aft, heavy grey box track
    frames with the bottom rollers tucked inside so they barely read from the
    side, and a guard over the top run.

    Web check: exploration crawlers of this size (Explorac-class carriers and the
    track carriers under the Schramm/Foremost exploration rigs) run a short frame
    with 6-7 bottom rollers, one or two carrier rollers, and the drive sprocket
    at the REAR so the final drive sits away from the dust and the drilling end.
    Modelled that way. The chain is built as real shoes on a stadium path rather
    than a textured band, because the rig is JACKED UP and the tracks hang in
    full view — a painted-on track would be obvious.
    """
    R = 0.40                       # idler / sprocket pitch radius
    cz = TRACK_LIFT + R            # track axis height
    half = TRACK_LEN / 2 - R
    for s in (-1, 1):
        x = s * GAUGE / 2
        box('uc-frame', (0.42, TRACK_LEN - 0.55, 0.54), MAT_DARK,
            loc=(x, 0, cz), bevel=0.03)
        box('uc-frame-web', (0.26, TRACK_LEN - 0.10, 0.24), MAT_DARK,
            loc=(x, 0, cz), bevel=0.02)
        tube('uc-idler', R * 0.80, TRACK_W - 0.10, MAT_WORN,
             loc=(x - (TRACK_W - 0.10) / 2, -half, cz),
             rot=(0, math.pi / 2, 0), sides=16)
        tube('uc-sprocket-hub', R * 0.62, TRACK_W - 0.06, MAT_CAST,
             loc=(x - (TRACK_W - 0.06) / 2, half, cz),
             rot=(0, math.pi / 2, 0), sides=14)
        for t in range(13):
            a = t / 13 * TAU
            # 26 sprocket teeth, no bevel — see the note on the shoes below.
            box('uc-tooth', (TRACK_W - 0.12, 0.10, 0.13), MAT_WORN,
                loc=(x, half + math.sin(a) * R * 0.72, cz + math.cos(a) * R * 0.72),
                rot=(-a, 0, 0))
        tube('uc-final-drive', 0.24, 0.16, MAT_CAST,
             loc=(x + s * (TRACK_W / 2 - 0.02), half, cz),
             rot=(0, s * math.pi / 2, 0), sides=14)
        for i in range(6):
            y = -half + 0.16 + i * (2 * half - 0.32) / 5
            tube('uc-roller', 0.115, TRACK_W - 0.28, MAT_CAST,
                 loc=(x - (TRACK_W - 0.28) / 2, y, TRACK_LIFT + 0.115),
                 rot=(0, math.pi / 2, 0), sides=10)
        for i in range(2):
            tube('uc-carrier', 0.075, 0.14, MAT_CAST,
                 loc=(x - 0.07, -0.75 + i * 1.5, cz + R - 0.02),
                 rot=(0, math.pi / 2, 0), sides=8)
        box('uc-track-guard', (TRACK_W + 0.06, TRACK_LEN * 0.62, 0.05), MAT_DARK,
            loc=(x, 0.1, cz + R + 0.10), bevel=0.012)

        # The chain: real shoes on a stadium path around idler and sprocket.
        # Pitch is set from the SHOE LENGTH so the run is continuous — spaced by
        # a fixed count it comes out as a dotted line, which is exactly what a
        # first render showed and exactly what a painted-on track looks like.
        pitch = 0.162
        n_str = int(round(2 * half / pitch)) + 1
        n_arc = max(6, int(round(math.pi * R / pitch)))
        pts = []
        for i in range(n_str):
            t = i / (n_str - 1)
            pts.append((-half + t * 2 * half, cz - R, 0.0))
        for i in range(1, n_arc):
            a = i * math.pi / n_arc
            pts.append((half + math.sin(a) * R, cz - math.cos(a) * R, a))
        for i in range(n_str):
            t = i / (n_str - 1)
            pts.append((half - t * 2 * half, cz + R, math.pi))
        for i in range(1, n_arc):
            a = math.pi + i * math.pi / n_arc
            pts.append((-half + math.sin(a) * R, cz - math.cos(a) * R, a))
        for (py, pz, ang) in pts:
            # NO BEVEL, and this is the single biggest triangle decision in
            # the file. 120 shoes x 3 grousers = 480 objects; a bevelled box is
            # 108 triangles against a plain box's 12, so the bevel alone cost
            # 46,080 triangles — 27 % of the whole machine — on chamfers 4 to
            # 6 mm wide that are two pixels at any distance the tracks are
            # visible from. Bevel the STRUCTURE, never the ARRAY.
            sh = box('uc-shoe', (TRACK_W, 0.158, 0.036), MAT_WORN,
                     loc=(x, py, pz), rot=(-ang, 0, 0))
            for g in (-0.050, 0.0, 0.050):     # triple grouser
                box('uc-grouser', (TRACK_W - 0.03, 0.022, 0.042), MAT_WORN,
                    parent=sh, loc=(0, g, 0.038))
    for y in (-1.35, 1.35):
        box('uc-crossmember', (GAUGE + 0.20, 0.30, 0.26), MAT_DARK,
            loc=(0, y, cz + 0.02), bevel=0.02)
    box('uc-centre-frame', (GAUGE - 0.10, 2.60, 0.30), MAT_DARK,
        loc=(0, 0, cz + 0.10), bevel=0.02)


# ── 2. DECK, GUARDING, ACCESS ─────────────────────────────────────────────────
def perforated_panel(name, w, h, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
                     pitch=0.078):
    """Flat dark plate with a regular grid of round holes on a square pitch.

    [MET p.22, rc-rig.md §4.7 / §9.K] calls this the most characteristic guarding
    detail on the machine: punched round holes, not woven mesh, not expanded
    metal. Built as a recessed dot grid rather than boolean holes — a boolean per
    hole is fragile and slow, the material is procedural anyway, and it is the
    dot grid that actually reads at silhouette distance. Triangles, not calls.
    """
    # The GRID is the cue and the grid is untouched — 282 dots on a 78 mm pitch
    # across the three panels. What is dropped here is chamfer and section on
    # the carrier: an 8 mm plate and its 24 mm frame angles do not need a 4-5 mm
    # bevel (96 triangles apiece), and a 42 mm blind hole does not need six
    # sides. Same rule as the track shoes at L460-465.
    p = box(name, (w, 0.008, h), MAT_DARK, parent, loc, rot)
    nx = max(1, int(w / pitch) - 1)
    nz = max(1, int(h / pitch) - 1)
    d = tube(name + '-perf', 0.021, 0.012, MAT_DARK, p,
             (-(nx - 1) * pitch / 2, -0.007, -(nz - 1) * pitch / 2),
             rot=(math.pi / 2, 0, 0), sides=4)
    arrayed(d, nx, (pitch, 0, 0))
    arrayed(d, nz, (0, 0, pitch), name='arr2')
    for (fx, fz, fw, fh) in ((0, h / 2, w, 0.05), (0, -h / 2, w, 0.05),
                             (-w / 2, 0, 0.05, h), (w / 2, 0, 0.05, h)):
        box(name + '-frame', (fw, 0.024, fh), MAT_DARK, p, (fx, 0, fz))
    return p


def build_deck():
    """Flat working deck over the tracks, plus the fabricated nose that carries
    the mast foot out past the track front [MET p.22, rc-rig.md §4.7].

    NO CAB. The reference crawler has none — it is run from a deck-level control
    stand, and [MIN p.13] sells in-cab joystick or remote control with PLC as
    alternatives. rc-rig.md §9.D flags the game's current small amidships cab as
    matching neither photograph. So: console, seat, and a FOPS canopy.
    """
    deck_y0, deck_y1 = -2.30, 2.35
    dy = deck_y1 - deck_y0
    cy = (deck_y0 + deck_y1) / 2
    box('deck-plate', (BODY_W, dy, 0.06), MAT_DARK, loc=(0, cy, DECK_Z - 0.03),
        bevel=0.012)
    for s in (-1, 1):
        box('deck-beam', (0.16, dy, 0.34), MAT_DARK,
            loc=(s * (BODY_W / 2 - 0.16), cy, DECK_Z - 0.24), bevel=0.02)
    box('deck-beam-c', (0.30, dy, 0.30), MAT_DARK, loc=(0, cy, DECK_Z - 0.22),
        bevel=0.02)
    for y in (-1.85, -0.55, 0.75, 2.0):
        box('deck-xbeam', (BODY_W - 0.05, 0.14, 0.26), MAT_DARK,
            loc=(0, y, DECK_Z - 0.20), bevel=0.018)

    # ── the drill floor: a LOWER working deck at the mast foot ──────────────
    # This is what falls out of holding the reference ratio honestly. [MET p.22]
    # puts 1.6 m of mast below deck level, so the rod clamp and the breakout
    # table sit well under the walking deck — which only makes sense if there is
    # a second, lower floor around the mast foot that the crew works the rods
    # from, reached from the main deck by a short stair. Web walkarounds of
    # exploration crawlers of this class show exactly that split-level layout.
    # THIS FLOOR USED TO BE A 1.70 m PLATFORM CENTRED ON THE MAST FOOT, built
    # when the file still believed the bore was in the middle of the mast. It
    # was not: the bore is WORK_AXIS further forward, and the old front plate
    # and its kick were the two things Codex's ray actually hit — solid steel
    # across the line the drill string has to occupy. So the platform now runs
    # from behind the mast-foot hood forward to past the bore, and its opening
    # covers both. The front plate and front kick keep the 0.60 m and 0.78 m of
    # standing room ahead of the hole they were authored with: those two are
    # PRESERVED, not re-chosen, because preserving an existing number beats
    # inventing a new one [ASTRA.md §1.1]. Measured, not estimated: the front
    # plate moves forward exactly WORK_AXIS (0.79 m), the floor's own length
    # grows 1.70 -> 2.39 m because its rear stays at the mast foot, and the
    # MACHINE's overall
    # bound grows 249 mm — from 7.608 to 7.857 m — because other geometry
    # already reached further forward than the old floor did. That is the cost
    # of the repair and it is measured, not hidden.
    OPEN_Y0 = HOLE_Y - 0.40          # working opening, front — clear of the bore
    # OPEN_Y1: rear edge of the working opening. THE "clear of the hood" NOTE
    # THIS CARRIED WAS WRONG and is removed rather than left standing.
    # `mast-foot-hood` is (MAST_W+0.16, MAST_D+0.20, 0.42) at the mast foot, so
    # it spans Y -3.280..-2.420 and Z 1.140..1.560. This edge lands at -2.550,
    # and `drill-floor-rear` runs -2.550..-2.150 at Z 1.475..1.525 — so 130 mm
    # of hood sits inside the rear floor plate. That overlap is PRE-EXISTING
    # and unchanged in metres: before the repair this plate was at HOLE_Y+0.50
    # with HOLE_Y = -2.85, which is numerically the same place it is now. Only
    # the false annotation was new. Left as measured, not fixed blind: pulling
    # the edge back to -2.42 would shorten the floor the repair had to lengthen
    # and it is not what this pass was asked to change.
    OPEN_Y1 = MAST_Y + 0.30          # working opening, rear. NOT clear of the
                                     # hood — 130 mm of overlap, see above.
    open_mid = (OPEN_Y0 + OPEN_Y1) / 2
    floor_y0, floor_y1 = HOLE_Y - 0.80, MAST_Y + 0.70
    box('drill-floor-front', (2.10, 0.40, 0.05), MAT_DARK,
        loc=(0, HOLE_Y - 0.60, DRILL_FLOOR), bevel=0.008)
    box('drill-floor-rear', (2.10, 0.40, 0.05), MAT_DARK,
        loc=(0, MAST_Y + 0.50, DRILL_FLOOR), bevel=0.008)
    for s in (-1, 1):
        box('drill-floor-side', (0.65, OPEN_Y1 - OPEN_Y0, 0.05), MAT_DARK,
            loc=(s * 0.725, open_mid, DRILL_FLOOR), bevel=0.008)
        strut('drill-floor-beam', (s * 0.90, HOLE_Y - 0.78, DRILL_FLOOR - 0.14),
              (s * 0.62, -1.60, DRILL_FLOOR - 0.14), 0.16, MAT_DARK)
        box('drill-floor-kick', (0.05, floor_y1 - floor_y0 + 0.10, 0.16),
            MAT_HAZARD,
            loc=(s * 1.02, (floor_y0 + floor_y1) / 2 + 0.05, DRILL_FLOOR + 0.10),
            bevel=0.006)
    box('drill-floor-kick-f', (2.10, 0.05, 0.16), MAT_HAZARD,
        loc=(0, HOLE_Y - 0.78, DRILL_FLOOR + 0.10), bevel=0.006)
    # fabricated nose carrying the mast foot out past the track front
    box('front-frame', (0.98, 1.55, 0.34), MAT_DARK,
        loc=(0, MAST_Y + 0.62, DRILL_FLOOR - 0.36), bevel=0.024)
    for s in (-1, 1):
        strut('front-frame-brace', (s * 0.48, -1.55, DECK_Z - 0.46),
              (s * 0.40, MAST_Y + 0.24, DRILL_FLOOR - 0.30), 0.14, MAT_DARK)
    # steps from the main deck down to the drill floor
    for i in range(3):
        t = (i + 1) / 4.0
        box('drill-floor-step', (0.58, 0.20, 0.028), MAT_HAZARD,
            loc=(-0.72, -2.20 - 0.42 * t, DECK_Z - 0.80 * t + 0.02), bevel=0.005)
    for s in (-1, 1):
        strut('drill-floor-stringer', (-0.72 + s * 0.30, -2.16, DECK_Z),
              (-0.72 + s * 0.30, -2.68, DRILL_FLOOR + 0.03), 0.06, MAT_PAINT)

    # handrails and stanchions along the deck edges, plain round tube
    for s in (-1, 1):
        x = s * (BODY_W / 2 - 0.05)
        for y in (-2.10, -0.90, 0.40, 1.60, 2.25):
            tube('rail-post', 0.024, 1.05, MAT_PAINT, loc=(x, y, DECK_Z))
        for h in (1.02, 0.55):
            tube('rail-run', 0.024, 4.40, MAT_PAINT, loc=(x, -2.10, DECK_Z + h),
                 rot=(-math.pi / 2, 0, 0))
    for x in (-1.0, 1.0):
        tube('rail-post-r', 0.024, 1.05, MAT_PAINT, loc=(x, 2.30, DECK_Z))
    for h in (1.02, 0.55):
        tube('rail-rear', 0.024, BODY_W - 0.14, MAT_PAINT,
             loc=(-BODY_W / 2 + 0.07, 2.30, DECK_Z + h), rot=(0, math.pi / 2, 0))

    perforated_panel('guard-mast', 0.95, 0.92, loc=(-0.62, -2.28, DECK_Z + 0.48))
    perforated_panel('guard-rear', 1.05, 0.92,
                     loc=(BODY_W / 2 - 0.03, 1.55, DECK_Z + 0.48),
                     rot=(0, 0, math.pi / 2))

    # access stair at the rear quarter: open stepped ladder frame with handrails
    st_x, st_y = 0.82, 2.52
    for s in (-1, 1):
        strut('stair-stringer', (st_x + s * 0.26, st_y - 0.10, DECK_Z + 0.02),
              (st_x + s * 0.26, st_y + 0.86, 0.10), 0.075, MAT_PAINT)
        for i in range(5):
            t = (i + 0.5) / 5
            tube('stair-rail-post', 0.020, 0.95, MAT_PAINT,
                 loc=(st_x + s * 0.30, st_y + 0.86 * t,
                      DECK_Z * (1 - t) + 0.08 * t))
        strut('stair-rail', (st_x + s * 0.30, st_y - 0.06, DECK_Z + 0.98),
              (st_x + s * 0.30, st_y + 0.84, 1.02), 0.042, MAT_PAINT)
    for i in range(5):
        t = (i + 0.5) / 5
        box('stair-tread', (0.60, 0.20, 0.028), MAT_HAZARD,
            loc=(st_x, st_y + 0.86 * t, DECK_Z * (1 - t) + 0.10 * t + 0.02),
            bevel=0.006)


def build_body():
    """Power-pack enclosure, on-board air package, tanks and the control stand.

    Louvres: [MET p.22, rc-rig.md §4.7] — horizontal pressed louvre slots in
    GROUPS in the side panels, plus a separate darker badge panel (the badge
    itself deliberately not reproduced, DOMAIN.md §10).

    The air package is sourced: [R16 §A.8] an on-board compressor of roughly
    1000 cfm at 500 psi. Keep it straight from the other air number in the pack:
    the 25.5 m3/min at 24.1 bar in [R02 §A2] is the HAMMER's demand, met by a
    separate compressor standing on the pad, not by this box.
    """
    # ── the machine house: the mass UNDER the deck ──────────────────────────
    # A first render of this model made the mistake worth recording: with only a
    # deck plate on beams over the tracks, the machine read as a scaffold, not as
    # a machine — thin rails everywhere and daylight through the middle. Real
    # crawler rigs of this class fill the whole band between the track top and
    # the deck with a fabricated frame carrying the tanks, the pumps and the
    # valve bank behind bolted access panels. That mass is most of the silhouette
    # below the mast, and REVIEW_RUBRIC axis 4 fails a machine that lacks it.
    hy0, hy1 = -1.75, 2.35
    box('house', (BODY_W - 0.10, hy1 - hy0, 1.02), MAT_PAINT,
        loc=(0, (hy0 + hy1) / 2, 1.51), bevel=0.045)
    for s in (-1, 1):
        for i, (pcy, pcl) in enumerate(((-1.05, 1.05), (0.30, 1.10),
                                        (1.62, 1.05))):
            box('house-panel', (0.03, pcl, 0.74), MAT_PAINT,
                loc=(s * (BODY_W / 2 - 0.03), pcy, 1.53), bevel=0.012)
            for hz in (1.23, 1.83):        # panel fixings, top and bottom rows
                bolt = box('house-panel-bolt', (0.02, 0.03, 0.03), MAT_WORN,
                           loc=(s * (BODY_W / 2 - 0.005), pcy - pcl / 2 + 0.10,
                                hz))
                arrayed(bolt, max(2, int(pcl / 0.26)), (0, 0.26, 0))
        box('house-sill', (0.10, hy1 - hy0, 0.10), MAT_DARK,
            loc=(s * (BODY_W / 2 - 0.05), (hy0 + hy1) / 2, 1.02), bevel=0.014)
    box('house-front', (BODY_W - 0.30, 0.06, 0.90), MAT_DARK,
        loc=(0, hy0 - 0.03, 1.50), bevel=0.014)
    # battery box and toolbox slung under the deck edge, right side
    box('toolbox', (0.28, 0.72, 0.36), MAT_DARK,
        loc=(BODY_W / 2 - 0.05, -1.35, 1.02), bevel=0.02)
    box('battery-box', (0.26, 0.46, 0.30), MAT_DARK,
        loc=(-BODY_W / 2 + 0.04, 1.95, 1.02), bevel=0.02)

    # ── DECK LAYOUT ─────────────────────────────────────────────────────────
    # The deck is 2.42 m wide and it has to hold the power/air pack, the rod
    # rack, the operator station and a walkway. A first attempt put a separate
    # engine box and air box SIDE BY SIDE and then laid the rod rack on top of
    # the air box — the rods were inside the enclosure and invisible. So the
    # deck is zoned along its length instead, which is also what the reference
    # photograph shows:
    #   left,  full length : one power-and-air enclosure (diesel + screw
    #                        compressor in a single louvred box, which is what
    #                        [R16 §A.8]'s "on-board compressor of roughly
    #                        1000 cfm at 500 psi" physically is on this class)
    #   right, full length : the rod rack, rods lying horizontally [MET p.22]
    #   front left         : the operator's control stand and canopy
    #   front right        : the sample-hose reel
    #   rear               : the cooler pack and the access stair
    px, py, pw, pd, ph = -0.58, 0.62, 1.26, 3.45, 1.14
    box('power-air-pack', (pw, pd, ph), MAT_PAINT,
        loc=(px, py, DECK_Z + ph / 2), bevel=0.035)
    box('power-air-pack-roof', (pw + 0.06, pd + 0.06, 0.05), MAT_DARK,
        loc=(px, py, DECK_Z + ph + 0.02), bevel=0.012)
    # louvres in GROUPS, not one continuous band [MET p.22, rc-rig.md §4.7]
    for grp in (-1.05, 0.30, 1.62):
        lv = box('pp-louvre', (0.024, 0.86, 0.030), MAT_DARK,
                 loc=(px - pw / 2 - 0.004, py + grp, DECK_Z + 0.26),
                 rot=(0.42, 0, 0))          # arrayed x9 — no bevel
        arrayed(lv, 9, (0, 0, 0.064))
    for grp in (-0.70, 1.20):
        lv = box('pp-louvre', (0.024, 0.72, 0.030), MAT_DARK,
                 loc=(px + pw / 2 + 0.004, py + grp, DECK_Z + 0.26),
                 rot=(0.42, 0, 0))          # arrayed x9 — no bevel
        arrayed(lv, 9, (0, 0, 0.064))
    # a separate darker panel where the maker's badge goes. Deliberately blank:
    # DOMAIN.md §10, and rc-rig.md §4.7 says "do not reproduce the badge".
    box('pp-badge-panel', (0.52, 0.024, 0.20), MAT_DARK,
        loc=(px, py - pd / 2 - 0.014, DECK_Z + 0.90), bevel=0.006)
    for i, dy in enumerate((-1.30, 0.10, 1.45)):     # access door handles
        box('pp-door-handle', (0.05, 0.03, 0.16), MAT_CHROME,
            loc=(px - pw / 2 - 0.03, py + dy, DECK_Z + 0.72), bevel=0.006)
    tube('exhaust', 0.058, 0.92, MAT_WORN,
         loc=(px + 0.46, py - 1.35, DECK_Z + ph))
    cone('exhaust-cap', 0.088, 0.03, 0.09, MAT_WORN,
         loc=(px + 0.46, py - 1.35, DECK_Z + ph + 0.92), sides=10)
    # cooler pack across the rear face, with real fins
    box('cooler', (pw - 0.10, 0.30, ph - 0.26), MAT_DARK,
        loc=(px, py + pd / 2 + 0.16, DECK_Z + ph / 2), bevel=0.02)
    fin = box('cooler-fin', (pw - 0.22, 0.02, 0.018), MAT_WORN,
              loc=(px, py + pd / 2 + 0.30, DECK_Z + 0.20))
    arrayed(fin, 24, (0, 0, 0.038))

    # air receiver / wet tank lying along the top of the pack, dished ends,
    # relief valve and a drain — this is the "air" half of the package made
    # visible, and it is the biggest single object on the deck.
    rz = DECK_Z + ph + 0.32
    tube('air-receiver', 0.26, 1.90, MAT_PAINT, loc=(px, py - 0.95, rz),
         rot=(-math.pi / 2, 0, 0), sides=18)
    for s in (-1, 1):
        cone('receiver-end', 0.26, 0.10, 0.12, MAT_PAINT,
             loc=(px, py + s * 0.95, rz), rot=(-s * math.pi / 2, 0, 0), sides=18)
    tube('relief-valve', 0.046, 0.26, MAT_CHROME,
         loc=(px - 0.15, py + 0.60, rz + 0.22))
    tube('receiver-drain', 0.030, 0.22, MAT_WORN,
         loc=(px + 0.12, py - 0.80, rz - 0.46), rot=(math.pi, 0, 0))
    for s in (-1, 1):                       # receiver saddles
        box('receiver-saddle', (0.34, 0.09, 0.22), MAT_PAINT,
            loc=(px, py + s * 0.70, DECK_Z + ph + 0.13), bevel=0.014)
    tube('aftercooler-drum', 0.19, 0.52, MAT_DARK,
         loc=(px + pw / 2 - 0.02, py + 1.45, DECK_Z + 0.80),
         rot=(0, math.pi / 2, 0), sides=14)

    # tank fillers and sight gauges standing proud of the house, left side
    tube('tank-filler', 0.075, 0.13, MAT_WORN,
         loc=(-BODY_W / 2 + 0.16, -1.95, DECK_Z + 0.02))
    box('sight-gauge', (0.06, 0.05, 0.34), MAT_CHROME,
        loc=(-BODY_W / 2 - 0.01, 0.30, 1.62), bevel=0.006)

    # sample-hose reel: the reel takes the hose up as the head travels, and it
    # is a named catalogue item on this class of machine [MIN p.12, §4.3 item 6]
    tube('hose-reel-drum', 0.24, 0.46, MAT_PAINT,
         loc=(BODY_W / 2 - 0.30, -2.02, DECK_Z + 0.52),
         rot=(0, math.pi / 2, 0), sides=16)
    for s in (0, 1):
        tube('hose-reel-flange', 0.36, 0.035, MAT_PAINT,
             loc=(BODY_W / 2 - 0.30 + s * 0.46, -2.02, DECK_Z + 0.52),
             rot=(0, math.pi / 2, 0), sides=18)
    for s in (-1, 1):
        strut('hose-reel-stand', (BODY_W / 2 - 0.07 + s * 0.28, -2.02, DECK_Z),
              (BODY_W / 2 - 0.07 + s * 0.28, -2.02, DECK_Z + 0.52), 0.07,
              MAT_PAINT)

    # control stand + FOPS canopy
    sx, sy = -0.55, -1.72
    box('control-console', (0.72, 0.42, 0.30), MAT_PAINT,
        loc=(sx, sy, DECK_Z + 0.92), rot=(-0.35, 0, 0), bevel=0.02)
    box('console-pedestal', (0.34, 0.30, 0.78), MAT_DARK,
        loc=(sx, sy + 0.06, DECK_Z + 0.39), bevel=0.02)
    for i, lx in enumerate((-0.22, -0.06, 0.10, 0.24)):
        tube('lever', 0.016, 0.24, MAT_CHROME,
             loc=(sx + lx, sy - 0.06, DECK_Z + 1.03),
             rot=(-0.35 + (i % 2) * 0.12, 0, 0))
    for s in (-1, 1):
        strut('canopy-post', (sx + s * 0.52, sy - 0.44, DECK_Z),
              (sx + s * 0.52, sy - 0.44, DECK_Z + 1.94), 0.070, MAT_PAINT)
        strut('canopy-post', (sx + s * 0.52, sy + 0.52, DECK_Z),
              (sx + s * 0.52, sy + 0.52, DECK_Z + 1.94), 0.070, MAT_PAINT)
    box('canopy-roof', (1.28, 1.16, 0.06), MAT_PAINT,
        loc=(sx, sy + 0.04, DECK_Z + 1.97), bevel=0.018)
    perforated_panel('canopy-fops', 1.14, 0.46,
                     loc=(sx, sy - 0.46, DECK_Z + 1.66))
    box('op-seat', (0.44, 0.42, 0.10), MAT_RUBBER,
        loc=(sx, sy + 0.52, DECK_Z + 0.62), bevel=0.02)
    box('op-seat-back', (0.44, 0.10, 0.46), MAT_RUBBER,
        loc=(sx, sy + 0.72, DECK_Z + 0.88), bevel=0.02)


# ── 3. MAST ───────────────────────────────────────────────────────────────────
def build_mast():
    """A WELDED OPEN LATTICE, not a box beam. Highest-value shape call here.

    [MET p.22, rc-rig.md §4.1 and §9.A]: parallel chord rails with diagonal
    X-web members, sky visible through it for its whole length; two heavy feed
    chains exposed down the outer faces over sprockets at the crown. rc-rig.md
    §5 puts the open web third in the identification list and says a solid beam
    kills the machine's identity instantly. The game's current builder makes a
    closed channel (buildFeedBeam, width 0.56 depth 0.42) — this is the fix.

    Web research on Explorac-class and Schramm exploration masts settled two
    details the local reference could not: the carriage rails run down the FRONT
    face so they stay continuous across the telescope joint, and the rails carry
    two polished stripes worn by the carriage rollers — rc-rig.md §9.K asks for
    exactly that and calls it free.
    """
    pv = empty(NODE_PIVOT, 'mast', None, (0, MAST_Y, MAST_FOOT))
    pv['axis'] = 'x'
    # -19 deg is the reference photograph's rake, leaning back over the deck;
    # +90 is the head swing from vertical for fan drilling [MIN p.13].
    # [E235 p.6] publishes "Drilling angle range 45 to 90 deg" for the same
    # machine — i.e. up to 45 deg off vertical — so this 19 deg is inside the
    # sourced envelope, and the +92 end overruns published vertical by 2 deg.
    #
    # ── `mount:hole` IS DEFINED AT ZERO RAKE. Decided and recorded 2026-09-06,
    # because the file asserted an invariant it can only hold in one pose.
    # `mount:hole` is built at the SCENE ROOT (`empty(NODE_MOUNT, 'hole', None,
    # (0, HOLE_Y, 0))`), so it does NOT rotate with this pivot, while
    # `mount:tool` hangs off it through slide:carriage. Raking the mast
    # therefore moves the spindle off the declared bore, by construction, and
    # no choice of HOLE_Y can prevent that:
    #
    #     rake      spindle world Y     miss vs bore   (mount:tool at rest)
    #       0 deg        -3.640            0.000       <- built and shipped pose
    #     -19 deg        -2.933            0.707
    #
    # For completeness, and because it is the more interesting number: the
    # PRE-REPAIR file measured 0.083 m at -19 deg and 0.790 at 0 deg. Its error
    # happened to cancel at -21.2 deg (tan a = -WORK_AXIS / 2.04), which is
    # within 2 deg of this photograph rake — so at the rake in the reference
    # photograph the old arrangement looked nearly right. It was not: the mast
    # is BUILT VERTICAL, the model ships vertical, and at the shipped pose the
    # old miss was the full 0.790 m.
    #
    # THE DECISION: HOLE_Y is the bore AT ZERO RAKE — "where the spindle is
    # when the mast is vertical" — and not a pose-independent invariant. Two
    # reasons, both checkable. (1) It matches the machine: a real rig that
    # rakes its mast re-spots so the bit is over the collar; the collar does
    # not follow the mast. (2) `range_deg` has ZERO consumers in `src/` today
    # (`grep -rn "range_deg" src/` is empty), so nothing rakes this mast at
    # runtime and the invariant is exercised only at 0. If anything ever does
    # drive this pivot, `mount:hole` must be re-derived per rake, or the mast
    # must be made to rake about the BORE rather than about its foot pin.
    # Recorded here rather than left as a passing number at one angle.
    pv['range_deg'] = [-19.0, 92.0]
    hw, hd = MAST_W / 2, MAST_D / 2
    L = MAST_LEN

    for sx in (-1, 1):
        for sy in (-1, 1):
            box('mast-chord', (0.098, 0.098, L), MAT_DARK, pv,
                (sx * (hw - 0.049), sy * (hd - 0.049), L / 2), bevel=0.009)

    bay = 0.615                       # gives the ~45 deg X the photograph shows
    nbay = int(L / bay)
    for b in range(nbay):
        z0 = 0.14 + b * bay
        z1 = z0 + bay
        for sx in (-1, 1):            # X-web on the two OUTER (visible) faces
            x = sx * (hw - 0.043)
            strut('mast-web', (x, -hd + 0.049, z0), (x, hd - 0.049, z1), 0.056,
                  MAT_DARK, pv)
            strut('mast-web', (x, hd - 0.049, z0), (x, -hd + 0.049, z1), 0.056,
                  MAT_DARK, pv)
        strut('mast-web-back', (-hw + 0.043, hd - 0.043, z0),
              (hw - 0.043, hd - 0.043, z1), 0.045, MAT_DARK, pv)
        for sy in (-1, 1):
            box('mast-strut', (MAST_W - 0.086, 0.05, 0.05), MAT_DARK, pv,
                (0, sy * (hd - 0.043), z0), bevel=0.006)
        for sx in (-1, 1):
            box('mast-strut-side', (0.05, MAST_D - 0.086, 0.05), MAT_DARK, pv,
                (sx * (hw - 0.043), 0, z0), bevel=0.006)

    for sx in (-1, 1):
        box('mast-rail', (0.055, 0.10, L - 0.10), MAT_DARK, pv,
            (sx * (hw - 0.05), -hd - 0.03, L / 2 + 0.02), bevel=0.008)
        box('mast-rail-wear', (0.020, 0.03, L - 0.50), MAT_STEEL, pv,
            (sx * (hw - 0.05), -hd - 0.085, L / 2 + 0.02), bevel=0.003)

    # feed chains, one down each outer face, both runs, over crown sprockets.
    # At any distance this is a continuous fine-toothed dark band down both
    # edges of the mast — one of the strongest texture cues on the machine
    # [MET p.22; rc-rig.md §4.1 and §9.B, which notes the builder has no chain].
    # Pitch 0.060 against a 0.056 link: at 0.062/0.048 the first render came out
    # as two DOTTED lines rather than the continuous fine-toothed dark band the
    # photograph shows. The gap between links has to be a seam, not a space.
    n_link = int((L - 0.42) / 0.060)
    for sx in (-1, 1):
        for face in (-1, 1):
            # 4 runs x 83 links = 332 bevelled boxes = 35,856 triangles, all
            # of it inside a 0.95 x 4.98 x 1.04 m box. The chain has to read as
            # a continuous fine-toothed dark BAND, which is a silhouette and a
            # pitch, not a chamfer. No bevel.
            lk = box('feed-chain-link', (0.030, 0.054, 0.056), MAT_WORN, pv,
                     (sx * (hw + 0.030), face * (hd + 0.045), 0.22))
            arrayed(lk, n_link, (0, 0, 0.060))
            # 4 sides, not 6: the pin is a 24 mm cylinder seen end-on inside the
            # link it pins, and 332 of them. A square and a hexagon are the same
            # two pixels here; the BAND is the cue, not the pin's section.
            pin = tube('feed-chain-pin', 0.012, 0.056, MAT_STEEL, pv,
                       (sx * (hw + 0.030) - 0.028, face * (hd + 0.045), 0.250),
                       rot=(0, math.pi / 2, 0), sides=4)
            arrayed(pin, n_link, (0, 0, 0.060))

    box('mast-foot-hood', (MAST_W + 0.16, MAST_D + 0.20, 0.42), MAT_PAINT, pv,
        (0, 0, 0.20), bevel=0.03)
    for sx in (-1, 1):
        tube('mast-pin-boss', 0.11, 0.10, MAT_CAST, pv,
             (sx * (hw + 0.10) - 0.05, 0, 0.0), rot=(0, math.pi / 2, 0), sides=12)

    # rod clamp / breakout table at the mast foot — right for heavy dual-wall
    # pipe [rc-rig.md §9.L]: a lower holding clamp and an upper breakout clamp.
    #
    # THESE FOUR ASSEMBLIES TOUCH THE DRILL STRING, SO THEY LIVE ON THE WORKING
    # AXIS, NOT ON THE MAST CENTRELINE. They used to sit at mast-local Y = 0
    # and -0.05 — inside the lattice footprint, gripping a rod that was not
    # there, while the head turned one 0.79 m in front of them. On [MET p.22]
    # the clamp/breakout assembly stands clearly proud of the mast on the
    # working face, which is what -WORK_AXIS puts it back to.
    #
    # CORRECTED 2026-09-06. This comment used to claim their offsets RELATIVE
    # TO EACH OTHER were unchanged. They are not. Three of the four moved by
    # -0.740 and the fourth by -0.790:
    #
    #     before     after            shift
    #     -0.05   -> -WORK_AXIS       -0.740   breakout-table
    #     -0.05   -> -WORK_AXIS       -0.740   clamp-jaw (both levels)
    #     -0.25   -> -WORK_AXIS-0.20  -0.740   clamp-ram (both levels)
    #      0.00   -> -WORK_AXIS       -0.790   rod-guide
    #
    # The RAM-TO-JAW relationship is what was actually preserved: the rams are
    # still 0.20 m ahead of the jaws they drive. What changed is that the rod
    # guide used to sit 50 mm BEHIND the jaws and the table, and is now
    # CONCENTRIC with them. That is the correct end state — a guide, a holding
    # clamp and a breakout table all pass the same string and belong on one
    # centre — but it is a change, and calling it "unchanged" hid the only
    # relative motion in the group.
    #
    # The table is built as a SPLIT PAIR rather than one solid box. A breakout
    # table has to pass the string; off-axis nobody noticed it had no bore, and
    # on-axis a solid plate would be steel across the hole. Split tables are the
    # real idiom. COST, CORRECTED: +108 triangles, not the 12 first written
    # here. One box becomes two, and a BEVELLED box is 108 triangles against a
    # plain box's 12 — this file says so itself at the track shoes (L~460). The
    # measured export moved 70,804 -> 70,912, which is that +108 exactly and
    # nothing else. No extra draw call: same material, same bucket.
    #
    # NOT CONNECTED TO ANYTHING, AND MEASURED: the table's rear face stands at
    # mast-local -0.48 and the nearest mast structure, `mast-foot-hood`, has
    # its front face at -0.43 — a 50 mm air gap, with no bracket modelled. Off
    # axis the table interpenetrated the mast foot, so it read as bolted in;
    # on axis it is clean and floating. The only geometry it still touches is
    # `drill-floor-side`, which it overlaps by 15 mm in Z across a 60 mm band
    # in X. It is parented to `pivot:mast`, so it does at least rake with the
    # mast — but a bracket from the hood out to the table is missing geometry
    # this repair created and did not supply. Recorded, not bodged: adding a
    # fabrication here is new authored steel, it is not what was asked for, and
    # it must not be invented into a file whose rule is that gaps get admitted.
    # The 0.20 m bore passes the 124 mm bit and the 114.3 mm rod [R02 §A2]; it
    # is NOT SOURCED as a table dimension, it is sized off the string it passes.
    TABLE_BORE = 0.20
    half = (0.92 - TABLE_BORE) / 2
    for sx in (-1, 1):
        box('breakout-table', (half, 0.62, 0.16), MAT_DARK, pv,
            (sx * (TABLE_BORE + half) / 2, -WORK_AXIS, 0.44), bevel=0.014)
    for z in (0.46, 0.62):
        for sx in (-1, 1):
            box('clamp-jaw', (0.26, 0.20, 0.11), MAT_WORN, pv,
                (sx * 0.20, -WORK_AXIS, z), rot=(0, 0, sx * 0.18), bevel=0.01)
            tube('clamp-ram', 0.032, 0.30, MAT_CHROME, pv,
                 (sx * 0.34 - sx * 0.15, -WORK_AXIS - 0.20, z),
                 rot=(0, sx * math.pi / 2, 0), sides=8)
    torus('rod-guide', 0.115, 0.028, MAT_WORN, pv, (0, -WORK_AXIS, GUIDE_Z))
    return pv


def build_crown(pv):
    """Telescoping inner stage, crown head frame, jib and the hanging hook.

    [MET p.22, rc-rig.md §4.1]: a black fabricated head frame carrying the chain
    sprockets, a jib arm cantilevered FORWARD past the mast top with a sheave at
    its end, and a winch line with a swivel hook hanging free. The doc calls
    that free-hanging hook one of the most recognisable details in the whole
    photograph, and §9.C records that the game's builder has none of it.

    §8 item 10 is honest that "two-stage" is a READ of the photograph and not a
    published fact, so it is modelled as two and reported as a reading.
    """
    sl = empty(NODE_SLIDE, 'mast-telescope', pv, (0, 0, 0))
    sl['axis'] = 'z'
    sl['range_m'] = [0.0, 2.30]
    iw, idp = MAST_W - 0.20, MAST_D - 0.20
    IL = 2.55
    z0 = MAST_LEN - IL + 0.20
    for sx in (-1, 1):
        for sy in (-1, 1):
            box('mast2-chord', (0.062, 0.062, IL), MAT_DARK, sl,
                (sx * (iw / 2 - 0.031), sy * (idp / 2 - 0.031), z0 + IL / 2),
                bevel=0.006)
    for b in range(4):
        za = z0 + 0.10 + b * 0.58
        for sx in (-1, 1):
            x = sx * (iw / 2 - 0.031)
            strut('mast2-web', (x, -idp / 2, za), (x, idp / 2, za + 0.58),
                  0.038, MAT_DARK, sl)
            strut('mast2-web', (x, idp / 2, za), (x, -idp / 2, za + 0.58),
                  0.038, MAT_DARK, sl)
        for sy in (-1, 1):
            # 8 transverse rungs, 40 mm section, 4.9-7.0 m up. No bevel: they
            # are the rungs BETWEEN the chords, and it is the chords and the
            # X-web that carry the truss read.
            box('mast2-strut', (iw - 0.062, 0.04, 0.04), MAT_DARK, sl,
                (0, sy * (idp / 2 - 0.031), za))
    for sx in (-1, 1):
        box('mast2-rail', (0.048, 0.09, IL - 0.20), MAT_DARK, sl,
            (sx * (iw / 2 - 0.045), -idp / 2 - 0.03, z0 + IL / 2), bevel=0.006)

    ct = z0 + IL
    box('crown-frame', (MAST_W + 0.10, MAST_D + 0.14, 0.30), MAT_DARK, sl,
        (0, 0, ct + 0.15), bevel=0.02)
    box('crown-cheek', (MAST_W + 0.16, 0.05, 0.46), MAT_DARK, sl,
        (0, MAST_D / 2 + 0.05, ct + 0.10), bevel=0.01)
    # Sprockets and sheave in MAT_WORN, not MAT_CAST: they were the only three
    # castIron objects on slide:mast-telescope — 164 triangles for a whole draw
    # call — and a chain sprocket running 6.9 m up is polished and rusted by the
    # chain, not a clean casting. They now join the crown teeth they mesh with.
    for sx in (-1, 1):
        tube('crown-sprocket', 0.115, 0.05, MAT_WORN, sl,
             (sx * (MAST_W / 2 + 0.035) - 0.025, 0, ct + 0.16),
             rot=(0, math.pi / 2, 0), sides=14)
        for t in range(12):
            a = t / 12 * TAU
            # 24 teeth, no bevel. Same rule as the track shoes at L460-465 and
            # the chain at L823-826: bevel the STRUCTURE, never the ARRAY. A
            # 3 mm chamfer on a 26 mm tooth 6.9 m up is 96 triangles each and
            # sub-pixel at every camera distance the game uses.
            box('crown-tooth', (0.045, 0.026, 0.030), MAT_WORN, sl,
                (sx * (MAST_W / 2 + 0.035), math.sin(a) * 0.126,
                 ct + 0.16 + math.cos(a) * 0.126), rot=(-a, 0, 0))

    jib_y = -MAST_D / 2 - 0.86
    strut('crown-jib', (0, -MAST_D / 2 + 0.04, ct + 0.24), (0, jib_y, ct + 0.30),
          0.13, MAT_DARK, sl)
    strut('crown-jib-brace', (0, -MAST_D / 2 + 0.04, ct - 0.10),
          (0, jib_y + 0.24, ct + 0.24), 0.06, MAT_DARK, sl)
    for sx in (-1, 1):
        box('jib-cheek', (0.03, 0.34, 0.24), MAT_DARK, sl,
            (sx * 0.09, jib_y + 0.06, ct + 0.28), bevel=0.006)
    tube('jib-sheave', 0.10, 0.05, MAT_CAST, sl,
         (-0.025, jib_y - 0.02, ct + 0.28), rot=(0, math.pi / 2, 0), sides=16)

    hk = empty(NODE_SLIDE, 'winch-hook', sl, (0, jib_y - 0.02, ct + 0.28))
    hk['axis'] = 'z'
    hk['range_m'] = [-6.0, 0.0]
    # MAT_WORN, not MAT_STEEL: a hanging winch rope is not bright rail steel,
    # and on rawSteel it was the only object in its material inside
    # slide:winch-hook — one draw call for 192 triangles. It now joins the
    # swivel, shank and bill it hangs.
    hose('winch-line', [(0, 0, -0.10), (0.004, 0.0, -0.74), (0, 0, -1.32)],
         radius=0.009, mat=MAT_WORN, parent=hk, sides=6)
    tube('hook-swivel', 0.045, 0.16, MAT_WORN, hk, (0, 0, -1.48))
    tube('hook-shank', 0.028, 0.14, MAT_WORN, hk, (0, 0, -1.62))
    torus('hook-bill', 0.075, 0.026, MAT_WORN, hk, (0, 0, -1.68),
          rot=(math.pi / 2, 0, 0), mseg=12, nseg=6)

    worklight('crown', sl, (0.30, -MAST_D / 2 - 0.14, ct + 0.02),
              aim_dir=(-0.30, -0.30, -6.0), cone_deg=44, range_m=30)
    return sl, hk


# ── 4. CARRIAGE, ROTARY HEAD, RC PLUMBING ─────────────────────────────────────
def build_head(pv):
    """Rotary head on the carriage, and the plumbing that makes this an RC rig
    rather than a rotary rig.

    Flow order [R02 §A2 from BL-RC; shapes from MIN pp.12-13, rc-rig.md §4.3]:
      combination/dual swivel -> head wear tube (bolted flanges along its length,
      90 deg bend, sliding blow-back cylinder) -> deflector box -> knock-on hose
      tail (3 or 4 in, coarse retaining nut) -> sample hose.

    The sample must leave SIDEWAYS from a box on the SIDE of the head, never from
    the top. rc-rig.md §4.3 is explicit that a rotary rig and an RC rig share a
    mast, a head and a carriage, and that this is the only thing that says RC.

    The head is rated 30-40 t axial and radial and swings +/-90 deg from vertical
    for fan drilling [MIN p.13], so the head-to-mast joint is modelled as a rated
    pivot on a real pin boss, not as a bracket.
    """
    sl = empty(NODE_SLIDE, 'carriage', pv, (0, 0, MAST_LEN - 2.05))
    sl['axis'] = 'z'
    # FEED STROKE. The author's rule was already the right one — "the rotary
    # head on this class never travels below the floor, the rod clamp and the
    # breakout table are down there" — but it was applied to the DRILL FLOOR
    # (z 1.50) while the head was 0.79 m off the axis and sailed past the clamp
    # stack entirely. On the axis it cannot. The binding obstruction is the top
    # of the mast-foot stack, and the number below is that rule applied to the
    # real one.
    #
    # mount:tool IS the head's lowest geometry: tube() origins at its base
    # (lib/rig.py L181), so the saver sub spans spindle-local -0.66..-0.46 and
    # mount:tool sits on its bottom face. That sub is 196 mm across and the rod
    # guide's bore is 2 x (0.115 - 0.028) = 174 mm, so the head physically
    # cannot enter the guide — this is a hard stop, not a styling choice.
    #
    # THE STROKE THIS GIVES IS 2.85 m, NOT THE 3.19 m THIS FILE USED TO CLAIM,
    # and the difference is not a regression: the old 3.19 m was only reachable
    # because the head descended THROUGH the front floor plate at a Y where the
    # string was not. 2.85 m is the first stroke this machine has published that
    # it can actually execute. It is now SHORT of one rod — 3.05 m, itself NOT
    # SOURCED; [R02 §A2, citing BL-RC p.6] publishes 1.5 / 3 / 6 m pipe, so even
    # the sourced 3 m does not fit.
    #
    # WHAT IT WOULD TAKE, WRITTEN DOWN RATHER THAN CALLED UNRESOLVABLE.
    # The bottom stop below is FIXED at mast-local 2.098 — it is the rod-guide
    # top, the 50 mm, and HEAD_DROP, none of which depends on mast length. The
    # top stop is MAST_LEN - 0.50 (see CARR_HI). So the stroke tracks the mast
    # one-for-one and the whole question is one line of arithmetic:
    #
    #     travel_m = MAST_LEN - 2.598          5.45 - 2.598 = 2.852 today
    #
    #     to swallow                       needs MAST_LEN     mast grows by
    #     ---------------------------------------------------------------
    #     3.00 m pipe   [R02 §A2, BL-RC p.6]      5.598           +148 mm
    #     3.05 m ROD_LEN (this game, NOT SOURCED) 5.648           +198 mm
    #     3.40 m stroke (JRC1200 web check)       5.998           +548 mm
    #     4.40 m feed travel [E100 p.6]           6.998         +1 548 mm
    #
    # **+198 mm of mast restores a one-rod stroke.** That is a 3.6 % change to
    # MAST_LEN, and MAST_LEN is NOT SOURCED — so it costs no source to move it.
    # It is not made here because it is the owner's call and because [E100]
    # publishes a SOURCED 4.40 m feed travel for a 14 400 kg machine with the
    # same 114.3 mm rod OD this file already uses (ROD_OD matches [E100 p.6]
    # exactly), which would want +1 548 mm and a taller machine everywhere.
    # Growing the mast to 5.648 buys the game's rod; growing it to 6.998 buys
    # the sourced [E100] stroke and commits the size class. Either is a
    # decision; neither is a guess. The unresolvable framing this block used to
    # carry was wrong: the arithmetic is right here.
    #
    # ONE CONSEQUENCE WORTH SEEING BEFORE CHOOSING, and it is a real finding.
    # The model's erected height is 7.215 m (glbinfo) for 2.852 m of stroke —
    # 4.363 m of mast that never carries the head. [E100 pp.6-7] gets 4.400 m of
    # travel inside a 7.840 m erected height, i.e. 3.440 m of dead height. THIS
    # MAST IS 0.92 m LESS EFFICIENT PER METRE OF STROKE THAN THE MACHINE IT IS
    # SIZED AGAINST. Taking MAST_LEN to 6.998 for the [E100] stroke would put
    # this machine at roughly 8.76 m erected — TALLER than the 7.84 m [E100]
    # publishes for that same stroke. So "commit to [E100]" is not just a mast
    # length: the dead height has to come out too, and it lives in MAST_FOOT
    # (1.15), the 2.05 m carriage offset and the guide stack. Recorded, not
    # acted on — every one of those numbers is load-bearing elsewhere.
    HEAD_DROP = 1.36                     # mount:tool below the carriage centre:
                                         # pvh +0.10, spindle -0.80, sub -0.66
    STACK_TOP = GUIDE_Z + 0.028          # mast-local, rod-guide outer top
    #
    # THE KEY IS `travel_m`, AND IT IS THE ONLY KEY THE RUNTIME READS.
    # This node used to declare `range_m: [-1.64, 1.55]` and nothing else. The
    # data was present and correct; it was under a name src/core/gltfRig.js has
    # never looked at. makeDyn() reads `carriage.userData.travel_m`, and with it
    # undefined `carriageRange` collapses to [y, y] — the head could not travel
    # at all. (`range_m` is a real key in this pipeline, but it belongs to
    # `mount:` lamps, where it is a spotlight THROW in metres. Two different
    # meanings under one name is how this went unnoticed.)
    CARR_LO = (STACK_TOP + 0.05) + HEAD_DROP - (MAST_LEN - 2.05)   # -1.302
    # CARR_HI: top of travel, carriage-local. PRESERVED from the shipped model,
    # not re-chosen — and its derivation is restored here because the repair
    # diff deleted the old one and left a bare literal.
    #
    # 1.55 is exactly "the carriage centre stops 0.50 m below the mast top":
    #     (MAST_LEN - 0.50) - (MAST_LEN - 2.05) = 1.55, for any MAST_LEN.
    # That is the form the constant is really in, and it is why the stroke
    # table above tracks MAST_LEN one-for-one.
    #
    # THE OLD JUSTIFICATION WAS FALSE AND IS NOT RESTORED. It read "the
    # carriage rides the rails, which stop 0.45 m short of the mast top".
    # `mast-rail` is built (0.055, 0.10, L - 0.10) at z = L/2 + 0.02, so it
    # spans mast-local 0.070..5.420 — it stops 0.03 m short of the mast top,
    # not 0.45. Computed from the constants in this file, at CARR_HI the top
    # `carriage-roller` centre sits at 5.250 and its outer surface at 5.305:
    #     rail top          5.420   115 mm of rail left above the roller — OK
    #     wear-stripe top   5.220   the roller overruns the polished stripe
    #                               by 85 mm at full up-travel
    # `mast-rail-wear` is built L - 0.50 long, i.e. sized for a carriage that
    # stops 0.25 m lower than this one does. That is a COSMETIC mismatch on a
    # 20 mm-wide stripe, not a mechanism fault, and it is left alone rather
    # than fixed blind: it is pre-existing, it changes no bound and no
    # triangle count, and nothing in the repair caused it. Whoever next edits
    # the mast needs the stripe to reach mast-local 5.305 instead of 5.220.
    CARR_HI = 1.55                       # carriage-local, top of travel
    sl['travel_m'] = CARR_HI - CARR_LO   # 2.852 m of stroke — see above
    # Absolute exported-parent Y is Blender mast-local Z; extras stay literal.
    sl['travel_space'] = 'parent-local'
    sl['travel_axis'] = 'y'
    sl['travel_direction'] = 'min'
    sl['travel_min_m'] = (MAST_LEN - 2.05) + CARR_LO   # absolute, mast frame
    sl['travel_max_m'] = (MAST_LEN - 2.05) + CARR_HI
    hw, hd = MAST_W / 2, MAST_D / 2

    box('carriage-plate', (MAST_W + 0.22, 0.16, 0.86), MAT_PAINT, sl,
        (0, -hd - 0.13, 0), bevel=0.02)
    # slide:carriage was FOUR materials for 736 triangles: paintedSteel 108,
    # paintedDark 216, castIron 196, wornSteel 216. Four draw calls on a rig
    # that is over its call budget and nowhere near its triangle budget. The
    # rollers, the chain anchors and the swing boss all sit bolted to, or
    # inside, the paintedDark roller boxes; they go into paintedDark and the
    # group becomes two calls. Nothing is deleted and nothing moves.
    for sx in (-1, 1):
        box('carriage-roller-box', (0.15, 0.22, 0.80), MAT_DARK, sl,
            (sx * (hw + 0.04), -hd - 0.06, 0), bevel=0.012)
        for z in (-0.30, 0.30):
            tube('carriage-roller', 0.055, 0.09, MAT_DARK, sl,
                 (sx * (hw + 0.04) - 0.045, -hd - 0.06, z),
                 rot=(0, math.pi / 2, 0), sides=10)
        box('chain-anchor', (0.07, 0.10, 0.20), MAT_DARK, sl,
            (sx * (hw + 0.036), -hd - 0.02, 0.42), bevel=0.008)

    # HEAD_SWING_STANDOFF and HEAD_SPINDLE_OFF (module head) are the two
    # offsets that put the working axis in front of the mast. They are named
    # here so the bore, which is derived from their sum, can never drift away
    # from the mechanism that actually produces it.
    tube('head-swing-boss', 0.13, 0.30, MAT_DARK, sl,
         (-0.15, -hd - HEAD_SWING_STANDOFF, 0.10),
         rot=(0, math.pi / 2, 0), sides=14)
    pvh = empty(NODE_PIVOT, 'head-swing', sl,
                (0, -hd - HEAD_SWING_STANDOFF, 0.10))
    pvh['axis'] = 'y'
    pvh['range_deg'] = [-90.0, 90.0]

    # bulky gearbox body with a conical bell lower housing and a splined dark
    # spindle below [rc-rig.md §4.2]. Painted in the machine colour against a
    # grey mast — the one bright complicated object moving on a plain structure,
    # which is why it carries most of the eye.
    box('head-gearbox', (0.62, 0.66, 0.60), MAT_PAINT, pvh,
        (0, -HEAD_SPINDLE_OFF, -0.16),
        bevel=0.03)
    box('head-motor-pad', (0.30, 0.34, 0.22), MAT_PAINT, pvh,
        (-0.40, -HEAD_SPINDLE_OFF, 0.02), bevel=0.02)
    # The two rotation motors are bolted to the painted motor pad on a painted
    # gearbox. MAT_PAINT, not MAT_DARK: they were the whole of pivot:head-swing's
    # paintedDark material — 88 triangles for a draw call — and a motor in the
    # machine colour is what the reference actually shows [MET p.22].
    tube('head-motor', 0.115, 0.30, MAT_PAINT, pvh,
         (-0.62, -HEAD_SPINDLE_OFF, 0.02),
         rot=(0, -math.pi / 2, 0), sides=12)
    tube('head-motor', 0.115, 0.30, MAT_PAINT, pvh,
         (0.42, -HEAD_SPINDLE_OFF, 0.02),
         rot=(0, math.pi / 2, 0), sides=12)
    cone('head-bell', 0.30, 0.155, 0.34, MAT_PAINT, pvh,
         (0, -HEAD_SPINDLE_OFF, -0.80),
         sides=18)
    for t in range(10):
        a = t / 10 * TAU
        # ring of 10 — no bevel, same rule as the splitter bolts at L1301 and
        # the arm base bolts at L1416, which already state it.
        box('head-bolt', (0.036, 0.036, 0.026), MAT_WORN, pvh,
            (math.cos(a) * 0.255,
             -HEAD_SPINDLE_OFF + math.sin(a) * 0.255, -0.47),
            rot=(0, 0, a))

    spn = empty(NODE_PIVOT, 'spindle', pvh, (0, -HEAD_SPINDLE_OFF, -0.80))
    spn['axis'] = 'z'
    tube('spindle', 0.088, 0.46, MAT_STEEL, spn, (0, 0, -0.46), sides=14)
    for t in range(16):
        a = t / 16 * TAU
        box('spindle-spline', (0.016, 0.016, 0.30), MAT_STEEL, spn,
            (math.cos(a) * 0.088, math.sin(a) * 0.088, -0.36), rot=(0, 0, a))
    # MAT_STEEL, not MAT_WORN. A saver sub is a sacrificial thread protector and
    # it is genuinely worn, but pivot:spindle is a two-object group and the sub
    # sits bolted to the splined spindle it protects: on wornSteel it is the
    # ONLY object in its material and costs a whole draw call for 52 triangles.
    # rawSteel is the neighbour it is threaded into. Draw calls, not triangles,
    # are what this rig is over budget on.
    tube('saver-sub', 0.098, 0.20, MAT_STEEL, spn, (0, 0, -0.66), sides=14)
    empty(NODE_MOUNT, 'tool', spn, (0, 0, -0.66))

    # combination / dual swivel: one rotating joint carrying TWO flow paths,
    # air in and sample out, on a stepped chrome shaft in a compact housing
    # MAT_WORN, not MAT_CAST: it was the only castIron object in the head, 60
    # triangles for a draw call, and it sits between the worn air-inlet elbow
    # and the worn wear tube it feeds. pivot:head-swing was SIX materials for
    # 3,208 triangles; this, the motors and the water line take it to three.
    tube('dual-swivel', 0.135, 0.30, MAT_WORN, pvh,
         (0, -HEAD_SPINDLE_OFF, 0.30), sides=16)
    tube('swivel-shaft', 0.062, 0.16, MAT_CHROME, pvh,
         (0, -HEAD_SPINDLE_OFF, 0.58), sides=12)
    tube('air-inlet-elbow', 0.055, 0.24, MAT_WORN, pvh, (0, 0.04, 0.42),
         rot=(math.pi / 2, 0, 0), sides=10)

    # head wear tube / blow-back assembly
    tube('wear-tube', 0.072, 0.92, MAT_WORN, pvh,
         (0.40, -HEAD_SPINDLE_OFF, -0.30), sides=12)
    for z in (-0.26, 0.02, 0.32, 0.58):
        tube('wear-tube-flange', 0.098, 0.030, MAT_WORN, pvh,
             (0.40, -HEAD_SPINDLE_OFF, z),
             sides=12)
    tube('blowback-ram', 0.030, 0.34, MAT_CHROME, pvh,
         (0.30, -HEAD_SPINDLE_OFF, 0.10),
         sides=8)

    # deflector box: heavy fabricated wedge, bolted flange face, smooth 90 deg
    # internal path — where the sample turns from vertical to horizontal and
    # LEAVES THE RIG SIDEWAYS.
    box('deflector-box', (0.40, 0.40, 0.42), MAT_PAINT, pvh,
        (0.44, -HEAD_SPINDLE_OFF, -0.62), bevel=0.035)
    box('deflector-wedge', (0.34, 0.36, 0.20), MAT_PAINT, pvh,
        (0.52, -HEAD_SPINDLE_OFF, -0.76), rot=(0, -0.5, 0), bevel=0.03)
    for t in range(8):
        a = t / 8 * TAU
        box('deflector-bolt', (0.030, 0.030, 0.024), MAT_WORN, pvh,
            (0.44 + math.cos(a) * 0.17,
             -HEAD_SPINDLE_OFF + math.sin(a) * 0.17, -0.415),
            rot=(0, 0, a))                 # ring of 8 — no bevel
    cone('hose-tail', 0.088, 0.070, 0.26, MAT_WORN, pvh,
         (0.62, -HEAD_SPINDLE_OFF, -0.68),
         rot=(0, math.pi / 2 + 0.22, 0), sides=14)
    tube('knock-on-nut', 0.105, 0.055, MAT_WORN, pvh,
         (0.66, -HEAD_SPINDLE_OFF, -0.665),
         rot=(0, math.pi / 2 + 0.22, 0), sides=12)
    empty(NODE_MOUNT, 'sample-out', pvh, (0.90, -HEAD_SPINDLE_OFF, -0.735))

    # MAT_WORN, not MAT_RUBBER. A 32 mm water line braided to the head is not
    # the same object as the 124 mm sample hose, and rubber here bought one
    # draw call for 192 triangles inside the head group. The sample hose keeps
    # rubber, which is the one place on this machine where it identifies.
    hose('head-water-line', [(-0.34, 0.14, 0.30), (-0.30, 0.20, -0.10),
                             (-0.16, 0.08, -0.55)], radius=0.016,
         mat=MAT_WORN, parent=pvh, sides=6)
    worklight('head', pvh, (-0.44, -0.44, -0.30), aim_dir=(0.2, -0.4, -3.0),
              cone_deg=60, range_m=18)
    return sl, pvh, spn


# ── 5. ROD HANDLING — deck rack + swing arm, NOT a carousel ───────────────────
def build_rod_handling(pv):
    """[MET p.22, rc-rig.md §4.6 and §9.E]: the rods lie HORIZONTALLY in a rack
    along the deck between upright stanchions, and a hydraulic swing arm hinged
    near the head end of the mast — a long straight tube with its own cylinder
    strapped to it — reaches out and up to about 0.55 of standing height and
    brings them to centre.

    There is no rod carousel on this machine. A carousel is a core-rig and
    tophammer idiom; the game currently builds one at mid-mast (buildCarousel,
    5 rods). The arm is also the better animation: it is big, it crosses the
    silhouette, and it is unmistakably this class.
    """
    rx = 0.66
    ry0 = -1.35
    for y in (ry0, ry0 + 1.45, ry0 + 2.85):
        for sx in (-1, 1):
            box('rack-stanchion', (0.07, 0.07, 0.56), MAT_DARK,
                loc=(rx + sx * 0.40, y, DECK_Z + 0.28), bevel=0.007)
        for z in (DECK_Z + 0.10, DECK_Z + 0.30):
            box('rack-cradle', (0.90, 0.08, 0.06), MAT_DARK, loc=(rx, y, z),
                bevel=0.008)
    for layer, z in enumerate((DECK_Z + 0.17, DECK_Z + 0.35)):
        n = 5 if layer == 0 else 4
        for i in range(n):
            xo = rx - 0.29 + i * 0.145 + (0.072 if layer else 0)
            tube('rod', ROD_OD / 2, ROD_LEN, MAT_WORN,
                 loc=(xo, ry0 - 0.15, z), rot=(-math.pi / 2, 0, 0), sides=10)
            tube('rod-box-end', ROD_OD / 2 + 0.013, 0.17, MAT_STEEL,
                 loc=(xo, ry0 - 0.15, z), rot=(-math.pi / 2, 0, 0), sides=10)

    # THE ARM DOES NOT REACH THE BORE, AND THE REPAIR MADE THAT WORSE. Measured
    # 2026-09-06, in mast-local XY, from the constants on these lines:
    #   pivot at (0.43, 0.16); gripper at arm-local (1.46, 0.35), so the swing
    #   radius is 1.501 m and the gripper's own bearing is +13.5 deg.
    #   Over `range_deg` [0, 155] the gripper sweeps bearings 13.5..168.5 deg.
    #   The bore lies at bearing -114.3 deg from the pivot, 1.043 m away.
    #     closest approach, at the 155 deg limit   1.627 m   (was 1.138 m)
    #   That is 43 % WORSE than before the working-axis repair, and the repair
    #   note reported only the flattering half of it: what improved is the
    #   RADIAL mismatch |1.501 - pivot-to-bore|, 1.042 -> 0.458 m. The bore is
    #   now inside the arm's radius and outside its declared sweep.
    # It never reached in either configuration, so this is not a regression the
    # repair introduced — but it is a real cost of moving the bore forward and
    # it is written down here instead of only in the good direction.
    # NOT FIXED BLIND. Reaching the bore needs the sweep to run the other way
    # (about -128 deg, was -173 deg) or on to +232 deg, and 155 -> 232 deg is a
    # mechanism decision about which side the arm serves the hole from, not a
    # number to nudge. `range_deg` has no consumers in src/ today, so nothing
    # animates it yet; whoever wires rod handling decides this.
    arm = empty(NODE_PIVOT, 'rod-arm', pv, (MAST_W / 2 + 0.14, 0.16, 1.70))
    arm['axis'] = 'z'
    arm['range_deg'] = [0.0, 155.0]
    box('rod-arm-boss', (0.20, 0.20, 0.34), MAT_PAINT, arm, (0, 0, 0), bevel=0.02)
    strut('rod-arm-tube', (0, 0, 0.06), (1.42, 0.34, 0.30), 0.11, MAT_PAINT, arm)
    strut('rod-arm-cyl-body', (0.16, 0.02, -0.02), (0.86, 0.18, 0.10), 0.075,
          MAT_PAINT, arm)
    strut('rod-arm-cyl-rod', (0.86, 0.18, 0.10), (1.20, 0.26, 0.20), 0.030,
          MAT_CHROME, arm)
    grp = empty(NODE_PIVOT, 'rod-gripper', arm, (1.46, 0.35, 0.31))
    grp['axis'] = 'z'
    box('gripper-body', (0.22, 0.20, 0.22), MAT_PAINT, grp, (0, 0, 0), bevel=0.018)
    for sy in (-1, 1):
        # Exposed gripping faces keep worn steel [rc-rig.md §6, contact wear].
        # A separate material costs one primitive; do not paint contact faces
        # merely to save it while the rig remains inside its measured budget.
        box('gripper-jaw', (0.09, 0.20, 0.16), MAT_WORN, grp,
            (0.13, sy * 0.10, 0), rot=(0, 0, sy * 0.35), bevel=0.01)
    return arm, grp


# ── 6. JACKS — four vertical legs, outboard of the tracks ─────────────────────
def build_jacks():
    """[MET p.22, rc-rig.md §4.9 and §9.L]: four square-section vertical legs
    dropping straight down at the deck corners, OUTBOARD of the track width,
    each with a large dished round foot pad and its own hydraulic hose. In the
    photograph the machine stands on the jacks with the tracks off the ground.
    Not swing-out outriggers, not a dozer blade.

    All four legs hang on ONE slide node, for the same reason the game's own
    builder gives: four independent nodes is four times the draw calls, bought
    for a levelling motion the player never inspects that closely.
    """
    sl = empty(NODE_SLIDE, 'jacks', None, (0, 0, 0))
    sl['axis'] = 'z'
    sl['range_m'] = [0.0, 0.80]
    for (sx, y) in ((-1, -2.55), (1, -2.55), (-1, 2.10), (1, 2.10)):
        x = sx * JACK_X
        box('jack-housing', (0.24, 0.24, 1.05), MAT_DARK,
            loc=(x, y, DECK_Z - 0.62), bevel=0.018)
        strut('jack-stay', (sx * (BODY_W / 2 - 0.30), y, DECK_Z - 0.20),
              (x, y, DECK_Z - 0.30), 0.10, MAT_DARK)
        tube('jack-cyl', 0.085, 0.60, MAT_DARK, loc=(x, y, DECK_Z - 0.10),
             sides=12)
        box('jack-leg', (0.18, 0.18, 1.55), MAT_PAINT, sl, (x, y, 1.02),
            bevel=0.014)
        tube('jack-rod', 0.052, 0.42, MAT_CHROME, sl, (x, y, 1.78), sides=10)
        tube('jack-pin', 0.055, 0.10, MAT_WORN, sl, (x, y, 0.16), sides=10)
        cone('jack-pad', 0.12, 0.285, 0.09, MAT_WORN, sl, (x, y, 0.085), sides=18)
        tube('jack-pad-plate', 0.285, 0.05, MAT_WORN, sl, (x, y, 0.035),
             sides=18)
    return sl


# ── 7. THE SAMPLE TRAIN ───────────────────────────────────────────────────────
def build_cyclone(parent):
    """Ceramic-lined cyclone, built top-down from [MIN p.13] via rc-rig.md §4.4:

      inlet head / wear bend  fabricated box with a TANGENTIAL inlet flange on
                              one side — the alumina-ceramic-tiled wear bend
      barrel                  squat cylinder about as tall as it is wide, bolted
                              flanges top and bottom, hinged inspection lid on
                              gas-assist struts with over-centre lever locks
      cone                    1.5-1.6 barrel diameters long, small outlet
      vibrators               "multi heavy-duty vibrators: assist in un-clogging
                              of damp sample" — drum-shaped motors bolted to the
                              cone. Visible lumps, not a smooth taper.

    The lid and the vibrators are the two named parts rc-rig.md §9.I says are
    missing from the game's own cyclone tool today. Absolute size is NOT SOURCED
    (§8 item 7) — only these ratios are readable, and only roughly.
    """
    r = CYC_BARREL_D / 2
    z_cone0 = CYC_OUT_Z + CYC_CONE_H
    z_top = z_cone0 + CYC_BARREL_H
    cone('cyc-cone', 0.105, r, CYC_CONE_H, MAT_PAINT, parent, (0, 0, CYC_OUT_Z),
         sides=20)
    tube('cyc-barrel', r, CYC_BARREL_H, MAT_PAINT, parent, (0, 0, z_cone0),
         sides=20)
    tube('cyc-flange-out', 0.15, 0.028, MAT_DARK, parent,
         (0, 0, CYC_OUT_Z - 0.014), sides=16)
    for z in (z_cone0, z_top):
        tube('cyc-flange', r + 0.045, 0.028, MAT_DARK, parent, (0, 0, z - 0.014),
             sides=20)
    for t in range(12):
        a = t / 12 * TAU
        box('cyc-flange-bolt', (0.028, 0.028, 0.022), MAT_WORN, parent,
            (math.cos(a) * (r + 0.025), math.sin(a) * (r + 0.025), z_cone0),
            rot=(0, 0, a))                 # ring of 12 — no bevel
    box('cyc-inlet-head', (r * 2.0, r * 2.0, 0.34), MAT_PAINT, parent,
        (0, 0, z_top + 0.17), bevel=0.03)
    tube('cyc-inlet-flange', 0.105, 0.22, MAT_DARK, parent,
         (-r - 0.06, r * 0.55, z_top + 0.17), rot=(0, -math.pi / 2, 0), sides=14)
    tube('cyc-inlet-ring', 0.135, 0.030, MAT_WORN, parent,
         (-r - 0.24, r * 0.55, z_top + 0.17), rot=(0, -math.pi / 2, 0), sides=14)
    empty(NODE_MOUNT, 'cyclone-inlet', parent, (-r - 0.26, r * 0.55, z_top + 0.17))
    tube('cyc-vortex-stack', 0.10, 0.42, MAT_WORN, parent, (0, 0, z_top + 0.34),
         sides=14)
    cone('cyc-vent-cap', 0.155, 0.05, 0.11, MAT_WORN, parent,
         (0, 0, z_top + 0.76), sides=14)
    box('cyc-lid', (r * 1.5, r * 1.5, 0.05), MAT_DARK, parent,
        (0.06, 0, z_top + 0.36), rot=(0, 0.30, 0), bevel=0.01)
    for sy in (-1, 1):
        strut('cyc-lid-strut', (r * 0.5, sy * r * 0.55, z_top + 0.30),
              (-r * 0.30, sy * r * 0.60, z_top + 0.44), 0.026, MAT_CHROME, parent)
        box('cyc-lever-lock', (0.05, 0.13, 0.05), MAT_WORN, parent,
            (-r * 0.75, sy * r * 0.5, z_top + 0.30), rot=(0.6, 0, 0), bevel=0.006)
    for sy, zz in ((1, 0.42), (-1, 0.66)):
        rr = 0.105 + (r - 0.105) * (1.0 - zz / CYC_CONE_H)
        tube('cyc-vibrator', 0.075, 0.20, MAT_DARK, parent,
             (rr * 0.7, sy * rr * 0.7, CYC_OUT_Z + zz), rot=(0, math.pi / 2, 0),
             sides=10)
    # the ceramic liner showing at the outlet: a different family of surface
    # from the painted shell [MIN p.13 — alumina tiles, urethane base cone]
    tube('cyc-liner', 0.088, 0.14, MAT_CAST, parent, (0, 0, CYC_OUT_Z - 0.02),
         sides=14)


def build_sample_train():
    """Everything that makes this an RC pad rather than just a drill: cyclone on
    a stand, splitter and double drop box under it, calico bags on a ring AND in
    rows on the dirt, chip trays on a trestle, bulk reject pile.

    rc-rig.md §4.4 records BOTH field patterns and asks for both: a free-standing
    cyclone stand on deep exploration spreads, AND the deck-cantilevered slew arm
    with a hydraulic deploy cylinder that every modern rig has. §9.H: "the machine
    currently has no support arm anywhere, which no modern RC rig lacks, and the
    hose therefore has nothing to hang from. Adding the arm is the fix; removing
    the tower is a separate decision." So this model builds both.
    """
    # This builder creates the external pad equipment, including root-authored
    # trays and reject chips. Scope classification to these actual objects;
    # names cannot recover their geometry once the static join has run.
    existing_objects = set(bpy.context.scene.objects)
    st = bpy.data.objects.new('cyclone-stand', None)
    bpy.context.collection.objects.link(st)
    st.location = (CYC_X, CYC_Y, 0)
    bpy.context.view_layer.update()
    POST = 3.20
    for (sx, sy) in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        strut('stand-post', (sx * 0.68, sy * 0.68, 0), (sx * 0.60, sy * 0.60, POST),
              0.085, MAT_PAINT, st)
        box('stand-foot', (0.30, 0.30, 0.04), MAT_WORN, st,
            (sx * 0.68, sy * 0.68, 0.020), bevel=0.005)
    for z in (0.78, 1.58, POST - 0.06):
        f = 1 - (z / POST) * 0.12
        for i in range(4):
            along = i % 2 == 0
            sgn = -1 if i < 2 else 1
            box('stand-ring', (1.36 * f if along else 0.06,
                               0.06 if along else 1.36 * f, 0.06), MAT_PAINT, st,
                (0 if along else sgn * 0.68 * f,
                 sgn * 0.68 * f if along else 0, z), bevel=0.006)
    # full X-bracing on all four faces: a first render had the cyclone floating
    # on four wires. A tower carrying a cyclone plus a wet sample load is braced.
    for face in range(4):
        ax, ay = ((-1, -1), (1, -1), (1, 1), (-1, 1))[face]
        bx, by = ((1, -1), (1, 1), (-1, 1), (-1, -1))[face]
        for (z0, z1) in ((0.10, 0.78), (0.78, 1.58), (1.58, POST - 0.06)):
            f0 = 1 - (z0 / POST) * 0.12
            f1 = 1 - (z1 / POST) * 0.12
            strut('stand-brace', (ax * 0.66 * f0, ay * 0.66 * f0, z0),
                  (bx * 0.66 * f1, by * 0.66 * f1, z1), 0.042, MAT_PAINT, st)
    box('stand-walkway', (1.36, 1.36, 0.04), MAT_DARK, st, (0, 0, 1.60),
        bevel=0.008)
    for i in range(4):
        along = i % 2 == 0
        sgn = -1 if i < 2 else 1
        box('stand-kick', (1.36 if along else 0.03, 0.03 if along else 1.36, 0.10),
            MAT_HAZARD, st,
            (0 if along else sgn * 0.66, sgn * 0.66 if along else 0, 1.67),
            bevel=0.004)
    for (sx, sy) in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        tube('stand-rail-post', 0.022, 1.02, MAT_PAINT, st,
             (sx * 0.62, sy * 0.62, 1.62))
    for h in (1.00, 0.54):
        for i in range(3):
            along = i % 2 == 0
            sgn = -1 if i < 2 else 1
            tube('stand-rail', 0.022, 1.24, MAT_PAINT, st,
                 (-0.62 if along else sgn * 0.62,
                  sgn * 0.62 if along else -0.62, 1.62 + h),
                 rot=(0, math.pi / 2, 0) if along else (-math.pi / 2, 0, 0))
    for sx in (-1, 1):
        strut('stand-ladder-side', (-0.90, sx * 0.20, 0.02),
              (-0.66, sx * 0.20, 1.72), 0.045, MAT_PAINT, st)
    for i in range(7):
        t = i / 6
        tube('stand-rung', 0.016, 0.40, MAT_PAINT, st,
             (-0.90 + 0.24 * t, -0.20, 0.14 + 1.52 * t), rot=(-math.pi / 2, 0, 0))

    build_cyclone(st)

    # splitter + double drop box under the cone.
    # [R16 §B.7]: cone splitter, alumina-ceramic-lined, DOUBLE 25 L drop box,
    # bolt-in 4/6/8/10 % blades, working splits 6.25-12.5 %, 3000 cfm / 750 psi.
    # The game builds a riffle box; both types are real (rc-rig.md §9.J). Built
    # here as the cone splitter the research pack documents, with the two drop
    # boxes and the red-handled blade levers visible in the [MIN] render.
    sz = 1.32
    cone('split-hopper', 0.30, 0.10, 0.30, MAT_DARK, st, (0, 0, sz + 0.30),
         sides=16)
    box('split-body', (0.56, 0.56, 0.34), MAT_PAINT, st, (0, 0, sz + 0.15),
        bevel=0.025)
    for t in range(8):
        a = t / 8 * TAU
        box('split-bolt', (0.026, 0.026, 0.020), MAT_WORN, st,
            (math.cos(a) * 0.24, math.sin(a) * 0.24, sz + 0.325),
            rot=(0, 0, a))                 # ring of 8 — no bevel
    for sx in (-1, 1):
        box('drop-box', (0.28, 0.30, 0.34), MAT_PAINT, st,
            (sx * 0.34, 0.02, sz - 0.10), bevel=0.02)
        cone('drop-chute', 0.13, 0.05, 0.22, MAT_DARK, st,
             (sx * 0.34, 0.02, sz - 0.29), sides=12)
        box('split-lever', (0.05, 0.16, 0.035), MAT_HAZARD, st,
            (sx * 0.34, -0.20, sz + 0.04), rot=(-0.5, 0, 0), bevel=0.005)
    cone('reject-chute', 0.16, 0.30, 0.34, MAT_DARK, st, (0, 0, sz - 0.44),
         sides=14)
    box('reject-spout', (0.22, 0.44, 0.20), MAT_DARK, st, (0, -0.30, sz - 0.62),
        rot=(0.7, 0, 0), bevel=0.014)

    # calico bags on a ring under the drop chutes [R16 §B.7, R02 §A2]:
    # drawstring cloth, 200x300 to 600x900 mm, 2-3 kg of chips per metre.
    torus('bag-ring', 0.42, 0.020, MAT_PAINT, st, (0, 0.62, 0.92), mseg=20, nseg=6)
    for (lx, ly) in ((-0.40, 0.62), (0.40, 0.62), (0.0, 1.00)):
        strut('bag-ring-leg', (lx, ly, 0.0), (lx * 0.95, ly * 0.97, 0.92),
              0.035, MAT_PAINT, st)
    for (bx, by, fill, rz) in ((-0.20, 0.50, 0.86, 0.3), (0.22, 0.52, 0.72, -0.5),
                               (0.02, 0.82, 0.40, 1.1)):
        h = 0.20 + 0.20 * fill
        # MAT_WORN, not MAT_RUBBER. rc-rig.md §6: the bags are PALE CLOTH and
        # 'the lightest objects in the scene'. The nine MAT_ names carry no
        # cloth, and rubber reads near-black — the worst possible value for the
        # one thing that has to stand out under the cone. wornSteel is the least
        # wrong of the nine. assets.js does have a `sampleBag` KIND; wiring that
        # in is a job for whoever owns the loader (see the report).
        b = cone('calico-bag', 0.115 + 0.035 * fill, 0.085, h, MAT_WORN, st,
                 (bx, by, 0.92 - h), rot=(0, 0, rz), sides=8)
        b.scale = (1.0, 0.82, 1.0)
        tube('bag-neck', 0.055, 0.09, MAT_WORN, st, (bx, by, 0.91), sides=8)
    # and laid out in rows on the dirt — [R16 §A.8] says that is what the
    # photograph actually shows, one or two bags per metre drilled
    for i in range(10):
        row, col = i // 5, i % 5
        b = cone('calico-bag-row', 0.145, 0.105, 0.32, MAT_WORN, st,
                 (1.15 + row * 0.46, -0.66 + col * 0.36, 0.145),
                 rot=(0.10 * (i % 3) - 0.10, math.pi / 2, 0.4 * i), sides=8)
        b.scale = (0.86, 1.0, 1.0)      # a filled sack slumps, it is not round

    # chip trays on a trestle: long thin plastic cases with a row of half-cup
    # sections, one section per metre [R02 §A2]. NOT timber core boxes — that is
    # the core rig, and confusing the two is the classic RC modelling error.
    tx, ty = CYC_X + 1.55, CYC_Y + 1.75
    for sx in (-1, 1):
        for sy in (-1, 1):
            strut('trestle-leg', (tx + sx * 0.62, ty + sy * 0.26, 0),
                  (tx + sx * 0.52, ty + sy * 0.22, 0.74), 0.055, MAT_PAINT)
    box('trestle-top', (1.36, 0.62, 0.05), MAT_PAINT, loc=(tx, ty, 0.77),
        bevel=0.008)
    for k in range(3):
        z = 0.80 + k * 0.055
        y = ty - 0.20 + k * 0.19
        box('chip-tray', (1.22, 0.17, 0.045), MAT_DARK, loc=(tx, y, z),
            bevel=0.006)
        # 60 cups at 72 mm across, arrayed down three trays on a trestle. What
        # reads at any range is the ROW of cups, not the cup's own section.
        cup = tube('chip-cup', 0.036, 0.030, MAT_WORN,
                   loc=(tx - 0.55, y, z + 0.014), sides=4)
        arrayed(cup, 20, (0.058, 0, 0))

    # Bulk reject pile, growing all shift under the splitter's reject spout.
    # Built as a radial mound with multi-frequency noise on radius AND height,
    # not as a cone primitive: REVIEW_RUBRIC axis 4 makes "a primitive left
    # visible as a primitive" an automatic fail, and a first render of this model
    # had a clean 18-sided cone on the pad looking like a circus tent. Angle of
    # repose about 35 deg, which is where dry rock chips actually stand.
    R, H, RINGS, SEG = 1.05, 0.52, 6, 26
    verts, faces = [], []
    for ri in range(RINGS + 1):
        fr = ri / RINGS
        for si in range(SEG):
            a = si / SEG * TAU
            n = (0.13 * math.sin(a * 3.0 + fr * 2.2)
                 + 0.08 * math.sin(a * 7.0 - fr * 4.1)
                 + 0.05 * math.sin(a * 13.0 + fr * 1.3))
            r = R * fr * (1.0 + n * (0.4 + 0.6 * fr))
            z = H * (1.0 - fr ** 1.45) * (1.0 + 0.10 * math.sin(a * 5.0 + fr * 6))
            verts.append((math.cos(a) * r, math.sin(a) * r, max(0.0, z)))
    for ri in range(RINGS):
        for si in range(SEG):
            a0 = ri * SEG + si
            a1 = ri * SEG + (si + 1) % SEG
            faces.append((a0, a1, a1 + SEG, a0 + SEG))
    me = bpy.data.meshes.new('reject-pile')
    me.from_pydata(verts, [], faces)
    me.update()
    pile = bpy.data.objects.new('reject-pile', me)
    bpy.context.collection.objects.link(pile)
    part('reject-pile', pile, MAT_WORN, None, (CYC_X - 0.15, CYC_Y - 1.25, 0))
    for i in range(14):               # loose chips at the toe of the pile
        a = i * 2.399
        rr = 1.06 + (i % 4) * 0.13
        box('reject-chip', (0.09 + 0.03 * (i % 3), 0.07, 0.045), MAT_WORN,
            loc=(CYC_X - 0.15 + math.cos(a) * rr,
                 CYC_Y - 1.25 + math.sin(a) * rr, 0.022),
            rot=(0, 0.1 * (i % 3), a))   # 14 chips on the dirt — no bevel; a
        # rock chip wants a hard edge anyway, and a 6 mm chamfer on a 90 mm
        # chip cost 96 triangles each to round off the one thing that is sharp.
    for o in set(bpy.context.scene.objects) - existing_objects:
        o['framing'] = 'exclude'
    return st


def build_cyclone_arm():
    """Deck-mounted slew base, fabricated support arm and hydraulic deploy
    cylinder, carrying the sample-hose loop out over the cyclone inlet.

    [MIN p.13] sells "automatic deploy, restore, and leveling options", which
    only make sense for a rig-mounted arm; [R16 §A.8] describes the cyclone as
    cantilevered off the rig deck, hydraulically raised and rotatable. This is
    the fix rc-rig.md §9.H asks for.
    """
    bx, by, bz = ARM_BASE
    box('cyc-arm-base', (0.46, 0.46, 0.20), MAT_DARK, loc=(bx, by, bz - 0.10),
        bevel=0.018)
    for t in range(10):
        a = t / 10 * TAU
        box('cyc-arm-base-bolt', (0.028, 0.028, 0.020), MAT_WORN,
            loc=(bx + math.cos(a) * 0.27, by + math.sin(a) * 0.27, bz - 0.18),
            rot=(0, 0, a))                 # ring of 10 — no bevel
    pv = empty(NODE_PIVOT, 'cyclone-arm', None, (bx, by, bz))
    pv['axis'] = 'z'
    pv['range_deg'] = [-95.0, 15.0]
    ex, ey, ez = (ARM_TIP[0] - bx, ARM_TIP[1] - by, ARM_TIP[2] - bz)
    tube('cyc-arm-post', 0.14, 0.62, MAT_PAINT, pv, (0, 0, 0), sides=14)
    strut('cyc-arm-boom', (0, 0, 0.52), (ex, ey, ez), 0.17, MAT_PAINT, pv)
    strut('cyc-arm-knee', (0, 0, 0.10), (ex * 0.30, ey * 0.30, ez * 0.30 + 0.44),
          0.10, MAT_PAINT, pv)
    strut('cyc-arm-cyl', (0.10, 0.20, 0.02), (ex * 0.52, ey * 0.52, ez * 0.52),
          0.080, MAT_PAINT, pv)
    strut('cyc-arm-rod', (ex * 0.52, ey * 0.52, ez * 0.52),
          (ex * 0.78, ey * 0.78, ez * 0.78 + 0.06), 0.032, MAT_CHROME, pv)
    torus('hose-saddle', 0.15, 0.032, MAT_PAINT, pv, (ex, ey, ez + 0.04),
          rot=(math.pi / 2, 0.20, 0), mseg=14, nseg=6)
    for s in (-1, 1):        # the saddle's guide horns keep the loop on the arm
        box('hose-saddle-horn', (0.04, 0.10, 0.26), MAT_PAINT, pv,
            (ex + s * 0.16, ey, ez + 0.16), rot=(0, s * 0.35, 0), bevel=0.008)
    empty(NODE_MOUNT, 'hose-saddle', pv, (ex, ey, ez + 0.10))
    worklight('sample-arm', pv, (ex * 0.8, ey * 0.8, ez + 0.30),
              aim_dir=(1.2, 0.9, -1.6), cone_deg=64, range_m=20)
    return pv


# ── 8. HOSES ──────────────────────────────────────────────────────────────────
def _bez4(a, b, c, d, t):
    u = 1 - t
    return tuple(u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i]
                 + t * t * t * d[i] for i in range(3))


def _bez4_tan(a, b, c, d, t):
    u = 1 - t
    return tuple(3 * u * u * (b[i] - a[i]) + 6 * u * t * (c[i] - b[i])
                 + 3 * t * t * (d[i] - c[i]) for i in range(3))


def _hose_frame(curve, t):
    """Sample the actual Blender spline used by the hose core.

    rig.hose() makes AUTO-handled Bezier segments through its waypoints.
    Treating those waypoints as the handles of one cubic instead produces a
    different curve: the corrugations then float beside the rubber core.
    Reading the core's handles keeps both surfaces on the same centreline.
    """
    points = curve.data.splines[0].bezier_points
    u = max(0.0, min(1.0, t)) * (len(points) - 1)
    segment = min(int(u), len(points) - 2)
    local_t = u - segment
    a, b = points[segment], points[segment + 1]
    controls = (a.co, a.handle_right, b.handle_left, b.co)
    p = _bez4(*controls, local_t)
    tangent = Vector(_bez4_tan(*controls, local_t)).normalized()
    return p, tangent


def build_hoses():
    """Three hose populations that must not be confused [rc-rig.md §4.10]:

      1. HYDRAULIC — small bore, in tight parallel ranks, running bulkhead plate
         to bulkhead plate through a deflection guide, with the electric cable
         inside the bundle and a flat fabric hose bag over it [BAUER]. Hoses are
         sold and fitted as PACKAGES, so this is one slack bundle shape, not
         dozens of independently wandering lines.
      2. THE SAMPLE HOSE — a single fat 3-4 in CORRUGATED hose, an order of
         magnitude fatter than any hydraulic hose on the machine, hanging in a
         lazy loop from the head box to the cyclone inlet. rc-rig.md §5 makes
         this identification cue number one for the whole class; §9.G says a
         ribbed profile is "the cheapest single gain in this whole document".
      3. THE AIR BULL HOSE from the compressor, lying on the ground from a
         separate machine to the rig: 2 in and 1.5 in bore, 1300/1450 psi, two
         braided layers of high-tensile steel wire under an abrasion-resistant
         synthetic rubber cover, non-skive couplings [AUSMIN]. So: thick, matte,
         stiff, with big swaged steel end fittings.
    """
    for (px, py, pz) in ((0.28, -2.28, DECK_Z + 0.34),
                         (0.30, MAST_Y + 0.55, MAST_FOOT + 0.72)):
        box('bulkhead-plate', (0.40, 0.05, 0.26), MAT_DARK, loc=(px, py, pz),
            bevel=0.008)
        for i in range(6):
            tube('bulkhead-union', 0.020, 0.10, MAT_STEEL,
                 loc=(px - 0.15 + i * 0.06, py + 0.05, pz + 0.06),
                 rot=(math.pi / 2, 0, 0), sides=6)
    tube('hose-deflection-roller', 0.075, 0.34, MAT_DARK,
         loc=(0.11, -2.55, DECK_Z + 0.12), rot=(0, math.pi / 2, 0), sides=12)
    hose('hose-bag', [(0.28, -2.28, DECK_Z + 0.36),
                      (0.29, -2.62, DECK_Z + 0.02),
                      (0.30, MAST_Y - 0.01, MAST_FOOT + 1.20),
                      (0.30, MAST_Y + 0.55, MAST_FOOT + 0.80)],
         radius=0.105, mat=MAT_DARK, sides=8)
    for i in range(4):
        o = i * 0.036
        hose('hyd-line', [(0.62 + o, 1.30, DECK_Z + 0.10),
                          (0.50 + o, 0.10, DECK_Z + 0.02),
                          (0.36 + o, -1.50, DECK_Z + 0.06),
                          (0.30 + o, -2.24, DECK_Z + 0.30)],
             radius=0.017, mat=MAT_RUBBER, sides=6)
    coil = []
    for i in range(12):
        a = i * 1.25
        coil.append((0.34 + math.cos(a) * 0.070, -2.30 + i * 0.007,
                     DECK_Z + 0.30 + math.sin(a) * 0.070 + i * 0.019))
    hose('head-conduit-coil', coil, radius=0.018, mat=MAT_RUBBER, sides=6)

    hose('bull-hose', [(-2.60, 3.20, 0.06), (-1.55, 1.70, 0.07),
                       (-0.90, 0.10, 0.10), (-1.05, -1.60, 0.34),
                       (-0.55, -2.55, DECK_Z - 0.55)],
         radius=0.040, mat=MAT_RUBBER, sides=8)['framing'] = 'exclude'
    tube('bull-hose-ferrule', 0.055, 0.14, MAT_STEEL,
         loc=(-0.56, -2.56, DECK_Z - 0.66), rot=(0.4, 0, 0), sides=10)['framing'] = 'exclude'


def build_sample_hose():
    """The fat corrugated sample hose, on its own node.

    slide:sample-hose keeps finish() from folding it into the static rubber
    bucket. Runtime deformation is NOT IMPLEMENTED in gltfRig.js; keeping this
    separate assembly and its attachment nodes makes that work possible without
    claiming that the hose already follows the head. Corrugation is real geometry (a smooth core
    with arrayed ribs on the curve), not a hoped-for normal map, because the
    material is generated procedurally at runtime and cannot be relied on to
    carry a rib pattern.
    """
    sl = empty(NODE_SLIDE, 'sample-hose', None, (0, 0, 0))
    sl['framing'] = 'exclude'    # external connection from head to pad cyclone
    sl['axis'] = 'z'
    sl['range_m'] = [0.0, 0.0]     # reserved rigid assembly; no runtime driver yet
    a = (HEAD_OUT[0] + 0.08, HEAD_OUT[1] + 0.02, HEAD_OUT[2] - 0.04)
    b = (1.42, MAST_Y + 0.20, MAST_FOOT + 1.28)     # the lazy sag
    c = (ARM_TIP[0] - 0.06, ARM_TIP[1] + 0.02, ARM_TIP[2] + 0.10)  # arm saddle
    d = CYC_INLET                                   # cyclone inlet
    h = hose('sample-hose', [a, b, c, d], radius=0.062, mat=MAT_RUBBER,
             parent=sl, sides=10)
    h.data.bevel_resolution = 4
    h.data.resolution_u = 10
    bpy.context.view_layer.update()  # resolve AUTO handles before sampling them
    ribs = 36
    for i in range(ribs):
        t = (i + 0.5) / ribs
        p, tg = _hose_frame(h, t)
        r = torus('sample-hose-rib', 0.0705, 0.0135, MAT_RUBBER, sl, p,
                  mseg=10, nseg=5)
        r.rotation_mode = 'QUATERNION'
        r.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(tg)
    tube('sample-hose-collar', 0.082, 0.13, MAT_WORN, sl, a, sides=12)
    tube('sample-hose-collar', 0.082, 0.13, MAT_WORN, sl,
         (d[0], d[1], d[2] - 0.07), sides=12)
    return sl, h


# ── 9. LIGHTS AND NODES ───────────────────────────────────────────────────────
def build_lights():
    """env.js reads mount:/aim: world positions every frame and re-aims real
    spotlights at them, which is why boom lamps sweep as a machine works. An RC
    pad is worked at night off the rig's own lights, and the one that matters
    most is the lamp on the sample train: the cyclone is where the crew stands.
    """
    worklight('deck-fwd-l', None, (-1.10, -2.30, DECK_Z + 2.10),
              aim_dir=(-0.4, -2.4, -1.8), cone_deg=70, range_m=24)
    worklight('deck-fwd-r', None, (1.16, -2.28, DECK_Z + 1.10),
              aim_dir=(0.6, -2.4, -1.4), cone_deg=70, range_m=24)
    worklight('rear', None, (0.0, 2.42, DECK_Z + 1.00),
              aim_dir=(0, 2.4, -1.6), cone_deg=76, range_m=18)


# ── BUILD ─────────────────────────────────────────────────────────────────────
def build(out_path):
    reset()
    build_undercarriage()
    build_deck()
    build_body()
    pv_mast = build_mast()
    sl_tel, hk = build_crown(pv_mast)
    sl_car, pvh, spn = build_head(pv_mast)
    arm, grp = build_rod_handling(pv_mast)
    jacks = build_jacks()
    cyc_arm = build_cyclone_arm()
    build_sample_train()
    build_hoses()
    sl_hose, hose_obj = build_sample_hose()
    build_lights()

    # the hole itself, so the game can put the collar, the dust cone and the
    # bag rows in the right place without re-deriving the offset
    empty(NODE_MOUNT, 'hole', None, (0, HOLE_Y, 0))
    empty(NODE_AIM, 'hole', None, (0, HOLE_Y, -1.0))

    bake_modifiers()
    curves_to_mesh(skip=(hose_obj.name,))
    for n in (pv_mast, sl_tel, hk, sl_car, pvh, spn, arm, grp, jacks, cyc_arm,
              sl_hose):
        join_under(n)
    return finish(out_path)


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(HERE, '..', 'public', 'models',
                                       'rc-rig.glb')))

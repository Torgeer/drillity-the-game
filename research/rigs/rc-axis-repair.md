# RC working-axis repair — 2026-09-06

**Disposition: repaired and shipped.** The defect Codex proved is fixed in
`blender/rc_rig.py` and re-exported to `public/models/rc-rig.glb`. Codex's own
diagnostic, with its logic unmodified, goes from `passed: false` to
`passed: true`. This document is the evidence, the reasoning for the scope that
was chosen over the other, and the gaps that remain open.

It supersedes nothing in `drillity-rc-axis/research/RC_AXIS_ALIGNMENT.md` — that
document's finding was correct and its refusal to ship a guess was correct.

---

## 1. The defect, reproduced independently before anything was touched

Built from the live source with Codex's fixture (paths adapted, logic untouched;
the doc explicitly anticipates this: *"integration candidates are only the new
diagnostic fixtures/report after adapting dependency paths"*).

The frozen source hash Codex recorded, `9a59368…f7ff3a`, matched the live
`blender/rc_rig.py` byte for byte, so the reproduction is of the same file.

| Measured on a fresh export | Result |
|---|---:|
| Tool-to-declared-hole perpendicular miss, bottom / rest / top of feed | **0.7900002072732388 m** at all three |
| Head gearbox / spindle plane, authored Blender Y | −3.6400001 |
| Declared hole, `mount:hole`, authored Blender Y | −2.8499999 |
| `pivot:mast`, authored Blender Y | −2.8499999 |
| Rod guide, breakout table, four clamp jaws | −2.85 / −2.90 |
| Primitives / triangles | 44 / 70,804 |

Codex's ray test found the spindle line hitting `staticpaintedDark` at heights
1.4750 and 1.5250 and `staticsafetyStripe` at 1.5200. Those attribute exactly,
from the source:

- `drill-floor-front`, a 2.10 × 0.40 × 0.05 plate at `HOLE_Y − 0.60` = −3.45,
  spanning Y −3.65..−3.25 at Z 1.4875..1.5125. The spindle line at −3.640 is
  inside it.
- `drill-floor-kick-f`, 2.10 × 0.05 × 0.16 at `HOLE_Y − 0.78` = −3.63, spanning
  Y −3.655..−3.605 at Z 1.52..1.68. Also inside it.

## 2. What was actually wrong — a frame error, not a missing dimension

The 0.79 m is not a mystery quantity. It is the exact sum of three offsets that
were already authored in the file and are all still there unchanged:

| | m | what it is |
|---|---:|---|
| `MAST_D / 2` | 0.330 | half the mast depth, out to its front face |
| `HEAD_SWING_STANDOFF` | 0.300 | the swing-pin boss, clear of the carriage plate |
| `HEAD_SPINDLE_OFF` | 0.160 | the gearbox/spindle centre, ahead of that pin |
| **`WORK_AXIS`** | **0.790** | mast centreline to the axis the string turns on |

The carriage rides rails on the mast's **front** face (`mast-rail`, built at
`−MAST_D/2 − 0.03`), the swing boss stands off that face, and the rotation
gearbox is built around its own spindle — every child of `pivot:head-swing`
shares the same 0.16 m body offset. That chain is coherent and it is what the
primary reference shows. What was wrong is that `mount:hole`, the rod guide, the
breakout table and both clamp levels were put on the **mast's structural
centreline** instead of on that axis.

Two consequences that make "move a marker" obviously insufficient, and that
Codex was right to refuse:

- The declared bore at −2.85 sat **inside the mast's own footprint** (the
  lattice spans −3.18..−2.52). A string on that line would have run up through
  the middle of the truss. It happened not to hit a triangle only because the
  centre of an open lattice is hollow.
- The rod guide and both clamp levels were **parented to `pivot:mast` at
  mast-local Y ≈ 0**, so they moved with the mast. Translating the mast alone
  would have carried the clamps with it and left them still off the string.

## 3. Which end moves — the decision, and the evidence for it

Codex documented two coherent scopes. Both produce the same mast-to-bore
relationship; they differ only in which end stays fixed to the carrier.

**A — bore stays at −2.85, mast moves back to −2.06.** Rejected. Measured
against the file's own geometry, at −2.06 the mast lattice spans Y −2.39..−1.73
and would pass through `deck-plate` (Y −2.30..2.35 at Z 2.24..2.30) and into
`house-front` (Y −1.81..−1.75). It needs a slot cut in the deck and roughly
0.65 m taken out of the front of the machine house — and that house volume is
sourced, it is [R16 §A.8]'s on-board compressor of roughly 1000 cfm at 500 psi.
It also puts the mast foot 0.09 m **behind** the track nose, which contradicts
`build_deck`'s own citation, [MET p.22, rc-rig.md §4.7], for *"the fabricated
nose that carries the mast foot out past the track front"*, and leaves that
1.55 m nose carrying nothing at its front end.

**B — mast and carrier stay, bore derived forward to −3.64. Chosen.** It
preserves the cited mast-foot-on-the-nose relationship, moves no sourced
structure, and requires strictly fewer invented numbers. `MAST_Y` simply takes
the value `HOLE_Y` used to hold, so the mast, the nose, the deck, the house, the
bulkhead plates and every hose route are numerically untouched.

Supporting evidence, in descending strength:

1. **Fleet idiom.** A survey of all 24 machine modules found "mast set back from
   the bore axis" is the repo norm — 12 machines do it deliberately, with
   standoffs from 0.085 m (`tunnel_jumbo`) to 1.925 m (`foundation_bg`). The
   five that are centred on the bore are each *symmetric* about it (derrick,
   twin columns, shear legs), not coincidentally aligned. More importantly,
   **`mount:tool` landing exactly on `mount:hole` is a hard invariant held at
   0.000 m by 17 of 18 machines.** RC's 0.79 m was not a normal standoff — as a
   standoff it is unremarkable; as a *residual* it was the fleet's worst by far.
   `sonic_truck.py` is the closest precedent and does exactly what is done here:
   `MAST_Y = 0.440  # the mast BOX stands 440 mm forward of the drilling axis:
   the head that rides its aft face is HEAD_D/2 = 0.230 … and the mast is
   MAST_D/2 = 0.210, and 0.230 + 0.210 = 0.440 exactly.`
2. **The primary reference.** `evidence/mineral-p22.png` (Mineral Exploration
   Tooling – Catalog p.22, rendered and looked at) shows the rod clamp /
   breakout assembly standing clearly **proud of the mast lattice on the working
   face**, with the working platform ahead of it and ahead of the front jack.
   That supports the *arrangement*. It is a raked perspective studio photograph
   and it **cannot** be scaled into a metre value — no dimension is taken from it.
3. **Two untouched sub-assemblies only make sense with the bore where scope B
   puts it.** This is the strongest single piece of evidence and it was found
   after the decision, not before it. Neither was modified by this repair; both
   were authored off the photograph long ago.

   | | ahead of the OLD bore | ahead of the NEW bore |
   |---|---:|---:|
   | crown jib winch hook (`jib_y = −MAST_D/2 − 0.86`) | 1.210 m | **0.420 m** |

   A jib hook exists to hoist rods to the hole. Hanging 1.21 m in front of the
   bore it is useless; at 0.42 m it is exactly where one belongs — clear of the
   rotary head, close enough to swing a rod in.

   The rod-handling arm is the same story. It is a 1.501 m swing arm
   (`pivot:rod-arm` at mast-local (0.43, 0.16), gripper at arm-local
   (1.46, 0.35)). Its pivot stood **0.459 m** from the old bore, so its sweep
   missed the hole by a metre and it could never bring a rod to centre. From the
   new bore the pivot is **1.043 m**, and a 1.501 m arm sweeps the gripper
   across it properly. The mismatch between arm reach and bore distance falls
   from 1.043 m to 0.459 m.

4. **Structural read.** `front-frame` is a 0.98 × 1.55 × 0.34 fabrication whose
   own comment says it carries the mast foot past the track front. Scope B keeps
   the foot on it. Scope A makes it purposeless.

**The honest cost of scope B, stated plainly:** the bore is now 1.49 m ahead of
the track nose (−2.15) and 1.09 m ahead of the front jack line (−2.55), and the
drill floor had to grow forward to reach it. The machine is 249 mm longer. See
§6 — this is the one place a reviewer should push back hardest.

## 4. What changed in `blender/rc_rig.py`

- `HOLE_Y` is now **derived** and can no longer be typed: `HOLE_Y = MAST_Y −
  WORK_AXIS`. The bore is wherever the spindle is, by construction. This is the
  same guarantee `pd55.py` gets algebraically and `sonic_truck.py` gets by
  negating the offset in the carriage.
- `MAST_Y = −2.85` — the mast datum, holding the value `HOLE_Y` used to.
- `HEAD_SWING_STANDOFF` and `HEAD_SPINDLE_OFF` are named at module level and
  used where the head is actually built, so the bore can never drift from the
  mechanism that produces it. Their values are **unchanged** from the shipped
  model; not one was re-picked.
- The four assemblies that touch the string — rod guide, breakout table, both
  clamp levels and their rams — moved from mast-local Y ≈ 0 to `−WORK_AXIS`.
  Their offsets *relative to each other* are unchanged; the rams are still
  0.20 m ahead of the jaws they drive.
- The breakout table is now a **split pair** with a 0.20 m bore instead of one
  solid box. Off-axis nobody noticed it had no hole for the string; on-axis a
  solid plate would have been steel across the bore. Split tables are the real
  idiom. Cost: 12 triangles, no extra draw call.
- The drill floor was re-cut. It used to be a 1.70 m platform centred on the
  mast foot, built when the file believed the bore was in the middle of the
  mast; its front plate and front kick were the two things the ray hit. It now
  runs from behind the mast-foot hood forward to past the bore, opening on both.
- The feed down-stop was raised — see §6.

Everything else in the file is untouched, including the whole overnight
draw-call optimisation.

## 5. Verification

`tools/check_rc_axis.mjs`, Codex's fixture with **no change to its logic or its
1e-5 m tolerance**, run against the new export:

```
frames[0..2].perpendicularM   0, 0, 0        (was 0.7900002 at all three)
obstructingHitsBelowLowestTool []            (was 2 hits: paintedDark, safetyStripe)
passed                        true           (was false)
process exit                  0              (was 1)
```

Measured with `tools/glbinfo.mjs`, the only dimension tool:

| | before | after |
|---|---:|---:|
| primitives (= draw-call floor, budget 70) | 44 | **44** |
| triangles | 70,804 | **70,912** (+108) |
| materials with nonzero transmission | 0 | **0** |
| W × H × L (m) | 7.883 × 7.215 × 7.608 | 7.883 × 7.215 × **7.857** |
| bounds x | −2.633..5.250 | unchanged |
| bounds y | −0.015..7.200 | unchanged |
| bounds z | −3.412..4.196 | −3.412..**4.445** |

Only one bound moved: the front of the drill floor, by 249 mm. Width and height
are identical. Per ASTRA §5, note that the 7.883 m "width" is still the **site
spread** — the free-standing cyclone stand, bag rows and chip trays — and not
machine width; that is unchanged by this work and is a `gltfRig.js` framing
issue, not a Blender one.

**Beyond what the diagnostic covers.** `check_rc_axis.mjs` samples three FEED
positions with the head-swing at rest, and casts one vertical ray at x = 0. Two
things it therefore does not test were checked separately against the shipped
GLB:

- **The head's ±90° fan-drilling swing.** `pivot:head-swing` rotates about its
  local Y, so it cannot change a child's local Y — the alignment ought to be
  swing-invariant, and it measures that way. Driving `pivot:head-swing` through
  −90, −45, −19, 0, +19, +45, +90 degrees, `mount:tool` sweeps in X and Z from
  (0.000, 3.190) to (∓1.460, 4.650) — which is what fan drilling *is* — while
  its fore-aft coordinate stays **−3.640000 at every angle, error 0.000000000 m**
  against the bore. The old 0.79 m miss was likewise swing-invariant, which is
  part of why it was never a stroke bug.
- **The head at its new bottom of travel.** `mount:tool` reads
  `[0.0, −3.64, 1.888]` off the export, 50 mm above the rod-guide top at 1.838,
  and the saver sub's bottom face *is* `mount:tool` — so the 196 mm sub cannot
  reach the 174 mm guide bore. Confirmed by eye in `shots/feed-low.png`.

**Repository gates, run after the export:**

| gate | result |
|---|---|
| `node tools/checkmodels.mjs` | OK — 19 machines, node contract and material names pass |
| `node tools/checkrigmetadata.mjs` | 80/80 — *"shipped GLB rc-rig loads and drives through its declared endpoints"* |
| `node tools/checkmaterials.mjs` | OK — 34 material bases, 0 contract failures |
| `node tools/checkrigcapacity.mjs` | 9 checks passed |
| `node tools/auditrigattachments.mjs --rig rc-rig` | `failures=4` on both methods — **byte-identically the same before and after**, verified by running it against the pre-change GLB and restoring. This is the pre-existing fleet-wide collar/low-feed-head diagnostic in Codex's handover item 4 (33 of 42 pairs fail fleet-wide), not something this change caused or fixed. Worth noting for whoever owns it: **the count did not move even though the collar position moved 0.79 m**, which suggests that check is not sensitive to bore position and may be failing for an unrelated reason. |

**Renders looked at** (all offline Blender renders, EEVEE via
`blender/preview.py` and CPU Cycles for the axis pair — none of these is a
gameplay capture):

- `shots/rc-fixed-lower-side.png` and `rc-before-lower-side.png` — the drill
  floor now reaches forward under the head instead of stopping short of it.
- `shots/feed-low.png` — the head **driven to its new bottom of feed travel**
  and looked at. `mount:tool` reads `[0.0, -3.64, 1.888]` straight off the
  export, so the saver sub's bottom face stops 50 mm above the rod-guide top at
  1.838 exactly as designed, and the image shows it: spindle and saver sub
  descending the mast's front face, the guide ring immediately below them, the
  two split table halves and the clamp jaws either side of the bore, and the
  mast lattice behind the whole working assembly. This is the picture that says
  the mechanism is coherent rather than merely that a number went to zero.
- `evidence/baseline-axis-side.png` vs `evidence/fixed-axis-side.png` — Codex's
  diagnostic overlay, cyan for the spindle line and red for the declared bore,
  both displaced sideways in X for visibility and neither a production rod.
  Before: two clearly separate lines, the red one running up the middle of the
  mast truss. After: the red line is completely hidden behind the cyan one, and
  the line runs down through the floor opening to the ground.

## 6. Open items, gaps, and the one thing to argue about

**6.1 The feed stroke is now shorter than one rod, and that must be resolved by
somebody with authority over the size class.** `travel_m` goes 3.19 → **2.852 m**.

The author's rule was already right — *"the rotary head on this class never
travels below the floor, the rod clamp and the breakout table are down there"* —
but it was applied to the drill floor at Z 1.50 while the head was 0.79 m off
the axis and sailed past the clamp stack entirely. On the axis it cannot. The
binding obstruction is the top of the mast-foot stack: the rod guide at
mast-local 0.66 plus its 28 mm minor radius. The head's lowest geometry is the
saver sub's bottom face, which is where `mount:tool` sits (`tube()` origins at
its base, `lib/rig.py` L181); that sub is 196 mm across and the guide's bore is
2 × (0.115 − 0.028) = 174 mm, so it physically cannot enter. This is a hard
stop, not a styling choice.

**The old 3.19 m was not real.** It was only reachable because the head
descended *through* the front floor plate at a Y where the string was not.
2.852 m is the first stroke this machine has published that it can execute.

But 2.852 < `ROD_LEN` 3.05 (itself **NOT SOURCED**), and [R02 §A2, citing BL-RC
p.6] publishes 1.5 / 3 / 6 m dual-wall pipe — so even the sourced 3 m does not
fit. Resolving it means growing the mast or shortening the rods, which is
exactly the [E100]-size / [E235]-feature decision this module's header already
records as unresolved and which rc-rig.md §9.F says must be made **first**. It
is reported here rather than absorbed into a fudged clearance.

**6.2 `WORK_AXIS`'s two components are NOT SOURCED, and that is now known to be
unavoidable.** A search of the whole local catalogue library found **no
dimensioned general arrangement of any RC rig at all**, and both Epiroc Explorac
brochures return HTTP 403 (as they did for the previous attempt; no workaround
was tried). Also 403: `pdf.directindustry.com`, `neemba.com`,
`machinecatalogic.com`, `anyflip.com`.

Two things worth carrying forward from that search:

- **OEMs do not publish this dimension the way the file expresses it.** Where it
  is published at all it is drill-axis to mast **FRONT FACE**, or drill-axis to
  **slew centre** ("reach", "working radius"). Nobody publishes drill-axis to
  mast structural centre-plane. The one located instance is Bauer BG 36 H / BS
  95, doc 905.868.2 (12/2020) printed p.16, table row *"Drilling axis — 1,100 mm
  (without upper Kelly guide) / 1,400 mm (with)"*, with the leader arrow landing
  on the mast front face. **This machine's front-face equivalent is 0.46 m**,
  which sits between `piling_leader`'s 0.50 and `crawler_lite`'s 0.345 and well
  under the big kelly rigs. That is a sanity check, not a source.
- The [E100] lettered GA table transcribed in this file records letters A, B, D,
  E, F. **Letter C is unaccounted for** and the brochure could not be reached to
  check what it dimensions. Worth one more attempt if anyone gets access.

**6.3 Numbers introduced by this repair that are NOT SOURCED**, listed so nobody
has to go looking:

- `TABLE_BORE = 0.20` — sized off the string it must pass (124 mm bit, 114.3 mm
  rod, both [R02 §A2]), not off any published table dimension.
- `OPEN_Y0 = HOLE_Y − 0.40` and `OPEN_Y1 = MAST_Y + 0.30` — the floor opening,
  set to clear the bore and the mast-foot hood respectively.
- The 0.05 m clearance in `CARR_LO` — carried over from the author's own
  "50 mm clear" rule, applied to the real obstruction instead of the floor.
- `HOLE_Y − 0.60` and `HOLE_Y − 0.78`, the standing room and kick ahead of the
  bore, are **preserved** from the pre-repair file rather than re-chosen. They
  are the reason the machine is 249 mm longer. Preserving an existing number
  beats inventing a new one, but they were never sourced either.

**6.4 Cross-file, not fixed here (not my files):**

- `src/core/env.js` §4 already records that `mount:hole` on rc-rig is published
  as a **work light**, because `gltfRig.js` separates lamps from plain
  attachment points by "does it have an `aim:`" and this node has `aim:hole`. It
  is the only lamp in the fleet declaring neither `cone_deg` nor `range_m`. That
  was true before this change and is still true; the bore just moved 0.79 m. The
  suggested gate — "a published lamp that declares no cone" — would catch it.
- `src/core/gltfRig.js` ~L500 derives `prep.size`/`prep.radius` from the whole
  scene graph with no `framing: exclude` respect, so `frameRadius` still
  inherits ~2.4 m of ground props. Pre-existing, unchanged, still worth fixing.

**6.5 The 84,260-triangle figure is stale, and `ASTRA.md` §8.4 carries it.**
A brief given for this task said the rig had been optimised overnight to
**84,260 triangles** and asked that the export still measure ≈84k. It does not,
and it did not before this change either. Traced:

- `ASTRA.md` §8.4: *"171,908 → 84,260 triangles, 11.73 → 5.43 MB, bounds and
  draw calls unchanged"*.
- `research/rigs/wip-finalization-2026-09-05.md` records RC triangles as
  **70,804 → 70,804**.
- `research/RIG_METADATA_MEASUREMENTS.json`, dated **2026-09-06**, records
  rc-rig at **44 primitives / 70,804 triangles / 4.6 MB**.
- The on-disk `public/models/rc-rig.glb` measured **44 / 70,804** here before
  anything was touched, and a build from the unmodified source reproduced it.

So the optimisation went **further** than ASTRA's text records — 84,260 was an
intermediate snapshot and 70,804 is what shipped. Nothing was undone: draw calls
stayed at 44 throughout and every material consolidation in the file is intact.
**Cross-file request: `ASTRA.md` §8.4's 84,260 should be corrected to 70,804,
and `research/RIG_METADATA_MEASUREMENTS.json`'s rc-rig row is now stale at
70,804 against the measured 70,912.** Neither file is mine to edit.

That metadata file also gives a third independent SHA256 for a build of the
same pre-change source — `39ea72ab…`, against Codex's `462ac774…` and this
work's `f71ff008…`. Three builds, three hashes, all measuring 44 / 70,804. That
is the non-determinism in §7 confirmed from a third direction.

## 7. Reproduction

```powershell
# rebuild and export
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python blender/rc_rig.py

# measure — the only dimension tool
node tools/glbinfo.mjs public/models/rc-rig.glb
node tools/glbinfo.mjs --parts public/models/rc-rig.glb

# Codex's axis diagnostic, logic unmodified
$env:THREE_ROOT='C:/Users/henri/Downloads/threads/drillity-claude-sites/node_modules/three'
node <rc-axis fixture>/check_rc_axis.mjs public/models/rc-rig.glb   # exits 0

# look at it
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python blender/preview.py -- public/models/rc-rig.glb shots/rc-rig
```

| Input | SHA256 |
|---|---|
| `blender/rc_rig.py` before | `9a5936834d1e0c551f20078381eaabed59e9b655c05557494768e36fc8a7ff3a` |

That before-source hash is Codex's frozen hash, unchanged, which is what makes
the reproduction in §1 a reproduction of the same file rather than a new one.

### The .glb SHA256 is NOT a reproducible fingerprint — measured, not assumed

**This export is not byte-deterministic.** Two consecutive builds from a
byte-identical source produced two different SHA256s:

```
d7db7850ca467ec0c1d1d1e911d11e5ab594fe40bb26324464d63bd840e46535
2d81209f5ad6e879e7497c539fd8927cc818640005fb7e1b09143aa1b6af3ac1
```

Both are 4,737,788 bytes and both are **geometrically identical** to the ruler —
44 primitives, 70,912 triangles, 197 nodes, W 7.883 × H 7.215 × L 7.857,
bounds x −2.633..5.250 / y −0.015..7.200 / z −3.412..4.445 — and both pass the
axis diagnostic with 0, 0, 0 and no obstructions. The difference is byte layout
only, almost certainly vertex/mesh ordering inside the joined statics, where
`join_under()`/`finish()` iterate a Python set or dict.

Two consequences worth acting on, neither of them mine to fix:

- **`RC_AXIS_ALIGNMENT.md` records `baseline.glb` as `462ac774…`; an independent
  build of the same frozen source here produced `f71ff008…`.** That is not a
  discrepancy in the finding and it does not weaken it — it is this
  non-determinism. Nobody should chase it as a mismatch.
- Any gate, manifest or review that treats a `.glb` hash as proof of "same
  model" will produce false differences on every rebuild. Verify models with
  `glbinfo.mjs` and the node/material contracts, not with a file hash.

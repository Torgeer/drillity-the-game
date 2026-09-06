# RC working-axis repair — 2026-09-06

**Disposition: repaired and shipped.** The defect Codex proved is fixed in
`blender/rc_rig.py` and re-exported to `public/models/rc-rig.glb`. Codex's own
diagnostic, with its logic unmodified, goes from `passed: false` to
`passed: true`. This document is the evidence, the reasoning for the scope that
was chosen over the other, and the gaps that remain open.

It supersedes nothing in `drillity-rc-axis/research/RC_AXIS_ALIGNMENT.md` — that
document's finding was correct and its refusal to ship a guess was correct.

---

## 0. Corrections pass, 2026-09-06 — read this first

An adversarial review attacked this change from seven directions. **The geometry
survived**: re-measured on a fresh build, 44 primitives / 70,912 triangles / 197
nodes / W 7.883 × H 7.215 × L 7.857, bounds unmoved, `extensions: none`, and
`tools/check_rc_axis.mjs` passes 0/0/0 with no obstructions. **Not one line of
geometry has been changed by this pass.** What failed was the sourcing and the
claims, and those are fixed here and in `blender/rc_rig.py`.

| # | Defect | Where it is fixed |
|---|---|---|
| 1 | *"An exhaustive search … found no dimensioned GA of any RC rig, and both Epiroc brochures are behind HTTP 403"* — contradicted by this file's own source table and by `rc_rig.py` 100 lines above. Both halves false. | §6.2, rewritten from the actual documents |
| 2 | The feed stroke was reported as unresolvable when it is one line of arithmetic — **+198 mm of mast restores a one-rod stroke** | §6.1 |
| 3 | `MAST_LEN`'s stated derivation ("a 3.4 m stroke needs ~5.4 m of mast, which is what MAST_LEN already was") is 0.6 m out against the repair's own formula | `rc_rig.py` scale block |
| 4 | *"Their offsets RELATIVE TO EACH OTHER are unchanged"* — false; the rod guide moved 50 mm more than the table and jaws | §4 |
| 5 | *"this costs 12 triangles"* against the measured **+108** — 9× apart in one document, and it was the justification for the design | §4 |
| 6 | rc-rig.md §4.7 cited for "the fabricated nose that carries the mast foot past the track front" — §4.7 says no such thing and cannot discriminate between the two scopes | §3 (conclusion kept, reason replaced) |
| 7 | `tools/check_rc_axis.mjs`, the pass/fail gate, **was not in this repository** | committed, §5 |
| 8 | `CARR_HI = 1.55` lost its derivation in the diff, and the deleted one was already false | `rc_rig.py` `build_head` |
| 9 | `OPEN_Y1` annotated "clear of the hood" and is not — 130 mm of overlap | `rc_rig.py` `build_deck` |
| + | **Four of the five renders §5 cited do not exist anywhere** | §5, replaced with `shots/rc-verify-*.png` |
| + | `MAST_D` carried `[MET p.22 §3b]` with no gap mark, so **all three** terms of `WORK_AXIS` are unsourced, not two | §6.2 item 8 |
| + | The Bauer comparator dropped both of rc-rig.md's caveats and read as corroboration when it is 2.4–3.0× larger | §6.2 item 7 |
| + | The rod-arm evidence was reported only in its flattering half; closest approach to the bore got **43 % worse** | §3 evidence 3 |
| + | The breakout table now has a **50 mm air gap** to the mast and no bracket | §4 |
| + | `mount:hole` vs mast rake — the file asserted a pose-independent invariant it can only hold at one angle | §6.6 (new), `rc_rig.py` `build_mast` |
| + | Stale dimension line: *"glbinfo reports 7.883 × 7.214 × 7.606"* — that length is pre-repair | `rc_rig.py`, rc-rig.md §8 |
| + | The transmission row is attributed to `glbinfo`, which prints no such column | §5 |

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
It also puts the mast foot 0.09 m **behind** the track nose, leaving that
1.55 m `front-frame` nose carrying nothing at its front end.

> **CORRECTED 2026-09-06 — the §4.7 citation is withdrawn, the conclusion
> stands.** This paragraph also said scope A *"contradicts `build_deck`'s own
> citation, [MET p.22, rc-rig.md §4.7], for 'the fabricated nose that carries
> the mast foot out past the track front'"*. **That citation cannot carry the
> argument.** rc-rig.md §4.7 says only *"the drill centre is off the front of
> the machine, forward of the tracks"*; `grep -i "nose\|mast foot"` finds
> neither word anywhere in it. And that sentence is satisfied by **both**
> scopes, since both put the bore forward of the tracks — a source that cannot
> discriminate between two options is not a reason to pick one. The scope
> choice holds on the measured collision above (`deck-plate`, `house-front`),
> which is a statement about this model's own geometry and needs no external
> source at all. Same correction applied at `rc_rig.py`'s `MAST_Y` block and at
> evidence item 4 below.

**B — mast and carrier stay, bore derived forward to −3.64. Chosen.** It
moves no sourced structure and requires strictly fewer invented numbers. `MAST_Y` simply takes
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
2. **The primary reference.** `threads/drillity-rc-axis/evidence/mineral-p22.png`
   (Mineral Exploration Tooling – Catalog p.22, rendered and looked at — the
   path was given as `evidence/mineral-p22.png`, which does not exist in THIS
   repository; it is in the other worktree). The page is captioned **"Explorac
   235"**, i.e. it is the same machine as [E235] p.7 — see §6.2. It shows the rod clamp /
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

   The rod-handling arm was offered as the same story, and **that half was
   reported one-sidedly. Corrected 2026-09-06.** It is a 1.501 m swing arm
   (`pivot:rod-arm` at mast-local (0.43, 0.16), gripper at arm-local
   (1.46, 0.35)). Its pivot stood 0.459 m from the old bore and is 1.043 m from
   the new one, so the **radial** mismatch |arm radius − pivot-to-bore| does
   improve, 1.042 → 0.458 m. That was the only figure given. The arm also has
   a declared sweep, `range_deg` [0, 155], and against that:

   | | old bore | new bore |
   |---|---:|---:|
   | closest gripper approach within [0, 155°] | 1.138 m | **1.627 m** |
   | rotation needed to actually reach the bore | −173.1° | −127.8° |

   **The gripper's closest approach to the bore got 43 % WORSE.** The gripper
   bears +13.5° from the arm's zero, so it sweeps bearings 13.5..168.5°, while
   the bore lies at −114.3° — outside the declared range in both
   configurations. So this sub-assembly does **not** support scope B the way
   the jib hook does: it never reached the bore before and it does not now, and
   the repair pushed the closest approach out by half a metre. It is demoted
   from evidence to a recorded cost. (It is also not urgent: `range_deg` has
   zero consumers in `src/` today, so nothing animates this arm.) The jib-hook
   evidence above is unaffected and is measured the same way it always was.

4. **Structural read.** `front-frame` is a 0.98 × 1.55 × 0.34 fabrication
   sitting under the mast foot, and scope A slides the foot off the back of it,
   leaving a 1.55 m nose supporting nothing. That is an argument from this
   model's own authored geometry. **It is NOT an argument from rc-rig.md §4.7**,
   which is what `build_deck`'s comment cites and which says nothing about a
   nose or a mast foot — see the correction under scope A.

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
  **CORRECTED 2026-09-06: this bullet said their offsets *relative to each
  other* are unchanged. That is false.** Three moved −0.740 and one moved
  −0.790:

  | | before | after | shift |
  |---|---:|---:|---:|
  | `breakout-table` | −0.05 | −0.790 | **−0.740** |
  | `clamp-jaw` (both levels) | −0.05 | −0.790 | **−0.740** |
  | `clamp-ram` (both levels) | −0.25 | −0.990 | **−0.740** |
  | `rod-guide` | 0.00 | −0.790 | **−0.790** |

  What *was* preserved is the ram-to-jaw relationship: the rams are still
  0.20 m ahead of the jaws they drive. What changed is that the rod guide sat
  50 mm **behind** the jaws and the table and is now **concentric** with them.
  That is the right end state — guide, holding clamp and breakout table all
  pass one string and belong on one centre — but it is a change, and the
  original wording hid the only relative motion in the group.
- The breakout table is now a **split pair** with a 0.20 m bore instead of one
  solid box. Off-axis nobody noticed it had no hole for the string; on-axis a
  solid plate would have been steel across the bore. Split tables are the real
  idiom. **Cost, CORRECTED: +108 triangles, not the 12 stated here first.** One
  box becomes two, and a *bevelled* box is 108 triangles where a plain box is
  12 — `rc_rig.py` states that itself at the track shoes. The measured export
  moved 70,804 → 70,912, which is this +108 and nothing else, so the two
  numbers in this document were 9× apart and the wrong one was the justification
  for the design choice. Still no extra draw call: same material, same bucket.
- **The table is now unattached, and that is a real cost this document did not
  state.** Computed from the constants in `rc_rig.py`: the table's rear face is
  at mast-local −0.48 and `mast-foot-hood`'s front face is at −0.43, so there is
  a **50 mm air gap and no bracket**. Off-axis the table interpenetrated the
  mast foot, which read as bolted in. The only geometry it still touches is
  `drill-floor-side`, overlapping it 15 mm in Z across a 60 mm band in X — i.e.
  the nearest thing to a load path is 5 mm floor plate. It is parented to
  `pivot:mast`, so it does rake with the mast rather than with the floor. The
  repair traded *interpenetrating but connected* for *clean but disconnected*.
  No bracket is invented here; it is recorded as missing geometry.
- The drill floor was re-cut. It used to be a 1.70 m platform centred on the
  mast foot, built when the file believed the bore was in the middle of the
  mast; its front plate and front kick were the two things the ray hit. It now
  runs from behind the mast-foot hood forward to past the bore, opening on both.
- The feed down-stop was raised — see §6.

Everything else in the file is untouched, including the whole overnight
draw-call optimisation.

## 5. Verification

> **CORRECTED 2026-09-06 — the gate is now in this repository.** When this
> document was written, `tools/check_rc_axis.mjs` did not exist in
> `drillity-claude-sites`; it lived only in the private worktree
> `threads/drillity-rc-axis/tools/`. The headline verification of the whole
> repair was therefore not reproducible by anybody reading this file. It has
> been committed, with its measurement logic and its 1e-5 m tolerance
> **unmodified** and only two dependency paths adapted (three.js resolved from
> this repo's `node_modules`, and `evidence/` created if absent). Re-run from a
> clean checkout:
>
> ```
> node tools/check_rc_axis.mjs public/models/rc-rig.glb     # exits 0
> ```
>
> Also corrected: the transmission row below is **not** something `glbinfo`
> reports — it prints no transmission column. Zero transmission is established
> two other ways: `check_rc_axis.mjs` asserts
> `KHR_materials_transmission.transmissionFactor === 0` on every material, and
> `glbinfo` reports `extensions: none`, without which a glTF material cannot
> carry transmission at all.

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

**Renders.** ⚠ **CORRECTED 2026-09-06: four of the five images this section
originally cited are not in this repository and could not be found anywhere.**
`find . -name feed-low.png -o -name rc-fixed-lower-side.png -o -name
rc-before-lower-side.png -o -name fixed-axis-side.png` returns nothing;
`shots/` contains no `rc-*` file from that pass. Only
`evidence/baseline-axis-side.png` exists, and it is in the *other* worktree
(`threads/drillity-rc-axis/evidence/`), not here. The descriptions were
presumably written from images that were looked at in a worktree that was not
kept. **They are removed rather than left as citations to nothing** — that is
the same defect as the missing gate, one directory over. The measurements they
were used to support are independently reproducible and are stated above and
below without them.

Replaced with renders that **are** in this repository, made from the shipped
`public/models/rc-rig.glb` with `blender/preview.py` (offline EEVEE, no GPU
lease, no gameplay capture) and looked at:

- `shots/rc-verify-lower-side.png` — orthographic side, lower half. The drill
  floor reaches forward past the mast foot to under the head, the head and its
  deflector box stand proud of the mast's front face, and the whole working
  assembly lines up on one vertical.
- `shots/rc-verify-lower.png` — the same area in three-quarter, where the
  clamp stack, the split table and the hazard-striped floor opening read.
- `shots/rc-verify-hero.png`, `-hero2.png`, `-side.png`, `-cabside.png`,
  `-cab34.png`, `-deck.png`, `-kin.png` — the rest of the standard set.

**And the reason the old ones vanished, which matters more than the images.**
`.gitignore` carries `shots/**/*.png` **and** `public/models/*.glb`. Renders and
the exported model are both untracked by design, so a render cited by name in a
committed document is a reference to a file that never entered the repository —
it lives only in the working tree that made it, and disappears with it. That is
not a reason to stop rendering; it is a reason to cite renders **with the
command that regenerates them**, so the citation stays good:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python blender/rc_rig.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python blender/preview.py -- public/models/rc-rig.glb shots/rc-verify
```

The one measurement those images were carrying is preserved and does not
depend on them: at the bottom of feed travel `mount:tool` reads
`[0.0, -3.64, 1.888]` **straight off the export** — `check_rc_axis.mjs` prints
exactly that as `frames[0].tool` — so the saver sub's bottom face stops 50 mm
above the rod-guide top at 1.838, as designed.

Also looked at for this pass, and worth having: the primary photo reference
itself, `threads/drillity-rc-axis/evidence/mineral-p22.png`. It is captioned
**"Explorac 235"** on the page. See §6.2.

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
fit.

**CORRECTED 2026-09-06 — this was reported as unresolvable and it is one line
of arithmetic.** The claim that resolving it "means growing the mast or
shortening the rods … a design decision" is true but incomplete: it did not say
*by how much*, and the repair's own new formula answers that exactly. The
bottom stop is fixed at mast-local **2.098** — the rod-guide top plus the 50 mm
plus `HEAD_DROP`, none of which depends on mast length — and the top stop is
`MAST_LEN − 0.50`. Therefore

```
travel_m = MAST_LEN - 2.598              5.45 - 2.598 = 2.852 as exported

to swallow                            needs MAST_LEN     mast grows by
3.00 m pipe   [R02 §A2, BL-RC p.6]         5.598            +148 mm
3.05 m ROD_LEN (this game, NOT SOURCED)    5.648            +198 mm
3.40 m stroke (JRC1200 web cross-check)    5.998            +548 mm
4.40 m feed travel [E100 p.6, SOURCED]     6.998          +1 548 mm
```

**+198 mm of mast restores a one-rod stroke** — a 3.6 % change to a constant
that is itself NOT SOURCED, so it costs no source to move. It is still the
owner's call, because the honest alternative is [E100]'s **sourced** 4 400 mm
feed travel on a 14 400 kg machine using the same 114.3 mm rod OD this file
already carries, and that wants +1 548 mm and a taller machine everywhere.
Two decisions, both priced. That is the [E100]-size / [E235]-feature question
the module header records and which rc-rig.md §9.F says must be made **first**;
what changes here is that nobody has to re-derive the cost of making it.

**And one consequence that should be seen before choosing.** The model gets
2.852 m of stroke inside a 7.215 m erected height (`glbinfo`) — **4.363 m of
mast that never carries the head**. [E100 pp.6-7] gets 4.400 m of travel inside
a 7.840 m erected height, i.e. **3.440 m** of dead height. *This mast is 0.92 m
less efficient per metre of stroke than the machine it is sized against.*
Taking `MAST_LEN` to 6.998 for [E100]'s stroke would stand this rig at roughly
**8.76 m** erected — taller than the 7.84 m [E100] publishes for that same
stroke. So "commit to [E100]" is not a mast length on its own; the dead height
has to come out as well, and it lives in `MAST_FOOT` (1.15 m), the 2.05 m
carriage offset and the rod-guide stack. Recorded, not acted on.

**6.2 `WORK_AXIS`'s components are NOT SOURCED — and everything this section
used to say about *why* was wrong. Rewritten 2026-09-06 after actually doing
the work.**

> **What this section said, and why it was the worst defect in the change.**
> *"A search of the whole local catalogue library found no dimensioned general
> arrangement of any RC rig at all, and both Epiroc Explorac brochures return
> HTTP 403 (as they did for the previous attempt; no workaround was tried)."*
> `blender/rc_rig.py`'s own header — 100 lines above its copy of that sentence,
> written the day before it — and `rc-rig.md` §8 both name **two** dimensioned
> GAs, with URLs and transcribed tables. An unsourced number defended by a false
> claim that no source exists is exactly what [ASTRA.md §1.1] targets.

**1. The brochures are not behind 403.** `Invoke-WebRequest` with only a browser
User-Agent returns 403 on both. `curl` sending `Referer` plus
`Sec-Fetch-Dest/Mode/Site` returns **HTTP 200** on both — 2 022 709 B for
[E235] (`9868 0310 01f`, 2026-01) and 930 680 B for [E100] (`9868 0018 01f`,
2022-10). A request-header problem was recorded as an access wall.

**2. `[MET p.22]` — the photograph this entire model's shape comes from — IS
the Epiroc Explorac 235.** The page is captioned *"Explorac 235"* and
`rc-rig.md` §1 records it in its own source table. It is the **same machine**
as `[E235] p.7`'s dimensioned three-view. Nobody had connected the primary
shape reference to the primary dimension reference, which is why nobody tried
scaling the standoff off a drawing of the machine in the photograph.

**3. `[E235] p.7` is pure vector and genuinely to scale.** 38 837 path objects,
no embedded raster, so no resolution ceiling. (Logical p.7 is the right half of
physical page index 3 — five sheets carrying eight printer-spread pages; an
attempt at "page index 6" finds nothing.) Scale, taken from arrowhead **tips**
off the vector rather than dimension-line ends:

| callout | drawn span | implies |
|---|---:|---:|
| 8 800 mm working length | 190.096 pt | 46.293 mm/pt |
| 11 220 mm erected height | 239.386 pt | 46.870 mm/pt |
| 11 050 mm | 226.947 pt | *48.690 mm/pt* |

The first two agree to **0.6 %**. The third looks like a 4 % error and is not:
p.6's table gives *"Mast — Total length, including jib boom — 11 050 mm"*, and
the GA draws it as the **horizontal projection of the lowered mast** —
226.947 pt at 46.58 mm/pt = 10 576 mm = 11 050 × cos 16°. All three close.

**3b. [E100] p.7, by contrast, IS resolution-limited, and here is the number.**
Its GA is three embedded PNG rasters with the dimension lines baked into the
pixels; only the letters A–F are live text. Native sizes and effective
resolutions, with the scale traced off the baked-in dimension lines themselves:

| view | native px | drawn into | scale |
|---|---:|---|---:|
| working side elevation | **362 × 431** | 260.29 × 310.19 pt | B: 315 px = 6 120 mm → **19.43 mm/px**; A: 401 px = 7 840 mm → 19.55 mm/px |
| front elevation | 177 × 276 | 126.73 × 198.02 pt | F: 171 px, 13.10 or 16.37 mm/px depending which F |
| transport side elevation | 445 × 190 | 319.76 × 136.62 pt | E: 417 px = 7 730 mm → **18.54 mm/px** |

So **≈19.5 mm of real rig per source pixel** on the only view that could show a
standoff. Upscaling past ~4× buys nothing and anything read off it carries
roughly ±20–40 mm of intrinsic error before any judgement about which edge is
the centreline. The original commit message's *"362×431 bitmap at ~20 mm/px,
which brackets the setback to 0.25–0.75 m: too wide to quote"* was **correct**
— which makes it stranger that the file then said no GA existed at all.

**4. And the drawing still does not dimension the drill axis.** Every callout on
p.7 is an envelope or a component figure: 11 220 / 8 050 erected heights,
11 050 mast length, 8 800 working length, 3 450 width, 11 100 × 4 640
transport, and a detail balloon giving 500 mm track shoe and 640 / 330 / 150 mm
jack clearances. Traced on the vector, the two dimensions nearest the drilling
end have their arrowhead **tips** at x = 972.506 and 1009.215 pt, and their
extension lines run up into **white space** beside the machine's envelope
extremes — neither lands on a centreline. rc-rig.md §8's *"Neither GA
dimensions the rotary head's standoff from the mast"* was the right conclusion
reached for the wrong reason.

**5. Scaling it off the illustration anyway was attempted and is refused.** The
working elevation is a shaded 3-D render of a **parked** machine: no string in
the hole, no bit, no drawn centreline. Choosing a "mast centreline" means
choosing between the structural chords, the front rails, the carriage and the
parked head, and at 46.6 mm/pt one POINT of that choice is 47 mm of answer. Readings
taken this way ran from **0.16 m** (slip-table centre against the silhouette
centre) to **1.02 m** (the forward extension line against the same centre) — a
6× spread. That is a choice, not a measurement. `WORK_AXIS` therefore stays
**NOT SOURCED**, on honest grounds this time.

**6. What the GA did settle, and it is not nothing:**

- **[E235] mast fore/aft silhouette depth = 0.95–1.00 m** — 20.45–21.43 pt
  across, read at five clean heights between the parked head and the telescope
  joint, at 46.29–46.87 mm/pt. Call it **0.97 ± 0.03 m**; the spread is the
  drawing's own (the mast carries rails, hoses and a chain), not the scale's.
  rc-rig.md §8 says mast cross-section is *"Still NOT SOURCED … for any machine
  in the class"*. It now partly is.
- Slenderness follows: 11 050 / 0.97 = **11.4 : 1** (11.0–11.6 across the depth
  spread), against the **8.5 : 1** that rc-rig.md §3b measured off the
  photograph **of the same machine**. A raked
  three-quarter studio shot reads the mast ~34 % deeper than it is. The
  `MAST_D` comment claiming that ratio "is held exactly" is withdrawn in
  `rc_rig.py`.
- **[E100] letter C = 2 740 mm, and it is a TRANSPORT dimension** — listed with
  D, E and F in the transport block. This section previously hoped C was *"a
  working radius or a bore position, which is exactly the gap above"*. It is
  not. That door is closed rather than left open.
- Size class, sharper: **[E235] drills 150–200 mm holes**, spindle 114 mm
  4.5"-IF, feed travel 7 680 mm, drilling angle 45–90°, slipstable max opening
  296 mm, GMM 46 500 kg / operating 36 200 kg. **[E100] drills 127–165 mm** with
  114.3 and 101.6 mm rods to 250 m, and fits *"a mechanized breakout table … as
  standard which guides and locks rods hydraulically"* with a 30-rod
  positionable rack. This model's `HOLE_DIA` 0.124 and `ROD_OD` 0.1143 sit in
  [E100]'s band and **below** [E235]'s — one more vote for the size-class
  question in §6.1.

**7. The Bauer comparator, with the caveats this document dropped.** Where a
bore-to-mast figure is published at all it is drill-axis to mast **FRONT FACE**,
or to **slew centre** ("reach" / "working radius") — never to the structural
centre-plane. The one located instance is Bauer BG 36 H / BS 95, doc 905.868.2
(12/2020) printed p.16: *"Drilling axis — 1,100 mm (without upper Kelly guide) /
1,400 mm (with)"*, leader landing on the mast front face. **It is a foundation
kelly rig, not this class**, and this machine's front-face equivalent of 0.46 m
is **2.4× to 3.0× smaller** than those figures — so it is a note on the
convention, not corroboration, and 1.40 m must never migrate onto an RC rig.
Both caveats are rc-rig.md §8's own and were lost when this was summarised into
`rc_rig.py`'s header. For what it is worth as a fleet sanity check only, 0.46 m
sits between `piling_leader`'s 0.50 and `crawler_lite`'s 0.345.

**8. `MAST_D` is the third unsourced term, and the block understated that.**
`WORK_AXIS = MAST_D/2 + HEAD_SWING_STANDOFF + HEAD_SPINDLE_OFF` labelled only
the last two NOT SOURCED, while `MAST_D = 0.66` carried `[MET p.22 §3b]` with no
gap mark — and rc-rig.md §8 says the mast cross-section is not sourced for any
machine in the class. A sourced *ratio* times an unsourced *length* is an
unsourced metre value. **All three terms are NOT SOURCED.** The defence of
`WORK_AXIS` is unchanged and still holds — it is the coherent SUM of offsets the
mechanism already had, not a new dimension — but it is not a sourced length and
the block should not have read as though two-thirds of it were the problem.
(The old comment also did not match its own constant: it wrote "5.45 / 0.64 =
8.5 : 1" beside a constant of 0.66, which is 8.26 : 1.)

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

**6.6 `mount:hole` is defined AT ZERO RAKE, and that is now written down.**
New 2026-09-06. `pivot:mast` declares `range_deg [-19, 92]` — 111 degrees — and
the alignment this repair proved is exact at **one** of them.

`mount:hole` is built at the scene root (`empty(NODE_MOUNT, 'hole', None,
(0, HOLE_Y, 0))`), so it does not rotate with the mast, while `mount:tool` hangs
off `pivot:mast` through `slide:carriage`. Raking the mast therefore walks the
spindle off the declared bore **by construction**, and no value of `HOLE_Y` can
prevent it:

| rake | spindle world Y at rest | miss vs bore |
|---:|---:|---:|
| 0° (built and shipped pose) | −3.640 | **0.000** |
| −19° (the reference photograph's rake) | −2.933 | 0.707 |

And the uncomfortable half, stated because it is the strongest thing an
attacker has: the **pre-repair** file measured **0.083 m** at −19° against 0.790
at 0°. Its error cancelled at −21.2° (tan α = −`WORK_AXIS` / 2.04), within two
degrees of the photograph rake. So at that one angle the old arrangement looked
almost right. It was not right where it matters: the mast is built vertical, the
model ships vertical, and at the shipped pose the miss was the full 0.790 m.

**The decision, recorded rather than left implicit:** `HOLE_Y` is *"where the
spindle is when the mast is vertical"*, not a pose-independent invariant. Two
reasons. (1) It matches the machine — a rig that rakes its mast re-spots so the
bit is over the collar; the collar does not follow the mast. (2) `range_deg` has
**zero consumers in `src/`** (`grep -rn "range_deg" src/` is empty), so nothing
rakes this mast at runtime and the invariant is only ever exercised at 0. If
anything ever drives this pivot, `mount:hole` must be re-derived per rake, or
the mast must be made to rake about the **bore** rather than about its foot pin.
[E235] p.6 publishes *"Drilling angle range 45 to 90°"* for the reference
machine, so a raking mast is real on this class and this will eventually matter.

**6.7 Two structural costs of this repair, measured and left unfixed on
purpose.** Both are in `rc_rig.py` beside the geometry that causes them.

- **The breakout table is no longer attached to anything.** Its rear face is at
  mast-local −0.48; `mast-foot-hood`'s front face is at −0.43. A 50 mm air gap
  with no bracket modelled. Off-axis it interpenetrated the mast foot and read
  as bolted in. The only geometry it still touches is `drill-floor-side`,
  15 mm of Z overlap across a 60 mm band in X — 5 mm floor plate as the nearest
  thing to a load path. It is parented to `pivot:mast`, so it does rake with
  the mast. **No bracket is invented**; missing geometry is recorded as missing.
- **The rod-handling arm's closest approach to the bore went 1.138 → 1.627 m**,
  43 % worse. See §3 evidence 3. It never reached in either configuration.

## 7. Reproduction

```powershell
# rebuild and export
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python blender/rc_rig.py

# measure — the only dimension tool
node tools/glbinfo.mjs public/models/rc-rig.glb
node tools/glbinfo.mjs --parts public/models/rc-rig.glb

# Codex's axis diagnostic, logic unmodified
$env:THREE_ROOT='C:/Users/henri/Downloads/threads/drillity-claude-sites/node_modules/three'
node tools/check_rc_axis.mjs public/models/rc-rig.glb              # exits 0

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

**Confirmed again by the 2026-09-06 corrections pass.** That pass changed only
comments and docstrings — not one line of geometry — and rebuilt four times. The
on-disk artifact before it hashed `2d81209f…` and the final rebuild hashed
`054034c9…`; every build was 4,737,788 bytes and every one measured
44 primitives / 70,912 triangles / 197 nodes / 7.883 × 7.215 × 7.857, bounds
x −2.633..5.250, y −0.015..7.200, z −3.412..4.445, `extensions: none`, and
passed the axis gate 0/0/0 with no obstructions. **A third distinct hash for
one geometry.** Nobody should chase a `.glb` hash difference on this model.

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

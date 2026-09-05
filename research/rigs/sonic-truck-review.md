# `sonic_truck.py` — adversarial review

Read-only review of `blender/sonic_truck.py`, 2026-09-05, against a snapshot at
1,782 lines. **Three findings were fixed by the author mid-review and are not
listed**: under-deck furniture through the wheels, the missing
`pivot:mast-upper`, and a false transport-height claim (now correctly measured
at 3.912, independently confirmed at 3.910).

**What is right, because it is load-bearing.** All 16 imperial→metric
conversions recompute exactly (50,000 lbf → 222.4 kN, 4,677 ft-lb → 6,341 Nm,
20 ft 1½ in → 6.1341, 14 ft 1 in → 4.2926). The folded-mast arithmetic in
`build_mast`'s docstring is **correct to the last printed digit** — propagating
the `+MAST_D/2` face through a −1.32 rad X rotation gives
`z = 1.947494 + 0.256190·y` against a claimed `1.948 + 0.2562 y`, and the deck
headroom consequences all reproduce.

---

## SEVERITY 1 — the head does not fit the mast

### 1.1 At full stroke the oscillator stack stands **1.055 m above the mast top**

`build_carriage` hangs **1.797 m of head above** `slide:carriage`. With
`travel_m = 4.2926` the game drives the node from world z 1.980 to 6.2726, so
the head top at u=1 is **8.069 m**. The mast column top is 7.014.

The mast must contain `(CARR_Z0 − MAST_FOOT_Z) + head_height + FEED_STROKE`
= 1.100 + 1.797 + 4.293 = **7.190 m**; `MAST_LEN` is **6.134**. Deficit
**1.056 m** — the same number.

**The in-file CHECK measures the wrong thing.** It prints the carriage NODE's
travel against the mast top and then congratulates itself that *"the carriage
stops 0.74 m short of the crown"* — into which 1.797 m of head has to fit.

Three fixes; pick one and say which:
- shorten the stack to ≤ 0.741 m — not credible, the rotation unit, swivel and
  manifold are real;
- drop `CARR_Z0` and shorten the stack together;
- **keep the published 14 ft 1 in as the TOOL's stroke** and set
  `carr['travel_m']` to the geometrically available ~3.0 m, recording the
  disagreement with the datasheet the same way `MAST_LEN` already records its
  20 ft 1½ in / 19 ft 1 in conflict.

**Do not leave it.** The head visibly floats off the top of the mast in the
shipping game.

### 1.2 `MAST_Y = 0.440` leaves zero space, and the whole carriage is inside the head casting

The comment derives it as *"0.230 + 0.210 = 0.440 exactly"* — which puts the
head's rear face and the mast's aft face **in the same plane**. Everything the
carriage is made of is drawn in that zero-thickness gap:

| part | y span | inside `osc_body` (−0.230…+0.230)? |
|---|---|---|
| `carr_plate` | 0.183 … 0.217 | yes |
| `carr_gib_*` | 0.158 … 0.202 | yes |
| `carr_back` | 0.120 … 0.190 | yes, 70 mm over 0.560 × 0.520 |
| `iso_puck_*1` | 0.060 … 0.130 | **entirely buried, invisible** |

`MAST_Y` must be `HEAD_D/2 + MAST_D/2 + packing`, and the file itself draws
0.110 m of packing → **`MAST_Y ≈ 0.550`**, or `HEAD_D` comes down. *The
"exactly" comment reads as rigour and is the source of the error.*

### 1.3 Both mast work lights sit inside the head's sweep

Lamp shells span |x| 0.2325–0.3975; `osc_body` is |x| ≤ 0.3846. The housing
passes through **`feed-work-light` at u = 0.03–0.13** of stroke and
**`crown-work-light` at u = 0.86–0.97**. The key light — the one `env.js`
re-aims every frame — is eaten by the head **within the first 13 % of every
hole**. Move both to |x| ≥ 0.47, or onto the mast's outboard flanks.

---

## SEVERITY 2 — parts that float or interpenetrate

**2.1 `ecc_boss` floats 38 mm off the housing, and 12 bolts are invisible.**
`tube()` builds along +Z from its base; `rot (+π/2,0,0)` sends +Z to **−Y**, so
the boss spans y −0.308…−0.268 while the housing face is at −0.230. The sign is
wrong: `(-math.pi/2, 0, 0)` gives 38 mm proud and 2 mm keyed in, plainly the
intent. **This is the exact `wheel()`-docstring failure mode the file itself
warns about**, in the one part that "gets the modelling budget". Consequently
all twelve `ecc_bolt_*` lie entirely inside the boss and never render.

**2.2** Fuel tank cuts 23 mm through the rear platform over a 176 mm chord —
the AABB sweep covered `build_cab` against itself but not against
`build_station`.
**2.3** The folded mast sits **61 mm inside its own mast rest**; the docstring
says it *"lands on"* it. Either `CRADLE_Y` moves forward to 5.081 or the rest
drops 60 mm. (`CRADLE_Y`'s comment cites working in `build_mast`'s docstring
that is not there.)
**2.4** Air-reel flange cuts sub-frame bearer 7.
**2.5** Tool-rack bracket supports nothing — **28 mm of air** under the bunk it
is said to carry; the bottom casing row also sinks 5 mm into the deck plate.
**2.6** Damper vessel intersects the gearbox by 38 mm; `damper_line`'s lower
245 mm is buried inside `osc_body` and terminates in the interior.
**2.7** Tilt pins stop 15 mm short of the towers they pin.
**2.8** Spring packs float — attached at neither end.

---

## SEVERITY 3 — contract

**Most of it is clean and that is worth stating:** `travel_m` real,
`mount:tool` under `pivot:spindle`, `pivot:mast` authored vertical at
rotation 0, nine materials all present in `assets.js`, no `transmission`,
`join_under` called for every dynamic subtree, **≈39 draw calls against 70**.

**3.1 `mount['watt_w']` is never read — `gltfRig.js` reads `watt_hint`.** All
five lamps fall back to the default 70 W, so the authored 60/60/50/50/50
distinction is silently discarded. `bolter.py` and `oil_derrick.py` use
`watt_hint`; `cpt_unit`, `crawler_lite`, `crawler_th`, `si_rig` and this file
use `watt_w`. **This is `_model-critique.md` §3.1's "five dialects for one
idea" repeating in a file that explicitly says it adds no sixth.**
One-character-class fix.

**3.2 `slide:mast-dump` is inert and its comment claims otherwise.**
`makeDyn()` reads only `pivot:mast`, `pivot:mast-upper`, `slide:carriage` and
`mount:tool`. Nothing raises the dump, ever — same for `slide:jack-*` and
`pivot:spindle`. Forward-looking authoring is fine; **a comment stating
behaviour that does not exist is not.**

**3.3** The docstring's node list has the build order wrong and omits
`pivot:mast-upper`.

---

## SEVERITY 4 — numbers wearing a citation they do not have

**4.1 `[BR]` is cited 26 times and is defined nowhere in the file.** It carries
the entire head — `HEAD_W`, `ECC_R`, `AIR_MPA`, the stack, the hoses, the
cribbing, the oscillator force, the head colour. `[DT]` is defined and cited
twice, never at a constant. It is obvious that `[BR] == [DT]`, but **in a file
whose stated discipline is that every dimension traces to a cited page, a tag
resolving to nothing is a broken trace.** Same for bare `[TSI]` and
`[VDB]`/`[V3]`; `[EST]` and `[R02/R11/R16]` are defined and never used.

**4.2 `HEAD_W` is derived from the wrong tube.** The header says the ratio is
against *the drill pipe*; the code divides by `CORE_OD` (the 100 mm core
barrel). `ROD_OD = 0.0889` is defined two lines earlier and **never used
anywhere**. On the pipe the ratio gives 0.684, not 0.769. The "solved, not
guessed" chain is broken at its one absolute.

**4.3 `[D]` is applied to ~19 free choices.** The legend says `[D]` means
derived by arithmetic on a sourced number, *"flagged every time"*. These are
not: `DECK_PLATE`, `BODY_W`, `HOOD_W`, `AXLE_R2`, `MAST_FOOT_Z`, `CROWN_H`,
**`HEAD_D`**, `JACK_X`, `CRIB_W`, `PLAT_Z`, `CRADLE_Y` and more. The file uses
`NOT SOURCED` correctly elsewhere, which makes it worse — a reader trusting the
legend reads `HEAD_D = 0.460  # [D]` as sourced, **and `HEAD_D` is the input to
`MAST_Y`'s derivation in §1.2.**

**4.4** `TYRE_OD`'s comment says "63 mm"; the radius difference is 32.5 and the
diameter difference 65. 63 is neither.
**4.5** `H_TRANSPORT` is declared "A CHECK" and never checked. Defined and
never referenced: `MASS_KG`, `PULLBACK_KN`, `PULLDOWN_KN`, `ROD_OD`, `AIR_MPA`,
`WORK_H`, `RAIL_W_OUT`, `TYRE_OD`, `WHEELBASE`, `CA`, `AF`, and — pointedly —
**`DUAL_SPACE`**, whose comment celebrates it as *"SOLVED from two published
figures instead of being invented"*. Solved, then discarded.

---

## SEVERITY 5 — comments describing what the code does not do

- *"Two baulks, crossed"* — the two are **parallel**, and the next line of the
  same comment says so.
- The air line *"from the deck reel up to the damper"* stops **1.5 m short**.
- *"THE HELICAL HOSE that takes up the carriage travel"* is parented to `dump`,
  not `carr` — it is bolted to the mast and takes up nothing. It also passes
  through the energy chain, the other feature the file calls most distinctive.
- `CLAMP_Z` is *"waist height for the man on the platform"* at **0.630 m above
  the deck he stands on** — thigh height. `MAST_FOOT_Z` gives the same 1.180 as
  waist height for a man **on the ground**. Two comments, two different men,
  one of whom is standing on a platform the file also draws. **A driller reads
  that in two seconds.**

---

## SEVERITY 6 — what a working driller would call out

1. **No walkway on a deck with a perimeter handrail and toe boards.** The
   widest continuous lane is **206 mm**; ram pedestals stand in the other one.
2. **The rear platform is solid across the drilling axis** — the 150 mm casing
   spears straight through it. Every truck rig has a cut-out there.
3. `casing_shoe` is drawn **at the collar**; a casing shoe is at the *bottom*
   of the string.
4. **The jacks are posed at 89 % of stroke, not the 60 % the comment claims** —
   and the barrel is **0.427 m, shorter than the 0.610 m stroke it must
   contain**, which is not a cylinder that can exist.
5. `rod_r = JACK_BORE / 2` makes the rod OD equal the bore; a rod is 0.5–0.7 of
   it.
6. Jack pads float 20 mm above their own cribbing, and overhang the timber on
   both sides — which is precisely what cribbing exists to prevent.
7. `coil_hose` has **3.1 control points per revolution**; a Bézier needs ≥4 to
   close a circle. It will read as a lumpy triangular spiral.
8. **The console faces the wrong way** — tipped down and forward toward the
   string, while the operator is at −y. One of the two rotation signs is wrong.

---

## The single most valuable next step

**Add a POSED check, not just a static one.** The build already prints an
every-vertex bounding box and a folded-pose measurement. Neither can see §1.1,
§1.3 or §2.3, **because all three only exist when the game moves a node.**

Twenty lines in `build()` that re-evaluate the depsgraph with `slide:carriage`
at `travel_m` and `pivot:mast` at the transport tilt, then print (a) max z under
`slide:carriage` against the mast top and (b) the minimum separation between the
carriage subtree and the `dump` subtree, would have caught the 1.056 m
overshoot, both swallowed lamps and the mast rest — **from inside the build.**

That is ASTRA §8's *"verify by measurement, not by the absence of an error"*
applied to the one axis this file still measures by reasoning.

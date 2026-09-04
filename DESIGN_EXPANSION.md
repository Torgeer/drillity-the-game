# Design expansion — what shipped, and where it departed from the plan

**This file used to be a proposal.** It described four gaps, specified a fix for
each, and was written in the future tense — "the fix", "now being added", "in
flight". Most of it has since landed. Read as a proposal it now misleads: it
promises things that already exist as if they did not, and it promises two or
three things that still do not exist as if they were nearly done.

So it has been rewritten to describe **what the code does**, and to say plainly
where the delivered design departed from the proposal and why. Where something
is still absent it is marked **NOT BUILT**, not "in flight".

Read with `DOMAIN.md`, `PLATFORM_TRUTH.md`, `GAMEDESIGN.md` and `METHOD_IDS.md`.
Ground truth is `src/game/data.js`, `src/sim/drilling.js`,
`src/world/geology.js` and `src/rig/rigFactory.js` — not this file. Where the
two disagree, the code is right and this file is stale.

**State of the tree when this was written: 2026-09-04.** The game has **21
methods** and **18 rigs**. Several source files were being edited by other
agents during the pass, so exact numbers inside them may have moved; the
structural claims below were checked against the code and should hold.

---

## 1. BORE GEOMETRY — delivered, and wider than proposed

**The original problem.** `world/geology.js` rendered a vertical cutaway and
assumed every hole was one: depth on Y, the borehole a vertical cut, the view
scrolling down as depth grew. Correct for most methods, wrong for HDD (a long
profile, measured in bore length), wrong for raise boring (pilot down, reamer
pulled up), and with no way to express a tunnel face or a driven pile at all.

**What was built.** `geology.js` gained `sectionMode`, selected per method from
`METHODS[].sectionMode`, with **five** modes — the proposal asked for three.

| mode | Methods today | What the band means |
|---|---|---|
| `vertical` | 16 of 21 | Depth on Y, scrolls down. The default and the majority |
| `profile` | `hdd` | Long-section: along-bore station on X, depth on Y, scrolls sideways |
| `raise` | `raise-boring` | Two stages, both levels drawn; stage 2 runs in reverse |
| `heading` | `tunnel-jumbo`, `rockbolt` | A face advancing horizontally, ground ahead always visible |
| `pile` | `driven-pile` | The as-built column — and the depth ruler **becomes the blow-count bar chart** |

### Departures from the proposal, and why

**`heading` and `pile` are new.** The proposal had three modes because it was
written before `tunnel-jumbo`, `rockbolt` and `driven-pile` existed. Both new
modes fall out of the same machinery rather than being special cases.

**The vertical-exaggeration mechanism changed.** The proposal described V.E. as
a property of `profile` ("typically 5–10×, shown on the ruler as two scales").
As built, **V.E. falls out of `metresPerUnitX`** rather than being a second
scale of its own. Section units are square on screen, so
`V.E. == metresPerUnitX / metresPerUnitY == metresPerUnitX` by construction and
the two scales cannot drift apart. `profile` lands at **6:1** (a 120 m X window
against the 20 m Y view) and badges it as two scales, as asked. `heading`
derives its X window from the excavated height instead of a fixed metre count,
because the research figure ("the last 120 m and the next 40 m") would have
drawn an 8 m tunnel 19 px tall and none of the things the mode exists to show —
a 4.5 m round, 300 mm of shotcrete, a 3 m radial bolt — would have survived. It
lands at 1.6–3.2 and badges that.

**The invariant that made five modes affordable** is not in the proposal at all,
and is the most important thing in this section: **one section unit is always
one metre of true vertical depth on Y, in every mode.** So the 4096-texel column
lookup, the contact distances, the water table, the ruler and the whole shading
rig are untouched by mode. A mode may change only what one unit of X means, what
depth sits at y = 0, where the ground line is, and the shape of the void. With
those at their defaults every shader expression reduces algebraically to the one
`vertical` had, which is why **`vertical` cannot regress.**

**`profile` has one user, not four.** It was specified for HDD, auger boring,
microtunnelling and pipe jacking. Only `hdd` exists as a method. The mode is not
HDD-specific and the other three would drop straight into it — but nothing in
the game drives them.

### HDD — the geometry landed, the steering game did not

**Built.** The `profile` long-section with a real designed path: entry tangent,
entry and exit arcs, design cover depth, all carried as shader uniforms
(`uPathA` / `uPathB` / `uPathC`). Two passes, and the second runs backwards —
`stages: [pilot, pullback]`, where the pullback's constraint is **pull force,
not rate**, with a stall ceiling, cutter wear per metre, and a stuck product
pipe that loses the job. The contract's target is **bore length** on both
passes. Mud is `flushCritical: 0.40`, because a mud motor needs flow.

**NOT BUILT — the steering game.** Everything the proposal described as making
HDD "a steering game rather than drill-forward" is still absent:

- No **slide vs rotate**. `WORK` is labelled "Rotate against slide" in the HUD,
  but the sim models it as an ordinary rotary axis; there is no slant-face
  steering.
- No **walkover locator**, no sonde, no pitch, no **roll / clock position**. The
  clock position was to be *the* steering control — 12 o'clock up, 6 down.
- No **design corridor** to hold the bore inside.
- No **frac-out** — drilling fluid breaching to surface as an environmental
  incident. It is not in the hazard table.
- No **minimum bend radius** rule (≈1,200 × pipe diameter for steel) as a
  constraint the player can bust.

This matters more than an absence usually would: `GAMEDESIGN.md` §7 lists
"rotate vs **slide**" as HDD's WORK control, so the design document currently
describes a control the sim does not implement. Either build it or correct §7.

### Raise boring — delivered

Two stages: a conventional pilot drilled down, then the reamer pulled up with
`ropMul: 0.32`, because a reamer head is a far larger face than a pilot bit.
Stage 2 runs the progress in reverse and shares the `pull-stall` hazard with
HDD's pullback.

---

## 2. COMMODITIES AND ORE BODIES — the geology delivered, the economy did not

**The original problem.** The game had applications (`mining`,
`mineral-exploration`, `oil-gas`) but no commodity, no ore body and no assay.
Exploration is defined by its target, so this was the missing heart of
prospecting.

### What was built — and it is the strongest work in this expansion

`world/geology.js` places an optional **ore body** in the profile, generated
with the section and **hidden until drilled**. `getOreAt()` / `getOreAtStation()`
are the assay; `getDrillabilityAt()` folds the ore's own rock properties in, so
the player **feels** the vein before reading it.

**Ten geological kinds carried by three shader shapes**, because the maths is
the same and only the parameters differ:

| Shape | Kinds |
|---|---|
| `planar` — distance to a dipping plane | `orogenic-gold`, `epithermal-gold`, `carlin-gold`, `placer-gold`, `coal`, `bif`, `pegmatite` |
| `lenticular` — rotated ellipse | `vms-copper`, `kimberlite` |
| `stacked` — depth-zoned column | `porphyry-copper` |

`getOreAt()` mirrors that maths on the CPU from the same parameters, **so what
the sim assays and what the section draws cannot disagree.** That is a
structural guarantee, not a convention, and it should not be given up.

**Eight commodities**, each with a `[background, cutoff, typical, bonanza]` grade
band in a real unit: gold (g/t), silver (g/t), copper (%), zinc (%), coal
(MJ/kg), iron (%), lithium (Li₂O %), diamonds (cpht). Regions host plausible
subsets via `REGION_COMMODITIES`; `north-sea` hosts none, correctly.

### The sourcing discipline — the most valuable thing this section produced

Four of the eight commodities carry **`sourced: false`** plus a `needs` note:
**coal, iron, lithium and diamonds.** `research/08-commodities.md` has no grade
model for any of them, so their bands are game values and are labelled as such.
`getOreAt()` passes that flag out on **every** sample, and `sim/drilling.js`
gates on it: an RC bag cut in a coal seam **reports the intercept and withholds
the number** rather than inventing one.

This is now a hard platform rule — `PLATFORM_TRUTH.md` Part C §7 — and it
generalises past commodities: *when a data table marks a figure unsourced, the
UI's job is to say less, not to round it off and hope.* **The geometry is not a
claim.** Drawing a kimberlite pipe is fine; the shape is a game shape and is
documented as one. It is the *number* that needs the source.

The original §2 commodity table listed nine rows including **oil & gas**,
**water** and **geothermal**. Those three are not `COMMODITIES` entries and
should not become them: water is already the water table, geothermal is heat at
depth, and hydrocarbons are modelled by the well itself. Dropping them was
correct.

### RC — delivered in full

Reverse circulation is `rc`, level 21, the other half of exploration: dual-wall
pipe (`rc-pipe-114`), a cyclone, a riffle splitter and calico bags in a
dedicated **`sample` bay**, and — exactly as the proposal argued — the failure
mode is **not a hole problem.** All three of its hazards are assay problems:
`wet-sample`, `carry-over`, `cyclone-choke`. You can drill a perfect hole and
deliver nothing. `scoredOn` is *sample recovery and contamination*, and the sim
tracks per-metre bags with recovery, contamination, wetness, quality and
`oreBagsLost` — metres of economic intercept the campaign drilled through and
cannot report.

### NOT BUILT — the prospecting economy

The proposal's five-step loop is delivered as far as step 3 and stops:

| Step | Status |
|---|---|
| 1. A target and a designed hole | built — contracts carry the target |
| 2. Drill it; recovery is the score | **built for `rc`**; see the departure below |
| 3. Log and assay the intercept | built — per-bag assay, gated on `sourced` |
| 4. Payout = day rate + recovery bonus + **discovery bonus** | **NOT BUILT.** `game/economy.js` has no assay, discovery or recovery term. Contracts carry only the generic `bonus: { time, quality }` |
| 5. A discovery unlocks a **follow-up step-out campaign** | **NOT BUILT.** Nothing in `src/` implements a campaign |

**A departure worth flagging.** The proposal made **core recovery %** the score
for diamond core drilling — "too much feed, too little flush or a worn bit and
you grind the core to rubble in the barrel." As delivered, `core.scoredOn` is
still **`'metres drilled'`**. Only `rc` got a recovery-based score. The method's
own description says the right thing — "you are not paid for metres, you are
paid for the core that comes up whole and in order" — and the scoring field
contradicts it. That is a one-field fix and it is the highest-value thing left
in §2.

---

## 3. OFFSHORE — partly delivered

**The original problem.** The `north-sea` region and the `oil-gas` /
`offshore-marine` applications existed but **no method could serve them** —
verified by generating 200 contracts per region.

**Built.** `oil-rotary` (level 30) on the `oil-derrick` rig, with mud rotary
modelled properly: weight from the collars, rotation from a top drive, and a mud
column that lifts cuttings, cools the bit and holds the hole open. It carries
`bha`, `mudplant`, `mud` and `wellcontrol` bays. `rodLength` is a **three-joint
stand** (27 m, from API Range 2 at 8.23–9.14 m per joint) because with a top
drive you drill down a stand and make one connection, so the stand is the real
cadence of the job. Four hazards belong to it and to nothing else — `kick`,
`lost-zone`, `diff-stick`, `twist-off` — each reading differently on the gauges
and each with a different correct answer. `validateData()` now enforces that
**every application is served by some method**, so the dead-application class of
bug cannot come back silently.

**Rig class is now derived correctly.** The proposal did not raise this, but the
audit did: rig class was being set from a depth threshold
(`targetDepth >= 1900 → HPHT`). It is now derived from an actual pressure and
temperature envelope — `HPHT_SHUT_IN_BAR = 690` (10,000 psi) and
`HPHT_BOTTOM_HOLE_C = 150` (300 °F). Depth now only picks the advertised role.

**NOT BUILT.**

- **Rotation and the helicopter seat as gameplay.** Rig type, rig class,
  rotation pattern and water depth are region metadata validated against the
  Talent value lists — they are not yet a mobilisation mechanic. The
  certificate gate *is* real (`requiredCerts` per region, expiry tracked), and
  `north-sea` correctly asks for BOSIET + OGUK medical and no longer
  double-charges the player for a HUET that BOSIET already contains.
- **Weather standby.** Regions carry weather distributions, but a storm on a
  jackup stopping the job while the day rate keeps running is not modelled.
- **Day rate vs payout.** Roles carry a `dayRate`, but contracts still settle on
  a per-metre payout rather than a day rate.

---

## 4. METHOD → MACHINE → TOOLING — enforced, by a different mechanism

**The original problem.** An audit found real mismatches: an R32 *percussion*
thread on an auger string; cable-tool assigned a hydraulic crawler with drill
rods and a tricone; SPT split-spoons and CPT piezocones filed as drill bits; 6″
tricones offered to a Ø600–3000 mm Kelly rig; a DTH crawler listed as able to
run a top hammer.

**All of those specific rows are fixed** (`AUDIT_ACCURACY.md` findings 1, 2 and
9–13). More importantly the pairing is now a **rule enforced by
`validateData()`**, which is what the proposal asked for.

### What the rule actually checks

- A method's `sectionMode` must be one of the five; its `primaryToolSlot` must
  be one of its own `toolSlots`; and it **must** declare `scoredOn` — "what the
  client is buying".
- `hasDrillString: false` → the method **cannot carry a `rod` bay**, and no
  drill-string item may claim it: *"its tools hang on a wire rope."*
- **Thread families do not mate.** A percussion connection on a method whose
  `threadFamily` is not percussion fails; a DTH shank on a method with no hammer
  at the bit fails — *"there is no hammer at the bit to couple to."*
- **Casing joints must declare LH or RH**, because casing is normally LH and
  *"silence is not an answer."*
- An item whose subcategory is **driven, pushed or installed** cannot sit in the
  cutting bay. This is the rule that permanently closes the SPT/CPT landmine.
- Rig ↔ method links must agree **in both directions**.
- Every method needs a rig that can run it and shop stock for its primary bay;
  every application needs a method, or no contract can ever be generated.
- An unsourced price must carry a `needs` note saying why.

### The departure: no `driveType`

The proposal wanted each rig to declare a **drive type** (hydraulic drifter /
rotary head / top drive / oscillator / winch-and-jars / rack-and-carriage), with
methods requiring one and `validateData()` failing on any method with no rig
that has it.

**That field does not exist.** `RIGS` rows carry no `driveType`. The same
outcome is reached instead through `threadFamily` compatibility plus the
bidirectional rig↔method check, which catches the cases that motivated the
proposal — a DTH surface rig can no longer claim top hammer, because the pairing
is asserted in two places and checked against itself.

Whether that is a good trade is a genuine open question. The thread-family route
catches *tooling* mismatches precisely and *machine* mismatches only by
convention: nothing stops a future rig from claiming a method it has no drive
for, so long as both rows agree with each other. A `driveType` field would make
that structurally impossible. It is cheap to add and would not invalidate
anything above.

---

## 5. INDUSTRY COVERAGE — re-audited against the code, 2026-09-04

Talent defines the industries. Its authoritative list is `STATIC_INDUSTRIES` in
`drillity-mobile-magic/src/lib/jobTaxonomy.ts` — **that repo is not in this
tree, so the "Specs" column below is carried forward from the previous revision
and is NOT verifiable here.** The game is measured against Talent's industry
list, not against a drilling-methods list.

The **Gap** column in the previous revision was written optimistically and is
now substantially wrong — six of its eight rows describe as missing things that
have since shipped. What follows is a fresh read of the code.

| # | Talent industry | Specs | Coverage in the code today | Real gap |
|---|---|---|---|---|
| 1 | **Oil & Gas** | 20 | `oil-rotary` L30 on `oil-derrick`; mud programme with real specific gravities; BOP stack; well-control HUD in sg; `kick` / `lost-zone` / `diff-stick` / `twist-off`; HPHT from a pressure/temperature envelope; `north-sea` live | **The entire well-services loop** — cementing, workover / completion, coil tubing, wireline logging, perforation, fracturing: no method, no application, no items. **Directional / MWD as gameplay** — `CAT.mudMotors`, `CAT.mwdLwd`, `CAT.steeringTools`, `CAT.surveyTools` exist as shop leaves with nothing steering. Offshore rotation, weather standby and day-rate settlement not modelled (§3) |
| 2 | **Geotechnical** | 3 | **`site-investigation` L8** with a dedicated **`probe` bay**; SPT split-spoon plus auto and donut hammers; CPT friction cone and piezocone; window sampler, U100, Shelby; `si-rig` and `cpt-unit`; `cable-percussion` is now a real machine; sonic | Largely closed. Remaining: **dynamic probing** (DPL/DPM/DPH/DPSH) is a taxonomy leaf with no item; and `economy.js`'s safety-net contract still calls a 150 mm auger borehole a **"trial pit"**, which is an excavation and never a borehole (`AUDIT_ACCURACY.md` finding 25) |
| 3 | **Prospecting** | 2 | `core` L18 **and `rc` L21**; ore bodies with ten kinds and eight commodities, hidden-until-drilled reveal, per-bag assay gated on `sourced`; `sample` bay with cyclone, splitter and bags | **The economy, not the geology.** No discovery bonus, no recovery bonus, no day rate, no step-out campaign (§2). And **`core.scoredOn` is still `'metres drilled'`** while its own description says the opposite — core recovery is modelled nowhere |
| 4 | **Foundation** | 2 | rotary-Kelly, CFA, cased CFA, overburden, anchor, jet grouting — and **`driven-pile` L33**: impact and vibratory hammers, precast / steel tube / H / Z-sheet piles, and a **`dolly` bay** where the helmet and packing wear like a bit | Strongest area, and the named gap is closed. Remaining: **diaphragm wall is still nominal** — `diaphragm-wall` is an application served by `rotary-kelly`, with no hydromill, no grab and no panel sequence; **displacement (FDP)**, **soil mixing (CSM/DSM)** and **press-in** absent |
| 5 | **Construction** | 2 | `civil-infrastructure` and `quarry-construction` across many methods | Adequate. `Road milling` from `DOMAIN.md` §2 has no application, method or rig — a defensible scope call, but the doc should not imply otherwise |
| 6 | **Mining** | 1 | top hammer, DTH, raise boring, core, RC — **plus `longhole` L39** (ITH hammers, ring and fan geometry, toe accuracy → dilution) and **`rockbolt` L29** (friction / rebar / cable bolts, resin, plates, nuts, mesh, `install` bay) | Both named gaps closed. Remaining: charging is items only — the ANFO hose and shock-tube reel exist, but the charge-and-fire cycle is not player-facing beyond the jumbo's round; no shaft sinking |
| 7 | **Tunneling** | 2 | **`tunnel-jumbo` L36** with the `heading` section mode, pull-per-round and overbreak scoring, `collar-slip` / `cut-choke` / `bad-ground`; plus rockbolt, anchor, jet grouting, raise boring, core | Drill & blast landed. **TBM and roadheader are still absent** — `TBM Cutters` and `Roadheader Picks` are taxonomy leaves with no method behind them; shotcrete is a mesh item, not gameplay |
| 8 | **HDD** | 3 | Method, rig and tooling all present; **`profile` section mode with a real designed path**; two passes, with backream and pullback governed by pull force | **The steering game is still not built** — no slide/rotate, no locator, no clock position, no corridor, no frac-out, no bend-radius rule (§1). The geometry was the stated gap and it is fixed; the *gameplay* gap is what remains, and `GAMEDESIGN.md` §7 currently advertises a control the sim does not have |

### Scorecard against the previous revision's priority list

| # | Was | Now |
|---|---|---|
| 1 | Oil & Gas — "20 of Talent's 35, and it had nothing. In flight." | **Landed** as mud rotary. Well services and MWD gameplay still absent |
| 2 | HDD profile geometry — "misrepresented, which is worse than absent" | **Landed.** The steering gameplay did not |
| 3 | RC + commodities + assay | **Landed** — geology and sim. The economy did not |
| 4 | Tunnel drill & blast (jumbo) | **Landed** |
| 5 | Underground production drilling + rock bolting | **Landed** — both |
| 6 | Driven piling / vibratory | **Landed** |
| 7 | Site investigation as its own method | **Landed**, and it fixed the SPT/CPT slot error as predicted |

Seven of seven shipped as *methods*. What did not ship is the second half of
three of them — the HDD steering game, the prospecting economy, and the offshore
rotation/day-rate loop — and that is a consistent enough pattern to name:
**the simulation and geology work landed; the economy and meta-game work did
not.**

---

## 6. What is genuinely still open

In rough order of value, with nothing here that is already done:

1. **`core.scoredOn` says `'metres drilled'`** while the method's own
   description says the opposite. One field, and it is the last piece of the
   prospecting design.
2. **The prospecting economy** — discovery bonus, recovery bonus, day rate, and
   the step-out campaign that turns a discovery into a long-form goal.
3. **HDD steering** — or, failing that, correct `GAMEDESIGN.md` §7 so it stops
   advertising a slide control that does not exist.
4. **Oil & gas well services** — the largest industry by Talent specialisation
   count, currently served by exactly one method.
5. **A `driveType` field on `RIGS`**, to make a method/machine mismatch
   structurally impossible rather than merely conventionally avoided (§4).
6. **TBM / roadheader**, and **diaphragm wall as a real method** — the two
   places where a taxonomy family exists with nothing behind it.
7. **Offshore rotation, weather standby and day-rate settlement.**

### Two notes for whoever picks this up

- **`research/12-oem-rock-tooling.md` exists.** An earlier audit recorded that
  it did not; it is in the tree, alongside `research/13-string-elements.md`.
  There is no `research/09`.
- **The sim keeps its own method tuning table and does not read `data.js`
  `METHODS`.** `resolveMethod()` in `sim/drilling.js` returns an entry from that
  table; `drilling.js` imports nothing from `data.js` for it. This is a
  defensible separation — tuning is not data — but it means numbers appearing in
  both files can and do drift apart. They currently disagree on `rodLength` for
  `auger`, `hdd`, `rc`, `oil-rotary` and `site-investigation`
  (`AUDIT_ACCURACY.md` finding 30). If you add a field that lives in both,
  decide which one owns it and write that down.

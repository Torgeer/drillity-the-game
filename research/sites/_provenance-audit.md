# Provenance audit — the eight new site modules

**Role:** provenance critic (agent 19 of the twenty-agent site track,
`CLAUDE_PARALLEL.md`). **Worktree** `drillity-claude-sites`, branch
`claude/site-environments`, baseline `673f888`.

**Scope, exactly.** Sourcing of `blender/sites/{infrastructure_corridor,
open_pit_bench, tunnel_portal, underground_drive, exploration_pad, well_pad,
platform_deck, marine_spread}.py` and their exported
`public/models/sites/*.glb`. Five questions, from the brief:

1. guessed numbers wearing a citation — a tag that resolves to nothing is a
   broken trace (`sonic-truck-review.md` §4.1: `[BR]` cited 26 times, defined
   nowhere; §4.3: `[D]` applied to ~19 free choices);
2. engineered numbers that must never be invented — bench geometry and slope
   angles, engineered clearances, structure ratings, offshore equipment
   specifications, support spacings, deck elevations;
3. the line between physical dimension and fictional composition — composition
   is legitimate and must be **labelled**;
4. invented marques — ASTRA §1.2, `DOMAIN.md` §10;
5. method suitability against `data.js`.

**Conventions.** `research/CRITIQUE.md` lines 12-13: *anything I did not
measure is marked **SUSPICION** and is not a finding.* Measurement is
`node tools/glbinfo.mjs` and nothing else — ASTRA §5, the deleted `glbdims.mjs`
produced four false findings, three reported as real. I do not write a second
ruler.

**I do not edit** any builder's module, any site GLB, `terrain.js`,
`blender/lib/site.py`, or anything under `src/`. This file is my only output.

---

# PART 1 — GROUND TRUTH, ESTABLISHED BEFORE READING ANY BUILDER MODULE

Written first, deliberately, so this is a critique and not a proofread.

**Disclosure about my own research, stated plainly rather than implied.** The
session's WebSearch budget (200 calls) was exhausted by the other nineteen
agents before I ran a single query, and the 40-agent subagent cap was saturated,
so the four primary-source research subagents I planned were refused. Two
targeted `WebFetch` calls got through; both are in §1.1 with their URLs.
Everything else in Part 1 is the in-repo pack with its own markers preserved.
ASTRA §10 — *a hardcoded claim inside a gate is the same bug wearing a lab
coat* — cuts against overstating the breadth of my own sourcing here.

## 1.1 Verified by me, independently, this session

| # | Fact | Source | URL |
|---|---|---|---|
| GT-1 | Berms/guardrails on a mine haul roadway must reach **"at least mid-axle height of the largest self-propelled mobile equipment which usually travels the roadway."** **There is no absolute metre or foot figure in the rule, and none derived from tyre diameter.** | 30 CFR § 56.9300 (MSHA) | https://www.law.cornell.edu/cfr/text/30/56.9300 |
| GT-2 | Minimum clearance to energised overhead lines, Table A: **≤50 kV → 10 ft · >50–200 → 15 ft · >200–350 → 20 ft · >350–500 → 25 ft · >500–750 → 35 ft · >750–1000 → 45 ft**; over 1000 kV as established by the utility owner or a PE. | 29 CFR § 1926.1408 Table A (OSHA) | https://www.law.cornell.edu/cfr/text/29/1926.1408 |

**GT-1 is the trap for `open_pit_bench.py`.** A windrow or safety berm is one of
the first things anyone models on a pit bench, MSHA is the obvious citation,
and MSHA does not contain a number. Any constant of the form
`BERM_H = <number>  # [MSHA]` is a misattribution however plausible the number.

**GT-2 is the only printable clearance figure available to
`infrastructure_corridor.py`** — and it is a *power-line* figure, not a rail
figure. See P-1.

## 1.2 The pack's sourced numbers, per archetype

From `research/16-site-archetypes.md`, which marks its own claims `[F]` fact /
`[I]` inference / `NOT SOURCED`, source keys in its §G. A builder may use
these; a builder may not exceed them.

### open-pit-bench (§A.5)
Benches **5–10 m**, excavated in flitches of **2.5–3 m** `[GF-STIVES]`; general
figure **12–15 m benches, 20–40 m wide** `[WP-OPENPIT]`; haul road *"at the
side of the pit, forming a ramp"*; trucks **90–180 t**, excavators
**150–350 t**. Rotary blasthole **152–406 mm (6–16 in)**, pulldown
**60 000–125 000 lb**; one published class has a **53 ft tower** for *"15 m
bench heights"* `[EPIROC-BH]`. Blast pattern: hole depth **3.5–10.5 m**, burden
**3–3.5 m**, spacing **3.5–6 m**, stemming **1.5–4.0 m** `[NAT-BLAST]`.
**Not in the pack at any value: bench face angle, batter angle, inter-ramp or
overall slope angle, catch-berm width, haul-road width, ramp gradient.**
`NOT SOURCED` in the pack: haul-road water carts — *"model them, do not cite
them."*

### tunnel-portal (§A.9)
Mine portal in a **box cut**, one real case **34.5 m deep**, water table at 6 m,
leading to a decline **2 220 m long, 6 m high × 5.5 m wide** `[DP-RANGER]`. Fan
about **10 m inside the entrance** `[PMC-DUCT]`. Civil portals are massive RC or
reinforced shotcrete with **wing walls and movement joints**; slopes above
stabilised by anchors, rock bolts, soil nails and shotcrete with rockfall
protection `[DARDA-PORTAL]`. Apron plant: relocatable batching plant with
aggregate bins, mixing unit, batch room, fibre dosing, cement silos, winter
heating `[TECWILL]`; muck conveyor or rail haulage; lamella settlement water
treatment `[SILTBUSTER]`. Pipe-umbrella pre-support is installed at portals *"by
a conventional drill jumbo"* `[SANDVIK-AT]`, `[DSI-AT]` — the **only surface
archetype where an underground machine legitimately stands in daylight**
(§F.1 point 1).
**Not in the pack at any value: canopy-tube diameter, length or crown spacing;
portal-specific shotcrete thickness; approach-cut slope angle; headwall or wing
wall dimensions; rock-trap ditch geometry.** `research/17` §5 lists tunnel
portal layout among the things it did **not** verify — *"do not assume they are
fine because they are absent here."*

### underground-drive (§A.6)
Development drive **4–5 m high × 4–5 m wide**; low-profile drive **2 m**
`[W-SANDVIK-DD211L]`. The game's own `core/env.js` already implements
**12.6 × 8.4 m heading** and **5.0 × 5.0 m production drive**.
Support `[NFF26]`: shotcrete **80 mm** good ground → **150 mm plus reinforced
arches** very poor; bolts **c/c 2.5 × 2.5 m** good → **1.3 × 1.3 m** poor.
Rules of thumb `[HOEK-SUPPORT]`: dowel length **½ to ⅓ of the span**, spacing
**≈ ½ the dowel length**. Bolt hardware, and the fact non-miners get wrong:
**Swellex 130 kN, 26 mm tube, 33–39 mm hole — bolt SMALLER than the hole**;
**Split Set 90 kN, 33/39/46 mm tube, 32/35/41 mm hole — bolt LARGER than the
hole**; grouted cable bolt **500 kN, 20 mm cable, 35 mm hole**.
Face `[NFF26]`, `[PSU-871]`: blast-hole **48 mm**, reaming holes **often
102 mm**, standard round **5.3 m** (6.2 m rods in larger road/rail), contour
**c/c 0.7 m**, contour charge reduced **75 %**, inner contour **50 %**.
Services `[VERTEX]`: **11 kV power cable, water line, air line**. Duct hung
along the vault centreline on **φ8 mm steel wire ropes**, hooks welded to
**M12 expansion bolts at 5 m intervals**, fan **about 10 m inside the entrance**
`[PMC-DUCT]`. LHD **12.6 × 3.2 × 2.9 m**, 21 t, 8.0–11.2 m³ `[SANDVIK-LHD]`.
`NOT SOURCED`: a defensible charged-hole count for a round; how an underground
core rig is anchored (*"Draw it; do not assert it"*).

### exploration-pad (§A.8)
Pad **20–40 m diameter** ground-supported, **40–50 m** helicopter-supported
`[ONTARIO-BMP]`; another jurisdiction caps at **900 m² (0.09 ha)** with a
**100 m** buffer to any water body `[MB-BMP11]`; a real project ran **~100 m²**
`[AUSEARTHED]`. **≥3 m clearance around the drilling equipment** `[BLY-PAD]`.
Sump **4 000 L, emptied roughly every 150 m** `[CORING-MAG]`, ramped and
guarded, sited near rig/borehole/mud tank `[BLY-PAD]`.
Core `[WP-EDD]`: **BQ 36.5 mm core / 60 mm hole · NQ 47.6 / 75.7 · HQ 63.5 / 96
· PQ 85 / 122.6**. Trays **~1 m** `[GSI-DRILL]`, holding **BQ 6–7 m, NQ 5–6 m,
HQ 4–5 m, PQ 3–4 m** `[PCT-SIZE]`. Boxes **≥100 m from water**, bottom layer
**15–45 cm off the ground**, **≥1 inch between boxes** `[MB-BMP13]`. Logging
tables **74–94 cm high** `[CORING-PALSA]`.
Access: line cutting **1.5 m or less** needs only a plan; wider needs a permit
`[ONTARIO-BMP]` — *"a narrow, hand-cut, straight slot through standing bush —
roughly a metre wide, not a road."* Heli modules **under 1600 lbs**
`[MULTIPOWER]`. Casing cut to **≤15 cm** above ground on abandonment, deep
ripping to **50 cm** `[MB-BMP16]`, `[AUSEARTHED]`.
RC spread `[RCD-SETUP]`, `[DRILLWEST]`: **2 m mast dump-feed**, **200 m** rod
handler, onboard compressor **~1 000 cfm at 500 psi**, booster **1 350 cfm /
500 psi** for 300–400 m, **up to 2 700 cfm / 1 000 psi** combined. Splits
**6.25–12.5 %**; a real splitter is alumina-ceramic-lined with a **double drop
box of 25 L each** and bolt-in **4 / 6 / 8 / 10 %** blade sets, rated
**3 000 CFM / 750 PSI** `[DST-SPLITTER]`. Sample **2–3 kg per metre** `[ALOM]`
into calico bags **200 × 300 to 600 × 900 mm** `[DISC-CALICO]`.
`NOT SOURCED`: litres per minute of drilling water by core size.

### well-pad (§A.13)
Regulated site **minimum ~3 000 m², up to 10 000 m² (1 ha)** `[WITTIG]` p.19,
plus low-loader access, sealed surfaces for hazardous substances, a **drill
cellar** with rig foundations, sewer connection or sewage pit, water supply, an
**oil separator**, **fixed fencing**, power, and provision for a **gas flare**.
Arrangement `[WITTIG]` p.26: mast over a substructure **raised high enough to
fit the BOP stack underneath**; **mud tanks and pits on one side**; **shakers on
the mud-return side**; **mud pumps and the power plant behind**; the
**standpipe climbing a mast leg**; **pipe racks on the ground**. Rig-up order
and the **rat hole** for the kelly `[KGS-PRIMER]`. Camps **35 to 90 persons**;
rigs **1 200–2 000 HP** rated **12 000–23 000 ft**, hook loads
**440 000–1 600 000 lb**, BOPs **5 000–10 000 psi** `[FOX-DESERT]`.
The composition rule, and it is testable: *"Cuttings skips and an auger from the
shaker house (closed loop) **or** an earthen pit with a flare pit outboard of
the mud tanks — **one or the other, never both.**"*

### platform-deck (§A.10)
Conductors **510–760 mm (20–30 in)**, held by conductor guides *"framed at
various elevations within the jacket and decks"* at roughly **12–18 m
(40–60 ft)** intervals; jacket foundation piles penetrate **90–180 m**
`[EP0147144]`. Wells are drilled through **well slots set out by a drilling
template**, **10 to more than 40** of them, surface spacing **as close as
1.8–3.0 m between well centres**, and **the drill floor SKIDS from well to well
in two perpendicular directions** `[OGP-OFFS]`, `[DM-PLATFORM]`,
`[USPTO-5379844]`.
**The absences ARE the identity of this archetype: NO moonpool, NO cantilever,
NO riser, NO anchor lines.** *"Cantilevering is what a jack-up does."*
Modular rig example `[OM-MODULAR]`: drill floor + active mud system in
**14 × 12 m** at **~890 t**, **mast 28 m with 19 m clear working height**, crew
17, **maximum module weight 12 t**, assembled with a **30-tonne platform
crane**. Platform cranes **15–40 t** small, **50–100 t** larger `[OM-WEIGHT]`.
The drill floor is a **Zone 1** hazardous area `[HSE-ZONE]`. Conductors are
driven by a free-hanging marine hydraulic hammer in the **150 kJ** class
`[STRESS-COND]`, `[OM-CONDUCTOR]`.
`NOT SOURCED` in the pack (§F, verbatim): **pipe-deck / drill-pipe storage
arrangements on a fixed platform**; **location of well slots inside a concrete
gravity-base structure's legs**.
**Not in the pack at any value: air gap, cellar-deck / main-deck / drill-floor
elevation above LAT or MSL, helideck D-value or landing-area dimensions,
derrick height or hook-load rating, deck plate or grating thickness, handrail
height, structural member sizes.** Every one of those is category 2 of my brief.
If a builder prints one it carries its own primary citation or says
`NOT SOURCED`.

### marine-spread (§A.12, §A.11)
Purpose-built geotechnical drillship: **83 m × 20 m**, *"twin tower drilling
derrick over a centrally located moon pool"*, rated **3 000 m** water depth, 60
berths, soil laboratory beside the drill floor `[MTN-VOYAGER]`. Comparable
units: moonpools **4.0 × 4.2 m to 7.2 × 7.2 m**, heave-compensation stroke
**4 m or 6 m**, combined water-plus-borehole reach **350 / 600 / 2 500 m**,
**5½" API drill string** `[GQM-*]`. A converted PSV: **88 × 20 m**, moonpool
installed, **40 m drilling rig** on a mezzanine deck `[BM-ZEPHYR]`. DP survey
vessel: **80 m** DP2, *"moonpool with deployable 100 kN CPT system"*, side
A-frames `[GARD-OR]`.
Seabed CPT frame: **4 500 kg in air, 3 700 kg in seawater**, footprint
**2.2 × 2.2 m**, penetration *"2 cm/sec ±10 %"*, **35 kN push**, **up to 20 m
from coiled rod**, water depths to **3 000 m** `[CMS-CPT]`, `[HELMS-NEP]`,
`[DATEM]`. Heavy end **20-tonne frames at 200 kN**; class spans **10–15 kN** to
**100–200 kN** `[GARD-VC]`, `[FUGRO-REV]`.
Jack-up `[WP-JACKUP]`, `[OM-JACKUP]`, `[VALARIS-JU]`: legs *"three, four, six
and even eight"*; **rack-and-pinion** jacking; **preloading**; **spudcans**
reaching **20 m diameter**; cantilever reach **40 ft** on older units to
**70–76 ft**, largest classes **~100 × 65 ft** and **~100 × 80 ft**.
`NOT SOURCED` in the pack (§F, verbatim): **active vs passive heave compensation
on any named geotechnical rig — *"vendor pages give the stroke, not the type.
Print the stroke, not the type."*** · **ROV-deployed geotechnical CPT units as
an established class — *"Do not model a flying ROV pushing a cone."*** ·
**Boskalis, Van Oord, Seaway7 or Kongsberg as operators of geotechnical SI
spreads.**

### infrastructure-corridor (§A.2)
Cofferdam sequence and sizing `[DB-COFFERDAM]`: single-walled suits small
enclosed areas in roughly **4–6 m** of water; double-walled for larger/deeper;
cellular for deep marine. Over-water piling is **crane-suspended** — piling
gates, trestles and guide frames, vibratory then a crane-suspended hydraulic
impact hammer; **not** a tracked leader rig `[SPUK-CONV]`. Real rail job:
**120 sheet piles of 3.5–5.5 m** in four shifts from **RRV-mounted piling
attachments**, plus **46 piles at 273 mm and 6 at 323 mm** `[VANELLE-LUTON]`;
unjointed precast piles **up to 16 m** held for possession windows
`[AARSLEFF-RAIL]`. Over-water kit `[HSE-DROWN]`: throw lines **8–12 mm**
diameter, buoyant; grab line tensioned downstream at **45°**; auto-inflating
lifejackets.
`NOT SOURCED` in the pack (§F, verbatim, and it is the hardest line in it):
**numeric rail overhead-line clearances — *"the rail standards are paywalled.
`[GS6]`'s power-line zones are a generic analogue only and MUST NOT BE PRINTED
AS A RAIL FIGURE."*** · **traffic-management numeric values (safety zone
lengths, taper rates, cone spacing) — the standard is `[TSM8]` and the figures
were not extracted.** · **barge- or pontoon-mounted piling rigs and temporary
causeways.** · **infrastructure corridor furniture in detail.**

## 1.3 The eleven prohibitions a builder can trip on, as a checklist

Each is a verbatim instruction already on the record, not a preference of mine.

| # | Prohibition | Source |
|---|---|---|
| P-1 | Do not print a numeric rail OLE clearance. `[GS6]`/OSHA power-line zones are a generic analogue **only**. | §F, §A.2 |
| P-2 | Do not print traffic-management numerics — taper, cone spacing, safety-zone length. | §F, §A.2 |
| P-3 | Do not print a numeric quarry/bench face height or berm width as a rule. **The figure does not exist as a rule.** | §F, §A.4 |
| P-4 | Do not model a flying ROV pushing a CPT cone. | §F |
| P-5 | Print the heave-compensation **stroke**, never the **type** (active/passive). | §F |
| P-6 | Do not put a consultancy's name on a drill vessel; do not name Boskalis/Van Oord/Seaway7/Kongsberg as SI spread operators. | §A.12, §F |
| P-7 | Cerchar abrasivity must never surface as a value, anywhere — *"a quarry or bench archetype is exactly where somebody would be tempted."* | §F |
| P-8 | A fixed platform has **no moonpool, no cantilever, no riser, no anchor lines**. | §A.10 |
| P-9 | Well pad: earthen pit **or** closed-loop steel tanks — **never both**. | §A.13 |
| P-10 | An RC pad has a compressor truck and no mud tanks; a diamond pad has water, a sump and core trays and **no compressor truck**. | §A.8 |
| P-11 | No real manufacturer name or model designation reaches the player, in any node name, material name, `extras`, decal or shop string. | ASTRA §1.2, DOMAIN §10 |

## 1.4 The marque baseline I hold builders to

`src/game/data.js` ships nineteen invented marques. Prefixes in play:
`NV CP TH DH CX KR CF DR HD SN RC FJ LH GB DP DL SI CP RB`.
ASTRA §1.2: `PM-78` shipped and `PM` is a real maker's live prefix; it was
renamed `DP-78`; **the other seventeen have never been cleared.** Clearing them
is not my assignment; any **new** badge, decal or label the eight site modules
introduce is, and I check every one.

**One collision noted in passing, on evidence, and it is not one of my eight
sites:** `Kilmar CP-24 Shellhand` (cable percussion) and `Rynnval CP-20
Ballastline` (CPT unit) both carry `CP`. ASTRA §1.2 states the prefix is
**method-derived** and names `CP-24` as the cable-percussion prefix. Two methods
on one prefix breaks that scheme internally. Recorded for whoever owns the
prefix sweep; **out of my scope and not counted among my findings.**

---

# PART 2 — AUDIT OF THE EIGHT MODULES

**Status at the time of writing: `blender/sites/` contains only the two
reference modules, `quarry_bench.py` and `urban_plot.py`. No new builder module
and no `public/models/sites/` directory exists yet.** Part 2 is filled in as
modules land. Nothing is asserted about a module that does not exist.

## 2.0 The reference standard the eight are graded against

`quarry_bench.py` is not one of my eight and I am not reviewing it, but it sets
the bar and it deserves saying plainly that **it clears the bar**:

- its header names five source keys and states, per key, **what that key
  actually supports** — `[OSMRE-BLAST]` for burden/spacing/stemming/subdrill,
  `[HSE-L118]` for the danger zone and edge protection, `[MINSYS-DUST]` for the
  plant chain — and it grades `[MINSYS-DUST]` itself as *"a vendor blog,
  moderate quality"*;
- it has a **NOT SOURCED section in the header AND repeats the mark at every
  use** — `FACE_DIST`, `FACE_H`, `FACE_FROM`, `BERM_Z`, `BERM_W`,
  `CREST_ACROSS` are each individually labelled `NOT SOURCED — composition, not
  fact`;
- it refuses the number that does not exist rather than inventing a plausible
  one: *"there is no numeric face height or berm width in the regulations… The
  figure does not exist as a rule. Do not print one";*
- it declines to assert blasthole inclination and **draws the holes vertical**,
  which `[BRITANNICA-Q]` does list, rather than asserting the unsourced 10–20°
  rule;
- `build_plant()` carries `EVERY DIMENSION IN THIS FUNCTION IS NOT SOURCED`.

**That is exactly the behaviour my brief says to credit, and it is the pattern
the eight are measured against.** A module that marks a composition choice
`NOT SOURCED` has done the right thing and I say so when I see it.

## 2.1 What was actually delivered at the close of this pass

| module | lines | tags used | tags resolving | `NOT SOURCED` | URLs in file | GLB |
|---|---|---|---|---|---|---|
| `infrastructure_corridor.py` | 900 | **0** | — | 8 | 0 | none |
| `tunnel_portal.py` | 549 | 13 | **13 / 13** | 22 | 0 | none |
| `platform_deck.py` | 1278 | 14 | **10 / 14 in its own key list** | 16 | 5 | none |
| `well_pad.py` | 1042 | 10+ | not exhaustively traced | 32 | 7 | none |
| `open_pit_bench.py` | — | — | — | — | — | **not delivered** |
| `underground_drive.py` | — | — | — | — | — | **not delivered** |
| `exploration_pad.py` | — | — | — | — | — | **not delivered** |
| `marine_spread.py` | — | — | — | — | — | **not delivered** |

**No `public/models/sites/*.glb` exists for any of the eight.** The only two
site GLBs present are the reference assets, and I measured both with
`tools/glbinfo.mjs`: `quarry-bench.glb` 6 primitives / 13,936 tris /
71.370 × 16.268 × 54.654 m, materials `blastedRock, gravel, paintedDark,
rawSteel, rubber, safetyStripe` (**6 = the budget exactly**);
`urban-plot.glb` 5 primitives / 29,576 tris / 63.585 × 20.480 × 65.965 m.
Both string-scanned clean against 46 manufacturer names.

**Consequence, stated plainly: everything below is a SOURCE audit. Not one
exported mesh of the eight could be measured, so no claim here is a claim about
geometry.** The brief asks me to read the exported geometry and the actual
images; there are none to read. That is the largest single gap in this pass and
it is not a gap I can close by reasoning.

---

# PART 3 — FINDINGS, WORST FIRST

## SEVERITY 2

### F1 — Two modules' entire citation chain bottoms out in a file that does not exist

`tunnel_portal.py` header: *"`research/sites/tunnel-portal.md` — which carries
the source URLs"* and *"is the document this file's citations point at."*
`infrastructure_corridor.py` header: *"Read
`research/sites/infrastructure-corridor.md` for the full source list."*

**Neither file exists.** `research/sites/` contains only `urban-plot.md` and
this audit. And `grep -c http` is **0** in both modules.

So every one of `tunnel_portal.py`'s 13 keys currently terminates at a key with
no address, and `infrastructure_corridor.py` has no keys at all. **This is
`sonic-truck.md` §4.1's `[BR]` one level up:** the tag resolves to a legend
entry, the legend entry resolves to a document, and the document is not there.

**CONFIRMED** (both files absent; both modules contain zero URLs).
**OPEN, not a defect of finished work** — both builders are mid-flight and
`sonic-truck-review.md` explicitly excludes what an author fixes during review.
It is listed first because it is the one thing that, if the notes never land,
silently converts two well-sourced modules into two unsourceable ones.

**The other two modules already do this right and prove it is achievable:**
`platform_deck.py` carries 5 inline URLs and `well_pad.py` carries 7, including
`[SCDT-CLOSED] https://scdrilltech.com/articles/closed-loop-and-zero-discharge.html`.

## SEVERITY 3

### F2 — `tunnel_portal.py` adds look-out to a dimension that may already include it

`DRIVE_W = 5.5` / `DRIVE_H = 6.0` are cited `[DP-RANGER]`, whose quote is
*"The decline was 2220m long, 6m high by 5.5m wide."* The module treats that as
the **theoretical** profile and adds look-out:

    LOOKOUT = 0.25                     # [NTNU-BD] rule at [NFF14] round length
    EXC_W = DRIVE_W + 2.0 * LOOKOUT    # 6.00 m  DERIVED
    EXC_H = DRIVE_H + LOOKOUT          # 6.25 m  DERIVED

and says so: *"This is why the mouth is not 5.5 x 6.0."*

**The source does not state whether its 6.0 × 5.5 is the design profile or the
as-excavated dimension.** A decline described in a completion record is at
least as likely to be quoted as-built. If it is, the modelled mouth is
**0.50 m too wide and 0.25 m too tall**, and the error is invisible because
both numbers are individually sourced and the arithmetic is right.

**CONFIRMED as an unstated assumption. Whether the mesh is wrong is
SUSPICION** — I cannot read the Douglas Partners record. **Name the assumption
at the constant** ("taken as the theoretical profile because …") or drop the
addition. This is the §5 lesson in miniature: a correct citation and correct
arithmetic can still produce a wrong dimension when the *datum* is assumed.

### F3 — `platform_deck.py` uses four keys that its own key list does not define

The file declares `SOURCE KEYS used in the citations below` and defines
`[S5] [IADC] [OGP-OFFS] [EP0147144] [A10] [OD5.1] [OD6] [AIRGAP] [ABS] [AZMAN]`
— ten. It then cites **`[OD6.3]` nine times, `[OD6.1]` once, `[OD6.2]` once and
`[OD4.11]` twice.** None of those four is in the list.

`[OD6.3]` is the **second most used tag in the file** and it carries the whole
colour scheme — `C_PLANT`, `C_AMBER`, `C_ORANGE`, `C_RED`.

**I checked whether they resolve, and they do:** `research/rigs/oil-derrick.md`
has `### 6.1 The coating system`, `### 6.2 Below the waterline the steel is
BARE`, `### 6.3 Colour` and `### 4.11 Handrails, gratings, stairs`. So this is
an **incomplete key list, not a broken trace**, and it is a materially smaller
fault than `[BR]`. **CONFIRMED.** It is still listed because the file's own
stated discipline is that the block enumerates the keys used below, and a
reader checking `[OD6.3]` against that block finds nothing.
One line each in the legend closes it.

### F4 — `terrain.js`'s sea plane is an uncited elevation, and it makes a sourced platform read 0.75 m wrong

Not a site module's fault, and reported because `platform_deck.py` found it,
handled it correctly, and cannot fix it.

**I verified the constant myself rather than trusting the report**
(ASTRA §10): `src/world/terrain.js:5414`, `sea.position.y = -14;`, with no
citation on it or on the three lines either side.

`platform_deck.py` puts its lowest deck steel — the cellar-deck framing soffit
— at `CELLAR_Z - CELLAR_D = -6.846`, giving an engineering air gap of
**7.15 m** against that sea plane. `[AZMAN]` Table 1's five in-service jacket
platforms have cellar-deck soffits at **+7.9, +11.2, +12.5, +14.1 and +16.1 m**
above mean sea level. **7.15 m is 0.75 m below the shallowest real one.**

The module states this, attributes the deficit to the sea plane rather than to
its own arrangement, refuses to move a constant it does not own, and notes that
`y = -14.75` would put the soffit exactly on the sourced +7.9 m floor. **That is
model behaviour for a builder who finds a fault in someone else's file.**

**CONFIRMED** for the uncited constant and the arithmetic. The `[AZMAN]`
Table 1 values are **SUSPICION** — I did not read the paper.

## SEVERITY 4

### F5 — `infrastructure_corridor.py` has dead code emitting duplicate node names

`build_trackway()` contains a five-iteration loop whose entire body is
terminated by `... if False else None`, emitting `mat-stack-0..4`, immediately
followed by a second five-iteration loop emitting **the same five names**.
The first is inert; the second is live. Harmless today, a name collision
waiting to be resolved the wrong way, and exactly the leftover
`_model-critique.md` §3 catalogues. **CONFIRMED.**

### F6 — `tunnel_portal.py` uses a stated maximum as a nominal value

`[NTNU-BD]` via `research/04` §A1 is quoted in the file as *"the look-out
should **not exceed** 10 cm + 3 cm per metre of hole depth"*. On a 5 m round
that ceiling is 0.25 m, and the module sets `LOOKOUT = 0.25` — the maximum —
while the comment reads `# [NTNU-BD] rule at [NFF14] round length`, which does
not say it is the ceiling. Defensible as a deliberate worst-case (it is what
makes the arch read rough) but it should say so. **CONFIRMED**; low impact.

## SEVERITY 5

### F7 — one printed NDC figure is wrong in its last digit

`tunnel_portal.py`: `CUT_CREST_Z = 9.6  # NOT SOURCED — ndc_y(28, 9.6) = +1.31`.
Recomputed from the file's **own** camera constants (`EYE_Z 2.250`,
`TOP_K 0.2065`, `BOT_K 0.1638`): **+1.3025**, which rounds to +1.30.

Cosmetic — the conclusion it supports ("off the top of the frame") is
unaffected. Reported only because every other printed figure in that file and
in `infrastructure_corridor.py` reproduces exactly, and that exactness is what
makes the arithmetic in these files worth trusting. **CONFIRMED.**

---

# PART 4 — WHAT IS RIGHT, BECAUSE IT IS LOAD-BEARING

Stated because a critique that only lists faults is not usable, and because
three of these are the specific behaviours the owner's rule is *for*.

## R1 — `NOT SOURCED` is being used correctly on exactly the numbers my brief protects

My category 2 is *bench geometry and slope angles, engineered clearances,
structure ratings, offshore equipment specifications, support spacings, deck
elevations*. Every instance of those I found is either sourced or refused:

| constant | module | what it is | handling |
|---|---|---|---|
| `CUT_BATTER = 0.34` | portal | **approach-cut slope angle** | `NOT SOURCED` |
| `NAIL_PITCH = 1.80` | portal | **soil-nail support spacing** | `NOT SOURCED — composition, not design` |
| `NAIL_PLATE = 0.25` | portal | plate size | `NOT SOURCED — [GEOSTAB-NAIL] says "small"` |
| `GIRDER_D/BEAM_D/GIRDER_W/BEAM_W` | platform | **deck structural member depths** | `NOT SOURCED. [S5] gives deck beam SPACING and deck LOADS but no member depths … do not read a capacity into it` |
| `RAIL_H/RAIL_MID/TOE_H/RAIL_R/POST_PITCH` | platform | **handrail geometry** | `NOT SOURCED. No handrail height is cited anywhere in this repo's research library, and none was found for this module` |
| `SPLASH_HI/SPLASH_LO` | platform | splash-zone extent | `NOT SOURCED, and confirmed unsourceable on 2026-09-06` |
| `SEA_Z = -14.0` | platform | **sea elevation** | `THE GAME'S WATERLINE, not a sourced elevation` |
| `FLARE_L`, `LIFEBOAT_L`, `CELLAR_D` | platform | plant dimensions | `NOT SOURCED` |
| `TURN`, `W_COLLAR`, `S_NEAR`, `S_FAR`, `CLEAR_R`, `bank_height()` | corridor | frame composition | `NOT SOURCED — composition` |
| well-pad containment pit | well pad | pit size | *"The DIMENSIONS are authored; the VOLUME BAND is not"* |

**`platform_deck.py` refusing to size a deck girder, and saying "do not read a
capacity into it", is precisely what the rule exists to produce.** So is
`SPLASH_HI` recording a *dated failed sourcing attempt* rather than a number.

## R2 — `tunnel_portal.py`'s `[UMB]` refetch is the best provenance work in the pass

`research/04` §A4 attributes *"spacing 0.3–0.6 m around the crown, installed
every 8 m to give a minimum 4 m overlap"* to `[UMB]`. The builder **refetched
`[UMB]` on 2026-09-06, found one of its three URLs no longer resolves and the
two that do give diameter and length but no spacing at all, and wrote that down
at the constant** — then re-based `PIPE_PITCH` on primary `[NFF19]` §4.3.1
(*"spacing along the arch approximately 0.3 m (range 0.2–0.6 m)"*) instead of
repeating the second-hand band, and labelled the spiling→pipe carry as *"the
marked inference."* `PIPE_ANGLE` is handled the same way and says
*"transferred."*

**That is an agent discovering its own inherited source had decayed, and
reporting it rather than inheriting it.** It is the behaviour ASTRA §5's
"two tables will drift" warning is trying to buy.

## R3 — Every derivation I could recompute reproduces exactly

`infrastructure_corridor.py`, nine for nine, including the one that is easy to
get wrong: the header claims the mast sits at NDC x = −0.10, which is true only
if you compute it at the **rig body's** `three.js z = +2.4` rather than at the
collar. It does. `COLLAR_D 13.751`, `COLLAR_A +1.147`, collar NDC y −0.99907,
horizon −0.11531, vanishing point −0.5284, mast −0.09727, frame width 32.18 m
at 40 m and 24.14 m at 30 m.

`tunnel_portal.py`: `0.10 + 5 × 0.03 = 0.250`; `5.5 + 2 × 0.25 = 6.000`;
`6.0 + 0.25 = 6.250`; `CROWN_R 3.000`; `SPRING_Z 3.250`; `18 ft = 5.4864`.

`platform_deck.py`: **fifteen imperial→metric conversions, fifteen exact** —
40 ft → 12.192, 5 ft → 1.524, −20 ft → −6.096, 48 in → 1.2192, 54 in → 1.3716,
20 in → 0.508, 1.5 in → 0.0381, 0.25 in → 0.00635, 26 in → 0.6604,
100 ft → 30.48, 64.61 ft → 19.693 (printed 19.69, correct to its precision),
`DECK_X 48.768`, `DECK_Y 24.384`, `JACKET_BOT −20.192`, and the cited jacket
band `−14 + 4.6…6.1 = −9.4…−7.9` containing `JACKET_TOP_Z = −8.0`.

`well_pad.py`: pit `6.4 × 3.6 × 1.05 = 24.192 m³`, inside the cited
20–46.5 m³ band.

**`DERIVED` and `GEOMETRIC` are used accurately throughout — which is the exact
opposite of `sonic-truck.md` §4.3's `[D]` applied to ~19 free choices.**

## R4 — `platform_deck.py` separates two meanings of "air gap" that the repo's own sources conflate

The brief asks for deck elevation justified by air gap over the design wave;
`research/16` §A.10's photograph test says a fixed platform has *"no air gap
under the deck."* Those read as contradictory and the module resolves them
properly, with sources:

- **engineering air gap** — `[AIRGAP]` quoting API RP 2SIM 1st ed. (2014),
  *"the clearance between the highest water surface … and the underside of the
  cellar deck"*; ISO 19900:2013; `[S5 p.311]` API RP2A GoM minimum **5 ft**;
  `[S5 pp.313–314]` a worked 160 ft-water / 62.5 ft-wave case putting
  bottom-of-steel at **50.2 ft calculated / 51 ft per API RP2A** above MLLW;
  `[ABS]` §1 *"a commonly referenced minimum deck clearance is 1.5 m (5 ft)"*;
- **silhouette air gap** — daylight under the hull, which a jack-up has and a
  fixed platform does not, because jacket, conductors, boat landing, risers and
  caissons fill that band.

*"This model has the engineering air gap and deliberately has no silhouette air
gap. Getting that pair right is most of what makes this read fixed rather than
mobile."* **That is the P-8 identity test passed on the reasoning, not by
accident** — and the module found and sourced the API air-gap figure that my
own two `WebFetch` attempts failed to retrieve.

## R5 — the cross-file load path is real, and I verified it independently

`platform_deck.py` claims `[S5 p.312]` — *"the skid beam spacing of a standard
GoM platform drilling rig dictates the deck leg spacing"* — means its deck legs
at 40 ft centres sit directly under `blender/oil_derrick.py`'s skid beams,
*"with no coordination between the two files."*

I checked the other file: **`blender/oil_derrick.py:181`,
`SKID_SPAN = 40 * FT   # 12.192  [S5 p.312]`.** Two modules, written
separately, cite the same page and land on the same number, so
derrick → skid beam → deck leg → jacket leg is at a sourced spacing throughout.
**The claim is true.**

I also checked the cellar-deck deduction it carries: `research/rigs/oil-derrick.md`
line 417 records *"≈20 ft = 6.1 m … **deduced** from the worked 45° truss
diagonal (L′ = L/cos 45° = 340 in over L = 240 in), **not stated**"*, page 326.
`240 / cos 45° = 339.41 ≈ 340` ✓. **The platform module carried it through
labelled `DEDUCED`, exactly as its source marked it, rather than promoting a
deduction to a fact.**

## R6 — the prohibition checklist, tested

| # | test | result |
|---|---|---|
| P-1 | numeric rail OLE clearance in the corridor | **PASS** — none |
| P-2 | traffic-management numerics (taper, cone spacing, safety zone) | **PASS** — none |
| P-7 | Cerchar / abrasivity value anywhere in `blender/sites/` | **PASS** — none |
| P-8 | fixed platform with moonpool / drilling cantilever / riser / anchor lines | **PASS** — the module names all four as absences in its docstring and argues the distinction |
| P-9 | well pad with earthen pit **and** closed-loop together | **PASS** — see R7 |
| P-11 | manufacturer name reaching the player | **PASS** — see R8 |

P-1 and P-2 are the two hardest lines in `research/16` §F (*"MUST NOT BE
PRINTED AS A RAIL FIGURE"*), they sit on the archetype most likely to trip
them, and they are not tripped.

## R7 — `well_pad.py` resolves the one-or-the-other rule explicitly, in the right place

§A.13's rule — *"cuttings skips and an auger from the shaker house (closed
loop) **or** an earthen pit with a flare pit outboard of the mud tanks — one or
the other, never both"* — is quoted **verbatim inside the build function it
governs**, and the module then states which side it picked: *"This pad is drawn
as the LINED, CONTAINED case throughout: a lined pit, a lined retention basin
and skips for haul-off, with no earthen pit anywhere. That is a single
regulatory regime stated once."*

It also anticipates my method-suitability test (P-10) without being asked:
*"it is the settling and containment pit that any flush — water, mud or the wet
returns an air hole makes when it strikes water — has to have; **it is not a
mud system and there is no tank farm on this pad**."* A containment pit is
method-neutral; a mud tank farm is not. **That is the mud-tanks-on-an-air-flush-
pad error being reasoned away before it could be made.**

## R8 — marque discipline is clean, including the one genuinely risky case

Scanning all four new modules against 46 manufacturer names returns **three
hits, all in `tunnel_portal.py`, all inside citations**: `Pantex` twice and
`SANDVIK` once (the latter as the source key `[SANDVIK-AT]`). The module
addresses it unprompted:

> *"'Pantex' is a maker's product name and appears here as a citation only —
> `DOMAIN.md` §10. Nothing exported carries it."*

**Correct.** DOMAIN §10 and ASTRA §1.2 govern what reaches the **player**;
ASTRA §1.1 requires provenance to live in a comment beside the constant. A
maker's name in a citation is the rule working, not the rule broken. No module
introduces a new badge, decal, label or lettered object: the corridor's only
lettered object is *"a route marker post, and it carries a colour band, not a
word."*

## R9 — the corridor's blocked-check honesty

`infrastructure_corridor.py` copies its seven hero-camera constants from
`quarry_bench.py` rather than re-deriving them — I verified all seven are
byte-identical — and states why: *"ASTRA §5 is explicit that two tables
describing one thing will drift… The GPU lease is held by another track while
this file is being written, so this file CANNOT re-measure them and does not
pretend to have."*

**A blocked check recorded as blocked, with the reason, and no fabricated
result.** That is what `CLAUDE_PARALLEL.md` asks of worker 20 and it appeared
here unprompted.

---

# PART 5 — SUSPICION (explicitly NOT findings)

`research/CRITIQUE.md` lines 12–13. Listed so nobody implements them as if they
were established.

- **S1 — `SHOTCRETE_MIN = 0.060` may disagree with this repo's other table.**
  `tunnel_portal.py` cites `[NFF14]` §6.3.1 for a 60 mm minimum sprayed-concrete
  thickness. `research/16` §A.6, from `[NFF26]`, gives *"shotcrete 80 mm in good
  ground rising to 150 mm plus reinforced arches in very poor."* 60 mm is below
  the bottom of that range. **Two different Norwegian Tunnelling Society
  publications can both be right** — an absolute minimum layer is not a
  good-ground typical thickness. **I could not read NFF14 §6.3.1.** Flagged only
  because ASTRA §5's central lesson is that two tables describing one thing
  drift and the wrong one gets believed; the module should say which of the two
  its number is.
- **S2 — `platform_deck.py`'s "~42 deg" brace angle.** `BAY_H`'s comment claims
  the resulting diagonals land at ~42°, inside `[S5 p.331]`'s 27–45° band. I did
  not compute the braced-bay geometry with the 1:8 batter applied. Unverified.
- **S3 — `[AZMAN]` Table 1 and Table 2.** The five real platforms' soffit
  elevations and deck configurations underpin F4 and part of R4. I did not read
  the paper; I read the module's transcription of it.
- **S4 — every mesh of all eight modules.** No site GLB exists for any of them.
  `sonic-truck-review.md`'s §1 and §2 findings — the head that does not fit the
  mast, the parts that float — were only visible in geometry. **Nothing in this
  audit rules out an equivalent for any of the eight**, and a source audit
  cannot.
- **S5 — `well_pad.py` beyond P-9 and P-10.** It landed late in the pass; I
  traced its P-9 handling, its pit volume and its URL discipline, and did **not**
  exhaustively resolve its 10 citation keys the way I did the portal's 13.

---

# PART 6 — WHAT TO DO, IN ORDER

1. **Land the three research notes** — `tunnel-portal.md`,
   `infrastructure-corridor.md`, `platform-deck.md`. Until they exist, F1 stands
   and two modules are formally unsourceable. `platform_deck.py` and
   `well_pad.py` show the alternative: put the URLs in the module.
2. **`infrastructure_corridor.py`'s constants block does not exist yet.** Its
   build functions reference roughly 36 undefined physical constants
   (`ROW_W`, `PIPE_OD`, `JOINT_L`, `MAT_W/L/T`, `TRENCH_W`, `SKID_*`, `SPOIL_*`,
   `TOPSOIL_*` …) and the module cannot import. Every one of those is a physical
   dimension. §F says corridor furniture is `NOT SOURCED` **in detail**, so most
   of them legitimately end as `NOT SOURCED` — what must not happen is a
   plausible number with no mark at all. **This is the single highest-risk
   remaining surface in the whole track.**
3. **F2** — state the theoretical-vs-excavated assumption at `LOOKOUT`, or drop
   the addition.
4. **F3** — four lines in `platform_deck.py`'s key list.
5. **F4** — hand the sea-plane elevation to whoever owns `terrain.js`;
   `y = -14.75` is the sourced answer and `platform_deck.py` already computed it.
6. **F5** — delete the `if False` loop.
7. **Re-audit on export.** S4 is the real hole: this is a source audit of four
   modules and a geometry audit of none.

---

# PART 7 — SECOND PASS: ALL EIGHT MODULES NOW EXIST

Four more modules landed after Part 3 was written. **All eight source files now
exist; no GLB does.** Final measured state:

| module | lines | tags | `NOT SOURCED` | URLs in file |
|---|---|---|---|---|
| `open_pit_bench.py` | 1182 | 16 | 16 | **18** |
| `well_pad.py` | 1042 | 16 | 32 | **7** |
| `platform_deck.py` | 1304 | 16 | 16 | **5** |
| `tunnel_portal.py` | 1301 | 15 | 32 | 0 |
| `exploration_pad.py` | 811 | 14 | 11 | 0 |
| `marine_spread.py` | 1013 | 9 | 25 | **1** |
| `underground_drive.py` | 1218 | 6 | 21 | **2** |
| `infrastructure_corridor.py` (first read) | 900 | 0 | 8 | 0 |
| `infrastructure_corridor.py` (**re-read at close — restructured under review**) | 581 | 1 | **43** | **4** |

## 7.1 F1 and F8 restated against the full set

**F1 narrows.** Five of eight modules now carry URLs inline, `open_pit_bench.py`
with eighteen. The finding survives only for `tunnel_portal.py` (15 keys,
0 URLs, pointing at a `research/sites/tunnel-portal.md` that still does not
exist) and `exploration_pad.py` (14 keys, 0 URLs).

### F8 — `infrastructure_corridor.py` was the outlier, and the author changed it under review. NOT LISTED AS A DEFECT.

**Recorded in full because the sequence matters, and withdrawn as a finding
because `sonic-truck-review.md` withdraws what the author fixes mid-review.**

At the time Part 3 was written the file stood at **900 lines with zero citation
tags, eight `NOT SOURCED` marks, no URLs, and no constants block at all** —
`ROW_W`, `PIPE_OD`, `MAT_W` and roughly 33 others were referenced by
`build_cut()`, `build_trackway()`, `build_pipe()` and `build_pipe_stack()` and
defined nowhere, so the module could not import. Against seven siblings at
811–1304 lines with 6–16 resolving tags each, I was about to raise it as a
standing severity-2 finding.

**Re-checked at the close of the pass: the file has been restructured to 581
lines and now carries 43 `NOT SOURCED` marks (up from 8), 4 URLs, a citation
tag `[PPI12]`, and a constants block.** The provenance layer that was missing is
being written.

**So this is not a fault of the finished work and it is not counted.** What it
leaves behind is the one thing to verify on the next pass:

- the module is **still the lowest-cited of the eight** (1 tag against 6–16),
  which §F makes legitimate — corridor furniture is `NOT SOURCED` *in detail* —
  provided the marks are on the constants and not only in the prose;
- the pack has sourced values for only six corridor numbers: cofferdam water
  depth **4–6 m**, sheet piles **3.5–5.5 m**, driven pile OD **273 mm** and
  **323 mm**, precast pile length **≤16 m**, throw line **8–12 mm**, grab line
  **45°**. Everything else on this archetype should end as `NOT SOURCED`;
- **the failure mode to check for is a plausible number with no mark at all**,
  which is what all ~36 were an hour ago.

Its prose was already among the best in the set (R8, R9); the gap was
never the writing.

## 7.2 `open_pit_bench.py` — the best sourcing in the track, and it closed a gap I recorded as open

Part 1 §1.2 recorded that `research/16` §A.5 contains **no bench face angle, no
berm width, no inter-ramp or overall slope angle, no haul-road width and no
ramp gradient** — the exact numbers my brief names as "must never be invented".
**This module went and got them**, with sixteen keys and eighteen URLs:
`[CALL-1986]`, `[KAUFMAN-AULT]`, `[NIOSH-MRC]`, `[RYAN-PRYOR]`, `[SRK-BFA]`,
`[CMM-43-101]`, `[PSU-MNG230]`, `[MSHA-56.3130]`, `[MSHA-56.9300]`.

**It independently reproduces my GT-1 exactly.** Its `[MSHA-56.9300]` entry
quotes *"Berms or guardrails shall be at least mid-axle height of the largest
self-propelled mobile equipment"* — the same words I fetched from Cornell — and
its `[MSHA-56.3130]` entry states outright that the regulation **prescribes no
number**: *"the width and height shall be based on…"*. **A builder that reads a
regulation and reports that it contains no figure is doing precisely what P-3
asks.**

The derived geometry recomputes: `FACE_ANGLE` 70° (inside `[CMM-43-101]`'s
59.7–73.7° zone band) gives `FACE_RUN = 15 / tan 70° = 5.460`; `INTERRAMP =
atan(15 / (8.0 + 5.460)) = 48.10°` — the file's printed value, exact;
`PIT_DEPTH = 8 × 15 = 120` matching the docstring's "eight benches". The
minimum rock catchment uses `[RYAN-PRYOR]` EQ 3.1, `mrc = 0.2 × BENCH_H + 4.5`
= **7.5 m** on a 15 m bench, and `BERM_W = 8.0` clears it. **That is the
modified-Ritchie criterion applied correctly, not a berm width picked to look
right.**

One item to watch, flagged as **SUSPICION**: the header records
*"design containment berm height 1.5 m on a 12 m bench"* from `[RYAN-PRYOR]`
and the file then discusses *"CONTAINMENT BERM HEIGHT ON A 15 m BENCH"*. That
is a transfer across bench heights. I did not read Ryan & Pryor and cannot say
whether 1.5 m scales; the module appears to mark the transfer, and it is
recorded here only so the next reader checks it.

## 7.3 `underground_drive.py` — the drift dimensions are read, not copied

The one structural answer to ASTRA §5 in the whole track. Rather than typing the
drive geometry, it **parses `src/core/env.js` at build time** for `DRIVE_YAW`,
every `UNDERGROUND` room and `CAMERA_MODES.hero` from `renderer.js`, and raises
if the parse fails, with the comment: *"That file is another agent's — FIX THIS
PARSER, [rather than typing the numbers]."*

**"Two tables describing one thing will drift, and the one that is wrong will be
believed" is not solved by discipline here; it is solved by there being one
table.** That is a better answer than every other module gave, including the two
that copy the hero camera by hand.

Its support numbers check against my ground truth: `BOLT_L = SMALL['width'] /
2.0 = 2.50` at a 5.0 m span is `[HOEK-SUPPORT]`'s *"dowel length ½ to ⅓ of the
span"* at the ½ end; the friction-bolt tube diameter is cited to
`[HOEK-SUPPORT]` via §A.6; and it implements the fact non-miners get wrong —
*"a split-tube friction bolt has NO thread (the hole is drilled…"* — as an
assertion in the build rather than as prose.

Its six tags are the fewest in the set, and that is **defensible rather than
thin**: the geometry it would otherwise cite is read from `env.js`, which is
sourced upstream.

## 7.4 `marine_spread.py` — the fixed/mobile distinction, argued rather than assumed

Prohibitions **P-4, P-5 and P-6 all pass**, and P-4 and P-5 pass for a reason
worth stating: the module models a **four-legged self-elevating work barge**
standing on its legs, so there is no ROV pushing a cone and no heave
compensator to mislabel. **A jack-up jacked clear of the sea does not heave** —
omitting compensation is correct engineering, not an omission, even though
`data.js`'s `marine-spread` `renders:` string mentions *"a heave-compensated
tower"* (which belongs to the drillship/semi sub-types §A.12(a) describes).

It cites `[IADC-JU]` §A.6 for the hull-to-sea air gap and states the test in one
line: *"A jack-up with its hull touching the water is a jack-up in transit, not
a jack-up drilling."* Taken with `platform_deck.py`'s engineering-vs-silhouette
air gap (R4), **the two offshore modules between them get the fixed/mobile
distinction right from both ends** — the one thing §A.11 says the game *"must
never do"* is draw one and call it the other.

P-6 checked in detail: `FUGRO` appears four times, all four inside the citation
keys `[FUGRO-AYM]` and `[FUGRO-CODLING]` in comments. **No operator or
consultancy name is in a node name, a material, an `extras` value or any
exported string.**

## 7.5 A fault in my own instrument, recorded

My tag-extraction regex `\[[A-Z][A-Z0-9_.-]{1,24}\]` initially reported
`[SMALL_ID]` as an undefined citation key in `underground_drive.py`. It is not a
citation: line 339 is `SMALL_ID = min(UNDER, key=…)` and the "tag" is the Python
subscript `UNDER[SMALL_ID]`.

**Caught before it was written down, and recorded because ASTRA §5's lesson is
that an approximation in an instrument becomes a false finding in a report, and
the deleted `glbdims.mjs` produced four of them.** The counts in §7's table
exclude the `[*_ID]` pattern. Any future run of this check must do the same.

## 7.6 Revised standing of the prohibition checklist

| # | applies to | result |
|---|---|---|
| P-1 rail OLE clearance | corridor | **PASS** |
| P-2 traffic-management numerics | corridor | **PASS** |
| P-3 bench face height / berm width as a rule | open-pit | **PASS** — regulation read, and reported as containing no number |
| P-4 ROV pushing a cone | marine | **PASS** |
| P-5 heave stroke not type | marine | **PASS** (moot — jack-up) |
| P-6 operator / consultancy names | marine | **PASS** — all in citations |
| P-7 Cerchar | all eight | **PASS** |
| P-8 platform absences | platform | **PASS** — argued, not accidental |
| P-9 pit **or** closed-loop | well pad | **PASS** — stated once, explicitly |
| P-10 RC air vs diamond water | exploration pad | **PASS** — see §7.8 |
| P-11 marque reaching the player | all eight | **PASS** in source; **untestable in mesh** — no GLB exists |

**Eleven prohibitions, eleven tested, eleven passed.** That is a materially
better result than I expected to find, and the one I most expected to be
tripped — P-1, the rail clearance — was not.

## 7.8 P-10 tested, and a note that belongs to `terrain.js`, not to a builder

`exploration_pad.py` models the **diamond core** spread: core trays sized from
`[GSI-DRILL]`'s *"about 1 m"*, a sump, a return line and a suction line. Its
sump is `2.600 × 2.200 × 0.700 m`; **that is 4 004 L against `[CORING-MAG]`'s
sourced 4 000 L**, and the file's own printed plan area of "5.7 m²" recomputes
as 5.72. The number was realised, not approximated.

It adds **no RC air kit at all** — no cyclone, no splitter, no booster, no
calico bags. **P-10 PASSES.**

**The compressor skid on the pad is not this module's.** `terrain.js`
`buildProps()` draws a compressor skid, water bowser, two rod racks, a casing
stack, a toolbox, a barrier arc and the site sign **on every archetype**, and
`exploration_pad.py` lists all seven under *"WHAT IS DELIBERATELY NOT HERE"*
and asserts each footprint as a keep-out so it cannot stand inside them. That
is correct behaviour and it is why the module passes.

**The observation for whoever owns `terrain.js`:** §A.8's own recognition test
is *"A diamond pad does not have a compressor truck."* The universal kit puts a
compressor on a diamond core pad on every archetype it draws. A **skid** is not
a **truck** — a small compressor for air tooling is ordinary on a core pad — so
this is a low-severity note rather than a finding, but the universal kit is the
one place where a method-inappropriate object reaches every site at once, and
it is worth one deliberate look.

## 7.7 The one thing that has not moved

**No `public/models/sites/*.glb` exists for any of the eight.** Every finding
above is a source finding. `sonic-truck-review.md`'s severity 1 and 2 — the head
standing 1.055 m above its mast, twelve bolts rendering inside their own boss,
both work lights eaten by the head — were **invisible in the source and only
existed in geometry**. Nothing here rules out an equivalent in any of the eight,
and this audit must be re-run against the exports before any of it is treated as
a clearance.

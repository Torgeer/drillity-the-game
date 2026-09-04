# AUDIT — factual and terminological accuracy

Standard applied: `PLATFORM_TRUTH.md` **Part C** (traceable · precise ·
unit-correct · no brand claims · no Drillity internals), plus `DOMAIN.md` §1–§10,
`FACTS_VERIFIED.md`, `METHOD_IDS.md` and the research packs. *(An earlier
revision of this line said `research/12` does not exist in the tree. It does —
`research/12-oem-rock-tooling.md`, alongside `research/13-string-elements.md`.
There is no `research/09`.)*

**Tree state.** Audited against the working tree on 2026-09-04. `src/game/data.js`,
`src/sim/drilling.js` and `src/ui/screens/catalog.js` were being edited by other
agents *while this sweep ran* (drilling.js grew 3,294 → 4,035 lines, catalog.js
928 → 1,242). Line numbers are from the last read of each file and may drift by a
few lines; every finding is also identified by item id or string so it stays
findable. Nothing under `src/` was modified.

**Scope covered.** `core/contract.js` · `game/data.js` · `game/economy.js` ·
`game/progression.js` · `sim/drilling.js` · `world/geology.js` · `world/terrain.js`
· `rig/tools.js` · `rig/rigFactory.js` · `core/assets.js` · `core/preview.js` ·
`ui/components.js` · `ui/shell.js` · all nine screens in `ui/screens/`.

---

## Where this stands — re-checked 2026-09-04

Every one of the 46 findings was re-checked against the working tree after the
six new methods landed. **Nothing was closed that could not be verified from the
code**; where only part of a finding was fixed it is recorded as PARTIAL and the
unfixed half is spelled out.

| | Count | Findings |
|---|---|---|
| **RESOLVED** | 37 | 1, 2, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 26, 27, 28, 29, 31, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 46 |
| **PARTIAL** | 3 | 7, 8, 30 |
| **STILL OPEN** | 2 | 32, 45 |  *(4 resolved 2026-09-04; 24, 42 corrected in FACTS; 25 fixed in economy.js)*

Three things about that scoreboard are worth knowing before reading it as good
news:

1. **Nine of the resolutions were achieved by deleting code, not fixing it.**
   Findings 21, 22, 23, 27, 28, 29, 35, 36 and 44 all pointed at the hardcoded
   fallback tables in `ui/screens/catalog.js`. Those tables are gone rather than
   synchronised, and the file now says why: *"the tables are gone rather than
   synced, because syncing only restarts the drift."* That is the right call,
   and it means the screens now render an honest empty state instead of a
   confidently wrong one. It is not the same as the data having been correct.
2. **Finding 41 was closed in the wrong direction.** The shipped `FACTS` line
   and `FACTS_VERIFIED.md` now agree — but the *markdown was edited to match the
   code*, which is precisely the move `tools/checkfacts.mjs` tells you never to
   make in its own header: the direction of truth is always FROM the markdown TO
   the code. The lockstep control is restored; the discipline it exists to
   protect was bent to restore it.
3. **`tools/checkfacts.mjs` enforces string identity only.** It does a
   set-difference in both directions between the `FACTS` array and
   `FACTS_VERIFIED.md` and exits 1 on any divergence. It does **not** check
   sourcing, truth or completeness. Findings 24 and 42 pass that guard cleanly
   while remaining wrong and incomplete respectively — so a green build is not
   evidence that a fact is right.

---

## STILL OPEN — read this first

Nine findings (six open, three partial) survive. Each is re-verified against the
current tree.

### 4 — RESOLVED 2026-09-04 — the two topologies are now genuinely different

`buildWingBitSystem` no longer calls `buildConcentricSystem`; they are
independent builders, and the split is **proved by a regression guard**
(`.qa-topology.mjs`) that builds each headlessly, walks the node tree and swings
the moving nodes through their travel:

| claim | measured |
|---|---|
| concentric: ring bit on the shoe | ring top −0.3704 m vs shoe bottom −0.3720 m |
| concentric: **no hinge, nothing retracts** | **0 dynamic nodes**, no `wing-pivot`, `hinges: 0` |
| concentric: pilot comes home | pilot 119.2 mm < bore 124 mm |
| concentric: ring left in the ground | ring cut 157.4 mm > casing OD 139.7 mm |
| wing: wings actually rotate | 114.2 → 129.4 → 141.9 → 147.5 → 149.5 mm, monotone |
| wing: **not a lost bit** | folded 114.2 mm ≤ bore 124 mm, so it comes back up |

Three further defects were found and fixed in the same family — none of them in
the original finding:

- **`buildEccentricSystem`'s numbers were decorative and its defining claim
  failed.** It quoted a 121 mm ream while the arm it built swept **179.1 mm on
  a 114.3 mm casing** (57 % over-gauge) and closed to **169.4 mm — nearly twice
  the bore it must retract through. The Odex system could not have come out of
  its own hole.** Rebuilt from the casing bore: reams 125.3 mm, retracts to
  96.5 mm through a 100.0 mm bore, all read off the mesh.
- **`buildRingBitSystem` had a thousandfold unit slip** — a 139.7 mm system
  quoted as cutting **0.146 mm**. Now 153 mm, measured.
- **`buildCasingCrown` quoted the crown body's shoulder**, ignoring the gauge
  buttons that actually touch the wall: 147 → 156 mm.

*Still open in another file:* `data.js:1716` — the `ecc-140-hd` copy reads "HD
eccentric with a hardened **wing pivot**", conflating the eccentric and wing-bit
families, which is the exact confusion `PLATFORM_TRUTH.md` Part C §2 forbids.

### 4 (as first recorded) — WRONG — a wing-bit system is still a concentric system with a new label

`src/rig/tools.js`: `buildWingBitSystem()` is still
`const g = buildConcentricSystem(THREE_, ctx, o);` with only `spec.id`,
`family`, `name` and `price` relabelled, and `buildConcentricSystem` still
builds **hinged reamer wings** (a `wing-pivot` loop) rather than a pilot bit and
a ring bit on the same centreline. So the game models a wing system and calls it
concentric.

The prose is right and the geometry contradicts it: `FACTS_VERIFIED.md` and the
`conc-114` item copy both correctly say a concentric system uses a ring bit on
the casing shoe, left in the ground with the casing. Two distinct topologies are
needed — concentric = pilot + ring bit on the shoe (no hinge, nothing to
retract); wing-bit = folding wings that retract and are recovered.
*Source: `PLATFORM_TRUTH.md` Part C §2; `DOMAIN.md` §3 B, which files Concentric
Systems and Wing-Bit Systems as separate subcategories.*

### 7 — PARTIAL — the invented drill-bit roundel is gone from 3D, not from the UI

**Fixed:** `core/assets.js` no longer has a `logo` decal. The case that drew
*"a drill crown seen head-on: hex body, six carbide buttons, amber ring"* is
deleted and replaced by a comment stating there is deliberately no such decal.

**Still open:** `src/ui/components.js` still exports `BitMark()` — the six-button
amber roundel — still commented *"The Drillity bit mark — a DTH bit face seen
head-on."* Nothing in `src/` calls it, so it is latent rather than shipping, but
it is a live export any screen could pick up and it is exactly what `DOMAIN.md`
§10 forbids by name. **Delete it.**

### 8 — PARTIAL — the wordmark is no longer forged, but the machinery to forge it remains

**Fixed:** nothing passes `DRILLITY` to `drawWordmark()` any more. The `'plate'`
decal now takes the rig's own invented marque (`params.maker` — Nordvik,
Steinbach, Bergholt …) with the comment *"a data plate names the manufacturer,
and Drillity is the marketplace."* The default wordmark text is now empty.

**Still open:** two things.
- `core/assets.js` `drawWordmark()` still carries the procedural re-lettering
  machinery — Oswald, falling back to a hand-built geometric alphabet *for the
  letters of DRILLITY*, falling back again to a squeezed system sans. That glyph
  table exists only to forge this one wordmark and should go with the last
  caller that wanted it. Setting a maker's marque needs no bespoke alphabet.
- The `'plate'` decal still **defaults** to `MODEL 'DR-140 CRAWLER'` and
  `SERIAL 'DRL-0041-EU'` — a model designation that appears in no `RIGS` row.

### 24 — WRONG — the Kelly-bar fact still conflates torque with crowd force

`ui/screens/catalog.js` `FACTS` and `FACTS_VERIFIED.md` both still carry
*"Kelly bars come as friction, interlocking or full-locking. Only the
full-locking type transmits full torque at full extension."*

Torque is transmitted by the Kelly bar's longitudinal ribs in **every** type.
What differs is the **crowd (pull-down) force**: a friction Kelly transmits
crowd only through friction between the telescoping sections; an interlocking
Kelly transmits it mechanically at any extension. The file's own item copy gets
this right — `"it only transmits crowd force as far as the friction between the
tubes allows"` and `"Interlocking bar: full crowd force at any extension"` — so
the boot fact still contradicts the shop.

Both files must change together, and **the markdown first** (`checkfacts.mjs`).

### 25 — WRONG — the safety-net contract still calls a borehole a trial pit

`src/game/economy.js`: `title: 'Call-out: shallow trial pits'` with
`methodId: 'auger'`, `holeDia: 150`, and *"Two shallow trial pits for the local
authority…"*.

A **trial pit is an excavation** — dug with a machine and logged by looking down
it or walking into it. It is the standard alternative to a borehole in a ground
investigation, and the two are never the same thing. A 150 mm auger hole is a
borehole. This is the game's guaranteed-recovery contract, so every broke player
sees it. Rename it ("shallow trial holes", "hand-auger boreholes", "window
sampling") or make it a genuine excavation.

*Now easier to fix well than when first raised: `site-investigation` exists, and
window sampling has a real item (`window-sampler-60`).*

### 30 — PARTIAL — the sim and the data still disagree on rod length

**Fixed:** cable-tool and top hammer. `sim/drilling.js` cable-tool is
`rodLength: 3.0` matching `data.js`, and critically it now carries
`hasDrillString: false, rodAddKind: 'bail'` with
`if (S.m.hasDrillString === false) { beginBailingRun(rodLen); return; }` — so
cable-tool gets a **bailing run** and never a rod add. Top hammer is 3.66 in
both.

**Still open, and the root cause is structural:** `sim/drilling.js` keeps its own
method tuning table and **never reads `data.js` `METHODS`** — `resolveMethod()`
returns an entry from that table, and the module imports nothing from `data.js`
for it. So the two drift freely. Current divergences:

| method | `data.js` | `sim/drilling.js` |
|---|---|---|
| `auger` | 1.5 | 3 |
| `hdd` | 4.6 | 3 |
| `rc` | 3.0 | 6 |
| `oil-rotary` | **27.0** | **28.5** |
| `site-investigation` | 1.0 | 1.5 |

`oil-rotary` is the one that matters most: `data.js` was corrected to 27.0 with
an explicit comment that 28.5 *"is longer than three joints can physically be"*
(API Range 2 is 8.23–9.14 m per joint), and the sim still runs the number the
comment refutes. `rodLength` drives the visible rod-add cadence and the trip
time estimate, so this is player-visible.

Separating tuning from data is defensible. Having the same named field mean two
different numbers in two files is not. Decide which file owns `rodLength` and
write it down.

### 32 — IMPRECISE — "crown" is still the generic word for every bit

Unchanged at all six sites: `sim/drilling.js`
`'bit-worn': 'CROWN WORN — CONSIDER A TRIP'`,
`'bit-critical': 'CROWN CRITICAL — CHANGE IT NOW'`,
`'Abrasive — watch the crown'`; `ui/screens/site.js` `'New crown fitted'`,
`'Tripped out, fresh crown, tripped back in'`, `hazard('Crown is finished', …)`;
`ui/screens/catalog.js` `sub: 'Crown is finished'`.

In the trade a crown is a **casing crown** or a **diamond core crown**. A button
bit, a DTH bit, a tricone and a PDC are **bits**. So the HUD tells a top-hammer
driller his crown is worn when he is running a T45 button bit.

The codebase already knows this and acted on it elsewhere — finding 31 is fixed,
and `data.js` now labels the bay "Cutting tool" with a comment saying calling all
of those a crown *"puts a percussion word on a rotary tool."* The hazard and log
copy never got the same treatment. Use "bit" generically; reserve "crown" for the
items that genuinely are one.

### 42 — UNSOURCED — the percussion-thread fact still omits the H family

`ui/screens/catalog.js` `FACTS` and `FACTS_VERIFIED.md` both still read
*"Percussion threads run R25 to R51 and T38 to T127. Thread families do not
mix…"*.

Not wrong, but incomplete in a way that matters: it omits the **H-family
(H55–H114)**, which `DOMAIN.md` §4 lists alongside R and T. And the omission is
not only in the copy — `rig/tools.js` still defines only `H90`, there is no
H-family item anywhere in the shop, and there is no shank-shaft-Ø data
(Ø56→H55, Ø65→H55/H64, Ø68→H64/H66, Ø95→H90/H92, Ø115→H112/H114). A
large-diameter driller finds his whole thread family missing.

*(`data.js` does now name "R25–R51, T38–T127, H55–H114" — but only in a source
comment, so nothing user-facing has changed.)*

### 45 — STYLE — the level-1 role has a fourth spelling

`src/ui/screens/menu.js`:
`const roleEl = C.h('div.pcard__role', { text: 'Drillers Helper' });`

The level-1 role is **"Helper"** in `data.js` `ROLES`. "Drillers Helper" is a
fourth spelling and it is missing its possessive apostrophe. Shown for one frame
before `refresh()` overwrites it, but it is in the DOM. Seed with `'Helper'`.

---

## RESOLVED — 37 findings, with the evidence

Each row was verified against the current tree. "By deletion" means the
offending code was removed rather than corrected — see note 1 above.

| # | What it was | What resolves it now |
|---|---|---|
| 1 | SPT split-spoon filed in the `bit` slot — an SPT is a test, not a bit | `data.js`: `id: 'spt-split-spoon'` now `slot: 'probe'`. A new `probe` bay exists: *"Driven samplers and pushed cones. A test, not a bit — nothing here cuts."* Description now states the 63.5 kg / 760 mm drive correctly |
| 2 | CPT piezocone filed as a bit, attached to `auger` and `sonic` | `cpt-cone-piezo` no longer exists. Replaced by `cpt-cone-15` and `cpt-piezocone`, both `slot: 'probe'`, both `methods: ['site-investigation']` |
| 3 | Preview "specificity" sort ranked by regex *length*, so ring bits, wing bits, casing crowns and concentric systems all rendered as a plain tube | `core/preview.js`: `const HINTS_BY_SPECIFICITY = CATEGORY_MODEL_HINTS;` — the length sort is gone, the table is explicitly ordered, the loop stops at the first hit, and `assertHintResolution()` self-checks the real resolutions |
| 5 | `/eccentric|odex|symmetrix/` routed Symmetrix to the *eccentric* model | `preview.js`: `[/eccentric|odex/i, 'eccentric-system'],   // NOT symmetrix — that is concentric` and `[/concentric|symmetrix|elemex/i, 'concentric-system'],` |
| 6 | `brandTexture()` badged every rig and 14 tools "DRILLITY" in re-lettered Oswald/Impact, in `#DFB552`, under the invented tagline "GROUND ENGINEERING SYSTEMS" | `rig/tools.js`: the plate is now a dark field and a single amber rule line, `#F59E0B` exact. No lettering, no tagline, no wrong amber. All four violations gone. *(The recommended `rig.maker` plate was not added — the plate is simply blank.)* |
| 9 | A tricone with an API REG pin offered to cable-tool, which has no rotation and no threaded connection | `data.js` `bit-tri-6-mill`: `methods: ['rotary-kelly', 'hdd']` |
| 10 | A three-wing rotary drag bit on cable-tool | `data.js` `bit-drag-150`: `methods: ['jet-grouting', 'auger', 'rotary-kelly']` |
| 11 | `rod-r32` claimed `auger` (an auger takes a hex drive) and `cable-tool` (which has no rods at all) | `data.js` `rod-r32`: `methods: ['top-hammer', 'anchor', 'overburden', 'rockbolt']` |
| 12 | A DTH surface rig listed as able to run top hammer, which needs a drifter | `data.js` `dth-crawler`: `methods: ['dth', 'overburden']`, with *"A DTH surface rig carries a ROTARY HEAD, not a hydraulic drifter"* |
| 13 | The only route to cable-tool was a 4.5 t hydraulic geotechnical crawler — physically impossible | A real machine was added: `cable-percussion`, *Kilmar CP-24 Shellhand*, `methods: ['cable-tool']`, `torque: 0, feedForce: 0`. `crawler-lite` no longer claims it |
| 14 | `if (targetDepth >= 1900) rigClass = 'HPHT'` — HPHT is pressure and temperature, not depth | `data.js`: `if (envelope.hpht) rigClass = 'HPHT'` where `hpht: shutInBar >= 690 \|\| bottomHoleC >= 150` (10,000 psi / 300 °F). Depth now only picks the advertised role |
| 15 | Drill pipe "per joint of Range 2, about 9.5 m" and a 28.5 m triple stand — both above the API maximum | `data.js`: `rodLength: 27.0` with the derivation in comment; the drill-pipe header now reads *"per JOINT of API Range 2 — 8.23–9.14 m"*. **See finding 30: the sim still carries 28.5** |
| 16 | An 8″ tricone given an API REG 3½ pin | `data.js` `bit-tri-8-tci`: `thread: 'API REG 4 1/2'` |
| 17 | "140 mm gives you room for a 125 mm liner and a gravel pack" — 7.5 mm of annulus per side | `data.js`: *"140 mm takes a 125 mm liner in rock, open-hole, without needing a booster. It leaves no room for a filter pack — that wants a far wider hole."* |
| 18 | "how you get 127 mm without an eight-inch hammer" — 127 mm is five inches | `data.js`: *"…how you get 127 mm without a five-inch hammer."* |
| 19 | `en791` modelled as a personal certificate with a course fee and a 60-month expiry — EN 791 is a *machine* standard, and withdrawn (superseded by EN 16228) | No `en791` anywhere in `src/`. Replaced by `rig-operator-licence` (*Drill Rig Operator Licence*), whose own copy says: *"The machine has its own conformity, and that is EN 16228; it belongs to the rig, not to you."* Both sub-claims addressed |
| 20 | A well-control ticket required to work an Andean copper mine | `data.js` `andes`: `requiredCerts: ['first-aid', 'confined-space']`, with *"Mine-site gates, not oil & gas ones. Well control belongs to a well."* `iadc-wellsharp` now unlocks `['oil-gas']` only |
| 21 | Fallback contract: bored piles drilled with a top hammer, 62 m against a 45 m method limit | By deletion — the whole fallback contract board is gone from `catalog.js` |
| 22 | Fallback contract: a platform conductor installed by a Kelly-bar bored-pile rig | By deletion — as above |
| 23 | Fallback contract: an auger asked to drill 12 m of gneiss | By deletion — as above |
| 26 | Every casing item marked RH while two user-visible strings said casing threads are left-hand — and the garage showed both at once | Every casing thread in `data.js` is now **LH** (`casing conical cone-ring LH`, `cylindrical welded-thread LH`, …), and `overburden.threadFamily` is `casing cone-ring LH / …`. `validateData()` now *refuses* a casing item that does not declare LH or RH: *"silence is not an answer"* |
| 27 | Fallback method table disagreed with `data.js` on ten of thirteen unlock levels | By deletion. `catalog.js` header: *"the tables are gone rather than synced, because syncing only restarts the drift"* |
| 28 | Fallback region table used ids, levels and countries that matched nothing in the world layer | By deletion |
| 29 | Fallback cert table disagreed on seven of eleven certificates and merged IWCF with IADC | By deletion. `catalog.js` now reads live data (`issuer: c.issuer \|\| ''`, `months: c.months ?? c.validityMonths ?? 24`), and `data.js` keeps the two schemes separate |
| 31 | `data.js` labelled the slot "Bit / Crown" while `catalog.js` argued it should not be | `data.js`: `{ id: 'bit', name: 'Cutting tool', … }`, with the argument now in `data.js` itself |
| 33 | HUET modelled as a sequel to BOSIET, and both demanded for the North Sea — BOSIET *contains* HUET | `data.js`: `huet.prereq: []`, description *"It is a module inside BOSIET, and it also stands alone…"*; `north-sea` `requiredCerts: ['bosiet', 'oguk-medical']` |
| 34 | IADC WellSharp described as "the North American well-control equivalent" | `data.js`: *"The other international well-control standard, accredited and delivered worldwide…"* |
| 35 | IPAF asserted as the awarding body for rig-mast working-at-height | By deletion of the fallback row. `data.js` keeps the hedged `issuer: 'IPAF / national scheme'` |
| 36 | Seven named real organisations asserted as issuing bodies, several wrongly | By deletion. The only `issuer:` in `catalog.js` is now a pass-through from `data.js`, which uses generic issuers except where the certificate *is* the scheme |
| 37 | The Arctic (declared land work, `waterDepth: 0`) gated on two offshore tickets | `data.js` `arctic`: `requiredCerts: ['first-aid', 'huet']`, with *"BOSIET is a FIXED-INSTALLATION survival course… neither is the certificate for a land camp in Greenland"* |
| 38 | "HDD Firestick 2.875 in" — a live trademark shipped as a `thread` value | `data.js`: `thread: 'HDD box/pin 2.875 in'`. `Firestick` and `Leffer` both return zero hits in `data.js` |
| 39 | The T51 102 mm bit described as the point "below this you use a drifter" — a T51 bit *is* drifter-driven | `data.js`: *"…Above this, the energy the string loses at every joint costs you more than a DTH hammer would."* |
| 40 | The quartzite fact had drifted from a bounded claim about the game's `GROUND` table into an unbounded claim about the real world | `catalog.js:62` is byte-identical to `FACTS_VERIFIED.md:51` again: *"…the most abrasive ground **in the game**… anything else **you will meet**."* |
| 41 | `FACTS` and `FACTS_VERIFIED.md` had drifted apart on the OEM cross-reference line | The two are now byte-identical. **But the markdown was edited to match the code, not the reverse** — see note 2 at the top of this file |
| 43 | A stale balance comment on `oil-rotary` claiming `economy.js` had no materials row, beside a rate that was neither of the two numbers it named | `data.js`: comment rewritten to match the numbers it sits beside; `economy.js` `'oil-rotary': { perMetre: 190, … }`. No `INTEGRATOR NOTE` remains |
| 44 | The fallback skill tree was a different tree from `data.js` SKILLS — different ids, ranks and numeric promises | By deletion. Skills arrive only via `ctx.progression?.getSkillTree?.()` |
| 46 | `m3` for volumetric units throughout the shop; one curly apostrophe | `grep -c "m3/" src/game/data.js` → **0**; `m³` → 13 occurrences. Curly-apostrophe count → **0** |

---

## Findings, as first recorded

The table below is the **historical record of what was found**, kept intact so
that a resolution can be checked against the original claim. For current status,
use the two sections above.

| # | Severity | File:line | The string as it appears | What is wrong | The correct statement | Source |
|---|---|---|---|---|---|---|
| 1 | **WRONG** | `src/game/data.js:1433` | `it({ id: 'spt-split-spoon', name: 'SPT Split-Spoon Sampler, 51 mm', category: CAT.sptSamplers, slot: 'bit',` | **The known landmine has returned.** The SPT sampler is still filed in the `bit` slot, so it appears in the garage's *Cutting tool* bay and in the shop's bit lists as a thing that drills. An SPT is a **test**, not a bit: it is driven by a 63.5 kg hammer falling 760 mm, and nothing cuts. | The split spoon belongs in a sampling/testing slot (`workshop` or a new `sampler` slot), never in `bit`. The correct in-game statement is: "An SPT is a test, not a bit. A 63.5 kg hammer falls 760 mm and you count blows for the last 300 mm. Nothing cuts." | `research/06-geotech-water-geothermal.md` §5 header and line 2439 `[D1586]`; `DESIGN_EXPANSION.md` §4/§5; audit brief |
| 2 | **WRONG** | `src/game/data.js:1438` | `it({ id: 'cpt-cone-piezo', name: 'Piezocone CPTu Assembly', category: CAT.cpt, slot: 'bit',` … `methods: ['sonic', 'auger']` | Same landmine. A CPT cone is **pushed at a constant 20 mm/s, never rotated**; it makes no hole, no cuttings and no sample. Filing it in the `bit` slot and attaching it to the `auger` and `sonic` *drilling* methods states that it drills. | CPT is not drilling. Move it out of `bit`, and give it the `site-investigation` method that `METHOD_IDS.md` already reserves. Its own description ("No samples, no cuttings, just a continuous profile") already contradicts the slot it sits in. | `research/06` §291, §2125, §2202 (`[D5778]`, target 20 mm/s ±5 mm/s); `METHOD_IDS.md` |
| 3 | **WRONG** | `src/core/preview.js:30` + `:71` | `[/casing pipe\|casing/i, 'casing-pipe'],` sorted by `HINTS_BY_SPECIFICITY = [...].sort((a, b) => b[0].source.length - a[0].source.length)` | The "specificity" sort ranks by **regex source length**, not specificity. `casing pipe\|casing` is 18 characters, longer than `casing crown` (12), `ring[- ]bit` (11), `wing[- ]bit` (11) and `concentric` (10) — so the generic pattern wins them all. Verified by running the resolver: **Casing Crown, Ring-Bit System, Wing-Bit System and Concentric Overburden System all resolve to `casing-pipe`** and render in the shop as a featureless tube. The whole ring-bit / wing-bit family — the exact family this project has already had to correct twice — is invisible to the player. | Match on the most specific pattern, not the longest one: order the table explicitly and stop at the first hit, or score by the number of matched literal tokens. A ring bit must render as a ring bit and a wing bit as a wing bit. | Reproduced with the file's own table and `modelIdFor()` logic |
| 4 | **WRONG** | `src/rig/tools.js:2490` (`buildConcentricSystem`), `:2564` (`buildWingBitSystem`) | `/** Concentric overburden system — pilot bit with hinged reamer wings that open on rotation and fold in for retrieval. */` … and `buildWingBitSystem` is literally `buildConcentricSystem` with the label changed | **Conflates concentric with wing-bit.** A concentric system is a pilot bit and a **ring bit on the same centreline**, the ring bit driven through lugs and left in the ground with the casing. It has no hinged wings and never has to be rotated to retract. The one builder serves both families, so the game models a wing system and calls it concentric. | Two distinct geometries: concentric = pilot + ring bit on the casing shoe (the `buildRingBitSystem` topology, not a hinge); wing-bit = folding wings that retract and are recovered. The game's own `FACTS` line and `conc-114`'s description already state this correctly — the 3D model contradicts them. | `PLATFORM_TRUTH.md` Part C §2; `FACTS_VERIFIED.md` "Concentric systems use a ring bit on the casing shoe"; `DOMAIN.md` §3 B (Concentric Systems and Wing-Bit Systems are separate subcategories) |
| 5 | **WRONG** | `src/core/preview.js:26` | `[/eccentric\|odex\|symmetrix/i, 'eccentric-system'],` | **Symmetrix is CONCENTRIC.** This regex routes anything labelled Symmetrix to the *eccentric* model. It is not dead code: `catalog.js:288` carries `SUB_LABEL_FIXES = [[/^eccentric systems\b.*symmetrix/i, ...]]`, i.e. the codebase explicitly expects merged "Eccentric Systems (Odex/Symmetrix)" labels to arrive from live data — and when one does, it renders as an eccentric reamer. | Drop `symmetrix` from the eccentric pattern and add it to the concentric one. Odex is eccentric; Symmetrix is concentric; the taxonomy files them together for merchandising only. | `PLATFORM_TRUTH.md` Part C §2; `FACTS_VERIFIED.md` "Removed" table, row 2 |
| 6 | **WRONG** | `src/rig/tools.js:145–164` (`brandTexture`), applied at `src/rig/rigFactory.js:669` and `tools.js:3860, 3909, 3964, 4725, 4813, 5047, 5231` | `g.fillStyle = '#DFB552';` … `g.font = 'bold 62px Oswald, Impact, system-ui, sans-serif';` `g.fillText('DRILLITY', 22, 52);` … `g.fillText('GROUND ENGINEERING SYSTEMS', 24, 114);` — comment: `/** The Drillity plate riveted to every machine. */` | Four separate violations on one 512×128 texture that is painted onto **every rig and eight pieces of plant**: (a) it badges the machines as Drillity products — Drillity is the **marketplace**, not an OEM, and the fleet carries invented marques (Nordvik, Steinbach, Brenner, Meridian, Torvald, Lindhorst, Havstein, Halvard, Corvara, Vantera); (b) the wordmark is **re-lettered** in Oswald falling back to Impact; (c) it is **recoloured** `#DFB552`, not `#F59E0B`; (d) it invents the tagline **"GROUND ENGINEERING SYSTEMS"** where the real lockup says "REPRESENTING PROFESSIONALS". | Machines carry their own marque's plate (`rig.maker`), not Drillity's. Where the Drillity mark genuinely belongs (a site board, a UI header) it must be the bundled artwork — `terrain.js` already does this correctly. | `DOMAIN.md` §6, §10; `PLATFORM_TRUTH.md` Part C §4; audit brief |
| 7 | **WRONG** | `src/core/assets.js:2758` (decal kind `'logo'`); `src/ui/components.js:247` (`BitMark`) | `// A drill crown seen head-on: hex body, six carbide buttons, amber ring` / `/** The Drillity bit mark — a DTH bit face seen head-on. */` | Both are **invented drill-bit roundels presented as Drillity marks** — the single thing `DOMAIN.md` §10 names as forbidden ("do not invent a drill-bit roundel"). Neither is currently referenced by a caller, so this is latent rather than shipping, but both are live exported code paths any screen could pick up. | Delete them. The Drillity mark is a wordmark; the bundled artwork at `src/ui/assets/logo-*.png` is the only permitted mark. | `DOMAIN.md` §10 |
| 8 | **WRONG** | `src/core/assets.js:1116` (`drawWordmark`), used at `:2149`, `:2165`, `:2177`, `:2470`, `:2532` | `/** Draw condensed industrial caps. Prefers Oswald; falls back to a hand-built geometric alphabet for the letters of DRILLITY; falls back again to a horizontally squeezed system sans */` | The wordmark is **re-lettered procedurally** — in Oswald, or in a hand-built substitute alphabet, or in a squeezed system sans. `DOMAIN.md` §10: "do not re-letter the wordmark in a different typeface." The `'plate'` decal (`:2532`) additionally stamps `DRILLITY` on a machine data plate beside `MODEL 'DR-140 CRAWLER'` / `SERIAL 'DRL-0041-EU'` — an OEM badge and a model designation that exists in no `RIGS` row. | Composite the bundled `logo-wordmark.png` into the texture, or omit the mark. Machine plates carry the machine's own marque and its real `RIGS` name. | `DOMAIN.md` §10; `PLATFORM_TRUTH.md` Part C §4 |
| 9 | **WRONG** | `src/game/data.js:757–758` | `it({ id: 'bit-tri-6-mill', name: '6 in Tricone Bit, Milled Tooth (Soft)', … methods: ['rotary-kelly', 'hdd', 'cable-tool'], thread: 'API REG 3 1/2',` | A **tricone with an API REG pin cannot run on a cable-tool rig**. Cable-tool is a spudder: a wire rope, a chisel and a bailer. There is no rotation, no drill string and no threaded connection to make it up to. | Remove `cable-tool` from the item. A cable-tool string is rope socket → jars → drill stem → chisel bit; the game already models this correctly with `ct-chisel-bit` and `ct-bailer-200`. | `DOMAIN.md` §1 (`cable-tool`: "Old-school percussion"); audit brief; `economy.js:325` ("Bailed wet: you are lifting the water out with the cuttings, not circulating") |
| 10 | **WRONG** | `src/game/data.js:832–833` | `it({ id: 'bit-drag-150', name: '150 mm Drag Bit, Three-Wing', … methods: ['jet-grouting', 'auger', 'cable-tool', 'rotary-kelly'], thread: 'API REG 2 3/8',` | Same error: a three-wing **rotary** drag bit on a cable-tool rig. Confirmed by `sim/drilling.js:708`, which lists `bitKinds: ['chisel', 'drag']` for cable-tool. | Cable-tool takes a chisel bit only. | as above |
| 11 | **WRONG** | `src/game/data.js:847–848` | `it({ id: 'rod-r32', name: 'R32 Drill Rod, 3.05 m', … methods: ['top-hammer', 'anchor', 'overburden', 'auger', 'cable-tool'],` | Two errors in one line. (a) `auger` — **an auger does not take a percussion thread.** An auger flight is driven through a hex/quick-pin drive (`SW hex 65/80/100 mm`, which the game's own auger items correctly carry). (b) `cable-tool` — **cable-tool has no drill rods at all.** This is the game's starting rod, so both wrong pairings are visible from level 1. | Remove `auger` and `cable-tool`. R32 is a top-hammer / anchor / overburden rod. | `DOMAIN.md` §4 (percussion threads are segment-scoped); audit brief |
| 12 | **WRONG** | `src/game/data.js:552–556` | `id: 'dth-crawler', name: 'Brenner DH-750 Ironvein'`, `family: CAT.rigDTH` (*DTH Surface Rigs*), `methods: ['dth', 'overburden', 'top-hammer']` | **A DTH surface rig has a rotary head, not a drifter, so it cannot run top hammer.** This is the exact method↔machine pairing the brief names. The rig's own description ("high-pressure onboard compressor, 6 m rod magazine") describes a rotary-head DTH machine. | Drop `top-hammer` from `dth-crawler`. Top hammer belongs to `crawler-th` (Top Hammer / Surface Drill Rigs) and to `crawler-lite` with a drifter fitted. | audit brief; `DOMAIN.md` §3 A (Top Hammer/Surface and DTH Surface are separate rig families) |
| 13 | **WRONG** | `src/game/data.js:531–536` | `id: 'crawler-lite', name: 'Nordvik NV-90 Scout'`, `family: CAT.rigGeotech`, `methods: ['auger', 'cable-tool', 'top-hammer', 'overburden', 'anchor']` | A 4.5 t hydraulic tracked geotechnical drill is **not** a cable percussion rig, and it is the *only* machine in the fleet that can run `cable-tool`. Cable percussion (UK "shell and auger") is a folding tripod/derrick with a winch, a clutch and a wire rope — a different machine class entirely. So the game's only route to cable-tool is physically impossible. | Either add a cable-percussion rig to `RIGS` (the taxonomy has the family, and `CAT.cableToolTools` already exists), or remove `cable-tool` from the fleet until one exists. | `DOMAIN.md` §1; `research/06` §D.3 ("cable percussion 2" crew — a distinct machine and crew) |
| 14 | **WRONG** | `src/game/data.js:2675` | `if (targetDepth >= 1900) rigClass = 'HPHT';` | **HPHT is defined by pressure and temperature, not by depth.** The industry threshold is roughly >10,000 psi (≈690 bar) shut-in pressure and/or >300 °F (≈150 °C) bottom-hole temperature, and real HPHT wells are typically far deeper than 1,900 m. The game currently advertises every well below 1,900 m as HPHT — including North Sea wells, where the line even overrides the correct "High-spec / harsh environment" class. A well-control-ticketed driller will read this on the contract board. | Rig class follows the *well* and the *environment*, not a depth threshold: HPHT only where the contract declares an HPHT pressure/temperature envelope. Otherwise Standard or High-spec / harsh environment. | `PLATFORM_TRUTH.md` Part B (Rig class: Standard · High-spec/harsh · Ultra-deepwater · HPHT); textbook well engineering |
| 15 | **WRONG** | `src/game/data.js:1605` and `:434` | `/* -- Drill pipe. Prices are per joint of Range 2, about 9.5 m. -------- */` and `rodLength: 28.5` with `// a three-joint STAND of Range 2 drill pipe (3 x 9.5 m)` | **API Range 2 is 8.23–9.14 m**, so 9.5 m is above the maximum and 28.5 m is above the maximum possible triple stand (3 × 9.14 = 27.4 m). The project's own research pack states the figure explicitly. | Range 2 is 27–30 ft = 8.23–9.14 m per joint; a triple stand is ~27 m, not 28.5 m. | `research/01-oil-gas.md:1521` — "Drill pipe **Range 2 is 8.23–9.14 m** per [joint]" |
| 16 | **WRONG** | `src/game/data.js:763` | `it({ id: 'bit-tri-8-tci', name: '8 in Tricone Bit, TCI Medium', … thread: 'API REG 3 1/2',` | Wrong API pin for the bit size. API connection sizes are set by bit diameter: 3½ REG covers roughly 6″–7⅜″; 4½ REG covers 7⅜″–9⅜″. An 8″ tricone therefore takes **4½ REG**. The file's own oil & gas block gets this right eight lines-of-code later (`bit-oil-tri-8-tci` → `API REG 4 1/2`), so the two blocks contradict each other. | `8 in Tricone Bit, TCI Medium — API REG 4 1/2`. | `DOMAIN.md` §4 (API REG sizing); internal contradiction with `data.js:1573` |
| 17 | **WRONG** | `src/game/data.js:744` | `description: 'Water-well standard: 140 mm gives you room for a 125 mm liner and a gravel pack without needing a booster.'` | A 140 mm hole around a 125 mm liner leaves **7.5 mm of annulus per side**. You cannot place a gravel pack in that — a filter pack needs at least ~25 mm per side, and in practice 50 mm. A water-well driller will catch this instantly. | Either "140 mm takes a 125 mm liner in rock, open-hole, without a booster" (no pack), or state the real pack geometry — a 125 mm screen wants a 200 mm+ hole. | Textbook water-well completion practice; `research/06` (water well design section) |
| 18 | **WRONG** | `src/game/data.js:829` | `description: 'Opens a pilot hole to full casing diameter behind the bit. Slow, but it is how you get 127 mm without an eight-inch hammer.'` | Wrong hammer size. 127 mm is **5 inches**. An eight-inch hammer drills 203 mm — twice the hole this item makes. | "…how you get 127 mm without a five-inch hammer." (The file's own `bit-dth-5-std` is the 140 mm / 5-inch bit.) | Arithmetic; `data.js:741` (`5 in QL50 140 mm DTH Bit`), `data.js:751` (`8 in QL80 203 mm`) |
| 19 | **WRONG** | `src/game/data.js:2030` | `{ id: 'en791', name: 'EN 791 Drill Rig Safety', issuer: 'Notified body', price: 640, trainingHours: 24, validityMonths: 60, … description: 'The European drill-rig safety standard: guarding, rod handling, emergency stops. No German site lets a rig through the gate without it.' }` | Two errors. (a) **EN 791 is a machinery safety standard for the equipment**, not a personal certificate: a rig conforms to it, a person does not "hold" it. Modelling it with a course fee, training hours and a 60-month personal expiry, and gating a *player* on it, is a category error a German site engineer would flag on sight. (b) **EN 791 was withdrawn and superseded by EN 16228** (*Drilling and foundation equipment — Safety*) in 2014, so it is presented as current when it is twelve years obsolete. | If a machine-conformity gate is wanted, state it as a property of the rig and cite **EN 16228**. If an operator ticket is wanted, use the actual operator qualification (a national scheme such as the German Baumaschinenführerschein / DGUV, or NVQ/CPCS in the UK). | `DOMAIN.md` §7 lists "EN 791 rig safety" but as a standard, not a personal ticket; EN 16228-1:2014 supersession |
| 20 | **WRONG** | `src/game/data.js:1978` | `requiredCerts: ['first-aid', 'confined-space', 'iadc-wellsharp'],` (region `andes`, *Andean Copper Mine*) | **A well-control certificate is not required to work at a copper mine.** IADC WellSharp is a drilling well-control ticket for oil & gas. The same error appears at `catalog.js:798` (`c-raise-1`, a ventilation raise in a copper mine, `certs: [… 'iwcf']`) and in `CERTS` itself, where `iadc-wellsharp` carries `unlocksApplications: ['oil-gas', 'mining']`. | Mining and raise-boring gates are the mine-site ones: confined space, first aid, underground induction, shot-firing where blasting is involved. Well control belongs to `oil-gas` and `offshore-marine` only. | `PLATFORM_TRUTH.md` Part B (certifications are sector-native); `DOMAIN.md` §7 |
| 21 | **WRONG** | `src/ui/screens/catalog.js:735–740` | `id: 'c-german-found-1'`, `title: 'Bored pile row, tram depot'`, `application: 'Foundation / piling'`, `method: 'top-hammer'`, `target: 62` | Two impossibilities in one contract. (a) **Bored piles are not drilled with a top hammer** — top hammer makes 38–127 mm holes; a bored pile is 600–1500 mm. The application demands a Kelly/CFA rig. (b) **62 m exceeds the method's own depth range**, `depthRange: [3, 45]` in `data.js:357`. | A bored pile row is `rotary-kelly` or `cfa`. If a top-hammer job is wanted on a German site, it is anchors, soil nails or a jet-grout pre-drill. | `data.js:353–357` (`top-hammer` holeDiaRange `[38, 127]`, depthRange `[3, 45]`); `DOMAIN.md` §1 |
| 22 | **WRONG** | `src/ui/screens/catalog.js:770–775` | `id: 'c-northsea-1'`, `title: 'Conductor section, platform Bravo'`, `method: 'rotary-kelly'`, `target: 120` | A **platform conductor is not installed by a Kelly-bar bored-pile rig** — that is a land foundation machine; offshore conductors are driven or drilled by the platform's own drilling package. And 120 m again exceeds `rotary-kelly`'s `depthRange: [5, 90]`. `data.js` also does not let this contract exist (`north-sea` offers only `oil-gas`, `offshore-marine`, `site-investigation`; `rotary-kelly` serves none of them), so the fallback board advertises a job the live board correctly refuses to. | Conductor pre-drill offshore is `oil-rotary`, or a dedicated conductor-driving spread. | `data.js:396–399`; `data.js:1955–1958` (north-sea applications) |
| 23 | **WRONG** | `src/ui/screens/catalog.js:721–726` | `id: 'c-nordic-geo-1'`, `method: 'auger'`, `target: 28`, `profile: [… { g: 'till', to: 16 }, { g: 'gneiss', to: 34 }]` | The contract asks an **auger to drill 12 m of gneiss** (UCS 180 MPa). An auger is soft-ground only; `data.js` correctly excludes every crystalline rock from `auger.validGround`. The brief even says "bedrock under it" — and then sets the target below it. | Either stop the target at rockhead (~16 m) or change the method. This is a geothermal collector job: the honest version is auger to rock, then DTH or top hammer through the gneiss. | `data.js:330` (`auger.validGround` — no gneiss); `DOMAIN.md` §1 ("soft ground only") |
| 24 | **WRONG** | `src/ui/screens/catalog.js:40` (`FACTS`) and `FACTS_VERIFIED.md:48` | `'Kelly bars come as friction, interlocking or full-locking. Only the full-locking type transmits full torque at full extension.'` | **Conflates torque with crowd force.** Torque is transmitted by the Kelly bar's longitudinal ribs/keys in *every* type — friction and interlocking alike. What differs is the **crowd (pull-down) force**: a friction Kelly transmits crowd only through friction between the telescoping sections; an interlocking Kelly transmits it through mechanical interlocks at any extension. The file's own item copy gets it right (`data.js:1129` "it only transmits crowd force as far as the friction between the tubes allows"; `:1134` "Interlocking bar: full crowd force at any extension"), so the boot fact contradicts the shop. | "Kelly bars come as friction or interlocking. Only the interlocking type puts full **crowd force** on the tool at full extension — the friction type is limited by the grip between the tubes." | `DOMAIN.md` §4 ("Kelly type friction / interlocking / full-locking"); internal contradiction with `data.js:1129, 1134` |
| 25 | **WRONG** | `src/game/economy.js:920` and `:938` | `title: 'Call-out: shallow trial pits'` … `methodId: 'auger'`, `holeDia: 150` … `description: 'Two shallow trial pits for the local authority…'` | A **trial pit is an excavation**, dug with a machine and logged by walking into or looking down it — it is the standard alternative to a borehole in a ground investigation, and the two are never the same thing. A 150 mm auger hole is a borehole, not a trial pit. This is the game's safety-net contract, so every broke player sees it. | "Call-out: shallow trial holes" / "hand-auger boreholes" / "window sampling", or keep the title and change the method to a genuine excavation. | `research/06` (site-investigation methods: trial pits vs boreholes); standard geotechnical practice |
| 26 | **INCONSISTENT** | `src/game/data.js:1002, 1006, 1015, 1019, 1042, 1049, 1063, 1067` vs `src/ui/screens/catalog.js:39` and `src/ui/screens/garage.js:467` | Item threads: `thread: 'conical cone-ring RH'`, `'cylindrical welded-thread RH'`, `'Leffer joint RH'`, `'casing conical RH'`, `'cone-ring RH'` — against the boot fact `'Casing threads are usually left hand, so advancing the casing cannot unscrew the joints.'` and the garage panel `'Casing joints are cut left-hand, so advancing the casing cannot unscrew them.'` | **Every casing item in the game is marked RH, and two user-visible strings say casing threads are left-hand.** The garage contradiction is on screen simultaneously: the *Bit connection* row reads "conical cone-ring **RH**" and the note directly beneath it says the joint is cut **left-hand**. One of the two is wrong and a driller sees both at once. | Pick one and make it hold. `DOMAIN.md` §4 lists casing profiles as `RH/LH`, and the reason LH is usual is that the drill string turns right-hand inside the casing, so a RH casing joint tends to back off. If the LH claim stays in `FACTS`, the item threads must read `LH`. | `DOMAIN.md` §4; `FACTS_VERIFIED.md:47`; audit brief |
| 27 | **INCONSISTENT** | `src/ui/screens/catalog.js:69–83` vs `src/game/data.js:METHODS` | `{ id: 'dth', … level: 11 }`, `{ id: 'overburden', … level: 16 }`, `{ id: 'core', … level: 21 }`, `{ id: 'rotary-kelly', … level: 26 }`, `{ id: 'cfa', … level: 30 }`, `{ id: 'anchor', … level: 35 }`, `{ id: 'hdd', … level: 40 }`, `{ id: 'sonic', … level: 45 }`, `{ id: 'jet-grouting', … level: 50 }`, `{ id: 'raise-boring', … level: 56 }` | Every one of these disagrees with `data.js` (10, 14, 18, 23, 27, 31, 38, 42, 47, 52). The fallback table also omits `cased-cfa` and `oil-rotary` entirely, so it advertises 13 methods where the game has 15. The header comment claims the tables "mirror game/data.js … so the fallback and the live table never disagree." | Regenerate the fallback from `data.js`, or delete it. A player who sees the fallback is told the wrong unlock level for ten of thirteen methods. | `data.js` METHODS; `catalog.js:183–186` header comment |
| 28 | **INCONSISTENT** | `src/ui/screens/catalog.js:87–96` vs `src/game/data.js:REGIONS` | `{ id: 'german' … level: 5 }`, `{ id: 'alpine' … level: 12 }`, `{ id: 'iberian' … level: 18 }`, `{ id: 'northsea' … level: 26 }`, `{ id: 'sahara', name: 'Sahara Water Well', country: 'Algeria', level: 33 }`, `{ id: 'chile', name: 'Chilean Copper Mine' … level: 42 }`, `{ id: 'arctic' … level: 50 }` | The **ids differ** (`german`/`german-site`, `iberian`/`iberian-quarry`, `northsea`/`north-sea`, `chile`/`andes`), the **levels differ** (6, 18, 12, 30, 22, 36, 46 in `data.js`) — note Alpine and Iberian are swapped in order — and the **countries differ** (`Sweden` vs `Sweden / Finland`; `Algeria` vs `Algeria / Libya`). `world/geology.js` and `world/terrain.js` use the `data.js` ids, so the fallback ids match nothing in the world layer. | One region table. `data.js` is the authority; `geology.js` and `terrain.js` already follow it. | `data.js` REGIONS; `world/geology.js:196–350`; `world/terrain.js:167–254` |
| 29 | **INCONSISTENT** | `src/ui/screens/catalog.js:100–111` vs `src/game/data.js:CERTS` | `{ id: 'en791' … months: 24, cost: 640 }`, `{ id: 'confined' … months: 24, cost: 470 }`, `{ id: 'oguk' … cost: 380 }`, `{ id: 'bosiet' … cost: 1650 }`, `{ id: 'huet' … cost: 980 }`, `{ id: 'foet' … cost: 720 }`, `{ id: 'eng1' … cost: 260 }` | Costs and validities disagree with `data.js` on seven of eleven certificates (`data.js`: 640/60 mo, 720/36 mo, 260, 1180, 680, 540, 210). Certificate **expiry is the platform's headline mechanic** — "expired = cannot mobilise" — so two different validity periods for the same ticket is the worst place in the game to disagree. Ids also differ (`confined`/`confined-space`, `height`/`working-height`, `iwcf`/`iwcf-well-control`, `oguk`/`oguk-medical`), and `catalog.js` merges IWCF and IADC into one certificate (`'IWCF / IADC Well Control'`) that `data.js` correctly keeps as two. | One certificate table, from `data.js`. IWCF and IADC WellSharp are separate schemes from separate bodies and must not be merged. | `PLATFORM_TRUTH.md` Part B; `DOMAIN.md` §7 |
| 30 | **INCONSISTENT** | `src/sim/drilling.js:700, 711` (and the `auger`/`hdd` blocks) vs `src/game/data.js:334, 345, 356, 470` | sim `'cable-tool': { … rodLength: 6 … }`, `'top-hammer': { … rodLength: 3 … }`, `auger` `rodLength: 3`, `hdd` `rodLength: 3` — against data `cable-tool: 3.0`, `top-hammer: 3.66`, `auger: 1.5`, `hdd: 4.6` | The sim and the data disagree on rod length for four methods, and `rodLength` drives the visible rod-add cadence and the trip-time estimate. Worse, **cable-tool has a rod length at all**: with `rodLength: 6` the site screen will prompt "Stab Rod" every 6 m on a cable-tool hole, and cable-tool has no drill rods to stab. (`data.js:356` `3.66` is the correct T-rod length; `4.6` is the correct HDD rod.) | The sim reads `rodLength` from `data.js`. Cable-tool gets no rod-add event at all — its cadence is the bailing run, which `sim/drilling.js:704` already models correctly with `mustBail: true`. | `data.js` METHODS; audit brief ("Cable-tool has no drill rods") |
| 31 | **INCONSISTENT** | `src/game/data.js:193` vs `src/ui/screens/catalog.js:207, 222` | data `{ id: 'bit', name: 'Bit / Crown', … }` — catalog `{ id: 'bit', name: 'Cutting tool', … }` with `const SLOT_NAMES = { bit: 'Cutting tool' };` and the comment *"`bit` is deliberately NOT called 'Bit / crown': the same bay holds an auger flight, a drilling bucket and a casing crown, and calling all of those a crown is a percussion term over a rotary tool."* | `catalog.js` states the correct reasoning and then `data.js` still ships the label it argues against. Which one the player sees depends on whether `useGameData()` has run: `allSlots()` applies the override, but any consumer reading `data.js` `SLOTS` directly gets "Bit / Crown". | Rename the `data.js` slot to "Cutting tool" so the two agree and the override becomes unnecessary. | `catalog.js:201–205` (its own argument); `DOMAIN.md` §3 B (a crown is a casing crown or a core crown, not a button bit) |
| 32 | **IMPRECISE** | `src/sim/drilling.js:4022–4023`, `:3880`; `src/ui/screens/site.js:725, 726, 1360`; `src/ui/screens/catalog.js:527` (`SITE_ACTIONS.trip`) | `'bit-worn': 'CROWN WORN — CONSIDER A TRIP'`, `'bit-critical': 'CROWN CRITICAL — CHANGE IT NOW'`, `'Abrasive — watch the crown'`, `'New crown fitted'`, `'Tripped out, fresh crown, tripped back in'`, `hazard('Crown is finished', …)`, `sub: 'Crown is finished'` | **"Crown" is used generically for every bit in the game.** In the trade a crown is a *casing crown* or a *diamond core crown*; a button bit, a DTH bit, a tricone and a PDC are bits. So the HUD tells a top-hammer driller his crown is worn when he is running a T45 button bit. The codebase already knows this — see finding 31. | Use "bit" in the generic hazard and log copy, and reserve "crown" for the casing-crown and core-crown items that genuinely are one. | `DOMAIN.md` §3 B; `catalog.js:201–205` |
| 33 | **IMPRECISE** | `src/game/data.js:2054` | `{ id: 'huet', name: 'HUET', … prereq: ['bosiet'] }`, and `north-sea` `requiredCerts: ['bosiet', 'huet', 'oguk-medical']` | **BOSIET contains HUET** — the helicopter underwater escape trainer is a module of the BOSIET course, as `catalog.js:108` itself says ("Offshore survival, incl. HUET"). Making HUET a *sequel* to BOSIET, and then demanding both to work the North Sea, inverts the relationship. A standalone HUET exists, but it is an alternative to BOSIET for people who do not need the full course, not an add-on after it. | Either drop the standalone HUET, or make it a cheaper alternative path with no BOSIET prerequisite, and require only BOSIET (+ FOET refresher) + medical offshore. | `PLATFORM_TRUTH.md` Part B; OPITO course structure; internal contradiction with `catalog.js:108` |
| 34 | **IMPRECISE** | `src/game/data.js:2045` | `description: 'The North American well-control equivalent. Holding both is how a driller works either side of the Atlantic.'` | IADC WellSharp is an **international** programme from the International Association of Drilling Contractors, accredited and delivered worldwide; it is not "the North American" scheme. (IWCF is likewise international, not European.) The geographic framing is the common shorthand but it is not accurate, and the game states it as fact. | "The other international well-control standard. Many operators name one or the other in the contract, so a driller who holds both is never turned away at the gate." | IADC WellSharp programme scope |
| 35 | **IMPRECISE** | `src/ui/screens/catalog.js:105` | `{ id: 'height', name: 'Working at Height', issuer: 'IPAF', … note: 'Mast work and derrick access.' }` | **IPAF certifies MEWP (powered access platform) operators.** It is not the awarding body for general working-at-height, harness or rescue training, which is what mast work on a drill rig requires. `data.js:2034` hedges this correctly with `issuer: 'IPAF / national scheme'`; the fallback does not. | Issuer: a national working-at-height scheme (or "National training board", as the file uses elsewhere). Attributing rig-mast training to IPAF is a brand claim as well as a factual one. | `PLATFORM_TRUTH.md` Part C §4; IPAF scope |
| 36 | **IMPRECISE** | `src/ui/screens/catalog.js:101–111` | `issuer: 'Red Cross'`, `issuer: 'TÜV'`, `issuer: 'CITB'`, `issuer: 'City & G.'`, `issuer: 'IPAF'`, `issuer: 'MCA'`, `issuer: 'OGUK'` | Seven **named real organisations** are asserted as the issuing bodies of the game's certificates. Some are wrong (TÜV does not issue "EN 791" tickets; CITB does not award NVQs — awarding bodies do). All of them attribute activity to a named third party, which Part C rule 4 forbids. `data.js` handles this correctly with generic issuers ("National training board", "Notified body", "Competent authority") except where the certificate *is* the body's own scheme (OPITO, IWCF, IADC, MCA). | Follow the `data.js` pattern: generic issuer names, except where the certificate is inseparable from the scheme that owns it. | `PLATFORM_TRUTH.md` Part C §4; `data.js` CERTS |
| 37 | **IMPRECISE** | `src/game/data.js:1993–1997` (region `arctic`) | `requiredCerts: ['first-aid', 'bosiet', 'norwegian-offshore-medical']` for Greenland / Svalbard, `waterDepth: 0` | The region is declared **land work** and then gated on two **offshore** tickets. The in-file comment justifies it as "about getting there, not drilling", but BOSIET is a *fixed-installation* survival course and the Norwegian Offshore Medical is the NCS offshore fitness standard — neither is the certificate for a Greenland land camp. A remote-Arctic gate exists and is different: HUET/helicopter passenger training, polar bear watch/firearms, remote-medical. | Gate the Arctic on remote/cold-climate tickets, not on North Sea offshore ones — or state honestly in the region copy that the *transit* is by offshore helicopter. | `PLATFORM_TRUTH.md` Part B; `data.js:1993` (`waterDepth: 0`) |
| 38 | **IMPRECISE** | `src/game/data.js:1291` and the shop *Connection* spec row | `thread: 'HDD Firestick 2.875 in'` on `hdd-pipe-2875` | **"Firestick" is a live Vermeer trademark for a proprietary rod**, not an open connection standard like API IF or NC. `DOMAIN.md` §4 records it as vocabulary, but item `thread` values are rendered directly in the shop's *Connection* row and in the thread facet filter, so this ships a manufacturer's product name as game content. (Same class: `'Leffer joint RH'` at `:1063` and `'Eccentric Systems (Odex-type)'` at `:109`, though the latter is at least hedged with "-type".) | Use the generic designation the connection actually belongs to — for HDD pipe, "API IF 2 3/8" or "HDD box/pin 2.875 in". Keep the trademarks in `DOMAIN.md` as the vocabulary that informed the design, not as shipped strings. | `PLATFORM_TRUTH.md` Part C §4; `DOMAIN.md` §4 (records them as reference vocabulary) |
| 39 | **IMPRECISE** | `src/game/data.js:733` | `description: 'The biggest hole a top-hammer string should honestly be asked to make. Below this you use a drifter; above it, you go down-the-hole.'` (on the T51 102 mm bit) | Self-contradictory: **a T51 102 mm bit is itself drifter-driven.** Top hammer *is* the drifter; there is no top-hammer configuration "below" it that uses one and one that does not. The line also conflicts with the method's own `holeDiaRange: [38, 127]` and with `reamer-th-127`, a T51 tool that opens to 127 mm. | "The biggest hole a top-hammer string should honestly be asked to make. Above this, the energy the string loses at every joint costs you more than a DTH hammer would." | Internal contradiction with `data.js:354`, `data.js:826` |
| 40 | **UNSOURCED** | `src/ui/screens/catalog.js:42` vs `FACTS_VERIFIED.md:51` | shipped: `'Quartzite runs about 300 MPa and is the most abrasive ground you will meet. It ends carbide faster than anything else.'` — sourced: `'…the most abrasive ground **in the game**. It ends carbide faster than anything else **you will meet**.'` | The line **drifted from its sourced form** and the drift changed a bounded, checkable claim about the game's own `GROUND` table (`GRD`) into an unbounded claim about the real world. The sourced version is defensible; the shipped one is not. `catalog.js:21` states the rule this violates: "Do not add a line without adding it to FACTS_VERIFIED.md first." | Restore the `FACTS_VERIFIED.md` wording verbatim. | `FACTS_VERIFIED.md:51`; `catalog.js:17–21` |
| 41 | **UNSOURCED** | `src/ui/screens/catalog.js:58` vs `FACTS_VERIFIED.md:69` | shipped: `'One maker's part number can surface a compatible alternative from another.'` — sourced: `'One brand's part number can surface a compatible alternative from another maker.'` | Second unsourced drift from the same array. Harmless in meaning, but it proves the `FACTS` array and `FACTS_VERIFIED.md` are no longer kept in lockstep, which is the control that stops the two removed claims from coming back. | Restore the sourced wording, and add a check that fails when `FACTS` and `FACTS_VERIFIED.md` diverge. | `FACTS_VERIFIED.md:69` |
| 42 | **UNSOURCED** | `src/ui/screens/catalog.js:37` (`FACTS`) | `'Percussion threads run R25 to R51 and T38 to T127. Thread families do not mix — a rod and a shank from different families will not mate.'` | Not wrong, but **incomplete in a way that matters**: it omits the **H-family (H55–H114)**, which `DOMAIN.md` §4 lists alongside R and T, which `garage.js:9` names in its own docstring, and which the audit brief calls out. The game also has no H-family item and no shank-shaft-Ø data (Ø56→H55, Ø65→H55/H64, Ø68→H64/H66, Ø95→H90/H92, Ø115→H112/H114), so a large-diameter driller finds his whole thread family missing. `rig/tools.js:491` defines only `H90`. | "Percussion threads run R25–R51, T38–T127 and H55–H114. Families do not mix, and on a big hammer the shank shaft diameter is what decides which H thread you are on." | `DOMAIN.md` §4; audit brief |
| 43 | **UNSOURCED** | `src/game/data.js:428–433` (comment block) | `// Calibrated against a level-matched sweep … at 145 the derrick is the top earner … // INTEGRATOR NOTE: MATERIALS in game/economy.js has no oil-rotary row … Adding one at about 190 EUR/m means raising this back to roughly 195` — beside `basePayPerMetre: 420` | The comment is **stale in both directions**: `economy.js:414` now *does* carry `'oil-rotary': { perMetre: 190 }`, and the rate is 420, neither 145 nor 195. Not user-visible, but it is the balance rationale of the most expensive method in the game and it no longer describes the numbers it sits next to. | Re-derive and restate, or delete. Flagged because the brief asks for numbers that contradict each other between files. | `economy.js:414`; `data.js:434` |
| 44 | **UNSOURCED** | `src/ui/screens/catalog.js:161–180` vs `src/game/data.js:SKILLS` | `{ id: 'op-steady', name: 'Steady Hand', max: 3, cost: 1, effect: '+8% sweet-spot width per rank' }`, `{ id: 'op-groove', name: 'The Groove', effect: 'Max ROP multiplier 2.2 → 2.6' }`, `{ id: 'ts-carbide', effect: '−7% bit wear per rank' }` … | The fallback skill tree is a **different tree** from `data.js`: different ids, different names, different max ranks and **different stated numeric effects** (data: `op.steady-hand` maxRank 4 at +12 %/rank; `ts.carbide-care` +15 % bit life/rank). Every one of these is a numeric promise to the player, and half of them are unbacked by anything the sim reads. | Derive the fallback from `data.js` SKILLS, or delete it — `skillTree()` already normalises the live shape. | `data.js` SKILLS; `catalog.js:151–181` |
| 45 | **STYLE** | `src/ui/screens/menu.js:16` | `const roleEl = C.h('div.pcard__role', { text: 'Drillers Helper' });` | The level-1 role is **"Helper"** everywhere else (`data.js` ROLES, `catalog.js` ROLES). "Drillers Helper" is a fourth spelling, and it is missing its possessive apostrophe. Only shown for one frame before `refresh()` overwrites it, but it is in the DOM. | Seed with `'Helper'`. | `data.js:ROLES`; `catalog.js:120` |
| 46 | **STYLE** | `src/game/data.js:1336, 1345`, `:1287` etc.; `src/game/data.js:1085` | `'Portable Compressor, 7 m3/min at 7 bar'`, `'Mud Mixing & Recycling Unit, 40 m3/h'`, `'Needs 21 m3/min at the face'`; and `'The environmental driller’s single most useful piece of steel.'` | Volumetric units are written `m3` rather than `m³` throughout the shop, and one description carries a curly apostrophe where the rest of the file uses a straight one. Units are correct, only the typography is not. | `m³/min`, `m³/h`; normalise the apostrophe. | `PLATFORM_TRUTH.md` Part C §3 (unit-correct) — this is presentation, not a unit error |

---

## Checked and found correct — items previously suspect that are now safe

These were on the landmine list or looked exposed. They hold, and I would not
touch them:

1. **Ring bit vs wing bit, in every user-visible string.** `FACTS` lines 34–35
   ("Concentric systems use a ring bit on the casing shoe. The ring bit stays in
   the ground with the casing; the pilot bit comes home." / "A wing bit is not a
   lost bit — the wings fold in so it can be pulled back up through the casing
   and used again."), and the item copy for `ringbit-114`, `ringbit-273-hd`,
   `wingbit-140`, `wingbit-193-hd`, `conc-114`, `conc-168-hd`, `ecc-90` and
   `ecc-140-hd` are all engineering-correct and precisely worded. *The prose is
   safe. The preview routing is now fixed too (finding 3); only the 3D geometry
   still contradicts it (finding 4, STILL OPEN).*
2. **"Sacrificial / Lost Bits" is kept as its own subcategory** (`CAT.lostBits`),
   populated only with genuine SDA sacrificial heads, and never used as a synonym
   for ring or wing bits.
3. **Odex / Symmetrix.** No shipped string claims Symmetrix is eccentric. The
   subcategory is hedged to `Eccentric Systems (Odex-type)` and `catalog.js:283–291`
   carries an explicit `SUB_LABEL_FIXES` guard against merged taxonomy labels.
   *The preview regex, the one hole left, is now closed too (finding 5, RESOLVED).*
4. **SPT hammer parameters.** `spt-hammer-auto`: "63.5 kg falling 760 mm, released
   automatically so the energy ratio is repeatable" — exactly `[D1586]` / ISO 22476-3.
   The 51 mm split-spoon OD is right too.
5. **CPT instrumentation.** "Tip resistance, sleeve friction and pore pressure at
   2 cm intervals. No samples, no cuttings, just a continuous profile", on a 36 mm
   CPT rod — correct to `[D5778]` and EN ISO 22476-1.
6. **Percussion thread families do not interchange — and the game enforces it.**
   `garage.js:396–429` `stringVerdict()` returns a hard `bad` verdict with the copy
   "R-, T- and H-series percussion threads are separate families in separate sizes —
   they will not mate", and `systemOf()` correctly keeps percussion, DTH shank, API,
   wireline, hex drive, Kelly box and threadbar in separate systems so an auger's
   hex and a T45 rod read as *different interfaces*, not as a mismatch. This is the
   best-implemented accuracy control in the codebase.
7. **Oil-well connections are the rotary vocabulary, correctly sized.** Every entry
   in `ITEMS_OILGAS` checks out: NC38 = 3½ IF, NC50 = 4½ IF, NC46 = 4 IF, 5½ FH; and
   bit size → REG pin is right at 6″→3½, 8½″→4½, 12¼″→6⅝, 17½″→7⅝, with 4¾″ collars
   on NC38, 6¼″ on NC46 and 8″ on 6⅝ REG. No percussion thread anywhere near it.
   *(The only two API sizing errors are in the legacy non-oil block — finding 16.)*
8. **Wireline core sizing.** `core.holeDiaRange: [48, 123]` matches AQ 48.0 mm to
   PQ 122.6 mm exactly; `nominalDia: 96` is HQ; the BWL/NWL/HWL/PWL codes are right;
   and `THREAD_SPECS` rod ODs (BQ 55.6, NQ 69.9, HQ 88.9, PQ 114 mm) are the real
   figures.
9. **Cable-tool circulation.** `economy.js:325` — "Bailed wet: you are lifting the
   water out with the cuttings, not circulating" — and `drilling.js:704`
   `mustBail: true, // cuttings only leave by bailing`, with a 0.6–1.3 Hz stroke
   rate. The physics model was always right. The tool list is now right too
   (findings 9–11, RESOLVED), and cable-tool now gets a bailing run rather than a
   rod add — `hasDrillString: false, rodAddKind: 'bail'`, emitting
   `EVENTS.BAILER_RUN` (finding 30, the fixed half).
10. **An auger takes a hex drive, not a percussion thread.** `auger-flight-std`
    (`SW hex 65 mm`), `auger-flight-hd` (`SW hex 80 mm`) and `hsa-200`
    (`SW hex 100 mm`) are all correct. *(`rod-r32` no longer claims the auger —
    finding 11, RESOLVED.)*
11. **A Kelly bar is not called a rod in any user-visible label.** The slot is
    "Drill string" / "Drill String" with the hint "Rods, pipes and Kelly bars";
    `kelly-3x-friction` and `kelly-4x-interlock-hd` carry Kelly-box/U-Pin
    connections, never a thread. *(The preview no longer renders one as a
    drill rod — finding 3, RESOLVED.)*
12. **Oil-well hole sizes telescope the right way.** `OIL_HOLE_SIZES` 445 / 311 /
    216 / 152 mm are exactly 17½ / 12¼ / 8½ / 6 in, and the comment "the deeper the
    well, the SMALLER the hole it finishes in" is right — as is the `oil-rotary`
    `MATERIAL_DIA_EXPONENT: 0` that follows from it.
13. **The whole well-control HUD.** Mud weight, pore pressure and ECD all in **sg**;
    the pit totaliser as the first sign of an influx and of a thief zone; shut-in as
    a *button* not a fourth slider ("you space out, close the preventer and read the
    pressures"); the LCM pill spotted across a thief zone; "Underbalanced — the
    column is not holding the formation back". This reads like it was written by
    someone who has sat the ticket.
14. **Mud programme specific gravities.** Spud gel 1.06, KCl/polymer 1.20,
    barite-weighted 1.52, invert emulsion 1.34, generic WBM 1.15 — all in range, and
    the KCl-encapsulates-cuttings / barite-buys-kick-margin-costs-ROP trade-offs are
    correctly stated.
15. **BOP stack.** 345 bar is correctly identified as 5,000 psi; the annular "will
    close on pipe, on a tool joint, or on open hole"; "pipe rams above, blind shear
    rams below"; the accumulator "with the engines dead". All correct.
16. **Jet grouting.** 400 bar; single fluid gives the smallest column; triple fluid
    is an air-shrouded water jet cutting with grout placed behind it, giving roughly
    twice the diameter; and "the withdrawal rate is what decides the column
    diameter". Correct on all four.
17. **HDD economics and timing.** `pullbackHours = metres / 27` is derived from
    `research/07` §A5 (0.30–0.61 m/min → 18–37 m/h), and `reamPasses: 2.4` from §A4
    (0–3 passes plus a swab). The pullback swivel copy ("Skip it and you will pull a
    twisted gas main into the ground") is right, and 400 mm pipe backreamed to
    600 mm is the correct 1.5× rule.
18. **Method-specific site controls.** The ADVANCE/WORK/PROTECT resolution in
    `site.js:48–110` derives the labels from `flushMedium`, tool slots and the
    application facet rather than from a method-id table, and every family it
    produces is right: jet = withdrawal rate / jet pressure / rotation; CFA =
    penetration rate / rotation / concrete pressure; HDD = thrust / rotate-against-
    slide / mud; core = light WOB / high RPM / water; sonic = feed / oscillator
    frequency. The refusal to print "kN" beside a 0–100 slider is exactly right
    under Part C §3.
19. **The logo, where it is drawn from artwork.** `components.js:205` `Wordmark()`
    composites the bundled `logo-full.png` / `logo-wordmark.png`, and
    `terrain.js:891–938` composites the same artwork onto the site board with the
    comment "DOMAIN.md §10 forbids re-lettering the wordmark, so the site board
    carries the actual artwork rather than a font approximation." Brand amber is
    `#F59E0B` / `245 158 11` in `styles.css:18, 41`. *(The 3D texture paths
    were the problem. `brandTexture()` is fixed (finding 6) and the wordmark is
    no longer forged onto machine plates (finding 8), but `BitMark()` and the
    procedural re-lettering machinery both remain — findings 7 and 8, PARTIAL.)*
20. **The fleet marques.** Every `RIGS` row carries an invented marque — the
    original ten (Nordvik, Steinbach, Brenner, Meridian, Torvald, Lindhorst,
    Havstein, Halvard, Corvara, Vantera) and the eight added with the new methods
    (Kilmar, Kjelvik, Aurbach, Fennholm, Skarnes, Bergholt, Rynnval ×2) — **18
    rows**, and no real model designation appears as a rig name. *(No rig is
    badged "Drillity" in the data, and the badge is no longer painted on in the
    3D layer either — finding 6, RESOLVED.)*
21. **No Drillity internal business metrics anywhere in `src/`.** No listing counts,
    no registered-company counts, no subscription prices, no partner or seller names.
    The iMarket facts that do ship (one subcategory per product, condition as a
    facet, RFQ, zero commission, OEM cross-reference) are all public positioning
    from `PLATFORM_TRUTH.md` Part A.
22. **`GROUND` UCS values** are all inside accepted textbook ranges — clay 0.4,
    till 2, chalk 12, shale 40, sandstone 70, limestone 90, schist 110, gneiss 180,
    granite 210, basalt 250, quartzite 300 MPa — and the geology recipes in
    `world/geology.js` are stratigraphically plausible for every region (Scandinavian
    shield, Muschelkalk-style German sequence, Alpine metamorphics, Iberian karst
    with terra rossa, North Sea Chalk Group over Rotliegend, Continental
    Intercalaire, Andean porphyry, Arctic flood basalt).
23. **Certificate validity periods in `data.js`**: OGUK Medical, ENG1, IWCF and
    IADC WellSharp at 24 months; BOSIET, HUET and FOET at 48; and FOET correctly
    described as "the four-yearly refresher that keeps BOSIET alive without
    repeating the whole course". All correct.
24. **DTH air.** 12 m³/min at 12 bar as the honest minimum for a 3-inch hammer;
    "runs happily from 12 to 24 bar" for a 4-inch; 21 m³/min at the face for a 6-inch;
    and the booster framed as "below 200 m it is showing off". All in range.
25. **The `validateData()` guard** already refused any method whose materials scale
    with diameter faster than its pay, and enforced that region `rotation`,
    `rigType` and `rigClass` are values Drillity Talent actually models rather than
    free text. That check is why jet grouting, auger and DTH are no longer traps.
    **It has since grown into the strongest accuracy control in the codebase**,
    and several findings above are now structurally unrepeatable because of it.
    It additionally refuses: an item whose subcategory is *driven, pushed or
    installed* sitting in the cutting bay (which permanently closes findings 1
    and 2); a `rod` bay or a drill-string item on a method with
    `hasDrillString: false` — *"its tools hang on a wire rope"*; a percussion
    thread on a non-percussion method and a DTH shank where there is no hammer at
    the bit to couple to (findings 9–11); a casing item that does not say whether
    its joint is cut LH or RH — *"silence is not an answer"* (finding 26); a
    `sectionMode` that is not one of the five; a `primaryToolSlot` that is not
    one of the method's own `toolSlots`; a missing `scoredOn`; a rig↔method link
    that is asserted on only one side; a method with no rig or no shop stock for
    its primary bay; an application no method serves (the dead-application bug
    that motivated the whole oil & gas expansion); and an unsourced price with no
    `needs` note saying why.
    It was extended along the model of item 6 above — the garage's
    `stringVerdict()` — which remains the pattern to follow.

---

## Two structural notes — and what became of them

- **The `catalog.js` fallback tables were the single largest source of findings**
  (27, 28, 29, 31, 36, 40, 41, 44, plus contracts 21–23) — shipped strings in
  `src/` that disagreed with `data.js` on method levels, region ids, region
  levels, certificate costs, certificate validities, skill effects and slot
  names. The note recommended generating them from `data.js` at build time, or
  deleting them.
  **RESOLVED by deletion.** They are gone, and the file records the reasoning:
  *"the tables are gone rather than synced, because syncing only restarts the
  drift."* The screens now render an honest empty state. That single change
  closed nine findings.
- **`METHOD_IDS.md` reserved six methods** that `sim/drilling.js` had grown
  tuning for but `data.js` `METHODS` did not carry.
  **RESOLVED.** All six are in `METHODS`: `site-investigation` (L8), `rc` (21),
  `rockbolt` (29), `driven-pile` (33), `tunnel-jumbo` (36), `longhole` (39). As
  predicted, `site-investigation` landing is what closed findings 1 and 2 — it
  gave SPT and CPT somewhere correct to live, in the new `probe` bay.

## One structural note that replaces them

**The sim and the data are two tables with no link between them.**
`sim/drilling.js` keeps its own per-method tuning and never reads `data.js`
`METHODS`; `resolveMethod()` returns an entry from that private table. The
separation is defensible — tuning is not data — but every field that exists in
both files can drift silently, and `rodLength` already has (finding 30), in a
way that reaches the player through the rod-add cadence and the trip-time
estimate. `oil-rotary` is the sharp case: `data.js` was corrected to a 27 m
triple stand *with a comment explaining why 28.5 m is physically impossible*,
and the sim still runs 28.5.

Nothing in this audit should be fixed by copying a number from one file to the
other and leaving both authoritative. Decide which file owns each shared field
and record it — that is the control that stops finding 30 recurring under a
different field name.

## What this audit did not cover

- **`src/audio/audio.js`** (6,068 lines) and **`src/sim/vfx.js`** were not in
  the original scope and have not been swept.
- The **six new methods' own user-visible strings** — the RC bag captions, the
  jumbo round report, the pile driving log, the bolt install report — landed
  after the first sweep. They were spot-checked while re-verifying (the assay
  gating on `sourced` is correct and careful), but they have **not** had a
  line-by-line accuracy audit of the kind the 46 findings above came from.
  That is the largest untested surface in the game right now.

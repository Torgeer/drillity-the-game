# Raise boring machine — engineering reference (`raisebore`)

status: COMPLETE for the material available. Raise boring is the worst-sourced
machine in this library and §8 is long on purpose — see the warning at the head
of §3. Nothing marked NOT SOURCED may be invented.
Subject: game rig id `raisebore`. Builder: `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` (`buildRaisebore`, ~line 3145).
Purpose: GEOMETRY and MATERIALS reference for the modeller. **No real manufacturer name or model designation may become a product name in the game (DOMAIN.md §10).** Use the shapes, not the badge.

---

## 1. Sources read

| Source | Where | What it actually showed | Useful? |
|---|---|---|---|
| `research/03-mining.md` §A.5.1, §C.2.5, §D.5, §F.1.5 | lines 454–520, 1005–1015, 1192–1210, 1613–1650 | **The single richest local source.** Full raise-boring method (pilot down / ream up), reamer head diameters 0.6–6 m, cutter counts by diameter, head weights 2.7–38 t, stem Ø228–381 mm, 1.5 m hollow drill pipe, head types (integral / segmented / extendable), blind / down / horizontal boring variants, and an explicit machine description: "not a mobile machine — set up and **grouted down** onto a prepared concrete floor… a short, extremely stiff **derrick** over a large-diameter rotary drive with a thrust cylinder frame; 1.5 m drill pipes handled by a **pipe loader**; a hydraulic power pack and a **water pump** alongside." All cited to `[W-SANDVIK-RB]`. | **YES — primary** |
| `research/11-oem-anchor-geotech-hdd.md` | ~line 674–690, 924 | Historical: 1963 electro-hydraulic raise driller, pilot down then ream up — confirms the method lineage and that raise boring sits in the "heavy end" OEM family alongside shaft drilling and TBMs. No dimensions. | Partly (context only) |
| `research/16-site-archetypes.md` | line 101–103 | `raise-boring` is listed in the `german-site`, `iberian-quarry` and `alpine` archetypes. Tells the modeller which environments the machine has to sit in; no geometry. | Context only |
| `src/rig/rigFactory.js` `buildRaisebore` | ~3145–3300 | The game's current model — recorded in full in Appendix A below. | Comparison |
| `src/rig/tools.js` `raisebore-reamer` | see §9 | The reamer head builder. | Comparison |

| `https://www.herrenknecht.com/en/products/productdetail/raise-boring-rig-rbr/` | fetched 2026-09-05 | **The only manufacturer source successfully reached.** Gives a **reaming diameter range of 0.3–8 m** and shafts *"in rock down to 2,000 metres in depth"*; confirms the rig is *"installed above a starting point for the shaft using a transport system or a crane"*; and names the components — variable-frequency electric drives, planetary gears, pipe handler, guide columns, thrust cylinder, main drive, wrench unit, with *"mechanized rod handling and remote controlled wrench units"*. **Every numeric machine specification is absent** — no torque, thrust, weight, height, footprint or installed power. Its stated absences are as useful as its figures. | **Yes — second primary** |
| `C:\Users\henri\Downloads\Rotary_Drill_Bits_2025_A4_E-version.pdf` | 16 pp.; contents p.3, construction pp.8–9, size tables pp.10–15 indexed | **Checked on the suggestion that raise-bore roller cutters might share geometry with rotary cutters. They do not, and this file does not cover them.** It is a **tricone rotary bit** catalogue (7⅞″–13¾″) with per-model IADC code, row count and insert count, plus shirttail protection, hard-facing and jetted air nozzles. Genuinely valuable to `tools-bits-carbide.md`; **useless here**, and recorded as a negative result rather than stretched by analogy. | **No — negative result** |
| `en.wikipedia.org/wiki/Raise_boring`, `…/Raise_boring_machine`, `mining.sandvik/…/raiseboring-rigs/`, `epiroc.com/…/raiseboring-equipment` | attempted 2026-09-05 | **All four failed** — 404, 404, 404 (after a 301) and 403. **The session's WebSearch budget was already exhausted (200 of 200 calls), so URLs had to be guessed rather than found.** This is why §8 is long: the machine-level specifications are almost certainly on the open web and were simply unreachable from here. A rerun with search available is the single highest-value follow-up on this machine. | No (blocked) |
| `src/rig/tools.js` — `raisebore-reamer` (~l. 5010), `raisebore-pilot-bit` (~l. 5076), `drill-stem` (~l. 5088) | as cited | The current game tooling, compared in §9 — the cutter-count formula in particular. **Read only.** | Yes (as the subject) |

_(more sources appended below as read)_

## 2. What the machine IS

A **raise borer** is the odd one out in the whole fleet: **it does not drive anywhere.** It is a stationary machine that is trucked or caged in pieces into a small purpose-excavated chamber on an **upper** mine level, set on a **prepared concrete floor**, and **grouted and rock-bolted down** so it can react thousands of kilonewtons of pull against the rock itself (`03-mining.md` §C.2.5, `[W-SANDVIK-RB]`). It has no tracks, no wheels, no cab and no boom.

What it does is drill one hole twice. **Stage 1:** a sealed-bearing roller **pilot bit** on hollow **1.5 m drill pipes** is pushed *downward* with water flush until it breaks through into the level below. **Stage 2:** the pilot bit is unscrewed from underneath and a **reaming head** — a flat steel disc 0.6–6 m across carrying 4 to 32 roller cutters in bolted saddles, weighing 2.7 to 38 tonnes — is bolted onto the bottom of the string, and the machine **rotates and pulls it back up** toward itself. There is no flush on the ream pass; the cuttings simply **fall by gravity** into the lower chamber and are mucked out with an LHD (`03-mining.md` §A.5.1, `[W-SANDVIK-RB]`). The product is a ventilation shaft, ore pass, manway or penstock, up to ~6 m diameter and up to ~1000 m long.

So the correct mental picture is: **a squat, extremely stiff derrick bolted to a floor, straddling a hole, with a very large-diameter hollow rotary drive travelling on it, and almost everything else (power pack, water pump, control stand, pipe rack) sitting loose on the floor around it, connected by hoses.** A driller would call the machine itself "the head and the frame" and everything else "the pack".

## 3. Proportions

**Read this section's honesty warning first.** Raise boring is the worst-sourced
machine in this library. There is **no manufacturer general arrangement, no
dimensioned drawing and no photograph** available on this machine, and the
session's web-search budget was exhausted before this document was written
(200/200 calls used), so only direct URL fetches were possible. Everything below
is either cited to a source or explicitly marked `NOT SOURCED`. **The machine's
own envelope — height, footprint, weight, thrust, torque — is unsourced, and
§8 is long on purpose.**

### 3a. The reaming head — the best-sourced object on the machine

All from `research/03-mining.md` §A.5.1 and §C.2.5, citing `[W-SANDVIK-RB]`:

| head diameter | cutters | head weight incl. stem, saddles and cutters |
|---|---|---|
| **1 060 mm** | **4** | **~2.7 t** |
| **1 829 mm** | **10** | — |
| **2 134 mm** | — | **~7.3 t** |
| **2 440 mm** | **14** | — |
| **3 094 mm** | **16** | — |
| **3 696 mm** | — | **~15 t** |
| **5 876 mm** | **32** | — |
| largest | — | **~38 t** |

- Reaming heads run **0.6 m to 6 m** diameter; raises **up to 6 m diameter and
  up to 1 000 m long are not uncommon** (`ibid.`).
- **All heads have a flat cutting profile** — *"for smooth rotation and low
  torque demand"* (`ibid.`). **Not a cone, not a dome. A flat disc.** This is the
  single most important shape statement available and it is explicit.
- Cutters sit in **saddles**, which are **bolted** and **can be repositioned to
  change button-row spacing** for different rock. **Only two cutter types are
  needed on any one head** (`ibid.`).
- **Three head constructions**: **integral** (strongest, no transport
  restriction), **segmented** (base head + two removable segments, so it fits
  down a cage and along a narrow drift and bolts together at the collar), and
  **extendable** (base head + 4 or 6 segments, so one head builds several
  diameters) (`ibid.`).
- **Head centre bores: Ø340 / 360 / 390 mm** (`ibid.`).

### 3b. The string

`research/03-mining.md` §A.5.1 and §D.5, citing `[W-SANDVIK-RB]`:

- **Drill pipe: 1.5 m long, hollow, high-torque international-standard thread.**
- **Stems: Ø228–381 mm (9″–15″)**, *"bolted to the base head so one head can
  follow different pilot-hole sizes"*.
- **Pilot bit: a sealed-bearing roller bit with hard-wearing gauge buttons.**
- **Stabilizers: large-diameter, mandatory whenever the string is in
  compression** — i.e. on blind boring and down boring, **not** on conventional
  up-reaming.

### 3c. Working envelope, from a second independent source

`https://www.herrenknecht.com/en/products/productdetail/raise-boring-rig-rbr/`,
fetched 2026-09-05:

- **Reaming diameter 0.3 – 8 m** — a wider range than the 0.6–6 m above, from a
  different maker. **Both are recorded; neither is picked.**
- Shafts *"in rock down to 2 000 metres in depth"*.
- The rig is *"installed above a starting point for the shaft using a transport
  system or a crane"* — confirming it is placed, not driven.
- Named components: **variable frequency electric drives, planetary gears, pipe
  handler, guide columns, thrust cylinder, main drive, wrench unit**, with
  *"mechanized rod handling and remote controlled wrench units"*.

**Every numeric machine specification is absent from that page** — no torque, no
thrust, no weight, no height, no footprint, no installed power. That is a stated
absence, not an oversight on my part; see §8.

### 3d. Variants and their diameter bands

`research/03-mining.md` §A.5.1, `[W-SANDVIK-RB]`:

| variant | diameter band | string in | notes |
|---|---|---|---|
| **Conventional** — pilot down, ream up | to **6 m** | tension | cuttings fall by gravity, mucked with an LHD |
| **Blind boring** — no upper access, drill and ream upward together | **0.6 – 1.8 m** | **compression** | needs large-diameter stabilizers |
| **Down boring** — ream downward into a stope | **0.6 – 1.8 m** | **compression** | guided by a nosepiece; needs stabilizers |
| **Horizontal boring** | **0.6 – 4.5 m** | — | **needs a scraper cuttings-removal system**, because gravity no longer mucks for you |

### ★ Ratios a modeller can actually use

Derived from the sourced table in §3a. **These are arithmetic on cited numbers,
not new claims.**

1. **Cutter spacing settles at about one cutter per 175–195 mm of head
   diameter** above ~1.8 m: 10/1 829 = 183 mm, 14/2 440 = 174 mm, 16/3 094 =
   193 mm, 32/5 876 = 184 mm. Equivalently **≈ 5.5 cutters per metre of
   diameter**.
2. **Small heads are sparser.** At 1 060 mm the published count is **4**, i.e.
   **265 mm per cutter** — 40 % wider spacing than the large heads. The
   relationship is **not** a single straight line through the origin, and §9.1 is
   about the game assuming it is.
3. **Head weight scales as roughly D^1.4–1.5, not D².** 2.7 t at 1.06 m → 7.3 t
   at 2.13 m → 15 t at 3.70 m → 38 t at ~5.9 m. A constant-thickness disc would
   scale as D²; these do not, so **the big heads are lightened structures with
   webs and gullets, not solid plates**. That is a modelling instruction as much
   as a weight figure.
4. **Head weight per cutter rises from ~0.68 t to ~1.19 t** across the range —
   big heads carry proportionally more steel per cutter as well as more cutters.
5. **The stem is a thin spine: 6–14 % of the head's diameter.** A Ø254 mm stem
   under a 1.8 m head is 14 %; a Ø381 mm stem under a 6 m head is 6.4 %. **At
   thumbnail size the head is a plate and the string is a wire.** This is the
   defining proportion of the whole machine.
6. **The head's centre bore (Ø340–390 mm) is slightly larger than the largest
   stem (Ø381 mm)** — so the stem passes through and bolts to a flange, and there
   is a visible boss around the bore on the head's upper face.
7. **The pipe is short: 1.5 m.** Against a raise up to 1 000 m long, that is
   **up to ~660 joints**. The pipe rack, the pipe handler and the wrench unit are
   therefore in constant use and are a large part of what the machine visibly
   *does*.
8. **Raise length : diameter can reach 1 000 : 6 ≈ 167 : 1.** Nothing else in the
   game bores a hole that slender relative to its length.

---

## 4. Component inventory

### 4a. The machine

Named components come from the Herrenknecht page (§3c) and the description in
`research/03-mining.md` §C.2.5. **Dimensions for these parts are `NOT SOURCED`
— what follows is what exists and why it reads, not how big it is.**

| Part | Why it matters visually |
|---|---|
| **Base frame, grouted and rock-bolted to a prepared concrete floor** | The machine reacts thousands of kilonewtons of pull **into the rock itself**. This is not a set of feet — it is a structural connection, and it should look like one. See §9.2. |
| **Guide columns / derrick** | *"A short, extremely stiff derrick"* (`research/03` §C.2.5). Short and stiff is the whole character: this is not a mast, it is a reaction frame. |
| **Main drive** — a large-diameter hollow rotary drive | The largest single object on the machine. Hollow, because the string passes through it. |
| **Planetary gears and variable-frequency electric drives** | Electric, not hydraulic, on the machine cited. Motors hang off the drive housing as distinct cylindrical lumps. |
| **Thrust cylinder(s)** | Between base and drive. On the ream pass they **pull**, which is the larger force. |
| **Pipe handler** | Handles the 1.5 m pipes. In constant use (ratio 7). |
| **Wrench unit** — remote controlled | Makes and breaks the joint at the floor. A distinct powered clamp at the collar, not a hand tool. |
| **Collar of the hole** | The one thing every raise-boring scene must have and the easiest to forget. |
| **Hydraulic power pack** | Loose on the floor alongside (`research/03` §C.2.5). |
| **Water pump** | Ditto. **Water flushing goes down the string and up the annulus on the pilot pass** (`ibid.` §A.5.1) — so there is a water line, and there is water on the floor. |
| **Control stand** | Ditto. |
| **Pipe rack** | 1.5 m pipes lying horizontally. |

### 4b. The reaming head

**Hub with a bolted stem flange and a Ø340–390 mm centre bore → a flat disc body
→ bolted saddles around it → roller cutters in the saddles → muck gullets between
them → lifting eyes.**

- **The saddles are bolted and repositionable** — so they read as separate
  fabricated blocks with visible bolt patterns, not as pockets machined into the
  disc.
- **Only two cutter types on any one head**, so the cutters are visually
  repetitive by design.
- **Segmented heads split into a base head plus two removable segments**; the
  split lines and their bolted flanges are visible on the finished head and are
  the reason it is in the chamber at all. **Modelling the split lines is free and
  it tells the whole transport story.**
- **Extendable heads take 4 or 6 segments** on the same base.

### 4c. The chamber — half the visual, and it is not optional

`research/03-mining.md` §C.2.5 describes the setting directly: a **small
purpose-excavated chamber on an upper level**, a **prepared concrete floor**, the
machine **grouted and rock-bolted down**, with the power pack, water pump,
control stand and pipe rack **loose on the floor around it, connected by hoses**.

A driller would call the machine itself *"the head and the frame"* and everything
else *"the pack"* (`research/rigs/raisebore.md` §2, already in this file).

**What that means for a modeller:** the room is as much the subject as the
machine. Prepared floor, rock or shotcrete walls, mesh and bolts, a light string,
hoses across the floor, water underfoot, the collar with the string standing in
it, and a low back — a cuddy, not a hall.

### 4d. The lower level

`research/03-mining.md` §A.5.1: on the ream pass **the cuttings simply fall by
gravity** into the lower chamber **and are mucked out with an LHD**. So the
breakthrough end has a growing muck pile under a rising hole, an LHD, and a
barricade. **There is no flush on the ream pass** — nothing is pumped, nothing
sprays; the material just falls.

---

## 5. Distinctive features (thumbnail silhouette test)

1. **It has no tracks, no wheels, no cab and no boom.** Alone in the whole fleet.
   If a viewer can see how it got there, it is wrong.
2. **A short, stiff frame straddling a hole in the floor** — wider and squatter
   than any mast on any other machine. It reads as a reaction frame, not a mast.
3. **The pack is scattered around it.** Power pack, water pump, control stand and
   pipe rack are **separate objects on the floor connected by hoses** — the
   silhouette is a machine plus a room's worth of loose equipment, not one
   self-contained vehicle.
4. **The reaming head parked on its side on the floor is the memorable object**
   — *"the best set-piece in the entire mining vertical"* (`research/03` §C.2.5).
   A flat disc, 0.6–6 m across, studded with cutters in bolted saddles.
5. **At thumbnail size the head is a plate and the string is a wire** (§3, ratio
   5). Nothing else in the game has that proportion.

---

## 6. Materials, paint, and where wear and dirt accumulate

**Sourced context:** water flushing on the pilot pass, down the string and up the
annulus; **no flush at all on the ream pass**, with cuttings falling by gravity
(`research/03` §A.5.1). The machine is grouted to a concrete floor in a rock
chamber. Everything below follows from those facts; where it goes beyond them it
is labelled.

- **The floor is the wettest place on the machine.** Pilot flush returns up the
  annulus and arrives *at the collar*, so there is standing water and a slurry
  ring around the hole, and the base frame sits in it. **Rust bloom at the base
  frame's underside and around every anchor is the single most characteristic
  weathering on this machine.**
- **The collar** is the dirtiest 2 m of the scene: slurry, cuttings, a bund or a
  scraped ring where it has been shovelled back.
- **The stem and pipe** come out of the hole wet and coated in rock flour, and go
  into the rack still wet. **The pipe rack drips.** Expect a stained floor under
  it.
- **The main drive housing** stays comparatively clean on top and filthy
  underneath — everything that comes off the string falls on its underside.
- **Cutter buttons**: mirror-worn on the working face, chipped at the gauge.
  **Two cutter types only**, so wear should be applied consistently across the
  head rather than randomised per cutter.
- **The saddles** are bolted and repositioned in service, so their bolt heads are
  rounded by a rattle gun and their paint is gone in a ring around each bolt.
- **The head's upper face** takes the falling muck on the ream pass and is
  scoured; the lower face is polished by the rock it has just cut. **The two
  faces of the head should not look alike.**
- **Grout at the base.** The machine is grouted down. There is a fillet of grey
  grout around the base frame, poured and left rough, and it is a different
  material from both the concrete floor and the steel.
- **Paint:** underground machines are painted, and this one is placed and left
  for weeks, so paint survives better than on a machine that travels. Expect
  **intact paint on the upper structure and no paint at all below knee height.**
- **`[INFERRED]`, flagged as such:** the specific hues, the presence of
  reflective markings, and any lighting fitted to the machine are **not sourced**.
  Do not present them as fact.

---

## 7. Photo references

**There are none, and that is the finding.**

`research/rigs/_photos.md` — the catalogue of all 279 images in
`C:\Users\henri\Downloads`, of which 205 were opened — records that **there is no
underground photograph of any kind in the folder**, and lists `raisebore` among
the eleven machine ids with no photograph at all.

So: **no photograph of a raise borer, no photograph of a reaming head, and no
photograph of an underground chamber** exists in the owner's library. Nothing in
§5 or §6 is traced from a picture.

**The three images that would close this**, in priority order:

1. A **reaming head on the floor**, three-quarter view, with a person for scale —
   it is the memorable object and it is completely unsourced visually.
2. A **raise borer set up in its chamber**, showing the base frame, the grout
   fillet, the anchors and the room around it.
3. The **collar during the ream pass**, showing where the water and slurry
   actually are.

---

## 8. NOT SOURCED

This list is long, and that is the correct outcome for this machine. **Nothing
below may be invented.**

1. **The machine's entire envelope.** Height, footprint, weight, and the
   proportion of frame height to base width. The only description available is
   the words *"short, extremely stiff derrick"*.
2. **Thrust and pull force in kN.** The game asserts 2 800 kN thrust and
   4 500 kN pull. **No source read supports or refutes either number.**
3. **Torque in kNm.** Game asserts 120 kNm. Unsupported.
4. **Installed power.** Game asserts 250 kW. Unsupported. The Herrenknecht page
   confirms **electric** variable-frequency drives, which is a qualitative fact
   the game does not record either way.
5. **Machine weight.** Game asserts 26 t. Unsupported.
6. **How the machine is actually anchored** — the number, size, pattern and depth
   of the rock anchors, and the geometry of the grouted base. *"Grouted and
   rock-bolted down"* is the whole of the source. This is §9.2's problem and it
   cannot be closed from the material available.
7. **Reaming head thickness**, at any diameter. The heads are described as flat
   discs and their weights are given, but **no thickness figure exists**, so the
   disc's aspect ratio is unknown.
8. **Saddle dimensions**, cutter journal geometry, cutter diameter and cutter
   length. `[W-SANDVIK-RB]` gives counts, not sizes.
9. **Muck gullet geometry** on a reaming head — shape, count, depth.
10. **Pilot bit diameter.** Game asserts 311 mm. `[W-SANDVIK-RB]` gives head
    centre bores (340/360/390 mm) and stem ODs (228–381 mm) but **no pilot
    diameter**. The game's 311 mm is internally consistent with a 254 mm stem but
    is not sourced.
11. **Drill pipe outside diameter.** Length (1.5 m) is sourced; **diameter is
    not**. The game's `drill-stem` uses Ø254 mm, which is inside the sourced
    *stem* band — but the source distinguishes **drill pipe** from **stem**, and
    whether they share a diameter is unestablished.
12. **The thread on the drill pipe.** *"High-torque international-standard
    thread"* names no standard.
13. **Set-up time, crew size and the sequence of erecting the machine.**
14. **Chamber dimensions.** A *"small purpose-excavated chamber"* with no numbers.
    `research/16-site-archetypes.md` may hold an `underground-drive` envelope that
    could bound it; not chased here.
15. **Anything about the upper-level access**, the cage, or how a 38 t head is
    handled underground.
16. **`Rotary_Drill_Bits_2025_A4_E-version.pdf` was checked and does NOT cover
    raise-bore cutters.** It is a **tricone rotary bit** catalogue (7⅞″ to 13¾″)
    with per-model row and insert counts, shirttail protection, hard-facing and
    jetted air nozzles. Genuinely useful to `tools-bits-carbide.md`; **useless
    here**, and I am recording that rather than stretching it by analogy.
17. **The web-search budget was exhausted** (200/200) before this document was
    written, so only direct URL fetches were possible and only one manufacturer
    page was successfully reached. Two others returned 404 and one 403. **A rerun
    with search available would likely close items 1–5 in minutes.** This is the
    single highest-value follow-up on this machine.

---

## 9. Domain-truth warnings — what the game currently gets wrong

Read from `src/rig/rigFactory.js` (`buildRaisebore`) and `src/rig/tools.js`
(`raisebore-reamer`, `raisebore-pilot-bit`, `drill-stem`). **Read only; nothing
edited.** Appendix A below records the current model in full. Ranked by how badly
a mining engineer would react.

### 9.1 The cutter count is wrong at every head diameter

`tools.js`, `buildRaisebore` reamer:

```js
const cutters = opts.cutters || Math.max(6, Math.round(diaMm / 260));
```

Against the published counts (`research/03-mining.md` §A.5.1, `[W-SANDVIK-RB]`):

| head Ø | published cutters | game formula gives | error |
|---|---|---|---|
| 1 060 mm | **4** | 6 (the floor) | **+50 %** |
| 1 829 mm | **10** | 7 | **−30 %** |
| 2 440 mm | **14** | 9 | **−36 %** |
| 3 094 mm | **16** | 12 | **−25 %** |
| 5 876 mm | **32** | 23 | **−28 %** |

**The formula is wrong in both directions**: the `Math.max(6, …)` floor
over-populates small heads, and the `/260` divisor under-populates every large
one. The real spacing is **≈ one cutter per 184 mm** above 1.8 m (§3, ratio 1),
with small heads deliberately sparser.

**This is directly visible.** `buildRaisebore` parks a **1 800 mm** head on the
floor in every raise-boring scene, and the formula gives it **7 cutters where the
published count for a 1 829 mm head is 10.** A viewer can count them.

### 9.2 The machine is not anchored — it is standing on pins

The source is unambiguous: the machine is **grouted and rock-bolted onto a
prepared concrete floor** so it can react thousands of kilonewtons **into the
rock** (`research/03` §C.2.5). The game builds:

```js
part(T, base, G.cyl(T, 0.028, 0.028, 0.85, 8), p.chrome, { … });  // x4
```

**Four chrome rods 28 mm in diameter.** The rig's own spec claims **4 500 kN of
pull**. Four 28 mm rods is roughly 2 460 mm² of steel; at 4 500 kN that is about
**1 830 N/mm²** — far beyond any structural steel. **The anchorage as modelled
could not hold the machine down, and it does not read as anchorage either** —
chrome rods read as hydraulic rods, which is the opposite of what they are.

What the scene needs instead: **a grout fillet around the base frame** and
**anchor assemblies that look structural** — plates, nuts, and bolts of a size a
viewer believes. The exact geometry is `NOT SOURCED` (§8.6), so the honest fix is
to make it *read* right rather than to invent a bolt schedule.

### 9.3 The reamer head profile should be explicitly flat

`[W-SANDVIK-RB]` states that **all heads have a flat cutting profile**, *"for
smooth rotation and low torque demand"*. The game places cutters on **two
concentric rings** at r = 0.86 R and r = 0.55 R with a **120 mm vertical offset**
between the rings. Two rings on a flat disc is plausible; **the 120 mm step is
not, if "flat profile" is taken literally**, and nothing in the source describes
a stepped or two-tier face. **Flag as unverified rather than wrong** — but if the
step is visible in silhouette it contradicts the one explicit shape statement
available.

### 9.4 There is no segmentation, and it is the cheapest win here

Segmented heads are **base head plus two removable segments**; extendable heads
are **base head plus 4 or 6**. The split lines and their bolted flanges are the
reason a 7 t head is in an underground chamber at all. **They cost nothing to
model — they are lines and bolt circles on a disc that already exists — and they
tell the entire transport story.** The game's head is a single unsegmented hub.

### 9.5 Head weight is not modelled at all

The published weights — **2.7 t at 1 060 mm rising to 38 t** — are absent from
the `raisebore-reamer` spec block, which carries `diameterMm`, `cutters`,
`stemConnection` and `material` but no mass. It is a sourced number and the shop
screen has nowhere to show it.

### 9.6 `reamDiaM: '1.2-3.1'` is a narrow slice of the real range

Sourced: **0.6–6 m** from one maker, **0.3–8 m** from another (both recorded,
neither picked — §3c). The game offers **1.2–3.1 m**. That is a defensible
choice for one machine class, but it excludes both the small end (ore passes and
fill holes at 0.6–1.8 m, which are the blind-boring and down-boring bands) and
the large end (the 6 m ventilation shafts the source calls *"not uncommon"*).
Worth a deliberate decision rather than an accident.

### 9.7 Two variants the game does not have, and one it should not fake

`[W-SANDVIK-RB]` gives **blind boring** and **down boring** (both 0.6–1.8 m, both
with the **string in compression and large-diameter stabilizers mandatory**) and
**horizontal boring** (0.6–4.5 m, needing a **scraper cuttings-removal system**
because gravity no longer mucks). **The compression variants need visible
stabilizers on the string** — a large-diameter collar that a tension-mode
conventional raise does **not** carry. If the game ever offers a blind raise, the
string must gain stabilizers; if it does not offer one, it should not show them.

### 9.8 Things the game already gets RIGHT — do not "fix" these

- **`pullKn: 4500` > `thrustKn: 2800`.** Correct, and correct for the right
  reason: reaming is a pulling operation and the pull is the larger force.
- **`stemMm: 254`** sits inside the sourced Ø228–381 mm band.
- **`drill-stem` default `lengthMm: 1500`** matches the sourced 1.5 m pipe
  exactly.
- **`stemConnection: 'Bolted flange'`** matches *"bolted to the base head"*.
- **The pilot bit is a tricone with sealed bearings** — `raisebore-pilot-bit`
  wraps `buildTriconeBit`, and the source says *"a roller bit with sealed
  bearings"*. Right family.
- **`noMastRaise = true`** and `stack.pivot.userData.fixed = true` — the machine
  correctly cannot raise or rake its column. It is a reaction frame, not a mast.
- **The power pack, water pump equivalent, control stand and stem rack are
  separate objects on the floor** connected by hoses. That is exactly the
  *"machine plus the pack"* arrangement the source describes, and it is the
  hardest thing about this machine to get right. It is already right.
- **The comment at the parked reamer** — that on the ream pass the head is *not*
  on the floor but climbing on the bottom of the string, so it must not be merged
  into the pad — is correct method and a real bug fix. Leave it.

### 9.9 One thing to check that this document cannot settle

`research/03` §A.5.1 distinguishes **drill pipe** (1.5 m, hollow, for the pilot
pass) from **stems** (Ø228–381 mm, bolted to the base head, following different
pilot-hole sizes). The game has a single `drill-stem` at Ø254 × 1 500 mm doing
both jobs. **Whether those are genuinely one component or two is not established
by any source read** (§8.11). Flagging it rather than asserting an error.


---

## Appendix A — what the game currently builds (read from rigFactory.js)

`buildRaisebore`, spec block:

```
id: 'raisebore', name: 'Vantera RB-92 Shaftline'
klass: 'Underground raise-bore machine', weightKg: 26000, powerKw: 250,
columnM: 4.6, torqueKNm: 120, thrustKn: 2800, pullKn: 4500,
reamDiaM: '1.2-3.1', pilotMm: 311, stemMm: 254,
methods: ['raise-boring'], frameRadius: 6.5
```

Geometry as built:
- base frame 3.2 x 3.0 x 0.30 m box on four 0.42 m pedestal blocks with thin (28 mm dia) chrome rods to the floor — reads as anchor bolts.
- collar ring: torus r=0.55, tube 0.09 around the hole.
- a **4.6 m four-post lattice column** (0.22 m box legs on a 1.84 m square, three bracing bands per half) carrying a travelling carriage.
- carriage: 1.85 x 0.95 x 1.85 rounded box (gearbox), 12-bolt ring, hollow chrome spindle below it, tool anchor 0.46 m below spindle.
- two thrust rams, 1.60 m body / 1.70 m stroke, at x = ±1.05.
- separate hydraulic power pack 1.35 x 1.25 x 2.0 m at (-2.35, 0, -1.4) with louvres and a horizontal cylinder (accumulator/cooler) on top.
- control stand 0.85 x 1.35 x 0.55 with a screen and a canopy on two posts.
- stem rack: 6 stems, 254 mm dia, 1.5 m long, lying horizontally.
- one parked reamer head, 1800 mm dia, lying on its side.
- 4 hose runs from the pack to the machine, one coiled airline, wear/mud clumps.

Nothing is bolted **down** through the column into rock in the model other than the four thin rods; the machine has no derrick-height stem handling and no shaft-collar/bulkhead context.

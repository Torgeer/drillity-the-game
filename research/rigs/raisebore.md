# Raise boring machine — engineering reference (`raisebore`)

status: **REWRITTEN 2026-09-05 (second pass). The machine is no longer
under-sourced.** The first pass had its web-search budget exhausted (200/200)
before it began, reached exactly one manufacturer page, and concluded that this
was "the worst-sourced machine in this library" with its "entire envelope"
unknown. That conclusion was a statement about the session, not about the
machine: a rerun with search available reached **20+ sources in about fifteen
minutes**, including five full manufacturer specification tables, seven
information sheets with footprints, two patents that describe the structure in
words, and a textbook chapter. **§3e now carries published height, width,
depth, weight, torque, thrust, stroke, drill angle and power-pack dimensions
across nine real machines.** §8 has gone from seventeen items to five.

The old §8.17 named the rerun as "the single highest-value follow-up on this
machine". It was. This is that rerun.

Nothing marked NOT SOURCED may be invented.

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

### 1b. Second pass — the web sources the first pass could not reach

Retrieved **2026-09-05**, all read (several manufacturer hosts 403 a plain
fetch; the public PDFs were pulled directly and text-extracted).

| Source | What it gave | Useful? |
|---|---|---|
| **Manufacturer A — five model specification sheets** (34RH, 44RH, 53RH, 73-series, 92R of the long-running "Robbins" raise-boring line, now Epiroc). `epiroc.com/…/raiseboring-technial-specifications/…pdf` | **The single most valuable source on this machine.** Full spec tables: raise diameter and length, reaming torque and break-out torque, reaming thrust, **stroke**, pilot and reaming rpm, installed power and kVA, drill pipe diameter and length, pilot hole diameter, **derrick height extended AND retracted, width, width with pipe loader, depth, and weight**, drill angle, and **separate power-pack / drive-pack / thrust-pack / cooling-unit dimensions and weights**. Also the component prose: "rigid crosshead guide columns provide efficient torque reaction", "swivelling floating drive box with DI-22 thread", "ground loading, remote controlled" pipe loader, "worktable, hydraulic horse shoe wrench", "two double-acting **telescopic** cylinders", "the gear box is installed in a **removable barrel**", "starter bushing", "**Blooie system** provides a controlled exit for return bailing fluid and cuttings during pilot hole drilling", "hose chain for drive hoses", "trolley mounted operator panel". | **YES — primary** |
| **Manufacturer B — seven "Redbore" information sheets** (30X, 40, 50, 70, 80, 90, 100). `redpathraiseboring.com/uploads/Information Sheets/…pdf` | **The best FOOTPRINT data found anywhere**: extended height AND width × depth AND weight for every model, with max table load, thrust, reaming torque, pilot hole, drill pipe and raise angle. Carries the footnote "All dimensions **without rod handler**". | **YES — primary** |
| **Manufacturer C — raise boring equipment brochure** (RBM 200-5 / 250-10 / 500-10 / 600-20). `palmierigroup.com/…/RAISE-BORING-EQUIPMENT.pdf` | **The only source that tabulates CYLINDER COUNT against thrust** — 2 cylinders to 3 000 kN, **3 at 4 500 kN**, 4 at 8 046 kN. Plus stroke, rod connection (DI-22), rod size, raise range, depth and installed power; and full drill-pipe, stem and stabilizer dimension tables. | **YES — primary** |
| **US3802057** (raise drill patent, Robbins lineage) | **Where the structure is actually described in words.** "A travelling support frame is mounted for up and down travel by **two parallel guide columns** secured at their lower ends to a base frame"; the base is "a base plate 12 and a generally **U-shaped main frame** 14" with the columns "received in the **sockets**"; "a **fixed cross frame** rigidly interconnects the **upper ends** of the guide columns"; the travelling cross frame has "vertically spaced apart **upper and lower guide sleeves** which surroundingly engage the columns"; motors are "bolted to the housing", each "an electric motor and a **planetary type reduction transmission**", feeding "**collector gearing** having a pair of inputs and a single output"; "**triangularly arranged thrust ram means**" with "the drilling axis located substantially at the **center of forces within the triangle**". | **YES — primary (structure)** |
| **US4315552** (raise drill apparatus patent) | The base is "a pair of **mounting pads** which are anchored to the ground surface by **suitable bolts**" — and the bolts are "**(not shown)**", which is the honest state of the anchor question everywhere. Tilt: the work table "is connected to the base through **pivot pins** which allow [it] to be tilted by means of **a pair of turnbuckles**". "The drill pipe sections will project through a **central opening in the work table**." The wrench: "a **sliding fork** mounted on the work table will be moved against the drill pipe by means of **hydraulic cylinders** and will engage several depressions or flats located around the outer surface of the drill pipe. The fork will **support the weight of the drill pipe** and lock the pipe against rotation." | **YES — primary (structure)** |
| **Underground mining methods textbook, raise boring chapter.** `miningandblasting.files.wordpress.com/…/mining_methods_underground_mining.pdf` | The machine "is composed of **five major assemblies**: the derrick; the hydraulic, lubrication, and electrical systems; and the control console." "**Baseplates, mainframe, columns and headframe** provide the mounting structure." "The **gearbox mounts directly to the main drive motors, employing a planetary reduction** for its compactness." "**Hydraulic cylinders provide the thrust**." "The hydraulic power unit is **skid-mounted**." "The electrical system assembly consists of **an enclosed cabinet**." The wrench is "a hydraulically powered **fork-shaped wrench**". Drill angles "between 45 degrees and 90 degrees from horizontal". And: the larger machine in the range "**does not feature an opening worktable**, as the wings of the stabilizers and the reamer are attached on top of the machine." | **YES — primary** |
| **A raise-boring contractor's fleet pages.** `raisebore.com.au` | **The base beams**, which no manufacturer sheet mentions: extended heights are quoted "**plus 400 mm beams if required**" on four machines and "plus 500 mm beams" on a fifth, and one entry says what they are for — "**Beams to allow hole break through (if required)**". Weight deltas size the set: 7.5 t bare → **19.5 t "including beams"**. Also per-machine pilot thrust, reaming thrust, torque, rpm, height and weight. | **YES** |
| **Manufacturer product-colour manual.** `productmanual.atlascopco.com/en/product-colors` | The paint SYSTEM, and its layering rule stated outright: "we always strive to use **the darker color for elements that support or carry elements in the lighter color**… the dark gray carries the yellow." Yellow is "a high-visibility color used… **in dark and/or dangerous environments to increase safety**." Gloss **35 %** (satin). **No RAL or hex is published** — the manual explicitly refuses one and directs the reader to a physical colour specimen. | Yes (see §6) |
| **Trade press** — `e-mj.com` "Sizing the Rig to the Job" (2013) and "Drilling Enhances Shaft Safety" (2014); a contractor article in *Mining & Quarry World* Feb 2018 (`rhinoraiseboring.com`). | "Traditional raise-boring machines typically requiring **a concrete platform and tie-down bolts** to keep the machine stable during operation." "The operator is generally **stood in the open less than 5 m from the hole** being drilled." A 3 m-class machine at "**down thrust 1 600 kN, up thrust 4 500 kN**", "extended height 4 500 mm; retracted 3 815 mm". And the set-up parts list: "one or two power packs, a control system, the raise borer itself, **a base plate system providing attachment to the ground**, many smaller tools and utility items, and all the drill string items" — plus "a **concrete pad needs to be poured over firm rock** although non-concrete solutions have recently become more common." | Yes |
| **Raise-boring tooling user manual and tools brochure** (Sandvik, the same maker `[W-SANDVIK-RB]` already stands behind). | The pilot-bit table by diameter — a **311 mm bit weighs 100 kg**, 6⅝" API REG pin, 30–60 rpm, "use **min 800 litres/min of water** for efficient flushing"; the full reamer cutter-count and weight ladder (§3a, now extended); "all basic components are **bolted** to each other"; saddle bolts "tighten crosswise to 2/3 of full torque… finish to full strength **1 200 Nm**", dowel-located, Nord-Lock washers, reusable. | Yes |
| `C:\Users\henri\Downloads\catalog_rocktool_english.pdf` pp.31–32 | Opened 2026-09-05. **Negative result, recorded rather than stretched.** It is REVERSE-CIRCULATION SHAFT-DRILLING tooling, not raise boring. Two things carried across as adjacency only, with the family named: roller/disc cutter bodies run **Ø210–310 mm nominal at 37–129 kg each** (p.31), and a large rotary head turns **slowly — 13.1 rpm at a 900 mm head falling to 6.0 rpm at 2 100 mm** (p.32), which independently agrees with the 0–16 rpm reaming speeds in the raise-boring sheets. | **No — adjacency only** |
| `C:\Users\henri\Downloads\perforator_disccutter_schneidrolle_22.pdf` | Opened 2026-09-05. **Negative result.** Microtunnelling/TBM disc cutters, 150–395 mm (6"–15.5"). Does not cover raise boring; contributes no dimension. | **No — negative result** |

_(more sources appended below as read)_

## 2. What the machine IS

A **raise borer** is the odd one out in the whole fleet: **it does not drive anywhere.** It is a stationary machine that is trucked or caged in pieces into a small purpose-excavated chamber on an **upper** mine level, set on a **prepared concrete floor**, and **grouted and rock-bolted down** so it can react thousands of kilonewtons of pull against the rock itself (`03-mining.md` §C.2.5, `[W-SANDVIK-RB]`). It has no tracks, no wheels, no cab and no boom.

What it does is drill one hole twice. **Stage 1:** a sealed-bearing roller **pilot bit** on hollow **1.5 m drill pipes** is pushed *downward* with water flush until it breaks through into the level below. **Stage 2:** the pilot bit is unscrewed from underneath and a **reaming head** — a flat steel disc 0.6–6 m across carrying 4 to 32 roller cutters in bolted saddles, weighing 2.7 to 38 tonnes — is bolted onto the bottom of the string, and the machine **rotates and pulls it back up** toward itself. There is no flush on the ream pass; the cuttings simply **fall by gravity** into the lower chamber and are mucked out with an LHD (`03-mining.md` §A.5.1, `[W-SANDVIK-RB]`). The product is a ventilation shaft, ore pass, manway or penstock, up to ~6 m diameter and up to ~1000 m long.

So the correct mental picture is: **a squat, extremely stiff derrick bolted to a floor, straddling a hole, with a very large-diameter hollow rotary drive travelling on it, and almost everything else (power pack, water pump, control stand, pipe rack) sitting loose on the floor around it, connected by hoses.** A driller would call the machine itself "the head and the frame" and everything else "the pack".

## 3. Proportions

**The honesty warning that used to head this section has been withdrawn, and
saying so is the point.** It read: *"Raise boring is the worst-sourced machine
in this library… The machine's own envelope — height, footprint, weight,
thrust, torque — is unsourced."* That was true of the first session and untrue
of the machine. **Nine real machines' envelopes are now tabulated in §3e**, from
five manufacturer specification tables and seven information sheets.

What genuinely remains unsourced is much narrower and is listed in §8: the
anchor schedule (which one patent marks "(not shown)" and no maker publishes),
pad dimensions, chamber dimensions, handrails, and the paint hue. **There is
still no photograph** — see §7, which is unchanged and still the biggest gap.

Everything below is either cited or explicitly marked `NOT SOURCED`.

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

### 3e. THE MACHINE'S OWN ENVELOPE — the section the first pass could not write

**This closes old §8.1–8.5 outright.** All figures as published on the sheets in
§1b. Heights are DERRICK heights, *extended*; footprints exclude the pipe loader
and the base beams, both of which are quoted separately.

| Machine | Raise Ø | Ream torque | Ream thrust | Stroke | Power | Pilot | Drill pipe | **H ext** | **H retr** | **W** | **W + loader** | **D** | **Weight** | Angle |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A-34RH | 1.0–1.8 m | — | — | 1 710 | — | 229 mm | 203×1 219 | **3 800** | — | 2 215 | — | 2 375 | **12.2 t** | 90–45° |
| A-44RH | 1.0–1.8 m | **75 kNm** | **2 000 kN** | **1 710** | 165/190 kW | 229 mm | 203×1 219 | **3 540** | 1 780 | 1 755 | 3 120 | — | **9.9 t** | 90–45° |
| A-53RH | — | — | — | **1 143** | — | — | 286×750 | — | — | — | — | — | — | 90–45° |
| **A-73-series** | **1.5–3.1 m** | **250 kNm** | **4 159 kN** | **2 057** | 250/290 or 365/377 kW | **311 mm** | **286×1 524** | **5 190** | **3 800** | **1 740** | **3 010** | **1 900** | **12.65 t** | 90–45° |
| A-92R | 3.1–6.0 m | **540 kNm** | **8 923 kN @ 330 bar** | 2 160 | 500/560 kW | 381 mm | 333×1 524 | 5 100 | 4 100 | 2 300 | 3 800 | 2 700 | **32.1 t** | 90–60° |
| B-Redbore 50 | 2.13 m | 83 kNm | 1 779 kN | — | — | 279 mm | 254 mm | **4 040** | — | **1 420** | — | **1 350** | **7.12 t** | — |
| B-Redbore 70 | 4.5 m | 278 kNm | **3 559 kN** up / **2 224 kN** conv | — | — | 349 mm | 327 mm | **5 030** | — | **2 200** | — | **2 210** | **21.1 t** | 45–90° |
| **B-Redbore 80** | 4.0 m | **305 kNm** | **5 338 kN** | — | — | **311 mm** | 286 mm | **5 160** | — | **1 980** | — | **1 940** | **20.2 t** | — |
| B-Redbore 90 | 6.1 m | 610 kNm | 8 896 kN | — | — | 381 mm | 333 mm | 5 990 | — | 2 360 | — | 2 210 | 34.7 t | — |
| C-RBM 500-10 | 2.1–3.0 m | **230 kNm** | **4 500 kN** | 2 075 | 390 kW | — | 286 mm | — | — | — | — | — | — | — |
| D-TR3000 | 3.0 m | **237 kNm** | **4 500 kN** up / **1 600 kN** down | — | **352 kW** | **311 mm** | — | **4 500** | **3 815** | — | — | — | — | — |

**What this says, and it is the whole shape of the machine:**

1. **A raise borer is SHORT AND NARROW.** Across the entire published range —
   1.0 m raises to 6.1 m raises, 9.9 t to 34.7 t — the derrick is **3.5 to
   6.0 m tall on a footprint of 1.4 to 2.4 m square.** Height : width runs
   **2.0 : 1 up to 2.9 : 1**. It is a squat portal. Nothing in this range is a
   mast, a leader or a lattice.
2. **The footprint barely grows.** A 92R bores a raise **twelve times the area**
   of a 44RH and is only **31 % wider** (1 755 → 2 300 mm). The machine does not
   scale with the hole, because the hole does not pass through the machine.
3. **The pipe loader adds 1.27–1.50 m to the width** and is quoted separately
   every time (1 740 → 3 010; 2 300 → 3 800; 1 755 → 3 120). It is bolt-on and
   detachable, and every footprint figure above excludes it.
4. **The base beams add 400–500 mm of height** and are also quoted separately
   ("plus 400 mm beams if required"). One contractor entry says what for:
   **"Beams to allow hole break through."** Weight: 7.5 t bare → 19.5 t with
   beams on one machine, 6 t → 9 t on another.
5. **Retracted height is 1.0–1.4 m less than extended.** The derrick telescopes
   for transport; a working machine is the extended figure.
6. **Reaming torque scales roughly linearly with raise diameter** — 75 kNm at
   1.5 m, 250 kNm at 2.4 m, 540 kNm at 5.0 m — and **thrust scales faster**,
   2 000 → 4 159 → 8 923 kN.
7. **Pull > thrust, and by a consistent margin.** Two machines publish both:
   1 600 kN down against **4 500 kN** up, and 2 224 kN conventional against
   **3 559 kN** upreaming. **Ratio 0.36 and 0.62.** See §3f.
8. **Working pressure is 330 bar** on the one machine that publishes it
   (8 923 kN at 330 bar).
9. **Reaming is SLOW.** 0–16 rpm on the small machines, 0–11 at 250 kNm, **0–7
   on the 5 m machine**. Pilot drilling runs 0–54/0–68 rpm. A reamer that spins
   visibly fast in game would be wrong by an order of magnitude.

### 3f. Why pull exceeds thrust — a geometric answer, not a spec

The cylinders **stand on the base with their rods UP** (US4315552: each is
fixed by "a plate that is held in place by bolts on the work table"). So
extending — **full bore** — lifts, and retracting — **annulus** — pushes down.
Therefore

    thrust / pull  =  A_annulus / A_bore  =  1 − (d_rod / D_bore)²

The game's own spec block asserts thrust 2 800 kN against pull 4 500 kN, a
ratio of **0.622**, which implies a rod/bore ratio of **0.615** — a completely
ordinary cylinder. Published cross-check: Redbore 70's 2 224 / 3 559 =
**0.625**, i.e. a rod ratio of 0.612. **The game's numbers are right to within
0.5 %, and this is why.** The other published pair (1 600 / 4 500 = 0.356)
implies a rod ratio of 0.80, which is what a *telescopic* cylinder gives — and
that machine is one of the low-profile telescopic ones.

**The cylinders are telescopic and that is not a detail.** "Two double-acting
telescopic cylinders"; "high thrust telescopic cylinders… resulted in a machine
with an overall height of just 2.9 m"; and one machine is offered with "**low
profile telescopic cylinders** for narrow operation sites **or standard
cylinders with 33 % more thrust force**". A short barrel under a long stroke is
the entire reason a 5 m machine has a 2 m stroke and still fits in a chamber. A
model built with single-stage rams would be roughly 1.5 m too tall.

**Cylinder COUNT scales with thrust** (manufacturer C, the only tabulation):
**2** cylinders to 3 000 kN, **3** at 4 500 kN, **4** at 8 046 kN. And
US3802057 independently describes "**triangularly arranged** thrust ram means"
with "the drilling axis located substantially at the center of forces within
the triangle" — so three, in a triangle about the hole, is a real arrangement
and not a compromise.

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

**Rewritten in the second pass.** The first version of this table said
"dimensions for these parts are NOT SOURCED — what follows is what exists and
why it reads, not how big it is." That is no longer the situation: the two
patents in §1b describe the STRUCTURE in words, and the spec sheets give the
sizes. The corrected picture first, because it is different from what this
document used to imply:

**A raise borer is a TWO-COLUMN PORTAL, not a tower and not a mast.** In order,
from US3802057 and the textbook chapter:

> **base plate** → **U-shaped main frame** (columns received in **sockets**) →
> **two parallel guide columns** → **fixed cross frame / headframe** tying
> their upper ends → and running on the columns, a **travelling cross frame
> (crosshead)** carried on **vertically spaced upper and lower guide sleeves**.

"**Baseplates, mainframe, columns and headframe** provide the mounting structure
for the boring assembly." The columns are load-bearing guideways, and the sheets
say what they are FOR: "**rigid crosshead guide columns provide efficient torque
reaction** to extend the service life of the thrust cylinders" — so the COLUMNS
take the torque and the CYLINDERS take the thrust, and each is sized for its own
job. Column count is "**two or more**", with two the classic arrangement and
four used on at least one modern frame; one Chinese machine is documented with
"4 cylinders, 2 guide posts and 4 motors" and **square** guide columns, and that
literature classifies raise borers into "**box type, frame type and column
type**" by drilling-frame structure.

**The drive train**, in order downward: motors "**bolted to the housing**", each
an electric motor on a "**planetary type reduction transmission**", feeding
"**collector gearing** having a pair of inputs and a single output" — or, on the
modern variable-frequency machines, "**multiple identical motor gear units
arranged around the center of the drive**, so that even if one of the motors
fails, work can continue with reduced power" (one model can be retrofitted with
"an additional 4th motor"). The gearbox itself is a **drum**: "the gear box is
installed in a **removable barrel**, allowing the derrick to be split into
smaller, more transportable components". Below it hangs the "**swivelling
floating drive box** with DI-22 thread", which "prevents transfer of bending
moments to the gearbox". The whole train has "a **hollow central shaft**,
enabling the efficient transmission of flushing media."

**Four types of main drive motor system are available: AC, DC, hydraulic and
VF.** Both **inline** (marketed as giving "balanced thrust loads") and
**offset** ("dual drive motors placed **offline** on a gathering gearbox")
layouts exist on machines from the same maker, so either is defensible.

Dimensions below are now sourced where §3e gives them; anything still open is
marked.

| Part | Why it matters visually |
|---|---|
| **Base plate + U-shaped main frame**, on a poured concrete pad with **tie-down bolts** | The machine reacts thousands of kilonewtons of PULL into the floor. This is not a set of feet — it is a structural connection and it must look like one. **Correction to the first pass:** the sources say "a **concrete platform and tie-down bolts**" and "a **base plate system** providing attachment to the ground"; "grouted and **rock-bolted**" traces only to a snippet of a paywalled paper and should not be stated as fact. See §9.2. |
| **Base beams, 400–500 mm deep** | Quoted separately from every published height ("plus 400 mm beams if required"), and one entry gives the reason: **"Beams to allow hole break through."** A steel sub-frame the machine stands on, straddling the collar. 7.5 t bare → 19.5 t with beams. **This is how the machine clears its own hole, and the first pass did not know it existed.** |
| **Two parallel guide columns** in sockets in the main frame | "Rigid **crosshead guide columns** provide efficient **torque reaction**." They are guideways, so they are ground/bright, not painted. Round on the Western machines; **square** on at least one Chinese frame. |
| **Fixed cross frame / headframe** tying the column tops | "Rigidly interconnects the **upper ends** of the guide columns." A **cross frame, not a roof** — the drive's motor crown has to pass up through it at full stroke. |
| **Travelling crosshead** on **upper and lower guide sleeves** | The moving element. Sleeves "surroundingly engage the columns", vertically spaced so the head cannot cock. |
| **Main drive** — planetary gearbox in a **removable barrel**, hollow shaft | The largest single object. A DRUM, not a box, and removable so the derrick splits for transport. Hollow because the string and the flush pass through it. |
| **Motor-gear units around the centre** | "Multiple identical motor gear units **arranged around the center of the drive**", each an electric motor on a planetary reducer; one model takes a retrofitted 4th. Inline and offset layouts both exist. |
| **Floating drive box** below the gearbox, **DI-22 thread** | "**Swivelling** floating drive box", which "prevents transfer of bending moments to the gearbox"; a replaceable threaded insert. The string screws into THIS, not into the gearbox. |
| **Thrust cylinders — 2, 3 or 4, TELESCOPIC, standing on the base with rods UP** | Count scales with thrust (2 / 3 / 4 at 3 000 / 4 500 / 8 046 kN); "triangularly arranged" with the drill axis at the centre of forces. Telescopic is why a 2 m stroke fits in a 5 m machine. Full bore lifts = ream = the big force. See §3f. |
| **Worktable with a central opening** | "The drill pipe sections will project through a **central opening in the work table**." On SMALL machines it can open to pass a 1.06 m reamer; **the larger machines have no opening worktable at all** — so the head does NOT come up through a big machine. |
| **Floor wrench — a hydraulic horseshoe / fork** | "A **sliding fork** moved against the drill pipe by hydraulic cylinders", engaging "**flats** located around the outer surface of the drill pipe"; it "supports the weight of the drill pipe and locks it against rotation". A second wrench sits up at the drive head. The pipe therefore HAS wrench flats — a plain tube would give it nothing to bite. |
| **Starter bushing** | Listed in every drilling-tool kit. Sits in the table opening at the collar. |
| **Blooie system** | "Provides a controlled exit for **return bailing fluid and cuttings** during pilot hole drilling." The pilot returns arrive AT THE COLLAR and have to go somewhere. It is the one component that says "stage 1". |
| **Pipe loader — ground-loading, jack-knife, remote controlled, detachable** | Picks 1.5 m pipes **up off the floor**. Adds **1.27–1.50 m to the machine's width**. **There is no carousel and no vertical rack on any machine in any source read** — the first pass's "pipe rack" was an assumption. |
| **Skid-mounted packs** — hydraulic power unit / VF drive pack / thrust pack / cooling unit | "The hydraulic power unit is **skid-mounted**." Published sizes: power pack **3 200 × 1 700 × 1 700 mm, 5 500 kg**; drive pack **3 800 × 2 000 × 1 900, 8 350 kg**; thrust pack **2 300 × 1 540 × 1 400**; cooling pack **2 320 × 2 450 × 1 540**. |
| **Enclosed electrical cabinet** | "An **enclosed cabinet** containing the power and control distribution hardware" — and it lives **inside** the drive pack ("separate cabinet inside the drive pack"), so it is a door on that box, not a fifth object on the floor. |
| **Umbilicals** | "**15 or 20 metre** hoses to derrick", "**20 m or 30 m** cables to derrick", extended operator cable 20–30 m. Optional "**hose chain** for drive hoses". The packs stand well away and the floor is crossed by heavy bundles. |
| **Water pump and line** | Water flush goes down the string and up the annulus on the pilot pass; "use **min 800 litres/min**". One contractor lists **900 l/min pilot, 200 l/min cooling**. |
| **Trolley-mounted operator panel** | "**Trolley mounted** operator panel with full-colour display" — a WHEELED CONSOLE, not a cab; the operator "is generally **stood in the open less than 5 m from the hole**". An "operators platform" is optional and ships as "delivered equipment **not mounted**". |
| **Pivot pins + a pair of turnbuckles** | How the machine is set to angle: the table "is connected to the base through **pivot pins**… tilted by means of **a pair of turnbuckles**", with "extra long turnbuckles for drilling angles below 60 degrees". Published drill angles **90–45°** from horizontal. |

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

**REWRITTEN. This list was seventeen items and is now five.** The old list is
kept below it, struck through, with what closed each one — because a research
document that quietly deletes its own doubts is worth less than one that shows
where they went. **Nothing still open may be invented.**

### 8-NEW. What is genuinely still not sourced

1. **The anchor schedule.** Number, diameter, length, embedment and pattern of
   the tie-down bolts. Every source says the machine sits on "a concrete
   platform and **tie-down bolts**" or "a **base plate system** providing
   attachment to the ground"; **not one publishes a figure**, and the patent
   that describes the pads says the bolts are "**(not shown)**". One maker
   markets "a smaller drilling pad and **fewer tie down bolts**" without ever
   saying how many. `blender/raisebore.py` therefore DERIVES a schedule from
   the machine's own published pull and shows the arithmetic on the line
   (8 × M56, 40 % of yield at 4 200 kN) rather than inventing one — see §9.2.
2. **Concrete pad dimensions, thickness and grade.** "A concrete pad needs to
   be poured over firm rock" is the whole of it.
3. **Raise-bore chamber dimensions.** Nothing quantitative anywhere. The one
   useful qualitative statement is that "raise borers often **require higher
   than normal overhead space**", and that the chamber is drilled and blasted
   for them — which is what permits a 5.1 m machine underground at all.
   `src/core/env.js` has **no `raise-boring` entry in `UNDERGROUND{}`**, so the
   game has no authored raise-bore chamber either; its two production drives
   (5.0 × 5.0 m and 5.6 × 5.4 m) are the nearest available bound. **Authoring
   that chamber is now the highest-value follow-up on this machine.**
4. **Handrails, walkways and ladders. No source describes any** on a
   conventional raise borer derrick, and the optional operator's platform is
   listed as "delivered equipment **not mounted**", i.e. a loose stand. This is
   a documented ABSENCE, not a gap: a model that fits handrails is asserting
   something no source supports. Safety on this machine is about removing
   people from the hole (sliding worktable doors, muck chutes with rubber
   seals, remote control), not railing them in beside it.
5. **The paint hue.** The colour SYSTEM is sourced and so is its layering rule
   — "the **darker colour** for elements that support or carry elements in the
   lighter colour", yellow for "high visibility… in dark and/or dangerous
   environments", 35 % gloss — but **no RAL, Pantone or hex is published by
   anybody**, and the manual explicitly refuses to give one. Since `assets.js`
   owns every texture at runtime this costs nothing: the model expresses the
   RULE (dark carries light) and never a colour.

Also still open, and worth stating: **reaming head thickness** at any diameter
(diameter, cutter count and total weight are published; the axial dimension is
not), **saddle geometry** beyond "bolted, dowel-located, 1 200 Nm", and
**muck-gullet geometry**. None of these touches the machine — they belong to
the head, which `src/rig/tools.js` builds.

### 8-OLD. The first pass's list, and what closed each item

1. ~~The machine's entire envelope.~~ **CLOSED — §3e**, nine machines.
2. ~~Thrust and pull in kN.~~ **CLOSED** — published across the range
   (2 000 / 4 159 / 8 923 kN), and the game's 2 800 : 4 500 ratio is now
   *confirmed* against a real machine's 2 224 : 3 559 (§3f).
3. ~~Torque in kNm.~~ **CLOSED** — 75 / 250 / 305 / 540 / 610 kNm published.
   The game's 310 kNm sits exactly on a real 305 kNm machine.
4. ~~Installed power.~~ **CLOSED** — 165 / 250 / 352 / 390 / 500 kW published.
   The game's 448 kW is in range and the electric drive is confirmed.
5. ~~Machine weight.~~ **CLOSED** — 9.9 t to 34.7 t published by model.
6. ~~How the machine is anchored.~~ **STILL OPEN** — now item 1 above, but
   sharpened: it is tie-down bolts through a base plate system on a poured
   pad, plus 400–500 mm base beams, and the *schedule* is what is missing.
7. ~~Reaming head thickness.~~ **STILL OPEN** (head, not machine).
8. ~~Saddle and cutter geometry.~~ **PARTLY** — saddle torque 1 200 Nm, dowel
   location and Nord-Lock washers are now sourced; the sizes are not.
9. ~~Muck gullet geometry.~~ **STILL OPEN.**
10. ~~Pilot bit diameter.~~ **CLOSED** — **311 mm (12¼") is the standard pilot
    on exactly this size class**, published on two machines, and the tooling
    manual lists it at **100 kg** with a 6⅝" API REG pin. The game's 311 mm is
    correct and is no longer an unsourced assertion.
11. ~~Drill pipe outside diameter.~~ **CLOSED** — the published ladder is
    **203 / 254 / 286 / 327 / 333 / 368 mm**, with rods **1 219 mm on small
    machines and 1 524 mm from mid-size up**. See §9.10 for what this says
    about the game's own pairing.
12. ~~The thread on the drill pipe.~~ **CLOSED** — **DI-22** is the dominant
    raise-bore rod connection (one maker lists 6¾" / 8¼" / 9¼" / 10½" DI-22;
    another offers DI22 or DI42 float boxes).
13. ~~Set-up time, crew, erection sequence.~~ **PARTLY** — the set-up parts
    list is sourced ("one or two power packs, a control system, the raise borer
    itself, a base plate system…, all the drill string items") and the sequence
    starts with drill-and-blast for the chamber, then the pour. Crew size and
    duration still open.
14. ~~Chamber dimensions.~~ **STILL OPEN** — now item 3 above.
15. ~~Upper-level access and how a 38 t head is handled.~~ **PARTLY** — the
    derrick "can be reduced to components weighing 7 000 kg or less" and the
    gearbox barrel is removable for exactly this reason.
16. ~~The tricone catalogue does not cover raise-bore cutters.~~ **Still true,
    and two more local PDFs were checked and rejected this pass** — see the
    last two rows of §1b.
17. ~~The web-search budget was exhausted; a rerun is the highest-value
    follow-up.~~ **DONE. This document is that rerun.**

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

What the scene needs instead: **anchor assemblies that look structural** —
plates, nuts, and bolts of a size a viewer believes.

**SECOND PASS — two corrections and one answer.**

*Correction 1: the wording.* This section, and §4a, used to say the machine is
"grouted and **rock-bolted** down". The web sources say "a **concrete platform
and tie-down bolts**", "a **base plate system** providing attachment to the
ground", and "mounting pads which are anchored to the ground surface by
**suitable bolts**". "Rock bolts" appears only in a search snippet of a
paywalled 2024 review that was never read. **Tie-down bolts into a poured pad
is what is sourced; rock bolts is not.**

*Correction 2: the base beams.* The machine also stands on a **400–500 mm steel
beam sub-frame**, which no source in the first pass mentioned and which changes
the whole base geometry — see §4a.

*The answer.* The schedule is unpublished by everyone (one patent literally
marks the bolts "(not shown)"), so `blender/raisebore.py` **derives** one from
the machine's own published pull and shows the sum on the line:

    4 200 kN over 8 anchors        = 525 kN per anchor
    M56 class 8.8: As = 2 030 mm², proof 640 N/mm² → 1 299 kN
    525 / 1 299                    = 40 % of yield

against the procedural machine's four 28 mm rods, which work out at
**1 827 N/mm²** — beyond any structural steel — and are modelled in **chrome**,
which reads as a hydraulic rod, the exact opposite of an anchor. Deriving with
the arithmetic visible is honest in a way that both inventing a schedule and
leaving it as pins are not.

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

### 9.10 SECOND PASS — §9.9 is now settled: pipe and stem are two components

The first pass flagged, without asserting, that the game runs a single
`drill-stem` at Ø254 × 1 500 mm doing the job of both the **drill pipe** and the
**stem**. Manufacturer C publishes them as **two separate tables**, which
settles it:

- **Drill pipe** — body 203 / 254 / 286 / 327 / 333 mm, shoulder-to-shoulder
  **1 219 or 1 524 mm**, bore 120–135 mm, boreback 150–229 mm, with a spanner
  flat of 165–254 mm (the flat the floor wrench bites — see §4a).
- **Stem** — nominal 228.6 / 248 / 279 / 309.5 / 349.3 / **381 mm**,
  shoulder-to-shoulder **1 480 / 1 467 / 1 454 / 1 416 mm** (note: *shorter*
  than the pipe, and it varies with size), bore 80 mm, and a **flange
  640 × 100 or 690 × 100 mm** — because the stem is what bolts to the base head.
- **Stabilizers** are a third table again: s/s 1 219 or 1 524 mm, body
  203–333 mm.

**They are different components with different lengths, bores and ends.** The
game having one is a simplification, not an error — but it is now a known one.

### 9.11 The pilot / pipe pairing in `data.js` is one size light

Published pairings: a **311 mm pilot runs with 286 mm pipe** (two machines
independently), a 279 mm pilot with 254 mm pipe, a 349 mm pilot with 327 mm.
`data.js` pairs **`rb-pilot-bit-311` with `rb-stem-254`**, which is the 279 mm
pilot's pipe under a 311 mm bit. Harmless to play and invisible in the model
(the pipe is a cylinder either way), but recorded so nobody "confirms" it later.
**`blender/raisebore.py` follows data.js**, because data.js is the content
authority, and says so on the line.

### 9.12 `rb-reamer-1800-hd` claims twenty-two cutters. The published count is ten.

`data.js`: *"Ventilation-shaft sized. **Twenty-two cutters**, each one
replaceable underground…"* Against the manufacturer's own integral-head table,
now recovered in full:

| head Ø | 1 060 | 1 420 | 1 524 | **1 829** | 2 134 | 2 440 | 2 749 | 3 094 |
|---|---|---|---|---|---|---|---|---|
| cutters | 4 | 6 | 8 | **10** | 12 | 14 | 14 | 16 |

**Twenty-two cutters is the count for a ~4 000 mm head**, not an 1 800 mm one.
This is a worse error than §9.1's formula — the formula is 30 % out, this
description is **120 % out** — and it is player-visible prose. Two independent
makers' tables agree on 10 at 1 829 mm. (Not edited: `data.js` is not this
document's or this modeller's file.)

### 9.13 The game has no raise-bore chamber at all

`src/core/env.js` `UNDERGROUND{}` is keyed by METHOD id and contains exactly
three entries — `tunnel-jumbo`, `longhole`, `rockbolt`. **There is no
`raise-boring` entry**, so `terrain.js`'s `ugSpec = UNDERGROUND[methodId]`
resolves to `null` for this method even though `data.js` correctly declares
`archetypes: ['underground-drive']`. The machine's own scene — the one
`research/03` §F.1.5 calls one of "two unique surface scenes… and switching
between them is the drama" — **does not exist yet**.

It also means nothing in the game bounds this machine's height. The two
authored production drives give 5.0 m and 5.4 m of headroom; the sources say
raise borers "require higher than normal overhead space" and that the chamber
is drilled and blasted specifically for them. **`blender/raisebore.py` is built
to 5.100 m**, the published extended height of the two real machines in its
class, which stands in either drive with room to rig.

---

## 10. The Blender model — `blender/raisebore.py`

Built this session against the sources above. What it asserts, so that a future
reader can check it rather than trust it:

| | Model | Source |
|---|---|---|
| Derrick height | **5.100 m** (measured off the export) | 5 190 and 5 160 mm on the two published machines carrying a 311 mm pilot |
| Frame W × D | **1.950 × 2.000 m** | 1 740–1 980 × 1 900–1 940 mm |
| Width over pipe loader | **3.178 m** | 3 010 and 3 120 mm published |
| Base beams | **400 mm** | "plus 400 mm beams if required" |
| Stroke | **1.710 m** | published stroke of the two low-profile machines |
| Guide columns | **2, round, Ø240 mm** | "two parallel guide columns"; Ø [NS] |
| Thrust cylinders | **3, triangular, Ø230 bore / Ø140 rod, telescopic** | 3 cylinders at 4 500 kN; "triangularly arranged"; "telescopic" |
| Motors | **4 units around the centre**, planetary reducers | "multiple identical motor gear units arranged around the center" |
| Anchors | **8 × M56** | DERIVED from 4 200 kN pull; schedule is [NS] everywhere |
| Draw calls / triangles | **21 / 36 880** | budget is ≤ 70 |

**What it deliberately does NOT have**, each an absence with a reason:
no reamer head (a separate object, down the hole, built by `tools.js`); no
handrails, walkways or ladders (§8-NEW.4); no cab, tracks, boom or carousel;
and no opening worktable (the larger machines in this class have none).

**Two things it gets from the method rather than from a sheet**, with the
arithmetic shown in the file: the feed stroke must exceed one 1.5 m pipe or the
machine cannot make hole, which is what sets the derrick height; and the
cylinders stand rod-up so the full bore reams, which is what makes pull exceed
thrust (§3f).

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

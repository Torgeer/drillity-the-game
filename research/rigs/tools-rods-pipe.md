# tools-rods-pipe — Drill rods, drill pipe, shank adapters, couplings, thread systems

**status: in progress** (written early per workflow rule; findings appended as sources are read)

Engineering reference for modelling. Every figure below is cited to a file + page or a URL.
Where a number is not sourced it is listed in §8 NOT SOURCED, never invented.

> **NAMING RULE (DOMAIN.md §10).** Everything here is GEOMETRY and MATERIAL research.
> The manufacturer names and model designations quoted below (Epiroc, Sandvik, Mincon,
> Eurodrill, Boart, Atlas Copco, Numa, Halco, TEI, Bauer, Klemm, etc.) exist in this
> document ONLY to cite the source of a dimension. **Do not put any of them on a mesh,
> a decal, a badge, a rolled-in pipe stencil or an item name in the game.** Rope-thread
> family codes (R32, T38, T45, T51, GT60), API pin/box sizes (2 3/8" REG, 3 1/2" REG),
> wireline letter sizes (BQ/NQ/HQ/PQ) and API pipe grades (E75, X95, G105, S135) are
> *industry standards*, not trademarks, and are safe to show stencilled or stamped.

---

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\114-3mm_Drill-Rod-Pin-End_3-Start-Cylindrical-RH_L200.pdf` | 1–2 (all) | **The single most valuable source in the whole set.** A full dimensioned axial section of a 114.3 mm drill-rod PIN END, plus a complete z-vs-diameter profile table explicitly headed "re-model the part directly from this". Gives thread major/minor, lead, starts, hand, profile radius, nose, chamfer, weld-on spigot. Reconstructed from photo IMG_7906. | **Yes — primary** |
| `IMG_7905.HEIC` (viewed as `…\scratchpad\IMG_7905.jpg`) | whole | **The mating BOX of that same connection**, dimensioned, on the CAD tab literally headed `114,3 3gg zyl`. Box thread Ø103.4 +0.2 / Ø99.4 +0.2, mouth counterbore Ø104.4, thread depth 118, bore depth 128, overall 200, and the same Ø114.3 × 27 weld spigot at the far end. Transcribed in §1.2. | **Yes — primary** |
| `IMG_7904.HEIC` (viewed as `…\scratchpad\IMG_7904.jpg`) | whole | Four half-sections of an **88.9 mm connection annotated `88,9 zyl re 1 gg`** — cylindrical, right-hand, **ONE start** — with `SW80 2-Flächen` (two wrench flats, 80 across), Ø94 body, 175 long. The counter-example that proves multi-start is a size-dependent choice, not a house style. | **Yes — primary** |
| `IMG_7907.HEIC` (viewed as `…\scratchpad\IMG_7907.jpg`) | whole | A dimensioned half-section labelled **`API 4 1/2`**: overall 215, tool-joint OD Ø139.7, tube OD Ø115–117.5, bore Ø72.43, and the long concave shoulder fillet. Gives the tool-joint-proud ratio in §3. The thread teeth themselves are **not** drawn. | **Yes — primary** |
| `C:\Users\henri\Downloads\HP_Casing_Thread_Drawing.pdf` | 1 (all) | The casing connection as a family: **3-start ROUND thread, LEFT-hand, lead 33.867 mm, pitch 11.289 mm, R5 rounded root**, identical on Ø101.6 / 133 / 152.4 / 180; only tooth depth (2.0–2.5) and flat width (2.66–3.289) change. ⚠ carries a company address and internal drawing numbers — **geometry only**. | **Yes — primary** |
| `C:\Users\henri\Downloads\Top_Hammer_Tools.pdf` | 9–10, 27, 32–33, 35, 45, 49, 53, 62, 65 | The **rod length ladder** and the **coupling-sleeve ladder** as sold, in two rod families; the product-code grammar that names every rod type; and — pp. 62–77 — **dimensioned shank-adapter elevations with spline-band length, spline OD, body OD and flushing-bore Ø for ~40 drifter models.** The best shank-adapter source anywhere in the library. | **Yes — primary** |
| `C:\Users\henri\Downloads\top-hammer-drilling-tools-broshure-english.pdf` | 9, 12–13, 52, 56, 58, 74, 98 | Independent confirmation of the length ladder; rod body Ø, **female-end OD** and flushing-hole Ø per thread; guide tubes and pilot tubes; the MF-vs-coupling stiffness claim; carburising vs induction hardening; internal-vs-external shank flushing; and the §6 wear/handling text (thread grease, bent steels, straightening press, wear gauges). | **Yes — primary** |
| `C:\Users\henri\Downloads\Diamond Driller's Technical Book.pdf` | 25–26 (printed 47–51) | The **wireline family**: OD/ID/weight for A/B/N/H/P standard and thin-wall rods, conventional AWJ/BWJ/NWJ rods, **flush-joint casing** AW→PW, and the minimum make-up torque ladder 340 → 1000 Nm. Weights quoted **per 3 m**, which fixes the wireline rod length. | **Yes — primary** |
| `C:\Users\henri\Downloads\Epiroc Guide Protecting and Handling your Drill Rods.pdf` | whole (12 pp.) | **The best §6 source in the library**, and it is entirely about damage: galling, stripped threads, stabbing, dents, leaking rods, thread compound practice ("at least 50 % zinc", applied "like a coat of paint"), and — the finding that matters most — an explicit statement that **a double-start rod thread exists and why**. | **Yes — primary** |
| `C:\Users\henri\Downloads\EURODRILL_DRILLING_ACCESSORIES_BOHRZUBEHOER_2025_26.pdf` | 20–22 (also 3–15 skimmed) | Double-head (duplex) drilling as an exploded assembly: **inner rod (`Innengestänge`) and outer casing (`Außengestänge`) as two separately driven strings**; shank-adaptor threads **H64 / H90 / H92 all LH**; inner-rod wear parts on Ø76.1 / 88.9 / 114.3 with a footnote reading *"conical left hand thread / kegeliges Linksgewinde"*; and the casing rod-head-flange OD ladder Ø89 → Ø219. | **Yes — primary** |
| `C:\Users\henri\Downloads\Epiroc DTH product catalog.pdf` | **30–35** (not 30–33; 34–35 are the "standard style" group), plus 27, 37–38 | The DTH drill-pipe ladder: **OD × wall × length shoulder-to-shoulder × wrench-flats-across**, by rig design group. Carries the construction sentence verified and quoted in §4.2, and the catalogued thread-grease sizes. | **Yes — primary** |
| `C:\Users\henri\Downloads\Mincon_2024-Drill-Pipes_A4_low-res.pdf` | 6, 7, 9, 12, 13 | **p. 13 is a complete OD → thread-designation matrix, 42 mm to 305 mm** — the best single answer to "which thread goes on which pipe". p. 9 gives the shoulder-to-shoulder length RANGE per rig family. p. 7 is a high-resolution close-up that locates the **weld band** and shows blue plastic thread protectors. | **Yes — primary** |
| `C:\Users\henri\Downloads\Drill_Pipe_Catalogue.pdf` | 1–12 (251 rows) | The widest OD ladder (38 → 406 mm) and a very wide length ladder, plus **the only dimensioned pipe schematic in the drill-pipe set** — which turns out to letter three dimensions it never tabulates (§8). | Partly |
| `C:\Users\henri\Downloads\Mincon-Rotary-Product-Catalog-Condensed-Version.pdf` | 4 | Large rotary blast-hole pipe: OD × wall in inches against BECO connection size, "lengths to 50 feet measured shoulder to shoulder", and **the only drawing of helical hard banding** in the library. | **Yes — primary** |
| `C:\Users\henri\Downloads\perforator_drill_pipes_22.pdf` | 2–4 | Brochure, no dimension tables, but three useful statements: friction-welded **up to 219 mm OD**; "friction welded **and integrally forged**" HDD pipe; and — on a *different* product line — the oil-and-gas **upset types EU / IU / IEU** with API grades E75 / X95 / G105 / S135. | Partly |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\tools.js` | `THREAD_SPECS`, `ROD_SPECS`, `threadGeometry`, `addPinThread`, `addBoxThread`, `buildDrillRod`, `buildCouplingSleeve`, `buildShankAdapter`, `buildRCDualWallPipe` | The current game model, read **read-only** and compared in §9. | Yes (as the subject) |
| `C:\Users\henri\Downloads\drillity-the-game\research\rigs\_photos.md` | `tools-rods-pipe` section, §3–§4 | The photograph index: which frames exist, what is in them, and which carry branding. Everything in §7 is cited through it. | **Yes — primary** |

---

### 1.1 — MEASURED GEOMETRY: 114.3 mm drill-rod pin end (the money source)

Source: `114-3mm_Drill-Rod-Pin-End_3-Start-Cylindrical-RH_L200.pdf` p.1 (section A–A) and p.2
(§1 dimension schedule, §2 connection data, §4 reconstructed profile). Original German
annotation `114,3 zyl rechts 3gg / R4 Steigung 33,87`. All mm.

**Profile — lathe this literally (z measured from the LEFT / weld end face):**

| z (outer) | Outer Ø | | z (bore) | Bore Ø |
|---|---|---|---|---|
| 0 | 114.3 | | 0 | 89.3 |
| 27 | 114.3 | | 25 | 89.3 |
| 27 | 116 | | 27 | 88 |
| 73 | 116 | | 200 | 88 |
| 73 | 103 (thread crest) | | | |
| 172.5 | 103 | | | |
| 175 | 98 (plain guide nose) | | | |
| 199 | 98 | | | |
| 200 | 96 (1 mm end chamfer) | | | |

**Thread data (p.2 §2):**
- Cylindrical / **parallel**, NOT tapered. This matters — the game's `threadGeometry()`
  sweeps a constant-radius helix, which is correct for THIS thread, and would be wrong
  for an API tapered pin.
- **Right-hand, 3-START.** Lead (Steigung) 33.87 mm = 3 × 11.29 mm pitch. A 3-start
  thread shows **three** helices running side by side — visually three times as coarse
  as the pitch alone suggests. The game draws a single-start helix everywhere.
- Round "rope" profile, **R4** = 4 mm crest/root radius, i.e. a full-round tooth, not a V.
- Major (crest) Ø103 −0.2; minor (root) Ø99 −0.2. **Radial thread depth = (103−99)/2 = 2.0 mm.**
  Ratio: depth / major = 2.0/103 ≈ 0.019. Very shallow relative to the tube — a rope
  thread on a big rod is a shallow rounded corduroy, not a deep screw.
- Threaded length 73 → 172.5 = **99.5 mm**, i.e. ≈ 2.94 leads / ≈ 8.8 pitches.
  Threaded-length : major-dia ratio ≈ 0.97 : 1.
- Thread ends at z=172.5 in a **2.5 × 45°** chamfer down to the plain Ø98 nose.

**Key modelling ratios from this drawing:**
- Tube wall on the body: (116 − 88)/2 = **14 mm** wall.
- The pin's threaded crest (Ø103) is *smaller* than the body OD (Ø116) — the pin is a
  **reduced-diameter spigot**, so a made-up joint has a visible shoulder step, not a
  flush cylinder. Crest/body = 103/116 = 0.888.
- The Ø114.3 × 27 mm section at z 0–27 is a **weld-on spigot**: this pin end is a
  separate forging welded to a 114.3 mm tube. Expect a **circumferential weld bead at
  z≈27** on the finished rod, where the OD steps 114.3 → 116.
- Plain guide nose Ø98 × 25 mm ahead of the thread — it stabs and aligns before any
  thread engages. **The game has no guide nose on any rod.**

---

### 1.2 — MEASURED GEOMETRY: the mating BOX of that same 114.3 mm connection

Source: `IMG_7905.HEIC`, viewed as
`…\scratchpad\IMG_7905.jpg`. A photograph of a CAD screen whose open tab is
labelled `114,3 3gg zyl`, carrying the same drawing note as §1.1 —
`114.3 zyl rechts 3gg / R4 Steigung 33.87`. This is the **box (female) half** of
the connection §1.1 measures the pin of, so the two together give a complete,
measured, made-up joint. All mm; z from the box MOUTH.

| Feature | Value | Note |
|---|---|---|
| Overall length | **200** | identical to the pin — a matched pair of 200 mm forgings |
| Mouth counterbore Ø | **104.4** | plain, ahead of the first thread |
| Counterbore / lead-in depth | **10**, with a second step at **12.5** | this is the dark ring you see looking into a box |
| Box thread major Ø | **103.4 +0.2** | pin crest is Ø103 −0.2 → ~0.4–0.8 mm diametral clearance |
| Box thread minor Ø | **99.4 +0.2** | pin root is Ø99 −0.2 → same clearance |
| Box thread length | **118** | |
| Bore depth to the internal shoulder | **128** | |
| Through bore Ø | **88** | matches the pin bore exactly |
| Bore Ø at the weld end | **89.3** over the last 25 mm | matches the pin's 89.3 × 25 counterbore |
| Weld-on spigot | **Ø114.3 × 27** at the far end | matches the pin exactly |
| Body OD | **116** | matches the pin |

**Three things fall straight out of putting §1.1 and §1.2 side by side, and all
three are directly modellable:**

1. **The box is cut deeper than the pin is long.** Pin thread 99.5 mm, box thread
   118 mm, box bore 128 mm. The pin **never bottoms** — it lands on a shoulder
   with ~18 mm of empty thread ahead of its nose. A made-up joint is therefore
   *shoulder-sealed*, and the last thread of the box is always clean and unworn.
2. **A made-up joint of two 200 mm halves is 400 mm long and steps
   114.3 → 116 → 116 → 114.3.** Two circumferential weld beads, 400 mm apart,
   with a plain Ø116 barrel between them. That barrel is the visible "joint" on
   a finished rod — it is *fatter* than the tube, not flush and not a sleeve.
3. **Thread clearance is 0.4–0.8 mm on diameter** against a 2.0 mm radial thread
   depth — i.e. about a fifth of the tooth. Grease lives in that gap (§6).

---

## 2. What the tool family IS

`tools-rods-pipe` is the **drill string**: every part between the thing that
turns or hits, and the thing that cuts. It is the only tool family the player
sees *repeatedly*, because a hole is drilled one rod at a time and every rod is
added, made up, drilled down, broken out and racked. Get the rod wrong and the
whole game looks wrong, over and over.

It is not one object. It is **five families that look nothing like each other**,
and the single biggest domain error available is to draw them all as the same
threaded stick:

1. **Top-hammer rods** — solid or thick-walled round or hexagonal steel bar,
   32–60 mm across, 1.2–6.1 m long, with a small flushing hole down the middle
   and a **shallow, coarse, fully rounded "rope" thread** at each end. Percussion
   goes through them as a stress wave, so every feature is about transmitting a
   blow without a stress raiser. Two sub-types: **MM** (male both ends, joined by
   a separate **coupling sleeve** that stands proud) and **MF** (male one end,
   an integral **female collar** at the other, so the joint is part of the rod).
2. **DTH / rotary drill pipe** — a welded tube with a heavier **tool joint**
   forged or friction-welded onto each end, carrying a **tapered, single-start,
   V-form API rotary-shouldered thread**. Torque and thrust only, no percussion —
   the hammer is at the bottom of the hole. The tool joint stands visibly proud
   of the tube.
3. **Dual-wall / duplex pipe** — two concentric tubes. In **RC** the annulus
   between them carries air *down* and the inner tube carries the sample *up*, so
   the cuttings never touch the borehole wall. In **overburden duplex** the same
   idea is split into two *separately driven strings*: an **inner rod**
   (`Innengestänge`) turning inside an **outer casing** (`Außengestänge`), each
   with its own rotary head on the mast
   (`EURODRILL_DRILLING_ACCESSORIES…_2025_26.pdf` pp. 20–22).
4. **Wireline core rods** — thin-walled, **flush-jointed** tube: the joint has the
   same outside diameter as the tube, because an overshot and an inner-tube
   assembly have to be dropped and pumped down the bore. A wireline rod is
   essentially a smooth pipe with a faint seam every 3 m.
5. **Casing** — the tube that keeps the hole open, with its own thread family
   (§3.6) and its own crowns and shoes (covered by `tools-overburden.md`).

Bridging all five: **shank adapters** (the part the hammer piston actually
strikes, splined so the rotation chuck can turn it), **couplings and crossover
couplings** (which join one thread family to another), **guide tubes and pilot
tubes** (over-diameter tubes that steady the string near the bit), and
**adapters, wrenches, thread grease and wear gauges** — the consumables around
the string.

**The one distinction that matters most for the game.** A **rope thread**
(R/T/GT, and the big 3-start round threads of §1.1/§1.2) is **parallel** — a
constant-diameter cylinder wrapped in a shallow rounded corduroy. An **API
rotary-shouldered thread** (REG/NC, on DTH and rotary pipe, and on wireline rods
at a gentler rate) is **tapered** — a short stubby cone with a sharper V tooth,
ending against a hard shoulder. They are not variants of one another; they look
completely different, and which one goes on which tool is fixed (§3.5).

---

## 3. Proportions — real dimensions with source

> Every number in §3 is copied from a catalogue table or a dimensioned drawing.
> Where a family has no published table it says so and appears again in §8.

### 3.1 The rod LENGTH ladder — what is actually sold

This is the answer to the `rodLength` divergence recorded in `HANDOFF.md` §9.1
and `crawler-th.md` W14 (`rigFactory.js` `rodLen = 3.05` against `data.js`
`rodLength: 3.66`). **Both numbers are real, standard, adjacent rungs of the same
ladder.** Neither is wrong; they are 10 ft and 12 ft.

The ladder is **imperial**, quoted in mm, and it is the same in two independent
catalogues:

| ft | mm | Appears as |
|---|---|---|
| 4' | **1220** | MF rods, T38 and T45 |
| 5' | **1525** | MF rods, R32 / T38 / T45 / T51 |
| 6' | **1830** | MF rods, R32 / T38 / T45 / T51 |
| 8' | **2440** | MF rods, R32 |
| 10' | **3050** | MM and MF, every thread |
| 12' | **3660** (a second catalogue prints 3665) | MM and MF, every thread — the commonest single length |
| 14' | **4270** / 4265 | MM and MF, T38 / T45 / T51 / GT60 |
| 16' | **4880** | MM, T38 / T45 / T51 |
| 18' | **5490** | MM, T38 |
| 20' | **6100** / 6095 | MM T51; MF T45 / T51 / GT60 |

Sources: `Top_Hammer_Tools.pdf` p. 33 (R32 MF 1525/1830/2440/3050/3660),
p. 45 (T38 MM 3050/3660/4270/4880/5490; T38 MF 1220/1525/1830/3050/3660/4270),
p. 49 (T45 MM 3050/3660/4270/4880; T45 MF 1220/1525/1830/3050/3660/4270/6100),
p. 53 (T51 MM 3660/4880/6100; T51 MF 1525/1830/3660/4270/6100);
`top-hammer-drilling-tools-broshure-english.pdf` p. 52 (T38 3050/3660/4265),
p. 56 (T51 MF 3660/4265/6095; T51 MM 3050/3660/4265), p. 58 (GT60 MF
3660/4265/6095).

**Hexagonal drifter rods are the exception and are about 50 mm longer**, because
the quoted length includes the shank-end thread: **3100 / 3700 / 4310 / 4920 /
5530 mm**, printed as 10'2" / 12'2" / 14'2" / 16'2" / 18'2"
(`Top_Hammer_Tools.pdf` pp. 32, 35, 39). If the game ever shows a drifter rod
beside an extension rod, the drifter rod is the slightly longer one.

**Wireline rods are metric-3 m**, not imperial: the whole rod table is quoted as
**kg / 3 m** (`Diamond Driller's Technical Book.pdf` p. 26). 3.0 m is the
wireline rung.

### 3.2 Top-hammer rod bodies, bores and collars

| Thread | Extension (MM) rod body Ø | MF rod body Ø | Flushing hole Ø | MF female-end OD | Source |
|---|---|---|---|---|---|
| T38 | **39** round (also **32** hex, the "light" rod) | **39** | **14.5** (9.6 on the hex-32 light rod) | **56** | brochure p. 52 |
| T51 | **46** | **52** | **21.5** | **71** | brochure p. 56 |
| GT60 | — | **60** (a heavier variant at **64**) | **22.5** (25 on the Ø64) | **85** (82 on one variant) | brochure p. 58 |

Two things a modeller must not miss:

- **The MF rod's body is fatter than the MM rod's of the same thread** — Ø52
  against Ø46 on T51. An MF rod carries its own coupling, so it is a heavier
  section all the way down.
- **The female collar is a big step**: T38 39 to 56 (**1.44 x**), T51 52 to 71
  (**1.37 x**), GT60 60 to 85 (**1.42 x**). That collar is the feature that
  identifies an MF rod at any distance.

Also on the extension rod: a **wrench flat of 32 mm across** on the T38 round-39
rod (brochure p. 52) — flats milled to 82 % of the body diameter.

### 3.3 Coupling sleeves — where the string stands proud

| Thread | Coupling OD | Length | OD / rod body | Source |
|---|---|---|---|---|
| R28 | **41** | **160** | — | `Top_Hammer_Tools.pdf` p. 27 |
| R32 | **45** | **150** | 45/32 = 1.41 | ibid. pp. 27, 33 |
| R38 | **54** | **170** | 54/38 = 1.42 | ibid. p. 33 |
| T38 | **55** | **190** (a second catalogue prints **191**) | 55/39 = 1.41 | ibid. pp. 35, 45; brochure p. 52 |
| T45 | **63** | **210**; heavy variant **66 x 210**; long variant **63 x 230** | 63/45 = 1.40 | ibid. p. 49 |
| T51 | **72** | **235**; heavy **77 x 235**; long **72 x 250** | 72/46 = 1.57 on the MM rod | ibid. p. 53 |

**Crossover couplings** — one thread at each end, and visibly *longer* than a
plain coupling because two different threads have to fit inside:
R32/R28 **45 x 171**, R32/R25 **45 x 175** (p. 33), T38/R32 **54 x 188**,
T38/R38 **54 x 195** (p. 45), T51/T45 **72 x —** (p. 53, length cropped). A
crossover is the part that tells the eye "the string changes size here".

### 3.4 Shank adapters — measured, across ~40 drifter models

`Top_Hammer_Tools.pdf` pp. 62 and 65 print a dimensioned side elevation plus an
end view for every shank adapter, and this is the best shank-adapter source in
the library. Read the elevations left to right: **thread → stepped taper → long
plain body (with a small milled flat or oval recess in the flank) → collar step →
SPLINE BAND → flat striking face.**

| Drifter class (citation only) | Overall L | Body Ø | Spline band L | Spline Ø | Flush bore Ø | Thread | Mass kg |
|---|---|---|---|---|---|---|---|
| BBC 54 / BBC 120 | 380–390 | 38 | **32** | 57 | 10 (tube) | R32 / R38 / T38 | 3.1–3.3 |
| BBE 57 | 447–550 | 44.4 | **80** | 64.4 | 14 (tube) | R38 / T38 / T45 | 5.0–6.2 |
| COP 125 / 130 / 131 | 380 | 38.7 | **32** | 52 | 14 | R32 / T38 | 2.7–2.9 |
| COP 131EB | 406 | 38.3 | **29** | 58.3 | 14 | T38 | 3.3 |
| COP 1028 | 400 | 45 | **58.9** | 33 | separate | R28 / R32 | 1.4–2.8 |
| COP 2160EX / 2560EX | 770 | 60 (step 63) | **132** | 61.2 | 6.6 | T45 / T51 / GT60 | 13.1–14.3 |
| COP 3038 / 4038 | **435** | 45.05 | **84.5** | 53.3 | 9.6 | T38 / T45 | 4.7–5.0 |
| COP 3060MEX | 840 | 60 | **145** | 75 | 6.2 | T51 | 15.8 |
| COP 4050(L) | 605 | 52 | **108** | 67.9 | 11.3 | T51 | 9.3 |
| COP 4050EX | 790 | 70 | **112** | 67.9 | 11.3 | T51 | 14.8 |
| COP 4050EX (Spiral) | 790 | 52 to 70 | **113** | 67.8 | 6.8 | T51 | 15.0 |
| COP 4050MUX | 835 | 90 | **112** | 67.9 | 11.3 | WD58 / WD68 | 26.0–27.1 |

(`Top_Hammer_Tools.pdf` pp. 62, 65. The 435 mm row is exactly the length the game
already uses as its default.)

- **The spline band is short.** L_spline / L_total runs **0.07 to 0.19** across
  every row above, median about **0.15**. It is never a third of the tool and
  never half.
- **The spline diameter sits close to the body diameter**, sometimes over
  (Ø53.3 on a Ø45 body = 1.18 x), sometimes under (Ø67.9 on a Ø90 body =
  0.75 x). There is no dramatic step.
- **The end views show roughly 10–14 splines**, drawn as a rounded gear-tooth
  star with a small central flushing hole.
- **One catalogued variant has HELICAL splines** — the row headed "(Spiral)",
  drawn as a diagonal corduroy instead of an axial one. Everything else is
  straight-splined.
- The **flushing bore is small**: 6.2–14 mm on tools 38–90 mm across, so a bore
  of only **0.10–0.25 x body Ø**. A shank adapter is nearly solid steel.
- A second catalogue (`…broshure-english.pdf` pp. 76–92) lists shank adapters for
  a different set of drifters, **235 mm (an R23 tool) to 835 mm (an ST68 tool)
  overall**, confirming the same length band independently. It gives overall
  length and thread only — **no diameters and no spline dimensions**.

### 3.5 Wireline core rods and flush-joint casing

`Diamond Driller's Technical Book.pdf` p. 26 (printed pp. 50–51). Weights are
**per 3 m**, which is how the wireline length ladder is fixed.

| Size group | OD | ID | Wall (derived) | kg / 3 m | Min. make-up torque |
|---|---|---|---|---|---|
| A (AOTW, ATT) | **44.5** | 34.9 | 4.80 | 13.9 | **340 Nm** (250 ft-lb) |
| B (BO, BT, BMO, BTT) | **55.6** | 46.0 | 4.80 | 17.9 | **400 Nm** (300) |
| N (NO, NT, MNO, NTW) | **69.9** | 60.3 | 4.80 | 22.9 | **600 Nm** (450) |
| H (HO, HT, HMO) | **88.9** | 77.8 | 5.55 | 34.2 | **1000 Nm** (750) |
| P (PT, PMO) | **114.3** | 101.6 | 6.35 | 56.0 | **1000 Nm** (750) |
| A thin-wall (ATT / AOTW) | 44.5 | **36.8** | 3.85 | 11.8 | — |
| B thin-wall (BTT / BOTW) | 56.5 | **48.8** | 3.85 | 15.3 | — |

Conventional (non-wireline) rods, same page: **AWJ 44.5 / 34.9**, **BWJ 55.6 /
46.0**, **NWJ 66.7 / 60.3**.

**Flush joint casing**, same page — and note the name: the joint is flush, there
is no coupling to model. **AW 57.1 / 48.4 · BW 73.0 / 60.3 · NW 88.9 / 76.2 ·
HW 114.3 / 101.6 · PW 139.7 / 127.0.**

Modelling consequence: **a wireline rod is a thin tube.** Wall / OD runs
**0.108 (A) down to 0.056 (P)**; ID / OD runs **0.78 to 0.89**. Looking into the
end of one you see a *thin* ring of steel, not the thick annulus of a percussive
rod. Compare the 114.3 mm percussive rod of §1.1: Ø116 over a Ø88 bore is a
**14 mm wall**, ID/OD 0.76 — about twice the wall of a P-size wireline rod of
almost the same outside diameter.

The same page carries the make-up instruction, worth having verbatim because it
explains why a rod wrench is always somewhere in frame: *"the joint will NOT make
itself up during normal drilling operation and must be pre-loaded manually with
adequate wrench sizes or mechanically with equipment."*

### 3.6 The thread families, and which tool wears which

| Family | Form | Parallel or tapered? | Starts | Hand | Where it goes | Source |
|---|---|---|---|---|---|---|
| **Rope R** (R25–R51) | fully rounded | **parallel** | 1 | RH | small top-hammer rods, bit ends, anchor bar | ISO 10208 via the `THREAD_SPECS` header comment in `tools.js`; sizes corroborated `Top_Hammer_Tools.pdf` p. 27 |
| **Rope T / GT** (T38–GT60) | trapezoid, rounded roots | **parallel** | 1 | RH | bench and longhole top-hammer rods | `…broshure-english.pdf` pp. 47–58 |
| **Big 3-start round** (Ø114.3 rod) | R4 round | **parallel** (`zyl`) | **3** | **RH** (`rechts`) | large percussive drill rod, welded pin and box | §1.1, §1.2 |
| **Big 3-start round** (casing) | R5 round | starts, lead and root stated; taper **NOT SOURCED** | **3** | **LH** | casing connections Ø101.6 / 133 / 152.4 / 180 | `HP_Casing_Thread_Drawing.pdf` |
| **Single-start round** (Ø88.9) | round | **parallel** (`zyl`) | **1** | **RH** (`re`) | 88.9 mm sub, 175 long, SW80 flats | `IMG_7904` |
| **API REG / NC** | 30° V, rounded roots | **TAPERED** — REG 3 in/ft = 1:4, NC 2 in/ft = 1:6 | 1 | RH | DTH and rotary drill pipe, hammer backheads | API Spec 7 Tables 25/26 via the `tools.js` header comment; envelope corroborated by `IMG_7907` |
| **Wireline Q-series** | — | **tapered** | 1, and a **2-start** variant exists (below) | RH | wireline core rods | `tools.js` header comment citing the Technical Book pp. 47–50; the 2-start from the Epiroc rod-handling guide p. 5 |
| **Duplex inner rod and its shank adaptor** (H64, H90, H92; KW76, EW90) | — | *"conical"* = **TAPERED** | NOT SOURCED | **LH** | overburden duplex inner string | `EURODRILL…2025_26.pdf` p. 20, footnote *"conical left hand thread / kegeliges Linksgewinde"*, and the shank-adaptor column headed `H64 LH / H90 LH / H92 LH` |

**Multi-start threads — how common, and on what.** Four data points, three of
them measured off dimensioned drawings:

1. **Ø114.3 percussive rod: 3-start, right-hand**, lead 33.87 = 3 x 11.29 (§1.1,
   §1.2).
2. **Casing connections Ø101.6 through Ø180: 3-start, left-hand**, lead 33.867 =
   3 x 11.289 — *the identical lead and pitch to the rod above*, with an R5 root
   instead of R4, and tooth depth 2.0 mm on Ø101.6 and Ø133, 2.2 on Ø180, 2.5 on
   Ø152.4 (`HP_Casing_Thread_Drawing.pdf`).
3. **Ø88.9 sub: ONE start, right-hand** (`IMG_7904`, annotated `1 gg`).
4. A **two-start wireline rod thread**, described in
   `Epiroc Guide Protecting and Handling your Drill Rods.pdf` p. 5 in exactly the
   terms a modeller needs: *"a double-start thread … has two leading edges that
   catch the thread, with one 180 degrees across from the other. This makes the
   connection easier to find, requires only half a revolution and reduces
   cross-threading."*

So the picture is neither "everything is multi-start" nor "multi-start is
exotic". It is: **small percussive and rotary threads are single-start; the big
overburden- and casing-scale round threads are 3-start; a 2-start exists as a
deliberate quick-stab option on wireline rods; and wherever a 3-start appears
here its lead is about 33.87 mm regardless of diameter.**

The **hand switches between the two strings of a duplex system** — the rod above
is right-hand, the casing thread that runs outside it is left-hand, and the
duplex shank adaptors and inner-rod wear parts are left-hand too (`EURODRILL`
p. 20). *That the hands differ is sourced, on two drawings and one catalogue.
Why they differ — so that one string cannot unscrew the other — is engineering
inference and is flagged as such.*

### 3.7 The API tool joint — how far it stands proud

`IMG_7907`, a dimensioned half-section labelled **`API 4 1/2`**:

| Feature | Value |
|---|---|
| Overall length of the joint drawn | **215** |
| Tool-joint OD | **Ø139.7** (exactly 5 1/2 in) |
| Tube OD at the upset | **Ø115 / Ø117.5** (4 1/2 in nominal = 114.3) |
| Intermediate ODs | Ø119.7, Ø101.18, Ø92, Ø85.1, Ø80.5 |
| Bore through the joint | **Ø72.43** |
| Smaller bores at the pipe end | Ø63, Ø57 |
| Axial stations | 215 overall; 108 and 98 on the tube side; 50, 47, 18.06, 17.28 on the joint side; 70.68, 52.62, 38.86, 17.19 measured back from the joint face |

**Ratios a modeller can use straight off it:**

- **Tool-joint OD / pipe OD = 139.7 / 117.5 = 1.19.** An API tool joint stands
  about **a fifth proud** of the tube. It is emphatically not flush.
- **Bore / tool-joint OD = 72.43 / 139.7 = 0.52.** Half of the joint is steel.
- **The transition is a long concave S-fillet, not a step.** On the drawing the
  OD falls from Ø139.7 down to the tube over roughly 50 mm of smooth curve. That
  fillet is what an elevator grabs, and it is the most recognisable single
  silhouette on a rotary pipe end.
- ⚠ **The drawing does not draw the thread teeth at all** — it dimensions the
  envelope only. Thread form for API REG must come from the API Spec 7 figures
  already cited in `tools.js`.

### 3.8 The casing OD ladder

`EURODRILL…2025_26.pdf` p. 21 lists rod-head flanges — the outer-string sizes a
duplex head is built for: **Ø89 · Ø101 · Ø108 · Ø114 · Ø133 · Ø152 · Ø178 ·
Ø203 · Ø219 mm.** `HP_Casing_Thread_Drawing.pdf` covers **Ø101.6 · Ø133 ·
Ø152.4 · Ø180**. Inner-rod wear parts are listed for **Ø76.1 · Ø88.9 · Ø114.3**
(`EURODRILL` p. 20) — so a typical duplex pair is roughly **Ø88.9 inner rod
inside Ø133–152 casing**, which sets the annulus a modeller has to leave between
the two tubes.

### 3.9 DTH and rotary drill pipe — the OD, wall and length ladder

`Epiroc DTH product catalog.pdf` pp. 31–35 is the one place in the library that
tabulates **OD, wall thickness, shoulder-to-shoulder length and wrench flats
together**, grouped by rig design group. Wall thickness is also the last field of
the printed product code (`…-06` = 6 mm, `…-08` = 8 mm, `…-12` = 12 mm).

| OD mm | OD in | Wall thicknesses offered | Bore (derived, OD − 2t) |
|---|---|---|---|
| 51 | 2 | 5 | 41 |
| 63 | 2 1/2 | 5 | 53 |
| 70 | 2 3/4 | 4 | 62 |
| 76 | 3 | 4, 6 | 68, 64 |
| **89** | 3 1/2 | **4, 6, 8, 12** | 81, 77, 73, 65 |
| **102** | 4 | 6, 8, 12 | 90, 86, 78 |
| **114** | 4 1/2 | 4, 6, 8 | 106, 102, 98 |
| 127 | 5 | 6, 8 | 115, 111 |
| 140 | 5 1/2 | 8 | 124 |

Wider ODs exist without published walls: **42–406 mm**
(`Mincon_2024-Drill-Pipes_A4_low-res.pdf` p. 9), **35–300 mm, friction-welded up
to 219 mm OD** (`perforator_drill_pipes_22.pdf` p. 2), and 38 · 44 · 47 · 60 ·
73 · 105 · 168 · 177 · 178 · 194 · 219 · 273 · 305 · 324 · 406
(`Drill_Pipe_Catalogue.pdf` pp. 1–12).

Large rotary blast-hole pipe is quoted in inches, and this is the only place OD
and wall appear together at that size (`Mincon-Rotary…Condensed-Version.pdf`
p. 4): 7" × 0.750" and 1.000" → 4 1/2" / 5 1/4" BECO · 7 5/8" × 0.750"/1.000" →
5 1/4" BECO · 8 5/8" × 1.000"/1.250"/1.500" → 6" BECO · 9 1/4" × 1.000"/1.250" →
6" BECO · 10 3/4" and 11 3/4" × 1.250"/1.500" → 8" BECO. Same page: *"Lengths to
50 feet measured shoulder to shoulder."*

**The drill-pipe length ladder is NOT the rod ladder.** Where top-hammer rods are
an imperial foot ladder (§3.1), DTH pipe is mostly **metric-native and much
shorter at the small end**, and the two systems sit side by side in one
catalogue (`Epiroc DTH product catalog.pdf` pp. 31–35, column "Length s-s"):

- metric: **1.0 · 1.2 · 1.5 · 1.7 · 1.8 · 1.87 · 1.9 · 2.0 · 2.4 · 2.7 · 2.9 ·
  3.0 · 4.0 · 4.5 · 4.6 · 5.0 · 6.0 · 8.0 m**
- imperial: **6.10 m (20 ft) · 6.40 m · 7.62 m (25 ft) · 8.10 m · 9.14 m (30 ft)**

and by machine class: underground long-hole 1.50–2.00 m; crawler drills
1.5–8.0 m; the "standard style" group 1.0–6.1 m; large blast-hole rigs 6.10,
6.40, 7.62, 8.10, 9.14 m only. `Mincon` p. 9 gives the same picture as ranges
per rig family — **500 to 12,000 mm** across the whole catalogue, with
**RC pipe specifically 1,000–6,000 mm**.

**Weight is published per pipe, not per metre.** Derived gross kg/m for 6 m
pipes from `Epiroc` p. 33 — 76 × 6 wall: 10.9 · 89 × 6: 13.9 · 89 × 8: 21.2 ·
102 × 6: 17.6 · 102 × 8: 23.3 · 114 × 6: 19.2 · 114 × 8: 24.3 · 127 × 6: 23.8 ·
140 × 8: 33.4. The gap between these and a bare tube of the same section is the
mass of the two welded end pieces.

**Which thread goes on which pipe** — `Mincon_2024-Drill-Pipes` p. 13 is a full
OD → thread matrix. The entries that matter for a game string:

| Pipe OD | Threads catalogued |
|---|---|
| 42–57 | AWJ, BWJ, NC12/13/16, CA21, CR50, RD40-6 |
| 60–73 | BWJ, NWJ, CR60, NC16, RD50-6, TR51, Mayhew Jr |
| **76** | **2 3/8" API REG**, 2 3/8" DIBH, 2" Z, RD50-6 |
| **89** | **2 3/8" REG · 2 7/8" REG · 2 3/8" IF (NC26)**, 2 7/8" DIBH, 2 1/2" Z, RD70-4 |
| **102** | **2 7/8" REG**, 3 1/8" DIBH |
| **114** | **3 1/2" REG · 3 1/2" IF (NC38) · 3 1/2" FH · 2 7/8" IF (NC31)**, **BECO 3"**, NC35 |
| **127** | **3 1/2" REG · 3 1/2" IF · 3 1/2" FH**, **BECO 3 1/2** |
| 140 | **4 1/2" REG**, 4" FH (NC40), 4 1/8" DIBH, BECO 3 1/2 |
| 152–168 | 4" IF (NC46), 4 1/2" IF (NC50), 4 1/2" REG, 5 1/2" REG, BECO 4 |
| 177–235 | 5 1/2" FH/REG/IF, 6 5/8" REG/FH/IF, 7 5/8" REG, BECO 4 1/2 – 6 |
| 254–305 | 8 5/8" REG, BECO 8 |
| 89–304 (spanning the range, alongside the API sizes) | DR, ARD, Metzke, Remet, Matrix, Faber, CSR, RDX — **names only**, see §8 |

⚠ **The catalogues name these threads but never dimension them.** No taper rate,
no threads-per-inch, no thread length, no start count is printed anywhere in
these five files. That the API pins are **tapered and single-start** is read off
the photographs and the schematic cone on `Drill_Pipe_Catalogue.pdf` p. 1, not
from a table; the numeric thread form must still come from API Spec 7 as already
cited in `tools.js`. **BECO and the RD-series round threads are named only** —
see §8.

**Pin one end, box the other, on every row of every catalogue.**
`Mincon-Rotary` p. 4 labels the schematic *"Pin End Thread (Tool Joint) — Mid
Body — Box End Thread (Tool Joint)."* `Epiroc` p. 31 additionally splits some
groups into a **starter pipe** and **add-on** pipes.

**And — the finding that most changes how a pipe should be drawn — a DTH /
rotary drill pipe's tool joint is essentially FLUSH with the tube, not upset.**
Three independent photographs and schematics agree: the tool-joint shoulder runs
out into the tube at effectively the same radius, with a slight *neck in* at the
weld (`Epiroc` p. 30 photograph; `Mincon_2024-Drill-Pipes` p. 7 close-up, where
the painted tube is if anything marginally larger than the machined joint;
`Mincon-Rotary` p. 4 schematic). **Upsets belong to the oil-and-gas product
line**, where they are named explicitly as *"EU (external upset), IU (internal
upset) und IEU (internal external upset)"* to API Spec 5DP
(`perforator_drill_pipes_22.pdf` p. 4) — a different page, a different product,
and it must not be carried across. This is the opposite of the API 4 1/2 tool
joint of §3.7, which stands 1.19 × proud; that drawing is an oilfield joint.
**Two different worlds, two different silhouettes.**

⚠ Tool-joint OD as a number distinct from the tube OD is **NOT SOURCED** in any
drill-pipe catalogue here; "flush" is read from photographs.

### 3.10 Wrench flats, hard banding and where the weld sits on drill pipe

**Wrench flats — two, and the across-flats dimension is published.**
`Epiroc DTH product catalog.pdf` pp. 34–35, the "standard style, wrench flats
pin and box end" group, with a footnote on p. 31 that reads *"2 × 95 mm wrench
flats in BOX"* — so the count is **two**:

| Pipe OD | Flats across | Ratio flats / OD |
|---|---|---|
| 51 | 41 | 0.80 |
| 63 | 50 | 0.79 |
| 70 | 55 | 0.79 |
| 76 | 65 | 0.86 |
| 89 | 65 | 0.73 |
| 102 | 75 | 0.74 |
| 114 | 95 | 0.83 |
| 140 | 114 | 0.81 |

**Across-flats is consistently 0.73–0.86 × the pipe OD** — call it **0.80**. That
matches the top-hammer rod independently (32 across on a Ø39 body = 0.82,
brochure p. 52) and the 88.9 sub (SW80 on Ø94 = 0.85, `IMG_7904`). **One ratio
covers the whole family.**

But — and this is a silhouette decision, not a detail — **not every drill pipe
has flats at all**, and the same catalogue says so per rig group (pp. 31–33):

- **"No wrench flats"** on the entire crawler-drill group, OD 76 → 140 mm.
- **Flats on the PIN only**, plus a **separate HEXAGON** of 89 mm (on 102 OD) or
  102 mm (on 114 and 127 OD), on the large blast-hole group.
- **Flats on the BOX only** on one group.
- **No flats but a "circular grip"** of 57 / 70 / 83 mm on OD 76 / 89 / 102 on
  the underground long-hole group.
- Flats **both ends** on the standard-style and the mid-size groups.

So a rack of pipe for one rig is uniform, and a rack for a different rig looks
different — flats, hex, a plain turned grip band, or nothing.

**Helical hard banding.** `Mincon-Rotary…Condensed-Version.pdf` p. 4 both names
it (*"Helical Hard Banding (HHB)"*, offered as *"with or without helical hard
band wear protection"*) and **draws it**: roughly **three heavy diagonal bands
wrapping the BOX-end tool joint at about 30–40° to the axis**, spanning about
60 % of the tool-joint length, bracketed by paired circumferential grooves at
each end, with the wrench flat outboard of them. Hard facing is offered as an
option on DTH/rotary and HDD pipe too (`perforator_drill_pipes_22.pdf` pp. 2–3).
Band width, proud height, helix angle and count are **NOT SOURCED** as numbers.

**Where the weld is, and what it looks like.** From the high-resolution close-up
at `Mincon_2024-Drill-Pipes` p. 7, reading from the nose inward: bright machined
pin thread → bright shoulder → **a dark grey-black oxidised ring band with a
scaly circumferential texture and a small residual raised nub of flash** →
painted tube. So:

- The weld sits at the **inboard end of the tool joint, where the end piece meets
  the tube** — *not* at the shoulder and *not* mid-body.
- It is **slightly necked in** relative to the tube OD (the friction-weld flash
  is machined back, leaving one small nub).
- **The paint stops at that band.** The tool joint is bare; the tube is painted;
  the weld is the boundary. That single rule makes a game pipe read correctly
  from any distance.
- `Epiroc` p. 30 corroborates it as a **dark blue-black temper band immediately
  behind the pin shoulder** on every pipe in a stack, its axial extent roughly
  **0.25–0.4 × OD** by eye (photo-read, not a published dimension).

**Stabilisers and centralisers are separate string members, not features on the
pipe body.** Both `Mincon` p. 14 and `perforator` p. 2 list stabilisers, drill
collars, adaptor subs, fishing tools and breakout keys as *accessories*, and
`Epiroc` pp. 30–35 shows nothing on the pipe body at all. Treat a DTH pipe body
as **bare between its two joints**.

### 3.11 Ratios a modeller can use

Absolutes change with size; these do not.

- **Rope-thread radial depth is about 0.02 x the thread major diameter** (2.0 mm
  on Ø103, §1.1) and about **0.12 x the pitch**. A rope thread is a *shallow
  rounded corduroy*, not a screw. Cut it deep and it stops reading as a drill rod.
- **A 3-start thread's lead is 3 x its pitch**, so at the same tooth spacing it
  climbs three times as fast. Draw **three** helices, 120° apart.
- **The pin is a reduced-diameter spigot**: crest Ø103 on a Ø116 body = **0.89**.
  A made-up joint therefore always shows a shoulder step.
- **Four different answers to "how proud is the joint", and this separates the
  families in silhouette more reliably than the thread does:**
  a welded pin/box joint is slightly fatter than the tube (Ø116 on Ø114.3,
  **1.01 x**); an **API tool joint** is much fatter (**1.19 x**); an **MF collar**
  is much fatter (**1.37–1.44 x**); a **coupling sleeve** is fatter still
  (**1.40–1.57 x** the rod body); a **wireline rod or flush-joint casing** joint
  is **exactly the same diameter as the tube (1.00 x)**.
- **Coupling length is about 4.0–4.9 x the rod body diameter** (150/32 = 4.7,
  190/39 = 4.9, 210/45 = 4.7, 235/52 = 4.5). A crossover coupling runs
  1.1–1.2 x that.
- **Shank-adapter spline band is about 0.15 x its overall length** (range
  0.07–0.19).
- **Shank-adapter flushing bore is 0.10–0.25 x body diameter.** Nearly solid.
- **Wireline rod wall is 0.06–0.11 x OD**; a **percussive rod wall is about
  0.12 x OD** (14 mm on Ø116). A percussive rod is roughly twice the wall of a
  core rod of the same outside diameter.
- **A box is cut about 18 % deeper than the pin is long** (118 against 99.5 mm,
  §1.2), so the pin nose never bottoms and the deepest thread in a box is always
  clean.
- **Across-flats is about 0.80 x the outside diameter**, and this one ratio holds
  across three unrelated sources and three different tool families: drill-pipe
  flats 0.73–0.86 x OD (§3.10), a top-hammer rod flat 32 on Ø39 = 0.82, a
  Ø88.9 sub at SW80 on Ø94 = 0.85.
- **"How proud is the tool joint" splits the world in two.** A DTH or rotary
  drill pipe's joint is **flush** with the tube (§3.9); an oilfield API tool
  joint stands **1.19 x** proud (§3.7). Drawing an oilfield upset on a DTH pipe,
  or a flush joint on an oilfield pipe, is the single most visible pipe error
  available.
- **Thread clearance is about 0.2 x the tooth depth** (0.4 mm on diameter against
  a 2.0 mm radial tooth, §1.1 against §1.2). That gap is where the grease lives.

---

## 4. Component inventory

Every part below is one the player can see. The "why it matters visually" column
is the point — a rod is a cylinder, and everything that makes it *read* as a
drill rod is one of these small features.

### 4.1 The top-hammer rod itself

| Part | What it is | Why it matters visually |
|---|---|---|
| **Rod body** | round Ø32–64 mm bar or thick tube, or hexagonal 22–35 mm across flats | The hex rod is the one non-cylindrical member in the whole string. Hex flats catch light in six hard bands and a hex rod is instantly distinguishable from a round one at any distance. Round bodies are Ø39 (T38), Ø46/52 (T51), Ø60/64 (GT60) — brochure pp. 52, 56, 58 |
| **Flushing hole** | Ø9.6–22.5 mm axial bore | Only visible at the end faces, but it is the difference between a rod and a bar. On a pin end it reads as a dark circle *inside* a ring of thread; on a box end it is hidden behind the thread |
| **Pin (male) thread** | short rope thread, ~3.6–4.2 pitches long | The primary identifying feature |
| **Thread run-out and guide nose** | thread stops short, a 45° chamfer, then a plain parallel nose | Measured: **2.5 × 45° chamfer onto a Ø98 × 25 mm plain nose** on the Ø114.3 rod (§1.1). The nose is what stabs and aligns before any thread engages, and it is why a pin end looks blunt rather than pointed |
| **Female collar (MF rods only)** | integral swelled collar, **1.37–1.44 ×** the body Ø, roughly as long as the coupling it replaces | The single feature that separates an MF rod from an MM rod in silhouette (§3.2) |
| **Wrench flats** | **32 mm across on a Ø39 body** (brochure p. 52); two flats **SW80 on a Ø94 body** on the 88.9 sub (`IMG_7904`) | Two milled flats cut 80–85 % of the diameter. They are where the tongs go, they are always the brightest, most scuffed part of a used rod, and the game currently draws them as added boxes rather than cut flats |
| **Hardened zone** | carburised (case hardening in a carbon-rich furnace, used underground where corrosion matters) or **induction-hardened threads** (used for surface drilling) | brochure p. 9. Induction hardening leaves a **visibly different band of temper colour at the thread end** on real rods — a legitimate, brand-free two-tone finish |

### 4.2 The welded pin/box joint — where the diameter steps and where the weld is

From §1.1 and §1.2 together, on the Ø114.3 rod:

| Station | Feature |
|---|---|
| tube | Ø114.3 plain tube, Ø88 bore |
| **weld** | a **circumferential weld bead** where the tube meets the forging |
| 0 → 27 mm | Ø114.3 **weld-on spigot** — the forging's own stub, machined to the tube's OD so the weld is a plain butt |
| 27 mm | **the OD steps 114.3 → 116**. This step sits immediately outboard of the weld and is the visible mark of a welded end |
| 27 → 73 mm | Ø116 plain barrel — the fat part of the joint |
| 73 → 172.5 | thread |
| 172.5 → 200 | chamfer, plain nose, end chamfer |

**So the finished rod's silhouette is: tube — weld bead — a 46 mm fat barrel —
thread — nose.** A made-up joint is two of these back to back: a **400 mm long,
Ø116 upset with a weld bead at each end and a seam in the middle**.

**On DTH drill pipe the construction is stated outright, and the sentence was
verified on the page:** `Epiroc DTH product catalog.pdf` **p. 30** —
*"The joints are friction welded to achieve maximum strength, and the threads of
the end-pieces are heat treated for optimum durability and strength of the
thread profile."* The same page adds that the pipes are made from **cold drawn
piping**, *"reduces the risk of scaling from the pipes entering the hammer"*.
Friction welding is corroborated by two more sources —
`Mincon_2024-Drill-Pipes_A4_low-res.pdf` pp. 6 and 12 (*"friction-welding
processes"*, *"friction-welded pipe"*, *"case-hardened tool joints"*) and
`perforator_drill_pipes_22.pdf` p. 2 (*"up to 219 mm OD in friction welded
version"*, and on p. 3 *"friction welded and integrally forged"* HDD pipe).
**No source anywhere mentions inertia welding or threaded-and-welded ends.**

What that means visually is set out with photographic evidence in §3.10: the
weld is a **dark oxidised ring at the inboard end of the tool joint**, slightly
necked in, with the flash mostly machined back but one small residual nub — and
**the paint stops there**.

### 4.3 Couplings, sleeves and crossovers

| Part | Geometry | Why it matters |
|---|---|---|
| **Coupling sleeve** | one forged barrel, female both ends, OD **1.40–1.57 ×** the rod body, length **4.0–4.9 ×** the rod body Ø (§3.3) | The one place a top-hammer string is *lumpy*. A string of MM rods has a proud collar every 3.66 m; a string of MF rods does not |
| **Spanner band** | a milled flat band across the coupling waist | Where the breakout tongs bite. On the 88.9 sub the drawing calls out `SW80 2-Flächen` — **two** flats, not six |
| **Stop ring / centre stop** | an internal ring in the coupling bore | Invisible from outside, but it is what makes both pins land at the same depth. A "semi-bridged" coupling has a partial ring; the game already models this |
| **Crossover coupling** | different thread each end, **1.1–1.2 ×** the length of a plain coupling (§3.3) | Marks the size change in a string |
| **Bit adapter / reduction coupling** | male one end, female the other | `…broshure-english.pdf` p. 96 lists them with wrench flats F1/F2 called out on the drawing — two different flat sizes on one part |

### 4.4 The shank adapter — the striking end

Read off the dimensioned elevations at `Top_Hammer_Tools.pdf` pp. 62, 65 (see
§3.4 for the numbers):

1. **Rod thread** at the far end — a short rope thread, R25 through GT60 and WD58/WD68.
2. **Stepped taper** from the thread up to the body.
3. **Long plain parallel body** — the majority of the length.
4. **A small milled flat or oval recess in the flank**, drawn on nearly every
   model. This is the external-flushing feature: *"With external flushing, holes
   or a slot are required in the side of the shank adapter. These line up between
   seals inside the front head or water box of the rock drill"*
   (`…broshure-english.pdf` p. 74).
5. **Collar / drive step**.
6. **The spline band** — **10 to 14 straight splines**, band length ~0.15 × the
   tool, spline Ø close to the body Ø. One catalogued variant is **helical**.
7. **The striking face** — a plain flat annulus at the very end. This is where
   the piston lands, thousands of times a minute; it is the most battered surface
   on any tool in the game (§6).
8. **The flushing bore**, Ø6.2–14 mm straight through. Two systems:
   **internal flushing**, where *"a water tube … fits through the center of the
   drill and into an o-ring seal in the end of the shank"* (p. 74) — so on an
   internally-flushed shank there is a **visible O-ring counterbore in the
   striking face**; or **external flushing** via the side slot at (4). The
   catalogue distinguishes them per model as a bore diameter (10, 14 mm …) versus
   the code **SF**, separate flushing (`Top_Hammer_Tools.pdf` pp. 62–65).

### 4.5 Dual-wall and duplex — two tubes, and two ways of driving them

**RC dual-wall pipe** is *one* pipe containing two tubes: an outer pressure tube
and an inner sample tube, with the annulus between them carrying air down and the
inner tube carrying the sample up. What the local catalogues do give:

- **RC pipe OD range 89–305 mm** and **shoulder-to-shoulder length range
  1,000–6,000 mm** (`Mincon_2024-Drill-Pipes_A4_low-res.pdf` p. 9). So RC pipe is
  short — a 1 m sub through a 6 m joint — not the 9 m of an oilfield joint.
- The same catalogue's OD → thread matrix carries, alongside the API sizes, a
  further set of named connection families spanning **89–304 mm**: **DR, ARD,
  Metzke, Remet, Matrix, Faber, CSR, RDX** (ibid. p. 13). ⚠ **They are names and
  nothing more** — no profile, no taper, no start count, no pitch is published for
  any of them here, and *which* of them are RC-specific rather than a general
  alternative is itself **NOT SOURCED** (§8).

The parts a modeller must show are the inner tube standing proud at the pin so
the crew can stab it, the retaining circlips and O-rings at each end, and
centralising ribs holding the inner tube concentric in the annulus. **The
dimensioned inner-tube geometry — inner OD, annulus gap, centraliser count and
spacing — remains the largest single gap in this reference (§8).**

**Overburden duplex** is the other arrangement, and here the library is strong.
`EURODRILL_DRILLING_ACCESSORIES…_2025_26.pdf` pp. 20–22 give it as a labelled
exploded assembly, in two variants — **"Double-head drilling (rotary-percussion)
/ Doppelkopf (Drehen-Schlagen)"** and **"(rotary-rotary) / (Drehen-Drehen)"** —
with the parts split into two named groups, `Inner rod / Innengestänge` and
`Casing / Außengestänge`:

| Pos. | Part (as printed, DE | EN) | What it is |
|---|---|---|
| 1 | `Spülwelle` \| Flushing shaft | The long shaft the inner string is driven and flushed through. Catalogued in **Ø100 and Ø140** |
| 2 | `Spülringhalter kpl.` \| Bracket cpl. | The bracket that carries the flushing ring on the rotary head |
| 3 | `Spülring kpl.` \| Flushing ring | The rotating seal collar that gets air or water into the inner string |
| 4 | `Nutring 4x` \| **U-seal, four off** | Four lip seals in that ring — a stack of four, not one |
| 5 | `Ausgleichstange` \| Adaptor rod | A compensating rod between the head and the string |
| 6 | `Verschleißstück` \| **Wear part**, listed as `KW76 x 76.1`, `x 88.9`, `x 114.3` | The sacrificial piece on the inner rod. Footnote: *** conical left hand thread / kegeliges Linksgewinde** |
| 7 | `Auswurfkopf` \| **Ejection head** | On the casing string |
| 8 | `Verschleißbuchse` \| **Wear bushing** | On the casing string |
| 9 | `Gestängeflansch kurz` \| Rod head flange, short | Casing string, in **Ø89 / 101 / 108 / 114 / 133 / 152 / 178 / 203 / 219** |
| 10 | `Antriebsflansche` \| Drive flange | Types A / B / D, bolted, `M16x1.5 (8x)` on Type A (p. 23) |

Two things fall out of this that change how a duplex string should be drawn:

- **The inner rod and the casing are two separate strings with two separate
  drives.** The exploded elevation on p. 20 shows a rear rotary/percussion head
  driving a long flushing shaft that passes *through* a forward rotary head which
  drives the casing. That matches the site elevation in `_photos.md`
  (`kr-806-3gs-vertikal-laengs.jpg`): *"Two rotary drive units are stacked on the
  mast — an upper rotary and a lower casing rotary, a duplex / overburden
  arrangement, separately carried on one rail."* Two independent, real sources for
  the same layout.
- **The inner string's threads are conical and left-hand; the shank adaptor
  threads are left-hand (`H64 LH`, `H90 LH`, `H92 LH`); the casing thread is a
  3-start left-hand round thread (§3.6).** A duplex assembly is therefore almost
  entirely left-handed, against a right-handed top-hammer string.

### 4.6 The consumables and hardware that live around the string

| Part | Source | Why it is worth modelling |
|---|---|---|
| **Guide tube** | brochure pp. 49, 52, 54, 56 — T38 Ø56 for 64–76 mm bits, T45 Ø63 for 76–89, T51 Ø76 for 89–102 and Ø87 for 102–127, all **3660 mm** long, female end OD called out | An over-diameter tube run directly behind the bit to steady the string. In silhouette it is a **fat sleeve just above the bit** — cheap geometry, and it makes a bench-drilling string read correctly |
| **Pilot tube / drill tube** | brochure p. 58 — GT60 pilot tubes Ø87 × 4265 and Ø76 × 5335, female end Ø85 | The tube-drilling equivalent |
| **Thread grease** | brochure p. 98 — cans **Ø215 × 170 mm** and **Ø300 × 380 mm**, a **tube 53/57 × 235 mm**, barrels **Ø370 × 690** and **Ø610 × 870** | A grease tin at the rig foot is a real, brand-free piece of site furniture, and the sizes are published |
| **Wear gauges** | brochure p. 98 — *"Wear gauge for male and female threads"* and a separate *"Chuck wear gauge"* for Hex 19 / 22 / 25 | Small hand tools; they explain why a driller kneels at the rod rack |
| **Drill steel straightener** | brochure p. 98 — *"Drill steel straightener for Hex19 to Round 52"*, manual/hydraulic and electric/hydraulic 380 V, with a separate support leg | A workshop press for **bent rods**. Proof that bent rods are routine, repairable, and worth showing (§6) |
| **Wrenches and knock-off tools** | brochure p. 97, dimensioned by L and D | The tool that appears in every rod-handling photograph |
| **Thread protectors** | `_photos.md`: *"green-painted DTH pipes with **orange plastic thread protectors**"*, and *"mixed stacks with orange and grey protectors"*; also *"white plastic thread protectors"* on a workshop rack | The loudest colour on a stack of pipe, and the thing that tells the eye a pipe is *new*. Bright plastic caps on both ends |
| **Rod-clamp gripping die** | `_photos.md`, forging drawing at `WhatsApp Image 2026-08-16 at 17.39.35 (2).jpeg`: a block **73 × 51 × 15.5 mm** with a **waffle / diamond tooth field 69 × 42 mm**, teeth pitched 22.5°, **R1.3 crests, 2.5 mm tooth depth, 45° R0.7 relief**, material 16MnCr5, 0.39 kg | This is the face that bites the rod. It is why a used rod has **diamond-patterned jaw scars** in bands, and the pattern is fully dimensioned |

---

## 5. Distinctive features (thumbnail silhouette test)

The test: at 64 px, with no colour and no texture, can the player tell these
apart? Each family below gets the **three to five features that survive that
crop**. Everything else is detail.

### 5.1 The one-line test

| Family | Reads as |
|---|---|
| Top-hammer **MM extension rod** | a plain stick with a **fat sleeve every few metres** |
| Top-hammer **MF rod** | a plain stick with **one fat collar at one end and nothing at the other** |
| **Hex drifter rod** | a stick with **flat sides that catch light in hard bands** |
| **DTH / rotary drill pipe** | a **smooth, unbroken cylinder** — the joints are flush; only the *colour* changes at the ends |
| **Oilfield drill pipe** | a cylinder with a **big barrel at each end joined by a long concave curve** |
| **RC / dual-wall pipe** | a pipe with **a second pipe visible inside its mouth** |
| **Wireline core rod** | a **perfectly smooth tube with no joint at all**, just a faint seam |
| **Casing** | the **fattest tube on site**, joint the same diameter as the tube, often stencilled by hand |
| **Shank adapter** | a short bar with a **corduroy band and a flat, battered end** |

### 5.2 Per family, in detail

**Top-hammer MM extension rod + coupling sleeve.**
1. **The proud coupling.** OD **1.40–1.57 ×** the rod, length **4–4.9 ×** the rod
   diameter (§3.3). One every 3.05–6.10 m of string. It is the only lump.
2. **Two flat spanner faces on the coupling waist** — *two*, not six
   (`IMG_7904`, `Epiroc DTH product catalog.pdf` p. 31).
3. **The rod itself is dead plain** between couplings — no bands, no pads, no
   centralisers, just a turned bar with a flat milled at 0.80 × its diameter.
4. **Both ends are pins**, so the string has a mirror symmetry the MF rod lacks.

**Top-hammer MF rod.**
1. **One integral female collar**, **1.37–1.44 ×** body Ø (§3.2). Asymmetric —
   that asymmetry *is* the identification.
2. **The body is fatter than an MM rod's of the same thread** (Ø52 vs Ø46 on T51).
3. **No separate coupling anywhere in the string.** An MF string is smoother, and
   the catalogue says why: *"a drill string with MF-rods offers stiffer
   connections due to the 50 % reduction in thread play compared to a separate
   coupling sleeve"* (`…broshure-english.pdf` p. 9).

**Hex drifter rod.**
1. **Hexagonal section**, 22 / 25 / 28 / 32 / 35 mm across flats.
2. **Different thread at each end** — a shank thread one end, a bit thread the
   other (the product code literally names both: e.g. hex 35 body, T38 on the
   shank end, R32 on the bit end — `Top_Hammer_Tools.pdf` p. 9).
3. **About 50 mm longer** than the equivalent extension rod (§3.1).

**DTH / rotary drill pipe.**
1. **Flush.** The tool joint runs out into the tube at essentially the same
   radius (§3.9). Silhouette is a plain cylinder.
2. **The colour break at the weld band** does all the work instead: painted tube,
   **dark oxidised ring**, bare bright machined joint, bright thread (§3.10).
3. **Two wrench flats at 0.80 × OD** — *or none at all*, depending on rig family
   (§3.10). Some carry a hexagon instead; some a plain turned "circular grip".
4. Optionally **three diagonal hard-band stripes on the box joint** at 30–40°
   (`Mincon-Rotary…Condensed-Version.pdf` p. 4).
5. **Short.** 1.0–6.1 m for most rigs, against a rod's 3.05–6.10 m and an
   oilfield joint's 9.14 m.

**Oilfield drill pipe (API tool joint).**
1. **A barrel at each end 1.19 × the tube diameter** (§3.7).
2. **A long concave S-fillet** from that barrel down to the tube — not a step.
3. **Upsets**, which are named as a product feature on this line and only this
   line: EU / IU / IEU (`perforator_drill_pipes_22.pdf` p. 4).
4. **Long.** API Range 2 is 8.23–9.14 m per joint.

**RC / dual-wall and duplex.**
1. **Two concentric tubes visible at the mouth** — the defining feature and the
   only one that matters.
2. **The inner tube stands proud at the pin** so the crew can stab it.
3. **Short pipe**: 1.0–6.0 m (`Mincon_2024-Drill-Pipes` p. 9).
4. On **overburden duplex**, the string is two strings — an inner rod inside an
   outer casing, driven by **two stacked rotary heads on one mast** (§4.5), and
   almost every thread on it is **left-hand**.

**Wireline core rod.**
1. **Flush joint — the joint is the same OD as the tube.** Nothing stands proud
   anywhere on the string (§3.5). This is the *only* family where that is true,
   and it is the whole silhouette.
2. **Thin wall**: 0.06–0.11 × OD, so the end of the tube is a *thin* ring.
3. **3 m rods**, not 3.66 m.
4. If a two-start thread is shown, **two lead-ins 180° apart** at the pin nose
   (`Epiroc Guide Protecting and Handling your Drill Rods.pdf` p. 5).

**Casing.**
1. **The largest-diameter member on the site**: Ø89 → Ø219 mm in the duplex
   flange ladder (§3.8), far larger in bored piling.
2. **Left-hand, 3-start round thread** on the connection
   (`HP_Casing_Thread_Drawing.pdf`).
3. **Hand-scrawled yellow and white paint markings**, inside and out
   (`_photos.md`).
4. Some casing does not thread at all: `_photos.md` records a **castellated
   bayonet joint with six rectangular drive lugs** on a large-diameter tube — a
   completely different joint silhouette.

**Shank adapter.**
1. **The spline band** — 10–14 straight (rarely helical) splines over about
   **0.15 × the length**, near the striking end.
2. **A flat, battered striking face** at the very end.
3. **A long plain body** with a **small milled flat or oval recess in the flank**
   (the external-flushing port).
4. **A short rope thread at the opposite end.** Thread at one end, splines at the
   other, plain in between: that ordering is the whole shape.

### 5.3 The single most useful discriminator

**Not the thread — the joint diameter.** At any distance where the thread has
become a texture, five families are still distinguishable by one number, "how
much fatter is the joint than the tube":

**1.00 ×** wireline rod / flush-joint casing · **1.00–1.01 ×** DTH and rotary
drill pipe · **1.19 ×** oilfield API tool joint · **1.37–1.44 ×** MF rod collar ·
**1.40–1.57 ×** coupling sleeve.

---

## 6. Materials, paint and wear

A rod is bare steel that lives in a rack, in mud and in a hole. Almost every
useful statement below is about a **specific end** of it.

### 6.1 Material and heat treatment

| Statement | Source |
|---|---|
| The big casing/rod connections are drawn in **S135, HRC 32–36** | `HP_Casing_Thread_Drawing.pdf` |
| The same sheet notes German-made casings are typically **42CrMo4 / 42CrMo4V + Q&T** and warns to *"confirm equivalence when second-sourcing"* | ibid. |
| DTH pipe **tool-joint threads are heat treated**; the pipe body is **cold drawn** | `Epiroc DTH product catalog.pdf` p. 30 |
| DTH pipe tool joints are **case-hardened** | `Mincon_2024-Drill-Pipes` pp. 6, 12 |
| Top-hammer rods get one of **two** surface treatments: **carburising** (case hardening in a carbon-rich furnace, *"used for rods in underground applications in areas where corrosion is major problem"*) or **induction surface hardening of the thread** (*"rapidly heated and cooled… primarily used for rods in surface drilling applications"*) | `…broshure-english.pdf` p. 9 |

The second of those is directly modellable: **induction hardening treats only the
thread end**, so a real surface-drilling rod carries a **band of different temper
colour at each end** that stops abruptly where the coil stopped. Brand-free, and
a much better story than a uniformly grey stick.

### 6.2 Paint — and the rule that governs it

**A drill pipe is painted on the tube and bare on the joints, and the paint stops
at the weld band.** That single rule (§3.10, from the close-up at
`Mincon_2024-Drill-Pipes` p. 7) explains every pipe photograph in the library.

Observed body colours, all photo-read and all real:

- **Silver / light grey** tube with bare bright joints (`Mincon` p. 7).
- **Light grey** tube, joints and threads bare and oxidised dark (`Epiroc` p. 30).
- **Gloss black** tube with bare bright joints (`Mincon` p. 12 render).
- **Black-painted DTH pipe** in factory racks, ends showing bright machined pin
  threads and box bores (`_photos.md`, `WhatsApp Image 2026-08-04 at 12.52.11.jpeg`).
- **Green-painted DTH pipe** with the thread left grey-olive and a recessed
  wrench flat (`_photos.md`, `Î´ÃüÃû.jpeg` panel 2, `11.jpeg`).
- **Black phosphate finish with the thread machined bright**, on a size ladder of
  five pin ends (`_photos.md`, `Î´ÃüÃû.jpeg` panel 1).

`_photos.md` states the conclusion plainly: *"pipe body here is black, whereas
`11.jpeg` shows green — both are real; pipe paint varies."* **So the paint colour
is a free choice; the paint *boundary* is not.**

⚠ **No source in the library names a paint colour in words.** Everything above is
read off photographs (§8).

**Top-hammer rods are not painted at all** in any photograph or catalogue here —
they are bare hardened steel. Small *bits* are painted (orange-red, maroon) per
`_photos.md`, but rods are not.

### 6.3 Thread grease — what it actually looks like

This is worth getting right because it is on every joint the player watches being
made up.

- **Composition**: *"the compound should contain at least 50 % zinc"*
  (`Epiroc Guide Protecting and Handling your Drill Rods.pdf` p. 4). A high-zinc
  dope is an **opaque, matte, grey-metallic paste** — not translucent, not black,
  and not shiny.
- **Application**: *"use a paint brush and cover the entire surface of the thread
  with a thin coat, like a coat of paint"* (ibid.). So on a fresh joint the
  thread is **evenly coated and slightly duller than bare steel**, with brush
  texture — not blobbed.
- **A second product type is an extra-sticky black rod grease** that *"will not
  liquefy"* in heat and keeps its adhesion in cold (ibid. p. 9). So both a grey
  paste and a dark sticky grease are correct, on different jobs.
- **What happens to it**: *"the grease must be protected from drilling dust, left
  unprotected it will interact with the dust to act as a grinding compound rather
  than lubricator next time it is used"* (`…broshure-english.pdf` p. 13). This is
  the visual: **used grease is grease plus rock flour** — darker, gritty, and
  smeared, and it collects in a **dirty collar at the shoulder** where it is
  squeezed out on make-up.
- Grease is sold in tins and barrels of published size (§4.6), and there is a
  catalogued **lead-free aluminium-complex thread grease** in 5 / 4.5 / 18 kg and
  a copper-blend in 1 / 2.5 / 5 US gal (`Epiroc DTH product catalog.pdf` p. 27) —
  so a **copper-coloured** dope is also real.

### 6.4 Which end wears, and how

`Epiroc Guide Protecting and Handling your Drill Rods.pdf` is a whole document
about rod damage, and it names the failure modes:

| Damage | What it is, in the source's words | What it looks like |
|---|---|---|
| **Thread galling** | *"high torque or loading cause seizure or binding of the metal threads… most often the culprit is dirt, or dust that has not been properly cleaned"* (p. 4) | Smeared, torn metal on the flanks; bright drag marks along the helix; a thread that has lost its clean crest line |
| **Damage multiplies** | *"the problem becomes worse when you use a male end that is damaged and try to thread it onto an undamaged female end. The damaged thread will damage the good one"* (p. 4) | Justifies a wear system where damaged tools infect others |
| **Stripped threads** | *"the rod threads can become stripped if you force a rotation and the threads have not connected properly… jamming and wedging"* (p. 5) | Whole turns missing or flattened at the mouth of a box |
| **Stabbing** | *"'stabbing' is another common problem, especially on hydraulic rigs that have automatic rod handlers… the pin 'stabs' the box thereby damaging both rods"* (p. 6) | **Radial dents and imprints on the pin nose and the box mouth rim** — the leading edges, not the middle |
| **Dents from rods hitting each other** | *"imprints and dents on the pin and box thread ends"* (p. 6) | Bright bruises on the ends of racked rods |
| **Leaking rods** | *"as the threaded rods wear, or are damaged prematurely… they will eventually leak"* (p. 6) | Water or air weeping at the shoulder; a clean washed streak in the dirt below the joint |

Add to that, from the top-hammer brochure:

- **Threads wear as a set**: *"when replacing the drill rods, it is often more
  economical to replace the coupling as well. Mixing new and old threads can make
  the newer threads wear more quickly"* (p. 13). A used string is uniformly used.
- **Bent rods are normal and repairable**: *"not all bent drill steels have to be
  discarded. They can often be straightened either in the hole or with a
  straightening press"* (p. 13) — and the catalogue sells that press, *"for Hex19
  to Round 52"* (p. 98). **A slightly bent rod is a correct thing to show**, and
  a straightening press is correct workshop furniture.
- **Blocked rods**: *"drill steels and rods can become blocked. The blockage can
  usually be removed with the aid of a copper tube and water flushing"* (p. 13).
- **Wear gauges exist for both male and female threads** (p. 98) — the driller
  measures the thread rather than eyeballing it.

### 6.5 Where the marks actually land, in order of how far away you can see them

1. **The shank adapter's striking face.** It takes the piston blow thousands of
   times a minute. It is the most battered surface in the whole family:
   mushroomed at the rim, bright in the centre, and never clean.
2. **Rod-holder and breakout jaw scars.** The die that grips the rod is
   dimensioned in the library: a **diamond / waffle tooth field, teeth pitched at
   22.5°, R1.3 crests, 2.5 mm deep** (`_photos.md`, forging drawing
   `WhatsApp Image 2026-08-16 at 17.39.35 (2).jpeg`). So the scars are not
   scratches — they are a **repeating diamond pattern in bands**, at the two or
   three places along the rod where the clamp habitually grips.
3. **Coupling and box end faces mushroom.** They take the blow every time a joint
   is broken out, and the lip rolls over the OD.
4. **The polished band.** Any part of a rod that rubs — through a guide, a
   centraliser, a rod holder — comes out **brighter than everything else**.
   `_photos.md` records this independently on a rotary drive spindle: *"a short
   male rope-thread stub in bright bare steel… polished brighter than anything
   else in frame because that is the surface that rubs."*
5. **Rust, and it is not uniform.** `_photos.md` on stacked open-ended tube:
   *"the interior rust is visibly darker than the exterior"*; and on stacked
   casing, *"vertical rust weep striping four stacked casing tubes"* — rust runs
   **downward in streaks from every joint and lug**, not as an even film.
6. **The thread crest rounds off before it disappears.** A worn rope thread loses
   amplitude and the crest flattens into a plateau; on a shallow 2.0 mm tooth
   that is a small change in geometry but a large change in how the helix catches
   light.

### 6.6 The rack, the bundle and the ground

Straight from `_photos.md`, and all of it is `site-furniture` a rod scene needs:

- **Fabricated steel A-frame cradles** with pipe stacked in them, several stacks
  to a bay, ends outward so the bright threads face the aisle.
- **Bundles banded with black steel strapping**, stacked in layers with **black
  separator strips** between courses, crane chains and hooks overhead.
- **Bright plastic thread protectors on both ends** — orange, grey, white, and
  blue on drill pipe (`Mincon_2024-Drill-Pipes` p. 7). The loudest colour in a
  pipe stack, and the sign that a pipe is new.
- **Timber bearers** under bundles laid straight on the ground or on tarmac; a
  **paper label wire-tied to a bundle**.
- **Hand-written marker pen straight onto bright machined steel** — `_photos.md`
  records `"Pilot 102"` written in black marker on a bit. Brand-free, real, and a
  good decal for a rod rack.
- **A shallow stamped oval ID recess in the pipe upset** (`_photos.md`, `11.jpeg`)
  — *"a shallow stamped oval, not a printed label."* ⚠ No catalogue in this
  library specifies a stamp location (§8), so treat the photo as the only
  evidence.

---

## 7. Photo references

All frames below are indexed and described in `research/rigs/_photos.md`, which
also records which carry branding. **Nothing in this list may have its lettering,
badge, title block or drawing number copied onto a model.**

### 7.1 The four dimensioned drawings — the geometry set

| File | Converted to | What it gives |
|---|---|---|
| `IMG_7906.HEIC` | `…\scratchpad\IMG_7906.jpg` | The **114.3 mm 3-start pin end** transcribed in §1.1 |
| `IMG_7905.HEIC` | `…\scratchpad\IMG_7905.jpg` | The **mating box**, transcribed in §1.2. CAD tab reads `114,3 3gg zyl` |
| `IMG_7904.HEIC` | `…\scratchpad\IMG_7904.jpg` | The **88.9 single-start** sub: `88,9 zyl re 1 gg`, `SW80 2-Flächen`, Ø94, 175 long, four half-section views |
| `IMG_7907.HEIC` | `…\scratchpad\IMG_7907.jpg` | The **API 4 1/2** tool-joint envelope, §3.7 |

⚠ All four are photographs of a CAD screen. `IMG_7906` has a supplier address
visible in a corner. **Proportions only.**

The Read tool cannot open HEIC. Convert first — the JPEGs above already exist in
the scratchpad.

### 7.2 Real objects — finish, colour and wear

| Frame (in `C:\Users\henri\Downloads\`) | What it is worth |
|---|---|
| `WhatsApp Image 2026-08-04 at 12.52.11.jpeg` | **Black-painted DTH pipe in A-frame steel cradles**, three stacks, ends showing bright pin threads and box bores, workers, a red pipe wrench. The best "pipe in a rack" frame |
| `WhatsApp Image 2026-08-06 at 16.04.02.jpeg` | Black DTH pipe in a steel rack; **a rectangular weld-on wear pad on the pipe flank** — the one such pad in the library |
| `Î´ÃüÃû.jpeg` | Three-panel factory collage: **five DTH pin ends as a size ladder in black phosphate with the thread machined bright**; **green box ends with the thread grey-olive and a recessed wrench flat**; **green rods bundled with black steel banding and black separator strips** under crane chains |
| `11.jpeg` | Four panels: green pipe with **orange plastic thread protectors** in A-frame racks; box ends with coarse rope thread and milled wrench flats; mixed orange and grey protectors; a **stamped oval ID recess in the upset** |
| `hp_beforeafter.jpg` | A **top-hammer shank adapter**: about ten straight splines, a smooth parallel neck, a coarse rope thread at the far end, a bright machined ring, on a grey workshop floor. **Use the un-retouched half** |
| `WhatsApp Image 2026-08-06 at 12.24.30.jpeg` | **Macro into a box end**: internal rope thread of about ten turns, bright machined, a stepped bore behind it, thick wall |
| `WhatsApp Image 2026-08-06 at 12.24.30 (1)/(2).jpeg`, `…12.24.29 (3).jpeg` | A **drive sub with a long rounded-end milled window through the wall** and a stepped reduction to a smaller neck; `(2)` lays six out as a size ladder |
| `WhatsApp Image 2026-09-03 at 11.18.41.jpeg` and `(1)` | Large casing with a **castellated bayonet joint, six rectangular drive lugs**, an internal bolted key bar, **hand-scrawled yellow and white paint markings**; `(1)` stacks four on timber bearers with **vertical rust weep striping** |
| `extrabilder51314852_large.jpg` | Looks straight into **open tube ends** — wall thickness readable, and **interior rust visibly darker than exterior** |
| `WhatsApp Image 2026-08-16 at 17.39.35 (2).jpeg` | The **rod-clamp gripping die**, fully dimensioned: 73 × 51 × 15.5 mm, diamond tooth field 69 × 42, 22.5° pitch, R1.3 crests, 2.5 mm deep. **This is what makes the jaw scars in §6.5** |
| `kr-806-3gs-vertikal-laengs.jpg` | The one machine elevation showing **two stacked rotary drives — an upper rotary and a lower casing rotary** — i.e. the duplex arrangement of §4.5 as a real machine |

### 7.3 What has no photograph at all

There is **no photograph anywhere in the library of**: a dual-wall RC pipe cut
open or seen down the mouth; a wireline rod or its flush joint; a rod being made
up on a rig; a rod rack on a mast; a thread grease tin in use; or a bent rod.
`_photos.md` §6 lists the machine ids with nothing usable, and `rc-rig` and
`core-rig` are both on it.

---

## 8. NOT SOURCED

Everything below was looked for and not found. **These are as valuable as the
findings — a plausible invented number here would be worse than the gap.**

### 8.1 Threads

- **Taper rate, pitch, threads-per-inch, thread length and start count for every
  thread named in the DTH and rotary drill-pipe catalogues** — API REG, API IF,
  FH, BECO, RD40-6, RD50-6, RD70-4, DIBH, Z, CUBEX, LT-275. Five catalogues name
  them; **not one dimensions them.** That API pins are tapered and single-start
  is read off photographs and one schematic cone, not from a table. The numeric
  API form in `THREAD_SPECS` still rests on API Spec 7, cited in `tools.js`.
- **The `-6` / `-4` suffix on the RD-series round threads** is never explained.
- **`DI22` does not appear in any of the five drill-pipe PDFs.** The nearest hits
  are `DIBH` (a thread name) and `DI` (a rig family). Do not treat DI22 as
  sourced.
- **The connection families DR, ARD, Metzke, Remet, Matrix, Faber, CSR and RDX**
  are named against 89–304 mm pipe and **nothing else about them is published
  here** — no profile, no taper, no starts, no pitch — nor is it stated which of
  them are RC-specific.
- **Whether the 3-start casing thread is parallel or tapered.** The drawing
  states starts, hand, lead, pitch and root radius, but not taper. (The 114.3 mm
  *rod* connection of §1.1/§1.2 is explicitly `zyl` = parallel; the casing sheet
  does not say.)
- **The number of starts on the duplex inner-rod and shank-adaptor threads.** The
  catalogue says only *"conical left hand thread"*.
- **Thread length for R and T rope threads.** The game derives it as
  `pitch × 3.6`; nothing in the library confirms or refutes that. The one
  measured thread length available is 99.5 mm on the Ø114.3 3-start rod, which
  is 8.8 pitches / 2.94 leads — a different rule, on a different family.
- **Why the casing thread is left-hand while the rod thread is right-hand.** The
  facts are sourced; the reason given in §3.6 is engineering inference and is
  labelled as such.

### 8.2 Dual-wall, duplex and RC

- **The inner tube's OD and ID, the annulus gap, and the wall thicknesses** of RC
  dual-wall pipe. **This is the single biggest gap in the reference.** The game's
  `RC_PIPE` table (88.9/50.8/8.0, 101.6/57.2/8.5, 114.3/63.5/9.0) carries **no
  citation comment** and could not be traced to any source in this pass.
- **How the inner tube is retained and sealed** — circlips, O-rings, shoulders —
  as a dimensioned arrangement.
- **Centraliser / spider count, spacing, form and thickness** in the annulus.
- **Whether an RC dual-wall joint is flush or upset**, and whether the inner tube
  has a joint of its own.
- **The RC sample take-off / swivel / crossover** at the top of the string.
- A **parallel research pass on `PD_Duplex-Drill_Tubes-JG_1001-1.pdf`,
  `Mincon-RC-Solutions-2025-A4-WEB.pdf`, `Reverse-Circulation-Tools.pdf` and
  `RC_Hammer_Catalogue.pdf` was still running when this file was completed.** Its
  findings are **not** in this document; if that pass produced anything, it
  belongs in §3, §4.5 and here.

### 8.3 Drill pipe

- **Tool-joint OD as a number distinct from the tube OD.** No drill-pipe
  catalogue here tabulates it. "Flush" (§3.9) is read from three photographs and
  a schematic, not from a dimension.
- **Tool-joint axial length.** One catalogue drawing letters it (`H` at the pin,
  `I` at the box) and then **never tabulates either letter**.
- **Wrench-flat axial length, depth, corner radius and position along the joint.**
  Only across-flats is published.
- **Hard-band geometry as numbers** — band width, proud height, helix angle,
  number of bands, axial position. Only the drawing exists.
- **Weld-band axial length and its offset from the shoulder.** Only photographs.
- **Wear pads and centralisers on the pipe body** — no source shows any on
  standard DTH or rotary pipe. One photograph shows a weld-on wear pad
  (`…16.04.02.jpeg`); nothing dimensions it.
- **Bore as a published column.** Derivable only as OD − 2 × wall.
- One catalogue's schematic letters a dimension `F` whose tabulated values are
  **independent of pipe OD** (27 mm on a 76 mm pipe and on a 406 mm pipe) with
  **no legend**, and one row of it is plainly corrupt. **Its meaning is unknown;
  do not derive geometry from it, and do not scale off that artwork — it is
  schematic and not to scale.**

### 8.4 Rods, shanks and couplings

- **Thread length on a shank adapter.** The tables give overall length and spline
  band length, never thread length.
- **Spline tooth form** — count is countable off the end views (10–14) but no
  module, pressure angle, root radius or tooth depth is published.
- **Which shank adapters are internally and which externally flushed, as a rule.**
  The catalogue distinguishes them per model (a bore diameter, or the code `SF`),
  but never states the geometry of the side slot.
- **The MF collar's length** as a published dimension. Only its OD is given.
- **T45 / T51 / GT60 rod bore and body OD from a second source** — the brochure
  gives T38, T51 and GT60; T45 body OD is not in the pages read.
- **Rope-thread R44, R51, T60, GT60, T76 and H90 dimensional tables.** ISO 10208
  stops at R38; the `tools.js` header comment already flags these as
  extrapolated, and nothing found here fixes them.

### 8.5 Materials and finish

- **Any stated paint colour, anywhere.** Not one of the twelve catalogues and
  drawings read for this file names
  a pipe or rod colour in words. Silver, grey, black, green and blue are all
  photo-read.
- **Thread-protector material, colour specification or dimensions.** Orange,
  grey, white and blue are all photo-read.
- **Stamped ID recess / heat-number stamp location** as a specification. One
  photograph shows a shallow stamped oval in a pipe upset; no catalogue
  specifies one.
- **Rod steel grade.** The game says `34CrNiMo6` for rods and couplings and
  `42CrMo4(V)` in the item data; the only grades actually sourced here are
  **S135, HRC 32–36** on the casing/rod thread drawings and the same sheet's note
  that German-made casings are typically **42CrMo4 / 42CrMo4V + Q&T**. No source
  in this pass names 34CrNiMo6.
- **The proportion of a rod's length that is polished in service.** The game
  polishes the middle 30 %; the sourced polish locations are the *rubbing*
  surfaces (jaws, guides, spindles), not a fixed band.

---

## 9. Domain-truth warnings — what the game currently gets wrong

Read against `src/rig/tools.js` **read-only**, on the day this file was written.
⚠ **That file is being edited by other agents right now and its line numbers move
between reads** — everything below is therefore located by *function name*, and
the quoted code is what was in the file when it was read. Verify before acting.

Ranked by how visible the error is at normal play distance.

### W1 — Every thread in the game is SINGLE-START. Three measured drawings in this library are not. **(highest)**

`threadGeometry()` builds **one** curve and sweeps **one** tube along it:

```js
  const turns = Math.max(0.6, length / pitch);
  ...
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = u * turns * TAU * hand;
    ...
  }
  const curve = new T.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
  return new T.TubeGeometry(curve, n, depth * 0.62, radial, false);
```

There is **no `starts` field in `THREAD_SPECS` and no `starts` option in `o`**.
Against that:

- The Ø114.3 rod connection is **3-start, RH**, lead 33.87 (§1.1, §1.2).
- The casing connection is **3-start, LH**, lead 33.867, on Ø101.6 / 133 / 152.4
  / 180 (`HP_Casing_Thread_Drawing.pdf`).
- A **2-start** wireline rod thread is described in words, with the reason
  (`Epiroc Guide Protecting and Handling your Drill Rods.pdf` p. 5).
- The Ø88.9 sub is **1-start** (`IMG_7904`) — so the fix is *not* "make everything
  3-start", it is "make starts a property".

**Fix:** add `starts` to `THREAD_SPECS`, loop the helix generation `starts` times
at `(s / starts) × TAU` phase offset, and drive the axial climb by the **lead**
(pitch × starts), not the pitch. `flightGeometry()` in the same file already does
exactly this for auger flights (`const starts = opts.starts || …; for (let s = 0;
s < starts; s++) { const rot = (s / starts) * TAU; … }`) — the pattern is already
in the codebase.

### W2 — There is no left-hand thread anywhere in the game, and the casing is explicitly declared right-hand

`hand: 'left'` appears **nowhere** in `tools.js` outside the doc comment on
`threadGeometry()`. And `buildCasingPipe()` finalises with:

```js
    joint: 'Cone-ring, RH', material: 'S355J2 / N80',
```

Both dimensioned casing sources say the opposite:

- `HP_Casing_Thread_Drawing.pdf`: **"3-start round thread, left-hand"**, on every
  size from Ø101.6 to Ø180.
- `EURODRILL…2025_26.pdf` p. 20: the duplex shank-adaptor threads are printed as
  **`H64 LH` / `H90 LH` / `H92 LH`**, and the inner-rod wear parts carry a
  footnote reading **"conical left hand thread / kegeliges Linksgewinde"**.

So **the entire overburden and duplex side of the game should be left-handed**,
against a right-handed top-hammer string — and right now it is uniformly
right-handed. A left-hand helix is a one-character change at the call site
(`hand: 'left'`, already supported) and it reverses the most recognisable line
on the tool.

### W3 — One model, `drill-rod`, stands in for three families that look nothing alike

`src/ui/screens/catalog.js` maps:

```js
  'DTH Drill Pipes': 'drill-rod',
  'Drill Rods (Threaded)': 'drill-rod',
  'Core Drill Rods': 'drill-rod',
```

`buildDrillRod()` makes a **top-hammer rope-thread rod with a proud MF collar and
a polished mid-band**. Per §5 that is wrong for the other two:

- A **DTH drill pipe** has a **flush** tool joint, a **tapered single-start API**
  thread, a **painted tube with bare bright joints and a dark weld band between
  them**, and either two flats at 0.80 × OD or **no flats at all** (§3.9, §3.10).
- A **wireline core rod** has a **flush joint of exactly the tube diameter**, a
  **thin wall** (0.06–0.11 × OD), and a **3 m** length (§3.5).

Three families, three silhouettes, one mesh. This is the most-seen error in the
game because a rod is added every few metres of every hole.

### W4 — The shank adapter's spline band is about 2.8 × too long

`buildShankAdapter()`:

```js
  const splineLen = L * 0.42;
```

Measured across twelve catalogued shank adapters (§3.4), **L_spline / L_total
runs 0.07 → 0.19, median ≈ 0.15**. The catalogue's own 435 mm entry — the exact
default the game uses (`mm(opts.lengthMm || 435)`) — has an **84.5 mm** spline
band, i.e. **0.194**, not 0.42.

Two smaller errors in the same function:

- **The splines are cut into a reduced-diameter section** (`R * 0.86` with a
  `radiusFn` that removes a further 10 %) and then a **larger collar** is placed
  below them at `R * 1.22`. On the real tools the spline OD sits **close to the
  body OD** — Ø53.3 on a Ø45.05 body (1.18 ×), Ø61.2 on Ø60 (1.02 ×), Ø67.9 on
  Ø70 (0.97 ×). There is no dramatic step either way.
- **The external-flushing side slot is missing.** Nearly every catalogued
  elevation shows a small milled flat or oval recess in the body flank, and the
  brochure explains it: *"With external flushing, holes or a slot are required in
  the side of the shank adapter"* (`…broshure-english.pdf` p. 74). It is one box
  subtraction and it is on almost every real shank adapter.

The spline **count** (12) and the striking face are already right.

### W5 — The coupling sleeve has six spanner flats; the drawings show two

`buildCouplingSleeve()`:

```js
      const a = ((th * 6) % TAU + TAU) % TAU;   // six spanner flats
```

Two independent dimensioned sources say **two**:

- `IMG_7904` annotates the Ø88.9 sub **`SW80 2-Flächen`** — across-flats 80,
  **two** faces, on a Ø94 body.
- `Epiroc DTH product catalog.pdf` p. 31 footnotes **"2 × 95 mm wrench flats in
  BOX"**.

And the depth is wrong too: the game removes 8.5 % of the radius; SW80 on Ø94
removes **15 %** — across-flats is **0.80 × OD** (§3.10), which is a much
flatter, much more visible face. Six shallow flats read as a nut; two deep flats
read as a coupling.

Coupling **lengths** are close but not exact: the game's T51 coupling is
`couplingLenMm: 255`, and the catalogued sizes are **235** (standard) and **250**
(long). T38's coupling OD is `52`; the catalogues print **55**.

### W6 — MM and MF rods share one body diameter, and the sources say they differ

`buildDrillRod()` takes a single OD from `ROD_SPECS` for both types:

```js
  const rs = rodSpec(thread);
  const R = mm(rs.odMm) * 0.5;
```

with `T51: [52, 21.5, 72, 255, 72]`. But the brochure prints **two different rod
bodies for T51**: the **MF rod is round 52**, the **extension (MM) rod is round
46** (`…broshure-english.pdf` p. 56). The MF rod is genuinely the fatter section
because it carries its own coupling.

Also in the same function: the wrench flats are **added slabs** on the collar
(`G.box(T, mm(3), collarL * 0.62, collarR * 1.3)` placed at `collarR * 0.965`)
rather than material removed, and they exist **only on MF rods**. The sourced
flat is on the **extension rod body** — *"Wrench flat 32 mm"* on a Ø39 T38
extension rod (brochure p. 52).

### W7 — The casing pipe has no thread on its joint at all

`buildCasingPipe()` draws a plain box socket (`ro * 1.06` for 64 mm), a plain pin
ring (`ro * 0.985` for 70 mm) and a weld bead — and never calls `addPinThread` or
`addBoxThread`. The measured casing connection is a **3-start, left-hand, R5
round thread** (`HP_Casing_Thread_Drawing.pdf`) and, at Ø101.6–180 with a
2.0–2.5 mm tooth, it is perfectly visible. Its declared material,
`'S355J2 / N80'`, is also not the sourced one — the drawings say **S135, HRC
32–36**, with 42CrMo4 / 42CrMo4V + Q&T as the European equivalent.

### W8 — The RC dual-wall pipe uses an API thread it should not have, an unsourced upset, and a truncated size ladder

`buildRCDualWallPipe()` fits an API 3 1/2 REG joint:

```js
  addBoxThread(T, ctx, g, 'API312', { y0: -mm(12), length: jointDepth, … });
  addPinThread(T, ctx, g, 'API312', { y0: -L + mm(6), length: jointDepth, … });
```

and an upset:

```js
  const upset = ro * 1.16;
```

Against the sources: RC pipe in the catalogues carries **its own named connection
families — DR, ARD, Metzke, Remet, Matrix, Faber, CSR, RDX — not API**
(`Mincon_2024-Drill-Pipes` p. 13). And a **1.16 × upset is not sourced anywhere**;
the drill-pipe photographs show DTH and rotary joints running out **flush** into
the tube, with an oilfield-style upset explicitly a *different* product line
(§3.9).

Its size ladder also stops early. `RC_PIPE` covers **88.9 / 101.6 / 114.3 mm**
with no citation comment. Catalogued RC pipe runs **89–305 mm OD** with
shoulder-to-shoulder lengths **1,000–6,000 mm** (`Mincon` p. 9). The whole
large-diameter half of the family is missing, and the numbers that are there
could not be traced to a source (§8.2).

### W9 — `rodLength` is not actually a contradiction, and the audit can be closed

`AUDIT_ACCURACY.md` finding 30, `HANDOFF.md` §9.1 and `crawler-th.md` W14 record
`rigFactory.js` `rodLen = 3.05` against `data.js` `rodLength: 3.66` as a
divergence. **Both are standard catalogued lengths** — 10 ft and 12 ft — and they
sit one rung apart on a ladder that runs 1220 / 1525 / 1830 / 2440 / 3050 / 3660
/ 4270 / 4880 / 5490 / 6100 mm in two independent catalogues (§3.1). The right
resolution is not "one of these is wrong" but **"pick one owner for the value"**,
which is what the audit already recommends. If a single number is wanted for
top-hammer bench work, **3660 mm (12 ft) is the commonest rung** — it is the only
length that appears in every thread size in both catalogues.

Two related length facts the game does not yet distinguish:

- **Hex drifter rods are ~50 mm longer** than round extension rods (3100 vs 3050).
- **DTH pipe is a different ladder entirely** — metric-native 1.0–8.0 m for most
  rigs, and imperial 6.10 / 6.40 / 7.62 / 8.10 / 9.14 m for large blast-hole rigs
  (§3.9). Using the rod ladder for a DTH string is wrong twice over.

### W10 — §1.1's own guide-nose warning is now STALE, and should not be re-fixed

§1.1 above states *"the game has no guide nose on any rod."* **That is no longer
true.** `addPinThread()` now reads:

```js
  const nose = o.nose === false ? 0 : Math.min(len * 0.28, mm(25));
```

with a doc comment that cites this very drawing: *"the one dimensioned drawing in
the reference library — a 114.3 mm casing pin — ends its thread in a 2.5 x 45
chamfer onto a 25 mm plain nose."* The runout, the 45° chamfer, the plain nose,
the flushing bore on the pin and the box counterbore are all implemented. **The
finding was acted on between §1.1 being written and this pass reading the file.**
Left in place above only because the instruction was to keep §1.1 word for word.

The one refinement still available from §1.2: the game's box counterbore is
`pitch × 0.55` long, where the measured box has a **10–12.5 mm two-step lead-in
on a Ø104.4 mouth** and is cut **118 mm deep against a 99.5 mm pin** — about
**18 % deeper than the pin is long**, so the pin never bottoms.

### W11 — smaller things, in one list

- **Rope-thread length is derived as `pitch × 3.6`** in `buildDrillRod()` and
  `pitch × 4.2` in `addPinThread()`/`addBoxThread()`. Neither is sourced (§8.1).
  The one measured thread length in the library is **2.94 leads**, on a 3-start
  thread — a rule that only exists once `starts` exists (W1).
- **The polished mid-band** (`L * 0.30` of chrome at mid-length, commented *"every
  rod on a working rig has one"*) is not sourced. What *is* sourced is that
  **rubbing surfaces polish** — jaws, guides, drive spindles (§6.5) — so the band
  belongs where the clamp and the guide actually sit, not at a fixed 30 % of
  every rod.
- **No rod in the game carries jaw scars in the sourced pattern.** The gripping
  die is fully dimensioned (§6.5): a **diamond field at 22.5° pitch, R1.3 crests,
  2.5 mm deep**. The current wear marks are three plain boxes.
- **No guide tube or pilot tube exists as a distinct string member** near the
  bit, although the catalogues size them per thread (§4.6) and they change the
  silhouette of a bench-drilling string.
- **Thread protectors are not modelled.** They are bright plastic, they cap both
  ends of every new pipe, and they are the loudest colour in a pipe stack (§6.6).
- **The weld-band colour break is not modelled on any pipe.** Painted tube → dark
  oxidised ring → bare bright joint is the single cheapest change that would make
  a DTH pipe read correctly (§3.10).

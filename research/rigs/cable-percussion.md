# Cable percussion spudder — engineering reference

status: COMPLETE
subject: game rig id `cable-percussion` (tripod / A-frame cable-tool spudder; winch, wire rope, chisel, bailer)
builder: `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` → `buildCablePercussion` (line ~6757)
purpose: GEOMETRY AND MATERIALS reference for modelling. Not a spec sheet, not marketing copy.

> **Naming rule (DOMAIN.md §10):** no real manufacturer name or model designation may appear
> as a product name in the game. Real names below (Dando, Pilcon, Bucyrus, Bauer, Wittig …) are
> cited ONLY as geometry evidence. Do not letter them onto a model, a decal, a nameplate or a
> tyre. Model the shapes; invent the badge.

## 1. Sources read
## 2. What the machine IS
## 3. Proportions
## 4. Component inventory
## 5. Distinctive features
## 6. Materials and paint
## 7. Photo references
## 8. NOT SOURCED
## 9. Domain-truth warnings (what the game currently gets wrong)

---

## 1. Sources read

| Source | Pages / lines | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\drillity-the-game\research\16-site-archetypes.md` | §B.2 (lines 2082–2103), lines 1870–1885, refs at 3552–3638 | **The single most valuable local source.** Names the two families that must not be conflated (US water-well spudder vs. British shell-and-auger tripod), and carries hard cited dimensions for the tripod: ~7 m derrick, 2 t winch, 6.7 m headroom, 150/200 mm casing, ~50 m depth, towed by a 4×4. | YES — primary |
| `C:\Users\henri\Downloads\drillity-the-game\research\06-geotech-water-geothermal.md` | §E.8 (lines 1896–1913), §A.1.7 (279), 589–590, 1199, 1632, 1694, 1721 | Silhouette read ("a tripod and a rope"), tool set (shell / clay cutter / chisel / SPT assembly), casing 150–300 mm, 2-man crew, wire-rope inspection as a named competence, and an existing flag that cable-tool was **wrongly given a hydraulic crawler and drill rods**. | YES — primary |
| `C:\Users\henri\Downloads\drillity-the-game\research\17-site-verification-notes.md` | lines 29–60 | Confirms the offshore placement error; describes the machine as "a winch, a wire rope, a chisel and a bailer". | Partly |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` | lines 6744–7064 (`buildCablePercussion`) | The game's current model: a **truck-mounted** spudder with walking beam, king post, line shaft, belt-driven drums, A-frame mast 9.20 m, 0.62 m stroke, 40–60 blows/min. This is the American water-well spudder, not the British GI tripod. | YES — for §9 |
| `C:\Users\henri\Downloads\Wittig_Drilling_intro-part_I.pdf` | 116 pp. Read pp. 5, 8–9, 66 (slide 72), 104–116 | ~~**Could not be read.**~~ **CORRECTED 2026-09-05 — the earlier "unreadable" verdict was wrong and is struck through rather than deleted, so the record shows what happened.** `pdftoppm` is indeed absent, but **`pdftotext` IS installed** and extracts a clean 43 kB text layer, and **PyMuPDF (`fitz`) is installed** and renders any page to PNG at any scale for the Read tool. Both were used for this pass; see §8.0 for the method. Content: the p. 9 engraving slide *"First types of drill rigs"* with all three captions read directly off a 3× render, and the p. 72 definition of cable drilling. Ch. 11 *"Logging, Geotechnical Drilling and Site Investigation"* is announced in the contents (p. 5) but **is not in Part I** — pp. 104–116 are cost-per-foot, PDC and hybrid bits. | **YES — and it was never blocked** |
| `C:\Users\henri\Downloads\5.Kravspecifikation geoteknik-1.pdf` | whole, `pdftotext -layout` | ~~Same blocker.~~ **Read successfully 2026-09-05.** It is what it looked like: an **Eskilstuna kommun procurement document** for geotechnical consultancy (dated 2025-11-06, tender close 2025-11-17). Zero hits for cable / percussion / SPT / casing / tripod. No geometry, no machine. | **NO — read, but genuinely irrelevant** |
| `C:\Users\henri\Downloads\Geoteknik-broschyr.pdf` | whole, `pdftotext -layout` | Swedish field-geotechnical equipment catalogue (Geomek). **Contains no cable percussion equipment at all** — its GI line is sounding rods, `kolvprovtagare typ ST II` piston samplers, `provtagningsskruv` auger samplers, vane gear and standpipes, with casing (`foderrör`) at **76 / 90 / 99–101 mm**. A *negative* finding about Nordic practice, and a useful one — see §4.2.4. | **Yes, negatively** |
| `C:\Users\henri\Downloads\Field_Reference_Guide_2014_UPDATE_1.pdf` | Baroid *Field Reference Guide* 2014; BAROID GRANULAR and BENSEAL entries | Two treatments written **specifically for this method**: bagged granular bentonite dropped down the hole *"To suspend cuttings while cable tool drilling"*, and the cone-shaped BENSEAL depression dug around the casing while it is driven. Load-bearing for §4.6 and §6.2 — it is the only source in the folder that tells you what the **ground around the hole** looks like. | **Yes — for the site, not the machine** |
| `C:\Users\henri\Downloads\drillity-the-game\research\rigs\si-rig.md` | §1, §8 item 6, §9 rows 1 and 13 | Sibling reference for the site-investigation class. Confirms the game's `spt-hammer` tool is **already correct** (63.5 kg, 760 mm, ISO 22476-3 tolerances, automatic trip) and records the matching open gap — **no source anywhere shows an SPT hammer actually mounted on a rig**. | Yes (cross-check) |
| `C:\Users\henri\Downloads\drillity-the-game\research\rigs\_photos.md` | whole | Checked 2026-09-05 for a cable-percussion entry. Still a skeleton — headings only, no per-id sections. Nothing to draw on yet. | Not yet |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\tools.js` | `buildCableToolChisel` ~9160–9229; `buildDrillingJars` ~9239–9300; `buildBailer` ~9612–9680 | The three tools the rig hangs on the rope. Read READ-ONLY for §9. The chisel's **wear model is the best domain truth in the current build**; the bailer is a correct **American dart bailer**, which is also exactly why it is the wrong tool for family A. | YES — for §9 |
| **Web sources** — full list with URLs, access dates and strength labels in §4 and in the §1 appendix at the foot of this file | The Driller (trade press) ×9, Archway Engineering, Dando, MGS, Consallen, Southern Testing, BAJR, Drillwell, ASTM D1586-11, ISO 22476-3, Elsmere Canyon, DrillerDB, Wellowner.org, FRTR, US Pat. 5,310,014 | **The web is the primary source for this machine, not a supplement** — the local library contains one period engraving and nothing else. Strongest: the **ASTM and ISO standards** (hard tolerances), the **Archway / Dando / MGS / Consallen** manufacturer pages (the only real tool dimensions anywhere), **Southern Testing** (the only published *rig* weight for family A), and the *The Driller* columns written by a working cable-tool driller (the strokes, reel capacities, rope sizes and lay, and the only weights for family B). | **YES — primary** |

status: §1 complete. Further web sources are listed in the appendix at the foot of this file.

---

## 2. What the machine IS

A cable percussion rig is a **stringless** drilling machine: there is no rotation, no drill
string and no circulation of any kind. A heavy steel tool hangs on a **wire rope** over a
sheave at the top of a mast, and a winch (or a walking beam) repeatedly **lifts it a short
distance and lets it fall**. The tool chops or cuts the soil into a slurry; every so often the
tool comes out and a **shell / bailer** goes down the same hole on a second rope to fetch the
spoil back. Steel casing is driven down behind the hole as it goes. It is the oldest drilling
method in commercial use — Wittig calls cable drilling *"the earliest drilling method"*
(`Wittig_Drilling_intro-part_I.pdf` p.72, slide "Overview drilling technology / tooling").

**Two machines wear this name and they must not be conflated** (`research/16-site-archetypes.md`
§B.2):

- **(A) The British shell-and-auger / cable-percussion tripod.** A folding **A-frame or tripod
  derrick ~7 m high**, a **2-tonne winch** driven by a small diesel, mounted on a light trailer
  chassis and **towed by a 4×4**. Used for ground investigation — SPT, U100 samples, monitoring
  wells. Still *"the most widely used method of ground investigation in the UK"*, worked to
  **BS 5930** (`research/16` lines 1873–1884, refs `[GEOINV-CP]` `[GW-CP]` `[SUBSURF-CP]` `[JW-CP]`).
- **(B) The American water-well spudder.** A truck- or wagon-mounted machine with a **walking
  (spudding) beam**, a **bull wheel**, a line shaft and multiple drums. Bigger, deeper, and a
  different silhouette (`research/16` §B.2; and the period engraving *"Seilschlagkran XVI —
  Pumpe und Motor auf dem Fahrgestell"* in `Wittig_Drilling_intro-part_I.pdf` p.9).

Where it stands: a village or rural water-well plot, a brownfield / ground-investigation plot,
a Nordic smallholding (`research/16` §B.2 occurrence table). **Never offshore** — `research/16`
§B.2 and `research/17` give six independent disqualifying reasons and call a spudder on a
platform deck *"the single most laughable thing the game can generate"*.

---

## 3. Proportions

### 3a. The GI tripod (family A) — the best-sourced numbers we have

| Dimension | Value | Source |
|---|---|---|
| Derrick height | **~7 m**, folding for transport | `research/16-site-archetypes.md` line 1875, citing `[GEOINV-CP]` `[GW-CP]` `[SUBSURF-CP]` |
| Working headroom required | **~6.7 m** | same |
| Winch capacity | **2 tonnes**, diesel-engine driven | same |
| Prime mover | towed by a **4×4** — the rig is a light trailer, not a self-propelled machine | same |
| Casing diameter | **150 mm or 200 mm** standard; 150–300 mm range | `research/16` line 1878; `research/06` §E.8 citing `[GE-2009]` |
| Routine depth | **up to 50 m**, 60 m+ in good conditions | `research/16` line 1879 |
| Crew | **2 — driller + second man** | `research/06` line 1721 |

**Ratios to model from (these matter more than the absolutes):**
- derrick height : casing diameter ≈ 7000 : 200 = **35 : 1** — the mast is very tall relative to
  everything else on the machine. The tripod dominates the silhouette; the plant at its foot is small.
- derrick height : working headroom = 7.0 : 6.7 — i.e. the tool string can be pulled almost to
  the crown. There is no spare mast above the sheave.
- The tripod is **taller than the machine is long**. This inverts the proportion of every other
  rig in the game.

### 3b. The wagon/truck spudder (family B) — scaled from the engraving, NOT a spec sheet

Source: `Wittig_Drilling_intro-part_I.pdf` p.9, *"Abb. 31. Seilschlagkran XVI, Pumpe und Motor
auf dem Fahrgestell"*. **Method: scaled off the image against the standing figure at the right,
assumed 1.75 m. These are ±15% reads from a period engraving and must be labelled as such — they
are not manufacturer figures.**

| Dimension | Scaled read | Confidence |
|---|---|---|
| Mast height above ground | **~8 m** | ±15%, image-scaled |
| Chassis overall length | **~5.9 m** | ±15%, image-scaled |
| Large (rear/drive) wheel diameter | **~1.3 m** | ±15%, image-scaled |
| Small (front/steer) wheel diameter | **~0.8 m** | ±15%, image-scaled |
| Mast rake off vertical, at work | **~12–18° leaning back over the chassis** | ±5°, image-scaled |
| Mast height : chassis length | **≈ 1.35 : 1** | ratio is more reliable than either absolute |

### 3c. Tripod leg splay

From the tripod engraving on the same slide (`Wittig` p.9, right-hand figure, "Gravity drill rig
with free falling drill rods"): apex-to-foot geometry reads at roughly **base width : height ≈
0.7 : 1** — a wide, low-angle splay, each leg about 20° off vertical.

`NOT SOURCED`: a dimensioned leg-splay figure for a **modern** GI tripod. `[I]` Modern folding
tripods appear narrower than the engraving. **If two sources disagree, both are recorded:** the
engraving says ~0.7:1; no modern source in this folder gives a number at all. Do not present
either as fact.

### 3d. Weight class

`NOT SOURCED` for either family. The only weight figure available anywhere in the local material
is the **2 t winch capacity** (`research/16` line 1875) — that is the winch, **not** the machine.
The game currently asserts `weightKg: 9400` (`rigFactory.js` line 7052) with no source behind it.

#### 3d-bis. CLOSED 2026-09-05 — the weight gap is now filled from the web, for both families

The statement above was true of the *local* material and stays on the record. It is
no longer true of the document. Web sourcing (all accessed 2026-09-05, details and
strength labels in §4) gives:

| Family | Machine | Weight | Basis | Source |
|---|---|---|---|---|
| **A — GI tripod** | Dando 2000 / 2500 / 3000 class | **1,700 – 1,995 kg** | *"excluding tools or casing"* | Southern Testing, *Cable Percussive Boreholes* technical data sheet, <https://www.southerntesting.co.uk/wp-content/uploads/2019/06/Technical_Cable-Percussive-Boreholes.pdf> `[HIRE]` |
| **B — truck spudder** | B-E 20W on semi-trailer, line for 400 ft | **≈3,400 kg** (7,500 lb) | machine + lines, **no tools** | The Driller 92155 |
| **B** | B-E 22W on semi-trailer, line for 650 ft | **≈4,990 kg** (just under 11,000 lb) | as above | ibid. |
| **B** | Speedstar 71 on full trailer | **≈5,440 kg** (≈12,000 lb) | as above | ibid. |
| **B** | B-E 60L, line for 1,200 ft | **≈7,260 kg** (≈16,000 lb) | as above | ibid. |

**The two families are a factor of 2–4 apart in mass, and BOTH are far lighter than
the game's 9,400 kg.** A GI tripod is a **two-tonne** object — a car, not a lorry.
The largest spudder in the sourced set is 7.3 t as a bare machine. See §9.H.

Same source, and it also tightens §3a: Dando 2000/2500/3000 **working height under
the sheaves 5,200 – 5,460 mm**, boreholes **150 – 450 mm diameter to ~50 m**. Note
that **5.2–5.46 m of clear working height** is *less* than the ~6.7 m headroom figure
already in §3a — the two measure different things (clear height under the crown vs.
site headroom needed to erect) and **both are recorded**.

---

## 4. Component inventory

Read §2 first. **There are two machines here**, and this section keeps them
apart on purpose. §4.1 is the physics both share and the one component that is
common to both and is the whole machine's defining line — the rope. §4.2 is the
**British/Nordic GI tripod (family A)**. §4.3 is the **American truck spudder
(family B)** — the one the game currently builds. §4.4 is the tool set that
lies on the ground, §4.5 the casing, §4.6 the site itself.

**Web citations carry a URL and an access date. All web accesses below are
2026-09-05.** Source strength is stated where it matters: a manufacturer
datasheet or an operator's manual outranks a trade-press column, which outranks
a hire listing, which outranks a hobby page. Where only a weak source exists
that is said plainly.

### 4.1 The wire rope — shared, and the single most important line in the silhouette

Everything else on this machine is a bracket for holding a rope over a hole. If
the rope is wrong the model is wrong, no matter how good the ironwork is.

| Property | Value | Source |
|---|---|---|
| **Lay** | **LEFT LAY.** Not a stylistic choice — *"Left lay rope will turn our tools to the right keeping the joints tight."* | The Driller, *Selecting Wire Lines for a Spudder Drill Rig*, <https://www.thedriller.com/articles/92199-selecting-wire-lines-for-a-spudder-drill-rig> (accessed 2026-09-05). Trade press, written by a working cable-tool driller — **strong for practice, not a standard** |
| Construction | **6 × 19**, *"six sub-wires wrapped around a hemp core"*, each strand of 19 wires | ibid. |
| Grade | **mild plow steel**, chosen because *"Use on a rig subjects this line to a lot of bending over its life"* — i.e. deliberately *softer* than the hardest grade, for fatigue life | ibid. |
| Drill-line Ø, small spudder (20W / Speedstar 55 / Cyclone 35–36) | **⅝ in = 15.9 mm**, rated 1,800 lb (816 kg) | ibid. |
| Drill-line Ø, medium spudder (22W / Speedstar 71 / Cyclone 43) | **¾ in = 19.1 mm**, rated 2,700 lb (1,225 kg) | ibid. |
| Drill-line Ø, large spudder (28L / Speedstar 72, 81) | **⅞ in = 22.2 mm**, rated 4,000 lb (1,814 kg) | ibid. |
| **Sand line Ø** | **⅜ in = 9.5 mm** — *less than half the drill line.* Two visibly different ropes on the same machine | The Driller, *"Let Me Tell Ya": More about Our 22-W*, <https://www.thedriller.com/articles/88569-let-me-tell-ya-more-about-our-22-w> (accessed 2026-09-05) |
| Drill line dead weight | at 600 ft (183 m) of hole, *"the line itself will weigh nearly 550 pounds"* (249 kg) | ibid. |

**Why left lay is a modelling instruction, not trivia.** The rope's own untwist
is the reason a cable-tool hole comes out round instead of chisel-shaped:
*"left-hand-lay wire rope"* that *"twists slightly as it stretches and untwists
on the drop"*, rotating the bit fractionally each blow
(DrillerDB, *Cable Tool Drilling: Why the Spudder Rig Endures*,
<https://drillerdb.com/resources/well-owner/cable-tool-drilling>, accessed
2026-09-05 — a well-owner explainer, **medium strength**, but it agrees with the
trade-press source above). On the mesh: the helix on the drilling line must run
**the opposite way** to every other rope on the model — the sand line, the
casing line, and any winch rope on any other rig in the fleet. If the modeller
builds one rope texture and reuses it everywhere, this machine is wrong.

**How it spools and how it wears.** The drum is a *storage* reel, not a working
winch: the line is set to depth, clamped, and then the beam works it. So the
rope is **wound in multiple untidy layers** with a visible crossover, not
single-layer grooved like a big rotary rig's main winch. The wear is therefore
not uniform — it concentrates in a **band a few metres long** at whatever part
of the rope has been living over the crown sheave and through the clamp at
working depth, and there is a second wear band where it takes the drum's first
layer. See §6.

~~`NOT SOURCED`: rope diameter on a **British GI tripod**.~~ **CLOSED, partly, in
§4.2.0b:** a British manufacturer publishes **10 mm diameter as standard,
breaking load ≈6,500 kg**, and supplies a wire grip sized *"up to 5/8" (19mm)"*.
So the British tripod's wire is **roughly half the diameter of the American drill
line** — 10 mm against 19.1 mm. That one number changes the silhouette: on family A
the rope is a **thin, whippy line**; on family B a **thick, sagging cable**.
Still `NOT SOURCED` for family A: **construction and lay.** Do **not** assume the
American left-lay 6 × 19 applies — British tools screw together on API tapers
above a **swivel**, and a swivel removes the mechanical reason left lay exists.
See §8.

### 4.2 Family A — the British / Nordic ground-investigation tripod

**This is the machine the game's own site research says belongs on its plots**
(`research/16-site-archetypes.md` §B.2, `research/06-geotech-water-geothermal.md`
§E.8) and it is the worse-sourced of the two. Local material gives the envelope;
the detail below is marked by source and the gaps are in §8.

#### 4.2.0 The general arrangement — a complete dimensioned table, found late and worth everything

**This is the single most valuable source in the document and it arrived last.**
Southern Testing, *Technical Data — Cable Percussive Drilling Rig*,
<https://www.southerntesting.co.uk/wp-content/uploads/2019/06/Technical_Cable-Percussive-Boreholes.pdf>
`[HIRE]`, accessed 2026-09-05. The PDF returns raw binary to a web fetcher; it
was extracted locally with `pdftotext -layout`. It is a hire company's published
data for **three real machines**, and it is the only full general arrangement for
family A anywhere in this reference.

| | **rig 2000** | **rig 2500** | **rig 3000** |
|---|---|---|---|
| Winch — **single line pull** (kgf) | **2,000** | **2,500** | **3,000** |
| **Maximum derrick loading** (kg) | **6,000** | **7,500** | **9,000** |
| **Total weight excluding tools or casing** (kg) | **1,700** | **1,995** | **1,850** |
| **Derrick working height under sheaves** (mm) | **5,200** | **5,460** | **5,200** |
| Travelling **length** (mm) | **7,500** | **8,450** | **8,500** |
| Travelling **width** (mm) | **1,810** | **1,850** | **1,810** |
| Operating **height** (mm) | **6,650** | **6,830** | **6,550** |
| Operating **length** (mm) | **4,090** | **4,200** | **4,110** |
| Operating **width between legs** (mm) | **2,072** | **2,072** | **2,072** |
| Operating **width, wheel base** (mm) | **1,810** | **1,810** | **1,810** |

*(Source note, verbatim: "All dimensions are approximate and should be checked
prior to mobilisation to site.")*

**Five things a modeller should take straight off this table:**

1. **THE LEG SPLAY IS NOW SOURCED — AND §3c's ENGRAVING READ IS ABOUT TWICE TOO
   WIDE.** Width between legs **2,072 mm** against an operating height of
   **6,550–6,830 mm** gives **base : height ≈ 0.31 : 1**, i.e. each leg about
   **8.5–9° off vertical**. §3c's period-engraving reads (0.62–0.7 : 1,
   17–20°) describe a *hand rig from the 1800s*, not this machine. §3c already
   suspected this and marked it `[I]`; it is now a measurement. **Build the
   modern GI tripod narrow and steep — 0.31 : 1.** Both readings stay on the
   record.
2. **`width between legs` is identical (2,072 mm) on all three machines** while
   every other dimension changes. The tripod is a **common frame** across the
   range; the winch is what differs. A standard weldment, shared.
3. **The machine is about HALF AS LONG erected as it is on the road.** Operating
   length **4.09–4.20 m** against travelling length **7.50–8.50 m**. The legs do
   not merely fold — they **fold back and project a long way to the rear**,
   roughly doubling the package. That answers a `NOT SOURCED` item: **the
   transport silhouette is a long, low, narrow bundle, not a compact one.**
4. **Travelling width 1,810 mm = the wheel base exactly.** Folded, the tripod
   tucks inside the track of its own trailer.
5. **Derrick loading is 3× the line pull** (6,000 kg over 2,000 kgf; 9,000 over
   3,000). The frame is deliberately far stronger than the winch — which is what
   Consallen say in words: *"The tripod has a capacity exceeding that of the
   wire"* (accessed 2026-09-05).

Same source, in prose, settles several §4.2 questions at once: *"The rig is
equipped with a winch, which is driven by a diesel engine, and a tripod derrick
of about 7m height. The derrick folds down so that the rig can be towed by a
four-wheel drive vehicle."* Boreholes **150–450 mm to 50 m**. Casing is
*"driven (or surged)"*. The on-board kit is **sliding hammers for U100 (U4) and
UT100 (U4T)**, **trip hammers for SPT**, **thin-walled piston samplers** for soft
normally-consolidated soils, plus **falling-head permeability, borehole vane and
packer testing**; the finished hole takes **gas or groundwater monitoring wells**.

Note the wording **"under sheaves"** — plural, which is consistent with two rope
paths at the crown (§4.2.1), though the exact count is still not stated.

#### 4.2.0b The winch is a FREE-FALL winch — and that, not a beam, is the mechanism

Consallen, *Cable Percussion – How to Drill* (D. V. Allen C.Eng. MICE, Consallen
Group Sales Ltd), <https://static.elitesecurity.org/uploads/2/0/2007583/How-to-dril.pdf>
`[MFR]`, accessed 2026-09-05 — again extracted locally with `pdftotext -layout`
after the fetcher returned raw PDF:

> *"The Forager-55 has a free-fall winch, with which the tools are lifted, then
> allowed to fall freely, so they are travelling as fast as possible when they
> strike, for maximum impact."*

**There is no crank, no pitman and no walking beam on family A.** The driller
hoists on the drum, declutches, and the tool free-falls. Both *"long drop"* and
*"short stroke"* techniques are used — the long drop *"suits the directly
controlled winch"*; short surging strokes work a bailer into running sand. This
is why the British stroke is **1–3 m** against the American **0.41–0.89 m**
(§4.4): **a free fall has no mechanical limit; a crank throw does.** If family A
is ever built, the animation is **a drop and a snatch on a drum**, not a see-saw.

**More from the same source, all directly modellable:**

- **The wire is 10 mm diameter as standard, breaking load ≈6,500 kg**
  (6½ tons / 14,300 lb). **This is the only published British GI rope diameter
  found anywhere in this pass**, and it is **about half the American drill line**
  (19.1 mm, §4.1). The supplied **wire grip** takes *"up to 5/8" (19mm) diameter
  wire"* at 2,000 kg SWL, so 10–19 mm is the working band.
- **Snatch blocks and multi-part tackle.** The straight hoist equals the winch
  pull; a **7-part tackle** gives *"about 8 Tonnes of extraction force"* for
  pulling casing, and the sheet photographs a **3-part tackle** in use. Loose
  **snatch blocks** are therefore legitimate ground furniture, and the rope may
  be reeved in several parts rather than running single.
- **There is a named strong-point at the apex.** *"The upper snatch block would
  be attached to the rig frame near the apex at the strong-point provided."*
  Model a **lug or eye on the head casting, separate from the sheave.**
- **The legs are braced and the feet are restrained.** *"When using multi-part
  tackles, all the leg braces should be in place and the tripod feet prevented
  from spreading."* So: **removable leg braces** between the legs, and something
  at the feet — a chain, tie bar or stake. This is the closest thing to a sourced
  answer on footing, and what it says is that the feet are a **spreading risk
  that is actively managed**, not a fixed base plate.
- **Casing-pulling gear.** A **hand-operated 20-ton set** applying *"an equalised
  force to the drive cap totalling 20,000 Kg"*, lifting casing at about **2 m per
  hour**; 30-ton sets exist for 6-inch casing; a power pack can replace the hand
  pump (≥5 l deliverable, **200 bar**). A jacking frame standing over the casing
  is correct scene furniture.
- **Depth is set by the length of wire on the drum** — *"about the same as the
  length of wire supplied with the winch"*, usually **60 m maximum**, up to
  **100 m** in some circumstances. **The drum, not the mast, is the depth limit.**

#### 4.2.1 The tripod / derrick

- **Three legs, not two.** `research/06` §E.8 calls it a *"folding **A-frame /
  tripod mast** over the hole"*, and `research/16` line 1875 a *"tripod derrick
  approximately 7 m in height"*, folding for transport, needing **~6.7 m of
  working headroom** `[GEOINV-CP]` `[GW-CP]` `[SUBSURF-CP]`. Both terms are in
  use because both machines exist; the GI machine that stands over a borehole
  on open ground is a **tripod** — it is self-standing in every direction and
  needs no guys. That is precisely why it is used for ground investigation:
  you set it up in a field, alone, in an hour.
- **Splay — SOURCED, see §4.2.0 item 1. Use 0.31 : 1, about 8.5–9° per leg.**
  The published `width between legs` of **2,072 mm** under a **6,550–6,830 mm**
  operating height settles it. For completeness the two image-scaled reads are
  kept, because they are the *historic* proportion and they are legitimately
  different: §3c's original ~0.7 : 1 / ~20°, and a re-measurement done for this
  pass off `Wittig_Drilling_intro-part_I.pdf` **p. 9**, right-hand figure
  (*"Gravity drill rig with free falling drill rods"*) rendered at 3× with
  PyMuPDF, giving **≈0.62 × apex height, ≈17° per leg** (±5°; the third leg's
  projection is not recoverable from one view). **The old machines splay wide;
  the modern one stands up straight.** If the game wants a period rig, use the
  engraving figure and say so.
- **What the engraving actually shows, and the warning that goes with it.** The
  Wittig p. 9 right-hand figure is a **historic timber-legged gravity rig with
  a hand/spring-pole balance beam and a windlass**, drawn over a cutaway of
  strata with two cased holes and a flared chisel at the bottom of each. It is
  **not** a modern GI tripod and must not be used to set modern proportions —
  only to say that this leg angle is the family's traditional one.
- **Leg section: `NOT SOURCED`.** Tube, square section, channel and timber all
  appear across the family's history (the Wittig engraving legs read as
  **tapered timber baulks**). No modern figure found locally. Do not invent a
  wall thickness.
- **Head / crown: `NOT SOURCED` in dimensioned form.** What is certain from the
  method: the rope must leave the apex **over a sheave**, and there must be
  **two rope paths** because there are two lines (tool line and shell line) and
  they are both in the hole's axis. Whether that is two sheaves at one crown
  casting, or one sheave plus a snatch block, is unsourced.
- **Footing: `NOT SOURCED`.** The engraving shows the legs simply standing on
  the ground. Modern practice, unverified here.

#### 4.2.2 The winch unit

- **2 tonne capacity, diesel driven** (`research/16` l. 1875). That is the
  *winch*, not the machine — see §3d.
- **Skid-mounted**: *"a winch on a small skid-mounted engine"* (`research/06`
  §E.8). So the powered unit is a **separate skid** that sits beside the
  tripod's foot, not a chassis the tripod grows out of. This is the single
  biggest silhouette difference from family B, where everything is one deck.
- **Two lines are implied by the method** — a tool line and a shell/casing line,
  because the shell goes down the same hole the tool came out of. Drum count is
  `NOT SOURCED` from a datasheet.
- **Towed by a 4×4** — *"a mobile tripod rig towed by a 4×4"* (`research/16`
  ll. 1873–1875). The rig is a **light trailer**, never self-propelled.
- **Crew of 2 — driller + second man** (`research/06` l. 1721).
- **Wire rope inspection is a named, certificated competence** for a
  cable-percussion lead driller `[BDA]` (`research/06` ll. 1632, 1694). The rope
  is treated as a safety-critical item in its own right. On the model that
  argues for a rope that is **maintained and dressed, not frayed** — see §6.

#### 4.2.3 Depth, casing, and what comes out of the hole

- **Routine depth up to 50 m**, 60 m+ in good ground (`research/16` l. 1879).
- **Casing 150 mm or 200 mm standard**, 150–300 mm range (`research/16` l. 1878;
  `research/06` §E.8 and l. 589–590 citing `[GE-2009]`).
- **Tools:** clay cutter in cohesive soil, shell/bailer in granular soil, chisel
  for rock and obstructions, plus the SPT drive assembly (`research/16`
  ll. 1876–1877; `research/06` §E.8).
- **Samples taken from the hole:** SPT, U100 undisturbed, disturbed bulk and jar
  samples, water samples at depth, then gas wells and instruments installed
  (`research/16` ll. 1880–1883).
- **Standard:** BS 5930 and Eurocode 7; *"remains the most widely used method of
  ground investigation in the UK"* (`research/16` ll. 1883–1884
  `[SUBSURF-CP]` `[GEOINV-CP]` `[JW-CP]`).

#### 4.2.4 A Nordic caution

`Geoteknik-broschyr.pdf` (Geomek, Swedish field-geotechnical equipment
catalogue, read 2026-09-05 by `pdftotext -layout`) is the only Nordic
ground-investigation catalogue in the folder, and **it contains no cable
percussion equipment at all**. Its ground-investigation product line is
**sounding rods, piston samplers (`kolvprovtagare typ ST II`), auger samplers
(`provtagningsskruv`), vane gear and groundwater standpipes**, with casing
(`foderrör`) in **76 / 90 / 99–101 mm** — i.e. Nordic practice is
**sounding-rig and piston-sampler based**, at casing diameters roughly half the
cable-percussion range. This is a *negative* finding and it matters: the game's
occurrence table (`research/16` §B.2) lists a *"Nordic / smallholding plot"* for
this rig. The catalogue does not support a Nordic **GI** tripod; it leaves the
Nordic case resting on the **water-well** reading only. Flagged, not resolved.

### 4.3 Family B — the American truck spudder (what the game currently builds)

**This family is well sourced and the game gets most of the architecture right.**
The corrections in §9 are about scale and about two specific parts, not about
the concept.

#### 4.3.1 The spudding train — engine → gear → crank → pitman → beam → rope

This is the whole machine. Model it as one kinematic chain and it will read
correctly even at low poly count.

1. **Deck engine.** A separate engine on the deck, not the truck's engine. On a
   22W: *"Deck Engine 60 Horsepower 3 Cylinder"* (≈45 kW) — East West Drilling
   listing for a B-E 22W, <https://ewdrilling.com/Products/Details/1344/Bucyrus-Erie-22W-Cable-Tool-Rig>
   (accessed 2026-09-05; **hire/dealer listing — medium strength**). The game's
   `powerKw: 82` is roughly double this: see §9.
2. **Jackshaft and friction clutch → spudder gear.** *"A small pinion on the
   jackshaft controlled by a friction clutch drove a much larger spudder gear."*
   — The Driller, *In Detail: How Did the Spudder on an Old Drilling Rig Work?*,
   <https://www.thedriller.com/articles/92073-in-detail-how-did-the-spudder-on-an-old-drilling-rig-work>
   (accessed 2026-09-05). **A small pinion driving a big gear** — so the visible
   object beside the beam is a **large-diameter open gear wheel**, and the
   reduction is where the blow rate comes from. On the older *derrick* rigs the
   same job is done by a **band wheel**, *"usually 8-10 ft in diameter"*
   (2.44–3.05 m), belt-driven from the engine — Elsmere Canyon, *Cable Tool
   Rig*, <https://elsmerecanyon.com/elsmerecanyon/oil/cabletoolrig/cabletoolrig.htm>
   (accessed 2026-09-05; **hobby/heritage page — weak-to-medium**, but its
   component naming matches the trade press).
3. **Crank pin in the spudder gear — and the stroke is set by which hole it is
   in.** *"inserting it into one of three holes in the spudding gear"* gives
   the 20W strokes of **18, 24 and 30 in (457 / 610 / 762 mm)**; most cable-tool
   operators ran the longest (ibid., The Driller 92073). The 22W has *"three
   adjustable strokes, those being a short 16-inch meant mainly for fishing, a
   26-inch intermediate stroke, and a 35-inch long stroke"* — **406 / 660 /
   889 mm** (The Driller 88569). **Three visible empty pin holes in the gear
   face is a real, cheap, high-value detail.**
4. **Pitman.** A connecting rod with *"bronze bushings on both ends"* which
   *"tended to wear quickly"* despite greasing (The Driller 92073). So: plain
   bronze bushes, grease nipples, and grease weeping at both eyes — not rod-end
   bearings. A competitor design used *"anti-friction roller bearings"* and a
   centrally-mounted gear with **two** crank arms (ibid.), so a twin-pitman
   variant exists.
5. **Two pitman attachment points on the beam.** For drilling the pitman goes
   *"closest to the pivot point"* — *"slower pickup but faster drop"*; for
   bumping casing it moves outboard and the motion reverses (ibid.). **Model a
   second, unused clevis hole on the beam.**
6. **The spudding beam.** On the classic derrick rig the beam is
   **26 ft × 12 in × 24 in** (7.92 m × 305 × 610 mm), rocking *"like a
   teeter-totter"* on a **samson post** — *"a well-braced upright post"* — and
   it *"raised and lowered the bits about two feet"* (~0.61 m) (Elsmere Canyon,
   accessed 2026-09-05). A **headache post** stands under the beam as
   *"a safety feature that kept the walking beam from dropping if anything came
   loose"* (ibid.) — **the game has no headache post and should.**
7. **The temper screw.** *"attached to the walking beam's end with a clamping
   device that gripped the drilling line"* (ibid.); it *"was used to let down
   the string of tools as the well was drilled"* (Elsmere Canyon / and the
   mechanism as described in The Driller's spudder columns). It is a **screw
   and a rope clamp in one hanger** — the driller feeds the tools down a few
   inches at a time by turning it, then re-clamps higher up the rope. It hangs
   from the beam and the rope passes **through** it. The game already models a
   temper screw with four handles; §9 checks it.
8. **Spudding shoe.** Named as the fitting used at the very start of the hole,
   before there is enough depth for normal beam action (Elsmere Canyon).
9. **Blow rate.** *"15 to 60 strokes per minute"* (DrillerDB, accessed
   2026-09-05). The game's `spuddingMin: '40-60'` sits at the fast end of the
   sourced band — defensible, but the band is wider than the game says.

#### 4.3.2 The reels — three, and they are different sizes

A spudder is *"3 line machine"* in dealer shorthand (Sun Machinery listing text
for a Walker Neer C-28, <https://www.sunmachinery.com/cable.html>, accessed
2026-09-05 — **dealer listing, weak-medium**). The three, with 22W capacities
(The Driller 88569, accessed 2026-09-05):

| Reel | Carries | Capacity | Visual |
|---|---|---|---|
| **Bull reel** | the **drill line** | *"900 feet of ¾-inch drill line, or 1,275 feet of ⅝-inch line"* (274 m / 389 m) | The **biggest** drum. Fat, wide, multi-layered rope |
| **Sand reel** | the **sand line** to the bailer | *"more than 2,000 feet of ⅜-inch line"* (610 m); with 400 ft out it handles *"about 1,400 pounds, and have line speed of more than 750 feet per minute"* (635 kg, **3.8 m/s**) | **Small drum, thin rope, and it is the FAST one.** A friction reel — the bailer comes up quickly |
| **Casing reel** | the casing line | *"will handle about 12,000 pounds"* (5,443 kg) | Heavy, low geared, often the least used |

The three drums are driven off a common shaft through **friction clutches**, and
the driller works them from a **bank of upright levers**. Ratio to model: the
sand line at 9.5 mm against the drill line at 19.1 mm is a **2 : 1 diameter
difference between two ropes on the same deck** — visible, and worth getting
right.

#### 4.3.3 Mast

| Machine | Mast | Source |
|---|---|---|
| B-E 20W | *"32 to 36-foot mast"* = **9.75–10.97 m** | DrillerDB (accessed 2026-09-05), corroborated by The Driller 92155 |
| B-E 22W | *"36 to 40-foot telescoping mast"* = **10.97–12.19 m** | ibid. |
| B-E 22W (one dealer unit) | *"Mast 32' Feet Long"* = 9.75 m | East West Drilling listing (accessed 2026-09-05) — **disagrees with the above; both recorded** |

**Section: single- or double-pole, not a lattice A-frame.** Early portable
machines used *"either single- or double-pole masts that were folded down when
they were moved"*, and their collapsible nature *"never lent them the dramatic
visual impact of standard drilling rig derricks"* (Permian Basin Oil and Gas
Magazine, *Spudding In*, <https://pboilandgasmagazine.com/spudding-in/>,
accessed 2026-09-05 — **trade magazine history piece, medium**). Combined with
the 22W being explicitly **telescoping**, the correct read for a truck spudder
is a **two-leg pole mast of tubular or built-up sections that telescopes and
folds back over the deck**, not the open lattice truss the game builds. See §9.

`NOT SOURCED`: crown-sheave diameter and count on a truck spudder; mast leg
section dimensions; the raising mechanism (ram vs. cable) on any specific model.

#### 4.3.4 Weight class — the numbers the game's `weightKg` must be checked against

All from The Driller, *Mounting and Moving Larger Spudder Drilling Rigs*,
<https://www.thedriller.com/articles/92155-mounting-and-moving-larger-spudder-drilling-rigs>
(accessed 2026-09-05). **These are the drilling machines with their wire lines
and WITHOUT drilling tools** — the article says so explicitly.

| Machine | Line for | Weight | Metric |
|---|---|---|---|
| B-E **20W** on semi-trailer | 400 ft (122 m) | *"about 7,500 pounds"* | **3,400 kg** |
| B-E **22W** on semi-trailer | 650 ft (198 m) | *"just under 11,000 pounds"* | **≈4,990 kg** |
| B-E **60L** | 1,200 ft (366 m) | *"close to 16,000 pounds with the lines but no drilling tools"* | **≈7,260 kg** |
| Speedstar **55** | — | *"about the same as a 20W"* | ≈3,400 kg |
| Speedstar **71** on full trailer | — | *"close to 12,000 pounds"* | **≈5,440 kg** |

**Tool-string weight**, which is what the machine is actually rated by:
1,200–2,000 lb (**544–907 kg**) for a working string (DrillerDB, accessed
2026-09-05). The 22W is rated *"1,500 pounds to 1,800 pounds of tools"* early,
and Series II *"2,500 pounds tools at the surface – but only on the intermediate
stroke. On the long stroke, this rig still is rated at about 1,900 pounds"*
(The Driller 88569) — i.e. **680–1,134 kg**, and the rating *falls* as the
stroke lengthens. That trade-off is the machine's whole character.

#### 4.3.5 Rate of work — because it sets how muddy the site gets

*"10 to 30 feet per day"* (3–9 m/day), *"hard rock can drop to 5-10 ft/day"*
(1.5–3 m/day); a 200 ft (61 m) well is *"7 to 20 working days"* (DrillerDB,
accessed 2026-09-05). `research/16-site-archetypes.md` §B.2 already carries the
harder-sourced figures: *"1.5 to 2.5 feet per hour for bedrock and dense tills…
3.5 to 4.5 feet per hour for silts, clays, and sands"* `[FRTR]` and
*"10-30 feet a day while rotary rigs do 200"* `[WELLOWNER]`.

**Modelling consequence:** the crew is on this spot for **days to weeks**. The
site in §4.6 is not a fresh set-up. It is a lived-in patch.

### 4.4 The tools on the ground — half the scene, and two incompatible sets

**The single biggest trap in this whole document.** The British tripod and the
American spudder do not share a tool set, do not share a connection standard,
and do not even share the *purpose* of the tube that fetches spoil. Building one
tool kit and putting it beside either machine is wrong.

| | **Family A — British GI** | **Family B — American spudder** |
|---|---|---|
| String, top to bottom | swivel / swivel-bail → **sinker bar** → tool | **rope socket** → **jars** → **drill stem** → chisel bit |
| Connection | **`SOURCES DISAGREE`.** Drillwell `[HIRE]` say **1¾" or 1¼" Whitworth**, alternatively **API 2¾" × 3¼", 7 TPI**. Archway and Dando `[MFR]` both specify **2¼" × 3¼" API** pin and box on sinker bars and tools. Manufacturer beats supplier, so **model an API taper joint** — but the Whitworth sizes are real and belong to the *boring rods*, which is probably where the confusion comes from | API taper tool joints (2¼"×3¼", 2¾"×3¾", 4¼"×6"); collars **≈¾" larger in diameter than the stem**, i.e. a visible **upset band at every joint** |
| Stroke of the tool | **1–3 m** — a free winch drop | **0.41–0.89 m** — a crank throw (§4.3.1) |
| Rope termination | a **swivel** on top of the sinker bar — **there is no rope socket in British practice** | a **rope socket**, zinc-poured |
| The spoil tube | the **shell**, which is a *drilling* tool and drives itself in | the **bailer**, which is *only* a cleanout tool on a separate sand line |
| Stuck-tool device | a **sliding hammer** | **drilling jars** |

Sources for the table: Drillwell `[HIRE]`
<https://www.drillwell.co.uk/site-investigation/boring-tools/>; Dando cable
percussion tooling brochure `[MFR]`
<https://www.dando.co.uk/wp-content/uploads/2019/10/cable-percussion-tooling.pdf>;
Archway Engineering `[MFR]` <https://archway-engineering.com/product/claycutter-shell/>;
The Driller `[WEAK]` <https://www.thedriller.com/articles/92301-spudder-drill-strings-lets-start-with-the-socket>.
All accessed 2026-09-05.

#### 4.4.1 The shell (family A) — an open tube with a flap valve, and it drills

| Property | Value | Source |
|---|---|---|
| Nominal sizes | **5½" (140), 7⅝" (194), 9⅝" (245), 11½" (293) mm** | Drillwell `[HIRE]`, accessed 2026-09-05 |
| Full range | **4"–24" nominal**, built to fit inside **BS 879** casing | Archway `[MFR]`, accessed 2026-09-05 |
| **Overall length** | **≈6 ft (1.83 m)**; shorter to order for low headroom | Archway `[MFR]` |
| Sectional version | sections of **3 ft (0.91 m) effective length**, for 6/8/10/12" waterwell casing; comes as a **window section + hanger section + plain section** | Archway `[MFR]` |
| Material | high-tensile steel tube; **shoes heat-treated** for a hard cutting edge | Archway `[MFR]` |
| Weight | **`NOT FOUND`** — no manufacturer publishes shell weights | — |

**The valve is a flat hinged flap — a "clack" — and it is a consumable.**
Drillwell list it as a spare in its own right: *"Clack Valve – Steel or Leather –
To fit inside shell shoe"* `[HIRE]`. Steel is standard (Dando SIT06STCL /
SIT08STCL `[MFR]`); **leather** is offered because it seals water inside the
shell better when bailing loose saturated sand (Archway `[MFR]`; Consallen,
*Cable Percussion – How to Drill*, D. V. Allen C.Eng. MICE,
<https://static.elitesecurity.org/uploads/2/0/2007583/How-to-dril.pdf>, accessed
2026-09-05 `[MFR-ish]`). **It is not a ball.** Ball valves in this trade appear
only in the SPT sampler head and the U100 drive head (§4.4.6, §4.4.7).

**Screw-on replaceable shoe**, and the shoe *type* is a visible variation the
modeller can use for free: Dando and Drillwell both list **plain, serrated,
chisel-end, gravelling and auger-nose** shoes. The shoe thread is deliberately
**coarse pitch** so shoes swap easily and cannot bind (Archway `[MFR]`).

**The full size ladder** — Archway `[MFR]` (mirrored with the table intact at
<https://www.plantautomation-technology.com/products/archway-engineering-uk-ltd/claycutter-shell>,
accessed 2026-09-05, because the shortcode that renders the table on Archway's
own page is broken). **The shell and the clay cutter share this body**, so one
table covers both:

| Nominal | Tool O.D. | Runs inside casing O.D. × I.D. |
|---|---|---|
| 4" | 3½" | 4½" × 3⅞" |
| 5" | 4½" | 5½" × 3⅞" |
| **6"** | **5½" or 5"** | **6⅝" × 5⅞"** |
| **8"** | **7½" or 7"** | **8⅝" × 7⅞"** |
| 10" | 9⅝" or 8⅝" | 10¾" × 9⅞" |
| 12" | 11½" or 10¾" | 12¾" × 11⅞" |
| 14" | 12¾" | 14" × 13" |
| 16" | 14" | 16" × 15" |
| 18" | 16" | 18" × 16¾" |
| 20" | 18" | 20" × 18¾" |
| 24" | 22" | 24" × 22¾" |

**This table is the most useful single object in §4** for a modeller, because it
gives the **annulus**: at the 6" size the tool is 5½" (140 mm) inside a 5⅞"
(149 mm) bore — about **4.5 mm of clearance per side**. The tool is a close but
visibly loose fit, and it swings and knocks on the casing as it goes down.
(Dando quote their two stock shells as **5½" and 7⅝" OD** against Archway's 7½"
for the same 8" nominal — a small maker-to-maker difference, both recorded.)

**Shell vs. sand pump — get this right.** A shell/bailer is an open tube with a
bottom valve only. A **sand pump** *"is a bailer into which has been fitted a
piston and rod"* — hoisting the rod pulls a partial vacuum in the shoe that
sucks in loose sand and water (Consallen, accessed 2026-09-05). Different object,
different silhouette: the sand pump has a **rod sticking out of the top**.

**Naming trap worth modelling correctly:** the size that names a bailer is the
**casing** size, not the tool. A "4-inch bailer" is actually **3½" (90 mm) OD**,
so water can escape past it inside 4-inch nominal casing (Consallen). So the
tool always looks **loose** in the hole, never a piston fit.

#### 4.4.2 The clay cutter (family A) — an apple corer

| Property | Value | Source |
|---|---|---|
| Nominal sizes | 5½" (140), 7⅝" (194), 9⅝" (245), 11½" (293) mm; range 4"–24" | Drillwell `[HIRE]`, Archway `[MFR]` |
| **Overall length** | **≈6 ft (1.83 m)** — the same body as the shell | Archway `[MFR]` |
| Supplied with | **plain shoe + claycutter ring** | Archway `[MFR]` |
| Wall thickness, weight | **`NOT FOUND`** | — |

Consallen's description is the one to model from: it removes clay by cutting and
extracting a solid plug, *"rather like an apple corer"* (accessed 2026-09-05).
So:

- **Open at both ends.** The clay is extruded *up into* the body on impact.
- A **detachable cutting shoe**, screwed on with a deliberately **coarse thread
  so it cannot bind** (Archway).
- A **claycutter ring / retaining ring** just above the shoe holds the plug in.
- **Open slots / windows down the side** to get the clay out. Consallen
  distinguish **"high window"** and **"low window"** cutters — a real, cheap
  variation.
- Emptied with a **swan-neck expressing tool** — a long cranked bar pushed down
  the tube to shove the plug out — levered through the windows, usually **after
  every fall**; or with a scoop if a plastic core retainer is fitted. Retention
  aids for granular ground: **plastic basket catchers, "Valvate" discs, plain
  extrusion rings**, seated on support rings above the shoe (Consallen).

> **The best free piece of set dressing in this whole document.** Consallen
> caption a photograph of *"slugs of clay pushed out of a clay-cutter"* lying on
> the ground beside the tool (accessed 2026-09-05). So a family-A plot has a
> **row of solid cylindrical clay plugs, ~140 mm diameter and up to ~1.5 m long
> before they break**, lying where they were extruded — glossy, grey-brown,
> holding their tool marks, and drying and cracking at the ends. Nothing else in
> the game produces that object. It is instantly legible as "this hole is in
> clay" and it costs one lathe.

**The stubber** belongs in the same laydown and is a completely different
silhouette: a **three-bladed fabricated steel cross-cutter**, 6"–24" nominal,
used like a clay cutter but easy to empty because plastic clay extrudes through
the ring into the spaces between the three legs (Archway `[MFR]`,
<https://archway-engineering.com/product/chisels-and-stubber/>, accessed
2026-09-05). Consallen show one at **140 mm dia driven by a 100 kg sinker bar of
125 mm dia** — a rare published pairing of tool and weight.

#### 4.4.3 The chisel — and the two families dress it differently

**Family A (British).** Archway `[MFR]` (accessed 2026-09-05) distinguish two
constructions, and they look different:

- **Californian chisels** — *specially **forged*** heavy-duty, with **wide water
  courses**; 6" and 8" standard, larger to order; **two lengths only: 5 ft
  (1.52 m) and 1 ft 6 in (0.46 m)**. The short one connects directly to a
  sinker bar.
- **Flat and cross chisels** — ***fabricated*** (welded up), 6"–24" nominal.
  Welded, not forged: the weld beads should show.

Drillwell `[HIRE]` list **tee chisels** and **regular Californian bits** at
**5¾" (146), 7¾" (198), 9¾" (248), 11¾" (298) mm**; Dando `[MFR]` list cross
chisels at 5½" and 7⅝". `NOT FOUND`: **British chisel weights**, and
**cutting-edge width as a figure distinct from the nominal diameter** — for a
cross chisel the blade span ≈ the nominal size, which is the only safe read.
The one hard bound: Consallen's Forager-55 has a **max tool weight of 250 kg**.

**Family B (American).** The Driller `[WEAK]`, quoting a vintage catalogue
(<https://www.thedriller.com/articles/92361->, accessed 2026-09-05):

| Property | Value |
|---|---|
| Diameters | 3, 4, 5, 6, 8, 10 in … to 24 in (over 16 in unusual in water-well work) |
| **Weights** | **50 lb at 3" dia up to 2,400 lb at 24" dia** (23 kg → 1,089 kg) |
| Lengths | catalogue **3½ ft to 8 ft**; in practice **4 or 5 ft** (1.22–1.52 m) |

**The shape is the thing.** End-on, the working end reads as **a letter H with
rounded sides**: the cutting surfaces occupy about **two-thirds of the hole
circumference** and the remaining third is the **water course** that lets slurry
past. In long section the bottom is a **flat V**: **at least 90° and up to 135°**
for unconsolidated ground, flatter for hard rock. Shank round, **API pin** on top.

**Dressing — and this is the §6 material split.** Either **forged** (heated
*"almost yellow hot"*) or **hard-faced** by welding with a nickel-bearing
hardfacing rod and ground back to gauge. So a hard-faced bit's working end is a
**built-up, rougher, differently-coloured weld deposit** against a smooth,
rust-brown round shank. Hardfacing suits softer formations; forging suits hard
rock.

#### 4.4.4 Sinker bar (A) and drill stem (B) — the dead weight

**Family A — sinker bar. Fully dimensioned, and it is the one British tool that
is.** Archway `[MFR]` <https://archway-engineering.com/product/sinker-bars/>
(accessed 2026-09-05):

| Property | Value |
|---|---|
| Diameter | **4½" (114.3 mm)** |
| Effective length | **40 in (1.0 m)** |
| **Weight** | **≈80 kg each** |
| Connections | **2¼" × 3¼" API** pin and box, both ends (intermediate bar) |
| Top bar | carries a **swivel eye**, secured by a **tapered nut and pin** |
| All bars | **two cross holes** (for the bail pin); optional **surging slot** for driving casing |
| Short pattern | **API swivel rod, 0.3 m effective**, for low headroom or starting a hole |

Cross-checks: Dando `[MFR]` list `SISBSWAPI` — *"Sinker Bar, 2¼" × 3¼" API c/w
Swivel Bail"* at **86 kg**. Consallen give the linear rate: a **3½" (90 mm) bar
weighs 60 kg per metre**, sinkers supplied **up to ~100 kg and 140 mm diameter**,
Forager-55 max drill string **3.58 m**, max tool weight **250 kg**. Drillwell
`[HIRE]` list 4½" in four patterns: plain, plain-slotted, swivel, swivel-slotted.
The **slot** is a visible rectangular window near one end — a bar is driven
through it to break a joint.

**And here is the figure that tells you how the crew moves** — the AGS, quoting
the BDA's manual-handling assessment for cable percussion
(<https://www.ags.org.uk/2019/09/manual-handling-operations-have-you-assessed-your-risk/>,
accessed 2026-09-05 `[STD]`):

| Item | Mass |
|---|---|
| Sinker bar | **80 kg** |
| 6" casing lead length | **77 kg** |
| U100 slide hammer | **93 kg** |
| Standard SPT drop hammer (whole assembly) | **115 kg** |

with two-person lifts **over 65 kg high-risk and over 85 kg unacceptable**.
**So nothing on this site is carried. It is dragged, rolled, levered and swung
on the rope.** That is a staging instruction: tools lie where they were dropped,
with drag marks behind them, not stacked neatly on a rack.

**One more sourced figure that separates the families completely.** The AGS page
(accessed 2026-09-05) records that the British GI tool string reciprocates
through *"a stroke of 1 to 3m"*. Against the American spudder's **0.41–0.89 m**
(§4.3.1), **the tripod's stroke is three to five times longer** — because it is
a free winch drop, not a crank throw. See §9.

**Family B — drill stem.** The Driller `[WEAK]`
(<https://www.thedriller.com/articles/92342->, accessed 2026-09-05): a **round
steel bar with a male joint at the top and a female joint at the bottom**,
**2½"–7" diameter**, **6 ft to 28 ft long** (10–20 ft typical). Sizing rules
worth knowing because they set the proportions: **≈200 lb per inch of hole
diameter** (600 lb for a 3" hole, 1,200 lb for 6", 3,200 lb for 16"); stem
diameter **≈75 % of casing diameter**; **length ≤ half the mast height.** That
last rule is a direct check on any model — see §9.

#### 4.4.5 Rope socket and jars — family B only

**Rope socket** (The Driller `[WEAK]`
<https://www.thedriller.com/articles/92301->; East West Drilling `[HIRE]`
<https://ewdrilling.com/Products/Details/61166/Rope-Sockets-for-Cable-Tool>;
both accessed 2026-09-05): a **round heavy-walled steel tube**; the **top is
machined down smaller than the body** — that step is the **fishing neck**; the
bottom is a **female (box) tool joint**. Fishing neck **2"** for a 4-inch string,
**2.75" or 3.25"** for a 6-inch string. The swivel inside runs
**1‑3/16" dia × 5" long** for 3" tools up to **3½" dia × 11" long** for large
tools. `NOT FOUND`: overall socket length and weight.

**How the rope is terminated, because it is visible:** the line is bound with
wire or tape for about half the swivel's length, roughly **2½" of the wires** are
unlaid and brushed out, degreased, the upper end packed with clay or putty, and
the socket **filled with molten zinc** — explicitly **not** lead or Babbitt.
So the top of the socket shows a **bright zinc cone with the rope emerging from
it**, and a **wire or tape whipping** just above. (Historic manila-rope sockets
instead used a marline wrap, a tapered side hole and a knot — Petroleum History
Institute, <http://www.petroleumhistory.org/OilHistory/pages/String/rope_socket.html>,
accessed 2026-09-05 `[WEAK]`. Irrelevant to a wire-rope machine; noted so nobody
models a knot.)

**One more part beside the socket that nobody models: the wire-line saver.** It
looks like **a quarter of a wire-rope sheave** and guides the line through 90°,
with a cylindrical part that slides over the socket neck, so the line does not
kink when the string is laid down (The Driller 92301, accessed 2026-09-05). It
lives on the ground or hangs on the mast, and it is the sort of small
purpose-made object that makes a scene look researched.

**Jars** (The Driller `[WEAK]` <https://www.thedriller.com/articles/92323->,
accessed 2026-09-05): two interlocking links *"like two elongated lengths of a
chain"*, **pin up, box down**, with a visible **gap of about 4 to 5 in** between
upper and lower parts when closed.

| Property | Value |
|---|---|
| Stroke when new | **≈4–5 in** (102–127 mm) |
| Retire when stroke reaches | **12–14 in** |
| Should open per stroke in normal drilling | **less than 1 in** |
| Weight | **65 lb** for a 3-inch string to **over 700 lb** for 12-inch and larger |
| Overall length | **`NOT FOUND`** |

⚠ **Sources genuinely conflict on stroke.** Rig Worker / Netwas `[WEAK]` give
**9–18 in for drilling jars** and **18–36 in+ for fishing jars**, against The
Driller's 4–5 in. Both are weak sources. Read 4–5 in as small-diameter
water-well practice and 9–18 in as general/oilfield, and **do not pick one
silently**. The game currently uses `strokeMm: 500` (19.7 in) — see §9.

Family A does the same job with a **sliding hammer**, used both to free tools
and to drive clay cutters, stubbers and drive tubes by repeated small blows of
about half a metre (Consallen).

#### 4.4.6 SPT — the one part of this document with real tolerances

Because it is standardised, this is the best-sourced hardware in the whole
reference. **The game's `spt-hammer` tool is already correct**
(`research/rigs/si-rig.md` §9 row 13); these figures confirm it and add the
sampler.

**Split-barrel sampler — ASTM D1586-11 Fig. 2, verbatim**
(<https://azmanco.com/blog/wp-content/uploads/2020/08/D1586.17074.pdf>, accessed
2026-09-05 `[MFR/standard]`):

| Ref | Dimension | Value |
|---|---|---|
| B | barrel length | **18.0–30.0 in (0.457–0.762 m)** |
| C | drive-shoe **inside** dia | **1.375 ± 0.005 in (34.93 ± 0.13 mm)** |
| D | split-barrel inside dia | **1.50 +0.05/−0.00 in (38.1 mm)** |
| E | wall / edge thickness | **0.10 ± 0.02 in (2.54 ± 0.25 mm)** |
| **F** | **outside diameter** | **2.00 +0.05/−0.00 in (50.8 mm)** |
| G | shoe taper angle | **16.0° – 23.0°** |

**Correction to the common shorthand:** OD 50.8 mm is exact, but "ID 35 mm" is
only one of **two legal options** — ASTM §3.1.5/§5.3 allow **1½" (38.1 mm) or
1⅜" (34.9 mm)**. North America uses the **upset-wall** 1½" ID; **most other
countries keep the constant-ID 1⅜" barrel**, and ASTM warns N-values may differ
**10–30 %** between them. British suppliers standardise on **50.8 OD × 34.9 ID
with a 24 in (610 mm) split tube**, to **BS EN ISO 22476-3** (Archway / MGS
`[MFR]`).

**The head, and it is a modellable detail.** ISO 22476-3 §4.2 requires a
non-return valve with **ball diameter recommended 25 mm on a 22 mm seating**,
**four vent holes of minimum 12 mm diameter**, and **ball retaining pins**.
Archway/MGS hold the ball with a **threaded brass bush**; standard top thread
**1½" BSW**.

**The hammer — both standards, and they express it differently:**

| Standard | Mass | Drop |
|---|---|---|
| **ISO 22476-3:2005 §4.4** | **63.5 kg ± 0.5 kg** | constant free fall **760 ± 10 mm** |
| **ASTM D1586-11 §5.4.1/§7.4.1** | **140 ± 2 lbf (623 ± 9 N)** — a *force*, not a mass | **30 ± 1.0 in (0.76 ± 0.03 m)** |

Also: ISO caps the **drive weight assembly at 115 kg** total; ASTM at
**250 ± 10 lbm (113 ± 5 kg)**. ISO caps drive rods at **10.0 kg/m** and
straightness at **1 in 200**.

**The automatic trip hammer as an object lying on the ground** (Archway `[MFR]`
<https://archway-engineering.com/product/spt-trip-hammer/>, accessed
2026-09-05): **1.8 m long un-extended, 2.6 m extended**, **complete weight
105 kg** (MGS list **107 kg** — minor vendor discrepancy, both recorded), the
**inner shaft acts as the guide** so the weight strikes the anvil squarely, anvil
with **BW or 1½" BSW box**, and a **safety cross bolt** locking the sliding outer
sleeve to the inner rod for transport — **visible when the hammer is lying on
the ground, and exactly the kind of detail that sells a model.**

**The SPT cone** for gravel: ISO 22476-3 §4.2 substitutes a **solid 60° cone**
for the shoe and the test is reported **SPT(C)**. Archway/MGS supply a 60° solid
nose cone and a 2 ft SPT(C) cone; Dando part `SPTCONE`.

**N-value — and the two standards count it DIFFERENTLY. This was checked twice
and the second check overturned the first.**

- **ASTM D1586-11 §7.3 (American).** Blows are counted per **6 in (0.15 m)**
  increment; **the first 0.15 m is the seating drive**; **N = the sum of the
  second and third 0.15 m increments**, i.e. the interval **150–450 mm**.
- **BS EN ISO 22476-3 (British / European).** **150 mm seating drive, then a
  300 mm test drive** — and the test drive is normally recorded in **four
  75 mm increments**, with **N = the sum of all four**. Logs are written
  `x,x/x,x,x,x`; an incomplete test is logged `N = X/Z` (X blows over Z mm
  achieved). ISO also permits the test drive in at least two 150 mm increments.
  Source: BS EN ISO 22476-3 as quoted in the log key of the Causeway Geotech
  ground-investigation report for Arklow WWTP,
  <https://www.water.ie/sites/default/files/docs/arklow-wwtp/Appendix-G-EIA-Reports/EIAR-Volume4-Appendices/Appendix%2014.8%20Alps%20Site%20-%20Ground%20Investigation.pdf>
  (accessed 2026-09-05) `[STD]` — a real GI report using **Dando 1500 light
  cable percussion** rigs, which makes it a doubly useful document here.

**So "N = the second and third 75 mm increments" is wrong under both standards**
— but **75 mm increments are real and are British practice**, and an earlier
draft of this section wrongly called them a myth. The correct statement is:
**American = 150 mm seating + two counted 150 mm increments; British = 150 mm
seating + four counted 75 mm increments, all four summed.** If the game ever
shows an SPT log, this is the format.

Refusal (ASTM §7.2): 50 blows in any one 0.15 m increment, 100 blows total, or
no advance in 10 successive blows.

**Sampler head vents — the two standards differ here too.** ISO 22476-3 §4.2
specifies **four vent holes, minimum 12 mm diameter**, a **25 mm ball on a
22 mm seating**, and **ball retaining pins**. ASTM D1586 requires *"a ball check
and vent"* but **states no vent diameter or count** — so do not quote an
American figure for it. Both readings came from independent passes and agree on
the substance.

#### 4.4.7 U100 / U4 undisturbed tube — 457 mm, not 450

| Property | Value | Source |
|---|---|---|
| Sample | nominal **100 mm (4") diameter** core | Global Geotech / Dando `[MFR]` |
| **Tube length** | **457 mm (18 in)** — the *manufactured* length | Dando, MGS, Archway, Global Geotech `[MFR]` |
| Core recovered | **≈450 mm** | Global Geotech `[MFR]` |
| Material | **aluminium or cadmium-plated steel** tubes; **steel** body tube for the plastic-liner system | Archway / MGS `[MFR]` |

**Both figures in circulation are right and they describe different things:**
457 mm is the tube, 450 mm is the core that comes out of it.

**MGS specification table** (<https://www.mgs.co.uk/wp-content/uploads/2019/07/U100-System-V1.0-.pdf>,
accessed 2026-09-05 `[MFR]`):

| System | Max OD | Min OD | Area ratio |
|---|---|---|---|
| U100 standard (**OS-TK/W**) | **118.6 mm** | **104.4 mm** | **29 %** |
| U100 plastic liner (OS-TK/W) | **123.8 mm** | **101.6 mm** | **48 %** |
| U100T thin wall (**OS-T/W**) | **110.0 mm** | **104.0 mm** | **11.9 %** |

Each published area ratio reproduces exactly from (MaxOD² − MinOD²)/MinOD²
(29.1 %, 48.5 %, 11.87 %), which confirms Min OD is the cutting-edge internal
diameter. So the **standard U100 wall-plus-shoe stack is (118.6 − 104.4)/2 =
7.1 mm radially** — that is a *derived* figure, and the wall thickness alone is
`NOT FOUND`. This 29 % also ties straight to `research/06`'s note that BS 5930
presupposes a **U100 area ratio not exceeding 30 %**.

**The loose objects around it**, all separate meshes if the modeller wants a
laydown: **cutting shoe** (case-hardened, screwed, plain or serrated edge);
**drive head / "bell housing"** with an **overdrive space and a ball valve** to
let air out of the tube as it drives; **barrel-shaped coupler** for two tubes;
**core catcher + spacing ring**; **plastic push-on or screw-on aluminium caps**;
**sealing wax**; and the **U4 sliding hammer** (Dando `U4HMWCOMP`, *"complete
with Drive Head and Overdrive Tube"* — **mass and drop `NOT FOUND`**). Driving
practice worth knowing for animation: to shear the core off cleanly the driller
**gives the boring bars a full clockwise turn** before extracting (Dando).

**The name.** U100 / U4 = **U**ndisturbed, **100 mm** / **4 inch**. Both are still
daily trade usage, but in the current standard they are a sampling *method*
designation under **BS EN ISO 22475-1:2006**: **OS-TK/W** (open sampler, thick
wall, wet) for the U100, **OS-T/W** (thin wall) for the UT100. Quality classes
replace "undisturbed": standard U100 is **Class 2–3 in clay, Class 3 in silt,
Class 4 in sand/gravel** — and **reduced to Class 4 if water is added to the
borehole**, which on this machine it routinely is (§4.6). That last line is the
whole reason `research/06` §E.8 is rude about the U100.

#### 4.4.8 What is actually laid out on the plot

From the BAJR / Ian Farmer Associates UK geotechnical short guide
(<https://bajr.org/wp-content/uploads/2024/08/Geo-Tec-2024.pdf>, accessed
2026-09-05 `[HIRE/practice guide]`) and MGS `[MFR]`:

| Item | Spec |
|---|---|
| Small disturbed ("jar") samples | **0.5 litre plastic jars** |
| Bulk samples | **30 litre bulk bags** |
| Hydrocarbon samples | **1 litre amber glass jars** and small glass vials |
| Groundwater | **1 litre plastic bottle** |
| U100 tubes | 457 mm, **capped both ends**, wax-sealed, stored and transported **upright** |

⚠ **CORE BOXES DO NOT BELONG ON THIS PLOT.** A first pass through the MGS
core-box datasheet nearly put them here; a second pass caught it. Core boxes are
**rotary rock-coring** furniture. A cable percussion plot has **jars, bulk bags,
capped U100 tubes and the open split spoon** — and core boxes only if the hole
was *followed up* with a rotary run. (For completeness, if a follow-up rotary
hole is staged: MGS `[MFR]`
<https://www.mgs.co.uk/wp-content/uploads/2018/10/Coreboxes-V1.0.pdf>, accessed
2026-09-05 — wooden, pressure-treated, hinged lid and rope handles, channels
60/75/86/100/125 mm; or dark grey high-impact PVC, 3-row **1080 × 520 × 130 mm,
4.3 kg**, 5-row **1080 × 620 × 95 mm, 4.9 kg**.)

**What the labels say**, from a real GI report's log key (Causeway Geotech,
Arklow WWTP, accessed 2026-09-05 `[STD]` — nine boreholes put down with **Dando
1500 light cable percussion** rigs). If the game ever letters a sample tag, these
are the correct characters and they are not a manufacturer's marks, so they are
safe under the naming rule:

| Code | Meaning |
|---|---|
| **U** | nominal 100 mm undisturbed open tube sample |
| **P** | nominal 100 mm undisturbed **piston** sample |
| **B** | bulk disturbed sample |
| **D** | small disturbed sample |
| **W** | water sample |
| **ES / EW** | soil / water sample for environmental testing |
| **SPT** | SPT with split spoon |
| **SPT (C)** | SPT with **60° solid cone** |

Labelling practice (USACE EM 1110-1-1804 extract via PDHonline,
<https://pdhonline.com/courses/c285/EM%201110-1-1804%20F-8.pdf>, accessed
2026-09-05 `[STD]`): a **waterproof duplicate tag goes INSIDE** the container
before sealing and the ID is marked outside as well; on jars the label is glued
**to the container, not the lid**. **Bulk disturbed samples weigh 10–25 kg** in
their bags. And photographic records need **a legible reference board in shot**
(BAJR) — so there is a small chalk or whiteboard sample board lying about,
which is a lovely free prop.

**How much is lying about is set by the sampling schedule** (BAJR, typical UK
cable percussion instruction): two bulk samples from the inspection pit;
**alternating SPT and U100 every 1 m from ground level to 5.0 m**, then every
**1.5 m to termination**; jar samples retained over the SPT range; bulk samples
every metre. On a 20 m hole that is **roughly 15–20 U100 tubes and 20 jars** by
the end of the job. **Lay them out in depth order.**

**Two more site objects that are sourced and are almost never modelled:**

- A **hand-dug inspection pit to 1.20 m below ground level** at the borehole
  position, dug **before** drilling to prove there are no buried services (BAJR).
  A real, open, square hole in the ground right beside the rig, usually with its
  arisings heaped next to it.
- **Casing in 1.5 m (5 ft) lengths, BS 879 flush-butt-threaded, ≈60 kg each**,
  with a drive cap, a shoe, and a **bail and pin through the drive cap's
  cross-hole** for lifting (Consallen). Note this **1.5 m** length for family A
  against the **3.05 m (10 ft)** length for family B (§4.5) — the casing stacks
  look different.

Also on the ground for family A: **square boring rods** 1¼" sq × 1½" Whit or
1½" sq × 1¼" Whit, in **10 ft, 5 ft and 2½ ft** lengths (Drillwell `[HIRE]`);
snatch blocks, D-shackles, swivel safety hooks; and a **tapping down bar**
(Dando `SITAPCBAR`).

> **Note on those square boring rods.** They are **not a drill string** — they
> are handling and driving bars. See §9.C before letting them back onto the
> model.

### 4.5 Casing — the second machine on the site

Casing is not an accessory here. On a cable-tool or shell-and-auger hole the
casing is **driven down behind the bit as the hole advances**, which means there
is a stack of it on the ground, a driving assembly on the rope, and a length of
it standing out of the hole at all times.

| Item | Value | Source |
|---|---|---|
| Casing Ø, GI tripod | **150 mm or 200 mm** standard; **150–300 mm** range | `research/16` l. 1878; `research/06` §E.8 and ll. 589–590, citing `[GE-2009]` |
| Casing Ø, US water well, minimum | *"minimum 4-inch casing"* (102 mm) for hard tooling | FRTR, *Cable Tool*, <https://www.frtr.gov/site/3_2_2.html> (accessed 2026-09-05) — **US federal remediation-technology reference, medium-strong** |
| Casing section length | *"casing is added in 10 foot sections to improve efficiency"* = **3.05 m** | Wellowner.org, *Cable Tool Drilling Method*, <https://wellowner.org/resources/basics/drilling-methods/cable-tool/> (accessed 2026-09-05) — **trade association explainer, medium** |
| Casing material | *"heavy steel pipe"* | FRTR (accessed 2026-09-05) |

**The driving hardware, and it is three separate objects:**

1. **Drive shoe** — a hardened, thicker ring welded on the **bottom** of the
   first casing length; it cuts and protects the casing lip. Named in the
   USPTO / trade literature surveyed 2026-09-05 (see §8 for what is still
   unsourced about it).
2. **Drive head / drive cap** — *"A heavy protective drive head is positioned
   over the end of the water well casing pipe section"* — a thick cap that
   takes the blow so the casing's own top thread is not destroyed
   (US Patent 5,310,014, *Water well drilling accessory… simultaneous driving
   of water well casing pipe sections*,
   <https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5310014>,
   accessed 2026-09-05 — **patent text, strong for mechanism, weak for typical
   dimensions**).
3. **Drive clamp** — *"A large heavy two piece drive clamp"* bolted around the
   **drill stem**, with *"large and heavy bolt and nut fasteners, turned by
   using a wrench"*; the string is then *"raised up and dropped several times to
   drive the water well casing pipe sections"* as the clamp hits the drive head
   (ibid.). **This is the key insight for modelling: the casing is driven by the
   machine's own tool string, using the drill stem as the ram.** There is no
   separate hammer. Model a two-piece bolted collar with big exposed bolt heads,
   battered flat on its underside.

Wellowner.org (accessed 2026-09-05) records a second technique alongside the
drive cap: **drive blocks**, used *"until such time as increased friction is
encountered… enable more energy to be transferred, to assist with driving the
casing down."*

**On the GI tripod** the same job is done with *"a drive cap"* and the winch
(`research/06` §E.8: casing 150–300 mm, *"driven with the same winch and a drive
cap"*).

Visually: a **stack of 3 m casing lengths lying in a rack or on timber
bearers**, a **casing clamp and drive head on the ground or hanging in the
A-frame**, and **one length standing proud of the hole** with its top battered
and its paint gone. Never model a hole without a casing stub standing out of it.

### 4.6 The site — a ground-investigation plot, and it grows through the day

This machine is the simplest in the fleet, so **the scene carries as much of the
story as the rig does**. The rig works one spot for days:
*"10 to 30 feet per day"*, a 200 ft well in *"7 to 20 working days"*
(DrillerDB, accessed 2026-09-05); `[FRTR]` via `research/16` §B.2 gives
*"1.5 to 2.5 feet per hour for bedrock and dense tills… 3.5 to 4.5 feet per hour
for silts, clays, and sands"*.

**The cadence that drives the scene** — this is what makes it a working site and
not a diorama:

- Water goes **in**: *"approximately five gallons of introduced water"* per
  interval (Wellowner.org, accessed 2026-09-05); FRTR gives
  *"generally 10 to 20 gallons if no water is present"* (38–76 l)
  (both accessed 2026-09-05 — **the two disagree by 2–4×; both recorded**).
  So there is a **water container on site**: a butt, a bowser, a drum, or a
  hose run to it. Without a water source the machine cannot work at all.
- Slurry comes **out**: the bailer is run *"after approximately four feet of
  drilling"* (~1.2 m) (Wellowner.org, accessed 2026-09-05). At 3–9 m/day that
  is **roughly 3–8 bailer runs a day**, each one tipping a load of grey-brown
  slurry onto the ground beside the hole.
- **The spoil is a slurry pile, not a cuttings heap.** No flights, no air, no
  mud pump: what leaves the hole is a wet mixture of crushed rock and the water
  the driller poured in. It **spreads and slumps**, it dries to a crust on top
  and stays soft underneath, and each new bailer load lands on the old one.
  The game already builds a `slurry-pile` lathe with a noise-perturbed radius —
  that is the right idea (see §9).

**Drilling-fluid additives are used, and they are a visible bag.** Baroid's
field guide has a treatment written specifically for this method: *"To suspend
cuttings while cable tool drilling — Place BAROID GRANULAR sealing material in
plastic bags. With the tools out of the hole, drop enough bags to get 6 - 10 lbs
(2.7 - 4.5 kg)… to the bottom of hole. If hole is dry, add water"*
(`C:\Users\henri\Downloads\Field_Reference_Guide_2014_UPDATE_1.pdf`, Baroid
Industrial Drilling Products, *Field Reference Guide* 2014, BAROID GRANULAR
entry, read 2026-09-05 with `pdftotext -layout`). The same guide's BENSEAL entry
gives the **casing-driving** ritual: *"Dig a cone-shaped depression around
casing… 6 - 8 in (152 - 203 mm) larger than the outside diameter of the casing
and 2 - 3 ft (60 - 75 cm) deep"*, kept *"filled with dry BENSEAL while driving
the casing"* — at *"3.7 kg/meter of hole"* for a 4 in (102 mm) pipe.

**So the correct ground detail at the hole is not a flat pad.** It is a
**shallow cone-shaped depression 150–200 mm wider than the casing and 0.6–0.75 m
deep**, partly filled with a pale grey-white granular bentonite, with the casing
standing in the middle of it. That is a specific, sourced, cheap and completely
distinctive piece of set dressing, and no other rig in the game has it.

**What else is on the plot** (`research/16` §B.2 occurrence table: rural /
village water-well plot, brownfield / GI plot, Nordic smallholding):

- The **towing vehicle** — for family A a 4×4, parked, because the rig is a
  trailer (`research/16` l. 1875). It does not leave; the crew is two people
  and the vehicle is their store.
- **Sample laydown**: for a GI hole, U100 tubes capped and labelled, jar
  samples, disturbed bulk bags (`research/16` ll. 1880–1882). Laid out in
  **depth order** — the same convention `research/16` records for sonic core.
- A **tarpaulin** over the sample laydown and over the winch when it rains.
- The **casing stack** (§4.5) and the **tool laydown** (§4.4).
- A **muddy patch that grows**: the bailer dumps in the same place, the crew
  walk the same line between the hole, the winch and the laydown, and it rains.
  The mud is **not uniform** — it is a trodden path plus a slurry fan.

**Never offshore.** `research/16` §B.2 gives six independent disqualifying
reasons and `research/17` ll. 29–60 confirms the placement error. See §9.A.
---

## 5. Distinctive features — what identifies each family at thumbnail size

The test: black silhouette, 64 px tall, no colour. If the reader cannot name the
machine, the model has failed.

### 5.1 Family A — the GI tripod. Four things, and the first is 90 % of it.

1. **A tall narrow triangle with nothing inside it.** ~7 m of derrick over a
   plant package that is barely more than a metre tall (`research/16` l. 1875).
   The derrick-height : casing-diameter ratio is **35 : 1** (§3a) — the mast
   dominates and everything else is a low lump at its foot. **The tripod is
   taller than the machine is long.** Nothing else in the game inverts that way.
2. **A single line falling down the middle of the triangle, into the ground.**
   Not a mast-mounted head sliding on a leader — a *rope*, hanging free from the
   apex, entering a hole. `research/06` §E.8 reduces the whole read to five
   words: *"a tripod and a rope."*
3. **Two separate objects: the tripod, and the winch skid beside it.** They are
   not one machine. The skid sits off to one side with its own little engine.
   A modeller who fuses them into one chassis has built family B by accident.
4. **Tools lying on the ground in the frame.** A shell, a clay cutter, a chisel
   — long steel tubes and bars laid down beside the hole. On this machine the
   tools are **outside** the rig most of the time, which is true of almost
   nothing else in the fleet.

**Negative space:** no cab, no tracks, no boom, no hydraulic hoses at the hole
(*"No rotation, no flush, no hydraulics at the hole"* — `research/06` §E.8), no
mast-mounted rotary head, and **no drill rods** (see §9.B).

### 5.2 Family B — the American truck spudder. Five things.

1. **A beam see-sawing above a flat deck.** The spudding beam is the only moving
   thing above the frame and it is horizontal — a **horizontal line crossing the
   mast**, which no other rig in the fleet has. In `rigFactory.js` the builder's
   own header says it: *"an A-frame over a flat deck with a beam see-sawing on
   it, and no mast-mounted head anywhere."* That instinct is right.
2. **A short mast for a drilling rig.** 9.75–12.19 m (§4.3.3) on a truck — so
   the mast is roughly **1.5–2× the truck's length**, not the 2.5× of the
   foundation rig. It is stubby, and it is **a pole, not a truss** (§4.3.3).
3. **A large open gear wheel and a connecting rod, in the open, on the deck.**
   Exposed rotating machinery is the period signature. Three empty crank-pin
   holes in the gear face (§4.3.1).
4. **Three drums of visibly different sizes**, with **two ropes of visibly
   different thickness** leaving them (19.1 mm drill line vs 9.5 mm sand line,
   §4.1).
5. **A slurry pile and a bailer standing on end beside the hole.** The bailer is
   3 m of tube; stood upright on the pad it is a human-height vertical object in
   the frame and it reads instantly.

**Negative space:** no rotary table, no top drive, no mud pumps, no shale
shakers, no pipe racks of *drill pipe* (the racked steel is **casing**), no
circulating system of any kind, and — the one that matters most — **no drill
string** (`hasDrillString: false` in the game's own spec is correct).

### 5.3 The one silhouette rule that covers both

**The rope is straight and the tool is under it.** A cable-tool rig cannot drill
at an angle, cannot deviate, and has no crowd force. Every line in the model
that carries load is either **vertical** (the rope, the tool string, the casing)
or **horizontal** (the beam, the deck, the line shaft). The only diagonals are
structure: the tripod legs, the mast rake, the pitman, the guys. If a modeller
adds a raked feed, a boom, or a hose to the hole, the machine stops being this
machine.

---

## 6. Materials, paint, and where wear and dirt accumulate

Mapped onto the game's material buckets as used in `buildCablePercussion`
(`paint · dark · black · accent · steel · worn · chrome · rubber · glass · mud`).

**The governing fact: this is the oldest machine in the fleet and it has been
repaired more times than it has been repainted.** The B-E 20W/22W generation ran
*"from about 1878 into the 1950's"* as a rig type (Elsmere Canyon, accessed
2026-09-05) and the surviving machines are still working. Nothing on it should
look new except the parts that get replaced: the rope, the bit, the bushings.

| Surface | Material | Reasoning / evidence |
|---|---|---|
| Mast, beam, deck, engine cover, drum frames | **painted steel, one colour, badly** — and the paint is **layered**: an old livery showing through a newer one at every edge and weld. A machine this age has been resprayed by owners, not by a factory | `[I]` from the machine's age and second-hand market (Sun Machinery's cable-tool list, accessed 2026-09-05, is entirely used stock across a dozen marques) |
| The spudding beam | on the classic derrick rig the beam is **timber** (26 ft × 12 in × 24 in, Elsmere Canyon accessed 2026-09-05); on a 20th-century truck spudder it is **steel**. The game builds a laminated timber-and-steel hybrid, which is a defensible reading of the transition but is `NOT SOURCED` as a real construction | see §9 |
| Open gear, crank, pitman | **bare oily steel**, not painted — running surfaces. The pitman has **bronze bushings** at both eyes which *"tended to wear quickly"* despite greasing (The Driller 92073, accessed 2026-09-05), so: **bronze/brass colour at the two eyes only**, and grease weeping from both |
| Line shaft, pulleys, belts | steel shaft polished bright where the pulleys and clutches run, **dull and rusty between**. Flat leather belts on the oldest machines (Elsmere Canyon), V-belts later | `[I]` |
| **Wire rope** | **worn / dark steel with a bright crown.** Mild plow steel, 6 × 19 on a **hemp core** (The Driller 92199, accessed 2026-09-05) — so the rope is slightly soft-looking, not stiff-bright like a modern IWRC rope, and it **compacts and flattens** where it beds | see below |
| Chisel / bit — **the two-material rule** | the **working face** is bright, peened, and *narrower than it started*; the **shank** is dark, scaled and oily. `tools.js` `buildCableToolChisel` already does exactly this — a `bright` edge and land on a `steel` body, with the edge width shrinking from `R × 1.0` to `R × 0.90` with wear, commented *"the edge wears IN, so the hole goes undersize and the driller gauges it."* **That is the single best piece of domain truth in the current build. Keep it.** |
| Casing | **bare steel, rusting**, with the **top length battered flat** where the drive head has been hit hundreds of times, and a **bright ring** where the drive clamp grips | §4.5 |
| Bailer | steel tube, **bright and polished on the outside over its lower two-thirds** — it goes down a cased hole and comes back up scraping the casing wall, several times a day. Inside: permanently wet grey slurry | §4.6 cadence |
| Cab glazing, truck | glass and painted steel — but this is a **light, old truck**, not modern plant | `rigFactory.js` builds a 6.30 m chassis; see §9 |

### 6.1 Where the wear actually is — five specific places

1. **The rope, in bands — not evenly.** The drum is a *storage* reel; the working
   length is set once and then the beam works it (§4.1). So there is a **worn
   band of a few metres** where the rope lives over the crown sheave at working
   depth, a **second band** at the temper-screw clamp, and a **flattened,
   crushed inner layer** on the drum. At 600 ft of hole the line alone weighs
   *"nearly 550 pounds"* (249 kg, The Driller 88569, accessed 2026-09-05) — it
   is a heavy, sagging, oily object, and it is dressed with rope grease because
   its inspection is a certificated competence (`research/06` ll. 1632, 1694).
   **Do not model it as a clean bright cable.**
2. **The crown sheave groove**, polished to a mirror in a narrow band and
   nowhere else.
3. **The two pitman eyes**, with grease pushed out and dirt stuck in it — the
   sourced wear point on the whole machine (The Driller 92073).
4. **The underside of the drive clamp and the top of the drive head** (§4.5) —
   two mating faces that have been hammered together thousands of times.
   Mushroomed, bright, and slightly out of shape.
5. **The lever tops.** The driller runs this from a stand of upright levers, all
   day, by feel. The paint is gone from the top 150 mm of every lever and
   nowhere else.

### 6.2 Where the mud actually is — and it is not where the game puts it

**The mud on this machine comes out of the hole in a bucket and is thrown on the
ground.** It does not come off spinning flights (auger), off a shaken bucket
(rotary Kelly), or out of a return line (mud rotary). That gives a specific and
unusual distribution:

- **A slurry fan on the ground**, centred where the bailer is tipped — one
  place, hit 3–8 times a day (§4.6), so it is a **layered, slumped, crusted
  pile**, not a heap of cuttings.
- **A wet drip line** between the hole and the dump point, because the bailer is
  swung across that arc full.
- **The bailer's own outside**, wet from bottom to about two-thirds up.
- **The lower 0.5 m of the casing stub** and the cone-shaped depression around
  it (§4.6) — grey bentonite, not brown mud, if BENSEAL practice is followed
  (Baroid *Field Reference Guide*, read 2026-09-05).
- **Boot mud on the deck plate and the ladder rungs**, and on the lever stand's
  footwell.
- **The tools lying on the ground are dirty on the side that is DOWN**, and
  cleaner on top. A tool that has been lying on the pad since yesterday has a
  dry crust; one just pulled from the hole is wet and shining.

**What must NOT be muddy:** the mast above about 2 m, the beam, the gear, the
crown. Nothing sprays on this machine — there is no rotation and no circulation
to throw anything. Height-graded mud that reaches the masthead is a rotary-rig
habit and is wrong here.

---

## 7. Photo references

**There are none in the local library, and that is the headline of this
section.**

A full sweep of `C:\Users\henri\Downloads\` top level (272 image files matching
`*.jpg *.jpeg *.png *.webp`, listed 2026-09-05) returned **no cable percussion
rig, no tripod, no spudder, and no ground-investigation plot.** The only drilling
images present are `Rotary_Drilling_Rig_1000_0001.jpg` (rotary-Kelly render),
`Surface_Drill_Rig_1000_0001.jpg`, `surface_top_hammer_drill_rigged_01.jpg` and
`surface-drill-rig-for-quarrying-and-mining-smartroc-d65-3d-model-77345d1f1d.webp`
— all wrong class, useful only as negative reference. The in-repo photo index
`research/rigs/_photos.md` was checked on 2026-09-05 and is still a skeleton with
no per-id sections, so it adds nothing here yet.

| Image | What it is | Useful for |
|---|---|---|
| `C:\Users\henri\Downloads\Wittig_Drilling_intro-part_I.pdf` **p. 9**, middle figure — *"Abb. 31. Seilschlagkran XVI, Pumpe und Motor auf dem Fahrgestell."* | **The only usable image of this machine family anywhere in the local library.** A period engraving of a wagon-mounted cable-percussion crane. Rendered at 3× with PyMuPDF for this pass | **Family B ancestor.** Raked braced two-leg derrick; **three long guy stays running forward from the crown** — a **period** feature of the wagon-mounted ancestor, and deliberately NOT raised as a §9 warning, because the sourced 20th-century truck spudder carries a self-supporting **telescoping** mast (§4.3.3). Use guys only for a period build; engine and pump on the chassis; **iron-tyred spoked wheels**, rear larger than front; the hole and a standing operator **behind** the wagon, with a hand lever at the collar. Proportions in §3b |
| ibid., **p. 9**, right figure — *"Gravity drill rig with free falling drill rods"* | Period engraving of a **timber-legged tripod** over a cutaway of strata, with a **spring-pole / balance beam** on a trestle, a **windlass**, and two cased holes each ending in a flared chisel | **Leg splay only** (§4.2.1, §3c). It is a hand rig, not a modern GI tripod — do not copy its beam or its windlass onto family A |
| ibid., **p. 9**, left figure — *"Abb. 114. Freifall-Bohrkran XXII auf einem Fahrgestell."* | A **free-fall** drill crane: horizontal jib, chain fall | **Contrast only.** This is a *different* method (free-fall rods, not a cable-percussion tool string). Do not merge it into the reference |
| ibid., **p. 72** (slide "Overview drilling technology / tooling") | Text, not image: *"Cable drilling — operate by repeatedly lifting and dropping a heavy string of drilling tools into the borehole"*, *"the earliest drilling method"*, dated **"Late 1800"** on the timeline | The one-sentence definition, and the date bracket |
| `Rotary_Drilling_Rig_1000_0001.jpg`, `Surface_Drill_Rig_1000_0001.jpg`, `surface_top_hammer_drill_rigged_01.jpg`, `…smartroc-d65…webp` | Rotary-Kelly / surface-drill renders | **Negative reference only** — these are the silhouettes this machine must not resemble |
| `C:\Users\henri\Downloads\Atpa\` (≈40 files) | Down-the-hole bits and drill heads, per `foundation-bg.md` §7 | **Tool steel finish only.** No percussion tools, no cable-tool bits |

**What would close this section**, in priority order, if the owner can drop
images into Downloads:

1. **One side elevation of a British GI tripod erected over a hole**, showing
   the full leg length, the crown and the winch skid together.
2. **One close-up of the tripod crown** — this is the single least-sourced part
   of the whole document (§8).
3. **One shot of the tool laydown**: shell, clay cutter, chisel, sinker bar side
   by side on the ground, with something for scale.
4. **One folded tripod on its trailer**, to settle the transport silhouette.
5. **One truck spudder deck** from above-front, showing the gear, pitman, beam
   and three drums in one frame.
---

## 8. NOT SOURCED

An honest list. **None of these may be invented.** It is long because the
sourcing on this machine is genuinely thin — one period engraving locally, and a
web trail that runs through trade press and hire sheets rather than
manufacturers' general arrangements. A long §8 is the correct outcome here, not
a failure.

### 8.0 First, a method note — because a previous pass got this wrong

The earlier draft recorded `Wittig_Drilling_intro-part_I.pdf` as unreadable
because the Read tool's PDF path needs `pdftoppm` (poppler) and it is not
installed. **That conclusion was wrong and it cost a source.** On this machine:

- **`pdftotext` IS installed** and extracted a clean text layer from every PDF
  tried, including two web PDFs that a fetcher returned as raw binary.
- **PyMuPDF (`fitz`) IS installed**, so any page of any PDF can be rendered to
  PNG at arbitrary scale and then read as an image.
- `pdfplumber`, `pypdf` and `PIL` are also present.

Both of those routes were used for this pass. **If a future agent hits a PDF,
try `pdftotext -layout` and a PyMuPDF render before recording it as blocked** —
and note that WebFetch saves binary PDFs to
`~/.claude/projects/<project>/tool-results/`, where `pdftotext` can reach them.
That trick is what produced the general-arrangement table in §4.2.0.

### 8.1 Family A — the GI tripod

- **Leg section.** Tube, square section, channel or built-up? **Outside
  dimension and wall thickness unknown.** Not published by any source reached.
  The one thing that *is* known is that the leg frame is a **common weldment
  across a whole model range** (identical 2,072 mm width between legs on three
  different machines, §4.2.0) — so it is a standard part, and its drawing exists
  somewhere.
- **Number of leg sections and how they join.** Whether the legs telescope,
  pin, or fold at a knuckle. The published travelling-vs-operating length
  (§4.2.0 item 3) proves they fold back and project rearward; **the joint itself
  is unsourced.**
- **The feet.** Consallen require the *"tripod feet prevented from spreading"*
  under multi-part tackle, which tells us there is a **restraint** and that
  spreading is the failure mode — but **not what the foot is.** Spike, plate,
  shoe or bare leg end: unknown.
- **The head casting.** Form, material, whether cast or fabricated. Only two
  facts: there are **"sheaves"** (plural, §4.2.0) and there is a **"strong-point
  provided"** near the apex for a snatch block (§4.2.0b).
- **Sheave count and diameter.** Two rope paths are implied by the method and by
  the plural in the source; **neither the count nor any diameter is published.**
- **Drum count on the winch.** Two is implied (tool line + shell/casing line);
  never stated. Drum diameter, rope capacity, line speed: all unknown.
- **The engine.** *"a diesel engine"* is the entire published description. Make,
  type, cooling, and **power in kW or hp: NOT SOURCED.** Note this is a real
  gap for the game, which asserts `powerKw`.
- **Clutch and brake.** A **free-fall winch** implies a declutchable drum and a
  brake, but the type (band, disc, dog, foot pedal, hand lever) and the **number
  and arrangement of operating levers** are unsourced. The operator's station is
  undescribed.
- **Trailer.** Axle count, tyre size, jockey wheel, drawbar type, stabiliser
  jacks. Only the **1,810 mm wheel base** and **1,810–1,850 mm travelling
  width** are published.
- **Wire rope construction and lay.** Diameter is now known (**10 mm**,
  §4.2.0b). Construction and lay are not, and **the American left-lay 6 × 19
  must not be assumed** — the British string carries a **swivel**, which removes
  the mechanical argument for left lay. This is a genuine fork, not a detail.
- **Erection method.** Whether the tripod is raised by hand, by its own winch, or
  by a gin. Unsourced.
- **Rope inspection / discard criteria** under LOLER or BDA guidance, beyond the
  fact that wire-rope inspection is a certificated competence (`research/06`).

### 8.2 Family B — the truck spudder

- **Crown sheave count and diameter** on a truck spudder. Nothing found.
- **Mast leg section dimensions** and whether the sections are tubular or
  built-up. Only *"single- or double-pole"* and *"telescoping"* as words.
- **The mast raising mechanism** — ram, cable, or gin — for any specific machine.
- **Spudder-gear diameter** on a truck spudder. The **8–10 ft band wheel** figure
  belongs to the older *derrick* rig, not to the truck machine.
- **Belt vs. chain vs. gear** drive from engine to jackshaft on a truck spudder.
  A pinion-to-gear final drive is sourced; what feeds the jackshaft is not.
- **Deck layout dimensions** — where the drums sit relative to the mast foot and
  the beam pivot, in millimetres.
- **A general-arrangement drawing for ANY spudder.** None found. Every family-B
  dimension in this document is a single quoted figure from prose, not a
  drawing.
- **Truck chassis** make/class, axle configuration, and whether outriggers are
  standard.

### 8.3 The tools

- **Weights of every British tool: shell, clay cutter, stubber, flat chisel,
  cross chisel, Californian chisel.** Archway, Dando, Drillwell, Drilling
  Supplies UK and Global Geotech all publish diameters and lengths and
  **withhold weights**. The authoritative list is inside the **BDA *Guidance for
  the Operation of Cable Percussion Rigs and Equipment***, which is
  **members-only**. That document is the single highest-value thing anyone could
  add to this reference. (The exceptions that *are* published: **sinker bar
  80–86 kg**, **U100 slide hammer 93 kg**, **SPT drop hammer assembly 105–115 kg**,
  **6" casing lead length 77 kg**, **1.5 m casing ≈60 kg**.)
- **Clay cutter wall thickness.** Only the relative statement that sectional
  tools are thicker-walled.
- **British chisel cutting-edge width** as a figure distinct from the nominal
  diameter, and **British chisel lengths** other than the Californian 5 ft /
  1 ft 6 in.
- **Rope socket overall length, OD and weight.** Only the internal swivel
  dimensions are published.
- **Drilling jars overall length**, and **the stroke figure is contradicted
  between sources** — 4–5 in (new) vs 9–18 in (drilling) vs 18–36 in (fishing).
  Both readings are in §4.4.5; **do not silently pick one.**
- **U100 tube wall thickness and tube weight** as direct figures. Only OD/ID
  pairs are published; the 7.1 mm in §4.4.7 is *derived*, and is labelled so.
- **U100 / U4 sliding hammer drop height.** Mass is known (93 kg); drop is not.
- **SPT cone diameter.** The 60° angle is in the standard; the diameter is not
  stated by any source reached.
- **ASTM vent hole count and diameter** on the split spoon. ASTM requires *"a
  ball check and vent"* and gives no number; **ISO does** (four vents, min
  12 mm) — so quote ISO, never ASTM, for that figure.
- **Where an SPT hammer physically mounts on a rig.** `research/rigs/si-rig.md`
  §8 item 6 records the same gap independently: *"No source read shows an SPT
  hammer fitted to a machine."* The tool is well documented; its mounting is not.
- **A "sample crate"** as a defined product. UK practice uses jars, bulk bags
  and (for rotary follow-up only) core boxes; no standardised crate found.

### 8.4 Photographs, paint and everything visual

- **No photograph of either family exists in the local library** (§7). One period
  engraving, and nothing else.
- **Paint colours and livery placement** for either family. Entirely unsourced.
  §6's account of layered, much-repainted finish is reasoning from the machines'
  age and second-hand market, and is labelled as such — it is **not** a sourced
  colour.
- **The folded tripod on its trailer**, as an image. The *dimensions* are now
  known (§4.2.0) but nobody has seen it.
- **Wittig Part II.** The contents page promises Ch. 11 *"Logging, Geotechnical
  Drilling and Site Investigation"* — **it is not in Part I**, and Part II is not
  in the folder. If it exists it is the most likely local source of a
  geotechnical tripod figure.

---

## 9. Domain-truth warnings — what the game currently gets wrong

Read against `buildCablePercussion`,
`C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` ll. 6744–7064,
and `buildCableToolChisel` / `buildDrillingJars` / `buildBailer` in
`src\rig\tools.js`. **Read-only; nothing under `src\` was modified.**

**The current spec block, quoted verbatim** (`rigFactory.js` ll. 7040–7060):

```js
spec: {
  id: 'cable-percussion', name: 'Kilmar CP-24 Shellhand',
  klass: 'Cable-tool percussion spudder', weightKg: 9400, powerKw: 82,
  mastM: mastH, strokeMm: Math.round(strokeM * 1000), spuddingMin: '40-60',
  hasDrillString: false, torqueNm: 0, feedKn: 0, rotationRpm: 0,
  lines: 'Drilling line, sand line, casing line',
  toolString: 'Rope socket, drilling jars, drill stem, chisel bit',
  cuttingsRemoval: 'Bailed — the string comes out every few feet',
  holeMm: '150-460', maxDepthM: 250,
  note: 'Nothing rotates and nothing circulates: the chisel is dropped, and the hole is bailed',
  methods: ['cable-tool'],
  frameRadius: 7.2,
},
```

with `mastH = 9.20` and `strokeM = 0.62` (ll. 6757–6758).

**Start with what is RIGHT, because most of it is.** `hasDrillString: false`,
`torqueNm: 0`, `feedKn: 0`, `rotationRpm: 0`, the three named lines, the tool
string order, `cuttingsRemoval: 'Bailed'` and the `note` are all **correct and
well judged**. The builder's header comment — *"a mast, a crown sheave, a walking
beam, three drums and a rope"* — is a genuinely good description of family B. The
fictional name `Kilmar CP-24 Shellhand` satisfies `DOMAIN.md` §10. **This is not
a broken rig.** The warnings below are ranked by how badly each one would read to
someone who knows the machine.

---

### RANK 1 — placement. Get these wrong and nothing else matters.

**9.A — Never offshore. This is the headline error and it is already documented.**
`research/16-site-archetypes.md` §B.2 gives **six independent disqualifying
reasons**, any one sufficient: no pressure control (*"does not use any
circulation fluids"* `[FRTR]`, and you cannot land a BOP on a slack cable); no
circulation; depth *"approximately 100 feet or less"* `[WELLOWNER]` against
platform wells fanning *"over 10 km"*; it cannot deviate; rate of *"10-30 feet a
day while rotary rigs do 200"*; and **Zone 1 DSEAR/ATEX** — *"an open-deck diesel
spudder with a friction clutch is not, and cannot be, certified for that."*
`research/17-site-verification-notes.md` ll. 29–60 confirms the placement error
is reachable. `research/16` calls a spudder on a platform deck *"the single most
laughable thing the game can generate."* **Action: a hard exclusion in the site
generator, not a weighting.**

**9.B — The single `cable-percussion` id is doing the work of two machines, and
the game built the wrong one for its own sites.** `research/16` §B.2 states it
plainly: *"The game's single `cable-tool` id conflates two machines that share a
principle and share no site."* The builder is unambiguously **family B** — a
truck chassis, a walking beam on a king post, a line shaft with belt pulleys,
three drums. But the occurrence table puts this rig on a **brownfield / GI plot**
and a **Nordic smallholding**, and for those the correct machine is **family A**,
whose entire mechanism is different (§4.2.0b: a **free-fall winch**, no beam, no
crank, no pitman, stroke **1–3 m** instead of 0.62 m). §3a's ratio makes the
visual gap concrete: family A is a **7 m tripod over a 4.1 m footprint weighing
1.7–2.0 t**; family B is a **9–12 m mast on a 6.3 m truck weighing 3.4–7.3 t**.
**Action, in preference order:** (1) split the id, or (2) keep family B and
restrict its sites to the rural/village water-well plot, or (3) accept the
mismatch **explicitly in `DOMAIN.md`** rather than silently. What must not happen
is a GI plot with a truck spudder on it and no note saying why.

---

### RANK 2 — the silhouette and the mechanism.

**9.C — Residual drill-rod DNA on a machine that has no drill string.**
`research/06` §E.8 records that `DESIGN_EXPANSION.md` §4 already flagged
cable-tool as *"wrongly given a hydraulic crawler and drill rods"*. **The crawler
is gone — that fix landed.** The rods have not fully gone:

- `dyn.rodLen = 6.0` (l. ~6949) on a rig whose own spec says
  `hasDrillString: false`.
- `const rack = buildRodRack(...)` and `dyn.rodRack = rack` (ll. ~7008–7011).

The racked steel is *physically* fine — it is **casing**, and a casing stack is
correct and required (§4.5). The problem is that it is **named and wired as rod
handling**, so any generic rod-add animation or UI that keys off `dyn.rodRack` /
`dyn.rodLen` will make this machine trip and add rods, which it can never do.
**Action: rename to a casing rack and set `rodLen` to the casing length actually
modelled.** Note the rack is built at `len: 3.0` — which is **exactly right for
family B** (*"casing is added in 10 foot sections"*, 3.05 m) and **wrong for
family A** (**1.5 m** lengths, §4.4.8). A nice detail if the families are ever
split.

**9.D — The mast is built as a lattice truss; the sourced portable spudder mast
is a pole.** `buildCablePercussion` emits a two-half lattice via `pushMember`
with 55/42 mm legs and 24/28/20 mm bracing over 3–5 bays per half. The sourced
description of early portable machines is *"either single- or double-pole masts
that were folded down when they were moved"*, whose collapsible nature *"never
lent them the dramatic visual impact of standard drilling rig derricks"*
(Permian Basin Oil and Gas Magazine, accessed 2026-09-05 `[WEAK-MEDIUM]`), and
the 22W mast is explicitly **telescoping** (DrillerDB, accessed 2026-09-05).
A telescoping mast is a **nest of tubes or built-up sections**, not an open
truss. **This is the biggest single silhouette error**, because the mast is the
tallest thing in frame. `NOT SOURCED`: the actual section dimensions (§8.2), so
this is a change of *type*, not of numbers.

**9.E — The mast is shorter than any sourced machine, and far too short for the
depth claimed.** `mastM: 9.20`. Sourced: **9.75–10.97 m** (32–36 ft) for the
*smallest* common spudder and **10.97–12.19 m** (36–40 ft, telescoping) for the
next size up; one dealer listing gives 9.75 m for a 22W and is recorded as
disagreeing (§4.3.3). Meanwhile `maxDepthM: 250` (820 ft) is a **60L-class
depth** — the machine with *"close to 16,000 pounds"* of mass and 1,200 ft of
line. **A 9.20 m mast with a 250 m depth rating is internally inconsistent.**
There is also a sourced proportional rule that catches it: on family B the drill
stem's **length must be ≤ half the mast height** (The Driller 92342, accessed
2026-09-05), which caps the string this mast can rack. **Action: raise the mast
to ~11 m, or drop `maxDepthM` to ~120–150 m. Not both as they stand.**

---

### RANK 3 — the numbers in the spec block.

**9.F — `weightKg: 9400` is heavier than every machine sourced in either
family.** The full bracket, from §3d-bis:

| | Weight | Basis |
|---|---|---|
| GI tripod (family A) | **1,700–1,995 kg** | excluding tools or casing |
| Small spudder (20W class) | ≈3,400 kg | machine + lines, no tools |
| Medium spudder (22W class) | ≈4,990 kg | as above |
| Large spudder (60L class) | ≈7,260 kg | as above |
| **The game** | **9,400 kg** | unstated |

**It is not necessarily wrong** — the game's machine is **truck-mounted**, and a
light truck chassis with a cab, outriggers and a full deck could plausibly carry
a 5 t drilling machine to a ~9.4 t gross. **But the figure is unsourced and its
basis is undeclared, and that is the actual defect.** Every published weight in
this trade is quoted *"excluding tools or casing"* or *"with the lines but no
drilling tools"*. **Action: either state that 9,400 kg is a gross vehicle weight
including the carrier, or bring it to ~5,000 kg to match the machine class the
rest of the spec describes.** As it stands the game's spudder outweighs the
biggest sourced spudder by 30 % while having the shortest mast.

**9.G — `powerKw: 82` is roughly double the sourced deck engine.** A 22W's deck
engine is listed as *"60 Horsepower 3 Cylinder"* = **44.7 kW** (East West
Drilling `[HIRE]`, accessed 2026-09-05). 82 kW = 110 hp. Same caveat as 9.F: if
the number is meant to include the truck's road engine, say so; a **deck engine**
on this class is a 40–50 kW three-cylinder. The character of the machine is
*small engine, big reduction, slow blows* — a 110 hp deck engine reads modern.

**9.H — `maxDepthM: 250` sits at the extreme top of the range and contradicts the
game's own site research.** Sourced ceilings: FRTR gives *"less than 5000 feet"*
as an absolute historical bound; Wellowner.org gives modern practice as
*"approximately 100 feet or less"* (30 m); `research/16` §B.2 already quotes
`[WELLOWNER]`'s *"approximately 100 feet or less"* as one of the six
offshore-disqualifying reasons — **so the game is citing a 30 m limit in one file
and asserting 250 m in another.** For family A the figures are **50 m routinely**
(`research/16`) and *"usually 60 metres"* set by the **length of wire on the
drum** (Consallen, §4.2.0b). 250 m is reachable only by the largest spudders with
1,200 ft of line. **Action: reconcile. 60–100 m would be defensible for either
family; 250 m needs the 60L-class mast, drum and weight to go with it.**

**9.I — `holeMm: '150-460'` does not match the geometry actually built.** The
model places a **230 mm** surface casing (`G.cyl(0.115, 0.115, 0.70)`) and hangs
a **140 mm** bailer (`buildTool('bailer', { odMm: 140, lengthMm: 3000 })`) and a
**165 mm** chisel. So the *modelled* hole is ~165–230 mm, and nothing in the
scene can service a 460 mm hole. Sourced ranges: **150–450 mm** for the GI tripod
(Southern Testing, accessed 2026-09-05 — note **450**, not 460), **150–300 mm**
in `research/06`, and 3–24 in for family B. **Action: use 150–450 mm to match the
one published figure, and make the bailer OD track the hole size** — §4.4.1's
sourced rule is that the tool runs **loose** in the casing (a "4-inch bailer" is
really 3½"), so bailer OD ≈ 0.85–0.9 × casing bore, not a fixed 140 mm.

**9.J — `strokeMm: 620` should be one of a small set of discrete strokes, not a
continuous value.** On the real machine the stroke is set by **which of three
holes the crank pin is put in**: 18/24/30 in (**457/610/762 mm**) on one machine,
16/26/35 in (**406/660/889 mm**) on another (The Driller 92073 and 88569,
accessed 2026-09-05). **0.62 m is almost exactly the 24 in middle stroke and is a
good choice** — the defect is only that the model shows no way to set it.
**Action (cheap, high value): put three visible pin holes in the gear face and
model the pin in the middle one.** And note the rating trade-off, which is real
character: the 22W is rated **2,500 lb of tools on the intermediate stroke but
only ~1,900 lb on the long stroke** — *the longer the stroke, the less it can
lift.*

**9.K — `spuddingMin: '40-60'` is narrower than the sourced band.** Sourced:
*"15 to 60 strokes per minute"* (DrillerDB, accessed 2026-09-05); a separate
source describes the bit going *"up and down once per second"* (60/min)
(Wellowner.org, accessed 2026-09-05). The game's fast end is right; the slow end
should reach **15**. Not wrong, just narrow — and the slow end is where the
machine looks most characteristic.

---

### RANK 4 — missing parts. All sourced, all cheap.

**9.L — There is no headache post, and it is a named safety part.** *"A safety
feature that kept the walking beam from dropping if anything came loose"*
(Elsmere Canyon, accessed 2026-09-05). A post standing under the beam, near the
front end. One box.

**9.M — The crank has no pin holes and the beam has no second clevis.** §9.J
above for the three holes; and the pitman can attach to the beam at **two**
points — *"closest to the pivot point"* for drilling (*"slower pickup but faster
drop"*), further out for bumping casing (The Driller 92073). **Model the unused
hole.** Also: the pitman's eyes should read as **bronze bushes** — the one
sourced wear point on the machine (§6.1).

**9.N — The temper screw has no rope clamp.** The game's `temper-screw` group is
a box, a chrome screw and four radial handles — the right idea, and it is
correctly hung from the beam's front end with the rope anchored just below it
(`beamTop` at `[0, -0.80, 2.10]`). But the sourced part is *"a clamping device
that gripped the drilling line"* (Elsmere Canyon, accessed 2026-09-05): the rope
must pass **through** a visible **two-bolt clamp** at the bottom of the screw.
Without the clamp the screw has nothing to act on and a driller will see it.

**9.O — The casing has no drive head and no drive clamp.** The model has a
`surface-casing` cylinder and a collar, but the entire **driving assembly** is
missing: a **drive shoe** on the bottom length, a **heavy drive head/cap** over
the top of the casing, and a **two-piece bolted drive clamp** around the drill
stem that hammers down onto it (US Pat. 5,310,014, accessed 2026-09-05; §4.5).
This matters because **casing driving is one of the three things this machine
does**, and right now there is no evidence on the model that it can do it.

**9.P — Missing: the wire-line saver.** A quarter-sheave guide that slips over
the rope socket's neck so the line does not kink when the string is laid down
(The Driller 92301, accessed 2026-09-05). A tiny, specific, purpose-made object
of exactly the kind that makes a scene look researched.

**9.Q — The drilling line must be LEFT LAY, and it must be the only left-lay rope
in the game.** *"Left lay rope will turn our tools to the right keeping the joints
tight"* (The Driller 92199, accessed 2026-09-05), and the rope's untwist on the
drop is what indexes the bit so the hole comes out round. The game currently
draws all five rope strands as plain instanced cylinders (`ropeInst`), which is
fine at this LOD and carries no lay at all. **The instruction is for whenever a
rope texture or normal map is added: the drilling line's helix runs the OPPOSITE
way to the sand line, the casing line, and every rope on every other rig in the
fleet.** Getting this right is nearly free and it is the kind of thing that
earns trust.

---

### RANK 5 — the tools.

**9.R — The chisel's mass formula gives a bit ~4× too heavy.** `tools.js`
`buildCableToolChisel` sets
`massKg: Math.round(diaMm * L * 1000 * 0.0022)`, which at the rig's own call
(`diameterMm: 165, lengthMm: 2200`) yields **≈799 kg**. Sourced American bit
weights bracket it: **50 lb (23 kg) at 3 in** and **2,400 lb (1,089 kg) at 24 in**
(The Driller 92361, accessed 2026-09-05). Scaling those two points as
mass ∝ diameter² × length gives roughly **190 kg** for a 165 mm × 2.2 m bit —
**a derived estimate, stated with its method, not a manufacturer figure.** The
cross-check is decisive though: a whole working tool string is sourced at
**1,200–2,000 lb (544–907 kg)** (DrillerDB, accessed 2026-09-05), so the game's
**chisel alone weighs as much as the entire string it belongs to.** The formula
is linear in diameter where it should be roughly quadratic.

**9.S — The chisel has four water courses; the sourced bit has two.** The
`radiusFn` cuts 2 courses in the upper body and **4** in the lower, and the spec
says `waterCourses: 4`. The sourced description: the working end is *"a letter H
with rounded sides"*, the two rounded cutting faces make up **about two-thirds of
the hole circumference**, and *"the remaining third"* is water course — i.e.
**two courses, one each side**, not four (The Driller 92361, accessed
2026-09-05). The H-in-plan is the recognisable thing about a cable-tool bit and
the model currently does not read as one. **Also add the bottom profile: a flat
V of at least 90° and up to 135°**, flatter for hard rock.

**What is RIGHT about the chisel, and should not be touched:** the wear model.
`edgeW = R * lerp(1.0, 0.90, wear)` with the comment *"the edge wears IN, so the
hole goes undersize and the driller gauges it"*, plus a chipped corner appearing
past `wear > 0.55` and `dressing: 'Forged edge, re-dressed when it gauges
undersize'`. **That is the best piece of domain truth in the whole build** and it
matches the sourced practice exactly — bits are built back to gauge with
hardfacing rod and ground back, or re-forged. Keep it, and see §6 for the
two-material finish that should go with it.

**9.T — The chisel's connection is described correctly and modelled as something
else.** `connection: 'Tapered cable-tool joint'` is right. But the geometry calls
`addBoxThread(T, ctx, g, 'API312', …)` — a rotary drill-pipe thread family.
Sourced practice: British tools use **2¼" × 3¼" API** pin and box (Archway,
Dando `[MFR]`); American tools use **API taper tool joints** (2¼"×3¼",
2¾"×3¾", 4¼"×6") with **collars ≈¾ in larger in diameter than the stem**, giving
a **visible upset band at every joint**. `NOT SOURCED`: whether the cable-tool
taper form is dimensionally the same as `API312`. **Action: add the upset band at
each joint (visible and certain), and mark the thread form as unverified rather
than asserting it.**

**9.U — The jars' default stroke is 500 mm; new jars are sourced at 102–127 mm.**
`buildDrillingJars` clamps `strokeMm` to 200–900 and the rig calls it at **500**.
Sourced: new jars have *"about 4 to 5 inches"* of free play (102–127 mm) and are
**retired at 12–14 in (305–356 mm)** because wear opens the slots; in normal
drilling they should open *"less than 1 inch"* per stroke (The Driller 92323,
accessed 2026-09-05). A second `[WEAK]` source gives 9–18 in for drilling jars
and 18–36 in for fishing jars — **the sources genuinely conflict and both are
recorded in §4.4.5.** But **500 mm exceeds even the retirement limit of the
lower reading**, so on the most specific source available the game's jars are
worn out. **Action: default to ~120 mm and let `strokeMm` rise with wear** —
which would make jar stroke a *wear tell*, exactly like the chisel's edge.

**9.V — The bailer is a dart bailer, which is correct for family B and wrong for
family A.** `buildBailer` builds a **dart valve** with a protruding dart stem —
sourced as the correct American type for slurry and mud, dumped by pressing the
dart on the ground. **If family A is ever built it needs a different tool:** a
**shell** with a **flat hinged clack valve, steel or leather**, in a **screw-on
replaceable shoe**, **≈1.83 m long** (not 3.0 m), hanging from a **bail and pin**
or the swivel eye of a sinker bar (§4.4.1). The rest of `buildBailer` is very
good — the bail, the four vent slots with the comment *"or the tube airlocks and
will not fill"*, the standing slurry, the depth bands *"so a driller can read how
full it came back"*. All correct, all keep.

**9.W — The bailing cadence is modelled and is nearly right.** `dyn.bailer` gives
the bailer a park position, a dump point at the slurry pile, and a state machine,
with the comment *"THE BAILING RUN IS THIS MACHINE'S CADENCE, not a rod add"*.
**That is exactly the right instinct.** The sourced interval is a bailer run
*"after approximately four feet of drilling"* (~1.2 m) (Wellowner.org, accessed
2026-09-05) — so at a sourced 3–9 m/day that is **3–8 runs per working day**.
Tune the trigger to advance-in-hole rather than time, and it will be right.

**9.X — The slurry pile is the correct object.** `p.mud` on a noise-perturbed
lathe at the dump point is exactly right (§4.6): what comes out of this hole is a
**wet slurry tipped in one place**, not a cuttings heap. Two sourced additions:
the pile should **grow and slump over the day**, and the ground at the casing
should be a **cone-shaped depression 150–200 mm wider than the casing and
0.6–0.75 m deep**, filled with pale grey bentonite (Baroid *Field Reference
Guide*, read 2026-09-05). No other rig in the game has that, and it is one lathe.

---

### 9.Y — Naming: currently correct, do not regress

`spec.name` is the fictional **`Kilmar CP-24 Shellhand`**, and the tools are
`Drillity Shellhand Chisel Bit` and `Drillity Shellhand Dart Bailer`. All
correct per `DOMAIN.md` §10. **Every real designation in this document —
Bucyrus-Erie, Speedstar, Cyclone, Walker-Neer, Dando, Pilcon, Consallen,
Archway, MGS, Baroid, Wittig — appears here ONLY as geometry and dimension
evidence.** None may be lettered onto a mesh, a decal, a nameplate, a shop
listing or a tyre. The **shapes and ratios** in this document are free to copy;
the **badges** are not.

The one lettering that *is* safe, and would look researched, is the **sample
log codes** in §4.4.8 — `U`, `P`, `B`, `D`, `W`, `ES`, `EW`, `SPT`, `SPT (C)`.
They are standard notation, not anyone's trademark.

---

## Appendix — continuation of §1, web sources with access dates

All accessed **2026-09-05**. Strength: `[STD]` standard or engineering report ·
`[MFR]` manufacturer · `[HIRE]` hire/supplier/dealer · `[CAT]` trade press ·
`[WEAK]` hobby/history.

| Source | URL | What it gave | Strength |
|---|---|---|---|
| Southern Testing, *Technical Data — Cable Percussive Drilling Rig* | southerntesting.co.uk/wp-content/uploads/2019/06/Technical_Cable-Percussive-Boreholes.pdf | **The only full general arrangement for family A**: line pull, derrick loading, weight, working height, travelling and operating dimensions, and the **2,072 mm width between legs** that finally sourced the splay | `[HIRE]` **primary** |
| Consallen, *Cable Percussion – How to Drill* | static.elitesecurity.org/uploads/2/0/2007583/How-to-dril.pdf | **The free-fall winch**, the **10 mm wire and its 6,500 kg breaking load**, leg braces and feet spreading, the apex strong-point, multi-part tackle, casing pulling sets, the apple-corer clay cutter, the shell/sand-pump distinction, the bailer naming trap | `[MFR]` **primary** |
| The Driller — 9 columns by a working cable-tool driller: 88569 (22-W), 92073 (spudder mechanism), 92155 (mounting and weights), 92199 (wire lines), 92301 (rope socket), 92323 (jars), 92342 (drill stem), 92361 (drill bit), 92477 (bailers) | thedriller.com/articles/… | **Everything quantitative about family B**: strokes, reel capacities, rope diameters and **left lay**, weights, bit shape and mass ladder, jar strokes | `[CAT]` **primary for family B** |
| Archway Engineering — claycutter & shell, chisels & stubber, sectional shell, sinker bars, SPT trip hammer, SPT/CPT rods, U100 systems | archway-engineering.com/product/… (size tables mirrored at plantautomation-technology.com) | The **only dimensioned British tool tables**: the 4″–24″ size ladder, 1.83 m tool length, sinker bar 4½″ × 1.0 m × 80 kg, trip hammer 1.8→2.6 m / 105 kg | `[MFR]` |
| Dando, *Cable Percussion Tooling* | dando.co.uk/wp-content/uploads/2019/10/cable-percussion-tooling.pdf | Part numbers and the **86 kg sinker bar**; shoe and clack types; U100 457 mm tube; the clockwise-turn shearing practice | `[MFR]` |
| MGS — U100 System, SPT Equipment, Coreboxes | mgs.co.uk/wp-content/uploads/… | The **U100 OD/ID/area-ratio table** (118.6 / 104.4 / 29 %), sample quality classes, SPT drive rod 54 mm at 8.8 kg/m | `[MFR]` |
| ASTM D1586-11 | azmanco.com/blog/wp-content/uploads/2020/08/D1586.17074.pdf | Split-spoon Fig. 2 dimensions verbatim; hammer as **140 ± 2 lbf / 30 ± 1 in**; the American N-value definition | `[STD]` |
| ISO 22476-3:2005 (public sample) | cdn.standards.iteh.ai/samples/36247/… | **63.5 ± 0.5 kg / 760 ± 10 mm**; the 25 mm ball on a 22 mm seat and four 12 mm vents; the 60° SPT cone; the 115 kg assembly cap | `[STD]` |
| Causeway Geotech GI report (Arklow WWTP) | water.ie/sites/default/files/docs/arklow-wwtp/… | A **real GI report using light cable percussion rigs**: the British 4 × 75 mm N-value convention, and the sample log codes | `[STD]` |
| AGS, *Manual handling operations* (quoting BDA) | ags.org.uk/2019/09/manual-handling-operations-have-you-assessed-your-risk/ | The **tool weights that tell you nothing is carried**: sinker bar 80 kg, casing lead 77 kg, U100 hammer 93 kg, SPT hammer 115 kg — and the **1–3 m British stroke** | `[STD]` |
| BAJR / Ian Farmer Associates, geotechnical short guide | bajr.org/wp-content/uploads/2024/08/Geo-Tec-2024.pdf | The **sampling schedule** that sets how much is lying on the ground, jar/bag sizes, the 1.20 m hand-dug inspection pit, the reference board | `[CAT]` |
| Elsmere Canyon, *Cable Tool Rig* | elsmerecanyon.com/elsmerecanyon/oil/cabletoolrig/cabletoolrig.htm | Named parts of the **derrick-type** rig: walking beam 26 ft × 12 in × 24 in, ~2 ft stroke, band wheel 8–10 ft, samson post, **headache post**, calf/sand/bull wheels, temper screw | `[WEAK]` but corroborated |
| DrillerDB, *Why the Spudder Rig Endures* | drillerdb.com/resources/well-owner/cable-tool-drilling | Mast heights by model, **15–60 strokes/min**, tool-string weight 1,200–2,000 lb, left-lay explanation, rates | `[CAT]` |
| Wellowner.org, *Cable Tool Drilling Method* | wellowner.org/resources/basics/drilling-methods/cable-tool/ | **Bail every ~4 ft**, ~5 gal of water per interval, drive cap vs drive blocks, 10 ft casing sections, the 100 ft practical-depth line | `[CAT]` |
| FRTR, *Cable Tool* | frtr.gov/site/3_2_2.html | Penetration rates by ground type, the five string components, 10–20 gal water, minimum 4-inch casing | `[STD]` |
| US Patent 5,310,014 | image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5310014 | The **drive clamp / drive head** mechanism in words — the casing is driven by the rig's own drill stem | `[STD]` for mechanism |
| Permian Basin Oil & Gas Magazine, *Spudding In* | pboilandgasmagazine.com/spudding-in/ | Portable machines used **single- or double-pole folding masts** — the basis of warning 9.D | `[WEAK]` |
| East West Drilling; Sun Machinery; Total Drilling Supply | ewdrilling.com · sunmachinery.com/cable.html | Dealer listings: the **60 hp 3-cylinder deck engine**, line lengths, "3 line machine", rope socket sizes. Total Drilling's page carried no specs | `[HIRE]` |
| Petroleum History Institute, rope socket | petroleumhistory.org/OilHistory/pages/String/rope_socket.html | Historic manila-rope termination — noted only so nobody models a knot on a wire-rope machine | `[WEAK]` |

_Status: §4–§9 complete for the material reachable on 2026-09-05. The gaps in §8
are real gaps, not omissions. The single highest-value addition anyone could make
is the **BDA *Guidance for the Operation of Cable Percussion Rigs and
Equipment***, which holds the British tool weights, and **two or three
photographs** of an erected GI tripod (§7)._

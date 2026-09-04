# 13 — String elements for `auger`, `sonic` and `jet-grouting`

Scope: `src/game/data.js` declares a `rod` bay on three methods that have no
rod in the shop. This pack establishes what the real string element is called,
what it measures, how it joins, what it costs, and — for each method — whether
the bay should be filled or deleted.

**Rule applied throughout:** every figure carries a source. Where a figure could
not be sourced it says `NOT SOURCED`. Nothing here is inferred and presented as
fact; inferences are labelled as inferences.

---

## Sources

### Local research packs

| Key | Where |
|---|---|
| `[R05-A12]` | `research/05-foundation-piling.md` §A12 — Jet grouting (HDI), the three systems, the plant, the EMDE tooling string |
| `[R05-A11]` | `research/05-foundation-piling.md` §A11 table — `[EMDE-AN]` HDI rod diameters and usable lengths |
| `[R05-C8]` | `research/05-foundation-piling.md` §C8 — jet grouting rig and plant |
| `[R06-A6]` | `research/06-geotech-water-geothermal.md` §A.6 — sonic physics, three-phase cycle, head specs |
| `[R11-A13]` | `research/11-oem-anchor-geotech-hdd.md` §A.13 — sonic OEMs, head table, TSi 150CC tooling sections |
| `[R11-A16]` | `research/11-oem-anchor-geotech-hdd.md` §A.1.6 — KLEMM HDI systems and grouting plant |

### Manufacturer catalogues and spec sheets

| Key | Source |
|---|---|
| `[CME-CAT]` | CME Augers Catalog (section 3), PDF — https://cmeco.com/cat/3-CME-Augers-Catalog.pdf |
| `[CME-HSA]` | CME Hollow Stem Auger Assembly — https://cmeco.com/Hollow-Stem-Auger-Assembly.html |
| `[CME-SIZE]` | CME Hollow Stem Auger Sizes — https://cmeco.com/Hollow-Stem-Auger-CME-Auger-Sizes.html |
| `[CME-HEX]` | CME Hollow Stem Auger Center Hexagon Drive System — https://cmeco.com/Hollow-Stem-Auger-Drive-System.html |
| `[CME-CFA]` | CME Continuous Flight Augers (Solid) — https://cmeco.com/Continuous-Flight-Augers.html |
| `[HP-CFA]` | Hole Products, Continuous Flight Augers — https://www.holeproducts.com/our-products/auger-tools/continuous-flight-augers |
| `[HP-SONIC]` | Hole Products, 3 1/2" x 5' HD Sonic Drill Rod — 2 3/8" IF joints — https://www.holeproducts.com/ROD-3-1-2-X-5-IU-2-3-8-IF-JNTS |
| `[TSI-TOOL]` | Terra Sonic International, *Sonic Down Hole Tooling & Accessories Catalog* — https://www.terrasonicinternational.com/wp-content/uploads/2020/07/00042_TSi_Tooling_Catalog_Listing_vF.pdf |
| `[BL-SONIC]` | Boart Longyear, *Sonic Equipment and Tooling* catalogue (2012) — https://diateam.no/wp-content/uploads/2017/03/SonicCatalog-Equipment.pdf |
| `[BL-ROD]` | Boart Longyear, "The Secret Sauce for Making Sonic Drill Rods" — https://www.boartlongyear.com/insite/the-secret-sauce-for-making-sonic-drill-rods/ |
| `[GP-SONIC]` | Geoprobe 6 in. Sonic Tooling — https://geoprobe.com/tooling/6-sonic-tooling · 3.5 in. Sonic Rod — https://geoprobe.com/tooling/35-inch-geoprober-sonic-rod |
| `[MATRIX]` | Matrix Drilling Products, Sonic Drill Rods — https://matrixdrillingproducts.com/custom-products/sonic-drill-rods/ |
| `[SYS-TRI]` | SysBohr GmbH, Triplex Jet Grouting Drilling System — https://sysbohr.com/en/produkte/drilling-technique/triplex-jet-grouting-drilling-system-with-rotary-head-and-hydraulic-chuck.html |
| `[SYS-DUP]` | SysBohr GmbH, Duplex Jet Grouting Drilling System — https://www.sysbohr.com/en/products/jet-grouting-drilling-system/duplex-jet-grouting-drilling-system-with-rotary-head-unit-and-hydraulic-chuck/ |
| `[SYS-CRD]` | SysBohr jet grouting systems via Creighton Rock Drill — https://www.crdcreighton.com/products/drilling-solutions/jet-grouting-systems/ |
| `[NEG]` | Northeast Geotech, used augers and tools (published USD prices) — https://www.northeastgeotech.com/product-category/used-augers/ |
| `[ATL]` | Atlantic Supply, 4-1/2" Continuous Auger Flight, 5', 1-5/8" Hex — https://www.atlanticsupply.com/product/4-12-continuous-auger-flight-5-1-58-hex/ |
| `[ANMAN]` | Wuxi Anman, jet grouting drill rod Φ89 × 3116 mm, published unit price — https://wxanman.en.made-in-china.com/product/OZsTJueySFpI/China-Price-Ratio-Hydraulic-Jet-Grouting-Drill-Rods.html |
| `[ROSCHEN]` | Roschen JT4389 89 mm triple drill rod for jet grouting — https://www.explorationcoredrilling.com/sale-6509765-iso-approval-89mm-3-meters-10-ft-triple-drill-rod-for-jet-grouting-drill-tools.html |
| `[ECD-SONIC]` | Heavy duty sonic drill rods 3-1/2", inertia-welded — https://www.explorationcoredrilling.com/sale-6585925-heavy-duty-sonic-drill-rods-3-1-2-friction-welded-processing-with-advanced-techniques.html |

### Textbook

| Key | Source |
|---|---|
| `[CROCE]` | Croce, Flora & Modoni, *Jet Grouting: Technology, Design and Control*, CRC Press. §2.2 (procedure), §2.3 (the three systems), §2.3.1–2.3.3. Copy consulted: https://istasazeh-co.com/wp-content/uploads/2022/06/Jet-Grouting-Technology-Design-and-Control.pdf |

---

## 0. Verdicts at a glance

| Method | Current `toolSlots` | `rod` bay verdict | One-line reason |
|---|---|---|---|
| `auger` | `bit, rod, head` | **FILL** | Sectional augering builds the string from 5 ft flighted sections, and the cutting head is a separately catalogued part `[CME-CAT]`. The bit and the string are **not** the same object here. |
| `sonic` | `bit, rod, casing, pump` | **FILL** | "Drill rod" is its own product family in both major sonic catalogues, distinct from core barrel and casing, and sits between the sub-saver and the core barrel `[BL-SONIC]` `[TSI-TOOL]`. |
| `jet-grouting` | `bit, rod, pump, swivel` | **FILL** | The rod and the monitor are explicitly different objects: the string is jointed rods with 1/2/3 inner conduits, and the monitor is the tool mounted at the *end* of that string `[CROCE]` §2.2. |

All three bays are genuinely empty: no item in `data.js` with `slot: 'rod'`
lists `auger`, `sonic` or `jet-grouting` in its `methods` array (verified across
all 23 rod-slot items).

---

# 1. `auger` — the flight auger section

## 1.1 What it is actually called

Two different machines hide under the word "auger", and the game already splits
them correctly:

| Real machine | The string | Game method |
|---|---|---|
| **True CFA piling** — one continuous flight, typically 22–26 m, run in a single pass | The flight **is** the string. There are no sections. | `cfa` / `cased-cfa` — and neither declares a `rod` bay. Correct. |
| **Sectional augering** — hollow-stem and small solid-flight work | Built up from **sections**, added one at a time | `auger` |

So the answer to *"is the bit and the rod the same object?"* is: **yes for CFA,
no for sectional augering**. `data.js` has already made that distinction and
made it the right way round.

**The catalogue word is "section", not "extension".** CME's parts lists read
`Hollow stem auger, 4.25" ID x 8.25" OD x 5' length with CME keyed coupling`
`[CME-CAT]`; Hole Products titles its items `... Hollow Stem Auger - 5' Section`
and heads the solid family *Continuous Flight Augers* with a "Section Lengths"
row `[HP-CFA]`. Atlantic Supply's title is
`4-1/2" Continuous Auger Flight, 5', 1-5/8" Hex` `[ATL]`. "Auger extension" is
the term for hand-auger extension rods; it did not appear in any machine-tooling
catalogue checked here.

**Crucially, the head is a separate part number.** `[CME-CAT]` lists
FLIGHT AUGER HEADS as its own table (parts 19004–19338, `Head O.D.`, `Hex Size`,
`Tooth Type` 5T or Conical, `No. Req.` 4–8 teeth), and the hollow-stem assembly
lists `Hollow auger head, 2.25" ID x 6.25" OD with CME keyed coupling, including
four 5T teeth` (part 21010) separately from the auger section (part 21007)
`[CME-CAT]`. Used-market pricing confirms they are traded as separate items:
cutter heads at $195–250 alongside auger sections at $95–195 `[NEG]`.

## 1.2 Section length — and yes, the industry works in feet

- **CME flight augers: "Augers listed are 60" long — other lengths available
  upon request. Drive Pin included with each auger."** `[CME-CAT]`, repeated
  under all three series (1500, 2000, 2875).
- **CME hollow-stem augers: every part line in the catalogue reads `x 5'
  length`** `[CME-CAT]`.
- **Hole Products offers 2', 3', 4', 5', 6', 10', 12' — and `1.5M`** `[HP-CFA]`.

**Say it in feet.** 5 ft (1.524 m) is the default US section and is what the
part numbers are built around. 1.5 m is a real, separately stocked metric
alternative from the same supplier `[HP-CFA]`, not a conversion. The game's
`rodLength: 1.5` for `auger` is therefore correct on both readings.

## 1.3 Diameter — matched to the small crawler / utility class

CME's flight auger table `[CME-CAT]`, verbatim columns:

| Series | Hole size | Auger O.D. | Hex | Spiral pitch | Plain / Hardsurfaced part no. |
|---|---|---|---|---|---|
| 1500 | 3" | 2.5" | 1.125" | 2.75" | 19090 / 19091 |
| 1500 | 4.5" | 4" | 1.125" | 3" | 19110 / 19111 |
| 1500 | 6" | 5.5" | 1.125" | 5" | 19130 / 19131 |
| 2000 | 6.75" | 6" | 1.625" | 5" | 19170 / 19171 |
| 2000 | 8.25" | 7" | 1.625" | 6" | 19180 / 19181 |
| 2875 | 9" | 7.875" | 1.625" | 6" | 19300 / 19301 |
| 2875 | 10" | 8.875" | 1.625" | 6" | 19190 / 19191 |
| **2875** | **12"** | **11"** | **1.625"** | **9"** | **19200 / 19201** |

Hole Products' range is 2 1/2" through 14" with hex sizes 13/16", 1 1/8",
1 5/8" and 2" `[HP-CFA]`.

**For the game's 300 mm auger:** the 2875 series 12" line is the match — a
**279 mm (11") flight cutting a 305 mm (12") hole**, 1 5/8" (41.3 mm) hex,
229 mm (9") spiral pitch `[CME-CAT]`. Note that the flight OD and the hole size
are two different numbers; a "300 mm auger" is a 279 mm flight.

For hollow-stem, CME's published size table runs 2 1/4" ID / 5 5/8" OD up to
12 1/4" ID / 17 1/4" OD, with the 6 1/4" ID (159 mm) size taking a 10 1/2"–11"
hole `[CME-SIZE]`.

## 1.4 The connection — hex pin and box with a drive pin, no thread

This is where a game gets caught out, and the answer is unambiguous.

**Solid flight augers** `[CME-CFA]`:
- "Hex pin couplings welded to the top of the auger tube"
- "Drive pins used to connect auger sections"
- "Pin and box connections are 'timed' for consistent alignment between auger
  sections"

**Hollow-stem augers** `[CME-HSA]` `[CME-HEX]`:
- a "keyed auger box coupling that fits over a hollow auger pin coupling"
- "Auger connector bolt — Secures each hollow auger connection" (the connector
  itself is part 21025, sold in buckets of 50 `[CME-CAT]`)
- the centre hex rod string is joined by sliding "the box and pin hex ends
  together and install the drive pin"
- and the reason it is not a thread: hex-and-pin joints **"will not unscrew
  during reverse rotation"** `[CME-HEX]`

Hole Products describes the same joint as "Hex with u-pin coupling for
connecting additional auger sections" `[HP-CFA]`.

So: **hex pin-and-socket, secured by a drive pin (u-pin) or, on hollow stem, a
connector bolt. Never a percussion thread.** The game's
`threadFamily: 'hex/quick-pin'` on the `auger` method is already right.

## 1.5 Price

**New list prices: `NOT SOURCED`.** Every US supplier checked gates them —
Hole Products and Continental Supply require a login, Atlantic Supply shows
"Call for Price" `[ATL]` `[HP-CFA]`, and CME publishes part numbers without
prices `[CME-CAT]`.

**Published used prices `[NEG]`** (real, current, retail):

| Item | Price |
|---|---|
| 3 1/4" ID hollow stem auger, Acker octagonal | $95 |
| 8 1/4" hollow stem auger, Acker octagonal | $195 |
| Conical cutter head, Diedrich 4 1/4" | $210 |
| Rebuilt 6 1/4" cutter head, Acker octagonal | $250 |
| Drive cap, Diedrich 4 1/4", 2" hex | $175 |

**Proposed game price: €560 for a 279 mm × 1.5 m hardsurfaced section.
Confidence: LOW–MEDIUM.** This is an *estimate*, not a sourced list price. It
is bracketed by the used market above (a big HSA section changes hands at ~$195
used, and a solid flight is a simpler part than an HSA of the same hole size)
and it sits consistently below the game's existing `auger-flight-std` at €780.
Honest bracket: **€400–900**.

## 1.6 Material and flavour that is true

- "The entire length of flighting is hardsurfaced for long-term abrasive wear
  resistance" — CME's own claim for the hollow-stem flighting `[CME-SIZE]`.
- "Hard faced flight edges" and "field replaceable hex shanks" are standard on
  Hole Products' continuous flight augers `[HP-CFA]` — the shank is a wear part
  you renew, not a reason to scrap the auger.
- CME's **patented O-ring seal, in a groove on the auger pin, "helps prevent
  contaminates from leaking into the auger column and drilling fluids from
  leaking out"** `[CME-HSA]`. That is a beautiful environmental-drilling detail
  and it is a real, claimed feature.
- Heads carry **4 to 8 teeth**, 5T or conical, per the head table `[CME-CAT]`.

## 1.7 Verdict — **FILL**, with one warning

**Fill it.** Sectional augering genuinely has two purchasable objects, and the
used market proves it by trading them at separate prices.

⚠️ **Naming collision to resolve before you apply this.** The existing
`bit`-slot item `auger-flight-std` is called *"Continuous Auger Flight, 300 mm"*
and its description is *"A 300 mm flight with weld-on carbide teeth on the
leading edge"*. In catalogue terms that description is **the head**, but the
name is **the section**. If you add a section to the `rod` bay without touching
the bit, the shop will show two items that sound identical. The clean fix is to
rename the bit item to what it is — a **flight auger head** with 5T or conical
teeth, `[CME-CAT]` — and let the new `rod` item own the word "flight". I have
not applied this; it is your call.

Also worth a look, not applied: `auger-flight-std` carries `thread: 'SW hex
65 mm'`. CME's real hexes for this class are 1 1/8" (28.6 mm) and 1 5/8"
(41.3 mm) `[CME-CAT]`; Hole Products adds 13/16" and 2" (50.8 mm) `[HP-CFA]`.
SW 65 is a European Kelly/auger size, but it is not sourced here for a 300 mm
utility flight.

---

# 2. `sonic` — the sonic drill rod

## 2.1 What it is actually called

**"Sonic drill rod"**, and it is its own product family — not the core barrel
and not the casing. Both major catalogues section it exactly that way:

- Boart Longyear's contents page: *Rods, Core Barrel and Casing* → **Drill rod
  (p.34)**, Core Barrel (p.36), Casing (p.38) `[BL-SONIC]`.
- Terra Sonic's contents page: **Drill Rods (p.3)**, Core Barrels (p.4), Casing
  (p.6) `[TSI-TOOL]`.

**Where it sits in the string.** Boart Longyear's own "Tooling (Core Barrel
Advancement)" diagram gives the order `[BL-SONIC]`:

```
Sonic head → Flange adapter → Bolt-on sub-saver → DRILL ROD
           → Core barrel adapter → Core barrel → Core barrel bit
```

and the parallel casing string: `head → flange adapter → sub-saver → casing
adapter → casing → casing shoe` `[BL-SONIC]`. That is the game's `bit` =
core barrel, `casing` = override casing, and the missing middle is the rod.

Geoprobe uses different words for the same architecture — "Sonic Casing Pipe"
and "Sonic Sampler Barrel" — and marks their joints RHSL and LHSL respectively
`[GP-SONIC]`, i.e. the same opposite-hand scheme described below.

## 2.2 Length

| Source | Lengths offered |
|---|---|
| Boart Longyear standard drill rod | Imperial **10 ft, 5 ft, 2 ft, 1 ft**; metric **3 m, 1.5 m** — separate part numbers for each `[BL-SONIC]` |
| Terra Sonic 3.5" rods | 1 ft ("Ace"), 2.5 ft ("Deuce"), 5 ft, 10 ft, and **1.5 M, 3 M** `[TSI-TOOL]` |
| Terra Sonic TSi 150CC rig | **3 m (10 ft) tooling sections** `[R11-A13]` |
| Boart Longyear procedure text | "the core barrel is advanced **10 ft (3.05 m)** using sonic frequencies" `[BL-SONIC]` |

**10 ft ≈ 3 m is the working section.** Unlike augers, this product line is
genuinely bilingual — both catalogues carry separate metric part numbers, so
3.00 m is a real stocked length and not a conversion of 10 ft. The game's
`rodLength: 3.0` is correct.

Terra Sonic notes on every table: *"Length measurement does not include thread
length"* `[TSI-TOOL]`.

## 2.3 Diameter and weight

Boart Longyear, 3.5" Standard drill rod `[BL-SONIC]`:

| | Inner diameter | Outer diameter |
|---|---|---|
| Mid-body | 76.2 mm (3") | **88.9 mm (3.5")** |
| Thread ends | 63.5 mm (2.5") | 88.9 mm (3.5") |

Terra Sonic agrees exactly and adds the mass and a second size `[TSI-TOOL]`:

| Rod | OD | ID | End wall | 3 m mass | 10 ft mass |
|---|---|---|---|---|---|
| 3.5" | 88.9 mm | 63.5 mm | 12.7 mm | **45.2 kg** | 45.8 kg |
| 4.25" | 107.95 mm | 76.2 mm | 15.87 mm | **57.6 kg** | 58.3 kg |

Geoprobe's 3.5" sonic rod is likewise 3.5" OD / 2.5" ID `[GP-SONIC]`.

**For the game's sonic class** (`nominalDia: 150`, `holeDiaRange: [75, 300]`,
running a 100 mm core barrel inside 150 mm casing): the **3.5" / 88.9 mm rod is
the right standard**, with 4.25" / 108 mm as the honest HD upgrade.

## 2.4 The connection — and the two-hand rule

- **Tapered threaded tool joint, pin and box** — machined into the upset ends,
  not welded on `[BL-ROD]`.
- **Drill rod and core barrel are right-hand. Casing is left-hand.** Boart
  Longyear footnotes it on every rod page: *"Drill rod, core barrels and related
  accessories are designed with right hand threads"*, and on the casing pages:
  *"Casing and related accessories are designed with left hand threads"*
  `[BL-SONIC]`. Terra Sonic's tables are headed the same way — Rods and Core
  Barrels "RH Thread", Casing "LH thread" `[TSI-TOOL]`. Geoprobe encodes it in
  the connection name itself: RHSL for casing pipe, LHSL for the sampler barrel
  `[GP-SONIC]`.
  **This is the single best fact in the sonic tooling story.** The opposite-hand
  scheme is stated by three independent vendors; the *reason* usually given —
  that turning one string cannot then unscrew the other — is a reasonable
  inference and is **not** stated in any of the three catalogues. Ship the fact,
  not the explanation.
- Thread profiles are proprietary and vendor-specific: Terra Sonic advertises
  "an exclusive, optimized thread design"; Matrix uses "robust plasma arc welded
  tool joint connections" with "multi-start threads for quicker make/break"
  `[MATRIX]`. A common industry-compatible alternative is the **2 3/8" IF**
  joint `[HP-SONIC]` `[ECD-SONIC]`.

The game's `threadFamily: 'sonic box/pin'` on the `sonic` method is accurate and
appropriately vendor-neutral.

## 2.5 Price

**Western OEM prices: `NOT SOURCED`.** Terra Sonic's catalogue carries no
prices and directs buyers to a phone number `[TSI-TOOL]`; Geoprobe routes to a
login-gated quoting system `[GP-SONIC]`; Hole Products requires a login to see
the price of its 3 1/2" × 5' HD sonic rod `[HP-SONIC]`; Drillworx lists three
sonic rod part numbers with no prices.

**Proposed game price: €880 for an 88.9 mm × 3 m rod. Confidence: LOW.**
Reasoning, stated as reasoning: a sonic rod is a one-piece upset-forged,
twice-heat-treated fatigue part (§2.6) and per metre must sit well above a plain
DTH drill pipe — the game already prices an 89 mm × 6 m DTH pipe at €438 (€73/m)
and a 100 mm × 3 m sonic core barrel at €3,840. €880 (€293/m) sits between those
and is internally consistent. Honest bracket: **€600–1,400**.

## 2.6 Material and engineering — all true, all quotable

Boart Longyear's own account of how a sonic rod is made `[BL-ROD]`:

1. It starts as **one single piece of high-grade steel tubing**, 3 1/2" OD,
   1/4" wall.
2. The ends are **upset forged** over a 9" length to a 1/2" wall — so the ID is
   3" mid-body and 2 1/2" at the thread ends.
3. The whole rod is **stress relieved** (heated and cooled slowly).
4. Pin and box ends are **quenched and tempered**.
5. The tapered threads are machined.
6. The pin threads get a **secondary heat treatment** for extra hardness.

The point of all of that: it "eliminates welding the thread ends onto the
mid-body", where the industry norm is three-piece welded construction with
lower-grade steel in the middle `[BL-ROD]`. Geoprobe describes its rod the same
way — "upset forged tubular design ... one piece construction" `[GP-SONIC]`.
A competing manufacturer publishes 4140 QT as the steel and quotes a 5.65 sq.in.
weld area for the inertia-welded alternative `[ECD-SONIC]`.

**Why it matters, and this is the game mechanic:** the head drives the string at
up to **150 Hz** — the string moves up and down up to 150 times per second
`[R06-A6]` `[R11-A13]` — and over-feeding forms a "knot" at the bit that risks
**fracturing the drill rods** through vibration `[R06-A6]`. A sonic rod is a
fatigue part first and a torque part second. The one-piece forging exists
because a weld in the mid-body is a crack waiting for a resonance node.

## 2.7 Verdict — **FILL**

The rod is a separate product family in every sonic catalogue checked, it has
its own part numbers, its own thread hand, and its own place in the string
diagram. `sonic` runs to 120 m in the game; you cannot get there on core barrels
alone.

---

# 3. `jet-grouting` — the multi-tube jet grouting rod

## 3.1 Rod or monitor? **Two different items.** This is not close.

`[CROCE]` §2.2 defines the whole architecture in one sentence: the jet grouting
string is made of jointed rods provided with single, double or triple inner
conduits, which convey the fluids to a tool named the *monitor*, mounted at the
end of the string.

And §2.3 places it precisely: **the monitor is a steel cylinder at the end of
the string, immediately above the cutting tool.** It houses the nozzles. It is
"the key tool of jet grouting" `[CROCE]`.

SysBohr's product pages list them as separate line items on the same system —
flushing head, **rods**, **monitor** (a two-part assembly with nozzle seats),
nozzles, automatic valve, bit, reamer `[SYS-TRI]` `[SYS-DUP]`. KLEMM's range
lists "rods for one-phase, two-phase and three-phase" alongside "flushing heads,
nozzle holders, nozzles, drill bits" as distinct items `[R05-A12]` `[R11-A16]`.
EMDE's HDI string is spelled out component by component: flushing head → tube →
double nipple → nozzle holder (Düsenstock) → nozzle (HDI Düse) → non-return
steel ball → automatic valve → bit `[R05-A12]`.

**So yes — the rod is distinct enough from the monitor to be its own
purchasable item.** They are bought separately, they wear differently, and the
rod is the per-metre consumable while the monitor is the tool.

⚠️ **Related finding, not asked for but it matters:** the game currently puts
`jet-monitor-single` and `jet-monitor-triple-hd` in the **`swivel`** bay. Per
`[CROCE]` §2.3 the monitor is at the *bottom* of the string, immediately above
the bit. The swivel — the game's `swivel-hp-hd`, "High-Pressure Swivel, 400 bar
HD" — is the **flushing head at the top** `[SYS-TRI]` `[R05-A12]`. Two very
different objects currently share one bay. Not my call to fix, but you should
know before you fill the rod bay next to them.

## 3.2 Tube count, and what each path carries

`[CROCE]` §2.3.1–2.3.3, corroborated by `[SYS-TRI]` `[SYS-DUP]` and
`[KELLER-JET]` via `[R05-A12]`:

| System | German | Conduits in the rod | What each path carries |
|---|---|---|---|
| **Single** (simplex, 1-fach) | Einfach | **1** | W-C grout only. The same fluid both erodes and cements. |
| **Double** (duplex, 2-fach) | Zweifach | **2** | (1) W-C grout, (2) compressed air. The grout jet is **shrouded by a coaxial jet of air**, delivered through an annular nozzle around the grout nozzle — the shroud cuts energy loss so the column is bigger. |
| **Triple** (triplex, 3-fach) | Dreifach | **3** | (1) **water** — the high-velocity erosion jet, from a nozzle on the *upper* part of the monitor; (2) **air** — a coaxial shroud around that water jet; (3) **W-C grout** — from a *separate* nozzle on the *lower* part of the monitor, delivered at lower velocity, whose only job is to cement soil the water has already remoulded. |

SysBohr's triplex page describes the physical build: an outer tube plus first
and second inner tubes, **each sealed by its own set of two U-seals**
`[SYS-TRI]`. That is the honest engineering picture — three concentric tubes,
three seal sets, and the whole assembly has to hold at jetting pressure.

Do not say "triple-tube swivel" for the rod. The rod is triple-**tube**; the
swivel/flushing head is a separate triple-passage rotary union above it.

## 3.3 Diameter

| Source | Single | Double | Triple |
|---|---|---|---|
| EMDE anchor-drilling catalogue `[R05-A11]` | **Ø 88.9 mm** | **Ø 88.9 and 114.3 mm** | — (not catalogued) |
| SysBohr via CRD `[SYS-CRD]` | (HDI) D 88.9 | D 76.1 – 114.3 | D 114.3 – 133 |
| SysBohr product pages | D 76.1 – 114.3 `[SYS-CRD]` | **D 76.1 – 114.3** `[SYS-DUP]` | **D 114.3 – 133** `[SYS-TRI]` |

Two independent European sources agree on the same family: **88.9 / 114.3 mm is
the working range, and the triple goes to 133 mm** because it has to fit a third
tube in.

Borehole diameter, for context: usually **120–150 mm**, occasionally up to
300 mm `[CROCE]` §2.2 — the bit is mounted at the tip of the monitor and is
slightly larger than the pipe string, leaving the annulus that returns the
spoil.

## 3.4 Section length

| Source | Range |
|---|---|
| EMDE `[R05-A11]` | **useable lengths 500 – 3,000 mm** |
| SysBohr duplex and triplex `[SYS-DUP]` `[SYS-TRI]` | **500 mm to 6,000 mm** |
| Roschen JT4389 89 mm triple `[ROSCHEN]` | 1 m, 1.5 m, 2 m, 3 m |

**3 m is the top of the standard range and the practical working section.** The
game's `rodLength: 3.0` for `jet-grouting` is correct. This is a fully metric
product family — no feet anywhere.

## 3.5 The connection

- **Threaded**, and SysBohr offers all four combinations: "The thread profiles
  are available in right-hand (RHT) and left-hand (LHT), as well as conical and
  cylindrical versions" `[SYS-TRI]` `[SYS-DUP]`.
- Each concentric tube is separately sealed — one set of two U-seals on the
  outer tube, one on each inner tube `[SYS-TRI]`.
- The string carries a **blocking / automatic valve** near the bottom, with
  colour-coded springs of different force ratings `[SYS-TRI]`; EMDE lists a
  non-return steel ball plus automatic valve `[R05-A12]`. The reason: the
  monitor has a large hole at the bottom used for direct circulation while
  drilling, and **when jetting starts the bottom hole is closed** and the fluids
  go out through the lateral nozzles `[CROCE]` §2.3.
- Nozzle diameters: **2–8 mm** `[CROCE]` §2.3; SysBohr quotes 2–8.5 mm
  `[SYS-TRI]`.

The game's `threadFamily: 'HP swivel / triple-tube'` is defensible but slightly
conflates two things; `'HDI multi-tube box/pin'` would be closer to catalogue
language. Minor.

## 3.6 Price

**European OEM prices: `NOT SOURCED`.** SysBohr, KLEMM and EMDE all quote
project-specific; SysBohr states the system is "custom-made — 100 % adapted to
the project needs and the ground conditions" `[SYS-TRI]`.

**One published unit price exists** `[ANMAN]`: a Φ89 mm × 3,116 mm jet grouting
drill rod, 58 kg, 45-steel, rated 40 MPa / 130 l/min, at **US$244 each** (10–99
pcs; US$239 at 100+). That is a Chinese factory price for a plain-bore rod and
should be treated as the floor of the range, not the price of a German
multi-tube rod.

**Proposed game prices. Confidence: LOW.**

| Item | Price | Bracket | Basis |
|---|---|---|---|
| Double-tube 88.9 mm × 3 m | **€1,180** | €700–1,800 | ~5× the Chinese single-bore floor `[ANMAN]`; two tubes, two seal sets |
| Triple-tube 114.3 mm × 3 m HD | **€2,150** | €1,200–3,500 | larger, three tubes, three seal sets `[SYS-TRI]` |

These are estimates and must be labelled as such internally. They are
consistent with the game's existing jet grouting tier (`jet-monitor-single`
€9,280, `jet-monitor-triple-hd` €21,600, `swivel-hp-hd` €3,420) — the rod is the
per-metre consumable and should be an order of magnitude below the monitor.

## 3.7 Verdict — **FILL**

The rod and the monitor are different objects in the textbook, in three OEM
catalogues and in the local research pack. Filling the bay is not padding; it is
the missing half of the string.

---

# 4. Proposed items

Sizes, lengths and connections below are sourced. **Prices are estimates** and
are flagged as such above. Descriptions are written in the driller's voice and
every clause in them is traceable to a source in this pack.

## 4.1 `auger`

```
id:          'auger-flight-sec-280'
name:        'Flight Auger Section, 279 mm x 1.5 m'
category:    CAT.augerFlights
slot:        'rod'
price:       560                      // ESTIMATE, low-medium confidence
unlockLevel: 1
methods:     ['auger']
thread:      '1 5/8 in hex pin/box + drive pin'
material:    'S355J2, hardsurfaced flighting'
consumable:  true
description: 'Five feet of hardsurfaced flight with a timed hex pin on top and
              a drive pin through the joint. It cannot unscrew when you back
              her out, which is the whole point.'
```

Sourced: 60" section length and drive pin included, 12" hole / 11" OD / 1.625"
hex / 9" pitch `[CME-CAT]`; timed hex pin-and-box connection and drive pins
`[CME-CFA]`; will not unscrew in reverse rotation `[CME-HEX]`; hard-faced flight
edges standard `[HP-CFA]`; 1.5 M is a stocked metric length `[HP-CFA]`.

Optional HD tier (all figures sourced from the same tables):

```
id: 'auger-flight-sec-200', name: 'Flight Auger Section, 178 mm x 1.5 m'
   — CME 2000 series, 8.25" hole / 7" OD / 1.625" hex / 6" pitch [CME-CAT]
id: 'hsa-sec-159', name: 'Hollow-Stem Auger Section, 159 mm ID x 1.5 m'
   — CME 6.25" ID / 10.25" OD, keyed coupling, auger connector bolt,
     O-ring seal on the auger pin [CME-SIZE] [CME-HSA] [CME-CAT]
```

The hollow-stem section is the more interesting item, because the O-ring seal
that keeps contaminants out of the auger column `[CME-HSA]` is exactly the
environmental-drilling flavour the `auger` method's applications list points at.

## 4.2 `sonic`

```
id:          'sonic-rod-89'
name:        'Sonic Drill Rod, 88.9 mm x 3 m'
category:    CAT.coreRods                // see note below
slot:        'rod'
price:       880                          // ESTIMATE, low confidence
unlockLevel: 42
methods:     ['sonic']
thread:      'sonic box/pin RH'
material:    '4140 QT, one-piece upset forged'
consumable:  true
description: 'One piece of tube, forged thick at both ends so there is no weld
              in the middle for the resonance to find. Right-hand thread; the
              override casing outside it is left-hand.'
```

Sourced: 88.9 mm OD, 76.2 mm mid-body ID, 63.5 mm thread-end ID, 3 m metric part
number `[BL-SONIC]`; 45.2 kg at 3 m `[TSI-TOOL]`; one-piece upset forging with
1/4" mid-body and 1/2" thread ends, stress relieve, Q&T on pin and box,
secondary heat treat on the pin threads, "eliminates welding the thread ends
onto the mid-body" `[BL-ROD]`; 4140 QT `[ECD-SONIC]`; rod and core barrel RH,
casing LH `[BL-SONIC]` `[TSI-TOOL]` `[GP-SONIC]`.

Optional HD tier: `sonic-rod-108-hd`, **Sonic Drill Rod, 108 mm × 3 m HD** —
4.25" OD / 76.2 mm ID / 15.87 mm end wall / 57.6 kg `[TSI-TOOL]`.

**Category note.** `CAT.coreRods` ("Drill String & Rods → Core Drill Rods") is
the closest existing leaf and takes it without a schema change. Strictly, sonic
drill rod is its own family in every OEM catalogue `[BL-SONIC]` `[TSI-TOOL]`, so
a new leaf `Tooling → Drill String & Rods → Sonic Drill Rods` would be the
honest taxonomy. Your call.

## 4.3 `jet-grouting`

```
id:          'jet-rod-double-89'
name:        'Jet Grouting Rod, Double Tube, 88.9 mm x 3 m'
category:    CAT.jetRods                  // new leaf — see note
slot:        'rod'
price:       1180                         // ESTIMATE, low confidence
unlockLevel: 47
methods:     ['jet-grouting']
thread:      'HDI multi-tube box/pin, RHT conical'
material:    '42CrMo4(V), U-seal per tube'
consumable:  true
description: 'Two tubes inside one rod: grout down the middle, air around it.
              The air shroud is what keeps the jet together long enough to make
              a column worth the money.'
```

```
id:          'jet-rod-triple-114-hd'
name:        'Jet Grouting Rod, Triple Tube, 114.3 mm x 3 m HD'
category:    CAT.jetRods
slot:        'rod'
price:       2150                         // ESTIMATE, low confidence
unlockLevel: 51
methods:     ['jet-grouting']
thread:      'HDI multi-tube box/pin, RHT conical'
material:    '42CrMo4(V), two U-seals per tube'
duty:        'HD'
tier:        'prem'
consumable:  true
description: 'Three concentric tubes and six U-seals: water to cut, air to
              shroud the water, grout to fill in behind it. Every seal is a
              way to lose the panel.'
```

Sourced: double 88.9 and 114.3 mm, single 88.9 mm, usable lengths 500–3,000 mm
`[R05-A11]`; duplex 76.1–114.3 mm, triplex 114.3–133 mm, lengths 500–6,000 mm,
RHT/LHT conical and cylindrical threads, one set of two U-seals per tube
`[SYS-DUP]` `[SYS-TRI]`; grout shrouded by a coaxial air jet (double), water jet
shrouded by air with grout from a separate lower nozzle at lower velocity
(triple) `[CROCE]` §2.3.2–2.3.3.

**Category note.** There is no existing leaf for this. `CAT.jetMonitors` is
"Jet Grouting Monitors & Nozzles" and the rod is explicitly not a monitor
`[CROCE]` §2.2. Recommend a new leaf:
`jetRods: Tooling → Drill String & Rods → Jet Grouting Rods (Multi-Tube)`.

---

# 5. `NOT SOURCED` — the honest list

| Item | Status |
|---|---|
| New list price, any US auger section (CME, Hole Products, Continental, Atlantic) | `NOT SOURCED` — all login-gated or "call for price" |
| New list price, any western sonic drill rod (Terra Sonic, Boart Longyear, Geoprobe, Hole Products) | `NOT SOURCED` — all login-gated or quote-only |
| New list price, any European jet grouting rod (SysBohr, KLEMM, EMDE) | `NOT SOURCED` — project-specific, custom-made |
| Steel grade of CME auger flighting | `NOT SOURCED` — CME states hardsurfacing, not the base grade |
| Whether SysBohr's simplex range is 88.9 only or 76.1–114.3 | Conflicting: the distributor page says D 88.9 `[SYS-CRD]`, the SysBohr page title says D 76,1–114,3. Both cited; do not pick one silently. |
| Torque capacity / make-up torque for any of the three joints | `NOT SOURCED` |
| Mass of a CME 11" × 60" flight auger section | `NOT SOURCED` — CME publishes part numbers, not weights |
| Fatigue life of a sonic rod in hours or metres | `NOT SOURCED` — vendors claim "outlasted our competitors" `[MATRIX]` without numbers |

---

# 6. Flagged for your attention (nothing applied)

1. **`auger-flight-std` is named as a section but described as a head.** Rename
   before adding a section to the `rod` bay, or the shop will read as duplicated.
   §1.7.
2. **`SW hex 65 mm` on `auger-flight-std`** is not the catalogued hex for this
   class; CME uses 1 1/8" / 1 5/8" `[CME-CAT]`. §1.3.
3. **The jet grouting monitor is in the `swivel` bay.** Per `[CROCE]` §2.3 it
   belongs at the bottom of the string, immediately above the bit; the swivel is
   the flushing head at the top. §3.1.
4. **`cfa` and `cased-cfa` correctly have no `rod` bay.** Leave them alone —
   on a true CFA the flight *is* the string, and the game already models that.
   §1.1.

# Rig reference — `foundation-bg` : Rotary-Kelly bored piling rig (BG class, ~118 t)

status: IN PROGRESS — written incrementally. Anything marked `NOT SOURCED` stayed
unfound and must not be invented.

> **NAMING RULE (DOMAIN.md §10):** everything below is for GEOMETRY, PROPORTION
> and MATERIALS only. Do **not** put manufacturer names, model designations,
> badges, decals or type plates on the model. "BAUER", "BG 36", "KDK", "BK 300",
> "EMDE", "BETEK" appear here only to identify the real hardware being measured.
> The in-game rig is `Torvald KR-46 Kellyline` and carries only fictional
> branding. Copy the *shapes* and the *ratios*, never the badge.

---

## 1. Sources read

| File | Pages / extent | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Kelly_Bars_DE_EN_905_518_1_2.pdf` | pp. 2–16 (text-extracted with `pdftotext -layout`) | **The single best source in the folder.** Labelled exploded-view part list of a Kelly bar, the depth-calculation diagram (S/H/W/B/B1/T), the type-code grammar, and full dimension tables (A retracted, B extended, B1 extended-locked, D transport, weight) for every bar from BK 110/305 to BK 500/559, plus rope-swivel sizes. | **Yes — primary** |
| `C:\Users\henri\Downloads\geraetekatalog_catalog_of_machines_bauma_2025_bauer_maschinen.pdf` | pp. 2–6 (BG 30 H BT 75, eBG 33 H, BG 36 H BT 85, BG 55 BS 115) | Performance and weight class only — torque, line pull, engine, transport weight. **No general-arrangement dimensions.** Confirms the "transport weight *without counterweight*" convention and names visible sub-systems (integrated service platform, Kelly auger cleaner, spoil chute assistant, jack-up / crawler-removal package). | Partly |
| `C:\Users\henri\Downloads\Emde-Bohrtechnik-Kellystangen.pdf` | whole (8 pp.) | Marketing brochure for an aftermarket Kelly-bar maker. **No dimension table in this file** (that lives in `2-2-EMDE-Katalog-Pfahlbohren.pdf`, already mined by research pack 10). Gives only the envelope: 2- to 4-fold telescopic, torque to 500 kNm, depth to 100 m, locking *or* friction type, FEM-optimised geometry, "compatible with all common rotary drilling rigs". | Marginal |
| `C:\Users\henri\Downloads\drillity-the-game\research\10-oem-foundation.md` | §B.8, §B.9, §C, §D.3, §D.5, §D.6, spec tables ll. 560–600 | Already covers: BG-number = torque÷10, KDK naming, H- vs V-kinematics, the EMDE torque/outer-pipe/section table, the casing diameter ladder, a written silhouette description of the large-rotary class ("a tower on a barge"), and second-hand BG 45 general-arrangement figures. | **Yes — but secondary** |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` | `buildFoundationBG`, ll. 2723–2876 | The current game model, compared against the real material in §9. | Yes (as the subject) |

_(further rows appended at the end of this section as more sources are read.)_

---

## 2. What the machine IS

A **hydraulic rotary drilling rig for large-diameter bored (replacement) piles** —
the machine that makes a 1.0–2.5 m diameter hole 40–70 m deep by biting it out in
bucketfuls. It is a purpose-built **crawler carrier with a full slewing
uppercarriage**, a counterweight slab at the back, and a **vertical mast (leader)
standing at the front of the deck**, held upright by a parallel linkage of two big
rams. A **rotary drive (the KDK, *Kraftdrehkopf*) rides up and down that mast on a
crowd sledge**, and hanging through the rotary drive is the machine's defining
organ: a **telescopic Kelly bar** — three to five concentric high-tensile steel
tubes with welded drive keys, transmitting torque *and* crowd force to the tool at
any extension. Work cycle: drill down one crowd stroke, hoist the whole bar, slew
~90° off the hole, spin the bucket to sling the spoil off, slew back, drop in,
repeat. It does not dump over the hole — it slews to the side, which is why the
counterweight and the slew ring are so heavy relative to a crane of the same mast
height. At ~118 t operating it sits at the top of research pack 10's **"large
rotary"** bracket (70–110 t, 260–400 kNm) / bottom of **"very large rotary"**
(110–180 t, 400–600 kNm) — the game's 360 kNm places it right on that boundary:
a BG 36 / BG 40-size machine quoted **with** its counterweight fitted.

**Class check against the local catalogue** (`geraetekatalog … bauma_2025`, pp. 3–6):

| Real rig | Transport weight w/o counterweight | Max torque casing / drilling | Engine and pull |
|---|---|---|---|
| BG 30 H BT 75 | 63.4 t | 300 / 280 kNm | CAT C 9.3, 340 kW; max pull 565 kN in SPEX config |
| eBG 33 H all electric | — | 300 kNm @ 50 rpm | 420 kW system, battery; main winch 215 / 240 kN |
| BG 36 H BT 85 | 74.6 t | 385 / 340 kNm | Volvo TAD 13, 405 kW; main winch 290 kN; 690 kN with Crowd Plus |
| BG 55 BS 115 | — | 600 casing / 240 auger (CCFA) | CAT C 18, 597 kW; 1,060 kN crowd + main winch |

The game's `weightKg: 118000` / `powerKw: 415` / `torqueKNm: 360` therefore
describe a **BG 36-class machine at operating weight**. Internally consistent —
but see §9 on the counterweight.

---

## 3. Proportions

**Cited absolutes are thin in the local PDFs** — the machine-catalogue pages carry
performance data, not general arrangements. What *is* sourced:

| Dimension | Value | Source |
|---|---|---|
| Kelly bar outer pipe Ø, this torque class | **419 mm** (BK 280/419, BK 300/419), **470 mm** (BK 420/470); 394 mm for the 3-fold BK 400/394 | `Kelly_Bars_DE_EN_905_518_1_2.pdf` pp. 13–15 |
| Kelly bar retracted length **A** (4-fold, Ø419) | **11.33 – 20.33 m** across the range | ibid. p. 13, BK 280/419/4 table |
| Kelly bar extended length **B** (same bar) | **34.20 – 70.20 m** | ibid. |
| Kelly bar extended **locked** length **B1** | consistently **0.30 m shorter** than B | ibid. |
| Kelly bar transport length **D** | **11.51 – 20.51 m** (≈ A + 0.18 m) | ibid. |
| Kelly bar weight, this class | **7,700 – 13,450 kg** (BK 280/419/4); up to **21,950 kg** (BK 420/470/4/94) | ibid. pp. 13, 15 |
| Kelly bar **max transport diameter E** | Ø419 pipe → **E = 750 mm**; Ø470 → **826 mm**; Ø559 → **960 mm**; Ø305 → **480 mm** | ibid. pp. 8, 13, 15, 16 |
| Kelly **drive stub (Vierkant)** — the square entering the tool | **200 mm** on *every* bar in the range, BK 110 through BK 500 | ibid. pp. 8–16, repeated on every table |
| Kelly **eye** lug / pin | a = 40 mm, b = 50 mm (small classes) → a = 64, b = 80 (BK 420) → a = 76, b = 100/80 (BK 500) | ibid. |
| Rope **swivel** between main rope and Kelly head | 17 t: 575 mm long, 455 body, Ø160 eye, Ø50 pins. 30 t: 710×550 / 755×575, Ø160–195, Ø60–80. 40–50 t: 890×640, Ø216, Ø80. 60 t: 915×665 | ibid. pp. 8–16 |
| Casing OD ladder (what the hole must match) | 620 · 750 · 880 · 1000 · 1180 · 1200 · 1300 · 1500 · 1800 · 2000 · 2200 · **2500** mm; lengths 1–6 m; 403 kg (620×1 m) to 14,360 kg (2500×6 m) | `bauer-maschinen-drilling-tools-and-casings-de-en-11-25_0.pdf` via `10-oem-foundation.md` §B.9 |

**Secondary — research pack 10 quoting the BG 45 PremiumLine brochure, which is
*not* in this folder. Flagged as second-hand, not verified against the PDF:**

- BG 45: operating weight **146 t**, **max height 39.0 m**, mast general arrangement
  running to **28,490 mm** overall, **crowd stroke 9,500 mm**, undercarriage
  telescoping **3,700 → 5,000 mm** (`10-oem-foundation.md` §D.5).
- Vario-masthead sets the **drill-axis stand-off from the mast face** at
  **1,300 / 1,550 mm**, expandable to **1,700 / 2,000 mm** (ibid.).
- Mast extensions offered: **3 m or 5 m**, and **5 + 5 m for CFA** (ibid. §D.6).

### Ratios a modeller can actually use

Ratios survive a change of class; absolutes do not.

- **Crowd stroke ≈ ⅓ of the mast assembly length** (9.5 m stroke against a ~28.5 m
  mast). The carriage does **not** travel the whole leader.
- **Kelly retracted length ≈ 0.55–0.75 × mast height** — an 11.3–15.3 m retracted
  bar under a 20–28 m mast. It never fits entirely within the mast: head high,
  drive stub near the ground.
- **A 4-fold Kelly extends to 3× its retracted length** (A 11.33 → B 34.20;
  A 15.33 → B 50.20). A 3-fold extends to ~2.5× (A 10.715 → B 26.368 on
  BK 300/419/3). This is the most important animation ratio on the rig.
- **Drill axis stands 1.3–2.0 m clear of the mast face.** The Kelly does not hug
  the leader; there is a visible air gap bridged by the crowd sledge.
- **Kelly outer pipe ≈ 0.42–0.47 m** against a mast roughly 1.0–1.2 m wide — the bar
  is close to **half the width of the mast beside it**. It must read as a
  structural member the size of a lamp post, not as a drill rod.
- **Transport diameter E ≈ 1.8 × pipe Ø** (419 → 750 mm). Drive keys and Kelly head
  stand a long way proud of the tube — silhouette-relevant.
- **Undercarriage telescopes ~35 % wider for work** (3,700 → 5,000 mm, secondary).
  Track gauge is not a fixed number on this machine.
- Counterweight is roughly **a third of operating weight** by inference (≈75 t
  transport without CW vs ≈118 t operating in the same class). `NOT SOURCED` as a
  published figure — do not quote it — but it says the slab is enormous.

---

## 4. Component inventory

### 4.1 The Kelly bar — the part that makes this rig *this* rig

Named parts, top to bottom, from the labelled exploded view,
`Kelly_Bars_DE_EN_905_518_1_2.pdf` p. 2 (German | English exactly as printed):

1. **Kellytopf | Kelly pot** — the head casting at the very top, carrying the Kelly
   eye the main rope's swivel hooks into. The Spotlights page (p. 6) notes the
   **long Kelly head is standard**, specifically so an **upper Kelly guide** on the
   mast can be used "without complicated and expensive conversion". So: a long
   head, plus a guide collar at the masthead that it runs through.
2. **Mitnehmerleiste | Drive key** — welded strips running the length of each tube.
   *"Standard Kelly bars are fabricated with a total of 6 drive keys on each
   section"* (p. 2). **Six**, not two.
3. **Außenkelly (Element 1) | Outer Kelly bar** — the largest tube.
4. **Schalldämmung | Noise damping system** (optional) — absorbing pads glued into
   the **recesses between the drive keys on the outer surface**, protected by
   **sheet-metal covers**. Visually it fills the flutes on the outer tube and gives
   it a smoother, plated look. Retrofittable.
5. **Mittelkelly (Element 2) | Intermediate Kelly bar**.
6. **Verriegelung | Locking device** — mechanical locks **between every element and
   between the outer bar and the rotary drive**. Standard bars ship fully lockable;
   friction bars are the alternative (EMDE brochure).
7. **Innenkelly (Element 3) | Inner Kelly bar**.
8. **Dämpfung | Shock absorbing spring** — low down, above the stub.
9. **Vierkant | Drive stub** — the **200 mm square** that drops into the tool's Kelly
   box. **The only square part of the whole bar.**

Construction, verbatim, p. 2: *"A Kelly bar consists of 2–5 telescopic **tubular**
sections with a system of drive keys and lock recesses, welded onto their outer
surfaces."* **The tubes are round.** High-tensile steel, chosen to minimise weight
at adequate strength.

Two further sourced details worth modelling:
- **Dewatering bore holes** to the slurry outlet (p. 6) — ports through the bar so
  it does not act as a piston when pulled from a fluid-supported hole, and so the
  slurry flow self-cleans the bar. On the model: a row of holes near the bottom of
  the outer tube.
- **Split stop ring** (p. 6) — a two-piece ring, replaceable in halves.

**Type-code grammar** (p. 3) — what varies:
`BK 300 / 419 / 3 / xx / S` = nominal torque 300 kNm / outer-pipe Ø 419 mm /
number of elements / nominal drilling depth / S = noise damping fitted.

**Depth arithmetic** (p. 3), which is also the constraint on the animation:
`T = B + W − H` (unlocked) or `T = B1 + W − H` (locked), where **B** = Kelly
extended, **W** = tool length, **H** = height of the rotary drive above ground,
**S** = crowd stroke. At full depth the KDK is near the *bottom* of its stroke and
the whole bar hangs extended below it.

### 4.2 Rotary drive (KDK) and crowd sledge

- The KDK sits on a **crowd sledge running on the mast**, and on the BG 45 it is
  attached by a **hydraulically operated pin connection on the crowd sledge**
  (`10-oem-foundation.md` §C item 1, quoting BG 45 brochure p. 8) — the drive is a
  *swappable module*, pinned on. Visually: big pin bosses and lifting eyes on the
  drive housing.
- Between KDK and Kelly there is a **Kellymitnehmer | Kelly drive adapter**, its own
  part with its own type code (`KA 400/343`, `KA 500/419`, `KA 670/470`,
  `KA 962/559`…) and a **hollow stem** through which the Kelly passes
  (`Kelly_Bars_DE_EN…pdf` p. 4). Two systems: **System I** with a **Kardangelenk |
  cardanic joint** and an **Öffnerplatte | trigger plate**, and **System II** (p. 5).
  The trigger plate is what releases the telescopic locks — a visible plate on the
  drive.
- Consequence for geometry: there is a **stepped collar around the Kelly where it
  enters the drive**. The bar does not pass through a plain hole.
- Speed: an eBG 33 rotary drive is rated **300 kNm @ 50 rpm** (bauma 2025 p. 4).
  50 rpm is the *maximum* — a big Kelly rig turns slowly and visibly.

### 4.3 Winches and ropes

- **Main winch** line pull at this class: **290 kN** (BG 36 H); 215 / 240 kN
  (eBG 33); 1,060 kN combined crowd + main winch (BG 55) — bauma 2025 pp. 4–6.
- The BG 45 uses a **single-layer winch for minimised rope wear**, in a
  "service-friendly winch position", with a **swing-down mechanism for transport**
  (`10-oem-foundation.md` §D.5, secondary). A single-layer drum is **long and
  grooved** — model the drum wide, not fat.
- **Three or four winches are visible on the uppercarriage** at this class: main,
  auxiliary, crowd (ibid.).
- The main rope terminates in a **rope swivel** (dimensions in §3), then the Kelly
  eye. The swivel is a chunky 0.7–0.9 m long body — not a plain shackle.

### 4.4 Uppercarriage, access and guarding

- **Uppercarriage with integrated service platform** is a headline feature on the
  BG 36 H (bauma 2025 p. 5) — the walkway is part of the house, not a bolt-on.
- **Walkways with folding handrails** on the upper level and folding guardrails for
  transport — "a real, visible detail on every big rig"
  (`10-oem-foundation.md` §D.5). Model the hinges and the fold-down stubs.
- **Counterweight**: a **slab at the back, routinely removed for transport** —
  which is why every published weight is "transport weight **without**
  counterweight" (bauma 2025 pp. 3, 5). It must read as a bolted / pinned removable
  block with lifting eyes, not as bodywork.

### 4.5 Method-specific attachments — each a visible lump

From the bauma 2025 catalogue, all named as fitted equipment:
- **Kelly auger cleaner** "for noise sensitive construction sites" (BG 36 H, p. 5) —
  a scraper at the mast that strips spoil off the auger instead of shaking it off.
  `16-site-archetypes.md` l. 288 confirms the reason: on noise-controlled sites,
  spoil is not shaken off by slamming the rotary into reverse.
- **Spoil discharge system with chute-bucket-assistant for directed ejection**
  (BG 55, p. 6) — a chute at the mast foot.
- **Torque multiplier BTM 600** for cased CFA (BG 55, p. 6) — a second, larger
  rotary below the KDK when casing is turned. Double-rotary stacks two drives.
- **Jack-up system / mobilisation package** with "optimized clearance width for
  crawler removal" (BG 55, p. 6) — the crawler frames come off; there are jacking
  points on the car body.
- **FDP (full displacement piling)** and **SPEX (Single Pass Extreme)** equipment
  (BG 30 H, p. 3) — different front ends on the same carrier.

### 4.6 Undercarriage

Track shoe width, sprocket and idler diameters and roller count are **`NOT SOURCED`
locally**. What *is* sourced: the undercarriage **telescopes** (3,700 → 5,000 mm on
the BG 45, secondary via pack 10 §D.3 / §D.5), so the car body is a **cross-frame
with visible slide-out beams and locking pins** between the crawler frames. That
mechanism matters more visually than the exact shoe pitch.

---

## 5. Distinctive features (thumbnail silhouette)

1. **A tower on a barge.** Mast height dominates: a ~28 m mast on a ~12 m machine —
   at thumbnail size, a vertical line roughly **2.5× the length of the hull** it
   stands on (`10-oem-foundation.md` §D.5).
2. **The Kelly bar hanging in front of the mast, offset from it by a visible gap.**
   A nest of concentric round tubes, a long head at the top, a rope swivel above
   that. Nothing else in the game's rig line-up has this. The 1.3–2.0 m drill-axis
   stand-off is what stops it reading as a crane jib.
3. **The counterweight slab overhanging the tracks at the rear**, balancing the
   mast. Rotary rigs are *not* symmetrical front-to-back.
4. **The parallel-linkage leader mount** — two heavy rams and a parallelogram
   between deck and mast foot, so the mast translates fore/aft while staying
   vertical. On V-kinematics machines this linkage is visually heavy (ibid.).
5. **A drilling bucket or big auger lying on the ground beside the hole**, and a
   spoil pile off to one side — because the rig slews to dump. A rotary rig with no
   second tool on the mat looks wrong.

Negative space matters as much: **no hammer sliding on the leader** (that is a
driven-pile rig), **no single full-length auger** (that is CFA), and **the mast
stands vertical, not raked** — raking is the driven-pile silhouette
(`10-oem-foundation.md` §D.7).

---

## 6. Materials and paint
_(pending)_

## 7. Photo references
_(pending)_

## 8. NOT SOURCED
- Overall machine length / width / height for any BG rig, from a **local** file.
- Track gauge, track shoe width, sprocket / idler / roller geometry.
- Mast cross-section dimensions, and whether this class is lattice or box section.
- KDK external dimensions.
- Diameter step between Kelly elements (only the **outer** pipe Ø is published).

## 9. Domain-truth warnings vs the current game build
- **The Kelly tubes are ROUND, not square.** `buildKellyBar` uses `G.box`.
  Source: `Kelly_Bars_DE_EN_905_518_1_2.pdf` p. 2, *"2–5 telescopic tubular
  sections"*; every table column is headed *"Diameter outer pipe"*.
- **Six drive keys per section, not two** (ibid. p. 2).
- **Only the bottom drive stub is square, and it is 200 mm** on every class from
  BK 110 to BK 500 (ibid. pp. 8–16).
_(more to follow)_

# Rig reference — `foundation-bg` : Rotary-Kelly bored piling rig (BG class, ~118 t)

status: COMPLETE for the material available locally. Anything marked `NOT SOURCED`
stayed unfound and must not be invented. §8 lists the real gaps.

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

### 4.7 Hose routing — a bundle, not loose snakes

`Bauer-Maschinen-Hydraulikschläuche-hydraulic hoses-DE-EN-905-213-1+2.pdf` is
short but it is the only local document that says exactly where the hoses run.
Three packages are sold, and their endpoints *are* the routing:

| Package | Runs from → to | Contents |
|---|---|---|
| **Hauptschlauchpaket / Main hose package** | *hose deflection* (`Schlauchumlenkung`) → **bulkhead plate on the KDK** (`Schottplatte KDK`) | **six main working lines to the KDK**, plus high-pressure lines depending on equipment |
| **Main hose package complete** | same | all hydraulic hoses to the KDK bulkhead, **electric cable inside the hose package**, **new flat tarpaulin hose bag** (`Neue Flachplane`) |
| **Mastschlauchpaket / Mast hose package complete** | **bulkhead on the base carrier** → **bulkhead on the KDK** | all hoses base carrier → KDK bulkhead, electric cable in the bundle, new tarpaulins |

So the correct geometry is:

1. A **deflection point / roller** on the machine where the bundle turns upward.
2. A **flat, ordered bundle** — six-plus lines side by side, an electric cable
   inside it — **wrapped in a fabric hose bag**, so what you see is a strapped
   flat package, not a handful of individual black tubes.
3. It terminates at a **bulkhead plate on the rotary drive**, where every line
   ends in a bolted plate. There is a matching bulkhead on the base carrier.
4. Because the KDK travels the crowd stroke, the bundle **must form a moving loop
   that grows and shrinks** — in `Rotary_Drilling_Rig_1000_0001.jpg` this is
   clearly visible as a large organised catenary of parallel hoses beside the mast.

Hose envelope (same source): suction hoses **NS 25–100**; two-layer low-pressure
**NS 6–75**; six-layer high-pressure **to NS 25**; **R15 high-pressure 420 bar,
NS 32–50, lengths up to 120 m**; temperature range **−55 °C to 150 °C**.

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

---

## 6. Materials and paint

Mapped onto the game's existing material buckets in `rigFactory.js`
(`paint · dark · black · accent · steel · worn · chrome · rubber · glass`).

| Surface | Material | Evidence / reasoning |
|---|---|---|
| Mast / leader, uppercarriage house, cab shell, counterweight, engine covers | **painted steel** — two-tone. In `Rotary_Drilling_Rig_1000_0001.jpg` the mast, undercarriage and linkage are **dark graphite**, the engine-house side panels **yellow-orange**, the cab and the deck handrails **white / light grey**. | the render; the game already uses a similar 3-value split |
| Deck handrails, cab-roof rail, access ladder | painted, and **a different value from the house** — in the render the perimeter rails read almost white, the ladder orange-red. High-contrast because they are safety furniture. | render |
| Kelly bar tubes and drive keys | **worn / bright steel with a mud gradient.** The bar is the one part that goes into the ground and back out several times an hour. | `Kelly_Bars_DE_EN…pdf` p. 2 — high-tensile steel tube; factory finish `NOT SOURCED` |
| Noise-damping covers on the outer Kelly (optional) | **sheet metal** panels filling the flutes between the drive keys — a smoother, plated band on the outer tube only | ibid. p. 2 |
| Drilling tools (bucket, auger, rock auger) | painted body + **hardfacing weld beads or bolt-on wear strips**, and **tungsten-carbide teeth brazed into steel holders** | `bauer-maschinen-drilling-tools-and-casings…pdf` pp. 5–6, 11 ("wear protection: hard facing or wear strips", "fishtail pilot and flat teeth"); `bwh-betek-katalog-spezialtiefbau-foundationdrilling-en.pdf` (carbide tip brazed to a steel section; weld-on teeth; flat teeth; holders; **fused-tungsten-carbide coating 6 mm thick**; stud-welded "TungStuds" wear protection) |
| Hoses | **black rubber**, but bundled — see §4.7. The bundle is wrapped in a **flat tarpaulin / hose bag** (*Flachplane*, "new hose bag"), so the visible object is a **fabric-sleeved bundle**, not loose snakes | `Bauer-Maschinen-Hydraulikschläuche…pdf` |
| Cylinder rods (leader rams, crowd) | **chrome** | game convention; consistent with the render |
| Cab glazing | **glass**, and there is a lot of it — full-height front screen, side screen, **and a roof window** so the operator can watch the masthead | render |
| Track shoes, sprocket, idler, rollers | **worn / dark steel.** These are steel-shoe crawlers, not rubber-padded. | render |

**Where dirt actually lands** (this is the part that makes it read as a working
machine rather than a showroom render):

- **A vertical mud gradient on the outer Kelly tube** — caked at the bottom,
  thinning upward to the height the bar last went in. It comes out of a wet hole
  every cycle. This is the single most characteristic dirt pattern on the machine.
- **Spoil and wet clay on the mast foot, the lower quarter of the leader, and the
  front of the car body** — the bucket is emptied by spinning it, and it throws.
  `16-site-archetypes.md` l. 370 notes the rig *slews to the side of the hole* to
  do this, so the dirt is asymmetric: heaviest on the slew-off side.
- **Track frames and shoes packed with mud**, cleaner on the wearing faces.
- **Grease and dark streaks** at the crowd-sledge rails, the Kelly drive adapter
  and the sheave pins; the machine has **central lubrication**
  (`rb-equipment-and-accessories-bauer-parts-and-service.pdf`, "Central
  Lubrication") so grease exits at every bearing.
- **Rust** on the counterweight lifting eyes, the pin bosses of the KDK mount, and
  the exposed edges of any part that is routinely unbolted for transport.
- **Chipped paint on walkway nosings and handrail top rails** — where boots and
  hands go. The game already does this (`addWearStory` chips at the walkway edge);
  it is right, keep it.
- **Concrete splatter** near the hole if the rig also handles the tremie — grey,
  hard, and it does not wash off.

---

## 7. Photo references

| Image | What it is | Useful for |
|---|---|---|
| `C:\Users\henri\Downloads\Rotary_Drilling_Rig_1000_0001.jpg` | **The best local image of this class.** A clean 3D-render turntable of a rotary drilling rig, shown twice (large hero + small full-machine). Neutral background, no branding. | **Mast section** (see §9 — it is a *plate/box girder with big round lightening holes*, not a lattice); the **parallel-kinematics linkage** at the mast foot with two rams plus a diagonal masthead strut; **hose bundle routing** — a large organised catenary loop of many parallel hoses running from the deck up the mast; **deck layout** — cab offset forward-left, engine house right-rear in yellow, perimeter handrails, side ladder; **undercarriage** — long steel-shoe crawler frames, sprocket at one end, idler at the other, visible track rollers; **cab glazing** including the roof window; the **overall colour split** (graphite structure / yellow house / white cab and rails). **Not useful for the Kelly bar** — the tool fitted in the render is a large auger on the drive, not a telescopic Kelly. |
| `C:\Users\henri\Downloads\rtg-rammtechnik-gmbh-rg-rammgerät-im-einsatz-pile-driver-in-action-2023.jpg.webp` | A **driven-pile** rig (different archetype) | **Contrast only** — this is the silhouette `foundation-bg` must NOT look like. Leader + hammer, and it rakes. |
| `C:\Users\henri\Downloads\Surface_Drill_Rig_1000_0001.jpg`, `surface_top_hammer_drill_rigged_01.jpg`, `surface-drill-rig-for-quarrying-and-mining-smartroc-d65-3d-model-77345d1f1d.webp` | Surface top-hammer / DTH rigs | Wrong class. Useful only as a negative reference. |
| `C:\Users\henri\Downloads\Atpa\*` (≈40 images) | Swept: these are **drilling tools and bits** (down-the-hole bits, drill heads Ø129–238 API, `BS_SW80.JPG`, `Sw100.JPG`), plus product and sticker shots. | **No piling rigs.** Useful for *tool* wear and steel finish, not for this machine. |
| `C:\Users\henri\Downloads\AdobeStock_576964972.jpeg`, `AdobeStock_69686132.jpeg` | Checked and rejected: an offshore worker portrait and a world map. | Nothing. |

`NOT SOURCED`: **no photograph of a real rotary-Kelly rig at work exists in
Downloads** — only the render. The mud, the spoil pile, the working platform and
the Kelly-in-the-hole cycle have no local photographic reference. If the owner
can drop two or three site photos of a BG-class rig into Downloads (one full
side elevation, one close-up of the Kelly entering the rotary drive, one of the
mast foot with the tool on the ground) this document's weakest section closes.

---

## 8. NOT SOURCED

> ### RESOLVED 2026-09-05 — the overall dimensions ARE published, and the
> ### 27.100 m figure is real
>
> The first two bullets below say overall length/width/height and track
> gauge/shoe width are unsourced "from a *local* file", and that "the bauma
> catalogue pages carry no general arrangement". True of the bauma catalogue.
> **Not true of the machine.** `blender/foundation_bg.py` [S1] is the full
> product brochure for the 385 kNm rig on the 95-class base carrier, doc
> 905.868.2, 12/2020, and this session re-fetched it and **read the drawings**
> rather than only the extracted text.
>
> **How, because this is the part that was actually blocking everyone:**
> poppler is missing on this machine (`crawler-th.md` section 8 records it) but
> **PyMuPDF is installed**, and
> `page.get_pixmap(matrix=pymupdf.Matrix(3, 3)).save(...)` renders any page of
> any catalogue in this library legibly. Use it before writing a NOT SOURCED
> entry about a drawing.
>
> **p.10 "Dimensions - Basic Version"**, operating weight 112 t as shown:
> 25600 / 23390 / 19640 / Stroke 10000 / 13630 / 3630 / 1100 / 1170 /
> 4040-5540* / 5680 / R 4640 / 1500 / **3380-4580** / **800** /
> BK 420/470/3/36 / 5-5-5-15 deg.
>
> **p.16 "Application - Kelly Drilling"**, two GAs side by side. Upgraded
> version: **27100** / 24110 / 19640 / Stroke 10000 / 13630 / 3630 / **1400** /
> 1170 / 4340-5840* / R 4640 / **3000** / BK 420/470/4/48, over a table giving
> mast extension 3 m, upper Kelly guide fitted, drilling axis 1 400 mm, max
> drilling diameter 2 500 uncased / 2 200 cased, operating weight **131 t**.
>
> **So 27.100 m is printed on the page**, and the decode is confirmed rather
> than merely arithmetic: 4 460 + 19 640 + 1 500 = 25 600 and
> 4 460 + 19 640 + 3 000 = 27 100 are both printed, side by side, on one
> drawing. ASTRA.md section 7.5 calls this figure unsourced; **that note is
> stale.**
>
> **p.11 "Technical Specifications":** crawler overall length 5 680 / 6 090 /
> 6 090 mm; track shoes **800 / 900 mm**; KDK 340 K and KDK 385 S at 342 / 385
> kNm and 40 / 53 rpm; max sledge stroke with 3 m mast extension 20 090 mm.
>
> **p.23:** crawler unit dimensioned **6 090 x 1 070 x 1 130 mm**, 2 x 9.8 t.
> Table "Width of crawlers retracted / extended" — 800 mm shoes
> **3 400 - 4 600**; 900 mm shoes **3 500 - 4 700** (Standard and Upgraded),
> 4 000 - 4 800 (Transport optimized). The 800 and 900 rows differ by exactly
> one shoe-width step, which **proves the figures are measured over the shoes**
> and that the centre gauge is 2 600 retracted / 3 800 extended either way.
> Also: "Transport with UW 110 Transport Optimized Version, G = 63.9 t,
> **B = 3,000 mm**" with the crawlers listed separately — so the whole
> uppercarriage, cab included, is 3 000 mm across.
>
> **One correction to make in the file, recorded here too:** the counterweight
> on p.23 is dimensioned **950 x 450** with B = 3 000 mm and G = 1 x 4.9 t +
> 4 x 2.5 t. **1 720 is the ROTARY DRIVE's width** in the adjacent panel, not a
> counterweight dimension — `foundation_bg.py`'s `CW_H` cites it as one. Do not
> quote 1.720 as sourced.
>
> **Still NOT SOURCED** from the list below: mast cross-section width x depth
> (BAUER's closest proxies are transport envelopes — lower mast section
> 2 480 mm, upper section with masthead 2 100 mm); KDK external dimensions
> (only masses: KDK 340 K 6.7 t, KDK 385 S 7.2 t); crowd-cylinder vs
> crowd-winch architecture; Kelly element taper ratio; Kelly paint finish; cab
> dimensions and whether it elevates.

Honest list. None of these should be invented.

- **Overall machine length / width / height** for any BG rig, from a *local* file.
  The bauma catalogue pages carry no general arrangement.
- **Track gauge, track shoe width, sprocket / idler diameters, roller count.**
- **Mast cross-section dimensions** (width × depth) and its bay pitch. The *type*
  of section is now evidenced by the render, but not its size.
- **KDK external dimensions**, weight, and how far it stands off the mast face
  measured rather than inferred.
- **Crowd-cylinder vs crowd-winch architecture** for this specific class — pack 10
  records that Soilmec sells CCS and WCS as distinct variants with different mast
  geometry (§ll. 167), so this is a real fork, not a detail. Which one a BG uses is
  unsourced here.
- **Diameter step between Kelly elements** — only the *outer* pipe Ø is published
  in the Kelly-bar catalogue. Do not guess a taper ratio.
- **Factory paint finish of the Kelly bar itself** (painted or bare) — unstated.
- **Counterweight mass and dimensions** as a published figure.
- **Number and position of winches on a BG deck**, from a primary source. Pack 10's
  "three or four winches" is second-hand from a brochure not in this folder.
- **Cab dimensions, tilt mechanism, and whether it elevates.**
- A **local photograph** of the class at work (see §7).

---

## 9. Domain-truth warnings vs the current game build

Read against `buildFoundationBG` and `buildKellyBar`,
`C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` ll. 2723–2876.

**A. The Kelly bar is wrong in three ways at once — and it is the machine's
signature part.**

1. **The tubes are ROUND, not square.** `buildKellyBar` builds each section with
   `G.box(T, s, secLen, s)`. Source: `Kelly_Bars_DE_EN_905_518_1_2.pdf` p. 2 —
   *"A Kelly bar consists of 2–5 telescopic **tubular** sections"*; every dimension
   table in that catalogue is headed **"Diameter outer pipe"**. A driller will spot
   a square Kelly instantly.
2. **Six drive keys per section, not two.** Current code loops `k < 2`. Source:
   ibid. p. 2 — *"Standard Kelly bars are fabricated with a total of 6 drive keys
   on each section."*
3. **Only the bottom stub is square, and it is 200 mm** — on *every* class from
   BK 110 to BK 500 (ibid. pp. 8–16). The code does place a square-ish plate at the
   bottom (`s * 1.6 × 0.18 × s * 1.6`) but the whole bar above it is square too, so
   the distinction is lost.

**B. Kelly proportions.** Current: `sections: 4, secLen: 6.4, size: 0.34`, i.e.
25.6 m of tube at 340 mm outer, telescoping with a 0.80 size ratio per section.
Against the catalogue: for a 360 kNm rig the correct family is **BK 300/419 or
BK 400/394 or BK 420/470** — **outer pipe 394–470 mm**, not 340. The game's bar is
**~20 % too thin for its stated torque**. Retracted length A for a 4-fold in this
class is **11.3–20.3 m**; the game's collapsed bar is ~6.4 m + overlaps. Extension
ratio should be **≈3× retracted** for a 4-fold (A 11.33 → B 34.20,
`Kelly_Bars…pdf` p. 13); the code's `maxExt = 3 × (6.4 − 0.9) = 16.5 m` on a 6.4 m
base is ~3.6×, close but the absolute lengths are short. Also
`spec.kellyM: 4 × 6.4 = 25.6` vs `maxDepthM: 68` — those two cannot both be true:
`T = B + W − H`, so 68 m of depth needs a bar whose **extended** length is ~68 m,
which in this catalogue is a **BK 280/419/4/68 (A = 19.33 m, B = 66.20 m, 13,450 kg)**
or a BK 420/470. Either raise the bar or lower the depth.

**C. The mast is built as a lattice; the real machine is a plate/box girder.**
`buildLatticeMast(... bays: 7, chordR: 0.075 ...)` builds an open lattice with
75 mm chords. In `Rotary_Drilling_Rig_1000_0001.jpg` the leader is a **welded
box section of flat plate, pierced with large round lightening holes**, closed on
its faces — a completely different read at any distance: solid dark mass with
punched circles, not an open truss. Lattice belongs on a crawler crane or a
driven-pile leader, not on this class of rotary mast. `NOT SOURCED`: the section's
actual width and plate thickness.

**D. The hoses are modelled as four loose snakes; the real thing is one bundled,
bagged package with a defined start and end.** From
`Bauer-Maschinen-Hydraulikschläuche…pdf`: the **Hauptschlauchpaket / main hose
package** runs *"from hose deflection (Schlauchumlenkung) to Bulkhead KDK
(Schottplatte)"* and carries **six main working lines to the KDK** plus
high-pressure lines; the **Mastschlauchpaket / mast hose package** runs *"from
bulkhead base carrier to bulkhead KDK"* and includes the **electric cable inside
the hose package**, all wrapped in a **flat tarpaulin (`Flachplane`) / hose bag**.
So the correct model is: a **deflection roller** on the machine, a **flat bundle
in a fabric sleeve** running up the mast, and a **bulkhead plate on the rotary
drive** where every hose terminates — and the bundle must **move with the
carriage**, forming a loop that grows and shrinks over the crowd stroke. The game
currently routes hoses only around the deck (`root`, y ≈ 2.2–5.5), never to the
KDK, and the KDK travels 2.6 → 14.3 m with no hose following it. Hose sizes for
reference: suction NS 25–100, low-pressure NS 6–75, six-layer high-pressure to
NS 25, R15 420 bar NS 32–50, **lengths up to 120 m**.

**E. The counterweight must read as removable.** It is currently a rounded box
fused to the body (`G.roundedBox(3.05, 1.45, 1.05)` at z = −7.65). Every published
weight for this class is *"transport weight **without counterweight**"*
(bauma 2025 pp. 3, 5: 63.4 t for BG 30 H, 74.6 t for BG 36 H) — the slab comes off
for every move. Give it **lifting eyes, a pinned/bolted interface and a parting
line**. Same for the crawler frames: the BG 55 ships with a *"jack-up system with
optimized clearance width for crawler removal"* (ibid. p. 6).

**F. The rotary drive is a swappable pinned module, not a welded lump.** The BG 45
takes either of two KDKs via a *"hydraulically operated pin connection on the
crowd sledge"* (`10-oem-foundation.md` §C.1). `buildTool('rotary-drive-head')`
should show pin bosses and lifting eyes at the sledge interface.

**G. Missing part between drive and Kelly: the Kelly drive adapter
(`Kellymitnehmer`).** A separate component with its own type series
(`KA 400/343` … `KA 962/559`), a **hollow stem**, and — in System I — a **cardanic
joint** and an **Öffnerplatte / trigger plate** that releases the telescopic locks
(`Kelly_Bars…pdf` pp. 4–5). Right now the Kelly is parented straight to the
carriage at `(0, 0.05, 0)` and passes through nothing. Model a **stepped collar**
at the drive with a visible trigger plate.

**H. Missing at the masthead: the upper Kelly guide.** The catalogue makes a
selling point of the **long Kelly head (standard)** precisely *"to allow an upper
Kelly guide to be used"* (ibid. p. 6). There should be a guide collar near the top
of the mast that the Kelly head runs through, and it is what sets the visible
**drill-axis stand-off of 1,300–2,000 mm** from the mast face
(`10-oem-foundation.md` §D.5, secondary). The game places the Kelly essentially on
the mast centreline via the carriage — the characteristic gap is missing.

**I. Missing rope hardware: the rope swivel.** The main rope ends in a **swivel**
of 575–915 mm body length with Ø160–216 mm eyes and Ø50–80 mm pins, rated 17 t to
60 t (`Kelly_Bars…pdf` pp. 8–16), and *then* the Kelly eye. The game's `ropeA`
tube runs straight to the masthead with nothing at the Kelly end.

**J. Crowd stroke is over-long.** `dyn.carriageRange = [mastH − 5.2, 2.6]` gives
the carriage ~11.7 m of travel on a 19.5 m mast — 60 % of the leader. The
secondary BG 45 figure is a **9.5 m crowd stroke on a ~28.5 m mast**, i.e. **≈⅓**.
Shorten the range or lengthen the mast.

**K. Rotation speed.** `tools.js` derives `rpmMax = 38 − 0.03 × torque` → 27 rpm at
360 kNm. The catalogue rates a 300 kNm electric drive at **50 rpm maximum**
(bauma 2025 p. 4). The game is conservative rather than wrong, but if the number is
shown to the player, 50 rpm is the sourced ceiling for a 300 kNm drive.

**L. Kelly box size.** `tools.js` sets `kellyBoxMm: torqueKNm > 250 ? 200 : 150`.
Bauer specifies **Kelly box 200 mm on every drilling tool in the catalogue**, and a
**200 mm drive stub on every Kelly bar from BK 110 to BK 500**
(`bauer-maschinen-drilling-tools-and-casings…pdf` pp. 5–11;
`Kelly_Bars…pdf` pp. 8–16). 200 is the volume size across the whole range; smaller
boxes exist but are not a simple function of rig torque.

**M. Tool proportions for whatever hangs on the Kelly** (currently unspecified in
the rig builder). From `bauer-maschinen-drilling-tools-and-casings…pdf` pp. 5–6, 11:

| Tool | Effective length NL | Overall length GL | OD range | Weight |
|---|---|---|---|---|
| Auger `SB` / `SB-2` | 1,700 or 2,250 mm | **2,315 or 2,865 mm** | 520 – 2,500 mm | 600 – 2,900 kg |
| Drilling bucket `KB` / `KB-2` | 1,550–1,900 mm (RL 1,200/1,500) | **2,150 – 2,500 mm** | 520 – 2,500 mm | 660 – 5,730 kg |

So the tool on the bottom of the Kelly is **~2.2–2.9 m long overall** and up to
**2.5 m across** — a big object, roughly as tall as a person and a half, and the
head above the flights (GL − NL ≈ 600 mm) is the Kelly-box block. Buckets carry a
**ventilation pipe (`Saugkanal`)** and a **fishtail pilot**; augers a
**fishtail pilot and flat teeth**. Rock augers (`SBF-K`, `SBF-P`, `SBF-Z2`) are the
carbide-toothed variants for 5–100 MPa rock.

**N. Naming — do not regress.** `spec.name` is already the fictional
`Torvald KR-46 Kellyline`, which is correct per DOMAIN.md §10. Keep every real
designation in this document out of the mesh names, the decals (`addDecals`
`brand`), and the shop copy. The **shapes** in this document are free to copy; the
**badges** are not.

---

## Appendix — continuation of §1, further sources read

| File | Extent | What it showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Bauer-Maschinen-Hydraulikschläuche-hydraulic hoses-DE-EN-905-213-1+2.pdf` | whole (2 pp.) | Short but **directly load-bearing for hose routing**: names the three hose packages and their exact endpoints (hose deflection → KDK bulkhead; base-carrier bulkhead → KDK bulkhead), states **six main lines to the KDK**, the electric cable inside the bundle, the **flat tarpaulin hose bag**, and the hose size / pressure / length envelope. | **Yes** |
| `C:\Users\henri\Downloads\bauer-maschinen-drilling-tools-and-casings-de-en-11-25_0.pdf` | contents p. 1; augers pp. 5–6; buckets pp. 11–12; type key p. 2 | Tool type codes (SB auger, KB bucket, KR core barrel), dimension tables (NL / GL / OD / weight), **"Kelly box 200 mm"** repeated on every tool, wear-protection wording, and the casing OD ladder. | **Yes** |
| `C:\Users\henri\Downloads\bwh-betek-katalog-spezialtiefbau-foundationdrilling-en.pdf` | scanned for materials | Tungsten-carbide tooling: carbide tip brazed to a steel body, weld-on teeth, flat teeth, dragon tooth, holders, **fused-tungsten-carbide coating 6 mm**, stud-welded wear protection. | Yes, for **materials on tools** only |
| `C:\Users\henri\Downloads\rb-equipment-and-accessories-bauer-parts-and-service.pdf` | scanned | A **spare-parts** catalogue — tricone bits, filters, seals, joystick labels, central lubrication. Aimed at the anchor/KR rig line, not the BG. | **Mostly not useful** for this subject; the one takeaway is that the machine has **central lubrication** (so grease at every bearing). |
| `C:\Users\henri\Downloads\Rotary_Drilling_Rig_1000_0001.jpg` | viewed | See §7 and §9-C. **The most informative single item for silhouette and structure.** | **Yes** |
| `C:\Users\henri\Downloads\Atpa\` (folder swept), `AdobeStock_*.jpeg`, `Surface_Drill_Rig_*` | listed / spot-checked | No rotary-Kelly rigs. | No |
| `C:\Users\henri\Downloads\drillity-the-game\research\16-site-archetypes.md` | ll. 50, 100–119, 282–296, 317, 370 | Confirms `rotary-kelly` belongs to the `nordic`, `german-site`, `iberian-quarry` and `alpine` archetypes; the working-platform rule; the **5 m exclusion zone for large-diameter rotary bored** work; that the rig **slews to the side of the hole** to discharge spoil; and the noise rule against shaking spoil off in reverse. | Yes, for **staging** |
| `C:\Users\henri\Downloads\drillity-the-game\research\18-visual-reference.md` | first 60 ll. | Not a source on this machine — it is the owner's visual target for the surface/section scene, and flags that the reference reel is AI-generated. | Context only |

_Status: complete for the material available locally. The gaps in §8 are real gaps,
not omissions._

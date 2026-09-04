# Rig reference: `piling-leader` — Driven-piling leader rig, hydraulic impact hammer (Junttan class)

status: in progress
Subject: game rig id `piling-leader` (in-game name "Bergholt PM-78 Leaderline")
Builder: `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` → `buildPilingLeader()`
Purpose: GEOMETRY + MATERIALS reference for the modeller. Not a gameplay balance sheet.

> **Naming rule (DOMAIN.md §10).** Everything below is sourced from real manufacturers
> (Junttan Oy, RTG, ABI, SSAB/Ruukki, Peikko). Those names and model designations are cited
> here ONLY so the geometry is traceable. **Do not put any real manufacturer name, model
> number, logo or badge shape on the model.** Decals must be the game's own fictional brand.
> Copy the *shapes*, never the *badges*. This matters especially here: the game's current
> spec block is a near-verbatim transcription of a real Junttan PM 25H datasheet (see §9).

---

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\13915_Junttan_PM25H_Datasheet.pdf` | 1–2 (of 3) | **The single most valuable document in the folder.** p.1 is a full-height side elevation of the rig in working position. p.2 carries the complete technical table AND two *dimensioned* transport GA drawings (standard config, and longest-leader config). Every hard number in §3 comes from here. | YES — primary |

*(more rows appended as I go)*

---

## 2. What the machine IS

A **crawler-mounted, self-erecting, telescopic-leader driven-piling rig** — the "purpose-built
piling rig" class, not a crane with a lead hung off it. There is **no boom**. A single very tall
vertical leader (a "leader" or "mast"; British sites say *leader*, some say *lead*) is pinned to
the front of a slewing upperstructure and braced back to it by an A-frame and rake cylinders. A
**hydraulic impact hammer** rides up and down that leader on guide shoes, hanging on its own
winch rope; the pile hangs below it on a second rope, guided by the same leader. The machine
stands the leader up on its own hydraulics in a few minutes (self-erecting), spots the pile by
sliding the whole leader horizontally on the carrier, rakes the leader fore/aft and sideways for
raked piles, drives the pile to set, then tracks a few metres to the next pile position and does
it again. It works standing on the ground — no outriggers under the tracks in normal driving —
and its stability comes from mass, a very low centre of gravity, a **hydraulically expandable
track gauge** and a **movable counterweight**. It lives on soft-ground foundation sites:
housing plots, bridge abutments, quay walls, wind-farm bases. It is a production machine —
its whole design is about doing one pile every few minutes, all day.

Two things a driller would insist on that the silhouette must show:
1. **The leader is taller than everything else by a factor of four or five.** The carrier is a
   low, squat, wide box; the leader is a thin line going up out of frame.
2. **The leader runs down past the tracks to the ground, and the pile goes down the leader.**
   The bottom of the leader is at or below track-top level, right at the pile.

---

## 3. Proportions

All figures from `13915_Junttan_PM25H_Datasheet.pdf` p.2 unless noted.
Ratios matter more than absolutes — the ratio column is what to model to.

### Hard, tabulated numbers (p.2 "Technical Data")

| Quantity | Value | Ratio / note |
|---|---|---|
| Nominal operational weight | **78 000 kg** | ~78 t class |
| Overall height, standard config | **26 500 mm** (87 ft) | dimensioned on the left GA, p.2 |
| Overall height, longest leader config | **30 650 mm** (100½ ft) | right GA, p.2 |
| Crawler length | **5 700 mm** (225 in) | the master scale bar |
| Track gauge, min (travel) | **3 380 mm** over 900 mm shoes | |
| Track gauge, max (working) | **4 880 mm** over 900 mm shoes | **expands 1 500 mm** |
| Track shoe width options | **800 / 900 / 1 000 mm** | 900 is the datasheet default |
| Slewing ring | **1 600 mm**, single row, single drive | |
| Counterweight | **6 000 kg + 2 000 kg extendable** | |
| Leader telescope stroke | **4 000 mm** | |
| Leader foot travel up/down | **1 000 / 500 mm** | |
| Leader horizontal (spotting) travel | **1 500 mm** | |
| Leader capacity | 20 000 kg | |
| Pile winch / hammer winch / aux winch | 10 000 / 15 000 / 5 000 kg | **three** winches, not two |
| Max pile length | 25 m (with the smallest recommended hammer) | |
| Engine | 280 kW (376 hp) | |
| Fuel / hydraulic oil tank | 420 l / 670 l | |
| Hydraulic max pressure | 320 bar; flow 2×280 + 120 l/min | |

### Dimensioned on the GA drawing (p.2, left elevation, "Standard PM 25H with HHK 7A hammer")

| Dimension | Value | What it is |
|---|---|---|
| Track frame, sprocket-to-idler centres | **4 800 mm** | inner dim on the crawler |
| Track frame, overall | **5 700 mm** | outer dim on the crawler |
| Pile axis → slew centre | **5 100 … 3 600 mm** | range = the 1 500 mm horizontal leader shift |
| Slew centre → rear extremity | **4 200 … 5 700 mm** | range = 1 500 mm; sums with the above to a constant 9 300 mm total |
| Leader below reference / foot region | **4 000 mm** (13⅛ ft) | vertical dim at the leader foot |
| Upper vertical chain (top down) | **900 · 1 800 · 6 000 · 13 800** mm | leader section breaks; 13 800 mm (45¼ ft) is the big lower span |

**Two sources disagree — record both, do not pick one:** the GA's rear overhang range
(4 200…5 700 mm) and the pile-axis range (5 100…3 600 mm) both span exactly 1 500 mm and always
sum to 9 300 mm. That is consistent with the counterweight extending in step with the leader
shift, but the datasheet never says so in words. **Treat the linkage as unconfirmed.**

### Derived ratios for the modeller (calibrate on crawler length = 5 700 mm)

- **Overall height : crawler length = 26 500 : 5 700 ≈ 4.65 : 1.** This is the ratio that makes
  the machine read correctly. If the mast looks less than ~4.5 crawler-lengths tall, it is wrong.
- **Track gauge : crawler length = 4 880 : 5 700 ≈ 0.86 : 1 working, 0.59 : 1 travelling.**
  Working stance is nearly as wide as it is long — squat and square in plan.
- Total plan length (pile axis to rear) : crawler length = 9 300 : 5 700 ≈ **1.63 : 1**.
  The machine overhangs its own tracks substantially, front *and* rear.
- Scaled off the p.2 GA against the 5 700 mm bar (±5 %, my measurement not a printed dim):
  track frame height incl. grousers **≈ 800–900 mm**; cab **≈ 1 900 mm long × 1 900 mm tall**;
  engine house **≈ 3 100 mm long × 1 500 mm tall** above the deck.

---


### The hammer's own proportions (this drives the whole carriage)

From `C:\Users\henri\Downloads\Junttan_Hammers_brochure_EN_2025_web.pdf`, "Technical Data"
spread (Classic Series HHK-A / HHK-S tables and X-Series SHK / HHX tables):

| Model | Ram block | Max energy | Stroke | Blow rate | **Hammer length\*** | Hammer weight\* | Drive caps |
|---|---|---|---|---|---|---|---|
| HHK3A | 3 000 kg | 35 kNm | 1 200 mm | 40-100 | 5 160 mm | 6 000 kg | 470x470 mm / d770 mm |
| HHK5A | 5 000 kg | 59 kNm | 1 200 mm | 40-100 | 5 900 mm | 8 400 kg | 470x470 / d770 |
| **HHK7A** (the hammer drawn on the PM 25H GA) | 7 000 kg | 82 kNm | 1 200 mm | 40-100 | **6 640 mm** | 11 000 kg | 550x550 / d850 |
| HHK9A | 9 000 kg | 106 kNm | 1 200 mm | 40-100 | **7 380 mm** | 13 500 kg | 550x550 / d850 |
| SHK5 (X-series; PM25H "recommended type" is SHK110-5..-9) | 5 000 kg | 61 kNm | 1 200 mm | 50-140+ | 6 172 mm | 9 250 kg | 470x470 / d770 |
| SHK9 | 9 000 kg | 119 kNm | 1 200 mm | 50-140+ | 7 675 mm | 14 800 kg | 550x550 / d850 |

\* The brochure's own footnote: "Excluding cap and sleeve". Add the drive cap and pile sleeve and
a 9 t-ram hammer is **over 8 m long overall**.

**This is the proportion the game most needs to get right.** A 9 000 kg-ram hammer body is
**7.4 m long on a 26.5 m leader - 28 % of the leader height.** It is not a small block sliding up
a big mast; it is a long slender frame-plus-cylinder that occupies more than a quarter of the
leader. Modelled to scale, the hammer alone reads as a machine.

Ram stroke is **1 200 mm** across the Classic A-series and the X-series SHK line (1 500 mm on the
heavier S-series). That is the visible ram travel inside the hammer frame - the animation
amplitude. Blow rate 40-100/min (Classic) or 50-140+/min (X-series).

Drive cap face sizes are small and specific: **470x470 mm square** or **d770 mm round** for
3-5 t rams; **550x550 mm / d850 mm** for 7-9 t rams. Note these are *bigger* than the pile: a
350 mm precast pile goes into a 470 mm cap with a timber/plastic cushion around it.

## 4. Component inventory

*(in progress)*

## 5. Distinctive features (thumbnail silhouette)

*(in progress)*

## 6. Materials and paint

*(in progress)*

## 7. Photo references

*(in progress)*

## 8. NOT SOURCED

*(in progress)*

## 9. Domain-truth warnings vs the current game build

*(in progress)*

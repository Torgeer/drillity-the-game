# si-rig — Small site-investigation rig with SPT trip hammer

status: in progress (agent writing live; sections fill as sources are read)
subject: game rig id `si-rig`, built by `buildSIRig()` in `src/rig/rigFactory.js` (~line 6307)
scope: GEOMETRY and MATERIALS reference for modelling.

> **Naming rule (DOMAIN.md §10).** Every manufacturer and model designation below is here
> as a DIMENSIONAL SOURCE ONLY. Do not put any of these names, logos or model numbers on
> the model, on a decal, on a UI string or in a product name. Model the shapes; invent the
> badge. The current in-game name "Rynnval SI-30 Probeline" is correct practice — keep it.

---

## 0. The class problem, stated first

"Small site-investigation rig with an SPT trip hammer" is not one machine. The local
material contains **two distinct size classes**, and the game's `si-rig` is dimensioned
as the smaller one while being modelled with some of the larger one's furniture:

| | **Class A — restricted-access / window-sampler crawler** | **Class B — geotechnical SI crawler** |
|---|---|---|
| Mass | ~0.9–1.3 t | ~3.5–5 t |
| Width | 750–800 mm (fits a doorway) | 1,400–1,700 mm, **variable-width undercarriage** |
| Mast | ~2.4 m, folds flat forward | 4–6 m, on an articulated boom, 3,600 mm feed stroke |
| Power | detachable/skid power pack, ~15–20 kW | on-board diesel in an enclosure |
| Rod handling | handed up by the second man | still hand-fed, but from a rack, with a winch |
| Sourced example | Pagani TG 63-100 class (910 kg) `[P11]` | Comacchio GEO 305 `[C-16]` |

**The game's spec block is Class A** (790 mm, 1,250 kg, 2,857 mm work height). Every
figure below is labelled **[A]** or **[B]** so the modeller does not mix scales. Where the
game currently borrows Class B furniture onto a Class A frame, §9 says so.

---

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` | 1–3, 15, 16 (of 18) | **The single best source in the folder.** p.16 is a fully dimensioned two-view GA drawing (side + front) of a geotechnical SI crawler; p.15 is a method-vs-depth table; pp.1–3 are large colour photographs of the real machine. | **YES — primary** |
| `C:\Users\henri\Downloads\drillity-the-game\research\11-oem-anchor-geotech-hdd.md` | §A.4 (Comacchio), §A.14 (Pagani) | Already covers the OEM landscape: Comacchio GEO series naming, GEO 305 torque/feed/clamp figures, the GEO 305 method-vs-depth table, and the Pagani TG light-crawler mass/push data. Does **not** cover geometry. | YES |
| `C:\Users\henri\Downloads\drillity-the-game\research\16-site-archetypes.md` | §B.20, ~1880–1895 | Already covers the *job*: SPT + U100 + disturbed bulk sampling, tracked window sampler to 10 m, ground pressure ~170 g/cm². Does **not** cover geometry. | YES |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` | 6297–6480 | The current builder, read for comparison only. | YES (§9) |
| _(remaining candidate sources in progress)_ | | | |

---

## 2. What the machine IS

_(pending — written after the second and third source)_

---

## 3. Proportions

### [B] Geotechnical SI crawler — the ONLY fully dimensioned drawing in the folder
Source: `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` **p.16**, dimensioned GA, side and front
view, all figures in mm read directly off the drawing.

| Dimension | Value | Note |
|---|---|---|
| Overall height, mast erect | **6,200 mm** | mast vertical, head parked at top |
| Feed stroke | **3,600 mm** | labelled on the drawing as `FEED STROKE 3600` |
| Overall length | **3,840 mm** | mast foot at the very front to the rear overhang |
| Track dimension | **1,500 mm** | dimensioned across the track under the machine; reads as sprocket–idler centres / ground-contact length. The drawing does **not** label which — recorded as ambiguous, not resolved |
| Height over the body | **1,700 mm** | ground to the top of the engine enclosure / rear deck furniture |
| Track shoe width | **300 mm** | front view |
| Overall width | **1,400 – 1,700 mm** | a RANGE, because the undercarriage is **variable-width** — it retracts to tram and extends to work. Confirmed in the slide text: *"Variable width undercarriage available with steel tracks and rubber shoes"* |

**Ratios that matter more than the absolutes [B]:**
- height erect : length = 6,200 : 3,840 ≈ **1.61 : 1** — the machine is taller than it is long.
- feed stroke : overall height = 3,600 : 6,200 ≈ **0.58** — the mast is well over half the total height and the head travels most of it.
- width : length = 1,700 : 3,840 ≈ **0.44** — narrow for its length; it reads long and thin from above.
- shoe width : overall width = 300 : 1,700 ≈ **0.18**, so the two tracks alone are ~35 % of the plan width. Wide tracks, narrow body.
- body height : overall width ≈ 1,700 : 1,700 = **1 : 1** — the machine minus mast is roughly a cube on tracks.

### [A] Restricted-access crawler — mass and push, no drawing found
Source: `research/11-oem-anchor-geotech-hdd.md` §A.14, citing pagani-geotechnical.com and
mgs.co.uk.

| Model | Push | Extraction | Mass |
|---|---|---|---|
| TG 63-100 | 100 kN | 12 t | **910 kg** |
| TG 63-150 | 150 kN | 160 kN | — |
| TG 73-200 | 200 kN | 250 kN | **2,700 kg** |

`NOT SOURCED`: overall length, width, height, mast height and track gauge for the Class A
machine. **No dimensioned drawing of a sub-1.5 t SI crawler exists in this folder.** The
game's 790 / 2,729 / 1,460 / 2,857 mm figures could not be traced to any local file.

---

## 4. Component inventory

_(pending)_

---

## 5. Distinctive features
_(pending)_

## 6. Materials and paint
_(pending)_

## 7. Photo references
_(pending)_

## 8. NOT SOURCED
- Class A (sub-1.5 t) overall dimensions, mast height, track gauge — nothing in the folder.
- _(list grows as reading continues)_

## 9. Domain-truth warnings vs the current game build
_(pending)_

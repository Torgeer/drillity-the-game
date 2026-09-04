# rc-rig — Reverse-circulation exploration rig (cyclone + sample train)

status: in progress
subject: game rig id `rc-rig` (builder: `src/rig/rigFactory.js`, `buildRCRig`, ~line 4947)
scope: GEOMETRY and MATERIALS reference for modelling. Not a spec sheet, not a sales document.

> **Naming rule (DOMAIN.md §10).** Every manufacturer name and model designation below is
> here ONLY to say where a dimension came from. **None of it may appear on the model** — no
> badge, no decal text, no product name, no recognisable logo silhouette. Model the *shape*,
> invent the *brand*. Where I give a number, the source is named so the modeller can go and
> look at the same picture I did.

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `Downloads/Mineral Exploration Tooling - Catalog.pdf` | 21-24 text; **p.22 rendered at 150 dpi and looked at** | **The single best local source.** p.22 is a full-page studio three-quarter photograph of a crawler-mounted RC exploration rig (Epiroc *Explorac 235*), plus the only local depth rating for the class: *"designed specifically for reverse circulation drilling to depths of 300-400 meters… available for assembly on a truck or crawler chassis"* (p.22). p.21 is RC hammer / bit / dual-wall-pipe text. | **YES — primary** |
| `Downloads/Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf` | 1 page, **scanned, no text layer** — rendered at 150 dpi and read as an image | Trade product-directory page (*Australian Mining*, Jan 2011, journal p.19). Field photo of a **truck-mounted** RC-and-coring exploration rig standing in red dirt with the mast up; plus pullback / torque figures for two exploration rigs, and a supplier listing that names **boosters** as a normal RC-spread item. | **YES — secondary** |
| `Downloads/RC_Hammer_Catalogue.pdf` | 1-9, text (`pdftotext -layout`) | Rocksmith RC hammer / shroud / bit tables. **Tooling only — not one word about the rig.** Genuinely useful for `tools.js` (hammer OD and length, the shroud diameter ladder, bit face type), useless for rig geometry. Also badly typeset: the extractor shuffles headers against values, so cross-check any number taken from it. | Partly (tool only) |
| `Downloads/Mincon-Rotary-Product-Catalog-Condensed-Version.pdf` | 5 pp. | Rotary / tricone product range. **Not RC, no rig.** | **No** |
| `research/02-prospecting.md` | §A2, §E4 | Already the deepest RC write-up in the project: dual-wall pipe construction, air demand, the surface-train component order, sample mass and interval, depth and pace, and the 50-metre core-vs-RC identification test. Cites `[MIN-RC]` and `[BL-RC]` page by page. | **YES** |
| `research/16-site-archetypes.md` | §B.7 `rc`, §A.5, §A.8, source table | Site-level: what stands *around* the rig; splits 6.25-12.5 %; alumina-ceramic-lined cone splitter with a double 25 L drop box rated 3 000 cfm / 750 psi; calico bag size range; 2-3 kg per metre; and the hard rule that **an RC rig cannot be underground**. | **YES** |
| `research/12-oem-rock-tooling.md` | §C.6 | RC hole sizes across the wider family, **133-914 mm (5¼"-36")**; RC hammers do **not** use DTH bit shanks. | Partly |
| `research/10-oem-foundation.md`, `research/11-oem-anchor-geotech-hdd.md` | grep | Their "reverse circulation" hits are **RCD / pile-top foundation drilling** — a completely different machine (a bored-pile rig with an airlift). **False friends. Do not let them contaminate this model.** | **No** |
| `src/rig/rigFactory.js` | `buildRCRig`, ~4938-5210 | The current builder, read for the comparison in §9. | n/a |

## 2. What the machine IS

A **reverse-circulation exploration and grade-control drill**: a self-propelled crawler
(or truck-deck) rig whose entire purpose is to punch **90-146 mm holes to 300-400 m**
quickly and deliver **dry rock chips** to surface up the *inside* of a dual-wall pipe. The
rock is broken by a **down-the-hole hammer at the bottom of the string**, not by the rig,
so the machine on the surface is essentially a **feed frame, a rotary head and a rod
handler** — it supplies rotation, hold-back and thrust, and it has nowhere near the torque
or the mud plumbing of a foundation or a core rig. Air goes **down the annulus** between
the two pipe walls, crosses at the bit, and the cuttings come **up the centre tube**, sealed
from the hole wall the whole way (`research/02` §A2). That is the whole trick, and it is why
the rig is only half the spread: an RC hammer wants roughly **25.5 m³/min at 24.1 bar
(900 cfm @ 350 psi)** (`research/02` §A2, citing `[MIN-RC]` pp.8-9), which is a
trailer-or-truck-mounted primary compressor standing alongside, plus frequently a
**booster** for deep or wet holes. It works standing on **four vertical jacks with the tracks
lifted clear**, on a cleared exploration pad or an open-pit bench, and it is drilled from the
**front** of the machine, off the end of the deck. The site is **dusty, not wet** — the
50-metre test against a core rig (`research/02` §E4) is exactly this: cyclone and bag rack
hanging off it, a fat hose looping from the head down to the cyclone, and a compressor the
size of a shipping container parked alongside. **It is never underground** (`research/16`
§B.7 — the dust load and the sample train do not fit in a 5 m drive).

## 3. Proportions

### 3a. What is actually sourced

| Quantity | Value | Source |
|---|---|---|
| Depth rating (the size of machine this is) | **300-400 m** for RC | `Mineral Exploration Tooling - Catalog.pdf` **p.22** |
| Chassis | *"available for assembly on a **truck or crawler chassis**"* — the same drill module goes on either | same, p.22 |
| Rotary-head load rating | **30-40 tonnes** radial + axial, head swings **±90° from vertical for fan drilling** | `Mincon-RC-Solutions-2025-A4-WEB.pdf` **p.13** (DQ8000 MK3) |
| Pullback, comparable exploration rigs | **21.5 t** (truck-mounted RC-and-coring rig) and **132 kN ≈ 13.5 t** with **5 456 Nm** rotation (heli-portable modular surface exploration rig) | `Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf` p.1 (journal p.19) |
| Heaviest single module of a heli-transportable rig of this family | **680 kg** | same |
| Drill pipe on the rack | dual-wall, **3½", 4" and 4½" OD**, in **1.5 m, 3 m and 6 m** lengths | `research/02` §A2 citing `[BL-RC]` p.6 |
| Hole size | **90 mm and 124 mm** standard; **86-165 mm** across the bit range; RC family overall 133-914 mm | `RC_Hammer_Catalogue.pdf` pp.1-9; `research/12` §C.6 |
| Hammer at the bottom of that string | OD **82-132 mm**, length **1 063-1 363 mm** without bit, **27-87 kg** | `research/02` §A2 citing `[MIN-RC]` pp.8-9 |
| Hammer (second source, same class) | OD **81-122 mm**, length without bit **1 142-1 279 mm**; shroud OD ladder **84.1-200 mm** | `RC_Hammer_Catalogue.pdf` pp.1-9 |

### 3b. Ratios measured off the photograph

I measured the silhouette of the rig on `Mineral Exploration Tooling - Catalog.pdf` **p.22**
by rendering the page at 300 dpi and taking the extent of non-white pixels row by row.
**Caveat, stated plainly: this is a three-quarter studio view, so anything running
front-to-back is foreshortened.** Ratios in the *vertical* plane are trustworthy; ratios
mixing vertical and depth are indicative only. No absolute dimension is published on that
page, so **all absolutes below are NOT SOURCED** (§8) — these are shape ratios, which is
what the brief says matters more anyway.

| Measured (300 dpi pixels) | Value | Ratio |
|---|---|---|
| Mast crown (top sheave bracket) to jack feet | 2 219 px | **1.00** (reference) |
| Mast crown down to deck level | 1 380 px | **0.62 of standing height** |
| Deck level down to ground | 839 px | **0.38 of standing height** |
| Mast length along its own axis (crown to mast foot) | ≈2 084 px | **0.94 of standing height** |
| Mast rake in this frame, from vertical | ≈**19°** | leaning back over the deck |
| Overall silhouette width (3/4 view, jack pad to jack pad incl. mast overhang) | 1 622 px | **0.73 of standing height** |
| Mast structural width (side face, mid-mast) | ≈250 px | **0.11 of standing height** — i.e. the mast is roughly **8-9× longer than it is wide** |
| Rod-handling arm at full reach, beyond the mast | out to 2 007 px at dy 900 | reaches **~0.55 of standing height** sideways from the mast |

**The two numbers a modeller should actually hold on to:**
1. **Mast above deck : deck to ground = 1.64 : 1.** The mast dominates; the carrier is a
   little more than a third of the standing height.
2. **Mast slenderness ≈ 8.5 : 1.** It is a long, thin, open truss — not a stubby beam.


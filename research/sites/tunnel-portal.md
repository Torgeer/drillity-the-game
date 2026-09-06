# Tunnel portal — Blender site reference

Source and evidence record for `blender/sites/tunnel_portal.py` →
`public/models/sites/tunnel-portal.glb`. Researched and built 2026-09-06.

Read alongside `research/16-site-archetypes.md` §A.9 (the archetype) and §A.3
(slope and anchor sites), `research/04-tunnelling.md` §A1 and §A4 (drill and
blast, ground support and pre-support), `blender/lib/site.py` (THE BUDGET, the
axes, the material contract) and `research/sites/urban-plot.md` (the format
this file follows).

This is a **fictional place**, not a reconstruction of any real portal. Its
engineering elements are drawn to published values; its layout, scale on the
hillside, colours and small detailing are explicitly **NOT SOURCED** and are
listed as such below. No manufacturer name, model designation or real project
name is exported into the scene (`DOMAIN.md` §10).

---

## 1. What makes this unmistakably a PORTAL and not an underground heading

`research/16` §A.9: *"This is the only surface site where an underground
machine legitimately stands in daylight."* That is the archetype's reason to
exist and it is also the trap — a portal built carelessly is an underground
heading with a light on. `blender/sites/underground_drive.py` is being authored
in parallel and the two must not be confusable.

Seven distinctions, each of them geometry in the file rather than a claim:

| # | In `tunnel-portal.glb` | Can an underground drive have it? |
|---|---|---|
| 1 | **The darkness is a bounded object, not the environment.** A 16 m bore whose seven ring frames run 0x2A2E33 → 0x040507 with a plug behind, sitting inside a sunlit surface next to a collar at 0xB6B2A8 — about **20:1 in value across one visible boundary**. | No. Underground the dark *is* the camera's environment; there is no lit surface to be dark against. |
| 2 | **A supported approach cut**: a near-vertical nailed and shotcreted wall (39 nail heads in columns, 3 rows), geocomposite drain strips between the columns, weepholes along the base, a catch ditch and bund at the toe, blasted rock stepping back above it. | No. A cut face is a surface made safe against **weather and falling**. Nothing in a tunnel is battered back to daylight or drained to a ditch. |
| 3 | **22 canopy pipe collars protruding from the crown**, fanned outward at 5°. FHWA-NHI-10-034 §9.5.5.2 uses the word: the collar is *"tied in with the protruding pre-support elements."* | No. Inside the drive you are **behind** the array; the collars are on the far side of the face. |
| 4 | ITA-AITES WG19 §7.4 makes the heavy version of the same object **portal-only**: the pipe roof method *"can only be carried out at the tunnel portal or at the shaft."* | No, by definition in the source. |
| 5 | **A rockfall drape over the crest**, pinned by plate anchors, hanging off the blasted rock above the nailed wall. | No. Nothing underground is netted against the sky. |
| 6 | **Zero light mounts.** No `mount:` node in this file carries `cone_deg` or `range_m` — the two keys `src/core/env.js` reads to make a node a lamp. A portal apron works in daylight and §A.9 asks for no lighting on one. | See the corrected comparison below — this one does **not** separate the two files, and an earlier draft of this row claimed it did. |
| 7 | **A collar with wing walls** — a threshold structure that holds ground back *beside* a mouth. USACE EM 1110-2-2901 §7-4.a(2) puts the steel sets in the same place: *"Steel sets are most often used as ground support near tunnel portals and at intersections."* | No. There is no "beside the mouth" 200 m in. |

### The comparison, after actually reading the neighbour's file

An earlier draft of row 6 asserted that `underground-drive` "must publish
lamps". **`blender/sites/underground_drive.py` was then read rather than
assumed** (ASTRA §10: *"Do not take a sub-agent's report at face value… Check
the file yourself before acting on a claim about it"* — the same rule applies
to a claim about a neighbour), and it says something better:

> *"This module does **not** model the drive. It models what the crew left
> standing in it… `src/world/terrain.js` `buildDrive()` already sweeps a
> horseshoe shell down `driveGroup`… So the honest question for a `.glb` here
> is not 'what does a drive look like', which is answered, but **'what is in a
> working drive that a swept shell and a shader cannot be?'**"*

It carries staged ground-support consumables, power and markers on **four**
materials — `rawSteel`, `paintedDark`, `rubber`, `safetyStripe` — publishes one
anchor, and publishes no lamps either (because `env.js` owns every light in the
game). So the lamp test does not separate the two files. What does:

| | `tunnel-portal.glb` | `underground-drive.glb` |
|---|---|---|
| subject | the threshold: an aperture, its collar, its pre-support and the exterior cut around it | the crew's material staged along a rib inside a shell it does not model |
| materials | blastedRock, shotcrete, **mesh**, **galvanised**, rawSteel, paintedDark | rawSteel, paintedDark, rubber, safetyStripe |
| shared materials | **two of six** | two of four |
| objects in common | **none** | none |

**Four of this file's six materials appear in neither of theirs**, and the two
models share no object. That is measurable off the two exports with
`node tools/glbinfo.mjs` and needs nobody's judgement.

**The one-line test for the reviewer:** this file has a sky-lit exterior
surface, a battered and drained cut, protruding pre-support and a bounded dark
aperture. If `underground-drive` ever grows any of those four, the pair has
failed.

---

## 2. Sources

Everything below was read from the actual document. Rows marked **READ HERE**
were opened and quoted by this module's author rather than taken on a
sub-agent's report (ASTRA §10: *"Do not take a sub-agent's report at face
value… Check the file yourself before acting on a claim about it."*). The rest
were read by a dedicated research agent from the primary PDFs.

| Key | Source | URL |
|---|---|---|
| `[DP-RANGER]` **READ HERE** | Douglas Partners, *Ranger Uranium Decline* | https://www.douglaspartners.com.au/project/ranger-uranium-decline/ |
| `[CALTRANS-SN]` **READ HERE** | Caltrans Geotechnical Manual, *Soil Nail Walls*, January 2021 | https://dot.ca.gov/-/media/dot-media/programs/engineering/documents/geotechnical-services/202101-gm-soilnailwalls-a11y.pdf |
| `[FHWA-CTIP]` **READ HERE** | FHWA, *Context Sensitive Rock Slope Design Solutions*, ch. 3.6 | https://www.fhwa.dot.gov/clas/ctip/context_sensitive_rock_slope_design/ch_3_6.aspx |
| `[UMB]` **READ HERE** | Canopy-tube supplier pages (diameter and length only — see §5) | https://tunnelsupports.com/canopy-tube-system/ · https://www.jennmar.com/products/umbrella-tubes |
| `[FHWA-GEC7]` | FHWA GEC No. 7, *Soil Nail Walls*, FHWA-NHI-14-007 (2015) | https://www.fhwa.dot.gov/engineering/geotech/pubs/nhi14007.pdf |
| `[FHWA-TUNNEL]` | FHWA-NHI-10-034, *Technical Manual for Design and Construction of Road Tunnels — Civil Elements* (the PDF is internally labelled FHWA-NHI-09-010, March 2009) | https://www.fhwa.dot.gov/bridge/tunnel/pubs/nhi09010/tunnel_manual.pdf |
| `[ITA-WG19]` | ITA-AITES WG19, *Guidelines for the Design and Construction of Conventional Tunnelling in Urban Setting* (2026) | https://about.ita-aites.org/publications/wg-publications/download/2134_59f20b585c12929b483395fffa35c7a1 |
| `[OKE-2016]` | Oke, *Determination of Nomenclature and Support Design of Umbrella Arch Systems*, PhD thesis, Queen's University | https://queensu.scholaris.ca/server/api/core/bitstreams/89f6193b-4a9d-4139-9584-a6d604099d10/content |
| `[USACE-EM]` | USACE EM 1110-2-2901, *Tunnels and Shafts in Rock* (30 May 1997). The official host returns 403 to automated clients; this TU Graz copy carries the document ID and date in its page headers. | https://www.tugraz.at/fileadmin/user_upload/Institute/IAG/Files/31_Tunnels_and_Shafts_in_Rock-USACE.pdf |
| `[HOEK-RMR]` | Hoek, *Practical Rock Engineering* ch. 3, Table 5 (Bieniawski 1989 RMR support) | https://www.rocscience.com/assets/resources/learning/hoek/Practical-Rock-Engineering-Chapter-3-Rock-Mass-Classification.pdf |
| `[NFF14]` | Norwegian Tunnelling Society Publication 14 | https://nff.no/wp-content/uploads/sites/2/2020/04/Publication-14.pdf |
| `[NFF19]` | NTS Publication 19, *Rock Support in Norwegian Tunnelling* | https://nff.no/wp-content/uploads/sites/2/2020/04/Publication-19.pdf |
| `[NFF23]` | NTS Publication 23, *Norwegian Tunnelling Technology* | https://nff.no/wp-content/uploads/sites/2/2020/04/Publication-23.pdf |
| `[NTNU-BD]` | NTNU Project Report 2A-05, *Drill and Blast Tunnelling — Blast Design* | https://www.researchgate.net/publication/381523474 |
| `[SANDVIK-AT]` `[DSI-AT]` `[SINOROCK]` | Pipe-umbrella systems in *"tunnel drives, portals and re-excavation of collapsed sections"*, installed with *"a conventional drill jumbo"* | https://www.rocktechnology.sandvik/en/products/equipment/underground-drill-rigs/at-pipe-umbrella-system/ · https://www.dsiunderground.com.au/products/tunneling/pre-support/at-pipe-umbrella-system/at-pipe-umbrella-system · https://www.sinorockco.com/news/industry-news/tunnel-pre-support-methods-techniques-applications-and-comparisons.html |
| `[GEOSTAB-NAIL]` | A real soil-nail and rock-anchor slope job | https://www.geostabilization.com/project-gallery/slope-repair-using-a-soil-nail-wall/ |
| `[DARDA-PORTAL]` `[ACG-DUNN]` | Civil and mine portal structures | https://www.darda.de/en/knowledge/tunnel-portal · https://papers.acg.uwa.edu.au/p/2325_16_Dunn/ |
| `[HSE-L118]` | UK HSE, Quarries Regulations 1999 ACoP L118 | https://www.hse.gov.uk/PUBNS/priced/l118.pdf |

Manufacturer and project names appear **only** in this table and in code
comments. Nothing exported carries one.

---

## 3. Every sourced dimension in the module

### The drive's cross-section

| Constant | Value | Source |
|---|---|---|
| `DRIVE_W`, `DRIVE_H` | 5.5 × 6.0 m | `[DP-RANGER]`: *"The decline was 2220m long, 6m high by 5.5m wide."* |
| `LOOKOUT` | 0.25 m | `[NTNU-BD]` via `research/04` §A1: look-out ≤ 10 cm + 3 cm per metre of hole depth, on `[NFF14]` §7.4's 4.5–5.0 m round. Corroborated twice: `[USACE-EM]` §5-2.c(3)(c) — perimeter holes diverge *"up to about 100 mm"* at the collar — and `[NFF23]` — collaring offset 10–15 cm, hole-bottom eccentricity 30–40 cm. |
| `EXC_W`, `EXC_H` | 6.00 × 6.25 m | **Derived**: theoretical + look-out. |
| `CROWN_R`, `SPRING_Z` | 3.00 m, 3.25 m | **Geometric**, not sourced and not guessed: a horseshoe whose crown is a semicircle of radius = half its width has its springline at height − radius. `[DP-RANGER]` names a springline for this section without giving its level. |
| `ROUND_LEN` | 5.3 m | `[NFF23]`: Norwegian standard drilling length. |

*Corroboration that this is a real drill-and-blast section:* `[USACE-EM]`
Figure 5-17 dimensions a D&B horseshoe with a crown **excavation-line radius of
12 ft (3.66 m)**; `[ITA-WG19]` case studies run from a 6.7 m metro bore to a
20.7 × 12.5 m road tunnel. 5.5 × 6.0 m sits at the small end, which is right
for a decline driven by this game's machines.

*Declared simplification:* a real D&B horseshoe has **curved sidewalls on a
larger radius than the crown** — `[USACE-EM]` Fig. 5-17 has a 12 ft crown
against a 21 ft sidewall. This model draws them straight. At 28 m the
difference is under 60 mm of bulge, about a quarter of a pixel.

### Pre-support — the pipe umbrella

| Constant | Value | Source |
|---|---|---|
| `PIPE_D` | 114.3 mm | `[FHWA-TUNNEL]` §9.5.4.1 p.9-38: *"a diameter of between 4.5 inch and 6 inch (114 mm to 150 mm)"*. `[UMB]` **read here**: *"the industry standard of 114.3 mm"*. `[ITA-WG19]` §7.3: 110–120 mm. `[OKE-2016]` §4.3.2.2: 60–168.3 mm. |
| `PIPE_WALL` | 6.3 mm | `[OKE-2016]` as-built (Trojane, Slovenia: 114.3 × 6.3 mm). Inside `[NFF19]` §4.3.2's 5–7 mm for Ø75–120 mm pipe screens and `[OKE-2016]`'s 5–10 mm. |
| `PIPE_L` | 15.0 m | `[FHWA-TUNNEL]` §9.5.4.1: *"lengths typically not to exceed 15 to 24 meters"*. `[ITA-WG19]` §7.3: 12–15 m. `[UMB]` **read here**: *"Up to 18 meters."* |
| `PIPE_PITCH` | 0.42 m | **`[OKE-2016]` §7.4 p.216, the Birgl Tunnel WEST PORTAL as built: 29–31 pipes, 114 mm OD × 6.3 mm, 2.5° look-out, 40–50 cm centres.** The only canopy geometry found anywhere that was measured *at a portal*, which is exactly the case modelled. Inside `[OKE-2016]`'s general 300–600 mm band. `[FHWA-TUNNEL]` gives *"typically spaced at 12-inch (0.30 m) centers"* for the general case; the portal figure is deliberately preferred. |
| `PIPE_ANGLE` | 5° | `[OKE-2016]` §4.3.2.2: forepole look-out 3–8°, typical installation 3–7°, and beyond ~15° *"the pipe behaves as a rockbolt, not a forepole"*. The Birgl portal itself was 2.5°. |
| arc | 180°, springline to springline | `[DP-RANGER]`: *"installed from springline to springline"*. Independently `[OKE-2016]` §5.4 p.108: ~120° coverage for gravity-driven failure and **180° for subsidence-driven**, which is the portal case. Two sources, one number. |
| `PRESUPPORT_OFF` | 200 mm | `[DP-RANGER]`: *"200mm outside the excavated profile"*. **Inference, marked in the code:** the Ranger figure is for a 24 mm bar array and is used here for a 114.3 mm pipe array. The arc carries across cleanly; the offset is tighter for a pipe and is used only because no pipe-specific offset was sourced. |

### The blasted contour

| Constant | Value | Source |
|---|---|---|
| `CONTOUR_PITCH` | 0.70 m | `[NFF14]` §7.4: *"Maximum contour hole spacing 0.7 m"*. `[NFF23]`: contour spacing set by the client in tender at 60–90 cm; NPRA Process Code 32 general contour c/c 0.7 m. |
| `CONTOUR_HOLE_D` | 48 mm | `[USACE-EM]` §5-2.c(3)(e): *"Blastholes are typically 45 to 51 mm (1.9-2 in.) in diameter."* `[NFF23]`: 48–51 mm most common in Norway. |
| `HALF_CAST` | 0.65 | `[USACE-EM]` §5-2.d(5): *"a half-cast factor of 50 to 80 percent can usually be achieved."* **Only 65 % of the contour holes are drawn.** A ring with every barrel present would be a claim of 100 %, which the source says does not happen. `S.rnd` picks which, so a rebuild produces the same gaps. |
| bore sawtooth | steps on `ROUND_LEN` | `[USACE-EM]` §5-2.c(3)(c): *"Successive blasts result in a tunnel wall surface shaped in a zigzag. Therefore, overbreak is generally unavoidable."* |

**Why the cut face carries no drilled-hole rhythm.** The 0.7 m figure is a
*tunnel contour* specification and is quoted where it literally applies.
`[FHWA-CTIP]` (read here) gives the surface equivalents — presplit *"10 to 12
times the borehole diameter"*, smooth blasting *"about 14 to 20 times the hole
diameter, which means that holes are approximately 0.7 to 1.5 m apart"* — but
those need a surface hole diameter this model has no source for. So the surface
cut gets the sourced *treatment* (nails, mesh, shotcrete, drape) and no
borrowed hole spacing.

### The nailed, shotcreted, drained wall

Every value here is `[CALTRANS-SN]` §7's recommended starting configuration,
**read first-hand** with PyMuPDF (ASTRA §4.6), or `[FHWA-GEC7]`'s worked design.

| Constant | Value | Quotation |
|---|---|---|
| `NAIL_PITCH` | 1.524 m (5 ft) | `[CALTRANS-SN]` §7: *"Soil Nail Spacing: 5 feet for both horizontal and vertical spacing; with columnar layout to facilitate the placement of geocomposite drains."* `[FHWA-GEC7]` §6.3.3b: 4–6 ft, *"routinely selected at 5 ft"*. |
| layout | **columnar, not staggered** | Same sentence. An earlier draft staggered the grid on the aesthetic instinct that *"a square grid on a face reads as wallpaper"*. It is square, the source says why, and the drains that go in the gaps are the reason. |
| `NAIL_EDGE_OFF` | 0.762 m (2.5 ft) | `[CALTRANS-SN]` §7: *"1st Soil Nail Row: 2.5 feet from the top of excavated face"*, and §9: 2.5 ft from the bottom and from the ends of the wall. |
| `NAIL_ANGLE` | 15° below horizontal | `[CALTRANS-SN]` §7: *"Soil Nail Inclination: 10° to 15° from horizontal."* `[FHWA-GEC7]` §6.3.3c: 10–20°, *"most commonly at 15 degrees"*. |
| `NAIL_HOLE_D` | 152 mm (6 in) | `[CALTRANS-SN]` §7: *"Drilled-hole Diameter: 6 inches … drilled-hole diameter greater than 6 inches is rare."* |
| `NAIL_BAR_D` | 25.4 mm | `[CALTRANS-SN]` §7: *"Use No. 8 and Grade 75 bar"* — a #8 bar is 1 in nominal. |
| `NAIL_PLATE` | 229 mm sq × 25 mm | `[FHWA-GEC7]` §3.2.2: plates are *"usually square and flat, with 8- to 10-in. side dimensions and typical thicknesses of 0.75 to 1 in."*; the Appendix C worked design uses 9 in × 1 in. |
| `FACING_T` | 102 mm (4 in) | `[FHWA-GEC7]` §3.3.6a: *"The initial facing … with a thickness most commonly between 3 in. and 4 in."* |
| `WALL_BATTER` | 1(H):12(V) | `[CALTRANS-SN]` §7 verbatim. |
| lift height | = `NAIL_PITCH` | `[FHWA-GEC7]` §2.1: the excavation lift height is the vertical nail spacing, 3–5 ft. The four construction joints in the model are real. |
| `MESH` | 6×6 – W2.9 (152 mm openings, 4.88 mm wire) | `[FHWA-GEC7]` Appendix C worked design. The wire diameter is derived from the W-number, which is the area in hundredths of a square inch. `[NFF19]` §5's tunnel mesh is 150 × 150 mm / 5 mm wire — the same thing to within 2 mm, from another continent. |
| `DRAIN_W`, `DRAIN_PITCH` | 0.305 m at 1.524 m | `[FHWA-GEC7]` §6.9.3a and Figure 6.1, which labels the geocomposite strip *"0.30 M (TYP)"*; spacing 1.0–2.0 × S_H and *"most commonly"* = S_H, centred **between the nail columns**. |
| `WEEP_D`, `WEEP_PITCH` | 76 mm at 2.74 m | `[FHWA-GEC7]` §6.9.3a: weepholes 2–4 in diameter at 8–10 ft centres along the wall base. The manual is explicit that these are judgement values (*"no specific calculations are performed"*), which is worth knowing and does not make them less real. |
| `TREATED_Z` | 4.572 m (15 ft) | **Composition, but constrained rather than picked**: it is a height at which the Caltrans row rule closes exactly — 2.5 ft up, 5 ft between rows, 2.5 ft down, three rows, no remainder. It was 20 ft / four rows until the offline render showed the wall crowding the arch crown and leaving no room for rock or sky above it. |
| galvanised heads | — | `[NFF14]` §6.2: hot-dip galvanising is the general corrosion standard for bolts, which is why the heads carry `galvanised` and not `rawSteel`. |
| the look of it | — | `[GEOSTAB-NAIL]`, on a real job: *"a grid of galvanised mesh pinned by a regular pattern of small steel plates and nuts, grout stains bleeding downslope from each head, drainboard strips running to a few collection points."* Every clause is an object in the model. |

### The collar and the ribs

| Constant | Value | Source |
|---|---|---|
| collar arc and material | one sidewall to the other, reinforced shotcrete | `[FHWA-TUNNEL]` §9.5.5.2 pp.9-41/42: *"a reinforced shotcrete collar should be installed that is tied in with the protruding pre-support elements. The collar shall follow the tunnel perimeter extending from one sidewall to the other."* |
| `RIB_SECTION` | 0.200 m | `[ITA-WG19]` p.68: **HEB 200** arches in a 250 mm shotcrete preliminary lining, **at the portal zone** of a road tunnel. HEB 200 is a standard rolled-section designation, not a maker's model. |
| `RIB_SPACING` | 1.5 m | `[HOEK-RMR]` Table 5, RMR 21–40: *"Light to medium ribs spaced 1.5 m where required."* **Cite Hoek, not FHWA:** FHWA reprints this table as Table 6-9 and its printing drops the 0.75 m from the row below. |
| `LINING_T` | 0.250 m | `[ITA-WG19]` p.68, same case study. |
| ribs belong at a portal | — | `[USACE-EM]` §7-4.a(2): *"Steel sets are most often used as ground support near tunnel portals and at intersections, for TBM starter tunnels, and in poor ground in blasted tunnels."* |
| `SHOTCRETE_MIN` | 60 mm | `[NFF14]` §6.3.1: the Norwegian road-tunnel minimum since the durability study. Carried for reference; the drawn facing thickness is `[FHWA-GEC7]`'s 4 in. |

**Steel sets rather than lattice girders, and the rule decided it.**
`[DP-RANGER]` actually used *"6, 4-bar Pantex lattice girders encased in
fibrecrete"* and `[NFF19]` §4.5.3 describes the family — but `[FHWA-TUNNEL]`
§9.5.3 **explicitly defers the girder section to the contract documents**, and
no bar diameter or girder height could be sourced from FHWA, USACE, ITA or NFF.
A lattice girder here would have to be drawn at an invented section. A steel
set can be drawn at a section a published portal actually used. ASTRA §1.1 is
what chose the geometry, which is the point of having the rule.

---

## 4. Explicitly NOT SOURCED — authored composition

Every one of these is marked again at its constant in the module. **None may be
quoted back as a portal fact.**

- **Where the portal stands and how big the cut is.** `D_PORTAL` 28.0 m,
  `A_PORTAL` +4.6 m, `CUT_FROM` −8.4, `CUT_TO` +19.0, `CUT_CREST_Z` 11.0 m,
  `ROCK_BATTER` 0.42 (above the nailed wall only), `COL_PITCH` 2.2 m and the
  crest jitter. There is no standard portal position or cut height — they are
  set by the hillside — so each is solved against the measured hero camera with
  `height_at_ndc()` and labelled a composition decision.
- **Portal headwall thickness — and this one is a finding, not an omission.**
  Four standards were searched (`[FHWA-TUNNEL]`, `[ITA-WG19]`, `[USACE-EM]`,
  the NFF publications) and **none gives a portal headwall thickness**, because
  the modern portal is a shotcrete **collar** plus a canopy rather than a
  masonry headwall. So the model builds the collar the sources describe and
  does not build a headwall whose dimension it would have to invent.
- **Lattice girder bar sizes** — see above; `[FHWA-TUNNEL]` §9.5.3 defers them.
- **Collar radial depth (1.25 m) and face thickness (1.00 m)**, wing-wall rake,
  length and section.
- **Bore depth (16 m), ring pitch, ring thickness and every tint in the value
  ladder.** The depth is solved against the sightline: the eye enters the mouth
  9.3° off the tunnel axis, so it crosses the 3.0 m half-width after 18.3 m; at
  16 m the plug is still in view down the bore, so the eye reaches black rather
  than a lit side wall.
- **Canopy stick-out (0.80 m).** Only the collar end is modelled — the other
  fourteen metres are grouted into ground nobody can see.
- **Catch-ditch section and setback, muck spill and stockpile size, the haulage
  gap in the ditch, the drape's stand-off and pin positions.**
- **The whole palette.**

### What could not be sourced at all

1. **Portal headwall thickness** (above).
2. **Lattice girder bar diameters and girder heights.**
3. **Portal ditch / cut-off drain cross-section.** `[DARDA-PORTAL]` names
   *"channels, swales, collector pipes and inspection shafts"* and dimensions
   none of them.
4. **Depth or profile of the residual half-barrel groove** in the rock — only
   its diameter and spacing are sourced.
5. **A canopy-array spacing, installation interval or overlap from `[UMB]`.**
   `research/04` §A4 attributes *"0.3–0.6 m spacing, installed every 8 m,
   minimum 4 m overlap"* to that key. Refetching the three `[UMB]` URLs on
   2026-09-06: **one no longer resolves**, and the two that do give only the
   diameter and the length. That band is therefore second-hand and the module
   does **not** lean on it; `PIPE_PITCH` uses `[OKE-2016]`'s portal measurement
   instead. `research/04` should carry this correction.
6. **Statens vegvesen N500:2022** — only the 2015 consultation draft was
   reachable, and NPRA Prosesskode R761 and NS 3420 are behind paywalls. None
   of their numbers is used in the module.
7. The session's web-search budget was exhausted mid-research, so **UK DMRB
   CD 358 was never checked**.

### One error this research caught, recorded because it is instructive

An earlier draft used **12°** for the canopy look-out, carried across from
`[NFF19]` §4.3.1's *"angle to the tunnel axis: 10–15 degrees"*. That figure is
for **rebar spiling**, and `[OKE-2016]` says a pipe beyond about 15° *"behaves
as a rockbolt, not a forepole"* — so the draft had a pipe array at the edge of
not working as a pipe array. It is now 5°, from the forepole-specific band.
**The number was sourced; it was just sourced to the wrong thing**, which is
the failure mode ASTRA §1.1 is actually about.

---

## 5. Measured — the exported asset

`node tools/glbinfo.mjs public/models/sites/tunnel-portal.glb`, the only
dimension tool in the tree (ASTRA §5):

```
glTF v2  1445.4 kB  extensions: none
PRIMITIVES 6  (= draw-call floor)   TRIANGLES 15956   nodes 10   images 0
materials: blastedRock, galvanised, mesh, paintedDark, rawSteel, shotcrete
mount:site-collar (scene root)
mount:site-cut-toe  extras={"treated_h":4.572}
mount:site-muck
mount:site-portal   extras={"opening_w":6,"opening_h":6.25,"spring_z":3.25,"bore_m":16}
static:blastedRock · static:galvanised · static:mesh
static:paintedDark · static:rawSteel · static:shotcrete   (1 prim each)
DIMENSIONS (m)  W 46.764 x H 9.050 x L 51.075
BOUNDS  x -41.527..5.238   y -1.000..8.050   z -49.925..1.150
```

Build log: `PORTAL_BUILD nearest=13.138 m (muck-stock-13) reserve=9.20 m
pipes=22 barrels=15 nails=39`, `SITE_OK materials=6 draws=6 budget=6`, and no
`SITE_COLLAR` line — nothing in this model enters the 0.36 m collar throat
above grade, which `quarry-bench` currently does breach.

- **6 draw calls, which is exactly the budget** in `blender/lib/site.py`, and
  `finish()` re-derived it off the joined scene rather than predicting it.
- **15,956 triangles** — about the same as `quarry-bench` (13,936) and well
  under `urban-plot` (29,576). Detail sharing a material is free in draw calls
  (ASTRA §3.4), and that is where the half-barrels, the canopy array, the nail
  heads and the broken rock silhouette were spent.
- **No images**, so nothing has opted out of the `assets.js` wear system.
- **No `transmission` anywhere.** There is no glazing in the file and no
  material carries a non-zero transmission weight.
- **Every mesh carries COLOR_0.** That is a cost decision, not decoration:
  `terrain.js` `siteMaterial()` keys its live materials on
  (kind, has-vertex-colour), so a site that mixed coloured and uncoloured
  meshes of one kind would pay **two** draw calls for it.
- **15 of 23 contour holes drawn** = 65 %, the sourced half-cast factor.
- **`y` reaches −1.000 m.** Deliberate, and it is one object: the plug behind
  the bore, 49 m from the collar, extends below grade so no light can leak
  under it. Nothing else is below −0.07 m. A reviewer running `glbinfo` should
  know that before treating it as a runaway array (ASTRA §5).
- **Nearest geometry is 13.14 m from the collar** (`muck-stock-13`), asserted
  on real vertices before the join against a 9.2 m reserve, and the build
  **names** the nearest object rather than only printing the margin. The live
  terrain, the collar spoil ring and the section seam are untouched: this file
  lays **no floor at all**.
- **`z` reaches −49.9 m and `x` −41.5 m** — that is the far corner of the
  22 m-deep massif behind the face, which exists to stop sky showing through
  the gaps between rock masses. It is never in frame and it is buried.

### The offline renders that were looked at, and what each one changed

`shots/blender-tunnel-portal-hero.png` and
`shots/blender-tunnel-portal-over.png`.

**Both are OFFLINE BLENDER RENDERS, not gameplay captures.** They re-import the
real exported `.glb` and render it with Cycles on the CPU; the sun, the ground
plane and the camera are inspection fixtures and are not in the file. The hero
camera sits on the measured hero eye, direction and vertical field (20.97°), so
what it frames is what the surface band frames — but the materials are the flat
exported vertex colours, **not** `assets.js`'s procedural surfaces, so these
renders grade **composition, silhouette and value** and say nothing about final
appearance. (One consequence worth naming: the `mesh` kind's alpha cutout is
generated at runtime, so the drape and the mesh strips render **solid** here
and will be see-through in the game.)

Five real faults came out of looking at them, and each one is recorded at the
constant it changed rather than quietly fixed:

| Render | What it showed | What changed |
|---|---|---|
| hero #1 | The arch dead centre and filling the frame | **My own preview was wrong.** It aimed the camera *at* the portal instead of along the measured hero direction. A preview that aims itself is a preview of nothing. |
| hero #2 | **No sky anywhere in the frame** | `CUT_CREST_Z` 11.0 → 7.7 m, portal 28 → 33 m. A portal with no sky reads as an underground heading — the one failure this file exists to avoid. |
| hero #2 | The collar's right edge against the band edge | `A_PORTAL` 4.6 → 3.9 m. |
| hero #2 | The cut face as **stacked cardboard cartons** — `site.py`'s own name for the failure, and it records that it was first diagnosed on the round-4 tunnel portal | Box columns → `site.rubble()` masses. Columns are right for a *blasted highwall* (they are the rock between the holes) and wrong for a weathered slope, which has no hole pitch in it. |
| hero #2 | The collar as a fan of separate paddles | The segment chord has to be scaled by the radius ratio — the pitch is measured at `CROWN_R` and the blocks sit at `CROWN_R + COLLAR_T/2`. Derived, not nudged. |
| hero #3 | Three flat drape slabs across the top, **taller than the crest** | The drape now hangs *below* the crest bar at half the stand-off in narrower panels. The rock makes the skyline, not the netting. |
| over #1 | The massif as a **stage flat** standing on the plain with its ends in shot | 7 m deep → 22 m. Twelve triangles. |
| over #1 | The catch ditch as a row of **paving slabs** | Two continuous runs plus crushed drainage stone. |

---

## 6. What terrain.js must do — cross-file, NOT edited here

This module owns `blender/sites/tunnel_portal.py`,
`public/models/sites/tunnel-portal.glb` and this file, and nothing else. The
following are requests to whoever owns `src/world/terrain.js`.

**A gallery of unused models is not completion — none of this is wired in yet.**

### 6.1 The archetype entry

`ARCHETYPES['tunnel-portal']` currently reads:

```js
'tunnel-portal': {
  kit: 'portal', plane: 'surface', groundKind: 'gravel', pad: 10.0, farAmp: 0.9,
  dress: { spruce: 0.5, birch: 0.4, rock: 0.8, stone: 0.9, grass: 0.4, scree: 1.0, scrub: 0.5, ice: 0.6 },
},
```

`blender/lib/site.py` `finish()` now prints the handshake itself and this build
gets the middle case:

```
SITE_TODO archetype=tunnel-portal exists but declares no `model`, so this .glb
is never fetched. terrain.js needs `model: 'tunnel-portal'`, a `replaces` list
of the scatters this model takes over, and `replacesKit: true|false` for its
buildSiteKit() branch.
```

Those three, plus the ground the model stands on:

```js
model: 'tunnel-portal',
replaces: ['outcrops', 'scree', 'stones'],
replacesKit: false,                 // see 6.2 — the boolean is not enough here
flatR: 44, flatFalloff: 72, padCrown: 0,
```

- **`flatR` / `flatFalloff`.** Everything the player can see sits within about
  40 m of the collar and assumes ground at z = 0 under all of it. Without a
  flat, `naturalHeight()` will push terrain through the apron, the ditch and
  the toe of the nailed wall. A large engineered flat is also the *correct*
  claim here rather than a fudge: §A.9 calls the apron *"a working platform
  **and** a haulage yard"*, and `[DP-RANGER]`'s portal was cut in a **34.5 m
  deep box cut**. (The model's bounds reach 65 m at one corner — that is the
  back of the buried massif, and it does not need flat ground.)
- **`padCrown: 0`.** The default crown raises ground by up to 0.28 m between
  r ≈ 8.5 and 16.8 m; the model's nearest geometry is at 10.08 m and would sit
  about 0.13 m into it. A haulage apron has no drill-pad bund.
- **`replaces`.** Honestly stated: **this is +3 net draw calls, not zero.** The
  model costs 6; the three instanced scatters it authors over (`outcrops`,
  `scree`, `stones` — its cut face, muckpile, ditch fill and side slope are the
  rock they were standing in for) give back 3. `quarry-bench` closed its gap
  because `pad: 0` let it drop a pad decal as well; `tunnel-portal` has
  `pad: 10.0` and has no equivalent to give. The remaining scatter names are
  `spruce-bark`, `birch-bark`, `birch-leaves`, `tufts`, `scrub`, `ice`, and
  dropping any of them costs the region its character. **This needs a decision
  and a warm measurement, not a guess from me.**

### 6.2 `replacesKit` is a boolean and this archetype needs half of one

`site.py`'s handshake asks for `replacesKit: true|false`. **Neither value is
right for `tunnel-portal` on its own, and that is a finding rather than a
complaint.**

- `replacesKit: true` stands the whole `kit === 'portal'` branch down — and
  with it the **batching plant, the ventilation fan and duct, the muck
  conveyor, the lamella settlement package and the tracked loader**. All five
  are §A.9's own inventory, §A.9 singles the water treatment out as *"a piece
  of plant almost nobody draws"*, and all five are **free in draw calls**
  because they merge into the vertex-coloured pool. Dropping them makes the
  site worse for nothing.
- `replacesKit: false` leaves the branch drawing **a second portal in a
  different place** — its own arch, headwall, wing walls, rock face and
  netting, at three.js (−16.46, −20.15) while the model's mouth is at
  (−7.05, −12.88).

So: **`replacesKit: false`, plus a partial stand-down inside the branch.** The
four blocks below are duplicates and must be skipped when `siteModelReady()`;
everything else in the branch stays.

### 6.2a The four procedural blocks that must give up the portal

`src/world/terrain.js` ~L3241–3500 draws a complete portal already. With the
model loaded, these blocks are **duplicates in a different place** and must be
skipped when `siteModelReady()`:

| Block | Why |
|---|---|
| `TUBE` rings and the plug | the model's bore replaces it |
| `THE HEADWALL` — jambs, wing walls, arch ring, string course, datum plate | the model's collar and wing walls replace it |
| `THE SOLID HILL BEHIND THE BLOCKS`, `THE BROKEN FACE`, the hillside above the crown | the model's massif, cut face and side slope replace them |
| `ROCKFALL NETTING` | the model's drape replaces it |

**Keep** the ventilation duct and fan, the muck conveyor, the batching plant,
the water-treatment package, the segment stacks, the spoil cones and the
tracked loader. Those are §A.9 inventory, they are free in draw calls in the
merged pool, and the model deliberately does not carry them.

### 6.3 The duct and the conveyor must move to the model's arch

The kept duct and conveyor are anchored to the procedural arch at
`FX = -0.633 * 26`, `FZ = -0.775 * 26` with `fy = atan2(0.633, 0.775)`. The
model's arch is elsewhere. In three.js coordinates:

| | procedural | **model** |
|---|---|---|
| arch centre | (−16.458, −20.150) | **(−7.052, −12.879)** |
| bearing `fy` | 0.6845 rad | **0.7381 rad** |
| opening W × H | 6.4 × 7.0 | **6.00 × 6.25** (`EXC_W`, `EXC_H`) |
| springline | — | **3.25 m** |

Those four numbers are published on `mount:site-portal` as `extras`
(`opening_w`, `opening_h`, `spring_z`, `bore_m`) precisely so terrain.js can
read them off the loaded model instead of hard-coding a second copy — ASTRA §5,
*"two tables describing one thing will drift"*. `mount:site-cut-toe` and
`mount:site-muck` are there for the same reason.

**But a published field with no consumer is this codebase's ninth known
declared-contract-with-no-consumer (ASTRA §9).** If terrain.js does not read
these extras, delete them rather than leave them.

---

## 7. Honest outstanding issues

1. **Not wired in. Not verified in the game. Not measured warm.** The model
   loads nowhere until §6.1 lands. Everything in §5 is a CPU measurement of the
   file, and `research/CRITIQUE.md`'s standing warning applies: visual
   correctness cannot be inferred from a successful export or a green exit
   code.
2. **+3 draw calls net, and the surface band is already over its ceiling of 80
   in eight of twenty-one method states.** §6.1 states the arithmetic; it needs
   an owner's decision and a warm headed capture, and I could not take one —
   the shared GPU lease is held elsewhere and my brief forbids headed Chrome.
3. **The sky margin is thin and it was hard-won.** The crest sits at NDC +0.75,
   so roughly the top eighth of the surface band is sky and the crest jitter is
   what breaks the skyline into it. Against `farAmp: 0.9` the region's own
   ridge draws into that same strip and may close it again. **One headed frame
   decides whether this archetype still reads as outdoors, and I could not take
   one.** If the ridge closes it, the fix is `CUT_CREST_Z`, not the ridge.
4. **The cut reads as a face, not as a trough.** A real approach cut has side
   slopes converging past the viewer on both sides. At this camera they cannot
   be shown: the frame is only ~21 m wide at the portal and narrows to ~7.6 m
   at the machine, so any side wall drawn forward of about 25 m is off-screen
   before it can converge. What is there instead is a short left-hand return
   that daylights as it comes forward. **This is a genuine limitation of the
   composition, not a modelling shortcut**, and it is the one place where the
   "supported approach cut" in the brief is served by its *treatment* rather
   than by its *plan*.
5. **The edge artefact is mitigated, not diagnosed.** `quarry_bench.py` records
   coloured speckle from site geometry in the outer ~6 % of the band width,
   cause unverified. This model keeps near geometry inboard of about NDC −0.86
   as a precaution. **It has not been reproduced here and nothing is claimed
   about it.**
6. **The `mesh` kind is alpha-tested** (`alphaTest: 0.45` in `assets.js`) and
   this is the first site .glb to use it — the drape and the lift-joint strips.
   Alpha test is not transmission and should stay in the opaque pass, but that
   is reasoning, not a measurement. **Worth one look in a headed frame.**
7. **The ribs are shown bare.** `[NFF19]` §4.5.3 says girders end up *"entirely
   embedded in sprayed concrete"*. Showing steel sets exposed is showing the
   drive between erecting the rib and spraying it — a real state, and the state
   a working portal is usually photographed in, but a **choice**, not a default.
8. **The sawtooth is drawn at one round's amplitude only.** `[USACE-EM]`
   describes overlapping cones from successive canopies stepping the crown out
   as well; that second, larger sawtooth is not modelled.
9. **`research/04` §A4 needs a correction.** Its `[UMB]` spacing/interval/
   overlap figures could not be reproduced from the surviving URLs (§4, item 5).
10. **The plug reaches 1.0 m below grade.** Deliberate and hidden at 49 m, but it
   is the reason the model's `y` bounds start below zero, and a reviewer running
   `glbinfo` should know that before treating it as a runaway array.

**Is this ready to wire in?** The asset is: it is on budget, on contract, on
the origin, measured, and it does not cover the collar, the machine or the
seam. The *integration* is not — §6.1 through §6.3 are real edits in a file
this module does not own, and until they land the game would draw two portals
in two different places.

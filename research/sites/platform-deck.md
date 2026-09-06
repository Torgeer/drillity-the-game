# Platform deck — Blender environment reference

Research and build record for `blender/sites/platform_deck.py`, which exports
`public/models/sites/platform-deck.glb`. Written 2026-09-06.

This is a **fictional fixed offshore steel-jacket production/drilling platform**.
It is not a reconstruction of any real installation and it carries no
manufacturer name, marque or model designation. Where a real published figure is
used, it is cited beside the constant in the module and repeated here. Where no
figure could be found, the module says `NOT SOURCED` at the point of use and so
does this document. **No structure rating, load capacity, engineered clearance
or duty is asserted anywhere in the model** — those are design outputs, and
inventing one would be exactly the offence ASTRA.md §1.1 exists to stop.

Read alongside `research/16-site-archetypes.md` §A.10 (the archetype),
§A.11 (what it must not be mistaken for), and `research/rigs/oil-derrick.md`
§3.8, §3.9, §4.11, §4.12, §5.1 and §6 (the structure, its furniture and its
coatings), which is where the Chakrabarti page citations below were transcribed.

---

## 1. What carries "FIXED", object by object

`marine-spread` is being authored in parallel as a **mobile** marine unit. If a
player cannot tell the two apart at a glance, both have failed. These are the
things in this model that a mobile unit **cannot have**, and every one of them
is in the export rather than in this document.

| what | why only a fixed structure can have it | source |
|---|---|---|
| **A jacket that continues down through the water and does not stop** — 8 battered legs, X-braced, running from the deck through the waterline to the next framing level below it | The jacket *"serves as a pile template and extends from the sea bed to a few feet above the water level"*. It is the foundation, not a hull | `[EP0147144]` via §A.10 |
| **No silhouette air gap.** The band between deck and sea is *full* of structure: cellar deck, jacket bay, conductors, caissons, boat landing | This is the published jack-up-vs-platform test. Jack-up: *"daylight — a 10.7 m air gap, then three or four bare legs going down into the water"*. Platform: *"structure all the way down … **No air gap.**"* | `oil-derrick.md` §5.1 |
| **A marine-growth line at a fixed elevation**, fattening every member below it | *"The API guideline recommends a 1.5 in. growth on members for depths from 0 to 150 ft below the surface"* — 38 mm, a structural input. **A thing that moves cannot have a growth line at one height on its legs.** | Chakrabarti p.138 |
| **A splash-zone band with a step in the steel** | *"Increasing leg and brace thickness at the wave splash zone by about 1/8 to 1/4 inch … is commonly used as additional corrosion allowance"* — the band is physically thicker, not just better painted | Chakrabarti pp.315, 329, 330 |
| **Sacrificial anodes in rows down the legs** | *"The submerged portions of the steel jackets are usually left uncoated and cathodic protection is provided"*; anodes are *"4-in. square, 3–6 ft long"*, welded on, and 3 % of jacket steel weight | Chakrabarti pp.342, 368 |
| **A boat landing at a fixed elevation, with three stacked stages, barge bumpers on truck tyres, and a swingrope over it** | *"located near the mean water surface with suitable depth and elevation to provide boat access at low and high tide levels"*; barge bumpers are *"generally fitted with truck tires or rubber fenders"*; a swingrope is *"positioned above the boat landing"* for personnel transfer. **A landing only works if the platform is the thing that stays still.** | Chakrabarti p.341; `[SWING]` |
| **Conductors on a slot grid, driven through guide frames built into the jacket** | Conductors are *"driven to ground"* like piles and transfer wave load *"to the upper horizontal jacket bracing levels through conductor guides"*. A mobile unit's well leaves through a **riser it disconnects from** | Chakrabarti p.341 |
| **Caissons and J-tubes clamped to the legs, piercing the surface** | The jacket appurtenance list: *"boat landings, barge bumpers, conductor bracing and guides, risers, clamps, grout and flooding lines, j-tubes, walkways, mud-mats"* | Chakrabarti p.342 |
| **Permanent topsides where the rig is a lodger** — separators, a compressor package, a process header on racks, an accommodation block, a cantilevered helideck, a pedestal crane, a flare boom on a long outrigger | *"This is the only rig type where the drilling package is a **tenant**"* | §A.10 |

### And what is deliberately absent

`oil-derrick.md` §5.1: *"no moonpool, no riser, no buoyancy modules, no heave
compensator, no anchor chains. Those five belong to the floating units, and any
one of them on a platform or jack-up is an error a driller spots instantly."*

The model additionally has **no mooring line, fairlead, windlass, thruster,
DP reference, spudcan, jacking house, leg standing above the deck, cantilever
or bulwark.** These are absences by construction, not by omission: the module
docstring names each one so that nobody adds it later thinking it is missing.

---

## 2. THE DATUM — and the history that makes it the riskiest decision here

    z = 0 IS THE TOP OF THE MAIN DECK PLATING.
    three.js y = 0. The collar. Identical to blender/oil_derrick.py.

`ASTRA.md` §7.5 records the failure this prevents. `oil_derrick.py` took
`FLOOR_Z` from a source reading *"drill floor height above **main deck**"* and
measured it from z = 0 — making z = 0 the main deck — and in the same file put
its substructure base pad, *"base pad **on the skid beam**"*, also at z = 0 —
making z = 0 the top of the skid beams. **Both cannot be true.** The game drops
the rig on terrain at y = 0, so the skid beams were buried and the derrick stood
1.090 m into the deck. It was resolved in favour of the sourced number: z = 0 is
the main deck, the beams stand on it, the substructure starts on top of them.

This module is the surface that machine stands on, so it must not re-open the
question. Three consequences, all enforced in `build()` over **real world-space
vertices** rather than bounding boxes:

1. **Everything structural is at z ≤ 0; everything walked on is at z ≥ 0.**
   Deck girders and beams have their tops at z = −0.03, clear of the live plate.
2. **The well hand-off is a single elevation, `WELL_HANDOFF_Z = −0.60`.**
   `oil_derrick.py`'s conductor stub, `tb('conductor', 0.330, 0.55, (0,0,-0.30))`,
   spans −0.575 … −0.025. This module's live conductor runs from −0.60 **down**.
   Neither may cross. The build refused an earlier version that did, at
   z = −0.600 exactly.
3. **Nothing may reach z ≥ −0.02 inside the deck plate's cut opening**
   (|x| ≤ 5.4, |y| ≤ 4.2), so the collar, the borehole and the surface/section
   seam stay live through the floor.

**Independent confirmation of the conductor size.** `oil_derrick.py` draws its
stub at 0.660 m OD. This module derives 26 in = 0.6604 m from Chakrabarti p.341
(*"generally 20 in. to 30 in. OD"*, worked deepwater case 26 in). **The two files
agree to 0.4 mm with no coordination between them**, which is the strongest
available evidence that both are reading the same reality.

**Proof.** `shots/platform-deck-hero.png` is an offline Blender render of this
export and the real `public/models/oil-derrick.glb` imported into one scene.
The derrick's skid beams sit **on** the deck plate. It is not sunk into it.

---

## 3. The structural module — every number and its page

All Chakrabarti page numbers are printed pages of *Handbook of Offshore
Engineering* Vol. I, Ch. 6, as transcribed in `research/rigs/oil-derrick.md` §3.8.

### The 40 ft module, and why the legs are where they are

> *"the skid beam spacing of a standard GoM platform drilling rig **dictates the
> deck leg spacing** for a drilling platform or module … Most GoM platform rigs
> supplied by drilling contractors would have **40 ft skid beam spacing**. …
> Therefore, **80 ft by 80 ft four legged and 120 ft by 80 ft eight-legged** GoM
> deck footprints are commonly encountered."* — p.312

| constant | value | source |
|---|---|---|
| `BAY` | 40 ft = **12.192 m** | p.312 |
| `CANTI` | BAY/2 = **6.096 m** — cantilevers *"most efficient … about one half the lengths of the deck spans"* | p.312 |
| deck legs | **8**, at x = ±6.096, ±18.288; y = ±6.096 — *"usually four to eight legs battered"* | p.20 |
| `DECK_X` × `DECK_Y` | 3 bays + 2 cantilevers × 1 bay + 2 cantilevers = **48.768 × 24.384 m** | derived from p.312 |
| `DECK_BEAM_PITCH` | 5 ft = **1.524 m**; *"deck beam spacing is generally dictated by the wellhead spacing"* | pp.317–318 |
| `CELLAR_Z` | −20 ft = **−6.096 m** | **DEDUCED, and the source says so** — §3.8 marks it *"deduced from the worked 45° truss diagonal (L′ = L/cos45 = 340 in over L = 240 in), **not stated**"* |
| `JACKET_TOP_Z` | **−8.0 m** — top jacket horizontal bracing sits *"15–20 ft = 4.6–6.1 m"* above MLLW, *"in common use in offshore practice"*; against the game's water at −14 that band is −9.4 … −7.9 | p.314 |
| `BAY_H` | = BAY = **12.192 m**; bay height 40–50 ft AND *"bay height ≈ bay width"* (worked example a = h = 45 ft). Puts the diagonals at ≈42°, inside the usable **27–45°** band (optimum ≈36°) | pp.45, 331, 332 |
| `BATTER` | **1 : 8** apparent, the worked GoM example; range across the book 1:8 to 1:15 | pp.307–308, 332 |
| `LEG_OD` (deck leg) | 48 in = **1.2192 m** — *"deck leg OD = pile OD"*, GoM piles 48 in (range 36–72) | pp.306–332 |
| `JLEG_OD` (jacket leg) | 54 in = **1.3716 m** — *"legs 54 in. OD × 1.0 in."*, and *"jacket leg ID = pile OD + 3–4 in."* so the pile runs down inside it. **That step at the jacket top is modelled.** | pp.306–332 |
| `BRACE_OD` | 20 in = **0.508 m** — **DERIVED, not printed**: the sizing *rule* is sourced (*"brace:chord OD ratio β > 0.30"*, D/t 19–90), 0.508/1.3716 = 0.37. The member schedule is not in the source | pp.329–330 |
| bracing pattern | **X**. *"K-brace is popular in Gulf of Mexico"*; *"V + X is in common use in most offshore locations"*; full X for deepwater and seismic. The archetype's region is `north-sea` | pp.327–328, Fig. 6.25 |

**Independent corroboration of the member sizes.** `[AZMAN]` Table 2 prints legs
and piles for five in-service Shell-operated jacket platforms: 4 × 46.5″ legs on
42″ through-leg piles; 3 × 46.5″ on 42″; 4 × 60″ on 54″; 8 × 60″ on 54″; and
4 × 80″ on 84″ **skirt** piles. The through-leg pattern is consistently **one
size step down from the leg it passes through**, which is exactly what a 48″
pile inside a 54″ leg is. The same table gives brace type as K, X and
"combination of X-brace and K-brace" — so X is a real choice, not a stylisation.

**Two departures from the printed footprints, stated rather than hidden:**

- p.312's eight-legged GoM footprint is printed as **120 × 80 ft** (leg-to-leg
  in the long direction, no cantilever there). This model cantilevers **both**
  ways at the sourced half-span, giving 160 × 80 ft = 48.768 × 24.384 m. That is
  one design choice made *inside* a sourced rule.
- The bracing arrangement in plan (which legs batter in which direction on an
  eight-leg jacket) is **INFERRED**: p.20 says only that the legs are
  *"battered"*. This module batters every leg transversely and only the two end
  frames longitudinally, and says so at `BATTER`.

### The well bay

| constant | value | source |
|---|---|---|
| `SLOT` | **2.4 m** — wells *"as close as **1.8 to 3.0 metres** between well centres"*, mid-band, and the figure `terrain.js`'s procedural offshore kit already uses | `[OGP-OFFS]`, verified verbatim |
| `SLOTS_X` × `SLOTS_Y` | **5 × 3 = 15** — *"ten to more than forty"* on a multi-well platform. Odd in both directions so a slot lands exactly on the collar | `[OGP-OFFS]` |
| `COND_OD` | 26 in = **0.6604 m** — *"Conductors are pipes (generally 20 in. to 30 in. OD) that are driven to ground"* | p.341 |
| `GUIDE_PITCH` | **12.192 m** — guides *"framed at various elevations within the jacket and decks"* at *"12 to 18 m (40 to 60 foot)"* | `[EP0147144]` via §A.10 |
| slot occupancy | 1 live · 6 with a tree · 4 capped · 4 empty | *"**not all the conductors may be present at all stages of the platform life**"* — p.341 |
| Christmas trees are on the **cellar deck** | *"cellar deck — pumps, utilities, pig traps, **Christmas trees, wellhead manifolds**"*; §A.10's well bay is two levels, wellheads lower and trees upper | p.295; §A.10 |

`terrain.js`'s procedural kit currently puts its Christmas trees on the **main**
deck, at deck level. This model puts them one level down, where the source puts
them. That is a deliberate correction, not a difference of opinion.

---

## 4. AIR GAP — two different things with one name, and both are real

This is the single most confusing thing in the source material and it is worth
stating plainly, because `research/16` §A.10's photograph test says a fixed
platform has *"no air gap under the deck"* while every fixed platform in the
world is designed **around** an air gap. They are two different words.

**ENGINEERING AIR GAP** — wave clearance. The API definition names the datum
this model uses:

> API RP 2SIM, 1st ed. (2014): *"The clearance between the highest water surface
> that occurs during the extreme metocean conditions and **the underside of the
> cellar deck**."* — `[AIRGAP]`
>
> ISO 19900:2013: *"…and the lowest exposed part not designed to withstand wave
> or ice impingement."* — `[AIRGAP]`

Why it exists: *"Wave-in-deck occurs when there is no deck clearance or air gap
between the water level and the bottom steel of topside structure when it is hit
by the waves"*, and it *"may cause the collapse of the entire platform"*
`[AZMAN]` §2 and abstract. Chakrabarti p.405, writing about a jack-up but
stating the physics for both: *"It is most important that the wave **NEVER** be
allowed to impact on the hull… If the wave were to hit the hull, the design
loads could increase by more than **500 %**."*

Published minima and elevations:

| figure | value | source |
|---|---|---|
| API RP2A GoM minimum air gap | **5 ft = 1.52 m** | Chakrabarti p.311 |
| The commonly quoted 1.5 m | *"A commonly referenced minimum deck clearance is 1.5 m (5 ft), see **API RP 2FPS**"* | `[ABS]` §1 |
| Deck bottom-of-steel, worked case (160 ft water, 62.5 ft design wave) | **50.2 ft calculated / 51 ft per API RP2A** above MLLW | Chakrabarti pp.313–314 |
| Cellar-deck soffit above MSL, five real jacket platforms | **+7.9, +11.2, +12.5, +14.1, +16.1 m** | `[AZMAN]` Table 1 — water depth subtracted from bottom-of-steel-above-mudline; **the subtraction is ours**, the two inputs are printed |
| GoM 100-year design wave | **72 ft → 91 ft** after the major storms | `[JPT]` |

> **CAUTION, and it is recorded because it would be easy to get wrong.** A claim
> surfaced that **API RP 2A-WSD 22nd ed. (2014) removed** the 1.5 m
> recommendation, replacing it for new L-1/L-2 platforms with an underside-of-
> deck no lower than the 1000-year crest per API 2MET. **It could not be
> confirmed against a primary document.** Treat 1.5 m as the classic figure,
> correctly attributed to API RP 2FPS by `[ABS]`, and **do not state that
> current API RP 2A mandates it.**
>
> `[AZMAN]`'s platforms are **tropical South-East Asia**, a benign metocean
> climate. Its **elevations** must not be transferred to a North Sea design; its
> **member sizes and arrangements** are climate-independent and are what this
> model uses them for.

**SILHOUETTE AIR GAP** — daylight under the thing. A jack-up has one: the hull
is jacked clear and you see straight under it. A fixed platform does not,
because the jacket lattice, the conductors, the risers, the caissons and the
boat landing fill the same vertical band. That is §A.10's photograph test and
§5.1's table, and it is a statement about **what you see**, not about wave
clearance. **This model has the engineering air gap and deliberately has no
silhouette air gap.** Getting that pair right is most of what separates it from
`marine-spread`.

### What this model's air gap actually measures

Lowest deck steel = cellar-deck framing soffit = `CELLAR_Z − CELLAR_D` =
**z = −6.846**. `terrain.js` `buildSpecials()` puts the sea at **y = −14**, with
no citation. So the model's air gap is **7.15 m**, against `[AZMAN]`'s
**7.9 – 16.1 m** across five real platforms.

**The 0.75 m deficit is terrain.js's sea elevation, not this model's deck
arrangement** — every level here is at a sourced or source-deduced spacing.
Moving `sea.position.y` to **−14.75** puts the soffit exactly on the sourced
+7.9 m floor. That is a one-line change in a file this module does not own; see
§7.

---

## 5. Topsides, and what could not be sourced

| item | what is used | status |
|---|---|---|
| **Helideck** | **19.69 m across the flats**, octagon, with a perimeter safety net | `[IADC §A.10]` — *"64.61 ft octagon = 19.69 m across the flats"*. That is a **jack-up's** equipment list; a helideck is common to both classes and is used on that basis. The modern rule quoted in `oil-derrick.md` §3.10 (usable diameter ≥ 1.0 × D, D ≈ 22.6–23.7 m for common offshore types) would ask for a **larger** deck. Recorded, not split |
| Deck configuration | main deck + cellar deck + helideck | `[AZMAN]` Table 2 lists exactly *"Helideck, Main Deck, Cellar Deck"* as one of five real configurations; in all five **the cellar deck is the lowest** |
| **Crane** | pedestal crane, **100 ft = 30.48 m** boom | `[IADC §A.9.1]` (jack-up list). §A.10 gives platform crane **capacities** as 15–40 t / 50–100 t but publishes **no boom length**. **NO CAPACITY IS ASSERTED IN THE MODEL** |
| **Lifeboats** | **two, fully enclosed, port and starboard** | `[IADC §L.8.1]` — *"2 × fully enclosed, 65 persons each, port and starboard"*. **`LIFEBOAT_L = 8.0 m` is `NOT SOURCED`** — no length for a 65-person TEMPSC could be found |
| **Flare boom** | 34 m at 30° | **BOTH `NOT SOURCED`, and the repo already knew it.** `oil-derrick.md`'s source table records: *"Flare-boom length appeared only in a patent's general wording — flagged low-confidence."* §A.10 and §5.1 name the object (*"a flare boom on a long outrigger"*) and neither dimensions it. **Do not cite `FLARE_L` or `FLARE_DEG` from anywhere** |
| Handrail 1.10 m / midrail 0.66 / toe 0.22 | **`NOT SOURCED`** | No handrail height is cited anywhere in this repo's research library and none was found. These three match what `terrain.js`'s procedural offshore kit already draws, **so the .glb and the fallback cannot disagree at the seam.** Both are unsourced |
| Splash-zone **extent** (`SPLASH_HI`/`SPLASH_LO`) | **`NOT SOURCED`** | What a splash zone *is* is well defined (`[SPLASH]`: API RP 2SIM *"intermittently wet and dry due to wave and tidal action"*; DNV-OS-C101 defers to its own Sec.10 B200 for the limits). **That formula, and any numeric North Sea or GoM extent, sits behind paywalled standards and could not be reached.** The **thickening** and the **step** are sourced; where the band starts and stops is not |
| Deck girder / beam **depths**, substructure member sizes | **`NOT SOURCED`** | The source gives deck beam **spacing** and deck **loads**, never member depths |
| Christmas tree height, body diameter, valve sizes | **`NOT SOURCED`** | The **arrangement** (body, two wing valves, bonnet, cap on a casing head) is the ordinary surface tree; the sizes are art |
| Quarters block size, storey count, process vessel sizes, compressor package | **`NOT SOURCED`** | §A.10 names the objects and dimensions none of them |
| Colours | **`NOT SOURCED` hex values**, sourced intent | `oil-derrick.md` §6.3: *"one dominant colour … an off-white/light grey or a mid grey … Safety yellow and black at every edge … Safety equipment is red … **Lifeboats are orange, and they are the brightest objects on the whole structure**"* |
| Boat landing: **three stacked stages** | sourced indirectly | `[AZMAN]`: after 5.444 m of subsidence *"the boat landing is no longer usable by 2016 as **all the three stages of landing** were submerged"*. Three stages is a **fact**; that they occupy roughly the lowest ~5 m above the original sea level is an **inference from two sourced numbers** |
| **Swingrope** | rope with a knotted lower end above the landing | `[SWING]`, from API RP 54: *"A vertically suspended rope with knotted lower end for hand grips, positioned above the boat landing"* |

### Four numbers that are unsourceable from here

**Leg batter, deck-to-deck spacing, splash-zone extent and marine-growth
thickness** all live in paywalled standards (API RP 2A, ISO 19902, NORSOK N-003,
DNV-OS-C101 Sec.10 B200). A dedicated web search on 2026-09-06 reached none of
them. Two of the four are nonetheless covered by **Chakrabarti**, which the
outside search did not have: **batter 1:8** (pp.307–308) and **growth 1.5 in**
(p.138). The other two — deck-to-deck spacing and splash-zone extent — are
`DEDUCED` and `NOT SOURCED` respectively, and the module says so. **Closing them
needs purchased or library access to those standards. Do not guess them.**

---

## 6. Measurements — build output, not estimates

Built with **Blender 5.2.1**, exported and then measured with
`node tools/glbinfo.mjs`, which is the only dimension tool in this repo
(ASTRA.md §5). No second ruler was written.

```
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" \
    --background --python blender/sites/platform_deck.py
```

`package.json`'s `blender:sites` script already lists `platform_deck.py`, so
`npm run blender` builds it on a fresh clone — the pipeline registration is
done. (Note the `call` prefix on every entry in that script: `npm` runs through
`cmd.exe /d /s /c` and `/s` strips the outer quotes of a command that *starts*
with a quote. ASTRA.md §4.5 — do not "tidy" it away.)

```
SITE_OK  materials=4  draws=4  budget=6
glTF v2  1546.3 kB
PRIMITIVES 4 (= draw-call floor)   TRIANGLES 18480   nodes 5   images 0
materials: galvanised, paintedSteel, rubber, wornSteel
DIMENSIONS (m)  W 94.618 x H 46.968 x L 28.238
BOUNDS  x -40.527..54.091   y -21.010..25.958   z -14.895..13.343
  mount:site-collar          (no geometry)
  static:galvanised     64.687 x 27.262 x 26.686
  static:paintedSteel   62.482 x 20.781 x 24.484
  static:rubber         45.942 x 24.795 x 22.244
  static:wornSteel      91.931 x 46.968 x 27.297
```

**The overall bound is not the deck.** ASTRA.md §5 warns that a bounding box is
not a width, so: the deck is **48.768 × 24.384 m**. The 94.6 m x-extent is two
objects — the helideck cantilevered to x = −40.5 and the flare boom tip at
x = +54.1. The 47.0 m height runs from the jacket bay bottom at z = −21.0 to the
crane boom tip at z = +26.0.

### Draw calls, and where the give-back comes from

`blender/lib/site.py`'s budget is **6 materials**; this site uses **4**. It is
the cheapest site model in the tree (quarry-bench 6, urban-plot 5).

Site.py's measured table puts the *procedural* `platform-deck` site at **10**
draw calls today. A `.glb` is pure addition unless the archetype gives calls
back, and `tools/checksiteenvironment.mjs` measures the net (quarry-bench is
**+3**, urban-plot **+1**). **Nothing self-seeds on a deck, so `replaces` buys
nothing here** — the gate itself asserts that, in the test named *"nothing
self-seeds on an offshore deck"*. The give-back must come entirely from
`replacesKit`.

Measured, by parsing `buildSiteKit()` in `src/world/terrain.js`: for
`kit === 'offshore'` the **only** pool classes that receive geometry are
**`metal` (31 uses), `paint` (10) and `matte` (1)**, all from inside the
`if (kit === 'offshore')` branch at lines 3953–4081; the code before the kit
branches contributes only `earth`. `makePropPool.build()` emits one mesh **per
non-empty class**, so gating that branch empties three classes and **returns
3 draw calls**. Net cost of this model: **4 − 3 = +1**, the same as urban-plot.

*(Scope of that measurement: `buildSiteKit()` only. `put()` calls elsewhere in
terrain.js were not counted, so the real give-back is ≥ 3 only if no other
offshore path also feeds `metal`/`paint`/`matte`. The integration agent should
confirm with `node tools/checksiteenvironment.mjs`, which measures it for real.)*

### The "no opaque decorative floor" rule, offshore

`site.py` forbids covering the live terrain, and offshore that is subtle because
the deck **is** a floor. It is resolved by **ownership**:

- `terrain.js` `buildSpecials()` owns the deck **plate**. It is a `ShapeGeometry`
  with a rectangular hole cut over the collar, so the collar, the borehole and
  the surface/section seam stay live through it, and it receives shadows.
- This module ships **no deck plate at all**. It owns what the plate rests on
  (girders, deck beams at the sourced 5 ft pitch, deck legs, the jacket) and
  what stands on it.
- The well-slot **coaming** frames the plate's opening from **outside** it.
- Enforced, not asserted: `build()` walks **every real world-space vertex** and
  refuses the export if any of them reaches z ≥ −0.02 inside |x| ≤ 5.4,
  |y| ≤ 4.2. Bounding boxes are not used — ASTRA.md §5's `glbdims.mjs` finding
  is that a rotated member's local box is a strict over-estimate.

---

## 7. What the integration agent has to do — I do not own these files

**This model is not reachable from the game as the tree stands.** Everything
below is in `src/world/terrain.js`, which this task does not own.

### 7.1 The archetype declares no model at all — REQUIRED

`terrain.js:555` currently reads, in full:

```js
'platform-deck': { kit: 'offshore', plane: 'offshore', deck: 'fixed' },
```

There is no `model` field, so `attachSiteModel()` returns at
`const id = arch && arch.model; if (!id) return;` and **the .glb is never
fetched.** It needs `model`, `replaces` and `replacesKit` — and the docstring at
terrain.js:1670–1687 is explicit that an archetype declaring a `model` and
neither of the other two *"is not 'safe by default' — it is an undeclared
decision"*, which `tools/checksiteenvironment.mjs` fails on. Suggested:

```js
'platform-deck': {
  kit: 'offshore', plane: 'offshore', deck: 'fixed',
  model: 'platform-deck',
  replaces: [],        // nothing self-seeds on a deck; the gate asserts this
  replacesKit: true,   // the .glb IS the deck furniture — see 7.2
},
```

### 7.2 The offshore kit branch is not gated — REQUIRED

`terrain.js:3953` is `if (kit === 'offshore') {` with no supersede test, unlike
`urban` (2756) and `quarry` (4099), which both carry `&& !kitSuperseded()`. As
it stands the procedural conductors, trees, jacket and flare would draw **inside
and through** the authored ones. It must become:

```js
if (kit === 'offshore' && !kitSuperseded()) {
```

This is also where the 3 draw calls come back (§6).

### 7.3 The deck plate is 56 × 34 m against a sourced 48.768 × 24.384 — REPORTED

`buildSpecials()` builds the plate outline at `(-28,-17) … (28,17)`. The sourced
40 ft module with the sourced half-span cantilevers gives **48.768 × 24.384 m**,
which is what this model's handrail, toe board and deck-edge fascia are built
to. Until the outline is changed, **3.6 m of plate stands proud beyond the
handrail at each end and 4.8 m at each side.** It is visible in
`shots/platform-deck-export.png`, where the plate is drawn as a clearly-labelled
inspection fixture at terrain.js's own numbers. The change is:

```js
outline.moveTo(-24.384, -12.192); outline.lineTo(24.384, -12.192);
outline.lineTo(24.384, 12.192);   outline.lineTo(-24.384, 12.192);
outline.lineTo(-24.384, -12.192);
```

keeping the hole and the uv rescale (which divides by 56 and 34 — those two
constants move with the outline). **I have not made this change and I am not
asserting it is the right call**: 56 × 34 m is a perfectly plausible size for a
large North Sea PDQ platform, and Chakrabarti's footprints are GoM decks sized
by a drill rig's skid beams. What is *not* defensible is the current pairing —
a 12.192 m leg spacing under a 34 m deck width needs 10.9 m cantilevers, against
the sourced *"about one half the … spans"* = 6.096 m.

### 7.4 The sea elevation is uncited and 0.75 m too high — REPORTED

`buildSpecials()`: `sea.position.y = -14`, with no citation. §4 above shows the
model's cellar-deck soffit lands at +7.15 m against a sourced +7.9 m minimum
across five real platforms. **`sea.position.y = -14.75` closes it exactly**, and
costs nothing — the sea is a flat 900 m plane and the horizon shader fades by
view distance, not by height.

### 7.5 Offshore placement — WHAT I ACTUALLY FOUND

The brief warned that the surface attachment path may not support every plane.
Measured against the code, here is precisely what happens for
`plane: 'offshore'`:

| what | line | behaviour offshore |
|---|---|---|
| `onDeck()` | 1691-ish | `arch.plane === 'offshore'` |
| `terrainHeight()` | 1807 | **returns 0 unconditionally** — *"steel deck: everything sits at y = 0"* |
| ground mesh | 1877 | built with 16 segments instead of `segs`, *"the offshore deck hides the ground entirely"* |
| ground visibility | 2045 | **`ground.visible = false`** |
| pad decal | 2053 | **not built at all** |
| far-field skirt | 4998 | **skipped** |
| the deck | `buildSpecials()` | a separate `ShapeGeometry` mesh named `deck`, 56 × 34 m with the hole, `wornSteel` + a grating map, **outside the merged prop pool** |
| the sea | `buildSpecials()` | a separate 900 × 900 plane named `sea` at y = −14, `mat(null, …)` with its own shader |
| the site `.glb` | `attachSiteModel()` | `node.position.set(0, 0, 0)` — *"the .glb's origin IS the collar"* |

**The conclusion, and it is good news: the site-model attach path itself is
plane-agnostic and needs no change.** `loadSiteModel()`, `restoreSiteNames()`,
`swapSiteMaterials()`, `bindSiteMaterials()` and `attachSiteModel()` never test
`plane` or `onDeck()`. A site `.glb` is added to `root` at the origin exactly the
same way offshore as on land, and because `terrainHeight()` returns 0 offshore,
the collar datum and the model datum coincide with no offset.

**What *is* offshore-specific is everything around it**, and all of it is
already handled: the ground is hidden rather than flattened, so `flatR` /
`flatFalloff` / `padCrown` are meaningless here and must **not** be added to the
archetype the way `urban-plot` and `quarry-bench` use them; there is no decal to
suppress; and the two objects a land archetype does not have — `deck` and `sea`
— are built in `buildSpecials()` and are the two constants in §7.3 and §7.4.

One genuine gap: `tools/checksiteenvironment.mjs`'s *"no site model stands in
the hole"* case prints `nearestVertexAboveGrade` per model. **Offshore, "grade"
is the deck plate, not the terrain**, and this model deliberately hangs
structure below it. If that check treats sub-zero geometry as a breach it will
need an offshore case; it currently has none, because no offshore archetype
declares a model.

### 7.6 The hero camera is inside this machine

Not this module's problem, but found while rendering and worth passing on.
`blender/lib/site.py` records the hero eye at three.js `[7.60, 2.60, 9.90]`,
12.5 m from the collar. `oil-derrick` is ≈58 m tall on a 14 × 13.9 m
substructure whose skid beams reach ±10.4 m. **A render from that eye is inside
the substructure** — see the first attempt, which is why `shots/platform-deck-hero.png`
was re-shot from a framing distance (≈89 m) instead. `renderer.js` frames per
machine (`research/ASTRA-progress-2026-09-06.md` records 2,904 CPU framing
checks over 342 poses, headed proof still queued), so this is presumably already
handled — but site.py's recorded eye should not be read as the eye used for this
archetype.

---

## 8. The renders — offline Blender, never gameplay captures

All three are produced by `platform_deck.preview()`, which **re-imports the real
exported `.glb`** and renders it with Cycles CPU. Nothing is rebuilt from the
authoring scene, so what is pictured is what ships. **They are not the game's
renderer and they do not use `assets.js`'s procedural materials** — colour comes
from the authored `COLOR_0` attribute only.

Two things in the frames are **inspection fixtures and are not in the export**,
named `FIXTURE-` in the scene: the **sea plane** at terrain.js's y = −14, and
the **deck plate**, built to terrain.js's own 56 × 34 m outline with its
2 × 5.4 × 2 × 4.2 m opening. Without the plate the model reads as an unfinished
frame; with it, §7.3's overhang is visible as a dark apron beyond the amber toe
boards.

| file | what it shows |
|---|---|
| `shots/platform-deck-export.png` | the whole platform in the water |
| `shots/platform-deck-jacket.png` | the identity shot — **structure all the way down**: cellar deck with the Christmas trees, deck-leg bracing, jacket top frame, X-braced bay, splash bands, the three-stage boat landing with barge-bumper tyres, and the caissons |
| `shots/platform-deck-hero.png` | **the datum proof** — this export and the real `public/models/oil-derrick.glb` in one scene. The derrick's skid beams sit **on** the deck. `oil-derrick.glb` was read from `C:\Users\henri\Downloads\drillity-the-game\public\models\`, **read-only** |

Denoising is **off** in `preview()`: seven other site builds share this machine
and the first attempt died with *"OIDN error: out of memory"* and wrote nothing.
More samples with no denoiser is slower and always finishes.

### What the renders found, that reading the code did not

Four faults were visible in the first frames and none of them was visible in the
source:

1. **The process train was inside the accommodation block.** The separators were
   at x = −15.4 and the quarters spans −24.0 … −13.6; the render showed white
   vessel ends coming out of a bedroom wall. Moved to the +Y strip, which
   `rig_envelope()` leaves clear across the whole deck and which is also what
   the hero camera looks at past the machine.
2. **The helideck read as a floating lid.** A full amber disc of radius r + 0.30
   had been laid on top of the landing surface, covering it. It is now eight
   edge segments on the octagon's flats.
3. **Two helideck columns stood on nothing**, 8.7 m off the end of the quarters
   roof, and the back-stays ran from the outboard edge to a deck point 9.8 m
   *inside* the accommodation block. Replaced with rakers off the block's end
   wall — the only face on that side a strut can land on.
4. **The lifeboats read as pressure vessels.** A horizontal orange cylinder on a
   deck that already carries two separators is exactly the wrong silhouette.
   Rebuilt as heavily bevelled boxes stepping in toward bow and stern.

The build's own keep-clear assertions caught three more before any render:
geometry inside the deck opening, a lifeboat davit standing in the machine's
skid beams, and a **stair handrail drawn horizontally at deck height running six
metres inboard through the substructure** — `railing()` had been ignoring each
point's own z, which is right for a deck edge and wrong for a stair.

---

## 9. Honest outstanding issues

1. **The model is not on screen and cannot be.** §7.1 and §7.2 are both
   required, and both are in a file this task does not own. Until they land this
   is a gallery model. `node tools/checksiteenvironment.mjs` currently passes
   with 23 tests and does not exercise this archetype at all.
2. **The marine-growth sleeves and every sacrificial anode are hidden by
   terrain.js's opaque sea plane.** They sit at their sourced elevations —
   growth from the waterline down, anodes below that, because an anode only
   works submerged — and the sea at y = −14 is opaque, so in the game none of it
   is visible. They cost roughly 1,500 of 18,480 triangles. They are kept
   because they are correct, because the sea elevation is not this module's, and
   because the growth line is one of the archetype's identifying features the
   moment a camera drops below the deck. **This is a real cost for no current
   visible return and somebody may reasonably disagree.**
3. **Four numbers are unsourceable from this machine** (§5): flare boom length
   and angle, lifeboat length, splash-zone extent, handrail height. All four are
   marked `NOT SOURCED` in the module at the point of use. The flare boom is the
   worst of them because it is a large, prominent object built entirely on two
   invented numbers.
4. **`CELLAR_Z` is a deduction, not a fact**, and the source it came from says so
   in as many words. Every elevation below the main deck rests on it.
5. **The eight-leg batter arrangement in plan is INFERRED.** The source says the
   legs are battered; it does not say which planes on an eight-leg jacket.
6. **This model has one boat landing; the source says two.** Chakrabarti p.341:
   *"Generally, two boat landings each located in opposite faces."* The same page
   gives the exception — in the North Sea and deepwater, *"not providing boat
   landings could be given consideration"* — and `[AZMAN]`'s five platforms carry
   1, 1, none, 2 and 2. One is defensible for a `north-sea` archetype. It was
   also a triangle-budget choice and that should be said.
7. **No `pivot:` or `slide:` node.** Nothing on this site moves — not the crane,
   not the flare. A pedestal crane slewing to a boat transfer would be the
   obvious first animation and the budget has two spare materials for it.
8. **`blender/lib/site.py` is being edited concurrently by another agent** and
   was transiently unparseable at 02:52 on 2026-09-06, which broke one render
   run. It compiled again minutes later and the final build in §6 was made
   against the current file. **This export should be rebuilt once site.py
   settles.**
9. **The deck has no cable tray**, which `oil-derrick.md` §4.11 calls out as
   running to all eleven named areas of an offshore drilling package and as a
   defining part of the deck's visual texture. It is a straightforward addition
   inside the existing `galvanised` material at zero draw-call cost.

---

## Source keys

| key | source |
|---|---|
| Chakrabarti | *Handbook of Offshore Engineering* Vol. I, Ch. 6 (2005), printed page numbers, transcribed and page-cited in `research/rigs/oil-derrick.md` §3.8, §4.12, §6 |
| `[IADC]` | the filled-in IADC Standard Format Equipment List for a jack-up, transcribed in `research/rigs/oil-derrick.md` §3.10. Used only for items common to both classes, and said so at each use |
| `[OGP-OFFS]` | drillingmanual.com offshore platform article, verified verbatim in `research/rigs/oil-derrick.md` §3.9 and `research/16` §A.10 |
| `[EP0147144]` | conductor / jacket patent, cited by `research/16` §A.10 |
| §A.10, §A.11 | `research/16-site-archetypes.md` |
| §5.1, §6 | `research/rigs/oil-derrick.md` |
| `[AIRGAP]` | IADC Lexicon, "Air gap", quoting API RP 2SIM 1st ed. (2014) and ISO 19900:2013 — <https://iadclexicon.org/air-gap/> (2026-09-06) |
| `[SPLASH]` | IADC Lexicon, "Splash zone", quoting API RP 2SIM, ISO 19900, DNV-OS-C101, Lloyd's Register — <https://iadclexicon.org/splash-zone/> (2026-09-06) |
| `[SWING]` | IADC Lexicon, "Swingrope", from API RP 54 — <https://iadclexicon.org/swingrope/> (2026-09-06) |
| `[ABS]` | ABS, *Guidance Notes on Air Gap and Wave Impact Analysis for Semi-Submersibles*, May 2020, §1 — <https://ww2.eagle.org/content/dam/eagle/rules-and-guides/current/offshore/249-gn-airgapanalysis-semisubmersibles-2018/air-gap-analysis-gn-may20.pdf> (2026-09-06) |
| `[AZMAN]` | Azman et al., *J. Mar. Sci. Eng.* 2021, 9, 1027, Tables 1–2, Figs. 6–7 — <https://www.mdpi.com/2077-1312/9/9/1027> (2026-09-06). Five real Shell-operated jacket platforms offshore Sarawak/Sabah. **Tropical SE Asia — its elevations must not be transferred to a North Sea design** |
| `[JPT]` | JPT/SPE, *Remediating Platforms by Raising Topsides* — <https://jpt.spe.org/remediating-platforms-raising-topsides> (2026-09-06) |

Reached and rejected, recorded so nobody repeats the search: API RP 2A, ISO
19902, NORSOK N-003 and DNV-OS-C101 are all paywalled; ScienceDirect, MDPI-HTML,
ResearchGate and OnePetro returned 403; `rules.dnvgl.com` no longer resolves. A
pirated copy of API RP 2A appeared in results and **was not used**.

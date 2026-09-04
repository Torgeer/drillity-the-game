# 17 — Site/method verification notes (coordinator)

Written 2026-09-04 in response to a direct instruction from the project owner:

> *"You need to be super accurate regarding the different drilling rigs. And
> offshore rigs are as you understand on the sea. Be really really critical so
> we don't look foolish. Diamond core rig is one thing, a piling rig is
> something, anchor rig is something etc. We don't want 1 site with different
> machines — foundation maybe in a city, prospecting for gold in a mine, oil at
> sea, piling etc. You will easily see where each method is used and in what
> area/field — **no guessing here**."*

`research/16-site-archetypes.md` is the comprehensive pack. **This file is a
short set of spot-verifications I ran myself**, kept separate so it does not
collide with that work. Where the two disagree, 16 wins — it has the deeper
sourcing. Everything below carries a URL.

---

## 1. The measured problem this is fixing

`world/terrain.js` picks the site from **`regionId` alone** — `grep application`
returns nothing — so within a region every method gets the identical site. And
the region↔application mapping is loose enough that intersecting
`METHODS[].applications` with `REGIONS[].applications` currently permits:

| region | methods it can generate that are absurd |
|---|---|
| **north-sea** (offshore) | `auger`, `cable-tool`, `sonic`, `core` |
| **nordic** (forest) | `rotary-kelly`, `cfa`, `cased-cfa`, `driven-pile`, `jet-grouting` |
| **german-site** (surface) | `tunnel-jumbo`, `raise-boring` — both underground machines |
| **iberian-quarry** | the whole foundation set, plus `tunnel-jumbo`, `raise-boring`, `hdd` |
| **sahara** (water field) | `cased-cfa`, `hdd` |
| **arctic** | `rotary-kelly`, `cfa`, `cased-cfa`, `jet-grouting` |
| **andes** (copper mine) | `jet-grouting` |

A cable percussion spudder — a winch, a wire rope, a chisel and a bailer — can
appear on a North Sea platform.

---

## 2. Offshore — the distinction the game is missing

**"An oil rig drills; a platform produces."** A rig bores the well; a production
platform or FPSO processes and stores what flows. `[AIRSWIFT]`

By water depth `[AIRSWIFT]`:

| unit | depth |
|---|---|
| fixed platform | to ~500 m |
| **jack-up** | below ~120 m; legs lowered to the seabed, hull jacked clear of wave action |
| semi-submersible · spar · **drillship** · FPSO | thousands of metres |

Drillships are mobile and suit **exploration across scattered locations** and
deepwater/ultra-deepwater work `[AIRSWIFT]`.

**Consequences for the game.** The `north-sea` region is named "North Sea
Platform". If it is a *production* platform, the drilling that belongs there is
platform/development work — not exploration, and certainly not a spudder or an
auger. **Offshore geotechnical site investigation is real but is done from a
jack-up or a dedicated geotechnical vessel, not from a production deck.** The
type/class/water-depth fields already in `PLATFORM_TRUTH.md` Part B are the
right vocabulary; the archetype should distinguish **platform deck** from
**jack-up / vessel**.

`NOT SOURCED` here: the search returned nothing specific on geotechnical
vessels. Do not assert their deck layout without a source.

---

## 3. Prospecting — the owner's "gold in a mine" is half the picture

RC is used in **both** settings, and they look nothing alike `[DMA-GC]`,
`[DMA-RC]`, `[BURGEX]`:

- **Grade control, open-pit bench.** Closely spaced holes on an *active mining
  bench*, refining the short-term model **immediately before blasting**, to
  define ore/waste boundaries for production decisions. *"Rigs with a compact
  footprint and high manoeuvrability are particularly valuable where bench
  space is limited."* This is the "in a mine" setting, and the **confined bench
  with limited room is the defining visual**.
- **Greenfield exploration.** Target testing and follow-up programmes, chosen
  for representative samples quickly and cheaply.

Underground RC from a mine level also exists `[HARLSAN]`.

RC's sample is **chips, not core** — a dual-tube system, air down, sample up the
inner tube — so it gives grade but not structure `[DMA-RC]`. A variographic
study found **sampling variability lower for RC than for blast-hole sampling,
but RC's total cost significantly higher** `[TANDF]` — which is a real
gameplay trade-off, not flavour.

**So the game should carry both archetypes**: an open-pit bench and a greenfield
pad. Forcing gold into one loses the more interesting of the two.

---

## 4. Piling rig ≠ anchor rig — the owner named this explicitly, and it holds

### CFA / bored piling — an **urban** machine

CFA drills and concretes in one operation, pumping concrete down the auger stem
as it is withdrawn. It is *"quick, quiet and cost-effective… ideal for
inner-city and high-rise construction"* and produces minimal spoil
`[CENTRAL]`, `[FP-CFA]`.

The site furniture is specific and is exactly what a city foundation scene
needs `[AARSLEFF]`, `[CFA-GUIDE]`:

- an **engineered granular working platform** — a piling mat — *verified against
  rig-specific bearing pressures*, geogrid-reinforced where required
- **concrete pumps**, and on larger sites **concrete holding drums**
- a **crane or excavator** to lower the reinforcement cages
- an **auger cleaner**, plus spoil removal and pile trimming

None of that is grass and spruce.

### Anchor / micropile — a **different machine on a different site**

Excavator-mounted drills for **hard-to-reach places**, drilling tie-backs with a
high-powered percussion head; **low-headroom rigs** for restricted areas
(*a mid-size rig casing to 14 in under a 13 ft overhead restriction*)
`[NORLAND]`. The work is **tie-backs and soil nails into retaining walls**, and
micropiles where **access is limited or soils are weak** `[GEOSTAB]`,
`[INTECH]`.

So the archetypes differ: piling is an **open plot with hardstanding, crane
access and concrete logistics**; anchoring is a **slope, cutting, retaining wall
or low-headroom basement**. Same industry, different scene.

---

## 5. What I did not verify

Everything above is a spot check on the pairings I judged highest-risk. I have
**not** verified: sonic's real field settings, HDD's site archetypes, jet
grouting, tunnel portal layout, permafrost pads, or the quarry bench. Those are
`research/16`'s job — **do not assume they are fine because they are absent
here.**

---

## Sources

- `[AIRSWIFT]` https://www.airswift.com/blog/oil-rigs-offshore-platforms-types
- `[DMA-GC]` https://drillmastersafrica.com/grade-control-drilling-open-pit-mining/
- `[DMA-RC]` https://drillmastersafrica.com/reverse-circulation-drilling-mineral-exploration/
- `[BURGEX]` https://www.burgex.com/2026/08/28/choosing-the-right-drilling-method-for-your-exploration-project/
- `[HARLSAN]` https://www.harlsan.com.au/how-underground-rc-drilling-turned-around-a-gold-mine/
- `[TANDF]` https://www.tandfonline.com/doi/abs/10.1080/03717453.2017.1414104
- `[CENTRAL]` https://centralpiling.com/cfa-piling/
- `[FP-CFA]` https://www.foundation-piling.co.uk/techniques/cfa-bored-piling/
- `[AARSLEFF]` https://aarsleff.co.uk/company-news/navigating-rotary-bored-piling-answering-your-top-questions/
- `[CFA-GUIDE]` https://cdn.prod.website-files.com/64e4851ee8b02bf2fd3f3084/64e4851ee8b02bf2fd3f33e0_CFA-Piling-Guidance-v3.1.pdf
- `[NORLAND]` https://www.norlandlimited.com/services/anchor-micropile-drilling/
- `[GEOSTAB]` https://www.geostabilization.com/project-gallery/transmission-tower-stabilization-micropiles/
- `[INTECH]` https://intechanchoring.com/products/magnacore/

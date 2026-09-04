# 12 — OEM research: rock drilling & tooling (top hammer · DTH · core · rotary · TBM)

**Purpose.** Source material for three separate game systems. Keep them separate.

1. **The garage compatibility gate.** The game now *enforces* thread and shank
   compatibility and tells the player, in words, that R-, T- and H-series
   percussion threads will not mate. **§B is that reference**, and it is the most
   important thing in this file. A professional driller will read those messages.
2. **"Fits rig / brand" is a real iMarket facet** (`DOMAIN.md` §6). §A documents
   who actually makes this equipment and what their naming conventions encode.
3. **Capability envelopes** (§C) so invented in-game tools land in believable
   classes — including **air requirement in m³/min and bar**, because compressor
   sizing is a real purchasing decision the game already models.

> **HARD RULE, repeated from `DOMAIN.md` §6 and §10 and `PLATFORM_TRUTH.md` Part C
> rule 4.** Never use a real model designation as an in-game product name.
> `COP 1838`, `HD 712`, `QL 60`, `DHD 350R`, `RH560`, `GT60`, `MP80-QL`,
> `Pit Viper` and every other badge below is **reference data only**. Invent names;
> borrow only the *class*.
>
> **Second hard rule.** `DOMAIN.md` §10 forbids carrying any single supplier's
> parts catalogue or part numbers into the game. Several catalogues read for this
> file are wall-to-wall order numbers — **none are reproduced here**, only the fit
> *logic* and published performance figures.
>
> **Third rule, specific to this file.** Thread designations (`R32`, `T45`, `H64`,
> `NQ`, `API 3½ REG`) are **industry standards, not trademarks**, and the game
> already uses them (`DOMAIN.md` §4). They are safe. Hammer and drifter *model*
> names are not.

**Sourcing discipline.** Every number carries a URL or a local filename. Anything
that could not be confirmed is marked `UNVERIFIED` or `INFERRED` and left visible
(§F). This file **builds on `research/11-oem-anchor-geotech-hdd.md` §C** and does
not contradict it; where it extends that pack, it says so.

---

## §0. Source index

### Local files (`C:\Users\henri\Downloads\`)

| File | What it gave |
|---|---|
| `top-hammer-drilling-tools-broshure-english.pdf` — **Sandvik Construction, Top hammer drilling tools product catalogue** | The backbone of §B.2. Full thread-by-thread bit diameter ranges (R32 → GT60), the MF-rod and coupling-sleeve logic, button shapes and skirt designs, drifter-bit type families 52/53/54/55, hardening processes, and the shank-adapter tables keyed by **rock-drill model**. |
| `Top_Hammer_Tools.pdf` — **Mitsubishi Materials Hardmetal, Top Hammer Tools, rev. Jun-2024** | The single best **shank-adapter cross-reference** found: rock-drill family → available shank thread, organised by drifter maker (Epiroc, Furukawa, Gardner Denver, Ingersoll Rand, Montabert, Sandvik/Tamrock, Secoma, Krupp, Toyo). Used for §B.3 fit logic only; **no part numbers carried over**. |
| `Epiroc DTH product catalog.pdf` (Epiroc Drilling Tools) | §B.4 — the **bit-shank family map** (which hammers share a bit shank), spline counts, shank lengths, plus the hammer selection rules and per-hammer OD / recommended hole size / working pressure / shank style / backhead connection tables used in §C.3. |
| `dth_catalog_digital_version_eng_2023.pdf` — **Sandvik, Down the Hole Rock Drilling Tools, 2023** | §C.4 — **air consumption in m³/min (DIN 1343) at 10 / 18 / 24 bar** and power output in kW for 3.5″, 4″, 5″, 6″ and 9″ hammers. This is the compressor-sizing data. |
| `Mincon-Bluebook-2025-WEB.pdf` (Mincon Group plc, 2025) | §C.3 — a **3″ to 40″** hammer range table: size class, shank designation, hammer OD, tool length, piston weight, weight, standard backhead. |
| `Mincon-RC-Solutions-2025-A4-WEB.pdf` (Mincon, 2025) | §B.4.5 — **RC hammers are a separate shank family** (Remet / Metzke / ARDX / MR-series), with air packages in m³/min at bar. |
| `Diamond Driller's Technical Book.pdf` (Epiroc; acknowledges W. F. Heinz, *The Diamond Drilling Handbook*) | §B.6 — **wireline core AND hole diameters** for AWL–PWL, rod OD/ID, and the triple-tube and thick-kerf variants. |
| `Mineral Exploration Tooling - Catalog.pdf` (Epiroc Drilling Tools, 2025) | §A.16 — Fordia diamond-tool product lines now inside Epiroc; RC hammers and bits; confirms **Secoroc** survives as Epiroc's rock-tools brand. |
| `Epiroc Guide choosing right core bit.pdf` | §B.6 — matrix numbering (**higher number = softer matrix**), impregnation depth (13 mm standard; 16/20/26 mm options), waterway configurations, and the RPM-by-core-size chart. |
| `Epiroc Guide to Drilling Parameters.pdf` | §C.8 — the ROP/RPM/WOB/water-flow relationship for diamond coring, and the Mohs scale framing. |
| `Epiroc guide Extending core bit life.pdf` | Read for §C.8; corroborates the parameter guidance. |
| `BETEK_Katalog_Tungsten_carbide.pdf` — **BWH Bohrwerkzeuge Hoffmann GmbH & Co. KG / BETEK GmbH & Co. KG**, index 4, 04.2025 | §B.8 — a **real carbide grade table**: WC %, Co %, grain size, density, hardness HV10, and the application each grade is recommended for. This is the wear-versus-breakage trade-off, sourced. |
| `bwh-betek-katalog-bergbau-mining-en.pdf` | §A.13 — Betek/BWH round-shank and point-attack tooling for mining; the steel-to-carbide brazing framing. |
| `13.5-BWH-MWH-wasserbetriebener-Imlochhammer-WAI80-EN.pdf` | §C.5 — a complete **water-powered DTH hammer** datasheet (the only one of the five WAI files with extractable text). |
| `28-SupplHi-Standard-Categorization-Drilling-Equipment-and-Materials_compressed.pdf` | Category structure cross-check for the shop's information architecture. |
| `KLEMM_Lieferprogramm_Product_Range.pdf`, `EURODRILL_DRILLING_ACCESSORIES_BOHRZUBEHOER_2025_26.pdf`, `Einsteckende Klemm.pdf` | Already mined in `research/11-oem-anchor-geotech-hdd.md` §C.2. **`Einsteckende Klemm.pdf` is image-only — no extractable text.** The Eurodrill shank matrix is re-read here only to confirm and extend pack 11's shaft-Ø gate (§B.3.1). |

### Web sources

Cited inline at each claim. Principal ones: `atlascopcogroup.com`, `epiroc.com`,
`montabert.com`, `robitgroup.com`, `mincon.com`, `rockmore-intl.com`,
`halco.uk`, `boartlongyear.com`, `furukawarockdrill.co.jp`, `e6.com`,
`kennametal.com`, `robbinstbm.com`, `terratec.co`, `tactexindustries.com`,
plus `rock-drillbits.com`, `sinodrills.com` and `drillingformulas.com` for the
thread and shank explanations, and `gadrilling.com` / `merlinerd.com` where noted.

---

# §A. Per manufacturer

## A.1 Epiroc — and the Atlas Copco history, because BOTH names are in the taxonomy

**This is the first thing to get right**, because `DOMAIN.md` §6 lists the
fits-rig brand as **"Atlas Copco / Epiroc"** — one entry, two names — and a player
who owns tooling under one badge will meet the other.

**What actually happened.**

| Date | Event | Source |
|---|---|---|
| **January 2017** | Atlas Copco AB *"initiated work to propose to the Annual General Meeting 2018 to decide on a split"* | atlascopcogroup.com — https://www.atlascopcogroup.com/en/investors/acquisitions-and-divestments/epiroc-split-from-atlas-copco-group |
| **24 April 2018** | AGM decides *"to distribute Epiroc AB"* to Atlas Copco shareholders | ibid. |
| — | *"All shares in the wholly-owned subsidiary Epiroc AB was distributed to Atlas Copco AB's shareholders in proportion **1:1**"* | ibid. |
| **18 June 2018** | *"The first day of trading in Epiroc AB was June 18, 2018."* Listed on Nasdaq Stockholm | ibid. |

**The split line — and this is what matters for the taxonomy.** Epiroc took
*"customers in the mining, infrastructure and natural resources segments"*; Atlas
Copco kept *"industrial customers"* (ibid.).

**Therefore, for the game:**

> **Everything in `DOMAIN.md` §3 group B — drill rigs, rock drilling tools, DTH
> hammers, bits, rods, shank adapters — went to Epiroc. Compressors are the
> ambiguous case and should not be attributed to either without a check.**
> The rock-tooling brand **Secoroc** carried across: Epiroc's own 2025 exploration
> catalogue still names *"the Secoroc RC50"* and *"Secoroc COP45"*
> (`Mineral Exploration Tooling - Catalog.pdf`).

**Product-family conventions worth imitating structurally (never copying):**
- **`COP`** — rock drills and DTH hammers, historically the Atlas Copco prefix,
  now Epiroc's (`Epiroc DTH product catalog.pdf`).
- **`DHD`** and **`QL`** — DTH hammer and **bit-shank** families that are now
  effectively industry-standard patterns rather than brand marks (§B.4).
- **`QLX`** — a higher-pressure derivative of QL, rated **6–35 bar** against the
  QL's **6–24/25 bar**, with an "Air Select System" for adaptability
  (`Epiroc DTH product catalog.pdf`).

**Game-design read.** *The rename is a mechanic.* A shop that shows the same part
under a legacy badge and a current badge — and tells the player they are the same
interface — is exactly the "OEM cross-reference" feature `PLATFORM_TRUTH.md` Part A
already describes as a real iMarket capability. **Epiroc/Atlas Copco is the perfect
in-fiction justification for it.**

## A.2 Sandvik

**Who.** Swedish engineering group, *"founded Sandvik in 1862"* by Göran Fredrik
Göransson (`top-hammer-drilling-tools-broshure-english.pdf`, opening spread). The
same document dates the company's decisive product step: *"A major breakthrough
for us here at Sandvik was the integral steel in the late 1940's"*, based on
*"the new revolutionary material cemented carbide."*

**Segment they own.** Everything percussive and rotary in rock: top hammer tools,
DTH tools, rotary blasthole, plus the rigs. Their top-hammer catalogue is
structured by *application*, which is itself the right shop taxonomy:
**Small hole drilling · Drifting and tunneling · Bench drilling · Long hole
drilling · Shank adapters · Auxiliary tools** (same PDF, contents page).

**Three technical claims from their own catalogue that are genuinely useful:**

1. **MF (male–female) rods vs separate coupling sleeves.** *"A drill string with
   MF-rods offers stiffer connections due to the **50 % reduction in thread play**
   compared to a separate coupling sleeve. Drilling with a stiffer rod package
   results in improved hole straightness."* → **a sourced straightness upgrade.**
2. **Bigger thread = stiffer string.** *"Compared with T51 rods, the **40 % larger
   rod cross-section** of the GT60 rods provides **65 % higher bending stiffness**
   … This means that both drill-rod and shank adapter life can be doubled."*
3. **Top hammer vs DTH, measured.** A site demonstration in granite, 20 m holes at
   15°, 115 mm bits: *"Fuel consumption for the Sandvik DP1100 rig was
   **42 liters/h**, while the DTH drill worked out at **78 liters/h**."* And the
   GT60 claim: *"double the penetration rate at half the energy consumed compared
   with DTH drilling."*

> ⚠️ Claim 3 is **a manufacturer's own comparative demonstration**, not an
> independent test, and it is scoped to one hole size and rock type. Use the
> *shape* of it — **top hammer is more energy-efficient in its size band, DTH wins
> when the hole gets big or deep** — never the numbers as a general law. Marked
> `VENDOR CLAIM` in §F.

**Two heat treatments, and they are a real product split** (same PDF):
**carburisation** (case hardening in carbon-rich gas; *"Used for rods in
underground applications in areas where corrosion is major problem"*) versus
**induction surface hardening** of the thread (*"Primarily used for rods in
surface drilling applications"*). **Underground and surface rods are different
parts.** That is a clean, sourced, non-obvious shop facet.

## A.3 Furukawa Rock Drill (Japan)

**Who.** The rock-drill arm of Furukawa Co., Ltd., which *"was founded in 1875
when it began operation of the Kusakura Copper Mine"*
(https://www.furukawa-rockdrill.com/company/history/). The company *"developed an
original rock drill that could accommodate the physique of Japanese operators in
1914"*. **Furukawa Rock Drill Co., Ltd. in its present form dates from 2005**, when
the rock-drill manufacturing works of Furukawa Co. were merged (ibid.).

**Why they matter here.** Two firsts, both relevant: *"In 1976 Furukawa developed
their first hydraulic breaker"* and *"In 1977, they developed **Japan's first
hydraulic crawler drill**"* (ibid.). Their **`HD` drifter series** (HD150 → HD836)
is one of the three or four drifter families that a third-party shank adapter
maker must cut for — see §B.3.2, where the `Top_Hammer_Tools.pdf` cross-reference
lists Furukawa alongside Epiroc, Montabert, Sandvik/Tamrock and Ingersoll Rand.

**Naming convention.** `HD` + a number that scales with drifter size; the number
correlates with the available shank thread (§B.3.2) — **HD150/HD190 take R38/T38,
HD712/HD836 take T45/T51.** *Capability-encoded, like KLEMM's `KD`/`KH` in pack 11
§F.1.*

## A.4 Montabert (France)

**Who.** *"Joannes Montabert founds Montabert S.A. in Lyon, France, as a
manufacturer of pneumatic equipment"* in **1921**; headquarters now
**203 route de Grenoble, Saint-Priest, 69800, France**
(https://www.montabert.com/en/company/).

**Why they matter, and it is a genuine milestone.** Montabert *"developed **the
world's first hydraulic Top Hammer drifter**"* in **1970** (ibid.) — and they
invented *"the world's first hydraulic concrete breaker in 1964"* (ibid.). The
entire hydraulic top-hammer segment this file describes descends from that 1970
machine.

**Ownership.** *"Komatsu Mining Corp has owned Montabert since 2017"* (ibid.).

> ⚠️ Secondary sources disagree on the route: one M&A database records a Komatsu
> Mining Corp acquisition dated 2015-06-01, and trade press records Doosan selling
> Montabert for **USD 124 million** to Joy Global, with Komatsu subsequently
> acquiring Joy Global. **The company's own page says 2017; use 2017.** The Doosan
> → Joy Global → Komatsu chain is `UNVERIFIED` in detail (§F).

**Drifter families in the shank cross-reference:** `HC 40`, `HC 50`, `HC 80`,
`HC 120` and the older `HC` range take **R32 / R38 / T38** shanks
(`Top_Hammer_Tools.pdf`, Montabert section). The Sandvik catalogue also lists a
**Montabert HC40 (female)** shank — **female-ended shanks are a Montabert
signature and a real compatibility trap** (§B.3.3).

## A.5 Boart Longyear

**Who.** *"An international mineral exploration company founded in 1890 in the
United States"* — and by its own description *"the world's leading provider of
drilling services, orebody-data-collection technology, and … drilling equipment"*
(https://en.wikipedia.org/wiki/Boart_Longyear; https://www.boartlongyear.com/).

**Ownership — get this right, it changed recently.**
**American Industrial Partners Capital Fund VIII, L.P. completed a take-private
acquisition of Boart Longyear Group Ltd on 10 April 2024**, by court-approved plan
of arrangement
(https://www.prnewswire.com/news-releases/american-industrial-partners-completes-take-private-acquisition-of-boart-longyear-302113718.html).
It was previously listed on the ASX (`BLY`).

> ⚠️ **Do not write that Sandvik acquired Boart Longyear.** That claim surfaces in
> search results and is **wrong** — what exists between the two is a trademark
> proceeding, not an acquisition. Corrected here explicitly because the error is
> easy to propagate.

**Why they matter to §B.** Boart Longyear is the reason the **Q-series** wireline
designations (`AQ/BQ/NQ/HQ/PQ`) are in `DOMAIN.md` §4 at all: they are that
family's naming, now used industry-wide alongside the `WL`/`WF` designations
(§B.6). They are also a **drilling contractor**, not only a manufacturer — which
in Drillity terms means they appear on **both** platforms: iMarket (equipment) and
Talent (Drilling Services, `DOMAIN.md` §3 group G).

## A.6 Robit Plc (Finland)

**Who.** *"Robit is a strongly internationalized growth company … selling drilling
consumables for applications in underground and surface mining, construction,
geotechnical and well drilling"*; headquartered in **Lempäälä, Finland**;
*"Robit's shares are listed on NASDAQ Helsinki Ltd."*
(https://www.robitgroup.com/en/company/).

**The structural fact worth stealing.** Robit divides its whole offering into
**exactly three product and application groups: Top Hammer · Down the Hole ·
Geotechnical** (ibid.).

> **That three-way split is the correct top level for the game's rock-tooling
> shop.** It is not arbitrary: **Top Hammer** and **DTH** are two different places
> to put the piston, and **Geotechnical** (casing/overburden systems) is a
> different *job* that borrows from both. `DOMAIN.md` §3 group B already carries
> all three as separate families — Robit's own IA confirms the shape.

## A.7 Mincon Group plc (Ireland)

**Who.** *"Mincon Group plc is a global engineering business specialising in the
design, development, manufacture, and service of rock drilling tools"*,
*"originally founded in **1977 in Shannon, Ireland**"*, now with *"customer service
centres and factories across the Americas; Europe and Middle East; Africa, and
Asia Pacific"* (https://www.mincon.com/about-us/).

**What the local catalogues give.** The **Bluebook 2025** is the single best
published DTH hammer range table found for this file — **3″ to 40″** in one table,
each size against its **shank designation**, hammer OD, tool length, piston weight
and standard backhead (§C.3). The **RC Solutions 2025** brochure gives the RC
hammer family and, crucially, **minimum air package in m³/min at bar** (§C.4).

**A phrase from the Bluebook worth noting for the compatibility system**, repeated
across their overburden and piling systems: *"System is available for all major
shank designs"* and *"available for all major DTH shanks, and in smaller sizes with
top hammer threads."* **A tooling house sells the same system cut for whichever
interface you own — brand is a filter, geometry is the gate** (pack 11 §C.1).

## A.8 Rockmore International

**Who.** *"Rockmore International's roots began in **1948**, with the founding of
… ThrowAway Bit Corporation"*
(https://www.rockmore-intl.com/about-rockmore-international/rockmore-story/).
Manufacturing at **Wilsonville, Oregon, USA** and **Judenburg, Austria**
(https://www.rockmore-intl.com/about-rockmore-international/rockmore-worldwide-rock-drilling-tool-manufacturing/).

**What they make.** *"Drill bits, DTH hammers and bits, extension and tunnelling
rods, integral and tapered rods, **shank adapters** and other drill tool
accessories"* (ibid.) — i.e. a **full-line percussive tooling house that is not a
rig maker.** In shop terms that is the "compatible alternative supplier" tier:
they cut the interface for whoever's machine you own.

> ⚠️ Rockmore's European plant is in **Judenburg, Austria** — **not** Sinsheim,
> Germany. Corrected here because the wrong location appears in secondary search
> results.

## A.9 Numa (USA)

**Who.** Based in **Thompson, Connecticut, USA**; *"For over forty years, Numa has
built a strong legacy of high quality, Made in the USA rock drilling hammers,
bits, and accessories"* (https://nastt.org/2017/04/04/numa-dth-hammers-bits/;
company listings at thedriller.com and trenchlesstechnology.com).

**The number that matters.** Numa states it makes products for *"drilling DTH,
HDD, and reverse circulation holes **3½ to 50½ inches (89 – 1283 mm)** in
diameter"*, split as:

| Class | Hole range |
|---|---|
| Small hammers and bits | **3½″ – 10″ (89 – 254 mm)** |
| Mid-range hammers and bits | **7⅞″ – 20″ (200 – 508 mm)** |
| Reverse circulation | **5¼″ – 36″ (133 – 914 mm)** |

(ibid.) **That 3½″–50½″ span is the honest outer envelope of DTH as a method**,
and it should be the outer edge of the game's DTH tier list.

**`Numa` is also a shank family** (`N125`, `N180`, `N240` appear in the Mincon
Bluebook's shank column) — see §B.4.

## A.10 "Mission" — what it actually is

**This one needs care, because it is a *pattern name*, not a manufacturer the
player can buy from.**

- `DOMAIN.md` §4 lists **Mission** among the DTH shank families, alongside DHD,
  COP, QL, SD and Numa. That is correct usage: **Mission is a shank pattern.**
- Multiple tooling houses sell **"Mission shank" hammers and bits in Mission 40 /
  50 / 60 / 80 sizes** as a generic interface
  (e.g. https://www.sinodrills.com/gse-mission-dth-hammer/,
  https://www.rock-drill-bits.com/sd-mission-shank/).
- Secondary sources associate the pattern's origin with **Driltech Mission** and
  with **Mission Manufacturing**, and describe **SD** shanks as originating with
  **Ingersoll Rand** (https://www.sinodrills.com/dth-bit-shank/,
  https://rankingbit.com/dth-bit/).

> **`UNVERIFIED`: the corporate origin of the Mission shank.** No first-party
> source was reachable. **State it in the game as a shank pattern, never as a
> brand the player buys from.** The same caution applies, less strongly, to `SD`.

## A.11 Bulroc (UK)

**Who.** *"Bulroc are a world leading manufacturer of Down-The-Hole (DTH) rock
drilling equipment with over 45 years of history"*, manufacturing *"right here in
Great Britain"* (distributor listing,
http://www.drillstoreukltd.com/bulroc_hammers.html).

**Range shape.** *"A comprehensive range of DTH hammers, from small diameter low
pressure BR range, to the Hyper high pressure hammers **up to 24″**"*, for
*"mining, quarrying, piling, civil engineering, pole drilling, geothermal and water
well drilling"* (ibid.).

> **That sentence is a capability tier list in one line, and it is the right shape
> for the shop: low-pressure small hammers at the bottom, high-pressure large
> hammers at the top.** Pressure class and diameter class rise together — see
> §C.3, where the same pattern appears independently in the Epiroc and Sandvik
> data.

> ⚠️ Bulroc's exact town could not be confirmed from a first-party page; the
> commonly-cited Sheffield association is `UNVERIFIED` (§F).

## A.12 Halco Rock Tools (UK)

**Who.** *"Halco Rock Tools Ltd is a world class manufacturer of down-the-hole
(DTH) drilling equipment – DTH hammers, drill bits and **casing systems**"*,
headquartered in **Brighouse**, in the north of England, where *"Halco pioneered
the development and distribution of DTH hammers and bits in the 1950's"*
(https://www.halco.uk/). Founding year given as **1948** in company data
(cbinsights company record; treat as `UNVERIFIED` — not first-party).

**Markets served, in their own words:** *"Mining, Construction, Civil Engineering,
Geothermal, Waterwell, Quarry, Oil & Gas and Exploration"* (ibid.) — which maps
almost one-to-one onto `DOMAIN.md` §2's application list.

**Note the casing systems.** Halco, Robit and Mincon all sell **DTH hammers *and*
overburden/casing systems**, which is why `DOMAIN.md` §3 group B files
**Casing & Overburden Tools** next to **DTH Tools**. It is the same customer.

## A.13 Betek / BWH (Germany)

**Who — and the corporate relationship is in the documents.** The tungsten-carbide
catalogue is published under **BWH Bohrwerkzeuge Hoffmann GmbH & Co. KG** with the
imprint **© BETEK GmbH & Co. KG** and `www.betek.de`
(`BETEK_Katalog_Tungsten_carbide.pdf`, cover and colophon). The same document
refers to *"The **SIMON** company group"* and its materials laboratory — i.e.
**Betek and BWH sit inside the Simon group**, and BWH is the drilling-tool arm.

**What they make.** *"Tools … made [of] steel and tungsten carbide, with tungsten
carbide for the wear-resistant tip, and steel for [the body]"*, joined by brazing
(`bwh-betek-katalog-bergbau-mining-en.pdf`, opening). Product families across
their catalogues: **round-shank / point-attack picks** (road milling, trenching,
mining, tunnelling), **carbide inserts for TH and DTH bits**, **tricone/rotary bit
inserts**, **foundation-drilling teeth**, and **TungStuds** fused-carbide wear
protection.

**Why they matter more than their size suggests.** They are a **carbide supplier to
the bit makers**, and their grade table (§B.8) is the clearest published statement
of the hardness-versus-toughness trade-off found for this file. `DOMAIN.md` §6
already lists Betek in the fits-rig brand set; `DOMAIN.md` §3 group B lists
**Ground-Engaging & Cutting Wear Tools** (round-shank/point-attack picks, flat
picks, weld-on teeth, plug-in teeth, tool holders, retention rings) as its own
family — that family *is* Betek's catalogue.

## A.14 Kennametal (USA)

**Who.** Founded **1938** by **Philip M. McKenna** in **Latrobe, Pennsylvania**,
on his invention of a **tungsten-titanium carbide alloy** for cutting tools
(https://en.wikipedia.org/wiki/Kennametal;
https://www.kennametal.com/us/en/news/122485.html). Now *"an American
manufacturer of high-performance cutting tools and engineered components used in
the aerospace, defense, transportation and oil and gas drilling industries"*
(ibid.).

**Role in this file.** The other half of the ground-engaging-tools duopoly with
Betek in `DOMAIN.md` §6 — conical/point-attack tools, tool holders and wear
protection for road milling, mining, trenching and foundation drilling.

## A.15 Element Six (De Beers Group)

**Who.** *"Element Six, part of De Beers Group, designs, develops and produces
**synthetic diamond and tungsten carbide supermaterials**"*
(https://www.e6.com/). The lineage: *"In 1956 De Beers established a research group
called the Adamant Research Laboratory to produce synthetic diamond"*
(https://www.debeersgroup.com/our-business/synthetics-diamonds).

**What they supply into drilling.**
- **PDC — polycrystalline diamond compact cutters** for oil & gas rotary bits
  (https://www.e6.com/en/products/oil-and-gas). This is the material behind the
  PDC bit already costed in `research/01-oil-gas.md` §B.5 (**5–15× a tricone**).
- **PDI — Percussive Diamond Inserts**, launched **April 2013**, applying
  polycrystalline diamond to *percussive* (top hammer / DTH) inserts
  (https://www.debeersgroup.com/news-insights/business-market/archive/element-six-wins-mining-magazines-2013-award-for-3-d-percussive-diamond-inserts).

> **PDI is the interesting one for the game.** It puts a diamond tier *above*
> tungsten carbide **in percussive drilling**, which is otherwise a
> carbide-only world (§B.8). That is a legitimate top-of-tree consumable upgrade:
> very expensive, much longer life, and it only pays back in hard abrasive rock.

## A.16 Fordia — now inside Epiroc

**What happened.** Epiroc announced the acquisition of **Fordia Group Inc.**,
Montreal, on **23 October 2018** and **completed it on 3 January 2019**
(https://www.epirocgroup.com/en/media/corporate-press-releases/2019/20190103_epiroc_completes_acquisition_of_canadian_exploration_tools_manufacturer).
Fordia provides *"exploration drilling tools such as diamond bits, down-the-hole
tools, drill rods and drill casings, as well as water treatment systems and
pumps"*, had **~250 employees** and **~CAD 85 million** revenue for the 12 months
to September 2018, and **became part of Epiroc's Rock Drilling Tools division,
still based in Montreal** (ibid.).

**Confirmed locally.** `Mineral Exploration Tooling - Catalog.pdf` is published by
**Epiroc Drilling Tools (© 2025)** and its diamond-tool section is headed
**"Fordia Diamond Tools"**, listing the core-bit lines **LEGENDS, HERO, HERO
Abrasive, ROCKSTAR, T XTREME** and the **VIKING** series. So **Fordia survives as a
product brand inside Epiroc** — the same pattern as Secoroc (§A.1).

**Game-design read.** Two acquisitions, two different outcomes for the badge
(Atlas Copco → Epiroc renamed everything; Fordia → Epiroc kept the name as a
product line). **A shop that models "brand ≠ maker" needs both cases**, and here
they are, both real.

## A.17 The TBM builders — Herrenknecht, Robbins, Terratec

These belong to `DOMAIN.md` §1 `microtunnelling` / tunnelling rather than to rock
tooling, and **Herrenknecht is already documented in
`research/11-oem-anchor-geotech-hdd.md` §A.17** — not repeated here. The two
additions:

**The Robbins Company (USA).** *"The world's foremost developer and manufacturer of
advanced, underground construction machinery with nearly 70 years of innovation
and experience"* (https://www.robbinstbm.com/about/). **Ownership changed in
2021**: *"Global TBM Company, newly established by long-time Robbins President Lok
Home, purchased all the assets of The Robbins Company while retaining the Robbins
name"* (ibid.).

**Terratec.** *"Incorporated in 1990"*, designing and manufacturing TBMs *"for all
ground conditions and diameters ranging from **0.60 to over 16 meters**"*
(https://terratec.co/profile/). **Since 2018 part of JIM Technology Group**, owned
by **IHI Corporation, Mitsubishi Heavy Industries and JFE Engineering**
(ibid., and https://www.tunneltalk.com/Company-News-TBM-manufacturer-Terratec-celebrates-25th-anniversary.php).

> **The 0.60 m to 16 m diameter span is the useful number.** It is the full
> envelope of "a machine that bores a tunnel", from a microtunnelling pipe-jacking
> head to a road tunnel — and `DOMAIN.md` §3 group A already separates
> **Microtunnelling & Pipe Jacking** from **Tunneling & Underground (Jumbos, TBM
> Cutters, …)**, which is exactly where that span divides.

---

# §B. THE THREAD AND SHANK REFERENCE

**This is the deliverable.** The garage screen enforces compatibility and prints a
message to the player. Everything below is what those messages must be built on.

## B.1 The governing principle — three gates, in order

`research/11-oem-anchor-geotech-hdd.md` §C.1 states the rule and it is unchanged:

> **A part fits a machine when the physical interface matches — not when the brand
> matches, and never when the model name matches.**

For percussive rock tooling the interface check is **three gates in series**, and
the player must fail at the first one that fails, with the right message:

| Gate | Question | If it fails |
|---|---|---|
| **1. Segment** | Is this even the same family of connection? (percussion vs DTH shank vs wireline vs API rotary vs HDD) | *"These are different systems. A DTH bit does not thread onto a drill rod."* |
| **2. Series** | Same series within the family? (R vs T vs H vs GT; DHD vs QL vs SD vs Mission) | *"R38 and T38 are both 38 mm and they will not mate."* |
| **3. Size, hand and gender** | Same number, same hand (LH/RH), correct box/pin? | *"H64 LH pin is not H64 RH pin."* |

**A fourth gate exists on the machine side and it is easy to forget:** the drifter
or hammer itself. A shank adapter is cut **for a named rock-drill family** or **for
a named shaft diameter** (§B.3). Owning the right thread does not mean owning the
right shank.

## B.2 Top-hammer threads

### B.2.1 R versus T — what actually differs

| | **R — "rope" thread** | **T — trapezoidal thread** |
|---|---|---|
| Profile | *"a rounded thread profile originally designed for lighter percussion loads"* | *"a trapezoidal profile that distributes impact stress more evenly across the thread flanks"* |
| Sizes | R25 · R28 · R32 · R38 · R44 · R51 (plus small R22 / R23) | T38 · T45 · T51 · T60 · GT60 · T76 – T127 (plus T35) |
| Designed for | smaller drills, lighter blow energy, smaller holes | *"higher torque transfer and larger hole diameters"* |
| Behaviour | uncouples easily; can over-tighten under high torque | *"resists over-tightening and keeps energy transfer efficient across long drill strings — which is why the T series scales where the R series stops"*; *"better uncoupling characteristics and tend to maintain tighter joints"* |
| Fatigue | shorter joint life under sustained high-impact drilling | *"longer fatigue life under sustained high-impact drilling"* |

Sources: https://www.rock-drillbits.com/knowledge/drill-rod-sizes and
https://www.litechtools.com/t38-vs-t45-vs-t51-drill-rod-how-to-choose.html
(both also cited in `research/11-oem-anchor-geotech-hdd.md` §C.2, which this
section extends rather than replaces).

**The sentence the game's warning must paraphrase, verbatim from the source:**

> *"Never mix thread types within a single drill string — **a T38 rod will not
> properly engage an R38-threaded shank adapter or coupling sleeve, even though
> both rods share the same 38 mm nominal diameter**."*
> — https://www.rock-drillbits.com/knowledge/drill-rod-sizes

and, from the same family of sources:

> *"Drill rod thread type must match the shank adapter **and** bit thread on the
> existing drilling system, since **threads are not interchangeable across
> series**. Mismatched threads cause incomplete engagement, energy loss, and rapid
> wear on both components."*

### B.2.2 The number IS the nominal thread diameter in millimetres

**This is fully sourced and it is the single most useful decode in the file.** The
Sandvik top-hammer catalogue prints the imperial equivalent next to every thread
heading (`top-hammer-drilling-tools-broshure-english.pdf`, section headings):

| Designation | Sandvik's own imperial | = mm | Check |
|---|---|---|---|
| R22 | 7/8″ | 22.2 | ✓ |
| R23 | 29/32″ | 23.0 | ✓ |
| R25 | 1″ | 25.4 | ✓ |
| R32 | 1 1/4″ | 31.8 | ✓ |
| T35 | 1 3/8″ | 34.9 | ✓ |
| T38 | 1 1/2″ | 38.1 | ✓ |
| T45 | 1 3/4″ | 44.5 | ✓ |
| T51 | 2″ | 50.8 | ✓ |

> **Rule for the game: in R/T/GT/ST/H designations the number is the nominal
> thread diameter in mm.** R38 and T38 are the same 38 mm — *which is exactly why
> the mismatch is dangerous and why the warning message has to exist.*

### B.2.3 Thread → hole diameter, measured off two independent sources

**From the Sandvik catalogue's own bit tables** (every bit diameter listed under
each thread heading, `top-hammer-drilling-tools-broshure-english.pdf`):

| Thread | Bit diameters actually offered | Application section |
|---|---|---|
| **R32** | **43 · 45 · 48 · 51 · 54 · 57 · 64 · 76 mm** | drifting & tunnelling, and bench drilling |
| **T38** | **64 · 70 · 76 · 89 mm** | bench and long-hole |
| **T45** | **70 · 76 · 89 · 102 mm** | bench and long-hole |
| **T51** | **89 · 102 · 115 · 127 mm** | bench and long-hole |
| **GT60** | **92 · 96 · 102 · 115 · 127 · 140 · 152 mm** | bench and long-hole |

**From an independent trade reference** (https://www.rock-drillbits.com/knowledge/drill-rod-sizes):

| Rod | Rod Ø | Hole range | Application label |
|---|---|---|---|
| R32 | 32 mm | **33–45 mm** | "Light/shallow drilling" |
| R38 | 38 mm | **45–64 mm** | "Medium benching" |
| T38 | 38 mm | **64–89 mm** | "Standard production" |
| T45 | 45 mm | **76–102 mm** | "Deep benching" |
| T51 | 51 mm | **89–127 mm** | "Large production" |
| ST58 | 58 mm | **102–152 mm** | "Deep, high-volume" |

**The two agree on T38, T45 and T51 almost exactly, and disagree on R32 — and the
disagreement is informative, not an error.** Sandvik lists R32 bits up to 76 mm
because R32 is used for **drifting and tunnelling** (short holes, a jumbo, a
supported drill string) as well as light bench work; the trade reference is
describing R32 in **surface bench** service, where the practical ceiling is much
lower.

> **Design consequence: the same thread has a different sensible hole range in a
> different application.** The shop should filter on **thread × application**, not
> thread alone. `DOMAIN.md` §3 already splits Top Hammer Tools by function and
> `DOMAIN.md` §2 already carries the applications — the facet exists.

**The overall envelope, sourced:** Sandvik describes its threaded button-bit range
as *"An exceptionally versatile series of threaded button bits from **28–152 mm**
in diameter"* (same PDF). **28 mm to 152 mm is top hammer's whole world.**

### B.2.4 GT60 and the large threads

**GT60 is a distinct step, not just the next size.** From the Sandvik catalogue:

- *"The **Ø 60 mm rod cross-section** is optimized for high-energy transfer of
  impact power in top hammer drilling of **Ø 92 to 152 mm holes**."*
- *"Compared with 51 mm rods, the **40 % larger cross-section** and **65 % higher
  bending stiffness** permit faster penetration rates and straighter holes."*
- *"Sandvik GT60 enables drilling of holes **down to 92 mm**. By using a GT60 tool
  system when drilling the typical **T51 hole size (102 mm)**, hole straightness
  can be greatly improved."*
- *"Male and female (MF) threads minimize energy losses and simplify handling"* and
  GT60 is *"perfectly suitable for automatic rod handling systems."*

> **That is a purchasable upgrade with a sourced, non-obvious benefit: the same
> 102 mm hole, drilled straighter, because the string is stiffer.** In a game that
> grades on straightness (`GAMEDESIGN.md` §2) this is a real decision, and it is
> the answer to "why would I buy a bigger thread for the same hole?"

**T76 – T127** (`DOMAIN.md` §4) sit above GT60 and belong to tube/casing and very
large hole work. Pack 11 found **T76 KSB RH box** offered on a **Ø100 mm drifter
shaft** as a **direct rod thread with no H-shank** — i.e. at that size the drifter
drives the rod thread directly. **ST58 and ST68** appear as their own sections in
the Sandvik catalogue index, between T51 and GT60 in capability.

### B.2.5 The H-series — what it is, and a naming collision to watch for

**What H threads are, in the European heavy-drifter world.** From the Eurodrill
shank-adapter matrix read for `research/11-oem-anchor-geotech-hdd.md` §C.2 and
re-verified here (`EURODRILL_DRILLING_ACCESSORIES_BOHRZUBEHOER_2025_26.pdf`),
**H55 / H64 / H66 / H90 / H92 / H112 / H114 are the thread cut on the shank
adapter's rod end for large hydraulic drifters** used in **anchor, micropile,
foundation and heavy production drilling.** They are always listed as **pin**
(male) on the shank, in **LH and RH** variants.

**The gate, restated from pack 11 §C.2 and not contradicted here:**

| Drifter shank **shaft Ø** | H-threads available on that shaft |
|---|---|
| **Ø56** | **H55** (RH pin) |
| **Ø65** | **H55, H64** (LH/RH pin) — also C64 |
| **Ø68** | **H64, H66** — also C-family |
| **Ø95** | **H90, H92** — also C90 |
| **Ø115** | **H112, H114** — also C112 |

> **You cannot put a big shank on a small hammer.** Buying a bigger drifter
> obsoletes your shank adapters — and that should cost the player something
> (pack 11 §F.2).

**`INFERRED` (marked, not asserted):** the H-number tracks the shaft diameter
about 1–3 mm below it (Ø56→H55, Ø65→H64, Ø95→H92, Ø115→H114), which is consistent
with the number being the **nominal thread diameter in mm**, as it is for R and T
(§B.2.2). Plausible and internally consistent, **but not stated in any source
read**. Do not print it as a fact.

**⚠️ The naming collision the implementer must know about.** There is a *second,
unrelated* thing called "H thread" in North American rock drilling: **H-thread
drill steel and H-thread bits for pneumatic sinker/jackleg drills**, sold in bit
sizes around 1½–2½ in
(e.g. https://championchisel.com/drill-steel-rock-bits-whirley-bits/drill-steel-rock-bits/h-thread-drill-stems/).
That is a small, old, air-drill standard and **it is not H55/H64/H90/H112.**

> **Game consequence: if the compatibility warning says "H-series", it must be
> unambiguous which H it means.** Recommended wording for the garage screen:
> *"H-series shank thread (H55–H114) — heavy hydraulic drifters."* Never just "H".

### B.2.6 IB and C — the two families pack 11 surfaced

**IB30 / IB40 / IB52.** Listed in the Eurodrill matrix as shank threads alongside
R and T on the same shafts, normally **LH box**, with **IB52 in both LH and RH,
box and pin**.

**A size mapping, `INFERRED` from the catalogue's own parts structure.** The seal
items are shared and named as pairs: **"sealing IB30 / R32"**, **"sealing IB40 /
R38"**, **"sealing IB52 / R51"** (`EURODRILL_…_2025_26.pdf`). A shared seal implies
a shared sealing diameter, so:

| IB size | Sits alongside |
|---|---|
| IB30 | **R32** |
| IB40 | **R38** |
| IB52 | **R51** |

**Marked `INFERRED`.** It is a strong inference from a first-party parts list, but
the catalogue does not state the equivalence in words. **Useful for laying out the
shop's size ladder; not to be printed as an engineering claim.**

**C64 / C90 / C112.** Appear on exactly the same shafts as H64 / H90 / H112, in
LH/RH pin — **a parallel family at the same sizes**, and therefore **a separate
series that must not be mated with H** (§B.9).

### B.2.7 Male, female, box, pin, hand — the conventions

| Term | Meaning | Where it shows up |
|---|---|---|
| **Pin** | male | shank adapters are usually **pin** on the rod end for H-series; rods are pin at both ends in a coupling-sleeve system |
| **Box** | female | shank adapters for R/T are often **box**; couplings are box at both ends |
| **MF rod** | one male end, one female end — no coupling sleeve | Sandvik MF rods; **50 % less thread play than a separate coupling sleeve → straighter holes** |
| **Coupling sleeve** | a short double-box connector joining two male rod ends | the alternative to MF; a **semi-bridge** sleeve has an unthreaded bridge in the middle so a rod cannot pass through — *"particularly suitable for high-torque drilling rigs"* (https://www.sdkrocktools.com/products/threaded-drilling-tools/drill-rod-coupling-sleeve.html) |
| **LH / RH** | left- and right-hand thread | **separate parts.** The Eurodrill matrix lists LH and RH as distinct items for the same size; **LH is standard on much of this equipment** |
| **Female-ended shank** | a shank adapter with a box rod end | real and drifter-specific — the Sandvik catalogue lists shanks explicitly labelled *"COP 1432 Female"* and *"Montabert HC40 (female)"* |

> **Seven facets make a complete "does it fit" check** for a top-hammer shank
> (pack 11 §C.2, unchanged): **shaft Ø · thread series · size · hand · box/pin ·
> flushing · sealing**, plus a **model-specific flushing bracket**.

## B.3 Shank adapters — which shank fits which rock drill

### B.3.1 There are two different gating rules, for two different worlds

This is the distinction that makes the whole subject confusing, and no single
source states it. **Say it explicitly in the design docs:**

| World | Machines | The gate | Source |
|---|---|---|---|
| **Anchor / micropile / foundation** | Eurodrill RH-/HD- series, KLEMM KD, HÜTTE | **shank shaft diameter** (Ø56/65/68/95/100/110/115), which then offers a menu of threads | pack 11 §C.2, from `EURODRILL_…_2025_26.pdf` |
| **Mining / tunnelling / surface production** | Epiroc COP & BBC/BBE, Furukawa HD, Sandvik HL/HLX/HLR/HF, Montabert HC, Ingersoll Rand YH, Gardner Denver, Secoma, Krupp, Toyo | **the rock-drill model**, which has its own shank geometry and offers a small menu of threads | `Top_Hammer_Tools.pdf` (Mitsubishi Materials), organised by drifter maker; `top-hammer-drilling-tools-broshure-english.pdf` (Sandvik) |

**Both reduce to the same in-game rule** — *the machine decides, the thread is a
sub-choice* — but the **facet you filter on differs**, and a shop that offers
"shaft Ø" for a jumbo drifter will look wrong to anyone who knows the trade.

### B.3.2 Rock-drill family → available shank threads

Read off `Top_Hammer_Tools.pdf` (Mitsubishi Materials Hardmetal, rev. Jun-2024),
whose shank-adapter section is indexed by drifter maker: **Epiroc · Furukawa ·
Gardner Denver · Ingersoll Rand · Montabert · Sandvik/Tamrock · Secoma · Krupp ·
Toyo**. Cross-checked against Sandvik's own shank tables in
`top-hammer-drilling-tools-broshure-english.pdf`. **Part numbers deliberately
omitted** (`DOMAIN.md` §10); only the fit logic is carried across.

**Epiroc / Atlas Copco drifters**

| Drifter family | Shank threads offered |
|---|---|
| BBC 54, BBC 120 | R32 · R38 · T38 |
| BBE 57 | R38 · T38 · T45 |
| COP 125 / 130 / 131 | R32 · T38 |
| COP 1028 | **R28** · R32 |
| COP 1032 | R32 · T38 |
| COP 1036 / 1038 / 1238 (38-series) | R32 · R38 · T38 |
| COP 1036 / 1038 / 1238 (45-series) | R32 · R38 · T38 · **T45** |
| COP 1132, COP RR11 | R32 |
| COP 1432 / 1440 / 1532 / 1550 / 1638 / 1838 / 2238 | R32 · R38 · T38 |
| COP 1838 MUX / HUX | T38 · T45 · **T51** |
| COP 1240 / 1640 / 1840 / 1850 / 2150 / 2550 (+ EX, SC) | T38 · T45 · T51 |
| COP 2160EX / 2560EX | T45 · **GT60** |
| COP 3038 / 4038, COP 4050 family | T45 · T51 |

**Furukawa HD drifters**

| Drifter | Shank threads offered |
|---|---|
| HD 150 · HD 190 · HD 210 | R38 · T38 |
| HD 300 / 609 / 609RP | T38 · T45 |
| HD 612 / 615RP / 709 | T38 · T45 · T51 |
| HD 712 · HD 836 | T45 · T51 (one entry also lists **GT60**) |

**Ingersoll Rand YH drifters**

| Drifter | Shank threads offered |
|---|---|
| YH 50 / 55 / 60A | T38 |
| YH 65 / 70 / 80 | T38 · T45 |
| YH 80A | T45 · T51 |
| YH 95 / 100 (+ RP) | T51 |
| YH 110V / 135 (+ RP) | T45 · T51 |

**Montabert HC drifters** — R32 · R38 · T38 across the HC 40 / HC 50 class; larger
HC 80 / HC 120 continue up the same ladder. **Female-ended shanks are listed for
HC40** (§B.2.7).

**Sandvik HL / HLX / HLR / HF drifters** (from Sandvik's own catalogue)

| Drifter family | Shank threads offered |
|---|---|
| HLX 1 · HL 300 · HL 300S | R23 · R25 · R32 |
| RD 314 | R28 · R32 |
| L400 / L410 / L500 / L510 / L550 | R32 |
| HLR 438L / 438T | R32 · T38 |
| HLR 438LS / 438TS · HL 538 / 538L · L550S | R32 · R38 · T38 |
| HL 500-38 / 510-38 | R32 · T35 · T38 · R38 |
| HL 500-45 / 510-45 | R32 · T35 · T38 · **T45** |
| HL 550 / 560 SUPER · HL 510 S-45 | T35 · R38 · T38 |
| HLX 5 / HLX 5T | R32 · T35 · T38 · R38 · **T45** |
| HFX 5T | T35 · T38 |

**The pattern, and it is the game rule:**

> **Thread size scales with drifter size, monotonically.** Small drills take
> R25–R32. Mid-size take R38/T38. Large take T45/T51. The largest surface drills
> take GT60. **A drifter never offers a thread far above or below its class**, so
> "upgrade the drifter" and "upgrade the string" are the same purchase decision
> made twice — which is exactly the composability mechanic pack 11 §F.2 identified
> for the anchor rigs.

**Cross-brand truth worth stating plainly:** `Top_Hammer_Tools.pdf` is a *third
party* publishing shanks for nine different drifter makers, and EMDE advertise
shanks cut *"for usual drifters"* (pack 11 §C.1). **The aftermarket will make you
the interface for whoever's hammer you own.** In shop terms: an OEM tier and a
compatible tier, at different prices and different reliability — a real,
sourced economic fork.

### B.3.3 What a shank-adapter designation encodes

Structurally (from the Sandvik code key and the Eurodrill matrix; **no part
numbers reproduced**), a shank adapter is fully specified by:

1. **The rock-drill model or shaft Ø it fits** — the hard gate
2. **The rod-end thread** — series + size (R32, T45, H64 …)
3. **Hand** — LH or RH
4. **Gender** — box or pin
5. **Length** in mm — real shanks in the catalogues run roughly **205 mm to
   905 mm** depending on drifter class
6. **Flushing** — a flushing hole of a stated diameter (e.g. **8.5, 10, 12.7, 14,
   14.5, 16 mm** appear in the tables), *or* "SF"/separate flushing, *or* none
7. **Sealing / packing size** — listed as its own dimension (**10, 11, 12.7, 14,
   16, 19, 23 mm** packings appear)
8. **Hardening** — carburised or induction (HF) hardened (§A.2)

**Plus, not on the shank itself:** the **flushing ring and bracket are
model-specific** (pack 11 §C.2). A complete purchase is *shank + flushing ring +
bracket for that machine*.

> **Game read:** eight facets is too many for a mobile UI. Collapse to **three
> visible** (machine · thread · hand) and **let the rest be implied by the
> machine.** But keep the underlying data, because "the seal kit doesn't fit" is a
> genuinely authentic failure and a good late-game annoyance.

## B.4 DTH shanks — a completely different interface

**First, the point that must not blur** (`PLATFORM_TRUTH.md` Part C rule 2 already
insists on it): **a shank adapter is not a DTH shank.**

| | **Top-hammer shank adapter** | **DTH bit shank** |
|---|---|---|
| Where it is | at the **top** of the string, in the drifter | at the **bottom**, inside the hammer |
| What it does | takes the blow from the drifter and passes it into the rod | takes the blow from the hammer piston and passes it into the bit |
| Interface to the machine | shank shaft, splined or keyed, model-specific | **splined shank**, family-specific |
| Interface to the tool | a **thread** (R/T/H/GT) | **no thread at all** — the bit is retained by a retainer ring |
| So it is gated by | drifter model or shaft Ø | **hammer family, and the spline count is visible** |

### B.4.1 The families, and where the names come from

`DOMAIN.md` §4 lists **DHD · COP · QL · SD · Mission · Numa**. Reported origins
(secondary sources; treat the corporate attributions as `UNVERIFIED`):

| Family | Reported origin | Note |
|---|---|---|
| **DHD** | Ingersoll-Rand lineage | now an industry-standard pattern; Epiroc publishes DHD shanks for its own hammers |
| **COP** | Atlas Copco → Epiroc | `COP M6/M7/M8` are current, *hammer-specific* shanks |
| **QL** | Ingersoll-Rand lineage | `QL 40/50/60/80/120`; Epiroc's current mainline |
| **SD** | Ingersoll Rand / Sandvik lineage | `SD4 … SD15`; also appears in the Mincon range (`SD10`) |
| **Mission** | Driltech Mission / Mission Manufacturing (**`UNVERIFIED`**) | `Mission 40/50/60/80`; **a pattern, not a shop brand** (§A.10) |
| **Numa** | Numa Tool Co. | `N125 / N180 / N240` appear as shank designations in the Mincon range |
| **TD / MQ / MC / MR** | Sandvik (`TD`), Mincon (`MQ`, `MC`, `MR`) | modern additions to the same idea |

Sources: https://www.sinodrills.com/dth-bit-shank/, https://rankingbit.com/dth-bit/,
`Epiroc DTH product catalog.pdf`, `Mincon-Bluebook-2025-WEB.pdf`.

### B.4.2 The cross-reference that actually settles it

**This is the single most valuable table in the file**, because it is a *first-party
OEM* statement of which hammers share a bit shank. From
`Epiroc DTH product catalog.pdf`, "Bit shanks and drill bits":

| Bit shank | Hammers that take it (Epiroc's own list) | Splines | Shank length |
|---|---|---|---|
| **BR2** | COP 20 | **6** | 165 mm (6.50″) |
| **DHD 3.5** | DHD 3.5 · COP 35 · TD 35.2 · QLX 35 | **8** | 180.9 mm (7.12″) |
| **TD 40** | COP 44 Gold · COP W4 2.0 · QLX 40 | **12** | 209 mm (8.23″) |
| **DHD 340 / 340A** | COP 44 STD · DHD 4 · QL 340 | **8** | 209 mm (8.23″) |
| **DHD 350R** | COP 54 STD · DHD 5 | **8** | 260 mm (10.24″) |
| **QL 50** | QL 50/55 · QL 50.2/55.2 · QLX 50/55 · TD 50 · COP 54 Gold | **12** | 239.6 mm (9.43″) |
| **COP M6** | COP M6 | **12** | 225 mm (8.86″) |
| **DHD 360** | COP 64 STD · DHD 6 | **8** | 308 mm (12.13″) |
| **QL 60** | QL 60/65 · QLX 60/65 · TD 60/65/70 · COP 64 Gold | **12** | 253.3 mm (9.97″) |
| **COP M7** | COP M7 | **12** | 303 mm (11.93″) |
| **COP M8** | COP M8 | **12** | 303 mm (11.93″) |
| **DHD 380** | DHD 380 · DHD 8 | **10** | 350 mm (13.78″) |
| **QL 80** | QL 80/85 · TD 80/85 | **16** | 332 mm (13.07″) |

**Read three things off that table:**

1. **Hammers from different product lines genuinely do share a bit shank.**
   `COP 44 STD`, `DHD 4` and `QL 340` are three differently-badged hammers that all
   take the **DHD 340** bit. **This is the honest basis for an "OEM
   cross-reference" feature in the shop** (`PLATFORM_TRUTH.md` Part A).
2. **A badge is not a family.** `COP 44 STD` takes a **DHD 340** shank; `COP 44
   Gold` takes a **TD 40** shank. **Same number, same brand, different bit.** That
   is the DTH equivalent of pack 11's Vermeer `D24x40 S3` case, and it is the best
   possible argument for keying compatibility off interfaces rather than names.
3. **The spline count is the visible gate: 6 · 8 · 10 · 12 · 16.** A player can be
   shown the splines. *Six-spline bit, eight-spline hammer, no.* That is a
   diegetic, instantly readable compatibility check and it needs no text.

### B.4.3 Are DTH shanks interchangeable? — the answer, stated plainly

> **Within a shank family: yes, across brands.** Epiroc's own list above proves it.
>
> **Across shank families: no.** *"Different shank types are not interchangeable —
> you must match the shank type to your hammer … using an incompatible shank will
> lead to poor energy transfer, premature wear on both the bit and hammer, and
> potential equipment damage"*
> (https://rankingbit.com/dth-bit/, corroborated by
> https://www.sinodrills.com/dth-bit-shank/). The spline counts in §B.4.2 make it
> mechanically obvious.

**And note what "compatible" does *not* mean.** A `DHD 340` bit fits a `QL 340`
hammer, but the two hammers are still different machines with different air
appetites (§C.3). **Fit is not equivalence.**

### B.4.4 RC shanks are a separate family again

Reverse-circulation hammers do **not** use DTH bit shanks. From
`Mincon-RC-Solutions-2025-A4-WEB.pdf`, the MRXT range's **drill bit shank types**
are:

| Hammer | Hammer OD | Bit shank type |
|---|---|---|
| MRXT 82 | 82 mm (3.23″) | **3″ Remet** |
| MRXT 92 | 92 mm (3.62″) | **3.5″ Remet** |
| MRXT 109 | 109 mm (4.3″) | **4″ Metzke** |
| MRXT 116 | 116 mm (4.5″) | **MR116** |
| MRXT 120 | 120 mm (4.7″) | **MR120** |
| MRXT 132 | 132 mm (5.2″) | **4.5″ Remet** |

and the same brochure names the thread options as **"ARDX, Remet, and Metzke
threads"**, with the hammer carrying **an adapter sub**.

> **`Remet` / `Metzke` / `ARDX` / `MR` are a fourth percussion interface family**,
> beside top-hammer threads, DTH shanks and wireline. `DOMAIN.md` §4 does not list
> them. **Recommend adding them** — RC is already in the taxonomy (§3 group B,
> "RC/Dual-Wall" drill string) and the game's prospecting pack uses RC heavily.

### B.4.5 The other end of the hammer: the backhead is API REG

A DTH hammer has **two** interfaces, and only one of them is a shank:

- **Bottom:** the splined **bit shank** (§B.4.2). No thread.
- **Top (backhead / top sub):** a **rotary-shouldered thread to the drill pipe**,
  and in practice that is **API REG**.

Twice sourced, from two OEMs independently:

| Hammer size | Backhead connection | Sources |
|---|---|---|
| **2″** | RD 50-6 box | `Epiroc DTH product catalog.pdf` (COP 20) |
| **3½″ – 4″** | **API 2⅜ REG pin** (alt. **Cubex #21 / #24 pin**) | Epiroc (COP 35, QL 340, QLX 35/40); Sandvik `dth_catalog_…2023.pdf` (RH560 3.5″/4″); Mincon Bluebook (3″ class) |
| **5″ – 6″** | **API 3½ REG pin** (alt. **Cubex #24 / #28 pin**, **BECO 3½ pin**) | Epiroc (QL 50.2, QL 60, QLX 50/60); Sandvik (RH560 5″/6″); Mincon |
| **8″** | **API 4½ REG pin** (alt. **BECO 4 / 4½ / 5¼ pin**) | Epiroc (QL 80, TD 80/90) |
| **9″** | **5¼″ BECO pin** | Sandvik (RH560 9″) |
| **10″ and up** | larger REG sizes, then **hex and proprietary** (e.g. INTG, HEX-series) | `Mincon-Bluebook-2025-WEB.pdf` — **column alignment in the extracted table is ambiguous above 8″; verify before use** (`UNVERIFIED`, §F) |

> **This is a genuine cross-segment link and the game should use it.** `API REG` is
> the *same* rotary-shouldered connection family as the oil-field bit connection
> (§B.7, and `research/01-oil-gas.md` §C.2.2, where the real jack-up's top drive
> carries a **6⅝ in REG box**). **A blasthole DTH hammer and an oil rig's top drive
> speak the same thread language, three sizes apart.** Very few facts in this
> project tie two industries together that cleanly.

**BECO and Cubex are the non-API alternatives** at the same sizes — and pack 11 §C.3
already established the rule for exactly this situation: *API is the generic,
cross-brand tier; proprietary threads are the brand-locked tier.*

## B.5 Button geometry — four independent axes

Every source treats these as separate choices, and the game should too. **A bit is
specified by all four.**

### Axis 1 — button *shape*

| Shape | When it is used | Source |
|---|---|---|
| **Spherical** | hard and abrasive rock; maximum resistance to breakage | Sandvik TH catalogue (*"Spherical buttons for hard and abrasive formations"* — Epiroc RocketBit description); `Epiroc DTH product catalog.pdf` |
| **Ballistic** (pointed) | soft to medium-hard, less abrasive rock; higher penetration rate | *"Ballistic buttons for soft formations"* (Epiroc); *"Ballistic buttons in front. For higher productivity"* (Epiroc SpeedBit) |
| **Semi-ballistic** | the intermediate; common on the front row with spherical gauge | Epiroc DTH bit tables |
| **Conical** | offered as a third option alongside spherical and ballistic | Sandvik: *"all the best button shapes (spherical, conical or ballistic)"* |

> **The trade is exactly the carbide trade in geometry form: a ballistic button
> penetrates faster and breaks sooner; a spherical button survives.** Same rock,
> two answers, and the right one depends on hardness *and* abrasiveness — which
> are two different properties (§B.8).

### Axis 2 — button *position*: gauge, front, inner

- **Gauge buttons** sit on the outer edge and **cut the hole diameter**. Sandvik:
  *"The gauge buttons of a drill bit are exposed to axial forces … **When the bit
  wears, the load angle changes and the risk for button breakage increases.**"*
  **Gauge wear is what ends a bit's life *as a bit of that size*** — a worn-gauge
  bit drills an undersized hole and the next bit will not follow it.
- **Front / face buttons** do the breaking in the middle.
- **Inner buttons** appear on convex and concave designs as a distinct row.

**Real angles, from the Epiroc DTH bit tables:** gauge buttons are set at **35°**,
inner buttons at **20°**. Button diameters run **10, 12, 16 and 19 mm** across the
sizes, with gauge buttons generally the larger.

**Two named gauge upgrades, sourced** (`Epiroc DTH product catalog.pdf`):
**`HD` = larger gauge buttons**; **`DGR` = double (overlapping) gauge row, only
available from 8″ upward.** *A bigger hole can afford a second row of gauge
protection; a small one cannot.*

### Axis 3 — face *profile*

`Epiroc DTH product catalog.pdf` gives five standard faces with applications —
this is the clearest published statement found:

| Face | Applications | Typical formations |
|---|---|---|
| **Flat front** | *"Hard and abrasive formations, all round"* | granite, hard limestone, basalt |
| **SpeedBit** (ballistic front buttons) | *"Medium hard to hard and abrasive formations. For higher productivity"* | granite, hard limestone, basalt |
| **Convex front, ballistic** | *"Soft to medium hard rock. Non abrasive formations. High penetration rate"* | limestone, hard limestone, shale |
| **Concave front** | *"Medium hard to hard formations. Less abrasive, fractured formations. **Excellent control over hole deviation**"* | granite, hard limestone, basalt |
| **RocketBit** | *"Soft to medium hard formations. For exceptional productivity. Fractured rock"* | limestone, hard limestone |

> **The concave face is the straightness tool.** In a game that grades on
> straightness, "concave face in fractured ground" is a real, sourced, correct
> answer — and it costs penetration rate to get it.

### Axis 4 — skirt / body design

- **Regular skirt** — the default.
- **Retrac skirt** — a stepped, back-reaming body that lets the bit be pulled back
  up through a collapsing or fractured hole. Sandvik lists **"retrac bit"** as its
  own body family across R38, T38, T45, T51 and GT60, in 6-, 8- and 9-gauge-button
  variants, and describes offering *"the required skirt designs (regular or
  retrac) in order to obtain the best bit for the rock formation."*

**And a fifth, top-hammer-only axis: the drifter-bit type family.** Sandvik's
drifting and tunnelling bits come in four numbered designs with published intent
(`top-hammer-drilling-tools-broshure-english.pdf`):

| Type | Design intent |
|---|---|
| **52** | *"maximum bit life in hard and abrasive rock"* |
| **53** | *"All-round design with a good trade off between speed and bit life … hard to medium hard rock"* |
| **54** | *"All-round design with **high penetration rate** for hard to medium hard rock"* |
| **55** | *"maximum penetration rate in softer and less abrasive rock formations"* |

> **That is a four-step life-versus-speed slider, published by the OEM, and it maps
> one-to-one onto a consumable tier list in the shop.**

## B.6 Wireline core — hole diameter AND core diameter

**The two numbers a driller actually needs**, from `Diamond Driller's Technical
Book.pdf` (Epiroc; the book credits W. F. Heinz, *The Diamond Drilling Handbook*):

| Size | **Core Ø** | **Hole Ø** | Rod OD | Rod ID |
|---|---|---|---|---|
| **A** (AQ / AWL) | **27.0 mm** (1.062″) | **48.0 mm** (1.890″) | 44.5 mm (1.750″) | 34.9 mm (1.375″) |
| **B** (BQ / BWL) | **36.5 mm** (1.432″) | **60.0 mm** (2.360″) | 55.6 mm (2.1875″) | 46.0 mm (1.8125″) |
| **N** (NQ / NWL) | **47.6 mm** (1.875″) | **75.7 mm** (2.980″) | 69.9 mm (2.750″) | 60.3 mm (2.375″) |
| **H** (HQ / HWL) | **63.5 mm** (2.500″) | **96.0 mm** (3.782″) | 88.9 mm (3.500″) | 77.8 mm (3.0625″) |
| **P** (PQ / PWL) | **85.0 mm** (3.345″) | **122.6 mm** (4.827″) | 117.5 mm (4.625″) | 103.2 mm (4.0625″) |

The same book gives the **hole-diameter tolerance** the system is cut to, e.g.
**47.88–48.13 mm** for the A-size hole and **59.82–60.07 mm** for B — i.e. **a
quarter of a millimetre.** Wireline is a *precision* fit, not a nominal one.

**Q versus WL — say this once and stop worrying about it.**

> **The letter (A · B · N · H · P) is the size and it is what matters.** It fixes
> both hole and core diameter. The suffix (`Q`, `WL`, `WF`, `WL-U`, `3`, `2`, `TK`)
> names the *system variant*. `DOMAIN.md` §4 already writes it as
> "AQ/BQ/NQ/HQ/PQ (AWL–PWL)" — that is correct.

**Variants that change the core diameter in the same hole** (same book; inch
figures are the source's, mm are conversions):

| Variant | Core Ø | Effect |
|---|---|---|
| **BWL3** (triple tube) | 33.5 mm (1.320″) | smaller core, better recovery in broken ground |
| **NWL3** | 45.1 mm (1.775″) | " |
| **HWL3** | 61.1 mm (2.406″) | " |
| **PWL3** | 83.1 mm (3.270″) | " |
| **NWL2** | 50.5 mm (1.990″) | " |
| **AWLTK** (thick kerf) | 30.5 mm (1.200″) | drilled in a **B-size hole** (59.82–60.07 mm) |
| **BWLTK** | 40.7 mm (1.602″) | drilled in an **N-size hole** (75.57–75.82 mm) |

> **Triple tube costs you core diameter and buys you core recovery. Thick kerf
> costs you a whole size step and buys you wall thickness.** Both are real
> purchasing decisions and both are legible in one number on a shop card.

**The telescoping rule the game must model:** you cannot go *up* a size once you
are in the hole. If the ground caves and you have to case, **PQ becomes HQ becomes
NQ becomes BQ**, and each step costs you core diameter and therefore assay
quality. **That is the core-drilling equivalent of the oil-well casing telescope**
(`research/01-oil-gas.md` §B.6.1) and it is the same decision shape.

**NSK 95 / 122 / 146 / 176 — `UNVERIFIED` as a designation, but the numbers land.**
`DOMAIN.md` §4 lists these alongside the wireline sizes. **No source could be found
for the letters "NSK".** What *was* found is a large-diameter wireline family whose
hole diameters are **96.3 mm (CH), 122.6 mm (CP), 146 mm (CSK) and 176 mm (CSK)**
— i.e. **the four numbers in `DOMAIN.md` are hole diameters in mm, and they match a
real family** (wireline core-barrel overview data; corroborated by the **CSK-146**
system, *"standard borehole diameter of 146 mm and core diameter of 102 mm … the
most employed wire-line system for exploration drillings in mining and
tunneling"*, https://www.tecso-sa.com/en/tecso/csk-146-core-barrel/, and by the
**Geobor-S 146 mm** system, https://tmgmfg.com/downloads/specs-sheet/S-Geobor-wireline-core-barrel.pdf).

> **Recommendation: keep the four numbers, treat them as hole diameters in mm, and
> do not print the letters "NSK" as a system name until a first-party source is
> found.** The one fully sourced pairing in this range is **146 mm hole →
> 102 mm core**.

## B.7 Rotary and oil-field connections — API REG, IF, FH, NC

**These are rotary-shouldered connections, governed by API Spec 7-2**
(*Threading and Gauging of Rotary Shouldered Thread Connections*,
https://www.api.org/~/media/Files/Publications/Addenda-and-Errata/exploration-production/7_2_Add_1.pdf;
overview at https://standards.globalspec.com/std/14214867/api-spec-7-2).

| Family | What it is | Status |
|---|---|---|
| **NC — Numbered Connection** | *"The size designation is a two digit number indicating the **pitch diameter of the pin member at the gage point**"*; uses the **V-0.038R** thread form (0.065″ flat crest, 0.038″ rounded root) | **The preferred modern family.** API Spec 7-2 *"treats NC23 through NC70 as preferred connections."* |
| **IF — Internal Flush** | *"designed so that the internal diameter of the pipe and the joint are the same, minimizing turbulence and pressure drop of the drilling fluid"*; V-0.065 form | **Obsolescent** — *"All API IF and FH connections are now considered obsolescent"* (https://www.threadcheck.com/blog/obsolescence-rotary-shouldered-connections) |
| **FH — Full Hole** | large-bore connection; the 4 in FH uses the V-0.065 form | **Obsolescent**, same source |
| **REG — Regular** | small, tapered, strong for its size; ID reduced at the joint | **Very much alive** — *"REG persists because it is compact, strong for its size, and already cut on much existing equipment, **including many bit connections and drill collars**"* (https://imexcanada.com/drill-pipe-thread-types-tool-joint-connections/) |

**The equivalence table — this is the practically useful part**, from the same
source:

| NC | Interchangeable older designations | Form | TPI | Taper |
|---|---|---|---|---|
| **NC26** | 2⅜ IF · 2⅞ SH | V-038R | 4 | 2 |
| **NC31** | 2⅞ IF · 3½ SH | V-038R | 4 | 2 |
| **NC38** | 3½ IF · 4½ SH | V-038R | 4 | 2 |
| **NC40** | 4 FH · 4½ DSL | V-038R | 4 | 2 |
| **NC46** | 4 IF · 4½ XH · 4 WO | V-038R | 4 | 2 |
| **NC50** | 4½ IF · 5 XH · 5½ DSL · 4½ WO | V-038R | 4 | 2 |

> **Game rule, and it is genuinely satisfying: `NC` and `IF`/`FH` are the *same
> connections under two naming systems*.** An `NC50` box **is** a `4½ IF` box. So
> the shop's cross-reference feature has a real, standards-backed example to work
> with — *"this listing says 4½ IF; you own NC50; they are the same part."* That is
> exactly the OEM cross-reference capability `PLATFORM_TRUTH.md` Part A describes,
> and here it is true rather than decorative.

**Where each shows up in this project:**
- **API REG** — DTH hammer backheads (§B.4.5), oil-field **bit** connections and
  drill collars, and the top drive on the real jack-up (**6⅝ in REG box**,
  `research/01-oil-gas.md` §C.2.6). Also in `DOMAIN.md` §4 under both **Rotary /
  Kelly** (API REG 2⅜/3½) and **HDD**.
- **NC / IF / FH** — drill pipe tool joints. `DOMAIN.md` §4 lists them under HDD;
  they belong equally to oil & gas (`research/01-oil-gas.md` §B.5: *"tool joints
  are rotary shouldered connections — box-and-pin with a torque shoulder, tapered,
  coarse pitch (4–5 TPI)"*, which the table above confirms at **4 TPI**).

## B.8 Carbide grades — what varies, and the trade-off

**Two things vary, and only two: the cobalt binder fraction and the grain size.**
Everything else follows.

From `BETEK_Katalog_Tungsten_carbide.pdf` (BWH / BETEK, index 4, 04.2025), the
published grade table — **the clearest statement of the trade-off found for this
file**:

| Grain class | WC : Co | Density (g/cm³) | Hardness HV10 | Recommended for |
|---|---|---|---|---|
| **Fine** (3–5 µm) | **94 : 6** | 14.90 – 14.95 | **1400 – 1535** | **DTH and top-hammer bits** for mining, water well, construction and oil drilling; overburden drill bits and drill rods; VSI rotor tips |
| **Middle** (4–7 µm) | 92.5 : 7.5 | 14.75 | 1350 | tricone / rotary bits for mining and oil drilling; mineral processing |
| | 90.5 : 9.5 | 14.50 | 1200 | " |
| | 90 : 10 | 14.40 | 1200 ± 100 | **tricone / rotary bits** — grade "B25", *"suitable for soft, medium and hard rock in mining construction, oil drilling, HDD and water well drilling"* |
| | 89 : 11 | — | — | grade "B30", *"suitable for very hard rock, especially for use in iron ore extraction"* |
| | 87 : 13 | 14.20 | 1110 | shredder tools, HDD, tunnelling |
| | 85 : 15 | 14.00 | 1030 – 1100 | **round-shank cutter bits** for tunnelling, mining, vertical drilling, trenching |
| | 82 : 18 | 14.00 | 960 | road milling for asphalt and concrete |
| | 80 : 20 | 14.00 | **900** | stone-splitting tools, sizer and crusher teeth |
| **Coarse** (20–25 µm) | 94 : 6 | 14.90 | 1180 | — |
| | 91.5 : 8.5 | 14.65 | 1050 | — |
| | 90.5 : 9.5 | 14.55 | 1020 | — |
| | 85 : 15 | 14.00 | 900 | — |

**The law, in one paragraph, and every number above obeys it:**

> **More cobalt = tougher and softer. Less cobalt = harder and more brittle.**
> Going from **6 % to 20 % cobalt** drops hardness from **~1535 to ~900 HV10** and
> density from **14.95 to 14.00 g/cm³**. **Coarser grain at the same binder is also
> softer**: 6 % Co is 1400–1535 HV fine-grained but only **1180 HV** coarse-grained.
> And the catalogue's own framing: *"Carbide must have high wear resistance but
> also have sufficient toughness. **Every application requires a different ratio of
> hardness and toughness.**"*

**Read the application column and the physics is obvious:**

| The tool takes… | so it needs… | and the grades land at… |
|---|---|---|
| **abrasion** (rock sliding past carbide) — rock bits | **hardness** | **6 % Co, fine grain, 1400–1535 HV** |
| **impact** (repeated blows, edges, foreign objects) — road milling picks, crusher teeth | **toughness** | **15–20 % Co, 900–1030 HV** |
| both, in the middle — tricone inserts | a compromise | **10–11 % Co, ~1200 HV** |

> **This is the "wear vs breakage" trade-off, fully sourced, with real numbers, on
> two axes.** For the game it is the cleanest possible consumable stat pair:
> **a hardness number and a toughness number that move in opposite directions**,
> with the right choice set by **rock hardness *and* rock abrasiveness** — two
> separate ground properties, exactly as the core-bit guide insists for diamond
> tools (§C.8).

**The corroborating fact from the other side of the industry**: Sandvik describes a
new-generation grade as having *"gained greater density and a more homogenous
structure. **Toughness has been increased without compromising the exceedingly
high wear resistance** — making the material stronger, without sacrificing its
hardness"* (`top-hammer-drilling-tools-broshure-english.pdf`). **That is the whole
research programme of the industry in one sentence: move the curve, because you
cannot cheat the trade-off along it.** In game terms, **a premium grade is not a
higher number on one axis — it is a better *pair*.**

**And the tier above carbide:** Element Six's **Percussive Diamond Inserts**
(§A.15) put polycrystalline diamond into percussive bits — a real, expensive top
tier that only pays back in hard abrasive rock.

**Note on grade codes.** Every manufacturer uses its own grade names (Sandvik
prints `XT48`, `DP55`, `DP65`, `411`, `442` in its bit code key; BWH prints
`B-10-F`, `B-25`, `B-30`, `B-40-G`). **Do not put a real grade code in the game.**
Use the physical pair — **% binder and grain class** — which is standard
metallurgy and belongs to nobody.

## B.9 THE NEVER-INTERCHANGE LIST

This is what the garage screen enforces. It **extends** pack 11 §C.5 and does not
contradict it.

1. **R-series ↔ T-series.** Different profiles (rope vs trapezoidal).
   **`R38 ≠ T38` even though both are 38 mm** — the source's own example.
2. **R/T ↔ H-series ↔ C-series.** Three separate series. `H64` and `C64` are the
   same size and different threads.
3. **H-shanks across shaft diameters.** `H55 ≠ H64 ≠ H90 ≠ H112`, and each is tied
   to a drifter shaft Ø (§B.2.5).
4. **IB-series ↔ R/T/H.** A fourth series (§B.2.6).
5. **LH ↔ RH.** Anything. Always.
6. **Box ↔ pin.** Two boxes do not mate and neither do two pins — that is what a
   coupling sleeve is *for*.
7. **DTH bit-shank families.** `DHD ≠ QL ≠ SD ≠ Mission ≠ Numa ≠ COP M ≠ TD`.
   **Spline count is the visible proof: 6, 8, 10, 12, 16.**
8. **DTH bit shanks ↔ top-hammer threads.** A DTH bit has **no thread**. Different
   segment entirely.
9. **RC shanks (Remet / Metzke / ARDX / MR) ↔ DTH shanks.** A fourth percussion
   family (§B.4.4).
10. **Wireline sizes.** A · B · N · H · P are a closed, tolerance-fitted family
    (±0.25 mm on the hole). You cannot go *up* a size in an existing hole.
11. **API rotary (REG / NC / IF / FH) ↔ percussion threads.** Different segment.
    *But NC ↔ IF/FH are the same connections renamed (§B.7) — that one pairing IS
    interchangeable, and it is the exception worth teaching.*
12. **API ↔ non-API proprietary rotary** (BECO, Cubex, Beadlock, Firestick, HDX).
    Pack 11 §C.3 — API is the generic tier, proprietary is brand-locked.
13. **Kelly-box sizes (130/150/200 mm)** — rotary/Kelly segment only, never
    percussion (pack 11 §C.5).

---

# §C. CAPABILITY ENVELOPES

## C.1 The method boundary — which method owns which hole diameter

**This is the most important envelope in the file**, because it decides what the
player is even allowed to attempt, and it is stated outright by an OEM:

> *"The optimum range of hole size for blast hole drilling with DTH is **90 mm to
> 254 mm (3½″–10″)**. **Smaller blast holes are generally drilled using tophammer,
> and larger holes generally use rotary machines.**"*
> — `Epiroc DTH product catalog.pdf`, "Selecting the right hammer"

| Method | Hole diameter | Corroboration |
|---|---|---|
| **Top hammer** | **28 – 152 mm** | Sandvik's threaded button bit range is *"from 28–152 mm in diameter"* (`top-hammer-drilling-tools-broshure-english.pdf`); the thread ladder in §B.2.3 tops out at GT60 → 152 mm |
| **DTH** | **90 – 254 mm** optimum for blastholes; **89 – 1 283 mm** as an outer envelope across all applications | Epiroc (above); Numa's published span **3½″–50½″ (89–1 283 mm)** (§A.9); Bulroc *"up to 24″"* (§A.11); Mincon's own range table runs **3″–40″** (§C.3) |
| **Rotary** | **> ~203 mm (8″)** | *"Rotary drilling is the dominant method for holes larger than 203 mm (8″)"* (https://www.hardrockdrills.com/blasthole-drilling-introduction/); rig ranges in §C.7 |

**Note the overlaps, because they are the interesting part.**
- **90–152 mm** — top hammer *and* DTH both work. Top hammer is faster and cheaper
  on fuel (§A.2, claim 3); DTH holds the hole straighter and keeps working deeper.
- **203–254 mm** — DTH *and* rotary both work. DTH suits hard rock; rotary suits
  high volume and softer ground.

> **Two overlap bands are two genuine strategic choices, and both are sourced.**
> That is far better game design than a hard boundary, and it is the truth.

## C.2 Surface top hammer

**The two gates: thread and rod.**

| Thread | Hole Ø | Rod Ø | Where it sits |
|---|---|---|---|
| R25 / R28 | ~33 – 45 mm | 25 / 28 mm | small hole, integral and light extension work |
| R32 | 43 – 76 mm (drifting/tunnelling); 33 – 45 mm (light bench) | 32 mm | the workhorse small thread |
| R38 | 45 – 64 mm | 38 mm | medium benching |
| T38 | 64 – 89 mm | 38 mm | standard production benching |
| T45 | 70 – 102 mm | 45 mm | deep benching |
| T51 | 89 – 127 mm | 51 mm | large production |
| ST58 | 102 – 152 mm | 58 mm | deep, high volume |
| **GT60** | **92 – 152 mm** | **60 mm** | the straightness/stiffness tier (§B.2.4) |

(Sources as §B.2.3.)

**Rod lengths, from the Sandvik extension- and drifter-rod tables:** real listed
lengths run roughly **3.0 m to 6.1 m** per rod (e.g. 3 700 mm ≈ 12′1⅝″;
4 305 mm ≈ 14′1½″; 4 915 mm ≈ 16′1½″; 5 525 mm ≈ 18′1½″; 6 095 mm ≈ 20′).
**Rod length sets the mast length and the rod-add interval** — the same coupling
`GAMEDESIGN.md` §3 already models as "every N metres the mast cycles a new rod in."

**One published field configuration, useful as a class reference** (Sandvik site
demonstration, `top-hammer-drilling-tools-broshure-english.pdf`): a top-hammer
crawler with a large hydraulic rock drill, an **87 mm GT60 pilot tube**, **4.3 m
GT60 extension rods** and **115 mm ballistic retrac bits**, drilling **20 m holes
at 15°** in **granite**, at **42 litres/hour** of fuel.

> **`VENDOR CLAIM`** on the comparative fuel figure (§A.2). The *configuration* —
> GT60, 4.3 m rods, 115 mm ballistic retrac bit, 20 m at 15° in granite — is a
> straightforwardly usable class description and is safe.

## C.3 DTH hammers by size — the hard numbers

### C.3.1 The two rules that size a hammer, stated by the OEM

> *"As a rule of thumb, **the smallest hole diameter a DTH hammer can drill is its
> nominal size.** A 4 inch hammer will drill a 4 inch (102 mm) hole. The limiting
> factor is the outside diameter of the hammer, because, as hole diameter reduces,
> airflow is restricted. **Maximum hole size for production drilling is the nominal
> hammer size plus 1 inch**, so for a 4 inch hammer the maximum hole size is
> 5 inch (127–130 mm)."*
> — `Epiroc DTH product catalog.pdf`

**Plus the design instruction that follows from it:** *"the size of the hammer
should match the required hole dimension as closely as possible, **leaving just
enough space for cuttings to evacuate the hole**"* (ibid.).

> **Two sourced rules, one mechanic:** hammer size sets a **narrow** hole-size
> window (nominal to nominal + 1″), and the *annulus* between hammer and hole wall
> is what carries the cuttings. **Too big a hammer in too small a hole chokes the
> flushing** — which is the DTH version of `GAMEDESIGN.md` §3's flushing slider,
> and it is decided at purchase time, not in play.

### C.3.2 Per-hammer envelope (Epiroc published data)

From `Epiroc DTH product catalog.pdf`, hammer specification tables. **Model names
are reference data only.**

| Class | Example designation | Hammer OD | Recommended hole size | Bit shank | Working pressure | Backhead |
|---|---|---|---|---|---|---|
| **2″** | COP 20 | 62 mm | **70 – 96 mm** | BR 2 | **6 – 12 bar** | RD 50-6 box |
| **3½″** | COP 35 | 79 mm | **88 – 105 mm** | DHD 3.5 | 6 – 25 bar | API 2⅜ REG pin |
| **3½″ slim** | COP 35 Slim | 75.6 mm | 85 – 105 mm | DHD 3.5 | 6 – 25 bar | API 2⅜ REG pin |
| **3½″ HP** | QLX 35 | 79 mm | **90 – 105 mm** | DHD 3.5 | **6 – 30 bar** | API 2⅜ REG pin |
| **4″** | QL 340 | 100 mm | **110 – 130 mm** | DHD 340 | 6 – 25 bar | API 2⅜ REG pin |
| **4″ HP** | QLX 40 | 101.6 mm | 115 – 130 mm | TD 40 | **6 – 35 bar** | API 2⅜ REG pin |
| **5″** | QL 50.2 | 117 mm | **130 – 152 mm** | QL 50 | 6 – 24 bar | API 3½ REG pin |
| **5″ high-flow** | QL 50.2 HF | 124 mm | 134 – 152 mm | QL 50 | 6 – 24 bar | API 3½ REG pin |
| **5″ HP** | QLX 50 | 121.9 mm | 134 – 152 mm | QL 50 | **6 – 35 bar** | API 3½ REG pin |
| **6″** | QL 60 | 138 mm | **152 – 191 mm** | QL 60 | 6 – 24 bar | API 3½ REG pin |
| **6″ quarry** | QL 65 QM | 146 mm | 165 – 191 mm | QL 60 | 6 – 24 bar | API 3½ REG pin / BECO 3½ |
| **8″** | QL 80 | 181 mm | **200 – 305 mm** | QL 80 | 6 – 24 bar | API 4½ REG pin / BECO |
| **8″ large** | QL 80 (194 OD) | 194 mm | 216 – 305 mm | QL 80 | 6 – 24 bar | API 4½ REG / BECO 4 |
| **9″** | TD 90 | 197 mm | **222 – 305 mm** | TD 90 | 6 – 24 bar | API 4½ REG pin |

**Read the pattern:** the recommended-hole window is roughly **hammer OD + 10 mm
to hammer OD + 110 mm**, widening with size, and the "HP" (QLX) variants trade
nothing in hole size — they simply accept **up to 30–35 bar** instead of 24–25.
**Pressure class is a separate, orthogonal upgrade axis.**

### C.3.3 The full size ladder, 3″ to 40″ (Mincon published range)

From `Mincon-Bluebook-2025-WEB.pdf`, "3–40″ hammer specifications". Shows how far
the method actually goes:

| Range | Shank designations offered at that size | Hammer OD |
|---|---|---|
| **3″** | DHD 3.5 | 77 mm (3.05″) |
| **4″** | DHD 340 · TD 40 · MQ 40 · DHD 350 | 98 mm (3.86″) |
| **5″** | QL 50 · (DH) | 115 mm (4.53″) |
| **6″** | DHD 360 · QL 60 · MQ 60 | 140–141 mm (5.51–5.55″) |
| **7″** | MC 71 | 160 mm (6.30″) |
| **8″** | DHD 380 · QL 80 | 182 mm (7.15″) |
| **10″** | SD 10 · MC 100 | 219 mm (8.62″) |
| **12″** | N 125 · QL 120 · MC 120 | 273 mm (10.75″) |
| **15″** | MC 150 | 340 mm (13.39″) |
| **18″** | N 180 · QL 200 · MQ 180 | 400 mm (15.75″) |
| **24″** | N 240 · MQ 240 | 525 mm (20.67″) |

Piston weights in the same table climb from **4.1 kg** (3″) to **545 kg** (24″), and
hammer weights from **22.3 kg** to **2 536 kg**.

> **Those two columns are the tier list.** A 3″ hammer is a two-hand lift; a 24″
> hammer is 2.5 tonnes and needs a crane. **Handling class is a real, sourced
> constraint on which rig can run which hammer**, and it is the same idea as pack
> 11 §F.2's "the carrier caps the tool."

## C.4 Air requirement — the compressor-sizing table

**This is the purchasing decision the game already models.** All figures below are
published **air consumption in m³/min (DIN 1343)** with the manufacturer's own cfm
equivalents, from `dth_catalog_digital_version_eng_2023.pdf` (Sandvik, 2023).

| Hammer | Hammer OD | **10 bar** | **18 bar** | **24 bar** | Power out @ 24 bar |
|---|---|---|---|---|---|
| **3.5″** | 85 mm | **4.5 m³/min** (159 cfm) | **8.3** (293) | **11.1** (392) | **20.9 kW** |
| **4″** | 105 mm | **6.7** (237) | **12.5** (441) | **16.9** (597) | **29.1 kW** |
| **5″** | 127 mm | **7.1** (250) | **14.9** (526) | **21.4** (755) | **31.7 kW** |
| **6″** | 150 mm | **8.8** (310) | **17.8** (629) | **24.0** (847) | **34.5 kW** |
| **9″** | 210 / 220 mm | **17.6** (622) | **26.2** (925) | **32.5** (1 148) | **54.8 kW** |

(The cfm columns are labelled 150 / 250 / 350 psi, which are 10.3 / 17.2 / 24.1
bar — the same three pressures. Every pair converts exactly, so the table is
internally consistent.)

**A high-pressure 4″ variant** in the same catalogue is rated **24 / 30 / 35 bar**
at **17.9 / 23.0 / 27.1 m³/min**, **45.3 kW at 35 bar**. `PARTIALLY VERIFIED` —
the cfm figures printed alongside it duplicate the standard 4″ hammer's and are
almost certainly a page-layout artefact in the extraction (§F).

**Three things to read off this table, and all three are game mechanics:**

1. **Air demand roughly triples from 10 bar to 24 bar.** A 6″ hammer wants
   **8.8 m³/min at 10 bar and 24.0 m³/min at 24 bar** — 2.7× the air for 2.4× the
   pressure. **You do not "just turn the pressure up."** You buy a bigger
   compressor, burn more fuel, and get more power at the bit.
2. **Hammer size and pressure are two separate purchases.** A 3.5″ hammer at 24 bar
   (11.1 m³/min) needs *less* air than a 6″ hammer at 10 bar is happy with
   (8.8 m³/min — comparable), but delivers **20.9 kW** against the 6″ hammer's
   larger blow. **Two different upgrade paths to "drill faster", with different
   costs.**
3. **The compressor is the gate, not the hammer.** Owning a 9″ hammer and a
   12 m³/min compressor means **you cannot run it**. That is the cleanest possible
   "you bought the wrong thing" lesson, and it is completely real.

**Pressure classes, sourced across three OEMs:**

| Class | Working pressure | Examples |
|---|---|---|
| Low pressure | **6 – 12 bar** | small 2″ hammers (Epiroc COP 20) |
| Standard | **6 – 24 / 25 bar** | the mainstream COP / QL / TD range |
| High pressure | **6 – 30 / 35 bar** | QLX series; *"Hyper high pressure hammers"* (Bulroc, §A.11) |

**RC hammers, for comparison** (`Mincon-RC-Solutions-2025-A4-WEB.pdf`): the
smallest MRXT lists a **minimum air package of 8.5 m³/min at 13.8 bar (300 cfm at
200 psi)**; the larger ones **25.5 m³/min at 24.1 bar (900 cfm at 350 psi)**.
**RC is air-hungry** — the sample has to come back up the *inner* tube.

## C.5 The exception — water-powered DTH

A DTH hammer driven by **water instead of air**. No compressor at all. From
`13.5-BWH-MWH-wasserbetriebener-Imlochhammer-WAI80-EN.pdf` (BWH Bohrwerkzeuge
Hoffmann), the largest of the five WAI datasheets in the local set — **and the
only one with extractable text**:

| | |
|---|---|
| Standard drill bit | **Ø 216 – 273 mm** |
| Casing / drilled steel pile advancing | **Ø 273 / 324 / 406 mm** |
| Working pressure | **50 – 150 bar** (750 – 2 200 psi) |
| Water required, hammer new | **380 l/min** |
| Water required, hammer worn | **750 l/min** |
| Impact frequency | up to **1 780 blows/min** |
| Feed force (formation-dependent) | **30 000 N** (30 kN) |
| Rotation speed | **25 – 50 rpm** |
| Torque (formation-dependent) | **3 050 – 5 000 Nm** |
| Length | **2 081 mm** |
| Diameter | ribbed **Ø 210 mm (8″)**; smooth **Ø 251 mm** ("Mega hammer" design, for improved flushing) |
| Weight | **354 kg** (Ø 210) up to **750 kg** (Mega hammer) |

**Why this belongs in the game.**

> **Compare the numbers against §C.4 and the trade is stark.** An 8″ air hammer
> wants tens of m³/min of compressed air at 24 bar; this 8″ water hammer wants
> **380 l/min of water at 50–150 bar**. **Different machine on the surface, same
> hole in the ground.** Where water is available, the compressor disappears; where
> it is not, the water hammer is unusable.

**Two more sourced details worth using:** the water demand **almost doubles as the
hammer wears** (380 → 750 l/min) — **a consumable whose *running cost* rises with
wear, not just its performance**, which is a better wear model than a simple ROP
decay. And the same tool advances **casing and drilled steel piles** at Ø 273 /
324 / 406 mm — i.e. it crosses straight into `DOMAIN.md` §1 `overburden` and the
foundation packs.

> ⚠️ The WAI 35 / 40 / 50 / 60 datasheets in the same local set are **image-only
> PDFs with no extractable text**. Only the WAI 80 figures above are sourced. Do
> not interpolate the smaller sizes (§F).

## C.6 Reverse circulation (RC)

RC is DTH's sampling cousin: the cuttings return **inside** the drill string, so the
sample is uncontaminated by the wall of the hole.

| | |
|---|---|
| Hammer OD range (one published family) | **82 – 132 mm** across six models |
| Bit shank types | **3″ Remet · 3.5″ Remet · 4″ Metzke · MR116 · MR120 · 4.5″ Remet** (§B.4.4) |
| Thread options | **ARDX · Remet · Metzke**, via an adapter sub |
| Minimum air package | **8.5 m³/min @ 13.8 bar** (smallest) to **25.5 m³/min @ 24.1 bar** |
| Numa's published RC hole range | **5¼″ – 36″ (133 – 914 mm)** |

Sources: `Mincon-RC-Solutions-2025-A4-WEB.pdf`; Numa listings (§A.9).

**The design feature that matters for the game**, in the source's own framing: the
newer hammers use a **check valve and an optional air-bleed chuck to maintain
positive air pressure at the bit face**, *"ensuring that collected samples remain"*
dry and uncontaminated, and **venturi drill bits** increase airflow *"during the
sample"* recovery.

> **`GAMEDESIGN.md` §7 already names the RC failure mode:** *"RC sample
> contamination gives you a perfect hole and a worthless assay."* **§C.6 is the
> hardware that either prevents or causes it** — check valve, bleed chuck, venturi
> bit — and every one of them is a purchasable part. **The instrument that lies is
> the metre counter; the truth is in the sample bag.**

## C.7 Rotary blasthole

The large end of surface drilling: **no percussion at all.** *"The drilling
principle is to use a high pull down force (weight-on-bit), rotate the drill bit,
and blow the rock cuttings to the surface with compressed air"*, and
*"roller-cone or tricone bits are the most common bit used for rotary blasthole
drilling"* (https://www.hardrockdrills.com/blasthole-drilling-introduction/).

| | Published envelope | Source |
|---|---|---|
| Hole diameter | **6″ – 16″ (152 – 406 mm)** | Epiroc surface blasthole rig range — https://www.epiroc.com/en-us/products/drill-rigs/surface-blasthole-drill-rigs |
| Pulldown (weight on bit) | **60 000 – 125 000 lb** ≈ **267 – 556 kN** | ibid. |
| Upper class hole range | **207 – 406 mm (10⅝″ – 16″)** | Sandvik rotary blasthole rig data — https://www.mining.sandvik/en/products/equipment/surface-drill-rigs/d245x-rotary-blasthole-drill-rigs/ |
| Single-pass depth | up to **19.8 m (65 ft)** clean hole | ibid. |
| Method boundary | dominant **above 203 mm (8″)** | hardrockdrills.com (above) |

> **267–556 kN of pulldown is the number that separates rotary from everything
> else in this project.** For scale: the oil-well rule of thumb for a tricone is
> **≈2 tonnes per inch of bit diameter** (`research/01-oil-gas.md` §E.1, from
> `[WITTIG]` p.66) — so a 12¼″ oil bit wants ~240 kN, right inside the surface
> rotary blasthole band. **Rotary blasthole and oil-field rotary are the same
> physics at the same forces, one vertical kilometre apart.**

## C.8 Core drilling parameters

For the `core` method (`DOMAIN.md` §1), from
`Epiroc Guide to Drilling Parameters.pdf` and
`Epiroc Guide choosing right core bit.pdf`.

**Rotation speed by size — the published starting chart:**

| Size | RPM |
|---|---|
| **A** | **950 – 1 050** |
| **B** | **850 – 950** |
| **N** | **750 – 900** |
| **H** | **650 – 750** |
| **P** | **600 – 700** |

> ⚠️ The chart's size labels extract as `AO/BO/NO/HO/PO`; they are **AQ/BQ/NQ/HQ/PQ**
> (the size letters of §B.6). Noted rather than silently corrected.

**Read it against §B.6 and the physics is visible: bigger hole, lower RPM** —
because it is *surface speed at the cutting edge* that matters, not shaft speed.
A P-size bit at 650 rpm and an A-size bit at 1 000 rpm are running the diamonds at
comparable speed. **That single relationship is the whole rotation model for core
drilling, and it is sourced.**

**Rate of penetration is measured in an unusual unit, and it is worth keeping.**
The same guide expresses core-drilling ROP as **revolutions per inch drilled** —
e.g. **150 rev/in** or **250 rev/in**. *"The ROP is the key parameter in diamond
drilling"*, and *"A ROP that is too high can cause too much wear on the matrix and
can result in the diamonds being expelled while they are still sharp."*

> **"Rev per inch" is a beautiful, authentic HUD unit** and no other method in this
> game uses it. Show it.

**Matrix selection — and the counter-intuitive rule:**

> *"Bits with a **higher number, like a 9, are softer** than bits with a lower
> number, like a 7."*
> — `Epiroc Guide choosing right core bit.pdf`

and the reason the softer matrix exists: *"In order to compensate for the lack of
rotation, you would need to use a bit with a **softer matrix** since a softer
matrix allows the diamonds to expose themselves more efficiently."*

> **A weaker rig needs a softer bit.** That is a genuine, sourced coupling between
> machine and consumable — buy a better rig and your bit choice changes. Exactly
> the "the carrier caps the tool" mechanic from pack 11 §F.2, in a new segment.

**Impregnation depth** — *"The standard size for most bits is a **13 mm**
impregnation depth. Generally speaking, bits with a higher impregnation depth are
recommended for **deeper drill holes** … These configurations come in **16 mm,
20 mm or 26 mm**"* (ibid.). **A straightforward four-tier consumable ladder:
13 → 16 → 20 → 26 mm, priced accordingly, paying back only on deep holes.**

**Waterway configuration** — a separate axis again: **standard · deep · lateral
discharge (LDO) · deep lateral discharge (DLD) · face discharge (FD) · face
discharge waterways**, plus **triple deep / sand**, which is *"ideal for fractured
rock … designed to allow better water flow to the bit **with reduced risk of
eroding the core**"* (ibid.).

> **"Eroding the core" is the point.** In core drilling, PROTECT (water) is a
> two-sided control exactly as mud weight is in oil & gas
> (`research/01-oil-gas.md` §E.1): too little and you burn the bit, too much and
> **you wash away the sample you were paid to recover.** `GAMEDESIGN.md` §7 already
> lists water as *"the most critical of the three"* for core/wireline — this is why.

**Ground assessment — a field method the game can literally reproduce.** The guide
teaches rock hardness by scratch test against the **Mohs** scale, with two
calibration points a player would actually have: *"the average hardness of [a
pocket knife] is approximately **6.0 to 6.5**"* and a metal saw *"should be around
**6.5 to 7.0**"*. And it separates **hardness** from **abrasiveness** as two
independent properties — abrasive rock *"can be difficult to drill through in any
hardness of ground [and] can wear down drill bits prematurely."*

> **Two ground axes, not one.** That is the correct input pair for both diamond
> matrix selection *and* carbide grade selection (§B.8), and it means the game's
> strata should carry **hardness and abrasiveness as separate values.**

---

# §D. "Tactex" — RESOLVED

**The finding, confirming and extending `research/11-oem-anchor-geotech-hdd.md`
§E.1.**

**A real company with that exact name exists and it is the only match.**
**TactEX Industries**, **1390 Springhill Road, Parksville, British Columbia,
V9P 2T2, Canada** (https://tactexindustries.com/our-company/about/). Founded
**2021** — their own words: *"We founded TactEx Industries in 2021."*

**What they actually make.** *"Drilling Equipment Suppliers, Diamond Core Drill"*
(site title, https://tactexindustries.com/); *"Canada's most innovative drilling
equipment supplier"* delivering all-in-one solutions for the **diamond drilling**
industry. Their stated design goal: *"We wanted to develop a drill that would
better integrate into multiple platforms and offer advanced safety features."*
Products are configurable drills across **three platforms** (`X-10`, and the
`TX-10` / `SX-10` / `FX-10` configurations), with **all parts built in-house and
interchangeable.**

**Therefore, and this settles the sector question:**

> **TactEX is a `core` / mineral-exploration *drill rig* maker — not a foundation
> OEM, and not a rock-tooling or thread manufacturer.** It belongs in `DOMAIN.md`
> §1 under **`core` (Core / exploration, wireline)** and in `DOMAIN.md` §3 group A
> under **Drilling Rigs → Core/Exploration**. Pack 11 §E.1's classification was
> **correct** and is confirmed here by a second pass.

**What could not be verified, stated plainly:**

| Question | Status |
|---|---|
| Whether "Tactex" was the company the user meant | **Cannot be determined from the name alone.** Pack 11 §E.1 raised **TESCAR** (TES CAR Srl, Osimo, Italy — mini piling rigs, documented in pack 11 §A.5) as a phonetically plausible alternative *in a foundation context*. Both companies are real and they are different firms. **The user should pick.** |
| Any second company called "Tactex" in rock drilling or tooling | **None found.** Searches across rock-drilling-tool manufacturer listings returned Epiroc, Sandvik, Starockdrill, TEI Rock Drills, WORD Rock Drills, Traxxon — **no other Tactex.** |
| TactEX rig specifications (weight, feed force, rod capacity, depth) | **`UNVERIFIED`** — not published on the pages reachable. **Do not invent an envelope for them.** |
| Whether TactEX makes tooling as well as rigs | **`UNVERIFIED`** — they state parts are built in-house and interchangeable *across their own platforms*, which is not the same as selling tooling to the market. |

**Recommendation.** Record TactEX in the brand list as a **Canadian core /
exploration drill manufacturer, founded 2021**, and nothing more. **It is not a
source for §B and it should not appear in the thread reference.**

---

# §E. IMPLEMENTER NOTES

## E.1 How to use this without breaking the naming rule

- **Threads are standards; hammers are trademarks.** `R32`, `T45`, `H64`, `GT60`,
  `NQ`, `API 3½ REG`, `NC50` are industry designations the game already uses
  (`DOMAIN.md` §4) and they are **safe**. `COP 1838`, `HD 712`, `QL 60`, `RH560`,
  `MP80-QL`, `DHD 350R` are **badges** — reference data only (`DOMAIN.md` §6, §10).
- **Take the envelope, leave the name.** *"A 6-inch DTH hammer, 138 mm OD, drilling
  152–191 mm holes, 6–24 bar, wanting 24 m³/min at 24 bar"* is a **class**, and it
  is accurate. The model number is a trademark.
- **Naming conventions worth imitating structurally** (never copying), on top of
  pack 11 §F.1's list:
  - **size-encoded percussion**: the number **is** the nominal thread diameter in
    mm (`R32`, `T45`, `H64`) — §B.2.2;
  - **size-encoded hammers**: the number is the nominal hole size in inches
    (`QL 60` ≈ 6″, `DHD 380` ≈ 8″);
  - **letter-encoded core sizes**: a single letter for the whole size family
    (A/B/N/H/P) with a suffix for the system — §B.6;
  - **capability-encoded carbide**: BWH's `B-<Co%>-<grain>` is literally the
    metallurgy in the code (§B.8).
  **Pick one scheme per in-game manufacturer and hold it** — that consistency is
  what makes a fictional brand feel real.

## E.2 Mechanics this research directly supports

1. **Three-gate compatibility with a *specific* failure message** (§B.1). Segment →
   series → size/hand/gender. The message the player sees should name the gate that
   failed, not just say "incompatible".
2. **Spline count as a visible check** (§B.4.2). 6 · 8 · 10 · 12 · 16. Draw the
   splines and the player can see the mismatch before reading a word.
3. **The badge that lies** (§B.4.2). `COP 44 STD` takes a `DHD 340` bit; `COP 44
   Gold` takes a `TD 40` bit. **Same brand, same number, different interface** —
   the strongest argument in the file for keying the shop off geometry.
4. **Compressor sizing as a hard gate** (§C.4). Own the hammer, lack the air, and
   nothing happens. Air demand roughly **triples** from 10 to 24 bar.
5. **Two orthogonal DTH upgrade axes** (§C.3.2): **bigger** (hole size) and
   **higher pressure** (power at the same size). Different prices, different
   payoffs.
6. **The two overlap bands** (§C.1): 90–152 mm where top hammer and DTH compete,
   203–254 mm where DTH and rotary compete. Real strategic forks, both sourced.
7. **Hardness and abrasiveness as two separate ground properties** (§B.8, §C.8),
   feeding both carbide grade and diamond matrix selection. One number is not
   enough.
8. **The wear-vs-breakage pair** (§B.8): binder % and grain size move hardness and
   toughness in opposite directions, with real published numbers (1535 → 900 HV10
   as cobalt goes 6 % → 20 %).
9. **Gauge wear ends a bit's *size*, not just its speed** (§B.5). An undersized
   hole is a problem for the *next* bit — a delayed consequence, which is the best
   kind.
10. **Retrac bodies exist for a reason** (§B.5). In collapsing ground, a regular
    skirt is how you lose the string. A sourced, purchasable answer to a hazard
    `GAMEDESIGN.md` §3 already lists ("fracture zone / collapsing hole").
11. **Wireline telescoping** (§B.6): PQ → HQ → NQ → BQ, each step costing core
    diameter. The core-drilling twin of the oil-well casing decision.
12. **Water instead of air** (§C.5): the WAI-class hammer removes the compressor
    entirely and needs 380 l/min of water at 50–150 bar instead. A genuine
    site-dependent fork — and its water demand **doubles as it wears**.
13. **RPM falls as hole size rises** in core drilling (§C.8), because surface speed
    is what matters. One sourced curve, five sizes.
14. **A weaker rig needs a softer matrix** (§C.8). Machine and consumable are
    coupled; upgrading one changes the right answer for the other.
15. **The aftermarket tier** (§B.3.2). Third parties cut shanks for nine different
    drifter makers. **OEM tier and compatible tier, at different prices and
    different reliability** — a real, sourced economic fork for the shop.

## E.3 Two additions recommended to `DOMAIN.md` §4

Both are things this research found that the taxonomy does not yet carry, and both
are needed for the compatibility system to be complete:

1. **RC shank/thread family: `Remet` · `Metzke` · `ARDX` · `MR`** (§B.4.4). RC is
   already in the equipment tree (§3 group B, "RC/Dual-Wall") and heavily used in
   the prospecting pack, but its interface family is missing from §4.
2. **`IB30 / IB40 / IB52` and `C64 / C90 / C112`** — already recommended by pack 11
   §C.2 and confirmed here (§B.2.6). They sit beside R/T/H on the same drifter
   shafts and must be separate series in the never-mix list.

**And one correction to consider:** `DOMAIN.md` §4 lists **`NSK 95/122/146/176`**
under Core / Exploration. The four numbers match real large-diameter wireline hole
sizes, but **the letters "NSK" could not be sourced** (§B.6). Either find a
first-party source or restate them as hole diameters.

---

# §F. UNVERIFIED, INFERRED AND OPEN ITEMS

Per `PLATFORM_TRUTH.md` Part C rule 6. **None of this may reach a player without a
further source.**

| Item | Status | Note |
|---|---|---|
| **Corporate origin of the `Mission` DTH shank** | `UNVERIFIED` | Secondary sources associate it with Driltech Mission / Mission Manufacturing. No first-party source reachable. **Present it as a shank pattern, never as a shop brand.** §A.10 |
| **Corporate origin of the `SD` shank** | `UNVERIFIED` | Attributed variously to Ingersoll Rand and to Sandvik. §B.4.1 |
| **Montabert ownership chain Doosan → Joy Global → Komatsu** | `UNVERIFIED` in detail | The company's own page says Komatsu Mining Corp **since 2017**; use that. A USD 124 m Doosan sale and a 2015 acquisition date both appear in secondary sources and conflict. §A.4 |
| **Halco Rock Tools founding year 1948** | `UNVERIFIED` | From a company-data aggregator, not first-party. The 1950s DTH pioneering claim *is* on halco.uk. §A.12 |
| **Bulroc's town (commonly given as Sheffield)** | `UNVERIFIED` | Only "Great Britain" and "over 45 years" are sourced, and from a distributor page rather than Bulroc themselves. §A.11 |
| **Kennametal history page URL** | `PARTIALLY VERIFIED` | Founding 1938 / McKenna / Latrobe appears in Wikipedia and in a Kennametal 75-years release surfaced by search; neither page was fetched directly. §A.14 |
| **`NSK` as a wireline system designation** | `UNVERIFIED` | The four numbers (95/122/146/176) match real large-diameter wireline **hole** diameters (CH 96.3 / CP 122.6 / CSK 146 / CSK 176), and **146 mm hole → 102 mm core** is sourced. The letters are not. §B.6 |
| **H-number = nominal thread Ø in mm** | `INFERRED` | Consistent with R/T practice and with the shaft-Ø ladder (Ø56→H55 … Ø115→H114), but stated in no source read. §B.2.5 |
| **IB30 ↔ R32, IB40 ↔ R38, IB52 ↔ R51 size equivalence** | `INFERRED` | Inferred from **shared seal items** in the Eurodrill catalogue ("sealing IB30 / R32" etc.). Strong, but not stated in words. §B.2.6 |
| **Mincon backhead connections above 8″** (INTG, HEX-series) | `UNVERIFIED` | The Bluebook's backhead column offsets against its size rows in the extracted text. Verify against the original PDF page. §B.4.5 |
| **High-pressure 4″ hammer air figures** (17.9 / 23.0 / 27.1 m³/min at 24/30/35 bar) | `PARTIALLY VERIFIED` | The m³/min values are internally plausible; the cfm values printed beside them duplicate the standard 4″ hammer's and look like a layout artefact. §C.4 |
| **Sandvik top-hammer vs DTH fuel comparison** (42 vs 78 l/h) and *"double the penetration rate at half the energy"* | `VENDOR CLAIM` | A manufacturer's own demonstration, one hole size, one rock type. Use the shape, not the numbers. §A.2, §C.2 |
| **WAI 35 / 40 / 50 / 60 water-hammer specifications** | **NOT AVAILABLE** | Those four local PDFs are **image-only, no extractable text**. Only the **WAI 80** figures are sourced. **Do not interpolate.** §C.5 |
| **`Einsteckende Klemm.pdf`** | **NOT AVAILABLE** | Image-only, no extractable text. The KLEMM shank data in this file comes from the Eurodrill matrix via pack 11 instead. §0 |
| **`R32` hole-diameter range** | **TWO SOURCES DISAGREE — deliberately** | Sandvik lists R32 bits to 76 mm (drifting/tunnelling); the trade reference gives 33–45 mm (surface bench). **Both are right in their own application.** Filter on thread × application. §B.2.3 |
| **TactEX rig specifications** | `UNVERIFIED` | Not published on reachable pages. **Do not invent an envelope.** §D |
| **Whether "Tactex" is the company the user meant** | **UNRESOLVED — user decision** | TactEX Industries (Canada, core drilling, 2021) is confirmed to exist and is the only match. TESCAR (Italy, mini piling, pack 11 §A.5) remains the alternative if the context was foundation work. §D |
| **`Secoroc` as a current Epiroc sub-brand** | **VERIFIED, single source** | Named in Epiroc's own 2025 exploration catalogue (`Mineral Exploration Tooling - Catalog.pdf`). Fine to use as a *history* note; not needed in-game. §A.1 |
| **Robit founding year** | `UNVERIFIED` | Their company page gives location, listing and product structure but no founding year. §A.6 |

---

*Compiled 2026-09-04. Local sources as listed in §0; web sources cited inline.
Every number above is traceable; everything that is not is labelled. Per
`DOMAIN.md` §10, no supplier part numbers, order numbers or drawing numbers have
been carried into this file, and no real model designation is proposed as in-game
content. This file extends `research/11-oem-anchor-geotech-hdd.md` §C and does not
contradict it: the shank shaft-Ø gate (Ø56→H55 · Ø65→H55/H64 · Ø68→H64/H66 ·
Ø95→H90/H92 · Ø115→H112/H114) and the IB/C families established there are carried
forward unchanged in §B.2.5 and §B.2.6.*

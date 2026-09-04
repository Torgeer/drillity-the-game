# 04 — Tunnelling and underground construction

Research pack for **Drillity I The Game**, closing the gap identified in
`DESIGN_EXPANSION.md` §5 row 7 (Tunneling: *"drill & blast face drilling with a
tunnel jumbo missing (taxonomy: Tunnel Drilling Jumbos, ANFO Loaders); TBM /
roadheader missing (TBM Cutters, Roadheader Picks)"*).

**Scope.** Drill & blast, TBM (all families), roadheader, ground support and
pre-support, microtunnelling and pipe jacking. The crew. The machines. The
hazards. A mechanics proposal that puts an *underground heading* into the
surface band and a *longitudinal profile* into the section band.

**Rules obeyed.** Every claim carries a source — a local filename in
`C:\Users\henri\Downloads\` or a URL. Anything unsourceable is marked
`UNVERIFIED` or cut, per `PLATFORM_TRUTH.md` Part C. Manufacturer names appear
**only as citations**; no real model designation may ship as in-game content
(`DOMAIN.md` §6, §10).

---

### Source key

| Key | Source |
|---|---|
| `[NFF14]` | Norwegian Tunnelling Society, *Publication No. 14 — Norwegian Tunnelling* — https://nff.no/wp-content/uploads/sites/2/2020/04/Publication-14.pdf |
| `[NFF19]` | Norwegian Tunnelling Society, *Publication No. 19 — Rock Support in Norwegian Tunnelling* — https://nff.no/wp-content/uploads/sites/2/2020/04/Publication-19.pdf |
| `[NFF11]` | Norwegian Tunnelling Society, *Publication No. 11 — TBM tunnelling in Norway* — https://tunnel.no/wp-content/uploads/sites/3/2020/04/Publication-11.pdf |
| `[ROB-CUT]` | J. Roby et al., *The Current State of Disc Cutter Design and Development Directions*, NAT 2008 (Robbins) — https://www.robbinstbm.com/wp-content/uploads/2010/09/CutterHistory_NAT_2008.pdf |
| `[HK-GRIP]` | Herrenknecht, Gripper TBM — https://www.herrenknecht.com/en/products/productdetail/gripper-tbm/ |
| `[HK-DS]` | Herrenknecht, Double Shield TBM — https://www.herrenknecht.com/en/products/productdetail/double-shield-tbm/ |
| `[HK-EPB]` | Herrenknecht, EPB Shield — https://www.herrenknecht.com/en/products/productdetail/epb-shield/ |
| `[HK-AVN]` | Herrenknecht, AVN Machine — https://www.herrenknecht.com/en/products/productdetail/avn-machine/ |
| `[HK-MM]` | Herrenknecht, Multi-mode TBM — https://www.herrenknecht.com/en/products/productdetail/multi-mode-tbm/ |
| `[WIKI-TBM]` | Wikipedia, *Tunnel boring machine* — https://en.wikipedia.org/wiki/Tunnel_boring_machine |
| `[WIKI-RH]` | Wikipedia, *Roadheader* — https://en.wikipedia.org/wiki/Roadheader |
| `[WIKI-SC]` | Wikipedia, *Shotcrete* — https://en.wikipedia.org/wiki/Shotcrete |
| `[WIKI-NATM]` | Wikipedia, *New Austrian tunneling method* — https://en.wikipedia.org/wiki/New_Austrian_tunneling_method |
| `[PJA]` | Pipe Jacking Association, *An introduction to pipe jacking and microtunnelling* — https://pipejacking.org/assets/pj/static/PJA_intro.pdf |
| `[UW-PJ]` | M. Knight, *Pipe Jacking / Microtunnelling*, CIVE 752 course notes, University of Waterloo (CATT) — http://www.civil.uwaterloo.ca/maknight/courses/CIVE752-06/jack-micro.pdf |
| `[KARADON]` | Yılmaz & Ünver (2023), *Drilling and blasting designs for parallel hole cut and V-cut method in excavation of underground coal mine galleries*, Sci. Rep. — https://pmc.ncbi.nlm.nih.gov/articles/PMC9922253/ |
| `[NTNU-BD]` | *Project Report 2A-05 Drill and Blast Tunnelling — Blast Design* (NTNU) — https://www.researchgate.net/publication/381523474_Project_Report_2A-05_Drill_and_Blast_Tunnelling_-_Blast_Design |
| `[OSHA-800]` | 29 CFR 1926.800, *Underground construction* — https://www.law.cornell.edu/cfr/text/29/1926.800 |
| `[OSHA-910]` | 29 CFR 1926.910, *Inspection after blasting* — https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.910 |
| `[OSHA-911]` | 29 CFR 1926.911, *Misfires* — https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.911 |
| `[BS6164]` | BS 6164:2019, *Health and safety in tunnelling in the construction industry — Code of practice* — https://knowledge.bsigroup.com/products/code-of-practice-for-health-and-safety-in-tunnelling-in-the-construction-industry ; commentary: https://www.tunnelsandtunnelling.com/analysis/bs-61642019-7919897/ |
| `[SPRENG]` | § 20 SprengG (Befähigungsschein) — https://www.buzer.de/gesetz/3583/a50686.htm ; https://de.wikipedia.org/wiki/Bef%C3%A4higungsschein |
| `[SPRENGBER]` | *Sprengberechtigter* (DE/AT roles) — https://de.wikipedia.org/wiki/Sprengberechtigter |
| `[CSCS-TUN]` | CSCS, Tunnelling Operative card — https://www.cscs.uk.com/cards/tunnelling-operative-electricians-mate-vq-level-2-vq-level-2-award-in-tunnelling-operations-construction/ |
| `[TSTS]` | CITB Tunnelling Safety Training Scheme — https://qualitysafetytraining.co.uk/courses/citb-ssp-training/citb-tsts/ |
| `[EFNARC]` | EFNARC nozzleman certification — https://efnarc.org/news ; https://bestsupportunderground.com/certified-nozzlemen/?lang=en |
| `[ACI-SC]` | ACI, *Shotcreter (Wet-Mix Process)* certification — https://www.concrete.org/certification/certificationprograms.aspx?m=details&pgm=Shotcrete+Construction&cert=Shotcreter+%28Wet-Mix+Process%29 |
| `[AT-WAGE]` | Arbeidstilsynet, minimum rates of pay (construction), Norway — https://www.arbeidstilsynet.no/en/working-conditions/pay-and-minimum-rates-of-pay/minimum-wage/ |
| `[SQZ]` | Ramoni & Anagnostou, *The Interaction Between Shield, Ground and Tunnel Support in TBM Tunnelling Through Squeezing Ground*, RMRE — https://link.springer.com/article/10.1007/s00603-010-0103-8 ; open copy https://files.core.ac.uk/download/159150515.pdf |
| `[YIELD]` | Cantieni & Anagnostou, *The interaction between yielding supports and squeezing ground*, TUST — https://www.sciencedirect.com/science/article/abs/pii/S0886779808001065 |
| `[OVERCUT]` | *Impact of Overcut on Interaction Between Shield and Ground in Tunneling with a Double-shield TBM*, RMRE — https://link.springer.com/article/10.1007/s00603-015-0823-x |
| `[UMB]` | Pipe umbrella / canopy tube practice — https://tunnelsupports.com/canopy-tube-system/ ; https://www.jennmar.com/products/umbrella-tubes ; https://tunnels-infrastructures.com/pipe-umbrella-koralm-tunnel-kat-3/ |
| `[PLOS-PICK]` | *A new method for roadheader pick arrangement…*, PLOS ONE — https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0260183 |
| `[TT-ICUT]` | *The cutting edge — ICUTROC*, Tunnels & Tunnelling — https://www.tunnelsandtunnelling.com/analysis/the-cutting-edge-icutroc/ |
| `[MDPI-CUT]` | *Wear Characteristics and Optimization Measures of Disc Cutters…*, Lubricants 13(4) 170 — https://www.mdpi.com/2075-4442/13/4/170 |
| `[EPI-FACE]` | Epiroc, face drill rigs (jumbos) — https://www.epiroc.com/en-us/products/drill-rigs/face-drill-rigs |
| `[SDVK-JUMBO]` | Sandvik tunnelling jumbo product pages — https://www.mining.sandvik/en/products/equipment/underground-drill-rigs/dt1132i-tunneling-jumbo/ |
| `[DIESEL-AIR]` | *Ventilation requirements for diesel equipment in underground mines* — https://www.diva-portal.org/smash/get/diva2:1134809/ATTACHMENT01.pdf ; https://www.airfinders.ca/wp-content/uploads/2021/07/Airflow-Requirements-for-Modern-Diesel-and-Electric-Equipment.pdf |
| `[EMDE-ANK]` | `2-1-EMDE-Katalog-Ankerbohren.pdf` (local, `C:\Users\henri\Downloads\`) — anchor / drive / overburden drilling and HDI jet-grouting strings |
| `[ROB-MIX]` | Robbins, *What's in a Name? Mixshield, Crossover, Hybrid and More* — https://www.robbinstbm.com/mixshield-crossover-hybrid/ |

> **Citation honesty note.** `[NTNU-BD]` is used only for two rules of thumb
> (look-out limit and contour spacing/burden ratio) that were returned in a
> search summary over the NTNU blast-design literature and that I could not open
> the full PDF to verify line-by-line. Both are corroborated by `[NFF14]` §7.4,
> which is a primary document I did read in full. Where they disagree, follow
> `[NFF14]`.

---

# A. The distinct methods

There are only three ways to make a hole big enough to walk through, plus a
fourth that pushes a pipe instead of leaving a void:

1. **Break the rock with explosives** — drill & blast.
2. **Break the rock with a full-face machine** — TBM.
3. **Break the rock with a partial-face machine** — roadheader.
4. **Push a finished pipe in behind a small machine** — microtunnelling / pipe
   jacking.

Everything else (bolts, shotcrete, spiles, grout) is *support*, and support is
not an afterthought — in a Norwegian D&B heading, support and the excavation
cycle interleave hour by hour `[NFF14]` §7.5.

---

## A1. Drill & blast — the cycle

### The eight steps, in order

The cycle is closed: step 8 hands back to step 1 and the face has moved forward
by one round length.

| # | Step | What happens | Time (100 m² face, Norwegian practice) |
|---|---|---|---|
| 1 | **Survey and mark** | The jumbo positions itself at the face and detects its chainage; the computer retrieves the drill pattern from the pre-programmed tunnel design. Laser-based survey equipment on the jumbo checks the *previous* round's profile while drilling the new one. | folded into step 2 `[NFF14]` §7.3 |
| 2 | **Drill the round** | Booms drill the full pattern. On a fully automated jumbo the operator does not intervene once the pattern starts. Each drill can advance up to **3 m/min** `[NFF14]` §7.3. | drilling + charging + blasting together **4–5 h** `[NFF14]` §7.5 |
| 3 | **Charge** | Bulk explosive (ANFO or site-sensitised emulsion) pumped/blown into the production holes; reduced-energy piped explosive in the contour; cartridge high-energy explosive where needed; non-electric detonators with accurate timing to split the round into many delays `[NFF14]` §7.4. | (in the 4–5 h above) |
| 4 | **Blast** | Round is fired. | seconds |
| 5 | **Ventilate** | Fumes cleared before anyone returns. | **0.5 h** `[NFF14]` §7.5. Regulatory floor: *not less than 15 minutes in tunnels* before returning to the shot `[OSHA-910]`. |
| 6 | **Scale** | Loose rock taken down before anyone or any machine works under the new crown. Normally a hydraulic hammer on an excavator; final scaling by hand-held bar is still common `[NFF14]` §7.2. | **1 h** before loading can start `[NFF14]` §7.5 |
| 7 | **Muck out** | Wheel loader + trucks. A 4.5 m round on 100 m² produces **≈500 m³ solid rock including overbreak**; at a loading capacity of **190–220 m³ (solid) per hour** the face is cleared in **≈4 h**, with trucks/semi-trailers carrying **25–35 t** `[NFF14]` §7.5. | **≈4 h** |
| 8 | **Support** | Rock bolting from the jumbo; sprayed concrete from a robot, often at night or in a standstill if stand-up time allows. | bolting **≈1.5 h** `[NFF14]` §7.5 |

**Total ≈12 h per complete round → typical advance ≈50 m/week** `[NFF14]` §7.5.

That single line is the most important number in this document for game
balance: *one round is roughly one shift*, and a week is roughly ten rounds.

### Round length and pull

- Norwegian practice drills with **18 ft (≈5.49 m) drill steels**, giving an
  advance of **approximately 4.5–5.0 m per blast round**, described as a
  "10–20 % reduction in length" `[NFF14]` §7.4. So **pull = 82–91 %** of drilled
  depth.
- The wider literature quotes shorter rounds: blastholes drilled somewhat
  shorter than the opening dimension, pulling **about 90 %** with good practice,
  with typical round depths of **2–4 m** `[NTNU-BD]`.
- In a small gassy coal gallery, `[KARADON]` reports **2.85 m holes → 2.70 m
  advance = 95 % pull** (parallel cut) and **2.3 m holes → 2.0 m theoretical
  advance = 87 %** (double V-cut).

**Design consequence:** pull is never 100 %. The game must show drilled depth
and pulled depth as two different numbers, and the gap is the player's score.

### Hole count for a given face area

- **≈140 holes per round on a 100 m² cross-section** with modern equipment
  `[NFF14]` §7.5. That is **1.4 holes/m²** as a first-order rule.
- Small sections need proportionally *more* holes per m² because the cut and the
  contour are fixed overheads: `[KARADON]` uses **90 holes on 14 m²**
  (6.4 holes/m², 38 mm) for a parallel-cut roadway and **95 holes on 12.5 m²**
  (7.6 holes/m², 32 mm) for a single V-cut gateroad. Small holes, small
  sections, permitted explosives — a coal-mine constraint, not a civil-tunnel
  one, but the *shape* of the relationship is real.
- Modern Norwegian D&B uses **more holes and more specific charge per round than
  the older prediction models assumed**; the reasons given are longer drilled
  rounds, tighter contour requirements, and pulling the longitudinal ditches
  into the main round `[NTNU-BD]`.

### The cut — and why it is the hard part

A tunnel face has **one** free surface: the face itself. Rock cannot be blasted
into a solid. The **cut** is the small group of holes whose only job is to open
a cavity — a second free surface — that every other hole in the round can then
break into. If the cut does not open, the round chokes: the stoping holes fire
against confinement, the round "freezes", and you get a fraction of the advance
plus a face full of half-burnt explosive to deal with.

Three cut families:

**Parallel / burn cut.** All cut holes are drilled parallel to the tunnel axis
around one or more **large-diameter uncharged relief holes**. This is Norwegian
standard practice: *"The drill pattern in Norwegian underground openings is
often based on parallel cut in combination with large diameter boreholes. The
typical length of a round inhibits the use of other kinds of cuts."* `[NFF14]`
§7.4. Geometry from `[KARADON]` (38 mm charged holes, 2.85 m deep):

| Relief hole Ø | First burden B₁ | Quadrangles | Last quadrangle side |
|---|---|---|---|
| 76 mm | **0.113 m** | 5 | 1.34 m |
| 115 mm | **0.182 m** | 5 | 2.16 m |

The cut expands outward in nested quadrangles; each square blasts into the
cavity the last one made.

**Wedge / V-cut.** Holes drilled in angled pairs meeting on the tunnel
centreline, so the cut throws a wedge of rock out of the face. `[KARADON]`:
**60° peak angle**, burden **0.46 m**, spacing **0.37 m** in the cut, single-V
round 1.5 m deep → 1.3 m advance; double-V round 2.3 m deep → 2.0 m advance,
cut height **1.35 m**, first burden **0.95 m**, second burden **0.725 m**.

**Why the V-cut caps round length.** The wedge angle means the cut holes must
reach across the face; the deeper the round, the wider the wedge needs the face
to be. A parallel cut has no such constraint — which is exactly why long
Norwegian rounds force the parallel cut `[NFF14]` §7.4.

**Why the cut is unforgiving — the arithmetic.** With a 76 mm relief hole the
first burden is 0.113 m `[KARADON]`. Over a 2.85 m hole, an angular deviation of
just 3° displaces the toe by 2.85 × tan(3°) = **0.149 m** — more than the whole
burden. The hole either collides with the relief hole or misses its influence
entirely. *This is the mechanic.* Collaring and alignment precision in the cut
matters an order of magnitude more than anywhere else on the face.

### The rest of the pattern

Working outward from the cut:

- **Stoping / easer holes** — the bulk of the face, breaking toward the cut
  cavity. `[KARADON]`: burden **1.07 m**, spacing **1.18 m**, bottom charge
  **1.4 kg/m**, column charge **0.68 kg/m**, stemming **0.5 m**.
- **Roof / back holes** — reduced column charge to protect the crown.
  `[KARADON]`: burden **0.97 m**, spacing **1.18 m**, column charge **0.41
  kg/m**.
- **Lifters / floor holes** — the most heavily charged, because they have to
  lift the whole muck pile. `[KARADON]`: burden **1.07 m**, spacing **1.18 m**,
  column charge **1.40 kg/m**, stemming only **0.2 m**.
- **Contour / perimeter holes** — the shape of the finished tunnel.

### Contour holes and smooth blasting

The contour is scored, not just drilled. `[NFF14]` §7.4 gives Norwegian
specification directly:

- Collaring accuracy: **within 0.1 m** of the theoretical drill pattern.
- Alignment deviation: **maximum 6 % of hole depth**. (On a 5.4 m hole that is
  0.32 m at the toe.)
- **Maximum contour hole spacing 0.7 m**; distance to the next helper row
  **≤ 0.9 m**.
- Contour and first-helper holes are **charged down**, using specialised piped
  explosive: **0.25–0.45 kg/m (78 % ANFO by weight)**.
- Hard rule: *"no rock should be allowed to protrude inside the theoretical rock
  contour"* `[NFF14]` §7.4.
- A successful round in competent rock leaves **most of the drill holes visible
  in the tunnel contour** — the half-barrel or "half-cast" factor `[NFF14]`
  §7.4.

Corroborating figures from the blast-design literature: contour spacing
typically **0.5–0.7 m** with burden **1–1.25 × spacing**; around the cut, for
45–51 mm holes, spacing and burden both **1.0–1.3 m** at a spacing/burden ratio
of 1:1.1 `[NTNU-BD]`.

### Look-out angle

The drilled profile has to be *bigger* than the theoretical profile, because the
jumbo needs room to set up for the next round inside the hole it just made. The
angle between the drilled and theoretical profiles is the **look-out**. Rule of
thumb: the look-out should not exceed **10 cm + 3 cm per metre of hole depth**
`[NTNU-BD]`. On a 5 m round that is 10 + 15 = **25 cm** of legitimate splay at
the toe.

Look-out is *the* structural cause of overbreak in D&B: every round leaves a
slightly conical over-profile, and longer rounds reduce overbreak per metre
because the boom inclination per round is smaller — *"The increased length of
each blast round also reduces the overbreak along the tunnel axis due to reduced
inclination of each arm during drilling"* `[NFF14]` §7.4.

### Explosives and initiation

`[NFF14]` §7.4 splits Norwegian explosives into four in-game-usable classes:

1. **Reduced-energy contour explosive** — piped, to limit overbreak and
   secondary cracking.
2. **High-energy cartridge explosive** — initiation and heavy-duty work.
3. **Low-cost bulk explosive** — ANFO from standard fertilisers, or
   site-sensitised emulsion.
4. **Non-electric detonators** with highly accurate timing, enabling a wide
   division of the round into delays.

`[KARADON]` uses **capsule delays up to No. 14 at 30 ms intervals** on the
parallel-cut round, and delays 0–6 on the V-cut rounds, firing cut → stoping →
contour.

### KPIs for drill & blast

| KPI | Definition | Target | Source |
|---|---|---|---|
| **Pull** | advance ÷ drilled depth | 82–91 % (long rounds), ~90 % general | `[NFF14]` §7.4, `[NTNU-BD]` |
| **Overbreak** | excavated volume outside theoretical profile | minimise; **zero underbreak permitted** | `[NFF14]` §7.4 |
| **Half-barrel factor** | % of contour holes still visible as half-casts | "most" in competent rock | `[NFF14]` §7.4 |
| **Collaring error** | distance from theoretical collar | ≤ 0.1 m | `[NFF14]` §7.4 |
| **Alignment deviation** | angular error along hole | ≤ 6 % of depth | `[NFF14]` §7.4 |
| **Cycle time** | full round, drill→support | ≈12 h on 100 m² | `[NFF14]` §7.5 |
| **Weekly advance** | m/week | ≈50 m on 100 m² | `[NFF14]` §7.5 |
| **Specific charge** | kg explosive / m³ solid | rising in modern practice | `[NTNU-BD]` |

---

## A2. TBM — the four families

### Selection logic

| Family | Face support | Ground it suits | Ø range | Source |
|---|---|---|---|---|
| **Open / gripper (main beam)** | none — open face, roof shield only | hard, stable rock (granite, gneiss, basalt), strengths **> 250 MPa** | **2–12.5 m** | `[HK-GRIP]` |
| **Single shield** | shield, no gripper; thrusts off the erected ring | unstable rock where grippers cannot brace | — | `[WIKI-TBM]` |
| **Double shield** | telescopic front + gripper shield | **all types of stable and unstable rock**; switches modes | **2.8–14 m** | `[HK-DS]` |
| **EPB (earth pressure balance)** | the conditioned muck itself, held in a pressurised chamber | soft cohesive soils, high clay/silt, low permeability | **1.7–16 m** | `[HK-EPB]` |
| **Slurry / Mixshield** | bentonite suspension under pressure | granular ground with significant water pressure; boulders (jaw/cone crusher) | — | `[WIKI-TBM]`, `[ROB-MIX]` |
| **Multi-mode / crossover** | convertible | ground that changes along the drive; converted in relatively short changeover times | — | `[HK-MM]`, `[ROB-MIX]` |

Two hard limits worth teaching:
- Open-face soft-ground machines suit ground strength **up to ≈10 MPa**
  `[WIKI-TBM]`.
- EPB is used in soft soil with **less than 7 bar** pressure `[WIKI-TBM]`.
- Open gripper TBMs are **not** suitable in highly permeable ground
  (coefficient of permeability K > 10⁻³ m/s) — searched-source claim, treat as
  `UNVERIFIED` pending a primary citation.
- Overall TBM diameters run **1 to 23 m**; the largest cross-section bored as of
  June 2023 was **17.6 m** `[WIKI-TBM]`.

### What the cutterhead does

Disc cutters do not *cut* rock, they **indent** it. A rotating cutterhead presses
discs against the face with contact pressure **exceeding 250 MPa**; the rock
fails in tension between adjacent kerfs and chips spall off sideways
`[HK-GRIP]`, `[HK-DS]`. Buckets on the cutterhead periphery scoop the chips,
chutes drop them onto a central muck ring, and a belt conveyor takes them back
`[HK-GRIP]`. Water jets suppress dust and cool the tools `[HK-GRIP]`.

In soft ground the cutting wheel carries **cutting knives** instead (or as well
as) discs `[HK-AVN]`; a "star type" open cutterhead scrapes rather than indents
`[WIKI-TBM]`.

### Disc cutters and their wear — the consumable economy

Cutter size has climbed steadily with the loads machines can apply `[ROB-CUT]`
Table 1:

| Cutter Ø (inch) | Load rating (kN) | Introduced |
|---|---|---|
| 11 | 85 | 1961 |
| 12 | 125 | 1969 |
| 13 | 145 | 1980 |
| 14 | 165 | 1976 |
| 15.5 | 200 | 1973 |
| 16.25 | 200 | 1987 |
| 17 | 215 | 1983 |
| 19 | 312 | 1989 |
| 20 | 312 | 2006 |

(The year column in the source is offset from the diameter column in the PDF
table extraction; the **diameter → load** pairing is the load-bearing fact and
is used here. Treat the years as indicative.)

Other cutter facts, all from `[ROB-CUT]` unless noted:

- The **19″ cutter increased ring wear volume by 38 %** over the 17″.
- The 19″ runs at **84 % of its bearing's rated capacity (32 t / 38 t)**; the 17″
  ran at **93 % (27 t / 29 t)** — i.e. the newer design deliberately backed off
  the bearing.
- Ring materials went from plain steels to **tool steels and modified tool
  steels**, so today's 19″ rings run at the same tip widths as 17″ rings and
  penetrate at the same rate for only slightly more load. **Increasing tip width
  reduces penetration for a given load** — the fundamental trade.
- Two service paths: **re-ring** (replace ring + lubricant) vs **rebuild**
  (rings, bearings, seals, small parts). The **re-ring-to-rebuild ratio** is the
  consumable-cost KPI.
- **Failure cascades.** If one cutter fails catastrophically (broken ring, seized
  bearing) the cutters in the adjacent paths tend to fail too, and the pattern
  repeats until 5–10 cutters are gone in a group.
- **Seal failure is a death sentence** for a cutter; causes include too much
  drag, face pressure too low, and packing with clay or mud.
- Field cutter life example: Svartisen, Norway (1990), micaschist / granite /
  chalkstone, **UCS 49–196 MPa → 146 m³ per ring**.
- Wear limits: for a 17″ ring the limit is **20 mm**, and the tool is changed at
  **15–18 mm** of wear `[MDPI-CUT]`.
- Change time: **45–60 minutes per cutter changed** `[NFF11]` §5 (NTNU model,
  parameter *t_c*).
- Chief hazard of not stopping: an undetected failed cutter or a steering error
  can wreck a cutterhead, and repairs take **days to weeks** `[ROB-CUT]`.
- On a closed machine, reaching the cutters means entering the excavation chamber
  **under hyperbaric conditions** or at pre-grouted intervention locations
  `[MDPI-CUT]`.

### The gripper boring cycle — a real state machine

From `[NFF11]` §5.2 (5 m main-beam machine, **1.8 m stroke**):

1. Anchoring section forward, **grippers extended** against the sidewalls, rear
   support legs lifted off the invert. Head rotating, thrust cylinders extend and
   drive the working section forward the **full 1.8 m stroke**.
2. End of stroke: **cutterhead rotation stops**, rear support legs set down on
   the invert to carry the rear weight.
3. **Grippers retract**; the anchoring section is reset by retracting the thrust
   cylinders.
4. Grippers re-pressurised against rock, rear legs lifted, **machine aligned for
   line and grade**.
5. Rotation restarts — next stroke.

The Kelly-type variant runs a **1.5 m stroke**, is anchored by *four* grippers
so it is directionally stable, and can therefore only be **steered at reset**
`[NFF11]` §5.3–5.4. Steering on the main-beam type is done during boring by
individually controlling the grippers and auxiliary cylinders `[NFF11]` §5.1.

**This is the TBM's rhythm: bore stroke → regrip → bore stroke.** It is not a
hole. It is a two-beat loop with a dead beat in it.

### The double-shield's two modes

- **Gripper mode** (stable rock): grippers brace radially, the front shield
  advances *while segments are erected in the tailskin* — "almost continuous
  tunnelling" `[HK-DS]`.
- **Auxiliary thrust mode** (fault zone / weak rock): the telescopic shield is
  fully retracted, front and gripper shields become one unit, and advance and
  ring build become **sequential** `[HK-DS]`.

Performance reference: 250 m per week of bored and lined tunnel on one project
`[HK-DS]`.

### EPB — pressure, screw, and the muck as a machine part

`[HK-EPB]`:

- The cutting wheel loosens soil, which enters the excavation chamber. **When the
  chamber is completely filled**, it prevents uncontrolled inflow and *becomes*
  the face support.
- The **bulkhead** transfers thrust into the soil mass; **pressure sensors**
  monitor earth pressure continuously.
- **Mixing arms** on the wheel and bulkhead knead the conditioned soil to the
  right consistency.
- The **screw conveyor** regulates support pressure by its rotation speed: the
  interplay of *screw speed* and *advance rate* is the pressure control loop.
- **Soil conditioning** — water, bentonite, foam — is what widens EPB's
  geological range into heterogeneous gravels, sands and water-bearing ground.
- **Thrust cylinders** push off the last erected ring.
- The **segment erector** is a *remote-controlled, movable vacuum manipulator*.

### Slurry / Mixshield

Bentonite slurry is injected through the cutterhead, supports the face
hydraulically, and carries the spoil in suspension; it is **pumped out of the
tunnel to a separation plant, typically outside the tunnel** `[WIKI-TBM]`. Jaw
crushers deal with boulders `[WIKI-TBM]`. Mixshield handles mixed soft
soil/rock with enhanced crushing and pressure regulation `[WIKI-TBM]`.

### Segment erection and ring build

- Segments are **placed, bolted and sealed immediately after each advance under
  the protection of the shield**, by the erector.
- A **universal ring** is several identical segments plus one smaller **key
  segment** that closes the ring; the key is usually wedge-shaped.
- **EPDM gaskets** are extruded and glued into grooves around the segment
  circumference at the precast plant, right after demoulding, to seal the joints
  against water ingress.
- **Bolts and dowels are temporary**: they keep the radial and circumferential
  gasket compressed when the TBM ram is released, and hold the segment's weight
  while a ram is retracted to place the next one.
- Ring build time is set by the segment hoist and erector, and is *fundamental to
  the production cycle duration*.
  (All of the above from the segmental-lining literature surfaced in search:
  https://www.tunneltalk.com/TunnelTECH-Feb2020-Segmental-lining-quality-concerns.php ;
  https://www.tunnelsandtunnelling.com/analysis/segment-handling-and-installation/ ;
  https://www.robbinstbm.com/wp-content/uploads/2017/04/5_SegmentDesign_WTC2016.pdf)
- Neoprene seals and annulus grouting reduce water ingress behind the ring
  `[WIKI-TBM]`.

### Muck removal

- **Belt conveyor** — standard on hard-rock and most shielded machines; the
  conveyor is extended as the drive advances (a Norwegian project used an
  extensible continuous conveyor system) `[WIKI-TBM]`, `[NFF11]`.
- **Muck cars on rail** — traditional, and still used on long small-diameter
  drives.
- **Slurry pipeline** to a separation plant — slurry machines only `[WIKI-TBM]`.
- **Rubber-tyred trucks** — used behind the backup where the tunnel is big
  enough; one Norwegian project turned the trucks immediately behind the backup
  `[NFF11]`.

### The backup — most of the machine's length

The trailing support deck behind **all** TBM types carries `[WIKI-TBM]`:

- conveyors / muck removal
- slurry pipelines (where applicable)
- **control rooms**
- electrical, dust-removal and ventilation systems
- worker quarters and **refuge chambers**
- precast segment transport

On a hard-rock gripper machine the backup is also where **permanent support** is
installed: `[HK-GRIP]` names the **L1 working area** directly behind the
cutterhead (rock anchors, steel mesh, steel ring beams, under a roof shield) and
the **L2 back-up area** (shotcrete application, invert segment installation).

### The NTNU prediction model — the KPI stack

`[NFF11]` §"Prediction model" (based on data from **230 km of tunnels**) is the
model to implement. Its step-by-step outputs are exactly the KPIs the game
needs:

- **Net penetration rate (m/h)**
- **Cutter life (h/cutter, sm³/cutter)**
- **Machine utilisation (%)**
- **Weekly advance rate (m/week)**
- **Excavation cost (currency/m)**

Rock-mass inputs: degree of fracturing (Fracture Class) and the angle between
tunnel axis and planes of weakness; drillability (DRI); abrasiveness (CLI) and
quartz content; porosity for some rock types `[NFF11]`.

**Fracture classes** (spacing between planes of weakness) `[NFF11]` Table 1:
class 0 (massive) → 0-I **1600 mm** → I- **800 mm** → I **400 mm** → II
**200 mm** → III **100 mm** → IV **50 mm**.

Two facts that should drive the game's difficulty curve:

- Estimated penetration rate is **increased by a factor of five** from a
  homogeneous to a well-fractured rock mass `[NFF11]`.
- For a homogeneous rock mass, penetration rate rises by a **factor of two** from
  extremely low to extremely high DRI `[NFF11]`.

So **fracturing beats hardness**, by a lot. A TBM's best day is in broken ground
— which is also where the support cost explodes. That tension is the game.

Machine inputs: average cutter thrust, average cutter spacing, cutter diameter,
cutterhead RPM, installed cutterhead power. *"For boring in hard rock, the
average cutter thrust (kN/cutter) is the most important machine parameter"*
`[NFF11]`. A high-power machine on **483 mm (19″)** cutters typically has a
penetration rate **40–50 % higher** than a standard machine on **432 mm (17″)**
cutters `[NFF11]`.

**Machine utilisation** = net boring time as a percentage of total tunnelling
time, where total time comprises `[NFF11]`:

- boring (T_b)
- **regripping** (T_t)
- **cutter change and inspection** (T_c)
- TBM maintenance and service (T_tbm)
- back-up maintenance and service (T_bak)
- miscellaneous (T_a): waiting for transport, laying and maintaining track or
  roadway, water / ventilation / cables, **surveying**, cleaning, normal rock
  support in good rock, crew change and travel.

The published time-consumption curves are based on **101 h/week** `[NFF11]`.

### Real TBM performance envelope

Meraaker Hydro Electric Project, **3.5 m diameter** high-performance machine,
10 km transfer tunnel bored in under 11 months, geology from **metagabbro at
UCS 300 MPa** through greywacke/sandstone mixed faces to soft phyllite
`[NFF11]` §11:

- Best shift (10 h): **69.1 m**
- Best day (two 10 h shifts): **100.3 m**
- Best week (100 shift hours): **426.8 m**
- Best month (430 shift hours): **1358.0 m**
- **Average weekly advance: 253.0 m**
- Fastest recorded start-up month: **1028.9 m**

Compare with drill & blast at ≈50 m/week on 100 m² `[NFF14]`. **A TBM is 5× the
advance rate and cannot turn a corner tightly, cannot change its diameter, and
costs a fortune to mobilise** — that is the whole strategic choice.

Modern figures for context: over **700 m/week** in rock and over **200 m/week**
in soil in 21st-century practice `[WIKI-TBM]`.

---

## A3. Roadheader — where it beats drill & blast

### The machine and its limits

`[WIKI-RH]`:

- A roadheader is **a boom-mounted cutting head, a loading device with a
  conveyor, and a crawler track**.
- **Transverse** head: rotation axis parallel to the boom; picks rip the rock.
  **Axial / longitudinal** head: rotation axis along the boom.
- Installed cutting power: **≈40 kW (light) to over 400 kW (heaviest class)**.
- Machine weight: **≈26 t to over 100 t**.
- Cross-sections typically **25–80 m²**.

**Rock strength ceilings** `[WIKI-RH]`:

| Head type | Massive rock | Fractured / jointed rock |
|---|---|---|
| Axial (longitudinal) | 60–80 MPa UCS (non-abrasive) | up to 100 MPa |
| Transverse | 100–120 MPa UCS | 160–180 MPa |

Corroborated: longitudinal heads are mainly used for rapid excavation with UCS
**≤ 100 MPa**; the general efficient-operation limit is **< 120 MPa**, extending
to **160 MPa** in laminated or fractured rock `[PLOS-PICK]`.

### Picks and pick wear

- **Radial (point-attack)** picks in fixed holders: soft, non-abrasive material
  (coal, salt) up to **40–60 MPa** `[WIKI-RH]`.
- **Conical (tangential-rotary)** picks with rotating shanks that distribute
  wear: rock up to **100–120 MPa** `[WIKI-RH]`.
- Pick consumption models depend on cutting speed, rock volume cut per pick, pick
  rotation coefficient, UCS and the **CERCHAR abrasivity index**; consumption
  **can exceed 5 picks/m³** in harder rock `[PLOS-PICK]`.
- A development target of **≥ 30 m³/h net cutting rate at 120 MPa UCS** was set
  in the ICUTROC work `[TT-ICUT]`.

### Utilisation

Productivity = **instantaneous cutting rate (ICR) × machine utilisation time
(MUT)**, and MUT is typically **20–50 %** depending on the support methods used
`[WIKI-RH]`. Same lesson as the TBM: the cutting is not the bottleneck, the
support and the logistics are.

### When to choose it

Roadheaders beat drill & blast when:

- The section is **non-circular or variable** — a station cavern, a cross
  passage, a niche, a portal. A TBM cannot do these at all; a roadheader shapes
  them directly.
- **Vibration is unacceptable** — under buildings, near sensitive structures, in
  urban ground. No explosives, no re-entry wait, no blast-vibration limit.
- **The rock is soft enough** — below the UCS ceilings above.
- **A gassy environment makes explosives painful** — the whole `[KARADON]`
  design study exists because a gassy coal mine's legal limits on charging
  length, stemming and permitted explosives constrain blast design severely.
- **Overbreak must be minimal** — the head cuts to the profile rather than
  splaying to a look-out.

They lose to drill & blast in hard, abrasive rock (pick cost explodes) and to a
TBM on long, straight, constant-diameter drives.

Reference scale: in Melbourne's City Loop, roadheaders let **around 80 % of the
excavation be done mechanically** `[WIKI-RH]`.

---

## A4. Ground support and pre-support

`DOMAIN.md` §3 already carries all of this in super-group **E. Ground
Engineering & Anchoring** (Rock Bolts, Soil Nails & Cable Bolts, Resin
Cartridges, Mesh Surface Support & Grout, Self-Drilling Anchors) and **C.**
(Grouting & Injection → Shotcrete, Jet Grouting Monitors & Nozzles, TAM sleeve
tubes). Use those names.

### The two-stage philosophy

Support is installed in two stages `[NFF14]` §6.1:

- **Temporary support** — the **contractor's** responsibility; ensures a safe
  working environment during construction.
- **Permanent support** — the **client's** responsibility; must meet long-term
  durability for the design life (**50 years for road tunnels** in Norway).

The Norwegian speciality is to let the temporary support **become part of** the
permanent support — which forces the temporary materials to meet permanent
specifications `[NFF14]` §6.1. Good game economy: cheap temporary support = a
second bill later.

### Rock bolts

Types and anchoring, from `[NFF14]` §6.2:

| Type | Anchoring | Use |
|---|---|---|
| Steel rebar bolt, **expansion shell** end anchor | mechanical, instant | traditionally temporary |
| Steel rebar bolt, **fully cement-grouted** | full-length bond | permanent; considered *the optimal bolt for hard rock*, except where large stress-induced deformations are expected — it beats point-anchored and friction bolts under **shear loading** by its instantaneous high-strength dowel effect (Stjern, 1995, cited in `[NFF14]`) |
| Rebar bolt, **resin capsule** end anchor | resin | now widely used and **approved for permanent support**, with 30 years of documented service |
| **Combination bolt** (expansion shell + grout injection arrangement) | mechanical first, grouted later | installed as an end-anchored temporary bolt, grouted later to become permanent |
| **Self-drilling anchor (SDA)** hollow bar | drilled and grouted in one operation | where drill holes collapse — *"If very difficult rock conditions occur, one may experience drill hole rupture. Under circumstances self-drilling bolts … that can be grouted might be advantageous"* `[NFF19]` §4.3.1 |

Corrosion protection `[NFF14]` §6.2: **hot-dip galvanising** is the general
standard; **combi-coat** (epoxy powder coat *over* hot-dip galvanising) is used
in harsh environments — salinity and exhaust fumes in sub-sea road tunnels.

Scale: **about 250 000 rock bolts are used in Norway every year**, most for
tunnel support `[NFF14]` §6.2.

Regulatory: *"Torque wrenches shall be used wherever bolts that depend on
torsionally applied force are used for ground support"* `[OSHA-800]`
§1926.800(o)(3)(iv)(A).

The SDA hardware family (hollow anchor bars, couplers, nuts, bearing and domed
plates, centralisers, grout swivels, sacrificial drill bits) is documented as a
tooling ladder in `[EMDE-ANK]` — that catalogue's *Ankerbohren* section is the
correct vocabulary for the game's anchor-tooling shop items. It also shows the
**lost-bit** convention explicitly (`Rammspitze … / Lost bit`) and the ring-bit
convention (`Ringbohrkrone …` casing crowns), consistent with the
`PLATFORM_TRUTH.md` Part C precision rules.

### Spiling / forepoling (rebar spiles)

Full numeric spec from `[NFF19]` §4.3.1:

- Purpose: **pre-bolting** to hold the planned theoretical cross-section until
  permanent support is installed. Normally temporary → **no corrosion protection
  required**, unless combined with sprayed-concrete arcs, in which case the bolts
  become part of the permanent construction and **must** be corrosion-protected.
- Material: ordinary ribbed reinforcement steel, grouted so bolt and rock mass
  work together. **Ø32 mm deformed steel is advantageous** (less deflection, less
  rockfall risk) although **Ø25 mm remains common** because it is easier to
  handle.
- **Length: 6 m**, of which **1 m** is used to hang up at the rear edge. 8 m has
  been tried.
- **Spacing along the arch: ≈0.3 m (range 0.2–0.6 m)**; in very poor ground,
  reduce to **0.2 m**.
- **Burden between bolt rows 1 and 2: 2.3–3 m**.
- **Angle to the tunnel axis: 10–15°.**
- Resulting distance between bolts ≈**0.5 m**.
- **A spiling set should never be fewer than 5 bolts.**
- **There must be one radial bolt for every spile** (back anchorage), with steel
  straps and fibre-reinforced sprayed concrete.
- **Round length must be limited to 2.5–3 m (max 3 m)** when using 6 m spiles, so
  there is always overlap with the previous set and enough material at the rear
  for anchorage.
- Installation: hole filled with expanding mortar, bolt squeezed in with the
  drilling machine on the jumbo.
- If a weakness zone is right at or ahead of the face, place the pre-bolts **a
  couple of metres behind the face** to get back anchorage.
- **Stop the water first.** In-leakage must be reduced by grouting *before*
  spiling, or water in the bolt holes washes the grout out before it hardens.

**Design consequence for the game:** entering bad ground *forces the round length
down from 4.5–5 m to 2.5–3 m*. That is a 40 % productivity hit that the player
should feel immediately and understand exactly.

### Pipe screens and pipe umbrellas (forepoling with pipes)

Two variants, both real:

**Norwegian "simpler" pipe screen** `[NFF19]` §4.3.2:
- Pipe diameter **Ø75–120 mm**, wall thickness **5–7 mm**.
- Pipes can be **drilled almost without deviation to 15–20 m**, giving accurate
  placement — a stated advantage over rebar spiles.
- The bigger diameter makes the reinforcement stiffer → better protection against
  rockfall.
- Grouted **either** by pumping grout through the pipe (filling the annulus and
  penetrating the rock along the pipe) **or** by injecting in sections at
  different distances ahead of the face via **valve tubes or perforated pipes**
  for controlled penetration.
- Advantage over rebar spiles: **collapsing drill holes stop being a problem**.

**Central-European pipe umbrella / canopy tube** `[UMB]`:
- Pipe length usually **12 m or 15 m**, diameter **114 mm**.
- Spacing **0.3–0.6 m** around the crown.
- Installed every **8 m** to give a minimum **4 m overlap** (12 m pipes); or 15 m
  pipes with **5 m overlap** in common Central-European practice.
- Also called *canopy tube system*, *umbrella arch method*, *long forepoling*.
- Grouted in place through the casing and grouting valves.

### Choosing pre-support by ground quality

`[NFF19]` Table 6 maps rock-mass quality to what must be installed **ahead of the
face**:

| Q value (guiding) | Support ahead of the face |
|---|---|
| **0.001–0.02** | **Pipe screening / jet grouting / freezing** |
| **0.02–0.2** | **Bolting at face** |
| **> 0.2** | Bolting at large blocks, near-horizontal stratification, low tension, at outbreak |

This is a ready-made three-band difficulty ladder for the game.

### Shotcrete (sprayed concrete)

**Process.** Two families `[WIKI-SC]`:
- **Dry-mix**: dry ingredients in a hopper, conveyed pneumatically, water added
  by the operator at the nozzle. Water content adjustable instantaneously; **more
  rebound and more dust**; good for repair work with frequent stops.
- **Wet-mix**: pre-mixed concrete pumped to the nozzle, compressed air added at
  the nozzle. **Less rebound, less waste, less dust; larger volumes placed
  faster.**

In Norway, sprayed concrete is performed **by the wet-mix method and fibre
reinforced** `[NFF14]` §6.3.1.

**Numbers** (all `[NFF19]` §5 unless noted):
- **Steel fibre dosage 20–40 kg/m³**, fibre length **30–40 mm**.
- **Macro plastic fibre 5–7 kg/m³** — a relevant alternative where big
  deformations are expected, and stable in aggressive environments such as
  sub-sea tunnels.
- **Polypropylene monofilament fibre ≈2 kg/m³** for fire spalling protection
  (fibres melt under heat) — also produces fewer shrinkage fissures.
- **Mesh reinforcement**: standard mesh has **150 × 150 mm openings and 5 mm
  wire**; mesh must be anchored with bolts on each side of the zone before
  spraying; openings must not be so small that concrete cannot reach the rock.
- **Alkali-free accelerator** properties: **> 1 MPa at 1 hour**, no loss of final
  strength, **can be applied in 40–50 cm layers**, reduced rebound and dust.
  Concrete temperature must be **≥ 20 °C**; lower temperatures need higher
  dosage.
- The accelerator meets the concrete **in the nozzle**. At a jet velocity of
  **30–35 m/s** and a nozzle-to-rock distance of **3 m**, the flight takes
  **0.1 s** — that is the entire window in which the mix has to become a
  structural material.
- **Adhesion is the property that matters most.** Clean the surface; use
  compressed air rather than water where adding water would cause further
  rockfall. With serious leakage, **drill drain / relief holes** around the
  profile, collared from already-supported ground further back.
- Shotcrete's biggest limitation is **thick clay zones** and anywhere with poor
  adhesive strength — use something else there.
- **Sprayed concrete "arch"**: with alkali-free accelerators you can spray thick
  fibre-reinforced layers continuously to reach the **30–50 cm** thickness of a
  cast-in-situ concrete arch.

**Thickness and durability** `[NFF14]` §6.3.1:
- A **minimum thickness of 60 mm** has been required for Norwegian road tunnels
  since the durability study.
- Delamination is predominantly seen in **tunnels older than 20 years with layers
  thinner than 20 mm**.
- Sub-sea tunnel sprayed concrete since 1996: **C45, environmental class Medium
  Aggressive**.
- Stress measurements in spalling tunnels showed the stress level in the fibre
  layer was **nearly zero** — the sprayed concrete's job is to **stabilise rock
  particles so the rock mass keeps its own self-carrying capacity**, not to carry
  load. This is a genuinely counter-intuitive fact worth teaching in-game.

**Sealing layer in NATM**: **25–50 mm** of sealing shotcrete applied immediately
after the face is opened `[WIKI-NATM]` and supporting NATM literature.

**Timing against rock stress** `[NFF19]` §4.5.1 — the ratio σ_c/σ₁ (rock
compressive strength over major principal stress) sets both the material and the
clock:

| σ_c / σ₁ | Behaviour | Correct support |
|---|---|---|
| 10–5 | wall problems | fibre shotcrete **energy absorption class E700** + end-anchored bolts (e.g. polyester anchorage) |
| 5–3 | spalling in massive rock **≈1 hour after blasting** | fibre shotcrete **E1000** + end-anchored bolts with plates outside the concrete |
| 3–2 | spalling **within a few minutes** | thin layer (**≈5 cm**) of high-absorption shotcrete **before** bolting; another layer after the next blast |
| < 2 | intense spalling | shotcrete and bolts, repeated several times; high energy-absorption class, sprayed **all the way to the invert**; face bolting may also be needed |

In spalling ground the sequence is: shotcrete to **5–6 cm** *first*, then
end-anchored threaded bolts with (usually triangular) plates screwed against the
concrete **without pre-tensioning**, then another shotcrete layer after the next
round `[NFF19]` §4.5.1.

### Lattice girders and steel sets

`[NFF19]` §4.5.3:
- A lattice girder in its simplest form is **three rebars assembled into an
  oblong lattice with a triangular cross-section**, curved to the theoretical
  tunnel contour and **entirely embedded in sprayed concrete**.
- Assembled end to end they form a continuous rib with a perfect arc from floor
  to floor.
- Advantages: **quick installation, even pressure arch**.
- Limitations: they must be **prefabricated to the theoretical cross-section**,
  so **local adaptation to rockfall or inaccuracy is impossible**; big gaps
  behind the girders are common and are filled with shotcrete or inflatable
  cement bags. **Lattice girders are non-deformable.**

In NATM generally, primary support is *"shotcrete in combination with fibre or
welded-wire fabric reinforcement, steel arches (usually lattice girders), and
sometimes ground reinforcement"* `[WIKI-NATM]`.

### Deformable support for squeezing / high stress

`[NFF19]` §4.5.2:
- The contour should be **approximately circular** so the support works as a
  pressure arch over the whole profile, **invert included**.
- Design as a **circular, telescopic, deformable ring**: circular steel girder
  elements that **slide into each other at the joints**, so the whole section can
  shrink homogeneously.
- Strengthen with **> 40 cm** of sprayed concrete, with **evenly distributed
  slots** that allow significant radial deformation without collapse.

From the mechanics literature: today's usual solution is **steel sets with
sliding connections plus shotcrete**, top-hat section, hoop force controlled by
the number and pre-tension of **friction loops**, with up to four loops giving
about **150 kN sliding resistance per connection** `[YIELD]`, `[SQZ]`.

### Probe drilling ahead of the face

`[NFF19]` §2.2 gives the whole toolkit:

- **Top hammer probe hole** — drilled with the normal jumbo. *"In principle a
  drill hole of this type is to be considered a pinprick"* whose main purpose is
  to find the **distance** to a geological event: water leakage, altered zones,
  noticeable cracks or joints. Decides whether to keep excavating, inject,
  pre-bolt at the face, or bring in heavier investigation.
- **Control drilling after grouting** — swift and efficient way to check whether
  the grouting worked and whether more is needed.
- **Core drilling** — direct sampling of the zone; reveals cracks and altered
  zones. Limitation: **loose material or incompetent rock causes core loss**.
  Can be done from a niche to avoid stopping the heading — indirect costs of
  stopping the heading are the real expense.
- **Water-loss (Lugeon) tests** — pump water into the rock at a pressure above
  static; measure in **short sections of 1–3 m** so conductivity in Lugeon is
  detailed. Note honestly: *"it is difficult to predict grout quantities based on
  the measured Lugeon values"* — they indicate degree and size of fracturing.
- **Leakage and pressure measurement** — buckets and a stopwatch is the common
  method; insert a short piece of rubber hose matching the hole diameter to
  capture the flow; for subsea tunnels and high overburden, fit a **packer with a
  pressure gauge**.
- **Drill-hole tomography** (seismic, electrical, geo-radar) between probe holes
  or probe hole and surface — but it **halts excavation**, so use it only when
  there are indications of serious stability problems.
- **Deformation monitoring**: tape extensometer between measuring bolts with
  reflective platters, accuracy **≈1/10 mm** of the deformation.

### Pre-grouting ahead of the face

`[NFF14]` §9 — this is the water-control method, and it is systematic, not
reactive:

- Norwegian projects have worked to allowable inflows of **2–10 litres/minute per
  100 m** of tunnel, to avoid settlement of buildings and impact on nature.
- **Almost 100 % of grouting work is systematic pre-grouting with suspensions** —
  ordinary Portland cement or micro cements. Roughly 10 km of tunnel per year
  grouted with more than 5 000 t of grout.
- Typical **grouting pressures 3–8 MPa, maximum quoted 10 MPa**. *"Use of high
  grouting pressure even when the rock cover is small is effective/necessary to
  seal the rock."*
- **Water/cement ratio 2.0–0.4**, with **1.0–0.5 as the regular** w/c.
- **Grout intake 14–103 kg per m² of tunnel surface** (whole-tunnel averages).
- **Grout hole quantity 0.57–2.1 m per m²** of tunnel surface.
- Adding **micro silica** to standard and micro cement is a success.
- Why it matters beyond dryness: in populated Norwegian areas soft marine clay
  overlies hard rock; **dropping the pore pressure causes settlement at the
  surface**, so pre-grouting is mandatory there `[NFF14]` §9.
- Grouting equipment: computerised units delivering grout to **several holes
  simultaneously** `[NFF14]` §7.2.

### Jet grouting (HDI) as pre-support

- Result of a jet-grouting pass: an oblong, almost cylindrical body of in-situ
  mixed soil and cement mortar, **40–80 cm diameter** `[NFF19]` §4.3.
- Suits **clay, silt and sand fractions with low or moderate consolidation**;
  over-consolidated material such as bottom moraine resists fragmentation
  `[NFF19]` §4.3.
- Tooling ladder from `[EMDE-ANK]` (*HDI-Bohren / Jet Grouting*):
  - **Single-fluid (1-fach)** string on **Ø88.9 mm** tube; **double-fluid
    (2-fach)** on **Ø88.9 and Ø114.3 mm**.
  - Components per string: **jet-grouting flushing head** (with seal set and
    thread O-ring), **tube** in **0.5 / 1.0 / 1.5 / 2.0 / 2.5 / 3.0 m** working
    lengths, double nipple, **nozzle holder (Düsenstock)**, **jet-grouting
    nozzle (HDI Düse)**, **steel-ball reception / non-return valve**, and an
    **automatic valve**.
  - Bits: **3-wing bit** and **step bit**, each available *with flushing bore* or
    *with nozzle thread*; **roller bit** with flushing and nozzle thread; and a
    3-wing bit with **integrated nozzle holder**.

This maps directly onto the existing `jet-grouting` method in `DOMAIN.md` §1 and
gives the tunnelling branch its pre-support upgrade path.

---

## A5. Microtunnelling and pipe jacking

### The definitions, kept straight

- **Pipe jacking**: pipes are thrust into the ground from a launch shaft while
  controlled excavation happens at the face; the pipe train advances between a
  launch shaft and a reception shaft `[PJA]`.
- **Microtunnelling**: originally the term for **fully automated, non-man-entry**
  pipe jacks in small diameters; now also applied to fully automated pipe jacks
  in larger diameters controlled from above ground `[PJA]`. `[UW-PJ]` gives the
  operational definition: *remotely controlled and guided pipe jacking that
  supports the excavation face and does not require personnel entry*.
- Man-entry threshold in the North American notes: **pipe diameters greater than
  900 mm (36″)**, with 1075 mm (42″) quoted for larger-diameter work `[UW-PJ]`.

### Numbers

| Parameter | Value | Source |
|---|---|---|
| Standard pipe diameters | **150–2400 mm**, or greater when required | `[PJA]` |
| Jacking lengths | **considerably in excess of 1 km** depending on diameter, ground and excavation method | `[PJA]` |
| Microtunnelling machine range (one manufacturer) | up to **OD 4.8 m**; pipe jacking from **DN250**, segmental lining from **DN3200**; drives **> 1000 m** with interjacks | `[HK-AVN]` |
| Frictional resistance | **0.5–2.5 tonnes per m²** of external circumferential area; as low as **0.1 t/m²** with sophisticated lubricant injection | `[PJA]` |
| Lubrication effect | bentonite can **reduce jacking force by 50 %** | `[UW-PJ]` |
| Interjack station capacity | **100 to 1600 tons**; ≈36″ diameter, 56″ long; assembled in four segments; must match pipe diameter | `[UW-PJ]` |
| Joint packing | **12–19 mm plywood**, or **12–25 mm** manila rope / jute / oakum, for joint cushioning and flexibility | `[UW-PJ]` |
| Line-and-level tolerance | **±50 mm** at any point in stable, self-supporting, homogeneous ground | `[PJA]` |
| Guidance accuracy (microtunnelling) | **better than ±25 mm per drive**, laser-controlled | `[UW-PJ]` |
| Environmental benefit | carbon emissions reduced by **up to 75 %** vs open cut | `[PJA]` |

### The jacking mechanics

Jacking load is dominated by **friction around the pipeline**, which depends on
the ground's arching characteristics and friction angle, overburden depth,
groundwater depth, surcharge, pipe length and diameter, and **the time taken for
the operation** — stop for too long and the pipe sticks `[PJA]`. Contractors use
empirical values because soil mechanics does not predict it reliably `[PJA]`.

**Jacking force must not exceed the allowable pipe compressive strength**, and
the critical design location is **the joints** — low surface area, high stress
`[UW-PJ]`.

**The interjack sequence** `[PJA]`:
1. A twin pipe set with an extended steel collar sliding over a matching spigot
   is built into the pipeline; hydraulic jacks sit between the two opposing
   pipes.
2. When the main jacks reach their design value or run out of thrust, the pipes
   **behind** the interjack are held stressed back to the thrust wall.
3. The interjack jacks open, advancing the **forward** section.
4. At the end of the interjack stroke, the main jacks advance the rear of the
   pipeline back to its original relative position, **closing the interjack**.
5. Repeat. At completion the jacks and fittings are removed and the interjack is
   closed up permanently.

Interjacks also **reduce the load transmitted into the shaft structure** — useful
where the launch-shaft ground is poor `[PJA]`.

### The MTBM itself

`[HK-AVN]`, a slurry-pressure microtunnelling machine:
- Cutting wheel with **cutting knives and disc cutters** matched to the ground.
- A **cone crusher**: cutterhead rotation crushes stones and obstructions that
  enter the crusher cone down to conveyable grain size; high- and medium-pressure
  nozzles keep the cone free of clogging in adhesive and cohesive soils.
- **Closed slurry circuit** to a separation plant; **bentonite injected into the
  annular gap** to reduce friction during jacking.
- **Articulation joints and steering cylinders** for control in all directions.
- A **laser target** in the machine detects the laser beam transmitted from the
  launch shaft — that is the whole guidance system.

Face-support options across the family are the same as the rest of tunnelling:
open shield with a cutter boom or backacter, EPB, or pressurised slurry `[PJA]`.

Slurry vs auger spoil removal `[UW-PJ]`: the **slurry method** carries spoil in
suspension to a separation plant (water and solids split, water re-injected); the
**auger method** runs a continuous flight of augers inside a separate guiding
pipe. Auger boring is the drier, cheaper, less steerable option.

### KPIs

- **Jacking force vs pipe capacity** — the hard constraint.
- **Line-and-level deviation** — ±50 mm (pipe jack) / ±25 mm (microtunnel).
- **Lubrication effectiveness** — friction driven from 2.5 down toward 0.1 t/m².
- **Drive length achieved between shafts.**
- Shaft count is the real cost driver: every extra shaft is surface disruption,
  which is the reason the method exists at all.

---

# B. The professions

Drillity Talent already lists **Tunnel Boring Operator** and **Tunnel Engineer**
(`DOMAIN.md` §7). The real underground crew is much wider. Below, each role has:
what the shift looks like, where it sits in the crew, the tickets, and the career
path.

### The crew structure that actually exists

The single most useful primary description is the Norwegian D&B shift crew
`[NFF14]` §7.2:

> - The shift crew consists of a **shift supervisor** and **a maximum of three
>   tunnel workers at the face**: one **driller (the leader)**, one **mechanic**
>   and one **charger**. In addition **1–2 workers** for mechanical repair,
>   service facilities and maintenance.
> - The **sprayed concrete robot operator** could be one of the face crew, but in
>   many cases the work is **subcontracted to specialised companies**.
> - The **wheel loader for mucking out** is normally operated by one of the crew;
>   **transport is subcontracted**.
> - The number of trucks depends on transport length and cross-section; the
>   temporary road inside the tunnel is often **paved** to raise truck speed.
> - **Service works** (ventilation duct, water and air supply) are done by one of
>   the tunnel crew plus an additional operator.
> - A **chief mechanic** and the tunnel mechanic do heavy maintenance; vendors are
>   often contracted for service.
> - The **surveyor may not be a full-time job** and is often integrated into the
>   QA/QC department, also doing some quantity surveying.

`[NFF14]` §7.2 also names the decision structure: *"The shift supervisor and the
shift leader together with the client's resident engineer handle the daily
tunnelling matters."* That is a three-way relationship the game can model as a
real pressure — contractor, shift, and client's engineer.

And the education note is important for the game's Talent framing: *"a driller
has to be fully trained in the use of computers and the surveyor has to operate
advanced computer software"* `[NFF14]` §7.2. These are not unskilled jobs.

Regulatory crew requirements `[OSHA-800]`:
- A **check-in/check-out procedure** so above-ground personnel always know
  exactly how many people are underground (§1926.800(c)).
- **At least one designated person on duty above ground** whenever anyone is
  working underground (§1926.800(g)(3)).
- **Rescue teams**: 25 or more employees underground → **two 5-person teams**
  (one on site or within 30 minutes, one within 2 hours); fewer than 25 → **one
  5-person team** on site or within 30 minutes (§1926.800(g)(5)).
- A **competent person** must inspect roof, face and walls **at the start of each
  shift** and as often as necessary (§1926.800(o)(3)(i)(A)).
- **Self-rescuers immediately available** to all employees at work stations
  underground (§1926.800(g)(2)).

### The roles

| Role | What the shift is | Crew position | Tickets | Career path |
|---|---|---|---|---|
| **Jumbo operator / driller** | Positions the rig at the face, lets the rig detect chainage and pull the pattern from the tunnel design, monitors the automated round, verifies the previous round's profile on the onboard screen, transfers data to QA/QC `[NFF14]` §7.3. Also drills bolt holes — bolt drilling is mainly done by the jumbo `[NFF14]` §7.2. | **The leader of the face crew** `[NFF14]` §7.2 | Underground competency (e.g. CSCS **Tunnelling Operative** card, requiring a **VQ Level 2 Award in Tunnelling Operations (Construction)** `[CSCS-TUN]`); **CITB TSTS** tunnelling safety course, certificate typically valid **3 years** `[TSTS]` | Tunnel worker → charger/driller → shift leader → shift supervisor |
| **Charge hand / shot firer / blaster** | Charges the round: bulk explosive into production holes, piped reduced-energy explosive into contour, cartridge primers, detonator delays; connects and fires; post-blast inspection. | One of the three at the face `[NFF14]` §7.2 | **Regulated.** Germany: **Befähigungsschein under §20 SprengG**, obtained by a state-approved *Sprengschule* course plus an examination before the competent authority; **usually limited to 5 years**; for mining and tunnel construction (*Hohlraumbau*) the application goes to the **mining authority** `[SPRENG]`. Austria: the equivalent qualified person is the **Sprengbefugter**, who must complete legally prescribed blasting-technique training `[SPRENGBER]`, `[SPRENG]`. | Driller → charger → shot firer → blasting supervisor |
| **TBM operator** | Drives the machine from the control cabin in the backup: thrust, cutterhead RPM, torque, steering (grippers or articulation), face pressure on a closed machine, screw speed on an EPB `[HK-EPB]`, `[NFF11]`. Runs the bore-stroke/regrip loop; stops the head the instant a cutter reads wrong, because an undetected failed cutter propagates `[ROB-CUT]`. | Cab of the backup; the pivot of the whole drive | Underground competency as above; machine-specific training `UNVERIFIED` as a formal ticket regime | Miner → TBM crew → TBM operator → TBM shift boss → TBM superintendent. In Talent's vocabulary this is the existing **Tunnel Boring Operator**. |
| **Ring builder / erector operator** | Places, bolts and seals each segment behind the shield under shield protection, key segment last; ring build time sets the production cycle. | TBM shield area | as above | Segment handler → erector operator → TBM operator |
| **Grouting crew** | Drills grout holes, runs computerised grouting stations that feed **several holes simultaneously** `[NFF14]` §7.2; mixes to a w/c of 1.0–0.5, pumps at 3–8 MPa, watches take against the 14–103 kg/m² envelope, then drills control holes to prove the screen `[NFF14]` §9. On a TBM, also annulus grouting behind the rings. | Often a separate specialist gang | as above; no separate ticket regime found — `UNVERIFIED` | Tunnel worker → grouting operative → grouting foreman |
| **Shotcrete nozzleman / robot operator** | **One single person operates the spraying robot** `[NFF14]` §7.3. Manages accelerator dosing at the nozzle, standoff (≈3 m), layer build, rebound, and adhesion — surface cleaning first, compressed air not water where water would cause rockfall `[NFF19]` §5.2. | Often a **subcontracted specialist** `[NFF14]` §7.2 | **Certified.** EFNARC runs a training and certification scheme for nozzlemen including **robotic nozzlemen**, and a course for examiners `[EFNARC]`. ACI certifies **Shotcreter (Wet-Mix Process)** `[ACI-SC]`. The certification pays for itself: training raises output from **12 to 20 m³/h**, and operator skill changes rebound by more than 10 percentage points — **8 % trained vs 18 % untrained**; spraying to EFNARC guidance typically **reduces rebound by 30–50 %** `[EFNARC]`. | Concrete worker → nozzleman → certified robotic nozzleman → shotcrete foreman |
| **Scaler** | Takes down loose rock after every blast, before anything works under the new crown. Normally a **hydraulic hammer on an excavator**; final scaling by **hand-held bar** is still common `[NFF14]` §7.2. Budget **1 hour** per round `[NFF14]` §7.5. | Face crew or dedicated | as above; the regulatory hook is *"loose ground that might be hazardous shall be taken down, scaled or supported"* `[OSHA-800]` §1926.800(o)(3)(iii) | Tunnel worker → scaler → face crew |
| **Mucking crew (loader + haulage)** | Loader operator clears **≈500 m³** per round at **190–220 m³/h**; truck drivers run 25–35 t loads out to the tip `[NFF14]` §7.5. On a TBM, conveyor tending and belt extension instead. | Loader normally a crew member; **haulage subcontracted** `[NFF14]` §7.2 | as above | Truck driver → loader operator → plant foreman |
| **Tunnel surveyor** | Sets the line and grade, checks the as-built profile against theoretical, measures overbreak/underbreak for payment, monitors convergence with tape extensometers between measuring bolts to **≈1/10 mm** `[NFF19]` §2.2.7. Surveying is an explicit line item in the TBM time-consumption model `[NFF11]`. | Often part of **QA/QC**, and also does quantity surveying `[NFF14]` §7.2 | Survey qualification; underground competency | Surveyor → senior surveyor → QA/QC lead |
| **Geotechnical / engineering geologist** | Maps the face after every round; classifies the rock mass (Q, RMR, RMi `[NFF14]` §5, `[NFF19]` §3); decides probe drilling, pre-grouting and the support class; *"if there are any indications that stability problems cannot be ruled out, the blasting must be stopped until the conditions have been looked into"* `[NFF19]` §3.7. | Client side as often as contractor side | Degree + site experience | Already in Talent as **Geotechnical Engineer** (`DOMAIN.md` §7) |
| **Shift boss / shift supervisor** | Runs the shift; with the shift leader and the **client's resident engineer** handles the daily tunnelling matters `[NFF14]` §7.2; owns the decision to stop. | Above the face crew | Underground competency + supervisory tunnelling safety training `[TSTS]` | Driller → shift leader → shift supervisor → agent/site manager |
| **Tunnel engineer** | Design of permanent support, monitoring interpretation, the observational loop. Permanent support is the **client's** responsibility `[NFF14]` §6.1. | Client / designer | Chartered engineering route | Already in Talent as **Tunnel Engineer** |

### Day rates

`PLATFORM_TRUTH.md` Part B is explicit that **compensation in this world is a
day rate, not a salary**, with live expiry-tracked certifications, and that
**expired = cannot mobilise**. Underground tickets fit that model exactly: a
German *Befähigungsschein* is **normally limited to 5 years** `[SPRENG]`, and a
CITB TSTS certificate is **typically valid for 3 years** `[TSTS]`. Let those
lapse and the tunnelling contracts lock out. That is the mechanic, already
sanctioned by the platform.

**Sourced wage floor.** The only hard, regulated, citable number I could obtain
is the Norwegian statutory minimum rate of pay for building and construction
sites, effective **15 June 2025** `[AT-WAGE]`:

| Category | NOK/hour |
|---|---|
| Skilled worker | **264.32** |
| Unskilled, ≥1 year sector experience | **249.00** |
| Unskilled, no sector experience | **239.61** |
| Under 18 | **162.44** |
| Minimum overtime supplement | **40 %** of hourly rate |

Norwegian tunnelling works **10-hour shifts** (`[NFF11]` quotes "best shift
(10 hrs)" and "two 10 hr shifts"; the TBM time model is based on **101 h/week**).
A skilled-worker statutory floor is therefore **≈NOK 2 643 per 10-hour shift**
before any overtime supplement, shift allowance, rotation allowance or
tunnelling premium.

> **UNVERIFIED — do not ship as a factual claim.** I could not source (a) an
> EUR/NOK rate, or (b) actual market day rates for tunnelling specialists in any
> country. Everything below is a **game-balance band**, calibrated so that the
> statutory floor sits at the bottom of the unskilled row, and it must be
> presented in-game as a game economy, never as a market statistic.

Proposed in-game day-rate bands (EUR/day, design values only):

| Role | Junior | Competent | Senior |
|---|---|---|---|
| Tunnel worker / mucking crew | 220 | 280 | 340 |
| Scaler | 240 | 300 | 360 |
| Jumbo operator / driller | 280 | 380 | 480 |
| Charge hand / shot firer | 320 | 430 | 550 |
| Shotcrete nozzleman (certified) | 300 | 420 | 540 |
| Grouting operative | 260 | 350 | 450 |
| Ring builder | 280 | 370 | 460 |
| **TBM operator** | 360 | 500 | 680 |
| Tunnel surveyor | 320 | 450 | 600 |
| Shift boss | 420 | 560 | 720 |
| Geotechnical engineer | 400 | 560 | 780 |
| **Tunnel engineer** | 420 | 600 | 850 |

Structure the bands so that **certified** roles (shot firer, nozzleman) carry a
visible premium over the uncertified equivalent — that is the honest lesson from
`[EFNARC]` (a trained nozzleman is worth 60 % more output and less than half the
rebound) and from the fact that blasting is legally gated `[SPRENG]`.

---

# C. The machines — distinct silhouettes

Modelling notes. Every dimension below is either sourced or flagged. Where I
give a proportion rather than a dimension, it is a **modelling instruction**, not
a claim about a real machine.

### C1. Twin / triple-boom drilling jumbo

**Silhouette.** A low, wide, articulated four-wheel carrier — long and flat,
almost no bodywork above the wheel line except a **closed single-operator cabin**
offset to one side `[NFF14]` §7.3. From the front of the carrier, **two or three
long booms** fan out, each ending in a **feed beam** (a straight rail, longer
than the carrier is wide) carrying a **hydraulic rock drill** that slides along
it. A fourth, shorter **basket boom** with a man-cage is common on charging
variants. Behind the carrier trails a **cable reel and hose drum**.

**Proportions to hit.** The jumbo reads as *booms >> body*. The booms, fully
extended, should reach well above and beyond the machine — that is what makes it
legible. Real face coverage runs from **6 m² to 206 m²** depending on boom count
`[EPI-FACE]`; a three-boom machine covers roughly **35 m²** in one setup
(searched vendor figure, treat as indicative). Booms in this class are around
**3 m telescopic**, extending coverage by about **1 m per side**, to **4 m** with
the telescope out `[SDVK-JUMBO]`.

**Details that sell it.** Retro-reflective striping; a laser receiver on the
boom or mast; drill steel changer racks along the carrier; a thick umbilical of
hydraulic hoses running the length of each boom; the wet grey-brown film of rock
flour over everything; water spray at the collar; the drill steel glinting where
the rod rotates.

**Motion.** Booms move independently and slowly; the feed advances at up to
**3 m/min** `[NFF14]` §7.3; percussion is a high-frequency shudder, not a
rotation. Between holes the boom lifts, swings, re-collars — that is the visual
beat.

**In-game name:** must be original (`DOMAIN.md` §6). Suggest a house series like
*"HEADING-3B"* / *"Faceline III"* — never a real designation.

### C2. TBM — the whole machine

The single most common modelling mistake is drawing only the cutterhead. **The
cutterhead is a few metres; the machine is a train.**

**Front to back:**

1. **Cutterhead** — a full-diameter disc, dished slightly, with **disc cutters**
   in radial paths (each a steel wheel in a housing, edge-on to the face), muck
   **buckets** around the periphery, and openings/chutes behind them
   `[HK-GRIP]`. Water-jet nozzles `[HK-GRIP]`. On a soft-ground machine, spokes
   and **cutting knives** instead, with a much more open face `[HK-AVN]`,
   `[WIKI-TBM]`.
2. **Main bearing and drive** — a thick ring behind the head with electric or
   hydraulic drive motors arranged around it.
3. **Shield** (shielded machines) or **roof shield + main beam** (gripper
   machines). On a gripper machine you can see the rock — the **L1 working area**
   is open, with rock anchors, mesh and steel ring beams going in under the roof
   shield `[HK-GRIP]`.
4. **Gripper shoes** (gripper and double-shield machines) — two big curved pads
   that press outward against the sidewalls; this is the machine's namesake
   feature `[HK-GRIP]`.
5. **Thrust cylinders** — on a shielded machine, a full ring of rams pushing
   against the last erected segment ring `[HK-EPB]`.
6. **Erector** — a rotating arm inside the shield with a vacuum plate that picks
   segments and swings them into the ring `[HK-EPB]`.
7. **Tailskin** with wire brush seals and annulus grout lines.
8. **Backup gantries** — the long part. A series of steel frames on rails or
   skids, each carrying: the **conveyor** running the full length, **control
   room**, transformers and switchgear, hydraulic power packs, **ventilation
   fan and duct store**, segment feeder and crane, grout plant, workshop,
   **refuge chamber**, and (on long drives) crew quarters `[WIKI-TBM]`.
   On an EPB, the **screw conveyor** projects diagonally down and back from the
   bulkhead into the first gantry `[HK-EPB]`. On a slurry machine, **feed and
   discharge slurry pipes** run the length instead of a belt `[WIKI-TBM]`.

**Scale reference.** Diameters 1–23 m; the largest cross-section bored as of
June 2023 was 17.6 m `[WIKI-TBM]`. Gripper machines 2–12.5 m `[HK-GRIP]`; double
shields 2.8–14 m `[HK-DS]`; EPB 1.7–16 m `[HK-EPB]`. A 2.3 m machine of the
1970s was **17 m long** for the machine alone `[NFF11]` — the backup multiplies
that.

**Modelling instruction:** build it as **one head module + N repeating gantry
modules**, so the length scales with the drive. In the cross-section band the
backup should visibly extend off the right edge of the frame.

### C3. Roadheader

**Silhouette.** A crawler chassis, wide and low, with a **single boom** on a
turret at the front and a **cutting head** on the end of it `[WIKI-RH]`. Two
distinct silhouettes:

- **Transverse head**: two drums, one either side of the boom axis, like a pair
  of spiked barrels — the boom looks like it is holding a dumbbell.
- **Axial / longitudinal head**: one conical or barrel head **in line** with the
  boom, like a giant drill bit.

Under the boom sits the **gathering apron** — a flat, low steel table with
rotating gathering arms or star wheels that sweep cuttings onto a **chain
conveyor** running back through the machine's body and discharging at the rear
`[WIKI-RH]`.

**Details.** Rows of **conical picks** in rotating holders studded over the head;
water sprays between them; heavy dust; the boom nodding and sumping into the
face in slow arcs rather than pressing straight in; stabiliser jacks. Machine
weight **26 t to over 100 t** `[WIKI-RH]` — it should sit heavy.

### C4. Shotcrete sprayer (spraying robot)

**Silhouette.** *Small.* Mounted on a **standard 3.5–7 t truck chassis** and it
**drives from site to site like any road truck** `[NFF14]` §7.3. On the deck: a
high-capacity **concrete pump**, **accelerator tanks**, and a **remote-operated
articulated arm about 10 m long** ending in the **nozzle** `[NFF14]` §7.3.

**Operation to animate.** The operator sits in a cabin with a good view, or
stands on the tunnel floor with a remote `[NFF14]` §7.3. **One person** runs the
whole machine. The nozzle stands about **3 m** from the rock and moves in
overlapping loops; the jet leaves at **30–35 m/s** `[NFF19]` §5.6. Concrete
arrives in **standard transmixers with 6–9 m³ drums** `[NFF14]` §7.3, so a
transmixer should be part of the scene.

**Details.** Rebound falling to the invert (8 % if the nozzleman is good, 18 % if
not `[EFNARC]`); wet grey splatter over everything; a hose bundle from the pump
to the arm; the sprayed surface going from ragged rock to smooth grey.
Theoretical output **20 m³/h** `[NFF14]` §7.3.

### C5. Charging rig / ANFO loader

**Silhouette.** A carrier similar in class to the jumbo but with a **man-basket
boom** instead of drilling booms, and on the deck an **explosive tank/hopper with
a pump or blow vessel** and a **charging hose reel**. `DOMAIN.md` §3 already
names **ANFO Loaders** as a taxonomy node.

**Details.** The basket at the crown with a charger in it, hose to the hole,
cartons of primers and reels of detonator tubing, a colour-coded delay board.
Two distinct products to visualise: **piped reduced-energy contour explosive**
and **bulk ANFO / site-sensitised emulsion** `[NFF14]` §7.4.

### C6. Scaling rig

**Silhouette.** An excavator base — tracked or wheeled — with a **long boom** and
a **hydraulic breaker** (or a scaling pick/tine) on the end `[NFF14]` §7.2. A
protective **FOPS canopy** over the cab, heavier than a normal excavator's. The
boom works overhead almost continuously, so it should read as *reaching up*, not
digging down.

**Details.** Loose slabs falling and shattering; the operator working the crown
from a safe standoff; a second worker with a **hand-held scaling bar** finishing
off `[NFF14]` §7.2.

### C7. Segment erector

Not a standalone vehicle — an **arm inside the TBM shield**. A rotating ring
carries a radial telescopic arm with a **vacuum plate** at the end `[HK-EPB]`.
It picks a segment from the feeder, rotates it into position, presses it against
the previous ring while thrust rams are locally retracted, and holds it while
bolts and dowels go in.

**Motion to animate:** rotate → extend → press → hold → release, and the **key
segment last**, wedged in to close the ring.

### C8. Muck train / conveyor

Two distinct silhouettes:

- **Conveyor**: a continuous rubber belt on rollers running the full length of
  the backup and out through the tunnel, with a **belt storage cassette** so it
  can be extended as the drive advances `[WIKI-TBM]`, `[NFF11]`. Reads as a
  ribbon of moving rock at waist height along one wall.
- **Muck train**: a battery or diesel locomotive hauling a rake of **side-tipping
  or bottom-dump cars** on narrow-gauge track, with a **California switch** for
  passing `[WIKI-TBM]`. Alternative: **rubber-tyred trucks** — 25–35 t
  semi-trailers on a paved tunnel road, turned immediately behind the backup
  `[NFF14]` §7.5, `[NFF11]`.
- On a **slurry** machine, no train and no belt: a pair of large-diameter pipes
  (feed and discharge) clipped along the wall, and a **separation plant** outside
  the tunnel `[WIKI-TBM]`.

### C9. Wheel loader (D&B mucking)

Large articulated loader, **190–220 m³ solid rock per hour** loading capacity
`[NFF14]` §7.5. Diesel-electric loading equipment is applied for improved
environment at the tunnel face `[NFF14]` §7.2 — worth showing as a quieter,
cleaner upgrade the player can buy.

---

# D. Hazards and the correct response

Every row: **what the crew sees first → the correct action → the citation.**

### D1. Face collapse / ground loss at the face

**First signs.** Loss of the theoretical profile; loose blocks working out of the
face; deformation and cracking of applied shotcrete; convergence readings
climbing; on a closed TBM, muck volume exceeding the theoretical excavated volume
(over-excavation).

**Correct action.**
- **Stop.** *"If in doubt regarding the stability situation at the tunnelling
  work face, e.g. if there are any indications that stability problems cannot be
  ruled out, the blasting must be stopped until the conditions have been looked
  into and the necessary actions have been carried out."* `[NFF19]` §3.7.
- **Competent-person inspection** of roof, face and walls — required at the start
  of each shift and as often as necessary `[OSHA-800]` §1926.800(o)(3)(i)(A).
- **Take down, scale or support loose ground** `[OSHA-800]`
  §1926.800(o)(3)(iii).
- Move to **pre-support**: face bolting, spiling, or pipe screens per the Q-band
  table `[NFF19]` Table 6.
- **Shorten the round to 2.5–3 m** if spiling with 6 m bolts `[NFF19]` §4.3.1.
- **Close the invert quickly** to create a load-bearing ring — a NATM core
  principle, *"especially crucial in soft ground"* `[WIKI-NATM]`.
- In NATM, apply the **25–50 mm sealing shotcrete layer immediately after face
  advance** to minimise loosening and excessive deformation `[WIKI-NATM]`.

**Precedent.** The 1994 Heathrow Express NATM collapse; the subsequent trial
attributed the failure to *poor workmanship and flaws in construction
management*, not to the method itself `[WIKI-NATM]`. In-game framing: NATM
failures are **process** failures, and the process is monitoring.

### D2. Overbreak

**First signs.** Contour holes not visible as half-casts; profile checks showing
excavated volume well outside theoretical; extra shotcrete take.

**Correct action.**
- Fix the **drilling**, not the blasting: collaring within **0.1 m**, alignment
  within **6 % of hole depth** `[NFF14]` §7.4.
- Keep **contour spacing ≤ 0.7 m** and the helper row **≤ 0.9 m** behind it
  `[NFF14]` §7.4.
- **Charge the contour down** to 0.25–0.45 kg/m with piped explosive `[NFF14]`
  §7.4.
- Keep look-out inside **10 cm + 3 cm/m of hole depth** `[NTNU-BD]`.
- **Longer rounds reduce overbreak per metre** by reducing boom inclination
  `[NFF14]` §7.4 — a genuinely counter-intuitive lever for the player.
- Underbreak is worse than overbreak in contract terms: **no rock may protrude
  inside the theoretical contour** `[NFF14]` §7.4.

### D3. Water ingress under pressure

**First signs.** Flow from a probe hole; a jump in measured leakage; shotcrete
that will not adhere; on a subsea or high-cover drive, a pressure reading on the
packer gauge.

**Correct action.**
- **Measure it properly before deciding.** Bucket and stopwatch for flow; a
  **rubber hose matching the hole diameter** inserted into the hole end to
  capture it; a **packer with a pressure gauge** where pressure is high
  `[NFF19]` §2.2.4.
- **Pre-grout, don't post-grout.** Systematic pre-grouting with cement/micro-
  cement suspensions ahead of the face `[NFF14]` §9. Pressures **3–8 MPa** (max
  10), w/c **1.0–0.5** regular, take **14–103 kg/m²**, grout holes **0.57–2.1
  m/m²** `[NFF14]` §9.
- **Drill control holes** after grouting to prove the screen before advancing
  `[NFF19]` §2.2.1.
- **Stop the water before spiling** — water in bolt holes washes grout out before
  it sets `[NFF19]` §4.3.1.
- Where shotcrete will not hang on because of leakage, **drill drain/relief holes
  around the profile**, collared from already-supported ground behind
  `[NFF19]` §5.2.
- Remember the second-order effect: **falling pore pressure in overlying soft
  clay causes surface settlement** — which is *why* Norwegian urban tunnels have
  2–10 l/min/100 m inflow limits `[NFF14]` §9.
- *"A combination of high water pressure and extensive weakness zones requires
  special precautions during excavation and the implementation of rock support"*
  `[NFF19]` §2.2.4.

### D4. Squeezing ground

**First signs.** Convergence that keeps growing rather than stabilising; cracking
and spalling of shotcrete; steel sets buckling; on a TBM, **rising thrust
required to advance** and the shield getting tight.

**Correct action (drill & blast).**
- Use a **deformable support system**: near-circular profile, circular telescopic
  steel elements that slide into each other at the joints, thick (**> 40 cm**)
  shotcrete with **evenly distributed slots** to allow radial deformation without
  collapse `[NFF19]` §4.5.2.
- Or **sliding steel sets with friction loops** — up to four loops giving about
  **150 kN sliding resistance per connection** `[YIELD]`.
- **Do not** use lattice girders here: they are **non-deformable** `[NFF19]`
  §4.5.3.

**Distinguish squeezing from spalling.** Spalling is brittle and fast — at
σ_c/σ₁ of 5–3 it starts about **an hour after blasting**, at 3–2 within **a few
minutes** `[NFF19]` §4.5.1. Squeezing is slow and continuous. The support answer
is different for each.

### D5. TBM jamming in squeezing ground

**First signs.** Thrust rising toward capacity with no gain in penetration;
convergence readings closing on the overcut; the shield binding; back-up trailers
fouling.

**Mechanism.** Convergence exceeds the **overcut gap** at some distance behind
the face; the ground contacts and squeezes the shield; frictional resistance
builds; **if thrust cannot overcome the friction, the shield is entrapped**
`[SQZ]`, `[OVERCUT]`.

**Precedent.** Gotthard Base Tunnel, Faido section, **1600 m depth**: roof and
floor convergences ranging from **5–10 cm to 75 cm** damaged the support and
**jammed the back-up trailers over a 250 m stretch** `[SQZ]`.

**Correct action.**
- **Increase radial overcut** — the primary mitigation `[SQZ]`, `[OVERCUT]`.
- Use a **deformable lining with yielding elements** over the segment extrados or
  in the longitudinal joints `[SQZ]`.
- On a double shield, **retract the telescopic shield fully** so front and gripper
  shields become a single unit and advance sequentially — the machine's own
  designed answer to fault zones and weak rock `[HK-DS]`.
- Keep boring. Stopping in squeezing ground is how machines get lost.

### D6. Gas

**First signs.** A rising reading on the face monitor. Under `[BS6164]`,
**real-time continuous monitoring at the face and at key points along the tunnel
is the expected standard**, and the dust control regime moved from an 8-hour
average to **real-time monitoring against 15-minute short-term limits**
`[BS6164]`.

**Action levels** `[OSHA-800]`:

| Reading | Required action | Paragraph |
|---|---|---|
| Oxygen outside **19.5–22 %** | atmosphere is non-compliant | (j)(1)(ii)(A) |
| Flammable gas **≥ 5 % LEL** | increase ventilation or otherwise control the gas | (j)(1)(vii) |
| Flammable gas **≥ 10 % LEL** | **suspend hot work** (welding, cutting) | (j)(1)(viii) |
| Flammable gas **≥ 20 % LEL** | **withdraw all non-essential employees and cut electrical power** | (j)(1)(ix) |
| H₂S **≥ 5 ppm** | test at shift start and midpoint until < 5 ppm for 3 consecutive days | (j)(1)(v) |
| H₂S **≥ 10 ppm** | continuous monitoring; inform employees | (j)(1)(v) |
| H₂S **≥ 20 ppm** | visual/aural alarm; additional protective measures | (j)(1)(v) |

**Classification.** *Potentially gassy* = monitoring shows ≥10 % LEL for more
than 24 hours, or historical/geological data indicates it is likely. *Gassy* =
≥10 % LEL for **three consecutive days**, or a methane ignition has occurred, or
the heading is connected to a currently gassy area with continuous flammable gas
in the airflow. It returns to *potentially gassy* when readings stay under 10 %
LEL for three consecutive days `[OSHA-800]` §1926.800(h)(1)–(3).

Also: after a blast in a drill-and-blast heading, **the air must be tested for
flammable gas before re-entry** (standard underground practice, and the reason
the ventilation step is non-skippable).

### D7. Ventilation failure

**First signs.** Visibility dropping at the face; smell of diesel; gas or CO
readings rising; the duct going slack.

**Requirements.**
- **200 cubic feet of fresh air per minute per employee underground** (≈5.7
  m³/min per person) `[OSHA-800]` §1926.800(k)(2).
- **Air velocity in the bore of at least 30 fpm (≈0.15 m/s) wherever blasting or
  rock drilling is conducted** `[OSHA-800]` §1926.800(k)(3).
- **Extraction ventilation — pulling contaminated air away from the face — is the
  preferred technique for dust containment** under `[BS6164]`.
- Diesel plant sets the real air quantity. Statutory/practice figures: Canada
  **0.063 m³/s per kW** of rated engine power; China **0.067 m³/s per kW**;
  Australia typically **0.05–0.06 m³/s per kW** with a range of **0.045–0.092**;
  one consultancy recommends **0.080 m³/s per kW** `[DIESEL-AIR]`.

**Correct action.** Stop diesel plant first (it is the load), withdraw to fresh
air, restore the fan, purge, test, re-enter. Diesel-electric loading equipment is
used specifically **for improved environment at the tunnel face** `[NFF14]` §7.2
— a real upgrade path.

### D8. Misfire

**First signs.** The round did not sound right; the face shows undetonated holes,
unbroken burden, or explosive/detonator remains in the muck pile.

**Correct action.**
- **Wait.** With cap and fuse, **all employees stay away from the charge for at
  least 1 hour** `[OSHA-911]`. For pyrotechnic initiation systems the practice
  figure is **30 minutes**; for electronic systems **5 minutes** before re-entry
  (searched safety guidance; the 1-hour cap-and-fuse figure is the regulatory
  one `[OSHA-911]`).
- **Do not reload.** Holes that failed to break as planned **shall not be
  reloaded for at least 12 hours** (searched blasting guidance — corroborate
  against local regulation before shipping as a rule).
- Post-blast, before anything else: **allow not less than 15 minutes in tunnels**
  for smoke and fumes to clear before returning to the shot `[OSHA-910]`.
- **Do not drill blasting holes through muck or water** `[OSHA-800]`
  §1926.800(q)(10)(i) — this is precisely how a hole is drilled into a missed
  charge.
- Misfire probability is not uniform: with electronic detonators it is **higher
  in on-site-mixed emulsion blasting than in ANFO blasting**, and **lowest with
  packaged explosive**; and it is **higher in small tunnel blasting than in
  conventional blasting** (search-derived from the electronic-detonator misfire
  literature — treat the ranking as indicative).

### D9. Settlement at the surface

**First signs.** Monitoring points moving; on a closed TBM, muck volume exceeding
theoretical; face pressure drifting below target.

**Correct action.**
- On an **EPB**, hold the balance: the chamber must be **completely filled**, and
  the **screw conveyor speed against advance rate** is the control loop; earth
  pressure is monitored continuously by sensors `[HK-EPB]`. Losing chamber
  pressure *is* losing ground.
- On a **slurry** machine, hold slurry pressure against the face; the support
  medium is the bentonite suspension `[WIKI-TBM]`.
- In rock under soft overlying deposits, the mechanism is **pore-pressure
  drawdown, not excavation**: pre-grout to the inflow limit `[NFF14]` §9.
- **Grout the annulus** behind the segment rings; neoprene seals and grouting
  reduce water ingress and close the tail void `[WIKI-TBM]`.
- Choose the trenchless method deliberately: pipe jacking **generally requires
  less overbreak than segmental tunnels, provides ground support and reduces
  potential ground movement** `[PJA]`.

> Numeric volume-loss percentages (the classic "0.5–1.5 % for EPB in London
> Clay" style figures) — **UNVERIFIED**. I could not obtain a primary source in
> this pass. Do not ship a number; ship the mechanism.

### D10. Rockfall between bolts, and spalling

**First signs.** Rock falling **close to the bolts** in very poor ground — the
densely placed bolts establish a crack line `[NFF19]` §4.3.1.

**Correct action.** Reduce the bolt angle so the crack line comes as close to the
tunnel profile as possible, and reduce spacing to **0.2 m** `[NFF19]` §4.3.1.
For portal surfaces with poor stability and no longitudinal stress, **two rows of
bolts** are necessary `[NFF19]` §4.3.1.

---

# E. Game mechanics proposal

## E0. What has to change in the engine

`GAMEDESIGN.md` §1 defines the screen as **SURFACE VIEW (54 %)** over
**CROSS-SECTION (46 %)**, and `DESIGN_EXPANSION.md` §1 already generalises the
section band with a `profileMode` (`vertical` | `profile` | `raise`).

Tunnelling needs **two** additions:

1. **`sceneMode: 'heading'`** on the surface band — the camera goes underground.
   The band no longer shows sky, biome and a mast; it shows a tunnel heading.
2. **`profileMode: 'heading'`** on the section band — a **longitudinal profile**
   with chainage on X and elevation on Y, the face at the right-hand edge, and
   the band scrolling **horizontally** as the face advances. This is a sibling of
   the existing `profile` mode (which was specified for HDD) but with the
   viewport locked to the last ~120 m behind the face plus ~40 m ahead of it.

And per `DESIGN_EXPANSION.md` §4, the method→machine→tooling pairing must be a
**rule**. Tunnelling introduces drive types that do not exist yet:

| Method id | Drive type required | Connection family | Notes |
|---|---|---|---|
| `tunnel-db` | `hydraulic drifter` (existing) | percussion **T38 / T45 / T51** (`DOMAIN.md` §4) | a jumbo is a multi-boom drifter carrier |
| `rock-bolting` | `hydraulic drifter` or `rotary head` | percussion, or **SDA hollow bar R25–R51 / T76+** | shares the jumbo |
| `tunnel-tbm` | **`cutterhead`** (new) | **none — a TBM has no drill string** | must be allowed to have no thread family |
| `roadheader` | **`cutting boom`** (new) | **none — pick holders, not threads** | picks are `Round-Shank/Point-Attack Picks` in `DOMAIN.md` §3 B |
| `microtunnelling` | **`jacking frame`** (new) | **none — pipe joints, not threads** | already a `DOMAIN.md` §1 method (`microtunnelling`) |

`validateData()` must therefore permit `connectionFamily: null` for methods whose
drive type is `cutterhead`, `cutting boom` or `jacking frame` — otherwise the
rule from `DESIGN_EXPANSION.md` §4 will reject every TBM in the game.

---

## E1. Drill & blast as a pattern game

### The core idea

**You do not race the clock. You drill a design, and the design's accuracy
decides how much rock you get.**

The player drills a **round** — a designed set of holes. The round is then
charged and fired, and the game computes **pull**, **overbreak** and **contour
quality** from how accurately each hole was collared, aimed and drilled. Speed is
a secondary axis: it sets how many rounds fit in a shift.

This is the honest inversion of the surface-drilling loop. On a water well, depth
is the score. On a tunnel face, **the score was decided before the round was
fired**.

### What the player actually does, hole by hole

A round on a 100 m² face is **≈140 holes** `[NFF14]` §7.5. The player must not
place 140 holes by hand. Split the round into three interaction tiers, mapped
onto the real hierarchy of consequence:

**Tier 1 — THE CUT (manual, hole by hole, ~8–16 holes).**
This is the minigame. The relief hole(s) are already drilled and shown as black
circles. Around them, the design shows the first quadrangle of cut holes at a
burden of **0.11–0.18 m** from the relief hole `[KARADON]`.

For each cut hole, three micro-actions:

1. **Collar.** Drag the boom tip to the designed collar. Tolerance is generous
   here in absolute terms (the real spec is **0.1 m** `[NFF14]` §7.4) but the
   burden is only 0.113 m — so on the cut, collar error eats the entire burden.
   Show the error in **millimetres**, and show the burden as a shrinking bar.
2. **Aim.** Set the hole's angle. The design wants parallel. Tolerance: **6 % of
   hole depth** `[NFF14]` §7.4. Over a 4.5 m round that is 0.27 m at the toe —
   but the cut burden is 0.113 m, so **the cut demands roughly a quarter of the
   allowable general deviation**. Display both: "spec 6 % · cut needs 1.5 %".
3. **Drill.** Now the three sliders run: **Feed**, **Percussion**, **Flush**.
   Deviation accumulates as a function of feed and rock hardness — push the feed
   and the hole wanders. This is where the existing "groove" mechanic lives, but
   its reward is **straightness**, not ROP.

The result per hole is a **toe position**, not just a depth. Draw it.

**Tier 2 — STOPING AND LIFTERS (row-by-row, boom passes).**
The player sets up a **row** — its burden from the previous row, its spacing, its
angle — and the boom drills the row automatically while the sliders remain live
for the whole pass. Design targets from `[KARADON]`:

| Row type | Burden | Spacing | Column charge | Stemming |
|---|---|---|---|---|
| Stoping | 1.07 m | 1.18 m | 0.68 kg/m | 0.5 m |
| Roof | 0.97 m | 1.18 m | 0.41 kg/m | 0.5 m |
| Lifters (floor) | 1.07 m | 1.18 m | **1.40 kg/m** | **0.2 m** |

Getting the lifters wrong leaves a **hump in the invert** — visible in the
section band and it costs mucking time next round. That is a satisfying, legible
punishment.

**Tier 3 — THE CONTOUR (manual again, but for angle only).**
Contour holes are pre-placed at the designed spacing; the player sets **look-out**
per hole or per arc segment. Targets:

- Spacing **≤ 0.7 m**; helper row **≤ 0.9 m** behind `[NFF14]` §7.4.
- Look-out **≤ 10 cm + 3 cm per metre of depth** `[NTNU-BD]` — show the allowance
  growing as the round gets longer.
- Charge **0.25–0.45 kg/m**, piped `[NFF14]` §7.4.

Too little look-out → **underbreak**, which is a hard fail (*no rock inside the
theoretical contour* `[NFF14]` §7.4) and forces a re-drill or a trim blast.
Too much → **overbreak**, which costs shotcrete volume and money.

### Charging

A short second phase, with real choices from `[NFF14]` §7.4:
- Which explosive per hole group: **bulk ANFO / site-sensitised emulsion**
  (cheap), **cartridge high-energy** (initiation and heavy duty), **piped
  reduced-energy** (contour).
- **Delay assignment**: cut first, then stoping outward, then contour, then
  lifters. `[KARADON]` fires cut holes at delays 0–2, stoping at 3, contour at
  4–6 on a V-cut; a parallel-cut round uses delays up to **No. 14 at 30 ms
  intervals**.
- Getting delays out of order is a real failure: a stoping hole firing before the
  cut has opened is confined, and confined holes do not break rock.

### Firing and scoring

Fire the round. The section band advances. Score:

```
pull_ratio        = advance / drilled_depth              target 0.82–0.91  [NFF14]
cut_opened        = f(worst cut hole toe error vs burden)   binary-ish gate
overbreak_m3      = sum over contour of (toe outside profile) x length
underbreak_m3     = sum over contour of (toe inside profile) x length
half_barrel_pct   = % contour holes whose half-cast survives
collar_error_mean = mean |collar - design|               spec 0.10 m       [NFF14]
align_error_mean  = mean angular error as % of depth     spec 6 %          [NFF14]
```

**Round grade (D→S), proposed weighting:**

| Component | Weight | Rationale |
|---|---|---|
| `cut_opened` | **gate** | if the cut fails, cap the grade at D and set pull to 0.3–0.5 |
| `pull_ratio` | 30 % | the metre you get paid for |
| `overbreak` | 25 % | the money you lose to shotcrete |
| `underbreak` | **hard fail** | contractually not allowed `[NFF14]` §7.4 |
| `half_barrel_pct` | 20 % | the visible proof of good contour work |
| `collar + align` | 15 % | the craft |
| cycle time | 10 % | speed is the *last* term, deliberately |

### The failure the game must teach

**The choked round.** If the cut does not open, the player watches a round pull
1.5 m instead of 4.5 m, and then has to deal with a face full of unexploded
holes — a **misfire** (§D8): wait, do not reload for 12 hours, do not drill
through the muck. That is a whole shift lost from a 3° drilling error. Real
drillers will recognise it instantly.

### Ground-driven round length

The round length is not the player's free choice. Tie it to the ground class:

| Q band | Pre-support required | Max round length | Source |
|---|---|---|---|
| **> 0.2** | bolting at large blocks | **4.5–5.0 m** (18 ft steels) | `[NFF19]` T6, `[NFF14]` §7.4 |
| **0.02–0.2** | bolting at face | **3 m** | `[NFF19]` T6, §4.3.1 |
| **0.001–0.02** | pipe screening / jet grouting / freezing | **2.5–3 m** | `[NFF19]` T6, §4.3.1 |

Walking into a fault zone and watching the round length collapse from 4.5 m to
2.5 m — with the weekly advance falling with it — is the whole drama of
tunnelling in one number.

---

## E2. How a TBM plays differently

**A TBM is not a hole. It is a process you keep inside an envelope.**

### The sliders, remapped

| Control | Gripper / open TBM | EPB | Slurry |
|---|---|---|---|
| **Feed** | **thrust per cutter (kN/cutter)** — the single most important machine parameter in hard rock `[NFF11]` | total thrust against face pressure | total thrust against slurry pressure |
| **Rotation** | **cutterhead RPM** (and the torque it demands) `[NFF11]` | cutterhead RPM | cutterhead RPM |
| **Flush** | **water jets** — dust suppression and tool cooling `[HK-GRIP]` | **screw conveyor speed + foam/bentonite/polymer conditioning** `[HK-EPB]` | **slurry feed/discharge flow** `[WIKI-TBM]` |

The third slider stops being "flushing" and becomes **face support** on the
closed machines — and that is the correct engineering statement, because on an
EPB the muck *is* the support `[HK-EPB]`.

### The rhythm

Not "drill down". A **two-beat loop**, per `[NFF11]` §5.2/5.4:

```
BORE STROKE (1.5–1.8 m)  →  stop head  →  set legs  →  release grippers
        ↑                                                     ↓
   restart head  ←  align line & grade  ←  re-gripper  ←  reset cylinders
```

The **regrip** is dead time the player wants to minimise, and it is an explicit
line in the utilisation model (T_t) `[NFF11]`. On a **double shield in gripper
mode**, segments are erected *during* the stroke — "almost continuous tunnelling"
— but in a fault zone the telescope retracts and advance/ring-build go
**sequential** `[HK-DS]`. Let the player feel the mode switch.

### The groove becomes an envelope

Instead of a moving green band on a torque gauge, the TBM has a **2-D operating
envelope**: thrust per cutter on one axis, RPM on the other, with penetration
(mm/rev) as the contour field. Three walls:

1. **Cutter load rating** — e.g. 312 kN for a 19″-class cutter `[ROB-CUT]`.
   Exceed it and cutters fail.
2. **Torque / power limit** — the basic penetration rate must be *checked against
   the torque capacity of the cutterhead drive* `[NFF11]` §4.
3. **Main bearing** — the 19″ design deliberately runs at **84 %** of bearing
   capacity, the 17″ at **93 %** `[ROB-CUT]`. Running near the top is exactly how
   you shorten bearing life.

Reward: staying near the top of the envelope without touching a wall.

### Cutter management as the money sink

This replaces "trip out and change the crown":

- Each cutter has a **position** on the head (gauge cutters wear fastest —
  they travel the furthest per revolution) and a **wear state in mm**.
- Wear limit **20 mm**; change at **15–18 mm** `[MDPI-CUT]`.
- Life is measured in **m³ of rock per ring** — the Svartisen reference is
  **146 m³/ring** in 49–196 MPa micaschist/granite `[ROB-CUT]`.
- **Change time 45–60 min per cutter** `[NFF11]`.
- Choose **re-ring** (ring + lubricant) or **rebuild** (rings, bearings, seals);
  track the **re-ring-to-rebuild ratio** as a visible score — a high ratio means
  low total cutter cost `[ROB-CUT]`.
- **Cascade failure**: leave a failed cutter in and the neighbours overload; the
  pattern repeats until **5–10 cutters** are gone in a group `[ROB-CUT]`. This is
  the TBM's version of the choked round.
- On a closed machine, changing cutters means **hyperbaric intervention** or
  waiting for a pre-grouted intervention location — expensive, slow, and a real
  strategic decision `[MDPI-CUT]`.

### The KPI the player is actually graded on

Not m/h. **Machine utilisation and weekly advance** `[NFF11]`:

```
utilisation % = T_boring / (T_boring + T_regrip + T_cutters + T_tbm_maint
                            + T_backup_maint + T_misc)
weekly advance = net penetration (m/h) x utilisation x hours worked
```

with `T_misc` covering waiting for transport, track/roadway, services,
**surveying**, cleaning, normal rock support and crew change `[NFF11]`.

Show the player a **weekly bar** broken into those six segments. The lesson —
learned by every real TBM crew — is that **the fastest boring rate in the world
is worth nothing if utilisation is 30 %**.

Calibration targets from a real 3.5 m hard-rock drive `[NFF11]` §11:
best shift **69.1 m**, best day **100.3 m**, best week **426.8 m**, best month
**1358 m**, **average 253 m/week**.

### Ground behaves backwards

Teach the counter-intuitive fact directly: penetration rate rises by a **factor
of five** from a homogeneous to a well-fractured rock mass, but only by a factor
of two across the whole DRI range `[NFF11]`. So:

- **Massive, unfractured granite** = slow but stable, few support stops.
- **Well-fractured rock** = fast boring, but support and overbreak eat the
  utilisation, and fault zones threaten jamming.

The player should learn to *want* fractures — up to the point where the shield
starts to bind (§D5).

### Ring build minigame (shielded machines only)

Short, tactile, repeated every stroke:
1. Erector picks a segment (vacuum plate) `[HK-EPB]`.
2. Rotate → extend → press against the previous ring while the local thrust rams
   retract.
3. Bolt/dowel to hold gasket compression when the ram releases.
4. **Key segment last**, wedged home to close the ring.
5. Grout the annulus.

Score on gasket compression (leaks later if rushed), ring build time (it sets
cycle duration), and step/lip between rings.

---

## E3. What the surface band must show — an underground heading

The surface band's whole visual language is currently *sky, biome, golden hour,
mast*. For tunnelling it must become *no sky, artificial light, an arch, and
blackness at both ends*. Everything below is a **modelling and lighting brief**,
grounded in the sourced facts above.

### The frame

Camera **15–25 m back from the face**, at about 2 m eye height, offset from the
centreline so the tunnel wall runs diagonally out of frame. The face fills the
upper-middle of the band. This is a **corridor** composition: strong perspective
convergence, a bright pool of work light at the face, and darkness closing in at
the edges.

### What is in the frame, from the face backwards

1. **The face** — a rough rock wall across the full arch, with the **half-casts**
   of the last round's contour holes visible as vertical grooves in the crown and
   walls when the player drilled well `[NFF14]` §7.4. Freshly drilled holes read
   as small dark circles in a pattern; the **relief hole** is a noticeably larger
   dark circle (76–115 mm vs 38–51 mm) `[KARADON]`.
2. **The profile** — a **horseshoe / D-shape**, not a circle, for drill & blast.
   Circular only for TBM.
3. **The machine** at the face: jumbo booms fanned out, or the TBM cutterhead
   filling the bore, or the roadheader boom sumping.
4. **Shotcrete on the walls behind the face** — smooth grey over rough rock, with
   the boundary between sprayed and unsprayed clearly visible as the player's own
   progress. Wet dark streaks where water seeps `[NFF19]` §5.2.
5. **Bolt plates** in a pattern on the crown and walls — small squares/domes with
   nuts, catching the light. In poor ground the pattern tightens to 0.2 m
   spacing `[NFF19]` §4.3.1.
6. **Ventilation duct** — a large-diameter lay-flat or rigid duct slung along the
   crown to one side, running back into darkness. This single object does more to
   say "tunnel" than anything else in the frame. Air moves toward or away from
   the face depending on the ventilation mode; `[BS6164]` prefers **extraction**
   at the face.
7. **Services on the opposite wall** — water and compressed-air pipes, power
   cable on hangers, a lighting string.
8. **The invert** — muck pile after a blast; churned wet mud and rock with tyre
   tracks otherwise. The mucking loader's headlights sweeping in from behind.
9. **The far end** — pure black, or a distant pinprick of the portal.

### Light

There is **no sun**. `GAMEDESIGN.md` §6's "golden hour key + cool sky fill" must
be replaced underground by:

- **Work lights** on the machine: hard, high-CRI white, throwing long hard
  shadows across a rough surface. This is what makes the rock texture read.
- **Warm sodium/LED string lighting** along one wall receding into distance — the
  perspective cue.
- **Head torches and cap lamps** — every worker underground must have a portable
  hand lamp or cap lamp for emergency use `[OSHA-800]` §1926.800(g)(4). Small
  moving light sources are cheap and enormously effective.
- **Heavy volumetric haze**: drill mist, blast fume, shotcrete dust, diesel
  exhaust. Light shafts should be *visible*.
- Amber accents from the Drillity brand remain — but as **machine beacons and
  retro-reflective striping**, which is exactly where amber belongs underground.

### Motion and ambience

- The duct **breathes** and ripples.
- Water drips from the crown; a steady trickle in the invert drain.
- Drill percussion is a fast metallic hammering; the jumbo boom moves in slow
  arcs between holes.
- Shotcrete rebound falls in a shower to the invert.
- After a blast: everything goes black except emergency lighting, then the fan
  ramps and the fume slowly clears over the **30-minute** ventilation window
  `[NFF14]` §7.5 (regulatory floor **15 minutes** `[OSHA-910]`) — a genuinely
  cinematic beat the game should hold rather than skip.

### For a TBM heading

The frame changes completely: the player is **inside the machine**, not looking
at a rock face. Steel everywhere, the backup gantries receding, a conveyor of
muck running past at waist height, segment stacks, the control cabin, and — only
when the erector swings — a glimpse of the tail void and the rock. The rock
becomes something you *read on instruments*, which is exactly the psychological
truth of TBM work and is a great contrast with the D&B heading.

---

## E4. What the cross-section band must show — a longitudinal profile

Replace the vertical borehole cutaway with a **long-section along the tunnel**.

### Axes and viewport

- **X = chainage** (metres along the tunnel), increasing to the right.
- **Y = elevation**, with the ground surface at the top of the band and the
  tunnel at depth.
- **The face sits at ~75 % of the band width**, so there is always visible
  *ground ahead* — that is where probe holes, pre-support and the unknown live.
- The viewport shows roughly **the last 120 m and the next 40 m**, scrolling
  **horizontally** as the face advances. (Reuse the `profile` machinery specified
  for HDD in `DESIGN_EXPANSION.md` §1, with a different X scale and no vertical
  exaggeration — a tunnel long-section is usually drawn 1:1 vertically over short
  spans, unlike an HDD profile.)

### Layers, back to front

1. **Ground surface** at the top, with whatever is on it — a village, a road, a
   river, a railway. Overburden depth labelled. This is what makes settlement
   (§D9) legible.
2. **Rock mass banding** by **Q class / fracture class**, colour-coded, with
   dipping weakness zones crossing the alignment. `[NFF11]` gives the fracture
   classes to band on: 1600 / 800 / 400 / 200 / 100 / 50 mm spacing.
3. **Water table** and water-bearing joints, drawn as a line plus arrows into the
   tunnel where inflow is expected.
4. **The excavated tunnel** as a horizontal band, ending at the face.
5. **Support applied**, drawn on the excavated length:
   - shotcrete as a coloured lining of visible **thickness** (min 60 mm; up to
     30–50 cm for an arch) `[NFF14]` §6.3.1, `[NFF19]` §5.6.2
   - bolts as short ticks radiating from the profile at their real length (6 m
     spiles vs 3 m radial bolts look very different)
   - lattice girders / steel sets as vertical ribs
   - cast invert where present
6. **The next round** at the face, as a hatched wedge of the correct length (4.5 m
   or 2.5 m — the difference must be obvious), with the drill pattern shown in
   plan-on-face inset.
7. **Pre-support fanning ahead of the face**: spiles at **10–15° to the tunnel
   axis**, **6 m long**, with the **2.3–3 m burden** between rows and the overlap
   with the previous set clearly drawn `[NFF19]` §4.3.1; or a **pipe umbrella**
   of 12–15 m pipes with the **4–5 m overlap** `[UMB]`.
8. **Probe holes** ahead of the face as thin lines with their measured findings
   annotated (water at chainage X, weakness zone at Y) `[NFF19]` §2.2.
9. **The grouted zone** ahead of the face as a stippled halo around the alignment
   when pre-grouting has been done, with its thickness (the Norwegian calculation
   assumes a **10 m** grouted zone thickness) `[NFF14]` §9.
10. **Convergence/monitoring** stations behind the face, with deformation arrows
    that grow in squeezing ground.

### For a TBM drive

Same axes, but draw **the machine to scale in the profile**: cutterhead, shield,
then the **backup gantries extending off the left edge of the frame**. Behind it,
**segment rings** as a repeating pattern with the annulus grout shaded. This is
the picture that finally teaches the player that the backup is most of the
machine.

### For microtunnelling

Same axes, plus a **launch shaft** and **reception shaft** at each end drawn to
depth, the **thrust wall** behind the jacking frame, the **pipe string** with
**interjack stations** marked at intervals, and a **bentonite lubrication**
halo along the pipe. The jacking-force gauge reads against the pipe's allowable
compressive strength, and the interjack sequence (hold rear → open interjack →
advance front → close with main jacks) is a four-beat animation `[PJA]`.

---

## E5. Method configuration blocks (implementer-ready)

Numbers below are the **calibration targets**; each is traceable to a citation
already given.

```js
// tunnel drill & blast
{
  id: 'tunnel-db',
  driveType: 'hydraulic drifter',
  connectionFamily: ['T38','T45','T51'],       // DOMAIN §4 percussion
  sceneMode: 'heading',
  profileMode: 'heading',
  faceArea_m2:        { min: 12,  typical: 100, max: 200 },   // NFF14 §7.5; EPI-FACE 6–206
  holesPerRound:      { per_m2: 1.4 },                        // 140 holes / 100 m²  NFF14 §7.5
  roundLength_m:      { good: [4.5, 5.0], poor: [2.5, 3.0] }, // NFF14 §7.4; NFF19 §4.3.1
  pullRatio:          { min: 0.82, max: 0.91 },               // NFF14 §7.4
  holeDia_mm:         { production: [45, 51], relief: [76, 115] }, // NTNU-BD; KARADON
  contourSpacing_m:   { max: 0.70 }, helperRowGap_m: { max: 0.90 }, // NFF14 §7.4
  contourCharge_kg_m: { min: 0.25, max: 0.45 },               // NFF14 §7.4
  collarTol_m:        0.10,                                   // NFF14 §7.4
  alignTol_pctDepth:  6,                                      // NFF14 §7.4
  lookout_m:          (depth_m) => 0.10 + 0.03 * depth_m,     // NTNU-BD
  cycle_h: { drillChargeBlast: [4,5], ventilate: 0.5, scale: 1.0,
             muck: 4.0, bolt: 1.5, total: 12 },               // NFF14 §7.5
  muck_m3_per_round:  500,  loader_m3_per_h: [190, 220],
  truckPayload_t:     [25, 35],                               // NFF14 §7.5
  advance_m_per_week: 50                                      // NFF14 §7.5
}

// hard rock TBM (gripper / double shield)
{
  id: 'tunnel-tbm',
  driveType: 'cutterhead',
  connectionFamily: null,                       // no drill string — see E0
  dia_m:              { gripper: [2, 12.5], doubleShield: [2.8, 14], epb: [1.7, 16] },
  stroke_m:           { mainBeam: 1.8, kelly: 1.5 },          // NFF11 §5.2 / §5.4
  cutterDia_mm:       [432, 483],                             // 17" / 19"   NFF11
  cutterLoad_kN:      { '17in': 215, '19in': 312, '20in': 312 }, // ROB-CUT T1
  cutterWearLimit_mm: 20, cutterChangeAt_mm: [15, 18],        // MDPI-CUT
  cutterLife_m3_per_ring: 146,   // 49–196 MPa micaschist/granite  ROB-CUT T2
  cutterChangeTime_min:   [45, 60],                            // NFF11
  hpPenetrationBonus_pct: [40, 50],   // 19" HP vs 17" standard   NFF11
  fractureBoost_x:        5,          // homogeneous → well fractured  NFF11
  driBoost_x:             2,          // low → high DRI, homogeneous   NFF11
  advance_m_per_week:  { average: 253, best: 426.8 },          // NFF11 §11
  advance_m_per_shift: { best: 69.1 }, advance_m_per_month: { best: 1358 },
  contactPressure_MPa: 250,                                    // HK-GRIP / HK-DS
  epbMaxFacePressure_bar: 7                                    // WIKI-TBM
}

// roadheader
{
  id: 'roadheader',
  driveType: 'cutting boom',
  connectionFamily: null,
  power_kW:      { min: 40, max: 400 },        // WIKI-RH
  weight_t:      { min: 26, max: 100 },        // WIKI-RH
  section_m2:    [25, 80],                     // WIKI-RH
  ucsLimit_MPa:  { axialMassive: [60, 80], axialFractured: 100,
                   transverseMassive: [100, 120], transverseJointed: [160, 180] },
  pickType_ucs_MPa: { radial: [40, 60], conical: [100, 120] },
  pickConsumption_per_m3: { hardRock: 5 },     // PLOS-PICK ("can exceed 5")
  cuttingRate_m3_per_h: { target_at_120MPa: 30 },  // TT-ICUT
  utilisation_pct: [20, 50]                    // WIKI-RH
}

// microtunnelling / pipe jacking
{
  id: 'microtunnelling',
  driveType: 'jacking frame',
  connectionFamily: null,
  pipeDia_mm:     { min: 150, max: 2400 },     // PJA
  manEntry_mm:    900,                         // UW-PJ
  driveLength_m:  { typical: 1000, max: 1500 },// PJA / HK-AVN
  friction_t_per_m2: { min: 0.1, typical: [0.5, 2.5] },   // PJA
  lubricationForceReduction_pct: 50,           // UW-PJ
  interjackCapacity_t: [100, 1600],            // UW-PJ
  tolerance_mm:   { pipeJack: 50, microtunnel: 25 }       // PJA / UW-PJ
}
```

## E6. Contracts this unlocks

Slot straight into the Alpine tunnel region named in `GAMEDESIGN.md` §4 and the
Tunneling industry in `DESIGN_EXPANSION.md` §5:

| Contract archetype | Method | Hook |
|---|---|---|
| **Road tunnel heading, competent gneiss** | `tunnel-db` | The clean tutorial: 100 m² face, 4.5 m rounds, ~50 m/week, graded on contour |
| **Fault zone crossing** | `tunnel-db` + spiling | Round length collapses to 2.5–3 m; spiles, radial back-anchor bolts, sprayed-concrete ribs |
| **Urban tunnel under settlement-sensitive buildings** | `tunnel-db` + pre-grouting | Inflow limit 2–10 l/min/100 m; drawdown = settlement = failure |
| **Long hydropower headrace** | `tunnel-tbm` gripper | Utilisation game; cutter economy; a squeezing zone at depth |
| **Metro running tunnel in soft ground** | `tunnel-tbm` EPB | Face pressure vs screw speed; ring build; surface monitoring |
| **Station cavern / cross passages** | `roadheader` | Non-circular profile, no vibration allowed |
| **Sewer under a live railway** | `microtunnelling` | Jacking force vs pipe capacity; interjacks; ±25 mm tolerance |

---

# F. What is NOT verified

Ship none of these as factual claims until sourced:

1. **Surface settlement volume-loss percentages** for EPB/slurry drives. Mechanism
   is sourced (§D9); the numbers are not.
2. **Market day rates** for any tunnelling role in any currency. Only the
   Norwegian statutory construction minimum is sourced `[AT-WAGE]`; everything in
   the day-rate table in §B is a declared game-balance value.
3. **EUR/NOK exchange rate** — not sourced; recompute at build time.
4. **Formal ticket regime for TBM operators.** Underground competency schemes are
   sourced `[CSCS-TUN]`, `[TSTS]`; a TBM-specific licence is not.
5. **Gripper TBM permeability limit (K > 10⁻³ m/s)** — search-derived only.
6. **"Do not reload misfired holes for 12 hours"** and the **30 min pyrotechnic /
   5 min electronic** re-entry figures — search-derived safety guidance; the
   1-hour cap-and-fuse rule is the sourced regulatory one `[OSHA-911]`.
7. **Ring build time in minutes** — the *importance* of ring build time to cycle
   duration is sourced; a number is not.
8. **Robbins cutter Table 1 year column** — the PDF's table extraction misaligns
   diameters and years; the **diameter → load** pairing is reliable, the years are
   indicative `[ROB-CUT]`.
9. **Three-boom jumbo "35 m² in one setup"** — vendor marketing figure from a
   search summary, not from a primary spec sheet. The sourced range is 6–206 m²
   across 1–4 booms `[EPI-FACE]`.
10. **EFNARC output/rebound figures (12→20 m³/h; 8 % vs 18 % rebound; 30–50 %
    reduction)** come from certification-scheme promotional material `[EFNARC]`;
    directionally reliable, but treat the exact numbers as advocacy.

---

# G. Cross-references

- `DOMAIN.md` §1 — `microtunnelling`, `jet-grouting`, `anchor`, `raise-boring`
  already exist as methods; `tunnel-db`, `tunnel-tbm`, `roadheader` are new.
- `DOMAIN.md` §3 A — *Tunneling & Underground*: **Jumbos, TBM Cutters, Roadheader
  Picks, Muck Handling, ANFO Loaders, Tunnel Segments** are the shop nodes this
  research populates.
- `DOMAIN.md` §3 B — *Ground-Engaging & Cutting Wear Tools*: **Round-Shank /
  Point-Attack Picks**, tool holders, pick boxes → roadheader and TBM soft-ground
  tooling.
- `DOMAIN.md` §3 C — *Grouting & Injection*: **Shotcrete**, **Jet Grouting
  Monitors & Nozzles**, **TAM sleeve tubes** → §A4 of this document.
- `DOMAIN.md` §3 E — *Rock Bolts, Soil Nails & Cable Bolts (+ Resin Cartridges)*,
  *Mesh, Surface Support & Grout*, *Self-Drilling Anchors (SDA)* → §A4.
- `DOMAIN.md` §4 — connection families; note §E0 above: TBM, roadheader and
  microtunnelling have **no** thread family and `validateData()` must allow that.
- `PLATFORM_TRUTH.md` Part B — day rate not salary; **expired certification =
  cannot mobilise**. Underground tickets have real expiries (5 years for the
  German *Befähigungsschein* `[SPRENG]`; ~3 years for CITB TSTS `[TSTS]`).
- `DESIGN_EXPANSION.md` §1 — `profileMode`; this document adds `heading`.
- `DESIGN_EXPANSION.md` §4 — method→machine→tooling as a rule; this document adds
  three new drive types.
- `DESIGN_EXPANSION.md` §5 row 7 — the gap this document closes.

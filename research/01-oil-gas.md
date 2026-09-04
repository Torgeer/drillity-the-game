# 01 — Oil & Gas / offshore drilling

Research pack for **Drillity I The Game**, closing the priority gap identified
in `DESIGN_EXPANSION.md` §5 (Oil & Gas: "20 of Talent's 35 specialisations, and
it had nothing").

**Scope.** The 20 Drillity Talent oil & gas specialisations; the well
construction sequence; the rig unit types and rig anatomy; the hazards and the
correct well-control response; and a mechanics proposal for the three-slider
game.

**Rules obeyed.** Every claim carries a source — a local filename in
`C:\Users\henri\Downloads\` or a URL. Anything unsourceable is marked
`UNVERIFIED` or cut, per `PLATFORM_TRUTH.md` Part C. Manufacturer names appear
**only as citations**; no real model designation may ship as in-game content
(`DOMAIN.md` §6). No Drillity internal business metrics appear anywhere.

### Source key

| Key | Source |
|---|---|
| `[IADC-JU]` | `Jack-Up-Rig-IADC-List-30-JAN-2022.pdf` — IADC Standard Format Equipment List, Jack-Up Drilling Unit, rev. January 2022. A real, filled-in 66-page rig spec sheet. |
| `[CHAK]` | `Chakrabarti_2005_Handbook_of_Offshore_En.pdf` — S. Chakrabarti (ed.), *Handbook of Offshore Engineering*, Elsevier 2005. |
| `[WITTIG]` | `Wittig_Drilling_intro-part_I.pdf` — V. Wittig, *Drilling Fundamentals I: Introduction to Drilling Technology*, International Geothermal Centre / Hochschule Bochum, 08.11.2017. University course notes. |
| `[DICT]` | `Dictionary-of-Oil-Industry-Terminology.pdf` — Alpha Thames Ltd, 2004. |
| `[NOV-RH]` | `nov_rotary-handling-tools-land-offshore.pdf` — 2018 Rotary & Handling Tools catalog. Used **only** for the generic tool taxonomy and the API 7K casing-size ladder. |
| `[SUPPLHI]` | `28-SupplHi-Standard-Categorization-Drilling-Equipment-and-Materials_compressed.pdf` — SupplHi standard categorisation, category 28 "Drilling Equipment and Materials", rev16 Jan19. |
| `[CFR-420]` | 30 CFR § 250.420 — https://www.law.cornell.edu/cfr/text/30/250.420 |
| `[CFR-421]` | 30 CFR § 250.421 (casing and cementing requirements table) — https://www.law.cornell.edu/cfr/text/30/250.421 |
| `[CFR-430]` | 30 CFR § 250.430 (diverter) — https://www.law.cornell.edu/cfr/text/30/250.430 |
| `[CFR-490]` | 30 CFR § 250.490 (H2S) — https://www.law.cornell.edu/cfr/text/30/250.490 |
| `[CFR-734]` | 30 CFR § 250.734 (subsea BOP) — https://www.law.cornell.edu/cfr/text/30/250.734 |
| `[SLB]` | SLB Energy Glossary — https://glossary.slb.com/ (individual term URLs given inline) |
| `[DC-WC]` | *Drilling Contractor* (IADC's own magazine), "Driller's Method vs Wait and Weight Method" — https://drillingcontractor.org/driller%E2%80%99s-method-vs-wait-and-weight-method-one-offers-distinct-well-control-advantages-1444 |
| `[DC-H2S]` | *Drilling Contractor*, "How to ensure H2S safety on offshore rigs" — https://drillingcontractor.org/how-to-ensure-h2s-safety-on-offshore-rigs-8267 |
| `[IADC-H2S]` | IADC Safety Meeting Topics: Hydrogen Sulfide — https://iadc.org/safety-meeting-topics/hydrogen-sulfide/ |
| `[IADC-WS]` | IADC WellSharp — https://www.iadc.org/wellsharp/ |
| `[IWCF]` | IWCF — https://www.iwcf.org/ |
| `[DM-KICK]` | Drilling Manual, kick early warning signs — https://www.drillingmanual.com/iwcf-kick-early-warning-signs/ |
| `[DM-SHUT]` | Drilling Manual, shut-in procedures — https://www.drillingmanual.com/iwcf-shut-in-procedures-on-fixed-rig/ |
| `[DM-LC]` | Drilling Manual, lost circulation classification — https://www.drillingmanual.com/mud-loss-lost-circulation-problem-in-drilling-operations/ |
| `[DM-TO]` | Drilling Manual, twist-off in drill pipe — https://www.drillingmanual.com/twist-off-in-drill-pipe/ |
| `[DM-CREW]` | Drilling Manual, rig personnel organisation — https://www.drillingmanual.com/oil-drilling-rig-personnel-crew-organization/ |
| `[DM-DERR]` | Drilling Manual, derrickman job description — https://www.drillingmanual.com/derrickman-job-description-requirements-role/ |
| `[ONET-xxxx]` | O*NET OnLine occupation summaries (US Dept. of Labor) — https://www.onetonline.org/link/summary/&lt;code&gt; |
| `[BLS-xxxx]` | US Bureau of Labor Statistics OEWS, May 2023 — https://www.bls.gov/oes/2023/May/oes&lt;code&gt;.htm |
| `[RZ-...]` | Rigzone salary insights (recruitment-market data, **not** an official statistic) — https://www.rigzone.com/insights/salary-1/ |
| `[RW-...]` | rigs.work role pages (recruitment-market data, **not** an official statistic) — https://www.rigs.work/rig-roles/ |
| `[WRS]` | Worldwide Recruitment Solutions, "Oil Rig Careers Explained" — https://www.worldwide-rs.com/blog/oil-rig-careers-explained/ |
| `[WP-...]` | Wikipedia (used only where nothing better was reachable; flagged inline) |
| `[ECB]` | ECB euro reference exchange rate, USD — https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html |

---

## 0. How to read this file

### 0.1 The money basis

Almost all published oil & gas compensation data is in **USD**. Drillity Talent
models compensation as a **day rate, not a salary** (`PLATFORM_TRUTH.md` Part
B), which is exactly how the industry pays, so day rates are the primary figure
here.

Conversion basis: **EUR 1 = USD 1.1615**, the ECB euro reference rate for
3 September 2026 `[ECB]` — i.e. **USD 1 ≈ EUR 0.861**. Every EUR figure below is
a conversion of a cited USD figure at that rate, rounded to the nearest €5.
Marked `(conv.)` wherever it is a conversion rather than a natively-euro source.

**A caution the implementer must not lose:** Rigzone and rigs.work are
recruitment-market sources, not official statistics. Where a US government
figure exists (BLS OEWS, O*NET) it is given alongside and should be treated as
the harder number. BLS covers **US onshore** work almost entirely; the offshore
premium is real and comes from the recruiter data.

### 0.2 The units problem

Drilling engineering is the last unrepentantly imperial discipline. Real crews
say **ppg** (pounds per gallon) for mud weight, **psi** for pressure, **bbl**
(42 US gal) for volume, **ft** for depth, **inches** for pipe and hole, **klbs**
or **kips** for hookload. `PLATFORM_TRUTH.md` Part C rule 3 requires SI for the
game (bar, mm, m/h, kN, EUR). Both are given here. Recommendation for the game:
**show SI, but keep the oilfield word.** A driller reading "mud weight 1 440
kg/m³" will accept it; a driller reading "drilling fluid heaviness" will not.

Useful conversions used throughout:
- 1 ppg = 119.83 kg/m³ ≈ 0.1198 sg. So 8.33 ppg = fresh water; 10 ppg ≈ 1 198 kg/m³.
- 1 psi = 0.06895 bar. 10 000 psi = 689.5 bar.
- 1 bbl = 0.159 m³.
- 1 kip = 1 000 lbf = 4.448 kN. 1 000 kips ≈ 4 448 kN ≈ 454 tonnes-force.
- 1 short ton (sTon) = 0.907 t.

---

# A. THE PROFESSIONS

This is the priority section. Drillity Talent lists **20** oil & gas
specialisations — more than every other industry combined (`DESIGN_EXPANSION.md`
§5). They are not 20 flavours of one job. They belong to **three different
employers** working the same steel.

## A.0 The single most important framing: two chains of command

A drilling rig runs **two parallel chains of command plus a rotating cast of
third-party specialists** `[RW-HIER]` (https://www.rigs.work/rig-roles/rig-crew-hierarchy.html):

**1. The operator (the oil company that owns the well).**
Represented on location by the **Company Man / Wellsite Supervisor**, who holds
"the single highest authority over the well" — approves spend, makes programme
decisions, has final say — and who directs the rig *through* the toolpusher
rather than by managing the crew `[RW-CM]`
(https://www.rigs.work/rig-roles/company-man.html). `[DM-CREW]` calls the same
post "Rig Supervisor", "responsible for all phases of drilling operations", and
the first contact on arriving at the rig site.

**2. The drilling contractor (who owns the rig and the crew).**
Headed on location by the **Toolpusher** (offshore, under the **OIM**, the
Offshore Installation Manager, who is the highest authority on the
installation). The toolpusher "manages the *rig*, while the Company Man manages
the *well programme*" `[RW-TP]` (https://www.rigs.work/rig-roles/toolpusher.html).
The **Driller** reports to the toolpusher; the **derrickhand**, **floorhands**
and **motorman** report to the driller; **roustabouts** report to the **crane
operator**, who reports to the toolpusher `[DM-CREW]`.

**3. Third-party service hands.**
Directional driller, MWD/LWD engineer, mud engineer, mud logger, cementer,
wireline, coiled tubing, fishing-tool supervisor, HSE advisor. They work for
service companies, they are **billed by the day**, and they are "directed in
practice by the operator's company man" `[RW-DD]`
(https://www.rigs.work/rig-roles/directional-driller.html).

**Game consequence.** The oil & gas career should not be one ladder. It should
be three tracks that share a rig floor:
`Contractor track` (roustabout → floorhand → derrickhand → driller → toolpusher → OIM),
`Operator track` (engineer → company man → drilling superintendent), and
`Service track` (MWD hand → directional driller; mud engineer; wireline; coil
tubing). Crossing between them is a real career event and should be an unlock.

## A.1 The crew on tour

- A **tour** (pronounced "tower") is a shift. Individual drilling crews work
  **8- or 12-hour tours**; the toolpusher stays on location for days or weeks
  `[WRS]`. Modern offshore practice is the **12-hour tour**, two tours covering
  24 h `[RW-HIER]`, `[RZ-FLOOR]`.
- A conventional drill crew on tour is: **1 driller + 1 derrickhand + 2–3
  floorhands + 1 motorman**, with roustabouts/crane on the deck side and the
  assistant driller where the rig runs one. (Composition per `[DM-CREW]` and
  `[RW-HIER]`; the exact headcount is rig-specific and is **UNVERIFIED** as a
  universal number — do not put "the crew is exactly 5" on screen.)
- **Rotation** is a first-class field in Drillity Talent: 14/14 · 21/21 · 28/28 ·
  4/4 · 5/2 · 6/3 · ad hoc · staff (`PLATFORM_TRUTH.md` Part B). Recruiter data
  annualises offshore day rates at roughly **182–183 paid days/year** on an
  equal-time rotation `[RZ-SUP]`
  (https://www.rigzone.com/insights/salary-1/what-is-the-annual-salary-for-a-drilling-rig-supervisor-137/).
  That number is the honest bridge between "day rate" and "annual" and the game
  should use it.

## A.2 The 20 specialisations, mapped

| # | Talent specialisation | Employer | Where | Detailed below |
|---|---|---|---|---|
| 1 | Floorhand / Roughneck | Contractor | Rig floor | §A.3.1 |
| 2 | Derrickman | Contractor | Monkeyboard + mud room | §A.3.2 |
| 3 | Driller | Contractor | Driller's cabin | §A.3.3 |
| 4 | Directional Driller | Service | DD shack / doghouse | §A.3.4 |
| 5 | MWD / LWD | Service | MWD unit | §A.3.5 |
| 6 | Drilling Foreman / Supervisor | Contractor + operator | Doghouse / company office | §A.3.6 |
| 7 | Well Control | Cross-cutting competence | Driller's cabin / choke | §A.3.7 |
| 8 | Mud Engineer / Drilling Fluids | Service | Mud lab, pits, shakers | §A.3.8 |
| 9 | Wireline Logging | Service | Logging unit + wellhead | §A.3.9 |
| 10 | Cementing | Service | Cement unit + cement head | §A.3.10 |
| 11 | Fracturing | Service | Frac spread (land) | §A.3.11 |
| 12 | Perforation | Service | Wellhead / lubricator | §A.3.12 |
| 13 | Coil Tubing | Service | CT spread over the well | §A.3.13 |
| 14 | Workover / Completion | Contractor + operator | Workover rig floor | §A.3.14 |
| 15 | Subsea Engineering | Contractor (floaters) | Moonpool, BOP deck, ROV room | §A.3.15 |
| 16 | Petroleum Engineering | Operator | Office + wellsite | §A.4.1 |
| 17 | Reservoir Engineering | Operator | Office | §A.4.2 |
| 18 | Production Technologist | Operator | Office + platform | §A.4.3 |
| 19 | Refinery / Plant Operator | Refiner | Control room + unit | §A.4.4 |
| 20 | Refinery / Plant Operations Supervisor | Refiner | Control room | §A.4.5 |

---

## A.3 The field roles, one by one

### A.3.1 Floorhand / Roughneck

**What they physically do during a tour.** They are the hands on the drill
floor. Concretely, per `[RW-RN]` (https://www.rigs.work/rig-roles/roughneck.html)
and `[ONET-475011]` (which files "Roughneck" and "Floor Hand" as alternate
titles under the derrick-operator family):

- Handle pipe: move, position and guide drill pipe and casing into and out of
  the hole.
- **Make and break connections** — set and pull the **slips** that hang the
  string in the rotary table, latch the **elevators**, and torque the joint with
  **power tongs** or by driving the **iron roughneck** (the hydraulic
  make/break machine that has replaced manual tongs and the spinning chain
  `[WITTIG]` p.54).
- "Steady pipes during connection to or disconnection from drill or casing
  strings"; "guide lengths of pipe into and out of elevators" `[ONET-475011]`.
- Wash down, dope threads, change bits, rig up and rig down, clean the floor,
  and everything the driller tells them to.

**Where they stand and what they touch.** On the **drill floor**, around the
**rotary table / rotary bushing**, working within arm's reach of a suspended
steel string. Tools: rotary **handslips** and **power slips** (rated 240–750
short tons in the standard tool taxonomy `[NOV-RH]`), **master bushing** and
**insert bowls**, **elevators**, **tongs**, **casing spider**, **mud bucket**.
The **V-door** and **catwalk** are where pipe comes up onto the floor from the
pipe deck; the **mousehole** is the short hole in the floor where the next
single is parked ready to pick up `[WITTIG]` p.31.

**Reports to.** The **Driller**, directly `[DM-CREW]`, `[RW-RN]`.

**Day rate.**
| Setting | Tier | USD/day | EUR/day (conv.) |
|---|---|---|---|
| Offshore | Entry (0–1 yr) | 210–270 | **180–235** |
| Offshore | Mid (2–5 yr) | 260–330 | **225–285** |
| Offshore | Senior (5+ yr) | 310–390 | **265–335** |
| Offshore, US Gulf | all | 330–590 | **285–510** |
Source `[RZ-FLOOR]` (https://www.rigzone.com/insights/salary-1/average-pay-for-a-floorhand-on-an-offshore-oil-rig-13),
median USD 300/day ≈ **EUR 260**; hitch patterns 14/14 or 28/28, day rates
presume 12-hour tours. Onshore annual ≈ USD 50–80k ≈ **EUR 43–69k**; offshore
annual ≈ USD 70–115k ≈ **EUR 60–99k** `[RW-RN]`.

**Tickets that gate the job.** Basic site-access safety orientation
(RigPass / SafeLandUSA / SafeGulf, ~1 day); **H2S Alive** (~1 day, 3-year
validity); first aid/CPR; and for offshore, **BOSIET** — "survival, escape, and
helicopter ditching" `[RW-ENTRY]`
(https://www.rigs.work/rig-roles/how-to-get-a-rig-job.html). Under US offshore
rules, H2S training is required **before beginning work** at the facility and
**annually** thereafter `[CFR-490]`.

**In and out.** In from **roustabout** (deck labour, no rig experience needed)
`[RW-ENTRY]`. Out to **derrickhand**, then driller `[RW-RN]`. rigs.work puts it
plainly: the roughneck job is the proving ground.

---

### A.3.2 Derrickman / Derrickhand

The most misunderstood role in the industry, and the one the game must get
right: **the derrickman is not just the person up the derrick — he is the mud
man.**

**What they physically do during a tour.**
*While tripping:* stands on the **monkeyboard** (racking platform) high in the
derrick and handles the **top** of each stand as it comes out of the hole,
swinging it into the **fingerboard** and racking it. `[WRS]` puts the
monkeyboard at **80–90 ft (24–27 m) above the rig floor**; `[DM-DERR]` says
approximately **90 ft**. Mandatory fall protection: full-body harness and
self-retracting lifeline `[WRS]`.

*While drilling:* he runs the **mud system**. O*NET's task list for the
occupation is almost entirely fluid work `[ONET-475011]`:
- "Start pumps that circulate mud through drill pipes and boreholes to cool
  drill bits and flush out drill cuttings"
- "**Control the viscosity and weight of the drilling fluid**"
- "Listen to mud pumps and check regularly for vibration and other problems"
- "Prepare mud reports and instruct crews about handling chemical additives"
- "Weigh clay and mix with water and chemicals to make drilling mud using
  portable mixers"
- "Repair pumps, mud tanks, and related equipment"

`[DM-CREW]` adds that he "assists/relieves the driller" — the derrickhand is the
driller's understudy.

**Where they stand.** Two places, and the switch between them is the character
of the job: **the monkeyboard** during trips, **the mud pit room / pump room /
shaker house** during drilling. On the real jack-up spec, the racking platform
holds **20 000 ft of 5″ drill pipe plus 465 ft of 8″ drill collars — 20 465 ft
total (≈ 6 240 m)** `[IADC-JU]` §B.1.2. That is what he racks, stand by stand.

**Reports to.** The **Driller**, and through him the toolpusher `[DM-DERR]`,
`[DM-CREW]`.

**Day rate.** US government figure, onshore-weighted: **Derrick Operators, Oil
and Gas (SOC 47-5011)**, n = 11 510, median **USD 27.99/h = USD 58 210/yr**;
10th pct 20.31/h; 90th pct 36.42/h `[BLS-475011]`. In EUR (conv.): median
**≈ €50 100/yr**, ≈ **€24/h**. On a 12-hour tour that is a day-rate equivalent
of **≈ €290/day**. Recruiter data for the offshore role: USD 60–95k/yr ≈
**€52–82k** `[RW-HIER]`.

**Tickets.** Same base stack as the floorhand plus **certified working-at-height
training** — `[WRS]` names IADC-certified height training as mandatory for
monkeyboard work. Many operators require the derrickhand to hold a well-control
ticket because he relieves the driller (see §A.3.7).

**In and out.** In from **floorhand** (the derrickhand is described as the
"senior floor hand" `[RW-HIER]`). Out to **assistant driller / driller** —
"provide relief to the Driller when trained" `[DM-DERR]`.

---

### A.3.3 Driller

**What they physically do during a tour.** The driller runs the well from the
chair. Per `[RW-DR]` (https://www.rigs.work/rig-roles/driller.html):

- Manages **weight on bit (WOB)**, **rotary speed (RPM)** and **pump pressure**,
  trading ROP against equipment damage.
- Directs trips in and out of the hole; calls each connection with the
  derrickhand and floorhands.
- **Monitors pit volumes, flow and pressure for the first signs of influx** —
  this is the safety-critical half of the job.
- Supervises the derrickhand, roughnecks and motorman; reports progress and NPT
  to the toolpusher.

O*NET's list for **Rotary Drill Operators (47-5012)** is the concrete version
`[ONET-475012]`: "Observe pressure gauges and control rotary table speed and
tool pressure"; "Control draw works to lower and raise drill pipes and casings";
"Maintain records of footage drilled, strata penetrated, materials used, and
time required"; "Monitor drilling progress and change drill bits as needed";
"Locate and recover lost or broken equipment from wells."

`[WRS]` states the responsibility that matters most: the driller "is responsible
for interpreting the signals the well gives regarding gas and fluids with high
pressure, and in an emergency is also responsible for taking the correct counter
measures."

**Where they stand.** The **driller's console** or, on modern rigs, the **cyber
chair** in an enclosed driller's cabin on the drill floor `[RW-DR]`. On the real
jack-up spec, everything is brought to that one position: hookload indicator,
drilling parameter recorder, standpipe pressure gauge, deviation equipment,
choke-manifold instrumentation repeated at the driller's position, plus the
**derrick TV monitor showing the monkeyboard and the casing stabbing board**
`[IADC-JU]` §H.1, §B.1.7.

**Reports to.** The **Toolpusher** `[DM-CREW]`, `[RW-DR]`.

**Day rate.** Recruiter data: onshore ≈ USD 70–126k/yr ≈ **€60–108k**; offshore
≈ USD 175–220k/yr ≈ **€151–189k** `[RW-DR]`. Government onshore figure:
**Rotary Drill Operators, Oil and Gas (47-5012)**, n = 12 180, median
**USD 29.70/h = USD 61 770/yr** (≈ **€53 200**), 90th pct USD 89 810
(≈ **€77 300**) `[BLS-475012]`.

**Tickets.** **Mandatory well control — IWCF or IADC WellSharp** — plus an H2S
ticket and rig-safety certification `[RW-DR]`. See §A.3.7 for what those tickets
actually are.

**In and out.** In from roughneck → derrickhand, "approximately five or more
years of floor experience before earning the Driller position" `[RW-DR]`. Out to
**night toolpusher → day toolpusher → senior toolpusher** `[RW-TP]`, or sideways
into the operator's chain as a company man `[RW-CM]`.

---

### A.3.4 Directional Driller (DD)

**What they physically do during a tour.** The DD owns the **shape of the hole**.
Per `[RW-DD]`:

- Keeps the wellbore on plan through the **vertical, kickoff, build and lateral**
  sections.
- Works the steering hardware: **mud motor** (steers while **sliding**) or
  **rotary steerable system** (steers while **rotating**).
- Interprets downhole surveys and directs the MWD hand.
- Makes real-time steering calls with the driller and the company man.
- Trades speed against hole quality against reservoir placement (**geosteering**).

The physical act on a motor-and-bent-housing assembly: to build angle he tells
the driller to stop rotating the string and **slide** — push the whole string
forward without turning it, so that the bend in the housing points the bit in a
chosen direction. That direction is the **toolface**: "the angle measured in a
plane perpendicular to the drillstring axis that is between a reference
direction on the drillstring and a fixed reference" `[SLB-TF]`
(https://glossary.slb.com/terms/t/toolface). In a near-vertical hole the
reference is magnetic north (**magnetic toolface**); in a deviated hole it is
the top of the borehole (**gravity / high-side toolface**) `[SLB-TF]`.

Sliding is the expensive choice: "Sliding can be difficult… and it is almost
always slower and therefore more expensive than drilling while the pipe is
rotating" `[WP-DD]` (https://en.wikipedia.org/wiki/Directional_drilling).

**Where they stand.** Not on the floor. The DD works from the **directional
shack / doghouse** beside the MWD unit, on the screens, walking out to the floor
for BHA make-up. He is a third-party hand, "directed in practice by the
operator's company man" `[RW-DD]`.

**Reports to.** His service company; functionally, the **company man**
`[RW-DD]`.

**Day rate.**
| Setting | Tier | USD/day | EUR/day (conv.) |
|---|---|---|---|
| Onshore | Entry (0–2 yr) | ~900 (median) | **~775** |
| Onshore | Mid (3–7 yr) | ~1 300 (median) | **~1 120** |
| Onshore | Senior (8+ yr) | ~1 700 (median) | **~1 465** |
| Either | full band | 700–1 900 | **600–1 635** |
Sources `[RZ-DD]`
(https://www.rigzone.com/insights/salary-1/what-is-the-annual-pay-for-a-directional-driller-in-the-us-94)
and `[RW-DD]`. Per diem USD 50–125/day (**€45–110**) is a common adder
`[RZ-DD]`.

**Tickets.** IWCF or IADC WellSharp well control; RigPass/SafeLand; H2S (3-year
validity); plus the service company's own in-house directional course covering
surveying, steering and anti-collision `[RW-HOWDD]`
(https://www.rigs.work/rig-roles/how-to-become-a-directional-driller.html).
Rigzone notes certifications add **USD 20–120/day** (**€17–105**) to an offshore
directional hand's rate `[RZ-DDA]`.

**In and out.** In from **MWD hand** (fast route — "puts you next to the
directional tools and the downhole data early") or from **floorhand** (slower,
deeper mechanical grounding), 2–3+ years of rig time, then **assistant DD**
running night tours under supervision, then own wells `[RW-HOWDD]`. Out to
**senior DD → directional coordinator → drilling engineering** `[RW-DD]`.

---

### A.3.5 MWD / LWD Engineer

**What they physically do during a tour.** They own the **downhole
measurement**. MWD tools use "gyroscopes, magnetometers, and accelerometers to
determine borehole inclination and azimuth" `[WP-DD]` — that triplet is the
survey, and the survey is what proves where the hole actually is. LWD adds
formation measurements (resistivity, gamma, porosity) used to steer inside the
reservoir. The MWD hand assembles and programmes the tool into the BHA on the
floor, then sits with the surface decoder for the whole tour reading **mud-pulse
telemetry** and handing the DD his toolface and surveys.

Survey cadence, from `[WP-DD]`: surveys are taken at intervals between **10 and
150 m (33–492 ft)**, with **30 m (98 ft)** common during active steering and
**60–100 m (200–330 ft)** typical while drilling ahead. That cadence is a
gameplay clock: you only *know* where the hole is at discrete points.

**Where they stand.** The **MWD unit** (a cabin or container), plus the drill
floor during BHA make-up and pull-out.

**Reports to.** Service company; functionally the DD and the company man.

**Day rate.**
| Setting | Tier | USD/day | EUR/day (conv.) |
|---|---|---|---|
| Offshore | Entry (0–2 yr) | 350–520 (med. 430) | **300–450** |
| Offshore | Mid (2–5 yr) | 520–780 (med. 660) | **450–670** |
| Offshore | Senior / night hand | 780–1 050 (med. 920) | **670–905** |
Source `[RZ-DDA]`
(https://www.rigzone.com/insights/salary-1/what-is-the-pay-for-a-directional-drilling-assistant-offshore-208).
Cross-check: `[RW-HIER]` gives MWD/LWD engineer USD 500–1 100/day ≈
**€430–950**.

**Tickets.** Same base safety stack; well control; and OEM tool certification —
which Rigzone prices explicitly at **+USD 20–120/day** `[RZ-DDA]`.

**In and out.** In from a technical/engineering background or from the floor.
Out to **directional driller** — the standard route `[RW-HOWDD]`.

---

### A.3.6 Drilling Foreman / Drilling Supervisor

Drillity Talent has one label; the industry has three posts. All three should
exist in the game.

**(a) Toolpusher — the contractor's rig boss.**
Runs the rig around the clock; supervises drillers across rotating tours;
manages materials, inventory and third-party services; owns rig safety and is "a
key player in well control events"; is the contractor's main contact with the
company man `[RW-TP]`. Progression steps are real job titles: **night toolpusher
→ day toolpusher → senior toolpusher** `[RW-TP]`. Reports to the **Rig Manager /
Rig Superintendent**, who runs several rigs from the office `[RW-TP]`.

Day rate, offshore: entry **USD 950–1 250** (€820–1 075), mid **1 200–1 650**
(€1 035–1 420), senior **1 600–2 100** (€1 375–1 810) `[RZ-TP]`
(https://www.rigzone.com/insights/salary-1/what-is-the-average-pay-for-a-toolpusher-in-offshore-drilling-22).
Rigzone notes deepwater US Gulf, Brazil pre-salt, **North Sea harsh
environment** and West Africa price at or above the medians, while some Middle
East jack-up markets sit at the 25th–50th percentile — a direct mapping onto
Drillity Talent's **rig class** field (`PLATFORM_TRUTH.md` Part B).

**(b) Company Man / Wellsite Supervisor — the operator's representative.**
Executes the drilling programme against plan and budget, adjusts it in real
time, coordinates every third-party service, controls cost, owns regulatory
compliance, files the daily report `[RW-CM]`. Holds final authority over the
well. Reports to the **drilling superintendent** or **drilling engineer** in the
operator's office. Manages no crew directly `[RW-CM]`.
Day rate **USD 900–2 200** (**€775–1 895**), annualising to USD 160–400k at
180–220 billable days `[RW-CM]`.

**(c) OIM — Offshore Installation Manager.**
The highest authority offshore, above the toolpusher on the contractor side
`[RW-HIER]`; USD 200–300k/yr ≈ **€172–258k**.

**Cross-check on "drilling rig supervisor" as a single title** `[RZ-SUP]`:
| Setting | Tier | USD/day | EUR/day (conv.) |
|---|---|---|---|
| Onshore | Entry | 500–700 | **430–600** |
| Onshore | Mid | 650–850 | **560–730** |
| Onshore | Senior | 800–1 050 | **690–905** |
| Offshore | Entry | 650–850 | **560–730** |
| Offshore | Mid | 800–1 050 | **690–905** |
| Offshore | Senior | 1 000–1 300 | **860–1 120** |

**Tickets.** Well control at **supervisor level** (IWCF or IADC WellSharp
Supervisor — Surface Stack, Subsea Stack, or Combined) `[IADC-WS]`; full
offshore survival stack; and, on the operator side, an engineering background.

**In and out.** Contractor route: floorhand → driller → toolpusher `[RW-TP]`.
Operator route: crew positions → driller → toolpusher → **cross the aisle** to
company man, often as an independent consultant rather than staff `[RW-CM]`.
That crossing is a great late-game unlock.

---

### A.3.7 Well Control

Well control is not a job you are hired into so much as a **competence that
gates every other job on this list**. It deserves its own game system because
`PLATFORM_TRUTH.md` Part B already names the mechanic: **expired = cannot
mobilise.**

**What it actually is.** The discipline of keeping formation fluid out of the
wellbore (primary control = the mud column), and of shutting the well in and
circulating an influx out safely when primary control fails (secondary control =
the BOP stack and the choke). See §D.1 for the operational detail.

**The two certifying bodies.**

**IADC WellSharp** `[IADC-WS]` — accreditation levels:
- **Awareness** and **Introductory**
- **Driller**: Surface Stack · Subsea Stack · Combined Surface and Subsea Stack
- **Supervisor**: Surface Stack · Subsea Stack · Combined
- **Well Servicing**: Coiled Tubing · Snubbing · Wireline · Workover · Operator
  Representative

Assessment: centralised online testing, unique exam per candidate drawn from a
3 300+ item bank, independent proctoring, and — the part that matters for
authenticity — **"30 % of the course time … to involve simulation"** for Driller
and Supervisor courses, plus skills assessment on simulators `[IADC-WS]`. IADC
references **a two-year cycle between well control certifications** `[IADC-WS]`.

**IWCF** `[IWCF]` — programmes listed:
- Level 1 Well Control Awareness
- Drilling Well Control Programme
- Well Intervention Pressure Control Programme
- Enhanced Well Control
- Well Control in Design and Lifecycle Management
- Well Operations Crew Resource Management (WOCRM)
- Online Level 2 Drilling Well Control & Well Intervention Pressure Control

`DOMAIN.md` §7 already names **IWCF Level 4** as a real senior well-control
ticket; `PLATFORM_TRUTH.md` Part B repeats it. IWCF's public homepage does not
enumerate the level-to-role mapping, so **the precise Level 2/3/4 role mapping
is UNVERIFIED here** — do not put "Level 4 = supervisor" on screen without
checking the IWCF programme pages.

**Day rate.** There is no separate "well control" day rate; the ticket is priced
into the driller, supervisor and service rates above. Rigzone's observation that
well-control and OEM certifications add **USD 20–120/day** to an offshore
directional hand `[RZ-DDA]` is the closest hard number and is a perfect model
for a game modifier.

**In and out.** Ticket first, job second. Every offshore driller, toolpusher,
company man, coiled-tubing supervisor, wireline supervisor and workover
supervisor holds one at the appropriate level `[IADC-WS]`, `[RW-DR]`.

---

### A.3.8 Mud Engineer / Drilling Fluids Engineer

**What they physically do during a tour.** The mud engineer "designs and
maintains the drilling-fluid system — the lifeblood that controls the well,
cleans the hole, and protects the bit" `[RW-ME]`
(https://www.rigs.work/rig-roles/mud-engineer.html). On shift he runs the
**mud check**: measures and adjusts **density (mud weight)**, **funnel
viscosity and rheology**, **filtrate/fluid loss**, **solids content**,
**chlorides**, **pH**; writes the mud report; orders and meters the additives;
and walks the solids-control train to see that the shakers, desander, desilter,
degasser and centrifuge are actually doing their jobs.

He is the person who answers the question that decides the well: **how heavy
should the mud be right now?** Too light and you take a kick; too heavy and you
break the formation down and lose returns (§B.3, §D.1, §D.2).

**Where they stand.** The **mud lab / mud shack**, the **pit room**, and the
**shaker house** — the three places on a rig where you can see the fluid.
`[RW-ME]` places the role "from the mud plant and wellsite systems".

**Reports to.** Employed by a drilling-fluids service company; on location
"report to the Company Man" `[RW-ME]`. In practice he works hand-in-glove with
the derrickhand, who executes at the pits.

**Day rate.**
| Setting | Tier | USD/day | EUR/day (conv.) |
|---|---|---|---|
| Offshore | Entry (0–2 yr) | 580–730 (med. 650) | **500–630** |
| Offshore | Mid (3–7 yr) | 820–980 (med. 900) | **705–845** |
| Offshore | Senior (8+ yr) | 1 080–1 300 (med. 1 200) | **930–1 120** |
| Onshore | all | 500–900 | **430–775** |
Sources `[RZ-MUD]`
(https://www.rigzone.com/insights/salary-1/salary-range-for-a-drilling-fluid-engineer-on-offshore-rigs-88)
and `[RW-ME]`. Rigzone annualises on ~190 paid rig days. Premiums for
oil-based/synthetic programmes and for deep, hot or extended-reach wells
`[RW-ME]` — i.e. Talent's **HPHT** rig class pays more, exactly as
`PLATFORM_TRUTH.md` says.

**Tickets.** A chemistry/engineering background plus the service company's mud
school; the same offshore survival and H2S stack as everyone else. `[RW-ME]`
does not enumerate specific certifications — **treat "the mud engineer's
required certificate" as UNVERIFIED** and gate the role on the generic offshore
stack instead.

**Do not confuse with the mud logger.** `[RW-ME]` is explicit: the mud engineer
*controls the fluid*; the **mud logger** *analyses formation geology through
cuttings and gas monitoring*. They are different people at different day rates
(mud logger USD 350–700/day ≈ **€300–600** `[RW-HIER]`). The mud logger is the
one watching the gas trace — an excellent second pair of eyes for a kick
mechanic.

---

### A.3.9 Wireline Logging

**What they physically do.** Wireline is "a general term used to describe
well-intervention operations conducted using single-strand or multistrand wire
or cable for intervention in oil or gas wells", and as an adjective, "related to
any aspect of logging that employs an electrical cable to lower tools into the
borehole and to transmit data" `[SLB-WL]`
(https://glossary.slb.com/terms/w/wireline). The distinction the game must get
right: **slickline** = single-strand or braided wire, mechanical work only;
**electric line (e-line)** = a cable with electrical conductors, which can log
and can fire perforating guns `[SLB-WL]`, `[WP-WI]`
(https://en.wikipedia.org/wiki/Well_intervention).

On a logging run the crew rigs up the sheave wheels over the well, runs the
tool string in on cable, logs **up** at a controlled line speed, and reads the
formation while pulling. Braided-line work on a live well needs "a grease
injection system" and extra BOPs `[WP-WI]`.

**Where they stand.** The **logging unit** (a cabin or truck with the winch,
the depth wheel and the acquisition console) plus the wellhead where the
lubricator and pressure-control stack are rigged up.

**Reports to.** Service company; on location the company man.

**Day rate.**
| Role | Setting | Tier | USD/day | EUR/day (conv.) |
|---|---|---|---|---|
| Logging technician | Onshore | Entry | 260–350 | **225–300** |
| Logging technician | Onshore | Mid | 340–460 | **295–395** |
| Logging technician | Onshore | Senior | 420–580 | **360–500** |
| Wireline supervisor | Onshore | Entry (3–5 yr) | 600–800 | **515–690** |
| Wireline supervisor | Onshore | Mid (5–10 yr) | 800–1 050 | **690–905** |
| Wireline supervisor | Onshore | Senior (10+ yr) | 1 000–1 300 | **860–1 120** |
Sources `[RZ-WLT]`
(https://www.rigzone.com/insights/salary-1/what-is-the-annual-pay-for-a-wireline-logging-technician-7)
and `[RZ-WLS]`
(https://www.rigzone.com/insights/salary-1/salary-expectations-for-a-wireline-supervisor-in-oil-and-gas-184/).
Both sources state these are **land figures and that offshore rates are not
blended in** — flag that in the game rather than reusing them offshore.

**Tickets.** IADC WellSharp has a dedicated **Well Servicing – Wireline**
certification `[IADC-WS]`; IWCF's equivalent is the **Well Intervention
Pressure Control** programme `[IWCF]`. Plus the standard safety stack and, for
perforating work, explosives handling (see §A.3.12).

**In and out.** In as a field technician/operator; out to **wireline supervisor
→ field service manager**, or sideways into petrophysics on the operator side.

---

### A.3.10 Cementing

**What they physically do.** "To prepare and pump cement into place in a
wellbore" — to "seal the annulus after a casing string has been run, to seal a
lost circulation zone, to set a plug in an existing well from which to push off
with directional tools or to plug a well so that it may be abandoned"
`[SLB-CEM]` (https://glossary.slb.com/terms/c/cementing). "A cementing crew uses
special mixers and pumps to displace drilling fluids and place cement in the
wellbore" `[SLB-CEM]`.

The primary cement job, mechanically: mix slurry to a designed density, pump it
down the inside of the casing and out through the **casing shoe** into the
annulus; a **displacement plug** bumps against the shoe and gives a **pressure
spike at surface that tells you the job landed**; a **float collar** above the
shoe acts as a check valve so the cement cannot U-tube back inside
`[WP-CASING]` (https://en.wikipedia.org/wiki/Casing_(borehole)). Then **WOC** —
wait on cement.

The regulator makes the acceptance criterion explicit and numeric: cement
behind the **bottom 500 ft (152 m)** of casing must reach **a minimum
compressive strength of 500 psi (34.5 bar)** before you may drill out the shoe
or start completion `[CFR-420]`. That is a perfect, sourced, waiting-timer
mechanic.

**Where they stand.** The **cement unit** (skid or truck) at the mixing end, and
the **cement head** on top of the casing string on the drill floor. The
jack-up spec carries a dedicated **cementing standpipe rated 10 000 psi
(690 bar)** and a **cementing hose 2″ ID × 60 ft rated 10 000 psi**
`[IADC-JU]` §G.2.3, §F.1.6 — so the cement line is a separate, higher-pressure
path than the mud line, and should be drawn as one.

**Reports to.** Service company; on location the company man.

**Day rate.** No dedicated Rigzone page was reachable. The closest government
anchor is **Service Unit Operators, Oil and Gas (47-5013)** — n = 46 150, median
**USD 26.80/h = USD 55 750/yr** ≈ **€48 000/yr**, 90th pct USD 87 350 ≈
**€75 200** `[BLS-475013]`; O*NET files cementing-adjacent tasks under that
occupation. Recruiter aggregate seen in search results put cementing operators
around USD 52k/yr — **treat any single cementing day-rate number as UNVERIFIED**
and use the 47-5013 band.

**Tickets.** Standard safety stack; well control where the job is on a live
well; and the service company's cementing school. Precise gating certificates
are **UNVERIFIED**.

---

### A.3.11 Fracturing

**What they physically do.** Hydraulic fracturing is "a stimulation treatment
routinely performed on oil and gas wells in low-permeability reservoirs.
Specially engineered fluids are pumped at high pressure and rate into the
reservoir interval to be treated, causing a vertical fracture to open."
**Proppant** — sand grains or engineered ceramic — is "mixed with the treatment
fluid to keep the fracture open when the treatment is complete", and the
fracture wings "extend away from the wellbore in opposing directions according
to the natural stresses within the formation" `[SLB-HF]`
(https://glossary.slb.com/terms/h/hydraulic_fracturing).

The frac spread is the largest surface operation in the industry: banks of
high-pressure pumps, a blender, proppant storage and conveyors, chemical
trucks, a manifold ("missile"), and a data van. `[SUPPLHI]` lists **Fracturing
Pumps** (28.02.26G), **Fracturing Fluids** (28.05.08G) and **Proppant**
(28.05.07G) as distinct equipment categories.

Fracturing is overwhelmingly a **land** operation in the shale plays; it is not
a normal North Sea offshore drilling-crew activity. Represent it as an onshore
regional specialisation, not an offshore rotation.

**Where they stand.** The pad, not a rig floor: pump operators at their units,
the frac supervisor and engineer in the **data van** watching pressure, rate and
proppant concentration in real time.

**Day rate.** No sourced day-rate figure was reachable for a frac crew. **Mark
UNVERIFIED.** Nearest anchor: **47-5013 Service Unit Operators** (O*NET
explicitly lists "Apply green technologies such as coiled tubing or hydraulic
fracturing" as a task for that occupation `[ONET-475013]`), median
**USD 55 750/yr ≈ €48 000** `[BLS-475013]`.

**Tickets.** Standard safety stack plus pressure-pumping training. Specific
certificates **UNVERIFIED**.

---

### A.3.12 Perforation

**What they physically do.** Perforating is what actually connects the reservoir
to the well. After the production casing is cemented, "small perforations are
made in the portion of the casing across the production zone, to provide a path
for the oil to flow from the surrounding rock into the production tubing"
`[WP-WELL]` (https://en.wikipedia.org/wiki/Oil_well). O*NET lists the task
plainly for 47-5013: **"Perforate well casings with explosive charges"** and
"Operate specialized equipment to remove obstructions via chemical or explosive
action" `[ONET-475013]`.

A perforating gun is a carrier loaded with **shaped charges**, conveyed on
**e-line wireline**, on **tubing**, or on **coiled tubing**, positioned on
depth against a correlation log, and fired. `[SUPPLHI]` files **Perforating
Gun** as its own equipment category (28.02.25G).

This is the one job on the rig that is explicitly an **explosives** operation.
It carries its own radio-silence and rig-shutdown procedures.

**Where they stand.** At the wellhead with the **lubricator** rigged up (so the
gun can be run into a live well under pressure), and in the wireline unit.

**Reports to.** Service company; on location the company man.

**Day rate.** UNVERIFIED as a distinct rate; perforating is usually done by the
wireline crew, so use the wireline bands in §A.3.9.

**Tickets.** Explosives handling and transport certification (jurisdiction-
specific), plus the wireline stack. IADC WellSharp Well Servicing – Wireline
covers the pressure-control side `[IADC-WS]`.

---

### A.3.13 Coil Tubing

**What they physically do.** Coiled tubing is "a long, continuous length of pipe
wound on a spool", straightened as it goes into the well and re-coiled coming
out; typical sizes **1 in to 4½ in (25–114 mm)** and lengths **2 000–15 000 ft
(600–4 600 m) or greater** depending on the spool `[SLB-CT]`
(https://glossary.slb.com/terms/c/coiled_tubing).

Its defining advantages, verbatim: it can operate "safely under live well
conditions, with a continuous string", and can pump "fluids at any time
regardless of the position or direction of travel" `[SLB-CT]`. That is the
whole point — unlike jointed pipe, there are no connections to make, so you can
push, pull and circulate continuously into a pressurised well.

Uses: circulating and chemical washes; cleanouts; milling; fishing; conveying
logging or perforating tools into a deviated well where gravity will not carry
a wireline tool down `[WP-WI]`.

The surface spread is a recognisable silhouette: **reel**, **injector head**
mounted over the well, the **gooseneck** guide arch, a **stripper/packoff** and
a **CT BOP** stack underneath. (Reel/injector/gooseneck naming is standard;
`[SLB-CT]` does not enumerate them, so treat the component list as
**partially UNVERIFIED** — but `[SUPPLHI]` does file **Coiled Tubing Unit**
(28.02.11G / 28.06.10S) and **Injection Head** (28.02.05G) as real equipment
categories.)

**Where they stand.** The CT unit cab and the wellhead.

**Day rate.**
| Setting | Tier | USD/day | EUR/day (conv.) |
|---|---|---|---|
| Onshore | Entry (0–1 yr) | 310–380 | **265–325** |
| Onshore | Mid (2–5 yr) | 380–460 | **325–395** |
| Onshore | Senior / lead | 460–560 | **395–480** |
Source `[RZ-CT]`
(https://www.rigzone.com/insights/salary-1/what-is-the-compensation-for-a-coiled-tubing-operator-84);
the source states offshore commands a premium not detailed in those figures.

**Tickets.** IADC WellSharp **Well Servicing – Coiled Tubing** `[IADC-WS]`, or
IWCF **Well Intervention Pressure Control** `[IWCF]`, plus the standard stack.

---

### A.3.14 Workover / Completion

**What they physically do.** Two related jobs.

**Completion** = "Installation in a well of production tubing and equipment,
wellhead and Christmas Tree" `[DICT]` p.1246. The christmas tree itself is "an
arrangement of isolation valves, pressure gauges and possibly chokes installed
at the top of a well to control the flow of oil and gas after the well has been
drilled and completed" `[DICT]` p.1079. In the hole: perforate the pay, run
**tubing** with a **packer** that seals the annulus above the producing section,
land the tubing hanger, install the tree `[WP-WELL]`.

**Workover** = "The repair or stimulation of an existing production well for the
purpose of restoring, prolonging or enhancing the production of hydrocarbons"
`[SLB-WO]` (https://glossary.slb.com/terms/w/workover); "major maintenance or
remedial treatments … typically including removal and replacement of production
tubing **after the well has been killed** and a workover rig is positioned"
`[SLB-WO]`. `[DICT]` p.8230 agrees: "A maintenance job on a well usually to
replace equipment or to stimulate production. Re-entry into a completed well for
modification or repair work."

The key distinction for gameplay: **you must kill the well first** to pull
tubing with a workover rig. The alternatives that avoid killing it are the
"through-tubing workover operations, using coiled tubing, snubbing or slickline
equipment", which "save considerable time and expense" `[SLB-WO]`. **Snubbing**
(hydraulic workover) forces pipe into a live, pressurised well and "requires a
larger rigup than for coiled tubing and the pipe [is] more rigid" `[WP-WI]`.

That is a genuinely good three-way choice: slickline (cheap, limited) → coiled
tubing (mid) → snubbing (expensive, heavy) → full workover with a rig (kill the
well, lose production, highest capability).

**Where they stand.** A **workover rig** floor — a smaller mast unit over an
existing wellhead, with the same slips/elevators/tongs vocabulary as a drilling
floor.

**Day rate.** Government anchor: **Service Unit Operators, Oil and Gas
(47-5013)** — "Operate equipment to increase oil flow from producing wells or to
remove stuck pipe, casing, tools, or other obstructions from drilling wells.
Includes fishing-tool technicians." Median **USD 26.80/h = USD 55 750/yr ≈
€48 000**; 90th pct USD 87 350 ≈ **€75 200** `[BLS-475013]`, `[ONET-475013]`.
For a **fishing tool supervisor**, `[RW-HIER]` gives USD 800–1 800/day ≈
**€690–1 550** — a very expensive person to need, which is the right economic
signal for a stuck-pipe event.

**Tickets.** IADC WellSharp **Well Servicing – Workover** or **Snubbing**
`[IADC-WS]`; IWCF Well Intervention Pressure Control `[IWCF]`.

---

### A.3.15 Subsea Engineering

**What they physically do.** On a floating rig, the entire well-control stack is
**on the seabed**, not on the rig. `[DICT]` p.668 states it exactly: blowout
preventers "on land rigs are located beneath the rig at the land's surface; on
jackup or platform rigs, at the water's surface; and **on floating rigs, on the
seabed**." The subsea engineer owns that equipment: the **subsea BOP stack**,
the **LMRP (lower marine riser package)**, the **marine riser**, the **control
pods**, the hydraulic **accumulators**, and the **ROV** interface. `[DM-CREW]`
lists "Subsea Engineer (BOP/wellhead systems)" as specialty rig personnel.

What that involves in practice, from the regulatory requirements
`[CFR-734]`: a subsea BOP must have **at least five remote-controlled,
hydraulically operated BOPs — one annular, two pipe rams and two shear rams**;
maintain **ROV capability** to close shear rams and ram locks, close one pipe
ram and **disconnect the LMRP**; and carry **autoshear** (fires on LMRP
disconnect) and **deadman** (fires on loss of both hydraulic supply and signal)
systems that close two shear rams in sequence. **A trained ROV crew must be
continuously present on the rig once the BOP is deployed** `[CFR-734]`.

Also his: the **moonpool** — "a hole or well in the hull of a ship (usually in
the centre) through which equipment pass to gain access to subsea" `[DICT]`
p.4676 — and the **motion compensator** that keeps the string on bottom while
the vessel heaves.

**Where they stand.** The **subsea workshop / BOP deck**, the **moonpool** area,
and the **ROV control room**.

**Reports to.** The drilling contractor's chain (toolpusher / OIM).

**Day rate.** No sourced day-rate figure was reachable. **Mark UNVERIFIED.**
Position it in the game between the driller and the toolpusher — it is a
senior technical contractor post — but do not display a number until sourced.

**Tickets.** Full offshore survival stack; OEM BOP/control-system training;
often ROV pilot familiarity. Specific certificates **UNVERIFIED**.

**Game note.** Subsea engineering is the single best justification for the
Talent **rig type** field mattering: this role does not exist on a land rig or a
jack-up (surface stack), and is essential on a semi-submersible or drillship
(subsea stack). IADC WellSharp mirrors this exactly with separate **Surface
Stack** and **Subsea Stack** well-control certifications `[IADC-WS]` — so the
game can make a driller's ticket rig-type-specific and lock him out of a floater
until he re-certifies. That is a real, sourced, excellent progression gate.

---

## A.4 The five non-field roles (lighter treatment)

### A.4.1 Petroleum Engineering
"Devise methods to improve oil and gas extraction and production and determine
the need for new or modified tool designs. Oversee drilling and offer technical
advice" `[ONET-172171]`. Tasks include specifying and supervising well
modification and stimulation programmes; directing completion and evaluation of
wells; developing field drilling plans; assessing costs and estimating
production capability and economic value; simulating reservoir performance under
different recovery techniques `[ONET-172171]`. **72 % of respondents say a
bachelor's degree is required** `[ONET-172171]`.
Pay `[BLS-172171]`: n = 20 390; median **USD 65.23/h = USD 135 690/yr ≈
€116 800**; 25th pct USD 104 020 ≈ €89 600; 75th pct USD 176 990 ≈ €152 400;
90th pct USD 225 920 ≈ **€194 500**. Contractor day rates for drilling
engineers/supervisors in Europe: Airswift gives a Europe permanent average of
USD 144 154 for drilling supervisor and USD 109 274 for drilling engineer
(https://www.airswift.com/blog/oil-rig-jobs-salary) ≈ **€124 100** and
**€94 100** — a useful Europe-specific anchor.

### A.4.2 Reservoir Engineering
A sub-discipline of petroleum engineering, not a separate BLS occupation. The
O*NET task "Simulate reservoir performance for different recovery techniques
using computer models" `[ONET-172171]` is the core of it. Use the 17-2171 pay
band. Skills that Drillity Talent's own extraction example names — **HPHT**,
**managed-pressure drilling**, **risk assessment** (`PLATFORM_TRUTH.md` Part B)
— sit adjacent.

### A.4.3 Production Technologist
Also within 17-2171. The relevant O*NET tasks: "Monitor production rates and
plan rework processes to improve production"; "Analyze data to recommend
placement of wells and supplementary processes to enhance production"; "Cap
wells with packers or regulate oil outflow" `[ONET-172171]`, `[ONET-475012]`.
This is the person who decides *when a well needs a workover* — which makes
them the natural quest-giver for the §A.3.14 loop.

### A.4.4 Refinery / Plant Operator
**Petroleum Pump System Operators, Refinery Operators, and Gaugers (51-8093)**:
"operate or control petroleum refining or processing units" `[ONET-518093]`.
Concrete tasks: monitor process indicators, instruments, gauges and meters to
detect problems; operate control panels to regulate temperature and pressure;
start pumps and open valves to regulate oil flow; **patrol units** to check tank
levels; collect product samples by turning bleeder valves; read automatic gauges
at set intervals; coordinate shutdowns and major projects `[ONET-518093]`. Tools
include SCADA and PLC software `[ONET-518093]`.
Pay `[BLS-518093]`: n = 33 360; median **USD 45.47/h = USD 94 580/yr ≈
€81 400**; 10th pct USD 57 970 ≈ €49 900; 90th pct USD 110 220 ≈ **€94 900**.
Note this is the **highest-paid non-supervisory hourly role in this whole
document** — a real and slightly surprising fact worth surfacing in-game.

### A.4.5 Refinery / Plant Operations Supervisor
**First-Line Supervisors of Production and Operating Workers (51-1011)**: median
**USD 31.70/h = USD 65 930/yr ≈ €56 800**; 90th pct USD 103 780 ≈ **€89 400**
`[BLS-511011]`. (This SOC covers all manufacturing supervision, so the
refinery-specific figure will sit well above the national median — treat the
band as a floor, not a target.)

---

## A.5 Day-rate summary (EUR/day, converted at ECB 3 Sep 2026)

| Role | Onshore | Offshore | Source |
|---|---|---|---|
| Roustabout | — | 225–430 | `[RZ-ROUST]` |
| Floorhand / Roughneck | ~180–290 | 180–335 (med. 260) | `[RZ-FLOOR]`, `[RW-RN]` |
| Derrickhand | ~240 (BLS-derived) | ~250–330 | `[BLS-475011]`, `[RW-HIER]` |
| Driller | ~280–500 | ~800–1 000 (annual-derived) | `[BLS-475012]`, `[RW-DR]` |
| MWD / LWD | — | 300–905 | `[RZ-DDA]` |
| Directional Driller | 600–1 635 | upper end | `[RZ-DD]`, `[RW-DD]` |
| Mud Engineer | 430–775 | 500–1 120 | `[RZ-MUD]`, `[RW-ME]` |
| Mud Logger | — | 300–600 | `[RW-HIER]` |
| Wireline technician | 225–500 | not blended | `[RZ-WLT]` |
| Wireline supervisor | 515–1 120 | not blended | `[RZ-WLS]` |
| Coiled tubing operator | 265–480 | premium, unquantified | `[RZ-CT]` |
| Fishing tool supervisor | 690–1 550 | — | `[RW-HIER]` |
| HSE advisor | 515–1 035 | — | `[RW-HIER]` |
| Drilling supervisor | 430–905 | 560–1 120 | `[RZ-SUP]` |
| Toolpusher | — | 820–1 810 | `[RZ-TP]` |
| Company Man | 775–1 895 | 775–1 895 | `[RW-CM]` |
| Crane operator (offshore) | — | ~425–660 (annual-derived) | `[RW-HIER]` |
| Offshore rigger | — | ~325 (mid median) | Rigzone rigger page |

**Rule of thumb the game should encode, and which every one of these sources
supports independently:** *offshore pays roughly 1.4–2.0× the onshore rate for
the same job title, and harsh-environment / deepwater / HPHT pays above the
median again.* That is precisely Drillity Talent's **rig class** field doing
work (`PLATFORM_TRUTH.md` Part B).

## A.6 Certifications, and the expiry mechanic

`PLATFORM_TRUTH.md` Part B calls **"expired = cannot mobilise"** the single best
game mechanic on the platform. Here is the sourced set to hang it on.

| Ticket | What it is | Validity | Source |
|---|---|---|---|
| IADC WellSharp (Awareness / Introductory / Driller / Supervisor / Well Servicing) | Well control, with ≥30 % simulator time on the Driller and Supervisor courses | IADC references a **two-year cycle** between well control certifications | `[IADC-WS]` |
| IWCF Drilling Well Control; Well Intervention Pressure Control; Level 1 Awareness; Enhanced Well Control; WOCRM | Well control | Not stated publicly — **UNVERIFIED** | `[IWCF]` |
| H2S (e.g. H2S Alive) | Hydrogen sulphide awareness | **3 years** (recruiter source); under US OCS rules, H2S training is required **before** starting work and **each year** thereafter | `[RW-ENTRY]`, `[CFR-490]` |
| RigPass / SafeLandUSA / SafeGulf | Basic site-access safety orientation, ~1 day | not stated | `[RW-ENTRY]` |
| BOSIET | Offshore survival — "survival, escape, and helicopter ditching" | not stated in reachable sources — **UNVERIFIED** | `[RW-ENTRY]` |
| FOET, HUET, OPITO, OGUK Medical, ENG1, Norwegian Offshore Medical | Named in `DOMAIN.md` §7 / `PLATFORM_TRUTH.md` Part B as real, expiry-tracked | **UNVERIFIED durations** — OPITO's standards pages were not reachable in this research | `DOMAIN.md`, `PLATFORM_TRUTH.md` |

**Implementer's warning.** Do **not** invent a validity period. If the game
shows "BOSIET — expires in 142 days", that number must come from an OPITO
standard, not from us. Either source it, or show only the boolean state
(valid / expired) and let the contract board enforce it.

**Two sourced modifiers worth building in:**
1. Certifications raise entry-level pay by "roughly **15–25 %**" `[RW-ENTRY]`.
2. Well-control and OEM tool certifications add **USD 20–120/day** (€17–105) to
   an offshore directional hand `[RZ-DDA]`.

## A.7 The ladder, drawn

```
DECK / ENTRY            FLOOR                    CHAIR               RIG BOSS
roustabout ──────────▶ floorhand ─────▶ derrickhand ─────▶ driller ─────▶ night TP
   │                   (roughneck)      (+ mud system)      │            ─▶ day TP
   │                        │                               │            ─▶ senior TP
   │                        │                               │                  │
   │                        └───────────▶ motorman          │                  ▼
   └───────────▶ crane operator (offshore)                  │                 OIM
                                                            │
SERVICE TRACK                                               │
  MWD hand ──▶ assistant DD ──▶ DD ──▶ senior DD ──▶ directional coordinator
  mud engineer ──▶ senior mud engineer ──▶ fluids specialist
  wireline op ──▶ wireline supervisor ──▶ field service manager
  CT operator ──▶ CT supervisor
                                                            │
OPERATOR TRACK                                              ▼
  petroleum engineer ──▶ drilling engineer ──▶ COMPANY MAN ◀── (crossing from TP)
                                             ──▶ drilling superintendent
```
Sources for each arrow: `[RW-ENTRY]`, `[RW-RN]`, `[DM-DERR]`, `[RW-DR]`,
`[RW-TP]`, `[RW-CM]`, `[RW-HOWDD]`, `[RW-HIER]`, `[DM-CREW]`.

---

# B. THE WORK ITSELF

## B.1 The phases of drilling a well

A well is not one hole. It is a **telescope of progressively smaller holes**,
each one drilled, then lined with steel, then cemented, before the next one
starts inside it. "Modern wells generally have two to as many as five sets of
subsequently smaller hole sizes, each cemented with casing" `[WP-WELL]`
(https://en.wikipedia.org/wiki/Oil_well).

### Phase 0 — Move in and rig up
Land: the rig is trucked in and the mast raised. Offshore: the unit is towed,
jacked, moored or DP'd onto location (§C.1). A land site is not small —
`[WITTIG]` p.19 gives a real German requirement set: **minimum ~3 000 m², up to
10 000 m² (1 ha)**; access for low-loaders; sealed surfaces for hazardous
substances; a **drill cellar** with rig foundations; sewer connection or sewage
pit; water supply; oil separator; fixed fencing; power; and provision for a
**gas flare**.

### Phase 1 — Spud, and the conductor
**Spudding in** is the first turning of the bit into undrilled ground.
The first pipe is the **conductor** (or a **drive / structural** string before
it). Its job: "to prevent the sides of the hole from caving into the wellbore"
where the ground is "unconsolidated sediment or soil" rather than rock; it may
be "driven into the ground" before drilling starts or set soon after
`[SLB-CP]` (https://glossary.slb.com/terms/c/conductor_pipe). Regulatory
language: drive or structural casing is "set by driving, jetting, or drilling"
`[CFR-421]`. Typical conductor diameter **18–30 in (457–762 mm)** `[WP-CASING]`.

**What is different about this phase: there is no BOP yet. There is a diverter.**
The rule is explicit: *"You must install a diverter system before you drill a
conductor or surface hole"*, comprising a diverter sealing element, diverter
lines and control systems, designed "to ensure proper diversion of gases, water,
drilling fluid, and other materials **away from facilities and personnel**"
`[CFR-430]`. You cannot shut a shallow hole in — the formation is too weak to
hold pressure and you would break it down and broach to surface. So you point
the flow overboard and downwind. See §D.7.

### Phase 2 — Surface hole, and the surface casing
Drill down through the shallow section and set the **surface casing**: "a
large-diameter, relatively low-pressure pipe string set in shallow yet competent
formations", which (i) protects fresh-water aquifers onshore, (ii) **enables a
diverter or a blowout preventer to be attached to the top**, and (iii) provides
the structural strength from which every deeper string is suspended `[SLB-SC]`
(https://glossary.slb.com/terms/s/surface_casing). Typical diameter **13⅜ in
(340 mm)** `[WP-CASING]`. The regulator adds: surface casing is designed with
regard to hydrocarbons, hazards and **water depth**, and its cement must fill
the annulus to a minimum of **200 ft (61 m) MD inside the conductor**, extending
to mudline where near-surface fractures exist `[CFR-421]`.

**What changes at this phase: the BOP stack goes on.** From here the well can be
shut in. This is the most important state transition in a well and the game
should mark it with everything it has — a different HUD, a different hazard set,
a different soundtrack.

### Phase 3 — Intermediate hole and intermediate casing
The middle of the well, and where most trouble lives. The intermediate string
"isolates hydrocarbon-bearing, abnormally pressured, fractured and lost
circulation zones, providing well control as engineers drill deeper" (PetroWiki,
https://petrowiki.org/Casing_and_tubing); SLB puts it as protection "against
caving of weak or abnormally pressured formations" which "enables the use of
drilling fluids of different density necessary for the control of lower
formations" `[SLB-IC]` (https://glossary.slb.com/terms/i/intermediate_casing).
Regulatory cement requirement: isolate **all** hydrocarbon zones and abnormally
pressured intervals, with a minimum of **500 ft (152 m) MD of cement above the
casing shoe and above each such zone** `[CFR-421]`.

There may be more than one intermediate string. Each one exists because **the
mud-weight window closed** — see §B.2.

### Phase 4 — Production hole and production casing / liner
Drill the reservoir section. Production casing "is used to isolate production
zones and contain formation pressures in the event of a tubing leak"
(PetroWiki, https://petrowiki.org/Casing_and_tubing). Cement must cover and
isolate hydrocarbon zones above the shoe, with **500 ft MD above the shoe and
above the uppermost hydrocarbon zone** `[CFR-421]`.

A **liner** is a string that does not run back to surface: it hangs off inside
the previous casing. The regulator gives the overlaps — a surface liner must
extend **200 ft MD** above the previous shoe; intermediate and production liners
**100 ft MD** `[CFR-421]`. Typical production liner **7 in (178 mm)**
`[WP-CASING]`. A liner is cheaper than a full string, which is exactly why it
exists — a real economic decision for the game.

### Phase 5 — Evaluate
Logs (wireline §A.3.9, or LWD §A.3.5), cores, possibly a production test. The
jack-up spec carries a whole **Section I — Production Test Equipment**: burners,
burner booms, sprinkler system, fixed piping for well testing `[IADC-JU]`. That
is where the flare in the artwork comes from.

### Phase 6 — Complete
Perforate the pay (§A.3.12); run **tubing** with a **packer** that seals the
annulus above the producing section; land the hanger; install the **christmas
tree** `[WP-WELL]`, `[DICT]` p.1246, p.1079. The rig then moves off and the well
is handed to production.

### Phase 7 — Abandon (eventually)
"To cease efforts to produce oil or gas from a well, and to plug the wells of a
depleted formation and salvage all material and equipment" `[DICT]`
(Abandon(ment)). Cement plugs go back in `[SLB-CEM]`. `[SUPPLHI]` files
**Plug & Abandonment** as its own drilling-system category (28.01.06G) — an
industry in itself and a legitimate late-game contract type.

### Sizes: what to put on screen, and what not to
**Sourced and safe to display:**
- API Specification 5C3 standardises **14 casing sizes from 4½ in (114.3 mm) to
  20 in (508 mm) OD** `[WP-CS]` (https://en.wikipedia.org/wiki/Casing_string).
- The real casing-size ladder that rig handling tools are built for, read off a
  standard API 7K handling-tool range `[NOV-RH]`: 6⅝ · 7 · 7⅝ · 8⅝ · 9 · 9½ ·
  9⅝ · 9⅞ · 10 · 10¾ · 11¼ · 11⅞ · 12 · 12¾ · 13⅜ · 13½ · 13⅝ · 14 · 16 · 18 ·
  18⅝ · 20 · 22 · 23 · 24 · 24½ · 26 · 28 · 30 · 33 · 36 in.
- Conductor **18–30 in**, surface **13⅜ in**, production liner **7 in**
  `[WP-CASING]`.
- Corroborating hardware evidence from a real rig `[IADC-JU]`: the **low-pressure
  BOP stack is 21¼ in / 2 000 psi** (it lands on the 20 in string) and the
  **high-pressure stack is 13⅝ in / 10 000 psi** (it lands on the 13⅜ in
  string); its ram inventory includes **fixed pipe rams for 3½, 5, 7 and 9⅝ in**
  — direct evidence that 9⅝ in and 7 in are the strings that pass through it.

**NOT sourced here — do not display:** the classic bit-size ladder
(36″ → 26″ → 17½″ → 12¼″ → 8½″). It is universally quoted in the industry and
almost certainly right, but no source reached in this research states it. Mark
**UNVERIFIED**; either cite an API standard or an operator well-design manual
before putting it on screen, or drive the game off casing sizes (which *are*
sourced) instead.

---

## B.2 Why casing strings are set where they are

This is the deepest idea in the industry and it is completely game-shaped.

### The window
At any depth the wellbore lives between two pressures:

- **Pore pressure** — the pressure of the fluid in the rock. If the mud column
  exerts less than this, formation fluid comes in: **a kick**.
- **Fracture pressure** — the pressure at which the rock breaks. If the mud
  column exerts more than this, the rock splits and mud goes out: **lost
  circulation**.

Stated in the literature: "for each drilling interval, a mud density is used
that is greater than the pore pressure gradient, but less than the fracture
pressure gradient. As the well is deepened, the mud weight is increased to
maintain a safe margin above the pore pressure gradient. If the mud weight falls
below the pore pressure gradient … taking a kick. If the mud weight exceeds the
fracture gradient, the formation may be fractured resulting in lost circulation"
(ScienceDirect topic page, *Fracture Gradient*,
https://www.sciencedirect.com/topics/engineering/fracture-gradient).

The gap between those two curves is **the mud-weight window**. It is not
constant. It **narrows with depth**, and it slams shut when you drill into an
overpressured zone.

### Why a casing seat exists
Because **the weakest point of an open hole is the last casing shoe.** Once
casing is set and cemented, everything above the shoe is protected steel; only
the open hole below it can break down. So the maximum mud weight you can carry
is limited by the strength of the rock at the **shoe**, not by the rock at the
bottom of the hole.

Therefore: **you set casing at the depth where the mud weight you need below is
about to exceed the fracture strength above.** The engineering statement:
"the casing seat points must be placed at a competent formation that must be
able to withstand the hydrostatic pressure exerted by the drilling mud column as
well as the kick imposed pressure and frictional pressures that will arise
during … secondary well control operations" (Drilling Manual, kick tolerance,
https://www.drillingmanual.com/kick-tolerance-calculation-definition-formula/).
And: "casing setting depths are selected based on pore pressure gradient,
fracture pressure gradient and mud weight using [a] graphical method" (ibid.).

### Kick tolerance — the number that actually decides it
**Kick tolerance** is "the maximum kick volume of fluid that can be taken into
the wellbore and circulated out without fracturing the formation at a weak point
(shoe) thereby exceeding the leak-off, given a difference between the pore
pressure and the equivalent circulating density, mud density in use. The
importance of incorporating kick tolerance in the well design programme is
critical as drilling operation moves to more challenging fields with tight
windows between pore and fracture pressure" (Drilling Manual, as above).

That single sentence is a game design document. **Kick tolerance falls as you
drill deeper below a shoe.** When it reaches zero you have no margin left and
you must set casing — or the next kick kills the well.

### The other reasons a string goes where it goes
Beyond pressure, `[CFR-420]` requires the casing and cementing programme to:
1. "Properly control formation pressures and fluids"
2. "Prevent the direct or indirect release of fluids from any stratum through
   the wellbore into offshore waters"
3. "Prevent communication between separate hydrocarbon-bearing strata"
4. "Protect freshwater aquifers from contamination"
5. Support unconsolidated sediments, with adequate centralisation

Plus **hole stability** — the intermediate string exists partly to case off
"caving of weak … formations" `[SLB-IC]` — and **open-hole exposure time**: the
longer a section stays open, the more it swells, caves or sticks the pipe.
`[WITTIG]` p.129 lists "reduces open hole exposure time and associated drilling
problems" among the ten reasons casing-while-drilling exists.

### This is your core loop. Say it plainly.
> Every metre you drill without setting casing is cheaper *and* riskier. Setting
> early costs a string and shrinks every hole below it. Setting late risks the
> whole well. **When to set casing is the decision.**

### What it looks like — drawing notes
Draw the cross-section with **three vertical curves against depth**, alongside
the hole:
- a **pore pressure** curve (left),
- a **fracture gradient** curve (right),
- the player's **mud weight / ECD line** between them, visibly wandering.

Shade the space between pore and fracture as a **corridor that narrows with
depth**. Draw each set casing shoe as a **hard bracket** on the fracture curve:
above it the corridor is irrelevant; below it, the fracture limit is pinned to
the strength at that shoe. A kick is the mud line crossing left; losses are it
crossing right. Nothing else in this game — and nothing in any other drilling
industry — looks like that.

---

## B.3 Mud: what it does, what mud weight is for, why it is engineered

### The functions
Drilling fluid does eleven things `[WP-MUD]`
(https://en.wikipedia.org/wiki/Drilling_fluid):
1. Remove cuttings from the hole
2. Suspend and release cuttings (hold them when circulation stops)
3. **Control formation pressures**
4. Seal permeable formations (build a filter cake)
5. Maintain wellbore stability
6. Minimise formation damage
7. Cool and lubricate the bit and string
8. **Transmit hydraulic energy** — this is what drives a mud motor
9. Enable formation evaluation (preserve cuttings)
10. Control corrosion
11. Facilitate cementing and completion

`[DICT]` (entry "Mud") says the same in one paragraph: mud is "pumped into a well
at densities calculated to provide a hydrostatic pressure sufficient to overcome
downhole formation pressures … continuously circulated down to the bit, and
returns in the annular space outside the drill-string, bringing with it rock
cuttings for inspection and keeping the well clean … also engineered to maintain
a thin protective layer" on the wall.

`[WITTIG]` p.89 gives the same short list for bit hydraulics: **clean the bit,
discharge the cuttings, cool, lubricate.**

### Mud weight
**Mud weight is density.** Units: **ppg** (pounds per US gallon), **sg**, or
**kg/m³** `[WP-MUD]`. Its purpose is hydrostatic: the mud column must exert more
pressure than the formation fluid. That is **primary well control**. Everything
else on the rig — the BOP, the choke, the kill sheet — is the fallback for when
mud weight fails.

Weighting agent: **baryte (barium sulfate)**. Viscosifier: **bentonite**.
Polymers (xanthan, guar, CMC/PAC) do viscosity and filtration control; caustic
soda and lime do chemistry `[WP-MUD]`.

### ECD — the number a driller actually watches
Static mud weight is not what the formation feels while you are circulating.
**Equivalent circulating density** is "the effective density exerted by a
circulating fluid against the formation that takes into account the pressure
drop in the annulus above the point being considered" `[SLB-ECD]`
(https://glossary.slb.com/terms/e/equivalent_circulating_density), with the
formula given as:

> **ECD = d + P / (0.052 × D)**
> where d = mud weight (ppg), P = the annular pressure drop between depth D and
> surface (psi), D = depth (ft). `[SLB-ECD]`

And the reason it matters, verbatim: ECD "is an important parameter in avoiding
kicks and losses, particularly in wells that have a narrow window between the
fracture gradient and pore-pressure gradient" `[SLB-ECD]`.

**Game consequence, and this is the big one:** *turning the Flush slider up
raises the pressure the formation sees.* In every other Drillity industry, more
flush is unambiguously good. In oil & gas, **more flush can break the formation
and lose the well.** That is the single best differentiator the industry offers.

### Mud types
- **Water-based (WBM)** — the default; water + bentonite + additives.
- **Oil-based (OBM)** — better lubricity and thermal stability, worse disposal.
- **Synthetic-based (SBM)** — oil-mud properties with reduced toxicity, which is
  precisely why it exists offshore.
- **Air / foam** — for highly porous formations. `[WP-MUD]`

Drillity iMarket already carries **Drilling Fluids & Additives**, **Mud Pumps**,
**Mixing & Recycling**, **Mud Tanks**, **Shale Shakers**, **Desanders &
Desilters** as real taxonomy nodes (`DOMAIN.md` §3 group C) — the shop is
already built for this.

### Solids control — the train, in order
Returns leave the well through the **bell nipple** and **flow line**, then:
**shale shakers → degasser → desander → desilter → centrifuge** `[WP-MUD]`.
On the real jack-up `[IADC-JU]` §F.2 that train is: **4 linear-motion shale
shakers**, a stand-alone circular **desilter** (17 cones × 4 in), a **desander**,
a **mud cleaner**, a **mud/gas separator ("poor boy")**, a vacuum **degasser**,
and **5 mud agitators** (4 × 15 hp plus 1 × 5 hp on the slug pit).

### What it looks like — drawing notes
- The **shaker house** is the most watchable object on a rig: mud sheeting
  across vibrating screens, cuttings walking off the end into the ditch. **The
  size and shape of the cuttings is a well-control instrument** (§D.1) — draw
  them large enough to read.
- The **pits** are open rectangular steel tanks with **agitator** impellers
  turning in them. The **pit volume totalizer** is a level float per tank.
- The **mud/gas separator** is a tall vertical vessel with a gas line running to
  the flare — light the flare when gas is being circulated out.
- **Colour matters.** WBM is grey-brown; heavily weighted mud is nearly white;
  OBM is black-brown. Gas-cut mud is visibly frothy and lighter — `[DM-KICK]`
  describes gas-cut mud as appearing "fluffy".

---

## B.4 Directional drilling

### The shape of a directional well
Standard section names per `[RW-DD]`: **vertical → kickoff → build → lateral**,
with a **tangent (hold)** section between build and landing on a conventional
S- or J-profile. `DESIGN_EXPANSION.md` §1 already names the required geometry:
"vertical, then build angle, then hold a tangent, then a lateral."

- **KOP (kick-off point)** — where you stop drilling vertical and start building.
- **Build section** — inclination increases at a chosen **build rate**, quoted
  as **dogleg severity** in degrees per 30 m (or per 100 ft).
- **Tangent / hold** — constant inclination and azimuth.
- **Landing** — reaching target inclination (often ~90°) at the top of the pay.
- **Lateral** — the horizontal section through the reservoir.

`[WP-DD]` gives no numeric DLS band, so **do not display a "typical DLS" figure**
without a further source — mark **UNVERIFIED**. What `[WP-DD]` *does* give, and
which is safe: **survey intervals of 10–150 m (33–492 ft)**, with **30 m (98 ft)
common during active steering** and **60–100 m (200–330 ft) while drilling
ahead**.

### Sliding vs rotating — the core mechanic
Two ways to make hole with a bent-housing mud motor:

| | **Rotating** | **Sliding** |
|---|---|---|
| Drill string | rotating from surface | **not** rotating |
| What turns the bit | top drive **and** mud motor | mud motor only |
| Where it goes | straight ahead (the bend averages out) | where the bend points |
| Speed | fast | "almost always slower and therefore more expensive" `[WP-DD]` |
| Hole cleaning | good — rotation stirs the cuttings bed | poor — cuttings settle on the low side |
| Risk | — | drag, poor weight transfer, string can stick |

`[WP-DD]`: "drilling directionally with a downhole motor requires occasionally
stopping rotation of the drill pipe and 'sliding' the pipe through the channel."
A **bent sub** between the stationary pipe and the motor enables the direction
change `[WP-DD]`.

**Toolface** is how you aim while sliding: the angle, in a plane perpendicular
to the string, between a reference direction on the string and a fixed reference
`[SLB-TF]`. In near-vertical hole the fixed reference is magnetic north
(**magnetic toolface**); in deviated hole it is the high side of the borehole
(**gravity / high-side toolface**) `[SLB-TF]`. **High side = build. Low side =
drop. Left/right = turn.**

`DESIGN_EXPANSION.md` §1 already specifies the HDD equivalent ("12 o'clock steers
up, 6 o'clock down"). The oil & gas version is the same clock, read off an MWD
toolface instead of a walkover locator. **Reuse the UI.**

### Rotary steerable systems (RSS)
"Allow directional control while rotating", making previously difficult
formations accessible `[WP-DD]`. In game terms: an expensive tool that removes
the sliding penalty. A perfect iMarket upgrade — `DOMAIN.md` §3 group D already
lists **Directional Drilling → Mud Motors, MWD/LWD, Steering Tools, Survey
Tools, Directional Subs**.

### What MWD actually measures
The survey triplet, verbatim: MWD systems use "gyroscopes, magnetometers, and
accelerometers to determine borehole inclination and azimuth" `[WP-DD]`. So:
- **Inclination** — angle from vertical, from accelerometers (they sense gravity).
- **Azimuth** — compass direction, from magnetometers (they sense the earth's
  field) — which is why the survey sub must sit in **non-magnetic drill collars**
  `[WITTIG]` p.57 ("Non-magnetic drill collars made of special steel").
- **Toolface** — the roll orientation of the bend `[SLB-TF]`.

Modern tools add downhole WOB, torque, vibration and pressure. **LWD** adds
formation measurements (resistivity, gamma) used for geosteering `[RW-DD]`.

Data comes up the mud column as **mud-pulse telemetry**, which has a beautiful
gameplay consequence: **you only get data while the pumps are running.** Stop
circulating and the tool goes silent. `[DM-TO]` uses exactly this as a
diagnostic: "If an MWD tool is in the drill string, check to see if it is still
pulsing OK (lack of a pulse could indicate a pipe washout has occurred above the
tool)."

### What it looks like — drawing notes
The cross-section needs a **profile mode** exactly as `DESIGN_EXPANSION.md` §1
specifies for HDD, but starting vertical: vertical top, a smooth build arc, a
straight tangent, a landing curve, a long lateral. Draw the **planned path as a
ghost line and the actual path as the solid one**, with **survey stations as
discrete dots** — because that is genuinely all you know. Between stations the
position is an interpolation, and the player should feel that uncertainty.

---

## B.5 Tripping and connections

### What a connection is
"The act of adding a joint or stand of drillpipe to the top of the drillstring,
also described as 'making a connection'" `[SLB-CONN]`
(https://glossary.slb.com/terms/c/connection). The word also means the threaded
joint itself.

Mechanically, with a top drive: stop drilling; pick up off bottom; stop rotating
and pumping; set the **slips** to hang the string in the rotary; break the top
drive out; pick up the next joint or stand from the **mousehole** or the
derrick; stab it; spin it up and torque it with the **iron roughneck**;
re-connect the top drive; pull the slips; start pumps; drill ahead.

Why it matters: every connection is a pause in circulation and a moment when the
string is stationary — precisely when **differential sticking** happens (§D.3)
and when **connection gas** shows up (§D.1).

`[WITTIG]` p.47 gives the reason connections are the weak point of a drill
string: **"86 % of total drill string failures are tool joint failures."**

### What a trip is
"The act of pulling the drillstring out of the hole or replacing it in the hole",
typically "because the bit has dulled or has otherwise ceased to drill
efficiently and must be replaced" `[SLB-TRIP]`
(https://glossary.slb.com/terms/t/trip). A **round trip** is "the complete
operation of removing the drillstring from the wellbore and running it back in
the hole" `[SLB-RT]` (https://glossary.slb.com/terms/r/round_trip).

### Why it costs so much time — with a number
`[SLB-RT]` gives the working rule: a competent crew needs **about one hour per
thousand feet of hole, plus an hour or two for handling collars and bits.**

In SI: **≈ 3.3 hours per 1 000 m of hole**, plus 1–2 h fixed.
- A 3 000 m well: ~10 h + 1–2 h ≈ **11–12 hours** per round trip.
- A 4 500 m well: ~15 h + 1–2 h ≈ **16–17 hours**.

`[WITTIG]` p.120 gives the cost model the industry actually uses, and the game
should adopt it verbatim:

> **CPF = ( C_b + C_f × ( t_b + t_t + t_s ) ) / D**
> C_b = bit cost; C_f = rig rental + additional costs per hour (drilling fluid,
> extra equipment, crew wages); t_b = on-bottom drilling time; t_t = tripping in
> and out time; t_s = additional / non-productive time; D = interval drilled.

`[WITTIG]` p.121–122 works a real example: bit lost in hole USD 32 000; 50 h
drilling; 5 h trip in; 4.5 h trip out; rig rental **USD 3 500/h**; auxiliary
costs (crew, fluid) **USD 900/h**; 5 000 ft drilled → **USD 59 per foot**.
Converted at `[ECB]`: rig + auxiliary ≈ **€3 790/hour**; result ≈ **€167 per
metre**.

**That equation is the entire economics of the industry, and it is the scoring
function this game has been missing.** See §E.2.

### Why the trip exists at all
`[WITTIG]` p.105 gives the wear model: roller-cone bit wear is graded on an
**8-step scale** — for milled teeth, T3 means "3/8 of the original teeth are worn
down"; for carbide inserts, T3 means "3/8 of all inserts are missing or broken
off." Plus bearing failure and gauge wear. `FACTS_VERIFIED.md` already carries
the game's own line: past ~70 % worn, penetration falls off a cliff.

### What it looks like — drawing notes
- A **stand** is normally 3 joints ("triples") — `[WITTIG]` p.36 lists "allows
  for lowering and hoisting 'triples' (3 joint drill pipes) → decreased trip
  time" as a top-drive advantage. Drill pipe **Range 2 is 8.23–9.14 m** per
  joint `[WITTIG]` p.43, so a triple stand is **≈ 27 m** — taller than a naive
  drawing suggests. **Get this right or drillers will notice.**
- Tripping animation: block runs down, elevators latch, block runs up ~27 m,
  slips set, break out, derrickhand swings the stand into the fingerboard,
  repeat. The **rhythm** of that is the sound of the industry.
- The **fingerboard** fills visibly as you trip out: a real jack-up racks
  **20 465 ft ≈ 6 240 m** of pipe `[IADC-JU]` §B.1.2 — at ~27 m/stand, **≈ 230
  stands**. Draw them all.

### Bonus: the drill string, correctly
For anyone modelling the string `[WITTIG]` pp.42–66:
- **Drill pipe**: seamless, upset at the ends (IU / EU / IEU). API length ranges:
  **R1 5.49–6.71 m**, **R2 8.23–9.14 m**, **R3 11.58–13.72 m** (without
  connection). Grades **E-75, X-95, G-105, S-135** and up.
- **Tool joints**: rotary shouldered connections — box-and-pin with a torque
  shoulder, tapered, coarse pitch (4–5 TPI), high make-up torque.
- **Drill collars**: heavy-walled, **35–450 kg/m** depending on diameter. They
  provide the WOB. Spiral collars flush better and reduce differential sticking.
- **The neutral point** must sit inside the collar section: use **2/3 of collar
  weight for WOB and keep 1/3 in reserve**. Above the neutral point the string
  hangs in tension — "the drill bit is hanging on a shoe lace."
- **HWDP** (heavy weight drill pipe) is the transition between collars and pipe.
- **Stabilizers** control hole deviation, minimise dogleg severity, prevent
  differential sticking, reduce buckling and bending in the collars, increase bit
  life, give angle control in directional drilling, and allow more WOB.
- **WOB rule of thumb for a tricone: ≈ 2 tonnes per inch of bit diameter**
  `[WITTIG]` p.66. A 12¼ in bit ⇒ ~24.5 t ≈ **240 kN**. That is a real number
  the Feed slider can be calibrated against.
- **PDC vs tricone** `[WITTIG]` p.115: a PDC bit costs **5–15× a tricone**, runs
  at **high RPM (60–80) and LOW WOB**, is an excellent directional tool, suits
  soft-to-medium brittle rock, and is **not** suitable for quartzite or igneous
  rock. That is a genuine, sourced loadout choice.

---

# SOURCE KEY — additions for §§B.6 – F

These keys are used from §B.6 onward. The keys defined at the top of the file
remain valid and are reused throughout.

| Key | Source |
|---|---|
| `[DM-OFFS]` | Drilling Manual, "Offshore Drilling Rigs Types in Oil & Gas" — https://www.drillingmanual.com/offshore-drilling-rigs-types-in-oil-gas/ |
| `[DM-SG]` | Drilling Manual, shallow gas drilling procedure — https://www.drillingmanual.com/shallow-gas-drilling-procedure/ |
| `[DM-DLS]` | Drilling Manual, dogleg severity guide — https://www.drillingmanual.com/dogleg-severity-guide-calculation-formula/ |
| `[GAD-DLS]` | GA Drilling glossary, Dogleg Severity (DLS) — https://www.gadrilling.com/glossary/dogleg-severity-dls |
| `[GAD-NPT]` | GA Drilling glossary, Non-Productive Time (NPT) — https://www.gadrilling.com/glossary/non-productive-time-npt |
| `[ENV-RIG]` | Enverus, "Offshore Rigs Primer" — https://www.enverus.com/blog/offshore-rigs-primer-offshore-drilling/ |
| `[WP-TENDER]` | Wikipedia, *Tender rig* — https://en.wikipedia.org/wiki/Tender_rig |
| `[WP-MOON]` | Wikipedia, *Moon pool* — https://en.wikipedia.org/wiki/Moon_pool |
| `[SLB-DS]` | SLB Energy Glossary, *differential sticking* — https://glossary.slb.com/terms/d/differential_sticking |
| `[MERLIN]` | Merlin ERD, "Stuck Pipe Mechanism Diagnosis — Summary" — https://merlinerd.com/stuck-pipe-mechanism-diagnosis-summary/ |
| `[DF-CSG]` | Drilling Formulas, "Casing Size Selection" — https://www.drillingformulas.com/casing-size-selection-how-to-select-casing-size-to-match-the-drilling-and-completion-goal/ |
| `[DF-SG]` | Drilling Formulas, "Introduction to Shallow Gas Well Control" — https://www.drillingformulas.com/introduction-to-shallow-gas-well-control/ |
| `[SPE-SG]` | SPE-63197-MS, *Shallow Gas Kick: Simulation and Analysis for Top Hole Drilling Without a Riser* — https://onepetro.org/SPEATCE/proceedings-abstract/00ATCE/All-00ATCE/SPE-63197-MS/132139 (abstract only) |
| `[DC-NPT]` | *Drilling Contractor*, "Rig NPT: the ugly truth" — https://drillingcontractor.org/rig-npt-the-ugly-truth-6795 |

---

## B.6 The two numbers the earlier draft could not source

§B.1 ended with an explicit refusal: *"NOT sourced here — do not display: the
classic bit-size ladder"*. §B.4 carried the matching refusal for dogleg severity:
*"do not display a 'typical DLS' figure without a further source"*. Both gaps are
closed here. **These two subsections supersede those two warnings.**

### B.6.1 The bit-size / casing-size ladder

**First, the rule that actually governs — and it is not a table.**

Two constraints, both physical, define the whole ladder:

1. **The hole must be bigger than the casing that goes in it.** `[DF-CSG]` states
   it flatly: *"Casing size must be smaller than bit size."* The difference is the
   annulus that takes the cement.
2. **The next bit must pass through the casing you just set.** `[WP-CS]` puts the
   consequence in one sentence: the next section is drilled *"necessarily with a
   smaller bit diameter that will pass through the newly installed casing."*

So the ladder is not a convention — it is a **chain of clearances**, and each
rung is fixed by the internal diameter of the casing above it. Change the weight
(ppf) of a casing string and its ID changes, and the bit that fits below it can
change with it. `[DF-CSG]`'s own worked example gives one full, real rung:
**7 in casing, 26 ppf, ID 6.276 in.**

**Second, the ladder itself, rung by rung, with the sourcing state of each.**

| Hole (bit) | Casing set in it | String | Sourcing state |
|---|---|---|---|
| 36 in / 26 in | 30 in / 20 in | conductor, then surface | Conductor **18–30 in** is sourced `[WP-CASING]`. The 36 in and 26 in **bit** sizes are **UNVERIFIED** — but the 20 in string is corroborated by hardware: the jack-up's **low-pressure BOP stack is 21¼ in / 2 000 psi** `[IADC-JU]` §E.2, which lands on a 20 in string. |
| 17½ in | 13⅜ in | surface | Surface casing **13⅜ in** is sourced `[WP-CASING]` and corroborated by hardware — the **high-pressure stack is 13⅝ in / 10 000 psi** `[IADC-JU]` §E.3, which lands on the 13⅜ in string. The **17½ in bit** is the universally quoted partner, but **no fetched source states it**: `[DF-CSG]`'s worked example actually pairs **17½ in hole with 16 in casing** and **14¾ in hole with 13⅜ in casing**. Treat 17½ → 13⅜ as **INDUSTRY-COMMON, NOT SOURCED**. |
| 12¼ in | 9⅝ in | intermediate | **Directly sourced** `[DF-CSG]` (worked example: 12¼ in bit, 9⅝ in casing). Corroborated: the 13⅝ in stack carries **fixed pipe rams for 3½, 5, 7 and 9⅝ in** `[IADC-JU]` §E.3.3 — 9⅝ in is a string that passes through it. |
| 8½ in | 7 in | production casing or liner | **Directly sourced** `[DF-CSG]`: *"Bit size = 8-1/2" / Casing = 7", 26 ppf, ID 6.276""*. Production liner **7 in** independently sourced `[WP-CASING]`; 7 in is also in the jack-up's ram inventory `[IADC-JU]`. |

Every casing size in that column — 20, 13⅜, 9⅝, 7 — appears in the API 7K
handling-tool range already quoted in §B.1 from `[NOV-RH]`, so all four are real,
handled, standard sizes, and all four sit inside the **14 API 5C3 sizes from
4½ in to 20 in** `[WP-CS]`.

**The honest finding for the implementer: there is no single canonical ladder.**
The 12¼ → 9⅝ and 8½ → 7 rungs are directly sourced. The 17½ → 13⅜ rung is a
*family* of variants (17½ → 16, 14¾ → 13⅜, 17½ → 13⅜) and the source that was
reachable shows two of those three, not the famous one.

**What the game should do with this.**

- **Display the casing ladder, not the bit ladder.** All four casing sizes are
  sourced; two of the four bit sizes are not.
- If a bit size must appear on screen, show **12¼ in** and **8½ in**.
- Better still: **drive the mechanic off clearance, not off a lookup table.**
  Give each casing an ID; a bit fits if it is smaller. That is the real rule, it
  is sourced twice, and it produces the ladder as an emergent consequence.
- **The economic consequence is the game.** Every string you set costs a string
  *and* shrinks every hole below it. Set one string too many and the production
  hole is too small to complete properly.

### B.6.2 Dogleg severity — the number, and why it is a budget

**Definition and units.** Dogleg severity is *"a measure of the amount of change
in the inclination, and/or azimuth of a borehole usually expressed in degrees per
100 feet of course length"*, and in metric *"expressed in degrees per 30 meters
or degrees per 10 meters of course length"* `[DM-DLS]`. `[GAD-DLS]` agrees:
*"typically expressed in degrees per 100 feet (°/100ft) or degrees per
30 meters."*

**Conversion note:** 100 ft = 30.48 m, so **°/100 ft and °/30 m differ by 1.6 %**
— interchangeable at this game's precision. Display **°/30 m** (SI, per
`PLATFORM_TRUTH.md` Part C rule 3) and keep the oilfield word "dogleg".

**The bands, sourced `[GAD-DLS]`:**

| Band | DLS | Wording |
|---|---|---|
| Conventional drilling | **3–5 °/100 ft** (≈3–5 °/30 m) | *"Conventional drilling operations typically limit DLS to 3-5°/100ft"* |
| Casing-wear threshold | **> 5 °/100 ft** | *"casing wear accelerates significantly above 5°/100ft"*, attributed to API RP 7G |
| Bent-housing mud motor, max build | **8–10 °/100 ft** | *"Conventional motors [are] limited to approximately 8-10°/100ft maximum build rates"* |
| High-DLS rotary steerable | **up to 15 °/100 ft** | *"High-DLS RSS can achieve up to 15°/100ft"* |

**The pipe-fatigue limit, sourced `[DM-DLS]`:** for **4½ in Grade E drill pipe**
with an **18 000 psi endurance limit**, the maximum permissible dogleg severity is
**≈18.3 °/100 ft with no tensile stress** — and the two qualifiers are the ones
that matter for gameplay:

> *"higher dogleg severities can be tolerated if the tension in the drill pipe is
> very low"* … *"the dogleg severity in a normal directional well has to be lower
> at the kickoff point because the tension will be a maximum at that point."*
> `[DM-DLS]`

**This is a fully sourced mechanic.** Turning harder is always faster in plan view
and always more expensive, in three separate currencies:

1. **Casing wear** — above 5 °/30 m the string grinds the casing above it.
2. **Drill-pipe fatigue** — and the allowable dogleg is **lowest where the tension
   is highest, i.e. near the top of the hole**. A dogleg put in at the kick-off
   point is worse than the same dogleg put in near TD.
3. **Tool cost** — beyond ~10 °/30 m a bent-housing motor cannot do it at all;
   you must buy the rotary steerable (§B.4). A real iMarket purchase decision.

**Game rule, in one line:** *the build-rate control is cheap at 3, expensive at 6,
and needs a tool you may not own at 12 — and the same number costs more near
surface than at depth.*

Cross-reference: `[WP-DD]`'s sourced survey intervals from §B.4 still stand —
**10–150 m**, with **30 m common during active steering** and **60–100 m while
drilling ahead**. Survey interval is the *measurement* resolution; DLS is what
you measure between two consecutive stations. Draw the survey stations as dots
(§B.4) and compute DLS between them — that is exactly what a directional driller
does.

---

# C. THE MACHINES

`PLATFORM_TRUTH.md` Part B makes **Rig type** a first-class, matchable field, and
`DOMAIN.md` §7 lists the seven values verbatim: **Jackup · Semi-submersible ·
Drillship · Platform rig · Land rig · Tender-assisted · Barge rig.** They are not
seven skins on one machine. They are seven different answers to one question:
**how do you hold a drill floor still over a fixed point on the seabed?**

Everything above the drill floor is nearly identical on all seven. Everything
below it is completely different. **That is the art-direction insight: model the
rig once, model the substructure seven times.**

## C.1 The seven rig types

### C.1.0 The one-table summary

| Rig type | Water depth | How it gets there | How it stays there | The silhouette, in one line |
|---|---|---|---|---|
| **Land rig** | — | trucked in, mast raised on site `[WITTIG]` p.19 | it is on the ground | a lattice mast on a raised steel substructure, in a *yard* of pits, pumps and power |
| **Jackup** | **3–125 m (10–410 ft)** `[DM-OFFS]`; up to **550 ft** for the largest `[ENV-RIG]` | towed (or self-propelled), legs up, hull floating | **jacks its legs to the seabed and lifts its own hull out of the water** `[DM-OFFS]` | a barge-shaped hull standing in the air on three enormous truss legs, cantilever poking out one end |
| **Semi-submersible** | **60–1 300 m (197–4 265 ft)**, generation-dependent `[DM-OFFS]` | towed or self-propelled | **8-, 10- or 12-point mooring, or dynamic positioning** `[DM-OFFS]`; ballasted columns `[ENV-RIG]` | a deck box on **fat vertical columns** standing on **submerged pontoons** — the sea passes *through* the structure |
| **Drillship** | see the caution in C.1.4 | **self-propelled, up to 13 knots** `[DM-OFFS]` | **dynamic positioning** `[ENV-RIG]`; or 8-point / turret mooring `[DM-OFFS]` | a ship with a derrick amidships and a **moonpool** under it |
| **Platform rig** | shallow **<3 m** to ultradeep **>1 500 m** `[DM-OFFS]` | installed once, permanently | **piled into the seabed, gravity-set, or tension-legged** `[DM-OFFS]` | a small, boxed-in derrick on **a structure that is not a vessel** |
| **Tender-assisted** | **20–2 000 m (66–6 562 ft)** `[WP-TENDER]` | tender vessel is towed or sails in | **moored alongside a platform**; the drilling package sits *on the platform*, everything else stays on the tender `[WP-TENDER]` | **two objects**: a small derrick on a platform, and a barge or semi moored beside it carrying the quarters, cranes and helideck |
| **Barge rig** | shallow, **up to ~50 m**; inland / swamp | **must be towed** `[DM-OFFS]` | **8-point cable mooring**, or ballasted down to sit on the bottom (swamp barge) `[DM-OFFS]` | a flat rectangular hull, low freeboard, derrick **on a cantilever** over one end |

### C.1.1 Land rig

**What it is.** The reference case: a mast, a substructure, and a yard.

**Where it lives.** `[WITTIG]` p.19 gives a real, regulated site requirement set
(German practice), already quoted in §B.1 Phase 0: **minimum ~3 000 m², up to
10 000 m² (1 ha)**, plus low-loader access, sealed surfaces for hazardous
substances, a **drill cellar** with rig foundations, sewer connection or sewage
pit, water supply, oil separator, fixed fencing, power, and provision for a
**gas flare**.

**Class range, sourced.** `[WITTIG]` pp.11–12 gives three real points on the
curve — exactly the capability tiers the game needs:

| Class | Pull | Depth capacity |
|---|---|---|
| Truck-mounted (water wells, piles) | — | **~50 m** |
| Research / exploration crawler | **40 t** | **<2 km** |
| Deep well / geothermal | **350 t** | **6 km** |

`[WITTIG]` p.18 also gives the *shape* of the market on two axes — **power input**
against **mobility** — with shallow / cavern / coal-bed-methane work at the
mobile, low-power end and deep geothermal and oil & gas at the immobile,
high-power end. **That axis pair is a better shop layout than a flat price list.**

**What it looks like.** Mast over a **substructure** raised high enough to fit the
BOP stack underneath (see C.2.4 — the substructure height *exists* to make room
for the stack). Around it, in a recognisable arrangement `[WITTIG]` p.26: **mud
tanks and pits** on one side, **shakers** on the mud-return side, **mud pumps**
and the **power plant** behind, the **standpipe** climbing a mast leg, **pipe
racks** on the ground. The rig is small; the *site* is large. Draw the site.

### C.1.2 Jackup

**What it is.** A floating hull with legs. It arrives afloat, lowers its legs to
the seabed, **preloads** them by taking on ballast water to prove the soil, dumps
the preload, and then **jacks its own hull up out of the water**. From that moment
it is not a vessel — it is a fixed structure.

**Water depth.** **3–125 m (10–410 ft)** `[DM-OFFS]`; `[ENV-RIG]` puts the top of
the fleet at **550 ft**. The shallow-water workhorse.

**A real one, in numbers** — all from the local `[IADC-JU]` spec sheet, an actual
filled-in IADC Standard Format Equipment List:

| | |
|---|---|
| Type | Independent-leg **cantilever** jack-up, **triangular** |
| Legs | **3 × 393.82 ft**, **triangular truss**; **349.69 ft** available below the hull |
| Spud cans | **40 ft** diameter, **21.5 ft** high, **1 256.64 ft² footing per can** |
| Hull | **207.33 ft long × 176 ft wide × 20 ft deep**; overall length **271.94 ft** incl. helideck |
| Light ship / displacement | **12 317.59 kips / 14 692.0 kips** |
| Preload reaction | **7 138 kips per leg** at 100 % preload |
| Working water depth | **280 ft** (max design 280 ft, min 30 ft) |
| Drilling depth rating | **20 000 ft** |
| Cantilever envelope | reach aft **0 → 40 ft** (**47 ft with extensions**); transverse **12 ft port / 12 ft starboard** |
| Accommodation | **84** persons |
| Air gap, drilling | **35 ft** below the bottom of the main hull |

**Why the cantilever matters, and why it should be a game object.** A cantilever
jack-up **slides its drill floor out over the side** to reach a wellhead it is not
sitting on. `[ENV-RIG]`: cantilever types *"skid over platforms; slot units fit
around them."* The **0–40 ft** aft reach and **12 ft port / 12 ft starboard**
transverse travel define a **rectangle on the seabed** — the set of wells this rig
can drill without moving. Drawing that rectangle is a free, real and completely
legible mechanic for a multi-well platform contract.

**What it looks like.** Three vast lattice legs stabbing down through a hull that
floats *above* the sea on nothing. **The air gap is the tell** — 35 ft of daylight
between the sea and the hull bottom `[IADC-JU]` §A.6. A jack-up with its hull
touching the water is a jack-up in transit, not a jack-up drilling.

### C.1.3 Semi-submersible

**What it is.** A floating platform whose buoyancy is deliberately placed **below
the wave zone**. `[DM-OFFS]` describes the geometry exactly: *"Large diameter
buoyant columns at the corners"* standing on *"fixed pontoons, which sit
10–20 meters below sea level"*, in a **transparent** configuration that lets waves
pass through the structure rather than lift it.

**That one sentence explains the whole rig type.** Waterplane area is tiny — only
the columns cut the surface — so wave forces and heave are small. It is the rig
you use where a ship would move too much.

**Water depth.** **60–1 300 m (197–4 265 ft)** depending on generation
`[DM-OFFS]`. `[ENV-RIG]` adds drilling-depth ratings of **40 000 ft**, some
**50 000 ft**, for newer units.

**Station-keeping.** *"either by mooring lines anchored to the seafloor or by
dynamic positioning systems"* `[ENV-RIG]`; `[DM-OFFS]` specifies **8-, 10- or
12-point** mooring.

**What it looks like.** A rectangular deck box held up on four to eight **fat
cylindrical columns**, with **horizontal pontoons** joining their feet below the
waterline. From the surface you see columns and deck; the pontoons are a dark
shape under the water. Anchor chains *or* thrusters — **which one is on screen
tells the player which rig class they chartered.**

### C.1.4 Drillship

**What it is.** A ship. It sails to location under its own power at up to
**13 knots** `[DM-OFFS]`, holds position on **dynamic positioning** `[ENV-RIG]`,
and drills through a **moonpool** — *"an opening found in the floor or base of the
hull … giving access to the water below"*, which *"supports the need for drilling
pipes to run vertically through the structure or hull"* `[WP-MOON]`.

**⚠️ Water depth — a conflict the implementer must not paper over.** `[DM-OFFS]`
gives drillships **200–600 m (656–1 969 ft)**. That figure is inconsistent with
modern practice and with Drillity's own field definitions: `PLATFORM_TRUTH.md`
Part B defines **ultra-deepwater as >3 000 m** as a matchable value, and
`[ENV-RIG]` rates modern drillships at **40 000–50 000 ft drilling depth**, the
deepest class in the fleet. **Do not display "200–600 m" as a drillship
water-depth rating.** Mark it **UNVERIFIED** and use Drillity's own four bands
instead (shallow <150 m · midwater 150–1 500 m · deepwater 1 500–3 000 m ·
ultra-deepwater >3 000 m) — those are platform truth and need no external source.

**What it looks like.** A ship hull with a real superstructure forward and a
**derrick standing amidships** over a rectangular hole in the hull. Thruster wash
at the waterline when DP is holding station. Of the seven types this is the one
that reads instantly as *a ship that should not have a derrick on it* — lean into
that.

### C.1.5 Platform rig

**What it is.** A drilling package installed on a **production structure**, not on
a vessel. `[DM-OFFS]`: platforms are *"piled into the sea bed, gravity set on the
bottom or tension-legged"*, carry *"permanently installed drilling equipment"* in
**box frames**, and are characterised by *"low daily costs"* and *"reduced weather
downtime."*

**Water depth.** Shallow **<3 m** to ultradeep **>1 500 m** `[DM-OFFS]` — because
"platform" names the *foundation type*, not a depth class. A fixed steel jacket, a
gravity-base concrete structure and a tension-leg platform are three different
machines under one word.

**What it looks like.** The derrick is **small, enclosed and boxed in**, because
deck space and deck load are both scarce. Around it: flare boom, cranes,
lifeboats, helideck, and **production plant that has nothing to do with drilling**.
This is the only rig type where the drilling package is a *tenant*.

**Why it matters to the game.** Low day rate, low weather downtime, and the rig is
already there — the platform rig is the **late-game, high-margin, low-drama**
contract type. It should feel different to play: cramped, procedural, and about
drilling *many* wells from one point.

### C.1.6 Tender-assisted

**What it is, and why it exists.** A platform is short of deck space and deck
load. So you put **only the drilling package on the platform** and moor a support
vessel alongside carrying everything else. `[WP-TENDER]`: tender-assisted rigs are
*"monohull units that are moored next to a platform, with the rig installed onto
the platform while all the power, storage and other functions remain on the
tender"*, the tender carrying *"storage facilities, living quarters (120 to 200
people), power generation facilities, cranes, and helideck."*

**Two sub-types, and they are a real capability tier** `[WP-TENDER]`:
- **Mono-hull / barge tender** — the cheaper, calmer-water answer.
- **Semi-submersible tender ("semi-tender")** — *"able to operate more profoundly
  in harsher environments."*

**Water depth.** **20–2 000 m (66–6 562 ft)** `[WP-TENDER]` — a startlingly wide
band, because the depth is set by the *platform*, not by the tender.

**What it looks like — the distinguishing feature, and it is unique.**
**It is the only rig type that is two separate floating objects joined by lines.**
A modest derrick on a platform; a vessel moored a short distance off; and between
them a visible bundle of hoses, cables and a transfer route for people and
materials. Draw the gap, and draw what crosses it.

### C.1.7 Barge rig (inland / swamp barge)

**What it is.** `[DM-OFFS]`: *"Barge-shaped floating drilling vessels with the
derrick installed on a cantilever"*; they *"must be towed between locations"* and
hold station on a *"conventional eight-point cable mooring system."* Their *"poor
motion characteristics"* limit them to calm water. The **swamp barge** variant is
*"a large flat bottomed vessel … floated out to site with the drilling rig on
board located on a raised deck"*, and then **drilling is conducted with the barge
ballasted so that its bottom rests on the sea-bed** `[WP-TENDER]`, `[DM-OFFS]`.

**Water depth.** Shallow — **up to ~50 m** afloat `[DM-OFFS]`; the swamp variant
works in marshes, shallow inland bays and water that is *not too deep*.

**What it looks like.** A **rectangle**. Flat, low, no sheer, no bow to speak of,
a raised deck carrying the mast, and the derrick **cantilevered out over one end**
so the hole is outside the hull. Mooring wires to eight points. In swamp use the
hull is *sitting on mud* with brown water at the deck edge — the least glamorous
and most distinctive silhouette in the set.

### C.1.8 What actually distinguishes them — the modeller's cheat sheet

| If you see… | it is a… |
|---|---|
| a hull standing in the air on three lattice legs | **jackup** |
| fat columns on submerged pontoons, sea visible *through* the structure | **semi-submersible** |
| a ship's hull with a derrick amidships | **drillship** |
| a small boxed derrick among production plant, no gangway to shore | **platform rig** |
| **two** floating objects with lines between them | **tender-assisted** |
| a flat rectangle with the derrick hanging off one end | **barge rig** |
| a mast in the middle of a fenced yard of tanks and trucks | **land rig** |

## C.2 The rig itself, part by part

`[WITTIG]` p.24 gives the canonical component list, and it is the right skeleton
for the 3D scene. Verbatim, in the source's own order:

> 1. Mud tank · 2. Shale shakers · 3. Suction line (mud pump) · 4. Mud pump ·
> 5. Motor or power source · 6. Hose · 7. Draw-works · 8. Standpipe · 9. Kelly
> hose · 10. Goose-neck · 11. Traveling block · 12. Drill line · 13. Crown block ·
> 14. Derrick · 15. Racking board (monkey board) · 16. Stand (of drill pipe) ·
> 17. Setback (floor) · 18. Swivel (on newer rigs replaced by a top drive) ·
> 19. Kelly drive · 20. Rotary table · 21. Drill floor · 22. Bell nipple ·
> 23. BOP annular type · 24. BOP pipe ram & blind ram · 25. Drill string ·
> 26. Drill bit · 27. Casing head / wellhead · 28. Flow line — `[WITTIG]` p.24

Those 28 objects group into **four systems plus the structure**, and every one is
a Drillity iMarket node (`DOMAIN.md` §3).

### C.2.1 Hoisting — derrick, crown block, travelling block, drawworks

- **Derrick** — the static tower. On the real jack-up: **160 ft high**, base
  **30 × 30 ft**, crown **8 × 8 ft**, **gross nominal capacity 1 000 kips**,
  **static hook load 1 050 000 lbs**, **maximum 12 lines** `[IADC-JU]` §B.1.1.
  Rated for **93 knots of wind with full setback, 107 knots with no setback** —
  i.e. **a derrick full of pipe is weaker in wind than an empty one.** A lovely,
  true and completely unexpected constraint (see §D.8).
- **Crown block** — the fixed sheave assembly at the top. **500 ton** on the real
  rig `[IADC-JU]` §B.3.1. It never moves; draw it as part of the derrick.
- **Travelling block** — the moving sheave assembly hanging on the drill line,
  carrying the hook, the elevators and (on a modern rig) the top drive.
  **This is the object the player's eye tracks.** Everything else on a rig is
  static; the block goes up and down all day.
- **Drawworks** — the winch that raises and lowers the block. Real numbers
  `[IADC-JU]` §B.2.1: **2 000 hp input**, drum **30 in × 58 in**, **grooved**,
  drill line **1⅜ in**, drum brake plus an **eddy-current auxiliary brake**, and a
  **crown-o-matic** crown safety device.
- **The line-count mechanic — real, sourced, and free.** Maximum line pull on that
  same drawworks `[IADC-JU]` §B.2.1:

  | Lines reeved | Max line pull |
  |---|---|
  | 12 | **1 014 kips** (≈ 4 510 kN) |
  | 10 | **890 kips** (≈ 3 959 kN) |
  | 8 | **738 kips** (≈ 3 283 kN) |

  More lines = more pull, less hook speed. **A mechanical-advantage trade-off the
  player can literally count in the artwork**, and re-reeving costs rig time. It
  is the most under-used honest mechanic on a drilling rig.
- **Racking board / monkey board and the setback** — where stands are fingered
  while tripping. Already quantified in §B.5: the real jack-up racks **20 465 ft
  ≈ 6 240 m** of pipe, ≈ **230 stands** at ~27 m `[IADC-JU]` §B.1.2. For vertical
  scale, its casing stabbing board is adjustable **20–43 ft above the rotary**
  `[IADC-JU]` §B.1.4.
- **Substructure** — the reason the drill floor is high. `[IADC-JU]` §B.1.5:
  drill floor **28 ft above main deck**, **clear height below the rotary table
  beams 21 ft**, setback capacity **450 kips**, simultaneous setback + hook load
  **1 450 kips**, rotary beam capacity **1 000 kips**. **The 21 ft of clear space
  under the rotary is where the BOP stack lives.** Get that right and the rig
  reads as real; get it wrong and there is nowhere to put the stack.

### C.2.2 Rotating — top drive vs rotary table + kelly

The single most important *era* choice in rig modelling. It changes the
animation, the sound and the pace of the game.

**Rotary table + kelly (the older system).** The **rotary table** turns; a **kelly
bushing** sits in it; the **kelly** — a square or hexagonal length of pipe —
passes through the bushing and is turned by it; the kelly hangs from the
**swivel**, which hangs from the **hook** `[WITTIG]` pp.28–31. Mud enters through
the swivel via the **gooseneck** and the **kelly hose**. Real numbers
`[IADC-JU]` §B.4.1: **maximum opening 37½ in**, **rated capacity 650 short tons**,
two-speed gearbox, **900 hp** drive motor.
*Consequence:* the kelly is **one joint long**. You can drill exactly one joint
before you must make a connection.

**Top drive (the modern system).** `[WITTIG]` pp.30, 36: modern rig types use a
**Top Drive System (TDS)**, drilling **without a kelly**. A motor hangs in the
derrick on the travelling block and turns the string directly. Real numbers
`[IADC-JU]` §B.4.4: **electric**, **500 ton** rated capacity, **1 130 hp** output,
**maximum continuous torque 45 500 ft-lbs (≈61.7 kNm)**, **maximum 250 rpm**,
two-speed gearbox, remote-operated kelly cock, working pressure **5 000 psi
(345 bar)**, connection **6⅝ in REG box**. Make-up and break-out torque
**85 000 ft-lbs** each way.

**The consequence — and it is the whole gameplay difference** `[WITTIG]` p.36: a
top drive *"allows for lowering and hoisting 'triples' (3 joint drill pipes) →
decreased trip time."*

| | Rotary table + kelly | Top drive |
|---|---|---|
| Drill ahead before a connection | **one joint**, R2 = **8.23–9.14 m** `[WITTIG]` p.43 | **one stand**, a triple ≈ **27 m** |
| Connections per 1 000 m | ≈ **115** | ≈ **37** |
| Rotate while tripping? | no | yes |
| Directional work | kelly only | top drive required for practical slide/rotate control |

**Three times fewer connections is three times fewer chances to get
differentially stuck (§D.3) and three times fewer connection-gas events (§D.1).**
A real, sourced, purchasable upgrade with a genuine risk consequence — exactly
what the iMarket shop should sell.

### C.2.3 Circulating — pumps, standpipe, returns, solids control

- **Mud pumps.** Real numbers `[IADC-JU]` §F.1.1: **3 × triplex**, liner sizes
  **5, 5½, 6, 6½, 7 in**, **two drive motors per pump at 800 hp each**, **maximum
  working pressure 5 000 psi (345 bar)**, test **7 500 psi**; system working
  pressure **5 000 psi**; supercharging pumps at **75 hp**.
  **Liner size is the flow-versus-pressure trade, and it is a physical part you
  change** — bigger liner, more flow, lower pressure. A real consumable decision
  and a perfect iMarket "Mud Pumps" item.
- **The path, in order** `[WITTIG]` p.24: mud tank → suction line → **mud pump**
  → **standpipe** (up a derrick leg) → **kelly hose** → **gooseneck** →
  swivel / top drive → down the drill string → out the bit → up the annulus →
  **bell nipple** → **flow line** → **shale shakers** → back to the tanks.
- **Solids control** is fully specified in §B.3 from `[IADC-JU]` §F.2:
  **4 linear-motion shale shakers**, desilter (**17 cones × 4 in**), desander, mud
  cleaner, **mud/gas separator ("poor boy")**, vacuum degasser, **5 agitators**.
- **Draw the standpipe.** It is the one vertical line on the derrick that is not
  structural, and **the standpipe pressure gauge is the instrument on which
  almost every hazard in §D announces itself.**

### C.2.4 Well control — the BOP stack, and the diverter before it

**The stack is not one object.** From the real jack-up `[IADC-JU]` §§E.1–E.3 there
are **two** stacks and a diverter, and they belong to **three different phases of
the well** (§B.1):

| Phase | Device | Size / rating | What it can do |
|---|---|---|---|
| Conductor & surface hole | **Diverter** | required by `[CFR-430]` *before* drilling conductor or surface hole | **cannot shut the well in** — it routes flow *away from facilities and personnel* |
| After surface casing | **Low-pressure stack** | **21¼ in / 2 000 psi** — annular (Hydril type) + a **double ram** with **5 in fixed pipe** and a **blind-shear ram** | can shut in at low pressure; lands on the 20 in string |
| Intermediate and deeper | **High-pressure stack** | **13⅝ in / 10 000 psi** | the real stack |

The high-pressure stack's ram arrangement, verbatim `[IADC-JU]` §E.3.3, is the one
to model:

- **Upper:** **2⅞–5 in VBR** — a *variable bore ram*, which seals a **range** of
  pipe sizes
- **Upper middle:** **blind ram**
- **Lower:** **fixed pipe rams (3½ / 5 / 7 / 9⅝ in)**
- plus a **13⅝ in / 5 000 psi annular** on top
- **4 × 4 1/16 in / 10 000 psi side outlets**, choke and kill valves 1 hydraulic +
  1 manual each
- **all appropriate components H2S rated** (§D.6)

**Why the ram list is a game object.** Each ram seals only on what it was cut for.
A **VBR** covers a range; a **fixed pipe ram** covers one size; a **blind ram**
seals an *empty* hole; a **blind-shear ram** cuts the pipe and then seals. So the
answer to *"can I shut this well in right now?"* depends on **what is across the
rams at this instant** — drill pipe, a tool joint, a collar, casing, or nothing.
That is a real, sourced and genuinely tense mechanic, and it is the correct reason
a driller **spaces out** before shutting in (§D.1).

### C.2.5 Offshore-only parts

- **Moonpool** — *"an opening found in the floor or base of the hull … giving
  access to the water below"*, existing because *"drilling pipes [must] run
  vertically through the structure or hull"* `[WP-MOON]`. **Drillships and
  semi-submersibles have one; a jack-up does not** — a jack-up drills through a
  **slot** in the hull or off a **cantilever** (C.1.2), which is exactly why it can
  reach a wellhead it is not sitting on and a drillship cannot.
- **Marine riser and subsea BOP.** On a floater the stack sits **on the seabed**
  and a riser connects it up to the moonpool; `[CFR-734]` governs subsea BOP
  requirements. On a jack-up or platform the stack is **on the rig**, under the
  substructure. **This is the biggest single difference between bottom-founded and
  floating units in the cross-section drawing — and it is why a floater drills its
  top hole *riserless*, discharging returns at the seabed (§D.7).**
- **Pipe deck.** Flat deck stowage for tubulars, casing and collars, worked by
  deck cranes and roustabouts (§A.3.1). On the real jack-up the deck side is its
  own reporting line: *roustabouts report to the crane operator, who reports to the
  toolpusher* `[DM-CREW]`. **Draw the pipe deck as a working surface, not a
  texture** — it is where a third of the crew is.

### C.2.6 The numbers to build the model against, in one block

Every figure below is from the local `[IADC-JU]` spec sheet — **one real rig**, so
they are mutually consistent, which is what a modeller actually needs.

```
DERRICK           160 ft high · base 30 x 30 ft · crown 8 x 8 ft
                  1 000 kips gross nominal · 1 050 000 lb static hook load
                  max 12 lines · wind 93 kn full setback / 107 kn empty
CROWN BLOCK       500 ton
DRAWWORKS         2 000 hp · drum 30 x 58 in grooved · 1 3/8 in drill line
                  line pull 1 014 / 890 / 738 kips at 12 / 10 / 8 lines
TOP DRIVE         electric · 500 ton · 1 130 hp · 45 500 ft-lb (61.7 kNm)
                  250 rpm max · 5 000 psi · 6 5/8 in REG box
ROTARY TABLE      37 1/2 in opening · 650 short tons · 900 hp
SUBSTRUCTURE      drill floor 28 ft above main deck · 21 ft clear below rotary
                  setback 450 kips · setback + hook 1 450 kips
RACKING           20 465 ft of pipe racked = approx. 230 stands at ~27 m
MUD PUMPS         3 x triplex · liners 5 - 7 in · 2 x 800 hp per pump
                  5 000 psi working / 7 500 psi test
SOLIDS CONTROL    4 linear shakers · desilter 17 x 4 in cones · desander
                  mud cleaner · poor-boy separator · vacuum degasser · 5 agitators
BOP               LP 21 1/4 in / 2 000 psi    HP 13 5/8 in / 10 000 psi
                  annular 13 5/8 in / 5 000 psi
                  rams: 2 7/8-5 in VBR · blind · fixed 3 1/2 / 5 / 7 / 9 5/8 in
                  4 x 4 1/16 in 10 000 psi outlets · all H2S rated
HULL              207 x 176 x 20 ft · 3 legs x 394 ft · spud cans 40 ft dia
                  280 ft working water depth · 20 000 ft drilling depth
                  84 persons accommodation · 35 ft air gap when drilling
```

## C.3 What to model, and what to leave out

- **Model the block moving.** If one thing on the rig is animated, it is the
  travelling block. Everything else can idle.
- **Model the shaker house.** §B.3 established it: mud sheeting over vibrating
  screens, cuttings walking off the end. It is the most watchable object on the
  rig and it is a **well-control instrument** (§D.1).
- **Model the flare — but only during a test.** `[IADC-JU]` Section I carries
  **production test equipment: burners, burner booms, sprinkler system**. That is
  where the flame in the concept art legitimately comes from — during a **well
  test** (§B.1 Phase 5), not continuously.
- **Do not model** individual valves, catwalks, or the hundreds of small items on
  the IADC list. They add nothing and they cost frame time (`GAMEDESIGN.md` §1:
  60 fps on a mid iPhone).
- **Never letter a real manufacturer's name onto a model.** `DOMAIN.md` §6 and §10
  are explicit. The numbers above are a *class*; the badges are trademarks.

---

# D. HAZARDS AND THE CORRECT RESPONSE

## D.0 Two rules that govern this whole section

**Rule 1 — the well-control vocabulary is not negotiable.** `PLATFORM_TRUTH.md`
Part C rule 2 demands precision, and nowhere is the cost of a wrong word higher
than here. Three distinctions must never blur:

| Not | but | because |
|---|---|---|
| "a blowout" | **a kick** | a *kick* is an influx of formation fluid into the wellbore. A *blowout* is an **uncontrolled** flow to surface. **A kick that is handled is not a blowout.** Almost every kick is not a blowout. |
| "close the well" | **shut in** | shutting in is a defined procedure with a defined order `[DM-SHUT]` |
| "primary blowout preventer" | **primary well control is the mud column** | the BOP is *secondary* well control. Calling the BOP "primary" inverts the entire discipline. |

**Rule 2 — every hazard has a *first* symptom, and it is rarely the obvious one.**
The design value of this section is not the list of hazards. It is the column
headed **"what the crew sees first"**, because that is what the HUD has to show
and that is the skill the player is actually learning. `GAMEDESIGN.md` §7 already
names this idea — *"the instrument can lie"* — and oil & gas has the richest
version of it in the whole game.

## D.1 Kick / influx — formation fluid entering the wellbore

**What it is.** The mud column's hydrostatic pressure has fallen below formation
pore pressure, so the formation feeds into the well (§B.2). It is the failure of
**primary** well control.

**What the crew sees — and the order matters.** `[DM-KICK]` splits this into
**warning signs** (the well is *about to* kick) and **positive indicators** (the
well *is* flowing). That split is the mechanic.

**Warning signs, in `[DM-KICK]`'s own order:**

1. **Drilling break** — *"Increase in drilling penetration rate."* The bit
   suddenly goes faster.
2. **Increased torque and drag** — *"often noted when drilling into overpressured
   shale formations."*
3. **Decreased shale density** — cuttings density falls approaching an abnormal
   pressure zone.
4. **Increased cutting size and shape** — *"Particles are often larger and may be
   sharp and angular in the transition zone."* **This is why §B.3 says to draw the
   cuttings on the shakers large enough to read.**
5. **Mud property changes** — *"Water-cut mud, or a chloride … increase circulated
   from the bottom, indicates that formation fluid has entered."*
6. **Connection gas** — *"a distinct increase above background gas as bottoms-up
   occurs after a connection."*
7. **Trip gas** — *"any gas that enters the mud while tripping the pipe with the
   hole appearing static."*
8. **Drilled gas** — gas from a porous formation even with adequate overbalance.
9. **Temperature change** — *"The temperature will normally take a sharp increase
   in transition zones."*
10. **Decreasing d-exponent** — *"decreases to lower-than-expected values"* in
    transition zones.

**Positive indicators — the well is flowing** `[DM-KICK]`:

1. **Pit gain** — *"Gain in pit level detected by pit level measuring
   instruments."*
2. **Increased flow rate** — *"The mud return flow rate exceeds the mud flow rate
   into the well."*
3. **Well flows with the pumps off.**
4. **Improper hole fill-up** — the hole takes less mud than the steel you pulled
   out of it.

`[DM-KICK]` also notes gas-cut mud appears **"fluffy"** at surface — quoted
already in §B.3 for the artwork.

**The correct response.** **Shut the well in.** `[DM-SHUT]` gives the procedure on
a fixed rig; the two recognised variants are the **hard shut-in** (choke closed
before the annular/rams) and the **soft shut-in** (choke open, then closed). Then
read **SIDPP** (shut-in drill pipe pressure) and **SICP** (shut-in casing
pressure) and the **pit gain**, and from those compute the kill mud weight.

**Then circulate the influx out.** The two standard methods, `[DC-WC]`:

| | **Driller's Method** | **Wait and Weight** |
|---|---|---|
| Circulations | **two** — first circulate the kick out with the original mud, then circulate in kill mud | **one** — weight up first, then circulate kick out and kill mud in together |
| Starts | immediately | after the mud is weighted |
| Peak casing pressure | higher | lower |
| Best when | you need to start now; simple to execute | the shoe is weak and you must protect it |

**Do not invent a third method and do not blur these two.** They are the two
methods every well-control ticket in the world examines on — **IWCF** `[IWCF]` and
**IADC WellSharp** `[IADC-WS]`, both of which are already Talent certifications
(`PLATFORM_TRUTH.md` Part B).

**The gameplay shape.** A kick is not a fail state; it is a **procedure under time
pressure**. And the deepest thing about it: **the earlier indicator you act on,
the cheaper it is.** A player who reacts to *cuttings getting angular* has time.
A player who reacts to *pit gain* is already shutting in. A player who reacts to
*flow with pumps off* has already lost the primary barrier. **That ladder is the
skill curve.**

## D.2 Lost circulation — mud leaving the wellbore

**What it is.** The mirror image of a kick, and the other wall of the mud-weight
window (§B.2). The mud column exceeds the formation's strength, or meets a void,
and the mud goes into the rock instead of back to surface.

**Where it happens** `[DM-LC]` — four loss-zone types:

1. **Permeable zones** — unconsolidated sands and gravels
2. **Naturally fractured formations**
3. **Cavernous / vugular formations** — limestone, dolomite, salt
4. **Induced fractures** — you broke the rock yourself, with mud weight or ECD

**What the crew sees first, by severity** `[DM-LC]`:

| Severity | What it looks like | The response `[DM-LC]` |
|---|---|---|
| **Seepage** | *"occurs slowly"*; hard to tell from normal filtrate loss | treat the mud; *"Controlling and preventing seepage losses can be done with the appropriate treatment"* |
| **Partial** | returns reduced; more severe than seepage | *"usually require 'lost-circulation material' additions to cure"* — LCM |
| **Severe** | *"Large volumes of drilling mud may be lost in short periods"* | *"Keep the hole full as you can with water or base oil to the equilibrium point"* |
| **Complete / total** | **"No returns at all. The fluid level may drop out of sight"** | *"Refilling the annulus with monitored volumes of lighter mud and/or water or base oil is necessary"* |

> ⚠️ **`[DM-LC]` gives no numeric bbl/hr thresholds for those four bands.** Do not
> put "partial loss = 10 bbl/hr" or similar on screen. The bands are qualitative in
> the source; keep them qualitative in the game, or cite an operator manual first.
> Marked **UNVERIFIED**.

**Why total loss is the frightening one, and it is not the money.** If the fluid
level drops out of sight, **the hydrostatic column has shortened**, so the pressure
at the bottom of the hole has fallen — and that can bring on a **kick from a
different zone at the same instant.** Losses and a kick together is the classic
**underground blowout** setup, and it is the reason `[CFR-421]` requires
intermediate casing to isolate *"lost circulation zones"* alongside pressured ones
(§B.1 Phase 3).

**The gameplay shape.** This is where the game earns its "flushing is not free"
lesson. `GAMEDESIGN.md` §3 gives Flushing as an unambiguously good slider in every
other industry. **In oil & gas, more flow raises ECD (§B.3), and raising ECD past
the fracture gradient is how you cause the loss.** Losing returns should be
*something the player did*, not weather.

## D.3 Differential sticking

**What it is** `[SLB-DS]`: *"A condition whereby the drillstring cannot be moved
(rotated or reciprocated) along the axis of the wellbore."* It develops when
*"high-contact forces caused by low reservoir pressures, high wellbore pressures,
or both, are exerted over a sufficiently large area of the drillstring."* The pipe
is pressed into the filter cake on a permeable zone and held there by the pressure
difference across it.

**The arithmetic that makes it counter-intuitive** `[SLB-DS]`: sticking force =
**differential pressure × contact area**. So *"modest pressure differences across
large pipe sections can be as problematic as extreme pressure over small zones."*
**A long, quiet, slightly-overbalanced sand is more dangerous than a short, wildly
overbalanced one.**

**What the crew sees first — and this is the diagnostic that matters** `[MERLIN]`:

> *"The drillstring cannot be moved up or down, or rotated, and **circulation is
> not affected in any way**."*
> …
> *"Differential sticking is the only mechanism that occurs after a stationary
> period and results in no circulating pressure increase."*

So the read is: **the pipe is dead, the pumps are perfectly normal, and it
happened while you were not moving.** `[MERLIN]` adds the timing: it *"occurs
after a connection or survey with full unrestricted circulation across a permeable
formation."*

**That is the cleanest hazard signature in the entire game.** One gauge (pump
pressure) says everything is fine; another (hookload / torque) says the well has
eaten your string. `GAMEDESIGN.md` §7's *"the instrument can lie"* principle,
handed over ready-made.

**The correct response** `[SLB-DS]`, in escalating order:

1. **Lower the hydrostatic pressure in the wellbore** — reduce the differential
   that is holding the pipe.
2. **Spot a fluid** — *"placing a spotting fluid next to the stuck zone"*; the most
   widely used approach is *"a spot of oil, oil-base mud, or special spotting
   fluid"* adjacent to the stuck section.
3. **Jar** — *"applying shock force just above the stuck point by mechanical
   jarring."*

**Prevention is the real answer, and the game already has the tools for it.**
§B.5 lists, from `[WITTIG]`: **spiral drill collars** *"flush better and reduce
differential sticking"*, and **stabilizers** *"prevent differential sticking"* —
both by reducing the contact area, which is the term you can actually control in
force = ΔP × area. **Two real, sourced, purchasable iMarket items that reduce a
specific hazard probability.** That is a perfect loadout decision.

**Scale of the problem, in the source's own words** `[SLB-DS]`: it is *"the
greatest drilling problem worldwide in terms of time and financial cost."*

## D.4 Mechanical sticking and pack-off — the contrast case

You cannot teach D.3 without D.4, because **the response is opposite** and the
only way to tell them apart is the pump pressure.

**Pack-off / bridge** `[MERLIN]`: detected at surface by *"an erratic and an
increase in drag and torque, increase in pressure, gradual decrease in ROP while
drilling."* The annulus is blocking with cuttings or caving rock.

| | **Differential sticking (D.3)** | **Pack-off / mechanical (D.4)** |
|---|---|---|
| When it happens | while **stationary** — after a connection or survey | while **moving or drilling** |
| Pump pressure | **unchanged** | **rises**, often erratically |
| Torque and drag | normal until you try to move | **erratic and rising** beforehand |
| Rotation | impossible | may still be possible, roughly |
| Right response | lower hydrostatic, spot fluid, jar | **do not increase pump rate into a pack-off**; work the string, circulate carefully to clear |

**The game consequence.** Two hazards, identical primary alarm ("the string is
stuck"), opposite correct actions, and **one gauge separates them.** That is a
genuine skill test and it is entirely sourced.

## D.5 Twist-off and washout — the string failing

**What it is.** A **washout** is a hole eroding through the pipe wall; a
**twist-off** is the string parting. `[DM-TO]`: twist-off occurs when *"the
torque-induced shearing stress exceeds the pipe's ultimate shear stress"*,
particularly in deviated wells *"where torque surpasses 80 kIb f-ft"* (≈108 kNm).

**Why it starts at the connections.** `[WITTIG]` p.47, already quoted in §B.5, is
the number to build the model on: **"86 % of total drill string failures are tool
joint failures."** Not the pipe body — **the joints.** So the game's wear model
should age *connections*, not tube length.

**What the crew sees first** `[DM-TO]` — the full symptom set, verbatim:

> *"Loss of drillstring weight. Lack of penetration. Reduced pump pressure.
> Increased pump speed. Reduced drilling torque. Increased rotary speed."*

Read that as two pairs:
- **Hydraulic pair** — pressure **down**, pump speed **up**. Mud is escaping
  through a hole above the bit instead of going all the way round.
- **Mechanical pair** — weight **down**, torque **down**, RPM **up**, ROP **gone**.
  There is nothing on the end of the string any more.

**The MWD trick, and it is delightful** `[DM-TO]`: *"If an MWD tool is in the drill
string, check to see if it is still pulsing OK (lack of a pulse could indicate a
pipe washout has occurred above the tool)."* Already quoted in §B.4 — **a silent
telemetry channel is a diagnostic.**

**Causes** `[DM-TO]`: metal fatigue, erosion from an existing washout, improper
make-up, rough handling, stress reversals in deviated holes, and pre-existing weak
spots. **The leading predictors are torque, stalling and stick-slip** `[DM-TO]`.

**The correct response.** A washout caught early is a trip and a joint. A
twist-off is a **fishing job** — and `DOMAIN.md` §3 already has the taxonomy for
it, with the fishing-tool supervisor listed among the third-party service hands in
§A.0. **Fishing should be a distinct, expensive, sometimes-unsuccessful mini-game,
and losing the fish means sidetracking around it.**

**Prevention, and it is a sourced loadout choice** `[DM-TO]`: anti-stick-slip
tools that measure downhole vibration, and harmonic isolation tools. Note the
claim in that source of *"up to 20% ROP improvement"* is a vendor claim about
harmonic isolation, **not** a general fact — mark **UNVERIFIED** if displayed.

## D.6 H2S — hydrogen sulphide

**What it is.** A naturally occurring, extremely toxic gas that can come up with
formation fluid. Unlike every other hazard here, **this one kills people rather
than wells.**

**The regulatory frame.** `[CFR-490]` is the US federal rule for H2S in offshore
operations. On the equipment side, the real jack-up's BOP entries state **"All
appropriate components H2S rated: Yes"** for both the low-pressure and
high-pressure stacks `[IADC-JU]` §§E.2, E.3 — **H2S service is a hardware
specification, not a procedure.** That is a purchasable rig attribute and it
should gate contracts.

**What the crew sees — and the crucial fact.** `[IADC-H2S]` and `[DC-H2S]` are the
industry safety references. **The one thing the game must get right: you cannot
rely on smell.** H2S has a characteristic odour at low concentration and then
**deadens the sense of smell** at higher concentration, so "I can't smell it any
more" is the opposite of safe. **Detection is by instrument, not by nose.**

**The correct response.** Alarm → **don breathing apparatus** → **muster upwind at
the designated point** → the well is handled by trained personnel in SCBA. Wind
direction is a first-class piece of information — this is why offshore
installations carry **windsocks**, and why the diverter rule `[CFR-430]` talks
about routing flow *away from facilities and personnel* (§D.7).

**The certification hook, and it is already in the platform.** `DOMAIN.md` §7 and
`PLATFORM_TRUTH.md` Part B list the expiry-tracked offshore certifications —
**BOSIET, FOET, HUET, OPITO, OGUK Medical** — and the rule that **expired = cannot
mobilise.** An H2S-rated contract should require a live ticket. That is the single
best mechanic in the whole platform, per `PLATFORM_TRUTH.md` itself, and H2S is
its most legitimate application.

**What it looks like on screen.** Amber-to-red gas alarm beacons, a windsock
snapping to a new direction, the crew moving *across* the wind rather than away
from the well. **Never draw a green cloud.** H2S is invisible.

## D.7 Shallow gas — the hazard you are not allowed to shut in

**What it is.** A shallow accumulation of gas encountered in the top hole, before
there is a casing string strong enough to hold pressure.

**Why it is categorically different, and this is the whole point.** `[SPE-SG]`
states it plainly: *"It may be impossible to close the blowout preventer on a
shallow gas kick without breaking down the formation at the casing setting depth
(shoe)."* Shut in a shallow well and you fracture the weak rock at the shoe,
and the gas **broaches to surface outside the casing** — around the rig, not up
the hole. So the correct action is the opposite of §D.1: **you do not shut in.
You divert.**

**The rule, verbatim, and it is already quoted in §B.1** `[CFR-430]`:

> *"You must install a diverter system before you drill a conductor or surface
> hole"*, comprising a diverter sealing element, diverter lines and control
> systems, designed *"to ensure proper diversion of gases, water, drilling fluid,
> and other materials **away from facilities and personnel**."*

**What the crew sees first.** Riserless, on a floater, it is startlingly visual —
`[DM-SG]`: *"The gas should be circulated if significant gas readings are obtained
from the mud returns or **gas bubbles are observed at the seabed** when riserless
drilling is employed."* On a bottom-founded rig with returns to surface it is a
sudden drilling break, gas at the flow line, and rising flow.

**The mitigations, all sourced, all real design choices:**

- **Drill a pilot hole.** `[SPE-SG]`: *"a dynamic kill attempt with existing rig
  equipment may only be successful if a small pilot hole (9 7/8" or smaller) is
  drilled and immediate pumping at maximum rate is applied in the early stage of a
  kick."* `[DM-SG]`: *"Small pilot holes will enhance the dynamic well-killing
  capability the most and improve log quality."* **A small hole makes a small
  kick, and a small kick can be pumped on top of.**
- **Kill it dynamically.** `[DM-SG]`: *"The first option should be to pump all
  available kill mud as soon as possible to kill the well dynamically."*
- **Avoid the situation.** `[DM-SG]`: *"Many experts recommended avoiding diverter
  drilling through known hydrocarbon-bearing formations if there is a probability
  that the well is capable of flowing"*, and diverter drilling through an
  increasing pore-pressure regime *"should be avoided if losses are to be expected
  below the conductor shoe."*

**The gameplay shape, and it is excellent.** For the first section of every well
the player has **a different control set and a different fail condition**. The
"shut in" button is greyed out. The tools are: **hole size** (pilot vs full),
**pump rate**, and **wind/current direction for the diverter overboard line**.
§B.1 Phase 2 already flags the BOP going on as *"the most important state
transition in a well"* and asks for a different HUD, a different hazard set and a
different soundtrack. **§D.7 is what makes that transition mean something: before
it, you cannot shut in.**

## D.8 Weather standby — waiting on weather

**What it is.** Not a downhole hazard at all — an *operational state*. `[GAD-NPT]`
defines **non-productive time (NPT)** as *"any time during drilling operations
when the well is not advancing due to equipment failures, stuck pipe, waiting on
weather, or other unplanned events."* In the trade it is **WOW**.

**How big it is.** `[DC-NPT]` and the NPT literature give the shape:
- **NPT is typically 20–30 % of total drilling time** in conventional operations.
- For **floating rigs in the North Sea**, NPT from downhole issues plus waiting on
  weather runs **15–35 %**.
- **WOW alone averages as much as 10 %** of total rig deployment time in the North
  Sea.

> Those three figures come from the NPT literature surfaced via `[DC-NPT]` and
> `[GAD-NPT]`. Treat the exact percentages as **indicative, not authoritative** —
> they are region- and fleet-specific. The *fact* that WOW is a first-class,
> double-digit-percentage cost is solid; the specific number should not be shown
> as a universal constant.

**What the crew sees first, and it is not the weather.** It is the **limit table**
being approached. From the real jack-up's environmental limits `[IADC-JU]` §A.6,
in the **drilling** condition:

| Limit | Value |
|---|---|
| Air gap below bottom of main hull | **35 ft** |
| Max. wave height | **26 ft** |
| Max. wave period | **8 s** |
| Max. wind velocity | **60 knots** |
| Max. current velocity | **2 knots** |

and in the **transit** condition, where the rig is far more fragile: **max wave
height 5 ft**, wave period **10 s**, wind **70 knots field transit / 100 knots
ocean transit**, current **2.3 knots**, pitch **7° single amplitude** and roll
**6° single amplitude** (ocean).

> ⚠️ The IADC form's label and value columns interleave in the extracted text.
> These readings are the internally consistent interpretation, but **verify against
> the original PDF page before any of them reaches a player.** Marked
> **PARTIALLY VERIFIED**.

**The derrick constraint from C.2.1 belongs here too**, and it is the best weather
mechanic available: the derrick is rated **93 knots with full setback** but
**107 knots with no setback** `[IADC-JU]` §B.1.1. **A derrick full of racked pipe
is 13 % weaker in wind.** So when weather is coming, one of the choices is *lay
the pipe down* — which costs hours you may not have, and which you will regret if
the storm misses.

**The correct response.** Secure the hole first: pull back to a safe depth, or set
the string in the hole with the BOP closed if the forecast is bad enough; secure
the deck; stop tripping. **Every hour of standby is billed at the full day rate.**
That is the honest cost, and §B.5's cost model already gives the arithmetic:
`[WITTIG]` p.120's `t_s` term — *"additional / non-productive time"* — is exactly
this, and at `[WITTIG]` p.121's worked rates (rig **USD 3 500/h** plus auxiliary
**USD 900/h**, ≈ **€3 790/hour** converted at `[ECB]`) a 12-hour storm is
**≈ €45 000 of nothing.**

## D.9 The hazard table — the implementer's single reference

| Hazard | What the crew sees FIRST | Confirming sign | Correct action | Wrong action that feels right |
|---|---|---|---|---|
| **Kick** (§D.1) | drilling break; cuttings turn **large, sharp and angular**; torque and drag up | **pit gain**, return flow > input flow, flow with pumps off | **shut in**, read SIDPP/SICP/pit gain, then Driller's or Wait-and-Weight `[DC-WC]` | speeding up to "get through it" — the drilling break *is* the warning |
| **Lost circulation** (§D.2) | returns reduced at the flow line; pit level falling | **no returns at all; fluid level out of sight** `[DM-LC]` | LCM for partial; keep the hole full with water/base oil for severe; refill with monitored volumes for total | raising pump rate to "get returns back" — higher ECD widens the fracture |
| **Differential sticking** (§D.3) | string will not move **and pump pressure is completely normal**; happened while stationary `[MERLIN]` | it began after a connection or survey, across a permeable zone | reduce hydrostatic, spot fluid, jar `[SLB-DS]` | pulling harder — force = ΔP × area, and pulling does not change either term |
| **Pack-off / mechanical** (§D.4) | **erratic, rising torque and drag, and rising pump pressure**; ROP fading `[MERLIN]` | it began while moving or drilling | work the string, circulate carefully to clear | pumping harder into the pack-off |
| **Twist-off / washout** (§D.5) | **pump pressure down, pump speed up** | weight down, torque down, RPM up, ROP zero; **MWD stops pulsing** `[DM-TO]` | pull out and inspect; if parted, fish — then sidetrack | adding weight to "get it drilling again" |
| **H2S** (§D.6) | **the gas detector** | — (do not wait for a second sign) | breathing apparatus, muster **upwind**, trained response `[IADC-H2S]` | trusting your nose — H2S deadens the sense of smell |
| **Shallow gas** (§D.7) | drilling break in the top hole; gas at the flow line; **bubbles at the seabed** if riserless `[DM-SG]` | rising flow with no casing set below the conductor | **divert** `[CFR-430]`; pump kill mud dynamically at maximum rate `[DM-SG]` | **shutting in** — it breaks down the shoe and broaches around the casing `[SPE-SG]` |
| **Weather standby** (§D.8) | the **limit table** approaching, not the sea | forecast crosses a stated operating limit `[IADC-JU]` §A.6 | secure the hole, secure the deck, stop tripping; consider laying pipe down | racking more pipe — a full derrick is rated 13 % lower in wind `[IADC-JU]` §B.1.1 |

---

# E. MECHANICS PROPOSAL

## E.1 The three controls, mapped

`GAMEDESIGN.md` §7 restates the three sliders semantically as **ADVANCE / WORK /
PROTECT**, so that one HUD serves every method. Oil & gas fits, but with a twist
that no other industry in this game has.

| | **ADVANCE** | **WORK** | **PROTECT** |
|---|---|---|---|
| Label on screen | **WOB** | **RPM** (+ flow, for a motor) | **MUD WEIGHT / ECD** |
| Unit | kN (or tonnes) | rpm | kg/m³, and bar of ECD |
| Sourced calibration | tricone rule of thumb **≈2 t per inch of bit diameter** — a 12¼ in bit ⇒ ~24.5 t ≈ **240 kN** `[WITTIG]` p.66 | PDC: *"high RPM (60–80) and LOW WOB"* `[WITTIG]` p.115 | mud weight must stay **above pore pressure and below fracture pressure** (§B.2) |
| Failure at low end | no penetration | no penetration; bit polishes | **kick** (§D.1) |
| Failure at high end | bit and bearing wear; buckling below the neutral point | heat, vibration, **stick-slip → twist-off** (§D.5) | **lost circulation** (§D.2) |

**Here is the twist, and it is the reason oil & gas is worth building at all.**

> In every other industry in this game, **PROTECT is monotonic — more is safer.**
> More flushing clears the hole, cools the bit, and reduces jamming
> (`GAMEDESIGN.md` §3). In oil & gas, **PROTECT is a two-sided window**: too
> little and the formation comes in, too much and the formation breaks. **It is
> the only method in the game where the safety control can kill you at both ends.**

§B.3 already states this in the file's own words: *"In oil & gas, more flush can
break the formation and lose the well. That is the single best differentiator the
industry offers."* §E is where that becomes a control law.

**Two secondary controls that the HUD should expose contextually, not always:**

- **TOOLFACE** (directional sections only) — the clock face from §B.4. High side =
  build, low side = drop, left/right = turn `[SLB-TF]`. Reuse the HDD locator UI
  that `DESIGN_EXPANSION.md` §1 already specifies.
- **SLIDE / ROTATE** (directional sections only) — a mode toggle, not a slider.
  Sliding steers but is *"almost always slower and therefore more expensive"*
  `[WP-DD]`, cleans the hole badly, and is when the string sticks. Rotating is
  fast, clean, and goes straight.

## E.2 What the player is judged on — and it is not metres

**Metres is the wrong score and the industry has already written the right one.**
§B.5 quotes `[WITTIG]` p.120's cost-per-foot equation, which is what real drilling
engineers actually optimise:

> **CPF = ( C_b + C_f × ( t_b + t_t + t_s ) ) / D**
>
> C_b = bit cost · C_f = rig + auxiliary cost per hour · t_b = on-bottom drilling
> time · t_t = tripping time · t_s = additional / non-productive time ·
> D = interval drilled

**Restate it in the game's units and it becomes the scoring function this pack was
asked for:**

> **SCORE = € per metre of *completed, cased, in-gauge* hole.**

Everything the player can do maps onto exactly one term:

| Term | What the player does about it | Section |
|---|---|---|
| **C_b** — bit cost | buy a PDC (**5–15× a tricone** `[WITTIG]` p.115) or push a dull tricone | §B.5, E.3 |
| **t_b** — on-bottom time | ADVANCE / WORK / PROTECT in the sweet spot | E.1 |
| **t_t** — tripping time | **≈3.3 h per 1 000 m plus 1–2 h** `[SLB-RT]`; top drive vs kelly changes the connection count threefold (§C.2.2) | §B.5, C.2.2 |
| **t_s** — non-productive time | every hazard in §D, plus weather standby (§D.8) | §D |
| **D** — interval drilled | the only term the player instinctively watches, and it is the **denominator** | — |

`[WITTIG]` pp.121–122 works the real example already quoted in §B.5: bit lost in
hole **USD 32 000**; 50 h drilling; 5 h trip in; 4.5 h trip out; rig rental
**USD 3 500/h**; auxiliary **USD 900/h**; 5 000 ft drilled → **USD 59/ft**. In
game units at `[ECB]`: **≈€3 790/hour all-in**, result **≈€167 per metre**.

**Why this is the right score, in one line each:**

1. **It punishes the thing that feels good.** Drilling fast with a dull bit adds
   to D *and* to t_b and eventually to C_b when you have to trip anyway.
2. **It makes tripping legible.** A round trip on a 3 000 m well is **11–12 hours**
   `[SLB-RT]` — at €3 790/h that is **≈€45 000**, visible on screen as a bar that
   fills while nothing else happens. **A player will learn to hate an unnecessary
   trip, which is exactly the professional instinct.**
3. **It makes weather and hazards cost the same as mistakes.** They all land in
   `t_s`. A driller does not distinguish "my fault" from "bad luck" on the daily
   cost report, and neither should the game.
4. **It gives the grade a meaning.** `GAMEDESIGN.md` §2 grades D→S on speed,
   straightness, tool care and safety. In oil & gas those four are **not four
   scores** — they are four inputs to one number, and the game can say so.

**The four grade inputs, expressed against CPF:**

| `GAMEDESIGN.md` grade axis | Oil & gas measurement | Source |
|---|---|---|
| Speed | ROP contribution to `t_b` | §B.5 |
| Straightness | **DLS held inside the planned band**, and casing wear above 5 °/30 m | §B.6.2 |
| Tool care | dull grade at pull — the **8-step T-scale**, T3 = 3/8 of the cutting structure gone | `[WITTIG]` p.105 |
| Safety | hazards reaching the *positive indicator* stage rather than the *warning sign* stage | §D.1 |

**And one bonus axis that only this industry has:** **casing seat quality** — did
you set the string where the mud-weight window closed (§B.2), or one section too
early (money wasted, hole too small below) or one too late (kick tolerance hit
zero)?

## E.3 The five decisions unique to oil & gas

These are the moment-to-moment choices that exist in **no other industry pack** in
this project. Each one is sourced, each one is a real decision a real driller
makes, and each one has a clear right answer that changes with circumstances.

### 1. "Is my mud weight still inside the window?"
**Every metre, continuously.** Raise it and you buy safety from kicks and spend it
on losses and ECD; lower it and the reverse (§B.2, §B.3). **This is the only
industry in the game where the protective control has a wrong answer in both
directions**, and it is the spine of the whole design.
*Instrument:* the pore / fracture / ECD triple curve of §B.2's drawing notes.
*Tell:* the corridor visibly narrowing with depth.

### 2. "Do I set casing here, or drill one more section?"
§B.2's core-loop statement, verbatim: *"Every metre you drill without setting
casing is cheaper and riskier. Setting early costs a string and shrinks every hole
below it. Setting late risks the whole well. **When to set casing is the
decision.**"* **Kick tolerance falls as you drill below a shoe; at zero you have no
margin left.**
*Instrument:* a kick-tolerance bar that drains as you drill below the last shoe.
*Consequence:* set early and the ladder in §B.6.1 telescopes down one rung early —
your production hole gets smaller and the payout with it.

### 3. "Slide or rotate?"
Directional sections only, and it is a genuine dilemma `[WP-DD]`, §B.4:
sliding steers but is slower, more expensive, cleans the hole poorly and is when
the string gets stuck; rotating is fast and clean and goes straight. **You cannot
do both at once**, and the target is not going to move.
*Instrument:* the toolface clock plus a plan-vs-actual ghost line (§B.4).
*Upgrade path:* a rotary steerable removes the dilemma — *"allow directional
control while rotating"* `[WP-DD]` — for money.

### 4. "Trip now, or drill this bit into the ground?"
The classic. `FACTS_VERIFIED.md` already carries the game's own line — past ~70 %
worn, penetration falls off a cliff — and `[WITTIG]` p.105 gives the professional
grading scale (8 steps; T3 = 3/8 of teeth worn or 3/8 of inserts missing/broken).
Against that sits **≈3.3 h per 1 000 m** of tripping `[SLB-RT]`. **The right answer
is a function of depth**: at 500 m you trip early because tripping is cheap; at
4 500 m a round trip is 16–17 hours and you push the bit.
*Instrument:* a bit-wear estimate that is **deliberately imprecise** — you only
truly know the dull grade when the bit reaches surface.

### 5. "What is across the rams right now?"
The shut-in question from §C.2.4. A **VBR** seals a range; a **fixed pipe ram**
seals one size; a **blind ram** seals an empty hole. So the driller **spaces out**
— positions the string so a tool joint is not across the rams — before shutting in.
**This turns "press the panic button" into a two-second skill check**, and it is
the reason the panic button sometimes has to wait.
*Instrument:* a small elevation diagram of the stack with the string drawn through
it, and the current ram set highlighted.

**Honourable mention — the sixth, which is a *phase* rather than a decision:**
the top hole, where the shut-in button does not exist and the only tools are pilot
hole size, pump rate and which way the diverter points (§D.7).

## E.4 What the surface scene and the cross-section must show

`GAMEDESIGN.md` §1 gives two live bands sharing one world. Here is what goes in
each that **appears in no other industry pack.**

### E.4.1 Surface view — the four things that are only here

1. **The travelling block, and the rhythm of it.** Nothing else in this game has a
   500-ton mass moving 27 m up and down on a schedule. Trips should be *watchable*:
   block down, elevators latch, block up a stand, slips set, iron roughneck swings
   in, break out, derrickhand takes the stand to the fingerboard, repeat (§B.5).
   **The fingerboard filling — ~230 stands `[IADC-JU]` — is the trip's progress
   bar and it is diegetic.**
2. **The shaker house.** Mud sheeting across four linear-motion screens, cuttings
   walking off the end (§B.3, `[IADC-JU]` §F.2). **Cuttings size and shape is a
   well-control instrument** (§D.1) — this is the only place in the game where
   *looking at the spoil* is a real skill.
3. **The mud, by colour.** §B.3: WBM grey-brown; heavily weighted mud nearly
   white; OBM black-brown; **gas-cut mud visibly frothy and lighter — "fluffy"**
   `[DM-KICK]`. **The player should be able to see a kick coming in a colour
   change.** No other industry in this project has a working fluid that reports on
   the formation.
4. **The rig type itself.** Seven silhouettes (§C.1.8), each with a different
   relationship to the water: a hull in the air on legs; columns over submerged
   pontoons; a ship with a hole in it; a derrick among production plant; two
   objects joined by lines; a rectangle in a swamp; a mast in a fenced yard.
   **`PLATFORM_TRUTH.md` Part B makes rig type a matchable career field — the game
   should make it a matchable *silhouette*.**

### E.4.2 Cross-section — the one drawing that belongs to this industry alone

`GAMEDESIGN.md` §7 lists the section modes: `vertical` · `profile` · `raise` ·
`heading` · `pile`. Oil & gas needs **`profile`** (starting vertical, per §B.4)
plus **one addition that exists nowhere else in the game**:

**The pressure corridor.** From §B.2's drawing notes, and it is worth restating as
the single most distinctive visual asset in the whole project:

- a **pore pressure** curve down the left,
- a **fracture gradient** curve down the right,
- the player's **mud weight / ECD line** wandering between them,
- the space between them **shaded as a corridor that narrows with depth**,
- each set **casing shoe drawn as a hard bracket on the fracture curve** — below a
  shoe, the fracture limit is pinned to the strength *at that shoe*, not at the
  bit.

> **A kick is the mud line crossing left. Losses are it crossing right.
> Nothing else in this game — and nothing in any other drilling industry — looks
> like that.** (§B.2)

**Plus four supporting elements, all specific to this industry:**

5. **The telescope.** Nested casing strings drawn to real relative diameter
   (§B.6.1) — 20 in, 13⅜ in, 9⅝ in, 7 in — each one ending at a shoe, each one
   with cement in its annulus to the height `[CFR-421]` requires (**200 ft inside
   the conductor** for surface; **500 ft above the shoe and above each
   hydrocarbon zone** for intermediate and production). **The hole visibly getting
   narrower is the game's most honest expression of "you only get so many
   strings."**
6. **The planned path as a ghost line and the actual path as the solid one, with
   survey stations as discrete dots** (§B.4). Between stations the position is an
   interpolation — **the player should feel that uncertainty**, because it is real.
7. **The BOP stack under the substructure** (bottom-founded) **or on the seabed
   with a riser to the moonpool** (floater) — §C.2.5. Same well, two completely
   different pictures, and it is the difference between a jack-up contract and a
   drillship contract.
8. **The neutral point** in the drill collars — §B.5, `[WITTIG]`: use **2/3 of
   collar weight for WOB, keep 1/3 in reserve**; above the neutral point the string
   hangs in tension, *"the drill bit is hanging on a shoe lace."* Draw the string
   in **two colours: tension above, compression below.** As the player raises WOB
   the boundary climbs; when it climbs out of the collars into the drill pipe, the
   pipe is in compression and about to buckle. **A single moving line that makes an
   invisible engineering rule visible** — and it is the best possible use of a
   cross-section view.

## E.5 Hazard → control mapping, for the implementer

Which control caused it, and which control fixes it. This table is the bridge from
§D to the three sliders.

| Hazard | Caused by | Fixed by | Not fixed by |
|---|---|---|---|
| Kick | PROTECT too low (or swabbing on a trip) | PROTECT up — but **shut in first** | ADVANCE, WORK |
| Lost circulation | PROTECT too high (mud weight or ECD) | PROTECT down, LCM, keep the hole full | pumping harder |
| Differential sticking | PROTECT too high **and** stationary too long | PROTECT down, spot, jar; **prevented** by spiral collars and stabilizers | pulling harder |
| Pack-off | WORK/flow too low for the cuttings load; poor hole cleaning while sliding | careful circulation, work the string | more pump rate into the blockage |
| Twist-off | WORK too high (torque, stick-slip); fatigue at tool joints (**86 %** of failures `[WITTIG]` p.47) | WORK down; trip and inspect at the first hydraulic sign | ADVANCE |
| H2S | the formation | PPE and procedure — **no slider fixes this** | — |
| Shallow gas | depth, not the player | divert; pilot hole; dynamic kill | shutting in |
| Weather standby | the sea | secure and wait; lay pipe down if the derrick is racked full | anything |

---

# F. UNVERIFIED AND OPEN ITEMS (§§B.6 – E)

Per `PLATFORM_TRUTH.md` Part C rule 6 — *if in doubt, delete it*. Everything below
is visible rather than quietly filled in. **None of it may reach a player without
a further source.**

| Item | Status | Note |
|---|---|---|
| **17½ in bit → 13⅜ in casing** | **INDUSTRY-COMMON, NOT SOURCED** | The reachable source `[DF-CSG]` pairs 17½ in with **16 in** casing and 14¾ in with 13⅜ in. Display the casing ladder, not this rung. §B.6.1 |
| **36 in and 26 in top-hole bit sizes** | **UNVERIFIED** | No fetched source states them. The 30 in / 20 in casings are corroborated by the 21¼ in BOP stack `[IADC-JU]`. §B.6.1 |
| **Casing IDs other than 7 in / 26 ppf (6.276 in)** | **NOT SOURCED** | Only that one ID was obtained. Read the rest off an API 5CT dimension table before showing any clearance number. §B.6.1 |
| ScienceDirect *Hole Structure* topic page | **NOT USED AS A SOURCE** | It appears to state the conventional 26 + 17½ + 12¼ + 8½ / 20 + 13⅜ + 9⅝ + 7 programme, but the page returns **HTTP 403** to direct fetch, so the wording could not be verified first-hand. **Deliberately excluded.** |
| **Drillship water depth "200–600 m"** `[DM-OFFS]` | **UNVERIFIED / likely stale** | Contradicts `[ENV-RIG]` (40 000–50 000 ft drilling depth) and Drillity's own ultra-deepwater band (>3 000 m). Use `PLATFORM_TRUTH.md` Part B's four bands instead. §C.1.4 |
| **Jack-up environmental-limit readings** (26 ft wave, 8 s, 60 kn, 2 kn) | **PARTIALLY VERIFIED** | Label and value columns interleave in the extracted text; this is the internally consistent reading. Verify against the original PDF page. §D.8 |
| **Survival-condition limits** on the same rig | **NOT REPORTED** | The extraction gives survival wind as 60 kn — the same as drilling — which is implausible. Column offset suspected. Omitted rather than guessed. |
| **Lost-circulation numeric thresholds** (bbl/hr for seepage / partial / severe / total) | **UNVERIFIED** | `[DM-LC]` gives the four bands **qualitatively only**. Do not invent thresholds. §D.2 |
| **NPT percentages** (20–30 % general; 15–35 % North Sea floaters; ~10 % WOW) | **INDICATIVE ONLY** | Region- and fleet-specific. The *existence* of double-digit WOW is solid; the numbers are not universal constants. §D.8 |
| **"up to 20 % ROP improvement" from harmonic isolation tools** | **VENDOR CLAIM** | Reported in `[DM-TO]` as a tool capability, not an independent finding. §D.5 |
| **Semi-submersible pontoon depth "10–20 m below sea level"** | **SINGLE SOURCE** `[DM-OFFS]` | Fine for art direction; do not quote as a specification. §C.1.3 |
| **Tender-assisted 20–2 000 m depth band** | **SINGLE SOURCE** `[WP-TENDER]` | The band is wide because the *platform* sets the depth, not the tender. Plausible, unconfirmed elsewhere. §C.1.6 |
| **Crew headcount per tour** | **UNVERIFIED** (carried forward from §A.1) | Rig-specific. Do not put "the crew is exactly 5" on screen. |
| **Derrick wind ratings 93 kn / 107 kn** | **VERIFIED but single-rig** | From `[IADC-JU]` §B.1.1. It is one real rig, not an industry rule. Use it as a *class* figure, never as a universal. §C.2.1, §D.8 |

**One structural note for whoever picks this up next.** Every number in §C.2.6
comes from **one** rig's IADC form. That is a strength — the figures are mutually
consistent and therefore safe to model against — and a limitation: it is a
1979-built, 280 ft, 20 000 ft jack-up, i.e. **a mid-spec shallow-water unit, not a
harsh-environment or ultra-deepwater one**. `PLATFORM_TRUTH.md` Part B's **Rig
class** field (Standard · High-spec / harsh environment · Ultra-deepwater · HPHT)
is exactly the axis this data does *not* cover. Treat §C.2.6 as the **Standard**
class and scale from there — do not extrapolate a drillship's numbers from it.

---

*§§B.6–F compiled 2026-09-04, completing the file's own stated scope (rig unit
types, rig anatomy, hazards and the correct well-control response, and a mechanics
proposal). Sources are the local `C:\Users\henri\Downloads\` PDFs listed in the two
source-key tables plus the URLs cited inline. Per `DOMAIN.md` §10, no supplier
part numbers or drawing numbers appear, and no real model designation is proposed
as in-game content.*

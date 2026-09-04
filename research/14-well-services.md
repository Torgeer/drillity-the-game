# 14 — Well services: cementing, workover & completion, coil tubing, wireline, perforation, fracturing, directional & MWD

Research pack for **Drillity I The Game**, closing the largest remaining gap named
in `DESIGN_EXPANSION.md` §5: Oil & Gas is **20 of Drillity Talent's 35 industry
specialisations**, mud rotary is being added, and *"still absent: the
well-services loop — cementing, workover/completion, coil tubing, wireline
logging, perforation, fracturing — and directional/MWD as gameplay."*

**Scope.** The seven jobs above, each treated as: what the work is · the
equipment at iMarket taxonomy level · the crew · the ADVANCE / WORK / PROTECT
mapping (`GAMEDESIGN.md` §7) · what the job is scored on · the characteristic
failure and the instrument that lies · offshore specifics (`DESIGN_EXPANSION.md`
§3). Plus a ranked recommendation of which one to build first.

**Rules obeyed.** `PLATFORM_TRUTH.md` Part C. Every figure carries a source —
a URL, a standard, or a local file in `C:\Users\henri\Downloads\`. Anything
unsourceable is marked **`NOT SOURCED`** rather than filled in. Manufacturer and
service-company names appear **only as citations or as "who does this work"** —
no capability is attributed to a named maker and **no real model designation is
proposed as in-game content** (`DOMAIN.md` §6). No Drillity internal business
metrics appear anywhere. Where the industry states a practice but not its
reason, the practice ships and the reason is labelled **INFERENCE**.

**Nothing in this file has been applied.** It is a report.

---

## 0. How to read this file

### 0.1 What `research/01-oil-gas.md` already has — read this first

The existing oil & gas pack is 166 KB and **already covers all seven of these as
professions**. This file must not repeat that work. Audited section by section:

| Topic | Already in `01-oil-gas.md` | What this file adds |
|---|---|---|
| **Wireline logging** | §A.3.9 — slickline vs e-line, logging up on cable, grease injection, the logging unit, day rates (`[RZ-WLT]`, `[RZ-WLS]`), IADC WellSharp Well Servicing – Wireline | the **depth-control problem**, logging speed vs statistics, stuck-tool mechanics, the weak point, the equipment stack, the control mapping and the scoring |
| **Cementing** | §A.3.10 — SLB definition, primary job mechanics, displacement plug, float collar, WOC, the 30 CFR 250.420 *500 psi / bottom 500 ft* rule, the 10 000 psi cementing standpipe and hose from `[IADC-JU]` | **slurry classes (a primary standard)**, spacer and mud removal, standoff, the transition period, squeeze and plug jobs, the cement bond log and **its two-sided lie**, the control mapping and the scoring |
| **Fracturing** | §A.3.11 — SLB definition of hydraulic fracturing and proppant, the spread named in outline, `[SUPPLHI]` categories, "onshore, not a North Sea rotation" | the **treatment schedule**, plug-and-perf, the screen-out taxonomy, the Nolte-Smith and step-down diagnostics, **why the surface pressure gauge is ambiguous**, the control mapping and the scoring |
| **Perforation** | §A.3.12 — O\*NET task wording, shaped charges, conveyance options, lubricator, "the one explosives job", `[SUPPLHI]` 28.02.25G | **charge and gun physics with numbers**, shot density and phasing, standoff, **API RP 19B Section 1 vs Section 2 — the lying catalogue number**, depth correlation, the control mapping and the scoring |
| **Coil tubing** | §A.3.13 — SLB definition, size and length ranges, "live well, continuous string, pump at any time", the reel/injector/gooseneck silhouette flagged partially unverified, day rates `[RZ-CT]` | **the surface spread confirmed and sourced**, injector capacities, **fatigue as the consumable**, buckling → lockup, **the weight indicator as the lying gauge**, the control mapping and the scoring |
| **Workover / completion** | §A.3.14 — SLB and `[DICT]` definitions, kill-the-well rule, the slickline → CT → snubbing → workover-rig ladder, `[BLS-475013]` anchor, fishing-tool supervisor rate | **completion architecture**, the barrier ladder, formation damage as the real failure, why the job can succeed mechanically and fail commercially, the control mapping and the scoring |
| **Directional / MWD** | §B.4 (well shape, slide vs rotate, toolface, RSS, MWD triplet, mud-pulse telemetry), §B.6.2 (**dogleg severity fully sourced with bands**), §E.1 (toolface + slide/rotate as secondary controls) | the **BHA equipment taxonomy**, the bent-housing angle range, **the sourced ROP penalty for sliding**, reactive torque and toolface drift, **surface WOB vs downhole WOB as the lying gauge**, motor stall |

**Consequence for the implementer.** Sections A.3.9–A.3.14 of `01-oil-gas.md`
remain the authority for *who these people are, what they are paid and what
tickets they hold*. This file is the authority for *what the job is, what it runs
on, and how it plays*. Where the two touch, `01-oil-gas.md` wins on people and
this file wins on mechanics.

Also confirmed by grep across all twelve existing research packs: **no pack
contains the terms "cement bond", "CBL", "screen-out", "lockup" or "helical
buckling"**. The failure modes in §6 of each job below are new to the project.

### 0.2 Source key

| Key | Source |
|---|---|
| `[SLB-*]` | SLB Energy Glossary, individual term pages — https://glossary.slb.com/en/terms/… (exact URL given at each use) |
| `[ISO-10426]` | **ISO 10426-1:2005(E)**, *Petroleum and natural gas industries — Cements and materials for well cementing — Part 1: Specification*, 2nd edition 2005-12-15. Preview PDF, clauses 1, 3 and 4.1 complete — https://cdn.standards.iteh.ai/samples/43022/515161d9656943afa4c881b8513f3c41/ISO-10426-1-2005.pdf. **A primary standard.** API Spec 10A is its identical national adoption. |
| `[IADC-JU]` | `Jack-Up-Rig-IADC-List-30-JAN-2022.pdf` (local, `C:\Users\henri\Downloads\`) — IADC Standard Format Equipment List, Jack-Up Drilling Unit, rev. January 2022. A real filled-in 66-page rig spec sheet for one mid-spec unit. |
| `[SUPPLHI]` | `28-SupplHi-Standard-Categorization-Drilling-Equipment-and-Materials_compressed.pdf` (local) — SupplHi standard categorisation, category group 28 "Drilling Equipment and Materials", rev16 Jan19. Brand-neutral equipment taxonomy. |
| `[CFR-420]` | 30 CFR § 250.420 — https://www.law.cornell.edu/cfr/text/30/250.420 |
| `[EPA-PERF]` | B. Hansen (Devon Energy), *Casing Perforating Overview*, presented at an EPA Hydraulic Fracturing Study technical workshop; hosted by US EPA — https://www.epa.gov/sites/default/files/documents/casingperforatedoverview.pdf. EPA's own disclaimer: *"The statements made during the workshop do not represent the views or opinions of EPA."* Treat as an operator's technical overview, not an agency finding. |
| `[EPA-NUC]` | US EPA, *Environmental Geophysics — Nuclear Logging* — https://archive.epa.gov/esd/archive-geophysics/web/html/nuclear_logging.html |
| `[API-19B]` | American Petroleum Institute, *API 19B Perforator Witness & Registered Design Program* — https://www.api.org/products-and-services/witnessing-programs/perforators |
| `[OFR-SLIDE]` | S. Duplantis, *"Slide Drilling — Farther and Faster"*, **Oilfield Review 28, no. 2 (May 2016)**, pp. 50–56. A technical journal article — https://www.slb.com/-/media/files/oilfield-review/04-slide-drilling-english.ashx |
| `[CTES-TFM]` | K. Newman, K. Bhalla & A. McSpadden, *Basic Tubing Forces Model (TFM) Calculation*, Tech Note, CTES L.P., Conroe TX, **October 2003** — https://ctes.nov.com/documentation/technotes/Tech%20Note%20Tubing%20Forces%20Model.pdf. Cited **for the physics only**; the software product it documents is not named as in-game content. |
| `[BSEE-CT]` | Maurer Engineering Inc., *Coiled-Tubing Stress Analysis Model — Stress/Drag/Hydraulic/Buckling (CSTRESS1), Theory and User's Manual*, TR93-11, August 1993, prepared for DEA-67; hosted by US BSEE — https://www.bsee.gov/sites/bsee.gov/files/tap-technical-assessment-program/300ao.pdf. Used **only** as independent corroboration that lockup is a modelled limit (§2.8 of that report); the report carries a participants-only distribution note, so it is **not quoted**. |
| `[FET-CT]` | Forum Energy Technologies / Global Tubing, technical wiki — https://f-e-t.com/global-tubing/resources/wiki/. A **manufacturer's** technical reference. Used only for the API 5ST grade designations and the generic fatigue/retirement criteria, never for a capability claim. |
| `[DM-CTIH]` | Drilling Manual, *Coiled Tubing Injector Head* — https://www.drillingmanual.com/coiled-tubing-injector-head/ |
| `[DM-CBL]` | Drilling Manual, *Cement Bond Log Guide For Cementing Evaluation* — https://www.drillingmanual.com/cement-bond-log/ |
| `[INTECH-SO]` | *Screenout Detection and Avoidance*, open-access book chapter, IntechOpen (chapter 87723) — https://www.intechopen.com/chapters/87723 |
| `[GEOX-STUCK]` | GeoExpro, *"Why do cables get stuck during open-hole wireline logging operations?"* — https://geoexpro.com/why-do-cables-get-stuck-during-open-hole-wireline-logging-operations/. Contains a vendor's product claim, which is **excluded**; only the sticking-mechanism taxonomy is used. |
| `[DC-RLWI]` | *Drilling Contractor* (IADC's magazine), *"Re-inventing subsea intervention to keep economics above water"* — https://drillingcontractor.org/re-inventing-subsea-intervention-to-keep-economics-above-water-10657 |
| `[OM-RLWI]` | *Offshore*, *"Riserless light well intervention increases production, operating efficiency"* — https://www.offshore-mag.com/production/article/16754878/ |
| `[IADC-WS]` | IADC WellSharp — https://www.iadc.org/wellsharp/ |
| `[IWCF]` | IWCF — https://www.iwcf.org/ |
| `[BLS-475013]`, `[ONET-475013]` | US BLS OEWS May 2023 and O\*NET, occupation 47-5013 *Service Unit Operators, Oil and Gas*. Already used in `01-oil-gas.md` §A.3.10/§A.3.14. |

Carried forward without re-citation: everything already sourced in
`01-oil-gas.md`, whose source key is not duplicated here.

### 0.3 Units

`PLATFORM_TRUTH.md` Part C rule 3 requires SI on screen. Sources are imperial.
Every converted figure is given as **source unit first, SI in parentheses**, and
the conversion is arithmetic only — it introduces no new claim.
1 in = 25.4 mm · 1 ft = 0.3048 m · 1 psi = 0.0689 bar · 1 lb = 0.4536 kg ·
1 bbl = 0.159 m³ · 1 US gal = 3.785 L.

### 0.4 The framing that governs this whole file

**Six of the seven jobs are not drilling.** Nothing is being cut, no hole is
getting longer, and in four of them there is no bit in the well at all. The game
has, until now, only ever asked the player to make a hole deeper. Well services
ask three different questions:

1. **Cementing** — *did the fluid end up where the drawing says?* Placement.
2. **Wireline, perforation, MWD** — *do you know where you are?* Depth and position.
3. **Coil tubing, workover, fracturing** — *can you still control the pressure at surface while you do this?* Containment.

Every one of the three is a legitimate, sourced, well-understood industrial
problem, and none of them is "metres". That is the opportunity: **well services
is where the game stops being a depth counter.**

One more thing binds all seven, and it is the single most important fiction to
get right: **the well may be live.** A drilling well is open to the sky through
a column of mud that holds the formation back. A well-services well is very
often full of hydrocarbon at pressure, and the only thing between it and the
deck is a stack of seals the crew rigged up that morning. `[SLB-CT]` (already
quoted in `01-oil-gas.md` §A.3.13) states coiled tubing's whole reason for
existing as operating *"safely under live well conditions"*. The perforating
lubricator exists *"so that the perforating gun can be run in and out of the
well when the well has pressure on it"* `[EPA-PERF]` p.27. Snubbing is *"the act
of forcing a pipe or tubular into a well against wellbore pressure"*
`[SLB-SNUB]` (https://glossary.slb.com/en/terms/s/snubbing).

**Game consequence:** in well services the third slider stops being "flush".
It becomes **pressure containment at surface** — and unlike flushing, it is not
something you turn up when things get exciting. It is a barrier you either have
or do not have.

---

## 1. THE ANSWER FIRST — which of the seven to build, ranked

The brief asks for a ranked recommendation rather than seven equal sections.
Judged on the three stated criteria: **does it play differently from what
exists · is there a real decision in it · can Advance/Work/Protect carry it
honestly.**

### 1st — COIL TUBING. Build this one.

| Criterion | Verdict |
|---|---|
| **Plays differently?** | **Completely.** It is a *push into a pressurised well against a limit that is not rock.* The constraint is the pipe's own mechanics, not the ground. Nothing in the game's 21 methods does this. |
| **Real decision?** | **Three of them, all live at once.** How far in do you commit before lockup? How much of the string's finite fatigue life do you spend on this job? Do you run at pressure (fast, more fatigue) or bleed down (slow, safe)? |
| **A/W/P honest?** | **Yes, without deformation.** ADVANCE = injector force / run speed. WORK = what the tool is doing (jetting, milling, pump rate). PROTECT = the stripper and CT BOP, and the fatigue budget. No slider is dead, no label is a stretch. |

And it has, by a distance, **the best-sourced lying instrument in the whole
project** — better than the brooming pile toe, because the source states it as a
definition rather than as a caution:

> *"lockup is now defined to occur when a large increase in set down weight
> causes only a very small increase in force at the end of the tool (downhole
> force)."* `[CTES-TFM]` p.10

The player pushes harder. The surface weight gauge climbs, exactly as it should.
**Nothing reaches the tool.** And:

> *"It is not possible to push the CT further into the casing once helical lockup
> is reached, no matter how much axial load is applied."* `[CTES-TFM]` p.10

Supporting arguments:

- **The consumable behaves unlike anything in the shop.** A drill bit wears in
  the hole where you can watch it. A CT string is consumed *at surface*, by
  bending over the reel and the gooseneck — *"All the fatigue damages occur on
  the equipment above the wellhead, not in the well"* `[FET-CT]`. Every trip
  spends life whether the job goes well or badly. That is a money sink with a
  completely new shape, and it is a genuinely new lesson.
- **It reuses renderers the game already has.** A vertical or profile
  cross-section, a string going in, a depth ruler. The surface view gains one
  new silhouette (reel + gooseneck + injector over a wellhead) instead of a mast.
- **It is the gateway to the other six.** CT conveys logging tools, perforating
  guns, mills and cleanouts. Build the CT loop and perforation, wireline
  conveyance and post-screen-out cleanout become *content inside it* rather than
  six more methods.
- **It carries the live-well fiction** that all of well services needs, and it
  carries it with a real, nameable, buyable barrier stack.

**Proposed id:** `coil-tubing`. **Section mode:** `vertical` for a vertical well,
`profile` for a horizontal one — and the profile mode already exists for HDD.

### 2nd — CEMENTING, but as a scored *phase* of `oil-rotary`, not a standalone method

`01-oil-gas.md` §B.2 already makes "do I set casing here?" the core loop of mud
rotary, and §E.2 already adds **casing seat quality** as the industry's unique
grade axis. Cementing is the missing second half of that decision: you set the
string, and then you find out whether it sealed.

- **Plays differently?** Yes — it is a **pumping schedule with no reverse gear**.
  Once the slurry is in the casing you cannot stop, cannot back up, and cannot
  do it again cheaply.
- **Real decision?** Yes — displacement rate against ECD, how much to spend on
  centralisers, and *whether to log the job at all* before you drill ahead.
- **A/W/P honest?** Partly. ADVANCE has no natural meaning (nothing penetrates);
  the honest restatement is *the position of the cement top, which advances
  whether you like it or not.* Said out loud, that is interesting rather than a
  fudge — see §3.4.

It has a two-sided lying instrument (§3.6) which is arguably richer than coil
tubing's, and the regulator has already written the waiting-timer mechanic for
free: **500 psi (34.5 bar) compressive strength behind the bottom 500 ft
(152 m)** before you may drill out `[CFR-420]`.

Reason it is second, not first: **a cement job is one event, not a sustained
loop.** As a standalone "method" it would be a two-minute minigame. As the
epilogue to every casing string in mud rotary it is superb, and it costs far
less to build.

### 3rd — DIRECTIONAL / MWD, as a *mode* on `oil-rotary`

Highest value per unit of remaining research, because the research is largely
done: `01-oil-gas.md` §B.4 has slide vs rotate, toolface and the survey cadence;
§B.6.2 has dogleg severity fully sourced with four bands and a fatigue limit;
§E.1 already specifies the slide/rotate toggle and the toolface clock as
contextual secondary controls. What is missing is only what this file adds in
§9: the sourced ROP penalty, reactive torque, motor stall and the surface-WOB
lie. It turns the depth bar into a steering problem and it makes
`DESIGN_EXPANSION.md` §1's "vertical, build, tangent, lateral" geometry
playable. It is not first because it is an **upgrade to an existing method**
rather than a new career.

### 4th — WIRELINE LOGGING

The most *elegant* of the seven and the one with the purest instrument-lies
lesson — the depth on the panel is not the depth of the tool, and a nuclear log
run too fast is smooth, plausible and wrong `[EPA-NUC]`. But the three-control
model half-fits: on a plain logging pass **ADVANCE and WORK collapse into one
number, line speed.** §6.4 proposes an honest fix (WORK = integration time), and
that fix is sourced — but it is a fix, and the brief asked for honesty about it.
Best shipped as the *substrate* for perforation and for the cement bond log.

### 5th — FRACTURING

Biggest spectacle in the industry and a genuinely excellent decision — ramp the
proppant concentration and go faster, or protect the stage. The lying instrument
is the strongest in the set conceptually: **the same rising pressure signature is
a screen-out in one design and the intended outcome in another** `[INTECH-SO]`.
Held back by two things: it needs a new renderer (a fracture growing away from
the wellbore, not a hole getting deeper), and it is *"overwhelmingly a land
operation"* (`01-oil-gas.md` §A.3.11), which fights the offshore/rotation story
that `DESIGN_EXPANSION.md` §3 is trying to tell.

### 6th — PERFORATION

A moment, not a method. The decision is entirely *before* the trigger — charge
choice, depth correlation, underbalance — and after it there is nothing to
control. Superb as a scored **step inside a wireline or CT run**, and it carries
the single best iMarket lesson in this file: **the penetration number on the
listing is a lab number measured in concrete** (§7.6). Ship it inside wireline.

### 7th — WORKOVER / COMPLETION

Not a control loop at all; it is the **contract wrapper** the other six live
inside. `01-oil-gas.md` §A.3.14 already frames its one real choice perfectly
(slickline → coiled tubing → snubbing → kill and pull with a rig). Implement it
as a **job type on the contract board**, not as a method with sliders.

**One-line summary.** Build `coil-tubing` as a method; add **cementing** and
**slide/rotate** as scored phases of `oil-rotary`; make **wireline** the carrier
for **perforation**; leave **fracturing** as a region-locked onshore set piece;
and make **workover/completion** a contract type rather than a slider screen.

---

## 2. The common spine

Everything below depends on three ideas that are shared across all seven jobs.
Stating them once keeps the seven sections short.

### 2.1 Live well vs dead well — the fork every well-services job starts from

`01-oil-gas.md` §A.3.14 already sources the ladder. Restated as a decision tree,
because this is the contract-board choice:

```
Is the well flowing / under pressure?
│
├── YES → intervene live. Nothing is pulled; you work through what is there.
│   ├── slickline            cheapest, mechanical only, small tools
│   ├── e-line (electric)    logging + can fire perforating guns
│   ├── coiled tubing        can pump; can push into horizontal; continuous
│   └── snubbing / HWO       forces jointed pipe in against pressure; heaviest
│
└── NO → kill the well first, then pull tubing with a workover rig.
    Highest capability. You lose production for the whole job, and
    you risk the reservoir never coming back the same (§4.6).
```

Sourced anchors: *"To stop a well from flowing or having the ability to flow into
the wellbore. Kill procedures typically involve circulating reservoir fluids out
of the wellbore or pumping higher density mud into the wellbore, or both"*
`[SLB-KILL]` (https://glossary.slb.com/en/terms/k/kill). Snubbing = *"The act of
forcing a pipe or tubular into a well against wellbore pressure"*, because
*"pressure in the wellbore acting on the cross-sectional area of the tubular can
exert sufficient force to overcome the weight of the drillstring, so the string
must be pushed (or 'snubbed') back into the wellbore"* `[SLB-SNUB]`.

**This is the best contract-board mechanic in the file.** Every intervention
contract offers the player the same job at four price points with four different
capabilities and four different risk profiles, and the *cheap* option is
genuinely sometimes right.

### 2.2 The restatement of ADVANCE / WORK / PROTECT for a job that is not drilling

`GAMEDESIGN.md` §7 defines the three controls semantically:

> **ADVANCE** — how hard you push into the ground.
> **WORK** — the energy you put into breaking it.
> **PROTECT** — what keeps the hole, the tool and the crew intact.

Well services need one honest amendment to the first two and a genuine
redefinition of the third:

| | drilling meaning | **well-services meaning** |
|---|---|---|
| **ADVANCE** | push into the ground | **rate of progress of the thing you are moving** — the tool down the hole, the cement top up the annulus, the fluid into the formation |
| **WORK** | energy to break rock | **the intensity of the process you are performing** — slurry density, proppant concentration, jetting/milling energy, measurement integration |
| **PROTECT** | flush / hole stability | **pressure containment and the consumption of an irreplaceable budget** — the surface barrier stack, plus fatigue life, cable tension margin, or the fracture gradient |

The critical difference, and it is worth putting in the design doc:

> In drilling, **PROTECT is a slider you turn up when things get exciting.**
> In well services, **PROTECT is mostly a barrier you either rigged up or
> didn't, plus a budget that only ever goes down.** Turning it up is not
> available. That is a genuinely different feeling and it is authentic.

Compare `01-oil-gas.md` §E.1's finding that mud rotary is the only method whose
PROTECT is a *two-sided window*. Well services adds a second novelty: PROTECT
that is **monotonically consumed**. Between them, the oil & gas branch now
teaches three different shapes of the third control, which is the strongest
argument in this file for building the branch at all.

### 2.3 Where the model does **not** fit — stated honestly

The brief asked for this explicitly. Five places:

1. **Perforation has no controls at the moment of firing.** It is a binary
   event. All three sliders belong to the *run* that delivers the gun, which is
   a wireline or CT run. **Do not build a perforating HUD.**
2. **Cementing has no ADVANCE the player commands.** Nothing penetrates. The
   cement top rises because the pump is running, and once started, stopping is
   worse than continuing. The honest framing is "ADVANCE = displacement rate,
   and the *direction* is not yours" — see §3.4.
3. **Wireline collapses ADVANCE and WORK into one number** on a plain logging
   pass: line speed both moves the tool and sets the data quality. §6.4 splits
   them by making WORK the measurement's integration time, which is real and
   sourced `[EPA-NUC]`, but it is a design decision, not a discovery.
4. **Fracturing has no ADVANCE into the ground at all.** The fracture goes where
   the earth's stresses send it — *"the fracture wings extend away from the
   wellbore in opposing directions according to the natural stresses within the
   formation"* `[SLB-HF]` (quoted in `01-oil-gas.md` §A.3.11). ADVANCE = pump
   rate is honest; ADVANCE = "where the frac goes" would be a lie.
5. **Workover/completion is not one job.** It is a sequence of the others plus
   pipe handling. Giving it three sliders would be inventing a control loop that
   the trade does not have.

### 2.4 The listing-type insight — where this equipment lives in the shop

Checked against `DOMAIN.md` §3. The Drillity taxonomy's group **D. Downhole &
Well** contains *Directional Drilling (Mud Motors, MWD/LWD, Steering Tools,
Survey Tools, Directional Subs) · BOP & Well Control · Wellhead & Completion ·
Exploration & Coring · Site Investigation & Testing.*

**Finding: the taxonomy has no family for cementing units, coiled tubing units,
wireline units, perforating guns or fracturing spreads.** Directional drilling
and wellhead/completion are covered; the five service spreads are not.

The elegant resolution uses the platform's own vocabulary rather than inventing
categories. `PLATFORM_TRUTH.md` Part A lists **Listing type** as a real facet:
`Machine / Rig · Attachment Tool · Consumable · Spare Part · Service / Rental`.

> **Well services are `Service / Rental` listings, not `Machine / Rig` listings.**

That is not a convenience — it is what the industry does, and there is a hard
local source for it. On the real jack-up spec sheet:

- **G.2.1 Cement Unit — "Provided by Operator"** `[IADC-JU]`
- **G.2.2 Cementing Manifold — "None"** `[IADC-JU]`
- **F.3.6 Surge Tank For Cement — "Provided by Operator"** `[IADC-JU]`
- The IADC standard equipment list has **no wireline section and no coiled
  tubing section at all** — its 15 sections run A–I (structure, hoisting, power,
  drillstring, well control/subsea, mud/bulk, casing/cementing, instrumentation,
  production test). `[IADC-JU]` contents pages.

The rig owns silos, a standpipe and a hose. **It does not own the pump, and it
does not own the crew.** The player buying into well services is buying a
service, hiring a spread, or becoming the spread — which is exactly the
`Service / Rental` listing type and exactly the *service track* career that
`01-oil-gas.md` §A.0 already identified as the third chain of command.

---

## 3. CEMENTING

### 3.1 What the job actually is

Placing a cement sheath in the annulus between a casing string and the hole,
so that the formations the well passes through are hydraulically isolated from
one another and from surface, and so that the casing is supported and protected.

> *"The process of placing a cement sheath around a casing or liner string. The
> main objectives of primary cementing operations include zonal isolation to
> prevent migration of fluids in the annulus, support for the casing or liner
> string, and protection of the casing string from corrosive formation fluids."*
> `[SLB-PC]` (https://glossary.slb.com/en/terms/p/primary_cementing)

`01-oil-gas.md` §A.3.10 already has the mechanical sequence and the SLB
`[SLB-CEM]` definition covering the four job types (annulus seal, lost-circulation
seal, kick-off plug, abandonment plug). What follows is the part it does not have.

**The sequence, in the order a cementer does it.**

1. **Condition the hole.** Circulate the mud until it will move. Cement will not
   push mud that has gelled against the wall.
2. **Pump a spacer** ahead of the slurry. A spacer is *"A viscous fluid used to
   aid removal of drilling fluids before a primary cementing operation"*,
   engineered in viscosity and density to *"displace the drilling fluid while
   facilitating placement of a complete cement sheath"* `[SLB-SP]`
   (https://glossary.slb.com/en/terms/s/spacer).
3. **Launch the bottom plug.** *"The bottom plug is launched ahead of the cement
   slurry to minimize contamination by fluids inside the casing prior to
   cementing. A diaphragm in the plug body ruptures to allow the cement slurry to
   pass through after the plug reaches the landing collar."* `[SLB-CPLUG]`
   (https://glossary.slb.com/en/terms/c/cementing_plug)
4. **Pump the slurry.** Commonly a lighter **lead** slurry to fill the long upper
   annulus and a denser **tail** slurry for the critical bottom section.
   *(Lead/tail is standard trade practice; no first-party source was reached for
   it — see §14. The **existence** of engineered density is sourced: mix water is
   specified per class, e.g. 44 % by mass of cement for Class G and 38 % for
   Class H `[ISO-10426]` Table 2.)*
5. **Launch the top plug and displace.** *"The top plug has a solid body that
   provides positive indication of contact with the landing collar and bottom
   plug through an increase in pump pressure."* `[SLB-CPLUG]` — this is **the
   plug bump**, and it is the moment the job is declared over at surface.
6. **The float holds it there.** *"The check-valve assembly fixed within the float
   collar prevents flowback of the cement slurry when pumping is stopped"* —
   without it the denser slurry would U-tube back inside the casing `[SLB-FC]`
   (https://glossary.slb.com/en/terms/f/float_collar).
7. **WOC — wait on cement.** *"To suspend drilling operations while allowing
   cement slurries to solidify, harden and develop compressive strength"*,
   a period *"ranging from hours to several days"* `[SLB-WOC]`
   (https://glossary.slb.com/en/terms/w/wait_on_cement).
8. **Prove it.** Pressure-test the casing; log the cement (§3.6).

**The regulatory acceptance criterion, already found by `01-oil-gas.md` and worth
restating because it is the timer:** cement behind the **bottom 500 ft (152 m)**
of casing must reach **500 psi (34.5 bar)** compressive strength before drilling
out the shoe or starting completion `[CFR-420]`.

**Remedial cementing.** Two further jobs the player will meet:
- **Squeeze** — *"The forcing, by pressure, of cement slurry into a specified
  location in a well, such as channels or perforations, for the purpose of
  achieving zonal isolation"*; a *"remedial cementing technique used to repair
  flaws in primary cement"*; the solids build a filter cake against permeable
  rock that *"will cure to form an impenetrable barrier"* `[SLB-SQ]`
  (https://glossary.slb.com/en/terms/s/squeeze_cementing).
- **Plug** — a column of cement set in open hole or casing to kick off a
  sidetrack or to abandon; already named in `[SLB-CEM]` via `01-oil-gas.md`.

### 3.2 The equipment, at taxonomy level

**Categories, brand-neutral, at the level iMarket works at.**

| Category | Named tool types | Source |
|---|---|---|
| **Cementing unit** (Service / Rental) | skid or truck-mounted mixing and pumping unit; portable bulk plant. `[SUPPLHI]` files **Cementing Equipment 28.02.24G** and states it *"refers to both modular, skid-based cementing units and portable bulk plants"* | `[SUPPLHI]` |
| **Bulk cement storage & transfer** | cement silos with load cells and relief valves; surge tank; pneumatic bulk transfer system with dedicated low-pressure compressor and air drier | `[IADC-JU]` F.3.2, F.3.6, F.3.7 |
| **High-pressure cement line** | cementing standpipe; cementing manifold; cementing hose; cementing kelly; cementing tubing | `[IADC-JU]` G.2.2–G.2.5, F.1.6 |
| **Cement head / plug container** | the manifold on top of the casing string that launches the plugs | `01-oil-gas.md` §A.3.10 (`[SLB-CEM]`) |
| **Float equipment** | float shoe, float collar, landing collar | `[SLB-FC]`; `[SUPPLHI]` lists *"Centralizers, Cementing Plug, Float Equipment"* among drilling tools/joints in its OCTG family narrative (code attribution ambiguous in the extracted text — treat the **list** as sourced and the **code** as unconfirmed) |
| **Plugs** | bottom (diaphragm) plug, top (solid) plug — synonym *wiper plug* | `[SLB-CPLUG]` |
| **Centralizers** | bow-spring centralizer with hinged collar; stop collars | `[SLB-CENT]` (https://glossary.slb.com/en/terms/c/centralizer) |
| **Slurry & additives** (Consumable) | well cement by **class** and **grade**; spacer; retarders, accelerators, fluid-loss additives, extenders, weighting agents | `[ISO-10426]`; `[SUPPLHI]` **Cement 28.05.03G** |

**The cement classes — a primary standard, and the single most quotable fact in
this section.** `[ISO-10426]` clause 4.1.1: *"Well cement shall be specified using
the following Classes (A, B, C, D, E, F, G and H) and Grades (O, MSR and HSR)."*
Grade denotes sulfate resistance: **O** ordinary, **MSR** moderate
sulfate-resistant, **HSR** high sulfate-resistant `[ISO-10426]` 3.6, 4.1.1.

| Class | Intended use, in the standard's own words | Grades available | Mix water, % mass of cement |
|---|---|---|---|
| **A** | *"for use when special properties are not required"* | O only | 46 |
| **B** | *"when conditions require moderate or high sulfate-resistance"* | MSR, HSR | 46 |
| **C** | *"when conditions require high early strength"* | O, MSR, HSR | 56 |
| **D** | *"under conditions of moderately high temperatures and pressures"* | MSR, HSR | 38 |
| **E** | *"under conditions of high temperatures and pressures"* | MSR, HSR | 38 |
| **F** | *"under conditions of extremely high temperatures and pressures"* | MSR, HSR | 38 |
| **G** | *"as a basic well cement"* | MSR, HSR | 44 |
| **H** | *"as a basic well cement"* | MSR, HSR | 38 |

All from `[ISO-10426]` clause 4.1.1 and Table 2. **Caution for the implementer:**
the 2005 ISO edition specifies **eight** classes; secondary sources report that
the current API Spec 10A covers **six** (A, B, C, D, G, H), E and F having been
withdrawn. That withdrawal is **NOT SOURCED** to a primary document here — see
§14. **Ship G and H as the two the player actually buys** (they are the two
described as the basic well cements) and treat the rest as flavour.

Two more sourced numbers that make the shop screen real, both from
`[ISO-10426]` Table 2:
- **Class G / H free-fluid content, maximum 5.9 %** — free fluid is *"coloured
  or colourless liquid which has separated from a cement slurry"* `[ISO-10426]`
  3.12. Slurry that separates cannot seal.
- **Class G / H minimum compressive strength at 8 h, 60 °C (140 °F), atmospheric
  pressure: 10.3 MPa (1 500 psi)**. Note this is *far* above the regulator's
  500 psi drill-out threshold `[CFR-420]` — the standard is a manufacturing
  spec, the CFR figure is a field acceptance criterion. **Do not conflate them.**

And the definition that turns cement into a clock:
> **Thickening time** — *"time for a cement slurry to develop a selected Bc"*,
> where **Bc** is the *"Bearden unit of consistency"* measured on a pressurized
> consistometer. *"The results of a thickening time test provide an indication of
> the length of time a cement slurry remains pumpable under the test
> conditions."* `[ISO-10426]` 3.16, 3.2, 3.10

**That is the game's timer, defined by the standard.** The slurry is pumpable for
a designed, measurable, purchasable length of time, and when it stops being
pumpable it does not matter where it is.

### 3.3 The crew, mapped to the career ladder

`01-oil-gas.md` §A.3.10 has the roles and the pay anchor
(`[BLS-475013]` / `[ONET-475013]`, median USD 55 750/yr ≈ €48 000; treat any
single cementing day rate as UNVERIFIED). Not repeated. What this file adds:

- **The cementer is not rig crew.** `[IADC-JU]` G.2.1 records the cement unit as
  *"Provided by Operator"* — the pump and the people arrive for the job. In
  `01-oil-gas.md` §A.0's three-chain framing, cementing sits squarely in the
  **service track**, directed on location by the company man.
- **The rig crew still does half the job.** Running the casing, making up the
  float equipment and installing centralizers is floorhand and derrickhand work
  on the contractor track. So a cement job is the clearest example in the game
  of **two chains of command sharing one operation** — a good reason to render
  both crews on the surface view.
- **Career mapping** (`PLATFORM_TRUTH.md` Part B job functions): the field post
  maps to **Equipment Technician** / **Drill Rig Operator** at entry, then to
  **Foreman / Site Supervisor**. `DOMAIN.md` §7 has no cementer label; the
  honest mapping is via the service track that `01-oil-gas.md` §A.7 already draws.

### 3.4 ADVANCE / WORK / PROTECT

| | **ADVANCE** | **WORK** | **PROTECT** |
|---|---|---|---|
| **What it is** | **Displacement rate** — how fast you push the train of spacer, slurry and plugs down and around | **Slurry design in the moment** — density, and which slurry is in the pump (lead vs tail) | **ECD against the fracture gradient**, plus **standoff**, which you bought before the job started |
| **Unit on screen** | m³/min (source unit bbl/min) | kg/m³ | bar of ECD, and % standoff |
| **Low end fails by** | mud not displaced; the slurry channels past a gelled mud pocket | too light: no strength, gas can enter | **too little ECD**: the well can flow while cement is going in |
| **High end fails by** | too fast can erode the hole and can raise ECD past the fracture gradient | too heavy: lost circulation, and you break down the formation you are trying to seal | **too much ECD**: you fracture the formation, lose the column, and the cement top ends up short |

**The honest problems with this mapping, stated as the brief demands:**

- **ADVANCE has no direction the player owns.** Nothing penetrates. Once the top
  plug is launched the cement's position is a function of volume pumped, and
  volume pumped only goes one way. This is not a defect to hide — it is the most
  distinctive thing about the job and the game should say it in one line on the
  HUD: **NO REVERSE.**
- **PROTECT is partly pre-paid.** Standoff — how well centralised the casing is —
  is decided when you buy and place centralizers, *before* the pump starts.
  During the job you cannot change it. That is a genuinely new relationship
  between the shop and the minigame: **an iMarket purchase that silently sets
  your ceiling.** *(That standoff drives displacement efficiency is
  well-established trade practice; a first-party numeric target — the commonly
  quoted 60–70 % minimum standoff — is **NOT SOURCED** here, see §14. What is
  sourced is the mechanism: if casing is cemented off-centre, "there is a high
  risk that a channel of drilling fluid or contaminated cement will be left where
  the casing contacts the formation, creating an imperfect seal"* `[SLB-CENT]`.)
- **PROTECT is two-sided, like mud rotary.** Same window, same both-ends-kill-you
  property that `01-oil-gas.md` §E.1 identifies as the industry's differentiator.
  Cementing inherits it and adds a deadline (thickening time) that mud rotary
  does not have.

### 3.5 What the job is scored on

**Not metres. Not even minutes. Placement and bond.**

| Axis | What it measures | Sourced anchor |
|---|---|---|
| **Top of cement reached** | did the sheath get as high up the annulus as the programme required | `[SLB-PC]` — zonal isolation is the stated objective |
| **Displacement efficiency** | how much of the annulus is cement rather than left-behind mud | mechanism per `[SLB-CENT]`, `[SLB-SP]` |
| **Bond quality** | is the cement adhering to the pipe, and is it continuous around it | `[SLB-CBL]` (https://glossary.slb.com/en/terms/c/cement_bond_log) |
| **Strength at the shoe, on time** | 500 psi (34.5 bar) over the bottom 500 ft (152 m) before drill-out | `[CFR-420]` |
| **Losses during the job** | did you keep the column, or did you break down the formation | `[SLB-LC]` (https://glossary.slb.com/en/terms/l/lost_circulation) |
| **NPT spent waiting** | WOC is *"hours to several days"* and the rig is on rate the whole time | `[SLB-WOC]`; the CPF cost model in `01-oil-gas.md` §E.2 |

**The grade should not be available immediately.** That is the design point: the
job ends with a plug bump and a handshake, and the score arrives later, off a log.
Nothing else in the game does that.

### 3.6 The characteristic failure, and the instrument that lies

**The characteristic failure is a mud channel behind the pipe.** The cement went
down and came up, the volumes balanced, the plug bumped — and there is a
continuous finger of drilling mud running up one side of the annulus, connecting
two zones that were never supposed to meet.

**This job has TWO lying instruments, pointing in opposite directions. That makes
it the richest failure in this file.**

**Lie 1 — the plug bump says the job worked.** The top plug *"provides positive
indication of contact with the landing collar and bottom plug through an increase
in pump pressure"* `[SLB-CPLUG]`. That spike is real, satisfying, and unambiguous.
It proves **the designed displacement volume was pumped and the plug arrived**.
It proves **nothing whatsoever about where the cement is in the annulus.** A job
with a channel down one side bumps exactly as beautifully as a perfect one.
*(That the bump does not evidence annular placement is **INFERENCE** — no source
states it negatively. It is however entailed by the existence of the cement bond
log as a separate, later, differently-conveyed measurement `[SLB-CBL]`, and by
the SLB definition of the plug's function, which is confined to separating fluids
and indicating contact.)*

**Lie 2 — the cement bond log lies in both directions.** This one is sourced hard.

The CBL is *"A log that uses the variations in amplitude of an acoustic signal
traveling down the casing wall between a transmitter and receiver to determine
the quality of cement bond on the exterior casing wall"* — and SLB states its own
limitation plainly:

> *"The measurement is largely qualitative, as there is no indication of
> azimuthal cement variations such as channeling, and as it is sensitive to the
> effect of a microannulus."* `[SLB-CBL]`

Direction one, **good log over bad cement**:
> *"the amplitude of a high-strength cement having channels may be similar to a
> low-strength cement with no channels."* `[DM-CBL]`

Direction two, **bad log over good cement**. A **microannulus** is *"A small gap
that can form between the casing or liner and the surrounding cement sheath, most
commonly formed by variations in temperature or pressure during or after the
cementing process"* `[SLB-MA]`
(https://glossary.slb.com/en/terms/m/microannulus) — described elsewhere as
*"a small water gap created behind the casing when the pressure inside the casing
is released after the cement is set"* `[DM-CBL]`. Its effect:
> *"A high amplitude in a cement bond log CBL response may indicate free pipe
> while it may actually be micro annulus."* `[DM-CBL]`

**And the trade's answer is a diagnostic the player can perform**, which is what
makes this playable rather than merely cruel:
> *"the CBL log must be run under pressure to prevent micro annulus formation."*
> `[DM-CBL]`

Pressure up the casing and log again. If the log improves, it was a microannulus
and the cement is fine. **If nothing changes, it is a channel and you have a
problem.** One extra run, one extra cost, one unambiguous answer — that is a
complete, sourced, three-beat gameplay loop, and it teaches the exact habit the
brief asked for: *do not believe a good-looking gauge; go and check it.*

**Secondary failures worth modelling:**
- **Losses while cementing.** ECD past the fracture gradient and the column goes
  into the formation instead of up the annulus; TOC ends short. Mechanism per
  `[SLB-LC]`; the two-sided-window logic per `01-oil-gas.md` §B.2/§D.2.
- **Gas migration during the transition.** While the slurry is neither liquid nor
  solid it stops transmitting full hydrostatic pressure, and gas can enter the
  column. This is a real and important mechanism, but the numeric thresholds
  commonly quoted (static gel strength from 100 to 500 lbf/100 ft²) could **not**
  be traced to a first-party standard in this research — **NOT SOURCED**, §14.
  Ship the *phenomenon* (a waiting period during which the well is at its most
  vulnerable) and not the numbers.
- **Contaminated slurry.** Bad mixing, or mud cutting into the slurry because a
  plug was not launched. `[SLB-CPLUG]` gives the mechanism directly.

### 3.7 Offshore specifics

Per `DESIGN_EXPANSION.md` §3, the offshore differences that matter.

- **The rig brings the silos; the operator brings the pump.** On the real
  jack-up: cement silos **2 off, 1 725 ft³ (48.9 m³) each**, load cells fitted,
  pressure rating **40 psi (2.8 bar)**, relief valves fitted `[IADC-JU]` F.3.2 —
  alongside barite/bentonite silos 2 × 1 950 ft³ (55.2 m³) `[IADC-JU]` F.3.1.
  But **G.2.1 Cement Unit — "Provided by Operator"**, **G.2.2 Cementing Manifold
  — "None"**, **G.2.4 Cementing Kelly — "None"**, **G.2.5 Cementing Tubing —
  "None"** `[IADC-JU]`. That is a hire decision on the contract board.
- **The cement line is a separate, higher-pressure path than the mud line, and
  the numbers prove it.** On the same rig: rotary (mud) hoses **3½ in × 75 ft
  (89 mm × 22.9 m) at 5 000 psi (345 bar)** `[IADC-JU]` F.1.5, against a
  **cementing hose 2 in ID × 60 ft (51 mm × 18.3 m) at 10 000 psi (690 bar)**
  `[IADC-JU]` F.1.6 and a **cementing standpipe at 10 000 psi (690 bar), 3″ × 3″,
  tied to the choke manifold at 10 000 psi** `[IADC-JU]` G.2.3. **Draw two
  lines, and make the thin one the strong one.** (The first two of these are
  already noted in `01-oil-gas.md` §A.3.10; the 5 000 psi mud-hose contrast is new.)
- **Bulk transfer is pneumatic and has its own air plant** — an independent
  high-volume low-pressure compressor and drier for the silos and surge tanks,
  not fed off rig air `[IADC-JU]` F.3.7. On the surface view that is a distinct
  machine and a distinct sound.
- **On a floater, the top-hole cement returns to the seabed, not to the deck.**
  This follows from the well being drilled riserless above the subsea BOP —
  `[DICT]` p.668 via `01-oil-gas.md` §A.3.15 establishes that on floating rigs
  the stack is on the seabed. **The visual consequence — a cement plume at the
  mudline — is an INFERENCE** from that arrangement, not a sourced statement.
- **Rig type gates nothing here.** Cementing happens on all seven of Talent's
  rig types. What changes is water depth (longer riser or riserless top hole),
  temperature at the mudline, and the cost of the WOC clock, which on an
  ultra-deepwater unit is the most expensive waiting in the industry.
- **Certifications:** the standard offshore stack gates the helicopter seat —
  BOSIET, HUET, FOET, OGUK/ENG1 medical, **expired = cannot mobilise**
  (`PLATFORM_TRUTH.md` Part B). Well control applies where the job is on a live
  well. `01-oil-gas.md` §A.3.10 records the precise cementing gating
  certificates as **UNVERIFIED**; that remains true.

---

## 4. WORKOVER AND COMPLETION

### 4.1 What the job actually is

Two related jobs, both about a well that already exists.

**Completion** is bringing the well onto production: *"Installation in a well of
production tubing and equipment, wellhead and Christmas Tree"* `[DICT]` p.1246
(via `01-oil-gas.md` §A.3.14). In the hole: perforate the pay, run **tubing**
with a **packer** that seals the annulus above the producing section, land the
tubing hanger, install the tree.

**Workover** is going back in later: *"The repair or stimulation of an existing
production well for the purpose of restoring, prolonging or enhancing the
production of hydrocarbons"*, *"typically including removal and replacement of
production tubing **after the well has been killed** and a workover rig is
positioned"* `[SLB-WO]` (via `01-oil-gas.md` §A.3.14).

**The packer is the component the whole architecture hangs from:**
> *"A downhole device used in almost every completion to isolate the annulus from
> the production conduit, enabling controlled production, injection or
> treatment,"* creating *"a reliable hydraulic seal to isolate the annulus,
> typically by means of an expandable elastomeric element."* Packers are
> *"classified by application, setting method and possible retrievability."*
> `[SLB-PK]` (https://glossary.slb.com/en/terms/p/packer)

**Completion architectures the game should distinguish** (three is enough):
1. **Cased and perforated** — casing cemented across the pay, then perforated
   (§7). The default, and the one that connects to fracturing via plug-and-perf.
2. **Open hole with external packers and sleeves** — *"Some horizontal
   completions today are completed with an open hole system below an
   intermediate casing string. These wells have external casing packers that
   form a seal between the production casing and the formation. They also have
   hydraulic or ball drop actuated sliding sleeves to open successive sleeves to
   perform multiple fracture stimulations without the need to rig up wire line
   and set plugs and perforate new intervals. **Perforating is not required**"*
   `[EPA-PERF]` p.27.
3. **Sand control** — *"A sand-control method used to prevent production of
   formation sand. In gravel pack operations, a steel screen is placed in the
   wellbore and the surrounding annulus packed with prepared gravel of a specific
   size designed to prevent the passage of formation sand"* `[SLB-GP]`
   (https://glossary.slb.com/en/terms/g/gravel_pack). Also **slotted liner**,
   which `[SUPPLHI]` files as its own category (28.04.07S).

**The choice that defines a workover** is already in `01-oil-gas.md` §A.3.14 and
restated as §2.1 above: slickline → coiled tubing → snubbing → kill and pull.
The through-tubing routes *"save considerable time and expense"* `[SLB-WO]`;
snubbing *"requires a larger rigup than for coiled tubing and the pipe [is] more
rigid"* `[WP-WI]`.

### 4.2 The equipment, at taxonomy level

| Category | Named tool types | Source |
|---|---|---|
| **Workover / intervention unit** | workover rig (mast unit over an existing wellhead); hydraulic workover / snubbing unit; **Intervention & Completion Units (ICU)** is a real category | `[SUPPLHI]` 28.01.07G; `[SLB-SNUB]` |
| **Wellhead & tree** | christmas tree — *"an arrangement of isolation valves, pressure gauges and possibly chokes installed at the top of a well to control the flow of oil and gas"* `[DICT]` p.1079; tubing hanger; wellhead spools | `01-oil-gas.md` §A.3.14; `[SUPPLHI]` **Wellhead Equipment 28.06.02S** |
| **Completion string** | production tubing; packer (permanent / retrievable); nipples and landing profiles; sliding sleeve; safety valve | `[SLB-PK]`; `[EPA-PERF]` p.27 for sleeves |
| **Sand control** | screen, gravel, slotted liner | `[SLB-GP]`; `[SUPPLHI]` 28.04.07S |
| **Isolation** | bridge plug; frac plug; retainer — `[SUPPLHI]` files **Bridge and Isolating Plug 28.02.26G** | `[SUPPLHI]` |
| **Fishing** | overshot, spear, jars, mills — `[SUPPLHI]` files **Fishing Tools 28.04.02G** and **Drilling Mills 28.05.04G** (*"a smaller type of drilling bits"*) | `[SUPPLHI]` |
| **Fluids** (Consumable) | kill fluid; completion brine; workover fluid | `[SLB-KILL]`, `[SLB-FD]` |
| **Plug & abandonment** | a distinct category in its own right | `[SUPPLHI]` **28.01.06G** |

**Note for `DOMAIN.md` §3 group D:** the taxonomy's *Wellhead & Completion*
family already covers the tree, hanger and packer. Bridge plugs, fishing tools
and mills have no home in group D and would sit naturally under it. This is a
gap in the game's shop tree, not in the platform — flagged, not applied.

### 4.3 The crew

`01-oil-gas.md` §A.3.14 has the pay anchors (BLS 47-5013 median USD 55 750/yr ≈
€48 000, 90th pct USD 87 350 ≈ €75 200; fishing tool supervisor USD 800–1 800/day
≈ €690–1 550) and the tickets (IADC WellSharp **Well Servicing – Workover** or
**Snubbing**; IWCF **Well Intervention Pressure Control**). Not repeated.

The addition worth making: **a workover floor uses the drilling floor's
vocabulary and the drilling floor's people.** Slips, elevators, tongs, a
derrickhand. So in `PLATFORM_TRUTH.md` Part B career terms this is the one
service-track job a **contractor-track** player can walk into without retraining
— except for the ticket. **IADC WellSharp lists Well Servicing certifications
separately from the drilling ones** `[IADC-WS]`, and IWCF runs a separate **Well
Intervention Pressure Control** programme alongside Drilling Well Control
`[IWCF]`. *That the drilling ticket does not cover intervention is an
**INFERENCE** from the existence of two separate programmes* — but it is the kind
of inference the game can safely dramatise as a certification gate, because the
two certificates demonstrably exist and are distinct.

### 4.4 ADVANCE / WORK / PROTECT

**The honest answer first: workover is not a control loop.** It is a sequence of
the other six plus pipe handling, and §1 recommends shipping it as a contract
type. If a HUD is nonetheless wanted for the *pipe-handling* phase, the mapping
that does not lie is:

| | **ADVANCE** | **WORK** | **PROTECT** |
|---|---|---|---|
| Snubbing / stripping | **snub force** — pushing pipe in against pressure | **rate of pipe movement** (joints per hour) | **the surface barrier stack**, and **the kill-fluid column** if the well is dead |
| Unit | kN | joints/h | bar of wellhead pressure held; kg/m³ of kill fluid |

The force balance is sourced and it is genuinely interesting: *"pressure in the
wellbore acting on the cross-sectional area of the tubular can exert sufficient
force to overcome the weight of the drillstring, so the string must be pushed
(or 'snubbed') back into the wellbore"* `[SLB-SNUB]`. **There is a crossover
depth** at which enough pipe is in the hole that its weight exceeds the pressure
force and the string starts falling in rather than being pushed. Above it you
snub; below it you strip. *That crossover exists is entailed by the definition;
computing where it falls for a given pipe and pressure is arithmetic, not a
claim.* It is a clean, real, teachable moment.

### 4.5 What the job is scored on

**Production restored, per euro and per day of lost production.** Not metres, not
even hours on the floor.

| Axis | Note |
|---|---|
| **Post-job production rate vs pre-job** | the only number the operator cares about |
| **Deferred production** | a killed well produces nothing for the whole job; the through-tubing routes exist to avoid exactly this `[SLB-WO]` |
| **Well integrity at handover** | tubing tested, packer set and tested, tree functioned |
| **Reservoir condition** | did you damage it getting in — §4.6 |
| **Nothing left in the hole** | a dropped tool turns a workover into a fishing job, and `01-oil-gas.md` §A.3.14 already prices the fishing tool supervisor at €690–1 550/day precisely as the right economic signal |

### 4.6 The characteristic failure, and the instrument that lies

**The characteristic failure is that the well never comes back.**

You killed it, pulled the tubing, did everything right, ran new tubing, tested
it, opened it up — and it makes 40 % of what it used to. The mechanism is
**formation damage**:

> *"Alteration of the far-field or virgin characteristics of a producing
> formation"*, reducing *"the natural capability of a reservoir to produce its
> fluids, such as a decrease in porosity or permeability, or both."* Mechanisms
> include *"physical plugging of pores by mud solids"*, *"clay swelling in pore
> spaces"*, *"precipitation of insoluble materials in pore spaces"* and
> *"migration of fines into pore throats"*. Induced damage can result from
> *"external operations and fluids in the well, such as drilling, well
> completion, workover operations or stimulation treatments."*
> `[SLB-FD]` (https://glossary.slb.com/en/terms/f/formation_damage)

**The instrument that lies is the whole rig floor.** Every gauge a workover crew
has says the job succeeded: the well went dead and stayed dead, the tubing
pressure-tested, the packer set, the tree functioned. All of those are real
measurements of real things. **None of them measures the reservoir**, and the
reservoir is the only thing the job was for. The truth arrives days later on a
flowback rate.

*Design note.* This is a different **kind** of lie from the pile's brooming toe.
The pile's gauge is actively wrong. Here every gauge is correct and the crew is
measuring the wrong system. Both are worth teaching; this one is the subtler and
it belongs to the contract-board layer rather than the slider layer — the player
who chose "kill it and pull it" over "try coiled tubing first" made the mistake
an hour of game time before any gauge was read.

**Second, sharper lie — a static well is not necessarily a dead well.** A column
of kill fluid showing zero surface pressure reads as safe. It can read that way
because the well is quietly losing that column to the formation, and it will
flow the moment the losses cure or the level drops on a trip. `[SLB-KILL]` gives
what killing is; `[SLB-LC]` gives what losses are; **the combination is
INFERENCE** — but it is the same underbalance-on-a-trip logic that
`01-oil-gas.md` §D.1 already sources for drilling kicks, so the game already owns
the mechanism and only needs to re-skin it.

**A quantified case exists but is not usable.** A documented workover in which a
conventional water-base kill fluid reduced the well's productivity index by
**72 %** was found only in patent background text during this research. **NOT
SOURCED** to a citable primary — §14. Ship the mechanism, not the number.

### 4.7 Offshore specifics

- **Completion and flowback have a visible offshore signature the game should
  use.** The IADC standard equipment list has a whole section for it —
  **Section I, Production Test Equipment: Burners · Burner Booms · Lines
  Required on Burner Booms · Sprinkler System · Fixed Piping for Well Testing**
  `[IADC-JU]` contents and §I. A flare on a boom out over the sea, with a water
  curtain protecting the structure behind it, at night, is the single best image
  offshore completion offers and it is fully sourced as standard equipment.
- **On a subsea well the tree is on the seabed**, which is what creates the
  entire riserless-intervention industry in §5.7 and §6.7.
- **Rig type genuinely gates the work.** A platform rig or a jack-up sits over a
  dry tree at surface. A semi or drillship works a subsea tree through a riser
  or through a subsea lubricator. `01-oil-gas.md` §A.3.15 already establishes
  this axis and notes that IADC WellSharp mirrors it with separate **Surface
  Stack** and **Subsea Stack** well-control certifications `[IADC-WS]` — the best
  progression gate in the pack, and it applies to intervention as much as to
  drilling.
- **Rotation and certs** as §3.7.

---

## 5. COIL TUBING

*(The recommended build — see §1.)*

### 5.1 What the job actually is

Running a continuous, un-jointed steel pipe off a reel into a well — usually a
live one — pushing it to depth with a chain-drive injector, and pumping through
it while it moves.

`01-oil-gas.md` §A.3.13 has the SLB definition and the size and length ranges
(**1 in to 4½ in / 25–114 mm**; **2 000–15 000 ft / 600–4 600 m or greater**),
plus the two properties that are the entire point: it can operate *"safely under
live well conditions, with a continuous string"* and can pump *"fluids at any
time regardless of the position or direction of travel"* `[SLB-CT]`. Not repeated.

**What it is used for** (`[SLB-CT]`, `[WP-WI]` via `01-oil-gas.md` §A.3.13):
circulating and chemical washes · wellbore cleanouts · milling (plugs, scale,
fill) · fishing · and **conveying logging or perforating tools into a deviated
well where gravity will not carry a wireline tool down.** That last one is why
building CT first unlocks §6 and §7 as content.

**Two things make it a game rather than a winch.**

**(a) The pipe fights back.** Push a slender pipe into a hole and past a certain
compressive load it does not stay straight. It goes through three regimes:

> *"A certain load is reached at which the CT begins to form a helix inside of
> the casing. This load is referred to as the 'helical buckling load'… Helical
> buckling itself does not prevent the CT from going further into the well.
> However, as the helix is pushed into the casing there are additional wall
> contact forces due to the helix. These wall contact forces increase the
> friction with the wall of the casing."* `[CTES-TFM]` p.10

Before that comes sinusoidal buckling, and the source is unusually blunt about
how little it matters:

> *"there is nothing 'critical' about this type of buckling. It does not prevent
> the CT from moving further into the well. The period of the sine wave is very
> large (usually 30 to 100 ft [9–30 m]), and of course its amplitude is no
> greater than the ID of the casing. Thus the bending that is occurring is
> trivial."* `[CTES-TFM]` p.9

Then it stops:

> *"These wall contact forces increase faster than the rate of increase of the
> axial load and eventually a 'vicious circle' is created in which the additional
> axial force required to overcome friction increases faster than the applied
> axial load. This point is referred to as 'helical lockup.' **It is not possible
> to push the CT further into the casing once helical lockup is reached, no
> matter how much axial load is applied.**"* `[CTES-TFM]` p.10

Corroborated independently: a US-government-hosted engineering model report
carries a section **2.8 "Helical Frictional Force and Lockup"** `[BSEE-CT]`.

Two refinements that are directly playable:
- **Curvature cuts both ways.** *"the axial load required to cause the CT to pop
  out of the seat and form a helix is much greater than the helical buckling load
  for a straight hole… Thus it could be argued that curvature in the well is
  beneficial. However, the belt effect caused by the curvature increases the
  friction. In most cases CT can be pushed further into a straight hole than into
  a curved hole."* `[CTES-TFM]` p.11
- **The reel has already bent your pipe.** *"the bending that occurs to the CT at
  the reel and at the guide arch causes residual stresses in the CT material,
  which causes the CT to be bent when not in tension. This 'residual bend' causes
  lockup to occur more quickly."* Modelled by raising the friction coefficient
  **from a typical 0.2 to 0.3 for running in hole only** `[CTES-TFM]` p.11.
  **A worn string does not just risk breaking — it does not reach as far.**

**(b) The pipe is being consumed at surface while you work.** See §5.6.

### 5.2 The equipment, at taxonomy level

The spread, which `01-oil-gas.md` §A.3.13 flagged as *partially UNVERIFIED*.
**It is now sourced.**

| Category | What it is | Source |
|---|---|---|
| **Coiled tubing unit** (Service / Rental) | *"a control cabin, coiled tubing reel and coiled tubing, injector head, gooseneck, power pack, and well control components"*. `[SUPPLHI]` files **Coiled Tubing Unit 28.02.11G** and **28.06.10S** (rental) | `[SLB-IH]` (https://glossary.slb.com/en/terms/i/injector_head); `[SUPPLHI]` |
| **Injector head** | *"one of the principal equipment components of a coiled tubing unit"*, incorporating *"special profiled chain assemblies to grip the coiled tubing string"* and *"a hydraulic drive system that provides the tractive effort for running and retrieving the string from the wellbore."* `[SUPPLHI]` files **Injection Head 28.02.05G** | `[SLB-IH]`; `[SUPPLHI]` |
| **Gooseneck (tubing guide arch)** | mounted on top of the injector, *"feeds the tubing string from the reel around a controlled radius into the injector head."* Bend radii **1 372–2 490 mm (54–98 in) depending on tubing diameter** | `[SLB-IH]`; `[DM-CTIH]` |
| **Stripper / packoff** | below the injector, *"contains rubber pack-off elements providing a seal around the tubing to isolate the well's pressure"* — the primary dynamic barrier | `[DM-CTIH]` |
| **CT BOP stack** | beneath the stripper; **well control components** named as part of the unit | `[SLB-IH]`; `01-oil-gas.md` §A.3.13 |
| **Reel** | stores the string; **all fatigue damage happens here and at the gooseneck** | `[FET-CT]` |
| **Downhole tools** (Attachment Tool) | jetting nozzles, mills, fishing tools, motors, connectors. `[SUPPLHI]` files **Coiled Tubing [tools] 28.02.21G** separately from the unit | `[SUPPLHI]` |
| **Nitrogen unit** | for gas lifting / kickoff after a job | `[SUPPLHI]` **28.06.11S** |
| **The pipe itself** (Consumable) | manufactured to **API Spec 5ST**, grades **CT70–CT110** by specified minimum yield strength (70 000–110 000 psi ≈ 483–758 MPa) | `[FET-CT]` |

**Sourced capability numbers for the shop screen:**
- Injector maximum upward pull or downward thrust: **18 150–27 215 kg
  (40 000–60 000 lb)** `[DM-CTIH]`. A worked example on one unit at 207 bar
  hydraulic supply: low gear **17 690 kg (39 000 lb)**, high gear **9 980 kg
  (22 000 lb)** `[DM-CTIH]` — *a real two-speed trade-off: force or speed.*
- Typical North American intervention strings **2 in–2⅞ in (51–73 mm) OD**, wall
  tapered *"from roughly 0.125 in. to 0.250 in."* (3.2–6.4 mm) `[FET-CT]`.
  **CT80–CT100 most common in intervention service** `[FET-CT]`.
  *(`[FET-CT]` is a manufacturer's technical wiki; the API 5ST designation is a
  standard, but the "most common" and size-range statements are that
  manufacturer's characterisation of the market. Flagged, not laundered.)*
- The weight indicator is a **load cell on the injector subframe**, which pivots
  under the drive and tubing loads; *"Compression of the load cell due to
  increased tubing load or overpull on the tubing by the injector will pressurize
  the fluid within it."* And — importantly for §5.6 — **improper gooseneck
  positioning "may cause inaccurate weight readings"** `[DM-CTIH]`.

### 5.3 The crew

`01-oil-gas.md` §A.3.13 has the day rates (onshore €265–480 across three tiers,
`[RZ-CT]`; offshore premium stated but unquantified) and the tickets
(IADC WellSharp **Well Servicing – Coiled Tubing** `[IADC-WS]`, or IWCF **Well
Intervention Pressure Control** `[IWCF]`). Not repeated.

Career mapping to `PLATFORM_TRUTH.md` Part B: the ladder in `01-oil-gas.md` §A.7
already draws **CT operator → CT supervisor** on the service track. The natural
game extension, consistent with §A.0's three chains, is
**CT operator → CT supervisor → field service manager**, with a lateral into
**well intervention specialist** for subsea work (§5.7). Rotation patterns:
onshore CT is typically call-out work, which maps to Talent's **Ad hoc /
call-out** pattern; offshore it is a standard hitch. *(The onshore call-out
characterisation is **INFERENCE** from the job's nature; `[RZ-CT]` does not state
a rotation.)*

### 5.4 ADVANCE / WORK / PROTECT

**This is the cleanest mapping of any of the seven.**

| | **ADVANCE** | **WORK** | **PROTECT** |
|---|---|---|---|
| **What it is** | **Injector force / run speed** — how hard you push the string in (or pull it out) | **What the tool is doing** — pump rate through the string; jetting or milling intensity; motor speed | **The barrier stack + the fatigue budget** — stripper and CT BOP holding wellhead pressure, and the string life you are spending |
| **Unit on screen** | kN of set-down or overpull; m/min | m³/min of pump rate; Nm at a mill | bar of wellhead pressure held; **% of string fatigue life consumed** |
| **Low end fails by** | you never reach depth | tool does nothing; cuttings not lifted | — (there is no "too little" on a barrier; you either have it or you have lost it) |
| **High end fails by** | **buckling → helical lockup** `[CTES-TFM]`; and beyond that, yielding the pipe at surface | over-pressure the string; wash out the tool; stick the string in its own debris | **you cannot turn PROTECT up.** Fatigue only goes one way `[FET-CT]` |

**Why this is the right shape.** ADVANCE has a hard ceiling that is not the
ground and not the machine — it is the pipe's own geometry, and it moves with the
well's curvature and with how worn the string is `[CTES-TFM]` p.11. WORK is
genuinely independent of ADVANCE, which no drilling method manages: **you can
pump at full rate while stationary, while running in, or while pulling out**
`[SLB-CT]`. And PROTECT is the game's first **monotonic budget** — a resource
that is only ever spent.

**Coupling, in the sense `GAMEDESIGN.md` §7 requires.** The piling hammer's power
hyperbola has a direct CT analogue and it is sourced: the injector's two gears
trade force against speed — **17 690 kg in low, 9 980 kg in high** on the worked
example `[DM-CTIH]`. You cannot have maximum push and maximum speed. **And a
second coupling that is unique to CT: running with internal pressure up is
faster and does more work, and internal pressure is one of the parameters that
most shortens fatigue life** — *"The bending radius, the CT OD and the internal
pressure are the sensitive parameters that affect the fatigue life"* `[FET-CT]`,
whose recommended practice includes *"cycling at reduced internal pressure where
the program allows."* **Going gently is a purchasable choice with a visible price.**

### 5.5 What the job is scored on

| Axis | What it means |
|---|---|
| **Did you reach target depth?** | the primary binary. Lockup short of target is a failed job even with a perfect string |
| **Did the intervention work?** | fill removed, plug milled, fish recovered, chemical placed |
| **Fatigue spent** | % of string life consumed for this job — the real cost, and it is charged whether or not you reached depth |
| **Well control maintained** | zero loss of the surface barrier |
| **String returned intact** | a parted string is a fishing job on top of a failed job |
| **Time on location** | the day-rate clock |

**A CT job's grade should be a ratio: value delivered ÷ string life spent.**
That is the honest professional metric and it is not a distance.

### 5.6 The characteristic failure, and the instrument that lies

**Two failures, and the game should teach both.**

**Failure 1 — LOCKUP. The string stops going in and no amount of pushing helps.**

**The instrument that lies is the injector weight indicator, and the source
defines lockup in exactly those terms:**

> *"lockup is now defined to occur when a large increase in set down weight
> causes only a very small increase in force at the end of the tool (downhole
> force)."* `[CTES-TFM]` p.10

The engineering measure is the **weight transfer**, the slope dF/dW of downhole
force against set-down weight; *"If the weight transfer is less than an
arbitrarily designated percentage, then the CT is considered to be locked up"*
`[CTES-TFM]` p.11.

**Put that on a HUD and it plays itself.** The player pushes. The weight gauge
climbs smoothly and convincingly — it is a real load cell measuring a real force
`[DM-CTIH]`. The depth counter slows, then stops. Every instinct says push
harder, and pushing harder is precisely what makes it worse, because the extra
load generates extra wall contact force which generates extra friction — the
source's own *"vicious circle"* `[CTES-TFM]` p.10.

**The honest gauge, and the game must provide one:** the **weight-transfer
ratio** — how much of what you add at surface is arriving at the tool. Displayed
as a second needle that quietly falls away from the first, it is the coil-tubing
equivalent of piling's depth-into-bearing-stratum counter: unglamorous,
ignorable, and the only thing telling the truth.

**And the correct response is not more force.** From the sourced physics, the
things that actually help are: reduce friction (fresher string with less residual
bend `[CTES-TFM]` p.11), change the well path you are working (straight beats
curved, *"in most cases"* `[CTES-TFM]` p.11), or pump — because circulating
changes the drag picture. **Buying a heavier-wall or larger-OD string raises the
buckling load and buys reach.** That is a genuine, sourced, iMarket purchase
decision with a mechanically legible payoff.

**Failure 2 — FATIGUE. The string parts, and the damage was done at surface.**

> *"Each trip plastically bends and straightens the string at the reel,
> gooseneck, and injector chains."* `[FET-CT]`
> *"All the fatigue damages occur on the equipment above the wellhead, not in the
> well."* `[FET-CT]`

Per stroke: **one bending–straightening cycle at the reel and two at the
gooseneck**; per complete trip downhole, **two complete cycles at the gooseneck
and one at the drum**. *(This cycle count is well established in the CT
literature and was returned consistently across sources; the specific phrasing
above comes from a search summary of the CT fatigue literature rather than a
document fetched in full — **treat the exact cycle count as INDICATIVE**, §14.
What is fetched and solid is `[FET-CT]`'s statement that each trip bends and
straightens the string at three places and that all fatigue damage is at surface.)*

**This is the second lie, and it is the piling lie exactly.** There is **no
gauge at all** for the thing that is going to kill you. The string looks
identical on cycle 3 and cycle 300. The industry's answer is bookkeeping and
inspection:

> *"cumulative low-cycle fatigue"* is tracked *"using specialized software that
> analyzes job data including pressures, running speeds, and depths cycled"*, and
> strings are retired against measured criteria: *"remaining wall thickness (UT),
> diameter growth/ballooning, ovality, mechanical damage, and corrosion."*
> `[FET-CT]`
> Practices include *"rotating the working end via periodic cut-offs, re-heading
> after weak-point events, cycling at reduced internal pressure where the program
> allows, and full-length inspection between deployments."* `[FET-CT]`

**Every one of those is a purchasable game action.** Cut off the working end —
you lose length (and therefore reach) but reset the most-cycled metres. Inspect
between jobs — costs a day, reveals ovality and wall loss. Run at reduced
pressure — slower job, longer string life. **A whole maintenance economy, sourced
end to end, that behaves nothing like changing a drill bit.**

**Third, smaller lie worth including:** the weight indicator's accuracy depends
on the gooseneck being rigged correctly — improper positioning *"may cause
inaccurate weight readings"* `[DM-CTIH]`. A rig-up mistake at 06:00 corrupts
every number for the rest of the day. That is a nice, cheap, one-line hazard.

### 5.7 Offshore specifics

- **Coiled tubing is the boundary of riserless intervention.** RLWI performs
  *"nearly 70% of intervention operations"*, primarily by wireline — but
  *"coiled tubing remains necessary for more intensive through-tubing problems in
  wells, such as fluid circulation"* `[DC-RLWI]`. So offshore, **CT is what you
  escalate to when wireline is not enough**, and that escalation changes the
  vessel.
- **Vessels, not only rigs.** A monohull MODU-classed intervention vessel is
  named in `[DC-RLWI]`; a later-generation system carries **dual 2⅜ in (60 mm)
  coiled tubing downlines** and works in **water depths up to 2 000 m (6 500 ft)**
  `[OM-RLWI]`; another vessel is cited as serving *"subsea wells 9,800 ft
  [2 990 m] below the surface"* `[DC-RLWI]`.
- **The economics are the game mechanic.** *"cost reductions of up to 85% when
  compared to the same treatment performed from a rig"* `[OM-RLWI]`. A separate
  figure of **40–60 %** reduction versus full-scale drilling rigs appeared in
  search results but could **not** be traced to a fetched primary — **NOT
  SOURCED**, §14. **Use the sourced 85 % as a ceiling, not as a typical.**
- **A finding for the career system.** `PLATFORM_TRUTH.md` Part B's **Rig type**
  field has seven values — Jackup · Semi-submersible · Drillship · Platform ·
  Land · Tender-assisted · Barge. **A light well intervention vessel is none of
  them.** The platform models drilling units; well intervention runs off vessels
  that are not drilling units. **Flagged for the owner: either intervention
  contracts reuse "Drillship"/"Semi-submersible" loosely, or the game needs an
  eighth value it cannot source from the platform.** The honest option is to omit
  rig type on intervention contracts rather than to invent a value —
  `PLATFORM_TRUTH.md` Part C rule 6.
- **Certifications gate the seat as everywhere offshore** (BOSIET, HUET, FOET,
  OGUK/ENG1), plus **IADC WellSharp Well Servicing – Coiled Tubing** `[IADC-WS]`
  or IWCF Well Intervention Pressure Control `[IWCF]` for the job itself
  (`01-oil-gas.md` §A.3.13).

---

## 6. WIRELINE LOGGING

### 6.1 What the job actually is

Lowering a tool string into a well on a cable, and measuring on the way back up.

`01-oil-gas.md` §A.3.9 has the SLB definition and — critically — the distinction
the game must not get wrong: **slickline** = single-strand or braided wire,
mechanical work only; **electric line (e-line)** = a cable with electrical
conductors, which can log and can fire perforating guns `[SLB-WL]`, `[WP-WI]`.
It also has the run procedure (rig up sheaves over the well, run in, **log up at
a controlled line speed**), the grease injection requirement for braided line on
a live well, day rates and tickets. Not repeated.

**Two settings, and they are genuinely different jobs:**

- **Open hole** — logging the formation before casing goes in. The measurement is
  the product; the hazard is the hole itself (§6.6).
- **Cased hole** — logging through steel. This is where cement evaluation (§3.6),
  depth correlation for perforating (§7), and production logging live.

**The pressure-control stack, which is the same for logging and for perforating,
and which `[EPA-PERF]` describes better than any glossary:**

> *"Wire line pressure control equipment is run above the wellhead so that the
> perforating gun can be run in and out of the well when the well has pressure on
> it. This pressure equipment is commonly known as a **lubricator**. Lubricators
> are sized by ID and working pressure. This equipment consists of a **wellhead
> connection, the wire line blowout preventer (BOP), the riser and the control
> head**. It may also have full opening valves, pump in subs, tool catchers and
> other equipment in the run."* `[EPA-PERF]` p.27

> *"The **control head** is the uppermost point of the lubricator system where the
> wireline enters. Well pressure is controlled with **packing, pack-off rubbers,
> grease injection or a combination of all three**."* `[EPA-PERF]` p.27

> *"The **riser section** is used to allow the full wireline tool string to be
> raised above the wellhead valve before and after the operations."* — and its
> **length is proportionate to the length of the tool string** `[EPA-PERF]` p.20.

**That last line is a lovely, concrete, buildable constraint:** a longer tool
string needs a taller lubricator, and a taller lubricator is a bigger, heavier,
more expensive rig-up. **Tool string length is a purchase decision with a
physical consequence on the surface view.**

### 6.2 The equipment, at taxonomy level

| Category | Named tool types | Source |
|---|---|---|
| **Logging unit** (Service / Rental) | truck or cabin containing the **winch, depth wheel/measuring head and acquisition console**. `[SUPPLHI]` files **Wireline 28.02.15G** | `01-oil-gas.md` §A.3.9; `[SUPPLHI]` |
| **Cable** (Consumable) | slickline (single strand) · braided line · **electric line / e-line** (conductors) | `[SLB-WL]` |
| **Surface pressure control** | wellhead connection · **wireline BOP** · **riser / lubricator section** · **control head** with packing, pack-off rubbers and/or **grease injection flow tubes** · full-opening valves · tool catcher | `[EPA-PERF]` pp.17–20, 27 |
| **Rig-up hardware** | **upper sheave** and lower/floor sheave, hay pulley, tie-backs | `[EPA-PERF]` p.16; `01-oil-gas.md` §A.3.9 |
| **Cable head & weak point** | the connection between cable and tool string, containing a deliberately weakest link | §6.6 |
| **Tool string** (Attachment Tool) | **casing collar locator (CCL)** · **gamma ray** · weights/stem · centralizers/standoffs · the measurement sondes themselves (resistivity, density, neutron, acoustic) · sampling and mechanical tools | `[EPA-PERF]` pp.17, 21–22; `DOMAIN.md` §3 group D *Geophysical/Logging/Sampling* |
| **Cement evaluation** | **cement bond log** tool (amplitude + VDL); azimuthal cement evaluation tools giving *"detailed, 360° representations"* | `[SLB-CBL]` |

**Note:** `DOMAIN.md` §3 group D already contains *Exploration & Coring →
Geophysical/Logging/Sampling*, which is the closest existing home. The **surface
pressure-control stack has no home in the taxonomy** — flagged.

### 6.3 The crew

`01-oil-gas.md` §A.3.9 has the roles, the six-row day-rate table (logging
technician €225–500, wireline supervisor €515–1 120, **both explicitly land
figures with offshore not blended in**) and the tickets. Not repeated.

Two additions:
- **The career ladder is already drawn** in `01-oil-gas.md` §A.7:
  *wireline op → wireline supervisor → field service manager*, with a sideways
  route into **petrophysics on the operator side** — which is the only
  service-to-operator crossing in the whole oil & gas ladder that is about
  *interpretation* rather than management. Worth making an explicit unlock.
- **Perforating is done by the wireline crew** (`01-oil-gas.md` §A.3.12), so the
  explosives ticket sits on top of the wireline stack rather than beside it.

### 6.4 ADVANCE / WORK / PROTECT

**This is the mapping the brief warned about, and the honest answer is that the
model half-fits.**

The naive mapping collapses: on a logging pass, **line speed is simultaneously
ADVANCE and the thing that determines data quality**, so two of the three
controls become one number and the HUD carries a dead slider.

**The fix that is honest, and it is sourced.** Split the pass into the two things
the trade genuinely trades against each other — how fast the tool moves, and how
long each measurement integrates:

| | **ADVANCE** | **WORK** | **PROTECT** |
|---|---|---|---|
| **What it is** | **Line speed** — m/min, logging **up** | **Integration time** — the measurement's **time constant**, *"the time, in seconds, over which the pulses are averaged"* `[EPA-NUC]` | **Cable tension margin** and the surface barrier |
| **Unit on screen** | m/min | s (time constant) | kN of tension against the weak point's rating; bar held at the control head |
| **Low end fails by** | the job takes all day and costs the rig its day rate | too short: statistically noisy log | slack cable — the tool is sitting on something, or the cable is birdcaging |
| **High end fails by** | **the log is smooth, plausible and wrong** (§6.6) | too long: **thin beds are smeared and contacts are displaced** `[EPA-NUC]` | **you part the weak point** and leave the tool in the hole |

**Why the split is legitimate rather than a fudge.** The trade-off is stated
directly by a government source: *"The accuracy of measurement is greater at high
count rates and for a long measuring period"*, because *"Photon emission follows
a Poisson distribution; the standard deviation is equal to the square root of the
number of disintegrations recorded"* `[EPA-NUC]`. And the two controls interact
exactly as a good slider pair should: *"The logging speed, count rate being
measured, vertical resolution required, and equipment variations have a
significant effect on the selection of time constant"* `[EPA-NUC]`.

**But say the limitation out loud in the design doc:** on a *slickline*
mechanical run there is no measurement at all, so WORK genuinely has nothing to
do. For those runs the honest HUD is two controls, not three — and the game
should show two rather than invent a third.

### 6.5 What the job is scored on

**Log quality and depth fidelity. Not metres, and not even time.**

| Axis | Note |
|---|---|
| **Depth accuracy** | the whole job is worthless at the wrong depth — §6.6 |
| **Repeat section agreement** | the trade's own QC: log a short interval twice and see whether the two curves lie on top of each other. Directly entailed by the Poisson statistics `[EPA-NUC]` |
| **Statistical quality vs bed resolution** | did you log slow enough for the tool, and is the time constant right for the beds |
| **Complete coverage** | did you log the whole interval, or did the tool stop short |
| **Tool recovered** | see §6.6 |
| **Rig time consumed** | the rig is on rate for every minute you are rigged up |

**The best single scoring idea in this section:** score the player on the
**repeat section**, not on the main pass. It is what the industry actually does,
it is a second run that costs time, and it is the mechanic that teaches the
lesson — *you do not know your log is good until you have measured the same thing
twice.*

### 6.6 The characteristic failure, and the instrument that lies

**THE INSTRUMENT THAT LIES IS THE DEPTH.**

This is the cleanest example in the file, because the industry has built an
entire second measurement system purely because it does not trust the first one.

The depth on the panel comes from a wheel at surface counting cable. The cable is
elastic and stretches under its own weight, the tool's weight, buoyancy and
friction, all of which change continuously through the run. Corrections exist —
**magnetic marks placed at known intervals on the cable, detected downhole, with
tension measured continuously and stretch computed as a function of tension and
cable length in the hole**. *(That method and its components were returned
consistently across sources; the description here is from a search synthesis
rather than a document fetched in full — **treat the mechanism as INDICATIVE**,
§14.)*

**What is fully sourced is the trade's response**, and it is more telling than
any caveat: in cased hole the industry stops trusting the cable altogether and
re-references every single run to physical steel.

> A **perforating depth control log** is *"A wireline log run to provide a means
> of depth correlation by comparing the position of casing collars to the
> reference log (gamma ray log)."* A **short casing joint** is typically run near
> the zone of interest to serve as a positional marker.
> `[SLB-PDCL]` (https://glossary.slb.com/en/terms/p/perforating_depth_control_log)

> *"A cased hole gamma ray / casing collar locator log are run for correlation
> purposes to assist in perforating depth control. Short joints of casing are
> sometimes run to assist in the correlation. **The distance from the top shot of
> the gun to the casing collar locator is measured before running the perforating
> system in the well to ensure the perforations are placed where they were
> intended.**"* `[EPA-PERF]` p.21

Read that last sentence as a game designer. **Somebody stands on a deck with a
tape measure and writes a number down, because the electronics cannot be
trusted.** That is the most authentic thing in this research pack, and it is one
tape measure away from being a minigame.

Why gamma ray is the reference: *"The gamma ray log can be recorded in open holes
and cased wells making it an ideal log for correlating"*, and *"Nearly all gamma
radiation encountered in the earth is emitted by the radioactive potassium
isotope atomic weight 40 and by the radioactive elements of the uranium and
thorium series"* `[EPA-PERF]` p.22. **The rock's own radioactivity is the ruler.**

**THE SECOND LIE — LOG TOO FAST AND YOU GET A BEAUTIFUL, WRONG CURVE.**

This is the direct equivalent of the brooming pile toe, and a US government
source states it plainly:

> *"If the probe is moving too fast, or if the time constant is too long in
> thin-bedded materials, **the true value never will be recorded before the probe
> moves out of the layer of interest**."* `[EPA-NUC]`

And the beds move on the paper:

> **Lag** is *"the distance the detector moves during one time constant"*, and
> lithologic contacts on nuclear logs **shift by approximately this distance**
> when logging at faster speeds. `[EPA-NUC]`

**The log does not look broken.** It looks smooth — smoother, in fact, than a
correct one, because averaging over a long lag suppresses exactly the wiggles
that carry the information. **The player who logs fast to save rig time gets a
prettier curve, a shifted formation top, and a perforating depth that is wrong by
the lag.** The failure then propagates into §7 and shows up as production from
the wrong zone. *That is a two-method consequence chain from a single sourced
mechanism*, and it is the strongest argument for building wireline and
perforation together.

**THE CHARACTERISTIC MECHANICAL FAILURE — THE TOOL GETS STUCK.**

`[GEOX-STUCK]` gives the taxonomy:

- **Cable keyseating** — *"where the cable wears a slot in the formation which may
  then unleash a combination of sticking mechanisms, such as slot compression
  from borehole stress, slot swelling from reactive shales, mechanical binding
  from deep slots or **differential sticking if the slot is permeable**."*
- **Differential sticking** — *"may occur if the cable is in contact with
  mud-cake or permeable formation directly, or from loss zones."*
- Elevated risk in *"directional sections, weak-to-medium strength formations,
  loss zones, overbalanced sands, or fractured carbonates."*

*(The same page carries a specific vendor's product-effectiveness claim. It is
deliberately excluded per `PLATFORM_TRUTH.md` Part C rule 4.)*

Note that **differential sticking is the same mechanism `01-oil-gas.md` §D.3
already models for drill pipe** — overbalance pressing a body against a permeable
wall — so the game already owns the physics and only needs to apply it to a
cable. And `01-oil-gas.md` §D.9 already records the counter-intuitive correct
response: **pulling harder does not help, because force = ΔP × area and pulling
changes neither term.**

**And when it is truly stuck, the recovery is a designed failure.** The cable
head carries a **weak point** — a deliberately weakest link that parts at a known
tension, so the cable can be recovered and the tool left with a fishable top for
a pipe-conveyed fishing run. *(The weak-point principle was returned consistently
across sources but only from patent literature in this research; **treat the
concept as sourced and any specific tension rating as NOT SOURCED**, §14.
`[FET-CT]`'s reference to *"re-heading after weak-point events"* independently
confirms that weak-point events are routine industry vocabulary.)*

**Design note.** A deliberate, rated, designed-to-break component is a beautiful
thing to put in a game about tools, and it is the exact opposite of every other
consumable in the shop: **you buy it hoping it is the thing that fails.**

### 6.7 Offshore specifics

- **Wireline is the workhorse of subsea intervention.** RLWI *"performs nearly
  70% of intervention operations"*, primarily by wireline conveyance
  `[DC-RLWI]`. *"When accessing the well through the deepwater RLWI stack, all
  kinds of wireline and slickline operations can be performed, enabling full well
  diagnostics, mechanical intervention"* `[OM-RLWI]`.
- **The stack goes to the seabed.** On a subsea well the lubricator function is
  performed by a subsea well-control package landed on the tree, not by a
  lubricator on a deck. This follows from `[DICT]` p.668 (floating rigs have
  their stack on the seabed) via `01-oil-gas.md` §A.3.15, and from `[OM-RLWI]`'s
  reference to a *"deepwater stack"*.
- **Water depth is a real gate**: RLWI to **2 000 m (6 500 ft)** on one system
  `[OM-RLWI]`; **9 800 ft (2 990 m)** cited for a vessel `[DC-RLWI]`. Both sit in
  `PLATFORM_TRUTH.md` Part B's **deepwater (1 500–3 000 m)** band, and neither
  reaches ultra-deepwater — a genuine, sourced content gate.
- **Certifications:** the offshore stack for the seat, plus **IADC WellSharp
  Well Servicing – Wireline** `[IADC-WS]` or IWCF **Well Intervention Pressure
  Control** `[IWCF]` for the work (`01-oil-gas.md` §A.3.9); explosives handling
  additionally for perforating (§7.3).
- **The offshore day-rate caution in `01-oil-gas.md` §A.3.9 stands:** both
  Rigzone wireline sources state their figures are **land** figures with offshore
  not blended in. **Do not reuse them offshore.**

---

## 7. PERFORATION

### 7.1 What the job actually is

Firing shaped charges through the casing and the cement to connect the reservoir
to the well.

> *"The primary objective of a perforating gun is to provide effective flow
> communication between a cased wellbore and a productive reservoir. To achieve
> this, the perforating gun 'punches' a pattern of perforations through the
> casing and cement sheath and into the productive formation."* `[EPA-PERF]` p.2

**The physics, and the numbers are extraordinary:**

> *"An explosive device that utilizes a cavity-effect explosive reaction to
> generate a high-pressure, high-velocity jet that creates a perforation tunnel."*
> *"The shape of the explosive material and powdered metal lining determine the
> shape of the jet and performance characteristics of the charge."*
> *"The extremely high pressure and velocity of the jet cause materials, such as
> steel, cement and rock formations, to **flow plastically** around the jet path,
> thereby creating the perforation tunnel."* `[SLB-SC]`
> (https://glossary.slb.com/en/terms/s/shaped_charge)

> *"When detonated, the perf guns go off instantaneously. **The leading tip of the
> jet has a velocity of 25,000 to 30,000 ft/sec** [7 620–9 144 m/s]. **The impact
> pressure is approximately 10 to 15 million psi** [≈690 000–1 034 000 bar]. This
> pressure overcomes casing and formation strength and forces material radially
> away from the jet axis."* `[EPA-PERF]` p.8

**The rock does not shatter. It flows.** That is worth a line of in-game copy on
its own, and it is why the perforation tunnel has a damaged rim (§7.6).

**Conveyance** — three ways to get the gun to depth, already listed in
`01-oil-gas.md` §A.3.12: **e-line wireline**, **tubing**, or **coiled tubing**.
The tubing route has its own name and its own reason:
> **Tubing-conveyed perforating** = *"The use of tubing, drillpipe or coiled
> tubing to convey perforating guns to the required depth."* *"The subsequent
> popularity of highly deviated and horizontal wells increased the requirement
> for tubing-conveyed perforating as the only means of gaining access to the
> perforating depth."* `[SLB-TCP]`
> (https://glossary.slb.com/en/terms/t/tubing-conveyed_perforating)

**Underbalance.** Shooting into a well whose pressure is below the formation's
lets the formation surge back through the fresh tunnels. The definition is
sourced — *"The amount of pressure … exerted on a formation exposed in a wellbore
below the internal fluid pressure of that formation"* `[SLB-UB]`
(https://glossary.slb.com/en/terms/u/underbalance) — but **the specific claim
that underbalanced perforating cleans the tunnels of crushed rock and debris is
NOT SOURCED here** (§14). Ship underbalance as a *state* the player chooses; do
not print the cleaning claim as a fact until it is sourced.

### 7.2 The equipment, at taxonomy level

**The gun has exactly four parts** `[EPA-PERF]` p.6:
> *"A conveyance for the shaped charge · The individual shaped charge ·
> Detonating cord · Detonator"*

**Two carrier families, and the choice is real** `[EPA-PERF]` pp.14–15, 27:

| | **Hollow carrier gun** | **Expendable shaped charge gun** |
|---|---|---|
| Charges | in a heavy-wall tube | individually sealed, exposed |
| Sealing | *"Charges are sealed from wellbore fluid and pressure"* | *"The Detonator cord and detonator are exposed to wellbore fluids"* |
| Charge size | smaller for a given gun OD | *"Charges can be larger than the charges for the same diameter hollow carrier gun"* |
| Debris | *"Most of the debris from the charge remains in the carrier"* and is retrieved | *"Much of the debris is left in the well, falling into the rat hole on vertical wells"* |
| After firing | *"Detonation only slightly swells the gun but not enough to affect recovery from the well"* | gun is consumed |

**A perfect iMarket trade-off, sourced end to end:** bigger charge and lower cost,
against debris left in your well and a detonator exposed to well fluid.

**Explosives — and temperature is the selector** `[EPA-PERF]` p.7, p.26:

| Explosive | Temperature rating |
|---|---|
| **RDX** (cyclotrimethylene trinitramine) | *"Good to 330 degrees F"* (166 °C) |
| **HMX** (cyclotetramethylene trinitramine) | *"Good to 400 degrees F"* (204 °C) |
| **HNS** (hexanitrostilbene) | *"Good to 520 degrees F"* (271 °C) |

*"Each shaped charge will contain between **3 to 60 grams of explosives**"*
`[EPA-PERF]` p.7. **A deep, hot well forces you onto the expensive explosive.**
That is a sourced, non-obvious, entirely legitimate progression gate — and it
plugs straight into `PLATFORM_TRUTH.md` Part B's **HPHT** rig class.

**Gun performance parameters** `[EPA-PERF]` p.9, p.26:
- Hole diameter through casing: **0.23–0.72 in (5.8–18.3 mm)**
- Penetration: **6–48 in (152–1 219 mm)**
- Shot density: **4–12 shots per foot (≈13–39 shots per metre)**
- Phasing: *"Typically, perforating guns come with either 60, 90, 120, 180 or 0
  degrees phasing. **60 degrees is a common phasing for a well that will be
  hydraulically fractured.**"*
- **And the parameter nobody expects:** *"The length of the actual perforation
  downhole is a function of the **standoff** of the perforating gun from the
  casing. **Less standoff generally means a longer perforation tunnel**, while
  more standoff results in a shorter perforation tunnel."*

**Taxonomy placement:** `[SUPPLHI]` files **Perforating Gun 28.02.25G** as its
own equipment category, and **Bridge and Isolating Plug 28.02.26G** alongside it —
which is precisely the plug-and-perf pairing (§8.1). `DOMAIN.md` §3 group D has
no perforating family; flagged.

### 7.3 The crew

`01-oil-gas.md` §A.3.12 covers it: perforating is done by the wireline crew, so
the wireline bands in §A.3.9 apply; the additional gate is **explosives handling
and transport certification (jurisdiction-specific)** on top of the wireline
stack, with IADC WellSharp Well Servicing – Wireline covering the pressure-control
side `[IADC-WS]`. It also notes this is *"the one job on the rig that is
explicitly an explosives operation"*, carrying **radio-silence and rig-shutdown
procedures**. Not repeated.

**One addition worth making for the game.** The radio-silence procedure is a
gift: for a few minutes the entire installation stops, goes quiet, and everything
else waits. **In a game with a constantly running day-rate clock, a mandatory
silence is both a dramatic beat and a real cost** — and it is the only moment in
the oil & gas branch where the correct action is for everybody to do nothing.

### 7.4 ADVANCE / WORK / PROTECT

**The honest answer, as §2.3 states: at the moment of firing there are no
controls at all.** It is binary. Building a three-slider HUD for perforating
would be inventing a control loop the trade does not have.

**Everything the player decides happens before the trigger, and it decides the
outcome completely:**

| Decision | Made when | Sourced consequence |
|---|---|---|
| **Charge and explosive** | in the shop | temperature rating gates the well `[EPA-PERF]` p.7 |
| **Deep-penetrating vs big-hole** | in the shop | penetration 6–48 in vs entrance hole 0.23–0.72 in `[EPA-PERF]` p.9 |
| **Shot density and phasing** | job design | 4–12 spf; 60° common for a well to be fracced `[EPA-PERF]` pp.9, 26 |
| **Carrier type** | job design | debris retrieved vs left in the well `[EPA-PERF]` pp.14–15 |
| **Gun standoff / centralisation** | rig-up | *"Less standoff generally means a longer perforation tunnel"* `[EPA-PERF]` p.26 |
| **Conveyance** | job design | wireline, tubing or CT; TCP for deviated wells `[SLB-TCP]` |
| **Underbalance or overbalance** | before running | `[SLB-UB]` |
| **Depth correlation** | during the run | §7.6 — the whole job |

**So the recommendation is: perforating is a scored decision screen plus one
event, embedded in a wireline or CT run.** The three sliders during that run
belong to §6.4 or §5.4 and are already defined. Say this explicitly in the design
doc rather than forcing the model.

### 7.5 What the job is scored on

**Depth correlation, and flow connection. Never metres.**

| Axis | Note |
|---|---|
| **Shot on depth** | did the perforations land in the zone the geologist picked. Binary and unforgiving |
| **All guns fired** | a misfire leaves an unperforated interval and a live gun in the hole |
| **Effective tunnel length in the rock** | not the catalogue penetration — §7.6 |
| **Flow achieved** | the actual purpose: *"effective flow communication"* `[EPA-PERF]` p.2 |
| **Debris left** | carrier choice `[EPA-PERF]` p.15 |
| **Gun recovered** | swelling is stated as *"not enough to affect recovery"* for hollow carriers `[EPA-PERF]` p.14 — a stuck gun is the failure case |

### 7.6 The characteristic failure, and the instrument that lies

**THE INSTRUMENT THAT LIES IS THE PENETRATION NUMBER ON THE PRODUCT SHEET —
AND THIS IS THE BEST iMARKET LESSON IN THE ENTIRE FILE.**

Perforating charges are sold against a published penetration figure. That figure
comes from a standardised test, and **the standard has two different sections
that produce two different answers.**

> **API RP 19B**, *Recommended Practice for Evaluation of Well Perforators*,
> *"describes standard procedures for evaluating the performance of perforating
> equipment so that representations of this performance may be made to the
> industry under a standard practice."*
> **Section I:** *"Evaluation of Perforating Systems under Surface Conditions,
> **Concrete Targets**"*
> **Section II:** *"Evaluation of Perforating Systems using **Stressed Rock
> Targets**"*
> `[API-19B]`

`[EPA-PERF]` p.11 illustrates a Section 1 test rig: a gun firing through casing
into a **28-day concrete target** with a briquette test specimen and water. And
p.12 shows the result — three charges from one gun reading **25.5 in, 27.7 in and
38.5 in** (648, 704 and 978 mm) penetration. **A 51 % spread between the shortest
and the longest shot of the same gun in the same test.**

**Three separate reasons the catalogue number overstates the hole you will
actually get:**

1. **The target is unstressed concrete, not rock under overburden load.** That is
   the entire reason Section 2 exists as a separate section `[API-19B]`.
   Published comparisons report charges optimised for stressed rock
   outperforming concrete-optimised ones in rock, and state that a perforator
   optimised for concrete is unlikely to be optimised for rock. **Those specific
   percentage improvements could not be traced to a fetched primary source in
   this research and are NOT SOURCED** (§14). **Ship the direction of the effect,
   never a number.**
2. **The published table may be from an older standard entirely.** *"The API RP
   19B (replacing API RP 43 in September 2006) is the recognized standard for
   evaluating perforator performance. **However, many perforator performance
   tables are still published with the older API RP 43 test data given.**"*
   `[EPA-PERF]` p.27
3. **Your rig-up changes it.** *"Less standoff generally means a longer
   perforation tunnel"* `[EPA-PERF]` p.26 — so the same gun in larger casing, or
   uncentralised, under-performs its own sheet.

**This is a gift to a game built around a marketplace.** The listing shows a
number. The number is real, was honestly measured, and is not what you will get.
The game can print the number **with its test section next to it** — *"1 219 mm
(API RP 19B Sec. 1, concrete)"* — and let the player learn, over several
contracts, that Section 1 numbers and Section 2 numbers are different animals.
`PLATFORM_TRUTH.md` Part A's **AI cross-reference** upgrade has an obvious job
here: reveal the test basis behind a listing's headline figure.

**THE CHARACTERISTIC FAILURE IS SHOOTING THE WRONG DEPTH**, and it inherits
directly from §6.6. The depth on the wireline panel is not the depth of the gun,
which is why the entire correlation apparatus exists: the GR-CCL depth control
log against a reference gamma ray log, the short casing joint run as a marker,
and a tape measure from the top shot to the CCL before the gun goes in the hole
`[SLB-PDCL]`, `[EPA-PERF]` p.21.

**Get it wrong and there is no undo.** You have made permanent holes in the
casing at the wrong depth — possibly into the water leg, possibly above the
cement top, possibly across a casing collar. The remedy is a **squeeze**
`[SLB-SQ]` to seal them again, which is an expensive remedial cement job (§3.1)
followed by a second perforating run. **A single depth error costs two jobs and a
cement job.** That is the correct, real, brutal economic signal, and every piece
of it is sourced.

**A third, quieter lie: the crushed zone.** The jet makes the rock *"flow
plastically"* `[SLB-SC]`, which necessarily leaves damaged, low-permeability rock
lining the tunnel. So a tunnel of measured length is not a flow path of that
length. **The connection between crushed-zone damage and perforation skin is
standard petroleum-engineering doctrine but was NOT SOURCED to a fetchable
primary in this research** (§14) — flagged as the right *next* thing to source,
because it is the mechanism that makes "penetration" and "productivity" two
different scores.

### 7.7 Offshore specifics

- **Explosives on an offshore installation** carry transport, storage and
  handling regimes on top of everything else, plus the radio-silence and shutdown
  procedure (`01-oil-gas.md` §A.3.12). The precise certificates are
  jurisdiction-specific and remain **UNVERIFIED** there; that stands.
- **Subsea perforating goes with the RLWI stack** — e-line perforating is
  explicitly within the wireline scope RLWI performs `[OM-RLWI]`, `[DC-RLWI]`.
- **TCP is more likely offshore**, because offshore wells are more likely
  deviated and because a long interval can be shot in one trip; `[SLB-TCP]`
  states deviated and horizontal wells drove the requirement.
- **HPHT is the gate.** The explosive's temperature rating (330 / 400 / 520 °F =
  166 / 204 / 271 °C, `[EPA-PERF]` p.7) maps directly onto `PLATFORM_TRUTH.md`
  Part B's **HPHT** rig class. A player without high-temperature charges cannot
  take the HPHT contract — a clean, sourced *equipment* gate that mirrors the
  certification gate.

---

## 8. FRACTURING

### 8.1 What the job actually is

Pumping fluid into a reservoir fast enough and hard enough to split the rock, and
carrying sand into the split so that it stays open when you stop.

`01-oil-gas.md` §A.3.11 has the SLB definition, the proppant definition, the
statement that fracture wings *"extend away from the wellbore in opposing
directions according to the natural stresses within the formation"*, the outline
of the spread, the `[SUPPLHI]` categories, and the crucial framing that
fracturing is *"overwhelmingly a land operation in the shale plays"* and should be
*"an onshore regional specialisation, not an offshore rotation."* Not repeated.

**What this file adds: the treatment is a schedule, and the schedule is the game.**

A stage is pumped as a sequence, and the first element has a name and a
definition:
> **Pad** — *"A fluid used to initiate hydraulic fracturing that does not contain
> proppant."* `[SLB-PAD]` (https://glossary.slb.com/en/terms/p/pad)

The pad opens the fracture. Then proppant is introduced and its concentration is
**ramped upward** through the treatment, and finally the wellbore is flushed so
that no proppant is left inside the casing. *(The ramp-and-flush structure is
universal trade practice and is entailed by `[INTECH-SO]`'s wellbore-screenout
mechanism below, but **no first-party source stating the canonical pad → ramp →
flush schedule was fetched in this research** — treat the three-part structure as
**INFERENCE** and do not print stage percentages, §14.)*

**Plug and perf — how a modern horizontal well is completed, stage by stage.**
The sequence is: isolate what you already fracced with a plug, perforate the next
interval, frac it, repeat. `[SUPPLHI]` files both halves as adjacent equipment
categories — **Perforating Gun 28.02.25G** and **Bridge and Isolating Plug
28.02.26G**. The wireline toolstring carrying the plug and the guns is **pumped
down** the horizontal, because gravity will not take it there — the same problem
`[SLB-TCP]` identifies for perforating conveyance. *(The pumpdown technique and
the plug-and-perf sequence were returned consistently across sources but the
specific step-by-step wording could not be verified from a fetched primary —
**INDICATIVE**, §14.)*

**The alternative architecture is sourced, and it removes perforating entirely:**
> *"Some horizontal completions today are completed with an open hole system
> below an intermediate casing string. These wells have external casing packers
> that form a seal between the production casing and the formation. They also
> have hydraulic or ball drop actuated sliding sleeves to open successive sleeves
> to perform multiple fracture stimulations without the need to rig up wire line
> and set plugs and perforate new intervals. **Perforating is not required** to
> provide effective communication between the cased borehole and the productive
> formation with these types of systems."* `[EPA-PERF]` p.27

**That is a genuine strategic choice with a real trade-off**, and the trade-off is
also sourced from the same document (p.23–24: *"Port and Ball Drop System with
Open Hole Packers for Isolation"*): sleeves are faster because nothing has to be
rigged up between stages, but the number of stages is limited by the number of
distinct ball sizes available. Plug-and-perf has no such ceiling. **Speed against
stage count — a clean two-option contract decision.**

### 8.2 The equipment, at taxonomy level

The frac spread is the largest surface operation in the industry, and unlike
every other method in this game **there is no mast**.

| Category | What it is | Source |
|---|---|---|
| **Fracturing pumps** | banks of high-pressure reciprocating plunger pumps on trailers or skids | `[SUPPLHI]` **Fracturing Pumps 28.02.27G** |
| **Blender** | mixes proppant and chemicals into the base fluid to make slurry | `01-oil-gas.md` §A.3.11 |
| **Hydration unit** | prepares gelled base fluid before the blender | `01-oil-gas.md` §A.3.11 |
| **Manifold ("missile")** | gathers the pump discharges and channels them to the wellhead | `01-oil-gas.md` §A.3.11 |
| **Proppant storage & conveyors** | silos or boxes feeding the blender continuously | `01-oil-gas.md` §A.3.11 |
| **Chemical/additive units** | dosing skids | `01-oil-gas.md` §A.3.11 |
| **Wellhead isolation / frac stack** | protects the production wellhead from erosive slurry at pressure | **NOT SOURCED** to a fetched primary, §14 |
| **Data van** | the control room; pressure, rate and proppant concentration in real time | `01-oil-gas.md` §A.3.11 |
| **Proppant** (Consumable) | sand or engineered ceramic | `[SUPPLHI]` **Proppant 28.05.07G** |
| **Fracturing fluids** (Consumable) | *"viscous water-based fluids, non-viscous water-based fluids, gelled oil-based fluids, acid-based fluids, and foam fluids"* | `[SUPPLHI]` **Fracturing Fluids 28.05.08G**, and `[SUPPLHI]` p.2 for the five-family list |
| **Plugs** | bridge / frac / composite plugs for stage isolation | `[SUPPLHI]` **28.02.26G** |
| **Coiled tubing** | for milling plugs out afterwards, and for cleaning out a screen-out (§8.6) | §5; `[INTECH-SO]` |

**Pump class figures — flagged as indicative, not standard.** Trade-common frac
pump ratings cluster around **2 250–3 000 hydraulic horsepower per unit
(1.68–2.24 MW)** with maximum working pressures of **10 000–15 000 psi
(690–1 034 bar)**, in triplex or quintuplex plunger configurations. **These were
found only on vendor and industry-FAQ pages, not in a standard — treat as
INDICATIVE and do not print as a specification** (§14). The one part that is not
a claim is the identity **hydraulic horsepower = (psi × gpm) / 1714**, which is
arithmetic.

### 8.3 The crew

`01-oil-gas.md` §A.3.11 has it: pump operators at their units, the frac
supervisor and engineer in the **data van**; no sourced frac-crew day rate was
reachable and it is marked **UNVERIFIED** there, with **47-5013 Service Unit
Operators** as the nearest government anchor (median USD 55 750/yr ≈ €48 000
`[BLS-475013]`) — O\*NET explicitly lists *"Apply green technologies such as
coiled tubing or hydraulic fracturing"* as a task for that occupation
`[ONET-475013]`. Not repeated.

**Career mapping.** This is the one oil & gas job in the file with **no offshore
rotation at all** for most players — it is a land, pad-based, often local-crew
operation. In `PLATFORM_TRUTH.md` Part B's rotation vocabulary it maps to
**5/2 (onshore week)** or **6/3** rather than 14/14 or 21/21. *(That mapping is
**INFERENCE** from the operation being land-based; no source states frac crew
rotations.)* **That makes fracturing the natural "you can stay home" branch of
the oil & gas career**, which is a real and humane thing for the game to offer
alongside the helicopter.

### 8.4 ADVANCE / WORK / PROTECT

**This maps well, and the coupling is genuine.**

| | **ADVANCE** | **WORK** | **PROTECT** |
|---|---|---|---|
| **What it is** | **Pump rate** — how fast the treatment goes away | **Proppant concentration** — the ramp | **Pressure headroom** — surface treating pressure against the equipment's and the wellhead's limit, and the near-wellbore friction you are fighting |
| **Unit on screen** | m³/min (source unit bbl/min) | kg/m³ of slurry (source unit ppa/ppg) | bar, and bar of margin remaining |
| **Low end fails by** | too slow: the fracture does not stay open, proppant settles out of the fluid | too lean: you place no proppant and the fracture closes on nothing | — |
| **High end fails by** | exceeds pressure limit; can grow the fracture out of zone | **SCREEN-OUT** — *"proppant… create a bridge across the perforations"* causing *"a rapid rise in pump pressure"* `[SLB-SO]` | **you hit the pressure limit and must shut down mid-stage** |

**The coupling `GAMEDESIGN.md` §7 demands is real here and it is two-sided.**
Rate and concentration are not independent: pumping faster carries more proppant
safely, but pumping faster also raises friction pressure and eats the PROTECT
margin. Ramping concentration places more proppant per minute but moves you
toward bridging. **You cannot maximise both, and the limit is a pressure the
equipment physically cannot exceed.**

**Where the model does not fit, stated honestly (§2.3 item 4):** nothing the
player commands *advances into the ground.* The fracture goes where the earth's
stresses send it — `[SLB-HF]` via `01-oil-gas.md` §A.3.11. ADVANCE = pump rate is
honest; ADVANCE = "steering the fracture" would be a lie and the game must not
imply it.

### 8.5 What the job is scored on

**The treatment going away as designed. Nothing else.**

| Axis | Note |
|---|---|
| **Designed proppant placed** | the single number: kg of proppant into the formation vs kg in the design |
| **Stage completed at design rate** | did you hold the rate, or back off |
| **No premature screen-out** | §8.6 |
| **Stages completed** | on a plug-and-perf well, how many of the planned stages went away |
| **Pressure stayed inside limits** | equipment and wellhead integrity |
| **Cleanup** | proppant left in the wellbore is a CT cleanout job — a cost, not a footnote `[INTECH-SO]` |

**Note what is absent: depth, metres, and time.** A frac stage is scored on
*mass placed* and *stage integrity*. This is the furthest any method in the game
gets from a depth counter, and that alone is an argument for eventually building
it.

### 8.6 The characteristic failure, and the instrument that lies

**The characteristic failure is the SCREEN-OUT.**

> *"A condition that occurs when the solids carried in a treatment fluid, such as
> proppant in a fracture fluid, create a bridge across the perforations or similar
> restricted flow area."* … *"This creates a sudden and significant restriction to
> fluid flow that causes a rapid rise in pump pressure."* `[SLB-SO]`
> (https://glossary.slb.com/en/terms/s/screenout)

`[INTECH-SO]` gives the taxonomy, and the distinctions matter:

| Type | What happens |
|---|---|
| **Near-wellbore screenout** | *"High friction in the near-wellbore area prevents proppant passage"* — classified as the **primary cause** of screenouts |
| **Proppant bridging** | a *"proppant mound is formed near the wellbore"* in narrow fractures, particularly with linear fluids in shale |
| **Wellbore screenout (WSO)** | proppant accumulates below the perforations and then blocks the perforated interval entirely, causing pressure increases described as *"extremely rapid"* |
| **Tip screenout (TSO)** | occurs *"exclusively during fracpacks in high-permeability unconsolidated sandstone"* — **and it is intentional** |

**THE INSTRUMENT THAT LIES IS THE SURFACE TREATING PRESSURE, AND IT LIES IN THE
MOST INTERESTING WAY IN THIS ENTIRE FILE: THE SAME SIGNAL MEANS OPPOSITE THINGS.**

**Lie 1 — rising pressure is normal.** Proppant concentration is ramping through
the whole treatment, and more concentrated slurry has more friction. **The gauge
climbs because the job is going correctly.** A player who aborts on rising
pressure aborts good stages.

**Lie 2 — rising pressure is a screen-out.** *"a rapid rise in pump pressure"*
`[SLB-SO]` is the definitive signature of the failure. **The same needle, moving
the same way.**

**Lie 3 — and this is the one that makes it great — a screen-out can be the
objective.** A tip screenout in a fracpack is *"planned… where screenout is the
objective — if not achieved, operations repeat"* `[INTECH-SO]`. **On one contract
the player must avoid the thing that on another contract they are being paid to
cause.**

**The honest instrument is not at surface at all.** The diagnostic is **net
pressure at bottomhole conditions** — the Nolte–Smith log-log plot of net
fracturing pressure against time. Its slopes carry meaning: a **unit slope
represents a tip screenout**, a slope **steeper than unit** generally indicates a
premature near-wellbore screenout, and a shallow positive slope indicates a
confined, well-behaved fracture. And even this instrument has a stated blind
spot: it *"ignores near-wellbore friction and fracture tip dilatancy"*
`[INTECH-SO]`. *(The specific slope values were returned consistently across
sources including `[INTECH-SO]`'s discussion; **the numeric slope-to-mode mapping
should be treated as INDICATIVE** until read from Nolte & Smith's original paper,
§14.)*

**And there is a purchasable diagnostic the player can run before committing —
the step-down test:**
> The SDT executes *"four equal steps of 10–15 s. duration each"*, measuring
> pressure at decreasing flow rates to separate perforation friction from
> near-wellbore friction. The shape of the plot tells you which: *"concave
> upwards"* suggests **perforation-dominated** friction; *"concave sideways"*
> indicates **near-wellbore dominated**. `[INTECH-SO]`

**That is a complete, sourced, three-beat gameplay loop, exactly parallel to the
cement bond log run under pressure (§3.6):** an ambiguous signal, a cheap extra
test that costs time, and an unambiguous answer that tells you which remedy to
apply. **Perforation friction** says your perforations are too few or too small —
a §7 decision coming back to bite. **Near-wellbore friction** says the connection
between wellbore and fracture is tortuous — a different problem with a different
fix.

Real-time warning is possible but imperfect: an *"Inverse Slope method"* using
tangent lines on the surface pressure plot gives *"advance warning of imminent SO
events"* `[INTECH-SO]`. **Give the player that warning as a purchasable upgrade
and make it genuinely imperfect** — that is exactly what the source describes.

**The consequences are expensive and sourced** `[INTECH-SO]`:
- **Stuck proppant** — an incomplete treatment with proppant left in the wellbore.
- **Coiled tubing cleanout** — using *"gel for lifting the proppant incrementally
  in small amounts; which is a costly and time consuming"* process. **This is the
  direct link from §8 back to §5**, and it is the best argument for building coil
  tubing first: the frac's failure mode *is* a coiled tubing job.
- **Lost stage** — reduced well productivity for the life of the well.

### 8.7 Offshore specifics

- **Largely not applicable, and that is the finding.** `01-oil-gas.md` §A.3.11
  already establishes fracturing as an onshore shale operation and instructs the
  game to model it as a regional specialisation rather than an offshore rotation.
  **Do not put a frac spread on a North Sea jack-up.**
- **The offshore exception is the fracpack**, which `[INTECH-SO]` places in
  *"high-permeability unconsolidated sandstone"* — the sand-control setting of
  §4.1, which is characteristically offshore and deltaic. There the deliberate
  tip screenout is the objective, and the gravel-pack sense of "screenout" applies:
  *"A condition encountered during some gravel-pack operations whereby the
  treatment area cannot accept further pack sand and a sudden increase in
  treatment pressure occurs"*, where *"if screenout occurs early in the treatment,
  it may indicate an incomplete treatment and the presence of undesirable voids
  within the pack zone"* `[SLB-SO]`. **Even inside the deliberate version, timing
  separates success from failure** — a genuinely elegant, fully sourced mechanic.
- **The `PLATFORM_TRUTH.md` Part B fields that apply** are day rate and
  certification; **rig type, rig class and water depth do not apply** to a land
  frac spread. A contract board that always demands a rig type will be wrong here.
  **Flagged:** contracts need those fields to be optional.

---

## 9. DIRECTIONAL DRILLING AND MWD/LWD

### 9.1 What the job actually is

`01-oil-gas.md` covers this more thoroughly than any other topic in this file and
its coverage is not repeated: §B.4 has the well shape (vertical → kickoff → build
→ tangent → landing → lateral), the slide-vs-rotate table, toolface and its two
reference frames, rotary steerable systems, the MWD survey triplet, non-magnetic
collars, mud-pulse telemetry and the "no pumps, no data" consequence. §B.6.2 has
**dogleg severity fully sourced** with four bands (3–5 °/100 ft conventional;
casing wear above 5; 8–10 max for a bent-housing motor; up to 15 for high-DLS
RSS) plus the drill-pipe fatigue limit and the crucial rule that the allowable
dogleg is **lowest where tension is highest, i.e. near the kick-off point**. §E.1
already specifies TOOLFACE and SLIDE/ROTATE as contextual secondary controls.

**What this file adds is the machine, the cost of sliding, and the lie.**

**The bent housing, with a sourced range:**
> *"A bend in the motor bearing housing is key to steering the bit toward its
> target. **The surface-adjustable bend can be set between 0° and 3°.** This
> slight bend is sufficient for pointing the bit in a given direction yet is small
> enough to permit rotation of the entire mud motor assembly during rotary
> drilling. This seemingly minor deflection determines the rate at which the motor
> builds angle."* `[OFR-SLIDE]` p.50

The bend is **dialled in on the drill floor when the crew makes up the BHA**, and
a photograph in the source shows a housing set at **2.89°** with adjustment
positions at 2.38, 2.60, 2.77, 2.89 and 3.00° `[OFR-SLIDE]` p.50 Fig.1.
**By selecting a larger bend the driller obtains a curve of smaller radius**
`[OFR-SLIDE]` p.50. **That is a pre-job commitment you cannot change without
tripping** — the same shape of decision as cementing's centralisers (§3.4).

**The motor itself:**
> *"A mud motor is a type of positive displacement motor powered by drilling
> fluid. An eccentric helical rotor and stator assembly drive the mud motor. As it
> is pumped downhole, drilling fluid flows through the stator and turns the rotor.
> The mud motor converts hydraulic power to mechanical power to turn a drive shaft
> that causes the bit to rotate."* `[OFR-SLIDE]` pp.50–51

**A detail with a direct consequence for the game's cross-section renderer:**
> *"In rotating mode, the bit carves a straight path parallel to the axis of the
> drillstring… Because the bent housing forces the bit to tilt outward by a few
> degrees, **the bit drills a hole that is slightly larger than the diameter of
> the bit.** When the driller switches to sliding mode, only the bit rotates. The
> resulting hole is **in gauge** and follows the axis of the BHA below the bent
> housing."* `[OFR-SLIDE]` p.51 Fig.2

**The hole is a different diameter depending on which mode you were in.** The
cross-section can draw that, and it is true.

**And the price of steering, finally with a number:**
> *"Of the two modes, slide drilling is less efficient; lateral reach usually
> comes at the expense of penetration rate. **The rate of penetration achieved
> using conventional sliding methods typically averages 10% to 25% of that
> attained in rotating mode.**"* `[OFR-SLIDE]` p.51, citing Maidla & Haci,
> IADC/SPE 87162 (2004)

`01-oil-gas.md` §B.4 could only source the qualitative *"almost always slower and
therefore more expensive"* from `[WP-DD]`. **This is the number.** Sliding costs
you 75–90 % of your ROP. Put that in the game and the slide/rotate toggle becomes
one of the most expensive buttons on the screen.

**The orientation ritual before every slide is itself a gameplay beat:**
> *"To initiate a slide, the driller must first orient the bit… This requires the
> driller to **stop drilling, pull the bit off-bottom and reciprocate the
> drillpipe to release any torque that has built up within the drillstring.** The
> driller then orients the downhole mud motor using real-time MWD toolface
> measurements… Following this time-consuming orientation process, the driller
> sets the topdrive brake to prevent further rotation from the surface. The slide
> begins as the driller eases off the drawworks brake to control the hook load."*
> `[OFR-SLIDE]` p.52

### 9.2 The equipment, at taxonomy level

`DOMAIN.md` §3 group D **already has this family**: *Directional Drilling → Mud
Motors, MWD/LWD, Steering Tools, Survey Tools, Directional Subs.* It is the one
well-services area the taxonomy covers properly. Detail to hang on it:

| Category | Named tool types | Source |
|---|---|---|
| **Mud motor (PDM)** | power section (eccentric helical **rotor** in an elastomer **stator**), **bent housing** (surface-adjustable 0–3°), bearing section, drive shaft, wear pads | `[OFR-SLIDE]` pp.50–51 |
| **Rotary steerable system** | *"Allow directional control while rotating"* — the tool that removes the sliding penalty | `[WP-DD]` via `01-oil-gas.md` §B.4 |
| **MWD** | accelerometers, magnetometers, gyroscopes; mud-pulse telemetry; surface decoder | `[WP-DD]` via `01-oil-gas.md` §B.4 |
| **LWD** | resistivity, gamma, porosity — for geosteering | `01-oil-gas.md` §B.4 |
| **Non-magnetic drill collars** | *"made of special steel"* — the survey sub cannot read azimuth inside ordinary steel | `[WITTIG]` p.57 via `01-oil-gas.md` §B.4 |
| **BHA components** | `[SUPPLHI]` **Bottom Hole Assembly (BHA) and components 28.02.06G**, described as comprising *"subs such as bit Sub, Z-Over Sub, Floating Sub and lifting Sub, stabilizers, reamers, shocks and hole-openers"* | `[SUPPLHI]` p.2 |
| **Underreamers** | a separate category in its own right | `[SUPPLHI]` **28.02.22G** |
| **Heavy weight drill pipe** | the transition between collars and drill pipe | `[SUPPLHI]` **28.04.13G** |

### 9.3 The crew

Fully covered in `01-oil-gas.md` §A.3.4 (Directional Driller — day rates
€600–1 635, the DD shack, in from MWD hand or floorhand, out to senior DD →
directional coordinator) and §A.3.5 (MWD/LWD Engineer — €300–905, survey cadence
10–150 m with 30 m common while steering, OEM tool certification worth
+USD 20–120/day). Not repeated.

The one addition: `[OFR-SLIDE]` p.52 makes clear that **the driller, not the DD,
physically performs the slide** — the DD calls the toolface, the driller works
the drawworks brake and the topdrive brake. **Two people, two chains of command,
one hole**, which is `01-oil-gas.md` §A.0's framing made concrete. In the game
that is the argument for the DD being a *hired specialist whose advice you can
ignore* rather than a skill the player levels up.

### 9.4 ADVANCE / WORK / PROTECT

`01-oil-gas.md` §E.1 already sets the primary mapping for mud rotary (WOB / RPM /
mud weight–ECD) and adds TOOLFACE and SLIDE-ROTATE as contextual secondaries.
**This file's proposal is that in a directional section the three controls
re-label**, rather than gaining a fourth:

| | **ADVANCE** | **WORK** | **PROTECT** |
|---|---|---|---|
| **Rotating mode** | WOB | RPM (surface + motor) | mud weight / ECD |
| **Sliding mode** | **hook load slacked off** — *"the driller sets the topdrive brake… eases off the drawworks brake to control the hook load, which, in turn, affects the magnitude of weight imposed at the bit"* `[OFR-SLIDE]` p.52 | **TOOLFACE** — the clock. High side = build, low side = drop, left/right = turn `[SLB-TF]` via `01-oil-gas.md` §B.4 | **ECD, plus hole cleaning** — *"In sliding mode, hole cleaning is less efficient because there is no pipe rotation to facilitate turbulent flow"* `[OFR-SLIDE]` p.52 |

**Why this is honest.** In a slide the WORK control genuinely stops being "how
hard am I breaking rock" and becomes "where am I pointing" — the motor sets the
bit speed and the player cannot change it from surface. The slider does not go
dead; **it changes what it means**, which is exactly the design principle
`GAMEDESIGN.md` §7 already commits to ("only the labels, the units and the gauge
change").

**And PROTECT acquires a third failure mode that only exists while sliding**, and
it is sourced: cuttings *"accumulate on the low side of the hole in cuttings beds
that increase friction on the drillpipe, making it difficult to maintain constant
weight on bit"* `[OFR-SLIDE]` p.52. **The longer you slide, the harder sliding
becomes.** That is a self-worsening state, which is the best kind of hazard.

### 9.5 What the job is scored on

`01-oil-gas.md` §E.2 already establishes the industry's own scoring function
(cost per metre) and lists **straightness = DLS held inside the planned band**
as the grade axis this method owns. Additions:

| Axis | Note |
|---|---|
| **Position at TD vs the target** | the DD's actual job — did the well land in the box |
| **DLS inside the planned band** | already sourced with numbers in §B.6.2 |
| **Slide footage as a fraction of total** | every metre slid costs 75–90 % of ROP `[OFR-SLIDE]` p.51 — minimising slide while hitting the target is the whole craft |
| **Hole quality** | in-gauge vs overgauge, which follows directly from mode `[OFR-SLIDE]` p.51 |
| **Motor survived** | stalls damage the stator (§9.6) |
| **Survey coverage** | the cadence is the resolution `01-oil-gas.md` §B.4 |

### 9.6 The characteristic failure, and the instrument that lies

**THE INSTRUMENT THAT LIES IS THE SURFACE WEIGHT-ON-BIT GAUGE, AND THE SOURCE
SAYS SO IN TERMS A GAME CAN IMPLEMENT DIRECTLY.**

The mechanism first:
> *"The difference between the weight imposed at the bit and the amount of weight
> made available by easing the brake at the surface is **primarily caused by
> drag**. As the horizontal departure of a wellbore increases, so does the
> longitudinal drag of the drillpipe along the wellbore."* `[OFR-SLIDE]` p.52

> *"Controlling weight at the bit throughout the sliding mode is made even more
> difficult by **drillstring elasticity**, which permits the pipe to move
> nonproportionally. This elasticity can cause one segment of drillstring to move
> while other segments remain stationary or move at different velocities."*
> `[OFR-SLIDE]` p.52

And then the sentence that is worth the whole article:

> *"At the driller's console, **an impending stall might be indicated by an
> increase in WOB but with no corresponding upsurge in downhole pressure to signal
> that an increase in downhole WOB has actually occurred.** At some point, the WOB
> indicator will show an abrupt decrease, indicating a sudden transfer of force
> from the drillstring to the bit."* `[OFR-SLIDE]` p.52

**Read that as a HUD specification.** The WOB needle rises. The honest
instrument — **differential pressure across the motor** — does not. Then the WOB
needle drops suddenly, and by the time it does, the weight has already arrived at
the bit all at once. *"A sudden transfer of weight to the bit that exceeds the
downhole motor's capacity may cause bit rotation to abruptly halt and the motor to
stall. Frequent stalling can damage the stator component of the motor"*
`[OFR-SLIDE]` p.52. **The motor is an expensive consumable being destroyed by a
gauge that looked fine.**

And the source states the operating problem in one line: *"The driller must
operate the motor within a narrow load range to maintain an acceptable ROP
without stalling"* `[OFR-SLIDE]` p.52. **A narrow band on a gauge you cannot
trust, watched through a second gauge you have to learn to read.** That is the
game.

**THE SECOND LIE — THE TOOLFACE YOU SET IS NOT THE TOOLFACE YOU HAVE.**

> *"When weight is applied to the bit, torque at the bit increases… As weight is
> applied to the bit, **reactive torque, acting in the opposite direction, also
> develops.** This left-hand torque is transferred upward from the bit to the
> lower part of the drillstring. **Reactive torque builds as weight is increased,
> reaching its maximum value when the motor stalls. This reactive torque also
> affects the orientation of the motor.**"* `[OFR-SLIDE]` p.52

So the string winds up, and the bend rotates with it. The consequences:
> *"In practice, the driller can make **minor shifts in toolface orientation by
> changing downhole WOB**, which alters the reactive torque. To produce larger
> changes, the driller can lift the bit off-bottom and reorient the toolface."*
> *"Even after the specified toolface orientation is achieved, maintaining that
> orientation can be challenging. Longitudinal drag increases with lateral reach,
> and weight transfer to the bit becomes more erratic along the length of the
> horizontal section, thus **allowing reactive torque to build and consequently
> change the toolface angle**."* `[OFR-SLIDE]` p.52

**That is a beautiful control coupling for a game**: the ADVANCE slider silently
moves the WORK reading, and the deeper into the lateral you are, the more it
drifts. The player learns to steer with weight — which is exactly what a real
directional driller does — and learns that past a certain reach, small
corrections stop working and you must pick up off bottom and start the whole
orientation ritual again.

**A third lie, already sourced in `01-oil-gas.md` and worth reconnecting here:**
surveys are **discrete**, taken at 10–150 m intervals with 30 m common during
active steering `[WP-DD]`. **Between stations, the position on screen is an
interpolation.** `01-oil-gas.md` §B.4's drawing note already specifies survey
stations as dots and the path between them as an assumption. Combined with
toolface drift, the honest picture is: *you know where you were, you are guessing
where you are, and the thing telling you where you are pointing is being twisted
by the thing telling you how hard you are pushing.*

**The other characteristic failures**, both already in `01-oil-gas.md` §D and
both made worse by sliding:
- **Differential sticking** while stationary in a slide, across a permeable zone
  (§D.3) — and sliding *is* the stationary-pipe condition.
- **Pack-off** from the cuttings beds that sliding creates `[OFR-SLIDE]` p.52,
  which §D.4 already models.
- **Motor stall damaging the stator** `[OFR-SLIDE]` p.52 — new here, and the
  right consumable-destruction event for this method.

### 9.7 Offshore specifics

- **Directional drilling is *more* offshore, not less.** Every well from a fixed
  platform is directional by necessity — one structure, many targets. That is
  entailed by `01-oil-gas.md` §C.1.5's platform rig description and by the whole
  logic of `DESIGN_EXPANSION.md` §3; **the "every platform well is directional"
  statement itself is INFERENCE**, not a fetched claim.
- **Anti-collision becomes a real constraint** where many wells leave one
  structure through a shared conductor array. `01-oil-gas.md` §A.3.4 already
  records anti-collision as part of the DD's in-house training curriculum
  `[RW-HOWDD]`, which is a sourced hook; **the mechanics of an anti-collision
  scan are NOT SOURCED here** (§14).
- **Extended-reach wells are how offshore reaches what a rig cannot sit above**,
  and extended reach is precisely where the sliding penalty and the drag problem
  bite hardest `[OFR-SLIDE]` p.52. **The rig class and water depth fields in
  `PLATFORM_TRUTH.md` Part B combine with lateral length to define the contract's
  difficulty** — a clean three-field difficulty model with real physics behind it.
- **Certifications:** as `01-oil-gas.md` §A.3.4 — IWCF or IADC WellSharp well
  control, RigPass/SafeLand, H2S, plus the service company's own directional
  course covering surveying, steering and anti-collision, with certifications
  worth **+USD 20–120/day (€17–105)** to an offshore directional hand `[RZ-DDA]`.

---

## 10. OFFSHORE, ACROSS ALL SEVEN — the cross-cutting findings

Per-job offshore notes are in §3.7, §4.7, §5.7, §6.7, §7.7, §8.7 and §9.7. Four
things cut across all of them and belong in the design doc rather than in any one
section.

### 10.1 Offshore well services split into three tiers, and the tier is the contract

| Tier | Vessel | What it can do | Sourced |
|---|---|---|---|
| **Rigless / riserless** | purpose-built intervention vessel | *"nearly 70% of intervention operations"*, primarily **wireline** conveyance; also *"simple hydraulic intervention… stimulation, scale treatments, hydrate remediation, bullheading"* | `[DC-RLWI]`, `[OM-RLWI]` |
| **Vessel + coiled tubing** | intervention vessel with CT downlines | CT is *"necessary for more intensive through-tubing problems in wells, such as fluid circulation"*; one system carries **dual 2⅜ in (60 mm) downlines** to **2 000 m (6 500 ft)** water depth | `[DC-RLWI]`, `[OM-RLWI]` |
| **Full drilling rig** | jack-up, semi, drillship, platform | anything, including pulling tubing and re-drilling — and *"cost reductions of up to 85%"* are quoted for doing the job **without** it | `[OM-RLWI]` |

**This is the offshore contract board in one table.** The same well problem
appears at three prices with three capabilities, exactly as §2.1's onshore ladder
does — and the escalation decision is the game.

### 10.2 Three findings that affect `PLATFORM_TRUTH.md` Part B's fields

These are flagged for the owner. **Nothing has been changed.**

1. **The Rig type field has no value for an intervention vessel.** The seven
   values (Jackup · Semi-submersible · Drillship · Platform · Land · Tender-assisted
   · Barge) model *drilling units*. `[DC-RLWI]` describes a **monohull
   MODU-classed vessel**; `[OM-RLWI]` describes a purpose-built RLWI vessel.
   Neither is one of the seven. **The safe answer per Part C rule 6 is to leave
   rig type blank on intervention contracts, not to invent an eighth value.**
2. **Rig type, rig class and water depth do not apply to a land frac spread at
   all** (§8.7). Contracts must tolerate those fields being absent.
3. **Water depth for intervention tops out short of the platform's top band.**
   The sourced RLWI ceilings — **2 000 m** `[OM-RLWI]` and **2 990 m**
   `[DC-RLWI]` — both sit inside Part B's **deepwater (1 500–3 000 m)** band.
   **Nothing in this research supports an ultra-deepwater (>3 000 m) riserless
   intervention contract.** That is a content gate the game gets for free and
   should honour rather than round up.

### 10.3 The certification model, restated for well services

`PLATFORM_TRUTH.md` Part B's *"expired = cannot mobilise"* is the mechanic. Well
services add a **second, independent axis** to it:

```
SEAT  ── BOSIET · HUET · FOET · OGUK/ENG1 medical      → gets you on the helicopter
JOB   ── IADC WellSharp Well Servicing (Coiled Tubing /
         Snubbing / Wireline / Workover) [IADC-WS]      → lets you do the work
      ── or IWCF Well Intervention Pressure Control [IWCF]
STACK ── WellSharp Surface Stack vs Subsea Stack [IADC-WS] → gates the rig type
EXTRA ── explosives handling (perforating, jurisdictional)
      ── OEM tool certification (MWD/DD): +USD 20–120/day [RZ-DDA]
```

The three lines above the last are all sourced. **The "STACK" line is the best
progression gate in the entire oil & gas branch** — `01-oil-gas.md` §A.3.15
already identifies it: a driller certified on a surface stack is locked out of a
floater until he re-certifies. It applies to intervention exactly as it does to
drilling.

**Validity periods remain the weak point and `01-oil-gas.md` §A.6's warning
stands unchanged:** IADC references a two-year well-control cycle `[IADC-WS]`;
H2S is 3 years per a recruiter source and annual under US OCS rules `[CFR-490]`;
**BOSIET, FOET, HUET, OPITO and the medicals have UNVERIFIED durations.** Show
the boolean state, not a countdown, until an OPITO standard is in hand.

### 10.4 What offshore looks like — art direction notes that are sourced

- **The cement job**: two silos with load cells on the main deck, an independent
  low-pressure compressor and drier feeding them, a **thin 2 in hose rated at
  twice the mud hose's pressure**, and a pump unit that arrived on a boat because
  the rig does not own one `[IADC-JU]` F.3.1, F.3.2, F.3.7, F.1.5, F.1.6, G.2.1.
- **The completion**: a **burner on a boom out over the sea with a sprinkler
  system protecting the structure behind it** — IADC Section I lists Burners,
  Burner Booms, Lines Required on Burner Booms, Sprinkler System and Fixed Piping
  for Well Testing as standard equipment `[IADC-JU]`. Golden hour, flare, water
  curtain. It is the best image in the pack.
- **The wireline rig-up**: sheaves over the well, a lubricator **whose height is
  set by the length of your tool string** `[EPA-PERF]` p.20, and grease-seal flow
  tubes at the control head `[EPA-PERF]` pp.18–19.
- **The perforating run**: everything else stops and the radio goes silent
  (`01-oil-gas.md` §A.3.12).
- **The intervention vessel**: no derrick. A tower, a moonpool or an over-side
  handling system, and a stack going down on a wire. **Nothing in the game looks
  like this yet.**

---

## 11. THE CONSOLIDATED SHOP VIEW

One table, so the implementer can see the whole well-services catalogue at once,
mapped onto `DOMAIN.md` §3 and `PLATFORM_TRUTH.md` Part A's listing types.

| Listing type | Item family | Nearest `DOMAIN.md` §3 home | Status |
|---|---|---|---|
| **Service / Rental** | Cementing unit & bulk plant | *(none)* | **gap** — `[SUPPLHI]` 28.02.24G exists |
| **Service / Rental** | Coiled tubing unit | *(none)* | **gap** — `[SUPPLHI]` 28.02.11G / 28.06.10S |
| **Service / Rental** | Wireline logging unit | D → Exploration & Coring → Geophysical/Logging/Sampling | partial fit |
| **Service / Rental** | Workover rig / snubbing unit / ICU | A → Machines & Rigs (Drilling Rigs → Oil & Gas) | partial fit; `[SUPPLHI]` 28.01.07G |
| **Service / Rental** | Frac spread (pumps, blender, hydration, missile) | *(none)* | **gap** — `[SUPPLHI]` 28.02.27G |
| **Service / Rental** | Nitrogen unit | *(none)* | **gap** — `[SUPPLHI]` 28.06.11S |
| **Machine / Rig** | Injector head | *(none)* | **gap** — `[SUPPLHI]` 28.02.05G |
| **Attachment Tool** | Mud motor · RSS · MWD/LWD · steering & survey tools · directional subs | **D → Directional Drilling** | **good fit, already exists** |
| **Attachment Tool** | BHA subs, stabilizers, reamers, shocks, hole openers | D / B | `[SUPPLHI]` 28.02.06G, 28.02.22G |
| **Attachment Tool** | Perforating guns (hollow carrier / expendable) | *(none)* | **gap** — `[SUPPLHI]` 28.02.25G |
| **Attachment Tool** | Wireline tool string: CCL, gamma ray, CBL, sondes, weights, standoffs | D → Geophysical/Logging/Sampling | partial fit |
| **Attachment Tool** | Surface pressure control: lubricator, riser, wireline BOP, control head, grease head; CT stripper and CT BOP | D → **BOP & Well Control** | partial fit |
| **Attachment Tool** | Packers, tubing hanger, christmas tree, sliding sleeves, screens | D → **Wellhead & Completion** | **good fit, already exists** |
| **Attachment Tool** | Bridge / frac / composite plugs | *(none)* | **gap** — `[SUPPLHI]` 28.02.26G |
| **Attachment Tool** | Fishing tools, mills, overshots, jars | *(none)* | **gap** — `[SUPPLHI]` 28.04.02G, 28.05.04G |
| **Attachment Tool** | Float equipment (shoe, collar), cementing plugs, centralizers | B → Casing & Overburden Tools (Casing Shoes & Drive Caps) | partial fit |
| **Consumable** | Well cement by class (A–H) and grade (O/MSR/HSR) | C → Grouting & Injection | partial fit; `[ISO-10426]`, `[SUPPLHI]` 28.05.03G |
| **Consumable** | Spacer, cement additives | C → Mud & Fluid Systems → Drilling Fluids & Additives | fits |
| **Consumable** | Coiled tubing string (API 5ST, CT70–CT110) | B → Drill String & Rods | partial fit; `[FET-CT]` |
| **Consumable** | Wireline cable (slickline / braided / e-line), cable heads, weak points | *(none)* | **gap** |
| **Consumable** | Shaped charges (RDX / HMX / HNS), det cord, detonators | *(none)* | **gap** |
| **Consumable** | Proppant; fracturing fluids | *(none)* | **gap** — `[SUPPLHI]` 28.05.07G, 28.05.08G |
| **Consumable** | Kill fluid, completion brine | C → Drilling Fluids & Additives | partial fit |

**The finding in one line:** of the well-services catalogue, **the Drillity
taxonomy already models directional drilling and wellhead/completion properly and
models nothing else.** Twelve gaps. The recommended resolution is §2.4's — most
of these ship as **`Service / Rental` listings** rather than as new subcategories,
which is both cheaper and truer, since the real jack-up spec sheet says the rig
does not own them `[IADC-JU]` G.2.1.

---

## 12. THE CREW, MAPPED TO THE CAREER LADDER

`01-oil-gas.md` §A.7 already draws the ladder and §A.5 already gives the
consolidated day-rate table. This section only records what well services change.

**All seven jobs live on the SERVICE track** of `01-oil-gas.md` §A.0's three
chains — except workover, which straddles contractor and operator. That has a
direct consequence the game should use: **a player on the contractor track
(roustabout → floorhand → derrickhand → driller → toolpusher → OIM) cannot become
a wireline supervisor by levelling up.** Crossing tracks is a deliberate career
event, and `01-oil-gas.md` §A.0 already calls it *"a real career event and should
be an unlock."*

**The service-track ladder, consolidated from `01-oil-gas.md` §A.7 plus this
file's §5.3 and §6.3:**

```
MWD hand ──────▶ assistant DD ──▶ DD ──▶ senior DD ──▶ directional coordinator
wireline op ───▶ wireline supervisor ──▶ field service manager
                          └──▶ (sideways, to the operator) petrophysics
CT operator ───▶ CT supervisor ──▶ (well intervention specialist, subsea)
cementer ──────▶ cementing supervisor          [ladder INFERRED, not sourced]
frac hand ─────▶ frac supervisor ──▶ (data van) [ladder INFERRED, not sourced]
```

**Mapping to `PLATFORM_TRUTH.md` Part B / `DOMAIN.md` §7 job functions.** Talent's
own list (Drill Rig Operator · Rigger · Crane Operator · Equipment Technician ·
Foreman / Site Supervisor · Hydraulic Grab / Piling Operator · Blaster / Shot
Firer, plus the engineering, HSE, maintenance, logistics and management ladders)
**has no label for a cementer, a wireline operator, a CT operator or a frac
hand.** Talent's 20 oil & gas *specialisations* do (`01-oil-gas.md` §A.2 rows
9–14), so the specialisation field carries them and the job-function field does
not. **Use the specialisation.**

**One genuinely useful observation about `Blaster / Shot Firer`.** It is a real
Talent job function (`DOMAIN.md` §7) and it exists today for mining and
tunnelling. **Perforating is the oil & gas member of that family** — the same
competence (explosives handling, initiation systems, exclusion procedures) applied
to a different medium. *That the two roles share a competence is INFERENCE*, but
it is a defensible one and it gives the game a cross-industry skill node that
connects the tunnelling branch to the oil & gas branch. Worth considering.

**Skill-tree names.** `PLATFORM_TRUTH.md` Part B instructs the game to use the
platform's own extracted skill vocabulary where it fits — *Well control ·
managed-pressure drilling · HPHT · BOP · Dynamic Positioning · Mud Management ·
Risk Assessment · Emergency Response.* Of those, **Well control, HPHT, BOP,
Dynamic Positioning (the intervention vessel holds station on DP) and Emergency
Response** all apply directly to well services. **Use those names, not invented
ones.**

---

## 13. PROPOSED IDS AND MODES — a proposal, not a change

`METHOD_IDS.md` states that method ids are *"the contract between parallel
agents"* and are fixed. **Nothing below has been applied and no existing file has
been edited.** This is a request for the owner's decision.

| Proposed id | Name | Talent industry | Section mode | Status |
|---|---|---|---|---|
| `coil-tubing` | Coiled Tubing Intervention | Oil & Gas | `vertical` / `profile` | **recommended as a new method** (§1) |
| — | Cementing | Oil & Gas | *(phase of `oil-rotary`)* | **recommended as a scored phase, not an id** |
| — | Slide / Rotate (directional) | Oil & Gas | *(mode on `oil-rotary`)* | **recommended as a mode; `01-oil-gas.md` §E.1 already specifies the toggle** |
| `wireline` | Wireline Logging & Intervention | Oil & Gas | `vertical` | proposed, second wave |
| — | Perforating | Oil & Gas | *(event inside `wireline` or `coil-tubing`)* | **explicitly not a method** (§7.4) |
| `frac` | Hydraulic Fracturing | Oil & Gas | **new mode needed** | proposed, third wave — needs a fracture renderer |
| — | Workover / Completion | Oil & Gas | *(contract type)* | **explicitly not a method** (§4.4) |

**Rig ids**, following `METHOD_IDS.md`'s convention that a rig id may equal a
method id where the machine is the method: `ct-unit` · `wireline-unit` ·
`workover-rig` · `frac-spread`. **The cement unit is deliberately not a rig** —
it is `Service / Rental` (§2.4).

**Controls table in `METHOD_IDS.md`'s format**, for whichever of these the owner
approves:

| method | ADVANCE | WORK | PROTECT |
|---|---|---|---|
| `coil-tubing` | **injector force / run speed** | **tool duty** (pump rate, mill torque) | **surface barrier + fatigue budget** |
| cementing (phase) | **displacement rate** | **slurry density** | **ECD window + standoff** |
| directional (mode) | **hook load slacked off** | **toolface** | **ECD + hole cleaning** |
| `wireline` | **line speed** | **integration time** | **cable tension margin + barrier** |
| `frac` | **pump rate** | **proppant concentration** | **pressure headroom** |

**Scored on — NOT metres**, in `METHOD_IDS.md`'s format:
`coil-tubing` reach achieved and fatigue spent · cementing placement and bond ·
directional position at TD and slide fraction · `wireline` depth fidelity and
repeat-section agreement · `frac` designed proppant placed and stages completed.

---

## 14. `NOT SOURCED` — the honest list

Per `PLATFORM_TRUTH.md` Part C rules 1, 6 and 7. **None of the following may
reach a player without a further source.** They are listed visibly rather than
quietly filled in.

| Item | Status | Note |
|---|---|---|
| **API Spec 10A covers six classes (A, B, C, D, G, H)** | **NOT SOURCED** | `[ISO-10426]` (2005) specifies **eight** (A–H) and is quoted here. That the current API edition withdrew E and F came only from search summaries. **Ship G and H**, which the standard itself calls the basic well cements. §3.2 |
| **Lead / tail slurry practice** | **NOT SOURCED** | Universal trade practice; no first-party source fetched. The *existence* of designed density is sourced via `[ISO-10426]` mix-water fractions. §3.1 |
| **60–70 % minimum casing standoff target** | **NOT SOURCED** | API RP 10D-2 covers centralizer placement and standoff calculation but was not obtainable. **The mechanism is sourced** `[SLB-CENT]`; the number is not. §3.4 |
| **Static gel strength thresholds for gas migration (100 → 500 lbf/100 ft²)** | **NOT SOURCED** | Returned consistently but only from paywalled SPE abstracts. Ship the *transition period* as a vulnerable phase; ship no numbers. §3.6 |
| **Cement job "lift pressure" / TOC verification by pressure** | **NOT SOURCED** | The SLB glossary term `top_of_cement` returned 404. TOC as a *concept* is used only qualitatively here. §3.5 |
| **The 72 % productivity-index loss after killing a well with water-base fluid** | **NOT SOURCED** | Found only in patent background text. The *mechanism* is sourced `[SLB-FD]`. §4.6 |
| **CT bending cycles per trip (1 at reel, 2 at gooseneck)** | **INDICATIVE** | Consistent across the CT fatigue literature; not read from a fetched primary. `[FET-CT]`'s "each trip plastically bends and straightens the string at the reel, gooseneck, and injector chains" **is** fetched. §5.6 |
| **CT typical cycles to failure** | **NOT SOURCED** | No figure obtained. Model fatigue as a percentage budget with no absolute number on screen. §5.6 |
| **"40–60 % cost reduction" for RLWI vs a drilling rig** | **NOT SOURCED** | From a search summary. **The sourced figure is "up to 85%"** `[OM-RLWI]`, and it is a ceiling, not a typical. §5.7 |
| **Wireline magnetic-mark stretch correction, and its failure in cased hole** | **INDICATIVE** | Mechanism returned consistently; described from a search synthesis, not a fetched document. **The trade's response is fully sourced** `[SLB-PDCL]`, `[EPA-PERF]` p.21. §6.6 |
| **Wireline weak-point tension ratings** | **NOT SOURCED** | The *concept* is sourced (patent literature plus `[FET-CT]`'s "re-heading after weak-point events"). No rating figure. §6.6 |
| **Underbalanced perforating cleans the perforation tunnels** | **NOT SOURCED** | `[SLB-UB]` defines underbalance only. Ship underbalance as a state, not as a cleaning claim. §7.1 |
| **Crushed zone → perforation skin** | **NOT SOURCED** | Standard doctrine; no fetchable primary obtained. Flagged as the highest-value next thing to source, because it separates "penetration" from "productivity". §7.6 |
| **Section 1 vs Section 2 penetration difference as a percentage (e.g. "up to 22 %")** | **NOT SOURCED** | From SPE/IPTC abstracts only. **The existence of two sections with different targets IS sourced** `[API-19B]`. Ship the direction, never a number. §7.6 |
| **Frac treatment schedule as pad → proppant ramp → flush** | **INFERENCE** | Entailed by `[SLB-PAD]` and by `[INTECH-SO]`'s wellbore-screenout mechanism; no source states the canonical schedule. Print no stage percentages. §8.1 |
| **Frac water volume per well, injection rate, treating pressure** | **NOT SOURCED** | The EPA figures found are in the **2015 External Review Draft, which is stamped "DRAFT — DO NOT CITE OR QUOTE"**, so they are deliberately excluded. The final 2016 assessment was not obtained. §8.2 |
| **Frac pump ratings (2 250–3 000 HHP, 10 000–15 000 psi)** | **INDICATIVE** | Vendor and industry-FAQ pages only. Not a standard. Do not print as a specification. §8.2 |
| **Nolte–Smith slope-to-mode mapping (unit slope = TSO, etc.)** | **INDICATIVE** | Returned consistently and discussed in `[INTECH-SO]`, but the numeric mapping was not read from Nolte & Smith's original paper. §8.6 |
| **Wellhead isolation tool / frac stack** | **NOT SOURCED** | Named in trade usage; no fetched primary. §8.2 |
| **Plug-and-perf pumpdown sequence, step by step** | **INDICATIVE** | The **sliding-sleeve alternative is fully sourced** `[EPA-PERF]` p.27; the pumpdown wireline sequence is not. §8.1 |
| **Frac crew rotation patterns** | **INFERENCE** | Mapped to 5/2 or 6/3 because the work is land-based. No source states it. §8.3 |
| **Cementing and frac career ladders** | **INFERENCE** | Drawn by analogy with the sourced wireline and CT ladders in `01-oil-gas.md` §A.7. §12 |
| **"Every platform well is directional"** | **INFERENCE** | Entailed by the platform-rig geometry in `01-oil-gas.md` §C.1.5; not a fetched claim. §9.7 |
| **Anti-collision scan mechanics** | **NOT SOURCED** | Anti-collision appears in the DD's training curriculum `[RW-HOWDD]`; the method does not. §9.7 |
| **Top-hole cement returning to the mudline on a floater** | **INFERENCE** | Entailed by the subsea-stack arrangement `[DICT]` p.668 via `01-oil-gas.md` §A.3.15. Fine as art direction; not a specification. §3.7 |
| **Drilling well control tickets do not cover intervention** | **INFERENCE** | Entailed by the existence of separate WellSharp Well Servicing and IWCF Well Intervention programmes `[IADC-WS]`, `[IWCF]`. Safe to dramatise as a gate; do not state as a regulation. §4.3 |
| **The plug bump does not evidence annular placement** | **INFERENCE** | No source states it negatively. Entailed by the cement bond log existing as a separate later measurement `[SLB-CBL]` and by `[SLB-CPLUG]` confining the plug's function to fluid separation and contact indication. §3.6 |
| **A static well is not necessarily a dead well** | **INFERENCE** | Built from `[SLB-KILL]` + `[SLB-LC]`; the same logic `01-oil-gas.md` §D.1 already sources for kicks. §4.6 |
| **Blaster / Shot Firer and perforating share a competence** | **INFERENCE** | Defensible, and useful as a cross-industry skill node, but not stated by any source. §12 |
| **`[SUPPLHI]` code for centralizers / cementing plugs / float equipment** | **AMBIGUOUS EXTRACTION** | The PDF's two-column layout interleaves the OCTG family narrative with the drilling-tools codes. **The list is sourced; the exact code is not.** §3.2 |
| **`[FET-CT]` size, wall and grade ranges** | **MANUFACTURER'S CHARACTERISATION** | API 5ST and grades CT70–CT110 are a standard's designations; "2 in–2⅞ in most common in intervention service" is one maker's account of the market. Flagged, not laundered. §5.2 |
| **`[IADC-JU]` figures are one real rig** | **VERIFIED BUT SINGLE-UNIT** | Carried forward from `01-oil-gas.md` §F: a 1979-built, 280 ft, 20 000 ft jack-up — a **Standard**-class shallow-water unit. Its silo capacities, hose ratings and "Provided by Operator" entries are mutually consistent and safe to model against, but they are **not an industry rule**. |

---

## 15. WHAT THIS FILE IS CONFIDENT ABOUT

A short list, because `PLATFORM_TRUTH.md` Part C rule 6 says a short list of
certainly-true facts beats a long list with one error in it. Everything here is
quoted from a standard, a regulator, a government-hosted document or a
first-party glossary, and every one of them is directly playable.

1. **Well cement is specified by Class (A–H) and Grade (O/MSR/HSR); thickening
   time is a measured, purchasable property.** `[ISO-10426]`
2. **Cement must reach 500 psi (34.5 bar) behind the bottom 500 ft (152 m) before
   drill-out.** `[CFR-420]`
3. **A cement bond log is "largely qualitative", cannot see channelling
   azimuthally, and is confused by a microannulus — run it under pressure to tell
   them apart.** `[SLB-CBL]`, `[DM-CBL]`
4. **The rig does not own the cement unit.** `[IADC-JU]` G.2.1
5. **The cement line is rated at twice the mud line's pressure on a real rig:
   10 000 psi vs 5 000 psi.** `[IADC-JU]` F.1.5, F.1.6
6. **Coiled tubing lockup is defined as the point where a large increase in
   set-down weight produces almost no increase in force at the tool.**
   `[CTES-TFM]`
7. **All coiled tubing fatigue damage happens above the wellhead.** `[FET-CT]`
8. **Residual bend from the reel makes lockup happen sooner — modelled as
   friction rising from 0.2 to 0.3 on the way in.** `[CTES-TFM]`
9. **A nuclear log run too fast records a value that was never true, and shifts
   the bed contacts by the lag distance.** `[EPA-NUC]`
10. **Perforating depth is proven by correlating casing collars against a
    reference gamma-ray log, with a short casing joint as a marker and a tape
    measure from the top shot to the CCL.** `[SLB-PDCL]`, `[EPA-PERF]`
11. **A perforating jet travels at 25 000–30 000 ft/s and the rock flows
    plastically around it.** `[EPA-PERF]`, `[SLB-SC]`
12. **API RP 19B has a concrete-target section and a stressed-rock section, and
    many published performance tables still use the superseded RP 43 data.**
    `[API-19B]`, `[EPA-PERF]`
13. **Explosive choice is a temperature gate: RDX 330 °F, HMX 400 °F,
    HNS 520 °F.** `[EPA-PERF]`
14. **A screen-out is a rapid pressure rise — and a tip screen-out is sometimes
    the objective.** `[SLB-SO]`, `[INTECH-SO]`
15. **A step-down test of four 10–15 s steps separates perforation friction from
    near-wellbore friction by the curve's shape.** `[INTECH-SO]`
16. **Sliding delivers 10–25 % of rotating ROP.** `[OFR-SLIDE]`
17. **An impending motor stall shows as rising surface WOB with no rise in
    downhole pressure.** `[OFR-SLIDE]`
18. **Reactive torque twists the string and rotates the toolface, and it grows
    with weight, peaking at stall.** `[OFR-SLIDE]`
19. **A bent housing is set by hand on the drill floor, 0–3°, and cannot be
    changed without tripping.** `[OFR-SLIDE]`
20. **Riserless intervention covers about 70 % of interventions, reaches
    2 000–2 990 m of water, and can cost up to 85 % less than the same job from a
    rig.** `[DC-RLWI]`, `[OM-RLWI]`

---

*Compiled 2026-09-04 against `PLATFORM_TRUTH.md` Parts B and C,
`DESIGN_EXPANSION.md` §3 and §5, `GAMEDESIGN.md` §7, `METHOD_IDS.md` and
`DOMAIN.md` §§3–7. Sources are the standards, regulations and
government-hosted documents listed in §0.2 plus the two local PDFs in
`C:\Users\henri\Downloads\`. No supplier part numbers or drawing numbers appear,
no real model designation is proposed as in-game content, no capability is
attributed to a named manufacturer, and no Drillity internal business metric
appears anywhere. **No existing file was edited and no finding has been applied.***

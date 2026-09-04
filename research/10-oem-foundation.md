# 10 — OEM research: foundation & piling equipment manufacturers

**Purpose.** Source material for *Drillity I The Game* so that machine classes,
capability envelopes and part compatibility are authentic.
**Status.** Research only. Nothing here is user-visible game copy.

## How to read this file — the two uses, kept separate

`DOMAIN.md` §6 lists real rig brands because **"fits rig / brand" is a genuine
facet in the Drillity iMarket taxonomy** — a seller legitimately says a Kelly
auger fits a Bauer BG, a casing fits a Liebherr LB. That is use #1, and for it
you need the **model-series naming conventions** in §A and §B.1 and the
**compatibility rules** in §C.

Use #2 is the opposite: `DOMAIN.md` §6 ends with *"In-game rig names must be
original — evoke these, never copy a real model designation."* So the real
figures in §B exist only to **size invented machines into believable classes**.

> **HARD RULE, repeated because it is easy to break:**
> Never use a real model designation (BG 45, LB 30, SR-95, PM26, HHK 16, D 46,
> SG-60, BC 40 …) as an in-game product name. The *numbers* are reference. The
> *names* are not. See `PLATFORM_TRUTH.md` Part C rule 4.

**Sourcing.** Every factual claim below carries a URL or a local filename.
Local files are in `C:\Users\henri\Downloads\`. Anything I could not verify is
marked `UNVERIFIED` and left as an open question, not filled in with a guess.
Where a figure is a range across a series or across configurations, it is
written as a range.

---

# A. Per-manufacturer

## A.1 BAUER Maschinen — Schrobenhausen, Germany

**Who.** The reference point of the whole segment. Founded 1790 as a copper
forge in Schrobenhausen; well drilling in Bavaria from 1928; the ground anchor
invented by Dr.-Ing. K.H. Bauer in 1958; **first hydraulic rotary drill rig
BG 7 in 1976**; **first diaphragm wall trench cutter BC 30 in 1984**; BAUER AG
listed 2006; BG ValueLine and BG PremiumLine introduced 2011.
*(Source: local `geraetekatalog_catalog_of_machines_bauma_2025_bauer_maschinen.pdf`,
and the timeline on p.2–3 of the BG 45 PremiumLine brochure,
https://www.ecanet.com/uploads/files/Resources/BG_45_BS_95_PremiumLine_EN_905_799_2.pdf)*

The group is three-part — Bauer Spezialtiefbau (the contractor), Bauer Maschinen
(the equipment maker), Bauer Resources — plus subsidiaries **MAT** (mixing,
grouting and separation plants), **KLEMM Bohrtechnik** (anchor/micropile rigs)
and **RTG Rammtechnik** (piling rigs). All four appear as branded sections inside
Bauer's own bauma 2025 catalogue.

**Reputation in the trade.** Premium, and priced like it; treated as the technical
benchmark and quoted as the default when a spec writer names a rig class. Bauer's
own positioning is "more than machines: competent consulting", operation in over
70 countries, and — the line that actually moves machines — **"long lifetime and
excellent resale value"** (BG 45 PremiumLine brochure p.4). Outside framing: "a
German manufacturer of specialist foundation engineering equipment … a global
leader in engineering and equipment"
(https://www.jewinnerparts.com/top-11-piling-rigs-or-drilling-rigs-manufacturer-in-the-world/).
A driller's shorthand: *if the tender says "BG-class", everyone already knows
what size of hole is meant.*

### Naming conventions — Bauer

| Designation | What the number encodes | Evidence |
|---|---|---|
| **BG nn** — rotary drilling rig | **max. torque in kNm ÷ 10** | BG 15 H = 150 kNm; BG 20 H = 204; BG 23 = 235; BG 30 H = 300; BG 33 = 342; BG 36 = 385; BG 45 = 461; BG 50 = 500; BG 55 = 553 — https://www.bauer-equipment.com/en/drilling-rigs-h-kinematics and https://equipment.bauer.de/en/drilling-rigs-v-kinematics |
| **H / V suffix** — kinematics | **H-model line**: fast loading onto transport, compact rigging, can shift under low bridges. **V-model line**: big borehole diameters, large drilling depths, robust low-vibration kinematics, extended service intervals. | BG 45 PremiumLine brochure p.4 |
| **BT nn / BS nn** — base carrier | Carrier size class, rising with machine size (BT 40 → BT 180; BS 80 → BS 115). `UNVERIFIED`: what BT/BS abbreviate, and what unit the number is in. | Model strings "BG 15 H BT 50", "BG 45 BS 95", "BG 72 BT 180" — BG 45 brochure p.5 |
| **e prefix** | Battery-electric / all-electric variant | `eBG 33 H all electric`, `eRG 21 T hybrid`, `eCSM` — bauma 2025 catalogue |
| **Product lines** | **ValueLine** (cost-optimised) · **PremiumLine** (full multifunction) · **KellyLine** (Kelly-only) | https://www.ecanet.com/uploads/files/Resources/BG_30_BT_80_ValueLine_EN_905_723_2.pdf ; https://equipment.bauer.de/en/media/6190/download |
| **KDK nnn** — rotary drive (*Kraftdrehkopf*) | **nominal torque in kNm** | BG 45 offers KDK 390 S and KDK 460 S (BG 45 brochure p.8); a KDK 235 is sold as a 235 kNm drive — https://pilingbroker.com/equipment/new-bauer-kdk-235-rotary-drive/ |
| **BTM nnn** — torque multiplier | **casing torque in kNm** it delivers | "all new torque multiplier BTM 600" fitted to the BG 55 for cased CFA — bauma 2025 catalogue |
| **BC nn** — trench cutter | Cutter size class. `UNVERIFIED` as a formula: BC 40 = 100 kNm and BC 50 = 120 kNm cutter torque, so the number is **not** torque. | https://www.efebauer.com/products/cutter-system/bc-40/ ; https://geotechpedia.com/Equipment/Show/361/BC-50-Trench-Cutter |
| **BCS / MBC / CBC / HDS / HD / HE** | Cutter **S**ystem · **M**odular cutter · **C**ompact/silent cutter · **H**ose **D**rum **S**ystem · **H**ydraulic **D**iesel power pack · **H**ydraulic **E**lectric power pack | bauma 2025 catalogue ("BCS 185 power pack + HDS 90-T + BC 35"; "HE 1400 Hydraulic Power Pack with Electric Engine"); https://equipment.bauer.de/en/trench-cutters-cutter-systems |
| **RB nn** | Mobile (truck-mounted) drilling rig | `RB 65` on a MAN TGS 33 chassis — bauma 2025 catalogue |
| **RG / eRG** (RTG) | Pile driver; `T` = telescopic leader (*Teleskopmäkler*), `S` = fixed leader (*Starrmäkler*) | `eRG 21 T hybrid`, `RG 27 S` — bauma 2025 catalogue |
| **MR nnn** (RTG) | Hydraulic vibrator; number ≈ **max. centrifugal force in kN ÷ 10** | MR 150 AVM = 1,500 kN max. centrifugal force — bauma 2025 catalogue |

**Methods a BG performs.** The multi-function chart on p.9 of the BG 45
PremiumLine brochure is one of the cleanest published method lists in the
industry, and it maps almost one-for-one onto `DOMAIN.md` §1:

Kelly drilling · cased Kelly drilling (installed either with the **BTM** torque
multiplier *or* with a casing oscillator) · **CFA** · **CCFA** cased CFA
(KDK + BTM, i.e. double rotary) · **FDP** full displacement piling, standard *or*
**lost bit** · **BC** trench cutter · **SCM** single column mixing · **CSM**
cutter-soil-mixing · **TR** vibrator. Bauer also markets **MIP** mixed-in-place.
Large-diameter well drilling is a separate line (RB truck rigs, Ø 1,200 mm to
400 m depth — bauma 2025 catalogue).

## A.2 LIEBHERR — Liebherr-Werk Nenzing GmbH, Austria

**Who.** The other European heavyweight, and the one that reaches deep foundation
work from the crane side: the same Nenzing plant builds the **HS** duty-cycle
crawler cranes that carry cutters and grabs and the **LB / LRB / LRH** foundation
machines. Reputation: "a leader in heavy machinery, known for developing
intelligent drilling solutions with automation features to enhance precision and
efficiency"
(https://www.jewinnerparts.com/top-11-piling-rigs-or-drilling-rigs-manufacturer-in-the-world/).
The trade read: *crane-grade hydraulics and controls, strong assistance systems,
head-to-head with Bauer at every size point, and first to normalise a
battery-electric option across the range.*

### Naming conventions — Liebherr

| Designation | What the number encodes | Evidence |
|---|---|---|
| **LB nn** — rotary drilling rig | **max. torque in kNm ÷ 10** — the same rule as Bauer BG | LB 20.1 = 200 kNm; LB 25 = 252; LB 30 = 297; LB 35.1 = 347; LB 45.1 = 450; LB 55 = 557 — https://www.liebherr.com/en-us/deep-foundation/machines/drilling-rigs/lb-series-4424785 |
| **`.1` suffix** | Generation/upgrade at the same size point | LB 20.1, LB 35.1, LB 45.1 — same page |
| **"unplugged"** | Battery-electric variant, ~2 t heavier than the diesel | LB 25 unplugged 71.1–82.1 t vs LB 25 69.3–79.9 t — same page |
| **LRB nn / LRB nnn** — piling **and** drilling rig | A size index, **not** torque: LRB 19 = 180 kNm, LRB 23 = 300 kNm, LRB 355.1 = 450 kNm. Two-digit and three-digit names coexist. `UNVERIFIED`: what either number means. | https://www.liebherr.com/en-us/deep-foundation/machines/piling-and-drilling-rigs/lrb-series-4424788 |
| **LRH nnn** | Hydraulic impact piling. `UNVERIFIED` — I did not confirm ram weights or energies from a Liebherr source. **Do not quote LRH figures.** | — |
| **HS nnnn** | Duty-cycle crawler crane used as a cutter/grab carrier. `UNVERIFIED`: number meaning not confirmed. | — |
| **VRM** | Casing oscillator designation, also used by Leffer (see §A.15) | https://pacific-foundation.com/machines/vertical-drill-rigs/liebherr-vrm-250kl-oscillator-w-power-pack/ |

**Methods.** The LRB series is sold explicitly for "piling, vibrating, pressing
and drilling", covering impact driving · vibrating · Kelly · CFA · double rotary ·
FDP · soil mixing (LRB series page). The LB series page documents Kelly drilling
for every model and shows a double-rotary configuration on the LB 45.1.

## A.3 KLEMM Bohrtechnik — Drolshagen, Germany (Bauer Maschinen Group)

**Who.** The specialist at the **small end** — anchors, micropiles, jet grouting,
soil nailing, geothermal. This is the manufacturer that defines the bottom of the
class ladder, so for game balance it matters as much as Bauer. It appears as a
KLEMM-branded section inside Bauer's own bauma 2025 catalogue, i.e. it is inside
the group. Self-description: *"Made in Germany … DYNAMIC POWER … outstanding
reliability and performance with the lowest total cost of ownership (TCO)"*
(local `KLEMM_Lieferprogramm_Product_Range.pdf`, 08/2025 edition).

### Naming conventions — Klemm

All from local `KLEMM_Lieferprogramm_Product_Range.pdf` unless noted.

| Designation | Meaning | Range |
|---|---|---|
| **KR nnn-n[suffix]** — drill rig | Model family code, **not** a spec encoding. Stated series envelope: **4 t to 32 t operating weight**. | KR 606 · KR 702 · KR 704 · KR 708/709 · KR 717 · KR 720 · KR 800/801 · KR 805/806/807 · KR 909 |
| Suffix letters | `E` = electric drive · `G` = diesel · `W` = geothermal line (KR 805-3G**W**, KR 717-3G**W**) · `M` = with rod magazine (KR 806-4G**M** carries the MAG 6.1 carousel) · `P` = higher-power hydraulics (KR 806-5G**P** 245 kW vs KR 806-5G 180 kW) · `S`, `K` = mast/configuration variants. `UNVERIFIED` — the key is inferred from the model list; Klemm publishes no legend. | — |
| **KH nn** — hydraulic rotary head | **max. torque in kNm** | KH 9 = 10.1 · KH 17 = 15.2 · KH 21 = 20.4 · KH 25 = 24.4 · KH 34 = 33.6 · KH 41 = 40.8 · KH 47 = 46.8 · KH 62 = 61.5 kNm. Series stated as "torque up to 61.5 kNm". |
| **KD xxyy** — hydraulic drifter | **xx = max. torque in kNm, yy = piston weight in kg.** Stated explicitly: *"KD 4724 … max. torque: 47 kNm, piston weight: 24 kg"* (Bauer bauma 2025 catalogue). Series stated as "piston weight from 6.8 kg to 28 kg". Older and `R` variants (KD 1011, KD 1215R) do not fit the rule exactly. | KD 408 · KD 511 · KD 1011 · KD 1108 · KD 1215R · KD 2117 · KD 2524 · KD 3428 · KD 4724 |
| **PP** | Hydraulic power pack, diesel or electric, **45 kW to 129 kW** | — |
| **KA** | Excavator attachment systems | — |
| **MAG / HBR** | Rod handling — carousel magazine / rod-lifting device | MAG 1.2, MAG 2.1V, MAG 6.1, MAG 7.0; HBR 120, HBR 200 |
| **MBS** | Drilling data recording system | — |

**Methods.** Anchor drilling · micropiles · grout injection (one-, two- and
three-phase high-pressure jet grouting) · geothermal · duplex/overburden
double-head drilling (the KR 806-4GM is sold for "heavy duplex drilling with
double rods for single-person operation").

## A.4 SOILMEC — Cesena, Italy (Trevi Group)

**Who.** Founded 1969; a specialised maker of underground foundation equipment for
over 50 years; "piling rigs are highly competitive in the global market,
distinguished by both their specialised design and innovative technology"
(https://www.jewinnerparts.com/top-11-piling-rigs-or-drilling-rigs-manufacturer-in-the-world/;
company background https://en.wikipedia.org/wiki/Soilmec). In the trade Soilmec
reads as the *method-rich* brand: the same carrier is reconfigured for LDP, CFA,
DP/TCT, turbojet and low-headroom work, and their datasheets are organised by
**method**, not by machine.

### Naming conventions — Soilmec

| Designation | What the number encodes | Evidence |
|---|---|---|
| **SR-nn** — hydraulic rotary rig | **operating weight class in tonnes** — a *different* convention from Bauer/Liebherr, and the single most important thing to get right when reading Soilmec specs. SR-95 operating weight 90,800 kg (CCS) / 92,900 kg (WCS); SR-125 weighs 128 t; SR-30 described as a "35 ton machine class". Torque is unrelated to the number (SR-30 = 130 kNm; SR-95 = 301 kNm). | https://www.soilmec.co.uk/wp-content/uploads/2021/01/SR-95_HIT_rev_11-2020.pdf ; https://www.archiexpo.com/prod/soilmec-spa/product-156638-1876228.html ; https://www.heavyquipmag.com/2021/05/21/soilmecs-offert-expands-with-the-new-sr-30-eagle-hydraulic-drilling-rig/ |
| **CCS / WCS** | **C**ylinder **C**rowd **S**ystem vs **W**inch **C**rowd **S**ystem — the two crowd architectures, sold as distinct variants of the same rig with different weights, forces and mast geometry | SR-45 datasheet: CCS pull up/down 207/140 kN, WCS 240/240 kN — https://www.3cdrilling.com/wp-content/uploads/2017/07/Soilmec-SR-45-drill-rig.pdf |
| **HIT / High-Tech / Blue Tech** | Technology package / trim level | SR-95 HIT, SR-125 HIT |
| Method codes on the datasheets | **LDP** large diameter pile · **CFA** · **DP / TCT** displacement pile · **TJ / TTJ** turbojet soil consolidation · **LHR** low head room | SR-45 and SR-95 datasheets |
| **SF / SM / SC / SD / PSM prefixes** | `UNVERIFIED`. soilmec.com returned HTTP 403 on direct datasheet fetch and the SR-series index page 404'd, so I could not reach a Soilmec page that defines these prefixes. **Do not state what SF or SM mean until confirmed.** | — |

## A.5 CASAGRANDE — Fontanafredda, Italy

**Who.** Founded 1963. "Although not the largest engineering equipment enterprise,
[it] is one of the most professional manufacturers of foundation construction
equipment. People choose Casagrande piling rigs for their high level of
specialisation and precision"
(https://www.jewinnerparts.com/top-11-piling-rigs-or-drilling-rigs-manufacturer-in-the-world/;
company background https://en.wikipedia.org/wiki/Casagrande_Group). Trade read:
precise and specialised, unusually strong at *both* ends — micropile/anchor
crawler drills and large-diameter piling rigs.

### Naming conventions — Casagrande

| Designation | What the number encodes | Evidence |
|---|---|---|
| **Bnnn** — piling rig | **max. rotary torque in kNm, stated directly** (not ÷10 like Bauer): B125 = 125 kNm, B175 = 175 kNm, B250 = 250 kNm, B300 = 300 kNm. Range continues B360, B400, B470. | https://casagrandegroup.com/product/b175/ ; https://casagrandegroup.com/product/b300/ ; https://www.casagrandeuk.com/products/casagrande-b470-xp2-piling-rig/ |
| **XP / XP-2** | Generation suffix across the whole range | B125 XP-2, B300 XP-2, C6 XP-2 |
| **Cn** — crawler drill | Small multipurpose rigs for anchors, micropiles, soil nails, jet grouting and site investigation. Number is a size index, **not** torque (C6 XP = 15.2 kNm). | https://casagrandegroup.com/crawler-drills/xp-2-series-crawler-drills/c6/ and .../c8/ |
| **CnT** | Tunnel variant of the crawler drill | https://casagrandegroup.com/tunnelling/xp-2-series-tunnel/c6t/ |
| **KRCn** | Cutter/hydromill for diaphragm walls, mounted on a B- or C-series carrier — "developed to excavate efficiently in medium hard to soft soils" | https://casagrandegroup.com/equipment/krc1c20/ ; https://casagrandegroup.com/equipment/krc2hdb360xp2/ |
| **FDnn** | Hydromill — the heavy diaphragm-wall cutter line | FD60, FD70 — https://www.casagrandegroup.com/diaphragm-wall/hydromills/ |

## A.6 IMT — Industria Meccanica Trivelle, Italy

**Who.** The **excavator-based** foundation rig specialist, and that is their
entire identity. The AF 240 is built on a Caterpillar 345 C HHP base —
"Manufactured by Caterpillar on the basis of" the standard excavator, with IMT's
own mast, rotary and crowd system bolted to it
(https://www.kellytractor.com/eng/images/pdf/foundation_drilling/AF_240.pdf).
Commercially that means lower capital cost, familiar service parts and an
operator who already knows the base machine. Range stated as "boreholes from 16
to 118 inches in diameter, up to 295 feet deep … eight different AF models, each
with a patented automatic interlocking Kelly bar"
(https://www.kellytractor.com/eng/products/foundation_drilling/drilling_tools.aspx).

**Naming.** `AF nnn`. The number tracks the torque class but is **not** the exact
figure — the AF 240 has 275 kNm installed torque. `UNVERIFIED` as a formula.
Model list seen consistently across aftermarket Kelly-bar suppliers: AF 100,
AF 130, AF 180, AF 200, AF 240, AF 270, AF 300, AF 400
(https://www.drilling-kellybar.com/sale-14468840-jthl-imt-af180-af200-af240-af270-af300-a-drilling-machine-combined-interlock-kelly-bar.html).

The IMT Kelly bar carries **automatic interlocking blocking, patented by IMT**,
which "permits the transfer of pull down, pullback and torque very quickly" from
any position (AF 240 datasheet). That is a genuinely brand-scoped feature — see §C.

## A.7 MAIT S.p.A. — Italy

**Who.** Multi-purpose Italian rotary rigs. "The HR series are multi-purpose
machines that can be equipped with different kits for drilling with Kelly Bars,
Continuous Flight Auger, Diaphragm Walls, Pile Driving, Hydraulic hammers, and
Down the Hole Hammer" (http://mait.it/products/hr180.html ;
https://www.maitusa.com/machine/27). That DTH + Kelly + d-wall breadth on one
carrier is the distinguishing trait.

**Naming.** `HR nnn` — the number is the **nominal rotary torque in kNm**: the
HR 260 is specified with "Nominal Rotary Torque of 260 kNm"
(https://www.maitusa.com/machine/27 ; https://cranemarket.com/specs/mait/hr-180).
Known models: HR 130, HR 180, HR 200, HR 260, HR 300, HR 800
(https://ccc1101.en.made-in-china.com/product/iSymLITbbvYl/China-Main-Winch-Gear-for-Mait-Drilling-Rigs-Hr180-Hr-260-Hr-300-Hr-800.html).

`UNVERIFIED`: I did not confirm current ownership or any insolvency history.
**Do not state anything about the company's corporate situation.**

## A.8 TESCAR (TES CAR S.r.l.) — Osimo (AN), Italy

**Who.** The compact/midi access specialist. "In 1985 Tescar brought to market
the first 'mini-drills' for foundation piles, today recognised worldwide as
**CF SERIES**" (https://www.tescar.com/cms/sezione.php?id_sezione=133154354871875).
The pitch is access: rigs "capable of working in narrow and limited access
spaces". They also build a CFA line (TT8,
https://www.directindustry.com/prod/tescar-srl/product-99606-2833552.html).
This manufacturer is also relevant to §E — see the "Tactex" question.

**Naming.** `CF n` / `CF n.n`. `UNVERIFIED` as a formula, but the published bands
are: mini rigs **12–40 kNm, 5–13 t**; medium **60–100 kNm**; large **180–230 kNm**
(https://westernequipmentsolutions.com/equipment/tescar/ ;
http://drsdrills.wpengine.com/tescar-drilling-and-foundation-equipment/).

## A.9 COMACCHIO — Riese Pio X (Venice), Italy

**Who.** The volume player at the micro end — "a wide range of quality specialist
foundation equipment and accessories at their factory in Venice"
(https://www.agd-equipment.co.uk/comacchio-foundation-equipment.html). Sold for
micropiles, anchors, soil nails, jet grouting and consolidation.

**Naming.** `MC nn` — the number tracks **operating weight in tonnes**:
MC 8 ≈ 9–10 t, MC 14 ≈ 14–15.5 t, MC 22 ≈ 22–24 t
(https://www.comacchio.com/en/products/foundations-and-ground-improvement/microdrilling/ ;
https://nppius.com/micro-drill-rig/comacchio-mc-14/ ;
https://nppius.com/micro-drill-rig/comacchio-mc-22/).

Two sub-lines that matter for the visual read (§D): **fully articulated
multipurpose rigs** vs **vertical multipurpose rigs**
(https://www.comacchio.com/en/products/foundations-and-ground-improvement/microdrilling/fully-articulated-multipurpose-rigs/mc-8-1051310867.html ;
.../vertical-multipurpose-rigs/mc-4-942706521.html).
Modularity claim worth stealing for the shop: every MC takes "a wide range of
rotary heads, hydraulic drifters, double head systems, water and mud pumps".

## A.10 JUNTTAN — Kuopio, Finland

**Who.** The driven-piling specialist, and the strongest local source we have —
the user holds four Junttan PDFs. "Over 45 years" of purpose-built hydraulic
piling equipment (local `Junttan_Hammers_brochure_EN_2025_web.pdf`). Their whole
argument is *purpose-built*: self-erecting leaders, transport in one piece
without removing the hammer, low centre of gravity, expandable tracks and a
movable counterweight for raked piling, and hammers with "a measured efficiency
ratio of more than 95%" of impact energy into the pile
(local `16291_Junttan_Piling_brochure_3_2013_WEB.pdf`, `Junttan_Hammers_brochure_EN_2025_web.pdf`).
They are also explicit that hydraulic beats diesel on noise, vibration and
emissions, and that biodegradable hydraulic oils can be used — the sustainability
angle is on the tin, and it is a real differentiator in Nordic urban piling.

### Naming conventions — Junttan (all from local files)

| Designation | What the number encodes | Evidence |
|---|---|---|
| **PM nn** — pile driving rig | Size/class index. Correlates with rig size and pile length but is **not** a clean formula: PM16 max pile 16 m ✔ but PMx22 max pile 20 m ✘. The 2013 brochure shows the old names in brackets — "PMx20 (PM20L)", "PMx22 (20LC)", "PMx24 (20HLC)", "PMx25 (25LC)" — so the modern `PMx nn` replaced an older `PM nn` + L/C/H letter scheme. `UNVERIFIED` as a formula. | `16291_Junttan_Piling_brochure_3_2013_WEB.pdf` |
| **H suffix** (PM25H) | Heavier, telescopic-leader version — "Junttan's biggest pile driving rig with telescopic leader … for heavy duty use" | `13915_Junttan_PM25H_Datasheet.pdf` |
| **x suffix** (PMx, DSx, HHx) | The **X-series** generation, with the Junttan **X control system** | 2013 brochure, 2025 hammers brochure |
| **DSx nn** | Deep stabilisation (soil mixing) rig | DSx15, DSx18 — 2013 brochure |
| **HHK nn** — hydraulic impact hammer | **ram block weight in tonnes.** HHK16S = 16,000 kg ram; HHK25S = 25,000 kg. Multi-number names (HHK 16/18/20/22S) list the **selectable ram weights** the same frame accepts — the frame is modular. | `HHK16-22S-Datasheet.pdf`, `Junttan_Hammers_brochure_EN_2025_web.pdf` |
| **SHK n** | Same rule, X-series frame: SHK3 = 3,000 kg ram | 2025 hammers brochure |
| **HHX nnn** — new-generation hammer | **max. energy in kNm**, not ram weight: HHX160 = 160 kNm, HHX500 = 500 kNm. **Two different rules inside one product family** — worth modelling as a deliberate gotcha. | 2025 hammers brochure |
| **VH nnn** — vibratory hammer | **eccentric moment in kgm**: VH25 = 25 kgm, VH120 = 120 kgm, VH200 = 203.2 kgm | `Junttan_VH120_vibro-hammer_datasheet-1.pdf`, `Junttan_Vibratory_Hammers_brochure_2023_web.pdf` |
| **VHnnVM** | Variable-moment vibrator; number = **max.** eccentric moment in kgm (range 0–nn) | Vibratory hammers brochure |
| **PP nnn** | Power pack; number ≈ hydraulic class. PP200 = 160 kW, PP1400 = 810 kW, PP2000 = 1,170 kW. `UNVERIFIED` as a formula. | 2025 hammers brochure |
| **xCU** (15XCU, 20XCU) | X-series power pack for impact hammers | 2025 hammers brochure |
| **JD n** | Rotary head (side drill) for the drilling configurations | PM25H datasheet ("Side auger JD3"); 2013 brochure |

**The physics behind the hammer names — verify any invented hammer against this.**
Max energy = ram mass × g × stroke. HHK16S: 16,000 kg × 9.81 × 1.5 m = **235 kNm**,
and the datasheet says 235 kNm. HHK16/18S: 18,000 × 9.81 × 1.5 = 265 kNm,
datasheet says 265 kNm. If an invented hammer's energy does not equal
ram × 9.81 × stroke, it is wrong.

**Methods.** Driven piling (precast concrete, steel tube, sheet, timber) ·
driven cast-in-situ (DCIS) · displacement bored piles · CFA · Kelly ·
deep stabilisation / soil mixing · vibratory driving and extraction ·
dynamic compaction (excavator-integrated hammer). The PM26 and PM28 are sold as
**multipurpose** rigs that do all of DCIS/CFA/Kelly/displacement on one carrier
(2013 brochure).

## A.11 ABI Gruppe / DELMAG — Niedernberg, Germany · and SPD (Sweden)

**Who.** ABI's **MOBILRAM** is the archetypal European multi-purpose leader rig —
drilling, vibrating and pressing piles off one telescopic-leader machine
(https://www.hammersteel.com/abi-mobilram.html). **DELMAG** is the diesel-hammer
name, in the business since the 1930s: "In 1940 the first D 5 diesel pile hammer
(piston weight of 500 kg) was built"
(https://www.hammersteel.com/cmss_files/attachmentlibrary/DELMAG_Maeklerprospekt_en_0210.pdf).
**SPD** — Scandinavian Pile Driving SPD AB, Sala, Sweden — is a wholly owned ABI
subsidiary since 2023; see §E.

### Naming conventions — ABI / Delmag

| Designation | What the number encodes | Evidence |
|---|---|---|
| **D nnn** — Delmag diesel hammer | **piston (ram) weight in kg ÷ 100.** Stated directly: *"DELMAG manufactures diesel pile hammers from sizes D 6 (600 kg piston weight) up to D 200 with a piston weight of 20,000 kg"*, and the first hammer, the D 5, had a 500 kg piston. | DELMAG lead systems brochure, https://www.hammersteel.com/cmss_files/attachmentlibrary/DELMAG_Maeklerprospekt_en_0210.pdf |
| **D nn-nn suffix** (D 12-42, D 25-32, D 30-32, D 62-22) | Generation/version of the same piston size | Same brochure |
| **TM nn / nn** — Mobilram leader | Two-number telescopic-leader designation. `UNVERIFIED`: I could not source an ABI page that defines the two numbers (abi-group.com detail page 404'd). The widely-repeated reading is *retracted / extended usable leader length in metres*, but I could not confirm it — **do not state it as fact.** "Mobilram TM 13 is the smallest machine of the new leader mast generation"; leader stroke available "up to 82 feet". | https://www.hammersteel.com/abi-mobilram.html ; https://www.hammersteel.com/abi-mobilram-tm-24.html ; https://www.intrabv.com/en/machine/tm-18-22-hd/ |
| **MRZV** | ABI hydraulic vibrator series. `UNVERIFIED` — no figures confirmed; **do not quote MRZV specs.** | — |
| **HD suffix** | Heavy-duty variant (TM 18/22 HD) | https://www.intrabv.com/en/machine/tm-18-22-hd/ |

**The diesel-hammer trade-off, worth modelling.** A diesel hammer needs no power
pack and no hoses — it is self-contained, cheap to mobilise and famously
unkillable. It is also loud, smoky and has a variable stroke that depends on soil
resistance: the DELMAG brochure notes stroke "up to 3.7 m, depending on soil".
Against that, Junttan's whole pitch is that hydraulic hammers "generate less noise
and reduce vibration and harmful emissions" than "conventional diesel hammers and
mechanical piling rigs" (Junttan 2013 brochure). That is a real, sourced
progression axis for the game: **cheap/dirty/self-contained → expensive/clean/
controlled, with the clean option unlocking noise-restricted urban jobs.**

## A.12 CZM Foundation Equipment — Contagem (Belo Horizonte), Brazil + Savannah, GA, USA

**Who.** "Over 40 years of experience in manufacturing foundation equipment",
two plants — Savannah, Georgia and Contagem, Minas Gerais — exporting to over
25 countries (https://czm.com.br/wp-content/uploads/2024/11/EK200.pdf). Like IMT
they mount on a **Caterpillar excavator base** ("mounted on a CAT base, keeping
the operation and maintenance extremely friendly and efficient"), which is their
commercial argument in the Americas. Named among the market leaders alongside
Soilmec, Liebherr, Casagrande, Junttan and Bauer
(https://pilebuck.com/buyers-guide-foundation-drilling-rig/).

**Naming.** `EK nnn`. `UNVERIFIED` as a formula — the EK250 is quoted at
234,000 ft·lb ≈ 317 kNm (https://cranemarket.com/specs/czm-foundation-equipment/ek250),
which does not match the number. Known models include EK60, EK200, EK250.
Technical signature: the patented **"Bottom Drive CFA"** torque mechanism, which
lets one machine switch between Kelly and CFA "without changing a single hydraulic
hose", plus an interlocking Kelly bar and a long-stroke rotary (EK200 brochure).

## A.13 SANY · XCMG · ZOOMLION — China

**Who.** The three Chinese majors, and the reason the mid-market repriced. All
three converged on the **same naming rule**, which makes them the easiest brands
in the world to read off a spec sheet.

| Brand | Series | Rule | Evidence |
|---|---|---|---|
| **SANY** | `SR nnn` | **max. output torque in kNm, exactly** | SR155 = 155 kNm; SR285 = 285 kNm — https://equipmentindia.com/construction-equipment-updates/equipment-features-and-details/know-your-machine/Sany-Piling-Rig-SR-285R/115769 ; https://www.sanyamerica.com/wp-content/uploads/2023/03/PORECH22SR285M001-sany-drill-rig-4pg-specsheet-d1.pdf |
| **XCMG** | `XR nnn` | **max. output torque in kNm** (approximately — XR200E = 210 kNm) | XR150D = 150 kNm; XR460D = 460 kNm; XR200E = 210 kNm — http://en.xcmg.com/en-ap/product/product-detail-119068.htm ; https://buyxcmg.com/product/xr150d/ ; https://www.machinerynw.com/inventory/v1/Current/XCMG/Piling-Machinery/XR-Series-Rotary-Drilling-Rig/XR460D---24581241 |
| **ZOOMLION** | `ZR nnn` | **max. torque in kNm** (approximately — ZR420 = 430 kNm) | ZR140 = 140 kNm; ZR220A = 220 kNm; ZR300D = 300 kNm; ZR420 = 430 kNm — https://zoomlion.nt-rt.ru/images/manuals/ZR220A.pdf ; https://en.zoomlion.com/news/news-detail-614002.htm ; https://beijingxlhj.com/product/rotary-drilling-rig-zoomlion-zr420/ |

**Naming collision to be aware of.** `SR` means **Sany rotary rig, torque in kNm**
*and* **Soilmec rotary rig, weight in tonnes**. A "SR-45" and an "SR455" are not
the same kind of statement at all. This is a genuinely good source of in-game
friction: a catalogue that reads the wrong prefix rule mis-sizes the machine.

## A.14 Vibratory and impact hammer makers

### PVE / Dieseko Group — Netherlands

**Naming — and this one has two coexisting conventions, both real:**
- `PVE 38M` → leading number = **max. eccentric moment in kgm** (0–38 kgm)
  (https://www.sheetpilinguk.com/wp-content/uploads/2020/08/spec-sheet-PVE-38M.pdf)
- `PVE 23VML` → 0–23 kgm at 2,300 rpm
  (https://diesekogroup.com/products/vibratory-hammers/pve-23vml/)
- `PVE 2316VM` → **four digits = frequency then eccentric moment**: 2,300 cpm /
  0–16 kgm (https://www.diesekogroup.com/products/vibratory-hammers/pve-2316vm-rental/)

`VM` = variable moment, `M` = moment, `L` = a frame/length variant (`UNVERIFIED`).
Dieseko also owns the **ICE** brand and the **Woltman** piling-rig brand
(https://diesekogroup.com/our-brands/pve/ ; https://diesekogroup.com/piling-drilling-rigs/),
and builds the very large offshore **PVE GIANT / 500MU upending vibros**
(https://www.diesekogroup.com/innovations/pve-500mu-upending-vibro/).

### ICE — International Construction Equipment (Netherlands / USA)

`ICE 416L`: eccentric moment 23 kgm, max. centrifugal force 645 kN, max. frequency
1,600 rpm (https://www.diesekogroup.com/products/vibratory-hammers/ice-416l/ ;
https://pilequip.com.au/wp-content/uploads/2021/02/6-Info-416L-Rev-May2017.pdf).
`UNVERIFIED`: what "416" encodes — it matches neither the moment nor the force.
The `L` suffix is a variant of the base Model 416.

### MOVAX — Finland

Excavator-mounted **side-grip** vibratory pile drivers — a genuinely different
machine archetype (no leader at all; the excavator boom *is* the leader).

**Naming: `SG-nn` = max. centrifugal force in kN ÷ 10.**
- SG-60: 600 kN max. centrifugal force, 6.1 kgm eccentric moment, 2,300–3,000 rpm,
  2,550–2,850 kg (https://www.w-h.co.uk/wp-content/uploads/movax-sg-60-2020.pdf)
- SG-75: 750 kN, 7.6 kgm, 2,300–3,000 rpm, 3,330–3,588 kg, 1,270 mm wide,
  for **33–40 t excavators**
  (https://premierrockmachinery.machines4u.com.au/buy/sg-75-335749)

Positioning: "the SG-75 is designed for larger excavators whereas the SG-45 to
SG-60 models are the optimum choice for medium sized excavators"; these are
high-frequency drivers with fixed eccentric moment, with resonance-free variable
moment available on other models
(https://www.movax.com/en-GB/products/pile-drivers/).

### IQIP (formerly IHC Hydrohammer) — Netherlands

**`S-nnnn` = max. blow energy in kJ.** The S-series spans **S-30 to S-2000**;
the S-90 delivers 90 kJ and the S-280 delivers 280 kJ
(https://26117396.fs1.hubspotusercontent-eu1.net/hubfs/26117396/Downloads_website/Datasheets_EN/S-series.pdf ;
https://iqip.com/products/pile-driving-equipment/hydrohammer/hydrohammer-s-series/).
This is the cleanest energy-class ladder published by anyone and is the natural
model for a game's hammer tier list.

### MENCK — Germany

**`MHU nnnn` ≈ rated energy in kJ.** MHU 3500S delivers 3,500 kJ; the MHU 270T is
rated 300 kJ at surface (https://acteon.com/solutions/project-lifecycle/offshore-construction/integrated-marine-foundation-installation-services/hydraulic-hammers ;
https://www.offshore-energy.biz/menck-worlds-largest-hammer-for-sandbank-subsea-ops/).
Offshore/subsea monopile driving is their segment — the top of the entire piling
energy scale.

### MÜLLER, APE, BSP

`UNVERIFIED` — I could not reach primary technical pages for Müller (MS-D / MS-V),
APE or BSP within this pass. **Do not quote figures for these three.** The
classification vocabulary in §B.6 applies to them identically.

### GIKEN — Japan (press-in)

The **Silent Piler** press-in method: no impact, no vibration, reaction taken from
already-installed piles. Listed here as the fourth installation physics alongside
impact, vibration and rotation. `UNVERIFIED`: model-series naming (F series, ECO,
SCU, Zero) not confirmed from a Giken source this pass.

## A.15 Diaphragm wall / trench cutter side

### Bauer (BC / BCS / CBC / Cube)

The originator — first trench cutter BC 30 in 1984 (BG 45 brochure timeline).
Product architecture, which is worth copying wholesale as a game system: the
**cutter** (BC nn) + the **carrier** + the **hose drum system** (HDS) + the
**power pack** (HD diesel / HE electric) are four separately-specified units that
combine (https://equipment.bauer.de/en/trench-cutters-cutter-systems).
The bauma 2025 configuration on display was literally written as a sum:
**"BCS 185 power pack + HDS 90-T + BC 35"**.

### Casagrande (KRC, FD)

KRC = the lighter cutter for "medium hard to soft soils" mounted on a B-series or
C-series carrier; FD60 / FD70 = the heavy hydromills
(https://casagrandegroup.com/equipment/krc1c20/ ;
https://www.casagrandegroup.com/diaphragm-wall/hydromills/).

### Soilmec

Builds hydromills and diaphragm-wall grabs. `UNVERIFIED`: the specific
Soilmec cutter model-series prefix could not be confirmed this pass (site 403).

### LEFFER — Stahl- und Apparatebau Hans Leffer GmbH & Co. KG, Saarbrücken

**Who.** Founded 1949 (https://de.linkedin.com/company/stahl--und-apparatebau-hans-leffer-gmbh-&-co-kg).
The casing-oscillator house. Products:
- **VRM** hydraulic casing oscillators — casing diameters **1,300 to 3,800 mm**;
  `KL` = short design with a five-link clamp
  (https://www.lefferna.com/product/hydraulic-casing-oscillators-vrm/)
- **RDM** hydraulic casing rotators (same source)
- **Double-wall casings**, casing joints, bottom casings and accessories for
  fully cased pile boring, "large diameter (up to 2 m) and deep (up to 100 m)"
  (https://www.lefferna.com/product/casing-and-accessories/)
- Claims the world's most powerful hydraulic casing oscillator at **23,000 kNm**
  projected torque and **11,780 kN** lifting capacity
  (https://www.leffer.de/en/Strength-counts_39_aktionen.html)

`UNVERIFIED`: Leffer's corporate relationship to Bauer or Liebherr. Both Leffer
and Liebherr use a `VRM` designation for casing oscillators, but I found no source
establishing an ownership link, so **do not assert one**. Note also that
Leffer North America (lefferna.com) is a distinct entity from leffer.de.

## A.16 Bonus from the local files — HMH / Wirth pile-top RCD

Not on the brief, but the local file `2022-12-PBA-brochure.pdf` documents the
**absolute top end of foundation drilling diameter** and deserves a place in the
class ladder. HMH (building on the historic **Wirth** brand) makes **pile top
drill rigs (PBA)**, also called **reverse circulation drilling (RCD)** rigs, that
clamp onto the casing rather than sitting on a crawler. Six models cover
**Ø 0.6 m to 8.5 m**. Applications include offshore wind, marine structures,
bridges, dam rehabilitation and ventilation shafts; drilling applications include
rock drilling, rock socketing, underreaming, bell-out of the rock socket, pile
cutting and milling of deformed casings.

---

# B. Capability envelope tables

## B.1 THE DECODER — what the number in a model name means, by brand

This is the single most useful table in the file for the "fits rig" facet, and it
is the thing most people get wrong. **There is no industry-wide convention.**
Five different rules are in simultaneous use.

| Brand & series | Rule | Worked example |
|---|---|---|
| Bauer **BG nn** | torque kNm ÷ 10 | BG 45 → 461 kNm |
| Bauer **KDK nnn** | torque kNm | KDK 460 → 460 kNm class |
| Bauer **BTM nnn** | casing torque kNm | BTM 600 → 600 kNm |
| Liebherr **LB nn** | torque kNm ÷ 10 | LB 30 → 297 kNm |
| Casagrande **Bnnn** | torque kNm | B300 → 300 kNm |
| Mait **HR nnn** | torque kNm | HR 260 → 260 kNm |
| Sany **SR nnn** | torque kNm | SR285 → 285 kNm |
| XCMG **XR nnn** | torque kNm | XR460D → 460 kNm |
| Zoomlion **ZR nnn** | torque kNm | ZR300D → 300 kNm |
| Klemm **KH nn** | torque kNm | KH 47 → 46.8 kNm |
| Klemm **KD xxyy** | torque kNm + piston kg | KD 4724 → 47 kNm / 24 kg |
| **Soilmec SR-nn** | **operating weight, tonnes** | SR-95 → ~91–93 t (torque 301 kNm) |
| **Comacchio MC nn** | **operating weight, tonnes** | MC 22 → 22–24 t |
| **Klemm KR nnn** | **nothing** — family code only (4–32 t across the series) | KR 720 → 32.0 t, KR 909-3G → 13.6 t |
| **Junttan HHK nn / SHK n** | **ram block weight, tonnes** | HHK25S → 25,000 kg ram |
| **Junttan HHX nnn** | **max. energy, kNm** | HHX350 → 350 kNm |
| **Junttan VH nnn** | **eccentric moment, kgm** | VH120 → 120 kgm |
| **Delmag D nnn** | **piston weight, kg ÷ 100** | D 62 → 6,200 kg piston |
| **IQIP S-nnnn** | **blow energy, kJ** | S-280 → 280 kJ |
| **Menck MHU nnnn** | **blow energy, kJ** | MHU 3500S → 3,500 kJ |
| **Movax SG-nn** | **centrifugal force, kN ÷ 10** | SG-75 → 750 kN |
| **Bauer MR nnn** (RTG) | **centrifugal force, kN ÷ 10** | MR 150 → 1,500 kN |
| **PVE nnM / nnVM** | **eccentric moment, kgm** | PVE 38M → 0–38 kgm |
| **PVE nnnnVM** | **frequency + eccentric moment** | PVE 2316VM → 2,300 cpm / 0–16 kgm |
| Bauer **BC nn**, Liebherr **LRB**, IMT **AF**, CZM **EK**, ICE **nnn**, TESCAR **CF**, Junttan **PM** | `UNVERIFIED` — size index, no confirmed formula | — |

**Design note for the shop.** Model that split. A "torque-named" brand and a
"weight-named" brand should read differently in the UI, and an in-game
cross-reference/"AI cross-reference" upgrade (`PLATFORM_TRUTH.md` Part A) has an
obvious job: translating between the naming rules so a player can see that a
150 kNm class part fits three differently-named machines.

## B.2 Rotary foundation rig class ladder

The core table. Sorted small → large. All figures are per-source; where a rig
has several configurations the range is given.

| Model | Op. weight (t) | Max torque (kNm) | Max pile Ø (mm) | Max depth (m) | Crowd / pull (kN) | Engine (kW) | Source |
|---|---|---|---|---|---|---|---|
| Casagrande C6 XP-2 | ~small crawler drill | 15.2 | — | — | 87 (100 opt.) extraction/crowd | 142 (190 hp) | casagrandegroup.com/crawler-drills/xp-2-series-crawler-drills/c6/ |
| Comacchio MC 8 | 9–10 | 4.5–23.2 (3,319–17,148 lb·ft) | — | — | 53.8 (12,100 lb) feed | ~97 (130 hp) | nppius.com/micro-drill-rig/comacchio-mc-8d/ |
| Comacchio MC 14 | 14–15.5 | — | — | — | ~60 (6,000 daN) feed | 119 | nppius.com/micro-drill-rig/comacchio-mc-14/ |
| Comacchio MC 22 | 22–24 | — | — | — | — | 180–205 | nppius.com/micro-drill-rig/comacchio-mc-22/ |
| Klemm KR 720 | 32.0 | (head-dependent, KH 4–62) | — | — | — | 123 | KLEMM_Lieferprogramm_Product_Range.pdf |
| TESCAR CF 2.5 Compact | 8.2 | 40 | 1,000 | 18 | — | 55 | westernequipmentsolutions.com/equipment/tescar/ |
| TESCAR CF6 | — | 60 | — | 30 | — | 78.5 | same |
| Soilmec SR-30 | ~35 class | 130–131 | 1,500 / 3,000 | 37.7 / 47.5 | — | 149 | heavyquipmag.com (2021-05-21); akselafoundation.com |
| Bauer BG 15 H BT 50 | — | 150 | 1,500 | 44.0 | — | — | bauer-equipment.com/en/drilling-rigs-h-kinematics |
| Casagrande B125 XP-2 | — | 125 | — | — | — | — | casagrandegroup.com/piling-rigs/xp-2-series/ |
| Casagrande B175 XP-2 | 44 | 175 | — | — | — | — | casagrandegroup.com/product/b175/ |
| Soilmec SR-45 | 35 (min. transport) | 185 | 3,000 | 65 (LDP) | CCS 207/140 · WCS 240/240 | 201 | 3cdrilling.com/.../Soilmec-SR-45-drill-rig.pdf |
| Bauer BG 20 H BT 50 | — | 204 | 1,300 | 40.0 | — | — | bauer-equipment.com H-kinematics |
| Liebherr LB 20.1 | 52.8 | 200 | 1,500 | 34.5 | — | — | liebherr.com LB series |
| Soilmec SR-60 | ~60 class | 212 | — | 77.5 (LDP), 22 (CFA) | — | — | soilmec.com/DownloadFile.aspx?id=305 (via archiexpo listing) |
| Bauer BG 23 H BT 65/75 | — | 235 | 1,500 | 31.0–53.7 | — | — | bauer-equipment.com H-kinematics |
| Bauer BG 23 BT 65 (V) | — | 235 | 1,700 | 51.4 | — | — | equipment.bauer.de V-kinematics |
| Casagrande B250 XP-2 | — | 250 | — | — | — | — | casagrandegroup.com/piling-rigs/xp-2-series/b250/ |
| Soilmec SR-65 | ~65 class | ~258 (190,000 ft·lb) | — | — | — | ~272 (365 hp) | westernequipmentsolutions.com/a-deep-dive-into-the-soilmec-sr-65-performance-and-capabilities/ |
| Mait HR 260 | 75 | 260 | — | — | — | 328 (440 hp) | maitusa.com/machine/27 |
| CZM EK200 | — | `UNVERIFIED` | 1,800 / 2,200 | 45 (std mast) / 55; CFA 24 | 364 crowd | 261 (350 hp), CAT 336 base | czm.com.br/.../EK200.pdf |
| IMT AF 240 | 80 | 275 (installed) | 450–2,000 | 66 | push 300 / pull 390 | 277, CAT 345 C HHP base | kellytractor.com/.../AF_240.pdf |
| Bauer BG 30 H BT 75 | 63.4 (transport, w/o counterweight) | 300 / 280 (casing / drilling) | 2,500 | 65.7; 30 in FDP (Ø410) | 565 pull (SPEX config) | 340, CAT C9.3 | bauma 2025 catalogue; bauer-equipment.com |
| Bauer eBG 33 H (all-electric) | — | 300 @ 50 rpm | 2,500 | 68.6 | main winch 215 / 240 | 420 system; ~8 h off-grid Kelly cycle, ~7 h charge @125 A/400 V | bauma 2025 catalogue |
| Casagrande B300 XP-2 | 90 | 300 | — | — | — | — | casagrandegroup.com/product/b300/ |
| Liebherr LB 30 | 73.6–84.6 | 297 | 3,400 | 70.8 | — | — | liebherr.com LB series |
| Soilmec SR-95 HIT | 90.8 (CCS) / 92.9 (WCS) | 301 rotary; auger 250 (int.); casing 252 | 2,100–3,400 (4,090–4,800 extended) | 70 (friction Kelly) – 101.7 (locking) ; CFA 24–34.5 | CFA extraction 1,110 | 450 @1,800 rpm (603 hp), CAT C15 / Cummins X15 | soilmec.co.uk/.../SR-95_HIT_rev_11-2020.pdf |
| Bauer BG 33 BT 85 (V) | — | 342 | 2,500 | 72.4 | — | — | equipment.bauer.de V-kinematics |
| Liebherr LB 35.1 | 99.0–111.1 | 347 | 4,100 | 77.5 | — | — | liebherr.com LB series |
| Bauer BG 36 H BT 85 | 74.6 (transport, w/o counterweight) | 385 / 340 (casing / drilling) | 2,500 | 68.0 | 690 with Crowd Plus; main winch 290 | 405, Volvo TAD 13 | bauma 2025 catalogue; bauer-equipment.com |
| Bauer BG 36 BS 95 (V) | — | 385 | 2,500 | 100.0 | — | — | equipment.bauer.de V-kinematics |
| Bauer BG 45 BS 95 | 146 (as shown) | 461 nominal | 3,700 | 100.0 | (KDK 390 S / KDK 460 S) | 433, CAT C15 @1,850 rpm | ecanet.com BG 45 PremiumLine PDF |
| Liebherr LB 45.1 | 115.5–133.2 | 450 | 4,500 | 95.0 | — | — | liebherr.com LB series |
| Bauer BG 50 BT 145 | — | 500 | — | max height 42.2 m | — | 470 | equipment.bauer.de V-kinematics |
| Bauer BG 55 BS 115 | — | 553; in CCFA config 600 casing (BTM 600) / 240 auger | 3,700 | 126.0; CCFA Ø1,000 → 24.1 | 1,060 (crowd + main winch) | 597, CAT C18 | equipment.bauer.de; bauma 2025 catalogue |
| Liebherr LB 55 | 162.5–178.2 | 557 | 4,800 | 120.4 | — | — | liebherr.com LB series |
| Soilmec SR-125 HIT | 128 | — | — | — | — | CAT C18 | archiexpo.com/prod/soilmec-spa/product-156638-1876228.html |
| Bauer BG 72 BT 180 | — | `UNVERIFIED` | — | — | — | — | named as the top V-line model, BG 45 brochure p.5 |

**Archive Liebherr models** (figures via search summaries of Liebherr's own
data-sheet-archive PDFs, **not read directly — treat as indicative**):
LB 24 = 252 kNm / 75.0–76.0 t; LB 28 = 286 kNm / 95.0–95.6 t
(https://www.liebherr.com/shared/media/construction-machinery/deep-foundation/pdf/data-sheet-archive/lb-series/).

### Very-large-diameter outlier: pile-top RCD (HMH / Wirth PBA)

| Model | Ø range (m) | Swivel torque (kNm) | Speed (rpm) | Thrust (kN) | Pullback (kN) | Rig weight (kg) |
|---|---|---|---|---|---|---|
| 408/1300/200 | 0.6–1.3 | 81 | 38 | 400 | 650 | 17,000 |
| 615/2000/300 | 1.2–2.0 | 150 | 23 | 500 | 1,000 | 19,500 |
| 818/2500/300 | 1.5–2.5 | 182 | 24 | 800 | 1,300 | 27,000 |
| 936/3200/300 | 2.0–3.2 | 360 | 20 | 1,100 | 1,700 | 32,000 |
| 1045/3200/330 | 2.5–4.5 | 455 | 22 | 1,100 | 2,000 | 34,000 |
| 1450/6000/330 | 3.0–8.5 | 500 | 15 | 1,400 | 4,000 | 75,000–120,000 |

Source: local `2022-12-PBA-brochure.pdf`. Power packs HP IVa 261 kW / HP Va
447 kW / HP VI 470 kW.

## B.3 Class boundaries — where one class ends and the next begins

The industry does **not** publish official class boundaries. These are **my
synthesis** of the sourced tables above, chosen so that each boundary falls in a
real gap in the data rather than mid-cluster. Treat as a game-design proposal,
not as an industry fact.

| Class | Op. weight | Torque | Typical max Ø | Typical max depth | Real machines that land here |
|---|---|---|---|---|---|
| **Micro / anchor** | < 12 t | ≤ 25 kNm | ≤ 300 mm | ≤ 30 m | Comacchio MC 4/MC 8, Klemm KR 704–801, Casagrande C6 |
| **Compact anchor & micropile** | 12–32 t | 25–62 kNm | ≤ 400 mm | ≤ 40 m (geothermal to 375–400 m+) | Klemm KR 805/806/807/717/720, Comacchio MC 14/22, Casagrande C8 |
| **Mini rotary** | 30–45 t | 60–150 kNm | ≤ 1,000–1,500 mm | ≤ 45 m | TESCAR CF series, Soilmec SR-30, Bauer BG 15 class |
| **Midi rotary** | 45–70 t | 150–260 kNm | 1,300–1,800 mm | 40–65 m | Bauer BG 20/23, Liebherr LB 20.1/LB 25, Soilmec SR-45/SR-60, Casagrande B125/B175, CZM EK200 |
| **Large rotary** | 70–110 t | 260–400 kNm | 2,000–2,500 mm | 65–100 m | Bauer BG 30/33/36, Liebherr LB 30/35, Soilmec SR-95, Casagrande B250/B300, Mait HR 260, IMT AF 240 |
| **Very large rotary** | 110–180 t | 400–600 kNm | 3,000–4,800 mm | 95–126 m | Bauer BG 45/50/55, Liebherr LB 45.1/LB 55, Soilmec SR-125 |
| **Ultra / specials** | 180 t+ or non-crawler | 500 kNm+ | up to 8,500 mm | method-limited | Bauer BG 72; HMH/Wirth pile-top RCD |

**The two boundaries that actually matter for gameplay**, because they gate work
rather than just scaling it:

1. **Midi → large, at roughly 260 kNm / 70 t.** Below it you are a piling
   subcontractor on housing and small bridges; above it you can cut a
   2,000 mm+ shaft and take deep infrastructure work. It is also where transport
   stops being routine — the large classes ship as multiple loads with the
   counterweight and sometimes the crawlers removed (Bauer quotes "transport
   weight w/o counterweight" as a headline figure, and the BG 55 gets a
   "mobilization package … jack-up system with optimized clearance width for
   crawler removal" — bauma 2025 catalogue).
2. **Compact → mini rotary, at roughly 60 kNm / 32 t.** Below it the machine is
   a *drill* (anchors, micropiles, jet grouting, rods and a drifter); above it
   the machine is a *pile rig* (Kelly bar, buckets, augers, casing). Different
   tooling, different tickets, different customer. Klemm's own series envelope
   stops exactly here at 32 t.

## B.4 Driven-piling rigs — Junttan ladder

All from local `16291_Junttan_Piling_brochure_3_2013_WEB.pdf` and
`13915_Junttan_PM25H_Datasheet.pdf`. **Note on reading the source:** the label
column in the first brochure table is offset by one row against the values;
the alignment below is de-shifted and cross-checked against the standalone PM25H
datasheet, which matches exactly.

| Model | Working weight (kg) | Leader capacity (kg) | Rec. ram weight (t) | Max pile length (m) | Engine (kW) | Winch pile / hammer (kg) | Undercarriage L × W (mm) |
|---|---|---|---|---|---|---|---|
| PM16 | 37,000 | 12,000 | 3–4 | 16 | 179 | 5,000 / 8,000 | 4,460 × 3,000–4,000 |
| PMx20 | 55,000 | 13,000 | 3–5 | 20 | 179 | 8,000 / 11,000 | 4,700 × 3,200–4,700 |
| PMx22 | 64,000 | 16,000 | 3–6 | 20 | 179 | 10,000 / 11,000 | 5,100 × 3,200–4,700 |
| PM23 (long-reach boom) | 65,000 | 14,000 | 3–5 | 20 | 179 | 8,000 / 10,000 | 5,700 × 3,200–4,700 |
| PMx24 | 68,000 | 18,000 | 4–6 | 24 | 179 | 10,000 / 12,000 | 5,100 × 3,200–4,700 |
| PMx25 | 70,000 | 18,000 | 5–7 | 24 | 227 | 10,000 / 12,000 | 5,700 × 3,200–4,700 |
| PM25H | 78,000 | 20,000 | 5–9 | 25 | 280 (Cummins QSM11) | 10,000 / 15,000 | 5,700 × 3,380–4,880 |
| PM30 | 110,000 | 35,000 | 9–12 | 32 | 280 | 12,000 / 20,000 | 5,700 × 3,500–5,000 |

**Multipurpose PM26 / PM28** (same source): working weight 95,000–100,000 kg;
leader capacity 30,000 kg; **max torque 400 kNm**; max pile Ø 2,000 mm (Kelly),
1,200 mm (CFA), 810 mm (displacement); max pile length 70 m (Kelly), 26 m (CFA),
32 m (displacement), 24 m (DCIS); working tube 35 m (displacement), 25 m (DCIS);
engine 388 kW (520 hp); main winch 25 t; **max extraction 100 t**;
**max pull-down 36 t**; undercarriage 5,700 × 3,500–4,770 mm.

Other detail worth stealing: PM25H hydraulics 2×280 + 120 l/min @2,000 rpm,
320 bar, 670 l oil tank; slew on a single 1,600 mm single-row slewing ring;
**extendable counterweight 6,000 + 2,000 kg**; track shoes 800/900/1,000 mm with
3-edge / chamfered / flat options.

## B.5 Impact hammer energy classes

**The vocabulary** (use these exact terms): **rated / max. energy per blow**
(kJ = kNm) · **ram (block) weight** · **stroke** · **blow rate** (blows/min) ·
**operating pressure** · **oil flow**. Energy = ram mass × g × stroke.

### Junttan HHK "Classic" series — the workhorse ladder
Local `Junttan_Hammers_brochure_EN_2025_web.pdf`; 1,500 mm stroke, 30–100 bl/min
unless noted.

| Model | Ram (kg) | Max energy (kNm) | Max energy w/ SB hydraulics | Op. pressure (bar) | Oil flow (l/min) | Hammer weight (kg) | Length (mm) |
|---|---|---|---|---|---|---|---|
| HHK3S | 3,000 | 44 | — | 134 | 188/227 | 5,650 | 6,580 |
| HHK5S | 5,000 | 74 | — | 150 | 280 | 7,900 | 7,320 |
| HHK5/7S | 7,000 | 103 | — | 211 | 280 | 10,400 | 8,060 |
| HHK5/7/9S | 9,000 | 132 | — | 271 | 280 | 12,900 | 8,800 |
| HHK10S | 10,000 | 147 | — | 150 | 565 | 16,200 | 7,264 |
| HHK10/12S | 12,000 | 177 | — | 181 | 565 | 19,000 | 7,764 |
| HHK10/12/14S | 14,000 | 206 | — | 211 | 565 | 21,800 | 8,264 |
| HHK10/12/14/16S | 16,000 | 235 | — | 241 | 565 | 24,400 | 9,636 |
| HHK16S | 16,000 | 235 | 262 | 241 | 565 | 23,200 | 8,170 |
| HHK16/18S | 18,000 | 265 | — | 271 | 565 | 26,100 | 8,490 |
| HHK16/20S | 20,000 | 294 | 320 | 290 | 565 | 28,300 | 8,810 |
| HHK16/18/20/22S | 22,000 | 320 | 350 | 300 | 565 | 40,700 | 9,130 |
| HHK25S | 25,000 | 368 | 400 | 244 | 860 | 40,700 | 7,995 |
| HHK25/28S | 28,000 | 400 | 450 | 273 | 860 | 45,400 | 8,235 |
| HHK25/30S | 30,000 | 441 | 500 | 290 | 860 | 48,000 | 8,375 |

Older HHK "A" variants (1,200 mm stroke, 40–100 bl/min): HHK3A 3,000 kg / 35 kNm;
HHK5A 5,000 / 59; HHK7A 7,000 / 82; HHK9A 9,000 / 106.

### Junttan X-series
| Model | Ram (kg) | Max energy (kNm) | Stroke (mm) | Blow rate | Pressure (bar) | Oil flow (l/min) | Weight (kg) |
|---|---|---|---|---|---|---|---|
| SHK3 | 3,000 | 36 | 1,200 | 50–140+ | 134 | 231/294 | 6,920 |
| SHK5 | 5,000 | 61 | 1,200 | 50–140+ | 134 | 231/294 | 9,250 |
| SHK7 | 7,000 | 89 | 1,200 | 50–140+ | 211 | 299/431 | 11,730 |
| SHK9 | 9,000 | 119 | 1,200 | 50–140+ | 271 | 299/431 | 14,800 |
| HHX160 | 9,910 | 160 | 1,000 | 60–180 | 200 | 700 | 19,400 |
| HHX210 | 14,140 | 210 | 1,000 | 60–180 | 280 | 700 | 25,600 |
| HHX250 | 16,260 | 250 | 1,000 | 50–150 | 220 | 880 | 28,800 |
| HHX300 | 20,510 | 300 | 1,000 | 50–150 | 280 | 880 | 34,800 |
| HHX350 | 22,610 | 350 | 1,000 | 50–150 | 290 | 880 | 37,600 |
| HHX500 | 28,860 | 500 | 1,200 | 40/50–150 | 320 | 860 | 46,700 |

Note the trade-off the X-series makes explicit and that a game should model:
**shorter stroke + much higher blow rate = same energy delivered faster**, and
the HHx is "especially designed for steel piles".

### The whole impact-energy scale, cross-brand

| Band | Energy | Ram / piston | Representative | Source |
|---|---|---|---|---|
| Light onshore | 35–60 kJ | 3–5 t | Junttan HHK3–5, Delmag D 30 class | local Junttan brochure; DELMAG brochure |
| Medium onshore | 60–150 kJ | 5–10 t | Junttan HHK7–10, HHX160 | local Junttan brochure |
| Heavy onshore | 150–320 kJ | 12–22 t | Junttan HHK12–22, IQIP S-280 | local; iqip.com |
| Very heavy / marine | 320–500 kJ | 25–30 t | Junttan HHK25–30, HHX500 | local |
| Offshore | 500–2,000 kJ | — | IQIP S-series to **S-2000** | iqip.com S-series datasheet |
| Monopile / subsea | 2,000–3,500 kJ+ | — | Menck **MHU 3500S** = 3,500 kJ | offshore-energy.biz; acteon.com |

Diesel-hammer scale for comparison: **Delmag D 6 (600 kg piston) to D 200
(20,000 kg piston)** (DELMAG brochure).

### Power packs — remember the hammer is not the whole purchase
A hydraulic hammer needs either the rig's own hydraulics or a separate pack.
Junttan's ladder (local 2025 hammers brochure): impact-hammer packs 15XCU
321 kW / 20XCU 503 kW, 350 bar; vibrator packs PP200 160 kW → PP2000 1,170 kW /
2,000 l/min. That is a real second purchase decision for the shop.

## B.6 Vibratory hammer classes

**The vocabulary** (these five numbers define a vibro, use them as the stat block):
**eccentric moment (kgm)** · **max. centrifugal force (kN)** · **frequency (rpm /
vpm)** · **amplitude (mm)** · **max. pulling (extraction) force (kN)**. Plus
**clamping force (kN)** for the clamp, which is a separate part.

### Junttan normal-frequency VH series
Local `Junttan_Vibratory_Hammers_brochure_2023_web.pdf` and
`Junttan_VH120_vibro-hammer_datasheet-1.pdf`.

| Model | Ecc. moment (kgm) | Centrifugal force (kN) | Frequency (rpm) | Pulling force (kN) | Clamping force (kN) |
|---|---|---|---|---|---|
| VH25 | 25 | 795 | 1,700 | — | 1,216 |
| VH30 | 32.6 | 1,036 | 1,700 | — | 1,216 |
| VH50 | 50.2 | 1,409 | 1,700 | — | 1,700 |
| VH80 | 82.6 | 2,318 | 1,700 | — | 3,560 |
| VH120 | 120 | 2,846 | 1,480 | 1,059 | 3,560 |
| VH200 | 203.2 | 4,380 | 1,400 | — | 1,858 × 4 |

VH120 detail (standalone datasheet): amplitude 26 mm, power 655 kW, oil flow
1,122 l/min, dynamic weight 9,145 kg, total weight 12,172 kg; recommended casing
clamp handles Ø 520–2,000 / 1,000–3,000 mm; runs on a PP1400 power pack
(810 kW, 1,460 l/min, 350 bar).

### Junttan variable-moment VH VM series
| Model | Ecc. moment (kgm) | Max centrifugal force (kN) | Frequency (rpm) | Amplitude (mm) | Max pulling (kN) |
|---|---|---|---|---|---|
| VH8VM | 0–8 | 464 | 2,300 | 13.8 | 12 |
| VH12VM | 0–12 | 698 | 2,300 | 13 | 235 |
| VH16VM | 0–16 | 934 | 2,300 | 12 | 235 |
| VH20VM | 0–20 | 1,166 | 2,300 | 13 | 471 |
| VH24VM | 0–24 | 1,370 | 2,300 | 15 | 471 |
| VH30VM | 0–30 | 1,746 | 2,300 | 13 | 706 |
| VH40VM | 0–40 | 2,348 | 2,300 | 16 | 942 |
| VH50VM | 0–50 | 2,923 | 2,300 | 16 | 1,060 |

**Why variable moment matters (a real mechanic, not flavour).** The phase shifter
moves the eccentric masses from 0° to 180°, so the machine can **start and stop
with zero eccentric moment** — "eliminating resonance", "resonance-free start and
stop", "significantly reduce disturbance to the surrounding soils"
(Junttan vibratory brochure). Fixed-moment vibros sweep through the soil's
resonant frequency on every start and stop. In game terms: VM costs more and
unlocks vibration-sensitive urban sites.

### Cross-brand vibro reference points
| Machine | Ecc. moment (kgm) | Centrifugal force (kN) | Frequency (rpm) | Weight (kg) | Source |
|---|---|---|---|---|---|
| Movax SG-60 (side grip) | 6.1 | 600 | 2,300–3,000 | 2,550–2,850 | w-h.co.uk movax-sg-60-2020.pdf |
| Movax SG-75 (side grip) | 7.6 | 750 | 2,300–3,000 | 3,330–3,588 | premierrockmachinery listing |
| ICE 416L | 23 | 645 | 1,600 max | — | diesekogroup.com; pilequip.com.au |
| PVE 38M | 0–38 | — | — | — | sheetpilinguk.com spec sheet |
| PVE 2316VM | 0–16 | — | 2,300 cpm | — | diesekogroup.com |
| Bauer/RTG MR 150 AVM | — | 1,500 | 2,500 | 5,070 | bauma 2025 catalogue |

MR 150 AVM extra: 480 kW hydraulic power at the vibrator, max recommended pile
weight 7,000 kg, plus a "SilentVibro package", an ACS-2 automatic coupling system
and a sheet-pile assistant (bauma 2025 catalogue).

## B.7 Trench cutters / diaphragm wall

| Machine | Height (m) | Panel length (mm) | Panel width (mm) | Torque (kNm) | Speed (rpm) | Depth (m) | Weight | Source |
|---|---|---|---|---|---|---|---|---|
| Bauer BC 32 | — | — | — | — | — | — | "the little lightweight … for carriers with limited hook load" | equipment.bauer.de/en/trench-cutter-bc-32 |
| Bauer BC 35 | 12.6 | 2,800 / 3,200 | 640–1,500 | — | — | 90 (in BCS 185 + HDS 90-T config) | cutter 34.7 t | equipment.bauer.de; bauma 2025 catalogue |
| Bauer BC 40 | 12.6 | 2,800 | — | 100 | 0–25 | — | — | efebauer.com/products/cutter-system/bc-40/ |
| Bauer BC 48 | 12.6 | 2,800 / 3,200 | 800–2,000 | — | — | — | — | equipment.bauer.de |
| Bauer BC 50 | 12.7 | 2,800 [3,200] | — | 120 max | 0–25 | — | — | geotechpedia.com/Equipment/Show/361 |
| Bauer CBC 30 Silent Cutter | — | — | — | — | — | 60 / 80 | MBC 30 cutter, HD 1400 / HE 1400 pack | equipment.bauer.de |
| Bauer Cube System | — | 2,400 | 640–1,000 | — | — | — | container 6.06 × 2.90 × 2.44 m | equipment.bauer.de |
| Bauer BCS 185 system | 20 / 24 | — | 1,200 (as displayed) | — | — | 90 | hook load 43–46 t; turning range −45°…95° | equipment.bauer.de; bauma 2025 catalogue |
| Casagrande KRC1 C20 | — | 2,500 | 300–600 | — | — | 20 | 28 t, 142 kW | casagrandegroup.com/equipment/krc1c20/ |
| Casagrande KRC2 HD B360 XP-2 | — | 2,200–3,000 | 500–1,500 | — | — | 46 | 100 t, 472 kW | casagrandegroup.com/equipment/krc2hdb360xp2/ |

**Soil mixing** (adjacent method, same carriers):
- Bauer **CSM** cutter-soil-mixing, and the electrified **eCSM**: 2 × 200 kW,
  0–40 rpm mixing wheels, panel 2,800 × 640 mm, 25% faster feed rate, 20% lower
  energy use (bauma 2025 catalogue).
- RTG **RG 27 S** with CSM: mixing gearbox 2 × 50 kNm, panel 2,800 × 550 mm,
  mixing depth 30.5 m, 128 t total, CAT C18 563 kW (bauma 2025 catalogue).
- **MSM CMD-65/4** multi-shaft mixing: up to 4 independent rotary drives,
  65.2 kNm max torque (1st gear), 118 rpm max (2nd gear), axis-centre distance to
  3,197 mm, panel to 25.3 m with 914 mm tools, mixing depth 25.3 m with RG 27 S
  (bauma 2025 catalogue).

**Support-fluid plant is part of the d-wall package** — do not forget it in the
shop. MAT (Bauer group) figures from the bauma 2025 catalogue: **BE 100**
desanding plant 100 m³/h, 17.3 kW, 300 mm cyclones; **BD 30-C** decanter
centrifuge 356 mm bowl, 3,900 rpm, 2,062 g, 37 + 11 kW; **CMS 50** batch mixing
plant 50 m³/h, 3,200 l slurry tank, 34.4 kW; **IPA 250-E** injection plant
250 l/min, 80 bar, 200 l mixer, 39 kW.

## B.8 Kelly bar sizing — the part that defines the rig's reach

From local `Emde-Bohrtechnik-Kellystangen.pdf` and
`2-2-EMDE-Katalog-Pfahlbohren.pdf` (EMDE Bohrtechnik, Nentershausen, an OEM
exclusive supplier of Kelly bars with "more than 1,000 delivered of the MD
series"). EMDE's own envelope: **2- to 4-fold telescopic, torque up to 500 kNm,
drilling depth up to 100 m, friction or locking type**, and the bar transmits
"the maximum permissible torque over the entire extended length".

| Torque class (kNm) | Outer pipe Ø (mm) | Sections | Drilling depth (m) | Transport length (m) | Weight (kg) |
|---|---|---|---|---|---|
| 100 | 292 | 3 | 17–35 | 7.9–13.9 | 3,250–5,350 |
| 150 | 343 | 3 | 21–33 | 9.5–13.5 | 4,750–6,350 |
| 200 | 343 | 3 | 21–39 | 9.5–15.5 | 4,900–7,450 |
| 200 | 394 | 4 | 28–52 | 10.0–16.0 | 6,600–10,100 |
| 300 | 394 | 3 | 24–45 | 11.5–18.5 | 6,350–9,650 |
| 300 | 470 | 4 | 32–60 | 11.5–18.5 | 8,300–12,900 |
| 400 | 470 | 3 | 24–45 | 11.5–18.5 | 7,850–12,150 |
| 400 | 546 | 4 | 32–60 | 11.5–18.5 | 10,100–15,850 |

**Read this table as the game's depth-vs-torque trade curve.** More sections
= more depth at the same torque, at the price of transport length and weight.
That is a genuine purchasing decision, not a difficulty slider.

## B.9 Casing size ladder

From local `bauer-maschinen-drilling-tools-and-casings-de-en-11-25_0.pdf`.
Bauer double-walled casings, standard OD/ID pairs — **this is the real diameter
ladder** and the shop should use exactly these steps:

**620/540 · 750/670 · 880/800 · 1000/920 · 1180/1100 · 1200/1120 · 1300/1220 ·
1500/1400 · 1800/1700 · 2000/1880 · 2200/2060 · 2500/2380 mm**

Lengths 1–6 m. Weight scales from 403 kg (620 mm × 1 m) to 14,360 kg
(2,500 mm × 6 m). Joint bolt count 8 → 24 with diameter.

Double-wall construction is not decoration: it "additionally stiffens the pipe
and provides a continuously smooth drill string, preventing jamming of drilling
tools during insertion and extraction", and the casings are "designed specifically
for the transmission of high torques and crowd forces generated by rotary drilling
rigs and Bauer casing oscillators".

Three grades, **all mutually compatible** (a genuinely good shop mechanic —
same fit, different lifetime):

| Grade | Connector | Connector material | Inner wall |
|---|---|---|---|
| Economy | welded | S355 | standard |
| Standard | forged | 25CrMo4 | standard |
| Heavy-Pipe | forged | 25CrMo4 | increased — 12 mm (OD 620–1300), 16 mm (OD 1500–1800) |

*"They are totally compatible to the standard casings."* Casing shoes take
**WS tooth holders (WSH39-52)** or weld-on teeth **type BR / BH**, and the cutting
ring "can be removed and replaced when necessary".

---

# C. Brand-scoped compatibility — what actually has to match

`DOMAIN.md` §4 is right that connection vocabulary is **segment-scoped**. Within
the rotary/Kelly segment, here is what is genuinely brand-locked, what is
dimension-locked (fits anyone who uses the same dimension) and what is universal.

## C.1 The interface stack, top to bottom

A rotary foundation rig is a chain of five interfaces. A part fits if **its own
interface** matches — not if the brand badge matches.

| # | Interface | What must match | Brand-scoped? |
|---|---|---|---|
| 1 | Rig ↔ rotary drive (KDK) | Mounting on the crowd sledge, hydraulic circuit, torque rating | **Yes — strongly.** The BG 45 takes KDK 390 S or KDK 460 S with a "hydraulically operated pin connection on the crowd sledge" (BG 45 brochure p.8). This is the most brand-locked joint in the machine. |
| 2 | Rotary drive ↔ Kelly bar | Drive sleeve profile and the bar's outer pipe Ø (292/343/394/470/546 mm per torque class) | **Dimension-scoped**, and this is why an aftermarket Kelly bar business exists at all: EMDE state their bars are "compatible with all common rotary drilling rigs" and sell them by **torque class**, not by rig brand (`Emde-Bohrtechnik-Kellystangen.pdf`). |
| 3 | Kelly bar ↔ tool (**the Kelly box**) | **Square key width (SW) in mm**, plus tool-joint length L, E, F and pin k | **Effectively universal at SW 200.** Bauer's own tool datasheets specify "**Bauer Kelly box 200 mm square**" on tool after tool (`2025_BMA_Productinfo_SB-SB-2_EN.pdf`), and EMDE's standard tool joint is **SW 200, L = 480 mm, E = 290 mm, F = 100 mm, k = 70 mm**, with "other tool joints possible" (`2-2-EMDE-Katalog-Pfahlbohren.pdf`). EMDE's own tools are labelled "standard drilling tools for a torque up to 250 kNm with Kelly Box SW 200". `DOMAIN.md` §4 lists 130/150/200 — 200 is the volume size; 130 and 150 belong to smaller rigs. |
| 4 | Kelly bar ↔ crane/winch (**the Kelly eye**) | E, L, B, k | Dimension-scoped. EMDE standard: **E = 110, L = 180, B = 48, k = 52 mm**. |
| 5 | Casing ↔ casing (**the joint**) | OD/ID pair + joint type + bolt count | **Dimension + system scoped.** Bauer's cone-ring/bolted double-wall joint, Leffer's joint, and welded-thread joints are different systems (`DOMAIN.md` §4). Within Bauer's system, Economy/Standard/Heavy-Pipe interchange freely. |

## C.2 Genuinely brand-scoped part families

Mark these `fits-rig` in the shop, and make a mismatch a real failure:

- **Rotary drives (KDK / KH / rotary heads)** — mount to a specific carrier's
  crowd sledge and hydraulic circuit.
- **Torque multipliers / casing drive adapters** (Bauer BTM) — sized to a
  specific KDK and casing string.
- **Crowd systems** — Soilmec's CCS vs WCS are not interchangeable; they are
  different machines with different weights and forces (SR-45, SR-95 datasheets).
- **Interlocking Kelly bar mechanisms** — IMT's automatic blocking is
  **patented by IMT** (AF 240 datasheet); CZM's "Bottom Drive CFA" torque
  mechanism is "exclusive of CZM" (EK200 brochure). Patented mechanisms are
  the cleanest justification for brand-locking a part.
- **Leaders / masts and their attachment kinematics** — Bauer H-line vs V-line
  masts, Bauer Vario-masthead drill-axis distances (1,300 / 1,550 mm, expandable
  to 1,700 / 2,000 mm — BG 45 brochure p.6). A mast section is not a
  cross-brand item.
- **Rod magazines and handling** — Klemm MAG 6.1 is quoted *for* KR 806-4GM,
  MAG 7.0 *for* KR 807-7G (`KLEMM_Lieferprogramm_Product_Range.pdf`). Magazines
  are rig-specific by model, not just by brand.
- **Hose drum systems / cutter power packs** — the Bauer cutter is sold as
  cutter + carrier + HDS + power pack, all matched.
- **Undercarriages and track components** — machine-specific.

## C.3 Dimension-scoped (fits any brand with the same number)

- **Kelly boxes / tool joints** — SW 200 (and the smaller SW sizes). A bucket
  with an SW 200 box fits any bar with an SW 200 stub.
- **Casings** — by OD/ID pair and joint system.
- **Casing shoes and teeth** — WS tooth holders (WSH39-52), weld-on BR/BH teeth,
  round-shank chisels, flat teeth.
- **Kelly bars** — by torque class and outer pipe diameter.
- **Hammer drive caps and pile sleeves** — Junttan's HHK 3A/5A take 470 × 470 mm
  / Ø 770 mm caps, HHK 7A/9A take 550 × 550 mm / Ø 850 mm (2025 hammers brochure).
  Cap size is set by **pile size**, not by rig brand.
- **Vibrator clamps** — sized by pile type and clamping force, quoted separately
  from the vibrator (Junttan VH120 offers a sheet-pile clamp SC 350 at 3,560 kN
  and a casing clamp TC185 for Ø 520–3,000 mm).

## C.4 Universal / cross-brand by design

- **Impact hammers.** Junttan is explicit: *"The clever mounting system enables
  the hammer to be used with different kinds of leaders"* and *"the hammer can be
  operated by the rig's hydraulic system or by separate power pack"*, and it "can
  be mounted on all kinds of leaders or be freely suspended" (2025 hammers
  brochure). Hammers are the least brand-locked major component in piling.
- **Excavator-mounted attachments.** Movax side grips are specified by
  **excavator weight class** (SG-75 → 33–40 t machines), not by excavator brand.
  Klemm's KA excavator attachment series is the same idea.
- **Power packs.** Sold as separate products against flow/pressure requirements.
- **Consumables** — teeth, picks, bits, wear parts, hoses, greases.
- **Ram blocks within one hammer frame.** *"A modular ram block and hammer frame
  allow the use of different sized ram weights with one hammer"* — which is
  exactly why the model is called HHK 16/18/20/22S (2025 hammers brochure). This
  is a superb upgrade mechanic: buy the frame once, buy ram blocks to raise energy.

## C.5 Design recommendation for the shop

Model compatibility as **an interface tag on the part**, not as a brand tag, and
let the brand facet be derived. A part carries e.g. `kelly-box: SW200`,
`casing: OD880/ID800 · Bauer joint`, `rotary-mount: <carrier family>`,
`excavator-class: 33-40t`. Then "fits Bauer BG" falls out of the interface, the
aftermarket (EMDE-style third-party Kelly bars) works exactly as it does in
reality, and the "AI cross-reference" upgrade from `PLATFORM_TRUTH.md` Part A has
something real to compute.

---

# D. The visual read — how each class actually looks

The failure mode to avoid is every machine being "a crawler with a mast". These
are structurally different vehicles. Everything below is anchored to a sourced
dimension or a sourced structural statement.

## D.1 Micro / anchor rig (Comacchio MC 4–8, Klemm KR 704, Casagrande C6)

**Silhouette: a compact tracked box with an arm.** 5–10 t. No counterweight worth
seeing, no slew superstructure to speak of. The defining feature is a **short
feed beam (Lafette) on an articulated arm** that can point anywhere — Comacchio
splits the range into "**fully articulated**" and "**vertical**" multipurpose rigs,
which is a visible difference: the articulated one folds like an excavator arm,
the vertical one keeps a fixed upright mast
(comacchio.com microdrilling pages). Feed stroke is short — Klemm quotes mast
types like "303-13" with frame lengths from 2.2 m upward
(`KLEMM_Lieferprogramm_Product_Range.pdf`). Tracks are narrow enough to go through
a doorway; that is the entire selling point. Rods are short and handled by hand
or by a small carousel. **No Kelly bar. No casing. A drifter or a small rotary
head at the top of the beam, and hoses everywhere.**

## D.2 Compact anchor & micropile rig (Klemm KR 806/807, Comacchio MC 22)

**Silhouette: the same shape, grown up and squared off.** 20–32 t, overall about
**10.5 × 2.8 × 3.1 m** (KR 806-4GM, bauma 2025 catalogue). Now there is a real
**rod magazine** — a rotating carousel bolted beside the mast (KLEMM MAG 6.1
"carousel magazine with manipulator") — which is the strongest visual cue that
this is a *drilling* machine rather than a piling machine. **Oscillating tracks**
appear here ("Pendelfahrwerk … for efficient use in rough terrain", KR 805-3GW).
Mast length 6.9–10 m. Electric variants exist and carry a cable, not a stack
(KR 806-4E). Geothermal variants get a longer mast and a **hydraulically
lowerable flushing pump** hanging off the frame (KR 717-3GW).

## D.3 Mini / midi rotary rig (TESCAR CF, Soilmec SR-30/45, Bauer BG 15–23)

**Silhouette: the first machine that reads as a "piling rig".** 30–70 t. A proper
slewing superstructure with a counterweight, a crawler undercarriage that
**telescopes wider for work and narrower for transport**, and a **vertical mast
with a Kelly bar hanging down the front of it**. The mast is now taller than the
machine is long. The Kelly bar is the signature: a nest of square telescoping
tubes, outer pipe **292–343 mm** at this class
(`2-2-EMDE-Katalog-Pfahlbohren.pdf`), ending in a rotary drive that slides on the
mast. Access is the selling point at the small end — TESCAR's whole pitch is
"narrow and limited access spaces".

## D.4 Excavator-based rotary rig (IMT AF, CZM EK)

**Silhouette: unmistakably an excavator wearing a mast.** This one must look
different from the purpose-built rigs or the visual language is wasted. The
AF 240 sits on a **CAT 345 C HHP** and the EK200 on a **CAT 336** — you can see
the excavator house, the excavator cab, the excavator boom foot, and then an
incongruous foundation mast bolted to the front (kellytractor AF 240 datasheet;
CZM EK200 brochure). The undercarriage is an excavator undercarriage, so it is
**shorter and narrower relative to the mast** than a purpose-built rig's — which
is exactly why these machines have modified pull-down kinematics (IMT quotes a
modification of "the Caterpillar original for pull down (as well as
transportation) to 4.4 m working phase"). Yellow, not the OEM's own colour.

## D.5 Large / very large rotary rig (Bauer BG 30–55, Liebherr LB 30–55, Soilmec SR-95+)

**Silhouette: a tower on a barge.** BG 45: **operating weight 146 t, max height
39.0 m**, mast dimensions on the general-arrangement drawing running to
**28,490 mm** overall with a **9,500 mm crowd stroke**, and an undercarriage that
telescopes **3,700 → 5,000 mm** (BG 45 PremiumLine brochure, dimensions page).
Everything is heavier and *proportionally* different:

- The **counterweight** is a slab at the back, not a decorative block, and it is
  routinely removed for transport — Bauer headlines "transport weight **w/o
  counterweight**" (63.4 t for BG 30 H, 74.6 t for BG 36 H, bauma 2025 catalogue).
- **Three or four winches** are visible on the uppercarriage: main, auxiliary,
  crowd. The BG 45 has a "single layer winch for minimised rope wear" mounted in
  a "service-friendly winch position" with a "swing down mechanism for transport".
- The **masthead** is a distinct assembly with the upper Kelly guide; Bauer's
  Vario-masthead sets drill-axis distances of 1,300/1,550 mm expandable to
  1,700/2,000 mm — visible as how far the Kelly stands off the mast.
- **Kelly bar outer pipe 470–546 mm** at this class, telescoping 4-fold, up to
  **15,850 kg on its own** (EMDE table). It is a structural member the size of a
  lamp post.
- **Walkways with folding handrails** on the upper level and folding guardrails
  for transport — a real, visible detail on every big rig.

**H-kinematics vs V-kinematics is a genuine visual difference and should be
modelled.** The H-line is designed for "fast loading onto transport vehicles …
rapid shifting to new working positions at construction sites with underpasses
or below low bridges" — it folds low. The V-line has "the robust design of the
kinematic system" for big diameters and depths — it stands tall and the parallel
linkage between the uppercarriage and mast is visually heavier
(BG 45 brochure p.4).

## D.6 CFA rig — how it differs from a Kelly rig

Same carrier, different front end, and the difference is legible at a glance:

- **No Kelly bar.** Instead a **single continuous auger the full length of the
  mast**, so the mast must be as tall as the pile is deep. That is why CFA depths
  are short compared to Kelly depths on the same machine: Soilmec SR-95 does
  **70–101.7 m on Kelly but 24–34.5 m on CFA**; Junttan PM26 does **70 m Kelly,
  26 m CFA** (SR-95 datasheet; Junttan 2013 brochure).
- **Mast extensions** are the visible upgrade — Bauer offers "mast extension 3 m
  or 5 m" and "mast extension 5 + 5 m for CFA" (BG 45 brochure p.6).
- A **concrete/grout swivel and delivery line** runs up the mast to the top of
  the auger. There is a hose on a CFA rig that a Kelly rig does not have.
- A **spoil-cleaning device** at the mast — Bauer's BG 30 H carries a "Kelly auger
  cleaner for noise sensitive construction sites"; the BG 55 has a "spoil
  discharge system with chute-bucket-assistant for directed ejection"
  (bauma 2025 catalogue). Spoil handling is a visible mechanism.
- Extraction force is the headline number, not torque: SR-95 CFA nominal
  extraction **1,110 kN**.

## D.7 Driven piling rig (Junttan PM, ABI Mobilram, RTG RG)

**Silhouette: a leader, not a mast — and it leans.**

- The **leader** is a tall lattice/box guide carrying a **hammer that slides down
  it**, plus a pile hanging on a second line. Two winch lines are visible, and
  they do different jobs — Junttan quotes them separately as "winch capacity:
  pile" and "winch capacity: hammer" (10,000 kg and 15,000 kg on the PM25H).
- **It rakes.** This is the single most important visual difference from a
  rotary rig. Junttan: "expandable tracks and movable counterweight ensure
  excellent rig stability and this allows greater leader inclinations for raked
  piling" (2013 brochure). A piling rig at 15° off vertical is normal; a rotary
  rig at 15° is a photograph of an accident.
- **Telescopic vs fixed leader** is a real product split, and the German terms
  make it explicit: RTG's `eRG 21 T` is a *Teleskopmäkler* (telescopic leader,
  max leader height 26.8 m, pile length 21.4 m) and the `RG 27 S` is a
  *Starrmäkler* (fixed leader). Junttan's PM25H leader telescopes 4,000 mm and
  moves 1,500 mm horizontally with the foot going 1,000 up / 500 down
  (bauma 2025 catalogue; PM25H datasheet).
- **Self-erecting**: "transported in one piece … without having to remove the
  hammer" and "ready to work in just a few minutes" (Junttan). The rig folds.
- **Wide, low stance**: PM25H undercarriage 5,700 mm long, expanding
  **3,380 → 4,880 mm**, on 800/900/1,000 mm shoes, with an **extendable
  counterweight (6,000 + 2,000 kg)** and a deliberately low centre of gravity.
- The hammer itself is a **long blue cylinder** — HHK16S is **8,170 mm long and
  23,200 kg** — with hoses to the rig or to a separate skid-mounted power pack
  sitting on the ground nearby. **Draw the power pack.** It is a visible second
  object on site (15XCU 5,900 kg; PP1400 13,100 kg, 6.06 × 2.45 × 2.59 m).

## D.8 Side-grip / excavator vibro (Movax)

**Silhouette: no leader at all.** A 2.5–3.6 t vibro head clamped on the end of a
33–40 t excavator's boom, gripping the pile side-on. The excavator's own boom
does the aiming. This looks like nothing else on site and is the cheapest way
into piling — worth being an early-game machine.

## D.9 Trench cutter / diaphragm wall

**Silhouette: a crawler crane with a hole in the ground and a lot of plant around
it.** The cutter is not on a mast — it hangs on ropes from a **duty-cycle crawler
crane** and disappears into a slot. Visible elements:

- The **cutter body**: about **12.6–12.7 m tall**, 34.7 t, with two
  counter-rotating cutter wheels at the bottom and a slurry pump directly above
  them. Panel dimensions are what it makes: **2,800 × 640–1,500 mm**.
- The **hose drum system (HDS)** — a big powered reel on the carrier, because the
  cutter is fed by hoses, not just rope.
- A **separate power pack** on the ground (HE 1400: 500 kW electric, 690 V,
  13.5 t, 6,031 × 2,400 × 2,542 mm).
- A **desanding / separation plant** and slurry tanks nearby (BE 100 desander,
  BD 30-C decanter centrifuge, CMS 50 batch mixer). Diaphragm-wall sites look
  like small process plants, and that is the point.
- The trench itself is a **rectangular slot**, not a round hole. Cutting depth
  to **90 m** in the BCS 185 configuration.

*(All figures: bauma 2025 catalogue and equipment.bauer.de/en/trench-cutters-cutter-systems)*

## D.10 Pile-top RCD (HMH / Wirth)

**Silhouette: no carrier at all.** The rig **clamps onto the top of the casing**
and sits on the pile it is drilling — 17–120 t of machine with a crane, a
hydraulic power pack, a compressor, a mud tank system and a clamping device
arranged around it as separate skids (local `2022-12-PBA-brochure.pdf`, rig
arrangement diagram). Diameters to **8.5 m**. This is the visual for "the biggest
hole in the game", and it should not look like a bigger crawler — it should look
like a drilling *installation*.

## D.11 Colour and livery — a note

Do not copy trade dress. The real market has strong colour identities (and
Junttan even markets on it — *"Blue hammers are green"* in the 2025 hammers
brochure), but per `PLATFORM_TRUTH.md` Part C rule 4 the game's machines get
Drillity's own **Liquid Industrial** palette from `DOMAIN.md` §8 — deep slate,
electric amber, steel blue. Differentiate classes by **silhouette and proportion**,
which is free and legally clean, not by borrowed colour.

---

# E. The two ambiguous names — findings

## E.1 "SPD" — RESOLVED

**Scandinavian Pile Driving SPD AB**, Fridhemsgatan 16, 733 39 **Sala, Sweden**
(org.nr 556653-4565).

- **What they make:** "develops and manufactures drilling rigs, piling machines,
  drilling masts and piling masts for companies in the construction industry" —
  specifically drilling mast attachments, piling hammers, micro drilling rigs,
  spinners and foundation equipment, and since 2003 "equipment especially made for
  use together with **excavators**"
  (https://www.hydraspecma.com/store/dk/en/cms/en/insights-media/customer-stories/scandinavian-pile-driving-ab ;
  https://www.spd.se/).
- **History:** prototypes built in the late 1990s by founder Magnus Andersson;
  moved to Sala in 2004.
- **Ownership — and this is the useful part:** **ABI** (the German Mobilram
  manufacturer already on your list) bought into the company in 2017, and **SPD
  became a wholly owned ABI subsidiary in 2023.** SPD's own homepage carries
  "Part of @abi_spezialtiefbaumaschinen" and states they are the **Eurodrill
  dealer in Scandinavia** (https://www.spd.se/).
- **Model naming:** `T13-S25` appears on their homepage as a rig model with
  weight, motor power, stroke length and max bore diameter. `UNVERIFIED`: the
  full model range and what T/S encode — their products page was not reachable
  in this pass.
- **Confirmed presence:** exhibited at bauma 2025
  (https://exhibitors.bauma.de/en/exhibitors-and-products/exhibitors-brand-names/exhibitors-brand-names-details/exhibitorDetail/ID/1395204/).

**Verdict:** SPD is a real, relevant, Nordic manufacturer of excavator-mounted
drilling and piling attachments, and it sits inside the ABI group. It belongs in
`DOMAIN.md` §6's brand list. Note it also links to **Eurodrill**, which is
already in §6.

> I checked the alternative reading — an Italian "S.P.D. Srl" — and found no such
> foundation-equipment manufacturer. Italian searches surfaced Soilmec,
> Casagrande, Comacchio and SIP&T instead. **Nothing supports an Italian SPD.**

## E.2 "Tactex" — NOT RESOLVED as a foundation OEM

I found exactly one real company matching the name:

**TactEX Industries** (https://tactexindustries.com/) — "Canada's most innovative
**diamond drilling** equipment supplier". They build core drills integrating into
three platforms, an in-house hydraulic pack with pilot controls, and synchronised
or manual chuck / rod-clamp operation.

**This is mineral-exploration core drilling, not foundation or piling.** In
`DOMAIN.md` §1 terms it belongs under `core` (Core / exploration, wireline), not
under `rotary-kelly`, `cfa` or `dw`. It is a legitimate company and could
legitimately appear in a `fits-rig` facet — but on the **core drilling** side of
the taxonomy, alongside Boart Longyear and Sandvik, not alongside Bauer and
Liebherr.

**Two candidate explanations, neither confirmed:**

1. **You meant TactEX Industries**, and it belongs in a different part of the
   taxonomy than the rest of this brief.
2. **You meant TESCAR** (TES CAR S.r.l., Osimo, Italy) — the nearest-sounding
   real *foundation* manufacturer, covered in §A.8. TESCAR is a strong fit for
   the gap in your list: they invented the "mini-drill for foundation piles"
   category in 1985, and their CF series (12–230 kNm, from 5 t) fills exactly
   the compact/midi band between Comacchio and Soilmec.

I could find **no** foundation- or piling-equipment manufacturer named Tactex,
Tacktex, Tak-Tex or similar. I also checked the other name you floated —
**Tractec / Tracto-Technik** — and note that Tracto-Technik is real but belongs
to **trenchless/HDD** (`DOMAIN.md` §1 `hdd`, `pipe-bursting`), a different
segment again; I did not research it further because it is out of scope for this
brief. **Say which you meant and I will complete that manufacturer properly.**

---

# F. Open questions I could not close

Listed so nobody quietly fills them in with a guess later:

1. **Soilmec SF / SM / SC / SD / PSM prefixes** — soilmec.com returns HTTP 403 on
   direct datasheet fetch and the SR-series index 404'd. Unknown.
2. **Bauer BT / BS carrier numbers** — what they abbreviate and what unit.
3. **Bauer BC cutter numbers** — not torque (BC 40 = 100 kNm, BC 50 = 120 kNm).
4. **Liebherr LRB and LRH numbering**, and all LRH specifications.
5. **ABI Mobilram TM nn/nn** — the two-number meaning. The common reading
   (retracted/extended leader length in metres) is plausible but unsourced.
6. **ABI MRZV vibrator specs.**
7. **Müller (MS-D / MS-V), APE and BSP** — no primary technical pages reached.
8. **ICE model numbering** ("416" matches neither moment nor force).
9. **IMT AF, CZM EK, TESCAR CF, Junttan PM numbering** — size indices with no
   confirmed formula.
10. **Leffer's corporate relationship** to Bauer or Liebherr — both Leffer and
    Liebherr use a `VRM` oscillator designation, but no ownership link was found.
11. **Mait's current corporate status.**
12. **Giken model-series naming.**
13. **SPD's full model range** and what `T13-S25` encodes.

---

# G. Source index

**Local files** — all in `C:\Users\henri\Downloads\`:

| File | Used for |
|---|---|
| `geraetekatalog_catalog_of_machines_bauma_2025_bauer_maschinen.pdf` | Bauer BG 30/36/55, eBG 33 H, RB 65, RTG eRG 21 T / RG 27 S / MR 150 AVM, MSM CMD-65/4, BCS 185 + HDS 90-T + BC 35, HE 1400, eCSM, MAT plant (IPA 250-E, BD 30-C, BE 100, CMS 50), KLEMM KR 806-4E / 805-3GW / 717-3GW / 806-4GM / KD 4724, Bauer casings and casing clamps, KBF-K2, AFH-K2-S SCM |
| `KLEMM_Lieferprogramm_Product_Range.pdf` (08/2025) | Full KR / KH / KD / PP / KA / MAG / HBR / MBS ranges and series envelopes |
| `bauer-maschinen-drilling-tools-and-casings-de-en-11-25_0.pdf` | Casing OD/ID ladder, Economy/Standard/Heavy-Pipe grades, casing shoes, WS holders, "Kelly box 200 mm" on tool after tool |
| `2025_BMA_Productinfo_SB-SB-2_EN.pdf` | "Bauer Kelly box 200 mm square"; auger standard diameters 520–2,500 mm, lengths 1,700 / 2,250 mm |
| `Emde-Bohrtechnik-Kellystangen.pdf` | Kelly bar envelope: 2–4 fold telescopic, ≤500 kNm, ≤100 m, friction vs locking, "compatible with all common rotary drilling rigs" |
| `2-2-EMDE-Katalog-Pfahlbohren.pdf` | Kelly bar torque-class table (100–400 kNm), tool joint SW 200 dimensions, Kelly eye dimensions, casing drive adapters |
| `16291_Junttan_Piling_brochure_3_2013_WEB.pdf` | PM/PMx/PM25H/PM30 rig table, PM26/PM28 multipurpose table, method descriptions, X-series and DSx |
| `13915_Junttan_PM25H_Datasheet.pdf` | PM25H full spec (used to verify the de-shifted brochure table) |
| `Junttan_Hammers_brochure_EN_2025_web.pdf` | Full HHK Classic, SHK, HHX tables; power packs; modular ram block; leader-agnostic mounting; noise data |
| `HHK16-22S-Datasheet.pdf` | HHK16S / HHK16-18S detail (used to verify the ram × g × stroke rule) |
| `Junttan_VH120_vibro-hammer_datasheet-1.pdf` | VH120 full spec, clamps, PP1400 |
| `Junttan_Vibratory_Hammers_brochure_2023_web.pdf` | Full VH and VH VM tables, variable-moment principle |
| `2022-12-PBA-brochure.pdf` | HMH / Wirth pile-top RCD models, Ø 0.6–8.5 m, power packs |
| `116-015-23_SCXProductGuide-1.pdf`, `116-012-22_SCXTechnicalSpecs-DE140.pdf` | Checked — **Sunny Corner Exploration**, surface/underground **core** drill rigs (DE710/712/740, DE110–151). Out of scope for foundation work; relevant to `DOMAIN.md` §1 `core` instead. |

**Web sources** are cited inline throughout. The heaviest-used are:
equipment.bauer.de (H- and V-kinematics model lists, trench cutters),
bauer-equipment.com, ecanet.com (BG 45 / BG 30 / BG 36 PremiumLine and ValueLine
PDFs), liebherr.com (LB and LRB series pages), soilmec.co.uk (SR-95 HIT
datasheet), 3cdrilling.com (SR-45 datasheet), casagrandegroup.com,
kellytractor.com (IMT AF 240 datasheet), maitusa.com, czm.com.br (EK200),
tescar.com, comacchio.com, junttan.com, hammersteel.com (DELMAG lead systems
brochure), iqip.com (Hydrohammer S-series), acteon.com (MENCK), movax.com and
w-h.co.uk (Movax SG), diesekogroup.com (PVE / ICE), spd.se and bauma.de (SPD),
lefferna.com and leffer.de (Leffer), sanyamerica.com, xcmg.com, zoomlion.com.

# Rig reference — `oil-derrick` (Offshore platform / jack-up drilling package)

status: COMPLETE for the material available locally and on the open web.
Anything marked `NOT SOURCED` stayed unfound and must not be invented. §8 lists
the real gaps. Subject: game rig id `oil-derrick`, currently built by
`src/rig/rigFactory.js` (`buildOilDerrick`, ~line 3846).

> **NAMING RULE (DOMAIN.md §10).** Everything below is for GEOMETRY and MATERIALS only.
> Do NOT copy manufacturer names, model designations, badges, logos or IADC rig names
> into the game. Real names appear here only as citations so the modeller can check the
> source. The in-game name stays fictional.

---

## 1. Sources read

| File / URL | Pages / extent | What it ACTUALLY showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Jack-Up-Rig-IADC-List-30-JAN-2022.pdf` | whole, 66 pp. (`pdftotext -layout`) | **The single best source in the whole folder, and not what the filename suggests.** It is not a fleet list — it is one complete, filled-in **IADC Standard Format Equipment List for a Jack-Up Drilling Unit**, sections A–M, for a real 3-legged independent-leg cantilever jack-up (Marathon LeTourneau Class 82-SD-C, Vicksburg MS, rig name withheld pending NDA). Carries hull, leg, spudcan, cantilever, **derrick height and base**, substructure, drawworks, crown/travelling block, rotary, top drive, BOP, mud, power, helideck, lifeboat and accommodation figures — all as printed numbers. Everything in §3 with an "IADC" cite comes from here. | **Yes — primary, and the backbone of this document** |
| `C:\Users\henri\Downloads\nov_rotary-handling-tools-land-offshore.pdf` | whole, text-extracted; tong tables ll. 10060–10120, link tables ll. 1730–1830, bushings ll. 5700–5800 | 2018 rotary & handling tools catalogue. Confirms the **rotary-table opening ladder (17½ / 27½ / 37½ / 49½ in)**, gives **manual tong overall dimensions** (HT14→HT200) and **elevator-link length ladders** with load ratings. Master-bushing tables are by bore code and part number, so the *sizes* are there but plan dimensions are not. | **Yes** |
| `C:\Users\henri\Downloads\Dictionary-of-Oil-Industry-Terminology.pdf` | whole; entries at ll. 1267, 1648, 3824, 3833, 4676, 7095, 7466, 8084 | Short but **decisive for defect #7**: defines *moonpool* as a hole in the hull **of a ship**; *template* as a framework grouping subsea wellheads; *spud can*, *jacket*, *jack-up rig*, *conductor pipe*, *wellhead platform*, *derrick*. This is where the correct vocabulary comes from. | **Yes — for naming and for the three-way split** |
| `C:\Users\henri\Downloads\Chakrabarti_2005_Handbook_of_Offshore_En.pdf` | whole file indexed (669 PDF pp. = printed pp. 1–661); worked in depth at pp. 279–418 (Ch. 6 Fixed Platform Design), 401–413 (jack-ups), 419–661 (Ch. 7 Floaters) | **The best source for everything the drilling package STANDS ON, and useless for the drilling package itself.** Gives jacket batter, bay geometry, deck footprints, **the 40 ft drill-rig skid-beam spacing**, conductor OD and guide behaviour, jack-up leg/hull/cantilever construction, semi and spar proportions, splash-zone and anode practice. **It contains no derrick geometry whatsoever** — no height, base, ratio, crown block, racking board or substructure height; its 15 uses of "derrick" nearly all mean *derrick barge*. Also **no fixed-platform well-slot spacing** — searched exhaustively; the claim is neither supported nor refuted here. **This file is Volume I only**; Ch. 15 *Materials and Corrosion* is in Volume II and is not present, which is why §6 leans on NORSOK instead. OCR is good for body text and **unreliable for tables** — reconstructed tables are flagged where used. | **Yes — primary, for structure. Explicitly NOT a source for the derrick.** |
| `C:\Users\henri\Downloads\crouse-hinds-b-line-offshore-drilling-brochure.pdf` | whole, 1,028 ll.; zone map pp. 4–5, grating p. 16 | Offshore electrical brochure. **Its zone map is the best thing in it**: an eleven-item named list of the areas on an offshore drilling package (§4.10). Also: hazardous-area classes, **Grip Strut pressed-plank safety grating** (three tooth patterns) rather than bar grating, cable tray, Ex telephone hoods in **RAL yellow or red**. **No dimensions of anything structural.** | **Partly — for deck texture and area naming, not geometry** |
| `C:\Users\henri\Downloads\Gulf-Rig-Catalog.pdf` | whole, 2,510 ll.; index pp. 1–2, items ll. 1270–1440 | **Not a rig catalogue.** It is a supplier's parts catalogue — choke and kill manifolds, gate valves, hammer unions, shaker screens, hand tools. **No rig, derrick or platform dimensions at all.** Two genuinely useful drill-floor items survive: the **"boxing ring" rotary handrail** (two half-moon segments dropped into the rotary when the master bushings are out, with high kick plates) and the **hole cover** in high-visibility tarpaulin. | **Mostly not useful** — two small furniture details only |
| `C:\Users\henri\Downloads\HK3535_…_Offshore_Foundation_Drilling_EN_….pdf` | whole (extracted to 99 lines) | **Effectively empty of text** — 99 lines from a 1.6 MB file, i.e. an image-only brochure. Nothing extractable. Not re-read as images because the subject (offshore *foundation* drilling for wind monopiles) is a different machine from an oil derrick. | **No** |
| `drillingmanual.com`, *Platform Rig Types & Applications In Oil & Gas*, dated 2023-09-14 — <https://www.drillingmanual.com/platform-rig-oil-gas/> | fetched 2026-09-05 | **The verification the defect needed.** Carries verbatim: *"the wells spaced at surface as close as 1.8 to 3.0 metres between well centres"*, *"skidded from well to well over the platform skidding beams in two perpendicular directions"*, and *"ten to more than forty"* wells. | **Yes — decisive** |
| `oil-gasportal.com`, *Offshore drilling rigs* — <https://www.oil-gasportal.com/drilling/offshore-drilling-rigs/> | fetched 2026-09-05 | The repo's *other* cited source for the 1.8–3.0 m figure. **It does not contain that figure.** It does confirm the mechanism: *"The rig is positioned over preset wellheads by jacking across on skid beams."* Recorded here because `16-site-archetypes.md` cites it for a number it does not carry. | Partly — confirms skidding, not the spacing |
| Patterson Services BOP information sheets (PDFs, dated 9/22/20) — Cameron U Double 13⅝″ 10K, Cameron U Single 13⅝″ 10K, Hydril GK Annular 13⅝″ 5K and 10K | fetched 2026-09-05, extracted with `pdftotext` | **Real BOP body dimensions and weights** — the one thing no catalogue in Downloads had. Height, length with bonnets closed *and* open, weight, flange type. See §3 and §4.4. The three-preventer stack they describe sums to within 2 % of the IADC rig's own BOP-hoist SWL, which cross-validates both. | **Yes — primary** |
| `en.wikipedia.org/wiki/Well_bay`; `patents.google.com/patent/US5407302A/en` (skid-off drilling, Santa Fe International, granted 1995-04-18) | fetched 2026-09-05 | Well bay: *"two levels, a lower where the wellheads are accessed and an upper where the Xmas Trees are accessed"*, and on a platform with a drilling package *"located directly below it"*. US5407302A: capping beams *"typically within a range of between 40 and 55 feet transversely apart"*; skid-off feet and cantilever beams at **sixty feet** transverse spacing; *"four to forty drilling positions"*. | **Yes — for platform skidding geometry** |
| NORSOK M-501 summaries (`worldofcorrosion.com/norsok-m501.html`) | fetched 2026-09-05 | Coating systems 1–7 by exposure zone with generic builds and DFT bands. Secondary (a summary of the standard, not the standard). Used only in §6 and flagged as such. | Partly |
| Helideck sizing / flare boom searches (CAP 437, NORSOK C-004 context) | 2026-09-05 | D-value rule for helideck sizing, current D-values for offshore types. Flare-boom length appeared only in a patent's general wording — flagged low-confidence. | Partly |
| `research/16-site-archetypes.md` §A.10, §A.11, §A.12 (in-repo) | ll. 1190–1400, refs ll. 3510–3545 | The repo's **own** prior offshore research, and it is good: platform vs jack-up vs vessel, conductors 510–760 mm, conductor guides framed at 12–18 m intervals, spudcans to 20 m, cantilever envelopes, surface vs subsea BOP as the organising rule. This document supplies the **dimensions** that §A.10/§A.11 did not have. | **Yes — secondary, and the right place to cross-read** |
| `src/rig/rigFactory.js` (`DERRICK` ll. 3318–3327, `buildDerrickSection` 3396, `buildCrownBlock` 3442, `buildTravellingBlock` 3509, `buildTopDrive` 3561, `buildOilDerrick` 3846–4200), `src/game/data.js` ll. 1199–1214, `src/world/terrain.js` ll. 3136–3153 | read-only | The current game model, compared against the sourced material in §9. `terrain.js` `kit === 'offshore'` is where defect #7 physically lives. | Yes (as the subject) |

---

## 2. What the machine IS

`oil-derrick` is the game's **rotary drilling package on a permanent offshore
structure** — the tall, boxed-in derrick standing on a braced substructure over
a surface BOP stack, with a drawworks, a top drive, a racking board full of
pipe, and a mud plant somewhere below and behind it. Everything that makes it
*offshore* rather than a land rig is the thing it stands on.

And that is where the game currently blurs three completely different machines
into one deck. **They are not variants of each other. Their defining geometry is
mutually exclusive, and a modeller who mixes them produces something no driller
will recognise.**

### 2.1 The fixed production platform — a slot grid and a skidding drill floor

A steel **jacket** — *"tubular steel framework that serves as a pile template
and extends from the sea bed to a few feet above the water level"* — piled into
the seabed, carrying topsides. The wells are pre-set: each one starts in a
**conductor**, *"typically between about 510 and 760 mm (20 and 30 inches)"*,
held vertical by **conductor guides "framed at various elevations within the
jacket and decks"** at roughly **12–18 m (40–60 ft)** intervals
(`[EP0147144]` via `research/16` §A.10).

The wells are laid out on a grid by a **drilling template**, and the platform
carries **"ten to more than forty"** of them
(drillingmanual.com, *Platform Rig*, 2023-09-14). Directly under the drilling
package is the **well bay**, *"two levels, a lower where the wellheads are
accessed and an upper where the Xmas Trees are accessed"*
(Wikipedia, *Well bay*).

> **The drill floor does not stay in one place, and it does not hang out over
> the side.** It **skids**: *"the drill floor and substructure can be skidded
> from well to well over the platform skidding beams in two perpendicular
> directions"* (drillingmanual.com, 2023-09-14). Independently:
> *"The rig is positioned over preset wellheads by jacking across on skid
> beams"* (oil-gasportal.com, *Offshore drilling rigs*).

So a platform reads as: **skid beams under the substructure running two ways, a
grid of conductors standing in rows below the floor, Christmas trees on that
same grid on the deck beside it, and no opening in any hull anywhere.**
There is no moonpool and no cantilever.

### 2.2 The jack-up — legs, spudcans, jacking houses, and a cantilever

A barge hull with three or four legs through it. It floats to location, lowers
the legs, **preloads** by ballasting to *"simulate the loads on the soil that
might be experienced in a 100-year weather event"*, then jacks the hull clear of
the water on an **air gap** (`[WP-JACKUP]` via `research/16` §A.11). At the foot
of each leg is a **spud can**: *"a cylindrical device, usually with a pointed
end… The pointed end penetrates the seabed"*
(`Dictionary-of-Oil-Industry-Terminology.pdf`, entry *Spud can*).

The drilling package sits on a **cantilever** — an arm that *"extends outwardly
from the deck so that the derrick is positioned over the open water… allowing
drilling to be performed through existing platforms, as well as without them"*
(`[US6171027]` via `research/16` §A.11). The cantilever **skids aft** and the
drill floor skids **transversely** on it, so the rotary can be placed anywhere
within a rectangular envelope beyond the stern.

The IADC unit in Downloads is exactly this machine, and its own form records
that positioning it over a platform needs a third tug and that it carries a
**conductor pipe platform** — a jack-up drilling *somebody else's* platform
wells. That is the normal offshore arrangement the game is missing.

### 2.3 The drillship / semi-submersible — a moonpool, a riser, heave compensation

A floating unit. **The moonpool is *"a hole or well in the hull of a ship
(usually in the centre) through which equipment pass to gain access to subsea"***
(`Dictionary-of-Oil-Industry-Terminology.pdf`, entry *Moonpool*). Because the
unit moves with the sea, the well is connected by a **marine riser** and the BOP
sits on the **seabed**, not on the deck.

`research/16` §A.11 states the rule that decides everything else, and it is the
cleanest one available:

> Platforms and jack-ups have the BOP **on the deck** — a surface stack *"mounted
> below the rig deck"*. Semis and drillships have it **on the seabed** under a
> marine riser. The moonpool, the riser joints with buoyancy modules racked on
> deck, and the size of the deck crane all follow from that one difference.

### 2.4 The three-way table a modeller should keep open

| | **Fixed platform** | **Jack-up** | **Drillship / semi** |
|---|---|---|---|
| Stands on | piled steel jacket, permanent | 3–4 legs + spudcans on the seabed | floats |
| Well access | **well slots on a grid**, conductors in guide frames | through the hull **slot**, or **cantilevered** beyond the stern | **moonpool** through the hull |
| Drill floor moves by | **skidding on skid beams, two perpendicular directions** | **cantilever skids aft; floor skids transversely on it** | fixed over the moonpool |
| BOP | **surface stack, under the drill floor** | **surface stack, under the drill floor** | **subsea, on the wellhead** |
| Riser | none | none | **marine riser with buoyancy modules** |
| Heave compensation | none | none | **yes — the point of the design** |
| Air gap under the deck | **none** — structure continues into the water | **yes, and it is the silhouette** | n/a — it is a hull |
| Also on the structure | separators, compressors, quarters, flare boom | quarters, helideck, jacking houses | quarters, helideck, riser racks |

**One-line rule.** *Moonpool → it floats. Cantilever → it stands on legs.
Skid beams and a slot grid → it is bolted to the seabed forever.*

---

## 3. Proportions

Every figure in this section is printed in a source. The IADC unit is a
**3-legged independent-leg cantilever jack-up, Class 82-SD-C, built at Vicksburg,
Mississippi, 1979**, rated 280 ft water depth / 20,000 ft drilling depth — a
mid-size, mid-age jack-up, which makes it a good class average rather than a
record-holder.

### 3.1 The derrick — the number that matters most

| Dimension | Value | Source |
|---|---|---|
| **Derrick height** | **160 ft = 48.77 m** | IADC §B.1.1 |
| **Dimensions of base** | **30 × 30 ft = 9.14 × 9.14 m** | ibid. |
| **Dimensions of crown** | **8 × 8 ft = 2.44 × 2.44 m** | ibid. |
| Gross nominal capacity | 1,000 kips = 454 t | ibid. |
| Static hook load | 1,050,000 lb = 476 t | ibid. |
| Maximum number of lines | **12** | ibid. |
| Rated wind speed, full setback | 93 knots | ibid. |
| Rated wind speed, no setback | 107 knots | ibid. |
| Fitted | ladders with safety cages and rests; platform for crown sheave access; counterbalance for rig tongs and spinning tong; explosion-proof lighting | ibid. |

Independent corroboration for the class: standard drilling derricks run
**136–175 ft** tall on a base **30–40 ft** square
(web survey, 2026-09-05; API Spec 4F is the governing standard).

### 3.2 Substructure and drill floor

| Dimension | Value | Source |
|---|---|---|
| **Drill floor height above main deck** | **28 ft = 8.53 m** | IADC §B.1.5 |
| **Substructure length × width** | **45.5 × 46 ft = 13.87 × 14.02 m** | ibid. |
| **Clear height below rotary table beams** | **21 ft = 6.40 m** | ibid. |
| Setback capacity | 450 kips = 204 t | ibid. |
| Simultaneous setback + hook load | 1,450 kips = 658 t | ibid. |
| Rotary beam capacity | 1,000 kips = 454 t | ibid. |
| Casing stabbing board, adjustable | **20 ft to 43 ft (6.1–13.1 m) above the rotary** | IADC §B.1.4 |

### 3.3 Racking board and pipe

| Dimension | Value | Source |
|---|---|---|
| **Racking platform capacity, 5″ DP** | **20,000 ft = 6,096 m** | IADC §B.1.2 |
| Racking platform capacity, 8″ DC | 465 ft = 142 m | ibid. |
| Total racked | 20,465 ft = 6,238 m | ibid. |
| Tubing belly board | No | ibid. |
| Drill pipe | **5″ OD, G-105, 19.50 lb/ft, tool joint 6⅝″ OD / 3¼″ ID, 4½″ IF, API Range 2** | IADC §D.1.3 |
| Joint length, derived | **9,000 ft in 295 joints → 30.5 ft = 9.30 m per joint** | ibid. |
| Second string | 3½″ OD, S-135, 13.30 lb/ft, TJ 4¾″/2⅛″, 3½″ IF, Range 2 | ibid. |
| Drill collars | 9½″ OD × 31.5 ft spiral, 214.41 lb/ft, 7⅝″ Reg; 8½″ × 31.5 ft, 158.73 lb/ft, 6⅝″ Reg | IADC §D.1.7 |

**Stand arithmetic.** 20,000 ft of 5″ pipe at 30.5 ft a joint is **656 joints**.
Racked as **doubles** (61 ft = 18.6 m) that is **≈328 stands**; as **trebles**
(91.5 ft = 27.9 m), **≈219 stands**. Which this rig racks is `NOT SOURCED` — the
IADC form has no field for it — but **either answer is two hundred–plus stands**,
which is the point.

### 3.4 Hoisting

| Item | Value | Source |
|---|---|---|
| **Crown block** | 500 ton, **6 + 1 sheaves**, **52″ = 1,321 mm sheave diameter**, grooved 1⅜″ | IADC §B.3.1 |
| **Travelling block** | 500 ton, **6 sheaves**, **52″ = 1,321 mm**, grooved 1⅜″ | IADC §B.3.2 |
| Drilling line | **1⅜″ = 34.9 mm**, 6 × 19(S) IWRC EIPS, **7,500 ft = 2,286 m** original | IADC §B.3.5 |
| Deadline anchor | Type EB with weight sensor and deadline dampener | IADC §B.3.6 |
| **Block guidance** | **track and dolly** — the top drive is restrained by rails up the derrick | IADC §B.3.7 |
| Drawworks | **2,000 hp = 1,491 kW**, two DC motors | IADC §B.2.1 |
| **Drawworks drum** | **30″ × 58″ = 762 × 1,473 mm**, grooved for 1⅜″ line | ibid. |
| Line pull, 12 / 10 / 8 lines | **1,014 / 890 / 738 kips** = 4,510 / 3,959 / 3,283 kN | ibid. |
| Auxiliary brake | eddy current, plus battery-backed independent system | IADC §B.2.2 |
| Crown saver | fitted | IADC §B.2.1 |

**Sheave count is a hard rule, not a style choice.** 6 block sheaves + 6 crown
sheaves + 1 fast-line crown sheave = the **12-line** reeving the derrick is rated
for. Draw four block sheaves and you have drawn an 8-line rig, and the line pull
drops with it.

### 3.5 Rotating

| Item | Value | Source |
|---|---|---|
| Rotary table | **maximum opening 37½″ = 952.5 mm**, 650 short ton, two-speed gearbox, drip pan, independent 900 hp drive, **29,000 ft-lb = 39.3 kNm** max continuous torque | IADC §B.4.1 |
| Rotary opening ladder (the range that exists) | **17½ · 27½ · 37½ · 49½ in** | `nov_rotary-handling-tools…pdf` (bushing fitment tables) |
| Master bushing | 37½″, with insert bowls #1 #2 #3 | IADC §B.4.2 |
| Kelly bushing | **None** — the rig has a top drive | IADC §B.4.3 |
| **Top drive** | electric, **500 ton**, 5,000 psi WP, **1,130 hp = 843 kW**, **45,500 ft-lb = 61.7 kNm** max continuous torque, two-speed, **250 rpm max**, forced-air cooled | IADC §B.4.4 |
| Top-drive makeup / breakout | **85,000 ft-lb = 115 kNm** both ways | IADC §B.4.4.1 |
| Upper IBOP | 10,000 psi, max OD 9⅝″, max ID 3 1/16″, 6⅝″ Reg box / 7⅝″ Reg pin | IADC §B.4.4 |

### 3.6 The BOP stack — a real object with real bulk

The IADC rig's high-pressure stack is **13⅝″ 10,000 psi**: one **single** ram
(2⅞–5″ VBR), one **double** ram (blind ram over fixed pipe rams), and a
**13⅝″ 5,000 psi annular** (IADC §E.3.1–§E.3.4). Its low-pressure stack is
**21¼″ 2,000 psi** — annular over a double (5″ fixed pipe over blind shear).
Handling: **2 hoists, 2 lift points, system SWL 27.5 t** (IADC §E.10.1).

Body dimensions, from manufacturer information sheets for exactly those
preventers (Patterson Services BOP Information Sheets, 9/22/20):

| Preventer | Height | Length, bonnets **closed** | Length, bonnets **open** | Weight |
|---|---|---|---|---|
| Annular, 13⅝″ 5K | **54.125″ = 1.375 m** | — | — | 13,800 lb = 6,260 kg |
| Annular, 13⅝″ 10K, studded | **60.625″ = 1.540 m** | — | — | 32,850 lb = 14,900 kg |
| Single ram, 13⅝″ 10K | **41.688″ = 1.059 m** | **114.125″ = 2.899 m** | **172.750″ = 4.388 m** | 10,300 lb = 4,672 kg |
| Double ram, 13⅝″ 10K | **66.625″ = 1.692 m** | **114.125″ = 2.899 m** | **172.750″ = 4.388 m** | 18,400 lb = 8,346 kg |

**Cross-check that validates both sources.** Annular (5K) + single + double =
**4.13 m of preventer body** and **19.3 t**; add the wellhead spool, adapters and
choke/kill outlets and the assembled stack is **≈5 m tall**. Weight lands inside
the rig's own **27.5 t** BOP-hoist SWL. Two unrelated documents agree.

**The shape is the surprise.** A ram preventer is **2.9 m long front-to-back**
with the bonnets closed and grows to **4.39 m** when they swing open for a ram
change. A BOP is not a slim column — it is a squat block nearly 3 m across that
fills the substructure, with two side outlets per body at 4 1/16″ 10K.

### 3.7 The jack-up itself — hull, legs, spudcans, cantilever

| Dimension | Value | Source |
|---|---|---|
| **Hull length × width × depth** | **207.33 × 176.0 × 20.0 ft = 63.19 × 53.64 × 6.10 m** | IADC §A.1 |
| Overall length including helideck | 271.94 ft = 82.89 m | ibid. |
| **Number of legs × length** | **3 × 393.82 ft = 3 × 120.04 m** | ibid. |
| **Type of leg** | **triangular truss** | ibid. |
| Leg length available below hull | 349.69 ft = 106.58 m | ibid. |
| **Leg spacing, transverse / longitudinal** | **120 ft / 121.66 ft = 36.58 / 37.08 m** | ibid. |
| **Spud can diameter** | **40 ft = 12.19 m** | ibid. |
| **Spud can height** | 21 ft 5¾″ = 6.55 m | ibid. |
| Spud can footing area | 1,256.64 ft² = 116.74 m² per can | ibid. |
| **Cantilever reach aft** | **0 to 40 ft (0–12.19 m); 47 ft = 14.33 m with extensions** | ibid. |
| **Cantilever transverse** | **12 ft port / 12 ft starboard = ±3.66 m** | ibid. |
| Max cantilever load (hook + rotary + setback) | 1,450 kips on centreline at 40 ft aft | ibid. |
| Max rotary load | 1,167 kips on CL at 47 ft aft | ibid. |
| **Jacking system** | **rack and pinion, 36 pinions (12 per leg)**, 2,491 kips max variable jacking load, **1.5 ft/min = 0.46 m/min** | IADC §A.3.1 |
| Preload capacity | **7,138 kips/leg = 3,238 t/leg**; 18 hrs to fill and dump | IADC §A.2 |
| Bearing pressure at max preload | 5.65 kips/ft² = 270 kPa | IADC §A.4 |
| **Air gap below bottom of main hull** | **35 ft = 10.67 m** (drilling and survival) | IADC §A.6 |
| Max design water depth | 280 ft = 85.3 m | IADC §A.4 |
| Drilling depth capability, rated | 20,000 ft = 6,096 m | ibid. |
| Displacement at loadline | 14,692 kips = 6,664 t; lightship 12,317 kips = 5,587 t | IADC §A.1 |

Spud-can area check: π × (40/2)² = 1,256.6 ft². The form's own numbers close
exactly, which is why this table can be trusted.

Class context from `research/16` §A.11: legs number *"three, four, six and even
eight"*; the largest spudcans reach **20 m** diameter; cantilever envelopes run
from **40 ft skid-out** on older units to **70–76 ft**, with the largest classes
quoting about **100 × 65 ft** and **100 × 80 ft**. The unit above sits at the
bottom of that cantilever range — a good, ordinary rig.

**How a jack-up is actually built** — Chakrabarti Vol. I §6.3.3
(V. Rammohan, Stress Offshore Engineering), printed pp. 401–413. This is the
construction detail the IADC form cannot give:

- **Legs.** *"**Trussed legs are the most common type** on modern jack-up rigs,
  the other type being **cylindrical legs**"* (p. 411). A trussed leg has
  *"either **three or four chords**… connected together by a system of horizontal
  and diagonal braces, **normally made of circular cross-sections**. **Gear racks
  are an integral part of the chords**"* (p. 411). Two chord sections exist:
  **"tear drop"** and **"opposed rack"** (Fig. 6.67, p. 412). *"the lower braces
  will be heavier and sometimes would be of **built-up I or H sections**"* — so
  the bottom bay of each leg is visibly chunkier than the rest.
- **Structurally it is a 3-D portal frame**: *"The legs constitute the 'columns'…
  and the hull forms the horizontal element"*, with the weight *"assumed to be
  balanced equally among the three legs"* (pp. 401, 405).
- **Hull.** *"a stiffened plate 'box' structure, often consisting of **an upper
  deck, an intermediate (or equipment) deck and a bottom deck**"* — **three
  decks** (pp. 401, 407). Plate is *"stiffened with a series of closely spaced
  (**usually 24–36 in.**) bulb flats or angle sections"*, spanning *"'frames'
  (beams) spaced between **6–9 ft**"* (p. 401; restated p. 413 as 2–3 ft
  stiffeners on 6–10 ft frames). **The legwells are framed by bulkheads, and *"a
  bulkhead terminates at each leg chord location"*** (pp. 403, 413).
- **The jacking house geometry, verbatim (p. 406):** *"**The top guide is normally
  provided atop the 'gear box' of the jacking unit and the bottom guide is at the
  level of the bottom of the hull.** These guides (on each leg chord) together
  provide the necessary moment connection between the leg and the hull."* So the
  jacking house is a box **on top of the hull** whose guides work against a second
  set **at the hull's underside** — the leg is gripped over the full hull depth
  plus the house. Four systems exist: *"the **single rack system, the opposed rack
  system, 'rack-on-rack' system and the hydraulic jacking system**"* (p. 411).
- **The cantilever, verbatim (p. 413):** *"**Cantilever beams — these are two deep
  girders that normally skid longitudinally over two bulkheads called the 'Skid
  Rail Bulkheads'.** The drilling structure is located atop these beams."* And
  (pp. 403–404): the structure *"is designed to enable the **drill floor to be
  skidded longitudinally and transversely over a wellhead pattern on the
  seabed**"*, on *"**deep cantilever beams that skid fore and aft over the transom
  of the vessel**"*. **Two motions, two mechanisms: the cantilever slides aft; the
  drill floor slides across it.**
- **Spudcans.** *"consist of a **conically shaped bottom face**"*, sized so the
  contact area suits the weakest soil, and *"usually designed to be **flooded
  during operation**"* with vents standing above the top of the can (pp. 409–410).
  Modelled as pinned *"about **10 ft below the mudline**"* — i.e. in service the
  can is **buried**, not sitting on the seabed. The mat-supported alternative
  (Fig. 6.65, p. 410) spreads the load and may carry a **scour skirt**.
- **Air gap discipline.** ABS minimum crest clearance is **4 ft (1.2 m)**; the
  worked design cases use **5 ft**. And the reason, stated bluntly (p. 405):
  *"It is most important that the wave **NEVER** be allowed to impact on the hull…
  **If the wave were to hit the hull, the design loads could increase by more than
  500 %**, generally resulting in loss of the unit."*
- **Scale check.** A worked jack-up in 100–250 ft water uses a **410 ft leg**, an
  elevated hull weight of **16,200 kips ≈ 7,350 t**, and a maximum leg reaction of
  **≈11,500 kips ≈ 5,220 t** (Table 6.10, p. 402). Depth envelope: *"In water
  depths exceeding **400 ft**, ships or semi-submersible drilling units are
  generally utilised"* (pp. 279–280).

### 3.8 The fixed platform itself — jacket, deck, and the skid beams

All from Chakrabarti (2005), *Handbook of Offshore Engineering* Vol. I, Ch. 6.
Printed page numbers.

**The single most useful sentence in the book for this document (p. 312):**

> *"In general, the **skid beam spacing of a standard GoM platform drilling rig
> dictates the deck leg spacing** for a drilling platform or module… **Most GoM
> platform rigs supplied by drilling contractors would have 40 ft skid beam
> spacing.** … Therefore, **80 ft by 80 ft four legged and 120 ft by 80 ft
> eight-legged GoM deck footprints are commonly encountered.**"*

| Dimension | Value | Page |
|---|---|---|
| **Drill-rig skid beam spacing** | **40 ft = 12.19 m**, with the deck legs directly beneath them | 312 |
| **Deck footprint, 4-legged** | **80 × 80 ft = 24.4 × 24.4 m** | 312 |
| **Deck footprint, 8-legged** | **120 × 80 ft = 36.6 × 24.4 m** | 312 |
| Deck cantilevers | "most efficient… about **one half the lengths of the deck spans**" | 312 |
| **Deck beam spacing** | **5 ft = 1.52 m**, and *"deck beam spacing is generally dictated by the wellhead spacing"* | 317, 318 |
| Deck levels | **main (upper) deck** — drilling/production modules; **cellar deck** — pumps, utilities, pig traps, **Christmas trees, wellhead manifolds**; **mezzanine** if drilling and production run simultaneously | 295 |
| Deck level vertical spacing | ≈20 ft = 6.1 m between cellar and main deck framing — **deduced** from the worked 45° truss diagonal (L′ = L/cos 45° = 340 in over L = 240 in), **not stated** | 326 |
| Deck loads | **500–1,000 psf** main deck; **300–500 psf** mezzanine and cellar | 312 |
| **Drilling rig share of deck payload** | **12.0 %**; **hook load 6.0 %**; topside equipment and facilities 60.0 %; living quarters 3.5 % | Table 4.2, 136 |
| **Jacket apparent batter** | **1 : 8** in the worked GoM example (true corner batter = s/√2 = 1 : 5.67); range used across examples **1 : 8 to 1 : 15**, with **1 : 12** in the bay-geometry work | 307–308, 332 |
| Mudline footprint, that example | **85 ft = 25.9 m**, from 40 ft deck legs battered 1:8 through 175 ft — the three numbers close | 307–308 |
| **Jacket bay height** | **40–50 ft = 12–15 m**, and *bay height ≈ bay width* (worked example a = h = 45 ft) | 45, 332 |
| Jacket aspect ratio | *"most commonly experienced jacket aspect ratio ranges of **0.7 to 1.4**"* | 331 |
| **Brace angle** | optimum ≈ **36°** from horizontal; usable band **27°–45°**; outside it stiffness falls away rapidly | 331 |
| Jacket top above sea surface | **20–25 m** | 17 |
| Deck bottom-of-steel above MLLW | **50.2 ft** calculated / **51 ft** per API RP2A, in 160 ft water with a 62.5 ft design wave | 313–314 |
| Air gap, API RP2A GoM minimum | **5 ft = 1.52 m** | 311 |
| Top jacket horizontal bracing above MLLW | **15–20 ft = 4.6–6.1 m** — *"in common use in offshore practice"* | 314 |
| Jacket legs / piles | legs **54 in. OD × 1.0 in.**; piles **48 in. OD** (GoM range **36–72 in.**); deck leg OD = pile OD; **jacket leg ID = pile OD + 3–4 in.** | 306–332 |
| Deepwater 8-leg example | **80 in. OD legs** | 391 |
| Brace sizing rules | slenderness **kL/r 70–90**; **D/t between 19 and 90, prefer under 60**; brace:chord OD ratio **β > 0.30** | 329–330 |
| **Bracing pattern** | **K-brace** is *"popular in Gulf of Mexico"*; **V + X** is *"in common use in most offshore locations"*; **full X** for deepwater and seismic. V, N and V-long are *"not recommended"* | 327–328, Fig. 6.25 |
| Number of legs | *"usually **four to eight** legs battered"* | 20 |
| **Jacket steel weight split** | **36 % legs · 36 % braces · 20 % piles · 8 % appurtenances** (boat landings + barge bumpers 2.5 %, walkways 1.5 %, anodes 3 %) | Table 6.2, 368 |
| Wave action zone, deepwater jacket | **≈200 ft below sea level** — where the visible detail concentrates | 390 |

**Conductors, sharpened.** *"Conductors are pipes (**generally 20 in. to 30 in.
OD**) that are driven to ground"* (p. 341). They carry load to the seabed by
shaft friction **like a pile** — they are driven, not hung off the deck. Near the
surface *"the conductor picks up significant wave loads and transfers these to
the **upper horizontal jacket bracing levels through conductor guides**"*; near
the seabed it restrains the jacket. **The guide clearance *"can be as much as
1 in."*** — a loose sliding fit, sometimes closed with *"wiper type guides"*.
And, decisively for the scene: *"**not all the conductors may be present at all
stages of the platform life**"* — **model empty slots.**

**A big platform carries a lot of them.** The worked deepwater case is
**forty 26-in. OD conductors**, and their presence *"would more than double the
shear load calculated for the case of a standard eight-legged Gulf of Mexico
platform with 80 in. OD legs"* (pp. 391–392). Slot counts elsewhere in the book:
**36 wells** on a North Sea self-contained PDQ platform, **18** on a North Sea
drilling/well-protector platform, *"typically less than 10"* on a marginal-field
minimal platform (pp. 19, 287–288).

### 3.9 Platform well-slot geometry — the defect-#7 numbers

| Figure | Value | Source and confidence |
|---|---|---|
| **Wells per multi-well platform** | **"ten to more than forty"** | drillingmanual.com 2023-09-14, fetched 2026-09-05. **Verified verbatim.** |
| **Well centre spacing at surface** | **"as close as 1.8 to 3.0 metres between well centres"** | ibid. **Verified verbatim** — see §9.B for what this does and does not license. |
| Drill floor movement | **"skidded from well to well over the platform skidding beams in two perpendicular directions"** | ibid. **Verified verbatim.** |
| Same mechanism, second source | *"positioned over preset wellheads by jacking across on skid beams"* | oil-gasportal.com, fetched 2026-09-05. Verified. |
| Drilling positions per platform | *"anywhere from four to forty drilling positions"* | US5407302A (Santa Fe International, granted 1995-04-18). Verified. |
| **Capping beam spacing on a fixed platform** | *"typically within a range of between 40 and 55 feet transversely apart"* = **12.2–16.8 m** | ibid. Verified. |
| Skid-off feet / cantilever beam transverse spacing | **60 ft = 18.3 m** | ibid. Verified. |
| Conductor OD | 510–760 mm (20–30 in) | `[EP0147144]` via `research/16` §A.10 (secondary) |
| Conductor guide framing interval | 12–18 m (40–60 ft) | ibid. (secondary) |
| Slot counts seen on real platforms | 48 and 50 active slots | `[NORSKPET]`, `[OT-MARINER]` via `research/16` §A.10 (secondary) |
| Template wellhead-seat minimum spacing | 1.8–2.1 m or more, to fit a guide frame between seats | search-snippet corroboration only, ScienceDirect *Subsea Template* topic page returned **HTTP 403** on direct fetch. **Corroborating, not verified.** |
| Alternative published slot grid | 20 wells, 5 rows × 4, **10 ft = 3.05 m** apart | USPTO 11384609 family, search snippet; the PDF is a scanned image and would not extract. **Corroborating, not verified.** |
| **Conductor pitch, as a ratio** | API shielding blockage factor applies for **0 < S/D < 4.0**, where *"**S is the centre to centre distance of the conductors of diameter D**"*. Real arrays therefore sit **under 4 diameters apart** — for 26″ conductors, **under 2.64 m** | Chakrabarti p. 142. **The formula is quoted; the ≤2.64 m is my inference from its stated range of applicability.** This is the strongest *independent* corroboration of a sub-3 m grid found anywhere. |
| Fixed-platform slot spacing in Chakrabarti | **Absent.** Searched exhaustively across all 669 pages: no stated slot-spacing dimension for a jacket template anywhere in Vol. I | Chakrabarti — **explicit negative** |
| The structural link, though | *"**Deck beam spacing is generally dictated by the wellhead spacing**"*, and the worked deck uses **5 ft = 1.52 m** beams | Chakrabarti pp. 317–318. Suggestive; **the book never closes the loop and neither should we.** |
| **Spar centrewell slot spacing (a DIFFERENT machine)** | *"All the spar centrewells to date have been square, lending themselves to **4 × 4 (16), 5 × 5 (25) or 6 × 6 (36) well slots**"*; *"Spacing… has ranged from **8 ft** to **14 ft**"*; recommended **12 ft** to 3,000 ft water, **13 ft** to 5,000 ft, **14 ft or more** beyond | Chakrabarti p. 548. **Verified — and deliberately quarantined.** 2.4–4.3 m, wider than the platform figure, and it belongs to a *floater*, not a jacket. See the warning below. |

**Verdict on the repo's number: the 1.8–3.0 m grid is real and verified**, but
only against one of the two sources `16-site-archetypes.md` cites for it, and it
must be read as a *close-spacing* statement rather than a universal grid. The
independent support is good: an API-derived pitch of **under 4 conductor
diameters** (≤2.64 m for the standard 26″ conductor) lands squarely inside it.
See §9.B.

> **Do not import the spar number.** A spar's centrewell slots are spaced by
> *"the diameter of the buoyancy cans"* (Chakrabarti p. 548) — a floater-specific
> constraint that does not exist on a jacket. Its **8–14 ft (2.4–4.3 m)** square
> grid is the right answer to a different question, and mixing the two is exactly
> the class of error defect #7 is about.

### 3.10 Deck furniture with published sizes

| Item | Value | Source |
|---|---|---|
| **Helideck** | **64.61 ft octagon = 19.69 m across the flats**, 40 lb/ft² = 1.92 kPa deck load, max helicopter 18 kips = 8.16 t, perimeter safety net, tie-downs, foam fire system, located forward | IADC §A.10 |
| Modern helideck sizing rule | usable area diameter **≥ 1.0 × D**, preferred **1.5 × D**, where D is the rotors-turning overall length of the design helicopter — currently **≈22.6–23.7 m** for common offshore types | CAP 437 / NORSOK C-004 summaries, 2026-09-05 |
| **Cranes** | **3 revolving**: one 120 ft (36.6 m) boom, 57,400 lb at 28.1 ft / 3,260 lb at 120 ft; two 100 ft (30.5 m) booms, 90,720 lb at 24 ft / 5,860 lb at 103.5 ft. Hook reach 50 ft below main deck, 4-part | IADC §A.9.1 |
| **Lifeboats** | **2 × fully enclosed, 65 persons each, port and starboard**, with fire protection and EPIRB | IADC §L.8.1 |
| Life rafts | 8 × 25 persons | IADC §L.8.2 |
| Fast rescue boat | 1, 25 hp | IADC §L.8.3 |
| Escape ladders/nets | 2 leg ladders + 2 (port and starboard bow) | IADC §L.8.8 |
| Accommodation | 100 beds; 21 four-berth rooms, 5 two-berth, 1 six-berth | IADC §K.2.1 |
| **Mud tanks** | **4 tanks, ~400 bbl each, 10 ft = 3.05 m tall**, 1,756 bbl usable total; all with mixers and mud guns | IADC §F.2.2 |
| Shaker / sand-trap tanks | 4 compartments, 159 bbl usable | IADC §F.2.1 |
| Pill/slug tank; trip tanks | 156 bbl (140 usable); 2 × 20 bbl | IADC §F.2.3–4 |
| **Mud pumps** | **3 triplex**, 2 motors each at 800 hp = **1,600 hp = 1,193 kW per pump**, liners 5–7″, 5,000 psi WP | IADC §F.1.1 |
| Standpipe manifold | **2 standpipes**, 3 1/16″ 10K and 5⅛″ 10K, H-type, with kill / fill-up / bleed-off outlets | IADC §F.1.4 |
| Shale shakers | linear motion | IADC §F.2.6 |
| **Power plant** | 3 diesels at **3,070 bhp @ 900 rpm**; 3 AC generators at **2,100 kW @ 900 rpm, 600 V**; 5 SCR bays, 4,000 kW total, 0–750 VDC | IADC §C.1 |
| Emergency generator | 1,200 kW @ 1,800 rpm, 480 V, battery start | IADC §C.2 |
| Rig air | 3 compressors, 350 cfm @ 125 psi; receivers 2,120 usg (workshop), 1,060 usg (**rig floor**), 240 ft³ (engine room), all at 130 psi | IADC §C.1.7–8 |
| Pipe racks | upper **48 × 51 ft = 14.6 × 15.5 m**, lower **40 × 51 ft = 12.2 × 15.5 m**, both **4 kips per linear ft** | IADC §A.2 |
| Burner booms | **None on this unit** — a jack-up carries them only for well testing; the long outrigger boom on a *production platform* is a **flare boom**, a different object | IADC §I.2 |

### 3.11 Ratios a modeller can actually use

Ratios survive a change of class and a change of scene scale; absolutes do not.

- **Derrick height : base width = 5.33 : 1** (160 ft on a 30 ft base). **This is
  the single most important number in this document.** Most game derricks are
  built at 3.5–4.5 : 1 and read as squat pylons. If the derrick is 30 m tall its
  base is **5.6 m**, not 8 m.
- **Crown width : base width = 0.267** (8 ft on 30 ft). The derrick loses
  **three-quarters of its width** on the way up. It is a steep, obvious taper —
  not a gentle one — and it is what makes a derrick read as a derrick rather than
  as a lattice tower or a transmission pylon.
- **Substructure plan ≈ 1.5 × the derrick base, both ways** (45.5 × 46 ft under a
  30 × 30 ft derrick). The derrick base sits well inboard of the drill floor
  edge; there is a walkable margin all round, and that margin is where every
  piece of drill-floor equipment lives.
- **Substructure height : derrick height ≈ 1 : 5.7** (28 ft of substructure under
  160 ft of derrick). Total main deck to crown ≈ **188 ft = 57.3 m**.
- **Clear height under the rotary beams ≈ 0.75 × the drill floor height**
  (21 ft of the 28 ft). The lost quarter is beam depth — the rotary is carried on
  deep girders, and those girders are visible from below.
- **The BOP stack fills that clear height.** ≈5 m of stack under 6.40 m of clear
  space. It is not a small object tucked under the floor; **it very nearly
  touches the beams**, and there is barely room to work around it.
- **A ram preventer is as wide as it is tall** — 1.69 m tall, 2.90 m long. Model
  BOP bodies as blocks, not as cylinders.
- **Block sheaves = crown sheaves − 1, and lines = 2 × block sheaves.**
  6 and 7 give 12 lines. This is arithmetic, not styling.
- **Crown and travelling sheaves are the same diameter** (52″ / 1,321 mm on both).
  The blocks differ in count and frame, not in wheel size.
- **Sheave diameter ≈ 38 × drilling-line diameter** (52″ on 1⅜″). Wire rope
  sheaves are always huge relative to the rope; a small sheave reads as wrong.
- **Racking board holds 200–330 stands, not twenty.** 20,000 ft of 5″ pipe. The
  setback is a dense forest, and at thumbnail size it reads as a solid dark block
  filling one quadrant of the derrick.
- **Derrick base width ≈ 3 × the drill pipe stand spacing** — the fingers subdivide
  most of one side of the derrick.
- **Jack-up leg length ≈ 1.9 × hull length** (393.8 ft of leg on a 207.3 ft hull),
  and legs stand **≈ 2.6 × the hull's own length above** the hull when jacked up
  in shallow water. The legs dominate the silhouette; the hull is a slab at their
  feet.
- **Jack-up leg spacing ≈ 0.58 × hull length, ≈ 0.68 × hull beam** (120 ft on a
  207 × 176 ft hull) — a near-equilateral triangle (120 vs 121.66 ft) set well
  inboard of the hull corners.
- **Hull depth ≈ 0.10 × hull length** (20 ft on 207 ft). A jack-up hull is a
  *thin* slab. Games routinely draw it three times too deep.
- **Spudcan diameter ≈ 0.10 × leg length** (40 ft on 394 ft), and its height is
  **≈ 0.55 × its diameter** — a squat inverted cone, roughly a fifth of the hull's
  beam across. Not a small foot.
- **Air gap ≈ 1.75 × hull depth** (35 ft on 20 ft). The gap between sea and hull
  is bigger than the hull is thick, and that gap is the jack-up's signature.
- **Cantilever reach ≈ 0.19 × hull length aft, ± 0.07 × beam transversely**
  (40 ft aft, ±12 ft on a 207 × 176 ft hull). The transverse travel is small —
  the cantilever mostly goes *out*, not *sideways*.
- **Helideck ≈ 0.31 × hull length** (64.6 ft on 207 ft), cantilevered off a
  corner.
- **Mud tanks are 3 m tall and there are four of them** — a low, long, boxy bank,
  not a tank farm of vertical cylinders.

**And for the platform it stands on** (all from Chakrabarti Ch. 6):

- **The drill-rig skid beams are 40 ft (12.2 m) apart, and the deck legs sit
  directly under them.** This is the number that ties the whole platform
  together: a 4-legged GoM drilling deck is **80 × 80 ft (24.4 m square)** —
  i.e. **deck side ≈ 2 × skid beam spacing**, with the legs on the quarter points.
- **A drilling deck is 2.5–2.7 × the substructure's own plan width.** 24.4 m of
  deck under a 13.9 m substructure. The drill floor occupies **roughly a third of
  the deck area**, and the other two-thirds are production plant, quarters and
  laydown. *The derrick is a tenant.*
- **Jacket batter ≈ 1 : 8** (vertical : horizontal spread per side). Over 175 ft
  of jacket that is **22 ft of spread per side** — the legs lean out visibly but
  gently. **A jacket is not a pyramid; it is a slightly splayed box.**
- **Jacket bay height ≈ bay width ≈ 40–50 ft (12–15 m)**, giving diagonals near
  **36°** from horizontal. Aspect ratio (a+b)/2h in the band **0.7–1.4**. Draw
  bays roughly square and the bracing angle falls out right on its own.
- **Deck bottom-of-steel ≈ 15 m above the water in 50 m of water**, and the top
  jacket horizontal is **4.6–6.1 m** above mean low water. The band between them
  is the **splash zone**, and it is where every visual difference lives.
- **Conductor pitch < 4 conductor diameters.** For 26″ conductors that is under
  2.6 m — the same order as the 1.8–3.0 m well-centre figure, from a completely
  independent direction.
- **Jack-up hull stiffener pitch 0.6–0.9 m, frame pitch 1.8–3.0 m.** If the hull
  side gets panel lines, that is the spacing.
- **A jack-up leg's bottom bay is heavier than the rest** — built-up I or H
  braces where every other bay is circular tube.

---

## 4. Component inventory

Every item below matters visually. Where it does not, it is not in the list.

### 4.1 The derrick

1. **Four legs on a square plan, tapering hard** — 30 ft square at the base to
   8 ft square at the crown (IADC §B.1.1). Leg section reduces with height as the
   compressive load drops.
2. **Girts and diagonals in bays.** A derrick is fully braced except at the
   V-door. *Why it matters:* the bay rhythm is what gives the silhouette its
   texture at distance; too few bays and it reads as a pylon.
3. **The V-door** — one face left open at the bottom so pipe can be dragged in
   from the catwalk. **It is the single feature that separates a derrick from a
   tower.** The head of the opening carries a heavy tie.
4. **Crown block platform / water table** at the top, with **a platform for crown
   sheave access** (IADC §B.1.1) and railings. Grated, not solid — the lines pass
   through it.
5. **Ladders with safety cages and rest platforms** on one leg, top to bottom
   (IADC §B.1.1). *Why it matters:* the cage hoops are a strong repeating vertical
   detail and read even in silhouette.
6. **Explosion-proof lighting** and, at the top, an **obstruction light**
   (`crouse-hinds…pdf` names "obstruction lighting" as derrick/mast item 1).
7. **Rig floor windbreaks** (IADC §B.1.6: fitted). Note the same form records
   **no derrick wind wall** — the derrick itself is open lattice, but the *floor*
   is screened. Getting this the wrong way round is a common error.
8. **A counterbalance system for the rig tongs and the spinning tong**
   (IADC §B.1.1) — weights on lines running up inside the derrick, and they are
   visible.
9. **Derrick TV cameras** at the monkey board and the casing stabbing board, with
   pan/tilt/zoom, monitored at the driller's console (IADC §B.1.7).

### 4.2 The racking board / monkey board

- **The board itself**, cantilevered from one face of the derrick, with railings
  and its own access ladder.
- **The fingerboard** — parallel fingers projecting over the setback, with a
  latch per slot. Capacity here: **20,000 ft of 5″ pipe** (IADC §B.1.2).
- **The setback area on the drill floor** below it, rated **450 kips = 204 t**
  (IADC §B.1.5). *Why it matters:* the stands stand *vertically* on the floor and
  lean *only slightly* into the fingers. They are not stacked at an angle.
- **Two monkey-board work winches** (1,000 lb each) and **man-riding winches**
  (IADC §A.9.4.2–3).
- **The derrickman's escape line** from the board to a ground anchor.
- **A casing stabbing board**, adjustable **20–43 ft above the rotary**
  (IADC §B.1.4), on the opposite side from the monkey board.

### 4.3 The drill floor

- **Rotary table**, 37½″ opening, with a **drip pan / mud collection system**
  (IADC §B.4.1). The drip pan is a shallow tray the whole table sits in and it is
  always filthy.
- **Master bushing with insert bowls** — three sizes carried (IADC §B.4.2).
- **Slips**: drill-pipe hand slips for 3½″ and 5″; **drill-collar slips in
  4½″ (7 segments), 6½″ (9 segments) and 8½″ (11 segments)** (IADC §D.2.4, §D.2.6).
  *Why it matters:* the segment count is visible and it changes with size.
- **Manual rotary tongs** — two sets, 4″–15″ at 100,000 ft-lb and 3½″–14″ at
  65,000 ft-lb (IADC §D.2.18). Physical size from the tong catalogue: a tong of
  this class is **1.44–1.53 m from the jaw to the lever end (dimension A) and
  1.84–1.98 m overall (dimension B)** (`nov_rotary-handling-tools…pdf`, manual
  tong dimensions table). They hang on the counterbalance lines when not in use.
- **No iron roughneck** on this rig (IADC §D.2.21: None). Instead a
  **hydraulic makeup/breakout machine** at 90,000 ft-lb and a **pipe spinner**
  for 2⅞″–9½″ (IADC §D.2.15, §D.2.17). *Why it matters:* an iron roughneck is a
  large wheeled robot on the floor. A tong rig has **two big tongs on chains and
  a spinner** instead, and the floor is far more open.
- **Elevators**: 250 t centre-latch for 3½″, 350 t for 5″, plus single-joint
  elevators (IADC §D.2.1). Hanging on **elevator links**: this rig carries
  **3½″ × 22 ft (6.71 m) links rated 500 short ton** and **2¼″ × 12 ft (3.66 m)
  links at 350 t** (IADC §D.2.13). The general catalogue ladder is shorter —
  **762–2,743 mm at 100–350 sTon** (`nov…pdf`, Perfection and weldless link
  tables) — so treat link length as **0.8–6.7 m** and pick by what the rig is
  handling.
- **Mousehole and rathole**, sleeved through the floor.
- **Mud saver bucket** for 3½″ and 5″ (IADC §D.2.16).
- **Two rig-floor air winches** at 11,000 lb, port and starboard, plus a
  pull-back tugger (IADC §A.9.4.1). *Why it matters:* air winches, their hoses and
  their hanging hooks are everywhere on a real floor.
- **A 1,060 US-gallon air receiver on the rig floor itself** (IADC §C.1.8) — a
  large horizontal pressure vessel, usually under the floor or at its edge.
- **The driller's console / doghouse.**
- **The boxing-ring rotary handrail** — two half-moon segments with high kick
  plates dropped into the rotary when the master bushings are out
  (`Gulf-Rig-Catalog.pdf`, ~p. 23). **The hole is never left open.**
- **Hole covers in high-visibility tarpaulin** over the mousehole and rathole
  during completion work (ibid.).

### 4.4 Under the floor — the substructure

- **The BOP stack**, ≈5 m tall and ≈2.9 m across, sitting on the wellhead with
  **6.40 m of clear height** above it (§3.6). Below the floor and in front of the
  substructure's open face.
- **BOP handling**: two hoists, two lift points, 27.5 t SWL (IADC §E.10.1), and
  a **conductor pipe platform** (IADC §E.10.2). Skidding a BOP is a routine
  operation, so there are rails and a parking position for it.
- **Choke and kill lines** off the side outlets — 4 1/16″ 10K, four per double
  body, two per single (IADC §E.3.1, and the preventer information sheets).
- **Bell nipple and flow line** from under the rotary out to the shakers.
- **The wellhead** and, on a platform, **the conductor** it stands in.
- **Deck utility winches** at the **BOP cellar deck**, port and starboard
  (IADC §A.9.4.4) — the form names the level, which is what a cellar deck is
  called offshore.

### 4.5 The hoisting train, top to bottom

Crown block (6 + 1 sheaves, 52″) → **12 lines** → travelling block (6 sheaves,
52″) → hook → **bails** → top drive → **links** → elevators → pipe. The dead line
runs to the **deadline anchor with its weight sensor**; the fast line runs to the
**drawworks drum, 30″ × 58″, grooved**. The top drive is restrained against
rotation by a **track and dolly** running the full height of the derrick
(IADC §B.3.7).

### 4.6 The top drive

Motor housing, gear case, main bearing, **washpipe and gooseneck**, the rotating
**quill and saver sub**, the **IBOP** below it, the **pipe handler** with its
rotating collar and link tilt, and the **service loop** — the bundle of hoses and
cables that follows it up and down the derrick. 500 ton, 61.7 kNm continuous,
115 kNm makeup/breakout, 250 rpm (IADC §B.4.4).

### 4.7 Mud and solids

Four **3.05 m tall tanks** in a bank with mixers and mud guns; a **sand trap and
shaker tank set**; **linear-motion shale shakers**; **desander, desilter, mud/gas
separator, degasser, agitators**; **three triplex pumps at 1,193 kW each**;
**mixing, transfer, booster and charging pumps**; and **two standpipes** running
up the derrick to the rotary hose (IADC §F).

### 4.8 Power

Three diesel engines at 3,070 bhp, three 2,100 kW generators, **five SCR bays**,
a 1,200 kW emergency generator, three air compressors and three receivers
(IADC §C). *Why it matters:* the **SCR house** is a large, clean, painted box —
it is one of the biggest single objects on the deck and it is never inside the
derrick.

### 4.9 Marine and safety

Three **revolving cranes** on pedestals with 30.5–36.6 m booms; the **helideck**;
**two 65-person lifeboats** in davits, port and starboard; eight liferafts; a
fast rescue boat; leg ladders and escape nets; life-ring cabinets. Plus, on a
jack-up specifically: **three jacking houses**, one at each leg, containing 12
pinions each.

### 4.10 The eleven named areas of an offshore drilling package

The lighting brochure's zone map is effectively a checklist for the deck, and it
is worth building to (`crouse-hinds-b-line-offshore-drilling-brochure.pdf`,
pp. 4–5):

**1** Derrick/mast (plus obstruction lighting) · **2** VFD/generators ·
**3** Fuel tank · **4** Motor control / SCR house · **5** Doghouse / operator's
house · **6** Power/pump station · **7** Shakers · **8** Mud tanks/pumps ·
**9** Drawworks & top drive · **10** Drilling floor · **11** Perimeter.

Every one of those except the perimeter is called out as needing
**"cable management & safety grating"** — i.e. every one of them is a grated
platform with cable tray running to it.

### 4.11 Handrails, gratings, stairs — the deck's actual visual texture

- **Grating is pressed plank, not bar grating.** The offshore product is
  **Grip Strut**, *"tailor made for slip-resistant walkways in demanding
  environments where mud, ice, oil and other substances can create hazardous
  working conditions"*, in three tooth patterns: **no teeth, standard with teeth
  (self-cleaning and self-draining), and reduced opening** to stop dropped
  objects falling through (`crouse-hinds…pdf`, p. 16). *Why it matters:* pressed
  plank has a directional, ribbed read; bar grating has a fine square grid. They
  look different at every distance.
- **Reduced-opening grating goes where something is underneath.** That is a real
  design decision a modeller can make visible.
- **High kick plates** at every floor edge and every opening
  (`Gulf-Rig-Catalog.pdf`, boxing-ring handrail: "high kick plates", "reduces risk
  of dropped objects").
- **Handrails everywhere, broken only at the V-door and the stair heads.**
- **Stair towers** rather than ladders between deck levels; **caged ladders** on
  the derrick legs and up the jack-up legs.
- **Cable tray** running to all eleven areas, on stand-offs, usually under
  walkways and along beam webs.

Deck flooring itself *"may be non-existent, **grated, checkered plate, timber or
plain plate**"* (Chakrabarti p. 317) — all four appear on one structure, and the
access outfit (*"ladders, walkways, gratings, rails, closures"*) is called out as
*"considerably costlier per unit weight than structure"* (p. 493). It is a small
fraction of the tonnage and most of the visible surface.

### 4.12 What hangs on the structure itself (platform case)

The jacket appurtenance list, verbatim (Chakrabarti p. 296): *"**boat landings,
barge bumpers, conductor bracing and guides, risers, clamps, grout and flooding
lines, j-tubes, walkways, mud-mats**"*. The ones that read at a distance:

- **Boat landings — two of them, on opposite faces.** *"Generally, **two boat
  landings each located in opposite faces of the platform** are installed to
  provide supply boat and small watercraft access for all current/wind
  directions. The boat landings are **located near the mean water surface** with
  suitable depth and elevation to provide boat access at low and high tide
  levels"* (p. 341). Note the exception: in the **North Sea** and in deepwater,
  where crew move by helicopter and wave loads are severe, *"not providing boat
  landings could be given consideration"* — so a North Sea platform may have
  none.
- **Barge bumpers.** *"**steel pipe lengths placed at a suitable distance from
  and welded or clamped onto the jacket legs**… generally fitted with **truck
  tires or rubber fenders** providing soft impact surfaces"* (p. 341). Truck tyres
  bolted to a steel frame beside each leg — a scruffy, specific, very
  recognisable detail.
- **Risers**, *"pipes clamped onto the jacket legs or braces"*, with **riser
  protection cages or fenders** near the waterline (p. 342). Plus **caissons**,
  **sumps** and **J-tubes** — the surface-piercing pipes for produced-water
  discharge and seawater intake.
- **Sacrificial anodes** in rows down every leg and brace (§6.2).
- **Bridges to neighbouring platforms.** A North Sea field centre may be separate
  **production / drilling / quarters** platforms bridge-linked (p. 342,
  Fig. 6.8 p. 286) — which is exactly what `research/16` §A.10 describes as
  *"four platforms connected by bridges"*.
- **Stair towers** between deck levels; **caged ladders** down the jacket to the
  boat landings.

---

## 5. Distinctive features (thumbnail silhouette)

At thumbnail size an offshore drilling package is five things:

1. **A very tall, hard-tapering four-legged tower — 5.33 high to 1 wide at the
   base, shrinking to a quarter of that width at the top.** Nothing else in the
   game's line-up has this proportion. If it reads as a pylon, the ratio is wrong.
2. **A dense black block of racked pipe filling one quadrant of the derrick's
   lower half.** Two hundred–plus stands standing vertical against the fingers.
   This is the second-most-recognisable thing about a derrick and it is almost
   always under-drawn.
3. **A boxy braced substructure half as tall as the derrick base is wide, with a
   5 m BOP stack visible inside it.** The derrick does not stand on the deck; it
   stands on a table with a machine underneath.
4. **The monkey board sticking out of one face, three-quarters of the way up,**
   with a handrail and a man-sized gap. It breaks the taper asymmetrically and it
   is the give-away that the tower is a derrick.
5. **The V-door**: one bottom face open, with the pipe ramp running away from it.

### 5.1 Jack-up silhouette vs platform silhouette

This is the distinction the game currently cannot make, and it is easy:

| | **Jack-up** | **Fixed platform** |
|---|---|---|
| Below the deck | **daylight** — a 10.7 m air gap, then three or four bare legs going down into the water | **structure all the way down** — jacket bracing battered 1:8 in 12–15 m bays, **two boat landings on opposite faces**, barge bumpers with truck tyres, anodes in rows, a splash-zone band and a marine-growth line. **No air gap.** |
| Legs | **stand high above the hull**, 2–3 hull-lengths of leg in the air, with **jacking houses** at their bases | none |
| Derrick position | **hanging off one end on a cantilever, out over open water** | **inboard**, standing among production plant |
| Hull | a **thin rectangular slab**, blunt-ended, depth ≈ 0.10 × length | not a hull at all — a deck box on legs |
| Other big objects | quarters block, helideck cantilevered off a corner, three crane pedestals | separators, compressors, a quarters block, a **flare boom on a long outrigger**, helideck |
| Wells | **one**, at the cantilever tip | **a grid of ten to forty conductors** marching down through guide frames, Christmas trees on the same grid |
| Is the derrick the point? | yes — the whole unit exists to drill | **no.** `research/16` §A.10 puts it best: on a platform the drilling package *"is a tenant"* |

**Negative space matters as much.** On both: **no moonpool, no riser, no
buoyancy modules, no heave compensator, no anchor chains.** Those five belong to
the floating units, and any one of them on a platform or jack-up is an error a
driller spots instantly.

---

## 6. Materials, paint, and where wear and dirt accumulate

Offshore is a specific, learnable look. It is not "a land rig near water".

### 6.1 The coating system, and why it drives the look

Offshore steel is painted to a coating standard, not decorated. NORSOK M-501 —
the North Sea reference — divides the structure by **exposure zone**, and each
zone gets a different build (`worldofcorrosion.com` summary, fetched 2026-09-05;
**secondary — a summary of the standard, not the standard itself**):

| Zone | Generic build | Total DFT |
|---|---|---|
| **Atmospheric** — decks, superstructure, external steelwork | zinc epoxy primer + epoxy intermediate + **polyurethane topcoat** | 280–320 µm |
| **Submerged** — underwater, ballast tanks, seawater intakes | solvent-free high-build epoxy | 350–500 µm |
| **Splash zone** — tidal and spray, *"the most aggressive corrosion environment"* | high-build epoxy, maximum thickness | **450–600 µm** |
| Under insulation | **thermally sprayed aluminium (TSA)** or organic | per temperature |
| Fire protection | intumescent / cementitious | per rating |

What that means on the model:

- **Three visibly different finishes on one structure.** The splash-zone band is
  **twice as thick** as the topsides paint — it is glossier, fatter, softer-edged
  over welds, and often a different colour. On a jack-up it is a band around each
  **leg**; on a platform it is a band around the jacket legs and conductors.
- **TSA is matt light grey and slightly rough**, not glossy. Where it appears
  (exhaust runs, hot piping) it reads as a completely different material.
- **A polyurethane topcoat holds gloss and colour** for years. Offshore steel is
  not chalky and faded the way a construction machine is — it is glossy where it
  is intact and *catastrophically* rusty where it is not. **High contrast between
  intact and failed is the offshore signature.**

### 6.2 Below the waterline the steel is BARE — and this is the biggest single look-changer

The topsides coating story above stops at the water. Below it, offshore practice
is the opposite of what most people assume (Chakrabarti Vol. I, p. 342):

> *"**The submerged portions of the steel jackets are usually left uncoated** and
> cathodic protection is provided to protect these areas against corrosion."*

So a jacket, and a jack-up's legs below the splash zone, are **unpainted steel
going brown, not painted structure going rusty**. Three consequences, all sourced:

- **Sacrificial anodes, and they are big.** *"made of materials such as
  **magnesium, aluminum or zinc**… generally **cast over tubular steel cores,
  which are welded to the structure**. The sizes of these anodes are substantial
  (such as **4-in. square, 3–6 ft long**, sometimes weighing as much as **4 % of
  the total jacket weight**)"* (p. 342). They are **3 % of jacket steel weight**
  (Table 6.2, p. 368) and they are clamped along the legs and braces in visible
  rows, each on a **wrap plate** at its weld (Fig. 6.33, p. 343). Fresh anodes are
  pale grey and blocky; old ones are eaten hollow. **Nobody models these, and they
  are one of the most distinctive things about underwater offshore steel.**
- **The splash zone is physically thicker, not just better painted.**
  *"Increasing leg and brace thickness at the wave splash zone by about **1/8 to
  1/4 inch**… is commonly used as additional corrosion allowance"* (pp. 315, 329,
  330), plus a **"sacrificial wrap plate"** where cathodic protection cannot
  reach (p. 303). There is a **step in the steel** at the top and bottom of that
  band.
- **Marine growth is a specified thickness.** *"**The API guideline recommends a
  1.5 in. growth on members for depths from 0 to 150 ft below the surface**"*
  (p. 138). That is **38 mm of hard growth** — enough to visibly fatten every
  member and soften every joint below the tide line, and it is an *input to the
  structural analysis*, not a decorative afterthought. Above the growth line the
  member is bare steel; below it, it is furred.
- For a deepwater jacket the **"wave action zone" is ≈200 ft (60 m) below sea
  level** (p. 390) — the band where the structure is heaviest and most detailed.

**The resulting vertical banding on any offshore structure, top to bottom:**
glossy painted topsides → safety-coloured deck edges → **splash zone: thicker
steel, heaviest coating, worst staining** → tide line → **furred marine growth on
bare brown steel with anodes** → clean dark water. Getting those five bands in is
worth more than any amount of topside detail.

### 6.3 Colour

- **Structure**: one dominant colour, applied everywhere and consistently —
  typically an off-white/light grey or a mid grey, with the derrick sometimes
  picked out. It is a *marine* palette, not a plant palette: fewer colours than a
  land site, applied over more area.
- **Safety yellow and black** at every edge, nosing and change of level, and on
  handrail top rails at openings. The offshore rule is that anything you can walk
  off, walk into or drop something through is marked.
- **Safety equipment is red**: fire stations, hose reels, extinguisher cabinets,
  the life-buoy cabinets. **Lifeboats are orange**, and they are the brightest
  objects on the whole structure.
- **Helideck**: a dark non-slip surface with the perimeter marking, the touchdown
  circle and the D-value / maximum-mass markings in white or yellow, plus green
  perimeter lights.
- Equipment cabinets and telephone hoods come in **RAL yellow or red**
  (`crouse-hinds…pdf`, p. 18) — small, saturated punctuation against the grey.
- The obstruction light at the crown is **red**.

### 6.4 Where the dirt actually goes

This is what makes it read as a working installation rather than a render:

- **Rust bleed streaks running DOWN from every fastening, weld seam and edge.**
  This is *the* offshore weathering signature. Bolt heads, nut faces, clip
  fixings, handrail stanchion bases, ladder-cage rivets and the top edge of every
  horizontal member each start an orange-brown vertical run. They are **narrow,
  long, and all parallel to gravity** — not blotches. On a light grey structure
  they are the dominant visual texture at mid distance.
- **Salt staining** — pale, chalky, greenish-white haze on horizontal surfaces
  and in the lee of obstructions, heaviest on the weather side and at low level.
  It sits *over* the paint and it lightens the colour rather than darkening it,
  which is the opposite of land dirt.
- **The splash zone and below**: a hard tide line, then marine growth. On a
  jack-up the legs are wet below the air gap and carry that line; on a platform
  the jacket does.
- **Gratings weather in a specific way.** Boots polish the tooth crests to bright
  metal while the valleys hold black grease and rust. A walked-on grating is
  **bright on top and dark between** — a fine directional stripe. Unwalked
  gratings (behind equipment, on upper platforms) stay uniformly dull and rusty.
  Getting this difference in is worth more than any amount of extra geometry.
- **The drill floor is the dirtiest surface on the unit** — mud, pipe dope,
  grease, and standing water in the drip pan. The mud is **grey-brown and
  sticky**, not earthy, and it is heaviest in a ring around the rotary and along
  the path from the V-door to the well centre.
- **Pipe dope** — a bright, greasy, metallic-grey or copper smear on every tool
  joint, on the tong jaws, on the stabbing board and on gloves and handrails
  around the floor. It is glossy and it never fully cleans off.
- **The stands in the setback carry a mud gradient** — dirty at the bottom where
  they stood in the setback, cleaner up the body.
- **Grease** at every sheave pin, the crown, the deadline anchor, the drawworks
  drum flanges and the top-drive dolly rails.
- **Chipped paint on walkway nosings, stair treads, handrail top rails and the
  V-door frame** — wherever boots and pipe go. `addWearStory` already does this
  at walkway edges; it is right, keep it.
- **The paint is intact almost everywhere else.** Resist the temptation to age
  the whole structure uniformly. Offshore weathering is **local and directional**:
  clean glossy paint with rust streaks running out of specific points.

---

## 7. Photo references

**This is the weakest section in the document and the gap is real.**

| Image | What it is | Useful for |
|---|---|---|
| `C:\Users\henri\Downloads\AdobeStock_576965172.jpeg` (and the near-duplicate `AdobeStock_576964972.jpeg`) | An AI-generated / heavily stylised portrait of two workers in orange PPE and hard hats under floodlights, in rain, with a vertical tubular object and overhead beams behind them. Watermarked stock. | **Lighting and mood only.** Genuinely useful for one thing: it shows what offshore *night* light does — hard pools from overhead floods, wet everything, deep shadow between fixtures, and orange PPE as the only saturated colour. **No usable geometry.** Do not model from it. |
| `C:\Users\henri\Downloads\AdobeStock_1473667377_Preview.jpeg` | Checked and rejected: a crew briefing, underground/tunnel setting, watermarked. | Nothing. |
| `C:\Users\henri\Downloads\360_F_111897408_….jpg` | Checked and rejected: a horse logo. | Nothing. |
| `Rotary_Drilling_Rig_1000_0001.jpg`, `Surface_Drill_Rig_1000_0001.jpg`, `surface_top_hammer_drill_rigged_01.jpg`, `rtg-…-pile-driver-….webp`, `kr-806-3gs-vertikal-laengs.jpg` | Foundation, surface-drill and piling machines. | **Negative reference only** — these are the silhouettes `oil-derrick` must not resemble. |
| ~190 further images swept in `Downloads` (WhatsApp batches, Gemini/ChatGPT generations, branding, screenshots, `Atpa\`) | Listed and spot-checked. | **No offshore rigs, no derricks, no platforms, no jack-ups.** |

`NOT SOURCED`: **there is no photograph of an offshore drilling unit anywhere in
`Downloads`.** Everything in this document about surface finish, weathering and
deck clutter is reasoned from coating standards, the equipment catalogues and the
general offshore rules in §6 — it is not traced from a picture.

**What would close this section**, in priority order:
1. One **full side elevation of a jack-up on location**, showing the air gap, the
   legs above the hull, the jacking houses and the cantilever.
2. One **drill floor looking at the V-door** from the driller's side — tongs on
   their counterbalances, slips, the rotary and its drip pan, the setback.
3. One **looking up the inside of a derrick** from the floor — the racking board,
   the fingers, the stands, the torque track, the crown.
4. One **platform from a boat**, showing the jacket going into the water, the
   conductor guides, the splash-zone band and the flare boom.
5. One **BOP stack under a drill floor**, to get the bulk and the choke/kill
   plumbing right.

---

## 8. NOT SOURCED

Honest list. None of these should be invented.

- **Derrick leg cross-section** (tubular? angle? box?), member sizes, and the
  **number of bays**. The IADC form gives height, base and crown and nothing
  about the section. This is a real gap — bay count is highly visible.
- **Which stand length this class racks** — doubles or trebles. The IADC form has
  no field for it. §3.3 gives the arithmetic for both.
- **Substructure type** (box-on-box, slingshot, parallelogram, swing-up) and its
  member sizes. Only the plan and heights are sourced.
- **Skid beam section, and the skid stroke.** The **spacing** is now sourced —
  **40 ft (12.2 m)** for a standard GoM platform rig (Chakrabarti p. 312),
  corroborated by *capping beams* at 40–55 ft and *skid-off feet* at 60 ft
  (US5407302A). What is still missing is the **beam depth and the travel** — how
  far the substructure actually moves in each direction, which is what an
  animation would need.
- **The well-slot grid as an actual grid.** The 1.8–3.0 m figure is a *close
  spacing* statement. **Whether real platforms lay wells out on a square grid, a
  rectangular grid with different spacings in the two directions, or in staggered
  rows is not established here** — one corroborating (unverified) snippet suggests
  ~1.3 m × ~1.9 m rectangular, another suggests a uniform 10 ft. Do not draw a
  perfect square grid and call it sourced.
- **Number of slots on any specific platform class**, other than the two
  second-hand figures (48, 50) in `research/16` §A.10.
- **Conductor guide frame geometry** — how the guides are framed, their plate
  thickness, the collar detail. The **12–18 m** framing interval is second-hand,
  and the **≈1 in. sliding clearance** and the load path are sourced
  (Chakrabarti p. 341), but nobody gives the guide's actual shape.
- **Cantilever reach and skid distance from a structural source.** The reach
  envelope is sourced from the IADC form and `research/16`; the **beam depth,
  the skid mechanism and the locking arrangement are not**, and Chakrabarti
  explicitly excludes cantilever beams from its models (p. 407) which is why it
  gives no dimensions.
- **Jacking house dimensions.** Pinion count (12/leg), jacking speed, the four
  jacking-system types and the top-guide/bottom-guide arrangement are all sourced;
  **the box around them is not.**
- **Jack-up leg chord spacing / leg triangle side length as a general figure.**
  The IADC unit's **120 ft / 121.66 ft** is one data point; Chakrabarti never
  states leg spacing at all. **Chord diameter and rack tooth pitch: nowhere.**
- **Spudcan diameter as a general rule.** The IADC unit's **40 ft** is one data
  point and `research/16` gives **20 m** as the maximum; Chakrabarti works only
  with an "equivalent radius R" symbol.
- **Jack-up hull length × width × depth from a structural source.** The IADC unit
  gives one set; Chakrabarti gives stiffener and frame pitch but no hull envelope.
- **Flare boom length and angle.** The only figure found (50–100 ft) came from a
  patent's general wording, not a specification, and is **not reliable enough to
  quote as a dimension.**
- **Drawworks, mud pump and SCR house external dimensions.** Power, drum size and
  flow are sourced; the boxes around them are not.
- **Top drive external dimensions and weight.** Ratings are fully sourced;
  the physical envelope is not.
- **Crown block and travelling block frame dimensions.** Sheave count, sheave
  diameter and rating are sourced; overall height and width are not.
- **Actual paint colours** for any real unit. §6 gives the coating *systems* and
  the safety-colour conventions, both sourced; the specific livery is not.
- **A photograph of anything in this document** (see §7).

### 8.1 What Chakrabarti was checked for and does NOT contain

Worth recording precisely, because it is the most authoritative offshore text in
the folder and the natural place someone would look next. **Vol. I was searched
exhaustively and contains none of the following:**

- **Any derrick geometry at all** — height, base width, ratio, type, crown block,
  racking board, monkey board, setback capacity, hook-load-versus-size. Its 15
  uses of *"derrick"* nearly all mean **derrick barge / crane vessel**; the two
  "crown block" hits are a *crown block plate*, a pile-to-leg connection detail.
  *"Rotary"* returns **zero hits** in the whole book. *"Drawworks"* returns one,
  in a module contents list. Go to **API Spec 4F** or an OEM datasheet instead.
- **Fixed-platform well-slot spacing** (§3.9). The only slot spacing it gives is
  for a **spar centrewell**, which is a different machine.
- **Drill floor substructure height, rotary table opening, BOP stack height,
  V-door.**
- **Drillship moonpool dimensions**, heave compensator, telescopic joint,
  diverter, slip joint. (Riser *tensioner* stroke is there: 20 ft+ hydraulic,
  a few feet passive, pp. 434–435.)
- **Helideck diameter and the D-value rule.** Helideck appears only as a payload
  line item.
- **Flare boom or flare tower length and angle.**
- **Lifeboat / TEMPSC** count, location or davit geometry. *"TEMPSC"* = zero hits.
- **Crane pedestal dimensions.**
- **Handrail dimensions.** *"Handrail"* = zero hits; *"hand-railing"* appears once
  in a checklist.
- **NORSOK M-501, paint systems, coating schemes, DFT, topcoat colours.**
  Chapter 15 *Materials and Corrosion* is in **Volume II**, which is not in
  `Downloads`. **Getting Volume II would close most of §6's remaining softness.**

### 8.2 Still unmined

`Offshore_Product_Reference_Guide.pdf` (50 MB), `oilfield-products-catalog.pdf`
(16 MB), `HMH-Technical-Training-Catalog…pdf` (31 MB) and
`Drill_Pipe_Catalogue.pdf` were **delegated to a parallel research pass that had
not reported when this document was closed**. Given what Chakrabarti turned out
*not* to have, these equipment catalogues — especially the HMH training catalogue
— are now the best remaining hope for **top drive, drawworks, mud pump and block
external envelopes**, and for anything on **riser and heave compensation**. Mine
them before treating §8 as final.

---

## 9. Domain-truth warnings vs the current game build

Read against `DERRICK` (ll. 3318–3327), `buildOilDerrick` (ll. 3846–4200) and the
helpers `buildDerrickSection` (3396), `buildCrownBlock` (3442),
`buildTravellingBlock` (3509), `buildTopDrive` (3561) in
`C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js`; the rig entry
at `src/game/data.js` ll. 1199–1214; and the offshore kit at
`src/world/terrain.js` ll. 3136–3153.

**The current geometry spec.** `buildOilDerrick` takes every dimension from one
constant block:

```js
const DERRICK = {
  floorY: 6.80,
  height: 28.5,
  baseHalf: 3.45,
  topHalf: 1.45,
  standLen: 18.9,          // a double of two Range-2 joints
  floorX: 4.45,
  floorZ0: -5.90,
  floorZ1: 4.30,
};
```

and the data-side spec is:

```js
{
  id: 'oil-derrick', name: 'Havstein DR-2400 Derrickline', maker: 'Havstein',
  price: 4850000, unlockLevel: 30,
  methods: ['oil-rotary'],
  stats: { power: 1490, torque: 44, feedForce: 450, depthCapacity: 2400,
           rodHandling: 0.94, mobility: 0.06, comfort: 0.88 },
  upkeepPerHour: 540, fuelPerHour: 620, transportTons: 940,
  ...
  model: 'derrick-mast-2400',
}
```

**Credit where it is due, because two of these are dead right.** `power: 1490`
kW is a **2,000 hp drawworks to three significant figures** (IADC §B.2.1: 2,000 hp
= 1,491 kW). The description's "1,180 kW triplex" is within 1 % of a real
1,600 hp triplex (1,193 kW). Whoever wrote those did the arithmetic. The rest of
this section is about the geometry.

---

### A. The derrick is too short AND too fat — and this is the headline error

`height: 28.5`, `baseHalf: 3.45` → a **6.90 m base under a 28.5 m derrick**, i.e.
**4.13 : 1**. The sourced ratio is **160 ft on a 30 ft base = 5.33 : 1**
(IADC §B.1.1), corroborated by the 136–175 ft / 30–40 ft class survey. The game
derrick is **22 % too squat**.

Worse, the taper is wrong in the same direction. `topHalf: 1.45` on
`baseHalf: 3.45` is a **crown : base ratio of 0.42**. The sourced figure is
**8 ft on 30 ft = 0.267** (IADC §B.1.1) — the real derrick loses
**three-quarters** of its width, the game's loses **three-fifths**. Combined,
these two make the tower read as a pylon rather than a derrick, which is exactly
the failure mode the brief called out.

**Two clean fixes, pick one:**

- *Keep the height, narrow the base.* `baseHalf: 2.67` (5.35 m base) and
  `topHalf: 0.71` (1.43 m crown). Cheapest change; nothing else moves.
- *Keep the base, raise the derrick.* `height: 36.8` and `topHalf: 0.92`
  (1.84 m crown). Better, because it also fixes §C below — but the crown, the
  monkeyboard, the standpipe top and `carriageRange` all move with it.

`derrickHalfAt()`'s two-rate taper (`t < 0.75 ? 0.82 : …` — 82 % of the taper in
the bottom three-quarters, near-parallel legs above) is a **good** call and
matches how real derricks are built. Keep the curve; change the endpoints.

*A note on the evidence.* The 160 ft / 30 ft / 8 ft triple comes from **one**
document — the IADC equipment list — because the other authoritative offshore
text in the folder, Chakrabarti's *Handbook of Offshore Engineering*, turns out to
contain **no drilling-derrick geometry at all** (§8.1). The 136–175 ft / 30–40 ft
web survey and API Spec 4F's existence corroborate the class, but if anyone wants
a second primary source for the ratio, it is not in `Downloads`. That does not
make the number soft — it is printed on a filled-in rig specification — but it is
worth knowing that it stands alone.

### B. Defect #7 — `platform-deck` draws a moonpool. Confirmed, and here is the fix

The defect is real and it is in `src/world/terrain.js`:

```js
if (kit === 'offshore') {
  // deck beams and handrails around the moon pool
  ...
  // moon-pool surround
  const ring = new T.TorusGeometry(2.9, 0.16, 6, 26);
  ring.rotateX(Math.PI / 2);
  put(ring.translate(collarPosition.x, 0.10, collarPosition.z), BRAND.amber, 'paint');
```

`terrain.js:493` maps `'platform-deck': { kit: 'offshore', … deck: 'fixed' }`, and
`data.js:4292` states in its own comment that *"A `platform-deck` is a FIXED
INSTALLATION: it is bolted to the seabed"*. So the game **knows** it is fixed and
then draws a 2.9 m amber ring around the well and calls it a moon pool, twice, in
comments.

**Why it is wrong, in one citation.** *Moonpool*: **"A hole or well in the hull of
a ship (usually in the centre) through which equipment pass to gain access to
subsea"** — `Dictionary-of-Oil-Industry-Terminology.pdf`. A fixed platform has no
hull. There is nothing for a moonpool to be a hole *in*.

**The state of the sourcing on the replacement figures.**

- The repo's **1.8–3.0 m well-centre spacing is VERIFIED.** drillingmanual.com,
  *Platform Rig Types & Applications In Oil & Gas*, 2023-09-14, fetched
  2026-09-05, says verbatim: *"the wells spaced at surface as close as 1.8 to
  3.0 metres between well centres"*, alongside *"ten to more than forty"* wells
  and *"the drill floor and substructure can be skidded from well to well over
  the platform skidding beams in two perpendicular directions"*. Use it.
- **But `16-site-archetypes.md` cites two sources for it and only one carries it.**
  `[OGP-OFFS]` (oil-gasportal.com) was fetched on 2026-09-05 and **does not
  contain the spacing figure**. It does confirm the mechanism —
  *"positioned over preset wellheads by jacking across on skid beams"* — so the
  citation is not worthless, but it is attached to the wrong claim. Worth a
  one-line correction in `research/16` §A.10.
- **Read "1.8 to 3.0 m" as a close-spacing statement, not as a universal grid.**
  Two weak corroborations exist and they disagree in a revealing way: one gives
  ~1.3 m × ~1.9 m *rectangular*, another a uniform 10 ft (3.05 m) square on a
  5 × 4 array of 20 wells. Neither could be verified by direct fetch (scanned
  PDF; HTTP 403).
- **But one strong, independent check does land inside the range.** Chakrabarti
  (2005) p. 142 gives the API conductor-shielding blockage factor as applying for
  **0 < S/D < 4.0**, where *"S is the centre to centre distance of the conductors
  of diameter D"*. Real conductor arrays therefore sit at **under four conductor
  diameters** — for the book's own standard 26″ conductor, **under 2.64 m**. That
  is an entirely different discipline (hydrodynamics, not layout) arriving at the
  same order of magnitude. **The range is safe to build.**
- **A perfectly square grid is still a guess — say so in the code comment.**
- **Do NOT reach for the spar figure.** Chakrabarti p. 548 gives a fully sourced
  slot grid — square 4×4/5×5/6×6 at 8–14 ft — but it is a **spar centrewell**,
  spaced by buoyancy-can diameter. Importing it onto a jacket would be the same
  category error as the moonpool.

**And the skid beams now have a real number.** Chakrabarti p. 312:
*"**Most GoM platform rigs supplied by drilling contractors would have 40 ft skid
beam spacing**"*, with the deck legs directly beneath them, giving
*"**80 ft by 80 ft four legged and 120 ft by 80 ft eight-legged GoM deck
footprints**"*. So the skid beams are **12.2 m apart** — wider than the game's
whole 8.9 m drill floor (§E) — and the deck around them is **24.4 m square**.
That single figure sizes the entire platform scene.

**Recommended geometry for `kit === 'offshore'`, replacing the torus:**

1. **Delete the ring.** Nothing round belongs at the collar on a fixed platform.
2. **A well-slot grid.** Draw a **3 × 4 or 4 × 5 array of slots on ~2.4 m centres**
   (mid-range of the verified 1.8–3.0 m), with the active well at the drill
   floor's collar position and the rest capped. `data.js` already carries
   `PRODUCTION_DECK_APPLICATIONS` and a checkdata rule tying `platform-deck` to
   the well — the slot grid is the geometry that rule is describing.
3. **Conductors below each slot**, standing in rows and disappearing through
   framed guides into the water — **510–760 mm OD** (`[EP0147144]` via
   `research/16` §A.10), guides framed at **12–18 m** intervals.
4. **Christmas trees on the inactive slots**, on the same grid. This is the
   well bay's upper level, and `research/16` §A.10 already calls it *"the
   photograph"*: *"Christmas trees on a tight grid… with conductors marching down
   through guide frames into the water."*
5. **Skid beams under the substructure, running two perpendicular ways**, with the
   substructure sitting on them — the verbatim mechanism from both verified
   sources. **Two heavy rails 12.2 m apart** (Chakrabarti p. 312), crossed by a
   second pair, with the deck legs directly under the first pair.
6. **A deck 24.4 m square around it** if the platform is 4-legged, 36.6 × 24.4 m
   if 8-legged (ibid.) — so the drill floor occupies about a third of the deck and
   production plant fills the rest.
7. **No air gap.** Structure continues down out of frame — jacket legs battered
   **1 : 8**, bays **12–15 m** with diagonals near **36°**, conductors marching
   down through guide frames, sacrificial anodes in rows, a splash-zone band and
   marine growth below it. That single change does more to sell "fixed platform"
   than anything else on the list.
8. **Two boat landings on opposite faces near the waterline, and barge bumpers
   with truck tyres** (Chakrabarti p. 341) — cheap, scruffy, unmistakable.
9. **A flare boom on a long outrigger** somewhere on the deck edge — length
   `NOT SOURCED` (Chakrabarti has none either), so make it long and do not put a
   number in a comment.

**And add a jack-up kit rather than reusing this one.** The `marine` kit at
`terrain.js:3074` also draws a moonpool ring, and for a *drillship or semi* that
is **correct** — leave it. But a jack-up is neither: it wants legs with an air
gap, jacking houses and a cantilever, and it currently has nowhere to live.
`research/16` §A.11 already says the game *"renders one deck for all of them"*.
This document supplies the dimensions to fix that (§3.7).

### C. The racking board holds 18 stands. It should hold hundreds

`rackRows: 3 × rackCols: 6` = **18 stands** at high quality, 8 at low —
**340 m of pipe**. The sourced racking capacity is **20,000 ft = 6,096 m of 5″
drill pipe** (IADC §B.1.2), which is **219 trebles or 328 doubles**.

Even judged against the game's *own* `depthCapacity: 2400`, a 2,400 m hole needs
~127 doubles of `standLen: 18.9`. **The board holds 14 % of what the rig's own
spec requires.** Since it is already an `InstancedMesh`, raising `rackRows` and
`rackCols` to something like 6 × 20 is nearly free, and it transforms the
silhouette — the setback is supposed to read as a solid dark block, not as a
handful of poles.

`dyn.racking = { inst: stands, max: nStand }` means the gameplay hook comes along
for free.

### D. The block is reeved for 8 lines; the derrick is rated for 12

`buildCrownBlock(… sheaves: 5 …)` and `buildTravellingBlock(… sheaves: 4 …)`.
The sourced arrangement is **crown 6 + 1, travelling block 6, maximum 12 lines**
(IADC §B.1.1, §B.3.1, §B.3.2). Four block sheaves is an **8-line** rig, and the
sourced 8-line line pull is **738 kips against 1,014 kips at 12 lines** — the game
has drawn away 27 % of its own hoisting capacity.

Fix: `sheaves: 7` on the crown (six working plus the fast-line sheave, which is
what "6 + 1" means) and `sheaves: 6` on the block, then widen `crownX` and
`blockX` to suit. `dyn.lines` already reeves from those arrays, so the drilling
line follows automatically.

**Sheave diameter is close but slightly small.** `grooveR: 0.58` (crown) and
`0.52` (block) give 1.16 m and 1.04 m wheels; the sourced figure is **52″ =
1.321 m on both** — and they are the **same size**, which the game currently makes
different. Set both to `grooveR: 0.66`.

### E. The drill floor is a third too small, and so is the substructure

`floorX: 4.45` and `floorZ0/floorZ1: −5.90 / 4.30` give a floor of
**8.90 × 10.20 m**. The sourced substructure is **45.5 × 46 ft = 13.87 × 14.02 m**
(IADC §B.1.5) — the game's floor is **~55 % of the real plan area**. The knock-on
is that the derrick base (6.90 m) is nearly as wide as the floor (8.90 m), so
there is no walkable margin, whereas the real ratio is **substructure ≈ 1.5 ×
derrick base in both directions** (§3.10). Every piece of drill-floor equipment
lives in that missing margin, which is why the floor currently feels crowded.

`floorY: 6.80` against a sourced **28 ft = 8.53 m** drill-floor height is closer
but still ~20 % low, and it matters because of §F.

### F. The BOP nearly fills the substructure, and the current one is a third too short

`buildTool('bop-stack', { boreMm: 346.1, pressureBar: 345, rams: 3 })` placed at
`y = 6.28`, under a floor at 6.80. **`boreMm: 346.1` is exactly 13⅝″ and
`rams: 3` is exactly the sourced ram count** (one single + one double) — those are
right, and `pressureBar: 345` = 5,000 psi matches the sourced *annular* rating,
though the sourced ram stack is **10,000 psi**.

But the space is wrong. Sourced clear height below the rotary beams is
**21 ft = 6.40 m** (IADC §B.1.5) and the assembled three-preventer stack is
**≈5 m** (§3.6). In the game the BOP sits in a 6.28 m gap between ground and
floor — so the proportion is nearly right — but the *stack itself* needs to be
built to ~5 m to fill it. The real relationship is **a machine that very nearly
touches the beams**, not a small object with headroom.

Two shape notes for whoever builds `bop-stack`:

- **A ram body is 2.9 m long and 1.69 m tall** (double) or 1.06 m tall (single).
  **Model it as a block, not a cylinder** — it is wider than it is tall.
- **The bonnets swing out to 4.39 m** for a ram change. That is a free, real,
  visually spectacular animation nobody has.
- **Side outlets: four on a double, two on a single, 4 1/16″ 10K**, with choke and
  kill lines running off them to the manifold.

### G. `standLen: 18.9` is right for a double — but check it against the derrick

The comment says *"a double of two Range-2 joints"*, and it is correct: the
sourced Range 2 joint is **30.5 ft = 9.30 m** (IADC §D.1.3, derived from 9,000 ft
in 295 joints), so a double is **18.6 m**. Good.

But note what it implies. A 28.5 m derrick racking 18.9 m doubles leaves 9.6 m for
the blocks and top drive — tight but workable. **A 160 ft (48.8 m) derrick of the
sourced class racks trebles (27.9 m).** If §A's fix raises the derrick, this is
the moment to decide whether the rig handles doubles or trebles, because it
changes the racking board height, the stand count and the trip animation. The
IADC form does not say which this class uses — that is `NOT SOURCED` (§8).

Pipe body sizes in `standGeo` are **right**: `0.064` radius = 128 mm ≈ 5″ OD, and
`0.086` = 172 mm ≈ 6⅝″ tool joint. Those match IADC §D.1.3 exactly. Do not change
them.

### H. Missing from the drill floor

The floor builds a rotary, mousehole, rathole, drawworks, power tongs, doghouse,
standpipe manifold and deadline anchor — a good list. Sourced items that are
absent and that a driller looks for:

1. **A drip pan under the rotary table** (IADC §B.4.1: fitted). A shallow tray the
   table sits in, always filthy. Cheap geometry, high recognition.
2. **Tong counterbalance weights on lines up the derrick** (IADC §B.1.1: fitted).
   Currently the tongs sit on the floor with nothing holding them.
3. **A casing stabbing board**, adjustable 20–43 ft above the rotary
   (IADC §B.1.4), on the opposite face from the monkey board.
4. **Two rig-floor air winches at 11,000 lb** plus a pull-back tugger
   (IADC §A.9.4.1), with their hoses.
5. **A 1,060 US-gallon air receiver on the rig floor** (IADC §C.1.8) — a large
   horizontal pressure vessel.
6. **Two standpipes, not one.** The rig carries 3 1/16″ and 5⅛″ 10K standpipes on
   an H-type manifold (IADC §F.1.4); `buildOilDerrick` runs a single tube up the
   derrick.
7. **A pipe ramp / catwalk running away from the V-door.** The V-door is built
   (`openBays`) but nothing arrives through it. The rig has upper and lower pipe
   racks at **48 × 51 ft** and **40 × 51 ft** (IADC §A.2) that the pipe comes from.
8. **A hole cover and the boxing-ring rotary handrail** (`Gulf-Rig-Catalog.pdf`) —
   the rotary is never left as an open hole.

### I. No iron roughneck is correct — say so

`buildPowerTongs` gives the rig a powered tong arm. The sourced unit has
**no iron roughneck** (IADC §D.2.21: *None*) and works with **two manual rotary
tongs** (100,000 and 65,000 ft-lb), a **pipe spinner** and a **hydraulic
makeup/breakout machine**. Both arrangements are real; they just look completely
different, and the manual one is the older, more crowded, more human floor. If the
game keeps the powered arm, that is a legitimate modern choice — but the sourced
tong dimensions (**1.44–1.53 m jaw-to-lever, 1.84–1.98 m overall**,
`nov_rotary-handling-tools…pdf`) are there if anyone wants the alternative.

### J. Spec-sheet coherence: the depth rating fights the hardware

`depthCapacity: 2400` (m) against `power: 1490` kW. The sourced rig with a
**2,000 hp (1,491 kW) drawworks**, a **1,000-kip derrick**, **500-ton blocks** and
**20,000 ft of racking board** is rated **20,000 ft = 6,096 m** of drilling depth
(IADC §A.4). The game has taken the drawworks of a 6,000 m rig and rated it for
2,400 m — and the model name `derrick-mast-2400` and the description
(*"A 2,400 m mast rig"*) both bake that in.

Similarly `torque: 44` kNm against a sourced top drive of **61.7 kNm continuous /
115 kNm makeup** (IADC §B.4.4), and the description's **2,670 kN (272 t) hook load**
against a sourced **static hook load of 1,050,000 lb = 476 t** and 500-ton blocks.

Nothing here breaks; the rig is simply specified as a smaller machine than the one
it is drawn as. If the intention is a 2,400 m rig, the drawworks should come down
to ~800 kW and the derrick with it. If the intention is the derrick that is
drawn, the depth wants to be 6,000 m. **Pick one and let the geometry follow.**

### K. Naming — do not regress

`spec.name` is already the fictional **`Havstein DR-2400 Derrickline`**, which is
correct per DOMAIN.md §10. **Keep every real designation in this document out of
the mesh names, out of `addDecals` `brand`, and out of the shop copy.** That
includes the rig-class designation, every equipment model number in §3–§4, and
above all the **IADC rig identity**, which its own document withholds pending an
NDA and which must not surface anywhere in the game. The **shapes and ratios** in
this document are free to copy; the **badges** are not.

---

_Status: **COMPLETE** for the material available locally and on the open web.
The gaps in §8 are real gaps, not omissions. Two specific things would close most
of what remains: **Volume II of the offshore handbook** (its Chapter 15 is
*Materials and Corrosion*, and §6 currently leans on a summary of NORSOK instead),
and **one photograph of a jack-up on location** (§7). The four unmined equipment
catalogues in §8.2 are the next place to look for equipment envelopes._

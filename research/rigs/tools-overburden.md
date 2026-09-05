# tools-overburden — Overburden casing systems
### Eccentric · Concentric · Ring bit · Wing bit · Lost bits · Casing shoes · Casing

status: COMPLETE for the material available locally. Anything marked `NOT SOURCED` stayed
unfound and must not be invented. §8 lists the real gaps.
subject: tool family `tools-overburden`
scope: GEOMETRY AND MATERIALS reference for 3D modelling. Not a spec sheet, not a sales document.
written by: research subagent, 2026-09-05
game builders compared against: `src/rig/tools.js`, `src/game/data.js` (read-only)

> **NAMING RULE (DOMAIN.md §10) — read before modelling.**
> Real manufacturer names and model designations appear throughout this document
> because that is how the source material is labelled and because a citation
> without a name is not a citation. They are here so the modeller can find the
> drawing again. **Do NOT copy any badge, logo, cast-in lettering, colour-coded
> trade dress or model designation onto a game mesh, and do not use any of these
> as a product name in `data.js`.** Model the geometry, not the brand. Where a
> real part carries a stamped name, model a blank stamping flat or a Drillity
> mark instead.

> **This is the owner's own product family.** Several sources below are HP
> Drilling Equipment's own release drawings and production CAD. Where a number
> here carries an HP citation it is measured, not estimated — treat it as ground
> truth and change the model to match it, not the other way round.

---

## 1. Sources read

| File | Pages / extent | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\HP_Overburden_Product_Catalogue_EN_2026.pdf` | pp. 3–19, full text | **The spine of this document.** Names every part in the string and what it does; the complete thread-family table; the casing size/length/end table Ø101,6–Ø355; the coupling table with lengths and masses; the **152,4 / 88,9 reference system with principal dimensions**; the **lost-bit size table** (across wings, height, central bore, material, mass); the ring-shoe example; the grade table. | **Yes — primary** |
| `C:\Users\henri\Downloads\HP_Overburden_Drilling_Heads_Aarsleff.pdf` | pp. 1–6 | **The single most valuable text in the set.** Full carbide spec of both builds: button counts, button Ø × length, **seating depth 10 mm / exposure 5 mm**, gauge-row tilt angles (35° crown, 15° head), button pitch circles Ø138/Ø148, three gauge-insert heights, **3 flushing ports and their individual inclinations (2 × 25°, 1 × 15°)**. Nothing else in the folder states exposure or tilt. | **Yes — primary** |
| `C:\Users\henri\Downloads\overburden drilling heads 3D.pdf` | 1 p.; text + 200 dpi render + 500/900 dpi crops | The general arrangement of the assembled 152,4/88,9 head: face view with both parts superimposed, longitudinal section A-A, isometric. Ø163 / Ø128 / Ø125, 135 / 70 / 60 mm, carbide called out Ø16, Ø14, Ø8. Shows how ring and pilot nest, the junk slots milled through the crown OD, the three inclined face ports, and the full thread run on the crown shank. The coordinator was right — the most valuable *drawing* in the set. | **Yes — primary** |
| `C:\Users\henri\Downloads\1524,4 CC sm carb comp\` — `.iam` + 3 `.ipt`, opened read-only in Inventor 2024 over COM | BOM + mass properties | **Measured, not quoted.** BOM = 1 crown body + **20 x HM10** + **6 x sternstift**. Crown body bounding box **Ø160,577 x 170,001 mm**; assembly **Ø164,455 x 175,000 mm** → face buttons stand exactly **5,000 mm** proud. `HM10` = **Ø10 x 15 mm**. `sternstift` = **Ø8 x 6 mm** flat pin. Independently confirms the Aarsleff carbide spec to three decimals. | **Yes — primary** |
| `C:\Users\henri\Downloads\88,9 ff sm carb comp\` (Inventor, read-only) | BOM + mass properties | BOM = 1 body + **24 x HM10**. Body **Ø125,000 x 135,002 mm**; assembly **Ø125,2–125,9 x 140,000 mm** → again **5,000 mm** exposure, and the gauge row stands only **0,1–0,45 mm** proud of the body OD. | **Yes — primary** |
| `C:\Users\henri\Downloads\OVERBURDEN.pdf` | 4 pp., full text | **The file that answers the eccentric question.** Four Desco system families (TRB wing, TDEX eccentric, NT 4-wing, SW Super Wing), each tabulated as **casing OD · wall · casing I.D. · Expanded · Retracted**. The only source in the folder that publishes a *retracted* diameter, and it settles the swept/retracted relationship outright. Also gives wing counts by size and the matching hammer. | **Yes — primary** |
| `C:\Users\henri\Downloads\BL_Overburden_Drilling-Catalog-FINAL_2026-02_2_low-res.pdf` | 153 pp.; read pp. 9–13, 25–34, 51–52, 57–58, 72–78 (whole file text-dumped and grepped) | The competitor reference. **Casing OD → ID → spanner flat → length table (p. 51)**, where the wall thicknesses come from; the **casing-shoe outer-Ø ladder for every bit design (pp. 72–77)**; the **eccentric casing-shoe ladder (p. 78)**; twelve named casing-bit designs and seven inner-bit designs with the carbide-insert taxonomy (pp. 25–34); the induction-brazing vs shrink-fit construction note. | **Yes — primary** |
| `C:\Users\henri\Downloads\HP_Spec_DB-152.4_Lost_Bit.pdf` | 1 p. | Nineteen-row dimensioned spec of the DB-152.4 lost bit **with tolerances** — wing span 230 ± 2, transverse 163 ± 2, height 170 ± 2, roof 25°, roof face 9,5°, wing 4°, inner taper 1,75°, shank draft 2°, bores Ø123,5 / Ø127,2 / Ø129, **Ø8 welding-rod bore, Ø16 valve-ball bore, 4 wings at 90°**, 8,83 kg, EN-GJS-600-3, packing 100/crate. | **Yes — primary** |
| `C:\Users\henri\Downloads\DB-152.4-Z02.pdf` | 1 p., 200 dpi render | The same bit as a drawing: two elevations, plan, View A of the underside, isometric. Shows the **cast mould parting plane called out by name and leader**, the cruciform roof, the **four 90° drive lugs on the skirt rim**, and the two cast bosses (Ø11 for the Ø8 rod, Ø25 for the Ø16 ball). | **Yes** |
| `C:\Users\henri\Downloads\lost bit 114 od 127.pdf` | 1 p., 170 dpi render | Dimensioned 114,3 lost bit: 127,00 across wings, 154,55 overall height, Ø74,50 central bore, Ø114,30 −2 shoulder band, Ø87,52 −2 / Ø85,59 −2 / Ø80,82 stepped spigot, 1,82° and 3,74° drafts, 15,00 rib width, Ø116,00 seat with a "Ø115–118" note. Gable roof with a raised central rib. | **Yes** |
| `C:\Users\henri\Downloads\lost bit 178 x 190.pdf` | 1 p., text | Ø140,00 shank, Ø125,50 central bore, Ø179,00 body band, **177,37 overall height**, **190,00 x 186,00 across wings** (not circular), 1,27° draft, steps at 60 / 90 / 115,77, for casing 177–180 −2, EN-GJS-600-3. | **Yes** |
| `C:\Users\henri\Downloads\lost bit 178 x 190\lost bit 178 x 190.ipt` (Inventor) | mass properties | Bounding box **190,0 x 177,373 x 186,0 mm**, volume 1228,3 cm³. Confirms the 190/186 asymmetry is real geometry, and that overall height is 177,37 — **not** the 115,8 the catalogue table prints for that row. | **Yes** |
| `C:\Users\henri\Downloads\lost bit 114,3 od 135.pdf` | 1 p., text | The 42CrMo steel-bodied variant: 135,00 across wings, 168,00 height, Ø68,00 bore, Ø120,00 / Ø83,00, 16,50, 103,25° / 76,75° included angles, 1,64° / 2,10° drafts, for casing 119–122. | **Yes** |
| `C:\Users\henri\Downloads\lost bit 133 od140 - EN-GJS-600-3.pdf` | 1 p., text | Ø133,00 body, 140,00 across wings, 158,00 height, Ø105,00, steps 54 / 79 / 105, 76,03 / 94,05 / 107,05. | **Yes** |
| `C:\Users\henri\Downloads\lost bit 194.pdf` | 1 p., text | Ø195,00 / Ø160,00 / Ø138,00, 205,00 x 205,00 across wings (square plan), 158,00 height, 1,27° draft, 70,00° included, steps 60 / 95 / 183, 17,50, for casing 194–197. | **Yes** |
| `C:\Users\henri\Downloads\RS 152.pdf` | 1 p., 170 dpi render | The **ring shoe** that carries the lost bit. OD Ø154,00, bore Ø126,00, overall height 115,00, upper spigot 26,00 tall, internal counterbore **Ø130,00 x 50,00 deep**, 2,00 lip wall and 2,00 relief, 75,00 shoulder, and **four 90°-spaced notches cut through the top face** — the drive that takes the lost bit's four lugs. | **Yes** |
| `C:\Users\henri\Downloads\152,4 cc al.pdf` | 1 p., text | "1524,4 CC long thread": Ø163,00 / Ø128,00 / Ø145,00 / Ø136,00, **240,00 overall with a 170,00 head**, steps 28 / 22 / 40, carbide Ø8 and Ø16 called out, 152,4 conical LH 3-start, 42CrMo. The large-carbide crown on a long connector. | **Yes** |
| `C:\Users\henri\Downloads\Aarsleff Outerbit\Aarsleff Outerbit.ipt` (Inventor) | mass properties | Ø160,584 x **240,004 mm**, material 42CrMo, **6,233 kg**. Same 240 mm body as `152,4 cc al.pdf`, same Ø160,58 body OD as the small-carbide crown. The only sourced *mass* for a ring-bit body. | **Yes** |
| `C:\Users\henri\Downloads\Ring drill bit 152.4.pdf` | 1 p., text | Independent third-party drawing of the same part: Ø163, Ø128, 152,4 conical LH 3-start, **100 mm thread, 170 mm overall**, "Ø163 Semi Ballistic Pins". Confirms Ø163/Ø128/170 from a second hand. | **Yes** |
| `C:\Users\henri\Downloads\Full drill bit 101,6.pdf` · `Vollbohrkrone ZT0759801.pdf` | 1 p. each, text | The **one-piece full-face casing crown**: Ø125 body on a 101,6 conical LH 3-start connection, **160 mm long, 100 mm thread**, Ø16 semi-ballistic buttons, 42CrMo4V. Ø125 on a Ø101,6 casing is a 23,4 mm over-cut — the drill-without-an-inner-string variant. | **Yes** |
| `C:\Users\henri\Downloads\HP_Casing_Drawings_EN.pdf` | 63 pp., whole file text-dumped and grepped | Per-drawing transcription of the casing/drill-tube connectors: OD, **bore**, connection form, hand, starts, overall length, thread length, and for the 133 conical LH 3-start the explicit **lead 33,867 mm / pitch 11,289 mm, R5 root** (R4 on the 114,3 cylindrical 3-start). Independently reproduces the entire bore ladder. | **Yes** |
| `C:\Users\henri\Downloads\RBK 152,4 kon links 3 Z.pdf` | 1 p., text | Title block only — material **42 CrMo 4 V**, scale 1:5, dated 07.10.2024. **No dimensions in the text layer.** The part number says it is the 152,4 conical LH 3-start ring bit; the drawing body yields nothing. | Marginal |
| `C:\Users\henri\Downloads\Atpa\` and `C:\Users\henri\Downloads\Atpa\Atpa products\` | folders listed (≈42 + ≈50 images); 4 opened | See §7. `Bohrkopf_für_VdW508.jpg` is the one genuinely load-bearing photo — a large-diameter casing cutting shoe on its tube. The rest are drag/wing bits and pick tooling: good for **weld, paint and heat-tint** reference, not for casing-system geometry. | Partly |
| `C:\Users\henri\Downloads\HP-Drill-Crowns.pdf` | 7 pp., text extraction | **Useless as read.** Every page returns empty text — an image-only export. Not rendered, because every dimension it could carry is already double-sourced from the drawings above. | **No** |
| `C:\Users\henri\Downloads\DB-152.4-Z03_Tol_纯图版.pdf` | 1 p., text | **Useless.** The text layer is the balloon numbers 1–19 with no values attached. The values live in `HP_Spec_DB-152.4_Lost_Bit.pdf`, which is the same drawing tabulated. Read that instead. | **No** |
| `C:\Users\henri\Downloads\SCANDIASTEEL_BERGSKO_BROSCHYR_20.08.31.pdf` | 3 pp., text | **Wrong product family.** A mechanical *bergsko* (rock shoe) for **driven** steel piles Ø273–406 mm, CE-marked to ETA 15/0029, plus the ETA cover sheet. Nothing about drilled casing. The one transferable fact is the size band quoted for the smaller mechanical shoes: 76,1–219,1 mm. | **No** |
| `C:\Users\henri\Downloads\alternatief voor ringbit-Layout1.pdf` | 1 p., text + render | A Dutch fabricator's layout sheet. Only the title block carries text; the drawing has **no dimensions in its text layer**. Named "alternative to ring bit" but yields nothing quotable. | **No** |
| `101.6套管双母扣 STR102002.pdf` · `133墩头打击套管 STR133001-Model.pdf` · `152套管公母扣2025.3.12-Model.pdf` · `180打击套管 STR180001-Model.pdf` | **not read** | Budget ran out after the geometry above was already double-sourced. Their titles read 101,6 double-box, 133 **upset-head** percussive casing, 152 pin/box, 180 percussive casing. The **upset end** (墩头) is the one thing they would add that nothing else here covers — see §8. | Unread |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\tools.js` ll. 2766–3447 | `buildCasingPipe`, `buildCasingCrown`, `buildRingBitSystem`, `buildEccentricSystem`, `buildConcentricSystem`, `buildWingBitSystem`, `buildCasingShoe` | The current game model. Compared in §9. | Yes (as the subject) |
| `C:\Users\henri\Downloads\drillity-the-game\src\game\data.js` ll. 100–136, 678–692, 1506–1522, 1697–1772 | categories, the `overburden` method, `ITEMS_CASING` | The shop-side data. Compared in §9. | Yes (as the subject) |

---

## 2. What these tools ARE

A hole in soil, gravel or a boulder bed does not stand up. **Overburden drilling
advances the borehole and the casing together**, so that whatever the bit has
just cut is immediately lined with steel pipe. The work splits between an
**outer part that cuts the outside diameter and drags the casing down behind
it**, and an **inner part that drills the core of the face and carries the
flushing** (`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 3). Everything in
this family is a variation on how those two jobs are divided, and on what is
recovered versus what is left in the ground.

The string, top to bottom, is always the same eleven things (ibid. p. 3):
flushing head / swivel → shank adapter → casing tube → (inside it) inner drill
rod → casing crown or ring bit → inner bit → casing shoe or ring shoe → and, on
the single-head systems, the lost bit. Subs and crossovers join whatever does
not match; clamping jaws hold it at the table.

### 2.1 Concentric — pilot bit through a ring bit, both on one centreline

Two parts on one axis. The **casing crown (ring bit)** is an annulus that
carries the casing thread on its back end and the carbide on its front face; it
cuts the outside diameter. The **inner bit (full-face or pilot head)** runs
concentrically *inside* the crown on its own string, drills the core, and
carries the flushing — air or water down the central bore, out through inclined
ports onto the face, and back up the annulus with the cuttings (ibid. p. 11).

**Drilling position:** both faces flush, on one plane. This is not a detail; the
catalogue makes it the first thing to check on site, because if either part runs
ahead of the other, that part takes the full blow of the hammer on its own
(`HP_Overburden_Drilling_Heads_Aarsleff.pdf` p. 2). Model them coplanar to
within a millimetre.

**Retracting position:** the crown stays down the hole with the casing — it is
consumable and it is not coming back. The inner bit is **pulled back up through
the casing bore**, which is exactly why the geometry works: on the 152,4 system
the crown bore is **Ø128,0 mm**, the casing bore is **Ø128 mm**, and the
full-face head is **Ø125,0 mm**. Three millimetres of diametral clearance, the
whole length of the hole. Nothing folds, nothing swings, nothing is a mechanism.

The duplex advantage a driller cares about: **the casing can be stopped at any
depth while the inner string drills on** (`BL_Overburden…pdf` p. 11). So the
model has to support a state where the ring bit is standing still in the ground
and the pilot has run out ahead of it.

The single-head variant of this — one drifter, one string, no inner rod — uses a
**full-face casing crown** instead: Ø125 of carbide on a Ø101,6 connection,
160 mm long (`Full drill bit 101,6.pdf`). One part does both jobs, and the
over-cut is correspondingly huge (23,4 mm on diameter).

### 2.2 Eccentric — a reamer that swings off the centreline and comes back in

Three pieces: **guide device, reamer, pilot bit** (`OVERBURDEN.pdf` p. 2). Under
forward rotation the reamer swings **off the centreline** — that is what
eccentric means — and cuts a hole wider than the casing OD, so the casing
follows freely. Nothing is left in the ground.

**Drilling position:** reamer swung fully out, its cutting tip on the expanded
radius, the pilot leading, the guide device centralising the string inside the
casing above. The casing rides down behind it.

**Retracting position:** reverse rotation swings the reamer back in behind the
pilot's own gauge, and **the whole assembly is withdrawn up through the casing
bore**. That one sentence is the entire design constraint, and it is measurable:
on every Desco TDEX size, **Retracted < casing I.D. < casing O.D. < Expanded**,
without exception (ibid. p. 2). See §3.3 — this is the number the repo's known
trap is about.

The **wing-bit** family (TRB, Super Wing, NT) is the same idea with a different
kinematic: two, three or four wings fold flat against the body rather than
swinging off-axis, and they obey the same four-term inequality. Wing count goes
**2 wings** up to about Ø194 mm casing, **3 wings** from Ø219 mm, **4 wings**
from Ø508 mm (ibid. pp. 1, 3, 4).

Boart Longyear sell the eccentric as a **casing shoe design (design ECC) with a
bladed eccentric bit**, i.e. the eccentric is a *bit design in a family of bit
designs*, not a separate machine — the same shoe body, the same left-hand
rotary-percussive thread, a different front end (`BL_Overburden…pdf` p. 78).

### 2.3 Ring bit and lost bit — the sacrificial half of the family

A **lost bit** (German *verlorene Spitze*) is a cast bit that sits at the front
of the casing, cuts the bore, and **stays in the ground when the casing is
withdrawn** (`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 12). It is the
wear part that sets the cost per drilled metre on grouted anchors, micropiles,
buoyancy restraints, underpinning and sheet-pile anchoring. There is no
retracting position — that is the point of it.

It is not steel. The standard grade is **EN-GJS-600-3 ductile cast iron**
(EN 1563, formerly GGG-60; Rm ≥ 600 MPa, Rp0,2 ≥ 370 MPa, A ≥ 3 %,
≈190–270 HB), chosen because it takes percussive loading without failing brittle
like grey iron and stays far cheaper than a fabricated steel construction
(ibid. pp. 12, 18). A 42CrMo steel body is produced only where the customer
requires one — the 135 mm size in the table is the exception that proves it.

**The lost bit is a casting, so it carries features a machined part never has:**
a **mould parting plane**, called out by name and leader on the drawing
(`DB-152.4-Z02.pdf`); **draft on every axial face** — 1,27° to 2° on the skirts,
1,64°/2,10° on the 135 body, 1,75° internally; **cast-in bores** rather than
drilled ones; and generous radii everywhere the wings meet the body.

The **ring shoe** is welded into the leading end of the casing and gives the lost
bit its seat. It is produced as a matched pair with the bit so that the shank
clearance, the weld gap and the seating height are right first time
(`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 13). `RS 152.pdf` shows the
whole mechanism: a Ø154 x 115 mm ring with a **Ø130 x 50 mm counterbore** that
the bit's skirt drops into, and **four notches at 90° cut through the top face**
that take the bit's four drive lugs. The bit is then **tacked in place with two
Ø8 welding rods** through cast Ø11 bosses before drilling starts, and **two Ø16
valve balls** dropped into cast Ø25 seats give the check-valve function in the
central bore during grouting. Both balls and both rods ship with every bit at no
extra charge, and the matching bores are cast into every bit (ibid. p. 12).

That last sentence is a modelling instruction disguised as a commercial note:
**every lost bit has two ball seats and two rod bores cast into it, whether or
not the balls are fitted.** They are always visible.

### 2.4 Casing shoes and casing

A **casing shoe** is the plain welded or threaded end piece that carries the
crown or the lost bit and takes the driving. HP produces them across the same
range as the crowns (Ø101,6 · 108 · 114,3 · 133 · 152,4 · 177,8 · 203 · 219 ·
355 mm and WW 63), weld-on or threaded, with a carbide-protected leading edge
where the ground requires it (ibid. p. 13). Boart Longyear's drive shoes engage
the drive bit with a **flat collar, a twist lock (bayonet), or a rectangular**
interface (`BL_Overburden…pdf` p. 33) — three different lug geometries, all of
which read at thumbnail size.

The **casing** itself is not a water-well pipe. It is a rotary-percussive drive
tube in **42CrMo4 / 42CrMo4+QT**, with **integral-thread casing in 42CrMo4V**
(`HP_Overburden_Product_Catalogue_EN_2026.pdf` pp. 6, 18) and a wall of
**12–13 mm on every size from 88,9 to 152,4** (§3.1). Connectors are
**pre-welded, friction-welded, or cut directly onto the pipe**; friction welding
gives a full-section joint with no filler and no heat-affected notch at the bore,
MSG welding is used where geometry or batch size makes it the better route
(ibid. pp. 6, 8). Percussive casing runs **left-hand**, so the string tightens
against the direction of rotation; DTH and rotary strings run right-hand
(ibid. p. 4).

---

## 3. Proportions

### 3.1 The casing ladder — OD, bore, wall

The number a driller checks first. Two independent sources, in agreement.

| Casing OD, mm | Bore Ø, mm | Wall, mm | Source |
|---|---|---|---|
| 88,9 | 64 | 12,45 | `BL_Overburden…pdf` p. 51 |
| 88,9 | 68,9 | 10,0 | `HP_Casing_Drawings_EN.pdf` p. 19 (cylindrical RH 1-start) |
| 101,6 | 75 | 13,3 | BL p. 51; HP dwg p. 1 |
| 101,6 | 82 | 9,8 | HP dwg (cylindrical LH 2-start front piece) |
| 108 | 88 | 10,0 | HP dwg |
| **114,3** | **88** (+0,5) | **13,15** | BL p. 51; HP dwg p. 6 |
| 133 | 108 | 12,5 | BL p. 51; HP dwg p. 7 |
| **152,4** | **128** | **12,2** | BL p. 51; HP dwg |
| 177,8 | 148 | 14,9 | HP dwg |
| 177,8 | — | 10,0 | HP catalogue p. 6 (friction-welded connectors) |
| 355 | — | 12,5 | HP catalogue p. 6 (42CrMo4+QT, phosphated) |

**Lengths.** Usable lengths held as released drawings: **500 · 1 000 · 1 500 ·
2 000 · 3 000 mm** (HP catalogue pp. 5–6; BL p. 51 adds **3 050**), and up to
**4 500 · 5 000 · 7 500 · 10 000 mm** on the large diameters. "Usable length"
excludes the connectors.

**Connector geometry.** The threaded connector is a discrete band 155–210 mm long
at each end (HP catalogue pp. 7–8): 160–180 mm on Ø63,5–133, 200 mm on
Ø114,3–152,4, 210 mm on Ø177,8. Masses 2,0–9,1 kg. Thread length inside that
band is **100–130 mm** (`HP_Casing_Drawings_EN.pdf`): 107,5 mm on the 101,6
conical, 130 mm on the 114,3 cylindrical 3-start, 110,5 mm on the 133 conical,
100 mm on the 152,4 and the 177,8.

**Thread form.** Multi-start **rope thread with a rounded root**, cut cylindrical
or conical, in both hands (HP catalogue p. 4). The rounded root is the point: it
spreads the stress a sharp V-form concentrates, and it tolerates the grit that
reaches every field joint. For the HP 3-start conical standard, **lead
33,867 mm, pitch 11,289 mm, R5 root** (`HP_Casing_Drawings_EN.pdf` p. 7); **R4
root** on the 114,3 cylindrical 3-start (ibid. p. 20). Single-, two- and
three-start families are all produced; the TK thread is 1-start over 10 turns,
pitch 11,5 mm; API Regular 2 3/8" – 4 1/2" is cut to the open standard.

**Keyways** are cut only on the 152,4, 177,8 and 203 mm cylindrical families
(HP catalogue pp. 5–6). **Spanner / wrench flats** are sized per casing:
SF80 / SF90 / SF105 / SF120 / SF140 on 88,9 / 101,6 / 114,3 / 133 / 152,4
(`BL_Overburden…pdf` p. 51).

### 3.2 Concentric and ring-bit over-cut — what the crown actually cuts

| Casing OD, mm | Crown / casing-shoe outer Ø, mm | Over-cut, mm dia. | Source |
|---|---|---|---|
| 88,9 | 95 **or** 100 | 6,1 / 11,1 | `BL_Overburden…pdf` p. 72 |
| 101,6 | 107 **or** 115 | 5,4 / 13,4 | ibid. |
| 114,3 | 120 **or** 125 | 5,7 / 10,7 | ibid. |
| 133 | 140 **or** 150 | 7,0 / 17,0 | ibid. |
| 152,4 | 160 **or** 170 | 7,6 / 17,6 | ibid. |
| 177,8 | 185 **or** 190 | 7,2 / 12,2 | ibid. |
| **152,4** | **163,0 body, 165,5 swept over the OD inserts** | **10,6 / 13,1** | `HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 11; `HP_Overburden_Drilling_Heads_Aarsleff.pdf` pp. 3, 5; `overburden drilling heads 3D.pdf`; `Ring drill bit 152.4.pdf` |
| 101,6 (full-face, no inner string) | 125,0 | 23,4 | `Full drill bit 101,6.pdf`; `Vollbohrkrone ZT0759801.pdf` |

**The 152,4 / 88,9 reference system, in full** (HP catalogue p. 11; Aarsleff
pp. 3, 5; confirmed against the production CAD, §1):

| Dimension | Value |
|---|---|
| Casing OD / bore | Ø152,4 / Ø128 mm |
| Casing crown outside diameter | **Ø163,0 mm** (small-carbide body measures Ø160,577) |
| Crown inside diameter | **Ø128,0 mm** — equal to the casing bore |
| Crown body length | **170,0 mm** (measured 170,001) |
| Full-face head diameter | **Ø125,0 mm** |
| Full-face head body length | **135,0 mm** (measured 135,002) |
| Central bore, full-face head | **Ø50,0 mm** |
| Flushing ports, full-face head | **3 x Ø16,0 mm**, inclined **2 x 25° and 1 x 15°** |
| Crown flushing | open Ø128 centre |
| Swept diameter over the OD gauge inserts | **Ø165,5 mm** |
| Crown connection | 152,4 conical, **left-hand, 3-start** |
| Full-face head connection | 88,9 cylindrical, **left-hand, single start** |

The long-connector version of the same crown is **240,0 mm overall with a
170,0 mm head** (`152,4 cc al.pdf`; Inventor measures the outer bit at
Ø160,584 x 240,004 mm, **6,233 kg** in 42CrMo — the only sourced mass for a ring
bit body anywhere in the set).

### 3.3 Eccentric and wing bit — expanded, retracted, and the rule between them

**Read the inequality before the numbers.**

> **Retracted Ø < casing I.D. < casing O.D. < Expanded Ø.**
> It holds on all 46 rows of `OVERBURDEN.pdf`, across four different system
> families, without a single exception.

**TDEX — eccentric (guide device + reamer + pilot bit)**, `OVERBURDEN.pdf` p. 2:

| Model | Casing OD | Wall | Casing I.D. | Expanded | Retracted |
|---|---|---|---|---|---|
| TDEX 90 | 115 | 6,4 | 102,3 | **123** | **90** |
| TDEX 115 | 141,3 | 6,6 | 128,1 | 151 | 116 |
| TDEX 140 | 168 | 6,3 | 155,4 | 185 | 141 |
| TDEX 165 | 193,7 | 6,4 | 181 | 211 | 166 |
| TDEX 180 | 219 | 12,5 | 194 | 232 | 180 |
| TDEX 190 | 219 | 7 | 205 | 236 | 191 |
| TDEX 215 | 257 | 8 | 241 | 278 | 215 |
| TDEX 230 | 273 | 12,5 | 248 | 286 | 230 |
| TDEX 240 | 273 | 6,4 | 260,2 | 308 | 241 |
| TDEX 280 | 323,9 | 9,6 | 304,8 | 366 | 283 |
| TDEX 315 | 355 | 10 | 335 | 397 | 315 |
| TDEX 365 | 406,4 | 9,5 | 387,4 | 450 | 365 |

Note that **the model number is the retracted diameter**, not the casing size —
that is how the industry names an eccentric.

**TRB — wing bit**, ibid. p. 1 (2 wings to TRB165, 3 wings from TRB190):

| Model | Casing OD | Wall | Casing I.D. | Expanded | Retracted | Wings |
|---|---|---|---|---|---|---|
| TRB115 | 141,3 | 7,4 | 126,6 | 152 | 114 | 2 |
| TRB140 | 162 | 6,1 | 149,8 | 185 | 140 | 2 |
| TRB165 | 194 | 8 | 178 | 213 | 162 | 2 |
| TRB190 | 219 | 7,6 | 203,8 | 240 | 187 | 3 |
| TRB240 | 273 | 9,2 | 254,6 | 295 | 240 | 3 |
| TRB365 | 406,4 | 9,5 | 387,4 | 425 | 356 | 3 |
| TRB745 | 812,8 | 16 | 780,8 | 835 | 752 | 3 |

The **NT** series (ibid. p. 3) runs **4 wings** from NT 460 (Ø508 casing) to
NT 930 (Ø1016 casing); **Super Wing** (ibid. p. 4) repeats the TRB ladder with
slightly different expanded figures.

**Eccentric casing shoes, independent second source** — `BL_Overburden…pdf`
p. 78, "Casing shoes, bladed design, eccentric, design ECC", produced left- and
right-hand rotary percussive:

| Casing Ø | Shoe outer Ø |
|---|---|
| 88,9 mm | 110 mm |
| 114,3 mm | **130** or **140** mm |
| 133 mm | **150**, **155** or **165** mm |

So a **114,3 mm casing on an eccentric system is drilled at 130–140 mm, and the
tool has to come back up an 88 mm bore.**

### 3.4 Lost bits — the whole released range

`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 12, cross-checked against the
individual release drawings. All dimensions mm.

| Size | For casing | Across wings | Height | Central bore | Material | Mass, kg |
|---|---|---|---|---|---|---|
| 114,3 | 114,3 (115–118) | 127,0 | 154,6 | 74,5 | EN-GJS-600-3 | 5,00 |
| 133,0 | 133,0 | 140,0 | 158,0 | 76,0 | EN-GJS-600-3 | 6,90 |
| 135 | 119–122 | 135,0 | 168,0 | 68,0 | **42CrMo** | 4,10 |
| 152,4 | 152,4 | **230 x 163** | 170,0 | 123,5 | EN-GJS-600-3 | 8,86 |
| 178 | 177–180 | **190,0 x 186,0** | **177,4** (see note) | 125,5 | EN-GJS-600-3 | 9,50 |
| 193 | 194–197 | 205 x 205 | 158,0 | 138,0 | EN-GJS-600-3 | 11,80 |
| 200 | 193,7 x 10 (ID 173,7) | 212,3 | 198,2 | 140,2 | EN-GJS-600-3 | — |
| 203 | 203 | on request | on request | on request | EN-GJS-600-3 | 13,5 |

> **A discrepancy, stated rather than smoothed over.** The catalogue prints
> **115,8** in the Height column of the 178 row. The release drawing
> (`lost bit 178 x 190.pdf`) dimensions **177,37** overall and carries **115,77**
> as one of three intermediate step heights (60 / 90 / 115,77); the Inventor
> model measures the bounding box at **177,373 mm**. **Model 177,4 mm.** The
> catalogue row transcribes the wrong dimension. Every other row's Height column
> *is* the overall height (114,3: catalogue 154,6 vs drawing 154,55 — agreement).

**The wings are not circular in plan.** The 152,4 bit is **230 mm across one pair
of wings and 163 mm across the other**; the 178 bit is **190 x 186**; the 193 is
**205 x 205**. Only the small sizes are symmetric. Model a **cruciform, not a
disc**.

**DB-152.4, dimensioned with tolerances** (`HP_Spec_DB-152.4_Lost_Bit.pdf`):

| # | Dimension | Tolerance | What it is |
|---|---|---|---|
| 1 | 230 mm | ± 2 | width over wings (span) |
| 2 | 25° | ± 1° | wing / roof angle |
| 3 | 90 mm | ± 1,6 | body height to the shoulder |
| 4 | 80 mm | ± 1,6 | cylindrical shank height |
| 5 | 55 mm | ± 1,4 | bore-section height |
| 6 | 2° | ± 0,5° | draft on the shank |
| 7 | Ø123,5 mm | 0 / −2 | inner bore |
| 8 | Ø127,2 mm | 0 / −2 | counterbore / step |
| 9 | 170 mm | ± 2 | overall height |
| 10 | 9,5° | ± 0,5° | roof-face angle |
| 11 | 1,75° | ± 0,5° | internal draft |
| 12 | Ø129 mm | 0 / −2 | inner Ø at the opening |
| 13 | 4° | ± 0,5° | wing angle |
| 14 | Ø8 mm | ± 0,2 | bore for the Ø8 welding rod (cast boss Ø11) |
| 15 | Ø152,4 mm | ± 1,8 | body outside diameter |
| 16 | 163 mm | ± 2 | length over wings, transverse |
| 17 | Ø16 mm | ± 0,2 | bore for the Ø16 valve ball (cast boss Ø25) |
| 18–19 | 90° | ± 0,5° | wing spacing — **4 wings at 90°** |

**Ring shoe RS 152**, the matching seat (`RS 152.pdf`): OD **Ø154,00**, bore
**Ø126,00**, overall height **115,00**, upper spigot **26,00** tall, internal
counterbore **Ø130,00 x 50,00 deep**, lip wall **2,00**, relief **2,00**,
shoulder at **75,00**, and **four notches at 90° through the top face**.

Compare the catalogue's ring shoe for a Ø193,7 x 10 casing (ID 173,7): OD Ø170,
bore Ø140,8, height 128,5, running the 200 x 212 lost bit
(`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 13). **Two different
attachment schemes exist across the range** — a shoe that stands a whisker proud
of the casing OD and is butt-welded to the tube end (RS 152: Ø154 against a
Ø152,4 casing), and a shoe that is inserted *inside* the casing bore (Ø170 into
a Ø173,7 bore, leaving 3,7 mm of weld gap on diameter). Do not assume one.

### 3.5 Carbide — the layout, measured

Both builds of the 152,4 / 88,9 system, from
`HP_Overburden_Drilling_Heads_Aarsleff.pdf` pp. 4–5, independently confirmed by
the Inventor BOM and bounding boxes.

| | Large carbide (as supplied) | Small carbide (alternative) |
|---|---|---|
| Crown ring face | **8 x Ø16 alternating with 8 x Ø8** | **12 x Ø10 x 15** |
| Crown gauge row | tilted out to the corner | **8 x Ø10 x 15, tilted 35°** |
| Crown OD gauge inserts | flat-top inserts, stepped, various heights | **6 x Ø8 x 6 flat-top, three heights** |
| Crown button pitch circles | — | **Ø138 / Ø148** |
| Crown total | 16 face buttons + OD inserts | **20 buttons + 6 inserts** (BOM-confirmed) |
| Full-face head | Ø16 gauge row, Ø16 / Ø14 face | **17 x Ø10 face + 7 x Ø10 gauge, tilted 15° = 24** (BOM-confirmed) |
| Bodies and threads | unchanged | unchanged |

**The button itself** (ibid. p. 5 — the most useful five lines in the folder):

| Property | Value |
|---|---|
| Button diameter | **Ø10,0 mm** |
| Button length | **15,0 mm** |
| Crown form | **spherical, R 5,0** — the dome radius equals the button radius, so the tip is a true hemisphere |
| Seating depth | **10,0 mm** into the steel |
| **Exposure** | **5,0 mm** — the full dome, nothing more |
| OD gauge insert | **Ø8 x 6 mm flat-top pin, 1 mm edge radius**, set at three different heights so the OD is protected progressively as the crown wears |

Measured confirmation: crown body 170,001 mm long, assembly with buttons
175,000 mm — **exactly 5,000 mm of exposure**. Full-face head body 135,002 mm,
assembly 140,000 mm — again exactly 5,000 mm. This is the single most useful
number in the document for a modeller: **a button on these tools is a 10 mm
hemisphere sitting flush in a 10 mm pocket, and it never sticks out further
than its own radius.**

Construction: carbide is set **in computer-controlled induction ovens**
(`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 18). Boart Longyear describe
the same process and its reason — induction rather than flame brazing to avoid
overheating, with strict machining control of the carbide seats so inserts are
not lost prematurely; **shrink-fit** is offered instead of brazing for the
hardest ground (`BL_Overburden…pdf` pp. 25, 30). **Visually this means a button
sits in a machined pocket with a thin bright braze fillet at the rim — not a
weld blob, not a socket you can see daylight round.**

Insert *shapes* in the wider family (`BL_Overburden…pdf` p. 34): hemispherical
(hard rock), ballistic (medium-hard and loose), two-step, bladed insert,
scraping insert, three-face scraping insert, scalping insert (concrete). The HP
heads use spherical and "semi-ballistic" (`Ring drill bit 152.4.pdf`).

### 3.6 Ratios a modeller can use

Absolutes change with size; these do not.

- **Casing wall ≈ 12–13 mm across the whole small-diameter range** — it is nearly
  constant, not proportional. So **bore/OD climbs with size**: 0,72 at Ø88,9 ·
  0,74 at Ø101,6 · 0,77 at Ø114,3 · 0,81 at Ø133 · 0,84 at Ø152,4. Never model a
  percussive casing thin-walled; at Ø88,9 the steel is more than a quarter of
  the diameter, and in section it reads as a gun barrel, not a tube.
- **Concentric crown OD ≈ 1,05–1,12 x casing OD**; swept over the gauge inserts
  ≈ **1,086 x casing OD** on the HP reference system. Over-cut is **6–18 mm on
  diameter**, i.e. **3–9 mm of annulus on radius** — a visible lip, never a
  fraction of a millimetre.
- **Crown bore = casing bore, exactly** (Ø128 = Ø128). The crown does not neck
  the string down.
- **Pilot / full-face head ≈ 0,977 x the crown bore** (125 / 128). About 3 mm of
  diametral clearance, whatever the size.
- **Crown body length ≈ 1,1 x casing OD** (170 / 152,4); **full-face head length
  ≈ 0,79 x crown length** (135 / 170). The crown is the longer part.
- **The crown's thread is most of its length**: 100 mm of thread in a 170 mm body
  (`Ring drill bit 152.4.pdf`), so **≈ 60 % of the crown is threaded shank** and
  only the top 60–70 mm is the carbide head. In the section on
  `overburden drilling heads 3D.pdf` that split reads as 70 mm of head over
  the thread run-out.
- **Carbide exposure is 5 mm and does not scale** — Ø10 x 15 buttons, 10 mm
  buried, on a Ø163 crown and a Ø125 head alike. At any tool size a button reads
  as a small dome, not a spike.
- **Eccentric / wing bit:** **Expanded ≈ 1,06–1,13 x casing OD**;
  **Expanded ≈ 1,27–1,37 x Retracted**; **Retracted ≈ 0,88–0,93 x casing I.D.**
  Those three ratios reproduce every row of `OVERBURDEN.pdf`.
- **Wing count by size:** 2 wings to ≈ Ø194 mm casing, 3 wings from ≈ Ø219 mm,
  4 wings from ≈ Ø508 mm.
- **Lost bit across wings ≈ 1,05–1,11 x casing OD** for the symmetric sizes
  (133 → 140; 179 → 190; 193,7 → 205). The 152,4 → 230 row is the outlier and is
  a deliberately asymmetric cruciform, not a scaling error.
- **Lost bit height ≈ 1,0–1,35 x casing OD** (152,4 → 170; 114,3 → 154,6;
  133 → 158). It is a stubby object, roughly as tall as it is wide.
- **Lost bit mass ≈ 5 kg at Ø114,3 rising to ≈ 13,5 kg at Ø203** — a one-hand lift
  at the small end, a two-hand lift at the top. Not a heavy object.
- **Ring shoe height ≈ 0,75 x casing OD** (115 / 152,4), bore ≈ casing bore
  − 2 mm, OD ≈ casing OD + 1,6 mm.
- **Threaded connector band ≈ 1,2–1,3 x casing OD in length** (180–200 mm on a
  Ø133–Ø152,4 casing), of which **55–65 % is thread**.

---

## 4. Component inventory

Every part, and why it matters to the eye.

### 4.1 Casing crown / ring bit — the outer cutting annulus

- **Body.** Forged or cast (HP catalogue p. 10). One piece: the thread is cut
  into the same body that carries the carbide. **It is not a ring welded to a
  tube.** Ø163 x 170 mm on the 152,4 system; the long-connector version is
  240 mm. *Visually:* a heavy short barrel, thicker in the wall than anything
  else in the string, with a machined step where the head meets the thread.
- **Thread shank.** 100 mm of 3-start left-hand conical rope thread with a
  rounded root, R5. On the section drawing the thread runs the full lower two
  thirds of the part and terminates in a **visible run-out and a relief step**,
  not a knife edge. *Visually:* three helical starts means the eye reads a coarse
  triple lead — much wider-pitched and more open than a bolt thread.
- **Face.** An annulus Ø128 → Ø163, i.e. **17,5 mm of radial land**, carrying
  12 face buttons on two pitch circles (Ø138 / Ø148) and 8 gauge buttons tilted
  35° out to the corner. *Visually:* two concentric rings of domes with a tilted
  outer ring at the shoulder.
- **Junk slots / flushing grooves.** Radial slots milled through the OD between
  the gauge stations — visible on the face view of
  `overburden drilling heads 3D.pdf` as white rectangular gaps interrupting the
  outer rim. They are what lets the return flow out of the face and up the
  annulus. *Visually:* they break the silhouette of the OD into segments and are
  the single most identifying feature of a ring bit at small size.
- **OD gauge inserts.** 6 x Ø8 x 6 mm flat-top pins let into the outside diameter
  itself, at **three different heights** so the diameter is protected
  progressively as the body wears. Swept Ø165,5 against a Ø163 body → they stand
  ≈ 1,25 mm proud on radius. *Visually:* small bright flat discs sitting in the
  outer skin, not domes.
- **Internal drive detail.** The crown bore is a plain Ø128 through-hole on the
  HP concentric head — the drive between crown and pilot on ring-bit systems is
  by **axial lugs** (BL's flat collar / bayonet / rectangular shoe engagements,
  `BL_Overburden…pdf` p. 33). Which of the three a given system uses is
  `NOT SOURCED` for the HP parts.

### 4.2 Inner bit — full-face head or pilot bit

- **Body.** Ø125 x 135 mm, connection 88,9 cylindrical LH single start. Solid,
  short, blunt. *Visually:* a mushroom with a very short stem.
- **Central bore Ø50.** Runs the full length. This is the flushing plenum, and it
  is big — 40 % of the head diameter. *Visually:* on a sectioned or exploded
  render it is the dominant internal feature.
- **Three flushing ports, Ø16, inclined 2 x 25° and 1 x 15°.** They are **not on
  the axis** — they open on the face at roughly ⅔ radius, spaced about 120°
  apart, and they are drilled at an angle so the flow is thrown outward toward
  the gauge. On the drawing they read as elongated ellipses on the face, with a
  visible internal shadow. *Visually:* three dark angled mouths are the thing
  that separates a full-face head from a plain button bit.
- **Face carbide.** 17 x Ø10 face buttons, plus a 7-button gauge row tilted 15°.
  The gauge row stands only 0,1–0,45 mm proud of the Ø125 body — **the head does
  not ream, it only protects its own corner.**
- **Peripheral junk slots.** Wedge-shaped grooves cut into the head's gauge
  between the gauge buttons, letting the flow pass from the face into the 3 mm
  annulus between head (Ø125) and crown bore (Ø128).

### 4.3 Eccentric system — three pieces

- **Guide device.** Sits above the pilot and centralises the string inside the
  casing. It is the reason an eccentric drills straight at all. *Visually:* a
  slotted or ribbed sleeve close to the casing bore.
- **Reamer.** The off-axis cutting arm on a hinge. Must sweep past the casing OD
  when open and tuck behind the pilot's gauge when closed. Carbide on the outer
  flank sets the expanded diameter.
- **Pilot bit.** Leads the reamer, drills the core, and is what the reamer hides
  behind when retracted. Its own gauge is the retracted envelope.
- **The hinge.** A pin through a shouldered seat. It is the failure point of the
  whole family — if it seizes open, nothing comes back up the casing — so it
  should read as a heavy, greasy, deliberately over-built joint.

### 4.4 Wing bit — the folding relative

Two, three or four plate wings on hinges in **milled pockets** in the body, so
the folded wing sits flush. Same four-term diameter rule as the eccentric. The
wings fold *flat against the body*, not off-axis; that is the whole visual
difference from an eccentric. Wing count is set by size, §3.3.

### 4.5 Lost bit — the casting

- **Roof / gable face.** Two (or four) sloping faces at **25°** meeting at a
  ridge, with a **9,5° roof-face angle** and **4° wing angle**. On the 114,3
  drawing the gable carries a **raised central rib 15 mm wide** and a slot beside
  it. *Visually:* a little pitched roof — this is why the German name is
  *Verlorene Spitze*, "lost point".
- **Four wings at 90°**, projecting past the body OD to the across-wings
  dimension. Not equal in the two axes on the bigger sizes.
- **Body band** at the casing OD (Ø152,4 on the DB-152.4; Ø114,30 −2 on the
  114,3) — a cylindrical land that sits flush with the casing so the tube is not
  proud in the hole.
- **Stepped spigot / skirt** below that: on the 114,3, Ø87,52 −2 → Ø85,59 −2 →
  Ø80,82 with 1,82° draft, entering a Ø88 casing bore. On the DB-152.4 the
  skirt's stepped bore is Ø129 → Ø127,2 → Ø123,5, dropping into the ring shoe's
  Ø130 counterbore.
- **Four drive lugs** on the skirt rim at 90°, taking the shoe's four notches.
- **Two cast bosses on the face:** Ø11 for a Ø8 welding rod and Ø25 for a Ø16
  valve ball. Two of each per bit. These are cast, so they have draft and radii.
- **Central bore** Ø74,5 (114,3) to Ø140,2 (200) — the grout passage.
- **Mould parting plane**, called out on the drawing. Model the flash line.

### 4.6 Ring shoe / casing shoe

- Ring: OD Ø154, bore Ø126, height 115 on the 152 system.
- **Ø130 x 50 counterbore** for the bit skirt.
- **Four 90° notches** through the top face — the drive.
- **2 mm lip wall and a 2 mm relief** at the top — these are the weld preps.
- 26 mm spigot above a 75 mm shoulder.
- Weld-on or threaded to the casing construction; carbide-protected leading edge
  where the ground requires it.

### 4.7 The rest of the string, in one line each

From `HP_Overburden_Product_Catalogue_EN_2026.pdf` pp. 3, 9, 14–17:

- **Flushing head / swivel** — introduces air, water, foam or grout into a
  rotating string and takes the return out through the **ejection bell**. Sizes
  Ø63,5–355 mm. **Lip seals, not O-rings.** Single-head and double-head (duplex)
  versions. Body shaft diameters run 100 / 120 / 140 / 170 mm
  (`BL_Overburden…pdf` p. 58).
- **Shank adapter** — the part that satisfies two machines at once: rig spline at
  one end, string thread at the other. Reference part: **12-tooth spline,
  746 mm overall, 23 kg, 17NiCrMo6-4 case-hardened to 56 +2 HRC**, rope thread,
  pitch 12,7 mm, **internal flushing with a radial port into the bore**.
  *Visually:* splined drive end, journals, a **relief groove**, then a rope
  thread pin. A long, slim, obviously hardened part.
- **Inner drill rod / drill pipe** — friction-welded with bonded thread
  connectors; centre tube **Ø95 x 7,1 mm** on the GT 95 pipe; Ø88,9 and Ø76,1
  API rods. Lengths 500 / 1 500 / 2 000 mm.
- **Subs, adapters and crossovers** — Ø88,9 to Ø205 bodies, 170–350 mm long,
  7–29 kg, some with **20 mm side ports** for ejection.
- **Clamping jaws** — hot-die-forged 16MnCr5, case-hardened. Reference body
  **73 x 51 x 15,5 mm, 6,0 mm tooth pitch, pyramid serration, 0,39 kg.**
  *Visually:* the tooth field is coarse and pyramidal, and it marks the casing.

---

## 5. Distinctive features (thumbnail silhouette)

The three families and the sacrificial parts, in order of how quickly you can
tell them apart.

1. **Concentric = two circles, one inside the other, with a 3 mm gap and both
   faces flush.** Head-on it is unmistakable: a carbide annulus with a second,
   smaller carbide disc floating inside it, and a thin dark ring between them.
   Nothing else in the game's tool line-up has a bit inside a bit. The junk slots
   chopping the outer rim into segments finish the read.
2. **Eccentric = asymmetric.** At any angle the tool is visibly *not* rotationally
   symmetric: one arm reaching out past the body on one side only. Silhouette in
   the drilling position looks like a tool with a broken-off lump on one flank.
   Retracted, it collapses to a plain slim cylinder narrower than the casing
   bore. **The two states must look like different objects** — that is the whole
   point of the mechanism, and a modeller who makes them similar has failed.
3. **Wing bit = symmetric petals.** Two, three or four identical plates standing
   out from the body at equal angles, folding into milled pockets. Open it is a
   fan; closed it is a plain rod with visible slots. Never asymmetric — that is
   the eccentric.
4. **Lost bit = a little pitched roof on a cup.** A gable at 25° with a ridge, a
   cruciform of four wings, and a cylindrical skirt. Cast surface, no thread, no
   buttons on the standard grade. It is the only part in the family with the
   texture and radii of a casting rather than the crisp edges of a machined part.
5. **Casing crown vs plain casing shoe.** The crown is short and fat with a
   studded face and slotted OD; the shoe is a plain machined ring, sometimes with
   a hardfaced or carbide-protected leading edge and nothing on the face. At
   thumbnail size the studded face is the only difference — so if the crown's
   buttons do not read, the part reads as a shoe.

**Negative space matters as much:**
- **No spiral flights anywhere in this family.** Nothing here augers.
- **No cone cutters.** These are percussive tools; tricones belong to rotary.
- **The casing is thick-walled.** In any cutaway, a percussive casing should read
  as roughly one-eighth of its diameter in wall thickness. A thin tube reads as
  water-well casing and is wrong.
- **Left-hand threads.** If a thread is ever visible turning in a render, it goes
  the other way from every other thread in the game.

---

## 6. Materials, paint, and where wear and dirt accumulate

### 6.1 The grades, verbatim from the works list

`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 18 — the whole standard palette
for this family:

| Grade | Mat. no. | Condition | Used for |
|---|---|---|---|
| 42CrMo4 | 1.7225 | Quenched and tempered | Casings, drill pipes, couplings, subs |
| 42CrMo4+QT | 1.7225 | Q+T, **phosphated on request** | Large-diameter casings, heavy connectors |
| 42CrMo4V | 1.7225 | Q+T, **thread cut on the pipe** | Integral-thread casings |
| 34CrNiMo6 | 1.6582 | Quenched and tempered | Highly loaded subs and crossovers |
| 25CrMo4 | 1.7218 | Quenched and tempered | Rods and light connectors |
| **20MnV6** | – | Normalised | **Welded casing bodies** |
| 17NiCrMo6-4 | 1.6587 | Case-hardened, 56 +2 HRC | Shank adapters, drive splines |
| 16MnCr5 | 1.7131 | Forged, normalised, case-hardened | Clamping jaws, hook pins |
| **EN-GJS-600-3** | EN 1563 | **As cast**, Rm ≥ 600 MPa | **Lost bits, sacrificial parts** |
| EN-GJS-400-15 | EN 1563 | As cast, ductile | Housings, low-stress castings |
| S355J2 / C45 | 1.0577 / 1.0503 | Normalised | **Fabrications, plates, guides** |
| Tungsten carbide | – | Grade to application | Buttons, gauge inserts, teeth |

Two consequences for the model. **Nothing in this family is painted as delivered.**
Casing surface is *"as machined, phosphated on request"* (ibid. p. 6); lost bits
ship in *"anti-rust oil, individual bag"* (ibid. p. 12); every part is oiled and
bagged for the journey (ibid. p. 18). There is no factory colour. And **S355J2 is
the plate grade, not the casing grade** — see §9.

### 6.2 New versus used — the single biggest difference in this family

**New, as it leaves Bochum:**

- **Casing:** bright turned bands at both connectors where the thread and the
  shoulders are cut, and a **darker, slightly rougher mid-body** where the tube
  is as-drawn or as-rolled. Where phosphating is specified the whole tube goes a
  matt mid-grey-black with a slight sheen — flat, absorbent, distinctly not
  shiny.
- **Crown / ring bit:** uniform machined steel, low-gloss, with a **fine turned
  spiral on the cylindrical surfaces** and clean sharp edges on the junk slots.
  Carbide is **bright white-grey and mirror-smooth**, and it stands 5 mm proud —
  so on a new tool the buttons catch light as 20 tiny highlights against a matt
  body. A **thin bright braze ring** at the rim of each pocket.
- **Lost bit:** cast surface — **matt, slightly granular, with a visible parting
  line and light flash**, uniformly mid-grey. Coated in **anti-rust oil**, so it
  has a faint even sheen and picks up fingerprints. No machined surfaces at all
  except (sometimes) the seat bore.
- **Shank adapter:** case-hardened to 56 HRC, so it comes out of the process with
  a distinct **hard, pale, faintly straw-tinted skin** — visibly different steel
  from the tube it screws into.

**Used, after one hole:**

- **The polished band where the casing rubs.** A cased hole is a steel tube
  turning inside a soil bore against its own drill string. The casing develops a
  **bright, burnished, almost mirror band on the high spots — the connector ODs
  and any wrench flats — while the mid-body stays dull.** This is the most
  characteristic wear pattern on a casing string and it is banded, not uniform.
- **Blueing from heat at the shoulders and at the shank.** The percussion energy
  goes in at the shank and out at the crown face. Around the shank adapter's
  drive spline and the make-up shoulders you get **straw → brown → blue-purple
  temper colours**, exactly as seen around the weld beads in
  `Atpa\WhatsApp Image 2026-06-23 at 13.53.05 (7).jpeg`.
- **Carbide: chipped versus mirror-worn — two different stories.** In abrasive
  ground a button wears **smooth and flat-topped, polished to a mirror, with the
  original dome truncated**; the exposed height drops from 5 mm toward 2–3 mm and
  the surrounding steel wears back with it so the button ends up sitting in a
  little raised pedestal. In blocky ground buttons instead **chip and spall** —
  irregular white fractures with sharp edges, and occasionally a **missing button
  leaving an empty pocket with a dark braze ring**. A believable used crown has
  some of both, and the *gauge* row wears first and hardest.
- **The gauge insert story is designed in.** The Ø8 OD pins are set at **three
  different heights** precisely so that as the crown OD wears back a fresh pin
  comes into play. On a half-worn crown, one height is gone, one is level with
  the steel, one still stands proud. That is a lovely, cheap, entirely sourced
  detail.
- **Mud packed into the flushing grooves.** The junk slots on the crown OD and
  the wedge grooves on the pilot head are where the return flow carries cuttings,
  so they are where **wet cuttings pack, dry, and cake**. Fill them two-thirds
  with grey-brown packed fines, wetter and darker deep in the slot, dry and
  paler at the mouth. The three Ø16 face ports get a **collar of caked material
  around the mouth**, not inside — the flow keeps the bore itself clean.
- **The casing thread is the dirtiest part of the string.** It is made up and
  broken out every 1–3 m of hole, in the mud, with a **thread dope** on it. It
  should read as greasy, dark, grit-loaded, with dope squeezed out at the
  shoulder — and slightly bruised at the crests where the jaws have gripped.
- **Jaw marks.** The clamping jaws are hardened with a **6,0 mm pyramid
  serration**. They leave a **crosshatched band of small pyramidal dents** on the
  casing OD wherever the clamp has held it. HP even offer softer inserts *"where
  a coated or thin-wall casing must not be marked"* — which tells you the
  standard jaws do mark it. This is a free, highly specific, entirely sourced
  used-look detail.
- **Rust.** These parts ship oiled, not painted. Once the oil is off, a used
  casing string in a yard goes **orange-brown all over the machined surfaces
  within days**, darkest in the thread roots and around the shoulders where water
  sits. A lost bit in a crate stays oiled and dull grey; a lost bit on the ground
  goes orange fast because ductile iron has no protection at all.

### 6.3 Colour, and where it legitimately appears

The parts in this family are **not painted by the manufacturer**. Where colour
does appear on real overburden and casing tooling it is on **fabricated,
welded-up tools** — drive shoes, drag heads, cutting shoes — and it is applied
after welding, over as-laid beads:

- `Atpa\Bohrkopf_für_VdW508.jpg` — a large-diameter **casing cutting shoe** on
  its tube. The shoe ring and its welded-on tooth holders are coated a **strong
  golden-yellow**; the paint flows over the weld beads without hiding them, and
  it stops dead at the **bright machined internal shoulder** and at the
  **black mill-scale bore** of the tube. Three finishes on one object, with hard
  boundaries between them.
- `Atpa\Atpa products\WhatsApp Image 2026-06-24 at 12.21.27 (3).jpeg` — a
  three-wing drag head painted **strong blue**, with the **hex drive shank left
  completely unpainted and bright**. Again the paint stops at the machined
  surface. The conical picks are unpainted polished steel with dark carbide tips.

So: **if a mesh in this family is painted, the paint must stop at every machined
face and every carbide.** That single rule does more for believability than any
texture.

### 6.4 Weld character

Where the family is welded — casing shoe to tube, ring shoe into the casing,
tooth holders onto a cutting shoe — the welds are:

- **Large, hand-laid MAG beads with a visible stacked-dime ripple**, not ground
  flush, and not uniform. In the VdW 508 photo the fillets around each tooth
  holder are heavy, uneven, and clearly laid by hand in several passes.
- **Ringed by heat tint** — straw, brown, then blue-purple, fading over 20–40 mm
  either side of the bead, visible even under paint on the WhatsApp drag head.
- The exception is **friction welding**, used on casing and rod connectors: it
  gives *"a full-section joint with no filler and no heat-affected notch at the
  bore"* (`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 8). A friction weld is
  a **thin circumferential line with a small upset flash ring**, often machined
  off — completely unlike a MAG bead. Two different weld languages on the same
  string, and using the wrong one on the wrong joint is a domain error.

---

## 7. Photo references

| Image | What it is | Useful for |
|---|---|---|
| `C:\Users\henri\Downloads\Atpa\Bohrkopf_für_VdW508.jpg` | **The best photo in the folder for this family.** A large-diameter **casing cutting shoe** on its tube, stacked with two more on a pallet in a workshop. A heavy ring welded to a black mill-scale casing; cast/forged tooth holders welded round the leading edge, each carrying a **conical pick with a rounded, brightly polished carbide tip**; a bright machined internal shoulder inside the bore; small bolted lugs. | **Weld character** (heavy hand-laid multi-pass fillets, as-laid, not ground); **paint behaviour** (golden-yellow coating flowing over the beads and stopping at machined faces and the mill-scale bore); **how a tooth holder is attached** to a shoe; the three-finish rule in §6.3; scale (three shoes fill a pallet). |
| `C:\Users\henri\Downloads\Atpa\WhatsApp Image 2026-06-23 at 13.53.05 (7).jpeg` | A small pick-tooth drag head on a hex shank, unpainted, as-welded. | **Heat tint** — straw/brown/blue haloes round every bead; **as-laid bead texture** at close range; **bright machined hex shank with a cross pin hole**, unpainted, against a welded and tinted head. The best local reference for what percussive-tool steel looks like near a weld. |
| `C:\Users\henri\Downloads\Atpa\Atpa products\WhatsApp Image 2026-06-24 at 12.21.27 (3).jpeg` | A three-wing drag bit painted blue, with unpainted hex shank. | **Paint-stops-at-machined-surface** rule; how picks sit in welded holders; the visual difference between a *drag* tool and the percussive tools in this document (negative reference). |
| `C:\Users\henri\Downloads\Atpa\BohrköpfeØ129_238API (12).jpg` | Three small rotary drill heads with heavy weld build-up and hardfacing, on a cardboard sheet. Dated 2009. | **Hardfacing texture** only. Wrong family otherwise — these are rotary heads, not casing systems. |
| `C:\Users\henri\Downloads\Atpa\` and `Atpa\Atpa products\` — the remaining ≈85 images | Swept by filename; the set is drag/wing bits, pick tooling, product and sticker shots, and marketing slides. | **No photograph of an overburden casing crown, ring bit, pilot head, eccentric reamer, lost bit or ring shoe exists in this folder.** Everything in §2–§5 is from drawings and CAD, not from a photograph. |

**`NOT SOURCED` — the honest gap in this section.** There is no local photograph
of a real ring bit face, a used crown with worn carbide, a lost bit in its crate,
a ring shoe welded into a casing, or an eccentric in either position. §6's
wear description is reasoned from the geometry, the materials and the two
transferable photos above — it is not observed. **Three photographs would close
this section completely:** (1) a new and a worn 152,4 crown side by side, face
on; (2) a lost bit sitting in its ring shoe with the welding rods tacked in;
(3) an eccentric reamer photographed open and closed from the same angle. The
owner can produce all three from stock.

---

## 8. NOT SOURCED

Honest list. None of these should be invented.

- **The eccentric reamer's own geometry.** `OVERBURDEN.pdf` gives expanded and
  retracted *diameters* for twelve TDEX sizes but **no drawing** — so the arm
  length, plate thickness, hinge-pin diameter, hinge offset from the centreline,
  the shape of the cutting flank, and the carbide layout on the reamer are all
  unsourced. The diameters constrain the mechanism; they do not describe it.
- **How the reamer is driven open and closed.** Reverse rotation swings it in —
  but whether that is a cam, a torsion element, a simple friction-and-stop
  arrangement, or a guided slot is not stated anywhere in the folder.
- **Wing-bit hinge and pocket geometry**, for the same reason.
- **The drive between a ring bit and its pilot on the HP concentric system.** BL
  name three drive-shoe engagements (flat collar, twist lock/bayonet,
  rectangular) but the HP 152,4/88,9 head's drive is not described and the
  drawing does not section it. Do not invent lug counts.
- **The casing shoe as a dimensioned part.** HP list the sizes and the two
  attachment options; `RS 152.pdf` dimensions a *ring shoe*. There is **no
  dimensioned drawing of a plain casing shoe** in the folder — its length, wall,
  weld prep and carbide layout are unsourced.
- **Weld sizes.** No fillet leg length, throat, or number of passes is specified
  anywhere for the shoe-to-casing joint. §6.4's description is from a photograph,
  not from a WPS.
- **The upset casing end.** `133墩头打击套管 STR133001-Model.pdf` and
  `180打击套管 STR180001-Model.pdf` are unread and are the only likely source for
  how much the wall is thickened at an upset end and over what length. Flagged as
  the highest-value unread file in the set.
- **Casing lengths above 3 050 mm in the small diameters**, and whether the
  9–10 m casings are one piece or coupled.
- **Carbide grade designations.** HP say "grade to application"; BL say "grade to
  application". No K-number, no cobalt percentage, no supplier grade.
- **Thread profile geometry beyond lead, pitch and root radius.** HP state
  explicitly that profile data is released against an order. Flank angle, thread
  depth and taper rate are unsourced — model a rounded-root triple helix and do
  not claim a profile.
- **Colour.** There is no factory paint colour for any part in this family
  because there is no factory paint. Any colour on a Drillity mesh is an
  invention and should be declared as one.
- **The drive-lug count and geometry on lost bits other than the DB-152.4.** Four
  lugs at 90° is sourced for that one part and for RS 152. The smaller sizes may
  differ.
- **The "Ø115–118" note** on `lost bit 114 od 127.pdf`. It sits beside a Ø116,00
  seat dimension and is not explained on the sheet; the catalogue repeats it as
  "114,3 (115–118)" in the For-casing column. Most probably a seat-bore range,
  but that is inference and is marked as such.
- **How a lost bit is released from the casing.** The catalogue says it stays in
  the ground; the mechanism by which the casing lets go of it is not described.

---

## 9. Domain-truth warnings (what the game currently gets wrong)

Read against `C:\Users\henri\Downloads\drillity-the-game\src\rig\tools.js`
ll. 2766–3447 and `C:\Users\henri\Downloads\drillity-the-game\src\game\data.js`
ll. 678–692, 1697–1772.

### A. The eccentric geometry — the repo's own recorded trap, checked

`buildEccentricSystem` documents the historical failure in its own header,
ll. 3013–3017:

> *"this builder used to quote a 121 mm ream off a `tipR` constant that no vertex
> ever touched, while the arm it actually built swept 179 mm on a 114.3 mm casing
> (57 % over-gauge), and closed to 169 mm — nearly twice the bore it is supposed
> to retract through."*

**Verdict: the diagnosis in that comment is correct, and the fix — measuring
`sweptRadius()` off the built mesh at both ends of the travel — is the right
fix.** The sourced relationship, stated so it can be checked in future:

> **Retracted Ø < casing I.D. < casing O.D. < Expanded Ø** — all 46 rows of
> `C:\Users\henri\Downloads\OVERBURDEN.pdf`, four system families, no exception.
> With ratios: **Expanded ≈ 1,06–1,13 x casing OD**, **Retracted ≈ 0,88–0,93 x
> casing I.D.**, **Expanded ≈ 1,27–1,37 x Retracted**.

Applied to the historical numbers: a **114,3 mm** percussive casing has a bore of
**88 mm** (`BL_Overburden…pdf` p. 51; `HP_Casing_Drawings_EN.pdf` p. 6, "bore
Ø88 +0,5"). A retracted diameter of **169,4 mm is not merely bigger than the bore
— it is bigger than the casing OD itself.** The tool could not enter the casing,
let alone come back up it. And 179,1 mm swept is **1,57 x** the casing OD against
a sourced ceiling of **1,13 x**. Both numbers were wrong by a wide margin.

**The correct figures for a Ø114,3 casing:** swept **130–140 mm**
(`BL_Overburden…pdf` p. 78, eccentric casing shoes, design ECC), retracted
**below 88 mm** and by the ratio **≈ 78–82 mm**. The nearest published complete
row is TDEX 90 on a Ø115 x 6,4 casing: **I.D. 102,3 · Expanded 123 · Retracted
90** (`OVERBURDEN.pdf` p. 2).

**Still to fix in the current code:** `buildEccentricSystem` sets
`reamR = ro * 1.06` (l. 3032). That is the **bottom edge** of the sourced band
and **below every entry in the BL eccentric shoe table** (Ø114,3 → 130 mm =
1,14 x; Ø133 → 150/155/165 = 1,13–1,24 x). Move it to **1,10–1,14** and the model
lands inside both sources instead of on the boundary of one.

### B. The casing wall is roughly half the real thickness — and it propagates

| Builder | Current default | Sourced |
|---|---|---|
| `buildCasingPipe` l. 2774 | `wallMm = 8.0` on `odMm = 139.7` | 12–13 mm across Ø88,9–Ø152,4 |
| `buildCasingCrown` l. 2816 | `wallMm = 8.0` | as above |
| `buildConcentricSystem` l. 3180 | `wallMm = 8.0` | as above |
| `buildWingBitSystem` l. 3323 | `wallMm = 8.0` | as above |
| `buildEccentricSystem` l. 3023 | `wallMm = 7.0` on `odMm = 114.3` | **13,15 mm** (bore Ø88) |

Sourced ladder, two independent sources agreeing: **88,9 → bore 64 (wall 12,45) ·
101,6 → 75 (13,3) · 114,3 → 88 (13,15) · 133 → 108 (12,5) · 152,4 → 128 (12,2)**
(`BL_Overburden…pdf` p. 51; `HP_Casing_Drawings_EN.pdf` pp. 1, 6, 7, 19 and the
152,4/177,8 sheets).

This matters twice over. Visually, a percussive casing is a **thick-walled drive
tube** — at Ø88,9 the wall is more than a quarter of the diameter — and an 8 mm
wall reads as water-well casing. Mechanically, `ri = ro - mm(wallMm)` is the bore
that **every retrievable tool in this family has to fit through**, so an
over-large bore silently relaxes the one constraint the eccentric and wing
builders exist to enforce. On the Ø114,3 eccentric the code currently allows a
**100,3 mm** bore where the real casing gives **88 mm** — 14 % of slack handed to
the retracted diameter for free.

**Fix:** derive the wall from the size rather than defaulting it —
`wall ≈ 12.5 mm` for Ø88,9–Ø152,4 is within 0,7 mm of every sourced row.

### C. The concentric crown bore should equal the casing bore, not be smaller

`buildConcentricSystem` l. 3190: `ringId = pR * 1.035` where `pR = ri * 0.92`,
i.e. **ring bore ≈ 0,952 x casing bore**. `buildCasingCrown` l. 2825:
`crownId = ri * 0.955`. `buildRingBitSystem` l. 2916 is furthest off:
`ringId = ro * 0.70`, a fixed fraction of the **outside** diameter.

Sourced: on the HP 152,4 system the **crown inside diameter is Ø128,0 mm and the
casing bore is Ø128 mm — they are the same number**
(`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 11 and `BL_Overburden…pdf`
p. 51; confirmed on `overburden drilling heads 3D.pdf` and
`Ring drill bit 152.4.pdf`). The crown does not neck the string down; the bore is
continuous from the casing through the crown to the face, and that continuity is
what lets the pilot come home.

`ringId = ro * 0.70` is also the wrong *kind* of relationship: because the wall
is near-constant, bore/OD is **not** a constant — it runs 0,72 at Ø88,9 up to
0,84 at Ø152,4. Derive it from the wall.

### D. Button count is out by a factor of three on the crown, and by two and a half on the pilot

`buildCasingCrown` builds `nSeg = 8` segments x (3 face + 2 OD gauge + 1 ID)
= **48 buttons** (ll. 2843–2890). `buildRingBitSystem` puts
`rn = round(odMm / 16)` buttons on each of two rings — **18 on a Ø139,7 system**.
`buildConcentricSystem` and `buildEccentricSystem` put **9** and **7** on their
pilots respectively.

Sourced, for the Ø152,4 system, from two independent measurements of the same
part (`HP_Overburden_Drilling_Heads_Aarsleff.pdf` pp. 4–5, and the Inventor BOM
of `1524,4 CC sm carb comp.iam` / `88,9 ff sm carb comp.iam`):

| Part | Sourced carbide | Game |
|---|---|---|
| 152,4 crown, small carbide | **12 face + 8 gauge = 20 buttons Ø10, plus 6 Ø8 OD inserts** | 48 |
| 152,4 crown, large carbide | **8 x Ø16 + 8 x Ø8 = 16 face buttons**, plus stepped OD inserts | 48 |
| 88,9 full-face head | **17 face + 7 gauge = 24 buttons Ø10** | 9 (concentric) / 7 (eccentric pilot) |

So the outer ring has **two to three times too much carbide** and the inner bit
**a third of what it should have**. The correct balance is the opposite of the
current one: **the pilot carries more buttons than the crown**, because it has to
break the whole core of the face while the crown only cuts an annulus.

Two further sourced details the builders do not have:

- **Two pitch circles on the crown face, Ø138 and Ø148**, on a body of Ø163 with a
  Ø128 bore — so the face buttons sit in the middle of the 17,5 mm land, not
  spread across it, and the gauge row is separate and **tilted 35°** out to the
  corner. The pilot's gauge row is tilted **15°**.
- **The OD gauge inserts are not buttons.** They are **Ø8 x 6 mm flat-top pins
  with a 1 mm edge radius, at three different heights**. The game builds them as
  spherical buttons at 0,92 x the face diameter (l. 2870), which is the wrong
  shape, the wrong size and the wrong count.

### E. Carbide exposure — one number that fixes the whole family

Sourced and measured twice: **Ø10 x 15 mm button, seated 10 mm, exposed 5,0 mm,
crown radius R5,0 so the tip is a true hemisphere**
(`HP_Overburden_Drilling_Heads_Aarsleff.pdf` p. 5). Confirmed by bounding box:
crown body 170,001 mm → assembly 175,000 mm; head body 135,002 mm → assembly
140,000 mm. **Exposure is exactly the button radius, and it does not scale with
tool size.**

`studFace()` and `ringLayout()` place buttons by diameter and normal but the
exposure is not pinned to r; setting it to exactly `dia/2` across this family is
a one-line change that makes every overburden tool read correctly.

### F. The crown is one forged/cast body, not a ring welded to a tube

`buildCasingCrown` builds a `shoeL = 320 mm` pipe, then a **46 mm** crown ring on
the end of it, then lays weld beads at both the OD and the ID of the joint
(ll. 2834–2892).

Sourced: the casing crown is **one body, forged or cast**
(`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 10), **170 mm long overall with
the 152,4 conical LH 3-start thread cut into the same body** — 100 mm of thread
and ≈70 mm of head (`Ring drill bit 152.4.pdf`; `overburden drilling heads
3D.pdf`; Inventor: 170,001 mm). The long-connector version is 240 mm
(`152,4 cc al.pdf`; Inventor: 240,004 mm). **There is no weld on a casing crown.**

Welding does belong on the **ring shoe** and on **weld-on casing shoes**
(catalogue p. 13), and on friction-welded casing connectors — but those are
different parts, and a friction weld is a thin upset line, not a hand-laid bead
(§6.4). The current build puts a MAG-bead language on a monolithic part.

While there: the crown ring is **46 mm** tall against a sourced head of ≈70 mm on
a 170 mm body, and the game's shoe is 320 mm where the whole real part is 170 mm.

### G. The pilot head has three inclined ports, not one axial hole

`buildRingBitSystem` l. 2963, `buildConcentricSystem` l. 3262: a single
`flushHole(... x: 0, y: …, z: 0, r: mm(8), dir: [0,-1,0])` — one Ø16 hole, on the
axis, pointing straight down.

Sourced: **central bore Ø50,0 mm feeding three Ø16,0 mm ports, inclined 2 x 25°
and 1 x 15°**, opening on the face off-axis at roughly two-thirds radius
(`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 11;
`HP_Overburden_Drilling_Heads_Aarsleff.pdf` p. 5; visible as three angled
ellipses on the face view of `overburden drilling heads 3D.pdf`). The Ø50 bore is
40 % of the head diameter and dominates any cutaway.

The **crown's** flushing is different again and is also missing: *"open Ø128
centre"* plus the **radial junk slots milled through the OD** between the gauge
stations (catalogue p. 10 lists "flushing: open centre, or ported"). Those slots
are the crown's most identifying silhouette feature (§5) and nothing in the
current builder makes them — `slotFrac` cuts gaps *between crown segments*, which
is a different thing from a slot through the OD land.

### H. Thread hand and the casing joint description contradict the repo's own data

`buildCasingPipe` l. 2801 reports `joint: 'Cone-ring, RH'`. `data.js` l. 691
already says `threadFamily: 'casing cone-ring LH / R-T percussion / DHD-QL
shank'`, and every shop item in `ITEMS_CASING` says LH.

Sourced: *"Percussive casing normally runs left-hand so that the string tightens
against the direction of rotation; DTH and rotary strings run right-hand"*
(`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 4). Every casing shoe table in
`BL_Overburden…pdf` pp. 72–78 is headed "Left-Hand, Rotary Percussive". **The
builder is the odd one out — fix the builder, not the data.**

For completeness, the sourced thread: **3-start rope thread, rounded root,
lead 33,867 mm, pitch 11,289 mm, R5 root** on the HP conical standard, thread
length 100–130 mm in a 180–200 mm connector
(`HP_Casing_Drawings_EN.pdf` pp. 1, 6, 7).

### I. Casing material is the plate grade, and the shoe carries a trademark

`data.js` l. 1763: `casing-pipe-168` has `material: 'S355J2'`.
`data.js` l. 1768: `casing-shoe-168` has `material: 'Hardox'`.

Sourced grade table (`HP_Overburden_Product_Catalogue_EN_2026.pdf` p. 18):
casings are **42CrMo4 / 42CrMo4+QT**, integral-thread casings **42CrMo4V**,
welded casing bodies **20MnV6**. **S355J2 is listed only for "fabrications,
plates, guides"** — it is the plate grade, not the casing grade. The game already
uses `42CrMo4(V)` correctly on the crowns and systems; the casing pipe is the
outlier.

**`Hardox` is a registered trademark of a steel maker**, not a grade
designation. Under DOMAIN.md §10 a real manufacturer's name must not appear as a
product attribute in `data.js`. Replace it with a sourced grade — the shoes come
off the same bodies as the crowns, so **42CrMo4** (or **EN-GJS-600-3** if the
part is a sacrificial casting) is both correct and brand-free. Note also
`crown-323-hd` l. 1717 quotes `thread: 'casing trapezoidal joint LH'`; no
trapezoidal family appears in either the HP thread table (p. 4) or the BL thread
list — the sourced families are rope (1/2/3-start, cylindrical / parallel /
conical), TK, BW/H, and API Regular. Left-hand is right; trapezoidal is
unsourced.

### J. The wing bit may be reaming under gauge

`buildWingBitSystem`: `bR = ri * 0.80`, `pinR = bR * 0.68`, `armL = mm(35)`
(ll. 3336–3339). On the default Ø139,7 casing with the current 8 mm wall,
`ro = 69,85`, `ri = 61,85`, `bR = 49,48`, `pinR = 33,65` → the open tip sits at
**≈ 68,7 mm radius = 137,3 mm diameter, under the 139,7 mm casing OD**, before
`studFace` adds buttons. The builder's own docstring requires the opposite:
*"open, the reamer must cut wider than the casing OD or the casing could not
follow."* `sweptRadius()` measures the truth, so the shipped figure may scrape
over the line on button projection alone — but the authored arm geometry is
sized against a casing that is itself too thin-walled (§B), and it should not
depend on the buttons to clear gauge.

Sourced target: **Expanded ≈ 1,08–1,14 x casing OD** — for Ø139,7 that is
**151–159 mm**, not 137. Nearest published rows: TRB115 on Ø141,3 casing →
expanded **152**, retracted **114** (`OVERBURDEN.pdf` p. 1); Super Wing SW140 on
Ø162 → expanded **185** (ibid. p. 4).

**What the wing builder gets right and should keep:** `wings` defaults to **2**
and clamps 2–4. Sourced wing counts are **2 up to ≈ Ø194 mm casing, 3 from
Ø219 mm, 4 from Ø508 mm** (ibid. pp. 1, 3, 4) — so 2 on a Ø139,7 casing is
correct, and the 2–4 clamp is exactly the real range. Consider driving the
default off `casingOdMm` so the big sizes get 3 and 4.

### K. The overburden lost bit is missing from the game entirely

`CAT.lostBits` in `data.js` ll. 1507–1521 contains three **self-drilling-anchor**
sacrificial bits (a 51 mm cross bit, a 150 mm clay bit, a 90 mm carbide button
bit). Those are a different product: small, threaded onto a hollow anchor bar.

**The overburden lost bit is a separate, larger, cheaper, higher-volume part and
it is the owner's own biggest line in this family.** It has no builder in
`tools.js` and no entry in `data.js`. It is:

- **Cast ductile iron EN-GJS-600-3**, not steel — the only cast part in the whole
  tool library, with a **mould parting plane, draft on every face, and cast-in
  bores**.
- **Ø114,3 to Ø203**, 5,0 to 13,5 kg, **four wings at 90°**, gable face at 25°.
- Fitted into a **ring shoe** with **four 90° drive notches**, tacked with **two
  Ø8 welding rods**, carrying **two Ø16 valve balls** in cast Ø25 seats.
- **Consumable in the strongest sense in the game** — it is left in the ground on
  every hole, so it is a per-hole cost, not a per-metre wear item.

The **ring shoe** is likewise absent as a distinct part. Both are fully
dimensioned in §3.4/§4.5/§4.6 above; there is enough here to build them without
inventing anything.

### L. Sizing names: an eccentric is named by its retracted diameter

`data.js` ll. 1720, 1725: `ecc-90` "Eccentric Overburden System, 90 mm" and
`ecc-140-hd` "…140 mm HD". Every other item in `ITEMS_CASING` is named by its
**casing** diameter.

The industry convention for this one family is different: **the model number is
the retracted diameter** — TDEX 90 retracts to 90 mm and runs a Ø115 casing;
TDEX 165 retracts to 166 mm and runs a Ø193,7 casing (`OVERBURDEN.pdf` p. 2). So
`ecc-90` happens to be a plausible name for a Ø115-casing system, and `ecc-140`
for a Ø168-casing system. Whichever convention the game picks, it should pick one
and say so in the item description, because a driller reads those two numbers
differently.

### M. Things the code already gets right — do not regress them

- **Measuring quoted diameters off the built mesh** (`sweptRadius()`) rather than
  from an authored constant, in the crown, ring-bit, concentric, eccentric and
  wing builders. This is the correct discipline and it is what caught both
  historical errors.
- **`pilotDiaMm` ≈ 0,966–0,985 x the ring bore** in the concentric and ring-bit
  builders — the sourced figure is **0,977** (125 / 128). Close enough to leave
  alone.
- **`ringOd = ro * 1.075`** in `buildConcentricSystem` — sourced band is
  1,05–1,12 x casing OD, and the HP reference system is 1,070 on the body and
  1,086 swept. This one is right in the middle. Keep it.
- **`ringBit: 'On the casing shoe — left in the ground with the casing'` /
  `pilotBit: 'Retrieved up through the casing'`** — exactly the real division of
  labour.
- **The eccentric's `retrievable: true, sacrificial: false`** against the ring
  bit's opposite. That distinction is the whole taxonomy of this family and the
  code states it correctly.
- **`wings` clamped 2–4**, default 2 (§J).
- **Left-hand threads throughout `data.js`.**
- **Naming.** Every product name in `ITEMS_CASING` is generic or fictional
  (`Drillity Ringcut`, `Drillity Concentra`, `Drillity Excentra`,
  `Drillity Wingcut`). Correct per DOMAIN.md §10 — keep every real designation in
  this document (`TDEX`, `TRB`, `RBK`, `DB-152.4`, `RS 152`, `Symmetrix`, and all
  the article numbers) out of mesh names, decals and shop copy. **The one
  exception to fix is `material: 'Hardox'` in §I.** The shapes and the ratios in
  this document are free to copy; the badges are not.

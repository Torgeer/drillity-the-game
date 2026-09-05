# Air supply, hoses, couplings and the flushing path

Companion to [`tools-drifters.md`](tools-drifters.md). Everything below was
fetched and read directly; secondary sources are marked `SECONDARY`, and
`NOT FOUND` means nobody published it, which is a finding rather than a gap to
fill in from memory later.

---

## 0. A CORRECTION, and it changes what to model

**On a 3–5 t hydraulic top-hammer tracked rig the compressor is almost always
ON BOARD, not towed.** A brief written for this project said the opposite —
that towing a screw compressor is how small contractors get into top hammer.
That is true of **pneumatic** rigs and wrong for hydraulic ones.

- Sandvik Commando DC120, **2 710 kg**, carries an "Enduro 3" screw compressor.
- Epiroc FlexiROC T20 R, **5 750 kg**, carries a Gardner Denver E6 Plus,
  12 bar, 50 l/s (operator's instructions PM 9852 2467 01i, pp. 13, 17, 19).

The clean counter-example proves the split: **Epiroc's pneumatic AirROC T25
lists "Engine 0 HP, Air capacity (FAD) 0 cfm"** — no prime mover at all, every
cubic metre of air arriving from a separate compressor.

**So: hydraulic drifter rig → compressor on board. Pneumatic air-track → towed
compressor and a long hose.** Model whichever the machine actually is.

---

## 1. Air hose — bore, OD, length

### Purpose-made rock-drill hose

Trelleborg **NORMINES II**, described verbatim as *"Extra heavy duty air hose
for pneumatic machine tools such as rock drills"*. 2020 catalogue, pp. 105–106.

| ID mm | wall mm | **OD mm** | WP bar | burst bar | bend radius mm | kg/m | coil |
|---|---|---|---|---|---|---|---|
| 13.4 | 4.55 | **22.5** | 20 | 80 | 60 | 0.40 | 20/40/80 m |
| 16.4 | 5.6 | **27.6** | 20 | 80 | 70 | 0.61 | 20/40/80 m |
| **19.4** | 5.6 | **30.6** | 20 | 80 | 80 | 0.69 | 20/40/80 m |
| **25.0** | 6.5 | **38.0** | 20 | 80 | 100 | 1.01 | 20/40/80 m |
| 30.0 | 6.0 | 42.0 | 20 | 60 | 300 | 1.00 | 20/40 m |
| **32.0** | 6.0 | **44.0** | 20 | 60 | 320 | 1.06 | 20/40 m |
| 38.0 | 6.5 | 51.0 | 20 | 60 | 380 | 1.35 | 20/40 m |

Cover is black SBR, **smooth for ID ≤ 25 mm and fabric-wrapped impression for
ID > 25 mm** — a visible texture change worth modelling. Conductive tube and
cover, −40 to +70 °C.

### Alfagomma — 20 bar air hose, OD by construction grade

| bore | 185AA std | 175AA std | 186AA heavy | **155AA/AK heavy** | 140AK steel braid 40 bar |
|---|---|---|---|---|---|
| 13 mm (½″) | 21 | 21 | 23 | 21 | 22 |
| **19 mm (¾″)** | **28** | **28** | **30** | **29** | **28** |
| 22 mm | – | – | – | 32 | – |
| **25 mm (1″)** | **35** | **35** | **37** | **35** | **34** |
| 28 mm | – | – | – | 38 | – |
| **32 mm (1¼″)** | – | – | – | **44** | **42** |
| 38 mm (1½″) | – | – | – | 50 | 48 |

155AA weights: 19 mm 0.55 kg/m · 25 mm 0.69 · 32 mm 0.88.

### Continental ContiTech — US equivalents

| hose | ¾″ OD | 1″ OD | 1¼″ OD | max WP | packaging |
|---|---|---|---|---|---|
| Prospector Air | 30.2 | 37.9 | 42.2 | 300 psi | 50 ft coil |
| Prospector Plus Air | 30.2 | 37.9 | 42.2 | 400 psi | 50 ft coil |
| Steel Air (MSHA, wire braid) | 29.0 | 36.6 | 46.0 | 750 psi | 50 & 100 ft |
| Super Ortac (wire braid) | 29.0 | 36.8 | 44.5 | 1000 psi | 50 ft |
| **crimped jackhammer assembly** | **28.0** | **37.3** | – | 200/300 psi (assembly 150) | **25/50/100 ft, crimped universal couplings** |

> **Correction to a common assumption.** ContiTech **Plicord Super Rock Drill is
> NOT a jackhammer hose.** The catalogue lists it only in **2½″, 3″, 4″**
> (63.5 / 76.2 / 101.6 mm ID) — it is the mine header / main line hose. Do not
> model it as the tool hose.

### Bore vs flow and length

**Sullair Portable Air Power Pocket Guide**, p. 22, graph *"Air Pressure Loss in
Hose — 50 Foot Length"*, plots **¾″, 1″, 1¼″, 1½″, 2″, 2½″ only** — ¾″ is the
smallest bore Sullair plots for portable-compressor duty. Worked example given
verbatim: a **185 cfm compressor, 100 ft of ¾″ hose, 62 cfm tool → ~2 psi loss
per 50 ft → ~4 psi total**. Loss is proportional to length, and the guide warns
real loss can reach 150 % of chart values with hot, wet or contaminated air.

**Atlas Copco pocket guide "Air tools installation" (9833 1266 01)**:

- §5.5 — *"the hose size should be increased by one size for a length of 5–10 m,
  two sizes for a length of 20 m, and three sizes for lengths of 20–40 m."*
- §2.1 — total loss in FRL + coupling + hose **should not exceed 0.6–1.0 bar**;
  work to 7 bar at the network end to get 6.3 bar at the tool.
- §5.13, useful for modelling clamps — pleated clamps for hose **OD 7–27 mm**,
  screw-strip worm drive for **OD 8–65 mm**, two-part cast-iron clamps for
  **OD 22–40 mm**; heavy-duty clamps required above 16 mm bore.

**For the model:** a 70–140 cfm towed unit feeding one rig at 15–30 m uses
**19 mm (¾″) bore, ~28–31 mm OD**. **25 mm (1″) bore, ~35–38 mm OD** is the
correct step-up for a long run per the Atlas Copco rule. 32 mm / 44 mm OD is
real but belongs to bigger DTH and air-track duty.

`SECONDARY` — MacDonald Air Products list a compressor hose at **19 mm bore /
30 mm OD / 15 m / 20 bar**, with *"malleable iron quick release couplings
secured by safety claw type clamps"*. Speedy Hire list **¾″, 8 m, yellow SBR,
"European type claw couplings"**.

---

## 2. Couplings

### Europe — claw coupling, DIN 3489 (*Klauenkupplung*)

| parameter | value |
|---|---|
| standards | **DIN 3489** (DIN 3238 for the related Mody screw coupling) |
| **claw spacing** | **42 mm on every size** — heads interchange |
| hose-tail sizes | LW 10, 13, 15, 16, **19, 25, 32 mm** |
| threads | G¼, G⅜, G½, **G¾, G1, G1¼** |
| pressure | **PN 10** |
| material | malleable cast iron, zinc plated; oil-resistant rubber seal; brass seal option |
| safety | *Sicherheits-Doppelnocken* (safety double lugs); optional *Sicherungsbund* safety collar |

Connected by clamping a half to each hose end, pressing them together axially
and **rotating ~45° clockwise** to lock.

### USA — "Chicago" universal claw coupling

| | 2-lug | 4-lug |
|---|---|---|
| sizes | **1″ and smaller** | **1¼″ to 2″** |
| face width | 1.60 in (40.6 mm) | 2.565 in (65.2 mm) |
| interior lug spacing | 1.625 in (41.3 mm) | 2.675 in (68.0 mm) |
| lug height from face | 0.625 in (15.9 mm) | 0.775 in (19.7 mm) |
| gasket ID | 0.65 in | 0.480 in |

Rated **150 psi, compressed air or water only**. All sizes interchange within
their lug class, but **2-lug does not mate with 4-lug**. Malleable iron, brass
or 316 SS to 1″; **NPT only, no BSP**; one safety clip per coupling. Critically:
**"not compatible with sandblast, Minsup, or European style couplings"** — so a
US Chicago head and a European DIN 3489 head are *different parts*. **Pick one
convention per machine and stay in it.**

Atlas Copco's own claw couplings are *"zinc-plated, drop-forged, hardened
steel"* with an oil-resistant hose ring, and **the head is the same for all hose
sizes and can be freely combined**.

### What NOT to model

- **Cam & groove (camlock): explicitly not for compressed air.** Dixon states
  cam and groove should not be used with any compressed gas including air or
  steam. `SECONDARY — search summary, page not opened.` **Do not put camlocks on
  an air line.**
- **Bauer couplings on a rock-drill air line: NOT FOUND** in any manufacturer
  air-hose or compressor document reviewed. Bauer is a water/slurry fitting.
  **Leave it off.**

### Whipcheck and hose restraint

| source | requirement |
|---|---|
| **OSHA 29 CFR 1926.302(b)(1)** | *"Pneumatic power tools shall be secured to the hose or whip by some positive means to prevent the tool from becoming accidentally disconnected."* |
| **OSHA 29 CFR 1926.302(b)(7)** | *"**All hoses exceeding 1/2-inch inside diameter shall have a safety device at the source of supply or branch line to reduce pressure in case of hose failure.**"* — **every hose in this study is over ½″**, so the device is mandatory in the US |
| **Doosan portable compressor O&M**, p. 27 | *"Secure hose restraining cable at each end… install and secure one end… on the nipple on the inlet side of the service valve. Install the other end… over the main hose connector."* p. 13: *"Disconnected air hoses whip and can cause serious injury or death."* |
| **Atlas Copco pocket guide**, §8 | claw couplings *"are always open and must be used very carefully"*; sequence is close ball valve → run tool to vent → release claw |
| **Epiroc AirROC T25**, main components | *"**Wire mesh secured compressor hose air inlet** (only with CE-prepared units)"* — the rig-end restraint is a **fitted wire mesh**, not a loose cable |

`SECONDARY` — Chicago whip-check sizes: ½″–1¼″ → ⅛″ cable × 20″; 1″–2″ →
3/16″ × 28″; 1½″–3″ → ¼″ × 38″; 4″ → ⅜″ × 44″. 200 psi, 5× safety ratio.

---

## 3. What is actually in the line

### Receiver — internal yes, external no

The portable screw compressor's own vessel does the job. Doosan O&M, *Theory of
Operation*, p. 33: *"The compressed air exits the separator tank through the top
cover piping… travels through the minimum pressure valve, and out through the
service air valve."* The manual calls it the **"receiver-separator system"**.
Epiroc's FlexiROC T20 R likewise lists **"Receiver"** and **"Air tank"** as rig
components beside "Compressor" and "Air system".

**External receiver between a portable compressor and a drill rig: NOT FOUND**
in any manufacturer document reviewed. **Do not model one.**

### The lubricator — the part most models get wrong

On a **hydraulic** drifter rig the compressor air arrives as **one clean
supply** and is split **on the rig**:

| rock drill | flushing | shank lubrication (air + oil mist) |
|---|---|---|
| Sandvik **RD106** (the drifter in the 2.7 t Commando DC120) | *"drills with air or water flushing"*; max **5 bar** hex chuck / **15 bar** flushing device | **250 Nl/min at 3–5 bar, oil 50–200 g/h** |
| Sandvik **HL510** | air/water **10–20 bar** | **250–350 l/min at 4–7 bar, oil 200–300 g/h** |

The rig spec sheet spells the split out plainly: the DC120 lists **"Shank
lubrication: Air/oil mist"** and **"Flushing: Air"** as two separate rows, with a
dedicated on-board **shank lubrication device WL 30**.

Epiroc confirms it from the operator's side — the FlexiROC T20 R has **two
separate gauges, "Flush air lubricating pressure" and "Flush air pressure"**
(p. 30), and the air system *"supplies air for flushing in the bore hole,
cleaning of the dust collector filter and the rock drill lubrication system and
ECL"* (p. 17). The check that proves the oil stays out of the hole (p. 87):
*"Check that the shank adapter is sufficiently lubricated. — **Lubricating
oil/air should leak out at the shank adapter**"*.

> **So there is NO in-line oiler in the hose between compressor and rig.**
> Model the hose run as **bare hose plus couplings only.** The large branch goes
> straight to flushing with no oil added; a small branch (~250 Nl/min, 3–5 bar)
> passes through the **rig-mounted** lubricator and vents at the shank adapter.

Two honest caveats:

1. The flushing air is not *certified* oil-free. Doosan p. 13: *"The discharged
   air contains a very small percentage of compressor lubricating oil."* It is
   oil-flooded-screw air with carry-over — simply not deliberately oiled.
2. Atlas Copco lists **"Lubricator"** as an option **on the compressor itself**
   for the 8-Series. The hardware exists, but it is there for hand-held
   pneumatic tools, not for a hydraulic rig's flushing air.

**Pneumatic contrast.** On an air-track, oil in the drive air is **mandatory**.
Atlas Copco Rock Drill Air-Oil is *"specially developed for… BBC, BBD and RH
pneumatic Rock Drills… with an air line lubricator"*, and the AirROC T25 lists
**"7 bar and 12 bar air line and oil lubrication systems"** with a **12 l
lubrication tank (HECL)** — again mounted **on the rig**, downstream of the
incoming hose, not spliced into it.

### Filter, water separator, aftercooler

| component | where | source |
|---|---|---|
| **air-line water separator** | **on the rig** | Epiroc AirROC T25 main components |
| aftercooler + water separator (+ reheater, + bypass), non-return valve, lubricator, hose reel, 4th outlet valve | **options on the compressor**, XAS 38–88 | Atlas Copco 8-Series technical data |
| aftercooler → moisture separator with Y-strainer and constant-bleed orifice, 3-way selector to bypass | compressor, downstream of separator tank | Doosan O&M pp. 33–34 |
| aftercooler, moisture separator, primary + secondary filters to 0.01 micron → ISO 8573-1 Class 1.7.1 | Sullair "AF" machines | Sullair pocket guide p. 21 |

**The aftercooler is an option, not standard, in this size class.** A basic hired
70–140 cfm unit will not have one — model plain hose off the outlet valve.

### The complete air path, for the modeller

1. Engine-driven **screw airend** → oil-flooded air into the
   **receiver-separator tank** (the pressure vessel inside the canopy; it is
   both oil separator and receiver).
2. → **minimum pressure valve** → optional **aftercooler + moisture separator**
   (bypassable) → **service/outlet ball valves** on the outlet manifold,
   typically front or side panel behind a small hinged door.
3. → **claw coupling** on the compressor nipple, mated to the hose-end claw,
   **plus a whip-check cable or safety pin across the joint**.
4. → **rubber air hose**, 19 or 25 mm bore, 20 bar, in a 20 or 40 m coil, run
   **loose along the ground**, optionally paid off a **hose reel**.
5. → **rig air inlet**: a bulkhead nipple on the frame, same claw coupling, with
   a **wire mesh restraint** on CE units.
6. → on the rig: **water separator**, then the split — **flushing branch**
   (largest flow), **dust-collector pulse-clean branch**, and the small
   **rock-drill lubrication branch** through the on-board oiler (WL 30 / ECL /
   HECL).
7. Flushing branch → hoses along boom and feed beam → **flushing head on the
   rock drill** → through the **shank adapter** → down the **hollow rod**.
   Published rod flushing bores: **6.7 mm** (Hex 22 speed rod), **9.5 mm**
   (Hex 35 drifter rod), **14.5 mm** (Rnd 39 drifter rod) — Epiroc SR drill
   strings, doc 9866 0390 01, p. 4.
8. → out through the **bit flushing holes**. Epiroc tabulates these per bit as
   **centre** and **side** holes — a 33 mm ballistic flat-face button bit with
   **2 centre + 4 side**, another with **2 centre + 0 side**. The product-code
   key even carries design code **"38 = nine buttons, three front flushing
   holes"** and **"24 = reverse flushing"**.
9. Cuttings return **up the annulus** to the collar, where the **dust hood /
   trap-door centraliser** captures them into the **dust collector** through a
   separate large corrugated suction hose.

Flow numbers for the flushing duty: Commando DC120 **1.2 m³/min up to 8 bar**;
TEI TE326 **air 8 bar / 5 m³/min (179 cfm)**, or **water 10 bar / 25 lpm**.
Note the TE326's 179 cfm **exceeds** a 70–140 cfm compressor — a 2–4 m³/min unit
suits a small RD106-class drifter, not a 326.

---

## 4. Compressor outlet valves

| machine | FAD | outlets |
|---|---|---|
| **Sullair 185 (T4F)** | 185 cfm / 5.2 m³/min @ 100 psi | **2 × ¾″** |
| **Atlas Copco XAS 38/48/58/68/78/88 Kd** | 2.0 / 2.5 / 3.0 / 3.5 / 4.5 / 5.0 m³/min (70/90/120/135/160/175 cfm) @ 7 bar | options list a **"4th O/L valve"**, so **3 outlet valves are standard** |
| Kaeser M43 | – | **NOT VERIFIED** — datasheet not retrieved |

The XAS 38–68 range (70–135 cfm, ≤ 750 kg towed, **2 290 × 1 350 × 1 400 mm** on
the undercarriage) is exactly the small-contractor class, and those dimensions
are directly usable for a model.

> **A trap.** Atlas Copco's **Australian** landing page for the XAS 88 claims
> "375 cfm" and "175 psi", contradicting Atlas Copco's own technical data
> (5.0 m³/min = **175 cfm at 7 bar / 100 psi**). **Use the technical data PDF,
> not the landing page.** Marketing pages are not sources.

---

## 5. Observed in photographs, not text-sourced

**Epiroc AirROC T25 studio side view**, brochure 9868 0009 01 p. 5. A large
**spiral/ribbed black hose** runs from the trap-door centraliser at the collar,
up the left side of the feed beam, into the dust collector — that is the **dust
suction hose, not the air supply**, and it is visibly **2–3× the diameter** of
the smooth hoses. Smooth-bore black hoses run in a bundle along the boom to the
rotation head. Feed beam grey, superstructure yellow, tracks dark grey with
200 mm shoes. **No hose reel and no in-line oiler visible on the rig exterior.**

**Same brochure p. 4, "quick interchangeability" close-up.** A **spiral-plastic
abrasion guard wrap** around the hose bundle running along the underside of the
feed beam past a yellow pivot casting, with small steel hydraulic hard-lines and
swivel fittings alongside. **On real rigs the hoses on the feed are wrapped in
spiral guard, not bare** — worth having.

**Sullair 185 family page**, pocket guide p. 4. Three trailer variants side by
side: plain canopy; *"featuring single hose reel"* with one green drum on the
frame at the drawbar end, forward of the canopy; and *"double hose reel"* with
two drums side by side in the same position. **The reel sits on the towbar-end
frame, ahead of the canopy, axis transverse.**

No published photograph was found clearly showing a hose running from a towed
compressor to a hydraulic tracked top-hammer rig — consistent with §0.

---

## 6. NOT FOUND

- Any manufacturer recommendation for an **external air receiver** between a
  portable compressor and a drill rig.
- **Bauer couplings** in any compressed-air or rock-drill application.
- A published **hose-bore recommendation table indexed by compressor model** —
  only generic flow/length charts exist.
- **Standard hose length supplied with** a specific 70–140 cfm compressor. Hose
  is a separate line item everywhere; catalogue coils are 20/40/80/120 m
  (Trelleborg), 25/50/100 ft (ContiTech), 15 m (MacDonald), 8 m (Speedy).
- **Kaeser M43** outlet configuration.
- The **rig-side air inlet thread size** for any specific hydraulic top-hammer
  rig.

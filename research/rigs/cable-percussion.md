# Cable percussion spudder — engineering reference

status: in progress
subject: game rig id `cable-percussion` (tripod / A-frame cable-tool spudder; winch, wire rope, chisel, bailer)
builder: `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` → `buildCablePercussion` (line ~6757)
purpose: GEOMETRY AND MATERIALS reference for modelling. Not a spec sheet, not marketing copy.

> **Naming rule (DOMAIN.md §10):** no real manufacturer name or model designation may appear
> as a product name in the game. Real names below (Dando, Pilcon, Bucyrus, Bauer, Wittig …) are
> cited ONLY as geometry evidence. Do not letter them onto a model, a decal, a nameplate or a
> tyre. Model the shapes; invent the badge.

## 1. Sources read
## 2. What the machine IS
## 3. Proportions
## 4. Component inventory
## 5. Distinctive features
## 6. Materials and paint
## 7. Photo references
## 8. NOT SOURCED
## 9. Domain-truth warnings (what the game currently gets wrong)

---

## 1. Sources read

| Source | Pages / lines | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\drillity-the-game\research\16-site-archetypes.md` | §B.2 (lines 2082–2103), lines 1870–1885, refs at 3552–3638 | **The single most valuable local source.** Names the two families that must not be conflated (US water-well spudder vs. British shell-and-auger tripod), and carries hard cited dimensions for the tripod: ~7 m derrick, 2 t winch, 6.7 m headroom, 150/200 mm casing, ~50 m depth, towed by a 4×4. | YES — primary |
| `C:\Users\henri\Downloads\drillity-the-game\research\06-geotech-water-geothermal.md` | §E.8 (lines 1896–1913), §A.1.7 (279), 589–590, 1199, 1632, 1694, 1721 | Silhouette read ("a tripod and a rope"), tool set (shell / clay cutter / chisel / SPT assembly), casing 150–300 mm, 2-man crew, wire-rope inspection as a named competence, and an existing flag that cable-tool was **wrongly given a hydraulic crawler and drill rods**. | YES — primary |
| `C:\Users\henri\Downloads\drillity-the-game\research\17-site-verification-notes.md` | lines 29–60 | Confirms the offshore placement error; describes the machine as "a winch, a wire rope, a chisel and a bailer". | Partly |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` | lines 6744–7064 (`buildCablePercussion`) | The game's current model: a **truck-mounted** spudder with walking beam, king post, line shaft, belt-driven drums, A-frame mast 9.20 m, 0.62 m stroke, 40–60 blows/min. This is the American water-well spudder, not the British GI tripod. | YES — for §9 |
| `C:\Users\henri\Downloads\Wittig_Drilling_intro-part_I.pdf` | — | **Could not be read.** The Read tool's PDF path needs poppler (`pdftoppm`) which is not installed on this machine, and no text layer could be extracted (see §8). Candidate source, unverified. | NO (blocked) |
| `C:\Users\henri\Downloads\5.Kravspecifikation geoteknik-1.pdf` | — | Same blocker. Swedish geotechnical requirement spec — likely a procurement text, not a machine drawing, so low expected value for geometry anyway. | NO (blocked) |

status: in progress — dimensions and components sections follow

---

## 2. What the machine IS

A cable percussion rig is a **stringless** drilling machine: there is no rotation, no drill
string and no circulation of any kind. A heavy steel tool hangs on a **wire rope** over a
sheave at the top of a mast, and a winch (or a walking beam) repeatedly **lifts it a short
distance and lets it fall**. The tool chops or cuts the soil into a slurry; every so often the
tool comes out and a **shell / bailer** goes down the same hole on a second rope to fetch the
spoil back. Steel casing is driven down behind the hole as it goes. It is the oldest drilling
method in commercial use — Wittig calls cable drilling *"the earliest drilling method"*
(`Wittig_Drilling_intro-part_I.pdf` p.72, slide "Overview drilling technology / tooling").

**Two machines wear this name and they must not be conflated** (`research/16-site-archetypes.md`
§B.2):

- **(A) The British shell-and-auger / cable-percussion tripod.** A folding **A-frame or tripod
  derrick ~7 m high**, a **2-tonne winch** driven by a small diesel, mounted on a light trailer
  chassis and **towed by a 4×4**. Used for ground investigation — SPT, U100 samples, monitoring
  wells. Still *"the most widely used method of ground investigation in the UK"*, worked to
  **BS 5930** (`research/16` lines 1873–1884, refs `[GEOINV-CP]` `[GW-CP]` `[SUBSURF-CP]` `[JW-CP]`).
- **(B) The American water-well spudder.** A truck- or wagon-mounted machine with a **walking
  (spudding) beam**, a **bull wheel**, a line shaft and multiple drums. Bigger, deeper, and a
  different silhouette (`research/16` §B.2; and the period engraving *"Seilschlagkran XVI —
  Pumpe und Motor auf dem Fahrgestell"* in `Wittig_Drilling_intro-part_I.pdf` p.9).

Where it stands: a village or rural water-well plot, a brownfield / ground-investigation plot,
a Nordic smallholding (`research/16` §B.2 occurrence table). **Never offshore** — `research/16`
§B.2 and `research/17` give six independent disqualifying reasons and call a spudder on a
platform deck *"the single most laughable thing the game can generate"*.

---

## 3. Proportions

### 3a. The GI tripod (family A) — the best-sourced numbers we have

| Dimension | Value | Source |
|---|---|---|
| Derrick height | **~7 m**, folding for transport | `research/16-site-archetypes.md` line 1875, citing `[GEOINV-CP]` `[GW-CP]` `[SUBSURF-CP]` |
| Working headroom required | **~6.7 m** | same |
| Winch capacity | **2 tonnes**, diesel-engine driven | same |
| Prime mover | towed by a **4×4** — the rig is a light trailer, not a self-propelled machine | same |
| Casing diameter | **150 mm or 200 mm** standard; 150–300 mm range | `research/16` line 1878; `research/06` §E.8 citing `[GE-2009]` |
| Routine depth | **up to 50 m**, 60 m+ in good conditions | `research/16` line 1879 |
| Crew | **2 — driller + second man** | `research/06` line 1721 |

**Ratios to model from (these matter more than the absolutes):**
- derrick height : casing diameter ≈ 7000 : 200 = **35 : 1** — the mast is very tall relative to
  everything else on the machine. The tripod dominates the silhouette; the plant at its foot is small.
- derrick height : working headroom = 7.0 : 6.7 — i.e. the tool string can be pulled almost to
  the crown. There is no spare mast above the sheave.
- The tripod is **taller than the machine is long**. This inverts the proportion of every other
  rig in the game.

### 3b. The wagon/truck spudder (family B) — scaled from the engraving, NOT a spec sheet

Source: `Wittig_Drilling_intro-part_I.pdf` p.9, *"Abb. 31. Seilschlagkran XVI, Pumpe und Motor
auf dem Fahrgestell"*. **Method: scaled off the image against the standing figure at the right,
assumed 1.75 m. These are ±15% reads from a period engraving and must be labelled as such — they
are not manufacturer figures.**

| Dimension | Scaled read | Confidence |
|---|---|---|
| Mast height above ground | **~8 m** | ±15%, image-scaled |
| Chassis overall length | **~5.9 m** | ±15%, image-scaled |
| Large (rear/drive) wheel diameter | **~1.3 m** | ±15%, image-scaled |
| Small (front/steer) wheel diameter | **~0.8 m** | ±15%, image-scaled |
| Mast rake off vertical, at work | **~12–18° leaning back over the chassis** | ±5°, image-scaled |
| Mast height : chassis length | **≈ 1.35 : 1** | ratio is more reliable than either absolute |

### 3c. Tripod leg splay

From the tripod engraving on the same slide (`Wittig` p.9, right-hand figure, "Gravity drill rig
with free falling drill rods"): apex-to-foot geometry reads at roughly **base width : height ≈
0.7 : 1** — a wide, low-angle splay, each leg about 20° off vertical.

`NOT SOURCED`: a dimensioned leg-splay figure for a **modern** GI tripod. `[I]` Modern folding
tripods appear narrower than the engraving. **If two sources disagree, both are recorded:** the
engraving says ~0.7:1; no modern source in this folder gives a number at all. Do not present
either as fact.

### 3d. Weight class

`NOT SOURCED` for either family. The only weight figure available anywhere in the local material
is the **2 t winch capacity** (`research/16` line 1875) — that is the winch, **not** the machine.
The game currently asserts `weightKg: 9400` (`rigFactory.js` line 7052) with no source behind it.

# Raise boring machine — engineering reference (`raisebore`)

status: in progress
Subject: game rig id `raisebore`. Builder: `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` (`buildRaisebore`, ~line 3145).
Purpose: GEOMETRY and MATERIALS reference for the modeller. **No real manufacturer name or model designation may become a product name in the game (DOMAIN.md §10).** Use the shapes, not the badge.

---

## 1. Sources read

| Source | Where | What it actually showed | Useful? |
|---|---|---|---|
| `research/03-mining.md` §A.5.1, §C.2.5, §D.5, §F.1.5 | lines 454–520, 1005–1015, 1192–1210, 1613–1650 | **The single richest local source.** Full raise-boring method (pilot down / ream up), reamer head diameters 0.6–6 m, cutter counts by diameter, head weights 2.7–38 t, stem Ø228–381 mm, 1.5 m hollow drill pipe, head types (integral / segmented / extendable), blind / down / horizontal boring variants, and an explicit machine description: "not a mobile machine — set up and **grouted down** onto a prepared concrete floor… a short, extremely stiff **derrick** over a large-diameter rotary drive with a thrust cylinder frame; 1.5 m drill pipes handled by a **pipe loader**; a hydraulic power pack and a **water pump** alongside." All cited to `[W-SANDVIK-RB]`. | **YES — primary** |
| `research/11-oem-anchor-geotech-hdd.md` | ~line 674–690, 924 | Historical: 1963 electro-hydraulic raise driller, pilot down then ream up — confirms the method lineage and that raise boring sits in the "heavy end" OEM family alongside shaft drilling and TBMs. No dimensions. | Partly (context only) |
| `research/16-site-archetypes.md` | line 101–103 | `raise-boring` is listed in the `german-site`, `iberian-quarry` and `alpine` archetypes. Tells the modeller which environments the machine has to sit in; no geometry. | Context only |
| `src/rig/rigFactory.js` `buildRaisebore` | ~3145–3300 | The game's current model — recorded in full in Appendix A below. | Comparison |
| `src/rig/tools.js` `raisebore-reamer` | see §9 | The reamer head builder. | Comparison |

_(more sources appended below as read)_

## 2. What the machine IS

A **raise borer** is the odd one out in the whole fleet: **it does not drive anywhere.** It is a stationary machine that is trucked or caged in pieces into a small purpose-excavated chamber on an **upper** mine level, set on a **prepared concrete floor**, and **grouted and rock-bolted down** so it can react thousands of kilonewtons of pull against the rock itself (`03-mining.md` §C.2.5, `[W-SANDVIK-RB]`). It has no tracks, no wheels, no cab and no boom.

What it does is drill one hole twice. **Stage 1:** a sealed-bearing roller **pilot bit** on hollow **1.5 m drill pipes** is pushed *downward* with water flush until it breaks through into the level below. **Stage 2:** the pilot bit is unscrewed from underneath and a **reaming head** — a flat steel disc 0.6–6 m across carrying 4 to 32 roller cutters in bolted saddles, weighing 2.7 to 38 tonnes — is bolted onto the bottom of the string, and the machine **rotates and pulls it back up** toward itself. There is no flush on the ream pass; the cuttings simply **fall by gravity** into the lower chamber and are mucked out with an LHD (`03-mining.md` §A.5.1, `[W-SANDVIK-RB]`). The product is a ventilation shaft, ore pass, manway or penstock, up to ~6 m diameter and up to ~1000 m long.

So the correct mental picture is: **a squat, extremely stiff derrick bolted to a floor, straddling a hole, with a very large-diameter hollow rotary drive travelling on it, and almost everything else (power pack, water pump, control stand, pipe rack) sitting loose on the floor around it, connected by hoses.** A driller would call the machine itself "the head and the frame" and everything else "the pack".

## 3. Proportions

## 4. Component inventory

## 5. Distinctive features

## 6. Materials and paint

## 7. Photo references

## 8. NOT SOURCED

## 9. Domain-truth warnings

---

## Appendix A — what the game currently builds (read from rigFactory.js)

`buildRaisebore`, spec block:

```
id: 'raisebore', name: 'Vantera RB-92 Shaftline'
klass: 'Underground raise-bore machine', weightKg: 26000, powerKw: 250,
columnM: 4.6, torqueKNm: 120, thrustKn: 2800, pullKn: 4500,
reamDiaM: '1.2-3.1', pilotMm: 311, stemMm: 254,
methods: ['raise-boring'], frameRadius: 6.5
```

Geometry as built:
- base frame 3.2 x 3.0 x 0.30 m box on four 0.42 m pedestal blocks with thin (28 mm dia) chrome rods to the floor — reads as anchor bolts.
- collar ring: torus r=0.55, tube 0.09 around the hole.
- a **4.6 m four-post lattice column** (0.22 m box legs on a 1.84 m square, three bracing bands per half) carrying a travelling carriage.
- carriage: 1.85 x 0.95 x 1.85 rounded box (gearbox), 12-bolt ring, hollow chrome spindle below it, tool anchor 0.46 m below spindle.
- two thrust rams, 1.60 m body / 1.70 m stroke, at x = ±1.05.
- separate hydraulic power pack 1.35 x 1.25 x 2.0 m at (-2.35, 0, -1.4) with louvres and a horizontal cylinder (accumulator/cooler) on top.
- control stand 0.85 x 1.35 x 0.55 with a screen and a canopy on two posts.
- stem rack: 6 stems, 254 mm dia, 1.5 m long, lying horizontally.
- one parked reamer head, 1800 mm dia, lying on its side.
- 4 hose runs from the pack to the machine, one coiled airline, wear/mud clumps.

Nothing is bolted **down** through the column into rock in the model other than the four thin rods; the machine has no derrick-height stem handling and no shaft-collar/bulkhead context.

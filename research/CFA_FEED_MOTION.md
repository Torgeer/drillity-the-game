# Continuous CFA feed — 2026-09-06

The actual CFA GLB now follows tool advance continuously in `cfa` and
`cased-cfa` modes. The previous generic rod cycle moved the entire authored
auger through almost its whole stroke when depth crossed a multiple of 3 m.
The adapter consumes the existing simulator's `actionDepth`, preserves the
authored collared rest pose, and stops at the declared directed carriage
endpoint. It neither rescales the machine to fit a contract nor changes its
capacity.

`gltfRig.makeDyn()` marks the CFA carriage as `continuousAugerFeed` because
`blender/cfa_rig.py` attaches its auger directly to the spindle under that
carriage. `rigFactory.update()` applies continuous feed only to the two CFA
methods. The other method selections on this machine retain their prior feed
behavior. The procedural CFA fallback uses its own existing carriage range
instead of the former fixed `depth / 14` normalization for these same two
methods. Its non-CFA behavior is unchanged.

The imported travel contract is parent-local and directional. Advance is
added to the recorded rest fraction using the declared span; the existing
`setCarriage()` clamps the result and applies the declared axis. Off-axis
rest coordinates, carriage rotation, work rake and the published
`glb.feedFraming` envelope are preserved. No model, physical constant,
simulation, capacity or camera code changed.

## Actual-module evidence

Run `node tools/checkcfafeed.mjs --json .hudqa/cfa-feed.json`.
It loads the actual GLBs through the strict production loader, observes the
actual builder, feeds the CFA and cased-CFA states from `createDrillSim`, and
updates the real rig system. It also builds both actual procedural fallbacks
and checks unchanged feed for GLB CFA-rig/auger, CFA-rig/rotary-Kelly and RC/RC.
**332 checks pass over seven builds: five GLB and two procedural.**

The baseline factory from `HEAD` was imported separately without overwriting
production files. The new gate rejected it at depth zero: it snapped to the
upper endpoint instead of preserving the authored rest coordinate. A second
baseline run through the existing attachment audit reproduced the rod-cycle
jump against the same current CFA GLB:

| Tool advance m | Previous carriage Y | Corrected carriage Y |
|---|---:|---:|
| 0 | 19.999999976 | 19.949998856 |
| 1.5 | 11.499999976 | 18.449998856 |
| 2.999 | 3.005666643 | 16.950998856 |
| 3.001 | 19.994333309 | 16.948998856 |
| 8.5 | — | 11.449998856 |
| 15 | — | 4.949998856 |
| 17 | — | 2.999999976 |
| 18 | — | 2.999999976 |

These are explicit node coordinates, not new machine dimension measurements.
Depths, target 18 m, render-independent test controls and tolerances are
synthetic **NOT SOURCED test inputs**. They deliberately exercise saturation
beyond the catalogue capacity. The 0.002 m advance across the former cycle
boundary now yields 0.002 m movement, rather than a 16.988666667 m reversal.
The GLB's recorded rest is about 0.050001121 m below its upper endpoint; it
therefore has about 16.949998879 m of remaining declared downward travel.
The procedural fallback also advances one carriage metre per tool metre and
continues below its former artificial 14 m cutoff; it reaches its existing
lower coordinate 2.2 at 14.9 m of advance. Those are authored mechanism
properties, not certified depth ratings.

Additional gates after the source change:

- `node tools/checkrigmetadata.mjs`: **80/80 passed**, including all 19 actual
  assets, declared axes/directions, rest and feed framing.
- `node tools/auditrigattachments.mjs --tool-selection-only`: **42/42 method
  pairs passed**, retaining the prior CPT piezocone correction. This does not
  grade the separate string alignment findings.

Asset SHA256: CFA
`a10c16b3071c96926077271c1d8785637951989d082d9a3f5e1f5e2bf4bf7b35`.
The JSON captures source and model fingerprints and rejects files changing
during a measurement. The baseline attachment observations are in the local
generated `.hudqa/cfa-feed-baseline.json`.

## Limits that remain open

The actual simulator publishes `stageCount: 1`, `stageId: bore` and
`stageReverse: false` for both CFA methods. Their method definitions have
`rodLength: 0` and no concrete pumping or withdrawal programme. Consequently
**there is no actual CFA return state to claim tested**. The gate injects a
decreasing `actionDepth` while holding contract depth at 18 solely to prove
that the existing runtime interface can reverse the carriage; it labels that
evidence separately from real simulation states. A return/pumping programme
requires separate simulation and gameplay work.

The sourced-configuration report remains authoritative:
[`rigs/cfa-capacity-verification-2026-09-06.md`](rigs/cfa-capacity-verification-2026-09-06.md).
The authored auger still cannot clear grade at its upper endpoint. This feed
fix preserves that geometry instead of inventing extension travel. No GPU
capture, rendered occlusion claim, above-grade clearance correction or
completed CFA construction cycle is implied.

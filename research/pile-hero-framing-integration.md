# Piling hero framing oracle adaptation — 2026-09-08

Only `tools/checkheroframing.mjs` changed. Production, GLBs, framing, padding and tolerances were not modified. No browser/GPU run was performed.

## Cause of the assembled-build failure

`evidence/verification/build-assembled-final-03.log` preserves the failed gate. Its independent helper interpreted piling `travel_m=15.12` as an upward displacement from exported carriage rest Y `14.600000381469727`. It therefore placed the upper test pose at `29.720000381469724`, beyond the authored upper endpoint. That actual-vertex pose failed the crown check at both phone sizes. Its runtime oracle also expected the obsolete interval, so the corrected loader's real positions disagreed.

The committed Python authoring expressions are `travel_lo_m = 1.40 - HAMMER_BOT` and `travel_hi_m = (LEADER_TOP - 2.60) - HAMMER_L - HAMMER_BOT`. Both are offsets from the exported rest, and `blender/lib/rig.py` exports Y-up. The GLB metadata therefore yields local endpoints `1.4000003814697273` and `16.52000038146973`. These are artifact-derived coordinates, not newly chosen dimensions.

The old gate never selected a method. Its piling row consequently exercised the initial generic auger feed instead of the supported `driven-pile` continuous feed. The repaired gate selects `driven-pile` only for piling and restores the original method for every other rig. It tests real public rig updates at depth zero, either side of and exactly at three metres, the authored lower limit and full span, independently expecting clamped rest-minus-penetration. Other rigs retain their previous modulo samples and oracle.

## Validation

Command from the main checkout:

```powershell
node tools/checkheroframing.mjs --json research/pile-hero-framing-integration.json
```

Result: **3,006 checks pass, 354 actual GLB/phone cases, all 19 rigs, both 390×844 and 320×740 layouts, all five geology section modes.** Actual vertices, public rig updates, clip-plane/ground checks, crown/side thresholds and immutable metadata checks remain active.

The old wrong upper pose is retained as an explicit negative control. At Y `29.720000381469724` its projected crown is −94.5368 px against the unchanged 18.2999 px minimum at 390 width, and −72.9373 px against 13.9799 px at 320 width. Both are rejected. Three malformed piling metadata cases also reject. No failing crown observation was discarded or made acceptable by a wider tolerance.

Final gate SHA256: `b0026f43ef9ca2a9e5e8f7158fc9e2b434d1c91118519e9a68efffa7167557e5`.
Result JSON SHA256: `196f5ce4806ea585a83f14267a604470e0cd952f541b1eb7dde1a833679d499f`.
The JSON records renderer, loader, factory, geology, Python and all GLB hashes, plus both negative-control projections.

This is CPU framing acceptance for the declared poses. It does not approve the previously rejected browser capture, live camera settling, site-building occlusion, ram readability, cap/casing clearance, static pile/rope alignment or FPS. Independent review is recorded separately in `pile-hero-framing-critic.md/json`.

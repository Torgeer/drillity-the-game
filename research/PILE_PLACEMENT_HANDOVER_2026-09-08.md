# Atomic piling carriage correction — source proof only

Candidate: `C:/Users/henri/Downloads/threads/drillity-pile-motion`.
Integration packet: `pile-placement-delta.patch` and `pile-placement-delta.json` in this directory. Apply only that narrow delta over the accepted ram adapter; do not copy whole candidate production files over main.

The actual GLB's carriage is exported at local Y `14.600000381469727`. Its legacy `travel_lo_m=-13.2` and `travel_hi_m=1.92` are offsets from that rest: `blender/piling_leader.py` defines them as each physical endpoint minus `HAMMER_BOT`. The exporter uses Y-up. The corresponding runtime endpoints are rest+hi and rest+lo. Previously the positive span was added above rest and feed repeated every three metres.

The narrow change recognizes and validates that exact piling-carriage authoring contract in `gltfRig.js`, including rejection of missing/nonfinite/mismatched/ambiguous metadata. It uses the same endpoint result for feed framing and runtime range. `rigFactory.js` reuses its existing continuous movement calculation for the GLB piling carriage in `driven-pile`, beginning at the authored rest and following actual penetration continuously within the authored limits. No new physical dimension, timing model, mesh, catalog value, or ram-displacement change is introduced.

Verification commands in the candidate:

```powershell
node tools/checkpileplacement.mjs
node tools/checkpilemotion.mjs
node tools/checkpilefeed-adversarial.mjs
node tools/checkpilemotion-adversarial.mjs --fleet-only
```

Results are in `research/pile-placement-author.json` (632 checks; 35 phase/depth pairs and 12 malformed metadata cases), `research/pile-placement-ram-regression.json` (4,332 existing ram checks), `research/pile-feed-critic.json` (independent endpoint/mutation proof), and `research/pile-placement-critic-fleet.json` (18 other rigs, 41 methods). The packet records hashes. All completed gates pass. The author's initial synthetic fixture tried to teleport depth during an existing dolly-change beat; that is not an actual penetration path. The final fixture enters the sampled depth through drilling, then checks the same depth during the stationary phase. Production was not changed for that fixture issue.

Independent critic approved bounded source integration. **Visual acceptance remains pending.** The prior main capture at `evidence/pile-motion-browser-final-01` remains rejected and unmodified. The browser harness still needs independent fixes for Vite source-asset URL classification and held-frame ordering before an accepted matched comparison. Do not weaken identity or visibility assertions. A future comparison must hold assets, seed, contract, loadout, actual simulation state, camera and viewport constant and isolate only this carriage correction.

Static pile geometry and hoist ropes are not remapped by this patch. Whole assembly alignment, cap/casing clearance, site-building occlusion and FPS are not approved. No GPU/browser was launched for this source correction; no main source was edited by the author.

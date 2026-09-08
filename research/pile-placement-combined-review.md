# Combined pile ram and placement review

**The assembled critic passes with the intended placement correction independently checked.** The historical baseline remains `1f2d285f54ff71b9f05dac895bee0400aa9f61f7`. It was not advanced to hide a regression. No production source, package configuration, asset or browser process was changed by this integration review.

The obsolete assertion compared the corrected carriage directly with the old upward/modulo placement. It failed at the first actual simulator frame: historical carriage Y `29.720000381469724`, corrected Y `14.600000381469727`. That historical position is no longer the acceptance oracle.

The replacement reads the actual GLB carriage rest and authored lower/upper offsets, and checks the Python statements that define these as endpoint minus `HAMMER_BOT`. At every one of 540 real simulator frames it requires `clamp(restY - actualWorkDepth, lowerY, upperY)` and independently checks both published carriage endpoints.

Every other local transform is still compared with the pinned scene. The only permitted local changes are carriage Y, governed by that depth oracle, and ram Y, governed by the retained ram movement, bounds, phase and frozen-clock tests. The expected scene's world matrices are recomposed recursively through those two permitted changes. **No carriage or ram descendant is skipped:** each retains its pinned local transform and must have exactly the world matrix implied by its corrected parent. Scene structure and vertex counts remain checked.

## Results and reproduction

```powershell
node tools/checkpilemotion-adversarial.mjs
node tools/checkpilemotion-adversarial.mjs --pile-only --counterfactual
node tools/checkpilemotion-adversarial.mjs --pile-only --placement-counterfactual
```

The full critic exits 0. It includes the unchanged baseline comparison for all 18 other actual rigs and their 41 method combinations, metadata rejection, compound frame tests, real dolly/set/re-drive/completion/new-job checks, and actual ram movement and freeze checks.

Both negative controls intentionally exit 1, recorded in `pile-placement-combined-review.json`:

- `--counterfactual` removes only the ram binding from the test instance while retaining corrected placement. It fails with `ram must change parent-local position, not only inherit carriage movement`.
- `--placement-counterfactual` uses the historical factory/loader in the actual simulation case. It fails the authored-depth carriage oracle at `29.720000381469724 != 14.600000381469727`.

The positive JSON contains the full source/model hashes and source-stability checks. Its `negativeControls` section records the independently executed failure results. All three runs used critic SHA-256 `0e73ea2c7b66a651bd4208ac396ff283c1247830f5085183459e442d6c15f875`.

Accepted assembled source hashes:

```text
ea7aa46ab87be5a0b2c04152bb959be5c227ed6f073762dc78d5d654c7a4b53b  src/core/gltfRig.js
7495aef8fd0d98ee7a3be9cd72dbf2f335a4a5d4b45b0de6403f72d964b78353  src/rig/rigFactory.js
07ccd37ec9f74cf6030639053c6165fc0617876f7fbfca542e95fc5fbba5ab74  src/sim/drilling.js
```

These are CPU source/transform acceptance results. Current or historical screenshots are not a visual baseline for the newly corrected placement. No new claim is made about visible clearance, static sibling pile penetration, ropes, rendered draw calls, or complete piling choreography.

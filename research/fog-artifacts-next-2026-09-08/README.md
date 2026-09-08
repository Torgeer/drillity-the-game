# Nordic fog handover — UNACCEPTED

**Do not integrate this patch yet. No accepted matched source pair exists.**

Work stopped at the 76%-used wind-down checkpoint. The final preflight source was reviewed by the independent critic but has never been run. The production candidate remains isolated; MAIN production was not changed by this handover.

## Contents and integrity

- `nordic-fog-delta.patch`: exactly six added lines in `src/core/env.js`, against the immutable source baseline.
- `frozen/`: the final capture harness, camera/scene controls and pair classifier, with exact critic-approved hashes in `archive-manifest.json`.
- `NORDIC_FOG_2026-09-08.md` and `NORDIC_FOG_CRITIC.md`: author and independent review evidence, limitations and source findings.
- `critic-58-negative-controls.json`: the independent 58-case proof; this is a preflight guard result, not a graphics acceptance result.
- `fog-evidence-lossless.zip`: all 300 immutable baseline source files and manifest; the candidate environment; all author and critic helpers; raw captures-01 and captures-02 with executed source copies and input manifests; CPU results; and the older five-pair regional-fog failure directory. Every decoded archive member was compared byte-for-byte to its original. `archive-manifest.json` records every member hash, original path, size and archive hash. Originals remain intact.

Archive prefixes are `baseline/`, `candidate/` and `legacy-regional-fog/captures-01/`. Public generated model assets and node_modules are external prerequisites, with their recorded input hashes in the raw capture manifests; they were not regenerated or repacked.

## What is actually proven

The six-line candidate changes clear Nordic fog only. The real environment CPU differential passes 240 surface and 120 underground cases: other regions, weather, underground scenes, lighting and sun values are unchanged. The authored mix is 70% of the existing Nordic sky tint; clear density is 0.0034. These are art-direction values, not sourced physical atmospheric constants.

New captures-01 timed out before setup because the harness held the final UI tick required to release boot. No image exists for that attempt. The narrow public UI-only release was repaired and verified against the actual shell lifecycle.

New captures-02 completed the Nordic morning pair. Both surface and section camera transforms, projection matrices and inverses matched exactly, as did full game/simulator state and glass descriptors. The pair was correctly rejected for differing particle geometry and wind. The 52 differences were independently classified into 32 VFX attribute hashes, six wind components, five directly fog-driven particle uniforms and nine measured loading telemetry values. Both PNGs remain raw, rejected evidence. The candidate looks less ochre in that view, but the different plume prevents fog-only acceptance. Foreground equipment obscures much of the cab, so the hero view is insufficient glazing evidence.

The final unrun repair reseeds the retained public PRNG object used by VFX and preserves the separate original contract seed. It also resets the two real private frame-accounting accumulators once at setup, with recorded before/after values. Subsequent updates use the real frame pipeline. CPU proof shows independent random streams and identical frame-accounting schedules after different boot histories. Wind and every particle attribute remain exact comparison requirements. Timing allowances are individually enumerated and numerically checked; surface particle fog uniforms must equal the real source FogExp2 inputs. No whole scene, material or state object is exempted.

GPU render-target texels are not read back: those entries have dimensions and canonical source/sharing descriptors. Source hashes, shader inputs, complete scene environment controls and matched images provide the bounded evidence. These stills do not measure FPS or certify a physical phone.

## Exact next action

The original isolated candidate is `C:/Users/henri/Downloads/threads/drillity-next-nordic-fog`. Keep all prior evidence directories. Verify its source and required public assets against the archived manifests. Obtain the shared coordinator's exclusive GPU slot, verify port 5232 is free, and set the lease owner to exactly `next-nordic-fog` only when that slot is granted.

Final required SHA-256 values:

| Input | SHA-256 |
|---|---|
| `tools/capture-nordic-fog.mjs` | `01260a551670da8a094f6d1d1aa9b871005c19db43d89abcda8cf2e261e345da` |
| `tools/nordic-fog-controls.mjs` | `83250843f3ce04c400337139661d660be9c865c15c29bfea5133d771d610f4d3` |
| `tools/nordic-fog-pair.mjs` | `b1209b1f6d8b8210cfda46abc572b230b21e5a4494cde3ebedd0d96b38c99e46` |
| `src/core/env.js` | `3d218dd6d95fa79c1aad2b4872e910f577d214b0531ab8d2095f796f0bd6bcea` |

Run from the isolated candidate:

```powershell
node tools/capture-nordic-fog.mjs --out evidence/nordic-fog/captures-03 --pairs nordic-hero-0.34
```

This is **one pair only**. Stop and preserve any failed result; do not relax identities or overwrite evidence. Independently review the complete camera/scene/state/VFX result and actual PNGs. Close the owned browser/server, verify port 5232 is absent and release the lease on every exit.

Only after that pair passes independent review, request the remaining bounded series:

```powershell
node tools/capture-nordic-fog.mjs --out evidence/nordic-fog/captures-04 --pairs 'nordic-hero-0.5,nordic-hero-0.7,nordic-glass-orbit,sahara-control'
```

Noon and dusk must preserve regional and low-sun character. Orbit must provide useful visible cab glazing at the same actual observed camera in both sources. Sahara must remain unchanged. A failed or obstructed glass view does not count. Integrate only the narrow patch after the full intended evidence set is accepted.

For recovery on another machine, prepare a new isolated worktree from parent `a47de8a6ba199eabb108da447cd660f01c1735e7`, overlay the archived `baseline/` source files and then `candidate/`. Reuse verified dependencies and generated assets. The preparation helper referring to the old local candidate is a historical provenance tool; the archived baseline and candidate bytes are the recovery authority. Older failure-check helpers may require restoring the legacy evidence at their recorded relative path. Do not overwrite a newer MAIN checkout with the archived baseline.

Repository storage note: standalone `.patch` files are committed as `.patch.gz`, preserving their exact diff-context bytes. Decompress to the original filename before applying. The FPS package verifier can read this gzip storage directly; original logical patch hashes remain unchanged.

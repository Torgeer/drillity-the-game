# Rescue geology: composed MAIN critic, 2026-09-08

**APPROVED for this focused composition.** All 14 actual-geology groups pass in MAIN atop `859fde2023e531d44e5ff334355e4d24e4c4d92c`, with integrated core tender authority, sampling conditions and CFA changes present. Relevant source hashes were identical before and after the run. This critic changed only `tools/checkrescuegeology-adversarial.mjs` and created this report/raw test reports. No production source, dependencies, GPU, browser or git state was changed by the critic.

## Portable reproduction

```powershell
node tools/checkrescuegeology-adversarial.mjs --report=research/rescue-geology-critic-main-portable-02.json
```

The final command requires no local absolute path or sibling checkout. It resolves the root-installed `@napi-rs/canvas` **0.1.100**, and reads historical geology directly with `git show 859fde2023e531d44e5ff334355e4d24e4c4d92c:src/world/geology.js`. That immutable blob has SHA-256 `a77338f2a52525943227b02847e1512f45936258cd3a0be3fdca7b55deb24fb8`. Only its three static import specifiers are resolved to this checkout's dependencies before an in-memory import; no baseline generator logic or returned value is replaced. No temporary source file is created. `--canvas=...` or `DRILLITY_CANVAS_ROOT` remain optional native-package overrides, and relative overrides resolve from the invocation directory. The obsolete sibling-baseline option explicitly fails instead of silently changing the comparison.

The tool now records Node/native Canvas identity and ten relevant source hashes. It additionally asserts on every actual acceptance that `progression.run.contract` is exactly `state.contract`. Existing controls, actual drilling and all expected outcomes remain intact.

## Results and authority interaction

The 14 groups cover actual `geology.init`, acceptance events, real geological sampling and updates, full three-hole drilling from zero cash, legitimate public jam/bit actions, saved-game restoration, canonical term spoofing, empty inventory, partial abandonment, completion replay, copied/unaccepted/abandoned work-order identity and mismatched physical profile context. The real historical acceptance negative control still reproduces the promised/actual ground mismatch. Regional generation remains unchanged across eight regions and three seeds plus an accepted ordinary mixed-soil/granite negative control.

| Actual completed work | Final cash |
| --- | --- |
| Unchanged starter auger, three B holes | EUR453 |
| Supported worn rig/auger/rod, conditions 0.4/0.5/0.5, three B holes | EUR571 |
| Slow D work with actual jam recovery | EUR400 |
| Existing generic field-spare policy | EUR566 |
| Legacy save restored after first actual hole, then two remaining holes | EUR453 |

The slow D job receives EUR548 support on its third and final hole only. Ordinary revenue is EUR942 and actual recorded running costs total EUR1090, so raw net EUR-148 plus support gives EUR400. Completion replays do not pay again. The generic spare still has kind `any` and telemetry `fits: false`; it is evidence for the existing public field-spare action, not a physically verified auger replacement. The independent starter and worn typed-auger cases retain `fits: true` and do not rely on that spare.

Source inspection of `progression.openContract`, `checkSamplingStart`, `beginHole`, `serialise`, `load` and `releaseContract` confirms that private `acceptedCoreContract` authority and the nonwritable core `run.contract` property are scoped to **method `core`**. Canonical auger rescues are separately rebuilt and frozen, then the same accepted object is assigned to both state and run before `CONTRACT_ACCEPT` is emitted. Actual acceptance and save/load tests exercise the geology identity checks on this composed source, and legitimate regeneration succeeds while copied, retired and mismatched objects fail. No core-authority compatibility defect was found in the rescue path. This focused review does not claim to replace the core critic's separate full sampling authority suite.

## Preserved initial failures

The unmodified integrated tool first ran with no sibling-baseline argument. `research/rescue-geology-critic-main-first.json` preserves **12/14**, with exactly the two historical comparison groups failing because `baselineGeology` was absent; the twelve gameplay/identity groups passed. That report remains a failure rather than being overwritten or reclassified.

The first portability rerun was interrupted before the test module initialized while the root was replacing the old dependency junction with the project's local installation. Node v22.16.0 reported:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'three' imported from C:\Users\henri\Downloads\threads\drillity-fps-investigation\src\world\geology.js
```

It exited 1 before producing `rescue-geology-critic-main-portable-01.json`; that nonexistent path is not acceptance evidence. Root confirmed the concurrent installation, its successful completion and that the old shared dependency target was untouched. The focused gate was then rerun with default local package resolution and passed **14/14**. The critic performed no dependency mutation.

## Accepted source identities

| File | SHA-256 |
| --- | --- |
| `src/core/contract.js` | `dfb40a897139a7a67fc9d62a2d17a473096a51f42513becca6e3391767e3cf53` |
| `src/game/economy.js` | `67fd6d0e5c24fb3428e2db36fb95d8ab205c2b0b3d6cb6a2cfb5d8b2e22a89b0` |
| `src/game/progression.js` | `8d32c146bc62974efb2b9098180258f3be8ff13b0495ecac35eb8bd98ef0ed6a` |
| `src/world/geology.js` | `faeb7e7b14af50f16b9905adba1efae7fb6cf754afa1894a8ce10c8a93466e88` |
| `src/sim/drilling.js` | `77775ab92b4f68f550f1032bea87a33996c7822c4056096bdbc506001241ae40` |
| `src/game/data.js` | `220a8e25a3caef0c296c840a82edf20d66942a9df5173861e90ef969db0151b7` |
| `src/game/equipment-support.js` | `5a292120216c667a49c8bb887fcf9fd79ec47f320caf13f7077a1f7b52eabb6a` |
| `src/sim/sample-product.js` | `b8fff618de895b5aae1157b53d70666bfe24c76a6f5e9368b9c876233ba300f6` |
| `src/sim/sample-ledger.js` | `4849ffdeacde9c98f1ce753b1cc1132be71e474660707ec6288795d0e449ba9e` |
| `tools/checkrescuegeology-adversarial.mjs` | `e4d034179caedbd47e4e286b2450f99bff4a1801dd78390a0817a5e8cecdfaf0` |

Raw final evidence: `research/rescue-geology-critic-main-portable-02.json`, **14/14**, `sourceUnchanged: true`. This is CPU gameplay/service proof, not rendered acceptance, a phone test, sustained FPS evidence or a universal claim about every method and equipment condition. The inherited ordinary-board provenance gap and game-authored nature of the tender soil column remain explicitly bounded by the earlier independent rescue and ordinary-career reviews.

# Independent CDP chronology and heat-shimmer review

September 8, 2026. Candidate: `drillity-next-heat-shimmer`, detached parent `a47de8a`, overlaid with the 300-file frozen resume-70 snapshot. Critic owns this report, `tools/checkcdp-chronology-adversarial.mjs`, a forthcoming separate shimmer critic and their evidence. No production source, generated assets, browser or GPU changed by this review.

## Decision before a new capture

The old `delta < 0` gate rejects data that Chromium's own profile reader can interpret without discarding samples. A separately named/versioned validator is justified. Keep both previous reports' original **overall rejected** classification and bytes. A new chronology interpretation is a separate derived record; it does not validate their confounded particle experiment or demonstrate a performance repair.

The current source supports testing **the non-refractive heat-shimmer quad** using same-state repeated render submissions. That experiment is not yet reviewed or authorized for GPU capture. It measures the marginal repeated-render GPU cost of a feature at captured states; additional renders alter the live frame schedule, so its RAF rate cannot represent shipping FPS.

## Verified primary sources

The sources were downloaded from the projects' own repositories and pinned, with full paths, revisions and SHA-256 values in `cdp-primary-2026-09-08/sources.json`. These revisions establish the inspected implementation's semantics. They are not asserted to be the unrecorded exact build of the earlier Chrome process.

1. CDP's schema defines microsecond differences between successive samples, with the first relative to `startTime`. The field is an integer array, with no nonnegative restriction in the schema. Schema revision **90778954a4820558eb0a98194e89000d40087ba4**, `pdl/js_protocol.pdl`, lines895–907. [Primary protocol definition](https://github.com/ChromeDevTools/devtools-protocol/blob/90778954a4820558eb0a98194e89000d40087ba4/pdl/js_protocol.pdl#L895).

2. V8's inspector emits each sample's timestamp minus the previous sample timestamp, beginning with the profile start, and casts the difference to an integer. It does not sort those samples in this serializer. Revision **4a2fa0009813b95ff179b323eacda16517f882ce**, `src/inspector/v8-profiler-agent-impl.cc`, `buildInspectorObjectForTimestamps`, lines103–114. [Primary serializer](https://github.com/v8/v8/blob/4a2fa0009813b95ff179b323eacda16517f882ce/src/inspector/v8-profiler-agent-impl.cc#L103).

3. DevTools reconstructs absolute timestamps by cumulatively adding the signed deltas. It then sorts sample/timestamp pairs by timestamp. The one-to-one association is explicit. Revision **93d8a052f677cb46e6e52446e19368d725367408**, `front_end/models/cpu_profile/CPUProfileDataModel.ts`, lines138–149 and257–275. Our offline tool executes these pinned conversion/sort method bodies as its independent oracle. It does not execute DevTools' other sample substitution or final-interval estimation methods. [Primary reader](https://github.com/ChromeDevTools/devtools-frontend/blob/93d8a052f677cb46e6e52446e19368d725367408/front_end/models/cpu_profile/CPUProfileDataModel.ts#L138).

4. V8's sample processor consumes a matching VM-buffer record before its sampler buffer; the selection uses the code-event order, not a comparison of timestamps across those two queues. This supplies a plausible source mechanism for out-of-order records, but does **not** identify which queue produced any of our nine samples. Revision **4a2fa0009813b95ff179b323eacda16517f882ce**, `src/profiler/cpu-profiler.cc`, lines258–282. [Primary queue processing](https://github.com/v8/v8/blob/4a2fa0009813b95ff179b323eacda16517f882ce/src/profiler/cpu-profiler.cc#L258).

5. `CpuProfile::AddPath` appends eligible timestamps without a preceding-sample timestamp sort. The same source also warns that profile start/end values and Perfetto trace-event timestamps may use different clock domains. Do not map CDP samples to trace phase marks by assuming equality of absolute timestamps. Revision **4a2fa0009813b95ff179b323eacda16517f882ce**, `src/profiler/profile-generator.cc`, lines616–620,655–673 and761–777. [Primary recording and clock-domain notes](https://github.com/v8/v8/blob/4a2fa0009813b95ff179b323eacda16517f882ce/src/profiler/profile-generator.cc#L616).

## What the preserved records contain

| Record | Samples | Negative delta indices and microseconds | Original profile bounds | Reconstructed sample bounds |
|---|---:|---|---|---|
| `oil-vfx-on-first-01` | 37,930 | 15292:−48; 25382:−38; 25530:−50; 28225:−32 | 13228960024–13281906042 | 13229510488–13281905555 |
| `oil-vfx-on-first-02` | 38,474 | 19490:−58; 23565:−33; 29309:−31; 29392:−34; 34586:−52 | 13425624509–13479339146 | 13425864065–13479338834 |

Every negative is an adjacent timestamp inversion between two samples with the **same node ID**, whose function is `(program)`. Every cumulative timestamp remains a safe integer inside the profile's original bounds. The DevTools permutation moves eight indices in01 and ten in02, preserving all 76,404 samples and all timestamp/sample associations. `cdp-chronology-source-audit.json` records each inversion, each moved index, all original artifact hashes and the unchanged original rejection.

This establishes the immediate failure cause: a blanket sign check rejected interpretable out-of-order sample chronology. It does **not** establish a Chrome defect, a Windows clock failure, a particular V8 queue interleaving or an application-side timing fault. The old artifact records only reduced UA `Chrome/152.0.0.0`, not `Browser.getVersion` and its V8/source revision. A read-only inspection now sees installed Chrome152.0.7977.76; that is not retroactive process provenance. No exact binary mechanism is claimed.

The previous GPU findings remain descriptive: on/off eligible medians were25.298/26.085ms in01 and23.234/22.950ms in02, without consistent useful saving. Different rolling FPS, adaptive `loadScale`, particle counts, camera/depth trajectories, sparse matching and one order prevent a causal result regardless of CPU chronology interpretation. Preserve that limitation.

## Validator requirements and independent checks

A new validator should retain immutable raw arrays and emit a derived stable permutation of **whole sample/timestamp pairs**, with original indices, every inversion and every moved index. Require nonempty equal-length arrays, signed safe-integer deltas, unique valid node IDs and referenced sample IDs, safe start/end and cumulative timestamps, and every intermediate timestamp inside the original bounds. Require nonzero measured elapsed coverage, including when samples contain ties or a zero first delta. Finite timing sums alone cannot detect intermediate excursions. Preserve original start/end rather than fabricating sample coverage through the first/last gap.

Reject malformed/sparse arrays, NaN/infinite/fractional values, unsafe timestamps, missing sample nodes, empty timing, intermediate overshoot followed by a negative recovery, and malformed/duplicate/reversed trace marks. A valid trace-mark pair is an independent trace check, not proof of a CDP/trace clock mapping. Sorting deltas themselves, clamping them, or dropping affected samples changes the recording and is explicitly tested as wrong.

Command already run (CPU/offline only):

```powershell
node tools/checkcdp-chronology-adversarial.mjs --source-only --out research/cdp-chronology-source-audit.json
```

Result: **5 source/raw groups pass**. This is not author-V2 acceptance. The full command without `--source-only` contains malformed/bounds/reference/trace controls and awaits the author's named V2 export. Its result will be appended before root considers a browser grant.

## Proposed shimmer experiment: current source review

`src/sim/vfx.js` defines a full-band quad named `vfx:heatShimmer`. Its `onBeforeRender` can copy the framebuffer when refraction is enabled; hiding it would suppress both copy and draw. In this exact baseline `EFFECTS.heatShimmer.refraction` is false. The proposed scope must require `uHasScene === 0`, `uScene === null` and **zero observed framebuffer-copy calls** in each member, then refuse an enabled-copy configuration. Do not describe this baseline probe as refraction cost or generalize it to the enabled-copy path.

The renderer's `drawBands` clears the complete target before rebuilding both bands; AO clears its own target. Installed SMAA is spatial, and `EffectComposer.render(0)` does not read its internal clock. These source facts support repeated submissions, but are not a substitute for before/after evidence. Strictly check actual state, cameras, scene transforms, materials/uniforms, instance/attribute contents, target identities and restore masks after each member. Zero `dt` only prevents time advancement; it does not prove a render call has no other mutation.

Alternate on/off pair order and retain order-specific results. Composer read/write roles can flip; explicitly distinguish stable allocation/pass identity from those observed roles. Preserve workload summaries including rolling `clock.fps`, adaptive `loadScale` and particle counts. Equal within-pair workload controls the immediate adaptive confound; between-pair workload and added-render pressure still limit generalization.

## Completed independent preflight

The following commands were run after the author froze the new implementation:

```powershell
node tools/checkcdp-chronology-adversarial.mjs --out research/cdp-chronology-critic-v2-02.json
node tools/checkheatshimmer-adversarial.mjs --out research/heat-shimmer-critic-06.json
node tools/checkliveprofiler-adversarial.mjs
```

- **44 CDP groups pass.** Exact author order, every reordered index and every negative match the executable pinned DevTools oracle. Stable ties and a non-adjacent final inversion are covered. The latter proved why the final raw array element cannot be treated as the latest chronological sample. Malformed arrays, sparse entries, unsafe/out-of-bounds intermediate timestamps, invalid node references, empty timing and malformed trace marks reject. Both historical recordings remain byte-identical and originally rejected.
- **30 shimmer groups pass.** The fixture uses actual Three cameras, scenes, materials, geometry and instanced attributes with a query-driver double. It rejects same-version particle-buffer mutation, camera/uniform drift, final-member geometry replacement, target detachment, missing camera/graph evidence, invalid masks/hooks/restoration and framebuffer copying. Original render failure survives a secondary query-end failure. Foreign queries are not claimed; never-ready, disjoint, null and invalid results reject and owned queries are deleted.
- The composed live+shimmer case runs the actual two installers together: one simulation update and one normal render CPU row per frame, sixteen extra render submissions for eight pairs, distinct completed query sets, natural connection/resumption in the fixture, then reverse-order restoration of original functions and hooks. This verifies instrumentation composition using doubles; it is not real-game render equivalence or a GPU timing result.
- **122 existing independent live/particle groups pass** on the same final profiler. Existing strict diagnostics and canonical setup remain covered. The old frozen author self-test remains a separate author check; no claim that this CPU-only review measures frozen or live FPS.

Reviewed source SHA-256:

| File | SHA-256 |
|---|---|
| `tools/profileframes.mjs` | `436f48390bf25083d8a6105103389849ee61e83ac22714eb8b4c493dfddcbc40` |
| `tools/live-shimmer-pairs.mjs` | `6c9b68d88eb500859f7768784b483b5e3ce096edb8ee4003c28edd6c04f271db` |
| `tools/checkcdp-chronology-adversarial.mjs` | `cc5abdbe08eb9ae24aa151b0e7be89e63eb508a2add2475b401ee1f389bfb8b9` |
| `tools/checkheatshimmer-adversarial.mjs` | `52790a1e950d6e0a4005bf9589257d193ce92be0306d0796fd5f7ea5d1ac9260` |

Failed critic records are retained: `heat-shimmer-critic-01.json` lacked the newly required realistic fixture uniforms/triangle positions; `03.json` began the composed warm-up fixture at nonzero depth/time and correctly failed the existing warm-up gate. Fixtures were corrected in02/04; neither old failure was relabelled. The initial source review's real evidence gaps were repaired by the author: exact typed-view byte comparisons with deferred immutable SHA-256 evidence, required input schemas, null-safe entries and truthful pending counts.

Preflight verdict: **no remaining blocker found in the exercised instrumentation paths**. Root may review these records before granting one bounded capture; this reviewer has not launched a browser/GPU. Actual emitted snapshots, spatial post-pass roles, source/asset freeze, buffer digests, both pair orders and raw query timings still require independent capture review. GPU cache/driver effects and the added submissions' effect on later live workload remain limits even with exact within-pair input equality. Do not call this a shipping FPS improvement, a phone test or a proved historical FPS cause.

Final pending-accounting follow-up: run06 passes the same30 groups and explicitly verifies live pending2 before draining, then pending0 after a timed-out16-query drain has deleted those queries. `unresolvedAtDrain` retains the16 failed-drain count; timeout/discard still rejects. This checks the final helper hash above. Runs04/05 remain separate earlier passes.

## First actual capture and witnessed DoubleSide follow-up

`evidence/heat-shimmer/oil-orbit-pairs-01/report.json` remains **overall rejected**, original protocol `live-shimmer-pairs-v1`. It stopped after the first on member; no off member or completed pair exists. One normal and one diagnostic GPU query completed and were deleted. Browser/server closure and unchanged source are recorded. CDP V2 passed on529 samples, but that does not validate the failed feature experiment. The single38.278144ms diagnostic query cannot quantify a shimmer saving.

Independent full snapshot comparison found **five differences**: `identity.materials[31].version`4409→4411 and four `bufferRoles[2..5].texture` swaps. Only the version differs within the strict identity signature; stable allocations have no difference. Composer role swaps were already explicitly retained outside the matching signature. The author's `snapshot-delta.json` is an identity-only comparison, not a complete before/after diff. Our full diff and untouched raw hashes are in `heat-shimmer-first-capture-critic.json`.

The affected material is transparent `MeshPhysicalMaterial` UUID`1fcbfeda-603b-429e-a5fa-bd6ec8ce74fb`, side2, transmission0, referenced by `mast:glass` and two `static:glass` objects. Installed Three **0.169.0** `WebGLRenderer.renderObject` uses two draws for transparent DoubleSide materials with `forceSinglePass === false`, setting `needsUpdate` once before each draw and restoring DoubleSide afterward. `Material.needsUpdate` increments `version`. The installed source and shipped module contain identical `renderObject` bodies; the installed files also match the official r169 files byte-for-byte. [Primary renderer, lines1613–1625](https://github.com/mrdoob/three.js/blob/r169/src/renderers/WebGLRenderer.js#L1613), [primary setter, lines517–521](https://github.com/mrdoob/three.js/blob/r169/src/materials/Material.js#L517).

This makes the observed+2 **consistent with that renderer path**. The original capture did not record `forceSinglePass` or direct-draw events, so it cannot retrospectively prove the cause or be promoted to an accepted pair. Actual capture01 now records full Chrome152.0.7977.76, revision`0d89dfa2dd7c1ec4b8a14b9f303f887bb63b6174`, V815.2.124.19; that is process provenance for01 only.

The new separately named `live-shimmer-pairs-v2` retains raw versions and all other captured inputs. Per-member events must witness matching object/geometry/camera/group back/front calls, eligible flags, exactly+1/+2 versions, unchanged side/version during each delegated draw, and no exception. Only those witnessed increments are applied to a copy for comparison. Every other input remains equal. Previous member.after and next member.before must match literally, including raw versions. The wrapper restores the original direct-draw function; there is no global version-field omission or broad drift exemption.

Independent command:

```powershell
node tools/checkheatshimmer-adversarial.mjs --out research/heat-shimmer-critic-side-03.json
```

**57 groups pass.** The fixture executes the actual installed `renderObject` function using real Three objects and the real `Material.needsUpdate` setter. One eligible mesh produces+2 per member; two sharing the material produce+4. Negative controls reject missing, extra, reordered, null or mismatched events, wrong identities/groups, extra pre-draw increments, mutations inside a direct draw, unrelated material changes, missing raw versions and otherwise internally valid events that conceal a cross-member boundary change. A direct-draw exception remains original despite a secondary query-end failure. Standalone malformed rows return false, and the exported/page verifier bodies are checked for exact equivalence after indentation normalization. Earlier30-group query/composition cases remain included.

Reviewed follow-up hashes:

- Profiler unchanged: `436f48390bf25083d8a6105103389849ee61e83ac22714eb8b4c493dfddcbc40`.
- Helper: `ce926d88600161abaf1f29cc3481b512c8796ff58168f3d007a79d3333cef603`.
- Critic tool: `a2e87520f52c2927f66505e9c61a3155825ec8d2971ad83d71e2432e31601bd6`.
- Installed WebGLRenderer source: `5e1c9947765ee582907929a3af84831a998352b1c6522aaeac5095570e40d36f`.
- Shipped Three module: `0a3368c165eea773490aec7b77c22de70e3eac288503409256fdbf4d12578416`.
- Original failed report: `b1653921d9bc19e36d60ba14e71b6856f7489e17095cf6d4240db551628555ca`.

Verdict: the narrowly witnessed treatment is justified and passes the independent offline checks. Root must separately authorize any retry. No browser/GPU was launched by this review, no failed artifact was rewritten, and no shimmer or historical FPS cause is proved. GPU/driver/cache order and extra-submit workload caveats remain.

## Second capture: integrity passes, feature benefit remains unresolved

The authorized second recording, `evidence/heat-shimmer/oil-orbit-pairs-02`, reports valid instrumentation integrity on the exact reviewed helper`ce926d88` and profiler`436f4839`. Independent offline recalculation retained **all24 pairs**. All48 diagnostic GPU queries route to their captured live frames, completed and were deleted; the separate458 normal-render queries also completed/deleted. There are2,744 live frame rows and449 unchanged source entries. No GPU or additional tests were launched for this review.

All96 direct-draw witnesses explain only the permitted raw version increments. Every member's other captured inputs match, the boundary between members matches literally, allocation identities match, and visibility/hook/no-copy evidence is consistent. All1,409 referenced buffer tokens resolve to matching length/digest metadata. Their original byte copies are not stored in the report, so this validates the recorded digest references, not a fresh recomputation of GPU buffer contents. Every member also records the expected composer-role rotation separately. See `heat-shimmer-second-capture-critic.json` for the independent calculations and preserved hashes.

| Comparison | Count | Mean milliseconds | Median milliseconds |
|---|---:|---:|---:|
| On minus off, all pairs | 24 | +0.441259 | +1.820672 |
| On minus off, on first | 12 | −14.955520 | −17.115648 |
| On minus off, off first | 12 | +15.838037 | +21.880832 |
| Second submission minus first | 24 | +15.396779 | +20.859392 |

The second submission is slower in19/24 pairs. The order-associated differences dominate the pooled feature difference and reverse its sign by order. These measurements concern whole repeated render submissions after a normal render, not the quad in isolation. The large second-position effect is observed; its GPU/driver/cache/scheduling mechanism is **not identified**. The pooled+0.441ms is not a reliable shimmer cost or useful optimization result. No independence-based confidence interval, zero-cost conclusion, shipping FPS gain or phone acceptance is warranted.

Between pairs, rolling `clock.fps` and particle population change substantially: `loadScale`0.7974–0.9999, live particles247–1,940, depth0–147.95m. Within-pair equality controls those immediate inputs, but additional submissions affect later live pacing and adaptive workload. Do not silently discard early or inconvenient pairs to improve the result.

The60,290-sample CDP profile retains11 negative deltas and22 reordered indices; all cumulative timestamps remain within the profile bounds. Ten inversions join the same `(program)` node. Index34662 differs: node2108 precedes node2107 (`serialize`). This is another concrete reason to keep each sample associated with its own timestamp during sorting. CDP/Perfetto absolute clocks still have no demonstrated mapping.

The recorded page `performance.timeOrigin` does provide a separate epoch anchor: the live window is **14:03:53.291–14:04:38.301 UTC**. Initial concern about a1.52-second CPU check near startup was investigated rather than used to remove samples. MAIN `evidence/verification/latest/sample-conditions-author.json` records `generatedAt`14:03:21.803Z,31.488seconds before live start; its inspected writer generates that timestamp after test work and source-hash checks, then performs only report creation/write/logging. This bounds that test work before the live window. Exact process-exit time and complete system-wide quiet were not instrumented. All samples remain included.

Raw SHA-256 values:

- `report.json`: `f4f03965785453a1c79db3b11b8f7d1018cd9876fc85129d0c564cffa123fc46`.
- `cpu-live.cpuprofile`: `4dbf8cd0283b4e5a6553a71533b993e1c92b74d36ec86b9f7a8815711c22a301`.
- `trace-live.json`: `eb4dd9ccc45834db888720a7f8bd0634f8bc128255dd8a39f4bb9b7b5d0c5f47`.
- Author `paired-analysis.json`: `1499da747e278562e062e443d7dcbd2deb258ca61b6dbdd584600d5545f63b1f`.
- CPU-check completion artifact: `8dd9b7be5ad2d806b955216fa5ca65f2b927ed3887634d8bb300a0dd26fbcfdc`.

### Next experiment proposal, not executed

Use **one original `renderer.render` per game frame**, with the normal simulation/VFX update cadence. Apply and restore the shimmer visibility mask only around that original render, and time that submission; eliminate duplicate submissions entirely. Keep non-refractive/no-copy scope, accepted contracts/equipment, source/asset freeze, raw RAF intervals and explicit query ownership.

Predeclare a balanced block schedule and first run an A/A sham that performs the same scheduling/query work with shimmer visible in every block. A sham block/order difference would expose measurement or changing-workload effects before interpreting an on/off run. A separately authorized on/off run should reverse block order in a fresh canonical run, match start camera/readiness, and retain phase/depth/camera/adaptive-load observations. Analyze only predeclared common-support groups with adequate samples; if trajectories or sham behavior prevent comparison, report inconclusive. Leaving adaptive emission active measures the feature's effect in normal gameplay, including its downstream workload response; it is not pure shader cost. A meaningful shipping improvement would still need native sustained performance and visual-quality acceptance. No new code/run was started from this proposal.

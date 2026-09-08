# Piling ram adapter — independent review

**Approved for bounded source integration, subject to actual browser visual acceptance.** The candidate moves the existing `slide:hammer-ram` locally from authoritative simulator progress. It does not complete the whole piling assembly. No production source, asset, browser, Blender process, commit or push was changed by this critic.

## Reproduction

From `C:/Users/henri/Downloads/threads/drillity-pile-motion`:

```powershell
node tools/checkpilemotion-adversarial.mjs > research/pile-motion-critic-final.json
node tools/checkpilemotion-adversarial.mjs --pile-only --counterfactual > research/pile-motion-critic-counterfactual.json
node tools/glbinfo.mjs --parts public/models/piling-leader.glb > research/pile-motion-critic-glbinfo.txt
```

The first command passes. The counterfactual intentionally substitutes the pinned pre-adapter loader and rig factory for the real-simulator ram case and exits 1 with `ram must change parent-local position, not only inherit carriage movement`. This demonstrates that the positive test observes the new consumer. All source and model fingerprints are checked again after each review run.

The pinned comparison baseline is `1f2d285f54ff71b9f05dac895bee0400aa9f61f7`. Its source hashes are recorded in the JSON. This comparison is a review artifact for this narrow patch; it should not become a permanent gate that rejects later intentional rig changes.

## Evidence

- **Other 18 actual GLBs:** all 41 declared rig/method combinations, 96 frames each, compared against the pinned baseline through drilling input changes, an injected rod event, public trip action, and inactivity. Scene structure, geometry vertex counts, every local transform and every world matrix were unchanged. The event injection tests a consumer, not whether every method legitimately emits that event. This does not certify all possible machine actions.
- **Piling rig:** every non-ram scene transform was also compared against baseline during 540 actual simulator frames. There were 360 frames of live drilling after the initial pitch. The ram changed its own parent-local position; its off-axis coordinates, quaternion, scale, geometry and parenting were preserved.
- **Compound frame:** synthetic, explicitly NOT SOURCED root rotation, two leader rotations and non-uniform scale challenge the work axis. The observed world displacement equals the transformed parent-local +Y displacement. The drive cap retains its local pose. Overrange telemetry is clamped to the existing `stroke_m`; the curve peak reaches that authored limit.
- **Metadata rejection:** zero, negative, null, string and missing stroke values, plus a ram reparented away from its carriage, were injected into copies of the actual GLB JSON in memory. Strict loading/building refused each case. Disk assets were never edited.
- **Boundary reset:** invalid/missing/non-finite/string cycle progress or drop, inactive work, unsupported programmes, handling phases and a different rig method restore the authored rest position from a previously raised pose.
- **Real actions:** actual dolly change ran for 217 sampled frames, set measurement for 474, and re-drive preparation for 360. The first set produced the configured 10 samples. Sample boundaries align with the published cycle boundaries. No running phase is published during dolly change or re-drive. A second set completed the job and restored the ram; the next real job starts at cycle zero and rest.
- **Frozen simulation:** 90 positive-delta renderer updates with an unchanged real simulator state do not advance the ram or mutate the simulator clock. An actual abort restores rest. This proves the consumer does not own a second animation clock; it does not independently certify browser background/pause wiring.

The actual GLB inspected by `glbinfo.mjs` has 57 primitives, a draw-call floor only. No meshes were added by this patch. Rendered draw calls were not measured. Existing `stroke_m = 1.2` is an authored parameter, not a newly measured dimension; provenance remains in `blender/piling_leader.py` beside `RAM_STROKE`. The legacy `axis: z` extra is not used as a runtime coordinate. The Blender +Z construction, Y-up export and actual transformed-node checks support parent-local +Y for this particular adapter.

## Findings resolved before acceptance

The initial design considered `ctx.sim.state`. Inspection found that the actual simulator only exposes the internal getter as `debug.state`; the existing generic `readBeat` comment claims otherwise and silently falls back to nominal timings. The candidate avoids that trap by publishing `state.drill.hammerPhase01` from the existing impact clock. No fake `.state` object was introduced into the tests.

The actual re-drive beat does not emit blows: it is a preparation timer that reduces damage before returning to drilling. Its ram therefore rests until authoritative drilling resumes. Take-set progress uses the same phase duration and configured count as the actual sample producer.

Two intermediate critic failures were fixture issues, not source defects: the first action fixture attempted a dolly action before the initial pitch had run; the metadata fixture initially expected the builder's message to escape an existing strict-build catch. Both were corrected to exercise the actual lifecycle/refusal behavior. Only `pile-motion-critic-final.json` and the explicitly failing counterfactual are acceptance evidence; earlier JSON files preserve diagnostic history.

## Required visual case and remaining work

Before claiming visual acceptance, use a serialized, source-frozen browser session with the actual `piling-leader` GLB and the supported impact hammer. Capture close views at the bottom, rising, peak and falling phases, and a live sequence through drilling, pause, take-set, dolly change and completion. Inspect whether the ram is visible inside its frame, whether its stroke intersects the casing or disconnects visually from the cap, whether the compressed game impact cadence looks coherent, and whether its pixels remain distinguishable at portrait phone size. Measure actual rig draw calls and compare them with the same scene/camera baseline.

The reveal/dismiss easing curves come from the existing Blender-authored motion library. Their half-cycle split is presentation interpolation, not a sourced hydraulic waveform. The new consumer follows the game's existing compressed impact clock; it does not establish real-time physical BPM fidelity. Generic modulo carriage feed, independent pile penetration, cap/hammer alignment through full depth, leader ropes and missing handling choreography remain outside this ram-only approval. The generic `readBeat` state-access mismatch also remains outside this patch.

## Accepted fingerprints

```text
7bdb70a2b65ed04f73f3ebc39ef48fb3590768e959d3f8f887cfbd21c87db106  src/core/gltfRig.js
5d85418cf093db3f14371931b79317395826b751b1d0ea91c0c3f651d28d7cf9  src/rig/rigFactory.js
735e51292a155226f1d46271588ad20d3cda0e46a6f199dc8650eefe5de9ba64  src/sim/drilling.js
83131fb56d9e329b60d09a65972afad7ec6d076227b9915021ad2963a9cc545c  src/core/motion.js
28182f3126789d34ff671f7c16ad36ff1f635eb96629975f2e5044315d5eebc7  tools/checkpilemotion-adversarial.mjs
6a96b56031e3f8f05214940ed746de27dac9543382d51e505b543cd366daa5bd  public/models/piling-leader.glb
```

# Mechanism action audit — 2026-09-08

**The actual GLBs have basic motion, but the specialised procedural mechanism records do not reach them.** This run strict-loaded all **19 actual GLBs**, built all **42 declared rig/method pairs**, and observed **226 named pivot/slide joints** through real public event, API and phase consumers. **35 distinct joints changed their local transforms** in the sampled actions. The other 191 were locally unchanged in these samples; this is not a requirement that every support leg should move while drilling. All 19 files have zero clips, but the measured carriage/spindle/mast movement proves why clip count alone is an invalid animation audit.

CPU observation time: **2026-09-08T11:11:41.481Z**. Only this report and the unique audit tool were written in the integration tree. No production source, asset, physical constant, browser or Blender process changed as part of this audit.

## Reproduce and interpret

From the integration worktree:

```powershell
node tools/auditmechanismactions.mjs
node tools/auditmechanismactions.mjs --rig piling-leader
```

The tool emits JSON to stdout, fingerprints all consumed source and model files, and rejects changes during measurement. It uses the actual strict production GLB loader and `createRigSystem`, never the procedural fallback. It captures named nodes before runtime tooling injection. Each node's local transform and world matrix are sampled on every frame, and finite matrices are required. Scene-visible mesh presence means a visible parent/material chain with geometry; it does **not** prove unoccluded rendered pixels or acceptable motion quality.

Synthetic **NOT SOURCED test inputs**: fixed 1/60-second updates; normalized controls; depth advance from 0.2 through approximately 1.2; a 3-unit trip request; injected published event payloads and method phases; example hammer BPM/drop telemetry. These exercise renderer consumers, not real simulator progression, capacity or calibrated physics. The complete JSON labels this boundary.

`ROD_ADDED` is deliberately injected for every pair to inspect the public event handler. This does not claim every method can legitimately emit it: the real simulator refuses a rod-add on cable-tool and produces `BAILER_RUN` instead. Phase samples use the actual published strings. Mobilisation, full-depth collision/clearance, actual rod completion timing, GPU visibility and pause integration were not measured here. The diagnostic exits zero when the audit ran correctly even when it identifies missing consumers; it must not be advertised as a completed-animation quality gate.

## What actually moves

C = `slide:carriage`; S = `pivot:spindle`; U = `pivot:mast-upper`. “Other joints” identifies locally unchanged mechanisms, or explicitly notes absent authoring. A node may move in world space solely because its parent moves.

| Rig | Named joints | Locally changing in sampled actions | Other joints / boundary |
|---|---:|---|---|
| bolter | 17 | S, C | boltIndex, carousel, boom and roof mechanisms |
| cable-percussion | 6 | C | tool/tooling drums, sheaves and clutch |
| cfa-rig | 10 | S, C | augerCleaner, sheaves and mast cylinders |
| core-rig | 12 | S, C | rodrack, wireline/main winches and sheaves |
| cpt-unit | 5 | C | four jacks; clamp jaws are merged geometry, not named joints |
| crawler-lite | 2 | C | mast deployment is mapped but was not exercised here |
| crawler-th | 14 | S, C | rod-arm, rod-carousel, feed/boom articulation |
| dth-crawler | 14 | S, C | carousel, rodArm, dustHood and boom articulation |
| foundation-bg | 7 | S, C | kelly-2, kelly-3 and kelly-4 telescope stages |
| hdd-rig | 11 | S, C | rod-loader, vice and slide:string |
| longhole-rig | 17 | S, C | carousel, rod-arm and fan/index articulation |
| oil-derrick | 4 | U, S, C | pivot:rotary; no mapped connection/slips record |
| pd55 | 23 | S, C | slide:hammer, mast, sheaves and winches |
| piling-leader | 23 | C | hammer-ram, pile, drive-cap, winches and leader articulation |
| raisebore | 2 | S, C | no additional pivot/slide hooks beyond the two driven nodes |
| rc-rig | 11 | S, C | rod-arm, gripper, head-swing, cyclone-arm and sample-hose |
| si-rig | 9 | C | spt-hammer, hammer-swing and mast-dump |
| sonic-truck | 9 | U, S, C | mast-dump and jacks; no separately named oscillator joint |
| tunnel-jumbo | 30 | S, C | boom-r-carriage, boom-r-spindle and all setup articulation |

The generic spindle mapping is not present on crawler-lite, cable-percussion, CPT, piling-leader or SI. Absence of a rotary spindle is legitimate for some of these methods and is not itself a defect. A moving spindle node also does not prove every intended authored rod is parented to that spindle.

The loader's `makeDyn()` maps mast deployment, an optional upper mast/flex joint, carriage with declared travel, and spindle. It also publishes the named-node maps. None of these actual GLB builds publishes `carousel`, `loader`, `connection`, `pileHammer`, `spudder`, `bailer`, `sptHammer`, `cptPush`, `pushBreak`, `oscillator`, `jumbo`, `ringFan`, `boltCycle` or `rcSample`. Those fields are what the specialised functions in `rigFactory.js` read. A preserved named joint is therefore not automatically a working mechanism.

CFA already has a dedicated `continuousAugerFeed` mapping. This audit does not revoke the existing real-simulator CFA feed/withdrawal evidence in `tools/checkcfafeed.mjs`. The old “no CFA return state” paragraph in `research/CFA_FEED_MOTION.md` is stale relative to the current gate and simulator; current source wins.

## Action findings

- **Rod handling and trips:** all sampled rod events reach the public handler. With neither `carousel`, `loader`, `connection` nor `pushBreak`, GLBs enter the generic carriage-only rod sequence. The rods/arms/clamps/carousels remain locally unchanged. Spindles may continue their ordinary drilling rotation; that is not evidence that a rod was picked, stabbed or made up. Trip-out also moves the carriage without proving a connected string or rack handling.
- **Driven piling:** on `piling-leader`, only the carriage translates during ordinary drilling. `slide:hammer-ram` and `slide:drive-cap` follow it in world space but never move relative to their parent. `slide:pile` remains stationary. With depth held fixed, sampled take-set, dolly-change, pitch and re-drive phases move no named joint. On `pd55`, spindle/carriage movement exists but `slide:hammer` has no independent stroke. The current generic feed branch also uses a 3-unit modulo because neither GLB supplies `pileDriven` or `rodLen`; this is not continuous pile penetration.
- **CPT:** carriage movement and dissipation stillness are real. Calling dissipation stillness a missing animation would be wrong. The advertised upper/lower clamp alternation has no GLB consumer, and the current Blender CPT authoring merges its clamp jaws into fixed/crosshead meshes rather than exporting separate clamp joints. Mapping a fictional clamp name cannot repair that.
- **Cable-tool:** the carriage translates, but the clutch, drums and sheaves do not. The bailing-run phase produces no local or world motion of the named joints. The actual model is a GI tripod; the procedural `spudder`/`bailer` cycle cannot simply be grafted onto it. Its existing machine-family mismatch remains a prerequisite for choosing the right choreography.
- **Sonic:** spindle rotation, carriage feed and upper-mast flex are present. The head has force/frequency capability extras, but neither an oscillator record nor a separately named oscillator joint. The published 222/150 values are capability metadata, not a sourced displacement waveform. Reusing the procedural `sin(t*78)*0.004` expression would invent an animation calibration.
- **Underground:** the jumbo's first feed/spindle move; its named second feed and second spindle remain locally unchanged. Charging/firing/mucking correctly stop the sampled drilling joints, but setup/retraction choreography is absent. Longhole ring-index stops spindle rotation without moving the fan/boom joints. Bolt phases can modulate the generic spindle; they do not drive bolt-index, carousel or installation geometry.
- **Oil/RC:** ordinary feed and spin work. The oil rotary-table joint is not mapped to the procedural connection mechanism. RC blow-down has no `rcSample` consumer, so the dedicated feed/blow-down/sample-hose sequence is absent. Parent motion alone cannot prove hose deformation or sample handling.

`gltfAnim` exists and updates after continuous drivers. The only explicit `.anim.play` source call found is the optional title clip in `main.js`; rod/method gameplay handlers do not currently schedule an authored clip. Exporting clips alone would therefore not establish a working gameplay consumer.

## One next implementation: piling-leader impact adapter

**Choose the supported `piling-leader` / `driven-pile` ram first.** It already has an independently preserved visible ram mesh, a declared stroke, and a simulator which publishes the actual hammer setting. This has fewer unknowns than inventing sonic displacement or rebuilding CPT clamps.

Exact authored chain:

```text
pivot:leader-rake-side
├─ slide:carriage
│  ├─ slide:drive-cap
│  └─ slide:hammer-ram   (one authored scene-visible mesh; stroke_m = 1.2)
└─ slide:pile
```

`blender/piling_leader.py:1109` creates the ram; its `stroke_m` comes from `RAM_STROKE` at line 220, whose adjacent provenance cites the hammer brochure. **This audit reads that committed artifact; it does not independently reverify the brochure or introduce a new machine dimension.** Its old `axis: z` extra is a Blender-space label. The loader explicitly warns not to interpret that field as a glTF parent-local travel axis. Inspect/reproduce the export frame or add the established explicit parent-local travel metadata in Python; never turn `axis: z` into an assumed runtime direction.

Implementation files: a narrow machine-specific binding in `src/core/gltfRig.js`, a guarded ram consumer in `src/rig/rigFactory.js`, and a narrow authoritative phase publication in `src/sim/drilling.js`. Consume `state.drill.programme`, `active`, `phase`, `hammerDropM` and actual beat/pulse progress. Do not derive a second energy/rate model from sliders. Use authored motion curves for presentation interpolation and label their role separately from physical stroke/rate. Independent implementation review found that the existing `readBeat()` access to `ctx.sim.state` is stale: the actual simulator exposes `debug.state`, not `state`. The new consumer must use deliberate public telemetry rather than emulating that nonexistent API in a fixture.

**Do not simply attach `dyn.pileHammer` and invoke the old procedural implementation unchanged.** It writes absolute carriage Z shock, assumes Y-local ram travel and runs dolly/pile handling that assumes different parenting. The GLB has a sibling pile, while the procedural dolly helper cancels carriage travel on its pile. Blind mapping would introduce new alignment errors. Preserve every off-axis rest transform, current work rake and mesh identity. A ram-only patch is bounded and useful, but is not a completed pile-driving assembly: the generic modulo feed and independent pile penetration remain explicit follow-up defects.

Acceptance for that bounded patch:

1. Actual strict-loaded ram local motion follows authoritative impact activity/settings and authored stroke limits, while its existing parent chain and geometry stay unchanged.
2. New job/rig changes reset cycle state; idle, pause, job completion, pitch and dolly-change cannot keep advancing an impact. Take-set uses its actual counted cycle. Re-drive is a preparation timer with no simulated impact stream, so its ram must remain stationary until actual drilling resumes.
3. Actual simulator-driven coverage proves the live path, alongside synthetic boundary tests. A counterfactual with the new binding removed must fail the motion assertion.
4. The other 18 GLBs retain their existing transforms under the same input sequences, and the procedural builder is unchanged.
5. Before calling it visually accepted: a serialized real-browser capture shows the ram at several phases, no clipping/disconnected cap, and no new rendered draw calls. No such capture is claimed here.

The existing single-machine regeneration procedure is ASTRA §4.3: import `piling_leader` with both `blender` and `blender/lib` on `sys.path`, then call `piling_leader.build(<worktree>/public/models/piling-leader.glb)` inside Blender. Use the hyphenated destination; directly executing this module's current `__main__` writes the obsolete underscore spelling. This audit did not regenerate any asset. For any later geometry dimensions use only `tools/glbinfo.mjs`; for preserved exported contracts use `tools/rigopt_contracts.mjs`.

## Fingerprints for this observation

The reproduction command emits the full source/asset identity set. This snapshot preserves it even after subsequent integration changes:

```text
90e0f5a47911ef2acc8542f03ef34fbfc9dfc9a4fd1a0748a7c58004e43fc25b  src/core/gltfRig.js
31317fa07cdfc9fd9e138cdfb776922c285941b75bb1c1e63822992a9e4693d1  src/core/gltfAnim.js
4a23fea28cc4f45171ded9af6942fcb33ef2d301ff1d9a40211b41dd9cd1d91e  src/rig/rigFactory.js
1821620eee32c105c9966d762d143ecc6fc14705adb71a34476970ab06d9c32b  src/rig/tools.js
dfb40a897139a7a67fc9d62a2d17a473096a51f42513becca6e3391767e3cf53  src/core/contract.js
0684cac453e80e70036ca34fb661226ca4798d9069c7d6c98413df03bf54cb2d  src/game/data.js
67a679d77f409c2d3cba934334c9060c29705a2d78ba20f5b83d3c68351e343d  src/sim/drilling.js
b338acab39c6c683d9c6dc56519b80fa22450c871494a7593c723766bf254336  src/main.js
d5cf836b492d1a6d4a622b5387e423fb3131f3f6f7be7d8083082100645252b8  tools/auditmechanismactions.mjs
b162741a7e6f032a3a3e817e4b33125069f70b9ed7d3f54a8cddaf371d7a8ed5  blender/lib/rig.py
bb5b22ab0d8c7e8c65a30a281f09a672a91cf576aff08309946f779c479c9daf  blender/piling_leader.py
f50f7daed4749e5276e726bd1e7efff0c9f97425d930a77cc0a2e0843d1abb97  blender/cpt_unit.py
c6f076958e70c031527d17e9d65d0204727097f45e8c20c1adea07b5730adc5c  blender/sonic_truck.py
42a1442ccb51c220e9f8bd878a99cae93dd052ca1d831adf4d16c713b70a5856  blender/cable_percussion.py
527c787a56415e70ad95ff8516c3886c9fc07fa4f4fcf750f9e2e175c06ef646  public/models/crawler-lite.glb
f68d71596f4dc0ec2b66929629bba85525f6e8ccb0fbf71f8e5f1c44b8ed6106  public/models/cable-percussion.glb
58175e8ae042856225b435f9476dca99d94a15048d609973b4cffe0c42ac721d  public/models/crawler-th.glb
f0c5f8d6fd1c0238ee776336871e6698e5e078be2e4fe06daccacfc215232133  public/models/dth-crawler.glb
7c4dd62969d71a1a6e30275fa870b14797b6fd6175e43d10260f474077a0e768  public/models/core-rig.glb
9d91db06bd51226cab57200c04886aed43388d17056762040b1ec5adc6ba8331  public/models/foundation-bg.glb
a10c16b3071c96926077271c1d8785637951989d082d9a3f5e1f5e2bf4bf7b35  public/models/cfa-rig.glb
43d3275ae9355bd5afeff9a09db18b74f40a1870ddb0668a6a1ee8c7e874323a  public/models/oil-derrick.glb
5207f3018a23d7fbc0507e7d569c6198a5cd864f920c4ed229ccf3e012adec11  public/models/hdd-rig.glb
f9c5438581f43adbcdd04f8b04ee579c3c4353e45c6f60e289226d6407cc6763  public/models/sonic-truck.glb
302cb3ca36594ce5d8cd1b1cc3fc44d35758fe6c0b53c023a9851899f0669cc6  public/models/rc-rig.glb
4059aaa715b389aa641b5a75256dece9ee48ab342e50b9de7484a9beaf1f6094  public/models/tunnel-jumbo.glb
1ad4ea071c94ec27a72ccf974b41481472a21a6e54945027d31a91639c96fcab  public/models/longhole-rig.glb
c3a29ca8d6da32eb87f39f8e207ebd3d3aa8da1685f50cb71708d89f0e32ed23  public/models/bolter.glb
6a96b56031e3f8f05214940ed746de27dac9543382d51e505b543cd366daa5bd  public/models/piling-leader.glb
e43cd487927282f9a591b0edf11f36a83a43ae7f7917763d88ed2c9f1f17201d  public/models/pd55.glb
17730b4a958137a6890eee86115972811a4a1aebfacd8548be2360092bb4b729  public/models/si-rig.glb
f7858631bba0ead922fe04563813b829b6de3d3376714ee2c1306afce4bab0cb  public/models/cpt-unit.glb
22107d2d616d1ab64e29de6055deffa26a5f693ecf39fb05c1527bb958f452a5  public/models/raisebore.glb
```

# Underground work-light binding reproduction

Baseline `beedaaf`, private `codex/underground-light-bindings`. This gate loads the
four actual GLBs through `createGltfRigs`, creates the public `createRigSystem`,
and runs the actual `createEnvironment` source. It never starts a browser,
renderer, server, or GPU session, changes models, or measures machine dimensions.

## Causal findings

The exact root warning survives a completed, correct machine switch. The test
first updates a raise-boring/raisebore scene, changes the contract and directly
calls `rig.setRig('tunnel-jumbo')`, then updates twice. No update is interleaved
between the contract and rig assignments. Both snapshots report active
`glb:tunnel-jumbo`, yet the environment spots retain the previous raisebore
mounts and print:

```text
[env] ugFloodL: no work light named "boom-l-lamp-0" on this machine. It publishes [table-work-light, feed-work-light]. Falling back to the ordinal — the beam is on SOME lamp, not the right one. Fix the name in undergroundRig(), or the model.
[env] ugFloodR: no work light named "boom-r-lamp-0" on this machine. It publishes [table-work-light, feed-work-light]. Falling back to the ordinal — the beam is on SOME lamp, not the right one. Fix the name in undergroundRig(), or the model.
```

`env` caches the array until `RIG_CHANGE`; public `setRig()` changes the active
array without emitting that event. Reversing rig/contract assignment order still
fails. The event-based control binds both actual jumbo booms immediately. Thus
fixture ordering is not necessary for this stale consumer failure. Root's
`checkinstrumentgradebrowser.mjs:32` calls `startDemoContract` then direct
`setRig`; its ordering may expose the problem, but cannot alone explain it.

Independently, `data.METHODS` permits three rockbolt rigs. Fresh legal
rockbolt/longhole-rig and rockbolt/tunnel-jumbo contexts warn because the
method-only binding asks for `feed-work-light`, then puts the key on a tramming
lamp. These are steady-state errors unrelated to transition setup.

| Case | Baseline observed binding | Required corrected binding |
|---|---|---|
| rockbolt + bolter | feed-work-light | unchanged |
| rockbolt + longhole-rig | tram-r-0 | feed-head |
| rockbolt + tunnel-jumbo | tram-f-00 | boom-l-lamp-0 |
| tunnel-jumbo + tunnel-jumbo | both boom lamps | unchanged |
| longhole + longhole-rig | feed-head | unchanged |
| raise-boring + raisebore | table-work-light / feed-work-light | unchanged |
| Direct raisebore → jumbo | previous raisebore nodes, repeatedly | live jumbo booms |
| Same switch with RIG_CHANGE | live jumbo booms | unchanged |

Rockbolt's second flood is an authored platform fill and stays unbound. Low
quality deliberately omits the second flood; every steady pairing is checked
at low, medium and high. The first exploratory test incorrectly assumed low had
two floods; this fixture was corrected before freezing evidence.

## Reproduction and evidence

```text
node tools/checkundergroundlightbindings.mjs --baseline
node tools/checkundergroundlightbindings.mjs
node tools/checkundergroundlightbindings.mjs --baseline --diagnose
node tools/checkundergroundlightbindings.mjs --json
```

`--baseline` executes `git show beedaaf:src/core/env.js` in memory, rewriting only
import specifiers to absolute URLs. It never replaces production files. Other
modules and GLBs are current private-worktree bytes, hashed in each JSON report.
Default output is compact and exits nonzero on assertion failure. `--diagnose`
prints full observations without asserting corrected bindings; diagnostic exit
zero is not a binding-pass verdict.

Frozen baseline: **18/29 pass, 11 fail**, exit 1. Full observations:
`.bak/underground-light-bindings/before.json`; compact verdict:
`.bak/underground-light-bindings/before-verdict.txt`. Both are private preserved
evidence. Original baseline worktree env SHA-256 was
`05fe543057ed850f4ee4624dea81a7c4efd373ce92324ee4aa35c400e4ed800b`;
Git's LF blob is `545e6105aa262ac7fef66b9c35acd24e7f31918bbee7d155c95a2263a45ae7d9`.

Selected actual world positions, metres (measured node transforms, not a second
dimension ruler): stale direct-switch L `(1.950000048,1.620000005,1.25)` / R
`(0,3.174800048,-0.839999974)` remain the old raisebore. Event-control jumbo L
`(-0.744290223,1.080000043,-4.429320826)` / R
`(0.434714984,1.080000043,-4.445544559)` are its live boom mounts.

At synthetic control actionDepth `0.75` (NOT SOURCED, not a new dimension), the
actual public raisebore carriage update moves its lamp Y from `3.174800048` to
`2.952500048`, and aim Y from `2.174800048` to `1.952500048`. The test also rotates
actual lamp parents and independently moves actual aim nodes on all four GLBs
and both legal alternate rockbolt rigs, checking that env follows both positions
without replacing the publisher array. These are synthetic transform probes,
not claims about the simulation's full choreography.

| GLB | Bytes | SHA-256 |
|---|---:|---|
| bolter | 2323400 | c3a29ca8d6da32eb87f39f8e207ebd3d3aa8da1685f50cb71708d89f0e32ed23 |
| longhole-rig | 1258704 | 1ad4ea071c94ec27a72ccf974b41481472a21a6e54945027d31a91639c96fcab |
| tunnel-jumbo | 1335616 | 4059aaa715b389aa641b5a75256dece9ee48ab342e50b9de7484a9beaf1f6094 |
| raisebore | 2334416 | 22107d2d616d1ab64e29de6055deffa26a5f693ecf39fb05c1527bb958f452a5 |

Runtime source hashes in baseline JSON: `gltfRig.js`
`90e0f5a47911ef2acc8542f03ef34fbfc9dfc9a4fd1a0748a7c58004e43fc25b`;
`rigFactory.js` `4a23fea28cc4f45171ded9af6942fcb33ef2d301ff1d9a40211b41dd9cd1d91e`;
`data.js` `3c442ae7e9ea4a15773e6225de6f0303acaa33e5f06a7bb4936d74a8e33d0b3b`;
`contract.js` `dfb40a897139a7a67fc9d62a2d17a473096a51f42513becca6e3391767e3cf53`.

## Limits

This is CPU evidence of loaded node contracts, binding choice, live mount/aim
consumption and preservation of cone/range/colour. It is not illumination,
shadow, shader, visibility, performance, or GPU acceptance. The harness normally
updates rig before env to establish consumer read-after-pose behavior; production
main registers/updates env before rig. Whole-frame synchronization and a possible
one-frame pose lag are not certified here. Renderer/geology/terrain and source
light characteristics remain outside this reproduction's ownership.

Candidate: **29/29 pass**, exit 0, against env SHA-256
`ce598171084bdd32829910463083e7991b04de585b1387aa09eb2d69b58c739d`.
The direct switch now places both floods on the same live jumbo nodes as the
event control; all native pairings retain their bindings and published
cone/range/colour. Full after evidence is
`.bak/underground-light-bindings/after.json` (SHA-256
`de9c02090e32a220efc72c707ca6211b3c29710980341d4a0aa3a9444c7d954e`).
Frozen before JSON SHA-256 is
`b1a3ced5a97e583289eb2189f21314013f3354f0696e7e60dbc25949e8bf59c5`.

The same final harness produced both files. An intermediate harness initially
omitted `data` from `createGltfRigs`, publishing empty `getSpec().methods` unlike
production main; this fixture omission was corrected, and both baseline and
candidate evidence regenerated. No production change was made to accommodate
that fixture. Independent adversarial review is delivered separately.

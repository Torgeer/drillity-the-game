# Underground work-light binding adversarial review

2026-09-06. Private baseline `beedaaf`, branch
`codex/underground-light-bindings`. Review scope: `src/core/env.js` work-light
selection/binding only. No production files edited by this reviewer. Owned files:
this report and `tools/checkundergroundlightbindings-adversarial.mjs`.

## Verdict

The reviewed candidate resolves the reproduced stale publisher and legal
alternative-rig binding failures. Independent CPU checks pass **25/25 cases,
209 assertions**. The reproduction worker's separate actual-GLB consumer suite
was inspected and independently rerun: **29/29 cases pass**. No remaining
blocking finding in this narrow consumer patch. This is not rendered acceptance.

Final reviewed `env.js` SHA256:
`5cf8bc01192d9686aefd1f5905b9863c92d9bd3a09a75723a0cd503862d7b886`.
Tests executed on `ce598171084bdd32829910463083e7991b04de585b1387aa09eb2d69b58c739d`;
the final change corrects only the historical bottom-of-file `followAt` comment.
That comment was inspected; executable code is unchanged and tests were not
repeated solely for it.
Independent test SHA256:
`afb4a111ecf27d173d110c5461f05c3488ef1140c624f494029c36ccac57c821`.
Baseline `env.js` Git-blob SHA256:
`545e6105aa262ac7fef66b9c35acd24e7f31918bbee7d155c95a2263a45ae7d9`.

## Reproduction and causality

Run from the private worktree:

```text
node tools/checkundergroundlightbindings-adversarial.mjs --baseline --json
node tools/checkundergroundlightbindings-adversarial.mjs --json
node tools/checkundergroundlightbindings.mjs
```

The baseline run intentionally exits 1: **7/25 pass, 18 fail**. `--baseline`
reads `git show beedaaf:src/core/env.js` into memory and rewrites import paths
only. It never rewrites production. Both baseline and candidate consume the
same read-only current GLBs through `createGltfRigs`, `createRigSystem`, and
`createEnvironment`. Fetch is restricted to the four enumerated local binaries.
No renderer, browser, model export, or dimension CLI is involved.

The exact reported warning pair is reproducible after **three coherent steady
environment updates**, following a direct public `setRig('tunnel-jumbo')`
after raisebore has populated the environment cache. The real active rig
publishes jumbo lamps, but baseline environment retains the raisebore array:

```text
ugFloodL: no work light named "boom-l-lamp-0" ...
It publishes [table-work-light, feed-work-light]. Falling back to the ordinal ...
ugFloodR: no work light named "boom-r-lamp-0" ...
It publishes [table-work-light, feed-work-light]. Falling back to the ordinal ...
```

At that settled state, baseline left-flood world x is **1.9500000476837158**
(the former raisebore table mount), while the active jumbo work mount is
**-0.7442902233471885**. These are exact fixture observations, not physical
dimension claims. Baseline listens only for `EVENTS.RIG_CHANGE`; direct
`setRig()` and the real `rig:model-ready` subscriber both use `show()` without
that event. The late-source test starts the actual procedural jumbo, emits
`rig:model-ready`, verifies `source` really becomes `glb` and array identity
really changes, then checks the real GLB mounts. Baseline fails this path too.

The current root `tools/checkinstrumentgradebrowser.mjs` was read without
modification. Its sequence awaits `startDemoContract`, then calls direct
`rig.setRig`, and later waits 70 animation frames. A deliberately method-first
CPU transition also recovers only with the candidate. Therefore transient
fixture ordering can expose the warning, but cannot explain away persistent
baseline stale ownership; a production fix is justified independently.

Separate steady-state failures exist for both legal rockbolt alternatives,
read from the actual method data. The longhole machine's baseline key uses
`tram-r-0`; the jumbo's uses `tram-f-00`. The candidate uses their live
`feed-head` and `boom-l-lamp-0` work contracts. The rockbolt second flood remains
the authored platform light, with unchanged position, target, colour and power.

## Adversarial coverage and review findings

- Valid actual raisebore/jumbo/longhole/bolter contracts, all three legal
  rockbolt machines, direct/cached A→B→A switches, unchanged-method swaps,
  deliberately method-first transitions, same-ID late GLB replacement.
- Live mount ancestry and aim changes after binding; world origin exactly zero
  remains valid. The reproduction suite separately drives actual carriage feed.
- Missing and duplicate descriptors, missing aim, nonfinite coordinates,
  coincident mount/aim, repair and rebound, missing/empty method metadata,
  ambiguous profiles, and a partial specific profile competing with a complete
  generic one. These are deliberate runtime mutations, not shipped GLB defects.
- Failed binding restores exact authored position, aim, cone, range, colour and
  watt scaling. It neither retains stale source optics nor chooses another
  array ordinal. Diagnostics remain present for invalid contracts.
- Day/underground transitions restore/hide the sun and rebuild bindings;
  LOW retains exactly four direct underground spot/point lights.

Source review confirms the semantic name pairs are the existing method contract
consolidated into one helper, not another per-rig name list. Actual built
`spec.methods` and live lamp membership select one unambiguous contract; the
site still owns its lighting solve. Geometry constants, lamp characteristics,
shadow budget and platform roles are unchanged. No production fallback warning
is merely suppressed.

An initial candidate test fixture omitted `data` from `createGltfRigs`, causing
empty `spec.methods` and false test failures. The fixture was corrected to match
the real main context; no production change was requested for that fixture bug.
The final tests include explicit missing-metadata cases separately.

## Actual binary provenance

| GLB | SHA256 |
|---|---|
| raisebore | `22107d2d616d1ab64e29de6055deffa26a5f693ecf39fb05c1527bb958f452a5` |
| tunnel-jumbo | `4059aaa715b389aa641b5a75256dece9ee48ab342e50b9de7484a9beaf1f6094` |
| longhole-rig | `1ad4ea071c94ec27a72ccf974b41481472a21a6e54945027d31a91639c96fcab` |
| bolter | `c3a29ca8d6da32eb87f39f8e207ebd3d3aa8da1685f50cb71708d89f0e32ed23` |

## Honest limits

This private renderer is baseline `beedaaf`, older than root's uncommitted
renderer work. No headed/GPU lease was requested or used. No screenshots,
frame synchronization, illumination appearance, draw calls, FPS, or final root
integration are certified. Main registers/updates environment before rig; the
existing frame order is unchanged. CPU tests establish that whenever the
environment updates, it consumes current live node transforms, not that both
systems update in a newly synchronized order.

The actual procedural jumbo publishes older `boom-1-work-light` /
`boom-2-work-light` names. The candidate reports that missing semantic contract
and uses authored placement until the GLB arrives. It does not claim to repair
those publishers or recreate ordinal compatibility. Duplicate-descriptor tests
operate at the environment boundary; the upstream loader indexes raw named
nodes in maps, so this review does not certify duplicate raw GLB node detection.
Nonfinite optical metadata, malformed non-array API returns and arbitrary
throwing publisher methods are outside these measured real binding failures.

All scenes/resources owned by the CPU harness are disposed. No model/junction,
root-checkout, Git index, server or other person's work was changed.

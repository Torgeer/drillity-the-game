# Accepted auger ground, actual rescue completion — 2026-09-08

Candidate: `drillity-next-rescue-geology`, detached at `a47de8a6ba199eabb108da447cd660f01c1735e7`, overlaid from the immutable `resume-70-baseline-2026-09-08` snapshot. `rescue-geology-dependency.json` records all 300 dependency identities. Parent owns MAIN/integration; this candidate contains no commits, GPU sessions or generated assets.

## What was actually wrong

`economy.emergencyContract()` advertised topsoil 0–0.5 m, clay 0.5–3.5 m and silt 3.5–8 m. The real `CONTRACT_ACCEPT` consumer in `world/geology.js` regenerated the generic Nordic recipe and ignored that column. The simulation used that real service and could encounter its on-hole boulders. Previous €400 recovery tests without a geology service proved accounting conditional on completion; they did **not** prove real-world completion. The old finite-controller stalls are observations, not proof that every player would find the job impossible.

The ordinary-career author independently found the same mismatch on soil-only auger tenders. Parent extended this shared seam only to accepted ordinary auger jobs whose complete advertised column consists of existing soil IDs. Career proof and its independent review belong to the separate career task; this report's author success numbers below concern the canonical rescue.

## Narrow source change

Only two production files differ from the frozen snapshot:

- `src/game/economy.js`: the Nordic rescue explicitly selects the existing compatible `urban-plot`, surface plane and auger flush medium. Canonical recognition permits these three derived descriptors to be absent in older rescue snapshots, but rejects wrong supplied values. Workload, payout, dimensions and costs remain the existing values.
- `src/world/geology.js`: the actual progression acceptance/restoration event can capture a private, immutable soil column and physical context. It must carry the exact live contract and run identity. A later `generateProfile()` must carry that same reference while its run is still active and match region, application, method, mode, raw target depth, seed, diameter, normalized difficulty and commodity/confidence. Direct `groundSpec` inputs and detached event payloads cannot select a mission column. Rescue recognition additionally requires the full canonical economic/workload identity and Nordic region.

Ordinary recognition is limited to topsoil, clay, silt, sand, gravel and till, intersected with existing auger validGround and actual method/region/application site compatibility. Known finite positive, continuous top/bottom contacts must cover exactly the target (1e-8 floating-point tolerance). The derived `thickness` field is not geometry: `data.trimColumn()` deliberately floors it to 0.5 m. Marl/chalk and mixed-rock columns are outside this repair.

The accepted interval uses existing GROUND properties. Its contacts and target boundary remain distinct even when regional till continues below, preventing the default same-material merge from reintroducing tail boulders into the job. The actual region-generated tail remains below target. Tail clasts, cavities and joints whose envelopes reach back into the promised interval are excluded. For targets below 6 m, the raw accepted target remains the work boundary while the regional generator retains its original minimum extent and reserve. Unselected generation follows the existing calls and RNG order.

This is **game-authored mission stratigraphy, NOT SOURCED real survey measurements**. No new geological survey, physical dimensions, material strengths or real prices are claimed. In particular it does not assert that all Nordic ground consists of those beds, or place a land auger on an offshore platform.

Existing ordinary `progression.acceptContract()` accepts structurally valid caller-supplied work orders and does not issue a separate generated-board provenance token. The new seam proves an actual accepted, validated work order, not cryptographic provenance from the board factory. It does not change that acceptance policy.

## Author evidence on the composed source

Run from this candidate:

```powershell
node tools/checkrescuegeology.mjs --canvas-root=C:/Users/henri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas --report=research/rescue-geology-author-composed-final.json
```

The Canvas package is an explicit CLI/environment dependency; alternatively install `@napi-rs/canvas` where Node can resolve it or set `DRILLITY_CANVAS_ROOT`. The tool contains no user-specific default path.

The test runs the real `geology.init()` with native CPU Canvas, then the production initialization and update order for geology, simulation and progression. It accepts the displayed canonical rescue through the real API, starts all three actual holes, supplies fixed public control inputs and lets the actual fixed-step physics produce each completion. Depth, grade, completion events and settlement are not injected. Fresh starter inventory remains unchanged at acceptance; cash is reduced to zero to exercise the broke-career case. There are no QA wealth or equipment grants.

Result on frozen world source `faeb7e7b14af50f16b9905adba1efae7fb6cf754afa1894a8ce10c8a93466e88`: all three holes reached 8 m, grade B, 48.7 simulation seconds each; cash **€0 → €453** (€1,271 earned less €818 running costs; no recovery top-up needed on this route). The actual column matched the advertised three beds and the shared profile identity stayed unchanged across all three holes. Running-cost events were negative and the total event ledger reconciled with cash. Replaying the final completion paid nothing. `rescue-geology-author-composed-final.json` contains each receipt, cost item, money event and source hash.

This is actual CPU world-service/physics evidence. It is not a WebGL screenshot, browser interaction test, real phone run, or proof that every loadout or input strategy completes. The author route used the existing fitted starter auger throughout. Independent worn-tool coverage must distinguish that supported tool from the separate game's emergency `_spare` fallback policy.

Existing focused regression commands passed on the composed source: `node tools/checkrescueviability.mjs` (7 groups / 432 accounting scenarios), `node tools/checkrescuestart-adversarial.mjs` (21 cases) and `node tools/checkrescuehome-adversarial.mjs` (36 cases). The older viability simulation still uses its no-geology fallback; those tests remain economic/start/provider regressions. The home run did not supply a frozen baseline and explicitly reported `exact frozen baseline: false`; it does not prove byte-identical old card metadata after the intentional new site descriptors.

Historical files `rescue-geology-author-01.json`, `-02.json` and `-composed-01.json` preserve earlier source snapshots; only the explicitly hash-pinned final report applies to the final author run. The critic's early `rescue-geology-critic-baseline.json` was a candidate/harness probe, **not** old production before-evidence. Independent final review artifacts record their own exact source and test identities.

## Independent composed review

The rescue critic passed **14/14 groups**, with `sourceUnchanged: true`, in `rescue-geology-critic-final.json`; its test SHA256 is `192fca1e5e2ca82fae43de87a9f33dc7faa8800c0677993eb0c2950c176b3e73`. Besides matching the author starter route, it completed all three holes with the existing typed auger at worn rig/bit/rod conditions 0.4/0.5/0.5, preserving reported tool fit. A slow real D-grade route completed at 158.8, 158.8 and 154.5 seconds with public jam-rescue actions: its raw net was −€148 and the existing final-only €548 support brought cash to **€400**. This is actual-geology completion evidence for the existing recovery floor, not a manually injected settlement fixture. Legacy restore/completion, spoofed/retired identity and partial-delivery controls also passed. Its 25 unchanged-generation controls compare the frozen old world source; these controls deliberately exclude the newly authorized ordinary soil-column case.

The separate ordinary-career critic approved the same `faeb7e7b` source in **20 groups**, including real five-offer columns, context/identity/mutation/malformed-column controls and actual earned settlement, purchase and new-instance reload. Its report is `drillity-next-career-playthrough/research/CAREER_JOURNEY_INDEPENDENT_2026-09-08.md`. That broader career evidence is owned by its author and critic; it does not establish whole-game completion or every future capital purchase.

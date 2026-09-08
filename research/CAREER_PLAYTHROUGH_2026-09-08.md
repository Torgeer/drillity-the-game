# Earned career route and ordinary auger ground repair — September 8, 2026

The first defect was a disagreement between the soil-only auger job being sold and the ground the simulator actually used. A real initial offer accepted the untouched starter equipment, then encountered a 227.75 MPa boulder while telling the player to abandon for unsuitable ground. The composed geology repair now honors a validated, actually accepted soil column. The same initial offer can settle, pay, buy a replacement consumable and reload correctly.

An earned continuation then reached the first core method level gate: level 18, 31,407 XP and €82,538 after 102 paid contracts. That is an earned unlock checkpoint, not a played core job or a completed game. The core rig costs €285,000; the actual purchase refuses with a €202,462 shortfall. No economy or progression balance was changed for this investigation.

## Candidate and ownership

Candidate: `C:/Users/henri/Downloads/threads/drillity-next-career-playthrough`, detached at `a47de8a6ba199eabb108da447cd660f01c1735e7`, overlaid with the 300 verified files in the read-only `drillity-coordination/resume-70-baseline-2026-09-08` snapshot. The consumed manifest is copied to `research/career-playthrough-baseline.json`.

`rescue_viability` owns the shared `src/world/geology.js` implementation. This author owns ordinary-offer requirements and the career probes/reports. The only production delta in this candidate is the agreed copy of the shared geology file, SHA-256 `faeb7e7b14af50f16b9905adba1efae7fb6cf754afa1894a8ce10c8a93466e88`. Integration belongs to root. No MAIN edits, commits, browser/GPU use or real user-save access occurred here.

The shared mechanism records the actual state/progression accepted contract identity and run, checks compatible ordinary surface auger work or canonical rescue work, and privately captures continuous known-soil intervals through the actual target. Generation requires that same live identity and matching physical context. Detached, stale, spoofed or malformed requests cannot select the contractual column. Regional geology remains beneath the job; regional features may not intrude into the promised interval. Other methods and ordinary unaccepted regional generation retain their existing behavior. These are generated contractual geological columns in the game, not measured surveys.

## First-job reproduction

Factory resources are €4,500, level 1, XP 0, `crawler-lite`, `auger-flight-std` and `auger-flight-sec-280`. The probe changes none of these. It initializes actual progression, geology and simulation, accepts an actual board object and advances both simulator and geological crossing updates at 1/60 second. It uses public telemetry, sliders and pulses. A 2D drawing sink supplies no visual evidence and creates no GPU context.

Seed 1337, card 2 is `ct-nordic-auger-5thr3`, contract seed 1042083242, one 7.2 m hole. Its soil-only specification is topsoil/till/till.

| Observation | Original geology | Composed repair |
| --- | --- | --- |
| Actual penetration | 3.165624921 m after 180 player seconds | 7.2 m, complete in 27.833333333 player seconds |
| Terminal warning | `method-limit`, abandon unsuitable ground | None |
| Completed holes / XP | 0 / 0 | 1 / 408 |
| Wallet after settlement | €4,500; no settlement | €4,611, net +€111 |
| Public replacement purchase | Not reached | €780, bit condition 0.949952763 → 1 |
| Public save/reload | Success route not reached | €3,831 / 408 XP / level 3 and equipment condition preserved |

Raw evidence is `career-playthrough-before-fix-pinned.json` and `career-playthrough-after-fix-pinned.json`. Each records its exact command and consumed source hashes before/after. Their pinned probe hashes differ and must not be represented as one identical file. `probe-career-playthrough-harness.mjs` is a retained intermediate snapshot. The exact post-fix/jobs-1–11 probe is separately preserved in `research/probe-career-playthrough-66e16be1.mjs`, SHA-256 `66e16be11596d01e5e0af5e27706855e76bc7f15668ca37140a32b29ae3bbab4`. It was recovered by reversing known later controller changes and accepted only when its bytes matched the historical reported hash. The original pre-fix probe hash is retained in its JSON but an exact matching source copy has not been recovered. The independent review supplies a separate reproducible full-lifecycle negative control. Current reproducible source is `tools/probe-career-playthrough.mjs`.

The other four original seed-1337 cards also failed to complete within their declared 360-second bounds, stopping at 1.28993 / 1.36929 / 2.85915 / 1.62953 m. Their raw reports remain intact. This is evidence of the ground promise mismatch under a stated controller, not a proof that every possible control strategy is universally unable to finish or that no possible career escape exists.

Independent review separately reproduced the full lifecycle before/after on seed 907 and passed 20 ordinary-column identity/context/malformed-input groups. Three repaired initial offers actually settled, purchased and reloaded; one was a €64 net loss under that controller. Repaired offers are therefore not described as guaranteed profitable. Replay checks used the actual completion payload. See `CAREER_JOURNEY_INDEPENDENT_2026-09-08.md` for its separate source coverage and preserved rejected fixture evidence.

## Earned continuation and exact limit

The continuation chooses the shortest currently ready auger offer, refreshes the real board at most 30 times if none exists, keeps the starter rig and spends no skill points or certificates. It makes one deliberate first-job €780 replacement QA purchase, then replaces the bit through the real purchase API only when its condition is below 35%. All input saves are the verbatim output of public saves from preceding successful runs, identified by SHA-256. No money, XP, depth, completion, condition or contract terms are injected.

The fixed-step simulation runs faster than real time in Node. The controller sees published optimal telemetry and reacts to warning, jam-rescue and rod-add windows; this is not manual play, UI acceptance, phone performance or an optimal progression policy. No intermediate method investment was attempted, so this starter-only path cannot establish the fastest or cheapest route to core.

The saved sequence consists of jobs 1–10 in `earned-career-chain-01`, job 11 in `earned-career-chain-02`, and jobs 12–102 in `earned-career-chain-03`. The original `chain-02/job-012.json` controller became stuck and produced no saved continuation, earnings or XP. Its failed report remains. After improving only the controller's early response and action timing, chain 03 restarted from the exact persisted job-11 checkpoint. The aggregate below covers the successful persisted route and excludes that failed diagnostic attempt's elapsed time; it is not a claim of one uninterrupted, never-retried session.

| Earned checkpoint | Value |
| --- | --- |
| Paid contracts / completed holes | 102 / 414 |
| Recorded drilled distance | 7,327.2 m |
| XP / level | 31,407 / 18 |
| Wallet | €82,538 |
| Actual paid replacement transactions | 37, totaling €28,283 |
| Sum of completion player clocks | 58,165.9 seconds, about 16.16 hours |
| Rig / owned components | Starter crawler / the two original auger components |
| Final bit / rod / rig condition | 0.743817738 / 0.255332106 / 0.901212838 |

The final saved checkpoint is `research/earned-career-chain-03/job-102.save.json`, SHA-256 `4f5bfaa36e7942c023fc10ad354f100fbdde4f68297770ad815577fb85a969e4`.

`tools/check-earned-career-provenance.mjs` checks all 102 saved links, initial-state continuity, unchanged consumed source per run, persisted player/equipment state, XP-to-level agreement, wallet-event reconciliation, actual settlement XP, hole counts, attempt identities and drilled-distance totals. Its artifact is `research/earned-career-provenance.json`. An early chain-01 clock aggregate used the wrong event-name literal; `chain-before-clockfix.json` preserves it. The corrected aggregate derives from the original actual `drill:complete` event payloads without rewriting the per-job evidence.

Independent raw-artifact review passed in `research/earned-career-independent-final.json`: 102 saved jobs, 414 globally unique paid attempts, all 1,068 chronological money events, 37 replacement quotes, XP formulas, retained receipts, wear and actual public core refusals reconcile. The wallet equation is €4,500 factory funds + €290,487 revenue − €184,166 running costs − €28,283 purchases = €82,538. This review reads the actual retained chain and calls the public final-save/access consumers; it does not rerun every simulation frame.

One statistics boundary remains explicit: the historical probes did not record `JAM_CLEARED`. The final save contains 11,739 `jamsCleared`, which this chain therefore cannot independently validate against event deliveries. It is not certified by a test that never captured its events. The complete money and settlement-XP reconciliation excludes unexplained additional jam rewards. Future targeted statistics work must capture and reconcile the actual jam events; the old logs must not be relabelled as having done so.

## Actual core gate

The catalogue's core unlock is level 18 at cumulative XP 31,338. The final checkpoint passes the level requirement. Calling actual `purchaseRig('core-rig')` returns `{ok:false, reason:'Not enough money', price:285000}` and does not change the saved career.

From the same unedited earned checkpoint, a real refreshed Nordic board produces `ct-nordic-core-8o82u`, seed 1347665529, one 79.3 m hole and no required certificates. Both preview and acceptance first return `missing-core-bit`: “Fit a wireline core bit in the bit bay.” They do not charge or start the job. This is the actual first guard encountered; it must not be renamed a rig guard just because the rig is also unowned. See `research/earned-core-access.json`.

No core hole was simulated. Core capital, its full equipment train, later certificates/renewals, other method investments and later career progression remain outside this proof. The €202,462 shortfall belongs to the declared starter-auger policy at this checkpoint; it does not show that core is economically unreachable under other choices.

## Commands and source identity

Run from this candidate. Use new output directories for any rerun so failed and successful original artifacts survive. Do not run simulations during root's GPU timing windows.

```powershell
node tools/probe-career-playthrough.mjs 1337 180 research/career-first-job-rerun.json 2
node tools/check-earned-career-provenance.mjs research/earned-career-chain-01/chain.json research/earned-career-chain-02/chain.json research/earned-career-chain-03/chain.json
node tools/check-earned-core-access.mjs research/earned-career-chain-03/job-102.save.json
```

The current runner can reproduce the declared policy in a new directory with `node tools/run-career-earned.mjs 110 research/earned-career-rerun`. Because the controller was improved at historical job 12, a new run is a new result rather than a claim to regenerate identical historical logs. The saved historical commands are in each report.

| Production file | SHA-256 used for the earned sequence |
| --- | --- |
| `src/world/geology.js` | `faeb7e7b14af50f16b9905adba1efae7fb6cf754afa1894a8ce10c8a93466e88` |
| `src/sim/drilling.js` | `07ccd37ec9f74cf6030639053c6165fc0617876f7fbfca542e95fc5fbba5ab74` |
| `src/game/progression.js` | `8b4b1312342fadd820e1cf6ee7ce2a4a939aa716656005623374091bb7daae9f` |
| `src/game/data.js` | `bb207515d7c43b643a011f055848a95a7e9d3b3e262a5f2fc0729668fae24c2f` |
| `src/game/economy.js` | `ef98a6b8e7569f8542b541f9d8baad8e8c0f01193b088d2ef7ff3e433f7bcac6` |

The ordinary repair and the longer earned-save ledger have separate independent approval within their stated limits. No full-game completion percentage is inferred from this bounded task.

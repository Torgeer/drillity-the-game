# Independent earned-career review — September 8, 2026

**Approved for the stated scope:** the retained successful route earns level 18 and €82,538 through 102 paid auger contracts. The raw saves, completion receipts, wallet events, equipment purchases and condition agree. Independently loading its final save and calling actual progression APIs confirms that the €285,000 core rig is unaffordable, and the actual core offer first fails `missing-core-bit`. Neither refusal changes serialized career state.

This is a review of an earned checkpoint, not full-career completion, a played core job, a fastest progression policy or a finding that core is generally unreachable. No production changes, simulation-chain rerun, GPU work, commits or access to the user's real save occurred in this review.

## Reproduction and evidence identity

Run from `C:/Users/henri/Downloads/threads/drillity-next-career-playthrough`:

```powershell
node tools/check-earned-career-independent.mjs research/earned-career-independent-rerun.json
```

The accepted execution took approximately 0.94 seconds and exited 0. Its output is `research/earned-career-independent-final.json`, SHA-256 `71cc0bcffd3908bb668ef1942234a2f30bcd257c1a731df7f7825b690107ebee`. The reviewer tool is `tools/check-earned-career-independent.mjs`, SHA-256 `68eb7de893eae30b8e4f625d9f217895d94ffdaa431bbf24b5ad1b79ed5a2984`. The earlier `earned-career-independent-01.json` remains a preliminary execution; use the final artifact for acceptance.

The tool reads all original job reports and actual save bytes from the three chain manifests. It records each consumed manifest, report and save hash in its output, independently of the author's provenance summary. The final actual save is `research/earned-career-chain-03/job-102.save.json`, SHA-256 `4f5bfaa36e7942c023fc10ad354f100fbdde4f68297770ad815577fb85a969e4`.

All successful runs report the same five critical production identities before and after execution; these match the current candidate. Geology is `faeb7e7b14af50f16b9905adba1efae7fb6cf754afa1894a8ce10c8a93466e88`. The complete five-file map is in the final JSON. This verifies those recorded files; it is not a claim that every transitive input was hashed during each historical frame.

Both historical controller revisions are now available as exact source bytes. `research/probe-career-playthrough-66e16be1.mjs` hashes `66e16be11596d01e5e0af5e27706855e76bc7f15668ca37140a32b29ae3bbab4`, matching successful jobs 1–11 and the failed diagnostic. `tools/probe-career-playthrough.mjs` hashes `da40d435b713350235ecadd885287536e69cdf58d8078faf7b73406865ad9e6c`, matching successful jobs 12–102. The historical copy was reconstructed by the author and accepted only after exact equality with hashes already present in retained raw reports. Independent source comparison confirms the changes are controller warning/response timing and abort-loop handling.

## What was checked

The first raw report starts from the factory's €4,500, zero XP and starter equipment. Every subsequent actual input-save byte hash equals the preceding successful output-save hash, and the full parsed input equals that previous save. Recorded initialized state, saved output and compact before/after public reload state agree. The independent core check additionally reloads the final save through actual progression and compares the full career ledger and compact player/equipment state.

All 414 completion events have distinct paid run/attempt identities and corresponding saved receipts. Each receipt delivers its actual contract target; its hole ordinal, final-hole flag, revenue, costs, XP, reputation and hours agree with the contract summary and persistent counters. The current job's receipts are present, and the retained portion of prior receipts is unchanged. All 102 settled contract identities are unique and accumulate in the saves. XP is independently recomputed using the actual public `xpForContract` formula for each receipt, including the first-method bonus only once.

All 1,068 wallet events reconcile in chronological order, including zero-delta load events. Only hole revenue, running costs and the 37 bit purchases affect the wallet. Each purchase price matches `priceWithMarkup` using the earned reputation at that event; the changing discount is therefore accounted for. Consumable running costs are present, final bit/rod conditions match wear receipts, and rig condition matches billed operating wear. Automatic consumed-tool replacement is the production game's existing condition wrap and per-metre consumable billing, not evidence of a finite spare inventory.

| Reconciled successful route | Value |
| --- | ---: |
| Paid contracts / paid holes | 102 / 414 |
| Metres | 7,327.2 |
| Revenue | €290,487 |
| Running costs | €184,166 |
| Separate public replacement purchases | 37 / €28,283 |
| Final wallet: 4,500 + 290,487 − 184,166 − 28,283 | €82,538 |
| Earned XP / level | 31,407 / 18 |
| Reputation | 3,433 |
| Sum of rounded completion clocks | 58,165.9 seconds, approximately 16.16 hours |
| Billed in-game career hours | 682.29 |

The 23,167 sparse samples have increasing frame/time within each attempt and depth within its delivered target. They do not reconstruct every physics frame. Source review of both exact probes and the current chain runner found factory state or verbatim input saves, actual progression/geology/simulation initialization, fixed-step updates and public inputs/actions. It found no injected wealth, XP, contract terms, depth, condition or completion events. That source review and the artifact reconciliation support the provenance claim; they are not an independent replay of all 102 jobs.

## Restored checkpoint and remaining limits

`research/earned-career-chain-02/job-012.json` is explicitly excluded. The old controller and abort-loop defect repeated an aborted attempt under three sample labels at approximately 7.5235 m; there are zero completion events, no output save, unchanged €6,506 and 2,429 XP, and an active contract. Those labels are not three delivered holes. The accepted continuation starts from the exact job-11 save with hash `fec8224e15ba660baa8df625507ff4d6eb34a00d9f17305de2f088d9447b0bfb`, using the improved controller. The 16.16-hour sum excludes this discarded diagnostic, menus, shopping, reading and human reaction time. It must not be described as a single never-retried play session or as the 682.29-hour in-game billing clock.

The final save retains only the starter crawler and two auger components, with no purchased skills or certificates. The actual core-rig purchase returns `Not enough money`, price €285,000, deficit €202,462. A real refreshed board produces `ct-nordic-core-8o82u`; actual preview and acceptance return `missing-core-bit`. This is the first fit guard observed, not a rig-specific guard. No funds or XP were granted to bypass either check.

The author chain did not record `JAM_CLEARED` events. Its saved `jamsCleared: 11739` therefore has no independently verified event count in this review. All cash and XP nevertheless reconcile to actual paid settlement receipts and purchases, with no additional jam reward. The separate earlier first-job replay checks remain in `CAREER_JOURNEY_INDEPENDENT_2026-09-08.md`; this longer ledger review does not expand their live-event coverage.

Core equipment capital and a played core contract, alternate earlier-method investment, skills/certificates/renewals, later methods and the remainder of the career still need actual public-action coverage. No completion percentage follows from this checkpoint.

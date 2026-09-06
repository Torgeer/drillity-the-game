# Quarry final integration review — DEFER

Reviewed 2026-09-06 by root child `contract_readiness_review`, allowance reported 8%. No production edit, GPU/server launch or Blender export. Read final checkpoint, nine-file manifest, exact source diff, CPU gate/critic and root preview harness/report; opened baseline and candidate uncased diagnostic PNGs.

**Defer the paired source/asset integration.** No demonstrated blocker in the narrow five-object removal, but the captured candidate has flat gray rubble where the baseline shows rock texture. Root independently sees this in the phone view too. Successful capture is not visual acceptance; the cause is unresolved. Preserve the candidate and evidence for Claude rather than copying it into the shipping asset during shutdown.

## What is established

- All nine delivered file hashes match `quarry-live-collar-manifest.json`; patch SHA `c89337a1070a906cce7ba2c23a1050179472b5caf1fc9e533af11524101d9cba` and candidate GLB SHA `5b53090ed7c92c89be48e4dcf668a7400634aa62eb3d7b89482c4cfc7db78930` match.
- Root `git apply --check` succeeds. The sole production diff is `blender/sites/quarry_bench.py`: find the exact live origin, remove its paired collar, skip its stem/pin/flag without reindexing seeded neighbors, and remove specifically observed `spill-11-4`. `site.pattern()` returns aligned `at`/object lists, and its origin calculation produces the exact zero entry. The fixed scatter identity is intentionally tied to this seeded source, not a general clearance algorithm.
- Independently reran candidate collision gate: 0 of 13,840 actual transformed triangles intersect the parsed runtime throat/casing envelope; six materials, 27,030 vertices, 955,160 bytes. Its 12-case/24-assertion self-test and separate 18-case/18-permutation adversarial suite pass. Root original remains the recorded 65-triangle negative control. Existing final authoring evidence records 1,025 complete survivor signatures equal, five exact removals; no new export was run here.
- Root `shots/quarry-collar-root-preview/report.json` captures four states, expected actual quarry model, six site draws, actual GLB rig, correct uncased/cased stub visibility, no errors/request failures, browserClosed=true and passed=true. Two unpaid-preview warnings are preserved. Its explicit visualAcceptance remains pending. The report's quarry source hash is the original root source, while candidate GLB bytes were intercepted from the private export: this is candidate asset preview, not an integrated source/export rebuild.

## Visual confound is not explained by the current hypothesis

`C:/Users/henri/Downloads/drillity-the-game/.bak/quarry-live-collar-preview.mjs` calls `browser.newContext()` separately inside the baseline/candidate loop and closes each context before the next. Baseline JavaScript material/texture cache objects therefore are not shared with the candidate page. The diagnostic uses `site.clone(true)`/`collar.clone(true)`, temporarily renders the actual shared materials, restores render state, and does not call material disposal itself. This source does not establish cross-variant teardown as the cause. An in-page terrain lifecycle issue, timing, export difference or another mechanism still needs evidence.

Independent GLB inspection through existing glbinfo parser and actual GLTFLoader finds identical six material definitions/names, no embedded image/texture declarations, and TEXCOORD_0 on every mesh in both exports. Actual blastedRock UV values range 0..1 in both; candidate UV data is neither absent nor all zero. That rules out those simple explanations but does not establish correct live texture binding or exact shipped-baseline UV parity. The authored before/after survivor proof is not a comparison of every exported attribute against the older shipping GLB.

## Exact continuation commands and conditions

Current CPU/source reproduction, no export or GPU:

```powershell
Set-Location 'C:/Users/henri/Downloads/threads/drillity-quarry-live-collar'
node tools/checkquarrylivecollar.mjs
node tools/checkquarrylivecollar-adversarial.mjs
git -C 'C:/Users/henri/Downloads/drillity-the-game' apply --check 'C:/Users/henri/Downloads/threads/drillity-coordination/quarry-live-collar.patch'
```

Next useful investigation is a fresh permitted, leased capture that records live blastedRock material/map identities, readiness and disposal around quarry attachment, with the same measured exported UV inputs and both capture orders. This is a follow-up requirement, not authorization to rerender during shutdown. Keep original source/GLB unchanged until the gray-rock discrepancy is explained and the corrected artifact is viewed.

After that blocker is resolved, root can apply the exact reviewed patch and copy only the matching verified GLB, rerun collision/adversarial/site and artifact checks, and refresh the build because its shipped quarry asset changes. The currently recorded passing full build consumed the original quarry and cannot certify a later replacement. Never treat the geometry fix as physical/engineering clearance or FPS proof.

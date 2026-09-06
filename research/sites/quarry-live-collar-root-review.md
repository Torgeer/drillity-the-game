# Quarry final integration review — approve narrow integration

**Current verdict after completed texture-ready evidence: integrate the exact reviewed source patch and matching private GLB.** The earlier visual deferral below is resolved for this narrow asset correction; its evidence and reasoning remain preserved. Complete the post-copy CPU/artifact verification before committing or claiming the updated build is ready.

Reviewed 2026-09-06 by root child `contract_readiness_review`, allowance reported 8%. No production edit, GPU/server launch or Blender export. Read final checkpoint, nine-file manifest, exact source diff, CPU gate/critic and root preview harness/report; opened baseline and candidate uncased diagnostic PNGs.

**Initial verdict, now superseded: defer the paired source/asset integration.** No demonstrated blocker in the narrow five-object removal, but the captured candidate had flat gray rubble where the baseline showed rock texture. Root independently saw this in the phone view too. Successful capture was not visual acceptance; the cause was then unresolved. The later readiness evidence below resolves that specific blocker.

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

## Addendum — proposed texture-readiness correction

Source review supports the parent's proposed bounded wait as a legitimate capture-readiness correction, not a relaxed visual threshold. `assets.js` acquireSet immediately publishes fallback/primed canvases with `ready:false`, queues an asynchronous `renderSet`, and sets `ready:true` only after that generation finishes. `renderSet` finally marks map, normal and ORM textures for upload. The cooperative queue counts actual queued/running jobs; failures are counted and logged. Shader warm-up plus 80 frames does not establish completion of that separate work. This is a plausible explanation for gray primed rock, still requiring the before/after measured evidence; it does not retrospectively establish the cause.

Fail-closed capture conditions:

- Record stats and live blastedRock material/map/source IDs at the ORIGINAL warm-up+80-frame checkpoint, before waiting. Preserve the existing gray screenshots/report.
- Require numeric finite integer stats and `sets > 0`, `materials > 0`, `pending === 0`, `failed === 0`, `setsReady === sets`. Missing stats, zero-set disposal or NaN must not become a vacuous pass. Bound the wait; timeout/failure remains failure.
- Read `_sets` as live mutable owners, deduplicate its aliased values exactly as stats does, require the count to equal stats.sets and every set ready. Do not use `texSet(...).ready`: that wrapper copies readiness at call time and invoking it may allocate a new set.
- Require the actual visible site's blastedRock material and its expected maps to exist, with finite positive image dimensions; record their texture/source IDs and match map source ownership to the ready cache set. Texture.source identity accommodates `cloneForRepeat`. `terrain.mat()` clears cloned material userData, so do not require `material.userData.assetSet` on that clone or interpret its absence as missing readiness.
- Render after the queue finishes so pending texture uploads can occur, then recheck stats and live material/map ownership at each uncased/cased capture. Preserve all errors, generation/overlay warnings, failed resources and source/asset hash identity. A newly queued task or changed owner requires another bounded readiness check, never suppression.

No source export, browser or GPU work performed by this addendum. The integration verdict remains deferred until the proposed settled captures are inspected. If the measured ready frames recover texture, report both findings: settled material appearance is restored, while the earlier fixed-frame screenshots exposed a real incomplete-loading state. Do not imply a production loading/lifecycle fix was made when only the measurement prerequisite changed.

## Final addendum — completed ready-state evidence resolves the blocker

Independently read `C:/Users/henri/Downloads/drillity-the-game/shots/quarry-collar-textures-ready/report.json` and opened its `candidate-uncased-diagnostic.png` and `candidate-cased-phone.png`. The candidate rubble visibly has its rock texture again in both views. The diagnostic retains the open live origin without the removed decorative collar/plug/flag; the captured phone still shows the quarry dressing and actual rig. This is narrow visual acceptance of the removal and restored settled material appearance, not whole-game art/HUD, collision clearance, loading performance or FPS certification.

At the old fixed-frame checkpoint, baseline had 17/26 sets ready, pending 9 and blastedRock ready=true; candidate had 10/26 ready, pending 16 and blastedRock ready=false. Both completed with 26/26 ready, pending=0, failed=0. Both retained 35 materials and 78 textures. This directly supports incomplete texture generation as the prior gray-material confound. No source/material retuning or different GLB was used: baseline/candidate asset hashes and all six recorded source hashes match the previous capture.

Final report: four cases, no errors/request failures/failures, browserClosed=true, passed=true; only the same two unpaid-preview warnings. All four cases retain the actual quarry model with six reported site draw calls, actual GLB rig and correct casing visibility. Root reports session 55964 closed. No additional GPU/export work was performed by this reviewer.

The JSON does not record every per-capture map/source identity suggested in the earlier fail-closed checklist; it records the old-checkpoint material readiness and aggregate completed readiness before the ready captures. Do not present the extra suggestions as all implemented. The actual same-asset ready images plus explicit readiness and prior source/CPU evidence are sufficient to clear this narrow integration blocker.

Keep both old and ready report directories. Remaining production fact for Claude: game texture generation is cooperative and can still show primed materials before completion; this review changed the capture prerequisite, not the player loading lifecycle. Apply/copy only the previously hash-verified nine-file patch and GLB, then run the integrated collision/adversarial and current site/artifact checks. Refresh the shipped artifact because the earlier full build contains the old quarry asset; preserve the <=5% orderly shutdown constraint if final verification cannot finish.

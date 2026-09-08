# Cab-glass candidate evidence — INVALID capture, no overall approval

This folder preserves a CPU-reviewed, unintegrated two-file material candidate
and its failed first visual acceptance run. It is evidence only. No production
source or tool has been integrated by this package. All original candidate and
capture files remain in `drillity-next-glass-readability`.

The candidate applies the existing procedural cab finish to only three actual
GLB buckets independently proven to contain cab panes exclusively: oil-derrick
`static:glass`, longhole-rig `front:glass`, and piling-leader `upper_glass`.
Shared lamp/display/gauge/site glass stays unchanged. Geometry, model bytes,
paint, exposure and transmission remain unchanged; transmission is zero.

## Outcome and limits

| Case | What the recorded run establishes | What it does not establish |
| --- | --- | --- |
| Longhole orbit | Completed A/B/A/B with visible cab panes and source/state/material guards | Overall graphics approval; see independent image/noise review |
| Oil focused detail | Completed response/dispatch quartet | Pane appearance: an opaque painted cabin wall occludes the panes |
| Piling focused detail | Completed response/dispatch quartet | Clear cab readability: the chosen view is heavily obstructed by the leader; see independent coverage review |
| DTH mixed-glass control | Completed unchanged-control quartet | Coverage for every other mixed rig |
| CFA mixed-glass control | Setup failed because QA returned a stub contract; harness correctly rejected it | Any CFA visual-control result |
| SI lens control | Not attempted after the CFA failure | Any SI visual-control result |

**The raw report has `valid: false`.** Individual completed cases' technical
`valid` fields are source/state/dispatch checks, not visual approval. The script
kept the invalid result; no repeat run was authorized this cycle. Exact pixel
repetition, image coverage and remaining visibility limits are assessed in
`research/GLASS_VISUAL_CRITIC_2026-09-08.md.gz` and its accompanying report.
The two wide context PNGs are unpaired candidate views and cannot establish a
wide-view before/after improvement. Oil and piling detail cameras use the
existing public `focusOn` API; they are diagnostic views, not gameplay framing
acceptance.

The measured whole-render dispatches below include shadow/post passes and
cannot certify the separate <=70 rig draw budget or FPS/phone performance.
All non-target object dispatch counts stayed exactly unchanged in the four
completed quartets.

| Case | Whole-render A -> B | Rig-owned A -> B |
| --- | ---: | ---: |
| Longhole | 195 -> 194 | 108 -> 107 |
| Oil focused detail | 142 -> 141 | 33 -> 32 |
| Piling focused detail | 223 -> 222 | 132 -> 131 |
| DTH control | 276 -> 276 | 147 -> 147 |

Every started scenario is an unpaid QA preview. Oil additionally retains the
existing missing-FLUSH_MEDIUM / wrong-AIR-plume warnings. CFA reports no
generated contract and no flush medium. Those messages are preserved; this
work does not establish contract progression, payout or oil-VFX correctness.

## Exact provenance and contents

- `cab-glass-delta.patch.gz` and `.json.gz` describe only assets.js and gltfRig.js
  against the frozen `resume-70-baseline-2026-09-08` snapshot. The directory's
  historical name predates the later usage-cutoff extensions.
- `candidate-source/` and `baseline-source/` contain the exact two source files,
  compressed losslessly. These are artifact copies, not production files.
- `tools/` contains the author and independent CPU checks and the exact capture
  harness. `research/` contains source/binary inventory, baseline manifest,
  CPU reports, preflight reviews, post-install dependency verification and
  independent visual review. The original failed geometry-sharing test is kept;
  its assumption was corrected to match production's deliberate geometry clones.
- `capture/` contains the original 9.19 MB raw report as gzip, the exact executed
  harness source, cleanup proof and all 18 original PNGs (16 quartet images plus
  two unpaired contexts). PNGs are copied byte for byte without modification.
- `manifest.json` records each original and stored byte size and SHA-256. Gzip
  text has deterministic timestamps; decompressing it restores exact original
  bytes. Every package entry was verified against its original after writing.

Approved/executed harness SHA-256:
`a47f530ff58c4a4f032aa3a3b8eb3f4996535ffebb2979cdda64459480c07a23`.

Candidate source hashes:
assets `154d5eac58bdeac6aaa0b559d2f13c43700d3aede18eb46816a738551533c605`;
gltfRig `3d5f9f56986278a5a932ef8f644b420c141b4114396ba5a3d6e240eeebc3d818`.

Raw invalid capture report SHA-256:
`37db70154eb7c92e76002e03580d8a06394d3015f4f1b04f03ca4f2c0ae7a8d9`.

Prelaunch verification after the shared npm install matched all 45 frozen
source identity files, all 19 fleet GLBs and 332 prior Three dependency files.
The capture's complete source manifest remained unchanged. The owned browser
and server closed successfully; port 5231 had zero listeners and the lease was
released idle at 2026-09-08 14:10:55 UTC. Subsequent work may hold a new lease;
the saved cleanup record describes this run's release, not current ownership.

Future acceptance needs visible oil/piling pane views, a genuinely generated
CFA scenario, the missing SI control and the independent repeat/control gates.
It requires a new explicitly coordinated GPU grant; this archive is not a
reason to apply the candidate automatically.

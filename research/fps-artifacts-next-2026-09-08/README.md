# Heat-shimmer evidence handover — September 8, 2026

**No production graphics fix or isolated shimmer benefit is established.** Corrected capture02 passes recording integrity, but second-render position dominates the timings: 19/24 second submissions were slower, with median +20.859392 ms. On-first and off-first feature differences reverse direction. The historical poor-FPS cause remains open.

Capture01 is preserved as rejected at its first on member. Capture02 preserves 24 complete pairs, 48 diagnostic queries, 458 normal queries, 2,744 live frames and seven natural rod connections. No sample was removed. Both owned browsers/servers closed; port5209 was independently checked closed and the lease released. No further GPU run followed.

## Contents and exact identity

- `raw-captures.zip`: lossless originals and accompanying reviews for capture01 and02. `raw-captures-manifest.json` hashes every uncompressed file. The large129 MB report is compressed to remain reviewable in Git; it is not truncated.
- `candidate/`: reviewed profiler/helper, offline analysis and critic tools, all24 files from the critic's frozen manifest, pinned V8/DevTools primary sources, original and corrected source patches, and preflight evidence.
- `snapshot-source.zip`: the exact300-file immutable source snapshot used to create the candidate; original manifest remains under candidate/evidence/heat-shimmer-preflight. Its historical resume-70 name does not change the later80%-used budget authorization.
- `verify-package.py`: checks every packaged-file hash and every decompressed raw/snapshot file against its original hash.

Corrected sources: profiler SHA436f48390bf25083d8a6105103389849ee61e83ac22714eb8b4c493dfddcbc40; helper SHAce926d88600161abaf1f29cc3481b512c8796ff58168f3d007a79d3333cef603. The snapshot-relative corrected patch is candidate/evidence/heat-shimmer-preflight/candidate-vs-snapshot-v2.patch. No MAIN runtime/tool file was overwritten by this package.

Raw report01 SHA b1653921d9bc19e36d60ba14e71b6856f7489e17095cf6d4240db551628555ca. Raw report02 SHA f4f03965785453a1c79db3b11b8f7d1018cd9876fc85129d0c564cffa123fc46. Final independent review: candidate/research/HEAT_SHIMMER_CRITIC_2026-09-08.md and heat-shimmer-second-capture-critic.json. The 57-group correction evidence is heat-shimmer-critic-side-03.json. Earlier failed fixture/capture records remain explicitly failed.

## Verification and reproduction

Run from this package directory, using Python's standard library:

```powershell
python verify-package.py
```

For the full review, expand raw-captures.zip into a fresh disposable directory; it retains evidence/heat-shimmer/oil-orbit-pairs-01 and02 paths. Read their REVIEW.md and capture-status.json alongside the raw JSON/profile/trace. No GPU is needed to inspect them.

The original diagnostic checkout is C:/Users/henri/Downloads/threads/drillity-next-heat-shimmer. From that checkout, these are the reproducing CPU/offline commands (use fresh output names):

```powershell
node tools/profileframes.mjs --self-test
node tools/checkliveprofiler-adversarial.mjs
node tools/checkcdp-chronology-adversarial.mjs --out evidence/recheck/cdp.json
node tools/checkheatshimmer-adversarial.mjs --out evidence/recheck/shimmer.json
node tools/analyze-heat-shimmer-pairs.mjs evidence/heat-shimmer/oil-orbit-pairs-02
```

The chronology critic additionally reads the two historical particle recordings from the sibling drillity-fps-investigation/evidence/fps/oil-vfx-on-first-01 and02 folders. Those originals remain in the existing earlier FPS archive/workspace; they were not altered or reclassified by this package. Pinned primary source IDs, URLs, local hashes and executable DevTools-oracle details are in candidate/research/cdp-primary-2026-09-08/sources.json and the critic report.

To rebuild the source elsewhere, restore snapshot-source.zip into a disposable project directory, then overlay the packaged candidate diagnostic files. Install dependencies from the preserved package-lock.json. Supply the exact public assets and installed Three inputs identified by the449-entry sourceBefore manifest; they are hashed in the raw reports, not silently replaced with current assets. This package does not duplicate the70 MB public-asset tree. The original candidate reads MAIN/public through a junction; do not write assets through it. A future actual capture must verify every served-input hash and browser/GPU provenance again. Recorded Chrome152.0.7977.76, revision0d89dfa2dd7c1ec4b8a14b9f303f887bb63b6174 and V815.2.124.19 identify these measurements, not an indefinitely reproducible installed browser.

The command actually run for02 was:

```powershell
node tools/profileframes.mjs --live --live-shimmer-pairs 24 --rig oil-derrick --camera orbit --seed 1337 --live-ms 45000 --settle-ms 12000 --port 5209 --out evidence/heat-shimmer/oil-orbit-pairs-02
```

It must not be rerun over existing evidence. Any new GPU work requires fresh coordination and a serialized lease; no further run is included in this handover.

## Interpretation and remaining work

Application state/camera/workload equality and exact target masks are proven within the reviewed limits; GPU queue/cache/driver/allocation timing equivalence is not. The transparent DoubleSide material-version correction records exact back/front draw witnesses; it does not discard version changes generally. Composer ping-pong roles remain recorded separately. CDP V2 keeps all signed deltas and sample/timestamp pairs; it does not clamp or drop negative intervals. CPU-profile and Perfetto clock domains remain independently checked, not assumed identical.

The live interval maps through recorded performance.timeOrigin to14:03:53.291–14:04:38.301 UTC. A separately reported conditions-test artifact was generated after test work at14:03:21.803 UTC,31.488s earlier. That original artifact is preserved inside raw02 as external-test-timing.json. Exact OS process exit and machine-wide idle state were not independently measured.

The next useful performance task is a separately scoped one-original-render-per-frame protocol with a predeclared same-mask sham, then balanced/reversed on/off comparisons only if camera/state/workload and adaptive feedback are controlled. Diagnose submission-position bias before blaming shimmer. The oil-rotary missing-FLUSH_MEDIUM/wrong-air-plume warnings also remain visible in the raw run. No causal fix, shipping FPS or phone readiness is claimed.

Repository storage note: standalone `.patch` files are committed as `.patch.gz`, preserving their exact diff-context bytes. Decompress to the original filename before applying. The FPS package verifier can read this gzip storage directly; original logical patch hashes remain unchanged.

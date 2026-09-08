# Piling browser evidence — CAPTURE_FAILED

This directory preserves one corrected browser attempt; it is not runtime integration or visual clearance approval. Original run: 2026-09-08T14:00:00.608Z–14:01:54.578Z. Source before/after hashes matched. Browser/server closed; port 5250 was independently free and the GPU lease idle at 14:02:20.806Z.

- All 20 held frames preserved exact consumed phase, simulation/camera/clock identity and diagnostic state restoration. Both real UI pause intervals preserved the actual simulator and ram.
- All 10 hero frames have visible ram pixels. Orbit take-set rising/falling and re-drive have zero visible ram pixels and remain rejected. The orbit shows the opposite side of the mast; the exact occluding mesh was not isolated.
- Both contexts recorded two rejected asset-origin responses each. No HTTP/request failures occurred. Rejected URLs were not retained; external Google Fonts in frozen index.html are a possible, unproved explanation. Keep the origin failures.
- The reviewed images do not establish ram/cap/casing clearance, full assembly/static pile/rope alignment, continuous motion quality, physical phone performance or FPS improvement. The earlier failed capture is not a valid matched baseline.

The PNGs in images/ are the 20 normal screenshots and 20 visibility masks copied unchanged. All original report, review, provenance and tool bytes are stored as lossless .gz files. manifest.json records source paths, original/stored SHA256 and byte counts; every compressed entry was decompressed and compared byte-for-byte during packaging. README and manifest are plain navigation metadata. CPU harness review and actual capture review are separate artifacts.

## Reproduce the recorded attempt

Candidate: C:/Users/henri/Downloads/threads/drillity-next-pile-visual. Its production files are the immutable 300-file snapshot at C:/Users/henri/Downloads/threads/drillity-coordination/resume-70-baseline-2026-09-08, based on a47de8a6ba199eabb108da447cd660f01c1735e7. The snapshot hash list is provenance/source-baseline-300-files.json.gz. This evidence package does not duplicate the full repository or generated GLB assets; report.json.gz records their exact source identities. Do not substitute current MAIN production files silently.

Frozen capture tool SHA256: c36d7573ba4ea471fc6d6a949b820437bd906702c391df426c5ccd2a5883e52c. Tool source, baseline source, source-identity helper, reviewed narrow patch and patch hashes are under tooling/. Report SHA256: 8a12f5dc0fd699b2e10fd462ac58d60f91cf54acffcfba21ef7b49bf8451a63f.

Exact original command, from the candidate:

`node tools/checkpilemotion-browser.mjs --out evidence/pile-motion-corrected-01`

A future execution must use a NEW output directory, verified source/dependency hashes, idle port 5250, and an explicit coordinator graphics grant with lease pile-motion-browser. The command above names preserved evidence and must not overwrite it. No further capture was run during packaging. The dependency preflight ENOENT and its recovery are retained under provenance/; root confirmed npm install caused temporary KTXLoader.js absence, and all 332 recorded Three dependency hashes matched after installation.

To inspect a compressed file from this directory using Node (the destination must be new):

`node -e "require('fs').writeFileSync('report.json',require('zlib').gunzipSync(require('fs').readFileSync('report.json.gz')),{flag:'wx'})"`

Useful normal images: [hero peak](images/hero-peak.png), [hero bottom](images/hero-bottom.png), [hero take-set](images/hero-take-set-rising.png), [orbit peak](images/orbit-peak.png), [orbit hidden take-set](images/orbit-take-set-rising.png). Retain all other images and masks as evidence, including zero-pixel failures.

Independent current-capture review is now included as reviews/critic-capture-review.md.gz and .json.gz, with its exact offline reviewer tool. It independently decoded all 20 masks and verified their pixel counts/bounds and all normal-image hashes. It retains CAPTURE_FAILED. ID masks measure scene geometry; the pause-sheet sample does not establish visibility through DOM overlays. The ordinary Site camera uses hero; orbit here is an additional inspection view, not proof that the ordinary gameplay camera hides the action.

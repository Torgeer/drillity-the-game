Repository storage: the original complete bundle, including source snapshots, COPY_MANIFEST.json and both failed captures, is stored byte-for-byte in `sampling-evidence.zip`. Extract to an empty folder before using the original reproduction commands below. `archive-manifest.json` records every member hash and byte size. Original local files remain untouched.

# Sampling browser evidence — incomplete acceptance

This is a lossless checkpoint of **two failed native-browser attempts**, not a passing release gate. No production repair or third run was performed. The independent reviewer confirms **SF1/P2: sample-card captions truncate at320×568**.

## Read first

- `evidence/sampling-browser-final-02/core-site-longest-condition-1-320.png` shows `INNER TUBE CAPACITY` and `MATERIAL RECOVERY` ellipsized.
- `evidence/sampling-browser-final-02/current.json` retains the real native action, phase/product/payment snapshots and exact geometry.
- `research/SAMPLING_BROWSER_CRITIC_2026-09-08.md` and `research/sampling-browser-critic-final02-2026-09-08.json` contain the independent classification.
- `research/SAMPLING_BROWSER_ACCEPTANCE_2026-09-08.md` explains both attempts and their limits.
- `COPY_MANIFEST.json` records every archived file's SHA256 and verified copy provenance.

Final01 stopped before retrieval because the test expected a short accessible name while production correctly adds explanatory text. Its exact original runner is retained at `research/sampling-browser-runner-final01.mjs` (SHA `d4e965932d94f74f927d44cdc13b32dfa8bc00f5a5ec1c2557d427a47d601a94`). The reviewed final02 runner at `tools/checksampling-browser.mjs` (SHA `e949da00097c8256e656560fc30fd7b767f522e757986bdad4e832ee4a6c268f`) changes only that locator and case comparisons for CSS-uppercase captions. Raw reports and all PNGs remain unchanged.

Final02 proves native acceptance of the actual89.5m/75.7mm core tender, the1.5m capacity stop, unchanged waiting evidence, real low-flush exposure, and one timed native inner-tube retrieval with repeat/early-payment guards. It then fails the narrow320px caption gate. **Handling, final partial completion/payment, Results, document reload and sonic acceptance remain unverified.** These DOM fixtures omit the renderer; blank stages are intentional and do not establish a rendering defect. Desktop Chrome is not a phone test.

## Next bounded fix

Make the two sample-card captions fully readable at320px, retaining the distinction between physical core capacity and sonic gameplay run limit, and retaining material-recovery uncertainty. Review wrapping or shorter precise captions; preserve44px controls and stage/layout gates. Do not merely weaken the clipping assertion. Re-run the complete native workflow only under a newly authorized browser slot and budget.

## Reuse

The retained isolated candidate remains at:

```text
C:/Users/henri/Downloads/threads/drillity-next-sampling-browser
```

From that directory, the exact final02 command was:

```text
node tools/checksampling-browser.mjs --port 5252 --lease sampling-browser --output evidence/sampling-browser-final-02
```

For a later run choose a **new output directory**, preserve these failed runs, first obtain the coordinator's browser lease, and set the existing coordination lease to `sampling-browser`. The harness verifies the lease and hashes its served inputs. `--prepare-only` bundles without opening a browser. No command was rerun while this archive was made.

This archive also contains the38 composed source JavaScript files, actual styles/index, package metadata/lock, current fixture, independent checker, all manifests and logs. To reconstruct separately, place the archive as a sibling worktree under `Downloads/threads` and install/junction its dependencies using the retained lockfile. Its harness expects sibling `drillity-coordination/gpu-owner.txt`; it is not intended to start a browser directly from this nested archive folder. The source manifest preserves the original300-file baseline, the pre-vibro composition and final incremental update. Final drilling SHA: `17c164f5cbe8f50c51e2ca0cdd312fc38944854b91076974285559f76a74b324`.

Both browsers and servers closed cleanly; independent listener checks confirmed5252 free and the lease returned to `idle`. All35 captured inputs were hash-verified unchanged after final02. No git index, commit, production source or GPU was changed during packaging.

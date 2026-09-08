# Preserved career evidence — September 8, 2026

This folder stores the exact author and independent critic evidence as individual gzip files. Nothing was truncated. The manifest records original and compressed SHA-256 hashes and byte sizes for every file. It includes all 102 successful raw job reports and their actual saves, complete chain manifests, the rejected controller run, earlier ground-mismatch failures, rejected/preliminary critic outputs and both exact historical controller revisions.

The author export and expanded critic inventory are under `provenance/`. Source reports and probe bytes are preserved unchanged. Production code is not copied by this bundle. The five production hashes needed to reproduce the original earned-ledger review are recorded in `manifest.json`; a later game version must not be represented as that exact source.

Use a Node runtime supporting `Map.groupBy` for the optional original critic review. Verification and extraction use Node built-ins only. Run these commands from the repository root, or supply the full path to `bundle.mjs` from elsewhere:

```powershell
node research/career-artifacts-2026-09-08/bundle.mjs verify
node research/career-artifacts-2026-09-08/bundle.mjs extract C:/path/to/career-evidence
```

`verify` reads and decompresses every payload, checks both hashes/sizes and verifies that the retained saved chain contains 102 successful jobs and 414 completion events. It imports no game code. `extract` restores original repository-relative paths in the chosen folder. Existing byte-identical files are accepted; any differing file stops extraction before files are written. It never overwrites conflicting evidence or copies production files.

To rerun the independent ledger and public saved-career access check, first extract into a workspace that already contains the recorded matching production source and its dependencies, then run:

```powershell
node research/career-artifacts-2026-09-08/bundle.mjs review C:/path/to/matching-source-workspace
```

That command verifies the extracted evidence and production hashes before importing the original critic tool. It creates a new timestamped, losslessly gzipped review JSON and hash/size sidecar under this bundle's `reviews/` folder. Historical Windows path separators are normalized only during file reads, without changing the original JSON or tool bytes. It does not start drilling, a browser, GPU work or the 102-contract simulation runner. The original current author probes are available separately for deliberate future reproductions.

The evidence proves an earned level-18 checkpoint with €82,538, not a played core job or completed career. It retains the failed controller checkpoint restart, distinguishes approximately 16.16 completion-clock hours from 682.29 billed career hours, and leaves the uncaptured historical jam-event count unvalidated. Read the preserved reports for the full boundaries.

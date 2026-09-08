# Composed haptic dispatch check

The reviewed haptic repair passes on the composed MAIN production source atop commit `859fde2023e531d44e5ff334355e4d24e4c4d92c`. This review changed only the three test/probe tools and added evidence. Root owns production integration; this reviewer did not change production, package scripts, git state or GPU resources.

## Results

- Actual shell producer → actual bus → actual audio subscription → actual haptic policy: **12/12 PASS**. The five existing names each dispatch once; shot/mute dispatch zero; explicit sound overrides, live preferences, shared burst budget and absent API handling remain intact.
- The same 12-case checker against the pinned pre-fix shell: **11 FAIL, 1 PASS**, intentional exit code 1. This negative comparison detects the duplicate writer and mute/budget bypass; it is not a failing repaired build.
- The focused author success/preference/capture probe: **PASS** across its five observations.
- The historical diagnostic: **DEFECT_REPRODUCED** against the pinned pre-fix shell with current unchanged audio consumers.

The current shell SHA-256 is `3b0bb7e4f7df43f13b228e11f6bb1a1c8c261c0e78b24ae0c237556a481e9def`. The pinned baseline shell SHA-256 is `12a549edece76f1745caaa4fad6e0fc2b7c0bf46fd361f7a0002dc83ef930f21`. Different whole-file hashes from the isolated candidate reflect root's composed source; each capture records the exact callback/source it exercised.

## Reproduction from a checkout with repository history and dependencies

```powershell
node tools/checkhapticdispatch.mjs --output research/haptic-dispatch-integration-author-2026-09-08.json
node tools/checkhapticdispatch-adversarial.mjs --output research/haptic-dispatch-integration-critic-2026-09-08.json
node tools/checkhapticdispatch-adversarial.mjs --baseline --output research/haptic-dispatch-integration-baseline-2026-09-08.json
node tools/probeaudiohapticlifecycle.mjs --output research/haptic-dispatch-integration-historical-probe-2026-09-08.json
```

The three tools use pinned committed source through `git show`; no sibling worktree, coordination snapshot or machine-specific path is required. A shallow clone must contain the named baseline commit to run the historical modes. The author check and historical probe now write files only when `--output` is supplied, preserving imported historical evidence by default. The historical probe intentionally tests the old defect, while the ordinary author/critic modes test current production.

All **13 original research artifacts remain byte-identical** to the isolated candidate, including original JSON/logs and reports. The copy manifest preserves the original hashes of all 16 imported files; the final artifact manifest records portable tool hashes, new output hashes and production consumer hashes separately. The original three tool versions remain in the preserved candidate.

This is CPU execution of real producer/consumer code with an instrumented vibration capability. It does not certify physical handset vibration, audio rendering, browser activation behavior or phone lifecycle behavior.

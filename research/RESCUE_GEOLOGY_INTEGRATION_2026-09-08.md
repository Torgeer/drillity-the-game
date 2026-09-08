# Actual rescue geology integration — 2026-09-08

The focused author check passes against the composed MAIN source atop `859fde2023e531d44e5ff334355e4d24e4c4d92c`, using the repository's default native Canvas dependency. All three real holes reach 8 m, grade B, at 48.7 simulation seconds each. Cash rises from €0 to €453 after actual settlement costs, and replaying the final completion pays nothing. No simulation fixture change was necessary.

This integration assignment changed only `tools/checkrescuegeology.mjs` and its reports. Production source, the adversarial tool, package declarations and package installation remained with their assigned owners. No GPU/browser, broad test suite, commits or pushes were run here.

## Runnable dependency path

The old default run failed before simulation because `@napi-rs/canvas` was missing from the repository's dependencies. Its raw error is preserved in `rescue-geology-author-integration-default-before.json`. Root then installed and pinned the independently verified native package version **0.1.100** in package.json/package-lock.json.

The default tool resolves `@napi-rs/canvas` through Node from this repository. CLI `--canvas-root` and `DRILLITY_CANVAS_ROOT` remain explicit optional overrides; relative CLI paths resolve from the command's working directory. Missing native Canvas produces a useful error, a failed report and exit code 1. It never substitutes a no-op Canvas, fake geology or fallback simulation.

The author check contains no sibling-worktree baseline input or historical-file dependency, so it needs no replacement baseline from git. Its game imports are repository-relative. After the composed source and dependency lock are committed, the clean-checkout command is:

```powershell
npm ci
node tools/checkrescuegeology.mjs --report=research/rescue-geology-author-check.json
```

Verified here: the default package resolved to MAIN's local `node_modules/@napi-rs/canvas`, with version 0.1.100 recorded in the report, and the complete real-geology check passed without either override. An independent fresh clone/npm installation was not performed by this author, in accordance with root's package-install ownership; this is repository-local execution and dependency-path verification, not a claim of a separate fresh-clone run. The critic owns historical-baseline portability of its distinct adversarial tool.

## Focused evidence

Final command (no external override):

```powershell
node tools/checkrescuegeology.mjs --report=research/rescue-geology-author-integration-default-final.json
```

Result: exit 0, `pass: true`, `sourceUnchanged: true`. The report contains before/after SHA256 identities for ten relevant source/test files, native Canvas package/root/version, real completion receipts and ledger events. The new guard rejects a run if those source identities change during execution and prints success only after that guard passes.

An explicit unavailable-module negative control returned exit 1 and preserved a failed JSON report in `rescue-geology-author-integration-missing-dependency.json`. It demonstrates dependency failure reporting without removing or modifying any installed package. Earlier successful explicit-Canvas and default-resolver reports remain preserved under `rescue-geology-author-integration-before.json`, `-final.json` and `-default-after.json`; the explicitly named `-default-final.json` is the final tool identity.

The world source remains `faeb7e7b14af50f16b9905adba1efae7fb6cf754afa1894a8ce10c8a93466e88`. The report pins the newer composed data, equipment, progression and simulation sources separately. This is actual CPU Canvas/geology lifecycle, fixed-step physics and settlement evidence, not a rendered browser image, real phone test or proof for every loadout/control strategy. Earlier independent authored-column and slow-D support proofs retain the source identities and limits in their own reports.

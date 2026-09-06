# Atlas adoption independent root review

Reviewed 2026-09-06 by root child atlas_adoption_review. Read ASTRA.md fully. Scope: CPU/source only; no browser, GPU, production edit, Git mutation, or external message. Private candidate: C:/Users/henri/Downloads/threads/drillity-ui-atlas-game-adoption, baseline f4e8ad9.

## Disposition

No evidenced production blocker found in the four scoped consumer/menu files. This is pre-render review only, not final acceptance. Root must still review actual rendered menu and settings, native targets, overlap, enlarged labels, pressed/focus states, remounts, and actual-game integration with matching GLBs. Existing author CPU tests use explicitly synthetic geometry.

The manifest remains the geometry/safe-region authority; URLs use the deployment base; active density sheets are decoded and validated before ready. Single-flight failures evict cache entries, explicit refresh retries, and version/disposed guards prevent late completions mutating departed roots. Disposal releases observers/listeners/queued frames; preserved appearance is weakly owned until remount. Native button handlers and labels remain intact, graphics-quality state uses mutually exclusive aria-pressed, and dynamic Play accessible labels follow the visible text. Long/invalid labels fall back to DOM surfaces. No simulator/data/renderer/global Button replacement occurs.

## Reproduced checks

- Candidate: node tools/check-blender-atlas-consumer.mjs — PASS, 22 CPU cases. Includes failed HTTP/network/image/decode/dimensions, manifest corruption, density change, pending disposal/remount, observer cleanup, unrelated statistics mutations, invalid markup and text/icon/parent-size fallback.
- Candidate: node tools/check-ui-atlas.mjs --self-test — PASS. 16 sprites, 34 PNG files, 361188 bytes; all 11 corrupt fixtures rejected.
- Candidate: node tools/checkhaptics.mjs — FAIL with two scanner findings: check-ui-atlas.mjs and check-ui-atlas-game-smoke.mjs.
- Integration checkout: node tools/checkhaptics.mjs — FAIL with one scanner finding: check-ui-atlas.mjs. This establishes that the older atlas checker failure is already present before this candidate.

## Findings

### P2 — Custom smoke URL can override the intended game-side silence

File tools/check-ui-atlas-game-smoke.mjs lines 20–23 builds an effective URL by preserving caller query parameters and adding quality, shot and glb. src/audio/audio.js line 1314 defines game silence as !query.has('sound') && (query.has('shot') || query.has('mute')). A provided --url http://127.0.0.1:5178/?sound therefore defeats the smoke's shot flag.

Independent CPU evaluation of the exact URL construction and production predicate:

- Default URL becomes /?quality=low&shot=&glb=strict; audioSilent=true.
- URL with ?sound becomes /?sound=&quality=low&shot=&glb=strict; audioSilent=false.

Browser --mute-audio still exists, but the project requires both browser and game-side silence. Narrow fix: delete the sound parameter from the effective QA URL before navigation, retain shot, and assert the effective URL satisfies the same production silence predicate. This finding concerns the test harness, not player settings or production atlas behavior. No edit made.

### Haptics scanner produces two false-positive diagnoses on the current default paths

At tools/checkhaptics.mjs line 584 the mute check only recognizes a literal ?shot/?mute or &shot/&mute. The new smoke already uses url.searchParams.set('shot', '') at line 22; its default URL therefore does engage game-side silence despite the scanner's contrary message. The CPU evaluation above independently confirms this.

The older tools/check-ui-atlas.mjs line 164 navigates to an isolated atlas demo. tools/ui-atlas-demo/demo.js imports motion and styles, with no src/main.js or audio graph. Its checker explicitly asserts isolation at lines 131–132. The scanner treats every goto(url) as game navigation (checkhaptics.mjs lines 573–574), causing the baseline false positive.

Narrow non-exempting repair option: extend the scanner to recognize actual URLSearchParams.set('shot'/'mute', ...) statements as well as literal query flags, with positive/negative fixtures; also have the isolated checker append a real mute query parameter and remove sound from its supplied URL. This keeps browser/game silence enforced and does not exempt a path merely by name. A broader source-analysis rewrite is unnecessary for this candidate. Do not add a comment containing ?shot merely to satisfy the regex. Note the current scanner also prints its all-silent success note even when failures exist; its exit code correctly remains 1.

## Snapshot integrity

The coordination inventory describes patch SHA-256 39beebd5abe8921a4c3c3487cce6072d83939d3d3f9f6a2baae0ed501f8b8dbf. Independently hashed all 13 inventory paths. The four production files still match:

- src/ui/blender-atlas.js: 28916a09aa8913a47e6d2a584417b8a898facc9df7931a5787d6c0ea91fcd65e
- src/ui/blender-atlas.css: 6fa494f2887f849de4fbf35c6d460a6af378778ddbe979373bdbb04bc442e72a
- src/ui/screens/menu.js: 5687cdc9e05dae4b5e156698075742dfb9c7412dd83311c27acc01a95bda34ff
- src/ui/screens/menu-atlas.css: 529ee31fd3d3eb8731da4345db7fe8599b243fcc73a16cb5fed0bf434b376a19

Two harness files changed during author preparation and no longer match the checkpoint inventory: tools/ui-atlas-adoption-review/check.mjs and tools/ui-atlas-adoption-review/vite.config.mjs. This is expected active-work drift, not an integration defect; request a refreshed final patch/inventory and compare rendered evidence to those exact inputs before accepting. No final rendered acceptance is granted here.

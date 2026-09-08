# Single haptic dispatch from the shell

The shell previously emitted `EVENTS.HAPTIC` and then issued a second direct `navigator.vibrate()` call. With the real audio subscriber initialized, one success action called the actuator twice. The second call also bypassed `?shot` and `?mute` silence. The preserved before-probe and JSON reproduce those calls without a browser or physical actuator.

The candidate removes only the shell's legacy actuator table and direct call. The existing event reaches the existing audio/haptic dispatcher, which works before audio unlock and owns the vocabulary, player preference, capture silence and motor budget. No physical pattern, duration, budget, audio synthesis or preference policy was changed.

## Validation

- `node tools/checkhapticdispatch.mjs`: PASS through the exact source callback and real `createAudio().init()` event subscription. One ordinary success call reaches the actuator once with the existing channel pattern; `?shot`, `?mute` and disabled haptics produce zero calls; `?shot&sound` produces one call. Audio graph remains unbuilt throughout.
- `node tools/checkhapticdispatch.mjs --baseline`: expected exit 1 against the exact frozen old callback (`2 !== 1`). The rejected original behavior is preserved in `research/haptic-dispatch-baseline-negative-2026-09-08.log`; it is not labelled a passing product test.
- `node tools/checkhaptics.mjs`: PASS for the existing vocabulary, mapping, budget and silence suite. Log: `research/haptic-dispatch-vocabulary-2026-09-08.log`.
- Independent composed review by `assembled_ui_fixture` is recorded separately; its gate is not the author's probe.

Source was seeded into a fresh detached worktree at `a47de8a6ba199eabb108da447cd660f01c1735e7` and all 300 resume-snapshot files were verified before the edit. Only production `src/ui/shell.js` is changed for this task. Baseline SHA-256: `63b54470b80237d0d616552cc3ff6f80e55fd6520aead8cfbc8a7a147d4efe4c`; candidate: `2d881d6f75db60e8a00e6f30e9751f6e7ed7ee0a99c4e221dac4130f8caf8e8e`.

Root can integrate the narrow `drillity-coordination/haptic-dispatch-delta.patch` using its adjacent baseline/candidate hash manifest. Do not copy the full candidate shell over independently changed main source. No commit, push or production integration was performed by this author.

This is a source/event composition fix, not real-device haptic quality, Web Audio output, browser autoplay or background-return certification. No browser/GPU or speaker was used.

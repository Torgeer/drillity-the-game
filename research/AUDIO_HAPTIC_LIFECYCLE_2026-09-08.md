# Audio and haptics lifecycle: bounded independent audit

2026-09-08, `field_save_visual_critic`. Frozen resume snapshot in `drillity-next-sampling-browser`. No production edits, browser, GPU, AudioContext, speaker or physical actuator was used.

## Reproduced defect: shell bypasses the shared haptic channel

`src/ui/shell.js`'s actual `haptic()` callback first emits `EVENTS.HAPTIC`, which the initialized audio module consumes through its shared haptic channel. The callback then independently calls `navigator.vibrate` using its own legacy pattern table. Both dispatches occur for one shell action.

The independent probe runs the exact AST-extracted shell callback with the real `createAudio().init()` event subscriptions and an instrumented vibration capability. It does not replace the audio event handler or its preference/mute policy.

| Input | Actual actuator calls for one `success` action |
| --- | --- |
| Normal URL, haptics enabled | `[20,45,40,45,70,45,95]`, then `[10,40,18]` |
| `?shot`, haptics enabled | `[10,40,18]` |
| `?mute`, haptics enabled | `[10,40,18]` |
| `?shot&sound`, haptics enabled | Both patterns, as with normal URL |
| Haptics disabled | No calls |

The second path bypasses the channel's capture silence, vocabulary, refractory handling and motor budget. This is a demonstrated dispatch/policy defect, not an assumption based on unavailable phone evidence. The probe does not establish what a particular handset feels or how its actuator schedules the two requests.

Recommended bounded repair: route shell feedback through one authoritative haptic dispatcher. Preserve useful feedback when audio synthesis is unavailable; the existing audio-side haptic channel already works before an AudioContext is built. If an audio-less UI fallback is retained, it must share the same settings, silence and budgeting policy rather than issue a second call after a successful dispatch. Add a composed shell-to-audio regression, including capture mute and disabled preference.

## What already works, and what was checked

- The probe verifies `createAudio().init()` leaves `isReady` false and produces haptics without constructing an audio graph. Source creates AudioContext only inside `unlock()`, with gesture listeners in the module and main entry point. Successful browser autoplay unlock itself was not tested.
- Player `settings.haptics === false` suppresses both current dispatch paths in the composed probe. Haptics and reduced motion are separate Settings preferences; source does not promise that reduced motion disables vibration, so their independence is not classified as a defect.
- Settings writes SFX/music values into game state and requests the debounced save. `applyBusGains()` consumes those values on each built audio frame; ambience follows SFX. The previously removed nonexistent volume setter calls are not needed for this path. Gain smoothing and audible mute were source-traced, not rendered or listened to.
- Source suspends an existing audio context on hidden visibility and requests resume on return, resynchronizing the music beat scheduler. Shell reports hidden/off-Site/overlay gameplay as paused, and the audio model receives the gameplay pause state. Actual background-return success on a target browser/device remains untested; missing device evidence alone is not called a defect.
- Disposal removes recorded subscriptions/listeners, silences master gain and requests context closure. No device teardown claim follows from this source audit.

`node tools/checkhaptics.mjs` passed its existing pure/runtime suite: six signature families, novelty/budget checks, direct audio-channel silence and capture-script scanning. It also reports eleven unmapped hazard kinds as informational output. Its direct silence probe calls `audio.haptic()` and does not exercise the shell's additional actuator call, explaining why it passes alongside the reproduced composition defect.

## Reproducer and identity

Command: `node tools/probeaudiohapticlifecycle.mjs`.

Output: `research/audio-haptic-lifecycle-2026-09-08.json`, status **DEFECT_REPRODUCED**. Exit 0 means the probe reproduced the expected defect, not that a repaired product passed. All inspected production hashes matched before/after:

| Source | SHA-256 |
| --- | --- |
| `src/audio/audio.js` | `9150ec5acdaa2cf7e82a758f0f558fe9a3580d659fff154e8fab4889a25a047a` |
| `src/audio/haptics.js` | `6ce41ba766273e8e2c94ab8ca1fad7264d56ba8de47010a2da1ad151573a4c95` |
| `src/ui/shell.js` | `63b54470b80237d0d616552cc3ff6f80e55fd6520aead8cfbc8a7a147d4efe4c` |
| `src/ui/screens/menu.js` | `0c37238b5fe84f46178a6247cc04616ddce96cdcf5c396c0d4088503ad38d44e` |
| `src/main.js` | `b338acab39c6c683d9c6dc56519b80fa22450c871494a7593c723766bf254336` |

This audit is complete for its bounded source/composition scope. Sampling browser evidence remains a separate pending review.

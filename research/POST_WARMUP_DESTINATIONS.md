# Post warmup destination correction

2026-09-06. Narrow `warmPost()` correction; no GPU launched. Root owns subsequent headed lifecycle acceptance and the separate shadow-depth investigation.

## Measured trigger and source cause

Root's lifecycle-programs GPU report identified late SMAA edge, weight and blend programs on medium/high after quality rebuild, plus a low-tier DrillityGrade screen variant and two MeshDepthMaterial programs. Installed Three 0.169.0 `SMAAPass` constructs its quad with a null material, then switches among `materialEdges`, `materialWeights`, and `materialBlend` during render. The previous warmup inspected the held quad and Bloom fields only, so a fresh SMAA pass supplied no materials to compile. It also compiled ordinary post materials into the surrounding HDR warm target even when the last enabled pass actually renders to screen.

Primary implementation references: installed `node_modules/three/examples/jsm/postprocessing/SMAAPass.js` constructor/render methods (before embedded lookup-image data), `ShaderPass.js:render`, `UnrealBloomPass.js:render`, and `EffectComposer.js:render`/`isLastEnabledPass`. This change follows that pinned dependency's actual execution contract.

## Behavior

- Only enabled composer passes are traversed; inactive SMAA and other disabled passes are not warmed.
- Last-enabled ordering plus `composer.renderToScreen` determines screen output. Stale `pass.renderToScreen` from a prior draw is not used as the destination authority.
- Local read/write variables simulate enabled `needsSwap` passes without mutating composer buffer ownership.
- SMAA queues its real edge material at `edgesRT`, weight material at `weightsRT`, and blend material at the actual output (screen or write buffer).
- Ordinary ShaderPass queues its actual material at its write buffer or screen. This supplies low's final Grade screen variant.
- Bloom queues high-pass, both directions of each blur, composite and additive blend at the targets used by its actual render method. Its optional screen copy is compiled only when Bloom is the final screen pass; that MeshBasicMaterial temporarily receives the actual input map because map presence affects its program variant.
- Target, each quad's previous material, pass renderToScreen flag and optional Bloom copy map are restored in `finally`, including bind/compile failures. Exceptions propagate to the existing `warmShaders()` compile-failed outcome instead of quietly advertising partial compilation as ready.
- The existing isolated instrument warm helper is unchanged and remains invoked after shared post warmup. No shader, material appearance, quality threshold, main.js, package script, or render-pass changes.

## CPU validation

`tools/checkpostwarmup.mjs` executes actual installed `EffectComposer.render()` and the actual SMAA, ShaderPass and Bloom render methods with a recording renderer. Their material/target/map sequence is the oracle for production `warmPost()`; the expected target list is not a copy of the new implementation. It tests low/medium/high enabled combinations, offscreen output, Bloom-last output, a null fresh SMAA quad, deliberately stale screen flags, disabled trailing passes, and every queued draw's injected bind and compile failure.

The regression failed against the old warmup at its first comparison: low trace had 13 queued material calls versus 15 actual pass draws. After the patch:

- `node tools/checkpostwarmup.mjs`: **1,557 assertions passed**.
- `node tools/checkinstrumentwarmup.mjs`: **56 assertions passed**, including exceptional isolated-target restoration.
- `node tools/checkprogramreadiness.mjs`: **36 assertions passed**.
- `node --check src/core/renderer.js`: passed.

Queued draw count includes repeated blur-material variants at their actual horizontal/vertical targets; it is not a unique-program count. CPU checks establish destination/ownership behavior, not driver completion, FPS, texture decode readiness or the absence of late GPU programs. No warning suppression or acceptance threshold changes were made. Root reran the strict lifecycle gate successfully, as recorded below; checkpostwarmup is now wired into check:instruments/check:cpu.

## Historical shadow observation and fresh acceptance

The earlier `shots/instrument-lifecycle-programs/report.json` recorded two late low-tier **MeshDepthMaterial** programs. This patch does not explicitly compile shadow substitutions. However, root's fresh `shots/instrument-lifecycle-postfix/report.json`, using this frozen renderer and the same lifecycle harness hash, **passes all six cases with zero late programs and zero repeat changes**, including 390x844 low. The earlier observation is therefore not a currently reproduced residual requiring a production patch.

The strict no-late-program gate remains unchanged. No shadow correction is justified from the current passing evidence. The reports contain detailed keys only for programs created after warmup, so they do not establish when the corresponding depth variants became available in the passing run or prove why they ceased appearing late. Do not claim that SMAA target binding directly compiles shadow programs, or that this proves every possible shadow variant is warmed. A separate coordination note records the source diagnosis and a conditional investigation path if this failure recurs. The new CPU script is standalone until root integrates it into package gates.

# Atlas harness silence checks

Root integration checkout, 2026-09-06. Changes are limited to the CPU silence
gate and isolated atlas browser harness. No browser/GPU work was performed.

## Reproduced problem and repair

Before this change, `node tools/checkhaptics.mjs` failed on
`tools/check-ui-atlas.mjs`: the source scanner treated its `goto(url)` as game
navigation, although the target is the isolated atlas demo with no audio graph.
The scanner also rejected the private adoption smoke's real
`url.searchParams.set('shot', '')` because it only recognized literal query
flags. Neither required an exemption from the silence policy.

`tools/checkhaptics.mjs` now uses the already installed Vite AST parser to
recognize literal/template query flags and URL `searchParams.set` calls with
literal `shot` or `mute` keys. Comments cannot supply either form of evidence;
strings merely describing a setter do not count as calls. Fifteen positive and
negative fixtures exercise these spellings. This remains a syntactic source
contract: it does not establish arbitrary control flow, receiver types, or the
final value of every possible URL. Failure messages and the aggregate note now
state that boundary rather than claiming observed runtime silence. A failed
scan no longer prints an all-silent success note.

`tools/check-ui-atlas.mjs` now constructs the actual navigation URL through
`silentReviewUrl`: remove `sound`, add `mute`, preserve the deployment path,
fragment and other query parameters, and record the effective URL in the
browser report. This also keeps the review silent if a caller supplies a game
base URL. Browser `--mute-audio` remains required.

## Verification

- `node tools/checkhaptics.mjs`: PASS; 15 scanner fixtures, 49 identified
  game-driving scripts carrying browser and game mute evidence, plus the
  existing haptics mapping, pattern, novelty, budget and silence checks.
- `node tools/check-ui-atlas.mjs --self-test`: PASS; two effective-URL fixtures,
  all 11 corrupt asset fixtures rejected, frozen 16-sprite/34-PNG atlas valid.
- In-memory failure mutant forced every inspected script's query check to fail:
  exit 1, explicit failure count, and no all-silent success statement. The mutant
  ran via a data module in a child Node process without changing source files.
- `git diff --check` for the two tools: PASS.

## Separate pending adoption smoke finding

The private adoption candidate's `tools/check-ui-atlas-game-smoke.mjs` accepts
`--url ...?sound` and currently preserves that parameter while adding `shot`.
The actual predicate in `src/audio/audio.js` is
`!query.has('sound') && (query.has('shot') || query.has('mute'))`.
Independent CPU evaluation produced silence=true for its default URL and
silence=false for a supplied URL containing `sound`. Its author should remove
`sound` and verify the effective URL before navigation, as this isolated
harness now does. That private file was not edited in this task.

No rendered atlas or full-game acceptance is implied by these CPU results.

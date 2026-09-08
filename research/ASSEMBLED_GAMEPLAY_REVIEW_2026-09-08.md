# Assembled gameplay interaction review — 8 September 2026

Independent review of the integration worktree, branch `codex/fps-investigation`,
after the second gameplay batch and the passive-skill, vibro-catalogue and modal
integrations. This is a source/CPU interaction review, not phone, native browser,
rendering or full-career acceptance.

## Found and repaired: one stuck recovery incremented the counter three times

**Trigger:** accept a generated starter auger contract, reach a stuck string, then
recover it while the Site screen is mounted. There is exactly one simulation
`JAM_CLEARED` event and one UI recovery message, but `player.stats.jamsCleared`
increases by **three**.

The three owners in the reviewed source are:

- `src/sim/drilling.js`, `stepStuck`: emits `JAM_CLEARED`, then increments the
  career statistic directly.
- `src/game/progression.js`, `init`: subscribes to `JAM_CLEARED` and increments
  the same statistic, marking the career dirty.
- `src/ui/screens/site.js`, `onJamCleared`: paints/logs the result, then increments
  the same statistic a third time.

The accounting defect predates this batch; it is not attributed to the new pause
or skill implementation. A binding-to-free transition also reaches the shared
progression/UI listeners, so fixing only the stuck branch is insufficient.

Reproduce with:

```powershell
node tools/checkassembledinteractions.mjs
```

The test uses the actual progression and simulation modules and the actual Site
observer extracted through the JavaScript AST. A seeded, generated starter
contract is accepted through the real progression API. The documented QA ground
seam sets granite and god mode prevents unrelated loss during the measurement;
no private state is mutated. At seed 21, feed/rotation/flush `1/1/0` reaches
`stuck` after 164 fixed steps. Changing controls to `0/0.5/1` produces one
`JAM_CLEARED` after another 392 steps. The counter goes `0 → 3` and the UI paints
one “String free” message. The assertion requires a delta of one and fails.

Progression should own career accounting; the simulation should report a physical
event and the screen should display it. Independent investigation found no unique
jam-event identity in the existing public event contract. The repair therefore
preserves legitimate multiple recoveries in one attempt and the public event
semantics, without adding deduplication keyed to an invented identity.

## Crossings that passed on the same assembled source

The same small gate executes three meaningful combinations; these are not copies
of all the standalone feature suites:

1. A native `click` goes through the production `tap` callback into a real timed
   bit trip. Open dialog, hidden document and off-Site pause causes compose:
   closing one cause cannot override another. Paused updates do not advance the
   physical trip, a repeated activation does not start a second trip, and the
   resumed trip reports completion once.
2. An in-flight UI trip is invalidated, the accepted contract is abandoned, and
   a new physical attempt starts. The old promise cannot announce “Replacement
   bit fitted” or trip completion into the new attempt.
3. While off Site, a real skill purchase refreshes the simulator's cached sweet
   spot effect and Contract Book expands the authoritative board from five to
   six offers. A settings edit shares the pending save. Injected primary-write
   failure reports “Progress not saved” without undoing skills or charging points
   again. Retry and actual reload preserve both ranks, the point balance, six
   offers, volume and reduced-motion preference.

The gate uses an `EventTarget` button and UI text sinks, plus an AST-extracted
production pause getter. It does not claim native browser default-event,
inert/focus, slider drag, screen-reader, visual or GPU coverage. Existing
independent suites remain responsible for the individual features. It emits
tested source hashes and fails if any source changes during a run.

## Initial result and exact tested source

Initial command exited **1**, with **3 passing crossings and 1 failing recovery
counter assertion**. The run reported `sourceUnchanged: true`.

| Source | SHA-256 |
| --- | --- |
| `src/ui/components.js` | `7443dc4755c83043b1ca9873271104f58aaa8b818ddd53fc2186c2e5091b4705` |
| `src/ui/screens/site.js` | `2819a17d265feb789c2a96636ced78a6803a8e4482a443d46ddd90ddbd57bcfb` |
| `src/ui/shell.js` | `4b7ddb594128b13f7b769366e4b27fbb723ac30464a794cac389b93a15136944` |
| `src/game/progression.js` | `e006370fbc2352ce24b9d9ab8edc1b1f4c0d9b930ae23f45900366f43a240391` |
| `src/game/data.js` | `b425c13c49cb2ba0350f2f0211d5d602293773e17e1b93c4ba6c2fa75d52cc86` |
| `src/game/economy.js` | `26e95c13e8db2ea65d62ccb212b34fae09080fcb63729960e8ff8b9d1d4001f6` |
| `src/sim/drilling.js` | `23cf8338c2d8b7284230c446a2174c885fc39752bf7b3cac50bb49bb8824400c` |
| `src/ui/save-status.js` | `0955cbd640ade7da75f511c37945f7ecec73599a3bf3ffe120142996d5cba708` |

## Repair independently verified in integrated main

The author candidate removed the extra writes from `stepStuck` and
`onJamCleared`, leaving progression as the sole event-driven counter writer.
Comparison against its preserved dependency snapshot showed only those two
removals and an ownership comment in production. All simulation clearance event
sites and payloads were preserved.

After integration, independently executed in `drillity-fps-investigation`:

```powershell
node tools/checkassembledinteractions.mjs
node tools/checkjamaccounting.mjs
```

Both commands passed: **4/4 assembled interaction cases and 6/6 jam-accounting
groups**. The unchanged independent regression still reaches the real stuck and
recovery boundaries after 164 and 392 fixed steps. Exactly one clearance event
now increments the counter `0 → 1` with one UI message. The source remained
unchanged during the interaction run.

The six additional groups preserve three legitimate recoveries within one
accepted attempt, binding-to-free recovery without a full stuck state,
non-mutating Site observer replay, progression ownership after disposal,
persistence followed by another physical recovery, and existing empty/abandoned
public notification semantics. They do not claim duplicate public bus events can
be distinguished from separate legitimate clearances: the existing payload has
no unique event ID.

The final integrated run included Field Regrind/save-v7 integration, so its
assembled hashes differ from the isolated jam candidate. Exact sources tested:

| Source | SHA-256 |
| --- | --- |
| `src/ui/components.js` | `7443dc4755c83043b1ca9873271104f58aaa8b818ddd53fc2186c2e5091b4705` |
| `src/ui/screens/site.js` | `cbb6d205135da7d782ba8195a2d99c55cb41e9cb1681cab56aa9acf7362d7652` |
| `src/ui/shell.js` | `4b7ddb594128b13f7b769366e4b27fbb723ac30464a794cac389b93a15136944` |
| `src/game/progression.js` | `c1eda533c3113a379b27130aba4b2cab9dd4c360cb093a1a4245066bb008245a` |
| `src/game/data.js` | `0684cac453e80e70036ca34fb661226ca4798d9069c7d6c98413df03bf54cb2d` |
| `src/game/economy.js` | `26e95c13e8db2ea65d62ccb212b34fae09080fcb63729960e8ff8b9d1d4001f6` |
| `src/sim/drilling.js` | `67a679d77f409c2d3cba934334c9060c29705a2d78ba20f5b83d3c68351e343d` |
| `src/ui/save-status.js` | `36b5359c6c62636a6dae6caa520fb666ce4df27d373d11753907cdb32b8fab12` |

**This recovery-accounting defect is resolved in integrated main at the hashes
above.** There is no blanket approval of the whole game or of all remaining
candidate work from these bounded tests.

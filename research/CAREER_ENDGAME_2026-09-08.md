# Level-cap UI, September 8 2026

Candidate: `codex/career-endgame`, isolated worktree `drillity-career-endgame`.
Production scope is `src/ui/screens/menu.js`, `career.js` and the new shared
pure UI helper `src/ui/xp-display.js`. The screens' starting
files were copied from the current integration worktree, including the existing
Menu save notice. The candidate's data, economy, progression and save-status files
are copied dependencies, not additional changes to integrate.

Apply `drillity-coordination/career-endgame-delta.patch` to the corresponding
snapshot, then copy `tools/checkcareerendgame.mjs` and
`tools/checkcareerendgame-adversarial.mjs`. Baseline and candidate hashes
are in `career-endgame-delta.json`; full starting files are retained in
`career-endgame-baseline/`. Do not copy the whole candidate over integration.

## Defect and change

The real `data.xpProgress()` returns `{level:60, into:0, need:0, frac:1}` at
the cap. Career rendered that as `0 / 0 XP`. Menu's full ring still carried
the accessible label `Experience to next level`.

Career now says `Maximum level reached`; its full bar announces the cap and the
screen explains that contracts, certificate renewals, remaining skill points
and equipment purchases continue. Menu adds `Max level` to the current role and
gives its ring the corresponding accessible label. This does not claim the
career, skill tree, equipment collection or game is completely finished.

The independent critic also identified a live transition missed by the first
author test: `addXP()` emits XP_GAIN and LEVEL_UP before writing the final stored
level. Both screens now read their displayed role and level from the same XP
curve result as the fraction, so the live transition cannot retain `LVL 59`
beside a maximum-level message. The stored-level fallback remains when the
provider supplies no valid level. No progression event order was changed.

The critic's malformed-input tests initially found two more defects: infinite
player XP passed every level threshold, and invalid provider fields leaked
`NaN / NaN XP`. The shared UI helper now validates the finite numeric fields,
the catalogue's actual maximum level and the zero-denominator cap shape before
displaying progress. Invalid fields produce an unavailable readout and cannot
imply that leveling is complete. Unknown XP totals explicitly say `XP unavailable`;
they are not presented as an observed zero.

## Verification

`node tools/checkcareerendgame.mjs` passes 10 groups using the actual screen
factories, actual progression, actual data and in-memory component elements:

- Partial level 59 and its actual XP denominator.
- Last XP point from 59 to 60.
- Mounted screens receiving the actual XP/level event order without remounting.
- Additional XP at the cap, with no phantom levels or additional skill points.
- Real contract generation, an actual unspent-skill purchase, continued Play
  navigation, and no automatic ownership of all rigs/certificates.
- Capped save/load and malformed-primary recovery from a capped backup.
- Missing XP curve, disagreeing saved level/XP, and two malformed save slots.

No browser, GPU, real user save, physical device, layout measurement or assistive
technology session was used. The change adds text within the existing scrolling
Career panel and Menu role line; phone fit remains for the integration browser
pass. Independent critic results are recorded separately when available.

`node tools/checkcareerendgame-adversarial.mjs` passes 10 independent groups after
these revisions. It executes the exact shell XP bridge, mounted event delivery,
actual Career skill-node activation and Menu navigation, and malformed XP/provider
inputs. Those are CPU factory checks; they do not replace the phone layout pass.

## Actual endgame limits

The data snapshot in `career-endgame-baseline/manifest.json` reports:

- Maximum level: 60; cumulative XP required: 757,759.
- Last method and rig level gate: 52.
- Last skill and certificate level gate: 40.
- Role at 60: Contractor (Own Company); no next role.
- Skill points awarded by levels 2 through 60: 71.
- Total cost of every listed skill rank: 287 points.

These follow directly from `MAX_LEVEL`, `LEVELS.totalToMax`, catalogue level
fields, `roleForLevel(60)`, `nextRole(60)`, `skillPointsForLevel()` and skill cost
arrays. The regression imports those actual exports, so the display does not
duplicate or hard-code these totals.

Level progression therefore does not complete every skill or buy every rig.
Certificates still have their normal purchase/renewal requirements, and real
contract boards continue at level 60. This is a bounded level-cap check, not a
full played-through economy or all-method completion claim.

## Separate persistence finding

The existing loader accepts a saved `player.level=60` with `player.xp=0`; it
clamps the stored level independently of XP. The two progress displays now use
the XP curve consistently and do not claim this career has reached the cap, but
gameplay's stored-level gates are not repaired here. Root was notified. That
requires a separate persistence/migration decision rather than a UI-only claim.

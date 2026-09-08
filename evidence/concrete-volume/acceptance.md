# CFA concrete quantity repair and remaining cost decision

## Result

The candidate fixes one reproduced producer defect: the last return step now
supplies the concrete integrator with only the pile length still remaining.
Previously `passM` stopped at the target while concrete quantity and quality
accumulators received the longer, unclipped step. No physical constants,
prices, payment rules, pump controls, clocks, or other reverse methods changed.

This **does not close concrete overconsumption accounting**. The existing game
economy has no independently authored concrete price or material-cost split.
No new price or allocation has been invented.

Candidate: `drillity-next-concrete-cost`, detached from
`a47de8a6ba199eabb108da447cd660f01c1735e7`, with all 300 files from the immutable
`drillity-coordination/resume-70-baseline-2026-09-08` snapshot overlaid and
hash-verified. `baseline-manifest.json` preserves that identity. Only
`src/sim/drilling.js` differs from that snapshot. MAIN was not edited; no
browser, GPU, Blender, commit or push was used.

## Reproduction and accepted author evidence

`node tools/checkconcrete-volume.mjs --json evidence/concrete-volume/author-after.json`

The real simulator is driven through public controls and `update`, and real
progression consumes its completion events. The harness reads raw simulator
state without mutating it to measure precision lost by display rounding.
Inventory funding, target 3.137 m and test diameters are declared synthetic;
the test does not establish a rig's physical working envelope.

The author matrix passes 14 cases / 97 assertions, covering CFA and cased CFA
at nominal and 0.8-times nominal diameter, different pump inputs, normal
completion, no completion for a bore-only or aborted partial pile, no quantity
growth while inactive, malformed public controls, separate logs for two holes,
and genuine completion replay/stale-attempt protection. The endpoint failures
are preserved in `author-expanded-baseline.json`: all eight complete pours
failed the geometric conservation assertion before the change.

One measured pair, CFA 600 mm with a 3.137 m return:

| Measurement | Before | After |
|---|---:|---:|
| Actual return length | 3.137 m | 3.137 m |
| Theoretical concrete log | 0.8890864289291774 m³ | 0.8869658538880009 m³ |
| Geometry, πD²L/4 | 0.8869658538880063 m³ | 0.8869658538880063 m³ |
| Normal pump, logged delivery | 1.044676553991782 m³ | 1.0421848783183996 m³ |
| Higher pump, logged delivery | 1.1258499214651392 m³ | 1.1231589117378862 m³ |
| Both grades | S | S |
| Both material bills | €289 | €289 |

The distinct consumed quantities and identical material bills are an observed
open economic consequence, not an assertion that financial accounting was fixed.

`node tools/checkcfafeed.mjs --json evidence/concrete-volume/cfa-feed-regression.json`
passes 444 assertions across seven actual CPU rig builds, including the real
two-stage CFA/cased-CFA programme. The first attempt failed before executing
the gate because this fresh worktree had no generated `public/models/cfa-rig.glb`
(`ENOENT`). The authorized read-only model junction to MAIN was then created;
no models were written or regenerated. Syntax and diff-whitespace checks pass.

The independent critic approves the frozen production change: 16/16 groups
pass in `critic-after.json`, including final-tick pump-volume conservation.
Its earlier baseline retains four red endpoint cases (8/12 groups passed);
additional final-tick and malformed-input groups were added for final review.
The critic's preserved-economy comparison reads the frozen sibling snapshot,
so that portion is a local audit, not a portable CI command.

## Financial decision gap, traced to current code

* `src/game/economy.js:872` defines CFA as **€92 per nominal-diameter contract
  metre, concrete and reinforcement cage together**. The next row defines
  cased CFA as **€122, concrete, cage and casing together**.
* `src/game/data.js:MATERIAL_DIA_EXPONENT` applies 1.72 to CFA and 1.7 to cased
  CFA. Economy's material comments explicitly describe mixed components and
  balance caps, not component cost shares. A single mixed power law does not
  uniquely determine the separate concrete, reinforcement and casing prices.
* `materialsCostForRun()` multiplies the bundled rate by contract metres,
  diameter scaling, region cost multiplier and the consumable-price skill,
  then rounds the total. Its parameters contain no concrete quantity.
* `progression.settleHole()` passes completion units, actual-time performance
  and tools to `settleRun()`, but not `breakdown.quality.concretePlacedM3`.
  `settleRun()` adds `materials.total` to total costs exactly once. No concrete
  line exists to adjust or replace separately.
* The cased-CFA shop loadout can also charge consumable casing tooling wear.
  `MATERIALS_COVERS_SLOTS` lists only jumbo and rockbolt service supplies.
  The text does not resolve whether that wear and the bundled casing charge
  refer to different use of casing. This ambiguity must be resolved before
  claiming a new component split avoids every duplicate charge.
* `research/CFA_CONCRETING_PROGRAMME.md` describes the intended monetary
  consequence and explicitly requests an economy consumer in section 8; it
  supplies no separate game concrete unit price. Its prose about paying for
  delivered concrete is not evidence of an implemented settlement consumer.

Dividing €92 or €122 by theoretical volume would charge reinforcement and
casing again whenever the pump over-supplies. Subtracting 122−92 is also not a
concrete/casing split: the methods have different nominal diameters (600 and
750 mm). Existing cased-CFA casing-tool wear cannot identify the material
bundle's casing share either.

To finish the economic feature honestly, the authored economy needs the
concrete component's rate/baseline quantity and explicit cage/casing remainder,
including whether the expected 1.15–1.20 placement allowance is already inside
the existing bundle. The eventual consumer must apply region/skill modifiers
once, retain full-precision authoritative per-hole quantities, reject malformed
receipts, and preserve existing attempt/replay and partial-completion guards.
Rounded presentation values are not a new billing receipt.

## Preserved limits and diagnostics

The earlier `author-before.json` also tested 1.2-times cased-CFA nominal
diameter. Both pump commands saturated at the same actual setting, so a test
expecting distinct consumption there was invalid; it remains preserved. The
accepted matrix uses nominal/0.8-times diameter where different public pump
inputs actually deliver distinct logged quantities. No production setting was
changed to make the test pass.

This endpoint repair leaves parked pumping unchanged. The current model
commands pump supply independently of withdrawal, uses pressure/head during a
hold, and accumulates `placedM3` only for positive lifted distance using a
minimum withdrawal divisor. That is not a complete, verified meter of pump
delivery through every stationary/blocked state. Independent critic evidence
records the current behaviour separately; no new physical flow policy is
claimed here. Boring-pass over-flighting and other reverse-method accumulators
are outside the concrete-specific repair.

The root integration artifact is
`drillity-coordination/concrete-volume-delta.patch`, a narrow delta against the
frozen snapshot. Final independent verdict and hashes are recorded separately
in `research/CONCRETE_VOLUME_CRITIC_2026-09-08.md`, `critic-after.json`, and
`identity.json`.

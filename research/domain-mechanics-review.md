# Independent domain-mechanics review — 2026-09-06

Scope: CRITIQUE 13a and 13f, actual simulation and catalogue data. Reviewer
owns this note and `tools/checkdomain-mechanics-adversarial.mjs`; no production
edits. Complete ASTRA, its current checkpoint, the two historical findings,
and relevant mining/foundation pack sections were read. Historical reports
are hypotheses until the following reproductions.

## Baseline reproduction

`node tools/checkdomain-mechanics-adversarial.mjs` ran seven actual-module
cases against the completed progression-delivery baseline: five fail, two pass.
The harness starts the real simulation and drives ordinary public inputs at
fixed steps through a completed installation. No private state writes or
duplicated settlement/anchorage equations. A controlled stable competent-rock
fixture and fixed starting condition isolate equipment selection; these are
experiments, not claimed field conditions. God mode holds wear fixed. The
existing simulation still owns phases, geometry, installation time and score.

| Fixture | Measured first install |
|---|---|
| 38 mm catalogue bit + 39 mm tube | 38.1 mm hole, 0.042 anchorage |
| 33 mm bit + 39 mm tube | 33 mm hole, 1.000 anchorage |
| half-condition 33 mm bit + 39 mm tube | 31.9 mm hole, 1.000 anchorage |
| 39 mm catalogue bit + 39 mm tube | 39.1 mm hole, 0.005 anchorage |
| 38 mm catalogue bit + 46 mm tube | 38.1 mm hole, same 0.042 anchorage |

Historical 13a's 21% was the simple diameter fraction, not the final installed
score. Competent-rock exponent and install-time penalty compound it further.
Both the undersized-bit reward and ignored tube-family selection are live.

Historical 13f remains live: default simulated ram is 16,000 kg, maximum stroke
1.5 m and minimum selected rate 30 bpm. The live programme telemetry exposes
that larger hammer despite fitting `impact-hammer-9t`.

## Independent primary-source checks

[Split Set Mining Systems Ground Support Product Overview, June 2025, printed
p4](https://www.splitset.com.au/wp-content/uploads/2025/06/Ground-Support-Brochure-Australia-1.pdf)
lists the 39 mm tube with a 35–38 mm recommended hole. The adjacent 33 mm
family uses 29–31 mm. This supports a family-specific compatibility check,
not universal improvement as the hole gets smaller. The printed table labels
its larger family 47 mm while product identifiers include SS46; this naming
ambiguity must not be silently treated as clearance for arbitrary families.

[Current Junttan HHKA product page](https://junttan.com/product/hhka-series/)
lists the 9 t HHK9A: 106 kNm maximum, 1.2 m maximum stroke and 40–100 bpm.
The linked [HHK7A/9A datasheet, printed p2](https://junttan.com/wp-content/uploads/2015/10/Junttan_HHK_7A_datasheet.pdf)
independently specifies the 9 t extension at these same limits, with 398 L/min,
235 bar and 156 kW theoretical hydraulic power. The latter is not a measured
power delivered into the pile. The 106 kNm catalogue figure is rounded;
9,000 × 9.81 × 1.2 / 1,000 = 105.948 kNm. No need to distort mass, gravity or
stroke to make their decimal representations identical.

## Acceptance criteria and remaining review risks

- Manufacturer recommended hole range is not a measured pull-out capacity
  curve. A normalized binary installation score can be an explicitly stated
  gameplay abstraction; a new smooth capacity/diameter or slot-closure curve
  must not be presented as manufacturer evidence.
- Exact 38.0 mm and historical 38.1 mm require a coherent bit identity or an
  explicit source-supported family distinction; do not introduce a guessed
  tolerance merely to rescue an existing item.
- Merely changing the old ideal33 constant to38 leaves smaller holes and worn
  undersized bits favored. Test both sides of the recommended range and the
  fitted tube family.
- An energy/rate envelope derived from catalogue end points is authored
  modeling unless a manufacturer curve establishes it. Catalogue hydraulic
  input power, ram potential energy and pile-delivered energy differ.
- The new phase must leave progression identity/lifecycle and CFA unchanged;
  the 83 previous cases remain mandatory integration checks.

## Candidate review and corrected adversarial finding

The initial rockbolt candidate passed four isolated equipment cases but failed
an added full granite-pattern case. Its first install scored1, followed by0/0:
the authored overbreak estimate changed a 38.1 mm bit into estimated38.2 mm
holes, which the candidate compared against a nominal bit trial limit.
That repeated the historical correct-tool penalty after the first hole.

The revised candidate captures effective bit gauge at installation and compares
that with the trial-bit range. Estimated hole size remains separate telemetry.
All five independent bolt cases now pass: granite holes38.1/38.2/38.2 retain
effective bit38.1 and the eligibility scores1/1/1. This is a gameplay fit score,
not measured support capacity.

The [manufacturer39 installation page](https://www.splitset.com.au/ss-39-stabiliser-installation/)
explicitly includes the1.5-inch trial endpoint (38.1 mm) beside its rounded
35–38 mm representation. Its [46-family installation page](https://www.splitset.com.au/ss-46-stabiliser-installation/)
specifies41–45 mm trial bits. Both require ground-specific pull tests and
drive-time observations. These specific installation instructions resolve the
candidate's38.1 endpoint and separate46-family questions without guessed
tolerances or cross-family catalogue inference.

The pile candidate passes all three independent cases, including121 energy/rate
settings and actual programme-start telemetry. The author's six live-module
cases were independently rerun and pass. At800 fixed steps the full-energy,
minimum-rate drive reports64 blows,2.42 m toe penetration,105.9 kNm displayed,
1.2 m drop and40 bpm. Those penetration/blow counts are deterministic test
measurements, not claims of verified field rates. The12 kNm floor and7050
kNm/min coupling remain explicitly unsourced tuning. The known vibration-item
fallback to impact mechanics is explicitly residual and outside this change.

## Final combined-root verdict

PASS for this bounded correction. After root merged both candidates, the
reviewer reran `node tools/checkdomain-mechanics-adversarial.mjs` against the
actual worktree `src`: **8 cases pass, 0 failures**. The checks also invoke the
real slot-inspection action for unsupported installations: it rejects the
missing measurement without changing the phase or marking a bolt inspected.
The current site handler only logs slot numbers on successful inspection, so
this guard avoids converting an unknown reading into a false zero reading.

Root reports the combined integration gate results: 12 author bolt scenarios,
6 author pile cases, all 83 prior progression cases, checkdata (39 runtime
checks, zero problems) and checkcareer (7 probes, 10 assertions, 812 boards)
pass. These broader results were reported by root; the eight independent
mechanics cases and the earlier isolated author cases were run by this
reviewer directly.

Final source review confirms the bolt range is consumed from item metadata
at programme start, avoiding a second unconsumed table. Both production diffs
are limited to their authorized method/item areas and related consumers.
No measured blocker remains. Existing UI wording labels the normalized score
as anchorage; actual pull-test capacity, vibration-hammer behavior, and the
explicitly unsourced power/minimum-energy/gauge/slot abstractions are not
validated physical predictions and remain the stated limits of this work.

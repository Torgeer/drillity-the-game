# Independent bolt-length and UI follow-up review — 2026-09-06

Scope: selected bolt length in the existing rockbolt programme and honest
rockbolt site-card/phase semantics. Reviewer owns only this file and
`tools/checkdomain-followup-adversarial.mjs`. Previous domain and progression
deliveries were not edited. No browser/GPU, installation, approval, Git index,
renderer, geology, physics-rate or economic work was performed.

## Reproduced baseline

The first five actual-module regression cases produced **four failures and one
pass**. Both supported friction items started with a nominal 2.4 m bolt and
2.45 m hole target, including the selected 46 mm × 3 m item. A complete real
fixed-step run began its installation at **2.464451 m**, shorter than the
selected tube. Its par time was identical to the 2.4 m item. Missing, unknown,
resin and cable selections all exposed the same 2.4 m as though verified.
Resin's existing spin/gel/hold lifecycle passed before changes.

The baseline site card displayed an Anchorage percentage, an ideal-hole
comparison and a statutory torque-test claim. Its numeric source was a
normalized game fit score; none of those fields established a load capacity.

## Independently verified primary evidence

The [manufacturer SS-46 product order table](https://www.splitset.com.au/product/split-setstabilisers-ss-46/)
explicitly lists a 3,000 mm tube, standard identifier 90321563 and galvanized
identifier 90321787. It identifies the family as nominal 46 mm. This is direct
support for the game's selected 3 m tube, without borrowing dimensions from
the differently labeled 47 mm catalogue family.

The [manufacturer SS-39 order table](https://www.splitset.com.au/product/split-setstabilisers-ss-39/)
lists the 2,400 mm tube, standard identifier 72243462 and galvanized identifier
90321258. Neither length is inferred from consumable life, price or the
player-facing name.

The [SS-46 installation instructions](https://www.splitset.com.au/ss-46-stabiliser-installation/)
specify the hole beyond the bolt length using a 5 cm metric representation.
They also require site pull testing and recorded driving time to establish
anchorage; length or nominal bit compatibility alone is not proof of capacity.
The existing 0.05 m hole allowance is retained explicitly in that metric
convention, rather than presented as an exact inch conversion.

## Current actual-source result

`node tools/checkdomain-followup-adversarial.mjs` now passes **9 cases, zero
failures** against real `src/sim/drilling.js`, real data, and the actual
`boltUnitCard` / `resinInstallStep` functions consumed by `site.js`. The test
does not reconstruct a copy of the simulation or UI rules. It starts real
programmes, drives public controls through actual installations, then hands
their telemetry to the real UI mapping.

- The selected 3 m tube produces a 3.05 m target. Installation begins at
  **3.052656 m** in the independent fixture. Par rises from **20.259660** to
  **20.859576 player seconds** for the longer selected tube.
- Mid-run loadout replacement preserves the captured 3 m length through the
  actual installation; the next start resolves the newly selected 2.4 m item.
- An additional restart-order attack compares the formerly long-run instance
  with clean short and unknown-item instances. Initial par, hole depth, string
  depth, torque and target match exactly. After 60 fixed steps, par, hole
  depth, string depth, ROP and torque still match exactly. Source inspection
  confirms `newRunState()` clears `prog` before `startProgramme()`, which runs
  before `computePar()`. The previous 3 m capture cannot leak into these
  newly started runs.
- Missing/unknown/cable/resin selections expose verified `boltLengthM: null`,
  `modeledBoltLengthM: 2.4`, and an explicit `NOT SOURCED` fallback basis.
  This preserves the old bounded programme without claiming new dimensional
  evidence for these selections.
- Real supported, undersized, oversized and unknown friction installations
  map to **In range**, **Too small**, **Too large** and **Unknown**. The three
  card rows describe trial fit, effective bit and trial range. They contain no
  Anchorage percentage or ideal-hole claim. Notes require verification instead
  of declaring load capacity or a statutory sample interval.
- The completed install record controls the card even if current programme
  fields differ. A historical record lacking fit-score provenance becomes
  Unknown; its old percentage is not upgraded into verified fit.
- Resin retains the real spin, gel and hold sequence. Measured stage durations
  are **1.408333 / 1.200000 / 3.191667 player seconds**, matching the baseline
  combined beat. Each stage maps to the correct actual UI step; completed
  resin cards explicitly label the normalized output **Game score**.

The length author's `node tools/checkdomain-rockbolt-length.mjs` was also
independently rerun: **7 full patterns, 21 real installations pass**, including
three successive long-tube installation entries at 3.05, 3.06 and 3.05 m.
The reported entries are simulation measurements, not validated field rates.

The UI author's `node tools/checkdomain-rockbolt-ui.mjs` was independently
rerun: **9 cases pass**, including unknown/legacy records, skipped support,
actual source card wiring and the resin stage mapping.

## Verdict and limits

No measured blocker remains in the bounded source/semantics changes. Selected
length drives the live hole target, par/drill-string consumers and recorded
telemetry; source inspection confirms one captured length authority per run.
UI mapping exports are used directly by the actual card and beat consumers.

This review does not certify browser layout, touch reach, GPU rendering or
real structural capacity. The 46 mm family still lacks a matching bit in the
current small-bolting catalogue and is correctly shown as an undersized trial
with the supplied 38.1 mm bit. Missing/unknown selections remain playable
legacy simulations; explicit unknown length is not an ownership/availability
gate. Cable/resin dimensional evidence and physical cure parameters are not
newly established. Existing downstream results/shell and capacity selection
are separately owned by the parent integration task.

# Driven pile energy — verified 2026-09-06

CRITIQUE 13f still reproduces on the delivered progression baseline. The only
catalogue impact hammer is `impact-hammer-9t`: its description says 9 tonnes,
106 kNm, 1.2 m stroke and 40–100 blows/minute. Simulation instead used 16,000 kg,
1.5 m, 30–100 blows/minute. Maximum energy command at minimum rate returned
235 kNm (hydraulic proxy cap), with a 235.44 kNm potential ram ceiling.

## Primary evidence and definitions

- [Manufacturer HHK7A / HHK7/9A datasheet](https://junttan.com/wp-content/uploads/2015/10/Junttan_HHK_7A_datasheet.pdf),
  page 2, **technical details with extensions, 9T**: 9,000 kg ram, 106 kNm
  maximum energy, 1.2 m maximum drop, 40–100 blows/minute. Its separate base
  7T column is 7,000 kg / 82 kNm; these configurations are not interchangeable.
- [Current manufacturer HHKA product table](https://junttan.com/product/hhka-series/),
  HHK9A column, retrieved 2026-09-06: independently agrees with the four values.
  It separately lists 13,500 kg hammer weight. That includes more than the ram
  and must not replace ram mass in the potential-energy calculation.
- The PDF's 156 kW is **theoretical hydraulic power output**, alongside 235 bar
  and 398 litres/minute. It is not a measured mechanical power curve at the ram.
  No conversion of this number into a delivered hammer-energy ceiling was made.

Using the simulation's existing 9.81 m/s² gravitational acceleration, ram
potential at full drop is **105.948 kNm**. The catalogue rounds this to 106 kNm.
The corrected module retains that distinction: no stroke inflation or gravity
adjustment is used to force exact equality. Delivered pile energy remains
subject to existing cushion/alignment modelling and is not claimed to equal
catalogue energy.

## Change

The item now owns `impactHammer` physical fields with the primary page citation.
Simulation consumes that profile for its default hammer and resolves a fitted
impact profile at the next hole start. This replaces the independent 16T
constants. Each run gets its own resolved method; later loadout changes cannot
silently modify an active drive. Telemetry identifies the simulated hammer,
ram mass and catalogue rating.

The existing 12 kNm minimum and 7,050 kNm/min coupling remain **NOT SOURCED**
for this 9T configuration. They are retained gameplay tuning, explicitly
labelled beside the constants. Multiplying 106 by the independent minimum
rate would not establish a manufacturer curve, so that was not done. The
physical ceiling uses the lower of potential, rated and proxy power limits.
The affected item description now states only the sourced ram, energy, stroke
and rate figures. Its previous claim that every rate increase reduces energy
was removed: separate catalogue bounds do not prove that curve, and the
retained proxy does not reduce available energy below its power-limit knee.

## Executable measurements

`node tools/checkdomain-pile-energy.mjs --source-root .qa-domain-mechanics/driven-pile`
passes six cases against actual candidate source modules. The same command
without the optional source-root argument reads the real worktree `src`.
Before parent integration it fails five cases and passes one; maximum-command
failure reports **235 versus 105.948 kNm**. No simulation equation was copied
into a stand-in implementation.

| Actual candidate simulation command | Energy displayed | Drop | Rate |
|---|---:|---:|---:|
| Full energy, minimum rate | 105.9 kNm | 1.200 m | 40 bpm |
| Full energy, maximum rate | 70.5 kNm | 0.799 m | 100 bpm |
| Minimum energy, maximum rate | 12.0 kNm | 0.136 m | 100 bpm |

The first deterministic drive records 64 blows and 2.42 m toe penetration after
800 fixed steps, with nonempty blow logs. `update(0)` publishes 105.948 kNm to
the real `state.drill` consumer after the fixed-step test. The last two energy
values test preservation of the explicitly unsourced proxy, not manufacturer
performance. Control values below/above range remain within 40–100 bpm and
1.2 m maximum drop. Missing hammer uses the explicit 9T default; fitted profile
resolution is tested at a new run.

## Remaining limitation, deliberately not invented

`vibro-hammer-1500` is also sold for `driven-pile`, but the existing programme
uses impact physics and a set measurement for it. The regression reports the
fitted vibro ID and actual default impact ID separately. A vibratory hammer has
no ram stroke or impact set; it cannot be fixed by filling the impact profile
with its centrifugal-force rating. Correcting this needs a separate vibratory
programme or an explicit availability decision, outside this bounded 13f fix.
The test records this residual; its presence is not a realism pass for vibro.

The normalized set model, economic rates, pile/refusal scoring and existing
progression run/attempt lifecycle are unchanged. No claim is made that this
small physical-envelope correction validates those broader models.

Root merged both reviewed domain candidates and reran the unqualified pile
command against the real worktree: six pass, zero failures, with the same
measurements above. The 12 rockbolt scenarios, eight independent combined domain
cases and all 83 prior progression cases also pass, as do data and career gates.

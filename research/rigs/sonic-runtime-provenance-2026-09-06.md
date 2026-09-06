# Sonic runtime capability follow-through — 2026-09-06

The procedural builder published 180 kN despite the sourced Blender maximum
being 222 kN. The rig's player description also claimed a 90–160 Hz operating
band. The two scoped changes publish 222 kN and describe frequency as adjustable
up to 150 Hz. Existing field names remain compatible; adjacent comments identify
both as capability ceilings, not operating setpoints or feed force.

## Primary evidence

Independently reopened on 2026-09-06:

- [Manufacturer's TSi 150CT datasheet, page 2, REV 11/2024](https://www.terrasonicinternational.com/wp-content/uploads/2025/04/150CT.pdf):
  oscillator 222 kN and adjustable 0–150 Hz. Pullback 74.7 kN and downforce
  50.3 kN appear as separate specifications. These values are manufacturer
  rounded figures, not new conversions.
- [Manufacturer's TSi 150 Series head page](https://www.terrasonicinternational.com/products/tsi-sonic-heads/):
  explicitly qualifies the 50,000 lb force as an upper capability and gives
  the same frequency limits. No displacement amplitude or force waveform
  convention is established by these two sources.

The official PDF was read through extracted page text; this task did not render
its pages. The earlier sonic correction report records separate local brochure
page renders. No real maker/model name was introduced into player-facing text.

## Consumer audit and boundaries

Searching current `src/` for `oscillatorKn`, `oscillatorHz`, `force_kn` and
`freq_hz` found only the procedural spec assignment. The rig API returns that
spec and also attaches it to the built root's `userData.spec`; there is no
dedicated consumer converting those fields to force, Hz or displacement.
The shop renders the description through `listing.description`.

The simulator uses a normalized resonance centre 0.62 and width 0.12. It does
not consume these capability fields, so this correction does not calibrate its
resonance model. Procedural animation still uses `sin(t * 78) * 0.004` with a
rotation multiplier. That is about 12.4 cycles per second in the time variable,
not a sourced 150 Hz displacement animation; this task does not change it.

The separate content `feedForce: 90` remains unresolved and unchanged. Source
search finds it mapped by the catalog and displayed by the garage, rather than
read by `drilling.js`. It must not become 222 kN by equating oscillator force
with pullback or downforce. The description's remaining no-flush/core-quality
claims were outside this narrow correction; they are not verified here. Runtime
and content mass/power/torque differences are also outside scope.

## Verification and delivery

`node tools/checksonic-capabilities.mjs` passes without browser or GPU. It
constructs the actual procedural rig system, reads its published spec for both
supported methods (sonic and auger), and compares the maximum capabilities
against the sourced values and actual Blender declarations. It also checks the
published description. This is a provenance/API check, not an animation or
geometry measurement, rendered quality check, or physical force validation.
Restoring each old production file separately made this gate fail at its
respective force or description assertion; restoring the candidate passed again.

The patch changes only two production hunks: sonic spec in `rigFactory.js` and
sonic description in `data.js`. It does not replace entire files. The private
`baseline/` retains the exact original snapshots used to form these hunks.
Root should apply `sonic-runtime.patch`, then copy this report and the new gate
by explicit path. No original repository, Git index, GLB or shared library was
written by this task.

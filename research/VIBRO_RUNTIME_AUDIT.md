# Vibratory hammer runtime audit

Historical pre-containment investigation. The mechanism substitution below was
reproduced on the recorded source snapshot. Current production refuses unsupported
vibratory starts and acceptance through the shared equipment-support guard; see
VIBRO_START_GUARD.md and VIBRO_SITE_RECOVERY.md. Preserve the old standalone
diagnostic as historical reproduction, not a passing post-containment gate.

2026-09-06. Read-only production investigation; no physics, catalogue, economy,
UI, assets or default-check wiring changed. This follows the explicit residual
in `research/domain-pile-energy.md`; it does not reopen the verified 9 t impact
energy correction.

## Finding: a supported equipment choice silently runs the wrong mechanism

`vibro-hammer-1500` is listed for `driven-pile` at `src/game/data.js:2876`, in the
hammer slot, with a 1.35 ROP multiplier. `itemsForMethod` returns it and the real
`canEquip` accepts it for an appropriately levelled owner. `DOMAIN.md:214` also
lists it as a piling driver.

At `src/sim/drilling.js:2192`, `resolveMethod` only recognizes an item's
`impactHammer` profile. The vibro has none, so resolution falls through to the
method's default 9 t impact profile. `startHole` captures this profile at line
3453. This is a live mechanism substitution, not just an incorrect caption:
the impact programme updates penetration and dolly wear by blows, publishes
ram energy/drop/blow rate at lines 8395–8418, and offers a ten-blow `takeSet`
action at lines 7849–7860.

## Independent minimal reproduction

Run from the integration repository:

```powershell
node tools/audit-vibro-runtime.mjs
```

This standalone diagnostic imports the actual catalogue, contract and simulator
modules. It creates a deterministic QA contract (14 m, seed 123), checks real
catalogue/equip availability, and performs 800 fixed steps with full energy,
minimum rate and centred alignment. Both hammers are tried on the concrete
pile and Z sheet-pile pair. No real field performance is inferred from this
synthetic scenario, and no progression settlement is instantiated.

For each pile product, the entire returned programme and published impact
fields are deeply identical between the two hammer choices:

| Measured field | Equipped impact | Equipped vibro |
|---|---:|---:|
| Resolved hammer | impact-hammer-9t | impact-hammer-9t |
| Simulated ram mass | 9000 kg | 9000 kg |
| Displayed energy | 105.9 kNm | 105.9 kNm |
| Displayed ram drop | 1.2 m | 1.2 m |
| Rate | 40 blows/min | 40 blows/min |
| Recorded blows | 64 | 64 |
| Toe penetration | 2.42 m | 2.42 m |
| Measured set | 16.15 mm/blow | 16.15 mm/blow |
| Blow-log rows | 9 | 9 |
| `takeSet` | accepted, 10 blows | accepted, 10 blows |

The real `state.drill` consumer publishes approximately 105.948 kNm and 1.2 m
drop for both. The diagnostic observes `founded=false` at this short endpoint;
it does **not** establish a falsely paid bearing-capacity result. It does
establish that vibro enters the same impact measurement and action path.
The unequal item ROP values do not change these tested simulation results;
this is not a claim about every economic modifier elsewhere.

The diagnostic exits 0 only when this recorded defect is reproduced, prints
`DEFECT_REPRODUCED`, and is intentionally outside default checks. Once repaired,
replace its defect assertions with the agreed compatibility/programme contract.
Syntax validation and all four diagnostic runs passed.

Captured source SHA-256:

- `src/game/data.js`: `3c442ae7e9ea4a15773e6225de6f0303acaa33e5f06a7bb4936d74a8e33d0b3b`
- `src/sim/drilling.js`: `4425802803bcd725a058b78b5d8fc4eee5ea60fcfa81d2d89e5b798b09b44764`
- `src/core/contract.js`: `a374211146b86c5dbc5ea88eb28a49e0505805fa486d585a1531e810414549b5`

## Primary physical guidance checked

FHWA GEC 12 Volume II, section 15.17, printed page 376 (PDF page 408), describes
an alternating axial force from paired eccentric weights. Its variable-moment
description separates operating frequency from eccentric moment during startup.
That is a different mechanism from a dropped ram and permanent set per impact.
Printed page 298 (PDF page 330) discusses the limitations of deriving nominal
resistance from vibratory installation and additional verification during
restrike. Thus the game's absolute suggestion that bearing capacity cannot be
proved should become a statement about the missing installation measurement,
not a claim that installed piles cannot be verified by other methods.
[FHWA official Volume II PDF](https://www.fhwa.dot.gov/engineering/geotech/pubs/gec12/nhi16009_v2.pdf).
The web viewer rejected its size; the official PDF was then fetched into memory
and these pages were independently extracted with pypdf. No downloaded copy was
added to the repository.

The existing primary
[Bauer April 2025 equipment catalogue](C:/Users/henri/Downloads/geraetekatalog_catalog_of_machines_bauma_2025_bauer_maschinen.pdf),
printed/PDF page 7, confirms a real vibrator class with 1500 kN maximum
centrifugal force, 2500 rpm maximum speed, approximately 5070 kg equipment
weight, 480 kW hydraulic power and 7000 kg recommended maximum pile weight.
Its hash is `1e4e027b880458abbbbd4cc1b27d1248ad70221dc38c661ac28fe9e928975a01`.
This independently checks the reference already summarized in research packs
05 section A3 and 10 section B.6. The catalogue item lacks a citation selecting
that exact reference, so matching the 1500 kN title is a **candidate mapping**,
not proof that every other specification belongs to the shipped item.

For comparison, a manufacturer's separate vibrator product page publishes
eccentric moment, centrifugal force and frequency as distinct fields. Its
values must not be transplanted into this differently rated item.
[Dieseko PVE 150M product page](https://diesekogroup.com/products/vibratory-hammers/pve-150m/).

Force in kN is not energy in kNm. A centrifugal-force ceiling cannot populate
`ratedEnergyKnm`, infer a ram mass/drop, or establish a per-blow set. Likewise,
published maximum frequency and maximum force alone do not supply calibrated
penetration, wear, soil-response or bearing-acceptance equations. No such
conversion or tuning was made here.

## Recommended next implementation: explicit support boundary first

The bounded next job should prevent an explicitly selected vibratory item from
silently starting an impact programme. Use a shared equipment-support check for
equipment presentation, equip/preflight and actual hole start. Show a concrete
unsupported-programme reason while preserving already owned inventory and saved
loadouts; do not replace the item, charge for another hammer, or delete saves.
Keep the reviewed impact programme and intentional missing-hammer default
behavior separately specified and tested.

Placement matters: `startHole` currently calls `progression.beginHole` before
it resolves the method, then resets run state. A late exception in
`resolveMethod` would already have mutated attempt state. Validate a proposed
run's equipment before either operation, and recheck at start even if a previous
UI/preflight succeeded. Coordinate with the active contract-readiness owner;
do not create a second acceptance authority in parallel.

Acceptance cases for that bounded fix: valid impact unchanged; explicit vibro
cannot begin an impact attempt through UI, public start or a restored loadout;
failed preflight/start has no run/attempt, money, XP, event or inventory side
effects; missing equipment follows its explicitly retained contract; changing
equipment after a successful preflight is revalidated at start. The existing
pile-energy residual assertion must then be updated, not left expecting the
incorrect fallback.

## Subsequent full vibratory programme

Enabling vibro should be a separate implementation with a sourced selected
driver profile, compatible mounting/clamp/pile rules, and distinct telemetry.
Its controls should represent crowd or line pull, operating frequency and
eccentric moment where the selected machine actually supports those controls.
Record penetration over time and vibratory operating state; omit ram drop,
impact blow logs, dolly-per-blow wear and `takeSet` while in vibratory operation.
Bearing verification needs an explicit separate completion requirement or
follow-on impact/testing phase. Installation depth alone should not silently
satisfy the impact programme's acceptance rule.

Still unknown: exact reference mapping for this item; supported clamp/carrier
combination; operating rather than independent maximum envelopes; amplitude
convention and loaded response; soil-specific penetration calibration; vibration
and wear models; and the intended contract requirements for sheets versus
load-bearing piles. Retain **NOT SOURCED** on any provisional game abstractions.
Do not hide those gaps behind the current 1.35 multiplier. No production patch
for either containment or a full vibratory programme is part of this audit.

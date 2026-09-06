# Unsupported vibratory hammer containment

Measured 2026-09-06 in the private `codex/vibro-start-guard` checkout, baseline
`83b2347`. This is a containment candidate, not a vibratory simulation.

The historical `VIBRO_RUNTIME_AUDIT.md` reproduced an explicitly selected
vibratory hammer running the default impact programme. The new shared pure
`checkEquipmentSupport(methodId, hammerId, lookupItem)` refuses a known
driven-pile hammer without an impact profile. It consumes the existing data
authority, imports neither progression nor simulation, and changes no inventory,
balances or physical constants. Missing equipment retains the existing default.

`resolveMethod` throws an Error with code `unsupported-piling-hammer` and the
method/item IDs. `startHole` resolves the equipment before reading `beginHole`,
resetting run state or allocating an attempt. Its exported `checkMethodEquipment`
wrapper returns the same detached support result for inspection. A failed start
preserves an existing active impact run and its deterministic continuation.

## Acceptance must also reject before payment

Independent review reproduced a foreign contract charging EUR 6,077 mobilisation
before the initial start guard refused it. Therefore the simulator guard alone
is not an acceptable integration. The separate `vibro-progression-proposal.patch`
in the coordination directory adds the same shared helper to current root's pure
`preflightContract`. Both preview and actual acceptance consume that preflight;
acceptance rechecks equipment drift before payment or opening a contract.

The full proposal is based on root progression SHA-256
`9616eeba4f5eef1ac3ca5e03ae0bfe2acca7910e175dfbc1fd6abf5bbc03c834`.
Its proposed SHA-256 is
`17dad78651aecd63147625a8368f0bb5e52a0a8736c508226253aa678b5b849e`.
Private progression remains at the older baseline and is deliberately unedited.

## Validation

Run from the private checkout, with the full current-root progression proposal:

```powershell
node tools/checkvibro-start-guard.mjs --progression-proposal C:/Users/henri/Downloads/threads/drillity-coordination/vibro-progression-proposal.js
node tools/checkvibro-start-adversarial.mjs --progression-source C:/Users/henri/Downloads/threads/drillity-coordination/vibro-progression-proposal.js
```

- Author gate: **13/13 PASS**. Real progression, storage and event fixtures cover
  paid/restored jobs, failed replacements, equipment drift, recovery, 100 foreign
  refusals with no delayed save, and absent-hammer defaults. Six 800-step paired
  drives cover the one shipped impact profile with concrete/sheet piles and
  low/high rate and minimum energy settings. Other 20 methods and missing-hammer
  resolutions match baseline exactly.
- Independent critic: **10/10 PASS**. Refusal precedes even reading attempt,
  seed/target, RNG and clock hooks. Twelve rejected replacements preserve a
  1,220-step active impact continuation exactly (126 blows). Recovered acceptance
  charges mobilisation once. The unmodified current-root progression negative
  control fails exactly the two new preflight tests (8 pass, 2 fail), proving
  the tests distinguish the prior payment defect.
- The author gate imports simulator baseline via `git show
  83b2347:src/sim/drilling.js`; that commit must remain available in test history.
  Once all proposals are integrated into root, both gates use actual progression
  without an override. Running them without the override in this stale private
  checkout is not an integrated validation.
- Existing `checkdomain-pile-energy.mjs`: first five cases pass; the sixth
  deliberately expected the old vibro fallback and now fails. Its separately
  proposed containment assertion passes **6/6**, preserving the original impact
  measurements. Historical runtime audit and diagnostic are retained as defect
  evidence; their old fallback expectation is not relabelled a current success.

## Player recovery integration update

Root integrated the shared guard and preflight together and reran13 author,
10 independent and6 existing impact cases successfully. Real site refusal now
returns to Garage with an actionable warning; Continue resumes the retained
contract after fitting impact. Six actual-DOM cases pass in both the initial
integrated run and final accessibility/resource-gate correction. See
VIBRO_SITE_RECOVERY.md. The following paragraph preserves the original proposal
history; its pending-UI status is superseded by this update.

## Original player-recovery proposal (historical)

Current site mounting catches start errors only in the console and continues.
Already accepted/restored jobs, or loadout drift after acceptance, still require
visible recovery. `vibro-site-recovery-proposal.patch` proposes returning from
that failed mount and, in a guarded microtask, navigating to Garage before showing
the existing warning toast. This preserves the accepted job and lets the player
fit an impact hammer. Deferral respects shell scene assignment after mount;
the site itself prohibits floating toasts over its 3D stage.

That UI patch is a separately owned proposal, **not applied or DOM/GPU tested**.
The HUD owner must review lifecycle, navigation and visible recovery before
acceptance. The main QA start caller already propagates the thrown Error before
its later depth seeking. Earlier world/rig setup in that caller and site setup
writes are outside the simulator's atomic boundary; no broader rollback claim
is made.

Integrate helper/simulator and current-root progression proposal together, update
the old pile-energy assertion, then complete visible site recovery. Do not hide
the owned vibro, substitute another item, refund/abandon a job implicitly or
present this as completed vibro physics. A physical vibratory model remains the
source-led follow-up described in the historical audit.

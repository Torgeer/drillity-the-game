# Rock-bolt HUD semantics — 2026-09-06

The actual `src/ui/screens/site.js` rock-bolt unit card no longer formats the
simulation's fit score as physical **Anchorage %**, compares a modelled hole to
a fictional ideal, or calls the crew's authored torque sampling schedule
statutory.

`boltUnitCard(programme, telemetry)` is exported and directly consumed as
`UNIT_VIEWS.bolt.card`. It uses the last installation record's `diameterFit`,
`anchorageBasis` and `bitGaugeMm`, with the programme's captured
`bitTrialRangeMm`. Three compact rows show Trial fit, Bit and Trial range.
Supported means **In range**, with a note to check anchorage by pull test;
undersize/oversize ask the player to check the bit and bolt pairing. Missing range
or basis is **Unknown**, and null physical numbers remain dashes. Abandoned
records say Skipped and do not inherit a live supported-fit claim.

The source for the trial-range meaning and field testing remains the verified
manufacturer evidence recorded in `research/domain-rockbolt-mechanics.md` and beside the
item fields in `src/game/data.js`; no physical capacity is calculated by this
UI mapping. The previous slot-inspection message claiming full rock-to-metal
contact now identifies a modelled slot closure and recommends a pull test.

Resin keeps two rows, **Game score** and Crown, with an explicit distinction
from capacity testing. The score uses actual installation `quality01`; the
simulation's spin, gel and hold mechanics are unchanged. `resinInstallStep`
is exported and consumed directly by the live beat renderer. It uses the
simulation's `installStage` instead of trying to reconstruct the cure stage
from a remembered gel-hazard frame. Unknown or completed stages have no stage
highlight.

The installed card title uses the completed record's index. The programme
cursor already points to the next bolt at the unit boundary, so the old
`p.boltIndex` title could call the first completed bolt Bolt 2.

The bolt-install caption now says **Insert the bolt, then seat the plate**.
This follows the actual `finishBoltInstall()` transition into `bolt-plate`.
It replaces the claim that drive time indicates fit: the friction install
beat currently has a fixed, explicitly unsourced gameplay duration. The
outside-range note asks players to check the pairing without implying every
manufacturer trial diameter has a purchasable matching bit in this catalogue.

## Executable evidence

`node tools/checkdomain-rockbolt-ui.mjs` passes **9 cases**, importing actual
UI exports and producing six fixtures with the real simulation:

- Supported 38.1 mm gauge / 35–38.1 mm trial range → In range.
- Undersize 33 mm → Too small; oversize 39.1 mm → Too large.
- Unknown install family → Unknown and absent range shown as a dash.
- Selected 46 mm family → its own 41–45 mm range.
- Missing metadata and skipped records cannot become supported or zero-mm claims.
- Real completed resin installation retains Game score and a capacity-test caveat.
- Real spin/gel/hold telemetry maps correctly even without remembered hazard
  frames; completed resin and friction programmes have no resin stage highlight.

No CSS, native controls, DOM layout, authored motion or non-bolt mappings were
changed. The existing two/three-row capacity is retained. These CPU checks do
**not** prove rendered text fit, overlap, 44 px target sizes, reach or visual
quality; a browser review remains the root task's queued work.

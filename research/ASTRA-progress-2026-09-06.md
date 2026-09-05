# ASTRA implementation checkpoint — 2026-09-06

Integration branch: `codex/astra-improvements`, starting at `8a1546a`.
This checkpoint records a measured implementation batch, not an AAA verdict
or completion of the entire ASTRA queue. The complete build passed after the
UI motion/reach changes: 19 shipped rigs and 20 external assets, 51,317,348
asset bytes, one inline game script. The subsequent urban-site integration
passed its 13 real-loader checks, and the restored numeric HUD passed four
headed layout/motion cases. Runtime rig metadata is integrated and passed
72 checks with its matching 19 rebuilt exports. The subsequent feed-position
envelope and authored-rake adapter commit `1cb148c` passed 80 checks in the
integration checkout. Hero-camera CPU framing passed 2,904 checks across 342
actual poses, but headed proof remains queued. A fresh full build remains due
after the current integrations finish.

## Interrupted WIP reviewed and finalized

The six files from `4ddbdbf` were reviewed. RC corrugations now follow the
actual AUTO-handled Blender hose spline; contact jaws retain worn steel. The
fresh export has 36 primitives, 70,804 triangles and 4,706,976 bytes. Overall
working-pose bounds remain 7.883 × 7.215 × 7.608 m. These are vertex bounds,
not a sourced machine width. The sample hose still has no runtime deformation
consumer; the source now says so explicitly.

Quarry conveyor supports now meet the pitched beam underside, and the end
drums are centered across each belt. The fresh export has 6 primitives,
13,936 triangles and 961,304 bytes; overall bounds remain
71.370 × 16.268 × 54.654 m. CPU renders prove these local geometry fixes;
the historical edge-speckle renderer hypothesis remains unverified. See
[`rigs/wip-finalization-2026-09-05.md`](rigs/wip-finalization-2026-09-05.md)
and `tools/verify_blender_wip.py`.

The motion fit now constrains bounded curves to 0–1, fixes the spring endpoint,
and exports actual Blender F-Curves to JS and CSS. Eleven curves pass the
Blender comparison at 4,097 samples each and the JS/CSS reference check at
8,193 samples each. Durations and curve shapes are explicitly authored design
choices, not sourced perceptual facts. The runtime exports are checked in;
`npm run motion:export` regenerates them and `motion:verify` checks them.

The entrance reuses an owned, loaded Blender machine instead of requesting
the absent `models/title/title.glb`. Title and game program readiness are
separate; late title readiness is cancelled; the hand-off releases title
geometry and retains one frame loop. Four headed cases passed in the accepted
review harness: normal, held/resized, delayed title readiness, and
GLB-off/reduced motion. The permanent `tools/checkentrance.mjs` also passed all
four integrated cases, including visible pixel variation, program readiness,
cancelled late title readiness and exactly 20 app frames for 20 rAF callbacks.
The local report is `shots/entrance-check/report.json`.

The deleted `.hudqa/unitfix-report.txt` was a generated historical capture of
an older HUD, not executable code or a source authority. Its contents remain
available at `4ddbdbf^:.hudqa/unitfix-report.txt`; restoring it would not validate
the current layout. Current DOM evidence replaces it.

## Runtime fixes and regression gates

- GLB-only rigs now work through saved selection, switching, uncached specs,
  scene caches and previews. Normal fallback follows declared data; strict
  mode refuses missing or broken Blender models. A late loaded model replaces
  its prior stand-in. Preferred cache source and actual built source have
  distinct APIs so a fallback cannot be reported as a successful GLB render.
  The loader regression executes 39 assertions.
- Actual PD55 shop/detail/site rendering was verified. Its preview disposed
  66 geometries exactly once and preserved shared materials; the cached
  stand-in image was replaced. Tall-machine framing is still open work.
  The integrated metadata now excludes explicitly classified scenery from its
  exact rig-local vertex bounds, before static geometry is merged.
- `boreSDF` uses initialized outputs and one return path. All five section
  modes rendered with the correct loaded Blender rigs, without browser errors,
  warnings, X4000 warnings or lost contexts. Whole-frame counts of 225, 238,
  166, 227 and 228 are not per-rig budgets or FPS measurements.
- Dark paint and chrome now honor explicit wear zero. The material factory
  rejects nonzero transmission before allocation, and all 34 material bases
  default to zero. Twelve wear controls and twelve deterministic paint samples
  pass. The earlier coarse paint texture had already been fixed on the base
  branch; it was not retuned again. See
  [`paint-verification-2026-09-05.md`](paint-verification-2026-09-05.md).
- Model gates now fail for empty, missing, malformed or unreadable exports,
  absent/empty Blender manifests, and incomplete POSITION geometry. They
  reuse the exported parser and actual-vertex measurement in `glbinfo.mjs`;
  there is still one dimension ruler. That ruler now rejects malformed GLB
  headers and refuses partial measurements. The current teststub is measurable
  but remains a developer pipeline proof and is excluded from shipping.
- Contract gates reject null generation and invalid numerical depths, layers
  and windows. The documented unlimited pre-collar `Infinity` sentinel remains
  valid. The real 6,400-contract sweep passes.
- `gel-clock` now has the stop-warning haptic signature. AST-based scanning
  finds all 11 actual forwarded hazard cases, including multiline and
  fall-through handlers. Removing a live mapping fails regardless of formatting.
- Visual QA now returns a nonzero process status for failures or incomplete
  evidence. It requires valid budgets, actual render metrics and warm,
  unthrottled headed FPS for a performance pass. Render-probe exceptions are
  propagated with renderer state restored. Rig captures load registered GLBs
  and check the actual built source; burn-in has its own warm measurement.
- Vite preserves the binary inlining guard after plugin hooks. The artifact
  contains one inline game shell plus exact public assets, excluding teststub.
  The post-build gate checks the entire output inventory and byte equality,
  rejecting stale scripts and stray binaries. Isolated fixtures test these
  failure paths without modifying real assets or `dist`.

## Active independent work

The urban-site work is integrated as `14a3cb4`: five exported primitives,
29,576 triangles, 17 exported colours and 2,754,112 bytes. Its 13 CPU cases
exercise the actual loader and resources. Seven headed cases in the prepared
worktree verified the loaded site, deliberate 404 fallback and existing quarry.
Urban adds one full-surface draw call in each measured CFA phone view; that is
not an FPS verdict or an all-fleet budget result. See `sites/urban-plot.md`.

Authoring commit `4ba2df2` preserves parent frames through joins and declares
the eight actual endpoint publishers. Runtime commit `7e90ab1` consumes the
declared parent-local axis, directed endpoints and scenery exclusions. Its
matching 19 rebuilt exports passed 72 metadata checks in the integration
checkout; these checks do not establish camera fit or a GPU performance pass.
The feed envelope and authored-rake adapter are integrated as `1cb148c`.
Hero-camera rendering still needs headed verification. The parent team continues
an actual-fleet tool-attachment audit, CFA method-specific capacity integration,
and rate provenance research. The scoped CFA base-rating correction is integrated
as `a9c34c1`: 15 m from the verified manufacturer configuration, with remaining
withdrawal, motion and method-capacity gaps explicitly recorded.

Contract/save reliability is integrated as `dc89553`. The actual simulation
captures run and attempt identity at start, and progression rejects stale or
repeated settlements across abort/restart/reload/reset. All 83 dedicated cases
passed again in the integration checkout (33 acceptance, 28 settlement,
10 persistence adversarial, 12 protocol adversarial). Data/career checks also
passed. The corresponding contract-board source is applied but awaits headed
acceptance/layout verification and a reviewed commit; do not treat the UI
integration as complete from the CPU protocol results.

The user explicitly requested additional tasks on 2026-09-06 after the original
task continued to reject extra agent spawns. Six new tasks have private worktrees
and share the **Drillity-the-game** sidebar section with the parent. The earlier
five standalone tasks remain archived; these six are the active assignments:

| Workstream | Branch | Main ownership |
|---|---|---|
| Blender rig optimization | `codex/rig-optimization` | bolter, crawler-TH, sonic and tunnel-jumbo modules |
| Geology ruler and readability | `codex/geology-ruler` | geology projection/ruler, excluding `boreSDF` |
| Contract board decisions and layout | `codex/contract-board` | contracts screen and scoped new CSS |
| Tool preview framing | `codex/tool-preview` | preview.js and dedicated catalogue/lifecycle gates |
| Blender UI atlas | `codex/ui-atlas` | new authored UI faces, isolated consumer/demo and export gate |
| Contract/save reliability | `codex/progression-reliability` | progression.js, narrow drilling.js run identity, acceptance/settlement persistence tests |

Each task delegates independent work and adversarial review. GPU sessions are
serialized across tasks; CPU research, authoring and tests continue in parallel.
Workstream status is tracked individually: progression is integrated; the
remaining screen/art/optimization work is not yet claimed complete. Its finished
agents have started the next bounded rock-bolt and pile-hammer mechanics review.

The overnight follow-up `drillity-overnight-build` is active every ten minutes
in the parent task. It continues assigning concrete backlog work overnight and
prepares a morning handoff at 08:00 Europe/Stockholm on 2026-09-06. The
coordination directory contains the current GPU lease,
individual task checkpoints and a root handoff. Existing workspaces are reused.
Blocked actions are recorded without escalation requests; permitted work
continues. Local scheduled work requires the computer on and the app running.

The parent HUD now reserves native 44px rail controls instead of borrowing
neighbouring rows through pseudo-elements. Pressing changes the inner label,
not the button's bounds. Ordinary depth/target is restored until rendered ruler
validation, using the elapsed-time cell's room. `tools/checkuimotion.mjs` passed
DTH/RC at 390×844 and 320×568 with zero overlaps, clipped content or undersized
native controls; it also checks Blender curve consumption, reduced motion and
confirmation focus races. Report: `shots/ui-motion/current.json`.

## Remaining limits

The compact HUD still gives the 3D substantially less than the approximately
82% target. Fixing navigation and overlap does not satisfy that broader design
brief. Other rAF/machine animation consumers and Blender UI art remain beyond
the CSS motion adoption in this batch. Fleet performance needs warm actual-GLB
captures after the model work; cold captures are not performance verdicts.

Cable-percussion identity and the Blender/procedural tooling-wear approach
remain the owner decisions recorded in ASTRA §9. Economy/rate provenance,
uncleared fictitious marque prefixes, survey-confidence gameplay, and other
unassigned queue items remain open. `checkdata` also reports the existing
auger/site-investigation/cased-CFA ground-ceiling warnings. No verified-facts
document was edited to excuse a code mismatch.

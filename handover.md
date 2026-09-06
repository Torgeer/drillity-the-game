# Drillity handover for Claude

## Reserve resources — 2026-09-06, 04:30 heartbeat

Live allowance7% remaining. Root QA server5198/session22747 was stopped after
all captures/build checks finished; PID248 and listening socket5198 are absent.
The user's5178 server/PID30152 remains live. Root browsers are closed and the GPU
lease is empty. This supersedes older notes saying5198 remains live. Reviewed
source/build and pending-work snapshots are preserved; no new long jobs started.
Actual GitHub push is still due at the mandatory5% orderly shutdown.

## Handoff inventory update — 2026-09-06, 04:24 heartbeat

`research/CURRENT_BUILD_ASSETS.json` records hashes and byte counts for all57
built files from reviewed source commit4e6e9a3: one shell and56 public assets.
Every external asset was compared byte-for-byte with its public input. These
hashes help Claude check the ignored generated outputs against the current
passing build; they do not substitute for rebuilding source or runtime checks.

Two atlas harness/config files changed after its original13-file patch and are
now preserved in `handoff/pending-2026-09-06/atlas-later-wip/`, with exact hashes.
All four atlas production files still match its original inventory. Keep both
the original patch and these later WIP copies; neither has rendered acceptance.

Final source review of the blocked rig-performance harness found a false-fail
condition: it demands `timeOfDay === 0.34`, but the frozen environment setter's
normalization returns `0.3400000000000001`. Root reproduced this arithmetic.
Correct the harness against the actual environment contract before attempting
its runtime cases. Its existing sample tests do not cover that identity check.
The dependency-access boundary and zero-of-eight runtime result still apply.

## Quarry integration update — 2026-09-06, 04:14 heartbeat

This supersedes the quarry DEFER verdict below and in the historical pending
bundle. The texture discrepancy was reproduced as an unfinished generation
state: candidate blastedRock had a bound map whose live set was not ready.
Waiting for assets.js's actual queue completion restored the rock texture
without changing source or asset bytes. Both variants reached26/26 ready sets,
zero pending/failed jobs. Four new uncased/cased capture cases passed without
errors; root and an independent critic inspected the candidate images and
approved the narrow fix. Prior loading-state images remain preserved.

The exact author/export pair is now integrated: five objects removed from the
live borehole, all1,025 authored survivors unchanged; candidate0/13,840 actual
triangles intersect the live envelope versus65 original intersections. New
quarry collision/adversarial gates are wired into the CPU site checks. Report
`research/sites/quarry-live-collar-integration.md` gives source/asset hashes,
commands, evidence and limits. The GLB remains ignored generated output. This
fix does not address texture-loading presentation or claim an FPS improvement.

Full `npm run build` session79902 exited0: expanded CPU suite, headed reach,
Vite and artifact audit passed. Log `.bak/integration-build-quarry.log`. Artifact
has one inline script,19 rigs and56 public assets/53,941,561 external bytes;
its quarry GLB hash matches the reviewed candidate. The quarry export is6,144
bytes smaller. Build browser closed and lease released; root5198/user5178 remain
live. This is the current passing build, superseding the older byte count below.

HUD, atlas adoption and optimized-rig runtime remain unintegrated/preserved.
Claude owns its eight new environments. Allowance last checked8%; no new long
assignments or replacement task will be started in reserve mode. Mandatory5%
orderly handoff/push remains unchanged; no actual push yet.

## Reserve checkpoint — 2026-09-06, 04:08 Stockholm

This update supersedes the older statuses below. Live active Codex allowance
was **8% remaining** at this heartbeat. No new long work was assigned. Reviewed
production HEAD remains9317284; no production source or generated asset changed
after the successful full build described below. Actual GitHub push remains due
at the mandatory orderly shutdown threshold of5%.

Four unintegrated candidate deliveries are now preserved as inert patches and
hash manifests in `handoff/pending-2026-09-06/`. Read its README before applying
anything. Their original worktrees, ignored exports and captures are preserved.
HUD's final862 DOM cases have no layout failures, but intended-font and combined
renderer verification remain open. Atlas remains pre-render with stale harness
hashes. Optimized-rig runtime completed no GPU cases: its private dependency
access failed, its server closed, and no performance claim is supported.

Root quarry capture session14014 completed four baseline/candidate uncased/cased
cases, zero errors/request failures, browserClosed true. Root inspected all four
diagnostic images and candidate cased phone image. Removed center dressing is
visible, but candidate rocks are flat gray while baseline rocks are textured.
An independent critic confirmed the difference. Both GLBs have the same six
material definitions and UV attributes; the harness uses separate browser
contexts per variant, so shared cross-variant disposal is not established.
**Quarry source/asset integration is deferred until this confound is resolved.**
Do not claim overall visual acceptance from the passing capture JSON.

Evidence: `shots/quarry-collar-root-preview/report.json` and sibling PNGs;
author/asset pairing is in the preserved private manifest. The report's source
map hashes root baseline quarry authoring, because this was a read-only candidate
asset preview through the existing root server. No private startup denial was
retried. Root GPU lease was released after browser closure; root5198 is still
owned/live and user5178 remains untouched. No other candidate was applied.

## Latest checkpoint — 2026-09-06, 03:50 Stockholm

This section supersedes all historical pending-task descriptions below. Active
Codex usage was11% remaining at the latest wave. At<=5%, orderly checkpoint,
handoff, ordinary GitHub push/verification and heartbeat pause remain mandatory.
No actual push yet. Reviewed source HEAD before this document update: f7207e8.

**Full npm run build passed**, session79082, log
`.bak/integration-build-final.log`:50 CPU gate invocations, headed reach, Vite
and artifact audit. One inline game script,19 shipped rigs,56 public assets,
53,947,705 external bytes, no teststub; index about2,933.75kB. Only QA harness/docs
changed afterward, with syntax and haptic-silence checks passing. Root original
production changes are committed; remaining untracked captures are evidence,
including deliberate historical failures. GLBs remain ignored generated outputs.

### Newly completed integrations

- beedaaf: authoritative contract readiness and focus recovery;60 actual-DOM
  states/218 assertions/234 native >=44px controls. That task is archived.
  Evidence used fallback fonts/reduced motion, not an overall gameplay verdict.
- 37f92a4: hero framing, complete geology profiles/readout caching, denser footer
  texture and isolated instrument grading. Post warmup now follows actual enabled
  SMAA/Bloom/Grade targets, and readiness polling skips retired handles and reports
  counters honestly.10 headed instrument A/B cases pass after bounded exact
  preconvergence (3-5 draws); no comparison threshold changes or post-toggle
  retries.6 resize/quality cases have no late programs or repeated-frame changes.
 12 hero captures verify top/side margins and registration on six actual GLBs.
  These do not certify FPS, unobstructed models, full-shadow coverage or AAA.
  Prior depth-program increments did not recur; their disappearance is not a
  proven shadow-cause diagnosis. Geology task archived.
- 763f0a9: underground lights consume the current rig's live semantic lamp
  contract, including legal rockbolt alternatives.54 CPU cases and5 actual-game
  cases pass; zero steady binding warnings, no geometry/light retuning. Previous
  descriptors could remain stale indefinitely after direct/same-ID model swaps.
  Same-frame pose lag is outside scope. Task archived.
- 38dd193: unsupported vibratory equipment refuses before mobilisation/attempt
  writes rather than secretly using impact physics. Accepted/restored jobs return
  to Garage with a warning, retain the job, then Continue after fitting impact.
  Continue's visible and accessible labels agree.13 author+10 critic+6 existing
  impact tests pass. Actual DOM recovery passes6 cases at390x844 and6 at320x568,
  full/reduced motion, no extra charge or errors/resources failed. This is
  containment, not vibratory physics. f7207e8 preserves small-phone QA and makes
  external source selection use the requested simulator/helper consistently.
- e635ad7: reviewed CPU gates wired into build; headed/browser QA remains separate.
- 9085600: measured21-method rate inventory (9,369 checks) and bounded naming
  research. The old jumbo bit-bonus defect is explicitly historical/resolved;
  current fixture settles30h with both bits. No rate retuning or legal naming
  clearance claimed. Historical vibro reproducer is excluded from current gates.

### Current work awaiting integration

All worktrees are under `C:/Users/henri/Downloads/threads/`; read the matching
coordination checkpoint and fresh hashes before applying any patch.

| Task | Private worktree / status |
|---|---|
|01a07416-0442-7090-b0c1-abd53d5fce6b|drillity-drilling-view-space: actual-DOM612-case HUD matrix still correcting measured clipping/backing-size faults; private intended-font access denied. No final layout/82% acceptance.|
|01a0740d-b430-73c1-9493-d88b63b21439|drillity-ui-atlas-game-adoption: pre-render13-file patch saved; app waiting on approval. No bypass. Consumer/menu candidate not integrated.|
|01a07457-0a59-7251-86b2-3b07b6a66e50|drillity-quarry-live-collar, codex/quarry-live-collar, baseline37f92a4: narrow existing quarry center-dressing correction, tests/export still under review; private Vite denied before binding, no browser.|
|01a0745d-464e-7d92-a02b-c9dfb236599f|drillity-optimized-rig-runtime, baseline763f0a9: bounded actual draw/warm FPS verification for four optimized rigs; harness preparing, GPU lease granted, no measured pass yet.|
|Claude|drillity-claude-sites, claude/site-environments, baseline673f888: eight new sites and site loading/library reserved. Nothing integrated in root yet; review narrow package/gate proposals separately.|

HUD/atlas merges MUST retain root's site recovery catch and menu Continue/aria
fixes. Do not copy their older whole files. Re-run combined UI recovery afterward.
Claude's current checkpoint flags source/analytic site visibility problems and
stale framing assumptions; current hero camera/registration are the authority.
Quarry follow-up independently measured65 actual triangles intersecting the live
throat disk, including one deterministic scatter block as well as center-hole
dressing. No rendered quarry acceptance yet; do not substitute bounding-box or
source-only proof. Matching private export and unrelated-geometry equality matter.

### Visual evidence and remaining scope

Root inspected current PD55/CFA hero,320 instrument, underground longhole/rockbolt
and320 Garage warning images. Tall mast tops and footer/depth labels are visible;
the small-phone warning fits and explains the action. Foreground site props can
still occlude rigs (HDD), and the old HUD still consumes substantial screen area.
This batch does not meet the entire design brief. Current visual notes are in
`research/CURRENT_VISUAL_BRIEF.md`; old CRITIQUE observations
need reproduction rather than automatic acceptance.

Passing JSON evidence is tracked at shots/instrument-grade-converged/report.json,
shots/instrument-lifecycle-postfix/report.json,
shots/underground-light-bindings-verified/report.json and
research/HERO_CAMERA_GPU_MEASUREMENTS.json. PNGs and detailed private QA evidence
remain local in their corresponding capture/worktree directories. Older failed
reports are preserved, not rewritten as passes. No fleet FPS result yet.

All root GPU/CPU browsers closed. Root QA server5198 remains live; user5178 is
untouched and must never be stopped. GPU lease currently optimized-rig-runtime;
check its exact file and owner's closure before transfer. The full build used
user5178 only after its served source matched root; it did not stop that server.
Read coordination/shutdown-inventory.md for paths/resources, refreshing its older
snapshot before the final stop. Final pushed SHA and WIP/asset handoff remain due.

**Status: live working draft, not the final shutdown snapshot.** Updated during
the 2026-09-06 build. The final version must record the exact pushed commit,
remaining WIP and stopped processes after the usage shutdown procedure.

## Owner instructions and stop condition

Read ASTRA.md in full, then research/ASTRA-progress-2026-09-06.md. The owner wants
maximum useful parallel agents, maximum effort, no repeated approval prompts,
and concrete implementation with independent adversarial review. Do not create
placeholder agents or duplicate assignments. Finished sidebar tasks should be
reviewed, integrated and verified, then archived; distinct next jobs get fresh
tasks under the existing Drillity-the-game section/project.

The latest owner instruction is to stop smoothly at **5% usage remaining**,
save all work, write this handover including observations for Claude, and push
completed work to GitHub. Begin preparing checkpoints before the threshold;
below 10%, avoid new long assignments. At 5% or less, stop assigning work,
finish/checkpoint current atomic edits/exports, close owned browser sessions,
collect all task outputs, preserve incomplete changes, finalize this document,
commit reviewed completed work and push. Do not abruptly kill file writes or
delete worktrees. Do not buy credits or redeem resets. The same-account usage
pool is shared by the active agents; unused Spark allowance is not the relevant
remaining budget for the current model.

## Repository and execution

- Original checkout: `C:/Users/henri/Downloads/drillity-the-game`.
- Integration branch: `codex/astra-improvements`.
- Remote: `https://github.com/Torgeer/drillity-the-game.git`.
- Root task: `01a07362-ebfb-7a10-8810-c00b57ea797d`.
- Private task worktrees: `C:/Users/henri/Downloads/threads/drillity-*`.
- Live coordination: `C:/Users/henri/Downloads/threads/drillity-coordination`.
  Read `root-coordinator.md`, individual task files and `gpu-owner.txt` before
  operating. Some task titles were reused before the owner's new turnover rule;
  the checkpoint files describe their actual current scope.
- Overnight follow-up: `drillity-overnight-build`, now every two minutes.
  Its usage shutdown overrides continued work. Pause it after shutdown so it
  cannot restart work against the owner's reserved usage.
- Git authentication was verified with a noninteractive **dry-run** push.
  That check did not push changes. Final push must be verified separately.
- Blender 5.2 is installed and usable through Python/background commands.
  It has already exported the machines, site models and UI art. No live GUI
  connection is necessary. CPU renders are available and were used.
- Poppler: `C:/Users/henri/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe`.

Use explicit `git add` paths, never `git add -A`. Keep source and corresponding
generated assets paired. GLBs are generated and ignored; a fresh clone requires
the documented Blender export commands before model/build gates can pass.
Do not confuse primitive counts with actual renderer calls or CPU timing with
warm GPU FPS. `tools/glbinfo.mjs` is the sole machine-dimension CLI; it measures
actual vertices. Physical facts need primary evidence; unsourced quantities
must remain identified as NOT SOURCED. No transmission above zero.

Some child tasks could read/write their own worktree but their Git common index
was outside that task's writable boundary. They delivered scoped patches instead
of requesting escalation. Preserve those patches and baseline provenance. Do not
retry denied actions or change permissions to evade a boundary.

## Implemented and locally committed

See Git history for exact earlier commits. This is the main behavior change:

- Corrected RC hose corrugations to follow the authored spline; retained contact
  steel. Corrected quarry conveyor supports and drum centering.
- Exported eleven authored Blender motion curves, bounded where required, to
  runtime JS/CSS. Fixed entrance/title cancellation and disposal, preserving one
  frame loop. GLB-only selection, cached source replacement and previews now
  respect the actual built source. Initialized boreSDF shader returns.
- Preserved explicit material wear zero and reject nonzero transmission. Added
  missing gel-clock haptics. Hardened model, QA and artifact gates against false
  passes, missing data, incomplete requested states and stale output.
- Integrated the Blender urban site, actual vertex colours, cached resource
  ownership and deliberate asset fallback. Native portrait rail controls are
  at least 44px. Ordinary numeric depth/target remains available.
- Metadata authoring/runtime now preserve parent frames, directed feed axes and
  absolute endpoints, and exclude explicitly classified scenery from exact
  framing bounds before static mesh merging. `1cb148c` adds actual feed-position
  envelopes and preserves authored working rake instead of interpreting it as
  mast flex. Root verified 80 metadata cases with the actual 19 GLBs.
- `dc89553`: contract acceptance preflight, atomic settlement notifications,
  persistence/backup recovery, and immutable run/attempt identities captured by
  the simulation. Stale completions after abort/restart/reload/reset cannot pay
  later work. Save version 6; prior v4/v5 saves migrate. All 83 dedicated tests
  passed in original checkout.
- `a9c34c1` and `5475b6f`: corrected the unsupported CFA 32m base claim to its
  sourced 15m configuration and separated foundation method capacities. Kelly
  48m, basic CFA15.2m and specified cased-CFA17m are different configurations.
  Unknown conversion ratings cannot inherit another method's capacity. The new
  capacity gate generated 4,800 contracts successfully.
- `5ba132b`: CPT piezocone tooling now applies to both GLB and procedural builders.
  All 42 declared rig/method tool-selection pairs passed. This does not certify
  all string alignments; the audit report carefully distinguishes those claims.
- `db6f012`: manufacturer-supported rock-bolt trial-bit ranges replace the false
  monotonic anchorage rule; the 9t pile hammer now uses the fitted 106kNm/1.2m
  configuration instead of a 16t/235kNm programme. Actual-module tests passed:
  12 bolt scenarios, six pile cases and eight independent adversarial cases.
- `aa09ed4`: geology cursor uses actual action TVD, horizontal axes use OFFSET,
  labels reserve visible windows/footers, and deep HDD return cursor remains
  visible. Root CPU gate: 132 cases /9,845 assertions passed. Source matches the
  frozen delivery after newline normalization; raw SHA differs by line endings.
- `39a63ab`: CFA auger feed is continuous and preserves the authored rest pose.
  Crossing2.999→3.001m now moves the actual carriage0.002m, replacing an almost
  17m reversal. Root focused gate:332 checks/seven actual builds passed.

## Finished source awaiting final root review or integration

These entries are intentionally provisional. Check Git status and live task
files before staging; later updates should move completed entries above.

- Contract board: original draft and final `contract-board-followup.patch` are
  applied. Exactly five paths: contracts.js/CSS, checkcontracts.mjs and two
  reports. Final private headed proof:44 states/160 assertions, two phone sizes,
  all192 target instances at least44×44, no clipping/overlap/console/HTTP errors.
  Acceptance/refusal/reload used the real progression API. The fixture is DOM-only,
  fallback fonts and reduced motion, not full-game WebGL/FPS. All browsers closed.
  Review/commit, then archive its finished task.
- Results/owned capacity: disjoint original progression changes plus shell,
  results and a tiny QA showResults adjustment. Results authenticates progression's
  accepted receipt; stale completions cannot navigate. QA results is unpaid.
  Owned vertical-capacity preflight preserves nonvertical length semantics.
  Independent critic passed27 identity cases,15 capacity cases/33 rated boundary
  pairs and all83 prior progression cases. Reports/gates are new untracked files;
  production changes are uncommitted at this snapshot. No DOM/GPU claim yet.
- Hero camera: original renderer.js, checkheroframing.mjs and HERO_CAMERA reports
  are frozen for review. CPU proof:2,904 checks/342 cases over all19 GLBs, two
  phones and actual public rig-update poses. Prepared parent GPU scripts in
  `.bak/hero-qa` use port5198. Do not start them without the shared GPU lease.
- Four-rig optimization: final patch/assets in private rig-optimization task.
  Savings12,040 triangles/538,444 bytes, exact overall bounds and150 attachment
  transforms. **Original current GLB hashes differ from the private pre-optimization
  baseline**, so reconcile metadata/source-library versions before copying its
  assets; do not silently overwrite newer exports. New corrections are separate.
- Tool preview: completed11-file CPU patch, all1,457 variants/134,585 frames
  pass. Actual GPU validation has the lease after contract board. It retains
  precise source/model hashes and reports one-time fit CPU cost honestly.
- Blender UI atlas: separate new art/consumer demo with CPU deterministic exports;
  final browser validation still queues after tool preview.

## What I observed that Claude must not miss

The game has a substantial playable foundation, but it is not a finished/AAA
release. Passing individual gates does not establish whole-game readiness.

1. HUD 3D shares measured45.4–67.3% on tested phones, below the roughly82% brief.
   Camera/ruler work improves correctness without satisfying that whole layout
   goal. Surface and section scales can differ intentionally; do not hide it.
2. Geology's browser glyph cases used actual fallback fonts because a child
   browser's Google Fonts stylesheet was denied. Its overall tool remained a
   failure rather than disguising the resource issue. Main-world chroma,
   vignette and grain also affect instrument readability. A separate private
   instrument-grade agent is implementing a careful rendering correction; it
   must preserve authored log-swatch colour relationships and report extra cost.
3. RC has a verified0.7900002m spindle-to-declared-hole-axis mismatch at every
   feed position. Actual platform/kick triangles also obstruct that spindle
   line. Moving only a marker or adding a diagonal runtime string would conceal
   a broken mechanism. Manufacturer photos lack the needed hybrid mounting
   setback. Private `drillity-rc-axis/research/RC_AXIS_ALIGNMENT.md` documents two
   coherent repair scopes; its exported-axis diagnostic deliberately fails.
   No guessed geometry correction was shipped.
4. Missing generated strings are not proof of visually bare GLBs: some rods are
   authored and merged into larger meshes. All19 tool mounts and requested tools
   exist. There remain23 generated collar discrepancies and nine low-feed head
   discrepancies in the diagnostic sample. Respect horizontal/face/upward axes.
5. CFA has no implemented pumping/withdrawal simulation programme. The continuous
   feed adapter supports a decreasing actionDepth, but an injected test is not
   evidence of a real return programme. Its authored auger cannot fully clear
   grade; the source's19.6m flight is not a sourced configuration dimension.
6. `nominalRop`, model caps and actual drilling rates have different definitions.
   The rate audit covered21 methods/9,369 checks; five steady windows were honestly
   unavailable. A confirmed jumbo bug discounts full-cycle non-cutting time with
   bit speed. Fresh tunnel-cycle-hours task owns its economy.js correction.
7. Rock-bolt fit score is authored gameplay eligibility, not measured pull-out
   capacity. Follow-on UI terminology and equipped bolt length are being fixed.
   The larger tube lacks a matching catalogue bit. Vibro equipment still falling
   back to impact physics remains a separate defect, not a physical equivalence.
8. Existing ground-ceiling warnings, geology's deep-generation cap, survey
   uncertainty visibility, broader economic provenance and owner decisions in
   ASTRA remain open. Do not edit verified facts merely to excuse mismatches.

## Task map and preserved work

The full current map and GPU lease live in the coordination directory. Main
task IDs: optimization `01a073a9-be93-7a72-9c9a-50dc3949fbf3`; geology
`01a073a9-c233-7141-9062-31b170b91534`; contracts
`01a073a9-c58f-7900-b7e1-54b48f96d201`; preview
`01a073a9-c8f4-7fc3-9806-d9ccde8528a9`; atlas
`01a073a9-cc58-75f1-ab92-cb9cad74da4b`; progression/domain follow-ups
`01a073a9-d014-7bc1-996c-8dd61eb56096`; fresh tunnel timing
`01a073e2-0edf-7983-9574-b67c0dac8e43`.

Keep original deliveries separate from follow-up patches. In particular:
progression-reliability.patch → domain-mechanics.patch → domain-followup.patch;
the first two are already integrated at this snapshot. Optimization and its
rig-corrections follow-up likewise have distinct baselines. Original-checkout
uncommitted agent changes must be reviewed together where they share a file.

## Verification and final shutdown checklist

Run checks appropriate to actual changes; do not repeatedly run huge sweeps with
no new concern. `npm run build` includes the headed reach check and needs the
shared GPU lease. Other browser harnesses also require serialized GPU ownership.
The last complete build predates several integrations, so **a fresh full build
and artifact audit remain due**. Warm actual-fleet FPS is not yet established.

Before finalizing this handover: list all live tasks/agents, collect their exact
status and patches, finish current atomic operations, ensure no owned Chrome or
Blender export is still writing, document any stopped/incomplete operation, and
save current Git status/commit inventory. Stage only reviewed explicit paths.
Preserve WIP separately with clear baseline and paths; never claim it was pushed
if it was only saved locally. Push the authorized branch without force and verify
the remote commit. Fill in final commit, test results, unresolved work and where
every preserved asset/WIP lives, then pause the follow-up and stop.

**Final shutdown commit:** pending.
**Verified GitHub head:** pending; only authentication dry-run completed so far.
**Final full-build result:** pending after integration.

## Live update after parallel-Claude planning

Latest integrations after the initial draft: 119e5cf contract board (44 headed
states/160 assertions, root self-test and visual review; task archived), 1b913e8
completion receipts and owned rig capacity (all frozen independent-review hashes
matched before commit), and the reviewed shop-preview source plus root 98-case
catalogue against all19 current models. Preview task is archived after review.
The older uncommitted/pending descriptions above describe the first draft.

CLAUDE_PARALLEL.md now defines a proposed20worker site-environment team: eight
builders, eight independent critics, and four runtime/asset/provenance/performance
specialists. Claude has not yet been connected or confirmed running. Codex has
reserved the eight new Blender sites and site portions of terrain.js/site.py
from duplicate assignment. The same shared GPU lease applies to concurrent work.

Current GPU owner: ui-atlas. Parent agents are regenerating four optimization
exports with current shared libraries and fixing the instrument composite's
missing shader warm-up. Domain follow-up incremental source is independently
reviewed, actual-font browser validation remains due. Tunnel-cycle delivery
fixes the economy fallback only; measured-par progression and public estimator
still need a coordinated follow-through. The new tool catalogue task owns alias
arguments and narrow T45 bit data, not rockbolt items or rig definitions.
## Current live checkpoint — 2026-09-06, 02:36 Stockholm

This update supersedes older pending-task descriptions below. Live Codex usage
was 32% remaining at the latest check. Graceful shutdown is still at <=5%:
preserve atomic writes and WIP, finalize this briefing, commit reviewed explicit
paths, push origin codex/astra-improvements without force, verify remote SHA and
pause the heartbeat. No actual push has occurred yet.

Current reviewed HEAD: a3fb994. Recent additions: 3d919d3 optimizes/corrects four
machine source modules with freshly regenerated matching GLBs (12 comparison
exports,150 node contracts, exact overall bounds; 12040 fewer triangles and
538392 fewer bytes, NOT a measured FPS improvement). GLBs remain intentionally
gitignored; scripts and provenance reports reproduce them. f4e8ad9 adds Blender
UI atlas source and tracked PNGs. a3fb994 fixes selected bolt length and trial-fit
labels, tunnel whole-cycle billing/estimation, T45 diameters/alias defaults and
sonic oscillator specification. Domain UI passed18 actual-font phone cases with
90 native >=44px controls and no measured overlap. Full current preview catalogue
passed1457 variants/19 GLBs/134585 frames with zero crops.

Root still has UNCOMMITTED renderer hero framing + isolated instruments/warm-up,
geology deep-profile/cache/font-lifecycle fixes, dedicated gates/reports and
package check wiring. Focused CPU checks pass; whole build remains due.
Ten-case actual instrument GPU run FAILED: four unchanged-repeat cases already
change small hero-band pixel sets, so the outside-world comparison is not yet
controlled. Six cases have zero differences; all ten have zero opaque optical
differences. Isolated footer also appears ghosted versus clean shared-chain
baseline. Do not infer duplicate text declarations or relax thresholds: source
has one footer. Root is capturing source canvases/intermediate targets and
repeated shadow states. Report: shots/instrument-grade-integration/report.json;
independent diagnosis: coordination/instrument-gpu-diagnostics.md.

Claude now explicitly reports STARTED in coordination/claude-sites.md, on
claude/site-environments in Downloads/threads/drillity-claude-sites, baseline
673f888. Its reserved eight environments and terrain/site library remain separate;
none of that candidate work is integrated here. Read CLAUDE_PARALLEL.md and its
live checkpoint. Root's current hero camera differs from that older baseline,
so final integrated environment captures must use the combined renderer.

Three new Codex tasks are active in private worktrees: drillity-ui-atlas-game-
adoption (menu controls and consumer; pre-render patch), drillity-drilling-view-
space (HUD opportunity toward82%, keeping numeric depth), drillity-contract-
readiness (pure authoritative preflight; independent37 cases passed; browser
queued). Full IDs/ownership/GPU queue are in coordination/root-coordinator.md.
Do not archive these or geology before their final verification. Completed
optimization, original atlas, preview, contract board, domain, tunnel timing and
tool catalogue tasks have been integrated and archived.

The paragraph history below remains as provenance; these current facts win
where status differs. Final shutdown SHA, remote verification and build result
are still pending.

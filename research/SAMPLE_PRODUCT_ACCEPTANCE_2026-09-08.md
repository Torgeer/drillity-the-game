# Core and sonic sample products: implementation brief

Audit of the assembled `codex/fps-investigation` sources, 2026-09-08 at
10:53 UTC. This is a bounded product audit and implementation proposal, not a
claim that sampling has been implemented. Only this report and
`tools/auditsampleproduct-gap.mjs` were added by this task. No production source,
browser, GPU, Git index or branch was changed.

## What actually exists

**Core has working drilling mechanics but no sample product. Sonic has working
resonance-sensitive penetration but no sample product.** Both complete and pay
through the generic hole path. A new label, extra counter or generic grade
renamed “recovery” would leave this gap open.

| Layer | Core | Sonic |
|---|---|---|
| Player promise | `data.js:696–717`: whole core, ordered and logged; recovery is explicitly the score. Contract scope at `SCOPE_LINE.core` promises boxed, logged core. | `data.js:1033–1047`: continuous sample in description, but `scoredOn` still says metres drilled. The barrel and truck descriptions also promise a sleeve/sample. |
| Existing mechanics | Core ROP, feed/rotation, flush-sensitive heat and wear, shared hazards, connections and full bit trips. | Resonance peak in `ropModel`, feed, head heat/wear, shared connections/hazards. Normalized resonance is an authored game model, not a calibrated Hz measurement. |
| Programme | `startProgramme()` returns null. `coreRun: 3.0` has no located consumer. | `startProgramme()` returns null; no barrel/casing/extraction programme. `casing: false` means the described override-casing operation is not implemented by that method's current casing controls. |
| Retrieval | `beginRodAdd()` tags the generic connection `kind: 'core-run'`; `stepRodAdd()` increments rod count and emits `ROD_ADDED`. No interval or recovered sample is produced. | Generic rod connection only. No extrusion/sleeving record. |
| Completion | Target depth triggers `complete()` immediately. A final partial barrel has no retrieval. | Same immediate target-depth completion. |
| Grade | `methodQuality()` returns null; global weights give quality zero. | Same. |
| Settlement | `PAY_UNITS` contains only bolts and piles. `unitsFor()` therefore returns null for core/sonic. Settlement uses a completed hole, the generic grade and operating hours. | Same. |
| Results | `buildSummary()` reads time, bit, straightness, safety, groove, hazards and rods. It does not consume `breakdown.quality`. | Same. This is a wider product-readout gap, not specific to these two methods. |

Line numbers describe the audited snapshot; function names are the durable
integration anchors while root assembles other reviewed work.

## Reproduced outcomes

Command from the integration worktree:

```powershell
node tools/auditsampleproduct-gap.mjs
```

Exit 0 in 0.7 seconds. The diagnostic used real readiness, acceptance, start,
public control inputs, public `update(1 / 60)`, genuine `HOLE_COMPLETE` events and
authoritative progression receipts. It followed the simulation's published
optimal inputs and timed its real connection actions. It did not teleport,
inject completion, alter tuning, enable god mode or open a renderer. Production
hashes matched before and after; no warnings occurred.

These are hand-authored one-hole contracts inside the catalogue depth ranges,
with a **€10,000 fixture tender**, €1,000 time bonus and €1,000 quality bonus.
The following revenues prove settlement without a sample record; they do not
represent ordinary generated-contract prices or a profitable exploit.

| Measurement | Core / limestone | Sonic / clay |
|---|---:|---:|
| Target and delivered depth | 30.5 m | 6.5 m |
| Player simulation time | 110.9 s | 12.8 s |
| Simulated update frames | 6,656 | 766 |
| Programme at start and end | null | null |
| Grade / method quality | B / null | B / null |
| Method quality weight | 0 | 0 |
| Completed connection events | 10, tagged `core-run` | 2, tagged `rod` |
| Revenue / net | €11,849 / €6,256 | €11,993 / €5,943 |
| XP | 574 | 506 |

Core connections occurred at approximately 3, 6, …, 30 m. The final 0.5 m had
no retrieval event. Neither completion payload nor settlement contained sample
intervals, recovery, logging or custody. Both observed phase sets were only
`drilling` and `rod-add`. These are bounded CPU observations, not UI, phone,
adverse-operation or natural-play acceptance.

Audited SHA-256 values:

```text
tools/auditsampleproduct-gap.mjs
0457ff1c582ab42e2f6455854600c22d692487297d1a1d858e0ebd236be1ec45
src/core/contract.js
dfb40a897139a7a67fc9d62a2d17a473096a51f42513becca6e3391767e3cf53
src/game/data.js
b425c13c49cb2ba0350f2f0211d5d602293773e17e1b93c4ba6c2fa75d52cc86
src/game/economy.js
26e95c13e8db2ea65d62ccb212b34fae09080fcb63729960e8ff8b9d1d4001f6
src/game/progression.js
4ffdf9b5902986c299f7fb5f63a61aa2d7f1f7a2f8274d4123fe20a7eb1a3cf9
src/sim/drilling.js
1cac4803af0576e6161ca485e2fee1ec708c2d6c46f4fb84c1abcd20f7d9d704
src/ui/screens/results.js
d6ce4e5914cb54e9e7ef59880ea04bc944149a69434e10e25c9ef5480cc45353
```

## Existing research that can support the next build

This audit read the relevant sections of the repository's research; it did not
independently reopen their underlying PDFs or web pages. Their citations are
source leads, not newly verified physical constants. An implementation must read
the cited artifact before promoting a value into a sourced production constant.

| Input | Existing evidence and limit |
|---|---|
| Wireline sequence | `research/02-prospecting.md` §A1, lines 73–86, cites the mineral tooling catalogue and Arrow release sheet: cut, stop, overshot, inner-tube retrieval, ordered tray, return inner tube. `research/rigs/tools-core-dth.md` §2a and §4a describe the distinct assemblies. This supports separate retrieval and rod-extension operations. |
| Run length | Prospecting §A1 lines 176–190 locates 1.5 / 3.0 m everyday barrel lengths and a separate 6 m capability. Current core `coreRun` and catalogue rod length are both 3 m, but equal numbers do not make the operations interchangeable. Begin with a verified compatible barrel capacity; do not enable 6 m merely because the research mentions it. |
| Core loss mechanisms | Prospecting §B6 and §B7 locate blocked inner tubes, grinding through blocks, gauge/lifter failure, wash and handling problems. They support causes and direction of effects. They do **not** supply a calibrated loss-per-second equation for this simulator. |
| Recovery measurements | Prospecting §B7 lines 1580–1604 cites Annels & Dominy equations: recovered length / drilled length, whole pieces over core diameter, and qualifying rock pieces over 100 mm. SCR additionally needs full-diameter pieces. Actual piece lengths and eligible fracture classifications are required. |
| Sonic sequence | Prospecting §A3 lines 560–572 cites the Šporin/Vukelić paper: barrel advance, protective casing advance, barrel extraction/core removal. Catalogue `sonic-core-barrel-100` and `sonic-casing-150` already name separate 3 m tools. The names alone do not prove that the fitted loadout contains a complete compatible train. |
| Sonic fluid and quality | Prospecting §A3 lines 588–592 qualifies low/no flushing by material. A brochure's excellent recovery or a study's lack of secondary fragmentation is not a universal 100% recovery guarantee. |
| Sonic capability | `research/rigs/sonic-runtime-provenance-2026-09-06.md` distinguishes sourced maximum oscillator capability from normalized simulator settings. Do not turn 222 kN into downforce or `rpm=0.62` into a sourced frequency. |

**Do not copy the prospecting proposal's RQD shortcut.** Its §F3 proposes RQD as
a punishment for induced fracture, while §B7 explicitly says drilling/handling
fractures must be identified and ignored in that measurement. The worked
example's poor RQD is not, by itself, proof of poor player operation. Natural
fracturing, recovery, induced damage and logging fidelity need separate fields.
Do not invent RQD from `stability`, generic grade or a random fragmentation bar.

Likewise, proposed loss equations, confidence bands and “unusable below X” prose
are not permission to impose a universal geological acceptance rule. Preserve
the distinction between an explicit game contract requirement and a claimed
industry standard. New tuning must be labelled `NOT SOURCED` as game tuning;
no unsupported coefficient may appear as a measured physical quantity.

## Minimal playable product and implementation seams

Build **one shared interval ledger with two real method lifecycles**. The
minimum useful interaction is to recover a filled or partial barrel, observe
the actual interval, and box/log or sleeve/label it before finishing the hole.
The same stored record must reach the live site, completion receipt and results.

1. Add a small pure sampling module for interval bounds, lifecycle transitions,
   aggregation and immutable publication. Give it explicit method, run and
   attempt identity; do not infer sample type from a currently selected rig.
   Suggested record fields are `id`, `methodId`, `runId`, `attemptId`, `index`,
   `fromM`, `toM`, `drilledM`, `retrieved`, `logged`, `containerKind`,
   `recoveredM` (nullable until supported), `processFlags`, and `qualityBasis`.
   Identifiers and numerical bounds come from actual progress, not UI state.

2. In `drilling.js`, give core and sonic distinct programme kinds through
   `startProgramme()` and `stepProgramme()`. Track barrel advance separately
   from string length and delivered/logged sample. Core needs inner-tube
   retrieval; sonic needs the casing/extraction sequence. `completeOnProgramme`
   must stop target-depth auto-completion until the last partial interval has
   been handled. Keep rod adds as actual rod adds, including when a retrieval
   and rod boundary coincide. A retrieval must not silently add a rod.

3. Make the actual `pulse()` action own state transitions and the existing
   pause/busy/stale-attempt rules. Add a dedicated sample event in
   `core/contract.js` if animation/audio needs one; do not reuse `ROD_ADDED` for
   an inner-tube lift. `writeState()` and `programmeTelemetry()` should publish
   current stage, completed interval and pending work without per-frame deep
   copies of a long entire ledger. Update `programmePar()`/`computePar()` for
   required retrieval work so correct play is not graded as unexplained delay.
   Any compressed interaction duration is explicit game tuning, not an
   invented winch speed or laboratory procedure time.

4. Add a contextual native action in `site.js` and an in-flow interval log,
   using the existing authoritative action-outcome guards. “Recovered” appears
   after retrieval finishes; “logged” appears after logging. Core says box/tray;
   sonic says sleeve. Announce meaningful stage changes once. Keep 44 px
   controls, pause behavior and unobstructed play area. `results.js`
   `buildSummary()` must read the same frozen product snapshot and render its
   evidence beside the generic grade. Missing metrics remain unmeasured.

5. Extend `methodQuality()` and `scoreBreakdown()` only with actual product
   measurements. The existing quality shape is **flat**:
   `{ axis, score, ...detail }`. A stored sample log is an initial playable
   increment, but it does **not** alone close the recovery/quality gap.
   “All barrels handled” measures delivery completeness, not intact-core
   recovery, RQD or undisturbed sonic quality. Do not present the first as the
   other. Complete the quality milestone using measured length/pieces or an
   explicitly labelled game process index; the latter must not masquerade as
   TCR/SCR/RQD or guarantee physical sample quality.

6. `progression.completeHole()` already validates identity and duplicate
   receipts. Keep that boundary. Add the immutable product summary to the
   settlement/ledger, then make remuneration depend on the agreed delivered
   product and quality policy. Core's promise requires a real consequence
   beyond a hidden count. Current `PAY_UNITS` rounds to integer units; do not
   insert fractional recovered metres there unchanged. Do not reuse one
   completion fraction for both payment and operating costs: drilling a lost
   sample still consumed crew time, fuel and tooling. If payment is prorated,
   retain costs on actual drilled work and avoid reducing metre-based XP twice.
   The root must record the explicit game payment policy before changing the
   tender calculation. It is not supplied by a core-recovery paper.

The first independent build can own the pure interval module and its tests;
the heavily shared sim/progression/site/results integration should remain with
the root or a specifically isolated candidate. A separate critic can attack
boundary conservation, missing fields, duplicate delivery and payment. No new
inventory shop, assay economy or arbitrary material-loss model is required to
ship the first honest interaction.

## Acceptance that closes the gap

- **Real path:** accept a generated compatible core contract and a sonic
  contract; drill using public controls; recover/log real intervals; finish;
  observe the same identified records and totals on site, results and saved
  settlement. Source hashes and commands accompany the evidence.
- **Conservation:** runs shorter than capacity, exact capacity, capacity plus
  a small remainder and many runs produce ordered, non-overlapping intervals
  whose lengths sum to actual drilled depth. A large fixed step crossing a
  boundary must not duplicate or skip a slice. No rounding at each step.
- **Last sample:** reaching target depth leaves necessary recovery/logging
  work pending. The exact-boundary and partial-boundary cases must both
  complete once and only after that work. An empty interval is never delivered.
- **Independent operations:** short core retrieval does not extend the string;
  a real rod add does. Sonic casing must reach the required barrel depth before
  extraction where that sequence is required. Tool choice/capability is checked
  against the fitted tool train, including the legacy drive-shoe defaults.
- **Actual outcome:** a competent run and a deliberately adverse operation
  must produce an evidenced product/process difference, visible to the player
  and used by the chosen grade/payment policy. A difference only in generic
  time/bit grade is insufficient. No predicted result is labelled a laboratory
  measurement; natural fractures are not counted as player misconduct.
- **Lifecycle:** pause, modal, hidden document, bit trip, early abandon,
  synchronous navigation and a newly started attempt cannot finish an old
  retrieval, overwrite another interval or pay twice. A duplicate completion
  event leaves all money, XP, career totals and sample ledgers unchanged.
- **Persistence:** the current mid-hole reload policy restarts the physical
  attempt. Preserve that policy until deliberately changed: never load a
  completed interval ledger into a fresh zero-depth attempt. Retain finished
  sample summaries with their settled hole and validate malformed/older data
  without inventing 100% recovery. Existing protected-save behavior survives.
- **Presentation:** null/unknown recovery stays unmeasured. Zero recovered
  length stays zero. NaN, strings and nested legacy shapes cannot turn into a
  successful product by a fallback. Actual mobile DOM checks prove focus,
  native activation, readable stages, touch sizes and no overlap.
- **Non-regression:** RC still bags chips; SPT/CPT keep their existing product
  paths; bolts/piles keep flat-quality settlement; ordinary rod connections and
  pause/action-outcome guards remain correct. Full assembled CPU checks follow
  focused author and adversarial cases; browser evidence is separately stated.

Core's recovery promise remains **open** until the actual outcome, log,
results and settlement criteria pass together. Sonic's sample interaction is
also **open**; its existing penetration/resonance implementation remains
implemented and should be preserved.

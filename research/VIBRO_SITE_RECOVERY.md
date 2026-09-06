# Vibro refusal: actual site and Garage recovery

## Root integrated result

All reviewed core, preflight, site and menu changes are now applied in the
integration checkout. The unqualified gate passed6/6 there, then passed6/6 again
after independent review found and fixed two additional issues: menu visible
Play/Continue/Resume Hole labels now share the same accessible label, and the
browser gate fails on failed requests/HTTP errors and incomplete case counts.
The gate clicks Continue by its actual accessible name and checks visible text.
Independent execution of the actual menu/outcome code passed33 assertions,
including resource/error/incomplete/source-drift negative controls.

Final local report: `.qa-vibro-recovery/integrated-accessible/report.json`.
No browser errors or failed resources; all six cases complete and owned browser
and server closed. This validates current integrated screens, not the separate
unmerged HUD-space or menu-atlas candidates. Those future merges must retain the
recovery catch and menu label/navigation fixes and rerun this gate.

A further6/6 CPU-DOM cases pass at320x568 against all current-root production
imports. Warning bounds x34..286/y475.5..552 and complete text fit on screen;
root inspected the saved warning image. Real recovery still starts one impact
attempt without another mobilisation charge. No errors or failed resources;
browser/server closed. The optional --width/--height harness arguments preserve
390x844 defaults. Its --source-root now also selects simulation/helper from the
requested root instead of silently importing a private copy. Private report:
`../threads/drillity-vibro-start-guard/.qa-vibro-recovery/small-phone/report.json`.
The unqualified root390 runs already used root sources; their validity is intact.

## Original candidate review (historical)

2026-09-06. CPU Chrome DOM verification of current integration source with exact
unapplied proposals. No renderer, preview or audio subsystem is initialized;
Chrome runs headless with `--disable-gpu --disable-webgl --mute-audio`. This is
navigation and warning proof, not renderer performance or overall UI acceptance.

## What the real controls exposed

The proposed site catch handles `unsupported-piling-hammer`, returns from the
failed mount and queues Garage navigation with the existing warning toast.
Deferral matters: actual shell `show()` assigns `state.scene` after mount returns.
The test observes `site` synchronously, then `garage` after the queued navigation.

The first actual recovery test found a second defect: Garage picker correctly
fitted the impact hammer, but Garage Back -> Menu Continue navigated to Contracts.
The menu already labels the button Continue for `state.contract`, while its
handler checked only `state.drill.active`. A separate one-line menu proposal
changes the handler to `if (state.contract || state.drill?.active)`, returning to
the retained accepted job. The site proposal itself required no revision.

## Measured results

`tools/checkvibro-site-recovery.mjs` imports the actual shipping shell, screens,
components and CSS through Vite, plus real simulation/progression/data. Exact
full-source overrides are loaded at their real module locations; there is no
mock navigation, reimplemented mount or simulated Garage picker. Boot is released
through the shell's existing public loading API. No source file in the integration
checkout or HUD worktree is edited.

**6/6 PASS**: preaccepted job, saved/restored job and public equipment drift after
acceptance, each with full and reduced motion, at 390 x 844 CSS pixels. Each case:

- Refuses before any new `beginHole` call or `DRILL_START` event; no active sim.
- Preserves money, contract, run and owned inventory; keeps the selected vibro.
  Save payload and storage remain unchanged after a deferred-save update. The
  fixture explicitly settles load reconciliation's own pending save beforehand.
- Shows the complete actionable warning in Garage's real `role=status`,
  `aria-live=polite` region. Measured toast bounds x16..374, y771..828; complete
  text bounds fit inside it. A saved PNG was inspected and shows the warning.
- Clicks the real Garage hammer card, owned impact picker, Back and Menu button.
  The same accepted contract then starts exactly one impact attempt. Its balance
  stays EUR 93,923, so the original EUR 6,077 mobilisation is not charged again.

Negative controls fail as intended: unchanged site remains on Site after refusal;
unchanged menu sends Continue to Contracts after fitting impact. Reports are
retained in `.qa-vibro-recovery/site-negative-control/` and
`.qa-vibro-recovery/menu-negative-control/`. Final evidence, source/style hashes
and six warning PNGs are in `.qa-vibro-recovery/final/`.

No browser console/page errors or failed network requests occurred in the passing
run. The ordinary font link copied from production index.html loaded Inter and
Oswald faces; no alternate fetch or font substitution was introduced. This does
not clear the independent HUD task's font or rendering gates.

## Reproduce the candidate

From the private `drillity-vibro-start-guard` checkout:

```powershell
node tools/checkvibro-site-recovery.mjs --source-root C:/Users/henri/Downloads/drillity-the-game --site-source C:/Users/henri/Downloads/threads/drillity-coordination/vibro-site-recovery-proposal.js --progression-source C:/Users/henri/Downloads/threads/drillity-coordination/vibro-progression-proposal.js --menu-source C:/Users/henri/Downloads/threads/drillity-coordination/vibro-menu-resume-proposal.js --out .qa-vibro-recovery/final
```

After root integrates all reviewed pieces, run the tool without source override
flags in root. Proposal patches and hash manifests are in shared coordination.
Root owns merging these narrow site/menu hunks with concurrent HUD/atlas work.
Re-run against that final combined source; these measurements do not claim the
unmerged HUD candidate was tested. All owned browser/server resources close in
`finally`, including failed runs.

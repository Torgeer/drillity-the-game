# Contract board implementation evidence

2026-09-06. Private worktree `drillity-contract-board`, dedicated port 5184.
This continues `contract-board-handoff.md`. That earlier attempt failed before
rendering and supplies no baseline layout measurements.

## Scope and source authority

Production ownership is `src/ui/screens/contracts.js` and the new
`src/ui/screens/contracts.css`. The dedicated gate is
`tools/checkcontracts.mjs`. Global CSS, shared components, shell, catalogue,
economy and progression are outside this task's ownership. Synchronized
pre-existing changes are preserved.

All displayed commercial fields come from the current generated contract and
the shell's existing normalization. `src/game/data.js` supplies `unitNoun`,
`holes`, `targetDepth`, `metres`, `payout`, `estimatedHours`, `deadlineHours`,
`constraint.label`, and bonus components. `src/game/economy.js` determines
settlement, so the quote is not net profit or guaranteed final earnings.
This is an interface correctness change, not independent validation of the
catalogue's physical or economic provenance.

## Fresh CPU evidence

Root independently reran the existing deterministic starter sample using
`makeContractBoard('nordic', 1, makeRandom(20260905), 5)` against this worktree.
Five contracts were returned; the amounts and quantities match the earlier
read-only audit. For `ct-nordic-auger-8mbn8`, the whole job is three holes of
8.9 m, 26.7 m total, quoted at EUR 1,000. Its total-job comparison rate is
1000 / 26.7 = 37.453183520599254 EUR/m. The original detail denominator of
8.9 m overstated that rate by a factor of three. Its estimate is 3 h and
deadline 6 h, with the existing constraint label `Tight programme`.

An independent root sweep used `makeRandom(6062026)`, level 60, and 800
`makeContract` calls for each of the eight regions. All 6,400 contracts were
non-null and covered all 21 methods. Every sampled target, count, total metres,
quote, estimate and deadline was positive and finite; every constraint had a
label. Total metres agreed with count times target within 0.051 m (the
generator's rounding allowance). No gaps were found in this finite sample.

The independent critic traced bonuses through progression's `perHoleContract`
and `completeHole`, not just economy's standalone payout helper. Bonuses are
apportioned into completed-unit settlements. The final UI therefore describes
bonus portions and allocated time; it does not claim the entire original job
must finish before any bonus can be paid. Exact whole-euro quotes are shown
even above EUR 10,000; the shared abbreviated formatter hid tender precision.

## Acceptance ownership

The screen calls the synchronous `app.ctx.progression.acceptContract(c)`
API and navigate only after `{ ok: true }`. A rejection reason remains
visible in the detail sheet. Progression owns rig selection, mobilisation,
state changes, persistence and acceptance/region events. The progression
reliability task owns corrections to that API and its regression tests.

The existing `world/geology.js` acceptance listener generates the profile
synchronously from the accepted contract. The site screen initializes the
simulation through `sim.startHole(c)`. This task does not introduce a second
geology event or a second acceptance event.

Before the headed gate, the parent explicitly authorized synchronizing its
integrated progression and drilling implementation, reported as commit
`dc89553`, into this private worktree. These two files are validation inputs,
not part of the contract-board patch:

- `src/game/progression.js` SHA256
  `7adf841002d977471bfe9f606b507bb41a8fe2280f3c8b101d4742070c5f8494`.
- `src/sim/drilling.js` SHA256
  `76cb4f0d1dfcc52aaed994215dd2772c923cbc1ef2acf1e83ac5b91ad627b2f4`.

The browser fixture calls this actual progression API and uses its persistent
save implementation. It does not substitute an event-emitting acceptance stub.
The fixture omits the 3D renderer and drilling simulation loop; it cannot claim
end-to-end drilling or tokenized completion verification.

## Verification status

JavaScript syntax and a production compilation have passed. The normal Vite
config-bundling path failed an ancestor directory read inside the sandbox.
Importing the existing configuration directly and using `configFile: false`
completed through Vite's supported API without permission or package changes:

```powershell
node --input-type=module -e 'import {build} from "vite"; import config from "./vite.config.js"; await build({...config,configFile:false,cacheDir:".contract-qa/vite-build-cache",build:{...config.build,outDir:".contract-qa/build"}});'
```

The final build after the authorized API sync and diameter polish transformed
52 modules in 11.56 s
and emitted a private 2,904.29 kB index artifact. Screen and gate syntax checks,
CSS parsing (56 top-level nodes), and all 11 CPU verdict fixtures passed. The
verdict fixtures include one valid case and ten deliberately invalid cases.

The content reviewer also ran 26 counted actual-module assertions against the
synchronized API: normalized contracts, immutable refusal, single acceptance
and events, repeated acceptance rejection, initialized drill/world fields,
save v6, restored acceptance event/funds, and actual simulation startup and
persisted attempt identity after reload. These are CPU checks, separate from
the browser fixture's narrower scope.

## Headed browser evidence

The parent granted the exact `contract-board` GPU lease before root launched
the dedicated muted, headed gate on port 5184. The gate uses real production
DOM, catalogue data, progression acceptance and persistent saves. It checks
320 x 568 and 390 x 844 desktop Chrome viewports.

The first run exposed three measurement/fixture defects: closed native
`details` descendants retain boxes although they are unpainted; the Escape
assertion checked before sheet removal and focus restoration; the fixture had
no explicit favicon. The corrected gate excludes unpainted descendants,
waits for actual sheet removal, and supplies an empty data favicon. Console
and HTTP errors remain unsuppressed and now record exact locations/URLs.

The second run passed 159 of 160 assertions. Its sole failure checked the last
card immediately after a sort, before the stagger animation finished. The
captured scroll-end screenshot shows the final ground line fully visible.
The gate now awaits settled animations before measuring; the clipping
assertion remains strict. Both initial runs are preserved under
`.contract-qa/first-run` and `.contract-qa/second-run`.

Independent visual inspection of nine captured states found no visible
overlap or permanently clipped content. At 320 px the card's ground line and
subsequent jobs require normal board scrolling; at 390 px more content fits.
A small production polish binds the diameter to its `mm` unit so that the
unit does not wrap alone on narrow cards.

The final root run completed with exit code 0: **44 nonempty layout states and
160 of 160 assertions passed**. Across 192 target instances, minimum width and
height were both 44 px. There were zero measured text-clipping, overflow,
control-overlap, text-overlap, external-occlusion or target-access issues.
Both viewport runs reported no page exceptions, console errors or HTTP errors.
All four sorts, available-first ordering, facet counts/reset/empty states,
long production labels, keyboard focus/trapping/restoration, real API refusal,
single acceptance on repeated activation, navigation and save reload passed.

The final machine report and 44 screenshots are under `.contract-qa/current`.
The report SHA256 is
`307925ca73aa7ecd12c74a71a2553065f456449f83cd70b9b9d4bd06c0d67fb2`.
Root rechecked the narrow starter screenshot: the exact diameter and `mm` now
stay together. Browser contexts, Chrome and Vite were awaited closed in the
gate's `finally` block before the PASS result. Root independently verified
that `127.0.0.1:5184` refused connections, then cleared only this task's exact
GPU lease for the coordinator to assign onward. No browser remains open.

The fixture omits WebGL, the physical simulation loop and audio. It uses
system fallback fonts, reduced motion, device scale factor 1, and zero
safe-area inset values. No FPS, device-native safe-area, full drilling, or
before/after layout comparison is claimed.

## Shared integration follow-up

The critic found and root independently reproduced a shared shell callback
that navigates to Results after an old attempt completion even though updated
progression rejects that payload without changing state. The reproduction
uses the exact AST-extracted production callback and real event/progression
modules; it is CPU callback evidence, not a rendered UI test. Its executable
reproduction and source hash are in `contract-board-adversarial-review.md`.
The parent acknowledged and assigned the shared fix separately. This patch
does not modify shell, Results, progression, or drilling simulation.

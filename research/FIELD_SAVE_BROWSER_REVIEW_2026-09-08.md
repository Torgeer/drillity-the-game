# Field regrind and save recovery: independent browser review

Reviewed 2026-09-08 by `field_save_visual_critic`. Production source was not edited by this reviewer. No browser, WebGL or Blender process was launched by this reviewer.

**Current verdict: corrected isolated candidate accepted for FV-1, FV-2 and the tested save/regrind states.** The follow-up at the end pins the corrected evidence and its limits. The initial main-tree review below is preserved: it accepted the 33 functional scenarios but withheld visual acceptance because the actual production-font screenshots showed two overlaps beyond the runner's original selected-panel assertions. Neither the original passing case count nor its earlier fallback-font run resolved those findings.

## Accepted evidence and identity

Accepted runner report: `evidence/field-save-browser/production-fonts/report.json`, started `2026-09-08T11:24:27.323Z`.

| Artifact | SHA-256 |
| --- | --- |
| Accepted report | `3f252c99c26a5e7fcf3368e3b905bfa8ab3764f8b977019f6d1ca39e5f10db3c` |
| `tools/checkfieldsave-browser.mjs` | `897f9ff635a6accf59c355d4c58787030946028dc8558ff09acba6c7190c946e` |
| `tools/fixtures/field-save-browser.js` | `c0a5373daf21219e3da9c663a4493327c68ae95fe7522604d914bdc0f00c686a` |
| `src/ui/styles.css` | `16b6177effdc44b8a549062843a57f5e983956dc58fb3474c3d04bbe9342f234` |
| `src/ui/screens/menu.js` | `b6e982c6831b7565a4dcf24a55bff651651deabd1abd3b15c92ec8e57f623270` |
| `src/ui/screens/garage.js` | `13b05b5a927c071a86761d66d6fe08ae0673e4c892ce226981120e88e70e027b` |
| `src/ui/shell.js` | `4b7ddb594128b13f7b769366e4b27fbb723ac30464a794cac389b93a15136944` |
| `src/ui/save-status.js` | `36b5359c6c62636a6dae6caa520fb666ce4df27d373d11753907cdb32b8fab12` |
| `src/game/progression.js` | `c2a924ec309c6dd0fa86a00e5bd9c8ca2714c802b466a97255d3f6c43e194fd3` |
| `index.html` | `80093df10d14000da429ff9ac9159dc55487d92769d539374872278e56f146a1` |

The accepted JSON records all 31 source inputs. The separate `FIELD_SAVE_BROWSER_CRITIC_2026-09-08.json` preserves that manifest, screenshot hashes and this review's inspected image list. Review conclusions apply to these artifacts, not to subsequent source changes.

Chrome `152.0.7977.76`, headless, GPU/WebGL explicitly disabled, DPR 1, reduced motion enabled. Viewports: 320×568, 360×780 and 390×844. The report contains 33 passing cases, 54 geometry captures/PNGs, 33 font-load records and 36 served documents. It records zero browser errors; browser and owned server cleanup both succeeded. Storage-fault warnings are expected fixture diagnostics, not an absence of warnings claim.

Every font-load record includes genuinely loaded `Inter` and `Oswald` faces; the set also includes `Oswald Fallback`. The runner copies the production font links from the hashed `index.html`, explicitly loads both real families, and awaits `document.fonts.ready`. This closes the earlier fallback-font evidence gap. `first-run` and `second-run` are rejected fixture diagnostics. The earlier directory named `final` passed 33 cases with fallback fonts and is not the accepted typography evidence.

## Actual visual findings

Coordinates below are approximate pixels read from original DPR-1 PNGs, not separately measured DOM rectangles. All named images are under `evidence/field-save-browser/production-fonts/`.

### FV-1 — Notifications paint over Settings controls

**Must fix for the owner's no-overlap requirement.** In `320x568-saved-career-available.png`, the warning toast occupies approximately x34–286/y430–506, painting over the Graphics quality row and Haptics. The reward toast at x110–210/y516–554 covers lower Settings content. `320x568-quota-settings.png` independently shows the warning at x34–286/y477–553 covering Haptics and Reduced motion. The toast says “Open Settings” while Settings is already open and displays the fuller recovery notice.

The same stacking mechanism obscures career rows at larger sizes: `390x844-saved-career-available.png` has the warning at x16–374/y727–783 and the reward at x145–246/y791–829; `360x780-quota-settings.png` has the warning at x16–344/y708–765. These are visible collisions, not inferred pointer failures: `.toasts` deliberately has `pointer-events: none`.

The fixture does not continuously drive `ui.update`, so it can leave a transient notification visible longer than live gameplay. Production lifetime is 2.8 seconds for warnings/rewards and 4.2 seconds for danger messages. That limits duration conclusions; it does not remove the actual collision during a notification's visible lifetime.

Preserve the persistent save warning and recovery action. Give notifications their own layout space or suppress a redundant save toast while its full notice is visible, and ensure unrelated reward notifications cannot cover the active sheet. Recheck visible text and controls against painted toast bounds; centre hit testing alone cannot detect a pointer-transparent overlay.

### FV-2 — Narrow Menu identity chip overlaps the balance

**Must fix for the owner's no-overlap requirement.** In `320x568-future-menu.png`, the `€4,500` balance at approximately x212–270/y505–524 overlaps the `NORDIC FOREST` region chip at x111–257/y506–534. This is inside the player card below the new save notice. `360x780-unreadable-menu.png` shows the same card with clear separation, making the narrow layout failure easy to distinguish from the notice itself.

The player card has a shrinking identity column between the level ring and balance, while the chip remains wider than its available column. Give identity and balance separate available space at the narrow width, or let the card wrap without overlapping. Keep the region, method and balance readable; do not merely clip away the label. Assert the player card's child and text rectangles at 320×568, including the normal Menu and visible-save-notice states.

## What the evidence supports

- The save notice copy distinguishes failed saving, protected newer/unreadable data, unavailable storage, recovered backup, and a saved career ready to load. The new recovery action explains that unsaved session changes will be lost. The actual 320-pixel confirmation wraps both labels across three lines but keeps each button inside the dialog and above 44 pixels tall.
- The regrind panel explains recovery, one treatment per bit, 20 in-game minutes and no cash charge. At 320 pixels its recovery amount wraps without overlapping the value or action. The no-skill, no-grinder, exhausted-bit and already-used states show their specific reason above a disabled button. “Up to 0 condition points” in the no-skill state is less useful than the reason, but is not a demonstrated functional failure.
- The 54 checked targets have a minimum recorded width of 90.09375 CSS pixels and a minimum height of 44 CSS pixels. No selected-target geometry violation is recorded. Disabled buttons receive the same size/viewport/ancestor clipping checks. The exception for centre hit testing requires a truly disabled element, `pointer-events: none`, and a hit on its own ancestor; it does not broadly excuse an unrelated occluder.
- The 33 cases exercise actual production Menu, Settings, Garage, shell and progression modules. Native pointer, Enter and Space activation are used. One eligible regrind changes condition from 55% to 79%, adds 20/60 career hours, spends no money and becomes unavailable for that bit. Disabled button activation leaves the serialized career unchanged.
- The reload action is a real browser reload: the test requires a navigation entry of type `reload`, a different document ID, restored saved money of 8765, a cleared block, and the exact original primary save bytes. The storage operation log persists through reload in session storage, and the test requires no writes, including lifecycle hooks. Cancellation keeps the current document, unsaved money and original saved bytes. Future/unreadable protection separately compares both primary and backup bytes and rejects all writes after a check and background updates.

## Coverage limits and follow-up

The browser uses bundled actual modules with explicit senior resources, wear and native-storage fault injection. It does not establish a naturally earned career, WebGL appearance, physical-phone behavior, Safari, assistive technology, performance, or contrast compliance. This reviewer visually inspected 16 original PNGs spanning all three sizes and the important recovery/regrind states; all 54 geometry records and source assertions were read, not all 54 PNGs manually reviewed.

The runner scrolls each selected action into view and checks its surrounding notice/panel/dialog. Its no-overlap result is local: it does not check all player-card descendants, all Settings controls, or a global fixed notification against the active sheet. FV-1 and FV-2 are therefore compatible with all 33 functional cases passing. General whole-screen visual approval would be false.

Root assigned the two findings to `modal_browser_acceptance` in isolated `drillity-notification-flow`. The initial review required corrected source hashes, preserved functional cases and real font proofs, the missing viewport assertions, and actual corrected images before changing the visual verdict. That bounded follow-up is recorded below.

## Follow-up: corrected candidate accepted

The accepted after-run is `C:/Users/henri/Downloads/threads/drillity-notification-flow/evidence/notification-flow/accepted/report.json`, started `2026-09-08T12:10:14.405Z`, SHA-256 `f133d80b614c733dbdae1234a5f61702867c7db4fc60478800ca079fc8121a2c`. This is an isolated snapshot of main plus the notification/layout correction, not a claim that root has already integrated or committed it. The separate candidate directory `evidence/notification-flow/final` contains an initialization timeout and is not accepted evidence.

| Corrected artifact | SHA-256 |
| --- | --- |
| `src/ui/shell.js` | `12a549edece76f1745caaa4fad6e0fc2b7c0bf46fd361f7a0002dc83ef930f21` |
| `src/ui/styles.css` | `7ec4ee902e8b7127712945487f987a6a3b12b1810ec6ffdc6b2705e26e42b4e8` |
| `src/ui/screens/menu.js` | `8f62bfb011cf9fc2dbb035b041ddc32b60e6119e3350cd9c023860569df8bff1` |
| `tools/checkfieldsave-browser.mjs` | `9989be38f9bbbb5b10a0359c867a75d8469cb4144542d96963061bb77b7ea2b0` |
| `tools/fixtures/field-save-browser.js` | `d75651249190e1bd55516f32749bbb77c9388e6199cbdf4a2c8c0227ef30dd34` |

`save-status.js` is unchanged from the initial reviewed hash. The complete 31-input after-manifest, including progression `98511563b7a80a03541f48497b0b1f21141b6b153aeb5405be3843bb77ba406e`, is preserved in the critic JSON. Integration should apply the final `drillity-coordination/notification-flow-delta.patch` against its recorded dependencies rather than replace whole main source files.

**FV-1 is closed for the captured states.** In the accepted `320x568-quota-settings.png`, Haptics and Reduced motion are readable and unobscured. In `320x568-saved-career-available.png`, the retained reward message has its own row above the persistent recovery notice; it does not paint across the graphics or feel controls. The accepted 360- and 390-pixel Settings images likewise separate feedback from controls and career rows. The redundant save toast is suppressed while the persistent notice is present. The 320-pixel reload confirmation keeps its warning, two actions and retained reward in separate layout rows, with no collision.

**FV-2 is closed for the captured states.** In the accepted `320x568-future-menu.png`, balance and identity occupy the upper player-card row while region and method chips have their own row below. The region label is retained in full. Menu navigation now uses shrinking grid tracks with bounded horizontal button padding, and the Menu can scroll when its contents exceed the short viewport. The successful-regrind Menu capture has a 252×56 CSS pixel Play button at 320×568 with no horizontal overflow in the checked navigation panel.

The success message is preserved: accepted `320x568-grind-success.png` and `390x844-grind-success.png` show “Bit regrind complete · 79% condition” in a separate Garage footer. The runner checks it remains visible after one second of the actual UI lifetime, activates the real Garage Back button, and requires the same live feedback node to move into the Menu footer. The 320- and 360-pixel `grind-success-menu` images show that message intact. After another three seconds of UI updates, the test requires it to disappear. This proves the bounded navigation/lifetime behavior without removing feedback to make the layout pass.

The strengthened runner passes all 33 functional cases and all 60 local/viewport geometry records, with minimum checked target width 90.09375 and height 44 CSS pixels. Each geometry record now intersects every painted toast with visible text and controls in the active screen/dialog; pointer-transparent or inert painted content is not excluded. It separately tests wallet bounds against identity/chip bounds and checks button sizing and horizontal label fit inside the selected panel. All 60 records were inspected, including retained-toast records in Settings, confirmations and Garage/Menu success states; every recorded violation list is empty. Twelve accepted after-PNGs were manually inspected across all three widths, in addition to five diagnostic candidate PNGs which are not used as acceptance evidence.

All 33 font records again include loaded Inter and Oswald. The after-report records 36 documents, zero browser errors and request failures, and successful browser/server cleanup. The same candidate's modal focus reports pass 17 author and 8 adversarial cases, including nested overlays, inert restoration, native scrim close, navigation, stale callbacks and disposal. Their report hashes are `563a0bcf230ddd5885552bc652a0a7ee62bb8b10bbc5cdffbf1c901b0d82b5c2` and `2235e1acf2cbeb798119ff006d3167b44468c147e1e5b6519e5e4f1c98c81300`.

**Limits retained:** this is acceptance of the two demonstrated fixes and the enumerated states, not an exhaustive no-overlap certification. The normal clean Menu case still checks notice absence and storage inactivity rather than taking its own geometry capture. A new save fault arriving while Settings/Menu is already scrolled below the persistent notice was not exercised; suppression checks notice presence rather than its viewport intersection. No claim that every critical notification is always visible follows from this run. Physical phones, Safari, assistive technology, live WebGL backgrounds, measured contrast and all other game screens remain outside this review.

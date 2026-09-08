# Independent steel visual review — 8 September 2026

**Approve the bounded rawSteel/wornSteel/chrome scalar correction for
integration.** The Nordic hero view has less concentrated mast glare, and the
reviewed controls do not show a new loss of rig silhouette. This does not approve
the game's overall graphics, underground lighting, pale glazing, mobile
performance, or oil VFX. Integrate the steel delta after its paint dependency.

## Exact reviewed evidence

- `evidence/graphics/steel-02/report.json` SHA-256:
  `17d0e037ebd2a9d51f05a29cafedc57a8d93e9af1aafe3c85f6dbd8d4f728915`.
- `src/core/assets.js` byte SHA-256:
  `284427023106420a4b29fbbcc239204ec222d01bab43140a3d226195fa471a95`;
  LF-normalized SHA-256:
  `c18ac718a1a572f926a4777652ae652ce2a8095bf2e725303663d6a529c2c09d`.
- Saved and executed capture harness SHA-256:
  `bb5f3a5408a25c1382f4c56000a5bd95ea467e4b59effce2b3ebf2d157d59be1`.
- Independent evidence extraction:
  `evidence/graphics/steel-02/independent-verification.json`.
- Final source CPU rerun: `research/steel-response-independent-final-2026-09-08.json`,
  **11 groups passed**, including the previous 96 material-state counterexamples.

`steel-01` is retained with its scope limitation. Its baseline did not switch
the imported site clones and is not used as the shared-site approval evidence.

## Scope, controls and repeatability

The corrected harness selects site clones from the real mesh
`userData.siteKinds` written by the terrain importer. Inspection of
`terrain.siteMaterial()` confirms it supplies colour/vertex-colour settings but
does not add a roughness/metalness override. In each of the four recorded scenes,
the imported site's rawSteel changes to the old scalar for baseline and returns
to 1/1 for the candidate.

Procedural terrain clones that explicitly set roughness/metalness remain fixed,
including 1/1 controls that must not be selected merely because of their values.
The independent checker verifies this from each recorded material identity.
Five additional CPU counterexamples execute the exact capture selection function
and cover site/rig inclusion, explicit overrides, material arrays, deduplication,
conflicting metadata and unexpected site overrides. They pass against the saved
harness hash. No competing browser was launched by the critic.

All four cases pass independent source-manifest, material/map identity, camera,
state, scene, texture readiness, compatible fitted-bit, visibility, cleanup and
unchanged draw-dispatch checks. No changed-family material with asset/site
metadata is left outside the intervention in these scenes. This remains a
material intervention on one loaded candidate scene, not a separate source boot.

**Three cases repeat pixel-for-pixel for both A/A and B/B:** Nordic hero,
underground longhole orbit, and oil orbit. Nordic orbit has a small baseline
repeat difference: full-frame mean absolute RGB differences are
`[0.003279, 0.003448, 0.002937]` on the 0–255 scale. Its candidate repeat is exact.
The cause of that baseline pixel drift was not isolated. Accordingly, Nordic
orbit is supplementary qualitative evidence, not an exact-repeat pixel result.

The independent strict pixel checker deliberately returns exit 1 for this
remaining orbit drift, after writing all per-case results. It has not been
changed to report the entire four-case run as pixel-identical. Approval rests
on the three exact cases plus source/CPU checks; no extra capture is needed for
this bounded material delta.

## Native-image assessment

The critic opened all eight baseline/candidate PNGs at their supplied native
780×1688 resolution and inspected the author's explicit ROI coordinates.
The ROI rectangles include background and occluders; they are supporting data,
not isolated material masks.

- **Nordic hero:** the concentrated bright patch above the carriage disappears
  into a broader metallic response, making the mast finish more legible. This
  is not a uniform darkening: the upper-mast mean luminance increases while its
  high-end luminance falls. Lower carriage dark pixels increase from 1,049 to
  2,365 in the specified 18,720-pixel rectangle. The adjacent feed rails and
  guards remain distinguishable in the actual image; losing the old highlight
  does not remove the rig's outline. The painted body and pale cab remain
  separate unchanged controls.
- **Nordic orbit, supplementary:** the grille and mast response change visibly,
  while the roof and site rod rack retain their position and readability. The
  foreground roof still obscures much of the rig. The small repeat drift means
  this view is not used to claim precise pixel effects.
- **Underground longhole:** the thin mast/rod highlights behind the cab become
  more apparent. Cab, body and undercarriage remain very dark against the wet
  wall/floor glare. The body rectangle gains dark pixels (5,336 to 6,060) while
  its mean increases from 0.04139 to 0.04227. That mixed response is preserved
  in the record rather than described as simply brighter or darker. I do not
  see a new loss of the existing silhouette. The underlying lighting problem
  remains open and is not solved by this correction.
- **Oil orbit:** the steel response change is small at this distance. The mast,
  internal steel and platform retain their shape. The ochre horizon and rig
  palette still blend together; that is outside this steel-only approval.

Fresh chrome still reaches the installed shader roughness floor and can retain
strong reflections. The CPU tests establish that worn chrome now has a distinct
roughness response; these fresh-condition stills do not certify animated wear
appearance or every fleet view.

## Limits that remain explicit

Every case logs that it is an unpaid QA preview. Oil also logs a missing
`FLUSH_MEDIUM` mapping and an incorrect AIR plume fallback. Those effects are
held constant for the scalar comparison; the warnings exclude these stills
from gameplay settlement or oil-VFX acceptance.

Draw dispatch counts are unchanged for A/B within each case. They include normal
and shadow passes and are not the standalone ≤70 rig budget measurement. No FPS
claim or real-phone result follows from these captures. All owned capture
browser contexts, browser and Vite server were closed.

Reproduce the critic checks from this worktree:

```text
node tools/checksteelselection-adversarial.mjs
node tools/checksteelresponse-adversarial.mjs --report research/steel-response-independent-final-2026-09-08.json --models public/models
<bundled-python-with-Pillow> tools/auditsteelcapture.py evidence/graphics/steel-02
```

The third command's expected exit 1 is the documented Nordic-orbit exact-repeat
failure, not an identity/source/material-control failure. The bundled Python is
`C:/Users/henri/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.

# Section instrument grade candidate — 2026-09-06

Private candidate: `C:\Users\henri\Downloads\threads\drillity-instrument-grade`.
No original source, shared asset, package, camera behavior or boreSDF was edited.

The live pipeline was dual-band HDR scene -> contact AO -> bloom -> GradeShader
(exposure/brand film transform, chromatic split, vignette, grain) -> SMAA.
The geology ruler, log, station scale, footer and depth marker were ordinary
transparent meshes in that first target. `toneMapped=false` cannot bypass the
custom full-frame GradeShader. A raw sRGB overlay is also wrong: the log's
litSwatch deliberately stores pre-grade lit colours to match the face after the
shared film transform.

This candidate puts those actual geometry owners on section layer 1. Their
existing CanvasTextures, material alpha, renderOrder, camera, transforms and
layout remain the authority. They render once into a cleared transparent HDR
target and use the same GradeShader instance definition and shared live film
uniform objects. The instrument mode suppresses chromatic split and exits after
the display transform, before vignette, grain and letterboxing. It composites
with source alpha after the world's SMAA. Transparent instrument pixels leave
the already graded world untouched. No device rectangles or per-machine lists
are used. Background/override material/camera mask/clear state/shadows are
restored even if the instrument draw or composite throws.

The intermediate colour is premultiplied by raster blending; it is divided by
source alpha before the nonlinear film transform, and outputs straight alpha
for the final screen blend. Opaque swatches retain the same film inputs as the
rock. Partial-alpha text edges now blend after film grading, a deliberate change
from their previous nonlinear combination with the world. Instruments receive
neither world AO/bloom nor SMAA; their existing supersampled CanvasTextures
retain source antialiasing. Visual appearance must be reviewed on actual GPU.

Cost: one additional full-canvas RGBA16F target (8 bytes/pixel, no depth or
stencil) and one fullscreen composite draw. At a 390x844 CSS canvas at DPR 2,
this target is 10,533,120 bytes; at 320x568 DPR 2 it is 5,816,320 bytes. These are
allocation arithmetic, not measured GPU memory or performance. Existing
instrument meshes move between passes rather than being duplicated, and the
section scene is traversed an extra time. No performance-win claim is made.
Target follows actual drawing-buffer resize and is disposed on post rebuild.
If the post chain is unavailable or instrument construction throws, instruments
remain visible in the original graded scene fallback; that fallback does not
claim the optical readability fix. Three.js allocates target storage and links
programs lazily. Constructor success does not prove later framebuffer/shader
success, and a later bind/draw exception propagates after state restoration.
No runtime GPU allocation recovery has been demonstrated or is claimed.

Verification completed in the private candidate:

- `node tools/checkinstrumentgrade.mjs`: 166 assertions passed. Executes the
  production rendering helper with real Three.js layers, checks normal and
  exceptional state restoration, exercises actual geology owners in all five
  modes and rebuilt handles, and checks synthetic nonlinear alpha-edge math.
- `node tools/checkruler.mjs`: 132 cases / 9,845 assertions passed. Actual mesh
  projection with synthetic 0.62-em text; no actual-font or GPU conclusion.
- Syntax checks passed for both production files and the browser harness.

Root GPU update,2026-09-06: the ten-case comparison now passes in
`shots/instrument-grade-converged/report.json`. All cases reached bounded exact
RGB convergence before comparison; no repeat, outside-alpha world or opaque
optical differences exceeded the original gate threshold. Six quality/resize
cases also pass in `shots/instrument-lifecycle-postfix/report.json`. See
INSTRUMENT_LIFECYCLE_QA.md for source hashes, retained earlier failures and
limitations. These results do not establish a frame-rate or contrast-ratio claim.

Original preparation: `tools/checkinstrumentgradebrowser.mjs` needs an existing
server with the integrated candidate, system Chrome headed, and exact shared
GPU owner `instrument-grade`. It refuses to launch otherwise. It captures five
actual modes on 390x844 and 320x568, compares the old shared optical path by
putting the same meshes back on world layer 0, reads the actual instrument
RGBA16F alpha, and compares isolated, baseline, world-only and optics-off
frames. Gates require deterministic repeats, nonempty alpha coverage and
opaque samples, changed instrument pixels, zero changes outside source alpha
when adding instruments, opaque instrument immunity to optical uniforms, and
continued world response to those uniforms. It closes Chrome in finally and
records resource errors (including fonts) without hiding them. Source math and
a prepared harness are not a causal visual pass.

Root must integrate/review this scoped patch alongside the frozen hero-camera
candidate, then run the serialized headed harness and inspect its actual PNGs.
No raster readability, contrast ratio, GPU budget or overall visual PASS is
claimed here.

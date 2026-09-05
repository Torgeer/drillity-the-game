# Urban plot — Blender environment reference

Research checked 2026-09-05 for `blender/sites/urban_plot.py`. This is a
fictional, bounded urban construction compound. Its permanent furniture must
work for the existing `urban-plot` uses: piling, ground improvement, investigation
and rock excavation. A connected concrete line or reinforcement operation is
method-specific and must not imply that every one of these methods places piles.

Read alongside `research/16-site-archetypes.md` §A.1,
`research/17-site-verification-notes.md` §4, `research/18-visual-reference.md`,
and `research/CRITIQUE.md`. The first two establish the engineered platform and
urban logistics; the visual brief asks for useful middle-distance site content
and worked ground. The critique warns that visual correctness cannot be inferred
from successful loading or a green capture-process exit code.

## Directly verified product proportions

These are reference-product dimensions, not universal dimensions or prescribed
site sizes. Real manufacturer names belong in research and code citations only;
no branding or product names should be exported into the player-facing scene.

### Portable cabin

The manufacturer technical description, version 12 June 2023, provides these
dimensions for its BASIC Line 20-foot portable cabin:

| Feature | Dimension / construction | Printed PDF page |
|---|---|---|
| External cabin envelope, length × width × height | **6.055 × 2.435 × 2.591 m** | 3, §1.1 |
| Door, standard overall size | **0.875 × 2.125 m** | 7, §2.5 |
| Door clear opening | 0.811 × 2.065 m | 7, §2.5 |
| Office window, external size | **0.945 × 1.200 m** | 7, §2.6 |
| Window parapet above finished floor | **0.870 m** | 7, §2.6 |
| Door operation | Outward opening | 7, §2.5 |
| Exterior panel construction | Corrugated, coated galvanised sheet | 7, §2.4 |
| Ground support | At least **six support points**; foundation sizes depend on site conditions | 11, §4.3 |

The external height includes the cabin frame, not a separate foundation plinth.
Do not substitute the 6.058 m length of a freight container. The same document
requires a minimum **2 × 1 × 2** configuration for two-storey cabin arrangements
(p12); a single ground-level cabin avoids an unsupported stacked arrangement.
[Manufacturer technical description, pp3, 7, 11–12](https://catalog.containex.com/catalog/CONTAINEX/EN/catalogs/Technische-Beschreibung-CONTAINEX-BASICLINE/pdf/Technische-Beschreibung-CONTAINEX-BASICLINE.pdf).

### Solid steel hoarding and gate

The manufacturer's dimensioned rear-view drawing gives **2.485 m panel sheet
width × 2.400 m height**, on **2.500 m nominal panel centres**. It shows
2.400 m vertical scaffold braces, **2.100 m diagonal scaffold poles**, and
**48.3 mm outside-diameter scaffold tube**. The panels stand on the surface
using concrete kentledge and bracing; block centres are adjustable for wind
loads. A brace needs a visible load path into its support, not a floating end.

The next page specifies a two-leaf vehicle gate: each leaf is **2.500 m wide ×
2.400 m high**, with a **5.000 m maximum opening**. Its pedestrian door is
0.880 m wide × 2.000 m high within a hoarding panel.
[Manufacturer product guide, printed pp18–19 / PDF pages 18–19](https://www.bloknmesh.com/wp-content/uploads/2024/04/bnm-ireland-summer-22-product-guide-lr.pdf).

Use that drawing for geometry. The supplier's current product-page table has
inconsistent width and unit fields; do not treat its 2450/2500 values as a
reason to silently change the drawing's sheet width or nominal centres.

## Ground and operational evidence

The FPS Working Platform Certificate guidance describes a platform that is
designed for the actual plant and its operating configuration, installed to a
recognised standard, free draining and maintained. It identifies poorly defined
edges as a source of instability and recommends extending the platform at least
**2 m beyond pile positions / the building edge**, subject to an explicit design
where working closer is unavoidable (§§1.2–1.4, 2.4). That is not a universal
clearance around a machine. No universal platform thickness follows from it.
[FPS Working Platform Certificate and guidance](https://www.fps.org.uk/content/uploads/2018/12/FPS-WPC4d-June-2015-updated-logo.pdf).

The FPS design-sensitivity examples explicitly require actual rig loadings and
platform/subgrade properties. Their plotted thicknesses are examples, not
dimensions for copying into every site.
[FPS working-platform design sensitivity](https://old.fps.org.uk/fps/guidance/platforms/platforms_designsensitivity.php).

The existing research cites a 1-in-10 gradient limit. The directly checked FPS
hydraulically bound-platform guide states that value in its drainage discussion.
It does not specify the thickness of this scene's granular mat.
[FPS hydraulically bound-platform guidance](https://old.fps.org.uk/fps/guidance/technical/otherguidance/otherguidance_hydraulic.php).

An urban-site reference is the City of London's 2019 code: §3.31 calls for
impervious acoustic hoarding of at least **5 kg/m²** where applicable; §4.29
describes hard-surfaced routes, a wheel wash with rumble grids where reasonably
practicable, and hardstanding between the wash and exit. This supports the visible
relationship of compound, cleaning grid, gate and street. It is a London
reference, **not a claim about German regulations** or the acoustic performance
of the modelled panels.
[City of London construction code, printed pp16 and 26 / PDF pages 19 and 29](https://www.cityoflondon.gov.uk/assets/Services-Environment/code-of-practice-for-deconstruction-and-construction-sites-9th-edition-pollution.pdf).

## Authored composition — NOT SOURCED

The following are deliberately **NOT SOURCED** art choices. Repeat that label
beside their constants in the Blender module; this document does not convert an
invented number into an engineering fact.

- Plot length and width, ground depth, platform thickness, overall layout,
  boundary setbacks, cabin position and support-pad size.
- Hoarding thickness if simplified, corrugation relief and spacing, joints,
  support spacing, ballast geometry, fastener sizes, and gate-opening pose.
- Cabin frame profile widths, foundation elevation, placement/count of windows,
  local panel pattern, simplified seals, handles and steps.
- Adjacent building massing, storey heights, window rhythm and pavement widths.
- Wheel-cleaning grid dimensions, tank/pump silhouette, drain size and routing.
- Unconnected storage furniture, stack counts, pipe/cage proportions, skips,
  signs, all fictional paint choices, dirt, track marks and small surface noise.
- Clear view around the collar and rig, low foreground objects and subdued
  background contrast. These are mobile-camera composition decisions rather
  than real exclusion-zone dimensions.

Keep buildings outside the hoarding, locate the cabin inside a coherent
compound, connect the gate to its access route, and keep plant traffic clear of
the cabin entrance. Tall background geometry should frame the rig without
cutting across its mast or confusing the surface/section collar. A camera-facing
opening in the scene is an intentional cropped-world composition, not a claim
that a real urban site has an unsecured boundary.

## Verification scope

PDF text and the manufacturer's extracted dimensioned drawing labels were read
through the web tool. Its PDF screenshot endpoint failed; no claim of independent
visual inspection of those PDF pages is made here. The cabin dimensions agree
with the manufacturer's product listing, and the hoarding values are explicitly
labelled in the drawing extraction.

This research note does **not** certify the finished scene, draw-call count,
clearances, runtime loading, performance or disposal. Those require inspection
of the exported asset and the actual loaded runtime scene. Procedural fallback
must remain available for an absent asset, and captures must identify which
source actually rendered.

## Implementation verification — 6 September 2026

The authored scene is now implemented in `blender/sites/urban_plot.py`, using
the existing `blender/lib/site.py` primitive, material-join and export pipeline.
It contains one supported cabin, a braced three-sided hoarding composition,
an open vehicle entrance, a cleaning grid connected to hardstanding and a road,
an open spoil skip, wrapped stores and three surrounding building masses.
The foreground is deliberately clear for the existing machine and site support
props. No connected concrete line, cage installation or permanent piling
operation has been added to the shared urban archetype.

`terrain.js` registers `urban-plot.glb`, replaces the procedural urban furniture
only after that export is ready, and preserves the original fallback when the
asset is missing or returns HTML. Authored background replaces scattered birch,
stones, tufts and scrub. Runtime ground stays authoritative at the collar. The
76 m flat radius, 100 m falloff and removal of the decorative pad crown are
**NOT SOURCED composition choices**, with actual exported grade vertices checked
against `terrain.heightAt()`; they are not platform design values.

The material binding now consumes vertex colours, bakes their underlying
material white, and retains the ordinary material path for uncoloured assets.
All five site materials remain opaque. Imported material stubs, live instance
geometry, cached masters and in-flight parser results have distinct ownership;
terrain disposal aborts fetches and releases late results without rebuilding a
disposed scene. Diagnostics identify the attached scene rather than a cached
master, including after entering an underground drive. Replacing procedural
scatter also releases its instance buffers, in addition to its geometry.

### Failures reproduced before their fixes

- The initial exported GLB contained a **single white colour**, despite the
  Blender objects carrying the authored palette. Blender 5.2's deprecated
  `use_nodes` state was not a valid test for the presence of a vertex-colour
  node. The export emitted warnings and the actual-GLB CPU render was white.
  Testing/creating the actual node produced **17 exported colours**; the
  real-loader palette assertion failed on the first file and passed afterward.
- A procedural-to-model transition disposed the scattered vegetation geometry
  but did **not** dispatch `InstancedMesh.dispose()`. The new lifecycle test
  failed on retained instance buffers, then passed after the disposal change.

### Reproduction

From the repository root in PowerShell:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python blender/sites/urban_plot.py -- --preview
node tools/glbinfo.mjs public/models/sites/urban-plot.glb
node tools/checksiteenvironment.mjs
```

The optional preview reimports **the real exported GLB** and renders through
Cycles on the CPU, writing `shots/urban-plot-export.png`. Its ground, camera and
lighting are inspection fixtures. It proves exported composition and colour,
not the game's material rendering, camera framing, draw calls or performance.

`checksiteenvironment.mjs` uses the real `terrain.js`, real three.js GLTFLoader
and actual local urban/quarry GLB files. Canvas painting and browser IO are
substituted so it can check scene ownership without a GPU. Its 13 scenarios
cover actual source/anchors/colours/ground contact, shared asset ownership,
the unchanged uncoloured quarry material path, replacement of scatter buffers,
missing/HTML fallback, repeated rebuilds, underground transitions, changed
archetypes during loading, ordinary/double disposal, and disposal during fetch,
body read and parse. Missing exports and failed assertions exit nonzero.

The completed colour build measured **5 primitives and 29,576 triangles**;
`glbinfo.mjs` measured overall site bounds **63.585 × 20.480 × 65.965 m**
(world X/Y/Z extent, not cabin dimensions). The real loader checked **8,512
exported grade vertices** against the flat terrain. These are CPU asset/scene
measurements; the primitive count is not a claim of complete surface-band cost.

### Headed browser verification

Seven captures used system Chrome, HIGH quality and 2× device scale, with audio
muted. The old terrain module from commit `8a1546a` was served through an
isolated Vite transform for the baseline. The missing-asset cases intercepted
only the urban GLB with a deliberate 404 response. All other source and model
files were the same prepared worktree. The generated contract could select a
corridor, so the harness explicitly selected the supported urban archetype and
recorded both the original and selected archetypes. It loaded the real
`cfa-rig.glb` before selecting the rig and verified the actual rig/archetype
before accepting a capture.

Counts below come from actual renderer probes with the same live camera and
shadow auto-update disabled. The site's contribution is the difference between
the surface scene rendered with and without `terrain.root`.

| Viewport | Source | Surface calls | Site contribution |
|---|---|---:|---:|
| 390 × 844 | Original procedural urban | 45 | 16 |
| 390 × 844 | Actual Blender urban | 46 | 17 |
| 390 × 844 | Deliberately missing GLB / fallback | 45 | 16 |
| 320 × 568 | Original procedural urban | 43 | 16 |
| 320 × 568 | Actual Blender urban | 44 | 17 |
| 320 × 568 | Deliberately missing GLB / fallback | 43 | 16 |
| 390 × 844 | Existing actual quarry with `dth-crawler.glb` | 66 | 20 |

The new urban site costs **one extra complete-surface draw call** in the two
measured CFA views. Both remain below the documented 80-call surface ceiling.
This does not establish the budget for every urban rig, camera, quality tier or
weather condition. No frame-rate verdict is claimed.

All seven contexts remained live. Actual urban captures reported
`model: urban-plot`, `procedural: false`, no site problem and five asset
primitives; the 404 cases retained real procedural buildings and reported the
failure. The quarry retained its six-primitive source. The old worktree's two
`title/title` missing-model console errors occurred in every case; the known
`boreSDF` X4000 warning also remains in this worktree. Neither belongs to this
site change. There were no additional errors in the successful urban/quarry
cases; the intentional 404 adds the expected failed-request console entry.

**Visual limit:** the existing hero camera remains at approximately
`[8.4, 2.25, 10.94]` for the much larger CFA rig, cutting its mast off and
obscuring much of the site in both baseline and new captures. The new building
facades and boundary render behind it, but these shots do not establish that
all the authored cabin/logistics detail is perceptible during play. Camera
framing and the old worktree's HUD clipping/section artefacts require the
separate integration work; no claim of finished AAA presentation is made.

Local reproducibility/evidence is preserved in `.qa-urban/serve.mjs`,
`.qa-urban/capture.mjs`, `.qa-urban/capture-report.json` and the seven PNGs.
The development server used its own `.qa-urban/vite-cache`, never the shared
dependency directory. The browser closed and the shared GPU slot was released
after the last capture.

Final asset: **2,754,112 bytes**, SHA-256
`de46c2afb4049230c32a23e39ef0ad28512a2cc3b1ec6520e9f73f2f709675e3`.
GLBs remain generated output; the Python module is the source to integrate.

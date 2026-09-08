# Distant terrain stripe diagnosis — September 8

The fine woven lines on the surface horizon come from Contact AO. They are not
the intended subsurface bedding, a sand texture, or a wrong regional selection.
The candidate marks only `far-field` with the renderer's existing `noAO` flag.
The object remains visible in the normal color pass; local ground, site furniture,
rigs, and the geological section keep their AO behavior.

Production candidate: `src/world/terrain.js`, four added lines after
`farField.name = 'far-field'`. SHA256:
`390b3591b2783a80b0d45fd15f6e70d79d44c16b3c16255355c4e15871aac8a0`.
No rig geometry, dimensions, simulation, texture, regional color constant or fog
recipe changed. Nothing was committed or pushed by this sub-agent.

## Evidence and reproduction

All commands below ran from `drillity-terrain-graphics` under root's serialized
`terrain-graphics` GPU lease. They are review tools for this isolated workspace,
not portable package gates. The served base is the adjacent
`drillity-graphics-validation` worktree, preserving its approved paint, Sahara
haze and orbit framing combination. Only owned port 5231 is used.

- `python tools/prepare-terrain-diagnostic.py`
- `node tools/diagnoseterrain.mjs`
- `python tools/prepare-terrain-diagnostic.py --shade`
- `node tools/diagnoseterrain.mjs --out evidence/terrain/diagnostic-02`
- `python tools/prepare-terrain-diagnostic.py --candidate`
- `node tools/diagnoseterrain.mjs --out evidence/terrain/candidate-03`
- `node tools/measureterrainstills.mjs`
- `node --check src/world/terrain.js`

`diagnostic-01/report.json` contains two cases: Nordic DTH well-pad, seed 3,
hero camera; and Sahara oil-derrick, seed 20260908, hero camera. Depth is 6 m,
high quality at 390×844 CSS pixels/DPR 2. The same generated contract, actual GLB,
site, camera, clocks and simulation are held within each matched pair. Hiding
only `far-field` removes the horizon and its lines; hiding `ground` does not.

The runtime raycast hits the far-field at approximately 328–352 m in the Nordic
case. Terrain, environment and world state all report `nordic`. That mesh's
vertex colors are green, its material has no albedo, normal, roughness, metalness
or AO map, and its recorded shader is the expected MeshStandard/USE_COLOR program.
The captured shader sources in the report establish that a hidden tiled texture
is not the explanation.

`diagnostic-02/report.json` isolates shading on the Nordic scene. Disabling
Contact AO removes the fine lines. Replacing just the far-field material with
an unlit vertex-color material keeps the lines. Turning off its environment
intensity produces a byte-identical PNG. Turning off its fog reveals more of the
green foreground skirt but keeps the lines. This identifies the AO contribution;
it does not establish which depth precision or sample term inside that shader
is responsible.

`candidate-03/report.json` serves the actual candidate terrain file using a Vite
load plugin for that exact module path. The report records the candidate file
and SHA before/after, the unchanged base manifest, and the harness SHA. The
runtime `far-field.userData.noAO === true` assertion ensures the candidate loaded.
Within each case, `legacy-ao` changes only this flag to false; `restored` puts it
back to true. The complete generated source tool is `tools/diagnoseterrain.mjs`.

Both candidate cases passed source/scene identity, actual GLB, SITE/camera,
assets-ready and browser-error checks. Every run closed its browser and server
in `finally`; no listener remained on 5231 and the GPU lease was returned to idle.

## Visual result and limits

The candidate removes the fine horizon stripes in both reviewed scenes. The
pixel report uses explicitly recorded horizon rectangles and includes the final
film grain. Mean absolute vertical luminance difference per adjacent pixel row:

| Scene | Legacy AO | Candidate |
|---|---:|---:|
| Nordic DTH well-pad | 16.976 | 1.674 |
| Sahara oil-derrick | 24.114 | 1.641 |

Nordic geological-section ROI, controls and restored full-frame pair have zero
changed pixels. Oil controls also have zero changed pixels; its geological ROI
has 15 changed pixels and its restored full frame has 289 changed pixels despite
passing the recorded state/camera identity checks. Do not describe the oil capture
as perfectly pixel-stable. These are matched still-image diagnostics, not FPS,
mobile performance, full-fleet or release acceptance.

The ochre cast remains. Nordic fog is authored as `#C9B49E` at density 0.0052;
the captured linear fog color is `[0.6643843, 0.5005665, 0.3400733]`. The distant
range therefore mostly takes warm fog, although its vertices are green. The
surface sky above it reads cooler in the image. Reconcile the fog/sky regional
color relationship in a separate measured environment pass; do not hide it by
repainting the terrain or assert that this AO fix completes graphics work.

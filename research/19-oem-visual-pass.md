# OEM visual pass — 2026-09-04

## Scope and evidence

Read HANDOFF.md (the repository's handover), DOMAIN.md and crawler-lite reference pack.
Used Google Images for visual orientation: Klemm KR 806 / Casagrande C6 XP.
Reopened primary manufacturer pages below. Older local references cite another
machine's C:/Users/henri/Downloads; those local PDFs are NOT available here and
their page-level claims have not been independently reverified in this pass.

| Reference | Source | Design implication |
|---|---|---|
| Bauer BG 28 BT 70 | https://equipment.bauer.de/en/drilling-rig-bg-28-bt-70 | Kelly machine family: leader, rotary drive, Kelly bar and winches must form a coherent assembly. |
| Bauer component diagram | https://equipment.bauer.de/en/media/6189/download?inline= | Reference for identifying mast head, guide, crowd cylinder, drive and tool; do not transpose these onto a compact anchor rig. |
| Liebherr LB 30 | https://www.liebherr.com/en-int/p/lb30-5389452 | Separate Kelly, double rotary and CFA configurations. A tall mast alone does not establish the drilling method. |
| Klemm KR 806-4GM | https://www.klemm.de/en/products-1/drilling-rigs/kr-806-4gm/ | Articulated anchor/overburden architecture with double-rod magazine and manipulator. This is larger than the starter rig. |
| Casagrande crawler range | https://casagrandegroup.com/foundation-equipment-piling-rigs/crawler/ | Anchoring, micropiling and jet grouting reference family, distinct from large piling machines. |
| Epiroc SmartROC D65 | https://www.epiroc.com/content/dam/epiroc/surface-and-exploration/1-surface-drill-rigs/1-smartroc/smartroc-d65/web_pdf/9868%200163%2001k%20SmartROC%20D65%20Mk2%20Epiroc%20brochure_WEB.pdf | DTH machine, pipe handling and compressor services, not a top-hammer body on every method. |
| Sandvik Ranger DX600 | https://www.mining.sandvik/en/products/equipment/surface-drill-rigs/ranger-dx600-surface-top-hammer-drill-rig/ | Top-hammer surface machine with cab and rod handling. |
| Comacchio GEO 305 | https://www.comacchio.com/en/machine-configuration/geo-305 | Compact multipurpose platform supporting augering, rotary and other configurations. Closest size/family reference for the first module. |

## First implementation

- Blender MCP used via its configured stdio server, connected to Blender 5.2.1.
- New independent development scene; pre-existing Blender scene retained.
- Fictional compact rotary head: gearcase, twin hydraulic motors, valve blocks,
  pressure lines, stationary flushing swivel and hollow rotating output shaft.
- Editable .blend source in the task outputs; game asset in
  src/rig/models/compact-rotary-head.glb; reproducible authoring script in tools/.
- No OEM badges or copied commercial meshes/textures. Dimensions are design
  choices for the fictional NV-90; not an OEM dimensional replica or validated
  engineering assembly. Do not publish its dimensions as verified manufacturer facts.
- Head switches to the existing percussive module for top-hammer. Other
  configurations, especially overburden double heads and SPT, still need separate review.
- First correction to the feed assembly: suppress duplicate end equipment at the
  split flex joint; add a forward crown silhouette. No claim that the complete
  carrier or mast has been rebuilt in Blender.

## Validation and costs

- GLB: 8,556 triangles; 509,944 bytes; six mesh objects (export may split material primitives).
- Tests assert Y-up/metre conversion, outlet alignment, preserved spindle node,
  high/low module selection and stable node count after repeated method switches.
- HIGH/MEDIUM use the Blender module; LOW retains a lightweight procedural rotary.
- Browser workshop is a neutral inspection scene using the real rig system,
  not a measurement of complete game performance or mobile performance.
- Production single-file build passes through Vite's programmatic API:
  47 transformed modules; dist/index.html 3,412.62 kB at this revision.

## Next priorities and engine decision

Keep Three.js for the current mobile-web scope. This is a project decision based
on existing animation, save, UI and simulation systems, not an engine benchmark.
Blender replaces the asset-authoring workflow; it does not require rewriting the game.
Revisit the engine only after a representative complete site is measured on target phones.

1. Entire compact rig: proportioned carrier, real positioner pivots and cylinders,
   feed carriage, guide/clamp stack, guards and connected services.
2. Correct auger string/flight and soil return, then rod-change choreography.
3. Separate authored large-foundation and top-hammer machine families.
4. Fix procedural material scale: current close-up inspection exposes overly
   strong normal detail on existing steel/paint; use material-specific scale and
   UVs, not stronger postprocessing.
5. Bake small details, share material sets, use LOD and keep moving assemblies
   separate. Validate silhouettes before increasing polygon density.
6. Review site arrangement: support equipment and exclusion areas appropriate
   to the method, with an unobstructed player view of the actual operation.

45% is retained as a planning baseline from HANDOFF, not a measured completion
number. One new module does not justify a new percentage.

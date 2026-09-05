# Claude parallel build brief — Blender site environments

Prepared 2026-09-06 at the owner's request. This is a proposed parallel work
allocation, not evidence that Claude is connected or has started. Codex reserves
this track from new assignments so it can be taken up without duplicate work.

## Objective

Finish the eight remaining Blender-authored site environments and connect them
to their actual game archetypes. The game already has ten procedural archetypes;
only quarry-bench and urban-plot currently have Blender site source modules.
Build recognizably different working places, with sourced equipment details,
clear machine/collar visibility, and verified runtime replacement of old props.
A gallery of unused models is not completion.

Read ASTRA.md fully, especially owner rules in section 1, and give those rules
verbatim to every worker. Also read research/ASTRA-progress-2026-09-06.md,
handover.md, DOMAIN.md, blender/lib/site.py, and the site research cited by
src/world/terrain.js. ASTRA's historical test results are not current proof.

## Twenty concrete worker assignments

Assign one builder and one independent critic to each row: sixteen agents.
The builder owns its new Python module and its own research/evidence directory.
The critic owns separate review evidence, and must inspect exported geometry
and actual images rather than approve source text alone.

| Builder + critic | Archetype | New module | Identity to preserve |
|---|---|---|---|
| 1 + 9 | infrastructure-corridor | blender/sites/infrastructure_corridor.py | Cleared alignment through surrounding terrain |
| 2 + 10 | open-pit-bench | blender/sites/open_pit_bench.py | Large excavation with benches forming the horizon |
| 3 + 11 | tunnel-portal | blender/sites/tunnel_portal.py | Portal and supported approach cut, distinct from an underground heading |
| 4 + 12 | underground-drive | blender/sites/underground_drive.py | Underground working space appropriate to live drilling mode |
| 5 + 13 | exploration-pad | blender/sites/exploration_pad.py | Small clearing inside the regional biome |
| 6 + 14 | well-pad | blender/sites/well_pad.py | Graded working pad with method-appropriate support equipment |
| 7 + 15 | platform-deck | blender/sites/platform_deck.py | Fixed offshore working deck |
| 8 + 16 | marine-spread | blender/sites/marine_spread.py | Mobile marine spread, visibly distinct from a fixed platform |

Use the remaining four agents for cross-cutting work:

17. Runtime integration: exclusive ownership of the site-loading/archetype
    portions of src/world/terrain.js and any necessary narrow blender/lib/site.py
    extension. Consume exports, suppress only the props they replace, preserve
    missing-asset fallback and late-load/switch/disposal behavior. Surface,
    underground and offshore placement need separate verification: the existing
    surface attachment path does not automatically support every plane.
18. Asset validation: new site-specific checks for exact filenames, actual
    exported vertices, valid material names, origin/axes, empty or corrupt assets,
    unwanted exports, and build/disposal behavior. Reuse tools/glbinfo.mjs;
    do not create a second dimensional CLI.
19. Provenance critic: cross-site source audit, correct distinctions between
    physical dimensions and explicitly NOT SOURCED fictional composition,
    invented marques, and method suitability. No guessed engineered clearance,
    bench geometry, structure rating or offshore equipment specification.
20. Runtime visual/performance critic: prepare integrated capture cases,
    compare silhouettes, collar visibility and duplicate dressing, and measure
    actual warm draw calls/FPS after obtaining the shared GPU lease. Counts of
    materials/primitives are useful evidence, not a substitute for runtime
    draw measurements. Record blocked or unavailable checks honestly.

Claude coordinates these workers, resolves reviews and delivers integrated
candidate patches. A worker finishing early can take another bounded task
inside this reserved track after checking ownership; no idle placeholder agents.

## Workspace and ownership

Integration repository: C:\Users\henri\Downloads\drillity-the-game.
Codex branch: codex/astra-improvements. Brief preparation HEAD: 1b913e8.
Use a separate worktree/branch, for example
C:\Users\henri\Downloads\threads\drillity-claude-sites and claude/site-environments,
created from the latest reviewed Codex commit at actual start. Record that SHA.
Do not reset or clean Codex's working tree, copy its incomplete changes wholesale,
or let twenty agents all edit terrain.js or the shared site library.

Codex continues to own renderer.js, geology.js, HUD/screens, preview.js,
rigFactory.js, gltfRig.js, tools.js, data.js, progression.js, economy.js,
drilling.js, machine Blender modules, shared rig.py/anim.py, UI atlas,
package.json and build packaging. Send cross-file needs as scoped patches or
precise requests in the coordination checkpoint; do not silently edit them.
Existing quarry_bench.py and urban_plot.py are reference assets, not replacement
assignments. New sites must not regress their current loading or geometry.

Keep existing authored primitives and material contracts. Never introduce
nonzero transmission. The rig limit is at most 70 measured draws; sites have
their own lower budget in blender/lib/site.py and must not simply add calls on
top of procedural dressing. Preserve the live terrain/collar and section seam.
Do not cover them with an opaque decorative floor. New physical constants need
nearby primary citations; artistic layout choices need explicit labels.

## Shared machine and coordination

Shared checkpoints: C:\Users\henri\Downloads\threads\drillity-coordination.
Write claude-sites.md with ownership, baseline, active workers, completed
deliveries, measurements and exact next steps. Read root-coordinator.md for
Codex's current ownership and GPU queue. Use a separate claude-sites.gpu-request.md
to request a window; launch headed Chrome/GPU rendering only when gpu-owner.txt
is exactly the assigned Claude key. Close and verify owned browser processes
before releasing that exact lease. Do not overwrite another owner's lease.

Twenty agents can research/code/review concurrently; twenty simultaneous
Blender renders on this one computer would compete with each other and the
game captures. Limit expensive exports/renders deliberately and measure memory
and runtime cost. CPU-only checks can proceed while another task holds the GPU.
Do not close the user's original game server on port 5178.

## Delivery and review gates

Deliver one reviewed site at a time, with source plus its exact matching GLB at
public/models/sites/<hyphenated-archetype>.glb. Each delivery needs source and
asset hashes, reproducible build command, primary-source notes, critic findings,
actual rendered images, test commands/results and honest outstanding issues.
Keep the integrated working tree reproducible and preserve partial work.
Never claim an image is a gameplay capture when it is an offline Blender render.

Provide scoped commits or patches against the recorded baseline. Only the
designated integrator stages explicit paths; never git add -A. Deliver package
script/build-manifest additions as a separate proposal for Codex's integration.
Do not overwrite newer Codex files, force-push, merge the main branch or deploy.

Codex's 5%-remaining graceful shutdown instruction concerns its own live usage
pool: Codex will checkpoint, prepare handover.md and push reviewed work. Claude
must not infer its separate allowance from a Codex reading. At Codex handoff,
read the final handover and compare branch SHAs before integrating either side.
The shared GPU lease and preserved worktrees remain authoritative across that
transition.

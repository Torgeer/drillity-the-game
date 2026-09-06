# GPU verdict — the first frames the site work has ever been seen in

**2026-09-06, GPU lease `claude-gpu`.** Ten site environments, nineteen
machines and a loader rewrite landed overnight and **nothing built in that work
had ever been rendered on a GPU**. Every draw-call number quoted in every
handover to date is `renderer.info.render.calls` — a **CPU mesh-submission
count** — and Codex's own handover says plainly *"No fleet FPS result yet."*
This is the first pass with the discrete GPU bound.

## The instrument, stated before any number

| | |
|---|---|
| GPU, read live | `ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Laptop GPU (0x00002860) Direct3D11 vs_5_0 ps_5_0, D3D11)` via `WEBGL_debug_renderer_info` |
| browser | system Chrome, `channel: 'chrome'`, **`--headed`**, `--ignore-gpu-blocklist --enable-gpu-rasterization` |
| device | Playwright `iPhone 13 Pro`, 390 × 844 CSS, DPR 2 |
| quality | `?quality=high&shot` |
| warm | session gate: programs stable ≥ 10 s **and** rAF stopped improving, floor 25 s. Per-stop gate as well. Every number below is labelled. |
| throttle guard | rAF > 400 ms ⇒ throttled ⇒ ungraded. **No state in any run below was throttled**; all read `visibilityState: visible`. |

**What kind of number each column is.** `surf` / `sect` / `rig` / `net` /
`own` are **CPU mesh-submission counts** (`renderer.info.render.calls`, with
`info.autoReset = false` so the whole frame including the post chain is
counted). WebGL2 exposes no GPU-side draw-call counter, so a "GPU draw
measurement" of that quantity does not exist to be taken; what these numbers
now have that the earlier ones did not is that they were taken **while the
discrete GPU was actually rendering the frame, warm**. **`fps` is a genuine GPU
measurement** — median of a 40-frame rAF window (60 frames in the repeat run),
vetoed if any shader program linked during the window.

**Two trees, and they are not the same tree.** Four other agents were editing
concurrently.

* The **fleet run** (methods + machines) is against the **dev server on 5180**,
  page booted `2026-09-06T15:17:40Z`, HMR muted. `src/world/terrain.js` was
  modified by another agent **17 seconds later**; with HMR muted the page kept
  the modules it booted with, so these numbers describe the tree as of that
  boot and not as of now.
* The **site run** is against the **built preview on 5179** (`dist/`, built
  16:58 local) — a fixed, self-consistent snapshot that predates that edit.

Report `shots/gpu-report.txt` + `.json`, tag `gpu`.
**The owner's server on port 5178 was not touched.** `shoot.mjs` defaults
`--url` to 5178; every run below passed an explicit URL.

---

## 1. The ten site archetypes — is a site model net additive?

Method: two passes over the same ten states in the same order, same warm-up.
In the **kit** pass every `models/sites/*.glb` request is aborted at the
network layer, so `siteModelReady()` is false, the suppression knobs
(`arch.replaces`, `replacesKit`) do not fire and the procedural kit draws — the
true "before". In the **glb** pass the model loads normally. `terrain.siteModel`
was read at every stop and confirmed the state each time.

`net = glb − kit` is the number the budget actually cares about.
`own` is the model's own cost, taken by hiding the `site:<id>` node and
re-rendering.

| archetype | kit | glb | **net** | own | sect | rig | fps | grade |
|---|---|---|---|---|---|---|---|---|
| urban-plot | 61 | 63 | **+2** | 5 | 13 | 39 | 144.9 | measured-warm |
| infrastructure-corridor | 59 | 62 | **+3** | 4 | 17 | 30 | 144.9 | measured-warm |
| quarry-bench | 85 | **88** | **+3** | 6 | 17 | 60 | 147.1 | measured-warm |
| open-pit-bench | 60 | 61 | **+1** | 4 | 17 | 36 | 142.9 | measured-warm |
| tunnel-portal | 88 | **92** | **+4** | 6 | 17 | 59 | 144.9 | measured-warm |
| underground-drive | 73 | 77 | **+4** | 4 | 16 | 56 | 144.9 | measured-warm |
| exploration-pad | 64 | 69 | **+5** | 5 | 17 | 38 | 144.9 | measured-warm |
| well-pad | 45 | 50 | **+5** | 6 | 19 | 21 | **48.3** | measured-warm |
| platform-deck | 39 | 43 | **+4** | 4 | 19 | 21 | **47.6** | measured-warm |
| marine-spread | 58 | 64 | **+6** | 6 | 16 | 42 | 144.9 | measured-warm |

Both passes: 10/10 states warm, zero page reloads, 10 `.glb` requests aborted
in the kit pass, `procedural: true` confirmed at every kit stop and
`procedural: false` with the right `model` id at every glb stop.

### CONFIRMED: every site model is net additive, +1 to +6

**The CPU-measured claim survives the GPU.** The spread is exactly the claimed
`+1 to +6`, and the ordering is not luck: **`own` equals the module's material
count in all ten cases** (4, 5 or 6), which is `site.py`'s "one draw call per
material per site .glb" holding precisely. The archetypes that give back most
are the ones with real kit to suppress (`open-pit-bench` +1 against `own` 4 —
three calls returned); the ones that give back nothing are the offshore and
marine pair, where there was little procedural kit to replace.

#### Two instruments, built independently, agree

While this ran, the runtime-integration owner measured the same quantity on the
CPU with `tools/checksiteenvironment.mjs` — a different A/B (mesh submissions
under `terrain-root`, model live minus model 404'd, worst of nordic /
german-site / iberian-quarry) — and wrote the result into `site.py`'s
**WHAT IS STILL OPEN** §2, noting that it *"still needs the GPU lease"*.
Here are the two, side by side:

| archetype | their CPU net | **my GPU net** | their prims | **my `own`** |
|---|---|---|---|---|
| urban-plot | +1 | **+2** | 5 | **5** |
| open-pit-bench | +2 | **+1** | 4 | **4** |
| infrastructure-corridor | +3 | **+3** | 4 | **4** |
| quarry-bench | +3 | **+3** | 6 | **6** |
| tunnel-portal | +4 | **+4** | 6 | **6** |
| platform-deck | +4 | **+4** | 4 | **4** |
| exploration-pad | +5 | **+5** | 5 | **5** |
| well-pad | +5 | **+5** | 6 | **6** |
| marine-spread | +6 | **+6** | 6 | **6** |
| underground-drive | +4 | **+4** | 4 | **4** |

**The model's own cost matches on all ten. The net matches on eight of ten**,
and the two that differ do so by 1 in opposite directions — which their own
note predicts: *"what is actually dropped is a function of the REGION as well
as the archetype"*, and the two probes did not stand in the same regions.

That is the strongest form this evidence can take: two instruments, written by
different agents against different scene graphs, one on the CPU and one with
the GPU bound, landing on the same numbers. **§2 of WHAT IS STILL OPEN can be
marked re-measured.** The open budget problem it names is real and unchanged —
all ten are net additive — but it is no longer an unverified CPU count.

### The harness now shoots sites, and its run says something sharper

`shoot.mjs --headed --only sites` (new, §5) captured all ten independently.
Every archetype hit on its **first** candidate method, **zero procedural
fallbacks, zero substitutions** — including `underground-drive`, which the
runtime accepted under `rockbolt`.

| id | surf | sect | rig | fps | as method | machine |
|---|---|---|---|---|---|---|
| s01-urban-plot | 52 | 18 | 27 | 142.9 | auger | crawler-lite |
| s02-infrastructure-corridor | 61 | 17 | 27 | 142.9 | auger | crawler-lite |
| s03-well-pad | 63 | 17 | 27 | 142.9 | auger | crawler-lite |
| s04-exploration-pad | 61 | 17 | 27 | 142.9 | auger | crawler-lite |
| **s05-quarry-bench** | **90** | 17 | 60 | 142.9 | top-hammer | crawler-th |
| **s06-open-pit-bench** | **86** | 17 | 60 | 144.9 | top-hammer | crawler-th |
| **s07-tunnel-portal** | **95** | 17 | 60 | 142.9 | top-hammer | crawler-th |
| s08-marine-spread | 67 | 17 | 42 | 144.9 | site-investigation | si-rig |
| s09-underground-drive | 73 | 15 | 51 | 140.8 | rockbolt | bolter |
| s10-platform-deck | 45 | 20 | 21 | **57.1** | oil-rotary | oil-derrick |

All ten measured-warm. `VERDICT: FAIL`, exit 1.

**THE MACHINE DOMINATES THE SITE.** `open-pit-bench` measures **61** under the
`rc-rig` (rig 36) and **86** under `crawler-th` (rig 60) — the *same site*,
25 draw calls apart. All three archetypes over 80 in this run are the three
standing `crawler-th`, and `crawler-th` is the joint-worst rig band in the whole
fleet at 60.

This reframes the budget arithmetic in `site.py`. Its allowance is solved
against *"the worst rig that stands on a quarry bench (m08-rc, measured) −57"*.
On the GPU, the worst rig that stands on a quarry bench is **`crawler-th` at
60**, not `rc` at 57, and `top-hammer` is a quarry-bench method. **The site's
allowance is 3 calls smaller than the header computes**, which turns
`quarry-bench`'s "spending exactly its 17" into spending 20 against 14. The
6-material ceiling is still the right *shape* of answer; the subtraction under
it should be re-solved against the machine that actually shows up.

### Two archetypes are over the surface ceiling — and both were over before

`quarry-bench` **88** and `tunnel-portal` **92** breach the 80 surface budget.
**Neither breach is caused by the site model**: without any `.glb` they already
measure **85** and **88**. The model adds 3 and 4 on top of a band that was
already over. `site.py`'s premise — *"there is no headroom to spend"* — is
confirmed on the GPU, and its 6-material ceiling is the right shape of answer.
The remaining 8–12 calls have to come out of the rig or the kit, not the model.

### The offshore pair is frame-rate bound, and it is not the site model

`well-pad` **48.3** and `platform-deck` **47.6** are the only sub-60 site
states. Both stand the `oil-derrick`. Draw calls are the *lowest* of all ten
(50 and 43 against a 92 worst case), so **this is not a submission-count
problem** — it is fill or shader cost.

The first pass threw one reading that did not fit: `platform-deck` measured
142.9 fps with the `.glb` blocked against 47.6 with it loaded, a 3× frame-time
swing that 4 extra draw calls cannot explain. **Rather than report it, I
re-measured it.** A dedicated run alternated the two archetypes three times
each inside one warm session, blocked and loaded, 60-frame windows:

| | sample 1 | sample 2 | sample 3 |
|---|---|---|---|
| `platform-deck` **loaded** | 40.0 | 43.5 | 39.2 |
| `platform-deck` **blocked** | 45.7 | 42.4 | 40.7 |
| `well-pad` **loaded** | 40.2 | 37.7 | 49.5 |
| `well-pad` **blocked** | 35.6 | 51.3 | 42.4 |

**The 142.9 does not reproduce.** It was a single unlucky 40-frame window and
it is retracted. Twelve fresh samples put both archetypes at **35.6 – 51.3 fps
whether the site model is loaded or not**: blocked and loaded are
indistinguishable. **The site model is definitively not the cause.** This
matches the fleet run, where the same machine measured `m12-oil-rotary` 39.7
and `r12-oil-derrick` 34.4 — four independent states, two trees, sixteen
samples, never once at 60.

**One caveat on these two rows.** The probe forces the *archetype* but leaves
the region the method's own first region, which for `oil-rotary` is **sahara**.
So `platform-deck` was measured standing in sahara rather than its native
north-sea. That makes these two rows a measurement of *"the oil-derrick, in
sahara, under two different archetypes"* — which is what isolates the site
model as innocent, but is not the shipping pairing for `platform-deck`.

**What I did not isolate: the cause of the oil-derrick frame cost.** It is
reproducible, it is not draw calls and it is not the site model. Beyond that I
am not guessing.

---

## 2. The nineteen machines — the ≤ 70 rig budget

**Zero breaches. The highest rig-band cost anywhere in 52 states is 60.**

| machine | rig calls | surf | sect | fps | grade |
|---|---|---|---|---|---|
| r01-crawler-lite | 27 | 50 | 18 | 140.8 | measured-warm |
| r02-cable-percussion | 16 | 49 | 15 | 116.3 | measured-warm |
| r03-crawler-th | 46 | 72 | 16 | 142.9 | measured-warm |
| r04-si-rig | 42 | 73 | 16 | 103.1 | measured-warm |
| r05-dth-crawler | 49 | 73 | 16 | 137.0 | measured-warm |
| r06-core-rig | 36 | 66 | 18 | 133.3 | measured-warm |
| r07-cpt-unit | 26 | 48 | 16 | 126.6 | measured-warm |
| r08-rc-rig | 34 | 62 | 18 | 105.3 | measured-warm |
| r09-foundation-bg | 22 | 44 | 13 | 99.0 | measured-warm |
| r10-cfa-rig | 28 | 52 | 15 | 137.0 | **measured-COLD** (1 program linked during the window) |
| r11-bolter | 51 | 68 | 15 | 137.0 | measured-warm |
| r12-oil-derrick | 6 | 31 | 20 | **34.4** | measured-warm |
| r13-piling-leader | 41 | 62 | 15 | 138.9 | measured-warm |
| r14-tunnel-jumbo | 45 | 62 | 17 | 140.8 | measured-warm |
| r15-pd55 | 47 | 70 | 14 | 135.1 | measured-warm |
| r16-hdd-rig | 42 | 65 | 16 | 144.9 | measured-warm |
| r17-longhole-rig | 49 | 69 | 18 | **47.4** | measured-warm |
| r18-sonic-truck | 36 | 66 | 17 | 144.9 | measured-warm |
| r19-raisebore | 22 | 44 | 33 | 126.6 | measured-warm |

Worst rig-band cost across **all** 52 states, method states included:
`m03-top-hammer` 60, `m06-overburden` 60, `m20-jet-grouting` 59,
`m14-driven-pile` 57, `m16-tunnel-jumbo` 56. **All under 70.**

### `m07-core = 82 against 80` is not reproduced

The brief carries `m07-core` last seen at 82 against the 80 **surface** budget.
Today `m07-core` measures **surface 72, rig 38, 90.9 fps warm**. Whatever
caused it has been fixed or has moved. Likewise `ar5-report.txt`'s
`rig m11-rockbolt = 125` against a ceiling of 70: today `m11-rockbolt` measures
**rig 51**, and `r11-bolter` **51**. Those reports predate the harness fix and
are not quotable; these numbers replace them.

### `r12-oil-derrick` rig = 6 is an anomaly worth someone's attention

Six draw calls for a 25.79 m derrick, on the orbit camera 13 m out. The most
likely reading is that most of the machine is outside the frustum at that
camera distance, so most of its meshes are never submitted — which would mean
**the machine portrait is not showing the machine**. I did not verify that
against the frame. Flagged, not concluded.

---

## 3. The twenty-one method states — surface ≤ 80

Four breaches, all warm, all on the dev-server tree of 15:17:40Z:

| state | surf | rig | sect | fps | grade |
|---|---|---|---|---|---|
| **m03-top-hammer** | **88** | 60 | 16 | 142.9 | measured-warm |
| **m06-overburden** | **85** | 60 | 17 | 147.1 | measured-warm |
| **m14-driven-pile** | **82** | 57 | 14 | 133.3 | measured-warm |
| **m20-jet-grouting** | **82** | 59 | 17 | 74.1 | measured-warm |

The other seventeen: `m21-raise-boring` 44, `m01-auger` 50, `m02-cable-tool`
50, `m12-oil-rotary` 52, `m13-anchor` 54, `m19-sonic` 60, `m10-cfa` 65,
`m08-rc` 69, `m18-longhole` 70, `m07-core` 72, `m09-rotary-kelly` 72,
`m15-cased-cfa` 72, `m04-site-investigation` 73, `m11-rockbolt` 73,
`m16-tunnel-jumbo` 77, `m05-dth` 78, `m17-hdd` 78. All measured-warm.

**Section band ≤ 60: zero breaches in 52 states** (worst 33, `m21-raise-boring`
and `r19-raisebore`).

**Frame rate ≥ 60: three breaches, all warm** — `m12-oil-rotary` **39.7**,
`r12-oil-derrick` **34.4**, `r17-longhole-rig` **47.4**. On a desktop RTX 4070.
`GAMEDESIGN.md` §6 targets 60 fps on a mid iPhone; these three are nowhere
near it and the gap is not draw calls.

### The eight-over-twenty-one baseline in `site.py` is real, and it has moved

`site.py` cites `shots/s0-report.txt` for eight of twenty-one states over 80
with no site model. **That citation is accurate** — I read the file
(2026-09-05T19:25Z, main checkout; absent from this worktree exactly because
`.gitignore:15` carries `shots/*.txt`, precisely as `site.py`'s retraction
explains). It records `m16-tunnel-jumbo 89 · m06-overburden 86 · m08-rc 85 ·
m11-rockbolt 84 · m05-dth 83 · m18-longhole 83 · m19-sonic 83 · m07-core 81`.
Today the same band shows **four** over, and a different four. The header's
reasoning stands; its specific list is stale.

---

## 4. THE FRAME CONSTANT — settled

**`HALF_W_K` is not one number. It is a function of the stage, and 0.4023 is
not a value it can take.** Read from the live `camera.projectionMatrix`,
21 method states × 3 stage aspects, warm, headed, on the discrete GPU.

`fovForBand()` (`renderer.js:1161-1165`) re-solves the *vertical* field every
frame precisely so the *horizontal* one never moves, so the invariant is:

```
HALF_W_K = tan(hero_fov / 2) · stage.w / (stage.h · LAYOUT.surfaceHeight)
         = tan(17°) · refBandAspect                     (renderer.js:1353)
```

`computeLayout()` letterboxes the viewport into a stage clamped between
`STAGE_ASPECT_MIN 9/19.5` and `STAGE_ASPECT_MAX 9/16` (`renderer.js:28-29`,
`1314-1317`), so the whole reachable range is:

| stage | refBandAspect | solved | **measured** (median of settled states) |
|---|---|---|---|
| 9/16, 405 × 720 | 1.041667 | 0.318469 | **0.318459** (n=9, 0.31811 – 0.31876) |
| iPhone 13 Pro, 390 × 844 | 0.855714 | 0.261618 | **0.261619** (n=18, 0.26139 – 0.26185) |
| 9/19.5 floor, 390 × 845 | 0.854701 | 0.261308 | **0.261451** (n=9, 0.26132 – 0.26145) |

The matrix itself — `dth`, 390 × 844, hero, warm, registration live:

```
projectionMatrix.elements = [ 3.8222247, 0,         0,          0,
                              0,         4.8555949, 0,          0,
                              0.3239795, 0.0867073, -1.0002000, -1,
                              0,         0,         -0.5000500, 0 ]

HALF_W_K = 1/e[0]        = 0.261628
TOP_K    = (1+e[9])/e[5] = 0.223805
BOT_K    = (1-e[9])/e[5] = 0.188091
e[8] = 0.3240, e[9] = 0.0867   ← setViewOffset registration, live and damped
```

### 0.4023 is refuted — and here is where it almost certainly came from

Under the hero camera, 0.4023 requires a stage aspect of **0.711**, and
`computeLayout()` cannot make one wider than 0.5625. It is unreachable on every
device the game can run on.

What it **is**, to within 0.65 %, is the camera *before* `updateSurfaceCamera()`
has ever run. The surface camera is constructed with `fov 42`
(`renderer.js:1099`) and that value survives until the first fov update. On a
9/16 stage that state measures **0.399653** — and this run caught it eleven
times on that viewport, every time a matrix was read before the fov spring left
its initial value. On the two taller stages the same unsettled camera reads
0.328305, nowhere near 0.4023; **only the 9/16 stage produces ≈ 0.40**.

The most probable provenance of 0.4023 is therefore a projection matrix read on
a 9/16 stage that had not yet entered hero mode. *That is a hypothesis about how
the number was made — the refutation above is the measurement.*

### 0.3185 is right, but only for the widest stage the game can show

It is exactly the 9/16 value, and 9/16 is the **ceiling**. Every phone taller
than 9/16 gets a **narrower** frame, and that is every phone this game targets —
the harness's own device is 9/19.49.

**Author against the narrowest reachable frame: `HALF_W_K = 0.2613`.**
Geometry sized to 0.3185 sits up to **22 %** outside the frame on a tall phone;
geometry sized to 0.4023 sits up to **54 %** outside it.

### `TOP_K` and `BOT_K` are not constants at all

`TOP_K + BOT_K = 2 · HALF_W_K / bandAspect`, and `bandAspect` moves with the HUD
chrome. **Three different surface bands were measured on the same device in the
same run** — 390×456 (no chrome), 390×307 and 390×281 — giving vertical fields
of **34.00°, 23.27° and 21.35°**, with `HALF_W_K` holding at 0.2616 through all
three. That is `fovForBand` doing exactly its job, and it is the proof that the
horizontal is the invariant and the vertical is not.

The authored pair sums to 0.3703, which belongs to a band aspect of 1.413 —
a 390×276 band no current screen produces. *"The modules measure the live value
near 21°"* was true when it was written and is not true now. **Derive the
vertical half-extent from the live band; never copy it.** And the TOP/BOT
asymmetry is not composition either — it is the `setViewOffset` registration.

### Modules affected — each file read to confirm, not inferred

| module | what depends on it | consequence at 0.4023 vs a true 0.2613 |
|---|---|---|
| `well_pad.py:1364-1371` | the `NDC_EDGE 0.85` gate divides by `half_width(dist)` | under-reports NDC x by **1.54×**; furniture passing at 0.85 really reaches ≈ **1.31 — outside the frame**. The gate is permitting exactly what it exists to stop. |
| `underground_drive.py:517, 1321` | `x_limit()` = `KEEP_NDC_X · HALF_W_K · dist_at(z)` | the laydown strip is ≈ **54 % wider in world metres** than the NDC column it was composed for |
| `quarry_bench.py:585, 592, 600, 652` | four `k · half_width(d)` placements | each sits 54 % further off-centre than intended |
| `infrastructure_corridor.py:1298` | vanishing-point assertion `tan(TURN)/HALF_W_K` | the assertion moves with the constant |
| `open_pit_bench.py:1332-1375` | haul-road placement and its `EDGE_LIMIT` clamp | the module documents that it was composed to survive either value — that claim now has a number to be checked against |

**Not affected:** `tunnel_portal.py` (defines `half_width` and never calls it;
its composition uses `height_at_ndc`), and `exploration_pad.py`,
`marine_spread.py`, `platform_deck.py`, `urban_plot.py`, which carry no frame
constants at all.

Re-solving those five is the site modules' own work, not this agent's. The
answer is now written into `blender/lib/site.py`'s header where the unresolved
note stood.

### Stale line references found while doing this

`site.py` cited `renderer.js:160`, `904-907`, `1507-1512`, `1671-1729`. The
real locations are **161** (`CAMERA_MODES.hero`), **1161-1165** (`fovForBand`),
**1353-1356** (`refBandAspect` / `bandAspect` / `camera.aspect`) and
**1991-2036** (`registerBands`). The first three sat inside the paragraph I own
and are corrected. **`1671-1729` sits in the next paragraph, which I do not
own, and is still wrong** — someone who owns it should change it to
`1991-2036`. `REG_MAX_X 0.22` / `REG_MAX_Y 0.12` at `renderer.js:183-184` and
the "±0.44 NDC x / ±0.24 NDC y" claim are both correct.

---

## 5. Is the harness trustworthy now?

`CRITIQUE.md` §8 alleged four holes. Codex reported fixing three of four.
**Verified against the current file and, for the exit code, against a real
run** — not by the absence of an error.

| hole | verdict | evidence |
|---|---|---|
| 1. `writeReport()` prints `VERDICT: FAIL` and exits 0 | **FIXED** | `shoot.mjs:1607-1609` delegates to `assessQaRun()` and writes `process.exitCode = Math.max(...)`. My full run graded **FAIL** and the process **exited 1**, captured directly. |
| 2. `if (!m \|\| m.error) continue;` swallows metric failures | **FIXED** | the line is gone; `qa-verdict.mjs:21` now pushes `incomplete` instead, and `:38-39` makes an all-metrics-fail run `INCOMPLETE` (exit 2), never `PASS`. |
| 3. coverage assertion over zero methods and zero rigs | **NOT FIXED** | `shoot.mjs:1595-1599` still prints *"Every id in the manifest and every rig in data.js has a frame in this run"* guarded only by `skipped.length` and the filter. **`assessQaRun` is never handed `methods` or `rigs`** — coverage is not an input to the verdict at all. Its only emptiness test (`qa-verdict.mjs:9`) is satisfied by the 11 UI shots alone. A content-read failure with an unparsable manifest still prints that line over 0 and 0 and can return PASS. |
| 4. abort paths capture nothing and exit 0 | **PARTIALLY FIXED** | exit codes are real now — `:1211` sets 2 on a boot abort, `:1253` sets 3 on a dead renderer, `:1776` sets 1 on an uncaught throw. But **neither abort path writes `report.json`**, so a consumer reading `shots/report.json` after an abort gets the *previous* run's file, and `page.goto` at `:1163` is still unguarded (exit 1, no report, no PNG). |

**Verdict: trustworthy for what it measures, with one live hole.** Hole 3 is
the dangerous one and it is the exact shape of `ASTRA.md` §10's *"a gate over
an empty set passes forever"*. Everything in this document was captured with
the fixed grader, so it is quotable. **Every report on disk that predates
`ad5aaf1` (2026-09-06 00:26) is not**, including `s0-report.txt` — I quote its
draw-call numbers as measurements while treating its verdict line as ungraded.

### What I changed in the harness

`shoot.mjs` could not address a site at all — `grep -c archetype` was 0 and the
plan groups were `ui | methods | rigs`. It also never recorded
`terrain.siteModel`, so **no shot could tell you whether it photographed the
site model or the procedural fallback** — the same silent fallback that hid six
machines for a week (`ASTRA.md` §4.4). Four changes, all inside my own file:

1. **`--only sites`, a fourth group.** Ten archetypes, enumerated at run time
   from `METHODS[].archetypes` — **not a list in the harness**, because a second
   table drifts and the wrong one is believed (ASTRA §5).
2. **The archetype/method pairing is decided by the runtime, not guessed.**
   `resolveArchetype()` refuses an underground archetype for a method with no
   drive spec and silently derives a surface site instead — 527 of 19,200
   generated contracts do exactly that. So candidates are *tried* in order and
   the first the runtime accepts wins; `extra.methodsTried` records the
   attempts. All ten hit first try.
3. **`verify()` fails a shot that photographed the fallback.** `site model
   "<id>" is in the scene`, `not the procedural fallback`, `archetype was not
   substituted`. A picture of the procedural kit can no longer be filed as a
   picture of the model.
4. **`pageIdentity()` now records `site` on every shot**, so method and rig
   frames say which site they stood on, and the coverage section names any that
   stood on the fallback.

**Hole 3, fixed inside `shoot.mjs`.** An empty content table now pushes a
`coverage` skip, and `assessQaRun()` already converts every skip into
`incomplete` — so a run with zero methods and zero rigs comes out
**INCOMPLETE (exit 2), never PASS**. This uses the grader's existing contract;
`qa-verdict.mjs` is not mine and is untouched. The coverage line also now
prints its counts (`All 21 method ids …, all 19 rigs …, all 10 site
archetypes …`) so a reader can check the claim instead of trusting the
sentence. `tools/checkqa.mjs` still passes.

### Other harness facts worth writing down

* Draw calls are `renderer.info.render.calls` with `autoReset` disabled. **CPU
  submission count, not a GPU query.** No GPU timer query anywhere in the file.
* `surface` **includes** the rig; `rig` is a visibility difference. They are
  not disjoint. Per-band counts exclude shadow passes; frame totals include them.
* The silhouette-confusability detector at `:1637-1653` runs over `rigs` **and**
  `methods`, but it is a 16×16 coarse-**luma** Hamming comparison, not a shape
  analysis, and it is **report-only** — `near` never reaches `assessQaRun` and
  never touches the exit code.
* Shot ids are **positional** (`m${index}-${id}`, sorted by unlock level). Ids
  from different content states are not comparable — `m07-core` in an old report
  is not necessarily the same slot as `m07-core` today.
* `--url` defaults to **`http://localhost:5178/`**, which is the owner's server.
  Anything running under a GPU lease must pass `--url` explicitly.
* Playwright 1.49.1's bundled chromium (`chromium-1148`) is **not installed**;
  the cache holds `chromium-1228`. `shoot.mjs` is unaffected because it launches
  `channel: 'chrome'`, but any new probe must do the same or it will not start.
* HMR reloads are real: a mid-run Vite full-reload destroyed a probe's execution
  context during this session. `page.routeWebSocket(/.*/, () => {})` is not
  optional while other agents are editing.

---

## 6. Every budget breach, with the state that causes it

| budget | breaches | states |
|---|---|---|
| surface ≤ 80 (methods, dev tree 15:17:40Z) | **4** | `m03-top-hammer` 88 · `m06-overburden` 85 · `m14-driven-pile` 82 · `m20-jet-grouting` 82 |
| surface ≤ 80 (sites, probe pairing) | **2** | `tunnel-portal` 92 (88 without the model) · `quarry-bench` 88 (85 without it) |
| surface ≤ 80 (sites, harness pairing) | **3** | `tunnel-portal` 95 · `quarry-bench` 90 · `open-pit-bench` 86 — all three standing `crawler-th` (rig 60) |
| section ≤ 60 | **0** | worst 33 |
| rig ≤ 70 | **0** | worst 60 |
| fps ≥ 60 (fleet) | **3** | `r12-oil-derrick` 34.4 · `m12-oil-rotary` 39.7 · `r17-longhole-rig` 47.4 — all warm |
| fps ≥ 60 (sites) | **2 + 1** | probe: `platform-deck` 47.6 · `well-pad` 48.3 · harness: `platform-deck` 57.1 — all warm, every one standing the `oil-derrick` |
| texture ≤ 90 MB | **0** | worst ≈ 62.7 MB |
| particles ≤ 12000 | **0** | worst 1717 |

Unmeasured: **`r10-cfa-rig` fps is COLD** — one shader program linked inside
the sample window, so the harness correctly refused to grade it. That is the
one hole in fps coverage and it is a re-run, not a finding.

### What I could not verify

* **The cause of the `oil-derrick` frame cost.** Reproduced in four independent
  states across two trees and three runs, sixteen samples, never once at 60.
  It is **not** draw calls (31–50, the lowest in the set) and it is **not** the
  site model (blocked and loaded are indistinguishable). What it *is* — fill,
  shader, shadow or the sahara environment — I did not isolate.
* **Whether `r12-oil-derrick`'s rig = 6 means the portrait is missing its
  machine.** I did not check the frame against the geometry.
* **Whether the four surface breaches in §3 still stand on the current tree.**
  `terrain.js` changed 17 s after that page booted. The site numbers are on the
  older `dist` snapshot. Both need a re-run once the tree is quiet.
* **A true GPU-side draw measurement.** It does not exist in WebGL2. The
  honest upgrade is `EXT_disjoint_timer_query_webgl2` for per-pass GPU *time*,
  which is a different quantity and would answer the `oil-derrick` question
  directly. Not attempted here.

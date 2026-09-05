# ASTRA — handover

**For whoever picks this up next, in any tool, with no access to the
conversation that produced it.** Written 2026-09-05, at the end of a long
multi-agent day, at the moment every agent was stopped so the project could be
handed over cleanly.

Repo: <https://github.com/Torgeer/drillity-the-game> — public, branch `master`.
Local: `C:\Users\henri\Downloads\drillity-the-game`

> **This file supersedes every earlier handover.** `HANDOFF.md` is the previous
> day's longer log; it is still accurate about history and architecture, and
> where the two disagree **this file is newer**. Read `HANDOFF.md` only when you
> need depth this file does not carry.

**Read in this order:** §0 your mandate · §1 the owner's rules · §2 the stack ·
§3 how to run it · §4 Blender (read this even if you think you can't use it) ·
§6 state of the tree · §7 what was stopped mid-flight · §8 what is left.

---

## 0. Your mandate

The owner's instruction, handing this over:

> *"Im also gonna use their latest model so tell him to do ALL the improvements
> on the app/game itself and the design it wants/can."*

So: **you are not limited to the queue in §8.** You have standing authority to
improve the game and its design however you judge best — mechanics, UI, art,
motion, sound, structure, performance. Propose nothing and ask nothing you can
decide yourself. The queue is what was already measured and briefed; it is a
floor, not a ceiling.

Two limits on that authority, both from the owner, both absolute:

1. **Everything you claim must be measured or cited** (§1.1).
2. **The design constraints in §1 are not preferences you may override.**

If you disagree with a design constraint, argue with numbers and change the
gate that enforces it — do not quietly work around it.

---

## 1. The owner's rules — not style preferences

These were each learned expensively. Give them **verbatim** to every agent you
spawn; none of them is obvious.

### 1.1 No guessing

The owner, twice, in his own words:

> *"no guessing! i want you to do your research! we dont wanna look stupid"*
>
> *"because we did research for a reason to have more realistic and 'look a
> like' machines"*

Every dimension traces to a datasheet page cited in a comment beside the
constant. Anything you cannot source is marked **`NOT SOURCED`** in the file.
**A plausible invented number is worse than an admitted gap**, because nobody
will ever check it again.

### 1.2 Maximum realism, invented marques

Model the real machine accurately — google it, find the GA drawing, read the
datasheet — then **badge it with an invented marque**. No real manufacturer
names or model designations reach the player (`DOMAIN.md` §10).

Fleet prefixes are **method-derived**: `TH-320` top hammer, `RC-410`, `LH-60`
longhole, `CP-24` cable percussion. One rig shipped as `PM-78`, and `PM` is a
real maker's live prefix (PM20, PM25H, PMx25) — it reached the player through
the shop card *and* the data-plate decal. Renamed `DP-78`. **The other
seventeen prefixes have never been cleared. That is an open job.**

### 1.3 Premium, and never overlapping

Portrait mobile, one-handed. **The simplest possible HUD.** No overlapping UI
elements, ever. This is gated — see `check:reach` and `.hudqa/measure.mjs`.

### 1.4 Spawn agents aggressively and continuously

> *"Spawna så mycket agenter du bara kan hela tiden, blir något ledigt så
> spawna vi nya"* — spawn as many agents as you can, all the time; when one
> frees up, spawn new ones.

The concurrency cap on the previous tool was raised from 20 to 40. Whatever
harness you are in, run it wide.

### 1.5 Harsh critics until the work is undeniable

The standing quality bar is AAA. The owner's method is adversarial review
agents that attack the work until he is *"utterly wowed."* Use it: the single
best findings of the whole project came from agents told to attack something,
not to build it.

### 1.6 Engineering rules

- **Never set `transmission` above 0** on any material. It re-renders the
  entire opaque list: **+65 to +81 draw calls measured**, and it does not scale
  with object size. One cab window doubled the whole fleet's cost. Found three
  separate times in this codebase.
- **Draw-call budget ≤ 70 per rig.** Detail sharing a material is free in draw
  calls and costs only triangles — that is the lane to spend in.
- **`git add <path>`, never `git add -A`.** Many agents commit concurrently; a
  broad add has already swept another agent's staged work into the wrong commit.
- **When `FACTS_VERIFIED.md` and the code disagree, the CODE changes.** Never
  edit the document to match the code — that defeats the entire guard, and it
  has been done once already.

---

## 2. The stack, exactly

| | |
|---|---|
| Runtime | **Node v22.16.0**, npm 10.9.2, Windows 11 |
| Renderer | **three.js 0.169.0** (the only runtime dependency) |
| Bundler | **Vite ^5.4.10** + **vite-plugin-singlefile ^2.0.3** |
| Test/capture | **Playwright ^1.49.1** driving **system Chrome** |
| Model tooling | **@gltf-transform/cli ^4.5.0** |
| 3D authoring | **Blender 5.2.1**, driven headless — see §4 |
| PDF reading | **PyMuPDF** (installed; poppler is NOT) — see §4.5 |
| Source | 30 JS files, ~94,000 lines under `src/` |
| Gates | 34 `.mjs` tools under `tools/` |
| Research | 53 markdown docs under `research/` |
| Content | **21 methods · 19 rigs · 260 items · 8 regions · 10 site archetypes · MAX_LEVEL 60** |
| Models | **20 `.glb`** in `public/models/` (19 machines + `teststub`), 51 MB |
| Ship artifact | **ONE self-contained `dist/index.html`, 2,867 kB** |

**The single-file property is a genuine asset — the game opens anywhere with no
install.** Everything is inlined except two font hosts and the `.glb` models,
which stream from `models/`. Do not casually break it.

`public/models/*.glb` is **gitignored on purpose**: the models are build output.
The Python scripts are the source of truth. A fresh clone must run
`npm run blender` to get them.

---

## 3. How to run it

```bash
npm install
npm run dev        # http://localhost:5178   — the game
npm run build      # runs every gate, then builds dist/index.html
npm run preview    # serves dist/ on 5179, binds to the LAN for phone testing
```

### The gates — all seven currently pass

```bash
npm run check      # facts + data + beds + career + models + haptics + reach
```

| gate | what it defends |
|---|---|
| `check:facts` | every shipped fact is in the verified list |
| `check:data` | `validateData()` — content integrity |
| `check:beds` | every sampled contract bottoms in ground its method can drill |
| `check:career` | the board poses a real choice; no invariant broken |
| `check:models` | every exported model is named for the rig that asks for it; materials exist in `assets.js`; node contract present |
| `check:haptics` | 6 signature shapes, pairwise distinct, silent under the harness |
| `check:reach` | thumb reach, both hands, headed Chrome |

### Measuring and capturing

```bash
node tools/glbinfo.mjs                                 # every model, one line each
node tools/glbinfo.mjs --parts public/models/<id>.glb  # one machine, per-subtree bounds
node tools/shoot.mjs --headed                          # 51 states: screenshots, draw calls, fps
```

**`--headed` is not optional.** Headless Chrome cannot bind the discrete GPU on
this machine and reports either nothing or garbage.

**fps is meaningless unless graded warm.** Same state, same machine: **26.6 fps
cold, 113.6 warm.** `shoot.mjs` measures over a 40-frame window, warms the
session first, and marks every number warm or cold. It also detects Chrome's
**1 Hz background clamp** — an occluded window once reported 1.0 fps for
everything.

---

## 4. Blender — read this even if you think you cannot use it

### 4.1 You do not need to "connect" anything

The owner's note handing over: *"I might havent connect OpenAI with blender."*

**There is nothing to connect.** Blender is not an integration, a plugin, an
addon, an MCP server or an API. It is an executable that this project runs as a
subprocess:

```
"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --python blender/build.py --
```

**If your harness can run a shell command, you can drive Blender fully.** If it
cannot, you cannot build models — say so plainly rather than pretending, and
work on everything else; the game runs fine from the `.glb` files already on
disk.

### 4.2 Machines are Python scripts, not `.blend` files

This is deliberate and it is what makes the pipeline usable by a language model
at all. A binary `.blend` loses its provenance the moment somebody nudges a
vertex; a script is reviewable, diffable, and **every dimension sits next to its
datasheet citation**. You can read and edit them as plain text.

```
blender/lib/rig.py      the shared library and the four contracts (4 files in lib/)
blender/<machine>.py    one module per machine (24 scripts)
blender/sites/          site environments (1 so far)
blender/build.py        iterates MACHINES, exports glTF 2.0
```

### 4.3 Build one machine, or open it in the GUI to look at it

```bash
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background --python-expr "
import sys, os
R = r'C:\Users\henri\Downloads\drillity-the-game'
sys.path.insert(0, os.path.join(R,'blender')); sys.path.insert(0, os.path.join(R,'blender','lib'))
import piling_leader
piling_leader.build(os.path.join(R,'public','models','piling-leader.glb'))
"
```

**Drop `--background` and the GUI opens with the machine built in front of
you.** The owner asked for this once — *"why dont you have blender open so i can
see in realtime what is worked on?"* — so prefer the visible GUI when he is
watching, headless when he is not.

`blender/preview.py` renders a machine to a PNG so you can actually look at what
you built. **Blender does not inherit the shell's working directory** — renders
once silently wrote to `C:\shots\`. Paths in `preview.py` now resolve against
the repo root.

### 4.4 The four contracts — break one and the game silently falls back

**1. Named nodes survive export.** `src/core/env.js` reads live nodes from
`ctx.rig.getWorkLights()` **every frame** and re-aims spotlights at them — that
is why boom lamps sweep a drive as a machine works. `rigFactory.js` looks nodes
up **by string**:

| prefix | meaning |
|---|---|
| `pivot:<name>` | the game **rotates** it (boom slew, mast rake, sheave) |
| `slide:<name>` | the game **translates** it (carriage, ram, telescope) |
| `mount:<name>` | fixed attachment point; carries `cone_deg` / `range_m` as glTF `extras` |
| `aim:<name>` | the point a mount looks at |

> **The name was never the contract.** `finish()`'s join was silently
> *relocating* `mount:`/`aim:` nodes — a mount at x=6 came back at x=0, dragging
> its aim with it — because `join()` deletes what it eats and children do not
> keep their world transform. The export still contained a node called
> `mount:…`, so "did the name survive?" passed. Fixed by snapshotting and
> restoring world transforms, parents before children.

**2. Materials are names only.** `src/core/assets.js` generates all ~41 texture
kinds procedurally at runtime, with wear and dirt driven by gameplay state. A
baked map would be discarded *and* blow the texture budget (55 MB HIGH against a
~90 MB cap). **The name must exist in `assets.js` KINDS.**

> `rig.py` named its chassis material `paintedDark` from the day it was written.
> `assets.js` had no such kind, so `resolve()` fell through to `rawSteel` and
> **every frame, track guard, walkway and undercarriage on all 17 machines
> rendered as bright bare metal.** The only symptom was one warning line per
> model. Fixed by deriving `paintedDark` from `paintedSteel`. Now gated:
> `checkmodels.mjs` reads material names out of every exported GLB and fails if
> `assets.js` cannot make one.

**3. Statics join by material before export.** glTF emits one draw call per
material per mesh, so 300 separate bolts in one material are 300 draw calls
unjoined and 1 joined. Anything parented under a `pivot:` or `slide:` node is
excluded from the join — it has to move independently.

**4. The exported filename is the RIG ID, not the module name.** `gltfRig.js`
fetches `models/<rigId>.glb`, and rig ids are hyphenated (`cfa-rig`); Python
modules cannot be, so they are `cfa_rig.py`. `build.py` does
`mid.replace('_', '-')`.

> This was broken for a long time, and **six of eight machines had never once
> been on screen** — 31 MB of modelling the game silently replaced with the
> procedural builder every time. Two appeared to work only because somebody had
> hand-copied them under the hyphenated name, which is exactly what stopped
> anybody noticing the other six.

### 4.5 Two traps that each cost hours

**`npm run blender` starts with `call` — do not "tidy" it away.** npm runs
scripts through `cmd.exe /d /s /c`, and `/s` **strips the outer quotes of a
command that starts with a quote**, so a script beginning with a quoted path
dies with `'C:\Program' is not recognized` before Blender ever launches. It did
exactly that, silently exiting 1 without building anything, while every "the
build is fine" reading was actually reading an empty result. `call` in front
means the command no longer starts with a quote.

**`box()` once returned boxes at half the size asked for.** `primitive_cube_add(size=1)`
makes a cube of **edge 1**, and the next line then set `scale = size/2`.
`box((4,2,10))` measured **(2.000, 1.000, 5.000)**. `tube()` was always correct,
which is what made it invisible — correct cylinders beside half-size boxes read
as a machine. Fixed; `reset()` now probes **both** primitives on every build and
**raises rather than compensating**. Eight per-machine workarounds were removed
and the removal proved exact.

**If you write a new machine module, do not add a compensation for anything.**
If a primitive looks wrong, measure it, say so, and fix the library.

### 4.6 Reading datasheets — reach for this before writing `NOT SOURCED`

`crawler-th.md` §8 once concluded that dimensioned drawings could not be read on
this machine because poppler is missing. Poppler *is* missing — but **PyMuPDF is
installed**:

```python
import pymupdf
d = pymupdf.open('catalogue.pdf')
d[9].get_pixmap(matrix=pymupdf.Matrix(3, 3)).save('p10.png')   # then look at it
```

That renders any page of any catalogue in the research library legibly, and it
unblocked three machines that had been written off as unsourceable. **Use it
before you ever write another `NOT SOURCED` entry about a drawing.**

---

## 5. Measurement — one ruler, and why

**`tools/glbinfo.mjs` is the only dimension tool. Do not write a second one.**

A second tool, `glbdims.mjs`, existed for a few hours. It measured a machine by
transforming the **eight corners of each primitive's local AABB** through the
node's world matrix. On axis-aligned geometry that is exact and the two agreed
to the millimetre. On a node carrying a **rotation** whose mesh does not fill
its own local box — every joined static under a raked mast — it is a strict
over-estimate. It was larger on four of nine machines and never smaller.

It produced **four false findings**, three reported as real:

| claim | truth |
|---|---|
| pd55 26.218 m tall | **25.790**, max y exactly **25.700** = the datasheet figure |
| rc-rig "reaches 2.598 m below ground — usually a runaway array" | **−0.014 m.** No bug existed |
| tunnel-jumbo 19 mm over its own WIDTH constant | **2.260** = the constant exactly |
| teststub "95 km × 98 km × 107 km" | **3.242 × 3.588 × 2.890** |

`glbinfo`'s `measure()` transforms **every actual vertex**, and now refuses to
report a number it cannot measure: a primitive with no POSITION used to be
skipped silently, and a skipped primitive makes a machine come out *smaller*,
which is indistinguishable from a machine that is correctly small.

**The most valuable single lesson in this document:** *two tables describing one
thing will drift, and the one that is wrong will be believed.*

### The overall bound of a model is NOT its width

A hose, a rope or a raked mast authored in a working pose legitimately widens
the bounding box. **Always establish which subtree reaches the extreme before
touching a constant**, with `--parts`. Two cases found in the same hour, and
they are indistinguishable in a one-line dimension table:

- **`piling_leader` was genuinely 1.13 m too wide.** "Over 900 mm shoes" is an
  outer-to-outer width; the model used it as centre-to-centre. Three faults
  compounded. Now **4.880 m exactly**.
- **`cfa_rig` measured 6.843 m against a printed 3 000 and was correct.** The
  extra 2.4 m is one object: the concrete delivery line, which leaves the swan
  neck and runs **along the ground** out to where the pump truck stands.

---

## 6. State of the tree, verified at the moment of writing

| check | result |
|---|---|
| `npm run build` | **passes** — `dist/index.html` 2,867 kB |
| all 7 gates (`npm run check`) | **all green** |
| Blender machines | **19 of 19 exported** — all 19 `.glb` on disk, `sonic-truck` included |
| content | 21 methods · 19 rigs · 260 items · 8 regions · 10 archetypes |
| working tree | **6 files modified, uncommitted** — see §7 |

**Nothing is broken. Nothing needs repairing before work resumes.**

One caveat stated precisely, because §10 is about not overclaiming: the table
above is measured — the gates were run, the build was run, the `.glb` files were
counted on disk. A **full `npm run blender` rebuild was still running when this
was written**, so "all 19 still build from source" is the one line here that was
not confirmed end-to-end. `blender/rc_rig.py` was edited by an agent that was
killed mid-pass (§7), so **run `npm run blender` first and expect
`built=19 failed=0`.** If it says anything else, that file is where to look.

---

## 7. What was stopped mid-flight — READ THIS BEFORE YOUR FIRST COMMIT

Eighteen agents were running when the handover was called. They were stopped
deliberately, in waves, and the tree was then verified: **the build and all
seven gates pass.**

All of it is **committed and pushed** — as `4ddbdbf`, deliberately labelled WIP
— rather than left on one machine's disk, so this table describes files you can
actually see. **`git show 4ddbdbf` is your review queue.**

But green gates prove the **data** is sound. They do not prove this code is
finished. **None of the six files below was reviewed by its own author** — each
agent was killed mid-thought. Read the diff before trusting any of it.

| file | task | where it stopped, in the author's own words |
|---|---|---|
| `src/main.js` (+247) | the entrance: title, logo, boot | *"now the boot screen must let the title show through"* |
| `src/ui/screens/boot.js` (+75) | same | same |
| `src/core/renderer.js` (+138) | same | same |
| `blender/rc_rig.py` (+98) | cut rc-rig triangles and draw calls | mid-pass |
| `blender/sites/quarry_bench.py` (+186) | Blender site environments | *"the speckle sits in the outer ~6% of the band width… let me pull my geometry inboard and re-shoot"* |
| `blender/lib/curves.py` (NEW) | Blender owns all motion curves | *"unconstrained fits are overshooting curves I declared must not overshoot"* |
| `.hudqa/unitfix-report.txt` | deleted by an agent | verify the deletion was intended |
| `research/CRITIQUE.md` (NEW) | a critic's report | unread |

`dist/index.html` grew **2,686 → 2,867 kB** across the entrance work. That is
+181 kB you did not choose; decide whether it is worth it.

**Your first move should be to review these six diffs, finish or revert each,
and commit them in separate commits with honest messages.**

---

## 8. The queue — what was in flight, briefed and measured

Sixteen agent briefs were live. Each is real work with a measurement behind it.
**This is a floor, not a ceiling** (§0).

### 8.0 Read `research/CRITIQUE.md` first — 841 lines, 18 measured findings

A second harsh critic was pointed at **the game as it renders**, not at the
Blender files, and its verdict is the most useful single page in the repo:

> *"The research, the domain model and the instrumentation are better than the
> game… this is a serious piece of work and almost none of it is visible. What
> is visible is a machine made of woven fabric standing in front of a floating
> card."*

Every finding carries a number the author took or a capture the author made,
plus a reproduction and the file that owns the fix; anything unmeasured is
marked **SUSPICION** and explicitly is not a finding. Six are severe:

| # | finding |
|---|---|
| 2 | **`pd55` is purchasable, downloaded, parsed — and the renderer refuses it** |
| 3 | **Eight of nineteen machines draw no drill string and no bit**, and two cannot hold a tool at all |
| 8 | **The performance harness prints `VERDICT: FAIL` and exits 0** — 35 of 39 reports on disk say FAIL |
| 15 | **`dist/` ships 35.7 MB of models that can never be requested** |
| 16 | `teststub.glb` ships, `glbinfo` calls it INCOMPLETE, and exits 0 |
| 17 | A shader in the section band has an **uninitialised variable, on every frame** |

And #4 is the pattern rather than the bug: **the fix for #3 was applied per
machine and never gated, so the two newest machines shipped with the identical
defect.** That is this codebase's most expensive habit (§10), found
independently by someone who had not read this file.

Also there: #1 every painted surface reads as woven fabric (an agent was
mid-fix), #9 the drilling HUD is a floating card and the 3D gets 66 % of the
screen against a spec of ~82 %, #10 the only way out of a job is a 30 × 30 px
button in the worst corner **and the reach gate is written to excuse it**,
#11 the contract board — the first real decision in the game — truncates five
strings and offers no decision, #14 the section band's scales are declared but
the labels are not legible.

### 8.1 Blender owns everything the player sees and feels

The owner's ask, verbatim, and the largest thing in flight:

> *"what i mean is that i want blender to fix all motions, buttons everything!
> I want everything in this game go trough blender for absolute best
> feelings/design/motion etc"*

**Motion.** `research/MOTION.md` is the full brief; read it. The measurement:
82 motion declarations in `styles.css`, **90 easing functions — 55 `linear`,
26 `ease-out`, 5 `ease-in-out`, and only 4 authored `cubic-bezier`.** Fifty-five
`linear`s is the absence of animation design; nothing in the physical world
moves linearly. Durations are `1ms 38 110 190 300 440 720ms, 1s 4s 5s 12s 24s
34s` — no scale, numbers picked one at a time.

Motion is decided in **four places that share nothing**: CSS transitions, 15 rAF
chains in `src/ui/`, per-frame node drivers in `rigFactory.js`, and glTF clips.
That is the drift pattern from §5 applied to feel.

The plan: **Blender's graph editor becomes the single curve authority**, curves
named for what they **do** (`press`, `dismiss`, `settle`, `warn` — never
`easeOutQuart`), exported three ways from one source: CSS custom properties,
`src/core/motion.js` for the rAF chains, and glTF clips via `blender/lib/anim.py`.
Where a cubic Bézier cannot represent an F-Curve, **the approximation error is
printed, not hidden.**

**It is done when the 78 defaults are GONE**, not when the library exists — a
curve library nothing consumes would be the ninth declared-contract-with-no-
consumer in this codebase (§9).

The one authored good curve today is `cubic-bezier(.34, 1.56, .64, 1)`. The
`1.56` is **overshoot** — it settles past its mark and comes back. That is the
reference for "physical".

What makes motion feel expensive: **asymmetry** (things leave faster than they
arrive), **overshoot**, **stagger** (20–30 ms per item reads as depth; a group
moving as a block reads flat), and **nothing moves that did not physically
move**. Overriding all of it: this is portrait mobile, one-handed, and **glanced
at rather than watched** — a 400 ms transition that is beautiful on desktop is
one the player is fighting.

**UI art.** Button faces, icons, badges, panel surfaces and meters rendered in
Blender with **one consistent key-light direction**, as a single atlas. Two
light directions in one HUD is the tell that separates AAA from asset-flip.

**The caveat, and it is load-bearing: the buttons stay DOM `<button>` elements.**
`check:reach` gates thumb reach and `.hudqa/measure.mjs` gates the 44 px touch
floor and overlap — **both read the DOM** — and a `<button>` is reachable by
screen reader and keyboard while a mesh is not. **The middle path gets the whole
win:** the button's *face* is a Blender render, its *motion* is a Blender curve,
and it stays a real `<button>`. Going fully 3D for the drilling controls
specifically — controls that are physically part of the machine — is a genuinely
strong idea for this game, but it is a deliberate trade against every gate
above.

`prefers-reduced-motion` is a **gate, not a nicety**: a vestibular-sensitive
player must get a usable game, not a broken one.

### 8.2 The entrance, the title and the logo

Half-landed (§7). The premise: the game's first ten seconds decide whether it
reads as premium. `blender/title.py` was briefed and barely started.

Know this before touching boot: **the boot screen is a 27.8 s WebGL shader
compile, not a splash.** Anything that "waits for boot" with a fixed timer is
measuring the compile.

### 8.3 Site environments in Blender

`blender/sites/quarry_bench.py` is the first one and is mid-work. Ten site
archetypes exist in `src/world/terrain.js`; the areas the player works in should
get the same treatment the machines got.

### 8.4 Draw calls and triangles

Six machines breach the ≤70 budget. Briefs existed for bolter + core-rig,
crawler-th + dth-crawler, sonic-truck + cable-percussion, tunnel-jumbo, and
rc-rig. `m07-core` measures **82 against 80** on the surface band — only visible
once the harness started grading **warm**.

The rc-rig precedent shows the shape of the win: **171,908 → 84,260 triangles,
11.73 → 5.43 MB, bounds and draw calls unchanged** — it was all bevel hiding
inside arrays (480 track shoes and 332 chain links at 108 triangles each where
12 would do).

### 8.5 Economy, progression and drilling rates

Six research agents were gathering real figures: penetration rates by method
(mining, water well, geothermal, sonic, piling, anchor, tunnelling, HDD, oil &
gas day rates) and rig capital / fuel / upkeep costs. The goal is that a working
contractor could check the game's numbers and find them right.

### 8.6 Four cross-file gaps in the rig loader

All four verified live, none fixed:

1. **`prep.size` / `prep.radius` have no node exclusion.** They feed three
   consumers — `dyn.mastHeight` (gltfRig.js:633), `mastM` (673) and
   `frameRadius` (674) — so scenery inflates the mast height that carriage flex
   is multiplied by. rc-rig inherits ~2.4 m of ground props. Fix it **by a rule,
   not a per-machine list**.
2. **`travel_min_m` / `travel_max_m` were added to all 19 machines and nothing
   in `src/` or `tools/` reads either field.** That is the ninth
   declared-contract-with-no-consumer (§9), added to enable a fix that was
   already done. Either give them a real consumer or **delete them**, and add a
   `checkmodels` gate that fails when a node publishes a `userData` field no
   source file reads.
3. **`cfa-rig depthCapacity: 32` against roughly 18 m of modelled auger.**
   Research the real machine and fix whichever side is wrong. Do not split the
   difference.
4. **`gel-clock` reaches a player today with no haptic signature.**
   `drilling.js:4406` forwards `h.kind`, but `gel-clock` has no `EVENT_SHAPE`
   entry, so it falls to a generic `'ui'` buzz. The other eleven unmapped kinds
   are genuinely not forwarded yet; `check:haptics` now prints that split.

### 8.7 The depth ruler in the section band

`src/world/geology.js`. A fixed ticked scale down the band's edge with the bit
as a **moving cursor**, so depth and rate are read off something already on
screen — and then the numeric HUD readout is deleted. **Do not delete the
readout before the ruler lands.**

Its prerequisite is **done**: the two bands used to draw the borehole 62.44 px
apart (16 % of stage width), contradicting `GAMEDESIGN.md` §1 in writing. Now
solved every frame from the projection itself and measures **0.00**.

Two things still block it, both measured
(`node .qa-collar.mjs --depthfrac 0.001`):

- **`sectionGroundAtSeamPx = −24.54 px at spud`** — the cut's depth 0 is off the
  *top* of its own band; its first visible row is already 1.26 m deep.
- **`viewMetres` claims 19.988 against an actual frustum of 14.261** — geology's
  `halfH` is 10 m against a true 7.13, because `adoptCameraScale()` rejects on
  the shipping layout (aspect 1.408 vs 1.005, 39 % against a 35 % tolerance) and
  **returns silently**.

**Declare the bore exaggeration on the ruler.** `applyHoleDiameter()` draws
152 mm at ≈ **1.086 m — 7.1×**. The exaggeration is necessary (a true-scale
152 mm bore in a 20 m band is ~1.3 px) but **undeclared**, and a working driller
will spot it in ten seconds and then trust nothing else on screen. A `×7 Ø` tag,
or a true-scale hairline inside the exaggerated bore, turns a lie into a diagram.

**Open and quantified:** the scale changes **2.81× across the seam** — 54.58
px/m above against 19.42 below, so a rod crossing it changes size by nearly
three. Matching at the collar needs the hero eye at 38.4 m instead of 13.69 m,
which drops a 4.2 m mast from 70 % of the band to 25 %. Moving the other side is
worse: geology authors its gutter and ruler in section units and clamps to a
ceiling of 32.35 px/m, so 54.58 is unreachable from that side at all.

### 8.8 Look-ahead uncertainty — shipped, but below perception

`lookUnc()` is a saturating exponential in metres-ahead; `oreConfidence` sets
both the asymptote and the decay length. It modulates colour, contact sharpness,
pattern, sparkle, boundary wander, joints and boulders, with **no new mesh,
material or draw call**.

Two things remain, and they are the ones that matter:

1. **`geology.setSurveyConfidence()` has no caller anywhere in the repo.** The
   economy hook — the part that makes confidence something a player *buys* — is
   the gameplay.
2. **The amplitude is below perception.** Measured, same contract same frame,
   confidence 0.55 → 1.00: **whole-band mean difference 6.74 / 255, only 5.4 %
   of pixels differing by more than 24.** For scale, two pictures a reviewer
   judged *identical* differ by **12.66, twice as much**. An ×6 amplified diff
   shows the mechanism working correctly. At 1× no player will see it. The knobs
   are `CFG.surveyWander` (1.8) and `controlNear`/`controlFar` (1.4 / 18.0).

Still open nearby: `applySurvey()`'s vertical branch re-softens ground a tripped
string already drilled, and the heading mode's log has **no ahead axis at all**,
so it claims perfect knowledge of ground above the crown.

### 8.9 The shop card shows too little of the tool

`preview.js` now honours `userData.preview.aim`, and the carbide the player is
buying went **3.8 % → 17.9 %** of the card on a T45 bit, 1.7 % → 8.6 % on a DTH
bit. **Still open:** the tool covers only 8–10 % of the card because framing
uses the bounding **sphere**, far larger than a long thin tool's on-screen
extent. The `* 1.9` padding exists to stop a rig's mast being cropped, so
changing it needs the coverage harness across the whole catalogue.

---

## 9. Decisions waiting on the owner — not yours to make alone

**Tooling in Blender.** The owner asked for the whole game in Blender. An agent
was briefed to convert the tooling on the premise that *wear is a material, not
geometry* — true for machines — and it **measured that premise false for
tools**:

| T45 89 mm bit | wear 0 | wear 0.5 | wear 1 |
|---|---|---|---|
| carbide Ø | 89.89 | 88.76 | 87.64 |
| carbide over body | **+1.69 mm** | +0.56 | **−0.56 mm** |
| buttons present | 13 | 13 | **6** |

That is Rockmore's four wear stages, Halco's +0.80 mm build tolerance and Boart
Longyear's scrap rule (finished when gauge ≤ body) rendered as **mesh**: buttons
flatten, the face scours away leaving survivors on pedestals, then they fall out
and leave sockets. **Ship a Blender bit with material-only wear and all of that
is deleted.** `tools.js` already *is* the parametric family library — 270 ids =
92 builder functions + 178 aliases, zero overlap. Three options: port the wear
logic to Python and ship 92 × 3 = 276 GLBs; a hybrid (Blender body, procedural
carbide); or leave tools procedural because that version is **more** realistic.
**The recommendation on file is the hybrid.**

**What `cable-percussion` IS.** The data describes an American truck spudder
(9.4 t, 82 kW, `depthCapacity: 250`, walking beam, three lines off one winch).
The model and its reference describe a British shell-and-auger tripod (measured
2.37 × 6.68 × 5.37 m, sourced **13 kW and 1,700–2,250 kg**). The machine on
screen is a quarter the mass its own shop card claims. `depthWindow()` is now
fleet-capped, so matching the data to the model would shrink every `cable-tool`
contract in the game. **Somebody has to pick.**

**Whether the drilling controls go fully 3D** (§8.1).

---

## 10. Failure patterns that cost the most time

Recognising these is worth more than any single fix.

**A silent fallback that works is the most expensive kind of failure** — it
removes the symptom and keeps the cause. Found **five separate times**:
`resolveMethodId`, three dead vfx fallbacks, a UI fallback, the model filename
mismatch, and the material substitution. In every case the code was doing
something reasonable and the only evidence was a log line nobody read.

**A declared contract with no consumer.** Eight instances found and fixed; a
ninth (§8.6.2) is open. Something publishes a field, a node, a hook or a
callback that reads correct and complete, and **nothing anywhere consumes it**.
`builder()` had zero call sites. `setSurveyConfidence()` still has none.
`preview.aim` was computed for months with a comment admitting it was inert.

**A gate over an empty set passes forever.** `checkreach` reported **zero
targets and called it a PASS**, for three reasons at once:
`document.querySelector('.screen')` returns the retained **hidden boot screen**
at 0×0; the boot screen is a **27.8 s shader compile**, not a splash, so a fixed
wait measures it; and the site screen keeps `is-entering` **indefinitely**,
during which the dock measures 682 px against its settled 227 px.
**Make "measured nothing" a failure everywhere.**

**A hardcoded claim inside a gate is the same bug wearing a lab coat.**
`check:haptics` *printed* "drilling.js does not forward h.kind" as prose, and
kept printing it after drilling.js grew a `kind` parameter and eleven sites that
pass it. It is now measured, and the measurement immediately surfaced a live gap
the prose was hiding (§8.6.4).

**An approximation in an instrument becomes a false finding in a report.** See §5.

**Verify by measurement, not by the absence of an error.** The Blender pipeline
had *correct log lines at every step* while nothing reached the screen.

**Do not take a sub-agent's report at face value.** An agent reported
`carriageRange` running backwards for every machine; the fix was already live at
`gltfRig.js:632` and "fixing" it would have reintroduced the bug. Agents read
stale snapshots. **Check the file yourself before acting on a claim about it.**

---

## 11. Architecture

```
src/main.js            boot order; awaits models BEFORE rigFactory inits
src/core/renderer.js   two scissored bands in ONE context, shared post chain
                       surface 54% / section 46%; registerBands() solves collar
src/core/env.js        every light in the game; reads getWorkLights() per frame
src/core/assets.js     ~41 procedural texture kinds, wear driven by gameplay
src/core/gltfRig.js    fetch/parse/material-swap a .glb -> a RIG_BUILDERS-shaped
                       builder. ?glb=strict refuses to draw; ?glb=off forces
                       procedural (use it to compare the two)
src/core/contract.js   BRAND palette, makeRandom, shared contracts
src/world/geology.js   THE SECTION IS A SHADER (~7k lines). Five section modes:
                       vertical | profile | raise | heading | pile
src/world/terrain.js   10 site archetypes; builds the scene from contract.archetype
src/rig/rigFactory.js  procedural machines; ensureBuild() prefers a .glb
src/rig/tools.js       270 tool ids x 3 wear levels = 825 variants, procedural
src/sim/drilling.js    the drilling model per method
src/game/data.js       ~6.8k lines: methods, rigs, items, regions, contracts.
                       THE CONTENT AUTHORITY. validateData() lives here
src/audio/audio.js     every voice; ?mute / ?shot silence it (busUser.master = 0)
blender/lib/rig.py     the shared library and the four contracts
```

**`geology.js` has form for taking down the whole GPU process:** a single `&&`
in `FACE_FRAG` once sent D3DCompile into unbounded recursion —
`STATUS_STACK_OVERFLOW`, 0 draw calls, and 48 misleading `VALIDATE_STATUS false`
errors on innocent shaders. **Change the face shader in small steps and capture
after each one.**

---

## 12. How to work on this

**Fan out aggressively, one file per agent** (§1.4).

**Ownership is per file and must be stated in the brief.** Two agents in one
file will clobber each other. Tell each agent what it owns, what is held by
others, and to **report cross-file needs rather than editing**. That discipline
produced the best findings of the whole project — agents repeatedly found real
bugs in files they were forbidden to touch and handed them over precisely.

**Give every agent §1 verbatim.** None of it is obvious and each rule was
learned expensively.

**Tell agents to measure, not to reason.** Every one of the largest findings
came from someone measuring a thing they expected to be fine.

**Tell agents that "I could not verify this" is a valid, valued answer.** One
agent was given a false premise by its own briefer, measured it false, and
stopped rather than build on it. That was correct behaviour and it is what you
want.

`research/rigs/_model-critique.md` (628 lines) is the harsh critic's verdict on
the first nine machines, and `research/rigs/sonic-truck-review.md` is the same
treatment applied to the newest. **Read the relevant one before touching any
machine.**

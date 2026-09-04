# AAA visual review rubric — DRILLITY I THE GAME

You are reviewing screenshots of a portrait mobile 3D game against the standard
of a **flagship App Store game** (think: the visual bar of Alto's Odyssey,
Monument Valley, Gris, Infinity Blade, Genshin on mobile). Not "good for a web
game". Not "impressive for procedural". The actual bar.

Grade each axis 0–10. **Anything below 8 is a FAIL and must be fixed.**
Assume the default is failure and make the screenshot prove otherwise.

## Axes

**1. First-frame impact (0–10)**
Would a stranger scrolling the App Store stop on this screenshot? Is there a
clear focal point, a confident composition, and one idea the image is about?
Flat, evenly-lit, centred, "everything visible" images score ≤ 4.

**2. Lighting & value structure (0–10)**
Is there a real key/fill/rim relationship? Do shadows have direction and
softness appropriate to the light source? Is there a full value range — true
blacks, held highlights, no muddy midtone soup? Is there atmospheric depth
(aerial perspective, fog gradient) separating foreground from background?
Banding, blown highlights, crushed shadows, or a single flat ambient = fail.

**3. Material believability (0–10)**
Does painted steel read as painted steel? Does carbide read as carbide? Are
roughness values varied and story-driven (worn edges smoother, dirt rougher)?
Any surface that reads as untextured flat colour, plastic-looking metal, or
obviously tiling texture = fail.

**4. Silhouette & form (0–10)**
Do the machines read instantly at thumbnail size? Are proportions credible for
heavy equipment? Are there primitives left visible as primitives (a bare box, a
bare cylinder, a sphere standing in for a real part)? Any such = automatic fail.

**5. Detail density & hierarchy (0–10)**
Is there detail at three scales — large forms, medium features, fine texture?
Is detail *organised* (busy where it matters, calm elsewhere) or uniform noise?
Empty, under-populated frames = fail.

**6. Colour & grade (0–10)**
Does it hold the Drillity palette (deep slate, electric amber, steel blue)
without looking like a colour-swatch demo? Is the grade cohesive? Are there
accidental colours nobody chose?

**7. UI craft (0–10)** *(UI shots only)*
Typography: is the hierarchy deliberate, are sizes on a scale, is tracking
right, is anything cramped or orphaned? Spacing: consistent rhythm, correct
optical alignment? Are hit targets ≥ 44 px? Does the glass/elevation language
hold together? Does the HUD stay out of the 3D's way while remaining legible in
sunlight? Any default-browser look, any misaligned element, any inconsistent
corner radius = fail.

**7a. HUD restraint — HARD GATE, and it is measured, not judged**

The project owner's instruction, verbatim: **"PREMIUM !! no overlapping and the
most simply UI we can have"**, after finding that *"you actually don't see what
you do."*

Three of these are pass/fail. Do not score them — check them:

- **Zero elements overlay the 3D.** No floating cards, no scrims, no
  semi-transparent panels over either band. Every element gets reserved space in
  a stacked layout. **One overlapping element fails the shot outright**,
  whatever else is good about it.
- **The 3D owns its specified share of the stage** — 54 % surface, 46 % section
  per `GAMEDESIGN.md` §1. Measure it. A baseline capture had the uncovered 3D at
  **26 % of the screen**; anything near that is a fail.
- **Nothing on screen that the player does not act on within three seconds.**
  Outcomes — anchorage, bit life, a resin percentage, a drill-log entry — belong
  in the post-unit log card or the results screen, not the HUD. State any value
  **once**: a baseline screen showed the resin mix three times at once, as a
  slider, a gauge bar and a text card.

Then score the craft: **premium is restraint.** One accent doing one job, two or
three type sizes with clear intent, no boxes inside boxes, one spacing scale and
one corner radius throughout. Generous negative space reads as expensive;
density reads as cheap. Tutorial text that is still present on the fortieth
repetition is clutter, not teaching.

**8. Composition & framing (0–10)** *(3D shots)*
Rule-of-thirds or a deliberate alternative, leading lines, negative space used
on purpose, horizon placement, nothing important tangent to a frame edge or
awkwardly cropped.

**9. Motion evidence (0–10)**
Do the frames show a world in motion — particles mid-flight, a dust plume with
shape, a blur or an arc that implies velocity? A frozen, sterile scene = fail.

**10. Cohesion (0–10)**
Do the 3D and the UI look like they came from the same studio? Same palette,
same level of finish, same physical logic?

**11. Domain truth (0–10) — WEIGHTED DOUBLE**
Would a working driller looking at this frame believe it?

This is the axis the project is judged on hardest, and it is the one most
likely to be quietly passed by a reviewer grading on prettiness. The game is
built on a real equipment taxonomy and a real career model, and **real drillers
will play it**. Score against these, not against vibes:

- Is the **right machine** doing the **right job**? A drifter is not a rotary
  head. A sonic rig does not turn a wireline diamond string. Cable percussion
  is a winch, a rope, a chisel and a bailer — no drill string, no circulation.
- Is the **tooling** right for the method, and does the connection make sense?
  Percussion R/T/H threads never mate with wireline AQ–PQ or API REG.
- Does the **site** look like that industry's site? A foundation job in a city
  is not a Nordic forest with a different rig parked in it.
- Is anything **stated** in the frame true? Labels, gauges, units, contract
  copy. `PLATFORM_TRUTH.md` Part C binds every user-visible claim, and rule 7
  binds unsourced numbers specifically.
- **Wrong beats ugly.** A beautiful frame showing an impossible machine scores
  0 on this axis, and that alone fails the shot.

## Underground scenes — `tunnel-jumbo`, `longhole`, `rockbolt`

Three methods happen in a **drive**, and several axes above assume a sky.
Regrade them like this:

- **Axis 2 (Lighting)** — there is no key, no fill, no golden hour and no
  aerial perspective. Judge instead: does light **fall off hard**, so the far
  end of the drive goes genuinely black? Is the only bounce coming off the
  rock, and does it carry the rock's colour (shotcrete bounces, raw gneiss
  barely does)? Is the colour temperature **mixed** — cold LED work lights
  against warm sodium festoon against the machine's own amber? An evenly-lit
  drive is a corridor in a video game and scores ≤ 3.
- **Airborne dust is the medium, not an effect.** Visible beams from the work
  lights are *the* characteristic image of underground drilling. A drive
  without volumetric shafts fails axis 2 regardless of anything else.
- **Water.** Dripping from the back, running in the invert, sheeting down the
  walls. It is what makes rock read as rock and not grey plastic.
- **Axis 3 (Materials)** — the contrast that carries the image is **wet glossy
  shotcrete against matte faceted blasted rock**. Half-barrels on a
  well-drilled wall are the signature of the round that made it.
- **Axis 1 (Composition)** — a drive is a tube. The composition problem is
  depth and the eye travelling *into* it, not a horizon.

## What each new method must show

A shot that could be any method fails axis 11 on its own:

| method | what must be visible |
|---|---|
| `rc` | the **sample train** — cyclone, splitter, bags. The chip stream falling out of the cyclone underflow |
| `tunnel-jumbo` | two booms on a face, **water spray blowing back**, the cable reel |
| `longhole` | the fan, and for upholes **the flush coming straight back down onto the machine** |
| `rockbolt` | a boom pointing **up**, mesh, resin extruding at the collar |
| `driven-pile` | a leader, not a boom. Hammer, helmet, and the debris burst at the pile head |
| `site-investigation` | small, quiet, understated. **CPT throws nothing at all** — decoration here is a failure, not a save |

## How to report

Return, for each screenshot:
- the file name
- a score per applicable axis
- the **three most damaging specific problems**, each phrased as a concrete,
  actionable engineering instruction naming the file and the parameter to
  change (e.g. "shots/06: the granite stratum tiles visibly every ~90 px —
  in src/core/assets.js increase the domain-warp amplitude in the crystalline
  pattern and add a second octave at a non-integer frequency ratio")
- a verdict line: `VERDICT: PASS` only if **every** applicable axis is ≥ 8,
  otherwise `VERDICT: FAIL`

**Axis 7a is a hard gate on every UI shot**, alongside axis 11. An overlapping
element or a 3D share below spec fails the shot regardless of every other score.

**Axis 11 is weighted double and is a hard gate**: a shot scoring below 8 on
domain truth fails outright, whatever the other ten say. A frame that is
beautiful and wrong is worse than one that is plain and right — the plain one
can be made beautiful, and the wrong one has to be thrown away.

Do not be kind. Do not praise. Do not grade on a curve or note effort. If it is
not shippable on the App Store front page, it fails. A reviewer who passes
mediocre work has failed at their job.

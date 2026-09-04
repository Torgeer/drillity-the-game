# DRILLITY I THE GAME — design spec

**One line:** You are a driller. Start with a beaten crawler and an auger flight
in the Nordic forest; finish running raise-bore and HDD crews across the world.

**Platform:** portrait mobile web (touch-first), 60 fps target on a mid iPhone.
Must also look correct on desktop (letterboxed portrait stage).

---

## 1. The screen

Portrait, split into two live 3D bands sharing one WebGL context:

```
┌─────────────────────────────┐  0%
│  status bar: € · lvl · XP   │
│                             │
│   SURFACE VIEW (54%)        │   the rig, mast, rod handler, crew,
│   cinematic 3/4 camera      │   dust/spray, biome, sky, golden hour
│                             │
├─────────────────────────────┤  54%
│                             │
│   CROSS-SECTION (46%)       │   the work. bit chewing, cuttings rising,
│   orthographic side cut     │   casing following, water inflow. WHAT the
│                             │   band means follows the method — see §7
├─────────────────────────────┤  ~82%
│  GAUGES + 3 control sliders │
└─────────────────────────────┘ 100%
```

The two bands are one continuous world fiction: the borehole in the section
lines up horizontally with the mast above it.

The section band is **not always a vertical hole.** `world/geology.js` carries
five section modes — `vertical`, `profile`, `raise`, `heading`, `pile` — and
the method picks one (`METHODS[].sectionMode`). **Sixteen** of the twenty-one
are `vertical` and scroll down as you go deeper, which is the case drawn above.
The other **five** scroll sideways, run backwards, or draw a concrete column
instead of a void. §7 has the table. The invariant that keeps all five modes
cheap is that **one section unit is always one metre of true vertical depth on
Y**, in every mode.

*(`geology.js`'s own header comment still says the vertical assumption is
"right for fourteen of the game's methods and wrong for four" — 18, the count
before the last six methods landed. The counts above are from `METHODS`.)*

## 2. Core loop

1. **Contract board** — pick a job (region, application, target depth, ground
   profile, payout, deadline, required method/certs).
2. **Mobilise** — rig drives in, mast raises, first rod loaded. (Short, gorgeous,
   skippable-after-first-time cinematic.)
3. **Drill** — the actual game. See §3.
4. **Complete** — payout, XP, bit wear settled, grade (D→S) on speed,
   straightness, tool care and safety.
5. **Spend** — iMarket shop (tools/rigs), Talent (certs & skills), garage
   (loadout).
6. **Level up** → new methods, regions, contracts.

## 3. The drilling minigame — "the groove"

Three touch controls (thumb-reachable, bottom of screen):

| Control | Real meaning | Effect |
|---|---|---|
| **Feed** (WOB) | weight on bit | ↑ROP, ↑torque, ↑wear, ↑jam risk |
| **Rotation / Percussion** | RPM or hammer blow rate | ↑ROP, ↑heat, ↑wear |
| **Flushing** | air / water / mud flow | clears cuttings → ↓jam, ↓heat, ↑hole erosion in soft ground |

Each stratum has a **sweet spot** (a moving green band on the torque gauge).
Hold the needle inside it → *the groove*: ROP multiplier ramps 1.0 → 2.2, a
combo counter builds, the audio locks into rhythm and the amber lighting
intensifies. Leave it → combo decays.

**Live hazards** (from real drilling, each with a distinct read + response):
- **Boulder strike** — torque spikes; back off feed, raise percussion.
- **Cavity / karst void** — bit free-falls, flushing return lost; cut feed fast.
- **Water strike** — inflow, hole erodes; raise flushing or set casing.
- **Fracture zone / collapsing hole** — stability drops; switch to overburden
  casing or lose the hole.
- **Bit worn out** — ROP collapses; trip out, change crown, trip back in
  (a real time cost — this is why buying better carbide matters).
- **Rod jam / stuck string** — a short tap-rhythm rescue: work the string free.
- **Rod add** — every N metres the mast cycles a new rod in. Nail the timing
  window for a bonus.

**Skill expression:** anticipating the next stratum from the drill log, pre-
adjusting before the transition, and knowing when to spend money on a fresh
bit instead of pushing a dull one.

### 3a. When the hole is not the point

Everything above describes **drilling a hole and being paid for its metres.**
That is fourteen of the game's twenty-one methods. It is not all of them, and
the seven exceptions are not edge cases — they are whole industries.

`METHODS[].scoredOn` is the field that says so, and it is the single most
important line in a method's definition:

| Method | `scoredOn` — what the player is actually judged on |
|---|---|
| `rc` | **sample recovery and contamination.** You can drill a perfect hole and deliver a worthless assay |
| `tunnel-jumbo` | **pull per round and overbreak.** The metres you drilled and the metres the round *pulled* are two different numbers, and pull is never 100 % |
| `longhole` | **toe accuracy** — deviation becomes dilution. Nobody ever sees the bottom of the hole; you find out in the mill, three weeks later |
| `rockbolt` | **install quality** — anchorage and torque test. They pull-test a sample of your bolts |
| `driven-pile` | **set and blow count to bearing, without damaging the pile** |
| `site-investigation` | **sample quality and log fidelity.** Nobody is paying for the hole, they are paying for the log |
| `core` | **`'metres drilled'` — and that is a live contradiction.** The method's own description says "you are not paid for metres, you are paid for the core that comes up whole and in order", and core recovery is modelled nowhere. Only `rc` got a recovery-based score. See `DESIGN_EXPANSION.md` §2 and §6 |

`sim/drilling.js` calls these **method programmes**, and the shape they share is
that a run is a **sequence of units** — a sample bag, a blast round, a hole in a
fan, a bolt, a pile, a test — and the score is the *quality of the units*, never
the sum of the metres. Keeping that honest takes three separate depths, and
conflating any two of them is the bug this design is most likely to grow:

- **`S.depth`** — the number the contract is measured in and the number the
  section band scrolls with. Chainage on a heading, ring metres on a fan, head
  penetration on a pile.
- **`S.holeDepth`** — metres into the unit being worked *right now*.
- **`S.stringDepth`** — how much string is actually in the ground: what loads
  the rods, damps the blow and lengthens the annulus.

On a method that drills one hole all three are the same number and none of this
machinery runs.

**Two methods drill nothing at all.** `driven-pile` has no rotation, no flush
and no drill string — a ram falls on a helmet and the pile goes down.
`site-investigation` with a piezocone fitted is not a boring rig either: the
cone is *pushed* at a constant rate, nothing turns and nothing circulates.
(`resolveMethod()` swaps the method wholesale when the `probe` bay holds a
piezocone, which is the right shape — it is a different machine, not a
modifier.)

### 3b. The hazards are method-native, not a shared list

The generic seven above (boulder, cavity, water, collapse, bit, rod, jam) are
the *vertical borehole* hazard set. Each new method brought its own, and the
point of every one is that **it has no drilling answer**:

- **`rc`** — `wet-sample`, `carry-over`, `cyclone-choke`. Not one of these is a
  hole problem. All three are assay problems, which is the entire character of
  the method.
- **`tunnel-jumbo`** — `collar-slip`, `cut-choke`, `bad-ground`. A pattern game:
  every one is decided *before* the round is fired, and the answer is never
  "drill faster".
- **`longhole`** — `hole-blocked`, `uphole-flush`, `rod-whip`. Two of these have
  **opposite** flushing answers, and which is correct depends on whether you are
  drilling an uphole or a downhole.
- **`rockbolt`** — `gel-clock`, `bolt-hole-collapse`, `loose-plate`. The bolt
  that looks installed and holds nothing.
- **`driven-pile`** — `obstruction`, `head-damage`, `premature-refusal`. No
  rotation, no flush, and a set gauge that can lie.
- **`site-investigation`** — `rod-bounce`, `fall-in`, `precarious`,
  `thrust-limit`, `cone-desaturation`. SPT is driven and CPT is pushed; neither
  is drilling, so neither has a drilling answer.
- **`oil-rotary`** — `kick`, `lost-zone`, `diff-stick`, `twist-off`.
- **Two-pass methods** (`hdd`, `raise-boring`) — `pull-stall`: the reamer
  stalling on the way up, or the product pipe about to stick on the way home.

## 4. Progression

- **Level 1–60.** XP from metres, grades, first-times, hazards handled.
- Each level: skill point + occasional **method unlock**.
- **Methods** unlock in this order. These are `METHODS[].unlockLevel` in
  `src/game/data.js`, which is the only authority — if this table and the code
  disagree, the code is right and this table is stale.

| L | Method | L | Method |
|---|---|---|---|
| 1 | `auger` Auger Drilling | 30 | `oil-rotary` Rotary / Oil & Gas |
| 3 | `cable-tool` Cable-Tool / Drop Hammer | 31 | `anchor` Anchor / Micropile |
| 6 | `top-hammer` Top Hammer | 33 | `driven-pile` Driven Piling |
| 8 | `site-investigation` Site Investigation | 34 | `cased-cfa` Cased CFA |
| 10 | `dth` DTH | 36 | `tunnel-jumbo` Drill & Blast (Face) |
| 14 | `overburden` Overburden / Duplex | 38 | `hdd` HDD |
| 18 | `core` Core / Wireline | 39 | `longhole` Longhole Production |
| 21 | `rc` Reverse Circulation | 42 | `sonic` Sonic Drilling |
| 23 | `rotary-kelly` Rotary / Kelly | 47 | `jet-grouting` Jet Grouting |
| 27 | `cfa` CFA Piling | 52 | `raise-boring` Raise Boring |
| 29 | `rockbolt` Ground Support | | |

  Three features of the ladder's shape, stated as observations — **the code
  records no rationale for the chosen levels**, so do not read intent into them:
  - `site-investigation` is at **8**, the earliest of the six new methods and
    the first non-metres method the player meets. Everything later that is
    scored on quality rather than depth builds on that lesson.
  - `rc` (21) sits three levels after `core` (18), so the two halves of
    exploration arrive close together.
  - The underground methods are **spread, not clustered** — `rockbolt` 29,
    `tunnel-jumbo` 36, `longhole` 39 — although all three share the
    `heading`/fan vocabulary.
- **Skill tree** mirrors Drillity Talent: three branches —
  *Operator* (feed/rotation control, groove width, rod-add speed),
  *Toolsmith* (bit life, cheaper consumables, field regrind),
  *Site Lead* (payouts, crew, contract slots, cert discounts).
- **Certifications** gate premium contracts (offshore needs BOSIET+HUET, etc.).
- **Regions** unlock with level & reputation: Nordic forest → German
  construction site → Alpine tunnel → Iberian quarry → North Sea platform →
  Sahara water well → Chilean copper mine → Arctic permafrost.

## 5. Economy

Everything you buy is a real Drillity iMarket category. Prices are in EUR and
sit in a realistic order of magnitude (a button bit is hundreds; a rig is
hundreds of thousands). Consumables wear out — this is the money sink that
makes the progression breathe.

## 6. Quality bar (non-negotiable)

- Physically-based materials everywhere. No flat-shaded placeholder look.
- Real-time shadows, correct exposure, ACES tone mapping, subtle bloom, SSAO,
  fog with depth. Golden-hour key + cool sky fill.
- Every particle system art-directed: dust plumes drift and dissipate, water
  spray catches the sun, cuttings tumble, sparks have afterglow.
- UI is Drillity "Liquid Industrial": deep slate glass panels, amber accents,
  Inter/Oswald, generous radii, spring-eased motion, haptics on every beat.
- Nothing static: idle animations, engine shake, heat shimmer, birds, dust
  motes, mast flex under load.
- Portrait-native. Safe areas respected. One-thumb playable.

---

## 7. THE CONTROL MODEL — Advance / Work / Protect

The three sliders were authored for rotary and percussive drilling: Feed,
Rotation, Flush. That does not survive contact with the other industries —
**driven piling has no rotation and no flush at all**, a CPT is a steady push
with no rotation, and a TBM has no drill string.

Restating the three controls **semantically** makes one scheme serve every
method (sourced from the foundation research pack, `research/05-foundation-piling.md` §E):

| | **ADVANCE** | **WORK** | **PROTECT** |
|---|---|---|---|
| what it is | how hard you push into the ground | the energy you put into breaking it | what keeps the hole, the tool and the crew intact |
| rotary / auger | weight on bit | rotation | flushing |
| top hammer / DTH | feed | percussion rate | air |
| **driven piling** | **hammer energy** | **blow rate** | **alignment / rake** |
| CFA | penetration rate | rotation | **concrete pressure** |
| core / wireline | WOB (low) | RPM (high) | water — the most critical of the three |
| HDD pilot | thrust | rotate vs **slide** | mud flow |
| HDD pullback | pull force | — | mud flow |
| jet grouting | withdrawal rate | jet pressure | rotation speed |
| oil rotary | weight on bit | rotary speed | mud flow |
| sonic | feed | oscillator frequency | water |
| **RC** | feed | percussion / rotation | air — **and sample integrity** |
| **tunnel jumbo** | feed | percussion | flushing — **and hole accuracy** |
| **longhole** | feed | percussion | flushing — **and deviation** |
| **ground support** | thrust | rotation | **resin / grout mix + hold time** |
| **site investigation (SPT)** | drop rate | blow count | **sample quality** |
| **site investigation (CPT)** | push rate (fixed 20 mm/s) | — | verticality |

The HUD keeps three controls in the same three places; only the labels, the
units and the gauge change. A player who learns the shape of one method can
read another immediately, which is exactly how the real trade works.

**How the labels are resolved — and why there is no method-id table.**
`ui/screens/site.js` derives the control vocabulary from the method's own
properties: `flushMedium`, `toolSlots`, the `kind` in the sim tuning and the
iMarket application facet. It resolves to one of ten families — `rotary`,
`auger`, `percussive`, `core`, `sonic`, `oil`, `hdd`, `cfa`, `jet`, `piling` —
and there is **deliberately no method-id → label lookup in that file.** A new
method in `data.js` gets sensible controls without the site screen being
touched. Three rules carry most of it: anything modelling a mud column and a
preventer is an `oil` well; a hammer with nothing to turn is `piling`; and a
continuous auger carrying a concrete pump is a `cfa` rig, because the pump is
literally what makes it one.

Where the family does not name a PROTECT control, the method's `flushMedium`
supplies it (air / water / mud / foam / *hole cleaning* for `none`).

The screen refuses to print `kN` beside a 0–100 slider, because the slider
commands a percentage of the machine's available travel and a real unit there
would be a wrong unit (`PLATFORM_TRUTH.md` Part C §3). It reads the semantics
row of this table aloud instead.

### Two constraints that make it a game, not a slider

**1. Advance and Work are coupled by real hydraulics.** A piling hammer that
delivers 235 kNm does 30 blows/min; the same machine at 12 kNm does 100 — it is
one power hyperbola, and you cannot max both. Every method gets its own version
of that trade.

**2. The instrument can lie.** In driven piling, a pile whose toe is brooming
(crushing and splaying) produces a *beautiful* set — the blow count looks
perfect while the pile is destroying itself. Only the depth-into-bearing-stratum
counter tells the truth (Tomlinson & Woodward §1.4). Teaching a player to
distrust a good-looking gauge is the most authentic thing this game can do, and
every method has an equivalent: RC sample contamination gives you a perfect hole
and a worthless assay; CFA volume ratio is invisible until the pile log prints;
HDD annular pressure is unreadable without a downhole sub, so your first sign of
a frac-out is fluid on the surface.

### Section modes follow the method

All five are implemented in `world/geology.js`. `METHODS[].sectionMode` picks
one; `MODES` holds the parameters; `BMODE` is the shader id.

| mode | Methods | What the band means |
|---|---|---|
| `vertical` | 16 of 21 — everything not listed below | Depth on Y, scrolls down. The default, and the majority |
| `profile` | `hdd` | A long-section: along-bore station on X, depth on Y, scrolling sideways. 120 m X window against the 20 m Y view = **V.E. 6:1**, badged on the ruler as two scales, exactly as a real HDD profile drawing does |
| `raise` | `raise-boring` | Two stages, both levels drawn: pilot **down** from the upper level, then the reamer pulled **up** from the lower one. Stage 2 runs in reverse |
| `heading` | `tunnel-jumbo`, `rockbolt` | A face advancing horizontally. Face anchored at ~75 % across the band, ground **ahead** always visible. The X window is derived from the excavated height so the tunnel keeps ~40 % of the band and the support reads; V.E. lands at 1.6–3.2 and is badged |
| `pile` | `driven-pile` | The as-built column, not a borehole — and **the depth ruler becomes the blow-count bar chart** |

**The invariant that makes five modes cheap and safe:** one section unit is
always **one metre of true vertical depth on Y**, in every mode. So the
4096-texel column lookup, the contact distances, the water table, the ruler and
the whole shading rig are untouched by the mode. What a mode may change is only
what one unit of X means, what depth sits at y = 0, where the ground line is,
and the shape of the void. With those at their defaults every shader expression
reduces algebraically to the one `vertical` had before — which is why `vertical`
cannot regress. **Vertical exaggeration falls out of `metresPerUnitX`** rather
than being a second scale that can drift out of step with the first.

> **Note on scope.** `profile` was specified for HDD, auger boring,
> microtunnelling and pipe jacking. Only `hdd` exists as a method, so `profile`
> currently has one user. The mode is not HDD-specific and the other three would
> drop into it, but nothing in the game drives them today.

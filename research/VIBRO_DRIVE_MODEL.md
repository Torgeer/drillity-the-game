# Vibratory driving — the state, the case, and the model that is ready to build

**Date:** 2026-09-06. Written by the simulation agent that owns
`src/sim/drilling.js`, alongside the CFA concreting programme.

---

## 1. The claim this pass was given, and what is actually true

`handover.md` §"What I observed that Claude must not miss" item 7:

> *"Vibro equipment still falling back to impact physics remains a separate
> defect, not a physical equivalence."*

**That is stale for this worktree, and I verified it myself rather than taking
a report's word for it** (ASTRA §10: check the file yourself before acting on a
claim about it).

```
$ node tools/audit-vibro-runtime.mjs            # BEFORE this pass
AssertionError → uncaught, process exits 1
Error: Vibratory Hammer, 1500 kN cannot start this drive. Fit a hydraulic impact hammer.
    at resolveMethod (src/sim/drilling.js:2201)
    at Object.startHole (src/sim/drilling.js:3450)
```

The fallback is gone. `src/game/equipment-support.js:7-16` refuses the start
before a run exists, `resolveMethod()` throws `unsupported-piling-hammer`, and
`checkvibro-start-guard.mjs` / `checkvibro-start-adversarial.mjs` fence it.
Nothing borrows a ram mass, a stroke or a blow.

The diagnostic that *recorded* the old defect had not been retired with it: its
header still read *"Exit 0 means the recorded impact fallback was reproduced"*
and it died on an uncaught exception at line 33 instead of reporting anything.
That is ASTRA §10's "hardcoded claim inside a gate" exactly. It has been
rewritten to **measure the current state**; exit 0 now means the containment
holds and the model is absent, and it fails the day either changes.

---

## 2. So what IS wrong now — the live defect, measured

The refusal is a wall, not a model, and the shop is still selling the machine
behind it. Measured by `tools/audit-vibro-runtime.mjs`:

```json
"fallbackReproduced": false,
"defaultLoadoutHammer": "vibro-hammer-1500",
"defaultLoadoutIsRefused": true,
"hammers": [ {"id":"impact-hammer-9t","price":198000,"ropMult":1},
             {"id":"vibro-hammer-1500","price":164000,"ropMult":1.35} ]
```

1. **`defaultLoadoutFor('driven-pile')` returns the refused item.**
   `src/game/data.js:6383-6392` sorts the options by price and the vibro is the
   cheaper of the two hammers, so the game's own suggested loadout for the only
   piling method is the one machine that cannot start a contract.
2. **`autoLoadout` picks it too.** `src/game/progression.js:647` sorts on
   `stats.ropMult × life`; the vibro's 1.35 beats the impact hammer's 1.00.
3. **That `ropMult: 1.35` is a physics claim about a machine with no physics.**
   It carries no citation anywhere and it is the number that wins the sort.
4. **Three dead `vibro` keys exist as if it were a method id.** There is no
   `vibro` method: `src/audio/audio.js:309` (`blowHz: [22, 34]`, unsourced and
   unreachable), `src/sim/vfx.js:1396`, `src/ui/screens/site.js:538`.
5. **The HUD vocabulary would be wrong if it did start.** `site.js`
   `controlFamily()` sends `kind: 'vibro'` to the `piling` family — ENERGY /
   BPM / ALIGN. A vibrator has no energy per blow and no blow rate.
   `research/05-foundation-piling.md:2506` already publishes the right row:
   **crowd / line pull · frequency · eccentric moment (amplitude)**.

None of those five files is this agent's to edit. They are requests, below.

---

## 3. The case for why it cannot simply be modelled here today

Three things must exist first, and each is small and named.

**(a) The machine envelope must be published by `game/data.js`.**
`resolveMethod()` builds the driven-pile model from `item.impactHammer`
(`drilling.js:2210`). A vibratory drive needs the equivalent block on the item
— `vibroHammer` — and `data.js` is the content authority. Modelling against a
block no shipped item declares would be ASTRA §10's "declared contract with no
consumer", which this codebase has already paid for eight times.

**(b) `VIBRO_RUNTIME_AUDIT.md:110-114` states the constraint that stops any
shortcut**, and it is right:

> *"Force in kN is not energy in kNm. A centrifugal-force ceiling cannot
> populate `ratedEnergyKnm`, infer a ram mass/drop, or establish a per-blow
> set."*

A vibratory pile has **no set**. The game's own shop copy already says so —
*"it gives you no set at all — which means no bearing capacity you can prove"* —
and `driven-pile` is scored on `setPerBlow` and the blow log. A vibratory
programme is therefore a different programme, not a parameter swap, and it ends
on a different criterion.

**(c) The finish is a two-tool sequence, and that is a progression question.**
`[TOM]` §3.1.5, at `research/05-foundation-piling.md:427`: common US practice
where there is no test data is to *"vibrate the pile to within 3 m of expected
penetration, then finish with an impact hammer to the bearing layer."* That is
the honest answer to (b) — it is how the field gets a provable set out of a
vibratory drive — and it needs the loadout to carry two hammers and the run to
hand over between them. `game/progression.js` and `game/data.js` own that.

**Nothing was invented to route around any of the three.** The refusal stands
until the envelope lands.

---

## 4. The model is ready to build, and its physics is verified against the source

This is the part that does not need re-researching. Everything below is already
in the repo with a source, or is an identity I checked against the source's own
table this session.

### 4a. Two published numbers per machine are enough

`research/rigs/tools-piling-hammers.md` §3b carries the complete six-machine
table from `Junttan_Vibratory_Hammers_brochure_2023_web.pdf` p.4. I checked the
two governing identities against every row of it:

| class | Fc published (kN) | M·ω² (kN) | err | amplitude published (mm) | 2M/m_dyn (mm) | err |
|---|---|---|---|---|---|---|
| 25 | 795 | 792 | −0.3 % | 22 | 22.0 | +0.1 % |
| 30 | 1 036 | 1 033 | −0.3 % | 24 | 23.7 | −1.2 % |
| 50 | 1 409 | 1 409 | 0.0 % | 24 | 24.3 | +1.3 % |
| 80 | 2 318 | 2 319 | 0.0 % | 23 | 23.2 | +1.0 % |
| 120 | 2 846 | 2 882 | +1.3 % | 26 | 26.2 | +0.9 % |
| 200 | 4 380 | 4 368 | −0.3 % | 19 | 18.7 | −1.4 % |

So, to within 1.4 % across the whole published range:

```
  centrifugal force   Fc = M · ω²          ω = 2π · rpm / 60
  double amplitude    a  = 2M / m_dyn      m_dyn = dynamic weight without clamp
```

**This matters because it means nothing has to be invented.** Give the item an
eccentric moment and a dynamic mass, let the operator command the frequency, and
force and amplitude both fall out of physics that the manufacturer's own numbers
confirm. That is the opposite of the impact hammer's `powerKnmPerMin: 7050`,
which `drilling.js:1553` marks NOT SOURCED for exactly this reason.

A **variable-moment** machine — `research/10-oem-foundation.md:779-788`, the
VH VM series, eccentric moment `0–8` through `0–50 kg·m` at a constant 2 300 rpm
— makes the eccentric moment the third control, which is precisely the slider
`research/05` §E4 asks for: *"bring the moment up only after the frequency is
above the critical zone, and drop it before slowing down."*

### 4b. Every other constant the model needs, already sourced

| Quantity | Value | Source |
|---|---|---|
| Driving rate, favourable ground | **18 m/min** | `[TOM]` §3.1.5, `research/05:415` |
| Where it works | low-displacement piles (H, open tube, sheet) into **loose to medium-dense granular** | `[TOM]` §3.1.5 |
| Where it fails | *"not very effective in firm clays; cannot drive piles deeply into stiff clays"* | `[TOM]` §3.1.5 |
| Working band, low point resistance | **10–40 Hz at 1–10 mm amplitude** | Rodger & Littlejohn via `[TOM]` §3.1.5 |
| Working band, high point resistance | **4–16 Hz at 9–20 mm amplitude** | Rodger & Littlejohn via `[TOM]` §3.1.5 |
| Machine band | most vibrators **10–39 Hz**; a 25 m steel pile's natural frequency ≈ **100 Hz** | `[TOM]` §3.1.5 |
| Liquefaction risk | above **40 Hz** with high amplitude in fine soils | `[TOM]` §3.1.5 |
| Finish practice | vibrate to within **3 m**, then impact to the bearing layer | `[TOM]` §3.1.5 |
| Extraction | *"quite efficient for this purpose in all soil types"* | `[TOM]` §3.1.5 |
| PPV limits, residential | **10 mm/s intermittent, 5 mm/s continuous** | `[TOM]` §3.1.7, `research/05` §E4 |
| Honest variance | predicting vibratory driving performance *"is still not very reliable"* | `[TOM]` §3.1.5 |
| The shipped machine | **1 500 kN, 2 500 rpm, 5 070 kg, 480 kW, max pile 7 000 kg** | `[BAU-CAT]`, `research/05:463` |

**Two working bands with opposite optima is the mechanic.** In loose granular
ground you want high frequency and small amplitude; where the point resistance
is high you want low frequency and large amplitude. Same two sliders, opposite
answers, and the ground decides which — the same shape as the jet grouting
return and the CFA head, and it is sourced rather than designed.

### 4c. A correction to an existing finding

`research/rigs/tools-piling-hammers.md` §9.4 calls the shipped
`rpm: 2500` *"about 56 % too high"* against the sourced 1 400–1 700 rpm table.
**That comparison uses the wrong class.** The 1 400–1 700 rpm table is
free-hanging vibrators; the game's item is a **leader-mounted** machine, and
`[BAU-CAT]` publishes exactly **1 500 kN centrifugal force, 2 500 rpm, 5 070 kg**
for that family — which is the shipped triple, digit for digit
(`src/rig/tools.js:10855`). §9.4's own §8 item 11 admits the gap
(*"the leader-mounted arrangement the game uses is unsourced here"*). The rpm is
sourced; it is the *comparison* that was against the wrong family. The geometry
criticisms in the same section are unaffected.

### 4d. What the model can reuse rather than invent

`driveResistance()` at `drilling.js:2282-2295` is already hammer-agnostic —
`(method, ground, embedM)` → base + end bearing + granular density + shaft
friction — and it keys the granular term off `ground.abrasivity`, which is the
axis vibratory performance actually depends on. A vibratory programme calls it
unchanged. `setPerBlow()`, `hammerEnvelope()` and `hammerSetting()` are
impact-only and must not be reused; the bearing-stratum truth counter
(`bearingUcsMin: 30`, `bearingPenM: 0.6`) is the acceptance criterion that
survives the change of drive mechanism, and it is what the impact finish proves.

---

## 5. The specific things that must exist

**In `src/game/data.js`** — add the envelope to the item, in the same shape and
with the same discipline as `impactHammer`:

```js
// Manufacturer leader-mounted vibrator, [BAU-CAT] bauma 2025 catalogue:
// 1 500 kN max centrifugal force, 2 500 rpm, 5 070 kg, 480 kW hydraulic,
// max recommended pile weight 7 000 kg. Eccentric moment and dynamic weight
// are the two numbers the model needs; force and amplitude follow from
// Fc = M·w^2 and a = 2M/m, both verified against the published six-machine
// table to within 1.4 % (research/VIBRO_DRIVE_MODEL.md §4a).
// eccentricMomentKgm is DERIVED from the published pair, not measured:
//   M = Fc/w^2 = 1500e3 / (2p*2500/60)^2 = 21.9 kg.m   ← mark it as derived.
vibroHammer: { eccentricMomentKgm: 21.9, momentIsDerived: true,
               centrifugalForceKn: 1500, freqRpmRange: [0, 2500],
               dynamicMassKg: 5070, powerKw: 480, maxPileMassKg: 7000 },
```

and **stop the refused item winning the suggestion**: either exclude items whose
`checkEquipmentSupport` fails from `defaultLoadoutFor` and `autoLoadout`, or
drop the unsourced `stats.ropMult: 1.35` that wins the auto-loadout sort.
Whichever is chosen, a player who accepts the game's own suggestion must not be
handed a machine that cannot start.

**In `src/ui/screens/site.js`** — a `vibro` control set, per
`research/05:2506`: `advance: ['Crowd / line pull','CROWD']`,
`work: ['Frequency','FREQ']`, `protect: ['Eccentric moment','MOMENT']`. The
`piling` family's ENERGY / BPM / ALIGN describes a different machine.

**In `src/game/progression.js`** — the two-hammer finish, if the sourced
sequence in §3(c) is to be modelled rather than replaced by a game-side
invention.

**Then in `src/sim/drilling.js`** — a `vibro` programme keyed off
`item.vibroHammer`, with the constants in §4a–4b, ending on penetration into
the bearing stratum plus the impact finish rather than on a set. It is roughly
the size of the CFA concrete lift delivered in the same pass, and it needs none
of its numbers invented.

`tools/audit-vibro-runtime.mjs` asserts today's absence of both halves, so it
turns red on the first of those changes and tells whoever lands it that the
other half is now owed.

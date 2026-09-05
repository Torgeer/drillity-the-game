# Motion — the measurement, and why Blender should own it

The owner's ask: *"I want blender to fix all motions, buttons everything! I want
everything in this game go through Blender for absolute best feelings/design/
motion."*

This file is the measurement that says why that is right, and what it should
concretely mean. **Nothing here is an opinion about taste** — it is a count.

---

## What the game's motion actually is today

Measured off `src/ui/styles.css` and `src/ui/`:

| | count |
|---|---|
| motion declarations in `styles.css` | **82** |
| **easing functions**, of which: | **90** |
| &nbsp;&nbsp;`linear` | **55** |
| &nbsp;&nbsp;`ease-out` (browser shorthand) | **26** |
| &nbsp;&nbsp;`ease-in-out` | **5** |
| &nbsp;&nbsp;**authored `cubic-bezier`** | **4** |
| rAF animation chains in `src/ui/` | **15** |

**Four authored curves out of ninety.** Everything else is a browser default,
and **55 of them are `linear`** — which is the absence of animation design.
Nothing in the physical world moves linearly. (A rotating spinner or a bar
filling at a constant rate is legitimately linear; fifty-five of them is not.)

The durations tell the same story — there is no scale, just numbers picked one
at a time:

```
1ms  ·  38ms  ·  110ms  ·  190ms  ·  300ms  ·  440ms  ·  720ms
1s  ·  4s  ·  5s  ·  12s  ·  24s  ·  34s
```

And what moves is almost entirely `transform` (9) and `opacity` (5) — which is
correct, those are the two cheap properties — so the vocabulary is right and
**the timing of it was never authored.**

One curve *was* authored well and is worth naming, because it proves the point:
`cubic-bezier(.34, 1.56, .64, 1)`. The `1.56` is **overshoot** — it settles past
its mark and comes back. That is the one piece of motion in this game that
reads as physical.

---

## The structural problem: four authorities, no source

Motion is decided in four separate places that share nothing:

1. **CSS transitions** in `styles.css` — 82 of them.
2. **15 rAF chains** in `src/ui/`, each with its own hand-rolled timing.
3. **Per-frame node drivers** in `rigFactory.js` — the rig's own movement.
4. **glTF animation clips**, which landed today (`blender/lib/anim.py` →
   `src/core/gltfAnim.js`).

That is the **"N tables describing one thing"** pattern (ASTRA §5), applied to
feel. It is the same shape as the four dimension tools, the two `UNDERGROUND`
sets and the five material-name dialects — and it fails the same way: they
drift, and nobody can tell which one is right.

---

## What Blender should own, and why it is the right tool

**Blender's graph editor is a first-class animation-curve tool.** It is what the
curve of a motion is *supposed* to be authored in — by looking at it, next to
the thing it moves — rather than typed as four numbers in a stylesheet.

So the proposal is not "render the UI in Blender". It is:

**Blender becomes the single authority for motion curves, and three consumers
read from one source.**

- **CSS** gets a `cubic-bezier()` per named curve, as custom properties.
- **JS** gets the same curves for the 15 rAF chains, from `src/core/motion.js`.
- **glTF clips** key against the same named curves via `blender/lib/anim.py`.

A cubic Bézier cannot represent every F-Curve — where one has to be
approximated, **the error gets reported, not hidden.**

### Name curves for what they DO

`press`, `release`, `enter`, `dismiss`, `settle`, `count`, `warn` — never
`easeOutQuart`. A vocabulary of 8–12, each with a stated job. A name that
describes the shape instead of the job is how you end up with fifty-five
`linear`s.

---

## What makes motion feel expensive

Recorded here because it is the design brief, not folklore:

- **Asymmetry.** Things should leave faster than they arrive. Equal in and out
  reads as a slideshow.
- **Overshoot.** A control that settles past its mark and back reads as
  physical. This game has exactly one such curve today.
- **Stagger.** A group that moves as a block reads as one flat object; the same
  group offset by 20–30 ms per item reads as depth.
- **Nothing moves that did not physically move.** Already a house rule in
  `styles.css`, and the reason the unit card's entrance was deleted.

And the constraint that overrides all of it: **this game is portrait mobile,
one-handed, and often glanced at rather than watched.** A 400 ms transition that
is beautiful on a desktop is a transition the player is fighting. Time it
against the thumb.

---

## The one caveat, stated plainly

**The buttons stay DOM elements.** That is load-bearing and not negotiable
without a deliberate trade:

- `npm run check:reach` gates thumb reach against a measured arc, and
  `.hudqa/measure.mjs` gates the 44 px touch floor and overlap. Both read the
  DOM.
- A `<button>` is reachable by screen reader and keyboard; a mesh is not.
- A DOM control cannot accidentally end up behind the 3D.

**The middle path gets the whole win**: the button's *face* is a Blender render,
its *motion* is a Blender curve, and it remains a real `<button>`.

Going fully 3D for the drilling controls specifically — controls that are
physically part of the machine, which is a genuinely strong idea for this game —
is a real option. It is a trade against every gate above, and it should be
chosen deliberately rather than arrived at.

---

## Definition of done

The curve library is not done when it exists. **It is done when the 78 defaults
are gone**, because a curve library nothing consumes would be the ninth
declared-contract-with-no-consumer in this codebase — ASTRA §8 already lists
eight.

And `prefers-reduced-motion` is a gate, not a nicety: a vestibular-sensitive
player must get a usable game, not a broken one.

# "From the field" — verified fact list

Drop-in replacement for the `FACTS` array in `src/ui/screens/catalog.js`.
Every line carries a source. **Do not add a line to the game without adding it
here first, with a source.** If a claim cannot be sourced, it does not ship.

Sources keys:
- `TAX` — `Drillity_Taxonomy_v5.3.pdf` / `DOMAIN.md` §1–§6
- `iM`  — `PLATFORM_TRUTH.md` Part A (Drillity iMarket)
- `TAL` — `PLATFORM_TRUTH.md` Part B (Drillity Talent)
- `ENG` — uncontroversial textbook drilling engineering
- `GRD` — the `GROUND` table in `src/core/contract.js` (the game's own model)

---

### Removed — these were wrong and must not return

| Rejected line | Why it is wrong |
|---|---|
| "Ring-bit and wing-bit systems leave the bit in the ground — that is why they are called sacrificial, or lost, bits." | Conflates two different families. A **ring bit** is left in the ground; a **wing bit retracts and is recovered**. And "Sacrificial / Lost Bits" is a separate taxonomy subcategory, not a nickname for either. |
| "Odex and Symmetrix are eccentric overburden systems…" | **Odex is eccentric. Symmetrix is concentric.** The taxonomy files them under one node for merchandising; that is not an engineering claim the game may repeat. |
| "Kelly bars come as friction, interlocking or full-locking. Only the full-locking type transmits full **torque** at full extension." | **Conflates torque with crowd force.** Torque goes through the bar's longitudinal ribs in *every* type. What differs is the **crowd (pull-down) force**: a friction Kelly transmits it only through the grip between the telescoping tubes, an interlocking one through mechanical interlocks at any extension. The game's own shop copy already had this right — `data.js` reads "Interlocking bar: full crowd force at any extension" — so the boot screen was contradicting the shop. |
| "Percussion threads run R25 to R51 and T38 to T127." | Not false, but **incomplete in a way that matters**: it omits the **H family (H55–H114)**, which `DOMAIN.md` §4 lists alongside R and T. A large-diameter driller reading it finds his whole thread family missing from the game. |

**A rule about this file, learned the hard way.** The direction of truth is
**from this file to the code**, always. When `FACTS` and this list diverged on
the OEM cross-reference line, the drift was closed by editing *this file* to
match the shipped string — which is backwards, and is exactly what
`tools/checkfacts.mjs` says in its own header never to do. It has since been
closed the right way round.

The reason the rule is absolute rather than a preference: the guard enforces
**string identity only**. It cannot tell a harmless rewording from a changed
claim, so "it was only style" is not a judgement the tool can make and not one
to make on its behalf. Both wrong lines above sat in a **green build** — they
matched the source exactly, and the source was wrong. A green `checkfacts` means
the code has not drifted from the list. It does not mean the list is true.

---

### The verified list

```js
export const FACTS = [
  // — Method character (ENG) —
  'A DTH hammer puts the percussion at the bit, so blow energy does not fade down the string. That is why it overtakes top hammer as the hole gets deep.',
  'Top hammer sends the blow down the rods. Every coupling costs you energy, so the deeper you go the slower it drills.',
  'In DTH the air does the work: it drives the piston and lifts the cuttings. Feed only keeps the bit coupled — lean on it and the hammer stalls.',
  'Auger drilling is torque-limited, not thrust-limited. If the flight cannot lift the spoil, more push just packs the hole.',
  'CFA never lifts the auger until concrete is pumping. Pull dry and the bore collapses.',
  'Raise boring drills a pilot hole down, then pulls a reamer head back up. Gravity does the mucking.',
  'Sonic drilling resonates the string. Hit the frequency and it slices soils; miss it and you are just heating steel.',
  'Self-drilling anchors are drilled and grouted in one pass — the hollow bar is both the drill string and the reinforcement.',

  // — Overburden systems, stated precisely (TAX + ENG) —
  'Eccentric overburden systems swing a reamer out to cut clearance for the casing, then retract it to come back up the hole.',
  'Concentric systems use a ring bit on the casing shoe. The ring bit stays in the ground with the casing; the pilot bit comes home.',
  'A wing bit is not a lost bit — the wings fold in so it can be pulled back up through the casing and used again.',

  // — Threads and connections (TAX / DOMAIN §4) —
  'Percussion threads run R25–R51, T38–T127 and H55–H114. Families do not mix, and on a big hammer the shank shaft diameter is what decides which H thread you are on.',
  'Wireline core sizes go AQ, BQ, NQ, HQ, PQ. The inner tube comes up the rods; the string stays in the hole.',
  'Casing threads are usually left hand, so advancing the casing cannot unscrew the joints.',
  'Kelly bars come as friction or interlocking. Only the interlocking type puts full crowd force on the tool at full extension — the friction type is limited by the grip between the tubes.',

  // — Ground behaviour (GRD + ENG) —
  'Quartzite runs about 300 MPa and is the most abrasive ground in the game. It ends carbide faster than anything else you will meet.',
  'Glacial till hides boulders. The torque spike arrives before you hear anything — back the feed off and let the percussion work.',
  'A karst void means instant loss of return: the bit free-falls and the flush goes nowhere. Cut feed before the string drops.',
  'Below the water table the ground is wetter, weaker and quicker to erode. Sand over-gauges the hole; clay smears the wall.',
  'Flushing is not optional. Cuttings left in the annulus regrind, heat the bit and jam the string.',
  'Too much flush in loose ground is its own problem — you wash the wall out and lose the hole to over-gauge.',

  // — Tools and wear (TAX + ENG) —
  'Ballistic buttons drill soft and medium rock fast. Spherical buttons survive hard, abrasive rock longer.',
  'A blunt bit does not fail gracefully. Past about seventy percent worn, penetration falls off a cliff — change it before it changes itself.',
  '42CrMo4V and 34CrNiMo6 are the workhorse drill-string steels. S355J2 is structure, not string.',
  'Heavy-duty is a real specification, not marketing. It buys you wall thickness and fatigue life, and it costs you money.',

  // — Drillity iMarket (iM) —
  'On Drillity iMarket a product lives in exactly one subcategory. Thread, size, material and duty are filters, not categories.',
  'Condition is a real spec: new, used, refurbished, or for parts. Used gear is the cheap road, and it carries real risk.',
  'Cannot find the part? Post an RFQ. Matching sellers get notified and come back with quotes.',
  'Drillity iMarket charges no commission on a deal. Sellers keep what they sell.',
  'One brand’s part number can surface a compatible alternative from another maker. That cross-reference is where the savings hide.',

  // — Drillity Talent (TAL) —
  'In this industry an expired certificate is the same as no certificate. Let a medical lapse and you do not mobilise.',
  'Rotation is a real field, not a nicety: 14/14, 21/21, 28/28, 4/4 — availability decides who gets the call.',
  'Offshore work is paid as a day rate, not a salary. Rig type, rig class and water depth set the number.',
  'Rig class matters as much as rig type. High-spec, harsh-environment and HPHT work pays differently because it is different work.',
  'BOSIET, HUET, FOET and the offshore medical are what stand between you and a helicopter seat.',
  'Passport and visa readiness decides the shortlist before anyone reads your skills.',
];
```

### Style rules for any future addition
- One idea per line. Present tense. Second person where it is advice.
- No manufacturer names, no model designations, no Drillity internal metrics.
- Prefer the concrete over the impressive: a number a driller can check beats an
  adjective.
- Maximum ~150 characters so it never wraps past three lines on a 390 px phone.

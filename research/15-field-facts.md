# 15 — Field facts for the six new methods, and for commodities

**Purpose.** `FACTS_VERIFIED.md` was written when the game had 15 methods. It now
has 21. This pack proposes lines for the six that have none — `rc`,
`tunnel-jumbo`, `longhole`, `rockbolt`, `driven-pile`, `site-investigation` —
plus commodities, plus the three carry-over items named in the brief.

**Nothing here is a code change.** No file under `src/` was touched, and neither
`FACTS_VERIFIED.md` nor `src/ui/screens/catalog.js` was edited. This is a
proposal list only. The direction of truth is `FACTS_VERIFIED.md` → code, and
that stays true here: nothing below ships until it is added to that file first.

---

## How to read the entries

Each entry gives:

- **the line** as it would appear in the `FACTS` array;
- **source** — a primary document, standard, or `research/NN §X`;
- **why it is true**, and — the point of this column — whether the *reason* is
  sourced or is my inference. Several of the best facts have a well-attested
  practice and a folk explanation. **Where that is the case the line states the
  practice only, and the explanation is quarantined into this column.**

Confidence tiers:

- **Tier 1 — verified by me, in this pass, against the primary document.**
  I opened the source and read the sentence.
- **Tier 2 — sourced in a local research pack that read the primary document.**
  I did not re-open it, but the pack quotes it and the pack's citation
  discipline is good.
- **Tier 3 — cut these.** Listed at the bottom with the reason.

Style rules obeyed throughout (`FACTS_VERIFIED.md`): one idea, present tense,
second person where it is advice, no manufacturer names, no model designations,
≤ ~150 characters. Every line below has been length-checked.

---

# ⚠ FIRST — two corrections that must not be missed

`research/03-mining.md` §G.1 already carries a candidate `FACTS` block. **Two of
its lines are wrong**, in the same subtle way as the four in the "Removed" table.
I found this by re-opening `[W-ROCSCIENCE]` and reading it. Neither line has
shipped; make sure neither does.

### Correction 1 — crooked holes

| | |
|---|---|
| **Candidate line in `research/03` §G.1** | *"Bolt holes must be at least 50 mm deeper than the bolt, and straight. A crooked hole costs you capacity."* |
| **And in `research/03` §A.4** | *"**Crooked or curved holes reduce capacity** [W-ROCSCIENCE]"* |
| **What the source actually says** | *"Other installation factors affecting bolt capacity are hole roughness and curvature. Crooked or rough holes **do not adversely affect** the performance of a Split Set, but rather they **increase the anchorage and hence the pull-out strength**."* |

The claim is **backwards**. A rough or crooked hole gives a friction bolt *more*
anchorage, because anchorage is radial spring force against the wall and
irregularity adds interference. Only the "at least two inches longer than the
bolt" half of that candidate line survives, and it survives verbatim.

Source: Rocscience, *Factors Influencing the Effectiveness of Split Set Friction
Stabilizer Bolts*, §2.4.1 —
https://www.rocscience.com/assets/resources/learning/papers/Factors-Influencing-the-Effectiveness-of-Split-Set-Friction-Stabilizer-Bolts.pdf

### Correction 2 — the torque-testing rule

| | |
|---|---|
| **Candidate line in `research/03` §G.1** | *"The first bolt, every tenth bolt and the last bolt of the shift get torque tested. That is the rule, not a suggestion."* |
| **Cited to** | `W-MSHA-TIP` — https://arlweb.msha.gov/stats/top20viols/tips/75202.htm |
| **What I found** | That page does not contain the rule. 30 CFR § 57.3360, also cited in §A.4, does not contain it either — it is the general "ground support shall be used where conditions indicate it is necessary" text and nothing more. |
| **What the real rule says** | 30 CFR § 75.204(f): *"In each roof bolting cycle, the actual torque or tension of the first tensioned roof bolt installed with each drill head shall be measured immediately after it is installed. Thereafter, for each drill head used, at least one roof bolt out of every four installed shall be measured."* Separately, in producing working places, *"at least one out of every ten previously installed mechanically anchored tensioned roof bolts"* is measured. |

So it is **first-per-drill-head, then one in four** — not "first, tenth and
last". And § 75.204 is **US underground coal roof bolting**. The game's
`rockbolt` method is hard-rock mining and tunnelling. Putting a coal roof-bolt
frequency rule into a hard-rock bolter's mouth is exactly the class of
adjacent-concept error the Removed table exists to prevent.

**Use the tunnelling regulation instead** — it is jurisdictionally right for
`rockbolt`, it is short, and I verified it: 29 CFR § 1926.800(o)(3)(iv)(A),
*"Torque wrenches shall be used wherever bolts that depend on torsionally
applied force are used for ground support."*
https://www.law.cornell.edu/cfr/text/29/1926.800

---

# TIER 1 — verified against the primary document in this pass

## `rockbolt` — Ground support

All four verified against the Rocscience Split Set pull-test study (over 900
tests, ~50 North American mines) or against the CFR text.

### R1
```
'A friction bolt needs a hole slightly smaller than the bolt. Drill it oversize and you have installed a steel tube that holds nothing.'
```
- **Source:** Rocscience Split Set study §2.4.3, §2.4.4 (URL above).
- **Why true — sourced.** §2.4.4: the hole *"should be drilled with a bit of a
  diameter slightly less than that of the Split Set"*. §2.4.3, quoting Scott
  (1996): if the slot is unchanged after installation *"then the hole is larger
  than the Split Set and there is zero or near-zero anchorage."* The reason and
  the consequence are both in the source. No inference.
- 133 characters.

### R2 — the instrument fact for bolting
```
'Shine a light down a friction bolt. A closed slot means rock-to-metal contact. A slot the width it started means near-zero anchorage.'
```
- **Source:** Rocscience Split Set study §2.4.3.
- **Why true — sourced, near-verbatim.** *"Split Sets are one of the only
  support fixtures where a miner can visually observe the quality of
  installation. By shining a light down the length of the tube, a miner can
  observe the degree of slot closure… if the slot is closed 1/16 of an inch,
  then there is full rock-metal contact around the Split Set. If the slot is the
  same size as before installation, then the hole is larger than the Split Set
  and there is zero or near-zero anchorage."* I dropped the 1/16 in figure
  because it is imperial and the line does not need it.
- 133 characters. **This is my single best `rockbolt` line.** It is the
  bolting equivalent of the brooming pile: a bolt that looks installed, is
  plated, is torqued, and holds nothing — and there is a free five-second test
  that tells the truth.

### R3
```
'Drive time is a free pull test. A bolt that takes work to drive holds; a bolt that slides in holds little.'
```
- **Source:** Rocscience Split Set study §2.4.2.
- **Why true — sourced.** *"there is a direct relationship between drive time
  and immediate capacity"*; *"A longer drive time is indicative of greater
  friction between the rock and the bolt surface and conversely a shorter drive
  time indicates less friction"*; *"Bolts that require a greater amount of work
  energy to install, as manifested by higher drive times, will have a higher
  pull-out strength when tested."* Both directions are stated.
- **One caveat the source itself gives, and the line respects:** the
  relationship is to *immediate* capacity. The source notes *"rock movements
  over time may give bolts with otherwise low drive times higher bond
  strengths"* — which is why the line says "holds little", not "has failed".
- 106 characters.

### R4 — subtle, and the reason it is worth shipping
```
'Competent rock is the least forgiving on bit size. There is almost no overbreak, so the hole really is the diameter of the bit you chose.'
```
- **Source:** Rocscience Split Set study §2.4.4.
- **Why true — sourced.** *"competent rocks are the most sensitive to the size
  of the drilling bit… Due to minimal overbreak, the actual hole diameter in
  such rocks is close to that of the drilling bit."* In broken or soft ground
  overbreak means the hole is wider than the bit, so bit choice is partly washed
  out; in hard ground it is not. Backed by 450+ pull tests on one bolt size
  across five common bit diameters, with a monotonic trend.
- 136 characters. This teaches a decision the player will face: *in good ground,
  the bit size on the shelf is the bolt capacity you get.*

### R5
```
'Where a bolt depends on torque to hold, a torque wrench is not optional.'
```
- **Source:** 29 CFR § 1926.800(o)(3)(iv)(A), *Underground construction* —
  https://www.law.cornell.edu/cfr/text/29/1926.800 — verified in this pass.
- **Why true — sourced, near-verbatim.** *"Torque wrenches shall be used
  wherever bolts that depend on torsionally applied force are used for ground
  support."* Note the conditional in the regulation and keep it: it applies to
  torque-dependent bolts (mechanical point anchor), not to friction bolts.
- 72 characters. Short, but it is a rule, and rules read well short.

---

## `tunnel-jumbo` — Drill & blast at the face

Verified against Norwegian Tunnelling Society Publication 14 §7.4, opened and
read in this pass — https://nff.no/wp-content/uploads/sites/2/2020/04/Publication-14.pdf

### T1 — the headline fact for the method
```
'A round never pulls the full depth you drilled. Norwegian practice drills 5.5 m of steel and advances 4.5 to 5.0 m.'
```
- **Source:** `[NFF14]` §7.4, verbatim: *"Tunnel excavation by 18 feet steels
  rods which produce a tunnel advance of approximately 4.5–5.0 m per blast round
  (10-20 % reduction in length)."* 18 ft = 5.49 m `[conv]`.
- **Why true — sourced.** The scope is stated in the line ("Norwegian
  practice") because that is how the source states it. Do not generalise it to
  "a round pulls 90 %" — `research/04` §A1 shows the wider literature quoting
  different figures for different round lengths and ground.
- 116 characters. The design consequence, already in `research/04` §A1: the game
  must show *drilled depth* and *pulled depth* as two different numbers, and the
  gap is the score.

### T2
```
'A good round leaves most of the drill holes still visible in the finished wall. That, not metres, is how the contour is judged.'
```
- **Source:** `[NFF14]` §7.4, verbatim: *"A typical successful blast round in
  competent rock will display most of the drill holes in the tunnel contour."*
- **Why true — sourced,** with one scope the line keeps implicit and the source
  states: *in competent rock*. I have written "a good round" rather than "every
  round" for exactly that reason.
- **Vocabulary note.** The industry name for this is the *half-barrel* or
  *half-cast factor*. `[NFF14]` does not use the term; `research/04` §A1 adds
  it. I left the term out of the line. If you want it in, it is standard and
  uncontroversial, but it is the pack's word, not the source's.
- 126 characters.

### T3
```
'No rock may protrude inside the theoretical contour. That is why the drilled profile is deliberately cut larger than the tunnel.'
```
- **Source:** `[NFF14]` §7.4, verbatim for the first sentence: *"A general
  requirement to Norwegian tunnels is that no rock should be allowed to protrude
  inside the theoretical rock contour."*
- **Why true — first sentence sourced, second sentence is the standard
  explanation and I am labelling it as inference.** The look-out angle is real
  and universal (`research/04` §A1), but the numeric rule of thumb attached to
  it — 10 cm + 3 cm per metre of hole depth — comes from `[NTNU-BD]` via a
  search summary that the pack itself flags as unverified. **The number is not
  in this line and should not be added.** The causal link "hard contour rule →
  deliberate over-profile" is sound engineering and is corroborated by
  `[NFF14]`'s own discussion of overbreak and boom inclination, but `[NFF14]`
  does not state it as a sentence.
- 127 characters.

### T4
```
'Contour holes are collared within 0.1 m of the pattern and held inside six percent of hole depth. The rest of the face is not that fussy.'
```
- **Source:** `[NFF14]` §7.4, verbatim: *"collaring within 0.1 m measured from
  theoretical drill pattern, and for alignment deviation, maximum 6 % of the
  depth of the hole."*
- **Why true — first sentence sourced. Second sentence is my inference** and is
  the weakest thing on this page. It is true in the sense that the specification
  is written for the contour and not for the stoping holes, but no source says
  the other holes are looser. **My recommendation: ship the first sentence
  alone.** It stands on its own at 96 characters:
  ```
  'Contour holes are collared within 0.1 m of the pattern and held inside six percent of hole depth.'
  ```
- 136 characters as written above; 96 in the recommended short form.

### T5 — the one that teaches a decision
```
'Bad ground does not only slow you down. Six-metre spiles cap the round at three metres, and you feel it every cycle until you are through.'
```
- **Source:** `research/04` §A4, from Norwegian Tunnelling Society Publication
  19 `[NFF19]` §4.3.1 — spile length 6 m, of which 1 m hangs up at the rear
  edge; *"Round length must be limited to 2.5–3 m (max 3 m)"* when using 6 m
  spiles, so each set overlaps the last.
- **Why true — sourced.** The mechanism is geometric and the source states it:
  the spile must reach far enough ahead *and* have material behind for
  anchorage, so it caps the advance between sets.
- **Tier note:** this one is Tier 2, not Tier 1 — I did not open `[NFF19]`, only
  `[NFF14]`. It sits here because it belongs with the other jumbo lines. The
  productivity consequence — 4.5–5.0 m down to 2.5–3.0 m, roughly a 40 % hit —
  is `research/04`'s arithmetic on the two sourced numbers, and is not in the
  line.
- 137 characters.

---

## `site-investigation` — the CPT correction the brief asked for

### S1 — the friction cone
```
'A friction cone has no pore-pressure channel, so qt = qc + u2(1-an) has nothing to correct with. In soft clay that is the correction that matters.'
```
> **Typography warning, and it matters here.** The minus in `(1-an)` above is an
> **ASCII hyphen**, deliberately. `research/06` §A.2.4 writes the equation with a
> Unicode minus (U+2212), which renders identically and compares unequal.
> `tools/checkfacts.mjs` enforces **string identity**, so a Unicode minus copied
> from the pack into either `FACTS_VERIFIED.md` or `catalog.js` — but not both —
> produces a build failure whose diff looks like two identical strings. Keep it
> ASCII in both places.
- **Source:** ASTM D5778-20, *Standard Test Method for Electronic Friction Cone
  and Piezocone Penetration Testing of Soils*, eq. 2 and §7.8.1, via
  `research/06` §A.2.4; Robertson, *Soil Behaviour Type from the CPT: an update*
  `[ROB-SBT]`.
- **Why true — the fact is sourced; the "under-reads in clay" direction is
  inference and is NOT in the line.** What the sources say: `qt = qc + u2(1−an)`
  where `an` is the net area ratio `[D5778]` eq. 2; *"Type 2 (`u2`) piezocones
  are preferred precisely because only `u2` allows the `qt` correction"*
  `[D5778]`; and the correction *"matters in soft fine-grained soils; where `qc`
  > about 1 MPa the difference between `qc` and `qt` is small"* `[ROB-SBT]`.
  A friction cone by definition measures `qc` and `fs` only — the standard's own
  title separates *friction cone* from *piezocone*. So the equation has no `u2`
  term to supply, in exactly the ground where the term is largest.
- **What I deliberately left out.** The brief's phrasing was *"it under-reads in
  clay and cannot tell you it is doing so."* The direction is right for soft
  normally-consolidated clay, where `u2` is positive and `qt > qc`. But `u2` can
  go **negative** in heavily overconsolidated or dilatant clay, where the
  correction runs the other way. Stating the direction unqualified would be a
  new Removed-table entry. The line as written says only that the correction is
  unavailable and that this is where it matters — which is unarguable and is
  the part the player needs.
- 146 characters. At the limit; check it on a 390 px phone before shipping.

---

# TIER 2 — sourced in a local pack that read the primary document

These are the lines I would ship. I did not personally re-open every source, but
each is quoted in a pack with a named document and a section number.

## `rc` — Reverse circulation

### C1 — the method in one line
```
'RC runs a pipe inside a pipe. Air goes down the annulus, the sample comes up the middle, and never touches the wall above the bit.'
```
- **Source:** `research/02` §A2 "The pipe" `[BL-RC]` p.6; corroborated
  independently at `research/03` §A.6.
- **Why true — sourced.** Dual-wall pipe: outer tube, inner tube, circlips and
  O-rings. *"the sample never touches the hole above the bit face, so it cannot
  be contaminated by material sloughing in from higher up."* The sealing chain
  is corroborated by a second catalogue `[MIN-RC]`, which describes the check
  valve and chuck seal-off arrangement that maintains it during rod changes.
- 129 characters.

### C2 — the instrument fact for RC, and the best line in this pack
```
'Lose the seal or let the hole cave and the assay is worthless. The hole still looks perfect.'
```
- **Source:** `research/03` §A.6, near-verbatim: *"The failure mode is
  contamination — lose the seal, or let the hole cave, and the assay is
  worthless even though the hole looks perfect."* KPI corroboration in the same
  section: *"Metres drilled is the contractor's invoice; the mine pays for the
  assay it can trust."*
- **Why true — sourced.** Contamination is a sample-train failure, not a hole
  failure. Every surface indicator a driller has — penetration rate, air
  pressure, returns, hole depth — stays normal.
- 92 characters. This is the RC twin of the brooming pile, and the two of them
  are the strongest argument in this pack that the game's theme is real.

### C3
```
'Below the water table an RC sample turns to slurry. Enough air at the face holds the water back; not enough and you are bagging mud.'
```
- **Source:** `research/02` §A2 "Keeping the sample dry" `[MIN-RC]` p.7 — the
  bleed chuck and chuck sleeve *"help maintain positive air pressure at the bit
  face by holding the outside water head above the chuck sleeve… ensuring that
  collected samples remain dry."*
- **Why true — sourced.** The countermeasure is described, which means the
  failure is real. The pack's game translation is worth carrying into the
  design: crossing the water table in RC is a **sample-quality** event, not the
  "hole erodes" event the existing hazard list has. The existing shipped line
  *"Below the water table the ground is wetter, weaker and quicker to erode"* is
  about the hole; this one is about the bag. They do not conflict.
- 132 characters.

### C4
```
'RC gives you chips, not core. No structure, no orientation, no RQD — you buy cheap metres and you give up the geometry.'
```
- **Source:** `research/02` §A2 "Why RC over DD, and what you lose" — the
  comparison table: sample = chips vs intact cylinder; structure/orientation
  **no**; geotechnical data (RQD) **no**; cost per metre 25–40 % lower.
- **Why true — sourced.** This is the trade the player is actually making, and
  it is the reason `rc` and `core` are two methods and not one.
- 119 characters. The 25–40 % figure is deliberately not in the line — it is
  sourced to a cost-comparison web page, not to a primary document.

### C5 — optional fourth, weaker sourcing on the *reason*
```
'An RC hole is sampled metre by metre. Blow the string clear between intervals or the last one contaminates the next.'
```
- **Source:** `research/02` §A2 "The surface train" `[MIN-RC]` p.13 — the
  blow-back / blow-down system, whose stated purpose includes *"improved sample
  quality"* and *"separated hydraulic and pneumatic systems to prevent
  contamination"*. Sampling interval of 1 m and a 2–3 kg representative split
  are corroborated at `research/02` §C5.
- **Why true — the practice is sourced; the vivid framing is the pack's.** The
  catalogue documents a device for clearing the string and says it improves
  sample quality. It does **not** say "so metre 41 does not carry metre 40's
  rock into the bag" — that sentence is `research/02`'s gloss. Down-hole
  smearing between intervals is standard sampling-theory knowledge, but I have
  no primary citation for it in hand, so the line above states the practice and
  the consequence in general terms only. If you want a fourth RC line, take C5;
  if you want three certain ones, take C1–C4 and drop this.

---

## `longhole` — Production drilling

### L1
```
'Dilution is caused by deviation. A hole that wanders out of the ore blasts waste into your muck.'
```
- **Source:** `research/03` §A.2, quoting the long-hole chapter of a top-hammer
  tooling catalogue `[L-TH]` at its head: *"dilution is primarily caused by
  deviation"*.
- **Why true — sourced.** The mechanism is stated in `research/03` §A.2: a hole
  that wanders misses the ore (dilution), leaves ore standing (ore loss),
  bunches with its neighbour (over-break or dead-pressing), or spreads from it
  (a frozen stope).
- 96 characters. **Note the "primarily" in the source and the flat assertion in
  the line.** If you want to be maximally safe, *"Dilution is mostly caused by
  deviation"* is the honest form and costs nothing.

### L2
```
'In a stope you are not paid for metres. You are paid for holes that land where the ring plan says they land.'
```
- **Source:** `research/03` §A.2 "Crew KPI"; `METHOD_IDS.md` already scores
  `longhole` on toe accuracy → dilution, so this line and the game agree.
- **Why true — sourced.** *"Crew KPI: hole accuracy — collar position, dip,
  azimuth and depth of every hole in the ring… Metres are almost irrelevant. A
  ring is only finished when every hole in it is open, correct and surveyed."*
- 107 characters.

### L3 — the instrument fact for longhole
```
'The driller never sees the rock he is breaking. In a stope the survey is the only feedback you get.'
```
- **Source:** `research/03` §A.2, first paragraph: *"The drill never sees the
  rock it is breaking."* KPI paragraph for the survey half.
- **Why true — first half sourced verbatim; second half is a fair restatement
  of the sourced KPI, but "the only feedback" is my wording.** A driller also
  has torque, penetration rate and whether the hole stayed open. **Safer form,
  and my recommendation:**
  ```
  'The driller never sees the rock he is breaking. A ring is not finished until every hole is open, correct and surveyed.'
  ```
  That version is sourced end to end (both halves are in §A.2) and is 117
  characters.
- 98 characters as first written.

### L4
```
'Longhole rods run 0.9 to 1.8 m, not the 3 to 6 m of a bench. The drive is too small for a long feed.'
```
- **Source:** `research/03` §A.2 `[L-TH]` — longhole rods 915 / 1220 / 1525 /
  1830 mm; bench rods 3050–6095 mm; *"because the drill drive is small and there
  is no room for a long feed."*
- **Why true — sourced, both the numbers and the reason.**
- **What I removed and why.** `research/03` §G.1 proposes *"every joint is a
  chance to wander"* as the tail of this line. That causal claim is standard
  drilling lore and is very probably right, but `[L-TH]` states the rod lengths
  and the reason for them, not a joint-count-to-deviation relationship. Ship the
  geometry; leave the lore out.
- 99 characters.

### L5
```
'The first ring needs a slot raise to break into. With no free face the ring has nowhere to go and the stope freezes.'
```
- **Source:** `research/03` §A.2: *"A slot raise is opened first at one end of
  the stope to give the first ring a free face to break to. Without a slot, the
  first ring has nowhere to go and freezes."*
- **Why true — sourced, and it is also textbook blasting engineering** (`ENG` in
  the existing source key): rock cannot be blasted into a solid; every round
  needs a free face. The existing list already leans on `ENG` for this class of
  claim.
- 115 characters. A frozen stope is named in `research/03` as *"one of the most
  expensive things that can happen to an underground mine"* — a superlative I
  have deliberately kept out of the line.

---

## `driven-pile` — Driven piling

Source throughout: Tomlinson & Woodward, *Pile Design and Construction
Practice*, 5th ed., Taylor & Francis 2008 `[TOM]`, via `research/05` §A1 and §D1
–§D3. Section numbers are Tomlinson's own.

### P1 — the best driven-pile line, and the one the brief named
```
'A good set can be the pile destroying itself. Crushing and brooming at the toe reads as penetration and is not.'
```
- **Source:** `[TOM]` §1.4, quoted verbatim in `research/05` §D1: *"cases have
  occurred where the measured set achieved per blow has been due to the crushing
  and brooming of the pile toe and not to the deeper penetration required to
  reach the bearing stratum."*
- **Why true — sourced, and it is the source's own warning,** given in the same
  breath as *"The temptation to continue hard driving in an attempt to achieve
  an arbitrary set for compliance with some dynamic formula must be resisted."*
- 111 characters.

### P2 — the truth-teller half of P1
```
'Set alone does not prove depth. Read the driving record against the ground investigation before you call the pile home.'
```
- **Source:** `[TOM]` §11.3.1 via `research/05` §D2: *"Compare the driving record
  against the ground investigation data for that layer, and set the termination
  level from that comparison, not from the blow count alone"*; and *"A minimum
  penetration into the bearing stratum is necessary precisely because random
  compact layers cause localised areas of high driving resistance."*
- **Why true — sourced.** Note the nuance `[TOM]` §11.3.1 adds, which is why I
  did **not** write "only depth into the bearing stratum tells the truth": *if*
  the penetration depth was calculated properly for a friction pile, depth into
  the bearing stratum should theoretically be the only criterion and final sets
  should be irrelevant — but **in practice you drive to both** a minimum depth
  and a set, because that is how natural soil variation is absorbed. The brief's
  framing overstates it slightly; this line does not.
- 119 characters. P1 and P2 are a pair and should ship together.

### P3 — the other instrument fact
```
'A pile that walks off line at the head is telling you it is broken below ground, where you cannot see it.'
```
- **Source:** `[TOM]` §11.3.1 via `research/05` §D3: *"alignment deviation at
  the head is treated as an indicator of breakage below ground"*; `[TOM]`
  §3.4.12: *"Driven piles tend to move out of alignment during installation due
  to obstructions in the ground or the tilting of the piling frame leaders."*
- **Why true — sourced.** The inference chain is the source's, not mine: drive
  onto an obstruction, the pile bananas, the toe brooms, and the only surface
  symptom is the head going off plumb.
- 105 characters.

### P4 — the purchase decision
```
'To save a pile, cut the drop and use a heavier hammer. It is the height of the fall that sets the stress, not the number of blows.'
```
- **Source:** `[TOM]` §1.4 and §7.3 via `research/05` §D1: *"Damage to a pile
  can be minimized by reducing as far as possible the number of hammer blows…
  and also by limiting the height of drop of the hammer to 1.5 m. This
  necessitates the use of a heavy hammer"*; and *"The magnitude of the stress
  wave depends mainly on the height of drop; the weight of the hammer governs
  the length of the wave."*
- **Why true — sourced.** Both clauses are in `[TOM]` §7.3. The rule of thumb
  that follows — hammer at least equal to pile weight for hard driving, half for
  easy — is also sourced (§1.4) and would make a good second line if you want a
  fifth.
- 130 characters.

### P5 — the apprentice line
```
'The helmet must never be tight on the pile head. It has to let the pile turn when it hits something.'
```
- **Source:** `[TOM]` §3.1.8 via `research/05` §A1: *"The helmet must NOT fit
  tightly on the pile head — it has to allow the pile to rotate when it strikes
  an obstruction."*
- **Why true — sourced, both halves.** This is the kind of small, checkable,
  counter-intuitive thing that reads as authentic: everything else in the stack
  is about tightness, and this one part must be loose.
- 100 characters.

### P6 — buy the instrument, unlock the hammer
```
'Monitor your driving stresses and the code lets you drive harder: ten percent more in concrete, twenty in steel.'
```
- **Source:** EN 12699 as tabulated in `[TOM]` Table 2.4, via `research/05` §A1:
  concrete driving stress ≤ 0.8 fck *"with a 10 % increase permitted if driving
  stresses are monitored"*; steel ≤ 0.9 fy, *"with a 20 % increase if stresses
  are monitored"*.
- **Why true — sourced.** And it is a real progression mechanic rather than a
  flavour line: instrumentation buys capability, which is precisely the game's
  theme pointed the other way round.
- 111 characters.

---

## `site-investigation` — SPT, CPT, sampling class

Sources: ASTM D1586/D1586M-18 `[D1586]`, ASTM D5778-20 `[D5778]`, Robertson
`[ROB-SBT]`, Baldwin & Gosling in *Ground Engineering* Aug 2009 `[GE-2009]`, all
via `research/06` §A.1, §A.2, §A.4. The `research/06` appendix already drafted
most of these; where I changed the wording I say so.

### S2
```
'An SPT is a test, not a bit. A 63.5 kg hammer falls 760 mm and you count blows. Nothing cuts.'
```
- **Source:** `[D1586]` scope; ISO 22476-3 gives 63.5 ± 0.5 kg and 760 ± 10 mm.
- **Why true — sourced.** Worth knowing and not putting in the line: ASTM says
  750 mm and ISO says 760 mm, and that is a rounding of 30 inches, not a
  disagreement (`research/06` §A.1.1). The line uses the ISO figure because the
  game is metric and European.
- 93 characters. Unchanged from `research/06`'s appendix.

### S3
```
'N is the blows for the last 300 mm. The first 150 mm is the seating drive and it is thrown away.'
```
- **Source:** `[D1586]` — total drive 450 mm; seating drive 150 mm discarded as
  fall-in and disturbed base material; N is the sum over the remaining 300 mm.
- **Why true — sourced.** `research/06` §A.1.3 notes ASTM logs three 150 mm
  increments and BS/EN ISO 22476-3 logs six 75 mm ones; N is the same number
  either way, so the line is true under both conventions.
- 96 characters. Unchanged from `research/06`'s appendix.

### S4 — the counter-intuitive one
```
'A split-spoon sample is quality class 4. Good enough to log and classify, useless for strength or stiffness.'
```
- **Source:** `[GE-2009]` Table 2/3, reproducing the EN 1997-2 / EN ISO 22475-1
  class table: SPT split spoon (S-SPT, 35 mm × 450 mm) is sampling category B,
  quality class 4. Strength and stiffness need class 1. Corroborated by the
  area ratio: an SPT sampler is about 110 %, against ≤ 10 % for "undisturbed"
  `[SPT-NOTES]`.
- **Why true — sourced.** `research/06` §A.4.2 draws the conclusion the line
  carries: *"The most famous test in geotechnics returns one of the worst
  samples on the list. It is a test, and its sample is change from the
  transaction."*
- 107 characters. I rewrote `research/06`'s two proposed lines into this one
  because "every one of them is a disturbed sample" and the class-1 line say the
  same thing twice.

### S5 — the instrument fact for SPT
```
'The shallowest tests are the least reliable. Below three metres of rod the SPT energy correction drops to 0.75.'
```
- **Source:** `[SPT-CORR]` correction-factor table via `research/06` §A.1.5:
  rod-length factor CR = 0.75 below 3 m, 0.80 at 3–4 m, 0.85 at 4–6 m, 0.95 at
  6–10 m, 1.00 above 10 m.
- **Why true — sourced.** And the sting is the source's own: *"the shallowest
  tests — the ones a foundation actually sits on — are the least reliable."*
- 110 characters. **Terminology check before shipping:** CR is the **rod-length**
  correction, not the energy correction (that is Ce). My line says "energy
  correction", which is loose — CR is one of the factors in the N60 energy
  normalisation, so it is not wrong, but it is imprecise in exactly the way this
  project punishes. **Ship this instead:**
  ```
  'The shallowest tests are the least reliable. Below three metres of rod the SPT rod-length correction drops to 0.75.'
  ```
  115 characters.

### S6
```
'A cone is pushed at twenty millimetres a second and never turns. No hole, no cuttings, no sample — you never see the ground.'
```
- **Source:** `[D5778]` §12.1.2 (20 ± 5 mm/s held for the whole stroke) and
  §5.3 (*"no soil samples are obtained"*).
- **Why true — sourced.** `research/06` §A.2.1 calls this *"the whole bargain of
  CPT — continuous, repeatable, fast, and you never see the ground."*
- 124 characters.

### S7
```
'The cone reads soil behaviour, not grain size. A lab can call it silty sand and the cone can still call it clay.'
```
- **Source:** Robertson, *Soil Behaviour Type from the CPT: an update*
  `[ROB-SBT]` — https://www.cpt-robertson.com/PublicationsPDF/2-56%20RobSBT.pdf
- **Why true — sourced.** `[ROB-SBT]` is explicit that the cone responds to
  in-situ mechanical behaviour, not to classification criteria based on grain
  size and plasticity measured on disturbed samples; *"A soil that a lab calls
  'silty sand' can plot as clay if its fines are plastic."* This is not an error
  in either instrument — it is two different questions.
- 112 characters.

### S8 — sonic, and it belongs to `site-investigation` as much as to `sonic`
```
'Sonic recovers everything, in order. That is not the same as recovering it undisturbed.'
```
- **Source:** `[GE-2009]` via `research/06` §A.4.2: resonance drilling is
  sampling category C, quality class 4 in cohesive ground and class 5 in
  non-cohesive; UK trials *"indicated samples exhibiting significant disturbance
  with margins dried by the heat generated during drilling."* The recovery half
  is `[SONIC-SI]` and `research/06` §A.6.
- **Why true — sourced, both halves, from two independent directions.** And
  `research/06` §A.4.2 says the quiet part: *"The game should carry both facts,
  because a real geologist would."* Note that it does not contradict the
  existing shipped sonic line — continuous complete recovery and undisturbed
  recovery are different virtues.
- 87 characters.

---

## Commodities

Source: `research/08-commodities.md`, which sourced every figure by direct
retrieval from USGS Mineral Deposit Models and SEC-filed S-K 1300 / NI 43-101
technical reports. **`PLATFORM_TRUTH.md` Part C rule 7 checked on every line:**
gold, silver, copper and zinc are `sourced: true`; coal, iron, lithium and
diamonds are not, and **no line below touches those four.**

### M1 — the best commodity line
```
'In a porphyry, the enriched blanket above the primary ore is the richer of the two. The best grades are not the deepest.'
```
- **Source:** USGS SIR 2010-5070-B via `research/08` §3a: the enriched chalcocite
  blanket is *"invariably higher grade than the hypogene ore beneath it"*.
- **Why true — sourced.** Supergene enrichment concentrates copper by leaching
  it from the capping and reprecipitating it at the water table. Copper is a
  `sourced: true` commodity, but note that **this line prints no grade number**
  and does not need to — it states the relationship, which is the decision.
- 120 characters. This teaches the player when to stop and log carefully rather
  than push deeper, which is a real decision in the game's own model.

### M2 — the method decision, in the operator's own words
```
'Drill the barren cover with RC and switch to core just above the mineralisation. Cheap metres where they do not matter.'
```
- **Source:** `research/08` §3a, quoting a large operator's own technical report
  verbatim: *"using RC to drill through barren overburden and switching to DDH
  shortly above mineralised rock."* Listed again at §4 as cross-cutting driver 1.
- **Why true — sourced.** This is the single most game-usable sentence in the
  commodities pack: it is a two-method decision with a cost axis and a
  consequence, made by real operators for a stated reason.
- 118 characters.

### M3 — the instrument fact for commodities
```
'Gold hides in the coarse tail. Only a few percent of the particles are over a hundred microns, and those few are what bias an RC split.'
```
- **Source:** `research/08` §1a — at one named orogenic deposit, 50 % of gold
  particles are < 30 µm and about 3 % are > 100 µm; §4 cross-cutting rule 9:
  *"Nugget risk scales with gold particle size — the > 100 µm tail is what
  biases an RC split."*
- **Why true — sourced.** The particle-size distribution is from the operator's
  technical report. The bias mechanism is sampling theory and is stated by the
  pack. Gold is `sourced: true`, and again **the line prints no grade.**
- 134 characters. "A few percent" is deliberately vague rather than "3 %",
  because 3 % is one deposit's number and the line is a general claim.

### M4
```
'A narrow steep vein needs core. Chips cannot give you true width or vein texture, and that is what the estimate is built on.'
```
- **Source:** `research/08` §1b, USGS SIR 2010-5070-Q: mined vein widths under
  1 m to 3 m for low-sulphidation epithermal; *"Core over RC because narrow
  (<1–3 m) steeply-dipping targets need true width and vein-texture logging —
  crustiform, colloform and ginguro banding — which RC cannot resolve at
  centimetre scale."*
- **Why true — sourced.** Pairs with C4 and M2 as the third leg of the
  RC-versus-core decision.
- 124 characters.

### M5 — optional fifth
```
'Confidence is bought with spacing, not depth. Five by ten metres is measured; forty by forty is inferred.'
```
- **Source:** `research/08` §1a drill spacing ladder: Measured 5 × 10 m →
  Indicated 20 × 20 m → Inferred 40 × 40 m.
- **Why true — sourced as a worked example, not as a universal rule.** The
  ladder is from one deposit type's practice. Category definitions under JORC
  and NI 43-101 are qualitative and set by the Competent Person, not by a
  spacing table. **The line as written states a rule.** If you ship it, scope it:
  ```
  'Confidence is bought with spacing, not depth. On a lode gold deposit, five by ten metres is measured and forty by forty is inferred.'
  ```
  132 characters, and honest. **My recommendation: ship the scoped version or
  skip it.**

### M6 — optional sixth
```
'Silicified ore can run past 250 MPa with altered rock beside it under 50. That alternation is what loses core and eats bits.'
```
- **Source:** `research/08` §1b: *"silicified sinter and vuggy quartz are R6
  (>250 MPa) while the enclosing argillic-altered tuff collapses to R2–R3
  (5–50 MPa) — very abrupt hard/soft alternation causing core loss and bit
  wear."* Hoek strength classes; UCS in MPa per the unit rule.
- **Why true — sourced,** including the consequence.
- 124 characters. It also connects the commodity model to the existing shipped
  ground lines, which are all about how ground behaves rather than what is in it.

---

## The three carry-over items named in the brief

### X1 — sonic thread handedness
```
'Sonic rod and core barrel are right-hand. The override casing around them is left-hand.'
```
- **Source:** `research/13-string-elements.md` §2.4, citing three independent
  vendor catalogues: one footnotes *"Drill rod, core barrels and related
  accessories are designed with right hand threads"* and *"Casing and related
  accessories are designed with left hand threads"*; a second heads its tables
  "RH Thread" for rods and barrels and "LH thread" for casing; a third encodes
  the handedness in the connection designation itself.
- **Why true — the fact is sourced three ways. The reason is NOT sourced and is
  not in the line.** `research/13` is explicit about this: *"the reason usually
  given — that turning one string cannot then unscrew the other — is a
  reasonable inference and is not stated in any of the three catalogues. Ship
  the fact, not the explanation."* I have shipped the fact.
- **Consistency check with the existing list.** The shipped line *"Casing threads
  are usually left hand, so advancing the casing cannot unscrew the joints"*
  already gives that explanation for casing generally. X1 does not repeat it,
  and does not contradict it — it just names sonic's specific arrangement.
- 87 characters.

### X2 — the auger joint
```
'An auger joint is a hex pin with a drive pin through it, not a thread. That is why it cannot unscrew when you back out.'
```
- **Source:** `research/13` §1.4, citing a manufacturer's hollow-stem drive
  system page: hex pin couplings welded to the top of the auger tube, drive pins
  connecting the sections, and — the load-bearing sentence — hex-and-pin joints
  *"will not unscrew during reverse rotation"*.
- **Why true — the fact AND the reason are both sourced.** This is the one of
  the three where the explanation is in the source rather than inferred, so the
  line may carry it. The game's `threadFamily: 'hex/quick-pin'` on `auger`
  already agrees.
- 118 characters.

### X3 — the friction cone
See **S1** in Tier 1 above. It is the only one of the three I could verify
against the standard's own equation, so it sits in Tier 1.

---

# TIER 3 — my recommendation is to cut these

Listed with the reason, so the next pass does not have to rediscover it.

| Candidate | Why I am cutting it |
|---|---|
| *"Over 25 m of longhole, more than 2 % deviation buys you bad fragmentation, dilution, or a stope that will not break."* (`research/03` §G.1) | The 2 % figure comes from a **vendor blog, via a search summary** — `research/03` labels it `[W-AIVYTER, via search summary]` and §H gap 5 records that the ring-design literature behind it was paywalled. A specific numeric threshold is exactly the kind of claim a real longhole driller will check. **L1 says the same thing without the number.** |
| *"The first bolt, every tenth bolt and the last bolt of the shift get torque tested."* (`research/03` §G.1) | **Wrong as written and cited to a page that does not contain it.** See Correction 2 above. |
| *"Bolt holes must be at least 50 mm deeper than the bolt, and straight. A crooked hole costs you capacity."* (`research/03` §G.1) | **The second half is backwards.** See Correction 1. The first half is fine and is folded into R1's neighbourhood if you want it as its own line: *"Drill a friction bolt hole at least fifty millimetres longer than the bolt."* |
| *"Suspect a misfire and you wait. Fifteen minutes for most detonators, thirty for safety fuse or electronic."* (`research/03` §G.1) | **I verified the numbers and they are right** — 30 CFR § 57.6310: 30 minutes for safety fuse and blasting caps, 15 minutes for any other detonator type, 30 minutes for electronic detonators or the manufacturer's time, whichever is longer (https://www.law.cornell.edu/cfr/text/30/57.6310). **But they are US federal numbers**, the game is priced in EUR and set in Europe, and re-entry times are set jurisdictionally. Shipping them unscoped states a local rule as a universal one. Ship only if you scope it, and if you do, note the line is about a *suspected* misfire. |
| Resin-bolt install quality — *"the wrong number of cartridges, too little spin, or spinning after the resin has gelled gives you a bolt that looks installed and holds nothing."* | This is `research/03` §A.4's own sentence, not a quotation from `[W-EMJ]`. It is very likely true and it is a beautiful instrument-lies line — the resin twin of R2 — but **I have no primary citation in hand.** Worth a targeted fetch of a ground-control publication next pass; do not ship on the pack's authority alone. |
| The look-out numeric rule — *"10 cm plus 3 cm per metre of hole depth."* | `research/04`'s own citation-honesty note says this came from a search summary over `[NTNU-BD]` that could not be opened. **T3 ships the concept without the number.** |
| Anything using a **coal, iron, lithium or diamond grade**. | `PLATFORM_TRUTH.md` Part C rule 7. Not proposed, listed here so the constraint is visible in this file too. |
| Anything using a **Cerchar abrasivity value**. | `research/08` §4: unsourced throughout; abrasivity is proxied on quartz content. Not proposed. |

---

# If you only ship twelve

Ranked. These are the ones I would put my name on, in order:

1. **C2** — RC: the assay is worthless and the hole looks perfect.
2. **P1** — driven pile: a good set can be the pile destroying itself.
3. **R2** — rockbolt: shine a light down the tube.
4. **P2** — driven pile: set alone does not prove depth.
5. **S8** — sonic: recovers everything, in order, but not undisturbed.
6. **T1** — jumbo: a round never pulls the full depth you drilled.
7. **P3** — driven pile: a pile off line at the head is broken below ground.
8. **R1** — rockbolt: oversize hole, steel tube that holds nothing.
9. **S7** — CPT: soil behaviour, not grain size.
10. **M1** — porphyry: the enriched blanket is richer than the ore beneath.
11. **L1** — longhole: dilution is caused by deviation.
12. **T2** — jumbo: a good round leaves the half-barrels on the wall.

That set covers five of the six new methods plus commodities, and seven of the
twelve are facts about an instrument or an indicator that lies — which is the
game's theme, told by the field rather than by the game.

The six that get a method to three lines each, in priority order after that:
**S2** (SPT is a test, not a bit), **C1** (pipe inside a pipe), **R4**
(competent rock is least forgiving on bit size), **L2** (paid for holes, not
metres), **T5** (bad ground shortens the round), **M2** (RC the cover, core the
ore).

---

# Sources added by this pack

Add these to `FACTS_VERIFIED.md`'s source key if the lines are adopted. The
first four I opened and read in this pass.

| Key | Source |
|---|---|
| `SPLITSET` | Rocscience, *Factors Influencing the Effectiveness of Split Set Friction Stabilizer Bolts* — https://www.rocscience.com/assets/resources/learning/papers/Factors-Influencing-the-Effectiveness-of-Split-Set-Friction-Stabilizer-Bolts.pdf — over 900 pull tests from ~50 North American mines |
| `NFF14` | Norwegian Tunnelling Society, *Publication No. 14 — Norwegian Tunnelling*, §7.4 — https://nff.no/wp-content/uploads/sites/2/2020/04/Publication-14.pdf |
| `CFR1926800` | 29 CFR § 1926.800(o), *Underground construction — ground support* — https://www.law.cornell.edu/cfr/text/29/1926.800 |
| `CFR576310` | 30 CFR § 57.6310, *Misfire waiting period* — https://www.law.cornell.edu/cfr/text/30/57.6310 (cited only in Tier 3) |
| `D1586` | ASTM D1586/D1586M-18, *Standard Penetration Test and Split-Barrel Sampling of Soils* |
| `D5778` | ASTM D5778-20, *Electronic Friction Cone and Piezocone Penetration Testing of Soils* |
| `ROB-SBT` | Robertson, *Soil Behaviour Type from the CPT: an update* — https://www.cpt-robertson.com/PublicationsPDF/2-56%20RobSBT.pdf |
| `GE-2009` | Baldwin & Gosling, *BS EN ISO 22475-1: Implications for geotechnical sampling in the UK*, **Ground Engineering**, Aug 2009 |
| `NFF19` | Norwegian Tunnelling Society, *Publication No. 19 — Rock Support in Norwegian Tunnelling*, §4.3.1 |
| `TOM` | Tomlinson & Woodward, *Pile Design and Construction Practice*, 5th ed., Taylor & Francis 2008 |
| `USGS-PORPH` | USGS SIR 2010-5070-B, porphyry copper deposit model (via `research/08` §3a) |
| `USGS-EPI` | USGS SIR 2010-5070-Q, epithermal gold-silver deposit model (via `research/08` §1b) |

---

*Compiled 2026-09-04. Research only. No file under `src/` was modified, and
neither `FACTS_VERIFIED.md` nor `src/ui/screens/catalog.js` was touched.*

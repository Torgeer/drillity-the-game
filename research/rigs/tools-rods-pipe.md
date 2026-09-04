# tools-rods-pipe — Drill rods, drill pipe, shank adapters, couplings, thread systems

**status: in progress** (written early per workflow rule; findings appended as sources are read)

Engineering reference for modelling. Every figure below is cited to a file + page or a URL.
Where a number is not sourced it is listed in §8 NOT SOURCED, never invented.

> **NAMING RULE (DOMAIN.md §10).** Everything here is GEOMETRY and MATERIAL research.
> The manufacturer names and model designations quoted below (Epiroc, Sandvik, Mincon,
> Eurodrill, Boart, Atlas Copco, Numa, Halco, TEI, Bauer, Klemm, etc.) exist in this
> document ONLY to cite the source of a dimension. **Do not put any of them on a mesh,
> a decal, a badge, a rolled-in pipe stencil or an item name in the game.** Rope-thread
> family codes (R32, T38, T45, T51, GT60), API pin/box sizes (2 3/8" REG, 3 1/2" REG),
> wireline letter sizes (BQ/NQ/HQ/PQ) and API pipe grades (E75, X95, G105, S135) are
> *industry standards*, not trademarks, and are safe to show stencilled or stamped.

---

## 1. Sources read

| File | Pages | What it actually showed |
|---|---|---|
| `C:\Users\henri\Downloads\114-3mm_Drill-Rod-Pin-End_3-Start-Cylindrical-RH_L200.pdf` | 1–2 (all) | **The single most valuable source in the whole set.** A full dimensioned axial section of a 114.3 mm drill-rod PIN END, plus a complete z-vs-diameter profile table explicitly headed "re-model the part directly from this". Gives thread major/minor, lead, starts, hand, profile radius, nose, chamfer, weld-on spigot. Reconstructed from photo IMG_7906. |

---

### 1.1 — MEASURED GEOMETRY: 114.3 mm drill-rod pin end (the money source)

Source: `114-3mm_Drill-Rod-Pin-End_3-Start-Cylindrical-RH_L200.pdf` p.1 (section A–A) and p.2
(§1 dimension schedule, §2 connection data, §4 reconstructed profile). Original German
annotation `114,3 zyl rechts 3gg / R4 Steigung 33,87`. All mm.

**Profile — lathe this literally (z measured from the LEFT / weld end face):**

| z (outer) | Outer Ø | | z (bore) | Bore Ø |
|---|---|---|---|---|
| 0 | 114.3 | | 0 | 89.3 |
| 27 | 114.3 | | 25 | 89.3 |
| 27 | 116 | | 27 | 88 |
| 73 | 116 | | 200 | 88 |
| 73 | 103 (thread crest) | | | |
| 172.5 | 103 | | | |
| 175 | 98 (plain guide nose) | | | |
| 199 | 98 | | | |
| 200 | 96 (1 mm end chamfer) | | | |

**Thread data (p.2 §2):**
- Cylindrical / **parallel**, NOT tapered. This matters — the game's `threadGeometry()`
  sweeps a constant-radius helix, which is correct for THIS thread, and would be wrong
  for an API tapered pin.
- **Right-hand, 3-START.** Lead (Steigung) 33.87 mm = 3 × 11.29 mm pitch. A 3-start
  thread shows **three** helices running side by side — visually three times as coarse
  as the pitch alone suggests. The game draws a single-start helix everywhere.
- Round "rope" profile, **R4** = 4 mm crest/root radius, i.e. a full-round tooth, not a V.
- Major (crest) Ø103 −0.2; minor (root) Ø99 −0.2. **Radial thread depth = (103−99)/2 = 2.0 mm.**
  Ratio: depth / major = 2.0/103 ≈ 0.019. Very shallow relative to the tube — a rope
  thread on a big rod is a shallow rounded corduroy, not a deep screw.
- Threaded length 73 → 172.5 = **99.5 mm**, i.e. ≈ 2.94 leads / ≈ 8.8 pitches.
  Threaded-length : major-dia ratio ≈ 0.97 : 1.
- Thread ends at z=172.5 in a **2.5 × 45°** chamfer down to the plain Ø98 nose.

**Key modelling ratios from this drawing:**
- Tube wall on the body: (116 − 88)/2 = **14 mm** wall.
- The pin's threaded crest (Ø103) is *smaller* than the body OD (Ø116) — the pin is a
  **reduced-diameter spigot**, so a made-up joint has a visible shoulder step, not a
  flush cylinder. Crest/body = 103/116 = 0.888.
- The Ø114.3 × 27 mm section at z 0–27 is a **weld-on spigot**: this pin end is a
  separate forging welded to a 114.3 mm tube. Expect a **circumferential weld bead at
  z≈27** on the finished rod, where the OD steps 114.3 → 116.
- Plain guide nose Ø98 × 25 mm ahead of the thread — it stabs and aligns before any
  thread engages. **The game has no guide nose on any rod.**

---

_(more sources appended below as read)_

## 2. What the tool family IS

## 3. Proportions — real dimensions with source

## 4. Component inventory

## 5. Distinctive features (thumbnail silhouette test)

## 6. Materials, paint and wear

## 7. Photo references

## 8. NOT SOURCED

## 9. Domain-truth warnings — what the game currently gets wrong

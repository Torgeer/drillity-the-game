# tools-bits-carbide — Rock bits and carbide

**Engineering reference for 3D modelling. GEOMETRY AND MATERIALS ONLY.**
status: in progress

> **NAMING RULE (DOMAIN.md §10).** Everything below cites real manufacturer
> catalogues because that is where the real geometry is. The game must NOT use
> any real manufacturer name or model designation as a product name, and the
> modeller must NOT model a manufacturer badge, logo, laser-etched brand, or
> stamped model code onto a bit face or shank. Model the *shape*; the stamping
> on a real bit crown becomes a generic size/serial ring in-game.

### Already covered by the existing research packs — do not re-derive
`research/12-oem-rock-tooling.md` is the parent document for this subject and it
is good. It already carries, sourced:
- **§B.2** top-hammer thread families (R/T/H/IB/C), *"the number IS the nominal
  thread diameter in millimetres"*, and thread -> hole-diameter ranges.
- **§B.4** DTH shank families (DHD / QL / SD / Mission / Numa / COP M / TD) and
  **spline count as the visible proof of family — 6, 8, 10, 12, 16.**
- **§B.5** the four independent button axes (shape, position, face profile,
  skirt) — reproduced and extended below because it is pure geometry.
- **§B.7** API REG / IF / FH / NC rotary connections.
- **§B.8** the BETEK carbide grade table (WC:Co, grain, density, HV10).
- **§B.9** the never-interchange list.
`research/16-site-archetypes.md` is about sites, not tooling — nothing here.
This file does **not** repeat the fit logic. It adds what pack 12 did not need:
**where the metal actually is**, in millimetres, for a modeller.

---

## 1. Sources read

| File | Pages / where | What it actually showed |
|---|---|---|
| `Downloads\9866 0401 01 Epiroc DTH drill bits brochure_A4 webb.pdf` | whole, text layer | **Useful for face-profile vocabulary and size band.** Names the DTH face shapes as catalogue options — **FLAT FRONT, SUPER FLAT FRONT, CONVEX, CONVEX/CONCAVE** — against diameters **152, 154, 156, 159, 165, 168, 171, 178, 191, 203 mm**, all on one shank size (QL 60). Shank sizes offered across the range: **TD 40, QL 50, QL 60.** Two carbide grades per size (a harder one and a tougher one), and a button-type column that is either *SPHERICAL* or a proprietary intermediate shape. Mostly marketing prose; the size/face/shank matrix is the value. |
| `Downloads\BETEK_Katalog_Tungsten_carbide.pdf` | grade tables | Carbide grade physics — **cobalt fraction and grain size are the only two variables.** Mined into pack 12 §B.8; re-read here for button/insert *shape* drawings. |
| `research/12-oem-rock-tooling.md` | §B.5, §B.8 | Button shape/position/face/skirt axes; **gauge buttons set at 35 deg, inner buttons at 20 deg; button diameters 10, 12, 16, 19 mm**; HD = larger gauge buttons, DGR = double gauge row (8 inch and up). |

_(table continues as I read — appended below)_

---

## 5. Distinctive features (working list)

**Button bit vs DTH bit vs tricone vs PDC at thumbnail size — four silhouettes**

1. **Top-hammer button bit** — a *short* cylinder, roughly **as long as it is
   wide**, with a **female thread up the bore** (it screws onto the rod, so the
   top end is an open hole, not a pin). Flushing flutes cut down the outside of
   the skirt. Nothing else on it.
2. **DTH bit** — the same crown but on a **long splined shank**; total length
   **around 2x the diameter**. The shank is the giveaway: straight external
   splines and a retaining-ring groove, and **no thread anywhere on the bit at
   all** (pack 12 §B.9 item 8).
3. **Tricone** — three legs welded into a body, three cones on offset journals,
   an **API REG pin pointing up**. The only one of the four with moving parts.
4. **PDC / drag** — fixed blades spiralling off a solid body, black
   **disc-shaped** cutters lying on the leading edge of each blade, deep junk
   slots between. No cones, no buttons standing proud.

**The single most reliable tell in a thumbnail: what stands proud of the face.**
Button/DTH = **hemispheres or points**, light grey, standing 40-60 % of their
diameter out of the steel. PDC = **flat black circles lying flush along a blade
edge**. Tricone insert = hemispheres too, but arranged in *rows around cones*,
not on a flat face.

## 2. What the machine IS

## 3. Proportions

## 4. Component inventory

## 5. Distinctive features

## 6. Materials and paint

## 7. Photo references

## 8. NOT SOURCED

## 9. Domain-truth warnings

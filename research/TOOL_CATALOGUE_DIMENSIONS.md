# T45 catalogue diameter provenance

Verified 2026-09-06 against baseline `1b913e8b24011c90e42001fe1ff6dfc4660cc13b`.
This change supplies nominal bit diameter to the existing procedural geometry
consumer. It does not replace or retune wear geometry.

## Primary evidence

The existing local **Sandvik Construction, Top hammer drilling tools**
catalogue, `C:/Users/henri/Downloads/top-hammer-drilling-tools-broshure-english.pdf`,
has 112 pages. Printed page **53** (PDF page 53, zero-based index 52) is headed
**Bench drilling / T45**. Its bit illustrations dimension the crown across `D`;
the adjacent table labels that quantity **Dimensions D / mm**.

| Game item | Added field | Table evidence, page 53 |
|---|---|---|
| `bit-th-t45-76-std` | `diameterMm: 76` | Retrac rows `7515-4876-S48` and `7515-4876-R48`: D = 76 mm |
| `bit-th-t45-89-hd` | `diameterMm: 89` | Regular-skirt rows `7515-1889-S48` / `-R48`, and Retrac rows `7515-4889-S48` / `-R48`: D = 89 mm |

The page was text-extracted with pypdf and visually checked after rendering with
Poppler at 140 dpi. Source PDF SHA-256:
`2ae8cd3117201200b2ff50b50cea2525e4af72cef172c4e15e1cc754ee894c01`.

The manufacturer-hosted [Sandvik Top Hammer Rock Drilling Tools, 2022 digital
version Q4](https://www.rocktechnology.sandvik/globalassets/products/rock-tools/pdf/top-hammer-catalog-digital-version-eng-q4-2022.pdf)
independently lists these nominal T45 diameters on printed pages **47-48**
(PDF spreads 24-25). Its text also identifies the T45 76 mm Retrac and T45 89 mm
button-bit entries in the product index. The online screenshot request failed;
the visual verification above used the existing local catalogue.

These sources establish nominal bit diameter only. The game's `HD` label,
carbide grade, service life and geometry details are not validated by this narrow
change. No dimensions were inferred from game item IDs or names, and no real
maker or part number was added to player-facing fields.

## Consumer and scope

`src/core/preview.js` passes `item.diameterMm ?? item.holeDia ??
item.stats?.diameterMm` to `buildTool` as `diameterMm`. Both items previously omitted
all three fields, making their catalogue calls use the same diameter default.
The added top-level field matches this existing consumer. Explicit builder
arguments and alias defaults are tested separately by the tool-geometry task.

Only these two item records were changed. The four neighbouring top-hammer bit
records also omit explicit diameter fields; this is an observed data gap, not a
claim that their produced geometry has been verified here. Their source mapping
and consumer impact remain a separate audit.

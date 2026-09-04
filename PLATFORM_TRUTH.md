# Ground truth — Drillity iMarket & Drillity Talent

**This file, plus `DOMAIN.md`, is the authority for every user-visible string in
the game.** It supersedes any part-number lists: the game is a Drillity game, so
it is built on the two Drillity platforms, not on any single supplier's
catalogue.

Sources (all Drillity-owned):
- `drillity-imarket-platform-guide.pdf` (July 2026, "every claim verified
  against the production codebase and database")
- `drillity-imarket-briefing.pdf`
- `Drillity_Taxonomy_v5.3.pdf` (45 families / 285 subcategories)
- `Drillity-Talent-Marketing-Orientation.pdf`
- repos `drillity-i-market` and `drillity-mobile-magic` (Talent)

> ⚠️ **Both PDFs are marked INTERNAL.** Use their *vocabulary, structure and
> data model*. **Never** put internal business figures in the game: no listing
> counts, no registered-company counts, no subscription prices, no partner or
> seller names, no revenue mechanics, no "accuracy notes" caveats. Those are
> Drillity's internal calibration numbers, not game content.

---

## PART A — Drillity iMarket (→ the in-game shop)

### What iMarket is
The drilling industry's B2B marketplace for rigs, machinery, tooling and parts.
Buyers use it free; sellers subscribe. **Zero commission — sellers keep 100% of
their deals.** EU-hosted, GDPR-compliant. Six UI languages: English, German,
Swedish, French, Spanish, Portuguese.

Positioning line (Drillity's own): *"built by people who know a shank adapter
from a drift bit."*

### The transaction model — use these as the shop's real mechanics
| Concept | What it is | How the game should use it |
|---|---|---|
| **Listing** | One piece of equipment for sale, in exactly one subcategory | Every shop item is a listing |
| **RFQ / Request** | Buyer posts a request → matching sellers are notified → sellers submit quotes → buyer compares and accepts | Player posts an RFQ for a tool they can't find; quotes arrive over time at varying prices/lead times |
| **Bid** | Buyer bids on a listing; seller accepts. Bids auto-expire | Haggle mechanic with an expiry timer |
| **Order** | An accepted deal. Shipping is arranged; settlement is between the parties | Delivery lead time before the tool is usable |
| **Saved search / alert** | Watch for matching stock | "Notify me when a Ø140 crown appears" |
| **Company storefront** | Seller profile with trust score and verified badge | Vendors the player builds a relationship with |
| **Map view** | Geocoded equipment locations | Shipping distance affects lead time and cost |
| **Messaging** | Buyer↔seller conversation attached to a listing | Vendor dialogue |

**Condition** is a real listing facet: `New` · `Used` · `Refurbished` ·
`For parts / repair`. Used gear should genuinely be the budget path with real
risk. **Listing type** is also a facet: `Machine / Rig` · `Attachment Tool` ·
`Consumable` · `Spare Part` · `Service / Rental`.

**Listing capacity is split into heavy-equipment and parts/consumables** — mirror
that split in the shop's information architecture.

### The catalog intelligence layer (great flavour, all real)
Every imported listing passes a seven-stage pipeline before publication:
**Mapper → Classifier → Validator → Challenger → Arbiter → Auditor → Publisher.**
Plus: OEM cross-references (one brand's part number surfaces compatible
alternatives), multilingual search over 7,700+ curated industry terms, and
semantic embeddings for meaning-based matching.
*Good in-game use:* an "AI cross-reference" upgrade that reveals cheaper
equivalent parts from other manufacturers.

### Taxonomy
7 super-groups → 45 families → 285 subcategories. A product sits in **exactly
one** subcategory; everything else (thread, material, size, duty, soil class,
fits-rig brand) is a **filterable attribute**, not a category. The shop must
respect this: browse by category, filter by attribute. See `DOMAIN.md` §3–§5.

---

## PART B — Drillity Talent (→ the in-game career)

### What Talent is
The specialist career platform for the skilled, certified, **rotation-based**
workforce in energy, construction and mining. Free forever for workers;
companies pay to advertise roles. Built around how these industries actually
hire — not how a generic job board thinks they do.

Three sectors: **Energy** (offshore & onshore oil & gas, geothermal, wind —
drilling, well control, subsea) · **Construction** (foundation & piling,
geotechnical, tunnelling, heavy civil) · **Mining** (exploration, extraction,
plant & heavy equipment operation).

### The domain-native fields — these ARE the career screen
Drillity models these as first-class, matchable fields where generic boards
have free text or nothing. The game's career system should use exactly these:

- **Rig type**: Jackup · Semi-submersible · Drillship · Platform rig · Land rig
  · Tender-assisted · Barge rig
- **Rig class**: Standard · High-spec / harsh environment · Ultra-deepwater ·
  HPHT
- **Rotation pattern**: 14/14 · 21/21 · 28/28 · 4/4 · 5/2 (onshore week) · 6/3
  · Ad hoc / call-out · Staff / residential
- **Water depth**: shallow (<150 m) · midwater (150–1500 m) · deepwater
  (1500–3000 m) · ultra-deepwater (>3000 m)
- **Day rate** — compensation is a day rate, *not* a salary. Currencies: EUR,
  USD, GBP, NOK, AUD.
- **Live certifications with expiry** — and the rule that matters:
  **expired = cannot mobilise.** This is the single best game mechanic in the
  whole platform: let certs lapse and high-value contracts lock out.
- **Passport / visa readiness** — decides the shortlist for international work.

### Certifications (real, expiry-tracked)
OGUK Medical · BOSIET · FOET · HUET · OPITO · ENG1 (Seafarer) · Norwegian
Offshore Medical · IWCF (levels — L4 is a real senior well-control ticket).

### The people (Drillity's own list)
Drillers, roughnecks, roustabouts, toolpushers and drilling supervisors ·
geotechnical and foundation/piling crews · oil & gas professionals (subsea,
well control, mud engineers) · mining operators and heavy-equipment specialists.

Job functions from the Talent codebase: Drill Rig Operator · Rigger · Crane
Operator · Equipment Technician · Foreman / Site Supervisor · Hydraulic Grab /
Piling Operator · Blaster / Shot Firer · plus the engineering, HSE, maintenance,
logistics and management ladders. See `DOMAIN.md` §7.

### Real skill vocabulary (from the platform's own extraction example)
Well control · managed-pressure drilling · HPHT · BOP · Dynamic Positioning ·
Mud Management · Risk Assessment · Emergency Response.
*Good in-game use:* the skill tree nodes should carry these names where they
fit, instead of invented ones.

### The onboarding story (flavour for the game's own intro)
Drop a CV → AI builds the profile in ~20 seconds → get matched (two-sided
scoring) → apply and get found → grow. Talent never pays.

---

## PART C — FACT-ACCURACY RULES (hard requirement)

Real drillers will read this game. A wrong statement is worse than no
statement. Every user-visible factual claim must satisfy ALL of:

1. **Traceable** to `DOMAIN.md`, this file, the taxonomy PDF, or
   uncontroversial textbook drilling engineering.
2. **Precise.** No conflating adjacent concepts. In particular:
   - **Ring-bit systems** are *concentric*: the ring bit stays on the casing
     shoe and **is left in the ground**. The pilot bit is retrieved.
   - **Wing-bit systems**: the wings retract so the bit **is pulled back up
     through the casing and reused**. A wing bit is **not** a lost bit.
   - **Odex is eccentric**; **Symmetrix is concentric**. The taxonomy PDF files
     them under one node for merchandising, but the game must not repeat that
     as an engineering claim.
   - "Sacrificial / Lost Bits" is its own taxonomy subcategory — not a synonym
     for either family.
   - A **shank adapter** (top hammer, transmits blow energy from the drifter)
     is not a **DTH shank** (couples the hammer to the string).
3. **Unit-correct.** MPa for UCS · mm for diameters · m/h for ROP · bar for
   pressure · kN for force · Nm/daNm/kNm for torque · EUR for money.
4. **No brand claims.** Never attribute a capability to a named real
   manufacturer, and never use a real model designation as a product name.
5. **No Drillity internals.** See the warning at the top of this file.
6. **If in doubt, delete it.** A short list of certainly-true facts beats a long
   list with one error in it.
7. **A number must never outrun its source — the `sourced` flag is binding.**
   `world/geology.js` carries grade bands for ten commodities. Gold, copper,
   VMS and porphyry trace to `research/08-commodities.md`. **Coal, iron,
   lithium and diamonds do not** — the research pack has no grade model for
   them, so they carry `sourced: false` plus a `needs` note.

   Every sample returned by `getOreAt()` / `getOreAtStation()` passes that flag
   out, precisely so no UI can print an unsourced number as a fact. Therefore:

   - **Any screen that prints a grade must gate on `sourced`.** Show the
     figure when it is true; show the *target* when it is false — "a coal seam
     at the Westphalian horizon", never "0.8 % ash".
   - The **geometry is not a claim**. Drawing a kimberlite pipe or a coal seam
     is fine; the shape is a game shape and is documented as one. It is the
     *number* that needs the source.
   - **Cerchar abrasivity is unsourced throughout** (`research/08` §4).
     Abrasivity is proxied on quartz content, as that section directs, and must
     never be surfaced as a CAI value.

   The same rule generalises: when a data table marks a figure unsourced, the
   UI's job is to say less, not to round it off and hope.

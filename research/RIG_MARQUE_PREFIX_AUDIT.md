# Rig marque prefix audit — bounded first pass

Date: 2026-09-06. Scope: the 19 current rig names, their 18 distinct model prefixes, and the source paths that can supply player labels or model plates. Read-only research under ASTRA §1.2; no runtime, Blender, geometry, or asset changes. No GPU session was launched.

The strongest finding is that the game's **CP-20** normalizes to the **CP20** designation published on KLR Universal's own construction-rig page. **DP-78** also retains a prefix used by Sandvik's Pantera drills, despite replacing the previously flagged PM prefix. Several other prefixes appear in manufacturers' drill families; TH, LH and CX also occur on adjacent mining/construction equipment. These are naming-policy findings, not determinations of trademark ownership, infringement, or legal clearance. [KLR CP20](https://klruniversal.com/drilling-rigs/construction/cp-20), [Sandvik surface equipment](https://www.mining.sandvik/en/landing-page/surface-mining-equipment/).

## Method and limits

- Read ASTRA §1, DOMAIN §10, FACTS_VERIFIED, the prior PM finding in `research/rigs/_model-critique.md:372`, and the open-prefix item in `research/ASTRA-progress-2026-09-06.md:177` before this pass.
- Inventory is from source, not old handover counts: 19 rigs, with CP shared by cable percussion and cone penetration. Compare prefixes case-insensitively; omit spaces/hyphens when discussing the complete CP20 match.
- Use manufacturer-owned product pages or catalogues as evidence of use. An online archival catalogue proves published use at its date; it does not prove the model is still manufactured. A shared two-letter prefix is weaker evidence than a complete model designation match.
- No primary match found in this bounded search means **UNKNOWN / NOT CLEARED**, never absence of a collision. NV, SN and FJ remain in this category. The fictional manufacturer names and suffix words themselves were not comprehensively audited.
- All proposed replacements below are method-derived brainstorming candidates, **NOT RESEARCHED / NOT CLEARED / NOT APPROVED FOR SHIPPING**. Common method abbreviations may themselves occur in real equipment names.

## Evidence for every current rig

| Rig / current player-facing name | Finding from primary evidence | Candidate only; not cleared |
|---|---|---|
| crawler-lite — Nordvik NV-90 Scout | **UNKNOWN.** Searches for NV-90 and NV drill/model usage did not establish a manufacturer-owned model source. A historical NV-1 lead lacked primary manufacturer verification. | Keep pending research; optional AUG-90 (auger). |
| cable-percussion — Kilmar CP-24 Shellhand | **Drill prefix reuse.** KLR publishes CP20. This establishes CP use, not an exact CP24 match. [KLR](https://klruniversal.com/drilling-rigs/construction/cp-20) | CBP-24 (cable percussion). |
| crawler-th — Steinbach TH-320 Ridgeline | **Adjacent mining equipment prefix.** Sandvik's 2022 automation brochure identifies TH551i/TH663i trucks. It does not establish a TH320 drill. [Sandvik brochure](https://www.mining.sandvik/globalassets/campaigns/nextgenautomation/pdf/autominemappingsolution_brochure.pdf) | THM-320 (top hammer). |
| dth-crawler — Brenner DH-750 Ironvein | **Drill family prefix reuse.** Bay Shore explicitly lists a DH Series and DH20 excavator LōDril. No exact DH750 claim. [Bay Shore](https://www.bayshoresystems.com/product/dh20-excavator-lodril/) | DTH-750 (down the hole). |
| core-rig — Meridian CX-1200 Wireline | **Adjacent construction equipment prefix.** CASE publishes CX130B excavators. No exact CX1200/core-drill claim. [CASE](https://www.casece.com/en/asiapacific/products/excavators/b-series-crawler-excavators/cx130b) | WLC-1200 (wireline core). |
| foundation-bg — Torvald KR-46 Kellyline | **Drill family prefix reuse.** KLEMM publishes KR 806-3GS drilling rigs. No exact KR46 claim. [KLEMM](https://www.klemm.de/en/products-1/drilling-rigs/kr-806-3gs/) | KLY-46 (Kelly). |
| cfa-rig — Lindhorst CF-28 Continuum | **Published drill prefix reuse.** Tescar's 2016 catalogue lists CF3, CF4, CF6 and other CF rigs. Archival evidence; current production of each model is unverified. [Tescar catalogue](https://www.tescar.com/dowload_catalogo/tescar_catalogue.pdf) | CFA-28 (continuous flight auger). |
| oil-derrick — Havstein DR-2400 Derrickline | **Drill family prefix reuse.** Sandvik publishes DR410i/DR416iE rotary drills. No exact DR2400 claim. [Sandvik](https://www.mining.sandvik/en/landing-page/surface-mining-equipment/) | MRT-2400 (mud rotary). |
| hdd-rig — Halvard HD-330 Traverse | **Same-method drill prefix reuse.** Apollo Techno publishes HD 50/100 horizontal directional equipment. No exact HD330 claim. [Apollo Techno](https://apollotechno.com/?p=1395) | HDD-330 (horizontal directional drilling). |
| sonic-truck — Corvara SN-6 Resonant | **UNKNOWN.** Bounded SN/sonic-rig searches mostly produced serial-number uses; no primary manufacturer model-prefix evidence established. | Keep pending research; optional SNC-6 (sonic). |
| rc-rig — Kjelvik RC-410 Chipline | **Drilling designation/component reuse.** HYDCO's rig page uses RC350 in body text, although its heading reverses this to 350 RC; its components page unambiguously lists RC5000/RC9000 drillheads. RC is also the method abbreviation; this is not proof of a proprietary RC family or exact RC410 model. [HYDCO rigs](https://www.hydco.com.au/rigs.html), [HYDCO components](https://www.hydco.com.au/components.html) | RVC-410 (reverse circulation). |
| tunnel-jumbo — Aurbach FJ-220 Faceline | **UNKNOWN.** Bounded FJ/jumbo/drill-model searches did not establish a manufacturer-owned model source. | Keep pending research; optional FJM-220 (face jumbo). |
| longhole-rig — Fennholm LH-60 Fanline | **Adjacent mining equipment prefix.** Sandvik's brochure lists LH410/LH514 loaders. No exact LH60 longhole-drill claim. [Sandvik brochure](https://www.mining.sandvik/globalassets/campaigns/nextgenautomation/pdf/autominemappingsolution_brochure.pdf) | LHP-60 (longhole production). |
| bolter — Skarnes GB-14 Boltline | **Related OEM brand only.** GB is a hydraulic-breaker manufacturer brand. This pass did not verify an exact GB14 model on its own site, nor establish a GB bolter family. Keep this weaker finding separate from confirmed model-prefix evidence. [GB](https://www.gbhammer.com/main) | RBT-14 (rock bolting). |
| piling-leader — Bergholt DP-78 Leaderline | **Drill family prefix reuse.** Sandvik publishes Pantera DP1100i. The PM→DP rename therefore does not establish a prefix unused by real drill OEMs. No exact DP78 claim. [Sandvik](https://www.mining.sandvik/en/landing-page/surface-mining-equipment/) | DPL-78 (driven pile leader). |
| pd55 — Ulvestad DL-50 Duoleader | **Drill family prefix reuse.** Sandvik's brochure lists DL421/DL422iE/DL432i drills. No exact DL50 claim. [Sandvik brochure](https://www.mining.sandvik/globalassets/campaigns/nextgenautomation/pdf/autominemappingsolution_brochure.pdf) | DUL-50 (dual leader). |
| si-rig — Rynnval SI-30 Probeline | **Ground-improvement equipment prefix reuse.** YBM publishes an SI series, including SI-15S and SI-40 variants. No exact SI30 claim. [YBM](https://www.ybm.jp/by_machine/si-series) | SIV-30 (site investigation). |
| cpt-unit — Rynnval CP-20 Ballastline | **Complete normalized designation match.** KLR's page heading and image label say CP20 for a rotary/auger rig. Its body and PDF label inconsistently say CMP40, so this proves KLR publishes CP20 on its own site; the naming inconsistency needs resolution before deriving specifications. It is different equipment from the game's CPT unit. [KLR](https://klruniversal.com/drilling-rigs/construction/cp-20) | CPT-20 (cone penetration). |
| raisebore — Vantera RB-92 Shaftline | **Drill family prefix reuse.** Bauer's mobile-rig page lists RB50/RB65 for water/geothermal/exploration applications. No exact RB92 raisebore claim. [Bauer](https://www.bauer-italia.it/it/perforatrici-mobili) | RBH-92 (raise boring head). |

## Exact source inventory

Line numbers are the working-tree snapshot below. `data` means `src/game/data.js`; `factory` means `src/rig/rigFactory.js`. Factory entries are the actual `spec.name` literals, not only section comments. Blender references are **module documentation**, not proof of lettering in a mesh or texture.

| Rig id | Runtime name definition | Procedural spec name | Blender name reference |
|---|---|---|---|
| crawler-lite | data:1114 | factory:2088 | blender/crawler_lite.py:3 |
| cable-percussion | data:1130 | factory:7044 | blender/cable_percussion.py:4 |
| crawler-th | data:1145 | factory:2201 | blender/crawler_th.py:3 |
| dth-crawler | data:1157 | factory:2339 | blender/dth_crawler.py:3 |
| core-rig | data:1171 | factory:2715 | blender/core_rig.py:3 |
| foundation-bg | data:1182 | factory:2871 | blender/foundation_bg.py:4 |
| cfa-rig | data:1201 | factory:2981 | blender/cfa_rig.py:2 |
| oil-derrick | data:1221 | factory:4372 | blender/oil_derrick.py:4 |
| hdd-rig | data:1238 | factory:3135 | blender/hdd_rig.py:3 |
| sonic-truck | data:1247 | factory:2584 | blender/sonic_truck.py:3 |
| rc-rig | data:1261 | factory:5221 | blender/rc_rig.py:2 |
| tunnel-jumbo | data:1274 | factory:5438 | blender/tunnel_jumbo.py:4 |
| longhole-rig | data:1285 | factory:5713 | blender/longhole_rig.py:4 |
| bolter | data:1296 | factory:5963 | blender/bolter.py:3 |
| piling-leader | data:1307 | factory:6281 | blender/piling_leader.py:2 — stale **PM-78** |
| pd55 | data:1336 | No literal DL-50 name found in factory | blender/pd55.py:2 — stale **BamBam PD-55 Driveline** |
| si-rig | data:1362 | factory:6476 | blender/si_rig.py:3 |
| cpt-unit | data:1373 | factory:6718 | blender/cpt_unit.py:3 |
| raisebore | data:1382 | factory:3292 | blender/raisebore.py:4 |

Confirmed player text paths consume these `rig.name` values: `src/ui/screens/garage.js:270` (rig card), `:303` (title), `:518` (loadout label), `:538` (spec row), and `:189`/`:200` (toasts); `src/ui/screens/shop.js:843` (rig label). A future rename must cover runtime and procedural definitions plus current-name documentation; historical research should retain historical names with an explanatory note, not have real source references rewritten.

### Data plates and Blender mounts

`src/core/assets.js:4468` implements the `plate` decal branch. Its MODEL default at `:4473` is **DR-140 CRAWLER**, absent from the current 19 rig names; SERIAL at `:4474` defaults to DRL-0041-EU. The manufacturer text is selected from `params.maker` at `:4487` and drawn at `:4488`; model rows are rendered from `:4493`. This remains a latent naming source worth handling when plate ownership is made explicit.

A search of current `src/` did **not** find a direct `decal('plate', ...)` call. `src/rig/rigFactory.js:1037` (`addDecals`) creates a blank brand panel and hazard details; it does not supply the rig model name to that plate branch. This source-only pass therefore **does not establish that DR-140 or any current rig prefix is visibly baked onto the shipped GLB**. ASTRA's historical PM data-plate statement is not substituted for a current call trace.

Authored attachment locations include `blender/piling_leader.py:1276` (`plate`) and `:1278` (`marque`), `blender/pd55.py:675` (`plate`), `blender/bolter.py:1409` (`marque`), `blender/cable_percussion.py:1360` (`marque`), and `blender/oil_derrick.py:1718` (`marque`). These calls use `NODE_MOUNT` through the local `empty`, `node`, or `R.empty` helpers to create attachment nodes. Their existence alone does not draw the documented marque. No GPU capture or exported-texture inspection was performed in this task.

## Suggested next bounded work

1. Review the CP20 exact normalized match and the drill-family prefix findings first. Research proposed alternatives before a separate coordinated rename; none of this table's candidates is cleared.
2. Keep adjacent-equipment and OEM-brand findings labeled by their actual strength. Decide naming policy consistently for generic method abbreviations; do not describe shared letters as proof of trademark rights.
3. Resolve NV/SN/FJ through primary catalogues and audit the fictional manufacturer words separately. Do not mark them safe because this pass found no primary match.
4. In a later source-owned change, make plate data explicitly per-rig if plates are activated, synchronize the two stale Blender module headers, and check UI wrapping after any rename. This report does not authorize an unreviewed replacement list or imply a visual result.

## Reproducible source snapshot

Working-tree inspection at Git HEAD `83b2347e8d1fa2883fe53235044ddcc56597312a`; the tree is concurrently edited, so these content hashes identify what was inspected more precisely than HEAD alone.

| File | SHA-256 |
|---|---|
| src/game/data.js | 3c442ae7e9ea4a15773e6225de6f0303acaa33e5f06a7bb4936d74a8e33d0b3b |
| src/rig/rigFactory.js | 4a23fea28cc4f45171ded9af6942fcb33ef2d301ff1d9a40211b41dd9cd1d91e |
| src/core/assets.js | e48553e9a9f5333fe58dcf3786b247f071fdd222615638dd136499ed99a83ed3 |

Validation: all 19 runtime rows matched by exact source search; primary evidence links above inspected during this pass. Research-only output; no production tests, browser, GPU, assets, commits, or pushes performed by this agent.

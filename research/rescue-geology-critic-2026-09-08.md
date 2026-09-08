# Independent rescue geology review — 2026-09-08

**APPROVED for the canonical Nordic rescue portion of the composed candidate below.** The new actual-geology proof passes 14/14 groups on unchanged source. The companion career critic owns broader positive acceptance of ordinary soil-only auger tenders; this report does not substitute for that review. No MAIN source, browser, WebGL renderer, generated asset, git commit or remote was changed by this critic.

Candidate: `C:/Users/henri/Downloads/threads/drillity-next-rescue-geology`.

## Evidence and reproduction

Run from the candidate root:

```powershell
node tools/checkrescuegeology-adversarial.mjs --canvas=C:/Users/henri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas --baseline-geology=../drillity-rescue-local-region/src/world/geology.js --report=research/rescue-geology-critic-final.json
```

The externally installed `@napi-rs/canvas` package is the CPU Canvas implementation used by full production `geology.init()`. Only the document/createElement and localStorage boundaries are supplied. The test constructs geology, simulation and progression in production order, runs their actual initialization and `CONTRACT_ACCEPT` listeners, and advances `geology.update`, `sim.update` and `progression.update` at 60 Hz. No geological service is mocked. Actual-play cases never call `generateProfile` manually, move drill depth, manufacture completion events, alter the optimum model or enable god mode. Real completion events are replayed only after their authoritative settlement to test idempotency.

The test checks `syntheticGeology === false` throughout drilling, shared world/service strata, sampler-to-telemetry physical fields, advertised contacts, supported materials and absence of hidden boulder/cavity overlays throughout the eight-metre work interval. Existing world hazards still execute: slow runs encounter collapse/jam behavior and recover with public `jamRescue` pulses when public telemetry permits them. The accepted profile remains unchanged through all three holes.

`research/rescue-geology-critic-final.json` records all measurements, receipts, public recovery actions, source hashes before/after, and `sourceUnchanged: true`.

## Actual acceptance and complete work

Every listed job starts at zero cash and accepts through the real progression API. Starter inventory remains exactly the two existing owned starter items; no asset or money is granted by the fixture after setup.

| Case | Actual hole grades | Actual seconds per hole | Cash after complete job |
| --- | --- | --- | --- |
| Unchanged starter rig and auger | B / B / B | 48.7 / 48.7 / 48.7 | EUR453 |
| Supported worn rig/auger/rod, initial conditions 0.4/0.5/0.5 | B / B / B | 55.3 / 55.4 / 55.7 | EUR571 |
| Slow operator using public zero-feed interval and jam recovery | D / D / D | 158.8 / 158.8 / 154.5 | EUR400 |
| Existing generic field-spare policy, initial conditions 0.15/0.12/0.2 | C / C / C | 65 / 65 / 65 | EUR566 |
| Saved after first real hole; legacy metadata omitted; then restored and finished | B / B / B | 48.7 / 48.7 / 48.7 | EUR453 |

Starter, supported-worn and slow-D runs retain the actual auger bit and report `fits: true`. The slow case receives no support for holes one or two. Its three existing revenues total EUR942 and running costs total EUR1090, leaving raw net EUR-148; separately recorded final support EUR548 gives the existing EUR400 floor. Its final-hole net is EUR622, distinct from whole-job net EUR400. Normal rates and cost formulas were not changed by this geology proposal.

The generic spare row is deliberately qualified: Site's existing no-argument `sim.changeBit()` performs a real trip and supplies `_spare`, whose kind is `any` and telemetry reports `fits: false`. That demonstrates existing game recovery controls, **not** a verified physical auger replacement. Approval does not rely on it: supported starter and worn typed-auger cases finish independently.

## Adversarial boundaries

- Full old production geology initialization and acceptance, loaded from the frozen prior module, reproduce a column different from the advertised rescue contacts and unsupported material inside the promised interval. This is a meaningful negative control. It proves a mismatch, not that every possible old controller was unable to finish.
- A truly empty owned/unlocked rig inventory refuses acceptance with no grant, payment or geological replacement. Zero cash is supported; absent equipment is not silently solved.
- Forged canonical ground IDs/contacts, seed, site archetype, site plane, flushing descriptor and diameter cannot gain debt acceptance. State and geology remain unchanged after rejection.
- Real partial drilling followed by abandonment creates no completion event, receipt or support. Every actual completed event is replay-safe. Actual save/restore after one hole settles only the remaining two and leaves one completed career contract and three ledger entries.
- A canonical object supplied directly to public generation without acceptance cannot request the authored soil column. Copied/unaccepted event objects cannot establish its trusted work-order record.
- Legitimate current-identity profile reconstruction is deterministic. Changes in region, application, method, depth, seed, diameter, physical difficulty, mode, commodity or confidence cannot borrow the accepted context; neither can a copied or abandoned identity. Rejected reconstructions do not consume the legitimate current work order.
- Regional public profile generation remains identical to frozen production across eight regions and three seeds (24 cases), and actual acceptance of a mixed soil/granite ordinary auger contract remains identical (one additional case). Ordinary accepted soil-only tenders are intentionally changed by the companion scope; they are not miscounted as unchanged controls.

The composed helper captures copied, frozen column/context values after the actual state/run contract identity has been established. Rescue eligibility remains strict canonical Nordic. Source inspection confirms that regional ground below the target is retained, soil contacts cannot merge into a boulder-bearing tail, and tail feature envelopes reaching back into the soil interval are filtered. The accepted column is the existing **game-authored** tender specification; source comments explicitly label it **NOT SOURCED** as a real survey measurement. This review adds no new physical constants or external-price claims.

## Exact accepted identities

| File | SHA-256 |
| --- | --- |
| `src/world/geology.js` | `faeb7e7b14af50f16b9905adba1efae7fb6cf754afa1894a8ce10c8a93466e88` |
| `src/game/economy.js` | `67fd6d0e5c24fb3428e2db36fb95d8ab205c2b0b3d6cb6a2cfb5d8b2e22a89b0` |
| `src/game/progression.js` | `8b4b1312342fadd820e1cf6ee7ce2a4a939aa716656005623374091bb7daae9f` |
| `src/sim/drilling.js` | `07ccd37ec9f74cf6030639053c6165fc0617876f7fbfca542e95fc5fbba5ab74` |
| `src/game/data.js` | `bb207515d7c43b643a011f055848a95a7e9d3b3e262a5f2fc0729668fae24c2f` |
| `tools/checkrescuegeology-adversarial.mjs` | `192fca1e5e2ca82fae43de87a9f33dc7faa8800c0677993eb0c2950c176b3e73` |
| Frozen comparison `drillity-rescue-local-region/src/world/geology.js` | `895036315fd5924ab7e86b6a516d4fab3f046e740275b9f20f568de7c75d0fdc` |

## Preserved failures and limits

`rescue-geology-critic-baseline.json` is an early candidate harness failure despite its historical filename, not the frozen-generator result: it incorrectly demanded object identity from a simulator that deliberately normalizes/copies ground properties. `rescue-geology-critic-worn-supported-01.json` captured a temporary `recoveryWorkOrder` reference while the author was composing the source; the final frozen source has no such failure. `rescue-geology-critic-composed-01.json` initially failed a critic difficulty fixture: existing `normDifficulty` maps raw values 1 and 5 to the same physical value 1. The corrected attack uses 0.2 and passes. These raw artifacts remain preserved, and none is silently treated as successful evidence.

This is CPU gameplay/service evidence, not rendered pixel acceptance, a physical phone result, a frame-performance measurement, or a universal guarantee across all equipment, methods, contracts or regions. Ordinary contract acceptance currently has no generated-board provenance token; the new helper inherits real progression acceptance as its boundary, and this review does not claim otherwise. The already-reviewed Nordic zero-fee home selection and conditional recovery accounting remain unchanged; earlier claims that normal Nordic-first careers were stranded abroad were overbroad and are not reopened here.

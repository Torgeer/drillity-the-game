# Readout import adapter — independent composed review

**APPROVED.** The author changed exactly six lines in `tools/checkreadoutcache-shipping.mjs`: four explanatory comments and two lines resolving remaining relative static `from` specifiers against the real geology source URL. The existing Three.js/merge-helper/core-contract anchors remain. The new economy/data dependencies execute as actual modules. No dependency exports are mocked, and no production source was changed.

The original failure remains in `evidence/verification/cpu-next-gameplay-01.log:1850`: the old virtual module could not resolve `../game/economy.js` from its data URL. It failed before the readout assertions; it was not a detected cache regression. The old full run remains failed evidence.

Independent command after the FPS lease returned to idle:

```powershell
node tools/checkreadoutcache-shipping.mjs --json > research/readout-import-adapter-critic-final.json
```

Result: **exit 0, seven cases, 58,843 assertions, zero failures**. The original cached/uncached readout mutation, identical read-only probe, fixture matrix, numeric scheduling checks, paint-command/Canvas-state checks, geometry/camera checks, texture/source invalidation counters, font-event dispatch checks and listener cleanup are unchanged. For the 150-to-151 case, uncached invalidations remain 174 versus cached 10 with ten changed strings. The boundary case remains 39 versus 12, and the deep HDD return-tangent case 400 versus 276. These are recorded command/invalidation counts, not GPU uploads, raster equivalence or FPS measurements.

`research/readout-import-adapter-critic-identities.json` records exact byte hashes before and after focused execution and confirms `unchanged: true`. `research/readout-import-adapter-critic-final.json` is the independent raw report. The tool also retains its original end-of-run LF-normalized production-source identity assertion. Normalized geology SHA is `e6ea4d5c9450bcfc483b08b2202323d5cea99facdb1278f20d9b9d39bcc7c3fa`; this deliberately differs from the raw filesystem hash below because the tool normalizes CRLF to LF.

| File | Raw SHA-256 |
| --- | --- |
| `tools/checkreadoutcache-shipping.mjs` | `667d594290865bac74e815a3a7cd60583679a3291c95623a906d15d21d8e0b1b` |
| `src/world/geology.js` | `faeb7e7b14af50f16b9905adba1efae7fb6cf754afa1894a8ce10c8a93466e88` |
| `src/core/contract.js` | `dfb40a897139a7a67fc9d62a2d17a473096a51f42513becca6e3391767e3cf53` |
| `src/game/economy.js` | `67fd6d0e5c24fb3428e2db36fb95d8ab205c2b0b3d6cb6a2cfb5d8b2e22a89b0` |
| `src/game/data.js` | `220a8e25a3caef0c296c840a82edf20d66942a9df5173861e90ef969db0151b7` |

The critic performed only offline source/diff review and this focused CPU run, and created the independent report artifacts. No GPU/browser, broad suite, production write or commit was performed.

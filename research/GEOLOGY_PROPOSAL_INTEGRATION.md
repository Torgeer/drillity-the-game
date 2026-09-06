# Geology coverage and readout cache integration

2026-09-06. This candidate adopts the two frozen geology follow-up proposals
against the integration checkout's actual ruler source, in a separate private
copy. Original source, renderer, terrain, contracts, data and all prior reports
were left untouched. No browser or GPU operation was launched.

The source change extends basement generation to its requested coverage rather
than silently stopping after 200 attempts. Its bound derives from the existing
0.12 m thickness floor and a verified unconditional valid bed in each recipe.
That thickness is an existing authored algorithmic floor, **NOT SOURCED physical
bed thickness**. Counter phase and probability calls are retained. Nonfinite or
stalled progress, unsafe arithmetic budgets and incomplete results throw.

The readout now skips a repaint when its formatted numeric string is unchanged,
while still updating the numeric scheduling state. Every rebuilt canvas paints
once. Integration additionally listens for document font `loadingdone` and
`loadingerror`: either invalidates the cached string and scheduling sentinel,
causing the next update to repaint even at stationary depth. Both listeners are
removed on disposal. This closes the optional proposal's deferred-font
invalidation gap without making claims about actual rendered font pixels.

## Actual regression and verification

The ordinary board contract from `makeContract('sahara', 60, makeRandom(226))`
was independently reproduced against the frozen baseline and candidate:

| Item | Frozen baseline | Candidate |
|---|---:|---:|
| Actual contract target | 2396.3 m | 2396.3 m |
| Generated endpoint | 2393.8397185805397 m | 2933.4860000000003 m |
| Shortfall before actual target | 2.4602814194604434 m | 0 m |
| Coverage including existing reserve | incomplete | complete |

The second real board seed, 3408, targets 2400 m. Its previous endpoint was
2650.8890149622 m; the candidate supplies all 2938 m including reserve. These
are implemented game data, not externally sourced physical capacity claims.

Commands from the private integration root, all exit 0:

| Command | Measured result |
|---|---|
| `node tools/checkgeologycoverage.mjs --json evidence/coverage.json` | 4533 checks, 2 real board regressions, 15 synthetic depth/seed cases and 120 unchanged complete profiles; zero failures |
| `node tools/checkreadoutcache-shipping.mjs` | 58843 checks, 8400 paired update frames in 7 motion/resize cases, plus font-event lifecycle tests; zero failures |
| `node tools/checkruler.mjs --json evidence/ruler.json` | 132 cases, 9835 checks, synthetic 0.62-em text; zero failures |
| `node tools/checkruler.mjs --width-em 0.74 --json evidence/ruler-wide.json` | 132 cases, 9701 checks, wider synthetic text; zero failures |

The 150-to-151 m readout fixture requests ten texture invalidations instead of
174, with equal recorded drawing commands/state, numeric scheduling, geometry
and projection. The gate loads the actual candidate and compares it with a
virtual uncached reference differing only in the early cache return. It also
checks that stationary font events repaint once and disposal removes listeners.
These counts are CPU invalidation requests, not GPU uploads, FPS or raster proof.

The 120 saved compatibility fixtures cover eight regions, five section modes
and three seeds. Their baselines were recorded from frozen source LF SHA-256
`6ae1593f3dc86a402899b8dd552c421e5aec13eef3f5b7fc728b5c3470c00a9b`.
The gate compares complete strata/features/water/layout/path/station hashes.
The baseline JSON records this provenance; it is not regenerated during checks.
The research-only intentionally failing depth diagnostic remains unchanged and
is not used as a shipping gate. Existing ruler checks are also unchanged.

## Integration and limits

Only `src/world/geology.js` changes in production. The patch is incremental to
the frozen ruler snapshot; root's later additive instrument-layer/mesh API is
outside this ownership. Root should apply the scoped patch alongside that API,
then rerun the three shipping checks. Suggested new check scripts are
`check:geology-coverage` and `check:readout-cache`; package.json was not edited.

The source before `createGeology` (including boreSDF and face shader code) is
byte-identical after LF normalization. This candidate edits no GLSL, material,
mesh geometry, ruler layout, renderer postprocessing or physical domain data.

Formerly truncated profiles consume extra random draws and can therefore change
later features, including features above the old endpoint. This is deliberately
accepted for repairing incomplete coverage; **no save migration or preservation
of those formerly truncated seeds' feature stream is claimed**. Complete old
profiles are identical across the measured compatibility matrix.

Generation's pre-existing failure semantics are not transactional: an exceptional
invalid/fault-injected call can leave new spec/layout with old published strata.
The new guards reject newly incomplete output but do not implement rollback of
all earlier state changes. Valid current ordinary inputs passed the tested matrix.
Safe-integer arithmetic is not a practical resource ceiling for arbitrary huge
finite targets. These broader hardening tasks remain separate.

CPU evidence does not establish real glyph legibility, font availability,
contrast, postprocessing correctness or longer-profile renderer quality. Headed
visual verification must be scheduled under the shared GPU lease. Frozen source,
preparation scripts and full JSON evidence remain in the private scratch
`C:\Users\henri\Downloads\threads\drillity-geology-proposal-integration`.

# Independent pile hero-framing gate review

**Approved.** The test repair uses the authored piling contract without weakening the camera acceptance criteria. No production source, asset, test tool or GPU process was changed by this critic.

Independently executed:

```powershell
node tools/checkheroframing.mjs --json research/pile-hero-framing-critic.json
```

Result: **3,006 checks, 354 actual GLB/phone vertex cases, all 19 rigs and all five section modes pass**. Final reviewed tool SHA-256: `b0026f43ef9ca2a9e5e8f7158fc9e2b434d1c91118519e9a68efffa7167557e5`.

The piling endpoint helper independently reads the signed `travel_lo_m` and `travel_hi_m` offsets from the actual GLB. The Python authoring statements are asserted: both offsets subtract `HAMMER_BOT`. This gives local endpoints `1.4000003814697273` and `16.52000038146973` around exported rest `14.600000381469727`. Finite values, bracketing and span agreement are required. Malformed helper inputs must throw.

The public rig method is explicitly set to `driven-pile` for this row and restored to the original method for the other 18 rigs. Actual public update calls exercise depth zero, both sides of the 3 m boundary, exactly 3 m, the lower travel limit and span saturation, under both load settings. Their oracle is authored rest minus sampled depth, clamped to authored endpoints. The other rigs retain their prior feed oracle and sampling.

I compared the extent and actual-vertex projection functions against the pre-delta Git version: they are unchanged. Both phone layouts are unchanged. Horizontal margins remain 4%, crown clearance 6%, and above-ground crop tolerance 3%; all included vertices must still lie between clip planes. The full fleet still comes from `blenderRigIds()`.

The old incorrect upper pose at Y `29.720000381469724` is retained as a negative control. It fails the unchanged crown requirement on both layouts: `-94.5368` versus minimum `18.2999` pixels at width 390, and `-72.9373` versus minimum `13.9799` at width 320. The test therefore continues to detect the demonstrated framing error.

The first independent execution preceded an author comment-only clarification; it passed. I reran against the final frozen hash above, then verified the live file hash matches the new JSON. This approval concerns the CPU framing oracle. It does not establish browser visibility, housing/cap clearance, pile penetration, rope motion or completed piling choreography.

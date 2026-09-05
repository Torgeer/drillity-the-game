# core-rig measurement underlays

The four `ga_*.png` files are the manufacturer's dimensioned general-arrangement
drawing (`[C140]` pp.6-7, see `research/rigs/core-rig.md` §11) rendered at
260 dpi with a **metre grid drawn over it**. The grid is not decoration: the
drawing carries no scale bar, so it was scaled from the one published dimension
that spans the whole page — B = 12 155 mm, overall height with the mast vertical
— giving **12.315 mm/px** on the side elevations and **6.06 mm/px** on the end
elevation. The end-elevation scale was checked independently against D = 2 895
and E = 2 600 (pixel ratio 1.112 against the published 1.113).

- `ga_grid_lower.png` — side elevation, machine deck and undercarriage.
  Origin of the red grid is the MAST BEAM centreline; blue lines are metres
  above ground.
- `ga_grid_mast.png` — the mast from 3.5 m to 12.6 m: crown block, sheaves,
  lightening holes, the two-section joint band.
- `ga_grid_front.png` — end elevation in transport configuration. Track shoe
  width, width over tracks and overall width all read directly off it.
- `ga_grid_transport.png` — side view with the mast folded. The rod basket's
  2.9 m length and the mast hole pitch are measured here.

`surface-core-rig-CS14-family-spec-2013.pdf` is the same manufacturer's full
technical specification one size down. It is the source for everything
`core-rig.md` §8 lists as NOT SOURCED: feed travel 3.5 m, rod pull length
6.09 m, rod-holder and chuck clamping diameters, spindle bore 117 mm, both rope
sizes, the wireline level wind, the water pump model and the jack pad/travel.

Naming rule (`DOMAIN.md` §10) still binds: these are geometry references only.

# Tool preview framing analysis — 2026-09-06

Scope: independent CPU analysis of `src/core/preview.js`, with no geometry,
loader, material, shop, or runtime edits. Read the complete `ASTRA.md` and its
current checkpoint before analysis. No GPU capture or package change was used.
The follow-up adversarial check is persisted in `tools/checkpreviewframing.mjs`.
The implemented composition uses `FRAME_FILL=0.88`; the eight-tool experiment
below deliberately retains its measured, provisional `0.90` results and is
not presented as the final candidate measurement.

## Findings

The existing camera distance is `0.5 * worldBoxSize.length() / tan(fov/2) * 1.9`.
This encloses geometry conservatively but combines world AABB inflation with a
sphere and substantial padding. A perspective fit computed from actual vertices
can replace that padding without assuming the object is spherical. Static
thumbnails and moving turntables require different bounds: one pose for a
thumbnail; the whole permitted turntable motion for a fixed live camera.

The image blit is also part of the cropping contract. Both `render()` and live
`update()` currently use `Math.max(width/sourceSize, height/sourceSize)`, so a
square render is cover-cropped in a rectangular canvas. A safe square fit does
not imply a safe final card. A contain blit (`Math.min`) preserves the full
image; an aspect-specific render is another correct option but requires aspect
in the thumbnail cache key and fitting math.

## Source observations

- `src/rig/tools.js:1336` finalises tools and attaches scoped disposal.
  Its `preview.aim` at line 1374 chooses the camera's above/below hemisphere by
  tool family. `preview.roll` at line 1378 tips thin tools around local X.
- `src/core/preview.js:536` currently applies authored roll before its world
  bound. It converts the world center to the parent space before subtracting it
  from `group.position`, avoiding the historical yaw-centering error.
- `preview.aim` comments call the vector tool-local, but its established
  consumer uses the normalized vector directly as the camera's world direction.
  Transforming that aim by the complete roll and yaw would cancel the intended
  view changes. Preserve the current effective semantics during this fix.
- The live pivot uses Three's default Euler `XYZ` with X tilt and Y yaw. Its
  matrix is `Rx(tilt) * Ry(yaw)`: a point experiences Y rotation first, then X.
  The authored group roll is a separate transform inside this pivot.
- `node_modules/three/src/math/Box3.js:155` shows that default `setFromObject`
  transforms geometry AABB corners. `precise=true` instead visits actual mesh
  vertices, but its precise branch explicitly excludes instanced meshes.
- `node_modules/three/src/cameras/PerspectiveCamera.js:214` establishes
  `tanV = tan(fov/2) / zoom` and horizontal half-frustum `aspect * tanV`.
  The formulas below assume this centered camera, without `view` or film offset.

These are local implementation sources for the installed Three version, not
recalled external API behavior. No physical dimension is invented or changed.

## Exact distance for a static pose

Let `p` be an actual vertex relative to the framing origin, after group roll
and the thumbnail's pivot rotation. Let `r`, `u`, `b` be the camera's world
right, up, and backward unit axes. `b` points from the origin toward the camera;
the camera is at `D*b` and looks at the origin. Define:

```js
const tanV = Math.tan(camera.fov * Math.PI / 360) / camera.zoom;
const tanH = camera.aspect * tanV;
// Authored framing choice, not a physical measurement:
const fill = 0.88; // 6% inset from each edge in a centered square image.
```

The actual normalized device coordinates are:

```text
xNdc = dot(r,p) / ((D - dot(b,p)) * tanH)
yNdc = dot(u,p) / ((D - dot(b,p)) * tanV)
```

Therefore the smallest distance with `abs(xNdc), abs(yNdc) <= fill` is:

```text
D = max over all p of:
    dot(b,p) + abs(dot(r,p)) / (tanH * fill)
    dot(b,p) + abs(dot(u,p)) / (tanV * fill)
```

Additionally enforce a small positive gap from the nearest point:
`D >= max(dot(b,p)) + positiveGap`. That prevents an axis-aligned point or
degenerate geometry from landing at the camera position. With every vertex in
front of the camera, a triangle's perspective extrema occur at its vertices;
this is sufficient to contain the rendered triangles, not only vertex markers.

The four equivalent support planes are:

```js
const planes = [
  b.clone().addScaledVector(r,  1 / (tanH * fill)),
  b.clone().addScaledVector(r, -1 / (tanH * fill)),
  b.clone().addScaledVector(u,  1 / (tanV * fill)),
  b.clone().addScaledVector(u, -1 / (tanV * fill)),
];
// D = max(q.dot(p)) for all four q and every p, plus positive-depth constraint.
```

## Exact support over every live yaw and the complete tilt interval

A fixed live distance avoids camera zoom changes during rotation. The permitted
motion is all yaw angles and `tilt` in `[-0.12, 0.12]` radians, as authored in
the current `update()`. Bounding the full rectangle of these angles includes
the sinusoidal/damped trajectory without depending on its time samples.

For each prepared plane `q` and each point `p` already containing its authored
group roll and centering, maximize `q dot (Rx(tilt) Ry(yaw) p)` analytically.
Define `rho = hypot(p.x,p.z)` and `Y = p.y`. At a fixed tilt, rotating the plane
back through X gives its Y coordinate:

```text
w(tilt) = q.y*cos(tilt) + q.z*sin(tilt)
```

The maximum over all yaw is then:

```text
f(w) = Y*w + rho*sqrt(length(q)^2 - w^2)
```

`w(tilt)` is continuous, so it visits one interval `[wMin,wMax]`. Its interval
endpoints come from the tilt endpoints and any stationary angles in the tilt
range. `f(w)` is concave; its unconstrained maximum is at
`w = length(q)*Y/length(p)`. Clamp that value to the interval to obtain the
exact maximum. This yields a compact helper requiring no Three dependency:

```js
// Call once for each camera fit/depth plane. Required: finite 0 <= tilt <= PI.
function prepareSweepPlane(q, tilt = 0.12) {
  const c = Math.cos(tilt), s = Math.sin(tilt);
  const a = q.y * c - q.z * s, b = q.y * c + q.z * s;
  let wMin = Math.min(a, b), wMax = Math.max(a, b);
  const phase = Math.atan2(q.z, q.y);
  for (let k = -1; k <= 1; k++) {
    const angle = phase + k * Math.PI;
    if (angle < -tilt || angle > tilt) continue;
    const w = q.y * Math.cos(angle) + q.z * Math.sin(angle);
    wMin = Math.min(wMin, w);
    wMax = Math.max(wMax, w);
  }
  const lengthSq = q.x*q.x + q.y*q.y + q.z*q.z;
  return { lengthSq, length: Math.sqrt(lengthSq), wMin, wMax };
}

// Call once per actual, centered, rolled vertex for each prepared plane.
function sweptPointSupport(p, plane) {
  const rho = Math.hypot(p.x, p.z);
  const n = Math.hypot(rho, p.y);
  if (n === 0) return 0;
  const stationary = plane.length * p.y / n;
  const w = Math.max(plane.wMin, Math.min(plane.wMax, stationary));
  return p.y*w + rho*Math.sqrt(Math.max(0, plane.lengthSq - w*w));
}
```

Use the four planes from the static fit to obtain live distance. Use `b` and
`-b` as two additional planes to obtain extrema of the toward-camera coordinate:

```text
zMax =  max sweptPointSupport(p, prepareSweepPlane(b))
zMin = -max sweptPointSupport(p, prepareSweepPlane(-b))
nearestDepth = D - zMax
farthestDepth = D - zMin
```

Initialize maxima to `-Infinity`, not zero: the support of a particular point
and plane can be negative. Reject/fallback on an empty or nonfinite measurement
instead of reporting success over zero points. Validate the allowed tilt range
at the public boundary if this helper becomes generally reusable.

Independent verification run: seed `246813579`, LCG
`seed = (imul(seed,1664525)+1013904223) >>> 0`; 250 point/plane cases, including
zero points/planes and points/planes on principal axes, with 1,800 random
orientations each. Nondegenerate points were drawn within a 20-unit cube, planes
within an 8-unit cube; most tilt limits ranged from 0 to 0.6 radians. This is a
numerical test domain, not a claim about machine dimensions.

| Check | Measured result |
|---|---:|
| Random sampled orientations | 450,000 |
| Largest sampled value above analytic support | 0 |
| Largest error against constructed maximizing angle witness | 4.619e-14 |
| Three `Euler(X,Y,0,'XYZ')` versus applying Y then X | 1.380e-14 |

The angle witnesses were constructed by solving
`theta = atan2(q.z,q.y) +/- acos(w/hypot(q.y,q.z)) + 2*k*PI` inside the tilt
range. With `qAfter = Rx(-theta)*q`, the maximizing yaw is
`atan2(p.z*qAfter.x - p.x*qAfter.z, p.x*qAfter.x + p.z*qAfter.z)`.
This checks attainment as well as containment; random samples alone would not
show whether a support function was needlessly conservative.

## Provisional representative CPU measurements at fill 0.90

These use the current tool builders, default preview options, default thumbnail
yaw `-0.5`, authored aim and roll, the current world-box center, a 30-degree
camera, square aspect, and `fill=0.90`. They compare the current sphere distance
with the exact static formula. The figures are projected bounding extents of
actual vertices; they are **not rasterized tool-area occupancy**. No claim about
visible carbide area or final GPU appearance is made here.

| Builder | Vertices | Old distance | Exact distance | Old height fraction | Exact height fraction |
|---|---:|---:|---:|---:|---:|
| button-bit | 3,096 | 0.66445 | 0.22881 | 0.27772 | 0.82091 |
| dth-bit | 3,685 | 1.33631 | 0.56023 | 0.37042 | 0.88936 |
| rod-r32 | 1,161 | 11.07886 | 5.74682 | 0.11441 | 0.22552 |
| core-barrel | 7,937 | 6.08393 | 2.80337 | 0.40507 | 0.88171 |
| tube-pile | 1,466 | 47.61006 | 20.20371 | 0.31865 | 0.76982 |
| kelly-auger | 6,302 | 10.45441 | 5.37966 | 0.44155 | 0.86193 |
| rc-cyclone | 3,563 | 11.75894 | 6.34014 | 0.44501 | 0.82135 |
| compressor-skid | 1,948 | 15.44528 | 6.90060 | 0.33134 | 0.76063 |

Every exact fit had maximum absolute NDC edge `0.90` within floating-point
roundoff and positive nearest depth. The rod's width increased from 0.39097 to
0.76956 of the frame; its small height is the actual thin silhouette, not a
failed fit. The one-pass fit loop on already gathered vertices measured
0.25–3.62 ms across these eight cases, in one cold Node run. This excludes
geometry construction, collection, GPU work, and JIT warm-up, and is not a
browser performance claim. The separate catalogue harness owns wider wear,
catalogue and all-19-GLB regression evidence.

## Integration pitfalls and ownership

1. Center once in stable pivot-local coordinates, after authored group roll,
   then use those centered points for the live sweep. Measuring a yaw-dependent
   world-box center and retaining it during rotation produces different orbits
   for different initial angles. One practical collection transform is
   `inverse(pivot.matrixWorld) * mesh.matrixWorld`; this removes the outer
   turntable while retaining child transforms and group roll. Do not apply
   authored roll a second time to those collected points.
2. Preserve the normalized current aim, validate all three coordinates as
   finite, and fall back on zero-length or malformed vectors. Read camera
   right/up/back from its actual `lookAt` orientation to handle its up-vector
   behavior consistently.
3. A live fit must bound the actual tilt state. Initialize/reset pivot tilt to
   zero or include any inherited initial tilt outside the declared interval;
   damping only guarantees remaining in the interval when it starts there and
   has a normal nonnegative timestep. Thumbnail calls must not leave stale tilt.
4. Near/far telemetry must use measured depth. `D > boundingSphereRadius` is
   no longer a necessary condition for a correct shot, and sphere angular
   coverage no longer describes the fit. Record NDC extents or plane limits,
   point count, and nearest/farthest depths. Keep a positive near gap.
5. Preserve backdrop scaling and sufficient far distance for its visible
   surface. The subject's farthest depth alone is insufficient: the camera sits
   inside the gradient sphere. Current `max(6*D,40)` plus the existing backdrop
   scale is conservative for that sphere.
6. For actual geometry collection, honor child transforms, mesh visibility,
   instancing if present, and `getVertexPosition` where morph/skinning applies.
   Computing a separate AABB and rotating its eight corners is safe but can
   recreate the thin-tool inflation. Shader displacement or moving child parts
   require bounds for their motion; the proposed static-vertex proof does not
   silently cover arbitrary later deformation.
7. A single combined pass can accumulate all six live support maxima after
   centering; it does not require caching full geometry for every live frame.
   If temporary points are stored, Float64 XYZ storage costs 24 bytes/vertex
   (2.4 MB per 100,000 vertices). Scope it to the built preview and release it
   with that preview. Do not store an unbounded cross-catalogue point cache.
8. Fit metadata must not acquire ownership of geometry or material resources.
   Keep GLB/tool scoped disposal callbacks intact, preserve shared materials,
   and preserve source-aware thumbnail invalidation and late model replacement.
   Any cached geometry-derived fit must be keyed by the actual built instance
   or rebuilt when the source/wear/build parameters change.

The static formula and analytic live envelope are recommended. The live helper
has independent mathematical and numerical support; final code still needs
the parent's lifecycle review, full catalogue assertions, and leased GPU
captures before claiming rendered coverage improvement.

## Follow-up adversarial audit of the implemented candidate

`node tools/checkpreviewframing.mjs` exercises the exported `createPreview`
entry point with real Three object hierarchies, instance matrices, camera
matrices, and owned fixture disposal. It does not copy or extract a production
fit function. Its recording renderer temporarily supplies allowed extreme
turntable poses before independently projecting submitted geometry, then
restores the live pivot state.

The fixture combines translation, rotation and nonuniform scaling in a parent,
three transformed instances of a slender box, authored roll and below-equator
aim, and an invisible million-unit box that would dominate an indiscriminate
bound. These are deliberately arbitrary test coordinates, not machine facts.

| Actual API check | Result |
|---|---:|
| Five thumbnail yaw poses, 360 yaw poses at five live pitch values, eight aim robustness cases | 1,813 |
| Actual submitted vertex projections | 130,152 |
| Largest static absolute NDC X/Y edge | 0.880000 |
| Largest live absolute NDC X/Y edge | 0.879979 |
| Near/far plane failures | 0 |
| Invisible extreme geometry included | No |
| Live camera position changes | 0 |
| Missing subject, extra subject, stale render, or missed live blit | 0 |
| Shared fixture material disposed by preview | No |

The aim robustness follow-up found a measured defect before the runtime fix:
Three's `lookAt` perturbed an exactly vertical aim while framing retained the
declared unperturbed backward axis. For either `[0,1,0]` or `[0,-1,0]`, an
arbitrary `BoxGeometry(0.001,1000,0.001)` at roll/yaw zero actually reached
maximum absolute X/Y NDC `0.00908608`, while telemetry reported `0.88` and
`ok=true`. A `BoxGeometry(1,20,1)` reached `0.87863740` against reported `0.88`.
These cases did not crop: the finding was incorrect composition and telemetry,
not a demonstrated clipping fault. Zero and NaN aim inputs correctly used the
existing fallback.

The runtime owner selected a deterministic nonparallel up axis before `lookAt`
(Z-up near vertical directions, Y-up otherwise). The permanent public-API
regression now includes both vertical aims, zero/NaN fallback, and both box
shapes. Against that fix, all eight cases pass: every actual projected edge and
depth extreme agrees with framing telemetry within `1e-6`, and every vertex
clears the near/far planes. The complete persisted test passes 1,813 poses and
130,152 vertex projections. No additional fit implementation is embedded in
the test.

An additional CPU scan built all 270 tool IDs at default preview wear zero:
1,427 visible meshes, including 21 instanced meshes. None had missing or
nonfinite POSITION data, invisible materials, opaque zero-opacity materials,
or partial draw ranges. This establishes that the candidate's all-position
scan did not encounter those specific conservative-overbound cases in the
measured tool set. It does not cover future arbitrary material or shader code.

The catalogue harness audit found and handed back three measurement weaknesses:
it selected the first visible subject without rejecting additional ones;
it could reuse a prior canvas snapshot when a live update stopped rendering;
and it treated opacity zero as invisible even with opaque blending. The harness
owner added exactly-one-subject assertions, cleared each expected frame's
snapshot and required a render-count increment, and limited opacity exclusion
to transparent materials. Its old sphere baseline otherwise preserves authored
roll/yaw and original world-AABB centering. Its registry-to-runtime-loader-to-
factory route measures actual GLBs, and it rejects empty/nonfinite geometry.

The final 2D blit bound uses the submitted drawImage rectangle; its centered
contain scaling is correct for square, portrait and landscape destinations.
The silhouette mask remains a geometric triangle union, not shaded pixel area.

### CPU cost interpretation

The original path's cached geometry AABBs reduce each mesh to eight transformed
corners. The new path scans actual vertices and instance transforms, then
evaluates four static or six live support planes and initial projected bounds.
This is increased build-time CPU work proportional to submitted vertex count.
The analytic live fit runs when a live item is built or its model source changes;
the inspected `update()` does not repeat that scan on ordinary turntable frames.
The temporary points array stays local to framing and is not retained per item.

The public-API adversarial test also records the interval between fixture build
completion and entry into its recording renderer, alongside the old algorithm's
Box3-only stage. Five cold tiny-fixture samples ranged 0.416–13.782 ms for the
former and 0.151–0.935 ms for the latter. The former includes API pivot/size
setup; the latter excludes old camera setup, and the long outlier is not
diagnosed. These are diagnostic timings, **not a meaningful comparative speed
or browser-performance verdict**. No runtime frame-time improvement is claimed.

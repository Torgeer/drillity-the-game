# Compact mast — real photographic reference

Reviewed 2026-09-05. These are photographs of physical machines, not generated
concept art. They are external reference images, not licensed game textures.
Do not bundle them into the game or copy the OEM markings.

## Viewed reference

![Real Comacchio GEO 305: open steel assembly, hoses and protective frame](https://www.sigmaplantfinder.com/images/uploads/public/656/0bc/f06/6560bcf0624e9267535834.jpg?q=100)

[Photo source and equipment listing](https://www.sigmaplantfinder.com/equipment/comacchio-geo-305-9/)

The front photograph was visually inspected. It informs the separation of
fabricated steel parts, open passages, hoses and surface wear. It does not
establish hidden drive geometry or exact dimensions. The mast below is an
original simplified design, not a reconstruction of this photographed machine.

## Further reference for the next pass

[Side photograph from the same listing](https://www.sigmaplantfinder.com/images/uploads/public/656/0bc/f2a/6560bcf2a4a42827829101.jpg?q=100)

[Official Comacchio GEO 305 configuration](https://www.comacchio.com/en/machine-configuration/geo-305)

[Official Klemm KR 702-3](https://www.klemm.de/en/products-1/drilling-rigs/kr-702-3/)

Use official documentation to validate engineering claims. Resale photographs
are useful visual references but do not define our fictional rig's specifications.

## Implemented

- Blender-authored 4.2m mast with fabricated spine, separate slide rails, rail
  fasteners, two simplified chain runs, end wheels and an open lower guide.
- Lower and upper assemblies retain the runtime's existing flex hierarchy.
- Guide jaws leave nominal 150mm clearance. They are static visual geometry;
  clamp actuation, interlocks and method-specific jaw sizing are not simulated.
- 6,152 triangles in the exported module. Instanced geometry is cloned before
  runtime batching; model fetching occurs at initialization, not every frame.
- HIGH/MEDIUM use the GLB; LOW and failed loading use procedural fallback.

## Next, in order

1. Validate rod/auger diameter and guide clearance for every starter method;
   rebuild tool continuity and moving hose routing around the full feed stroke.
2. Rebuild track shoes, rollers and chassis UVs; current stretched metal texture
   looks less realistic than the new mast. Use roughness and localized wear,
   not uniformly strong noise on every surface.
3. Add physically plausible positioner joints, guarding and operator controls.
4. Profile the complete drilling scene on target hardware before adding more
   geometry. The current single-file build is about 3.97MB before compression.

Keep Three.js for this iteration. Asset quality and machine mechanics can be
improved without an engine migration; changing engines does not fix these models.

# Instrument shader warm-up follow-up — 2026-09-06

Private candidate only. The original renderer/geology, hero camera and bore SDF
were not edited. Frozen SECTION_INSTRUMENT_GRADE.patch and SOURCE_SNAPSHOTS.json
are preserved byte-for-byte. The incremental patch applies after that candidate.

The actual production warmPost closure previously iterated only composer.passes;
the separate instrument ShaderPass therefore had no deliberate screen-output
compile. warmPost now calls warmSectionInstrumentPrograms before the common
readiness poll. It compiles actual visible instrument owners into their separate
HDR target, then the ShaderPass fullscreen mesh with its actual material into the
null screen framebuffer. Both destinations contribute actual collected programs
to the existing compilePrograms/readiness mechanism. There is no draw or shader
wait in this queuing helper.

Installed Three.js r169 WebGLRenderer.compile traverses mesh materials without
camera-layer filtering (node_modules/three/src/renderers/WebGLRenderer.js,
lines 985–1017). Therefore the earlier review's implication that the ordinary
section compile necessarily omitted instrument mesh materials was too strong.
The new helper explicitly enumerates visible layer owners, compiling each with
the real section scene as targetScene, so unrelated world meshes are not newly
queued with instrument-only light state. Instrument meshes in the current five
geology modes are leaf meshes. The actual screen composite omission remains.

Camera layer mask, scene background/override, shadow enablement, quad material,
renderToScreen and caller framebuffer are restored in finally. The helper uses
the same background/override/shadow isolation as the real instrument draw.
The screen ShaderPass remains outside composer.passes, so render/disposal count
is unchanged. The existing composer warm-up logic is otherwise unchanged.

Verification: node tools/checkinstrumentwarmup.mjs executes the actual production
warmPost body with recording dependencies and the imported production helper.
It exercises real Three.js scene/layer/ShaderPass objects; confirms separate HDR
and screen variants, shared readiness collection, exclusion of world/hidden
objects, exact material/renderToScreen/framebuffer restoration, and injected HDR
bind, instrument compile, screen bind and composite compile exceptions. This
does not construct a WebGLRenderer or prove actual shader linking or timing.
node tools/checkinstrumentgrade.mjs remains 166 assertions passing.

Lazy allocation review: target/pass constructors create JavaScript objects;
target storage is created later at renderer binding. Recording-renderer fault
injection reproduces propagation with restoration, not a real GPU allocation
failure. There is no evidence justifying a new runtime recovery design here.
The candidate report now limits its fallback claim to unavailable post processing
or constructor exceptions. Real lazy bind/compile/draw failures remain visible
and need concrete driver evidence before choosing a recovery policy.

Required next evidence: serialized headed A/B, actual first instrument frame
program delta after warmShaders, warm first-frame duration, resize and quality
rebuild, partial-alpha edges and depth occlusion in all modes. No GPU was launched
for this follow-up and no visual/performance pass is claimed.

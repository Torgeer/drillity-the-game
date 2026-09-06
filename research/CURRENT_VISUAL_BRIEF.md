# Current visual brief for Claude

2026-09-06. Read-only observations from five existing accepted-checkpoint screenshots. No captures, source edits or repeated tests. These images **precede unmerged HUD/atlas and Claude site work**; compare against the integrated branch before treating an observation as still current. A passing engineering gate is not an overall appearance verdict.

## Images inspected

- [Hero CFA, 390 CSS px](C:/Users/henri/Downloads/drillity-the-game/.bak/hero-qa/cfa-rig-390.png)
- [Hero PD55, 320 CSS px](C:/Users/henri/Downloads/drillity-the-game/.bak/hero-qa/pd55-320.png)
- [Hero HDD, 390 CSS px](C:/Users/henri/Downloads/drillity-the-game/.bak/hero-qa/hdd-rig-390.png)
- [Instrument lifecycle, 320x568 high, whole page](C:/Users/henri/Downloads/drillity-the-game/shots/instrument-lifecycle-postfix/320x568-high-page.png)
- [Underground rockbolt with longhole rig, whole page](C:/Users/henri/Downloads/drillity-the-game/shots/underground-light-bindings-verified/rockbolt-longhole-page.png)

The hero `.bak` paths are local evidence. Preserve/copy selected artifacts deliberately for a portable handover; those paths are not proof the images are in Git.

## What remains visible

**The controls consume a large share of the phone.** Both 390 and 320 views devote much of the lower screen to a large torque/ROP area, repeated unit labels, three tall sliders, HOLD and Leave hole. The 320-high scene leaves a comparatively shallow cross-section between a busy surface scene and the large control panel. This is an image observation, not a measured screen-percentage result. Reconsider hierarchy and useful playing space while retaining thumb reach and clear action feedback. The existing follow-up toward more scene space belongs to the unmerged HUD work; this brief does not assess that candidate.

**HDD is difficult to see behind site props.** In HDD390 a large yellow foreground enclosure, sign and fencing cover much of the machine. The sign and enclosure command more attention than the rig. CFA390 also places its undercarriage close to the section seam, while its mast crown is clearly visible. Source-level framing checks and below-ground feed bounds must not be used to excuse foreground occlusion or an actual above-ground crop. This brief does not identify which placement/camera change is responsible for the occlusion.

**Surface environments still look repetitive in these captures.** Flat-window building fronts, densely repeated horizontal ground marks and similar muted grey/brown tones compete with the fine rig geometry. PD55's mast is visible end to end, but the rear buildings and ground pattern are visually busy. At small phone size, the thin rig details can read as noise. This is a composition/material observation, not a polygon, draw-call or texture-resolution measurement. Claude's unmerged site work may already address part of it.

**Instrument text is clearer, but hierarchy remains dense.** The amber numeric readout and scale footer can be read in the inspected 320-high image, without the former obvious footer stretching. However, white geology labels, amber PROJECTED, scale explanations, depth ticks, target-depth markers and a dark grid compete in a narrow section. In PD55-320, the right-hand BLOWS heading sits very close to the depth readout, and its lower unit text is difficult to distinguish. Treat that as a specific image to recheck for overlap/contrast in the final HUD, not as a newly measured overlap count. Short forms such as BLD and the drawn-diameter/exaggeration notation may need clearer teaching or disclosure; do not remove physically meaningful labels merely to make the picture cleaner.

**PD55's initial feedback can be confusing.** Its screenshot simultaneously shows 0 blows, No blows logged, and a large 0.9 mm value on the set gauge. The image does not establish whether this is a carried value, default, preview value or a bug. Verify that state and decide how an unmeasured set is presented before describing the gauge as a valid measurement. No source-cause assertion is made here.

**Underground illumination is visible but visually uneven.** The longhole rig's yellow cab/top surfaces are very bright, the lower chassis and distant tunnel are dark, and broad bright bands across the roof plus the large ventilation pipe dominate the upper view. The lighting makes the machine locatable, but the contrasts and roof highlights deserve a deliberate art review. No luminance/contrast ratio or clipping measurement was performed; do not call highlights numerically blown out from this image alone.

**Underground information is hard to relate at a glance.** The section shows bolt-like diagonals, a depth value around 101.5 and horizontal marks near 0/5, while the surface shows a longhole rig in a tunnel. The footer supplies TVD/OFFSET and true-height notes, but a new player may need a stronger visual connection between active tool, bolt direction and the plotted section. Below it, TORQUE appears over an otherwise mostly empty left area, with ROP and two actions to the right. Inspect whether this is an intentional method-specific layout or leftover gauge space. This is a usability question grounded in the screenshot, not a verified wrong simulation state.

## What is already supported, and what is not

The instrument A/B checkpoint passed ten cases with unchanged strict world/opaque comparisons after bounded pre-A/B settling. The lifecycle checkpoint passed six resize/quality cases with zero immediate post-warm new programs and zero repeat differences. The hero checkpoint passed twelve crown/side/registration cases; its complementary CPU gate separately checks actual above-ground vertices against the documented 3% ground-crop tolerance. None proves unobstructed whole-machine visibility, full-fleet typography, long-term leaks, FPS or final HUD quality.

Underground binding verification passed five actual-GLB cases with correct settled mount/aim samples and no steady binding warnings. That is evidence the intended light nodes are used; it does not certify attractive lighting or same-frame tracking during motion. The screenshots here show deliberately controlled QA jobs and warning states, including Ground too hard/Boulder strike. Do not call those accepted playable contract flows merely because a picture rendered.

## Suggested continuation order

1. Integrate/review the existing HUD/atlas and site work, preserving accepted renderer, recovery and accessibility hunks; then recapture the same representative states.
2. Reassess small-phone playing space, instrument hierarchy and method-specific empty/gauge areas against those integrated images.
3. Clear foreground obstruction of the HDD rig and review surface repetition/underground highlight balance using exact scene evidence.
4. Verify the PD55 unmeasured-set presentation and the teaching of section/exaggeration labels before making factual UX claims.

This is a bounded visual handover, not authorization to discard sourced geometry, loosen existing gates or claim a blanket AAA pass. At the latest instruction usage was 11% remaining. This agent starts no further assignment and owns no open browser/server or unfinished write.

# Actual gameplay trailer — September 8, 2026

`Drillity-Trailer-15s.mp4` is the delivered portrait1080x1920,30fps,450-frame trailer, exactly15.000seconds with AAC stereo audio. Five real rigs have two views each: DTH crawler, RC rig, oil derrick, longhole rig and piling leader. Source checkpoint102338b and selected rig GLBs remained unchanged during capture. Full video/audio decode passed and faststart is verified.

`trailer-source-evidence.zip` preserves all five named raw WebMs, ten source PNGs, capture/edit scripts and metadata, contact sheets and final QA byte-for-byte. `manifest.json` records member and archive hashes. Extract into a fresh folder before inspection. Original workspace: `C:/Users/henri/Downloads/threads/drillity-trailer`.

Only empty recorder padding was removed; the full390x844 gameplay viewport is retained and upscaled. Audio is a quiet original synthesized mechanical bed, not recorded game-engine sound. Native HUD density, bright oil glare and dark underground silhouettes remain visible. This is development footage, not a performance/graphics acceptance run or release claim.

The editor's actual arguments, input windows and tool versions are preserved in EDIT_PIPELINE.md and trailer-edit-report.json inside the archive. Original input records retain their absolute paths. Reproduction elsewhere requires remapping those paths and supplying FFmpeg with libx264/drawtext and ffprobe; no encoder binary is committed. To re-edit on this machine use the original workspace, fresh output paths, and the retained pipeline instructions. This handover did not recapture or re-encode media.

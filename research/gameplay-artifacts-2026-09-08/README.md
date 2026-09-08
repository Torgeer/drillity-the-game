# Lossless gameplay evidence archive — 2026-09-08

69 explicitly selected raw artifacts are stored as individual gzip files. Each source path, original byte count/SHA-256, CRLF count, compressed byte count/SHA-256 and decompressed identity is recorded in manifest.json. Every written gzip was decompressed and compared byte for byte with its unchanged source. No original was normalized, edited, moved or deleted.

Selection uses the parent-named concrete outputs, the 13 hash-pinned sampling-fit entries, two composed critic outputs, explicitly observed sample-condition/rescue reports, and raw entries from the named haptic integration manifest. Production and tool contents are excluded. Readable MAIN Markdown reports remain separate; the sampling-fit REVIEW.md is included because it is one of the explicitly required 13 paths. Historical failed and preliminary evidence stays failed/preliminary: gzip is preservation, not acceptance.

The source trees were read only. No gameplay tests, GPU process, commit, staging or index operation was run for packaging. stage-list.txt is an explicit proposed path inventory for the parent; it is not an executed command.

To inspect an artifact, decompress the individual .gz as binary bytes. Its restored SHA-256 must equal sourceSha256 in manifest.json. CRLF bytes and BOMs are intentionally retained inside gzip.

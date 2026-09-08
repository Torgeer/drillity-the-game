# Preserved September 8 evidence

These gzip files preserve the exact original bytes of the named local artifacts; the manifest records both compressed and uncompressed SHA-256 hashes. Compression used Python standard-library `gzip.compress(data, compresslevel=6, mtime=0)` and each result was decompressed and compared byte-for-byte before saving.

Accepted live oil captures remain accepted. Both later particle probes and the piling browser capture remain rejected. Keeping their evidence does not turn them into successful checks. Read the FPS and piling reviews before drawing conclusions.

The CPU07 logs cover the source before the later piling placement correction through a successful prefix and corrected fixture/suffix runs. The original full run and first suffix have nonzero exits; they are preserved, not relabelled. Later placement, camera-fixture and build records have separate manifest entries and explicit statuses. See VERIFICATION_CHECKPOINT_2026-09-08.json for the complete sequence.

Read a report without extracting it using Python `json.load(gzip.open(path, 'rt', encoding='utf-8'))`. To restore a file, decompress only the explicitly chosen artifact into a new workspace path and verify the uncompressed hash from manifest.json. Original uncompressed artifacts and all screenshots remain in the local evidence directories.

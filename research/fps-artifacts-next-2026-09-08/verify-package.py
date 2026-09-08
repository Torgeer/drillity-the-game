from pathlib import Path
import json, hashlib, zipfile, gzip
root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((root / "package-manifest.json").read_text())
for entry in manifest["entries"]:
    target = root / entry["path"]
    data = target.read_bytes() if target.exists() else gzip.decompress(Path(str(target) + ".gz").read_bytes())
    assert len(data) == entry["bytes"] and sha(data) == entry["sha256"], entry["path"]
archives = [("raw-captures.zip", "raw-captures-manifest.json", "entries"),
            ("snapshot-source.zip", "candidate/evidence/heat-shimmer-preflight/baseline-manifest.json", "files")]
counts = {}
for archive, index, key in archives:
    entries = json.loads((root / index).read_text())[key]
    with zipfile.ZipFile(root / archive) as z:
        assert set(z.namelist()) == {e["path"] for e in entries}, archive
        for entry in entries:
            data = z.read(entry["path"])
            assert len(data) == entry["bytes"] and sha(data) == entry["sha256"], entry["path"]
    counts[archive] = len(entries)
print(json.dumps({"valid": True, "packageFiles": len(manifest["entries"]), "losslessArchiveMembers": counts}))

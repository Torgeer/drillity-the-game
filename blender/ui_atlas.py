"""Render Drillity's reusable DOM-control faces with CPU Cycles.

Run from any working directory (Blender need not inherit the repo cwd):
  blender --background --python-exit-code 1 --python <repo>/blender/ui_atlas.py -- --out public/ui/blender

Source of the palette: src/ui/styles.css :root and src/core/contract.js BRAND.
All pixel dimensions, light/material settings and mesh depths are NOT SOURCED
authored UI design choices; these objects do not represent physical machinery.
The 44 CSS-pixel control floor is the existing project contract (--touch), not
a machine dimension. The script never loads or edits the shared Blender lib.

Only the 2x faces are ray traced. Native faces are alpha-correct box reductions
of that render; both atlases are lossless packings of those exact face pixels.
PNG processing uses Python's standard library, with no package installation.
"""

import argparse
import binascii
import hashlib
import json
import math
from pathlib import Path
import re
import struct
import sys
import zlib

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
# Palette source: src/ui/styles.css :root; validated against the current file.
PALETTE = {
    "bg": "#0F141C", "bgDeep": "#0D1219", "card": "#161C26",
    "muted": "#1E242E", "border": "#28303B", "amber": "#F59E0B",
    "amberHot": "#FFBE3D", "amberDeep": "#231502", "amberDim": "#B06F05",
    "success": "#10B981", "warning": "#F0B319", "fg": "#FAFAFA",
    "fgMuted": "#96A0AE",
}
# NOT SOURCED: authored pixel geometry/packing. Radius 10 is existing --r-sm;
# 44 is existing --touch. Widths, safe regions, 8px gutters are design choices.
ATLAS_SIZE = (352, 480)
SLOT_SIZE = (176, 60)
GUTTER = 8
CORNER_SEGMENTS = 16
SPECS = [
    ("button-neutral", "button", 144, 44, "neutral", "normal"),
    ("button-accent", "button", 144, 44, "accent", "normal"),
    ("button-neutral-pressed", "button", 144, 44, "neutral", "pressed"),
    ("button-accent-pressed", "button", 144, 44, "accent", "pressed"),
    ("button-neutral-disabled", "button", 144, 44, "neutral", "disabled"),
    ("button-accent-disabled", "button", 144, 44, "accent", "disabled"),
    ("badge-neutral", "badge", 88, 24, "neutral", "normal"),
    ("badge-ready", "badge", 88, 24, "ready", "normal"),
    ("badge-warning", "badge", 88, 24, "warning", "normal"),
    ("meter-backing", "meter", 160, 24, "neutral", "normal"),
    ("button-compact-neutral", "button", 88, 44, "neutral", "normal"),
    ("button-compact-accent", "button", 88, 44, "accent", "normal"),
    ("button-compact-neutral-pressed", "button", 88, 44, "neutral", "pressed"),
    ("button-compact-accent-pressed", "button", 88, 44, "accent", "pressed"),
    ("button-compact-neutral-disabled", "button", 88, 44, "neutral", "disabled"),
    ("button-compact-accent-disabled", "button", 88, 44, "accent", "disabled"),
]


def rgb(hex_color):
    return tuple(int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5))


def linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def mix(a, b, amount):
    return tuple(x * (1 - amount) + y * amount for x, y in zip(a, b))


def material(name, color, roughness=0.52, metallic=0.08, emission=0.32):
    """NOT SOURCED: matte coated-control material, not a physical claim."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    col = (*map(linear, color), 1)
    bsdf.inputs["Base Color"].default_value = col
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Transmission Weight"].default_value = 0.0
    # Low diffuse self-fill keeps the quiet label zone dark and stable while
    # the bevel still derives direction and volume from the shared key light.
    bsdf.inputs["Emission Color"].default_value = col
    bsdf.inputs["Emission Strength"].default_value = emission
    return m


def rounded_loop(width, height, radius, z):
    """CCW convex rounded rectangle in XY, with authored pixel coordinates."""
    points = []
    corners = ((width / 2 - radius, height / 2 - radius, 0),
               (-width / 2 + radius, height / 2 - radius, 90),
               (-width / 2 + radius, -height / 2 + radius, 180),
               (width / 2 - radius, -height / 2 + radius, 270))
    for cx, cy, start in corners:
        for i in range(CORNER_SEGMENTS + 1):
            angle = math.radians(start + 90 * i / CORNER_SEGMENTS)
            points.append((cx + radius * math.cos(angle),
                           cy + radius * math.sin(angle), z))
    return points


def shell(name, width, height, radius, rings, mats):
    """One actual mesh, each ring (inset, Z, material index) shapes its bevel."""
    verts, faces, indices = [], [], []
    count = 4 * (CORNER_SEGMENTS + 1)
    for inset, z, _ in rings:
        verts.extend(rounded_loop(width - inset * 2, height - inset * 2,
                                  max(0.5, radius - inset), z))
    faces.append(tuple(reversed(range(count))))
    indices.append(0)
    for ring in range(len(rings) - 1):
        a, b = ring * count, (ring + 1) * count
        for i in range(count):
            j = (i + 1) % count
            faces.append((a + i, a + j, b + j, b + i))
            indices.append(rings[ring + 1][2])
    faces.append(tuple(range((len(rings) - 1) * count, len(rings) * count)))
    indices.append(rings[-1][2])
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for m in mats:
        mesh.materials.append(m)
    for polygon, index in zip(mesh.polygons, indices):
        polygon.material_index = index
    return obj


def setup(samples, threads, seed):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.seed = seed
    sc.cycles.use_animated_seed = False
    sc.cycles.use_adaptive_sampling = False
    sc.cycles.use_denoising = False
    sc.cycles.max_bounces = 4
    sc.render.threads_mode = "FIXED"
    sc.render.threads = threads
    sc.render.film_transparent = True
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.color_depth = "8"
    sc.render.image_settings.compression = 100
    sc.render.dither_intensity = 0.0
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0
    sc.view_settings.gamma = 1
    # NOT SOURCED: one upper-left area key, soft ambient fill; fixed for every
    # asset and state. Pixel units are arbitrary authoring units, not metres.
    world = bpy.data.worlds.new("ui-ambient")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.22
    sc.world = world
    data = bpy.data.lights.new("ui-key-upper-left", "AREA")
    data.energy = 18000
    data.shape = "DISK"
    data.size = 95
    obj = bpy.data.objects.new(data.name, data)
    obj.location = (-85, 105, 150)
    obj.rotation_euler = (-obj.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(obj)
    cam = bpy.data.cameras.new("ui-orthographic")
    cam.type = "ORTHO"
    cam.clip_end = 1000
    obj = bpy.data.objects.new(cam.name, cam)
    obj.location = (0, 0, 500)
    bpy.context.collection.objects.link(obj)
    sc.camera = obj
    return sc


def author(spec):
    name, role, width, height, variant, state = spec
    for obj in list(bpy.data.objects):
        if obj.type == "MESH":
            bpy.data.objects.remove(obj, do_unlink=True)
    p = {k: rgb(v) for k, v in PALETTE.items()}
    face, rim = p["muted"], p["border"]
    if variant == "accent" and state != "disabled":
        face, rim = p["amberHot"], p["amberDim"]
    elif variant in ("ready", "warning"):
        tint = p["success" if variant == "ready" else "warning"]
        face, rim = mix(p["bgDeep"], tint, 0.16), mix(p["border"], tint, 0.45)
    if state == "disabled":
        face, rim = p["card"], mix(p["card"], p["border"], 0.55)
    elif state == "pressed":
        face = mix(face, p["bgDeep"], 0.13 if variant == "accent" else 0.3)
    mats = [material("ui-side", p["bgDeep"], 0.72),
            material("ui-rim", rim, 0.48),
            material("ui-face", face, 0.68 if state == "disabled" else 0.52,
                     emission=0.72 if variant == "accent" and state != "disabled" else 0.32)]
    # NOT SOURCED: 0.25px silhouette inset avoids straight-edge clipping;
    # layered bevel sizes and heights are authored for native-scale readability.
    if role == "button":
        if state == "pressed":
            rings = [(0.25, 0, 0), (0.25, 1.0, 1), (1.25, 1.6, 1),
                     (2.1, 1.0, 0), (3, 0.75, 2)]
        elif state == "disabled":
            rings = [(0.25, 0, 0), (0.25, 0.7, 0), (1, 1.1, 1), (2.4, 1.4, 2)]
        else:
            rings = [(0.25, 0, 0), (0.25, 1.2, 0), (0.8, 2.1, 1),
                     (1.5, 2.9, 1), (3, 3.4, 2)]
        shell(name, width, height, 10, rings, mats)
    elif role == "badge":
        shell(name, width, height, 7,
              [(0.25, 0, 0), (0.25, 0.8, 1), (1.3, 1.5, 1), (2, 1.7, 2)], mats)
    else:
        mats[2] = material("ui-meter-trough", p["bgDeep"], 0.82, 0)
        shell(name, width, height, 7,
              [(0.25, 0, 0), (0.25, 1.1, 0), (1.1, 2.0, 1),
               (2.2, 2.5, 1), (3.5, 1.0, 2)], mats)


def chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", binascii.crc32(kind + data) & 0xffffffff)


def write_png(path, width, height, rgba):
    """Deterministic lossless RGBA8 PNG; no timestamp or device metadata."""
    stride = width * 4
    rows = []
    for y in range(height):
        row = rgba[y * stride:(y + 1) * stride]
        previous = rgba[(y - 1) * stride:y * stride] if y else bytes(stride)
        # PNG Sub and Up predictors are lossless; pick the smallest signed
        # residual per row for smaller files without palette quantization.
        candidates = [bytes(row), bytes((value - (row[x - 4] if x >= 4 else 0)) & 255 for x, value in enumerate(row)),
                      bytes((value - previous[x]) & 255 for x, value in enumerate(row))]
        filt = min(range(3), key=lambda i: sum(min(v, 256 - v) for v in candidates[i]))
        rows.append(bytes([filt]) + candidates[filt])
    data = b"".join(rows)
    unfiltered = b"".join(b"\0" + rgba[y * stride:(y + 1) * stride] for y in range(height))
    compressed = min((zlib.compress(data, 9), zlib.compress(unfiltered, 9)), key=len)
    path.write_bytes(b"\x89PNG\r\n\x1a\n" +
                     chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)) +
                     chunk(b"sRGB", b"\0") + chunk(b"IDAT", compressed) + chunk(b"IEND", b""))


def read_png(path):
    """Read the actual Cycles PNG, including all standard scanline filters."""
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("Render is not PNG")
    at, compressed = 8, b""
    while at < len(data):
        length = struct.unpack(">I", data[at:at + 4])[0]
        kind, payload = data[at + 4:at + 8], data[at + 8:at + 8 + length]
        if kind == b"IHDR":
            width, height, bits, color, _, _, interlace = struct.unpack(">IIBBBBB", payload)
            if (bits, color, interlace) != (8, 6, 0):
                raise ValueError("Expected noninterlaced RGBA8")
        elif kind == b"IDAT":
            compressed += payload
        at += length + 12
    raw, stride = zlib.decompress(compressed), width * 4
    out = bytearray(width * height * 4)
    for y in range(height):
        filt = raw[y * (stride + 1)]
        row = raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)]
        for x, value in enumerate(row):
            a = out[y * stride + x - 4] if x >= 4 else 0
            b = out[(y - 1) * stride + x] if y else 0
            c = out[(y - 1) * stride + x - 4] if y and x >= 4 else 0
            if filt == 1:
                value += a
            elif filt == 2:
                value += b
            elif filt == 3:
                value += (a + b) // 2
            elif filt == 4:
                p = a + b - c
                distances = (abs(p - a), abs(p - b), abs(p - c))
                value += (a, b, c)[distances.index(min(distances))]
            elif filt != 0:
                raise ValueError("Unknown PNG filter")
            out[y * stride + x] = value & 255
    return width, height, out


def reduce_2x(width, height, pixels):
    out = bytearray(width * height)
    for y in range(height // 2):
        for x in range(width // 2):
            src = [(2 * y + dy) * width * 4 + (2 * x + dx) * 4 for dy in (0, 1) for dx in (0, 1)]
            alpha = sum(pixels[i + 3] for i in src)
            dst = (y * (width // 2) + x) * 4
            for channel in range(3):
                out[dst + channel] = round(sum(pixels[i + channel] * pixels[i + 3] for i in src) / alpha) if alpha else 0
            out[dst + 3] = round(alpha / 4)
    return out


def file_info(path, width, height):
    data = path.read_bytes()
    return {"file": path.name, "width": width, "height": height,
            "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


def measurements(pixels, width, height, safe, foreground):
    alpha = pixels[3::4]
    result = {"transparentPixels": sum(a == 0 for a in alpha),
              "partialAlphaPixels": sum(0 < a < 255 for a in alpha),
              "opaquePixels": sum(a == 255 for a in alpha)}
    if safe:
        values, min_alpha = [], 255
        fg_lum = sum(a * linear(b) for a, b in zip((0.2126, 0.7152, 0.0722), rgb(foreground)))
        for y in range(safe["y"], safe["y"] + safe["height"]):
            for x in range(safe["x"], safe["x"] + safe["width"]):
                i = (y * width + x) * 4
                min_alpha = min(min_alpha, pixels[i + 3])
                lum = sum(a * linear(pixels[i + j] / 255) for j, a in enumerate((0.2126, 0.7152, 0.0722)))
                values.append((max(fg_lum, lum) + 0.05) / (min(fg_lum, lum) + 0.05))
        result.update({"safeTextMinAlpha": min_alpha, "minTextContrast": round(min(values), 3)})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default="public/ui/blender")
    parser.add_argument("--samples", type=int, default=64)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--seed", type=int, default=17)
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    if not 1 <= args.threads <= 4 or args.samples < 1:
        parser.error("threads must be 1..4 and samples must be positive")
    css = (ROOT / "src/ui/styles.css").read_text(encoding="utf-8")
    token_names = {"bgDeep": "bg-deep", "amberHot": "amber-hot", "amberDeep": "amber-deep",
                   "amberDim": "amber-dim", "fgMuted": "fg-muted"}
    for key, value in PALETTE.items():
        token = "--c-" + token_names.get(key, key)
        match = re.search(re.escape(token) + r"\s*:\s*(#[0-9a-fA-F]{6})\s*;", css)
        if match is None or match.group(1).lower() != value.lower():
            raise RuntimeError(f"Palette source mismatch for {token}: {value}")
    out = Path(args.out)
    out = (out if out.is_absolute() else ROOT / out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    sc = setup(args.samples, args.threads, args.seed)
    sheets = {density: bytearray(ATLAS_SIZE[0] * ATLAS_SIZE[1] * density * density * 4) for density in (1, 2)}
    manifest = {
        "schemaVersion": 1,
        "generator": {"source": "blender/ui_atlas.py", "sourceSha256": hashlib.sha256(Path(__file__).read_text(encoding="utf-8").encode("utf-8")).hexdigest(),
                      "blenderVersion": bpy.app.version_string, "engine": "CYCLES", "device": "CPU",
                      "samples": args.samples, "threads": args.threads, "seed": args.seed,
                      "colorManagement": "Standard / None / exposure 0 / gamma 1 / RGBA8 sRGB"},
        "design": {"paletteSource": ["src/ui/styles.css :root", "src/core/contract.js BRAND"],
                   "palette": PALETTE, "dimensionProvenance": "NOT SOURCED: authored UI design choices; 44px from existing --touch contract",
                   "keyLight": {"screenDirection": "upper-left", "position": [-85, 105, 150], "energy": 18000, "size": 95,
                                "provenance": "NOT SOURCED: authored UI lighting choices"},
                   "alpha": "straight RGBA; transparent corners; no baked backdrop or labels",
                   "densityPolicy": "2x CPU render; alpha-weighted 2x2 native reduction; CSS dimensions remain native",
                   "atlasGutterNativePx": GUTTER},
        "atlases": {}, "sprites": [],
    }
    for index, spec in enumerate(SPECS):
        name, role, width, height, variant, state = spec
        author(spec)
        sc.render.resolution_x, sc.render.resolution_y = width * 2, height * 2
        sc.camera.data.ortho_scale = width
        path_2x = out / (name + "@2x.png")
        sc.render.filepath = str(path_2x)
        bpy.ops.render.render(write_still=True)
        rw, rh, pixels_2x = read_png(path_2x)
        if (rw, rh) != (width * 2, height * 2):
            raise RuntimeError("Render dimensions differ from source contract")
        # Hidden RGB is zeroed, preserving straight-alpha visible pixels and
        # avoiding edge halos in consumers that inspect/interpolate transparent RGB.
        for i in range(0, len(pixels_2x), 4):
            if pixels_2x[i + 3] == 0:
                pixels_2x[i:i + 3] = b"\0\0\0"
        pixels_1x = reduce_2x(rw, rh, pixels_2x)
        safe = {"x": 12 if width == 144 else 10, "y": 10, "width": width - (24 if width == 144 else 20), "height": 24} if role == "button" else (
            {"x": 10, "y": 5, "width": 68, "height": 14} if role == "badge" else None)
        fg = PALETTE["fgMuted" if state == "disabled" else ("amberDeep" if variant == "accent" else "fg")]
        x, y = GUTTER + (index % 2) * SLOT_SIZE[0], GUTTER + (index // 2) * SLOT_SIZE[1]
        entry = {"id": name, "role": role, "variant": variant, "state": state,
                 "native": {"width": width, "height": height}, "safeText": safe,
                 "recommendedForeground": fg, "atlas": {"x": x, "y": y, "width": width, "height": height},
                 "files": {}, "metrics": measurements(pixels_1x, width, height, safe, fg)}
        entry["metricsByDensity"] = {"1x": entry["metrics"], "2x": measurements(
            pixels_2x, width * 2, height * 2, {k: v * 2 for k, v in safe.items()} if safe else None, fg)}
        if role == "meter":
            entry["safeFill"] = {"x": 10, "y": 8, "width": 140, "height": 8}
        for density, pixels in ((1, pixels_1x), (2, pixels_2x)):
            path = out / (name + ("@2x" if density == 2 else "") + ".png")
            write_png(path, width * density, height * density, pixels)
            entry["files"][f"{density}x"] = file_info(path, width * density, height * density)
            aw, sw = ATLAS_SIZE[0] * density, width * density
            for row in range(height * density):
                start = ((y * density + row) * aw + x * density) * 4
                sheets[density][start:start + sw * 4] = pixels[row * sw * 4:(row + 1) * sw * 4]
        for density, metrics in entry["metricsByDensity"].items():
            if safe and (metrics["safeTextMinAlpha"] != 255 or metrics["minTextContrast"] < 4.5):
                raise RuntimeError(f"Text-safe surface failed: {name} {density} {metrics}")
        manifest["sprites"].append(entry)
        print(f"UI_SPRITE {name} {json.dumps(entry['metrics'])}")
    for density in (1, 2):
        path = out / ("ui-atlas" + ("@2x" if density == 2 else "") + ".png")
        width, height = (n * density for n in ATLAS_SIZE)
        write_png(path, width, height, sheets[density])
        manifest["atlases"][f"{density}x"] = file_info(path, width, height)
    total = sum(v["bytes"] for sprite in manifest["sprites"] for v in sprite["files"].values()) + sum(v["bytes"] for v in manifest["atlases"].values())
    manifest["totalPngBytes"] = total
    if total > 400 * 1024:
        raise RuntimeError(f"PNG export exceeds 400KiB: {total}")
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"UI_ATLAS_OK sprites={len(SPECS)} totalPngBytes={total} output={out}")


if __name__ == "__main__":
    main()

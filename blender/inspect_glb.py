"""Read an exported .glb back and report what is actually in it.

Intent is not evidence. This parses the JSON chunk of the binary and prints
the node graph, the materials, the per-mesh primitive count and the triangle
count, so a claim about draw calls can be checked rather than asserted.

    python blender/inspect_glb.py public/models/pd55.glb
"""
import json
import struct
import sys


def load(path):
    with open(path, 'rb') as f:
        data = f.read()
    magic, ver, total = struct.unpack('<III', data[:12])
    assert magic == 0x46546C67, 'not a glb'
    off = 12
    js = None
    while off < total:
        clen, ctype = struct.unpack('<II', data[off:off + 8])
        chunk = data[off + 8:off + 8 + clen]
        if ctype == 0x4E4F534A:
            js = json.loads(chunk.decode('utf-8'))
        off += 8 + clen + ((4 - clen % 4) % 4 if clen % 4 else 0)
    return js, len(data)


def main(path):
    g, nbytes = load(path)
    nodes = g.get('nodes', [])
    meshes = g.get('meshes', [])
    mats = g.get('materials', [])
    accs = g.get('accessors', [])

    prims = 0
    tris = 0
    per_mesh = []
    for m in meshes:
        p = m.get('primitives', [])
        prims += len(p)
        t = 0
        for pr in p:
            if 'indices' in pr:
                t += accs[pr['indices']]['count'] // 3
            else:
                t += accs[pr['attributes']['POSITION']]['count'] // 3
        tris += t
        per_mesh.append((m.get('name', '?'), len(p), t))

    print('file            %s  (%.2f MB)' % (path, nbytes / 1048576.0))
    print('nodes           %d' % len(nodes))
    print('meshes          %d' % len(meshes))
    print('PRIMITIVES      %d      <- draw calls, budget 70' % prims)
    print('TRIANGLES       %d' % tris)
    print('materials       %d  %s' % (len(mats), [m.get('name') for m in mats]))

    print('\n--- meshes by triangle count ---')
    for n, p, t in sorted(per_mesh, key=lambda r: -r[2]):
        print('  %-34s prims=%d  tris=%d' % (n, p, t))

    print('\n--- node graph ---')
    child_of = {}
    for i, n in enumerate(nodes):
        for c in n.get('children', []):
            child_of[c] = i
    roots = [i for i in range(len(nodes)) if i not in child_of]

    def walk(i, d):
        n = nodes[i]
        tag = ''
        if 'mesh' in n:
            mm = meshes[n['mesh']]
            tag = '  [mesh %d prim]' % len(mm.get('primitives', []))
        print('%s%s%s' % ('  ' * d, n.get('name', '?'), tag))
        for c in n.get('children', []):
            walk(c, d + 1)
    for r in roots:
        walk(r, 0)

    print('\n--- game-contract nodes ---')
    for pre in ('pivot:', 'slide:', 'mount:', 'aim:'):
        names = sorted(n.get('name', '') for n in nodes
                       if n.get('name', '').startswith(pre))
        print('  %-8s %d  %s' % (pre, len(names), names))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'public/models/pd55.glb')

"""Parse a .glb, print node graph, materials, primitive count and triangles.

Reads the file, not the intent. `python tools/glb_report.py public/models/x.glb`
"""
import sys, json, struct


def load(path):
    with open(path, 'rb') as f:
        data = f.read()
    magic, ver, length = struct.unpack_from('<III', data, 0)
    assert magic == 0x46546C67, 'not a glb'
    off = 12
    js = None
    bins = None
    while off < length:
        clen, ctype = struct.unpack_from('<II', data, off)
        chunk = data[off + 8: off + 8 + clen]
        if ctype == 0x4E4F534A:
            js = json.loads(chunk.decode('utf-8'))
        elif ctype == 0x004E4942:
            bins = chunk
        off += 8 + clen + ((4 - clen % 4) % 4 if clen % 4 else 0)
    return js, bins, len(data)


def acc_count(g, i):
    return g['accessors'][i]['count']


def main(path):
    g, b, size = load(path)
    print('FILE %s  %d bytes' % (path, size))
    mats = [m.get('name', '?') for m in g.get('materials', [])]
    print('MATERIALS (%d): %s' % (len(mats), ', '.join(mats)))

    prims = 0
    tris = 0
    per_mesh = []
    for m in g.get('meshes', []):
        mt = 0
        for p in m['primitives']:
            prims += 1
            if 'indices' in p:
                n = acc_count(g, p['indices']) // 3
            else:
                n = acc_count(g, p['attributes']['POSITION']) // 3
            mt += n
        tris += mt
        per_mesh.append((m.get('name', '?'), len(m['primitives']), mt))
    print('PRIMITIVES (= draw calls): %d      TRIANGLES: %d' % (prims, tris))
    print('')
    print('MESHES:')
    for nm, np_, nt in sorted(per_mesh, key=lambda r: -r[2]):
        print('  %-34s prims=%d  tris=%6d' % (nm, np_, nt))

    nodes = g.get('nodes', [])
    kids = set()
    for n in nodes:
        kids.update(n.get('children', []))
    roots = [i for i in range(len(nodes)) if i not in kids]

    named = [n.get('name', '') for n in nodes]
    print('')
    print('GAME-CONTRACT NODES:')
    for pfx in ('pivot:', 'slide:', 'mount:', 'aim:'):
        hit = sorted([n for n in named if n.startswith(pfx)])
        print('  %-7s %2d  %s' % (pfx, len(hit), ', '.join(hit)))

    print('')
    print('NODE GRAPH (%d nodes):' % len(nodes))

    def walk(i, d):
        n = nodes[i]
        mesh = ''
        if 'mesh' in n:
            mm = g['meshes'][n['mesh']]
            t = sum((acc_count(g, p['indices']) // 3) if 'indices' in p
                    else acc_count(g, p['attributes']['POSITION']) // 3
                    for p in mm['primitives'])
            mats_here = [mats[p['material']] for p in mm['primitives'] if 'material' in p]
            mesh = '  [mesh %s  %d tris]' % ('/'.join(mats_here), t)
        tr = n.get('translation')
        loc = ''
        if tr:
            loc = '  @(%.2f, %.2f, %.2f)' % tuple(tr)
        print('%s%s%s%s' % ('  ' * d, n.get('name', '?'), loc, mesh))
        for c in n.get('children', []):
            walk(c, d + 1)

    for r in roots:
        walk(r, 1)


if __name__ == '__main__':
    main(sys.argv[1])

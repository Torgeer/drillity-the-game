"""Parse an exported .glb and report what is ACTUALLY in the file.
Usage: python blender/glb_report.py public/models/cfa_rig.glb
"""
import json
import struct
import sys


def load(path):
    with open(path, 'rb') as f:
        data = f.read()
    magic, ver, length = struct.unpack_from('<III', data, 0)
    assert magic == 0x46546C67, 'not a glb'
    off = 12
    js = None
    while off < len(data):
        clen, ctype = struct.unpack_from('<II', data, off)
        off += 8
        if ctype == 0x4E4F534A:
            js = json.loads(data[off:off + clen].decode('utf-8'))
        off += clen
    return js, len(data)


def main(path):
    g, nbytes = load(path)
    acc = g.get('accessors', [])
    mats = [m.get('name', '?') for m in g.get('materials', [])]
    meshes = g.get('meshes', [])
    nodes = g.get('nodes', [])

    owner = {}
    for nd in nodes:
        if 'mesh' in nd:
            owner.setdefault(nd['mesh'], nd.get('name', '?'))

    prim_count = 0
    tri_total = 0
    rows = []
    for mi, m in enumerate(meshes):
        m = dict(m)
        m['name'] = owner.get(mi, m.get('name', '?'))
        for p in m.get('primitives', []):
            prim_count += 1
            if 'indices' in p:
                n = acc[p['indices']]['count'] // 3
            else:
                n = acc[p['attributes']['POSITION']]['count'] // 3
            tri_total += n
            mat = mats[p['material']] if 'material' in p else '(none)'
            rows.append((n, m.get('name', '?'), mat,
                         acc[p['attributes']['POSITION']]['count']))

    print('FILE            %s' % path)
    print('BYTES           %d (%.2f MB)' % (nbytes, nbytes / 1048576.0))
    print('MATERIALS  %2d   %s' % (len(mats), ', '.join(mats)))
    print('MESHES     %2d   NODES %d' % (len(meshes), len(nodes)))
    print('PRIMITIVES %2d   <-- draw calls' % prim_count)
    print('TRIANGLES  %d' % tri_total)
    print()
    print('%-9s %-9s %-28s %s' % ('TRIS', 'VERTS', 'MESH', 'MATERIAL'))
    for n, nm, mat, nv in sorted(rows, reverse=True):
        print('%-9d %-9d %-28s %s' % (n, nv, nm[:28], mat))
    print()
    print('NODE GRAPH')
    children = set()
    for nd in nodes:
        for c in nd.get('children', []):
            children.add(c)

    def walk(i, d):
        nd = nodes[i]
        tag = ''
        if 'mesh' in nd:
            tag = '  [mesh %d, %d prim]' % (
                nd['mesh'], len(meshes[nd['mesh']].get('primitives', [])))
        t = nd.get('translation')
        pos = ''
        if t:
            pos = '  @(%.2f, %.2f, %.2f)' % (t[0], t[1], t[2])
        print('%s%s%s%s' % ('  ' * d, nd.get('name', '?'), pos, tag))
        for c in nd.get('children', []):
            walk(c, d + 1)

    for i, nd in enumerate(nodes):
        if i not in children:
            walk(i, 0)
    print()
    print('NAMED GAME NODES')
    for nd in nodes:
        nm = nd.get('name', '')
        if nm.startswith(('pivot:', 'slide:', 'mount:', 'aim:')):
            ex = nd.get('extras', {})
            print('  %-28s %s' % (nm, ex if ex else ''))


if __name__ == '__main__':
    main(sys.argv[1])

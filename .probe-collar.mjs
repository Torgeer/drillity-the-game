/** How close does each shipped site .glb come to the collar, and does anything
 *  it carries sit OVER the collar hardware / the section seam row (world y=0
 *  at x,z = 0)? Vertices only, real exported bytes, no GPU. */
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const loader = new GLTFLoader();
import { readdirSync } from 'node:fs';
const IDS = readdirSync(new URL('./public/models/sites/', import.meta.url)).filter(f=>f.endsWith('.glb')).map(f=>f.slice(0,-4));
for (const id of IDS) {
  const buf = readFileSync(new URL(`./public/models/sites/${id}.glb`, import.meta.url));
  const gltf = await loader.parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '');
  gltf.scene.updateMatrixWorld(true);
  const p = new THREE.Vector3();
  let minR = Infinity, nearCollar = 0, overCollar = 0, verts = 0;
  const RING = 3.0;          // terrain.js: collar spoil ring reaches r < 3.0
  const bands = new Map();
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const pos = o.geometry.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      verts++;
      const r = Math.hypot(p.x, p.z);
      if (r < minR) minR = r;
      if (r < RING) {
        nearCollar++;
        if (p.y > 0.02) { overCollar++; bands.set(o.name, (bands.get(o.name) || 0) + 1); }
      }
    }
  });
  console.log(`${id}: verts=${verts} minRadiusFromCollar=${minR.toFixed(3)} m  `
    + `vertsWithin${RING}m=${nearCollar}  ofThoseAboveY0.02=${overCollar}`);
  for (const [n, c] of bands) console.log(`    ${n}: ${c}`);
}

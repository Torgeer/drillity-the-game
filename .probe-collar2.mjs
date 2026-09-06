import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const loader = new GLTFLoader();
for (const id of ['quarry-bench']) {
  const buf = readFileSync(new URL(`./public/models/sites/${id}.glb`, import.meta.url));
  const gltf = await loader.parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '');
  gltf.scene.updateMatrixWorld(true);
  const p = new THREE.Vector3();
  const per = new Map();
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const pos = o.geometry.getAttribute('position');
    let minR = Infinity, yAtMin = 0, maxYnear = -Infinity, nearN = 0, ys = [];
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      const r = Math.hypot(p.x, p.z);
      if (r < minR) { minR = r; yAtMin = p.y; }
      if (r < 3.0) { nearN++; ys.push(p.y); if (p.y > maxYnear) maxYnear = p.y; }
    }
    ys.sort((a,b)=>a-b);
    per.set(o.name, { minR, yAtMin, nearN, maxYnear,
      yMed: ys.length ? ys[ys.length>>1] : null, yMin: ys[0] ?? null });
  });
  console.log(id);
  for (const [n, v] of per) {
    console.log(`  ${n.padEnd(22)} minR=${v.minR.toFixed(3)} y@minR=${v.yAtMin.toFixed(3)} `
      + `near=${v.nearN} yNear[min/med/max]=${v.yMin===null?'-':v.yMin.toFixed(3)}/${v.yMed===null?'-':v.yMed.toFixed(3)}/${v.maxYnear===-Infinity?'-':v.maxYnear.toFixed(3)}`);
  }
}

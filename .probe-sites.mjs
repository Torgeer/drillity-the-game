/**
 * SCRATCH PROBE (not a gate, not committed as a ruler): measure the PROCEDURAL
 * site each archetype builds today, per plane, so `replaces`/kit-suppression
 * decisions are evidence-based. CPU only, real terrain.js, no GPU.
 *   node .probe-sites.mjs
 */
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import * as THREE from 'three';

const hooks = registerHooks({
  load(url, context, next) {
    if (url.endsWith('/src/ui/assets/logo-full.png')) {
      return { format: 'module', source: `export default ${JSON.stringify(url)}`, shortCircuit: true };
    }
    return next(url, context);
  },
});
function imageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4).fill(255) }; }
function canvas() {
  const c = { width: 1, height: 1 };
  const noop = () => {};
  const gradient = () => ({ addColorStop: noop });
  const g = { canvas: c, createImageData: imageData, getImageData: (_x, _y, w, h) => imageData(w, h),
    createLinearGradient: gradient, createRadialGradient: gradient,
    measureText: (t) => ({ width: String(t).length * 10 }) };
  for (const m of ['arc','beginPath','bezierCurveTo','clearRect','clip','closePath','drawImage','ellipse','fill','fillRect','fillText','lineTo','moveTo','putImageData','quadraticCurveTo','rect','restore','rotate','roundRect','save','scale','setLineDash','setTransform','stroke','strokeRect','strokeText','transform','translate']) g[m] = noop;
  c.getContext = () => g;
  return c;
}
globalThis.document = { baseURI: 'https://probe.invalid/', createElement: () => canvas() };
globalThis.Image = class { width = 512; height = 128; set src(_v) { queueMicrotask(() => this.onload?.()); } };
globalThis.fetch = async () => new Response('missing', { status: 404 });

const { createTerrain } = await import('./src/world/terrain.js');
const src = readFileSync(new URL('./src/world/terrain.js', import.meta.url), 'utf8');

// archetype ids straight out of the source, so the probe cannot drift from it
const block = src.slice(src.indexOf('const ARCHETYPES = {'));
const ARCH = [...block.slice(0, block.indexOf('\n};')).matchAll(/^  '([a-z-]+)':/gm)].map((m) => m[1]);

const METHOD = process.argv.includes('--ug') ? 'rockbolt' : 'cfa';
const REGION = process.env.PROBE_REGION || 'nordic';

console.log(`# probe region=${REGION} method=${METHOD} archetypes=${ARCH.length}`);
for (const id of ARCH) {
  const scene = new THREE.Scene();
  const t = createTerrain({ THREE, scene, quality: { id: 'high', particles: 1, anisotropy: 4 },
    state: { world: { regionId: REGION, weather: 'clear' } } });
  await t.init();
  t.setMethod(METHOD);
  t.setArchetype(id);
  const inst = [], props = [], other = [];
  let draws = 0;
  t.root.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    draws++;
    if (o.isInstancedMesh) inst.push(`${o.name}x${o.count}`);
    else if (o.name.startsWith('props-')) props.push(`${o.name}:${o.geometry.attributes.position.count}v`);
    else other.push(o.name || '(unnamed)');
  });
  const h = (x, z) => t.heightAt(x, z).toFixed(3);
  console.log([
    `arch=${id}`,
    `plane=${(src.match(new RegExp(`'${id}':[^\n]*plane: '(\w+)'`)) || [, '-'])[1]}`,
    `drive=${t.drive ? t.drive.id : 'null'}`,
    `draws=${draws}`,
    `h00=${h(0, 0)} h10=${h(10, 10)} h40=${h(40, 0)}`,
  ].join(' '));
  console.log(`    instanced[${inst.length}]: ${inst.join(' ') || '-'}`);
  console.log(`    propPool[${props.length}]: ${props.join(' ') || '-'}`);
  console.log(`    other[${other.length}]: ${other.join(' ') || '-'}`);
  t.dispose();
}
hooks.deregister();

import { readFileSync } from 'node:fs';
const src = readFileSync('src/core/preview.js','utf8');
// pull out the hint table + resolver without importing three
const start = src.indexOf('const CATEGORY_MODEL_HINTS');
const end = src.indexOf('export function createPreview');
const mod = src.slice(start, end) + '\nexport { modelIdFor, CATEGORY_MODEL_HINTS };';
const b64 = Buffer.from(mod).toString('base64');
const { modelIdFor } = await import('data:text/javascript;base64,' + b64);

const ids = ['auger-flight-std','rod-r32','dth-hammer-4','dth-hammer-6','dth-bit-152','dth-bit-115',
 'core-bit-nq','core-bit-hq','shank-adapter-t45','coupling-sleeve-t45','drilling-bucket-900',
 'compressor-portable-12','compressor-portable-25','casing-crown-168','polymer-additive',
 'button-bit-t45','tricone-200','pdc-152','ring-bit-140','wing-bit-168','kelly-auger-800',
 'cfa-flight-600','rotary-drive-kdk','flushing-swivel','shock-absorber','sda-bar-r32',
 'backreamer-450','hdd-pilot-head','sonde-housing','mud-pump-500','generator-60','pick-round-shank',
 'th-90','dth-220','kelly-28'];
let dflt = 0;
for (const id of ids) {
  const m = modelIdFor({ id, name: id.replace(/-/g,' ') });
  if (m === 'button-bit' && !/button/.test(id)) { dflt++; console.log('  FALLTHROUGH', id, '->', m); }
  else console.log('  ok', id.padEnd(24), '->', m);
}
console.log('\nfallthroughs:', dflt, '/', ids.length);

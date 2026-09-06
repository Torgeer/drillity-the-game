/** Real contract generator: which (method, archetype) pairs actually ship?
 *  makeContract(regionId, level, rand) — signature read from data.js:5701. */
import * as data from './src/game/data.js';
import { makeRandom } from './src/core/contract.js';
import { UNDERGROUND } from './src/core/env.js';
const { makeContract, REGIONS, MAX_LEVEL } = data;
const regions = REGIONS.map((r) => r.id);
console.log('regions:', regions.join(','), 'MAX_LEVEL=', MAX_LEVEL);
const pairs = new Map();
let n = 0, withArch = 0;
for (const rid of regions) {
  for (let level = 1; level <= (MAX_LEVEL || 60); level++) {
    for (let s = 0; s < 40; s++) {
      const c = makeContract(rid, level, makeRandom(s * 7919 + level * 131 + rid.length));
      if (!c) continue;
      n++; if (c.archetype) withArch++;
      const key = `${UNDERGROUND[c.methodId] ? 'UG' : 'SF'} ${c.methodId} @${rid} -> ${c.archetype}`;
      pairs.set(key, (pairs.get(key) || 0) + 1);
    }
  }
}
console.log(`contracts=${n} withArchetype=${withArch} distinctPairs=${pairs.size}`);
const bad1 = [...pairs].filter(([k]) => k.startsWith('SF') && k.endsWith('-> underground-drive'));
const bad2 = [...pairs].filter(([k]) => k.startsWith('UG') && !k.endsWith('-> underground-drive'));
console.log(`\nSURFACE method on underground-drive archetype: ${bad1.length} shapes, ${bad1.reduce((a,[,v])=>a+v,0)} contracts`);
for (const [k,v] of bad1.sort((a,b)=>b[1]-a[1]).slice(0,20)) console.log(`  ${v}\t${k}`);
console.log(`\nUNDERGROUND method on a surface archetype: ${bad2.length} shapes`);
for (const [k,v] of bad2.slice(0,10)) console.log(`  ${v}\t${k}`);
const off = [...pairs].filter(([k]) => /-> (platform-deck|marine-spread)/.test(k));
console.log(`\noffshore archetype pairs: ${off.length} shapes, ${off.reduce((a,[,v])=>a+v,0)} contracts`);
const offRegions = new Set(off.map(([k]) => k.match(/@([a-z-]+) ->/)[1]));
console.log('  regions that ship an offshore archetype:', [...offRegions].join(','));

import * as data from './src/game/data.js';
import { UNDERGROUND } from './src/core/env.js';
const mk = data.makeContract;
console.log('makeContract.length =', mk.length);
const regions = data.REGION_DEFS.map((r) => r.id);
const c0 = mk(1, 'nordic');
console.log('sample keys:', Object.keys(c0).join(','));
console.log('sample:', JSON.stringify({ methodId: c0.methodId, archetype: c0.archetype, regionId: c0.regionId, applicationId: c0.applicationId }));
const pairs = new Map();
let n = 0, withArch = 0;
for (let seed = 0; seed < 6000; seed++) for (const rid of regions) {
  const c = mk(seed, rid); if (!c) continue; n++;
  if (c.archetype) withArch++;
  const key = `${UNDERGROUND[c.methodId] ? 'UG' : 'SF'}:${c.methodId} -> ${c.archetype}`;
  pairs.set(key, (pairs.get(key) || 0) + 1);
}
console.log(`n=${n} withArchetype=${withArch}`);
const ugArch = [...pairs].filter(([k]) => k.includes('-> underground-drive'));
console.log('pairs landing on underground-drive:');
for (const [k, v] of ugArch.sort((a,b)=>b[1]-a[1])) console.log(`  ${v}\t${k}`);
console.log('distinct method->archetype pairs:', pairs.size);
const offshore = [...pairs].filter(([k]) => /-> (platform-deck|marine-spread)/.test(k));
console.log('pairs landing offshore:', offshore.length);
for (const [k,v] of offshore.sort((a,b)=>b[1]-a[1]).slice(0,12)) console.log(`  ${v}\t${k}`);

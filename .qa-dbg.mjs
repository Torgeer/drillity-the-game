import { chromium, devices } from 'playwright';
const b = await chromium.launch({ args: ['--mute-audio'], headless: false, channel: 'chrome' });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto('http://localhost:5178/?quality=low&shot', { waitUntil:'load' });
await p.waitForFunction(() => window.__DRILLITY?.ui && window.__DRILLITY?.sim, null, {timeout:40000});
await p.waitForTimeout(2500);
console.log(await p.evaluate(() => {
  const c = window.__DRILLITY;
  return { ui: typeof c.ui, show: typeof c.ui?.show, sim: typeof c.sim?.abortHole, geo: typeof c.geology?.generateProfile, rig: typeof c.rig?.setMethod, keys: Object.keys(c).slice(0,40) };
}));
await b.close();

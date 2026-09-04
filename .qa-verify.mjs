/**
 * HUD verification for the six new methods.
 *
 * Drives sim/drilling.js into each method, then reads BOTH the sim telemetry
 * and the DOM the HUD painted from it, so every claim on screen can be checked
 * against the number it came from. Writes JSON + PNGs to the scratchpad.
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = 'C:/Users/henri/AppData/Local/Temp/claude/C--Users-henri-Downloads-threads/58b8454d-8bd2-4e3d-8c05-92b4953f6ab5/scratchpad';
const OUT = resolve(HERE, 'hud');
mkdirSync(OUT, { recursive: true });

const BASE = process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'http://localhost:5178/';
const URL_ = `${BASE}${BASE.includes('?') ? '&' : '?'}quality=low&shot`;

const CASES = [
  { id: 'rc', method: 'rc', depth: 40, loadout: { bit: 'rc-hammer-bit', probe: null }, settle: 9000 },
  { id: 'tunnel-jumbo', method: 'tunnel-jumbo', depth: 24, loadout: { bit: 'button-bit-89' }, settle: 9000 },
  { id: 'longhole', method: 'longhole', depth: 30, loadout: { bit: 'button-bit-89' }, settle: 9000 },
  { id: 'rockbolt', method: 'rockbolt', depth: 12, loadout: { bit: 'bolt-bit-33' }, settle: 11000 },
  { id: 'driven-pile', method: 'driven-pile', depth: 16, loadout: { dolly: 'dolly-hardwood' }, settle: 12000 },
  { id: 'si-spt', method: 'site-investigation', depth: 18, loadout: { probe: 'spt-split-spoon', bit: 'tricone-152' }, settle: 11000 },
  { id: 'si-cpt', method: 'site-investigation', depth: 18, loadout: { probe: 'cpt-piezocone' }, settle: 9000 },
  // The already-shipped two-stage method: the gauge becomes PULL on the way back.
  { id: 'raise-boring', method: 'raise-boring', depth: 40, loadout: {}, settle: 9000 },
  // A stringless method: no rod to add, EVENTS.BAILER_RUN instead.
  { id: 'cable-tool', method: 'cable-tool', depth: 20, loadout: { bit: 'chisel-bit' }, settle: 9000 },
];

const PROBE_WITH_TOKEN = () => {
  const c = window.__DRILLITY;
  const tl = c?.sim?.getTelemetry?.() || null;
  const q = (s) => document.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];
  const txt = (s) => (q(s) ? q(s).textContent.trim() : null);
  const vis = (s) => { const n = q(s); return !!n && !n.hidden && n.offsetParent !== null; };
  return {
    token: window.__QA_TOKEN || null,
    tel: tl && {
      methodId: tl.methodId, kind: tl.method && tl.method.kind, phase: tl.phase,
      hasDrillString: tl.hasDrillString,
      gauge: tl.gauge && {
        axis: tl.gauge.axis, label: tl.gauge.label, unit: tl.gauge.unit,
        value: +Number(tl.gauge.value).toFixed(3), display: +Number(tl.gauge.display).toFixed(3),
        real: tl.gauge.real, max: tl.gauge.max,
      },
      band: tl.sweetSpot && { c: +Number(tl.sweetSpot.center01).toFixed(3), h: +Number(tl.sweetSpot.halfWidth01).toFixed(3) },
      stage: tl.stage, stageId: tl.stageId, stageName: tl.stageName, reverse: tl.stageReverse,
      programme: tl.programme,
      beat: tl.beat && { kind: tl.beat.kind, t: +Number(tl.beat.t).toFixed(2), dur: +Number(tl.beat.dur).toFixed(2), data: tl.beat.data },
      actions: tl.actions,
      hazards: tl.hazards,
      warning: tl.warning && tl.warning.kind,
      score: tl.score && { grade: tl.score.grade, total: tl.score.total, quality: tl.score.quality, weights: tl.score.weights },
    },
    dom: {
      depthKey: txt('.sstrip__cell:nth-of-type(2) .sstrip__k') || txt('.sstrip__k'),
      depthKeys: all('.sstrip__k').map((n) => n.textContent.trim()),
      gaugeCap: txt('.gaugebox__cap'),
      gaugeAria: q('.gaugebox') ? q('.gaugebox').getAttribute('aria-label') : null,
      sliders: all('.vsl').map((n) => ({
        short: n.querySelector('.vsl__name')?.textContent.trim(),
        aria: n.getAttribute('aria-label'),
        locked: n.classList.contains('is-locked'),
      })),
      meters: all('.meterrow').map((n) => ({
        k: n.querySelector('.meterrow__k')?.textContent.trim(),
        v: n.querySelector('.meterrow__v')?.textContent.trim(),
        bar: n.querySelector('.bar')?.className,
        fill: n.querySelector('.bar')?.style.getPropertyValue('--v'),
        mark: n.querySelector('.bar')?.style.getPropertyValue('--m'),
      })),
      progVisible: vis('.progbar'),
      progChip: txt('.progbar__chip'),
      progCells: all('.pcell').filter((n) => !n.hidden).map((n) => `${n.querySelector('.pcell__k').textContent} = ${n.querySelector('.pcell__v').textContent}`),
      progNote: txt('.progbar__note'),
      beatVisible: vis('.beat'),
      beatTitle: txt('.beat__t'), beatSub: txt('.beat__s'), beatLeft: txt('.beat__left'),
      beatSteps: all('.beat__step').map((n) => `${n.textContent}${n.classList.contains('is-on') ? '*' : n.classList.contains('is-done') ? '.' : ''}`),
      beatStepsVisible: vis('.beat__steps'),
      railVisible: vis('.actrail'),
      rail: all('.railbtn').filter((n) => !n.hidden).map((n) => ({
        l: n.querySelector('.railbtn__l').textContent, dis: n.classList.contains('is-disabled'), due: n.classList.contains('is-due'),
      })),
      blowVisible: vis('.blowchart'),
      blowCap: txt('.blowchart__cap'),
      dlogVisible: vis('.dlog'),
      dlog: all('.dlog__r').map((n) => n.textContent.trim()),
      action: { l: txt('.actionbtn__l'), s: txt('.actionbtn__s'), cls: q('.actionbtn')?.className },
      hazard: vis('.hazard') ? `${txt('.hazard__t')} — ${txt('.hazard__s')}` : null,
    },
  };
};

const run = async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const ctx = await browser.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  // Other agents are saving files continuously and every save full-reloaded the
  // page out from under the probe. Stub Vite's HMR client so the page holds.
  const VITE_STUB = `export const createHotContext = () => ({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},get data(){return{}}});
export function updateStyle(id,c){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=c;}
export function removeStyle(id){const s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(s)s.remove();}
export function injectQuery(u){return u;} export class ErrorOverlay extends HTMLElement{}`;
  await ctx.route('**/@vite/client', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: VITE_STUB }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));

  await page.goto(URL_, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.ui && window.__DRILLITY.sim, null, { timeout: 40000 });
  await page.waitForTimeout(2500);

  const report = { errors, cases: [] };

  const bootWait = async () => {
    await page.waitForFunction(() => !!(window.__DRILLITY && window.__DRILLITY.ui
      && window.__DRILLITY.ui.show && window.__DRILLITY.sim), null, { timeout: 60000 });
    await page.waitForTimeout(1800);
  };

  for (const cse of CASES) {
    let result = null;
    for (let attempt = 0; attempt < 4 && !result; attempt++) {
      await bootWait();
      await page.evaluate((c0) => {
        const c = window.__DRILLITY;
        window.__QA_TOKEN = c0.id;
        try { c.sim.abortHole('qa'); } catch (e) { /* not running */ }
        c.state.player.level = 60;
        const lo = c.state.garage.loadout;
        for (const k of Object.keys(c0.loadout)) lo[k] = c0.loadout[k];
        const contract = {
          id: 'qa-' + c0.id, title: 'QA ' + c0.id, client: 'QA',
          region: 'nordic', regionId: 'nordic',
          method: c0.method, methodId: c0.method,
          applicationId: 'site-investigation',
          target: c0.depth, targetDepth: c0.depth,
          holeDia: 152, holes: 1, payout: 9000, deadlineHours: 24,
          difficulty: 2, requiredCerts: [], seed: 7,
        };
        c.state.contract = contract;
        c.state.world.regionId = 'nordic';
        try {
          c.geology && c.geology.generateProfile && c.geology.generateProfile({
            regionId: 'nordic', applicationId: 'site-investigation',
            targetDepth: c0.depth, seed: 1337, difficulty: 2, methodId: c0.method,
          });
        } catch (e) { /* geology mid-edit */ }
        try { c.rig && c.rig.setMethod && c.rig.setMethod(c0.method); } catch (e) { /* rig mid-edit */ }
        c.ui.show('site', { contract });
        c.sim.setInput('feed', 0.55);
        c.sim.setInput('rotation', 0.6);
        c.sim.setInput('flush', 0.6);
      }, cse);

      const samples = [];
      const step = 400;
      let reloaded = false;
      for (let t = 0; t < cse.settle; t += step) {
        await page.waitForTimeout(step);
        let s;
        try { s = await page.evaluate(PROBE_WITH_TOKEN); } catch (e) { reloaded = true; break; }
        if (!s || s.token !== cse.id) { reloaded = true; break; }
        samples.push(s);
      }
      if (reloaded || !samples.length) {
        console.log(`  ${cse.id}: page reloaded under the run (attempt ${attempt + 1}) — retrying`);
        continue;
      }
      const beats = samples.filter((s) => s.dom.beatVisible);
      const last = samples[samples.length - 1];
      result = {
        id: cse.id, method: cse.method,
        final: last,
        beatSamples: beats.slice(0, 2).concat(beats.slice(-2)),
        beatCount: beats.length,
        railSeen: [...new Set(samples.flatMap((s) => s.dom.rail.map((r) => r.l)))],
        gaugeAxes: [...new Set(samples.map((s) => s.tel && s.tel.gauge && s.tel.gauge.axis))],
        gaugeCaps: [...new Set(samples.map((s) => s.dom.gaugeCap))],
        actionsSeen: [...new Set(samples.map((s) => s.dom.action.l))],
        sliderShorts: [...new Set(samples.map((s) => s.dom.sliders.map((x) => x.short + (x.locked ? '(locked)' : '')).join(' | ')))],
      };
      await page.screenshot({ path: resolve(OUT, `${cse.id}.png`) });
    }
    report.cases.push(result || { id: cse.id, method: cse.method, failed: 'page kept reloading' });
    console.log(`  ${cse.id}: ${result ? 'captured' : 'FAILED'}`);
  }

  writeFileSync(resolve(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log('errors:', errors.length);
  for (const e of errors.slice(0, 20)) console.log('  ', e);
  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });

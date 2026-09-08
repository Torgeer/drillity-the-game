/** Native DOM activation + real contract-screen wiring; no game/WebGL boot. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i < 0 ? fallback : process.argv[i + 1];
};
const lease = arg('lease', 'native-click');
assert.equal(readFileSync(resolve(arg('lease-file', '../drillity-coordination/gpu-owner.txt')), 'utf8').trim(), lease,
  'Wait for the coordinator browser lease before running');
const port = Number(arg('port', '5221'));
const paths = ['src/ui/components.js', 'src/ui/screens/contracts.js'];
const hashes = () => Object.fromEntries(paths.map((path) => [path,
  createHash('sha256').update(readFileSync(resolve(path))).digest('hex')]));
const sourceBefore = hashes();
const html = `<!doctype html><html lang="en"><meta charset="utf-8">
<link rel="icon" href="data:,"><title>Tap activation fixture</title>
<style>button { min-width:44px; min-height:44px; margin:4px } .sheet { background:white; position:fixed; inset:0; overflow:auto } .sheet__actions { position:fixed; bottom:0; background:white }</style>
<body><div id="primitive"></div><div id="board"></div>
<script type="module">
import * as C from '/src/ui/components.js';
import * as G from '/src/game/data.js';
import { useGameData } from '/src/ui/screens/catalog.js';
import { createContractsScreen } from '/src/ui/screens/contracts.js';
useGameData(G);
const metrics = { taps:0, haptics:0, nav:0, preview:0, accepted:0, closed:0 };
C.setHapticSink(() => { metrics.haptics++; });
const plain = C.Button({ label:'Test tap', onTap:() => { metrics.taps++; } });
plain.id = 'plain'; document.querySelector('#primitive').append(plain);
const rows = [
  { id:'native-auger', title:'Auger fixture', method:'auger', region:'nordic', target:10, holes:1, payout:1000, unitNoun:'hole' },
  { id:'native-core', title:'Core fixture', method:'core', region:'nordic', target:10, holes:1, payout:900, unitNoun:'hole' },
];
const app = {
  C, state:{}, viewport:{dpr:1}, contracts:() => rows, strataFor:() => [], toast() {},
  nav() { metrics.nav++; }, haptic() { metrics.haptics++; },
  ctx:{progression:{
    previewContract() { metrics.preview++; return {ok:true,mobilisation:0}; },
    acceptContract(contract) { metrics.accepted++; return {ok:true,contract}; },
  }},
  // The production sheet close control also uses C.tap. Count every close
  // invocation, even after removal, so a redundant listener cannot hide.
  sheet(options) {
    const closeButton = C.h('button.sheet__x',{type:'button',text:'Dismiss sheet'});
    const dialog = C.h('div',{role:'dialog'},closeButton,options.body,
      C.h('div.sheet__actions',...options.actions));
    const el = C.h('div.sheet',dialog);
    const sheet = {el,close() { metrics.closed++; el.remove(); options.onClose?.(); }};
    C.tap(closeButton,() => sheet.close()); document.body.append(el); return sheet;
  },
};
const screen = createContractsScreen(app);
document.querySelector('#board').append(screen.el); screen.mount();
window.tapFixture = {
  metrics,
  reset() { for(const key of Object.keys(metrics)) metrics[key]=0; },
  mount() { document.querySelectorAll('.sheet').forEach(el=>el.remove()); screen.mount(); },
};
</script></body></html>`;

let server, browser;
const errors = [], checks = [];
async function check(name, fn) { await fn(); checks.push(name); console.log(`PASS ${name}`); }
try {
  server = await createServer({
    configFile:false, root:process.cwd(), cacheDir:resolve('node_modules/.vite-tap-activation'),
    optimizeDeps:{noDiscovery:true,include:[]},
    plugins:[{name:'tap-fixture',configureServer(vite) {
      vite.middlewares.use((req,res,next) => {
        if (req.url !== '/__tap_fixture') return next();
        res.setHeader('Content-Type','text/html'); res.end(html);
      });
    }}],
    server:{host:'127.0.0.1',port,strictPort:true,hmr:false,watch:null},
  });
  await server.listen();
  browser = await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--disable-webgl','--disable-software-rasterizer','--mute-audio']});
  const page = await browser.newPage({viewport:{width:800,height:900}});
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    window.webglAttempts = [];
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (/webgl/i.test(type)) { window.webglAttempts.push(type); throw Error('Tap DOM fixture forbids WebGL'); }
      return original.call(this, type, ...args);
    };
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if(response.status()>=400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(`http://127.0.0.1:${port}/__tap_fixture`);
  await page.waitForFunction(() => !!window.tapFixture);
  const reset = () => page.evaluate(() => window.tapFixture.reset());
  const metrics = () => page.evaluate(() => ({...window.tapFixture.metrics}));
  const activate = (selector) => page.locator(selector).evaluate(node => node.click());

  await check('HTMLElement.click activates a shared button exactly once', async () => {
    await reset(); await activate('#plain'); const m = await metrics();
    assert.equal(m.taps,1); assert.equal(m.haptics,1);
  });
  await check('native mouse pointer + browser click activate exactly once', async () => {
    await reset(); await page.locator('#plain').click(); const m = await metrics();
    assert.equal(m.taps,1); assert.equal(m.haptics,1);
  });
  for (const key of ['Enter','Space']) await check(`native ${key} activates exactly once`, async () => {
    await page.locator('#plain').focus(); await reset(); await page.keyboard.press(key);
    const m = await metrics(); assert.equal(m.taps,1); assert.equal(m.haptics,1);
  });
  await check('native disabled button does not activate', async () => {
    await page.locator('#plain').evaluate(node => { node.disabled=true; });
    await reset(); await activate('#plain'); const m = await metrics();
    assert.equal(m.taps,0); assert.equal(m.haptics,0);
    await page.locator('#plain').evaluate(node => { node.disabled=false; });
  });
  await check('contract header assistive activation navigates once', async () => {
    await reset(); await activate('.shead__back'); const m = await metrics();
    assert.equal(m.nav,1); assert.equal(m.haptics,1);
  });
  await check('contract filter assistive activation rebuilds its one matching row once', async () => {
    assert.equal(await page.locator('.contract-card').count(),2);
    await reset(); await activate('[data-filter-id="auger"]'); const m = await metrics();
    assert.equal(await page.locator('.contract-card').count(),1);
    assert.equal(m.preview,1); assert.equal(m.haptics,1);
  });
  await check('contract clear action rebuilds the two-row board once', async () => {
    await reset(); await activate('.contracts-board__reset'); const m = await metrics();
    assert.equal(await page.locator('.contract-card').count(),2);
    assert.equal(m.preview,2); assert.equal(m.haptics,1);
  });
  async function openDetail() {
    await activate('[data-contract-id="native-auger"]');
    await page.locator('.contracts-detail').waitFor(); await reset();
  }
  await check('contract detail Close assistive activation closes once', async () => {
    await openDetail(); await page.getByRole('button',{name:'Close',exact:true}).evaluate(node=>node.click());
    const m=await metrics(); assert.equal(m.closed,1); assert.equal(m.haptics,1);
  });
  await check('contract detail X assistive activation closes once', async () => {
    await openDetail(); await activate('.sheet__x'); const m=await metrics();
    assert.equal(m.closed,1); assert.equal(m.haptics,1);
  });
  await check('contract acceptance assistive activation accepts, closes and navigates once', async () => {
    await openDetail(); await page.getByRole('button',{name:'Accept contract',exact:true}).evaluate(node=>node.click());
    const m=await metrics(); assert.equal(m.accepted,1); assert.equal(m.closed,1);
    assert.equal(m.nav,1); assert.equal(m.haptics,1);
  });
  assert.deepEqual(errors,[], 'Browser module loading and page execution must be clean');
  assert.equal(checks.length,11,'All native activation checks must execute');
  assert.deepEqual(await page.evaluate(() => window.webglAttempts),[],'CPU DOM fixture never requests WebGL');
  assert.deepEqual(hashes(),sourceBefore,'Sources must not change during the browser checks');
  console.log(JSON.stringify({checks:checks.length,sourceHashes:sourceBefore,
    browser:await browser.version(),scope:'Native Chrome DOM; real components and contracts, counted app adapter; no OS assistive-technology certification'}));
} finally {
  try { await browser?.close(); } finally { await server?.close(); }
}

/* Does each tier ship the AA its contract.js row declares? One boot per tier,
   read the composer's default pass state — no toggling, because the A/B rigs
   force SMAA back on when they finish and cannot answer this. */
import { chromium, devices } from 'playwright';
const PHONE = { ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 },
                deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: 'chrome', headless: false,
  args: ['--ignore-gpu-blocklist', '--hide-scrollbars', '--mute-audio'] });
const page = await (await browser.newContext(PHONE)).newPage();
await page.routeWebSocket(/.*/, () => {}).catch(() => {});
for (const tier of ['low', 'medium', 'high']) {
  await page.goto(`http://localhost:5178/?quality=${tier}&shot`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.composer, { timeout: 30000 });
  await sleep(2500);
  const o = await page.evaluate(() => {
    const c = window.__DRILLITY;
    return { tier: c.quality.id, declaredAa: c.quality.aa,
      passes: c.composer.passes.map((p) => ({
        name: p.constructor.name === 'ShaderPass' && p.material && p.material.name ? p.material.name : p.constructor.name,
        enabled: p.enabled })),
      canvas: [c.gl.domElement.width, c.gl.domElement.height], dpr: c.gl.getPixelRatio() };
  });
  const smaa = o.passes.find((p) => p.name === 'SMAAPass');
  console.log(`${o.tier.padEnd(7)} declares aa:'${o.declaredAa}'  SMAAPass ${smaa ? (smaa.enabled ? 'ENABLED' : 'disabled') : 'ABSENT'}` +
    `  ${smaa && smaa.enabled === (o.declaredAa !== 'none') ? 'MATCHES' : '*** MISMATCH ***'}` +
    `  canvas ${o.canvas.join('x')} @${o.dpr}  chain: ${o.passes.map((p) => p.name + (p.enabled ? '' : '(off)')).join(' > ')}`);
}
await browser.close();

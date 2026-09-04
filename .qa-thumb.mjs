import { chromium, devices } from 'playwright';

const VITE_STUB = `
export const createHotContext = () => ({
  on(){}, off(){}, send(){}, accept(){}, acceptExports(){}, dispose(){}, prune(){}, decline(){}, invalidate(){},
  get data(){ return {}; },
});
export function updateStyle(id, content) {
  let s = document.querySelector('style[data-vite-dev-id="'+id+'"]');
  if (!s) { s = document.createElement('style'); s.setAttribute('data-vite-dev-id', id); document.head.appendChild(s); }
  s.textContent = content;
}
export function removeStyle(id) { const s = document.querySelector('style[data-vite-dev-id="'+id+'"]'); if (s) s.remove(); }
export function injectQuery(url) { return url; }
export class ErrorOverlay extends HTMLElement {}
`;

export async function openStable(url) {
  const b = await chromium.launch({ args: ['--mute-audio'], headless: false, channel: 'chrome' });
  const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  // Neutralise Vite's HMR client: other agents are saving files continuously
  // and every save was full-reloading the page out from under the probe.
  await c.route('**/@vite/client', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: VITE_STUB }));
  const p = await c.newPage();
  return { b, c, p, url };
}

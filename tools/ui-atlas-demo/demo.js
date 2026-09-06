import '../../src/ui/motion.css';
import '../../src/ui/blender-atlas.css';
import './demo.css';
import { CURVES, DUR, ease } from '../../src/core/motion.js';

const scope = document.querySelector('[data-blender-ui]');
const status = document.querySelector('#load-status');
// Base URI follows the isolated page at / or any deployed subpath.
const assetBase = new URL('ui/blender/', document.baseURI);
const media = matchMedia('(prefers-reduced-motion: reduce)');
let userReduced = false;
let motionFrame = 0;
let meterValue = 62;
let meterTarget = 62;
let loadedManifest;
const reduced = () => media.matches || userReduced;

function assert(condition, message) { if (!condition) throw new Error(message); }
function fitLabels() {
  for (const button of scope.querySelectorAll('.bui-button')) {
    button.classList.remove('bui-text-fit-fallback');
    const label = button.querySelector('.bui-button__label');
    // Natural live-text bounds against the manifest safeText area. Geometry
    // is a DOM measure; oversized translations/zoom never silently clip.
    const range = document.createRange();
    range.selectNodeContents(label);
    const r = range.getBoundingClientRect();
    const safeWidth = button.classList.contains('bui-button--compact') ? 68 : 120;
    button.classList.toggle('bui-text-fit-fallback', r.width > safeWidth || r.height > 24);
  }
  for (const badge of scope.querySelectorAll('.bui-badge')) {
    badge.classList.remove('bui-text-fit-fallback');
    const children = [...badge.children].map((child) => {
      const range = document.createRange(); range.selectNodeContents(child); return range.getBoundingClientRect();
    });
    const textWidth = children.reduce((width, r) => width + r.width, 0) + Math.max(0, children.length - 1) * 4;
    badge.classList.toggle('bui-text-fit-fallback', textWidth > 68 || children.some((r) => r.height > 14));
  }
}
function paintMeter(value, announce = false) {
  meterValue = value;
  const rounded = Math.round(value);
  const meter = document.querySelector('.bui-meter');
  meter.style.setProperty('--bui-value', value / 100);
  meter.setAttribute('aria-valuenow', String(rounded));
  meter.setAttribute('aria-valuetext', `${rounded} percent`);
  document.querySelector('#meter-output').value = `${rounded}%`;
  if (announce) document.querySelector('#interaction-status').textContent = `Sample capacity ${rounded} percent. Preview complete.`;
}
function animateMeter() {
  cancelAnimationFrame(motionFrame);
  meterTarget = meterTarget === 84 ? 36 : 84;
  const startValue = meterValue;
  if (reduced()) { paintMeter(meterTarget, true); return; }
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / (DUR.d4 * 1000));
    paintMeter(startValue + (meterTarget - startValue) * ease('count', t), t === 1);
    if (t < 1) motionFrame = requestAnimationFrame(frame);
  }
  motionFrame = requestAnimationFrame(frame);
}
function updateReduced() {
  scope.classList.toggle('reduced-motion', userReduced);
  if (reduced()) { cancelAnimationFrame(motionFrame); paintMeter(meterTarget); }
  document.querySelector('#motion-summary').textContent = reduced()
    ? 'Motion: reduced · immediate values, no press displacement'
    : `Motion: Blender press / release · count ${DUR.d4 * 1000}ms`;
}
media.addEventListener('change', updateReduced);
scope.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  switch (button.dataset.action) {
    case 'preview': document.querySelector('#interaction-status').textContent = 'Press preview complete. The live button retains its native target size.'; break;
    case 'meter': animateMeter(); break;
    case 'toggle': {
      const pressed = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(pressed));
      button.querySelector('.bui-button__label').textContent = pressed ? 'Pressed' : 'Released';
      document.querySelector('#interaction-status').textContent = `Sample toggle ${pressed ? 'pressed' : 'released'}.`;
      break;
    }
    case 'ground': {
      const light = scope.classList.toggle('is-light');
      button.setAttribute('aria-pressed', String(light));
      break;
    }
    case 'reduce': userReduced = !userReduced; button.setAttribute('aria-pressed', String(userReduced)); updateReduced(); break;
  }
});

async function load() {
  const response = await fetch(new URL('manifest.json', assetBase));
  assert(response.ok, `Atlas manifest HTTP ${response.status}`);
  const manifest = await response.json();
  assert(manifest.schemaVersion === 1 && manifest.sprites?.length === 16, 'Expected version 1 manifest with sixteen authored sprites');
  const a1 = manifest.atlases['1x'], a2 = manifest.atlases['2x'];
  const image1 = new URL(a1.file, assetBase).href, image2 = new URL(a2.file, assetBase).href;
  const selected = devicePixelRatio > 1 ? a2 : a1;
  const probe = new Image(); probe.src = new URL(selected.file, assetBase).href; await probe.decode();
  assert(probe.naturalWidth === selected.width && probe.naturalHeight === selected.height, 'Atlas decoded dimensions differ from manifest');
  scope.style.setProperty('--bui-atlas-image', `image-set(url("${image1}") 1x, url("${image2}") 2x)`);
  scope.style.setProperty('--bui-atlas-size', `${a1.width}px ${a1.height}px`);
  for (const sprite of manifest.sprites) scope.style.setProperty(`--bui-${sprite.id}`, `${-sprite.atlas.x}px ${-sprite.atlas.y}px`);
  scope.dataset.atlasReady = 'true';
  const atlasImage = document.querySelector('#atlas-image');
  atlasImage.srcset = `${image1} 1x, ${image2} 2x`;
  atlasImage.src = image1;
  atlasImage.width = a1.width;
  atlasImage.height = a1.height;
  document.querySelector('#asset-summary').textContent = `${manifest.sprites.length} faces · ${Math.ceil(a2.bytes / 1024)} KiB @2×`;
  status.textContent = `CPU Cycles exports loaded · ${devicePixelRatio > 1 ? '2×' : '1×'} display density`;
  loadedManifest = manifest;
  updateReduced();
  fitLabels();
  scope.dataset.ready = 'true';
}
new ResizeObserver(fitLabels).observe(scope);
window.__UI_ATLAS_REVIEW__ = {
  get manifest() { return loadedManifest; },
  motion: { source: 'blender/ui_motion.py → src/core/motion.js + src/ui/motion.css', duration: DUR.d4, countCurve: CURVES.count },
  setTextZoom(enabled) { scope.classList.toggle('is-text-zoom', enabled); fitLabels(); },
};
load().catch((error) => { status.dataset.error = 'true'; status.textContent = `Atlas review unavailable: ${error.message}`; console.error(error); });

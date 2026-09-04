import { readFileSync } from 'node:fs';
const src = readFileSync('src/core/preview.js', 'utf8');
const a = src.indexOf('const CATEGORY_MODEL_HINTS');
const b = src.indexOf('export function createPreview');
const mod = src.slice(a, b) + '\nexport { modelIdFor };';
const { modelIdFor } = await import(
  'data:text/javascript;base64,' + Buffer.from(mod).toString('base64'));

const EXPECT = [
  ['Casing Crown 168 mm, ballistic', 'casing-crown'],
  ['Ring-Bit System 140 mm', 'ring-bit-system'],
  ['Wing-Bit System 168 mm', 'wing-bit-system'],
  ['Concentric System, Symmetrix type', 'concentric-system'],
  ['Eccentric System, Odex type', 'eccentric-system'],
  ['Casing Pipe 168 mm', 'casing-pipe'],
  ['Rotary Drive Head KDK 620', 'rotary-drive-head'],
  ['Casing Rotator, 1500 mm', 'rotary-drive-head'],
  ['Hollow Anchor Bar R32/210', 'sda-bar'],
  ['GEWI Threadbar 32 mm', 'sda-bar'],
  ['Raise Bore Drill Stem 254 mm', 'drill-stem'],
  ['Drill Rod T45, 3 m', 'drill-rod'],
  ['DTH Hammer 5 inch', 'dth-hammer'],
  ['Button Bit T45, 76 mm', 'button-bit'],
  ['Kelly Bar, 4-Stage Interlocking', null],
];
let bad = 0;
for (const [name, want] of EXPECT) {
  const got = modelIdFor({ name });
  const ok = got === want;
  if (!ok) bad++;
  console.log((ok ? '  ok   ' : '  FAIL ') + name.padEnd(35) + '-> ' + String(got));
}
console.log('\nmis-resolutions: ' + bad + ' / ' + EXPECT.length);

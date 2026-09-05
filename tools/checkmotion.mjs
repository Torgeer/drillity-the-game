/** Check actual emitted CSS/JS against recorded Blender evaluator samples.
 * The fast default gate needs Node only. Regenerate and remeasure the source
 * with blender/ui_motion.py --check when changing the authority/exporter.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { CURVES, DUR, STAGGER, ease, curve, dur } from '../src/core/motion.js';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const [css, reportText] = await Promise.all([read('src/ui/motion.css'), read('research/motion-export.json')]);
const report = JSON.parse(reportText);
assert.equal(report.version, 1);
assert.equal(report.curves.length, 11, 'Empty/incomplete Blender reference');
assert.equal(report.referenceSamples, 257);
assert.deepEqual(Object.keys(CURVES).sort(), report.curves.map(c => c.name).sort());
for (const [path, hash] of Object.entries(report.sourceHashes)) {
  const actual = createHash('sha256').update((await read(path)).replace(/\r\n/g, '\n')).digest('hex');
  assert.equal(actual, hash, `${path} changed; regenerate motion exports with Blender`);
}

const bez = (a,b,c,d,t) => { const u=1-t; return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d; };
function parseTiming(value) {
  const numbers = value.slice(value.indexOf('(')+1,-1).split(',').map(Number);
  assert(numbers.every(Number.isFinite), 'Nonfinite emitted CSS');
  if (value.startsWith('linear(')) {
    assert(numbers.length >= 2);
    return t => {
      const p=t*(numbers.length-1), i=Math.min(numbers.length-2,Math.floor(p));
      return numbers[i]+(numbers[i+1]-numbers[i])*(p-i);
    };
  }
  assert(value.startsWith('cubic-bezier(') && numbers.length===4);
  const [x1,y1,x2,y2]=numbers;
  assert(x1>=0 && x2<=1 && x1<=x2);
  return t => {
    let lo=0,hi=1;
    for(let i=0;i<48;i++) { const m=(lo+hi)/2; if(bez(0,x1,x2,1,m)<t) lo=m; else hi=m; }
    return bez(0,y1,y2,1,(lo+hi)/2);
  };
}

let maxBlender=0, maxCss=0;
for (const row of report.curves) {
  const c=CURVES[row.name];
  assert(c.segments.length>0);
  assert.equal(c.bounded,row.bounded);
  assert.equal(row.reference.length,report.referenceSamples);
  assert(row.fitError <= report.limits.fit && row.blenderError <= report.limits.blender);
  assert(row.cssError <= report.limits.css);
  assert.equal(ease(row.name,0),0);
  assert.equal(ease(row.name,1),1);
  for(const [i,s] of c.segments.entries()) {
    assert(s.length===8 && s.every(Number.isFinite));
    assert(s[0]<s[6] && s[0]<=s[2] && s[2]<=s[4] && s[4]<=s[6], 'Unordered time handles');
    assert((s[1]<=s[3] && s[3]<=s[5] && s[5]<=s[7]) ||
           (s[1]>=s[3] && s[3]>=s[5] && s[5]>=s[7]), 'Non-monotone curve leg');
    if(i) assert.deepEqual(c.segments[i-1].slice(-2),s.slice(0,2),'Discontinuous knot');
    if(c.bounded) assert(Math.min(s[1],s[7])>=0 && Math.max(s[1],s[7])<=1);
  }
  let blenderError=0;
  row.reference.forEach((value,i) => {
    blenderError=Math.max(blenderError,Math.abs(ease(row.name,i/(row.reference.length-1))-value));
  });
  assert(blenderError<=report.limits.blender, `${row.name}: exported JS differs from Blender`);
  const token=css.match(new RegExp(`--curve-${row.name}:\\s*([^;]+);`));
  assert(token, `Missing CSS consumer token ${row.name}`);
  const cssEase=parseTiming(token[1]);
  let cssError=0,previous=0,peak=0;
  // Twice the generator's density catches errors between recorded samples.
  for(let i=0;i<=8192;i++) {
    const t=i/8192,y=ease(row.name,t);
    if(c.bounded) assert(y>=-1e-12 && y<=1+1e-12 && y>=previous-1e-12,`${row.name} reverses/overshoots`);
    previous=y; peak=Math.max(peak,y);
    cssError=Math.max(cssError,Math.abs(y-cssEase(t)));
  }
  if(!c.bounded) assert(peak>1.01,`${row.name} lost its spring peak`);
  assert(cssError<=report.limits.css,`${row.name}: emitted CSS exceeds error budget`);
  maxBlender=Math.max(maxBlender,blenderError); maxCss=Math.max(maxCss,cssError);
  console.log(`MOTION_CHECK ${row.name.padEnd(8)} Blender=${blenderError.toExponential(3)} CSS=${cssError.toExponential(3)}`);
}
assert.equal(curve('press')(.5),ease('press',.5));
for(const name of ['missing','toString','constructor','__proto__']) assert.throws(()=>ease(name,.5));
for(const value of [NaN,Infinity,-Infinity]) assert.throws(()=>ease('press',value));
assert.equal(dur(DUR.d3,false),DUR.d3);
assert(dur(DUR.d3,true)<=1/60);
assert.equal(dur(0,true),0);
assert.throws(()=>dur(-1,false));
assert.throws(()=>dur(NaN,false));
assert(STAGGER>=.02 && STAGGER<=.03,'Stagger violates MOTION.md');
for(const [name,seconds] of Object.entries(DUR)) {
  assert(css.includes(`--motion-${name}: ${seconds*1000}ms;`),`${name} duration drift`);
  assert.equal((css.match(new RegExp(`--motion-${name}: 1ms;`,'g'))||[]).length,2,'Missing OS/game reduced-motion duration');
}
assert(css.includes('@media (prefers-reduced-motion: reduce)'));
assert(css.includes('.reduced-motion {'));
console.log(`MOTION_CHECK_OK 11 curves, 8193 samples each; max Blender=${maxBlender.toExponential(3)}, CSS=${maxCss.toExponential(3)}`);

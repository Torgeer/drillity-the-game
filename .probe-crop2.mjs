import fs from 'node:fs';
import { chromium } from 'playwright';
const f = process.argv[2], y0=Number(process.argv[3]), y1=Number(process.argv[4]), z=Number(process.argv[5]||3);
const b = await chromium.launch({ channel:'chrome', headless:false });
const p = await b.newPage();
const buf = fs.readFileSync(f).toString('base64');
const out = await p.evaluate(async ({b64,y0,y1,z}) => {
  const img = new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
  const c=document.createElement('canvas'); c.width=img.width*z; c.height=(y1-y0)*z;
  const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  g.drawImage(img,0,y0,img.width,y1-y0,0,0,c.width,c.height);
  return c.toDataURL('image/png').split(',')[1];
}, {b64:buf,y0,y1,z});
fs.writeFileSync(f.replace(/\.png$/,'-zoom.png'), Buffer.from(out,'base64'));
console.log('ok');
await b.close();

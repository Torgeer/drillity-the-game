import fs from 'node:fs';
import { chromium } from 'playwright';
const f=process.argv[2],x0=+process.argv[3],y0=+process.argv[4],x1=+process.argv[5],y1=+process.argv[6],z=+(process.argv[7]||6);
const b = await chromium.launch({ channel:'chrome', headless:false });
const p = await b.newPage();
const buf = fs.readFileSync(f).toString('base64');
const out = await p.evaluate(async ({b64,x0,y0,x1,y1,z}) => {
  const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
  const c=document.createElement('canvas'); c.width=(x1-x0)*z; c.height=(y1-y0)*z;
  const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  g.drawImage(img,x0,y0,x1-x0,y1-y0,0,0,c.width,c.height);
  return c.toDataURL('image/png').split(',')[1];
}, {b64:buf,x0,y0,x1,y1,z});
fs.writeFileSync(f.replace(/\.png$/,'-box.png'), Buffer.from(out,'base64'));
console.log('ok');
await b.close();

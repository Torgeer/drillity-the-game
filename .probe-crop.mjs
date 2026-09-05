import fs from 'node:fs';
import { chromium } from 'playwright';
const files = process.argv.slice(2);
const b = await chromium.launch({ channel:'chrome', headless:false });
const p = await b.newPage();
for (const f of files) {
  const buf = fs.readFileSync(f).toString('base64');
  const out = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    // section band on the 390x844@2x capture: device y 1820-2620 approx
    const sy = Math.round(img.height * 0.545), sh = Math.round(img.height * 0.235);
    const c = document.createElement('canvas'); c.width = img.width * 2; c.height = sh * 2;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, sy, img.width, sh, 0, 0, c.width, c.height);
    return c.toDataURL('image/png').split(',')[1];
  }, buf);
  fs.writeFileSync(f.replace(/\.png$/, '-crop.png'), Buffer.from(out, 'base64'));
  console.log('cropped', f);
}
await b.close();

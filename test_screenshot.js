const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = 'C:\\Users\\jungrok5\\.gemini\\antigravity\\brain\\9a017f27-360e-4ba3-a85e-7ec952edba96\\scratch';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('error', err => console.log('ERROR:', err.toString()));

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Wait for canvas to load and render
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'mode1_topdown.png') });
  console.log('Saved mode1_topdown.png');

  // Switch to Mode 2
  await page.click('button[data-mode="mode7"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'mode2_mode7.png') });
  console.log('Saved mode2_mode7.png');

  // Switch to Mode 3
  await page.click('button[data-mode="billboard"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'mode3_billboard.png') });
  console.log('Saved mode3_billboard.png');

  // Switch to Mode 4
  await page.click('button[data-mode="depth"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'mode4_depth.png') });
  console.log('Saved mode4_depth.png');

  // Switch to Mode 5
  await page.click('button[data-mode="cinematic"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'mode5_cinematic.png') });
  console.log('Saved mode5_cinematic.png');

  // Switch back to Mode 1
  await page.click('button[data-mode="topdown"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'mode1_return.png') });
  console.log('Saved mode1_return.png');

  await browser.close();
})();

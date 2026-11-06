const { chromium, devices } = require('playwright');
const fs = require('fs');

const URL = 'http://127.0.0.1:8765/index.html';
const IMGS = [
  '/Users/elva/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/Elva0402_43e6/temp/RWTemp/2026-11/c6523df235ee99b6beb9297b8ca2a99e/9845f2cb115b2a1584ee722cc72c0619.jpg',
  '/Users/elva/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/Elva0402_43e6/temp/RWTemp/2026-11/c6523df235ee99b6beb9297b8ca2a99e/c246667780d71ebf1123bf290b9eda42.jpg'
].filter((p) => fs.existsSync(p));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'zh-CN' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.click('.tabbar button[data-tab="ocr"]');
  await page.waitForTimeout(300);

  for (const [i, img] of IMGS.entries()) {
    await page.setInputFiles('#ocr-file', img);
    const t0 = Date.now();
    await page.waitForFunction(() => {
      const s = document.getElementById('ocr-status').textContent;
      return s.includes('识别完成') || s.includes('识别失败');
    }, { timeout: 120000 });
    const out = await page.evaluate(() => ({
      status: document.getElementById('ocr-status').textContent,
      raw: document.getElementById('ocr-raw').value,
      sents: [...document.querySelectorAll('#ocr-sents .sent .txt')].map((n) => n.textContent),
    }));
    console.log(`图 ${i + 1} (${((Date.now() - t0) / 1000).toFixed(1)}s) ${out.status}`);
    console.log('  原始：', JSON.stringify(out.raw));
    console.log('  分句：', out.sents.length, JSON.stringify(out.sents.slice(0, 4)));
    await page.click('#ocr-clear');
    await page.waitForTimeout(300);
  }
  console.log('页面错误:', errs.length ? errs : 'none');
  await browser.close();
})().catch((e) => { console.error('FAIL:', String(e).slice(0, 300)); process.exit(1); });

/* pe-v24 冒烟：设置里调字体大小 → 缩放生效 → 刷新后保留 */
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8765/';
const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });

  // 1) 打开设置
  await page.click('#btn-settings');
  await page.waitForTimeout(600);
  const fsRow = page.locator('#fs-row');
  if (!(await fsRow.count())) throw new Error('设置里没有「字体大小」区块');
  console.log('1) 设置页出现字体大小区块 ✓');

  // 2) 点「特大」，验证 html zoom 与 localStorage
  await page.click('[data-fs="1.3"]');
  await page.waitForTimeout(300);
  const zoom = await page.evaluate(() => document.documentElement.style.zoom);
  const stored = await page.evaluate(() => localStorage.getItem('easytalk-fontscale'));
  if (zoom !== '1.3' || stored !== '1.3') throw new Error(`zoom=${zoom} stored=${stored}`);
  console.log('2) 点「特大」→ zoom=1.3 且已存 localStorage ✓');

  // 3) 刷新页面，缩放应保留（head 内联脚本提前生效）
  await page.reload({ waitUntil: 'networkidle' });
  const zoom2 = await page.evaluate(() => document.documentElement.style.zoom || getComputedStyle(document.documentElement).zoom);
  if (String(zoom2) !== '1.3') throw new Error('刷新后缩放丢失: ' + zoom2);
  console.log('3) 刷新后缩放保留 ✓');

  // 4) 再调回「标准」→ zoom 清空
  await page.click('#btn-settings');
  await page.waitForTimeout(600);
  await page.click('[data-fs="1"]');
  await page.waitForTimeout(300);
  const zoom3 = await page.evaluate(() => document.documentElement.style.zoom);
  if (zoom3 !== '') throw new Error('调回标准未清空 zoom: ' + zoom3);
  console.log('4) 调回「标准」→ zoom 还原 ✓');

  if (errors.length) { console.log('页面 JS 错误:', errors); process.exit(1); }
  console.log('全部通过，无 JS 报错');
  await browser.close();
};
run().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });

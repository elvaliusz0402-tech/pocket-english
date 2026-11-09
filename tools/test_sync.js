/* 云同步冒烟测试：页面可启动、无 JS 报错、设置页出现云同步区块、同步状态显示正确 */
const { chromium, devices } = require('playwright');

(async () => {
  const errs = [];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await page.goto('http://127.0.0.1:8765/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000); /* 等 boot + 首次同步尝试 */

  /* 打开设置 */
  await page.evaluate(() => { document.getElementById('btn-settings').click(); });
  await page.waitForTimeout(1500);
  const cloud = await page.evaluate(() => {
    const out = document.querySelector('#cloud-out');
    const on = document.querySelector('[data-cloud-on]');
    return {
      hasSection: !!document.querySelector('#cloud-sync'),
      checkbox: on ? on.checked : null,
      status: out ? out.textContent.trim() : null,
      secretLen: localStorage.getItem('easytalk-sync-code')?.length || 0
    };
  });
  console.log('cloud section:', JSON.stringify(cloud));

  /* 点「立即同步」——云端表还没建，应显示友好错误而不是崩 */
  await page.evaluate(() => { document.querySelector('#cloud-sync').click(); });
  await page.waitForTimeout(3000);
  const syncOut = await page.evaluate(() => document.querySelector('#cloud-out')?.textContent.trim());
  console.log('sync result:', syncOut);

  console.log('JS errors:', errs.length ? errs.slice(0, 6) : 'none');
  await browser.close();
  process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });

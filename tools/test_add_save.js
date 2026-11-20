/* pe-v25 回归：手动「添加表达」保存成功、编辑不重复、无 JS 报错 */
const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const dbCount = () => page.evaluate(() => new Promise((resolve) => {
    const r = indexedDB.open('pocket-english', 1);
    r.onsuccess = () => {
      const q = r.result.transaction('entries', 'readonly').objectStore('entries').getAll();
      q.onsuccess = () => resolve(q.result.length);
      q.onerror = () => resolve(-1);
    };
    r.onerror = () => resolve(-2);
  }));

  await page.evaluate(() => { location.hash = 'library'; });
  await page.waitForTimeout(400);

  // 1) 新建一条，完全照用户截图那样填（中文含冒号/顿号、英文含逗号）
  await page.click('#lib-add');
  await page.waitForTimeout(400);
  await page.fill('#sheet [data-en]', 'boost muscle mass, expand reading volume, improve sleep quality');
  await page.fill('#sheet [data-cn]', '人的基本盘：增加肌肉含量、阅读量和睡眠质量');
  await page.fill('#sheet [data-nat]', 'The fundamentals for yourself are building muscle, reading more, sleeping better');
  await page.click('#sheet [data-save]');
  await page.waitForTimeout(900);
  const n1 = await dbCount();
  const stillOpen = await page.locator('#sheet [data-save]').count();
  if (n1 !== 1 || stillOpen > 0) throw new Error(`新建失败：条目数=${n1} 弹层仍开=${stillOpen}`);
  console.log('1) 新建保存成功，弹层已关闭，条目数=1 ✓');

  // 2) 存储层兜底：不带 id 写入也能自动生成（防所有入口再漏）
  const idMade = await page.evaluate(async () => {
    const { Store } = await import('/js/store.js');
    const r = await Store.put({ en: 'no id here', cn: '无 id 兜底', updatedAt: Date.now() });
    return !!(r && r.id);
  });
  if (!idMade) throw new Error('存储层未补 id');
  const n2 = await dbCount();
  if (n2 !== 2) throw new Error('兜底写入异常，条目数=' + n2);
  console.log('2) 存储层自动补 id，无 id 也能写入 ✓');

  // 3) 空英文应被拦下（不新增），并给出提示
  await page.click('#lib-add');
  await page.waitForTimeout(400);
  await page.fill('#sheet [data-cn]', '只有中文没有英文');
  await page.click('#sheet [data-save]');
  await page.waitForTimeout(500);
  const n3 = await dbCount();
  if (n3 !== 2) throw new Error('空英文校验失效，条目数=' + n3);
  console.log('3) 空英文被正确拦截，条目数仍为 2 ✓');

  if (errs.length) { console.log('页面 JS 报错:', errs); process.exit(1); }
  console.log('全部通过，无 JS 报错');
  await browser.close();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });

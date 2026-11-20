/* pe-v27 回归：手动添加只填「自然改写」也能保存；两项全空才拦截 */
const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const dbAll = () => page.evaluate(() => new Promise((resolve) => {
    const r = indexedDB.open('pocket-english', 1);
    r.onsuccess = () => {
      const q = r.result.transaction('entries', 'readonly').objectStore('entries').getAll();
      q.onsuccess = () => resolve(q.result);
      q.onerror = () => resolve(null);
    };
    r.onerror = () => resolve(null);
  }));

  await page.evaluate(() => { location.hash = 'library'; });
  await page.waitForTimeout(400);

  // 1) 只填「自然改写」→ 应保存成功，且自动转成主句（en）
  await page.click('#lib-add');
  await page.waitForTimeout(400);
  await page.fill('#sheet [data-nat]', 'grab a quick bite on the way');
  await page.click('#sheet [data-save]');
  await page.waitForTimeout(900);
  let all = await dbAll();
  const onlyNat = all.find((e) => e.en === 'grab a quick bite on the way');
  const stillOpen1 = await page.locator('#sheet [data-save]').count();
  if (!onlyNat || stillOpen1 > 0) throw new Error(`只填自然改写保存失败：条目=${all.length} 弹层仍开=${stillOpen1}`);
  if (onlyNat.natural) throw new Error('自然改写应已转为主句，natural 应为空');
  console.log('1) 只填「自然改写」→ 保存成功并自动转为主句 ✓');

  // 2) 只填「英文原句」→ 照常保存
  await page.click('#lib-add');
  await page.waitForTimeout(400);
  await page.fill('#sheet [data-en]', 'keep me posted');
  await page.click('#sheet [data-save]');
  await page.waitForTimeout(900);
  all = await dbAll();
  if (!all.find((e) => e.en === 'keep me posted')) throw new Error('只填英文原句保存失败');
  console.log('2) 只填「英文原句」→ 照常保存 ✓');

  // 3) 两项全空 → 拦截，条目数不变
  const before = all.length;
  await page.click('#lib-add');
  await page.waitForTimeout(400);
  await page.fill('#sheet [data-cn]', '只填中文');
  await page.click('#sheet [data-save]');
  await page.waitForTimeout(500);
  all = await dbAll();
  if (all.length !== before) throw new Error('全空拦截失效，条目数变了');
  console.log('3) 两项全空 → 正确拦截 ✓');

  if (errs.length) { console.log('页面 JS 报错:', errs); process.exit(1); }
  console.log('全部通过，无 JS 报错');
  await browser.close();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });

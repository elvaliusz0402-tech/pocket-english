/* 零配置测试：模拟全新用户（空 localStorage），验证打开即有 AI + 真实翻译走公共通道 */
const { chromium, devices } = require('playwright');

(async () => {
  const errs = [];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });   // 全新无痕环境
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push('console: ' + m.text()); });

  await page.goto('http://127.0.0.1:8765/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);

  /* 1) 顶栏应显示 AI 已开启（内置免费通道） */
  const banner = await page.evaluate(() => document.getElementById('llm-banner')?.innerText?.trim() || '');
  console.log('banner:', banner.slice(0, 80));

  /* 2) 真实翻译：切到翻译页，输入中文，点「生成」 */
  await page.evaluate(() => document.querySelector('.tabbar button[data-tab="capture"]').click());
  await page.waitForTimeout(800);
  await page.fill('#cap-input', '请问这个大概什么时候发货？');
  await page.click('#cap-go');
  await page.waitForTimeout(25000);   // 公共模型约 3~8 秒，留足余量
  const out = await page.evaluate(() => document.getElementById('page-capture')?.innerText?.slice(0, 400) || '');
  const ok = /Could you|When will|shipping|ship|deliver|dispatch/i.test(out);
  console.log('translate output head:', out.replace(/\n+/g, ' | ').slice(0, 160));
  console.log('TRANSLATE OK:', ok);

  console.log('JS errors:', errs.length ? errs.slice(0, 6) : 'none');
  await browser.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });

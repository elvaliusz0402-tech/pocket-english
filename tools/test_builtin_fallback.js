/* pe-v26 回归：主用/备用全坏 → 自动兜底内置免费通道，翻译仍成功 */
const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  const netlog = [];
  page.on('response', (r) => { if (/siliconflow|googleapis|supabase\.co\/functions/.test(r.url())) netlog.push(`${r.status()} ${r.url().slice(0, 90)}`); });
  page.on('requestfailed', (r) => { if (/siliconflow|googleapis|supabase\.co\/functions/.test(r.url())) netlog.push(`FAIL ${r.url().slice(0, 90)} :: ${r.failure() && r.failure().errorText}`); });
  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1) 故意写入坏配置：主用 = 假 Key 的硅基；备用 = 假 Key 的 Gemini
  await page.evaluate(async () => {
    const { Store } = await import('/js/store.js');
    await Store.setKV('llm-config', { enabled: true, preset: 'siliconflow', url: 'https://api.siliconflow.cn/v1', key: 'sk-invalid-key-xxx', model: 'THUDM/GLM-4-9B-0414' });
    await Store.setKV('llm-config-bak', { enabled: true, preset: 'gemini', url: 'https://generativelanguage.googleapis.com/v1beta/openai', key: 'AIza-invalid-key-xxx', model: 'gemini-2.5-flash' });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // 2) 翻译一句：应自动兜底内置通道成功
  await page.evaluate(() => { location.hash = 'capture'; });
  await page.waitForTimeout(400);
  await page.fill('#cap-input', '请问这个大概什么时候发货？');
  await page.click('#cap-go');

  // 轮询等待最多 75 秒
  let gotVariants = false, fellToBuiltin = false;
  for (let i = 0; i < 38; i++) {
    await page.waitForTimeout(2000);
    const body = await page.evaluate(() => document.body.innerText);
    gotVariants = /共 \d 种说法/.test(body);
    fellToBuiltin = /内置免费通道/.test(body);
    if (gotVariants) break;
  }
  console.log('网络请求记录:'); netlog.forEach((l) => console.log(' ', l));
  console.log('翻译出结果:', gotVariants);
  console.log('显示已切换到内置通道:', fellToBuiltin);
  if (!gotVariants) {
    const body = await page.evaluate(() => document.body.innerText);
    console.log('---页面文本---\n' + body.slice(0, 800));
    throw new Error('兜底失败，没有翻译结果');
  }

  if (errs.length) { console.log('页面 JS 报错:', errs); process.exit(1); }
  console.log('全部通过：两条通道全坏时翻译仍可用（内置兜底），无 JS 报错');
  await browser.close();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });

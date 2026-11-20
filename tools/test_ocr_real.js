/* pe-v28 端到端：图片识别（本地引擎 + 四方向自动择优 + 乱码硬拦截）
 * 用真实产品页面上传图片，检查 #ocr-raw 不含碎片乱码、能提到真实英文句子。 */
const { chromium, devices } = require('playwright');
const path = require('path');

const FIX = path.join(__dirname, 'fixtures');
const BAD = /\b(ITEC|SST|Bla\s*Fn|Ra\s+a|Eg\s+m|He\s+2\s+3)\b|[\u00a7\u00a9\u00ae]{2,}/;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  // 记录所有外部请求：本地化后不应再请求任何 CDN
  const external = [];
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('http://127.0.0.1:8765')) external.push(u);
  });

  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  // 切到图片识别页
  await page.evaluate(() => { location.hash = 'capture'; });
  await page.waitForTimeout(500);
  const tab = await page.evaluate(() => {
    const el = document.querySelector('#tab-capture') || [...document.querySelectorAll('[data-tab]')].find(x => /图片/.test(x.textContent));
    if (el) el.click();
    return document.body.innerText.includes('图片识别');
  });
  await page.waitForTimeout(400);

  async function run(file, label) {
    await page.setInputFiles('#ocr-file', path.join(FIX, file));
    // 等识别完成（进度到 100% 或状态含「识别完成」）
    await page.waitForFunction(() => {
      const s = document.getElementById('ocr-status');
      return s && (/识别完成|识别失败|没有提取|没识别出/.test(s.textContent));
    }, null, { timeout: 120000 });
    const raw = await page.locator('#ocr-raw').inputValue();
    const status = await page.locator('#ocr-status').innerText();
    console.log(`\n===== ${label} =====`);
    console.log('状态:', status);
    console.log('识别文字:', JSON.stringify(raw.slice(0, 300)));
    return { raw, status };
  }

  // 1) 横躺书页（用户截图那张）：核心回归——以前全是 ITEC/SST 碎片
  const r1 = await run('book_sideways.jpg', '横躺书页（原乱码案例）');
  if (BAD.test(r1.raw)) throw new Error('横躺书页仍出现乱码碎片: ' + r1.raw.slice(0, 200));
  if (!/Hogwarts|McGonagall|CHAPTER|together|banquet|ceremony|Houses/i.test(r1.raw)) {
    throw new Error('横躺书页未识别出真实英文内容: ' + r1.raw.slice(0, 200));
  }
  console.log('1) 横躺书页：无乱码 + 识别出真实英文 ✓');

  // 2) 影视字幕：应提到 you/staircase/step 之类，且不含中文、不含乱码
  const r2 = await run('subtitle.jpg', '影视字幕');
  if (/[\u4e00-\u9fa5]/.test(r2.raw)) throw new Error('字幕混入了中文: ' + r2.raw.slice(0, 150));
  if (!/staircase|step|don.t|whole|see/i.test(r2.raw)) {
    throw new Error('字幕未识别出英文台词: ' + r2.raw.slice(0, 200));
  }
  console.log('2) 影视字幕：识别出英文台词、无中文乱码 ✓');

  // 3) 短台词字幕："Let's go." 不能被误杀
  const rs = await run('subtitle_short.jpg', '短台词字幕');
  if (!/let.?s\s+go/i.test(rs.raw)) throw new Error('短台词被误杀: ' + JSON.stringify(rs.raw));
  console.log('3a) 短台词字幕："Let\'s go." 正确保留 ✓');

  // 4) 转正书页：正常方向也应稳定
  const r3 = await run('book_upright.jpg', '正向书页');
  if (BAD.test(r3.raw)) throw new Error('正向书页出现乱码: ' + r3.raw.slice(0, 200));
  console.log('3b) 正向书页：稳定无乱码 ✓');

  // 4) 纯色噪声图：应返回空（宁可提示没识别到，也不吐乱码）
  const fs = require('fs');
  const noise = path.join(FIX, '_noise.png');
  // 造一张纯灰图
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 200; c.height = 200;
    const x = c.getContext('2d'); x.fillStyle = '#888'; x.fillRect(0, 0, 200, 200);
    window.__noise = c.toDataURL('image/png');
  });
  const dataUrl = await page.evaluate(() => window.__noise);
  fs.writeFileSync(noise, Buffer.from(dataUrl.split(',')[1], 'base64'));
  const r4 = await run('_noise.png', '纯色噪声图');
  if (r4.raw.trim().length > 0) throw new Error('噪声图竟吐出内容（乱码风险）: ' + r4.raw.slice(0, 150));
  console.log('4) 噪声图：返回空，未吐乱码 ✓');
  fs.unlinkSync(noise);

  // CDN 依赖检查（排除 supabase 翻译通道等正常业务请求）
  const cdn = external.filter((u) => /jsdelivr|tessdata|unpkg|cdnjs/i.test(u));
  if (cdn.length) throw new Error('仍在请求外部 OCR CDN: ' + cdn.join(', '));
  console.log('\n5) 无 jsdelivr/tessdata 等外部 CDN 请求 ✓');

  if (errs.length) { console.log('页面 JS 报错:', errs); process.exit(1); }
  console.log('全部通过，无 JS 报错');
  await browser.close();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });

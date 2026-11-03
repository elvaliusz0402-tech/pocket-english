// 模拟手机真实浏览器打开线上 talklog，捕获加载失败/控制台错误/白屏
const { chromium, devices } = require('playwright');

const URL = process.argv[2] || 'https://elvaliusz0402-tech.github.io/pocket-english/';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    ...devices['iPhone 13'],
    locale: 'zh-CN',
  });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('[console] ' + m.text());
  });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('requestfailed', (r) =>
    failed.push(r.url().replace(URL, './') + ' -> ' + (r.failure() && r.failure().errorText))
  );

  const t0 = Date.now();
  let navOk = true;
  try {
    await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  } catch (e) {
    navOk = false;
    console.log('NAV_FAIL: ' + e.message.split('\n')[0]);
  }
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    const vis = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return 'MISSING';
      const r = el.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)}`;
    };
    return {
      title: document.title,
      bodyTextLen: (document.body.innerText || '').trim().length,
      h1: document.querySelector('h1') ? document.querySelector('h1').innerText : 'MISSING',
      tabs: [...document.querySelectorAll('.tabs button, nav button, .tab')].map((b) => b.innerText.replace(/\s+/g, ' ').trim()),
      cards: document.querySelectorAll('.card').length,
      appSize: vis('#app') === 'MISSING' ? vis('main') : vis('#app'),
      swActive: !!navigator.serviceWorker && navigator.serviceWorker.controller ? 'yes' : 'no',
    };
  });

  console.log('URL     : ' + URL);
  console.log('nav     : ' + (navOk ? 'OK' : 'FAIL') + '  load=' + loadMs + 'ms');
  console.log('title   : ' + info.title);
  console.log('h1      : ' + info.h1);
  console.log('textLen : ' + info.bodyTextLen);
  console.log('cards   : ' + info.cards);
  console.log('tabs    : ' + JSON.stringify(info.tabs));
  console.log('sw      : ' + info.swActive);
  console.log('reqFail : ' + (failed.length ? JSON.stringify(failed, null, 1) : 'none'));
  console.log('errors  : ' + (errors.length ? JSON.stringify(errors, null, 1) : 'none'));
  await browser.close();
})();

const { chromium, devices } = require('playwright');

const URL = 'http://127.0.0.1:8765/index.html';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'zh-CN' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });

  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  // 1. 图标：tabbar 里是否还有 emoji，SVG 是否渲染
  const iconInfo = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.tabbar button')];
    const svgCount = btns.filter((b) => b.querySelector('svg')).length;
    const emoji = btns.map((b) => b.textContent).join('').match(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu);
    const gear = !!document.querySelector('#btn-settings svg');
    const sizes = [...document.querySelectorAll('.tabbar .ico svg')].map((s) => {
      const r = s.getBoundingClientRect();
      return Math.round(r.width) + 'x' + Math.round(r.height);
    });
    return { svgCount, emoji: emoji || null, gear, sizes };
  });
  console.log('图标        :', JSON.stringify(iconInfo));

  // 2. 语言包
  const packs = await page.evaluate(() => [...document.querySelectorAll('#pb-packs .chip')].map((c) => c.textContent.trim()));
  console.log('语言包      :', packs.join(' | '));
  const firstCount = await page.evaluate(() => document.getElementById('pb-count').innerText);
  console.log('默认包提示  :', firstCount.slice(0, 60));

  await page.click('#pb-packs .chip:nth-child(2)');
  await page.waitForTimeout(400);
  const afterSwitch = await page.evaluate(() => ({
    count: document.getElementById('pb-count').innerText.slice(0, 60),
    cats: [...document.querySelectorAll('#pb-cats .chip')].map((c) => c.textContent.trim()),
    rows: document.querySelectorAll('#pb-list .entry').length,
    sample: document.querySelector('#pb-list .entry .en')?.textContent || '',
    stored: localStorage.getItem('talklog-pack'),
  }));
  console.log('切到第二包  :', JSON.stringify(afterSwitch));

  // 3. 积累库：粘贴英文保存
  await page.click('.tabbar button[data-tab="library"]');
  await page.waitForTimeout(300);
  await page.click('#lib-paste');
  await page.waitForTimeout(300);
  console.log('粘贴面板    :', (await page.textContent('#sheet h3')).trim());
  await page.fill('#ps-in', 'Could you walk me through the process?\nThat works for me.\n');
  await page.click('#ps-go');
  await page.waitForTimeout(2500);
  const preview = await page.evaluate(() => ({
    cards: document.querySelectorAll('#ps-out .card').length,
    first: document.querySelector('#ps-out .card .en')?.textContent || '',
    cn: document.querySelector('#ps-out .card [data-cn]')?.value || '',
    title: document.querySelector('#ps-out .section-title')?.textContent || '',
  }));
  console.log('粘贴预览    :', JSON.stringify(preview));
  await page.click('#ps-save');
  await page.waitForTimeout(800);
  const lib = await page.evaluate(() => ({
    entries: document.querySelectorAll('#lib-list .entry').length,
    firstEn: document.querySelector('#lib-list .entry .en')?.textContent || '',
    speakBtn: document.querySelectorAll('#lib-list .entry [data-speak]').length,
    sub: document.getElementById('appbar-sub').textContent,
  }));
  console.log('入库结果    :', JSON.stringify(lib));

  // 4. 朗读：点积累库第一条的喇叭，看是否有 audio 元素/请求
  const requests = [];
  page.on('request', (r) => { if (r.url().includes('/audio/')) requests.push(r.url().split('/').pop()); });
  await page.click('#lib-list .entry [data-speak]');
  await page.waitForTimeout(1200);
  console.log('音频请求    :', requests.length ? requests : '（无，可能走系统 TTS）');

  console.log('页面错误    :', errs.length ? errs : 'none');
  await page.screenshot({ path: 'tools/shot-phrases.png', fullPage: false });
  await browser.close();
})().catch((e) => { console.error('FAIL:', String(e).slice(0, 300)); process.exit(1); });

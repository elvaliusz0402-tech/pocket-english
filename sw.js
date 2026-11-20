/* Service Worker：离线可用（应用外壳 + 语料库） */
const VERSION = 'pe-v28';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/app.js',
  './js/icons.js',
  './js/store.js',
  './js/engine.js',
  './js/search.js',
  './js/ocr.js',
  './js/practice.js',
  './js/drill.js',
  './js/ui.js',
  './js/sync.js',
  './data/corpus-work.js',
  './data/corpus-social.js',
  './data/corpus-life.js',
  './data/phrasebook.js',
  './data/packs.js',
  './audio/index.json',
  // OCR 引擎（约 10M）不放进安装期预缓存：避免每次版本更新都重下 10M 拖慢国内首次打开。
  // 改为「首次用到图片识别时才按需下载」，之后由下方 fetch 的缓存优先逻辑永久离线可用。
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

/* 单个资源缓存：失败重试一次，仍失败则跳过，避免一个资源拖垮整个离线包 */
async function cacheOne(cache, url, tries = 2) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(new Request(url, { cache: 'reload' }));
      if (res && res.status === 200) {
        const type = res.headers.get('content-type') || '';
        // 防止把代理/CDN 的错误页当成资源存下来
        if (!/text\/html/.test(type) || /\.html?($|\?)/.test(url) || url.endsWith('/')) {
          await cache.put(url, res.clone());
          return true;
        }
      }
    } catch (_) { /* 忽略，进入下一次重试 */ }
    if (i < tries - 1) await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then(async (cache) => {
        const results = await Promise.all(SHELL.map((u) => cacheOne(cache, u)));
        const failed = SHELL.filter((_, i) => !results[i]);
        if (failed.length) console.warn('[sw] 未缓存成功：', failed);
      })
      .catch(() => null)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 跨域 CDN（大模型接口）：直接走网络，不做缓存拦截
  if (url.origin !== self.location.origin) return;

  // 本地 OCR 引擎（约 10M，版本固定不变）：缓存优先，首次下载后永久离线可用，
  // 不再每次都回源、也不受 jsdelivr/tessdata 等外部 CDN 影响
  if (url.pathname.includes('/vendor/tesseract/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req)))
    );
    return;
  }

  // 网络优先：保证更新即时生效；断网时回落到缓存
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === 'navigate') {
          const shell = await caches.match('./index.html');
          if (shell) return shell;
        }
        return new Response('离线状态下暂无此资源', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      })
  );
});

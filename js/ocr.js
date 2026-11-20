/* OCR：本地 Tesseract.js —— 引擎与语言包全部随应用打包，不依赖任何外部 CDN
 *
 * 针对「识别乱码 / 识别不出来」的四个根治点：
 * 1) 引擎本地化：tesseract.min.js + worker + wasm core + eng 语言包都在 /vendor/tesseract/，
 *    大陆网络不再依赖 jsdelivr / tessdata CDN，装过一次后离线也能识别。
 * 2) 自动判断方向：0° / 90° / 180° / 270° 四个方向各识别一次，用「英文质量分」选出
 *    正确方向 —— 书页横躺、竖拍横版书、旋转的影视截图都能自动转正（这是乱码主因）。
 * 3) 乱码硬拦截：只认「真实英文单词」，孤立字母、符号串、全大写缩写碎片一律丢弃；
 *    整张图都不可信时返回空字符串，宁可提示「没识别到」，也绝不把乱码塞给用户。
 * 4) 预处理：放大 + 灰度 + 深底反相 + 对比度拉伸（对浅色书页和深色字幕都有效）。
 */
const VENDOR = new URL('../vendor/tesseract/', import.meta.url).href;

let loading = null;

export function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = VENDOR + 'tesseract.min.js';
    s.onload = () => (window.Tesseract ? resolve(window.Tesseract) : reject(new Error('OCR 引擎加载失败')));
    s.onerror = () => reject(new Error('无法加载本地 OCR 引擎（请刷新重试）'));
    document.head.appendChild(s);
  }).catch((e) => { loading = null; throw e; });
  return loading;
}

/* ---------- 图像预处理 ---------- */
/** 等比缩放到合适尺寸（不做任何像素级处理），返回 canvas */
async function toCanvas(file, { maxSide = 2000, minSide = 1200 } = {}) {
  const bmp = await createImageBitmap(file);
  const { width: w0, height: h0 } = bmp;
  let scale = Math.min(1, maxSide / Math.max(w0, h0));
  if (Math.min(w0, h0) < minSide) scale = Math.max(scale, Math.min(2.4, minSide / Math.min(w0, h0)));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w0 * scale));
  c.height = Math.max(1, Math.round(h0 * scale));
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return c;
}

/** 灰度 + 深底反相 + 对比度拉伸（在传入 canvas 上就地处理）。
 *  注意：这一步对「本来就清晰的图」可能是负优化（实测会把干净字幕毁成乱码），
 *  所以 recognize 采用两轮策略：先原图直识，得分不够才用增强图兜底。 */
function enhance(c) {
  try {
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = g;
      sum += g;
    }
    const mean = sum / (d.length / 4);
    if (mean < 105) {                       // 深底浅字（视频字幕/夜间截图）反相
      for (let i = 0; i < d.length; i += 4) {
        const v = 255 - d[i];
        d[i] = d[i + 1] = d[i + 2] = v;
      }
    }
    const hist = new Array(256).fill(0);
    for (let i = 0; i < d.length; i += 4) hist[d[i]]++;
    const total = d.length / 4;
    let lo = 0, acc = 0;
    for (; lo < 256; lo++) { acc += hist[lo]; if (acc > total * 0.02) break; }
    let hi = 255; acc = 0;
    for (; hi > 0; hi--) { acc += hist[hi]; if (acc > total * 0.02) break; }
    const span = Math.max(1, hi - lo);
    const lut = new Uint8Array(256);
    for (let v = 0; v < 256; v++) lut[v] = Math.max(0, Math.min(255, Math.round(((v - lo) * 255) / span)));
    for (let i = 0; i < d.length; i += 4) {
      const v = lut[d[i]];
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
  } catch { /* 读不了像素就保持原样 */ }
  return c;
}

/** 把 canvas 旋转 deg 度后导出为 blob；0° 直接导出 */
function rotatedBlob(src, deg) {
  if (!deg) return new Promise((r) => src.toBlob(r, 'image/png'));
  const swap = deg % 180 !== 0;
  const c = document.createElement('canvas');
  c.width = swap ? src.height : src.width;
  c.height = swap ? src.width : src.height;
  const x = c.getContext('2d');
  x.imageSmoothingQuality = 'high';
  x.translate(c.width / 2, c.height / 2);
  x.rotate((deg * Math.PI) / 180);
  x.drawImage(src, -src.width / 2, -src.height / 2);
  return new Promise((r) => c.toBlob(r, 'image/png'));
}

/* ---------- 乱码识别 / 质量打分 ---------- */

/** 一个「真实英文单词」：≥3 字母、含元音、非全大写缩写串（ITEC/SST/EE 这类是碎片） */
function realWords(text) {
  return String(text).split(/\s+/)
    .map((tok) => tok.replace(/[^A-Za-z'’\-]/g, ''))
    .filter((w) => w.length >= 3 && /[aeiouAEIOU]/.test(w))
    .filter((w) => !/^[A-Z'’-]{2,}$/.test(w));
}

const FUNC = new Set([
  'the','a','an','is','are','was','were','be','been','am','to','of','in','on','at','for','and','or','but',
  'with','without','you','your','yours','i','we','they','he','she','it','this','that','these','those',
  'not','no','do','does','did','done','have','has','had','can','could','will','would','should','may',
  'might','must','my','me','us','him','her','them','as','if','so','than','from','by','up','out',
  'about','what','how','when','where','why','who','which','there','here','just','all','into','before',
  'because','while','take','get','got','said','says','don’t',"don't",'let’s',"let's",'would','usual'
]);

/* 合法的英文短词：影视台词里大量是 "Let's go." / "I'm fine." 这类短句，
   若把它们当碎片丢掉就等于没解决字幕识别。这些词不算 junk。 */
const SHORT_OK = new Set([
  'a','i','am','is','are','be','to','of','in','on','at','it','my','we','he','she','no','do','so',
  'up','or','if','as','by','me','us','go','get','got','an','not','you','your','the','and','but',
  'hi','ok','yes','all','out','who','why','how','one','two','can','will','just','fine','im',"i'm",
  'its',"it's",'let',"let's",'dont',"don't",'cant',"can't",'run','now','see','say','way','day'
]);

/** 整段文本的「英文质量分」：真实长词 + 功能词越多越高，符号/大写缩写碎片越多越低。
 *  用于四个方向择优：正确方向得分通常是乱码方向的数倍。 */
export function textQuality(text) {
  const t = String(text || '');
  const words = realWords(t);
  const long = words.filter((w) => w.length >= 4).length;
  const func = words.filter((w) => FUNC.has(w.toLowerCase())).length;
  const avgLen = words.length ? words.reduce((a, w) => a + w.length, 0) / words.length : 0;
  const symbols = (t.match(/[^A-Za-z0-9\s.,!?'"’“”:;()\-]/g) || []).length;
  const caps = (t.match(/\b[A-Z]{2,}\b/g) || []).length;
  const singles = (t.split(/\s+/).filter((w) => /^[A-Za-z]\.?$/.test(w)) || []).length;
  return long * 3 + func * 5 + Math.min(avgLen, 7) * 2 - symbols * 3 - caps * 2 - singles * 2;
}

/** 去掉行首行尾装饰符号，压平空白 */
function tidy(line) {
  return String(line || '')
    .replace(/^[^A-Za-z0-9"'(\[]+/, '')
    .replace(/[^A-Za-z0-9.!?,;:'"()\[\]%\-]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 一行是否像真的英文（乱码硬拦截）：碎片/符号串/大写缩写串一律判死 */
function acceptable(text, confidence) {
  const t = tidy(text);
  if (!t) return false;
  if (typeof confidence === 'number' && confidence > 0 && confidence < 42) return false;

  const alpha = (t.match(/[A-Za-z]/g) || []).length;
  if (alpha < 4) return false;
  const symbols = (t.match(/[^A-Za-z0-9\s.,!?'"’“”:;()\-]/g) || []).length;
  if (symbols / Math.max(1, t.length) > 0.08) return false;

  const toks = t.split(/\s+/);
  // 干净的短台词（"Let's go." / "I'm fine." / "Thank you."）：影视字幕大量是这类，
  // 不能因「长词不足 2 个」误杀；但数字、全大写缩写串、孤立字母一律拒绝，防住碎片乱码。
  if (toks.length >= 2 && toks.length <= 5) {
    const hasDigit = toks.some((x) => /\d/.test(x));
    const hasCaps = toks.some((x) => /^[A-Z]{2,}$/.test(x.replace(/[^A-Za-z]/g, '')));
    const okTok = toks.filter((x) => {
      const w = x.replace(/[^A-Za-z'’]/g, '').toLowerCase();
      return SHORT_OK.has(w) || (w.length >= 3 && /[aeiou]/.test(w));
    });
    const conf = typeof confidence === 'number' && confidence > 0 ? confidence >= 50 : true;
    if (!hasDigit && !hasCaps && okTok.length >= 2 && okTok.length / toks.length >= 0.8 && conf) return true;
  }

  const words = realWords(t);
  if (words.length < 2) return false;                 // 至少两个真实英文词
  const junk = toks.filter((x) => {
    const w = x.replace(/[^A-Za-z]/g, '');
    return !w || (w.length <= 2 && !SHORT_OK.has(x.replace(/[^A-Za-z'’]/g, '').toLowerCase()))
      || /^[A-Z]{2,}$/.test(w) || /^\d+$/.test(x);
  }).length;
  if (junk / toks.length > 0.38) return false;       // 碎片词太多
  const func = words.filter((w) => FUNC.has(w.toLowerCase())).length;
  if (words.length >= 4 && func === 0) return false;   // 长串却没功能词 = 花字/水印
  return true;
}

function linesFromBlocks(data) {
  const out = [];
  const blocks = data.blocks || data.lines || [];
  (blocks || []).forEach((b) => {
    (b.paragraphs || []).forEach((p) => {
      (p.lines || []).forEach((l) => out.push({ text: l.text, confidence: l.confidence }));
    });
    if (b.lines) b.lines.forEach((l) => out.push({ text: l.text, confidence: l.confidence }));
  });
  return out;
}

/** 行内后处理：合并被换行切断的半句、按句读切分、子串级去重 */
function refineLines(rawLines) {
  const nkey = (x) => x.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const ENDS = /[.!?:;,")]$/;
  const merged = [];
  for (const line of rawLines) {
    const t = tidy(line);
    if (!t) continue;
    const prev = merged[merged.length - 1];
    if (prev && !ENDS.test(prev) && /^[a-z]/.test(t) && prev.length > 8) {
      merged[merged.length - 1] = `${prev} ${t}`;
    } else merged.push(t);
  }
  const kept = [];
  for (const line of merged) {
    for (const seg of line.split(/(?<=[.!?])\s+|\s*[»|•·]+\s*/)) {
      const t = tidy(seg);
      if (!t || !acceptable(t)) continue;
      const a = nkey(t);
      // 长句要求 ≥8 字符去噪；但干净短台词（"Let's go."）acceptable 已严格验过，放行
      if (a.length < 8 && !/^[a-z][a-z' ]{2,15}$/.test(a)) continue;
      const dup = kept.some((b) => {
        const bb = nkey(b);
        if (a === bb) return true;
        if (a.length > 14 && bb.length > 14) {
          if (bb.includes(a) || a.includes(bb)) return true;
          if (a.startsWith(bb.slice(0, 30)) || bb.startsWith(a.slice(0, 30))) return true;
        }
        return false;
      });
      if (!dup) kept.push(t);
    }
  }
  return kept.join('\n');
}

/* ---------- 主流程 ---------- */

/**
 * 识别图片（自动判断 4 个方向）
 * @param {Blob|File} file
 * @param {(p:number, status:string)=>void} onProgress 0~1
 */
export async function recognize(file, onProgress) {
  const T = await loadTesseract();
  onProgress?.(0.04, '正在优化图片…');

  let base;
  try {
    base = await toCanvas(file);
  } catch {
    // createImageBitmap 不可用时退回 <img> 画到 canvas，保证仍能识别
    const url = URL.createObjectURL(file);
    try {
      const im = await new Promise((res, rej) => {
        const el = new Image(); el.onload = () => res(el); el.onerror = rej; el.src = url;
      });
      const c = document.createElement('canvas');
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      c.getContext('2d').drawImage(im, 0, 0);
      base = c;
    } finally { URL.revokeObjectURL(url); }
  }

  const worker = await T.createWorker('eng', 1, {
    workerPath: VENDOR + 'worker.min.js',
    corePath: VENDOR + 'core',
    langPath: VENDOR + 'lang',
    gzip: true,
    cacheMethod: 'none'
  });
  try {
    try { await worker.setParameters({ preserve_interword_spaces: '1' }); } catch { /* 旧版忽略 */ }

    let best = { q: -Infinity, data: null, deg: 0 };
    const angles = [0, 90, 180, 270];
    /* 一轮 = 对给定 canvas 跑 4 个方向；返回是否可提前结束 */
    const runDirs = async (canvas, step) => {
      for (let i = 0; i < angles.length; i++) {
        const deg = angles[i];
        onProgress?.(0.08 + step * 0.4 + i * 0.1, `正在识别文字（自动判断方向 ${i + 1}/4${step ? '，增强模式' : ''}）…`);
        const blob = await rotatedBlob(canvas, deg);
        if (!blob) continue;
        let data;
        try { ({ data } = await worker.recognize(blob, {}, { text: true, blocks: true })); }
        catch { continue; }
        const q = textQuality(data?.text || '');
        if (q > best.q) best = { q, data, deg };
        // 正向且已经很清晰（影视截图/正常书页）→ 提前结束，不必空跑剩下三个方向
        if (deg === 0 && q >= 150) return true;
      }
      return false;
    };

    /* 第一轮：原图直识。清晰截图/正常书页本来就好，灰度反相拉伸反而可能帮倒忙。 */
    const early = await runDirs(base, 0);

    /* 第二轮：原图得分不够（暗底花字/复杂光照/低对比）→ 增强图兜底，两轮取全局最优 */
    if (!early && best.q < 60) {
      const proc = enhance(cloneCanvas(base));
      await runDirs(proc, 1);
    }
    onProgress?.(0.92, '正在整理结果…');

    if (!best.data || best.q < 12) return '';        // 整图都不可信 → 空结果，绝不吐乱码

    const lines = linesFromBlocks(best.data);
    const candidates = lines.length
      ? lines.filter((l) => acceptable(l.text, l.confidence)).map((l) => tidy(l.text)).filter(Boolean)
      : String(best.data.text || '').split(/\n+/).map(tidy).filter((l) => acceptable(l));
    return refineLines(candidates);
  } finally {
    await worker.terminate().catch(() => {});
  }
}

/** 复制一份 canvas（增强处理不污染原图） */
function cloneCanvas(src) {
  const c = document.createElement('canvas');
  c.width = src.width; c.height = src.height;
  c.getContext('2d').drawImage(src, 0, 0);
  return c;
}

/** 兼容旧调用：压缩图片 */
export async function downscale(file, maxSide = 1600) {
  if (!file.type || !file.type.startsWith('image/')) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    if (scale >= 1) { bmp.close?.(); return file; }
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close?.();
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    return blob || file;
  } catch { return file; }
}

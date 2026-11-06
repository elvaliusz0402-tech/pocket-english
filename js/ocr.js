/* OCR：Tesseract.js（首次联网加载引擎，之后浏览器缓存）
 * 解决"识别出来一堆乱码"：
 * 1) 预处理：放大 + 灰度 + 对比度拉伸，深底浅字（视频截图）自动反相
 * 2) 逐行取置信度，低置信度的行直接丢
 * 3) 字符/词级校验：符号占比过高、全是碎片词、字母太少的行判为噪声
 */
const CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

let loading = null;

export function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CDN;
    s.onload = () => (window.Tesseract ? resolve(window.Tesseract) : reject(new Error('引擎加载失败')));
    s.onerror = () => reject(new Error('无法加载 OCR 引擎，请检查网络（首次使用需联网下载）'));
    document.head.appendChild(s);
  }).catch((e) => { loading = null; throw e; });
  return loading;
}

/** 图像预处理：放大（小图很影响准确率）、灰度、反相、对比度拉伸 */
async function preprocess(file, { maxSide = 2000, minSide = 1100 } = {}) {
  const bmp = await createImageBitmap(file);
  const { width: w0, height: h0 } = bmp;
  let scale = Math.min(1, maxSide / Math.max(w0, h0));
  // 小图（手机截图缩放过、字幕区域小）适当放大，Tesseract 对 30px 以下的字几乎无解
  if (Math.min(w0, h0) < minSide) scale = Math.max(scale, Math.min(2.2, minSide / Math.min(w0, h0)));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w0 * scale));
  c.height = Math.max(1, Math.round(h0 * scale));
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();

  try {
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const d = img.data;

    /* 灰度 */
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = g;
      sum += g;
    }
    const mean = sum / (d.length / 4);
    /* 深底浅字（视频、夜间截图）反相，Tesseract 对"白底黑字"最准 */
    if (mean < 105) {
      for (let i = 0; i < d.length; i += 4) {
        const v = 255 - d[i];
        d[i] = d[i + 1] = d[i + 2] = v;
      }
    }
    /* 对比度拉伸：按 2% / 98% 分位裁掉极值 */
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
  } catch { /* 某些浏览器禁止读像素就跳过增强，直接识别原图 */ }

  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  return blob || file;
}

/* ---------- 行级清洗与过滤 ---------- */

/** 去掉行首行尾的装饰符号（» ) € 之类），保留正常标点 */
function tidy(line) {
  return String(line || '')
    .replace(/^[^A-Za-z0-9"'(\[]+/, '')
    .replace(/[^A-Za-z0-9.!?,;:'"()\[\]%\-]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const SHORT_OK = /^(a|i|an|am|is|are|to|of|in|on|at|it|my|we|he|she|no|do|so|up|or|if|be)$/i;

/* 常见功能词：真句子几乎必然出现其中之一；vlog 花字/贴纸上的大写碎片不会有 */
const FUNC = /(^|\s)(the|a|an|is|are|was|were|be|been|am|to|of|in|on|at|for|and|or|but|with|without|you|your|i|we|they|he|she|it|this|that|these|those|not|no|do|does|did|done|have|has|had|can|could|will|would|should|may|might|must|my|me|us|him|her|them|as|if|so|than|from|by|up|out|about|what|how|when|where|why|who|which|there|here)(\s|$)/i;

/** 这一行像不像真的英文句子 */
function acceptable(text, confidence) {
  const t = tidy(text);
  if (!t) return false;
  if (typeof confidence === 'number' && confidence < 58) return false;

  const letters = (t.match(/[A-Za-z]/g) || []).length;
  if (letters < 6) return false;                       // 字母太少，多半是图标/噪声

  const symbols = (t.match(/[^A-Za-z0-9\s.,!?;:'"()\-]/g) || []).length;
  if (symbols / Math.max(1, t.length) > 0.1) return false;   // € « » ~ | | 一堆符号

  const toks = t.split(/\s+/);
  const good = toks.filter((x) => /^[A-Za-z][A-Za-z'’,.\-]*$/.test(x)).length;
  const nums = toks.filter((x) => /^[\d$%.,:]+$/.test(x)).length;
  if ((good + nums) / toks.length < 0.62) return false;       // 一半以上是碎片

  const tiny = toks.filter((x) => x.replace(/[^A-Za-z]/g, '').length <= 2 && !SHORT_OK.test(x)).length;
  if (toks.length >= 5 && tiny / toks.length > 0.45) return false;   // vlog 花字常见碎片串

  /* 两三个词、又没有任何功能词、字母又少 —— 基本是 UI 标题被截进来（如 “talklo pe”） */
  if (toks.length <= 2 && letters < 8 && !FUNC.test(t)) return false;

  /* 长句必须含功能词，否则是花字/水印上的一串大写词（KEMP LRE FUER… 这种） */
  if (toks.length >= 4 && !FUNC.test(t)) return false;

  /* 大写碎片占比过高（无小写词的 shouting 字幕）且没有功能词 → 丢 */
  const hasLower = /[a-z]{3,}/.test(t);
  if (!hasLower && toks.length >= 4 && !FUNC.test(t)) return false;

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

/**
 * 行内后处理：Tesseract 常把「字幕 + 跑马灯 + 重复字幕」合并成一行，
 * 这里在行内部按句读/装饰符切分，逐段校验，并去掉彼此的重复与截断。
 * 另外把被换行切断的半句（上一行没句末标点、下一行小写开头）接回去。
 */
function refineLines(rawLines) {
  const nkey = (x) => x.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const ENDS = /[.!?:;,")]$/;

  /* 1) 合并跨行的半句 */
  const merged = [];
  for (const line of rawLines) {
    const t = tidy(line);
    if (!t) continue;
    const prev = merged[merged.length - 1];
    if (prev && !ENDS.test(prev) && /^[a-z]/.test(t) && prev.length > 8) {
      merged[merged.length - 1] = `${prev} ${t}`;
    } else merged.push(t);
  }

  /* 2) 逐段校验 + 子串级去重 */
  const keptSents = [];
  for (const line of merged) {
    // 按句末标点切，也按 » | • 等装饰符切开（把 "vv www »)" 这类噪声段孤立出来丢掉）
    for (const seg of line.split(/(?<=[.!?])\s+|\s*[»|•·]+\s*/)) {
      const t = tidy(seg);
      if (!t || !acceptable(t)) continue;
      const a = nkey(t);
      if (a.length < 8) continue;
      const dup = keptSents.some((b) => {
        const bb = nkey(b);
        if (a === bb) return true;
        if (a.length > 14 && bb.length > 14) {
          if (bb.includes(a) || a.includes(bb)) return true;              // 整句被重复识别
          if (a.startsWith(bb.slice(0, 30)) || bb.startsWith(a.slice(0, 30))) return true; // 截断重复
        }
        return false;
      });
      if (!dup) keptSents.push(t);
    }
  }
  return keptSents.join('\n');
}

/**
 * 识别图片
 * @param {Blob|File} file
 * @param {(p:number, status:string)=>void} onProgress 0~1
 */
export async function recognize(file, onProgress) {
  const T = await loadTesseract();
  onProgress?.(0.06, '正在优化图片…');
  let img = file;
  try { img = await preprocess(file); } catch { img = file; }

  const worker = await T.createWorker('eng', 1, {
    logger: (m) => {
      if (!onProgress) return;
      if (m.status === 'recognizing text') onProgress(Math.max(0.2, m.progress), '正在识别文字…');
      else if (m.progress !== undefined) onProgress(Math.min(0.18, m.progress * 0.18), '正在加载模型…');
      else onProgress(0.1, m.status || '准备中…');
    }
  });
  try {
    try { await worker.setParameters({ preserve_interword_spaces: '1' }); } catch { /* 旧版忽略 */ }
    const { data } = await worker.recognize(img, {}, { blocks: true });

    const lines = linesFromBlocks(data);
    if (lines.length) {
      // 先按置信度/形态过一遍，再统一交给 refineLines 接句与去重
      const ok = lines
        .filter((l) => acceptable(l.text, l.confidence))
        .map((l) => tidy(l.text))
        .filter(Boolean);
      if (ok.length) return refineLines(ok);
    }
    /* 拿不到分块结构时，退回按行过滤纯文本（同样走 refineLines 去重/接句） */
    const fallback = String(data.text || '')
      .split(/\n+/)
      .map(tidy)
      .filter((l) => acceptable(l));
    return refineLines(fallback);
  } finally {
    await worker.terminate().catch(() => {});
  }
}

/** 兼容旧调用：压缩图片（现在预处理里自带缩放，保留导出避免别处引用报错） */
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
  } catch {
    return file;
  }
}

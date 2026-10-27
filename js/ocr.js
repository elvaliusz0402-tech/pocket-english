/* OCR：Tesseract.js（首次联网加载引擎，之后浏览器缓存） */
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

/**
 * 识别图片
 * @param {Blob|File} file
 * @param {(p:number, status:string)=>void} onProgress 0~1
 */
export async function recognize(file, onProgress) {
  const T = await loadTesseract();
  const worker = await T.createWorker('eng', 1, {
    logger: (m) => {
      if (!onProgress) return;
      if (m.status === 'recognizing text') onProgress(Math.max(0.15, m.progress), '正在识别文字…');
      else if (m.progress !== undefined) onProgress(Math.min(0.15, m.progress * 0.15), '正在加载模型…');
      else onProgress(0.08, m.status || '准备中…');
    }
  });
  try {
    const { data } = await worker.recognize(file);
    return data.text || '';
  } finally {
    await worker.terminate().catch(() => {});
  }
}

/** 压缩图片，减少 OCR 耗时与流量 */
export async function downscale(file, maxSide = 1600) {
  if (!file.type.startsWith('image/')) return file;
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

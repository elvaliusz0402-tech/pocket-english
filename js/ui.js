/* 通用 UI 工具 */
let toastTimer = null;

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function toast(msg, ms = 1900) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), ms);
}

export function speak(text, rate = 0.92) {
  try {
    if (!window.speechSynthesis) { toast('当前浏览器不支持朗读'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

export async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('已复制'); } catch { toast('复制失败'); }
    ta.remove();
  }
}

/** 底部弹出层 */
export function sheet(title, bodyNode, onClose) {
  const mask = document.getElementById('mask');
  const box = document.getElementById('sheet');
  box.innerHTML = `<h3>${esc(title)}</h3>`;
  box.appendChild(bodyNode);
  const close = () => { mask.classList.remove('on'); box.innerHTML = ''; onClose && onClose(); };
  mask.onclick = (e) => { if (e.target === mask) close(); };
  box.querySelector('.close-sheet')?.addEventListener('click', close);
  mask.classList.add('on');
  return { box, close };
}

export function confirmSheet(title, message, okText = '确定') {
  return new Promise((resolve) => {
    const node = el(`<div>
      <p style="margin:0 0 14px">${esc(message)}</p>
      <div class="btn-row">
        <button class="btn ghost" style="flex:1" data-no>取消</button>
        <button class="btn" style="flex:1" data-yes>${esc(okText)}</button>
      </div>
    </div>`);
    const s = sheet(title, node);
    node.querySelector('[data-no]').onclick = () => { s.close(); resolve(false); };
    node.querySelector('[data-yes]').onclick = () => { s.close(); resolve(true); };
  });
}

export function fmtTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toTimeString().slice(0, 5)
    : `${d.getMonth() + 1}/${d.getDate()}`;
}

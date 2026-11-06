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

/* ============ 朗读 ============
 * 三层策略，保证"点了就有声"：
 * 1) 预部署音频：./audio/s<hash>.mp3（构建时用 TTS 批量生成，任何设备、任何系统都能播）
 * 2) 系统 TTS（SpeechSynthesis）：先等声音列表就绪、选对英语声音再 speak
 * 3) 都失败时给出提示，绝不无声无息
 */
const hash32 = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return ('00000000' + h.toString(16)).slice(-8);
};

let curAudio = null;
let voicesWarm = false;

/* 预部署音频索引：audio/index.json → ["7dfb5dfa", ...]
 * 只有索引里有的句子才去请求 mp3，用户自己粘贴的句子直接走系统语音，不会先撞 404。 */
let audioIdx = null;
let audioIdxLoading = null;
function loadAudioIndex() {
  if (audioIdx) return Promise.resolve(audioIdx);
  if (audioIdxLoading) return audioIdxLoading;
  audioIdxLoading = fetch('./audio/index.json', { cache: 'force-cache' })
    .then((r) => (r.ok ? r.json() : { hashes: [] }))
    .then((j) => (audioIdx = new Set(j.hashes || [])))
    .catch(() => (audioIdx = new Set()))
    .finally(() => (audioIdxLoading = null));
  return audioIdxLoading;
}

function pickVoice() {
  const vs = speechSynthesis.getVoices().filter((v) => /^en(-|_)?/i.test(v.lang));
  if (!vs.length) return null;
  const prefer = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Ava', 'Alex', 'Daniel'];
  for (const name of prefer) {
    const hit = vs.find((v) => v.name.includes(name));
    if (hit) return hit;
  }
  return vs.find((v) => /en[-_]US/i.test(v.lang)) || vs[0];
}

function ttsSpeak(text, rate) {
  try {
    if (!window.speechSynthesis) return false;
    speechSynthesis.cancel();
    const go = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rate;
      const v = pickVoice();
      if (v) { u.voice = v; u.lang = v.lang; }
      speechSynthesis.speak(u);
      return true;
    };
    if (!voicesWarm || !speechSynthesis.getVoices().length) {
      // iOS/Android 首次调用时声音列表常为空 → 先空跑一次唤醒，再真正 speak
      voicesWarm = true;
      speechSynthesis.getVoices();
      const warm = new SpeechSynthesisUtterance(' ');
      warm.volume = 0;
      speechSynthesis.speak(warm);
      setTimeout(go, 120);
    } else {
      go();
    }
    return true;
  } catch { return false; }
}

/** 朗读一句英文。点击事件里直接调用即可。 */
export async function speak(text, rate = 0.92) {
  const t = String(text || '').trim();
  if (!t) return;
  // 停掉上一个
  try { speechSynthesis && speechSynthesis.cancel(); } catch { }
  if (curAudio) { try { curAudio.pause(); } catch { } curAudio = null; }

  // 1) 预部署音频（先查索引；命中才请求，Service Worker 会缓存，之后离线可播）
  const h = hash32(t);
  let has = false;
  try { has = (await loadAudioIndex()).has(h); } catch { has = false; }
  if (has) {
    const url = `./audio/s${h}.mp3`;
    try {
      const a = new Audio();
      a.preload = 'auto';
      a.src = url;
      curAudio = a;
      const done = new Promise((resolve) => {
        a.onended = () => resolve(true);
        a.onerror = () => resolve(false);
      });
      try { await a.play(); } catch { /* 播放被拦/文件缺失 → 落到下面的超时或 onerror，再退 TTS */ }
      const ok = await Promise.race([done, new Promise((r) => setTimeout(() => r('slow'), 4000))]);
      if (ok === true) return;
      try { a.pause(); } catch { }
    } catch { /* 落到 TTS */ }
  }

  // 2) 系统语音兜底
  if (!ttsSpeak(t, rate)) toast('这台设备暂时无法朗读');
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

/* talklog · 主应用 */
import { Store, SCENES, sceneName, sceneIcon, uid, newSRS } from './store.js';
import {
  generateVariants, enrichSentences, cleanText, splitSentences,
  guessScene, toEntry, llmConfig, saveLLMConfig, backupConfig, saveBackupConfig,
  llmReady, PRESETS, corpus, phrasebook,
  normalizeBaseUrl, localVariants, engineStatus, listModels, testLLM, testBothLLM
} from './engine.js';
import { buildIndex, searchEntries } from './search.js';
import { recognize, downscale } from './ocr.js';
import { buildQueue, grade, isDue, stats, dueIn, MASTERED_BOX } from './practice.js';
import {
  buildDailyDeck, markResult, dayProgress, saveDayProgress, checkAnswer, diffWords, phraseItems, DAILY_SIZE
} from './drill.js';
import { el, esc, toast, speak, copy, sheet, confirmSheet, fmtTime } from './ui.js';

const state = {
  entries: [],
  tab: 'phrases',
  scene: 'all',
  tag: '',
  q: '',
  dueOnly: false,
  capScene: '',
 ocrSents: [],
  ocrCards: [],
  pbCat: 'all',
  pbQ: '',
  pbOpen: {}   // 常用句分组折叠状态 { catId: bool }
};

/* ============ 数据 ============ */
async function load() {
  state.entries = await Store.all();
  state.entries.forEach((e) => { e._idx = buildIndex(e); });
  return state.entries;
}

function filtered() {
  let list = state.entries;
  if (state.scene !== 'all') list = list.filter((e) => e.scene === state.scene);
  if (state.tag) list = list.filter((e) => (e.tags || []).includes(state.tag));
  return list;
}

function searched() {
  const base = state.dueOnly ? filtered().filter(isDue) : filtered();
  if (!state.q.trim()) return base.map((e) => ({ e, s: 0 }));
  return searchEntries(base, state.q);
}

/* ============ 导航 ============ */
function setTab(name) {
  state.tab = name;
  document.querySelectorAll('.page').forEach((p) => p.classList.toggle('active', p.id === 'page-' + name));
  document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
  if (name === 'phrases') renderPhrases();
  if (name === 'library') renderLibrary();
  if (name === 'practice') renderPractice();
  try { history.replaceState(null, '', '#' + name); } catch { /* ignore */ }
  window.scrollTo({ top: 0 });
}

/* ============ 页面零：常用100句 ============ */
let PB_IDX = null;
function pbAll() {
  if (!PB_IDX) {
    PB_IDX = [];
    phrasebook().forEach((item, i) => {
      PB_IDX.push({
        i, cn: item.cn, en: item.variants[0].en, keys: item.keys,
        note: item.variants[0].tip, scene: item.variants[0].scene, cat: item._cat,
        _idx: buildIndex({ cn: item.cn, en: item.variants[0].en, tags: item.keys, natural: item.variants[0].tip })
      });
    });
  }
  return PB_IDX;
}

function pbRow(x, savedEn) {
  const saved = savedEn.has(x.en);
  const n = el(`<div class="entry pb">
      <div class="en">${esc(x.en)}</div>
      <div class="cn">${esc(x.cn)}</div>
      ${x.note ? `<div class="tip">💡 ${esc(x.note)}</div>` : ''}
      <div class="meta">
        <span class="chip mini scene">${sceneIcon(x.scene)} ${sceneName(x.scene)}</span>
        <span class="chip mini src">${esc(x.cat)}</span>
        <span style="flex:1"></span>
        <button class="btn sm ghost" data-speak>🔊</button>
        <button class="btn sm ghost" data-copy>复制</button>
        <button class="btn sm ${saved ? 'soft' : ''}" data-save ${saved ? 'disabled' : ''}>${saved ? '已入库' : '★ 收藏'}</button>
      </div>
    </div>`);
  n.querySelector('[data-speak]').onclick = () => speak(x.en);
  n.querySelector('[data-copy]').onclick = () => copy(`${x.en}（${x.cn}）`);
  n.querySelector('[data-save]').onclick = async () => {
    const e = toEntry({ en: x.en, scene: x.scene, tip: x.note, natural: '' }, x.cn, 'phrasebook', { sourceNote: x.cat });
    await Store.put(e);
    await load();
    updateSub();
    renderPhrases();
    toast('已收进积累库，可去练习页复习');
  };
  return n;
}

function renderPhrases() {
  const cats = window.PHRASEBOOK || [];
  const box = document.getElementById('pb-cats');
  box.innerHTML = '';
  const mk = (id, text) => {
    const c = el(`<button class="chip ${state.pbCat === id ? 'on' : ''}">${text}</button>`);
    c.onclick = () => { state.pbCat = id; renderPhrases(); };
    return c;
  };
  box.appendChild(mk('all', '全部'));
  cats.forEach((cat) => box.appendChild(mk(cat.id, `${cat.icon} ${cat.name}`)));

  const all = pbAll();
  const searching = !!state.pbQ.trim();
  const wrap = document.getElementById('pb-list');
  const savedEn = new Set(state.entries.map((e) => e.en));
  wrap.innerHTML = '';

  /* —— 搜索或选中某一类：平铺结果 —— */
  if (searching || state.pbCat !== 'all') {
    let list = all.filter((x) => state.pbCat === 'all' || cats.find((c) => c.id === state.pbCat)?.name === x.cat);
    if (searching) list = searchEntries(list, state.pbQ).map((r) => r.e);
    document.getElementById('pb-count').textContent = searching
      ? `匹配到 ${list.length} 句`
      : `${cats.find((c) => c.id === state.pbCat)?.name || ''} · 共 ${list.length} 句 · 点★即可收进积累库`;
    if (!list.length) {
      wrap.innerHTML = `<div class="empty"><span class="big">🔎</span>没找到，换个关键词试试<br><span class="muted">支持中文意思、英文单词、场景名</span></div>`;
      return;
    }
    list.forEach((x) => wrap.appendChild(pbRow(x, savedEn)));
    return;
  }

  /* —— 默认浏览：按类别分组，全部展开，可逐组折叠 —— */
  const openCount = cats.filter((c) => state.pbOpen[c.id] !== false).length;
  document.getElementById('pb-count').innerHTML =
    `共 ${all.length} 句 · ${openCount}/${cats.length} 组展开 · 点组标题可折叠，点★收藏`;

  cats.forEach((cat) => {
    const items = all.filter((x) => x.cat === cat.name);
    if (!items.length) return;
    const open = state.pbOpen[cat.id] !== false;
    const g = el(`<div class="pb-group ${open ? '' : 'closed'}">
      <header class="pb-head">
        <span class="caret">▾</span>
        <span class="pb-ico">${cat.icon}</span>
        <b>${esc(cat.name)}</b>
        <span class="muted">${items.length} 句</span>
        <span style="flex:1"></span>
      </header>
      <div class="pb-body"></div>
    </div>`);
    const body = g.querySelector('.pb-body');
    items.forEach((x) => body.appendChild(pbRow(x, savedEn)));
    g.querySelector('.pb-head').onclick = () => {
      state.pbOpen[cat.id] = !open;   // 折叠 ↔ 展开
      renderPhrases();
    };
    wrap.appendChild(g);
  });
}

/* ============ 页面一：快速记录 ============ */
function renderCaptureScenes() {
  const box = document.getElementById('cap-scenes');
  box.innerHTML = '';
  const all = el(`<button class="chip ${state.capScene === '' ? 'on' : ''}" data-s="">不限</button>`);
  all.onclick = () => { state.capScene = ''; renderCaptureScenes(); };
  box.appendChild(all);
  SCENES.forEach((s) => {
    const c = el(`<button class="chip ${state.capScene === s.id ? 'on' : ''}" data-s="${s.id}">${s.icon} ${s.name}</button>`);
    c.onclick = () => { state.capScene = state.capScene === s.id ? '' : s.id; renderCaptureScenes(); };
    box.appendChild(c);
  });
}

async function onGenerate() {
  const input = document.getElementById('cap-input');
  const cn = input.value.trim();
  const out = document.getElementById('cap-results');
  if (!cn) { toast('先用中文写下你想表达的意思'); return; }

  const btn = document.getElementById('cap-go');
  btn.disabled = true; btn.textContent = '生成中…';
  out.innerHTML = `<div class="card"><div class="muted">正在生成…</div></div>`;
  try {
    const res = await generateVariants(cn, state.capScene);
    renderVariants(out, cn, res);
  } catch (e) {
    out.innerHTML = `<div class="card"><div class="muted">生成失败：${esc(e.message)}</div>
      <div class="muted" style="margin-top:8px">可在设置里配置大模型，或换个说法再试。</div></div>`;
  } finally {
    btn.disabled = false; btn.textContent = '翻译成地道英文';
  }
}

function renderVariants(out, cn, res) {
  /* AI 已配置但失败：绝不拿本地句子冒充翻译。给出原因 + 用户自己选 */
  if (!res.variants.length && res.aiError) {
    out.innerHTML = `<div class="card">
      <div class="banner warn">⚠️ 大模型没能用上，本次没有生成翻译<br>
        <span class="muted">${esc(String(res.aiError).slice(0, 200))}</span></div>
      <div class="muted" style="font-size:13px;line-height:1.6">常见原因：接口地址不对（应如 <b>https://api.deepseek.com</b>，程序会自动补 <b>/v1</b>）、Key 失效、模型名写错、或该服务商不允许网页直连。<br>
      去「⚙️ 设置 → 测试连接」可以直接定位。</div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn sm" id="cap-retry">重试</button>
        ${res.localHit ? `<button class="btn sm ghost" id="cap-local">看本地近似说法</button>` : ''}
        <button class="btn sm ghost" id="cap-manual">手动添加</button>
      </div>
    </div>`;
    out.querySelector('#cap-retry').onclick = onGenerate;
    out.querySelector('#cap-manual').onclick = () => openEditor(null, { cn });
    const lv = res.localHit ? localVariants(res.localHit) : null;
    if (lv) out.querySelector('#cap-local').onclick = () => renderVariants(out, cn, { ...lv, aiError: res.aiError });
    return;
  }
  if (!res.variants.length) {
    out.innerHTML = `<div class="card">
      <div class="empty"><span class="big">🤔</span>本地语料库里没有贴切的说法，<b>宁可不给你也不给错的</b>。<br>
      换个更短的说法试试，或在设置里接入大模型来生成任意中文。</div>
      <div class="btn-row"><button class="btn ghost sm" id="cap-manual">手动添加这条</button></div>
    </div>`;
    out.querySelector('#cap-manual').onclick = () => openEditor(null, { cn });
    return;
  }
  const head = res.source === 'ai'
    ? `<div class="banner ok">✨ ${res.viaBackup
        ? `${esc(res.fellFrom || '主用服务商')} 连不上，已自动切换到<b>备用：${esc(res.provider || '')}</b>`
        : `大模型生成 · ${esc(res.provider || '')}`} · 已按“随意 → 正式”排序，逐条核对后收藏</div>`
    : res.matched && res.matched !== cn
      ? `<div class="banner">本地近似说法：${esc(res.matched)}　<span class="muted">（不是同义句，注意核对意思）</span></div>`
      : `<div class="banner">来自本地语料库　<span class="muted">（离线可用，无需联网）</span></div>`;
  const errHead = res.aiError ? `<div class="banner warn">⚠️ 大模型没能用上：${esc(String(res.aiError).slice(0, 160))}<br>
    <span class="muted">下面是本地匹配的结果，<b>仅供参考，不一定是你要的意思</b>。</span></div>` : '';

  out.innerHTML = errHead + head + `<div class="section-title">共 ${res.variants.length} 种说法 · 勾选要收藏的</div>`;
  const list = el(`<div id="cap-list"></div>`);
  res.variants.forEach((v, i) => {
    const node = el(`<div class="variant" data-i="${i}">
      <div class="row">
        <div class="pick">✓</div>
        <div class="en" style="flex:1"><textarea rows="1" data-en>${esc(v.en)}</textarea></div>
      </div>
      <div class="meta">
        <span class="chip mini tone">${esc(v.tone || '自然')}</span>
        <span class="chip mini scene">${sceneIcon(v.scene)} ${sceneName(v.scene)}</span>
      </div>
      ${v.back ? `<div class="back">回译核对：${esc(v.back)}</div>` : ''}
      ${v.tip ? `<div class="tip">💡 ${esc(v.tip)}</div>` : ''}
      ${v.example ? `<div class="ex muted">${esc(v.example)}</div>` : ''}
      <div class="acts">
        <button class="btn sm ghost" data-speak>🔊 朗读</button>
        <button class="btn sm ghost" data-copy>复制</button>
      </div>
    </div>`);
    const input = node.querySelector('[data-en]');
    const fit = () => { input.style.height = 'auto'; input.style.height = input.scrollHeight + 'px'; };
    input.addEventListener('input', fit);
    setTimeout(fit, 30);
    node.querySelector('.pick').onclick = (e) => { node.classList.toggle('picked'); e.stopPropagation(); };
    node.addEventListener('click', (e) => {
      if (e.target.closest('input,button,.pick')) return;
      node.classList.toggle('picked');
    });
    node.querySelector('[data-speak]').onclick = () => speak(input.value);
    node.querySelector('[data-copy]').onclick = () => copy(input.value);
    list.appendChild(node);
  });
  out.appendChild(list);

  const bar = el(`<div class="btn-row" style="margin:6px 0 20px">
    <button class="btn" id="cap-save" style="flex:1">收藏选中的说法</button>
    <button class="btn ghost sm" id="cap-all">全选</button>
  </div>`);
  bar.querySelector('#cap-save').onclick = async () => {
    const picked = [...list.querySelectorAll('.variant.picked')].map((n) => {
      const i = +n.dataset.i;
      const en = n.querySelector('[data-en]').value.trim();
      return { ...res.variants[i], en };
    });
    if (!picked.length) { toast('先勾选要收藏的说法'); return; }
    const main = picked[0];
    const entry = toEntry(main, cn, 'record', { sourceNote: res.source === 'ai' ? 'AI 生成' : '本地语料库' });
    entry.alts = picked.slice(1).map((p) => ({ en: p.en, tone: p.tone, scene: p.scene, tip: p.tip }));
    await Store.put(entry);
    await load();
    toast(`已收藏 · 共 ${picked.length} 种说法`);
    out.innerHTML = '';
    document.getElementById('cap-input').value = '';
    updateSub();
    out.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between">
      <span class="muted">已存入积累库</span>
      <button class="btn sm soft" id="cap-goto">去看看</button></div></div>`;
    out.querySelector('#cap-goto').onclick = () => setTab('library');
  };
  bar.querySelector('#cap-all').onclick = () => {
    list.querySelectorAll('.variant').forEach((n) => n.classList.add('picked'));
  };
  out.appendChild(bar);
}

/* ============ 页面二：图片识别 ============ */
let ocrFile = null;

function bindOCR() {
  const fileInput = document.getElementById('ocr-file');
  document.getElementById('ocr-take').onclick = () => {
    fileInput.setAttribute('capture', 'environment'); fileInput.click();
  };
  document.getElementById('ocr-pick').onclick = () => {
    fileInput.removeAttribute('capture'); fileInput.click();
  };
  fileInput.onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    ocrFile = f;
    document.getElementById('ocr-preview').innerHTML = `<img alt="预览">`;
    const img = document.querySelector('#ocr-preview img');
    img.src = URL.createObjectURL(f);
    await runOCR(f);
  };
  document.getElementById('ocr-split').onclick = () => {
    const raw = document.getElementById('ocr-raw').value;
    if (!raw.trim()) { toast('先粘贴或识别出文字'); return; }
    renderSents(splitSentences(cleanText(raw)));
  };
  document.getElementById('ocr-clear').onclick = () => {
    document.getElementById('ocr-raw').value = '';
    document.getElementById('ocr-sents').innerHTML = '';
    document.getElementById('ocr-cards').innerHTML = '';
    document.getElementById('ocr-preview').innerHTML = '';
    document.getElementById('ocr-status').textContent = '已清空，可以开始新的识别';
  };
}

async function runOCR(file) {
  const prog = document.getElementById('ocr-prog');
  const bar = prog.querySelector('i');
  const status = document.getElementById('ocr-status');
  prog.style.display = 'block';
  bar.style.width = '4%';
  status.textContent = '准备中…';
  try {
    const small = await downscale(file);
    const text = await recognize(small, (p, s) => { bar.style.width = Math.round(p * 100) + '%'; status.textContent = s; });
    bar.style.width = '100%';
    status.textContent = `识别完成，共 ${text.trim().length} 个字符`;
    const cleaned = cleanText(text);
    document.getElementById('ocr-raw').value = cleaned;
    renderSents(splitSentences(cleaned));
  } catch (e) {
    status.textContent = '识别失败：' + e.message;
    toast(e.message, 3000);
  }
}

function renderSents(sents) {
  state.ocrSents = sents;
  const box = document.getElementById('ocr-sents');
  document.getElementById('ocr-cards').innerHTML = '';
  if (!sents.length) {
    box.innerHTML = `<div class="card"><div class="empty"><span class="big">🔍</span>没有拆出可用的句子。<br>可以在上方文本框手动修改后再点「重新分句」。</div></div>`;
    return;
  }
  box.innerHTML = `<div class="section-title">勾选真正想学的句子（${sents.length} 句）</div>`;
  const list = el('<div></div>');
  sents.forEach((s, i) => {
    const n = el(`<div class="sent" data-i="${i}"><div class="box">✓</div><div class="txt">${esc(s)}</div></div>`);
    n.onclick = () => n.classList.toggle('on');
    list.appendChild(n);
  });
  box.appendChild(list);
  const bar = el(`<div class="btn-row" style="margin:6px 0 18px">
    <button class="btn" id="ocr-build" style="flex:1">为选中的句子生成卡片</button>
  </div>`);
  bar.querySelector('#ocr-build').onclick = async () => {
    const picked = [...list.querySelectorAll('.sent.on')].map((n) => sents[+n.dataset.i]);
    if (!picked.length) { toast('先勾选想学的句子'); return; }
    const btn = bar.querySelector('#ocr-build');
    btn.disabled = true; btn.textContent = '生成中…';
    try {
      const { items, source } = await enrichSentences(picked);
      state.ocrCards = items;
      renderCards(items, source);
    } finally {
      btn.disabled = false; btn.textContent = '为选中的句子生成卡片';
    }
  };
  box.appendChild(bar);
}

function renderCards(items, source) {
  const box = document.getElementById('ocr-cards');
  box.innerHTML = `<div class="section-title">学习卡片 · ${source === 'ai' ? '大模型已补全' : '已自动判断场景（中文意思请补充）'}</div>`;
  const list = el('<div></div>');
  items.forEach((it, i) => {
    const n = el(`<div class="card tight">
      <div class="row"><div class="en" style="flex:1;font-weight:650">${esc(it.en)}</div>
        <button class="btn sm ghost" data-speak>🔊</button></div>
      <label class="field" style="margin-top:10px"><span>中文意思</span>
        <input type="text" data-cn value="${esc(it.cn)}" placeholder="用中文写下这句话的意思"></label>
      <label class="field"><span>自然改写（更口语的说法）</span>
        <input type="text" data-nat value="${esc(it.natural)}" placeholder="可留空"></label>
      <label class="field"><span>场景</span>
        <select data-scene>${SCENES.map((s) => `<option value="${s.id}" ${it.scene === s.id ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('')}</select></label>
      <label class="field"><span>来源（剧名 / 博主 / 场合）</span>
        <input type="text" data-src placeholder="例：《Friends》S01E02、机场指示牌"></label>
      ${it.tip ? `<div class="tip muted">💡 ${esc(it.tip)}</div>` : ''}
    </div>`);
    n.querySelector('[data-speak]').onclick = () => speak(it.en);
    list.appendChild(n);
  });
  box.appendChild(list);
  const bar = el(`<div class="btn-row" style="margin:6px 0 20px">
    <button class="btn" id="ocr-save" style="flex:1">保存到积累库</button>
  </div>`);
  bar.querySelector('#ocr-save').onclick = async () => {
    const nodes = [...list.querySelectorAll('.card')];
    const entries = nodes.map((n, i) => {
      const it = { ...items[i] };
      it.cn = n.querySelector('[data-cn]').value.trim();
      it.natural = n.querySelector('[data-nat]').value.trim();
      it.scene = n.querySelector('[data-scene]').value;
      const src = n.querySelector('[data-src]').value.trim();
      const e = toEntry(it, it.cn, 'ocr', { sourceNote: src || (source === 'ai' ? '图片识别 · AI' : '图片识别') });
      e.alts = [];
      return e;
    }).filter((e) => e.en);
    if (!entries.length) { toast('没有可保存的内容'); return; }
    const empty = entries.filter((e) => !e.cn).length;
    await Store.putMany(entries);
    await load();
    toast(`已保存 ${entries.length} 条${empty ? `（${empty} 条缺中文意思，可稍后补）` : ''}`);
    box.innerHTML = '';
    document.getElementById('ocr-sents').innerHTML = '';
    document.getElementById('ocr-raw').value = '';
    updateSub();
  };
  box.appendChild(bar);
}

/* ============ 页面三：积累库 ============ */
function renderLibrary() {
  const list = filtered();
  const st = stats(state.entries);
  document.getElementById('lib-stats').innerHTML = `
    <div class="stat"><b>${st.total}</b><span>条积累</span></div>
    <div class="stat"><b style="color:var(--rose)">${st.due}</b><span>待复习</span></div>
    <div class="stat"><b style="color:var(--teal)">${st.mastered}</b><span>已掌握</span></div>`;

  const sc = document.getElementById('lib-scenes');
  sc.innerHTML = '';
  const mk = (id, text, on) => {
    const c = el(`<button class="chip ${on ? 'on' : ''}">${text}</button>`);
    c.onclick = () => { state.scene = id; renderLibrary(); };
    return c;
  };
  sc.appendChild(mk('all', '全部', state.scene === 'all'));
  SCENES.forEach((s) => sc.appendChild(mk(s.id, `${s.icon} ${s.name}`, state.scene === s.id)));

  const tagBox = document.getElementById('lib-tags');
  const tags = [...new Set(state.entries.flatMap((e) => e.tags || []))].slice(0, 14);
  tagBox.innerHTML = '';
  if (tags.length) {
    tags.forEach((t) => {
      const c = el(`<button class="chip tag ${state.tag === t ? 'on' : ''}">#${esc(t)}</button>`);
      c.onclick = () => { state.tag = state.tag === t ? '' : t; renderLibrary(); };
      tagBox.appendChild(c);
    });
  }

  const box = document.getElementById('lib-list');
  box.innerHTML = '';
  if (!list.length) {
    box.innerHTML = `<div class="empty"><span class="big">🌱</span>这里还空着。<br>先去「快速记录」存下第一句吧。</div>`;
    return;
  }
  box.appendChild(el(`<div class="section-title">${list.length} 条</div>`));
  list.forEach((e) => box.appendChild(entryNode(e, true)));
}

function entryNode(e, editable) {
  const due = isDue(e);
  const mastered = (e.srs?.box || 0) >= MASTERED_BOX;
  const n = el(`<div class="entry">
    <div class="en">${esc(e.en)}</div>
    <div class="cn">${esc(e.cn || '（未填中文意思）')}</div>
    ${e.natural ? `<div class="natural">↳ ${esc(e.natural)}</div>` : ''}
    ${(e.alts || []).length ? `<div class="natural">其他说法：${e.alts.map((a) => esc(a.en)).join(' ｜ ')}</div>` : ''}
    ${e.example ? `<div class="ex">例：${esc(e.example)}</div>` : ''}
    <div class="meta">
      <span class="chip mini scene">${sceneIcon(e.scene)} ${sceneName(e.scene)}</span>
      <span class="chip mini src">${esc(sourceLabel(e))}</span>
      ${(e.tags || []).map((t) => `<span class="chip mini">#${esc(t)}</span>`).join('')}
      <span class="chip mini ${mastered ? 'ok' : due ? 'due' : ''}">${mastered ? '✓ 已掌握' : dueIn(e)}</span>
    </div>
  </div>`);
  if (editable) n.onclick = () => openEditor(e);
  return n;
}

function sourceLabel(e) {
  if (e.sourceNote) return e.sourceNote;
  return { record: '快速记录', ocr: '图片识别', phrasebook: '常用100句', manual: '手动添加' }[e.source] || '手动添加';
}

/* ============ 编辑 / 新增 ============ */
function openEditor(entry, preset = {}) {
  const e = entry || {
    cn: '', en: '', natural: '', scene: 'other', tags: [], source: 'manual',
    sourceNote: '', example: '', note: ''
  };
  const node = el(`<div>
    <label class="field"><span>英文原句（地道说法）</span><input type="text" data-en value="${esc(preset.en || e.en)}"></label>
    <label class="field"><span>中文意思</span><input type="text" data-cn value="${esc(preset.cn || e.cn)}" placeholder="按意思搜索靠它"></label>
    <label class="field"><span>自然改写（更口语的说法，可留空）</span><input type="text" data-nat value="${esc(e.natural)}"></label>
    <label class="field"><span>例句 / 语境</span><input type="text" data-ex value="${esc(e.example)}"></label>
    <label class="field"><span>使用提醒</span><input type="text" data-note value="${esc(e.note)}"></label>
    <label class="field"><span>场景</span><select data-scene>${SCENES.map((s) => `<option value="${s.id}" ${e.scene === s.id ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('')}</select></label>
    <label class="field"><span>来源</span><input type="text" data-src value="${esc(e.sourceNote)}" placeholder="例：同事会议 / 《Friends》"></label>
    <label class="field"><span>自由标签（逗号分隔）</span><input type="text" data-tags value="${esc((e.tags || []).join('，'))}"></label>
    <div class="btn-row">
      <button class="btn" data-save style="flex:1">保存</button>
      ${entry ? '<button class="btn ghost sm" data-del>删除</button>' : ''}
      <button class="btn ghost sm close-sheet">取消</button>
    </div>
  </div>`);
  const s = sheet(entry ? '编辑表达' : '添加表达', node, () => { });
  node.querySelector('[data-save]').onclick = async () => {
    const v = (k) => node.querySelector(`[data-${k}]`).value;
    const obj = {
      ...e,
      en: v('en').trim(),
      cn: v('cn').trim(),
      natural: v('nat').trim(),
      example: v('ex').trim(),
      note: v('note').trim(),
      scene: v('scene'),
      sourceNote: v('src').trim(),
      tags: v('tags').split(/[,，\s]+/).filter(Boolean),
      srs: e.srs || newSRS(),
      updatedAt: Date.now()
    };
    if (!obj.en) { toast('英文原句不能为空'); return; }
    await Store.put(obj);
    await load();
    s.close();
    renderLibrary();
    updateSub();
    toast('已保存');
  };
  node.querySelector('[data-del]')?.addEventListener('click', async () => {
    const ok = await confirmSheet('删除这条表达？', e.en, '删除');
    if (ok) { await Store.remove(e.id); await load(); s.close(); renderLibrary(); updateSub(); }
  });
}

/* ============ 页面四：练习 ============ */
async function renderDailyCard() {
  const box = document.getElementById('d-stats');
  const note = document.getElementById('d-note');
  const btn = document.getElementById('d-start');
  if (!box) return;
  const prog = await dayProgress();
  const total = phraseItems().length + state.entries.filter((e) => e.en && e.cn).length;
  box.innerHTML = `
    <div class="stat"><b style="color:var(--fjord)">${prog.done}</b><span>今日已过</span></div>
    <div class="stat"><b style="color:#4E7A5C">${prog.right}</b><span>答对</span></div>
    <div class="stat"><b style="color:var(--rose)">${prog.wrong}</b><span>答错</span></div>`;
  const left = Math.max(0, DAILY_SIZE - prog.done);
  note.innerHTML = `每天 ${DAILY_SIZE} 条：常用100句 + 积累库混合，给中文写出/说出英文。<b>答对即过，答错的题本轮还会再出现</b>（之后的几天也更容易被抽到）。题池共 ${total} 条，今天还剩 ${left} 条。`;
  btn.textContent = prog.done ? `继续今日滚动（还剩 ${left} 条）` : '开始今日滚动';
  btn.onclick = startDaily;
}

function renderPractice() {
  renderDailyCard();
  const fb = document.getElementById('p-filters');
  fb.innerHTML = '';
  const mk = (label, on, fn) => {
    const c = el(`<button class="chip ${on ? 'on' : ''}">${label}</button>`);
    c.onclick = () => { fn(); renderPractice(); };
    fb.appendChild(c);
  };
  mk('全部', !state.dueOnly, () => (state.dueOnly = false));
  mk('只看待复习', state.dueOnly, () => (state.dueOnly = !state.dueOnly));
  SCENES.forEach((sc) => mk(sc.icon + ' ' + sc.name, state.scene === sc.id, () => (state.scene = state.scene === sc.id ? 'all' : sc.id)));
  if (state.scene !== 'all') mk('✕ 清除场景', false, () => (state.scene = 'all'));

  const results = searched();
  const list = results.map((r) => r.e);
  document.getElementById('p-count').textContent = state.q.trim()
    ? `匹配到 ${list.length} 条（中文模糊匹配）`
    : `共 ${list.length} 条可练习`;
  document.getElementById('p-start').onclick = () => startPractice(list);
  const box = document.getElementById('p-list');
  box.innerHTML = '';
  if (!list.length) {
    box.innerHTML = `<div class="empty"><span class="big">${state.q ? '🔎' : '🎯'}</span>${state.q ? '没找到，换个说法再搜搜' : '还没有积累，先去记录一两句'}</div>`;
    return;
  }
  box.appendChild(el(`<div class="section-title">${list.length} 条</div>`));
  list.slice(0, 80).forEach((e) => box.appendChild(entryNode(e, true)));
}

let session = null;

function startPractice(list) {
  const queue = buildQueue(list);
  if (!queue.length) { toast('这个范围里没有可练习的内容'); return; }
  session = { queue, i: 0, revealed: false, tally: { know: 0, fuzzy: 0, unknown: 0 } };
  renderSession();
}

/* ============ 每日滚动练习 ============ */
let drill = null;

async function startDaily() {
  const { deck } = await buildDailyDeck(state.entries);
  if (!deck.length) { toast('题池是空的：先去积累几句话，或检查常用100句'); return; }
  drill = { deck, i: 0, right: 0, wrong: 0 };
  renderDrill();
}

/** 这道题可接受的答案：原句 + 更口语改写 + 其他说法 */
function drillTargets(it) {
  const t = [it.en];
  if (it.ref) {
    if (it.ref.natural) t.push(it.ref.natural);
    (it.ref.alts || []).forEach((a) => a.en && t.push(a.en));
  }
  return t;
}

/** 网页语音识别（不支持时给出可操作的替代方案） */
function startVoice(onText, onErr) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    onErr('这台浏览器不支持网页语音识别：可以直接打字，或用键盘上的 🎤 系统语音输入。');
    return null;
  }
  const r = new SR();
  r.lang = 'en-US';
  r.interimResults = true;
  r.continuous = false;
  r.onresult = (e) => {
    let txt = '';
    for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
    onText(txt.trim());
  };
  r.onerror = (e) => {
    if (e.error === 'aborted') return;
    onErr(e.error === 'not-allowed'
      ? '麦克风权限被拒：到系统设置里允许这个网页用麦克风'
      : '语音识别中断：' + e.error);
  };
  try { r.start(); } catch { /* 已在运行 */ }
  return r;
}

function renderDrill() {
  const root = document.getElementById('practice');
  const d = drill;
  if (!d) return;
  if (d.i >= d.deck.length) return finishDrill();
  root.classList.add('on');
  const it = d.deck[d.i];
  const total = d.deck.length;

  root.innerHTML = `
    <div class="bar">
      <div class="muted">${d.i + 1} / ${total} · ✅${d.right} ❌${d.wrong}</div>
      <div class="prog" style="flex:1;margin:0"><i style="width:${(d.i / total) * 100}%"></i></div>
      <button class="btn sm ghost x" id="dl-exit">退出</button>
    </div>
    <div class="stage">
      <div class="chips" style="justify-content:center"><span class="chip mini src">${esc(it.label)}</span></div>
      <div class="big-cn" style="margin-top:14px">${esc(it.cn)}</div>
      <div class="hint">用英文说出或写出这句话，然后对答案</div>
      <div class="ans-area">
        <textarea id="dl-in" rows="2" placeholder="Type or dictate in English…"
          autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn" id="dl-go" style="flex:1">对答案</button>
          <button class="btn soft" id="dl-mic" title="语音输入">🎤</button>
          <button class="btn ghost" id="dl-peek">看答案</button>
        </div>
        <div class="muted" id="dl-voice-note" style="text-align:center;margin-top:6px"></div>
      </div>
      <div id="dl-out"></div>
    </div>`;

  const ta = root.querySelector('#dl-in');
  const out = root.querySelector('#dl-out');
  root.querySelector('#dl-exit').onclick = () => {
    root.classList.remove('on');
    drill = null;
    renderPractice();
  };

  // 判分并渲染结果。mode: 'auto'=按输入判 | 'force'=用户确认自己对 | 'peek'=看答案（记为没答上）
  const judge = (mode) => {
    const val = ta.value.trim();
    if (mode === 'auto' && !val) { toast('先写出或说出你的英文'); return; }
    const targets = drillTargets(it);

    if (mode === 'peek') {
      out.innerHTML = `<div class="dl-res no">
        <div class="verdict">👀 参考答案</div>
        <div class="dl-target"><b>原句</b>：${esc(it.en)}
          <button class="btn sm ghost" id="dl-say" style="padding:2px 10px">🔊</button></div>
        ${it.tip ? `<div class="sub muted">💡 ${esc(it.tip)}</div>` : ''}
        <div class="btn-row" style="margin-top:12px"><button class="btn" id="dl-wrong" style="flex:1">下一条（这道记为没答上）</button></div>
      </div>`;
      root.querySelector('#dl-say').onclick = () => speak(it.en);
      root.querySelector('#dl-wrong').onclick = () => { record(it, false); requeue(it); d.i++; renderDrill(); };
      return;
    }
    if (mode === 'force') { record(it, true); d.i++; renderDrill(); return; }

    const r = checkAnswer(val, targets);
    const showTarget = () => {
      const diff = diffWords(val, r.target || it.en);
      return `<div class="dl-target"><b>参考</b>：${diff
        .map((x) => `<span class="${x.ok ? 'w-ok' : 'w-bad'}">${esc(x.w)}</span>`)
        .join(' ')}</div>`;
    };

    if (r.level === 'ok') {
      out.innerHTML = `<div class="dl-res ok">
        <div class="verdict">✅ ${r.score >= 0.98 ? '完全正确' : '意思对了（措辞略有出入）'}</div>
        <div class="dl-target"><b>原句</b>：${esc(it.en)}
          <button class="btn sm ghost" id="dl-say" style="padding:2px 10px">🔊</button></div>
        ${it.tip ? `<div class="sub muted">💡 ${esc(it.tip)}</div>` : ''}
        <div class="btn-row" style="margin-top:12px"><button class="btn" id="dl-next" style="flex:1">下一条 →</button></div>
      </div>`;
      root.querySelector('#dl-say').onclick = () => speak(it.en);
      speak(it.en);
      record(it, true);
      const go = () => { d.i++; renderDrill(); };
      root.querySelector('#dl-next').onclick = go;
      setTimeout(() => { if (drill === d && root.querySelector('#dl-next')) go(); }, 1800);
    } else {
      const pct = Math.round(r.score * 100);
      out.innerHTML = `<div class="dl-res ${r.level === 'near' ? 'near' : 'no'}">
        <div class="verdict">${r.level === 'near' ? '🟡 很接近了（相似度 ' + pct + '%）' : '❌ 不太对（相似度 ' + pct + '%）'}</div>
        <div class="dl-mine"><b>你的答案</b>：${esc(val)}</div>
        ${showTarget()}
        <div style="text-align:center"><button class="btn sm ghost" id="dl-say">🔊 听一遍</button></div>
        ${it.tip ? `<div class="sub muted">💡 ${esc(it.tip)}</div>` : ''}
        <div class="grade3">
          <button class="retry" id="dl-retry">↻ 再试一次</button>
          <button class="okbtn" id="dl-force">✓ 就这么说的</button>
          <button class="nextbtn" id="dl-wrong">→ 下一条</button>
        </div>
        <div class="muted" style="text-align:center;margin-top:6px">「下一条」会记为没答上，这道题等下还会再出现</div>
      </div>`;
      root.querySelector('#dl-say').onclick = () => speak(r.target || it.en);
      root.querySelector('#dl-retry').onclick = () => {
        out.innerHTML = '';
        ta.focus(); ta.select();
      };
      root.querySelector('#dl-force').onclick = () => judge('force');
      root.querySelector('#dl-wrong').onclick = () => { record(it, false); requeue(it); d.i++; renderDrill(); };
    }
  };

  // 答错的题在本轮里再出现一次（隔 2~4 题后）
  const requeue = (item) => {
    if (d.deck.filter((x) => x === item).length > 2) return;   // 防止无限循环
    const at = d.i + 1 + Math.floor(Math.random() * Math.min(4, d.deck.length - d.i));
    d.deck.splice(Math.min(at, d.deck.length), 0, item);
  };

  // 记录结果：drill 熟练度 + 今日进度 + 积累库 SRS
  const record = async (item, ok) => {
    await markResult(item.key, ok);
    const prog = await dayProgress();
    if (ok) prog.right++; else prog.wrong++;
    if (ok && !prog.keys.includes(item.key)) {
      prog.keys.push(item.key);
      prog.done = prog.keys.length;
    }
    await saveDayProgress(prog);
    if (ok) d.right++; else d.wrong++;
    if (item.ref) {
      grade(item.ref, ok ? 'know' : 'unknown');
      await Store.put(item.ref);
    }
  };

  root.querySelector('#dl-go').onclick = () => judge('auto');
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); judge('auto'); }
  });
  root.querySelector('#dl-peek').onclick = () => {
    ta.value = '';
    judge('peek');   // 看答案 = 记为没答上，同时把参考答案亮出来
  };
  root.querySelector('#dl-mic').onclick = () => {
    const note = root.querySelector('#dl-voice-note');
    note.textContent = '正在听…请说英文';
    const rec = startVoice(
      (txt) => { ta.value = txt; if (txt) note.textContent = '🎤 已识别，点「对答案」'; },
      (msg) => { note.textContent = msg; }
    );
    if (rec) setTimeout(() => { try { rec.stop(); } catch { } }, 8000);
  };
}

async function finishDrill() {
  const root = document.getElementById('practice');
  root.classList.remove('on');
  const d = drill;
  drill = null;
  await load();
  renderPractice();
  updateSub();
  const node = el(`<div>
    <div class="stats" style="margin-bottom:14px">
      <div class="stat"><b style="color:#4E7A5C">${d.right}</b><span>答对</span></div>
      <div class="stat"><b style="color:var(--rose)">${d.wrong}</b><span>没答上</span></div>
      <div class="stat"><b style="color:var(--fjord)">${d.right + d.wrong}</b><span>共答题</span></div>
    </div>
    <p class="muted">没答上的题已经加权重排：明天更容易被抽到；答对的下一次出现会更晚。</p>
    <div class="btn-row"><button class="btn close-sheet" style="flex:1">完成</button></div>
  </div>`);
  sheet('今日滚动完成 🎉', node);
}


function renderSession() {
  const root = document.getElementById('practice');
  root.classList.add('on');
  const e = session.queue[session.i];
  const total = session.queue.length;
  const mastered = (e.srs?.box || 0) >= MASTERED_BOX;

  root.innerHTML = `
    <div class="bar">
      <div class="muted">${session.i + 1} / ${total}</div>
      <div class="prog" style="flex:1;margin:0"><i style="width:${((session.i) / total) * 100}%"></i></div>
      <button class="btn sm ghost x" id="p-exit">退出</button>
    </div>
    <div class="stage">
      <div class="chips" style="justify-content:center">
        <span class="chip mini scene">${sceneIcon(e.scene)} ${sceneName(e.scene)}</span>
        ${(e.tags || []).map((t) => `<span class="chip mini">#${esc(t)}</span>`).join('')}
        <span class="chip mini ${mastered ? 'ok' : 'src'}">${mastered ? '✓ 已掌握' : dueIn(e)}</span>
      </div>
      <div class="big-cn" style="margin-top:16px">${esc(e.cn || '（未填中文意思）')}</div>
      <div class="hint">先开口说出来，再揭晓答案</div>
      <div id="p-reveal"></div>
    </div>
    <div id="p-actions"></div>`;

  const reveal = root.querySelector('#p-reveal');
  const actions = root.querySelector('#p-actions');
  const showAnswer = () => {
    session.revealed = true;
    reveal.innerHTML = `<div class="reveal">
      <div class="en">${esc(e.en)}</div>
      ${e.natural ? `<div class="sub">↳ ${esc(e.natural)}</div>` : ''}
      ${e.example ? `<div class="sub muted">例：${esc(e.example)}</div>` : ''}
      ${e.note ? `<div class="sub muted">💡 ${esc(e.note)}</div>` : ''}
      ${(e.alts || []).length ? `<div class="sub muted">其他说法：${e.alts.map((a) => esc(a.en)).join(' / ')}</div>` : ''}
      <div style="text-align:center;margin-top:12px"><button class="btn sm soft" id="p-say">🔊 再听一遍</button></div>
    </div>`;
    actions.innerHTML = `<div class="grade">
      <button data-g="unknown">不会</button>
      <button data-g="fuzzy">模糊</button>
      <button data-g="know">会了</button>
    </div><div class="muted" style="text-align:center;margin-top:8px">按熟练度安排下次复习时间</div>`;
    root.querySelector('#p-say').onclick = () => speak(e.en);
    actions.querySelectorAll('.grade button').forEach((b) => {
      b.onclick = async () => {
        const r = grade(e, b.dataset.g);
        session.tally[b.dataset.g]++;
        await Store.put(e);
        toast(b.dataset.g === 'know' ? `很好 · ${r.next}再见` : `${r.next}再练一次`);
        next();
      };
    });
    speak(e.en);
  };

  actions.innerHTML = `<button class="btn wide" id="p-show">揭晓英文</button>`;
  actions.querySelector('#p-show').onclick = showAnswer;
  root.querySelector('#p-exit').onclick = () => { root.classList.remove('on'); session = null; renderPractice(); };
}

async function next() {
  session.i++;
  if (session.i >= session.queue.length) {
    const t = session.tally;
    document.getElementById('practice').classList.remove('on');
    await load();
    renderPractice();
    updateSub();
    const node = el(`<div>
      <div class="stats" style="margin-bottom:14px">
        <div class="stat"><b style="color:#047857">${t.know}</b><span>会了</span></div>
        <div class="stat"><b style="color:var(--amber)">${t.fuzzy}</b><span>模糊</span></div>
        <div class="stat"><b style="color:var(--rose)">${t.unknown}</b><span>不会</span></div>
      </div>
      <p class="muted">「模糊」和「不会」的条目已重新排入近期复习。</p>
      <div class="btn-row"><button class="btn close-sheet" style="flex:1">完成</button></div>
    </div>`);
    session = null;
    sheet('这一轮完成', node);
    return;
  }
  renderSession();
}

/* ============ 设置 ============ */
async function openSettings() {
  const cfg = await llmConfig();
  const bak = await backupConfig();
  const st = stats(state.entries);
  const node = el(`<div>
    <div class="banner">离线也能用：内置 ${corpus().length} 组地道说法，无需联网。<br>接入大模型后，可生成任意中文的地道表达，并补全 OCR 句子的中文意思。<br><b>建议主用 + 备用各配一家</b>：主用连不上时会自动切换，不用你手动改。</div>
    <div class="section-title" style="margin-top:0">主用服务商（优先走它）</div>
    <label class="field"><span>服务商</span>
      <select data-preset>${PRESETS.map((p) => `<option value="${p.id}" ${cfg.preset === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select></label>
    <label class="field"><span>接口地址（OpenAI 兼容）</span><input type="text" data-url value="${esc(cfg.url)}" placeholder="https://…/v1">
      <span class="muted" style="margin-top:5px">只填到域名即可，会自动补 /v1</span></label>
    <label class="field"><span>API Key</span><input type="password" data-key value="${esc(cfg.key)}" placeholder="AIza… 或 sk-…"></label>
    <label class="field"><span>模型</span><input type="text" data-model value="${esc(cfg.model)}" placeholder="gemini-2.5-flash"></label>
    <label class="row" style="margin-bottom:4px">
      <input type="checkbox" data-on ${cfg.enabled ? 'checked' : ''} style="width:auto">
      <span>启用 AI 增强</span>
    </label>
    <hr class="sep">
    <div class="section-title" style="margin-top:0">备用服务商（主用失败时自动切换）</div>
    <div class="muted" style="font-size:12px;margin-bottom:8px">主用超时、Key 失效、网络不通（比如在大陆连不上 Google）时，会立刻换这条通道重发一次。</div>
    <label class="field"><span>备用服务商</span>
      <select data-bpreset>${PRESETS.map((p) => `<option value="${p.id}" ${bak.preset === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select></label>
    <label class="field"><span>接口地址</span><input type="text" data-burl value="${esc(bak.url)}" placeholder="https://…/v1"></label>
    <label class="field"><span>备用 API Key</span><input type="password" data-bkey value="${esc(bak.key)}" placeholder="sk-…"></label>
    <label class="field"><span>模型</span><input type="text" data-bmodel value="${esc(bak.model)}" placeholder="THUDM/GLM-4-9B-0414"></label>
    <label class="row" style="margin-bottom:12px">
      <input type="checkbox" data-bon ${bak.enabled === false ? '' : 'checked'} style="width:auto">
      <span>启用备用通道</span>
    </label>
    <div class="btn-row"><button class="btn soft sm" id="s-test">测试两条通道</button>
      <button class="btn ghost sm" id="s-models">列出主用可用模型</button></div>
    <div class="muted" id="s-test-out" style="margin-top:8px;font-size:13px;line-height:1.6;white-space:pre-line">会分别真实请求主用和备用，各报各的结果。</div>
    <div class="banner ok" style="margin-top:10px">🆓 <b>有三个免费档可以不花钱用</b>（有每日/每分钟次数限制，个人日常翻译完全够）。详见下方说明。</div>
    <div class="muted" style="font-size:12px;line-height:1.7;margin-top:10px">
      <b>推荐组合：主用 Gemini（质量最好）+ 备用 硅基流动（国内直连）</b> —— 出了大陆网自动切备用，两边都不耽误。<br>
      <b>① Google Gemini（推荐·最省事，有 Gmail 就行）</b>：打开 aistudio.google.com → 用 Google 账号登录 → 左侧「Get API key」→ Create API key → 复制 AIza 开头的串。不用信用卡、不用充值。选「Google Gemini（免费）」预设即可。<span style="color:var(--rose)">注意：Google 的服务在中国大陆直连不通，需要在非大陆网络下使用。</span><br>
      <b>② 硅基流动 SiliconFlow（免费·主打大陆直连）</b>：cloud.siliconflow.cn 手机号注册 + 个人实名（姓名+身份证号，不传证件照）→ 左侧「账户管理 → API 密钥」→ 新建 API 密钥 → 复制。模型填 <b>THUDM/GLM-4-9B-0414</b>（实测约 3 秒出结果，余额 0 也能调，长期免费；同账号下 Qwen/Qwen3-8B 也可用，但默认开推理、要 20 秒左右）。<br>
      <b>③ OpenRouter 免费模型池</b>：openrouter.ai 注册 → Keys → Create Key；模型填 openrouter/free（自动挑当前可用的免费模型）。<b>免费额度约每天 50 次</b>，超了要等次日。<br>
      <b>④ 付费但很便宜</b>：DeepSeek platform.deepseek.com（模型 deepseek-v4-flash，充 10 元用很久）、Kimi platform.moonshot.cn / platform.kimi.ai（模型 kimi-k3）。<br>
      不确定自己能用哪些模型？点上面「<b>列出可用模型</b>」直接查。<br>
      Key <b>只显示一次</b>，请立即复制；它等同账号密码，别发给别人。
    <hr class="sep">
    <div class="section-title" style="margin-top:0">数据</div>
    <div class="btn-row">
      <button class="btn ghost sm" id="s-export">导出 JSON</button>
      <button class="btn ghost sm" id="s-import">导入 JSON</button>
      <button class="btn ghost sm" id="s-seed">塞入示例表达</button>
      <button class="btn ghost sm" id="s-clear" style="color:var(--rose)">清空全部</button>
    </div>
    <div class="muted" style="margin-top:10px">共 ${st.total} 条。数据只存在这台设备的浏览器里。</div>
    <hr class="sep">
    <div class="section-title" style="margin-top:0">关于</div>
    <div class="muted" id="s-ver" style="font-size:13px;line-height:1.6">正在读取版本…</div>
    <div class="btn-row" style="margin-top:14px"><button class="btn close-sheet" style="flex:1">完成</button></div>
  </div>`);

  const s = sheet('设置', node);
  const verNode = node.querySelector('#s-ver');
  appVersion().then((v) => {
    verNode.innerHTML = `程序版本：<b>${esc(v)}</b> · 线上最新：<b>pe-v16</b><br>
    若两者不一致，说明手机还在跑旧缓存：完全退出应用后重新打开一次即可更新（数据不会丢）。`;
  });
  const presetSel = node.querySelector('[data-preset]');
  const urlIn = node.querySelector('[data-url]');
  const modelIn = node.querySelector('[data-model]');
  const bPresetSel = node.querySelector('[data-bpreset]');
  const bUrlIn = node.querySelector('[data-burl]');
  const bModelIn = node.querySelector('[data-bmodel]');
  presetSel.onchange = () => {
    const p = PRESETS.find((x) => x.id === presetSel.value);
    if (p && p.url) { urlIn.value = p.url; modelIn.value = p.model; }
  };
  bPresetSel.onchange = () => {
    const p = PRESETS.find((x) => x.id === bPresetSel.value);
    if (p && p.url) { bUrlIn.value = p.url; bModelIn.value = p.model; }
  };
  const collect = () => ({
    preset: presetSel.value,
    url: normalizeBaseUrl(urlIn.value),
    key: node.querySelector('[data-key]').value.trim(),
    model: modelIn.value.trim() || (PRESETS.find((p) => p.id === presetSel.value)?.model || 'gemini-2.5-flash'),
    enabled: node.querySelector('[data-on]').checked
  });
  const collectBackup = () => ({
    preset: bPresetSel.value,
    url: normalizeBaseUrl(bUrlIn.value),
    key: node.querySelector('[data-bkey]').value.trim(),
    model: bModelIn.value.trim() || (PRESETS.find((p) => p.id === bPresetSel.value)?.model || 'THUDM/GLM-4-9B-0414'),
    enabled: node.querySelector('[data-bon]').checked
  });
  node.querySelector('#s-test').onclick = async () => {
    const out = node.querySelector('#s-test-out');
    out.style.color = '';
    out.textContent = '正在分别测试主用与备用…（每家最多 30 秒）';
    const c = collect(), b = collectBackup();
    await saveLLMConfig({ ...c, enabled: true });
    await saveBackupConfig(b);
    urlIn.value = c.url; bUrlIn.value = b.url;   // 回显纠正后的地址
    const rs = await testBothLLM();
    out.innerHTML = rs
      .map((r) => `${r.ok ? '✅' : '❌'} <b>${esc(r.which)}·${esc(r.label)}</b>：${esc(r.msg)}`)
      .join('\n');
    out.style.color = rs.some((r) => r.ok) ? 'var(--fjord)' : 'var(--rose)';
  };
  node.querySelector('#s-models').onclick = async () => {
    const out = node.querySelector('#s-test-out');
    out.style.color = '';
    out.textContent = '正在向服务商查询…';
    const cfg2 = { ...collect(), enabled: true };
    await saveLLMConfig(cfg2);
    urlIn.value = cfg2.url;
    const list = await listModels(cfg2.url, cfg2.key);
    out.textContent = list.length
      ? '你这个 Key 在 ' + normalizeBaseUrl(cfg2.url) + ' 下可用：\n' + list.join('\n')
      : '没查到：接口地址或 Key 不对，换一个服务商或直接手填模型名试试。';
  };
  node.querySelector('#s-export').onclick = async () => {
    const data = JSON.stringify(await Store.all(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `talklog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast('已导出');
  };
  node.querySelector('#s-import').onclick = async () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try {
        const list = JSON.parse(await f.text());
        if (!Array.isArray(list)) throw new Error('格式不是数组');
        await Store.putMany(list.map((x) => ({ ...x, id: x.id || uid(), srs: x.srs || newSRS() })));
        await load(); renderLibrary(); updateSub();
        toast(`已导入 ${list.length} 条`);
      } catch (e) { toast('导入失败：' + e.message); }
    };
    inp.click();
  };
  node.querySelector('#s-seed').onclick = async () => {
    const picks = corpus().slice(0, 12);
    const list = picks.map((c) => toEntry({ ...c.variants[0], scene: c.variants[0].scene }, c.cn, 'manual', { sourceNote: '示例' }));
    await Store.putMany(list);
    await load(); renderLibrary(); updateSub();
    toast(`已加入 ${list.length} 条示例`);
  };
  node.querySelector('#s-clear').onclick = async () => {
    const ok = await confirmSheet('清空全部表达？', '此操作不可撤销，建议先导出备份。', '清空');
    if (ok) { await Store.clear(); await load(); renderLibrary(); updateSub(); s.close(); toast('已清空'); }
  };
  node.querySelector('.close-sheet').onclick = async () => {
    await saveLLMConfig(collect());
    await saveBackupConfig(collectBackup());
    s.close();
    renderBanner();
  };
}

async function appVersion() {
  try {
    const keys = await caches.keys();
    return keys.find((k) => k.startsWith('pe-')) || '未缓存';
  } catch { return '未知'; }
}

async function renderBanner() {
  const box = document.getElementById('llm-banner');
  const st = await engineStatus();
  const ver = await appVersion();
  let html;
  if (st.ai && st.primaryDown && st.hasBackup) {
    html = `<div class="banner warn">🔁 主用「${esc(st.primaryLabel)}」刚才连不上，已自动切换到<b>备用：${esc(st.backupLabel)}</b>　<span class="muted">${esc(ver)}</span></div>`;
  } else if (st.ai && st.hasBackup) {
    html = `<div class="banner ok">✨ AI 已开启：主用 <b>${esc(st.primaryLabel)}</b> · 备用 <b>${esc(st.backupLabel)}</b>（主用失败自动切换）　<span class="muted">${esc(ver)}</span></div>`;
  } else if (st.ai) {
    html = `<div class="banner ok">✨ AI 增强已开启：<b>${esc(st.model)}</b> · 任意中文都能翻译。<a href="#" id="to-settings" style="color:var(--fjord);font-weight:700">建议再配个备用 →</a>　<span class="muted">${esc(ver)}</span></div>`;
  } else if (st.hasBackup) {
    html = `<div class="banner ok">✨ AI 已开启（走<b>备用：${esc(st.backupLabel)}</b>）· 主用未配置，建议在设置里补上　<span class="muted">${esc(ver)}</span></div>`;
  } else if (st.incomplete) {
    html = `<div class="banner warn">⚠️ AI 配置不完整（${esc(st.missing.join('、'))}没填），所以翻译不出来。<a href="#" id="to-settings" style="color:var(--fjord);font-weight:700">去设置补全 →</a>　<span class="muted">${esc(ver)}</span></div>`;
  } else {
    html = `<div class="banner">📴 离线语料库模式 · 内置 ${corpus().length} 组说法，贴不上就不硬凑。<a href="#" id="to-settings" style="color:var(--fjord);font-weight:700">接入大模型 →</a>　<span class="muted">${esc(ver)}</span></div>`;
  }
  box.innerHTML = html;
  box.querySelector('#to-settings')?.addEventListener('click', (e) => { e.preventDefault(); openSettings(); });
}

function updateSub() {
  const st = stats(state.entries);
  document.getElementById('appbar-sub').textContent = `${st.total} 条积累 · ${st.due} 条待复习`;
}

/* ============ 启动 ============ */
async function boot() {
  document.querySelectorAll('.tabbar button').forEach((b) => {
    b.onclick = () => setTab(b.dataset.tab);
  });
  document.getElementById('btn-settings').onclick = openSettings;
  document.getElementById('cap-go').onclick = onGenerate;
  document.getElementById('lib-add').onclick = () => openEditor(null);
  const q = document.getElementById('p-q');
  let timer = null;
  q.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.q = q.value; renderPractice(); }, 180);
  });

  renderCaptureScenes();
  bindOCR();
  renderPhrases();
  const pbq = document.getElementById('pb-q');
  let pbTimer = null;
  pbq.addEventListener('input', () => {
    clearTimeout(pbTimer);
    pbTimer = setTimeout(() => { state.pbQ = pbq.value; renderPhrases(); }, 160);
  });

  await load();
  updateSub();
  renderBanner();

  const fromHash = () => {
    const h = (location.hash || '').replace('#', '');
    if (['phrases', 'capture', 'ocr', 'library', 'practice'].includes(h)) setTab(h);
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  window.addEventListener('appinstalled', () => toast('已添加到桌面'));
}

boot();

/* 生成引擎：离线语料库优先，可选接大模型增强 */
import { Store, uid } from './store.js';
import { buildIndex, score, tokenize } from './search.js';

/* ---------------- 语料库 ---------------- */
let CORPUS = null;

export function corpus() {
  if (CORPUS) return CORPUS;
  const raw = [
    ...(window.CORPUS_WORK || []),
    ...(window.CORPUS_SOCIAL || []),
    ...(window.CORPUS_LIFE || [])
  ];
  CORPUS = raw.map(([cn, keys, variants]) => {
    const item = {
      cn,
      keys: keys || [],
      variants: variants.map(([en, tone, scene, tip]) => ({ en, tone, scene, tip }))
    };
    item._idx = buildIndex({ cn, en: item.variants.map((v) => v.en).join(' '), tags: keys, natural: '' });
    item._keyStr = (keys || []).join('|');
    return item;
  });
  return CORPUS;
}

/** 在语料库 + 常用100句里找最贴切的说法。宁缺毋滥：贴不上就返回空 */
const STOP_CN = /(请问|麻烦您?|您好|你好|一下|我想|我要|怎么样|怎么走|怎么说|怎么|哪里|哪儿|是不是|有没有|这个|那个|好吗|可以吗|呢|吗|啊|吧|哦|嘛|呀)/g;
const contentCn = (s) => String(s || '').replace(/\s+/g, '').replace(STOP_CN, '');
const gramsOf = (s) => {
  const out = [];
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
  return out;
};

let PB = null;
export function phrasebook() {
  if (PB) return PB;
  PB = [];
  (window.PHRASEBOOK || []).forEach((cat) => {
    (cat.items || []).forEach(([cn, en, keys, note]) => {
      const item = {
        cn, keys: keys || [], _cat: cat.name,
        variants: [{ en, tone: '常用', scene: cat.scene, tip: note || '' }]
      };
      item._idx = buildIndex({ cn, en, tags: keys, natural: note || '' });
      item._keyStr = (keys || []).join('|');
      PB.push(item);
    });
  });
  return PB;
}

export function matchCorpus(query, topN = 2) {
  const q = String(query || '').trim();
  if (!q) return [];
  const flat = q.replace(/\s+/g, '');
  const qc = contentCn(q);
  const qg = gramsOf(qc);

  const pool = [...corpus(), ...phrasebook()];
  const scored = pool
    .map((item) => {
      let s = 0;
      const ic = contentCn(item.cn);
      if (qc && ic) {
        if (qc === ic) s += 14;
        else if (ic.includes(qc) || qc.includes(ic)) s += 9;
        else {
          let ov = 0;
          for (const g of qg) if (ic.includes(g)) ov++;
          s += ov * 3;
        }
      }
      // 关键词命中是强信号
      for (const k of item.keys || []) if (flat.includes(k)) s += 6;
      if (s <= 0) return null;
      // 长度差异过大说明不是同一件事
      const diff = Math.abs(item.cn.length - q.length);
      if (diff > 14) s -= Math.min(8, (diff - 14) * 0.5);
      return s >= 6 ? { item, s } : null;   // 阈值：贴不上就不硬凑
    })
    .filter(Boolean)
    .sort((a, b) => b.s - a.s)
    .slice(0, topN);
  return scored;
}

const SCENE_HINT = {
  work: ['会议', '客户', '项目', '汇报', '领导', '同事', '邮件', '方案', '进度', '加班', '需求', '报价', 'deadline'],
  travel: ['机场', '酒店', '航班', '行李', '登机', '退税', '菜单', '打车', '地铁', '护照', '旅行', '迷路'],
  media: ['电影', '美剧', '字幕', '台词', 'vlog', '视频', '剧', '博主'],
  social: ['朋友', '聚会', '聊天', '邀约', '寒暄', '请客', '认识'],
  daily: ['起床', '吃饭', '睡觉', '手机', '累', '感冒', '家里', '咖啡']
};

export function guessScene(text, fallback = 'other') {
  const t = String(text || '');
  let best = fallback, bestN = 0;
  for (const [scene, words] of Object.entries(SCENE_HINT)) {
    let n = 0;
    for (const w of words) if (t.includes(w)) n++;
    if (n > bestN) { bestN = n; best = scene; }
  }
  return best;
}

/* ---------------- 大模型（可选） ---------------- */
const LLM_KEY = 'llm-config';

/* 厂商模型换代很快，下面是 2026-10 校验过仍在售的名称。
   注意：moonshot-v1-8k 已于 2026-08-31 下线、deepseek-chat 于 2026-07-24 退役，填了必报 404。 */
export const PRESETS = [
  // —— 免费档（无需信用卡，有速率限制，个人日常够用）——
  { id: 'gemini', free: true, name: '🆓 Google Gemini（免费·推荐）', url: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' },
  { id: 'siliconflow', free: true, name: '🆓 硅基流动 SiliconFlow（免费·国内直连）', url: 'https://api.siliconflow.cn/v1', model: 'THUDM/glm-4-9b-chat' },
  { id: 'openrouter', free: true, name: '🆓 OpenRouter 免费模型池', url: 'https://openrouter.ai/api/v1', model: 'openrouter/free' },
  // —— 付费档（便宜，量大稳定）——
  { id: 'deepseek', name: '💰 DeepSeek（付费·最便宜）', url: 'https://api.deepseek.com', model: 'deepseek-v4-flash' },
  { id: 'moonshot', name: '💰 Moonshot / Kimi（国内站）', url: 'https://api.moonshot.cn', model: 'kimi-k3' },
  { id: 'moonshot-intl', name: '💰 Moonshot / Kimi（国际站）', url: 'https://api.moonshot.ai', model: 'kimi-k3' },
  { id: 'openai', name: '💰 OpenAI', url: 'https://api.openai.com', model: 'gpt-5-mini' },
  { id: 'custom', name: '自定义（OpenAI 兼容）', url: '', model: '' }
];

export async function llmConfig() {
  const c = (await Store.getKV(LLM_KEY, null)) || { enabled: false, url: '', key: '', model: '', preset: 'openai' };
  return c;
}
export async function saveLLMConfig(cfg) { await Store.setKV(LLM_KEY, cfg); }
export async function llmReady() {
  const c = await llmConfig();
  return !!(c.enabled && c.url && c.key);
}

/** 纠正常见的接口地址填写错误：api.deepseek.com → api.deepseek.com/v1 */
export function normalizeBaseUrl(raw) {
  let u = String(raw || '').trim().replace(/\/+$/, '');
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  if (/\/v\d+[a-z-]*$/i.test(u)) return u;         // 已带版本号（/v1、/v1beta…）
  if (/\/openai$/i.test(u)) return u;              // Gemini 兼容端点 …/v1beta/openai
  if (/\/chat\/completions$/i.test(u)) return u.replace(/\/chat\/completions$/i, '');
  return u + '/v1';                                 // 其余一律补 /v1
}

async function chat(messages, { json = true, temperature = 0.3 } = {}) {
  const c = await llmConfig();
  if (!(c.enabled && c.url && c.key)) throw new Error('未配置大模型');
  const makeBody = (useJson) => {
    const body = { model: c.model, messages, temperature, stream: false };
    if (useJson && json) body.response_format = { type: 'json_object' };
    return JSON.stringify(body);
  };
  const base = normalizeBaseUrl(c.url);
  const send = (useJson) => fetch(base + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + c.key },
    body: makeBody(useJson),
    signal: AbortSignal.timeout ? AbortSignal.timeout(45000) : undefined
  });
  let res;
  try {
    res = await send(true);
  } catch (e) {
    // fetch 直接失败 = 网络不通 / 被浏览器拦截，多半是跨域或地址写错
    throw new Error('连不上 ' + base + '（可能是地址写错，或该服务商不允许网页直连，需走代理）');
  }
  // 部分服务商/模型不支持 JSON 模式，降级重试
  if (res.status === 400 || res.status === 422) res = await send(false);
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    let msg = '接口返回 ' + res.status;
    if (res.status === 401) msg = 'API Key 不对或已失效（401）';
    else if (res.status === 404) msg = '接口地址不对（404），应为 ' + base + '/chat/completions';
    else if (res.status === 429) msg = '请求太频繁或额度用完（429）';
    if (t) msg += ' · ' + t.slice(0, 120);
    throw new Error(msg);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  if (!json) return text;
  const clean = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const m = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!m) throw new Error('模型返回不是合法 JSON');
    return JSON.parse(m[0]);
  }
}

const SYS_COACH = `You are a native-level English coach for an advanced Chinese learner.
Your job: turn a Chinese intention into English that native speakers ACTUALLY say.
HARD RULES:
- The English MUST mean exactly what the Chinese means. Do NOT add information that is not there, do NOT drop any information, do NOT answer a different question, do NOT translate a nearby-sounding phrase.
- Re-read the Chinese, then re-read your own English, and fix it if the two do not match.
- Prioritise natural, spoken, current English over textbook translation.
- Never be wordy. Prefer idioms, phrasal verbs and collocations when natural.
- Always answer in the requested JSON shape, no extra prose.`;

/** 生成 2~3 种地道说法。优先大模型；本地匹配只在"真的很贴切"时才用 */
export async function generateVariants(cn, sceneHint = '') {
  const hits = matchCorpus(cn, 2);
  const local = hits.length ? hits[0] : null;

  if (await llmReady()) {
    try {
      const data = await chat([
        { role: 'system', content: SYS_COACH },
        {
          role: 'user',
          content: `Chinese input (this is the ONLY source of meaning):
"""${cn}"""${sceneHint ? `\nScenario hint: ${sceneHint}` : ''}

Return JSON: {"variants":[{"en":string,"tone":string,"scene":string,"tip":string,"example":string,"back":string}]}
- 2 or 3 variants, ordered from most casual to most formal.
- "en": spoken, natural, current English.
- "back": the English translated BACK into Chinese literally, so the learner can verify it still means the input. Keep it under 30 Chinese chars.
- "scene" must be one of: work, social, travel, daily, media, other.
- "tone" in Chinese, 2-4 chars (e.g. 随意, 礼貌, 正式, 委婉, 地道, 直接).
- "tip" in Chinese, ONE sentence, max 40 chars, about register/vocabulary/pragmatics — the thing a textbook never tells you.
- "example": a short natural dialogue line showing usage (English).`
        }
      ], { json: true });
      const list = (data.variants || []).filter((v) => v && v.en);
      if (list.length) {
        return { variants: list.slice(0, 3), source: 'ai', matched: null };
      }
      // 模型返回了但没内容 —— 也不给本地结果冒充翻译，由用户决定
      return { variants: [], source: 'none', aiError: '大模型返回内容为空，请检查模型名是否正确', localHit: local };
    } catch (e) {
      // AI 失败绝不拿本地句子冒充翻译结果；把失败原因和可选项一起交回给界面
      return { variants: [], source: 'none', aiError: e.message, localHit: local };
    }
  }

  if (local) return { ...fromLocal(local), source: 'local' };
  return { variants: [], source: 'none' };
}

/** 把本地命中转成展示结构（供界面在用户明确要求时查看本地近似说法） */
export function localVariants(hit) {
  return hit ? { ...fromLocal(hit), source: 'local' } : null;
}

/** 当前引擎状态（供界面显示模式徽章）；incomplete = 已想用 AI 但配置缺项 */
export async function engineStatus() {
  const c = await llmConfig();
  const ready = !!(c.enabled && c.url && c.key);
  const missing = [];
  if (c.enabled) {
    if (!String(c.url || '').trim()) missing.push('接口地址');
    if (!String(c.key || '').trim()) missing.push('API Key');
  }
  return {
    ai: ready,
    incomplete: !ready && missing.length > 0,
    missing,
    model: ready ? (c.model || '未填模型名') : '',
    preset: c.preset || 'openai',
    url: ready ? normalizeBaseUrl(c.url) : ''
  };
}

/** 列出该 Key 在当前地址下可用的模型名（失败返回空数组） */
export async function listModels(baseRaw, key) {
  const base = normalizeBaseUrl(baseRaw);
  try {
    const res = await fetch(base + '/models', {
      headers: { Authorization: 'Bearer ' + key },
      signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined
    });
    if (!res.ok) return [];
    const d = await res.json();
    return (d.data || []).map((m) => m.id).filter(Boolean);
  } catch { return []; }
}

/** 设置页「测试连接」：先逐项检查配置，再发一次最小的真实请求，把失败原因说清楚 */
export async function testLLM() {
  const c = await llmConfig();
  if (!c.enabled) return { ok: false, msg: '「启用 AI 增强」没有勾选——勾上并填好 API Key 才能翻译。' };
  if (!String(c.url || '').trim()) return { ok: false, msg: '接口地址为空：请先选服务商（自动带出地址），或手动填写。' };
  if (!String(c.key || '').trim()) return { ok: false, msg: 'API Key 是空的——这是最常见的原因。请到服务商后台生成 sk-… 密钥，完整粘贴到这里再测试。' };
  if (!String(c.model || '').trim()) return { ok: false, msg: '模型名为空：请填写如 deepseek-chat、moonshot-v1-8k。' };

  const base = normalizeBaseUrl(c.url);
  try {
    const res = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + c.key },
      body: JSON.stringify({ model: c.model, messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 5, stream: false }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined
    });
    if (!res.ok) {
      const t = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 140);
      let msg = '接口返回 HTTP ' + res.status;
      if (res.status === 401) msg += '：API Key 不对或已失效';
      else if (res.status === 404) msg += '：地址不对，或模型名已下线（旧名如 moonshot-v1-8k、deepseek-chat 都已被厂商停掉）';
      else if (res.status === 429) msg += '：请求太频繁，或额度/余额不足';
      else if (res.status >= 500) msg += '：服务商服务端出错，稍后再试';
      if (t) msg += ' · ' + t;
      // 顺手查一下这个 Key 实际能用的模型，省得猜
      const avail = await listModels(base, c.key);
      if (avail.length) msg += '\n你这个 Key 可用的模型（挑一个填到上面）：' + avail.slice(0, 8).join('、');
      return { ok: false, msg };
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text) return { ok: false, msg: '能连上但模型没返回内容，多半是模型名写错（当前：' + c.model + '）' };
    return { ok: true, msg: '✅ 连接成功：' + c.model + ' 已可用（回复：' + text.slice(0, 20).trim() + '）' };
  } catch (e) {
    return { ok: false, msg: '连不上 ' + base + ' —— 网络不通、地址写错，或该服务商不允许网页直连。' };
  }
}

function fromLocal(hit) {
  return {
    variants: hit.item.variants.slice(0, 3).map((v) => ({ ...v, example: v.example || '' })),
    matched: hit.item.cn
  };
}

/** OCR 文本清洗：规则版（始终执行） */
export function cleanText(raw) {
  let t = String(raw || '');
  // 字幕时间轴
  t = t.replace(/^\s*\d{1,3}\s*$/gm, '\n');
  t = t.replace(/\d{1,2}:\d{2}:\d{2}[.,]\d{1,3}\s*-->\s*\d{1,2}:\d{2}:\d{2}[.,]\d{1,3}/g, '\n');
  t = t.replace(/\[\d{1,2}:\d{2}:\d{2}\]/g, '');
  // 全大写说话人（如 JOHN:）
  t = t.replace(/^\s*[A-Z][A-Z .'-]{1,18}:\s*/gm, '');
  // 行首编号
  t = t.replace(/^\s*\d+[\.、)]\s*/gm, '');
  // 合并被断行的句子
  t = t.replace(/([a-zA-Z,;'"-])\n+([a-z'(])/g, '$1 $2');
  t = t.replace(/([a-zA-Z])\s*-\s*\n\s*/g, '$1 ');
  // 连字符断词
  t = t.replace(/(\w)-\s+(\w)/g, '$1$2');
  // 多余空白
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
  return t;
}

/** 按句切分 */
export function splitSentences(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return [];
  const parts = t.split(/(?<=[.!?…])\s+(?=["'(A-Z0-9])|(?<=[.!?])["')\]]?\s+(?=[A-Z])/);
  return parts
    .map((s) => s.trim().replace(/^[-–—"'\s]+/, '').replace(/["'\s]+$/, ''))
    .filter((s) => {
      const letters = (s.match(/[A-Za-z]/g) || []).length;
      return letters >= 8 && (s.match(/[A-Za-z]/g) || []).length / s.length > 0.5;
    });
}

/** 用大模型清洗 + 补全（可选） */
export async function enrichSentences(sentences) {
  const out = sentences.map((s) => ({
    en: s,
    cn: '',
    natural: '',
    scene: guessScene(s),
    tip: '',
    example: ''
  }));
  if (!(await llmReady())) return { items: out, source: 'local' };
  try {
    const data = await chat([
      { role: 'system', content: SYS_COACH },
      {
        role: 'user',
        content: `These lines were OCR'd from a screenshot / subtitle / video. Clean each one and explain it to a Chinese learner.

Lines:
${sentences.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Return JSON: {"items":[{"en":string,"cn":string,"natural":string,"scene":string,"tip":string,"example":string}]}
- "en": the cleaned original line (fix OCR errors, remove subtitle artefacts, keep it authentic).
- "cn": natural Chinese meaning (NOT literal translation).
- "natural": a more everyday spoken rephrase of the same idea (if the original is already natural, give a close variant).
- "scene": one of work, social, travel, daily, media, other.
- "tip": Chinese, max 40 chars, the pragmatic point (register, when NOT to say it).
- "example": a short example sentence showing it in context.
Keep the same order and count.`
      }
    ], { json: true });
    const items = data.items || [];
    if (items.length) {
      return {
        items: out.map((o, i) => ({ ...o, ...(items[i] || {}), en: (items[i] && items[i].en) || o.en })),
        source: 'ai'
      };
    }
  } catch { /* 降级到本地 */ }
  return { items: out, source: 'local' };
}

/** 把变体转成可保存的条目 */
export function toEntry(v, cn, source, extra = {}) {
  const now = Date.now();
  return {
    id: uid(),
    cn: cn || v.cn || '',
    en: (v.en || '').trim(),
    alts: [],
    natural: v.natural || '',
    scene: v.scene || guessScene(cn + ' ' + (v.en || '')),
    tags: extra.tags || [],
    source: source || 'record',
    sourceNote: extra.sourceNote || '',
    example: v.example || '',
    note: v.tip || '',
    createdAt: now,
    updatedAt: now,
    srs: { box: 0, due: now, seen: 0, know: 0, fuzzy: 0, unknown: 0, last: null }
  };
}

export { tokenize };

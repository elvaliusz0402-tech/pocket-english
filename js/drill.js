/* 每日滚动练习
 * 题源：常用100句 + 积累库，混在一起
 * 形式：给中文 → 打字或语音说出英文 → 自动判分
 * 规则：答对即过；答错的题在本轮里再出现（权重翻倍），之后几天也更容易被抽到
 */
import { Store } from './store.js';
import { phrasebook } from './engine.js';
import { isDue } from './practice.js';

const STATE_KEY = 'drill-state';  // 每条题的熟练度 { w, ok, wrong, box, due, last }
const DAY_KEY = 'drill-day';      // 今日进度 { day, done, right, wrong, keys }

const STEP = [10 * 60e3, 60 * 60e3, 8 * 3600e3, 24 * 3600e3, 3 * 24 * 3600e3, 7 * 24 * 3600e3, 21 * 24 * 3600e3];
export const DAILY_SIZE = 20;

export function dayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}

export async function drillState() { return (await Store.getKV(STATE_KEY, null)) || {}; }
export async function saveDrillState(s) { await Store.setKV(STATE_KEY, s); }

export async function dayProgress() {
  const p = (await Store.getKV(DAY_KEY, null)) || {};
  if (p.day !== dayKey()) return { day: dayKey(), done: 0, right: 0, wrong: 0, keys: [] };
  return p;
}
export async function saveDayProgress(p) { await Store.setKV(DAY_KEY, p); }

/** 把两边的题源拉平成统一的题卡 */
export function phraseItems() {
  return phrasebook().map((p) => ({
    key: 'pb:' + (p._cat || '') + ':' + (p.cn || ''),
    cn: p.cn, en: p.variants[0].en,
    tip: p.variants[0].tip || '', scene: p.variants[0].scene || 'other',
    label: '常用100句 · ' + (p._cat || ''), kind: 'phrase'
  }));
}

export function libItems(entries) {
  return entries
    .filter((e) => e.en && e.cn)
    .map((e) => ({
      key: 'lib:' + e.id, cn: e.cn, en: e.en,
      tip: e.note || '', scene: e.scene || 'other',
      label: '积累库' + (e.tags?.length ? ' · #' + e.tags[0] : ''),
      kind: 'lib', ref: e
    }));
}

/** 抽今日题：常用句按"最久没考"轮换 + 权重；积累库按到期优先。答对过的今天不再出 */
export async function buildDailyDeck(entries, { size = DAILY_SIZE, phraseRatio = 0.5 } = {}) {
  const st = await drillState();
  const prog = await dayProgress();
  const done = new Set(prog.keys || []);
  const now = Date.now();

  const weight = (it) => {
    const s = st[it.key];
    if (!s) return 2;                       // 没考过的新题优先
    let w = s.w || 1;
    if (s.due && s.due <= now) w *= 1.6;    // 到期的加权
    return Math.min(w, 12);
  };

  const pick = (pool, n) => {
    const cand = pool.filter((it) => !done.has(it.key));
    // 加权随机不放回：Efraimidis–Spirakis
    const keyed = cand.map((it) => ({ it, k: Math.pow(Math.random() + 1e-9, 1 / weight(it)) }));
    keyed.sort((a, b) => b.k - a.k);
    return keyed.slice(0, n).map((x) => x.it);
  };

  const phrases = phraseItems();
  const libs = libItems(entries).sort((a, b) => {
    const da = isDue(a.ref) ? 0 : 1, db = isDue(b.ref) ? 0 : 1;
    return da - db || (a.ref.srs?.box || 0) - (b.ref.srs?.box || 0);
  });

  const nPhrase = libs.length
    ? Math.min(phrases.length, Math.round(size * phraseRatio))
    : Math.min(phrases.length, size);
  const nLib = Math.min(libs.length, size - nPhrase);

  // 常用句按"最久没考"先排一层，避免每天都考同一批
  const phrasePool = phrases
    .slice()
    .sort((a, b) => ((st[a.key]?.last) || 0) - ((st[b.key]?.last) || 0))
    .slice(0, Math.max(nPhrase * 3, 30));

  const deck = [...pick(phrasePool, nPhrase), ...pick(libs, nLib)];
  // 洗牌
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return { deck, progress: prog, totalPool: phrases.length + libs.length };
}

/** 记一条结果：答对降权并推后，答错翻倍并立刻回到最近复习 */
export async function markResult(key, ok) {
  const st = await drillState();
  const s = st[key] || { w: 1, ok: 0, wrong: 0, box: 0, due: 0, last: 0 };
  if (ok) {
    s.ok = (s.ok || 0) + 1;
    s.w = Math.max(0.4, (s.w || 1) * 0.5);
    s.box = Math.min(STEP.length - 1, (s.box || 0) + 1);
  } else {
    s.wrong = (s.wrong || 0) + 1;
    s.w = Math.min(12, (s.w || 1) * 2);
    s.box = 0;
  }
  s.last = Date.now();
  s.due = Date.now() + (ok ? STEP[s.box] : 10 * 60e3);
  st[key] = s;
  await saveDrillState(st);
  return s;
}

/* ---------------- 判分 ---------------- */
const norm = (s) => String(s || '').toLowerCase()
  .replace(/[’`]/g, "'")
  .replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

/* 缩写展开 + 数字归一，让 "I'd like" ≈ "I would like"、"at 7" ≈ "at seven" */
const EXPAND = {
  "i'd": 'i would', "i'm": 'i am', "i'll": 'i will', "i've": 'i have',
  "don't": 'do not', "can't": 'can not', "won't": 'will not', "didn't": 'did not',
  "doesn't": 'does not', "isn't": 'is not', "aren't": 'are not',
  "couldn't": 'could not', "wouldn't": 'would not', "shouldn't": 'should not',
  "haven't": 'have not', "hasn't": 'has not', "it's": 'it is', "that's": 'that is',
  "let's": 'let us', "there's": 'there is', "what's": 'what is'
};
const NUMWORD = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve' };

const words = (s) => norm(s).split(' ').filter(Boolean).flatMap((w) => {
  const ex = EXPAND[w];
  const base = ex ? ex.split(' ') : [w];
  return base.map((x) => (NUMWORD[x] !== undefined && x.length === 1 ? NUMWORD[x] : x));
});

/** 词级 Dice 相似度（对语序和增减词宽容） */
function dice(a, b) {
  if (!a.length || !b.length) return 0;
  const ca = {}; a.forEach((w) => (ca[w] = (ca[w] || 0) + 1));
  let hit = 0;
  b.forEach((w) => { if (ca[w]) { hit++; ca[w]--; } });
  return (2 * hit) / (a.length + b.length);
}

/** 字符级编辑距离相似度（抓拼写小错） */
function levSim(a, b) {
  const m = a.length, n = b.length;
  if (!m || !n) return 0;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return 1 - prev[n] / Math.max(m, n);
}

/**
 * 判分。targets 是可接受的答案数组（原句 + 改写 + alts）。
 * 返回 { score, target, level: 'ok'|'near'|'no' }
 */
export function checkAnswer(input, targets) {
  const u = norm(input);
  let best = 0, bestT = '';
  for (const t of targets) {
    const tn = norm(t);
    if (!tn) continue;
    let sc = u === tn ? 1 : Math.max(dice(words(u), words(tn)), levSim(u, tn));
    if (sc > best) { best = sc; bestT = t; }
  }
  return { score: best, target: bestT, level: best >= 0.8 ? 'ok' : best >= 0.55 ? 'near' : 'no' };
}

/** 单词级高亮：哪些词答对了（绿）哪些漏了/错了（红），用于对答案页 */
export function diffWords(user, target) {
  const uw = norm(user).split(' ');
  const tw = target.split(/\s+/).map((w) => w.toLowerCase().replace(/[^a-z0-9']+/g, ''));
  const pool = uw.slice();
  return tw.map((w) => {
    const i = pool.indexOf(w);
    if (i >= 0) { pool.splice(i, 1); return { w, ok: true }; }
    return { w, ok: false };
  });
}

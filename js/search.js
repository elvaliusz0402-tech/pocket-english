/* 中文模糊搜索：二元组 + 子串 + 关键词加权，不要求精确匹配 */

const CJK = /[\u4e00-\u9fff\u3400-\u4dbf]/;

export function isCJK(ch) { return CJK.test(ch); }

/** 把一段文本切成可检索的碎片：中文按二元组，英文按单词 */
export function tokenize(text) {
  const s = String(text || '').toLowerCase();
  const grams = [];
  let buf = '';
  for (const ch of s) {
    if (isCJK(ch)) { buf += ch; continue; }
    if (buf) { grams.push(...cjkGrams(buf)); buf = ''; }
    if (/[a-z0-9']/.test(ch)) {
      // 英文/数字由下方统一按正则处理
    }
  }
  if (buf) grams.push(...cjkGrams(buf));
  const words = s.match(/[a-z][a-z']{1,}/g) || [];
  return { grams, words };
}

function cjkGrams(run) {
  if (run.length === 1) return [run];
  const out = [];
  for (let i = 0; i < run.length - 1; i++) out.push(run.slice(i, i + 2));
  return out;
}

/** 预先为条目建立检索索引，避免每次重复计算 */
export function buildIndex(entry) {
  const cn = entry.cn || '';
  const en = entry.en || '';
  const extra = [entry.natural, entry.example, (entry.tags || []).join(' '), entry.sourceNote, entry.note]
    .filter(Boolean).join(' ');
  const t1 = tokenize(cn + ' ' + (entry.tags || []).join(' '));
  const t2 = tokenize(extra);
  return {
    cn: cn,
    cnGrams: new Set(t1.grams),
    allGrams: new Set([...t1.grams, ...t2.grams]),
    words: new Set([...t1.words, ...(tokenize(en).words), ...t2.words]),
    en: (en + ' ' + extra).toLowerCase(),
    hayCn: (cn + ' ' + (entry.tags || []).join(' ') + ' ' + (entry.natural || '')).toLowerCase()
  };
}

/**
 * 打分：分值越高越相关。
 * - 中文：二元组重叠（模糊）+ 直接子串（强信号）
 * - 英文：单词命中 + 子串命中
 */
export function score(idx, query) {
  const q = String(query || '').trim();
  if (!q) return 0;
  const qt = tokenize(q);
  let s = 0;

  if (qt.grams.length) {
    for (const g of qt.grams) {
      if (idx.cnGrams.has(g)) s += 3;
      else if (idx.allGrams.has(g)) s += 1;
    }
    // 连续子串 = 明确的意图命中
    const ql = q.replace(/\s+/g, '');
    if (ql.length === 1) {
      // 单个汉字：二元组索引覆盖不到，直接按子串判定（如「帮」「贵」）
      if (idx.cn.includes(ql)) s += 8;
      else if (idx.hayCn.includes(ql)) s += 5;
      else if (idx.en.includes(ql)) s += 3;
    } else if (ql.length >= 2 && idx.cn.includes(ql)) s += 12;
    else {
      // 部分子串：把查询切成 3-4 字的片段试匹配
      for (let n = Math.min(4, ql.length); n >= 3; n--) {
        for (let i = 0; i + n <= ql.length; i++) {
          if (idx.hayCn.includes(ql.slice(i, i + n))) { s += 4; break; }
        }
      }
    }
  }

  if (qt.words.length) {
    const uniq = [...new Set(qt.words)];
    for (const w of uniq) {
      if (idx.words.has(w)) s += 4;
      else if (idx.en.includes(w)) s += 2;
    }
    if (idx.en.includes(q.toLowerCase().trim())) s += 8;
  }

  return s;
}

/** 在条目数组中做模糊检索，返回按分数排序的结果（含 _score） */
export function searchEntries(entries, query, limit) {
  const q = String(query || '').trim();
  if (!q) return entries.map((e) => ({ e, s: 0 }));
  const scored = entries
    .map((e) => ({ e, s: score(e._idx || buildIndex(e), q) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || (b.e.updatedAt || 0) - (a.e.updatedAt || 0));
  return limit ? scored.slice(0, limit) : scored;
}

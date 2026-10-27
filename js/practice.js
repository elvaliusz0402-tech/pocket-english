/* 复习调度： Leitner 盒子 + 会了 / 模糊 / 不会 */
const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;

const INTERVALS = [10 * MIN, 1 * HOUR, 8 * HOUR, 1 * DAY, 3 * DAY, 7 * DAY, 21 * DAY];
const LABELS = ['10 分钟后', '1 小时后', '8 小时后', '1 天后', '3 天后', '1 周后', '3 周后'];

export const MASTERED_BOX = 3; // box >= 3 视为已掌握

export function isDue(e) {
  return !e.srs || !e.srs.due || e.srs.due <= Date.now();
}

export function dueIn(e) {
  const d = (e.srs?.due || 0) - Date.now();
  if (d <= 0) return '待复习';
  if (d < HOUR) return Math.round(d / MIN) + ' 分钟后';
  if (d < DAY) return Math.round(d / HOUR) + ' 小时后';
  return Math.round(d / DAY) + ' 天后';
}

export function grade(e, g) {
  const s = e.srs || { box: 0, due: Date.now(), seen: 0, know: 0, fuzzy: 0, unknown: 0 };
  s.seen = (s.seen || 0) + 1;
  s.last = Date.now();
  if (g === 'know') {
    s.know = (s.know || 0) + 1;
    s.box = Math.min(INTERVALS.length - 1, (s.box || 0) + 1);
    s.due = Date.now() + INTERVALS[s.box];
  } else if (g === 'fuzzy') {
    s.fuzzy = (s.fuzzy || 0) + 1;
    s.box = Math.min(2, s.box || 0);
    s.due = Date.now() + INTERVALS[s.box];
  } else {
    s.unknown = (s.unknown || 0) + 1;
    s.box = 0;
    s.due = Date.now() + INTERVALS[0];
  }
  e.srs = s;
  return { box: s.box, next: LABELS[s.box] };
}

/** 待复习优先，其次按熟练度从低到高 */
export function buildQueue(entries, { onlyDue = false } = {}) {
  const now = Date.now();
  const due = entries.filter((e) => isDue(e)).sort((a, b) => (a.srs?.due || 0) - (b.srs?.due || 0));
  const shuffled = due.slice().sort(() => Math.random() - 0.5);
  if (onlyDue) return shuffled;
  const rest = entries
    .filter((e) => !isDue(e))
    .sort((a, b) => (a.srs?.box || 0) - (b.srs?.box || 0) || (b.updatedAt || 0) - (a.updatedAt || 0));
  return [...shuffled, ...rest];
}

export function stats(entries) {
  let due = 0, mastered = 0;
  for (const e of entries) {
    if (isDue(e)) due++;
    if ((e.srs?.box || 0) >= MASTERED_BOX) mastered++;
  }
  return { total: entries.length, due, mastered };
}

/* 云同步：积累库云端镜像（Supabase Postgres）
 * 设计原则：
 *  - 本地 IndexedDB 永远是主数据，云端只是备份 + 跨设备通道，断网不影响任何功能。
 *  - 每行按策略：本地 updatedAt 与云端 updated_at 谁新听谁的（last-write-wins）。
 *  - 隔离：每台设备有一个「同步码」（随机 40 位），数据库行级安全（RLS）只放行
 *    携带同一同步码的请求——别人拿到公开 Key 也看不到你的句子。
 *  - 换设备：在旧设备「复制同步码」→ 新设备「导入同步码」，两台设备共享云端。
 *  - 删除：上次同步时云端已存在的行，若本地没有了 → 视为已删除，同步时云端也删。
 */
import { Store } from './store.js';

const SB_URL = 'https://hizrmgxyomctqiesubmo.supabase.co';
const SB_KEY = 'sb_publishable_HbIzpNYveQ5m7Ad-zMD4ug_7ytmWOnr';
const SECRET_KEY = 'easytalk-sync-code';
const ON_KEY = 'easytalk-cloud-on';
const SYNC_AT_KEY = 'cloud-sync-at';
const POLL_MS = 30 * 1000;

const status = { syncing: false, lastSyncAt: 0, lastError: '', lastOkAt: 0 };
let onChange = null; /* 同步拉回了新数据后刷新界面用 */
let pollTimer = null;

function enabled() {
  try { return localStorage.getItem(ON_KEY) !== '0'; } catch { return true; }
}
function setEnabled(v) {
  try { localStorage.setItem(ON_KEY, v ? '1' : '0'); } catch { /* ignore */ }
}

/* ---- 同步码 ---- */
function getSecret() {
  try {
    let s = localStorage.getItem(SECRET_KEY);
    if (s && /^[A-Za-z0-9]{20,}$/.test(s)) return s;
    s = genSecret();
    localStorage.setItem(SECRET_KEY, s);
    return s;
  } catch { return 'fallback-device-secret'; }
}
function genSecret() {
  const a = new Uint8Array(20);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function importSecret(code) {
  const c = String(code || '').trim();
  if (!/^[A-Za-z0-9]{20,64}$/.test(c)) return false;
  try { localStorage.setItem(SECRET_KEY, c); } catch { return false; }
  return true;
}

/* ---- REST ---- */
function headers() {
  return {
    apikey: SB_KEY,
    'Content-Type': 'application/json',
    'x-device-secret': getSecret()
  };
}
async function pull() {
  const res = await fetch(`${SB_URL}/rest/v1/phrases?select=id,en,cn,data,updated_at&order=updated_at.asc`, { headers: headers() });
  if (!res.ok) throw await err(res);
  return res.json();
}
async function pushRows(entries) {
  const secret = getSecret();
  const rows = entries.map((e) => ({
    id: e.id,
    secret,
    en: e.en || '',
    cn: e.cn || '',
    data: e,
    updated_at: new Date(e.updatedAt || Date.now()).toISOString()
  }));
  const res = await fetch(`${SB_URL}/rest/v1/phrases?on_conflict=id`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify(rows)
  });
  if (!res.ok) throw await err(res);
}
async function deleteRows(ids) {
  const list = ids.map((id) => `"${encodeURIComponent(id)}"`).join(',');
  const res = await fetch(`${SB_URL}/rest/v1/phrases?id=in.(${list})`, { method: 'DELETE', headers: headers() });
  if (!res.ok) throw await err(res);
}
async function err(res) {
  let msg = `HTTP ${res.status}`;
  try { const j = await res.json(); if (j.message) msg = j.message; } catch { /* ignore */ }
  if (res.status === 404 || /Could not find the table/.test(msg)) msg = '云端数据表还没建好';
  return new Error(msg);
}

/* ---- 行 ⇄ 条目 ---- */
function hydrate(row) {
  const d = row.data || {};
  const e = { ...d, id: row.id };
  e.en = row.en || d.en || '';
  e.cn = row.cn || d.cn || '';
  e.updatedAt = Date.parse(row.updated_at) || d.updatedAt || Date.now();
  if (!e.srs || typeof e.srs !== 'object') e.srs = { box: 0, due: Date.now(), seen: 0, know: 0, fuzzy: 0, unknown: 0, last: null };
  if (!Array.isArray(e.alts)) e.alts = [];
  if (!Array.isArray(e.tags)) e.tags = [];
  return e;
}

/* ---- 主流程 ---- */
async function syncNow(silent = true) {
  if (!enabled()) return { skipped: 'disabled' };
  if (!navigator.onLine) { status.lastError = '当前离线，等联网后自动同步'; return { skipped: 'offline' }; }
  if (status.syncing) return { skipped: 'busy' };
  status.syncing = true;
  try {
    const local = await Store.all();
    const lastSync = (await Store.getKV(SYNC_AT_KEY, 0)) || 0;
    const rows = await pull();
    const cloudById = new Map(rows.map((r) => [r.id, r]));
    const localById = new Map(local.map((e) => [e.id, e]));
    const toPull = [], toPush = [], cloudDelete = [];

    for (const [id, r] of cloudById) {
      const le = localById.get(id);
      const cu = Date.parse(r.updated_at) || 0;
      if (!le) {
        if (cu > lastSync) toPull.push(r);        /* 其他设备新增 */
        else cloudDelete.push(id);                /* 本地删过但云端还在 */
      } else if ((le.updatedAt || 0) > cu + 500) {
        toPush.push(le);                          /* 本地改得更晚 */
      } else if (cu > (le.updatedAt || 0) + 500) {
        toPull.push(r);                           /* 云端改得更晚 */
      }
      /* 时间相同（±500ms）→ 不动 */
    }
    for (const e of local) {
      if (!cloudById.has(e.id) && !toPush.some((x) => x.id === e.id)) toPush.push(e);
    }

    let pulled = 0, pushed = 0, deleted = 0;
    if (toPull.length) { await Store.putMany(toPull.map(hydrate)); pulled = toPull.length; }
    if (toPush.length) { await pushRows(toPush); pushed = toPush.length; }
    if (cloudDelete.length) { await deleteRows(cloudDelete); deleted = cloudDelete.length; }
    status.lastSyncAt = status.lastOkAt = Date.now();
    status.lastError = '';
    await Store.setKV(SYNC_AT_KEY, status.lastOkAt);
    if (pulled && onChange) { try { await onChange(); } catch { /* ignore */ } }
    return { pulled, pushed, deleted };
  } catch (e) {
    status.lastError = e.message || String(e);
    if (!silent) throw e;
    return { error: status.lastError };
  } finally {
    status.syncing = false;
  }
}

function statusText() {
  if (!enabled()) return '已关闭（只存在本机）';
  if (!navigator.onLine) return '离线中，联网后自动同步';
  if (status.lastError) return `上次同步失败：${status.lastError}`;
  if (!status.lastOkAt) return '还没同步过，马上会试一次';
  const n = new Date(status.lastOkAt);
  const hm = `${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`;
  const day = n.toDateString() === new Date().toDateString() ? `今天 ${hm}` : `${n.getMonth() + 1}/${n.getDate()} ${hm}`;
  return `最近同步：${day}`;
}

export const Sync = {
  status,
  syncNow,
  getSecret,
  importSecret,
  enabled,
  setEnabled,
  statusText,
  init(callbacks = {}) {
    onChange = callbacks.onChange || null;
    if (pollTimer) clearInterval(pollTimer);
    setTimeout(() => syncNow().catch(() => {}), 2500); /* 启动后稍等缓存稳定 */
    pollTimer = setInterval(() => syncNow().catch(() => {}), POLL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncNow().catch(() => {});
    });
    window.addEventListener('online', () => syncNow().catch(() => {}));
  }
};

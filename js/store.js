/* 本地存储（IndexedDB）：表达条目 + 设置 */
const DB_NAME = 'pocket-english';
const DB_VER = 1;
const STORE = 'entries';
const KV = 'kv';

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' });
        os.createIndex('scene', 'scene');
        os.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains(KV)) db.createObjectStore(KV);
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode) {
  return openDB().then((db) => db.transaction(store, mode).objectStore(store));
}

function wrap(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const Store = {
  async all() {
    const os = await tx(STORE, 'readonly');
    const list = await wrap(os.getAll());
    return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  },
  async get(id) {
    const os = await tx(STORE, 'readonly');
    return wrap(os.get(id));
  },
  async put(entry) {
    const os = await tx(STORE, 'readwrite');
    await wrap(os.put(cleanEntry(entry)));
    return entry;
  },
  async putMany(list) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, 'readwrite');
      const os = t.objectStore(STORE);
      list.forEach((e) => os.put(cleanEntry(e)));
      t.oncomplete = () => resolve(list.length);
      t.onerror = () => reject(t.error);
    });
  },
  async remove(id) {
    const os = await tx(STORE, 'readwrite');
    return wrap(os.delete(id));
  },
  async clear() {
    const os = await tx(STORE, 'readwrite');
    return wrap(os.clear());
  },
  async getKV(key, fallback = null) {
    const os = await tx(KV, 'readonly');
    const v = await wrap(os.get(key));
    return v === undefined ? fallback : v;
  },
  async setKV(key, value) {
    const os = await tx(KV, 'readwrite');
    return wrap(os.put(value, key));
  }
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** 去掉内存里的检索索引等非数据字段再落盘 */
function cleanEntry(e) {
  const { _idx, _keyStr, ...rest } = e;
  return rest;
}

export const SCENES = [
  { id: 'work', name: '工作', icon: '💼' },
  { id: 'social', name: '社交', icon: '💬' },
  { id: 'travel', name: '旅行', icon: '✈️' },
  { id: 'daily', name: '日常', icon: '☕️' },
  { id: 'media', name: '影视', icon: '🎬' },
  { id: 'other', name: '其他', icon: '🧩' }
];

export const sceneName = (id) => (SCENES.find((s) => s.id === id) || { name: '其他' }).name;
export const sceneIcon = (id) => (SCENES.find((s) => s.id === id) || { icon: '🧩' }).icon;

/* 新建条目时的默认复习状态 */
export function newSRS() {
  return { box: 0, due: Date.now(), seen: 0, know: 0, fuzzy: 0, unknown: 0, last: null };
}

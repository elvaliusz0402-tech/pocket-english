// easy talk · 内置免费翻译通道（pe-v23）
// 作用：把 OpenAI 兼容的 chat/completions 请求原样转发给硅基流动，
//       上游 API Key 只存在本函数的环境变量里，前端永远拿不到。
// 防护：校验 apikey（发布密钥，本就公开）→ 每 IP 限流 → 载荷上限。
const UPSTREAM = 'https://api.siliconflow.cn/v1/chat/completions';
const UPSTREAM_MODELS = 'https://api.siliconflow.cn/v1/models';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info, prefer',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

/* 内存限流：每 IP 每分钟 30 次（实例级近似，够个人产品用） */
const WINDOW_MS = 60_000;
const MAX_PER_MIN = 30;
const hits = new Map<string, { n: number; reset: number }>();

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

function limited(req: Request): Response | null {
  const pub = Deno.env.get('PUBLISHABLE_KEY') || '';
  const key = req.headers.get('apikey') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!pub || key !== pub) return json({ error: { message: 'forbidden' } }, 403);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.reset) {
    if (hits.size > 8000) hits.clear();
    hits.set(ip, { n: 1, reset: now + WINDOW_MS });
  } else if (++h.n > MAX_PER_MIN) {
    return json({ error: { message: '公共通道请求太频繁，请一分钟后再试，或在设置里配置自己的 Key' } }, 429);
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const denied = limited(req);
  if (denied) return denied;

  const path = new URL(req.url).pathname;

  /* GET …/models：透出可用模型列表（设置页「列出可用模型」用） */
  if (req.method === 'GET' && path.endsWith('/models')) {
    const up = await fetch(UPSTREAM_MODELS, {
      headers: { Authorization: `Bearer ${Deno.env.get('SILICONFLOW_KEY')}` },
    });
    return new Response(await up.text(), { status: up.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  if (req.method !== 'POST') return json({ error: { message: 'method not allowed' } }, 405);

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: { message: 'bad json' } }, 400); }
  const b = body as { messages?: unknown };
  if (!b || !Array.isArray(b.messages) || b.messages.length === 0) {
    return json({ error: { message: 'messages required' } }, 400);
  }
  const payload = JSON.stringify(body);
  if (payload.length > 120_000) return json({ error: { message: '内容过长' } }, 413);

  const up = await fetch(UPSTREAM, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('SILICONFLOW_KEY')}` },
    body: payload,
  });
  return new Response(await up.text(), { status: up.status, headers: { ...cors, 'Content-Type': 'application/json' } });
});

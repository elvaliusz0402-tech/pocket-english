-- easy talk 积累库云同步 · 建表脚本（pe-v22）
-- 用法：Supabase 控制台 → SQL Editor → New query → 整段粘贴 → Run
-- 幂等：可重复执行，不会重复建表/建策略。

create table if not exists public.phrases (
  id         text primary key,              -- 客户端生成的条目 id（uid）
  secret     text not null,                 -- 设备同步码（RLS 隔离依据）
  en         text not null default '',      -- 英文（镜像列，便于控制台查看）
  cn         text not null default '',      -- 中文（镜像列）
  data       jsonb not null default '{}',   -- 完整条目（alts/srs/tags/source…）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.phrases enable row level security;

drop policy if exists "phrases_select_own"  on public.phrases;
drop policy if exists "phrases_insert_own"  on public.phrases;
drop policy if exists "phrases_update_own"  on public.phrases;
drop policy if exists "phrases_delete_own"  on public.phrases;

-- 只放行携带同一 x-device-secret 头的请求：不同用户的同步码不同，互不可见
create policy "phrases_select_own" on public.phrases
  for select to anon
  using (secret = current_setting('request.headers', true)::json ->> 'x-device-secret');

create policy "phrases_insert_own" on public.phrases
  for insert to anon
  with check (secret = current_setting('request.headers', true)::json ->> 'x-device-secret');

create policy "phrases_update_own" on public.phrases
  for update to anon
  using      (secret = current_setting('request.headers', true)::json ->> 'x-device-secret')
  with check (secret = current_setting('request.headers', true)::json ->> 'x-device-secret');

create policy "phrases_delete_own" on public.phrases
  for delete to anon
  using (secret = current_setting('request.headers', true)::json ->> 'x-device-secret');

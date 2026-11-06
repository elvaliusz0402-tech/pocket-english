#!/usr/bin/env python3
"""批量生成朗读音频（预部署到 ./audio/），任何设备点「朗读」都能直接播放。

用法：
  python tools/gen_audio.py            # 只补缺的
  python tools/gen_audio.py --force    # 全部重生成

文件名 = ./audio/s<hash32>.mp3，hash 算法与 js/ui.js 的 hash32() 完全一致（djb2 变体，32 位无符号）。
"""
import asyncio
import json
import os
import sys

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'audio-source.json')
OUT_DIR = os.path.join(ROOT, 'audio')
VOICE = 'en-US-AvaMultilingualNeural'
RATE = '-8%'          # 学习用途，稍慢一点
CONCURRENCY = 4


def hash32(text: str) -> str:
    h = 5381
    for ch in text:
        h = (h * 33 + ord(ch)) & 0xFFFFFFFF
    return format(h, '08x')


async def one(item, sem, force):
    text = item['en'].strip()
    if not text:
        return None
    name = 's' + hash32(text) + '.mp3'
    path = os.path.join(OUT_DIR, name)
    if os.path.exists(path) and os.path.getsize(path) > 1200 and not force:
        return name, True
    async with sem:
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(text, VOICE, rate=RATE)
                await comm.save(path)
                if os.path.getsize(path) > 1200:
                    return name, False
            except Exception as e:      # noqa: BLE001
                if attempt == 2:
                    print('  ! 失败', text[:40], type(e).__name__, e, flush=True)
                    return None
                await asyncio.sleep(1.5 * (attempt + 1))
    return None


async def main():
    force = '--force' in sys.argv
    os.makedirs(OUT_DIR, exist_ok=True)
    items = json.load(open(SRC, encoding='utf-8'))
    sem = asyncio.Semaphore(CONCURRENCY)
    todo = len(items)
    print(f'共 {todo} 句，语音 {VOICE}，语速 {RATE}', flush=True)
    done = 0
    made = 0
    failed = []
    tasks = [one(it, sem, force) for it in items]
    for coro in asyncio.as_completed(tasks):
        r = await coro
        done += 1
        if r is None:
            failed.append(done)
        elif not r[1]:
            made += 1
        if done % 10 == 0 or done == todo:
            print(f'  {done}/{todo}  新生成 {made}  失败 {len(failed)}', flush=True)
    total = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR) if f.endswith('.mp3'))
    print(f'完成：新生成 {made} 个，失败 {len(failed)}，目录 {len(os.listdir(OUT_DIR))} 个文件，共 {total/1024/1024:.1f} MB')

    # 写索引：前端朗读前先查索引，命中才走音频，未命中的句子直接用系统语音（避免 404 探测）
    hashes = sorted(
        f[1:-4] for f in os.listdir(OUT_DIR)
        if f.startswith('s') and f.endswith('.mp3') and os.path.getsize(os.path.join(OUT_DIR, f)) > 1200
    )
    idx_path = os.path.join(OUT_DIR, 'index.json')
    with open(idx_path, 'w', encoding='utf-8') as fh:
        json.dump({'v': 1, 'count': len(hashes), 'hashes': hashes}, fh, separators=(',', ':'))
    print(f'索引已写入 {idx_path}（{len(hashes)} 条）')


if __name__ == '__main__':
    asyncio.run(main())

#!/usr/bin/env python3
"""生成 PWA 图标（含 iOS apple-touch-icon）。"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "icons")

BG_TOP = (75, 122, 140)    # 北欧峡湾蓝
BG_BOTTOM = (143, 183, 166)  # 北欧苔绿


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def font_for(size):
    candidates = [
        "/System/Library/Fonts/SFNSRounded.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def build(size, radius_ratio=0.22, pad_ratio=0.0):
    s = size
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 渐变背景
    grad = Image.new("RGB", (s, s))
    gd = ImageDraw.Draw(grad)
    for y in range(s):
        gd.line([(0, y), (s, y)], fill=lerp(BG_TOP, BG_BOTTOM, y / max(s - 1, 1)))
    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, s - 1, s - 1], radius=int(s * radius_ratio), fill=255
    )
    img.paste(grad, (0, 0), mask)

    d = ImageDraw.Draw(img)
    cx, cy = s / 2, s / 2

    # 对话气泡
    bw, bh = s * 0.62, s * 0.46
    bx0, by0 = cx - bw / 2, cy - bh / 2 - s * 0.04
    bx1, by1 = cx + bw / 2, cy + bh / 2 - s * 0.04
    tail = s * 0.075
    d.rounded_rectangle([bx0, by0, bx1, by1], radius=int(s * 0.10), fill=(255, 255, 255, 245))
    d.polygon(
        [(bx0 + s * 0.13, by1 - 1), (bx0 + s * 0.13, by1 + tail), (bx0 + s * 0.02, by1 - 1)],
        fill=(255, 255, 255, 245),
    )

    # 气泡内文字
    fs = int(s * 0.235)
    f = font_for(fs)
    text = "EN"
    bbox = d.textbbox((0, 0), text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw / 2 - bbox[0], (by0 + by1) / 2 - th / 2 - bbox[1]), text, font=f, fill=(38, 38, 60))

    # 底部三条横线（表示"记录"）
    lw = s * 0.34
    x0, x1 = cx - lw / 2, cx + lw / 2
    gap = s * 0.055
    y_start = by1 + s * 0.115
    for i in range(3):
        yy = y_start + i * gap
        w = lw * (1.0 if i != 2 else 0.6)
        d.rounded_rectangle([x0, yy, x0 + w, yy + s * 0.022], radius=int(s * 0.011),
                            fill=(255, 255, 255, 235))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    targets = {
        "icon-192.png": 192,
        "icon-512.png": 512,
        "icon-maskable-512.png": 512,
        "apple-touch-icon.png": 180,
    }
    for name, size in targets.items():
        img = build(size)
        img.save(os.path.join(OUT, name))
        print("wrote", name, img.size)
    # favicon
    build(64).save(os.path.join(OUT, "favicon-64.png"))
    print("wrote favicon-64.png")


if __name__ == "__main__":
    main()

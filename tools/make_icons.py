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


INK = (42, 63, 73)          # 深墨色（气泡里的"记录行"）
BUBBLE = (255, 255, 255, 246)


def build(size, rounded=True, bubble_scale=1.0):
    """talklog 图标：渐变底 + 对话气泡 + 气泡内三条记录行（talk + log）。"""
    s = size
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 渐变背景
    grad = Image.new("RGB", (s, s))
    gd = ImageDraw.Draw(grad)
    for y in range(s):
        gd.line([(0, y), (s, y)], fill=lerp(BG_TOP, BG_BOTTOM, y / max(s - 1, 1)))
    if rounded:
        mask = Image.new("L", (s, s), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=255
        )
        img.paste(grad, (0, 0), mask)
    else:
        img.paste(grad, (0, 0))

    d = ImageDraw.Draw(img)
    cx, cy = s / 2, s / 2

    # 对话气泡（含左下角尾巴）
    bw = s * 0.60 * bubble_scale
    bh = s * 0.44 * bubble_scale
    bx0, by0 = cx - bw / 2, cy - bh / 2 - s * 0.02 * bubble_scale
    bx1, by1 = cx + bw / 2, cy + bh / 2 - s * 0.02 * bubble_scale
    tail = s * 0.085 * bubble_scale
    d.rounded_rectangle([bx0, by0, bx1, by1], radius=int(bh * 0.28), fill=BUBBLE)
    d.polygon(
        [(bx0 + bw * 0.22, by1 - 1), (bx0 + bw * 0.22, by1 + tail), (bx0 + bw * 0.06, by1 - 1)],
        fill=BUBBLE,
    )

    # 气泡内的三条记录行：长 → 短，读起来像"一条条记下来的话"
    inner_pad = bw * 0.17
    lx0, lx1 = bx0 + inner_pad, bx1 - inner_pad
    usable = lx1 - lx0
    lh = max(2, int(bh * 0.115))
    gap = bh * 0.235
    y_top = (by0 + by1) / 2 - gap
    widths = [1.0, 0.78, 0.5]
    for i, w in enumerate(widths):
        yy = y_top + i * gap
        d.rounded_rectangle(
            [lx0, yy, lx0 + usable * w, yy + lh], radius=int(lh / 2), fill=INK + (255,)
        )
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    targets = {
        "icon-192.png": (192, dict(rounded=True, bubble_scale=1.0)),
        "icon-512.png": (512, dict(rounded=True, bubble_scale=1.0)),
        # maskable / iOS 由系统自己裁圆角，必须给满幅方图，内容缩到安全区内
        "icon-maskable-512.png": (512, dict(rounded=False, bubble_scale=0.62)),
        "apple-touch-icon.png": (180, dict(rounded=False, bubble_scale=1.0)),
    }
    for name, (size, kw) in targets.items():
        img = build(size, **kw)
        img.save(os.path.join(OUT, name))
        print("wrote", name, img.size)
    # favicon
    build(64).save(os.path.join(OUT, "favicon-64.png"))
    print("wrote favicon-64.png")


if __name__ == "__main__":
    main()

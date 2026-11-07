#!/usr/bin/env python3
"""生成 PWA 图标（含 iOS apple-touch-icon）。easy talk：棕色小熊头。"""
import os
from PIL import Image, ImageDraw

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "icons")

BG_TOP = (244, 233, 216)     # 奶油米色
BG_BOTTOM = (232, 214, 189)  # 浅驼色
FUR = (139, 96, 66)          # 棕色毛
FUR_DARK = (117, 79, 53)     # 深棕描边
EAR_IN = (196, 154, 122)     # 耳内浅棕
MUZZLE = (240, 222, 199)     # 口鼻浅色
NOSE = (62, 46, 38)          # 鼻子深棕
INK = (62, 46, 38)           # 眼睛


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def build(size, rounded=True, scale=1.0):
    """easy talk 图标：米色渐变底 + 棕色小熊头（圆耳 + 浅口鼻 + 微笑）。"""
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
    cx, cy = s / 2, s / 2 + s * 0.035 * scale
    R = s * 0.31 * scale            # 头半径
    lw = max(2, int(s * 0.016 * scale))

    def circle(x, y, r, fill, outline=None, width=0):
        d.ellipse([x - r, y - r, x + r, y + r], fill=fill,
                  outline=outline, width=width)

    # 耳朵（先画，被头压住下半部分）
    ear_r = R * 0.42
    ear_dx = R * 0.78
    ear_dy = -R * 0.82
    for sx in (-1, 1):
        ex, ey = cx + sx * ear_dx, cy + ear_dy
        circle(ex, ey, ear_r, FUR, FUR_DARK, lw)
        circle(ex, ey, ear_r * 0.52, EAR_IN)

    # 头
    circle(cx, cy, R, FUR, FUR_DARK, lw)

    # 口鼻区
    mz_r = R * 0.52
    mz_cy = cy + R * 0.30
    circle(cx, mz_cy, mz_r, MUZZLE)

    # 鼻子（圆角三角近似：椭圆 + 小竖线到嘴）
    nose_w, nose_h = R * 0.30, R * 0.20
    ny = mz_cy - mz_r * 0.30
    d.ellipse([cx - nose_w / 2, ny - nose_h / 2, cx + nose_w / 2, ny + nose_h / 2],
              fill=NOSE)
    # 鼻下竖线 + 微笑（两段弧）
    ph = mz_r * 0.42
    d.line([(cx, ny + nose_h / 2), (cx, ny + nose_h / 2 + ph * 0.6)],
           fill=NOSE, width=max(2, int(R * 0.055)))
    mw = R * 0.22
    my = ny + nose_h / 2 + ph * 0.6
    d.arc([cx - mw, my - mw * 0.8, cx, my + mw * 0.8], 20, 160,
          fill=NOSE, width=max(2, int(R * 0.05)))
    d.arc([cx, my - mw * 0.8, cx + mw, my + mw * 0.8], 20, 160,
          fill=NOSE, width=max(2, int(R * 0.05)))

    # 眼睛
    eye_r = R * 0.085
    eye_dy = -R * 0.10
    eye_dx = R * 0.44
    for sx in (-1, 1):
        circle(cx + sx * eye_dx, cy + eye_dy, eye_r, INK)

    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    targets = {
        "icon-192.png": (192, dict(rounded=True, scale=1.0)),
        "icon-512.png": (512, dict(rounded=True, scale=1.0)),
        # maskable / iOS 由系统自己裁圆角，必须给满幅方图，内容缩到安全区内
        "icon-maskable-512.png": (512, dict(rounded=False, scale=0.66)),
        "apple-touch-icon.png": (180, dict(rounded=False, scale=0.92)),
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

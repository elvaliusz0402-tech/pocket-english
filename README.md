# 口袋英语 · 地道表达本（PWA）

一个可添加到手机桌面（iOS / Android）的英文口语积累应用。数据 100% 存在本地浏览器（IndexedDB），离线可用核心功能。

## 四个页面

| 页面 | 功能 |
|---|---|
| ✍️ 快速记录 | 输入中文 → 生成 2~3 种地道说法（含语气 / 场景 / 使用提醒），**确认后才收藏** |
| 🖼️ 图片识别 | 拍照 / 上传截图 → OCR → 自动去除时间轴、断行、说话人 → **勾选**想学的句子 → 生成卡片入库 |
| 📚 表达库 | 工作 / 社交 / 旅行 / 日常 / 影视 大类 + 自由标签；每条保存中文意思、英文原句、自然改写、场景、来源、例句 |
| 🎯 搜索与练习 | 中文模糊搜索（不用精确匹配）；先看中文开口说，再揭晓英文；「会了 / 模糊 / 不会」自动安排复习 |

## 两种生成模式

1. **离线模式（默认）**：内置 110+ 组高频地道说法语料库，中文模糊匹配，不联网也能用。
2. **AI 增强（可选）**：设置里填 OpenAI 兼容接口（OpenAI / DeepSeek / Kimi 均可），任意中文都能生成；同时为 OCR 句子自动补中文意思与自然改写。

## 添加到手机桌面

- **iPhone（Safari）**：打开网站 → 分享 → 添加到主屏幕。
- **Android（Chrome）**：打开网站 → 菜单 → 添加到主屏幕 / 安装应用。
- 必须通过 **HTTPS** 访问（本地 localhost 也可以）。

## 让手机访问（三选一）

1. **临时隧道（最快）**：`zsh scripts/share.sh` → 打印一个 `*.trycloudflare.com` 地址，手机直接打开安装。Mac 合盖/脚本退出后失效；**已安装的应用靠离线缓存继续可用**，重新跑一次脚本会得到新地址（换地址后建议重新添加桌面）。
2. **长期托管（推荐）**：把整个目录拖到任意静态托管（GitHub Pages / Netlify / Cloudflare Pages），得到固定 HTTPS 地址，一劳永逸。
3. **同一 Wi-Fi**：手机与 Mac 同网时访问 `http://<Mac局域网IP>:8799`（仅本地调试，iOS 添加桌面受限）。

## 本地运行

```bash
cd english-pwa
python3 -m http.server 8799
# 浏览器打开 http://localhost:8799
```

## 数据

- 全部存在设备浏览器的 IndexedDB，不上传任何服务器。
- 设置 → 导出 / 导入 JSON 可备份迁移。
- API Key 只保存在本机浏览器，请勿在公共设备启用。

## 文件结构

```
index.html            单页应用骨架
manifest.webmanifest  PWA 清单（图标 / 名称 / 快捷方式）
sw.js                 Service Worker（离线缓存）
css/style.css
js/app.js             页面逻辑与路由
js/store.js           IndexedDB 存储层
js/engine.js          生成引擎（语料检索 + LLM）
js/search.js          中文模糊搜索（二元组 + 子串 + 关键词）
js/ocr.js             Tesseract.js OCR 封装
js/practice.js        Leitner 间隔复习调度
data/corpus-*.js      本地语料库（工作 / 社交 / 旅行日常影视）
icons/                PWA 图标
scripts/share.sh      一键起本地服务 + 公网隧道（手机安装用）
tools/make_icons.py   图标生成脚本
```

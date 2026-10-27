# 口袋英语 · 地道表达本（PWA）

一个可添加到手机桌面（iOS / Android）的英文口语积累应用。数据 100% 存在本地浏览器（IndexedDB），不联网也能用。

**线上地址（固定，永久不变）**：https://elvaliusz0402-tech.github.io/pocket-english/

## 五个页面

| 页面 | 功能 |
|---|---|
| 📖 常用100句 | 8 大生活场景共 100 句地道表达，支持中文/英文关键词搜索、分类筛选，点 ★ 一键收进表达库 |
| ✍️ 快速记录 | 输入中文 → 生成 2~3 种地道说法（含语气 / 场景 / 使用提醒），**确认后才收藏** |
| 🖼️ 图片识别 | 拍照 / 上传截图 → OCR → 自动去除时间轴、断行、说话人 → **勾选**想学的句子 → 生成卡片入库 |
| 📚 表达库 | 工作 / 社交 / 旅行 / 日常 / 影视 大类 + 自由标签；每条保存中文意思、英文原句、自然改写、场景、来源、例句 |
| 🎯 搜索与练习 | 中文模糊搜索（不用精确匹配）；先看中文开口说，再揭晓英文；「会了 / 模糊 / 不会」按 Leitner 间隔法安排复习 |

常用 100 句分类：🍽️ 餐厅就餐 13 · 🏠 家庭日常 12 · 💼 公司工作 13 · ✈️ 出差旅行 13 · 🛍️ 购物消费 12 · 🚇 交通出行 12 · 💬 社交闲聊 13 · 🛏️ 酒店住宿 12

## 两种生成模式

1. **离线模式（默认）**：内置 110+ 组高频地道说法语料库，中文模糊匹配，不联网也能用。匹配不够贴切时**宁可不给，也不硬凑**，并明确标注来源。
2. **AI 增强（可选）**：设置里填 OpenAI 兼容接口（OpenAI / DeepSeek / Kimi 均可），任意中文都能生成；同时为 OCR 句子自动补中文意思与自然改写。接口地址只填域名即可（会自动补 `/v1`），调用失败时**页面上直接显示原因**，不再静默回落成错误翻译。

## 添加到手机桌面

- **iPhone（Safari）**：打开线上地址 → 分享 → 添加到主屏幕。
- **Android（Chrome）**：打开线上地址 → 菜单 → 添加到主屏幕 / 安装应用。

## 日常使用要点

- 应用本身会整体缓存到手机，**断网也能打开、也能继续记录与练习**。
- 更新 Go 版本后：正常打开即是新版；偶尔 iOS 会先给一次旧缓存，**完全关掉再重开一次**即可。不需要删除重装，数据不丢。
- 你的积累存在**手机本地数据库**里。建议每隔一阵子在「设置 → 导出 JSON」备份一次（换机、清理浏览器缓存会导致数据丢失）。

## 更新到线上

托管在 GitHub Pages（`elvaliusz0402-tech/pocket-english` 仓库 `main` 分支根目录）。改完文件后：

```bash
zsh scripts/publish.sh
```

脚本会校验是否有发布凭据、提交变更并推送。GitHub Actions 约 1 分钟自动生效，**网址不变，手机无需任何操作**。凭据保存在 `~/.workbuddy/secrets/github_token`（权限 600），Token 可在 GitHub 设置里随时吊销。

## 本地开发

```bash
cd english-pwa
python3 -m http.server 8799
# 浏览器打开 http://localhost:8799
```

需要临时给手机一个公网地址（不含通隧道环境）时，可用 `zsh scripts/share.sh` 生成 `*.trycloudflare.com` 临时链接，用于首次安装。

## 数据

- 全部存在设备浏览器的 IndexedDB，不上传任何服务器。
- 设置 → 导出 / 导入 JSON 可备份迁移。
- API Key 只保存在本机浏览器，请勿在公共设备启用。仓库是公开的，但代码中不含任何密钥。

## 文件结构

```
index.html            单页应用骨架
manifest.webmanifest  PWA 清单（图标 / 名称 / 主题色）
sw.js                 Service Worker（离线缓存，逐资源缓存 + 失败重试）
css/style.css         北欧风视觉（峡湾蓝绿渐变 / 极光背景 / 玻璃卡片）
js/app.js             页面逻辑与路由
js/store.js           IndexedDB 存储层
js/engine.js          生成引擎（语料检索 + LLM）
js/search.js          中文模糊搜索（二元组 + 子串 + 关键词 + 单字）
js/ocr.js             Tesseract.js OCR 封装
js/practice.js        Leitner 间隔复习调度
data/corpus-*.js      本地语料库（工作 / 社交 / 旅行日常影视）
data/phrasebook.js    常用 100 句（8 大场景）
icons/                PWA 图标
scripts/publish.sh    推送到 GitHub Pages（日常更新用）
scripts/share.sh      临时公网隧道（首次安装用）
tools/make_icons.py   图标生成脚本
```
